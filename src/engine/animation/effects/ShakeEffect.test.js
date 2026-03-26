import { describe, it, expect, beforeEach } from 'vitest'
import { ShakeEffect } from './ShakeEffect.js'

function makeTarget() {
  return { position: { x: 0, y: 0, z: 0 } }
}

describe('ShakeEffect', () => {
  let effect
  let target

  beforeEach(() => {
    effect = new ShakeEffect()
    target = makeTarget()
  })

  it('update() applies non-zero offsets at non-zero time', () => {
    effect.update(target, 0.016, 1, { time: 1.5 })
    // position.x or position.z should be non-zero (extremely unlikely both are exactly 0)
    expect(Math.abs(target.position.x) + Math.abs(target.position.z)).toBeGreaterThan(0)
  })

  it('update() is deterministic — same time gives same offsets', () => {
    const context = { time: 2.3 }
    effect.update(target, 0.016, 1, context)
    const x1 = target.position.x
    const z1 = target.position.z

    const target2 = makeTarget()
    effect.update(target2, 0.016, 1, context)
    expect(target2.position.x).toBeCloseTo(x1)
    expect(target2.position.z).toBeCloseTo(z1)
  })

  it('update() gives different offsets at different times', () => {
    effect.update(target, 0.016, 1, { time: 1.0 })
    const x1 = target.position.x
    const z1 = target.position.z

    effect.update(target, 0.016, 1, { time: 99.0 })
    const x2 = target.position.x
    const z2 = target.position.z

    // Extremely unlikely to be identical across different time seeds
    expect(x1 !== x2 || z1 !== z2).toBe(true)
  })

  it('checkReset() snaps position to 0 immediately on toggle-off', () => {
    effect.update(target, 0.016, 1, { time: 5 })
    expect(Math.abs(target.position.x) + Math.abs(target.position.z)).toBeGreaterThan(0)
    effect.checkReset(false, true, target, {})
    expect(target.position.x).toBe(0)
    expect(target.position.z).toBe(0)
  })

  it('applyReset() always returns false (no lerp needed)', () => {
    expect(effect.applyReset(target, 0.1)).toBe(false)
  })

  it('update() is a no-op when target.position is null', () => {
    const nullTarget = { position: null }
    expect(() => effect.update(nullTarget, 0.016, 1, { time: 1 })).not.toThrow()
  })
})
