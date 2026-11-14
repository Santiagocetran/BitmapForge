import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { render as renderComponent, cleanup, fireEvent, screen, act } from '@testing-library/react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useProjectStore } from '../../store/useProjectStore.js'
import { pluginRegistry } from '../../../engine/plugins/PluginRegistry.js'
import { registerBuiltins } from '../../../engine/plugins/builtinPlugins.js'
import { QualitySettings } from './QualitySettings.jsx'
function render(node) {
  return renderComponent(node, { wrapper: Tooltip.Provider })
}
afterEach(cleanup)
describe('QualitySettings nullish disclosure contract', () => {
  it.each([undefined, null])('uses local disclosure when controlled props are %s', (value) => {
    const view = render(<QualitySettings advancedOpen={value} onAdvancedOpenChange={value} />)
    const details = view.container.querySelector('details')
    expect(details.open).toBe(false)
    details.open = true
    fireEvent(details, new Event('toggle'))
    expect(details.querySelector('summary').getAttribute('aria-expanded')).toBe('true')
  })
  it('forwards actual toggle to the current callback while keeping controlled state', () => {
    const first = vi.fn()
    const latest = vi.fn()
    const view = render(<QualitySettings advancedOpen={false} onAdvancedOpenChange={first} />)
    view.rerender(<QualitySettings advancedOpen={false} onAdvancedOpenChange={latest} />)
    const details = view.container.querySelector('details')
    details.open = true
    fireEvent(details, new Event('toggle'))
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledWith(true)
    expect(details.querySelector('summary').getAttribute('aria-expanded')).toBe('false')
  })
})

registerBuiltins()
beforeEach(() => useProjectStore.getState().resetToDefaults())

function range(name, min, max, step, value, key) {
  const field = screen.getByLabelText(name)
  expect(field.type).toBe('range')
  expect([field.min, field.max, field.step || '1']).toEqual([min, max, step])
  fireEvent.change(field, { target: { value } })
  expect(useProjectStore.getState()[key]).toBe(Number(value))
}

