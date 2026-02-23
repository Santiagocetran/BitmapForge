import { describe, it, expect } from 'vitest'
import { ANIMATION_EFFECT_KEYS, DEFAULT_ANIMATION_EFFECTS } from './effectTypes.js'

describe('effectTypes', () => {
  it('ANIMATION_EFFECT_KEYS is a 4-element array', () => {
    expect(Array.isArray(ANIMATION_EFFECT_KEYS)).toBe(true)
    expect(ANIMATION_EFFECT_KEYS).toHaveLength(4)
  })

  it('DEFAULT_ANIMATION_EFFECTS has spinY=true and rest false', () => {
    expect(DEFAULT_ANIMATION_EFFECTS.spinY).toBe(true)
    expect(DEFAULT_ANIMATION_EFFECTS.spinX).toBe(false)
    expect(DEFAULT_ANIMATION_EFFECTS.spinZ).toBe(false)
    expect(DEFAULT_ANIMATION_EFFECTS.float).toBe(false)
  })

  it('both are frozen', () => {
    expect(Object.isFrozen(ANIMATION_EFFECT_KEYS)).toBe(true)
    expect(Object.isFrozen(DEFAULT_ANIMATION_EFFECTS)).toBe(true)
  })
})
