import * as THREE from 'three'

/**
 * Load an image or SVG file and resolve with { element, width, height, objectUrl }.
 * SVGs are rasterized to an offscreen canvas before returning.
 * @param {File} file
 * @returns {Promise<{ element: HTMLImageElement|HTMLCanvasElement, width: number, height: number, objectUrl: string|null }>}
 */
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
    const objectUrl = URL.createObjectURL(file)

    if (isSvg) {
      // Rasterize SVG via an Image element → offscreen canvas so Three.js can use it as a texture.
      const img = new Image()
      img.onload = () => {
        const w = Math.min(img.naturalWidth || 512, 2048)
        const h = Math.min(img.naturalHeight || 512, 2048)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        URL.revokeObjectURL(objectUrl)
        resolve({ element: canvas, width: w, height: h, objectUrl: null })
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to load SVG'))
      }
      img.src = objectUrl
    } else {
      const img = new Image()
      img.onload = () => {
        resolve({ element: img, width: img.naturalWidth, height: img.naturalHeight, objectUrl })
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to load image'))
      }
      img.src = objectUrl
    }
  })
}

/**
 * Create a Three.js Group containing a textured plane matching the image's aspect ratio.
 * The plane is 2 units tall (or 2 units wide for landscape), centered at the origin.
 * Uses Approach A: 3D plane with texture — keeps the full animation+effect pipeline.
 * @param {File} file - image or SVG file
 * @returns {Promise<{ group: THREE.Group, objectUrl: string|null }>}
 */
async function createImagePlane(file) {
  const { element, width, height, objectUrl } = await loadImageFromFile(file)

  const texture = new THREE.Texture(element)
  texture.needsUpdate = true

  const aspect = width / height
  const planeWidth = aspect >= 1 ? 2 : 2 * aspect
  const planeHeight = aspect >= 1 ? 2 / aspect : 2

  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
  const mesh = new THREE.Mesh(geometry, material)

  const group = new THREE.Group()
  group.add(mesh)

  return { group, objectUrl }
}

export { createImagePlane }
