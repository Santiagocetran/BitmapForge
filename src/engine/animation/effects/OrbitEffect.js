import { BaseAnimationEffect } from './BaseAnimationEffect.js'

/**
 * OrbitEffect -- orbits the camera around the scene origin.
 *
 * Unlike other effects that modify modelGroup, orbit modifies the camera.
 * The baseline camera position/quaternion is captured on the first active frame
 * and restored when the effect is toggled off.
 */
class OrbitEffect extends BaseAnimationEffect {
  constructor() {
    super()
    // { pos: Vector3-like, quat: Quaternion-like } | null
    this._baseline = null
    // Pending camera restore on toggle-off
    this._restorePending = null
  }

  update(_target, _deltaSeconds, speed, context) {
    const camera = context.camera
    if (!camera) return

    if (!this._baseline) {
      this._baseline = {
        pos: camera.position.clone(),
        quat: camera.quaternion.clone()
      }
    }

    const r = this._baseline.pos.length()
    const angle = context.time * speed * 0.5
    camera.position.set(Math.sin(angle) * r, this._baseline.pos.y, Math.cos(angle) * r)
    camera.lookAt(0, 0, 0)
  }

  seekTo(_target, timeSeconds, speed, context) {
    const camera = context.camera
    if (!camera) return

    const r = this._baseline ? this._baseline.pos.length() : 5
    const baseY = this._baseline ? this._baseline.pos.y : 0.5
    const angle = timeSeconds * speed * 0.5
    camera.position.set(Math.sin(angle) * r, baseY, Math.cos(angle) * r)
    camera.lookAt(0, 0, 0)
  }

  checkReset(active, previouslyActive, _target, _context) {
    if (previouslyActive && !active && this._baseline) {
      this._restorePending = this._baseline
      this._baseline = null
    }
    if (!previouslyActive && active) {
      this._restorePending = null
    }
  }

  /**
   * Restore camera from baseline. Called from update() flow, not from
   * applyReset -- camera restore is handled specially in AnimationEngine.
   * @param {object} camera
   */
  restoreCamera(camera) {
    if (this._restorePending && camera) {
      camera.position.copy(this._restorePending.pos)
      camera.quaternion.copy(this._restorePending.quat)
      this._restorePending = null
    }
  }

  /** @returns {boolean} Whether a camera restore is pending. */
  get hasRestorePending() {
    return this._restorePending !== null
  }

  applyReset(_target, _deltaSeconds) {
    return false
  }

  clearReset() {
    this._restorePending = null
  }

  /** Clear orbit baseline (used by resetToStart). */
  clearBaseline() {
    this._baseline = null
  }
}

export { OrbitEffect }
