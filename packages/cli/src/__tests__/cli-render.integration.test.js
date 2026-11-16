/* global process, Buffer */
import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { mkdir, copyFile, writeFile, readdir, mkdtemp, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  ENABLED,
  FIXTURES,
  CHILD_TEST_MS,
  DECODE_TEST_MS,
  session,
  settled,
  commandCase,
  cleanupEvidence,
  assertRenderEvents,
  analyzeArtifact,
  parseApng,
  rgbaStats,
  assertPixels,
  assertBatchProcessing,
  benignDecoderFixture,
  verifyFreeze,
  observerSource
} from './cli-stage2-evidence.js'

const S = join(FIXTURES, 'shape-v2.bforge'),
  M = join(FIXTURES, 'model-v2.bitmapforge')
export const RENDER_LEDGER = [
  { id: 'P01', format: 'apng', fps: 12, width: 400, height: 400, args: ['render', S], outputs: ['shape-v2.apng'] },
  {
    id: 'P02',
    format: 'apng',
    fps: 10,
    width: 160,
    height: 120,
    args: [
      'render',
      M,
      '--format',
      'apng',
      '--fps',
      '10',
      '--width',
      '160',
      '--height',
      '120',
      '--out',
      'nested path/model.apng'
    ],
    outputs: ['nested path/model.apng']
  },
  {
    id: 'P03',
    format: 'webm',
    fps: 10,
    width: 160,
    height: 120,
    args: [
      'render',
      M,
      '--format',
      'webm',
      '--fps',
      '10',
      '--width',
      '160',
      '--height',
      '120',
      '--out',
      'nested path/model.webm'
    ],
    outputs: ['nested path/model.webm']
  },
  {
    id: 'P04',
    format: 'webm',
    fps: 12,
    width: 160,
    height: 120,
    args: ['render', S, '--format', 'webm', '--fps', '12', '--width', '160', '--height', '120', '--out', 'shape.webm'],
    outputs: ['shape.webm']
  },
  ...['apng', 'webm'].map((format, i) => ({
    id: `P0${5 + i}`,
    format,
    fps: 12,
    width: format === 'apng' ? 161 : 162,
    height: format === 'apng' ? 121 : 122,
    args: [
      'render',
      M,
      '--format',
      format,
      '--fps',
      '12',
      '--width',
      '161',
      '--height',
      '121',
      '--out',
      `odd.${format}`
    ],
    outputs: [`odd.${format}`]
  })),
  ...[false, true].flatMap((defaults, j) =>
    ['apng', 'webm'].map((format, i) => ({
      id: `P${String(7 + j * 2 + i).padStart(2, '0')}`,
      format,
      fps: defaults ? 12 : 10,
      width: 160,
      height: 120,
      batch: true,
      defaults,
      args: [],
      outputs: ['a', 'b'].map((name) => `${defaults ? 'input/out' : 'batch path'}/${name}.${format}`)
    }))
  )
]

