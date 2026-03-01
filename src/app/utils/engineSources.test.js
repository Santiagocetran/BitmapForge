import { describe, it, expect } from 'vitest'
import { ENGINE_SOURCES } from './engineSources.js'

describe('ENGINE_SOURCES', () => {
  it('exports an array', () => {
    expect(Array.isArray(ENGINE_SOURCES)).toBe(true)
  })

  it('has 14 entries', () => {
    expect(ENGINE_SOURCES).toHaveLength(14)
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

  it('includes engine/index.js', () => {
    expect(ENGINE_SOURCES.some((e) => e.path === 'engine/index.js')).toBe(true)
  })

  it('includes engine/SceneManager.js', () => {
    expect(ENGINE_SOURCES.some((e) => e.path === 'engine/SceneManager.js')).toBe(true)
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
    for (const f of fadeFiles) {
      expect(ENGINE_SOURCES.some((e) => e.path === f)).toBe(true)
    }
  })

  it('includes animation engine files', () => {
    const animFiles = [
      'engine/animation/AnimationEngine.js',
      'engine/animation/presets.js',
      'engine/animation/effectTypes.js'
    ]
    for (const f of animFiles) {
      expect(ENGINE_SOURCES.some((e) => e.path === f)).toBe(true)
    }
  })

  it('content of SceneManager.js mentions SceneManager class', () => {
    const entry = ENGINE_SOURCES.find((e) => e.path === 'engine/SceneManager.js')
    expect(entry.content).toContain('SceneManager')
  })
})
