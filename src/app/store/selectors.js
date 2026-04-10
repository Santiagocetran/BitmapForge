export const selectEffectOptions = (state) => ({
  pixelSize: state.pixelSize,
  ditherType: state.ditherType,
  colors: state.colors,
  invert: state.invert,
  minBrightness: state.minBrightness,
  backgroundColor: state.backgroundColor,
  animationDuration: state.animationDuration,
  fadeVariant: state.fadeVariant,
  seed: state.seed,
  charRamp: state.charRamp,
  asciiColored: state.asciiColored,
  halftoneDotShape: state.halftoneDotShape,
  halftoneAngle: state.halftoneAngle,
  ledGap: state.ledGap,
  ledShape: state.ledShape,
  stippleDotSize: state.stippleDotSize,
  stippleDensity: state.stippleDensity,
  crtEnabled: state.crtEnabled,
  scanlineGap: state.scanlineGap,
  scanlineOpacity: state.scanlineOpacity,
  chromaticAberration: state.chromaticAberration,
  crtVignette: state.crtVignette,
  noiseEnabled: state.noiseEnabled,
  noiseAmount: state.noiseAmount,
  noiseMonochrome: state.noiseMonochrome,
  colorShiftEnabled: state.colorShiftEnabled,
  colorShiftHue: state.colorShiftHue,
  colorShiftSaturation: state.colorShiftSaturation
})

export const selectAnimationOptions = (state) => ({
  useFadeInOut: state.useFadeInOut,
  fadeMode: state.fadeMode,
  animationEffects: state.animationEffects,
  animationSpeed: state.animationSpeed,
  showPhaseDuration: state.showPhaseDuration,
  animationDuration: state.animationDuration,
  animationPreset: state.animationPreset,
  rotateOnShow: state.rotateOnShow,
  showPreset: state.showPreset
})

export const selectInputSource = (state) => ({
  inputType: state.inputType,
  model: state.model,
  shapeType: state.shapeType,
  shapeParams: state.shapeParams,
  textContent: state.textContent,
  fontSize: state.fontSize,
  extrudeDepth: state.extrudeDepth,
  bevelEnabled: state.bevelEnabled,
  fontFamily: state.fontFamily,
  letterSpacing: state.letterSpacing,
  imageSource: state.imageSource
})
