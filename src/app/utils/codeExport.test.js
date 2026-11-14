import { describe, it, expect, vi } from 'vitest'
import JSZip from 'jszip'
import { buildCodeZip } from './codeExport.js'
import { buildExportConfig } from './exportConfig.js'

describe('buildExportConfig', () => {
  const mockState = {
    colors: ['#000', '#fff'],
    pixelSize: 3,
    ditherType: 'bayer4x4',
    invert: false,
    minBrightness: 0.05,
    backgroundColor: '#0a0a0a',
    animationDuration: 2500,
    animationPreset: 'spinY',
    animationSpeed: 0.36,
    showPhaseDuration: 20000,
    rotateOnShow: false,
    showPreset: 'spinY',
    lightDirection: { x: 3, y: 4, z: 5 },
    model: null
  }

  it('returns a plain object with effectOptions', () => {
    const result = buildExportConfig(mockState)
    expect(result).toHaveProperty('effectOptions')
    expect(result.effectOptions.pixelSize).toBe(3)
  })

  it('config contains expected keys from state', () => {
    const result = buildExportConfig(mockState)
    expect(result.effectOptions).toHaveProperty('pixelSize')
    expect(result).toHaveProperty('animationSpeed')
    expect(result).toHaveProperty('lightDirection')
    expect(result.effectOptions).toHaveProperty('ditherType')
  })
})

// ─── buildCodeZip ─────────────────────────────────────────────────────────────

const BASE_STATE = {
  colors: ['#000', '#fff'],
  pixelSize: 3,
  ditherType: 'bayer4x4',
  invert: false,
  minBrightness: 0.05,
  backgroundColor: '#0a0a0a',
  animationDuration: 2500,
  animationPreset: 'spinY',
  animationSpeed: 1.0,
  showPhaseDuration: 3000,
  rotateOnShow: false,
  showPreset: 'spinY',
  lightDirection: { x: 3, y: 4, z: 5 },
  model: null
}

async function getCodeZip(state = BASE_STATE) {
  const blob = await buildCodeZip(state)
  return JSZip.loadAsync(blob)
}

describe('buildCodeZip — return value', () => {
  it('resolves to a Blob', async () => {
    const blob = await buildCodeZip(BASE_STATE)
    expect(blob).toBeInstanceOf(Blob)
  })
})

describe('buildCodeZip — scaffold files', () => {
  it('ZIP contains index.html', async () => {
    const zip = await getCodeZip()
    expect(zip.files['BitmapForge-export/index.html']).toBeDefined()
  })

  it('ZIP contains animation.js', async () => {
    const zip = await getCodeZip()
    expect(zip.files['BitmapForge-export/animation.js']).toBeDefined()
  })

  it('ZIP contains config.js', async () => {
    const zip = await getCodeZip()
    expect(zip.files['BitmapForge-export/config.js']).toBeDefined()
  })

  it('ZIP contains package.json', async () => {
    const zip = await getCodeZip()
    expect(zip.files['BitmapForge-export/package.json']).toBeDefined()
  })

  it('ZIP contains README.md', async () => {
    const zip = await getCodeZip()
    expect(zip.files['BitmapForge-export/README.md']).toBeDefined()
  })

  it('ZIP contains vite.config.js', async () => {
    const zip = await getCodeZip()
    expect(zip.files['BitmapForge-export/vite.config.js']).toBeDefined()
  })
})

describe('buildCodeZip — engine sources', () => {
  it('ZIP contains 35 engine source files', async () => {
    const zip = await getCodeZip()
    const engineFiles = Object.keys(zip.files).filter((p) => p.includes('/engine/') && !p.endsWith('/'))
    expect(engineFiles).toHaveLength(41)
  })

  it('ZIP contains engine/SceneManager.js', async () => {
    const zip = await getCodeZip()
    expect(zip.files['BitmapForge-export/engine/SceneManager.js']).toBeDefined()
  })
})

