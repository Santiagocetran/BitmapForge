import { test, expect } from '@playwright/test'
import JSZip from 'jszip'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { Buffer } from 'node:buffer'
import { setupApp, exportFormat } from './utils/exportApp.js'
import { selectTask } from './utils/editor.js'
import { analyzeScreenshot, isBlank } from './utils/imageMetrics.js'
import { startStaticServer } from './utils/server.js'

const origin = process.env.BITMAPFORGE_UI_URL || 'http://localhost:5173'
const root = path.resolve(process.env.BITMAPFORGE_EXPORT_OUTPUT || 'test/fixtures/outputs')
const cube = path.resolve('test/fixtures/models/export-visual-cube.stl')
async function artifact(download, name) {
  const bytes = await fs.readFile(await download.path())
  await fs.mkdir(root, { recursive: true })
  await fs.writeFile(path.join(root, name), bytes)
  return bytes
}
async function selectAscii(page) {
  await selectTask(page, 'Look')
  await page.getByRole('combobox', { name: 'Render mode', exact: true }).selectOption('ascii')
  await page.getByRole('combobox', { name: 'Character Ramp', exact: true }).selectOption('blocks')
  const colored = page.getByLabel('Colored Mode', { exact: true })
  await colored.uncheck()
  // Read selected palette through a real project download, not a dev-store import.
  const event = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Save .bitmapforge', exact: true }).click()
  const settings = JSON.parse(await fs.readFile(await (await event).path(), 'utf8')).settings
  expect(settings).toMatchObject({ renderMode: 'ascii', charRamp: 'blocks', asciiColored: false })
  return settings
}

test.afterEach(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()))
})

test('GIF UI download animates', async ({ browser }, testInfo) => {
  const { page, pageErrors } = await setupApp(browser, { previewSize: { width: 384, height: 320 } })
  const canvas = page.locator('.bf-preview canvas')
  await canvas.evaluate((node) => {
    window.__gifCanvas = node
  })
  const downloads = []
  page.on('download', (download) => downloads.push(download))
  const download = await exportFormat(page, 'GIF', {
    whileExporting: async () => {
      await expect(page.getByRole('button', { name: 'Cancel export', exact: true })).toBeVisible()
      await selectTask(page, 'Motion')
      await page.setViewportSize({ width: 390, height: 844 })
      await page.getByRole('button', { name: 'Open settings', exact: true }).click()
      await selectTask(page, 'Export')
      await expect(page.getByRole('button', { name: 'Exporting…', exact: true })).toBeDisabled()
      await page.getByRole('button', { name: 'Close settings', exact: true }).click()
      await page.locator('.bf-mobile-toolbar').getByRole('button', { name: 'Export', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Export', exact: true })).toBeFocused()
      await expect(page.getByRole('button', { name: 'Cancel export', exact: true })).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath('real-pending-export-mobile.png') })
      await page.setViewportSize({ width: 1280, height: 800 })
      await expect(page.getByRole('heading', { name: 'Export', exact: true })).toBeFocused()
      expect(await canvas.evaluate((node) => node === window.__gifCanvas)).toBe(true)
    }
  })
  const bytes = await artifact(download, 'redesign.gif')
  expect(downloads).toHaveLength(1)
  expect(bytes.subarray(0, 6).toString()).toMatch(/^GIF8[79]a$/)
  const frames = await page.evaluate(
    async (data) => {
      if (typeof ImageDecoder === 'undefined' || !(await ImageDecoder.isTypeSupported('image/gif')))
        throw new Error('Chromium ImageDecoder GIF support unavailable: artifact gate blocked')
      const decoder = new ImageDecoder({ data: new Uint8Array(data), type: 'image/gif' })
      await decoder.tracks.ready
      await decoder.completed
      const count = decoder.tracks.selectedTrack.frameCount
      const canvas = document.createElement('canvas')
      const output = []
      for (let i = 0; i < count; i++) {
        const { image } = await decoder.decode({ frameIndex: i })
        canvas.width = image.displayWidth
        canvas.height = image.displayHeight
        canvas.getContext('2d').drawImage(image, 0, 0)
        output.push({ duration: image.duration, png: canvas.toDataURL().split(',')[1] })
        image.close()
      }
      decoder.close()
      return output
    },
    [...bytes]
  )
  expect(frames.length).toBeGreaterThan(1)
  expect(frames.every((frame) => frame.duration > 0)).toBe(true)
  expect(new Set(frames.map((frame) => frame.png)).size).toBeGreaterThan(1)
  const metrics = frames.map((frame) => analyzeScreenshot(Buffer.from(frame.png, 'base64')))
  const show = metrics.findIndex((metric) => !isBlank(metric) && metric.entropy > 0.5)
  expect(
    show,
    'decoded show-phase GIF frame meets APNG entropy and meaningful occupancy/color floors'
  ).toBeGreaterThanOrEqual(0)
  await fs.writeFile(path.join(root, 'gif-decoded.json'), JSON.stringify(metrics, null, 2))
  await testInfo.attach('decoded-show-frame', {
    body: Buffer.from(frames[show].png, 'base64'),
    contentType: 'image/png'
  })
  expect(pageErrors).toEqual([])
})

