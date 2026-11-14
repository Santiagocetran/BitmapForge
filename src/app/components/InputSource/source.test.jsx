import { StrictMode, createRef, useLayoutEffect } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { sourceKind, requiredFunction } from '../../utils/uiPropValidators.js'
import { InputSource } from './InputSource.jsx'
import { ModelUploader } from '../ModelUploader/ModelUploader.jsx'
import { ImageInput } from '../ImageInput/ImageInput.jsx'
import { ShapeSelector } from '../ShapeSelector/ShapeSelector.jsx'
import { TextInput } from '../TextInput/TextInput.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'

const initial = useProjectStore.getState()
beforeEach(() => {
  useProjectStore.setState(initial, true)
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{}])
})
afterEach(() => {
  cleanup()
  useProjectStore.setState(initial, true)
  vi.restoreAllMocks()
})

it('exposes four native pressed source choices without resetting inactive configurations', () => {
  useProjectStore.setState({ textContent: 'Remember me', shapeType: 'torus', shapeParams: { radius: 1.7 } })
  render(<InputSource />)
  const choices = within(screen.getByRole('group', { name: 'Source type' }))
  expect(choices.getAllByRole('button')).toHaveLength(4)
  for (const [name, key] of [
    ['Shapes', 'shape'],
    ['Text', 'text'],
    ['Image', 'image'],
    ['3D model', 'model']
  ]) {
    fireEvent.click(choices.getByRole('button', { name }))
    expect(useProjectStore.getState().inputType).toBe(key)
    expect(choices.getByRole('button', { name, pressed: true })).toBeDefined()
    expect(choices.getAllByRole('button', { pressed: true })).toHaveLength(1)
  }
  expect(useProjectStore.getState()).toMatchObject({
    textContent: 'Remember me',
    shapeType: 'torus',
    shapeParams: { radius: 1.7 }
  })
})

const shapes = [
  ['Cube', 'cube', [['Size', 'size', '0.1', '3', '0.1']]],
  [
    'Sphere',
    'sphere',
    [
      ['Radius', 'radius', '0.1', '3', '0.1'],
      ['Segments', 'widthSegments', '4', '64', '1']
    ]
  ],
  [
    'Torus',
    'torus',
    [
      ['Radius', 'radius', '0.1', '2', '0.1'],
      ['Tube', 'tube', '0.05', '1', '0.05']
    ]
  ],
  [
    'Cylinder',
    'cylinder',
    [
      ['Radius Top', 'radiusTop', '0', '2', '0.1'],
      ['Radius Bottom', 'radiusBottom', '0', '2', '0.1'],
      ['Height', 'height', '0.1', '4', '0.1']
    ]
  ],
  [
    'Cone',
    'cone',
    [
      ['Radius', 'radius', '0.1', '2', '0.1'],
      ['Height', 'height', '0.1', '4', '0.1']
    ]
  ],
  [
    'Icosahedron',
    'icosahedron',
    [
      ['Radius', 'radius', '0.1', '3', '0.1'],
      ['Detail', 'detail', '0', '4', '1']
    ]
  ],
  [
    'Torus Knot',
    'torusKnot',
    [
      ['Radius', 'radius', '0.1', '2', '0.1'],
      ['Tube', 'tube', '0.05', '0.5', '0.05']
    ]
  ],
  [
    'Plane',
    'plane',
    [
      ['Width', 'width', '0.1', '4', '0.1'],
      ['Height', 'height', '0.1', '4', '0.1']
    ]
  ]
]
it.each(shapes)('keeps %s geometry ranges, names and setters', (name, kind, params) => {
  const selectedShapeRef = createRef()
  render(<ShapeSelector selectedShapeRef={selectedShapeRef} />)
  expect(within(screen.getByRole('group', { name: 'Shape' })).getAllByRole('button')).toHaveLength(8)
  fireEvent.click(screen.getByRole('button', { name }))
  expect(useProjectStore.getState().shapeType).toBe(kind)
  expect(selectedShapeRef.current).toBe(screen.getByRole('button', { name, pressed: true }))
  expect(screen.getAllByRole('slider')).toHaveLength(params.length)
  for (const [label, key, min, max, step] of params) {
    const slider = screen.getByRole('slider', { name: label })
    expect([slider.min, slider.max, slider.step]).toEqual([min, max, step])
    fireEvent.change(slider, { target: { value: max } })
    expect(useProjectStore.getState().shapeParams[key]).toBe(Number(max))
  }
})

