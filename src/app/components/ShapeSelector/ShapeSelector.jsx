import { headingRef } from '../../utils/uiPropValidators.js'
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

function ShapeSelector({ selectedShapeRef } = {}) {
  const shapeType = useProjectStore((state) => state.shapeType)
  const shapeParams = useProjectStore((state) => state.shapeParams)
  const setShapeType = useProjectStore((state) => state.setShapeType)
  const setShapeParam = useProjectStore((state) => state.setShapeParam)

  const defaults = getDefaultParams(shapeType)
  const paramConfigs = SHAPE_PARAMS_CONFIG[shapeType] ?? []

  return (
    <div className="space-y-3">
      <div role="group" aria-label="Shape" className="bf-choice-grid">
        {SHAPE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setShapeType(type)}
            ref={type === shapeType ? selectedShapeRef : null}
            aria-pressed={type === shapeType}
            className="bf-choice"
          >
            {type === shapeType && <span aria-hidden="true">✓ </span>}
            {SHAPE_LABELS[type]}
          </button>
        ))}
      </div>

      {paramConfigs.length > 0 && (
        <div className="bf-group">
          <h3 className="bf-group-title">Geometry</h3>
          {paramConfigs.map(({ key, label, min, max, step }) => {
            const value = shapeParams[key] ?? defaults[key] ?? min
            return (
              <div key={key}>
                <div className="flex justify-between gap-2">
                  <label htmlFor={`shape-${key}`} className="bf-label">
                    {label}
                  </label>
                  <span className="bf-value">{Number(value).toFixed(step < 1 ? 2 : 0)}</span>
                </div>
                <input
                  id={`shape-${key}`}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => setShapeParam(key, Number(e.target.value))}
                  className="bf-range"
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

ShapeSelector.propTypes = { selectedShapeRef: headingRef }

export { ShapeSelector }
