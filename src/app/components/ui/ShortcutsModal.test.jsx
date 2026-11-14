import { afterEach, expect, it, vi } from 'vitest'
import { render, cleanup, waitFor, screen, fireEvent } from '@testing-library/react'
import { ShortcutsModal } from './ShortcutsModal.jsx'
afterEach(cleanup)
it('directly validates required controlled contracts', () => {
  for (const open of [true, false]) expect(ShortcutsModal.propTypes.open({ open }, 'open', 'ShortcutsModal')).toBeNull()
  for (const open of [undefined, null, 0, 'true', {}]) {
    const error = ShortcutsModal.propTypes.open({ open }, 'open', 'ShortcutsModal')
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('ShortcutsModal.open')
  }
  expect(ShortcutsModal.propTypes.onOpenChange({ onOpenChange: () => {} }, 'onOpenChange', 'ShortcutsModal')).toBeNull()
  for (const onOpenChange of [undefined, null, false, 1, 'callback', {}]) {
    const error = ShortcutsModal.propTypes.onOpenChange({ onOpenChange }, 'onOpenChange', 'ShortcutsModal')
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('ShortcutsModal.onOpenChange')
  }
})
it('preserves controlled closed/open and latest Close/Escape callbacks', () => {
  const first = vi.fn(),
    latest = vi.fn()
  const view = render(<ShortcutsModal open={false} onOpenChange={first} />)
  expect(screen.queryByRole('dialog')).toBeNull()
  view.rerender(<ShortcutsModal open onOpenChange={first} />)
  view.rerender(<ShortcutsModal open onOpenChange={latest} />)
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(latest).toHaveBeenLastCalledWith(false)
  latest.mockClear()
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
  expect(latest).toHaveBeenCalledWith(false)
  expect(first).not.toHaveBeenCalled()
})
it('forwards the real cancellable Radix close-autofocus event to the latest callback', async () => {
  const first = vi.fn()
  const target = document.createElement('button')
  document.body.appendChild(target)
  const latest = vi.fn((event) => {
    event.preventDefault()
    target.focus()
  })
  try {
    const view = render(<ShortcutsModal open onOpenChange={() => {}} onCloseAutoFocus={first} />)
    view.rerender(<ShortcutsModal open onOpenChange={() => {}} onCloseAutoFocus={latest} />)
    view.rerender(<ShortcutsModal open={false} onOpenChange={() => {}} onCloseAutoFocus={latest} />)
    await waitFor(() => expect(latest).toHaveBeenCalledOnce())
    expect(first).not.toHaveBeenCalled()
    const event = latest.mock.calls[0][0]
    expect(event.type).toBe('focusScope.autoFocusOnUnmount')
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(target)
  } finally {
    target.remove()
  }
})
