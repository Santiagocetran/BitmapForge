import GIF from 'gif.js'
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

function useExport(sceneManagerRef) {
  const setStatus = useProjectStore((state) => state.setStatus)
  const getState = useProjectStore.getState

  async function exportSpriteSheet(frameCount = 24, columns = 6) {
    const manager = sceneManagerRef.current
    if (!manager) return
    const sourceCanvas = manager.getCanvas()
    if (!sourceCanvas) throw new Error('No preview canvas available')

    setStatus({ exporting: true, message: 'Generating sprite sheet...' })
    const width = sourceCanvas.width
    const height = sourceCanvas.height
    const rows = Math.ceil(frameCount / columns)

    const outCanvas = document.createElement('canvas')
    outCanvas.width = columns * width
    outCanvas.height = rows * height
    const outCtx = outCanvas.getContext('2d')
    const loopMs = manager.getLoopDurationMs()

    for (let i = 0; i < frameCount; i++) {
      const frameDelay = (loopMs / frameCount) * i
      await new Promise((resolve) => setTimeout(resolve, frameDelay === 0 ? 0 : 1))
      outCtx.drawImage(sourceCanvas, (i % columns) * width, Math.floor(i / columns) * height)
    }

    await new Promise((resolve) => {
      outCanvas.toBlob((blob) => {
        downloadBlob(blob, `bitmapforge-spritesheet-${Date.now()}.png`)
        resolve()
      }, 'image/png')
    })

    setStatus({ exporting: false, message: 'Sprite sheet exported.' })
  }

  async function exportGif(fps = 16) {
    const manager = sceneManagerRef.current
    if (!manager) return
    const canvas = manager.getCanvas()
    if (!canvas) throw new Error('No preview canvas available')
    setStatus({ exporting: true, message: 'Encoding GIF...' })

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height
    })

    const loopMs = manager.getLoopDurationMs()
    const frameCount = Math.max(12, Math.round((loopMs / 1000) * fps))
    const frameDelay = Math.round(1000 / fps)

    for (let i = 0; i < frameCount; i++) {
      gif.addFrame(canvas, { copy: true, delay: frameDelay })
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    await new Promise((resolve, reject) => {
      gif.on('finished', (blob) => {
        downloadBlob(blob, `bitmapforge-${Date.now()}.gif`)
        resolve()
      })
      gif.on('abort', () => reject(new Error('GIF export aborted')))
      gif.render()
    })
    setStatus({ exporting: false, message: 'GIF exported.' })
  }

  async function exportVideo(format = 'webm') {
    const manager = sceneManagerRef.current
    if (!manager) return
    const canvas = manager.getCanvas()
    if (!canvas) throw new Error('No preview canvas available')
    setStatus({ exporting: true, message: 'Recording video...' })

    const stream = canvas.captureStream(30)
    const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm'
    const recorder = new MediaRecorder(stream, { mimeType })
    const chunks = []

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }

    const result = new Promise((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
    })

    recorder.start()
    await new Promise((resolve) => setTimeout(resolve, manager.getLoopDurationMs()))
    recorder.stop()

    const blob = await result
    downloadBlob(blob, `bitmapforge-${Date.now()}.${format === 'mp4' ? 'mp4' : 'webm'}`)
    setStatus({ exporting: false, message: 'Video exported.' })
  }

  async function exportHtmlSnippet() {
    const state = getState()
    const model = state.model
    if (!model?.file) throw new Error('Upload a model before exporting HTML snippet.')
    if (model.size > 2_000_000) {
      setStatus({ message: 'Warning: HTML snippet may be large for this model size.' })
    }
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
    await navigator.clipboard.writeText(snippet)
    setStatus({ message: 'HTML snippet copied to clipboard.' })
  }

  async function exportCodeZip(engineSources = {}) {
    const state = getState()
    setStatus({ exporting: true, message: 'Generating code ZIP...' })
    const blob = await buildCodeZip(state, engineSources)
    downloadBlob(blob, `bitmapforge-export-${Date.now()}.zip`)
    setStatus({ exporting: false, message: 'Code ZIP exported.' })
  }

  async function saveProject() {
    await saveProjectFile(getState())
    setStatus({ message: 'Project saved as .bitmapforge file.' })
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
