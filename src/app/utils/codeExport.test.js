import { describe, it, expect } from 'vitest'
import { createAnimationConfig } from './codeExport.js'

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
