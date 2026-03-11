import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StippleRenderer } from './StippleRenderer.js'

// ---------------------------------------------------------------------------
// Minimal canvas mock
// ---------------------------------------------------------------------------

function makeCtxMock() {
  return {
    fillStyle: '',
    globalAlpha: 1,
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn()
  }
}

function makeCanvasMock(ctx, width = 160, height = 160) {
  return {
    width,
    height,
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

const getColor = () => '#000000'

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

describe('StippleRenderer — construction', () => {
  it('creates a canvas on construction', () => {
    const r = new StippleRenderer()
    expect(r.canvas).toBeTruthy()
    expect(r.canvas.tagName).toBe('CANVAS')
  })

  it('exposes default options', () => {
    const r = new StippleRenderer()
    expect(r.options.pixelSize).toBe(6)
    expect(r.options.stippleDotSize).toBe(2)
    expect(r.options.stippleDensity).toBe(3)
    expect(r.options.backgroundColor).toBe('#f5f0e8')
  })

  it('merges constructor options', () => {
    const r = new StippleRenderer({ stippleDotSize: 4, stippleDensity: 5, pixelSize: 10 })
    expect(r.options.stippleDotSize).toBe(4)
    expect(r.options.stippleDensity).toBe(5)
    expect(r.options.pixelSize).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// setSize / init
// ---------------------------------------------------------------------------

describe('StippleRenderer — setSize / init', () => {
  it('setSize updates canvas dimensions', () => {
    const r = new StippleRenderer()
    r.setSize(320, 240)
    expect(r.canvas.width).toBe(320)
    expect(r.canvas.height).toBe(240)
  })

  it('init delegates to setSize', () => {
    const r = new StippleRenderer()
    r.init(200, 100)
    expect(r.canvas.width).toBe(200)
    expect(r.canvas.height).toBe(100)
  })

  it('clamps dimensions to at least 1', () => {
    const r = new StippleRenderer()
    r.setSize(0, 0)
    expect(r.canvas.width).toBe(1)
    expect(r.canvas.height).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// beginFrame
// ---------------------------------------------------------------------------

describe('StippleRenderer — beginFrame', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new StippleRenderer()
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
  })

  it('fills with provided background color', () => {
    r.beginFrame('#f5f0e8')
    expect(ctx.fillStyle).toBe('#f5f0e8')
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('clears canvas when transparent is passed', () => {
    r.beginFrame('transparent')
    expect(ctx.clearRect).toHaveBeenCalled()
    expect(ctx.fillRect).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// shouldDraw
// ---------------------------------------------------------------------------

describe('StippleRenderer — shouldDraw', () => {
  it('returns false below minBrightness', () => {
    const r = new StippleRenderer({ minBrightness: 0.1 })
    expect(r.shouldDraw(0.05)).toBe(false)
  })

  it('returns true above minBrightness', () => {
    const r = new StippleRenderer({ minBrightness: 0.05 })
    expect(r.shouldDraw(0.5)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// render
// ---------------------------------------------------------------------------

describe('StippleRenderer — render', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new StippleRenderer({ pixelSize: 8, stippleDotSize: 2, stippleDensity: 3 })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx, 160, 160)
  })

  it('draws arcs for mid-gray pixels', () => {
    const imageData = makeImageData(4, 4)
    r.render(imageData, 4, 4, getColor)
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

  it('draws no dots for very bright pixels (density rounds to 0)', () => {
    // white pixels → brightness ≈ 1 → localDensity = 0 → numDots = 0
    const imageData = makeImageData(2, 2, 255, 255, 255)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.arc).not.toHaveBeenCalled()
  })

  it('inverts brightness mapping when invert option is true', () => {
    const ctxInvert = makeCtxMock()
    const rInvert = new StippleRenderer({ pixelSize: 8, stippleDotSize: 2, stippleDensity: 3, invert: true })
    rInvert._bitmapCtx = ctxInvert
    rInvert._bitmapCanvas = makeCanvasMock(ctxInvert, 160, 160)
    // Bright pixel — with invert, treated as dark → should draw dots
    const imageData = makeImageData(2, 2, 255, 255, 255)
    rInvert.render(imageData, 2, 2, getColor)
    expect(ctxInvert.arc).toHaveBeenCalled()
  })

  it('does not throw for empty grid', () => {
    expect(() => r.render(new Uint8ClampedArray(0), 0, 0, getColor)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// drawPixel
// ---------------------------------------------------------------------------

describe('StippleRenderer — drawPixel', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new StippleRenderer({ pixelSize: 8, stippleDotSize: 2 })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx, 160, 160)
  })

  it('draws an arc for a mid-brightness pixel', () => {
    r.drawPixel(0, 0, 0.5, '#000000', 1)
    expect(ctx.arc).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('sets globalAlpha when alpha < 1', () => {
    const alphaValues = []
    Object.defineProperty(ctx, 'globalAlpha', {
      get: () => alphaValues[alphaValues.length - 1] ?? 1,
      set(v) {
        alphaValues.push(v)
      }
    })
    r.drawPixel(0, 0, 0.5, '#000000', 0.5)
    expect(alphaValues).toContain(0.5)
  })

  it('restores globalAlpha to 1 after drawing with alpha < 1', () => {
    const alphaValues = []
    Object.defineProperty(ctx, 'globalAlpha', {
      get: () => alphaValues[alphaValues.length - 1] ?? 1,
      set(v) {
        alphaValues.push(v)
      }
    })
    r.drawPixel(0, 0, 0.5, '#000000', 0.5)
    expect(alphaValues[alphaValues.length - 1]).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// dispose
// ---------------------------------------------------------------------------

describe('StippleRenderer — dispose', () => {
  it('removes canvas from DOM and nulls refs', () => {
    const r = new StippleRenderer()
    const mockParent = { removeChild: vi.fn() }
    Object.defineProperty(r._bitmapCanvas, 'parentNode', {
      get: () => mockParent,
      configurable: true
    })
    r.dispose()
    expect(mockParent.removeChild).toHaveBeenCalled()
    expect(r._bitmapCanvas).toBeNull()
    expect(r._bitmapCtx).toBeNull()
  })

  it('is safe to call multiple times', () => {
    const r = new StippleRenderer()
    expect(() => {
      r.dispose()
      r.dispose()
    }).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// updateOptions
// ---------------------------------------------------------------------------

describe('StippleRenderer — updateOptions', () => {
  it('merges new options without overwriting unrelated fields', () => {
    const r = new StippleRenderer({ pixelSize: 8, stippleDotSize: 2 })
    r.updateOptions({ stippleDensity: 4 })
    expect(r.options.stippleDensity).toBe(4)
    expect(r.options.pixelSize).toBe(8)
    expect(r.options.stippleDotSize).toBe(2)
  })
})
