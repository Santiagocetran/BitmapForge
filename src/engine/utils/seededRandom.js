/**
 * Minimal LCG (Linear Congruential Generator) seeded PRNG.
 * Returns a function that produces values in [0, 1).
 * Identical seed → identical sequence, enabling reproducible particle scatter.
 *
 * @param {number} seed - 32-bit unsigned integer
 * @returns {() => number}
 */
function createRNG(seed) {
  let s = seed >>> 0 || 1 // avoid 0 (degenerate case)
  return function rng() {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

/**
 * Returns a random 32-bit seed suitable for createRNG().
 * Used when the user clicks "Randomize seed".
 */
function randomSeed() {
  return (Math.random() * 0xffffffff) >>> 0
}

export { createRNG, randomSeed }
