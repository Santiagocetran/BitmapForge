/* global process */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, mkdtemp, open, unlink, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import net from 'node:net'
import { runChild, CONTAINMENT_BUDGET } from './cli-integration-helpers.js'

export const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../..')
export const CLI = join(ROOT, 'packages/cli/src/index.js')
export const FIXTURES = join(ROOT, 'packages/cli/src/__tests__/fixtures')
export const ENABLED = process.env.INTEGRATION === '1' && process.env.CLI_BROWSER_SLOT === 'stage2'
export const CHILD_TEST_MS = 60000 + CONTAINMENT_BUDGET.teardownMs + 4000
export const DECODE_TEST_MS = 2 * (20000 + CONTAINMENT_BUDGET.teardownMs) + 8000
export const sha = (data) => createHash('sha256').update(data).digest('hex')
export const json = (path, data) => writeFile(path, JSON.stringify(data, null, 2) + '\n')
export function settled(result, code = 0) {
  assert.equal(result.failure, null, JSON.stringify(result))
  assert.equal(result.closeObserved, true)
  assert.deepEqual(result.containmentErrors, [])
  assert.equal(result.emergencyReap, false)
  assert.equal(result.groupAlive, false)
  assert.equal(result.signal, null)
  assert.equal(result.code, code)
}
export async function verifyFreeze() {
  assert.equal(
    sha(await readFile(new URL('./cli-integration-helpers.js', import.meta.url))),
    '255be7ab9c87202d5df2abee8452a9e04aa1dcc99c991d45b5eec5da0f39f635'
  )
  for (const [name, hash] of [
    ['shape-v2.bforge', '44089df7b4d4f4c4b952c102835086c67cb1ab24da3cce85b06800c8942e8751'],
    ['model-v2.bitmapforge', 'e654d3bc6345537c70645d6953d3b735f943e0953c3ef3d1db3ef7f9acf9bafe']
  ])
    assert.equal(sha(await readFile(join(FIXTURES, name))), hash)
}
export async function session(name) {
  await verifyFreeze()
  assert.equal(process.platform, 'linux')
  assert.equal(process.versions.node.split('.')[0], '24')
  const scratch = process.env.TMPDIR
  assert.ok(scratch, 'Set profile scratch TMPDIR; never use system tmp')
  const lock = join(scratch, 'bitmapforge-cli-stage2-browser.lock')
  const handle = await open(lock, 'wx')
  try {
    const dir = await mkdtemp(join(scratch, `bitmapforge-cli-stage2-${name}-`))
    await handle.writeFile(JSON.stringify({ pid: process.pid, dir }))
    const protectedPaths = [
      'package.json',
      'package-lock.json',
      'packages/cli/package.json',
      'packages/embed/package.json',
      'packages/cli/src/index.js',
      'packages/cli/src/server.js',
      'packages/cli/src/harness.js',
      'packages/cli/dist/headless.js',
      'packages/cli/src/__tests__/cli-integration-helpers.js'
    ]
    await json(join(dir, 'manifest.json'), {
      node: process.execPath,
      version: process.version,
      protected: Object.fromEntries(
        await Promise.all(protectedPaths.map(async (p) => [p, sha(await readFile(join(ROOT, p)))]))
      )
    })
    return {
      dir,
      release: async () => {
        await handle.close()
        await unlink(lock)
      }
    }
  } catch (error) {
    await handle.close()
    await unlink(lock)
    throw error
  }
}

