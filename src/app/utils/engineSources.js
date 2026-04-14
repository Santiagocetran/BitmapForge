// Single source of truth for all engine ?raw imports.
// Consumed by codeExport, reactComponentExport, and webComponentExport.
import engineIndexSrc from '../../engine/index.js?raw'
import SceneManagerSrc from '../../engine/SceneManager.js?raw'
import BaseEffectSrc from '../../engine/effects/BaseEffect.js?raw'
import BitmapEffectSrc from '../../engine/effects/BitmapEffect.js?raw'
import ditherStrategiesSrc from '../../engine/effects/ditherStrategies.js?raw'
import BaseFadeVariantSrc from '../../engine/effects/fadeVariants/BaseFadeVariant.js?raw'
import CascadeVariantSrc from '../../engine/effects/fadeVariants/CascadeVariant.js?raw'
import StaticVariantSrc from '../../engine/effects/fadeVariants/StaticVariant.js?raw'
import GlitchVariantSrc from '../../engine/effects/fadeVariants/GlitchVariant.js?raw'
import DriftVariantSrc from '../../engine/effects/fadeVariants/DriftVariant.js?raw'
import ScatterVariantSrc from '../../engine/effects/fadeVariants/ScatterVariant.js?raw'
import fadeVariantsIndexSrc from '../../engine/effects/fadeVariants/index.js?raw'
import BaseRendererSrc from '../../engine/renderers/BaseRenderer.js?raw'
import BitmapRendererSrc from '../../engine/renderers/BitmapRenderer.js?raw'
import PixelArtRendererSrc from '../../engine/renderers/PixelArtRenderer.js?raw'
import AsciiRendererSrc from '../../engine/renderers/AsciiRenderer.js?raw'
import HalftoneRendererSrc from '../../engine/renderers/HalftoneRenderer.js?raw'
import LedMatrixRendererSrc from '../../engine/renderers/LedMatrixRenderer.js?raw'
import StippleRendererSrc from '../../engine/renderers/StippleRenderer.js?raw'
import renderersIndexSrc from '../../engine/renderers/index.js?raw'
import modelLoaderSrc from '../../engine/loaders/modelLoader.js?raw'
import AnimationEngineSrc from '../../engine/animation/AnimationEngine.js?raw'
import presetsSrc from '../../engine/animation/presets.js?raw'
import effectTypesSrc from '../../engine/animation/effectTypes.js?raw'
import BaseAnimationEffectSrc from '../../engine/animation/effects/BaseAnimationEffect.js?raw'
import SpinEffectSrc from '../../engine/animation/effects/SpinEffect.js?raw'
import FloatEffectSrc from '../../engine/animation/effects/FloatEffect.js?raw'
import BounceEffectSrc from '../../engine/animation/effects/BounceEffect.js?raw'
import PulseEffectSrc from '../../engine/animation/effects/PulseEffect.js?raw'
import ShakeEffectSrc from '../../engine/animation/effects/ShakeEffect.js?raw'
import OrbitEffectSrc from '../../engine/animation/effects/OrbitEffect.js?raw'
import seededRandomSrc from '../../engine/utils/seededRandom.js?raw'
import PostProcessingChainSrc from '../../engine/postprocessing/PostProcessingChain.js?raw'
import CrtEffectSrc from '../../engine/postprocessing/effects/CrtEffect.js?raw'
import NoiseEffectSrc from '../../engine/postprocessing/effects/NoiseEffect.js?raw'
import ColorShiftEffectSrc from '../../engine/postprocessing/effects/ColorShiftEffect.js?raw'
import shapeGeneratorSrc from '../../engine/loaders/shapeGenerator.js?raw'
import textGeneratorSrc from '../../engine/loaders/textGenerator.js?raw'
import imageLoaderSrc from '../../engine/loaders/imageLoader.js?raw'
import PluginRegistrySrc from '../../engine/plugins/PluginRegistry.js?raw'
import builtinPluginsSrc from '../../engine/plugins/builtinPlugins.js?raw'

