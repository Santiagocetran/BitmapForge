import { vi } from 'vitest'

// Mock Three.js to prevent WebGL import-time crashes in jsdom
vi.mock('three', () => {
  class Vector3 {
    constructor() {
      this.x = 0
      this.y = 0
      this.z = 0
    }
    set() {
      return this
    }
    copy() {
      return this
    }
  }
  class Box3 {
    setFromObject() {
      return this
    }
    getSize() {
      return new Vector3()
    }
    getCenter() {
      return new Vector3()
    }
  }
  class Group {
    constructor() {
      this.children = []
      this.position = { set: vi.fn() }
      this.rotation = { x: 0, y: 0, z: 0, set: vi.fn() }
      this.scale = { setScalar: vi.fn() }
    }
    add() {}
    traverse() {}
    updateMatrixWorld() {}
  }
  class Mesh {
    constructor() {
      this.rotation = { x: 0, y: 0, z: 0 }
      this.isMesh = true
    }
  }
  class MeshStandardMaterial {
    clone() {
      return new MeshStandardMaterial()
    }
  }
  class WebGLRenderer {
    constructor() {
      this.domElement = document.createElement('canvas')
    }
    setSize() {}
    render() {}
    dispose() {}
  }
  class Scene {
    add() {}
    remove() {}
  }
  class PerspectiveCamera {
    constructor() {
      this.position = { set: vi.fn() }
    }
    lookAt() {}
  }
  class DirectionalLight {
    constructor() {
      this.position = { set: vi.fn() }
    }
  }
  class AmbientLight {}

  return {
    Vector3,
    Box3,
    Group,
    Mesh,
    MeshStandardMaterial,
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    DirectionalLight,
    AmbientLight
  }
})

// Mock Three.js loader addons
vi.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: vi.fn(() => ({ load: vi.fn() }))
}))
vi.mock('three/addons/loaders/OBJLoader.js', () => ({
  OBJLoader: vi.fn(() => ({ load: vi.fn() }))
}))
vi.mock('three/addons/loaders/STLLoader.js', () => ({
  STLLoader: vi.fn(() => ({ load: vi.fn() }))
}))

// Stub canvas contexts
const mockContext2d = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(0) })),
  putImageData: vi.fn(),
  drawImage: vi.fn(),
  canvas: {}
}

const mockWebGLContext = {
  getExtension: vi.fn(),
  getParameter: vi.fn(),
  createBuffer: vi.fn(),
  createTexture: vi.fn(),
  createProgram: vi.fn(),
  createShader: vi.fn()
}

HTMLCanvasElement.prototype.getContext = vi.fn(function (type) {
  if (type === '2d') return mockContext2d
  if (type === 'webgl' || type === 'webgl2') return mockWebGLContext
  return null
})

// Stub OffscreenCanvas
globalThis.OffscreenCanvas = vi.fn(() => ({
  getContext: vi.fn(() => mockContext2d),
  width: 0,
  height: 0
}))

// Stub createImageBitmap
globalThis.createImageBitmap = vi.fn(() => Promise.resolve({}))

// Stub URL methods
URL.createObjectURL = vi.fn(() => 'blob:mock')
URL.revokeObjectURL = vi.fn()

// Stub matchMedia
window.matchMedia = vi.fn(() => ({
  matches: false,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}))
