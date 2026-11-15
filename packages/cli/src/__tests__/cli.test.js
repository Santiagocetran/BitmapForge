/* global process, Buffer */
/** Historical assertions retained; dispatch imports now await operation and cleanup.
 * Mocks only prove ownership branches, not encoded-artifact or OS cleanup acceptance.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { runChild, LEGACY_CHILD_DEADLINE_MS, LEGACY_TEST_TIMEOUT_MS } from './cli-integration-helpers.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// ---------------------------------------------------------------------------
// Configurable fs/promises mock (top-level so Vitest hoisting works)
// ---------------------------------------------------------------------------

// Control object mutated per test
const fsMockControl = {
  readFileImpl: null,
  readdirImpl: null,
  mkdirCalls: [],
  writeFileCalls: []
}

vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    readFile: vi.fn().mockImplementation(async (p, enc) => {
      if (fsMockControl.readFileImpl) {
        return fsMockControl.readFileImpl(p, enc)
      }
      return actual.readFile(p, enc)
    }),
    readdir: vi.fn().mockImplementation(async (p) => {
      if (fsMockControl.readdirImpl) {
        return fsMockControl.readdirImpl(p)
      }
      return actual.readdir(p)
    }),
    mkdir: vi.fn().mockImplementation(async (...args) => {
      fsMockControl.mkdirCalls.push(args)
      return undefined
    }),
    writeFile: vi.fn().mockImplementation(async (...args) => {
      fsMockControl.writeFileCalls.push(args)
      return undefined
    }),
    access: vi.fn().mockResolvedValue(undefined)
  }
})

// ---------------------------------------------------------------------------
// Global mocks — hoisted by Vitest
// ---------------------------------------------------------------------------

vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn().mockResolvedValue(null),
        evaluate: vi.fn().mockResolvedValue({
          ok: true,
          base64: Buffer.from('fake').toString('base64'),
          mimeType: 'image/apng'
        }),
        exposeFunction: vi.fn().mockResolvedValue(null),
        on: vi.fn(),
        close: vi.fn().mockResolvedValue(null)
      }),
      close: vi.fn().mockResolvedValue(null)
    })
  }
}))

vi.mock('../server.js', () => ({
  start: vi.fn().mockResolvedValue({
    port: 9999,
    url: 'http://127.0.0.1:9999',
    close: vi.fn().mockResolvedValue(undefined)
  })
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Await the CLI module's top-level dispatch, restoring argv and exitCode. */
async function runCli(argv) {
  vi.resetModules()
  const previousArgv = process.argv
  const previousExitCode = process.exitCode
  const stderrChunks = [],
    stdoutChunks = []
  const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
    stderrChunks.push(String(chunk))
    return true
  })
  const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    stdoutChunks.push(String(chunk))
    return true
  })
  process.argv = ['node', 'bitmapforge', ...argv]
  process.exitCode = undefined
  try {
    await import('../index.js')
    return { exitCode: process.exitCode || 0, stderr: stderrChunks.join(''), stdout: stdoutChunks.join('') }
  } finally {
    process.argv = previousArgv
    process.exitCode = previousExitCode
    stderrSpy.mockRestore()
    stdoutSpy.mockRestore()
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
  fsMockControl.readFileImpl = null
  fsMockControl.readdirImpl = null
  fsMockControl.mkdirCalls = []
  fsMockControl.writeFileCalls = []
})

// ---------------------------------------------------------------------------
// Test 1: missing file → exit 1
// ---------------------------------------------------------------------------

describe('render: missing file → exit 1', () => {
  it('exits with code 1 and writes error to stderr', async () => {
    // readFileImpl is null: real read failure becomes a settled nonzero dispatch.
    const result = await runCli(['render', '/nonexistent/path/xyz-does-not-exist-abc.bforge'])
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toMatch(/cannot read file/)
  })
})

// ---------------------------------------------------------------------------
// Test 2: unsupported format (gif) → exit 1
// ---------------------------------------------------------------------------

describe('render: unsupported format → exit 1', () => {
  it('exits with code 1 mentioning valid formats apng and webm', async () => {
    const result = await runCli(['render', 'some.bforge', '--format', 'gif'])
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toMatch(/apng/)
    expect(result.stderr).toMatch(/webm/)
  })
})

// ---------------------------------------------------------------------------
// Test 3: missing --out directory is created via mkdir
// ---------------------------------------------------------------------------

describe('render: creates missing output directory', () => {
  it('calls mkdir with the output directory path', async () => {
    fsMockControl.readFileImpl = async (p, enc) => {
      if (typeof enc === 'string') {
        return '{"version":2,"inputType":"shape","shapeType":"box","colors":["#000000","#ffffff"],"pixelSize":8,"ditherType":"bayer4","fps":4,"frameCount":4,"renderMode":"bitmap","animationEffects":{}}'
      }
      throw new Error(`Unexpected binary readFile for ${p}`)
    }

    const outPath = '/some/new/output-dir/output.apng'
    const result = await runCli(['render', '/fake/project.bforge', '--out', outPath])
    expect(result.exitCode).toBe(0)

    // Verify mkdir was called with the correct path and options
    expect(fsMockControl.mkdirCalls.length).toBeGreaterThan(0)
    const [calledPath, calledOpts] = fsMockControl.mkdirCalls[0]
    expect(calledPath).toContain('/some/new/output-dir')
    expect(calledOpts).toMatchObject({ recursive: true })
  })
})

// ---------------------------------------------------------------------------
// Test 4: batch finds only .bforge files
// ---------------------------------------------------------------------------

