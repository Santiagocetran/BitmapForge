import { useProjectStore } from '../../store/useProjectStore.js'
import { getShapeTypes, getDefaultParams, getShapeLabels } from '../../../engine/loaders/shapeGenerator.js'

const SHAPE_TYPES = getShapeTypes()
const SHAPE_LABELS = getShapeLabels()

const SHAPE_PARAMS_CONFIG = {
  cube: [{ key: 'size', label: 'Size', min: 0.1, max: 3, step: 0.1 }],
  sphere: [
    { key: 'radius', label: 'Radius', min: 0.1, max: 3, step: 0.1 },
    { key: 'widthSegments', label: 'Segments', min: 4, max: 64, step: 1 }
  ],
  torus: [
    { key: 'radius', label: 'Radius', min: 0.1, max: 2, step: 0.1 },
    { key: 'tube', label: 'Tube', min: 0.05, max: 1, step: 0.05 }
  ],
  cylinder: [
    { key: 'radiusTop', label: 'Radius Top', min: 0, max: 2, step: 0.1 },
    { key: 'radiusBottom', label: 'Radius Bottom', min: 0, max: 2, step: 0.1 },
    { key: 'height', label: 'Height', min: 0.1, max: 4, step: 0.1 }
  ],
  cone: [
    { key: 'radius', label: 'Radius', min: 0.1, max: 2, step: 0.1 },
    { key: 'height', label: 'Height', min: 0.1, max: 4, step: 0.1 }
  ],
  icosahedron: [
    { key: 'radius', label: 'Radius', min: 0.1, max: 3, step: 0.1 },
    { key: 'detail', label: 'Detail', min: 0, max: 4, step: 1 }
  ],
  torusKnot: [
    { key: 'radius', label: 'Radius', min: 0.1, max: 2, step: 0.1 },
    { key: 'tube', label: 'Tube', min: 0.05, max: 0.5, step: 0.05 }
  ],
  plane: [
    { key: 'width', label: 'Width', min: 0.1, max: 4, step: 0.1 },
    { key: 'height', label: 'Height', min: 0.1, max: 4, step: 0.1 }
  ]
}

function ShapeSelector() {
  const shapeType = useProjectStore((state) => state.shapeType)
  const shapeParams = useProjectStore((state) => state.shapeParams)
  const setShapeType = useProjectStore((state) => state.setShapeType)
  const setShapeParam = useProjectStore((state) => state.setShapeParam)

  const defaults = getDefaultParams(shapeType)
  const paramConfigs = SHAPE_PARAMS_CONFIG[shapeType] ?? []

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1">
        {SHAPE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setShapeType(type)}
            className={`rounded px-1 py-2 text-xs transition ${
              type === shapeType ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {SHAPE_LABELS[type]}
          </button>
        ))}
      </div>

      {paramConfigs.length > 0 && (
        <div className="space-y-2">
          {paramConfigs.map(({ key, label, min, max, step }) => {
            const value = shapeParams[key] ?? defaults[key] ?? min
            return (
              <div key={key}>
                <label className="flex justify-between text-xs text-zinc-400">
                  <span>{label}</span>
                  <span>{Number(value).toFixed(step < 1 ? 2 : 0)}</span>
                </label>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => setShapeParam(key, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { ShapeSelector }
