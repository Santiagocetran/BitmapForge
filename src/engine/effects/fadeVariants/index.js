import { BloomVariant } from './BloomVariant.js'
import { CascadeVariant } from './CascadeVariant.js'
import { StaticVariant } from './StaticVariant.js'
import { GlitchVariant } from './GlitchVariant.js'

const FADE_VARIANT_LABELS = {
  bloom: 'Bloom',
  cascade: 'Cascade',
  static: 'Static',
  glitch: 'Glitch'
}

const FADE_VARIANT_KEYS = Object.keys(FADE_VARIANT_LABELS)

function createFadeVariant(name, options = {}) {
  switch (name) {
    case 'cascade':
      return new CascadeVariant(options)
    case 'static':
      return new StaticVariant(options)
    case 'glitch':
      return new GlitchVariant(options)
    case 'bloom':
    default:
      return new BloomVariant(options)
  }
}

export { createFadeVariant, FADE_VARIANT_KEYS, FADE_VARIANT_LABELS }
