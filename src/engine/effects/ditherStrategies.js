const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
].map((row) => row.map((v) => v / 16))

const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
].map((row) => row.map((v) => v / 64))

/**
 * Floyd-Steinberg error-diffusion dithering.
 * Distributes quantization error to right, bottom-left, bottom, bottom-right neighbors.
 *
 * @param {Float32Array} brightnessGrid - flat brightness values [0..1] (row-major). Transparent/below-threshold pixels should be 0.
 * @param {number} width
 * @param {number} height
 * @returns {Uint8Array} draw mask — 1 = draw this cell, 0 = skip
 */
function floydSteinbergProcess(brightnessGrid, width, height) {
  const grid = Float32Array.from(brightnessGrid)
  const result = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const old = grid[idx]
      const drawn = old > 0.5 ? 1 : 0
      result[idx] = drawn
      const error = old - drawn
      if (x + 1 < width) grid[idx + 1] += error * (7 / 16)
      if (y + 1 < height) {
        if (x > 0) grid[idx + width - 1] += error * (3 / 16)
        grid[idx + width] += error * (5 / 16)
        if (x + 1 < width) grid[idx + width + 1] += error * (1 / 16)
      }
    }
  }
  return result
}

/**
 * Atkinson error-diffusion dithering.
 * Distributes only 6/8 of quantization error — produces crisper, higher-contrast output.
 * Classic Mac/HyperCard look.
 *
 * @param {Float32Array} brightnessGrid
 * @param {number} width
 * @param {number} height
 * @returns {Uint8Array} draw mask
 */
function atkinsonProcess(brightnessGrid, width, height) {
  const grid = Float32Array.from(brightnessGrid)
  const result = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const old = grid[idx]
      const drawn = old > 0.5 ? 1 : 0
      result[idx] = drawn
      const frac = (old - drawn) / 8 // distribute 1/8 of error to each of 6 neighbors
      if (x + 1 < width) grid[idx + 1] += frac
      if (x + 2 < width) grid[idx + 2] += frac
      if (y + 1 < height) {
        if (x > 0) grid[idx + width - 1] += frac
        grid[idx + width] += frac
        if (x + 1 < width) grid[idx + width + 1] += frac
      }
      if (y + 2 < height) grid[idx + width * 2] += frac
    }
  }
  return result
}

/**
 * Registry of all dithering strategies.
 *
 * type: 'threshold'      — per-pixel getThreshold(x, y) compared against brightness
 * type: 'variableDot'    — special: uses dot radius proportional to brightness
 * type: 'errorDiffusion' — whole-grid processGrid(brightnessGrid, w, h) → Uint8Array draw mask
 */
const DITHER_STRATEGIES = {
  bayer4x4: {
    type: 'threshold',
    getThreshold: (x, y) => BAYER_4X4[y % 4][x % 4]
  },
  bayer8x8: {
    type: 'threshold',
    getThreshold: (x, y) => BAYER_8X8[y % 8][x % 8]
  },
  variableDot: {
    type: 'variableDot'
  },
  floydSteinberg: {
    type: 'errorDiffusion',
    processGrid: floydSteinbergProcess
  },
  atkinson: {
    type: 'errorDiffusion',
    processGrid: atkinsonProcess
  }
}

export { DITHER_STRATEGIES, BAYER_4X4, BAYER_8X8, floydSteinbergProcess, atkinsonProcess }
