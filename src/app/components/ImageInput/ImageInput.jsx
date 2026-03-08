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

function ImageInput() {
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
        className={`rounded-xl border border-dashed p-3 transition ${
          isDragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-zinc-600 bg-zinc-800'
        } flex flex-col gap-2`}
      >
        <input {...getInputProps()} aria-label="Upload image file" />
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-zinc-300" title={imageSource.name}>
            {imageSource.name}
          </span>
          <span className="shrink-0 text-xs text-zinc-500">{(imageSource.size / 1024).toFixed(1)} KB</span>
        </div>
        <div className="flex gap-2">
          <button type="button" className={`flex-1 ${BTN.base} ${BTN.secondary}`} onClick={open}>
            Replace
          </button>
          <button type="button" className={`flex-1 ${BTN.base} ${BTN.danger}`} onClick={() => setImageSource(null)}>
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`w-full rounded-xl border border-dashed p-4 transition ${
        isDragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-zinc-600 bg-zinc-900'
      } flex min-h-[120px] flex-col items-center justify-center gap-3`}
    >
      <input {...getInputProps()} aria-label="Upload image file" />
      <p className="text-center text-sm text-zinc-400">
        {isDragActive ? 'Drop image here' : 'Drag and drop PNG, JPG, SVG, GIF'}
      </p>
      <button type="button" className={`${BTN.base} ${BTN.primary}`} onClick={open}>
        Choose Image
      </button>
    </div>
  )
}

export { ImageInput }
