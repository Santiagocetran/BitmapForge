import UPNG from 'upng-js'

self.onmessage = ({ data: { frames, width, height, delayMs } }) => {
  try {
    const delays = frames.map(() => delayMs)
    const arrayBuffer = UPNG.encode(frames, width, height, 0, delays)
    self.postMessage({ ok: true, arrayBuffer }, [arrayBuffer])
  } catch (err) {
    self.postMessage({ ok: false, error: err.message })
  }
}
