import { BaseFadeVariant } from './BaseFadeVariant.js'

/**
 * Glitch — pixels appear/disappear in a seeded random order (TV-static / data-corruption aesthetic).
 * Each pixel has a stable noise value in [0, 1]. On fadeIn, pixels become visible once
 * their noise value drops below progress. On fadeOut, the reverse. The seed is deterministic,
 * so GIF/video export produces the same frames every time.
 */
class GlitchVariant extends BaseFadeVariant {
  initVariantMetadata(particles) {
    const seed = this.options.seed ?? 0
    for (const p of particles) {
      const s = Math.sin(p.idx * 12.9898 + seed * 78.233) * 43758.5453
      p.glitchNoise = s - Math.floor(s)
    }
  }

  getVisiblePixels(particles, progress, phase) {
    const result = []
    for (const p of particles) {
      let visible
      if (phase === 'fadeIn') {
        visible = p.glitchNoise < progress
      } else if (phase === 'fadeOut') {
        visible = p.glitchNoise >= progress
      } else {
        continue
      }

      if (!visible) continue
      result.push({ x: p.finalX, y: p.finalY, brightness: p.brightness, color: p.color, alpha: 1 })
    }
    return result
  }
}

export { GlitchVariant }
