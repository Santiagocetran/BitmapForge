/**
 * Integration conformance suite.
 *
 * Each builder is called with mock frames and a minimal state, then the output
 * artifact is structurally validated. This layer sits between pure unit tests
 * (which assert code-level contracts) and E2E (which drives the real browser).
 *
 * All tests run in jsdom — no real canvas rendering, no Three.js, no network.
 * Frame data is provided as mock ImageData-like objects.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest'
import JSZip from 'jszip'
import { hasPngSignature, getChunkTypes } from '../helpers/pngChunks.js'

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const FRAME_W = 16
const FRAME_H = 16
const FPS = 12
const FRAME_COUNT = 6

/**
 * Generate a frame with unique color per index so UPNG doesn't deduplicate
 * identical frames into a static single-frame image.
 */
function makeMockFrame(index = 0, w = FRAME_W, h = FRAME_H) {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (index * 43) % 256 // R — unique per frame
    data[i + 1] = (index * 27) % 256 // G
    data[i + 2] = 128 // B
    data[i + 3] = 255 // A — fully opaque
  }
  return { width: w, height: h, data }
}

const MOCK_FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) => makeMockFrame(i))
const DELAY_MS = Math.round(2000 / FRAME_COUNT) // 333ms

const CANONICAL_STATE = {
  colors: ['#021a15', '#074434', '#ABC685', '#E8FF99'],
  pixelSize: 3,
  ditherType: 'bayer4x4',
  invert: false,
  minBrightness: 0.05,
  backgroundColor: '#0a0a0a',
  useFadeInOut: true,
  fadeVariant: 'bloom',
  animationEffects: { spinX: false, spinY: true, spinZ: false, float: false },
  animationSpeed: 1.0,
  showPhaseDuration: 3000,
  animationDuration: 2500,
  lightDirection: { x: 3, y: 4, z: 5 },
  baseRotation: { x: 0, y: 0, z: 0 },
  animationPreset: 'spinY',
  rotateOnShow: false,
  showPreset: 'spinY',
  model: null
}

function makeMockManager(loopMs = 2000) {
  const canvas = document.createElement('canvas')
  canvas.width = FRAME_W
  canvas.height = FRAME_H
  return {
    getCanvas: () => canvas,
    getLoopDurationMs: () => loopMs,
    renderAtTime: vi.fn(),
    pauseLoop: vi.fn(),
    resumeLoop: vi.fn()
  }
}

// Mock framesProvider so all builders that call captureFrames get mock frames
vi.mock('../../src/app/utils/framesProvider.js', () => ({
  getFrameCount: vi.fn(() => FRAME_COUNT),
  captureFrames: vi.fn(async () => MOCK_FRAMES)
}))

// ─── Top-level imports (vi.mock is hoisted before these) ──────────────────────
import { buildApng } from '../../src/app/utils/apngExport.js'
import { buildSingleHtml } from '../../src/app/utils/singleHtmlExport.js'
import { buildLottieJson, LOTTIE_MAX_PX } from '../../src/app/utils/lottieExport.js'
import { buildReactComponent } from '../../src/app/utils/reactComponentExport.js'
import { buildWebComponent } from '../../src/app/utils/webComponentExport.js'
import { buildCssAnimation } from '../../src/app/utils/cssExport.js'
import { buildCodeZip } from '../../src/app/utils/codeExport.js'

// ─── 1. APNG ──────────────────────────────────────────────────────────────────

