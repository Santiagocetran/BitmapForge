import { describe, it, expect, beforeEach } from 'vitest'
import { createAnimationSlice, ANIMATION_DEFAULTS } from './animationSlice.js'

function makeSlice() {
  let state = { ...ANIMATION_DEFAULTS }
  const set = (update) => {
    state = typeof update === 'function' ? { ...state, ...update(state) } : { ...state, ...update }
  }
  const get = () => state
  const slice = createAnimationSlice(set, get)
  state = { ...state, ...slice }
  return { slice, getState: get }
}

describe('animationSlice', () => {
  let slice
  let getState

  beforeEach(() => {
    ;({ slice, getState } = makeSlice())
  })

  it('ANIMATION_DEFAULTS has expected shape', () => {
    expect(typeof ANIMATION_DEFAULTS.useFadeInOut).toBe('boolean')
    expect(typeof ANIMATION_DEFAULTS.animationSpeed).toBe('number')
    expect(typeof ANIMATION_DEFAULTS.animationEffects).toBe('object')
    expect(typeof ANIMATION_DEFAULTS.showPhaseDuration).toBe('number')
    expect(typeof ANIMATION_DEFAULTS.animationDuration).toBe('number')
  })

  it('setAnimationSpeed clamps at 0.01 minimum', () => {
    slice.setAnimationSpeed(0)
    expect(getState().animationSpeed).toBeCloseTo(0.01)
    slice.setAnimationSpeed(-5)
    expect(getState().animationSpeed).toBeCloseTo(0.01)
    slice.setAnimationSpeed(2)
    expect(getState().animationSpeed).toBeCloseTo(2)
  })

  it('setShowPhaseDuration clamps at 100 minimum', () => {
    slice.setShowPhaseDuration(0)
    expect(getState().showPhaseDuration).toBe(100)
    slice.setShowPhaseDuration(50)
    expect(getState().showPhaseDuration).toBe(100)
    slice.setShowPhaseDuration(5000)
    expect(getState().showPhaseDuration).toBe(5000)
  })

  it('setAnimationDuration clamps at 100 minimum', () => {
    slice.setAnimationDuration(0)
    expect(getState().animationDuration).toBe(100)
    slice.setAnimationDuration(1000)
    expect(getState().animationDuration).toBe(1000)
  })

  it('setAnimationEffect toggles individual effect boolean', () => {
    const initial = getState().animationEffects
    const key = Object.keys(initial)[0]
    const before = initial[key]
    slice.setAnimationEffect(key, !before)
    expect(getState().animationEffects[key]).toBe(!before)
    // Other keys unchanged
    const otherKey = Object.keys(initial).find((k) => k !== key)
    if (otherKey) {
      expect(getState().animationEffects[otherKey]).toBe(initial[otherKey])
    }
  })

  it('setAnimationEffect coerces value to boolean', () => {
    const key = Object.keys(ANIMATION_DEFAULTS.animationEffects)[0]
    slice.setAnimationEffect(key, 1)
    expect(getState().animationEffects[key]).toBe(true)
    slice.setAnimationEffect(key, 0)
    expect(getState().animationEffects[key]).toBe(false)
  })

  it('setUseFadeInOut sets the value', () => {
    slice.setUseFadeInOut(false)
    expect(getState().useFadeInOut).toBe(false)
    slice.setUseFadeInOut(true)
    expect(getState().useFadeInOut).toBe(true)
  })
})
