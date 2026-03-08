import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Trash2, Box, Type, ImageIcon, Package } from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore.js'
import { deleteFile } from '../../store/fileRegistry.js'

const TYPE_ICONS = {
  shape: Box,
  text: Type,
  image: ImageIcon,
  model: Package
}

function LayerItem({ layer }) {
  const [renaming, setRenaming] = useState(false)
  const [draftName, setDraftName] = useState(layer.name)

  const selectedLayerId = useProjectStore((state) => state.selectedLayerId)
  const selectLayer = useProjectStore((state) => state.selectLayer)
  const setLayerVisible = useProjectStore((state) => state.setLayerVisible)
  const updateLayer = useProjectStore((state) => state.updateLayer)
  const removeLayer = useProjectStore((state) => state.removeLayer)

  const isSelected = selectedLayerId === layer.id
  const Icon = TYPE_ICONS[layer.type] ?? Box

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: layer.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  function handleRenameCommit() {
    const trimmed = draftName.trim()
    if (trimmed) updateLayer(layer.id, { name: trimmed })
    else setDraftName(layer.name)
    setRenaming(false)
  }

  function handleRemove(e) {
    e.stopPropagation()
    deleteFile(layer.id)
    removeLayer(layer.id)
    // Deselect if this was selected
    if (selectedLayerId === layer.id) selectLayer(null)
  }

  function handleVisibilityToggle(e) {
    e.stopPropagation()
    setLayerVisible(layer.id, !layer.visible)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectLayer(isSelected ? null : layer.id)}
      className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer transition ${
        isSelected ? 'bg-zinc-700 ring-1 ring-emerald-600/50' : 'bg-zinc-800 hover:bg-zinc-750'
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="shrink-0 cursor-grab text-zinc-500 hover:text-zinc-300 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </button>

      {/* Type icon */}
      <Icon size={14} className="shrink-0 text-zinc-400" />

      {/* Name */}
      {renaming ? (
        <input
          autoFocus
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={handleRenameCommit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameCommit()
            if (e.key === 'Escape') {
              setDraftName(layer.name)
              setRenaming(false)
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="min-w-0 flex-1 rounded bg-zinc-900 px-1 py-0.5 text-xs text-zinc-100 outline-none ring-1 ring-emerald-600"
        />
      ) : (
        <span
          className="min-w-0 flex-1 truncate text-xs text-zinc-200"
          onDoubleClick={(e) => {
            e.stopPropagation()
            setRenaming(true)
          }}
          title={`${layer.name} (double-click to rename)`}
        >
          {layer.name}
        </span>
      )}

      {/* Visibility toggle */}
      <button
        type="button"
        onClick={handleVisibilityToggle}
        className="shrink-0 text-zinc-500 hover:text-zinc-200"
        aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
      >
        {layer.visible ? <Eye size={13} /> : <EyeOff size={13} className="text-zinc-600" />}
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={handleRemove}
        className="shrink-0 text-zinc-600 hover:text-red-400"
        aria-label="Remove layer"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

export { LayerItem }
