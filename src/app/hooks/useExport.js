import GIF from 'gif.js'
import gifWorkerUrl from 'gif.js/dist/gif.worker.js?url'
import { useRef } from 'react'
import { useProjectStore } from '../store/useProjectStore.js'
import { buildCodeZip } from '../utils/codeExport.js'
import { buildNpmPackage } from '../utils/npmExport.js'
import { buildSingleHtml } from '../utils/singleHtmlExport.js'
import { buildApng } from '../utils/apngExport.js'
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
      const sourceCanvas = manager.getCanvas()
      if (!sourceCanvas) throw new Error('No preview canvas available')

      const frames = await captureFrames(manager, frameCount, {
        signal: controller.signal,
        onProgress: (i, total) =>
          setStatus({ exporting: true, message: `Generating sprite sheet... ${Math.round((i / total) * 100)}%` })
      })

      const { width, height } = sourceCanvas
      const rows = Math.ceil(frameCount / columns)
      const outCanvas = document.createElement('canvas')
      outCanvas.width = columns * width
      outCanvas.height = rows * height
      const outCtx = outCanvas.getContext('2d')

      for (let i = 0; i < frames.length; i++) {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = width
        tempCanvas.height = height
        tempCanvas.getContext('2d').putImageData(frames[i], 0, 0)
        outCtx.drawImage(tempCanvas, (i % columns) * width, Math.floor(i / columns) * height)
      }

      await new Promise((resolve) => {
        outCanvas.toBlob((blob) => {
          downloadBlob(blob, `bitmapforge-spritesheet-${Date.now()}.png`)
          resolve()
        }, 'image/png')
      })

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
      const loopMs = manager.getLoopDurationMs()
      const frameCount = getFrameCount(manager, fps)
      const frameDelay = Math.round(loopMs / frameCount)

      const frames = await captureFrames(manager, frameCount, {
        signal: controller.signal,
        onProgress: (i, total) =>
          setStatus({ exporting: true, message: `Encoding APNG... ${Math.round((i / total) * 100)}%` })
      })

      const blob = buildApng(frames, frameDelay)
      downloadBlob(blob, `bitmapforge-${Date.now()}.png`)
      setStatus({ exporting: false, message: 'APNG exported.' })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportVideo() {
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

  async function exportSingleHtml(fps = 16) {
    const manager = sceneManagerRef.current
    if (!manager) return

    const controller = new AbortController()
    abortRef.current = controller

    setStatus({ exporting: true, message: 'Building Single HTML...' })
    try {
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
      const blob = await buildCodeZip(state)
      downloadBlob(blob, `bitmapforge-export-${Date.now()}.zip`)
      setStatus({ exporting: false, message: 'Code ZIP exported.' })
    } catch (error) {
      setStatus({ exporting: false, error: friendlyExportError(error) })
    }
  }

  async function exportNpmPackage() {
    const state = getState()
    const { npmPackageName, npmPackageVersion } = state
    setStatus({ exporting: true, message: 'Building npm package…' })
    try {
      const blob = await buildNpmPackage(state, npmPackageName, npmPackageVersion)
      downloadBlob(blob, `${npmPackageName}-${npmPackageVersion}.zip`)
      setStatus({ exporting: false, message: 'npm package exported. Unzip and run: npm publish' })
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
    exportNpmPackage,
    saveProject,
    cancelExport
  }
}

export { useExport }
