import * as THREE from 'three'

/** Decode into an unattached image/canvas; transfer the URL only on success. */
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
    const objectUrl = URL.createObjectURL(file)
    let img
    const clearHandlers = () => {
      if (img) img.onload = img.onerror = null
    }
    const fail = (error) => {
      clearHandlers()
      URL.revokeObjectURL(objectUrl)
      reject(error)
    }
    try {
      img = new Image()
      img.onload = () => {
        clearHandlers()
        try {
          if (isSvg) {
            const width = Math.min(img.naturalWidth || 512, 2048)
            const height = Math.min(img.naturalHeight || 512, 2048)
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            URL.revokeObjectURL(objectUrl)
            resolve({ element: canvas, width, height, objectUrl: null })
          } else {
            resolve({ element: img, width: img.naturalWidth, height: img.naturalHeight, objectUrl })
          }
        } catch (error) {
          fail(error)
        }
      }
      img.onerror = () => fail(new Error(isSvg ? 'Failed to load SVG' : 'Failed to load image'))
      img.src = objectUrl
    } catch (error) {
      fail(error)
    }
  })
}

/** Prepare a textured plane without mutating the active scene. */
async function createImagePlane(file) {
  const { element, width, height, objectUrl } = await loadImageFromFile(file)
  let texture, geometry, material
  try {
    texture = new THREE.Texture(element)
    texture.needsUpdate = true
    const aspect = width / height
    const planeWidth = aspect >= 1 ? 2 : 2 * aspect
    const planeHeight = aspect >= 1 ? 2 / aspect : 2
    geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
    material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(geometry, material)
    const group = new THREE.Group()
    group.add(mesh)
    return { group, objectUrl }
  } catch (error) {
    geometry?.dispose()
    material?.dispose()
    texture?.dispose()
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    throw error
  }
}

export { createImagePlane }
