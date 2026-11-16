import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { computeAccessibleName } from 'dom-accessibility-api'
import { useState } from 'react'
import { ColorPalette } from './ColorPalette.jsx'
import { BUILT_IN_PRESETS } from '../../data/builtInPresets.js'
import { useProjectStore } from '../../store/useProjectStore.js'
import { usePresetStore } from '../../store/usePresetStore.js'

beforeEach(() => {
  useProjectStore.setState({ colors: ['#111111', '#222222', '#111111'] })
  usePresetStore.setState({ customPresets: [] })
  vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}])
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
// Prefilter native buttons before checking their real accessible names. This
// avoids computing every built-in swatch subtree for every interaction in jsdom.
const button = (name) => {
  const matches = [...document.querySelectorAll('button')]
    .filter((node) => !node.closest('[hidden], [inert]'))
    .filter((node) => {
      const text = node.getAttribute('aria-label') ?? node.textContent.trim()
      return typeof name === 'string' ? text.includes(name) : name.test(text)
    })
    .filter((node) =>
      typeof name === 'string' ? computeAccessibleName(node) === name : name.test(computeAccessibleName(node))
    )
  expect(matches).toHaveLength(1)
  return matches[0]
}
const click = (name) => fireEvent.click(button(name))
function Controlled() {
  const [palettesOpen, onPalettesOpenChange] = useState(false)
  const [presetDraft, onPresetDraftChange] = useState('')
  const [presetSaveOpen, onPresetSaveOpenChange] = useState(false)
  return (
    <ColorPalette
      {...{
        palettesOpen,
        onPalettesOpenChange,
        presetDraft,
        onPresetDraftChange,
        presetSaveOpen,
        onPresetSaveOpenChange
      }}
    />
  )
}

