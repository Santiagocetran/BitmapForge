import { describe, it, expect } from 'vitest'
import { AnimationEngine } from './AnimationEngine.js'

describe('AnimationEngine', () => {
  it('constructor sets sensible defaults', () => {
    const engine = new AnimationEngine()
    expect(engine.useFadeInOut).toBe(true)
    expect(engine.speed).toBeGreaterThan(0)
    expect(engine.animationEffects).toBeDefined()
    expect(engine.animationEffects.spinY).toBe(true)
  })

  it('setFadeOptions merges options correctly', () => {
    const engine = new AnimationEngine()
    engine.setFadeOptions({ animationSpeed: 1.5, animationEffects: { spinX: true } })
    expect(engine.speed).toBe(1.5)
    expect(engine.animationEffects.spinX).toBe(true)
    expect(engine.animationEffects.spinY).toBe(true)
  })

  it('getLoopDurationMs returns positive number', () => {
    const engine = new AnimationEngine()
    expect(engine.getLoopDurationMs()).toBeGreaterThan(0)
  })

  it('resetToStart zeroes time', () => {
    const engine = new AnimationEngine()
    engine.time = 999
    engine.phaseStartTime = 123
    engine.resetToStart()
    expect(engine.time).toBe(0)
    expect(engine.phaseStartTime).toBe(0)
  })

  it('applyEffects changes rotation when spinY is enabled', () => {
    const engine = new AnimationEngine()
    const mockGroup = { rotation: { x: 0, y: 0, z: 0 } }
    engine.applyEffects(mockGroup, 1 / 60)
    expect(mockGroup.rotation.y).not.toBe(0)
  })
})
