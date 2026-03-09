import { BaseRenderer } from './BaseRenderer.js'

/**
 * LedMatrixRenderer — LED sign board renderer.
 *
 * Each grid cell is rendered as a rounded or circular LED element sitting on
 * a dark panel background. Brightness maps to color (bright pixel → lit LED,
 * dark pixel → unlit / skipped). An optional glow effect adds a radial
 * gradient halo around each lit LED.
 *
 * Options:
 *   pixelSize       — cell spacing in px (shared with all renderers)
 *   ledGap          — gap between LED elements in px (0–4, default 1)
 *   ledGlowRadius   — glow halo radius in px (0–8, default 2)
 *   ledShape        — 'circle' | 'roundRect' (default 'circle')
 *   minBrightness   — brightness threshold below which the LED is off
 *   invert          — invert brightness mapping
 *   backgroundColor — canvas fill; defaults to '#111111' (dark LED panel)
 */
class LedMatrixRenderer extends BaseRenderer {
  constructor(options = {}) {
    super({
      pixelSize: 8,
      ledGap: 1,
      ledGlowRadius: 2,
      ledShape: 'circle',
      minBrightness: 0.05,
      invert: false,
      backgroundColor: '#111111',
      ...options
    })
    this._bitmapCanvas = document.createElement('canvas')
    this._bitmapCanvas.style.display = 'block'
    this._bitmapCtx = this._bitmapCanvas.getContext('2d')

    // Feature-detect ctx.roundRect (Chrome 99+, Firefox 112+, Safari 15.4+)
    this._hasRoundRect = typeof this._bitmapCtx?.roundRect === 'function'
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
    // LED panel always has an opaque dark background; fall back to '#111111'
    // when the caller passes 'transparent' (LED mode ignores transparency).
    const bg = !backgroundColor || backgroundColor === 'transparent' ? '#111111' : backgroundColor
    this._bitmapCtx.fillStyle = bg
    this._bitmapCtx.fillRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)
  }

  endFrame() {}

  shouldDraw(brightness) {
    return brightness > (this.options.minBrightness ?? 0.05)
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Draw a single LED element at (cx, cy) with the given half-size.
   * Uses roundRect when available, otherwise falls back to arcs.
   */
  _drawLed(ctx, cx, cy, halfSize) {
    const x = cx - halfSize
    const y = cy - halfSize
    const size = halfSize * 2

    if (this.options.ledShape === 'roundRect') {
      const radius = halfSize * 0.35
      if (this._hasRoundRect) {
        ctx.beginPath()
        ctx.roundRect(x, y, size, size, radius)
        ctx.fill()
      } else {
        // Manual rounded-rect via arcs (fallback for older browsers)
        const r = Math.min(radius, halfSize)
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + size - r, y)
        ctx.arcTo(x + size, y, x + size, y + r, r)
        ctx.lineTo(x + size, y + size - r)
        ctx.arcTo(x + size, y + size, x + size - r, y + size, r)
        ctx.lineTo(x + r, y + size)
        ctx.arcTo(x, y + size, x, y + size - r, r)
        ctx.lineTo(x, y + r)
        ctx.arcTo(x, y, x + r, y, r)
        ctx.closePath()
        ctx.fill()
      }
    } else {
      // Default: circle
      ctx.beginPath()
      ctx.arc(cx, cy, halfSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ---------------------------------------------------------------------------
  // Public render / drawPixel
  // ---------------------------------------------------------------------------

  render(imageData, gridW, gridH, getColor) {
    const ctx = this._bitmapCtx
    if (!ctx) return

    const { pixelSize, ledGap, ledGlowRadius, minBrightness, invert } = this.options
    // Clamp ledSize ≥ 1 so LEDs are always visible even when gap equals spacing
    const ledSize = Math.max(1, pixelSize - ledGap)
    const halfLed = ledSize / 2

    // Glow via shadowBlur — set once, updated only on color change (GPU-accelerated).
    // This avoids creating a radial gradient object per cell per frame.
    if (ledGlowRadius > 0) {
      ctx.shadowBlur = ledGlowRadius * 2.5
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

        // Weight luminance by source alpha so semi-transparent pixels dim naturally
        const rawLum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
        const brightness = rawLum * (a / 255)
        if (brightness < minBrightness) continue

        const adjusted = invert ? 1 - brightness : brightness

        const cx = gx * pixelSize + pixelSize / 2
        const cy = gy * pixelSize + pixelSize / 2

        const color = getColor(adjusted)

        if (color !== lastColor) {
          ctx.fillStyle = color
          if (ledGlowRadius > 0) ctx.shadowColor = color
          lastColor = color
        }

        this._drawLed(ctx, cx, cy, halfLed)
      }
    }

    // Reset shadow state so it doesn't bleed into other canvas operations
    if (ledGlowRadius > 0) {
      ctx.shadowBlur = 0
      ctx.shadowColor = 'transparent'
    }
  }

  /**
   * Draw a single LED during fade animations.
   * x/y arrive as (gx * pixelSize, gy * pixelSize) from BitmapEffect.initializeParticles.
   * We snap to the nearest grid-cell center (intentional LED grid aesthetic).
   * Glow is intentionally skipped here for performance — particles are short-lived.
   */
  drawPixel(x, y, brightness, color, alpha = 1) {
    const ctx = this._bitmapCtx
    if (!ctx) return

    const { pixelSize, ledGap } = this.options
    const ledSize = Math.max(1, pixelSize - ledGap)
    const halfLed = ledSize / 2

    // Snap to nearest cell center (same grid as render())
    const gx = Math.round(x / pixelSize)
    const gy = Math.round(y / pixelSize)
    const cx = gx * pixelSize + pixelSize / 2
    const cy = gy * pixelSize + pixelSize / 2

    const savedAlpha = ctx.globalAlpha
    const savedFill = ctx.fillStyle
    if (alpha < 1) ctx.globalAlpha = alpha
    ctx.fillStyle = color
    this._drawLed(ctx, cx, cy, halfLed)
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

export { LedMatrixRenderer }
