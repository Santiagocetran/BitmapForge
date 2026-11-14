/**
 * Export visual verification — Layer 3 (Playwright).
 *
 * Starts the BitmapForge dev server, uploads a closed cube, exports each format,
 * and verifies the artifact visually (non-blank canvas, entropy > threshold,
 * no runtime errors, all requests 200).
 *
 * Run with: node node_modules/@playwright/test/cli.js test --config=playwright.export.config.js
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
import process from 'node:process'
import path from 'node:path'
import { startStaticServer } from './utils/server.js'
import { setupApp, exportFormat, expectPreviewSize } from './utils/exportApp.js'
import { selectTask } from './utils/editor.js'
import { analyzeScreenshot, isBlank } from './utils/imageMetrics.js'

// A single planar triangle can become edge-on during the default rotation and
// fail meaningful-content checks even on the unchanged base revision. A closed
// volume remains visible in preview AND capture without test-only pose changes.
const ARTIFACT_ROOT = path.resolve(process.env.BITMAPFORGE_EXPORT_OUTPUT || 'test/fixtures/outputs')
const OUTPUT_DIR = path.join(ARTIFACT_ROOT, 'screenshots')

function ensureOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

function saveScreenshot(name, buffer) {
  ensureOutputDir()
  fs.writeFileSync(path.join(OUTPUT_DIR, name), buffer)
  fs.writeFileSync(path.join(OUTPUT_DIR, `${name}.metrics.json`), JSON.stringify(analyzeScreenshot(buffer), null, 2))
}

function saveArtifact(relPath, data) {
  const full = path.resolve(ARTIFACT_ROOT, relPath)
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

// ─── Test: App baseline ───────────────────────────────────────────────────────

// Each test owns its app/context; one broken exporter must not skip the others.
// The export runner still uses one worker to serialize software-GL capture.
test.describe('Export visual verification', () => {
  test.afterEach(async ({ browser }) => {
    // setupApp creates explicit contexts; release them even when an assertion fails.
    await Promise.all(browser.contexts().map((context) => context.close()))
  })

  test('app renders after model upload', async ({ browser }) => {
    const { page, context, pageErrors } = await setupApp(browser)

    const canvas = page.getByRole('region', { name: 'Preview' }).locator('canvas').first()
    const screenshotBuf = await canvas.screenshot()
    saveScreenshot('app-baseline.png', screenshotBuf)

    const metrics = analyzeScreenshot(screenshotBuf)
    expect(
      isBlank(metrics),
      `Canvas is blank. entropy=${metrics.entropy.toFixed(2)} unique=${metrics.uniqueColors}`
    ).toBe(false)
    expect(metrics.entropy, 'Canvas entropy too low — model may not be rendering').toBeGreaterThan(0.5)
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
    await page.waitForTimeout(3000) // wait past 2500ms fade-in to reach the 'show' phase
    const screenshotBuf = await page.locator('#a').screenshot()
    saveScreenshot('apng-displayed.png', screenshotBuf)

    const metrics = analyzeScreenshot(screenshotBuf)
    // Check the displayed animation, not just its container/header.
    expect(isBlank(metrics), 'APNG show-phase frame must contain visible geometry').toBe(false)
    expect(
      metrics.entropy,
      `APNG display is blank (entropy too low). entropy=${metrics.entropy.toFixed(2)}`
    ).toBeGreaterThan(0.5)

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

    // Verify pixel content via UPNG: sprite sheet must have more than one color
    // (background + at least one model color).
    const frames = UPNG.toRGBA8(img)
    const rgba = new Uint8Array(frames[0])
    const uniqueColors = new Set()
    for (let i = 0; i < rgba.length; i += 4) uniqueColors.add(`${rgba[i]},${rgba[i + 1]},${rgba[i + 2]}`)
    expect(uniqueColors.size, 'Sprite sheet must contain more than 1 unique color').toBeGreaterThan(1)

    expect(pageErrors).toHaveLength(0)
    await context.close()
  })

  // ─── Code ZIP ────────────────────────────────────────────────────────────────

  test('Code ZIP export — extracted HTML renders 3D scene in browser', async ({ browser }, testInfo) => {
    const { page, context, pageErrors } = await setupApp(browser)

    const download = await exportFormat(page, 'Code ZIP')
    const zipBytes = await readDownloadBytes(download)
    saveArtifact('code-export.zip', zipBytes)

    // Extract ZIP
    const zip = await JSZip.loadAsync(zipBytes)
    const extractDir = path.join(ARTIFACT_ROOT, 'code-export')
    fs.mkdirSync(extractDir, { recursive: true })
    for (const [name, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue
      const dest = path.join(extractDir, name)
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, await entry.async('nodebuffer'))
    }

    // Patch index.html with import map for bare `three` and `three/addons/` specifiers.
    // three.module.js re-exports from three.core.js, so both are needed.
    // Addons are served from node_modules via an extra root in the static server.
    const threeDir = path.resolve('node_modules/three/build')
    fs.copyFileSync(path.join(threeDir, 'three.core.js'), path.join(extractDir, 'three.core.js'))
    fs.copyFileSync(path.join(threeDir, 'three.module.js'), path.join(extractDir, 'three.module.js'))

    const indexPath = path.join(extractDir, 'BitmapForge-export/index.html')
    const origHtml = fs.readFileSync(indexPath, 'utf8')
    const importMap = JSON.stringify({
      imports: {
        three: '../three.module.js',
        'three/addons/': '../three-addons/'
      }
    })
    const patchedHtml = origHtml.replace(
      '<script type="module"',
      `<script type="importmap">${importMap}</script>\n    <script type="module"`
    )
    fs.writeFileSync(indexPath, patchedHtml)

    // Serve the extract dir + node_modules/three/examples/jsm mapped to /three-addons/
    const threeAddonsRoot = path.resolve('node_modules/three/examples/jsm')
    const { url, close } = await startStaticServer(extractDir, { '/three-addons/': threeAddonsRoot })
    const exportPage = await context.newPage()
    const codeErrors = []
    const failedCodeRequests = []

    const codeConsoleLogs = []
    const dimensions = []
    const frames = {}
    // Playwright instruments explicit contexts too. A configured trace policy is
    // runner-owned (including retry/retention decisions); only trace-off runs
    // need a harness-owned trace. Never start or stop the runner's recording.
    const trace = testInfo.project.use.trace
    const traceMode = typeof trace === 'string' ? trace : trace?.mode
    const ownsTrace = !traceMode || traceMode === 'off'
    let manualTraceStarted = false
    exportPage.on('requestfailed', (request) => {
      failedCodeRequests.push(`${request.failure()?.errorText} ${request.url()}`)
    })
    exportPage.on('pageerror', (err) => codeErrors.push(err.message))
    exportPage.on('console', (msg) => codeConsoleLogs.push(`[${msg.type()}] ${msg.text()}`))
    exportPage.on('response', (res) => {
      if (!res.ok()) failedCodeRequests.push(`${res.status()} ${res.url()}`)
    })

    async function snapshot(label) {
      const size = await exportPage.evaluate(() => {
        const app = document.getElementById('app')
        const canvas = app?.querySelector('canvas')
        const rect = canvas?.getBoundingClientRect()
        return {
          container: app ? [app.clientWidth, app.clientHeight] : null,
          rendered: rect ? [rect.width, rect.height] : null,
          backing: canvas ? [canvas.width, canvas.height] : null,
          dpr: window.devicePixelRatio
        }
      })
      dimensions.push({ label, ...size })
      return size
    }

    async function checkSize(label, width, height, hidden = false) {
      const expected = {
        container: hidden ? [0, 0] : [width, height],
        ...(!hidden ? { rendered: [width, height] } : {}),
        backing: [width, height],
        dpr: 1
      }
      // Wait for ResizeObserver, then sample subsequent frames for feedback loops.
      await expect
        .poll(
          async () => {
            const size = await snapshot(label)
            if (hidden) delete size.rendered
            return size
          },
          { timeout: 10_000 }
        )
        .toEqual(expected)
      for (let frame = 0; frame < 3; frame++) {
        await exportPage.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())))
        const actual = await snapshot(`${label}-stable-${frame}`)
        if (hidden) {
          // Hidden canvas layout is not a visible-size contract.
          expect(actual.container).toEqual([0, 0])
          expect(actual.backing).toEqual([width, height])
        } else expect(actual).toEqual(expected)
      }
    }

    async function meaningfulFrame(label) {
      // Animation can be in an intentional fade-out after a resize. Poll without
      // changing generated code, manager pose, scale, animation time or playback.
      await expect
        .poll(
          async () => {
            const buffer = await exportPage.locator('#app canvas').first().screenshot()
            saveScreenshot(`code-export-${label}.png`, buffer)
            frames[label] = analyzeScreenshot(buffer)
            return isBlank(frames[label])
          },
          { timeout: 18_000, intervals: [250, 500, 1000] }
        )
        .toBe(false)
    }

    try {
      if (ownsTrace) {
        await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
        manualTraceStarted = true
      }
      await exportPage.goto(`${url}/BitmapForge-export/index.html`)
      await exportPage.waitForSelector('#app canvas', { state: 'attached', timeout: 20_000 })
      await checkSize('initial', 1280, 800)
      await meaningfulFrame('canvas')
      await exportPage.setViewportSize({ width: 900, height: 600 })
      await checkSize('viewport', 900, 600)
      await meaningfulFrame('viewport')
      await exportPage.locator('#app').evaluate((app) => {
        app.style.width = '640px'
        app.style.height = '360px'
      })
      expect(exportPage.viewportSize()).toEqual({ width: 900, height: 600 })
      await checkSize('container', 640, 360)
      await meaningfulFrame('container')
      await exportPage.locator('#app').evaluate((app) => {
        app.style.display = 'none'
      })
      await checkSize('hidden', 640, 360, true)
      await exportPage.locator('#app').evaluate((app) => {
        app.style.display = ''
      })
      await checkSize('revealed', 640, 360)
      await meaningfulFrame('revealed')
      // Byte-for-byte runtime equality: the only extracted source edit is HTML dependency resolution.
      expect(fs.readFileSync(path.join(extractDir, 'BitmapForge-export/animation.js'))).toEqual(
        await zip.file('BitmapForge-export/animation.js').async('nodebuffer')
      )
      expect(failedCodeRequests, `Failed requests in Code ZIP: ${failedCodeRequests.join(', ')}`).toHaveLength(0)
      expect(
        codeErrors,
        `Runtime errors in Code ZIP: ${codeErrors.join(', ')}\nConsole: ${codeConsoleLogs.join(', ')}`
      ).toHaveLength(0)
    } finally {
      // Write diagnostics before any optional screenshot/trace can fail.
      try {
        await snapshot('cleanup').catch((error) => dimensions.push({ label: 'cleanup', error: String(error) }))
        saveArtifact(
          'code-runtime.json',
          JSON.stringify({ frames, dimensions, codeErrors, failedCodeRequests, codeConsoleLogs }, null, 2)
        )
        await exportPage
          .screenshot({ path: path.join(OUTPUT_DIR, 'code-export-final-page.png'), timeout: 5000 })
          .catch(() => {})
        if (manualTraceStarted) {
          await context.tracing.stop({ path: path.join(ARTIFACT_ROOT, 'code-runtime-trace.zip') })
        }
      } finally {
        await close()
      }
    }

    expect(pageErrors).toHaveLength(0)
    await context.close()
  })

  // ─── CSS ZIP ─────────────────────────────────────────────────────────────────

  test('CSS ZIP export — animation plays (frame 0 ≠ frame 1)', async ({ browser }) => {
    const previewSize = { width: 384, height: 320 }
    const { page, context, pageErrors } = await setupApp(browser, { previewSize })

    await selectTask(page, 'Export')
    await expect(page.getByRole('button', { name: 'CSS Anim', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'CSS Anim', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Export CSS Anim', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Export CSS Anim', exact: true })).toBeEnabled()
    const preview = await expectPreviewSize(page, previewSize)

    const download = await exportFormat(page, 'CSS Anim')
    const zipBytes = await readDownloadBytes(download)
    saveArtifact('css-export.zip', zipBytes)

    // Extract ZIP
    const zip = await JSZip.loadAsync(zipBytes, { checkCRC32: true })
    const extractDir = path.join(ARTIFACT_ROOT, 'css-export')
    fs.mkdirSync(extractDir, { recursive: true })

    let cssFileName
    for (const [name, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue
      const dest = path.join(extractDir, name)
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, await entry.async('nodebuffer'))
      if (name.endsWith('.css')) cssFileName = name
    }

    expect(cssFileName, 'CSS archive must contain a stylesheet').toBeTruthy()
    expect(zip.file('README.md'), 'CSS archive must contain its README').not.toBeNull()
    const css = await zip.file(cssFileName).async('string')
    expect(css).toMatch(/width: 384px;/)
    expect(css).toMatch(/height: 320px;/)
    expect(css).toMatch(/background-size: 2304px 9920px;/)
    const spriteName = css.match(/background-image: url\('\.\/(.*?)'\)/)?.[1]
    expect(spriteName, 'CSS must reference the archived sprite').toBeTruthy()
    expect(zip.file(spriteName)).not.toBeNull()
    const sprite = await zip.file(spriteName).async('nodebuffer')
    const png = UPNG.decode(sprite.buffer.slice(sprite.byteOffset, sprite.byteOffset + sprite.byteLength))
    expect([png.width, png.height]).toEqual([2304, 9920])
    const loopMs = Number(css.match(/animation: \S+ ([\d.]+)ms/)?.[1])
    expect(loopMs).toBeCloseTo(11283.185307179585, 8)
    const stops = [...css.matchAll(/([\d.]+)% \{ background-position: -([\d]+)px -([\d]+)px; \}/g)]
    expect(stops).toHaveLength(181)
    expect(new Set(stops.map((stop) => stop[1])).size).toBe(181)
    for (const [i, stop] of stops.entries()) {
      expect(Number(stop[1])).toBe(Number(((i / 181) * 100).toFixed(4)))
      expect([Number(stop[2]), Number(stop[3])]).toEqual([(i % 6) * 384, Math.floor(i / 6) * 320])
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
      const rendered = await cssPage.locator('#anim').evaluate((element) => {
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        return {
          size: [rect.width, rect.height],
          background: style.backgroundSize,
          seconds: parseFloat(style.animationDuration)
        }
      })
      expect(rendered.size).toEqual([384, 320])
      expect(rendered.background).toBe('2304px 9920px')
      expect(rendered.seconds * 1000).toBeCloseTo(loopMs, 1)
      await cssPage.waitForTimeout(3000) // wait past fade-in to the show phase

      const frame0Buf = await cssPage.locator('#anim').screenshot()
      saveScreenshot('css-export-frame0.png', frame0Buf)

      // Wait ~2 animation frames and screenshot again
      await cssPage.waitForTimeout(600)
      const frame1Buf = await cssPage.locator('#anim').screenshot()
      saveScreenshot('css-export-frame1.png', frame1Buf)

      // A few antialiased pixels are not meaningful geometry.
      expect(isBlank(analyzeScreenshot(frame0Buf)), 'CSS frame 0 is blank').toBe(false)
      expect(isBlank(analyzeScreenshot(frame1Buf)), 'CSS frame 1 is blank').toBe(false)

      // Frames should differ (animation is running)
      expect(frame0Buf.equals(frame1Buf), 'CSS animation is not advancing (frames are identical)').toBe(false)

      expect(failedCssRequests, `Failed requests in CSS ZIP: ${failedCssRequests.join(', ')}`).toHaveLength(0)
      expect(cssErrors, `Runtime errors in CSS ZIP: ${cssErrors.join(', ')}`).toHaveLength(0)
      saveArtifact(
        'css-fixture.json',
        JSON.stringify(
          {
            preview,
            viewport: page.viewportSize(),
            archiveBytes: zipBytes.length,
            frameCount: stops.length,
            columns: 6,
            rows: 31,
            loopMs,
            atlas: [png.width, png.height],
            rendered,
            frames: [analyzeScreenshot(frame0Buf), analyzeScreenshot(frame1Buf)]
          },
          null,
          2
        )
      )
    } finally {
      await close()
    }

    expect(pageErrors).toHaveLength(0)
    await context.close()
  })

  // ─── Video (WebM) ─────────────────────────────────────────────────────────────

  test('Video export — valid video container (WebM or MP4) with non-blank frame', async ({ browser }) => {
    const { page, context, pageErrors } = await setupApp(browser)

    const download = await exportFormat(page, 'Video')
    const bytes = await readDownloadBytes(download)

    // Detect format: WebM = EBML header (0x1A 0x45 0xDF 0xA3), MP4 = ftyp box
    const isWebM = bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3
    const isMP4 = bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70 // 'ftyp'
    expect(isWebM || isMP4, `Expected WebM or MP4 container, got bytes: ${bytes[0].toString(16)} ${bytes[4]}...`).toBe(
      true
    )

    const mimeType = isWebM ? 'video/webm' : 'video/mp4'
    saveArtifact(isWebM ? 'exported.webm' : 'exported.mp4', bytes)
    const base64 = toBase64(bytes)
    await page.setContent(`
      <body style="background:#000;margin:0">
        <video id="v" src="data:${mimeType};base64,${base64}" style="width:640px;height:480px"></video>
        <canvas id="c" width="640" height="480"></canvas>
      </body>
    `)

    // Wait for video metadata to load
    await page.waitForFunction(() => document.getElementById('v').readyState >= 1, { timeout: 15_000 })
    const duration = await page.evaluate(() => document.getElementById('v').duration)
    expect(Number.isFinite(duration), 'Video must have a finite seekable duration').toBe(true)
    expect(duration, 'Video duration must be > 0').toBeGreaterThan(0)
    saveArtifact('video-metadata.json', JSON.stringify({ mimeType, duration, sampleTime: duration / 2 }, null, 2))

    // Frame zero is intentionally the start of fade-in. Seek into the show
    // phase and await the decoded seek; compression noise at t=0 is not content.
    await page.evaluate(async () => {
      const v = document.getElementById('v')
      await new Promise((resolve, reject) => {
        v.addEventListener('seeked', resolve, { once: true })
        v.addEventListener('error', reject, { once: true })
        v.currentTime = v.duration / 2
      })
    })
    await page.waitForFunction(() => document.getElementById('v').readyState >= 2, { timeout: 10_000 })
    await page.evaluate(() => {
      const v = document.getElementById('v')
      const c = document.getElementById('c')
      c.getContext('2d').drawImage(v, 0, 0, 640, 480)
    })

    const screenshotBuf = await page.locator('#c').screenshot()
    saveScreenshot('video-show-frame.png', screenshotBuf)

    const metrics = analyzeScreenshot(screenshotBuf)
    expect(isBlank(metrics), 'Video show-phase frame must contain visible geometry').toBe(false)
    expect(metrics.entropy, `Video frame is blank. entropy=${metrics.entropy.toFixed(2)}`).toBeGreaterThan(0.05)

    expect(pageErrors).toHaveLength(0)
    await context.close()
  })
})
