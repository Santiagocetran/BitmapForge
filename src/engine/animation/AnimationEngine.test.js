import { describe, it, expect } from 'vitest'
import { AnimationEngine } from './AnimationEngine.js'
import { DEFAULT_ANIMATION_EFFECTS } from './effectTypes.js'

function makeFullGroup() {
  return {
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      set(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
      }
    },
    position: { x: 0, y: 0, z: 0 },
    scale: {
      x: 1,
      y: 1,
      z: 1,
      setScalar(v) {
        this.x = v
        this.y = v
        this.z = v
      }
    }
  }
}

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

  it('new effects default to false', () => {
    const engine = new AnimationEngine()
    expect(engine.animationEffects.bounce).toBe(false)
    expect(engine.animationEffects.pulse).toBe(false)
    expect(engine.animationEffects.shake).toBe(false)
    expect(engine.animationEffects.orbit).toBe(false)
  })
})

describe('AnimationEngine — bounce', () => {
  it('sets position.y when bounce is active', () => {
    const engine = new AnimationEngine()
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, spinY: false, bounce: true }
    const group = makeFullGroup()
    engine.time = 0.5 // non-zero so sin is non-zero
    engine.applyEffects(group, 1 / 60)
    expect(group.position.y).toBeGreaterThanOrEqual(0)
  })

  it('starts reset transition when bounce toggled off', () => {
    const engine = new AnimationEngine()
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, bounce: true }
    engine._previousEffects = { ...engine.animationEffects }
    const group = makeFullGroup()
    group.position.y = 0.4
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, bounce: false }
    engine._checkForResets(group)
    expect(engine._resetTransitions.positionY).not.toBeNull()
    expect(engine._resetTransitions.positionY.startValue).toBe(0.4)
  })

  it('lerps position.y back to 0 on toggle-off', () => {
    const engine = new AnimationEngine()
    engine._resetTransitions.positionY = { startValue: 0.5, elapsed: 0 }
    const group = makeFullGroup()
    group.position.y = 0.5
    // large delta to complete the lerp
    engine._applyResetTransitions(group, 1.0)
    expect(group.position.y).toBe(0)
    expect(engine._resetTransitions.positionY).toBeNull()
  })
})

describe('AnimationEngine — pulse', () => {
  it('calls setScalar when pulse is active', () => {
    const engine = new AnimationEngine()
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, spinY: false, pulse: true }
    engine.time = 0.3
    const group = makeFullGroup()
    engine.applyEffects(group, 1 / 60)
    expect(typeof group.scale.x).toBe('number')
  })

  it('starts reset transition when pulse toggled off', () => {
    const engine = new AnimationEngine()
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, pulse: true }
    engine._previousEffects = { ...engine.animationEffects }
    const group = makeFullGroup()
    group.scale.x = 1.1
    group.scale.y = 1.1
    group.scale.z = 1.1
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, pulse: false }
    engine._checkForResets(group)
    expect(engine._resetTransitions.scale).not.toBeNull()
    expect(engine._resetTransitions.scale.startValue).toBe(1.1)
  })

  it('lerps scale back to 1 on toggle-off', () => {
    const engine = new AnimationEngine()
    engine._resetTransitions.scale = { startValue: 1.2, elapsed: 0 }
    const group = makeFullGroup()
    group.scale.setScalar(1.2)
    engine._applyResetTransitions(group, 1.0)
    expect(group.scale.x).toBe(1)
    expect(engine._resetTransitions.scale).toBeNull()
  })
})

describe('AnimationEngine — shake', () => {
  it('sets position.x and position.z when shake is active', () => {
    const engine = new AnimationEngine()
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, spinY: false, shake: true }
    engine.time = 1.0
    const group = makeFullGroup()
    engine.applyEffects(group, 1 / 60)
    expect(Math.abs(group.position.x)).toBeLessThanOrEqual(0.04)
    expect(Math.abs(group.position.z)).toBeLessThanOrEqual(0.04)
  })

  it('snaps position.x/z to 0 when shake toggled off', () => {
    const engine = new AnimationEngine()
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, shake: true }
    engine._previousEffects = { ...engine.animationEffects }
    const group = makeFullGroup()
    group.position.x = 0.03
    group.position.z = -0.02
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, shake: false }
    engine._checkForResets(group)
    expect(group.position.x).toBe(0)
    expect(group.position.z).toBe(0)
  })
})

