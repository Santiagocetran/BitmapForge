# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is BitmapForge

BitmapForge is a client-side web app that converts 3D models (STL, OBJ, GLTF/GLB) into bitmap/dithered animations. Users upload a model, configure rendering settings (pixel size, dithering, color palette), choose animation presets, and export as GIF, video, sprite sheet, or code. No backend — everything runs in the browser.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build

No test framework or linter is configured.

## Architecture

### Two-layer structure: `src/engine/` and `src/app/`

**`src/engine/`** — Framework-agnostic rendering engine (vanilla JS, no React):

- `SceneManager.js` — Orchestrates Three.js scene, camera, lights, renderer, and the BitmapEffect. Entry point for the engine. Manages model loading, animation loop, and settings updates.
- `effects/BaseEffect.js` — Shared logic: particle system, easing, color interpolation, brightness calculation.
- `effects/BitmapEffect.js` — Core visual engine. Reads WebGL pixels → calculates brightness per grid cell → applies dithering → maps brightness to colors → draws to visible canvas.
- `loaders/modelLoader.js` — Unified loader that auto-detects format by extension (STL/OBJ/GLTF/GLB).
- `animation/AnimationEngine.js` — Configurable animation orchestrator replacing hardcoded rotation. Driven by preset configs.
- `animation/presets.js` — Animation preset definitions (spinY, spinX, spinZ, float, fadeInOut).

**`src/app/`** — React application layer:

- `store/useProjectStore.js` — Zustand store holding all project state (model, colors, pixel size, dither type, animation settings, light direction). Every UI control reads/writes from this store.
- `hooks/useAutoSave.js` — localStorage persistence on every state change.
- `hooks/useExport.js` — Export logic (GIF via gif.js, video via MediaRecorder, sprite sheet, code ZIP via JSZip).
- `components/PreviewCanvas/` — Bridges React ↔ engine: instantiates SceneManager, subscribes to store changes, drives live preview.
- `components/Layout/` — App shell with sidebar + preview area.
- Other components: `ModelUploader`, `ColorPalette`, `AnimationControls`, `QualitySettings`, `LightDirection`, `ExportPanel`.

### Rendering pipeline

Three.js renders 3D scene to hidden WebGL canvas → BitmapEffect reads pixels via getImageData → calculates brightness per grid cell → applies dithering (Bayer 4x4/8x8, variable dot) → maps brightness to color palette (index 0 = shadows, last = highlights) → draws to visible canvas. During fade phases, particles scatter/gather with eased animations.

### Legacy files (deleted)

The original npm package code (`src/animations/`, `src/effects/`, `src/react/`) has been removed. It is preserved in git history. The active engine code lives in `src/engine/`.

## Tech Stack

React 19, Vite 7, Tailwind CSS 4, Zustand (state), Three.js (3D), Radix UI (primitives), react-colorful (color picker), @dnd-kit (drag reorder), react-dropzone (file upload), gif.js (GIF export), JSZip (ZIP export), Lucide React (icons).

## Key Conventions

- Color palette is brightness-mapped: array index 0 = darkest/shadows, last = brightest/highlights. Users reorder colors to control which brightness zones get which color.
- All animations are looped (GIF-like). Animation presets are plain config objects.
- The engine and app layers are intentionally separated so the engine could be published as a standalone npm package.
