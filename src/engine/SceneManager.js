import * as THREE from 'three'
import { BitmapEffect } from './effects/BitmapEffect.js'
import { loadModel, prepareSource } from './loaders/modelLoader.js'
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

    // When the user switches fade variant mid-loop, reset the model rotation so the
    // new fadeIn always captures the front-facing pose.
    this.effect.onVariantChange = () => {
      if (this._disposed) return
      this.animationEngine.onExternalFadeRestart(this.animGroup)
    }

    this._disposed = false
    this._loadGeneration = 0
    this._loading = false
    this._source = null
    this.objectGroup = null
    this.currentObjectUrl = null
    this.lastFrameTime = performance.now()

    this._onFrameRendered = null
    this._animationLoop = () => {
      if (this._disposed) return
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
      if (this._disposed) return
      event.preventDefault()
      this.renderer.setAnimationLoop(null)
    }
    this._onContextRestored = () => {
      if (this._disposed) return
      this.renderer.setAnimationLoop(this._animationLoop)
    }
    this.renderer.domElement.addEventListener('webglcontextlost', this._onContextLost)
    this.renderer.domElement.addEventListener('webglcontextrestored', this._onContextRestored)
  }

  hasObject() {
    return this.objectGroup !== null
  }

  // Loaders prepare unattached resources. Only the latest live request may publish.
  // No abort API exists for the Three.js decoders/font imports; stale completions
  // must still be collected and released, including after this manager is gone.
  async _loadSource(prepare, type) {
    if (this._disposed) return
    const generation = ++this._loadGeneration
    this._loading = true
    try {
      const result = await prepare()
      const source = prepareSource(result.group ?? result, result.objectUrl ?? null, { type })
      this._commitSource(source, generation)
    } finally {
      if (generation === this._loadGeneration && !this._disposed) this._loading = false
    }
  }

  _commitSource(source, generation) {
    if (this._disposed || generation !== this._loadGeneration) {
      source.dispose()
      return
    }
    const previousRotation = this.animGroup.rotation.clone()
    try {
      this.animGroup.add(source.group)
      this.animGroup.rotation.set(0, 0, 0)
      this.effect.startAnimation('fadeIn')
    } catch (error) {
      this.animGroup.remove(source.group)
      this.animGroup.rotation.copy(previousRotation)
      source.dispose()
      throw error
    }
    this._releaseSource()
    this._source = source
    this.objectGroup = source.group
    this.currentObjectUrl = source.objectUrl
  }

  async loadModel(file) {
    return this._loadSource(() => loadModel(file), 'model')
  }

  loadShape(type, params = {}) {
    if (this._disposed) return
    const generation = ++this._loadGeneration
    this._loading = false
    this._commitSource(prepareSource(createShape(type, params), null, { type: 'shape' }), generation)
  }

  async loadText(text, opts = {}) {
    return this._loadSource(() => createTextGroup(text, opts), 'text')
  }

  async loadImage(file) {
    return this._loadSource(() => createImagePlane(file), 'image')
  }

  _releaseSource() {
    if (this.objectGroup) this.animGroup.remove(this.objectGroup)
    this._source?.dispose()
    this._source = null
    this.objectGroup = null
    this.currentObjectUrl = null
  }

  disposeModel() {
    // Explicit removal also cancels pending preparation, not only the visible object.
    ++this._loadGeneration
    this._loading = false
    this._releaseSource()
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
    if (this._disposed) return
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
    if (this._disposed) return
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
    if (this._disposed) return
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
    if (this._disposed) return
    this.keyLight.position.set(x, y, z)
  }

  /**
   * Apply a base rotation offset to the model pose. Animation plays on top of this.
   */
  setBaseRotation(x, y, z) {
    if (this._disposed) return
    this.baseGroup.rotation.set(x, y, z)
  }

  /**
   * Uniformly scale the entire model group. Useful when imported models are too
   * small or too large relative to the camera frustum.
   * @param {number} scale - Uniform scale factor (e.g. 0.5 = half size, 2 = double)
   */
  setModelScale(scale) {
    if (this._disposed) return
    this.baseGroup.scale.setScalar(scale)
  }

  /**
   * Uniformly scale the image plane. Kept separate from setModelScale so model
   * and image scales don't bleed into each other when switching input tabs.
   * @param {number} scale - Uniform scale factor (e.g. 0.5 = half size, 2 = double)
   */
  setImageScale(scale) {
    if (this._disposed) return
    this.baseGroup.scale.setScalar(scale)
  }

  /**
   * Swap the rendering mode.
   * @param {string} mode
   */
  setRenderMode(mode) {
    if (this._disposed) return
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
    if (this._disposed) return
    this.renderer.setAnimationLoop(null)
  }

  /** Resume the live animation loop. */
  resumeLoop() {
    if (this._disposed) return
    this.lastFrameTime = performance.now()
    this.renderer.setAnimationLoop(this._animationLoop)
  }

  /** Render a single frame without advancing animation time. */
  renderOnce() {
    if (this._disposed) return
    this.effect.render(this.scene, this.camera)
  }

  /**
   * Seek the animation to a specific time and render one frame.
   * @param {number} absoluteTimeMs
   */
  renderAtTime(absoluteTimeMs) {
    if (this._disposed) return
    this.animationEngine.seekTo(absoluteTimeMs, this.animGroup, this.effect, this.camera)
    this.renderOnce()
  }

  /**
   * Register a callback invoked once per animation frame.
   * @param {(() => void) | null} callback
   */
  setOnFrameRendered(callback) {
    if (this._disposed) return
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
    if (this._disposed) return
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
    if (this._disposed) return
    this._disposed = true
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

export { SceneManager }
