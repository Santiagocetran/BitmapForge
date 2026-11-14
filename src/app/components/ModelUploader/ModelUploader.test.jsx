import { it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ModelUploader } from './ModelUploader.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'
const { open } = vi.hoisted(() => ({ open: vi.fn() }))
vi.mock('react-dropzone', () => ({
  useDropzone: () => ({ getRootProps: () => ({}), getInputProps: () => ({ type: 'file' }), isDragActive: false, open })
}))
const initial = useProjectStore.getState()
afterEach(() => {
  cleanup()
  useProjectStore.setState(initial, true)
  vi.clearAllMocks()
})
it('directly validates optional compact booleans', () => {
  const validate = ModelUploader.propTypes.compact
  for (const compact of [undefined, null, false, true])
    expect(validate({ compact }, 'compact', 'ModelUploader')).toBeNull()
  for (const compact of [0, 1, 'true', {}, () => {}]) {
    const error = validate({ compact }, 'compact', 'ModelUploader')
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('ModelUploader.compact')
  }
})
it.each([false, true])('retains chooser without a model, compact=%s', (compact) => {
  useProjectStore.setState({ model: null })
  render(<ModelUploader compact={compact} />)
  fireEvent.click(screen.getByRole('button', { name: 'Choose File' }))
  expect(open).toHaveBeenCalledOnce()
})
it('keeps compact filename, replace, and remove semantics', () => {
  useProjectStore.setState({
    model: new File(['cube'], 'cube.stl'),
    status: { ...initial.status, error: 'old', message: 'old' }
  })
  render(<ModelUploader compact />)
  expect(screen.getByText('cube.stl')).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: 'Replace' }))
  expect(open).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
  expect(useProjectStore.getState().model).toBeNull()
  expect(useProjectStore.getState().status).toMatchObject({ error: '', message: '' })
  expect(screen.getByRole('button', { name: 'Choose File' })).toBeDefined()
})
