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
  // Uniform scale applied to the entire model group. Useful when imported models
  // are too small or too large relative to the camera frustum.
  modelScale: 1.0,
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
  // Stipple renderer settings
  stippleDotSize: 2, // dot radius in px (1–6)
  stippleDensity: 3, // max dots per dark cell (1–5)
  // CRT post-processing effect settings
  crtEnabled: false,
  scanlineGap: 4, // rows between scanlines (2–8)
  scanlineOpacity: 0.4, // darkness of scanline bands (0.1–0.8)
  chromaticAberration: 0, // R/B channel pixel shift (0–5)
  crtVignette: 0.3, // vignette corner strength (0–1)
  // Noise/grain post-processing effect settings
  noiseEnabled: false,
  noiseAmount: 0.15, // grain strength (0–0.5)
  noiseMonochrome: true, // same offset for R, G, B
  // Color shift post-processing effect settings
  colorShiftEnabled: false,
  colorShiftHue: 0, // hue rotation in degrees (0–360)
  colorShiftSaturation: 1.0, // saturation multiplier (0–2)
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
  // Arbitrary key→value map for plugin-contributed params.
  pluginParams: {}
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
      setPixelSize: (pixelSize) => set({ pixelSize: clamp(pixelSize, 1, 32) }),
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
      setModelScale: (scale) => set({ modelScale: clamp(scale, 0.1, 10) }),
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
      setStippleDotSize: (stippleDotSize) => set({ stippleDotSize: clamp(stippleDotSize, 1, 6) }),
      setStippleDensity: (stippleDensity) => set({ stippleDensity: clamp(stippleDensity, 1, 5) }),
      setCrtEnabled: (crtEnabled) => set({ crtEnabled }),
      setScanlineGap: (scanlineGap) => set({ scanlineGap: clamp(scanlineGap, 2, 8) }),
      setScanlineOpacity: (scanlineOpacity) => set({ scanlineOpacity: clamp(scanlineOpacity, 0.1, 0.8) }),
      setChromaticAberration: (chromaticAberration) => set({ chromaticAberration: clamp(chromaticAberration, 0, 5) }),
      setCrtVignette: (crtVignette) => set({ crtVignette: clamp(crtVignette, 0, 1) }),
      setNoiseEnabled: (noiseEnabled) => set({ noiseEnabled }),
      setNoiseAmount: (noiseAmount) => set({ noiseAmount: clamp(noiseAmount, 0, 0.5) }),
      setNoiseMonochrome: (noiseMonochrome) => set({ noiseMonochrome }),
      setColorShiftEnabled: (colorShiftEnabled) => set({ colorShiftEnabled }),
      setColorShiftHue: (colorShiftHue) => set({ colorShiftHue: clamp(colorShiftHue, 0, 360) }),
      setColorShiftSaturation: (colorShiftSaturation) =>
        set({ colorShiftSaturation: clamp(colorShiftSaturation, 0, 2) }),
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
      setPluginParam: (key, value) => set((state) => ({ pluginParams: { ...state.pluginParams, [key]: value } }))
    })),
    {
      // Only track meaningful visual state — exclude status, binary file objects,
      // plugin params, and all action functions
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([k, v]) =>
              k !== 'status' && k !== 'model' && k !== 'imageSource' && k !== 'pluginParams' && typeof v !== 'function'
          )
        ),
      limit: 50
    }
  )
)

export { useProjectStore, DEFAULT_STATE }
