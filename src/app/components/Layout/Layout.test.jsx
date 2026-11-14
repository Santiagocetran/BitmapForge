import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup, act, waitFor } from '@testing-library/react'
import { Layout } from './Layout.jsx'
import { SceneManagerProvider } from '../../context/SceneManagerContext.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'
import { StrictMode } from 'react'

const mocks = vi.hoisted(() => ({
  manager: null,
  constructors: 0,
  pending: null,
  listeners: new Set(),
  desktop: false,
  realExportPanel: false,
  saveOverride: null,
  cancel: vi.fn()
}))
vi.mock('../../../engine/SceneManager.js', () => ({
  SceneManager: class {
    constructor() {
      mocks.constructors++
      mocks.manager = new Proxy(
        {},
        {
          get: (target, name) => {
            if (!target[name])
              target[name] = vi.fn(
                name === 'loadModel' || name === 'loadText' || name === 'loadImage'
                  ? () =>
                      new Promise((resolve, reject) => {
                        mocks.pending = { resolve, reject }
                      })
                  : () => {}
              )
            return target[name]
          }
        }
      )
      return mocks.manager
    }
  }
}))
vi.mock('../InputSource/InputSource.jsx', () => ({ InputSource: () => <input aria-label="Input fixture" /> }))
vi.mock('../ColorPalette/ColorPalette.jsx', async () => {
  const { useImperativeHandle } = await import('react')
  const contracts = await import('../../utils/uiPropValidators.js')
  function PaletteFixture({ interactionRef, presetDraft, onPresetDraftChange }) {
    useImperativeHandle(interactionRef, () => ({ cancel: mocks.cancel }))
    return (
      <input
        aria-label="Preset draft fixture"
        value={presetDraft}
        onChange={(e) => onPresetDraftChange(e.target.value)}
      />
    )
  }
  PaletteFixture.propTypes = {
    interactionRef: contracts.interactionRef,
    presetDraft: contracts.requiredString,
    onPresetDraftChange: contracts.requiredFunction
  }
  return { ColorPalette: PaletteFixture }
})
vi.mock('../QualitySettings/QualitySettings.jsx', async () => {
  const contracts = await import('../../utils/uiPropValidators.js')
  function QualityFixture({ advancedOpen, onAdvancedOpenChange }) {
    return (
      <button onClick={() => onAdvancedOpenChange(!advancedOpen)} aria-pressed={advancedOpen}>
        Advanced fixture
      </button>
    )
  }
  QualityFixture.propTypes = {
    advancedOpen: contracts.requiredBoolean,
    onAdvancedOpenChange: contracts.requiredFunction
  }
  return { QualitySettings: QualityFixture }
})
vi.mock('../AnimationControls/AnimationControls.jsx', () => ({ AnimationControls: () => null }))
vi.mock('../LightDirection/LightDirection.jsx', () => ({ LightDirection: () => null }))
vi.mock('../RotationGizmo/RotationGizmoPanel.jsx', () => ({ RotationGizmoPanel: () => null }))
vi.mock('../ExportPanel/ExportPanel.jsx', async (importOriginal) => {
  const { ExportPanel } = await importOriginal()
  return {
    // Disclosure/status tests do not exercise export presentation. The lifetime
    // test below keeps the real panel AND controller with deferred work.
    ExportPanel: (props) => (mocks.realExportPanel ? <ExportPanel {...props} /> : <div>Export fixture</div>)
  }
})
vi.mock('../../utils/codeExport.js', () => ({ buildCodeZip: vi.fn() }))
vi.mock('../../hooks/useExportController.js', async (importOriginal) => {
  const original = await importOriginal()
  return {
    useExportController: function useExportController() {
      const controller = original.useExportController()
      return { ...controller, saveProject: mocks.saveOverride ?? controller.saveProject }
    }
  }
})
const initial = useProjectStore.getState()
function mount(props = {}) {
  return render(
    <SceneManagerProvider>
      <Layout {...props} />
    </SceneManagerProvider>
  )
}
// Scope accessible queries to the section under test instead of computing names
// for every unrelated setting/format button in jsdom.
function sectionButton(title, root = document.body) {
  const section = [...root.querySelectorAll('[data-section]')].find((node) => node.dataset.section === title)
  return within(section.querySelector('h3')).getByRole('button', {
    name: title,
    exact: true
  })
}
function closeButton() {
  return within(screen.getByRole('dialog', { name: 'Settings' }).firstElementChild).getByRole('button', {
    name: 'Close settings'
  })
}
function advancedButton() {
  return within(sectionButton('Look').closest('section')).getByRole('button', { name: 'Advanced fixture' })
}
function resize(desktop) {
  act(() => {
    mocks.desktop = desktop
    for (const fn of mocks.listeners) fn()
  })
}
beforeEach(() => {
  mocks.constructors = 0
  mocks.pending = null
  mocks.desktop = false
  mocks.realExportPanel = false
  mocks.saveOverride = null
  mocks.listeners.clear()
  mocks.cancel.mockClear()
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return mocks.desktop
    },
    addEventListener: (_, fn) => mocks.listeners.add(fn),
    removeEventListener: (_, fn) => mocks.listeners.delete(fn)
  }))
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    }
  )
  useProjectStore.setState(
    { ...initial, inputType: 'shape', status: { loading: false, exporting: false, message: '', error: '' } },
    true
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('responsive Layout integration with real PreviewCanvas', () => {
  it('publishes the latest committed bridge, detaches replaced refs and clears its own handle', async () => {
    const first = { current: null }
    const second = { current: null }
    const saveA = vi.fn()
    const saveB = vi.fn(() => {
      throw new Error('save failed')
    })
    mocks.saveOverride = saveA
    const view = mount({ bridgeRef: first })
    const previous = first.current
    first.current.saveProject()
    expect(saveA).toHaveBeenCalledOnce()
    mocks.saveOverride = saveB
    view.rerender(
      <SceneManagerProvider>
        <Layout bridgeRef={first} />
      </SceneManagerProvider>
    )
    expect(first.current).not.toBe(previous)
    expect(() => first.current.saveProject()).toThrow('save failed')
    expect(saveB).toHaveBeenCalledOnce()
    view.rerender(
      <SceneManagerProvider>
        <Layout bridgeRef={second} />
      </SceneManagerProvider>
    )
    expect(first.current).toBeNull()
    expect(second.current.saveProject).toBe(saveB)
    view.unmount()
    expect(second.current).toBeNull()
    await act(async () => {})
  })
  it('keeps StrictMode bridge usable and preserves an external replacement on cleanup', async () => {
    const bridgeRef = { current: null }
    mocks.saveOverride = vi.fn()
    const view = render(
      <StrictMode>
        <SceneManagerProvider>
          <Layout bridgeRef={bridgeRef} />
        </SceneManagerProvider>
      </StrictMode>
    )
    bridgeRef.current.saveProject()
    expect(mocks.saveOverride).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Open settings' }))
    bridgeRef.current.beforeHelp()
    expect(mocks.cancel).toHaveBeenCalledWith({ restoreFocus: false })
    fireEvent.click(closeButton())
    mocks.cancel.mockClear()
    bridgeRef.current.beforeHelp()
    expect(mocks.cancel).not.toHaveBeenCalled()
    const replacement = { owner: 'external' }
    bridgeRef.current = replacement
    view.unmount()
    expect(bridgeRef.current).toBe(replacement)
    await act(async () => {})
  })
  it('keeps one deferred export and manager alive across close, reopen and both breakpoints', async () => {
    mocks.realExportPanel = true
    const { buildCodeZip } = await import('../../utils/codeExport.js')
    let resolve
    buildCodeZip.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r
        })
    )
    const download = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    mount()
    fireEvent.click(screen.getByRole('button', { name: 'Open settings' }))
    const close = within(screen.getByRole('dialog').firstElementChild).getByRole('button', { name: 'Close settings' })
    const exportSection = within(sectionButton('Export & Project').closest('section'))
    const formats = within(exportSection.getByRole('group', { name: 'Export format' }))
    fireEvent.click(formats.getByRole('button', { name: 'Code ZIP', exact: true }))
    fireEvent.click(exportSection.getByRole('button', { name: 'Export Code ZIP' }))
    await waitFor(() => expect(resolve).toBeDefined())
    fireEvent.click(close)
    resize(true)
    expect(
      within(screen.getByRole('group', { name: 'Export format' }))
        .getByRole('button', { name: 'Code ZIP', exact: true })
        .getAttribute('aria-pressed')
    ).toBe('true')
    resize(false)
    fireEvent.click(screen.getByRole('button', { name: 'Export & Project', exact: true }))
    const reopened = within(sectionButton('Export & Project').closest('section'))
    expect(reopened.getByRole('button', { name: 'Exporting…' }).disabled).toBe(true)
    await act(async () => resolve(new Blob(['one result'])))
    await waitFor(() => expect(download).toHaveBeenCalledOnce())
    expect(buildCodeZip).toHaveBeenCalledOnce()
    expect(mocks.constructors).toBe(1)
    // The download spy is restored unconditionally by afterEach, even on timeout.
  }, 15000)
  it('preserves required disclosure/draft state and cancels palette before parent hiding', () => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: 'Open settings' }))
    fireEvent.change(screen.getByLabelText('Preset draft fixture'), { target: { value: 'My palette' } })
    fireEvent.click(advancedButton())
    fireEvent.click(sectionButton('Color Palette'))
    expect(mocks.cancel).toHaveBeenCalledWith({ restoreFocus: false })
    fireEvent.click(closeButton())
    resize(true)
    const palette = sectionButton('Color Palette')
    expect(palette.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(palette)
    expect(screen.getByLabelText('Preset draft fixture').value).toBe('My palette')
    expect(advancedButton().getAttribute('aria-pressed')).toBe('true')
  })
  it.each(['model', 'text', 'image'])(
    'clears stale success through %s loading, failure and nondestructive dismiss',
    async (inputType) => {
      const model = { file: new File(['data'], 'valid.glb') }
      useProjectStore.setState({
        inputType,
        model,
        imageSource: 'data:image/png;base64,AA',
        status: { loading: false, exporting: false, message: 'Obsolete success', error: '' }
      })
      mount()
      expect(useProjectStore.getState().status.message).toBe('')
      expect(useProjectStore.getState().status.loading).toBe(true)
      await act(async () => mocks.pending.reject(new Error('source failed')))
      expect(screen.getAllByText('source failed')).toHaveLength(1)
      fireEvent.click(screen.getByRole('button', { name: 'Dismiss error' }))
      await act(async () => {})
      expect(screen.getByRole('status').textContent).toBe('')
      expect(useProjectStore.getState().model).toBe(model)
    }
  )
  it.each(['shape', 'model', 'image'])(
    'retires a cancelled source load when replaced by empty %s without ending an export',
    async (inputType) => {
      useProjectStore.setState({ inputType: 'text' })
      mount()
      const pending = mocks.pending
      act(() => useProjectStore.getState().setStatus({ exporting: true, message: 'Export progress' }))
      act(() => useProjectStore.setState({ inputType, model: null, imageSource: null }))
      expect(useProjectStore.getState().status).toMatchObject({
        loading: false,
        exporting: true,
        message: 'Export progress'
      })
      await act(async () => pending.reject(new Error('obsolete source failure')))
      expect(screen.queryByRole('alert')).toBeNull()
      expect(useProjectStore.getState().status).toMatchObject({
        loading: false,
        exporting: true,
        message: 'Export progress'
      })
    }
  )
  it('preserves unrelated preview focus and UI-only changes stay outside history', () => {
    const bridgeRef = { current: null }
    mount({ bridgeRef })
    const previewAction = screen.getByRole('button', { name: 'Export & Project', exact: true })
    previewAction.focus()
    resize(true)
    // The mobile action itself disappears; use the stable preview container for
    // an unrelated focus target when checking the reverse direction.
    const region = screen.getByRole('region', { name: 'Preview' })
    region.tabIndex = -1
    region.focus()
    const history = useProjectStore.temporal.getState().pastStates.length
    fireEvent.click(screen.getByRole('button', { name: 'Collapse settings', exact: true }))
    region.focus()
    resize(false)
    expect(document.activeElement).toBe(region)
    expect(useProjectStore.temporal.getState().pastStates.length).toBe(history)
    const invoker = document.createElement('button')
    document.body.appendChild(invoker)
    invoker.focus()
    bridgeRef.current.beforeHelp()
    region.focus()
    bridgeRef.current.restoreHelpFocus()
    expect(document.activeElement).toBe(invoker)
    invoker.disabled = true
    bridgeRef.current.restoreHelpFocus()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open settings', exact: true }))
    invoker.disabled = false
    invoker.hidden = true
    bridgeRef.current.restoreHelpFocus()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open settings', exact: true }))
    invoker.remove()
    bridgeRef.current.restoreHelpFocus()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open settings', exact: true }))
  })
  it('moves one stable notice into drawer, defers help updates and returns it to preview', async () => {
    const view = mount()
    const notice = screen.getByRole('status')
    fireEvent.click(screen.getByRole('button', { name: 'Open settings' }))
    act(() => useProjectStore.getState().setStatus({ message: 'Project saved' }))
    await act(async () => {})
    expect(screen.getByRole('dialog').contains(notice)).toBe(true)
    expect(screen.getByRole('status')).toBe(notice)
    view.rerender(
      <SceneManagerProvider>
        <Layout helpOpen />
      </SceneManagerProvider>
    )
    act(() => useProjectStore.getState().setStatus({ message: 'Latest completion' }))
    expect(notice.textContent).toBe('Project saved')
    view.rerender(
      <SceneManagerProvider>
        <Layout />
      </SceneManagerProvider>
    )
    await act(async () => {})
    expect(notice.textContent).toBe('Latest completion')
    fireEvent.click(closeButton())
    expect(screen.getByRole('status')).toBe(notice)
    expect(screen.getByRole('region', { name: 'Preview' }).contains(notice)).toBe(true)
  })
})
