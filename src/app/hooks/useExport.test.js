import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExport, isExportProgressMessage } from './useExport.js'
import { useProjectStore } from '../store/useProjectStore.js'

// ─── Mock all builder utilities ───────────────────────────────────────────────

vi.mock('../utils/framesProvider.js', () => ({
  captureFrames: vi.fn(async () =>
    Array.from({ length: 4 }, () => ({ width: 8, height: 8, data: new Uint8ClampedArray(256) }))
  ),
  getFrameCount: vi.fn(() => 4)
}))

vi.mock('../utils/apngExport.js', () => ({
  buildApng: vi.fn(async () => new Blob(['apng'], { type: 'image/png' }))
}))

vi.mock('mp4-muxer', () => ({
  Muxer: vi.fn().mockImplementation(function () {
    this.addVideoChunk = vi.fn()
    this.finalize = vi.fn()
  }),
  ArrayBufferTarget: vi.fn().mockImplementation(function () {
    this.buffer = new ArrayBuffer(0)
  })
}))

vi.mock('../utils/codeExport.js', () => ({
  buildCodeZip: vi.fn(async () => new Blob(['zip']))
}))

vi.mock('../utils/reactComponentExport.js', () => ({
  buildReactComponent: vi.fn(async () => new Blob(['zip']))
}))

vi.mock('../utils/webComponentExport.js', () => ({
  buildWebComponent: vi.fn(async () => new Blob(['zip']))
}))

vi.mock('../utils/cssExport.js', () => ({
  buildCssAnimation: vi.fn(async () => new Blob(['zip']))
}))

vi.mock('../utils/projectFile.js', () => ({
  saveProjectFile: vi.fn(async () => {})
}))

// gif.js: provide a fake GIF class that fires 'finished' immediately on render()
vi.mock('gif.js', () => ({
  default: class GIF {
    constructor() {
      this._handlers = {}
    }
    on(event, fn) {
      this._handlers[event] = fn
    }
    addFrame() {}
    render() {
      setTimeout(() => this._handlers.finished?.(new Blob(['GIF89a'])), 0)
    }
  }
}))

// gif.js ?url worker: just needs to be a non-empty string
vi.mock('gif.js/dist/gif.worker.js?url', () => ({ default: 'blob:mock-gif-worker' }))

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeMockSceneManagerRef({ withCanvas = true } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 8
  return {
    current: withCanvas
      ? {
          getCanvas: () => canvas,
          getLoopDurationMs: () => 1000,
          renderAtTime: vi.fn(),
          pauseLoop: vi.fn(),
          resumeLoop: vi.fn(),
          setOnFrameRendered: vi.fn(),
          clearOnFrameRendered: vi.fn(),
          resetToLoopStart: vi.fn()
        }
      : null
  }
}

function getStatus() {
  return useProjectStore.getState().status
}

beforeEach(() => {
  useProjectStore.getState().setStatus({ exporting: false, message: '', error: '' })
  vi.clearAllMocks()
})

// ─── exportAs('apng') ─────────────────────────────────────────────────────────

describe('useExport — exportAs(apng)', () => {
  it('emits recognized current APNG percentage progress, never save completion', async () => {
    const { captureFrames } = await import('../utils/framesProvider.js')
    let progress
    captureFrames.mockImplementationOnce(async (_, __, { onProgress }) => {
      onProgress(42, 100)
      progress = getStatus().message
      return []
    })
    const download = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    try {
      const { result } = renderHook(() => useExport(makeMockSceneManagerRef()))
      await act(async () => result.current.exportAs('apng'))
      expect(progress).toBe('Encoding APNG 42%')
      expect(isExportProgressMessage(progress)).toBe(true)
      expect(isExportProgressMessage(getStatus().message)).toBe(false)
      await act(async () => result.current.saveProject())
      expect(isExportProgressMessage(getStatus().message)).toBe(false)
    } finally {
      download.mockRestore()
    }
  })
  it('sets exporting=false on success', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('apng')
    })
    expect(getStatus().exporting).toBe(false)
    expect(getStatus().error).toBeFalsy()
  })

  it('sets error on builder failure', async () => {
    const { buildApng } = await import('../utils/apngExport.js')
    buildApng.mockImplementationOnce(async () => {
      throw new Error('encode error')
    })
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('apng')
    })
    expect(getStatus().exporting).toBe(false)
    expect(getStatus().error).toContain('encode error')
  })

  it('does nothing when sceneManagerRef.current is null', async () => {
    const ref = makeMockSceneManagerRef({ withCanvas: false })
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('apng')
    })
    // Should not update status at all since it returns early
    expect(getStatus().exporting).toBe(false)
  })
})

