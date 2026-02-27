// yieldToMain: give the browser a breath between heavy frame captures
function yieldToMain() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Compute how many frames to capture for a given fps.
 * Uses the full loop duration so frame count is consistent with the delay calculation.
 * @param {object} manager - SceneManager instance
 * @param {number} fps
 * @returns {number}
 */
function getFrameCount(manager, fps) {
  return Math.max(12, Math.round((manager.getLoopDurationMs() / 1000) * fps))
}

/**
 * Capture all animation frames from the SceneManager by stepping through the loop
 * deterministically using renderAtTime(). The exported animation matches the live
 * preview exactly — fade-in/out, rotation, and all effect settings are included.
 * @param {object} manager - SceneManager instance
 * @param {number} frameCount - total frames to capture
 * @param {{ signal?: AbortSignal, onProgress?: (current: number, total: number) => void }} options
 * @returns {Promise<ImageData[]>} array of ImageData objects, one per frame
 */
async function captureFrames(manager, frameCount, { signal, onProgress } = {}) {
  const sourceCanvas = manager.getCanvas()
  if (!sourceCanvas) throw new Error('No preview canvas available')

  // Use the same duration as getFrameCount so frameDelay = loopMs/frameCount = 1000/fps
  const loopMs = manager.getLoopDurationMs()
  const frames = []

  manager.pauseLoop()
  try {
    for (let i = 0; i < frameCount; i++) {
      if (signal?.aborted) throw new DOMException('Export cancelled', 'AbortError')

      // renderAtTime uses seekTo() which maps absolute time to the correct
      // animation phase (fadeIn/show/fadeOut) and rotation — matching the live preview
      manager.renderAtTime((i / frameCount) * loopMs)

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
