import { useState } from 'react'
import { useExport } from '../../hooks/useExport.js'
import { useProjectStore } from '../../store/useProjectStore.js'
import { useSceneManager } from '../../context/SceneManagerContext.jsx'
import { loadProjectFile } from '../../utils/projectFile.js'
import { BTN } from '../../styles/buttonStyles.js'

const FORMAT_OPTIONS = [
  {
    value: 'apng',
    label: 'APNG',
    description:
      'Animated PNG. Full color, transparent background supported. Best for embedding in websites or sharing.'
  },
  {
    value: 'gif',
    label: 'GIF',
    description: 'Classic animated GIF. Universal compatibility. 256-color limit, no partial transparency.'
  },
  {
    value: 'webm',
    label: 'Video',
    description: 'MP4 (WebM fallback). Best quality for presentations or social media.'
  },
  {
    value: 'spritesheet',
    label: 'Sprite Sheet',
    description: 'PNG grid of all frames. For game engines (Phaser, Unity) or custom code.'
  },
  {
    value: 'css',
    label: 'CSS Anim',
    description: 'Pure CSS + sprite sheet. Drop into any website — no JavaScript needed.'
  },
  {
    value: 'react',
    label: 'React',
    description: 'React component with the live animation engine. Drop into any React/Vite project.'
  },
  {
    value: 'webcomponent',
    label: 'Web Comp',
    description: '<bitmap-animation> custom element. Works in any framework or plain HTML.'
  },
  { value: 'embed', label: 'Embed', description: 'Static site ready to deploy. Upload to any web host.' },
  {
    value: 'zip',
    label: 'Code ZIP',
    description: 'Full engine source code. For developers who want to build their own integration.'
  }
]

function ExportPanel() {
  const sceneManagerRef = useSceneManager()
  const {
    exportSpriteSheet,
    exportGif,
    exportApng,
    exportVideo,
    exportCodeZip,
    exportReactComponent,
    exportWebComponent,
    exportCssAnimation,
    exportEmbed,
    saveProject
  } = useExport(sceneManagerRef)
  const status = useProjectStore((state) => state.status)
  const setStatus = useProjectStore((state) => state.setStatus)
  const setModel = useProjectStore((state) => state.setModel)
  const inputType = useProjectStore((s) => s.inputType)

  const [selectedFormat, setSelectedFormat] = useState('apng')

  async function onExport() {
    setStatus({ error: '', message: '' })
    const map = {
      apng: () => exportApng(),
      gif: () => exportGif(),
      webm: () => exportVideo(),
      spritesheet: () => exportSpriteSheet(),
      zip: () => exportCodeZip(),
      react: () => exportReactComponent(),
      webcomponent: () => exportWebComponent(),
      css: () => exportCssAnimation(),
      embed: () => exportEmbed()
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

      {selectedFormat === 'embed' && inputType === 'image' && (
        <p className="text-xs text-amber-400">Image input cannot be embedded — switch to model, shape, or text.</p>
      )}

      <button
        type="button"
        disabled={status.exporting || (selectedFormat === 'embed' && inputType === 'image')}
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
