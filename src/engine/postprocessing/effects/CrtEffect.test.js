import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CrtEffect } from './CrtEffect.js'

// ---------------------------------------------------------------------------
// Canvas context mock
// ---------------------------------------------------------------------------

function makeCtxMock(width = 100, height = 100) {
  const pixels = new Uint8ClampedArray(width * height * 4).fill(128)
  pixels[3] = 255 // ensure alpha for first pixel

  return {
    fillStyle: '',
    fillRect: vi.fn(),
    getImageData: vi.fn((x, y, w, h) => ({
      data: new Uint8ClampedArray(w * h * 4).fill(128),
      width: w,
      height: h
    })),
    putImageData: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    }))
  }
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

describe('CrtEffect — construction', () => {
  it('creates an instance with an apply method', () => {
    const eff = new CrtEffect()
    expect(typeof eff.apply).toBe('function')
  })
})

// ---------------------------------------------------------------------------
// apply — guard clauses
// ---------------------------------------------------------------------------

describe('CrtEffect — apply guard clauses', () => {
  it('returns early for null ctx', () => {
    const eff = new CrtEffect()
    expect(() => eff.apply(null, 100, 100, {})).not.toThrow()
  })

  it('returns early for zero width', () => {
    const eff = new CrtEffect()
    const ctx = makeCtxMock()
    eff.apply(ctx, 0, 100, {})
    expect(ctx.fillRect).not.toHaveBeenCalled()
  })

  it('returns early for zero height', () => {
    const eff = new CrtEffect()
    const ctx = makeCtxMock()
    eff.apply(ctx, 100, 0, {})
    expect(ctx.fillRect).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Scanlines
// ---------------------------------------------------------------------------

describe('CrtEffect — scanlines', () => {
  let ctx, eff

  beforeEach(() => {
    ctx = makeCtxMock()
    eff = new CrtEffect()
  })

  it('draws scanlines at the default scanlineGap interval', () => {
    eff.apply(ctx, 100, 100, { scanlineGap: 4, scanlineOpacity: 0.4, chromaticAberration: 0, crtVignette: 0 })
    // rows 0, 4, 8, ... 96 → 25 scanlines
    expect(ctx.fillRect).toHaveBeenCalledTimes(25)
    expect(ctx.fillStyle).toContain('rgba(0,0,0,')
  })

  it('each scanline is 1px tall and full-width', () => {
    eff.apply(ctx, 100, 100, { scanlineGap: 4, scanlineOpacity: 0.4, chromaticAberration: 0, crtVignette: 0 })
    const firstCall = ctx.fillRect.mock.calls[0]
    expect(firstCall).toEqual([0, 0, 100, 1])
  })

  it('skips scanlines when scanlineOpacity is 0', () => {
    eff.apply(ctx, 100, 100, { scanlineGap: 4, scanlineOpacity: 0, chromaticAberration: 0, crtVignette: 0 })
    expect(ctx.fillRect).not.toHaveBeenCalled()
  })

  it('uses the provided opacity in fillStyle', () => {
    eff.apply(ctx, 100, 100, { scanlineGap: 4, scanlineOpacity: 0.6, chromaticAberration: 0, crtVignette: 0 })
    expect(ctx.fillStyle).toBe('rgba(0,0,0,0.6)')
  })
})

// ---------------------------------------------------------------------------
// Chromatic aberration
// ---------------------------------------------------------------------------

describe('CrtEffect — chromatic aberration', () => {
  let ctx, eff

  beforeEach(() => {
    ctx = makeCtxMock()
    eff = new CrtEffect()
  })

  it('calls getImageData and putImageData when chromaticAberration > 0', () => {
    eff.apply(ctx, 10, 10, { scanlineGap: 0, scanlineOpacity: 0, chromaticAberration: 2, crtVignette: 0 })
    expect(ctx.getImageData).toHaveBeenCalledWith(0, 0, 10, 10)
    expect(ctx.putImageData).toHaveBeenCalled()
  })

  it('skips getImageData when chromaticAberration is 0', () => {
    eff.apply(ctx, 10, 10, { scanlineGap: 0, scanlineOpacity: 0, chromaticAberration: 0, crtVignette: 0 })
    expect(ctx.getImageData).not.toHaveBeenCalled()
  })

  it('_applyCA shifts channels in opposite directions', () => {
    // Set up a known pixel array: all zeros except pixel at x=5 has r=200, b=100
    const w = 10,
      h = 1
    const data = new Uint8ClampedArray(w * h * 4)
    data[5 * 4] = 200 // red at x=5
    data[5 * 4 + 2] = 100 // blue at x=5

    eff._applyCA(data, w, h, 2)

    // Red should appear at x=7 (shifted right by 2): data[7*4] reads from x=5
    expect(data[7 * 4]).toBe(200)
    // Blue should appear at x=3 (shifted left by 2): data[3*4+2] reads from x=5
    expect(data[3 * 4 + 2]).toBe(100)
  })
})

// ---------------------------------------------------------------------------
// Vignette
// ---------------------------------------------------------------------------

describe('CrtEffect — vignette', () => {
  let ctx, eff

  beforeEach(() => {
    ctx = makeCtxMock()
    eff = new CrtEffect()
  })

  it('creates a radial gradient when crtVignette > 0', () => {
    eff.apply(ctx, 100, 100, { scanlineGap: 0, scanlineOpacity: 0, chromaticAberration: 0, crtVignette: 0.5 })
    expect(ctx.createRadialGradient).toHaveBeenCalled()
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('skips vignette when crtVignette is 0', () => {
    eff.apply(ctx, 100, 100, { scanlineGap: 0, scanlineOpacity: 0, chromaticAberration: 0, crtVignette: 0 })
    expect(ctx.createRadialGradient).not.toHaveBeenCalled()
  })

  it('centers the gradient at canvas center', () => {
    eff.apply(ctx, 100, 80, { scanlineGap: 0, scanlineOpacity: 0, chromaticAberration: 0, crtVignette: 0.3 })
    const [cx1, cy1] = ctx.createRadialGradient.mock.calls[0]
    expect(cx1).toBe(50)
    expect(cy1).toBe(40)
  })
})

// ---------------------------------------------------------------------------
// Full pipeline
// ---------------------------------------------------------------------------

describe('CrtEffect — full pipeline', () => {
  it('applies all three sub-effects when all params are set', () => {
    const ctx = makeCtxMock()
    const eff = new CrtEffect()
    eff.apply(ctx, 50, 50, { scanlineGap: 4, scanlineOpacity: 0.4, chromaticAberration: 1, crtVignette: 0.3 })
    expect(ctx.fillRect).toHaveBeenCalled()
    expect(ctx.getImageData).toHaveBeenCalled()
    expect(ctx.createRadialGradient).toHaveBeenCalled()
  })

  it('applies no sub-effects when all params are zero/disabled', () => {
    const ctx = makeCtxMock()
    const eff = new CrtEffect()
    eff.apply(ctx, 50, 50, { scanlineGap: 0, scanlineOpacity: 0, chromaticAberration: 0, crtVignette: 0 })
    expect(ctx.fillRect).not.toHaveBeenCalled()
    expect(ctx.getImageData).not.toHaveBeenCalled()
    expect(ctx.createRadialGradient).not.toHaveBeenCalled()
  })

  it('uses default param values when params object is empty', () => {
    // defaults: scanlineGap=4, scanlineOpacity=0.4, chromaticAberration=0, crtVignette=0.3
    const ctx = makeCtxMock()
    const eff = new CrtEffect()
    eff.apply(ctx, 50, 50, {})
    expect(ctx.fillRect).toHaveBeenCalled() // scanlines
    expect(ctx.getImageData).not.toHaveBeenCalled() // chromaticAberration=0
    expect(ctx.createRadialGradient).toHaveBeenCalled() // vignette=0.3
  })
})
