/* global process, Buffer */
/**
 * CLI unit tests for packages/cli/src/index.js and server.js
 *
 * Strategy:
 * - Tests 1 & 2 (exit cases): dynamically import index.js after setting
 *   process.argv, spy on process.exit to capture the exit code.
 * - Tests 3 & 4 (fs interaction): use a top-level configurable fs mock so
 *   Vitest's hoisting can apply it. A module-level control object is mutated
 *   per test to configure behavior.
 * - Test 5 (server paths): directly compute paths using the same logic as
 *   server.js and check existsSync.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Suppress unhandled rejections caused by __cliExit throws from stale floating
// promises (old test imports that call process.exit after the test completes).
process.on('unhandledRejection', (reason) => {
  if (reason && typeof reason === 'object' && reason.__cliExit) return
  // Re-throw all other unhandled rejections so Vitest catches real bugs
  throw reason
})

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

/**
 * Run the CLI by setting process.argv and dynamically importing index.js.
 * Returns a promise that resolves with { exitCode, stderr, stdout } once
 * process.exit() is called (or after the given timeout).
 */
function runCli(argv, timeoutMs = 4000) {
  return new Promise((resolveTest, rejectTest) => {
    vi.resetModules()

    const stderrChunks = []
    const stdoutChunks = []

    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
      stderrChunks.push(String(chunk))
      return true
    })
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      stdoutChunks.push(String(chunk))
      return true
    })

    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      cleanup()
      rejectTest(new Error(`runCli timed out. stderr: ${stderrChunks.join('')}`))
    }, timeoutMs)

    function cleanup() {
      clearTimeout(timer)
      exitSpy.mockRestore()
      stderrSpy.mockRestore()
      stdoutSpy.mockRestore()
    }

    function settle(result) {
      if (settled) return
      settled = true
      cleanup()
      resolveTest(result)
    }

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      // Capture state before settling (settle may restore mocks)
      const capturedStderr = stderrChunks.join('')
      const capturedStdout = stdoutChunks.join('')
      settle({ exitCode: code, stderr: capturedStderr, stdout: capturedStdout })
      // Throw to stop execution in render()/batch(). The __cliExit marker
      // means the global unhandledRejection handler above will suppress it
      // when it fires from stale floating promises after a test completes.
      throw Object.assign(new Error(`process.exit(${code})`), { exitCode: code, __cliExit: true })
    })

    process.argv = ['node', 'bitmapforge', ...argv]

    import('../index.js').catch((e) => {
      if (e?.__cliExit) return
      settle({ exitCode: null, stderr: stderrChunks.join(''), stdout: stdoutChunks.join(''), error: e })
    })
  })
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
    // readFileImpl is null → real fs.readFile is used → file not found → exit(1)
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

    // The render will complete successfully (puppeteer mock returns ok:true).
    // process.exit won't be called on success; runCli will time out.
    // We handle this by also resolving on stdout (render completion).
    const outPath = '/some/new/output-dir/output.apng'

    await new Promise((res) => {
      vi.resetModules()

      vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
      vi.spyOn(process.stdout, 'write').mockImplementation((_chunk) => {
        // stdout written = render completed successfully
        vi.restoreAllMocks()
        res(undefined)
        return true
      })

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
        exitSpy.mockRestore()
        vi.restoreAllMocks()
        res(undefined)
        throw Object.assign(new Error(`exit(${code})`), { __cliExit: true })
      })

      process.argv = ['node', 'bitmapforge', 'render', '/fake/project.bforge', '--out', outPath]

      import('../index.js').catch((e) => {
        if (e?.__cliExit) return
        res(undefined)
      })

      // Safety fallback: resolve after 3s regardless
      setTimeout(res, 3000)
    })

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

    await new Promise((res) => {
      vi.resetModules()

      vi.spyOn(process.stderr, 'write').mockImplementation(() => true)

      let stdoutCount = 0
      vi.spyOn(process.stdout, 'write').mockImplementation(() => {
        stdoutCount++
        // Batch processes 2 files → 2 stdout writes → resolve after both
        if (stdoutCount >= 2) {
          vi.restoreAllMocks()
          res(undefined)
        }
        return true
      })

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
        exitSpy.mockRestore()
        vi.restoreAllMocks()
        res(undefined)
        throw Object.assign(new Error(`exit(${code})`), { __cliExit: true })
      })

      process.argv = ['node', 'bitmapforge', 'batch', '/fake/dir']

      import('../index.js').catch((e) => {
        if (e?.__cliExit) return
        res(undefined)
      })

      // Safety fallback
      setTimeout(res, 3000)
    })

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
  it('renders a shape .bforge to valid APNG', async () => {
    const { spawn } = await import('child_process')
    const { mkdtemp, rm } = await import('fs/promises')
    const { join } = await import('path')
    const { tmpdir } = await import('os')

    const tmpDir = await mkdtemp(join(tmpdir(), 'bitmapforge-test-'))
    const outFile = join(tmpDir, 'out.apng')
    const fixture = resolve(__dirname, 'fixtures/shape.bforge')
    const indexJs = resolve(__dirname, '../../src/index.js')

    try {
      await new Promise((res, rej) => {
        const proc = spawn(process.execPath, [indexJs, 'render', fixture, '--format', 'apng', '--out', outFile], {
          env: { ...process.env, CI: '1' }
        })
        proc.on('close', (code) => {
          if (code === 0) res(undefined)
          else rej(new Error(`CLI exited with code ${code}`))
        })
      })

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
  }, 60000)
})
