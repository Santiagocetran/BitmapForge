import GIF from 'gif.js'
import gifWorkerUrl from 'gif.js/dist/gif.worker.js?url'
import { useProjectStore } from '../store/useProjectStore.js'
import { buildCodeZip } from '../utils/codeExport.js'
import { saveProjectFile } from '../utils/projectFile.js'

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

// Pause the live preview loop, run fn(), then always resume.
async function withPausedScene(manager, fn) {
  manager.pauseLoop()
  try {
    await fn()
  } finally {
    manager.resumeLoop()
  }
}

function useExport(sceneManagerRef) {
  const setStatus = useProjectStore((state) => state.setStatus)
  const getState = useProjectStore.getState

  async function exportSpriteSheet(frameCount = 24, columns = 6) {
    const manager = sceneManagerRef.current
    if (!manager) return
    const sourceCanvas = manager.getCanvas()
    if (!sourceCanvas) throw new Error('No preview canvas available')

    setStatus({ exporting: true, message: 'Generating sprite sheet...' })
    try {
      const width = sourceCanvas.width
      const height = sourceCanvas.height
      const rows = Math.ceil(frameCount / columns)
      const loopMs = manager.getLoopDurationMs()

      const outCanvas = document.createElement('canvas')
      outCanvas.width = columns * width
      outCanvas.height = rows * height
      const outCtx = outCanvas.getContext('2d')

      await withPausedScene(manager, async () => {
        for (let i = 0; i < frameCount; i++) {
          manager.renderAtTime((i / frameCount) * loopMs)
          outCtx.drawImage(sourceCanvas, (i % columns) * width, Math.floor(i / columns) * height)
        }
      })

      await new Promise((resolve) => {
        outCanvas.toBlob((blob) => {
          downloadBlob(blob, `bitmapforge-spritesheet-${Date.now()}.png`)
          resolve()
        }, 'image/png')
      })

      setStatus({ exporting: false, message: 'Sprite sheet exported.' })
    } catch (error) {
      setStatus({ exporting: false, error: `Sprite sheet export failed: ${error.message}` })
    }
  }

  async function exportGif(fps = 16) {
    const manager = sceneManagerRef.current
    if (!manager) return
    const canvas = manager.getCanvas()
    if (!canvas) throw new Error('No preview canvas available')
    setStatus({ exporting: true, message: 'Encoding GIF...' })

    try {
      const loopMs = manager.getLoopDurationMs()
      const frameCount = Math.max(12, Math.round((loopMs / 1000) * fps))
      const frameDelay = Math.round(loopMs / frameCount)

      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: canvas.width,
        height: canvas.height,
        workerScript: gifWorkerUrl
      })

      await withPausedScene(manager, async () => {
        for (let i = 0; i < frameCount; i++) {
          manager.renderAtTime((i / frameCount) * loopMs)
          gif.addFrame(canvas, { copy: true, delay: frameDelay })
        }
      })

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
      setStatus({ exporting: false, error: `GIF export failed: ${error.message}` })
    }
  }

  async function exportVideo(format = 'webm') {
    const manager = sceneManagerRef.current
    if (!manager) return
    const canvas = manager.getCanvas()
    if (!canvas) throw new Error('No preview canvas available')
    setStatus({ exporting: true, message: 'Recording video...' })

    try {
      const loopMs = manager.getLoopDurationMs()
      const state = getState()

      // Pick the best codec supported by this browser
      const candidates = format === 'mp4'
        ? ['video/mp4; codecs="avc1.42E01E"', 'video/mp4']
        : ['video/webm; codecs=vp9', 'video/webm; codecs=vp8', 'video/webm']
      const mimeType = candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? 'video/webm'
      const ext = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm'

      // Capture through an opaque composite canvas so the encoder never sees
      // semi-transparent pixels (which get composited against black in the
      // encoded stream, causing colors to appear darker than the preview).
      const solidBg = (!state.backgroundColor || state.backgroundColor === 'transparent')
        ? '#000000'
        : state.backgroundColor
      const compositeCanvas = document.createElement('canvas')
      compositeCanvas.width = canvas.width
      compositeCanvas.height = canvas.height
      const compositeCtx = compositeCanvas.getContext('2d')

      manager.setOnFrameRendered(() => {
        compositeCtx.fillStyle = solidBg
        compositeCtx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height)
        compositeCtx.drawImage(canvas, 0, 0)
      })

      // Snap animation back to the start of the loop before recording
      manager.resetToLoopStart()

      const stream = compositeCanvas.captureStream(30)
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 12_000_000
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
      downloadBlob(blob, `bitmapforge-${Date.now()}.${ext}`)
      setStatus({ exporting: false, message: 'Video exported.' })
    } catch (error) {
      manager.clearOnFrameRendered()
      setStatus({ exporting: false, error: `Video export failed: ${error.message}` })
    }
  }

  async function exportHtmlSnippet() {
    const state = getState()
    const model = state.model
    if (!model?.file) throw new Error('Upload a model before exporting HTML snippet.')
    if (model.size > 2_000_000) {
      setStatus({ message: 'Warning: HTML snippet may be large for this model size.' })
    }
    try {
      const modelData = await model.file.arrayBuffer()
      const bytes = new Uint8Array(modelData)
      let binary = ''
      const chunk = 0x8000
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
      }
      const modelBase64 = btoa(binary)
      const snippet = `<div id="bitmapforge-embed"></div>
<script>
window.BitmapForgeConfig = ${JSON.stringify({
  modelName: model.name,
  modelType: model.file.type || 'application/octet-stream',
  modelData: modelBase64,
  settings: {
    colors: state.colors,
    pixelSize: state.pixelSize,
    ditherType: state.ditherType
  }
})}
</script>`
      try {
        await navigator.clipboard.writeText(snippet)
        setStatus({ message: 'HTML snippet copied to clipboard.' })
      } catch {
        setStatus({ error: 'Could not copy to clipboard. Make sure the page is served over HTTPS and clipboard permission is granted.' })
      }
    } catch (error) {
      setStatus({ error: `HTML snippet export failed: ${error.message}` })
    }
  }

  async function exportCodeZip(engineSources = {}) {
    const state = getState()
    setStatus({ exporting: true, message: 'Generating code ZIP...' })
    try {
      const blob = await buildCodeZip(state, engineSources)
      downloadBlob(blob, `bitmapforge-export-${Date.now()}.zip`)
      setStatus({ exporting: false, message: 'Code ZIP exported.' })
    } catch (error) {
      setStatus({ exporting: false, error: `ZIP export failed: ${error.message}` })
    }
  }

  async function saveProject() {
    try {
      await saveProjectFile(getState())
      setStatus({ message: 'Project saved as .bitmapforge file.' })
    } catch (error) {
      setStatus({ error: `Save failed: ${error.message}` })
    }
  }

  return {
    exportSpriteSheet,
    exportGif,
    exportVideo,
    exportHtmlSnippet,
    exportCodeZip,
    saveProject
  }
}

export { useExport }
