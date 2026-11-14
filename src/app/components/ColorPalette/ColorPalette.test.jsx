/* eslint-disable react/prop-types -- Test picker callback fixture. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ColorPalette, normalizePaletteHex } from './ColorPalette.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'
import { usePresetStore } from '../../store/usePresetStore.js'

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
afterEach(cleanup)
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