describe('batch: filters only .bforge files', () => {
  it('processes a.bforge and b.bforge but not c.txt', async () => {
    const processedPaths = []

    fsMockControl.readdirImpl = async () => ['a.bforge', 'b.bforge', 'c.txt']
    fsMockControl.readFileImpl = async (p, enc) => {
      if (typeof enc === 'string') {
        processedPaths.push(p)
        return '{"version":2,"inputType":"shape","shapeType":"box","colors":["#000000","#ffffff"],"pixelSize":8,"ditherType":"bayer4","fps":4,"frameCount":4,"renderMode":"bitmap","animationEffects":{}}'
      }
      throw new Error(`Unexpected binary read for ${p}`)
    }

    const result = await runCli(['batch', '/fake/dir'])
    expect(result.exitCode).toBe(0)

    // Should have processed exactly 2 .bforge files, not c.txt
    const bforgeReads = processedPaths.filter((p) => p.endsWith('.bforge'))
    expect(bforgeReads).toHaveLength(2)
    expect(bforgeReads.some((p) => p.includes('a.bforge'))).toBe(true)
    expect(bforgeReads.some((p) => p.includes('b.bforge'))).toBe(true)
    expect(processedPaths.some((p) => p.includes('c.txt'))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Test 4b: batch filtering logic — pure unit test (no async, no mocking)
// ---------------------------------------------------------------------------

describe('batch: .bforge filter logic (pure)', () => {
  it('readdirSync returning [a.bforge, b.bforge, c.txt] → only 2 .bforge files', () => {
    const mockEntries = ['a.bforge', 'b.bforge', 'c.txt']
    const bforgeFiles = mockEntries.filter((f) => f.endsWith('.bforge')).map((f) => `/dir/${f}`)
    expect(bforgeFiles).toHaveLength(2)
    expect(bforgeFiles.some((p) => p.includes('a.bforge'))).toBe(true)
    expect(bforgeFiles.some((p) => p.includes('b.bforge'))).toBe(true)
    expect(bforgeFiles.some((p) => p.includes('c.txt'))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Test 5: server.js — all 5 asset paths resolve to existing files
// ---------------------------------------------------------------------------

describe('server.js: asset paths resolve to existing files on disk', () => {
  // Replicate the path computation from server.js:
  //   __dirname of server.js = packages/cli/src/
  //   PKG_ROOT  = resolve(__dirname, '..') = packages/cli/
  //   REPO_ROOT = resolve(PKG_ROOT, '../..') = repo root
  const pkgRoot = resolve(__dirname, '../../')
  const repoRoot = resolve(pkgRoot, '../..')

  it('headless.js exists at dist/headless.js', () => {
    const p = resolve(pkgRoot, 'dist/headless.js')
    expect(existsSync(p), `headless.js not found at ${p}`).toBe(true)
  })

  it('three.module.js exists in root node_modules', () => {
    const p = resolve(repoRoot, 'node_modules/three/build/three.module.js')
    expect(existsSync(p), `three.module.js not found at ${p}`).toBe(true)
  })

  it('upng-js package exists in root node_modules', () => {
    // server.js references upng-js/upng.js (lowercase). The package dir
    // must exist for the server to work (even if the filename case differs
    // on Linux vs macOS).
    const pkgDir = resolve(repoRoot, 'node_modules/upng-js')
    expect(existsSync(pkgDir), `upng-js package dir not found at ${pkgDir}`).toBe(true)
  })

  it('harness.html exists', () => {
    const p = resolve(pkgRoot, 'src/harness.html')
    expect(existsSync(p), `harness.html not found at ${p}`).toBe(true)
  })

  it('harness.js exists', () => {
    const p = resolve(pkgRoot, 'src/harness.js')
    expect(existsSync(p), `harness.js not found at ${p}`).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Integration smoke test (only when INTEGRATION=1)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.INTEGRATION)('integration', () => {
  it(
    'renders a shape .bforge to valid APNG',
    async () => {
      // Preserve the historical 60s outer budget: 40s child + 16s containment + 4s assertions/rm.
      // Explicit owner disposition for P11 only; stage-2 children retain the default 60s deadline.
      const { mkdtemp, rm } = await import('fs/promises')
      const { join } = await import('path')
      const { tmpdir } = await import('os')

      const tmpDir = await mkdtemp(join(tmpdir(), 'bitmapforge-test-'))
      const outFile = join(tmpDir, 'out.apng')
      const fixture = resolve(__dirname, 'fixtures/shape.bforge')
      const indexJs = resolve(__dirname, '../../src/index.js')

      try {
        const result = await runChild(
          process.execPath,
          [indexJs, 'render', fixture, '--format', 'apng', '--out', outFile],
          {
            deadlineMs: LEGACY_CHILD_DEADLINE_MS,
            cwd: tmpDir,
            env: { ...process.env, CI: '1', TMPDIR: tmpDir }
          }
        )
        expect(result.failure, JSON.stringify(result)).toBeNull()
        expect(result.code, result.stderr).toBe(0)

        const { readFile } = await import('fs/promises')
        const data = await readFile(outFile)

        // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
        expect(data[0]).toBe(0x89)
        expect(data[1]).toBe(0x50)
        expect(data[2]).toBe(0x4e)
        expect(data[3]).toBe(0x47)
        expect(data[4]).toBe(0x0d)
        expect(data[5]).toBe(0x0a)
        expect(data[6]).toBe(0x1a)
        expect(data[7]).toBe(0x0a)

        // Must contain acTL chunk (APNG animation control chunk)
        const str = data.toString('latin1')
        expect(str).toContain('acTL')
      } finally {
        await rm(tmpDir, { recursive: true, force: true })
      }
    },
    LEGACY_TEST_TIMEOUT_MS
  )
})
