import { BaseAnimationEffect } from './BaseAnimationEffect.js'

const RESET_DURATION_S = 0.3

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * BounceEffect -- absolute-value sine bounce on position.y.
 */
class BounceEffect extends BaseAnimationEffect {
  constructor() {
    super()
    // { startValue: number, elapsed: number (seconds) } | null
    this._reset = null
  }

  update(target, _deltaSeconds, speed, context) {
    if (!this._reset && target.position) {
      target.position.y = Math.abs(Math.sin(context.time * speed * 1.8)) * 0.5
    }
  }

  seekTo(target, timeSeconds, speed, _context) {
    if (target.position) {
      target.position.y = Math.abs(Math.sin(timeSeconds * speed * 1.8)) * 0.5
    }
  }

  checkReset(active, previouslyActive, target, _context) {
    if (previouslyActive && !active && !this._reset && target.position) {
      this._reset = { startValue: target.position.y, elapsed: 0 }
    }
    if (!previouslyActive && active) {
      this._reset = null
    }
  }

  applyReset(target, deltaSeconds) {
    if (!this._reset || !target.position) return false

    this._reset.elapsed += deltaSeconds
    const raw = Math.min(this._reset.elapsed / RESET_DURATION_S, 1)
    const t = easeOutCubic(raw)
    target.position.y = this._reset.startValue * (1 - t)

    if (this._reset.elapsed >= RESET_DURATION_S) {
      target.position.y = 0
      this._reset = null
      return false
    }
    return true
  }

  clearReset() {
    this._reset = null
  }
}

export { BounceEffect }
