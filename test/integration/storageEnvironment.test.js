import { afterEach, expect, it } from 'vitest'

const key = 'bitmapforge-storage-environment-regression'
afterEach(() => window.localStorage.removeItem(key))

it('uses real jsdom localStorage instead of the Node native storage getter', () => {
  expect(globalThis.localStorage).toBe(window.localStorage)
  expect(globalThis.localStorage).toBeInstanceOf(window.Storage)
  globalThis.localStorage.setItem(key, 'browser storage')
  expect(window.localStorage.getItem(key)).toBe('browser storage')
  window.localStorage.removeItem(key)
  expect(globalThis.localStorage.getItem(key)).toBeNull()
})
