import { describe, it, expect } from 'vitest'
import { DITHER_STRATEGIES, BAYER_4X4, BAYER_8X8, floydSteinbergProcess, atkinsonProcess } from './ditherStrategies.js'

describe('DITHER_STRATEGIES registry', () => {
  it('has all expected keys', () => {
    expect(Object.keys(DITHER_STRATEGIES)).toEqual([
      'bayer4x4',
      'bayer8x8',
      'variableDot',
      'floydSteinberg',
      'atkinson'
    ])
  })

  it('bayer4x4 type is threshold', () => {
    expect(DITHER_STRATEGIES.bayer4x4.type).toBe('threshold')
  })

  it('bayer8x8 type is threshold', () => {
    expect(DITHER_STRATEGIES.bayer8x8.type).toBe('threshold')
  })

  it('variableDot type is variableDot', () => {
    expect(DITHER_STRATEGIES.variableDot.type).toBe('variableDot')
  })

  it('floydSteinberg type is errorDiffusion', () => {
    expect(DITHER_STRATEGIES.floydSteinberg.type).toBe('errorDiffusion')
  })

  it('atkinson type is errorDiffusion', () => {
    expect(DITHER_STRATEGIES.atkinson.type).toBe('errorDiffusion')
  })
})

// Golden tests — ensure Bayer matrix values are unchanged after extraction
describe('Bayer matrices (golden)', () => {
  it('BAYER_4X4 top-left is 0', () => {
    expect(BAYER_4X4[0][0]).toBe(0 / 16)
  })

  it('BAYER_4X4 [0][1] is 8/16', () => {
    expect(BAYER_4X4[0][1]).toBe(8 / 16)
  })

  it('BAYER_4X4 [1][0] is 12/16', () => {
    expect(BAYER_4X4[1][0]).toBe(12 / 16)
  })

  it('BAYER_4X4 values are in [0, 1)', () => {
    for (const row of BAYER_4X4) {
      for (const v of row) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1)
      }
    }
  })

  it('BAYER_4X4 getThreshold(0,0) matches matrix', () => {
    expect(DITHER_STRATEGIES.bayer4x4.getThreshold(0, 0)).toBe(BAYER_4X4[0][0])
  })

  it('BAYER_4X4 getThreshold tiles correctly', () => {
    expect(DITHER_STRATEGIES.bayer4x4.getThreshold(4, 0)).toBe(DITHER_STRATEGIES.bayer4x4.getThreshold(0, 0))
    expect(DITHER_STRATEGIES.bayer4x4.getThreshold(0, 4)).toBe(DITHER_STRATEGIES.bayer4x4.getThreshold(0, 0))
  })

  it('BAYER_8X8 top-left is 0', () => {
    expect(BAYER_8X8[0][0]).toBe(0 / 64)
  })

  it('BAYER_8X8 [0][1] is 32/64', () => {
    expect(BAYER_8X8[0][1]).toBe(32 / 64)
  })

  it('BAYER_8X8 values are in [0, 1)', () => {
    for (const row of BAYER_8X8) {
      for (const v of row) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1)
      }
    }
  })

  it('BAYER_8X8 getThreshold tiles correctly', () => {
    expect(DITHER_STRATEGIES.bayer8x8.getThreshold(8, 0)).toBe(DITHER_STRATEGIES.bayer8x8.getThreshold(0, 0))
  })
})

describe('floydSteinbergProcess', () => {
  it('returns Uint8Array of correct size', () => {
    const grid = new Float32Array(4 * 2) // 4×2
    const result = floydSteinbergProcess(grid, 4, 2)
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(8)
  })

  it('all-black grid (0.0) draws nothing', () => {
    const grid = new Float32Array(4 * 4) // all zeros
    const result = floydSteinbergProcess(grid, 4, 4)
    expect(Array.from(result).every((v) => v === 0)).toBe(true)
  })

  it('all-white grid (1.0) draws everything', () => {
    const grid = new Float32Array(4 * 4).fill(1.0)
    const result = floydSteinbergProcess(grid, 4, 4)
    expect(Array.from(result).every((v) => v === 1)).toBe(true)
  })

  it('half-brightness (0.5) distributes error and draws ~half the pixels', () => {
    const w = 8
    const h = 8
    const grid = new Float32Array(w * h).fill(0.5)
    const result = floydSteinbergProcess(grid, w, h)
    const drawn = Array.from(result).filter((v) => v === 1).length
    // Floyd-Steinberg on uniform 0.5 should draw roughly half (within ±25%)
    expect(drawn).toBeGreaterThan(w * h * 0.25)
    expect(drawn).toBeLessThan(w * h * 0.75)
  })

  it('does not mutate the input grid', () => {
    const original = new Float32Array([0.3, 0.6, 0.1, 0.9])
    const copy = Float32Array.from(original)
    floydSteinbergProcess(original, 2, 2)
    expect(Array.from(original)).toEqual(Array.from(copy))
  })

  it('is deterministic — same input yields same output', () => {
    const grid = new Float32Array([0.2, 0.8, 0.4, 0.6, 0.3, 0.7, 0.5, 0.1, 0.9])
    const r1 = floydSteinbergProcess(grid, 3, 3)
    const r2 = floydSteinbergProcess(grid, 3, 3)
    expect(Array.from(r1)).toEqual(Array.from(r2))
  })
})

describe('atkinsonProcess', () => {
  it('returns Uint8Array of correct size', () => {
    const grid = new Float32Array(4 * 2)
    const result = atkinsonProcess(grid, 4, 2)
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(8)
  })

  it('all-black grid draws nothing', () => {
    const grid = new Float32Array(4 * 4)
    const result = atkinsonProcess(grid, 4, 4)
    expect(Array.from(result).every((v) => v === 0)).toBe(true)
  })

  it('all-white grid draws everything', () => {
    const grid = new Float32Array(4 * 4).fill(1.0)
    const result = atkinsonProcess(grid, 4, 4)
    expect(Array.from(result).every((v) => v === 1)).toBe(true)
  })

  it('does not mutate the input grid', () => {
    const original = new Float32Array([0.3, 0.6, 0.1, 0.9])
    const copy = Float32Array.from(original)
    atkinsonProcess(original, 2, 2)
    expect(Array.from(original)).toEqual(Array.from(copy))
  })

  it('is deterministic', () => {
    const grid = new Float32Array([0.2, 0.8, 0.4, 0.6, 0.3, 0.7, 0.5, 0.1, 0.9])
    const r1 = atkinsonProcess(grid, 3, 3)
    const r2 = atkinsonProcess(grid, 3, 3)
    expect(Array.from(r1)).toEqual(Array.from(r2))
  })

  it('Atkinson is crisper than Floyd-Steinberg on mid-grey (fewer dots drawn)', () => {
    // Atkinson discards 2/8 of error → higher contrast → fewer mid-grey pixels become dots
    const w = 10
    const h = 10
    const grid = new Float32Array(w * h).fill(0.45) // slightly below 0.5
    const fsResult = floydSteinbergProcess(grid, w, h)
    const atResult = atkinsonProcess(grid, w, h)
    const fsDrawn = Array.from(fsResult).filter((v) => v === 1).length
    const atDrawn = Array.from(atResult).filter((v) => v === 1).length
    // Atkinson should draw fewer or equal pixels for sub-0.5 input
    expect(atDrawn).toBeLessThanOrEqual(fsDrawn)
  })
})
