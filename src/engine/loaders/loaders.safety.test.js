import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { SceneManager } from '../SceneManager.js'
import { loadModel, prepareSource } from './modelLoader.js'
import { createTextGroup } from './textGenerator.js'
import { createImagePlane } from './imageLoader.js'

const state = vi.hoisted(() => ({
  requests: [],
  images: [],
  geometries: [],
  failTextAt: 0,
  failPlane: false,
  failMesh: false
}))
vi.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: class {
    load(url, resolve, progress, reject) {
      state.requests.push({ url, resolve, reject })
    }
  }
}))
vi.mock('three/addons/loaders/OBJLoader.js', () => ({
  OBJLoader: class {
    load(url, resolve, progress, reject) {
      state.requests.push({ url, resolve, reject })
    }
  }
}))
vi.mock('three/addons/loaders/STLLoader.js', () => ({
  STLLoader: class {
    load(url, resolve, progress, reject) {
      state.requests.push({ url, resolve, reject })
    }
  }
}))
vi.mock('../effects/BitmapEffect.js', () => ({
  BitmapEffect: class {
    domElement = document.createElement('canvas')
    startAnimation = vi.fn()
    dispose = vi.fn()
  }
}))
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    WebGLRenderer: class {
      domElement = document.createElement('canvas')
      setClearColor = vi.fn()
      setPixelRatio = vi.fn()
      setAnimationLoop = vi.fn()
      dispose = vi.fn()
    },
    Mesh: class extends actual.Mesh {
      constructor(...args) {
        if (state.failMesh) throw new Error('mesh construction failed')
        super(...args)
      }
    },
    PlaneGeometry: class extends actual.PlaneGeometry {
      constructor(...args) {
        if (state.failPlane) throw new Error('plane failed')
        super(...args)
      }
    }
  }
})
vi.mock('three/addons/geometries/TextGeometry.js', async () => {
  const actual = await vi.importActual('three')
  return {
    TextGeometry: class extends actual.BoxGeometry {
      constructor() {
        super()
        state.geometries.push(this)
        vi.spyOn(this, 'dispose')
      }
      computeBoundingBox() {
        if (state.failTextAt === state.geometries.length) throw new Error('text bounds failed')
        return super.computeBoundingBox()
      }
    }
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  state.requests = []
  state.images = []
  state.geometries = []
  state.failTextAt = 0
  state.failPlane = false
  state.failMesh = false
  THREE.Cache.enabled = false
  THREE.Cache.clear()
  let nextUrl = 0
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:owned-${++nextUrl}`)
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = 100
      naturalHeight = 50
      constructor() {
        state.images.push(this)
      }
    }
  )
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function sourceMesh() {
  const geometry = new THREE.BoxGeometry()
  const texture = new THREE.Texture()
  const material = new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture })
  const group = new THREE.Group()
  group.add(new THREE.Mesh(geometry, [material, material]), new THREE.Mesh(geometry, material))
  return {
    group,
    geometry,
    material,
    texture,
    disposals: [geometry, material, texture].map((resource) => vi.spyOn(resource, 'dispose'))
  }
}
function revokedOnce(url) {
  expect(URL.revokeObjectURL.mock.calls.filter(([value]) => value === url)).toHaveLength(1)
}

describe('model preparation ownership', () => {
  it.each(['obj', 'glb'])(
    '%s releases superseded shared materials/maps and keeps geometry until disposal',
    async (extension) => {
      const original = sourceMesh()
      const request = loadModel({ name: `test.${extension}` })
      expect(state.requests).toHaveLength(1)
      expect(original.group.parent).toBeNull()
      state.requests[0].resolve(extension === 'glb' ? { scene: original.group } : original.group)
      const result = await request
      expect(result.group).toBe(original.group)
      expect(result.group.parent).toBeNull()
      expect(original.disposals[0]).not.toHaveBeenCalled()
      expect(original.disposals[1]).toHaveBeenCalledTimes(1)
      expect(original.disposals[2]).toHaveBeenCalledTimes(1)
      const white = []
      result.group.traverse((child) => {
        if (child.isMesh) white.push(vi.spyOn(child.material, 'dispose'))
      })
      const prepared = prepareSource(result.group, result.objectUrl, { type: 'model' })
      prepared.dispose()
      prepared.dispose()
      for (const dispose of [...original.disposals, ...white]) expect(dispose).toHaveBeenCalledTimes(1)
      revokedOnce(result.objectUrl)
    }
  )

  it('failed post-decode normalization releases geometry, replaced maps and white materials', async () => {
    const original = sourceMesh()
    vi.spyOn(original.geometry, 'computeVertexNormals').mockImplementation(() => {
      throw new Error('bad normals')
    })
    const request = loadModel({ name: 'broken.obj' })
    const failure = expect(request).rejects.toThrow('bad normals')
    const materialDispose = vi.spyOn(THREE.Material.prototype, 'dispose')
    state.requests[0].resolve(original.group)
    await failure
    for (const dispose of original.disposals) expect(dispose).toHaveBeenCalledTimes(1)
    expect(materialDispose).toHaveBeenCalledTimes(2) // the two new white materials
    revokedOnce(state.requests[0].url)
  })

  it('decode rejection revokes its URL and a subsequent request succeeds', async () => {
    const first = loadModel({ name: 'bad.glb' })
    const failed = expect(first).rejects.toThrow('decode failed')
    state.requests[0].reject(new Error('decode failed'))
    await failed
    revokedOnce(state.requests[0].url)
    const geometry = new THREE.BoxGeometry()
    const dispose = vi.spyOn(geometry, 'dispose')
    const retry = loadModel({ name: 'retry.stl' })
    state.requests[1].resolve(geometry)
    const result = await retry
    prepareSource(result.group, result.objectUrl).dispose()
    expect(dispose).toHaveBeenCalledTimes(1)
    revokedOnce(state.requests[1].url)
  })

  it('STL post-decode failure cleans up its geometry and material', async () => {
    const geometry = new THREE.BoxGeometry()
    const dispose = vi.spyOn(geometry, 'dispose')
    vi.spyOn(geometry, 'computeVertexNormals').mockImplementation(() => {
      throw new Error('bad STL')
    })
    const materialDispose = vi.spyOn(THREE.Material.prototype, 'dispose')
    const request = loadModel({ name: 'bad.stl' })
    const failure = expect(request).rejects.toThrow('bad STL')
    state.requests[0].resolve(geometry)
    await failure
    expect(dispose).toHaveBeenCalledTimes(1)
    expect(materialDispose).toHaveBeenCalledTimes(1)
    revokedOnce(state.requests[0].url)
  })
})

// Faithful decoder fixture: every scene is decoded, resources can cross scenes,
// and distinct Texture wrappers can share one native bitmap.
function decodedScenes({ retained = true, sharedMaterial = false } = {}) {
  class OwnedBitmap {
    close = vi.fn()
  }
  vi.stubGlobal('ImageBitmap', OwnedBitmap)
  const bitmap = new OwnedBitmap()
  const map = new THREE.Texture(bitmap)
  const wrapper = new THREE.Texture(bitmap)
  const geometry = new THREE.BoxGeometry()
  const extraGeometry = new THREE.BoxGeometry()
  const material = new THREE.MeshStandardMaterial({ map })
  const extraMaterial = new THREE.MeshStandardMaterial({ map: wrapper })
  const lineMaterial = retained ? (sharedMaterial ? material : new THREE.LineBasicMaterial({ map: wrapper })) : null
  const scene = new THREE.Group()
  const secondary = new THREE.Group()
  scene.add(new THREE.Mesh(geometry, material))
  if (retained) scene.add(new THREE.Line(geometry, lineMaterial), new THREE.Points(geometry, lineMaterial))
  secondary.add(new THREE.Mesh(geometry, material), new THREE.Mesh(extraGeometry, extraMaterial))
  const resources = [
    ...new Set([geometry, extraGeometry, material, extraMaterial, map, wrapper, ...(retained ? [lineMaterial] : [])])
  ]
  const disposals = new Map(resources.map((resource) => [resource, vi.spyOn(resource, 'dispose')]))
  return {
    scene,
    secondary,
    scenes: [scene, secondary, scene],
    bitmap,
    geometry,
    extraGeometry,
    material,
    extraMaterial,
    lineMaterial,
    map,
    wrapper,
    disposals
  }
}

function assertAllReleased(decoded) {
  for (const dispose of decoded.disposals.values()) expect(dispose).toHaveBeenCalledTimes(1)
  expect(decoded.bitmap.close).toHaveBeenCalledTimes(1)
}

describe('audit F1–F4 regressions', () => {
  it.each([false, true])('keeps retained line/point resources alive (shared material: %s)', async (sharedMaterial) => {
    const decoded = decodedScenes({ sharedMaterial })
    const request = loadModel({ name: 'scenes.glb' })
    state.requests[0].resolve(decoded)
    const result = await request
    expect(result.group).toBe(decoded.scene)
    expect(decoded.disposals.get(decoded.geometry)).not.toHaveBeenCalled()
    expect(decoded.disposals.get(decoded.lineMaterial)).not.toHaveBeenCalled()
    expect(decoded.disposals.get(sharedMaterial ? decoded.map : decoded.wrapper)).not.toHaveBeenCalled()
    expect(decoded.disposals.get(decoded.extraGeometry)).toHaveBeenCalledTimes(1)
    expect(decoded.disposals.get(decoded.extraMaterial)).toHaveBeenCalledTimes(1)
    expect(decoded.bitmap.close).not.toHaveBeenCalled()
    const white = []
    result.group.traverse((child) => {
      if (child.isMesh) white.push(vi.spyOn(child.material, 'dispose'))
    })
    const source = prepareSource(result.group, result.objectUrl)
    source.dispose()
    source.dispose()
    assertAllReleased(decoded)
    for (const dispose of white) expect(dispose).toHaveBeenCalledTimes(1)
    revokedOnce(result.objectUrl)
  })

  it('closes discarded maps with shared bitmap backing immediately and only once', async () => {
    const decoded = decodedScenes({ retained: false })
    const request = loadModel({ name: 'white.glb' })
    state.requests[0].resolve(decoded)
    const result = await request
    expect(decoded.bitmap.close).toHaveBeenCalledTimes(1)
    expect(decoded.disposals.get(decoded.map)).toHaveBeenCalledTimes(1)
    expect(decoded.disposals.get(decoded.wrapper)).toHaveBeenCalledTimes(1)
    expect(decoded.disposals.get(decoded.geometry)).not.toHaveBeenCalled()
    prepareSource(result.group, result.objectUrl).dispose()
    assertAllReleased(decoded)
    revokedOnce(result.objectUrl)
  })

  it('normalization failure releases resources from every scene and closes shared bitmap once', async () => {
    const decoded = decodedScenes()
    vi.spyOn(decoded.geometry, 'computeVertexNormals').mockImplementation(() => {
      throw new Error('normalization failed')
    })
    const request = loadModel({ name: 'failed.glb' })
    const failure = expect(request).rejects.toThrow('normalization failed')
    state.requests[0].resolve(decoded)
    await failure
    assertAllReleased(decoded)
    revokedOnce(state.requests[0].url)
  })

  it.each(['shape', 'dispose'])(
    'late decoded scenes after %s release everything without publication',
    async (action) => {
      const decoded = decodedScenes()
      const manager = new SceneManager(document.createElement('div'))
      try {
        const request = manager.loadModel({ name: 'late.glb' })
        if (action === 'shape') manager.loadShape('cube')
        else manager.dispose()
        const previous = manager.objectGroup
        state.requests[0].resolve(decoded)
        await request
        expect(manager.objectGroup).toBe(previous)
        expect(manager.animGroup.children).toEqual(previous ? [previous] : [])
        expect(decoded.scene.parent).toBeNull()
        assertAllReleased(decoded)
        revokedOnce(state.requests[0].url)
      } finally {
        manager.dispose()
      }
    }
  )

  it.each(['enabled', 'enabled-during-decode', 'cached-at-release'])(
    'does not close borrowed bitmap (%s)',
    async (cacheMode) => {
      const decoded = decodedScenes()
      THREE.Cache.enabled = cacheMode === 'enabled'
      const request = loadModel({ name: 'borrowed.glb' })
      if (cacheMode === 'enabled-during-decode') THREE.Cache.enabled = true
      state.requests[0].resolve(decoded)
      const result = await request
      if (cacheMode === 'cached-at-release') {
        THREE.Cache.enabled = true
        THREE.Cache.add('borrowed-image', decoded.bitmap)
        THREE.Cache.enabled = false
      }
      prepareSource(result.group, result.objectUrl).dispose()
      for (const dispose of decoded.disposals.values()) expect(dispose).toHaveBeenCalledTimes(1)
      expect(decoded.bitmap.close).not.toHaveBeenCalled()
      revokedOnce(result.objectUrl)
    }
  )

  it.each([false, true])(
    'a bitmap observed in cache stays borrowed after eviction (retained: %s)',
    async (retained) => {
      const decoded = decodedScenes({ retained })
      THREE.Cache.enabled = true
      THREE.Cache.add('previous-consumer', decoded.bitmap)
      THREE.Cache.enabled = false
      const request = loadModel({ name: 'evicted.glb' })
      state.requests[0].resolve(decoded)
      const result = await request
      expect(decoded.bitmap.close).not.toHaveBeenCalled()
      THREE.Cache.clear()
      const source = prepareSource(result.group, result.objectUrl)
      source.dispose()
      source.dispose()
      for (const dispose of decoded.disposals.values()) expect(dispose).toHaveBeenCalledTimes(1)
      expect(decoded.bitmap.close).not.toHaveBeenCalled()
      revokedOnce(result.objectUrl)
    }
  )

  it('does not close external bitmap data in arbitrary caller-owned groups', () => {
    const decoded = decodedScenes()
    const source = prepareSource(decoded.scene)
    source.dispose()
    expect(decoded.bitmap.close).not.toHaveBeenCalled()
  })

  it.each(['clone', 'mesh'])('STL %s failure releases unattached allocations and retry succeeds', async (stage) => {
    const geometry = new THREE.BoxGeometry()
    const dispose = vi.spyOn(geometry, 'dispose')
    const materialDispose = vi.spyOn(THREE.Material.prototype, 'dispose')
    if (stage === 'clone')
      vi.spyOn(THREE.MeshStandardMaterial.prototype, 'clone').mockImplementationOnce(() => {
        throw new Error('clone failed')
      })
    else state.failMesh = true
    const request = loadModel({ name: 'failed.stl' })
    const failure = expect(request).rejects.toThrow(stage === 'clone' ? 'clone failed' : 'mesh construction failed')
    state.requests[0].resolve(geometry)
    await failure
    expect(dispose).toHaveBeenCalledTimes(1)
    expect(materialDispose).toHaveBeenCalledTimes(stage === 'clone' ? 0 : 1)
    revokedOnce(state.requests[0].url)
    state.failMesh = false
    const retryGeometry = new THREE.BoxGeometry()
    const retryDispose = vi.spyOn(retryGeometry, 'dispose')
    const retry = loadModel({ name: 'retry.stl' })
    state.requests[1].resolve(retryGeometry)
    const result = await retry
    const source = prepareSource(result.group, result.objectUrl)
    source.dispose()
    source.dispose()
    expect(retryDispose).toHaveBeenCalledTimes(1)
    expect(dispose).toHaveBeenCalledTimes(1)
    revokedOnce(result.objectUrl)
  })
})

describe('image preparation ownership', () => {
  it('image error cleans handlers/URL and retry transfers ownership for exactly-once cleanup', async () => {
    const failed = expect(createImagePlane({ name: 'bad.png' })).rejects.toThrow('Failed to load image')
    const image = state.images[0]
    image.onerror()
    await failed
    expect(image.onload).toBeNull()
    expect(image.onerror).toBeNull()
    revokedOnce(image.src)
    const request = createImagePlane({ name: 'good.png' })
    state.images[1].onload()
    const result = await request
    expect(result.group.parent).toBeNull()
    const mesh = result.group.children[0]
    const disposals = [mesh.geometry, mesh.material, mesh.material.map].map((resource) => vi.spyOn(resource, 'dispose'))
    const prepared = prepareSource(result.group, result.objectUrl)
    prepared.dispose()
    prepared.dispose()
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledTimes(1)
    revokedOnce(result.objectUrl)
  })

  it('SVG rasterization failure rejects and revokes instead of stranding a promise', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage() {
        throw new Error('raster failed')
      }
    })
    const failure = expect(createImagePlane({ name: 'bad.svg' })).rejects.toThrow('raster failed')
    state.images[0].onload()
    await failure
    revokedOnce(state.images[0].src)
    expect(state.images[0].onload).toBeNull()
  })

  it('successful SVG rasterization revokes only the decode URL', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: vi.fn() })
    const request = createImagePlane({ name: 'good.svg' })
    state.images[0].onload()
    const result = await request
    expect(result.objectUrl).toBeNull()
    const prepared = prepareSource(result.group, result.objectUrl)
    prepared.dispose()
    prepared.dispose()
    revokedOnce(state.images[0].src)
  })

  it('post-decode construction failure disposes its texture and URL', async () => {
    state.failPlane = true
    const dispose = vi.spyOn(THREE.Texture.prototype, 'dispose')
    const failure = expect(createImagePlane({ name: 'good.png' })).rejects.toThrow('plane failed')
    state.images[0].onload()
    await failure
    expect(dispose).toHaveBeenCalledTimes(1)
    revokedOnce(state.images[0].src)
  })
})

describe('text preparation ownership', () => {
  it('partial text failure releases all created geometries and its shared material once', async () => {
    state.failTextAt = 2
    const materialDispose = vi.spyOn(THREE.Material.prototype, 'dispose')
    await expect(createTextGroup('AB')).rejects.toThrow('text bounds failed')
    expect(state.geometries).toHaveLength(2)
    for (const geometry of state.geometries) expect(geometry.dispose).toHaveBeenCalledTimes(1)
    expect(materialDispose).toHaveBeenCalledTimes(1)
    state.failTextAt = 0
    const group = await createTextGroup('CD')
    expect(group.parent).toBeNull()
    const prepared = prepareSource(group)
    prepared.dispose()
    prepared.dispose()
    for (const geometry of state.geometries) expect(geometry.dispose).toHaveBeenCalledTimes(1)
    expect(materialDispose).toHaveBeenCalledTimes(2)
  })

  it('all-space text does not leak a material with no owning mesh', async () => {
    const dispose = vi.spyOn(THREE.Material.prototype, 'dispose')
    const group = await createTextGroup('   ')
    prepareSource(group).dispose()
    expect(group.children).toEqual([])
    expect(dispose).toHaveBeenCalledTimes(1)
  })
})
