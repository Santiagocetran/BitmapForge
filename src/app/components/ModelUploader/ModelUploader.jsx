import { useDropzone } from 'react-dropzone'
import { useProjectStore } from '../../store/useProjectStore.js'

const ACCEPTED_TYPES = {
  'model/stl': ['.stl'],
  'model/gltf-binary': ['.glb'],
  'model/gltf+json': ['.gltf'],
  'text/plain': ['.obj'],
  'application/octet-stream': ['.stl', '.obj', '.glb', '.gltf']
}

function ModelUploader({ compact = false }) {
  const model = useProjectStore((state) => state.model)
  const setModel = useProjectStore((state) => state.setModel)
  const setStatus = useProjectStore((state) => state.setStatus)

  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections.length) {
      setStatus({ error: 'Unsupported file type. Use STL, OBJ, GLTF, or GLB.' })
      return
    }
    const file = acceptedFiles[0]
    if (!file) return
    setModel(file)
    setStatus({ error: '', message: `${file.name} selected.` })
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
        className={`rounded-xl border border-dashed p-3 transition ${
          isDragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-zinc-600 bg-zinc-800'
        } flex flex-col gap-2`}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-zinc-300" title={model.name}>
            {model.name}
          </span>
          <span className="shrink-0 text-xs text-zinc-500">
            {(model.size / 1024).toFixed(1)} KB
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-md bg-zinc-700 px-2 py-1 text-xs hover:bg-zinc-600"
            onClick={open}
          >
            Replace
          </button>
          <button
            type="button"
            className="flex-1 rounded-md bg-red-900 px-2 py-1 text-xs text-red-200 hover:bg-red-800"
            onClick={() => {
              setModel(null)
              setStatus({ error: '', message: '' })
            }}
          >
            Remove
          </button>
        </div>
        {isDragActive && (
          <p className="text-center text-xs text-emerald-400">Drop to replace model</p>
        )}
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`w-full max-w-[280px] rounded-xl border border-dashed p-4 transition ${
        isDragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-zinc-600 bg-zinc-900'
      } flex min-h-[200px] flex-col items-center justify-center gap-3`}
    >
      <input {...getInputProps()} />
      <p className="text-sm text-zinc-200">
        {isDragActive ? 'Drop model file here' : 'Drag and drop STL/OBJ/GLTF/GLB'}
      </p>
      <button
        type="button"
        className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-black hover:bg-emerald-400"
        onClick={open}
      >
        Choose File
      </button>
    </div>
  )
}

export { ModelUploader }
