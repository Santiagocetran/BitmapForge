import { describe, it, expect, vi } from 'vitest'
import { NoiseEffect } from './NoiseEffect.js'

function makeCtx(width, height, fillValue = 128) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = fillValue
    data[i + 1] = fillValue
    data[i + 2] = fillValue
    data[i + 3] = 255
  }
  const imageData = { data, width, height }
  return {
    getImageData: vi.fn(() => imageData),
    putImageData: vi.fn(),
    _imageData: imageData
  }
}

describe('NoiseEffect', () => {
  it('is a no-op when noiseAmount === 0', () => {
    const effect = new NoiseEffect()
    const ctx = makeCtx(4, 4)
    const original = new Uint8ClampedArray(ctx._imageData.data)

    effect.apply(ctx, 4, 4, { noiseAmount: 0, noiseMonochrome: true })

    expect(ctx.getImageData).not.toHaveBeenCalled()
    expect(ctx.putImageData).not.toHaveBeenCalled()
    // Data unchanged
    expect(ctx._imageData.data).toEqual(original)
  })

  it('mutates pixels when noiseAmount > 0', () => {
    const effect = new NoiseEffect()
    const ctx = makeCtx(8, 8)
    const original = new Uint8ClampedArray(ctx._imageData.data)

    effect.apply(ctx, 8, 8, { noiseAmount: 0.3, noiseMonochrome: true })

    expect(ctx.getImageData).toHaveBeenCalledOnce()
    expect(ctx.putImageData).toHaveBeenCalledOnce()
    // At least some pixel should differ (extremely unlikely all random offsets are 0)
    let changed = false
    for (let i = 0; i < original.length; i++) {
      if (ctx._imageData.data[i] !== original[i]) {
        changed = true
        break
      }
    }
    expect(changed).toBe(true)
  })

  it('monochrome: R, G, B receive the same offset per pixel', () => {
    const effect = new NoiseEffect()
    const ctx = makeCtx(4, 4, 128)

    effect.apply(ctx, 4, 4, { noiseAmount: 0.5, noiseMonochrome: true })

    const data = ctx._imageData.data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue
      // R, G, B should have been shifted by the same offset from 128
      const dr = data[i] - 128
      const dg = data[i + 1] - 128
      const db = data[i + 2] - 128
      expect(dr).toBe(dg)
      expect(dr).toBe(db)
    }
  })

  it('colored: R, G, B have independent offsets', () => {
    const effect = new NoiseEffect()
    // Use a larger canvas for statistical confidence
    const ctx = makeCtx(16, 16, 128)

    effect.apply(ctx, 16, 16, { noiseAmount: 0.5, noiseMonochrome: false })

    const data = ctx._imageData.data
    let allSame = true
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue
      const dr = data[i] - 128
      const dg = data[i + 1] - 128
      const db = data[i + 2] - 128
      if (dr !== dg || dr !== db) {
        allSame = false
        break
      }
    }
    // With 256 pixels and independent random offsets, the probability they're all
    // identical is vanishingly small
    expect(allSame).toBe(false)
  })
})
