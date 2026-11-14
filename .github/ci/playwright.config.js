import { defineConfig } from '@playwright/test'
import base from '../../playwright.config.js'

// Existing export suite only: new UI/lifecycle specs gain gates after integration.
// Serve the downloaded, hash-verified build; never attach to a developer's server.
export default defineConfig({
  ...base,
  testDir: '../../test/e2e',
  testMatch: 'export.visual.spec.js',
  forbidOnly: true,
  use: {
    ...base.use,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run preview -- --host localhost --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 30_000
  },
  outputDir: '../../test/fixtures/outputs/playwright/',
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../../test/fixtures/outputs/playwright-report' }]]
})
