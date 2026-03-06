import { useProjectStore } from '../../store/useProjectStore.js'
import { FONT_LABELS } from '../../../engine/loaders/textGenerator.js'

function TextInput() {
  const textContent = useProjectStore((state) => state.textContent)
  const fontSize = useProjectStore((state) => state.fontSize)
  const extrudeDepth = useProjectStore((state) => state.extrudeDepth)
  const bevelEnabled = useProjectStore((state) => state.bevelEnabled)
  const fontFamily = useProjectStore((state) => state.fontFamily)
  const setTextContent = useProjectStore((state) => state.setTextContent)
  const setFontSize = useProjectStore((state) => state.setFontSize)
  const setExtrudeDepth = useProjectStore((state) => state.setExtrudeDepth)
  const setBevelEnabled = useProjectStore((state) => state.setBevelEnabled)
  const setFontFamily = useProjectStore((state) => state.setFontFamily)

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-zinc-400">Text</label>
        <input
          type="text"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="BitmapForge"
          className="w-full rounded bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          maxLength={32}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-400">Font</label>
        <select
          className="w-full rounded bg-zinc-800 p-1 text-sm"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          {Object.entries(FONT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex justify-between text-xs text-zinc-400">
          <span>Font Size</span>
          <span>{fontSize.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min="0.2"
          max="2"
          step="0.1"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="flex justify-between text-xs text-zinc-400">
          <span>Extrude Depth</span>
          <span>{extrudeDepth.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0.05"
          max="1"
          step="0.05"
          value={extrudeDepth}
          onChange={(e) => setExtrudeDepth(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input
          type="checkbox"
          checked={bevelEnabled}
          onChange={(e) => setBevelEnabled(e.target.checked)}
          className="accent-emerald-500"
        />
        Bevel
      </label>
    </div>
  )
}

export { TextInput }
