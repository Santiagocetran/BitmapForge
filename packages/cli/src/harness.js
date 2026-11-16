import { SceneManager, parseProjectData } from '/headless.js'

// Classic UPNG captures window.pako at evaluation time: insertion order matters.
const scriptLoads = new Map()
async function loadScript(url, valid) {
  if (valid()) return
  if (!scriptLoads.has(url)) {
    const loading = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.onload = () => (valid() ? resolve() : reject(new Error(`Missing required global from ${url}`)))
      script.onerror = () => reject(new Error(`Failed to load ${url}`))
      document.head.appendChild(script)
    })
    scriptLoads.set(url, loading)
  }
  try {
    await scriptLoads.get(url)
    if (!valid()) throw new Error(`Missing required global from ${url}`)
  } catch (error) {
    scriptLoads.delete(url)
    throw error
  }
}
async function loadUpng() {
  await loadScript('/pako.js', () => typeof window.pako?.deflate === 'function')
  await loadScript('/upng.js', () => typeof window.UPNG?.encode === 'function')
  return window.UPNG
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

      const sourceCanvas = manager.getCanvas()
      if (!sourceCanvas) throw new Error('No preview canvas available')
      const ctx = sourceCanvas.getContext('2d')
      const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
      frames.push(imageData)

      // yield every 4 frames (matches framesProvider.js)
      if (i % 4 === 3) await new Promise((r) => setTimeout(r, 0))
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
  const buffers = frames.map((f) => new Uint8Array(f.data).buffer)
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
  let stream,
    recorder,
    paused = false,
    failure,
    result,
    stopTimer,
    frameTimer
  let eventError,
    stopped = false,
    settleEvent
  // Always fulfills: recorder errors cannot become unhandled rejections mid-loop.
  const event = new Promise((resolve) => {
    settleEvent = resolve
  })
  const onStop = () => {
    stopped = true
    settleEvent()
  }
  const onError = (e) => {
    eventError = e.error || new Error('MediaRecorder error')
    settleEvent()
  }
  const onData = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }
  async function stopRecording() {
    if (!recorder || recorder.state === 'inactive') return
    recorder.stop()
    await Promise.race([
      event,
      new Promise((_, reject) => {
        stopTimer = setTimeout(() => reject(new Error('MediaRecorder stop timed out after 5000ms')), 5000)
      })
    ])
    if (eventError) throw eventError
  }
  try {
    stream = offscreen.captureStream(fps)
    recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
    recorder.addEventListener('dataavailable', onData)
    recorder.addEventListener('stop', onStop)
    recorder.addEventListener('error', onError)
    const loopMs = manager.getLoopDurationMs()
    const frameDuration = loopMs / frameCount
    recorder.start()
    manager.pauseLoop()
    paused = true
    for (let i = 0; i < frameCount; i++) {
      if (eventError) throw eventError
      if (stopped) throw new Error('MediaRecorder stopped before capture completed')
      manager.renderAtTime((i / frameCount) * loopMs)
      const sourceCanvas = manager.getCanvas()
      if (!sourceCanvas) throw new Error('No preview canvas available')
      ctx.drawImage(sourceCanvas, 0, 0, width, height)
      await Promise.race([
        event,
        new Promise((resolve) => {
          frameTimer = setTimeout(resolve, frameDuration)
        })
      ])
      clearTimeout(frameTimer)
      if (eventError) throw eventError
      if (stopped) throw new Error('MediaRecorder stopped before capture completed')
    }
    await stopRecording()
    const blob = new Blob(chunks, { type: 'video/webm' })
    const buf = await blob.arrayBuffer()
    result = { base64: btoa(String.fromCharCode(...new Uint8Array(buf))), mimeType: 'video/webm' }
  } catch (error) {
    failure = error
  } finally {
    // No cleanup failure may prevent the remaining owner attempts.
    const cleanup = async (fn) => {
      try {
        await fn()
      } catch (error) {
        failure = failure ? new Error(`${failure.message}; cleanup: ${error.message}`) : error
      }
    }
    await cleanup(stopRecording)
    clearTimeout(stopTimer)
    clearTimeout(frameTimer)
    if (recorder) {
      recorder.removeEventListener('dataavailable', onData)
      recorder.removeEventListener('stop', onStop)
      recorder.removeEventListener('error', onError)
    }
    if (paused) await cleanup(() => manager.resumeLoop())
    if (stream) {
      for (const track of stream.getTracks()) await cleanup(() => track.stop())
    }
  }
  if (failure) throw failure
  return result
}

window.__bitmapForgeRender = async function (opts) {
  let manager, result, failure
  try {
    const { projectJson, format, fps = 12, width, height } = opts
    const { settings, modelData, inputType } = parseProjectData(projectJson)

    const container = document.getElementById('container')
    const w = width || 400
    const h = height || 400
    container.style.width = w + 'px'
    container.style.height = h + 'px'

    manager = new SceneManager(container, { ...settings })
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

    result = { ok: true, base64, mimeType }
  } catch (err) {
    failure = err.message || String(err)
  } finally {
    if (manager) {
      try {
        manager.dispose()
      } catch (err) {
        const message = err.message || String(err)
        failure = failure ? `${failure}; dispose: ${message}` : `Dispose failed: ${message}`
      }
    }
  }
  return failure ? { ok: false, error: failure } : result
}
