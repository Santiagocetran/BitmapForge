import { useRef } from 'react'
import { useProjectStore } from '../store/useProjectStore.js'
import { captureFrames, getFrameCount } from '../utils/framesProvider.js'
import { saveProjectFile } from '../utils/projectFile.js'

const getState = useProjectStore.getState

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function friendlyExportError(error) {
  if (error.name === 'AbortError') return 'Export was cancelled.'
  if (error.message?.includes('out of memory') || error.message?.includes('allocation'))
    return 'Export failed: not enough memory. Try reducing frame count or canvas size.'
  if (error.message?.includes('NotSupportedError') || error.message?.includes('isTypeSupported'))
    return 'Export failed: this format is not supported by your browser.'
  if (error.message?.includes('clipboard'))
    return 'Could not copy to clipboard. Ensure the page is served over HTTPS and clipboard permission is granted.'
  return `Export failed: ${error.message}`
}

function useExport(sceneManagerRef) {
  const setStatus = useProjectStore((state) => state.setStatus)
  const abortRef = useRef(null)

  function cancelExport() {
    abortRef.current?.abort()
    setStatus({ exporting: false, message: 'Export cancelled.' })
  }

  async function exportSpriteSheet(frameCount = 24, columns = 6) {
    const manager = sceneManagerRef.current
    if (!manager) return

    const controller = new AbortController()
    abortRef.current = controller

    setStatus({ exporting: true, message: 'Generating sprite sheet...' })
    try {
      const { buildSpriteSheet } = await import('../utils/spriteSheetExport.js')
      const sourceCanvas = manager.getCanvas()
      if (!sourceCanvas) throw new Error('No preview canvas available')

      const frames = await captureFrames(manager, frameCount, {
        signal: controller.signal,
        onProgress: (i, total) =>
          setStatus({ exporting: true, message: `Generating sprite sheet... ${Math.round((i / total) * 100)}%` })
      })

      const blob = await buildSpriteSheet(frames, columns)
      downloadBlob(blob, `bitmapforge-spritesheet-${Date.now()}.png`)

      setStatus({ exporting: false, message: 'Sprite sheet exported.' })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportGif(fps = 16) {
    const manager = sceneManagerRef.current
    if (!manager) return

    const controller = new AbortController()
    abortRef.current = controller

    setStatus({ exporting: true, message: 'Encoding GIF...' })
    try {
      const [{ default: GIF }, { default: gifWorkerUrl }] = await Promise.all([
        import('gif.js'),
        import('gif.js/dist/gif.worker.js?url')
      ])
      const sourceCanvas = manager.getCanvas()
      if (!sourceCanvas) throw new Error('No preview canvas available')

      const loopMs = manager.getLoopDurationMs()
      const frameCount = getFrameCount(manager, fps)
      const frameDelay = Math.round(loopMs / frameCount)

      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: sourceCanvas.width,
        height: sourceCanvas.height,
        workerScript: gifWorkerUrl
      })

      const frames = await captureFrames(manager, frameCount, {
        signal: controller.signal,
        onProgress: (i, total) =>
          setStatus({ exporting: true, message: `Encoding GIF... ${Math.round((i / total) * 100)}%` })
      })

      for (const imageData of frames) {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = imageData.width
        tempCanvas.height = imageData.height
        tempCanvas.getContext('2d').putImageData(imageData, 0, 0)
        gif.addFrame(tempCanvas, { copy: true, delay: frameDelay })
      }

      await new Promise((resolve, reject) => {
        gif.on('finished', (blob) => {
          downloadBlob(blob, `bitmapforge-${Date.now()}.gif`)
          resolve()
        })
        gif.on('abort', () => reject(new Error('GIF export aborted')))
        gif.on('error', (err) => reject(new Error(`GIF encoding error: ${err}`)))
        gif.render()
      })

      setStatus({ exporting: false, message: 'GIF exported.' })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportApng(fps = 16) {
    const manager = sceneManagerRef.current
    if (!manager) return

    const controller = new AbortController()
    abortRef.current = controller

    setStatus({ exporting: true, message: 'Encoding APNG...' })
    try {
      const { buildApng } = await import('../utils/apngExport.js')
      const loopMs = manager.getLoopDurationMs()
      const frameCount = getFrameCount(manager, fps)
      const frameDelay = Math.round(loopMs / frameCount)

      const frames = await captureFrames(manager, frameCount, {
        signal: controller.signal,
        onProgress: (i, total) =>
          setStatus({ exporting: true, message: `Encoding APNG... ${Math.round((i / total) * 100)}%` })
      })

      const blob = await buildApng(frames, frameDelay)
      downloadBlob(blob, `bitmapforge-${Date.now()}.png`)
      setStatus({ exporting: false, message: 'APNG exported.' })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportVideoLegacy() {
    const manager = sceneManagerRef.current
    if (!manager) return
    const canvas = manager.getCanvas()
    if (!canvas) throw new Error('No preview canvas available')
    setStatus({ exporting: true, message: 'Recording video...' })

    try {
      const loopMs = manager.getLoopDurationMs()
      const state = getState()

      // Scale so the shorter side reaches at least 720px for color accuracy
      const minDim = 720
      const scale = Math.max(1, Math.ceil(minDim / Math.max(canvas.width, canvas.height)))

      // Prefer explicit full-range VP9 so color metadata is embedded correctly
      const candidates = [
        'video/webm; codecs="vp09.00.31.08.00.01.01.01.01.00"',
        'video/webm; codecs=vp9',
        'video/webm; codecs=vp8',
        'video/webm'
      ]
      const mimeType = candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? 'video/webm'

      const solidBg =
        !state.backgroundColor || state.backgroundColor === 'transparent' ? '#000000' : state.backgroundColor

      const compositeCanvas = document.createElement('canvas')
      compositeCanvas.width = canvas.width * scale
      compositeCanvas.height = canvas.height * scale
      const compositeCtx = compositeCanvas.getContext('2d', { alpha: false })
      compositeCtx.imageSmoothingEnabled = false

      const drawFrame = () => {
        compositeCtx.fillStyle = solidBg
        compositeCtx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height)
        compositeCtx.drawImage(canvas, 0, 0, compositeCanvas.width, compositeCanvas.height)
      }

      drawFrame()
      manager.setOnFrameRendered(drawFrame)
      manager.resetToLoopStart()

      const stream = compositeCanvas.captureStream(30)
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 20_000_000
      })
      const chunks = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }

      const result = new Promise((resolve, reject) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
        recorder.onerror = (event) => reject(new Error(`MediaRecorder error: ${event.error?.message ?? 'unknown'}`))
      })

      recorder.start()
      await new Promise((resolve) => setTimeout(resolve, loopMs))
      recorder.stop()

      const blob = await result
      manager.clearOnFrameRendered()
      downloadBlob(blob, `bitmapforge-${Date.now()}.webm`)
      setStatus({ exporting: false, message: 'Video exported.' })
    } catch (error) {
      manager.clearOnFrameRendered?.()
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportVideo(fps = 30) {
    const manager = sceneManagerRef.current
    if (!manager) return
    const canvas = manager.getCanvas()
    if (!canvas) throw new Error('No preview canvas available')

    // Browsers without WebCodecs: fall back to live MediaRecorder recording
    if (!window.VideoEncoder) {
      return exportVideoLegacy()
    }

    const controller = new AbortController()
    abortRef.current = controller
    const { signal } = controller

    setStatus({ exporting: true, message: 'Capturing frames…' })
    try {
      const frameCount = getFrameCount(manager, fps)

      const frames = await captureFrames(manager, frameCount, {
        signal,
        onProgress: (i, total) =>
          setStatus({ exporting: true, message: `Encoding video… ${Math.round((i / total) * 100)}%` })
      })

      // H.264 requires even width and height (YCbCr 4:2:0 chroma sub-sampling)
      const evenWidth = canvas.width % 2 === 0 ? canvas.width : canvas.width + 1
      const evenHeight = canvas.height % 2 === 0 ? canvas.height : canvas.height + 1

      const { Muxer, ArrayBufferTarget } = await import('mp4-muxer')

      const target = new ArrayBufferTarget()
      const muxer = new Muxer({
        target,
        video: {
          codec: 'avc',
          width: evenWidth,
          height: evenHeight
        },
        fastStart: 'in-memory'
      })

      let encoderError = null
      const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => {
          encoderError = e
        }
      })

      encoder.configure({
        codec: 'avc1.4d0028',
        width: evenWidth,
        height: evenHeight,
        bitrate: 8_000_000,
        framerate: fps,
        latencyMode: 'quality'
      })

      const needsPad = evenWidth !== canvas.width || evenHeight !== canvas.height

      for (let i = 0; i < frames.length; i++) {
        if (signal.aborted) break

        const timestamp = Math.round((i / fps) * 1_000_000) // microseconds
        const duration = Math.round((1 / fps) * 1_000_000) // microseconds

        const frame = frames[i]
        let frameBuffer = frame.data.buffer

        if (needsPad) {
          // Pad odd-dimension frames row by row; extra pixels are black/transparent
          const padded = new Uint8Array(evenWidth * evenHeight * 4)
          for (let y = 0; y < frame.height; y++) {
            padded.set(new Uint8Array(frame.data.buffer, y * frame.width * 4, frame.width * 4), y * evenWidth * 4)
          }
          frameBuffer = padded.buffer
        }

        const videoFrame = new VideoFrame(frameBuffer, {
          format: 'RGBA',
          codedWidth: evenWidth,
          codedHeight: evenHeight,
          timestamp,
          duration
        })
        encoder.encode(videoFrame, { keyFrame: i % 30 === 0 })
        videoFrame.close()
      }

      await encoder.flush()
      if (signal.aborted) throw new DOMException('Export cancelled', 'AbortError')
      if (encoderError) throw encoderError

      muxer.finalize()

      const blob = new Blob([target.buffer], { type: 'video/mp4' })
      downloadBlob(blob, `bitmapforge-${Date.now()}.mp4`)
      setStatus({ exporting: false, message: 'Video exported as MP4.' })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportSingleHtml(fps = 16) {
    const manager = sceneManagerRef.current
    if (!manager) return

    const controller = new AbortController()
    abortRef.current = controller

    setStatus({ exporting: true, message: 'Building Single HTML...' })
    try {
      const { buildSingleHtml } = await import('../utils/singleHtmlExport.js')
      const frameCount = getFrameCount(manager, fps)
      const state = getState()
      const backgroundColor = state.backgroundColor || '#000000'

      const frames = await captureFrames(manager, frameCount, {
        signal: controller.signal,
        onProgress: (i, total) =>
          setStatus({ exporting: true, message: `Building Single HTML... ${Math.round((i / total) * 100)}%` })
      })

      const blob = await buildSingleHtml(frames, fps, backgroundColor)
      downloadBlob(blob, `bitmapforge-${Date.now()}.html`)
      setStatus({ exporting: false, message: 'Single HTML exported.' })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportCodeZip() {
    const state = getState()
    setStatus({ exporting: true, message: 'Generating code ZIP...' })
    try {
      const { buildCodeZip } = await import('../utils/codeExport.js')
      const blob = await buildCodeZip(state)
      downloadBlob(blob, `bitmapforge-export-${Date.now()}.zip`)
      setStatus({ exporting: false, message: 'Code ZIP exported.' })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportReactComponent() {
    const state = getState()
    setStatus({ exporting: true, message: 'Building React component…' })
    try {
      const { buildReactComponent } = await import('../utils/reactComponentExport.js')
      const blob = await buildReactComponent(state)
      downloadBlob(blob, `MyAnimation.zip`)
      setStatus({
        exporting: false,
        message: 'React component exported. Drop the MyAnimation/ folder into your project.'
      })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportWebComponent() {
    const state = getState()
    setStatus({ exporting: true, message: 'Building Web Component…' })
    try {
      const { buildWebComponent } = await import('../utils/webComponentExport.js')
      const blob = await buildWebComponent(state)
      downloadBlob(blob, `bitmap-animation.zip`)
      setStatus({ exporting: false, message: 'Web Component exported. See README.md inside the ZIP for usage.' })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportCssAnimation(fps = 16) {
    const manager = sceneManagerRef.current
    if (!manager) return

    const controller = new AbortController()
    abortRef.current = controller

    setStatus({ exporting: true, message: 'Capturing frames…' })
    try {
      const { buildCssAnimation } = await import('../utils/cssExport.js')
      const state = getState()
      const blob = await buildCssAnimation(manager, state, 'bitmapforge-animation', fps, {
        signal: controller.signal,
        onProgress: (i, total) =>
          setStatus({ exporting: true, message: `Building CSS animation… ${Math.round((i / total) * 100)}%` })
      })
      downloadBlob(blob, `bitmapforge-animation-css.zip`)
      setStatus({ exporting: false, message: 'CSS animation exported.' })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportLottie(fps = 16) {
    const manager = sceneManagerRef.current
    if (!manager) return

    const controller = new AbortController()
    abortRef.current = controller

    setStatus({ exporting: true, message: 'Loading Lottie encoder…' })
    try {
      const { buildLottieJson, estimateLottieSizeMb, LOTTIE_MAX_PX } = await import('../utils/lottieExport.js')
      const sourceCanvas = manager.getCanvas()
      const frameCount = getFrameCount(manager, fps)
      const estimatedMb = estimateLottieSizeMb(frameCount, sourceCanvas.width, sourceCanvas.height)
      const capNote =
        Math.max(sourceCanvas.width, sourceCanvas.height) > LOTTIE_MAX_PX
          ? ` (frames scaled to ${LOTTIE_MAX_PX}px)`
          : ''

      setStatus({ exporting: true, message: `Encoding Lottie (raster)${capNote} — est. ~${estimatedMb} MB…` })
      const state = getState()
      const blob = await buildLottieJson(manager, state, 'bitmapforge-animation', fps, {
        signal: controller.signal,
        onProgress: (i, total) =>
          setStatus({ exporting: true, message: `Encoding Lottie… ${Math.round((i / total) * 100)}%` })
      })
      downloadBlob(blob, `bitmapforge-animation.json`)
      setStatus({
        exporting: false,
        message: `Lottie JSON exported (~${estimatedMb} MB). Works with lottie-web, lottie-react, Framer.`
      })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportEmbed() {
    const state = getState()
    setStatus({ exporting: true, message: 'Building Embed ZIP...' })
    try {
      const { buildEmbedZip } = await import('../utils/embedExport.js')
      const blob = await buildEmbedZip(state)
      downloadBlob(blob, `my-animation-embed.zip`)
      setStatus({ exporting: false, message: 'Embed ZIP exported. Upload the folder to any web host.' })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function saveProject() {
    try {
      await saveProjectFile(getState())
      setStatus({ message: 'Project saved as .bitmapforge file.' })
    } catch (error) {
      setStatus({ error: friendlyExportError(error) })
    }
  }

  return {
    exportSpriteSheet,
    exportGif,
    exportApng,
    exportVideo,
    exportSingleHtml,
    exportCodeZip,
    exportReactComponent,
    exportWebComponent,
    exportCssAnimation,
    exportLottie,
    exportEmbed,
    saveProject,
    cancelExport
  }
}

export { useExport }
