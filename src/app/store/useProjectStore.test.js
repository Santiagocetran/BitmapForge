import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore, DEFAULT_STATE } from './useProjectStore.js'

describe('useProjectStore', () => {
  beforeEach(() => {
    useProjectStore.getState().resetToDefaults()
  })

  it('DEFAULT_STATE has expected shape', () => {
    expect(DEFAULT_STATE).toHaveProperty('model')
    expect(DEFAULT_STATE).toHaveProperty('colors')
    expect(DEFAULT_STATE).toHaveProperty('pixelSize')
    expect(DEFAULT_STATE).toHaveProperty('ditherType')
    expect(DEFAULT_STATE).toHaveProperty('animationEffects')
    expect(DEFAULT_STATE).toHaveProperty('animationSpeed')
    expect(DEFAULT_STATE).toHaveProperty('lightDirection')
    expect(DEFAULT_STATE).toHaveProperty('status')
  })

  it('addColor guards at max 6', () => {
    const store = useProjectStore.getState()
    // Default has 4 colors
    store.addColor('#111111')
    store.addColor('#222222')
    expect(useProjectStore.getState().colors).toHaveLength(6)
    store.addColor('#333333')
    expect(useProjectStore.getState().colors).toHaveLength(6)
  })

  it('removeColor guards at min 2', () => {
    const store = useProjectStore.getState()
    // Default has 4 colors — remove down to 2
    store.removeColor(0)
    store.removeColor(0)
    expect(useProjectStore.getState().colors).toHaveLength(2)
    store.removeColor(0)
    expect(useProjectStore.getState().colors).toHaveLength(2)
  })

  it('reorderColors swaps correctly', () => {
    const original = [...useProjectStore.getState().colors]
    useProjectStore.getState().reorderColors(0, 2)
    const reordered = useProjectStore.getState().colors
    expect(reordered[2]).toBe(original[0])
  })

  it('setPixelSize clamps 1-20', () => {
    useProjectStore.getState().setPixelSize(0)
    expect(useProjectStore.getState().pixelSize).toBe(1)
    useProjectStore.getState().setPixelSize(50)
    expect(useProjectStore.getState().pixelSize).toBe(20)
  })

  it('setMinBrightness clamps 0.01-0.5', () => {
    useProjectStore.getState().setMinBrightness(0)
    expect(useProjectStore.getState().minBrightness).toBe(0.01)
    useProjectStore.getState().setMinBrightness(1)
    expect(useProjectStore.getState().minBrightness).toBe(0.5)
  })

  it('setAnimationSpeed clamps at 0.01', () => {
    useProjectStore.getState().setAnimationSpeed(-5)
    expect(useProjectStore.getState().animationSpeed).toBe(0.01)
  })

  it('resetToDefaults restores full default state', () => {
    useProjectStore.getState().setPixelSize(15)
    useProjectStore.getState().setAnimationSpeed(2)
    useProjectStore.getState().resetToDefaults()
    const state = useProjectStore.getState()
    expect(state.pixelSize).toBe(DEFAULT_STATE.pixelSize)
    expect(state.animationSpeed).toBe(DEFAULT_STATE.animationSpeed)
  })
})
