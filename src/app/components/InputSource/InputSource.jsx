import { useProjectStore } from '../../store/useProjectStore.js'
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

function InputSource() {
  const inputType = useProjectStore((state) => state.inputType)
  const model = useProjectStore((state) => state.model)
  const setInputType = useProjectStore((state) => state.setInputType)

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
    </div>
  )
}

export { InputSource }
