import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HalftoneRenderer } from './HalftoneRenderer.js'

// ---------------------------------------------------------------------------
// Minimal canvas mock
// ---------------------------------------------------------------------------

function makeCtxMock() {
  return {
    fillStyle: '',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    _isMock: true
  }
}

function makeCanvasMock(ctx) {
  return {
    width: 120,
    height: 120,
    style: {},
    getContext: () => ctx,
    parentNode: null
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal 2×2 RGBA imageData (flat Uint8ClampedArray). */
function makeImageData(r = 100, g = 100, b = 100, a = 255) {
  const data = new Uint8ClampedArray(2 * 2 * 4)
  for (let i = 0; i < 4; i++) {
    data[i * 4] = r
    data[i * 4 + 1] = g
    data[i * 4 + 2] = b
    data[i * 4 + 3] = a
  }
  return data
}

const getColor = () => '#ff0000'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HalftoneRenderer — construction', () => {
  it('creates a canvas and context on construction', () => {
    const r = new HalftoneRenderer()
    expect(r.canvas).toBeTruthy()
    expect(r.canvas.tagName).toBe('CANVAS')
  })

  it('exposes default options', () => {
    const r = new HalftoneRenderer()
    expect(r.options.pixelSize).toBe(6)
    expect(r.options.halftoneDotShape).toBe('circle')
    expect(r.options.halftoneAngle).toBe(0)
  })

  it('merges constructor options', () => {
    const r = new HalftoneRenderer({ halftoneDotShape: 'diamond', halftoneAngle: 45 })
    expect(r.options.halftoneDotShape).toBe('diamond')
    expect(r.options.halftoneAngle).toBe(45)
  })
})

describe('HalftoneRenderer — setSize / init', () => {
  it('setSize updates canvas dimensions', () => {
    const r = new HalftoneRenderer()
    r.setSize(200, 150)
    expect(r.canvas.width).toBe(200)
    expect(r.canvas.height).toBe(150)
  })

  it('init calls setSize', () => {
    const r = new HalftoneRenderer()
    r.init(100, 80)
    expect(r.canvas.width).toBe(100)
    expect(r.canvas.height).toBe(80)
  })
})

describe('HalftoneRenderer — beginFrame', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new HalftoneRenderer({ backgroundColor: '#000000' })
    // Inject mock ctx
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
  })

  it('fills background when color is not transparent', () => {
    r.beginFrame('#000000')
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('clears when transparent', () => {
    r.beginFrame('transparent')
    expect(ctx.clearRect).toHaveBeenCalled()
    expect(ctx.fillRect).not.toHaveBeenCalled()
  })
})

describe('HalftoneRenderer — render (normal mode)', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new HalftoneRenderer({ pixelSize: 6 })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
  })

  it('draws at least one dot for mid-gray input', () => {
    const imageData = makeImageData(128, 128, 128)
    r.render(imageData, 2, 2, getColor)
    // A circle dot calls beginPath + arc + fill
    expect(ctx.arc).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('skips fully transparent pixels (a=0)', () => {
    const imageData = makeImageData(128, 128, 128, 0)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.arc).not.toHaveBeenCalled()
  })

  it('skips pixels below minBrightness', () => {
    const imageData = makeImageData(5, 5, 5) // very dark, brightness ≈ 0.02
    r.render(imageData, 2, 2, getColor)
    expect(ctx.arc).not.toHaveBeenCalled()
  })

  it('draws diamond shape with fillRect', () => {
    r.updateOptions({ halftoneDotShape: 'diamond' })
    const imageData = makeImageData(128, 128, 128)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('applies canvas rotation when halftoneAngle != 0', () => {
    r.updateOptions({ halftoneAngle: 45 })
    const imageData = makeImageData(128, 128, 128)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.rotate).toHaveBeenCalled()
  })

  it('does not rotate when halftoneAngle is 0', () => {
    r.updateOptions({ halftoneAngle: 0 })
    const imageData = makeImageData(128, 128, 128)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.rotate).not.toHaveBeenCalled()
  })
})

describe('HalftoneRenderer — drawPixel', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new HalftoneRenderer({ pixelSize: 6 })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
  })

  it('draws a dot for mid-brightness', () => {
    r.drawPixel(0, 0, 0.5, '#00ff00', 1)
    expect(ctx.arc).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('respects alpha — sets globalAlpha when alpha < 1', () => {
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
    ctx.fillStyle = '#initial'
    r.drawPixel(0, 0, 0.5, '#abcdef', 0.5)
    expect(ctx.globalAlpha).toBe(1)
    expect(ctx.fillStyle).toBe('#initial')
  })

  it('skips dots with near-zero brightness radius', () => {
    // brightness ≈ 1 → radius ≈ 0 → skipped
    r.drawPixel(0, 0, 0.999, '#fff', 1)
    expect(ctx.arc).not.toHaveBeenCalled()
  })
})

describe('HalftoneRenderer — shouldDraw', () => {
  it('returns false below minBrightness', () => {
    const r = new HalftoneRenderer({ minBrightness: 0.1 })
    expect(r.shouldDraw(0.05)).toBe(false)
  })

  it('returns true above minBrightness', () => {
    const r = new HalftoneRenderer({ minBrightness: 0.05 })
    expect(r.shouldDraw(0.5)).toBe(true)
  })
})

describe('HalftoneRenderer — dispose', () => {
  it('removes canvas from DOM and nulls internal refs', () => {
    const r = new HalftoneRenderer()
    const mockParent = { removeChild: vi.fn() }
    Object.defineProperty(r._bitmapCanvas, 'parentNode', { get: () => mockParent, configurable: true })
    r.dispose()
    expect(mockParent.removeChild).toHaveBeenCalled()
    expect(r._bitmapCanvas).toBeNull()
    expect(r._bitmapCtx).toBeNull()
  })

  it('is safe to call multiple times', () => {
    const r = new HalftoneRenderer()
    expect(() => {
      r.dispose()
      r.dispose()
    }).not.toThrow()
  })
})

describe('HalftoneRenderer — updateOptions', () => {
  it('merges new options into existing', () => {
    const r = new HalftoneRenderer({ pixelSize: 6 })
    r.updateOptions({ halftoneAngle: 90, halftoneCmyk: true })
    expect(r.options.halftoneAngle).toBe(90)
    expect(r.options.halftoneCmyk).toBe(true)
    expect(r.options.pixelSize).toBe(6) // unchanged
  })
})
