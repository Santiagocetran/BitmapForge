import UPNG from 'upng-js'

self.onmessage = ({ data: { frames, width, height, delayMs } }) => {
  try {
    if (!Number.isInteger(width) || !Number.isInteger(height)) throw new Error('Invalid dimensions')
    if (frames.length === 0) throw new Error('No frames to encode')
    const delays = frames.map(() => delayMs)
    if (delays.length !== frames.length) throw new Error('delays/frames length mismatch')

    // Safe-slice: if the Uint8Array is a view into a larger buffer (byteOffset > 0),
    // UPNG would receive the entire backing buffer — producing wrong/white output.
    const bufs = frames.map((f) =>
      f.byteOffset === 0 && f.byteLength === f.buffer.byteLength
        ? f.buffer
        : f.buffer.slice(f.byteOffset, f.byteOffset + f.byteLength)
    )
    const arrayBuffer = UPNG.encode(bufs, width, height, 0, delays)
    self.postMessage({ ok: true, arrayBuffer }, [arrayBuffer])
  } catch (err) {
    self.postMessage({ ok: false, error: err.message })
  }
}
