import { captureFrames, getFrameCount } from './framesProvider.js'

// Max pixel dimension for Lottie raster frames.
// Lottie is a vector format — large raster frames make the file huge and slow.
const LOTTIE_MAX_PX = 256

function imageDataToPngDataUrl(imageData, maxPx) {
  const { width, height } = imageData
  const longest = Math.max(width, height)
  const scale = longest > maxPx ? maxPx / longest : 1
  const outW = Math.round(width * scale)
  const outH = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')

  if (scale < 1) {
    const src = document.createElement('canvas')
    src.width = width
    src.height = height
    src.getContext('2d').putImageData(imageData, 0, 0)
    ctx.drawImage(src, 0, 0, outW, outH)
  } else {
    ctx.putImageData(imageData, 0, 0)
  }

  return { dataUrl: canvas.toDataURL('image/png'), w: outW, h: outH }
}

/**
 * Estimate Lottie JSON size in MB before encoding.
 * Rough model: ~15KB per PNG frame base64 at 256×256.
 */
function estimateLottieSizeMb(frameCount, frameW, frameH) {
  const longest = Math.max(frameW, frameH)
  const scale = longest > LOTTIE_MAX_PX ? LOTTIE_MAX_PX / longest : 1
  const outW = Math.round(frameW * scale)
  const outH = Math.round(frameH * scale)
  // Raw RGBA bytes → assume 30% PNG compression → base64 adds 37%
  const bytesPerFrame = outW * outH * 4 * 0.3 * 1.37
  return ((bytesPerFrame * frameCount) / 1024 / 1024).toFixed(1)
}

async function buildLottieJson(manager, state, name = 'bitmapforge-animation', fps = 16, { signal, onProgress } = {}) {
  const frameCount = getFrameCount(manager, fps)
  const sourceCanvas = manager.getCanvas()
  const canvasW = sourceCanvas.width
  const canvasH = sourceCanvas.height

  const frames = await captureFrames(manager, frameCount, { signal, onProgress })

  const assets = []
  const layers = []

  // Convert each frame to a capped-resolution PNG embedded as a data URI
  let outW = canvasW
  let outH = canvasH
  for (let i = 0; i < frames.length; i++) {
    const { dataUrl, w, h } = imageDataToPngDataUrl(frames[i], LOTTIE_MAX_PX)
    outW = w
    outH = h

    assets.push({ id: `f${i}`, w, h, u: '', p: dataUrl, e: 1 })

    // Each layer is visible for exactly one frame (ip: i, op: i+1)
    layers.push({
      ddd: 0,
      ind: i + 1,
      ty: 2, // image layer
      nm: `f${i}`,
      refId: `f${i}`,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [outW / 2, outH / 2, 0] },
        a: { a: 0, k: [outW / 2, outH / 2, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      ip: i,
      op: i + 1,
      st: 0,
      sr: 1,
      bm: 0
    })
  }

  const lottie = {
    v: '5.9.0',
    fr: fps,
    ip: 0,
    op: frameCount,
    w: outW,
    h: outH,
    nm: name,
    ddd: 0,
    assets,
    layers
  }

  const json = JSON.stringify(lottie)
  return new Blob([json], { type: 'application/json' })
}

export { buildLottieJson, estimateLottieSizeMb, LOTTIE_MAX_PX }