describe('buildCodeZip — animation.js model flow', () => {
  it('animation.js uses fetch() to load the model', async () => {
    const zip = await getCodeZip()
    const src = await zip.files['BitmapForge-export/animation.js'].async('string')
    expect(src).toContain('fetch(')
  })

  it('animation.js wraps blob in new File()', async () => {
    const zip = await getCodeZip()
    const src = await zip.files['BitmapForge-export/animation.js'].async('string')
    expect(src).toContain('new File(')
  })
})

// Execute the body extracted from the actual ZIP, replacing only module imports.
async function runGeneratedRuntime(width = 640, height = 480) {
  const zip = await getCodeZip()
  const source = await zip.file('BitmapForge-export/animation.js').async('string')
  const dimensions = { width, height }
  const reads = vi.fn()
  const container = {
    get clientWidth() {
      reads()
      return dimensions.width
    },
    get clientHeight() {
      reads()
      return dimensions.height
    }
  }
  const manager = { setSize: vi.fn(), dispose: vi.fn(), loadModel: vi.fn() }
  const SceneManager = vi.fn(function () {
    return manager
  })
  const observer = { observe: vi.fn(), disconnect: vi.fn() }
  let notify
  const ResizeObserver = vi.fn(function (callback) {
    notify = callback
    return observer
  })
  const window = { addEventListener: vi.fn(), removeEventListener: vi.fn() }
  let resolveFetch
  const fetch = vi.fn(
    () =>
      new Promise((resolve) => {
        resolveFetch = resolve
      })
  )
  const config = { effectOptions: {} }
  const document = { getElementById: vi.fn(() => container) }
  new Function(
    'SceneManager',
    'config',
    'document',
    'ResizeObserver',
    'window',
    'fetch',
    'File',
    source.replace(/^import .*\n/gm, '')
  )(SceneManager, config, document, ResizeObserver, window, fetch, File)
  const handler = window.addEventListener.mock.calls[0][1]
  return {
    dimensions,
    reads,
    container,
    manager,
    SceneManager,
    ResizeObserver,
    observer,
    window,
    fetch,
    notify: () => notify(),
    handler,
    resize(w, h) {
      dimensions.width = w
      dimensions.height = h
      notify()
    },
    async finishFetch() {
      resolveFetch({ ok: true, blob: () => Promise.resolve(new Blob(['model'])) })
      await vi.waitFor(() => expect(manager.loadModel).toHaveBeenCalledOnce())
    }
  }
}

