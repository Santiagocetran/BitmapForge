import { describe, it, expect, vi } from 'vitest'
import { ColorShiftEffect, rgbToHsl, hslToRgb } from './ColorShiftEffect.js'

function makeCtx(width, height, { r = 200, g = 100, b = 50 } = {}) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = 255
  }
  const imageData = { data, width, height }
  // Simulate a ctx WITHOUT filter support for the fallback path
  return {
    getImageData: vi.fn(() => imageData),
    putImageData: vi.fn(),
    _imageData: imageData
  }
}

function makeFilterCtx(width, height) {
  const canvas = { width, height }
  const drawn = []
  const ctx = {
    canvas,
    filter: 'none',
    clearRect: vi.fn(),
    drawImage: vi.fn((...args) => drawn.push(args)),
    _drawn: drawn
  }
  return ctx
}

describe('ColorShiftEffect', () => {
  it('is a no-op when hue=0 and saturation=1.0', () => {
    const effect = new ColorShiftEffect()
    const ctx = makeCtx(4, 4)
    const original = new Uint8ClampedArray(ctx._imageData.data)

    effect.apply(ctx, 4, 4, { colorShiftHue: 0, colorShiftSaturation: 1.0 })

    expect(ctx.getImageData).not.toHaveBeenCalled()
    expect(ctx.putImageData).not.toHaveBeenCalled()
    expect(ctx._imageData.data).toEqual(original)
  })

  it('uses ctx.filter path when filter is supported', () => {
    const effect = new ColorShiftEffect()
    const ctx = makeFilterCtx(10, 10)

    effect.apply(ctx, 10, 10, { colorShiftHue: 90, colorShiftSaturation: 1.5 })

    expect(ctx.clearRect).toHaveBeenCalled()
    expect(ctx.filter).toBe('none') // reset after apply
  })

  it('uses manual fallback when ctx.filter is undefined', () => {
    const effect = new ColorShiftEffect()
    const ctx = makeCtx(4, 4, { r: 200, g: 100, b: 50 })
    // Remove filter support
    delete ctx.filter

    const original = new Uint8ClampedArray(ctx._imageData.data)

    effect.apply(ctx, 4, 4, { colorShiftHue: 180, colorShiftSaturation: 1.0 })

    expect(ctx.getImageData).toHaveBeenCalledOnce()
    expect(ctx.putImageData).toHaveBeenCalledOnce()

    // Pixels should be modified
    let changed = false
    for (let i = 0; i < original.length; i++) {
      if (ctx._imageData.data[i] !== original[i]) {
        changed = true
        break
      }
    }
    expect(changed).toBe(true)
  })

  it('hue=360 is equivalent to hue=0 in manual path (full rotation)', () => {
    const effect = new ColorShiftEffect()
    const ctx = makeCtx(4, 4, { r: 200, g: 100, b: 50 })
    delete ctx.filter
    const original = new Uint8ClampedArray(ctx._imageData.data)

    effect.apply(ctx, 4, 4, { colorShiftHue: 360, colorShiftSaturation: 1.0 })

    // 360° rotation should return roughly the same colors (within rounding)
    const data = ctx._imageData.data
    for (let i = 0; i < data.length; i += 4) {
      expect(Math.abs(data[i] - original[i])).toBeLessThanOrEqual(1)
      expect(Math.abs(data[i + 1] - original[i + 1])).toBeLessThanOrEqual(1)
      expect(Math.abs(data[i + 2] - original[i + 2])).toBeLessThanOrEqual(1)
    }
  })

  it('saturation=0 desaturates to grayscale in manual path', () => {
    const effect = new ColorShiftEffect()
    const ctx = makeCtx(4, 4, { r: 200, g: 100, b: 50 })
    delete ctx.filter

    effect.apply(ctx, 4, 4, { colorShiftHue: 0, colorShiftSaturation: 0 })

    const data = ctx._imageData.data
    for (let i = 0; i < data.length; i += 4) {
      // All channels should be equal (grayscale)
      expect(data[i]).toBe(data[i + 1])
      expect(data[i + 1]).toBe(data[i + 2])
    }
  })
})

describe('rgbToHsl / hslToRgb round-trip', () => {
  it('round-trips pure red', () => {
    const [h, s, l] = rgbToHsl(1, 0, 0)
    const [r, g, b] = hslToRgb(h, s, l)
    expect(r).toBeCloseTo(1, 4)
    expect(g).toBeCloseTo(0, 4)
    expect(b).toBeCloseTo(0, 4)
  })

  it('round-trips neutral gray', () => {
    const [h, s, l] = rgbToHsl(0.5, 0.5, 0.5)
    expect(s).toBe(0)
    const [r, g, b] = hslToRgb(h, s, l)
    expect(r).toBeCloseTo(0.5, 4)
    expect(g).toBeCloseTo(0.5, 4)
    expect(b).toBeCloseTo(0.5, 4)
  })
})
