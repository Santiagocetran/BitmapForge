import { describe, it, expect } from 'vitest'
import { ANIMATION_EFFECT_KEYS, DEFAULT_ANIMATION_EFFECTS } from './effectTypes.js'

describe('effectTypes', () => {
  it('ANIMATION_EFFECT_KEYS contains all expected effects', () => {
    expect(Array.isArray(ANIMATION_EFFECT_KEYS)).toBe(true)
    expect(ANIMATION_EFFECT_KEYS).toHaveLength(8)
    expect(ANIMATION_EFFECT_KEYS).toContain('spinX')
    expect(ANIMATION_EFFECT_KEYS).toContain('spinY')
    expect(ANIMATION_EFFECT_KEYS).toContain('spinZ')
    expect(ANIMATION_EFFECT_KEYS).toContain('float')
    expect(ANIMATION_EFFECT_KEYS).toContain('bounce')
    expect(ANIMATION_EFFECT_KEYS).toContain('pulse')
    expect(ANIMATION_EFFECT_KEYS).toContain('shake')
    expect(ANIMATION_EFFECT_KEYS).toContain('orbit')
  })

  it('DEFAULT_ANIMATION_EFFECTS has spinY=true and rest false', () => {
    expect(DEFAULT_ANIMATION_EFFECTS.spinY).toBe(true)
    expect(DEFAULT_ANIMATION_EFFECTS.spinX).toBe(false)
    expect(DEFAULT_ANIMATION_EFFECTS.spinZ).toBe(false)
    expect(DEFAULT_ANIMATION_EFFECTS.float).toBe(false)
    expect(DEFAULT_ANIMATION_EFFECTS.bounce).toBe(false)
    expect(DEFAULT_ANIMATION_EFFECTS.pulse).toBe(false)
    expect(DEFAULT_ANIMATION_EFFECTS.shake).toBe(false)
    expect(DEFAULT_ANIMATION_EFFECTS.orbit).toBe(false)
  })

  it('both are frozen', () => {
    expect(Object.isFrozen(ANIMATION_EFFECT_KEYS)).toBe(true)
    expect(Object.isFrozen(DEFAULT_ANIMATION_EFFECTS)).toBe(true)
  })
})