describe.skipIf(!ENABLED).sequential('dedicated CLI P01–P10 (browser slot required; P11 remains separate)', () => {
  let owner
  const runs = new Map(),
    decoded = new Map()
  beforeAll(async () => {
    owner = await session('render')
  })
  afterAll(async () => {
    await owner?.release()
  })
  for (const row of RENDER_LEDGER) {
    it(
      `${row.id} real subprocess and ordinary cleanup`,
      async () => {
        const cwd = join(owner.dir, row.id)
        let args = row.args
        if (row.batch) {
          const input = join(cwd, 'input')
          await mkdir(input, { recursive: true })
          await copyFile(S, join(input, 'a.bforge'))
          await copyFile(M, join(input, 'b.bitmapforge'))
          await writeFile(join(input, 'notes.txt'), 'ignored\n')
          args = [
            'batch',
            input,
            '--format',
            row.format,
            '--fps',
            String(row.fps),
            '--width',
            '160',
            '--height',
            '120',
            ...(!row.defaults ? ['--out', 'batch path'] : [])
          ]
        }
        const run = await commandCase(owner.dir, row.id, args)
        runs.set(row.id, run)
        await cleanupEvidence(run)
        settled(run.result)
        expect(run.result.stdout.trim().split('\n').sort()).toEqual(row.outputs.map((p) => join(cwd, p)).sort())
        expect(run.result.stderr).not.toMatch(/Render failed|Failed to close/)
        assertRenderEvents(run, row.fps, row.format, row.outputs.length)
        if (row.batch) {
          assertBatchProcessing(run.result.stderr, join(cwd, 'input'))
          const folder = join(cwd, row.defaults ? 'input/out' : 'batch path')
          expect((await readdir(folder)).sort()).toEqual(['a', 'b'].map((n) => `${n}.${row.format}`))
        }
      },
      CHILD_TEST_MS
    )
    for (const [index, output] of row.outputs.entries())
      it(
        `${row.id} independent decode ${output}`,
        async () => {
          const run = runs.get(row.id)
          expect(run, 'render test must run first').toBeDefined()
          settled(run.result)
          const result = await analyzeArtifact(join(run.dir, output), row, join(run.dir, `decode-${index}`))
          const previous = decoded.get(row.id)
          if (previous)
            expect(result.rawSha256, 'batch shape/model decoded content must differ').not.toBe(previous.rawSha256)
          decoded.set(row.id, result)
        },
        DECODE_TEST_MS
      )
    if (row.batch)
      it(`${row.id} shape/model independent decoded hashes differ even if pixel gates fail`, async () => {
        const run = runs.get(row.id)
        const reports = await Promise.all(
          [0, 1].map(async (index) =>
            JSON.parse(await readFile(join(run.dir, `decode-${index}`, 'pixels.json'), 'utf8'))
          )
        )
        expect(reports[0].rawSha256).not.toBe(reports[1].rawSha256)
      })
  }
})

