/**
 * Sprite sheet structural verification — Layer 2 export test.
 *
 * buildSpriteSheet() composites frames onto a canvas via drawImage/putImageData.
 * Since jsdom's canvas.toBlob() isn't real, pixel-level verification lives in
 * Playwright (test/e2e). Here we spy on canvas 2D calls to verify:
 *   - Grid dimensions are calculated correctly
 *   - All frames are placed at the correct grid positions
 *   - The correct pixel data is passed per frame
 *
 * Run with: npm run test:export
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildSpriteSheet } from '../../src/app/utils/spriteSheetExport.js'

const COLUMNS = 6 // default in buildSpriteSheet

// ─── Frame factory ────────────────────────────────────────────────────────────

function makeFrame(index, w = 16, h = 16) {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (index * 40) % 256
    data[i + 1] = 128
    data[i + 2] = 200
    data[i + 3] = 255
  }
  return { width: w, height: h, data }
}

// ─── Canvas mock tracking ─────────────────────────────────────────────────────

let drawImageCalls = []
let putImageDataCalls = []
let canvasSizes = []

const mockCtx = {
  putImageData: vi.fn((imageData, x, y) => putImageDataCalls.push({ imageData, x, y })),
  drawImage: vi.fn((src, x, y) => drawImageCalls.push({ src, x, y })),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(0) })),
  clearRect: vi.fn(),
  fillRect: vi.fn()
}

let getContextSpy
let toBlobSpy

beforeEach(() => {
  drawImageCalls = []
  putImageDataCalls = []
  canvasSizes = []
  vi.clearAllMocks()

  getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx)

  toBlobSpy = vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (cb, mime) {
    canvasSizes.push({ width: this.width, height: this.height })
    cb(new Blob(['PNG'], { type: mime ?? 'image/png' }))
  })
})

afterEach(() => {
  getContextSpy.mockRestore()
  toBlobSpy.mockRestore()
})

// ─── Grid dimension tests ─────────────────────────────────────────────────────

describe('Sprite sheet — grid dimensions', () => {
  it('sheet width = COLUMNS * frameWidth for frameCount <= COLUMNS', async () => {
    const frames = Array.from({ length: 4 }, (_, i) => makeFrame(i))
    await buildSpriteSheet(frames)
    expect(canvasSizes[0].width).toBe(COLUMNS * 16)
  })

  it('sheet height = 1 row when frameCount <= COLUMNS', async () => {
    const frames = Array.from({ length: 4 }, (_, i) => makeFrame(i))
    await buildSpriteSheet(frames)
    expect(canvasSizes[0].height).toBe(16)
  })

  it('sheet height = 2 rows when frameCount = COLUMNS + 1', async () => {
    const frames = Array.from({ length: COLUMNS + 1 }, (_, i) => makeFrame(i))
    await buildSpriteSheet(frames)
    expect(canvasSizes[0].height).toBe(16 * 2)
  })

  it('sheet height = ceil(frameCount / COLUMNS) * frameH', async () => {
    for (const count of [6, 7, 12, 13]) {
      canvasSizes = []
      const frames = Array.from({ length: count }, (_, i) => makeFrame(i))
      await buildSpriteSheet(frames)
      const expectedRows = Math.ceil(count / COLUMNS)
      expect(canvasSizes[0].height).toBe(16 * expectedRows)
    }
  })

  it('respects different frame dimensions', async () => {
    const frames = Array.from({ length: 3 }, (_, i) => makeFrame(i, 32, 24))
    await buildSpriteSheet(frames)
    expect(canvasSizes[0].width).toBe(COLUMNS * 32)
    expect(canvasSizes[0].height).toBe(24)
  })
})

// ─── Frame placement tests ────────────────────────────────────────────────────

describe('Sprite sheet — frame placement', () => {
  it('places all frames (drawImage called frameCount times)', async () => {
    const frames = Array.from({ length: 6 }, (_, i) => makeFrame(i))
    await buildSpriteSheet(frames)
    expect(drawImageCalls).toHaveLength(6)
  })

  it('frame 0 placed at (0, 0)', async () => {
    const frames = Array.from({ length: 4 }, (_, i) => makeFrame(i))
    await buildSpriteSheet(frames)
    expect(drawImageCalls[0].x).toBe(0)
    expect(drawImageCalls[0].y).toBe(0)
  })

  it('frame 1 placed at (frameW, 0)', async () => {
    const frames = Array.from({ length: 4 }, (_, i) => makeFrame(i))
    await buildSpriteSheet(frames)
    expect(drawImageCalls[1].x).toBe(16)
    expect(drawImageCalls[1].y).toBe(0)
  })

  it(`frame ${COLUMNS} placed at (0, frameH) — row wrap`, async () => {
    const frames = Array.from({ length: COLUMNS + 1 }, (_, i) => makeFrame(i))
    await buildSpriteSheet(frames)
    expect(drawImageCalls[COLUMNS].x).toBe(0)
    expect(drawImageCalls[COLUMNS].y).toBe(16)
  })

  it('each frame receives its own putImageData call with correct pixel data', async () => {
    const frames = Array.from({ length: 4 }, (_, i) => makeFrame(i))
    await buildSpriteSheet(frames)
    // Each frame's cell canvas gets putImageData with that frame's data
    expect(putImageDataCalls).toHaveLength(4)
    for (let i = 0; i < 4; i++) {
      expect(putImageDataCalls[i].x).toBe(0)
      expect(putImageDataCalls[i].y).toBe(0)
      // Verify the pixel data passed matches frame i's R channel
      expect(putImageDataCalls[i].imageData.data[0]).toBe((i * 40) % 256)
    }
  })
})

// ─── Return value tests ───────────────────────────────────────────────────────

describe('Sprite sheet — return value', () => {
  it('resolves to a Blob', async () => {
    const frames = Array.from({ length: 4 }, (_, i) => makeFrame(i))
    const blob = await buildSpriteSheet(frames)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('Blob has image/png type', async () => {
    const frames = Array.from({ length: 4 }, (_, i) => makeFrame(i))
    const blob = await buildSpriteSheet(frames)
    expect(blob.type).toBe('image/png')
  })

  it('rejects on empty frames array', async () => {
    await expect(buildSpriteSheet([])).rejects.toThrow('No frames to composite')
  })
})
