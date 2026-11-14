import { it, expect, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import { PresetGallery } from './PresetGallery.jsx'
import { usePresetStore } from '../../store/usePresetStore.js'
import { useProjectStore } from '../../store/useProjectStore.js'
const initialProject = useProjectStore.getState(),
  initialPresets = usePresetStore.getState()
const storage = localStorage.getItem('bitmapforge-presets')
// Keep accessible-name/style work inside the custom card, not the built-in grid.
const customCard = (name) => within(screen.getByText(name).closest('button').parentElement)
afterEach(() => {
  cleanup()
  useProjectStore.setState(initialProject, true)
  usePresetStore.setState(initialPresets, true)
  if (storage === null) localStorage.removeItem('bitmapforge-presets')
  else localStorage.setItem('bitmapforge-presets', storage)
})
it('renders only the first five colors in order, including an empty palette, and applies/deletes', () => {
  const colors = ['red', 'blue', 'green', 'white', 'black', 'yellow']
  usePresetStore.setState({
    customPresets: [
      { id: 'many', name: 'Many colors', category: 'custom', settings: { colors } },
      { id: 'empty', name: 'Empty colors', category: 'custom', settings: { colors: [] } }
    ]
  })
  render(<PresetGallery />)
  const manyCard = customCard('Many colors')
  const button = manyCard.getByRole('button', { name: 'Many colors' })
  expect(Array.from(button.querySelectorAll('[style]'), (node) => node.style.backgroundColor)).toEqual(
    colors.slice(0, 5)
  )
  expect(
    customCard('Empty colors').getByRole('button', { name: 'Empty colors' }).querySelectorAll('[style]')
  ).toHaveLength(0)
  fireEvent.click(button)
  expect(useProjectStore.getState().colors).toEqual(colors)
  fireEvent.click(manyCard.getByRole('button', { name: 'Delete preset Many colors' }))
  expect(usePresetStore.getState().customPresets.map((p) => p.id)).toEqual(['empty'])
})
it('saves trimmed names and current colors and persists deletion', () => {
  usePresetStore.setState({ customPresets: [] })
  useProjectStore.setState({ colors: ['tomato'] })
  render(<PresetGallery />)
  const saveCurrent = screen.getByText('+ Save current as preset', { selector: 'button' })
  expect(saveCurrent.tagName).toBe('BUTTON')
  fireEvent.click(saveCurrent)
  const nameInput = screen.getByPlaceholderText('Preset name…')
  const saveForm = within(nameInput.parentElement)
  fireEvent.change(nameInput, { target: { value: '  My palette  ' } })
  fireEvent.click(saveForm.getByRole('button', { name: 'Save', exact: true }))
  expect(usePresetStore.getState().customPresets[0]).toMatchObject({
    name: 'My palette',
    settings: { colors: ['tomato'] }
  })
  expect(JSON.parse(localStorage.getItem('bitmapforge-presets')).state.customPresets).toHaveLength(1)
  fireEvent.click(customCard('My palette').getByRole('button', { name: 'Delete preset My palette' }))
  expect(JSON.parse(localStorage.getItem('bitmapforge-presets')).state.customPresets).toEqual([])
})
