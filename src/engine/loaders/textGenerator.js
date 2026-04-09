import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'

const FONT_LOADERS = {
  helvetiker: () => import('three/examples/fonts/helvetiker_regular.typeface.json'),
  helvetikerBold: () => import('three/examples/fonts/helvetiker_bold.typeface.json'),
  gentilisRegular: () => import('three/examples/fonts/gentilis_regular.typeface.json'),
  gentilisBold: () => import('three/examples/fonts/gentilis_bold.typeface.json'),
  optimer: () => import('three/examples/fonts/optimer_regular.typeface.json'),
  optimerBold: () => import('three/examples/fonts/optimer_bold.typeface.json'),
  droidMono: () => import('three/examples/fonts/droid/droid_sans_mono_regular.typeface.json')
}

const fontLoader = new FontLoader()

// Cache parsed font objects so we only parse once per family.
const fontCache = new Map()

const FONT_LABELS = {
  helvetiker: 'Helvetiker',
  helvetikerBold: 'Helvetiker Bold',
  gentilisRegular: 'Gentilis',
  gentilisBold: 'Gentilis Bold',
  optimer: 'Optimer',
  optimerBold: 'Optimer Bold',
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
 * Build per-character meshes for a single line of text, returning them
 * positioned along the x-axis starting at x=0 (left-aligned).
 * Returns the meshes and the total line width.
 */
function buildLineMeshes(line, font, fontSize, extrudeDepth, bevelEnabled, letterSpacing, material) {
  const geomOpts = {
    font,
    size: fontSize,
    depth: extrudeDepth,
    bevelEnabled,
    bevelThickness: 0.05 * fontSize,
    bevelSize: 0.03 * fontSize,
    bevelSegments: 3
  }

  const meshes = []
  let xOffset = 0

  for (const char of line) {
    if (char === ' ') {
      xOffset += fontSize * 0.3 + letterSpacing
      continue
    }

    const geometry = new TextGeometry(char, geomOpts)
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox
    const charWidth = bbox.max.x - bbox.min.x

    // Position at the left edge of this char's slot; center within its bbox.
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = xOffset - bbox.min.x
    xOffset += charWidth + letterSpacing
    meshes.push(mesh)
  }

  return { meshes, totalWidth: xOffset - letterSpacing }
}

/**
 * Create a Three.js Group containing extruded 3D text, centered at the origin.
 * Supports multi-line text (split on \n) and letter spacing.
 * @param {string} text - text to extrude (defaults to 'Text' if empty)
 * @param {{ fontFamily?: string, fontSize?: number, extrudeDepth?: number, bevelEnabled?: boolean, letterSpacing?: number }} [options]
 * @returns {Promise<THREE.Group>}
 */
async function createTextGroup(text, options = {}) {
  const {
    fontFamily = 'helvetiker',
    fontSize = 1,
    extrudeDepth = 0.3,
    bevelEnabled = true,
    letterSpacing = 0
  } = options

  const font = await getFont(fontFamily)
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const group = new THREE.Group()

  const lines = (text || 'Text').split('\n')
  const lineHeight = fontSize * 1.3

  // Build each line and track max width for horizontal centering.
  const lineData = []
  let maxWidth = 0

  for (const line of lines) {
    const { meshes, totalWidth } = buildLineMeshes(
      line,
      font,
      fontSize,
      extrudeDepth,
      bevelEnabled,
      letterSpacing,
      material
    )
    lineData.push({ meshes, totalWidth })
    if (totalWidth > maxWidth) maxWidth = totalWidth
  }

  // Place lines: center each horizontally, stack downward.
  const totalHeight = lineHeight * lines.length
  const startY = totalHeight / 2 - fontSize / 2

  lineData.forEach(({ meshes, totalWidth }, lineIndex) => {
    const xShift = -totalWidth / 2
    const yPos = startY - lineIndex * lineHeight

    for (const mesh of meshes) {
      mesh.position.x += xShift
      mesh.position.y = yPos
      group.add(mesh)
    }
  })

  return group
}

export { createTextGroup, getFont, FONT_LABELS }