it('labels all text fields, preserves seven fonts and geometry, and scopes reset to text', () => {
  const textareaRef = createRef()
  useProjectStore.setState({ modelScale: 2.5 })
  render(<TextInput textareaRef={textareaRef} />)
  const text = screen.getByRole('textbox', { name: 'Text' })
  expect(text).toBe(textareaRef.current)
  expect(text.maxLength).toBe(200)
  expect(text.placeholder).toBe('BitmapForge')
  fireEvent.change(text, { target: { value: 'Hello' } })
  expect(useProjectStore.getState().textContent).toBe('Hello')
  const font = screen.getByRole('combobox', { name: 'Font' })
  expect(Array.from(font.options, (o) => o.value)).toEqual([
    'helvetiker',
    'helvetikerBold',
    'gentilisRegular',
    'gentilisBold',
    'optimer',
    'optimerBold',
    'droidMono'
  ])
  for (const option of font.options) {
    fireEvent.change(font, { target: { value: option.value } })
    expect(useProjectStore.getState().fontFamily).toBe(option.value)
  }
  for (const [name, key, min, max, step] of [
    ['Font Size', 'fontSize', '0.2', '2', '0.1'],
    ['Letter Spacing', 'letterSpacing', '-0.2', '1', '0.05'],
    ['Extrude Depth', 'extrudeDepth', '0.05', '1', '0.05']
  ]) {
    const slider = screen.getByRole('slider', { name })
    expect([slider.min, slider.max, slider.step]).toEqual([min, max, step])
    fireEvent.change(slider, { target: { value: max } })
    expect(useProjectStore.getState()[key]).toBe(Number(max))
  }
  const bevel = screen.getByRole('checkbox', { name: 'Bevel' })
  fireEvent.click(bevel)
  expect(useProjectStore.getState().bevelEnabled).toBe(bevel.checked)
  fireEvent.click(screen.getByRole('button', { name: 'Reset defaults' }))
  expect(useProjectStore.getState()).toMatchObject({
    textContent: initial.textContent,
    fontSize: initial.fontSize,
    letterSpacing: initial.letterSpacing,
    extrudeDepth: initial.extrudeDepth,
    bevelEnabled: initial.bevelEnabled,
    fontFamily: initial.fontFamily,
    modelScale: 2.5
  })
})

it.each(['model', 'image'])('retains %s scale and honest loaded metadata', (kind) => {
  const file = new File(['abcd'], 'a-very-long-original-filename.' + (kind === 'model' ? 'glb' : 'webp'))
  useProjectStore.setState({ inputType: kind, [kind === 'model' ? 'model' : 'imageSource']: file })
  render(<InputSource />)
  expect(screen.getByText(file.name).title).toBe(file.name)
  expect(screen.getByText('0.0 KB')).toBeDefined()
  const slider = screen.getByRole('slider', { name: kind === 'model' ? 'Model scale' : 'Image scale' })
  expect([slider.min, slider.max, slider.step]).toEqual(['0.1', '10', '0.05'])
  fireEvent.change(slider, { target: { value: '2.55' } })
  expect(useProjectStore.getState()[kind + 'Scale']).toBe(2.55)
  fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
  expect(useProjectStore.getState()[kind === 'model' ? 'model' : 'imageSource']).toBeNull()
})

function ParentProbe({ navigationRef, kind, result }) {
  useLayoutEffect(() => {
    result(navigationRef.current?.focusSource(kind))
  })
  return <InputSource navigationRef={navigationRef} />
}
ParentProbe.propTypes = { ...InputSource.propTypes, kind: sourceKind, result: requiredFunction }

it.each([
  ['model', 'button', 'Choose File'],
  ['image', 'button', 'Choose Image'],
  ['shape', 'button', 'Cube'],
  ['text', 'textbox', 'Text']
])(
  'publishes a committed %s native focus target before parent layout effects without activating files',
  (kind, role, name) => {
    useProjectStore.setState({ inputType: kind })
    const navigationRef = createRef()
    const result = vi.fn()
    const click = vi.spyOn(HTMLInputElement.prototype, 'click')
    const { unmount } = render(
      <StrictMode>
        <ParentProbe navigationRef={navigationRef} kind={kind} result={result} />
      </StrictMode>
    )
    expect(result).toHaveBeenLastCalledWith(true)
    expect(document.activeElement).toBe(screen.getByRole(role, { name }))
    expect(click).not.toHaveBeenCalled()
    for (const other of ['model', 'shape', 'text', 'image', 'shapes', '__proto__']) {
      if (other !== kind) expect(navigationRef.current.focusSource(other)).toBe(false)
    }
    const target = document.activeElement
    target.disabled = true
    expect(navigationRef.current.focusSource(kind)).toBe(false)
    target.disabled = false
    target.parentElement.setAttribute('hidden', '')
    expect(navigationRef.current.focusSource(kind)).toBe(false)
    target.parentElement.removeAttribute('hidden')
    target.parentElement.setAttribute('inert', '')
    expect(navigationRef.current.focusSource(kind)).toBe(false)
    target.parentElement.removeAttribute('inert')
    const replacement = { focusSource: () => false }
    navigationRef.current = replacement
    unmount()
    expect(navigationRef.current).toBe(replacement)
  }
)

