import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { buildReactComponent } from './reactComponentExport.js'

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

async function getZip(state = BASE_STATE, componentName = 'MyAnimation') {
  const blob = await buildReactComponent(state, componentName)
  return JSZip.loadAsync(blob)
}

// ─── ZIP structure ────────────────────────────────────────────────────────────

describe('buildReactComponent — ZIP structure', () => {
  it('resolves to a Blob', async () => {
    const blob = await buildReactComponent(BASE_STATE)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('ZIP contains index.jsx inside the component folder', async () => {
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

  it('ZIP contains engine/index.js', async () => {
    const zip = await getZip()
    expect(zip.files['MyAnimation/engine/index.js']).toBeDefined()
  })

  it('ZIP contains engine/SceneManager.js', async () => {
    const zip = await getZip()
    expect(zip.files['MyAnimation/engine/SceneManager.js']).toBeDefined()
  })

  it('ZIP contains 14 engine source files', async () => {
    const zip = await getZip()
    const engineFiles = Object.keys(zip.files).filter((p) => p.includes('/engine/') && !p.endsWith('/'))
    expect(engineFiles).toHaveLength(14)
  })

  it('uses custom component name for folder', async () => {
    const zip = await getZip(BASE_STATE, 'BobAnimation')
    expect(zip.files['BobAnimation/index.jsx']).toBeDefined()
  })
})

// ─── No model loaded ──────────────────────────────────────────────────────────

describe('buildReactComponent — no model', () => {
  it('does not include an assets folder', async () => {
    const zip = await getZip()
    const assetFiles = Object.keys(zip.files).filter((p) => p.includes('/assets/'))
    expect(assetFiles).toHaveLength(0)
  })

  it('config.js has modelFileName: null', async () => {
    const zip = await getZip()
    const config = await zip.files['MyAnimation/config.js'].async('string')
    expect(config).toContain('"modelFileName": null')
  })

  it('index.jsx does not contain new URL when no model', async () => {
    const zip = await getZip()
    const jsx = await zip.files['MyAnimation/index.jsx'].async('string')
    expect(jsx).not.toContain('new URL')
  })
})

// ─── With model loaded ────────────────────────────────────────────────────────

describe('buildReactComponent — with model', () => {
  const MODEL_NAME = 'my-model.glb'
  const stateWithModel = {
    ...BASE_STATE,
    model: { name: MODEL_NAME, file: new Blob(['binary'], { type: 'model/gltf-binary' }) }
  }

  it('includes model file in assets/', async () => {
    const zip = await getZip(stateWithModel)
    expect(zip.files[`MyAnimation/assets/${MODEL_NAME}`]).toBeDefined()
  })

  it('config.js has the model file name', async () => {
    const zip = await getZip(stateWithModel)
    const config = await zip.files['MyAnimation/config.js'].async('string')
    expect(config).toContain(MODEL_NAME)
  })

  it('index.jsx contains a static URL literal for the model', async () => {
    const zip = await getZip(stateWithModel)
    const jsx = await zip.files['MyAnimation/index.jsx'].async('string')
    // The URL string must contain the literal filename — not a variable
    expect(jsx).toContain(`'./assets/${MODEL_NAME}'`)
  })
})

// ─── Generated index.jsx content ─────────────────────────────────────────────

describe('buildReactComponent — index.jsx content', () => {
  async function getJsx() {
    const zip = await getZip()
    return zip.files['MyAnimation/index.jsx'].async('string')
  }

  it('exports a default function component', async () => {
    const jsx = await getJsx()
    expect(jsx).toContain('export default function MyAnimation')
  })

  it('imports SceneManager from engine', async () => {
    const jsx = await getJsx()
    expect(jsx).toContain("from './engine/SceneManager.js'")
  })

  it('imports config', async () => {
    const jsx = await getJsx()
    expect(jsx).toContain("from './config.js'")
  })

  it('includes StrictMode guard (managerRef.current early return)', async () => {
    const jsx = await getJsx()
    expect(jsx).toContain('if (managerRef.current) return')
  })

  it('calls requestAnimationFrame before setSize', async () => {
    const jsx = await getJsx()
    const rafIdx = jsx.indexOf('requestAnimationFrame')
    const setSizeIdx = jsx.indexOf('setSize')
    expect(rafIdx).toBeGreaterThan(-1)
    expect(setSizeIdx).toBeGreaterThan(rafIdx)
  })

  it('cleans up by calling destroy() in effect teardown', async () => {
    const jsx = await getJsx()
    expect(jsx).toContain('destroy()')
  })

  it('sets managerRef.current to null on cleanup', async () => {
    const jsx = await getJsx()
    expect(jsx).toContain('managerRef.current = null')
  })

  it('calls updateAnimationOptions', async () => {
    const jsx = await getJsx()
    expect(jsx).toContain('updateAnimationOptions')
  })

  it('calls setLightDirection', async () => {
    const jsx = await getJsx()
    expect(jsx).toContain('setLightDirection')
  })

  it('calls setBaseRotation', async () => {
    const jsx = await getJsx()
    expect(jsx).toContain('setBaseRotation')
  })
})

// ─── Generated config.js content ─────────────────────────────────────────────

describe('buildReactComponent — config.js content', () => {
  async function getConfig() {
    const zip = await getZip()
    return zip.files['MyAnimation/config.js'].async('string')
  }

  it('exports a config object', async () => {
    const config = await getConfig()
    expect(config).toContain('export const config')
  })

  it('contains effectOptions', async () => {
    const config = await getConfig()
    expect(config).toContain('effectOptions')
  })

  it('contains animationEffects', async () => {
    const config = await getConfig()
    expect(config).toContain('animationEffects')
  })

  it('contains lightDirection', async () => {
    const config = await getConfig()
    expect(config).toContain('lightDirection')
  })

  it('contains baseRotation', async () => {
    const config = await getConfig()
    expect(config).toContain('baseRotation')
  })

  it('serializes state values from input', async () => {
    const config = await getConfig()
    expect(config).toContain('"pixelSize": 3')
  })
})
