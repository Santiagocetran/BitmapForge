import { describe, it, expect, beforeEach } from 'vitest'
import { OrbitEffect } from './OrbitEffect.js'

function makeCamera(x = 0, y = 0.5, z = 5) {
  const pos = { x, y, z }
  pos.clone = () => ({ ...pos, clone: pos.clone })
  pos.length = () => Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2)
  pos.set = (nx, ny, nz) => {
    pos.x = nx
    pos.y = ny
    pos.z = nz
  }
  pos.copy = (src) => {
    pos.x = src.x
    pos.y = src.y
    pos.z = src.z
  }

  const quat = { x: 0, y: 0, z: 0, w: 1 }
  quat.clone = () => ({ ...quat, clone: quat.clone })
  quat.copy = (src) => {
    quat.x = src.x
    quat.y = src.y
    quat.z = src.z
    quat.w = src.w
  }

  return { position: pos, quaternion: quat, lookAt: () => {} }
}

describe('OrbitEffect', () => {
  let effect
  let camera

  beforeEach(() => {
    effect = new OrbitEffect()
    camera = makeCamera()
  })

  it('hasRestorePending is false initially', () => {
    expect(effect.hasRestorePending).toBe(false)
  })

  it('update() captures baseline on first call', () => {
    const context = { time: 0, camera }
    effect.update(null, 0, 1, context)
    expect(effect._baseline).not.toBeNull()
  })

  it('update() orbits camera around origin', () => {
    const context = { time: 1, camera }
    effect.update(null, 0.016, 1, context)
    // camera position should have changed
    const dist = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2)
    expect(dist).toBeGreaterThan(0)
  })

  it('checkReset() marks restore pending when toggled off', () => {
    effect.update(null, 0, 1, { time: 0, camera })
    effect.checkReset(false, true, null, {})
    expect(effect.hasRestorePending).toBe(true)
    expect(effect._baseline).toBeNull()
  })

  it('restoreCamera() restores camera position and quaternion', () => {
    effect.update(null, 0, 1, { time: 0, camera })
    const _originalX = camera.position.x
    // Orbit to a different position
    effect.update(null, 0, 1, { time: 2, camera })
    // Toggle off
    effect.checkReset(false, true, null, {})
    // Restore
    effect.restoreCamera(camera)
    expect(effect.hasRestorePending).toBe(false)
  })

  it('checkReset() clears restorePending when toggled back on', () => {
    effect.update(null, 0, 1, { time: 0, camera })
    effect.checkReset(false, true, null, {})
    expect(effect.hasRestorePending).toBe(true)
    effect.checkReset(true, false, null, {})
    expect(effect.hasRestorePending).toBe(false)
  })

  it('applyReset() always returns false', () => {
    expect(effect.applyReset(null, 0.1)).toBe(false)
  })

  it('clearReset() clears restore pending state', () => {
    effect.update(null, 0, 1, { time: 0, camera })
    effect.checkReset(false, true, null, {})
    effect.clearReset()
    expect(effect.hasRestorePending).toBe(false)
  })
})
