#!/usr/bin/env node
/* global process, Buffer */
import { readFile, writeFile, mkdir, readdir } from 'fs/promises'
import { resolve, basename, extname, dirname, join } from 'path'
import minimist from 'minimist'
import puppeteer from 'puppeteer'
import { start as startServer } from './server.js'

const VALID_FORMATS = ['apng', 'webm']

function err(msg) {
  process.stderr.write(msg + '\n')
}
function out(msg) {
  process.stdout.write(msg + '\n')
}

async function render(projectPath, opts) {
  const { format = 'apng', fps = 12, out: outPath, width, height } = opts
  if (!VALID_FORMATS.includes(format)) {
    throw new Error(`Unsupported format: "${format}". Valid formats: ${VALID_FORMATS.join(', ')}`)
  }
  let projectJson
  try {
    projectJson = await readFile(projectPath, 'utf8')
  } catch {
    throw new Error(`Error: cannot read file "${projectPath}"`)
  }
  const base = basename(projectPath, extname(projectPath))
  const outputPath = outPath || `${base}.${format}`
  await mkdir(dirname(resolve(outputPath)), { recursive: true })

  let server, browser, failure
  try {
    server = await startServer()
    const launchArgs = ['--disable-dev-shm-usage']
    if (process.env.CI) launchArgs.push('--no-sandbox', '--disable-setuid-sandbox')
    try {
      browser = await puppeteer.launch({ args: launchArgs })
    } catch (error) {
      throw new Error(
        `Failed to launch browser: ${error.message}\nIf Chromium is missing, run: npx puppeteer browsers install chrome`
      )
    }
    const page = await browser.newPage()
    page.on('console', (msg) => {
      if (msg.type() === 'error') err(`[browser] ${msg.text()}`)
    })
    // Kept for compatibility. The current harness does not call this callback.
    await page.exposeFunction('__reportProgress', (current, total) => {
      err(`Rendering frame ${current}/${total}`)
    })
    await page.goto(`${server.url}/harness.html`, { waitUntil: 'networkidle0' })
    const result = await page.evaluate(async (opts) => window.__bitmapForgeRender(opts), {
      projectJson,
      format,
      fps,
      width: width || null,
      height: height || null
    })
    if (!result.ok) throw new Error(`Render failed: ${result.error}`)
    await writeFile(outputPath, Buffer.from(result.base64, 'base64'))
    out(resolve(outputPath))
  } catch (error) {
    failure = error
  } finally {
    // Each acquired owner gets an independent attempt, even after a close failure.
    for (const [name, resource] of [
      ['browser', browser],
      ['server', server]
    ]) {
      if (!resource) continue
      try {
        await resource.close()
      } catch (error) {
        const message = `Failed to close ${name}: ${error.message}`
        if (failure) err(message)
        else failure = new Error(message)
      }
    }
  }
  if (failure) throw failure
}

async function batch(dirPath, opts) {
  const { format = 'apng', fps = 12, out: outDir, width, height } = opts
  const outputDir = outDir || join(dirPath, 'out')
  await mkdir(outputDir, { recursive: true })
  let files
  try {
    const entries = await readdir(dirPath)
    files = entries.filter((f) => f.endsWith('.bforge') || f.endsWith('.bitmapforge')).map((f) => join(dirPath, f))
  } catch {
    throw new Error(`Error: cannot read directory "${dirPath}"`)
  }
  if (files.length === 0) throw new Error(`No .bforge/.bitmapforge files found in "${dirPath}"`)
  for (const file of files) {
    const base = basename(file).replace(/\.(bitmapforge|bforge)$/, '')
    err(`\nProcessing: ${file}`)
    await render(file, { format, fps, out: join(outputDir, `${base}.${format}`), width, height })
  }
}

async function main() {
  const argv = minimist(process.argv.slice(2), {
    string: ['format', 'out'],
    number: ['fps', 'width', 'height'],
    default: { format: 'apng', fps: 12 }
  })
  const [command, target] = argv._
  if (command === 'render') {
    if (!target) throw new Error('Usage: bitmapforge render <file.bforge> [options]')
    await render(resolve(target), argv)
  } else if (command === 'batch') {
    if (!target) throw new Error('Usage: bitmapforge batch <dir> [options]')
    await batch(resolve(target), argv)
  } else {
    throw new Error(
      'Usage: bitmapforge <render|batch> [options]\n' +
        '  render <file.bforge> --format apng|webm --fps 12 --out output.apng\n' +
        '  batch <dir> --format apng|webm --out outdir/'
    )
  }
}

try {
  await main()
} catch (error) {
  err(error.message || String(error))
  process.exitCode = 1
}
