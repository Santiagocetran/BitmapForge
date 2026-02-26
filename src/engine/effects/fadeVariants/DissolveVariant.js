import { BaseFadeVariant } from './BaseFadeVariant.js'

/**
 * Dissolve — the original BitmapForge fade effect.
 * Particles gather inward from scattered off-screen positions on fadeIn,
 * and scatter back out on fadeOut, with staggered per-particle delays.
 */
class DissolveVariant extends BaseFadeVariant {
  getVisiblePixels(particles, progress, phase, easeInOutCubic) {
    const result = []
    for (const p of particles) {
      const localProgress = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)))
      const eased = easeInOutCubic(localProgress)

      if (phase === 'fadeIn') {
        const x = p.startX + (p.finalX - p.startX) * eased
        const y = p.startY + (p.finalY - p.startY) * eased
        const alpha = Math.min(1, localProgress * 2)
        result.push({ x, y, brightness: p.brightness, color: p.color, alpha })
      } else if (phase === 'fadeOut') {
        const x = p.finalX + (p.startX - p.finalX) * eased
        const y = p.finalY + (p.startY - p.finalY) * eased
        const alpha = Math.max(0, 1 - localProgress * 2)
        result.push({ x, y, brightness: p.brightness, color: p.color, alpha })
      }
    }
    return result
  }
}

export { DissolveVariant }
