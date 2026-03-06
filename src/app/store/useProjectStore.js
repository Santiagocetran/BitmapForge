import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { temporal } from 'zundo'
import { DEFAULT_ANIMATION_EFFECTS } from '../../engine/animation/effectTypes.js'
import { randomSeed } from '../../engine/utils/seededRandom.js'

const DEFAULT_STATE = {
  model: null,
  colors: ['#021a15', '#074434', '#ABC685', '#E8FF99'],
  pixelSize: 3,
  ditherType: 'bayer4x4',
  invert: false,
  minBrightness: 0.05,
  backgroundColor: '#0a0a0a',
  useFadeInOut: true,
  fadeVariant: 'bloom',
  animationEffects: { ...DEFAULT_ANIMATION_EFFECTS },
  animationSpeed: 1.0,
  showPhaseDuration: 3000,
  animationDuration: 2500,
  lightDirection: { x: 3, y: 4, z: 5 },
  // Base rotation offset (Euler angles in radians, XYZ order). Applied as a static
  // pose layer — animation plays on top via a separate animGroup child.
  baseRotation: { x: 0, y: 0, z: 0 },
  // legacy (kept for migration; prefer animationEffects)
  animationPreset: 'spinY',
  rotateOnShow: false,
  showPreset: 'spinY',
  // null = use legacy deterministic hash for particle scatter (backward compatible)
  // number = seeded PRNG — enables reproducible, user-controllable scatter patterns
  seed: null,
  status: { loading: false, error: '', exporting: false, message: '', progress: 0 }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

const useProjectStore = create(
  temporal(
    subscribeWithSelector((set, get) => ({
      ...DEFAULT_STATE,

      setModel: (file) => {
        if (!file) {
          set({ model: null })
          return
        }

        const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
        set({
          model: {
            file,
            name: file.name,
            size: file.size,
            format: extension
          }
        })
      },
      setColors: (colors) => set({ colors: colors.slice(0, 6) }),
      reorderColors: (oldIndex, newIndex) => {
        const colors = [...get().colors]
        const [moved] = colors.splice(oldIndex, 1)
        colors.splice(newIndex, 0, moved)
        set({ colors })
      },
      addColor: (color = '#ffffff') => {
        const colors = get().colors
        if (colors.length >= 6) return
        set({ colors: [...colors, color] })
      },
      removeColor: (index) => {
        const colors = get().colors
        if (colors.length <= 2) return
        set({ colors: colors.filter((_, i) => i !== index) })
      },
      setColorAt: (index, color) => {
        const colors = [...get().colors]
        colors[index] = color
        set({ colors })
      },
      setPixelSize: (pixelSize) => set({ pixelSize: clamp(pixelSize, 1, 20) }),
      setDitherType: (ditherType) => set({ ditherType }),
      setInvert: (invert) => set({ invert }),
      setMinBrightness: (minBrightness) => set({ minBrightness: clamp(minBrightness, 0.01, 0.5) }),
      setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
      setUseFadeInOut: (useFadeInOut) => set({ useFadeInOut }),
      setFadeVariant: (fadeVariant) => set({ fadeVariant }),
      setAnimationEffect: (key, value) =>
        set((state) => ({
          animationEffects: { ...state.animationEffects, [key]: Boolean(value) }
        })),
      setAnimationPreset: (animationPreset) => set({ animationPreset }),
      setAnimationSpeed: (animationSpeed) => set({ animationSpeed: Math.max(0.01, animationSpeed) }),
      setShowPhaseDuration: (showPhaseDuration) => set({ showPhaseDuration: Math.max(100, showPhaseDuration) }),
      setAnimationDuration: (animationDuration) => set({ animationDuration: Math.max(100, animationDuration) }),
      setRotateOnShow: (rotateOnShow) => set({ rotateOnShow }),
      setShowPreset: (showPreset) => set({ showPreset }),
      setLightDirection: (lightDirection) => set({ lightDirection }),
      setBaseRotation: (x, y, z) => set({ baseRotation: { x, y, z } }),
      resetBaseRotation: () => set({ baseRotation: { x: 0, y: 0, z: 0 } }),
      setSeed: (seed) => set({ seed }),
      randomizeSeed: () => set({ seed: randomSeed() }),
      setStatus: (partialStatus) => {
        set({ status: { ...get().status, ...partialStatus } })
      },
      resetToDefaults: () => set({ ...DEFAULT_STATE, animationEffects: { ...DEFAULT_ANIMATION_EFFECTS } })
    })),
    {
      // Only track meaningful visual state — exclude status, model (binary data), and all action functions
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([k, v]) => k !== 'status' && k !== 'model' && typeof v !== 'function')
        ),
      limit: 50
    }
  )
)

export { useProjectStore, DEFAULT_STATE }
