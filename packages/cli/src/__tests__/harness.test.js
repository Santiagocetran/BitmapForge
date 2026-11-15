/* global Buffer, process */
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import vm from 'node:vm'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { Vector3 } from 'three'
import { parseProjectData } from '../../../embed/src/projectParser.js'

const source = readFileSync(process.env.CLI_CANVAS_SOURCE || new URL('../harness.js', import.meta.url), 'utf8').replace(
  /^import .*\n/,
  ''
)
const scripts = {
  '/pako.js': readFileSync(new URL('../../../../node_modules/pako/dist/pako.min.js', import.meta.url), 'utf8'),
  '/upng.js': readFileSync(new URL('../../../../node_modules/upng-js/UPNG.js', import.meta.url), 'utf8')
}
function harness(fail = new Set(), scenario = {}) {
  const events = [],
    inserted = [],
    tracks = [0, 1].map((i) => ({
      stop: () => {
        events.push(`track${i}`)
        if (fail.has(`track${i}`)) throw new Error(`track${i}`)
      }
    }))
  const hit = (name) => {
    events.push(name)
    if (fail.has(name)) throw new Error(name)
  }
  const canvas = {
    width: 2,
    height: 2,
    getContext: () => ({
      getImageData: () => {
        hit('pixels')
        return { width: 2, height: 2, data: new Uint8ClampedArray(16).fill(255) }
      }
    })
  }
  class Manager {
    constructor() {
      hit('construct')
    }
    setSize() {
      hit('size')
    }
    loadShape() {
      hit('shape')
    }
    async loadModel() {
      hit('model')
    }
    setRenderMode() {
      hit('mode')
    }
    updateAnimationOptions() {
      hit('animation')
    }
    updateEffectOptions() {
      hit('effect')
    }
    getLoopDurationMs() {
      return scenario.loopMs ?? 12
    }
    getCanvas() {
      hit('canvas')
      return scenario.getCanvas ? scenario.getCanvas() : canvas
    }
    pauseLoop() {
      hit('pause')
    }
    resumeLoop() {
      hit('resume')
    }
    renderAtTime(time) {
      hit('render')
      scenario.render?.(time)
    }
    dispose() {
      hit('dispose')
    }
  }
  let active = 0
  class Recorder {
    constructor() {
      hit('recorder.construct')
      this.state = 'inactive'
      this.listeners = {}
    }
    addEventListener(name, callback) {
      this.listeners[name] = callback
    }
    removeEventListener(name) {
      delete this.listeners[name]
      events.push(`remove:${name}`)
    }
    start() {
      hit('recorder.start')
      this.state = 'recording'
      active++
      if (fail.has('recorder.error')) {
        queueMicrotask(() => {
          const event = { error: new Error('recorder.error') }
          this.listeners.error?.(event)
          this.onerror?.(event)
        })
      }
    }
    stop() {
      hit('recorder.stop')
      this.state = 'inactive'
      active--
      if (!fail.has('recorder.timeout'))
        queueMicrotask(() => {
          this.listeners.stop?.()
          this.onstop?.()
        })
    }
  }
  const context = vm.createContext({
    SceneManager: Manager,
    parseProjectData: (data) => JSON.parse(data),
    document: {
      getElementById: () => ({ style: {} }),
      createElement: (tag) =>
        tag === 'script'
          ? {}
          : {
              getContext: () => ({
                drawImage: (...args) => {
                  hit('draw')
                  scenario.draw?.(...args)
                }
              }),
              captureStream: () => {
                hit('stream')
                return { getTracks: () => tracks }
              }
            },
      head: {
        appendChild: (script) => {
          inserted.push(script.src)
          queueMicrotask(() => {
            if (fail.has(`load:${script.src}`)) return script.onerror()
            if (!fail.has(`global:${script.src}`)) vm.runInContext(scripts[script.src], context)
            script.onload()
          })
        }
      }
    },
    MediaRecorder: Recorder,
    Blob: class {
      async arrayBuffer() {
        hit('blob')
        return new ArrayBuffer(1)
      }
    },
    File: class {},
    Uint8Array,
    Uint8ClampedArray,
    ArrayBuffer,
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    setTimeout,
    clearTimeout,
    queueMicrotask,
    console
  })
  context.window = context
  vm.runInContext(source + '\nthis.testing = { loadUpng, encodeApng, captureFrames, encodeWebm };', context)
  const render = (format = 'apng', model = false) =>
    context.__bitmapForgeRender({
      projectJson: JSON.stringify({
        settings: {},
        inputType: model ? 'model' : 'shape',
        modelData: { data: '', name: 'safe.obj' }
      }),
      format
    })
  return { context, events, inserted, render, active: () => active }
}
afterEach(() => vi.useRealTimers())

