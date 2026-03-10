/**
 * CrtEffect — applies CRT monitor aesthetics as a post-processing pass.
 *
 * Three independent sub-effects, each toggleable via params:
 *   1. Scanlines — horizontal dark bands every N rows (direct fillRect, no pixel read)
 *   2. Chromatic aberration — red channel shifted right, blue shifted left (getImageData)
 *   3. Vignette — darkened corners via radial gradient overlay (no pixel read)
 *
 * Performance notes:
 *   - Scanlines and vignette use direct canvas drawing — very fast at any size.
 *   - Chromatic aberration uses getImageData + putImageData — ~width×height iterations.
 *     Acceptable at typical export sizes (≤600px). Set chromaticAberration=0 to skip.
 */
class CrtEffect {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   * @param {object} params
   * @param {number} [params.scanlineGap=4] - rows between scanlines (2–8)
   * @param {number} [params.scanlineOpacity=0.4] - darkness of scanline bands (0.1–0.8)
   * @param {number} [params.chromaticAberration=0] - R/B channel pixel shift (0–5)
   * @param {number} [params.crtVignette=0.3] - vignette corner strength (0–1)
   */
  apply(ctx, width, height, params) {
    if (!ctx || width <= 0 || height <= 0) return

    const { scanlineGap = 4, scanlineOpacity = 0.4, chromaticAberration = 0, crtVignette = 0.3 } = params

    // 1. Scanlines — direct fillRect, no pixel read needed
    if (scanlineGap > 0 && scanlineOpacity > 0) {
      ctx.fillStyle = `rgba(0,0,0,${scanlineOpacity})`
      for (let y = 0; y < height; y += scanlineGap) {
        ctx.fillRect(0, y, width, 1)
      }
    }

    // 2. Chromatic aberration — needs pixel-level access
    if (chromaticAberration > 0) {
      const imageData = ctx.getImageData(0, 0, width, height)
      this._applyCA(imageData.data, width, height, Math.round(chromaticAberration))
      ctx.putImageData(imageData, 0, 0)
    }

    // 3. Vignette — radial gradient overlay, no pixel read needed
    if (crtVignette > 0) {
      const cx = width * 0.5
      const cy = height * 0.5
      const innerR = Math.min(width, height) * 0.3
      const outerR = Math.max(width, height) * 0.75
      const gradient = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR)
      gradient.addColorStop(0, 'rgba(0,0,0,0)')
      gradient.addColorStop(1, `rgba(0,0,0,${Math.min(crtVignette * 0.85, 0.85)})`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
  }

  /**
   * Shift the red channel left by `shift` pixels and blue channel right by `shift` pixels.
   * Works on a copy of the original data to avoid reading already-modified pixels.
   * @param {Uint8ClampedArray} data - flat RGBA pixel array (modified in-place)
   * @param {number} width
   * @param {number} height
   * @param {number} shift - pixel shift amount
   */
  _applyCA(data, width, height, shift) {
    const original = new Uint8ClampedArray(data)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        // Red from (x - shift)
        const rx = x - shift
        if (rx >= 0) data[i] = original[(y * width + rx) * 4]
        // Blue from (x + shift)
        const bx = x + shift
        if (bx < width) data[i + 2] = original[(y * width + bx) * 4 + 2]
      }
    }
  }
}

export { CrtEffect }
