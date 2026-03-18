import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BloomEffect } from './BloomEffect.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a local mock for the main canvas context passed to apply().
 * Returns a ctx with controlled pixel data (the global mock is NOT used here).
 */
function makeCtx(width, height, rgbValue = 128) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = rgbValue
    data[i + 1] = rgbValue
    data[i + 2] = rgbValue
    data[i + 3] = 255
  }
  return {
    getImageData: vi.fn(() => ({ data, width, height })),
    putImageData: vi.fn(),
    _data: data
  }
}

/**
 * Reference to the global canvas context mock (from test/setup.js).
 * BloomEffect creates offscreen canvases internally — their getContext('2d')
 * returns this same shared mock.
 */
let globalOffCtx

beforeEach(() => {
  globalOffCtx = document.createElement('canvas').getContext('2d')
  // Configure the global mock to return properly-sized zero arrays by default.
  // With all-zero blurred data: screen(orig, 0) = orig, so dark-canvas tests work.
  globalOffCtx.getImageData.mockImplementation((x, y, w, h) => ({
    data: new Uint8ClampedArray(w * h * 4),
    width: w,
    height: h
  }))
})

afterEach(() => {
  // Restore the original setup.js behaviour (returns empty array).
  globalOffCtx.getImageData.mockImplementation(() => ({ data: new Uint8ClampedArray(0) }))
  // Remove any filter property that might have been set by a CSS-filter path test.
  delete globalOffCtx.filter
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

describe('BloomEffect — construction', () => {
  it('creates an instance with an apply method', () => {
    const effect = new BloomEffect()
    expect(typeof effect.apply).toBe('function')
  })

  it('creates an instance with a _boxBlur helper', () => {
    const effect = new BloomEffect()
    expect(typeof effect._boxBlur).toBe('function')
  })
})

// ---------------------------------------------------------------------------
// Guard clauses
// ---------------------------------------------------------------------------

describe('BloomEffect — guard clauses', () => {
  it('returns early without calling getImageData for zero width', () => {
    const ctx = makeCtx(4, 4)
    new BloomEffect().apply(ctx, 0, 4, { bloomThreshold: 0.7, bloomRadius: 2, bloomStrength: 0.5 })
    expect(ctx.getImageData).not.toHaveBeenCalled()
  })

  it('returns early without calling getImageData for zero height', () => {
    const ctx = makeCtx(4, 4)
    new BloomEffect().apply(ctx, 4, 0, { bloomThreshold: 0.7, bloomRadius: 2, bloomStrength: 0.5 })
    expect(ctx.getImageData).not.toHaveBeenCalled()
  })

  it('calls getImageData and putImageData for positive dimensions', () => {
    const W = 4,
      H = 4
    const ctx = makeCtx(W, H, 200)
    new BloomEffect().apply(ctx, W, H, { bloomThreshold: 0.5, bloomRadius: 1, bloomStrength: 0.5 })
    expect(ctx.getImageData).toHaveBeenCalledWith(0, 0, W, H)
    expect(ctx.putImageData).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Screen blend math
// ---------------------------------------------------------------------------

describe('BloomEffect — screen blend (box-blur path)', () => {
  it('dark canvas: pixels below threshold remain unchanged (zero blurred data)', () => {
    // screen(orig, 0) = orig → no brightening
    const W = 4,
      H = 4
    const ctx = makeCtx(W, H, 10) // lum ≈ 0.039, below default threshold 0.7
    new BloomEffect().apply(ctx, W, H, { bloomThreshold: 0.7, bloomRadius: 1, bloomStrength: 1.0 })

    const output = ctx.putImageData.mock.calls[0][0].data
    for (let i = 0; i < output.length; i += 4) {
      expect(output[i]).toBe(10) // R
      expect(output[i + 1]).toBe(10) // G
      expect(output[i + 2]).toBe(10) // B
      expect(output[i + 3]).toBe(255) // alpha unchanged
    }
  })

  it('bright canvas: screen blend increases brightness when blurred has non-zero data', () => {
    const W = 4,
      H = 4
    // Configure offscreen mock to return 200 for all getImageData calls.
    // With uniform-200 input the box blur also outputs 200, so blurred = 200.
    globalOffCtx.getImageData.mockImplementation((x, y, w, h) => ({
      data: new Uint8ClampedArray(w * h * 4).fill(200),
      width: w,
      height: h
    }))

    const ctx = makeCtx(W, H, 240) // above threshold 0.5
    new BloomEffect().apply(ctx, W, H, { bloomThreshold: 0.5, bloomRadius: 1, bloomStrength: 1.0 })

    const output = ctx.putImageData.mock.calls[0][0].data
    for (let i = 0; i < output.length; i += 4) {
      if (output[i + 3] === 0) continue
      // screen(240, 200) ≈ 252, output = 240 + (252 − 240) × 1.0 = 252 ≥ 240
      expect(output[i]).toBeGreaterThanOrEqual(240)
    }
  })

  it('output pixel channel values are always in [0, 255]', () => {
    const W = 4,
      H = 4
    // Max possible values
    globalOffCtx.getImageData.mockImplementation((x, y, w, h) => ({
      data: new Uint8ClampedArray(w * h * 4).fill(255),
      width: w,
      height: h
    }))

    const ctx = makeCtx(W, H, 255)
    new BloomEffect().apply(ctx, W, H, { bloomThreshold: 0, bloomRadius: 1, bloomStrength: 1.0 })

    const output = ctx.putImageData.mock.calls[0][0].data
    for (let i = 0; i < output.length; i++) {
      expect(output[i]).toBeGreaterThanOrEqual(0)
      expect(output[i]).toBeLessThanOrEqual(255)
    }
  })

  it('transparent pixels (alpha === 0) are skipped and RGB is not modified', () => {
    const W = 4,
      H = 4
    const data = new Uint8ClampedArray(W * H * 4)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i + 1] = data[i + 2] = 200
      data[i + 3] = 0 // fully transparent
    }
    const ctx = {
      getImageData: vi.fn(() => ({ data, width: W, height: H })),
      putImageData: vi.fn()
    }

    new BloomEffect().apply(ctx, W, H, { bloomThreshold: 0, bloomRadius: 1, bloomStrength: 1.0 })

    for (let i = 0; i < data.length; i += 4) {
      expect(data[i + 3]).toBe(0) // alpha unchanged
      expect(data[i]).toBe(200) // R unchanged
    }
  })
})

// ---------------------------------------------------------------------------
// Box blur fallback
// ---------------------------------------------------------------------------

describe('BloomEffect — _boxBlur', () => {
  it('runs without throwing and calls putImageData', () => {
    const W = 4,
      H = 4
    const data = new Uint8ClampedArray(W * H * 4).fill(128)
    const imageData = { data, width: W, height: H }
    const mockCtx = {
      getImageData: vi.fn(() => imageData),
      putImageData: vi.fn()
    }

    expect(() => new BloomEffect()._boxBlur(mockCtx, W, H, 2)).not.toThrow()
    expect(mockCtx.putImageData).toHaveBeenCalledOnce()
  })

  it('uniform input remains uniform after blur', () => {
    const W = 4,
      H = 4
    const val = 160
    // getImageData must return a COPY so src ≠ dst after modification
    const makeData = () => {
      const d = new Uint8ClampedArray(W * H * 4).fill(val)
      return { data: d, width: W, height: H }
    }
    const mockCtx = {
      getImageData: vi.fn(makeData),
      putImageData: vi.fn()
    }

    new BloomEffect()._boxBlur(mockCtx, W, H, 2)

    const output = mockCtx.putImageData.mock.calls[0][0].data
    for (let i = 0; i < output.length; i++) {
      // Uniform image → box blur → still uniform (within floating-point rounding)
      expect(output[i]).toBeCloseTo(val, 0)
    }
  })

  it('spreads a bright pixel to neighbours', () => {
    // Single bright pixel at x=2 in a 5×1 image
    const W = 5,
      H = 1
    const src = new Uint8ClampedArray(W * H * 4) // all zeros
    src[2 * 4] = src[2 * 4 + 1] = src[2 * 4 + 2] = src[2 * 4 + 3] = 255

    const mockCtx = {
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(src), width: W, height: H })),
      putImageData: vi.fn()
    }

    new BloomEffect()._boxBlur(mockCtx, W, H, 1)

    const output = mockCtx.putImageData.mock.calls[0][0].data
    // Horizontal blur (radius 1, kernel 3) spreads 255 to x=1..3; vertical (H=1) is no-op
    expect(output[0 * 4]).toBe(0) // x=0: no contribution
    expect(output[1 * 4]).toBeCloseTo(85, 0) // x=1: avg(0,0,255)/3
    expect(output[2 * 4]).toBeCloseTo(85, 0) // x=2: avg(0,255,0)/3
    expect(output[3 * 4]).toBeCloseTo(85, 0) // x=3: avg(255,0,0)/3
    expect(output[4 * 4]).toBe(0) // x=4: no contribution
  })
})

// ---------------------------------------------------------------------------
// CSS filter fast path
// ---------------------------------------------------------------------------

describe('BloomEffect — CSS filter path', () => {
  it('uses drawImage when offCtx.filter is defined', () => {
    // Add filter property to the global mock to trigger the fast path
    globalOffCtx.filter = ''

    const W = 4,
      H = 4
    const ctx = makeCtx(W, H, 200)
    expect(() =>
      new BloomEffect().apply(ctx, W, H, { bloomThreshold: 0.5, bloomRadius: 4, bloomStrength: 0.5 })
    ).not.toThrow()

    // CSS filter path calls drawImage (box blur path does not)
    expect(globalOffCtx.drawImage).toHaveBeenCalled()
  })

  it('box-blur path does not call drawImage on the offscreen context', () => {
    // No filter property → box blur path
    expect(globalOffCtx.filter).toBeUndefined()

    const W = 4,
      H = 4
    const ctx = makeCtx(W, H, 200)
    new BloomEffect().apply(ctx, W, H, { bloomThreshold: 0.5, bloomRadius: 2, bloomStrength: 0.5 })

    expect(globalOffCtx.drawImage).not.toHaveBeenCalled()
  })
})
