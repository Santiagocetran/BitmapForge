import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { SceneManager } from './SceneManager.js'
import { loadModel } from './loaders/modelLoader.js'
import { createTextGroup } from './loaders/textGenerator.js'
import { createImagePlane } from './loaders/imageLoader.js'

vi.mock('three', async (importOriginal) => ({
  ...(await importOriginal()),
  WebGLRenderer: class {
    domElement = document.createElement('canvas')
    setClearColor = vi.fn()
    setPixelRatio = vi.fn()
    setAnimationLoop = vi.fn()
    dispose = vi.fn()
  }
}))
vi.mock('./effects/BitmapEffect.js', () => ({
  BitmapEffect: class {
    domElement = document.createElement('canvas')
    startAnimation = vi.fn()
    render = vi.fn()
    dispose = vi.fn()
  }
}))
vi.mock('./loaders/modelLoader.js', async (importOriginal) => ({
  ...(await importOriginal()),
  loadModel: vi.fn()
}))
vi.mock('./loaders/textGenerator.js', () => ({ createTextGroup: vi.fn() }))
vi.mock('./loaders/imageLoader.js', () => ({ createImagePlane: vi.fn() }))

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

// Two meshes deliberately share geometry, material, and two slots of one texture.
function asset(url = null) {
  const geometry = new THREE.BoxGeometry()
  const texture = new THREE.Texture()
  const material = new THREE.MeshBasicMaterial({ map: texture, alphaMap: texture })
  const group = new THREE.Group()
  group.add(new THREE.Mesh(geometry, [material, material]), new THREE.Mesh(geometry, material))
  return {
    group,
    objectUrl: url,
    resources: [geometry, material, texture].map((resource) => vi.spyOn(resource, 'dispose'))
  }
}
function expectReleased(source, count = 1) {
  for (const dispose of source.resources) expect(dispose).toHaveBeenCalledTimes(count)
  if (source.objectUrl) {
    expect(URL.revokeObjectURL.mock.calls.filter(([url]) => url === source.objectUrl)).toHaveLength(count)
  }
}
const methods = [
  ['loadModel', loadModel, (source) => source],
  ['loadText', createTextGroup, (source) => source.group],
  ['loadImage', createImagePlane, (source) => source]
]
let manager
beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  manager = new SceneManager(document.createElement('div'))
})
afterEach(() => {
  manager.dispose()
  vi.restoreAllMocks()
})