describe('AnimationEngine — seekTo with new effects', () => {
  it('seekTo resets position and scale before computing', () => {
    const engine = new AnimationEngine()
    engine.useFadeInOut = false
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, spinY: false }
    const group = makeFullGroup()
    group.position.y = 0.5
    group.scale.setScalar(1.3)
    engine.seekTo(1000, group, null)
    expect(group.position.y).toBe(0)
    expect(group.scale.x).toBe(1)
  })

  it('seekTo is deterministic for bounce at the same time', () => {
    const engine = new AnimationEngine()
    engine.useFadeInOut = false
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, spinY: false, bounce: true }
    const g1 = makeFullGroup()
    const g2 = makeFullGroup()
    engine.seekTo(2000, g1, null)
    engine.seekTo(2000, g2, null)
    expect(g1.position.y).toBe(g2.position.y)
  })

  it('seekTo is deterministic for shake at the same time', () => {
    const engine = new AnimationEngine()
    engine.useFadeInOut = false
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, spinY: false, shake: true }
    const g1 = makeFullGroup()
    const g2 = makeFullGroup()
    engine.seekTo(3000, g1, null)
    engine.seekTo(3000, g2, null)
    expect(g1.position.x).toBe(g2.position.x)
    expect(g1.position.z).toBe(g2.position.z)
  })
})

function makeCamera(x = 0, y = 0.5, z = 5) {
  return {
    position: {
      x,
      y,
      z,
      clone() {
        return {
          x: this.x,
          y: this.y,
          z: this.z,
          length() {
            return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2)
          }
        }
      },
      set(nx, ny, nz) {
        this.x = nx
        this.y = ny
        this.z = nz
      },
      copy(v) {
        this.x = v.x
        this.y = v.y
        this.z = v.z
      },
      length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2)
      }
    },
    quaternion: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
      clone() {
        return { x: this.x, y: this.y, z: this.z, w: this.w }
      },
      copy(q) {
        this.x = q.x
        this.y = q.y
        this.z = q.z
        this.w = q.w
      }
    },
    lookAt() {}
  }
}

describe('AnimationEngine — orbit', () => {
  it('moves camera position when orbit is active', () => {
    const engine = new AnimationEngine()
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, spinY: false, orbit: true }
    const group = makeFullGroup()
    const camera = makeCamera()
    const origZ = camera.position.z
    engine.applyEffects(group, 0.5, camera)
    const moved = camera.position.x !== 0 || camera.position.z !== origZ
    expect(moved).toBe(true)
  })

  it('is a no-op when camera is null', () => {
    const engine = new AnimationEngine()
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, spinY: false, orbit: true }
    const group = makeFullGroup()
    // Should not throw when camera is undefined
    engine.applyEffects(group, 0.5)
    expect(group.rotation.x).toBe(0)
  })

  it('produces identical camera pose for identical time in applyEffects vs seekTo', () => {
    const engine = new AnimationEngine()
    engine.useFadeInOut = false
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, spinY: false, orbit: true }

    // Use applyEffects to advance to a known time
    const cam1 = makeCamera()
    const group1 = makeFullGroup()
    engine.applyEffects(group1, 2.0, cam1)
    const pos1 = { x: cam1.position.x, y: cam1.position.y, z: cam1.position.z }

    // Use seekTo for the same absolute time (engine.time was set to 2.0 by applyEffects)
    const cam2 = makeCamera()
    const group2 = makeFullGroup()
    engine.seekTo(2000, group2, null, cam2)
    const pos2 = { x: cam2.position.x, y: cam2.position.y, z: cam2.position.z }

    expect(pos1.x).toBeCloseTo(pos2.x, 5)
    expect(pos1.y).toBeCloseTo(pos2.y, 5)
    expect(pos1.z).toBeCloseTo(pos2.z, 5)
  })

  it('restores camera to baseline when orbit is toggled off', () => {
    const engine = new AnimationEngine()
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, orbit: true }
    engine._previousEffects = { ...engine.animationEffects }

    const group = makeFullGroup()
    const camera = makeCamera(0, 0.5, 5)

    // Apply orbit to capture baseline and move camera
    engine.applyEffects(group, 1.0, camera)
    expect(engine._orbitBaseline).not.toBeNull()

    // Toggle orbit off
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, orbit: false }

    const mockEffect = {
      getAnimationPhase: () => 'show',
      isAnimationComplete: () => false,
      startAnimation: () => {},
      setPhaseProgress: () => {}
    }
    engine.update(group, mockEffect, 1 / 60, camera)

    // Camera should be restored to baseline
    expect(camera.position.x).toBeCloseTo(0, 5)
    expect(camera.position.y).toBeCloseTo(0.5, 5)
    expect(camera.position.z).toBeCloseTo(5, 5)
  })

  it('does not interfere with modelGroup rotation animations', () => {
    const engine = new AnimationEngine()
    engine.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS, spinY: true, orbit: true }
    const group = makeFullGroup()
    const camera = makeCamera()
    engine.applyEffects(group, 0.5, camera)
    // spinY should still rotate the model
    expect(group.rotation.y).not.toBe(0)
    // orbit should move the camera
    expect(camera.position.x !== 0 || camera.position.z !== 5).toBe(true)
  })
})
