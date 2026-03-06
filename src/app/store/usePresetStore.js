import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useProjectStore } from './useProjectStore.js'

function extractSettings(state) {
  return {
    colors: state.colors,
    pixelSize: state.pixelSize,
    ditherType: state.ditherType,
    invert: state.invert,
    minBrightness: state.minBrightness,
    backgroundColor: state.backgroundColor
  }
}

const usePresetStore = create(
  persist(
    (set) => ({
      customPresets: [],

      saveCurrentPreset: (name, category = 'custom') => {
        const settings = extractSettings(useProjectStore.getState())
        const preset = {
          id: `custom-${Date.now()}`,
          name,
          category,
          settings
        }
        set((s) => ({ customPresets: [...s.customPresets, preset] }))
        return preset
      },

      deletePreset: (id) => set((s) => ({ customPresets: s.customPresets.filter((p) => p.id !== id) }))
    }),
    { name: 'bitmapforge-presets' }
  )
)

export { usePresetStore }
