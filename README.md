# BitmapForge

BitmapForge is a client-side web app for generating bitmap-style animations from 3D models.

This repository is no longer an npm library package; it is now an application built with React + Vite, with a framework-agnostic rendering engine under `src/engine`.

## Current Status

Phase 1 foundation is implemented:

- React app shell with sidebar + preview layout
- Three.js scene pipeline via `SceneManager`
- Bitmap renderer refactor with shared `BaseEffect`
- Model loading for STL, OBJ, GLTF, GLB
- Live controls for palette, quality, animation, and light direction
- Export panel scaffolding (GIF, video, sprite sheet, HTML snippet, code ZIP)
- Local persistence (`localStorage`) and `.bitmapforge` save/load

ASCII mode is deferred to v1.5.

## Project Structure

```text
src/
  app/
    components/
    hooks/
    store/
    utils/
    App.jsx
    main.jsx
  engine/
    animation/
    effects/
    loaders/
    SceneManager.js
```

## Development

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (typically `http://127.0.0.1:5173/` or similar).

### Production Build

```bash
npm run build
npm run preview
```

## Roadmap

- **Phase 1 (v1):** Core editor, live preview, exports, and persistence
- **Phase 1.5:** ASCII rendering mode, extra presets, performance improvements
- **Phase 2:** Accounts, cloud storage, sharing, and platform features

Detailed scope and architecture decisions are documented in `PROJECT_SPEC.md`.

## License

MIT
