/**
 * builtinPlugins — registers all built-in renderers and post-effects with JSON schemas.
 *
 * Call registerBuiltins() once at app startup (module scope in App.jsx) before any
 * engine instantiation. Subsequent calls are no-ops (guarded by _registered flag).
 *
 * The schemas here are the machine-readable source of truth for every tunable parameter.
 * SchemaControls.jsx consumes them for plugin-contributed controls; built-in controls
 * remain hand-crafted in QualitySettings.jsx.
 */
import { pluginRegistry } from './PluginRegistry.js'
import { BitmapRenderer } from '../renderers/BitmapRenderer.js'
import { PixelArtRenderer } from '../renderers/PixelArtRenderer.js'
import { AsciiRenderer } from '../renderers/AsciiRenderer.js'
import { HalftoneRenderer } from '../renderers/HalftoneRenderer.js'
import { LedMatrixRenderer } from '../renderers/LedMatrixRenderer.js'
import { StippleRenderer } from '../renderers/StippleRenderer.js'
import { BloomEffect } from '../postprocessing/effects/BloomEffect.js'
import { CrtEffect } from '../postprocessing/effects/CrtEffect.js'
import { NoiseEffect } from '../postprocessing/effects/NoiseEffect.js'
import { ColorShiftEffect } from '../postprocessing/effects/ColorShiftEffect.js'

function registerBuiltins() {
  if (pluginRegistry._registered) return
  pluginRegistry._registered = true

  // ── Renderers ──────────────────────────────────────────────────────────────

  pluginRegistry.registerRenderer('bitmap', BitmapRenderer, {
    label: 'Bitmap (Dithered)',
    schema: {
      pixelSize: { type: 'integer', title: 'Pixel Size', minimum: 1, maximum: 32, default: 3 },
      ditherType: {
        type: 'string',
        title: 'Dither Type',
        enum: ['bayer4x4', 'bayer8x8', 'variableDot', 'floydSteinberg', 'atkinson'],
        default: 'bayer4x4'
      },
      invert: { type: 'boolean', title: 'Invert Brightness', default: false }
    }
  })

  pluginRegistry.registerRenderer('pixelArt', PixelArtRenderer, {
    label: 'Pixel Art (Clean)',
    schema: {
      pixelSize: { type: 'integer', title: 'Pixel Size', minimum: 1, maximum: 32, default: 3 }
    }
  })

  pluginRegistry.registerRenderer('ascii', AsciiRenderer, {
    label: 'ASCII Art',
    schema: {
      pixelSize: { type: 'integer', title: 'Character Size', minimum: 8, maximum: 32, default: 10 },
      charRamp: {
        type: 'string',
        title: 'Character Ramp',
        enum: ['classic', 'blocks', 'dense', 'minimal'],
        default: 'classic'
      },
      asciiColored: { type: 'boolean', title: 'Colored Mode', default: false }
    }
  })

  pluginRegistry.registerRenderer('halftone', HalftoneRenderer, {
    label: 'Halftone',
    schema: {
      pixelSize: { type: 'integer', title: 'Dot Spacing', minimum: 4, maximum: 20, default: 8 },
      halftoneDotShape: { type: 'string', title: 'Dot Shape', enum: ['circle', 'diamond'], default: 'circle' },
      halftoneAngle: { type: 'integer', title: 'Screen Angle', minimum: 0, maximum: 179, default: 0 },
      halftoneCmyk: { type: 'boolean', title: 'CMYK Mode', default: false }
    }
  })

  pluginRegistry.registerRenderer('ledMatrix', LedMatrixRenderer, {
    label: 'LED Matrix',
    schema: {
      pixelSize: { type: 'integer', title: 'LED Spacing', minimum: 4, maximum: 20, default: 8 },
      ledGap: { type: 'integer', title: 'LED Gap', minimum: 0, maximum: 4, default: 1 },
      ledShape: { type: 'string', title: 'LED Shape', enum: ['circle', 'roundRect'], default: 'circle' }
    }
  })

  pluginRegistry.registerRenderer('stipple', StippleRenderer, {
    label: 'Stipple (Pointillism)',
    schema: {
      pixelSize: { type: 'integer', title: 'Cell Size', minimum: 4, maximum: 20, default: 8 },
      stippleDotSize: { type: 'integer', title: 'Dot Size', minimum: 1, maximum: 6, default: 2 },
      stippleDensity: { type: 'integer', title: 'Dot Density', minimum: 1, maximum: 5, default: 3 }
    }
  })

  // ── Post-effects ───────────────────────────────────────────────────────────

  pluginRegistry.registerPostEffect('bloom', BloomEffect, {
    label: 'Bloom',
    schema: {
      bloomThreshold: { type: 'number', title: 'Threshold', minimum: 0.4, maximum: 0.95, default: 0.7 },
      bloomRadius: { type: 'integer', title: 'Radius', minimum: 1, maximum: 12, default: 4 },
      bloomStrength: { type: 'number', title: 'Strength', minimum: 0.1, maximum: 1.0, default: 0.6 }
    }
  })

  pluginRegistry.registerPostEffect('crt', CrtEffect, {
    label: 'CRT Effect',
    schema: {
      scanlineGap: { type: 'integer', title: 'Scanline Gap', minimum: 2, maximum: 8, default: 4 },
      scanlineOpacity: { type: 'number', title: 'Scanline Opacity', minimum: 0.1, maximum: 0.8, default: 0.4 },
      chromaticAberration: { type: 'integer', title: 'Chromatic Aberration', minimum: 0, maximum: 5, default: 0 },
      crtVignette: { type: 'number', title: 'Vignette', minimum: 0, maximum: 1, default: 0.3 }
    }
  })

  pluginRegistry.registerPostEffect('noise', NoiseEffect, {
    label: 'Noise / Grain',
    schema: {
      noiseAmount: { type: 'number', title: 'Amount', minimum: 0, maximum: 0.5, default: 0.15 },
      noiseMonochrome: { type: 'boolean', title: 'Monochrome', default: true }
    }
  })

  pluginRegistry.registerPostEffect('colorShift', ColorShiftEffect, {
    label: 'Color Shift',
    schema: {
      colorShiftHue: { type: 'integer', title: 'Hue', minimum: 0, maximum: 360, default: 0 },
      colorShiftSaturation: { type: 'number', title: 'Saturation', minimum: 0, maximum: 2, default: 1.0 }
    }
  })
}

export { registerBuiltins }
