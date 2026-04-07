/**
 * Pixel analysis helpers for Playwright screenshot assertions.
 * Operates on PNG buffers (single-frame only — do not pass APNG buffers).
 */
import UPNG from 'upng-js'

/**
 * Analyze a single-frame PNG screenshot buffer.
 * Returns metrics used to assert "something meaningful rendered".
 */
export function analyzeScreenshot(pngBuffer) {
  const buf = pngBuffer.buffer
    ? pngBuffer.buffer.slice(pngBuffer.byteOffset, pngBuffer.byteOffset + pngBuffer.byteLength)
    : pngBuffer

  const img = UPNG.decode(buf)
  // toRGBA8 is safe here — screenshots are always single-frame PNGs.
  // Returns ArrayBuffer objects, not Uint8Arrays — must wrap.
  const frames = UPNG.toRGBA8(img)
  const rgba = new Uint8Array(frames[0])
  const pixels = rgba.length / 4

  const uniqueColors = new Set()
  let nonBgCount = 0
  // Background color from CANONICAL_STATE: #0a0a0a
  const BG = [10, 10, 10]
  const BG_THRESHOLD = 15

  for (let i = 0; i < rgba.length; i += 4) {
    uniqueColors.add(`${rgba[i]},${rgba[i + 1]},${rgba[i + 2]}`)
    if (
      Math.abs(rgba[i] - BG[0]) > BG_THRESHOLD ||
      Math.abs(rgba[i + 1] - BG[1]) > BG_THRESHOLD ||
      Math.abs(rgba[i + 2] - BG[2]) > BG_THRESHOLD
    ) {
      nonBgCount++
    }
  }

  // Shannon entropy on R channel
  const hist = new Array(256).fill(0)
  for (let i = 0; i < rgba.length; i += 4) hist[rgba[i]]++
  let entropy = 0
  for (const c of hist) {
    if (c > 0) {
      const p = c / pixels
      entropy -= p * Math.log2(p)
    }
  }

  return {
    uniqueColors: uniqueColors.size,
    nonBgPixels: nonBgCount,
    nonBgRatio: nonBgCount / pixels,
    entropy,
    width: img.width,
    height: img.height
  }
}

export function isBlank(metrics) {
  return metrics.nonBgRatio < 0.01 || metrics.uniqueColors < 5
}
