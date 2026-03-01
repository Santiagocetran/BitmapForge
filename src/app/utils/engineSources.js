// Single source of truth for all engine ?raw imports.
// Consumed by codeExport, reactComponentExport, and webComponentExport.
import engineIndexSrc from '../../engine/index.js?raw'
import SceneManagerSrc from '../../engine/SceneManager.js?raw'
import BaseEffectSrc from '../../engine/effects/BaseEffect.js?raw'
import BitmapEffectSrc from '../../engine/effects/BitmapEffect.js?raw'
import BaseFadeVariantSrc from '../../engine/effects/fadeVariants/BaseFadeVariant.js?raw'
import BloomVariantSrc from '../../engine/effects/fadeVariants/BloomVariant.js?raw'
import CascadeVariantSrc from '../../engine/effects/fadeVariants/CascadeVariant.js?raw'
import StaticVariantSrc from '../../engine/effects/fadeVariants/StaticVariant.js?raw'
import GlitchVariantSrc from '../../engine/effects/fadeVariants/GlitchVariant.js?raw'
import fadeVariantsIndexSrc from '../../engine/effects/fadeVariants/index.js?raw'
import modelLoaderSrc from '../../engine/loaders/modelLoader.js?raw'
import AnimationEngineSrc from '../../engine/animation/AnimationEngine.js?raw'
import presetsSrc from '../../engine/animation/presets.js?raw'
import effectTypesSrc from '../../engine/animation/effectTypes.js?raw'

// Each entry: { path, content }
// path is relative to whatever root folder the consumer creates (e.g. 'engine/SceneManager.js')
const ENGINE_SOURCES = [
  { path: 'engine/index.js', content: engineIndexSrc },
  { path: 'engine/SceneManager.js', content: SceneManagerSrc },
  { path: 'engine/effects/BaseEffect.js', content: BaseEffectSrc },
  { path: 'engine/effects/BitmapEffect.js', content: BitmapEffectSrc },
  { path: 'engine/effects/fadeVariants/BaseFadeVariant.js', content: BaseFadeVariantSrc },
  { path: 'engine/effects/fadeVariants/BloomVariant.js', content: BloomVariantSrc },
  { path: 'engine/effects/fadeVariants/CascadeVariant.js', content: CascadeVariantSrc },
  { path: 'engine/effects/fadeVariants/StaticVariant.js', content: StaticVariantSrc },
  { path: 'engine/effects/fadeVariants/GlitchVariant.js', content: GlitchVariantSrc },
  { path: 'engine/effects/fadeVariants/index.js', content: fadeVariantsIndexSrc },
  { path: 'engine/loaders/modelLoader.js', content: modelLoaderSrc },
  { path: 'engine/animation/AnimationEngine.js', content: AnimationEngineSrc },
  { path: 'engine/animation/presets.js', content: presetsSrc },
  { path: 'engine/animation/effectTypes.js', content: effectTypesSrc }
]

export { ENGINE_SOURCES }
