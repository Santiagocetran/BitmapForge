import * as THREE from 'three'

const DEFAULT_PARAMS = {
  cube: { size: 1 },
  sphere: { radius: 1, widthSegments: 32, heightSegments: 32 },
  torus: { radius: 0.8, tube: 0.3, radialSegments: 16, tubularSegments: 100 },
  cylinder: { radiusTop: 0.5, radiusBottom: 0.5, height: 1.5, radialSegments: 32 },
  cone: { radius: 0.8, height: 1.5, radialSegments: 32 },
  icosahedron: { radius: 1, detail: 0 },
  torusKnot: { radius: 0.7, tube: 0.2, tubularSegments: 100, radialSegments: 16 },
  plane: { width: 2, height: 2 }
}

const SHAPE_LABELS = {
  cube: 'Cube',
  sphere: 'Sphere',
  torus: 'Torus',
  cylinder: 'Cylinder',
  cone: 'Cone',
  icosahedron: 'Icosahedron',
  torusKnot: 'Torus Knot',
  plane: 'Plane'
}

function createShapeGeometry(type, params) {
  const p = { ...DEFAULT_PARAMS[type], ...params }
  switch (type) {
    case 'cube':
      return new THREE.BoxGeometry(p.size, p.size, p.size)
    case 'sphere':
      return new THREE.SphereGeometry(p.radius, p.widthSegments, p.heightSegments)
    case 'torus':
      return new THREE.TorusGeometry(p.radius, p.tube, p.radialSegments, p.tubularSegments)
    case 'cylinder':
      return new THREE.CylinderGeometry(p.radiusTop, p.radiusBottom, p.height, p.radialSegments)
    case 'cone':
      return new THREE.ConeGeometry(p.radius, p.height, p.radialSegments)
    case 'icosahedron':
      return new THREE.IcosahedronGeometry(p.radius, p.detail)
    case 'torusKnot':
      return new THREE.TorusKnotGeometry(p.radius, p.tube, p.tubularSegments, p.radialSegments)
    case 'plane':
      return new THREE.PlaneGeometry(p.width, p.height)
    default:
      throw new Error(`Unknown shape: "${type}". Valid types: ${getShapeTypes().join(', ')}`)
  }
}

/**
 * Create a Three.js Group containing the requested shape primitive.
 * @param {string} type - shape type key
 * @param {object} [params] - shape-specific parameters (merged with defaults)
 * @returns {THREE.Group}
 */
function createShape(type, params = {}) {
  const geometry = createShapeGeometry(type, params)
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const mesh = new THREE.Mesh(geometry, material)
  const group = new THREE.Group()
  group.add(mesh)
  return group
}

/** @returns {string[]} All valid shape type keys */
function getShapeTypes() {
  return Object.keys(DEFAULT_PARAMS)
}

/**
 * Return default parameters for a given shape type.
 * @param {string} type
 * @returns {object}
 */
function getDefaultParams(type) {
  return { ...(DEFAULT_PARAMS[type] ?? {}) }
}

/** @returns {Record<string, string>} Map of type key → display label */
function getShapeLabels() {
  return { ...SHAPE_LABELS }
}

export { createShape, getShapeTypes, getDefaultParams, getShapeLabels }
