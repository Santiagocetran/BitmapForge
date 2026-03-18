/**
 * Encode an array of ImageData frames into an APNG Blob.
 * Encoding runs in a Web Worker to avoid blocking the main thread.
 * @param {ImageData[]} frames
 * @param {number} delayMs - delay per frame in milliseconds
 * @returns {Promise<Blob>} image/png Blob
 */
function buildApng(frames, delayMs) {
  if (frames.length === 0) return Promise.reject(new Error('No frames to encode'))

  const { width, height } = frames[0]

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/apngWorker.js', import.meta.url), { type: 'module' })

    // Transfer Uint8Array views — zero-copy, buffers detach on main thread
    const uint8Frames = frames.map((f) => new Uint8Array(f.data.buffer))
    const transferList = uint8Frames.map((u) => u.buffer)

    worker.onmessage = ({ data }) => {
      worker.terminate()
      if (data.ok) resolve(new Blob([data.arrayBuffer], { type: 'image/png' }))
      else reject(new Error(data.error))
    }
    worker.onerror = (e) => {
      worker.terminate()
      reject(e)
    }

    worker.postMessage({ frames: uint8Frames, width, height, delayMs }, transferList)
  })
}

export { buildApng }
