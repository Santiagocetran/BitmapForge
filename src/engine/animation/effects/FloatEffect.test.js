import { describe, it, expect, beforeEach } from 'vitest'
import { FloatEffect } from './FloatEffect.js'

function makeTarget() {
  return { rotation: { x: 0, y: 0, z: 0 } }
}

function makeContext(overrides = {}) {
  return { time: 0, animationEffects: { spinX: false, spinZ: false }, ...overrides }
}

describe('FloatEffect', () => {
  let effect
  let target

  beforeEach(() => {
    effect = new FloatEffect()
    target = makeTarget()
  })

  it('update() modifies rotation.x and rotation.z', () => {
    const context = makeContext({ time: 1 })
    effect.update(target, 0.1, 1, context)
    expect(target.rotation.x).not.toBe(0)
    expect(target.rotation.z).not.toBe(0)
  })

  it('isResettingX and isResettingZ are false initially', () => {
    expect(effect.isResettingX).toBe(false)
    expect(effect.isResettingZ).toBe(false)
  })

  it('checkReset() initiates both resets when toggled off without active spins', () => {
    target.rotation.x = 0.3
    target.rotation.z = 0.2
    effect.checkReset(false, true, target, makeContext())
    expect(effect.isResettingX).toBe(true)
    expect(effect.isResettingZ).toBe(true)
    expect(effect._resetX.startRotation).toBeCloseTo(0.3)
    expect(effect._resetZ.startRotation).toBeCloseTo(0.2)
  })

  it('checkReset() does NOT reset x-axis when spinX is active', () => {
    target.rotation.x = 0.3
    target.rotation.z = 0.2
    const context = makeContext({ animationEffects: { spinX: true, spinZ: false } })
    effect.checkReset(false, true, target, context)
    expect(effect.isResettingX).toBe(false)
    expect(effect.isResettingZ).toBe(true)
  })

  it('checkReset() does NOT reset z-axis when spinZ is active', () => {
    target.rotation.x = 0.3
    target.rotation.z = 0.2
    const context = makeContext({ animationEffects: { spinX: false, spinZ: true } })
    effect.checkReset(false, true, target, context)
    expect(effect.isResettingX).toBe(true)
    expect(effect.isResettingZ).toBe(false)
  })

  it('checkReset() cancels resets when float is re-enabled', () => {
    target.rotation.x = 0.3
    target.rotation.z = 0.2
    effect.checkReset(false, true, target, makeContext())
    expect(effect.isResettingX).toBe(true)
    effect.checkReset(true, false, target, makeContext())
    expect(effect.isResettingX).toBe(false)
    expect(effect.isResettingZ).toBe(false)
  })

  it('applyReset() returns false and clears state after 0.3 s', () => {
    target.rotation.x = 1.0
    target.rotation.z = 1.0
    effect.checkReset(false, true, target, makeContext())
    const still = effect.applyReset(target, 0.31)
    expect(still).toBe(false)
    expect(target.rotation.x).toBe(0)
    expect(target.rotation.z).toBe(0)
    expect(effect.isResettingX).toBe(false)
    expect(effect.isResettingZ).toBe(false)
  })

  it('clearReset() clears both axes', () => {
    target.rotation.x = 0.5
    target.rotation.z = 0.5
    effect.checkReset(false, true, target, makeContext())
    effect.clearReset()
    expect(effect.isResettingX).toBe(false)
    expect(effect.isResettingZ).toBe(false)
  })
})
