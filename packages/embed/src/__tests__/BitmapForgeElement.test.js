import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BitmapForgeElement, defineBitmapForgeElement } from '../BitmapForgeElement.js'

// --- Hoisted mocks (vi.hoisted runs before vi.mock) ---

const mockManager = vi.hoisted(() => ({
  setSize: vi.fn(),
  loadModel: vi.fn().mockResolvedValue(undefined),
  loadShape: vi.fn(),
  loadText: vi.fn().mockResolvedValue(undefined),
  setRenderMode: vi.fn(),
  updateAnimationOptions: vi.fn(),
  updateEffectOptions: vi.fn(),
  pauseLoop: vi.fn(),
  resumeLoop: vi.fn(),
  dispose: vi.fn()
}))

vi.mock('@engine/SceneManager.js', () => ({
  SceneManager: vi.fn(function () {
    return mockManager
  })
}))

// --- Fixture helpers ---

const makeProject = (overrides = {}) =>
  JSON.stringify({
    version: 2,
    settings: { pixelSize: 8, renderMode: 'bitmap', inputType: 'model', ...overrides.settings },
    model:
      overrides.model !== undefined
        ? overrides.model
        : {
            name: 'test.stl',
            type: 'application/octet-stream',
            format: 'stl',
            data: btoa('fakedata')
          }
  })

function makeElement(attrs = {}) {
  const el = new BitmapForgeElement()
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}

function simulateConnect(el) {
  el.connectedCallback()
}

function simulateDisconnect(el) {
  el.disconnectedCallback()
}

// --- Global stubs ---

let fetchMock

beforeEach(() => {
  // Reset all mock call counts
  Object.values(mockManager).forEach((fn) => fn.mockReset?.())
  mockManager.loadModel.mockResolvedValue(undefined)
  mockManager.loadText.mockResolvedValue(undefined)

  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    text: async () => makeProject()
  })
  globalThis.fetch = fetchMock

  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  }
  globalThis.IntersectionObserver = class {
    constructor(cb) {
      this._cb = cb
    }
    observe() {}
    disconnect() {}
    fire(isIntersecting) {
      this._cb([{ isIntersecting }])
    }
  }

  globalThis.devicePixelRatio = 1
  window.matchMedia = vi.fn(() => ({ matches: false }))
})

afterEach(() => {
  vi.restoreAllMocks()
})

// Register once for the whole file
if (typeof customElements !== 'undefined' && !customElements.get('bitmap-forge')) {
  customElements.define('bitmap-forge', BitmapForgeElement)
}

// --- Tests ---

