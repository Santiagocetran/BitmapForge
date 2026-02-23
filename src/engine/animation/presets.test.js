import { describe, it, expect } from 'vitest'
import { ANIMATION_PRESETS } from './presets.js'

describe('ANIMATION_PRESETS', () => {
  const expectedKeys = ['spinY', 'spinX', 'spinZ', 'float', 'fadeInOut']

  it('has all expected preset keys', () => {
    expectedKeys.forEach((key) => {
      expect(ANIMATION_PRESETS).toHaveProperty(key)
    })
  })

  it('each preset has a key matching its object key and a type field', () => {
    Object.entries(ANIMATION_PRESETS).forEach(([name, preset]) => {
      expect(preset.key).toBe(name)
      expect(typeof preset.type).toBe('string')
    })
  })

  it('spin presets have axis and defaultSpeed', () => {
    ;['spinY', 'spinX', 'spinZ'].forEach((name) => {
      const preset = ANIMATION_PRESETS[name]
      expect(preset.type).toBe('spin')
      expect(typeof preset.axis).toBe('string')
      expect(typeof preset.defaultSpeed).toBe('number')
    })
  })

  it('float preset has oscillateX and oscillateZ', () => {
    const f = ANIMATION_PRESETS.float
    expect(typeof f.oscillateX).toBe('number')
    expect(typeof f.oscillateZ).toBe('number')
  })
})
