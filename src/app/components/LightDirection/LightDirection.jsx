import { useProjectStore } from '../../store/useProjectStore.js'

const DIRECTIONS = [
  { label: 'NW', x: -3, y: 4, z: 5 },
  { label: 'N', x: 0, y: 5, z: 5 },
  { label: 'NE', x: 3, y: 4, z: 5 },
  { label: 'W', x: -5, y: 2, z: 3 },
  { label: 'C', x: 3, y: 4, z: 5 },
  { label: 'E', x: 5, y: 2, z: 3 },
  { label: 'SW', x: -3, y: 1, z: -4 },
  { label: 'S', x: 0, y: 1, z: -5 },
  { label: 'SE', x: 3, y: 1, z: -4 }
]

function LightDirection() {
  const lightDirection = useProjectStore((state) => state.lightDirection)
  const setLightDirection = useProjectStore((state) => state.setLightDirection)

  return (
    <section className="space-y-2">
      <div className="grid grid-cols-3 gap-1">
        {DIRECTIONS.map((direction) => {
          const active =
            direction.x === lightDirection.x &&
            direction.y === lightDirection.y &&
            direction.z === lightDirection.z
          return (
            <button
              key={direction.label}
              type="button"
              className={`rounded px-2 py-1 text-xs ${active ? 'bg-emerald-500 text-black' : 'bg-zinc-700'}`}
              onClick={() => setLightDirection({ x: direction.x, y: direction.y, z: direction.z })}
            >
              {direction.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export { LightDirection }
