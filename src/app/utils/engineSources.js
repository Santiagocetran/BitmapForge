// Single source of truth for all engine ?raw imports.
// Consumed by codeExport, reactComponentExport, and webComponentExport.
import engineIndexSrc from '../../engine/index.js?raw'
import SceneManagerSrc from '../../engine/SceneManager.js?raw'
import BaseEffectSrc from '../../engine/effects/BaseEffect.js?raw'
import BitmapEffectSrc from '../../engine/effects/BitmapEffect.js?raw'
import ditherStrategiesSrc from '../../engine/effects/ditherStrategies.js?raw'
import BaseFadeVariantSrc from '../../engine/effects/fadeVariants/BaseFadeVariant.js?raw'
import BloomVariantSrc from '../../engine/effects/fadeVariants/BloomVariant.js?raw'
import CascadeVariantSrc from '../../engine/effects/fadeVariants/CascadeVariant.js?raw'
import StaticVariantSrc from '../../engine/effects/fadeVariants/StaticVariant.js?raw'
import GlitchVariantSrc from '../../engine/effects/fadeVariants/GlitchVariant.js?raw'
import fadeVariantsIndexSrc from '../../engine/effects/fadeVariants/index.js?raw'
import BaseRendererSrc from '../../engine/renderers/BaseRenderer.js?raw'
import BitmapRendererSrc from '../../engine/renderers/BitmapRenderer.js?raw'
import PixelArtRendererSrc from '../../engine/renderers/PixelArtRenderer.js?raw'
import AsciiRendererSrc from '../../engine/renderers/AsciiRenderer.js?raw'
import renderersIndexSrc from '../../engine/renderers/index.js?raw'
import modelLoaderSrc from '../../engine/loaders/modelLoader.js?raw'
import AnimationEngineSrc from '../../engine/animation/AnimationEngine.js?raw'
import presetsSrc from '../../engine/animation/presets.js?raw'
import effectTypesSrc from '../../engine/animation/effectTypes.js?raw'
import seededRandomSrc from '../../engine/utils/seededRandom.js?raw'

// Each entry: { path, content }
// path is relative to whatever root folder the consumer creates (e.g. 'engine/SceneManager.js')
// Required entries (checked by engineSources.test.js):
//   engine/index.js, engine/SceneManager.js, engine/effects/BaseEffect.js,
//   engine/effects/BitmapEffect.js, engine/effects/ditherStrategies.js,
//   engine/effects/fadeVariants/*, engine/renderers/*, engine/loaders/modelLoader.js,
//   engine/animation/*, engine/utils/seededRandom.js
const ENGINE_SOURCES = [
  { path: 'engine/index.js', content: engineIndexSrc },
  { path: 'engine/SceneManager.js', content: SceneManagerSrc },
  { path: 'engine/effects/BaseEffect.js', content: BaseEffectSrc },
  { path: 'engine/effects/BitmapEffect.js', content: BitmapEffectSrc },
  { path: 'engine/effects/ditherStrategies.js', content: ditherStrategiesSrc },
  { path: 'engine/effects/fadeVariants/BaseFadeVariant.js', content: BaseFadeVariantSrc },
  { path: 'engine/effects/fadeVariants/BloomVariant.js', content: BloomVariantSrc },
  { path: 'engine/effects/fadeVariants/CascadeVariant.js', content: CascadeVariantSrc },
  { path: 'engine/effects/fadeVariants/StaticVariant.js', content: StaticVariantSrc },
  { path: 'engine/effects/fadeVariants/GlitchVariant.js', content: GlitchVariantSrc },
  { path: 'engine/effects/fadeVariants/index.js', content: fadeVariantsIndexSrc },
  { path: 'engine/renderers/BaseRenderer.js', content: BaseRendererSrc },
  { path: 'engine/renderers/BitmapRenderer.js', content: BitmapRendererSrc },
  { path: 'engine/renderers/PixelArtRenderer.js', content: PixelArtRendererSrc },
  { path: 'engine/renderers/AsciiRenderer.js', content: AsciiRendererSrc },
  { path: 'engine/renderers/index.js', content: renderersIndexSrc },
  { path: 'engine/loaders/modelLoader.js', content: modelLoaderSrc },
  { path: 'engine/animation/AnimationEngine.js', content: AnimationEngineSrc },
  { path: 'engine/animation/presets.js', content: presetsSrc },
  { path: 'engine/animation/effectTypes.js', content: effectTypesSrc },
  { path: 'engine/utils/seededRandom.js', content: seededRandomSrc }
]

export { ENGINE_SOURCES }
