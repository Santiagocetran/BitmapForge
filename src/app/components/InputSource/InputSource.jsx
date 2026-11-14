import { useLayoutEffect, useRef } from 'react'
import { useProjectStore } from '../../store/useProjectStore.js'
import { navigationRef as navigationRefContract } from '../../utils/uiPropValidators.js'
import { ModelUploader } from '../ModelUploader/ModelUploader.jsx'
import { ShapeSelector } from '../ShapeSelector/ShapeSelector.jsx'
import { TextInput } from '../TextInput/TextInput.jsx'
import { ImageInput } from '../ImageInput/ImageInput.jsx'

const SOURCE_TYPES = [
  { key: 'model', label: '3D model' },
  { key: 'shape', label: 'Shapes' },
  { key: 'text', label: 'Text' },
  { key: 'image', label: 'Image' }
]

function InputSource({ navigationRef } = {}) {
  const inputType = useProjectStore((state) => state.inputType)
  const model = useProjectStore((state) => state.model)
  const setInputType = useProjectStore((state) => state.setInputType)
  const modelScale = useProjectStore((state) => state.modelScale)
  const setModelScale = useProjectStore((state) => state.setModelScale)
  const imageScale = useProjectStore((state) => state.imageScale)
  const setImageScale = useProjectStore((state) => state.setImageScale)
  const imageSource = useProjectStore((state) => state.imageSource)
  const modelButtonRef = useRef(null)
  const imageButtonRef = useRef(null)
  const shapeButtonRef = useRef(null)
  const textRef = useRef(null)

  useLayoutEffect(() => {
    if (!navigationRef) return
    const targets = { model: modelButtonRef, image: imageButtonRef, shape: shapeButtonRef, text: textRef }
    const handle = {
      focusSource(kind) {
        const target = Object.hasOwn(targets, kind) ? targets[kind].current : null
        if (
          !target?.isConnected ||
          target.disabled ||
          target.closest('[hidden], [inert], [aria-hidden="true"]') ||
          target.ownerDocument.defaultView.getComputedStyle(target).visibility === 'hidden' ||
          !target.getClientRects().length
        )
          return false
        target.focus({ preventScroll: true })
        if (target.ownerDocument.activeElement !== target) return false
        target.scrollIntoView?.({ behavior: 'instant', block: 'nearest', inline: 'nearest' })
        return true
      }
    }
    navigationRef.current = handle
    return () => {
      if (navigationRef.current === handle) navigationRef.current = null
    }
  }, [navigationRef])

  return (
    <div className="bf-control-group">
      <div role="group" aria-label="Source type" className="bf-choice-grid">
        {SOURCE_TYPES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={inputType === key}
            onClick={() => setInputType(key)}
            className="bf-choice"
          >
            {inputType === key && (
              <span aria-hidden="true" className="mr-1">
                ✓
              </span>
            )}
            {label}
          </button>
        ))}
      </div>
      {inputType === 'model' && <ModelUploader compact={Boolean(model)} chooseButtonRef={modelButtonRef} />}
      {inputType === 'model' && model && (
        <div>
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="input-model-scale" className="bf-label">
              Model scale
            </label>
            <span className="bf-value">{modelScale.toFixed(2)}×</span>
          </div>
          <input
            id="input-model-scale"
            type="range"
            min="0.1"
            max="10"
            step="0.05"
            value={modelScale}
            onChange={(e) => setModelScale(Number(e.target.value))}
            className="bf-range"
            aria-describedby="input-model-scale-help"
          />
          <p id="input-model-scale-help" className="bf-help">
            Uniformly scales the model, not the workspace view.
          </p>
        </div>
      )}
      {inputType === 'shape' && <ShapeSelector selectedShapeRef={shapeButtonRef} />}
      {inputType === 'text' && <TextInput textareaRef={textRef} />}
      {inputType === 'image' && <ImageInput chooseButtonRef={imageButtonRef} />}
      {inputType === 'image' && imageSource && (
        <div>
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="input-image-scale" className="bf-label">
              Image scale
            </label>
            <span className="bf-value">{imageScale.toFixed(2)}×</span>
          </div>
          <input
            id="input-image-scale"
            type="range"
            min="0.1"
            max="10"
            step="0.05"
            value={imageScale}
            onChange={(e) => setImageScale(Number(e.target.value))}
            className="bf-range"
            aria-describedby="input-image-scale-help"
          />
          <p id="input-image-scale-help" className="bf-help">
            Uniformly scales the image, not the workspace view.
          </p>
        </div>
      )}
    </div>
  )
}

InputSource.propTypes = { navigationRef: navigationRefContract }

export { InputSource }
