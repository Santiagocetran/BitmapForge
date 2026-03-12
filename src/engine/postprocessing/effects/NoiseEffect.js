/**
 * NoiseEffect — applies film grain as a post-processing pass.
 *
 * Per-pixel random brightness offset, optionally monochrome (same offset for
 * R, G, B) or colored (independent per-channel offsets).
 *
 * Performance: uses getImageData + putImageData — ~width*height iterations.
 * Set noiseAmount=0 to skip entirely.
 */
class NoiseEffect {
  /**
   * @param {object} [opts]
   * @param {number} [opts.noiseAmount=0.15] - strength 0–0.5
   * @param {boolean} [opts.noiseMonochrome=true] - same offset for all channels
   */
  constructor({ noiseAmount = 0.15, noiseMonochrome = true } = {}) {
    this.noiseAmount = noiseAmount
    this.noiseMonochrome = noiseMonochrome
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   * @param {object} params
   * @param {number} [params.noiseAmount]
   * @param {boolean} [params.noiseMonochrome]
   */
  apply(ctx, width, height, params) {
    const amount = params.noiseAmount ?? this.noiseAmount
    if (amount === 0) return
    if (!ctx || width <= 0 || height <= 0) return

    const mono = params.noiseMonochrome ?? this.noiseMonochrome
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const strength = amount * 255 * 2

    for (let i = 0; i < data.length; i += 4) {
      // Skip fully transparent pixels
      if (data[i + 3] === 0) continue

      if (mono) {
        const offset = (Math.random() - 0.5) * strength
        data[i] = Math.max(0, Math.min(255, data[i] + offset))
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + offset))
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + offset))
      } else {
        data[i] = Math.max(0, Math.min(255, data[i] + (Math.random() - 0.5) * strength))
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + (Math.random() - 0.5) * strength))
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + (Math.random() - 0.5) * strength))
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }
}

export { NoiseEffect }
