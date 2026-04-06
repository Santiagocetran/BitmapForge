/**
 * APNG decode verification — Layer 1 export test.
 *
 * Calls buildApng with deterministic frames, then decodes the output with
 * UPNG.decode() and verifies structure, dimensions, and timing.
 *
 * NOTE: UPNG.toRGBA8() crashes on multi-frame APNGs — pixel-level checks
 * live in the Playwright visual tests (test/e2e/export.visual.spec.js).
 *
 * Run with: npm run test:export
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import UPNG from 'upng-js'
import fs from 'node:fs'
import path from 'node:path'
import { buildApng } from '../../src/app/utils/apngExport.js'

// ─── Frame factory ────────────────────────────────────────────────────────────

const FRAME_W = 16
const FRAME_H = 16
const FRAME_COUNT = 6
const DELAY_MS = 100

/**
 * Frame N: R = N*40, G = 128, B = 200, A = 255 (unique per frame,
 * prevents UPNG from deduplicating identical frames into a static image).
 */
function makeFrame(index, w = FRAME_W, h = FRAME_H) {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (index * 40) % 256
    data[i + 1] = 128
    data[i + 2] = 200
    data[i + 3] = 255
  }
  return { width: w, height: h, data }
}

const FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) => makeFrame(i))

// ─── Worker mock (runs UPNG synchronously, same as main test suite) ──────────

function makeWorkerMock() {
  return vi.fn().mockImplementation(function WorkerMock() {
    this.terminate = vi.fn()
    this.onerror = null
    this.onmessage = null
    this.postMessage = (data) => {
      queueMicrotask(() => {
        try {
          const delays = data.frames.map(() => data.delayMs)
          const bufs = data.frames.map((f) =>
            f.byteOffset === 0 && f.byteLength === f.buffer.byteLength
              ? f.buffer
              : f.buffer.slice(f.byteOffset, f.byteOffset + f.byteLength)
          )
          const arrayBuffer = UPNG.encode(bufs, data.width, data.height, 0, delays)
          this.onmessage?.({ data: { ok: true, arrayBuffer } })
        } catch (err) {
          this.onmessage?.({ data: { ok: false, error: err.message } })
        }
      })
    }
  })
}

beforeEach(() => vi.stubGlobal('Worker', makeWorkerMock()))
afterEach(() => vi.unstubAllGlobals())

// ─── Helper: build and decode ─────────────────────────────────────────────────

async function buildAndDecode(frames = FRAMES, delayMs = DELAY_MS) {
  const blob = await buildApng(frames, delayMs)
  const buffer = await blob.arrayBuffer()
  const img = UPNG.decode(buffer)
  return { blob, buffer, img }
}

// ─── Chunk scanner ────────────────────────────────────────────────────────────

function containsChunk(buffer, ascii4) {
  const target = ascii4.split('').map((c) => c.charCodeAt(0))
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length - 4; i++) {
    if (
      bytes[i] === target[0] &&
      bytes[i + 1] === target[1] &&
      bytes[i + 2] === target[2] &&
      bytes[i + 3] === target[3]
    )
      return true
  }
  return false
}

// ─── Artifact output ─────────────────────────────────────────────────────────

const OUTPUT_DIR = 'test/fixtures/outputs'

function writeArtifact(name, buffer) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUTPUT_DIR, name), new Uint8Array(buffer))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('APNG decode — frame structure', () => {
  it('frame count matches input', async () => {
    const { img } = await buildAndDecode()
    expect(img.frames.length).toBe(FRAME_COUNT)
  })

  it('width and height match input frames', async () => {
    const { img } = await buildAndDecode()
    expect(img.width).toBe(FRAME_W)
    expect(img.height).toBe(FRAME_H)
  })

  it('each frame delay is within ±16ms of requested delay', async () => {
    const { img } = await buildAndDecode()
    for (const frame of img.frames) {
      expect(frame.delay).toBeGreaterThanOrEqual(DELAY_MS - 16)
      expect(frame.delay).toBeLessThanOrEqual(DELAY_MS + 16)
    }
  })

  it('frame count is preserved for multi-frame inputs', async () => {
    // Single-frame images: UPNG stores the frame as the main image data,
    // so img.frames.length === 0 for count=1. Only test multi-frame.
    for (const count of [2, 3, 12]) {
      const frames = Array.from({ length: count }, (_, i) => makeFrame(i))
      const { img } = await buildAndDecode(frames)
      expect(img.frames.length).toBe(count)
    }
  })
})

describe('APNG decode — chunk presence', () => {
  it('output contains acTL chunk (animation control)', async () => {
    const { buffer } = await buildAndDecode()
    expect(containsChunk(buffer, 'acTL')).toBe(true)
  })

  it('output contains fcTL chunk (frame control)', async () => {
    const { buffer } = await buildAndDecode()
    expect(containsChunk(buffer, 'fcTL')).toBe(true)
  })

  it('output contains IEND chunk (well-formed PNG)', async () => {
    const { buffer } = await buildAndDecode()
    expect(containsChunk(buffer, 'IEND')).toBe(true)
  })

  it('single-frame output still has valid PNG structure', async () => {
    const { buffer } = await buildAndDecode([makeFrame(0)], 100)
    expect(containsChunk(buffer, 'IEND')).toBe(true)
  })
})

describe('APNG decode — blob properties', () => {
  it('resolves to a Blob with image/png type', async () => {
    const { blob } = await buildAndDecode()
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/png')
  })

  it('blob is non-empty', async () => {
    const { blob } = await buildAndDecode()
    expect(blob.size).toBeGreaterThan(0)
  })
})

describe('APNG decode — timing variants', () => {
  it.each([
    [50, 'fast (50ms)'],
    [100, 'normal (100ms)'],
    [333, 'slow (333ms)']
  ])('delay %ims is preserved within ±16ms', async (delayMs) => {
    const { img } = await buildAndDecode(FRAMES, delayMs)
    for (const frame of img.frames) {
      expect(frame.delay).toBeGreaterThanOrEqual(delayMs - 16)
      expect(frame.delay).toBeLessThanOrEqual(delayMs + 16)
    }
  })
})

describe('APNG decode — artifact output', () => {
  it('writes test-animation.apng to test/fixtures/outputs/', async () => {
    const { buffer } = await buildAndDecode()
    writeArtifact('test-animation.apng', buffer)
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'test-animation.apng'))).toBe(true)
  })
})
