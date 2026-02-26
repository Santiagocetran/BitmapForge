import { BaseEffect } from './BaseEffect.js'
import { createFadeVariant } from './fadeVariants/index.js'

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
].map((row) => row.map((v) => v / 16))

const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
].map((row) => row.map((v) => v / 64))

class BitmapEffect extends BaseEffect {
  constructor(renderer, options = {}) {
    super(renderer, {
      pixelSize: 3,
      ditherType: 'bayer4x4',
      colors: [
        '#021a15',
        '#053a2a',
        '#074434',
        '#0a5845',
        '#1a7a5e',
        '#4d9977',
        '#ABC685',
        '#E8FF99',
        '#F7F9CE',
        '#FFF6E7'
      ],
      backgroundColor: 'transparent',
      invert: false,
      minBrightness: 0.05,
      animationDuration: 2500,
      ...options
    })

    this.bitmapCanvas = document.createElement('canvas')
    this.bitmapCanvas.style.display = 'block'
    this.domElement.appendChild(this.bitmapCanvas)
    this.bitmapCtx = this.bitmapCanvas.getContext('2d')

    this.sampleCanvas = document.createElement('canvas')
    this.sampleCtx = this.sampleCanvas.getContext('2d', { willReadFrequently: true })
    this.gridWidth = 1
    this.gridHeight = 1

    // Active fade variant — recreated whenever options.fadeVariant changes.
    const initialVariant = this.options.fadeVariant ?? 'dissolve'
    this.fadeVariant = createFadeVariant(initialVariant)
    this._currentFadeVariantKey = initialVariant
  }

  setSize(width, height) {
    super.setSize(width, height)
    this.gridWidth = Math.max(1, Math.floor(this.width / this.options.pixelSize))
    this.gridHeight = Math.max(1, Math.floor(this.height / this.options.pixelSize))
    this.sampleCanvas.width = this.gridWidth
    this.sampleCanvas.height = this.gridHeight
    this.bitmapCanvas.width = this.width
    this.bitmapCanvas.height = this.height
  }

  onStructuralOptionChange() {
    // Recalculate grid dimensions and resize canvases. This calls super.setSize()
    // which resets particles — any in-flight fade animation will restart.
    this.setSize(this.width, this.height)
  }

  render(scene, camera) {
    this.renderer.render(scene, camera)
    this.tickAnimation()
    this.renderBitmap()
  }

  getThreshold(x, y) {
    if (this.options.ditherType === 'bayer8x8') return BAYER_8X8[y % 8][x % 8]
    if (this.options.ditherType === 'bayer4x4') return BAYER_4X4[y % 4][x % 4]
    return 0.5
  }

  shouldDraw(adjustedBrightness, x, y) {
    if (this.options.ditherType === 'variableDot') return adjustedBrightness > this.options.minBrightness
    return adjustedBrightness > this.getThreshold(x, y)
  }

  drawPixel(x, y, adjustedBrightness, color, alpha = 1) {
    const style = alpha < 1 ? this.applyAlpha(color, alpha) : color
    if (style !== this._lastFillStyle) {
      this.bitmapCtx.fillStyle = style
      this._lastFillStyle = style
    }
    if (this.options.ditherType === 'variableDot') {
      const baseRadius = this.options.pixelSize * 0.5
      const radius = Math.max(this.options.pixelSize * 0.12, baseRadius * (1 - adjustedBrightness))
      if (radius <= 0.2) return
      this.bitmapCtx.beginPath()
      this.bitmapCtx.arc(x + this.options.pixelSize / 2, y + this.options.pixelSize / 2, radius, 0, Math.PI * 2)
      this.bitmapCtx.fill()
      return
    }

    this.bitmapCtx.fillRect(x, y, this.options.pixelSize, this.options.pixelSize)
  }

  dispose() {
    if (this.bitmapCanvas?.parentNode) {
      this.bitmapCanvas.parentNode.removeChild(this.bitmapCanvas)
    }
    this.bitmapCanvas = null
    this.bitmapCtx = null
    this.sampleCanvas = null
    this.sampleCtx = null
    super.dispose()
  }

  renderBitmap() {
    if (!this.sampleCtx || !this.bitmapCtx) return

    // Swap variant instance when the store option changes and restart the fade
    // so the new style plays immediately from the beginning.
    const wantedVariant = this.options.fadeVariant ?? 'dissolve'
    if (wantedVariant !== this._currentFadeVariantKey) {
      this._currentFadeVariantKey = wantedVariant
      this.fadeVariant = createFadeVariant(wantedVariant)
      this.startAnimation('fadeIn')
    }

    this._lastFillStyle = null
    this.sampleCtx.clearRect(0, 0, this.gridWidth, this.gridHeight)
    this.sampleCtx.drawImage(this.renderer.domElement, 0, 0, this.gridWidth, this.gridHeight)
    const imageData = this.sampleCtx.getImageData(0, 0, this.gridWidth, this.gridHeight).data

    if (this.options.backgroundColor !== 'transparent') {
      this.bitmapCtx.fillStyle = this.options.backgroundColor
      this.bitmapCtx.fillRect(0, 0, this.width, this.height)
    } else {
      this.bitmapCtx.clearRect(0, 0, this.width, this.height)
    }

    if (this.isAnimating) {
      if (!this.particlesInitialized) {
        this.initializeParticles(
          this.gridWidth,
          this.gridHeight,
          this.options.pixelSize,
          imageData,
          (brightness, x, y) => this.shouldDraw(brightness, x, y)
        )
        // Let the variant attach any per-particle metadata it needs.
        this.fadeVariant.initVariantMetadata(
          this.particles,
          this.width,
          this.height,
          this.options.pixelSize,
          this.gridWidth,
          this.gridHeight
        )
      }

      // Variant returns draw descriptors; BitmapEffect owns the canvas and draws them.
      const visiblePixels = this.fadeVariant.getVisiblePixels(
        this.particles,
        this.animationProgress,
        this.animationPhase,
        (t) => this.easeInOutCubic(t)
      )
      for (const px of visiblePixels) {
        this.drawPixel(px.x, px.y, px.brightness, px.color, px.alpha)
      }
    }

    if (!this.isAnimating || this.particles.length === 0) {
      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          const iOffset = (y * this.gridWidth + x) * 4
          const r = imageData[iOffset]
          const g = imageData[iOffset + 1]
          const b = imageData[iOffset + 2]
          const a = imageData[iOffset + 3]
          const brightness = this.getBrightness(r, g, b)

          if (a === 0 || brightness < this.options.minBrightness) continue
          const adjustedBrightness = this.options.invert ? 1 - brightness : brightness
          if (!this.shouldDraw(adjustedBrightness, x, y)) continue

          const color = this.getColorForBrightness(adjustedBrightness)
          this.drawPixel(x * this.options.pixelSize, y * this.options.pixelSize, adjustedBrightness, color, 1)
        }
      }
    }
  }
}

export { BitmapEffect }
