import { CascadeVariant } from './CascadeVariant.js'
import { StaticVariant } from './StaticVariant.js'
import { GlitchVariant } from './GlitchVariant.js'
import { DriftVariant } from './DriftVariant.js'
import { SweepVariant } from './SweepVariant.js'
import { VortexVariant } from './VortexVariant.js'

const FADE_VARIANT_LABELS = {
  cascade: 'Cascade',
  static: 'Static',
  glitch: 'Glitch',
  drift: 'Drift',
  sweep: 'Sweep',
  vortex: 'Vortex'
}

const FADE_VARIANT_KEYS = Object.keys(FADE_VARIANT_LABELS)

function createFadeVariant(name, options = {}) {
  switch (name) {
    case 'static':
      return new StaticVariant(options)
    case 'glitch':
      return new GlitchVariant(options)
    case 'drift':
      return new DriftVariant(options)
    case 'sweep':
      return new SweepVariant(options)
    case 'vortex':
      return new VortexVariant(options)
    case 'cascade':
    default:
      return new CascadeVariant(options)
  }
}

export { createFadeVariant, FADE_VARIANT_KEYS, FADE_VARIANT_LABELS }
