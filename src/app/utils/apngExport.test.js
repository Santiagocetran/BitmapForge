import { describe, it, expect } from 'vitest'
import { buildApng } from './apngExport.js'
import { hasPngSignature, getChunkTypes } from '../../../test/helpers/pngChunks.js'

function makeMockFrame(w = 8, h = 8) {
  // Fill with semi-transparent grey so upng-js has real pixel data to encode
  const data = new Uint8ClampedArray(w * h * 4).fill(128)
  return { width: w, height: h, data }
}

// ─── Error handling ───────────────────────────────────────────────────────────

describe('buildApng — error handling', () => {
  it('throws on empty frames array', () => {
    expect(() => buildApng([], 100)).toThrow('No frames to encode')
  })
})

// ─── Return type ──────────────────────────────────────────────────────────────

describe('buildApng — return value', () => {
  it('returns a Blob', () => {
    const blob = buildApng([makeMockFrame()], 100)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('Blob has image/png MIME type', () => {
    const blob = buildApng([makeMockFrame()], 100)
    expect(blob.type).toBe('image/png')
  })

  it('Blob is non-empty', () => {
    const blob = buildApng([makeMockFrame()], 100)
    expect(blob.size).toBeGreaterThan(0)
  })
})

// ─── PNG structure ────────────────────────────────────────────────────────────

describe('buildApng — PNG signature', () => {
  it('output starts with valid PNG signature', async () => {
    const blob = buildApng([makeMockFrame()], 100)
    const buffer = await blob.arrayBuffer()
    expect(hasPngSignature(buffer)).toBe(true)
  })
})

// ─── APNG animation chunks ────────────────────────────────────────────────────

describe('buildApng — APNG chunks', () => {
  it('output contains acTL chunk (animation control)', async () => {
    const blob = buildApng([makeMockFrame(), makeMockFrame()], 100)
    const buffer = await blob.arrayBuffer()
    expect(getChunkTypes(buffer)).toContain('acTL')
  })

  it('output contains fcTL chunk (frame control)', async () => {
    const blob = buildApng([makeMockFrame(), makeMockFrame()], 100)
    const buffer = await blob.arrayBuffer()
    expect(getChunkTypes(buffer).some((t) => t === 'fcTL')).toBe(true)
  })

  it('output contains IEND chunk (well-formed PNG)', async () => {
    const blob = buildApng([makeMockFrame(), makeMockFrame()], 100)
    const buffer = await blob.arrayBuffer()
    expect(getChunkTypes(buffer)).toContain('IEND')
  })
})

// ─── Frame dimensions ─────────────────────────────────────────────────────────

describe('buildApng — dimensions', () => {
  it('encodes frames of different sizes without throwing', () => {
    expect(() => buildApng([makeMockFrame(4, 4)], 50)).not.toThrow()
    expect(() => buildApng([makeMockFrame(32, 16)], 50)).not.toThrow()
  })
})
