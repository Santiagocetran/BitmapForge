import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import UPNG from 'upng-js'
import { buildApng } from './apngExport.js'
import { hasPngSignature, getChunkTypes } from '../../../test/helpers/pngChunks.js'

function makeMockFrame(w = 8, h = 8) {
  // Fill with semi-transparent grey so upng-js has real pixel data to encode
  const data = new Uint8ClampedArray(w * h * 4).fill(128)
  return { width: w, height: h, data }
}

// Worker mock that runs UPNG synchronously so PNG structure tests remain valid
function makeWorkerMock() {
  return vi.fn().mockImplementation(function WorkerMock() {
    this.terminate = vi.fn()
    this.onerror = null
    this.onmessage = null
    this.postMessage = (data) => {
      queueMicrotask(() => {
        try {
          const delays = data.frames.map(() => data.delayMs)
          const arrayBuffer = UPNG.encode(data.frames, data.width, data.height, 0, delays)
          this.onmessage?.({ data: { ok: true, arrayBuffer } })
        } catch (err) {
          this.onmessage?.({ data: { ok: false, error: err.message } })
        }
      })
    }
  })
}

beforeEach(() => {
  vi.stubGlobal('Worker', makeWorkerMock())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─── Error handling ───────────────────────────────────────────────────────────

describe('buildApng — error handling', () => {
  it('rejects on empty frames array', async () => {
    await expect(buildApng([], 100)).rejects.toThrow('No frames to encode')
  })

  it('rejects when worker posts ok: false', async () => {
    vi.stubGlobal(
      'Worker',
      vi.fn().mockImplementation(function () {
        this.terminate = vi.fn()
        this.onerror = null
        this.onmessage = null
        this.postMessage = () => {
          queueMicrotask(() => this.onmessage?.({ data: { ok: false, error: 'encode failed' } }))
        }
      })
    )
    await expect(buildApng([makeMockFrame()], 100)).rejects.toThrow('encode failed')
  })
})

// ─── Return type ──────────────────────────────────────────────────────────────

describe('buildApng — return value', () => {
  it('returns a Promise', () => {
    const result = buildApng([makeMockFrame()], 100)
    expect(result).toBeInstanceOf(Promise)
    return result // ensure no unhandled rejection
  })

  it('resolves to a Blob', async () => {
    const blob = await buildApng([makeMockFrame()], 100)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('Blob has image/png MIME type', async () => {
    const blob = await buildApng([makeMockFrame()], 100)
    expect(blob.type).toBe('image/png')
  })

  it('Blob is non-empty', async () => {
    const blob = await buildApng([makeMockFrame()], 100)
    expect(blob.size).toBeGreaterThan(0)
  })
})

// ─── PNG structure ────────────────────────────────────────────────────────────

describe('buildApng — PNG signature', () => {
  it('output starts with valid PNG signature', async () => {
    const blob = await buildApng([makeMockFrame()], 100)
    const buffer = await blob.arrayBuffer()
    expect(hasPngSignature(buffer)).toBe(true)
  })
})

// ─── APNG animation chunks ────────────────────────────────────────────────────

describe('buildApng — APNG chunks', () => {
  it('output contains acTL chunk (animation control)', async () => {
    const blob = await buildApng([makeMockFrame(), makeMockFrame()], 100)
    const buffer = await blob.arrayBuffer()
    expect(getChunkTypes(buffer)).toContain('acTL')
  })

  it('output contains fcTL chunk (frame control)', async () => {
    const blob = await buildApng([makeMockFrame(), makeMockFrame()], 100)
    const buffer = await blob.arrayBuffer()
    expect(getChunkTypes(buffer).some((t) => t === 'fcTL')).toBe(true)
  })

  it('output contains IEND chunk (well-formed PNG)', async () => {
    const blob = await buildApng([makeMockFrame(), makeMockFrame()], 100)
    const buffer = await blob.arrayBuffer()
    expect(getChunkTypes(buffer)).toContain('IEND')
  })
})

// ─── Frame dimensions ─────────────────────────────────────────────────────────

describe('buildApng — dimensions', () => {
  it('encodes frames of different sizes without throwing', async () => {
    await expect(buildApng([makeMockFrame(4, 4)], 50)).resolves.toBeInstanceOf(Blob)
    await expect(buildApng([makeMockFrame(32, 16)], 50)).resolves.toBeInstanceOf(Blob)
  })
})

// ─── Worker lifecycle ─────────────────────────────────────────────────────────

describe('buildApng — worker lifecycle', () => {
  it('terminates the worker after successful encode', async () => {
    const MockWorker = makeWorkerMock()
    vi.stubGlobal('Worker', MockWorker)

    await buildApng([makeMockFrame()], 100)

    const instance = MockWorker.mock.instances[0]
    expect(instance.terminate).toHaveBeenCalledOnce()
  })
})
