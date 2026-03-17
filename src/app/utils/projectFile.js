import { DEFAULT_ANIMATION_EFFECTS } from '../../engine/animation/effectTypes.js'

const PROJECT_VERSION = 2

/**
 * Pure DTO parser for .bforge project files.
 * No browser APIs — importable in Node/SSR/tests.
 * Returns { settings, modelData, inputType, version }.
 */
export function parseProjectData(jsonString) {
  const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
  if (!data || typeof data !== 'object') throw new Error('Invalid .bforge file')
  if (!data.version) throw new Error('Missing version field in .bforge file')
  const d = !data.version || data.version < 2 ? migrateV1toV2(data) : data
  return {
    settings: d.settings ?? {},
    modelData: d.model ?? null, // { name, type, format, data: base64 } | null
    inputType: d.settings?.inputType ?? 'model',
    version: d.version
  }
}

function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    const subArray = bytes.subarray(i, i + chunk)
    binary += String.fromCharCode(...subArray)
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

const TRANSIENT_KEYS = new Set(['model', 'imageSource', 'status', 'selectedLayerId', '_hasHydrated'])

async function buildProjectPayload(state) {
  const settings = {}
  for (const [k, v] of Object.entries(state)) {
    if (!TRANSIENT_KEYS.has(k) && typeof v !== 'function') settings[k] = v
  }

  const payload = {
    version: PROJECT_VERSION,
    createdAt: new Date().toISOString(),
    settings,
    model: null
  }

  if (state.model?.file) {
    const buffer = await state.model.file.arrayBuffer()
    payload.model = {
      name: state.model.name,
      type: state.model.file.type || 'application/octet-stream',
      format: state.model.format,
      data: arrayBufferToBase64(buffer)
    }
  }

  return payload
}

async function saveProjectFile(state) {
  const payload = await buildProjectPayload(state)
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `bitmapforge-${Date.now()}.bitmapforge`
  anchor.click()
  URL.revokeObjectURL(url)
}

function migrateV1toV2(project) {
  return {
    ...project,
    version: 2,
    settings: {
      ...project.settings,
      useFadeInOut: project.settings.useFadeInOut ?? true,
      fadeVariant: project.settings.fadeVariant ?? 'bloom',
      animationEffects: project.settings.animationEffects ?? { ...DEFAULT_ANIMATION_EFFECTS },
      baseRotation: project.settings.baseRotation ?? { x: 0, y: 0, z: 0 },
      seed: null // preserve old deterministic-hash behavior
    }
  }
}

async function loadProjectFile(file) {
  const raw = await file.text()
  let project = JSON.parse(raw)
  if (!project.settings) {
    throw new Error('Invalid .bitmapforge file: missing settings')
  }

  if (!project.version || project.version < 2) {
    project = migrateV1toV2(project)
  }

  let modelFile = null
  if (project.model?.data) {
    const buffer = base64ToArrayBuffer(project.model.data)
    modelFile = new File([buffer], project.model.name || `model.${project.model.format ?? 'stl'}`, {
      type: project.model.type || 'application/octet-stream'
    })
  }

  return { settings: project.settings, modelFile }
}

export { saveProjectFile, loadProjectFile, buildProjectPayload }
