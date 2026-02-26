/**
 * Base class for fade animation variants.
 *
 * Each variant is responsible only for computing which pixels are visible and
 * where they should be drawn. BitmapEffect retains sole ownership of the canvas
 * and calls drawPixel() with the data returned here.
 *
 * Particles passed in will have at minimum:
 *   idx, finalX, finalY, brightness, color, delay, distFromCenter, startX, startY
 *
 * To add a new variant:
 *   1. Extend BaseFadeVariant
 *   2. Override initVariantMetadata() to pre-compute per-particle fields
 *   3. Override getVisiblePixels() to return draw descriptors
 *   4. Register it in index.js
 */
class BaseFadeVariant {
  constructor(options = {}) {
    this.options = options
  }

  /**
   * Called once after particles are (re-)initialized at the start of each phase.
   * Use this to compute and attach any per-particle metadata your variant needs.
   *
   * @param {object[]} particles
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   * @param {number} pixelSize
   * @param {number} gridWidth
   * @param {number} gridHeight
   */
  // eslint-disable-next-line no-unused-vars
  initVariantMetadata(particles, canvasWidth, canvasHeight, pixelSize, gridWidth, gridHeight) {}

  /**
   * Called every frame while animating. Returns an array of pixel descriptors
   * that BitmapEffect will draw via drawPixel().
   *
   * @param {object[]} particles
   * @param {number} progress - 0–1 overall animation progress for this phase
   * @param {'fadeIn'|'fadeOut'} phase
   * @param {function(number): number} easeInOutCubic
   * @returns {{ x: number, y: number, brightness: number, color: string, alpha: number }[]}
   */
  // eslint-disable-next-line no-unused-vars
  getVisiblePixels(particles, progress, phase, easeInOutCubic) {
    return []
  }
}

export { BaseFadeVariant }
