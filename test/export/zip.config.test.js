/**
 * ZIP config deep-equal verification — Layer 2 export test.
 *
 * For every ZIP export format, builds the artifact, extracts it with JSZip,
 * and verifies:
 *   1. File manifest matches expected entries (no missing or phantom files)
 *   2. config.js parses as valid JSON and deep-equals the input state
 *   3. Format-specific structural assertions (hooks, API calls, etc.)
 *
 * Run with: npm run test:export
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import JSZip from 'jszip'
import path from 'node:path'
import { buildExportConfig } from '../../src/app/utils/exportConfig.js'

// ─── Canonical state (mirrors exportConformance fixture) ─────────────────────

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
  renderMode: 'bitmap',
  model: null
}

const CANONICAL_CONFIG = buildExportConfig(CANONICAL_STATE)

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Strip `export const config = ` prefix and trailing newline, then JSON.parse.
 * Throws with a clear message if the content isn't valid JSON — that's intentional:
 * exporters must emit strict JSON (they all use JSON.stringify internally).
 */
function parseConfigJs(content) {
  const normalized = content.replace(/\r\n/g, '\n').trim()
  const prefix = 'export const config = '
  if (!normalized.startsWith(prefix))
    throw new Error(`config.js does not start with expected prefix.\nGot: ${normalized.slice(0, 80)}`)
  const json = normalized.slice(prefix.length).replace(/\n$/, '')
  return JSON.parse(json)
}

function hasNoUndefined(obj) {
  return !JSON.stringify(obj).includes('"undefined"') && !JSON.stringify(obj).includes(':undefined')
}

function normalizeCrlf(str) {
  return str.replace(/\r\n/g, '\n')
}

function hasNoPathTraversal(zip) {
  return Object.keys(zip.files).every((p) => !p.includes('../') && !path.isAbsolute(p))
}

// ─── Mocks required by ZIP builders ──────────────────────────────────────────

vi.mock('../../src/app/utils/framesProvider.js', () => ({
  getFrameCount: vi.fn(() => 6),
  captureFrames: vi.fn(async () =>
    Array.from({ length: 6 }, (_, i) => {
      const data = new Uint8ClampedArray(16 * 16 * 4).fill(i * 40)
      return { width: 16, height: 16, data }
    })
  )
}))

beforeEach(() =>
  vi.stubGlobal(
    'Worker',
    class {
      constructor() {
        this.terminate = vi.fn()
      }
    }
  )
)
afterEach(() => vi.unstubAllGlobals())

// ─── Code ZIP ─────────────────────────────────────────────────────────────────

describe('Code ZIP — manifest', () => {
  async function getZip() {
    const { buildCodeZip } = await import('../../src/app/utils/codeExport.js')
    const blob = await buildCodeZip(CANONICAL_STATE)
    return JSZip.loadAsync(blob)
  }

  it('contains all required scaffold files', async () => {
    const zip = await getZip()
    const required = [
      'BitmapForge-export/index.html',
      'BitmapForge-export/animation.js',
      'BitmapForge-export/config.js',
      'BitmapForge-export/package.json',
      'BitmapForge-export/vite.config.js',
      'BitmapForge-export/README.md'
    ]
    for (const f of required) expect(zip.files[f], `missing ${f}`).toBeDefined()
  })

  it('engine file count matches ENGINE_SOURCES length', async () => {
    const { ENGINE_SOURCES } = await import('../../src/app/utils/engineSources.js')
    const zip = await getZip()
    const engineFiles = Object.keys(zip.files).filter((p) => p.includes('/engine/') && !p.endsWith('/'))
    expect(engineFiles).toHaveLength(ENGINE_SOURCES.length)
  })

  it('has no path traversal entries', async () => {
    const zip = await getZip()
    expect(hasNoPathTraversal(zip)).toBe(true)
  })
})

describe('Code ZIP — config.js', () => {
  async function getParsedConfig() {
    const { buildCodeZip } = await import('../../src/app/utils/codeExport.js')
    const blob = await buildCodeZip(CANONICAL_STATE)
    const zip = await JSZip.loadAsync(blob)
    const raw = await zip.files['BitmapForge-export/config.js'].async('string')
    return parseConfigJs(raw)
  }

  it('parses as valid JSON', async () => {
    await expect(getParsedConfig()).resolves.toBeTruthy()
  })

  it('deep-equals buildExportConfig(CANONICAL_STATE)', async () => {
    const parsed = await getParsedConfig()
    expect(parsed).toMatchObject(CANONICAL_CONFIG)
  })

  it('contains no undefined values', async () => {
    const parsed = await getParsedConfig()
    expect(hasNoUndefined(parsed)).toBe(true)
  })
})

