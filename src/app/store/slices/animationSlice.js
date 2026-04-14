import { DEFAULT_ANIMATION_EFFECTS } from '../../../engine/animation/effectTypes.js'

export const ANIMATION_DEFAULTS = {
  useFadeInOut: true,
  fadeVariant: 'glitch',
  fadeMode: 'both',
  animationEffects: { ...DEFAULT_ANIMATION_EFFECTS },
  animationSpeed: 1.0,
  showPhaseDuration: 3000,
  animationDuration: 2500,
  animationPreset: 'spinY',
  rotateOnShow: false,
  showPreset: 'spinY'
}

export const createAnimationSlice = (set, _get) => ({
  ...ANIMATION_DEFAULTS,

  setUseFadeInOut: (useFadeInOut) => set({ useFadeInOut }),
  setFadeVariant: (fadeVariant) => set({ fadeVariant }),
  setFadeMode: (fadeMode) => set({ fadeMode }),
  setAnimationEffect: (key, value) =>
    set((state) => ({
      animationEffects: { ...state.animationEffects, [key]: Boolean(value) }
    })),
  setAnimationPreset: (animationPreset) => set({ animationPreset }),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed: Math.max(0.01, animationSpeed) }),
  setShowPhaseDuration: (showPhaseDuration) => set({ showPhaseDuration: Math.max(100, showPhaseDuration) }),
  setAnimationDuration: (animationDuration) => set({ animationDuration: Math.max(100, animationDuration) }),
  setRotateOnShow: (rotateOnShow) => set({ rotateOnShow }),
  setShowPreset: (showPreset) => set({ showPreset })
})
