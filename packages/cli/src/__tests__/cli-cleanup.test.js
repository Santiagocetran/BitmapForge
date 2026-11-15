/* global process */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EventEmitter } from 'node:events'
import {
  runChild,
  CONTAINMENT_BUDGET,
  LEGACY_CHILD_DEADLINE_MS,
  LEGACY_TEST_TIMEOUT_MS,
  LEGACY_FINALIZATION_MARGIN_MS
} from './cli-integration-helpers.js'

const mocks = vi.hoisted(() => ({ events: [], fail: new Set(), entries: [], writes: [] }))
function step(name, value) {
  mocks.events.push(name)
  if (mocks.fail.has(name)) throw new Error(`fixture ${name}`)
  return value
}
vi.mock('fs/promises', () => ({
  readFile: async (path) => step(`read:${path}`, '{}'),
  mkdir: async () => step('mkdir'),
  writeFile: async (path, data) => {
    step('write')
    mocks.writes.push({ path, data: data.toString() })
  },
  readdir: async () => step('readdir', mocks.entries)
}))
vi.mock('../server.js', () => ({
  start: async () =>
    step('start', {
      url: 'http://127.0.0.1:9999',
      close: async () => step('server.close')
    })
}))
vi.mock('puppeteer', () => ({
  default: {
    launch: async () =>
      step('launch', {
        close: async () => step('browser.close'),
        newPage: async () =>
          step('newPage', {
            on: () => {},
            exposeFunction: async () => step('expose'),
            goto: async () => step('goto'),
            evaluate: async () =>
              step(
                'evaluate',
                mocks.fail.has('result') ? { ok: false, error: 'fixture result' } : { ok: true, base64: 'YWJj' }
              )
          })
      })
  }
}))
let oldArgv, oldCode, stderr, stdout
beforeEach(() => {
  oldArgv = process.argv
  oldCode = process.exitCode
  mocks.events = []
  mocks.fail = new Set()
  mocks.entries = ['a.bforge', 'b.bitmapforge', 'notes.txt']
  mocks.writes = []
  stderr = ''
  stdout = ''
  vi.spyOn(process.stderr, 'write').mockImplementation((data) => {
    stderr += data
    return true
  })
  vi.spyOn(process.stdout, 'write').mockImplementation((data) => {
    stdout += data
    return true
  })
})
afterEach(() => {
  process.argv = oldArgv
  process.exitCode = oldCode
  vi.restoreAllMocks()
})
async function run(args = ['render', '/fixture.bforge']) {
  process.argv = ['node', 'cli', ...args]
  process.exitCode = undefined
  vi.resetModules()
  await import('../index.js')
  return process.exitCode || 0
}
describe('awaited CLI ownership', () => {
  it.each(['start', 'launch', 'newPage', 'expose', 'goto', 'evaluate', 'result', 'write'])(
    'settled %s failure closes acquired owners',
    async (name) => {
      mocks.fail.add(name)
      expect(await run()).toBe(1)
      expect(stderr).toContain(`fixture ${name}`)
      expect(stdout).toBe('')
      expect(mocks.events.includes('server.close')).toBe(name !== 'start')
      expect(mocks.events.includes('browser.close')).toBe(!['start', 'launch'].includes(name))
    }
  )
  it.each(['browser.close', 'server.close'])('fails success on %s rejection but tries both', async (name) => {
    mocks.fail.add(name)
    expect(await run()).toBe(1)
    expect(stderr).toContain(`Failed to close ${name.split('.')[0]}`)
    expect(mocks.events.slice(-2)).toEqual(['browser.close', 'server.close'])
    expect(stdout).toContain('.apng')
  })
  it('retains primary with both secondary close errors', async () => {
    mocks.fail = new Set(['goto', 'browser.close', 'server.close'])
    expect(await run()).toBe(1)
    for (const text of ['fixture goto', 'Failed to close browser', 'Failed to close server'])
      expect(stderr).toContain(text)
    expect(mocks.events.slice(-2)).toEqual(['browser.close', 'server.close'])
  })
  it('keeps launch primary when server close fails', async () => {
    mocks.fail = new Set(['launch', 'server.close'])
    expect(await run()).toBe(1)
    expect(stderr).toContain('Failed to launch browser: fixture launch')
    expect(stderr).toContain('Failed to close server')
  })
  it('awaits all cleanup before successful dispatch completion; no invented progress', async () => {
    expect(await run()).toBe(0)
    expect(mocks.events.slice(-3)).toEqual(['write', 'browser.close', 'server.close'])
    expect(stdout).toMatch(/^.*\.apng\n$/)
    expect(stderr).not.toContain('Rendering frame')
  })
  it('batch preserves ordered fail-fast and completed artifacts', async () => {
    mocks.entries = ['a.bforge', 'b.bitmapforge', 'later.bforge', 'notes.txt']
    mocks.fail.add('read:/fixtures/b.bitmapforge')
    expect(await run(['batch', '/fixtures'])).toBe(1)
    expect(mocks.events.filter((s) => s.startsWith('read:'))).toEqual([
      'read:/fixtures/a.bforge',
      'read:/fixtures/b.bitmapforge'
    ])
    expect(mocks.events.filter((s) => s === 'write')).toHaveLength(1)
    expect(mocks.writes).toEqual([{ path: '/fixtures/out/a.apng', data: 'abc' }])
    expect(stdout).toBe('/fixtures/out/a.apng\n')
    expect(stderr).toContain('Error: cannot read file "/fixtures/b.bitmapforge"')
    expect(stderr).not.toContain('later.bforge')
    expect(mocks.events).not.toContain('read:/fixtures/later.bforge')
    expect(mocks.events.filter((s) => s === 'launch')).toHaveLength(1)
    expect(mocks.events.filter((s) => s === 'start')).toHaveLength(1)
    expect(mocks.events.filter((s) => s === 'browser.close')).toHaveLength(1)
    expect(mocks.events.filter((s) => s === 'server.close')).toHaveLength(1)
    // The first render is fully cleaned up before the failing second read; dispatch settles afterward.
    expect(mocks.events.slice(-3)).toEqual(['browser.close', 'server.close', 'read:/fixtures/b.bitmapforge'])
  })
  it.each([{ args: [] }, { args: ['render'] }, { args: ['batch'] }])(
    'reports usage without resources $args',
    async ({ args }) => {
      expect(await run(args)).toBe(1)
      expect(stderr).toContain('Usage:')
      expect(mocks.events).toEqual([])
    }
  )
})