// ─── exportAs('zip') ──────────────────────────────────────────────────────────

describe('useExport — exportAs(zip)', () => {
  it('sets exporting=false on success', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('zip')
    })
    expect(getStatus().exporting).toBe(false)
    expect(getStatus().error).toBeFalsy()
  })

  it('sets error on builder failure', async () => {
    const { buildCodeZip } = await import('../utils/codeExport.js')
    buildCodeZip.mockImplementationOnce(async () => {
      throw new Error('zip failed')
    })
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('zip')
    })
    expect(getStatus().error).toContain('zip failed')
  })
})

// ─── exportAs('react') ────────────────────────────────────────────────────────

describe('useExport — exportAs(react)', () => {
  it('sets exporting=false on success', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('react')
    })
    expect(getStatus().exporting).toBe(false)
    expect(getStatus().error).toBeFalsy()
  })
})

// ─── exportAs('webm') — legacy fallback (MediaRecorder not available in jsdom)

describe('useExport — exportAs(webm) legacy fallback', () => {
  it('returns early when no manager is available', async () => {
    const ref = makeMockSceneManagerRef({ withCanvas: false })
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('webm')
    })
    // Returns early (no manager), so status is unchanged
    expect(getStatus().exporting).toBe(false)
  })

  it('falls back to legacy and sets error when MediaRecorder is unavailable', async () => {
    // VideoEncoder not defined in jsdom → falls back to legacy → MediaRecorder also fails
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('webm')
    })
    expect(getStatus().exporting).toBe(false)
    expect(typeof getStatus().error).toBe('string')
  })
})

// ─── exportAs('webm') — WebCodecs path ───────────────────────────────────────

describe('useExport — exportAs(webm) WebCodecs', () => {
  let MockVideoEncoder, MockVideoFrame, mockEncode

  beforeEach(() => {
    mockEncode = vi.fn()

    MockVideoEncoder = vi.fn().mockImplementation(function ({ output }) {
      this._output = output
      this.configure = vi.fn()
      this.encode = mockEncode
      this.flush = vi.fn(async () => {})
    })

    MockVideoFrame = vi.fn().mockImplementation(function () {
      this.close = vi.fn()
    })

    vi.stubGlobal('VideoEncoder', MockVideoEncoder)
    vi.stubGlobal('VideoFrame', MockVideoFrame)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sets exporting=false on success', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('webm')
    })
    expect(getStatus().exporting).toBe(false)
    expect(getStatus().error).toBeFalsy()
  })

  it('encodes getFrameCount() frames', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('webm')
    })
    // getFrameCount mock returns 4
    expect(mockEncode).toHaveBeenCalledTimes(4)
  })

  it('stamps frames with correct microsecond timestamps', async () => {
    const fps = 30
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('webm', { fps })
    })
    // Frame 0: timestamp=0, Frame 1: timestamp=Math.round(1/30 * 1_000_000)
    expect(MockVideoFrame.mock.calls[0][1].timestamp).toBe(0)
    expect(MockVideoFrame.mock.calls[1][1].timestamp).toBe(Math.round((1 / fps) * 1_000_000))
  })

  it('closes each VideoFrame after encoding', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportAs('webm')
    })
    for (const instance of MockVideoFrame.mock.instances) {
      expect(instance.close).toHaveBeenCalledOnce()
    }
  })
})

// ─── cancelExport ─────────────────────────────────────────────────────────────

