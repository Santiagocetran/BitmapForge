import { test, expect } from '@playwright/test'
import process from 'node:process'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { analyzeScreenshot } from './utils/imageMetrics.js'

const appUrl = process.env.BITMAPFORGE_UI_URL || 'http://localhost:5173'
async function updateStore(page, values) {
  await page.evaluate(async (next) => {
    const { useProjectStore } = await import('/src/app/store/useProjectStore.js')
    useProjectStore.setState(next)
  }, values)
}

test('desktop disclosure, compact rail and export reveal preserve one preview and selection', async ({ page }) => {
  await page.goto(appUrl)
  const canvas = page.getByRole('region', { name: 'Preview' }).locator('canvas').first()
  await expect(canvas).toBeVisible()
  await canvas.evaluate((node) => {
    node.dataset.uiIdentity = 'stable'
  })
  await expect(page.getByRole('button', { name: 'Rotation Offset', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false'
  )
  await expect(page.getByRole('button', { name: 'Look', exact: true })).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('button', { name: 'GIF', exact: true }).click()
  const initial = await canvas.boundingBox()
  await page.getByRole('button', { name: 'Collapse settings', exact: true }).click()
  await expect(page.getByRole('group', { name: 'Export format' })).toBeHidden()
  expect((await canvas.boundingBox()).width).toBeGreaterThan(initial.width)
  await page.getByRole('button', { name: 'Export & Project', exact: true }).first().click()
  await expect(page.getByRole('button', { name: 'GIF', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(canvas).toHaveAttribute('data-ui-identity', 'stable')
  await expect(page.getByRole('group', { name: 'Export format' })).toHaveCount(1)
})

test('mobile drawer is isolated, restores each opener and survives resize with format', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto(appUrl)
  await expect(page.getByRole('group', { name: 'Export format' })).toHaveCount(0)
  const opener = page.getByRole('button', { name: 'Open settings', exact: true })
  await opener.click()
  const drawer = page.getByRole('dialog', { name: 'Settings', exact: true })
  await expect(drawer).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close settings' })).toBeFocused()
  expect(await page.getByRole('region', { name: 'Preview', includeHidden: true }).evaluate((n) => n.inert)).toBe(true)
  await page.getByRole('button', { name: 'GIF', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  await expect(opener).toBeFocused()
  await page.getByRole('button', { name: 'Export & Project', exact: true }).click()
  await expect(drawer.getByRole('button', { name: 'Export & Project', exact: true })).toBeFocused()
  await expect(page.getByRole('button', { name: 'GIF', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(drawer).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'GIF', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.setViewportSize({ width: 320, height: 480 })
  await expect(opener).toBeFocused()
  await expect(page.getByRole('group', { name: 'Export format' })).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

for (const opening of ['Open settings', 'Export & Project']) {
  test(`keyboard drag Escape has first refusal, then restores ${opening}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(appUrl)
    const initial = ['#111111', '#222222', '#333333']
    await updateStore(page, { colors: initial })
    const opener = page.getByRole('button', { name: opening, exact: true })
    await opener.click()
    const drawer = page.getByRole('dialog', { name: 'Settings', exact: true })
    const handle = drawer.getByRole('button', { name: 'Reorder color 2', exact: true })
    await handle.scrollIntoViewIfNeeded()
    await handle.focus()
    await page.keyboard.press('Space')
    await expect(handle).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('ArrowRight')
    await expect(drawer.locator('[role="status"][aria-live="assertive"]')).toContainText('color-2')
    await page.keyboard.press('Escape')
    await expect(drawer).toBeVisible()
    await expect(handle).not.toHaveAttribute('aria-pressed', 'true')
    await expect(handle).toBeFocused()
    expect(
      await page.evaluate(
        async () => (await import('/src/app/store/useProjectStore.js')).useProjectStore.getState().colors
      )
    ).toEqual(initial)
    await page.keyboard.press('Escape')
    await expect(drawer).toHaveCount(0)
    await expect(opener).toBeFocused()
  })
}

test('keyboard drag drop and external cancellation release drawer Escape ownership', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(appUrl)
  await updateStore(page, { colors: ['#111111', '#222222', '#333333'] })
  const opener = page.getByRole('button', { name: 'Open settings', exact: true })
  await opener.click()
  const drawer = page.getByRole('dialog', { name: 'Settings', exact: true })
  const handle = drawer.getByRole('button', { name: 'Reorder color 2', exact: true })
  await handle.scrollIntoViewIfNeeded()
  await handle.focus()
  await page.keyboard.press('Space')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('ArrowRight')
  await expect(drawer.locator('[role="status"][aria-live="assertive"]')).toContainText('color-2')
  await page.keyboard.press('Space')
  await expect(drawer).toBeVisible()
  await expect(drawer.getByRole('button', { name: 'Edit color 3: #222222', exact: true })).toBeFocused()
  expect(
    await page.evaluate(
      async () => (await import('/src/app/store/useProjectStore.js')).useProjectStore.getState().colors
    )
  ).toEqual(['#111111', '#333333', '#222222'])
  await page.keyboard.press('Escape')
  await expect(opener).toBeFocused()
  await opener.click()
  await handle.scrollIntoViewIfNeeded()
  await handle.focus()
  await page.keyboard.press('Space')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('ArrowRight')
  await updateStore(page, { colors: ['#444444', '#555555'] })
  await expect(handle).not.toHaveAttribute('aria-pressed', 'true')
  await expect(drawer).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  expect(
    await page.evaluate(
      async () => (await import('/src/app/store/useProjectStore.js')).useProjectStore.getState().colors
    )
  ).toEqual(['#444444', '#555555'])
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  await expect(opener).toBeFocused()
})

test('format native Enter/Space and sibling help close only topmost dialog', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto(appUrl)
  await page.getByRole('button', { name: 'Export & Project', exact: true }).click()
  await page.getByRole('button', { name: 'GIF', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'GIF', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'APNG', exact: true }).focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: 'APNG', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toHaveCount(0)
  await expect(page.getByRole('dialog', { name: 'Settings', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('drawer traps focus, preserves scroll styles and dismisses via backdrop or Close', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto(appUrl)
  const original = await page.evaluate(() => ({
    overflow: document.body.style.overflow,
    padding: document.body.style.paddingRight
  }))
  const opener = page.getByRole('button', { name: 'Open settings', exact: true })
  await opener.click()
  const drawer = page.getByRole('dialog', { name: 'Settings', exact: true })
  for (let i = 0; i < 35; i++) {
    await page.keyboard.press(i < 20 ? 'Tab' : 'Shift+Tab')
    expect(await drawer.evaluate((n) => n.contains(document.activeElement))).toBe(true)
  }
  await page.getByRole('region', { name: 'Preview', includeHidden: true }).evaluate((n) => {
    n.querySelector('button').focus()
  })
  expect(await drawer.evaluate((n) => n.contains(document.activeElement))).toBe(true)
  const close = page.getByRole('button', { name: 'Close settings' })
  await expect(close).toBeInViewport()
  await close.click()
  await expect(opener).toBeFocused()
  expect(
    await page.evaluate(() => ({ overflow: document.body.style.overflow, padding: document.body.style.paddingRight }))
  ).toEqual(original)
  await page.setViewportSize({ width: 390, height: 844 })
  await opener.click()
  await page.mouse.click(380, 400)
  await expect(drawer).toHaveCount(0)
  await expect(opener).toBeFocused()
})

test('portalled picker closes before parent focus restoration across both breakpoints and help', async ({ page }) => {
  await page.goto(appUrl)
  await page.getByRole('button', { name: /^Edit color 1:/ }).click()
  await expect(page.getByLabel('Hex color', { exact: true })).toBeFocused()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('button', { name: 'Open settings', exact: true })).toBeFocused()
  await expect(page.getByLabel('Hex color', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  await page.getByRole('button', { name: /^Edit color 1:/ }).click()
  await expect(page.getByLabel('Hex color', { exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByLabel('Hex color', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('dialog', { name: 'Settings', exact: true })).toBeVisible()
  await page.getByRole('button', { name: /^Edit color 1:/ }).click()
  // Help deliberately ignores typing targets. Invoke from a picker button.
  await page.getByRole('button', { name: 'Close color picker' }).focus()
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeVisible()
  await expect(page.getByLabel('Hex color', { exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Close settings' })).toBeFocused()
  await page.getByRole('button', { name: /^Edit color 1:/ }).click()
  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(page.getByRole('button', { name: 'Color Palette', exact: true })).toBeFocused()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('native Load Enter and Space, cancelled chooser, failed import and successful save/import share one notice', async ({
  page
}) => {
  // Arm interception before navigation, not alongside the first fast native keypress.
  // Keep it enabled between chooser waits; the fixture owns this page's lifetime.
  page.on('filechooser', () => {})
  await page.goto(appUrl)
  const load = page.getByRole('button', { name: 'Load .bitmapforge', exact: true })
  await load.focus()
  let chooser = page.waitForEvent('filechooser')
  await page.keyboard.press('Enter')
  await (await chooser).setFiles([])
  await expect(page.getByRole('alert')).toHaveCount(0)
  chooser = page.waitForEvent('filechooser')
  await load.focus()
  await page.keyboard.press('Space')
  await (
    await chooser
  ).setFiles({ name: 'invalid.bitmapforge', mimeType: 'application/json', buffer: Buffer.from('{}') })
  await expect(page.getByRole('alert')).toContainText('missing settings')
  const downloadEvent = page.waitForEvent('download')
  await page.keyboard.press('Control+s')
  const download = await downloadEvent
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.locator('[role="status"][aria-live="polite"]')).toContainText('Project saved')
  chooser = page.waitForEvent('filechooser')
  await load.click()
  await (await chooser).setFiles(await download.path())
  await expect(page.locator('[role="status"][aria-live="polite"]')).toContainText('Project loaded')
})

test('one nondestructive status host follows drawer and defers latest text during sibling help', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(appUrl)
  await updateStore(page, {
    inputType: 'shape',
    status: { loading: false, exporting: false, message: 'Ready', error: '' }
  })
  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: 'Settings', exact: true })
  const notice = drawer.locator('[role="status"][aria-live="polite"]')
  await updateStore(page, { status: { loading: false, exporting: true, message: 'Encoding APNG 42%', error: '' } })
  await expect(notice).toHaveText('Encoding APNG 42%')
  await expect(drawer.getByRole('button', { name: 'Exporting…', exact: true })).toBeDisabled()
  await updateStore(page, {
    status: { loading: false, exporting: true, message: 'Project saved as .bitmapforge file.', error: '' }
  })
  await expect(notice).toHaveText('Exporting…')
  await updateStore(page, { status: { loading: true, exporting: true, message: 'Encoding APNG 42%', error: '' } })
  await expect(notice).toHaveText('Exporting…')
  await updateStore(page, { status: { loading: false, exporting: false, message: 'obsolete', error: 'Save failed' } })
  await expect(drawer.getByRole('alert')).toContainText('Save failed')
  await expect(page.getByText('Save failed', { exact: true })).toHaveCount(1)
  await page.getByRole('button', { name: 'Dismiss error' }).click()
  await expect(page.locator('[role="status"][aria-live="polite"]')).toHaveText('')
  expect(
    await page.evaluate(
      async () => (await import('/src/app/store/useProjectStore.js')).useProjectStore.getState().inputType
    )
  ).toBe('shape')
  await page.getByRole('button', { name: 'Close settings' }).focus()
  await page.keyboard.press('?')
  await updateStore(page, { status: { loading: false, exporting: false, message: 'Deferred completion', error: '' } })
  await expect(page.getByText('Deferred completion', { exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(drawer.locator('[role="status"][aria-live="polite"]')).toHaveText('Deferred completion')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('region', { name: 'Preview' }).getByRole('status')).toHaveText('Deferred completion')
})

test('viewport and reduced-motion geometry retain nonblank stable preview and persistent access', async ({
  page
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(appUrl)
  await updateStore(page, { inputType: 'shape', useFadeInOut: false, animationPreset: 'none', rotateOnShow: false })
  const canvas = page.getByRole('region', { name: 'Preview' }).locator('canvas').first()
  await canvas.evaluate((n) => {
    n.dataset.uiIdentity = 'geometry'
  })
  const downloads = []
  page.on('download', (d) => downloads.push(d))
  for (const [width, height] of [
    [1280, 800],
    [1024, 768],
    [1023, 768],
    [390, 844],
    [320, 568],
    [667, 320]
  ]) {
    await page.setViewportSize({ width, height })
    await expect(canvas).toHaveAttribute('data-ui-identity', 'geometry')
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()
    expect(box.width).toBeGreaterThan(100)
    expect(box.height).toBeGreaterThan(100)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`viewport-${width}x${height}-closed.png`) })
    const access = page.getByRole('button', { name: 'Export & Project', exact: true }).first()
    await expect(access).toBeInViewport()
    await access.click()
    const heading = page.getByRole('button', { name: 'Export & Project', exact: true }).last()
    await expect(heading).toBeFocused()
    await expect(heading).toBeInViewport()
    await page.screenshot({ path: testInfo.outputPath(`viewport-${width}x${height}-export.png`) })
    if (width < 1024) {
      await expect(page.getByRole('button', { name: 'Close settings' })).toBeInViewport()
      await page.keyboard.press('Escape')
    }
  }
  expect(downloads).toHaveLength(0)
  const shot = await canvas.screenshot()
  const metrics = analyzeScreenshot(shot)
  expect(metrics.uniqueColors, 'responsive preview contains rendered shape colors').toBeGreaterThan(2)
  expect(metrics.entropy, 'small shape remains nonblank').toBeGreaterThan(0.01)
})

for (const opening of ['Open settings', 'Export & Project']) {
  test(`committed close/reopen ignores stale autofocus for ${opening}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(appUrl)
    await page.getByRole('button', { name: opening, exact: true }).click()
    await page.evaluate((label) => {
      const drawer = document.querySelector('[role="dialog"]')
      window.__closedDrawer = drawer
      const opener = [...document.querySelectorAll('main button')].find((node) => node.textContent === label)
      const observer = new MutationObserver(() => {
        if (!drawer.isConnected) {
          observer.disconnect()
          opener.click()
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
      drawer.querySelector('[aria-label="Close settings"]').click()
    }, opening)
    const drawer = page.getByRole('dialog', { name: 'Settings', exact: true })
    await expect(drawer).toBeVisible()
    await expect.poll(() => drawer.evaluate((node) => node !== window.__closedDrawer)).toBe(true)
    const target =
      opening === 'Open settings'
        ? drawer.getByRole('button', { name: 'Close settings' })
        : drawer.getByRole('button', { name: 'Export & Project', exact: true })
    await expect(target).toBeFocused()
    // Two rendering frames span Radix's deferred teardown without application timers.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await expect(target).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(drawer).toHaveCount(0)
    await expect(page.getByRole('button', { name: opening, exact: true })).toBeFocused()
  })
}

test('stable notice has no text mutation across host moves and help freezes until latest resume', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await page.goto(appUrl)
  await updateStore(page, {
    inputType: 'shape',
    status: { loading: false, exporting: false, message: 'Stable', error: '' }
  })
  const notice = page.locator('[role="status"][aria-live="polite"]')
  await expect(notice).toHaveText('Stable')
  await notice.evaluate((node) => {
    window.__notice = node
    window.__noticeMutations = []
    window.__noticeObserver = new MutationObserver((records) =>
      window.__noticeMutations.push(...records.map((r) => r.type))
    )
    window.__noticeObserver.observe(node, { childList: true, characterData: true, subtree: true })
  })
  await page.getByRole('button', { name: 'Collapse settings', exact: true }).click()
  await page.getByRole('button', { name: 'Expand settings', exact: true }).click()
  await page.getByRole('button', { name: 'Look', exact: true }).click()
  await page.setViewportSize({ width: 1023, height: 768 })
  await page.getByRole('button', { name: 'Open settings' }).click()
  await expect(page.getByRole('dialog', { name: 'Settings', exact: true }).locator('[aria-live="polite"]')).toHaveText(
    'Stable'
  )
  await page.getByRole('button', { name: 'Close settings' }).focus()
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeVisible()
  await updateStore(page, {
    status: { loading: false, exporting: false, message: 'hidden message', error: 'hidden error' }
  })
  await updateStore(page, { status: { loading: false, exporting: false, message: 'Final latest', error: '' } })
  expect(
    await notice.evaluate((node) => ({
      same: node === window.__notice,
      text: node.textContent,
      mutations: window.__noticeMutations
    }))
  ).toEqual({ same: true, text: 'Stable', mutations: [] })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Settings', exact: true }).locator('[aria-live="polite"]')).toHaveText(
    'Final latest'
  )
  expect(await notice.evaluate(() => window.__noticeMutations.length)).toBe(1)
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(page.getByRole('region', { name: 'Preview' }).locator('[aria-live="polite"]')).toHaveText('Final latest')
  expect(
    await notice.evaluate((node) => ({ same: node === window.__notice, mutations: window.__noticeMutations.length }))
  ).toEqual({ same: true, mutations: 1 })
  await expect(notice).toHaveCount(1)
  await expect(page.getByRole('alert')).toHaveCount(0)
})

for (const opening of ['Open settings', 'Export & Project']) {
  test(`ordinary Close Escape and backdrop restore ${opening}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(appUrl)
    const opener = page.getByRole('button', { name: opening, exact: true })
    for (const method of ['Close', 'Escape', 'backdrop']) {
      await opener.click()
      const drawer = page.getByRole('dialog', { name: 'Settings', exact: true })
      await expect(drawer).toBeVisible()
      if (method === 'Close') await drawer.getByRole('button', { name: 'Close settings' }).click()
      else if (method === 'Escape') await page.keyboard.press('Escape')
      else await page.mouse.click(380, 400)
      await expect(drawer).toHaveCount(0)
      await expect(opener).toBeFocused()
    }
  })
}

for (const hiding of ['close', 'resize']) {
  test(`active keyboard drag parent ${hiding} cancels and releases subsequent Escape`, async ({ page }) => {
    await page.setViewportSize({ width: 1023, height: 768 })
    await page.goto(appUrl)
    const colors = ['#111111', '#222222', '#333333']
    await updateStore(page, { colors })
    const opener = page.getByRole('button', { name: 'Open settings' })
    await opener.click()
    const drawer = page.getByRole('dialog', { name: 'Settings', exact: true })
    const handle = drawer.getByRole('button', { name: 'Reorder color 2', exact: true })
    await handle.scrollIntoViewIfNeeded()
    await handle.focus()
    await page.keyboard.press('Space')
    await expect(handle).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('ArrowRight')
    if (hiding === 'close') await drawer.getByRole('button', { name: 'Close settings' }).click()
    else {
      await page.setViewportSize({ width: 1024, height: 768 })
      await expect(drawer).toHaveCount(0)
      await page.setViewportSize({ width: 1023, height: 768 })
    }
    await expect(drawer).toHaveCount(0)
    await opener.click()
    await expect(handle).not.toHaveAttribute('aria-pressed', 'true')
    expect(
      await page.evaluate(
        async () => (await import('/src/app/store/useProjectStore.js')).useProjectStore.getState().colors
      )
    ).toEqual(colors)
    await page.keyboard.press('Escape')
    await expect(drawer).toHaveCount(0)
    await expect(opener).toBeFocused()
  })
}

test('native save bridge uses current settings once across rerenders, boundaries, failure and recovery', async ({
  page
}) => {
  await page.goto(appUrl)
  const downloads = []
  page.on('download', (download) => downloads.push(download))
  for (const [width, pixelSize] of [
    [1024, 5],
    [1023, 8],
    [1024, 11]
  ]) {
    await page.setViewportSize({ width, height: 768 })
    await updateStore(page, { pixelSize, inputType: 'shape' })
    if (width < 1024) await page.getByRole('button', { name: 'Open settings' }).click()
    await page.getByRole('button', { name: 'Save .bitmapforge' }).focus()
    const event = page.waitForEvent('download')
    await page.keyboard.press('Control+s')
    const download = await event
    const payload = JSON.parse(await readFile(await download.path(), 'utf8'))
    expect(payload.settings.pixelSize).toBe(pixelSize)
    await expect(page.locator('[role="status"][aria-live="polite"]')).toContainText('Project saved')
  }
  expect(downloads).toHaveLength(3)
  await page.evaluate(() => {
    window.__createObjectURL = URL.createObjectURL
    URL.createObjectURL = () => {
      throw new Error('Save probe failure')
    }
  })
  await page.keyboard.press('Control+s')
  await expect(page.getByRole('alert')).toContainText('Save probe failure')
  await expect(page.getByRole('alert')).toHaveCount(1)
  expect(downloads).toHaveLength(3)
  await page.evaluate(() => {
    URL.createObjectURL = window.__createObjectURL
  })
  const recovery = page.waitForEvent('download')
  await page.keyboard.press('Control+s')
  await recovery
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(downloads).toHaveLength(4)
})
