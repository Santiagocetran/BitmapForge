import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { buildReactComponent } from './reactComponentExport.js'
import { buildWebComponent } from './webComponentExport.js'
import { buildCodeZip } from './codeExport.js'
import { ENGINE_SOURCES } from './engineSources.js'

// ZIP serialization is distinct from the real generated-runtime browser gate in
// test/e2e/ascii-generated.spec.js. No mocked SceneManager application claims here.
const state = {
  renderMode: 'ascii',
  colors: ['#000000', '#55aa55', '#ffffff'],
  pixelSize: 3,
  model: null,
  useFadeInOut: false,
  animationEffects: {},
  animationSpeed: 1,
  showPhaseDuration: 3000,
  animationDuration: 2500,
  fadeVariant: 'cascade',
  invert: false,
  minBrightness: 0.05,
  backgroundColor: '#0a0a0a',
  lightDirection: { x: 3, y: 4, z: 5 },
  baseRotation: { x: 0, y: 0, z: 0 },
  rotateOnShow: false,
  showPreset: 'none'
}

describe.each([
  ['React', buildReactComponent, 'MyAnimation/'],
  ['Code ZIP (serialization only)', buildCodeZip, 'BitmapForge-export/'],
  ['Web Component', buildWebComponent, 'bitmap-animation/']
])('%s ASCII archive serialization', (_label, build, prefix) => {
  it.each(['classic', 'blocks', 'dense', 'minimal', 'unknown-ramp', ''])(
    'round-trips ramp %j and explicit boolean values through config.js JSON',
    async (charRamp) => {
      for (const asciiColored of [true, false]) {
        const zip = await JSZip.loadAsync(await build({ ...state, charRamp, asciiColored }))
        const source = await zip.file(`${prefix}config.js`).async('string')
        const config = JSON.parse(source.replace(/^export const config = /, ''))
        expect(config.effectOptions).toMatchObject({ renderMode: 'ascii', charRamp, asciiColored })
      }
    }
  )

  it('retains legacy defaults and vendors exact current engine source bytes', async () => {
    const zip = await JSZip.loadAsync(await build(state))
    const source = await zip.file(`${prefix}config.js`).async('string')
    expect(JSON.parse(source.replace(/^export const config = /, '')).effectOptions).toMatchObject({
      charRamp: 'classic',
      asciiColored: false
    })
    for (const { path, content } of ENGINE_SOURCES) {
      expect(await zip.file(`${prefix}${path}`).async('string'), path).toBe(content)
    }
  })
})
