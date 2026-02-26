import { BaseFadeVariant } from './BaseFadeVariant.js'

/**
 * Cascade — pixels fall into position column by column, like rain or data streaming in.
 * Each column has a seeded stagger delay so columns don't all fire at once.
 * On fadeIn: pixels drop from above the canvas into their final Y position.
 * On fadeOut: pixels slide off the bottom of the canvas.
 *
 * The motion uses easeInOutCubic so it feels weighty and intentional, not floaty.
 */
class CascadeVariant extends BaseFadeVariant {
  // eslint-disable-next-line no-unused-vars
  initVariantMetadata(particles, canvasWidth, canvasHeight, pixelSize, gridWidth, gridHeight) {
    const seed = this.options.seed ?? 1

    // Assign a per-column stagger offset in [0, MAX_STAGGER].
    // Using a deterministic hash so export is reproducible.
    const MAX_STAGGER = 0.4
    const columnDelay = new Float32Array(gridWidth)
    for (let col = 0; col < gridWidth; col++) {
      const s = Math.sin(col * 127.1 + seed * 311.7) * 43758.5453
      columnDelay[col] = (s - Math.floor(s)) * MAX_STAGGER
    }

    for (const p of particles) {
      const col = Math.floor(p.finalX / pixelSize)
      p.cascadeDelay = columnDelay[Math.min(col, gridWidth - 1)]
      // fadeIn start position: above the canvas by one full canvas height
      p.cascadeStartY = p.finalY - canvasHeight - pixelSize
    }
  }

  getVisiblePixels(particles, progress, phase, easeInOutCubic) {
    const result = []

    for (const p of particles) {
      // Remap progress into per-column local time [0,1] accounting for stagger.
      const remaining = 1 - p.cascadeDelay
      const localProgress = remaining <= 0 ? 1 : Math.min(1, Math.max(0, (progress - p.cascadeDelay) / remaining))
      const t = easeInOutCubic(localProgress)

      let x, y, alpha
      if (phase === 'fadeIn') {
        // Lerp from above the canvas → final position.
        y = Math.round(p.cascadeStartY + (p.finalY - p.cascadeStartY) * t)
        x = p.finalX
        alpha = localProgress > 0 ? 1 : 0
      } else if (phase === 'fadeOut') {
        // Reverse: lerp from final position → below the canvas.
        const exitY = p.finalY + (p.finalY - p.cascadeStartY)
        y = Math.round(p.finalY + (exitY - p.finalY) * t)
        x = p.finalX
        alpha = localProgress < 1 ? 1 : 0
      } else {
        continue
      }

      if (alpha <= 0) continue
      result.push({ x, y, brightness: p.brightness, color: p.color, alpha })
    }
    return result
  }
}

export { CascadeVariant }
