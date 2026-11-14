// Standalone native-bitmap smoke; intentionally outside Vitest's mocked DOM.
// Run: node src/engine/loaders/bitmap.browser-smoke.mjs (Node 26).
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const server = await createServer({
  root,
  configFile: false,
  server: { host: '127.0.0.1', port: 0 },
  plugins: [
    {
      name: 'engine-bitmap-smoke',
      configureServer(server) {
        server.middlewares.use('/__engine_bitmap_smoke', (_request, response) => {
          response.setHeader('Content-Type', 'text/html')
          response.end('<!doctype html><title>Engine bitmap smoke</title>')
        })
      }
    }
  ]
})
let browser
try {
  await server.listen()
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(`${server.resolvedUrls.local[0]}__engine_bitmap_smoke`)
  const results = await page.evaluate(async () => {
    const { loadModel, prepareSource } = await import('/src/engine/loaders/modelLoader.js')
    const bitmaps = []
    const nativeDecode = window.createImageBitmap.bind(window)
    window.createImageBitmap = async (...args) => {
      const bitmap = await nativeDecode(...args)
      bitmaps.push(bitmap)
      return bitmap
    }
    const closes = new Map()
    const nativeClose = ImageBitmap.prototype.close
    ImageBitmap.prototype.close = function () {
      closes.set(this, (closes.get(this) ?? 0) + 1)
      return nativeClose.call(this)
    }
    const revocations = []
    const nativeRevoke = URL.revokeObjectURL.bind(URL)
    URL.revokeObjectURL = (url) => {
      revocations.push(url)
      nativeRevoke(url)
    }
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 2
    const context = canvas.getContext('2d')
    context.fillStyle = '#f00'
    context.fillRect(0, 0, 2, 2)
    const image = canvas.toDataURL('image/png')
    const positions = new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 0])
    const binary = btoa(String.fromCharCode(...new Uint8Array(positions.buffer)))
    const results = []
    for (const retained of [false, true]) {
      const primitive = { attributes: { POSITION: 0 }, material: 0 }
      const gltf = {
        asset: { version: '2.0' },
        scene: 0,
        scenes: [{ nodes: retained ? [0, 1] : [0] }, { nodes: [2] }],
        nodes: [{ mesh: 0 }, { mesh: 1 }, { mesh: 0 }],
        meshes: [{ primitives: [primitive] }, { primitives: [{ ...primitive, mode: 0 }] }],
        materials: [{ pbrMetallicRoughness: { baseColorTexture: { index: 0 } } }],
        textures: [{ source: 0 }],
        images: [{ uri: image }],
        buffers: [{ uri: `data:application/octet-stream;base64,${binary}`, byteLength: positions.byteLength }],
        bufferViews: [{ buffer: 0, byteLength: positions.byteLength }],
        accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [-1, -1, 0], max: [1, 1, 0] }]
      }
      const before = bitmaps.length
      const result = await loadModel(new File([JSON.stringify(gltf)], 'native.gltf', { type: 'model/gltf+json' }))
      const decoded = bitmaps.slice(before)
      const beforeClose = decoded.map((bitmap) => closes.get(bitmap) ?? 0)
      const beforeWidths = decoded.map((bitmap) => bitmap.width)
      const source = prepareSource(result.group, result.objectUrl)
      source.dispose()
      source.dispose()
      results.push({
        retained,
        decoded: decoded.length,
        beforeClose,
        beforeWidths,
        afterClose: decoded.map((bitmap) => closes.get(bitmap) ?? 0),
        afterWidths: decoded.map((bitmap) => bitmap.width),
        urlRevocations: revocations.filter((url) => url === result.objectUrl).length
      })
    }
    return results
  })
  for (const result of results) {
    assert.equal(result.decoded, 1, 'real GLTFLoader must decode one native bitmap')
    assert.deepEqual(result.beforeClose, [result.retained ? 0 : 1])
    assert.deepEqual(result.beforeWidths, [result.retained ? 2 : 0])
    assert.deepEqual(result.afterClose, [1])
    assert.deepEqual(result.afterWidths, [0], 'native close detaches bitmap pixels')
    assert.equal(result.urlRevocations, 1)
  }
  console.log(JSON.stringify({ browser: browser.version(), results }, null, 2))
} finally {
  await browser?.close()
  await server.close()
}
