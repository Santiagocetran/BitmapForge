import { defineConfig } from '@playwright/test'

/**
 * Playwright config for on-demand export visual verification.
 * Run with: npm run test:e2e
 *
 * NOT part of npm test — run manually when touching export builders,
 * framesProvider, exportConfig, engineSources, or any renderer.
 */
export default defineConfig({
  testDir: 'test/e2e',
  timeout: 90_000,
  retries: 0,
  workers: 1, // serial — GPU/GL tests must not run concurrently
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    launchOptions: {
      args: [
        '--use-gl=swiftshader', // software GL — stable in headless
        '--disable-gpu-sandbox',
        '--no-sandbox'
      ]
    }
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000
  },
  outputDir: 'test/fixtures/outputs/playwright/',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'test/fixtures/outputs/playwright-report' }]]
})
