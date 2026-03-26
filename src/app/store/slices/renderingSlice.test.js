import { describe, it, expect, beforeEach } from 'vitest'
import { createRenderingSlice, RENDERING_DEFAULTS } from './renderingSlice.js'

function makeSlice() {
  let state = { ...RENDERING_DEFAULTS }
  const set = (update) => {
    state = typeof update === 'function' ? { ...state, ...update(state) } : { ...state, ...update }
  }
  const get = () => state
  const slice = createRenderingSlice(set, get)
  state = { ...state, ...slice }
  return { slice, getState: get }
}

describe('renderingSlice', () => {
  let slice
  let getState

  beforeEach(() => {
    ;({ slice, getState } = makeSlice())
  })

  it('RENDERING_DEFAULTS has expected shape', () => {
    expect(RENDERING_DEFAULTS.colors).toBeDefined()
    expect(RENDERING_DEFAULTS.pixelSize).toBe(3)
    expect(RENDERING_DEFAULTS.ditherType).toBe('bayer4x4')
    expect(RENDERING_DEFAULTS.renderMode).toBe('bitmap')
  })

  it('setPixelSize clamps to [1, 32]', () => {
    slice.setPixelSize(0)
    expect(getState().pixelSize).toBe(1)
    slice.setPixelSize(100)
    expect(getState().pixelSize).toBe(32)
    slice.setPixelSize(8)
    expect(getState().pixelSize).toBe(8)
  })

  it('setMinBrightness clamps to [0.01, 0.5]', () => {
    slice.setMinBrightness(0)
    expect(getState().minBrightness).toBeCloseTo(0.01)
    slice.setMinBrightness(1)
    expect(getState().minBrightness).toBeCloseTo(0.5)
    slice.setMinBrightness(0.1)
    expect(getState().minBrightness).toBeCloseTo(0.1)
  })

  it('setRenderMode("ascii") bumps pixelSize to 10 when below 8', () => {
    slice.setPixelSize(4)
    slice.setRenderMode('ascii')
    expect(getState().renderMode).toBe('ascii')
    expect(getState().pixelSize).toBe(10)
  })

  it('setRenderMode("bitmap") does not change pixelSize', () => {
    slice.setPixelSize(4)
    slice.setRenderMode('bitmap')
    expect(getState().renderMode).toBe('bitmap')
    expect(getState().pixelSize).toBe(4)
  })

  it('addColor appends a color up to 6 max', () => {
    const initial = getState().colors.length
    slice.addColor('#ff0000')
    expect(getState().colors.length).toBe(initial + 1)
    // Add until at 6
    while (getState().colors.length < 6) slice.addColor('#000000')
    const before = getState().colors.length
    slice.addColor('#ffffff')
    expect(getState().colors.length).toBe(before) // no change at 6
  })

  it('removeColor removes a color but enforces minimum of 2', () => {
    // Reduce to 2 colors
    while (getState().colors.length > 2) slice.removeColor(0)
    expect(getState().colors.length).toBe(2)
    slice.removeColor(0)
    expect(getState().colors.length).toBe(2) // still 2
  })

  it('setColorAt changes a single color', () => {
    slice.setColorAt(0, '#aabbcc')
    expect(getState().colors[0]).toBe('#aabbcc')
  })

  it('reorderColors moves a color to a new position', () => {
    slice.setColors(['#000000', '#111111', '#222222'])
    slice.reorderColors(0, 2)
    expect(getState().colors[2]).toBe('#000000')
  })

  it('setHalftoneAngle clamps to [0, 179]', () => {
    slice.setHalftoneAngle(-5)
    expect(getState().halftoneAngle).toBe(0)
    slice.setHalftoneAngle(200)
    expect(getState().halftoneAngle).toBe(179)
    slice.setHalftoneAngle(45)
    expect(getState().halftoneAngle).toBe(45)
  })

  it('setLedGap clamps to [0, 4]', () => {
    slice.setLedGap(-1)
    expect(getState().ledGap).toBe(0)
    slice.setLedGap(10)
    expect(getState().ledGap).toBe(4)
    slice.setLedGap(2)
    expect(getState().ledGap).toBe(2)
  })
})
