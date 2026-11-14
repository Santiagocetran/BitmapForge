import { afterEach, describe, expect, it, vi } from 'vitest'
import { render as renderComponent, cleanup, fireEvent } from '@testing-library/react'
import * as Tooltip from '@radix-ui/react-tooltip'
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