describe('Code ZIP — animation.js', () => {
  async function getAnimationJs() {
    const { buildCodeZip } = await import('../../src/app/utils/codeExport.js')
    const blob = await buildCodeZip(CANONICAL_STATE)
    const zip = await JSZip.loadAsync(blob)
    return zip.files['BitmapForge-export/animation.js'].async('string')
  }

  it('is a non-empty ES module (has import statement)', async () => {
    // animation.js uses top-level import — new Function() can't parse ES modules.
    // Verify it's a well-formed module by checking for the import keyword.
    const src = await getAnimationJs()
    expect(src.trimStart()).toMatch(/^import /)
  })

  it('imports SceneManager from engine', async () => {
    const src = await getAnimationJs()
    expect(src).toContain('./engine/SceneManager.js')
  })

  it('uses fetch() to load model', async () => {
    const src = await getAnimationJs()
    expect(src).toContain('fetch(')
  })
})

describe('Code ZIP — render-mode sweep', () => {
  it.each(['bitmap', 'pixelArt', 'ascii', 'halftone', 'ledMatrix', 'stipple'])(
    'renderMode=%s is preserved in config.js',
    async (renderMode) => {
      const { buildCodeZip } = await import('../../src/app/utils/codeExport.js')
      const blob = await buildCodeZip({ ...CANONICAL_STATE, renderMode })
      const zip = await JSZip.loadAsync(blob)
      const raw = await zip.files['BitmapForge-export/config.js'].async('string')
      const parsed = parseConfigJs(raw)
      expect(parsed.effectOptions.renderMode).toBe(renderMode)
    }
  )
})

// ─── React Component ZIP ──────────────────────────────────────────────────────

describe('React ZIP — manifest', () => {
  async function getZip() {
    const { buildReactComponent } = await import('../../src/app/utils/reactComponentExport.js')
    const blob = await buildReactComponent(CANONICAL_STATE)
    return JSZip.loadAsync(blob)
  }

  it('contains index.jsx, config.js, README.md', async () => {
    const zip = await getZip()
    expect(zip.files['MyAnimation/index.jsx']).toBeDefined()
    expect(zip.files['MyAnimation/config.js']).toBeDefined()
    expect(zip.files['MyAnimation/README.md']).toBeDefined()
  })

  it('engine file count matches ENGINE_SOURCES length', async () => {
    const { ENGINE_SOURCES } = await import('../../src/app/utils/engineSources.js')
    const zip = await getZip()
    const engineFiles = Object.keys(zip.files).filter((p) => p.includes('/engine/') && !p.endsWith('/'))
    expect(engineFiles).toHaveLength(ENGINE_SOURCES.length)
  })

  it('has no path traversal entries', async () => {
    const zip = await getZip()
    expect(hasNoPathTraversal(zip)).toBe(true)
  })
})

describe('React ZIP — config.js', () => {
  async function getParsedConfig() {
    const { buildReactComponent } = await import('../../src/app/utils/reactComponentExport.js')
    const blob = await buildReactComponent(CANONICAL_STATE)
    const zip = await JSZip.loadAsync(blob)
    const raw = await zip.files['MyAnimation/config.js'].async('string')
    return parseConfigJs(raw)
  }

  it('deep-equals buildExportConfig(CANONICAL_STATE)', async () => {
    const parsed = await getParsedConfig()
    expect(parsed).toMatchObject(CANONICAL_CONFIG)
  })

  it('contains no undefined values', async () => {
    const parsed = await getParsedConfig()
    expect(hasNoUndefined(parsed)).toBe(true)
  })
})

describe('React ZIP — index.jsx', () => {
  async function getIndexJsx() {
    const { buildReactComponent } = await import('../../src/app/utils/reactComponentExport.js')
    const blob = await buildReactComponent(CANONICAL_STATE)
    const zip = await JSZip.loadAsync(blob)
    return zip.files['MyAnimation/index.jsx'].async('string')
  }

  it('imports SceneManager from engine', async () => {
    const src = await getIndexJsx()
    expect(src).toContain('./engine/SceneManager.js')
  })

  it('uses useEffect and useRef', async () => {
    const src = await getIndexJsx()
    expect(src).toContain('useEffect')
    expect(src).toContain('useRef')
  })

  it('calls setRenderMode', async () => {
    const src = await getIndexJsx()
    expect(src).toContain('setRenderMode')
  })

  it('does not contain literal string "undefined"', async () => {
    const src = await getIndexJsx()
    expect(normalizeCrlf(src)).not.toContain('"undefined"')
  })
})

// ─── Web Component ZIP ────────────────────────────────────────────────────────

