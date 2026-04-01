import { randomSeed } from '../../../engine/utils/seededRandom.js'

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export const RENDERING_DEFAULTS = {
  colors: ['#021a15', '#074434', '#ABC685', '#E8FF99'],
  pixelSize: 3,
  ditherType: 'bayer4x4',
  invert: false,
  minBrightness: 0.05,
  backgroundColor: '#0a0a0a',
  renderMode: 'bitmap',
  seed: null,
  charRamp: 'classic',
  asciiColored: false,
  halftoneDotShape: 'circle',
  halftoneAngle: 0,
  ledGap: 1,
  ledShape: 'circle',
  stippleDotSize: 2,
  stippleDensity: 3
}

export const createRenderingSlice = (set, get) => ({
  ...RENDERING_DEFAULTS,

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
  setPixelSize: (pixelSize) => set({ pixelSize: clamp(pixelSize, 1, 32) }),
  setDitherType: (ditherType) => set({ ditherType }),
  setInvert: (invert) => set({ invert }),
  setMinBrightness: (minBrightness) => set({ minBrightness: clamp(minBrightness, 0.01, 0.5) }),
  setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
  setRenderMode: (renderMode) => {
    const update = { renderMode }
    if (renderMode === 'ascii' && get().pixelSize < 8) {
      update.pixelSize = 10
    }
    set(update)
  },
  setSeed: (seed) => set({ seed }),
  randomizeSeed: () => set({ seed: randomSeed() }),
  setCharRamp: (charRamp) => set({ charRamp }),
  setAsciiColored: (asciiColored) => set({ asciiColored }),
  setHalftoneDotShape: (halftoneDotShape) => set({ halftoneDotShape }),
  setHalftoneAngle: (halftoneAngle) => set({ halftoneAngle: Math.max(0, Math.min(179, halftoneAngle)) }),
  setLedGap: (ledGap) => set({ ledGap: clamp(ledGap, 0, 4) }),
  setLedShape: (ledShape) => set({ ledShape }),
  setStippleDotSize: (stippleDotSize) => set({ stippleDotSize: clamp(stippleDotSize, 1, 6) }),
  setStippleDensity: (stippleDensity) => set({ stippleDensity: clamp(stippleDensity, 1, 5) })
})
