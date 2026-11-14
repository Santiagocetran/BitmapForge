/**
 * Fresh archive execution, independent of editor controls and engine mocks.
 * Run: npx playwright test test/e2e/ascii-generated.spec.js
 * Uses a private Vite HTTP host (the generated README's supported bundler path).
 * Tests only default-pose/model-scale, static show phase, no post-effects.
 */
import { test, expect } from '@playwright/test'
import { createServer } from 'vite'
import JSZip from 'jszip'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

let server
let directory
let origin
let relative

test.beforeAll(async () => {
  const outputs = path.resolve(process.env.BITMAPFORGE_SOURCE_OUTPUT || 'test/fixtures/outputs')
  await fs.mkdir(outputs, { recursive: true })
  directory = await fs.mkdtemp(path.join(outputs, 'ascii-generated-'))
  relative = '/@fs' + directory.split(path.sep).join('/')
  await fs.writeFile(path.join(directory, 'index.html'), '<!doctype html><html><body></body></html>')
  server = await createServer({
    configFile: false,
    cacheDir: path.join(directory, '.vite'),
    root: process.cwd(),
    esbuild: { jsx: 'automatic' },
    resolve: { dedupe: ['react', 'react-dom', 'three'] },
    server: { port: 0, host: '127.0.0.1', strictPort: true, hmr: false, fs: { allow: [process.cwd(), directory] } }
  })
  await server.listen()
  origin = `http://127.0.0.1:${server.httpServer.address().port}`
})

test.afterAll(async () => {
  await server?.close()
  if (directory) await fs.rm(directory, { recursive: true, force: true })
})

