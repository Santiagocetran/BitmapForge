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
  // Rendering mode ('bitmap' | 'pixelArt' | 'ascii' | 'halftone') — controls active renderer in BitmapEffect
  renderMode: 'bitmap',
  // ASCII renderer settings
  charRamp: 'classic', // key into CHAR_RAMPS: 'classic' | 'blocks' | 'dense' | 'minimal'
  asciiColored: false, // false = monochrome (brightest palette color), true = full-palette mapping
  // Halftone renderer settings
  halftoneDotShape: 'circle', // 'circle' | 'diamond'
  halftoneAngle: 0, // degrees, normalized to [0, 180) by the renderer
  // LED Matrix renderer settings
  ledGap: 1, // gap between LED elements in px (0–4)
  ledShape: 'circle', // 'circle' | 'roundRect'
  // CRT post-processing effect settings
  crtEnabled: false,
  scanlineGap: 4, // rows between scanlines (2–8)
  scanlineOpacity: 0.4, // darkness of scanline bands (0.1–0.8)
  chromaticAberration: 0, // R/B channel pixel shift (0–5)
  crtVignette: 0.3, // vignette corner strength (0–1)
  // Input source type — which tab is active in the input panel
  inputType: 'model', // 'model' | 'shape' | 'text' | 'image'
  // Shape primitive settings
  shapeType: 'cube',
  shapeParams: {}, // merged with shapeGenerator defaults at load time
  // 3D text settings
  textContent: 'BitmapForge',
  fontSize: 0.8,
  extrudeDepth: 0.3,
  bevelEnabled: true,
  fontFamily: 'helvetiker',
  // Image input — File object excluded from undo history (binary data)
  imageSource: null,
  status: { loading: false, error: '', exporting: false, message: '', progress: 0 },

  // ---------------------------------------------------------------------------
  // Scene composition (#22): multi-layer support
  // ---------------------------------------------------------------------------
  // layers: array of LayerDescriptor objects. Each descriptor is fully serializable
  // (no File objects). File objects live in fileRegistry.js keyed by layer id.
  //
  // LayerDescriptor shape:
  // {
  //   id: string,          — nanoid or similar unique id
  //   name: string,        — display name ('Cube 1', 'model.stl', ...)
  //   type: 'model' | 'shape' | 'text' | 'image',
  //   visible: boolean,
  //   position: { x, y, z },
  //   rotation: { x, y, z },
  //   scale: number,
  //   // Type-specific (all serializable):
  //   // shape:  { shapeType, shapeParams }
  //   // text:   { textContent, fontFamily, fontSize, extrudeDepth, bevelEnabled }
  //   // model/image: { fileName, fileSize, format }  (File in fileRegistry)
  // }
  layers: [],
  // id of the layer selected in the layer panel (UI-only, excluded from undo)
  selectedLayerId: null
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
      setRenderMode: (renderMode) => {
        const update = { renderMode }
        // ASCII chars below 8px are unreadable — nudge pixelSize to a legible minimum
        if (renderMode === 'ascii' && get().pixelSize < 8) {
          update.pixelSize = 10
        }
        set(update)
      },
      setCharRamp: (charRamp) => set({ charRamp }),
      setAsciiColored: (asciiColored) => set({ asciiColored }),
      setHalftoneDotShape: (halftoneDotShape) => set({ halftoneDotShape }),
      setHalftoneAngle: (halftoneAngle) => set({ halftoneAngle: Math.max(0, Math.min(179, halftoneAngle)) }),
      setLedGap: (ledGap) => set({ ledGap: clamp(ledGap, 0, 4) }),
      setLedShape: (ledShape) => set({ ledShape }),
      setCrtEnabled: (crtEnabled) => set({ crtEnabled }),
      setScanlineGap: (scanlineGap) => set({ scanlineGap: clamp(scanlineGap, 2, 8) }),
      setScanlineOpacity: (scanlineOpacity) => set({ scanlineOpacity: clamp(scanlineOpacity, 0.1, 0.8) }),
      setChromaticAberration: (chromaticAberration) => set({ chromaticAberration: clamp(chromaticAberration, 0, 5) }),
      setCrtVignette: (crtVignette) => set({ crtVignette: clamp(crtVignette, 0, 1) }),
      setInputType: (inputType) => set({ inputType }),
      setShapeType: (shapeType) => set({ shapeType, shapeParams: {} }),
      setShapeParam: (key, value) => set((state) => ({ shapeParams: { ...state.shapeParams, [key]: value } })),
      setTextContent: (textContent) => set({ textContent }),
      setFontSize: (fontSize) => set({ fontSize: Math.max(0.1, fontSize) }),
      setExtrudeDepth: (extrudeDepth) => set({ extrudeDepth: Math.max(0.05, extrudeDepth) }),
      setBevelEnabled: (bevelEnabled) => set({ bevelEnabled }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setImageSource: (imageSource) => set({ imageSource }),
      setStatus: (partialStatus) => {
        set({ status: { ...get().status, ...partialStatus } })
      },
      resetToDefaults: () => set({ ...DEFAULT_STATE, animationEffects: { ...DEFAULT_ANIMATION_EFFECTS } }),

      // -------------------------------------------------------------------
      // Layer actions (#22)
      // -------------------------------------------------------------------
      addLayer: (descriptor) => set((state) => ({ layers: [...state.layers, descriptor] })),
      removeLayer: (id) => {
        set((state) => ({ layers: state.layers.filter((l) => l.id !== id) }))
      },
      setLayerVisible: (id, visible) =>
        set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, visible } : l)) })),
      setLayerTransform: (id, transform) =>
        set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, ...transform } : l)) })),
      updateLayer: (id, partial) =>
        set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, ...partial } : l)) })),
      reorderLayers: (newOrder) => set({ layers: newOrder }),
      selectLayer: (id) => set({ selectedLayerId: id })
    })),
    {
      // Only track meaningful visual state — exclude status, binary file objects,
      // UI-only selection state, and all action functions
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([k, v]) =>
              k !== 'status' &&
              k !== 'model' &&
              k !== 'imageSource' &&
              k !== 'selectedLayerId' &&
              typeof v !== 'function'
          )
        ),
      limit: 50
    }
  )
)

export { useProjectStore, DEFAULT_STATE }
