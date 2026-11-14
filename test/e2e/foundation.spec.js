import process from 'node:process'
import { test, expect } from '@playwright/test'

const origin = process.env.BITMAPFORGE_UI_URL || 'http://127.0.0.1:5197'
const evidence =
  process.env.BITMAPFORGE_P1_EVIDENCE || '/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p1-evidence'
const tasks = (page) => page.getByRole('group', { name: 'Editor tasks' })
async function select(page, name) {
  await tasks(page).getByRole('button', { name, exact: true }).click()
  await expect(tasks(page).getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true')
}
async function mark(page) {
  await page.locator('.bf-preview canvas').evaluate((canvas) => {
    window.__p1Canvas = canvas
  })
}
async function identity(page) {
  expect(await page.locator('.bf-preview canvas').evaluate((canvas) => canvas === window.__p1Canvas)).toBe(true)
}
async function overflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(
    true
  )
}

test('P1 desktop native tasks, reset, mounted panels, preview and Help', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(origin)
  await expect(page.getByRole('heading', { name: 'Start with a source' })).toBeVisible()
  await mark(page)
  await page.screenshot({ path: `${evidence}/desktop-empty.png` })
  for (const task of ['Look', 'Motion', 'Export', 'Source']) {
    await select(page, task)
    expect(await page.locator('.bf-task-panel').count()).toBe(4)
    expect(await page.locator('.bf-task-panel:visible').count()).toBe(1)
    await identity(page)
  }
  await select(page, 'Look')
  await page.locator('.bf-task-body').evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await tasks(page).getByRole('button', { name: 'Look', exact: true }).focus()
  await page.keyboard.press('Enter')
  expect(await page.locator('.bf-task-body').evaluate((el) => el.scrollTop)).toBe(0)
  await expect(tasks(page).getByRole('button', { name: 'Look', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(tasks(page).getByRole('button', { name: 'Motion', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Collapse settings', exact: true }).click()
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Export', exact: true })).toBeFocused()
  await page.getByRole('banner').getByRole('button', { name: 'Help', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeVisible()
  await page.keyboard.press('Escape')
  await identity(page)
  await overflow(page)
  await page.getByRole('button', { name: 'Shapes', exact: true }).click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${evidence}/desktop-shape.png` })
  await identity(page)
})

test('P1 mobile bounded sheet, openers, tasks, source bridge and stable preview', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(origin)
  await mark(page)
  await page.screenshot({ path: `${evidence}/mobile-empty.png` })
  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Settings', exact: true })
  const box = await dialog.boundingBox()
  expect(box.y).toBeCloseTo(337.6, 0)
  expect(box.height).toBeCloseTo(506.4, 0)
  await expect(page.getByRole('button', { name: 'Close settings' })).toBeFocused()
  for (const task of ['Look', 'Motion', 'Export', 'Source']) await select(page, task)
  await page.screenshot({ path: `${evidence}/mobile-settings.png` })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open settings', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Image', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Choose Image', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: 'Choose an image' })).toBeVisible()
  await identity(page)
  await overflow(page)
})

test('P1 computed shared control states meet text and required boundary contrast', async ({ page }) => {
  await page.goto(origin)
  const states = await page.evaluate(() => {
    const host = document.createElement('div')
    host.className = 'bf-scope'
    host.style.background = 'var(--bf-panel)'
    document.body.append(host)
    const luminance = (color) => {
      const channels = color
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number)
        .map((v) => {
          v /= 255
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
        })
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
    }
    const ratio = (a, b) => {
      const x = luminance(a),
        y = luminance(b)
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
    }
    const output = []
    for (const [tag, name, className, attribute] of [
      ['button', 'primary', 'bf-button bf-button--primary'],
      ['button', 'secondary', 'bf-button bf-button--secondary'],
      ['button', 'selected', 'bf-choice', 'aria-pressed'],
      ['input', 'field', 'bf-field'],
      ['input', 'invalid', 'bf-field', 'aria-invalid'],
      ['button', 'disabled', 'bf-button bf-button--secondary', 'disabled']
    ]) {
      const node = document.createElement(tag)
      node.className = className
      if (attribute) node.setAttribute(attribute, 'true')
      host.append(node)
      const s = getComputedStyle(node)
      const state = { name, text: ratio(s.color, s.backgroundColor) }
      if (['secondary', 'selected', 'field', 'invalid'].includes(name))
        state.boundary = ratio(s.borderTopColor, s.backgroundColor)
      output.push(state)
    }
    host.remove()
    return output
  })
  for (const state of states) {
    expect(state.text, state.name).toBeGreaterThanOrEqual(4.5)
    if (state.boundary) expect(state.boundary, state.name).toBeGreaterThanOrEqual(3)
  }
  console.log('P1 rendered-state contrast', JSON.stringify(states))
})

test('P1 real palette task pointer barrier cancels valid uncommitted hex before blur', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(origin)
  await select(page, 'Look')
  const before = await page.evaluate(
    async () => (await import('/src/app/store/useProjectStore.js')).useProjectStore.getState().colors
  )
  await page.getByRole('button', { name: /^Edit color 1:/ }).click()
  const hex = page.getByRole('textbox', { name: /hex/i })
  await hex.fill('#123456')
  await select(page, 'Motion')
  const after = await page.evaluate(
    async () => (await import('/src/app/store/useProjectStore.js')).useProjectStore.getState().colors
  )
  expect(after).toEqual(before)
  await expect(page.getByRole('button', { name: 'Close color picker' })).toHaveCount(0)
})

for (const [width, height] of [
  [667, 320],
  [320, 568]
]) {
  test(`P1 short empty and Help ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto(origin)
    await mark(page)
    const demo = page.getByRole('button', { name: 'Try demo model', exact: true })
    await demo.focus()
    const box = await demo.boundingBox()
    const stage = await page.locator('.bf-empty-scroll').boundingBox()
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.y).toBeGreaterThanOrEqual(stage.y)
    expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + 1)
    await page.screenshot({ path: `${evidence}/empty-${width}x${height}.png` })
    await page.getByRole('banner').getByRole('button', { name: 'Help', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeVisible()
    const help = await page.locator('.bf-help-dialog').boundingBox()
    expect(help.y).toBeGreaterThanOrEqual(0)
    expect(help.y + help.height).toBeLessThanOrEqual(height)
    await page.getByText('Show this help', { exact: true }).scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${evidence}/help-${width}x${height}.png` })
    await page.keyboard.press('Escape')
    await page.keyboard.press('?')
    await expect(page.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeVisible()
    await page.keyboard.press('Escape')
    await identity(page)
    await overflow(page)
  })
}

for (const height of [320, 280, 220]) {
  test(`P1 visible rectangle H${height} T40`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript(
      ({ height }) => {
        Object.defineProperty(window.visualViewport, 'height', { configurable: true, get: () => height })
        Object.defineProperty(window.visualViewport, 'offsetTop', { configurable: true, get: () => 40 })
      },
      { height }
    )
    await page.goto(origin)
    await page.getByRole('button', { name: 'Open settings', exact: true }).click()
    const dialog = await page.locator('.bf-settings').boundingBox()
    expect(dialog.y).toBeCloseTo(40, 0)
    expect(dialog.height).toBeCloseTo(height, 0)
    await page
      .getByRole('dialog', { name: 'Settings', exact: true })
      .getByRole('button', { name: 'Help', exact: true })
      .click()
    const help = await page.locator('.bf-help-dialog').boundingBox()
    expect(help.y).toBeCloseTo(48, 0)
    expect(help.y + help.height).toBeLessThanOrEqual(40 + height)
    await page.getByText('Show this help', { exact: true }).scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${evidence}/offset-help-${height}.png` })
    await overflow(page)
  })
}
