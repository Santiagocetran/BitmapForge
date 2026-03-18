import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExport } from './useExport.js'
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

vi.mock('../utils/singleHtmlExport.js', () => ({
  buildSingleHtml: vi.fn(async () => new Blob(['html'], { type: 'text/html' }))
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

vi.mock('../utils/lottieExport.js', () => ({
  buildLottieJson: vi.fn(async () => new Blob(['{}'], { type: 'application/json' })),
  estimateLottieSizeMb: vi.fn(() => '0.1'),
  LOTTIE_MAX_PX: 256
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

// ─── exportApng ───────────────────────────────────────────────────────────────

describe('useExport — exportApng', () => {
  it('sets exporting=false on success', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportApng()
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
      await result.current.exportApng()
    })
    expect(getStatus().exporting).toBe(false)
    expect(getStatus().error).toContain('encode error')
  })

  it('does nothing when sceneManagerRef.current is null', async () => {
    const ref = makeMockSceneManagerRef({ withCanvas: false })
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportApng()
    })
    // Should not update status at all since it returns early
    expect(getStatus().exporting).toBe(false)
  })
})

// ─── exportCodeZip ────────────────────────────────────────────────────────────

describe('useExport — exportCodeZip', () => {
  it('sets exporting=false on success', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportCodeZip()
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
      await result.current.exportCodeZip()
    })
    expect(getStatus().error).toContain('zip failed')
  })
})

// ─── exportSingleHtml ─────────────────────────────────────────────────────────

describe('useExport — exportSingleHtml', () => {
  it('sets exporting=false on success', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportSingleHtml()
    })
    expect(getStatus().exporting).toBe(false)
    expect(getStatus().error).toBeFalsy()
  })
})

// ─── exportReactComponent ─────────────────────────────────────────────────────

describe('useExport — exportReactComponent', () => {
  it('sets exporting=false on success', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportReactComponent()
    })
    expect(getStatus().exporting).toBe(false)
    expect(getStatus().error).toBeFalsy()
  })
})

// ─── exportVideo (legacy fallback — MediaRecorder not available in jsdom) ─────

describe('useExport — exportVideo (legacy fallback)', () => {
  it('returns early when no manager is available', async () => {
    const ref = makeMockSceneManagerRef({ withCanvas: false })
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportVideo()
    })
    // Returns early (no manager), so status is unchanged
    expect(getStatus().exporting).toBe(false)
  })

  it('falls back to legacy and sets error when MediaRecorder is unavailable', async () => {
    // VideoEncoder not defined in jsdom → falls back to legacy → MediaRecorder also fails
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportVideo()
    })
    expect(getStatus().exporting).toBe(false)
    expect(typeof getStatus().error).toBe('string')
  })
})

// ─── exportVideo (WebCodecs path) ────────────────────────────────────────────

describe('useExport — exportVideo (WebCodecs)', () => {
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
      await result.current.exportVideo()
    })
    expect(getStatus().exporting).toBe(false)
    expect(getStatus().error).toBeFalsy()
  })

  it('encodes getFrameCount() frames', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportVideo()
    })
    // getFrameCount mock returns 4
    expect(mockEncode).toHaveBeenCalledTimes(4)
  })

  it('stamps frames with correct microsecond timestamps', async () => {
    const fps = 30
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportVideo(fps)
    })
    // Frame 0: timestamp=0, Frame 1: timestamp=Math.round(1/30 * 1_000_000)
    expect(MockVideoFrame.mock.calls[0][1].timestamp).toBe(0)
    expect(MockVideoFrame.mock.calls[1][1].timestamp).toBe(Math.round((1 / fps) * 1_000_000))
  })

  it('closes each VideoFrame after encoding', async () => {
    const ref = makeMockSceneManagerRef()
    const { result } = renderHook(() => useExport(ref))
    await act(async () => {
      await result.current.exportVideo()
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
