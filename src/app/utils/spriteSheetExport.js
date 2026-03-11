/**
 * Pure sprite-sheet builder — composites an array of ImageData frames onto a
 * grid canvas and returns the result as an image/png Blob.
 *
 * Extracted from useExport.js so it can be tested in isolation.
 *
 * @param {ImageData[]} frames
 * @param {number} columns  Number of columns in the grid (default 6)
 * @returns {Promise<Blob>}
 */
async function buildSpriteSheet(frames, columns = 6) {
  if (!frames.length) throw new Error('No frames to composite')
  const { width, height } = frames[0]
  const rows = Math.ceil(frames.length / columns)
  const outCanvas = document.createElement('canvas')
  outCanvas.width = columns * width
  outCanvas.height = rows * height
  const outCtx = outCanvas.getContext('2d')

  for (let i = 0; i < frames.length; i++) {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    tempCanvas.getContext('2d').putImageData(frames[i], 0, 0)
    outCtx.drawImage(tempCanvas, (i % columns) * width, Math.floor(i / columns) * height)
  }

  return new Promise((resolve, reject) => {
    outCanvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('toBlob returned null'))
    }, 'image/png')
  })
}

export { buildSpriteSheet }
