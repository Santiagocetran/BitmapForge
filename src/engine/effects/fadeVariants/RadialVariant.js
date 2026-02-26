import { BaseFadeVariant } from './BaseFadeVariant.js'

// Pixels within this many canvas-px of the expanding/contracting circle edge
// are feathered for a smooth border.
const EDGE_SOFTNESS_PX = 20

/**
 * Radial — a circular mask that expands from the canvas center on fadeIn
 * and contracts back to the center on fadeOut.
 */
class RadialVariant extends BaseFadeVariant {
  constructor(options = {}) {
    super(options)
    this._maxDist = 1
  }

  initVariantMetadata(particles, canvasWidth, canvasHeight) {
    this._maxDist = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) / 2
  }

  getVisiblePixels(particles, progress, phase, easeInOutCubic) {
    const result = []
    const radius = easeInOutCubic(progress) * this._maxDist

    for (const p of particles) {
      let alpha
      if (phase === 'fadeIn') {
        // Visible inside the expanding circle.
        alpha = Math.min(1, Math.max(0, (radius - p.distFromCenter + EDGE_SOFTNESS_PX) / EDGE_SOFTNESS_PX))
      } else if (phase === 'fadeOut') {
        // Visible outside the contracting circle.
        alpha = Math.min(
          1,
          Math.max(0, (p.distFromCenter - (this._maxDist - radius) + EDGE_SOFTNESS_PX) / EDGE_SOFTNESS_PX)
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

export { RadialVariant }