describe('current canvas capture', () => {
  for (const format of ['apng', 'webm']) {
    for (const swap of ['first', 'later', 'both', 'none']) {
      it.each([160, 161])(`${format} ${swap} swap captures exact owners at width %s`, async (width) => {
        vi.useFakeTimers()
        const order = [],
          reads = [],
          draws = [],
          times = []
        const canvases = ['A', 'B', 'C'].map((id, index) => {
          const canvas = { id, width: width + (format === 'webm' && index === 2 ? 20 : 0), height: 121 }
          const context = {
            getImageData: (...rect) => {
              order.push(`read:${id}`)
              reads.push([canvas, rect])
              return {
                width: canvas.width,
                height: canvas.height,
                data: new Uint8ClampedArray(canvas.width * canvas.height * 4).fill(index + 1)
              }
            }
          }
          canvas.getContext = () => context
          return canvas
        })
        let current = canvases[0],
          index = -1
        const expected = Array.from(
          { length: 21 },
          (_, i) =>
            canvases[(swap === 'later' || swap === 'both') && i >= 5 ? 2 : swap === 'first' || swap === 'both' ? 1 : 0]
        )
        const h = harness(new Set(), {
          loopMs: 2094,
          render(time) {
            index++
            times.push(time)
            order.push(`render:${index}`)
            current = expected[index]
          },
          getCanvas() {
            order.push(`get:${current.id}`)
            return current
          },
          draw(canvas, ...rect) {
            order.push(`draw:${canvas.id}`)
            draws.push([canvas, rect])
          }
        })
        const manager = new h.context.SceneManager()
        const pending =
          format === 'apng'
            ? h.context.testing.captureFrames(manager, 21)
            : h.context.testing.encodeWebm(manager, 21, 10)
        await vi.runAllTimersAsync()
        const result = await pending
        const captured = format === 'apng' ? reads : draws
        expect(
          captured.map(([canvas]) => canvas.id),
          'per-frame source identity'
        ).toEqual(expected.map((c) => c.id))
        captured.forEach(([canvas, rect], i) => {
          expect(canvas).toBe(expected[i])
          expect(rect).toEqual([0, 0, format === 'webm' ? width + (width % 2) : width, format === 'webm' ? 122 : 121])
          if (format === 'apng') {
            expect(result[i].data[0]).toBe(canvases.indexOf(expected[i]) + 1)
            expect([result[i].width, result[i].height]).toEqual([width, 121])
          }
        })
        expect(times).toEqual(Array.from({ length: 21 }, (_, i) => (i / 21) * 2094))
        expect(order.slice(order.indexOf('render:0'))).toEqual(
          expected.flatMap((c, i) => [`render:${i}`, `get:${c.id}`, `${format === 'apng' ? 'read' : 'draw'}:${c.id}`])
        )
        expect(h.events.filter((v) => v === 'resume')).toHaveLength(1)
        expect(vi.getTimerCount()).toBe(0)
      })
    }
    it.each(['missing', 'throwing'])(`${format} cleans up %s current canvas after an earlier frame`, async (kind) => {
      vi.useFakeTimers()
      let frame = 0
      const canvas = {
        width: 2,
        height: 2,
        getContext: () => ({ getImageData: () => ({ width: 2, height: 2, data: new Uint8ClampedArray(16) }) })
      }
      const h = harness(new Set(), {
        render() {
          frame++
        },
        getCanvas() {
          if (frame >= 2) {
            if (kind === 'throwing') throw new Error('lookup failed')
            return null
          }
          return canvas
        }
      })
      const pending = h.render(format)
      await vi.runAllTimersAsync()
      expect(await pending).toMatchObject({
        ok: false,
        error: kind === 'throwing' ? 'lookup failed' : 'No preview canvas available'
      })
      expect(frame).toBe(2)
      expect(h.events.filter((v) => v === 'dispose')).toHaveLength(1)
      expect(h.events.filter((v) => v === 'resume')).toHaveLength(1)
      if (format === 'webm')
        expect(h.events).toEqual(
          expect.arrayContaining([
            'recorder.stop',
            'remove:dataavailable',
            'remove:stop',
            'remove:error',
            'track0',
            'track1'
          ])
        )
      expect(vi.getTimerCount()).toBe(0)
    })
  }
})
describe('classic compression prerequisite', () => {
  it('uses real classic pako and UPNG for tiny RGBA compression', async () => {
    const h = harness()
    const data = new Uint8ClampedArray(16).fill(255)
    const encoded = await h.context.testing.encodeApng([{ width: 2, height: 2, data }], 100)
    expect(Buffer.from(encoded, 'base64').subarray(1, 4).toString()).toBe('PNG')
  })
  it('loads pako before UPNG once across concurrent/repeated calls and really encodes tiny RGBA', async () => {
    const h = harness()
    const [a, b] = await Promise.all([h.context.testing.loadUpng(), h.context.testing.loadUpng()])
    expect(a).toBe(b)
    expect(h.inserted).toEqual(['/pako.js', '/upng.js'])
    const data = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255])
    const before = data.slice()
    const encoded = await h.context.testing.encodeApng(
      [
        { width: 2, height: 2, data },
        { width: 2, height: 2, data: data.slice().reverse() }
      ],
      100
    )
    const png = Buffer.from(encoded, 'base64')
    expect(png.subarray(1, 4).toString()).toBe('PNG')
    expect(png.toString('latin1')).toContain('acTL')
    expect(data).toEqual(before)
    expect(h.inserted).toEqual(['/pako.js', '/upng.js'])
  })
  it.each(['load:/pako.js', 'load:/upng.js', 'global:/pako.js', 'global:/upng.js'])(
    'reports and retries %s without cached false success',
    async (failure) => {
      const fail = new Set([failure]),
        h = harness(fail)
      await expect(h.context.testing.loadUpng()).rejects.toThrow(failure.split(':')[1])
      fail.clear()
      await h.context.testing.loadUpng()
      expect(typeof h.context.UPNG.encode).toBe('function')
    }
  )
})
describe('manager and capture ownership', () => {
  it('disposes exactly once on success and resumes capture', async () => {
    const h = harness()
    expect((await h.render()).ok).toBe(true)
    expect(h.events.filter((v) => v === 'dispose')).toHaveLength(1)
    expect(h.events).toContain('resume')
  })
  it.each(['size', 'shape', 'mode', 'animation', 'effect', 'canvas', 'render', 'pixels', 'load:/upng.js', 'dispose'])(
    'disposes once on %s',
    async (failure) => {
      const h = harness(new Set([failure]))
      const result = await h.render()
      expect(result.ok).toBe(false)
      expect(h.events.filter((v) => v === 'dispose')).toHaveLength(1)
      if (['render', 'pixels'].includes(failure)) expect(h.events).toContain('resume')
    }
  )
  it('disposes after model failure, retaining primary when disposal also fails', async () => {
    const h = harness(new Set(['model', 'dispose']))
    expect(await h.render('apng', true)).toMatchObject({ ok: false, error: 'model; dispose: dispose' })
    expect(h.events.filter((v) => v === 'dispose')).toHaveLength(1)
  })
  it('does not claim ownership of a constructor which never returned', async () => {
    const h = harness(new Set(['construct']))
    expect((await h.render()).ok).toBe(false)
    expect(h.events).not.toContain('dispose')
  })
  it('disposes after real capture when UPNG encoding throws', async () => {
    const h = harness()
    h.context.UPNG = {
      encode: () => {
        throw new Error('encode fixture')
      }
    }
    expect(await h.render()).toMatchObject({ ok: false, error: 'encode fixture' })
    expect(h.events).toContain('resume')
    expect(h.events.filter((v) => v === 'dispose')).toHaveLength(1)
  })
})
describe('recorder lifetime from stream acquisition', () => {
  it.each([
    'recorder.construct',
    'recorder.start',
    'render',
    'draw',
    'recorder.error',
    'recorder.stop',
    'blob',
    'resume',
    'track0'
  ])('stops every track and disposes after %s', async (failure) => {
    const h = harness(new Set([failure]))
    expect((await h.render('webm')).ok).toBe(false)
    expect(h.events).toContain('track0')
    expect(h.events).toContain('track1')
    expect(h.events.filter((v) => v === 'dispose')).toHaveLength(1)
    if (!['recorder.construct', 'recorder.start'].includes(failure)) expect(h.events).toContain('resume')
  })
  it('settles stop timeout at five seconds and clears owned timers/listeners', async () => {
    vi.useFakeTimers()
    const h = harness(new Set(['recorder.timeout']))
    const pending = h.render('webm')
    await vi.advanceTimersByTimeAsync(5100)
    const result = await pending
    expect(result).toMatchObject({ ok: false })
    expect(result.error).toContain('5000ms')
    expect(h.events).toEqual(
      expect.arrayContaining(['track0', 'track1', 'resume', 'dispose', 'remove:stop', 'remove:error'])
    )
    expect(vi.getTimerCount()).toBe(0)
  })
  it('success stops recorder, tracks and manager without leaking listeners', async () => {
    const h = harness()
    expect((await h.render('webm')).ok).toBe(true)
    expect(h.active()).toBe(0)
    expect(h.events).toEqual(
      expect.arrayContaining(['track0', 'track1', 'resume', 'dispose', 'remove:stop', 'remove:error'])
    )
  })
  it('disposes when stream acquisition fails without claiming track ownership', async () => {
    const h = harness(new Set(['stream']))
    expect(await h.render('webm')).toMatchObject({ ok: false, error: 'stream' })
    expect(h.events).toContain('dispose')
    expect(h.events).not.toContain('track0')
  })
  it('continues track cleanup despite recorder stop and resume failures', async () => {
    const h = harness(new Set(['render', 'recorder.stop', 'resume', 'track0']))
    const result = await h.render('webm')
    expect(result.ok).toBe(false)
    for (const message of ['render', 'recorder.stop', 'resume', 'track0']) expect(result.error).toContain(message)
    expect(h.events).toContain('track1')
    expect(h.events).toContain('dispose')
  })
})
describe('frozen nested fixtures through real parser and OBJ loader', () => {
  it.each([
    ['shape-v2.bforge', '44089df7b4d4f4c4b952c102835086c67cb1ab24da3cce85b06800c8942e8751'],
    ['model-v2.bitmapforge', 'e654d3bc6345537c70645d6953d3b735f943e0953c3ef3d1db3ef7f9acf9bafe']
  ])('%s hash and settings', (name, hash) => {
    const bytes = readFileSync(new URL(`./fixtures/${name}`, import.meta.url))
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(hash)
    const parsed = parseProjectData(bytes.toString())
    expect(parsed.settings).toMatchObject({ seed: 42, animationSpeed: 3, useFadeInOut: false, ditherType: 'bayer4' })
    if (name.startsWith('shape')) expect(parsed.settings).toMatchObject({ shapeType: 'cube', shapeParams: { size: 2 } })
    else {
      const obj = Buffer.from(parsed.modelData.data, 'base64').toString()
      expect(createHash('sha256').update(obj).digest('hex')).toBe(
        '502592e4e496dbb0455f71890c3d6e5710b6359689875a10f25dea8e6fa25865'
      )
      const loaded = new OBJLoader().parse(obj)
      const geometry = loaded.children[0].geometry
      expect(geometry.attributes.position.count).toBe(12)
      geometry.computeBoundingBox()
      expect(geometry.boundingBox.min.toArray()).toEqual([0, 0, 0])
      expect(geometry.boundingBox.max.toArray()).toEqual([2, 1, 3])
      const pos = geometry.attributes.position,
        edges = new Map(),
        center = new Vector3(0.5, 0.25, 0.75)
      let volume = 0
      for (let i = 0; i < pos.count; i += 3) {
        const points = [0, 1, 2].map((j) => new Vector3().fromBufferAttribute(pos, i + j))
        const [a, b, c] = points
        const normal = b.clone().sub(a).cross(c.clone().sub(a))
        expect(normal.length()).toBeGreaterThan(0)
        expect(normal.dot(center.clone().sub(a))).toBeLessThan(0)
        volume += a.dot(b.clone().cross(c)) / 6
        for (let j = 0; j < 3; j++) {
          const key = [points[j].toArray().join(','), points[(j + 1) % 3].toArray().join(',')].sort().join('|')
          edges.set(key, (edges.get(key) || 0) + 1)
        }
      }
      expect(volume).toBeCloseTo(1)
      expect(edges.size).toBe(6)
      expect([...edges.values()]).toEqual([2, 2, 2, 2, 2, 2])
      expect(obj).not.toMatch(/mtllib|https?:|map_Kd/)
    }
  })
})
