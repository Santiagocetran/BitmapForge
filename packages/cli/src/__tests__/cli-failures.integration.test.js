/* global process */
import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { mkdir, writeFile, readFile, copyFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runChild } from './cli-integration-helpers.js'
import {
  ENABLED,
  ROOT,
  FIXTURES,
  CHILD_TEST_MS,
  session,
  settled,
  commandCase,
  cleanupEvidence,
  json
} from './cli-stage2-evidence.js'

const S = join(FIXTURES, 'shape-v2.bforge')
describe.skipIf(!ENABLED).sequential('dedicated CLI F01–F11 (serial owned subprocesses)', () => {
  let owner
  beforeAll(async () => {
    owner = await session('failures')
  })
  afterAll(async () => {
    await owner?.release()
  })
  async function failure(id, args, pattern, options = {}, postlaunch = false) {
    const run = await commandCase(owner.dir, id, args, options)
    await cleanupEvidence(run)
    settled(run.result, 1)
    expect(run.result.stdout).toBe('')
    expect(run.result.stderr).toMatch(pattern)
    if (postlaunch) {
      expect(run.events.some((e) => e.event === 'browser')).toBe(true)
      expect(run.events.some((e) => e.event === 'browser-close')).toBe(true)
      expect(run.events.some((e) => e.event === 'server-close')).toBe(true)
    }
    expect(
      await stat(join(run.dir, 'shape-v2.apng')).then(
        () => true,
        () => false
      )
    ).toBe(false)
    return run
  }
  it.each([
    ['F01-target', ['render'], /Usage:.*render/],
    ['F01-file', ['render', 'absent.bforge'], /cannot read file/],
    ['F01-format', ['render', S, '--format', 'gif'], /Unsupported format.*gif/]
  ])(
    '%s actionable prelaunch error',
    async (id, args, pattern) => {
      const run = await failure(id, args, pattern)
      expect(run.events.some((e) => e.event === 'browser')).toBe(false)
    },
    CHILD_TEST_MS
  )
  for (const [id, content] of [
    ['F02-json', '{'],
    ['F02-version', '{"settings":{},"model":null}']
  ])
    it(
      `${id} real returned render error closes browser/server`,
      async () => {
        const file = join(owner.dir, `${id}.bforge`)
        await writeFile(file, content)
        await failure(id, ['render', file, '--out', 'shape-v2.apng'], /Render failed:/, {}, true)
      },
      CHILD_TEST_MS
    )
  it(
    'F03-empty batch',
    async () => {
      const dir = join(owner.dir, 'empty')
      await mkdir(dir)
      await failure('F03-empty', ['batch', dir], /No .* files found/)
    },
    CHILD_TEST_MS
  )
  it(
    'F03-missing default preserves created target/out then empty',
    async () => {
      const dir = join(owner.dir, 'absent-default')
      await failure('F03-default', ['batch', dir], /No .* files found/)
      expect((await stat(join(dir, 'out'))).isDirectory()).toBe(true)
    },
    CHILD_TEST_MS
  )
  it(
    'F03-missing explicit external output cannot-read',
    async () => {
      await failure(
        'F03-external',
        ['batch', join(owner.dir, 'absent-explicit'), '--out', join(owner.dir, 'external-out')],
        /cannot read directory/
      )
    },
    CHILD_TEST_MS
  )
  it(
    'F04 empty isolated cache causes real launch failure and closes server',
    async () => {
      const cache = join(owner.dir, 'empty-cache')
      await mkdir(cache)
      const run = await failure('F04', ['render', S], /Failed to launch browser/, {
        env: { PUPPETEER_CACHE_DIR: cache }
      })
      expect(run.events.some((e) => e.event === 'listen')).toBe(true)
      expect(run.events.some((e) => e.event === 'server-close')).toBe(true)
      expect(run.events.some((e) => e.event === 'browser')).toBe(false)
    },
    CHILD_TEST_MS
  )
  it(
    'F04 recovery uses original existing cache, no installer',
    async () => {
      const run = await commandCase(owner.dir, 'F04-recovery', ['render', S])
      await cleanupEvidence(run)
      settled(run.result)
      expect(run.result.stdout.trim()).toBe(join(run.dir, 'shape-v2.apng'))
      expect((await stat(join(run.dir, 'shape-v2.apng'))).size).toBeGreaterThan(0)
    },
    CHILD_TEST_MS
  )
  it(
    'F05 seven actual missing assets + raw unknown URLs + poststart unreadable in disposable copied tree',
    async () => {
      const dir = join(owner.dir, 'F05'),
        tree = join(dir, 'tree')
      await mkdir(join(tree, 'packages/cli/src'), { recursive: true })
      const assets = [
        ['/harness.html', 'packages/cli/src/harness.html'],
        ['/harness.js', 'packages/cli/src/harness.js'],
        ['/headless.js', 'packages/cli/dist/headless.js'],
        ['/three.module.js', 'node_modules/three/build/three.module.js'],
        ['/three.core.js', 'node_modules/three/build/three.core.js'],
        ['/pako.js', 'node_modules/pako/dist/pako.min.js'],
        ['/upng.js', 'node_modules/upng-js/UPNG.js']
      ]
      for (const [, path] of assets) {
        const dest = join(tree, path)
        await mkdir(join(dest, '..'), { recursive: true })
        await copyFile(join(ROOT, path), dest)
      }
      await copyFile(join(ROOT, 'packages/cli/src/server.js'), join(tree, 'packages/cli/src/server.mjs'))
      const script = join(dir, 'probe.mjs')
      await writeFile(
        script,
        `import assert from 'node:assert/strict';import http from 'node:http';import {rename,readFile,writeFile} from 'node:fs/promises';import {start} from ${JSON.stringify(pathToFileURL(join(tree, 'packages/cli/src/server.mjs')).href)};
const assets=${JSON.stringify(assets.map(([r, p]) => [r, join(tree, p)]))};const evidence=[];
for(const [route,path]of assets){await rename(path,path+'.held');try{await assert.rejects(start(),error=>error.message.includes(route));evidence.push({missing:route,rejected:true});}finally{await rename(path+'.held',path);}}
const server=await start();const request=path=>new Promise((resolve,reject)=>{const req=http.get({host:'127.0.0.1',port:server.port,path},res=>{let body='';res.on('data',b=>body+=b);res.on('end',()=>resolve({status:res.statusCode,body,type:res.headers['content-type']}));});req.on('error',reject);});
try{for(const path of ['/','/assets/font.js','/toString','/__proto__','/headless.js?x=1','/%2e%2e/package.json','/../package.json']){const response=await request(path);assert.equal(response.status,404);assert.equal(response.body,'Not found');evidence.push({path,...response});}
const path=assets[0][1];await rename(path,path+'.held');try{const response=await request(assets[0][0]);assert.equal(response.status,500);assert.equal(response.body,'Error reading file');evidence.push(response);}finally{await rename(path+'.held',path);}
}finally{await server.close();}await writeFile(${JSON.stringify(join(dir, 'routes.json'))},JSON.stringify(evidence,null,2));console.log('seven missing assets; raw 404; read500; real closed server');`
      )
      const result = await runChild(process.execPath, [script], { cwd: dir })
      await json(join(dir, 'process.json'), result)
      settled(result)
      expect(JSON.parse(await readFile(join(dir, 'routes.json'), 'utf8')).filter((e) => e.rejected)).toHaveLength(7)
    },
    CHILD_TEST_MS
  )
  it(
    'F06 invalid.bad embedded harmless payload fails real loader after launch',
    async () => {
      const model = JSON.parse(await readFile(join(FIXTURES, 'model-v2.bitmapforge'), 'utf8'))
      model.model.name = 'invalid.bad'
      const file = join(owner.dir, 'invalid.bitmapforge')
      await writeFile(file, JSON.stringify(model))
      await failure(
        'F06',
        ['render', file, '--out', 'shape-v2.apng'],
        /Render failed:.*(?:unsupported|format)/i,
        {},
        true
      )
    },
    CHILD_TEST_MS
  )
  it(
    'F07 mkdir output parent is a file',
    async () => {
      const dir = join(owner.dir, 'F07-mkdir')
      await mkdir(dir)
      await writeFile(join(dir, 'parent'), 'file')
      await failure('F07-mkdir', ['render', S, '--out', 'parent/artifact.apng'], /ENOTDIR|EEXIST/)
    },
    CHILD_TEST_MS
  )
  it(
    'F07 write existing directory fails after real render',
    async () => {
      const dir = join(owner.dir, 'F07-write')
      await mkdir(join(dir, 'directory'), { recursive: true })
      await failure('F07-write', ['render', S, '--out', 'directory'], /EISDIR/, {}, true)
    },
    CHILD_TEST_MS
  )
  it(
    'F08 real navigation refusal from test-owned server-close wrapper',
    async () => {
      await failure('F08', ['render', S], /ERR_CONNECTION_REFUSED|net::ERR/, { navigationFailure: true }, true)
    },
    CHILD_TEST_MS
  )
  // Existing accepted suites retain exact injected branch cases, fail-fast mutation-sensitive
  // ordering and real benign timeout/overflow reaping. Run them as owned serial children.
  for (const [id, file] of [
    ['F09-F11', 'cli-cleanup.test.js'],
    ['F10', 'harness.test.js']
  ])
    it(
      `${id} retained accepted injected/helper branches`,
      async () => {
        const dir = join(owner.dir, id)
        await mkdir(dir)
        const result = await runChild(
          process.execPath,
          [
            join(ROOT, 'node_modules/vitest/vitest.mjs'),
            'run',
            `src/__tests__/${file}`,
            '--maxWorkers=1',
            '--no-file-parallelism'
          ],
          { cwd: join(ROOT, 'packages/cli'), env: { ...process.env, INTEGRATION: '', CLI_BROWSER_SLOT: '' } }
        )
        await json(join(dir, 'process.json'), result)
        settled(result)
        expect(result.stdout).toMatch(/\d+ passed/)
        expect(result.stdout).not.toMatch(/no tests found/i)
      },
      CHILD_TEST_MS
    )
})
