import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import helvetikerData from 'three/examples/fonts/helvetiker_regular.typeface.json'
import helvetikerBoldData from 'three/examples/fonts/helvetiker_bold.typeface.json'
import optimerData from 'three/examples/fonts/optimer_regular.typeface.json'
import optimerBoldData from 'three/examples/fonts/optimer_bold.typeface.json'
import gentilisData from 'three/examples/fonts/gentilis_regular.typeface.json'
import gentilisBoldData from 'three/examples/fonts/gentilis_bold.typeface.json'
import droidSansData from 'three/examples/fonts/droid/droid_sans_regular.typeface.json'
import droidSansBoldData from 'three/examples/fonts/droid/droid_sans_bold.typeface.json'
import droidSerifData from 'three/examples/fonts/droid/droid_serif_regular.typeface.json'
import droidMonoData from 'three/examples/fonts/droid/droid_sans_mono_regular.typeface.json'

const fontLoader = new FontLoader()

// Cache parsed font objects so we only parse once per family.
const fontCache = new Map()

const BUILT_IN_FONTS = {
  helvetiker: helvetikerData,
  helvetikerBold: helvetikerBoldData,
  optimer: optimerData,
  optimerBold: optimerBoldData,
  gentilis: gentilisData,
  gentilisBold: gentilisBoldData,
  droidSans: droidSansData,
  droidSansBold: droidSansBoldData,
  droidSerif: droidSerifData,
  droidMono: droidMonoData
}

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
