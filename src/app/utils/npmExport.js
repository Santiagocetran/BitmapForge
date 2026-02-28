import JSZip from 'jszip'

// Import engine source files as raw strings (Vite ?raw suffix)
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

function generateIndexJs(modelFileName) {
  if (modelFileName) {
    const src = `import { SceneManager } from './engine/SceneManager.js'
import { config } from './config.js'

// IMPORTANT: This package is browser-only. It requires a DOM environment and WebGL.
// Works with Vite and webpack 5. Rollup/esbuild users need a URL/asset plugin.

export async function createAnimation(container) {
  const manager = new SceneManager(container, config.effectOptions)

  if (container.clientWidth > 0 && container.clientHeight > 0) {
    manager.setSize(container.clientWidth, container.clientHeight)
  }

  const modelUrl = new URL('../assets/${modelFileName}', import.meta.url)
  const res = await fetch(modelUrl)
  if (!res.ok) throw new Error(\`Failed to load model: \${res.status} \${res.statusText}\`)
  const blob = await res.blob()
  const file = new File([blob], config.modelFileName)
  await manager.loadModel(file)

  manager.updateAnimationOptions({
    useFadeInOut: config.useFadeInOut,
    animationEffects: config.animationEffects,
    animationSpeed: config.animationSpeed,
    showPhaseDuration: config.showPhaseDuration,
    animationDuration: config.animationDuration,
    rotateOnShow: config.rotateOnShow,
    showPreset: config.showPreset
  })
  manager.setLightDirection(config.lightDirection.x, config.lightDirection.y, config.lightDirection.z)
  manager.setBaseRotation(config.baseRotation.x, config.baseRotation.y, config.baseRotation.z)

  return manager
}
`
    return src
  }

  return `import { SceneManager } from './engine/SceneManager.js'
import { config } from './config.js'

// IMPORTANT: This package is browser-only. It requires a DOM environment and WebGL.
// Works with Vite and webpack 5. Rollup/esbuild users need a URL/asset plugin.

export async function createAnimation(container) {
  const manager = new SceneManager(container, config.effectOptions)

  if (container.clientWidth > 0 && container.clientHeight > 0) {
    manager.setSize(container.clientWidth, container.clientHeight)
  }

  manager.updateAnimationOptions({
    useFadeInOut: config.useFadeInOut,
    animationEffects: config.animationEffects,
    animationSpeed: config.animationSpeed,
    showPhaseDuration: config.showPhaseDuration,
    animationDuration: config.animationDuration,
    rotateOnShow: config.rotateOnShow,
    showPreset: config.showPreset
  })
  manager.setLightDirection(config.lightDirection.x, config.lightDirection.y, config.lightDirection.z)
  manager.setBaseRotation(config.baseRotation.x, config.baseRotation.y, config.baseRotation.z)

  return manager
}
`
}

function generateConfigJs(state) {
  const modelFileName = state.model?.name ?? null
  const config = {
    modelFileName,
    effectOptions: {
      colors: state.colors,
      pixelSize: state.pixelSize,
      ditherType: state.ditherType,
      invert: state.invert,
      minBrightness: state.minBrightness,
      backgroundColor: state.backgroundColor,
      animationDuration: state.animationDuration,
      fadeVariant: state.fadeVariant
    },
    useFadeInOut: state.useFadeInOut,
    animationEffects: state.animationEffects,
    animationSpeed: state.animationSpeed,
    showPhaseDuration: state.showPhaseDuration,
    lightDirection: state.lightDirection,
    baseRotation: state.baseRotation,
    rotateOnShow: state.rotateOnShow,
    showPreset: state.showPreset
  }
  return `export const config = ${JSON.stringify(config, null, 2)}\n`
}

function generateReadme(packageName, packageVersion, modelFileName) {
  const modelNote = modelFileName ? `\nA 3D model (\`assets/${modelFileName}\`) is bundled with this package.\n` : ''
  return `# ${packageName}

BitmapForge animation package — v${packageVersion}
${modelNote}
## Install

\`\`\`bash
npm install ${packageName}
\`\`\`

## Usage

\`\`\`js
import { createAnimation } from '${packageName}'

const container = document.getElementById('app')
const manager = await createAnimation(container)

// Later, to clean up:
manager.destroy()
\`\`\`

## Requirements

- **Browser only** — requires a DOM environment and WebGL (Three.js)
- Works with **Vite** and **webpack 5** (static \`new URL\` asset handling)
- Rollup/esbuild users may need a URL/asset plugin

## Peer Dependencies

\`\`\`bash
npm install three
\`\`\`

## Updating settings

Export a new package from BitmapForge, bump the version, and run \`npm publish\`.
Consumers run \`npm update ${packageName}\` to get the new settings.

## License

MIT
`
}

async function buildNpmPackage(state, packageName, packageVersion) {
  if (!/^[a-z0-9][a-z0-9\-._]*$/.test(packageName) || packageName.length > 214) {
    throw new Error('Invalid package name. Use lowercase letters, numbers, hyphens only.')
  }

  const modelFileName = state.model?.name ?? null
  const zip = new JSZip()
  const root = zip.folder(packageName)

  // package.json
  root.file(
    'package.json',
    JSON.stringify(
      {
        name: packageName,
        version: packageVersion,
        description: 'BitmapForge animation — generated by BitmapForge',
        type: 'module',
        main: './src/index.js',
        exports: { '.': './src/index.js' },
        files: ['src', 'assets', 'README.md'],
        sideEffects: false,
        peerDependencies: { three: '>=0.150.0' },
        engines: { node: '>=18' },
        publishConfig: { access: 'public' },
        keywords: ['bitmapforge', 'three.js', 'animation', 'bitmap', '3d'],
        license: 'MIT'
      },
      null,
      2
    )
  )

  // README.md
  root.file('README.md', generateReadme(packageName, packageVersion, modelFileName))

  // src/index.js
  const srcFolder = root.folder('src')
  srcFolder.file('index.js', generateIndexJs(modelFileName))
  srcFolder.file('config.js', generateConfigJs(state))

  // src/engine/ — vendored engine source
  const engineFolder = srcFolder.folder('engine')
  engineFolder.file('index.js', engineIndexSrc)
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

  // assets/ — binary model file (not base64)
  if (state.model?.file) {
    const assetsFolder = root.folder('assets')
    assetsFolder.file(state.model.name, state.model.file)
  }

  return zip.generateAsync({ type: 'blob' })
}

export { buildNpmPackage }
