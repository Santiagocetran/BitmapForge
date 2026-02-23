import { describe, it, expect } from 'vitest'
import { getExtension, loadModel } from './modelLoader.js'

describe('getExtension', () => {
  it('extracts stl extension', () => {
    expect(getExtension('model.stl')).toBe('stl')
  })

  it('lowercases OBJ extension', () => {
    expect(getExtension('Model.OBJ')).toBe('obj')
  })

  it('extracts gltf extension', () => {
    expect(getExtension('file.gltf')).toBe('gltf')
  })

  it('returns empty string for no extension', () => {
    expect(getExtension('noext')).toBe('noext')
  })
})

describe('loadModel', () => {
  it('throws on unsupported extension', async () => {
    const file = { name: 'model.xyz' }
    await expect(loadModel(file)).rejects.toThrow('Unsupported model format')
  })
})