describe('compact palette browser and name lifetime', () => {
  it.each([
    ['local', ColorPalette],
    ['controlled', Controlled]
  ])('keeps edit strip before complete browsing and name independent of browsing (%s)', (_label, Component) => {
    render(<Component />)
    const browse = button('Browse palettes')
    expect(browse.getAttribute('aria-expanded')).toBe('false')
    expect(button(/^Edit color 1:/).compareDocumentPosition(browse) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(document.getElementById(browse.getAttribute('aria-controls')).hidden).toBe(true)
    click('Save palette')
    const name = screen.getByLabelText('Palette name')
    expect(document.activeElement).toBe(name)
    fireEvent.change(name, { target: { value: 'Keep me' } })
    click('Browse palettes')
    const browser = document.getElementById(browse.getAttribute('aria-controls'))
    expect(browser.hidden).toBe(false)
    expect(
      within(browser)
        .getAllByRole('button', { hidden: true })
        .map((node) => node.textContent.trim())
    ).toEqual(BUILT_IN_PRESETS.map((preset) => preset.name))
    click('Browse palettes')
    expect(screen.getByLabelText('Palette name').value).toBe('Keep me')
    click('Save palette')
    expect(usePresetStore.getState().customPresets[0].settings).toEqual({ colors: ['#111111', '#222222', '#111111'] })
    expect(screen.queryByLabelText('Palette name')).toBeNull()
  })
  it('applies every built-in and custom palette as colors only; deletes custom only', () => {
    const custom = { id: 'custom-test', name: 'Mine', category: 'custom', settings: { colors: ['#abcdef', '#123456'] } }
    usePresetStore.setState({ customPresets: [custom] })
    render(<ColorPalette />)
    click('Browse palettes')
    const browser = document.getElementById(button('Browse palettes').getAttribute('aria-controls'))
    const actions = within(browser).getAllByRole('button', { hidden: true })
    for (const [index, preset] of [...BUILT_IN_PRESETS, custom].entries()) {
      const before = useProjectStore.getState()
      expect(actions[index].textContent.trim()).toBe(preset.name)
      fireEvent.click(actions[index])
      const after = useProjectStore.getState()
      expect(after.colors).toEqual(preset.settings.colors)
      for (const key of Object.keys(before).filter((key) => key !== 'colors')) expect(after[key]).toBe(before[key])
    }
    expect(
      within(browser)
        .getAllByRole('button', { hidden: true })
        .filter((node) => node.getAttribute('aria-label')?.startsWith('Delete palette '))
    ).toHaveLength(1)
    click('Delete palette Mine')
    expect(usePresetStore.getState().customPresets).toEqual([])
  })
  it.each(['Browse palettes', 'Save palette', 'Add', 'Remove'])(
    'retires the hex transaction at %s pointer capture before blur',
    (destination) => {
      render(<ColorPalette />)
      fireEvent.click(button(/^Edit color 1:/))
      const input = screen.getByLabelText('Hex color')
      fireEvent.change(input, { target: { value: '#abc' } })
      const target = button(destination)
      fireEvent.pointerDown(target)
      expect(screen.queryByLabelText('Hex color')).toBeNull()
      fireEvent.blur(input, { relatedTarget: target })
      fireEvent.click(target)
      expect(useProjectStore.getState().colors[0]).toBe('#111111')
    }
  )
  it.each(['#abc', '#badhex'])('invalidates a %s draft when applying a palette', (value) => {
    render(<ColorPalette palettesOpen />)
    fireEvent.click(button(/^Edit color 1:/))
    const input = screen.getByLabelText('Hex color')
    fireEvent.change(input, { target: { value } })
    click(BUILT_IN_PRESETS[0].name)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(useProjectStore.getState().colors).toEqual(BUILT_IN_PRESETS[0].settings.colors)
    expect(screen.queryByLabelText('Hex color')).toBeNull()
  })
  it('never autofocuses controlled-open mount/remount', () => {
    const view = render(
      <>
        <button>Owner</button>
        <ColorPalette presetSaveOpen presetDraft="Kept" />
      </>
    )
    const owner = button('Owner')
    owner.focus()
    view.rerender(
      <>
        <button>Owner</button>
        <ColorPalette key="replacement" presetSaveOpen presetDraft="Kept" />
      </>
    )
    expect(screen.getByLabelText('Palette name').value).toBe('Kept')
    expect(document.activeElement).toBe(owner)
  })
  it.each(['Cancel palette', 'Escape', 'Save palette'])(
    'explicit %s clears and restores the visible trigger',
    async (action) => {
      render(<ColorPalette />)
      click('Save palette')
      const name = screen.getByLabelText('Palette name')
      expect(name.getAttribute('data-bf-palette-name')).toBe('')
      fireEvent.change(name, { target: { value: 'Saved' } })
      if (action === 'Escape') fireEvent.keyDown(name, { key: 'Escape' })
      else click(action)
      await act(async () => {})
      expect(screen.queryByLabelText('Palette name')).toBeNull()
      expect(document.activeElement).toBe(button('Save palette'))
      click('Save palette')
      expect(screen.getByLabelText('Palette name').value).toBe('')
    }
  )
  it.each(['cancel', 'same-instance-hide', 'unmount', 'reopen'])(
    'invalidates queued name restoration through %s',
    (ending) => {
      const jobs = []
      vi.spyOn(globalThis, 'queueMicrotask').mockImplementation((job) => jobs.push(job))
      const interactionRef = { current: null }
      const view = render(
        <>
          <button>Owner</button>
          <div>
            <ColorPalette interactionRef={interactionRef} />
          </div>
        </>
      )
      click('Save palette')
      click('Cancel palette')
      const owner = button('Owner')
      if (ending === 'same-instance-hide')
        screen.getByRole('region', { name: 'Color palette editor' }).parentElement.hidden = true
      if (ending === 'unmount') view.rerender(<button>Owner</button>)
      if (ending === 'cancel' || ending === 'same-instance-hide')
        act(() => interactionRef.current.cancel({ restoreFocus: false }))
      // Re-expose the very same nodes before draining: visibility checks alone
      // cannot protect this race; the parent's synchronous generation must.
      if (ending === 'same-instance-hide')
        screen.getByRole('region', { name: 'Color palette editor', hidden: true }).parentElement.hidden = false
      if (ending === 'reopen') click('Save palette')
      const expected = ending === 'reopen' ? screen.getByLabelText('Palette name') : owner
      expected.focus()
      act(() => jobs.forEach((job) => job()))
      expect(document.activeElement).toBe(expected)
    }
  )
  it('invalidates delayed explicit name focus before a controlled-open commit', () => {
    const interactionRef = { current: null }
    const onPresetSaveOpenChange = vi.fn()
    const view = render(
      <>
        <button>Owner</button>
        <ColorPalette {...{ interactionRef, onPresetSaveOpenChange }} presetSaveOpen={false} />
      </>
    )
    click('Save palette')
    expect(onPresetSaveOpenChange).toHaveBeenCalledWith(true)
    act(() => interactionRef.current.cancel({ restoreFocus: false }))
    const owner = button('Owner')
    owner.focus()
    view.rerender(
      <>
        <button>Owner</button>
        <ColorPalette {...{ interactionRef, onPresetSaveOpenChange }} presetSaveOpen />
      </>
    )
    expect(document.activeElement).toBe(owner)
  })
  it('preserves controlled drafts and root through hide/cancel/reveal before focus jobs drain', () => {
    const jobs = []
    vi.spyOn(globalThis, 'queueMicrotask').mockImplementation((job) => jobs.push(job))
    const interactionRef = { current: null }
    render(
      <>
        <button>Owner</button>
        <div>
          <ColorPalette interactionRef={interactionRef} palettesOpen presetSaveOpen presetDraft="Keep draft" />
        </div>
      </>
    )
    const root = screen.getByRole('region', { name: 'Color palette editor' })
    const name = screen.getByLabelText('Palette name')
    fireEvent.click(button(/^Edit color 2:/))
    fireEvent.keyDown(screen.getByLabelText('Hex color'), { key: 'Escape' })
    root.parentElement.hidden = true
    act(() => interactionRef.current.cancel({ restoreFocus: false }))
    root.parentElement.hidden = false
    const owner = button('Owner')
    owner.focus()
    act(() => jobs.splice(0).forEach((job) => job()))
    expect(screen.getByRole('region', { name: 'Color palette editor' })).toBe(root)
    expect(screen.getByLabelText('Palette name')).toBe(name)
    expect(name.value).toBe('Keep draft')
    expect(button('Browse palettes').getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(owner)
  })
  it('directly validates the optional controlled metadata', () => {
    for (const key of ['palettesOpen', 'presetSaveOpen']) {
      expect(ColorPalette.propTypes[key]({}, key)).toBeNull()
      expect(ColorPalette.propTypes[key]({ [key]: false }, key)).toBeNull()
      expect(ColorPalette.propTypes[key]({ [key]: 'false' }, key)).toBeInstanceOf(Error)
    }
    for (const key of ['onPalettesOpenChange', 'onPresetSaveOpenChange', 'onPresetDraftChange']) {
      expect(ColorPalette.propTypes[key]({}, key)).toBeNull()
      expect(ColorPalette.propTypes[key]({ [key]: () => {} }, key)).toBeNull()
      expect(ColorPalette.propTypes[key]({ [key]: true }, key)).toBeInstanceOf(Error)
    }
  })
})
