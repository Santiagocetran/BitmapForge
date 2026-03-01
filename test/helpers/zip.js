import JSZip from 'jszip'

/**
 * Load a JSZip instance from a Blob.
 * @param {Blob} blob
 * @returns {Promise<JSZip>}
 */
async function loadZip(blob) {
  return JSZip.loadAsync(blob)
}

/**
 * Read a file inside a JSZip as a UTF-8 string.
 * @param {JSZip} zip
 * @param {string} path
 * @returns {Promise<string>}
 */
async function getZipFileText(zip, path) {
  const file = zip.files[path]
  if (!file) throw new Error(`File not found in ZIP: ${path}`)
  return file.async('string')
}

/**
 * Return the list of file paths contained in a ZIP blob.
 * @param {Blob} blob
 * @returns {Promise<string[]>}
 */
async function listZipPaths(blob) {
  const zip = await loadZip(blob)
  return Object.keys(zip.files).filter((p) => !p.endsWith('/'))
}

export { loadZip, getZipFileText, listZipPaths }
