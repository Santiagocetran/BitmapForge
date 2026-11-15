import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { createRequire } from 'node:module'
import process from 'node:process'
import net from 'node:net'
import { startFtp } from './ftp-server.js'

const require = createRequire(import.meta.url)
const { getUri } = require('get-uri')
const ftpRequire = createRequire(require.resolve('get-uri'))
const { Client } = ftpRequire('basic-ftp')
const scenario = process.argv[2]
let forbiddenConnections = 0
const originalConnect = net.Socket.prototype.connect
// A failed security assertion must never turn this test into an external scan.
net.Socket.prototype.connect = function (...args) {
  const host = typeof args[0] === 'object' ? args[0].host : args[1]
  if (host && host !== '127.0.0.1') {
    forbiddenConnections++
    throw new Error('fixture blocked non-loopback connection')
  }
  return originalConnect.apply(this, args)
}
const options = {
  pasv: ['pasv', 'separate-host'].includes(scenario),
  separateHost: scenario === 'separate-host',
  fallback: ['fallback', 'proto', 'listing-limit', 'fallback-missing'].includes(scenario),
  missing: scenario === 'missing',
  proto: scenario === 'proto',
  multiline: scenario === 'multiline'
}
const peer = await startFtp(options)
const base = `ftp://user:synthetic-secret@127.0.0.1:${peer.port}`
const url = `${base}/${scenario === 'fallback-missing' ? 'absent.txt' : 'file.txt'}`
const fetch = (uri = url, opts = {}) => getUri(uri, opts)
const consume = async (stream) => {
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks).toString()
}
let result
try {
  if (scenario.startsWith('invalid-')) {
    const [, target, control] = scenario.split('-')
    const token = control === 'nul' ? '%00' : '%0D%0ANOOP%20INJECTED'
    let invalid
    if (target === 'path') invalid = `${base}/file.txt${token}`
    if (target === 'user') invalid = `ftp://user${token}:synthetic-secret@127.0.0.1:${peer.port}/file.txt`
    if (target === 'password') invalid = `ftp://user:synthetic-secret${token}@127.0.0.1:${peer.port}/file.txt`
    let error
    try {
      await consume(await fetch(invalid))
    } catch (caught) {
      error = caught
    }
    assert.equal(
      peer.commands.some((command) => command === 'NOOP INJECTED'),
      false,
      'injected FTP command reached peer'
    )
    assert.ok(error, 'control characters must reject')
    if (target === 'path') assert.equal(error.code, 'ENOTFOUND')
    else assert.match(error.message, /control|invalid|character/i)
    assert.equal(String(error.stack).includes('synthetic-secret'), false, 'password exposed in rejection')
    assert.equal(
      peer.commands.some((command) => command.includes('\0')),
      false,
      'NUL reached peer'
    )
    result = { rejected: true, injectionObserved: false, passwordLeaked: false }
  } else if (scenario === 'multiline') {
    await assert.rejects(fetch(), /control response|response.*(long|limit|large)|maximum/i)
    result = { rejected: true }
  } else if (scenario === 'listing-limit') {
    const client = new Client(1000, { maxListingBytes: 16 })
    try {
      await client.access({ host: '127.0.0.1', port: peer.port })
      await assert.rejects(client.list('/'), /limit|maximum|exceed/i)
    } finally {
      client.close()
    }
    result = { rejected: true }
  } else if (scenario === 'separate-host') {
    // Use the real adapter's pre-download listing path: get-uri has no download
    // rejection handler, so don't trigger its unrelated unhandled-promise defect.
    options.fallback = true
    // The peer captured the same mutable options object.
    await assert.rejects(fetch(), /another host|separate transfer/i)
    assert.equal(peer.dataConnections, 0, 'must reject before connecting to second loopback host')
    assert.equal(forbiddenConnections, 0, 'security guard must not be the reason for rejection')
    result = { rejected: true, dataConnections: peer.dataConnections }
  } else if (['missing', 'fallback-missing'].includes(scenario)) {
    await assert.rejects(fetch(), { code: 'ENOTFOUND' })
    assert.equal(
      peer.commands.some((line) => line.startsWith('RETR ')),
      false
    )
    result = { code: 'ENOTFOUND' }
  } else {
    const stream = await fetch()
    assert.equal(await consume(stream), 'fixture-data')
    // EOF on the returned stream can precede get-uri consuming FTP's 226.
    // Wait for the adapter itself to close before tearing down the peer.
    await peer.waitForControlClose()
    assert.equal(stream.lastModified.toISOString(), '2026-01-02T03:04:05.000Z')
    if (scenario === 'cache') {
      const retrieves = peer.commands.filter((line) => line.startsWith('RETR ')).length
      await assert.rejects(fetch(url, { cache: stream }), { code: 'ENOTMODIFIED' })
      assert.equal(peer.commands.filter((line) => line.startsWith('RETR ')).length, retrieves)
    }
    if (['fallback', 'proto'].includes(scenario)) {
      assert.ok(peer.commands.some((line) => /^(MLSD|LIST) /.test(line)))
    }
    if (scenario === 'pasv') assert.ok(peer.commands.includes('PASV'))
    else assert.ok(peer.commands.includes('EPSV'))
    assert.ok(peer.commands.includes('RETR /file.txt'))
    result = { body: 'fixture-data', modified: stream.lastModified.toISOString() }
  }
  process.stdout.write(JSON.stringify({ scenario, ...result }) + '\n')
} finally {
  await peer.close()
  net.Socket.prototype.connect = originalConnect
}
