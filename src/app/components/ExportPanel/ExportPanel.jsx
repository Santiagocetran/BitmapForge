import { useState } from 'react'
import { useExport } from '../../hooks/useExport.js'
import { useProjectStore } from '../../store/useProjectStore.js'
import { useSceneManager } from '../../context/SceneManagerContext.jsx'
import { loadProjectFile } from '../../utils/projectFile.js'
import { BTN } from '../../styles/buttonStyles.js'

const FORMAT_OPTIONS = [
  { value: 'apng', label: 'APNG', description: 'Best for web — full color, transparency' },
  { value: 'gif', label: 'GIF', description: 'Max compatibility' },
  { value: 'webm', label: 'Video', description: 'WebM — best quality' },
  { value: 'spritesheet', label: 'Sprite Sheet', description: 'PNG grid for CSS/JS' },
  { value: 'html', label: 'Single HTML', description: 'Self-contained embed file' },
  { value: 'zip', label: 'Code ZIP', description: 'Vite project with full engine' },
  { value: 'npm', label: 'NPM Pkg', description: 'npm-publishable package for any app or website' }
]

function ExportPanel() {
  const sceneManagerRef = useSceneManager()
  const {
    exportSpriteSheet,
    exportGif,
    exportApng,
    exportVideo,
    exportSingleHtml,
    exportCodeZip,
    exportNpmPackage,
    saveProject
  } = useExport(sceneManagerRef)
  const status = useProjectStore((state) => state.status)
  const setStatus = useProjectStore((state) => state.setStatus)
  const setModel = useProjectStore((state) => state.setModel)
  const npmPackageName = useProjectStore((s) => s.npmPackageName)
  const npmPackageVersion = useProjectStore((s) => s.npmPackageVersion)
  const setNpmPackageName = useProjectStore((s) => s.setNpmPackageName)
  const setNpmPackageVersion = useProjectStore((s) => s.setNpmPackageVersion)

  const [selectedFormat, setSelectedFormat] = useState('apng')

  async function onExport() {
    setStatus({ error: '', message: '' })
    const map = {
      apng: () => exportApng(),
      gif: () => exportGif(),
      webm: () => exportVideo(),
      spritesheet: () => exportSpriteSheet(),
      html: () => exportSingleHtml(),
      zip: () => exportCodeZip(),
      npm: () => exportNpmPackage()
    }
    await map[selectedFormat]?.()
  }

  async function onLoadProject(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const currentModel = useProjectStore.getState().model
    if (currentModel && !window.confirm('Loading a project will replace your current settings and model. Continue?')) {
      event.target.value = ''
      return
    }
    try {
      const { settings, modelFile } = await loadProjectFile(file)
      useProjectStore.setState((state) => ({ ...state, ...settings }))
      if (modelFile) setModel(modelFile)
      setStatus({ message: 'Project loaded.', error: '' })
    } catch (error) {
      setStatus({ error: error.message })
    }
  }

  const selectedOption = FORMAT_OPTIONS.find((f) => f.value === selectedFormat)

  return (
    <section className="space-y-2">
      <div className="grid grid-cols-3 gap-1">
        {FORMAT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelectedFormat(value)}
            className={`${BTN.base} px-2 py-1 ${
              selectedFormat === value ? 'bg-emerald-600 text-black' : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {selectedOption?.description && <p className="text-xs text-zinc-400">{selectedOption.description}</p>}

      {selectedFormat === 'npm' && (
        <div className="space-y-1">
          <div>
            <label className="text-xs text-zinc-400">Package name</label>
            <input
              type="text"
              value={npmPackageName}
              onChange={(e) => setNpmPackageName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="w-full bg-zinc-800 text-zinc-100 text-xs px-2 py-1 rounded border border-zinc-600 mt-0.5"
              placeholder="my-animation-package"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Version</label>
            <input
              type="text"
              value={npmPackageVersion}
              onChange={(e) => setNpmPackageVersion(e.target.value)}
              className="w-full bg-zinc-800 text-zinc-100 text-xs px-2 py-1 rounded border border-zinc-600 mt-0.5"
              placeholder="1.0.0"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={status.exporting}
        onClick={onExport}
        className={`w-full ${BTN.base} ${BTN.primary} disabled:opacity-50`}
      >
        {status.exporting ? status.message || 'Exporting…' : `Export ${selectedOption?.label}`}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={`${BTN.base} ${BTN.secondary}`} onClick={() => saveProject()}>
          Save .bitmapforge
        </button>
        <label
          className={`${BTN.base} bg-zinc-800 px-2 py-1 text-center text-zinc-200 cursor-pointer hover:bg-zinc-700`}
        >
          Load .bitmapforge
          <input
            type="file"
            accept=".bitmapforge"
            className="hidden"
            onChange={onLoadProject}
            aria-label="Load BitmapForge project file"
          />
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
