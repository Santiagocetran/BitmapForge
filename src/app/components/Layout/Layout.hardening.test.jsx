import { StrictMode, useRef, useState } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup, act, waitFor } from '@testing-library/react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { Layout } from './Layout.jsx'
import { ShortcutsModal } from '../ui/ShortcutsModal.jsx'
import { SceneManagerProvider } from '../../context/SceneManagerContext.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'

const media = vi.hoisted(() => ({ desktop: true, listeners: new Set() }))
vi.mock('../../../engine/SceneManager.js', () => ({
  SceneManager: class {
    constructor() {
      return new Proxy({}, { get: (target, key) => (target[key] ??= vi.fn()) })
    }
  }
}))
vi.mock('../../hooks/useExportController.js', () => ({
  useExportController: () => ({
    selectedFormat: 'png',
    onSelectFormat: () => {},
    exportSelected: () => {},
    cancelExport: () => {},
    saveProject: () => {},
    loadProject: () => {},
    exporting: false,
    disabledReason: ''
  })
}))
const initial = useProjectStore.getState()
function Fixture() {
  const [open, setOpen] = useState(false)
  const bridge = useRef(null)
  const showHelp = () => {
    bridge.current?.beforeHelp()
    setOpen(true)
  }
  return (
    <SceneManagerProvider>
      <TooltipProvider>
        <Layout bridgeRef={bridge} helpOpen={open} onShowHelp={showHelp} />
        <ShortcutsModal
          open={open}
          onOpenChange={setOpen}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            bridge.current?.restoreHelpFocus()
          }}
        />
      </TooltipProvider>
    </SceneManagerProvider>
  )
}
function resize(desktop) {
  act(() => {
    media.desktop = desktop
    for (const listener of media.listeners) listener()
  })
}
async function publish(message, error = '') {
  act(() => useProjectStore.getState().setStatus({ message, error }))
  await act(async () => {})
}
beforeEach(() => {
  // jsdom has no canvas renderer; retain real components and mock drawing only.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => new Proxy({}, { get: (target, key) => (target[key] ??= vi.fn()) })
  )
  media.desktop = true
  media.listeners.clear()
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return media.desktop
    },
    addEventListener: (_, listener) => media.listeners.add(listener),
    removeEventListener: (_, listener) => media.listeners.delete(listener)
  }))
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
  useProjectStore.setState(
    { ...initial, inputType: 'shape', status: { message: '', error: '', loading: false, exporting: false } },
    true
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('H1 real Layout sensor history', () => {
  const button = (name) => {
    const matches = [...document.querySelectorAll('button')].filter(
      (node) =>
        !node.closest('[hidden], [inert]') && (node.getAttribute('aria-label') ?? node.textContent.trim()) === name
    )
    expect(matches).toHaveLength(1)
    return within(matches[0].parentElement).getByRole('button', { name, exact: true })
  }
  const click = (name) => fireEvent.click(button(name))
  const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 0)))
  const escape = () => fireEvent.keyDown(document.activeElement, { key: 'Escape', code: 'Escape' })
  async function pickup() {
    const handle = button('Reorder color 2')
    handle.focus()
    fireEvent.keyDown(handle, { key: ' ', code: 'Space' })
    await settle()
    expect(button('Reorder color 2').getAttribute('aria-pressed')).toBe('true')
  }
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}])
    useProjectStore.setState({ colors: ['#111111', '#222222', '#111111'] })
  })
  it.each([false, true])('keeps desktop full history idle without writes (StrictMode %s)', async (strict) => {
    render(
      strict ? (
        <StrictMode>
          <Fixture />
        </StrictMode>
      ) : (
        <Fixture />
      )
    )
    click('Look')
    const root = screen.getByRole('region', { name: 'Color palette editor' })
    const writes = vi.fn()
    const unsubscribe = useProjectStore.subscribe((next, previous) => {
      if (next.colors !== previous.colors) writes()
    })
    try {
      await pickup()
      escape()
      await settle()
      expect(button('Reorder color 2').getAttribute('aria-pressed')).not.toBe('true')
      expect(document.activeElement).toBe(button('Reorder color 2'))
      await pickup()
      click('Motion')
      click('Look')
      await pickup()
      click('Collapse settings')
      click('Expand settings')
      await settle()
      expect(screen.getByRole('region', { name: 'Color palette editor' })).toBe(root)
      expect(button('Reorder color 2').getAttribute('aria-pressed')).not.toBe('true')
      expect(useProjectStore.getState().colors).toEqual(['#111111', '#222222', '#111111'])
      expect(writes).not.toHaveBeenCalled()
    } finally {
      unsubscribe()
    }
  })
  it.each(['fresh', 'task-hide', 'external'])(
    'keeps narrow first Escape local then dismisses after %s',
    async (history) => {
      media.desktop = false
      render(<Fixture />)
      click('Open settings')
      click('Look')
      if (history !== 'fresh') {
        await pickup()
        if (history === 'task-hide') {
          click('Motion')
          click('Look')
        } else act(() => useProjectStore.getState().setColors(['#111111', '#222222', '#111111']))
        expect(button('Reorder color 2').getAttribute('aria-pressed')).not.toBe('true')
      }
      await pickup()
      escape()
      await settle()
      expect(screen.getByRole('dialog', { name: 'Settings' })).toBeDefined()
      expect(button('Reorder color 2').getAttribute('aria-pressed')).not.toBe('true')
      expect(document.activeElement).toBe(button('Reorder color 2'))
      escape()
      await settle()
      expect(screen.queryByRole('dialog', { name: 'Settings' })).toBeNull()
      expect(useProjectStore.getState().colors).toEqual(['#111111', '#222222', '#111111'])
    }
  )
  it('retires active ownership for Help and permits a fresh subsequent Escape', async () => {
    render(<Fixture />)
    click('Look')
    await pickup()
    fireEvent.click(within(document.querySelector('.bf-header')).getByRole('button', { name: 'Help' }))
    const help = screen.getByRole('dialog', { name: 'Keyboard Shortcuts' })
    fireEvent.click(within(help).getByRole('button', { name: 'Close', exact: true }))
    await settle()
    expect(button('Reorder color 2').getAttribute('aria-pressed')).not.toBe('true')
    await pickup()
    escape()
    await settle()
    expect(button('Reorder color 2').getAttribute('aria-pressed')).not.toBe('true')
    expect(document.activeElement).toBe(button('Reorder color 2'))
  })
})

