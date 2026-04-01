import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { temporal } from 'zundo'
import { DEFAULT_ANIMATION_EFFECTS } from '../../engine/animation/effectTypes.js'

import { createRenderingSlice, RENDERING_DEFAULTS } from './slices/renderingSlice.js'
import { createAnimationSlice, ANIMATION_DEFAULTS } from './slices/animationSlice.js'
import { createPostEffectsSlice, POST_EFFECTS_DEFAULTS } from './slices/postEffectsSlice.js'
import { createInputSlice } from './slices/inputSlice.js'
import { createTransformSlice, TRANSFORM_DEFAULTS } from './slices/transformSlice.js'
import { createStatusSlice } from './slices/statusSlice.js'

const DEFAULT_STATE = {
  ...RENDERING_DEFAULTS,
  ...ANIMATION_DEFAULTS,
  ...POST_EFFECTS_DEFAULTS,
  // inputSlice: only undoable fields (model, imageSource excluded)
  inputType: 'model',
  shapeType: 'cube',
  shapeParams: {},
  textContent: 'BitmapForge',
  fontSize: 0.8,
  extrudeDepth: 0.3,
  bevelEnabled: true,
  fontFamily: 'helvetiker',
  ...TRANSFORM_DEFAULTS,
  // model, imageSource, status, pluginParams intentionally excluded
  // (non-undoable / binary / transient)
  model: null,
  imageSource: null,
  status: { loading: false, error: '', exporting: false, message: '', progress: 0 },
  pluginParams: {}
}

const useProjectStore = create(
  temporal(
    subscribeWithSelector((set, get, api) => ({
      ...createRenderingSlice(set, get, api),
      ...createAnimationSlice(set, get, api),
      ...createPostEffectsSlice(set, get, api),
      ...createInputSlice(set, get, api),
      ...createTransformSlice(set, get, api),
      ...createStatusSlice(set, get, api),
      resetToDefaults: () => set({ ...DEFAULT_STATE, animationEffects: { ...DEFAULT_ANIMATION_EFFECTS } })
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