it('tracks committed source/selected shape/loaded chooser replacements and clears its owned handle', () => {
  const navigationRef = createRef()
  const { unmount } = render(<InputSource navigationRef={navigationRef} />)
  act(() => useProjectStore.getState().setInputType('shape'))
  fireEvent.click(screen.getByRole('button', { name: 'Plane' }))
  expect(navigationRef.current.focusSource('shape')).toBe(true)
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Plane' }))
  act(() => useProjectStore.getState().setInputType('image'))
  act(() => useProjectStore.getState().setImageSource(new File(['test'], 'test.png')))
  expect(navigationRef.current.focusSource('image')).toBe(true)
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Replace' }))
  const stale = navigationRef.current
  unmount()
  expect(navigationRef.current).toBeNull()
  expect(stale.focusSource('image')).toBe(false)
})

it('directly validates every optional source ref under React 19', () => {
  for (const [Component, prop] of [
    [InputSource, 'navigationRef'],
    [ModelUploader, 'chooseButtonRef'],
    [ImageInput, 'chooseButtonRef'],
    [ShapeSelector, 'selectedShapeRef'],
    [TextInput, 'textareaRef']
  ]) {
    const validate = Component.propTypes[prop]
    for (const value of [undefined, null, { current: null }])
      expect(validate({ [prop]: value }, prop, Component.name)).toBeNull()
    for (const value of [false, 'ref', 42, { current: 42 }])
      expect(validate({ [prop]: value }, prop, Component.name)).toBeInstanceOf(Error)
    if (prop === 'navigationRef')
      expect(validate({ [prop]: { current: { focusSource() {} } } }, prop, Component.name)).toBeNull()
    else
      for (const value of [() => {}, { current: document.createElement('button') }])
        expect(validate({ [prop]: value }, prop, Component.name)).toBeNull()
  }
})

async function dropFiles(area, files) {
  await act(async () => {
    fireEvent.drop(area, {
      dataTransfer: {
        files,
        items: files.map((file) => ({ kind: 'file', type: file.type, getAsFile: () => file })),
        types: ['Files']
      }
    })
  })
}
it.each([
  ['model', ModelUploader, '3D model file drop area', 'model', 'model/gltf-binary', 'cube.glb'],
  ['image', ImageInput, 'Image file drop area', 'imageSource', 'image/webp', 'photo.webp']
])(
  'keeps real %s drop acceptance, replacement, rejection, single-file and noClick behavior',
  async (_kind, Component, name, key, type, filename) => {
    render(<Component compact />)
    const area = screen.getByLabelText(name)
    const input = area.querySelector('input[type=file]')
    expect(input.multiple).toBe(false)
    const click = vi.spyOn(input, 'click')
    fireEvent.click(area)
    expect(click).not.toHaveBeenCalled()
    const first = new File(['first'], filename, { type })
    await dropFiles(area, [first])
    expect(key === 'model' ? useProjectStore.getState().model.file : useProjectStore.getState()[key]).toBe(first)
    const next = new File(['next'], 'replacement.' + filename.split('.').pop(), { type })
    await dropFiles(screen.getByLabelText(name), [next])
    expect(key === 'model' ? useProjectStore.getState().model.file : useProjectStore.getState()[key]).toBe(next)
    await dropFiles(screen.getByLabelText(name), [new File(['bad'], 'bad.exe', { type: 'application/x-msdownload' })])
    expect(key === 'model' ? useProjectStore.getState().model.file : useProjectStore.getState()[key]).toBe(next)
    expect(useProjectStore.getState().status.error).toContain('Unsupported file type')
    await dropFiles(screen.getByLabelText(name), [first, next])
    expect(key === 'model' ? useProjectStore.getState().model.file : useProjectStore.getState()[key]).toBe(next)
  }
)

it('keeps the over-2MiB model warning, and image guidance names WebP without promising GIF playback', async () => {
  const { unmount } = render(<ModelUploader />)
  const large = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.glb', { type: 'model/gltf-binary' })
  await dropFiles(screen.getByLabelText('3D model file drop area'), [large])
  expect(useProjectStore.getState().status.message).toContain('large models may slow down rendering and exports')
  unmount()
  render(<ImageInput />)
  expect(screen.getByText(/PNG, JPG\/JPEG, GIF, WebP or SVG/)).toBeDefined()
  expect(screen.queryByText(/animated|playback/i)).toBeNull()
})
