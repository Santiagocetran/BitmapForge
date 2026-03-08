import { Plus } from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore.js'
import { registerFile } from '../../store/fileRegistry.js'
import { ModelUploader } from '../ModelUploader/ModelUploader.jsx'
import { ShapeSelector } from '../ShapeSelector/ShapeSelector.jsx'
import { TextInput } from '../TextInput/TextInput.jsx'
import { ImageInput } from '../ImageInput/ImageInput.jsx'

const TABS = [
  { key: 'model', label: '3D Model' },
  { key: 'shape', label: 'Shapes' },
  { key: 'text', label: 'Text' },
  { key: 'image', label: 'Image' }
]

const DEFAULT_TRANSFORM = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1
}

/**
 * Build a LayerDescriptor from current store state and the active input type.
 * Returns null if nothing is ready to add (e.g. no model file selected yet).
 */
function buildDescriptor(state) {
  const id = crypto.randomUUID()
  const base = { id, visible: true, ...DEFAULT_TRANSFORM }

  switch (state.inputType) {
    case 'model': {
      const file = state.model?.file
      if (!file) return null
      registerFile(id, file)
      return {
        ...base,
        type: 'model',
        name: file.name,
        fileName: file.name,
        fileSize: file.size,
        format: state.model.format
      }
    }
    case 'shape':
      return {
        ...base,
        type: 'shape',
        name: `${state.shapeType} shape`,
        shapeType: state.shapeType,
        shapeParams: { ...state.shapeParams }
      }
    case 'text':
      return {
        ...base,
        type: 'text',
        name: `Text "${state.textContent.slice(0, 12)}"`,
        textContent: state.textContent,
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        extrudeDepth: state.extrudeDepth,
        bevelEnabled: state.bevelEnabled
      }
    case 'image': {
      const file = state.imageSource
      if (!file) return null
      registerFile(id, file)
      return {
        ...base,
        type: 'image',
        name: file.name,
        fileName: file.name,
        fileSize: file.size
      }
    }
    default:
      return null
  }
}

function InputSource() {
  const inputType = useProjectStore((state) => state.inputType)
  const model = useProjectStore((state) => state.model)
  const imageSource = useProjectStore((state) => state.imageSource)
  const setInputType = useProjectStore((state) => state.setInputType)
  const addLayer = useProjectStore((state) => state.addLayer)

  function handleAddToScene() {
    const state = useProjectStore.getState()
    const descriptor = buildDescriptor(state)
    if (!descriptor) return
    addLayer(descriptor)
  }

  const canAdd =
    inputType === 'shape' ||
    inputType === 'text' ||
    (inputType === 'model' && Boolean(model)) ||
    (inputType === 'image' && Boolean(imageSource))

  return (
    <div className="space-y-3">
      <div className="flex rounded-lg bg-zinc-800 p-0.5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setInputType(key)}
            className={`flex-1 rounded-md px-1 py-1.5 text-xs font-medium transition ${
              inputType === key ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {inputType === 'model' && <ModelUploader compact={Boolean(model)} />}
      {inputType === 'shape' && <ShapeSelector />}
      {inputType === 'text' && <TextInput />}
      {inputType === 'image' && <ImageInput />}

      <button
        type="button"
        onClick={handleAddToScene}
        disabled={!canAdd}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-900/40 px-3 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-800/50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={14} />
        Add to Scene
      </button>
    </div>
  )
}

export { InputSource }
