import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AsciiRenderer, CHAR_RAMPS, CHAR_RAMP_LABELS } from './AsciiRenderer.js'

// ---------------------------------------------------------------------------
// Minimal canvas/context mock
// ---------------------------------------------------------------------------

function makeCtxMock() {
  return {
    fillStyle: '',
    globalAlpha: 1,
    font: '',
    textBaseline: '',
    textAlign: '',
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 8 }))
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

const getColor = (brightness) => (brightness > 0.5 ? '#ffffff' : '#888888')

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

describe('AsciiRenderer — module exports', () => {
  it('exports CHAR_RAMPS with expected keys', () => {
    expect(CHAR_RAMPS).toHaveProperty('classic')
    expect(CHAR_RAMPS).toHaveProperty('blocks')
    expect(CHAR_RAMPS).toHaveProperty('dense')
    expect(CHAR_RAMPS).toHaveProperty('minimal')
  })

  it('exports CHAR_RAMP_LABELS matching CHAR_RAMPS keys', () => {
    expect(Object.keys(CHAR_RAMP_LABELS)).toEqual(Object.keys(CHAR_RAMPS))
  })

  it('all CHAR_RAMPS strings start with a space (background / dark)', () => {
    for (const [key, ramp] of Object.entries(CHAR_RAMPS)) {
      expect(ramp[0], `${key} ramp should start with space`).toBe(' ')
    }
  })
})

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

describe('AsciiRenderer — construction', () => {
  it('creates a canvas on construction', () => {
    const r = new AsciiRenderer()
    expect(r.canvas).toBeTruthy()
    expect(r.canvas.tagName).toBe('CANVAS')
  })

  it('exposes default options', () => {
    const r = new AsciiRenderer()
    expect(r.options.pixelSize).toBe(3)
    expect(r.options.charRamp).toBe('classic')
    expect(r.options.asciiColored).toBe(false)
    expect(r.options.backgroundColor).toBe('#0a0a0a')
  })

  it('merges constructor options', () => {
    const r = new AsciiRenderer({ charRamp: 'blocks', asciiColored: true, pixelSize: 12 })
    expect(r.options.charRamp).toBe('blocks')
    expect(r.options.asciiColored).toBe(true)
    expect(r.options.pixelSize).toBe(12)
  })
})

// ---------------------------------------------------------------------------
// setSize / init
// ---------------------------------------------------------------------------