describe('APNG conformance', () => {
  it('produces a non-empty Blob', () => {
    const blob = buildApng(MOCK_FRAMES, DELAY_MS)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('output has valid PNG signature', async () => {
    const blob = buildApng(MOCK_FRAMES, DELAY_MS)
    expect(hasPngSignature(await blob.arrayBuffer())).toBe(true)
  })

  it('output is animated (acTL + fcTL chunks present)', async () => {
    const blob = buildApng(MOCK_FRAMES, DELAY_MS)
    const types = getChunkTypes(await blob.arrayBuffer())
    expect(types).toContain('acTL')
    expect(types.some((t) => t === 'fcTL')).toBe(true)
  })
})

// ─── 2. Single HTML ───────────────────────────────────────────────────────────

describe('Single HTML conformance', () => {
  it('produces a Blob with text/html type', async () => {
    const blob = await buildSingleHtml(MOCK_FRAMES, FPS, CANONICAL_STATE.backgroundColor)
    expect(blob.type).toBe('text/html')
  })

  it('HTML is a complete self-contained document', async () => {
    const blob = await buildSingleHtml(MOCK_FRAMES, FPS, CANONICAL_STATE.backgroundColor)
    const text = await blob.text()
    expect(text.toLowerCase()).toContain('<!doctype html>')
    expect(text).toContain('<canvas')
    expect(text).toContain('requestAnimationFrame')
  })

  it('contains no external network URLs', async () => {
    const blob = await buildSingleHtml(MOCK_FRAMES, FPS)
    const text = await blob.text()
    expect(text).not.toMatch(/https?:\/\//)
  })

  it('embeds exactly FRAME_COUNT data URIs', async () => {
    const blob = await buildSingleHtml(MOCK_FRAMES, FPS)
    const text = await blob.text()
    const matches = text.match(/data:image\/png;base64,/g) ?? []
    expect(matches.length).toBe(FRAME_COUNT)
  })

  it('fps matches the argument', async () => {
    const blob = await buildSingleHtml(MOCK_FRAMES, 20)
    const text = await blob.text()
    expect(text).toContain('fps = 20')
  })
})

// ─── 3. Lottie JSON ───────────────────────────────────────────────────────────

describe('Lottie JSON conformance', () => {
  async function getLottie(managerOverride) {
    const blob = await buildLottieJson(managerOverride ?? makeMockManager(), CANONICAL_STATE, 'test-anim', FPS)
    return JSON.parse(await blob.text())
  }

  it('output is valid JSON', async () => {
    const manager = makeMockManager()
    const blob = await buildLottieJson(manager, CANONICAL_STATE, 'test-anim', FPS)
    await expect(blob.text().then(JSON.parse)).resolves.toBeTruthy()
  })

  it('has required Lottie v5 root fields', async () => {
    const lottie = await getLottie()
    expect(lottie.v).toBeDefined()
    expect(typeof lottie.fr).toBe('number')
    expect(lottie.ip).toBe(0)
    expect(Array.isArray(lottie.assets)).toBe(true)
    expect(Array.isArray(lottie.layers)).toBe(true)
  })

  it('fr equals the fps argument', async () => {
    const lottie = await getLottie()
    expect(lottie.fr).toBe(FPS)
  })

  it('op equals FRAME_COUNT', async () => {
    const lottie = await getLottie()
    expect(lottie.op).toBe(FRAME_COUNT)
  })

  it('assets and layers have one entry per frame', async () => {
    const lottie = await getLottie()
    expect(lottie.assets).toHaveLength(FRAME_COUNT)
    expect(lottie.layers).toHaveLength(FRAME_COUNT)
  })

  it('dimensions respect LOTTIE_MAX_PX cap for oversized frames', async () => {
    const { captureFrames } = await import('../../src/app/utils/framesProvider.js')
    captureFrames.mockResolvedValueOnce([makeMockFrame(0, 512, 512)])
    const lottie = await getLottie(makeMockManager())
    expect(lottie.w).toBeLessThanOrEqual(LOTTIE_MAX_PX)
    expect(lottie.h).toBeLessThanOrEqual(LOTTIE_MAX_PX)
  })
})

// ─── 4. React ZIP ─────────────────────────────────────────────────────────────

describe('React component ZIP conformance', () => {
  async function getZip() {
    const blob = await buildReactComponent(CANONICAL_STATE)
    return JSZip.loadAsync(blob)
  }

  it('ZIP contains index.jsx', async () => {
    const zip = await getZip()
    expect(zip.files['MyAnimation/index.jsx']).toBeDefined()
  })

  it('ZIP contains config.js', async () => {
    const zip = await getZip()
    expect(zip.files['MyAnimation/config.js']).toBeDefined()
  })

  it('ZIP contains README.md', async () => {
    const zip = await getZip()
    expect(zip.files['MyAnimation/README.md']).toBeDefined()
  })

  it('ZIP contains 14 engine source files', async () => {
    const zip = await getZip()
    const engineFiles = Object.keys(zip.files).filter((p) => p.includes('/engine/') && !p.endsWith('/'))
    expect(engineFiles).toHaveLength(14)
  })
})

// ─── 5. Web Component ZIP ─────────────────────────────────────────────────────

describe('Web Component ZIP conformance', () => {
  async function getZip() {
    const blob = await buildWebComponent(CANONICAL_STATE)
    return JSZip.loadAsync(blob)
  }

  it('ZIP contains the component JS file', async () => {
    const zip = await getZip()
    expect(zip.files['bitmap-animation/bitmap-animation.js']).toBeDefined()
  })

  it('ZIP contains config.js', async () => {
    const zip = await getZip()
    expect(zip.files['bitmap-animation/config.js']).toBeDefined()
  })

  it('ZIP contains README.md', async () => {
    const zip = await getZip()
    expect(zip.files['bitmap-animation/README.md']).toBeDefined()
  })

  it('component JS guards against double registration with customElements.get()', async () => {
    const zip = await getZip()
    const js = await zip.files['bitmap-animation/bitmap-animation.js'].async('string')
    expect(js).toContain('customElements.get(')
  })

  it('ZIP contains 14 engine source files', async () => {
    const zip = await getZip()
    const engineFiles = Object.keys(zip.files).filter((p) => p.includes('/engine/') && !p.endsWith('/'))
    expect(engineFiles).toHaveLength(14)
  })
})

// ─── 6. CSS Animation ZIP ─────────────────────────────────────────────────────

describe('CSS animation ZIP conformance', () => {
  beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (callback) {
      callback(new Blob(['PNG'], { type: 'image/png' }))
    })
  })

  async function getZip() {
    const blob = await buildCssAnimation(makeMockManager(), CANONICAL_STATE, 'bitmapforge-animation', FPS)
    return JSZip.loadAsync(blob)
  }

  it('ZIP contains a CSS file', async () => {
    const zip = await getZip()
    expect(zip.files['bitmapforge-animation.css']).toBeDefined()
  })

  it('ZIP contains a sprite PNG', async () => {
    const zip = await getZip()
    expect(zip.files['bitmapforge-animation-sprite.png']).toBeDefined()
  })

  it('ZIP contains README.md', async () => {
    const zip = await getZip()
    expect(zip.files['README.md']).toBeDefined()
  })

  it('CSS uses steps(1, end) timing', async () => {
    const zip = await getZip()
    const css = await zip.files['bitmapforge-animation.css'].async('string')
    expect(css).toContain('steps(1, end)')
  })

  it('CSS animation is set to infinite', async () => {
    const zip = await getZip()
    const css = await zip.files['bitmapforge-animation.css'].async('string')
    expect(css).toContain('infinite')
  })
})

// ─── 7. Code ZIP ─────────────────────────────────────────────────────────────

describe('Code ZIP conformance', () => {
  async function getZip() {
    const blob = await buildCodeZip(CANONICAL_STATE)
    return JSZip.loadAsync(blob)
  }

  it('ZIP contains index.html and animation.js', async () => {
    const zip = await getZip()
    expect(zip.files['BitmapForge-export/index.html']).toBeDefined()
    expect(zip.files['BitmapForge-export/animation.js']).toBeDefined()
  })

  it('animation.js uses fetch() + new File() for model loading', async () => {
    const zip = await getZip()
    const src = await zip.files['BitmapForge-export/animation.js'].async('string')
    expect(src).toContain('fetch(')
    expect(src).toContain('new File(')
  })

  it('ZIP contains 14 engine source files', async () => {
    const zip = await getZip()
    const engineFiles = Object.keys(zip.files).filter((p) => p.includes('/engine/') && !p.endsWith('/'))
    expect(engineFiles).toHaveLength(14)
  })
})
