import { BaseAnimationEffect } from './BaseAnimationEffect.js'

const RESET_DURATION_S = 0.3

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * PulseEffect -- sinusoidal uniform scale oscillation.
 */
class PulseEffect extends BaseAnimationEffect {
  constructor() {
    super()
    // { startValue: number, elapsed: number (seconds) } | null
    this._reset = null
  }

  update(target, _deltaSeconds, speed, context) {
    if (!this._reset && target.scale?.setScalar) {
      target.scale.setScalar(1 + Math.sin(context.time * speed * 1.5) * 0.12)
    }
  }

  seekTo(target, timeSeconds, speed, _context) {
    if (target.scale?.setScalar) {
      target.scale.setScalar(1 + Math.sin(timeSeconds * speed * 1.5) * 0.12)
    }
  }

  checkReset(active, previouslyActive, target, _context) {
    if (previouslyActive && !active && !this._reset && target.scale) {
      this._reset = { startValue: target.scale.x ?? 1, elapsed: 0 }
    }
    if (!previouslyActive && active) {
      this._reset = null
    }
  }

  applyReset(target, deltaSeconds) {
    if (!this._reset || !target.scale?.setScalar) return false

    this._reset.elapsed += deltaSeconds
    const raw = Math.min(this._reset.elapsed / RESET_DURATION_S, 1)
    const t = easeOutCubic(raw)
    target.scale.setScalar(this._reset.startValue + (1 - this._reset.startValue) * t)

    if (this._reset.elapsed >= RESET_DURATION_S) {
      target.scale.setScalar(1)
      this._reset = null
      return false
    }
    return true
  }

  clearReset() {
    this._reset = null
  }
}

export { PulseEffect }
