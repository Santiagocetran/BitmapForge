import { describe, it, expect } from 'vitest'
import { buildExportConfig } from './exportConfig.js'

function makeState(overrides = {}) {
  return {
    colors: ['#000000', '#ffffff'],
    pixelSize: 3,
    ditherType: 'bayer4x4',
    invert: false,
    minBrightness: 0.05,
    backgroundColor: '#0a0a0a',
    animationDuration: 2500,
    fadeVariant: 'cascade',
    renderMode: 'bitmap',
    model: null,
    useFadeInOut: true,
    animationEffects: { spinY: true },
    animationPreset: 'spinY',
    animationSpeed: 1.0,
    showPhaseDuration: 3000,
    lightDirection: { x: 0, y: 1, z: 0 },
    baseRotation: { x: 0, y: 0, z: 0 },
    rotateOnShow: false,
    showPreset: 'spinY',
    ...overrides
  }
}

describe('buildExportConfig', () => {
  it('returns an object with effectOptions', () => {
    const config = buildExportConfig(makeState())
    expect(config.effectOptions).toBeDefined()
    expect(typeof config.effectOptions).toBe('object')
  })

  it('effectOptions contains all required fields', () => {
    const config = buildExportConfig(makeState())
    const eo = config.effectOptions
    expect(eo).toHaveProperty('colors')
    expect(eo).toHaveProperty('pixelSize')
    expect(eo).toHaveProperty('ditherType')
    expect(eo).toHaveProperty('invert')
    expect(eo).toHaveProperty('minBrightness')
    expect(eo).toHaveProperty('backgroundColor')
    expect(eo).toHaveProperty('animationDuration')
    expect(eo).toHaveProperty('fadeVariant')
    expect(eo).toHaveProperty('renderMode')
  })

  it('top-level config has all animation and model fields', () => {
    const config = buildExportConfig(makeState())
    expect(config).toHaveProperty('modelFileName')
    expect(config).toHaveProperty('useFadeInOut')
    expect(config).toHaveProperty('animationEffects')
    expect(config).toHaveProperty('animationPreset')
    expect(config).toHaveProperty('animationSpeed')
    expect(config).toHaveProperty('showPhaseDuration')
    expect(config).toHaveProperty('lightDirection')
    expect(config).toHaveProperty('baseRotation')
    expect(config).toHaveProperty('rotateOnShow')
    expect(config).toHaveProperty('showPreset')
  })

  it('modelFileName is null when model is null', () => {
    const config = buildExportConfig(makeState({ model: null }))
    expect(config.modelFileName).toBeNull()
  })

  it('modelFileName is model.name when model is present', () => {
    const config = buildExportConfig(makeState({ model: { name: 'robot.glb' } }))
    expect(config.modelFileName).toBe('robot.glb')
  })

  it('renderMode defaults to "bitmap" when state.renderMode is undefined', () => {
    const state = makeState()
    delete state.renderMode
    const config = buildExportConfig(state)
    expect(config.effectOptions.renderMode).toBe('bitmap')
  })

  it.each(['classic', 'blocks', 'dense', 'minimal'])(
    'preserves named ASCII ramp %s and both colored modes',
    (charRamp) => {
      for (const asciiColored of [true, false]) {
        const state = makeState({ renderMode: 'ascii', charRamp, asciiColored })
        expect(buildExportConfig(state).effectOptions).toMatchObject({
          renderMode: 'ascii',
          charRamp,
          asciiColored
        })
      }
    }
  )

  it.each([undefined, null])('defaults absent/null legacy ASCII fields (%s)', (value) => {
    const state = makeState({ charRamp: value, asciiColored: value })
    expect(buildExportConfig(state).effectOptions).toMatchObject({ charRamp: 'classic', asciiColored: false })
    expect(buildExportConfig(makeState()).effectOptions).toMatchObject({ charRamp: 'classic', asciiColored: false })
  })

  it.each(['unknown-ramp', ''])('leaves unknown ramp %j for the renderer fallback', (charRamp) => {
    expect(buildExportConfig(makeState({ charRamp })).effectOptions.charRamp).toBe(charRamp)
  })

  it('changes only the two ASCII options and does not mutate the input', () => {
    const state = makeState({ renderMode: 'ascii', charRamp: 'dense', asciiColored: false })
    const before = structuredClone(state)
    Object.freeze(state.colors)
    Object.freeze(state.animationEffects)
    Object.freeze(state)
    const { charRamp, asciiColored, ...options } = buildExportConfig(state).effectOptions
    expect({ charRamp, asciiColored }).toEqual({ charRamp: 'dense', asciiColored: false })
    expect(options).toEqual({
      colors: state.colors,
      pixelSize: 3,
      ditherType: 'bayer4x4',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#0a0a0a',
      animationDuration: 2500,
      fadeVariant: 'cascade',
      renderMode: 'ascii'
    })
    const { effectOptions: _effectOptions, ...rest } = buildExportConfig(state)
    expect(rest).toEqual({
      modelFileName: null,
      useFadeInOut: state.useFadeInOut,
      animationEffects: state.animationEffects,
      animationPreset: state.animationPreset,
      animationSpeed: state.animationSpeed,
      showPhaseDuration: state.showPhaseDuration,
      lightDirection: state.lightDirection,
      baseRotation: state.baseRotation,
      rotateOnShow: state.rotateOnShow,
      showPreset: state.showPreset
    })
    expect(state).toEqual(before)
  })

  it('is a pure function — calling twice returns equivalent objects', () => {
    const state = makeState()
    const c1 = buildExportConfig(state)
    const c2 = buildExportConfig(state)
    expect(JSON.stringify(c1)).toBe(JSON.stringify(c2))
  })
})
