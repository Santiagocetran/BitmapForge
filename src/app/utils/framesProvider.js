// yieldToMain: give the browser a breath between heavy frame captures
function yieldToMain() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Compute how many frames to capture for a given fps.
 * @param {object} manager - SceneManager instance
 * @param {number} fps
 * @returns {number}
 */
function getFrameCount(manager, fps) {
  return Math.max(12, Math.round((manager.getLoopDurationMs() / 1000) * fps))
}

/**
 * Capture all animation frames from the SceneManager.
 * @param {object} manager - SceneManager instance
 * @param {number} frameCount - total frames to capture
 * @param {{ signal?: AbortSignal, onProgress?: (current: number, total: number) => void }} options
 * @returns {Promise<ImageData[]>} array of ImageData objects, one per frame
 */
async function captureFrames(manager, frameCount, { signal, onProgress } = {}) {
  const sourceCanvas = manager.getCanvas()
  if (!sourceCanvas) throw new Error('No preview canvas available')

  const loopMs = manager.getLoopDurationMs()
  const frames = []

  manager.pauseLoop()
  try {
    for (let i = 0; i < frameCount; i++) {
      if (signal?.aborted) throw new DOMException('Export cancelled', 'AbortError')

      manager.renderAtTime((i / frameCount) * loopMs)

      // Read pixels from the canvas
      const ctx = sourceCanvas.getContext('2d')
      const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
      frames.push(imageData)

      onProgress?.(i + 1, frameCount)
      if (i % 4 === 3) await yieldToMain()
    }
  } finally {
    manager.resumeLoop()
  }

  return frames
}

export { captureFrames, getFrameCount }
