class BaseEffect {
  constructor(renderer, options = {}) {
    this.renderer = renderer
    this.options = {
      colors: ['#074434', '#ABC685', '#E8FF99', '#F7F9CE', '#FFF6E7'],
      backgroundColor: 'transparent',
      invert: false,
      minBrightness: 0.05,
      animationDuration: 2500,
      ...options
    }

    this.width = 1
    this.height = 1
    this.animationPhase = 'fadeIn'
    this.animationProgress = 0
    this.animationStartTime = 0
    this.isAnimating = false
    this.particles = []
    this.particlesInitialized = false

    this.domElement = document.createElement('div')
    this.domElement.style.cursor = 'default'

    this._colorLUT = null
    this._buildColorLUT()
  }

  setSize(width, height) {
    this.width = Math.max(1, Math.floor(width))
    this.height = Math.max(1, Math.floor(height))
    this.renderer.setSize(this.width, this.height)
    this.resetParticles()
  }

  updateOptions(nextOptions = {}) {
    const prevPixelSize = this.options.pixelSize
    this.options = { ...this.options, ...nextOptions }
    if (nextOptions.pixelSize && prevPixelSize !== nextOptions.pixelSize) {
      this.onStructuralOptionChange()
    } else {
      this.onOptionChange()
    }
    if (nextOptions.colors || nextOptions.invert !== undefined) {
      this._buildColorLUT()
    }
  }

  onOptionChange() {}

  onStructuralOptionChange() {}

  startAnimation(phase = 'fadeIn') {
    this.animationPhase = phase
    if (phase === 'fadeIn' || phase === 'fadeOut') {
      this.isAnimating = true
      this.animationStartTime = performance.now()
      this.animationProgress = 0
      this.resetParticles()
    } else {
      this.isAnimating = false
      this.animationProgress = 1
    }
  }

  isAnimationComplete() {
    return (this.animationPhase === 'fadeIn' || this.animationPhase === 'fadeOut') && this.animationProgress >= 1
  }

  getAnimationPhase() {
    return this.animationPhase
  }

  setAnimationPhase(phase) {
    this.animationPhase = phase
    if (phase === 'show') {
      this.isAnimating = false
    }
  }

  // Set phase and progress directly for frame-stepping during export.
  // Adjusts animationStartTime so tickAnimation() stays consistent.
  setPhaseProgress(phase, progress) {
    const clamped = Math.max(0, Math.min(1, progress))
    this.animationPhase = phase
    if (phase === 'fadeIn' || phase === 'fadeOut') {
      this.isAnimating = true
      this.animationStartTime = performance.now() - clamped * this.options.animationDuration
      this.animationProgress = clamped
      if (clamped === 0) this.resetParticles()
    } else {
      this.isAnimating = false
      this.animationProgress = 1
    }
  }

  tickAnimation() {
    if (!this.isAnimating) return
    const elapsed = performance.now() - this.animationStartTime
    this.animationProgress = Math.min(elapsed / this.options.animationDuration, 1)
  }

  resetParticles() {
    this.particles = []
    this.particlesInitialized = false
  }

  getBrightness(r, g, b) {
    return (0.3 * r + 0.59 * g + 0.11 * b) / 255
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  lerpColor(color1, color2, t) {
    const r1 = parseInt(color1.slice(1, 3), 16)
    const g1 = parseInt(color1.slice(3, 5), 16)
    const b1 = parseInt(color1.slice(5, 7), 16)
    const r2 = parseInt(color2.slice(1, 3), 16)
    const g2 = parseInt(color2.slice(3, 5), 16)
    const b2 = parseInt(color2.slice(5, 7), 16)

    const r = Math.round(r1 + (r2 - r1) * t)
    const g = Math.round(g1 + (g2 - g1) * t)
    const b = Math.round(b1 + (b2 - b1) * t)
    return `rgb(${r},${g},${b})`
  }

  _computeColorForBrightness(brightness) {
    const colors = this.options.colors
    if (!colors || colors.length === 0) return '#000000'
    if (colors.length === 1) return colors[0]

    const scaledPos = brightness * (colors.length - 1)
    const lowerIdx = Math.floor(scaledPos)
    const upperIdx = Math.min(lowerIdx + 1, colors.length - 1)
    const t = scaledPos - lowerIdx
    return this.lerpColor(colors[lowerIdx], colors[upperIdx], t)
  }

  _buildColorLUT() {
    const lut = new Array(256)
    for (let i = 0; i < 256; i++) {
      lut[i] = this._computeColorForBrightness(i / 255)
    }
    this._colorLUT = lut
  }

  getColorForBrightness(brightness) {
    if (!this._colorLUT) this._buildColorLUT()
    return this._colorLUT[Math.round(brightness * 255)]
  }

  applyAlpha(color, alpha) {
    if (alpha >= 1) return color
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      return `rgba(${r},${g},${b},${alpha})`
    }
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `,${alpha})`)
    }
    return color
  }

  initializeParticles(gridWidth, gridHeight, pixelSize, imageData, shouldDrawFn) {
    this.particles = []
    let idx = 0
    const maxDist = Math.sqrt(this.width * this.width + this.height * this.height) / 2

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const iOffset = (y * gridWidth + x) * 4
        const r = imageData[iOffset]
        const g = imageData[iOffset + 1]
        const b = imageData[iOffset + 2]
        const a = imageData[iOffset + 3]
        const brightness = this.getBrightness(r, g, b)

        if (a === 0 || brightness < this.options.minBrightness) {
          idx++
          continue
        }

        const adjustedBrightness = this.options.invert ? 1 - brightness : brightness
        if (!shouldDrawFn(adjustedBrightness, x, y)) {
          idx++
          continue
        }

        const finalX = x * pixelSize
        const finalY = y * pixelSize
        const seed = idx * 0.1
        const angle = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453
        const normalized = angle - Math.floor(angle)
        const theta = normalized * Math.PI * 2
        const distance = 300 + normalized * 500
        const startX = this.width / 2 + Math.cos(theta) * distance
        const startY = this.height / 2 + Math.sin(theta) * distance
        const dx = finalX - this.width / 2
        const dy = finalY - this.height / 2
        const distFromCenter = Math.sqrt(dx * dx + dy * dy)
        const delay = (distFromCenter / maxDist) * 0.4

        this.particles.push({
          idx,
          startX,
          startY,
          finalX,
          finalY,
          delay,
          distFromCenter,
          brightness: adjustedBrightness,
          color: this.getColorForBrightness(adjustedBrightness)
        })
        idx++
      }
    }

    this.particlesInitialized = true
  }

  dispose() {
    this.particles = []
    this.particlesInitialized = false
    this.isAnimating = false
    this.animationProgress = 0
  }
}

export { BaseEffect }