describe('test-owned subprocess containment (not application cancellation)', () => {
  it('reserves explicit teardown and finalization inside the unchanged legacy outer budget', () => {
    const { descendantGraceMs, termGraceMs, closeWaitMs, postKillPollMs, teardownMs } = CONTAINMENT_BUDGET
    expect(teardownMs).toBe(descendantGraceMs + termGraceMs + closeWaitMs + postKillPollMs)
    expect(termGraceMs).toBe(5000)
    expect(LEGACY_TEST_TIMEOUT_MS).toBe(60000)
    expect(LEGACY_FINALIZATION_MARGIN_MS).toBeGreaterThanOrEqual(4000)
    expect(LEGACY_CHILD_DEADLINE_MS + teardownMs + LEGACY_FINALIZATION_MARGIN_MS).toBeLessThanOrEqual(
      LEGACY_TEST_TIMEOUT_MS
    )
  })
  it('records ordinary success', async () => {
    const result = await runChild(process.execPath, ['-e', 'console.log("owned")'])
    expect(result).toMatchObject({ code: 0, failure: null, emergencyReap: false, groupAlive: false, stdout: 'owned\n' })
  })
  it('records spawn failure', async () => {
    const result = await runChild('/nonexistent/bitmapforge-test-binary', [])
    expect(result.failure).toContain('spawn:')
    expect(result.groupAlive).toBe(false)
  })
  it('bounds missing close after reap and retains the primary failure and containment diagnostics', async () => {
    // Fault injection only: no OS process or signal. Exercises the otherwise unbounded close await.
    const child = new EventEmitter()
    child.pid = 99999999
    child.stdout = new EventEmitter()
    child.stderr = new EventEmitter()
    child.stdout.destroy = vi.fn()
    child.stderr.destroy = vi.fn()
    child.unref = vi.fn()
    vi.spyOn(process, 'kill').mockImplementation(() => {
      throw Object.assign(new Error('gone'), { code: 'ESRCH' })
    })
    vi.doMock('node:child_process', () => ({ spawn: () => child }))
    try {
      vi.resetModules()
      const { runChild: runWithoutClose } = await import('./cli-integration-helpers.js')
      const result = await runWithoutClose('injected-no-close', [], { deadlineMs: 10 })
      expect(result).toMatchObject({
        failure: 'deadline exceeded',
        code: null,
        signal: null,
        closeObserved: false,
        containmentErrors: ['child close not observed after emergency reap'],
        emergencyReap: true,
        groupAlive: false
      })
      expect(child.stdout.destroy).toHaveBeenCalledOnce()
      expect(child.stderr.destroy).toHaveBeenCalledOnce()
      expect(child.unref).toHaveBeenCalledOnce()
      expect(result.elapsedMs).toBeGreaterThanOrEqual(CONTAINMENT_BUDGET.closeWaitMs)
      expect(result.elapsedMs).toBeLessThan(3000)
    } finally {
      vi.doUnmock('node:child_process')
      vi.resetModules()
    }
  })
  it('does not treat a deadline-triggered TERM handler exiting zero as success', async () => {
    const result = await runChild(
      process.execPath,
      ['-e', 'process.on("SIGTERM",()=>process.exit(0));console.log("ready");setInterval(()=>{},1000)'],
      { deadlineMs: 500 }
    )
    expect(result).toMatchObject({
      failure: 'deadline exceeded',
      code: 0,
      signal: null,
      closeObserved: true,
      containmentErrors: [],
      emergencyReap: true,
      groupAlive: false,
      stdout: 'ready\n'
    })
  })
  it('awaits TERM-resistant child KILL and close without converting deadline failure to success', async () => {
    const deadlineMs = 500
    const result = await runChild(
      process.execPath,
      ['-e', 'process.on("SIGTERM",()=>{});console.log("ready");console.error("retained");setInterval(()=>{},1000)'],
      { deadlineMs }
    )
    expect(result).toMatchObject({
      failure: 'deadline exceeded',
      code: null,
      signal: 'SIGKILL',
      emergencyReap: true,
      closeObserved: true,
      containmentErrors: [],
      groupAlive: false,
      stdout: 'ready\n',
      stderr: 'retained\n',
      stdoutBytes: 6,
      stderrBytes: 9
    })
    expect(result.pid).toBeGreaterThan(0)
    expect(result.elapsedMs).toBeGreaterThanOrEqual(deadlineMs + CONTAINMENT_BUDGET.termGraceMs)
    expect(result.elapsedMs).toBeLessThan(deadlineMs + CONTAINMENT_BUDGET.teardownMs)
    expect(() => process.kill(-result.pid, 0)).toThrow(/ESRCH/)
  }, 20000)
  it.each([
    ['deadline exceeded', 'setInterval(()=>{},1000)', { deadlineMs: 100 }],
    ['stdout overflow', 'process.stdout.write("x".repeat(4096));setInterval(()=>{},1000)', { outputCap: 32 }],
    ['stderr overflow', 'process.stderr.write("x".repeat(4096));setInterval(()=>{},1000)', { outputCap: 32 }]
  ])(
    'fails and reaps its own group on %s',
    async (failure, script, options) => {
      const result = await runChild(process.execPath, ['-e', script], options)
      expect(result.failure).toBe(failure)
      expect(result.closeObserved).toBe(true)
      expect(result.containmentErrors).toEqual([])
      expect(result.emergencyReap).toBe(true)
      expect(result.groupAlive).toBe(false)
    },
    15000
  )
})
