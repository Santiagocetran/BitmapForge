import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LedMatrixRenderer } from './LedMatrixRenderer.js'

// ---------------------------------------------------------------------------
// Minimal canvas mock
// ---------------------------------------------------------------------------

function makeCtxMock({ hasRoundRect = true } = {}) {
  const ctx = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    }))
  }
  if (hasRoundRect) {
    ctx.roundRect = vi.fn()
  }
  return ctx
}

function makeCanvasMock(ctx) {
  return {
    width: 160,
    height: 160,
    style: {},
    getContext: () => ctx,
    parentNode: null
  }
}

/** Build a flat RGBA Uint8ClampedArray for a gridW×gridH grid. */
function makeImageData(gridW, gridH, r = 128, g = 128, b = 128, a = 255) {
  const data = new Uint8ClampedArray(gridW * gridH * 4)
  for (let i = 0; i < gridW * gridH; i++) {
    data[i * 4] = r
    data[i * 4 + 1] = g
    data[i * 4 + 2] = b
    data[i * 4 + 3] = a
  }
  return data
}

const getColor = () => '#00ff00'

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

describe('LedMatrixRenderer — construction', () => {
  it('creates a canvas and context on construction', () => {
    const r = new LedMatrixRenderer()
    expect(r.canvas).toBeTruthy()
    expect(r.canvas.tagName).toBe('CANVAS')
  })

  it('exposes default options', () => {
    const r = new LedMatrixRenderer()
    expect(r.options.pixelSize).toBe(8)
    expect(r.options.ledGap).toBe(1)
    expect(r.options.ledGlowRadius).toBe(2)
    expect(r.options.ledShape).toBe('circle')
    expect(r.options.backgroundColor).toBe('#111111')
  })

  it('merges constructor options', () => {
    const r = new LedMatrixRenderer({ ledGap: 2, ledShape: 'roundRect', ledGlowRadius: 0 })
    expect(r.options.ledGap).toBe(2)
    expect(r.options.ledShape).toBe('roundRect')
    expect(r.options.ledGlowRadius).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// setSize / init
// ---------------------------------------------------------------------------

describe('LedMatrixRenderer — setSize / init', () => {
  it('setSize updates canvas dimensions', () => {
    const r = new LedMatrixRenderer()
    r.setSize(320, 240)
    expect(r.canvas.width).toBe(320)
    expect(r.canvas.height).toBe(240)
  })

  it('init delegates to setSize', () => {
    const r = new LedMatrixRenderer()
    r.init(100, 80)
    expect(r.canvas.width).toBe(100)
    expect(r.canvas.height).toBe(80)
  })
})

// ---------------------------------------------------------------------------
// beginFrame
// ---------------------------------------------------------------------------

describe('LedMatrixRenderer — beginFrame', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new LedMatrixRenderer()
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
  })

  it('fills with provided background color', () => {
    r.beginFrame('#222222')
    expect(ctx.fillStyle).toBe('#222222')
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('falls back to #111111 when transparent is passed', () => {
    r.beginFrame('transparent')
    expect(ctx.fillStyle).toBe('#111111')
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('falls back to #111111 when no background is passed', () => {
    r.beginFrame(undefined)
    expect(ctx.fillStyle).toBe('#111111')
    expect(ctx.fillRect).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// render — LED drawing
// ---------------------------------------------------------------------------

describe('LedMatrixRenderer — render (circle LEDs)', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new LedMatrixRenderer({ pixelSize: 8, ledGap: 1, ledGlowRadius: 0, ledShape: 'circle' })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
  })

  it('draws at least one LED arc for mid-gray input', () => {
    const imageData = makeImageData(2, 2)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.arc).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('skips fully transparent pixels (a=0)', () => {
    const imageData = makeImageData(2, 2, 128, 128, 128, 0)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.arc).not.toHaveBeenCalled()
  })

  it('skips pixels below minBrightness', () => {
    // brightness ≈ 0.016 (very dark), default minBrightness = 0.05
    const imageData = makeImageData(2, 2, 4, 4, 4)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.arc).not.toHaveBeenCalled()
  })

  it('does not create radial gradient when ledGlowRadius is 0', () => {
    const imageData = makeImageData(2, 2)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.createRadialGradient).not.toHaveBeenCalled()
  })
})

describe('LedMatrixRenderer — render (glow)', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new LedMatrixRenderer({ pixelSize: 8, ledGap: 1, ledGlowRadius: 4, ledShape: 'circle' })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
  })

  it('creates a radial gradient when ledGlowRadius > 0', () => {
    const imageData = makeImageData(2, 2)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.createRadialGradient).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// render — ledSize clamp edge case
// ---------------------------------------------------------------------------

describe('LedMatrixRenderer — render (ledSize clamp)', () => {
  it('still renders when pixelSize === ledGap (ledSize clamped to 1)', () => {
    const ctx = makeCtxMock()
    const r = new LedMatrixRenderer({ pixelSize: 4, ledGap: 4, ledGlowRadius: 0, ledShape: 'circle' })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
    const imageData = makeImageData(2, 2)
    expect(() => r.render(imageData, 2, 2, getColor)).not.toThrow()
    // LED halfSize = 0.5 → arc should still be called
    expect(ctx.arc).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// render — roundRect shape
// ---------------------------------------------------------------------------

describe('LedMatrixRenderer — render (roundRect shape)', () => {
  it('calls ctx.roundRect when available', () => {
    const ctx = makeCtxMock({ hasRoundRect: true })
    const r = new LedMatrixRenderer({ pixelSize: 8, ledGap: 1, ledGlowRadius: 0, ledShape: 'roundRect' })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
    r._hasRoundRect = true
    const imageData = makeImageData(2, 2)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.roundRect).toHaveBeenCalled()
  })

  it('uses manual arc fallback when ctx.roundRect is unavailable', () => {
    const ctx = makeCtxMock({ hasRoundRect: false })
    const r = new LedMatrixRenderer({ pixelSize: 8, ledGap: 1, ledGlowRadius: 0, ledShape: 'roundRect' })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
    r._hasRoundRect = false
    const imageData = makeImageData(2, 2)
    r.render(imageData, 2, 2, getColor)
    // Manual path uses arcTo
    expect(ctx.arcTo).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// drawPixel
// ---------------------------------------------------------------------------

describe('LedMatrixRenderer — drawPixel', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new LedMatrixRenderer({ pixelSize: 8, ledGap: 1, ledGlowRadius: 0, ledShape: 'circle' })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
  })

  it('draws a circle LED for mid-brightness', () => {
    r.drawPixel(0, 0, 0.5, '#00ff00', 1)
    expect(ctx.arc).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('does not throw for any valid brightness', () => {
    expect(() => r.drawPixel(8, 8, 0.1, '#ff0000', 1)).not.toThrow()
    expect(() => r.drawPixel(8, 8, 0.9, '#ff0000', 1)).not.toThrow()
  })

  it('sets globalAlpha when alpha < 1', () => {
    const alphaValues = []
    Object.defineProperty(ctx, 'globalAlpha', {
      get: () => alphaValues[alphaValues.length - 1] ?? 1,
      set: (v) => {
        alphaValues.push(v)
      }
    })
    r.drawPixel(0, 0, 0.5, '#ff0000', 0.5)
    expect(alphaValues).toContain(0.5)
  })

  it('restores globalAlpha and fillStyle after drawing', () => {
    ctx.globalAlpha = 1
    ctx.fillStyle = '#original'
    r.drawPixel(0, 0, 0.5, '#abcdef', 0.5)
    expect(ctx.globalAlpha).toBe(1)
    expect(ctx.fillStyle).toBe('#original')
  })
})

// ---------------------------------------------------------------------------
// shouldDraw
// ---------------------------------------------------------------------------

describe('LedMatrixRenderer — shouldDraw', () => {
  it('returns false below minBrightness', () => {
    const r = new LedMatrixRenderer({ minBrightness: 0.1 })
    expect(r.shouldDraw(0.05)).toBe(false)
  })

  it('returns true above minBrightness', () => {
    const r = new LedMatrixRenderer({ minBrightness: 0.05 })
    expect(r.shouldDraw(0.5)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// dispose
// ---------------------------------------------------------------------------

describe('LedMatrixRenderer — dispose', () => {
  it('removes canvas from DOM and nulls internal refs', () => {
    const r = new LedMatrixRenderer()
    const mockParent = { removeChild: vi.fn() }
    Object.defineProperty(r._bitmapCanvas, 'parentNode', { get: () => mockParent, configurable: true })
    r.dispose()
    expect(mockParent.removeChild).toHaveBeenCalled()
    expect(r._bitmapCanvas).toBeNull()
    expect(r._bitmapCtx).toBeNull()
  })

  it('is safe to call multiple times', () => {
    const r = new LedMatrixRenderer()
    expect(() => {
      r.dispose()
      r.dispose()
    }).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// updateOptions
// ---------------------------------------------------------------------------

describe('LedMatrixRenderer — updateOptions', () => {
  it('merges new options without overwriting unrelated fields', () => {
    const r = new LedMatrixRenderer({ pixelSize: 8 })
    r.updateOptions({ ledGap: 3, ledGlowRadius: 5 })
    expect(r.options.ledGap).toBe(3)
    expect(r.options.ledGlowRadius).toBe(5)
    expect(r.options.pixelSize).toBe(8)
  })
})
