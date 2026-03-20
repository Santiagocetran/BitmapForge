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
  '/headless.js':     { file: resolve(PKG_ROOT, 'dist/headless.js'),                          type: 'application/javascript' },
  '/three.module.js': { file: resolve(REPO_ROOT, 'node_modules/three/build/three.module.js'), type: 'application/javascript' },
  '/upng.js':         { file: resolve(REPO_ROOT, 'node_modules/upng-js/upng.js'),             type: 'application/javascript' },
  '/harness.html':    { file: resolve(PKG_ROOT, 'src/harness.html'),                          type: 'text/html' },
  '/harness.js':      { file: resolve(PKG_ROOT, 'src/harness.js'),                            type: 'application/javascript' },
}

// Only verify built/external assets that must exist at startup.
// harness.html and harness.js are created in a later task (TASK-005).
const VERIFY_ROUTES = ['/headless.js', '/three.module.js', '/upng.js']

async function verifyAssets() {
  for (const route of VERIFY_ROUTES) {
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
    const asset = ASSETS[req.url]
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

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({
        port,
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((res) => server.close(res)),
      })
    })
  })
}
