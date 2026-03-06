import { BaseRenderer } from './BaseRenderer.js'
import { DITHER_STRATEGIES } from '../effects/ditherStrategies.js'

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

function _getBrightness(r, g, b) {
  return (0.3 * r + 0.59 * g + 0.11 * b) / 255
}

/**
 * BitmapRenderer — dithered pixel grid renderer.
 * Implements the original BitmapEffect drawing logic as a swappable renderer.
 * Supports Bayer ordered dithering, variable-dot halftone, and error-diffusion algorithms.
 */
class BitmapRenderer extends BaseRenderer {
  constructor(options = {}) {
    super({
      pixelSize: 3,
      ditherType: 'bayer4x4',
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

  getThreshold(x, y) {
    const strategy = DITHER_STRATEGIES[this.options.ditherType]
    if (strategy?.type === 'threshold') return strategy.getThreshold(x, y)
    return 0.5
  }

  shouldDraw(brightness, x, y) {
    const strategy = DITHER_STRATEGIES[this.options.ditherType]
    if (!strategy || strategy.type === 'variableDot') return brightness > this.options.minBrightness
    if (strategy.type === 'errorDiffusion') return brightness > 0.5
    return brightness > this.getThreshold(x, y)
  }

  drawPixel(x, y, brightness, color, alpha = 1) {
    if (!this._bitmapCtx) return
    const style = alpha < 1 ? _applyAlpha(color, alpha) : color
    if (style !== this._lastFillStyle) {
      this._bitmapCtx.fillStyle = style
      this._lastFillStyle = style
    }
    const { pixelSize, ditherType } = this.options
    if (ditherType === 'variableDot') {
      const baseRadius = pixelSize * 0.5
      const radius = Math.max(pixelSize * 0.12, baseRadius * (1 - brightness))
      if (radius <= 0.2) return
      this._bitmapCtx.beginPath()
      this._bitmapCtx.arc(x + pixelSize / 2, y + pixelSize / 2, radius, 0, Math.PI * 2)
      this._bitmapCtx.fill()
      return
    }
    this._bitmapCtx.fillRect(x, y, pixelSize, pixelSize)
  }

  render(imageData, gridW, gridH, getColor) {
    const strategy = DITHER_STRATEGIES[this.options.ditherType] ?? DITHER_STRATEGIES.bayer4x4
    if (strategy.type === 'errorDiffusion') {
      this._renderErrorDiffusion(imageData, gridW, gridH, strategy, getColor)
    } else {
      this._renderThreshold(imageData, gridW, gridH, getColor)
    }
  }

  _renderThreshold(imageData, gridW, gridH, getColor) {
    const { pixelSize, minBrightness, invert } = this.options
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const iOffset = (y * gridW + x) * 4
        const r = imageData[iOffset]
        const g = imageData[iOffset + 1]
        const b = imageData[iOffset + 2]
        const a = imageData[iOffset + 3]
        const brightness = _getBrightness(r, g, b)
        if (a === 0 || brightness < minBrightness) continue
        const adjusted = invert ? 1 - brightness : brightness
        if (!this.shouldDraw(adjusted, x, y)) continue
        const color = getColor(adjusted)
        this.drawPixel(x * pixelSize, y * pixelSize, adjusted, color, 1)
      }
    }
  }

  _renderErrorDiffusion(imageData, gridW, gridH, strategy, getColor) {
    const { pixelSize, minBrightness, invert } = this.options
    const size = gridW * gridH
    const brightnessGrid = new Float32Array(size)
    const alphaGrid = new Uint8Array(size)

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const iOffset = (y * gridW + x) * 4
        const r = imageData[iOffset]
        const g = imageData[iOffset + 1]
        const b = imageData[iOffset + 2]
        const a = imageData[iOffset + 3]
        if (a === 0) continue
        const brightness = _getBrightness(r, g, b)
        if (brightness < minBrightness) continue
        const adjusted = invert ? 1 - brightness : brightness
        const idx = y * gridW + x
        brightnessGrid[idx] = adjusted
        alphaGrid[idx] = 1
      }
    }

    const drawMask = strategy.processGrid(brightnessGrid, gridW, gridH)

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const idx = y * gridW + x
        if (!drawMask[idx] || !alphaGrid[idx]) continue
        const adjusted = brightnessGrid[idx]
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

export { BitmapRenderer }
