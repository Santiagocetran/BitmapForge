import { useDropzone } from 'react-dropzone'
import { optionalBoolean, headingRef } from '../../utils/uiPropValidators.js'
import { useProjectStore } from '../../store/useProjectStore.js'
import { BTN } from '../../styles/buttonStyles.js'

const ACCEPTED_TYPES = {
  'model/stl': ['.stl'],
  'model/gltf-binary': ['.glb'],
  'model/gltf+json': ['.gltf'],
  'text/plain': ['.obj'],
  'application/octet-stream': ['.stl', '.obj', '.glb', '.gltf']
}

// Finding 28: large model warning threshold
const SIZE_WARN_BYTES = 2 * 1024 * 1024 // 2 MB

function ModelUploader({ compact = false, chooseButtonRef } = {}) {
  const model = useProjectStore((state) => state.model)
  const setModel = useProjectStore((state) => state.setModel)
  const setStatus = useProjectStore((state) => state.setStatus)

  // Finding 28: warn when model is large
  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections.length) {
      setStatus({ error: 'Unsupported file type. Use STL, OBJ, GLTF, or GLB.' })
      return
    }
    const file = acceptedFiles[0]
    if (!file) return
    setModel(file)
    if (file.size > SIZE_WARN_BYTES) {
      setStatus({
        error: '',
        message: `${file.name} selected (${(file.size / 1024 / 1024).toFixed(1)} MB — large models may slow down rendering and exports).`
      })
    } else {
      setStatus({ error: '', message: `${file.name} selected.` })
    }
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    multiple: false,
    noClick: true
  })

  if (compact && model) {
    return (
      <div
        {...getRootProps()}
        className="bf-field flex flex-col gap-2 border-dashed p-3"
        aria-label="3D model file drop area"
      >
        {/* Finding 16: aria-label for hidden file input */}
        <input {...getInputProps()} aria-label="Upload 3D model file (STL, OBJ, GLTF, or GLB)" />
        <p className="bf-help">3D model</p>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate bf-value min-w-0" title={model.name}>
            {model.name}
          </span>
          <span className="shrink-0 bf-help">{(model.size / 1024).toFixed(1)} KB</span>
        </div>
        {/* Finding 22: standardized button styles */}
        <div className="flex gap-2">
          <button ref={chooseButtonRef} type="button" className={`flex-1 ${BTN.base} ${BTN.secondary}`} onClick={open}>
            Replace
          </button>
          <button
            type="button"
            className={`flex-1 ${BTN.base} ${BTN.danger}`}
            onClick={() => {
              setModel(null)
              setStatus({ error: '', message: '' })
            }}
          >
            Remove
          </button>
        </div>
        {isDragActive && <p className="bf-help text-center">Drop to replace model</p>}
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className="bf-field flex flex-col items-start gap-3 border-dashed p-3"
      aria-label="3D model file drop area"
    >
      {/* Finding 16: aria-label for hidden file input */}
      <input {...getInputProps()} aria-label="Upload 3D model file (STL, OBJ, GLTF, or GLB)" />
      <p className="bf-help">{isDragActive ? 'Drop model file here' : 'Drop a 3D model: STL, OBJ, GLTF or GLB.'}</p>
      {/* Finding 22: standardized button style */}
      <button ref={chooseButtonRef} type="button" className={`${BTN.base} ${BTN.primary}`} onClick={open}>
        Choose File
      </button>
    </div>
  )
}

ModelUploader.propTypes = { compact: optionalBoolean, chooseButtonRef: headingRef }

export { ModelUploader }
