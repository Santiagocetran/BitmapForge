import { expect } from '@playwright/test'
import process from 'node:process'
import path from 'node:path'
import { selectTask } from './editor.js'
const APP_URL = process.env.BITMAPFORGE_UI_URL || 'http://localhost:5173'
const VISUAL_STL = path.resolve('test/fixtures/models/export-visual-cube.stl')

// Canvas → BitmapEffect wrapper → PreviewCanvas's ResizeObserver container.
// Size layout only; normal engine resize owns backing dimensions and model framing.
export async function sizePreview(page, { width, height }) {
  const region = page.getByRole('region', { name: 'Preview' })
  const canvas = region.locator('canvas')
  await expect(canvas).toHaveCount(1)
  await canvas.evaluate(
    (element, size) => {
      const wrapper = element.parentElement
      const container = wrapper?.parentElement
      const region = element.closest('section[aria-label="Preview"], [role="region"][aria-label="Preview"]')
      if (
        !container ||
        !region?.contains(container) ||
        wrapper.children.length !== 1 ||
        container.children.length !== 1 ||
        !container.matches('div.h-full.w-full') ||
        !container.parentElement?.matches('.bf-canvas-surface')
      ) {
        throw new Error('Preview canvas → effect wrapper → observed container hierarchy changed')
      }
      container.style.width = `${size.width}px`
      container.style.height = `${size.height}px`
    },
    { width, height }
  )
  await expectPreviewSize(page, { width, height })
}

export async function expectPreviewSize(page, { width, height }) {
  const canvas = page.getByRole('region', { name: 'Preview' }).locator('canvas')
  await expect(canvas).toHaveCount(1)
  await expect(canvas).toBeVisible()
  expect(page.viewportSize()).toEqual({ width: 1280, height: 800 })
  const expected = {
    backing: [width, height],
    rendered: [width, height],
    client: [width, height],
    container: [width, height],
    dpr: 1
  }
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        const container = element.parentElement.parentElement
        return {
          backing: [element.width, element.height],
          rendered: [rect.width, rect.height],
          client: [element.clientWidth, element.clientHeight],
          container: [container.clientWidth, container.clientHeight],
          dpr: window.devicePixelRatio
        }
      })
    )
    .toEqual(expected)
  return expected
}

export async function setupApp(browser, { previewSize } = {}) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1
  })
  const page = await context.newPage()
  const pageErrors = []
  const failedRequests = []

  page.on('pageerror', (err) => pageErrors.push(err.message))
  page.on('response', (res) => {
    if (!res.ok() && res.url().startsWith(APP_URL)) failedRequests.push(`${res.status()} ${res.url()}`)
  })

  page.on('filechooser', () => {})
  await page.goto(APP_URL)
  if (previewSize) await sizePreview(page, previewSize)

  // Upload model via the hidden file input
  const fileInput = page.locator('input[aria-label="Upload 3D model file (STL, OBJ, GLTF, or GLB)"]').first()
  await fileInput.setInputFiles(VISUAL_STL)

  // Wait for model to finish loading (status bar shows "Model loaded.")
  await page
    .getByRole('region', { name: 'Preview' })
    .locator('canvas')
    .first()
    .waitFor({ state: 'visible', timeout: 15_000 })
  await page.waitForFunction(
    () => [...document.querySelectorAll('[role="status"]')].some((el) => el.textContent?.includes('Model loaded')),
    { timeout: 15_000 }
  )
  await page.waitForTimeout(1000) // let first render frame complete
  if (previewSize) await expectPreviewSize(page, previewSize)

  return { page, context, pageErrors, failedRequests }
}

// ─── Format selector + export trigger ────────────────────────────────────────

export async function exportFormat(page, formatLabel, { whileExporting } = {}) {
  await selectTask(page, 'Export')
  // Select format button (e.g. "APNG", "Code ZIP", "CSS Anim")
  await page.getByRole('button', { name: formatLabel, exact: true }).click()

  // Trigger export and wait for download. APNG/GIF can take >60s with swiftshader.
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 120_000 }),
    (async () => {
      await page.getByRole('button', { name: new RegExp(`Export ${formatLabel}`, 'i') }).click()
      await whileExporting?.()
    })()
  ])

  return download
}
