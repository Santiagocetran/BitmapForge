<div align="center">

![BitmapForge Demo](./docs/demo.gif)

# BitmapForge

### Turn any 3D model into instant retro pixel animations — in seconds, right in your browser.

**[🚀 Try it now →](https://bitmapforge.vercel.app)**

![Open Source](https://img.shields.io/badge/Open%20Source-MIT-green?style=flat-square)
![No Install](https://img.shields.io/badge/No%20Install-Browser--only-blue?style=flat-square)
![No Signup](https://img.shields.io/badge/No%20Signup-100%25%20Free-orange?style=flat-square)
![Built with Three.js](https://img.shields.io/badge/Built%20with-Three.js-black?style=flat-square&logo=three.js)

</div>

---

## ✨ Why BitmapForge?

> **"Turn any 3D model into instant retro pixel animations and export ready-to-use GIFs, videos, sprite sheets, or even embeddable HTML — in seconds."**

Made for **indie game devs**, **pixel artists**, **creative coders**, and **Blender users** who want quick retro assets without the pipeline overhead.

- 🎮 **Instant retro assets** — upload an OBJ/GLB and get a pixel-art GIF in under a minute
- 🎨 **Full visual control** — dithering algorithms, custom color palettes, lighting, and 8 animation effects
- 📦 **Export anywhere** — GIF, APNG, WebM, sprite sheets, standalone HTML, React/Web components, Lottie, CSS keyframes, or a no-build Embed ZIP
- 🔒 **100% private** — nothing ever leaves your browser. No uploads, no accounts, no backend

---

## 🖼️ Features

### 🗂️ Flexible Input Sources

Not just 3D models — four input types supported:

| Input        | Description                                              |
| ------------ | -------------------------------------------------------- |
| **3D Model** | Upload STL, OBJ, GLTF, or GLB directly from your machine |
| **Shape**    | Built-in primitives: cube, sphere, torus, cone, and more |
| **Text**     | Extruded 3D text with 10 font families                   |
| **Image**    | PNG/JPG/SVG rendered as a flat plane                     |

A **model scale slider** lets you normalize any model to fit the viewport regardless of original size.

![UI Screenshot](./docs/screenshot-ui.png)

---

### 🎨 Multiple Render Styles

| Renderer       | Description                                         |
| -------------- | --------------------------------------------------- |
| **Bitmap**     | Classic Bayer dithering (4×4 / 8×8) or variable dot |
| **Pixel Art**  | Clean flat squares, no dithering                    |
| **Halftone**   | Circular/diamond dot grid, CMYK mode included       |
| **LED Matrix** | Glowing LED sign board look                         |
| **Stipple**    | Pointillist/stipple art style                       |
| **ASCII**      | Text-based rendering with custom character sets     |

---

### 🌈 Color Palette Control

Drag and reorder up to 6 colors. The palette is brightness-mapped: leftmost = shadows, rightmost = highlights.

**Color-only presets** let you swap palette themes without touching dither type, pixel size, or other settings.

![Color Palette](./docs/screenshot-palette.png)

---

### 🎬 Animation Effects

Combine any of 8 effects simultaneously:

`Spin X` · `Spin Y` · `Spin Z` · `Float` · `Bounce` · `Pulse` · `Shake` · `Orbit`

All animations loop seamlessly — perfect for game assets or loading screens.

---

### 💡 Lighting & Post-Processing

- Drag-to-position key light direction
- **CRT effect** — scanlines, chromatic aberration, vignette
- **Noise/grain** — film grain overlay, monochrome or colored
- **Color shift** — hue rotation and saturation multiplier

---

### 📤 Export Formats

| Format              | Use Case                                                                |
| ------------------- | ----------------------------------------------------------------------- |
| **APNG**            | Full-color + alpha, web-ready _(default)_                               |
| **GIF**             | Universal compatibility, retro charm                                    |
| **WebM Video**      | Game engines, editors                                                   |
| **Sprite Sheet**    | Tilemap workflows, game frameworks                                      |
| **Standalone HTML** | Drop one file anywhere, it just works                                   |
| **Embed ZIP**       | Upload to any host, embed with one `<bitmap-forge>` tag — no npm needed |
| **React Component** | Drop into any React project                                             |
| **Web Component**   | Framework-agnostic custom element                                       |
| **CSS Keyframes**   | Pure CSS animation + sprite sheet — no JS required                      |
| **Lottie JSON**     | Motion design pipelines                                                 |
| **Code ZIP**        | Full Vite project with engine source to self-host                       |

---

### 📦 `@bitmapforge/embed` SDK

The **Embed ZIP** export is powered by a standalone SDK in `packages/embed/`. It ships as a native web component — no framework required:

```html
<script type="importmap">
  { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js" } }
</script>
<script type="module" src="./bitmap-forge.es.js"></script>

<bitmap-forge src="./animation.bforge" autoplay loop></bitmap-forge>
```

Features: lazy loading via IntersectionObserver, DPR-aware ResizeObserver, `prefers-reduced-motion` support, and Page Visibility API pause/resume. The `.bforge` file is just JSON — you can swap animations without touching the JS.

---

## 🔴 Live Demo

**[bitmapforge.vercel.app →](https://bitmapforge.vercel.app)**

100% in-browser · No signup · No upload · Works on mobile

---

## ⚡ Quick Start

Clone and run locally in seconds:

```bash
git clone https://github.com/Santiagocetran/BitmapForge.git
cd BitmapForge
npm install
npm run dev
```

Open the local URL printed by Vite — that's it.

### Other commands

```bash
npm run build         # Production build → dist/ (also builds embed SDK first)
npm run build:embed   # Build embed SDK → copies to public/embed/
npm run preview       # Preview production build locally
npm test              # Run all tests (469 tests across 27 files)
```

---

## 🏗️ How It Works

```
Input (model/shape/text/image) → Three.js renders to WebGL → BitmapEffect reads pixels
→ Brightness per cell → Dithering algorithm → Map to color palette → Visible canvas
→ Post-processing (CRT / Noise / Color Shift) → Export (capture one full animation loop)
```

1. **Three.js** renders the 3D scene to a hidden WebGL canvas
2. **BitmapEffect** reads pixel brightness per grid cell via `getImageData`
3. The selected **renderer** converts brightness into pixel patterns (bitmap, halftone, ASCII, etc.)
4. Brightness zones are mapped to your **color palette** (dark → light)
5. **Post-processing chain** applies CRT, noise, and color shift effects
6. **AnimationEngine** drives spin, float, bounce, pulse, shake, and orbit per frame
7. Export tools capture the preview canvas across one full loop

---

## 🛠️ Tech Stack

| Layer         | Tech                               |
| ------------- | ---------------------------------- |
| 3D Rendering  | Three.js                           |
| Framework     | React 19 + Vite 7                  |
| Styling       | Tailwind CSS 4                     |
| State         | Zustand                            |
| UI Primitives | Radix UI                           |
| GIF Export    | gif.js                             |
| APNG Export   | upng-js                            |
| ZIP Export    | JSZip                              |
| Drag & Drop   | @dnd-kit                           |
| Icons         | Lucide React                       |
| Embed SDK     | `packages/embed/` (custom element) |

---

## 🤝 Contributing

**We ❤️ contributors!**

BitmapForge is fully open source and actively developed. Whether you're fixing a bug, adding a new renderer, or improving docs — all contributions are welcome.

### Getting Started

```bash
# Fork the repo, then:
git clone https://github.com/YOUR_USERNAME/BitmapForge.git
cd BitmapForge
npm install
npm run dev
```

### Good First Issues

Look for issues tagged [`good first issue`](https://github.com/Santiagocetran/BitmapForge/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) on GitHub — they're scoped, self-contained, and beginner-friendly.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/my-feature`)
3. **Commit** your changes
4. **Open a PR** — describe what you changed and why

> 💬 Have an idea? Open an issue first so we can align before you build.

**⭐ Star the repo** if you find it useful — it helps a lot!

---

## 🗺️ Roadmap

A few things on the horizon:

- [ ] Per-layer color palettes and animation controls
- [ ] Plugin/extension API for custom renderers
- [ ] Playwright E2E test suite
- [ ] More export targets (SVG animation, Three.js scene)
- [ ] Mobile-optimized UI

---

## 📄 Documentation

Full technical spec: [`docs/PROJECT_SPEC.md`](./docs/PROJECT_SPEC.md)

---

<div align="center">

Made with ❤️ by [@santicetran](https://x.com/santicetran)

</div>

---

## License

MIT — use it, fork it, ship it.

---

<!-- GitHub Topics (copy and add via repo settings):
threejs, pixel-art, dithering, bitmap-animation, webgl, gltf, retro, indie-game-dev, creative-coding, threejs-tools
-->
