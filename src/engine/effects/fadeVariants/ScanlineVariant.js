import { BaseFadeVariant } from './BaseFadeVariant.js'

// Rows of soft feathering at the leading edge of the wipe.
const SOFTNESS_ROWS = 2

/**
 * Scanline — a top-to-bottom horizontal wipe.
 * On fadeIn, rows of pixels reveal from top to bottom.
 * On fadeOut, rows vanish top to bottom.
 */
class ScanlineVariant extends BaseFadeVariant {
  constructor(options = {}) {
    super(options)
    this._gridHeight = 1
  }

  initVariantMetadata(particles, canvasWidth, canvasHeight, pixelSize, gridWidth, gridHeight) {
    this._gridHeight = gridHeight
    for (const p of particles) {
      p.scanRow = Math.floor(p.finalY / pixelSize)
    }
  }

  getVisiblePixels(particles, progress, phase, easeInOutCubic) {
    const result = []
    const wipeRow = easeInOutCubic(progress) * this._gridHeight

    for (const p of particles) {
      let alpha
      if (phase === 'fadeIn') {
        // Pixel becomes visible as the wipe front passes its row.
        alpha = Math.min(1, Math.max(0, (wipeRow - p.scanRow) / SOFTNESS_ROWS))
      } else if (phase === 'fadeOut') {
        // Pixel vanishes as the wipe front passes its row.
        alpha = Math.min(1, Math.max(0, (p.scanRow - wipeRow + SOFTNESS_ROWS) / SOFTNESS_ROWS))
      } else {
        continue
      }

      if (alpha <= 0) continue
      result.push({ x: p.finalX, y: p.finalY, brightness: p.brightness, color: p.color, alpha })
    }
    return result
  }
}

export { ScanlineVariant }
