import { DissolveVariant } from './DissolveVariant.js'
import { ScanlineVariant } from './ScanlineVariant.js'
import { RadialVariant } from './RadialVariant.js'
import { GlitchVariant } from './GlitchVariant.js'

const FADE_VARIANT_LABELS = {
  dissolve: 'Dissolve',
  scanline: 'Scanline',
  radial: 'Radial',
  glitch: 'Glitch'
}

const FADE_VARIANT_KEYS = Object.keys(FADE_VARIANT_LABELS)

function createFadeVariant(name, options = {}) {
  switch (name) {
    case 'scanline':
      return new ScanlineVariant(options)
    case 'radial':
      return new RadialVariant(options)
    case 'glitch':
      return new GlitchVariant(options)
    case 'dissolve':
    default:
      return new DissolveVariant(options)
  }
}

export { createFadeVariant, FADE_VARIANT_KEYS, FADE_VARIANT_LABELS }