describe('buildCodeZip — generated sizing and page lifetime', () => {
  it('sizes synchronously before fetch, observes only the container and deduplicates normalized pairs', async () => {
    const r = await runGeneratedRuntime(640.9, 480.9)
    expect(r.SceneManager).toHaveBeenCalledOnce()
    expect(r.ResizeObserver).toHaveBeenCalledOnce()
    expect(r.observer.observe).toHaveBeenCalledExactlyOnceWith(r.container)
    expect(r.manager.setSize).toHaveBeenCalledExactlyOnceWith(640, 480)
    expect(r.manager.setSize.mock.invocationCallOrder[0]).toBeLessThan(r.fetch.mock.invocationCallOrder[0])
    expect(r.fetch).toHaveBeenCalledExactlyOnceWith('./models/model')
    r.notify() // First observer delivery duplicates synchronous sizing.
    r.resize(640.1, 480.1)
    expect(r.manager.setSize).toHaveBeenCalledTimes(1)
    r.resize(800, 480) // Width only.
    r.resize(800, 360) // Height only; no window resize event.
    expect(r.manager.setSize.mock.calls).toEqual([
      [640, 480],
      [800, 480],
      [800, 360]
    ])
  })

  it('allows initially hidden runtime to load before becoming visible', async () => {
    const r = await runGeneratedRuntime(0, 0)
    expect(r.manager.setSize).not.toHaveBeenCalled()
    await r.finishFetch()
    r.resize(640, 480)
    expect(r.manager.setSize).toHaveBeenCalledExactlyOnceWith(640, 480)
    expect(r.manager.loadModel.mock.calls[0][0]).toBeInstanceOf(File)
  })

  it('preserves last valid size across hidden states and applies only changed reveal sizes', async () => {
    const r = await runGeneratedRuntime()
    r.resize(0, 0)
    r.resize(640, 480)
    expect(r.manager.setSize).toHaveBeenCalledTimes(1)
    r.resize(0, 0)
    r.resize(800, 360)
    expect(r.manager.setSize.mock.calls).toEqual([
      [640, 480],
      [800, 360]
    ])
  })

  it.each([0, -1, NaN, Infinity, -Infinity, 0.9])('rejects invalid axis %s without caching it', async (invalid) => {
    for (const [w, h] of [
      [invalid, 480],
      [640, invalid]
    ]) {
      const r = await runGeneratedRuntime(w, h)
      expect(r.manager.setSize).not.toHaveBeenCalled()
      r.resize(640, 480)
      expect(r.manager.setSize).toHaveBeenCalledExactlyOnceWith(640, 480)
    }
  })

  it('removes the identical owned handler and tears down once; stale callbacks do not even measure', async () => {
    const r = await runGeneratedRuntime()
    expect(r.window.addEventListener).toHaveBeenCalledExactlyOnceWith('pagehide', r.handler)
    r.handler({ persisted: false })
    expect(r.window.removeEventListener).toHaveBeenCalledExactlyOnceWith('pagehide', r.handler)
    const reads = r.reads.mock.calls.length
    r.handler({ persisted: false })
    r.resize(900, 600)
    expect(r.reads).toHaveBeenCalledTimes(reads)
    expect(r.manager.setSize).toHaveBeenCalledTimes(1)
    expect(r.observer.disconnect).toHaveBeenCalledOnce()
    expect(r.manager.dispose).toHaveBeenCalledOnce()
  })

  it('keeps persisted pagehide alive through resize, then ordinary teardown', async () => {
    const r = await runGeneratedRuntime()
    r.handler({ persisted: true })
    expect(r.observer.disconnect).not.toHaveBeenCalled()
    expect(r.manager.dispose).not.toHaveBeenCalled()
    expect(r.window.removeEventListener).not.toHaveBeenCalled()
    r.resize(900, 600)
    expect(r.manager.setSize).toHaveBeenLastCalledWith(900, 600)
    r.handler({ persisted: false })
    const reads = r.reads.mock.calls.length
    r.notify()
    expect(r.reads).toHaveBeenCalledTimes(reads)
    expect(r.manager.dispose).toHaveBeenCalledOnce()
  })

  it('does not recreate or resize after teardown while fetch is pending; late load belongs to engine guards', async () => {
    const r = await runGeneratedRuntime()
    r.handler({ persisted: false })
    await r.finishFetch() // Existing fetch chain may invoke loadModel on disposed manager.
    r.resize(900, 600)
    r.handler({ persisted: false })
    expect(r.SceneManager).toHaveBeenCalledOnce()
    expect(r.ResizeObserver).toHaveBeenCalledOnce()
    expect(r.observer.observe).toHaveBeenCalledOnce()
    expect(r.manager.setSize).toHaveBeenCalledExactlyOnceWith(640, 480)
    expect(r.manager.dispose).toHaveBeenCalledOnce()
    expect(r.observer.disconnect).toHaveBeenCalledOnce()
    expect(r.window.removeEventListener).toHaveBeenCalledOnce()
  })
})

describe('buildCodeZip — with model', () => {
  const MODEL_NAME = 'tank.stl'
  const stateWithModel = {
    ...BASE_STATE,
    model: { name: MODEL_NAME, file: new Blob(['binary'], { type: 'model/stl' }) }
  }

  it('includes model file under models/', async () => {
    const zip = await getCodeZip(stateWithModel)
    expect(zip.files[`BitmapForge-export/models/${MODEL_NAME}`]).toBeDefined()
  })

  it('animation.js references the model file name', async () => {
    const zip = await getCodeZip(stateWithModel)
    const src = await zip.files['BitmapForge-export/animation.js'].async('string')
    expect(src).toContain(MODEL_NAME)
  })
})
