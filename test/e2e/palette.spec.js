import { test, expect } from '@playwright/test'
import process from 'node:process'
import { selectTask } from './utils/editor.js'

const baseURL = process.env.PALETTE_BASE_URL ?? 'http://localhost:5173'

async function setup(page) {
  await page.route('**/palette-fixture', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0"><div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh"; RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import("/src/app/components/ColorPalette/paletteHarness.jsx")</script></body></html>'
    })
  )
  await page.goto(`${baseURL}/palette-fixture`)
  await expect(page.getByRole('button', { name: /^Edit color 1:/ })).toBeVisible({ timeout: 20000 })
}
const edit = (page, n = 1) => page.getByRole('button', { name: new RegExp(`^Edit color ${n}:`) })
const colors = (page) => page.evaluate(() => window.paletteStore.getState().colors)

test.beforeEach(async ({ page }) => setup(page))

test('native click/Enter/Space, validation, immediate picker updates and cancellation focus', async ({ page }) => {
  for (const key of ['Enter', 'Space']) {
    await edit(page).focus()
    await page.keyboard.press(key)
    await expect(page.getByLabel('Hex color')).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(edit(page)).toBeFocused()
  }
  await edit(page).click()
  const input = page.getByLabel('Hex color')
  await input.fill('#ab')
  await input.press('Enter')
  await expect(input).toHaveAttribute('aria-invalid', 'true')
  expect((await colors(page))[0]).toBe('#111111')
  await input.fill('#AbC')
  await input.press('Enter')
  expect((await colors(page))[0]).toBe('#aabbcc')
  await input.fill('#def')
  await page.getByRole('button', { name: 'Close color picker' }).click()
  expect((await colors(page))[0]).toBe('#aabbcc')
  await expect(edit(page)).toBeFocused()
  await edit(page).click()
  await page.getByLabel('Hex color').fill('#def')
  await page.getByRole('button', { name: 'Outside destination' }).click()
  expect((await colors(page))[0]).toBe('#aabbcc')
  await expect(page.getByRole('button', { name: 'Outside destination' })).toBeFocused()
})

test('real picker changes synchronize draft; undo and redo invalidate active transactions', async ({ page }) => {
  await page.evaluate(() => window.paletteStore.temporal.getState().clear())
  await edit(page).click()
  await page.locator('.react-colorful__saturation').click({ position: { x: 80, y: 70 } })
  const first = (await colors(page))[0]
  expect(first).not.toBe('#111111')
  await expect(page.getByLabel('Hex color')).toHaveValue(first)
  await page.getByLabel('Hex color').fill('#abc')
  await page.evaluate(() => window.paletteStore.temporal.getState().undo())
  await expect(page.getByLabel('Hex color')).toHaveCount(0)
  expect((await colors(page))[0]).toBe('#111111')
  await edit(page).click()
  await page.getByLabel('Hex color').fill('#ab')
  await page.evaluate(() => window.paletteStore.temporal.getState().redo())
  await expect(page.getByLabel('Hex color')).toHaveCount(0)
  expect((await colors(page))[0]).toBe(first)
})

test('same-picker blur commits but keyboard Close, Tab departure and another swatch cancel', async ({ page }) => {
  await edit(page).click()
  const input = page.getByLabel('Hex color')
  await input.fill('#abc')
  await input.press('Tab')
  expect((await colors(page))[0]).toBe('#aabbcc')
  await input.focus()
  await input.fill('#def')
  await input.press('Shift+Tab')
  // Previous focusable control is a picker slider: ordinary internal blur commits.
  expect((await colors(page))[0]).toBe('#ddeeff')
  await input.focus()
  await input.fill('#123')
  await page.getByRole('button', { name: 'Close color picker' }).focus()
  await page.keyboard.press('Enter')
  expect((await colors(page))[0]).toBe('#ddeeff')
  await edit(page).click()
  await input.fill('#456')
  await edit(page, 2).click()
  await expect(input).toHaveValue('#222222')
  expect((await colors(page))[0]).toBe('#ddeeff')
})

