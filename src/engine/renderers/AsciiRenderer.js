import { BaseRenderer } from './BaseRenderer.js'

/**
 * Named character ramp presets — ordered darkest-to-brightest (lowest to highest ink density).
 * The first character (typically space) maps to near-black areas and is skipped (background shows).
 */
const CHAR_RAMPS = {
  classic: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  dense: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  minimal: ' .+#'
}

const CHAR_RAMP_LABELS = {
  classic: 'Classic ( .:-=+*#%@ )',
  blocks: 'Blocks (░▒▓█)',
  dense: 'Dense (70 chars)',
  minimal: 'Minimal ( .+# )'
}

const MONOSPACE_FONT = 'Menlo, Monaco, Consolas, monospace'

/**
 * AsciiRenderer — maps brightness to characters drawn on a background fill.
 *
 * Monochrome mode (asciiColored: false): all characters use getColor(1) — the brightest
 * palette color — giving classic terminal ASCII art (e.g., green-on-black).
 * Colored mode (asciiColored: true): each character's color maps from its brightness
 * through the full palette, producing full-color ASCII art.
 */
class AsciiRenderer extends BaseRenderer {
  constructor(options = {}) {
    super({
      pixelSize: 3,
      minBrightness: 0.05,
      invert: false,
      backgroundColor: '#0a0a0a',
      charRamp: 'classic',
      asciiColored: false,
      ...options
    })
    this._bitmapCanvas = document.createElement('canvas')
    this._bitmapCanvas.style.display = 'block'
    this._bitmapCtx = this._bitmapCanvas.getContext('2d')

    // Derived state — recomputed when dirty
    this._dirty = true
    this._rampChars = []
    this._rampLen = 0
    this._fontStr = ''
    this._cellW = 0
    this._cellH = 0
    this._xOffset = 0 // horizontal centering offset within cell
    this._lastFill = null
    this._lastGridW = 0
    this._lastGridH = 0
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
      this._dirty = true
    }
  }

  updateOptions(options) {
    // Capture old values BEFORE super mutates this.options via Object.assign
    const prevCharRamp = this.options.charRamp
    const prevPixelSize = this.options.pixelSize
    super.updateOptions(options)
    if (
      (options.charRamp !== undefined && options.charRamp !== prevCharRamp) ||
      (options.pixelSize !== undefined && options.pixelSize !== prevPixelSize)
    ) {
      this._dirty = true
    }
  }

  beginFrame(backgroundColor) {
    if (!this._bitmapCtx) return
    if (backgroundColor === 'transparent') {
      this._bitmapCtx.clearRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)
    } else {
      this._bitmapCtx.fillStyle = backgroundColor
      this._bitmapCtx.fillRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)
    }
    this._lastFill = null
  }

  endFrame() {}

  shouldDraw(brightness) {
    return brightness > this.options.minBrightness
  }

  /**
   * Recompute derived state: ramp chars, font string, cell dimensions, glyph centering offset.
   * Called lazily before the first draw each frame.
   */
  _prepare(gridW, gridH) {
    const rampStr = CHAR_RAMPS[this.options.charRamp] ?? CHAR_RAMPS.classic
    this._rampChars = Array.from(rampStr)
    this._rampLen = this._rampChars.length

    this._cellW = this._bitmapCanvas.width / gridW
    this._cellH = this._bitmapCanvas.height / gridH
    const fontSize = Math.max(6, Math.floor(this._cellH))
    this._fontStr = `${fontSize}px ${MONOSPACE_FONT}`

    const ctx = this._bitmapCtx
    ctx.font = this._fontStr
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'

    // Measure a representative glyph to center it horizontally within the cell
    const metrics = ctx.measureText('M')
    this._xOffset = Math.max(0, (this._cellW - metrics.width) * 0.5)

    this._lastGridW = gridW
    this._lastGridH = gridH
    this._dirty = false
    this._lastFill = null
  }

  _glyphFor(brightness) {
    const adjusted = this.options.invert ? 1 - brightness : brightness
    const idx = Math.min(Math.round(adjusted * (this._rampLen - 1)), this._rampLen - 1)
    const ch = this._rampChars[idx]
    return ch === ' ' ? null : ch
  }

  /**
   * Draw a single character during fade animations.
   * x/y are pre-multiplied canvas coordinates (gx * pixelSize, gy * pixelSize).
   * Snap back to cell grid to prevent jitter when pixelSize != cellSize.
   */
  drawPixel(x, y, brightness, color, alpha = 1) {
    if (!this._bitmapCtx) return

    // _prepare() is normally called by render(), but render() is skipped during fade
    // animations (isAnimating = true). Lazily prepare here so particles are visible.
    if ((this._dirty || this._cellW === 0) && this._bitmapCanvas.width > 0) {
      const { pixelSize } = this.options
      const gridW = Math.max(1, Math.floor(this._bitmapCanvas.width / pixelSize))
      const gridH = Math.max(1, Math.floor(this._bitmapCanvas.height / pixelSize))
      this._prepare(gridW, gridH)
    }

    if (this._cellW === 0 || this._cellH === 0) return
    const ch = this._glyphFor(brightness)
    if (!ch) return

    const ctx = this._bitmapCtx

    // Recover original grid coordinates from the particle's screen position.
    // initializeParticles sets finalX = gx * pixelSize (exact integer multiple),
    // so round(x / pixelSize) = gx exactly — no floating-point drift.
    // Drawing at gx * cellW + xOffset matches render() precisely, preventing
    // the left/down positional shift at the fade→static transition.
    const { pixelSize, asciiColored, colors } = this.options
    const gx = Math.round(x / pixelSize)
    const gy = Math.round(y / pixelSize)

    if (this._fontStr) {
      ctx.font = this._fontStr
      ctx.textBaseline = 'top'
      ctx.textAlign = 'left'
    }

    const fill = asciiColored ? color : (colors?.[colors.length - 1] ?? color)
    if (alpha < 1) ctx.globalAlpha = alpha
    ctx.fillStyle = fill
    ctx.fillText(ch, gx * this._cellW + this._xOffset, gy * this._cellH)
    if (alpha < 1) ctx.globalAlpha = 1
  }

  render(imageData, gridW, gridH, getColor) {
    if (!this._bitmapCtx || gridW === 0 || gridH === 0) return

    if (this._dirty || gridW !== this._lastGridW || gridH !== this._lastGridH) {
      this._prepare(gridW, gridH)
    }

    const { minBrightness, invert, asciiColored } = this.options
    const ctx = this._bitmapCtx

    // Ensure font is set (beginFrame may have changed context state)
    ctx.font = this._fontStr
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'

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
        const idx = Math.min(Math.round(adjusted * (this._rampLen - 1)), this._rampLen - 1)
        const ch = this._rampChars[idx]
        if (ch === ' ') continue

        const fill = asciiColored ? getColor(adjusted) : getColor(1)
        if (fill !== this._lastFill) {
          ctx.fillStyle = fill
          this._lastFill = fill
        }
        ctx.fillText(ch, gx * this._cellW + this._xOffset, gy * this._cellH)
      }
    }
  }

  dispose() {
    if (this._bitmapCanvas?.parentNode) {
      this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas)
    }
    this._bitmapCanvas = null
    this._bitmapCtx = null
  }
}

export { AsciiRenderer, CHAR_RAMPS, CHAR_RAMP_LABELS }
