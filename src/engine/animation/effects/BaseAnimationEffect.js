/**
 * BaseAnimationEffect -- interface/base class for all animation effects.
 *
 * Subclasses override methods to apply their specific animation logic.
 * All time parameters are in SECONDS unless otherwise noted.
 *
 * Lifecycle:
 *   checkReset()  -- detect toggle-on/off transitions, initiate or cancel resets
 *   update()      -- apply per-frame animation delta
 *   seekTo()      -- apply analytical animation state for an absolute time
 *   applyReset()  -- advance reset lerp, return true while still resetting
 *   clearReset()  -- cancel any in-progress reset (used by resetToStart / seekTo)
 */
class BaseAnimationEffect {
  /**
   * Apply per-frame animation increment.
   * @param {object} target - modelGroup (has .rotation, .position, .scale)
   * @param {number} deltaSeconds - time since last frame in seconds
   * @param {number} speed - animation speed multiplier
   * @param {object} context - { time, animationEffects, camera }
   */
  update(target, deltaSeconds, speed, context) {} // eslint-disable-line no-unused-vars

  /**
   * Set animation state for an absolute time (deterministic seek).
   * @param {object} target - modelGroup
   * @param {number} timeSeconds - absolute time in seconds
   * @param {number} speed - animation speed multiplier
   * @param {object} context - { time, animationEffects, camera }
   */
  seekTo(target, timeSeconds, speed, context) {} // eslint-disable-line no-unused-vars

  /**
   * Detect toggle-on/off transitions and initiate or cancel resets.
   * @param {boolean} active - current active state
   * @param {boolean} previouslyActive - previous frame's active state
   * @param {object} target - modelGroup
   * @param {object} context - { animationEffects }
   */
  checkReset(active, previouslyActive, target, context) {} // eslint-disable-line no-unused-vars

  /**
   * Advance any in-progress reset lerp.
   * @param {object} target - modelGroup
   * @param {number} deltaSeconds - time since last frame in seconds
   * @returns {boolean} true if a reset is still in progress
   */
  applyReset(target, deltaSeconds) { return false } // eslint-disable-line no-unused-vars

  /** Cancel any in-progress reset. */
  clearReset() {}
}

export { BaseAnimationEffect }
