/**
 * Export visual verification — Layer 3 (Playwright).
 *
 * Starts the BitmapForge dev server, uploads tiny.stl, exports each format,
 * and verifies the artifact visually (non-blank canvas, entropy > threshold,
 * no runtime errors, all requests 200).
 *
 * Run with: npm run test:e2e
 * NOT part of npm test — run on demand when modifying export builders.
 *
 * Prerequisites:
 *   - npm run dev must be startable (Playwright starts it via webServer config)
 *   - npx playwright install chromium
 */

import { test, expect } from '@playwright/test'
import JSZip from 'jszip'
import UPNG from 'upng-js'
import fs from 'node:fs'
import path from 'node:path'
import { startStaticServer } from './utils/server.js'
import { analyzeScreenshot, isBlank } from './utils/imageMetrics.js'

const TINY_STL = path.resolve('test/fixtures/models/tiny.stl')
const OUTPUT_DIR = path.resolve('test/fixtures/outputs/screenshots')

function ensureOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

function saveScreenshot(name, buffer) {
  ensureOutputDir()
  fs.writeFileSync(path.join(OUTPUT_DIR, name), buffer)
}

function saveArtifact(relPath, data) {
  const full = path.resolve('test/fixtures/outputs', relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, data)
}

async function readDownloadBytes(download) {
  const filePath = await download.path()
  return fs.readFileSync(filePath)
}

function toBase64(nodeBuffer) {
  return nodeBuffer.toString('base64')
}

// ─── App setup helper ─────────────────────────────────────────────────────────

async function setupApp(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1
  })
  const page = await context.newPage()
  const pageErrors = []
  const failedRequests = []

  page.on('pageerror', (err) => pageErrors.push(err.message))
  page.on('response', (res) => {
    if (!res.ok() && res.url().includes('localhost:5173')) failedRequests.push(`${res.status()} ${res.url()}`)
  })

  await page.goto('http://localhost:5173')

  // Upload model via the hidden file input
  const fileInput = page.locator('input[aria-label="Upload 3D model file (STL, OBJ, GLTF, or GLB)"]').first()
  await fileInput.setInputFiles(TINY_STL)

  // Wait for canvas to appear and render
  await page.waitForSelector('canvas', { state: 'visible', timeout: 15_000 })
  await page.waitForTimeout(2000)

  return { page, context, pageErrors, failedRequests }
}

// ─── Format selector + export trigger ────────────────────────────────────────

async function exportFormat(page, formatLabel) {
  // Select format button (e.g. "APNG", "Code ZIP", "CSS Anim")
  await page.getByRole('button', { name: formatLabel, exact: true }).click()

  // Trigger export and wait for download
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60_000 }),
    page.getByRole('button', { name: new RegExp(`Export ${formatLabel}`, 'i') }).click()
  ])

  return download
}

// ─── Test: App baseline ───────────────────────────────────────────────────────