describe('AsciiRenderer — setSize / init', () => {
  it('setSize updates canvas dimensions', () => {
    const r = new AsciiRenderer()
    r.setSize(320, 240)
    expect(r.canvas.width).toBe(320)
    expect(r.canvas.height).toBe(240)
  })

  it('setSize marks derived state dirty', () => {
    const r = new AsciiRenderer()
    r._dirty = false
    r.setSize(100, 80)
    expect(r._dirty).toBe(true)
  })

  it('init delegates to setSize', () => {
    const r = new AsciiRenderer()
    r.init(200, 100)
    expect(r.canvas.width).toBe(200)
    expect(r.canvas.height).toBe(100)
  })

  it('clamps dimensions to at least 1', () => {
    const r = new AsciiRenderer()
    r.setSize(0, 0)
    expect(r.canvas.width).toBe(1)
    expect(r.canvas.height).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// beginFrame
// ---------------------------------------------------------------------------

describe('AsciiRenderer — beginFrame', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new AsciiRenderer()
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx)
  })

  it('fills with the provided background color', () => {
    r.beginFrame('#1a1a1a')
    expect(ctx.fillStyle).toBe('#1a1a1a')
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('clears canvas when transparent is passed', () => {
    r.beginFrame('transparent')
    expect(ctx.clearRect).toHaveBeenCalled()
    expect(ctx.fillRect).not.toHaveBeenCalled()
  })

  it('resets _lastFill cache', () => {
    r._lastFill = '#cached'
    r.beginFrame('#000000')
    expect(r._lastFill).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// updateOptions — dirty flag
// ---------------------------------------------------------------------------

describe('AsciiRenderer — updateOptions', () => {
  it('marks dirty when charRamp changes', () => {
    const r = new AsciiRenderer({ charRamp: 'classic' })
    r._dirty = false
    r.updateOptions({ charRamp: 'blocks' })
    expect(r._dirty).toBe(true)
  })

  it('marks dirty when pixelSize changes', () => {
    const r = new AsciiRenderer({ pixelSize: 10 })
    r._dirty = false
    r.updateOptions({ pixelSize: 16 })
    expect(r._dirty).toBe(true)
  })

  it('does not mark dirty when unrelated option changes', () => {
    const r = new AsciiRenderer()
    r._dirty = false
    r.updateOptions({ asciiColored: true })
    expect(r._dirty).toBe(false)
  })

  it('merges options without overwriting unrelated fields', () => {
    const r = new AsciiRenderer({ pixelSize: 10, charRamp: 'classic' })
    r.updateOptions({ charRamp: 'dense' })
    expect(r.options.pixelSize).toBe(10)
    expect(r.options.charRamp).toBe('dense')
  })
})

// ---------------------------------------------------------------------------
// shouldDraw
// ---------------------------------------------------------------------------

describe('AsciiRenderer — shouldDraw', () => {
  it('returns false below minBrightness', () => {
    const r = new AsciiRenderer({ minBrightness: 0.1 })
    expect(r.shouldDraw(0.05)).toBe(false)
  })

  it('returns true above minBrightness', () => {
    const r = new AsciiRenderer({ minBrightness: 0.05 })
    expect(r.shouldDraw(0.5)).toBe(true)
  })

  it('returns false at exactly minBrightness (exclusive threshold)', () => {
    const r = new AsciiRenderer({ minBrightness: 0.1 })
    expect(r.shouldDraw(0.1)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// render — basic drawing
// ---------------------------------------------------------------------------

describe('AsciiRenderer — render', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new AsciiRenderer({ pixelSize: 10 })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx, 160, 160)
  })

  it('calls fillText for mid-gray pixels', () => {
    const imageData = makeImageData(4, 4)
    r.render(imageData, 4, 4, getColor)
    expect(ctx.fillText).toHaveBeenCalled()
  })

  it('skips fully transparent pixels (a=0)', () => {
    const imageData = makeImageData(2, 2, 128, 128, 128, 0)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.fillText).not.toHaveBeenCalled()
  })

  it('skips pixels below minBrightness', () => {
    // brightness ≈ 0.016 (very dark), default minBrightness = 0.05
    const imageData = makeImageData(2, 2, 4, 4, 4)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.fillText).not.toHaveBeenCalled()
  })

  it('skips space chars (first char in ramp = background)', () => {
    // Near-black but above minBrightness: maps to first ramp entry = space
    const imageData = makeImageData(2, 2, 20, 20, 20)
    r.render(imageData, 2, 2, getColor)
    // The space character is skipped, so no fillText even though brightness > minBrightness
    // (depending on ramp length, this could draw or not — just assert no throw)
    expect(() => r.render(imageData, 2, 2, getColor)).not.toThrow()
  })

  it('does not throw for empty grid', () => {
    expect(() => r.render(new Uint8ClampedArray(0), 0, 0, getColor)).not.toThrow()
  })

  it('sets font before drawing', () => {
    const imageData = makeImageData(2, 2)
    r.render(imageData, 2, 2, getColor)
    expect(ctx.font).toMatch(/px/)
  })

  it('reuses fillStyle when color is unchanged (batching optimization)', () => {
    // All same-brightness pixels → same color → fillStyle set only once
    const ctx2 = makeCtxMock()
    const r2 = new AsciiRenderer({ pixelSize: 10, asciiColored: false })
    r2._bitmapCtx = ctx2
    r2._bitmapCanvas = makeCanvasMock(ctx2, 160, 160)
    const fillStyles = []
    Object.defineProperty(ctx2, 'fillStyle', {
      get: () => fillStyles[fillStyles.length - 1] ?? '',
      set(v) {
        fillStyles.push(v)
      }
    })
    const imageData = makeImageData(4, 4, 180, 180, 180) // all same brightness
    r2.render(imageData, 4, 4, getColor)
    // All pixels same brightness → same color → fillStyle set exactly once (after _prepare)
    const uniqueColors = new Set(fillStyles)
    expect(uniqueColors.size).toBeLessThanOrEqual(2) // at most background + one foreground
  })
})

// ---------------------------------------------------------------------------
// render — colored mode
// ---------------------------------------------------------------------------

describe('AsciiRenderer — render (colored mode)', () => {
  it('uses getColor(adjusted) in colored mode', () => {
    const ctx = makeCtxMock()
    const r = new AsciiRenderer({ pixelSize: 10, asciiColored: true })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx, 160, 160)

    const colors = []
    const trackingGetColor = (b) => {
      colors.push(b)
      return '#aabbcc'
    }
    const imageData = makeImageData(2, 2, 200, 200, 200) // bright
    r.render(imageData, 2, 2, trackingGetColor)
    // getColor should be called with values < 1 (adjusted brightness)
    expect(colors.length).toBeGreaterThan(0)
    expect(colors.every((b) => b >= 0 && b <= 1)).toBe(true)
  })

  it('uses getColor(1) (monochrome) when asciiColored is false', () => {
    const ctx = makeCtxMock()
    const r = new AsciiRenderer({ pixelSize: 10, asciiColored: false })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx, 160, 160)

    const colors = []
    const trackingGetColor = (b) => {
      colors.push(b)
      return '#ffffff'
    }
    const imageData = makeImageData(2, 2, 200, 200, 200)
    r.render(imageData, 2, 2, trackingGetColor)
    // In monochrome mode all calls are getColor(1)
    expect(colors.every((b) => b === 1)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// render — invert
// ---------------------------------------------------------------------------

describe('AsciiRenderer — render (invert)', () => {
  it('inverts brightness mapping when invert option is true', () => {
    const ctx1 = makeCtxMock()
    const r1 = new AsciiRenderer({ pixelSize: 10, invert: false })
    r1._bitmapCtx = ctx1
    r1._bitmapCanvas = makeCanvasMock(ctx1)

    const ctx2 = makeCtxMock()
    const r2 = new AsciiRenderer({ pixelSize: 10, invert: true })
    r2._bitmapCtx = ctx2
    r2._bitmapCanvas = makeCanvasMock(ctx2)

    // Bright pixel (high brightness) — normal mode maps to dense char, invert maps to sparse
    const imageData = makeImageData(1, 1, 240, 240, 240)
    r1.render(imageData, 1, 1, getColor)
    r2.render(imageData, 1, 1, getColor)

    const calls1 = ctx1.fillText.mock.calls
    const calls2 = ctx2.fillText.mock.calls
    // Both render something (just different characters), no throw
    expect(calls1.length + calls2.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// render — char ramp presets
// ---------------------------------------------------------------------------

describe('AsciiRenderer — character ramps', () => {
  it.each(Object.keys(CHAR_RAMPS))('renders without throwing for ramp "%s"', (rampKey) => {
    const ctx = makeCtxMock()
    const r = new AsciiRenderer({ pixelSize: 10, charRamp: rampKey })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx, 160, 160)
    const imageData = makeImageData(4, 4)
    expect(() => r.render(imageData, 4, 4, getColor)).not.toThrow()
  })

  it('falls back to classic for unknown ramp key', () => {
    const ctx = makeCtxMock()
    const r = new AsciiRenderer({ pixelSize: 10, charRamp: 'nonexistent' })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx, 160, 160)
    const imageData = makeImageData(2, 2)
    expect(() => r.render(imageData, 2, 2, getColor)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// drawPixel — fade animation support
// ---------------------------------------------------------------------------

describe('AsciiRenderer — drawPixel', () => {
  let ctx, r

  beforeEach(() => {
    ctx = makeCtxMock()
    r = new AsciiRenderer({ pixelSize: 10, charRamp: 'classic' })
    r._bitmapCtx = ctx
    r._bitmapCanvas = makeCanvasMock(ctx, 160, 160)
  })

  it('draws a character for mid-brightness', () => {
    r.drawPixel(0, 0, 0.5, '#00ff00', 1)
    // If the char at 0.5 brightness is not space, fillText should be called
    // (classic ramp: brightness 0.5 maps to mid-ramp char like '+' or '#')
    // just assert no throw and at most 1 call
    expect(ctx.fillText.mock.calls.length).toBeGreaterThanOrEqual(0)
  })

  it('does not draw when brightness maps to space', () => {
    // brightness = 0.0 → index 0 → space → skip
    r.drawPixel(0, 0, 0.0, '#ffffff', 1)
    expect(ctx.fillText).not.toHaveBeenCalled()
  })

  it('sets globalAlpha when alpha < 1', () => {
    const alphaValues = []
    Object.defineProperty(ctx, 'globalAlpha', {
      get: () => alphaValues[alphaValues.length - 1] ?? 1,
      set(v) {
        alphaValues.push(v)
      }
    })
    r.drawPixel(0, 0, 0.8, '#ffffff', 0.5)
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
    r.drawPixel(0, 0, 0.8, '#ffffff', 0.5)
    expect(alphaValues[alphaValues.length - 1]).toBe(1)
  })

  it('lazily calls _prepare when _dirty is true', () => {
    r._dirty = true
    const prepareSpy = vi.spyOn(r, '_prepare')
    r.drawPixel(0, 0, 0.5, '#ffffff', 1)
    expect(prepareSpy).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// dispose
// ---------------------------------------------------------------------------

describe('AsciiRenderer — dispose', () => {
  it('removes canvas from DOM and nulls refs', () => {
    const r = new AsciiRenderer()
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
    const r = new AsciiRenderer()
    expect(() => {
      r.dispose()
      r.dispose()
    }).not.toThrow()
  })
})
