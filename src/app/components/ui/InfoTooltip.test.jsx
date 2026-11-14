import { it, expect, vi, afterEach } from 'vitest'
import { render, cleanup, screen, fireEvent, act } from '@testing-library/react'
import { InfoTooltip } from './InfoTooltip.jsx'
import * as Tooltip from '@radix-ui/react-tooltip'
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('directly validates the supported node contract under React 19', () => {
  const validate = InfoTooltip.propTypes.content
  expect(typeof validate).toBe('function')
  for (const value of [
    undefined,
    null,
    false,
    true,
    '',
    'text',
    2,
    3n,
    <span key="s" />,
    <>fragment</>,
    ['a', [null, <b key="b" />]]
  ]) {
    expect(validate({ content: value }, 'content', 'InfoTooltip')).toBeNull()
  }
  for (const value of [{}, () => {}, Symbol('bad'), ['ok', [{}]]]) {
    const error = validate({ content: value }, 'content', 'InfoTooltip')
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('InfoTooltip.content')
  }
})

it.each(['plain tooltip', <>fragment tooltip</>, <b key="b">element tooltip</b>])(
  'preserves labels and keyboard-focus content %#',
  async (content) => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    )
    render(
      <Tooltip.Provider delayDuration={0}>
        <InfoTooltip content={content} />
      </Tooltip.Provider>
    )
    const trigger = screen.getByLabelText(typeof content === 'string' ? content : 'More info')
    act(() => {
      trigger.focus()
      fireEvent.focus(trigger)
    })
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip.textContent).toContain(typeof content === 'string' ? content : content.props.children)
  }
)
