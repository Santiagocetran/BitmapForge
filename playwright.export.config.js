import { defineConfig } from '@playwright/test'
import path from 'node:path'
import os from 'node:os'
import process from 'node:process'
import fs from 'node:fs'
import { randomInt } from 'node:crypto'

// Isolate Vite's dependency cache and generated HTML from other browser suites.
// Run with Node 24: node node_modules/@playwright/test/cli.js test --config=playwright.export.config.js
const artifacts = path.resolve(
  process.env.BITMAPFORGE_EXPORT_OUTPUT || fs.mkdtempSync(path.join(os.tmpdir(), 'bitmapforge-export-visual-'))
)
// A collision fails via strictPort; never attach to another worker's server.
const port = Number(process.env.BITMAPFORGE_EXPORT_PORT || randomInt(20000, 60000))
const url = `http://127.0.0.1:${port}`
process.env.BITMAPFORGE_UI_URL = url
process.env.BITMAPFORGE_EXPORT_OUTPUT = artifacts

export default defineConfig({
  testDir: './test/e2e',
  testMatch: 'export.visual.spec.js',
  timeout: 180_000,
  retries: 0,
  workers: 1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    launchOptions: { args: ['--use-gl=swiftshader', '--disable-gpu-sandbox', '--no-sandbox'] }
  },
  webServer: {
    command: `node --input-type=module -e 'import {createServer} from "vite"; const server = await createServer({cacheDir:${JSON.stringify(path.join(artifacts, 'vite-cache'))},server:{host:"127.0.0.1",port:${port},strictPort:true,hmr:false}}); await server.listen()'`,
    url,
    reuseExistingServer: false,
    timeout: 30_000
  },
  outputDir: path.join(artifacts, 'playwright'),
  reporter: [['list'], ['html', { open: 'never', outputFolder: path.join(artifacts, 'report') }]]
})
