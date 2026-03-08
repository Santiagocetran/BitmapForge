/**
 * BaseRenderer — interface/base class for all rendering modes.
 *
 * Subclasses implement render() to draw from downsampled imageData to their canvas.
 * drawPixel() is called per-particle during fade animations — subclasses must implement it
 * to match their drawing style.
 *
 * SceneManager swaps the active renderer via BitmapEffect.setRenderer().
 */
class BaseRenderer {
  constructor(options = {}) {
    this.options = options
  }

  /**
   * Initialize renderer-specific resources at a given size.
   * Called once after construction and again on renderer swaps.
   * @param {number} width
   * @param {number} height
   */
  init(width, height) {} // eslint-disable-line no-unused-vars

  /**
   * Render one frame from downsampled imageData to the renderer's canvas.
   * Called every frame when not in a fade animation.
   * @param {Uint8ClampedArray} imageData - flat RGBA pixel data (gridW × gridH)
   * @param {number} gridW
   * @param {number} gridH
   * @param {(brightness: number) => string} getColor - maps brightness [0,1] → CSS color
   */
  render(imageData, gridW, gridH, getColor) {
    // eslint-disable-line no-unused-vars
    throw new Error('BaseRenderer.render() not implemented')
  }

  /**
   * Draw a single pre-computed pixel to the renderer's canvas.
   * Called by BitmapEffect during fade animation — one call per visible particle.
   * @param {number} x - canvas x in CSS pixels (pre-multiplied by pixelSize)
   * @param {number} y - canvas y in CSS pixels (pre-multiplied by pixelSize)
   * @param {number} brightness - adjusted brightness [0,1]
   * @param {string} color - pre-computed CSS color string
   * @param {number} [alpha=1]
   */
  drawPixel(x, y, brightness, color, alpha = 1) {} // eslint-disable-line no-unused-vars

  /**
   * Called once before render() or the particle draw loop each frame.
   * Fills/clears the background. No-op hook — enables batching in future renderers.
   * @param {string} backgroundColor - CSS color or 'transparent'
   */
  beginFrame(backgroundColor) {} // eslint-disable-line no-unused-vars

  /** Called after render() / particle draw loop. Reserved for future batching. */
  endFrame() {}

  /**
   * Whether a given pixel should be drawn, used for particle initialization.
   * Default: simple brightness threshold. Override for dithering-aware behavior.
   * @param {number} brightness - adjusted brightness [0,1]
   * @param {number} x - grid x
   * @param {number} y - grid y
   * @returns {boolean}
   */
  shouldDraw(brightness, x, y) {
    // eslint-disable-line no-unused-vars
    return brightness > (this.options.minBrightness ?? 0.05)
  }

  /**
   * Resize the renderer's output canvas.
   * @param {number} width
   * @param {number} height
   */
  setSize(width, height) {} // eslint-disable-line no-unused-vars

  /**
   * Merge new options into the renderer's current options.
   * Called whenever visual settings change.
   * @param {object} options
   */
  updateOptions(options) {
    Object.assign(this.options, options)
  }

  /** Return a JSON Schema describing renderer-specific configurable parameters. */
  getParameterSchema() {
    return {}
  }

  /**
   * The renderer's visible output canvas.
   * @type {HTMLCanvasElement | null}
   */
  get canvas() {
    return null
  }

  /**
   * Fully dispose renderer resources. Removes the canvas from the DOM.
   * Safe to call multiple times (idempotent).
   */
  dispose() {}
}

export { BaseRenderer }
