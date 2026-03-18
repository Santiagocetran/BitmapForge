import { describe, it, expect } from 'vitest'
import { ENGINE_SOURCES } from './engineSources.js'

// Required entries — update this list whenever new engine files are added to ENGINE_SOURCES
const REQUIRED_PATHS = [
  'engine/index.js',
  'engine/SceneManager.js',
  'engine/effects/BaseEffect.js',
  'engine/effects/BitmapEffect.js',
  'engine/effects/ditherStrategies.js',
  'engine/effects/fadeVariants/BaseFadeVariant.js',
  'engine/effects/fadeVariants/BloomVariant.js',
  'engine/effects/fadeVariants/CascadeVariant.js',
  'engine/effects/fadeVariants/StaticVariant.js',
  'engine/effects/fadeVariants/GlitchVariant.js',
  'engine/effects/fadeVariants/index.js',
  'engine/renderers/BaseRenderer.js',
  'engine/renderers/BitmapRenderer.js',
  'engine/renderers/PixelArtRenderer.js',
  'engine/renderers/AsciiRenderer.js',
  'engine/renderers/HalftoneRenderer.js',
  'engine/renderers/LedMatrixRenderer.js',
  'engine/renderers/StippleRenderer.js',
  'engine/renderers/index.js',
  'engine/loaders/modelLoader.js',
  'engine/animation/AnimationEngine.js',
  'engine/animation/presets.js',
  'engine/animation/effectTypes.js',
  'engine/utils/seededRandom.js',
  'engine/postprocessing/PostProcessingChain.js',
  'engine/postprocessing/effects/BloomEffect.js',
  'engine/postprocessing/effects/CrtEffect.js',
  'engine/postprocessing/effects/NoiseEffect.js',
  'engine/postprocessing/effects/ColorShiftEffect.js'
]

describe('ENGINE_SOURCES', () => {
  it('exports an array', () => {
    expect(Array.isArray(ENGINE_SOURCES)).toBe(true)
  })

  it(`has ${REQUIRED_PATHS.length} entries`, () => {
    expect(ENGINE_SOURCES).toHaveLength(REQUIRED_PATHS.length)
  })

  it('every entry has a non-empty path and content string', () => {
    for (const entry of ENGINE_SOURCES) {
      expect(typeof entry.path).toBe('string')
      expect(entry.path.length).toBeGreaterThan(0)
      expect(typeof entry.content).toBe('string')
      expect(entry.content.length).toBeGreaterThan(0)
    }
  })

  it('all paths start with engine/', () => {
    for (const entry of ENGINE_SOURCES) {
      expect(entry.path).toMatch(/^engine\//)
    }
  })

  it('no duplicate paths', () => {
    const paths = ENGINE_SOURCES.map((e) => e.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('includes all required engine files', () => {
    const paths = new Set(ENGINE_SOURCES.map((e) => e.path))
    for (const required of REQUIRED_PATHS) {
      expect(paths.has(required), `Missing: ${required}`).toBe(true)
    }
  })

  it('includes all renderer files', () => {
    const rendererFiles = [
      'engine/renderers/BaseRenderer.js',
      'engine/renderers/BitmapRenderer.js',
      'engine/renderers/PixelArtRenderer.js',
      'engine/renderers/AsciiRenderer.js',
      'engine/renderers/HalftoneRenderer.js',
      'engine/renderers/index.js'
    ]
    const paths = new Set(ENGINE_SOURCES.map((e) => e.path))
    for (const f of rendererFiles) {
      expect(paths.has(f), `Missing renderer: ${f}`).toBe(true)
    }
  })

  it('includes all fadeVariant files', () => {
    const fadeFiles = [
      'engine/effects/fadeVariants/BaseFadeVariant.js',
      'engine/effects/fadeVariants/BloomVariant.js',
      'engine/effects/fadeVariants/CascadeVariant.js',
      'engine/effects/fadeVariants/StaticVariant.js',
      'engine/effects/fadeVariants/GlitchVariant.js',
      'engine/effects/fadeVariants/index.js'
    ]
    const paths = new Set(ENGINE_SOURCES.map((e) => e.path))
    for (const f of fadeFiles) {
      expect(paths.has(f), `Missing fadeVariant: ${f}`).toBe(true)
    }
  })

  it('includes animation engine files', () => {
    const animFiles = [
      'engine/animation/AnimationEngine.js',
      'engine/animation/presets.js',
      'engine/animation/effectTypes.js'
    ]
    const paths = new Set(ENGINE_SOURCES.map((e) => e.path))
    for (const f of animFiles) {
      expect(paths.has(f), `Missing animation: ${f}`).toBe(true)
    }
  })

  it('includes shared utilities (ditherStrategies, seededRandom)', () => {
    const paths = new Set(ENGINE_SOURCES.map((e) => e.path))
    expect(paths.has('engine/effects/ditherStrategies.js')).toBe(true)
    expect(paths.has('engine/utils/seededRandom.js')).toBe(true)
  })

  it('content of SceneManager.js mentions SceneManager class', () => {
    const entry = ENGINE_SOURCES.find((e) => e.path === 'engine/SceneManager.js')
    expect(entry.content).toContain('SceneManager')
  })

  it('content of BitmapRenderer.js mentions BitmapRenderer class', () => {
    const entry = ENGINE_SOURCES.find((e) => e.path === 'engine/renderers/BitmapRenderer.js')
    expect(entry.content).toContain('BitmapRenderer')
  })
})
