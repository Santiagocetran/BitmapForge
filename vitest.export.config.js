import { defineConfig } from 'vite'

/**
 * Separate vitest config for the on-demand export verification suite.
 * Run with: npm run test:export
 * NOT included in the default `npm test` run.
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/export/**/*.test.js'],
    setupFiles: ['test/export/setup.js'],
    testTimeout: 30_000
  }
})
