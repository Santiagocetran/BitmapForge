import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { createAnimationConfig, buildCodeZip } from './codeExport.js'

describe('createAnimationConfig', () => {
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
    lightDirection: { x: 3, y: 4, z: 5 }
  }

  it('returns string containing export const config', () => {
    const result = createAnimationConfig(mockState)
    expect(result).toContain('export const config')
  })

  it('output contains expected keys from state', () => {
    const result = createAnimationConfig(mockState)
    expect(result).toContain('pixelSize')
    expect(result).toContain('animationSpeed')
    expect(result).toContain('lightDirection')
    expect(result).toContain('ditherType')
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
  it('ZIP contains 14 engine source files', async () => {
    const zip = await getCodeZip()
    const engineFiles = Object.keys(zip.files).filter((p) => p.includes('/engine/') && !p.endsWith('/'))
    expect(engineFiles).toHaveLength(14)
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
