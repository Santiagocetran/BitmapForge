import { BaseEffect } from './BaseEffect.js'
import { createFadeVariant } from './fadeVariants/index.js'
import { BitmapRenderer } from '../renderers/BitmapRenderer.js'
import { PostProcessingChain } from '../postprocessing/PostProcessingChain.js'
import { CrtEffect } from '../postprocessing/effects/CrtEffect.js'
import { NoiseEffect } from '../postprocessing/effects/NoiseEffect.js'
import { ColorShiftEffect } from '../postprocessing/effects/ColorShiftEffect.js'

class BitmapEffect extends BaseEffect {
  constructor(renderer, options = {}) {
    super(renderer, {
      pixelSize: 3,
      ditherType: 'bayer4x4',
      colors: [
        '#021a15',
        '#053a2a',
        '#074434',
        '#0a5845',
        '#1a7a5e',
        '#4d9977',
        '#ABC685',
        '#E8FF99',
        '#F7F9CE',
        '#FFF6E7'
      ],
      backgroundColor: 'transparent',
      invert: false,
      minBrightness: 0.05,
      animationDuration: 2500,
      ...options
    })

    this.sampleCanvas = document.createElement('canvas')
    this.sampleCtx = this.sampleCanvas.getContext('2d', { willReadFrequently: true })
    this.gridWidth = 1
    this.gridHeight = 1

    // Active renderer — swappable without restarting the effect.
    // _pendingRenderer queues a swap requested mid-fade; applied after fade completes.
    this._activeRenderer = new BitmapRenderer(this.options)
    this._pendingRenderer = null
    this.domElement.appendChild(this._activeRenderer.canvas)

    // Post-processing chain — effects applied after the renderer draws each frame
    this._postChain = new PostProcessingChain()
    this._postChain.addEffect('crt', new CrtEffect())
    this._postChain.addEffect('noise', new NoiseEffect())
    this._postChain.addEffect('colorShift', new ColorShiftEffect())

    // Active fade variant — recreated whenever options.fadeVariant changes.
    const initialVariant = this.options.fadeVariant ?? 'cascade'
    this.fadeVariant = createFadeVariant(initialVariant)
    this._currentFadeVariantKey = initialVariant
  }

  /** The visible output canvas from the active renderer. */
  get bitmapCanvas() {
    return this._activeRenderer?.canvas ?? null
  }

  /**
   * Swap the active renderer. If a fade animation is in progress, the swap is
   * queued and applied at the next frame boundary after the fade completes.
   * @param {import('../renderers/BaseRenderer.js').BaseRenderer} newRenderer
   */
  setRenderer(newRenderer) {
    if (this.isAnimating) {
      this._pendingRenderer = newRenderer
      return
    }
    this._swapRenderer(newRenderer)
  }

  _swapRenderer(newRenderer) {
    const oldCanvas = this._activeRenderer?.canvas
    if (oldCanvas?.parentNode) {
      oldCanvas.parentNode.removeChild(oldCanvas)
    }
    this._activeRenderer?.dispose()
    this._activeRenderer = newRenderer
    // Sync current options before init so the new renderer starts with correct state.
    this._activeRenderer.updateOptions(this.options)
    this._activeRenderer.init(this.width, this.height)
    this.domElement.appendChild(this._activeRenderer.canvas)
    this._pendingRenderer = null
    this.resetParticles()
  }

  setSize(width, height) {
    super.setSize(width, height)
    this.gridWidth = Math.max(1, Math.floor(this.width / this.options.pixelSize))
    this.gridHeight = Math.max(1, Math.floor(this.height / this.options.pixelSize))
    this.sampleCanvas.width = this.gridWidth
    this.sampleCanvas.height = this.gridHeight
    this._activeRenderer?.setSize(this.width, this.height)
  }

  onStructuralOptionChange() {
    // Recalculate grid dimensions and resize canvases. This calls super.setSize()
    // which resets particles — any in-flight fade animation will restart.
    this.setSize(this.width, this.height)
  }

  updateOptions(nextOptions = {}) {
    super.updateOptions(nextOptions)
    this._activeRenderer?.updateOptions(nextOptions)
  }

  render(scene, camera) {
    this.renderer.render(scene, camera)
    this.tickAnimation()
    this.renderBitmap()
  }

  renderBitmap() {
    if (!this.sampleCtx || !this._activeRenderer) return

    // Apply a pending renderer swap now that the fade has completed.
    if (this._pendingRenderer && !this.isAnimating) {
      this._swapRenderer(this._pendingRenderer)
    }

    // Swap variant instance when the store option changes and restart the fade
    // so the new style plays immediately from the beginning.
    const wantedVariant = this.options.fadeVariant ?? 'cascade'
    if (wantedVariant !== this._currentFadeVariantKey) {
      this._currentFadeVariantKey = wantedVariant
      this.fadeVariant = createFadeVariant(wantedVariant)
      this.startAnimation('fadeIn')
    }

    this.sampleCtx.clearRect(0, 0, this.gridWidth, this.gridHeight)
    this.sampleCtx.drawImage(this.renderer.domElement, 0, 0, this.gridWidth, this.gridHeight)
    const imageData = this.sampleCtx.getImageData(0, 0, this.gridWidth, this.gridHeight).data

    this._activeRenderer.beginFrame(this.options.backgroundColor)

    if (this.isAnimating) {
      if (!this.particlesInitialized) {
        this.initializeParticles(
          this.gridWidth,
          this.gridHeight,
          this.options.pixelSize,
          imageData,
          (brightness, x, y) => this._activeRenderer.shouldDraw(brightness, x, y)
        )
        // Let the variant attach any per-particle metadata it needs.
        this.fadeVariant.initVariantMetadata(
          this.particles,
          this.width,
          this.height,
          this.options.pixelSize,
          this.gridWidth,
          this.gridHeight
        )
      }

      // Variant returns draw descriptors; the active renderer owns the canvas and draws them.
      const visiblePixels = this.fadeVariant.getVisiblePixels(
        this.particles,
        this.animationProgress,
        this.animationPhase,
        (t) => this.easeInOutCubic(t)
      )
      for (const px of visiblePixels) {
        this._activeRenderer.drawPixel(px.x, px.y, px.brightness, px.color, px.alpha)
      }
    }

    if (!this.isAnimating || this.particles.length === 0) {
      this._activeRenderer.render(imageData, this.gridWidth, this.gridHeight, (b) => this.getColorForBrightness(b))
    }

    this._activeRenderer.endFrame()

    // Post-processing: applied after renderer draws, before next frame.
    // Update enabled state for each effect from current options.
    this._postChain.setEnabled('crt', !!this.options.crtEnabled)
    this._postChain.setEnabled('noise', !!this.options.noiseEnabled)
    this._postChain.setEnabled('colorShift', !!this.options.colorShiftEnabled)

    if (this._postChain.hasEnabledEffects()) {
      const ctx = this._activeRenderer.canvas?.getContext('2d')
      if (ctx) this._postChain.apply(ctx, this.width, this.height, this.options)
    }
  }

  dispose() {
    this._postChain = null
    this._activeRenderer?.dispose()
    this._activeRenderer = null
    this._pendingRenderer = null
    this.sampleCanvas = null
    this.sampleCtx = null
    super.dispose()
  }
}

export { BitmapEffect }