describe('BitmapForgeElement', () => {
  it('connectedCallback creates shadow DOM with container', () => {
    const el = makeElement({ src: '/test.bforge' })
    simulateConnect(el)
    expect(el._shadow).toBeTruthy()
    expect(el._container).toBeTruthy()
    simulateDisconnect(el)
  })

  it('autoplay attribute triggers _load immediately (no IO)', async () => {
    const loadSpy = vi.spyOn(BitmapForgeElement.prototype, '_load')
    const el = makeElement({ src: '/test.bforge', autoplay: '' })
    simulateConnect(el)
    expect(loadSpy).toHaveBeenCalledTimes(1)
    expect(el._io).toBeUndefined()
    simulateDisconnect(el)
  })

  it('without autoplay, _load is deferred to IntersectionObserver', () => {
    const loadSpy = vi.spyOn(BitmapForgeElement.prototype, '_load')
    const el = makeElement({ src: '/test.bforge' })
    simulateConnect(el)
    expect(loadSpy).not.toHaveBeenCalled()
    expect(el._io).toBeTruthy()
    simulateDisconnect(el)
  })

  it('_load with model type calls loadModel with a File', async () => {
    const el = makeElement({ src: '/test.bforge', autoplay: '' })
    simulateConnect(el)
    await new Promise((r) => setTimeout(r, 10))
    expect(mockManager.loadModel).toHaveBeenCalledWith(expect.any(File))
    const file = mockManager.loadModel.mock.calls[0][0]
    expect(file.name).toBe('test.stl')
    simulateDisconnect(el)
  })

  it('_load with shape type calls loadShape', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        makeProject({
          settings: { inputType: 'shape', shapeType: 'box', shapeParams: {} },
          model: null
        })
    })
    const el = makeElement({ src: '/test.bforge', autoplay: '' })
    simulateConnect(el)
    await new Promise((r) => setTimeout(r, 10))
    expect(mockManager.loadShape).toHaveBeenCalledWith('box', {})
    simulateDisconnect(el)
  })

  it('_load with text type calls loadText', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        makeProject({
          settings: { inputType: 'text', textContent: 'Hi', fontFamily: 'helvetiker' },
          model: null
        })
    })
    const el = makeElement({ src: '/test.bforge', autoplay: '' })
    simulateConnect(el)
    await new Promise((r) => setTimeout(r, 10))
    expect(mockManager.loadText).toHaveBeenCalledWith('Hi', expect.objectContaining({ fontFamily: 'helvetiker' }))
    simulateDisconnect(el)
  })

  it('_load with image type logs a console.warn, no crash', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => makeProject({ settings: { inputType: 'image' }, model: null })
    })
    const el = makeElement({ src: '/test.bforge', autoplay: '' })
    simulateConnect(el)
    await new Promise((r) => setTimeout(r, 10))
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Image input type'))
    simulateDisconnect(el)
  })

  it('_load with bad JSON logs console.error, no crash', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockResolvedValue({ ok: true, text: async () => 'not json' })
    const el = makeElement({ src: '/test.bforge', autoplay: '' })
    simulateConnect(el)
    await new Promise((r) => setTimeout(r, 10))
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[bitmap-forge]'), expect.any(Error))
    simulateDisconnect(el)
  })

  it('_load with HTTP error logs console.error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockResolvedValue({ ok: false, status: 404 })
    const el = makeElement({ src: '/test.bforge', autoplay: '' })
    simulateConnect(el)
    await new Promise((r) => setTimeout(r, 10))
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[bitmap-forge]'), expect.any(Error))
    simulateDisconnect(el)
  })

  it('attributeChangedCallback src change disposes old manager and reloads', async () => {
    const el = makeElement({ src: '/test.bforge', autoplay: '' })
    simulateConnect(el)
    await new Promise((r) => setTimeout(r, 10))

    // Assign a tracked ref before triggering the attribute change
    const disposeRef = mockManager.dispose

    el.attributeChangedCallback('src', '/test.bforge', '/new.bforge')
    expect(disposeRef).toHaveBeenCalled()
    expect(el._manager).toBeNull()

    simulateDisconnect(el)
  })

  it('attributeChangedCallback render-mode calls setRenderMode on existing manager', async () => {
    const el = makeElement({ src: '/test.bforge', autoplay: '' })
    simulateConnect(el)
    await new Promise((r) => setTimeout(r, 10))

    // Manually assign _manager so the guard passes
    el._manager = mockManager
    el.attributeChangedCallback('render-mode', null, 'ascii')
    expect(mockManager.setRenderMode).toHaveBeenCalledWith('ascii')
    simulateDisconnect(el)
  })

  it('disconnectedCallback disposes manager and disconnects observers', async () => {
    const el = makeElement({ src: '/test.bforge', autoplay: '' })
    simulateConnect(el)
    await new Promise((r) => setTimeout(r, 10))

    // Manually assign _manager to ensure it's set before disconnect
    el._manager = mockManager
    const roDisconnectSpy = vi.spyOn(el._ro, 'disconnect')
    simulateDisconnect(el)

    expect(mockManager.dispose).toHaveBeenCalled()
    expect(roDisconnectSpy).toHaveBeenCalled()
    expect(el._manager).toBeNull()
  })

  it('prefers-reduced-motion suppresses autoplay', () => {
    window.matchMedia = vi.fn(() => ({ matches: true }))
    const loadSpy = vi.spyOn(BitmapForgeElement.prototype, '_load')
    const el = makeElement({ src: '/test.bforge', autoplay: '' })
    simulateConnect(el)
    expect(loadSpy).not.toHaveBeenCalled()
    // IO is set up instead
    expect(el._io).toBeTruthy()
    simulateDisconnect(el)
  })
})

describe('defineBitmapForgeElement', () => {
  it('is idempotent — no double-define error', () => {
    expect(() => {
      defineBitmapForgeElement('bitmap-forge')
      defineBitmapForgeElement('bitmap-forge')
    }).not.toThrow()
  })

  it('is a no-op in SSR (customElements undefined)', () => {
    const orig = globalThis.customElements
    delete globalThis.customElements
    expect(() => defineBitmapForgeElement()).not.toThrow()
    globalThis.customElements = orig
  })
})
