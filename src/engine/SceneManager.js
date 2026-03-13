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
 * Layer model: the scene supports N independent layers. Each layer is a named Three.js Group
 * inside `animGroup`, so global animation (spin/float) applies to all layers together.
 * Per-layer transforms (position/rotation/scale) are applied to the individual group.
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

    /**
     * Active layers. Each entry: { id, group, objectUrl, type, name, visible }
     * All groups are direct children of animGroup.
     * @type {Map<string, {id: string, group: THREE.Group, objectUrl: string|null, type: string, name: string, visible: boolean}>}
     */
    this.layers = new Map()

    this.currentObjectUrl = null // legacy alias kept for external compat; points to last loaded URL
    this.lastFrameTime = performance.now()

    this._onFrameRendered = null
    this._animationLoop = () => {
      const now = performance.now()
      const deltaSeconds = Math.max(0, Math.min((now - this.lastFrameTime) / 1000, 0.25))
      this.lastFrameTime = now
      if (this.hasLayers()) {
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

  // ---------------------------------------------------------------------------
  // Layer management (multi-layer API)
  // ---------------------------------------------------------------------------

  /**
   * Whether any layers are currently loaded.
   * @returns {boolean}
   */
  hasLayers() {
    return this.layers.size > 0
  }

  /**
   * Get a snapshot of layer metadata (id, type, name, visible).
   * Does not expose Three.js internals.
   * @returns {Array<{id: string, type: string, name: string, visible: boolean}>}
   */
  getLayers() {
    return Array.from(this.layers.values()).map(({ id, type, name, visible }) => ({ id, type, name, visible }))
  }

  /**
   * Add a loaded 3D model file as a new layer. Does NOT clear other layers.
   * @param {string} id - Unique layer id (caller-supplied, e.g. nanoid())
   * @param {File} file
   * @param {string} [name]
   * @returns {Promise<void>}
   */
  async addModelLayer(id, file, name) {
    const { group, objectUrl } = await loadModel(file)
    this._addLayerEntry(id, group, objectUrl, 'model', name ?? file.name)
  }

  /**
   * Add a built-in shape primitive as a new layer. Synchronous.
   * @param {string} id
   * @param {string} type - shape type key
   * @param {object} [params]
   * @param {string} [name]
   */
  addShapeLayer(id, type, params = {}, name) {
    const group = createShape(type, params)
    this._addLayerEntry(id, group, null, 'shape', name ?? type)
  }

  /**
   * Add 3D extruded text as a new layer.
   * @param {string} id
   * @param {string} text
   * @param {object} [opts]
   * @param {string} [name]
   * @returns {Promise<void>}
   */
  async addTextLayer(id, text, opts = {}, name) {
    const group = await createTextGroup(text, opts)
    this._addLayerEntry(id, group, null, 'text', name ?? `Text "${text.slice(0, 12)}"`)
  }

  /**
   * Add an image/SVG file as a textured plane layer.
   * @param {string} id
   * @param {File} file
   * @param {string} [name]
   * @returns {Promise<void>}
   */
  async addImageLayer(id, file, name) {
    const { group, objectUrl } = await createImagePlane(file)
    this._addLayerEntry(id, group, objectUrl, 'image', name ?? file.name)
  }

  /**
   * Internal: register a Three.js group as a layer, add it to animGroup.
   * @param {string} id
   * @param {THREE.Group} group
   * @param {string|null} objectUrl
   * @param {string} type
   * @param {string} name
   */
  _addLayerEntry(id, group, objectUrl, type, name) {
    const wasEmpty = this.layers.size === 0
    const index = this.layers.size // renderOrder = position in insertion sequence
    group.renderOrder = index
    this.animGroup.add(group)
    this.layers.set(id, { id, group, objectUrl, type, name, visible: true })
    this.currentObjectUrl = objectUrl // legacy alias
    if (wasEmpty) {
      // Trigger fade-in animation only when scene goes from empty to having content
      this.animGroup.rotation.set(0, 0, 0)
      this.effect.startAnimation('fadeIn')
    }
  }

  /**
   * Remove a layer by id. Disposes Three.js resources and revokes object URLs.
   * @param {string} id
   */
  removeLayer(id) {
    const entry = this.layers.get(id)
    if (!entry) return
    this.animGroup.remove(entry.group)
    _disposeGroup(entry.group)
    if (entry.objectUrl) {
      URL.revokeObjectURL(entry.objectUrl)
    }
    this.layers.delete(id)
    // Reassign renderOrder to remaining layers to keep indices contiguous
    let i = 0
    for (const e of this.layers.values()) {
      e.group.renderOrder = i++
    }
  }

  /**
   * Remove all layers, disposing their Three.js resources.
   */
  clearLayers() {
    for (const id of Array.from(this.layers.keys())) {
      this.removeLayer(id)
    }
  }

  /**
   * Show or hide a layer without removing it.
   * @param {string} id
   * @param {boolean} visible
   */
  setLayerVisible(id, visible) {
    const entry = this.layers.get(id)
    if (!entry) return
    entry.group.visible = visible
    entry.visible = visible
  }

  /**
   * Apply a positional/rotational/scale transform to a layer group.
   * Transform is relative to the scene centre (animGroup space).
   * @param {string} id
   * @param {{ position?: {x,y,z}, rotation?: {x,y,z}, scale?: number }} transform
   */
  setLayerTransform(id, transform) {
    const entry = this.layers.get(id)
    if (!entry) return
    const { position, rotation, scale } = transform
    if (position) entry.group.position.set(position.x, position.y, position.z)
    if (rotation) entry.group.rotation.set(rotation.x, rotation.y, rotation.z)
    if (scale !== undefined) entry.group.scale.setScalar(scale)
  }

  /**
   * Reorder layers to match the supplied id array.
   * Updates `renderOrder` on each group so painter's order is respected.
   * @param {string[]} ids - Layer ids in desired display order (first = bottom)
   */
  reorderLayers(ids) {
    ids.forEach((id, index) => {
      const entry = this.layers.get(id)
      if (entry) entry.group.renderOrder = index
    })
    // Rebuild Map in new order to keep getLayers() / iteration order consistent
    const sorted = new Map()
    for (const id of ids) {
      const e = this.layers.get(id)
      if (e) sorted.set(id, e)
    }
    // Preserve any ids not in the supplied list (shouldn't happen, but guard)
    for (const [id, e] of this.layers) {
      if (!sorted.has(id)) sorted.set(id, e)
    }
    this.layers = sorted
  }

  // ---------------------------------------------------------------------------
  // Backward-compatible single-object API
  // All four wrappers clear existing layers then add one, preserving old behavior.
  // ---------------------------------------------------------------------------

  /**
   * @deprecated Prefer addModelLayer() for multi-layer use.
   * Load a 3D model file, replacing all existing layers.
   * @param {File} file
   * @returns {Promise<void>}
   */
  async loadModel(file) {
    if (this._loading) return
    this._loading = true
    try {
      this.clearLayers()
      await this.addModelLayer(_tempId(), file, file.name)
    } finally {
      this._loading = false
    }
  }

  /**
   * @deprecated Prefer addShapeLayer() for multi-layer use.
   * Load a shape, replacing all existing layers.
   * @param {string} type
   * @param {object} [params]
   */
  loadShape(type, params = {}) {
    this.clearLayers()
    this.addShapeLayer(_tempId(), type, params, type)
  }

  /**
   * @deprecated Prefer addTextLayer() for multi-layer use.
   * Load 3D text, replacing all existing layers.
   * @param {string} text
   * @param {object} [opts]
   * @returns {Promise<void>}
   */
  async loadText(text, opts = {}) {
    if (this._loading) return
    this._loading = true
    try {
      this.clearLayers()
      await this.addTextLayer(_tempId(), text, opts, `Text "${text.slice(0, 12)}"`)
    } finally {
      this._loading = false
    }
  }

  /**
   * @deprecated Prefer addImageLayer() for multi-layer use.
   * Load an image, replacing all existing layers.
   * @param {File} file
   * @returns {Promise<void>}
   */
  async loadImage(file) {
    if (this._loading) return
    this._loading = true
    try {
      this.clearLayers()
      await this.addImageLayer(_tempId(), file, file.name)
    } finally {
      this._loading = false
    }
  }

  /**
   * @deprecated Use clearLayers() for multi-layer use.
   * Remove and dispose all current layers.
   */
  disposeModel() {
    this.clearLayers()
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
    if (this.hasLayers()) {
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
   * Fully dispose the SceneManager: stops the animation loop, disposes all layers,
   * effect, and WebGL renderer, and removes the canvas from the DOM.
   */
  dispose() {
    this.renderer.setAnimationLoop(null)
    this._onFrameRendered = null
    this.renderer.domElement.removeEventListener('webglcontextlost', this._onContextLost)
    this.renderer.domElement.removeEventListener('webglcontextrestored', this._onContextRestored)
    this.clearLayers()
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

/** Generate a short unique id for single-layer compat wrappers. */
function _tempId() {
  return Math.random().toString(36).slice(2, 10)
}

export { SceneManager }
