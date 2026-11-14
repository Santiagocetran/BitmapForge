import { BTN } from '../../styles/buttonStyles.js'
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
    <section className="bf-control-group">
      <p className="bf-help">Static pose applied before animated Spin. Drag the gizmo or adjust each axis.</p>
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
              <label htmlFor={`rot-${axis}`} className="bf-label">
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
                className="bf-range"
              />
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={resetBaseRotation} disabled={isZero} className={`${BTN.base} ${BTN.secondary}`}>
          Reset Rotation (R)
        </button>
      </div>
    </section>
  )
}

export { RotationGizmoPanel }
