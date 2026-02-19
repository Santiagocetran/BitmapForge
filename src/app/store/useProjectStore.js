import { create } from 'zustand'

const DEFAULT_STATE = {
  model: null,
  colors: ['#074434', '#0a5845', '#ABC685', '#E8FF99'],
  pixelSize: 3,
  ditherType: 'bayer4x4',
  invert: false,
  minBrightness: 0.05,
  backgroundColor: 'transparent',
  animationPreset: 'spinY',
  animationSpeed: 0.36,
  showPhaseDuration: 20000,
  animationDuration: 2500,
  rotateOnShow: false,
  showPreset: 'spinY',
  lightDirection: { x: 3, y: 4, z: 5 },
  status: { loading: false, error: '', exporting: false, message: '' }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

const useProjectStore = create((set, get) => ({
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
  setAnimationPreset: (animationPreset) => set({ animationPreset }),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed: Math.max(0.01, animationSpeed) }),
  setShowPhaseDuration: (showPhaseDuration) => set({ showPhaseDuration: Math.max(100, showPhaseDuration) }),
  setAnimationDuration: (animationDuration) => set({ animationDuration: Math.max(100, animationDuration) }),
  setRotateOnShow: (rotateOnShow) => set({ rotateOnShow }),
  setShowPreset: (showPreset) => set({ showPreset }),
  setLightDirection: (lightDirection) => set({ lightDirection }),
  setStatus: (partialStatus) => {
    set({ status: { ...get().status, ...partialStatus } })
  },
  resetToDefaults: () => set({ ...DEFAULT_STATE })
}))

export { useProjectStore, DEFAULT_STATE }
