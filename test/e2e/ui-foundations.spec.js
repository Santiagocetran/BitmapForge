import { test, expect } from '@playwright/test'
import process from 'node:process'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { selectTask, revealExport, clickBackdrop, drainFrames, expectWithin } from './utils/editor.js'
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
  await expect(
    page.getByRole('group', { name: 'Editor tasks' }).getByRole('button', { name: 'Source', exact: true })
  ).toHaveAttribute('aria-pressed', 'true')
  await selectTask(page, 'Motion')
  await expect(page.getByRole('button', { name: 'Rotation Offset', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false'
  )
  await expect(
    page.getByRole('group', { name: 'Editor tasks' }).getByRole('button', { name: 'Look', exact: true })
  ).toHaveAttribute('aria-pressed', 'false')
  await selectTask(page, 'Export')
  await page.getByRole('button', { name: 'GIF', exact: true }).click()
  const initial = await canvas.boundingBox()
  await page.getByRole('button', { name: 'Collapse settings', exact: true }).click()
  await expect(page.getByRole('group', { name: 'Export format' })).toBeHidden()
  expect((await canvas.boundingBox()).width).toBeGreaterThan(initial.width)
  await revealExport(page)
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
  expect(
    await page
      .getByRole('region', { name: 'Preview', includeHidden: true })
      .evaluate((node) => Boolean(node.closest('[inert]')))
  ).toBe(true)
  await selectTask(page, 'Export')
  await page.getByRole('button', { name: 'GIF', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  await expect(opener).toBeFocused()
  await revealExport(page)
  await expect(drawer.getByRole('heading', { name: 'Export', exact: true })).toBeFocused()
  await expect(page.getByRole('button', { name: 'GIF', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(drawer).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'GIF', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.setViewportSize({ width: 320, height: 480 })
  await expect(opener).toBeFocused()
  await expect(page.getByRole('group', { name: 'Export format' })).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

for (const opening of ['Open settings', 'Export']) {
  test(`keyboard drag Escape has first refusal, then restores ${opening}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(appUrl)
    const initial = ['#111111', '#222222', '#333333']
    await updateStore(page, { colors: initial })
    const opener = page.getByRole('button', { name: opening, exact: true })
    await opener.click()
    const drawer = page.getByRole('dialog', { name: 'Settings', exact: true })
    await selectTask(page, 'Look')
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
  await selectTask(page, 'Look')
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
  await revealExport(page)
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
  await clickBackdrop(page)
  await expect(drawer).toHaveCount(0)
  await expect(opener).toBeFocused()
})

test('portalled picker closes before parent focus restoration across both breakpoints and help', async ({ page }) => {
  await page.goto(appUrl)
  await selectTask(page, 'Look')
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
  await expect(page.getByRole('heading', { name: 'Look', exact: true })).toBeFocused()
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
  await selectTask(page, 'Export')
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
    const access = page.locator('.bf-header, .bf-mobile-toolbar').getByRole('button', { name: 'Export', exact: true })
    await expect(access).toBeInViewport()
    await access.click()
    const heading = page.getByRole('heading', { name: 'Export', exact: true })
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

for (const opening of ['Open settings', 'Export']) {
  test(`committed close/reopen ignores stale autofocus for ${opening}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(appUrl)
    await page.getByRole('button', { name: opening, exact: true }).click()
    await page.evaluate((label) => {
      const drawer = document.querySelector('[role="dialog"]')
      window.__closedDrawer = drawer
      const opener = [...document.querySelectorAll('.bf-mobile-toolbar button')].find(
        (node) => node.textContent === label
      )
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
        : drawer.getByRole('heading', { name: 'Export', exact: true })
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

for (const opening of ['Open settings', 'Export']) {
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
      else await clickBackdrop(page)
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
    await selectTask(page, 'Look')
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
    if (width < 1024) await expect(page.getByRole('button', { name: 'Close settings' })).toBeFocused()
    else await page.getByRole('button', { name: 'Save .bitmapforge' }).focus()
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

// R1: every source route starts from fresh empty state; native activation is not
// replaced by hidden-input assignment. The interception boundary precedes NAV.
for (const [width, height] of [
  [667, 320],
  [320, 568]
]) {
  for (const empty of ['model', 'image']) {
    test(`R1 ${empty} empty invitation and sibling Help ${width}x${height}`, async ({ page }, testInfo) => {
      page.on('filechooser', () => {})
      await page.setViewportSize({ width, height })
      await page.goto(appUrl)
      await updateStore(page, { inputType: empty, model: null, imageSource: null })
      const canvas = page.getByRole('region', { name: 'Preview' }).locator('canvas')
      await canvas.evaluate((node) => {
        window.__r1Canvas = node
      })
      const invitation = page.locator('.bf-empty-scroll')
      for (const label of ['3D model', 'Shapes', 'Text', 'Image', 'Try demo model']) {
        await updateStore(page, { inputType: empty, model: null, imageSource: null })
        const target = invitation.getByRole('button', { name: label, exact: true })
        await target.focus()
        const rect = await invitation.boundingBox()
        await expectWithin(target, rect, true)
        await expect(target).toBeFocused()
        await page.screenshot({ path: testInfo.outputPath(`empty-${empty}-${label.replaceAll(' ', '-')}.png`) })
        if (label === 'Try demo model') {
          await target.press('Enter')
          await expect(page.locator('[role="status"][aria-live="polite"]')).toContainText('Model loaded', {
            timeout: 15000
          })
          expect(
            await page.evaluate(async () => {
              const state = (await import('/src/app/store/useProjectStore.js')).useProjectStore.getState()
              return { kind: state.inputType, name: state.model?.name }
            })
          ).toEqual({ kind: 'model', name: 'david_head.glb' })
          await expect(invitation).toHaveCount(0)
          if (await page.getByRole('dialog', { name: 'Settings', exact: true }).count())
            await page.keyboard.press('Escape')
          expect(await canvas.evaluate((node) => node === window.__r1Canvas)).toBe(true)
          continue
        }
        await target.press('Enter')
        const dialog = page.getByRole('dialog', { name: 'Settings', exact: true })
        await expect(dialog).toBeVisible()
        await expect(
          page.getByRole('group', { name: 'Editor tasks' }).getByRole('button', { name: 'Source', exact: true })
        ).toHaveAttribute('aria-pressed', 'true')
        if (label === '3D model' || label === 'Image') {
          const chooserTarget = dialog.getByRole('button', {
            name: label === 'Image' ? 'Choose Image' : 'Choose File',
            exact: true
          })
          await expect(chooserTarget).toBeFocused()
          const chooser = page.waitForEvent('filechooser')
          await chooserTarget.press(label === 'Image' ? 'Space' : 'Enter')
          await (await chooser).setFiles([])
        } else if (label === 'Text') await expect(dialog.getByRole('textbox').first()).toBeFocused()
        else
          await expect(
            dialog.getByRole('group', { name: 'Shape', exact: true }).locator('button[aria-pressed="true"]')
          ).toBeFocused()
        await page.keyboard.press('Escape')
        expect(await canvas.evaluate((node) => node === window.__r1Canvas)).toBe(true)
      }
      await page.getByRole('banner').getByRole('button', { name: 'Help', exact: true }).click()
      const help = page.getByRole('dialog', { name: 'Keyboard Shortcuts' })
      await expectWithin(help.getByRole('button', { name: /close/i }), { x: 0, y: 0, width, height }, true)
      await expectWithin(help.getByText('Show this help', { exact: true }), { x: 0, y: 0, width, height })
      await page.screenshot({ path: testInfo.outputPath('short-help.png') })
      await page.keyboard.press('Escape')
      await page.keyboard.press('?')
      await expect(help).toBeVisible()
      await page.keyboard.press('Escape')
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)
      ).toBe(true)
      expect(await canvas.evaluate((node) => node === window.__r1Canvas)).toBe(true)
    })
  }
}

for (const [H, T] of [
  [320, 0],
  [280, 40],
  [220, 40]
]) {
  test(`R1 adapter visible rectangle H${H} T${T} preserves input on scroll and size events`, async ({
    page
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript(
      ({ H, T }) => {
        window.__rectangle = { H, T }
        Object.defineProperty(visualViewport, 'height', { configurable: true, get: () => window.__rectangle.H })
        Object.defineProperty(visualViewport, 'offsetTop', { configurable: true, get: () => window.__rectangle.T })
      },
      { H, T }
    )
    await page.goto(appUrl)
    const canvas = page.locator('.bf-preview canvas')
    await canvas.evaluate((node) => {
      window.__r1Canvas = node
    })
    await page.getByRole('button', { name: 'Open settings', exact: true }).click()
    const sheet = page.getByRole('dialog', { name: 'Settings', exact: true })
    let bounds = await sheet.boundingBox()
    expect(bounds.y).toBeCloseTo(T, 0)
    expect(bounds.height).toBeCloseTo(H, 0)
    await selectTask(page, 'Source')
    await sheet.getByRole('button', { name: 'Text', exact: true }).click()
    const input = sheet.locator('textarea')
    await input.focus()
    await input.fill('BitmapForge')
    for (const [height, top, event] of [
      [H, T + 10, 'scroll'],
      [H - 20, T + 10, 'resize']
    ]) {
      await page.evaluate(
        ({ height, top, event }) => {
          window.__rectangle = { H: height, T: top }
          visualViewport.dispatchEvent(new Event(event))
        },
        { height, top, event }
      )
      await expect(input).toBeFocused()
      await expectWithin(input, { x: 0, y: top, width: 390, height })
      bounds = await sheet.boundingBox()
      expect(bounds.y).toBeCloseTo(top, 0)
      expect(bounds.height).toBeCloseTo(height, 0)
    }
    await sheet.getByRole('button', { name: 'Help', exact: true }).click()
    const help = page.getByRole('dialog', { name: 'Keyboard Shortcuts' })
    await expectWithin(help.getByText('Show this help', { exact: true }), {
      x: 0,
      y: T + 10,
      width: 390,
      height: H - 20
    })
    await page.screenshot({ path: testInfo.outputPath(`rectangle-${H}-${T}.png`) })
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    expect(await canvas.evaluate((node) => node === window.__r1Canvas)).toBe(true)
  })
}

test('R2 deep task reset, native navigation focus, durable disclosures and reveal ordering', async ({
  page
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(appUrl)
  await page.evaluate(async () => {
    const store = (await import('/src/app/store/useProjectStore.js')).useProjectStore
    store.temporal.getState().clear()
  })
  const body = page.locator('.bf-task-body')
  for (const [name, disclosures] of [
    ['Look', ['Tone & background', 'Texture effects', 'Browse palettes']],
    ['Motion', ['Rotation Offset', 'Light Direction']],
    ['Export', []]
  ]) {
    await selectTask(page, name)
    for (const label of disclosures) {
      const control = ['Tone & background', 'Texture effects'].includes(label)
        ? page.locator('summary').filter({ hasText: label })
        : page.getByRole('button', { name: label, exact: true })
      if ((await control.getAttribute('aria-expanded')) !== 'true') await control.click()
    }
    await body.evaluate((node) => {
      node.scrollTop = node.scrollHeight
    })
    const last = page.locator('.bf-task-panel:visible').locator('button:visible, input:visible, select:visible').last()
    await last.focus()
    await last.scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath(`deep-${name}.png`) })
    for (const key of [undefined, 'Enter', 'Space']) {
      await body.evaluate((node) => {
        node.scrollTop = node.scrollHeight
      })
      const button = await selectTask(page, name, key)
      await expect(button).toBeFocused()
      expect(await body.evaluate((node) => node.scrollTop)).toBe(0)
      const heading = page.getByRole('heading', { name, exact: true })
      await expectWithin(heading, await body.boundingBox())
      if (name === 'Look') {
        await page.keyboard.press('Tab')
        await expect(
          page.getByRole('group', { name: 'Editor tasks' }).getByRole('button', { name: 'Motion', exact: true })
        ).toBeFocused()
      }
    }
    for (const label of disclosures) {
      const control = ['Tone & background', 'Texture effects'].includes(label)
        ? page.locator('summary').filter({ hasText: label })
        : page.getByRole('button', { name: label, exact: true })
      await expect(control).toHaveAttribute('aria-expanded', 'true')
    }
  }
  await page.getByRole('button', { name: 'Collapse settings', exact: true }).click()
  await page.getByRole('button', { name: 'Expand settings', exact: true }).click()
  expect(await body.evaluate((node) => node.scrollTop)).toBe(0)
  const readHistory = () =>
    page.evaluate(async () => {
      const { pastStates, futureStates } = (
        await import('/src/app/store/useProjectStore.js')
      ).useProjectStore.temporal.getState()
      return [pastStates.length, futureStates.length]
    })
  expect(await readHistory()).toEqual([0, 0])
  await page.evaluate(() => {
    document.querySelector('.bf-header > button:last-child').click()
    document.querySelector('.bf-source-routes button').click()
    document.querySelector('.bf-header > button:last-child').click()
  })
  await drainFrames(page)
  await expect(page.getByRole('heading', { name: 'Export', exact: true })).toBeFocused()
  await expectWithin(page.getByRole('heading', { name: 'Export', exact: true }), await body.boundingBox())
  // Source selection deliberately invokes the existing project setter; measure
  // that action separately from scroll/task/modal UI-only history protection.
  const historyAfterSource = await readHistory()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  expect(await body.evaluate((node) => node.scrollTop)).toBe(0)
  await body.evaluate((node) => {
    node.scrollTop = node.scrollHeight
  })
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  expect(await body.evaluate((node) => node.scrollTop)).toBe(0)
  await selectTask(page, 'Motion')
  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(page.getByRole('heading', { name: 'Motion', exact: true })).toBeFocused()
  expect(await body.evaluate((node) => node.scrollTop)).toBe(0)
  const history = await page.evaluate(async () => {
    const { pastStates, futureStates } = (
      await import('/src/app/store/useProjectStore.js')
    ).useProjectStore.temporal.getState()
    return [pastStates.length, futureStates.length]
  })
  expect(history).toEqual(historyAfterSource)
})

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [320, 568],
  [667, 320],
  [640, 400]
]) {
  test(`combined state captures and real control contrast ${width}x${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height })
    await page.goto(appUrl)
    const canvas = page.locator('.bf-preview canvas')
    await canvas.evaluate((node) => {
      window.__statesCanvas = node
    })
    await page.screenshot({ path: testInfo.outputPath('empty.png') })
    await updateStore(page, { inputType: 'shape', useFadeInOut: false, rotateOnShow: false })
    await page.screenshot({ path: testInfo.outputPath('loaded.png') })
    // Visual-state fixture uses the real producer store/presenter; it is not
    // represented as a measured network/engine loading benchmark.
    await updateStore(page, { status: { loading: true, exporting: false, message: 'Loading source…', error: '' } })
    await expect(page.locator('.bf-preview .animate-spin')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('loading.png') })
    await updateStore(page, { status: { loading: false, exporting: false, message: '', error: '' } })
    if (width < 1024) await page.getByRole('button', { name: 'Open settings', exact: true }).click()
    for (const task of ['Source', 'Look', 'Motion', 'Export']) {
      await selectTask(page, task)
      await page.screenshot({ path: testInfo.outputPath(`${task.toLowerCase()}.png`) })
    }
    await expect(page.locator('input[type="file"][accept=".bitmapforge"]')).toHaveCount(1)
    await selectTask(page, 'Look')
    const swatch = page.getByRole('button', { name: /^Edit color 1:/ })
    await swatch.click()
    const hex = page.getByLabel('Hex color', { exact: true })
    await hex.fill('#ab')
    await hex.press('Enter')
    await expect(hex).toHaveAttribute('aria-invalid', 'true')
    await page.screenshot({ path: testInfo.outputPath('invalid-picker.png') })
    await page.keyboard.press('Escape')
    await selectTask(page, 'Export')
    await updateStore(page, { status: { loading: false, exporting: true, message: 'Encoding APNG 42%', error: '' } })
    await expect(page.locator('[role="status"][aria-live="polite"]')).toHaveText('Encoding APNG 42%')
    await expect(page.getByRole('button', { name: 'Exporting…', exact: true })).toBeDisabled()
    await page.screenshot({ path: testInfo.outputPath('busy.png') })
    await updateStore(page, {
      status: {
        loading: false,
        exporting: false,
        message: '',
        error: 'Export failed. Choose another format and try again. '.repeat(12)
      }
    })
    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await page.getByRole('button', { name: 'Dismiss error', exact: true }).scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('error.png') })
    await page.getByRole('button', { name: 'Dismiss error', exact: true }).click()
    await updateStore(page, { status: { loading: false, exporting: false, message: 'Export complete', error: '' } })
    await page.screenshot({ path: testInfo.outputPath('success.png') })
    const controls = await page
      .locator('.bf-task-panel:visible .bf-choice, .bf-task[aria-pressed="true"], .bf-task-panel:visible .bf-button')
      .evaluateAll((nodes) => {
        const luminance = (color) => {
          const c = color
            .match(/[\d.]+/g)
            .slice(0, 3)
            .map(Number)
            .map((v) => {
              v /= 255
              return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
            })
          return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722
        }
        const ratio = (a, b) =>
          (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05)
        return nodes
          .filter((node) => node.getClientRects().length)
          .map((node) => {
            const s = getComputedStyle(node)
            let parent = node
            let background = s.backgroundColor
            while (background === 'rgba(0, 0, 0, 0)' && parent.parentElement) {
              parent = parent.parentElement
              background = getComputedStyle(parent).backgroundColor
            }
            return {
              name: node.textContent.trim(),
              text: ratio(s.color, background),
              boundary: ratio(s.borderTopColor, background),
              selected: node.getAttribute('aria-pressed') === 'true'
            }
          })
      })
    expect(controls.length).toBeGreaterThan(0)
    for (const control of controls) {
      expect(control.text, control.name).toBeGreaterThanOrEqual(4.5)
      if (control.selected) expect(control.boundary, control.name).toBeGreaterThanOrEqual(3)
    }
    await testInfo.attach('actual-control-contrast', {
      body: JSON.stringify(controls, null, 2),
      contentType: 'application/json'
    })
    if (width < 1024)
      await page
        .getByRole('dialog', { name: 'Settings', exact: true })
        .getByRole('button', { name: 'Help', exact: true })
        .click()
    else await page.getByRole('banner').getByRole('button', { name: 'Help', exact: true }).click()
    await page.screenshot({ path: testInfo.outputPath('help.png') })
    await page.keyboard.press('Escape')
    expect(await canvas.evaluate((node) => node === window.__statesCanvas)).toBe(true)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)
    ).toBe(true)
  })
}

test('controlled palette name/browse survive remount and never steal destination focus', async ({ page }) => {
  await page.goto(appUrl)
  await selectTask(page, 'Look')
  for (const label of ['Tone & background', 'Texture effects']) {
    await page.locator('summary').filter({ hasText: label }).click()
  }
  await page.getByRole('button', { name: 'Browse palettes', exact: true }).click()
  await page.getByRole('button', { name: 'Save palette', exact: true }).click()
  const name = page.getByLabel('Palette name', { exact: true })
  await name.fill('Retained name')
  await page.getByRole('button', { name: 'Browse palettes', exact: true }).click()
  await expect(name).toHaveValue('Retained name')
  await selectTask(page, 'Motion')
  await selectTask(page, 'Look')
  await expect(name).toHaveValue('Retained name')
  await expect(
    page.getByRole('group', { name: 'Editor tasks' }).getByRole('button', { name: 'Look', exact: true })
  ).toBeFocused()
  await page.getByRole('button', { name: 'Collapse settings', exact: true }).click()
  await page.getByRole('button', { name: 'Expand settings', exact: true }).click()
  await expect(name).toHaveValue('Retained name')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  await expect(name).toHaveValue('Retained name')
  await expect(page.getByRole('button', { name: 'Close settings', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  await expect(name).toHaveValue('Retained name')
  await expect(page.getByRole('button', { name: 'Close settings', exact: true })).toBeFocused()
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(name).toHaveValue('Retained name')
  await expect(page.getByRole('heading', { name: 'Look', exact: true })).toBeFocused()
  for (const label of ['Tone & background', 'Texture effects']) {
    await expect(page.locator('summary').filter({ hasText: label })).toHaveAttribute('aria-expanded', 'true')
  }
  await expect(page.getByRole('button', { name: 'Browse palettes', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false'
  )
  await drainFrames(page)
  await expect(page.getByRole('heading', { name: 'Look', exact: true })).toBeFocused()
  await name.focus()
  await name.press('Escape')
  await expect(name).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Save palette', exact: true })).toBeFocused()
})

test('active keyboard drag task hide retires Escape ownership without writing colors', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(appUrl)
  const colors = ['#111111', '#222222', '#111111']
  await updateStore(page, { colors })
  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  await selectTask(page, 'Look')
  const handle = page.getByRole('button', { name: 'Reorder color 2', exact: true })
  await handle.focus()
  await handle.press('Space')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('ArrowRight')
  await selectTask(page, 'Motion')
  await selectTask(page, 'Look')
  await expect(handle).not.toHaveAttribute('aria-pressed', 'true')
  expect(
    await page.evaluate(
      async () => (await import('/src/app/store/useProjectStore.js')).useProjectStore.getState().colors
    )
  ).toEqual(colors)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Settings', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Open settings', exact: true })).toBeFocused()
})

for (const hiding of ['task', 'help', 'collapse', 'close', 'resize']) {
  test(`valid uncommitted hex parent ${hiding} cancels synchronously before blur`, async ({ page }) => {
    await page.setViewportSize({ width: hiding === 'close' ? 390 : 1280, height: 844 })
    await page.goto(appUrl)
    if (hiding === 'close') await page.getByRole('button', { name: 'Open settings', exact: true }).click()
    await selectTask(page, 'Look')
    const before = await page.evaluate(
      async () => (await import('/src/app/store/useProjectStore.js')).useProjectStore.getState().colors
    )
    await page.getByRole('button', { name: /^Edit color 1:/ }).click()
    await page.getByLabel('Hex color', { exact: true }).fill('#123456')
    if (hiding === 'task') await selectTask(page, 'Motion')
    if (hiding === 'help') await page.getByRole('banner').getByRole('button', { name: 'Help', exact: true }).click()
    if (hiding === 'collapse') await page.getByRole('button', { name: 'Collapse settings', exact: true }).click()
    if (hiding === 'close') await page.getByRole('button', { name: 'Close settings', exact: true }).click()
    if (hiding === 'resize') await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByLabel('Hex color', { exact: true })).toHaveCount(0)
    expect(
      await page.evaluate(
        async () => (await import('/src/app/store/useProjectStore.js')).useProjectStore.getState().colors
      )
    ).toEqual(before)
  })
}

for (const opening of ['Open settings', 'Export']) {
  test(`B1 palette name first Escape stays in Settings, second restores ${opening}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto(appUrl)
    const opener = page.locator('.bf-mobile-toolbar').getByRole('button', { name: opening, exact: true })
    const settings = page.getByRole('dialog', { name: 'Settings', exact: true })
    await opener.click()
    await selectTask(page, 'Look')
    await page.getByRole('button', { name: 'Save palette', exact: true }).click()
    const name = page.getByLabel('Palette name', { exact: true })
    await name.fill('Retain on parent hide')
    await expect(name).toBeFocused()
    await settings.getByRole('button', { name: 'Close settings', exact: true }).click()
    await expect(settings).toHaveCount(0)
    await expect(opener).toBeFocused()
    await opener.click()
    const initial =
      opening === 'Export'
        ? settings.getByRole('heading', { name: 'Export', exact: true })
        : settings.getByRole('button', { name: 'Close settings', exact: true })
    await expect(initial).toBeFocused()
    await selectTask(page, 'Look')
    await expect(name).toHaveValue('Retain on parent hide')
    await name.focus()
    await name.press('Escape')
    await expect(settings).toBeVisible()
    await expect(name).toHaveCount(0)
    const save = page.getByRole('button', { name: 'Save palette', exact: true })
    await expect(save).toBeFocused()
    await expect(save).toBeInViewport()
    await page.screenshot({ path: testInfo.outputPath('name-first-escape.png') })
    await page.keyboard.press('Escape')
    await expect(settings).toHaveCount(0)
    await expect(opener).toBeFocused()
    await opener.click()
    await selectTask(page, 'Look')
    await expect(name).toHaveCount(0)
    await save.click()
    await expect(name).toHaveValue('')
  })
}

test('actual native, portal invalid, selected focus and disabled control contrast', async ({ page }, testInfo) => {
  await page.goto(appUrl)
  const samples = []
  async function sample(locator, name, boundary = false, focus = false) {
    const result = await locator.evaluate((node) => {
      const luminance = (color) => {
        const c = color
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number)
          .map((v) => {
            v /= 255
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
          })
        return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722
      }
      const ratio = (a, b) =>
        (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05)
      const style = getComputedStyle(node)
      const background = (element) => {
        while (element && getComputedStyle(element).backgroundColor === 'rgba(0, 0, 0, 0)')
          element = element.parentElement
        return element ? getComputedStyle(element).backgroundColor : 'rgb(19, 22, 25)'
      }
      return {
        text: ratio(style.color, background(node)),
        boundary:
          style.borderTopColor === 'rgba(0, 0, 0, 0)'
            ? ratio(background(node), background(node.parentElement))
            : Math.max(
                ratio(style.borderTopColor, background(node)),
                ratio(style.borderTopColor, background(node.parentElement))
              ),
        outline: ratio(style.outlineColor, background(node.parentElement)),
        outlineStyle: style.outlineStyle,
        focused: node === document.activeElement
      }
    })
    samples.push({ name, ...result })
    expect(result.text, name).toBeGreaterThanOrEqual(4.5)
    if (boundary) expect(result.boundary, name).toBeGreaterThanOrEqual(3)
    if (focus) {
      expect(result.focused, name).toBe(true)
      expect(result.outlineStyle, name).not.toBe('none')
      expect(result.outline, name).toBeGreaterThanOrEqual(3)
    }
  }
  const choose = page.getByRole('button', { name: 'Choose File', exact: true })
  await choose.focus()
  await sample(choose, 'native source chooser focus', true, true)
  await choose.hover()
  await sample(choose, 'native source chooser hover', true)
  await selectTask(page, 'Look', 'Enter')
  await sample(
    page.getByRole('group', { name: 'Editor tasks' }).getByRole('button', { name: 'Look', exact: true }),
    'pressed native task focus',
    true,
    true
  )
  const mode = page.getByRole('combobox', { name: 'Render mode', exact: true })
  await mode.focus()
  await sample(mode, 'native renderer select focus', true, true)
  await page.getByRole('button', { name: /^Edit color 1:/ }).click()
  const hex = page.getByLabel('Hex color', { exact: true })
  await sample(hex, 'portalled native hex focus', true, true)
  await hex.fill('#ab')
  await hex.press('Enter')
  await expect(hex).toHaveAttribute('aria-invalid', 'true')
  await sample(hex, 'invalid portalled native hex focus', true, true)
  const error = page.getByText('Enter a hex color: #RGB or #RRGGBB.', { exact: true })
  await expectWithin(error, await page.getByRole('dialog', { name: 'Edit color 1', exact: true }).boundingBox())
  await page.screenshot({ path: testInfo.outputPath('invalid-error-revealed.png') })
  await hex.press('Escape')
  await selectTask(page, 'Export')
  await updateStore(page, { status: { loading: false, exporting: true, message: 'Encoding APNG 42%', error: '' } })
  const busy = page.getByRole('button', { name: 'Exporting…', exact: true })
  await expect(busy).toBeDisabled()
  await sample(busy, 'actual disabled export action')
  await testInfo.attach('actual-native-portal-state-contrast', {
    body: JSON.stringify(samples, null, 2),
    contentType: 'application/json'
  })
})
