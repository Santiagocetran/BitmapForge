import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import helvetikerData from 'three/examples/fonts/helvetiker_regular.typeface.json'

const fontLoader = new FontLoader()

// Cache parsed font objects so we only parse once per family.
const fontCache = new Map()

const BUILT_IN_FONTS = {
  helvetiker: helvetikerData
}

const FONT_LABELS = {
  helvetiker: 'Helvetiker'
}

/**
 * Get (or lazily parse) a Three.js Font for the given family.
 * Falls back to helvetiker if the requested family isn't available.
 * @param {string} fontFamily
 * @returns {import('three/addons/loaders/FontLoader.js').Font}
 */
function getFont(fontFamily) {
  if (fontCache.has(fontFamily)) return fontCache.get(fontFamily)
  const data = BUILT_IN_FONTS[fontFamily] ?? BUILT_IN_FONTS.helvetiker
  const font = fontLoader.parse(data)
  fontCache.set(fontFamily, font)
  return font
}

/**
 * Create a Three.js Group containing extruded 3D text, centered at the origin.
 * @param {string} text - text to extrude (defaults to 'Text' if empty)
 * @param {{ fontFamily?: string, fontSize?: number, extrudeDepth?: number, bevelEnabled?: boolean }} [options]
 * @returns {THREE.Group}
 */
function createTextGroup(text, options = {}) {
  const { fontFamily = 'helvetiker', fontSize = 1, extrudeDepth = 0.3, bevelEnabled = true } = options

  const font = getFont(fontFamily)

  const geometry = new TextGeometry(text || 'Text', {
    font,
    size: fontSize,
    depth: extrudeDepth,
    bevelEnabled,
    bevelThickness: 0.05 * fontSize,
    bevelSize: 0.03 * fontSize,
    bevelSegments: 3
  })
  geometry.computeBoundingBox()
  geometry.center()

  const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const mesh = new THREE.Mesh(geometry, material)
  const group = new THREE.Group()
  group.add(mesh)
  return group
}

export { createTextGroup, getFont, BUILT_IN_FONTS, FONT_LABELS }
