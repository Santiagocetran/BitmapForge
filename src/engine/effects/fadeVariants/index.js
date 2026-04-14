import { CascadeVariant } from './CascadeVariant.js'
import { StaticVariant } from './StaticVariant.js'
import { GlitchVariant } from './GlitchVariant.js'
import { DriftVariant } from './DriftVariant.js'
import { ScatterVariant } from './ScatterVariant.js'

const FADE_VARIANT_LABELS = {
  cascade: 'Cascade',
  static: 'Static',
  glitch: 'Glitch',
  drift: 'Drift',
  scatter: 'Scatter'
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
    case 'scatter':
      return new ScatterVariant(options)
    case 'cascade':
    default:
      return new CascadeVariant(options)
  }
}

export { createFadeVariant, FADE_VARIANT_KEYS, FADE_VARIANT_LABELS }
