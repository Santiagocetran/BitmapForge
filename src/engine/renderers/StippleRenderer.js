import { BaseRenderer } from './BaseRenderer.js'
import { createRNG } from '../utils/seededRandom.js'

/**
 * StippleRenderer — pointillist-style renderer that places random dots inside
 * each grid cell proportional to darkness. Uses a seeded RNG for deterministic
 * output across frames and exports.
 *
 * Monochrome mode: all dots use getColor(brightness).
 * Dark areas receive more dots; bright areas receive few or none.
 */
class StippleRenderer extends BaseRenderer {
  constructor(options = {}) {
    super({
      pixelSize: 6,
      minBrightness: 0.05,
      invert: false,
      backgroundColor: '#f5f0e8', // warm paper/canvas default
      stippleDotSize: 2,
      stippleDensity: 3,
      seed: null,
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
    if (backgroundColor === 'transparent') {
      this._bitmapCtx.clearRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)
    } else {
      this._bitmapCtx.fillStyle = backgroundColor
      this._bitmapCtx.fillRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)
    }
  }

  endFrame() {}

  shouldDraw(brightness) {
    return brightness > this.options.minBrightness
  }

  render(imageData, gridW, gridH, getColor) {
    if (!this._bitmapCtx || gridW === 0 || gridH === 0) return
    const { pixelSize, minBrightness, invert, stippleDotSize, stippleDensity, seed } = this.options
    const rng = createRNG(seed ?? 0x12345678)
    const ctx = this._bitmapCtx

    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const iOffset = (gy * gridW + gx) * 4
        const r = imageData[iOffset]
        const g = imageData[iOffset + 1]
        const b = imageData[iOffset + 2]
        const a = imageData[iOffset + 3]
        if (a === 0) continue

        const rawBrightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
        if (rawBrightness < minBrightness) continue

        const brightness = invert ? 1 - rawBrightness : rawBrightness
        // Darker areas get more dots — inverse relationship between brightness and density
        const localDensity = (1 - brightness) * stippleDensity
        const numDots = Math.max(0, Math.round(localDensity))
        if (numDots === 0) continue

        const color = getColor(brightness)
        ctx.fillStyle = color

        const cellX = gx * pixelSize
        const cellY = gy * pixelSize

        for (let i = 0; i < numDots; i++) {
          const dotX = cellX + rng() * pixelSize
          const dotY = cellY + rng() * pixelSize
          // Slight size variation for an organic, hand-drawn feel
          const dotR = stippleDotSize * (0.6 + rng() * 0.4)
          ctx.beginPath()
          ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  /**
   * Draw a single dot during fade animations.
   * x/y are canvas coordinates (gx * pixelSize, gy * pixelSize).
   * Uses a position-derived seed so the dot stays stable across frames.
   */
  drawPixel(x, y, brightness, color, alpha = 1) {
    if (!this._bitmapCtx) return
    const { stippleDotSize, seed, pixelSize } = this.options
    // Derive a stable per-position seed from coordinates
    const posSeed = ((seed ?? 0x12345678) ^ (((x * 73856093) >>> 0) ^ ((y * 19349663) >>> 0))) >>> 0
    const rng = createRNG(posSeed)
    const ctx = this._bitmapCtx
    const dotR = stippleDotSize * (0.6 + rng() * 0.4)
    // Center dot within the cell
    const dotX = x + pixelSize * 0.5
    const dotY = y + pixelSize * 0.5
    if (alpha < 1) ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2)
    ctx.fill()
    if (alpha < 1) ctx.globalAlpha = 1
  }

  dispose() {
    if (this._bitmapCanvas?.parentNode) {
      this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas)
    }
    this._bitmapCanvas = null
    this._bitmapCtx = null
  }
}

export { StippleRenderer }
