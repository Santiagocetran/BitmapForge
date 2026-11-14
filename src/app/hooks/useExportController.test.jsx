import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useExportController } from './useExportController.js'
import { useKeyboardShortcuts } from './useKeyboardShortcuts.js'
import { SceneManagerProvider } from '../context/SceneManagerContext.jsx'
import { useProjectStore } from '../store/useProjectStore.js'
import { loadProjectFile, saveProjectFile } from '../utils/projectFile.js'
vi.mock('../utils/projectFile.js', () => ({ loadProjectFile: vi.fn(), saveProjectFile: vi.fn() }))
const initial = useProjectStore.getState()
beforeEach(() => {
  vi.clearAllMocks()
  useProjectStore.setState(
    { ...initial, model: null, status: { loading: false, exporting: false, message: '', error: '' } },
    true
  )
})
afterEach(cleanup)
const wrapper = ({ children }) => <SceneManagerProvider>{children}</SceneManagerProvider>
describe('stable controller project paths and shortcut bridge', () => {
  it('reports failed import without stale text and clears error on successful import', async () => {
    loadProjectFile
      .mockRejectedValueOnce(new Error('bad file'))
      .mockResolvedValueOnce({ settings: { pixelSize: 7 }, modelFile: null })
    const { result } = renderHook(useExportController, { wrapper })
    useProjectStore.getState().setStatus({ message: 'Old success' })
    await act(async () => result.current.loadProject(new File(['bad'], 'bad.bitmapforge')))
    expect(useProjectStore.getState().status).toMatchObject({ message: '', error: 'bad file' })
    await act(async () => result.current.loadProject(new File(['ok'], 'ok.bitmapforge')))
    expect(useProjectStore.getState().status).toMatchObject({ message: 'Project loaded.', error: '' })
    expect(useProjectStore.getState().pixelSize).toBe(7)
  })
  it('cancel/no-file leaves state untouched', async () => {
    const { result } = renderHook(useExportController, { wrapper })
    await act(async () => result.current.loadProject(null))
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    useProjectStore.setState({ model: { name: 'preserve' } })
    await act(async () => result.current.loadProject(new File(['x'], 'x.bitmapforge')))
    expect(loadProjectFile).not.toHaveBeenCalled()
    expect(useProjectStore.getState().model.name).toBe('preserve')
    confirm.mockRestore()
  })
  it('Ctrl+S uses same save callback and reports failure then recovery; handled events are ignored', async () => {
    saveProjectFile.mockRejectedValueOnce(new Error('save failed')).mockResolvedValueOnce(undefined)
    renderHook(
      () => {
        const controller = useExportController()
        useKeyboardShortcuts({ onSaveProject: controller.saveProject })
        return controller
      },
      { wrapper }
    )
    await act(async () =>
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, cancelable: true }))
    )
    expect(useProjectStore.getState().status).toMatchObject({ message: '', error: 'Export failed: save failed' })
    await act(async () =>
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, cancelable: true }))
    )
    expect(useProjectStore.getState().status).toMatchObject({
      message: 'Project saved as .bitmapforge file.',
      error: ''
    })
    const handled = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, cancelable: true })
    handled.preventDefault()
    act(() => window.dispatchEvent(handled))
    expect(saveProjectFile).toHaveBeenCalledTimes(2)
  })
})
