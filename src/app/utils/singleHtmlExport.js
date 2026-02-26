/**
 * Build a self-contained HTML file that plays back the animation as a canvas loop.
 * @param {ImageData[]} frames - Pre-rendered animation frames
 * @param {number} fps - Playback fps
 * @param {string} backgroundColor - CSS color for background (default '#000000')
 * @returns {Promise<Blob>} HTML file as a Blob
 */
async function buildSingleHtml(frames, fps, backgroundColor = '#000000') {
  // Convert each ImageData frame to a base64 PNG data URL
  const base64Frames = []
  for (const frame of frames) {
    const canvas = document.createElement('canvas')
    canvas.width = frame.width
    canvas.height = frame.height
    const ctx = canvas.getContext('2d')
    ctx.putImageData(frame, 0, 0)
    base64Frames.push(canvas.toDataURL('image/png'))
  }

  const width = frames[0].width
  const height = frames[0].height
  const frameDataJson = JSON.stringify(base64Frames)

  const htmlString = `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BitmapForge Animation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${backgroundColor}; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    canvas { image-rendering: pixelated; image-rendering: crisp-edges; max-width: 100%; max-height: 100vh; }
  </style>
</head>
<body>
<canvas id="c"></canvas>
<script>
const frames = ${frameDataJson};
const fps = ${fps};
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.width = ${width};
canvas.height = ${height};
let i = 0;
const imgs = frames.map(src => { const img = new Image(); img.src = src; return img; });
const delay = 1000 / fps;
let last = 0;
function loop(ts) {
  if (ts - last >= delay) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgs[i % imgs.length], 0, 0);
    i++;
    last = ts;
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
</script>
</body>
</html>`

  return new Blob([htmlString], { type: 'text/html' })
}

export { buildSingleHtml }
