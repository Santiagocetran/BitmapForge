import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildLottieJson, estimateLottieSizeMb, LOTTIE_MAX_PX } from './lottieExport.js'

const FRAME_W = 64
const FRAME_H = 64
const FRAME_COUNT = 6
const FPS = 16

function makeMockFrame(w = FRAME_W, h = FRAME_H) {
  return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }
}

vi.mock('./framesProvider.js', () => ({
  getFrameCount: vi.fn(() => FRAME_COUNT),
  captureFrames: vi.fn(async () => Array.from({ length: FRAME_COUNT }, makeMockFrame))
}))

function makeMockManager(w = FRAME_W, h = FRAME_H) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return { getCanvas: () => canvas }
}

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    putImageData: vi.fn(),
    drawImage: vi.fn()
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,abc123')
})

// ─── estimateLottieSizeMb ─────────────────────────────────────────────────────

describe('estimateLottieSizeMb', () => {
  it('returns a string', () => {
    expect(typeof estimateLottieSizeMb(10, 64, 64)).toBe('string')
  })

  it('returns a positive number string', () => {
    const result = estimateLottieSizeMb(10, 64, 64)
    expect(parseFloat(result)).toBeGreaterThan(0)
  })

  it('larger frame count → larger estimate', () => {
    const small = parseFloat(estimateLottieSizeMb(5, 64, 64))
    const large = parseFloat(estimateLottieSizeMb(50, 64, 64))
    expect(large).toBeGreaterThan(small)
  })

  it('caps resolution at LOTTIE_MAX_PX for oversized frames', () => {
    // Huge canvas should cap at LOTTIE_MAX_PX × LOTTIE_MAX_PX
    const capped = parseFloat(estimateLottieSizeMb(10, 1000, 1000))
    const normal = parseFloat(estimateLottieSizeMb(10, LOTTIE_MAX_PX, LOTTIE_MAX_PX))
    // With capping they should be equal
    expect(capped).toBeCloseTo(normal, 1)
  })

  it('LOTTIE_MAX_PX is 256', () => {
    expect(LOTTIE_MAX_PX).toBe(256)
  })
})

// ─── buildLottieJson ──────────────────────────────────────────────────────────

describe('buildLottieJson', () => {
  async function getLottie(managerOverride) {
    const blob = await buildLottieJson(managerOverride ?? makeMockManager(), {}, 'test-anim', FPS)
    const text = await blob.text()
    return JSON.parse(text)
  }

  it('resolves to a Blob', async () => {
    const blob = await buildLottieJson(makeMockManager(), {}, 'test-anim', FPS)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('Blob is valid JSON', async () => {
    const blob = await buildLottieJson(makeMockManager(), {}, 'test-anim', FPS)
    const text = await blob.text()
    expect(() => JSON.parse(text)).not.toThrow()
  })

  it('root object has required Lottie v5 fields', async () => {
    const lottie = await getLottie()
    expect(lottie.v).toBeDefined()
    expect(lottie.fr).toBe(FPS)
    expect(lottie.ip).toBe(0)
    expect(lottie.op).toBe(FRAME_COUNT)
    expect(Array.isArray(lottie.assets)).toBe(true)
    expect(Array.isArray(lottie.layers)).toBe(true)
  })

  it('sets the animation name', async () => {
    const lottie = await getLottie()
    expect(lottie.nm).toBe('test-anim')
  })

  it('assets array length equals frame count', async () => {
    const lottie = await getLottie()
    expect(lottie.assets).toHaveLength(FRAME_COUNT)
  })

  it('layers array length equals frame count', async () => {
    const lottie = await getLottie()
    expect(lottie.layers).toHaveLength(FRAME_COUNT)
  })

  it('each asset has id, w, h, u, p, e fields', async () => {
    const lottie = await getLottie()
    for (const asset of lottie.assets) {
      expect(typeof asset.id).toBe('string')
      expect(typeof asset.w).toBe('number')
      expect(typeof asset.h).toBe('number')
      expect(asset.u).toBe('') // empty string → data URI embedded
      expect(typeof asset.p).toBe('string')
      expect(asset.e).toBe(1) // e:1 means embedded data URI
    }
  })

  it('asset IDs follow f0..fN pattern', async () => {
    const lottie = await getLottie()
    lottie.assets.forEach((asset, i) => {
      expect(asset.id).toBe(`f${i}`)
    })
  })

  it('each layer has required Lottie fields: ty, sr, bm', async () => {
    const lottie = await getLottie()
    for (const layer of lottie.layers) {
      expect(layer.ty).toBe(2) // image layer type
      expect(layer.sr).toBe(1) // stretch ratio — required, must be 1
      expect(layer.bm).toBe(0) // blend mode — required, 0 = normal
    }
  })

  it('each layer ip/op creates exactly one-frame windows', async () => {
    const lottie = await getLottie()
    lottie.layers.forEach((layer, i) => {
      expect(layer.ip).toBe(i)
      expect(layer.op).toBe(i + 1)
    })
  })

  it('layers reference correct asset refId', async () => {
    const lottie = await getLottie()
    lottie.layers.forEach((layer, i) => {
      expect(layer.refId).toBe(`f${i}`)
    })
  })

  it('layers st is 0', async () => {
    const lottie = await getLottie()
    for (const layer of lottie.layers) {
      expect(layer.st).toBe(0)
    }
  })

  it('passes signal and onProgress to captureFrames', async () => {
    const { captureFrames } = await import('./framesProvider.js')
    const onProgress = vi.fn()
    const controller = new AbortController()
    await buildLottieJson(makeMockManager(), {}, 'test', FPS, {
      signal: controller.signal,
      onProgress
    })
    expect(captureFrames).toHaveBeenCalledWith(
      expect.anything(),
      FRAME_COUNT,
      expect.objectContaining({ signal: controller.signal, onProgress })
    )
  })

  it('frames larger than LOTTIE_MAX_PX are scaled down', async () => {
    // 512×512 frame should be capped to 256×256
    const { captureFrames } = await import('./framesProvider.js')
    captureFrames.mockResolvedValueOnce([makeMockFrame(512, 512)])

    const blob = await buildLottieJson(makeMockManager(512, 512), {}, 'big', FPS)
    const lottie = JSON.parse(await blob.text())
    expect(lottie.w).toBeLessThanOrEqual(LOTTIE_MAX_PX)
    expect(lottie.h).toBeLessThanOrEqual(LOTTIE_MAX_PX)
  })
})
