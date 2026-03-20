import { SceneManager, parseProjectData } from '/headless.js'

// Load upng dynamically (served as a classic script from the local server)
async function loadUpng() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/upng.js'
    script.onload = () => resolve(window.UPNG)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function captureFrames(manager, frameCount) {
  const sourceCanvas = manager.getCanvas()
  if (!sourceCanvas) throw new Error('No preview canvas available')

  // Use the same duration as getFrameCount so frameDelay = loopMs/frameCount = 1000/fps
  const loopMs = manager.getLoopDurationMs()
  const frames = []

  manager.pauseLoop()
  try {
    for (let i = 0; i < frameCount; i++) {
      // renderAtTime uses seekTo() which maps absolute time to the correct
      // animation phase (fadeIn/show/fadeOut) and rotation — matching the live preview
      manager.renderAtTime((i / frameCount) * loopMs)

      const ctx = sourceCanvas.getContext('2d')
      const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
      frames.push(imageData)

      // yield every 4 frames (matches framesProvider.js)
      if (i % 4 === 3) await new Promise(r => setTimeout(r, 0))
    }
  } finally {
    manager.resumeLoop()
  }
  return frames
}

async function encodeApng(frames, delayMs) {
  const UPNG = await loadUpng()
  const { width, height } = frames[0]
  // CRITICAL: copy pixel data to own Uint8Array before encoding.
  // new Uint8Array(f.data.buffer) would share the ImageData's backing buffer,
  // which the browser may mark non-transferable (canvas store). That causes a
  // silent transfer failure → worker receives zeroed buffers → all-white output.
  // new Uint8Array(f.data) uses the TypedArray copy constructor → own buffer.
  const buffers = frames.map(f => new Uint8Array(f.data).buffer)
  const delays = frames.map(() => delayMs)
  const encoded = UPNG.encode(buffers, width, height, 0, delays)
  return btoa(String.fromCharCode(...new Uint8Array(encoded)))
}

async function encodeWebm(manager, frameCount, fps) {
  const sourceCanvas = manager.getCanvas()
  if (!sourceCanvas) throw new Error('No preview canvas available')

  // Pad to even dimensions for video encoding
  let { width, height } = sourceCanvas
  width = width % 2 === 0 ? width : width + 1
  height = height % 2 === 0 ? height : height + 1

  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d')

  const chunks = []
  const stream = offscreen.captureStream(fps)
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

  const loopMs = manager.getLoopDurationMs()
  const frameDuration = loopMs / frameCount

  recorder.start()
  manager.pauseLoop()
  try {
    for (let i = 0; i < frameCount; i++) {
      manager.renderAtTime((i / frameCount) * loopMs)
      ctx.drawImage(sourceCanvas, 0, 0, width, height)
      await new Promise(r => setTimeout(r, frameDuration))
    }
  } finally {
    manager.resumeLoop()
  }

  recorder.stop()
  await new Promise(r => { recorder.onstop = r })

  const blob = new Blob(chunks, { type: 'video/webm' })
  const buf = await blob.arrayBuffer()
  return { base64: btoa(String.fromCharCode(...new Uint8Array(buf))), mimeType: 'video/webm' }
}

window.__bitmapForgeRender = async function(opts) {
  try {
    const { projectJson, format, fps = 12, width, height } = opts
    const { settings, modelData, inputType } = parseProjectData(projectJson)

    const container = document.getElementById('container')
    const w = width || 400
    const h = height || 400
    container.style.width = w + 'px'
    container.style.height = h + 'px'

    const manager = new SceneManager(container, { ...settings })
    // DPR hardcoded to 1 for deterministic output across machines
    manager.setSize(w, h)

    // Load content
    if (inputType === 'model' && modelData) {
      const binary = atob(modelData.data)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes], { type: modelData.type })
      const file = new File([blob], modelData.name)
      await manager.loadModel(file)
    } else if (inputType === 'shape') {
      manager.loadShape(settings.shapeType, settings.shapeParams)
    } else if (inputType === 'text') {
      await manager.loadText(settings.textContent, {
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize,
        extrudeDepth: settings.extrudeDepth,
        bevelEnabled: settings.bevelEnabled
      })
    }

    const renderMode = settings.renderMode ?? 'bitmap'
    manager.setRenderMode(renderMode)
    manager.updateAnimationOptions({ ...settings })
    manager.updateEffectOptions({ ...settings })

    const frameCount = Math.max(12, Math.round((manager.getLoopDurationMs() / 1000) * fps))
    const delayMs = Math.round(1000 / fps)

    let base64, mimeType

    if (format === 'webm') {
      ;({ base64, mimeType } = await encodeWebm(manager, frameCount, fps))
    } else {
      // default: apng
      const frames = await captureFrames(manager, frameCount)
      base64 = await encodeApng(frames, delayMs)
      mimeType = 'image/png'
    }

    manager.dispose()
    return { ok: true, base64, mimeType }
  } catch (err) {
    return { ok: false, error: err.message || String(err) }
  }
}
