/**
 * Builds the canonical export configuration object from store state.
 * This is the single source of truth for which state fields are serialized
 * into the config.js file bundled with each code export format.
 *
 * Returns a superset of all fields needed by codeExport, reactComponentExport,
 * and webComponentExport. Each consumer uses the fields relevant to its format.
 *
 * @param {object} state - Zustand store state snapshot
 * @returns {object} Plain serializable config object
 */
function buildExportConfig(state) {
  return {
    modelFileName: state.model?.name ?? null,
    effectOptions: {
      colors: state.colors,
      pixelSize: state.pixelSize,
      ditherType: state.ditherType,
      invert: state.invert,
      minBrightness: state.minBrightness,
      backgroundColor: state.backgroundColor,
      animationDuration: state.animationDuration,
      fadeVariant: state.fadeVariant,
      renderMode: state.renderMode ?? 'bitmap'
    },
    useFadeInOut: state.useFadeInOut,
    animationEffects: state.animationEffects,
    animationPreset: state.animationPreset,
    animationSpeed: state.animationSpeed,
    showPhaseDuration: state.showPhaseDuration,
    lightDirection: state.lightDirection,
    baseRotation: state.baseRotation,
    rotateOnShow: state.rotateOnShow,
    showPreset: state.showPreset
  }
}

export { buildExportConfig }
