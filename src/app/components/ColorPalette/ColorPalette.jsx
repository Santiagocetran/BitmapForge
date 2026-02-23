import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HexColorPicker } from 'react-colorful'
import { useState, useRef, useEffect } from 'react'
import { useProjectStore } from '../../store/useProjectStore.js'

function SortableColor({ color, id, isOpen, onOpen, onClose, onColorChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const popupRef = useRef(null)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  // Close when clicking outside the popup
  useEffect(() => {
    if (!isOpen) return
    function handleMouseDown(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen, onClose])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="h-10 w-12 rounded border border-zinc-500"
        style={{ backgroundColor: color }}
        onDoubleClick={() => (isOpen ? onClose() : onOpen())}
      />
      {isOpen && (
        <div ref={popupRef} className="absolute left-0 z-20 mt-2 rounded border border-zinc-600 bg-zinc-900 p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Edit color</span>
            <button
              type="button"
              className="rounded px-1 text-xs text-zinc-400 hover:text-zinc-100"
              onClick={onClose}
              aria-label="Close color picker"
            >
              ✕
            </button>
          </div>
          <HexColorPicker color={color} onChange={onColorChange} />
          <input
            className="mt-2 w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs"
            value={color}
            onChange={(event) => onColorChange(event.target.value)}
          />
        </div>
      )}
    </div>
  )
}

function ColorPalette() {
  const colors = useProjectStore((state) => state.colors)
  const setColors = useProjectStore((state) => state.setColors)
  const addColor = useProjectStore((state) => state.addColor)
  const removeColor = useProjectStore((state) => state.removeColor)
  const setColorAt = useProjectStore((state) => state.setColorAt)

  const [openPickerId, setOpenPickerId] = useState(null)

  const ids = colors.map((_, index) => `color-${index}`)
  const presets = {
    Green: ['#074434', '#0a5845', '#ABC685', '#E8FF99'],
    Ocean: ['#012a4a', '#01497c', '#2a6f97', '#61a5c2'],
    Sunset: ['#3f0d12', '#a71d31', '#f46036', '#f7b538'],
    Mono: ['#111111', '#555555', '#aaaaaa', '#f2f2f2'],
    Cyberpunk: ['#050014', '#1a1040', '#ff00a8', '#00f5ff']
  }

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(active.id)
    const newIndex = ids.indexOf(over.id)
    if (oldIndex < 0 || newIndex < 0) return
    setColors(arrayMove(colors, oldIndex, newIndex))
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400">
        <span>Shadows</span>
        <span>Highlights</span>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-2">
            {colors.map((color, index) => (
              <SortableColor
                key={ids[index]}
                id={ids[index]}
                color={color}
                isOpen={openPickerId === ids[index]}
                onOpen={() => setOpenPickerId(ids[index])}
                onClose={() => setOpenPickerId(null)}
                onColorChange={(nextColor) => setColorAt(index, nextColor)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded bg-zinc-700 px-2 py-1 text-xs"
          onClick={() => addColor()}
          disabled={colors.length >= 6}
        >
          Add
        </button>
        <button
          type="button"
          className="rounded bg-zinc-700 px-2 py-1 text-xs"
          onClick={() => removeColor(colors.length - 1)}
          disabled={colors.length <= 2}
        >
          Remove
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(presets).map(([name, value]) => (
          <button
            key={name}
            type="button"
            className="rounded border border-zinc-600 px-2 py-1 text-xs"
            onClick={() => setColors(value)}
          >
            {name}
          </button>
        ))}
      </div>
    </section>
  )
}

export { ColorPalette }
