import { useState } from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ExportPanel } from './ExportPanel.jsx'
import { optionalFunction } from '../../utils/uiPropValidators.js'
afterEach(cleanup)
const formats = [
  ['APNG', 'apng'],
  ['GIF', 'gif'],
  ['Video', 'webm'],
  ['Sprite Sheet', 'spritesheet'],
  ['CSS Anim', 'css'],
  ['React', 'react'],
  ['Web Component', 'webcomponent'],
  ['Embed', 'embed'],
  ['Code ZIP', 'zip']
]
function Fixture({ route = () => {}, ...props }) {
  const [selectedFormat, onSelectFormat] = useState('apng')
  return (
    <ExportPanel
      selectedFormat={selectedFormat}
      onSelectFormat={onSelectFormat}
      exportSelected={() => route(selectedFormat)}
      {...props}
    />
  )
}
Fixture.propTypes = { route: optionalFunction }
describe('controlled ExportPanel', () => {
  it('has nine native pressed controls and stable description association', () => {
    render(<Fixture />)
    expect(screen.getByRole('group', { name: 'Export format' })).toBeDefined()
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(8)
    const selected = screen.getByRole('button', { pressed: true })
    expect(selected.textContent).toContain('APNG')
    expect(document.getElementById(selected.getAttribute('aria-describedby')).textContent).toContain('Animated PNG')
    fireEvent.click(selected)
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1)
  })
  it.each(formats)('routes %s through the selected identifier', (label, id) => {
    const route = vi.fn()
    render(<Fixture route={route} />)
    fireEvent.click(screen.getByRole('button', { name: label }))
    expect(screen.getByRole('button', { name: label }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: `Export ${label}` }))
    expect(route).toHaveBeenCalledWith(id)
  })
  it('uses stable busy label and supports cancel without another status presenter', () => {
    const cancelExport = vi.fn()
    render(<Fixture exporting cancelExport={cancelExport} />)
    expect(screen.getByRole('button', { name: 'Exporting…' }).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel export' }))
    expect(cancelExport).toHaveBeenCalledOnce()
    expect(screen.queryByRole('status')).toBeNull()
  })
  it('honors and associates the disabled reason without project controls', () => {
    render(<Fixture disabledReason="Image input cannot be embedded" />)
    const action = screen.getByRole('button', { name: 'Export APNG' })
    expect(action.disabled).toBe(true)
    expect(document.getElementById(action.getAttribute('aria-describedby')).textContent).toBe(
      'Image input cannot be embedded'
    )
    expect(screen.queryByRole('button', { name: 'Load .bitmapforge' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Save .bitmapforge' })).toBeNull()
    expect(document.querySelector('input[type="file"]')).toBeNull()
  })
  it('keeps all nine formats under three purpose headings in one choice group', () => {
    render(<Fixture />)
    expect(screen.getAllByRole('group')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)).toEqual([
      'Animation & assets',
      'Website integration',
      'Developer source'
    ])
    expect(screen.getAllByRole('button').filter((el) => el.hasAttribute('aria-pressed'))).toHaveLength(9)
  })
})
