import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PluginRegistry, pluginRegistry } from './PluginRegistry.js'
import { registerBuiltins } from './builtinPlugins.js'
import { createRenderer } from '../renderers/index.js'

// ---------------------------------------------------------------------------
// Helpers — stub classes for isolated tests
// ---------------------------------------------------------------------------

class StubRenderer {
  render() {}
  drawPixel() {}
}

class StubEffect {
  apply() {}
}

// ---------------------------------------------------------------------------
// PluginRegistry — isolated instance (not the global singleton)
// ---------------------------------------------------------------------------

describe('PluginRegistry — registerRenderer', () => {
  let reg

  beforeEach(() => {
    reg = new PluginRegistry()
  })

  it('registerRenderer → getRenderer round-trip returns the same class', () => {
    reg.registerRenderer('test', StubRenderer, { label: 'Test', schema: { foo: { type: 'boolean' } } })
    const entry = reg.getRenderer('test')
    expect(entry.RendererClass).toBe(StubRenderer)
    expect(entry.label).toBe('Test')
    expect(entry.schema.foo.type).toBe('boolean')
  })

  it('throws when registering a duplicate renderer id', () => {
    reg.registerRenderer('dup', StubRenderer)
    expect(() => reg.registerRenderer('dup', StubRenderer)).toThrow(/already registered/)
  })

  it('defaults label to id when not provided', () => {
    reg.registerRenderer('myId', StubRenderer)
    expect(reg.getRenderer('myId').label).toBe('myId')
  })

  it('defaults schema to empty object when not provided', () => {
    reg.registerRenderer('noSchema', StubRenderer)
    expect(reg.getRenderer('noSchema').schema).toEqual({})
  })

  it('returns undefined for unknown renderer', () => {
    expect(reg.getRenderer('unknown')).toBeUndefined()
  })
})

describe('PluginRegistry — listRenderers', () => {
  it('returns an array of { id, label, schema } objects', () => {
    const reg = new PluginRegistry()
    reg.registerRenderer('a', StubRenderer, { label: 'A', schema: { x: { type: 'integer' } } })
    reg.registerRenderer('b', StubRenderer, { label: 'B' })

    const list = reg.listRenderers()
    expect(list).toHaveLength(2)
    expect(list[0]).toMatchObject({ id: 'a', label: 'A', schema: { x: { type: 'integer' } } })
    expect(list[1]).toMatchObject({ id: 'b', label: 'B', schema: {} })
  })

  it('preserves insertion order', () => {
    const reg = new PluginRegistry()
    reg.registerRenderer('first', StubRenderer)
    reg.registerRenderer('second', StubRenderer)
    reg.registerRenderer('third', StubRenderer)

    const ids = reg.listRenderers().map((r) => r.id)
    expect(ids).toEqual(['first', 'second', 'third'])
  })
})

describe('PluginRegistry — registerPostEffect', () => {
  let reg

  beforeEach(() => {
    reg = new PluginRegistry()
  })

  it('registerPostEffect → getPostEffect round-trip returns the same class', () => {
    reg.registerPostEffect('glow', StubEffect, { label: 'Glow', schema: { intensity: { type: 'number' } } })
    const entry = reg.getPostEffect('glow')
    expect(entry.EffectClass).toBe(StubEffect)
    expect(entry.label).toBe('Glow')
    expect(entry.schema.intensity.type).toBe('number')
  })

  it('throws when registering a duplicate post-effect id', () => {
    reg.registerPostEffect('dup', StubEffect)
    expect(() => reg.registerPostEffect('dup', StubEffect)).toThrow(/already registered/)
  })

  it('returns undefined for unknown post-effect', () => {
    expect(reg.getPostEffect('unknown')).toBeUndefined()
  })
})