// Each entry: { path, content }
// path is relative to whatever root folder the consumer creates (e.g. 'engine/SceneManager.js')
// Required entries (checked by engineSources.test.js):
//   engine/index.js, engine/SceneManager.js, engine/effects/BaseEffect.js,
//   engine/effects/BitmapEffect.js, engine/effects/ditherStrategies.js,
//   engine/effects/fadeVariants/*, engine/renderers/*, engine/loaders/*,
//   engine/animation/*, engine/utils/seededRandom.js,
//   engine/postprocessing/PostProcessingChain.js, engine/postprocessing/effects/*,
//   engine/plugins/*
const ENGINE_SOURCES = [
  { path: 'engine/index.js', content: engineIndexSrc },
  { path: 'engine/SceneManager.js', content: SceneManagerSrc },
  { path: 'engine/effects/BaseEffect.js', content: BaseEffectSrc },
  { path: 'engine/effects/BitmapEffect.js', content: BitmapEffectSrc },
  { path: 'engine/effects/ditherStrategies.js', content: ditherStrategiesSrc },
  { path: 'engine/effects/fadeVariants/BaseFadeVariant.js', content: BaseFadeVariantSrc },
  { path: 'engine/effects/fadeVariants/CascadeVariant.js', content: CascadeVariantSrc },
  { path: 'engine/effects/fadeVariants/StaticVariant.js', content: StaticVariantSrc },
  { path: 'engine/effects/fadeVariants/GlitchVariant.js', content: GlitchVariantSrc },
  { path: 'engine/effects/fadeVariants/DriftVariant.js', content: DriftVariantSrc },
  { path: 'engine/effects/fadeVariants/ScatterVariant.js', content: ScatterVariantSrc },
  { path: 'engine/effects/fadeVariants/index.js', content: fadeVariantsIndexSrc },
  { path: 'engine/renderers/BaseRenderer.js', content: BaseRendererSrc },
  { path: 'engine/renderers/BitmapRenderer.js', content: BitmapRendererSrc },
  { path: 'engine/renderers/PixelArtRenderer.js', content: PixelArtRendererSrc },
  { path: 'engine/renderers/AsciiRenderer.js', content: AsciiRendererSrc },
  { path: 'engine/renderers/HalftoneRenderer.js', content: HalftoneRendererSrc },
  { path: 'engine/renderers/LedMatrixRenderer.js', content: LedMatrixRendererSrc },
  { path: 'engine/renderers/StippleRenderer.js', content: StippleRendererSrc },
  { path: 'engine/renderers/index.js', content: renderersIndexSrc },
  { path: 'engine/loaders/modelLoader.js', content: modelLoaderSrc },
  { path: 'engine/loaders/shapeGenerator.js', content: shapeGeneratorSrc },
  { path: 'engine/loaders/textGenerator.js', content: textGeneratorSrc },
  { path: 'engine/loaders/imageLoader.js', content: imageLoaderSrc },
  { path: 'engine/animation/AnimationEngine.js', content: AnimationEngineSrc },
  { path: 'engine/animation/presets.js', content: presetsSrc },
  { path: 'engine/animation/effectTypes.js', content: effectTypesSrc },
  { path: 'engine/animation/effects/BaseAnimationEffect.js', content: BaseAnimationEffectSrc },
  { path: 'engine/animation/effects/SpinEffect.js', content: SpinEffectSrc },
  { path: 'engine/animation/effects/FloatEffect.js', content: FloatEffectSrc },
  { path: 'engine/animation/effects/BounceEffect.js', content: BounceEffectSrc },
  { path: 'engine/animation/effects/PulseEffect.js', content: PulseEffectSrc },
  { path: 'engine/animation/effects/ShakeEffect.js', content: ShakeEffectSrc },
  { path: 'engine/animation/effects/OrbitEffect.js', content: OrbitEffectSrc },
  { path: 'engine/utils/seededRandom.js', content: seededRandomSrc },
  { path: 'engine/postprocessing/PostProcessingChain.js', content: PostProcessingChainSrc },
  { path: 'engine/postprocessing/effects/CrtEffect.js', content: CrtEffectSrc },
  { path: 'engine/postprocessing/effects/NoiseEffect.js', content: NoiseEffectSrc },
  { path: 'engine/postprocessing/effects/ColorShiftEffect.js', content: ColorShiftEffectSrc },
  { path: 'engine/plugins/PluginRegistry.js', content: PluginRegistrySrc },
  { path: 'engine/plugins/builtinPlugins.js', content: builtinPluginsSrc }
]

export { ENGINE_SOURCES }
