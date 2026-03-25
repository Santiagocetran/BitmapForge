import { describe, it, expect, vi, beforeEach } from 'vitest'
import JSZip from 'jszip'

// Mock import.meta.env
vi.stubEnv('BASE_URL', '/')

// Mock fetch
const FAKE_SDK = 'export function defineBitmapForgeElement(){}'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(FAKE_SDK)
    })
  )
})

// Helper to load the ZIP
async function getEmbedZip(state = BASE_STATE) {
  const { buildEmbedZip } = await import('./embedExport.js')
  const blob = await buildEmbedZip(state)
  return JSZip.loadAsync(blob)
}

const BASE_STATE = {
  colors: ['#000', '#fff'],
  pixelSize: 3,
  ditherType: 'bayer4x4',
  invert: false,
  minBrightness: 0.05,
  backgroundColor: '#0a0a0a',
  renderMode: 'bitmap',
  crtEnabled: false,
  inputType: 'model',
  shapeType: 'cube',
  shapeParams: {},
  stippleDotSize: 2,
  stippleDensity: 3,
  animationEffects: {},
  animationSpeed: 1.0,
  animationDuration: 2500,
  showPhaseDuration: 3000,
  lightDirection: { x: 3, y: 4, z: 5 },
  baseRotation: { x: 0, y: 0, z: 0 },
  seed: null,
  model: null
}

describe('buildEmbedZip — return value', () => {
  it('returns a Blob', async () => {
    const { buildEmbedZip } = await import('./embedExport.js')
    const blob = await buildEmbedZip(BASE_STATE)
    expect(blob).toBeInstanceOf(Blob)
  })
})

describe('buildEmbedZip — ZIP contents', () => {
  it('contains exactly 3 expected files', async () => {
    const zip = await getEmbedZip()
    const files = Object.keys(zip.files).filter((f) => !zip.files[f].dir)
    expect(files).toHaveLength(3)
    expect(files).toContain('my-animation/bitmap-forge.es.js')
    expect(files).toContain('my-animation/animation.bforge')
    expect(files).toContain('my-animation/index.html')
  })

  it('bitmap-forge.es.js contains the SDK content', async () => {
    const zip = await getEmbedZip()
    const content = await zip.file('my-animation/bitmap-forge.es.js').async('string')
    expect(content).toBe(FAKE_SDK)
  })
})

describe('buildEmbedZip — animation.bforge', () => {
  it('is valid JSON parseable by parseProjectData', async () => {
    const { parseProjectData } = await import('./projectFile.js')
    const zip = await getEmbedZip()
    const raw = await zip.file('my-animation/animation.bforge').async('string')
    expect(() => parseProjectData(raw)).not.toThrow()
  })

  it('contains renderMode, crtEnabled, inputType (previously missing fields)', async () => {
    const zip = await getEmbedZip()
    const raw = await zip.file('my-animation/animation.bforge').async('string')
    const parsed = JSON.parse(raw)
    expect(parsed.settings).toHaveProperty('renderMode')
    expect(parsed.settings).toHaveProperty('crtEnabled')
    expect(parsed.settings).toHaveProperty('inputType')
  })

  it('contains stippleDotSize and shapeType', async () => {
    const zip = await getEmbedZip()
    const raw = await zip.file('my-animation/animation.bforge').async('string')
    const parsed = JSON.parse(raw)
    expect(parsed.settings).toHaveProperty('stippleDotSize')
    expect(parsed.settings).toHaveProperty('shapeType')
  })

  it('does not include transient keys (model, imageSource, status)', async () => {
    const zip = await getEmbedZip()
    const raw = await zip.file('my-animation/animation.bforge').async('string')
    const parsed = JSON.parse(raw)
    expect(parsed.settings).not.toHaveProperty('imageSource')
    expect(parsed.settings).not.toHaveProperty('status')
  })
})

describe('buildEmbedZip — index.html (ESM)', () => {
  it('contains <bitmap-forge and animation.bforge', async () => {
    const zip = await getEmbedZip()
    const html = await zip.file('my-animation/index.html').async('string')
    expect(html).toContain('<bitmap-forge')
    expect(html).toContain('animation.bforge')
  })

  it('contains import map with three', async () => {
    const zip = await getEmbedZip()
    const html = await zip.file('my-animation/index.html').async('string')
    expect(html).toContain('importmap')
    expect(html).toContain('"three"')
  })

  it('does not contain three.min.js script tag', async () => {
    const zip = await getEmbedZip()
    const html = await zip.file('my-animation/index.html').async('string')
    expect(html).not.toContain('three.min.js')
  })
})

describe('buildEmbedZip — fetch failure', () => {
  it('throws with message mentioning build:embed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    const { buildEmbedZip } = await import('./embedExport.js')
    await expect(buildEmbedZip(BASE_STATE)).rejects.toThrow('build:embed')
  })
})
