/**
 * Bitmap Effect - Canvas-based halftone/dithered renderer
 * Renders solid pixel blocks or variable-size dots with scatter/gather animation.
 */
class BitmapEffect {
  constructor(renderer, options = {}) {
    const pixelSize = options.pixelSize ?? 6
    const ditherType = options.ditherType ?? 'bayer4x4'
    const colors = options.colors ?? ['#074434', '#ABC685', '#E8FF99', '#F7F9CE', '#FFF6E7']
    const backgroundColor = options.backgroundColor ?? '#0a0a0a'
    const invert = options.invert ?? false
    const minBrightness = options.minBrightness ?? 0.04
    const animationDuration = options.animationDuration ?? 2500

    // Animation state
    let animationProgress = 0
    let isAnimating = false
    let animationPhase = 'fadeIn'
    let animationStartTime = 0

    // Particle system
    let particles = []
    let particlesInitialized = false

    let width, height
    let gridWidth, gridHeight

    const domElement = document.createElement('div')
    domElement.style.cursor = 'default'

    const bitmapCanvas = document.createElement('canvas')
    bitmapCanvas.style.display = 'block'
    domElement.appendChild(bitmapCanvas)
    const bitmapCtx = bitmapCanvas.getContext('2d')

    const oCanvasImg = renderer.domElement
    const oCanvas = document.createElement('canvas')
    // Frequent getImageData readbacks are faster with this hint.
    const oCtx = oCanvas.getContext('2d', { willReadFrequently: true })

    const bayer4x4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ].map((row) => row.map((v) => v / 16))

    const bayer8x8 = [
      [0, 32, 8, 40, 2, 34, 10, 42],
      [48, 16, 56, 24, 50, 18, 58, 26],
      [12, 44, 4, 36, 14, 46, 6, 38],
      [60, 28, 52, 20, 62, 30, 54, 22],
      [3, 35, 11, 43, 1, 33, 9, 41],
      [51, 19, 59, 27, 49, 17, 57, 25],
      [15, 47, 7, 39, 13, 45, 5, 37],
      [63, 31, 55, 23, 61, 29, 53, 21]
    ].map((row) => row.map((v) => v / 64))

    this.setSize = function (w, h) {
      width = w
      height = h
      renderer.setSize(w, h)

      gridWidth = Math.max(1, Math.floor(width / pixelSize))
      gridHeight = Math.max(1, Math.floor(height / pixelSize))

      oCanvas.width = gridWidth
      oCanvas.height = gridHeight

      bitmapCanvas.width = width
      bitmapCanvas.height = height

      particlesInitialized = false
      particles = []
    }

    this.render = function (scene, camera) {
      renderer.render(scene, camera)
      renderBitmap()
    }

    this.startAnimation = function (phase = 'fadeIn') {
      animationPhase = phase
      if (phase === 'fadeIn' || phase === 'fadeOut') {
        isAnimating = true
        animationStartTime = performance.now()
        animationProgress = 0
        particlesInitialized = false
        particles = []
      } else if (phase === 'show') {
        isAnimating = false
        animationProgress = 1
      }
    }

    this.isAnimationComplete = function () {
      if (animationPhase === 'fadeIn' || animationPhase === 'fadeOut') {
        return animationProgress >= 1
      }
      return false
    }

    this.getAnimationPhase = function () {
      return animationPhase
    }

    this.setAnimationPhase = function (phase) {
      animationPhase = phase
      if (phase === 'show') {
        isAnimating = false
      }
    }

