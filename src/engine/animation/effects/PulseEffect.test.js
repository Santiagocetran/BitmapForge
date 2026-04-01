import { describe, it, expect, beforeEach } from 'vitest'
import { PulseEffect } from './PulseEffect.js'

function makeTarget(scaleValue = 1) {
  let _s = scaleValue
  return {
    scale: {
      get x() {
        return _s
      },
      setScalar(v) {
        _s = v
      }
    }
  }
}

describe('PulseEffect', () => {
  let effect
  let target

  beforeEach(() => {
    effect = new PulseEffect()
    target = makeTarget()
  })

  it('update() sets scale via 1 + sin(time * speed * 1.5) * 0.12', () => {
    const speed = 1
    const context = { time: 1 }
    effect.update(target, 0.016, speed, context)
    const expected = 1 + Math.sin(1 * speed * 1.5) * 0.12
    expect(target.scale.x).toBeCloseTo(expected)
  })

  it('seekTo() sets scale analytically', () => {
    const speed = 2
    effect.seekTo(target, 0.5, speed, {})
    const expected = 1 + Math.sin(0.5 * speed * 1.5) * 0.12
    expect(target.scale.x).toBeCloseTo(expected)
  })

  it('checkReset() initiates reset when toggled off', () => {
    // Set scale to a known value first
    effect.update(target, 0, 1, { time: Math.PI / 3 })
    const scaleBefore = target.scale.x
    effect.checkReset(false, true, target, {})
    expect(effect._reset).not.toBeNull()
    expect(effect._reset.startValue).toBeCloseTo(scaleBefore)
    expect(effect._reset.elapsed).toBe(0)
  })

  it('checkReset() clears reset when toggled back on', () => {
    effect.update(target, 0, 1, { time: 1 })
    effect.checkReset(false, true, target, {})
    expect(effect._reset).not.toBeNull()
    effect.checkReset(true, false, target, {})
    expect(effect._reset).toBeNull()
  })

  it('applyReset() lerps scale toward 1 and returns false after duration', () => {
    effect.update(target, 0, 1, { time: 1 })
    effect.checkReset(false, true, target, {})
    const still = effect.applyReset(target, 0.31)
    expect(still).toBe(false)
    expect(target.scale.x).toBeCloseTo(1)
    expect(effect._reset).toBeNull()
  })

  it('applyReset() is in progress before duration completes', () => {
    effect.update(target, 0, 1, { time: 1 })
    effect.checkReset(false, true, target, {})
    const still = effect.applyReset(target, 0.05)
    expect(still).toBe(true)
  })

  it('clearReset() clears state', () => {
    effect.update(target, 0, 1, { time: 1 })
    effect.checkReset(false, true, target, {})
    effect.clearReset()
    expect(effect._reset).toBeNull()
  })
})
