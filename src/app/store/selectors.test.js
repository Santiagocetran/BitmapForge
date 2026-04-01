import { describe, it, expect } from 'vitest'
import { selectEffectOptions, selectAnimationOptions, selectInputSource } from './selectors.js'

function makeState() {
  return {
    // rendering
    pixelSize: 3,
    ditherType: 'bayer4x4',
    colors: ['#000000', '#ffffff'],
    invert: false,
    minBrightness: 0.05,
    backgroundColor: '#0a0a0a',
    seed: null,
    charRamp: 'classic',
    asciiColored: false,
    halftoneDotShape: 'circle',
    halftoneAngle: 0,
    ledGap: 1,
    ledShape: 'circle',
    stippleDotSize: 2,
    stippleDensity: 3,
    crtEnabled: false,
    scanlineGap: 4,
    scanlineOpacity: 0.3,
    chromaticAberration: 2,
    crtVignette: 0.5,
    noiseEnabled: false,
    noiseAmount: 0.1,
    noiseMonochrome: false,
    colorShiftEnabled: false,
    colorShiftHue: 0,
    colorShiftSaturation: 0,
    // animation
    useFadeInOut: true,
    animationEffects: { spinY: true },
    animationSpeed: 1.0,
    showPhaseDuration: 3000,
    animationDuration: 2500,
    animationPreset: 'spinY',
    rotateOnShow: false,
    showPreset: 'spinY',
    fadeVariant: 'bloom',
    // input source
    inputType: 'model',
    model: null,
    shapeType: 'box',
    shapeParams: {},
    textContent: 'A',
    fontSize: 1,
    extrudeDepth: 0.2,
    bevelEnabled: false,
    fontFamily: 'helvetiker',
    imageSource: null
  }
}

describe('selectEffectOptions', () => {
  it('returns object with all 28 rendering effect fields', () => {
    const result = selectEffectOptions(makeState())
    const keys = [
      'pixelSize',
      'ditherType',
      'colors',
      'invert',
      'minBrightness',
      'backgroundColor',
      'animationDuration',
      'fadeVariant',
      'seed',
      'charRamp',
      'asciiColored',
      'halftoneDotShape',
      'halftoneAngle',
      'ledGap',
      'ledShape',
      'stippleDotSize',
      'stippleDensity',
      'crtEnabled',
      'scanlineGap',
      'scanlineOpacity',
      'chromaticAberration',
      'crtVignette',
      'noiseEnabled',
      'noiseAmount',
      'noiseMonochrome',
      'colorShiftEnabled',
      'colorShiftHue',
      'colorShiftSaturation'
    ]
    for (const key of keys) {
      expect(result).toHaveProperty(key)
    }
    expect(Object.keys(result)).toHaveLength(keys.length)
  })

  it('does not include model, inputType, or animationEffects', () => {
    const result = selectEffectOptions(makeState())
    expect(result).not.toHaveProperty('model')
    expect(result).not.toHaveProperty('inputType')
    expect(result).not.toHaveProperty('animationEffects')
  })
})

describe('selectAnimationOptions', () => {
  it('returns object with all 8 animation fields', () => {
    const result = selectAnimationOptions(makeState())
    const keys = [
      'useFadeInOut',
      'animationEffects',
      'animationSpeed',
      'showPhaseDuration',
      'animationDuration',
      'animationPreset',
      'rotateOnShow',
      'showPreset'
    ]
    for (const key of keys) {
      expect(result).toHaveProperty(key)
    }
    expect(Object.keys(result)).toHaveLength(keys.length)
  })

  it('does not include pixelSize or colors', () => {
    const result = selectAnimationOptions(makeState())
    expect(result).not.toHaveProperty('pixelSize')
    expect(result).not.toHaveProperty('colors')
  })
})

describe('selectInputSource', () => {
  it('returns object with all 10 input source fields', () => {
    const result = selectInputSource(makeState())
    const keys = [
      'inputType',
      'model',
      'shapeType',
      'shapeParams',
      'textContent',
      'fontSize',
      'extrudeDepth',
      'bevelEnabled',
      'fontFamily',
      'imageSource'
    ]
    for (const key of keys) {
      expect(result).toHaveProperty(key)
    }
    expect(Object.keys(result)).toHaveLength(keys.length)
  })

  it('does not include pixelSize or animationEffects', () => {
    const result = selectInputSource(makeState())
    expect(result).not.toHaveProperty('pixelSize')
    expect(result).not.toHaveProperty('animationEffects')
  })
})
