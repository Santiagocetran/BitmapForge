import { BaseAnimationEffect } from './BaseAnimationEffect.js'
import { ANIMATION_PRESETS } from '../presets.js'

const FLOAT_PRESET = ANIMATION_PRESETS.float
const RESET_DURATION_S = 0.3

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * FloatEffect -- gentle oscillation on the x and z rotation axes.
 *
 * Float shares the x and z axes with spinX/spinZ. Resets on those axes
 * are only initiated if the corresponding spin is also inactive.
 */
class FloatEffect extends BaseAnimationEffect {
  constructor() {
    super()
    // Per-axis reset state: null = no reset in progress
    this._resetX = null
    this._resetZ = null
  }

  update(target, deltaSeconds, _speed, context) {
    const ox = FLOAT_PRESET?.oscillateX ?? 0.15
    const oz = FLOAT_PRESET?.oscillateZ ?? 0.08
    if (!this._resetX) {
      target.rotation.x += Math.sin(context.time * 0.5) * ox * deltaSeconds * 2
    }
    if (!this._resetZ) {
      target.rotation.z += Math.sin(context.time * 0.3) * oz * deltaSeconds * 2
    }
  }

  seekTo(target, timeSeconds, _speed, _context) {
    const ox = FLOAT_PRESET?.oscillateX ?? 0.15
    const oz = FLOAT_PRESET?.oscillateZ ?? 0.08
    // Analytical integral of the incremental float deltas
    target.rotation.x += ox * 4 * (1 - Math.cos(0.5 * timeSeconds))
    target.rotation.z += ((oz * 2) / 0.3) * (1 - Math.cos(0.3 * timeSeconds))
  }

  checkReset(active, previouslyActive, target, context) {
    const e = context.animationEffects
    if (previouslyActive && !active) {
      // Only reset axes that no spin is currently driving
      if (!e.spinX && !this._resetX) {
        this._resetX = { startRotation: target.rotation.x, elapsed: 0 }
      }
      if (!e.spinZ && !this._resetZ) {
        this._resetZ = { startRotation: target.rotation.z, elapsed: 0 }
      }
    }
    if (!previouslyActive && active) {
      // Float re-enabled: cancel resets on axes it owns (if spin isn't active there)
      if (!e.spinX) this._resetX = null
      if (!e.spinZ) this._resetZ = null
    }
  }

  applyReset(target, deltaSeconds) {
    let still = false

    if (this._resetX) {
      this._resetX.elapsed += deltaSeconds
      const raw = Math.min(this._resetX.elapsed / RESET_DURATION_S, 1)
      const t = easeOutCubic(raw)
      target.rotation.x = this._resetX.startRotation * (1 - t)
      if (this._resetX.elapsed >= RESET_DURATION_S) {
        target.rotation.x = 0
        this._resetX = null
      } else {
        still = true
      }
    }

    if (this._resetZ) {
      this._resetZ.elapsed += deltaSeconds
      const raw = Math.min(this._resetZ.elapsed / RESET_DURATION_S, 1)
      const t = easeOutCubic(raw)
      target.rotation.z = this._resetZ.startRotation * (1 - t)
      if (this._resetZ.elapsed >= RESET_DURATION_S) {
        target.rotation.z = 0
        this._resetZ = null
      } else {
        still = true
      }
    }

    return still
  }

  clearReset() {
    this._resetX = null
    this._resetZ = null
  }

  /** @returns {boolean} Whether a reset is in progress on the x axis. */
  get isResettingX() {
    return this._resetX !== null
  }

  /** @returns {boolean} Whether a reset is in progress on the z axis. */
  get isResettingZ() {
    return this._resetZ !== null
  }
}

export { FloatEffect }
