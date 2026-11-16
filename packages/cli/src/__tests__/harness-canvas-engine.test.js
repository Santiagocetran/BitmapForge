// @vitest-environment jsdom
/* global process */
import { readFileSync } from 'node:fs'
import { URL as NodeURL } from 'node:url'
import vm from 'node:vm'
import { afterEach, expect, it, vi } from 'vitest'
import { SceneManager } from '../../../../src/engine/SceneManager.js'
import { BitmapEffect } from '../../../../src/engine/effects/BitmapEffect.js'
import { AnimationEngine } from '../../../../src/engine/animation/AnimationEngine.js'
import { BitmapRenderer } from '../../../../src/engine/renderers/BitmapRenderer.js'

vi.mock('three', async (original) => ({
  ...(await original()),
  WebGLRenderer: class {
    domElement = document.createElement('canvas')
    setClearColor() {}
    setPixelRatio() {}
    setSize() {}
    setAnimationLoop() {}
    render() {}
    dispose() {}
  }
}))
const source = readFileSync(
  process.env.CLI_CANVAS_SOURCE || new NodeURL('../harness.js', import.meta.url),
  'utf8'
).replace(/^import .*\n/, '')
let manager

afterEach(() => {
  manager?.dispose()
  manager = null
  vi.restoreAllMocks()
  vi.useRealTimers()
})

it.each(['apng', 'webm'])('%s captures B after the real pending renderer retires A', async (format) => {
  vi.useFakeTimers()
  const contexts = new WeakMap(),
    reads = [],
    draws = []
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function () {
    if (!contexts.has(this)) {
      const canvas = this
      contexts.set(canvas, {
        clearRect() {},
        fillRect() {},
        drawImage(source, ...rect) {
          draws.push({ target: canvas, source, rect })
        },
        getImageData(...rect) {
          const [, , width, height] = rect
          reads.push({ canvas, rect })
          return { owner: canvas, width, height, data: new Uint8ClampedArray(width * height * 4).fill(255) }
        }
      })
    }
    return contexts.get(this)
  })
  const options = { useFadeInOut: false, animationSpeed: 3, pixelSize: 3 }
  manager = new SceneManager(document.createElement('div'), options)
  manager.setSize(17, 13)
  manager.loadShape('cube', { size: 2 })
  manager.setRenderMode('bitmap')
  manager.updateAnimationOptions({ ...options })
  manager.updateEffectOptions({ ...options })
  expect(manager.effect).toBeInstanceOf(BitmapEffect)
  expect(manager.animationEngine).toBeInstanceOf(AnimationEngine)
  const old = manager.effect._activeRenderer,
    pending = manager.effect._pendingRenderer
  expect(old).toBeInstanceOf(BitmapRenderer)
  expect(pending).toBeInstanceOf(BitmapRenderer)
  expect(pending).not.toBe(old)
  const a = old.canvas,
    b = pending.canvas
  expect(b).not.toBe(a)
  expect(manager.effect.isAnimating).toBe(true)
  expect(manager.getCanvas()).toBe(a)
  expect([a.width, a.height]).toEqual([17, 13])
  const disposed = vi.spyOn(old, 'dispose')
  const swap = vi.spyOn(manager.effect, '_swapRenderer')
  const seek = vi.spyOn(manager.animationEngine, 'seekTo')
  const render = vi.spyOn(manager, 'renderAtTime')
  const resume = vi.spyOn(manager, 'resumeLoop')
  const tracks = [{ stop: vi.fn() }]
  const offscreen = document.createElement('canvas')
  offscreen.captureStream = () => ({ getTracks: () => tracks })
  class Recorder {
    state = 'inactive'
    listeners = {}
    addEventListener(name, fn) {
      this.listeners[name] = fn
    }
    removeEventListener(name) {
      delete this.listeners[name]
    }
    start() {
      this.state = 'recording'
    }
    stop() {
      this.state = 'inactive'
      this.listeners.stop()
    }
  }
  const context = vm.createContext({
    window: {},
    document: { createElement: () => offscreen },
    MediaRecorder: Recorder,
    Blob: class {
      async arrayBuffer() {
        return new ArrayBuffer(0)
      }
    },
    btoa: () => '',
    setTimeout,
    clearTimeout,
    Uint8Array
  })
  vm.runInContext(source + '\nthis.testing = { captureFrames, encodeWebm };', context)
  const capture =
    format === 'apng' ? context.testing.captureFrames(manager, 12) : context.testing.encodeWebm(manager, 12, 10)
  // The first render is synchronous, before any frame wait/yield.
  expect(render.mock.calls[0]).toEqual([0])
  expect(seek.mock.calls[0][0]).toBe(0)
  expect(manager.effect.isAnimating).toBe(false)
  expect(swap).toHaveBeenCalledExactlyOnceWith(pending)
  expect(disposed).toHaveBeenCalledTimes(1)
  expect(old.canvas).toBeNull()
  expect(a.parentNode).toBeNull()
  expect(b.parentNode).toBe(manager.effect.domElement)
  expect(manager.effect._pendingRenderer).toBeNull()
  expect(manager.getCanvas()).toBe(b)
  expect([b.width, b.height]).toEqual([17, 13])
  await vi.runAllTimersAsync()
  const result = await capture
  expect(render.mock.calls).toEqual(Array.from({ length: 12 }, (_, i) => [(i / 12) * manager.getLoopDurationMs()]))
  if (format === 'apng') {
    expect(
      result.map((frame) => frame.owner === b),
      'captured current B, not detached A'
    ).toEqual(Array(12).fill(true))
    expect(reads.filter((read) => read.canvas === a)).toHaveLength(0)
    expect(reads.filter((read) => read.canvas === b).map((read) => read.rect)).toEqual(
      Array.from({ length: 12 }, () => [0, 0, 17, 13])
    )
  } else {
    const captures = draws.filter((draw) => draw.target === offscreen)
    expect(
      captures.map((draw) => draw.source === b),
      'captured current B, not detached A'
    ).toEqual(Array(12).fill(true))
    expect(captures.map((draw) => draw.rect)).toEqual(Array.from({ length: 12 }, () => [0, 0, 18, 14]))
    expect([offscreen.width, offscreen.height]).toEqual([18, 14])
    expect(tracks[0].stop).toHaveBeenCalledTimes(1)
  }
  expect(resume).toHaveBeenCalledTimes(1)
  expect(vi.getTimerCount()).toBe(0)
})
