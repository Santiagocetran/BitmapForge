import { BaseFadeVariant } from './BaseFadeVariant.js'

/**
 * Static — horizontally-banded TV noise that clears row by row with per-pixel jitter.
 * 70% of the threshold comes from the row position (creates visible horizontal bands),
 * 30% from per-pixel noise (breaks up the banding so it reads as static, not scanlines).
 *
 * On fadeIn: bands clear from top to bottom, pixels snap in through noise.
 * On fadeOut: bands dissolve from bottom to top.
 *
 * This is visually distinct from Glitch (pure per-pixel random) because the strong
 * row component creates a sweeping, signal-clearing aesthetic.
 */
class StaticVariant extends BaseFadeVariant {
  initVariantMetadata(particles, canvasWidth, canvasHeight, pixelSize, gridWidth, gridHeight) {
    const seed = this.options.seed ?? 2

    for (const p of particles) {
      // Row-based component: normalised Y position [0, 1]
      const rowNorm = gridHeight > 1 ? Math.floor(p.finalY / pixelSize) / (gridHeight - 1) : 0

      // Per-pixel noise component
      const s = Math.sin(p.idx * 43.9898 + seed * 127.233) * 43758.5453
      const pixelNoise = s - Math.floor(s)

      // Blend: 70% row, 30% pixel noise
      p.staticThreshold = rowNorm * 0.7 + pixelNoise * 0.3
    }
  }

  getVisiblePixels(particles, progress, phase) {
    const SOFTNESS = 0.06
    const result = []

    for (const p of particles) {
      let alpha
      if (phase === 'fadeIn') {
        // Signal clears from top (threshold≈0) downward
        alpha = Math.min(1, Math.max(0, (progress - p.staticThreshold + SOFTNESS) / SOFTNESS))
      } else if (phase === 'fadeOut') {
        // Signal cuts out from bottom (threshold≈1) upward
        alpha = Math.min(1, Math.max(0, (p.staticThreshold - (1 - progress) + SOFTNESS) / SOFTNESS))
      } else {
        continue
      }

      if (alpha <= 0) continue
      result.push({ x: p.finalX, y: p.finalY, brightness: p.brightness, color: p.color, alpha })
    }
    return result
  }
}

export { StaticVariant }
