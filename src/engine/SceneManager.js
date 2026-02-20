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

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

    this.effect = new BitmapEffect(this.renderer, effectOptions)
    this.container.appendChild(this.effect.domElement)

    if (effectOptions.backgroundColor && effectOptions.backgroundColor !== 'transparent') {
      this.scene.background = new THREE.Color(effectOptions.backgroundColor)
    }

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

    this._onFrameRendered = null
    this._animationLoop = () => {
      const now = performance.now()
      const deltaSeconds = Math.max(0, Math.min((now - this.lastFrameTime) / 1000, 0.25))
      this.lastFrameTime = now
      if (this.modelGroup) {
        this.animationEngine.update(this.modelGroup, this.effect, deltaSeconds)
      }
      this.effect.render(this.scene, this.camera)
      this._onFrameRendered?.()
    }
    this.renderer.setAnimationLoop(this._animationLoop)
  }

  setSize(width, height) {
    const w = Math.max(1, Math.floor(width))
    const h = Math.max(1, Math.floor(height))
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.effect.setSize(w, h)
  }

  async loadModel(file) {
    if (this._loading) return
    this._loading = true
    try {
      const { group, objectUrl } = await loadModel(file)
      this.disposeModel()
      this.modelGroup = group
      this.currentObjectUrl = objectUrl
      this.scene.add(this.modelGroup)
      this.effect.startAnimation('fadeIn')
    } finally {
      this._loading = false
    }
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
    this.animationEngine.setFadeOptions({
      useFadeInOut: options.useFadeInOut,
      animationEffects: options.animationEffects,
      animationSpeed: options.animationSpeed,
      showPhaseDuration: options.showPhaseDuration,
      animationDuration: options.animationDuration,
      animationPreset: options.animationPreset,
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

  // Pause the live animation loop for frame-stepping during export.
  pauseLoop() {
    this.renderer.setAnimationLoop(null)
  }

  // Resume the live animation loop after export. Resets lastFrameTime to
  // avoid a large delta spike on the first resumed frame.
  resumeLoop() {
    this.lastFrameTime = performance.now()
    this.renderer.setAnimationLoop(this._animationLoop)
  }

  // Render a single frame with the current engine state.
  renderOnce() {
    this.effect.render(this.scene, this.camera)
  }

  // Seek the animation to absoluteTimeMs within the loop and render one frame.
  renderAtTime(absoluteTimeMs) {
    this.animationEngine.seekTo(absoluteTimeMs, this.modelGroup, this.effect)
    this.renderOnce()
  }

  setOnFrameRendered(callback) {
    this._onFrameRendered = callback
  }

  clearOnFrameRendered() {
    this._onFrameRendered = null
  }

  // Reset animation to t=0 and render the first frame. Used before video recording.
  resetToLoopStart() {
    this.animationEngine.resetToStart()
    if (this.modelGroup) this.modelGroup.rotation.set(0, 0, 0)
    if (this.animationEngine.useFadeInOut) {
      this.effect.startAnimation('fadeIn')
    } else {
      this.effect.startAnimation('show')
    }
    this.renderOnce()
  }

  dispose() {
    this.renderer.setAnimationLoop(null)
    this.disposeModel()
    this.effect.dispose()
    this.renderer.dispose()
    if (this.effect.domElement.parentNode) {
      this.effect.domElement.parentNode.removeChild(this.effect.domElement)
    }
  }
}

export { SceneManager }
