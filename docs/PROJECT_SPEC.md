# BitmapForge -- Project Specification

> Open source web app to generate bitmap animations from 3D models.
> Repository: https://github.com/Santiagocetran/BitmapForge
> Forked from: https://github.com/Santiagocetran/my-ascii-three (npm package `@santiagocetran/ascii-3d-animation`)

---

## Table of Contents

1. [Vision](#vision)
2. [Origin & Existing Codebase](#origin--existing-codebase)
3. [Existing Codebase Architecture](#existing-codebase-architecture)
4. [Decisions Made](#decisions-made)
5. [Feature Specification](#feature-specification)
6. [Technical Architecture (New App)](#technical-architecture-new-app)
7. [Recommended Tech Stack](#recommended-tech-stack)
8. [Development Phases](#development-phases)
9. [Open Questions](#open-questions)

---

## Vision

BitmapForge is a **client-side web application** where users can:

1. **Upload a 3D model** (drag & drop or file picker) -- STL, OBJ, GLTF/GLB formats.
2. **Configure the bitmap rendering** -- pixel size, dithering algorithm, quality level.
3. **Choose a color palette** -- pick 2-6 colors, reorder them to control which parts of the model get which color, with live preview.
4. **Select animation presets** -- turntable spin (Y/X/Z axis), slow float, fade in/out particle animations. All animations are looped (like GIFs).
5. **Export** in multiple formats -- GIF, MP4/WebM video, PNG sprite sheet, embeddable HTML snippet, and a full code export (zip with standalone project).

The app should be **dead simple** to use for basic cases, with a collapsible **Advanced panel** for power users who want fine-grained control.

**v1 is purely client-side** -- no backend, no user accounts. Persistence is handled via localStorage auto-save and downloadable `.bitmapforge` project files. Auth, sharing, galleries, and the "edit in BitmapForge and it updates on your website" feature are planned for v2.

---

## Origin & Existing Codebase

This repo was forked from `my-ascii-three`, an npm package (`@santiagocetran/ascii-3d-animation`) that renders STL 3D models as bitmap/dithered animations using Three.js. The package was originally built for a specific website and provides:

- A vanilla JS API (`startModelAnimation()`)
- A React/Next.js wrapper component (`AsciiAnimation`)
- Canvas-based post-processing with dithering (Bayer 4x4, Bayer 8x8, variable dot)
- Particle scatter/gather animations (fade in/out)
- Transparent background support
- Configurable color palettes mapped to brightness

The npm package at https://www.npmjs.com/package/@santiagocetran/ascii-3d-animation remains as-is. BitmapForge will diverge significantly into a full web application while reusing the core rendering engine.

---

## Existing Codebase Architecture

### Directory Structure

```
BitmapForge/
├── index.html                      # Dev entry point (loads src/main.js)
├── package.json                    # Currently configured as npm package
├── vite.config.lib.js              # Vite library build config
├── public/
│   ├── router-prueba.glb           # Sample GLB model
│   ├── sai-prueba-pagina.stl       # Sample STL model
│   └── vite.svg
└── src/
    ├── index.js                    # Package entry: exports startModelAnimation, BitmapEffect
    ├── index.d.ts                  # TypeScript definitions for core API
    ├── main.js                     # Dev demo: sets up a hardcoded animation
    ├── style.css                   # Minimal global reset
    ├── animations/
    │   └── modelAnimation.js       # Main orchestrator (Three.js scene, loader, animation loop)
    ├── effects/
    │   ├── BitmapEffect.js         # Bitmap/halftone renderer (CORE - the main rendering engine)
    │   └── ColoredAsciiEffect.js   # ASCII character variant (not used in main flow)
    └── react/
        ├── index.js                # React wrapper export
        ├── index.d.ts              # React component TypeScript definitions
        └── AsciiAnimation.jsx      # React component wrapper
```

### Rendering Pipeline (how it currently works)

```
Three.js renders 3D scene to WebGL canvas (hidden)
         ↓
BitmapEffect reads WebGL canvas pixels via getImageData()
         ↓
Calculates brightness per grid cell (pixelSize controls grid resolution)
         ↓
Applies dithering algorithm (Bayer or variable dot) to decide which cells to draw
         ↓
Maps brightness → color using the colors[] array (index 0 = darkest, last = brightest)
         ↓
Draws colored pixels/dots to a visible canvas
         ↓
During fadeIn/fadeOut phases, particles scatter/gather with easing animations
```

### Key Files in Detail

#### `src/animations/modelAnimation.js`

- Sets up Three.js scene with perspective camera (75° FOV)
- WebGL renderer with alpha transparency
- Three-point lighting: ambient (0.15), key directional (1.5), fill (0.4), rim (0.8)
- Loads STL files via `STLLoader`, centers and scales model to fit
- Animation phases: fadeIn → show (with rotation) → fadeOut → loop
- **Current rotation is hardcoded**: `modelGroup.rotation.y += 0.006` plus slight x/z oscillation
- Returns `{ resize, dispose }` controller
- **What needs to change**: support multiple file formats, make animation configurable via presets, decouple from hardcoded rotation

#### `src/effects/BitmapEffect.js`

- Canvas-based post-processing effect (this is the core visual engine)
- Creates a grid by dividing the canvas into `pixelSize` cells
- Downsamples the WebGL render to grid resolution, reads pixel data
- Brightness calculation: `(0.3R + 0.59G + 0.11B) / 255`
- Dithering: Bayer 4x4, Bayer 8x8 (ordered dithering matrices), variable dot (size-based)
- Color mapping: `getColorForBrightness()` interpolates between colors[] based on brightness value
- Particle system for fadeIn/fadeOut: particles start from random scattered positions and ease to their final grid positions (and vice versa for fadeOut)
- Easing: `easeInOutCubic`
- Particle delay based on distance from center (creates a ripple-like reveal)
- **What needs to change**: extract shared logic with ColoredAsciiEffect into a base, make animation duration configurable, possibly add new animation types

#### `src/effects/ColoredAsciiEffect.js`

- Alternative renderer using ASCII characters instead of pixel blocks
- Character set: ` .:-=+*#%@` mapped to brightness levels
- Has its own particle system (similar to BitmapEffect but for characters)
- Could be offered as a second rendering mode in the app
- **Note**: shares ~60% of code with BitmapEffect (particle system, color interpolation, easing). Should be refactored into a shared base class.

#### `src/react/AsciiAnimation.jsx`

- React wrapper component using `useRef` + `useEffect`
- `ResizeObserver` for responsive sizing
- Props: `modelUrl`, `effectOptions`, `className`, `style`
- **For the new app**: this won't be needed directly since the app itself will be React, but the pattern is useful reference

### Tech Stack (current)

- **Rendering**: Three.js (WebGL) + Canvas 2D API
- **Build**: Vite 7.2.4
- **Language**: JavaScript (ES modules), JSX for React component
- **Types**: `.d.ts` definition files only (no TypeScript source)
- **Package**: Scoped npm package with dual entry points (core + React subpath)

---

## Decisions Made

| Topic                      | Decision                                                                 | Notes                                                 |
| -------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| **Repository**             | New repo `BitmapForge`, not a GitHub fork                                | The npm package repo stays untouched                  |
| **App type**               | Client-side web app                                                      | No server/backend for v1                              |
| **UX complexity**          | Dead simple + collapsible Advanced panel                                 | Upload → configure → export flow                      |
| **Color mapping approach** | Brightness-based (as currently implemented)                              | User reorders colors in a strip to control appearance |
| **Color UX**               | Draggable "Color Strip" (shadows → highlights) + light direction control | See detailed spec below                               |
| **v1 Export formats**      | GIF, MP4/WebM, PNG sprite sheet, embeddable snippet, full code zip       | Code zip is like v0's export                          |
| **Persistence (v1)**       | localStorage auto-save + `.bitmapforge` project files                    | No backend needed                                     |
| **Auth/Backend**           | Deferred to v2                                                           | Supabase recommended when needed                      |
| **3D formats (v1)**        | STL (existing) + GLTF/GLB + OBJ                                          | FBX deferred (heavier to support)                     |
| **Animation types**        | Looped only (like GIFs) for v1                                           | Spin Y/X/Z, slow float, fade in/out                   |
| **Rendering modes**        | Bitmap (primary), ASCII characters (secondary)                           | Both exist in codebase already                        |

---

## Feature Specification

### 1. File Upload

- Drag & drop zone (prominent, center of screen on first load)
- Also a file picker button
- Accepted formats: `.stl`, `.obj`, `.gltf`, `.glb`
- File is kept in memory (no upload to server)
- Three.js loaders needed: `STLLoader` (exists), `GLTFLoader`, `OBJLoader`
- Show file name and size after upload
- Allow replacing the model at any time

### 2. Live Preview

- Real-time canvas showing the bitmap effect applied to the 3D model
- Updates instantly when any setting changes (color, pixel size, dither type, animation)
- Should take up the majority of the screen (the UI is a sidebar or overlay)
- Responsive to window resizing

### 3. Color Palette (The "Color Strip")

**How the current color system works:**
The `colors` array (e.g., `['#021a15', '#053a2a', '#074434', '#ABC685', '#E8FF99']`) maps brightness to color. Index 0 = darkest areas of the model (shadows, back faces, crevices). Last index = brightest areas (highlights, surfaces facing the light). The engine interpolates between adjacent colors based on brightness value.

**UI for the user:**

A horizontal bar labeled **"Shadows → Highlights"** divided into N color slots:

```
  Shadows ◄────────────────────────────► Highlights
  ┌──────┬──────┬──────┬──────┐
  │  #1  │  #2  │  #3  │  #4  │
  │ dark │ mid  │ mid  │bright│
  │ teal │green │lime  │cream │
  └──────┴──────┴──────┴──────┘
     ↕      ↕      ↕      ↕       ← drag to reorder
    [🎨]   [🎨]   [🎨]   [🎨]    ← click to open color picker
```

- **2-6 color slots** (default 4). Buttons to add/remove stops.
- **Drag to reorder**: changes which brightness zones get which color. Preview updates live. This gives the user creative control over how depth/shading appears.
- **Click to edit**: opens a color picker with both a visual palette and a hex input field.
- **Preset palettes**: curated starting points (green gradient, ocean blue, warm sunset, monochrome, cyberpunk, etc.)
- **The key insight for the user**: "Colors on the left go to darker/shadowed parts of your model. Colors on the right go to brighter/highlighted parts. Drag to reorder and see the effect live."

**Additional control -- Light Direction:**
A simple control (draggable dot on a circle, or 4-8 direction buttons) that moves the key light source. This indirectly changes _which parts_ of the model are "shadow" vs "highlight" without touching the palette. Combined with color reordering, this gives surprising creative range with a simple UI.

### 4. Quality / Rendering Settings

**Simple mode (always visible):**

- Pixel size slider (1-20, default 3) -- controls bitmap resolution/detail
- Rendering mode toggle: Bitmap vs ASCII

**Advanced panel (collapsible):**

- Dither type: Bayer 4x4, Bayer 8x8, Variable Dot (dropdown)
- Invert brightness: toggle
- Min brightness threshold: slider (0.01 - 0.5)
- Background: transparent vs solid color picker

### 5. Animation Presets

All animations loop seamlessly (like GIFs).

**v1 presets:**

- **Spin Y** (turntable) -- rotates around vertical axis. Speed control.
- **Spin X** -- rotates around horizontal axis.
- **Spin Z** -- rotates around depth axis.
- **Slow Float** -- gentle multi-axis rotation (the current behavior: Y rotation + slight X/Z oscillation).
- **Fade In/Out** -- the existing particle scatter/gather animation. Configurable: with or without rotation during show phase.

**Controls:**

- Preset selector (visual cards or dropdown)
- Speed slider
- Animation duration (for fade in/out timing)
- Show phase duration (how long the model displays between fade cycles)

### 6. Export

#### GIF Export

- Use `gif.js` or `modern-gif` for client-side encoding
- Capture frames from the bitmap canvas at configurable FPS
- Duration = one full loop of the selected animation
- Quality/size tradeoff slider

#### MP4/WebM Video Export

- Use browser `MediaRecorder` API
- Record the bitmap canvas
- Duration = one full animation loop (or user-specified)

#### PNG Sprite Sheet

- Capture N frames from one animation loop
- Arrange in a grid (configurable columns)
- Export as single PNG image

#### Embeddable HTML Snippet

- Generate a minimal `<script>` tag or `<iframe>` snippet
- Self-contained: includes the rendering code inline or from a CDN
- User copies and pastes into their website

#### Full Code Export (ZIP)

- Like v0's code export
- Generated using **JSZip** (client-side)
- Contents:
  ```
  BitmapForge-export/
  ├── index.html           # Standalone page running the animation
  ├── animation.js         # Generated config with user's exact settings
  ├── engine/
  │   ├── BitmapEffect.js  # Rendering engine
  │   └── modelLoader.js   # Model loading logic
  ├── models/
  │   └── [user-model].stl # The user's uploaded 3D file
  ├── package.json         # Minimal, with vite + three.js deps
  ├── vite.config.js       # Minimal Vite config for dev server
  └── README.md            # Quick start instructions
  ```
- `animation.js` is generated from the user's configuration

### 7. Persistence (v1)

- **localStorage auto-save**: all current settings (colors, pixel size, dither, animation preset, etc.) are saved to localStorage on every change. On page load, restore from localStorage if present.
- **Project file save/load**: "Save Project" downloads a `.bitmapforge` file (JSON containing all settings + the 3D model encoded as base64 or ArrayBuffer). "Load Project" accepts drag-drop or file picker for `.bitmapforge` files.
- **No backend, no auth** in v1.

---

## Technical Architecture (New App)

### Proposed Directory Structure

```
src/
  app/                          # The web application
    components/
      Layout/                   # App shell, sidebar, header
      ModelUploader/            # Drag & drop zone + file picker
      PreviewCanvas/            # Live 3D → bitmap preview
      ColorPalette/             # The "Color Strip" with drag-reorder
      AnimationControls/        # Preset selector + speed/duration sliders
      ExportPanel/              # Format selection + export buttons
      QualitySettings/          # Pixel size, dither type, advanced panel
      LightDirection/           # Light position control
    store/                      # Zustand state management
      useProjectStore.js        # All project state (model, colors, settings, animation)
    hooks/                      # Custom React hooks
      useAutoSave.js            # localStorage auto-save
      useExport.js              # Export logic (GIF, video, zip, etc.)
    utils/
      projectFile.js            # .bitmapforge save/load
      codeExport.js             # ZIP generation with JSZip
    App.jsx                     # Root component
    main.jsx                    # React entry point
  engine/                       # Core rendering engine (framework-agnostic)
    effects/
      BaseEffect.js             # Shared logic (particles, easing, color interpolation)
      BitmapEffect.js           # Bitmap/halftone renderer (refactored from existing)
      AsciiEffect.js            # ASCII character renderer (refactored from existing)
    loaders/
      modelLoader.js            # Unified loader (STL, OBJ, GLTF/GLB auto-detection)
    animation/
      presets.js                # Animation preset definitions (spinY, spinX, float, etc.)
      AnimationEngine.js        # Configurable animation orchestrator
    SceneManager.js             # Three.js scene, camera, lights, renderer setup
  index.html                    # HTML entry
```

### Key Architectural Decisions

1. **Separate `engine/` from `app/`**: the rendering engine stays framework-agnostic (vanilla JS). The React app configures and drives it. This means the engine could still be published as an npm package later.

2. **Zustand for state**: lightweight, no boilerplate, works great for real-time parameter changes. The store holds: loaded model data, color palette, pixel size, dither type, animation preset, light direction, etc. Every UI control reads/writes from the store. The engine subscribes to store changes and re-configures live.

3. **AnimationEngine replaces hardcoded animation**: currently `modelAnimation.js` has hardcoded rotation values. The new `AnimationEngine` takes a preset config object and applies it. Presets are plain objects:

   ```js
   { type: 'spinY', speed: 0.006 }
   { type: 'float', speedY: 0.006, oscillateX: 0.15, oscillateZ: 0.08 }
   ```

4. **Unified model loader**: auto-detects format by file extension, uses the appropriate Three.js loader (`STLLoader`, `GLTFLoader`, `OBJLoader`), returns a normalized `THREE.Group`.

5. **BaseEffect class**: extracts shared logic from BitmapEffect and ColoredAsciiEffect -- particle system, easing functions, color interpolation, brightness calculation. Both effects extend it.

---

## Recommended Tech Stack

| Layer                      | Choice                              | Why                                                               |
| -------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| Framework                  | **React 19 + Vite**                 | Already familiar from the npm package, Vite already configured    |
| Styling                    | **Tailwind CSS 4**                  | Rapid UI development, utility-first, great for responsive layouts |
| UI components              | **Radix UI** (or shadcn/ui)         | Accessible primitives (dialogs, sliders, dropdowns, drag handles) |
| State                      | **Zustand**                         | Minimal boilerplate, perfect for real-time parameter stores       |
| 3D rendering               | **Three.js** (already a dependency) | Existing engine is built on it                                    |
| Color picker               | **react-colorful**                  | Tiny (~2KB), zero dependencies, accessible                        |
| Drag & drop files          | **react-dropzone**                  | Battle-tested, handles edge cases                                 |
| Drag reorder (color strip) | **@dnd-kit/core**                   | Modern, accessible, lightweight drag-and-drop                     |
| GIF export                 | **gif.js** or **modern-gif**        | Client-side GIF encoding from canvas frames                       |
| Video export               | **MediaRecorder API**               | Native browser API, no library needed                             |
| ZIP export                 | **JSZip**                           | Client-side zip generation                                        |
| Icons                      | **Lucide React**                    | Clean, consistent icon set                                        |

---

## Development Phases

### Phase 1 -- Core App (v1)

Priority order for implementation:

1. **Project scaffolding**: convert from npm package structure to React app with Vite
2. **Engine refactoring**: extract `engine/` module, create `BaseEffect`, `SceneManager`, `AnimationEngine`, unified model loader
3. **Basic UI shell**: layout with sidebar + preview canvas
4. **Model upload**: drag & drop + file picker, multiple format support
5. **Live preview**: connect engine to preview canvas with real-time updates
6. **Color palette UI**: the Color Strip with drag-reorder, color picker, presets
7. **Quality controls**: pixel size slider, dither type selector, advanced panel
8. **Animation presets**: preset selector, speed/duration controls
9. **Light direction control**: simple directional control for the key light
10. **Export**: GIF, video, sprite sheet, embeddable snippet, code ZIP
11. **Persistence**: localStorage auto-save + .bitmapforge project files
12. **Polish**: responsive design, loading states, error handling, tooltips

### Phase 2 -- Polish & Expand (v1.5)

- More animation presets (bounce, pulse, orbit)
- ASCII rendering mode toggle
- More 3D format support (FBX)
- Keyboard shortcuts
- Undo/redo
- Mobile-responsive UI
- Performance optimization for large models

### Phase 3 -- Platform (v2)

- User accounts (Supabase auth)
- Cloud project storage
- Public gallery ("look what people made")
- Share via URL
- npm package export with live updates ("edit in BitmapForge → updates on your site")
- Collaboration features
- API for programmatic access

---

## Open Questions

These should be discussed/decided as development progresses:

1. **Animation presets for v1**: Spin Y (turntable), Spin X, Spin Z, Slow Float, Fade In/Out with particle scatter/gather. Are these enough? Too many?
2. **3D format priority**: STL works now. GLTF/GLB is the modern web standard and should be next. OBJ third. FBX deferred. Agreed?
3. **Should the ASCII rendering mode (ColoredAsciiEffect) be included in v1**, or deferred to v1.5? It exists in the codebase but needs refactoring.
4. **App name/branding**: "BitmapForge" is the repo name. Is this also the product name? Any logo/branding ideas?
5. **Landing page vs jump straight to editor**: should the app have a landing/marketing page, or go directly to the editor with a prominent upload zone?

---

## Reference: Current API (from npm package)

For reference, this is the current programmatic API that users of the npm package use. The web app should expose all these options (and more) through its UI:

```js
startModelAnimation({
  container: HTMLElement,           // DOM element to render into
  modelUrl: string,                 // URL to 3D model file
  showPhaseDuration: number,        // ms - how long to show before fading out (default: 20000)
  effectOptions: {
    pixelSize: number,              // Grid cell size in px (default: 3)
    ditherType: 'bayer4x4' | 'bayer8x8' | 'variableDot',  // Dithering algorithm
    colors: string[],              // Hex color array, dark→bright (default: green gradient)
    backgroundColor: string,        // 'transparent' or hex color
    invert: boolean,                // Invert brightness mapping (default: false)
    minBrightness: number,          // Threshold below which pixels are skipped (default: 0.05)
    animationDuration: number       // Fade in/out duration in ms (default: 2500)
  }
})
// Returns: { resize(w?, h?), dispose() }
```
