import JSZip from 'jszip'
import { captureFrames, getFrameCount } from './framesProvider.js'

const COLUMNS = 6

function buildSpriteSheetCanvas(frames, frameW, frameH) {
  const rows = Math.ceil(frames.length / COLUMNS)
  const canvas = document.createElement('canvas')
  canvas.width = COLUMNS * frameW
  canvas.height = rows * frameH
  const ctx = canvas.getContext('2d')

  for (let i = 0; i < frames.length; i++) {
    const cell = document.createElement('canvas')
    cell.width = frameW
    cell.height = frameH
    cell.getContext('2d').putImageData(frames[i], 0, 0)
    ctx.drawImage(cell, (i % COLUMNS) * frameW, Math.floor(i / COLUMNS) * frameH)
  }
  return canvas
}

/**
 * Generate CSS keyframe animation.
 * Uses explicit per-frame @keyframes with steps(1, end) timing — handles both
 * single-row and multi-row sprite sheets uniformly. The 100% stop is omitted
 * so the loop restarts cleanly at 0% without showing any frame twice.
 */
function generateCss(name, frameW, frameH, frameCount, loopMs) {
  const rows = Math.ceil(frameCount / COLUMNS)
  const totalW = COLUMNS * frameW
  const totalH = rows * frameH

  const stops = []
  for (let i = 0; i < frameCount; i++) {
    const pct = ((i / frameCount) * 100).toFixed(4).replace(/\.?0+$/, '')
    const x = (i % COLUMNS) * frameW
    const y = Math.floor(i / COLUMNS) * frameH
    stops.push(`  ${pct}% { background-position: -${x}px -${y}px; }`)
  }

  return `.${name} {
  display: inline-block;
  width: ${frameW}px;
  height: ${frameH}px;
  background-image: url('./${name}-sprite.png');
  background-repeat: no-repeat;
  background-size: ${totalW}px ${totalH}px;
  animation: ${name}-frames ${loopMs}ms steps(1, end) infinite;
}

@keyframes ${name}-frames {
${stops.join('\n')}
}
`
}

function generateCssReadme(name, frameW, frameH) {
  return `# ${name} — CSS Animation

BitmapForge CSS export. No JavaScript required.

## Usage

\`\`\`html
<link rel="stylesheet" href="./${name}.css">

<div class="${name}"></div>
\`\`\`

The sprite sheet \`${name}-sprite.png\` must be served alongside the CSS file.

## Sizing

The default size is ${frameW}×${frameH}px (the original canvas size).
To scale up without blurring, use CSS \`transform: scale(2)\` or similar.

## Notes

- Works in all modern browsers — pure CSS, no JavaScript.
- To change animation speed, override the \`animation-duration\` property.
- To pause: \`.${name} { animation-play-state: paused; }\`
`
}

async function buildCssAnimation(
  manager,
  state,
  name = 'bitmapforge-animation',
  fps = 16,
  { signal, onProgress } = {}
) {
  const frameCount = getFrameCount(manager, fps)
  const loopMs = manager.getLoopDurationMs()
  const sourceCanvas = manager.getCanvas()
  const frameW = sourceCanvas.width
  const frameH = sourceCanvas.height

  const frames = await captureFrames(manager, frameCount, { signal, onProgress })

  const spriteCanvas = buildSpriteSheetCanvas(frames, frameW, frameH)
  const spriteBlob = await new Promise((resolve) => spriteCanvas.toBlob(resolve, 'image/png'))
  const css = generateCss(name, frameW, frameH, frameCount, loopMs)

  const zip = new JSZip()
  zip.file(`${name}.css`, css)
  zip.file(`${name}-sprite.png`, spriteBlob)
  zip.file('README.md', generateCssReadme(name, frameW, frameH))

  return zip.generateAsync({ type: 'blob' })
}

export { buildCssAnimation, generateCss }
