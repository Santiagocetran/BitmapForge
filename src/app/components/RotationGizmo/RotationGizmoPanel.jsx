import { GizmoCanvas } from './GizmoCanvas.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'

const RAD_TO_DEG = 180 / Math.PI
const DEG_TO_RAD = Math.PI / 180

function RotationGizmoPanel() {
  const baseRotation = useProjectStore((state) => state.baseRotation)
  const setBaseRotation = useProjectStore((state) => state.setBaseRotation)
  const resetBaseRotation = useProjectStore((state) => state.resetBaseRotation)

  const setAxis = (axis, deg) => {
    setBaseRotation(
      axis === 'x' ? deg * DEG_TO_RAD : baseRotation.x,
      axis === 'y' ? deg * DEG_TO_RAD : baseRotation.y,
      axis === 'z' ? deg * DEG_TO_RAD : baseRotation.z
    )
  }

  const isZero = baseRotation.x === 0 && baseRotation.y === 0 && baseRotation.z === 0

  return (
    <section className="space-y-3">
      <div className="flex justify-center">
        <GizmoCanvas />
      </div>

      <div className="space-y-2">
        {[
          ['x', 'X'],
          ['y', 'Y'],
          ['z', 'Z']
        ].map(([axis, label]) => {
          const deg = Math.round(baseRotation[axis] * RAD_TO_DEG)
          return (
            <div key={axis}>
              <label htmlFor={`rot-${axis}`} className="mb-1 block text-xs text-zinc-400">
                {label}: {deg}°
              </label>
              <input
                id={`rot-${axis}`}
                type="range"
                min="-180"
                max="180"
                step="1"
                value={deg}
                onChange={(e) => setAxis(axis, Number(e.target.value))}
                className="w-full"
              />
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={resetBaseRotation}
        disabled={isZero}
        className="w-full rounded bg-zinc-700 px-2 py-1.5 text-xs hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Reset Rotation
      </button>
    </section>
  )
}

export { RotationGizmoPanel }