describe('source generations and owned resources', () => {
  it.each(methods)('%s: latest request wins when newer finishes first', async (method, loader, result) => {
    const a = deferred(),
      b = deferred()
    const old = asset(method === 'loadText' ? null : 'blob:old'),
      latest = asset(method === 'loadText' ? null : 'blob:latest')
    loader.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise)
    const first = manager[method]('a'),
      second = manager[method]('b')
    expect(loader).toHaveBeenCalledTimes(2)
    expect(manager.animGroup.children).toEqual([])
    b.resolve(result(latest))
    await second
    a.resolve(result(old))
    await first
    expect(manager.objectGroup).toBe(latest.group)
    expect(manager.animGroup.children).toEqual([latest.group])
    expect(manager.effect.startAnimation).toHaveBeenCalledTimes(1)
    expectReleased(old)
    // Text has no URL ownership.
    if (method === 'loadText') expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    manager.dispose()
    manager.dispose()
    expectReleased(latest, 1)
  })

  it.each(methods)('%s: stale finally cannot clear newer pending state', async (method, loader, result) => {
    const a = deferred(),
      b = deferred()
    const old = asset(),
      latest = asset()
    loader.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise)
    const first = manager[method]('a'),
      second = manager[method]('b')
    a.resolve(result(old))
    await first
    expect(manager._loading).toBe(true)
    expect(manager.objectGroup).toBeNull()
    expectReleased(old)
    b.resolve(result(latest))
    await second
    expect(manager._loading).toBe(false)
    expect(manager.animGroup.children).toEqual([latest.group])
  })

  it('model A → shape B invalidates A and releases replaced resources once', async () => {
    const initial = asset('blob:initial'),
      late = asset('blob:late'),
      pending = deferred()
    loadModel.mockResolvedValueOnce(initial).mockReturnValueOnce(pending.promise)
    await manager.loadModel('initial')
    const request = manager.loadModel('a')
    manager.loadShape('cube')
    const shape = manager.objectGroup
    expectReleased(initial)
    pending.resolve(late)
    await request
    expect(manager.animGroup.children).toEqual([shape])
    expectReleased(late)
    expect(manager._loading).toBe(false)
  })

  it.each(methods)(
    '%s: disposal during preparation collects late resources without mutation',
    async (method, loader, result) => {
      const pending = deferred(),
        late = asset(method === 'loadText' ? null : 'blob:late')
      loader.mockReturnValueOnce(pending.promise)
      const request = manager[method]('a')
      manager.container.remove() // SDK disconnect delegates to manager.dispose().
      manager.dispose()
      manager.destroy()
      const starts = manager.effect.startAnimation.mock.calls.length
      pending.resolve(result(late))
      await request
      expect(manager.objectGroup).toBeNull()
      expect(manager.animGroup.children).toEqual([])
      expect(manager.effect.startAnimation).toHaveBeenCalledTimes(starts)
      expect(manager._loading).toBe(false)
      expectReleased(late)
      expect(manager.effect.dispose).toHaveBeenCalledTimes(1)
      expect(manager.renderer.dispose).toHaveBeenCalledTimes(1)
      expect(manager.container.children).toHaveLength(0)
      await manager[method]('ignored')
      expect(loader).toHaveBeenCalledTimes(1)
    }
  )

  it.each(methods)(
    '%s: rejection keeps the previous scene usable and permits retry',
    async (method, loader, result) => {
      manager.loadShape('sphere')
      const previous = manager.objectGroup
      const pending = deferred(),
        next = asset()
      loader.mockReturnValueOnce(pending.promise).mockResolvedValueOnce(result(next))
      const failure = expect(manager[method]('bad')).rejects.toThrow('decode failed')
      pending.reject(new Error('decode failed'))
      await failure
      expect(manager.animGroup.children).toEqual([previous])
      expect(manager._loading).toBe(false)
      await manager[method]('retry')
      expect(manager.animGroup.children).toEqual([next.group])
    }
  )

  it('stale rejection cannot clear a newer generation or attach a source', async () => {
    const a = deferred(),
      b = deferred(),
      next = asset()
    loadModel.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise)
    const failure = expect(manager.loadModel('a')).rejects.toThrow('old failure')
    const latest = manager.loadModel('b')
    a.reject(new Error('old failure'))
    await failure
    expect(manager._loading).toBe(true)
    b.resolve(next)
    await latest
    expect(manager.animGroup.children).toEqual([next.group])
  })

  it('explicit disposeModel cancels preparation and is idempotent', async () => {
    const pending = deferred(),
      next = asset('blob:cancelled')
    loadModel.mockReturnValueOnce(pending.promise)
    const request = manager.loadModel('a')
    manager.disposeModel()
    manager.disposeModel()
    pending.resolve(next)
    await request
    expect(manager.animGroup.children).toEqual([])
    expectReleased(next)
    manager.loadShape('cube')
    expect(manager.hasObject()).toBe(true)
  })

  it('interleaved model/text/image loads share one generation', async () => {
    const a = deferred(),
      b = deferred(),
      c = deferred()
    const model = asset('blob:model'),
      text = asset(),
      image = asset('blob:image')
    loadModel.mockReturnValueOnce(a.promise)
    createTextGroup.mockReturnValueOnce(b.promise)
    createImagePlane.mockReturnValueOnce(c.promise)
    const first = manager.loadModel('a'),
      second = manager.loadText('b'),
      third = manager.loadImage('c')
    b.resolve(text.group)
    await second
    a.resolve(model)
    await first
    expect(manager._loading).toBe(true)
    c.resolve(image)
    await third
    expect(manager.animGroup.children).toEqual([image.group])
    expectReleased(model)
    expectReleased(text)
  })

  it.each(methods)('%s: rejection after disposal stays inert and clears no newer manager', async (method, loader) => {
    const pending = deferred()
    loader.mockReturnValueOnce(pending.promise)
    const failure = expect(manager[method]('a')).rejects.toThrow('late failure')
    manager.dispose()
    const replacement = new SceneManager(manager.container)
    replacement.loadShape('cube')
    pending.reject(new Error('late failure'))
    await failure
    expect(manager.objectGroup).toBeNull()
    expect(manager._loading).toBe(false)
    expect(manager.effect.startAnimation).not.toHaveBeenCalled()
    expect(replacement.animGroup.children).toEqual([replacement.objectGroup])
    expect(manager.container.children).toHaveLength(1)
    replacement.dispose()
  })

  it('failed publication retains the previous source and disposes the prepared replacement', async () => {
    const previous = asset('blob:previous'),
      next = asset('blob:next')
    loadModel.mockResolvedValueOnce(previous).mockResolvedValueOnce(next)
    await manager.loadModel('previous')
    manager.animGroup.rotation.set(1, 2, 3)
    manager.effect.startAnimation.mockImplementationOnce(() => {
      throw new Error('publication failed')
    })
    await expect(manager.loadModel('next')).rejects.toThrow('publication failed')
    expect(manager.objectGroup).toBe(previous.group)
    expect(manager.animGroup.children).toEqual([previous.group])
    expect(manager.animGroup.rotation.x).toBe(1)
    expectReleased(previous, 0)
    expectReleased(next)
    expect(manager._loading).toBe(false)
    const retry = asset('blob:publication-retry')
    loadModel.mockResolvedValueOnce(retry)
    await manager.loadModel('retry')
    expect(manager.animGroup.children).toEqual([retry.group])
    expectReleased(previous)
    expectReleased(next)
  })

  it.each(methods)('%s → shape invalidates pending preparation', async (method, loader, result) => {
    const pending = deferred(),
      late = asset(method === 'loadText' ? null : 'blob:late-shape')
    loader.mockReturnValueOnce(pending.promise)
    const request = manager[method]('pending')
    manager.loadShape('cube')
    const shape = manager.objectGroup
    pending.resolve(result(late))
    await request
    expect(manager.animGroup.children).toEqual([shape])
    expectReleased(late)
  })

  it('failed synchronous shape preserves the previous scene but invalidates older async work', async () => {
    manager.loadShape('sphere')
    const previous = manager.objectGroup
    const pending = deferred(),
      late = asset('blob:invalidated')
    loadModel.mockReturnValueOnce(pending.promise)
    const request = manager.loadModel('pending')
    expect(() => manager.loadShape('not-a-shape')).toThrow('Unknown shape')
    expect(manager.animGroup.children).toEqual([previous])
    expect(manager._loading).toBe(false)
    pending.resolve(late)
    await request
    expect(manager.animGroup.children).toEqual([previous])
    expectReleased(late)
    manager.loadShape('cube')
    expect(manager.objectGroup).not.toBe(previous)
  })

  it('retained frame/context callbacks and resume cannot touch disposed rendering resources', () => {
    const frame = manager._animationLoop,
      restored = manager._onContextRestored
    manager.dispose()
    manager.renderer.setAnimationLoop.mockClear()
    frame()
    restored()
    manager.resumeLoop()
    manager.renderOnce()
    manager.renderAtTime(123)
    manager.loadShape('cube')
    expect(manager.renderer.setAnimationLoop).not.toHaveBeenCalled()
    expect(manager.effect.render).not.toHaveBeenCalled()
    expect(manager.effect.startAnimation).not.toHaveBeenCalled()
  })
})
