/**
 * Minimal ephemeral static file server for serving extracted ZIP artifacts.
 * Binds to port 0 so the OS assigns a free port — no EADDRINUSE races.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.json': 'application/json',
  '.stl': 'model/stl'
}

/**
 * @param {string} dir - primary root directory
 * @param {Record<string, string>} [extraRoots] - URL prefix → directory mappings
 */
export function startStaticServer(dir, extraRoots = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = req.url === '/' ? '/index.html' : req.url
      const cleanPath = urlPath.split('?')[0]

      // Check extra roots first (longest-prefix match)
      let file = null
      for (const [prefix, root] of Object.entries(extraRoots)) {
        if (cleanPath.startsWith(prefix)) {
          file = path.join(root, cleanPath.slice(prefix.length))
          break
        }
      }
      if (!file) file = path.join(dir, cleanPath)
      try {
        const data = fs.readFileSync(file)
        const mime = MIME[path.extname(file)] ?? 'application/octet-stream'
        res.writeHead(200, {
          'Content-Type': mime,
          'Access-Control-Allow-Origin': '*'
        })
        res.end(data)
      } catch {
        res.writeHead(404)
        res.end(`Not found: ${urlPath}`)
      }
    })

    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({
        server,
        port,
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((res) => server.close(res))
      })
    })
  })
}