test.describe.serial('Export visual verification', () => {
  test('app renders after model upload', async ({ browser }) => {
    const { page, context, pageErrors } = await setupApp(browser)

    const canvas = page.locator('canvas').first()
    const screenshotBuf = await canvas.screenshot()
    saveScreenshot('app-baseline.png', screenshotBuf)

    const metrics = analyzeScreenshot(screenshotBuf)
    expect(
      isBlank(metrics),
      `Canvas is blank. entropy=${metrics.entropy.toFixed(2)} unique=${metrics.uniqueColors}`
    ).toBe(false)
    expect(metrics.entropy, 'Canvas entropy too low — model may not be rendering').toBeGreaterThan(1.0)
    expect(pageErrors, `Page errors: ${pageErrors.join(', ')}`).toHaveLength(0)

    await context.close()
  })

  // ─── APNG ───────────────────────────────────────────────────────────────────

  test('APNG export — valid animated PNG with visible content', async ({ browser }) => {
    const { page, context, pageErrors } = await setupApp(browser)

    const download = await exportFormat(page, 'APNG')
    const bytes = await readDownloadBytes(download)
    saveArtifact('exported.apng', bytes)

    // Decode structure
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    const img = UPNG.decode(arrayBuffer)
    expect(img.width, 'APNG width must be > 0').toBeGreaterThan(0)
    expect(img.height, 'APNG height must be > 0').toBeGreaterThan(0)
    expect(img.frames.length, 'APNG must have multiple frames').toBeGreaterThan(1)

    // Display in browser and screenshot
    const base64 = toBase64(bytes)
    await page.setContent(
      `<body style="background:#000;margin:0"><img id="a" src="data:image/png;base64,${base64}" style="width:100%;height:100vh;object-fit:contain"></body>`
    )
    await page.waitForSelector('#a')
    await page.waitForTimeout(500)
    const screenshotBuf = await page.locator('#a').screenshot()
    saveScreenshot('apng-displayed.png', screenshotBuf)

    const metrics = analyzeScreenshot(screenshotBuf)
    expect(isBlank(metrics), `APNG display is blank. entropy=${metrics.entropy.toFixed(2)}`).toBe(false)

    expect(pageErrors).toHaveLength(0)
    await context.close()
  })

  // ─── Sprite Sheet ────────────────────────────────────────────────────────────

  test('Sprite Sheet export — correct dimensions and visible content', async ({ browser }) => {
    const { page, context, pageErrors } = await setupApp(browser)

    const download = await exportFormat(page, 'Sprite Sheet')
    const bytes = await readDownloadBytes(download)
    saveArtifact('sprite-sheet.png', bytes)

    // Decode — sprite sheet is a static PNG (single frame)
    const img = UPNG.decode(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
    expect(img.width, 'Sprite sheet width must be > 0').toBeGreaterThan(0)
    expect(img.height, 'Sprite sheet height must be > 0').toBeGreaterThan(0)
    // Static PNG: frames array is empty (main image IS the sprite sheet)
    expect(img.frames.length, 'Sprite sheet must be a static PNG (0 animation frames)').toBe(0)

    // Display and screenshot
    const base64 = toBase64(bytes)
    await page.setContent(
      `<body style="background:#000;margin:0"><img id="s" src="data:image/png;base64,${base64}" style="max-width:100%;"></body>`
    )
    await page.waitForSelector('#s')
    const screenshotBuf = await page.locator('#s').screenshot()
    saveScreenshot('sprite-sheet-display.png', screenshotBuf)

    const metrics = analyzeScreenshot(screenshotBuf)
    expect(isBlank(metrics), `Sprite sheet is blank. entropy=${metrics.entropy.toFixed(2)}`).toBe(false)
    expect(metrics.entropy).toBeGreaterThan(1.0)

    expect(pageErrors).toHaveLength(0)
    await context.close()
  })

  // ─── Code ZIP ────────────────────────────────────────────────────────────────

  test('Code ZIP export — extracted HTML renders 3D scene in browser', async ({ browser }) => {
    const { page, context, pageErrors } = await setupApp(browser)

    const download = await exportFormat(page, 'Code ZIP')
    const zipBytes = await readDownloadBytes(download)

    // Extract ZIP
    const zip = await JSZip.loadAsync(zipBytes)
    const extractDir = path.resolve('test/fixtures/outputs/code-export')
    fs.mkdirSync(extractDir, { recursive: true })
    for (const [name, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue
      const dest = path.join(extractDir, name)
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, await entry.async('nodebuffer'))
    }

    // Serve extracted ZIP — Code ZIP uses ES modules, must be HTTP not file://
    const { url, close } = await startStaticServer(extractDir)
    const exportPage = await context.newPage()
    const codeErrors = []
    const failedCodeRequests = []

    exportPage.on('pageerror', (err) => codeErrors.push(err.message))
    exportPage.on('response', (res) => {
      if (!res.ok()) failedCodeRequests.push(`${res.status()} ${res.url()}`)
    })

    try {
      await exportPage.goto(`${url}/BitmapForge-export/index.html`)
      await exportPage.waitForSelector('canvas', { state: 'visible', timeout: 15_000 })
      await exportPage.waitForTimeout(3000)

      const screenshotBuf = await exportPage.locator('canvas').first().screenshot()
      saveScreenshot('code-export-canvas.png', screenshotBuf)

      const metrics = analyzeScreenshot(screenshotBuf)
      expect(
        isBlank(metrics),
        `Code ZIP canvas is blank. entropy=${metrics.entropy.toFixed(2)} unique=${metrics.uniqueColors}`
      ).toBe(false)
      expect(metrics.entropy, 'Code ZIP canvas entropy too low').toBeGreaterThan(1.0)
      expect(failedCodeRequests, `Failed requests in Code ZIP: ${failedCodeRequests.join(', ')}`).toHaveLength(0)
      expect(codeErrors, `Runtime errors in Code ZIP: ${codeErrors.join(', ')}`).toHaveLength(0)
    } finally {
      await close()
    }

    expect(pageErrors).toHaveLength(0)
    await context.close()
  })

  // ─── CSS ZIP ─────────────────────────────────────────────────────────────────

  test('CSS ZIP export — animation plays (frame 0 ≠ frame 1)', async ({ browser }) => {
    const { page, context, pageErrors } = await setupApp(browser)

    const download = await exportFormat(page, 'CSS Anim')
    const zipBytes = await readDownloadBytes(download)

    // Extract ZIP
    const zip = await JSZip.loadAsync(zipBytes)
    const extractDir = path.resolve('test/fixtures/outputs/css-export')
    fs.mkdirSync(extractDir, { recursive: true })

    let cssFileName
    for (const [name, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue
      const dest = path.join(extractDir, name)
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, await entry.async('nodebuffer'))
      if (name.endsWith('.css')) cssFileName = name
    }

    // Write wrapper HTML (CSS ZIP has no index.html)
    const animName = cssFileName?.replace('.css', '') ?? 'bitmapforge-animation'
    const wrapperHtml = `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="./${cssFileName}">
  <style>body{background:#0a0a0a;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}</style>
</head>
<body>
  <div class="${animName}" id="anim"></div>
</body>
</html>`
    fs.writeFileSync(path.join(extractDir, 'index.html'), wrapperHtml)

    const { url, close } = await startStaticServer(extractDir)
    const cssPage = await context.newPage()
    const cssErrors = []
    const failedCssRequests = []

    cssPage.on('pageerror', (err) => cssErrors.push(err.message))
    cssPage.on('response', (res) => {
      if (!res.ok()) failedCssRequests.push(`${res.status()} ${res.url()}`)
    })

    try {
      await cssPage.goto(`${url}/index.html`)
      await cssPage.waitForSelector(`#anim`, { state: 'visible', timeout: 10_000 })
      await cssPage.waitForTimeout(100) // let first frame render

      const frame0Buf = await cssPage.locator('#anim').screenshot()
      saveScreenshot('css-export-frame0.png', frame0Buf)

      // Wait ~2 animation frames and screenshot again
      await cssPage.waitForTimeout(600)
      const frame1Buf = await cssPage.locator('#anim').screenshot()
      saveScreenshot('css-export-frame1.png', frame1Buf)

      // Both frames should be visible
      expect(isBlank(analyzeScreenshot(frame0Buf)), 'CSS frame 0 is blank').toBe(false)
      expect(isBlank(analyzeScreenshot(frame1Buf)), 'CSS frame 1 is blank').toBe(false)

      // Frames should differ (animation is running)
      expect(frame0Buf.equals(frame1Buf), 'CSS animation is not advancing (frames are identical)').toBe(false)

      expect(failedCssRequests, `Failed requests in CSS ZIP: ${failedCssRequests.join(', ')}`).toHaveLength(0)
      expect(cssErrors, `Runtime errors in CSS ZIP: ${cssErrors.join(', ')}`).toHaveLength(0)
    } finally {
      await close()
    }

    expect(pageErrors).toHaveLength(0)
    await context.close()
  })

  // ─── Video (WebM) ─────────────────────────────────────────────────────────────

  test('Video export — valid WebM container with non-blank frame', async ({ browser }) => {
    const { page, context, pageErrors } = await setupApp(browser)

    const download = await exportFormat(page, 'Video')
    const bytes = await readDownloadBytes(download)
    saveArtifact('exported.webm', bytes)

    // Validate WebM container signature: first 4 bytes = 0x1A 0x45 0xDF 0xA3 (EBML header)
    expect(bytes[0]).toBe(0x1a)
    expect(bytes[1]).toBe(0x45)
    expect(bytes[2]).toBe(0xdf)
    expect(bytes[3]).toBe(0xa3)

    // Load in <video>, verify duration > 0 and draw a frame
    const base64 = toBase64(bytes)
    await page.setContent(`
      <body style="background:#000;margin:0">
        <video id="v" src="data:video/webm;base64,${base64}" style="width:640px;height:480px"></video>
        <canvas id="c" width="640" height="480"></canvas>
      </body>
    `)

    // Wait for video metadata to load
    await page.waitForFunction(() => document.getElementById('v').readyState >= 1, { timeout: 15_000 })
    const duration = await page.evaluate(() => document.getElementById('v').duration)
    expect(duration, 'Video duration must be > 0').toBeGreaterThan(0)

    // Seek to start and draw frame to canvas
    await page.evaluate(() => {
      const v = document.getElementById('v')
      v.currentTime = 0
    })
    await page.waitForFunction(() => document.getElementById('v').readyState >= 2, { timeout: 10_000 })
    await page.evaluate(() => {
      const v = document.getElementById('v')
      const c = document.getElementById('c')
      c.getContext('2d').drawImage(v, 0, 0, 640, 480)
    })

    const screenshotBuf = await page.locator('#c').screenshot()
    saveScreenshot('webm-frame0.png', screenshotBuf)

    const metrics = analyzeScreenshot(screenshotBuf)
    expect(isBlank(metrics), `WebM frame is blank. entropy=${metrics.entropy.toFixed(2)}`).toBe(false)

    expect(pageErrors).toHaveLength(0)
    await context.close()
  })
})