// No subprocess/browser launches in the normal suite. These pure branches are always safe.
describe('stage2 evidence pure contracts', () => {
  it('frozen accepted helper and fixture bytes', verifyFreeze)
  it('finite ledger has exactly P01–P10 and fourteen outputs', () => {
    expect(RENDER_LEDGER.map((r) => r.id)).toEqual(
      Array.from({ length: 10 }, (_, i) => `P${String(i + 1).padStart(2, '0')}`)
    )
    expect(RENDER_LEDGER.reduce((n, r) => n + r.outputs.length, 0)).toBe(14)
  })
  it('rejects truncated/non-PNG and uniform or transparent RGBA', () => {
    expect(() => parseApng(Buffer.from('not png'))).toThrow()
    expect(() => parseApng(Buffer.from('89504e470d0a1a0a00000008', 'hex'))).toThrow()
    for (const alpha of [0, 255]) {
      const bytes = Buffer.alloc(4 * 16 * 2)
      for (let p = 3; p < bytes.length; p += 4) bytes[p] = alpha
      expect(() => assertPixels(rgbaStats(bytes, 4, 4))).toThrow()
    }
  })
  // Synthetic checker regressions only; never substituted for retained CLI frames.
  function patternedFrame(inverted = false, noise = 0) {
    const frame = Buffer.alloc(20 * 20 * 4)
    for (let pixel = 0; pixel < 400; pixel++) {
      const value = (pixel < 200 !== inverted ? 32 : 224) + noise
      frame.set([value, value, value, 255], pixel * 4)
    }
    return frame
  }
  function patternedStats(frames) {
    return rgbaStats(Buffer.concat(frames), 20, 20)
  }
  it('accepts one qualifying half-loop pair even when the other transition is stationary', () => {
    const stats = patternedStats([patternedFrame(), patternedFrame(true), patternedFrame(true)])
    expect(stats.changes).toEqual([
      { from: 0, to: 1, fraction: 1 },
      { from: 0, to: 2, fraction: 1 },
      { from: 1, to: 2, fraction: 0 }
    ])
    expect(() => assertPixels(stats)).not.toThrow()
  })
  it('rejects all-unchanging spatially meaningful frames at the temporal gate', () => {
    const stats = patternedStats([patternedFrame(), patternedFrame(), patternedFrame()])
    expect(stats.samples.every((s) => s.separated && s.lumaStddev >= 5)).toBe(true)
    expect(stats.changes.every((c) => c.fraction === 0)).toBe(true)
    expect(() => assertPixels(stats)).toThrow(/no qualifying separated-frame change/)
  })
  it('rejects byte-distinct codec-noise-only frames below the 16-luma threshold', () => {
    const stats = patternedStats([patternedFrame(), patternedFrame(false, 7), patternedFrame(false, 15)])
    expect(stats.samples.every((s) => s.separated && s.lumaStddev >= 5)).toBe(true)
    expect(stats.changes.every((c) => c.fraction === 0)).toBe(true)
    expect(() => assertPixels(stats)).toThrow(/no qualifying separated-frame change/)
  })
  it('keeps the 0.5% changed-area threshold', () => {
    const first = patternedFrame(),
      second = patternedFrame()
    second.set([224, 224, 224, 255], 0)
    const below = patternedStats([first, second, second])
    expect(below.changes[0].fraction).toBe(0.0025)
    expect(() => assertPixels(below)).toThrow(/no qualifying separated-frame change/)
    second.set([224, 224, 224, 255], 4)
    const boundary = patternedStats([first, second, second])
    expect(boundary.changes[0].fraction).toBe(0.005)
    expect(() => assertPixels(boundary)).not.toThrow()
  })
  const input = '/owned/input with spaces',
    processing = ['a.bforge', 'b.bitmapforge'].map((name) => `Processing: ${join(input, name)}`)
  it('requires both distinct batch Processing messages in either directory order', () => {
    for (const messages of [processing, [...processing].reverse()])
      expect(() => assertBatchProcessing(messages.join('\n') + '\n', input)).not.toThrow()
  })
  it.each([0, 1])('rejects missing expected batch Processing message %i', (missing) => {
    expect(() => assertBatchProcessing(processing.filter((_, i) => i !== missing).join('\n'), input)).toThrow()
  })
  it('rejects duplicate messages instead of accepting a missing distinct input', () => {
    expect(() => assertBatchProcessing([processing[0], processing[0]].join('\n'), input)).toThrow()
  })
  it('rejects processing ignored notes even when both supported messages are present', () => {
    expect(() =>
      assertBatchProcessing([...processing, `Processing: ${join(input, 'notes.txt')}`].join('\n'), input)
    ).toThrow()
  })
  it('observer source is syntax checked separately, with no production fault flags', () => {
    expect(observerSource('/owned/events.jsonl')).toContain('puppeteer.launch')
    expect(observerSource('/owned/events.jsonl', true)).toContain('server.close')
  })
})
describe
  .skipIf(process.env.CLI_DECODER_TESTS !== '1')
  .sequential('nonbrowser genuine FFmpeg decoder self-tests (not P acceptance)', () => {
    let dir
    beforeAll(async () => {
      expect(process.env.TMPDIR).toBeTruthy()
      dir = await mkdtemp(join(process.env.TMPDIR, 'cli-decoder-selftest-'))
    })
    for (const format of ['apng', 'webm'])
      it(
        `generated benign ${format} compositing/timing/pixels`,
        async () => {
          const target = join(dir, format),
            file = await benignDecoderFixture(target, format)
          const evidence = await analyzeArtifact(
            file,
            { format, width: 64, height: 48, fps: 10 },
            join(target, 'decode')
          )
          expect(evidence.stats.count).toBeGreaterThan(1)
          if (format === 'apng') expect(parseApng(await readFile(file)).declared).toBe(21)
        },
        DECODE_TEST_MS + 20000 + 16000 + 4000
      )
  })
