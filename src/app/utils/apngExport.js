import UPNG from 'upng-js'

/**
 * Encode an array of ImageData frames into an APNG Blob.
 * @param {ImageData[]} frames
 * @param {number} delayMs - delay per frame in milliseconds
 * @returns {Blob} image/png Blob
 */
function buildApng(frames, delayMs) {
  if (frames.length === 0) throw new Error('No frames to encode')

  const { width, height } = frames[0]
  const buffers = frames.map((f) => f.data.buffer)
  const delays = frames.map(() => delayMs)

  // UPNG.encode(frames, width, height, colorDepth, delays)
  // colorDepth 0 = auto (lossless, full RGBA)
  const arrayBuffer = UPNG.encode(buffers, width, height, 0, delays)
  return new Blob([arrayBuffer], { type: 'image/png' })
}

export { buildApng }
