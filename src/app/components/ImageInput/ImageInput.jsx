import { headingRef } from '../../utils/uiPropValidators.js'
import { useDropzone } from 'react-dropzone'
import { useProjectStore } from '../../store/useProjectStore.js'
import { BTN } from '../../styles/buttonStyles.js'

const ACCEPTED_IMAGE_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg']
}

function ImageInput({ chooseButtonRef } = {}) {
  const imageSource = useProjectStore((state) => state.imageSource)
  const setImageSource = useProjectStore((state) => state.setImageSource)
  const setStatus = useProjectStore((state) => state.setStatus)

  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections.length) {
      setStatus({ error: 'Unsupported file type. Use PNG, JPG, GIF, WebP, or SVG.' })
      return
    }
    const file = acceptedFiles[0]
    if (!file) return
    setImageSource(file)
    setStatus({ error: '', message: `${file.name} selected.` })
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxFiles: 1,
    multiple: false,
    noClick: true
  })

  if (imageSource) {
    return (
      <div
        {...getRootProps()}
        className="bf-field flex flex-col gap-2 border-dashed p-3"
        aria-label="Image file drop area"
      >
        <input {...getInputProps()} aria-label="Upload image file" />
        <p className="bf-help">Image</p>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate bf-value min-w-0" title={imageSource.name}>
            {imageSource.name}
          </span>
          <span className="shrink-0 bf-help">{(imageSource.size / 1024).toFixed(1)} KB</span>
        </div>
        <div className="flex gap-2">
          <button ref={chooseButtonRef} type="button" className={`flex-1 ${BTN.base} ${BTN.secondary}`} onClick={open}>
            Replace
          </button>
          <button type="button" className={`flex-1 ${BTN.base} ${BTN.danger}`} onClick={() => setImageSource(null)}>
            Remove
          </button>
        </div>
        {isDragActive && <p className="bf-help">Drop to replace image</p>}
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className="bf-field flex flex-col items-start gap-3 border-dashed p-3"
      aria-label="Image file drop area"
    >
      <input {...getInputProps()} aria-label="Upload image file" />
      <p className="bf-help">{isDragActive ? 'Drop image here' : 'Drop an image: PNG, JPG/JPEG, GIF, WebP or SVG.'}</p>
      <button ref={chooseButtonRef} type="button" className={`${BTN.base} ${BTN.primary}`} onClick={open}>
        Choose Image
      </button>
    </div>
  )
}

ImageInput.propTypes = { chooseButtonRef: headingRef }

export { ImageInput }
