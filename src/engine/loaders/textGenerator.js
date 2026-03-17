import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'

const FONT_LOADERS = {
  helvetiker: () => import('three/examples/fonts/helvetiker_regular.typeface.json'),
  helvetikerBold: () => import('three/examples/fonts/helvetiker_bold.typeface.json'),
  optimer: () => import('three/examples/fonts/optimer_regular.typeface.json'),
  optimerBold: () => import('three/examples/fonts/optimer_bold.typeface.json'),
  gentilis: () => import('three/examples/fonts/gentilis_regular.typeface.json'),
  gentilisBold: () => import('three/examples/fonts/gentilis_bold.typeface.json'),
  droidSans: () => import('three/examples/fonts/droid/droid_sans_regular.typeface.json'),
  droidSansBold: () => import('three/examples/fonts/droid/droid_sans_bold.typeface.json'),
  droidSerif: () => import('three/examples/fonts/droid/droid_serif_regular.typeface.json'),
  droidMono: () => import('three/examples/fonts/droid/droid_sans_mono_regular.typeface.json')
}

const fontLoader = new FontLoader()

// Cache parsed font objects so we only parse once per family.
const fontCache = new Map()

const FONT_LABELS = {
  helvetiker: 'Helvetiker',
  helvetikerBold: 'Helvetiker Bold',
  optimer: 'Optimer',
  optimerBold: 'Optimer Bold',
  gentilis: 'Gentilis',
  gentilisBold: 'Gentilis Bold',
  droidSans: 'Droid Sans',
  droidSansBold: 'Droid Sans Bold',
  droidSerif: 'Droid Serif',
  droidMono: 'Droid Mono'
}

/**
 * Get (or lazily load and parse) a Three.js Font for the given family.
 * Falls back to helvetiker if the requested family isn't available.
 * @param {string} fontFamily
 * @returns {Promise<import('three/addons/loaders/FontLoader.js').Font>}
 */
async function getFont(fontFamily) {
  if (fontCache.has(fontFamily)) return fontCache.get(fontFamily)
  const load = FONT_LOADERS[fontFamily] ?? FONT_LOADERS.helvetiker
  const { default: data } = await load()
  const font = fontLoader.parse(data)
  fontCache.set(fontFamily, font)
  return font
}

/**
 * Create a Three.js Group containing extruded 3D text, centered at the origin.
 * @param {string} text - text to extrude (defaults to 'Text' if empty)
 * @param {{ fontFamily?: string, fontSize?: number, extrudeDepth?: number, bevelEnabled?: boolean }} [options]
 * @returns {Promise<THREE.Group>}
 */
async function createTextGroup(text, options = {}) {
  const { fontFamily = 'helvetiker', fontSize = 1, extrudeDepth = 0.3, bevelEnabled = true } = options

  const font = await getFont(fontFamily)

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

export { createTextGroup, getFont, FONT_LABELS }
