function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export const TRANSFORM_DEFAULTS = {
  lightDirection: { x: 3, y: 4, z: 5 },
  baseRotation: { x: 0, y: 0, z: 0 },
  modelScale: 1.0
}

export const createTransformSlice = (set) => ({
  ...TRANSFORM_DEFAULTS,

  setLightDirection: (lightDirection) => set({ lightDirection }),
  setBaseRotation: (x, y, z) => set({ baseRotation: { x, y, z } }),
  resetBaseRotation: () => set({ baseRotation: { x: 0, y: 0, z: 0 } }),
  setModelScale: (scale) => set({ modelScale: clamp(scale, 0.1, 10) })
})
