import { test, expect } from '@playwright/test'
import JSZip from 'jszip'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { setupApp, exportFormat } from './utils/exportApp.js'
import { analyzeScreenshot, isBlank } from './utils/imageMetrics.js'

// External orchestration owns strict servers, separately logged install (<=300s)
// and build (<=120s). Run download, preparation, preview, then dev serially.
// This spec never installs, builds, repairs source, or starts/stops a server.
const checkout = fileURLToPath(new URL('../../', import.meta.url))
const fixture = fileURLToPath(new URL('../fixtures/models/export-visual-cube.stl', import.meta.url))
const model = 'export-visual-cube.stl'
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')

function externalPath(name) {
  const value = process.env[name]
  if (!value || !path.isAbsolute(value)) throw new Error(`${name} must be an absolute external path`)
  const resolved = path.resolve(value)
  if (resolved === path.parse(resolved).root) throw new Error(`${name} cannot be a filesystem root`)
  // Inspect existing ancestors as well as lexical paths; no symlink escape or
  // repository/ancestor dependency fallback is permitted.
  for (let dir = resolved; ; dir = path.dirname(dir)) {
    if (fs.existsSync(dir) && fs.lstatSync(dir).isSymbolicLink()) throw new Error(`Symlink path: ${dir}`)
    if (dir === path.resolve(checkout)) throw new Error(`${name} must be outside the checkout`)
    if (dir === path.dirname(dir)) break
  }
  return resolved
}

