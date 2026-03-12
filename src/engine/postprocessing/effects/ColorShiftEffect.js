/**
 * ColorShiftEffect — applies hue rotation and saturation shift as a post-processing pass.
 *
 * Prefers the native `ctx.filter` path (hue-rotate + saturate CSS filters) for
 * performance. Falls back to manual RGB->HSL->RGB per-pixel conversion when
 * `ctx.filter` is not supported.
 *
 * Set hue=0 and saturation=1.0 to skip entirely (no-op guard).
 */
class ColorShiftEffect {
  /**
   * @param {object} [opts]
   * @param {number} [opts.colorShiftHue=0] - hue rotation in degrees (0–360)
   * @param {number} [opts.colorShiftSaturation=1.0] - saturation multiplier (0–2)
   */
  constructor({ colorShiftHue = 0, colorShiftSaturation = 1.0 } = {}) {
    this.colorShiftHue = colorShiftHue
    this.colorShiftSaturation = colorShiftSaturation
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   * @param {object} params
   * @param {number} [params.colorShiftHue]
   * @param {number} [params.colorShiftSaturation]
   */
  apply(ctx, width, height, params) {
    const hue = params.colorShiftHue ?? this.colorShiftHue
    const saturation = params.colorShiftSaturation ?? this.colorShiftSaturation
    if (hue === 0 && saturation === 1.0) return
    if (!ctx || width <= 0 || height <= 0) return

    const supportsFilter = typeof ctx.filter !== 'undefined'

    if (supportsFilter) {
      this._applyWithFilter(ctx, width, height, hue, saturation)
    } else {
      this._applyManual(ctx, width, height, hue, saturation)
    }
  }

  /**
   * Fast path — use CSS canvas filters.
   */
  _applyWithFilter(ctx, width, height, hue, saturation) {
    // Save current canvas content to a temp canvas
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.drawImage(ctx.canvas, 0, 0)

    // Clear and redraw with filter
    ctx.clearRect(0, 0, width, height)
    ctx.filter = `hue-rotate(${hue}deg) saturate(${saturation})`
    ctx.drawImage(tempCanvas, 0, 0)
    ctx.filter = 'none'
  }

  /**
   * Fallback — manual per-pixel RGB -> HSL -> RGB.
   */
  _applyManual(ctx, width, height, hue, saturation) {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const hueShift = hue / 360

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue

      const r = data[i] / 255
      const g = data[i + 1] / 255
      const b = data[i + 2] / 255

      let [h, s, l] = rgbToHsl(r, g, b)
      h = (h + hueShift) % 1
      if (h < 0) h += 1
      s = Math.max(0, Math.min(1, s * saturation))

      const [nr, ng, nb] = hslToRgb(h, s, l)
      data[i] = Math.round(nr * 255)
      data[i + 1] = Math.round(ng * 255)
      data[i + 2] = Math.round(nb * 255)
    }

    ctx.putImageData(imageData, 0, 0)
  }
}

/**
 * Convert RGB [0,1] to HSL [0,1].
 */
function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return [h, s, l]
}

/**
 * Convert HSL [0,1] to RGB [0,1].
 */
function hslToRgb(h, s, l) {
  if (s === 0) return [l, l, l]

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)]
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

export { ColorShiftEffect, rgbToHsl, hslToRgb }
