import { describe, it, expect, vi } from 'vitest'
import { getFrameCount, captureFrames } from './framesProvider.js'

function makeMockManager({ loopMs = 1000, canvasWidth = 16, canvasHeight = 16 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  return {
    getCanvas: vi.fn(() => canvas),
    getLoopDurationMs: vi.fn(() => loopMs),
    renderAtTime: vi.fn(),
    pauseLoop: vi.fn(),
    resumeLoop: vi.fn()
  }
}

// ─── getFrameCount ────────────────────────────────────────────────────────────

describe('getFrameCount', () => {
  function makeMgr(loopMs) {
    return { getLoopDurationMs: () => loopMs }
  }

  it('returns at least 12 frames regardless of fps', () => {
    expect(getFrameCount(makeMgr(100), 1)).toBe(12)
  })

  it('computes frames from loopMs and fps (2000ms @ 16fps = 32)', () => {
    expect(getFrameCount(makeMgr(2000), 16)).toBe(32)
  })

  it('computes frames from loopMs and fps (1000ms @ 24fps = 24)', () => {
    expect(getFrameCount(makeMgr(1000), 24)).toBe(24)
  })

  it('rounds to nearest integer', () => {
    // 1000ms * 15fps / 1000 = 15 frames
    expect(getFrameCount(makeMgr(1000), 15)).toBe(15)
  })

  it('minimum is 12 even at low fps', () => {
    expect(getFrameCount(makeMgr(500), 1)).toBe(12)
  })

  it('minimum is 12 even when loopMs is very short', () => {
    expect(getFrameCount(makeMgr(10), 24)).toBe(12)
  })
})

// ─── captureFrames ────────────────────────────────────────────────────────────

describe('captureFrames — canvas guard', () => {
  it('throws if getCanvas returns null', async () => {
    const manager = {
      getCanvas: () => null,
      getLoopDurationMs: () => 1000,
      pauseLoop: vi.fn(),
      resumeLoop: vi.fn()
    }
    await expect(captureFrames(manager, 3)).rejects.toThrow('No preview canvas available')
  })
})

describe('captureFrames — loop control', () => {
  it('calls pauseLoop before capturing frames', async () => {
    const manager = makeMockManager()
    await captureFrames(manager, 4)
    expect(manager.pauseLoop).toHaveBeenCalled()
  })

  it('calls resumeLoop after successful capture', async () => {
    const manager = makeMockManager()
    await captureFrames(manager, 4)
    expect(manager.resumeLoop).toHaveBeenCalled()
  })

  it('calls resumeLoop even when renderAtTime throws (finally block)', async () => {
    const manager = makeMockManager()
    manager.renderAtTime.mockImplementation(() => {
      throw new Error('render failure')
    })
    await expect(captureFrames(manager, 4)).rejects.toThrow('render failure')
    expect(manager.resumeLoop).toHaveBeenCalled()
  })
})

describe('captureFrames — frame output', () => {
  it('returns an array of the requested frame count', async () => {
    const manager = makeMockManager()
    const frames = await captureFrames(manager, 6)
    expect(frames).toHaveLength(6)
  })

  it('calls renderAtTime for each frame', async () => {
    const manager = makeMockManager({ loopMs: 1000 })
    await captureFrames(manager, 4)
    expect(manager.renderAtTime).toHaveBeenCalledTimes(4)
  })

  it('passes correct time fractions to renderAtTime', async () => {
    const manager = makeMockManager({ loopMs: 1000 })
    await captureFrames(manager, 4)
    // frame 0: 0/4 * 1000 = 0
    expect(manager.renderAtTime).toHaveBeenCalledWith(0)
    // frame 1: 1/4 * 1000 = 250
    expect(manager.renderAtTime).toHaveBeenCalledWith(250)
    // frame 3: 3/4 * 1000 = 750
    expect(manager.renderAtTime).toHaveBeenCalledWith(750)
  })
})

describe('captureFrames — progress callback', () => {
  it('calls onProgress once per frame', async () => {
    const manager = makeMockManager()
    const onProgress = vi.fn()
    await captureFrames(manager, 4, { onProgress })
    expect(onProgress).toHaveBeenCalledTimes(4)
  })

  it('passes (current, total) where current goes from 1 to frameCount', async () => {
    const manager = makeMockManager()
    const calls = []
    await captureFrames(manager, 3, { onProgress: (c, t) => calls.push([c, t]) })
    expect(calls).toEqual([
      [1, 3],
      [2, 3],
      [3, 3]
    ])
  })
})

describe('captureFrames — abort', () => {
  it('throws AbortError when signal is pre-aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    const manager = makeMockManager()
    await expect(captureFrames(manager, 4, { signal: controller.signal })).rejects.toMatchObject({
      name: 'AbortError'
    })
  })

  it('calls resumeLoop even when aborted (finally block)', async () => {
    const controller = new AbortController()
    controller.abort()
    const manager = makeMockManager()
    await expect(captureFrames(manager, 4, { signal: controller.signal })).rejects.toThrow()
    expect(manager.resumeLoop).toHaveBeenCalled()
  })

  it('throws AbortError when signal is aborted mid-capture', async () => {
    const controller = new AbortController()
    let callCount = 0
    const manager = makeMockManager()
    manager.renderAtTime.mockImplementation(() => {
      callCount++
      if (callCount === 2) controller.abort()
    })
    await expect(captureFrames(manager, 6, { signal: controller.signal })).rejects.toMatchObject({
      name: 'AbortError'
    })
  })
})
