import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { buildWebComponent } from './webComponentExport.js'

const BASE_STATE = {
  colors: ['#000000', '#ffffff'],
  pixelSize: 3,
  ditherType: 'bayer4x4',
  invert: false,
  minBrightness: 0.05,
  backgroundColor: '#0a0a0a',
  animationDuration: 2500,
  fadeVariant: 'bloom',
  useFadeInOut: true,
  animationEffects: { spinX: false, spinY: true, spinZ: false, float: false },
  animationSpeed: 1.0,
  showPhaseDuration: 3000,
  lightDirection: { x: 3, y: 4, z: 5 },
  baseRotation: { x: 0, y: 0, z: 0 },
  rotateOnShow: false,
  showPreset: 'spinY',
  model: null
}

async function getZip(state = BASE_STATE, elementName = 'bitmap-animation') {
  const blob = await buildWebComponent(state, elementName)
  return JSZip.loadAsync(blob)
}

// ─── ZIP structure ────────────────────────────────────────────────────────────

describe('buildWebComponent — ZIP structure', () => {
  it('resolves to a Blob', async () => {
    const blob = await buildWebComponent(BASE_STATE)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('ZIP contains the JS file named after the element', async () => {
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

  it('ZIP contains engine/SceneManager.js', async () => {
    const zip = await getZip()
    expect(zip.files['bitmap-animation/engine/SceneManager.js']).toBeDefined()
  })

  it('ZIP contains 14 engine source files', async () => {
    const zip = await getZip()
    const engineFiles = Object.keys(zip.files).filter((p) => p.includes('/engine/') && !p.endsWith('/'))
    expect(engineFiles).toHaveLength(14)
  })

  it('uses custom element name for folder and file', async () => {
    const zip = await getZip(BASE_STATE, 'my-widget')
    expect(zip.files['my-widget/my-widget.js']).toBeDefined()
  })
})

// ─── No model loaded ──────────────────────────────────────────────────────────

describe('buildWebComponent — no model', () => {
  it('does not include an assets folder', async () => {
    const zip = await getZip()
    const assetFiles = Object.keys(zip.files).filter((p) => p.includes('/assets/'))
    expect(assetFiles).toHaveLength(0)
  })

  it('config.js has modelFileName: null', async () => {
    const zip = await getZip()
    const config = await zip.files['bitmap-animation/config.js'].async('string')
    expect(config).toContain('"modelFileName": null')
  })

  it('component JS does not contain new URL when no model', async () => {
    const zip = await getZip()
    const js = await zip.files['bitmap-animation/bitmap-animation.js'].async('string')
    expect(js).not.toContain('new URL')
  })
})

// ─── With model loaded ────────────────────────────────────────────────────────

describe('buildWebComponent — with model', () => {
  const MODEL_NAME = 'widget.glb'
  const stateWithModel = {
    ...BASE_STATE,
    model: { name: MODEL_NAME, file: new Blob(['binary'], { type: 'model/gltf-binary' }) }
  }

  it('includes model file in assets/', async () => {
    const zip = await getZip(stateWithModel)
    expect(zip.files[`bitmap-animation/assets/${MODEL_NAME}`]).toBeDefined()
  })

  it('config.js has the model file name', async () => {
    const zip = await getZip(stateWithModel)
    const config = await zip.files['bitmap-animation/config.js'].async('string')
    expect(config).toContain(MODEL_NAME)
  })

  it('component JS contains a static URL literal for the model', async () => {
    const zip = await getZip(stateWithModel)
    const js = await zip.files['bitmap-animation/bitmap-animation.js'].async('string')
    expect(js).toContain(`'./assets/${MODEL_NAME}'`)
  })
})

// ─── Generated component JS content ──────────────────────────────────────────

describe('buildWebComponent — component JS content', () => {
  async function getJs(elementName = 'bitmap-animation') {
    const zip = await getZip(BASE_STATE, elementName)
    return zip.files[`${elementName}/${elementName}.js`].async('string')
  }

  it('imports SceneManager from engine', async () => {
    const js = await getJs()
    expect(js).toContain("from './engine/SceneManager.js'")
  })

  it('imports config', async () => {
    const js = await getJs()
    expect(js).toContain("from './config.js'")
  })

  it('uses attachShadow for shadow DOM', async () => {
    const js = await getJs()
    expect(js).toContain('attachShadow')
  })

  it('defines connectedCallback', async () => {
    const js = await getJs()
    expect(js).toContain('connectedCallback()')
  })

  it('defines disconnectedCallback', async () => {
    const js = await getJs()
    expect(js).toContain('disconnectedCallback()')
  })

  it('disconnectedCallback calls destroy()', async () => {
    const js = await getJs()
    const dcIdx = js.indexOf('disconnectedCallback()')
    const destroyIdx = js.indexOf('destroy()', dcIdx)
    expect(destroyIdx).toBeGreaterThan(dcIdx)
  })

  it('uses customElements.define with the element name', async () => {
    const js = await getJs('my-anim')
    expect(js).toContain("customElements.define('my-anim'")
  })

  it('guards customElements.define to avoid re-registration', async () => {
    const js = await getJs()
    expect(js).toContain('customElements.get(')
  })

  it('calls updateAnimationOptions', async () => {
    const js = await getJs()
    expect(js).toContain('updateAnimationOptions')
  })

  it('calls setLightDirection', async () => {
    const js = await getJs()
    expect(js).toContain('setLightDirection')
  })

  it('calls setBaseRotation', async () => {
    const js = await getJs()
    expect(js).toContain('setBaseRotation')
  })

  it('includes :host CSS for display:block', async () => {
    const js = await getJs()
    expect(js).toContain(':host')
    expect(js).toContain('display: block')
  })

  it('observes element resize with ResizeObserver', async () => {
    const js = await getJs()
    expect(js).toContain('ResizeObserver')
  })
})

// ─── README content ───────────────────────────────────────────────────────────

describe('buildWebComponent — README content', () => {
  it('mentions importmap for three.js in plain HTML usage', async () => {
    const zip = await getZip()
    const readme = await zip.files['bitmap-animation/README.md'].async('string')
    expect(readme).toContain('importmap')
  })

  it('mentions the element name', async () => {
    const zip = await getZip()
    const readme = await zip.files['bitmap-animation/README.md'].async('string')
    expect(readme).toContain('bitmap-animation')
  })
})
