import { BitmapRenderer } from './BitmapRenderer.js'
import { PixelArtRenderer } from './PixelArtRenderer.js'
import { AsciiRenderer } from './AsciiRenderer.js'
import { HalftoneRenderer } from './HalftoneRenderer.js'
import { LedMatrixRenderer } from './LedMatrixRenderer.js'
import { StippleRenderer } from './StippleRenderer.js'

const RENDERERS = {
  bitmap: BitmapRenderer,
  pixelArt: PixelArtRenderer,
  ascii: AsciiRenderer,
  halftone: HalftoneRenderer,
  ledMatrix: LedMatrixRenderer,
  stipple: StippleRenderer
}

const RENDERER_LABELS = {
  bitmap: 'Bitmap (Dithered)',
  pixelArt: 'Pixel Art (Clean)',
  ascii: 'ASCII Art',
  halftone: 'Halftone',
  ledMatrix: 'LED Matrix',
  stipple: 'Stipple (Pointillism)'
}

/**
 * Instantiate a renderer by mode key.
 * @param {string} mode - key in RENDERERS ('bitmap' | 'pixelArt')
 * @param {object} [options] - initial renderer options
 * @returns {import('./BaseRenderer.js').BaseRenderer}
 */
function createRenderer(mode, options = {}) {
  const Renderer = RENDERERS[mode]
  if (!Renderer) throw new Error(`Unknown render mode: "${mode}". Valid modes: ${Object.keys(RENDERERS).join(', ')}`)
  return new Renderer(options)
}

export { RENDERERS, RENDERER_LABELS, createRenderer }
