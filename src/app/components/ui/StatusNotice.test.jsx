import { describe, it, expect, afterEach, vi } from 'vitest'
import { StrictMode, useLayoutEffect, startTransition } from 'react'
import { flushSync } from 'react-dom'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { StatusNotice } from './StatusNotice.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
const status = (message, error = '') =>
  useProjectStore.setState({ status: { message, error, loading: false, exporting: false } })
async function flush() {
  await act(async () => {})
}

describe('postcommit external subscription', () => {
  it('does not apply a delivered but uncommitted obsolete React update after suspension', async () => {
    status('committed')
    const view = render(<StatusNotice />)
    await flush()
    const jobs = []
    vi.stubGlobal('queueMicrotask', (job) => jobs.push(job))
    act(() => status('obsolete pending'))
    act(() => {
      startTransition(() => {
        for (const job of jobs.splice(0)) job()
      })
      flushSync(() => view.rerender(<StatusNotice suspended />))
    })
    await flush()
    expect(screen.getByRole('status').textContent).toBe('committed')
  })
  it('first commits empty with preloaded status and catches a pre-subscription change', async () => {
    status('preloaded')
    let committed
    function BeforeSubscription() {
      useLayoutEffect(() => {
        committed = document.querySelector('[role="status"]').textContent
        status('between commit and subscription')
      }, [])
      return null
    }
    render(
      <>
        <BeforeSubscription />
        <StatusNotice />
      </>
    )
    expect(committed).toBe('')
    expect(screen.getByRole('status').textContent).toBe('')
    await flush()
    expect(screen.getByRole('status').textContent).toBe('between commit and subscription')
  })
  it('coalesces latest state and does not mutate equal presentation or unrelated settings', async () => {
    status('stable')
    render(<StatusNotice />)
    await flush()
    const node = screen.getByRole('status')
    const mutations = []
    const observer = new MutationObserver((records) => mutations.push(...records))
    observer.observe(node, { childList: true, characterData: true, subtree: true, attributes: true })
    act(() => {
      status('stable')
      useProjectStore.setState({ pixelSize: 7 })
    })
    await flush()
    expect(mutations).toHaveLength(0)
    act(() => {
      status('intermediate', 'obsolete error')
      status('latest')
    })
    await flush()
    expect(node.textContent).toBe('latest')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(mutations).toHaveLength(1)
    observer.disconnect()
  })
  it('freezes both visible fields across queued updates and resumes latest only', async () => {
    status('old message', 'old error')
    const view = render(<StatusNotice />)
    await flush()
    const jobs = []
    vi.stubGlobal('queueMicrotask', (job) => jobs.push(job))
    act(() => status('queued message', 'queued error'))
    view.rerender(<StatusNotice suspended />)
    act(() => {
      for (const job of jobs.splice(0)) job()
    })
    expect(screen.getByRole('alert').textContent).toContain('old error')
    expect(screen.getByRole('status').textContent).toBe('')
    act(() => {
      status('hidden one')
      status('hidden two', 'hidden error')
      status('final')
    })
    view.rerender(<StatusNotice />)
    expect(screen.getByRole('alert').textContent).toContain('old error')
    act(() => {
      for (const job of jobs.splice(0)) job()
    })
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('status').textContent).toBe('final')
  })
  it.each(['suspend', 'unmount'])('invalidates initial and resume jobs before %s', (ending) => {
    const jobs = []
    vi.stubGlobal('queueMicrotask', (job) => jobs.push(job))
    status('preloaded')
    const view = render(<StatusNotice />)
    view.rerender(<StatusNotice suspended />)
    act(() => {
      for (const job of jobs.splice(0)) job()
    })
    expect(screen.getByRole('status').textContent).toBe('')
    status('latest')
    view.rerender(<StatusNotice />)
    if (ending === 'suspend') view.rerender(<StatusNotice suspended />)
    else view.unmount()
    act(() => {
      for (const job of jobs.splice(0)) job()
    })
    if (ending === 'suspend') expect(screen.getByRole('status').textContent).toBe('')
    else expect(screen.queryByRole('status')).toBeNull()
  })
  it('isolates two StrictMode instances and unsubscribes discarded and unmounted lifetimes', async () => {
    const unsubscribe = []
    const subscribe = useProjectStore.subscribe
    vi.spyOn(useProjectStore, 'subscribe').mockImplementation((...args) => {
      const stop = vi.fn(subscribe(...args))
      unsubscribe.push(stop)
      return stop
    })
    status('initial')
    const first = render(
      <StrictMode>
        <StatusNotice />
      </StrictMode>
    )
    const second = render(
      <StrictMode>
        <StatusNotice />
      </StrictMode>
    )
    expect(unsubscribe).toHaveLength(4)
    expect(unsubscribe[0]).toHaveBeenCalledOnce()
    expect(unsubscribe[2]).toHaveBeenCalledOnce()
    await flush()
    expect(first.getAllByRole('status').map((n) => n.textContent)).toEqual(['initial', 'initial'])
    first.unmount()
    expect(unsubscribe[1]).toHaveBeenCalledOnce()
    act(() => status('remaining'))
    await flush()
    expect(screen.getByRole('status').textContent).toBe('remaining')
    second.unmount()
    expect(unsubscribe[3]).toHaveBeenCalledOnce()
  })
})
describe('one status presentation', () => {
  it('prioritizes error and dismisses obsolete text without touching valid source', async () => {
    const model = { name: 'valid' }
    useProjectStore.setState({
      model,
      status: { error: 'failed', message: 'old success', exporting: true, loading: true }
    })
    render(<StatusNotice />)
    await act(async () => {})
    expect(screen.getByRole('alert').textContent).toContain('failed')
    expect(screen.getByRole('status').textContent).toBe('')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss error' }))
    await act(async () => {})
    expect(useProjectStore.getState().status.message).toBe('')
    expect(useProjectStore.getState().model).toBe(model)
    expect(screen.getByRole('status').textContent).toBe('Exporting…')
  })
  it.each([
    ['Encoding APNG 42%', true, false, 'Encoding APNG 42%'],
    ['Encoding GIF…', true, false, 'Encoding GIF…'],
    ['Capturing frames 0%', true, false, 'Capturing frames 0%'],
    ['Generating sprite sheet 100%', true, false, 'Generating sprite sheet 100%'],
    ['Building CSS animation 17%', true, false, 'Building CSS animation 17%'],
    ['Generating code ZIP…', true, false, 'Generating code ZIP…'],
    ['Building React component…', true, false, 'Building React component…'],
    ['Building Web Component…', true, false, 'Building Web Component…'],
    ['Building Embed ZIP…', true, false, 'Building Embed ZIP…'],
    ['Project saved as .bitmapforge file.', true, false, 'Exporting…'],
    ['Model loaded.', false, true, 'Loading model…'],
    ['', false, true, 'Loading model…'],
    ['Encoding APNG 42%', true, true, 'Exporting…'],
    ['Model loaded.', true, true, 'Exporting…'],
    ['Encoding APNG 101%', true, false, 'Exporting…'],
    ['Encoding APNG NaN%', true, false, 'Exporting…'],
    ['Encoding APNG 42% old success', true, false, 'Exporting…'],
    ['APNG exported.', true, false, 'Exporting…']
  ])('presents bounded busy status %s (export=%s, load=%s)', async (message, exporting, loading, expected) => {
    useProjectStore.setState({ status: { error: '', message, exporting, loading } })
    render(<StatusNotice />)
    await act(async () => {})
    expect(screen.getByRole('status').textContent).toBe(expected)
    expect(screen.queryByRole('alert')).toBeNull()
  })
  it('error takes precedence over actual progress and overlap', async () => {
    useProjectStore.setState({
      status: { error: 'Encoder failed', message: 'Encoding APNG 42%', exporting: true, loading: true }
    })
    render(<StatusNotice />)
    await act(async () => {})
    expect(screen.getByRole('alert').textContent).toContain('Encoder failed')
    expect(screen.getByRole('status').textContent).toBe('')
  })
  it('defers latest update while help is open and then presents it', async () => {
    useProjectStore.setState({ status: { error: '', message: '', exporting: false, loading: false } })
    const view = render(<StatusNotice suspended />)
    act(() => useProjectStore.getState().setStatus({ message: 'latest completion' }))
    expect(screen.getByRole('status').textContent).toBe('')
    view.rerender(<StatusNotice />)
    await act(async () => {})
    expect(screen.getByRole('status').textContent).toBe('latest completion')
  })
})
