import { it, expect, vi, afterEach } from 'vitest'
import { render, cleanup, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary.jsx'
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('directly validates the supported node contract under React 19', () => {
  const validate = ErrorBoundary.propTypes.children
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
    expect(validate({ children: value }, 'children', 'ErrorBoundary')).toBeNull()
  }
  for (const value of [{}, () => {}, Symbol('bad'), ['ok', [{}]]]) {
    const error = validate({ children: value }, 'children', 'ErrorBoundary')
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('ErrorBoundary.children')
  }
})

it('renders empty and valid children and recovers with Try again', () => {
  const view = render(<ErrorBoundary />)
  expect(view.container.textContent).toBe('')
  view.rerender(<ErrorBoundary>content</ErrorBoundary>)
  expect(screen.getByText('content')).toBeDefined()
  let broken = true
  function Recoverable() {
    if (broken) throw new Error('expected boundary failure')
    return <p>recovered</p>
  }
  const logging = vi.spyOn(console, 'error').mockImplementation(() => {})
  view.rerender(
    <ErrorBoundary>
      <Recoverable />
    </ErrorBoundary>
  )
  expect(screen.getByText('Something went wrong')).toBeDefined()
  expect(screen.getByText('expected boundary failure')).toBeDefined()
  expect(logging).toHaveBeenCalledOnce()
  expect(logging.mock.calls.some((args) => args.some((arg) => String(arg).includes('expected boundary failure')))).toBe(
    true
  )
  logging.mockRestore()
  broken = false
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(screen.getByText('recovered')).toBeDefined()
})