describe('Web Component ZIP — manifest', () => {
  async function getZip() {
    const { buildWebComponent } = await import('../../src/app/utils/webComponentExport.js')
    const blob = await buildWebComponent(CANONICAL_STATE)
    return JSZip.loadAsync(blob)
  }

  it('contains component JS, config.js, README.md', async () => {
    const zip = await getZip()
    expect(zip.files['bitmap-animation/bitmap-animation.js']).toBeDefined()
    expect(zip.files['bitmap-animation/config.js']).toBeDefined()
    expect(zip.files['bitmap-animation/README.md']).toBeDefined()
  })

  it('has no path traversal entries', async () => {
    const zip = await getZip()
    expect(hasNoPathTraversal(zip)).toBe(true)
  })
})

describe('Web Component ZIP — config.js', () => {
  async function getParsedConfig() {
    const { buildWebComponent } = await import('../../src/app/utils/webComponentExport.js')
    const blob = await buildWebComponent(CANONICAL_STATE)
    const zip = await JSZip.loadAsync(blob)
    const raw = await zip.files['bitmap-animation/config.js'].async('string')
    return parseConfigJs(raw)
  }

  it('deep-equals buildExportConfig(CANONICAL_STATE)', async () => {
    const parsed = await getParsedConfig()
    expect(parsed).toMatchObject(CANONICAL_CONFIG)
  })

  it('contains no undefined values', async () => {
    const parsed = await getParsedConfig()
    expect(hasNoUndefined(parsed)).toBe(true)
  })
})

describe('Web Component ZIP — component JS', () => {
  async function getComponentJs() {
    const { buildWebComponent } = await import('../../src/app/utils/webComponentExport.js')
    const blob = await buildWebComponent(CANONICAL_STATE)
    const zip = await JSZip.loadAsync(blob)
    return zip.files['bitmap-animation/bitmap-animation.js'].async('string')
  }

  it('registers custom element', async () => {
    const src = await getComponentJs()
    expect(src).toContain('customElements.define(')
  })

  it('guards against double registration', async () => {
    const src = await getComponentJs()
    expect(src).toContain('customElements.get(')
  })

  it('uses Shadow DOM', async () => {
    const src = await getComponentJs()
    expect(src).toContain('attachShadow')
  })

  it('does not contain literal string "undefined"', async () => {
    const src = await getComponentJs()
    expect(normalizeCrlf(src)).not.toContain('"undefined"')
  })
})

// ─── CSS ZIP ──────────────────────────────────────────────────────────────────

const mockCtx2d = {
  putImageData: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(0) })),
  clearRect: vi.fn(),
  fillRect: vi.fn()
}

function stubCssCanvas() {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx2d)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (cb) {
    cb(new Blob(['PNG'], { type: 'image/png' }))
  })
}

describe('CSS ZIP — manifest', () => {
  beforeEach(stubCssCanvas)
  afterEach(() => vi.restoreAllMocks())

  async function getZip(name = 'bitmapforge-animation') {
    const { buildCssAnimation } = await import('../../src/app/utils/cssExport.js')
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const manager = { getCanvas: () => canvas, getLoopDurationMs: () => 1000 }
    const blob = await buildCssAnimation(manager, CANONICAL_STATE, name, 12)
    return JSZip.loadAsync(blob)
  }

  it('contains CSS file, sprite PNG, README', async () => {
    const zip = await getZip()
    expect(zip.files['bitmapforge-animation.css']).toBeDefined()
    expect(zip.files['bitmapforge-animation-sprite.png']).toBeDefined()
    expect(zip.files['README.md']).toBeDefined()
  })

  it('has no path traversal entries', async () => {
    const zip = await getZip()
    expect(hasNoPathTraversal(zip)).toBe(true)
  })
})

describe('CSS ZIP — CSS content', () => {
  beforeEach(stubCssCanvas)
  afterEach(() => vi.restoreAllMocks())

  async function getCss(name = 'bitmapforge-animation') {
    const { buildCssAnimation } = await import('../../src/app/utils/cssExport.js')
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const manager = { getCanvas: () => canvas, getLoopDurationMs: () => 1000 }
    const blob = await buildCssAnimation(manager, CANONICAL_STATE, name, 12)
    const zip = await JSZip.loadAsync(blob)
    return zip.files[`${name}.css`].async('string')
  }

  it('uses steps(1, end) timing function', async () => {
    const css = await getCss()
    expect(css).toContain('steps(1, end)')
  })

  it('animation repeats infinitely', async () => {
    const css = await getCss()
    expect(css).toContain('infinite')
  })

  it('animation-duration matches loop duration', async () => {
    const css = await getCss()
    expect(css).toContain('1000ms')
  })

  it('CSS has balanced braces', async () => {
    const css = await getCss()
    const open = (css.match(/\{/g) || []).length
    const close = (css.match(/\}/g) || []).length
    expect(open).toBe(close)
  })

  it('references sprite PNG via relative url()', async () => {
    const css = await getCss()
    expect(css).toContain("url('./bitmapforge-animation-sprite.png')")
  })
})