test('click move and native keyboard drag drop/cancel keep editing separate and focus moved item', async ({ page }) => {
  await edit(page, 3).click()
  await page.getByRole('button', { name: 'Move color 3 earlier' }).click()
  expect(await colors(page)).toEqual(['#111111', '#111111', '#222222'])
  await expect(edit(page, 2)).toBeFocused()
  const handle = page.getByRole('button', { name: 'Reorder color 2' })
  await handle.click({ trial: true })
  await handle.focus()
  await page.keyboard.press('Space')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('status')).toContainText('color-2')
  await page.keyboard.press('Space')
  expect(await colors(page)).toEqual(['#111111', '#222222', '#111111'])
  await expect(edit(page, 3)).toBeFocused()
  await page.getByRole('button', { name: 'Reorder color 3' }).focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('Escape')
  expect(await colors(page)).toEqual(['#111111', '#222222', '#111111'])
  await expect(page.getByRole('button', { name: 'Reorder color 3' })).toBeFocused()
  await expect(page.getByLabel('Hex color')).toHaveCount(0)
})

test('external mutations cancel draft and drag; owner hiding suppresses child restoration', async ({ page }) => {
  await edit(page, 3).click()
  await page.getByLabel('Hex color').fill('#abc')
  await page.evaluate(() => window.paletteStore.getState().setColors(['#444444']))
  await expect(page.getByLabel('Hex color')).toHaveCount(0)
  await expect(edit(page)).toBeFocused()
  expect(await colors(page)).toEqual(['#444444'])
  const handle = page.getByRole('button', { name: 'Reorder color 1' })
  await handle.focus()
  await handle.press('Space')
  await page.evaluate(() => window.paletteStore.getState().setColors(['#555555', '#666666']))
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Space')
  expect(await colors(page)).toEqual(['#555555', '#666666'])
  await edit(page).click()
  await page.getByLabel('Hex color').fill('#abc')
  await page.getByRole('button', { name: 'Toggle palette' }).click()
  await expect(page.getByLabel('Hex color')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Toggle palette' })).toBeFocused()
})

test('320px bounded scroll, 44px targets and dialog-local portal with nested Escape', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.evaluate(() =>
    window.paletteStore.getState().setColors(['#111111', '#222222', '#333333', '#444444', '#555555', '#666666'])
  )
  for (const locator of [edit(page, 6), page.getByRole('button', { name: 'Reorder color 6' })]) {
    const box = await locator.boundingBox()
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
  }
  await edit(page, 6).click()
  const popup = page.getByRole('dialog', { name: 'Edit color 6' })
  await expect(popup).toBeVisible()
  const rect = await popup.boundingBox()
  expect(rect.x).toBeGreaterThanOrEqual(0)
  expect(rect.x + rect.width).toBeLessThanOrEqual(320)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Open modal' }).click()
  await edit(page).click()
  await expect(page.getByRole('dialog', { name: 'Fixture settings' }).getByLabel('Hex color')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Fixture settings' })).toBeVisible()
  await expect(edit(page)).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Fixture settings' })).toHaveCount(0)
})

test('integrated drawer keeps a middle-of-screen picker within the short viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto(`${baseURL}/`)
  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: 'Settings', exact: true })
  await selectTask(page, 'Look')
  await edit(page).evaluate((node) => node.scrollIntoView({ block: 'center' }))
  await edit(page).click()
  await expect(drawer.getByLabel('Hex color')).toBeFocused()
  const picker = page.getByRole('dialog', { name: 'Edit color 1', exact: true })
  await expect
    .poll(async () => {
      const box = await picker.boundingBox()
      return box.y >= 0 && box.y + box.height <= 568
    })
    .toBe(true)
  await expect
    .poll(async () => {
      const field = await drawer.getByLabel('Hex color').boundingBox()
      const box = await picker.boundingBox()
      return field.y >= box.y && field.y + field.height <= box.y + box.height
    })
    .toBe(true)
  await expect
    .poll(async () => {
      const close = await page.getByRole('button', { name: 'Close color picker' }).boundingBox()
      const box = await picker.boundingBox()
      return close.y >= box.y && close.y + close.height <= box.y + box.height
    })
    .toBe(true)
  await page.keyboard.press('Escape')
  await expect(drawer).toBeVisible()
  await expect(edit(page)).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
})