describe('QualitySettings finite presenters and complete controls', () => {
  it('composes renderer and refinements once without duplicate IDs or disclosures', () => {
    const view = render(
      <>
        <QualitySettings part="renderer" />
        <QualitySettings part="refinements" advancedOpen postEffectsOpen />
      </>
    )
    expect(screen.getAllByRole('combobox', { name: 'Render mode' })).toHaveLength(1)
    expect(view.container.querySelectorAll('details')).toHaveLength(2)
    const ids = [...view.container.querySelectorAll('[id]')].map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(screen.getAllByRole('checkbox', { name: 'Invert Brightness' })).toHaveLength(1)
  })
  it('renderer has no refinements and default all remains compatible', () => {
    const view = render(<QualitySettings part="renderer" />)
    expect(view.container.querySelector('details')).toBeNull()
    expect(screen.getByRole('combobox', { name: 'Dither Type' }).closest('details')).toBeNull()
    view.rerender(<QualitySettings />)
    expect(view.container.querySelectorAll('details')).toHaveLength(2)
    expect(screen.getByRole('combobox', { name: 'Render mode' })).toBeDefined()
  })
  it('uses the registry labels/IDs rather than a replacement mode inventory', () => {
    render(<QualitySettings part="renderer" />)
    const select = screen.getByRole('combobox', { name: 'Render mode' })
    expect([...select.options].map((o) => [o.value, o.textContent])).toEqual(
      pluginRegistry.listRenderers().map(({ id, label }) => [id, label])
    )
    expect(select.options).toHaveLength(6)
  })
  it.each([
    ['bitmap', /Pixel Size:/, '1', '20'],
    ['pixelArt', /Pixel Size:/, '1', '20'],
    ['ascii', /Character Size:/, '8', '32'],
    ['halftone', /Dot Spacing:/, '4', '20'],
    ['ledMatrix', /LED Spacing:/, '4', '20'],
    ['stipple', /Cell Size:/, '4', '20']
  ])('retains %s size units, UI bounds, store setters and hidden details', (mode, name, min, max) => {
    render(<QualitySettings part="renderer" />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Render mode' }), { target: { value: mode } })
    expect(useProjectStore.getState().renderMode).toBe(mode)
    range(name, min, max, '1', '15', 'pixelSize')
    expect(Boolean(screen.queryByRole('combobox', { name: 'Dither Type' }))).toBe(mode === 'bitmap')
  })
  it('does not normalize loaded pixel size merely by mounting a smaller UI range', () => {
    useProjectStore.setState({ pixelSize: 30, renderMode: 'bitmap' })
    render(<QualitySettings part="renderer" />)
    expect(useProjectStore.getState().pixelSize).toBe(30)
    expect(screen.getByText('Pixel Size: 30')).toBeDefined()
  })
  it('retains all five dithers and existing ASCII ramp/colored settings', () => {
    render(<QualitySettings part="renderer" />)
    const dither = screen.getByRole('combobox', { name: 'Dither Type' })
    expect([...dither.options].map((o) => o.value)).toEqual([
      'bayer4x4',
      'bayer8x8',
      'variableDot',
      'floydSteinberg',
      'atkinson'
    ])
    for (const option of dither.options) {
      fireEvent.change(dither, { target: { value: option.value } })
      expect(useProjectStore.getState().ditherType).toBe(option.value)
    }
    fireEvent.change(screen.getByRole('combobox', { name: 'Render mode' }), { target: { value: 'ascii' } })
    const ramp = screen.getByRole('combobox', { name: 'Character Ramp' })
    expect([...ramp.options].map((o) => o.value)).toEqual(['classic', 'blocks', 'dense', 'minimal'])
    fireEvent.change(ramp, { target: { value: 'blocks' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Colored Mode' }))
    expect(useProjectStore.getState()).toMatchObject({ charRamp: 'blocks', asciiColored: true, pixelSize: 10 })
  })
  it('keeps halftone, LED and stipple fields and values across mode switches', () => {
    render(<QualitySettings part="renderer" />)
    const mode = screen.getByRole('combobox', { name: 'Render mode' })
    fireEvent.change(mode, { target: { value: 'halftone' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Dot Shape' }), { target: { value: 'diamond' } })
    range(/Screen Angle:/, '0', '179', '1', '135', 'halftoneAngle')
    fireEvent.change(mode, { target: { value: 'ledMatrix' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'LED Shape' }), { target: { value: 'roundRect' } })
    range(/LED Gap:/, '0', '4', '1', '3', 'ledGap')
    fireEvent.change(mode, { target: { value: 'stipple' } })
    range(/Dot Size:/, '1', '6', '1', '5', 'stippleDotSize')
    range(/Dot Density:/, '1', '5', '1', '4', 'stippleDensity')
    expect(useProjectStore.getState()).toMatchObject({
      halftoneDotShape: 'diamond',
      halftoneAngle: 135,
      ledShape: 'roundRect',
      ledGap: 3
    })
  })
  it('keeps tone, background alpha and fade seed actions with explicit names', () => {
    render(<QualitySettings part="refinements" advancedOpen />)
    expect(screen.queryByRole('combobox', { name: 'Render mode' })).toBeNull()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Invert Brightness' }))
    range(/Min Brightness:/, '0.01', '0.5', '0.01', '0.23', 'minBrightness')
    fireEvent.click(screen.getByRole('button', { name: 'Transparent' }))
    expect(screen.getByRole('button', { name: 'Transparent' }).getAttribute('aria-pressed')).toBe('true')
    expect(useProjectStore.getState().backgroundColor).toBe('transparent')
    fireEvent.change(screen.getByLabelText('Background color'), { target: { value: '#123456' } })
    expect(useProjectStore.getState()).toMatchObject({ backgroundColor: '#123456', invert: true })
    fireEvent.click(screen.getByRole('button', { name: 'Generate new random seed' }))
    expect(Number.isInteger(useProjectStore.getState().seed)).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Reset seed to auto' }))
    expect(useProjectStore.getState().seed).toBeNull()
    expect(screen.getByText('Used by fade animation')).toBeDefined()
  })
  it('retains all texture controls, bounds and values when disabled/re-enabled', () => {
    render(<QualitySettings part="refinements" postEffectsOpen />)
    for (const label of ['CRT Effect', 'Noise / Grain', 'Color Shift']) fireEvent.click(screen.getByLabelText(label))
    range(/Scanline Gap:/, '2', '8', '1', '6', 'scanlineGap')
    range(/Scanline Opacity:/, '0.1', '0.8', '0.05', '0.65', 'scanlineOpacity')
    range(/Chromatic Aberration:/, '0', '5', '1', '4', 'chromaticAberration')
    range(/Vignette:/, '0', '1', '0.05', '0.75', 'crtVignette')
    range(/Amount:/, '0', '0.5', '0.01', '0.24', 'noiseAmount')
    range(/Hue:/, '0', '360', '1', '250', 'colorShiftHue')
    range(/Saturation:/, '0', '2', '0.01', '1.43', 'colorShiftSaturation')
    const mono = screen.getByLabelText('Monochrome')
    const previous = mono.checked
    fireEvent.click(mono)
    expect(useProjectStore.getState().noiseMonochrome).toBe(!previous)
    for (const label of ['CRT Effect', 'Noise / Grain', 'Color Shift']) {
      fireEvent.click(screen.getByLabelText(label))
      fireEvent.click(screen.getByLabelText(label))
    }
    expect(useProjectStore.getState()).toMatchObject({ scanlineGap: 6, noiseAmount: 0.24, colorShiftHue: 250 })
  })
  it.each([undefined, null])('uses independent local Texture effects state for %s', (value) => {
    const view = render(<QualitySettings postEffectsOpen={value} onPostEffectsOpenChange={value} />)
    const [tone, texture] = view.container.querySelectorAll('details')
    expect(texture.open).toBe(false)
    texture.open = true
    fireEvent(texture, new Event('toggle'))
    expect(texture.querySelector('summary').getAttribute('aria-expanded')).toBe('true')
    expect(tone.open).toBe(false)
  })
  it('uses current Texture callback and preserves controlled opens across mode/remount', () => {
    const first = vi.fn(),
      latest = vi.fn()
    const view = render(<QualitySettings postEffectsOpen={false} onPostEffectsOpenChange={first} />)
    view.rerender(<QualitySettings advancedOpen postEffectsOpen={false} onPostEffectsOpenChange={latest} />)
    const texture = view.container.querySelectorAll('details')[1]
    texture.open = true
    fireEvent(texture, new Event('toggle'))
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledWith(true)
    expect(texture.querySelector('summary').getAttribute('aria-expanded')).toBe('false')
    view.rerender(<QualitySettings advancedOpen postEffectsOpen />)
    act(() => useProjectStore.getState().setRenderMode('ascii'))
    expect([...view.container.querySelectorAll('summary')].map((n) => n.getAttribute('aria-expanded'))).toEqual([
      'true',
      'true'
    ])
    view.unmount()
    const remount = render(<QualitySettings part="refinements" advancedOpen postEffectsOpen />)
    expect([...remount.container.querySelectorAll('details')].every((n) => n.open)).toBe(true)
  })
})
