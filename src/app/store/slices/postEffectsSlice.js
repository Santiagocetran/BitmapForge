function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export const POST_EFFECTS_DEFAULTS = {
  crtEnabled: false,
  scanlineGap: 4,
  scanlineOpacity: 0.4,
  chromaticAberration: 0,
  crtVignette: 0.3,
  noiseEnabled: false,
  noiseAmount: 0.15,
  noiseMonochrome: true,
  colorShiftEnabled: false,
  colorShiftHue: 0,
  colorShiftSaturation: 1.0
}

export const createPostEffectsSlice = (set) => ({
  ...POST_EFFECTS_DEFAULTS,

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
  setColorShiftSaturation: (colorShiftSaturation) => set({ colorShiftSaturation: clamp(colorShiftSaturation, 0, 2) })
})
