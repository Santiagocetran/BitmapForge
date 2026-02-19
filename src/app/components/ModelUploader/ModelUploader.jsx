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

  return (
    <div
      {...getRootProps()}
      className={`rounded-xl border border-dashed p-4 transition ${
        isDragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-zinc-600 bg-zinc-900'
      } ${compact ? '' : 'h-full min-h-[260px]'} flex flex-col items-center justify-center gap-3`}
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
      {model && (
        <p className="text-xs text-zinc-400">
          {model.name} ({(model.size / 1024).toFixed(1)} KB)
        </p>
      )}
    </div>
  )
}

export { ModelUploader }
