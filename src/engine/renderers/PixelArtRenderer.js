import { BaseRenderer } from './BaseRenderer.js'

function _applyAlpha(color, alpha) {
  if (alpha >= 1) return color
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `,${alpha})`)
  }
  return color
}

/**
 * PixelArtRenderer — clean pixel grid with nearest-palette-color mapping, no dithering.
 * Validates the BaseRenderer interface and serves as a template for Phase 3 rendering modes.
 */
class PixelArtRenderer extends BaseRenderer {
  constructor(options = {}) {
    super({
      pixelSize: 3,
      minBrightness: 0.05,
      invert: false,
      backgroundColor: 'transparent',
      ...options
    })
    this._bitmapCanvas = document.createElement('canvas')
    this._bitmapCanvas.style.display = 'block'
    this._bitmapCtx = this._bitmapCanvas.getContext('2d')
    this._lastFillStyle = null
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
    this._lastFillStyle = null
    if (backgroundColor !== 'transparent') {
      this._bitmapCtx.fillStyle = backgroundColor
      this._bitmapCtx.fillRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)
    } else {
      this._bitmapCtx.clearRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)
    }
  }

  endFrame() {}

  shouldDraw(brightness) {
    return brightness > this.options.minBrightness
  }

  drawPixel(x, y, brightness, color, alpha = 1) {
    if (!this._bitmapCtx) return
    const style = alpha < 1 ? _applyAlpha(color, alpha) : color
    if (style !== this._lastFillStyle) {
      this._bitmapCtx.fillStyle = style
      this._lastFillStyle = style
    }
    this._bitmapCtx.fillRect(x, y, this.options.pixelSize, this.options.pixelSize)
  }

  render(imageData, gridW, gridH, getColor) {
    const { pixelSize, minBrightness, invert } = this.options
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const iOffset = (y * gridW + x) * 4
        const r = imageData[iOffset]
        const g = imageData[iOffset + 1]
        const b = imageData[iOffset + 2]
        const a = imageData[iOffset + 3]
        if (a === 0) continue
        const brightness = (0.3 * r + 0.59 * g + 0.11 * b) / 255
        if (brightness < minBrightness) continue
        const adjusted = invert ? 1 - brightness : brightness
        if (!this.shouldDraw(adjusted)) continue
        const color = getColor(adjusted)
        this.drawPixel(x * pixelSize, y * pixelSize, adjusted, color, 1)
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

export { PixelArtRenderer }
