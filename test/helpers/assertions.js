import { expect } from 'vitest'
import { hasPngSignature, getChunkTypes } from './pngChunks.js'

/**
 * Assert a Blob has a valid PNG signature.
 * @param {Blob} blob
 */
async function assertValidPng(blob) {
  const buffer = await blob.arrayBuffer()
  expect(hasPngSignature(buffer)).toBe(true)
}

/**
 * Assert a Blob is a valid APNG (has PNG signature + acTL + fcTL chunks).
 * @param {Blob} blob
 */
async function assertApng(blob) {
  const buffer = await blob.arrayBuffer()
  expect(hasPngSignature(buffer)).toBe(true)
  const types = getChunkTypes(buffer)
  expect(types).toContain('acTL')
  expect(types.some((t) => t === 'fcTL')).toBe(true)
}

/**
 * Assert a Blob is parseable JSON and return the parsed value.
 * @param {Blob} blob
 * @returns {Promise<unknown>}
 */
async function assertValidJson(blob) {
  const text = await blob.text()
  let parsed
  expect(() => {
    parsed = JSON.parse(text)
  }).not.toThrow()
  return parsed
}

export { assertValidPng, assertApng, assertValidJson }
