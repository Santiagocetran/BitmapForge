/* eslint-disable react/prop-types -- Test picker callback fixture. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { StrictMode, createElement } from 'react'
import { KeyboardSensor, PointerSensor } from '@dnd-kit/core'
import { ColorPalette, normalizePaletteHex } from './ColorPalette.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'
import { usePresetStore } from '../../store/usePresetStore.js'

const contexts = vi.hoisted(() => ({ latest: null }))
// Observe the props boundary but render the actual DndContext and real sensors.
// Layout's separate integration suite has no dnd wrapper at all.
vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    DndContext: (props) => {
      contexts.latest = props
      return createElement(actual.DndContext, props)
    }
  }
})
const picker = vi.hoisted(() => ({ onChange: null }))
vi.mock('react-colorful', () => ({
  HexColorPicker: ({ onChange }) => {
    picker.onChange = onChange
    return <button onClick={() => onChange('#123456')}>Picker sample</button>
  }
}))
beforeEach(() => {
  useProjectStore.setState({ colors: ['#111111', '#222222', '#111111'] })
  usePresetStore.setState({ customPresets: [] })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
const colors = () => useProjectStore.getState().colors
function open(index = 1) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Edit color ${index}:`) }))
  return screen.getByLabelText('Hex color')
}

describe('palette transactions', { timeout: 20000 }, () => {
  it.each([
    ['#AbC', '#aabbcc'],
    ['#12aBef', '#12abef'],
    ['#a', null],
    ['red', null],
    ['#ggg', null]
  ])('validates %s', (input, expected) => {
    expect(normalizePaletteHex(input)).toBe(expected)
  })
  it('opens on click, focuses the labeled draft, validates and commits only complete values', () => {
    render(<ColorPalette />)
    const input = open()
    expect(document.activeElement).toBe(input)
    fireEvent.change(input, { target: { value: '#ab' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(colors()[0]).toBe('#111111')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(document.getElementById(input.getAttribute('aria-describedby')).textContent).toContain('#RGB')
    fireEvent.change(input, { target: { value: '#abc' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(colors()).toEqual(['#aabbcc', '#222222', '#111111'])
    expect(screen.getByRole('dialog', { name: 'Edit color 1' })).toBeDefined()
    expect(input.value).toBe('#aabbcc')
  })
  it('commits same-picker blur, but not blur to Close or outside', () => {
    render(<ColorPalette />)
    let input = open()
    fireEvent.change(input, { target: { value: '#abc' } })
    fireEvent.blur(input, { relatedTarget: screen.getByRole('button', { name: 'Picker sample' }) })
    expect(colors()[0]).toBe('#aabbcc')
    fireEvent.change(input, { target: { value: '#def' } })
    fireEvent.blur(input, { relatedTarget: screen.getByRole('button', { name: 'Close color picker' }) })
    fireEvent.click(screen.getByRole('button', { name: 'Close color picker' }))
    expect(colors()[0]).toBe('#aabbcc')
    input = open()
    fireEvent.change(input, { target: { value: '#fed' } })
    fireEvent.blur(input, { relatedTarget: screen.getByRole('button', { name: 'Add' }) })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(colors()[0]).toBe('#aabbcc')
  })
  it('picker commits immediately and synchronizes draft', () => {
    render(<ColorPalette />)
    const input = open()
    fireEvent.click(screen.getByRole('button', { name: 'Picker sample' }))
    expect(colors()[0]).toBe('#123456')
    expect(input.value).toBe('#123456')
  })
  it('external replacement invalidates an editor before a stale write, including duplicates', () => {
    render(<ColorPalette />)
    const input = open(3)
    fireEvent.change(input, { target: { value: '#abc' } })
    act(() => useProjectStore.getState().setColors(['#444444']))
    expect(screen.queryByLabelText('Hex color')).toBeNull()
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(colors()).toEqual(['#444444'])
  })
  it('rejects a late picker callback after switching item transactions', () => {
    render(<ColorPalette />)
    open(1)
    const staleChange = picker.onChange
    open(2)
    act(() => staleChange('#abcdef'))
    expect(colors()).toEqual(['#111111', '#222222', '#111111'])
    expect(screen.getByLabelText('Hex color').value).toBe('#222222')
    act(() => picker.onChange('#123456'))
    expect(colors()[1]).toBe('#123456')
  })
  it('treats a subscriber-induced replacement during an own write as external', () => {
    render(<ColorPalette />)
    const input = open()
    const unsubscribe = useProjectStore.subscribe((next) => {
      if (next.colors[0] === '#aabbcc') useProjectStore.getState().setColors(['#444444'])
    })
    try {
      fireEvent.change(input, { target: { value: '#abc' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(colors()).toEqual(['#444444'])
      expect(screen.queryByLabelText('Hex color')).toBeNull()
    } finally {
      unsubscribe()
    }
  })
  it('click move closes editor and reorders duplicate items independently', () => {
    render(<ColorPalette />)
    open(3)
    fireEvent.click(screen.getByRole('button', { name: 'Move color 3 earlier' }))
    expect(colors()).toEqual(['#111111', '#111111', '#222222'])
    expect(screen.queryByLabelText('Hex color')).toBeNull()
  })
  it('parent cancellation discards draft, closes portal, and unmount never commits', () => {
    const interactionRef = { current: null }
    const host = document.createElement('div')
    document.body.append(host)
    const view = render(<ColorPalette interactionRef={interactionRef} portalContainer={host} />)
    const input = open()
    expect(host.contains(input)).toBe(true)
    fireEvent.change(input, { target: { value: '#abc' } })
    act(() => interactionRef.current.cancel({ restoreFocus: false }))
    expect(screen.queryByLabelText('Hex color')).toBeNull()
    expect(colors()[0]).toBe('#111111')
    open()
    view.unmount()
    expect(colors()[0]).toBe('#111111')
    expect(interactionRef.current).toBeNull()
    host.remove()
  })
  it.each(['Escape', 'drop', 'external', 'parent'])(
    'exposes keyboard-only Escape ownership until %s cancellation/completion',
    async (ending) => {
      const interactionRef = { current: null }
      const view = render(<ColorPalette interactionRef={interactionRef} />)
      const handle = screen.getByRole('button', { name: 'Reorder color 2' })
      expect(interactionRef.current.isKeyboardDragging()).toBe(false)
      handle.focus()
      fireEvent.keyDown(handle, { key: ' ', code: 'Space' })
      expect(interactionRef.current.isKeyboardDragging()).toBe(true)
      // dnd-kit attaches its document keyboard listener after activation.
      await act(async () => new Promise((resolve) => setTimeout(resolve, 0)))
      if (ending === 'Escape') fireEvent.keyDown(handle, { key: 'Escape', code: 'Escape' })
      if (ending === 'drop') fireEvent.keyDown(handle, { key: ' ', code: 'Space' })
      if (ending === 'external') act(() => useProjectStore.getState().setColors(['#444444', '#555555']))
      if (ending === 'parent') act(() => interactionRef.current.cancel({ restoreFocus: false }))
      expect(interactionRef.current.isKeyboardDragging()).toBe(false)
      if (ending === 'drop') {
        // jsdom has no item geometry; the browser test asserts the drop target
        // and moved-swatch focus. Here verify ownership and color conservation.
        expect([...colors()].sort()).toEqual(['#111111', '#111111', '#222222'])
      } else {
        expect(colors()).toEqual(ending === 'external' ? ['#444444', '#555555'] : ['#111111', '#222222', '#111111'])
      }
      view.unmount()
      expect(interactionRef.current).toBeNull()
    }
  )
  it('enforces UI bounds and labels preset save and delete', () => {
    render(<ColorPalette />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.getByRole('button', { name: 'Remove' }).disabled).toBe(true)
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByRole('button', { name: 'Add' }).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Save palette' }))
    fireEvent.change(screen.getByLabelText('Palette name'), { target: { value: 'My palette' } })
    fireEvent.keyDown(screen.getByLabelText('Palette name'), { key: 'Enter' })
    fireEvent.click(screen.getByRole('button', { name: 'Browse palettes' }))
    const deletion = screen.getByRole('button', { name: 'Delete palette My palette' })
    fireEvent.click(deletion)
    expect(usePresetStore.getState().customPresets).toHaveLength(0)
  })
})

describe('H1 native sensor lifetime', () => {
  const handle = () => screen.getByRole('button', { name: 'Reorder color 2' })
  const key = (code, node = handle()) => fireEvent.keyDown(node, { code, key: code === 'Space' ? ' ' : code })
  const drain = () => act(() => vi.advanceTimersByTime(0))
  const pointer = (type, node = document, x = 0) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, button: 0 })
    Object.defineProperty(event, 'isPrimary', { value: true })
    fireEvent(node, event)
    return event
  }
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}])
  })
  it('keeps full Escape/parent/collapse history owned with exact zero cancellation writes', () => {
    const interactionRef = { current: null }
    render(<ColorPalette interactionRef={interactionRef} />)
    const writes = vi.fn()
    const unsubscribe = useProjectStore.subscribe((next, old) => {
      if (next.colors !== old.colors) writes()
    })
    try {
      for (const ending of ['Escape', 'parent', 'collapse', 'parent']) {
        handle().focus()
        key('Space')
        expect(handle().getAttribute('aria-pressed')).toBe('true')
        expect(interactionRef.current.isKeyboardDragging()).toBe(true)
        drain()
        if (ending === 'Escape') key('Escape')
        else
          act(() => {
            interactionRef.current.cancel()
            interactionRef.current.cancel()
          })
        expect(interactionRef.current.isKeyboardDragging()).toBe(false)
        expect(handle().getAttribute('aria-pressed')).not.toBe('true')
        expect(colors()).toEqual(['#111111', '#222222', '#111111'])
        expect(writes).not.toHaveBeenCalled()
      }
    } finally {
      unsubscribe()
    }
  })
  it.each(['cancel', 'unmount'])('blocks deferred keyboard registration after same-turn %s', (ending) => {
    const interactionRef = { current: null }
    const view = render(<ColorPalette interactionRef={interactionRef} />)
    key('Space')
    const add = vi.spyOn(document, 'addEventListener')
    if (ending === 'cancel') act(() => interactionRef.current.cancel())
    else view.unmount()
    drain()
    expect(add.mock.calls.filter(([type]) => type === 'keydown')).toEqual([])
    const event = new KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true })
    fireEvent(document, event)
    expect(event.defaultPrevented).toBe(false)
    expect(colors()).toEqual(['#111111', '#222222', '#111111'])
  })
  it('retires distance-pending pointer and releases the next pointer and keyboard pickup', () => {
    const interactionRef = { current: null }
    render(<ColorPalette interactionRef={interactionRef} />)
    pointer('pointerdown', handle())
    expect(handle().getAttribute('aria-pressed')).not.toBe('true')
    act(() => interactionRef.current.cancel())
    pointer('pointermove', document, 40)
    expect(handle().getAttribute('aria-pressed')).not.toBe('true')
    pointer('pointerup')
    pointer('pointerdown', handle())
    pointer('pointermove', document, 40)
    expect(handle().getAttribute('aria-pressed')).toBe('true')
    act(() => interactionRef.current.cancel())
    key('Space')
    expect(interactionRef.current.isKeyboardDragging()).toBe(true)
    act(() => interactionRef.current.cancel())
    expect(colors()).toEqual(['#111111', '#222222', '#111111'])
  })
  // Observe real constructor dispatch; all native behavior remains call-through.
  function observeSensor(Native) {
    const instances = []
    const attach = Native.prototype.attach
    vi.spyOn(Native.prototype, 'attach').mockImplementation(function (...args) {
      instances.push(this)
      return attach.apply(this, args)
    })
    return instances
  }
  it('guards captured pending pointer work after retirement and newer activation', () => {
    const instances = observeSensor(PointerSensor)
    const interactionRef = { current: null }
    render(<ColorPalette interactionRef={interactionRef} />)
    pointer('pointerdown', handle())
    const old = instances[0]
    act(() => interactionRef.current.cancel())
    pointer('pointerdown', handle())
    pointer('pointermove', document, 40)
    const current = instances[1]
    expect(handle().getAttribute('aria-pressed')).toBe('true')
    const event = new MouseEvent('pointermove', { clientX: 80, cancelable: true })
    const writes = vi.fn()
    const unsubscribe = useProjectStore.subscribe((next, previous) => {
      if (next.colors !== previous.colors) writes()
    })
    try {
      act(() => {
        old.handleStart()
        old.handleMove(event)
        old.handleCancel()
        old.props.onStart({ x: 80, y: 0 })
        old.props.onMove({ x: 80, y: 0 })
        old.props.onCancel()
      })
      expect(event.defaultPrevented).toBe(false)
      expect(old.activated).toBe(false)
      expect(current.props.paletteSession.generation.session).toBe(current.props.paletteSession)
      expect(handle().getAttribute('aria-pressed')).toBe('true')
      expect(writes).not.toHaveBeenCalled()
      expect(colors()).toEqual(['#111111', '#222222', '#111111'])
      act(() => interactionRef.current.cancel())
    } finally {
      unsubscribe()
    }
  })
  it('keeps natural terminal delivery eligible before deferred registration drains', async () => {
    const instances = observeSensor(KeyboardSensor)
    const interactionRef = { current: null }
    render(<ColorPalette interactionRef={interactionRef} />)
    key('Space')
    const sensor = instances[0]
    expect(sensor.props.paletteSession.generation.session).toBe(sensor.props.paletteSession)
    const add = vi.spyOn(document, 'addEventListener')
    act(() => sensor.handleCancel(new KeyboardEvent('keydown', { code: 'Escape', cancelable: true })))
    expect(interactionRef.current.isKeyboardDragging()).toBe(false)
    drain()
    expect(add.mock.calls.filter(([type]) => type === 'keydown')).toEqual([])
    await act(async () => {})
    expect(document.activeElement).toBe(handle())
    key('Space')
    expect(interactionRef.current.isKeyboardDragging()).toBe(true)
  })
  it('rejects captured old context completion without clearing ownership or writing order', () => {
    const instances = observeSensor(KeyboardSensor)
    const interactionRef = { current: null }
    render(<ColorPalette interactionRef={interactionRef} />)
    key('Space')
    drain()
    const old = contexts.latest
    const activatorEvent = instances[0].props.event
    act(() => interactionRef.current.cancel())
    key('Space')
    drain()
    const writes = vi.fn()
    const unsubscribe = useProjectStore.subscribe((next, previous) => {
      if (next.colors !== previous.colors) writes()
    })
    try {
      act(() => old.onDragEnd({ active: { id: 'color-1' }, over: { id: 'color-0' }, activatorEvent }))
      expect(writes).not.toHaveBeenCalled()
      expect(colors()).toEqual(['#111111', '#222222', '#111111'])
      expect(interactionRef.current.isKeyboardDragging()).toBe(true)
      act(() => old.onDragCancel({ activatorEvent }))
      act(() => old.onDragStart({ active: { id: 'color-1' }, activatorEvent }))
      expect(interactionRef.current.isKeyboardDragging()).toBe(true)
      expect(handle().getAttribute('aria-pressed')).toBe('true')
      act(() => interactionRef.current.cancel())
    } finally {
      unsubscribe()
    }
  })
  it('subsequent real keyboard drop writes exactly once and focuses the moved swatch', async () => {
    const interactionRef = { current: null }
    render(<ColorPalette interactionRef={interactionRef} />)
    key('Space')
    drain()
    act(() => interactionRef.current.cancel())
    const writes = vi.fn()
    const unsubscribe = useProjectStore.subscribe((next, previous) => {
      if (next.colors !== previous.colors) writes()
    })
    try {
      key('Space')
      drain()
      // jsdom's tied zero rectangles resolve to the first item. Native keyboard
      // drop still traverses dnd-kit and the real store; browser geometry is separate.
      key('Space')
      await act(async () => {})
      expect(writes).toHaveBeenCalledTimes(1)
      expect(colors()).toEqual(['#222222', '#111111', '#111111'])
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /^Edit color 1:/ }))
      expect(interactionRef.current.isKeyboardDragging()).toBe(false)
    } finally {
      unsubscribe()
    }
  })
  it('isolates captured old native entries and callbacks from new keyboard ownership', () => {
    const instances = observeSensor(KeyboardSensor)
    const interactionRef = { current: null }
    render(<ColorPalette interactionRef={interactionRef} />)
    key('Space')
    drain()
    const old = instances[0]
    act(() => interactionRef.current.cancel())
    key('Space')
    drain()
    const current = instances[1]
    const writes = vi.fn()
    const unsubscribe = useProjectStore.subscribe((next, previous) => {
      if (next.colors !== previous.colors) writes()
    })
    const focus = document.activeElement
    const event = new KeyboardEvent('keydown', { code: 'Space', cancelable: true })
    try {
      act(() => {
        old.handleKeyDown(event)
        old.handleStart()
        old.handleMove(event, { x: 100, y: 100 })
        old.handleCancel(event)
        old.props.onStart({ x: 100, y: 100 })
        old.props.onMove({ x: 100, y: 100 })
        old.props.onEnd()
        old.props.onCancel()
      })
      expect(event.defaultPrevented).toBe(false)
      expect(interactionRef.current.isKeyboardDragging()).toBe(true)
      expect(current.props.paletteSession.generation.session).toBe(current.props.paletteSession)
      expect(handle().getAttribute('aria-pressed')).toBe('true')
      expect(document.activeElement).toBe(focus)
      expect(writes).not.toHaveBeenCalled()
      expect(colors()).toEqual(['#111111', '#222222', '#111111'])
      act(() => interactionRef.current.cancel())
      expect(interactionRef.current.isKeyboardDragging()).toBe(false)
    } finally {
      unsubscribe()
    }
  })
  it.each(['pending', 'active', 'keyboard'])(
    'retires %s teardown in StrictMode and preserves newer handle publication',
    (phase) => {
      const instances = observeSensor(phase === 'keyboard' ? KeyboardSensor : PointerSensor)
      const interactionRef = { current: null }
      const view = render(
        <StrictMode>
          <ColorPalette interactionRef={interactionRef} />
        </StrictMode>
      )
      if (phase === 'keyboard') key('Space')
      else {
        pointer('pointerdown', handle())
        if (phase === 'active') pointer('pointermove', document, 40)
      }
      const old = instances[0]
      expect(old).toBeDefined()
      const newerHandle = {}
      interactionRef.current = newerHandle
      view.unmount()
      expect(interactionRef.current).toBe(newerHandle)
      expect(old.props.paletteSession.retired).toBe(true)
      expect(old.props.paletteSession.resourcesOpen).toBe(false)
      const add = vi.spyOn(document, 'addEventListener')
      drain()
      expect(add.mock.calls.filter(([type]) => type === 'keydown')).toEqual([])
      const event = new KeyboardEvent('keydown', { code: 'Space', cancelable: true })
      fireEvent(document, event)
      pointer('pointermove', document, 80)
      pointer('pointerup')
      expect(event.defaultPrevented).toBe(false)
      expect(colors()).toEqual(['#111111', '#222222', '#111111'])
    }
  )
  it('handles constructor-time reentrant retirement before keyboard attach continues', () => {
    const interactionRef = { current: null }
    const start = KeyboardSensor.prototype.handleStart
    const instances = []
    vi.spyOn(KeyboardSensor.prototype, 'handleStart').mockImplementation(function (...args) {
      instances.push(this)
      const result = start.apply(this, args)
      interactionRef.current.cancel()
      return result
    })
    render(<ColorPalette interactionRef={interactionRef} />)
    const add = vi.spyOn(document, 'addEventListener')
    key('Space')
    drain()
    expect(instances[0].props.paletteSession.retired).toBe(true)
    expect(add.mock.calls.filter(([type]) => type === 'keydown')).toEqual([])
    expect(interactionRef.current.isKeyboardDragging()).toBe(false)
    expect(handle().getAttribute('aria-pressed')).not.toBe('true')
  })
  it.each(['active', 'drop-tail'])('immediately releases document click during %s retirement', (phase) => {
    const interactionRef = { current: null }
    render(<ColorPalette interactionRef={interactionRef} />)
    pointer('pointerdown', handle())
    pointer('pointermove', document, 40)
    expect(handle().getAttribute('aria-pressed')).toBe('true')
    const rail = document.createElement('button')
    document.body.append(rail)
    const click = vi.fn()
    rail.addEventListener('click', click)
    try {
      if (phase === 'drop-tail') {
        pointer('pointerup')
        fireEvent.click(rail)
        expect(click).not.toHaveBeenCalled()
      }
      rail.addEventListener('pointerdown', () => interactionRef.current.cancel(), { capture: true })
      fireEvent.pointerDown(rail)
      fireEvent.click(rail)
      expect(click).toHaveBeenCalledTimes(1)
      pointer('pointerdown', handle())
      pointer('pointermove', document, 40)
      act(() => vi.advanceTimersByTime(50))
      fireEvent.click(rail)
      expect(click).toHaveBeenCalledTimes(1)
      act(() => interactionRef.current.cancel())
    } finally {
      rail.remove()
    }
  })
})
