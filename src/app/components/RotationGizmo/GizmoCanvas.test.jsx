import { StrictMode, useLayoutEffect } from 'react'
import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, cleanup, act } from '@testing-library/react'
import { GizmoCanvas } from './GizmoCanvas.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'
import { requiredFunction } from '../../utils/uiPropValidators.js'

const initial = useProjectStore.getState()
let setter
beforeEach(() => {
  const context = Object.fromEntries(
    ['clearRect', 'save', 'restore', 'scale', 'beginPath', 'arc', 'fill', 'stroke', 'moveTo', 'lineTo', 'fillText'].map(
      (name) => [name, vi.fn()]
    )
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
  setter = vi.fn((x, y, z) => initial.setBaseRotation(x, y, z))
  useProjectStore.setState({ baseRotation: { x: 0.3, y: -0.2, z: 0.7 }, setBaseRotation: setter })
})
afterEach(() => {
  cleanup()
  useProjectStore.setState(initial, true)
  vi.restoreAllMocks()
})
const move = (x, y, shiftKey = false) => fireEvent.mouseMove(window, { clientX: x, clientY: y, shiftKey })
const down = (canvas, x = 10, y = 20) => fireEvent.mouseDown(canvas, { clientX: x, clientY: y })
const callsFor = (spy, type) => spy.mock.calls.filter(([event]) => event === type)
function expectRotation(mock, expected) {
  const last = mock.mock.lastCall
  expect(last).toHaveLength(3)
  expected.forEach((value, index) => expect(last[index]).toBeCloseTo(value, 10))
}

it('preserves direction, sensitivity, Z, snap, mouseup, and latest next-drag origin', () => {
  const view = render(<GizmoCanvas />)
  const canvas = view.container.querySelector('canvas')
  move(30, 10)
  expect(setter).not.toHaveBeenCalled()
  down(canvas)
  move(30, 10)
  expectRotation(setter, [0.3 - -10 * 0.009, -0.2 + 20 * 0.009, 0.7])
  move(60, 50, true)
  const snap = Math.PI / 12
  const snapped = [Math.round((0.3 - 30 * 0.009) / snap) * snap, Math.round((-0.2 + 50 * 0.009) / snap) * snap, 0.7]
  expectRotation(setter, snapped)
  fireEvent.mouseUp(window)
  const count = setter.mock.calls.length
  move(90, 80)
  expect(setter).toHaveBeenCalledTimes(count)
  down(canvas, 100, 100)
  move(110, 120)
  expectRotation(setter, [snapped[0] - 20 * 0.009, snapped[1] + 10 * 0.009, 0.7])
})

// Parent layout runs after GizmoCanvas's child layout publication, but before
// passive effects. Post-act events alone would not detect a useEffect mutation.
function CommitProbe({ observe }) {
  const action = useProjectStore((state) => state.setBaseRotation)
  useLayoutEffect(() => {
    observe(action)
  }, [action, observe])
  return <GizmoCanvas />
}
CommitProbe.propTypes = { observe: requiredFunction }
it('publishes the latest committed setter before parent layout events without rebinding or losing drag origin', () => {
  const add = vi.spyOn(window, 'addEventListener')
  const remove = vi.spyOn(window, 'removeEventListener')
  const replacement = vi.fn()
  let layoutEvents = 0
  const observe = (action) => {
    if (action === replacement) {
      layoutEvents++
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 10 }))
    }
  }
  const view = render(<CommitProbe observe={observe} />)
  down(view.container.querySelector('canvas'))
  const before = ['mousemove', 'mouseup'].map((type) => [callsFor(add, type).length, callsFor(remove, type).length])
  act(() => {
    useProjectStore.setState({ setBaseRotation: replacement })
  })
  expect(layoutEvents).toBe(1)
  expect(setter).not.toHaveBeenCalled()
  expect(replacement).toHaveBeenCalledOnce()
  expectRotation(replacement, [0.39, -0.02, 0.7])
  move(40, 30)
  expectRotation(replacement, [0.21, 0.07, 0.7])
  expect(['mousemove', 'mouseup'].map((type) => [callsFor(add, type).length, callsFor(remove, type).length])).toEqual(
    before
  )
})

it('StrictMode keeps one live pair, removes exact delegates, and remounts without an active drag', () => {
  const add = vi.spyOn(window, 'addEventListener')
  const remove = vi.spyOn(window, 'removeEventListener')
  const view = render(
    <StrictMode>
      <GizmoCanvas />
    </StrictMode>
  )
  for (const type of ['mousemove', 'mouseup']) {
    const adds = callsFor(add, type),
      removes = callsFor(remove, type)
    expect(adds.length - removes.length).toBe(1)
    for (const [, callback] of removes) expect(adds.some(([, installed]) => installed === callback)).toBe(true)
  }
  down(view.container.querySelector('canvas'))
  move(30, 10)
  expect(setter).toHaveBeenCalledOnce()
  view.unmount()
  for (const type of ['mousemove', 'mouseup']) {
    const adds = callsFor(add, type),
      removes = callsFor(remove, type)
    expect(removes).toHaveLength(adds.length)
    for (const [, callback] of adds) expect(removes.filter(([, removed]) => removed === callback)).toHaveLength(1)
  }
  setter.mockClear()
  move(50, 40)
  fireEvent.mouseUp(window)
  expect(setter).not.toHaveBeenCalled()
  render(<GizmoCanvas />)
  move(60, 50)
  expect(setter).not.toHaveBeenCalled()
})
