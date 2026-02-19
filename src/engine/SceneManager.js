import * as THREE from 'three'
import { BitmapEffect } from './effects/BitmapEffect.js'
import { loadModel } from './loaders/modelLoader.js'
import { AnimationEngine } from './animation/AnimationEngine.js'

class SceneManager {
  constructor(container, effectOptions = {}) {
    this.container = container
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    this.camera.position.set(0, 0.5, 5)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

    this.effect = new BitmapEffect(this.renderer, effectOptions)
    this.container.appendChild(this.effect.domElement)

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.5)
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    this.rimLight = new THREE.DirectionalLight(0xffffff, 0.8)
    this.keyLight.position.set(3, 4, 5)
    this.fillLight.position.set(-4, 2, 3)
    this.rimLight.position.set(0, 2, -5)
    this.scene.add(this.ambientLight, this.keyLight, this.fillLight, this.rimLight)

    this.animationEngine = new AnimationEngine()
    this.modelGroup = null
    this.currentObjectUrl = null
    this.lastFrameTime = performance.now()

    this.renderer.setAnimationLoop(() => {
      const now = performance.now()
      const deltaSeconds = Math.max(0, Math.min((now - this.lastFrameTime) / 1000, 0.25))
      this.lastFrameTime = now
      if (this.modelGroup) {
        this.animationEngine.update(this.modelGroup, this.effect, deltaSeconds)
      }
      this.effect.render(this.scene, this.camera)
    })
  }

  setSize(width, height) {
    const w = Math.max(1, Math.floor(width))
    const h = Math.max(1, Math.floor(height))
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.effect.setSize(w, h)
  }

  async loadModel(file) {
    const { group, objectUrl } = await loadModel(file)
    this.disposeModel()
    this.modelGroup = group
    this.currentObjectUrl = objectUrl
    this.scene.add(this.modelGroup)
    this.effect.startAnimation('fadeIn')
  }

  disposeModel() {
    if (!this.modelGroup) return
    this.scene.remove(this.modelGroup)
    this.modelGroup.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose?.()
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat) => mat?.dispose?.())
        } else {
          obj.material.dispose?.()
        }
      }
    })
    this.modelGroup = null
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl)
      this.currentObjectUrl = null
    }
  }

  updateEffectOptions(options) {
    this.effect.updateOptions(options)
    if (options.backgroundColor && options.backgroundColor !== 'transparent') {
      this.scene.background = new THREE.Color(options.backgroundColor)
    } else if (options.backgroundColor === 'transparent') {
      this.scene.background = null
    }
  }

  updateAnimationOptions(options) {
    if (options.animationPreset) this.animationEngine.setPreset(options.animationPreset)
    if (typeof options.animationSpeed === 'number') this.animationEngine.setSpeed(options.animationSpeed)
    this.animationEngine.setFadeOptions({
      showPhaseDuration: options.showPhaseDuration,
      animationDuration: options.animationDuration,
      rotateOnShow: options.rotateOnShow,
      showPreset: options.showPreset
    })
  }

  setLightDirection(x, y, z) {
    this.keyLight.position.set(x, y, z)
  }

  getCanvas() {
    return this.effect.bitmapCanvas ?? this.effect.domElement.querySelector('canvas')
  }

  getLoopDurationMs() {
    return this.animationEngine.getLoopDurationMs()
  }

  dispose() {
    this.renderer.setAnimationLoop(null)
    this.disposeModel()
    this.renderer.dispose()
    if (this.effect.domElement.parentNode) {
      this.effect.domElement.parentNode.removeChild(this.effect.domElement)
    }
  }
}

export { SceneManager }
