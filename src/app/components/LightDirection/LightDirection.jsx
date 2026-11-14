import { useProjectStore } from '../../store/useProjectStore.js'

const DIRECTIONS = [
  { label: 'NW', x: -3, y: 4, z: 5 },
  { label: 'N', x: 0, y: 5, z: 5 },
  { label: 'NE', x: 3, y: 4, z: 5 },
  { label: 'W', x: -5, y: 2, z: 3 },
  { label: 'C', x: 0, y: 3, z: 5 },
  { label: 'E', x: 5, y: 2, z: 3 },
  { label: 'SW', x: -3, y: 1, z: -4 },
  { label: 'S', x: 0, y: 1, z: -5 },
  { label: 'SE', x: 3, y: 1, z: -4 }
]

const DIRECTION_NAMES = {
  NW: 'North west',
  N: 'North',
  NE: 'North east',
  W: 'West',
  C: 'Center',
  E: 'East',
  SW: 'South west',
  S: 'South',
  SE: 'South east'
}

function LightDirection() {
  const lightDirection = useProjectStore((state) => state.lightDirection)
  const setLightDirection = useProjectStore((state) => state.setLightDirection)

  return (
    <section className="bf-control-group">
      <p className="bf-help">Position of the directional light</p>
      <div role="group" aria-label="Light direction" className="grid grid-cols-3 gap-2">
        {DIRECTIONS.map((direction) => {
          const active =
            direction.x === lightDirection.x && direction.y === lightDirection.y && direction.z === lightDirection.z
          return (
            <button
              key={direction.label}
              type="button"
              className="bf-choice"
              aria-pressed={active}
              aria-label={DIRECTION_NAMES[direction.label]}
              onClick={() => setLightDirection({ x: direction.x, y: direction.y, z: direction.z })}
            >
              {active && <span aria-hidden="true">✓ </span>}
              {direction.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export { LightDirection }
