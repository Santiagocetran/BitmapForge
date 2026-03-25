# @bitmapforge/embed

Embed BitmapForge animations in any website with a single web component.

## CDN Usage

```html
<script type="importmap">
  { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js" } }
</script>
<script type="module" src="https://cdn.jsdelivr.net/npm/@bitmapforge/embed/dist/bitmap-forge.es.js"></script>
<bitmap-forge src="animation.bforge" autoplay loop></bitmap-forge>
```

## npm Install

```bash
npm install @bitmapforge/embed three
```

```js
import '@bitmapforge/embed'
```

## Attributes

| Attribute     | Type    | Default      | Description                                                            |
| ------------- | ------- | ------------ | ---------------------------------------------------------------------- |
| `src`         | string  | —            | URL to a `.bforge` project file                                        |
| `autoplay`    | boolean | false        | Start immediately without waiting for visibility                       |
| `loop`        | boolean | false        | Loop the animation (handled by the engine)                             |
| `render-mode` | string  | from project | Override render mode (bitmap, pixelArt, ascii, halftone, led, stipple) |

## Known Limitations

Image input type is not supported in embed mode — `.bforge` files with `inputType: 'image'` will render an empty scene with a console warning.
