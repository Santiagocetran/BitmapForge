import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import test from 'node:test'

const root = new URL('../../', import.meta.url)
const read = (name) => readFileSync(new URL(name, root), 'utf8')
const policy = {
  engine: JSON.parse(read('package.json')).engines.node,
  lockedEngine: JSON.parse(read('package-lock.json')).packages[''].engines.node,
  nvmrc: read('.nvmrc').trim(),
  workflow: read('.github/workflows/ci.yml'),
  runtime: process.versions.node.split('.')[0]
}

// Intentionally checks this workflow's fixed six-space step structure, not arbitrary YAML.
// A workflow/action-shape change must update this guard rather than silently escape it.
function verify(value) {
  assert.equal(value.engine, '24.x', 'root engine must pin the supported major')
  assert.equal(value.lockedEngine, value.engine, 'lock root must match the package engine')
  assert.equal(value.nvmrc, '24', '.nvmrc must select the same major')
  assert.equal(value.runtime, '24', 'execute verification with the declared runtime')
  const steps = value.workflow.split(/^ {6}- /m).filter((step) => /^uses: actions\/setup-node@v4\s*\n/.test(step))
  assert.equal(steps.length, 5, 'check all five existing setup-node steps')
  assert.doesNotMatch(value.workflow, /^\s*node-version\s*:/m, 'no competing literal or expression selector')
  for (const step of steps) {
    const selectors = [...step.matchAll(/^ {10}node-version-file: '\.nvmrc'\s*$/gm)]
    assert.equal(selectors.length, 1, 'each setup-node step must select .nvmrc exactly once')
  }
}

test('application, lock, local toolchain, CI and execution use Node 24', () => verify(policy))

const mutations = [
  ['lock/root mismatch', { lockedEngine: '20.x' }],
  ['unbounded engine', { engine: '>=24', lockedEngine: '>=24' }],
  ['wrong local major', { nvmrc: '26' }],
  ['mixed CI selector', { workflow: policy.workflow.replace("node-version-file: '.nvmrc'", "node-version: '20'") }],
  ['wrong execution runtime', { runtime: '26' }]
]
for (const [name, mutation] of mutations) {
  test(`policy rejects ${name}`, () => assert.throws(() => verify({ ...policy, ...mutation })))
}
