import { expect } from '@playwright/test'

export async function selectTask(page, name, key) {
  const button = page.getByRole('group', { name: 'Editor tasks' }).getByRole('button', { name, exact: true })
  if (key) {
    await button.focus()
    await button.press(key)
  } else await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.bf-task-panel:visible')).toHaveCount(1)
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  return button
}

export async function revealExport(page) {
  // Global access is deliberately separate from native task navigation.
  await page.locator('.bf-header, .bf-mobile-toolbar').getByRole('button', { name: 'Export', exact: true }).click()
  const heading = page.getByRole('heading', { name: 'Export', exact: true })
  await expect(heading).toBeFocused()
  return heading
}

export async function clickBackdrop(page) {
  const sheet = await page.getByRole('dialog', { name: 'Settings', exact: true }).boundingBox()
  expect(sheet.y, 'portrait sheet leaves a real backdrop above it').toBeGreaterThan(1)
  await page.mouse.click(8, sheet.y / 2)
}

export async function drainFrames(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}

export async function expectWithin(locator, rectangle, minimumTarget = false) {
  await locator.scrollIntoViewIfNeeded()
  await expect
    .poll(async () => {
      const box = await locator.boundingBox()
      return (
        !!box &&
        box.x >= rectangle.x - 1 &&
        box.y >= rectangle.y - 1 &&
        box.x + box.width <= rectangle.x + rectangle.width + 1 &&
        box.y + box.height <= rectangle.y + rectangle.height + 1
      )
    })
    .toBe(true)
  if (minimumTarget) {
    const box = await locator.boundingBox()
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
  }
}
