# ASCII 3D Animation

Render STL models as animated bitmap/dithered art with Three.js.

The package is designed for website overlays with transparent backgrounds, container-based sizing, and a React wrapper for Next.js.

## Install

```bash
npm install @santiagocetran/ascii-3d-animation three
```

If you use the React wrapper, also install:

```bash
npm install react react-dom
```

## Core API (vanilla JS)

```js
import { startModelAnimation } from '@santiagocetran/ascii-3d-animation'

const container = document.getElementById('animation')

const controller = startModelAnimation({
  container,
  modelUrl: '/models/router.stl',
  showPhaseDuration: 20000,
  effectOptions: {
    pixelSize: 3,
    ditherType: 'bayer4x4',
    colors: ['#021a15', '#053a2a', '#074434', '#ABC685', '#E8FF99'],
    backgroundColor: 'transparent',
    animationDuration: 2500
  }
})

window.addEventListener('resize', () => controller.resize())

// Later:
// controller.dispose()
```

## React / Next.js (`./react` subpath)

### App Router (recommended)

Create a client component:

```tsx
'use client'

import dynamic from 'next/dynamic'

const AsciiAnimation = dynamic(
  () => import('@santiagocetran/ascii-3d-animation/react').then((m) => m.AsciiAnimation),
  { ssr: false }
)

export function HeroAnimation() {
  return (
    <AsciiAnimation
      modelUrl="/models/router.stl"
      className="w-full h-[420px]"
      effectOptions={{
        backgroundColor: 'transparent',
        pixelSize: 3
      }}
    />
  )
}
```

## API Reference

### `startModelAnimation(options)`

Options:

| Option | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `container` | `HTMLElement` | no | `document.body` | Used after browser guard |
| `modelUrl` | `string` | yes | - | STL URL/path |
| `effectOptions` | `object` | no | see below | Bitmap rendering options |
| `showPhaseDuration` | `number` | no | `20000` | Show phase duration in ms |

Effect options:

| Option | Type | Default |
| --- | --- | --- |
| `pixelSize` | `number` | `3` |
| `ditherType` | `'bayer4x4' \| 'bayer8x8' \| 'variableDot'` | `'bayer4x4'` |
| `colors` | `string[]` | green gradient |
| `backgroundColor` | `string` | `'transparent'` |
| `invert` | `boolean` | `false` |
| `minBrightness` | `number` | `0.05` |
| `animationDuration` | `number` | `2500` |

Returns:

- `resize(width?, height?)`: resizes to provided dimensions, or re-measures the container if omitted.
- `dispose()`: stops animation loop, disposes WebGL/material resources, removes DOM element.

## Notes

- Requires a browser environment. Calling `startModelAnimation` on the server throws a descriptive error.
- The renderer uses alpha and transparent clear color for real transparency.
- STL loading errors are logged with the failing URL.

## Development

```bash
npm install
npm run dev
npm run build:lib
```

Library output is generated in `lib/`.

## Publish Checklist

1. Set `"private": false` in `package.json`.
2. Run `npm run build:lib`.
3. Optional sanity check: `npm pack --dry-run`.
4. Publish: `npm publish --access public`.

## License

MIT