function origin(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  const url = new URL(value)
  if (
    url.protocol !== 'http:' ||
    !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
    !url.port ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${name} must be an explicit owned loopback HTTP origin`)
  }
  return url.origin
}

function inputs() {
  const zip = externalPath('BITMAPFORGE_GENERATED_ZIP')
  const project = externalPath('BITMAPFORGE_GENERATED_PROJECT')
  const evidence = externalPath('BITMAPFORGE_GENERATED_EVIDENCE')
  const paths = [zip, project, evidence]
  for (const a of paths) {
    for (const b of paths) {
      if (a !== b && !b.startsWith(`${a}${path.sep}`)) continue
      if (a !== b || paths.filter((p) => p === a).length > 1)
        throw new Error('Evidence, ZIP and project must be disjoint')
    }
  }
  for (let dir = path.dirname(project); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'node_modules'))) throw new Error(`Ancestor node_modules: ${dir}`)
    if (dir === path.dirname(dir)) break
  }
  fs.mkdirSync(evidence, { recursive: true })
  return { zip, project, evidence }
}

function save(evidence, name, value) {
  fs.writeFileSync(path.join(evidence, name), JSON.stringify(value, null, 2))
}

async function archive(zipPath) {
  const bytes = fs.readFileSync(zipPath)
  const zip = await JSZip.loadAsync(bytes, { checkCRC32: true })
  const files = new Map()
  for (const entry of Object.values(zip.files)) {
    const name = entry.unsafeOriginalName ?? entry.name
    if (
      name !== entry.name ||
      !name.startsWith('BitmapForge-export/') ||
      name.includes('\\') ||
      name.split('/').some((part) => part === '.' || part === '..') ||
      (Number(entry.unixPermissions) & 0o170000) === 0o120000
    ) {
      throw new Error(`Unsafe ZIP entry: ${name}`)
    }
    if (!entry.dir) files.set(name.slice('BitmapForge-export/'.length), await entry.async('nodebuffer'))
  }
  const expected = fs.readFileSync(fixture)
  expect(files.get(`models/${model}`)).toEqual(expected)
  expect(files.get(`public/models/${model}`)).toEqual(expected)
  const pkg = JSON.parse(files.get('package.json').toString())
  expect(pkg.scripts).toEqual({ dev: 'vite', build: 'vite build', preview: 'vite preview' })
  expect(pkg.dependencies).toEqual({ three: '^0.182.0' })
  expect(pkg.devDependencies).toEqual({ vite: '^7.3.7' })
  expect(files.get('vite.config.js').toString()).toBe(
    "import { defineConfig } from 'vite'\nexport default defineConfig({})\n"
  )
  expect(files.get('animation.js').toString()).toContain(`fetch('./models/${model}')`)
  return { bytes, files }
}

function sourceIdentity(project, files) {
  const hashes = {}
  for (const [name, bytes] of files) {
    const target = path.resolve(project, name)
    if (!target.startsWith(`${project}${path.sep}`)) throw new Error(`Extraction escape: ${name}`)
    for (let dir = target; dir !== project; dir = path.dirname(dir)) {
      if (fs.lstatSync(dir).isSymbolicLink()) throw new Error(`Source symlink: ${dir}`)
    }
    expect(fs.readFileSync(target), `Unmodified source ${name}`).toEqual(bytes)
    hashes[name] = hash(bytes)
  }
  return hashes
}

test.beforeEach(async ({ browserName }, testInfo) => {
  expect(browserName).toBe('chromium')
  expect(testInfo.timeout).toBe(90_000)
  expect(testInfo.config.workers).toBe(1)
  expect(testInfo.config.forbidOnly).toBe(true)
  expect(testInfo.project.retries).toBe(0)
  const trace = testInfo.project.use.trace
  expect(typeof trace === 'string' ? trace : trace?.mode).toBe('retain-on-failure')
})

test('Code project real download preserves dual model layout', async ({ browser }) => {
  const env = inputs()
  origin('BITMAPFORGE_UI_URL')
  if (fs.existsSync(env.zip) || fs.existsSync(env.project))
    throw new Error('Download/extraction destinations must be new')
  const priorContexts = new Set(browser.contexts())
  try {
    const { page, pageErrors, failedRequests } = await setupApp(browser)
    const download = await exportFormat(page, 'Code ZIP')
    await download.saveAs(env.zip)
    const { bytes, files } = await archive(env.zip)
    fs.mkdirSync(env.project, { recursive: true })
    for (const [name, data] of files) {
      const target = path.resolve(env.project, name)
      if (!target.startsWith(`${env.project}${path.sep}`)) throw new Error(`Extraction escape: ${name}`)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, data, { flag: 'wx' })
    }
    save(env.evidence, 'download.json', {
      suggestedFilename: download.suggestedFilename(),
      zipSHA256: hash(bytes),
      zipBytes: bytes.length,
      uncompressedBytes: [...files.values()].reduce((sum, data) => sum + data.length, 0),
      sourceHashes: sourceIdentity(env.project, files),
      pageErrors,
      failedRequests
    })
    expect(pageErrors).toEqual([])
    expect(failedRequests).toEqual([])
  } finally {
    await Promise.all(
      browser
        .contexts()
        .filter((context) => !priorContexts.has(context))
        .map((context) => context.close())
    )
  }
})

async function runtime(page, mode) {
  const env = inputs()
  const url = origin('BITMAPFORGE_GENERATED_URL')
  const { bytes, files } = await archive(env.zip)
  const before = sourceIdentity(env.project, files)
  if (!fs.existsSync(path.join(env.project, 'node_modules/vite/package.json')))
    throw new Error('Consumer installation missing')
  const index = fs.readFileSync(path.join(env.project, mode === 'preview' ? 'dist/index.html' : 'index.html'))
  if (mode === 'preview')
    expect(fs.readFileSync(path.join(env.project, `dist/models/${model}`))).toEqual(files.get(`models/${model}`))
  const errors = []
  const failed = []
  const responses = []
  const pending = []
  const dimensions = []
  const frames = {}
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('requestfailed', (request) => failed.push({ url: request.url(), error: request.failure() }))
  page.on('response', (response) => {
    if (!response.ok()) failed.push({ url: response.url(), status: response.status() })
    if (new URL(response.url()).pathname === `/models/${model}`) {
      pending.push(
        (async () => {
          const body = await response.body()
          fs.writeFileSync(path.join(env.evidence, `${mode}-model-response.body`), body)
          responses.push({
            url: response.url(),
            status: response.status(),
            headers: response.headers(),
            sha256: hash(body),
            bytes: body.length
          })
        })().catch((error) => errors.push(`Model response body: ${error.message}`))
      )
    }
  })
  const soft = expect.configure({ soft: true })
  async function geometry(label, width, height) {
    await soft
      .poll(
        async () => {
          const value = await page.evaluate(() => {
            const app = document.getElementById('app')
            const canvas = app?.querySelector('canvas')
            const rect = canvas?.getBoundingClientRect()
            return {
              container: app ? [app.clientWidth, app.clientHeight] : null,
              backing: canvas ? [canvas.width, canvas.height] : null,
              client: canvas ? [canvas.clientWidth, canvas.clientHeight] : null,
              rendered: rect ? [rect.width, rect.height] : null,
              dpr: window.devicePixelRatio
            }
          })
          dimensions.push({ label, ...value })
          return value
        },
        { timeout: 10_000 }
      )
      .toEqual({
        container: [width, height],
        backing: [width, height],
        client: [width, height],
        rendered: [width, height],
        dpr: 1
      })
  }
  async function frame(label) {
    await soft
      .poll(
        async () => {
          const image = await page.locator('#app canvas').first().screenshot()
          fs.writeFileSync(path.join(env.evidence, `${mode}-${label}.png`), image)
          frames[label] = analyzeScreenshot(image)
          return !isBlank(frames[label]) && frames[label].entropy > 0.5
        },
        { timeout: 18_000, intervals: [250, 500, 1000] }
      )
      .toBe(true)
  }
  try {
    const navigation = await page.goto(url)
    expect(navigation.ok()).toBe(true)
    const document = await navigation.body()
    fs.writeFileSync(path.join(env.evidence, `${mode}-document.body`), document)
    // Preview serves the exact build. Vite dev injects its client into HTML;
    // verify unchanged source separately and require its generated title/module.
    if (mode === 'preview') expect(document).toEqual(index)
    else {
      expect(document.toString()).toContain('<title>BitmapForge Export</title>')
      const animation = await page.request.get(`${url}/animation.js`)
      expect(animation.ok()).toBe(true)
      expect(await animation.text()).toContain(`fetch('./models/${model}')`)
    }
    expect(page.viewportSize()).toEqual({ width: 1280, height: 800 })
    await page.locator('#app canvas').first().waitFor({ state: 'attached', timeout: 20_000 })
    await geometry('initial', 1280, 800)
    await frame('initial')
    await page.locator('#app').evaluate((app) => {
      app.style.width = '640px'
      app.style.height = '360px'
    })
    expect(page.viewportSize()).toEqual({ width: 1280, height: 800 })
    await geometry('container-only', 640, 360)
    await frame('container-only')
    await Promise.all(pending)
    soft(responses.length).toBeGreaterThan(0)
    for (const response of responses) {
      soft(response.url).toBe(`${url}/models/${model}`)
      soft(response.status).toBe(200)
      soft(response.headers['content-type']).not.toMatch(/html/i)
      soft(response.sha256).toBe(hash(files.get(`models/${model}`)))
      soft(response.bytes).toBe(files.get(`models/${model}`).length)
    }
    soft(errors).toEqual([])
    soft(failed).toEqual([])
  } finally {
    await Promise.all(pending)
    save(env.evidence, `${mode}-diagnostic.json`, { errors, failed, responses, dimensions, frames, before })
    expect(sourceIdentity(env.project, files)).toEqual(before)
    expect(hash(fs.readFileSync(env.zip))).toBe(hash(bytes))
  }
}

test('Unmodified installed Code project production preview renders and resizes', async ({ page }) => {
  await runtime(page, 'preview')
})

test('Unmodified installed Code project advertised dev renders and resizes', async ({ page }) => {
  await runtime(page, 'dev')
})