test('valid and invalid draft cancellation matrix never writes on dismissal', async ({ page }) => {
  for (const value of ['#abc', '#ab']) {
    for (const destination of [
      'escape',
      'close',
      'keyboard-close',
      'tab',
      'outside',
      'switch',
      'parent',
      'external',
      'add',
      'remove'
    ]) {
      await page.evaluate(() => window.paletteStore.getState().setColors(['#111111', '#222222', '#111111']))
      await edit(page).click()
      await page.getByLabel('Hex color').fill(value)
      if (destination === 'escape') await page.keyboard.press('Escape')
      if (destination === 'close') await page.getByRole('button', { name: 'Close color picker' }).click()
      if (destination === 'keyboard-close' || destination === 'tab') {
        await page.getByRole('button', { name: 'Close color picker' }).focus()
        await page.keyboard.press(destination === 'tab' ? 'Shift+Tab' : 'Enter')
      }
      if (destination === 'add' || destination === 'remove')
        await page.getByRole('button', { name: destination === 'add' ? 'Add' : 'Remove', exact: true }).click()
      if (destination === 'outside') await page.getByRole('button', { name: 'Outside destination' }).click()
      if (destination === 'switch') {
        await edit(page, 2).click()
        await expect(page.getByLabel('Hex color')).toHaveValue('#222222')
        await page.keyboard.press('Escape')
      }
      if (destination === 'parent') {
        await page.getByRole('button', { name: 'Toggle palette' }).click()
        await page.getByRole('button', { name: 'Toggle palette' }).click()
      }
      if (destination === 'external')
        await page.evaluate(() => window.paletteStore.getState().setColors(['#111111', '#333333']))
      expect((await colors(page))[0], `${value} -> ${destination}`).toBe('#111111')
      await expect(page.getByLabel('Hex color')).toHaveCount(0)
    }
  }
})

test('mouse dragging uses the handle and updates order without opening editor', async ({ page }) => {
  const source = await page.getByRole('button', { name: 'Reorder color 1' }).boundingBox()
  const destination = await page.getByRole('button', { name: 'Reorder color 2' }).boundingBox()
  await page.mouse.move(source.x + 22, source.y + 22)
  await page.mouse.down()
  await page.mouse.move(source.x + 32, source.y + 22, { steps: 3 })
  await page.mouse.move(destination.x + 22, destination.y + 22, { steps: 10 })
  await page.mouse.up()
  expect(await colors(page)).toEqual(['#222222', '#111111', '#111111'])
  await expect(edit(page, 2)).toBeFocused()
  await expect(page.getByLabel('Hex color')).toHaveCount(0)
})

test.describe('mobile touch emulation', () => {
  test.use({ viewport: { width: 320, height: 568 }, hasTouch: true, isMobile: true })

  test('tap edits, handle drag reorders, and scrolling elsewhere does not drag', async ({ page, context }) => {
    await edit(page).tap()
    await expect(page.getByLabel('Hex color')).toBeFocused()
    await page.getByRole('button', { name: 'Close color picker' }).tap()
    const source = await page.getByRole('button', { name: 'Reorder color 1' }).boundingBox()
    const destination = await page.getByRole('button', { name: 'Reorder color 2' }).boundingBox()
    const session = await context.newCDPSession(page)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: source.x + 22, y: source.y + 22 }]
    })
    for (let step = 1; step <= 12; step++)
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: source.x + 22 + ((destination.x - source.x) * step) / 12, y: source.y + 22 }]
      })
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    expect(await colors(page)).toEqual(['#222222', '#111111', '#111111'])
    expect(
      await page.getByRole('button', { name: 'Reorder color 1' }).evaluate((node) => getComputedStyle(node).touchAction)
    ).toBe('none')
    expect(await edit(page).evaluate((node) => getComputedStyle(node).touchAction)).not.toBe('none')
    await page.evaluate(() => window.scrollTo(0, 0))
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 280, y: 400 }] })
    for (let y = 380; y >= 180; y -= 20)
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 280, y }] })
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    expect(await colors(page)).toEqual(['#222222', '#111111', '#111111'])
    await expect(page.getByLabel('Hex color')).toHaveCount(0)
  })
})

test('presets save/delete with native keyboard and preserve initiator on replacement', async ({ page }) => {
  await page.getByRole('button', { name: 'Save palette' }).focus()
  await page.keyboard.press('Enter')
  await page.getByLabel('Palette name').fill('Keyboard palette')
  await page.getByLabel('Palette name').press('Enter')
  await page.getByRole('button', { name: 'Browse palettes', exact: true }).click()
  const preset = page.getByRole('button', { name: 'Keyboard palette', exact: true })
  await preset.focus()
  await preset.press('Space')
  await expect(preset).toBeFocused()
  const remove = page.getByRole('button', { name: 'Delete palette Keyboard palette' })
  const box = await remove.boundingBox()
  expect(box.height).toBeGreaterThanOrEqual(44)
  expect(box.width).toBeGreaterThanOrEqual(44)
  await remove.focus()
  await remove.press('Enter')
  await expect(remove).toHaveCount(0)
})
