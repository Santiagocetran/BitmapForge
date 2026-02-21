/**
 * Shared animation effect definitions.
 *
 * Used by both the Zustand store (src/app/) and AnimationEngine (src/engine/).
 * This is the single source of truth for which animation effects exist.
 *
 * To add a new animation effect:
 *   1. Add the key and default value here
 *   2. Implement the rotation logic in AnimationEngine.applyEffects()
 *   3. Add UI controls in the AnimationControls component
 *
 * Note: Object.freeze is shallow — sufficient here since all values are primitives.
 * Consumers must always spread-clone ({ ...DEFAULT_ANIMATION_EFFECTS }) to avoid
 * mutating the frozen source.
 */

/** @type {Readonly<{ spinX: boolean, spinY: boolean, spinZ: boolean, float: boolean }>} */
const DEFAULT_ANIMATION_EFFECTS = Object.freeze({
  spinX: false,
  spinY: true,
  spinZ: false,
  float: false
})

/** @type {ReadonlyArray<string>} */
const ANIMATION_EFFECT_KEYS = Object.freeze(Object.keys(DEFAULT_ANIMATION_EFFECTS))

export { ANIMATION_EFFECT_KEYS, DEFAULT_ANIMATION_EFFECTS }