for (const format of ['react', 'web']) {
  for (const asciiColored of [true, false]) {
    test(`${format} fresh ZIP applies blocks ramp and asciiColored=${asciiColored}`, async ({ page }) => {
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(`${origin}${relative}/index.html`)
      const bytes = await page.evaluate(
        async ({ format, asciiColored }) => {
          const state = {
            renderMode: 'ascii',
            charRamp: 'blocks',
            asciiColored,
            colors: ['#000000', '#2244aa', '#44aa88', '#ffffff'],
            pixelSize: 3,
            ditherType: 'bayer4x4',
            invert: false,
            minBrightness: 0.05,
            backgroundColor: '#0a0a0a',
            animationDuration: 2500,
            fadeVariant: 'cascade',
            useFadeInOut: false,
            animationEffects: {},
            animationSpeed: 1,
            showPhaseDuration: 3000,
            lightDirection: { x: 3, y: 4, z: 5 },
            baseRotation: { x: 0, y: 0, z: 0 },
            rotateOnShow: false,
            showPreset: 'none'
          }
          const response = await fetch('/test/fixtures/models/tiny.stl')
          if (!response.ok) throw new Error('Missing model fixture')
          state.model = { name: 'tiny.stl', file: new File([await response.blob()], 'tiny.stl') }
          const blob =
            format === 'react'
              ? await (await import('/src/app/utils/reactComponentExport.js')).buildReactComponent(state)
              : await (await import('/src/app/utils/webComponentExport.js')).buildWebComponent(state)
          return Array.from(new Uint8Array(await blob.arrayBuffer()))
        },
        { format, asciiColored }
      )
      const zip = await JSZip.loadAsync(new Uint8Array(bytes))
      const folder = format === 'react' ? 'MyAnimation' : 'bitmap-animation'
      const target = path.join(directory, `${format}-${asciiColored}`)
      await fs.mkdir(target, { recursive: true })
      for (const entry of Object.values(zip.files)) {
        if (entry.dir) continue
        const destination = path.join(target, entry.name)
        await fs.mkdir(path.dirname(destination), { recursive: true })
        await fs.writeFile(destination, await entry.async('nodebuffer'))
      }
      // Exact vendored renderer bytes, not a stub that merely accepts options.
      expect(await fs.readFile(path.join(target, folder, 'engine/renderers/AsciiRenderer.js'), 'utf8')).toBe(
        await fs.readFile('src/engine/renderers/AsciiRenderer.js', 'utf8')
      )
      await fs.writeFile(
        path.join(target, 'index.html'),
        '<!doctype html><html><body><div id="host" style="width:300px;height:300px"></div><script type="module" src="./harness.jsx"></script></body></html>'
      )
      await fs.writeFile(
        path.join(target, 'harness.jsx'),
        `
import { SceneManager } from './${folder}/engine/SceneManager.js'
import { SceneManager as LocalManager } from '/src/engine/SceneManager.js'
import { config } from './${folder}/config.js'
import { CHAR_RAMPS } from './${folder}/engine/renderers/AsciiRenderer.js'
const setRenderMode = SceneManager.prototype.setRenderMode
SceneManager.prototype.setRenderMode = function(mode) {
  setRenderMode.call(this, mode)
  this.pauseLoop()
  window.generatedManager = this
}
window.config = config
window.runComparison = async () => {
  const actual = window.generatedManager
  const referenceHost = document.createElement('div')
  document.body.append(referenceHost)
  const reference = new LocalManager(referenceHost, {
    ...config.effectOptions, charRamp: 'blocks', asciiColored: ${asciiColored}
  })
  reference.pauseLoop()
  reference.setRenderMode('ascii')
  reference.setSize(300, 300)
  reference.updateAnimationOptions({ useFadeInOut: false, animationEffects: {}, animationSpeed: 1,
    showPhaseDuration: 3000, rotateOnShow: false, showPreset: 'none' })
  reference.setLightDirection(3, 4, 5)
  reference.setBaseRotation(0, 0, 0)
  const model = await fetch('./${folder}/assets/tiny.stl').then(r => r.blob())
  await reference.loadModel(new File([model], 'tiny.stl'))
  const capture = (manager) => {
    const renderer = manager.effect._activeRenderer
    const context = renderer.canvas.getContext('2d')
    const draw = context.fillText
    const calls = []
    context.fillText = function(glyph, x, y) {
      calls.push({ glyph, color: this.fillStyle, x, y })
      return draw.call(this, glyph, x, y)
    }
    manager.renderAtTime(3000)
    context.fillText = draw
    return { calls, image: renderer.canvas.toDataURL(), renderer: renderer.constructor.name,
      charRamp: renderer.options.charRamp, asciiColored: renderer.options.asciiColored,
      ramp: renderer._rampChars.join(''), expectedRamp: CHAR_RAMPS.blocks }
  }
  const result = { actual: capture(actual), reference: capture(reference) }
  reference.destroy()
  return result
}
${
  format === 'react'
    ? `
const { createElement } = await import('react')
const { createRoot } = await import('react-dom/client')
const { default: Animation } = await import('./${folder}/index.jsx')
createRoot(document.getElementById('host')).render(createElement(Animation, { style: { width: 300, height: 300 } }))
`
    : `
await import('./${folder}/bitmap-animation.js')
const element = document.createElement('bitmap-animation')
element.style.cssText = 'width:300px;height:300px'
document.getElementById('host').append(element)
`
}
`
      )
      await page.goto(`${origin}${relative}/${format}-${asciiColored}/index.html`)
      await page.waitForFunction(
        () => window.generatedManager?.hasObject() && window.generatedManager.effect.width === 300
      )
      const config = await page.evaluate(() => window.config)
      expect(config.effectOptions).toMatchObject({ charRamp: 'blocks', asciiColored, renderMode: 'ascii' })
      const { actual, reference } = await page.evaluate(() => window.runComparison())
      expect(actual.renderer).toBe('AsciiRenderer')
      expect(actual.charRamp).toBe('blocks')
      expect(actual.asciiColored).toBe(asciiColored)
      expect(actual.ramp).toBe(actual.expectedRamp)
      expect(actual.calls.length).toBeGreaterThan(0)
      expect(actual.calls.every(({ glyph }) => '░▒▓█'.includes(glyph))).toBe(true)
      const colors = new Set(actual.calls.map(({ color }) => color))
      if (asciiColored) expect(colors.size).toBeGreaterThan(1)
      else expect([...colors]).toEqual(['#ffffff'])
      expect(actual.calls).toEqual(reference.calls)
      expect(actual.image).toBe(reference.image)
      expect(errors).toEqual([])
    })
  }
}