// Test-owned preload observes real APIs; it never replaces render/encoder results.
export function observerSource(log, navigationFailure = false) {
  const puppeteerURL = import.meta.resolve('puppeteer')
  return `import puppeteer from ${JSON.stringify(puppeteerURL)};
import http from 'node:http';
import { appendFileSync, readFileSync } from 'node:fs';
const emit = (event, data = {}) => appendFileSync(${JSON.stringify(log)}, JSON.stringify({event, at:Date.now(), ...data})+'\\n');
const servers = new Set();
const listen = http.Server.prototype.listen;
http.Server.prototype.listen = function(...args) { servers.add(this); this.once('listening',()=>emit('listen',this.address())); this.on('request',(req,res)=>{res.once('finish',()=>emit('request',{url:req.url,status:res.statusCode}));}); this.once('close',()=>emit('server-close')); return listen.apply(this,args); };
const launch = puppeteer.launch.bind(puppeteer);
puppeteer.launch = async (...args) => {
 const browser = await launch(...args); emit('browser',{pid:browser.process().pid});
 const descendants = () => { try { const walk = (pid) => { const kids=readFileSync('/proc/'+pid+'/task/'+pid+'/children','utf8').trim().split(/\\s+/).filter(Boolean).map(Number); return kids.flatMap(k=>[k,...walk(k)]); }; emit('descendants',{pids:walk(browser.process().pid)}); } catch(error) {emit('observation-error',{message:error.message});} };
 const timer=setInterval(descendants,100); timer.unref();
 const close=browser.close.bind(browser); browser.close=async()=>{descendants(); try{return await close();}finally{clearInterval(timer);emit('browser-close');}};
 const newPage=browser.newPage.bind(browser); browser.newPage=async()=>{
  const page=await newPage(); page.on('console',msg=>emit('console',{type:msg.type(),text:msg.text()})); page.on('pageerror',error=>emit('pageerror',{message:error.message}));
  await page.evaluateOnNewDocument(()=>{
   const tracks=[],recorders=[],captures=[],loops=[];
   window.__stage2={tracks,recorders,captures,loops};
   const capture=HTMLCanvasElement.prototype.captureStream;
   HTMLCanvasElement.prototype.captureStream=function(...args){const stream=capture.apply(this,args);tracks.push(...stream.getTracks());return stream;};
   const Recorder=window.MediaRecorder; window.MediaRecorder=class extends Recorder {constructor(...args){super(...args);recorders.push(this);}};
  });
  const goto=page.goto.bind(page);page.goto=async(...args)=>{
   ${navigationFailure ? 'await Promise.all([...servers].map(server=>new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()))));' : ''}
   const value=await goto(...args);
   await evaluate(async()=>{
    const {SceneManager}=await import('/headless.js');
    const proto=SceneManager.prototype;
    const loop=proto.getLoopDurationMs;proto.getLoopDurationMs=function(...args){const n=loop.apply(this,args);window.__stage2.loops.push(n);return n;};
    const seek=proto.renderAtTime; proto.renderAtTime=function(...args){window.__stage2.captures.push(args[0]);return seek.apply(this,args);};
   });return value;
  };
  const evaluate=page.evaluate.bind(page);page.evaluate=async(...args)=>{const result=await evaluate(...args);emit('page-state',await evaluate(()=>({loops:window.__stage2.loops,captures:window.__stage2.captures,tracks:window.__stage2.tracks.map(t=>t.readyState),recorders:window.__stage2.recorders.map(r=>r.state)})));return result;};
  return page;
 };return browser;
};`
}
export async function commandCase(base, id, args, { navigationFailure = false, env = {}, cli = CLI } = {}) {
  const dir = join(base, id)
  await mkdir(dir, { recursive: true })
  const tmp = await mkdtemp(join(process.env.TMPDIR, 'c2-'))
  const log = join(dir, 'events.jsonl')
  await writeFile(log, '')
  const observer = join(dir, 'observer.mjs')
  await writeFile(observer, observerSource(log, navigationFailure))
  const childEnv = { ...process.env, TMPDIR: tmp, CI: '1', ...env }
  delete childEnv.PUPPETEER_EXECUTABLE_PATH
  delete childEnv.NODE_OPTIONS
  const result = await runChild(process.execPath, ['--import', observer, cli, ...args], { cwd: dir, env: childEnv })
  await json(join(dir, 'process.json'), {
    ...result,
    env: {
      TMPDIR: tmp,
      CI: '1',
      PUPPETEER_CACHE_DIR: childEnv.PUPPETEER_CACHE_DIR ?? '(default)',
      executableOverride: false
    }
  })
  const events = (await readFile(log, 'utf8'))
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line))
  return { dir, result, events }
}
function alive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    if (error.code === 'ESRCH') return false
    throw error
  }
}
function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port })
    socket.setTimeout(200)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
    socket.once('timeout', () => {
      socket.destroy()
      resolve(true)
    })
  })
}
export async function cleanupEvidence(run) {
  const pids = [
    ...new Set(run.events.flatMap((e) => (e.event === 'browser' ? [e.pid] : e.event === 'descendants' ? e.pids : [])))
  ]
  const ports = run.events.filter((e) => e.event === 'listen').map((e) => e.port)
  // runChild already reserves five seconds for ordinary descendants. No extra grace here.
  const report = {
    pids: pids.map((pid) => ({ pid, alive: alive(pid) })),
    ports: await Promise.all(ports.map(async (port) => ({ port, open: await portOpen(port) })))
  }
  await json(join(run.dir, 'cleanup.json'), report)
  assert.ok(
    report.pids.every((p) => !p.alive),
    JSON.stringify(report)
  )
  assert.ok(
    report.ports.every((p) => !p.open),
    JSON.stringify(report)
  )
  assert.ok(!/Rendering frame \d+\//.test(run.result.stderr), 'Harness has no progress callback calls')
  assert.ok(!/unhandled(?:promise|rejection)|UnhandledPromiseRejection/i.test(run.result.stderr))
  for (const state of run.events.filter((e) => e.event === 'page-state')) {
    assert.ok(state.tracks.every((s) => s === 'ended'))
    assert.ok(state.recorders.every((s) => s === 'inactive'))
  }
}
export function assertRenderEvents(run, fps, format, outputs = 1) {
  const states = run.events.filter((e) => e.event === 'page-state')
  assert.equal(states.length, outputs)
  for (const state of states) {
    assert.ok(state.loops.includes(2094), JSON.stringify(state))
    const count = fps === 10 ? 21 : 25
    assert.equal(state.captures.length, count, 'actual renderAtTime capture count')
    for (const [i, time] of state.captures.entries())
      assert.ok(Math.abs(time - (i / count) * 2094) < 0.000001, 'actual capture schedule')
    if (format === 'webm') {
      assert.ok(state.tracks.length > 0)
      assert.ok(state.recorders.length > 0)
    }
  }
  const allowed = new Set([
    '/harness.html',
    '/harness.js',
    '/headless.js',
    '/three.module.js',
    '/three.core.js',
    '/pako.js',
    '/upng.js'
  ])
  const requests = run.events.filter((e) => e.event === 'request')
  for (const req of requests) {
    if (req.url === '/favicon.ico') {
      assert.equal(req.status, 404)
      continue
    }
    assert.ok(allowed.has(req.url), JSON.stringify(req))
    assert.equal(req.status, 200)
  }
  for (const url of [
    '/harness.html',
    '/harness.js',
    '/headless.js',
    '/three.module.js',
    '/three.core.js',
    ...(format === 'apng' ? ['/pako.js', '/upng.js'] : [])
  ])
    assert.ok(
      requests.some((r) => r.url === url),
      url
    )
  assert.equal(fps === 10 ? 21 : 25, Math.max(12, Math.round((2094 / 1000) * fps)))
}

export function parseApng(buffer) {
  assert.equal(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  let pos = 8,
    width,
    height,
    declared,
    plays,
    ended = false
  const frames = [],
    chunks = []
  let sequence = 0
  while (pos < buffer.length) {
    assert.ok(pos + 12 <= buffer.length, 'truncated chunk')
    const length = buffer.readUInt32BE(pos),
      type = buffer.toString('ascii', pos + 4, pos + 8),
      data = buffer.subarray(pos + 8, pos + 8 + length)
    assert.ok(pos + 12 + length <= buffer.length, 'truncated data')
    chunks.push({ type, length })
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
    }
    if (type === 'acTL') {
      declared = data.readUInt32BE(0)
      plays = data.readUInt32BE(4)
    }
    if (type === 'fcTL') {
      assert.equal(data.readUInt32BE(0), sequence++)
      const frame = {
        width: data.readUInt32BE(4),
        height: data.readUInt32BE(8),
        x: data.readUInt32BE(12),
        y: data.readUInt32BE(16),
        num: data.readUInt16BE(20),
        den: data.readUInt16BE(22) || 100,
        dispose: data[24],
        blend: data[25]
      }
      assert.ok(frame.num > 0)
      assert.ok(frame.x + frame.width <= width && frame.y + frame.height <= height)
      assert.ok(frame.dispose <= 2 && frame.blend <= 1)
      frame.delayMs = (1000 * frame.num) / frame.den
      frames.push(frame)
    }
    if (type === 'fdAT') assert.equal(data.readUInt32BE(0), sequence++)
    pos += 12 + length
    if (type === 'IEND') {
      ended = true
      break
    }
  }
  assert.ok(ended)
  assert.equal(pos, buffer.length)
  assert.equal(declared, frames.length)
  assert.ok(declared > 1)
  return { width, height, declared, plays, frames, chunks, durationMs: frames.reduce((n, f) => n + f.delayMs, 0) }
}
export function rgbaStats(raw, width, height) {
  const size = width * height * 4
  assert.equal(raw.length % size, 0)
  const count = raw.length / size
  assert.ok(count > 1)
  const indices = [...new Set([0, Math.floor(count / 2), count - 1])],
    samples = []
  const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b
  for (const index of indices) {
    let foreground = 0,
      opaque = 0,
      sum = 0,
      sum2 = 0
    const bins = new Map()
    for (let p = index * size; p < (index + 1) * size; p += 4) {
      const [r, g, b, a] = raw.subarray(p, p + 4),
        y = luma(r, g, b)
      sum += y
      sum2 += y * y
      if (a >= 250) opaque++
      if (a >= 250 && Math.max(Math.abs(r - 16), Math.abs(g - 24), Math.abs(b - 32)) > 24) foreground++
      const key = [r >> 5, g >> 5, b >> 5].join(',')
      bins.set(key, (bins.get(key) || 0) + 1)
    }
    const pixels = width * height,
      meaningful = [...bins]
        .filter(([, n]) => n / pixels >= 0.005)
        .map(([key, n]) => ({ rgb: key.split(',').map((v) => Number(v) * 32 + 16), fraction: n / pixels }))
    const separated = meaningful.some((a, i) =>
      meaningful.slice(i + 1).some((b) => Math.hypot(...a.rgb.map((v, k) => v - b.rgb[k])) >= 48)
    )
    samples.push({
      index,
      occupancy: foreground / pixels,
      opaque: opaque / pixels,
      lumaStddev: Math.sqrt(Math.max(0, sum2 / pixels - (sum / pixels) ** 2)),
      meaningful,
      separated
    })
  }
  const changes = []
  // Compare all beginning/middle/end pairs, not a requirement that both transitions move.
  for (let i = 0; i < indices.length; i++) {
    for (let j = i + 1; j < indices.length; j++) {
      let changed = 0
      for (let p = 0; p < size; p += 4) {
        const a = indices[i] * size + p,
          b = indices[j] * size + p
        if (Math.abs(luma(raw[a], raw[a + 1], raw[a + 2]) - luma(raw[b], raw[b + 1], raw[b + 2])) > 16) changed++
      }
      changes.push({ from: indices[i], to: indices[j], fraction: changed / (width * height) })
    }
  }
  return { count, samples, changes }
}
export function assertPixels(stats) {
  for (const sample of stats.samples) {
    assert.ok(sample.opaque >= 0.99, 'transparent output')
    assert.ok(sample.occupancy >= 0.01, JSON.stringify(sample))
    assert.ok(sample.separated, 'fewer than two separated meaningful colors')
    assert.ok(sample.lumaStddev >= 5, JSON.stringify(sample))
  }
  assert.ok(
    stats.changes.some((change) => change.fraction >= 0.005),
    `no qualifying separated-frame change: ${JSON.stringify(stats.changes)}`
  )
}
export function assertBatchProcessing(stderr, input) {
  const messages = stderr.split(/\r?\n/).filter((line) => line.startsWith('Processing:'))
  assert.deepEqual(
    messages.sort(),
    ['a.bforge', 'b.bitmapforge'].map((name) => `Processing: ${join(input, name)}`).sort()
  )
  assert.ok(!stderr.includes(`Processing: ${join(input, 'notes.txt')}`), 'ignored notes must not be processed')
}
export function webmTiming(probe, fps) {
  const streams = probe.streams.filter((s) => s.codec_type === 'video')
  assert.equal(streams.length, 1)
  const stream = streams[0]
  assert.match(stream.codec_name, /^vp[89]$|^av1$/)
  assert.equal(stream.width % 2, 0)
  assert.equal(stream.height % 2, 0)
  const frames = (probe.frames || probe.packets_and_frames?.filter((e) => e.type === 'frame') || []).filter(
    (f) => f.media_type === 'video'
  )
  const packets = (probe.packets || probe.packets_and_frames?.filter((e) => e.type === 'packet') || []).filter(
    (p) => p.stream_index === stream.index
  )
  const times = frames.map((f) => Number(f.best_effort_timestamp_time ?? f.pts_time))
  assert.ok(times.length > 1)
  for (let i = 0; i < times.length; i++) {
    assert.ok(Number.isFinite(times[i]))
    if (i) assert.ok(times[i] > times[i - 1], 'nonmonotonic video timestamps')
  }
  const intervals = times.slice(1).map((t, i) => t - times[i])
  const estimated = !(Number(frames.at(-1).pkt_duration_time) > 0 || Number(packets.at(-1)?.duration_time) > 0)
  const lastInterval =
    Number(frames.at(-1).pkt_duration_time) ||
    Number(packets.at(-1)?.duration_time) ||
    intervals.reduce((a, b) => a + b, 0) / intervals.length
  const durationMs = (times.at(-1) + lastInterval - times[0]) * 1000,
    cadence = (times.length - 1) / (times.at(-1) - times[0])
  assert.ok(Math.abs(durationMs - 2094) <= Math.max(250, 2094 * 0.2), JSON.stringify({ durationMs }))
  assert.ok(Math.abs(cadence - fps) <= fps * 0.25, JSON.stringify({ cadence, fps }))
  return {
    width: stream.width,
    height: stream.height,
    count: times.length,
    times,
    durationMs,
    cadence,
    lastInterval,
    estimatedLastInterval: estimated,
    packets: packets.length
  }
}
export async function decoder(command, args, dir, name) {
  const result = await runChild(command, args, { deadlineMs: 20000, cwd: dir })
  await json(join(dir, `${name}.process.json`), result)
  settled(result)
  return result
}
export async function analyzeArtifact(file, { format, width, height, fps }, dir) {
  await mkdir(dir, { recursive: true })
  let structure
  if (format === 'apng') structure = parseApng(await readFile(file))
  else {
    const probe = await decoder(
      'ffprobe',
      ['-v', 'error', '-select_streams', 'v:0', '-show_streams', '-show_frames', '-show_packets', '-of', 'json', file],
      dir,
      'ffprobe'
    )
    const data = JSON.parse(probe.stdout)
    await json(join(dir, 'ffprobe.json'), data)
    structure = webmTiming(data, fps)
  }
  await json(join(dir, 'structure.json'), structure)
  assert.equal(structure.width, width)
  assert.equal(structure.height, height)
  if (format === 'apng') {
    const captures = fps === 10 ? 21 : 25,
      delay = fps === 10 ? 100 : 83
    assert.ok(structure.declared <= captures)
    assert.ok(Math.abs(structure.durationMs - captures * delay) <= captures, 'coalesced duration does not reconcile')
    for (const frame of structure.frames)
      assert.ok(
        Math.abs(frame.delayMs / delay - Math.round(frame.delayMs / delay)) * delay <= 1,
        'delay not a capture multiple'
      )
  }
  const raw = join(dir, 'composited.rgba')
  await decoder(
    'ffmpeg',
    [
      '-v',
      'error',
      '-nostdin',
      '-y',
      ...(format === 'apng' ? ['-ignore_loop', '1'] : []),
      '-i',
      file,
      '-map',
      '0:v:0',
      '-an',
      '-fps_mode',
      'passthrough',
      '-frames:v',
      '200',
      '-pix_fmt',
      'rgba',
      '-f',
      'rawvideo',
      raw
    ],
    dir,
    'ffmpeg'
  )
  const info = await stat(raw)
  assert.ok(info.size <= width * height * 4 * 200)
  const bytes = await readFile(raw),
    stats = rgbaStats(bytes, width, height)
  await json(join(dir, 'pixels.json'), {
    ...stats,
    rawSha256: sha(bytes),
    artifactSha256: sha(await readFile(file)),
    artifactBytes: (await stat(file)).size
  })
  assert.equal(stats.count, format === 'apng' ? structure.declared : structure.count)
  assertPixels(stats)
  return { structure, stats, rawSha256: sha(bytes) }
}
export async function benignDecoderFixture(dir, format) {
  await mkdir(dir, { recursive: true })
  // Real moving testsrc, solely decoder self-test; never CLI acceptance data.
  const file = join(dir, `benign.${format}`)
  await decoder(
    'ffmpeg',
    [
      '-v',
      'error',
      '-nostdin',
      '-y',
      '-f',
      'lavfi',
      '-i',
      'testsrc2=size=64x48:rate=10:duration=2.1',
      ...(format === 'apng' ? ['-plays', '0', '-f', 'apng'] : ['-c:v', 'libvpx', '-deadline', 'realtime']),
      file
    ],
    dir,
    'generate-benign'
  )
  return file
}
