/**
 * BloomEffect — glow/bloom post-processing effect.
 *
 * Three-step algorithm:
 *   1. Bright-pass: extract pixels with luminance > bloomThreshold into an offscreen canvas
 *   2. Blur the extracted pixels:
 *      - Fast path: ctx.filter = 'blur(Npx)' (CSS blur, skips pixel-level work)
 *      - Fallback: separable box blur, 3 H+V passes (used in headless/CI environments)
 *   3. Screen blend: composite blurred over original at bloomStrength intensity
 *      result = original + (screen(original, blurred) - original) * bloomStrength
 *
 * Gating: bloomEnabled is NOT checked inside apply(). Callers must invoke
 * PostProcessingChain.setEnabled('bloom', ...) before apply() — consistent with all effects.
 *
 * Luminance weights: 0.3 / 0.59 / 0.11 (matches getBrightness convention in codebase).
 */
class BloomEffect {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   * @param {object} params
   * @param {number} [params.bloomThreshold=0.7] - luminance threshold for bright-pass (0.4–0.95)
   * @param {number} [params.bloomRadius=4]      - blur radius in pixels (1–12)
   * @param {number} [params.bloomStrength=0.6]  - blend intensity (0.1–1.0)
   */
  apply(ctx, width, height, params) {
    if (width <= 0 || height <= 0) return

    const { bloomThreshold = 0.7, bloomRadius = 4, bloomStrength = 0.6 } = params

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Step 1: bright-pass — extract pixels above luminance threshold
    const brightPixels = new Uint8ClampedArray(data.length)
    for (let i = 0; i < data.length; i += 4) {
      const lum = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11) / 255
      if (lum > bloomThreshold) {
        brightPixels[i] = data[i]
        brightPixels[i + 1] = data[i + 1]
        brightPixels[i + 2] = data[i + 2]
        brightPixels[i + 3] = data[i + 3]
      }
    }

    const offscreen = document.createElement('canvas')
    offscreen.width = width
    offscreen.height = height
    const offCtx = offscreen.getContext('2d')

    // Put bright pixels into offscreen canvas
    const brightImageData = offCtx.getImageData(0, 0, width, height)
    brightImageData.data.set(brightPixels)
    offCtx.putImageData(brightImageData, 0, 0)

    // Step 2: blur the bright pixels
    if (typeof offCtx.filter !== 'undefined') {
      // Fast path: CSS filter blur
      const blurCanvas = document.createElement('canvas')
      blurCanvas.width = width
      blurCanvas.height = height
      const blurCtx = blurCanvas.getContext('2d')
      blurCtx.filter = `blur(${bloomRadius}px)`
      blurCtx.drawImage(offscreen, 0, 0)
      offCtx.clearRect(0, 0, width, height)
      offCtx.drawImage(blurCanvas, 0, 0)
    } else {
      // Fallback: separable box blur, 3 passes for a smoother Gaussian approximation
      this._boxBlur(offCtx, width, height, bloomRadius)
      this._boxBlur(offCtx, width, height, bloomRadius)
      this._boxBlur(offCtx, width, height, bloomRadius)
    }

    // Step 3: screen blend at bloomStrength
    const blurredData = offCtx.getImageData(0, 0, width, height)
    const blurred = blurredData.data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue
      for (let c = 0; c < 3; c++) {
        const screened = 255 - ((255 - data[i + c]) * (255 - blurred[i + c])) / 255
        data[i + c] = Math.round(data[i + c] + (screened - data[i + c]) * bloomStrength)
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * Single-pass separable box blur on an offscreen canvas context.
   * Applies a horizontal pass then a vertical pass, clamping to edges for borders.
   * @param {CanvasRenderingContext2D} offCtx
   * @param {number} width
   * @param {number} height
   * @param {number} radius - blur radius in pixels
   */
  _boxBlur(offCtx, width, height, radius) {
    const imageData = offCtx.getImageData(0, 0, width, height)
    const src = new Uint8ClampedArray(imageData.data)
    const dst = imageData.data
    const half = Math.max(1, Math.round(radius))
    const kernelSize = half * 2 + 1

    // Horizontal pass: src → tmp
    const tmp = new Uint8ClampedArray(src.length)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0,
          gSum = 0,
          bSum = 0,
          aSum = 0
        for (let dx = -half; dx <= half; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx))
          const i = (y * width + nx) * 4
          rSum += src[i]
          gSum += src[i + 1]
          bSum += src[i + 2]
          aSum += src[i + 3]
        }
        const i = (y * width + x) * 4
        tmp[i] = rSum / kernelSize
        tmp[i + 1] = gSum / kernelSize
        tmp[i + 2] = bSum / kernelSize
        tmp[i + 3] = aSum / kernelSize
      }
    }

    // Vertical pass: tmp → dst
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0,
          gSum = 0,
          bSum = 0,
          aSum = 0
        for (let dy = -half; dy <= half; dy++) {
          const ny = Math.max(0, Math.min(height - 1, y + dy))
          const i = (ny * width + x) * 4
          rSum += tmp[i]
          gSum += tmp[i + 1]
          bSum += tmp[i + 2]
          aSum += tmp[i + 3]
        }
        const i = (y * width + x) * 4
        dst[i] = rSum / kernelSize
        dst[i + 1] = gSum / kernelSize
        dst[i + 2] = bSum / kernelSize
        dst[i + 3] = aSum / kernelSize
      }
    }

    offCtx.putImageData(imageData, 0, 0)
  }
}

export { BloomEffect }
