import { afterEach, describe, expect, it, vi } from 'vitest'
import http from 'node:http'
import { EventEmitter } from 'node:events'
import { start } from '../server.js'

const control = vi.hoisted(() => ({ missing: null, unreadable: false }))
vi.mock('fs/promises', async (original) => {
  const actual = await original()
  return {
    ...actual,
    access: async (file) => {
      if (control.missing && file.endsWith(control.missing)) throw new Error('fixture missing')
      return actual.access(file)
    },
    readFile: async (file) => {
      if (control.unreadable) throw new Error('fixture read error')
      return actual.readFile(file)
    }
  }
})

const routes = [
  ['/harness.html', 'src/harness.html', 'text/html'],
  ['/harness.js', 'src/harness.js', 'application/javascript'],
  ['/headless.js', 'dist/headless.js', 'application/javascript'],
  ['/three.module.js', 'three/build/three.module.js', 'application/javascript'],
  ['/three.core.js', 'three/build/three.core.js', 'application/javascript'],
  ['/pako.js', 'pako/dist/pako.min.js', 'application/javascript'],
  ['/upng.js', 'upng-js/UPNG.js', 'application/javascript']
]
function request(server, path) {
  return new Promise((resolve, reject) => {
    // Raw request target: no URL normalization before the server sees traversal.
    const req = http.get({ host: '127.0.0.1', port: server.port, path }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => resolve({ status: res.statusCode, type: res.headers['content-type'], body: chunks.join('') }))
    })
    req.on('error', reject)
  })
}
let server
afterEach(async () => {
  if (server) await server.close()
  server = null
  control.missing = null
  control.unreadable = false
  vi.restoreAllMocks()
})
describe('finite loopback assets', () => {
  it.each(routes)('serves %s with exact MIME', async (route, _, type) => {
    server = await start()
    const result = await request(server, route)
    expect(result.status).toBe(200)
    expect(result.type).toBe(type)
    expect(result.body.length).toBeGreaterThan(0)
  })
  it.each([
    '/',
    '/assets/font.js',
    '/toString',
    '/__proto__',
    '/headless.js?x=1',
    '/%68eadless.js',
    '/../headless.js',
    '/%2e%2e/headless.js'
  ])('rejects raw unknown %s', async (path) => {
    server = await start()
    expect(await request(server, path)).toMatchObject({ status: 404, body: 'Not found' })
  })
  it.each(routes)('verifies %s before opening a listener', async (route, suffix) => {
    control.missing = suffix
    const create = vi.spyOn(http, 'createServer')
    await expect(start()).rejects.toThrow(`Server asset missing for route ${route}:`)
    expect(create).not.toHaveBeenCalled()
  })
  it('returns 500 for a known asset becoming unreadable', async () => {
    server = await start()
    control.unreadable = true
    expect(await request(server, '/harness.js')).toMatchObject({ status: 500, body: 'Error reading file' })
  })
  it('rejects structured listen failure', async () => {
    const fake = new EventEmitter()
    fake.listen = () => queueMicrotask(() => fake.emit('error', new Error('listen fixture')))
    vi.spyOn(http, 'createServer').mockReturnValue(fake)
    await expect(start()).rejects.toThrow('listen fixture')
  })
})
