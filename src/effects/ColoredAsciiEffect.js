/**
 * Colored ASCII Effect - Canvas-based for smooth animation
 * Characters assemble from scattered positions to form the 3D model
 */
class ColoredAsciiEffect {
  constructor(renderer, charSet = ' .:-=+*#%@', options = {}) {
    const fResolution = options.resolution || 0.15
    const bInvert = options.invert || false

    // Color palette for depth (dark to bright)
    const colors = options.colors || ['#0d5164', '#c0c2ca', '#ffffff']

    // Animation state
    let animationProgress = 0
    let isAnimating = false
    let animationPhase = 'fadeIn' // 'fadeIn', 'fadeOut', or 'idle'
    let animationStartTime = 0
    const animationDuration = 2500 // ms

    // Character particles for animation
    let particles = []
    let particlesInitialized = false

    let width, height
    let iWidth, iHeight

    const domElement = document.createElement('div')
    domElement.style.cursor = 'default'

    // Create canvas for ASCII rendering
    const asciiCanvas = document.createElement('canvas')
    asciiCanvas.style.display = 'block'
    domElement.appendChild(asciiCanvas)
    const asciiCtx = asciiCanvas.getContext('2d')

    this.setSize = function (w, h) {
      width = w
      height = h
      renderer.setSize(w, h)

      iWidth = Math.floor(width * fResolution)
      iHeight = Math.floor(height * fResolution)

      oCanvas.width = iWidth
      oCanvas.height = iHeight

      asciiCanvas.width = width
      asciiCanvas.height = height

      // Reset particles on resize
      particlesInitialized = false
      particles = []
    }

    this.render = function (scene, camera) {
      renderer.render(scene, camera)
      renderAscii()
    }

    this.startAnimation = function (phase = 'fadeIn') {
      animationPhase = phase
      if (phase === 'fadeIn' || phase === 'fadeOut') {
        isAnimating = true
        animationStartTime = performance.now()
        animationProgress = 0
        if (phase === 'fadeIn') {
          particlesInitialized = false
          particles = []
        } else if (phase === 'fadeOut') {
          // For fadeOut, we need to reinitialize particles from current image
          // This ensures smooth transition from show phase
          particlesInitialized = false
        }
      } else if (phase === 'show') {
        // Show phase: no animation, just display the model
        isAnimating = false
        animationProgress = 1
      }
    }

    this.isAnimationComplete = function () {
      // For fadeIn/fadeOut, check if progress >= 1
      // For show phase, it's never "complete" - it's controlled by duration in main.js
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

    const oCanvasImg = renderer.domElement
    const oCanvas = document.createElement('canvas')

    if (!oCanvas.getContext) return

    const oCtx = oCanvas.getContext('2d')
    if (!oCtx.getImageData) return

    const aCharList = charSet.split('')

    // Font settings
    const fontSize = 10
    const charWidth = fontSize * 0.6
    const charHeight = fontSize * 1.2

    function getColorForBrightness(brightness) {
      // Handle any number of colors in the gradient
      const numColors = colors.length
      if (numColors === 1) return colors[0]

      // Map brightness (0-1) to color stops
      const scaledPos = brightness * (numColors - 1)
      const lowerIdx = Math.floor(scaledPos)
      const upperIdx = Math.min(lowerIdx + 1, numColors - 1)
      const t = scaledPos - lowerIdx

      return lerpColor(colors[lowerIdx], colors[upperIdx], t)
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

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3)
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    // Seeded random for consistent particle starting positions
    function seededRandom(seed) {
      const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453
      return x - Math.floor(x)
    }

    function initializeParticles(imgData) {
      particles = []
      const maxIdx = aCharList.length - 1

      let idx = 0
      for (let y = 0; y < iHeight; y++) {
        for (let x = 0; x < iWidth; x++) {
          const iOffset = (y * iWidth + x) * 4

          const iRed = imgData[iOffset]
          const iGreen = imgData[iOffset + 1]
          const iBlue = imgData[iOffset + 2]
          const iAlpha = imgData[iOffset + 3]

          let fBrightness = (0.3 * iRed + 0.59 * iGreen + 0.11 * iBlue) / 255
          const isBackground = iAlpha === 0 || fBrightness > 0.95

          if (iAlpha === 0) fBrightness = 1

          let iCharIdx = Math.round((1 - fBrightness) * maxIdx)
          if (bInvert) iCharIdx = maxIdx - iCharIdx

          const char = aCharList[iCharIdx]

          // Only create particles for visible characters (not background)
          if (!isBackground && char && char !== ' ') {
            // Final position (where it should end up)
            const finalX = (x / iWidth) * width
            const finalY = (y / iHeight) * height

            // Starting position (scattered around the screen)
            const seed = idx * 0.1
            const angle = seededRandom(seed) * Math.PI * 2
            const distance = 300 + seededRandom(seed + 1) * 500
            const startX = width / 2 + Math.cos(angle) * distance
            const startY = height / 2 + Math.sin(angle) * distance

            // Delay based on distance from center (closer = earlier)
            const dx = finalX - width / 2
            const dy = finalY - height / 2
            const distFromCenter = Math.sqrt(dx * dx + dy * dy)
            const maxDist = Math.sqrt(width * width + height * height) / 2
            const delay = (distFromCenter / maxDist) * 0.4

            const colorBrightness = bInvert ? fBrightness : (1 - fBrightness)

            particles.push({
              char,
              startX,
              startY,
              finalX,
              finalY,
              delay,
              color: getColorForBrightness(colorBrightness)
            })
          }

          idx++
        }
      }

      particlesInitialized = true
    }

    function renderAscii() {
      oCtx.clearRect(0, 0, iWidth, iHeight)
      oCtx.drawImage(oCanvasImg, 0, 0, iWidth, iHeight)
      const oImgData = oCtx.getImageData(0, 0, iWidth, iHeight).data

      // Update animation progress
      if (isAnimating && animationProgress < 1) {
        const elapsed = performance.now() - animationStartTime
        animationProgress = Math.min(elapsed / animationDuration, 1)
      } else if (isAnimating && animationProgress >= 1) {
        // Animation complete - will be handled by main loop
        animationProgress = 1
      }

      // Clear canvas
      asciiCtx.fillStyle = '#0a0a0a'
      asciiCtx.fillRect(0, 0, width, height)

      // Set font
      asciiCtx.font = `${fontSize}px "Courier New", monospace`
      asciiCtx.textBaseline = 'top'

      // If animating (fadeIn or fadeOut), use particle system
      if (isAnimating) {
        // Initialize particles on first frame of fadeIn animation
        if (animationPhase === 'fadeIn' && !particlesInitialized) {
          initializeParticles(oImgData)
        }

        // For fadeOut, reinitialize particles from current image for smooth transition
        // This is important when transitioning from show phase where model may have rotated
        if (animationPhase === 'fadeOut' && !particlesInitialized) {
          initializeParticles(oImgData)
        }

        // Render particles if they're initialized
        if (particlesInitialized && particles.length > 0) {
          for (const p of particles) {
            let particleProgress, alpha

            if (animationPhase === 'fadeIn') {
              // Fade in: particles move from scattered to final positions
              particleProgress = Math.max(
                0,
                Math.min(1, (animationProgress - p.delay) / (1 - p.delay))
              )

              const easedProgress = easeInOutCubic(particleProgress)

              // Interpolate position from start to final
              const x = p.startX + (p.finalX - p.startX) * easedProgress
              const y = p.startY + (p.finalY - p.startY) * easedProgress

              // Fade in as it approaches final position
              alpha = Math.min(1, particleProgress * 2)

              asciiCtx.fillStyle = p.color.replace('rgb', 'rgba').replace(')', `,${alpha})`)
              asciiCtx.fillText(p.char, x, y)
            } else if (animationPhase === 'fadeOut') {
              // Fade out: particles move from final positions back to scattered (inverted)
              // Use same delay as fadeIn so particles closer to center fade out first (inverse of fadeIn)
              particleProgress = Math.max(
                0,
                Math.min(1, (animationProgress - p.delay) / (1 - p.delay))
              )

              const easedProgress = easeInOutCubic(particleProgress)

              // Interpolate position from final back to start (inverted)
              const x = p.finalX + (p.startX - p.finalX) * easedProgress
              const y = p.finalY + (p.startY - p.finalY) * easedProgress

              // Fade out as it moves away (inverted alpha)
              alpha = Math.max(0, 1 - particleProgress * 2)

              asciiCtx.fillStyle = p.color.replace('rgb', 'rgba').replace(')', `,${alpha})`)
              asciiCtx.fillText(p.char, x, y)
            }
          }
        }
        // If particles aren't ready yet, fall through to normal rendering for smooth transition
      }

      // Normal rendering (show phase or particles not ready)
      if (!isAnimating || !particlesInitialized || particles.length === 0) {
        const maxIdx = aCharList.length - 1

        for (let y = 0; y < iHeight; y++) {
          for (let x = 0; x < iWidth; x++) {
            const iOffset = (y * iWidth + x) * 4

            const iRed = oImgData[iOffset]
            const iGreen = oImgData[iOffset + 1]
            const iBlue = oImgData[iOffset + 2]
            const iAlpha = oImgData[iOffset + 3]

            let fBrightness = (0.3 * iRed + 0.59 * iGreen + 0.11 * iBlue) / 255

            if (iAlpha === 0) fBrightness = 1

            let iCharIdx = Math.round((1 - fBrightness) * maxIdx)
            if (bInvert) iCharIdx = maxIdx - iCharIdx

            const char = aCharList[iCharIdx]

            if (char && char !== ' ') {
              const colorBrightness = bInvert ? fBrightness : (1 - fBrightness)
              asciiCtx.fillStyle = getColorForBrightness(colorBrightness)

              const drawX = (x / iWidth) * width
              const drawY = (y / iHeight) * height
              asciiCtx.fillText(char, drawX, drawY)
            }
          }
        }
      }
    }
  }
}

export { ColoredAsciiEffect }
