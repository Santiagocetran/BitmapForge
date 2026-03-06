import { useState } from 'react'
import { BUILT_IN_PRESETS } from '../../data/builtInPresets.js'
import { usePresetStore } from '../../store/usePresetStore.js'
import { useProjectStore } from '../../store/useProjectStore.js'
import { BTN } from '../../styles/buttonStyles.js'

function ColorSwatches({ colors }) {
  return (
    <div className="flex gap-0.5">
      {colors.slice(0, 5).map((c, i) => (
        <div key={i} className="h-2 flex-1 rounded-sm" style={{ backgroundColor: c }} />
      ))}
    </div>
  )
}

function applyPreset(preset) {
  // Single setState call = one undo history entry
  useProjectStore.setState({
    colors: preset.settings.colors,
    pixelSize: preset.settings.pixelSize,
    ditherType: preset.settings.ditherType,
    invert: preset.settings.invert,
    minBrightness: preset.settings.minBrightness,
    backgroundColor: preset.settings.backgroundColor
  })
}

function PresetGallery() {
  const { customPresets, saveCurrentPreset, deletePreset } = usePresetStore()
  const [saveName, setSaveName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)

  function onSave() {
    const name = saveName.trim()
    if (!name) return
    saveCurrentPreset(name)
    setSaveName('')
    setShowSaveInput(false)
  }

  const allPresets = [...BUILT_IN_PRESETS, ...customPresets]

  return (
    <section className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        {allPresets.map((preset) => (
          <div key={preset.id} className="group relative">
            <button
              type="button"
              onClick={() => applyPreset(preset)}
              className="w-full rounded border border-zinc-700 bg-zinc-900 p-1.5 text-left hover:border-zinc-500 focus:border-emerald-500 focus:outline-none"
            >
              <span className="mb-1 block truncate text-xs text-zinc-300">{preset.name}</span>
              <ColorSwatches colors={preset.settings.colors} />
            </button>
            {preset.category === 'custom' && (
              <button
                type="button"
                onClick={() => deletePreset(preset.id)}
                className="absolute right-0.5 top-0.5 hidden rounded px-1 text-xs text-zinc-500 hover:text-red-400 group-hover:block"
                aria-label={`Delete preset ${preset.name}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {showSaveInput ? (
        <div className="flex gap-1">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            placeholder="Preset name…"
            autoFocus
            className="min-w-0 flex-1 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button type="button" onClick={onSave} className={`${BTN.base} ${BTN.primary} text-xs`}>
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setShowSaveInput(false)
              setSaveName('')
            }}
            className={`${BTN.base} ${BTN.secondary} text-xs`}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowSaveInput(true)}
          className={`w-full ${BTN.base} ${BTN.secondary} text-xs`}
        >
          + Save current as preset
        </button>
      )}
    </section>
  )
}

export { PresetGallery }
