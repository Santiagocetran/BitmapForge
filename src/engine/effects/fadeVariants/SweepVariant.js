import { BaseFadeVariant } from './BaseFadeVariant.js'

/**
 * Sweep — a wave front travels left-to-right across the canvas. As the wave reaches each
 * pixel's column, that pixel slides a short distance into its final position from the left.
 *
 * On fadeIn:  wave moves left→right; pixels slide rightward into place as the wave passes.
 * On fadeOut: wave moves right→left; pixels slide further rightward and disappear.
 *
 * The BAND constant controls how wide the active sweep zone is (relative to total progress 0–1).
 * A narrower band creates a crisper edge; wider feels more gradual.
 */
class SweepVariant extends BaseFadeVariant {
  // eslint-disable-next-line no-unused-vars
  initVariantMetadata(particles, canvasWidth, canvasHeight, pixelSize, gridWidth, gridHeight) {
    const maxX = canvasWidth - pixelSize || 1
    for (const p of particles) {
      // Normalised X position: 0 = leftmost column, 1 = rightmost column.
      p.sweepThreshold = p.finalX / maxX
    }
  }

  getVisiblePixels(particles, progress, phase, easeInOutCubic) {
    // Width of the wave's active band in progress-space (0–1).
    const BAND = 0.15
    // How far each pixel slides before settling at its final position (in canvas pixels).
    const SLIDE = 32
    const result = []

    for (const p of particles) {
      let x, y, alpha

      if (phase === 'fadeIn') {
        // Wave sweeps left→right. Pixel activates when the front reaches its column.
        const startAt = p.sweepThreshold * (1 - BAND)
        const localP = Math.max(0, Math.min(1, (progress - startAt) / BAND))
        if (localP <= 0) continue
        const t = easeInOutCubic(localP)
        // Slide from slightly left of final position into place.
        x = Math.round(p.finalX - SLIDE + SLIDE * t)
        y = p.finalY
        alpha = Math.min(1, localP * 3)
      } else if (phase === 'fadeOut') {
        // Wave sweeps right→left. Pixels on the right exit first.
        const startAt = (1 - p.sweepThreshold) * (1 - BAND)
        const localP = Math.max(0, Math.min(1, (progress - startAt) / BAND))
        if (localP >= 1) continue
        const t = easeInOutCubic(localP)
        // Slide further right as the wave sweeps through.
        x = Math.round(p.finalX + SLIDE * t)
        y = p.finalY
        alpha = Math.max(0, 1 - localP * 3)
      } else {
        continue
      }

      if (alpha <= 0) continue
      result.push({ x, y, brightness: p.brightness, color: p.color, alpha })
    }

    return result
  }
}

export { SweepVariant }
