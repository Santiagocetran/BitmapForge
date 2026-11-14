import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { RotationGizmoPanel } from './RotationGizmoPanel.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'

vi.mock('./GizmoCanvas.jsx', () => ({ GizmoCanvas: () => <canvas aria-label="Rotation gizmo" /> }))
beforeEach(() => useProjectStore.getState().resetToDefaults())
afterEach(cleanup)
describe('Static composition pose', () => {
  it('preserves degree bounds, radians conversion, other axes and reset availability', () => {
    render(<RotationGizmoPanel />)
    const reset = screen.getByRole('button', { name: 'Reset Rotation (R)' })
    expect(reset.disabled).toBe(true)
    expect(screen.getByText(/Static pose applied before animated Spin/)).toBeDefined()
    for (const [axis, value] of [
      ['X', '90'],
      ['Y', '-45'],
      ['Z', '180']
    ]) {
      const control = screen.getByRole('slider', { name: new RegExp(`^${axis}:`) })
      expect([control.min, control.max, control.step]).toEqual(['-180', '180', '1'])
      fireEvent.change(control, { target: { value } })
      expect(useProjectStore.getState().baseRotation[axis.toLowerCase()]).toBeCloseTo((Number(value) * Math.PI) / 180)
    }
    expect(useProjectStore.getState().baseRotation.x).toBeCloseTo(Math.PI / 2)
    expect(reset.disabled).toBe(false)
    fireEvent.click(reset)
    expect(useProjectStore.getState().baseRotation).toEqual({ x: 0, y: 0, z: 0 })
    expect(reset.disabled).toBe(true)
  })
})