    this.domElement = domElement

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    function lerpColor(color1, color2, t) {
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

    function getColorForBrightness(brightness) {
      const numColors = colors.length
      if (numColors === 1) return colors[0]

      const scaledPos = brightness * (numColors - 1)
      const lowerIdx = Math.floor(scaledPos)
      const upperIdx = Math.min(lowerIdx + 1, numColors - 1)
      const t = scaledPos - lowerIdx

      return lerpColor(colors[lowerIdx], colors[upperIdx], t)
    }

    function applyAlpha(color, alpha) {
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

    function getBrightness(r, g, b) {
      return (0.3 * r + 0.59 * g + 0.11 * b) / 255
    }

    function getThreshold(x, y) {
      if (ditherType === 'bayer8x8') {
        return bayer8x8[y % 8][x % 8]
      }
      if (ditherType === 'bayer4x4') {
        return bayer4x4[y % 4][x % 4]
      }
      return 0.5
    }

    function shouldDraw(adjustedBrightness, x, y) {
      if (ditherType === 'variableDot') return adjustedBrightness > minBrightness
      return adjustedBrightness > getThreshold(x, y)
    }

    function drawPixel(x, y, adjustedBrightness, color, alpha = 1) {
      bitmapCtx.fillStyle = applyAlpha(color, alpha)
      if (ditherType === 'variableDot') {
        const baseRadius = pixelSize * 0.5
        const radius = Math.max(pixelSize * 0.12, baseRadius * (1 - adjustedBrightness))
        if (radius <= 0.2) return
        bitmapCtx.beginPath()
        bitmapCtx.arc(x + pixelSize / 2, y + pixelSize / 2, radius, 0, Math.PI * 2)
        bitmapCtx.fill()
      } else {
        bitmapCtx.fillRect(x, y, pixelSize, pixelSize)
      }
    }

    function initializeParticles(imgData) {
      particles = []
      let idx = 0

      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const iOffset = (y * gridWidth + x) * 4
          const r = imgData[iOffset]
          const g = imgData[iOffset + 1]
          const b = imgData[iOffset + 2]
          const a = imgData[iOffset + 3]

          const brightness = getBrightness(r, g, b)
          if (a === 0 || brightness < minBrightness) {
            idx++
            continue
          }

          const adjustedBrightness = invert ? 1 - brightness : brightness
          if (!shouldDraw(adjustedBrightness, x, y)) {
            idx++
            continue
          }

          const finalX = x * pixelSize
          const finalY = y * pixelSize

          const seed = idx * 0.1
          const angle = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453
          const normalized = angle - Math.floor(angle)
          const theta = normalized * Math.PI * 2
          const distance = 300 + (normalized * 500)
          const startX = width / 2 + Math.cos(theta) * distance
          const startY = height / 2 + Math.sin(theta) * distance

          const dx = finalX - width / 2
          const dy = finalY - height / 2
          const distFromCenter = Math.sqrt(dx * dx + dy * dy)
          const maxDist = Math.sqrt(width * width + height * height) / 2
          const delay = (distFromCenter / maxDist) * 0.4

          particles.push({
            startX,
            startY,
            finalX,
            finalY,
            delay,
            brightness: adjustedBrightness,
            color: getColorForBrightness(adjustedBrightness)
          })

          idx++
        }
      }

      particlesInitialized = true
    }

    function renderBitmap() {
      if (!oCtx || !bitmapCtx) return

      oCtx.clearRect(0, 0, gridWidth, gridHeight)
      oCtx.drawImage(oCanvasImg, 0, 0, gridWidth, gridHeight)
      const oImgData = oCtx.getImageData(0, 0, gridWidth, gridHeight).data

      if (isAnimating && animationProgress < 1) {
        const elapsed = performance.now() - animationStartTime
        animationProgress = Math.min(elapsed / animationDuration, 1)
      } else if (isAnimating && animationProgress >= 1) {
        animationProgress = 1
      }

      if (backgroundColor !== 'transparent') {
        bitmapCtx.fillStyle = backgroundColor
        bitmapCtx.fillRect(0, 0, width, height)
      } else {
        bitmapCtx.clearRect(0, 0, width, height)
      }

      if (isAnimating) {
        if (!particlesInitialized) {
          initializeParticles(oImgData)
        }

        if (particlesInitialized && particles.length > 0) {
          for (const p of particles) {
            let particleProgress, alpha
            if (animationPhase === 'fadeIn') {
              particleProgress = Math.max(0, Math.min(1, (animationProgress - p.delay) / (1 - p.delay)))
              const eased = easeInOutCubic(particleProgress)
              const x = p.startX + (p.finalX - p.startX) * eased
              const y = p.startY + (p.finalY - p.startY) * eased
              alpha = Math.min(1, particleProgress * 2)
              drawPixel(x, y, p.brightness, p.color, alpha)
            } else if (animationPhase === 'fadeOut') {
              particleProgress = Math.max(0, Math.min(1, (animationProgress - p.delay) / (1 - p.delay)))
              const eased = easeInOutCubic(particleProgress)
              const x = p.finalX + (p.startX - p.finalX) * eased
              const y = p.finalY + (p.startY - p.finalY) * eased
              alpha = Math.max(0, 1 - particleProgress * 2)
              drawPixel(x, y, p.brightness, p.color, alpha)
            }
          }
        }
      }

      if (!isAnimating || !particlesInitialized || particles.length === 0) {
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            const iOffset = (y * gridWidth + x) * 4
            const r = oImgData[iOffset]
            const g = oImgData[iOffset + 1]
            const b = oImgData[iOffset + 2]
            const a = oImgData[iOffset + 3]
            const brightness = getBrightness(r, g, b)

            if (a === 0 || brightness < minBrightness) continue

            const adjustedBrightness = invert ? 1 - brightness : brightness
            if (!shouldDraw(adjustedBrightness, x, y)) continue

            const color = getColorForBrightness(adjustedBrightness)
            drawPixel(x * pixelSize, y * pixelSize, adjustedBrightness, color, 1)
          }
        }
      }
    }
  }
}

export { BitmapEffect }
