import { BaseFadeVariant } from './BaseFadeVariant.js'

/**
 * Scatter — pixels start at random positions anywhere on the canvas and converge
 * to their final grid positions (or disperse back out on fadeOut).
 *
 * Unlike Drift (which flies particles in from off-canvas edges), Scatter seeds start
 * positions across the entire canvas area. This gives the impression of pixels
 * reshuffling in place — chaotic but self-contained — rather than arriving from outside.
 *
 * The per-pixel stagger is also purely random (not distance-based), so there is no
 * visible spatial order: some edge pixels settle early, some centre pixels settle late.
 *
 * On fadeIn:  pixels migrate from their random canvas positions to the grid.
 * On fadeOut: pixels disperse back to the same random positions.
 */
class ScatterVariant extends BaseFadeVariant {
  initVariantMetadata(particles, canvasWidth, canvasHeight) {
    const seed = this.options.seed ?? 7

    for (const p of particles) {
      const h1 = Math.sin(p.idx * 23.9898 + seed * 91.233) * 43758.5453
      const h2 = Math.sin(p.idx * 67.1234 + seed * 43.123) * 43758.5453
      const h3 = Math.sin(p.idx * 11.5678 + seed * 77.456) * 43758.5453

      // Random start position anywhere on the visible canvas.
      p.scatterX = (h1 - Math.floor(h1)) * canvasWidth
      p.scatterY = (h2 - Math.floor(h2)) * canvasHeight

      // Purely random stagger — no spatial bias.
      p.scatterDelay = (h3 - Math.floor(h3)) * 0.5
    }
  }

  getVisiblePixels(particles, progress, phase, easeInOutCubic) {
    const result = []

    for (const p of particles) {
      const remaining = 1 - p.scatterDelay
      const localP = remaining > 0 ? Math.max(0, Math.min(1, (progress - p.scatterDelay) / remaining)) : 1
      const t = easeInOutCubic(localP)

      let x, y, alpha

      if (phase === 'fadeIn') {
        if (localP <= 0) continue
        x = Math.round(p.scatterX + (p.finalX - p.scatterX) * t)
        y = Math.round(p.scatterY + (p.finalY - p.scatterY) * t)
        // Pixels are visible while travelling — ramp up quickly so movement is visible.
        alpha = Math.min(1, localP * 3)
      } else if (phase === 'fadeOut') {
        if (localP >= 1) continue
        x = Math.round(p.finalX + (p.scatterX - p.finalX) * t)
        y = Math.round(p.finalY + (p.scatterY - p.finalY) * t)
        // Stay fully visible for most of the journey, fade at the end.
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

export { ScatterVariant }
