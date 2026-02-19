import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { BitmapEffect } from '../effects/BitmapEffect.js'

const DEFAULT_EFFECT_OPTIONS = {
  pixelSize: 3,
  ditherType: 'bayer4x4',
  colors: ['#021a15', '#053a2a', '#074434', '#0a5845', '#1a7a5e', '#4d9977', '#ABC685', '#E8FF99', '#F7F9CE', '#FFF6E7'],
  backgroundColor: 'transparent',
  invert: false
}

export function startModelAnimation({
  container,
  modelUrl,
  effectOptions = {},
  showPhaseDuration = 20000
} = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('startModelAnimation requires a browser environment')
  }
  if (!modelUrl) {
    throw new Error('modelUrl is required')
  }

  const el = container ?? document.body
  const scene = new THREE.Scene()

  function getContainerSize() {
    const width = Math.max(1, el.clientWidth || window.innerWidth || 1)
    const height = Math.max(1, el.clientHeight || window.innerHeight || 1)
    return { width, height }
  }

  const initialSize = getContainerSize()

  const camera = new THREE.PerspectiveCamera(
    75,
    initialSize.width / initialSize.height,
    0.1,
    1000
  )
  camera.position.set(0, 0.5, 5)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const mergedEffectOptions = {
    ...DEFAULT_EFFECT_OPTIONS,
    minBrightness: 0.05,
    ...effectOptions
  }
  // Only set scene background if not transparent
  if (mergedEffectOptions.backgroundColor !== 'transparent') {
    scene.background = new THREE.Color(mergedEffectOptions.backgroundColor)
  } else {
    scene.background = null
  }
  const effect = new BitmapEffect(renderer, mergedEffectOptions)
  effect.setSize(initialSize.width, initialSize.height)
  effect.domElement.style.backgroundColor = mergedEffectOptions.backgroundColor
  el.appendChild(effect.domElement)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5)
  keyLight.position.set(3, 4, 5)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
  fillLight.position.set(-4, 2, 3)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.8)
  rimLight.position.set(0, 2, -5)
  scene.add(rimLight)

  let modelGroup = null
  let disposed = false
  const loader = new STLLoader()

  loader.load(modelUrl, (geometry) => {
    if (disposed) {
      geometry.dispose()
      return
    }
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1
    })
    const model = new THREE.Mesh(geometry, material)

    geometry.computeBoundingBox()
    const box = geometry.boundingBox
    const size = box.getSize(new THREE.Vector3())

    geometry.center()

    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 3 / maxDim
    model.scale.setScalar(scale)
    model.rotation.x = -Math.PI / 2

    modelGroup = new THREE.Group()
    modelGroup.add(model)
    scene.add(modelGroup)

    effect.startAnimation('fadeIn')
  }, undefined, (err) => {
    console.error(`Failed to load model: ${modelUrl}`, err)
  })

  let time = 0
  let showPhaseStartTime = 0

  function animate() {
    if (disposed) return
    const currentPhase = effect.getAnimationPhase()
    const now = performance.now()

    if (currentPhase === 'fadeIn' && effect.isAnimationComplete()) {
      effect.startAnimation('show')
      showPhaseStartTime = now
    } else if (currentPhase === 'show') {
      if (now - showPhaseStartTime >= showPhaseDuration) {
        effect.startAnimation('fadeOut')
      }
    } else if (currentPhase === 'fadeOut' && effect.isAnimationComplete()) {
      effect.startAnimation('fadeIn')
    }

    if (modelGroup && currentPhase === 'show') {
      time += 0.015
      modelGroup.rotation.y += 0.006
      modelGroup.rotation.x = Math.sin(time * 0.5) * 0.15
      modelGroup.rotation.z = Math.sin(time * 0.3) * 0.08
    }

    effect.render(scene, camera)
  }

  renderer.setAnimationLoop(animate)

  function resize(width, height) {
    const size = width && height
      ? { width: Math.max(1, width), height: Math.max(1, height) }
      : getContainerSize()
    camera.aspect = size.width / size.height
    camera.updateProjectionMatrix()
    effect.setSize(size.width, size.height)
  }

  function disposeMaterial(material) {
    if (!material || typeof material !== 'object') return
    for (const value of Object.values(material)) {
      if (value && typeof value === 'object' && typeof value.dispose === 'function') {
        value.dispose()
      }
    }
    material.dispose()
  }

  function dispose() {
    disposed = true
    renderer.setAnimationLoop(null)

    scene.traverse((obj) => {
      if (obj.geometry && typeof obj.geometry.dispose === 'function') {
        obj.geometry.dispose()
      }
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(disposeMaterial)
        } else {
          disposeMaterial(obj.material)
        }
      }
    })

    renderer.dispose()
    if (effect.domElement.parentNode) {
      effect.domElement.parentNode.removeChild(effect.domElement)
    }
  }

  return { resize, dispose }
}
