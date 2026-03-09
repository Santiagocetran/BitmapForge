import { BaseRenderer } from './BaseRenderer.js'

const DEG2RAD = Math.PI / 180

/**
 * HalftoneRenderer — halftone dot grid renderer.
 *
 * Simulates the classic halftone printing/screen technique: each grid cell is
 * filled with a dot whose radius scales with darkness (dark pixel → large dot,
 * bright pixel → small/no dot). The color of each dot comes from the active
 * palette via getColor(brightness).
 *
 * Dot shape: circle (standard) or diamond (rotated square, different texture).
 *
 * Angle rotation: the entire dot grid is rotated once per frame by applying a
 * canvas-level transform (translate-rotate-restore). drawPixel() applies the
 * same rotation math to particle coordinates so fade animations stay aligned.
 */
class HalftoneRenderer extends BaseRenderer {
  constructor(options = {}) {
    super({
      pixelSize: 6,
      minBrightness: 0.05,
      invert: false,
      backgroundColor: 'transparent',
      halftoneDotShape: 'circle', // 'circle' | 'diamond'
      halftoneAngle: 0, // degrees, normalized to [0, 180) on use
      ...options
    })
    this._bitmapCanvas = document.createElement('canvas')
    this._bitmapCanvas.style.display = 'block'
    this._bitmapCtx = this._bitmapCanvas.getContext('2d')
  }

  get canvas() {
    return this._bitmapCanvas
  }

  init(width, height) {
    this.setSize(width, height)
  }

  setSize(width, height) {
    if (this._bitmapCanvas) {
      this._bitmapCanvas.width = Math.max(1, Math.floor(width))
      this._bitmapCanvas.height = Math.max(1, Math.floor(height))
    }
  }

  beginFrame(backgroundColor) {
    if (!this._bitmapCtx) return
    if (backgroundColor !== 'transparent') {
      this._bitmapCtx.fillStyle = backgroundColor
      this._bitmapCtx.fillRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)
    } else {
      this._bitmapCtx.clearRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)
    }
  }

  endFrame() {}

  shouldDraw(brightness) {
    return brightness > (this.options.minBrightness ?? 0.05)
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /** Draw a circle or diamond centered at (cx, cy) with given radius. */
  _drawDot(ctx, cx, cy, radius) {
    if (radius < 0.5) return
    if (this.options.halftoneDotShape === 'diamond') {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(Math.PI / 4)
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2)
      ctx.restore()
    } else {
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  /** Normalize angle to [0, 180) degrees and convert to radians. */
  _normalizeRad(deg) {
    return (((deg % 180) + 180) % 180) * DEG2RAD
  }

  // ---------------------------------------------------------------------------
  // Public render / drawPixel
  // ---------------------------------------------------------------------------

  render(imageData, gridW, gridH, getColor) {
    const ctx = this._bitmapCtx
    if (!ctx) return

    const { pixelSize, minBrightness, invert, halftoneAngle } = this.options
    const spacing = pixelSize
    const maxRadius = spacing * 0.5 * 0.95
    const rMin = 0.5
    const angleRad = this._normalizeRad(halftoneAngle)

    const rotated = angleRad !== 0
    if (rotated) {
      ctx.save()
      ctx.translate(this._bitmapCanvas.width / 2, this._bitmapCanvas.height / 2)
      ctx.rotate(angleRad)
      ctx.translate(-this._bitmapCanvas.width / 2, -this._bitmapCanvas.height / 2)
    }

    let lastColor = null

    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const iOffset = (gy * gridW + gx) * 4
        const r = imageData[iOffset]
        const g = imageData[iOffset + 1]
        const b = imageData[iOffset + 2]
        const a = imageData[iOffset + 3]
        if (a === 0) continue

        const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
        if (brightness < minBrightness) continue

        const adjusted = invert ? 1 - brightness : brightness
        const rawRadius = (1 - adjusted) * maxRadius
        if (rawRadius < rMin) continue // skip very bright (near-white) pixels
        const radius = Math.min(maxRadius, rawRadius)

        const cx = gx * spacing + spacing / 2
        const cy = gy * spacing + spacing / 2

        const color = getColor(adjusted)
        if (color !== lastColor) {
          ctx.fillStyle = color
          lastColor = color
        }

        this._drawDot(ctx, cx, cy, radius)
      }
    }

    if (rotated) ctx.restore()
  }

  /**
   * Draw a single dot during fade animations.
   * x/y arrive as (gx * pixelSize, gy * pixelSize) from BitmapEffect.initializeParticles.
   * We recover the grid cell, compute the rotated dot center to match render(), and draw.
   */
  drawPixel(x, y, brightness, color, alpha = 1) {
    const ctx = this._bitmapCtx
    if (!ctx) return

    const { pixelSize, halftoneAngle } = this.options
    const spacing = pixelSize
    const maxRadius = spacing * 0.5 * 0.95
    const rMin = 0.5
    const rawRadius = (1 - brightness) * maxRadius
    if (rawRadius < rMin) return
    const radius = Math.min(maxRadius, rawRadius)

    // Recover unrotated grid-cell center
    const gx = Math.round(x / pixelSize)
    const gy = Math.round(y / pixelSize)
    let cx = gx * spacing + spacing / 2
    let cy = gy * spacing + spacing / 2

    // Apply the same canvas rotation as render() so particles land on the rotated grid
    if (halftoneAngle !== 0) {
      const rad = this._normalizeRad(halftoneAngle)
      const cosA = Math.cos(rad)
      const sinA = Math.sin(rad)
      const cw = this._bitmapCanvas.width
      const ch = this._bitmapCanvas.height
      const dx = cx - cw / 2
      const dy = cy - ch / 2
      cx = cw / 2 + dx * cosA - dy * sinA
      cy = ch / 2 + dx * sinA + dy * cosA
    }

    const savedAlpha = ctx.globalAlpha
    const savedFill = ctx.fillStyle
    if (alpha < 1) ctx.globalAlpha = alpha
    ctx.fillStyle = color
    this._drawDot(ctx, cx, cy, radius)
    ctx.globalAlpha = savedAlpha
    ctx.fillStyle = savedFill
  }

  dispose() {
    if (this._bitmapCanvas?.parentNode) {
      this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas)
    }
    this._bitmapCanvas = null
    this._bitmapCtx = null
  }
}

export { HalftoneRenderer }
