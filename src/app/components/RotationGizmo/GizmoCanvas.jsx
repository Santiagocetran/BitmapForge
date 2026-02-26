import { useEffect, useRef } from 'react'
import { useProjectStore } from '../../store/useProjectStore.js'

const SIZE = 120
const CENTER = SIZE / 2
const AXIS_LENGTH = 40
const SPHERE_RADIUS = 34

// Pixels-per-radian drag sensitivity. Smaller = slower.
const DRAG_SENSITIVITY = 0.009

// Snap increment when Shift is held (degrees).
const SNAP_DEG = 15
const SNAP_RAD = (SNAP_DEG * Math.PI) / 180

/**
 * Apply XYZ Euler rotation to a unit vector (pure math, no Three.js dependency).
 * Returns [x, y, z] of the rotated vector.
 */
function rotateXYZ(vx, vy, vz, rx, ry, rz) {
  // X
  const y1 = vy * Math.cos(rx) - vz * Math.sin(rx)
  const z1 = vy * Math.sin(rx) + vz * Math.cos(rx)
  // Y
  const x2 = vx * Math.cos(ry) + z1 * Math.sin(ry)
  const z2 = -vx * Math.sin(ry) + z1 * Math.cos(ry)
  // Z
  const x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz)
  const y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz)
  return [x3, y3, z2]
}

const AXES = [
  { vec: [1, 0, 0], color: '#ef4444', label: 'X' },
  { vec: [0, 1, 0], color: '#22c55e', label: 'Y' },
  { vec: [0, 0, 1], color: '#3b82f6', label: 'Z' }
]

function drawGizmo(canvas, rx, ry, rz) {
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.scale(dpr, dpr)

  // Sphere background
  ctx.beginPath()
  ctx.arc(CENTER, CENTER, SPHERE_RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = '#18181b'
  ctx.fill()
  ctx.strokeStyle = '#3f3f46'
  ctx.lineWidth = 1
  ctx.stroke()

  // Project axes and sort back-to-front by depth
  const projected = AXES.map(({ vec: [vx, vy, vz], color, label }) => {
    const [px, py, pz] = rotateXYZ(vx, vy, vz, rx, ry, rz)
    return {
      ex: CENTER + px * AXIS_LENGTH,
      ey: CENTER - py * AXIS_LENGTH, // canvas Y is inverted
      depth: pz,
      color,
      label
    }
  })
  projected.sort((a, b) => a.depth - b.depth) // back first

  for (const { ex, ey, depth, color, label } of projected) {
    const alpha = depth < 0 ? 0.28 : 1
    ctx.globalAlpha = alpha

    // Axis line
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(CENTER, CENTER)
    ctx.lineTo(ex, ey)
    ctx.stroke()

    // Endpoint dot
    ctx.beginPath()
    ctx.arc(ex, ey, 3.5, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()

    // Label: nudge away from center
    const nx = ex - CENTER
    const ny = ey - CENTER
    const len = Math.sqrt(nx * nx + ny * ny) || 1
    const lx = ex + (nx / len) * 8 - 3
    const ly = ey + (ny / len) * 8 + 3
    ctx.font = 'bold 9px monospace'
    ctx.fillStyle = color
    ctx.fillText(label, lx, ly)
  }

  ctx.globalAlpha = 1
  ctx.restore()
}

function GizmoCanvas() {
  const canvasRef = useRef(null)
  const dragStateRef = useRef({ isDragging: false, startX: 0, startY: 0, startRot: null })

  const baseRotation = useProjectStore((state) => state.baseRotation)
  const setBaseRotation = useProjectStore((state) => state.setBaseRotation)

  // Size canvas once for HiDPI
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
  }, [])

  // Redraw whenever rotation changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawGizmo(canvas, baseRotation.x, baseRotation.y, baseRotation.z)
  }, [baseRotation])

  // Stable window-level drag handlers — update the ref each render so closures
  // always see the latest state without re-binding listeners.
  const handlersRef = useRef({ onMove: null, onUp: null })

  handlersRef.current.onMove = (e) => {
    const drag = dragStateRef.current
    if (!drag.isDragging || !drag.startRot) return

    const dx = (e.clientX - drag.startX) * DRAG_SENSITIVITY
    const dy = (e.clientY - drag.startY) * DRAG_SENSITIVITY

    let nx = drag.startRot.x - dy // up/down → X
    let ny = drag.startRot.y + dx // left/right → Y
    const nz = drag.startRot.z

    if (e.shiftKey) {
      nx = Math.round(nx / SNAP_RAD) * SNAP_RAD
      ny = Math.round(ny / SNAP_RAD) * SNAP_RAD
    }

    setBaseRotation(nx, ny, nz)
  }

  handlersRef.current.onUp = () => {
    dragStateRef.current.isDragging = false
  }

  // Bind once — delegate to ref so listeners never need to be re-attached.
  useEffect(() => {
    const onMove = (e) => handlersRef.current.onMove(e)
    const onUp = () => handlersRef.current.onUp()
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const handleMouseDown = (e) => {
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startRot: { ...baseRotation }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${SIZE}px`, height: `${SIZE}px` }}
      className="cursor-grab rounded border border-zinc-700 active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      aria-label="Rotation gizmo — drag to rotate model. Hold Shift to snap to 15°."
    />
  )
}

export { GizmoCanvas }
