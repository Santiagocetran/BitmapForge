import { BaseFadeVariant } from './BaseFadeVariant.js'

/**
 * Bloom — pixels reveal by brightness tier (highlights ignite first, shadows fill in last).
 * On fadeIn: bright pixels bloom first; dark pixels trail behind.
 * On fadeOut: dark pixels extinguish first; bright pixels linger, then fade.
 *
 * Each pixel's alpha is a smooth ramp based on where its brightness sits relative
 * to the current progress front, creating a glowing wash-in/wash-out effect.
 */
class BloomVariant extends BaseFadeVariant {
  initVariantMetadata(particles) {
    // Normalise brightness into [0,1] per-particle threshold.
    // A small offset so even the darkest pixels eventually appear.
    for (const p of particles) {
      // threshold: bright pixels → low threshold (appear early in fadeIn)
      p.bloomThreshold = 1 - p.brightness
    }
  }

  getVisiblePixels(particles, progress, phase) {
    // Softness controls how wide the alpha gradient band is (0 = hard cut, higher = softer).
    const SOFTNESS = 0.18
    const result = []

    for (const p of particles) {
      let alpha
      if (phase === 'fadeIn') {
        // Pixel lights up when progress crosses its threshold.
        alpha = Math.min(1, Math.max(0, (progress - p.bloomThreshold + SOFTNESS) / SOFTNESS))
      } else if (phase === 'fadeOut') {
        // Pixel extinguishes when progress climbs past its threshold.
        alpha = Math.min(1, Math.max(0, (p.bloomThreshold - progress + SOFTNESS) / SOFTNESS))
      } else {
        continue
      }

      if (alpha <= 0) continue
      result.push({ x: p.finalX, y: p.finalY, brightness: p.brightness, color: p.color, alpha })
    }
    return result
  }
}

export { BloomVariant }
