import { execFile } from 'node:child_process'
import process from 'node:process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const exec = promisify(execFile)
const probe = fileURLToPath(new URL('./fixtures/ftp-probe.js', import.meta.url))
const scenarios = [
  'epsv',
  'pasv',
  'fallback',
  'cache',
  'missing',
  'fallback-missing',
  'proto',
  'listing-limit',
  'multiline',
  'separate-host',
  ...['path', 'user', 'password'].flatMap((target) => ['crlf', 'nul'].map((control) => `invalid-${target}-${control}`))
]

describe('locked get-uri FTP adapter security and compatibility', () => {
  it.each(scenarios)('%s (real loopback peer, isolated process)', async (scenario) => {
    const { stdout, stderr } = await exec(process.execPath, [probe, scenario], {
      timeout: 3000,
      maxBuffer: 128 * 1024
    })
    expect(stderr).toBe('')
    expect(JSON.parse(stdout).scenario).toBe(scenario)
  })
})
