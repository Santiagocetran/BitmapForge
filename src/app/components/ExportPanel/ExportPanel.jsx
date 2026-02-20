import { useState } from 'react'
import { useExport } from '../../hooks/useExport.js'
import { useProjectStore } from '../../store/useProjectStore.js'
import { loadProjectFile } from '../../utils/projectFile.js'

const FORMAT_OPTIONS = [
  { value: 'gif',         label: 'GIF' },
  { value: 'webm',        label: 'WebM' },
  { value: 'mp4',         label: 'MP4' },
  { value: 'spritesheet', label: 'Sprite Sheet' },
  { value: 'html',        label: 'HTML Snippet' },
  { value: 'zip',         label: 'Code ZIP' },
]

function ExportPanel({ sceneManagerRef }) {
  const { exportSpriteSheet, exportGif, exportVideo, exportHtmlSnippet, exportCodeZip, saveProject } = useExport(sceneManagerRef)
  const status = useProjectStore((state) => state.status)
  const setStatus = useProjectStore((state) => state.setStatus)
  const setModel = useProjectStore((state) => state.setModel)

  const [selectedFormat, setSelectedFormat] = useState('gif')

  async function onExport() {
    const map = {
      gif:         () => exportGif(),
      webm:        () => exportVideo('webm'),
      mp4:         () => exportVideo('mp4'),
      spritesheet: () => exportSpriteSheet(),
      html:        () => exportHtmlSnippet(),
      zip:         () => exportCodeZip(),
    }
    await map[selectedFormat]?.()
  }

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
      <div className="grid grid-cols-3 gap-1">
        {FORMAT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelectedFormat(value)}
            className={`rounded px-2 py-1 text-xs ${
              selectedFormat === value
                ? 'bg-emerald-600 text-black'
                : 'bg-zinc-700 text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={status.exporting}
        onClick={onExport}
        className="w-full rounded bg-emerald-500 px-2 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
      >
        {status.exporting ? status.message || 'Exporting…' : `Export ${FORMAT_OPTIONS.find((f) => f.value === selectedFormat)?.label}`}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="rounded bg-zinc-600 px-2 py-1 text-xs" onClick={() => saveProject()}>
          Save .bitmapforge
        </button>
        <label className="rounded bg-zinc-700 px-2 py-1 text-center text-xs cursor-pointer">
          Load .bitmapforge
          <input type="file" accept=".bitmapforge" className="hidden" onChange={onLoadProject} />
        </label>
      </div>

      {status.error && <p className="text-xs text-red-400">{status.error}</p>}
      {!status.exporting && !status.error && status.message && (
        <p className="text-xs text-emerald-300">{status.message}</p>
      )}
    </section>
  )
}

export { ExportPanel }
