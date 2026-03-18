import * as THREE from 'three'
import { BitmapEffect } from './effects/BitmapEffect.js'
import { loadModel } from './loaders/modelLoader.js'
import { AnimationEngine } from './animation/AnimationEngine.js'
import { createRenderer } from './renderers/index.js'
import { createShape } from './loaders/shapeGenerator.js'
import { createTextGroup } from './loaders/textGenerator.js'
import { createImagePlane } from './loaders/imageLoader.js'

/**
 * Facade for the rendering engine. Manages the Three.js scene, camera, lights,
 * BitmapEffect post-processing, model loading, and animation loop.
 *
 * Lifecycle: created by PreviewCanvas on mount, disposed on unmount.
 * All methods must be called on the UI thread.
 *
 * @example
 * const manager = new SceneManager(containerDiv, { pixelSize: 3, colors: ['#000', '#fff'] })
 * await manager.loadModel(file)
 * // ... later
 * manager.dispose()
 */
class SceneManager {
  /**
   * @param {HTMLElement} container - DOM element to render into. The effect canvas is appended as a child.
   * @param {object} [effectOptions] - Initial BitmapEffect options (pixelSize, ditherType, colors, backgroundColor, etc.)
   */
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

    // Two-group rotation hierarchy:
    //   baseGroup — static pose (set from Zustand baseRotation)
    //   animGroup — animation-driven rotation (incremental += per frame)
    // This separates the user's manual offset from the animation loop so neither
    // fights the other and seekTo/export remain deterministic.
    this.baseGroup = new THREE.Group()
    this.animGroup = new THREE.Group()
    this.baseGroup.add(this.animGroup)
    this.scene.add(this.baseGroup)

    this.animationEngine = new AnimationEngine()

    this.objectGroup = null
    this.currentObjectUrl = null
    this.lastFrameTime = performance.now()

    this._onFrameRendered = null
    this._animationLoop = () => {
      const now = performance.now()
      const deltaSeconds = Math.max(0, Math.min((now - this.lastFrameTime) / 1000, 0.25))
      this.lastFrameTime = now
      if (this.hasObject()) {
        this.animationEngine.update(this.animGroup, this.effect, deltaSeconds, this.camera)
      }
      this.effect.render(this.scene, this.camera)
      this._onFrameRendered?.()
    }
    this.renderer.setAnimationLoop(this._animationLoop)

