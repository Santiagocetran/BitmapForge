import { buildProjectPayload } from './projectFile.js'

export async function buildEmbedZip(state) {
  const { default: JSZip } = await import('jszip')

  // Fetch pre-built embed SDK (BASE_URL handles non-root deploys)
  const embedUrl = `${import.meta.env.BASE_URL}embed/bitmap-forge.es.js`
  const res = await fetch(embedUrl)
  if (!res.ok) throw new Error('Embed SDK not available. Run npm run build:embed first.')
  const embedJs = await res.text()

  // Build .bforge payload (full settings)
  const payload = await buildProjectPayload(state)
  const bforgeJson = JSON.stringify(payload)

  const zip = new JSZip()
  const folder = zip.folder('my-animation')
  folder.file('bitmap-forge.es.js', embedJs)
  folder.file('animation.bforge', bforgeJson)
  folder.file('index.html', buildIndexHtml('module'))
  folder.file('index-iife.html', buildIndexHtml('iife'))

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } })
}

function buildIndexHtml(variant) {
  if (variant === 'iife') {
    return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BitmapForge Animation</title>
  <script src="https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.min.js"></script>
  <script src="./bitmap-forge.iife.js"></script>
  <style>
    body { margin: 0; background: #0a0a0a; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    bitmap-forge { width: 600px; height: 600px; display: block; }
  </style>
</head>
<body>
  <bitmap-forge src="./animation.bforge" autoplay loop></bitmap-forge>
</body>
</html>`
  }

  // Default: ESM + import map (modern browsers)
  return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BitmapForge Animation</title>
  <!-- three@0.182.0 via CDN — requires Chrome 89+, Firefox 108+, Safari 16.4+ -->
  <!-- For older browsers, open index-iife.html instead -->
  <script type="importmap">
    { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js" } }
  </script>
  <script type="module" src="./bitmap-forge.es.js"></script>
  <style>
    body { margin: 0; background: #0a0a0a; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    bitmap-forge { width: 600px; height: 600px; display: block; }
  </style>
</head>
<body>
  <bitmap-forge src="./animation.bforge" autoplay loop></bitmap-forge>
</body>
</html>`
}
