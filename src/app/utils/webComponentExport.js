import JSZip from 'jszip'
import { ENGINE_SOURCES } from './engineSources.js'

// Config shape identical to reactComponentExport — same state fields
function createComponentConfig(state) {
  const config = {
    modelFileName: state.model?.name ?? null,
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

function generateWebComponentJs(elementName, modelFileName) {
  // Static URL literal required for Vite/webpack asset handling.
  // The filename is hardcoded at generation time, not at runtime.
  const modelBlock = modelFileName
    ? `
    // Load model — static URL literal required for Vite/webpack asset handling
    const modelUrl = new URL('./assets/${modelFileName}', import.meta.url)
    fetch(modelUrl)
      .then(res => { if (!res.ok) throw new Error('Failed to load model'); return res.blob() })
      .then(blob => new File([blob], config.modelFileName))
      .then(file => { if (this._manager) this._manager.loadModel(file) })`
    : ''

  return `import { SceneManager } from './engine/SceneManager.js'
import { config } from './config.js'

/**
 * <${elementName}> — BitmapForge Web Component
 * Works in any framework (React, Vue, Svelte) or plain HTML via <script type="module">.
 *
 * Plain HTML usage requires an import map for three.js:
 *   <script type="importmap">
 *     {"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js"}}
 *   </script>
 *   <script type="module" src="./${elementName}/${elementName}.js"></script>
 *   <${elementName} style="width:300px;height:300px;"></${elementName}>
 *
 * Vite/webpack projects: just import this file; three resolves from node_modules.
 */
class BitmapAnimationElement extends HTMLElement {
  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    // :host fills the space given to the element; canvas fills the shadow root
    style.textContent = ':host { display: block; } canvas { display: block; width: 100%; height: 100%; }'
    this._shadow.appendChild(style)

    const manager = new SceneManager(this._shadow, config.effectOptions)
    this._manager = manager

    const resize = () => manager.setSize(this.clientWidth || 300, this.clientHeight || 300)
    // rAF avoids measuring 0×0 before browser layout
    requestAnimationFrame(resize)
${modelBlock}
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

    this._ro = new ResizeObserver(resize)
    this._ro.observe(this)
  }

  disconnectedCallback() {
    this._ro?.disconnect()
    this._manager?.destroy()
    this._manager = null
  }
}

if (!customElements.get('${elementName}')) {
  customElements.define('${elementName}', BitmapAnimationElement)
}
`
}

function generateWebComponentReadme(elementName) {
  return `# <${elementName}>

BitmapForge Web Component — works in any framework or plain HTML.

## Plain HTML (import map required for three.js)

\`\`\`html
<!doctype html>
<html>
<head>
  <script type="importmap">
    {"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js"}}
  </script>
  <script type="module" src="./${elementName}/${elementName}.js"></script>
</head>
<body>
  <${elementName} style="width:300px;height:300px;"></${elementName}>
</body>
</html>
\`\`\`

## Vite / webpack project

Install three if not already present:
\`\`\`bash
npm install three
\`\`\`

Import the component (side-effect import registers the custom element):
\`\`\`js
import './${elementName}/${elementName}.js'
\`\`\`

Use in HTML or JSX:
\`\`\`html
<${elementName} style="width:300px;height:300px;"></${elementName}>
\`\`\`

## Sizing

The element fills whatever space you give it. Control size with CSS \`width\`/\`height\`.

## Notes

- **Browser only** — requires WebGL. No SSR.
- The \`engine/\` folder is vendored; no separate install needed beyond \`three\`.
- To update settings, re-export from BitmapForge and replace this folder.
`
}

async function buildWebComponent(state, elementName = 'bitmap-animation') {
  const zip = new JSZip()
  const root = zip.folder(elementName)
  const modelFileName = state.model?.name ?? null

  root.file(`${elementName}.js`, generateWebComponentJs(elementName, modelFileName))
  root.file('config.js', createComponentConfig(state))
  root.file('README.md', generateWebComponentReadme(elementName))

  for (const { path, content } of ENGINE_SOURCES) {
    root.file(path, content)
  }

  if (state.model?.file) {
    root.file(`assets/${state.model.name}`, state.model.file)
  }

  return zip.generateAsync({ type: 'blob' })
}

export { buildWebComponent }
