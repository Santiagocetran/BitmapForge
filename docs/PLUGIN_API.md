# BitmapForge Plugin API

The Plugin API lets you add custom renderers and post-processing effects to BitmapForge without forking the engine. Plugins are registered with `pluginRegistry` and become available everywhere the engine uses `createRenderer()` or the post-processing chain.

---

## 1. Writing a renderer plugin

Extend `BaseRenderer` and implement `render()` and `drawPixel()`:

```js
// blueprint-renderer.js
import { BaseRenderer } from './engine/renderers/BaseRenderer.js'

class BlueprintRenderer extends BaseRenderer {
  init(width, height) {
    this._canvas = document.createElement('canvas')
    this._canvas.width = width
    this._canvas.height = height
    this._ctx = this._canvas.getContext('2d')
  }

  get canvas() {
    return this._canvas
  }

  beginFrame() {
    this._ctx.fillStyle = '#1a2a4a'
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height)
  }

  render(imageData, gridW, gridH, getColor) {
    const pixelSize = this.options.pixelSize ?? 4
    this._ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    this._ctx.lineWidth = 1

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const i = (y * gridW + x) * 4
        const brightness = imageData[i] / 255
        if (brightness < (this.options.minBrightness ?? 0.05)) continue
        this._ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize * brightness, pixelSize * brightness)
      }
    }
  }

  drawPixel(x, y, brightness, color, alpha = 1) {
    const pixelSize = this.options.pixelSize ?? 4
    this._ctx.globalAlpha = alpha
    this._ctx.strokeStyle = color
    this._ctx.strokeRect(x, y, pixelSize * brightness, pixelSize * brightness)
    this._ctx.globalAlpha = 1
  }

  setSize(width, height) {
    if (this._canvas) {
      this._canvas.width = width
      this._canvas.height = height
    }
  }

  dispose() {
    this._canvas = null
    this._ctx = null
  }
}

export { BlueprintRenderer }
```

---

## 2. Writing a post-effect plugin

Any class with an `apply(ctx, width, height, params)` method works:

```js
// sepia-effect.js
class SepiaEffect {
  apply(ctx, width, height, params) {
    if (width <= 0 || height <= 0) return
    const { sepiaAmount = 0.5 } = params

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2]
      const sr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
      const sg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
      const sb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
      data[i] = Math.round(r + (sr - r) * sepiaAmount)
      data[i + 1] = Math.round(g + (sg - g) * sepiaAmount)
      data[i + 2] = Math.round(b + (sb - b) * sepiaAmount)
    }

    ctx.putImageData(imageData, 0, 0)
  }
}

export { SepiaEffect }
```

---

## 3. JSON Schema field reference

Schemas describe a plugin's configurable parameters. `SchemaControls` renders them automatically.

| Schema field           | Renders as                         | Notes                                |
| ---------------------- | ---------------------------------- | ------------------------------------ |
| `type: 'boolean'`      | `<input type="checkbox">`          | `default` sets initial state         |
| `type: 'string', enum` | `<select>`                         | `enum` array becomes the option list |
| `type: 'integer'`      | `<input type="range">` (step 1)    | `minimum` / `maximum` set bounds     |
| `type: 'number'`       | `<input type="range">` (step 0.01) | `minimum` / `maximum` set bounds     |

Full field shape:

```js
{
  type: 'integer' | 'number' | 'boolean' | 'string',
  title: 'Human-readable label',   // shown as the control label
  minimum: 0,                       // integer/number only
  maximum: 100,                     // integer/number only
  enum: ['a', 'b', 'c'],            // string only
  default: 0                        // used when value is not provided
}
```

---

## 4. Registering your plugin

```js
import { pluginRegistry } from './engine/plugins/PluginRegistry.js'
import { BlueprintRenderer } from './blueprint-renderer.js'
import { SepiaEffect } from './sepia-effect.js'

// Register before any SceneManager is created
pluginRegistry.registerRenderer('blueprint', BlueprintRenderer, {
  label: 'Blueprint',
  schema: {
    pixelSize: { type: 'integer', title: 'Pixel Size', minimum: 2, maximum: 20, default: 4 }
  }
})

pluginRegistry.registerPostEffect('sepia', SepiaEffect, {
  label: 'Sepia Tone',
  schema: {
    sepiaAmount: { type: 'number', title: 'Amount', minimum: 0, maximum: 1, default: 0.5 }
  }
})
```

After registration, `createRenderer('blueprint')` returns a `BlueprintRenderer` instance, and `'blueprint'` appears in the render-mode dropdown automatically.

---

## 5. Worked example — Blueprint renderer

A complete blueprint-style renderer (white wireframe lines on a dark blue background):

```js
// Register at app entry point (before engine starts)
import { pluginRegistry } from '@bitmapforge/engine/plugins/PluginRegistry.js'
import { BlueprintRenderer } from './BlueprintRenderer.js'

pluginRegistry.registerRenderer('blueprint', BlueprintRenderer, {
  label: 'Blueprint',
  schema: {
    pixelSize: { type: 'integer', title: 'Cell Size', minimum: 2, maximum: 20, default: 4 },
    lineOpacity: { type: 'number', title: 'Line Opacity', minimum: 0.1, maximum: 1, default: 0.6 }
  }
})
```

The engine and UI automatically pick up the new renderer:

- `createRenderer('blueprint')` → instantiates `BlueprintRenderer`
- Render mode dropdown shows `Blueprint` as an option
- `SchemaControls` renders the `pixelSize` range and `lineOpacity` range automatically

---

## 6. Current scope and roadmap

**What works today:**

- In-bundle plugins (same build): import your plugin and call `registerRenderer`/`registerPostEffect` before the engine starts.
- Schemas consumed by `SchemaControls` for automatic UI generation.

**Not yet supported:**

- Runtime URL/CDN loading of plugins (e.g. `pluginRegistry.loadFromUrl('https://...')`)
- npm package discovery or auto-registration
- Per-plugin undo history

These are tracked as roadmap items and will be added in a future release.