describe('H2 real Help/notice boundary', () => {
  it.each([
    ['desktop success', false, false, ''],
    ['settings success', true, false, ''],
    ['desktop error', false, false, 'source integration error'],
    ['settings error', true, false, 'source integration error'],
    ['desktop StrictMode success', false, true, ''],
    ['settings StrictMode success', true, true, ''],
    ['desktop StrictMode error', false, true, 'source integration error'],
    ['settings StrictMode error', true, true, 'source integration error']
  ])('isolates retained notice in %s, then restores latest to current host', async (_, drawer, strict, error) => {
    const fixture = <Fixture />
    render(strict ? <StrictMode>{fixture}</StrictMode> : fixture)
    await publish('source integration success')
    // Match the notice's actual role owner, not dnd-kit's separate live region.
    const notice = document.querySelector('.bf-notice [role="status"]')
    const wrapper = notice.parentElement
    const host = wrapper.parentElement
    expect(within(wrapper).getByRole('status')).toBe(notice)
    if (drawer) {
      resize(false)
      fireEvent.click(
        within(document.querySelector('.bf-mobile-toolbar')).getByRole('button', { name: 'Open settings' })
      )
      expect(screen.getByRole('dialog', { name: 'Settings' }).contains(wrapper)).toBe(true)
    }
    {
      await publish('source integration success', error)
      const alert = wrapper.querySelector('[role="alert"]')
      const dismiss = wrapper.querySelector('button')
      const retained = wrapper.textContent
      expect(notice.textContent).toBe(error ? '' : 'source integration success')
      if (error) {
        expect(within(wrapper).getByRole('alert')).toBe(alert)
        expect(alert.firstElementChild.textContent).toBe(error)
        expect(within(wrapper).getByRole('button', { name: 'Dismiss error' })).toBe(dismiss)
      }
      const invoker = drawer
        ? within(screen.getByRole('dialog', { name: 'Settings' }).firstElementChild).getByRole('button', {
            name: 'Help'
          })
        : within(document.querySelector('.bf-header')).getByRole('button', { name: 'Help' })
      invoker.focus()
      const mutations = []
      const observer = new MutationObserver((records) => mutations.push(...records))
      observer.observe(wrapper, { subtree: true, childList: true, characterData: true })
      try {
        fireEvent.click(invoker)
        const help = screen.getByRole('dialog', { name: 'Keyboard Shortcuts' })
        const close = within(help).getByRole('button', { name: 'Close', exact: true })
        expect(document.activeElement).toBe(close)
        expect(wrapper.textContent).toBe(retained)
        expect(wrapper.querySelector('[role="status"]')).toBe(notice)
        expect(wrapper.querySelector('[role="alert"]')).toBe(alert)
        expect(wrapper.querySelector('button')).toBe(dismiss)
        expect(wrapper.hidden).toBe(true)
        expect(wrapper.hasAttribute('inert')).toBe(true)
        expect(within(wrapper).queryByRole('status')).toBeNull()
        expect(within(wrapper).queryByRole('alert')).toBeNull()
        expect(within(wrapper).queryByRole('button')).toBeNull()
        await publish('hidden intermediate', 'obsolete error')
        await publish('newest completion', error ? 'newest error' : '')
        expect(wrapper.textContent).toBe(retained)
        mutations.push(...observer.takeRecords())
        expect(mutations).toHaveLength(0)
        expect(document.activeElement).toBe(close)
        fireEvent.click(close)
        await waitFor(() => expect(document.activeElement).toBe(invoker))
        expect(screen.queryByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeNull()
        expect(wrapper.hidden).toBe(false)
        expect(wrapper.hasAttribute('inert')).toBe(false)
        expect(within(wrapper).getByRole('status')).toBe(notice)
        expect(wrapper.parentElement).toBe(host)
        expect(notice.textContent).toBe(error ? '' : 'newest completion')
        if (error) expect(within(wrapper).getByRole('alert').firstElementChild.textContent).toBe('newest error')
        else expect(within(wrapper).queryByRole('alert')).toBeNull()
        expect(wrapper.textContent).not.toContain('source integration')
        expect(wrapper.textContent).not.toContain('obsolete')
        // A new modal lifetime must not inherit the removed Help's focus jobs.
        fireEvent.click(invoker)
        const reopened = screen.getByRole('dialog', { name: 'Keyboard Shortcuts' })
        expect(reopened).not.toBe(help)
        expect(document.activeElement).toBe(within(reopened).getByRole('button', { name: 'Close', exact: true }))
        fireEvent.keyDown(document.activeElement, { key: 'Escape', code: 'Escape' })
        await waitFor(() => expect(document.activeElement).toBe(invoker))
      } finally {
        observer.disconnect()
      }
    }
    if (drawer) {
      fireEvent.click(
        within(screen.getByRole('dialog', { name: 'Settings' }).firstElementChild).getByRole('button', {
          name: 'Close settings'
        })
      )
      await act(async () => {})
    }
    expect(screen.getByRole('region', { name: 'Preview' }).contains(wrapper)).toBe(true)
    expect(wrapper.parentElement).toBe(host)
    expect(within(wrapper).getByRole('status')).toBe(notice)
  })
})