for (const [label, folder, entry, filename] of [
  ['React', 'MyAnimation', 'index.jsx', 'MyAnimation.zip'],
  ['Web Component', 'bitmap-animation', 'bitmap-animation.js', 'bitmap-animation.zip']
]) {
  test(`${label} UI archive preserves settings`, async ({ browser }) => {
    const { page, pageErrors } = await setupApp(browser)
    const settings = await selectAscii(page)
    const download = await exportFormat(page, label)
    expect(download.suggestedFilename()).toBe(filename)
    const zip = await JSZip.loadAsync(await artifact(download, filename), { checkCRC32: true })
    expect(zip.file(`${folder}/${entry}`)).not.toBeNull()
    const configText = await zip.file(`${folder}/config.js`).async('string')
    const config = JSON.parse(configText.replace(/^export const config =\s*/, '').trim())
    expect(config.effectOptions).toMatchObject({
      renderMode: 'ascii',
      charRamp: 'blocks',
      asciiColored: false,
      colors: settings.colors
    })
    expect(await zip.file(`${folder}/assets/export-visual-cube.stl`).async('nodebuffer')).toEqual(
      await fs.readFile(cube)
    )
    expect(await zip.file(`${folder}/engine/SceneManager.js`).async('string')).toBe(
      await fs.readFile('src/engine/SceneManager.js', 'utf8')
    )
    expect(await zip.file(`${folder}/engine/renderers/AsciiRenderer.js`).async('string')).toBe(
      await fs.readFile('src/engine/renderers/AsciiRenderer.js', 'utf8')
    )
    expect(pageErrors).toEqual([])
  })
}