describe('PluginRegistry — listPostEffects', () => {
  it('returns an array of { id, label, schema } objects', () => {
    const reg = new PluginRegistry()
    reg.registerPostEffect('fx1', StubEffect, { label: 'FX 1' })
    reg.registerPostEffect('fx2', StubEffect, { label: 'FX 2', schema: { y: { type: 'boolean' } } })

    const list = reg.listPostEffects()
    expect(list).toHaveLength(2)
    expect(list[0]).toMatchObject({ id: 'fx1', label: 'FX 1' })
    expect(list[1]).toMatchObject({ id: 'fx2', label: 'FX 2', schema: { y: { type: 'boolean' } } })
  })
})

// ---------------------------------------------------------------------------
// pluginRegistry global singleton
// ---------------------------------------------------------------------------

describe('pluginRegistry — global singleton', () => {
  it('is a PluginRegistry instance', () => {
    expect(pluginRegistry).toBeInstanceOf(PluginRegistry)
  })
})

// ---------------------------------------------------------------------------
// registerBuiltins()
// ---------------------------------------------------------------------------

describe('registerBuiltins()', () => {
  beforeEach(() => {
    // Reset registry state so each test starts fresh
    pluginRegistry._renderers.clear()
    pluginRegistry._postEffects.clear()
    pluginRegistry._registered = false
  })

  afterEach(() => {
    // Re-register builtins so other tests that depend on the registry still work
    pluginRegistry._renderers.clear()
    pluginRegistry._postEffects.clear()
    pluginRegistry._registered = false
    registerBuiltins()
  })

  it('registers all 6 built-in renderers without throwing', () => {
    expect(() => registerBuiltins()).not.toThrow()
    const ids = pluginRegistry.listRenderers().map((r) => r.id)
    expect(ids).toContain('bitmap')
    expect(ids).toContain('pixelArt')
    expect(ids).toContain('ascii')
    expect(ids).toContain('halftone')
    expect(ids).toContain('ledMatrix')
    expect(ids).toContain('stipple')
    expect(ids).toHaveLength(6)
  })

  it('registers all 3 built-in post-effects without throwing', () => {
    registerBuiltins()
    const ids = pluginRegistry.listPostEffects().map((e) => e.id)
    expect(ids).toContain('crt')
    expect(ids).toContain('noise')
    expect(ids).toContain('colorShift')
    expect(ids).toHaveLength(3)
  })

  it('second call to registerBuiltins() is a no-op (idempotent)', () => {
    registerBuiltins()
    expect(() => registerBuiltins()).not.toThrow()
    expect(pluginRegistry.listRenderers()).toHaveLength(6)
  })

  it('each renderer has a non-empty schema', () => {
    registerBuiltins()
    for (const { id, schema } of pluginRegistry.listRenderers()) {
      expect(Object.keys(schema).length, `schema for "${id}" should be non-empty`).toBeGreaterThan(0)
    }
  })

  it('each post-effect has a non-empty schema', () => {
    registerBuiltins()
    for (const { id, schema } of pluginRegistry.listPostEffects()) {
      expect(Object.keys(schema).length, `schema for "${id}" should be non-empty`).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// createRenderer() fallthrough to plugin registry
// ---------------------------------------------------------------------------

describe('createRenderer() — plugin registry fallthrough', () => {
  beforeEach(() => {
    pluginRegistry._renderers.clear()
    pluginRegistry._postEffects.clear()
    pluginRegistry._registered = false
    registerBuiltins()
  })

  afterEach(() => {
    // Clean up any extra renderers registered during tests
    pluginRegistry._renderers.clear()
    pluginRegistry._postEffects.clear()
    pluginRegistry._registered = false
    registerBuiltins()
  })

  it('throws for truly unknown mode (not in built-in map, not in registry)', () => {
    expect(() => createRenderer('nonExistent')).toThrow(/Unknown render mode/)
  })

  it('creates instance for a plugin-registered mode', () => {
    pluginRegistry.registerRenderer('blueprint', StubRenderer, { label: 'Blueprint' })
    const instance = createRenderer('blueprint')
    expect(instance).toBeInstanceOf(StubRenderer)
  })

  it('still creates built-in renderers via direct map (no regression)', () => {
    const r = createRenderer('bitmap')
    expect(r).toBeDefined()
    expect(typeof r.render).toBe('function')
  })
})
