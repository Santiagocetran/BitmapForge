import { describe, it, expect } from 'vitest'
import { parseProjectData } from '../projectParser.js'

describe('parseProjectData', () => {
  const validV2 = JSON.stringify({
    version: 2,
    settings: { pixelSize: 8, inputType: 'model', renderMode: 'bitmap' },
    model: { name: 'test.stl', type: 'application/octet-stream', format: 'stl', data: 'abc123' }
  })

  it('parses a valid v2 project string', () => {
    const result = parseProjectData(validV2)
    expect(result.version).toBe(2)
    expect(result.settings.pixelSize).toBe(8)
    expect(result.modelData.name).toBe('test.stl')
    expect(result.inputType).toBe('model')
  })

  it('accepts a parsed object (not only string)', () => {
    const obj = JSON.parse(validV2)
    const result = parseProjectData(obj)
    expect(result.version).toBe(2)
  })

  it('migrates v1 to v2', () => {
    const v1 = JSON.stringify({
      version: 1,
      settings: { pixelSize: 4 }
    })
    const result = parseProjectData(v1)
    expect(result.version).toBe(2)
    expect(result.settings.useFadeInOut).toBe(false)
    expect(result.settings.fadeVariant).toBe('bloom')
    expect(result.settings.baseRotation).toEqual({ x: 0, y: 0, z: 0 })
    expect(result.settings.seed).toBeNull()
  })

  it('defaults inputType to "model" when missing', () => {
    const data = JSON.stringify({ version: 2, settings: {} })
    const result = parseProjectData(data)
    expect(result.inputType).toBe('model')
  })

  it('returns null modelData when no model present', () => {
    const data = JSON.stringify({ version: 2, settings: {} })
    const result = parseProjectData(data)
    expect(result.modelData).toBeNull()
  })

  it('throws on invalid JSON', () => {
    expect(() => parseProjectData('not json')).toThrow()
  })

  it('throws on non-object data', () => {
    expect(() => parseProjectData('"hello"')).toThrow('Invalid .bforge file')
  })

  it('throws on missing version field', () => {
    expect(() => parseProjectData(JSON.stringify({ settings: {} }))).toThrow('Missing version field')
  })
})
