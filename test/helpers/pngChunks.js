const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/**
 * Returns true if the buffer starts with the 8-byte PNG signature.
 * @param {ArrayBuffer} buffer
 */
function hasPngSignature(buffer) {
  const bytes = new Uint8Array(buffer)
  return PNG_SIGNATURE.every((b, i) => bytes[i] === b)
}

/**
 * Parse all PNG chunks from an ArrayBuffer.
 * @param {ArrayBuffer} buffer
 * @returns {{ type: string, data: Uint8Array }[]}
 */
function parsePngChunks(buffer) {
  const bytes = new Uint8Array(buffer)
  if (!hasPngSignature(buffer)) throw new Error('Not a valid PNG: wrong signature')

  const chunks = []
  let offset = 8
  while (offset + 12 <= bytes.length) {
    const length =
      ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7])
    const data = bytes.slice(offset + 8, offset + 8 + length)
    chunks.push({ type, data })
    offset += 12 + length // 4 length + 4 type + data + 4 CRC
  }
  return chunks
}

/**
 * Returns an array of chunk type strings in order.
 * @param {ArrayBuffer} buffer
 * @returns {string[]}
 */
function getChunkTypes(buffer) {
  return parsePngChunks(buffer).map((c) => c.type)
}

export { hasPngSignature, parsePngChunks, getChunkTypes }
