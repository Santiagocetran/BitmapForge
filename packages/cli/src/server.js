import http from 'http'
import { readFile, access } from 'fs/promises'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
// packages/cli/ root
const PKG_ROOT = resolve(__dirname, '..')
// repo root (two levels up from packages/cli/)
const REPO_ROOT = resolve(PKG_ROOT, '../..')

const ASSETS = {
  '/headless.js': { file: resolve(PKG_ROOT, 'dist/headless.js'), type: 'application/javascript' },
  '/three.module.js': {
    file: resolve(REPO_ROOT, 'node_modules/three/build/three.module.js'),
    type: 'application/javascript'
  },
  '/upng.js': { file: resolve(REPO_ROOT, 'node_modules/upng-js/UPNG.js'), type: 'application/javascript' },
  '/pako.js': { file: resolve(REPO_ROOT, 'node_modules/pako/dist/pako.min.js'), type: 'application/javascript' },
  '/three.core.js': {
    file: resolve(REPO_ROOT, 'node_modules/three/build/three.core.js'),
    type: 'application/javascript'
  },
  '/harness.html': { file: resolve(PKG_ROOT, 'src/harness.html'), type: 'text/html' },
  '/harness.js': { file: resolve(PKG_ROOT, 'src/harness.js'), type: 'application/javascript' }
}

async function verifyAssets() {
  for (const route of Object.keys(ASSETS)) {
    const { file } = ASSETS[route]
    try {
      await access(file)
    } catch {
      throw new Error(`Server asset missing for route ${route}: ${file}`)
    }
  }
}

export async function start() {
  await verifyAssets()

  const server = http.createServer(async (req, res) => {
    const asset = Object.hasOwn(ASSETS, req.url) ? ASSETS[req.url] : null
    if (!asset) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    try {
      const data = await readFile(asset.file)
      res.writeHead(200, { 'Content-Type': asset.type })
      res.end(data)
    } catch {
      res.writeHead(500)
      res.end('Error reading file')
    }
  })

  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject)
      const { port } = server.address()
      resolve({
        port,
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((res, rej) => server.close((error) => (error ? rej(error) : res())))
      })
    })
  })
}