describe('useExport — cancelExport', () => {
  it('sets exporting=false', () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    act(() => {
      result.current.cancelExport()
    })
    expect(getStatus().exporting).toBe(false)
  })

  it('sets message containing "cancelled"', () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    act(() => {
      result.current.cancelExport()
    })
    expect(getStatus().message.toLowerCase()).toContain('cancel')
  })
})

describe('useExport lifetime and stale status', () => {
  it('invalidates nonabortable completion and progress on owner disposal', async () => {
    const { buildCodeZip } = await import('../utils/codeExport.js')
    let resolve
    buildCodeZip.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r
        })
    )
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const { result, unmount } = renderHook(() => useExport(makeMockSceneManagerRef()))
    let pending
    act(() => {
      pending = result.current.exportAs('zip')
    })
    await vi.waitFor(() => expect(resolve).toBeDefined())
    unmount()
    expect(getStatus()).toMatchObject({ exporting: false, message: '' })
    const snapshot = getStatus()
    await act(async () => {
      resolve(new Blob(['late']))
      await pending
    })
    expect(click).not.toHaveBeenCalled()
    expect(getStatus()).toBe(snapshot)
    click.mockRestore()
  })
  it('ignores late capture progress after cancellation, disposal and a new generation', async () => {
    const { captureFrames } = await import('../utils/framesProvider.js')
    const requests = []
    captureFrames.mockImplementationOnce(
      (_manager, _count, options) => new Promise((resolve) => requests.push({ ...options, resolve }))
    )
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const { result, unmount } = renderHook(() => useExport(makeMockSceneManagerRef()))
    let pending
    act(() => {
      pending = result.current.exportAs('apng')
    })
    await vi.waitFor(() => expect(requests).toHaveLength(1))
    act(() => requests[0].onProgress(1, 4))
    expect(getStatus().message).toContain('25%')
    act(() => result.current.cancelExport())
    expect(requests[0].signal.aborted).toBe(true)
    const cancelled = getStatus()
    act(() => requests[0].onProgress(3, 4))
    expect(getStatus()).toBe(cancelled)
    await act(async () => {
      await result.current.exportAs('zip')
      requests[0].onProgress(4, 4)
      requests[0].resolve([])
      await pending
    })
    expect(getStatus().message).toBe('Code ZIP exported.')
    expect(click).toHaveBeenCalledOnce()
    unmount()
    const disposed = getStatus()
    act(() => requests[0].onProgress(4, 4))
    expect(getStatus()).toBe(disposed)
    click.mockRestore()
  })
  it('rejects duplicate work and suppresses cancelled completion', async () => {
    const { buildCodeZip } = await import('../utils/codeExport.js')
    let resolve
    buildCodeZip.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r
        })
    )
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const { result } = renderHook(() => useExport(makeMockSceneManagerRef()))
    let pending
    act(() => {
      pending = result.current.exportAs('zip')
    })
    await vi.waitFor(() => expect(resolve).toBeDefined())
    await act(async () => {
      await result.current.exportAs('zip')
      result.current.cancelExport()
    })
    await act(async () => {
      resolve(new Blob(['late']))
      await pending
    })
    expect(buildCodeZip).toHaveBeenCalledOnce()
    expect(click).not.toHaveBeenCalled()
    expect(getStatus().message).toContain('cancelled')
    click.mockRestore()
  })
  it('clears counterparts on failure and save recovery without resetting loading', async () => {
    const { saveProjectFile } = await import('../utils/projectFile.js')
    saveProjectFile.mockRejectedValueOnce(new Error('disk full'))
    const { result } = renderHook(() => useExport(makeMockSceneManagerRef()))
    act(() => useProjectStore.getState().setStatus({ loading: true, message: 'Old success', error: 'Old error' }))
    await act(async () => {
      await result.current.saveProject()
    })
    expect(getStatus().message).toBe('')
    expect(getStatus().error).toContain('disk full')
    expect(getStatus().loading).toBe(true)
    await act(async () => {
      await result.current.saveProject()
    })
    expect(getStatus().error).toBe('')
    expect(getStatus().message).toContain('Project saved')
  })
})
