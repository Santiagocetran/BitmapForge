import { useExport } from '../../hooks/useExport.js'
import { useProjectStore } from '../../store/useProjectStore.js'
import { loadProjectFile } from '../../utils/projectFile.js'

function ExportPanel({ sceneManagerRef }) {
  const { exportSpriteSheet, exportGif, exportVideo, exportHtmlSnippet, exportCodeZip, saveProject } = useExport(sceneManagerRef)
  const status = useProjectStore((state) => state.status)
  const setStatus = useProjectStore((state) => state.setStatus)
  const setModel = useProjectStore((state) => state.setModel)

  async function onLoadProject(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const { settings, modelFile } = await loadProjectFile(file)
      useProjectStore.setState((state) => ({ ...state, ...settings }))
      if (modelFile) setModel(modelFile)
      setStatus({ message: 'Project loaded.', error: '' })
    } catch (error) {
      setStatus({ error: error.message })
    }
  }

  return (
    <section className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="rounded bg-zinc-700 px-2 py-1 text-xs" onClick={() => exportGif()}>
          GIF
        </button>
        <button type="button" className="rounded bg-zinc-700 px-2 py-1 text-xs" onClick={() => exportVideo('webm')}>
          WebM
        </button>
        <button type="button" className="rounded bg-zinc-700 px-2 py-1 text-xs" onClick={() => exportVideo('mp4')}>
          MP4
        </button>
        <button type="button" className="rounded bg-zinc-700 px-2 py-1 text-xs" onClick={() => exportSpriteSheet()}>
          Sprite Sheet
        </button>
        <button type="button" className="rounded bg-zinc-700 px-2 py-1 text-xs" onClick={exportHtmlSnippet}>
          HTML Snippet
        </button>
        <button type="button" className="rounded bg-zinc-700 px-2 py-1 text-xs" onClick={() => exportCodeZip()}>
          Code ZIP
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="rounded bg-emerald-600 px-2 py-1 text-xs text-black" onClick={() => saveProject()}>
          Save .bitmapforge
        </button>
        <label className="rounded bg-zinc-700 px-2 py-1 text-center text-xs">
          Load .bitmapforge
          <input type="file" accept=".bitmapforge" className="hidden" onChange={onLoadProject} />
        </label>
      </div>

      {status.exporting && <p className="text-xs text-emerald-300">{status.message}</p>}
    </section>
  )
}

export { ExportPanel }