    this._onContextLost = (event) => {
      event.preventDefault()
      this.renderer.setAnimationLoop(null)
    }
    this._onContextRestored = () => {
      this.renderer.setAnimationLoop(this._animationLoop)
    }
    this.renderer.domElement.addEventListener('webglcontextlost', this._onContextLost)
    this.renderer.domElement.addEventListener('webglcontextrestored', this._onContextRestored)
  }

  hasObject() {
    return this.objectGroup !== null
  }

  _setObject(group, objectUrl = null) {
    this.disposeModel()
    this.objectGroup = group
    this.currentObjectUrl = objectUrl
    this.animGroup.add(group)
    this.animGroup.rotation.set(0, 0, 0)
    this.effect.startAnimation('fadeIn')
  }

  async loadModel(file) {
    if (this._loading) return
    this._loading = true
    try {
      const { group, objectUrl } = await loadModel(file)
      this._setObject(group, objectUrl)
    } finally {
      this._loading = false
    }
  }

  loadShape(type, params = {}) {
    this._setObject(createShape(type, params))
  }

  async loadText(text, opts = {}) {
    if (this._loading) return
    this._loading = true
    try {
      const group = await createTextGroup(text, opts)
      this._setObject(group)
    } finally {
      this._loading = false
    }
  }

  async loadImage(file) {
    if (this._loading) return
    this._loading = true
    try {
      const { group, objectUrl } = await createImagePlane(file)
      this._setObject(group, objectUrl)
    } finally {
      this._loading = false
    }
  }

  disposeModel() {
    if (this.objectGroup) {
      this.animGroup.remove(this.objectGroup)
      _disposeGroup(this.objectGroup)
      this.objectGroup = null
    }
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl)
      this.currentObjectUrl = null
    }
  }

  // ---------------------------------------------------------------------------
  // Scene settings
  // ---------------------------------------------------------------------------

  /**
   * Resize the rendering viewport.
   * @param {number} width
   * @param {number} height
   */
  setSize(width, height) {
    const w = Math.max(1, Math.floor(width))
    const h = Math.max(1, Math.floor(height))
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.effect.setSize(w, h)
  }

  /**
   * Update bitmap rendering options.
   * @param {object} options
   */
  updateEffectOptions(options) {
    this.effect.updateOptions(options)
    if (options.backgroundColor && options.backgroundColor !== 'transparent') {
      this.scene.background = new THREE.Color(options.backgroundColor)
    } else if (options.backgroundColor === 'transparent') {
      this.scene.background = null
    }
  }

  /**
   * Update animation behavior.
   * @param {object} options
   */
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

  /**
   * Move the key directional light to a new position.
   */
  setLightDirection(x, y, z) {
    this.keyLight.position.set(x, y, z)
  }

  /**
   * Apply a base rotation offset to the model pose. Animation plays on top of this.
   */
  setBaseRotation(x, y, z) {
    this.baseGroup.rotation.set(x, y, z)
  }

  /**
   * Uniformly scale the entire model group. Useful when imported models are too
   * small or too large relative to the camera frustum.
   * @param {number} scale - Uniform scale factor (e.g. 0.5 = half size, 2 = double)
   */
  setModelScale(scale) {
    this.baseGroup.scale.setScalar(scale)
  }

  /**
   * Swap the rendering mode.
   * @param {string} mode
   */
  setRenderMode(mode) {
    const newRenderer = createRenderer(mode, this.effect.options)
    this.effect.setRenderer(newRenderer)
  }

  // ---------------------------------------------------------------------------
  // Export / playback utilities
  // ---------------------------------------------------------------------------

  /**
   * Get the bitmap output canvas element.
   * @returns {HTMLCanvasElement}
   */
  getCanvas() {
    if (!this.effect.bitmapCanvas) {
      throw new Error('BitmapEffect canvas not available — was dispose() called?')
    }
    return this.effect.bitmapCanvas
  }

  /**
   * Get the total duration of one animation loop in milliseconds.
   * @returns {number}
   */
  getLoopDurationMs() {
    return this.animationEngine.getLoopDurationMs()
  }

  /** Pause the live animation loop. */
  pauseLoop() {
    this.renderer.setAnimationLoop(null)
  }

  /** Resume the live animation loop. */
  resumeLoop() {
    this.lastFrameTime = performance.now()
    this.renderer.setAnimationLoop(this._animationLoop)
  }

  /** Render a single frame without advancing animation time. */
  renderOnce() {
    this.effect.render(this.scene, this.camera)
  }

  /**
   * Seek the animation to a specific time and render one frame.
   * @param {number} absoluteTimeMs
   */
  renderAtTime(absoluteTimeMs) {
    this.animationEngine.seekTo(absoluteTimeMs, this.animGroup, this.effect, this.camera)
    this.renderOnce()
  }

  /**
   * Register a callback invoked once per animation frame.
   * @param {(() => void) | null} callback
   */
  setOnFrameRendered(callback) {
    this._onFrameRendered = callback
  }

  /** Remove the frame-rendered callback. */
  clearOnFrameRendered() {
    this._onFrameRendered = null
  }

  /**
   * Reset animation to t=0 and render the first frame.
   */
  resetToLoopStart() {
    this.animationEngine.resetToStart()
    if (this.hasObject()) {
      this.animGroup.rotation.set(0, 0, 0)
    }
    this.camera.position.set(0, 0.5, 5)
    this.camera.lookAt(0, 0, 0)
    if (this.animationEngine.useFadeInOut) {
      this.effect.startAnimation('fadeIn')
    } else {
      this.effect.startAnimation('show')
    }
    this.renderOnce()
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /** Alias for dispose(). Provided for npm package consumers. */
  destroy() {
    this.dispose()
  }

  /**
   * Fully dispose the SceneManager: stops the animation loop, disposes the current object,
   * effect, and WebGL renderer, and removes the canvas from the DOM.
   */
  dispose() {
    this.renderer.setAnimationLoop(null)
    this._onFrameRendered = null
    this.renderer.domElement.removeEventListener('webglcontextlost', this._onContextLost)
    this.renderer.domElement.removeEventListener('webglcontextrestored', this._onContextRestored)
    this.disposeModel()
    this.effect.dispose()
    this.renderer.dispose()
    if (this.effect.domElement.parentNode) {
      this.effect.domElement.parentNode.removeChild(this.effect.domElement)
    }
  }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Recursively dispose geometries, materials, and textures inside a Three.js object.
 * @param {THREE.Object3D} obj
 */
function _disposeGroup(obj) {
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose?.()
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      for (const mat of mats) {
        if (!mat) continue
        // Dispose any map textures attached to the material
        for (const key of Object.keys(mat)) {
          const val = mat[key]
          if (val && typeof val === 'object' && typeof val.dispose === 'function' && val.isTexture) {
            val.dispose()
          }
        }
        mat.dispose?.()
      }
    }
  })
}

export { SceneManager }
