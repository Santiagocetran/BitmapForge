import JSZip from 'jszip'

// Import engine source files as raw strings (Vite ?raw suffix)
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

function createAnimationConfig(state) {
  return `export const config = ${JSON.stringify(
    {
      effectOptions: {
        colors: state.colors,
        pixelSize: state.pixelSize,
        ditherType: state.ditherType,
        invert: state.invert,
        minBrightness: state.minBrightness,
        backgroundColor: state.backgroundColor,
        animationDuration: state.animationDuration
      },
      animationPreset: state.animationPreset,
      animationSpeed: state.animationSpeed,
      showPhaseDuration: state.showPhaseDuration,
      rotateOnShow: state.rotateOnShow,
      showPreset: state.showPreset,
      lightDirection: state.lightDirection
    },
    null,
    2
  )}\n`
}

async function buildCodeZip(state) {
  const zip = new JSZip()
  const root = zip.folder('BitmapForge-export')

  root.file(
    'index.html',
    `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BitmapForge Export</title>
  </head>
  <body style="margin:0;background:#0a0a0a;">
    <div id="app" style="width:100vw;height:100vh;"></div>
    <script type="module" src="./animation.js"></script>
  </body>
</html>`
  )

  const modelName = state.model?.name ?? 'model'
  root.file(
    'animation.js',
    `import { SceneManager } from './engine/SceneManager.js'
import { config } from './config.js'

const container = document.getElementById('app')
const manager = new SceneManager(container, config.effectOptions)

fetch('./models/${modelName}')
  .then(res => { if (!res.ok) throw new Error('Failed to load model'); return res.blob() })
  .then(blob => new File([blob], '${modelName}'))
  .then(file => manager.loadModel(file))
`
  )

  root.file('config.js', createAnimationConfig(state))

  // Add real engine source files at their correct paths
  const engineFolder = root.folder('engine')
  engineFolder.file('SceneManager.js', SceneManagerSrc)

  const effectsFolder = engineFolder.folder('effects')
  effectsFolder.file('BaseEffect.js', BaseEffectSrc)
  effectsFolder.file('BitmapEffect.js', BitmapEffectSrc)

  const fadeVariantsFolder = effectsFolder.folder('fadeVariants')
  fadeVariantsFolder.file('BaseFadeVariant.js', BaseFadeVariantSrc)
  fadeVariantsFolder.file('BloomVariant.js', BloomVariantSrc)
  fadeVariantsFolder.file('CascadeVariant.js', CascadeVariantSrc)
  fadeVariantsFolder.file('StaticVariant.js', StaticVariantSrc)
  fadeVariantsFolder.file('GlitchVariant.js', GlitchVariantSrc)
  fadeVariantsFolder.file('index.js', fadeVariantsIndexSrc)

  const loadersFolder = engineFolder.folder('loaders')
  loadersFolder.file('modelLoader.js', modelLoaderSrc)

  const animationFolder = engineFolder.folder('animation')
  animationFolder.file('AnimationEngine.js', AnimationEngineSrc)
  animationFolder.file('presets.js', presetsSrc)
  animationFolder.file('effectTypes.js', effectTypesSrc)

  if (state.model?.file) {
    const modelsFolder = root.folder('models')
    modelsFolder.file(state.model.name, state.model.file)
  }

  root.file(
    'package.json',
    JSON.stringify(
      {
        name: 'bitmapforge-export',
        private: true,
        type: 'module',
        scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
        dependencies: { three: '^0.182.0' },
        devDependencies: { vite: '^7.2.4' }
      },
      null,
      2
    )
  )

  root.file('vite.config.js', `import { defineConfig } from 'vite'\nexport default defineConfig({})\n`)
  root.file('README.md', `# BitmapForge Export\n\n## Run\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`)

  return zip.generateAsync({ type: 'blob' })
}

export { buildCodeZip, createAnimationConfig }
