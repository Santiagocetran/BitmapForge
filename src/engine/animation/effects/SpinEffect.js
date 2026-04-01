import { BaseAnimationEffect } from './BaseAnimationEffect.js'

const RESET_DURATION_S = 0.3

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * SpinEffect -- continuous rotation around a single axis.
 * Three instances are created: one each for x, y, z.
 */
class SpinEffect extends BaseAnimationEffect {
  /**
   * @param {'x' | 'y' | 'z'} axis
   */
  constructor(axis) {
    super()
    this._axis = axis
    // Reset lerp state: null = no reset in progress
    // { startRotation: number, elapsed: number (seconds) }
    this._reset = null
  }

  update(target, deltaSeconds, speed, _context) {
    if (!this._reset) {
      target.rotation[this._axis] += speed * deltaSeconds
    }
  }

  seekTo(target, timeSeconds, speed, _context) {
    target.rotation[this._axis] += speed * timeSeconds
  }

  checkReset(active, previouslyActive, target, _context) {
    if (previouslyActive && !active && !this._reset) {
      this._reset = { startRotation: target.rotation[this._axis], elapsed: 0 }
    }
    if (!previouslyActive && active) {
      this._reset = null
    }
  }

  applyReset(target, deltaSeconds) {
    if (!this._reset) return false

    this._reset.elapsed += deltaSeconds
    const raw = Math.min(this._reset.elapsed / RESET_DURATION_S, 1)
    const t = easeOutCubic(raw)
    target.rotation[this._axis] = this._reset.startRotation * (1 - t)

    if (this._reset.elapsed >= RESET_DURATION_S) {
      target.rotation[this._axis] = 0
      this._reset = null
      return false
    }
    return true
  }

  clearReset() {
    this._reset = null
  }

  /** @returns {boolean} Whether a reset is currently in progress. */
  get isResetting() {
    return this._reset !== null
  }
}

export { SpinEffect }
