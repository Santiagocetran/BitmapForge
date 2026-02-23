import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

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
    if (obj.isMesh) {
      obj.material = WHITE_MATERIAL.clone()
      if (obj.geometry && typeof obj.geometry.computeVertexNormals === 'function') {
        obj.geometry.computeVertexNormals()
      }
    }
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

  try {
    let group
    if (extension === 'stl') {
      const stlLoader = new STLLoader()
      const geometry = await loadWithCallback(stlLoader, objectUrl)
      geometry.computeVertexNormals()
      const mesh = new THREE.Mesh(geometry, WHITE_MATERIAL.clone())
      mesh.rotation.x = -Math.PI / 2
      group = new THREE.Group()
      group.add(mesh)
    } else if (extension === 'obj') {
      const objLoader = new OBJLoader()
      group = await loadWithCallback(objLoader, objectUrl)
      applyWhiteMaterial(group)
    } else if (extension === 'gltf' || extension === 'glb') {
      const gltfLoader = new GLTFLoader()
      const gltf = await loadWithCallback(gltfLoader, objectUrl)
      group = gltf.scene
      applyWhiteMaterial(group)
    } else {
      throw new Error(`Unsupported model format: .${extension}`)
    }

    centerAndScale(group)
    return { group, objectUrl }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw new Error(`Failed to load model ${file.name}: ${error.message}`)
  }
}

export { loadModel, getExtension }
