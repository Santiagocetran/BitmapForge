import { describe, it, expect, vi, beforeEach } from 'vitest'
import JSZip from 'jszip'
import { generateCss, buildCssAnimation } from './cssExport.js'

// ─── generateCss (pure function) ─────────────────────────────────────────────

describe('generateCss', () => {
  it('produces a CSS string containing the class name', () => {
    const css = generateCss('my-anim', 32, 32, 4, 1000)
    expect(css).toContain('.my-anim')
  })

  it('uses the correct sprite sheet URL', () => {
    const css = generateCss('foo', 16, 16, 2, 500)
    expect(css).toContain("url('./foo-sprite.png')")
  })

  it('references the animation name in animation property', () => {
    const css = generateCss('bar', 16, 16, 4, 800)
    expect(css).toContain('bar-frames')
  })

  it('uses steps(1, end) timing function', () => {
    const css = generateCss('test', 16, 16, 4, 400)
    expect(css).toContain('steps(1, end)')
  })

  it('sets animation-duration from loopMs', () => {
    const css = generateCss('test', 16, 16, 4, 1234)
    expect(css).toContain('1234ms')
  })

  it('emits exactly frameCount keyframe stops', () => {
    const frameCount = 6
    const css = generateCss('test', 16, 16, frameCount, 600)
    // Each stop looks like "  X% { ... }"
    const stops = css.match(/%\s*\{/g)
    expect(stops).toHaveLength(frameCount)
  })

  it('first keyframe stop is 0%', () => {
    const css = generateCss('test', 16, 16, 4, 400)
    expect(css).toMatch(/^\s*0%\s*\{/m)
  })

  it('does NOT include a 100% stop (prevents loop hitch)', () => {
    const css = generateCss('test', 16, 16, 4, 400)
    expect(css).not.toMatch(/^\s*100%/m)
  })

  it('encodes multi-row sprite positions correctly (row 2 for frame 7 with COLUMNS=6)', () => {
    // Frame 6 (0-indexed) → col=0, row=1 → x=0, y=frameH
    const frameH = 32
    const css = generateCss('test', 32, frameH, 8, 800)
    // Frame 6: col = 6%6 = 0, row = floor(6/6) = 1 → position: -0px -32px
    expect(css).toContain(`-0px -${frameH}px`)
  })

  it('sets background-size to full sprite sheet dimensions', () => {
    // COLUMNS=6, 8 frames → 2 rows; sheet is 6*32=192 wide, 2*32=64 tall
    const css = generateCss('test', 32, 32, 8, 800)
    expect(css).toContain('192px 64px')
  })

  it('sets element width and height from frame dimensions', () => {
    const css = generateCss('test', 48, 64, 4, 400)
    expect(css).toContain('width: 48px')
    expect(css).toContain('height: 64px')
  })

  it('animation is set to infinite', () => {
    const css = generateCss('test', 16, 16, 4, 400)
    expect(css).toContain('infinite')
  })
})

// ─── buildCssAnimation (integration — requires mocked DOM + framesProvider) ──

const MOCK_FRAME_W = 16
const MOCK_FRAME_H = 16
const FRAME_COUNT = 4

// Build a minimal ImageData-like object (plain object is fine since we mock canvas)
function makeMockFrame() {
  return { width: MOCK_FRAME_W, height: MOCK_FRAME_H, data: new Uint8ClampedArray(MOCK_FRAME_W * MOCK_FRAME_H * 4) }
}

vi.mock('./framesProvider.js', () => ({
  getFrameCount: vi.fn(() => FRAME_COUNT),
  captureFrames: vi.fn(async () => Array.from({ length: FRAME_COUNT }, makeMockFrame))
}))

describe('buildCssAnimation', () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement.prototype methods used by buildCssAnimation
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      putImageData: vi.fn(),
      drawImage: vi.fn()
    })
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (callback) {
      callback(new Blob(['PNG'], { type: 'image/png' }))
    })
  })

  function makeMockManager() {
    const canvas = document.createElement('canvas')
    canvas.width = MOCK_FRAME_W
    canvas.height = MOCK_FRAME_H
    return {
      getCanvas: () => canvas,
      getLoopDurationMs: () => 1000
    }
  }

  it('resolves to a Blob', async () => {
    const blob = await buildCssAnimation(makeMockManager(), {}, 'my-anim', 16)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('ZIP contains the CSS file', async () => {
    const blob = await buildCssAnimation(makeMockManager(), {}, 'my-anim', 16)
    const zip = await JSZip.loadAsync(blob)
    expect(zip.files['my-anim.css']).toBeDefined()
  })

  it('ZIP contains the sprite PNG', async () => {
    const blob = await buildCssAnimation(makeMockManager(), {}, 'my-anim', 16)
    const zip = await JSZip.loadAsync(blob)
    expect(zip.files['my-anim-sprite.png']).toBeDefined()
  })

  it('ZIP contains a README.md', async () => {
    const blob = await buildCssAnimation(makeMockManager(), {}, 'my-anim', 16)
    const zip = await JSZip.loadAsync(blob)
    expect(zip.files['README.md']).toBeDefined()
  })

  it('CSS file content references the animation name', async () => {
    const blob = await buildCssAnimation(makeMockManager(), {}, 'my-anim', 16)
    const zip = await JSZip.loadAsync(blob)
    const css = await zip.files['my-anim.css'].async('string')
    expect(css).toContain('my-anim')
  })

  it('README mentions the animation name', async () => {
    const blob = await buildCssAnimation(makeMockManager(), {}, 'my-anim', 16)
    const zip = await JSZip.loadAsync(blob)
    const readme = await zip.files['README.md'].async('string')
    expect(readme).toContain('my-anim')
  })

  it('passes signal and onProgress to captureFrames', async () => {
    const { captureFrames } = await import('./framesProvider.js')
    const onProgress = vi.fn()
    const controller = new AbortController()
    await buildCssAnimation(makeMockManager(), {}, 'my-anim', 16, {
      signal: controller.signal,
      onProgress
    })
    expect(captureFrames).toHaveBeenCalledWith(
      expect.anything(),
      FRAME_COUNT,
      expect.objectContaining({ signal: controller.signal, onProgress })
    )
  })
})
