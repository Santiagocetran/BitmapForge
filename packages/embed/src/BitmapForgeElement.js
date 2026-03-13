import { SceneManager } from '@engine/SceneManager.js'
import { parseProjectData } from './projectParser.js'

const OBSERVED_ATTRS = ['src', 'autoplay', 'loop', 'width', 'height', 'render-mode']

export class BitmapForgeElement extends HTMLElement {
  static get observedAttributes() {
    return OBSERVED_ATTRS
  }

  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = ':host { display: block; } canvas { width: 100%; height: 100%; }'
    this._container = document.createElement('div')
    this._container.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden'
    this._shadow.append(style, this._container)

    this._onVisibility = () => {
      if (document.hidden) this._manager?.pauseLoop?.()
      else this._manager?.resumeLoop?.()
    }
    document.addEventListener('visibilitychange', this._onVisibility)

    this._ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      this._manager?.setSize(width * devicePixelRatio, height * devicePixelRatio)
    })
    this._ro.observe(this._container)

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasAutoplay = this.hasAttribute('autoplay') && !prefersReduced

    if (hasAutoplay) {
      this._load()
    } else {
      this._io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !this._manager && !this._loading) this._load()
          if (!entry.isIntersecting) this._manager?.pauseLoop?.()
          else if (this._manager) this._manager?.resumeLoop?.()
        },
        { rootMargin: '100px' }
      )
      this._io.observe(this)
    }
  }

  disconnectedCallback() {
    this._io?.disconnect()
    this._ro?.disconnect()
    document.removeEventListener('visibilitychange', this._onVisibility)
    this._manager?.dispose()
    this._manager = null
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return
    if (name === 'src') {
      this._manager?.dispose()
      this._manager = null
      this._loading = false
      if (this.isConnected) this._load()
    }
    if (name === 'render-mode' && this._manager) {
      this._manager.setRenderMode(newVal)
    }
  }

  async _load() {
    const src = this.getAttribute('src')
    if (!src || this._loading) return
    this._loading = true
    try {
      const res = await fetch(src)
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${src}`)
      const text = await res.text()
      const { settings, modelData, inputType } = parseProjectData(text)

      const w = this._container.clientWidth || 400
      const h = this._container.clientHeight || 400

      this._manager = new SceneManager(this._container, { ...settings })
      this._manager.setSize(w * devicePixelRatio, h * devicePixelRatio)

      if (inputType === 'model' && modelData) {
        const binary = atob(modelData.data)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], { type: modelData.type })
        const file = new File([blob], modelData.name)
        await this._manager.loadModel(file)
      } else if (inputType === 'shape') {
        this._manager.loadShape(settings.shapeType, settings.shapeParams)
      } else if (inputType === 'text') {
        await this._manager.loadText(settings.textContent, {
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          extrudeDepth: settings.extrudeDepth,
          bevelEnabled: settings.bevelEnabled
        })
      } else if (inputType === 'image') {
        console.warn(
          '[bitmap-forge] Image input type is not supported in embed mode (File objects cannot be serialized in .bforge). Use a shape, text, or 3D model instead.'
        )
      }

      const renderMode = this.getAttribute('render-mode') ?? settings.renderMode ?? 'bitmap'
      this._manager.setRenderMode(renderMode)
      this._manager.updateAnimationOptions({ ...settings })
      this._manager.updateEffectOptions({ ...settings })
    } catch (err) {
      console.error('[bitmap-forge] Failed to load animation:', err)
    } finally {
      this._loading = false
    }
  }
}

export function defineBitmapForgeElement(tag = 'bitmap-forge') {
  if (typeof customElements === 'undefined') return // SSR guard
  if (!customElements.get(tag)) {
    customElements.define(tag, BitmapForgeElement)
  }
}
