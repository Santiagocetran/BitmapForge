/**
 * Pure DTO parser for .bforge project files.
 * No browser APIs, no Zustand — importable in Node/SSR/tests.
 */

export function parseProjectData(jsonString) {
  const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
  if (!data || typeof data !== 'object') throw new Error('Invalid .bforge file')
  if (!data.version) throw new Error('Missing version field in .bforge file')
  const d = data.version === 1 ? migrateV1toV2(data) : data
  return {
    settings: d.settings ?? {},
    modelData: d.model ?? null, // { name, type, format, data: base64 } | null
    inputType: d.settings?.inputType ?? 'model',
    version: d.version
  }
}

function migrateV1toV2(d) {
  return {
    ...d,
    version: 2,
    settings: {
      useFadeInOut: false,
      fadeVariant: 'bloom',
      animationEffects: {},
      baseRotation: { x: 0, y: 0, z: 0 },
      seed: null,
      ...d.settings
    }
  }
}
