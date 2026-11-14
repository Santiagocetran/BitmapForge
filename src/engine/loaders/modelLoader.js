import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

// Template material cloned per mesh — each mesh needs its own instance because
// Three.js materials are stateful and disposed independently with their mesh.
const WHITE_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.5,
  metalness: 0.1
})

function getExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function centerAndScale(group) {
  const box = new THREE.Box3().setFromObject(group)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6)
  const scale = 3 / maxDim

  // Move all children into an inner offset group so the bounding-box center
  // lands at the outer group's local origin. This way, rotating the outer
  // group spins the model in place instead of orbiting it around a distant
  // point (which is what group.position offset would cause).
  const inner = new THREE.Group()
  inner.position.set(-center.x, -center.y, -center.z)
  while (group.children.length > 0) {
    inner.add(group.children[0])
  }
  group.add(inner)
  group.scale.setScalar(scale)
  group.updateMatrixWorld(true)
}

function applyWhiteMaterial(group) {
  group.traverse((obj) => {
    if (obj.isMesh) obj.material = WHITE_MATERIAL.clone()
  })
  group.traverse((obj) => {
    if (obj.isMesh) obj.geometry?.computeVertexNormals?.()
  })
}

function loadWithCallback(loader, objectUrl) {
  return new Promise((resolve, reject) => {
    loader.load(objectUrl, resolve, undefined, reject)
  })
}

async function loadModel(file) {
  const extension = getExtension(file.name)
  const objectUrl = URL.createObjectURL(file)

  let group
  const ownership = createOwnership()
  try {
    if (extension === 'stl') {
      const stlLoader = new STLLoader()
      const geometry = await loadWithCallback(stlLoader, objectUrl)
      ownership.resources.add(geometry)
      group = new THREE.Group()
      const material = WHITE_MATERIAL.clone()
      ownership.resources.add(material)
      const mesh = new THREE.Mesh(geometry, material)
      group.add(mesh)
      geometry.computeVertexNormals()
      mesh.rotation.x = -Math.PI / 2
    } else if (extension === 'obj') {
      const objLoader = new OBJLoader()
      group = await loadWithCallback(objLoader, objectUrl)
      ownership.capture(group)
      applyWhiteMaterial(group)
    } else if (extension === 'gltf' || extension === 'glb') {
      const cacheEnabledAtStart = THREE.Cache.enabled
      const gltfLoader = new GLTFLoader()
      const gltf = await loadWithCallback(gltfLoader, objectUrl)
      group = gltf.scene
      // All scenes are decoded, but only the default scene is published. Track
      // the complete graph before material replacement so shared resources survive.
      for (const scene of new Set([group, ...(gltf.scenes ?? [])])) ownership.capture(scene)
      // With the default loader and Cache disabled at both ends of decoding,
      // bitmap backing stores belong to this source. Cache-enabled loads are
      // conservatively borrowed: another loader/consumer may still use them.
      if (!cacheEnabledAtStart && !THREE.Cache.enabled) ownership.ownBitmaps()
      applyWhiteMaterial(group)
    } else {
      throw new Error(`Unsupported model format: .${extension}`)
    }

    ownership.capture(group)
    ownership.releaseExcept(collectResources(group))
    centerAndScale(group)
    sourceOwnership.set(group, ownership)
    return { group, objectUrl }
  } catch (error) {
    if (group) ownership.capture(group)
    ownership.releaseExcept()
    URL.revokeObjectURL(objectUrl)
    throw new Error(`Failed to load model ${file.name}: ${error.message}`)
  }
}

// Shared ownership primitives live in this already-vendored loader so generated
// integrations do not acquire an unlisted engine-source dependency.
const sourceOwnership = new WeakMap()

function textureImages(texture) {
  const image = texture.source?.data ?? texture.image
  return Array.isArray(image) ? image : [image]
}

function collectResources(group) {
  const resources = new Set()
  group?.traverse((child) => {
    if (child.geometry) resources.add(child.geometry)
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      if (!material) continue
      resources.add(material)
      for (const value of Object.values(material)) {
        if (value?.isTexture) resources.add(value)
      }
    }
  })
  return resources
}

function createOwnership(disposed = new Set()) {
  const resources = new Set()
  const bitmaps = new Set()
  return {
    resources,
    capture(group) {
      for (const resource of collectResources(group)) resources.add(resource)
    },
    ownBitmaps() {
      for (const resource of resources) {
        if (!resource.isTexture) continue
        for (const image of textureImages(resource)) {
          if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) bitmaps.add(image)
        }
      }
    },
    releaseExcept(retained = new Set()) {
      const liveImages = new Set()
      for (const resource of retained) {
        if (resource.isTexture) for (const image of textureImages(resource)) liveImages.add(image)
      }
      for (const resource of resources) {
        if (retained.has(resource) || disposed.has(resource)) continue
        disposed.add(resource)
        resource.dispose?.()
      }
      for (const image of bitmaps) {
        if (disposed.has(image)) continue
        // Cache may have been enabled while a decode was in flight. A cached
        // bitmap remains borrowed even if Cache.enabled was subsequently reset.
        if (Object.values(THREE.Cache?.files ?? {}).includes(image)) {
          // Borrowing is permanent for this source, even if the cache is later
          // cleared: an independent consumer may have retained the bitmap.
          bitmaps.delete(image)
          continue
        }
        if (liveImages.has(image)) continue
        disposed.add(image)
        image.close()
      }
    }
  }
}

function disposeGroup(group, disposed = new Set()) {
  const ownership = sourceOwnership.get(group) ?? createOwnership(disposed)
  ownership.capture(group)
  ownership.releaseExcept()
}

/** Own one unattached source until commit transfers it to the manager. */
function prepareSource(group, objectUrl = null, metadata = {}) {
  let disposed = false
  return {
    group,
    objectUrl,
    metadata,
    dispose() {
      if (disposed) return
      disposed = true
      disposeGroup(group)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }
}

export { loadModel, getExtension, disposeGroup, prepareSource }
