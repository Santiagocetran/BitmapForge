/**
 * PostProcessingChain — applies a sequence of image-space effects to a 2D canvas
 * after the active renderer has finished drawing each frame.
 *
 * Each registered effect must implement:
 *   apply(ctx: CanvasRenderingContext2D, width: number, height: number, params: object) => void
 *
 * Effects are applied in insertion order.
 */
class PostProcessingChain {
  constructor() {
    /** @type {Array<{ id: string, effect: object, enabled: boolean }>} */
    this._effects = []
  }

  /**
   * Register an effect instance.
   * @param {string} id - unique identifier
   * @param {object} effect - must implement apply(ctx, width, height, params)
   */
  addEffect(id, effect) {
    this._effects.push({ id, effect, enabled: true })
  }

  /**
   * Enable or disable a registered effect by id.
   * @param {string} id
   * @param {boolean} enabled
   */
  setEnabled(id, enabled) {
    const entry = this._effects.find((e) => e.id === id)
    if (entry) entry.enabled = enabled
  }

  /**
   * Apply all enabled effects in registration order.
   * @param {CanvasRenderingContext2D|null} ctx
   * @param {number} width
   * @param {number} height
   * @param {object} params - post-processing params from the store
   */
  apply(ctx, width, height, params) {
    if (!ctx) return
    for (const { enabled, effect } of this._effects) {
      if (enabled) effect.apply(ctx, width, height, params)
    }
  }
}

export { PostProcessingChain }
