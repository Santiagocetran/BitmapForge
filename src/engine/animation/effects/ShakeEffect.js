import { BaseAnimationEffect } from './BaseAnimationEffect.js'
import { createRNG } from '../../utils/seededRandom.js'

/**
 * ShakeEffect -- per-frame seeded random jitter on position.x and position.z.
 * Snaps to zero immediately on toggle-off (no lerp needed for jitter).
 */
class ShakeEffect extends BaseAnimationEffect {
  update(target, _deltaSeconds, _speed, context) {
    if (target.position) {
      const shakeSeed = (Math.floor(context.time * 30) * 0x9e3779b9) >>> 0
      const rng = createRNG(shakeSeed)
      target.position.x = (rng() - 0.5) * 0.08
      target.position.z = (rng() - 0.5) * 0.08
    }
  }

  seekTo(target, timeSeconds, _speed, _context) {
    if (target.position) {
      const shakeSeed = (Math.floor(timeSeconds * 30) * 0x9e3779b9) >>> 0
      const rng = createRNG(shakeSeed)
      target.position.x = (rng() - 0.5) * 0.08
      target.position.z = (rng() - 0.5) * 0.08
    }
  }

  checkReset(active, previouslyActive, target, _context) {
    // Snap to zero immediately on toggle-off
    if (previouslyActive && !active && target.position) {
      target.position.x = 0
      target.position.z = 0
    }
  }

  applyReset(_target, _deltaSeconds) {
    return false
  }
}

export { ShakeEffect }
