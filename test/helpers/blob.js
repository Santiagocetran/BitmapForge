/**
 * Read a Blob as an ArrayBuffer.
 * @param {Blob} blob
 * @returns {Promise<ArrayBuffer>}
 */
async function blobToArrayBuffer(blob) {
  return blob.arrayBuffer()
}

/**
 * Read a Blob as a text string.
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
async function blobToText(blob) {
  return blob.text()
}

export { blobToArrayBuffer, blobToText }
