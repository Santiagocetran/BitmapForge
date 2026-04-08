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

const FORMAT_HANDLERS = {
  apng: {
    startMessage: 'Encoding APNG…',
    successMessage: 'APNG exported.',
    async execute({ manager, _state, signal, fps = 16, onProgress }) {
      const { buildApng } = await import('../utils/apngExport.js')
      const loopMs = manager.getLoopDurationMs()
      const frameCount = getFrameCount(manager, fps)
      const frameDelay = Math.round(loopMs / frameCount)
      const frames = await captureFrames(manager, frameCount, { signal, onProgress })
      const blob = await buildApng(frames, frameDelay)
      return { blob, filename: `bitmapforge-${Date.now()}.png` }
    }
  },
  gif: {
    startMessage: 'Encoding GIF…',
    successMessage: 'GIF exported.',
    async execute({ manager, _state, signal, fps = 16, onProgress }) {
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
      const frames = await captureFrames(manager, frameCount, { signal, onProgress })
      for (const imageData of frames) {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = imageData.width
        tempCanvas.height = imageData.height
        tempCanvas.getContext('2d').putImageData(imageData, 0, 0)
        gif.addFrame(tempCanvas, { copy: true, delay: frameDelay })
      }
      const blob = await new Promise((resolve, reject) => {
        gif.on('finished', resolve)
        gif.on('abort', () => reject(new Error('GIF export aborted')))
        gif.on('error', (err) => reject(new Error(`GIF encoding error: ${err}`)))
        gif.render()
      })
      return { blob, filename: `bitmapforge-${Date.now()}.gif` }
    }
  },
  webm: {
    startMessage: 'Capturing frames…',
    successMessage: 'Video exported.',
    async execute({ manager, state, signal, fps = 30, onProgress }) {
      const canvas = manager.getCanvas()
      if (!canvas) throw new Error('No preview canvas available')

      // Legacy path (no WebCodecs)
      if (!window.VideoEncoder) {
        const loopMs = manager.getLoopDurationMs()
        const solidBg =
          !state.backgroundColor || state.backgroundColor === 'transparent' ? '#000000' : state.backgroundColor
        const minDim = 720
        const scale = Math.max(1, Math.ceil(minDim / Math.max(canvas.width, canvas.height)))
        const candidates = [
          'video/webm; codecs="vp09.00.31.08.00.01.01.01.01.00"',
          'video/webm; codecs=vp9',
          'video/webm; codecs=vp8',
          'video/webm'
        ]
        const mimeType = candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? 'video/webm'
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
        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 20_000_000 })
        const chunks = []
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data)
        }
        const result = new Promise((resolve, reject) => {
          recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
          recorder.onerror = (event) => reject(new Error(`MediaRecorder error: ${event.error?.message ?? 'unknown'}`))
        })
        try {
          recorder.start()
          await new Promise((resolve) => setTimeout(resolve, loopMs))
          recorder.stop()
          const blob = await result
          manager.clearOnFrameRendered()
          return { blob, filename: `bitmapforge-${Date.now()}.webm` }
        } catch (e) {
          manager.clearOnFrameRendered?.()
          throw e
        }
      }

      // WebCodecs MP4 path
      const frameCount = getFrameCount(manager, fps)
      const frames = await captureFrames(manager, frameCount, {
        signal,
        onProgress: (i, total) => onProgress(i, total)
      })
      const evenWidth = canvas.width % 2 === 0 ? canvas.width : canvas.width + 1
      const evenHeight = canvas.height % 2 === 0 ? canvas.height : canvas.height + 1
      const { Muxer, ArrayBufferTarget } = await import('mp4-muxer')
      const target = new ArrayBufferTarget()
      const muxer = new Muxer({
        target,
        video: { codec: 'avc', width: evenWidth, height: evenHeight },
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
        const timestamp = Math.round((i / fps) * 1_000_000)
        const duration = Math.round((1 / fps) * 1_000_000)
        const frame = frames[i]
        let frameBuffer = frame.data.buffer
        if (needsPad) {
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
      return { blob, filename: `bitmapforge-${Date.now()}.mp4` }
    }
  },
  spritesheet: {
    startMessage: 'Generating sprite sheet…',
    successMessage: 'Sprite sheet exported.',
    async execute({ manager, _state, signal, _fps = 16, onProgress }) {
      const { buildSpriteSheet } = await import('../utils/spriteSheetExport.js')
      const sourceCanvas = manager.getCanvas()
      if (!sourceCanvas) throw new Error('No preview canvas available')
      const frames = await captureFrames(manager, 24, { signal, onProgress })
      const blob = await buildSpriteSheet(frames, 6)
      return { blob, filename: `bitmapforge-spritesheet-${Date.now()}.png` }
    }
  },
  css: {
    startMessage: 'Building CSS animation…',
    successMessage: 'CSS animation exported.',
    async execute({ manager, state, signal, fps = 16, onProgress }) {
      const { buildCssAnimation } = await import('../utils/cssExport.js')
      const blob = await buildCssAnimation(manager, state, 'bitmapforge-animation', fps, {
        signal,
        onProgress
      })
      return { blob, filename: 'bitmapforge-animation-css.zip' }
    }
  },
  zip: {
    startMessage: 'Generating code ZIP…',
    successMessage: 'Code ZIP exported.',
    async execute({ _manager, state, _signal }) {
      const { buildCodeZip } = await import('../utils/codeExport.js')
      const blob = await buildCodeZip(state)
      return { blob, filename: `bitmapforge-export-${Date.now()}.zip` }
    }
  },
  react: {
    startMessage: 'Building React component…',
    successMessage: 'React component exported. Drop the MyAnimation/ folder into your project.',
    async execute({ _manager, state, _signal }) {
      const { buildReactComponent } = await import('../utils/reactComponentExport.js')
      const blob = await buildReactComponent(state)
      return { blob, filename: 'MyAnimation.zip' }
    }
  },
  webcomponent: {
    startMessage: 'Building Web Component…',
    successMessage: 'Web Component exported. See README.md inside the ZIP for usage.',
    async execute({ _manager, state, _signal }) {
      const { buildWebComponent } = await import('../utils/webComponentExport.js')
      const blob = await buildWebComponent(state)
      return { blob, filename: 'bitmap-animation.zip' }
    }
  },
  embed: {
    startMessage: 'Building Embed ZIP…',
    successMessage: 'Embed ZIP exported. Upload the folder to any web host.',
    async execute({ _manager, state, _signal }) {
      const { buildEmbedZip } = await import('../utils/embedExport.js')
      const blob = await buildEmbedZip(state)
      return { blob, filename: 'my-animation-embed.zip' }
    }
  }
}

