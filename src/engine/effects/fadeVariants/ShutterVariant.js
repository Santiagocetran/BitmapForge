import { BaseFadeVariant } from './BaseFadeVariant.js'

const NUM_BANDS = 4
const SOFTNESS_ROWS = 2

/**
 * Shutter — venetian-blind effect.
 * The canvas is split into NUM_BANDS horizontal strips. Odd and even strips
 * wipe in opposite directions simultaneously (odd: top→bottom, even: bottom→top),
 * creating a classic shutter / blind open-and-close aesthetic.
 */
class ShutterVariant extends BaseFadeVariant {
  constructor(options = {}) {
    super(options)
    this._bandGridHeight = 1
  }

  initVariantMetadata(particles, canvasWidth, canvasHeight, pixelSize, gridWidth, gridHeight) {
    const bandGridHeight = Math.ceil(gridHeight / NUM_BANDS)
    this._bandGridHeight = bandGridHeight

    for (const p of particles) {
      const row = Math.floor(p.finalY / pixelSize)
      const band = Math.floor(row / bandGridHeight)
      const rowInBand = row - band * bandGridHeight
      // Odd bands wipe top→bottom (localY 0→1), even bands wipe bottom→top (localY 1→0)
      p.shutterLocalY = band % 2 === 0 ? rowInBand / bandGridHeight : 1 - rowInBand / bandGridHeight
    }
  }

  getVisiblePixels(particles, progress, phase, easeInOutCubic) {
    const result = []
    const wipe = easeInOutCubic(progress)

    for (const p of particles) {
      let alpha
      if (phase === 'fadeIn') {
        alpha = Math.min(
          1,
          Math.max(
            0,
            (wipe - p.shutterLocalY + SOFTNESS_ROWS / this._bandGridHeight) / (SOFTNESS_ROWS / this._bandGridHeight)
          )
        )
      } else if (phase === 'fadeOut') {
        alpha = Math.min(
          1,
          Math.max(
            0,
            (p.shutterLocalY - wipe + SOFTNESS_ROWS / this._bandGridHeight) / (SOFTNESS_ROWS / this._bandGridHeight)
          )
        )
      } else {
        continue
      }

      if (alpha <= 0) continue
      result.push({ x: p.finalX, y: p.finalY, brightness: p.brightness, color: p.color, alpha })
    }
    return result
  }
}

export { ShutterVariant }
