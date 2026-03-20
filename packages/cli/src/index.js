#!/usr/bin/env node
import { readFile, writeFile, mkdir, readdir } from 'fs/promises'
import { resolve, basename, extname, dirname, join } from 'path'
import minimist from 'minimist'
import puppeteer from 'puppeteer'
import { start as startServer } from './server.js'

const VALID_FORMATS = ['apng', 'webm']
const MIME_TO_EXT = { 'image/png': 'apng', 'video/webm': 'webm' }

function err(msg) { process.stderr.write(msg + '\n') }
function out(msg) { process.stdout.write(msg + '\n') }

async function render(projectPath, opts) {
  const { format = 'apng', fps = 12, out: outPath, width, height } = opts

  if (!VALID_FORMATS.includes(format)) {
    err(`Unsupported format: "${format}". Valid formats: ${VALID_FORMATS.join(', ')}`)
    process.exit(1)
  }

  // Read project file
  let projectJson
  try {
    projectJson = await readFile(projectPath, 'utf8')
  } catch {
    err(`Error: cannot read file "${projectPath}"`)
    process.exit(1)
  }

  // Determine output path
  const base = basename(projectPath, extname(projectPath))
  const outputPath = outPath || `${base}.${format}`
  await mkdir(dirname(resolve(outputPath)), { recursive: true })

  // Start server
  const server = await startServer()

  // Launch Puppeteer
  const launchArgs = ['--disable-dev-shm-usage']
  if (process.env.CI) {
    launchArgs.push('--no-sandbox', '--disable-setuid-sandbox')
  }

  let browser
  try {
    browser = await puppeteer.launch({ args: launchArgs })
  } catch (e) {
    await server.close()
    err(`Failed to launch browser: ${e.message}`)
    err('If Chromium is missing, run: npx puppeteer browsers install chrome')
    process.exit(1)
  }

  try {
    const page = await browser.newPage()

    // Forward console messages from harness for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') err(`[browser] ${msg.text()}`)
    })

    // Expose progress function so harness can report frame progress
    let frameCount = 0
    await page.exposeFunction('__reportProgress', (current, total) => {
      if (frameCount === 0) frameCount = total
      err(`Rendering frame ${current}/${total}`)
    })

    await page.goto(`${server.url}/harness.html`, { waitUntil: 'networkidle0' })

    const result = await page.evaluate(async (opts) => {
      return window.__bitmapForgeRender(opts)
    }, { projectJson, format, fps, width: width || null, height: height || null })

    if (!result.ok) {
      err(`Render failed: ${result.error}`)
      process.exit(1)
    }

    // Decode base64 and write file
    const buffer = Buffer.from(result.base64, 'base64')
    await writeFile(outputPath, buffer)
    out(resolve(outputPath))

  } finally {
    await browser.close()
    await server.close()
  }
}

async function batch(dirPath, opts) {
  const { format = 'apng', fps = 12, out: outDir, width, height } = opts
  const outputDir = outDir || join(dirPath, 'out')
  await mkdir(outputDir, { recursive: true })

  let files
  try {
    const entries = await readdir(dirPath)
    files = entries.filter(f => f.endsWith('.bforge')).map(f => join(dirPath, f))
  } catch {
    err(`Error: cannot read directory "${dirPath}"`)
    process.exit(1)
  }

  if (files.length === 0) {
    err(`No .bforge files found in "${dirPath}"`)
    process.exit(1)
  }

  for (const file of files) {
    const base = basename(file, '.bforge')
    const outPath = join(outputDir, `${base}.${format}`)
    err(`\nProcessing: ${file}`)
    await render(file, { format, fps, out: outPath, width, height })
  }
}

// Main
const argv = minimist(process.argv.slice(2), {
  string: ['format', 'out'],
  number: ['fps', 'width', 'height'],
  default: { format: 'apng', fps: 12 }
})

const [command, target] = argv._

if (command === 'render') {
  if (!target) { err('Usage: bitmapforge render <file.bforge> [options]'); process.exit(1) }
  render(resolve(target), argv)
} else if (command === 'batch') {
  if (!target) { err('Usage: bitmapforge batch <dir> [options]'); process.exit(1) }
  batch(resolve(target), argv)
} else {
  err('Usage: bitmapforge <render|batch> [options]')
  err('  render <file.bforge> --format apng|webm --fps 12 --out output.apng')
  err('  batch <dir> --format apng|webm --out outdir/')
  process.exit(1)
}
