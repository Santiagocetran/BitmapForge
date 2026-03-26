import { describe, it, expect, beforeEach } from 'vitest'
import { SpinEffect } from './SpinEffect.js'

function makeTarget() {
  return { rotation: { x: 0, y: 0, z: 0 } }
}

describe('SpinEffect', () => {
  let effect
  let target

  beforeEach(() => {
    effect = new SpinEffect('y')
    target = makeTarget()
  })

  it('update() increments rotation by speed * delta', () => {
    effect.update(target, 0.1, 2, {})
    expect(target.rotation.y).toBeCloseTo(0.2)
  })

  it('update() uses the correct axis', () => {
    const fx = new SpinEffect('x')
    const fz = new SpinEffect('z')
    const tx = makeTarget()
    const tz = makeTarget()
    fx.update(tx, 0.1, 1, {})
    fz.update(tz, 0.1, 1, {})
    expect(tx.rotation.x).toBeCloseTo(0.1)
    expect(tz.rotation.z).toBeCloseTo(0.1)
    expect(tx.rotation.y).toBe(0)
    expect(tz.rotation.y).toBe(0)
  })

  it('seekTo() adds speed * time to rotation', () => {
    effect.seekTo(target, 3, 2, {})
    expect(target.rotation.y).toBeCloseTo(6)
  })

  it('checkReset() starts a reset when toggled off', () => {
    target.rotation.y = 1.5
    effect.checkReset(false, true, target, {})
    expect(effect.isResetting).toBe(true)
    expect(effect._reset.startRotation).toBeCloseTo(1.5)
    expect(effect._reset.elapsed).toBe(0)
  })

  it('checkReset() clears reset when toggled back on', () => {
    target.rotation.y = 1.5
    effect.checkReset(false, true, target, {})
    expect(effect.isResetting).toBe(true)
    effect.checkReset(true, false, target, {})
    expect(effect.isResetting).toBe(false)
  })

  it('applyReset() lerps rotation toward 0 and returns true while in progress', () => {
    target.rotation.y = 1.0
    effect.checkReset(false, true, target, {})
    const still = effect.applyReset(target, 0.05)
    expect(still).toBe(true)
    expect(target.rotation.y).toBeLessThan(1.0)
    expect(target.rotation.y).toBeGreaterThan(0)
  })

  it('applyReset() zeroes rotation and returns false after 0.3 s', () => {
    target.rotation.y = 1.0
    effect.checkReset(false, true, target, {})
    effect.applyReset(target, 0.31)
    expect(target.rotation.y).toBe(0)
    expect(effect.isResetting).toBe(false)
  })

  it('clearReset() clears state', () => {
    target.rotation.y = 1.0
    effect.checkReset(false, true, target, {})
    effect.clearReset()
    expect(effect.isResetting).toBe(false)
  })

  it('isResetting getter returns false initially', () => {
    expect(effect.isResetting).toBe(false)
  })
})