test('Embed UI supported source runs and image stays disabled', async ({ browser }, testInfo) => {
  const { page, context, pageErrors } = await setupApp(browser)
  const bytes = await artifact(await exportFormat(page, 'Embed'), 'my-animation-embed.zip')
  const zip = await JSZip.loadAsync(bytes, { checkCRC32: true })
  const directory = path.join(root, 'embed-runtime')
  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue
    const target = path.resolve(directory, entry.name)
    expect(target.startsWith(directory + path.sep)).toBe(true)
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, await entry.async('nodebuffer'))
  }
  const sdk = await zip.file('my-animation/bitmap-forge.es.js').async('nodebuffer')
  const response = await page.request.get(`${origin}/embed/bitmap-forge.es.js`)
  expect(response.ok()).toBe(true)
  expect(sdk).toEqual(await response.body())
  const payload = JSON.parse(await zip.file('my-animation/animation.bforge').async('string'))
  expect(payload.settings.inputType).toBe('model')
  expect(Buffer.from(payload.model.data, 'base64')).toEqual(await fs.readFile(cube))
  const index = path.join(directory, 'my-animation/index.html')
  const html = await fs.readFile(index, 'utf8')
  // Only dependency resolution changes. SDK, project and model remain exact archive bytes.
  await fs.writeFile(
    index,
    html.replace('https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js', '/three/three.module.js')
  )
  const server = await startStaticServer(directory, { '/three/': path.resolve('node_modules/three/build') })
  const runtime = await context.newPage()
  const errors = [],
    requests = []
  runtime.on('pageerror', (error) => errors.push(error.message))
  runtime.on('requestfailed', (request) => requests.push(`${request.failure()?.errorText} ${request.url()}`))
  runtime.on('response', (response) => {
    if (!response.ok()) requests.push(`${response.status()} ${response.url()}`)
  })
  const sizes = [],
    readiness = []
  try {
    await runtime.goto(`${server.url}/my-animation/index.html`)
    const canvas = runtime.locator('bitmap-forge').locator('canvas')
    for (const [width, height] of [
      [600, 600],
      [384, 320]
    ]) {
      if (width === 384)
        await runtime.locator('bitmap-forge').evaluate((node) => {
          node.style.width = '384px'
          node.style.height = '320px'
        })
      await expect
        .poll(() =>
          canvas.evaluate((node) => {
            const rect = node.getBoundingClientRect()
            return [node.width, node.height, rect.width, rect.height]
          })
        )
        .toEqual([width, height, width, height])
      let metrics
      await expect
        .poll(
          async () => {
            // _loading ends when setRenderMode returns, but BitmapEffect may
            // queue that renderer until the current fade completes. Observe the
            // actual swap contract, not just model-load completion, before an
            // element screenshot can bind to the canvas scheduled for retirement.
            // Read only: the downloaded SDK and its normal loop own this work.
            const state = await runtime.locator('bitmap-forge').evaluate((element) => {
              const manager = element._manager
              const effect = manager?.effect
              const node = element.shadowRoot?.querySelector('canvas')
              const rect = node?.getBoundingClientRect()
              return {
                loading: element._loading,
                hasObject: manager?.hasObject() ?? false,
                rendererSettled: effect?._pendingRenderer === null,
                currentCanvas: !!node && node.isConnected && node === effect?.bitmapCanvas,
                dimensions: node ? [node.width, node.height, rect.width, rect.height] : null
              }
            })
            readiness.push({ width, height, ...state })
            if (state.loading !== false || !state.hasObject || !state.rendererSettled || !state.currentCanvas)
              return false
            if (state.dimensions.some((value, index) => value !== [width, height, width, height][index])) return false
            const shot = await canvas.screenshot()
            metrics = analyzeScreenshot(shot)
            await fs.writeFile(path.join(root, `embed-${width}x${height}.png`), shot)
            return !isBlank(metrics)
          },
          { timeout: 18000 }
        )
        .toBe(true)
      sizes.push({ width, height, metrics })
    }
    expect(await fs.readFile(path.join(directory, 'my-animation/bitmap-forge.es.js'))).toEqual(sdk)
    expect(errors).toEqual([])
    expect(requests).toEqual([])
  } finally {
    await testInfo.attach('embed-runtime-diagnostics', {
      body: JSON.stringify({ sizes, readiness, errors, requests }),
      contentType: 'application/json'
    })
    await server.close()
  }
  await selectTask(page, 'Source')
  await page.getByRole('button', { name: 'Image', exact: true }).click()
  await selectTask(page, 'Export')
  await page.getByRole('button', { name: 'Embed', exact: true }).click()
  const reason = 'Image input cannot be embedded — switch to model, shape, or text.'
  await expect(page.getByText(reason, { exact: true })).toBeVisible()
  const action = page.getByRole('button', { name: 'Export Embed', exact: true })
  await expect(action).toBeDisabled()
  const downloads = []
  page.on('download', (download) => downloads.push(download))
  await action.evaluate((node) => node.click())
  expect(downloads).toHaveLength(0)
  expect(pageErrors).toEqual([])
})