function useExport(sceneManagerRef) {
  const setStatus = useProjectStore((state) => state.setStatus)
  const abortRef = useRef(null)

  async function executeExport(formatId, options = {}) {
    const handler = FORMAT_HANDLERS[formatId]
    if (!handler) throw new Error(`Unknown export format: ${formatId}`)

    const manager = sceneManagerRef.current
    if (!manager) return

    const state = getState()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus({ exporting: true, message: handler.startMessage })
    try {
      const { blob, filename } = await handler.execute({
        manager,
        state,
        signal: controller.signal,
        ...options,
        onProgress: (i, total) =>
          setStatus({
            exporting: true,
            message: `${handler.startMessage.replace(/…$/, '')} ${Math.round((i / total) * 100)}%`
          })
      })
      downloadBlob(blob, filename)
      setStatus({ exporting: false, message: handler.successMessage })
    } catch (error) {
      console.error('[BitmapForge] Export error:', error)
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  function cancelExport() {
    abortRef.current?.abort()
    setStatus({ exporting: false, message: 'Export cancelled.' })
  }

  async function saveProject() {
    try {
      await saveProjectFile(getState())
      setStatus({ message: 'Project saved as .bitmapforge file.' })
    } catch (error) {
      console.error('[BitmapForge] Save error:', error)
      setStatus({ error: friendlyExportError(error) })
    }
  }

  return { exportAs: executeExport, cancelExport, saveProject }
}

export { useExport }
