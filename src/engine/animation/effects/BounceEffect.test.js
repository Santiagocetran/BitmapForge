import { describe, it, expect, beforeEach } from 'vitest'
import { BounceEffect } from './BounceEffect.js'

function makeTarget() {
  return { position: { x: 0, y: 0, z: 0 } }
}

describe('BounceEffect', () => {
  let effect
  let target

  beforeEach(() => {
    effect = new BounceEffect()
    target = makeTarget()
  })

  it('update() sets position.y = |sin(time * speed * 1.8)| * 0.5', () => {
    const speed = 1
    const context = { time: 1 }
    effect.update(target, 0.016, speed, context)
    const expected = Math.abs(Math.sin(1 * speed * 1.8)) * 0.5
    expect(target.position.y).toBeCloseTo(expected)
  })

  it('seekTo() sets position.y analytically', () => {
    const speed = 1.5
    effect.seekTo(target, 2, speed, {})
    const expected = Math.abs(Math.sin(2 * speed * 1.8)) * 0.5
    expect(target.position.y).toBeCloseTo(expected)
  })

  it('update() is a no-op when target.position is null', () => {
    const nullTarget = { position: null }
    expect(() => effect.update(nullTarget, 0.016, 1, { time: 0 })).not.toThrow()
  })

  it('checkReset() initiates reset when toggled off', () => {
    target.position.y = 0.4
    effect.checkReset(false, true, target, {})
    expect(effect._reset).not.toBeNull()
    expect(effect._reset.startValue).toBeCloseTo(0.4)
    expect(effect._reset.elapsed).toBe(0)
  })

  it('checkReset() clears reset when toggled back on', () => {
    target.position.y = 0.4
    effect.checkReset(false, true, target, {})
    effect.checkReset(true, false, target, {})
    expect(effect._reset).toBeNull()
  })

  it('applyReset() lerps position.y to 0 and returns false after duration', () => {
    target.position.y = 0.4
    effect.checkReset(false, true, target, {})
    effect.applyReset(target, 0.31)
    expect(target.position.y).toBe(0)
    expect(effect._reset).toBeNull()
  })
})
