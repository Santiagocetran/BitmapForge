import { BaseFadeVariant } from './BaseFadeVariant.js'

/**
 * Vortex — pixels travel along curved arcing paths from their scatter positions to their
 * final positions, creating a swirling assembly effect.
 *
 * The arc is produced by adding a perpendicular offset to the straight travel path.
 * The offset follows a bell-curve envelope (peaks at the midpoint of the journey and
 * returns to zero at both ends), so pixels start and land exactly where they should.
 * All arcs curve in the same rotational direction (clockwise), producing the vortex feel.
 *
 * On fadeIn:  pixels spiral inward from scatter positions to the grid.
 * On fadeOut: pixels spiral outward from the grid back to scatter positions.
 */
class VortexVariant extends BaseFadeVariant {
  // eslint-disable-next-line no-unused-vars
  initVariantMetadata(particles, canvasWidth, canvasHeight, pixelSize, gridWidth, gridHeight) {
    for (const p of particles) {
      // Reuse the distance-based stagger that BaseEffect already computed.
      p.vortexDelay = p.delay

      const dx = p.finalX - p.startX
      const dy = p.finalY - p.startY
      const len = Math.sqrt(dx * dx + dy * dy) || 1

      // Perpendicular unit vector — 90° clockwise rotation of the travel direction.
      // (-dy, dx) rotates the vector (dx, dy) by +90° in canvas space.
      p.perpX = -dy / len
      p.perpY = dx / len

      // Arc amplitude: 30% of travel distance, capped to avoid excessive off-screen swing.
      p.vortexAmp = Math.min(len * 0.3, 120)
    }
  }

  getVisiblePixels(particles, progress, phase, easeInOutCubic) {
    const result = []

    for (const p of particles) {
      const remaining = 1 - p.vortexDelay
      const localP = remaining > 0 ? Math.max(0, Math.min(1, (progress - p.vortexDelay) / remaining)) : 1

      let x, y, alpha

      if (phase === 'fadeIn') {
        if (localP <= 0) continue
        const t = easeInOutCubic(localP)
        // Bell-curve arc: zero at start and end, peaks at midpoint.
        const arc = 4 * t * (1 - t) * p.vortexAmp
        x = Math.round(p.startX + (p.finalX - p.startX) * t + p.perpX * arc)
        y = Math.round(p.startY + (p.finalY - p.startY) * t + p.perpY * arc)
        alpha = Math.min(1, localP * 4)
      } else if (phase === 'fadeOut') {
        if (localP >= 1) continue
        const t = easeInOutCubic(localP)
        // Reverse path: final→start, arc curves in same direction.
        const arc = 4 * t * (1 - t) * p.vortexAmp
        x = Math.round(p.finalX + (p.startX - p.finalX) * t + p.perpX * arc)
        y = Math.round(p.finalY + (p.startY - p.finalY) * t + p.perpY * arc)
        // Stay visible for most of the journey, fade at the end.
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

export { VortexVariant }
