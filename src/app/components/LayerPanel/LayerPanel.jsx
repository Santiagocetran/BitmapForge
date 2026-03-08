import { Layers } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useProjectStore } from '../../store/useProjectStore.js'
import { LayerItem } from './LayerItem.jsx'

function LayerPanel() {
  const layers = useProjectStore((state) => state.layers)
  const reorderLayers = useProjectStore((state) => state.reorderLayers)
  const selectedLayerId = useProjectStore((state) => state.selectedLayerId)
  const layer = layers.find((l) => l.id === selectedLayerId)
  const setLayerTransform = useProjectStore((state) => state.setLayerTransform)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = layers.findIndex((l) => l.id === active.id)
    const newIndex = layers.findIndex((l) => l.id === over.id)
    reorderLayers(arrayMove(layers, oldIndex, newIndex))
  }

  if (layers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-700 py-5 text-center">
        <Layers size={20} className="text-zinc-600" />
        <p className="text-xs text-zinc-500">No layers yet.</p>
        <p className="text-xs text-zinc-600">Use the Input panel to add objects.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layers.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {layers.map((l) => (
              <LayerItem key={l.id} layer={l} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Per-layer transform controls when a layer is selected */}
      {layer && (
        <div className="mt-2 space-y-2 rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
          <p className="text-xs font-medium text-zinc-400">Transform — {layer.name}</p>

          <TransformRow
            label="X pos"
            value={layer.position.x}
            onChange={(v) => setLayerTransform(layer.id, { position: { ...layer.position, x: v } })}
            min={-10}
            max={10}
            step={0.1}
          />
          <TransformRow
            label="Y pos"
            value={layer.position.y}
            onChange={(v) => setLayerTransform(layer.id, { position: { ...layer.position, y: v } })}
            min={-10}
            max={10}
            step={0.1}
          />
          <TransformRow
            label="Z pos"
            value={layer.position.z}
            onChange={(v) => setLayerTransform(layer.id, { position: { ...layer.position, z: v } })}
            min={-10}
            max={10}
            step={0.1}
          />
          <TransformRow
            label="Scale"
            value={layer.scale}
            onChange={(v) => setLayerTransform(layer.id, { scale: v })}
            min={0.1}
            max={5}
            step={0.05}
          />
        </div>
      )}
    </div>
  )
}

function TransformRow({ label, value, onChange, min, max, step }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-xs text-zinc-500">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-emerald-500"
      />
      <span className="w-10 text-right text-xs tabular-nums text-zinc-400">{value.toFixed(2)}</span>
    </div>
  )
}

export { LayerPanel }
