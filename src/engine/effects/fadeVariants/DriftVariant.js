import { BaseFadeVariant } from './BaseFadeVariant.js'

/**
 * Drift — pixels fly from their scatter positions (off-canvas) to their final positions,
 * creating a "reverse explosion" assembly effect with maximum visible movement.
 *
 * On fadeIn:  pixels stream in from all directions simultaneously, staggered by distance
 *             from the image centre so edge pixels arrive slightly later.
 * On fadeOut: pixels stream back out to the same scatter positions in reverse.
 *
 * Uses the existing p.startX/Y (scatter) and p.finalX/Y (grid) plus the distance-based
 * p.delay (0–0.4) that BaseEffect pre-computes for every particle.
 */
class DriftVariant extends BaseFadeVariant {
  // No extra metadata needed — startX/Y, finalX/Y, and delay are already on every particle.
  // eslint-disable-next-line no-unused-vars
  initVariantMetadata(particles, canvasWidth, canvasHeight, pixelSize, gridWidth, gridHeight) {}

  getVisiblePixels(particles, progress, phase, easeInOutCubic) {
    const result = []

    for (const p of particles) {
      const remaining = 1 - p.delay
      const localP = remaining > 0 ? Math.max(0, Math.min(1, (progress - p.delay) / remaining)) : 1
      const t = easeInOutCubic(localP)

      let x, y, alpha

      if (phase === 'fadeIn') {
        if (localP <= 0) continue
        x = Math.round(p.startX + (p.finalX - p.startX) * t)
        y = Math.round(p.startY + (p.finalY - p.startY) * t)
        // Quick alpha ramp so pixels are visible while travelling, not just at arrival.
        alpha = Math.min(1, localP * 4)
      } else if (phase === 'fadeOut') {
        if (localP >= 1) continue
        x = Math.round(p.finalX + (p.startX - p.finalX) * t)
        y = Math.round(p.finalY + (p.startY - p.finalY) * t)
        // Stay fully visible until the last quarter of the journey, then fade out.
        alpha = localP < 0.75 ? 1 : Math.max(0, (1 - localP) * 4)
      } else {
        continue
      }

      if (alpha <= 0) continue
      result.push({ x, y, brightness: p.brightness, color: p.color, alpha })
    }

    return result
  }
}

export { DriftVariant }
