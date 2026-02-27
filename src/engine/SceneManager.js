import * as THREE from 'three'
import { BitmapEffect } from './effects/BitmapEffect.js'
import { loadModel } from './loaders/modelLoader.js'
import { AnimationEngine } from './animation/AnimationEngine.js'

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
    this.modelGroup = null
    this.currentObjectUrl = null
    this.lastFrameTime = performance.now()

    this._onFrameRendered = null
    this._animationLoop = () => {
      const now = performance.now()
      const deltaSeconds = Math.max(0, Math.min((now - this.lastFrameTime) / 1000, 0.25))
      this.lastFrameTime = now
      if (this.modelGroup) {
        this.animationEngine.update(this.animGroup, this.effect, deltaSeconds)
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

  /**
   * Resize the rendering viewport.
   * Called by the React integration layer (PreviewCanvas) on container resize.
   * The engine intentionally does not observe resize itself to stay framework-agnostic.
   * @param {number} width - Width in CSS pixels
   * @param {number} height - Height in CSS pixels
   */
  setSize(width, height) {
    const w = Math.max(1, Math.floor(width))
    const h = Math.max(1, Math.floor(height))
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.effect.setSize(w, h)
  }

  /**
   * Load a 3D model file into the scene. Disposes any previous model.
   * Triggers a fadeIn animation on success.
   * Supported formats: .stl, .obj, .gltf, .glb
   * @param {File} file - The model file to load
   * @returns {Promise<void>}
   */
  async loadModel(file) {
    if (this._loading) return
    this._loading = true
    try {
      const { group, objectUrl } = await loadModel(file)
      this.disposeModel()
      this.modelGroup = group
      this.currentObjectUrl = objectUrl
      this.animGroup.add(this.modelGroup)
      // Reset animation rotation so each new model starts from the base pose.
      this.animGroup.rotation.set(0, 0, 0)
      this.effect.startAnimation('fadeIn')
    } finally {
      this._loading = false
    }
  }

  /**
   * Remove and dispose the current 3D model, freeing GPU resources.
   * Safe to call when no model is loaded (no-op).
   */
  disposeModel() {
    if (!this.modelGroup) return
    this.animGroup.remove(this.modelGroup)
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

  /**
   * Update bitmap rendering options. Changes apply on the next render frame.
   * @param {{ pixelSize?: number, ditherType?: string, colors?: string[], invert?: boolean, minBrightness?: number, backgroundColor?: string, animationDuration?: number }} options
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
   * Update animation behavior. Changes apply on the next animation frame.
   * @param {{ useFadeInOut?: boolean, animationEffects?: Record<string, boolean>, animationSpeed?: number, showPhaseDuration?: number, animationDuration?: number, animationPreset?: string, rotateOnShow?: boolean, showPreset?: string }} options
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
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setLightDirection(x, y, z) {
    this.keyLight.position.set(x, y, z)
  }

  /**
   * Apply a base rotation offset to the model pose. Animation plays on top of this.
   * @param {number} x - Euler X in radians
   * @param {number} y - Euler Y in radians
   * @param {number} z - Euler Z in radians
   */
  setBaseRotation(x, y, z) {
    this.baseGroup.rotation.set(x, y, z)
  }

  /**
   * Get the bitmap output canvas element (the visible canvas with the dithered effect).
   * Used by export functions to capture frames.
   * @returns {HTMLCanvasElement | null}
   */
  getCanvas() {
    if (!this.effect.bitmapCanvas) {
      throw new Error('BitmapEffect canvas not available — was dispose() called?')
    }
    return this.effect.bitmapCanvas
  }

  /**
   * Get the total duration of one animation loop in milliseconds.
   * Used by export functions to know how many frames to capture.
   * @returns {number}
   */
  getLoopDurationMs() {
    return this.animationEngine.getLoopDurationMs()
  }

  /**
   * Get the export loop duration: pure rotation cycle with no fade phases, capped at 3 seconds.
   * All exporters should use this instead of getLoopDurationMs() to produce short, clean loops.
   * @returns {number}
   */
  getExportLoopDurationMs() {
    return this.animationEngine.getExportLoopDurationMs()
  }

  /**
   * Seek to an absolute time and render one frame in "show" mode (no fade-in/out).
   * Used by frame-based exporters (APNG, GIF, sprite sheet, single HTML).
   * @param {number} absoluteTimeMs
   */
  renderAtTimeForExport(absoluteTimeMs) {
    this.animationEngine.seekToExport(absoluteTimeMs, this.animGroup, this.effect)
    this.renderOnce()
  }

  /**
   * Prepare the live animation loop for video export: disables fade-in/out,
   * resets rotation to t=0, and starts in "show" phase.
   * Call restoreAfterVideoExport() when recording is done.
   */
  prepareForVideoExport() {
    this._savedFadeInOut = this.animationEngine.useFadeInOut
    this.animationEngine.useFadeInOut = false
    this.animGroup.rotation.set(0, 0, 0)
    this.animationEngine.resetToStart()
    this.effect.startAnimation('show')
    this.renderOnce()
  }

  /**
   * Restore fade-in/out setting after video export.
   */
  restoreAfterVideoExport() {
    if (this._savedFadeInOut !== undefined) {
      this.animationEngine.useFadeInOut = this._savedFadeInOut
      delete this._savedFadeInOut
    }
  }

  /**
   * Pause the live animation loop. Use before frame-stepping during export.
   * Always call resumeLoop() when done.
   */
  pauseLoop() {
    this.renderer.setAnimationLoop(null)
  }

  /**
   * Resume the live animation loop after export or pause.
   * Resets lastFrameTime to avoid a large delta spike on the first resumed frame.
   */
  resumeLoop() {
    this.lastFrameTime = performance.now()
    this.renderer.setAnimationLoop(this._animationLoop)
  }

  /**
   * Render a single frame with the current scene state. Does not advance animation time.
   */
  renderOnce() {
    this.effect.render(this.scene, this.camera)
  }

  /**
   * Seek the animation to a specific time within the loop and render one frame.
   * Used for export: step through the loop to capture frames at precise timestamps.
   * @param {number} absoluteTimeMs - Time in milliseconds within the loop (0 to getLoopDurationMs())
   */
  renderAtTime(absoluteTimeMs) {
    this.animationEngine.seekTo(absoluteTimeMs, this.animGroup, this.effect)
    this.renderOnce()
  }

  /**
   * Register a callback invoked once per animation frame, after the bitmap effect renders.
   * Used by video export to composite frames to a recording canvas.
   * @param {(() => void) | null} callback
   */
  setOnFrameRendered(callback) {
    this._onFrameRendered = callback
  }

  /**
   * Remove the frame-rendered callback.
   */
  clearOnFrameRendered() {
    this._onFrameRendered = null
  }

  /**
   * Reset animation to t=0 and render the first frame.
   * Used before video recording to ensure the loop starts from the beginning.
   */
  resetToLoopStart() {
    this.animationEngine.resetToStart()
    if (this.modelGroup) {
      // Reset the animation layer only — baseGroup keeps the user's pose offset.
      this.animGroup.rotation.set(0, 0, 0)
    }
    if (this.animationEngine.useFadeInOut) {
      this.effect.startAnimation('fadeIn')
    } else {
      this.effect.startAnimation('show')
    }
    this.renderOnce()
  }

  /**
   * Fully dispose the SceneManager: stops the animation loop, disposes the model,
   * effect, and WebGL renderer, and removes the canvas from the DOM.
   * Safe to call multiple times (idempotent for the model and renderer).
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

export { SceneManager }
