# BitmapForge Implementation Guide

> Comprehensive guide for implementing all 27 GitHub issues across 4 phases.
> Generated from deep codebase analysis, IA bridge audit (Claude + Codex), and architecture review.

---

## Table of Contents

- [Strategic Context](#strategic-context)
- [Architecture Overview](#architecture-overview)
- [Phase 1: UX Polish & Foundation](#phase-1-ux-polish--foundation)
- [Phase 2: Expand Input Types](#phase-2-expand-input-types)
- [Phase 3: Retro Effect System](#phase-3-retro-effect-system)
- [Phase 4: Platform & Ecosystem](#phase-4-platform--ecosystem)
- [Cross-Phase Dependencies](#cross-phase-dependencies)
- [Rollback & Risk Mitigation](#rollback--risk-mitigation)

---

## Strategic Context

BitmapForge's competitive edge is the **3D → retro/pixel aesthetic pipeline** with export-grade fidelity. The roadmap focuses on making this pipeline world-class, expanding input types (text, images, shapes), adding more retro rendering modes (ASCII, pixel art, halftone, CRT, etc.), and eventually opening the platform for community contributions.

**Guiding principles:**

- Ship user-facing value early — don't front-load infrastructure
- Minimize rework — sequence architectural changes before features that depend on them
- Keep the retro/pixel identity sharp — every new feature should reinforce this positioning

---

## Architecture Overview

Understanding the current architecture is essential for all implementation work.

### Data Flow

```
User Input (UI)
    ↓
Zustand Store (useProjectStore.js) — single source of truth
    ↓
PreviewCanvas.jsx — subscribes to store slices with shallow equality
    ↓
SceneManager.js — orchestrates Three.js scene + animation + effect
    ↓
AnimationEngine.js — phase system (fadeIn → show → fadeOut → loop)
    ↓
BitmapEffect.js — WebGL pixels → brightness grid → dither → color map → canvas
```

### Key Files & Their Roles

| File                                                 | Lines | Role                                                          | Extension Points                                                       |
| ---------------------------------------------------- | ----- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/engine/SceneManager.js`                         | 317   | Engine facade: Three.js scene, camera, lights, animation loop | Swap effect renderer, add lights, post-processing hooks                |
| `src/engine/effects/BitmapEffect.js`                 | 203   | Core rendering: pixels → brightness → dither → color → canvas | New dither types in `getThreshold()`/`shouldDraw()`, new color mapping |
| `src/engine/effects/BaseEffect.js`                   | 200+  | Shared: particle system, easing, color LUT, brightness calc   | New phases, custom easing, per-particle metadata                       |
| `src/engine/animation/AnimationEngine.js`            | 267   | Animation: rotation, float, phase management, smooth reset    | New animation types in `applyEffects()` + `seekTo()`                   |
| `src/engine/loaders/modelLoader.js`                  | 96    | Model loading: STL/OBJ/GLTF/GLB with auto-center/scale        | New formats: add loader case + post-process                            |
| `src/app/store/useProjectStore.js`                   | 103   | State: all settings, model, status                            | New state fields + setters + PreviewCanvas subscriptions               |
| `src/app/components/PreviewCanvas/PreviewCanvas.jsx` | 164   | React↔Engine bridge: 4 targeted store subscriptions           | New subscriptions for new state slices                                 |
| `src/app/hooks/useExport.js`                         | 391   | Export orchestration: 10 formats, frame capture, abort        | New export functions + ExportPanel registration                        |
| `src/app/utils/projectFile.js`                       | ~60   | Project serialization: settings + base64 model                | Version migration, new settings fields                                 |

### Canvas Structure (BitmapEffect)

```
renderer.domElement  — WebGL canvas (hidden, Three.js managed)
sampleCanvas         — off-screen grid-sized canvas for pixel downsampling
bitmapCanvas         — visible output (appended to domElement, user-facing)
```

### Rendering Pipeline Detail

```
1. Three.js renders scene → WebGL canvas (hidden)
2. sampleCtx.drawImage() downsamples to grid resolution (canvas.width / pixelSize)
3. getImageData() reads pixel data from sample canvas
4. Per grid cell:
   a. getBrightness(r, g, b) → luminance (0.3R + 0.59G + 0.11B)
   b. Apply minBrightness threshold
   c. Apply invert if enabled
   d. Dithering: getThreshold(x, y) returns Bayer matrix value → shouldDraw() compares
   e. getColorForBrightness() → 256-entry LUT maps brightness to palette color
   f. Draw pixel/dot to bitmapCanvas
```

---

## Phase 1: UX Polish & Foundation

**Goal:** Make the current tool feel professional before adding new features.

### Implementation Order & Rationale

```
1. #15 CI/CD                          — Safety net for everything else
2. #16 Tooltips & onboarding          — Quick UX win, low risk
3. #12 Keyboard shortcuts             — Power-user delight, pairs with tooltips
4. #30 Additional dithering           — Extends existing pipeline, user value
5. #11 Undo/Redo                      — Core UX improvement
6. #13 Preset gallery (local only)    — Makes the tool immediately useful
7. #18 Deterministic project files    — Foundation for sharing/reproducibility
8. #14 Mobile responsive              — Broadens reach
9. #17 Performance (export path)      — Tackle when exports get slow
10. #35 Pluggable renderer refactor   — Architectural pivot (Phase 3 enabler)
11. #37 TypeScript migration          — MOVED TO PHASE 2 (avoids double-rewrite)
```

> **Key reordering decisions** (from IA bridge audit):
>
> - **#30 moved from Phase 3 to Phase 1**: Dithering algorithms are _intra-pipeline_ additions to `BitmapEffect.js` (~20 lines each). No architectural change needed.
> - **#35 moved from Phase 3 to late Phase 1**: It's the architectural hinge — 6+ issues depend on it. Doing it now (when BitmapEffect is only 203 lines) is cheap. Doing it after 3 more features have been bolted on is expensive.
> - **#37 moved to Phase 2**: Migrating to TS before #35 restructures the engine means rewriting files twice.

---

### #15 — CI/CD: GitHub Actions for tests and build

**Priority:** First. Protects all subsequent work.

**Files to create:**

- `.github/workflows/ci.yml`

**Implementation:**

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test
      - run: npm run build
```

**Steps:**

1. Create the workflow file above
2. Add status badges to `README.md`:
   ```md
   ![CI](https://github.com/Santiagocetran/BitmapForge/actions/workflows/ci.yml/badge.svg)
   ```
3. Push and verify the workflow runs on the existing 240+ tests
4. If any tests fail in CI (jsdom/canvas issues), fix environment setup

**Estimated effort:** Small (1-2 hours)

---

### #16 — Tooltips and onboarding for all controls

**Files to modify:**

- `src/app/components/QualitySettings/QualitySettings.jsx` — pixelSize, ditherType, invert, minBrightness
- `src/app/components/AnimationControls/AnimationControls.jsx` — all animation toggles
- `src/app/components/ColorPalette/ColorPalette.jsx` — color reordering explanation
- `src/app/components/LightDirection/LightDirection.jsx` — light positioning
- `src/app/components/RotationGizmo/RotationGizmoPanel.jsx` — rotation offset

**Implementation:**

1. Create a shared `Tooltip` wrapper component using Radix UI Tooltip (already a dependency):

   ```jsx
   // src/app/components/ui/InfoTooltip.jsx
   import * as Tooltip from '@radix-ui/react-tooltip'

   export function InfoTooltip({ content, children }) {
     return (
       <Tooltip.Provider delayDuration={300}>
         <Tooltip.Root>
           <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
           <Tooltip.Portal>
             <Tooltip.Content className="tooltip-content" sideOffset={5}>
               {content}
               <Tooltip.Arrow />
             </Tooltip.Content>
           </Tooltip.Portal>
         </Tooltip.Root>
       </Tooltip.Provider>
     )
   }
   ```

2. Add info icon (Lucide `Info` or `HelpCircle`) next to each setting label
3. Write tooltip text for each control:
   - **Pixel Size**: "Controls the grid resolution. Smaller = more detail, larger = more pixelated"
   - **Dither Type**: "Algorithm for simulating shading. Bayer = ordered grid, Variable Dot = halftone circles"
   - **Min Brightness**: "Threshold below which pixels are treated as fully dark"
   - etc.
4. For dithering types, consider a small visual preview image in the tooltip

**Estimated effort:** Small-Medium (3-5 hours)

---

### #12 — Keyboard shortcuts system

**Files to create:**

- `src/app/hooks/useKeyboardShortcuts.js`

**Files to modify:**

- `src/app/App.jsx` — mount the hook
- All tooltip components — add shortcut hints

**Implementation:**

1. Create a keyboard shortcut hook:

   ```javascript
   // src/app/hooks/useKeyboardShortcuts.js
   import { useEffect } from 'react'
   import useProjectStore from '../store/useProjectStore'

   const SHORTCUTS = {
     'ctrl+z': { action: 'undo', label: 'Undo' },
     'ctrl+shift+z': { action: 'redo', label: 'Redo' },
     'ctrl+s': { action: 'save', label: 'Save Project' },
     r: { action: 'resetRotation', label: 'Reset Rotation' },
     '?': { action: 'showHelp', label: 'Show Shortcuts' }
   }

   export function useKeyboardShortcuts(sceneManagerRef) {
     useEffect(() => {
       function handleKeyDown(e) {
         const key = buildKeyString(e)
         const shortcut = SHORTCUTS[key]
         if (!shortcut) return
         e.preventDefault()
         executeAction(shortcut.action, sceneManagerRef)
       }
       window.addEventListener('keydown', handleKeyDown)
       return () => window.removeEventListener('keydown', handleKeyDown)
     }, [sceneManagerRef])
   }
   ```

2. Mount in `App.jsx` or `Layout.jsx`
3. Add a help modal (Radix Dialog) showing all shortcuts, triggered by `?` key
4. Update tooltip text to include shortcut hints: "Reset Rotation (R)"

**Dependency:** Benefits from #16 (tooltips) being done first, but not required.

**Estimated effort:** Small-Medium (3-5 hours)

---

### #30 — Additional dithering algorithms

**Files to modify:**

- `src/engine/effects/BitmapEffect.js` — add new cases in rendering logic

**Implementation:**

The current dithering lives in `BitmapEffect.js` with `getThreshold(x, y)` and `shouldDraw()`. New algorithms slot in here.

**Step 1: Extract a dither strategy pattern** (prepares for #35 later)

```javascript
// In BitmapEffect.js or a new src/engine/effects/ditherStrategies.js
const ditherStrategies = {
  bayer4x4: {
    getThreshold: (x, y) => BAYER_4X4[y % 4][x % 4] / 16,
    shouldDraw: (brightness, threshold) => brightness > threshold
  },
  bayer8x8: {
    getThreshold: (x, y) => BAYER_8X8[y % 8][x % 8] / 64,
    shouldDraw: (brightness, threshold) => brightness > threshold
  },
  floydSteinberg: {
    // Error diffusion — needs access to full grid, processes sequentially
    processGrid: (brightnessGrid, width, height) => {
      /* ... */
    }
  },
  atkinson: {
    // Similar to Floyd-Steinberg but distributes less error (6/8 instead of 16/16)
    processGrid: (brightnessGrid, width, height) => {
      /* ... */
    }
  }
}
```

**Step 2: Implement Floyd-Steinberg**

```
Error distribution pattern:
      * 7/16
3/16 5/16 1/16
```

- Process pixels left-to-right, top-to-bottom
- Quantize each pixel (closest palette color)
- Distribute quantization error to neighboring pixels
- Result: smooth gradient transitions, organic feel

**Step 3: Implement Atkinson**

```
Error distribution (6/8 of error, lighter result):
    * 1/8 1/8
1/8 1/8 1/8
    1/8
```

- Same processing order as Floyd-Steinberg
- Distributes only 6/8 of error (1/4 is discarded)
- Result: higher contrast, classic Mac look

**Step 4: Update store and UI**

- Add new options to `ditherType` in `useProjectStore.js`
- Add dropdown options in `QualitySettings.jsx`

**Key gotcha:** Error-diffusion dithering is sequential (can't be parallelized per-pixel). For large grids, this may be slower than Bayer. Profile and consider limiting grid resolution for these algorithms.

**Estimated effort:** Medium (4-8 hours)

---

### #11 — Undo/Redo system

**Files to modify:**

- `src/app/store/useProjectStore.js` — add temporal middleware

**Files to create:**

- None needed if using `zundo` (Zustand temporal middleware)

**Implementation:**

**Step 1: Install zundo**

```bash
npm install zundo
```

**Step 2: Wrap the store with temporal middleware**

```javascript
// useProjectStore.js
import { temporal } from 'zundo'

const useProjectStore = create(
  temporal(
    subscribeWithSelector((set, get) => ({
      // ... existing state and actions
    })),
    {
      // Only track meaningful state changes (exclude status, loading)
      partialize: (state) => {
        const { status, ...rest } = state
        return rest
      },
      // Debounce rapid slider changes into single undo steps
      handleSet: (handleSet) => {
        return throttle(handleSet, 500, { leading: true, trailing: true })
      },
      limit: 50 // history depth
    }
  )
)

// Expose undo/redo
export const useTemporalStore = () => useProjectStore.temporal
```

**Step 3: Add UI buttons**

- Add undo/redo buttons in the toolbar area (top of sidebar or above preview)
- Use Lucide icons: `Undo2`, `Redo2`
- Disable when no history available

**Step 4: Wire keyboard shortcuts** (if #12 is done)

- `Ctrl+Z` → `useTemporalStore().undo()`
- `Ctrl+Shift+Z` → `useTemporalStore().redo()`

**Key consideration:** The `partialize` option is critical — don't track `status` changes (loading, exporting) in undo history. Only track user-initiated state changes.

**Estimated effort:** Medium (4-6 hours)

---

### #13 — Preset gallery (local save/load only)

**Files to create:**

- `src/app/store/usePresetStore.js`
- `src/app/components/PresetGallery/PresetGallery.jsx`
- `src/app/data/builtInPresets.js`

**Files to modify:**

- `src/app/components/Layout/Layout.jsx` — add preset gallery to sidebar

**Implementation:**

**Step 1: Define preset format**

```javascript
// A preset is a snapshot of visual settings (NOT the model)
{
  id: 'retro-gameboy',
  name: 'Retro Game Boy',
  category: 'retro',    // retro, print, digital, neon, minimal
  settings: {
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
    pixelSize: 8,
    ditherType: 'bayer4x4',
    invert: false,
    minBrightness: 0.05,
    backgroundColor: '#0f380f',
  }
}
```

**Step 2: Create 10-15 built-in presets**

```javascript
// src/app/data/builtInPresets.js
export const BUILT_IN_PRESETS = [
  { id: 'gameboy', name: 'Game Boy', category: 'retro', settings: { colors: ['#0f380f','#306230','#8bac0f','#9bbc0f'], pixelSize: 8, ditherType: 'bayer4x4', ... } },
  { id: 'newspaper', name: 'Newspaper', category: 'print', settings: { colors: ['#000000','#ffffff'], pixelSize: 4, ditherType: 'floydSteinberg', ... } },
  { id: 'terminal', name: 'Terminal Green', category: 'digital', settings: { colors: ['#001100','#00ff00'], pixelSize: 6, ditherType: 'bayer8x8', ... } },
  { id: 'cyberpunk', name: 'Cyberpunk', category: 'neon', settings: { ... } },
  { id: 'vaporwave', name: 'Vaporwave', category: 'neon', settings: { ... } },
  // ... more
];
```

**Step 3: Preset store with localStorage persistence**

```javascript
// src/app/store/usePresetStore.js — separate from project store
const usePresetStore = create(
  persist(
    (set, get) => ({
      customPresets: [],
      savePreset: (name, category) => {
        /* snapshot current project store settings */
      },
      deletePreset: (id) => {
        /* remove from customPresets */
      },
      importPreset: (json) => {
        /* parse and add */
      },
      exportPreset: (id) => {
        /* return JSON */
      }
    }),
    { name: 'bitmapforge-presets' }
  )
)
```

**Step 4: Gallery UI**

- Grid of preset cards with name + color swatches preview
- Click to apply (bulk `set()` on project store)
- "Save Current" button opens name/category dialog
- Import/export buttons for JSON files

**Note:** Shareable presets (via URL/file) are deferred to Phase 3 (#13b), after deterministic seeds (#18) are implemented.

**Estimated effort:** Medium-Large (6-10 hours)

---

### #18 — Deterministic project files with seed control

**Files to modify:**

- `src/app/utils/projectFile.js` — add version, seed, schema validation
- `src/app/store/useProjectStore.js` — add `seed` to state
- `src/engine/effects/BaseEffect.js` — use seeded RNG for particle scatter

**Implementation:**

**Step 1: Audit randomness usage**

Before adding a seed system, check where `Math.random()` is actually used:

- `BaseEffect.js` → `initializeParticles()` — scatter positions use randomness
- Fade variants → may use randomness for particle ordering
- **Rendering pipeline is deterministic** (brightness → dither → color mapping — no randomness)

**Step 2: Add a simple seeded PRNG**

```javascript
// src/engine/utils/seededRandom.js
export function createRNG(seed) {
  let s = seed
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}
```

**Step 3: Wire seed into particle initialization**

- Add `seed` to project store (default: random on first load)
- Pass `seed` to `BaseEffect` constructor → use seeded RNG in `initializeParticles()`
- Keep `seed` in project file for reproducibility

**Step 4: Version the project file schema**

```javascript
// projectFile.js
const CURRENT_VERSION = 2;

function buildProjectPayload(state, modelFile) {
  return {
    version: CURRENT_VERSION,
    seed: state.seed,
    createdAt: new Date().toISOString(),
    canvas: { width: ..., height: ... },
    settings: { /* all current settings */ },
    model: modelFile ? encodeModel(modelFile) : null,
  };
}

function loadProjectFile(data) {
  // Version migration
  if (data.version === 1) data = migrateV1toV2(data);
  // Schema validation
  validateSchema(data);
  return parseProject(data);
}
```

**Estimated effort:** Medium (4-8 hours)

---

### #14 — Mobile responsive layout

**Files to modify:**

- `src/app/components/Layout/Layout.jsx` — responsive breakpoints
- `src/app/components/*/` — touch-friendly sizing
- `src/index.css` or Tailwind config — mobile styles

**Implementation:**

**Step 1: Restructure Layout.jsx**

```
Desktop (lg+): [Sidebar 340px] [Preview flex-1]
Tablet (md):   [Preview full-width] [Sidebar bottom sheet, collapsible]
Mobile (sm):   [Preview full-width] [Sidebar bottom drawer, swipeable]
```

**Step 2: Make sidebar panels accordion-style on mobile**

- Use Radix Accordion (already have Radix primitives)
- Only one panel open at a time on mobile
- Preview always visible at top

**Step 3: Touch-friendly controls**

- Increase slider track height and thumb size on touch devices
- Color palette: larger drag handles
- Export panel: full-width buttons

**Step 4: Test on actual devices**

- iPhone SE (375px) minimum
- iPad (768px)
- Android common sizes

**Estimated effort:** Medium-Large (6-10 hours)

---

### #17 — Performance: OffscreenCanvas export (export path only)

**Files to modify:**

- `src/app/utils/framesProvider.js` — worker-based frame capture
- `src/app/hooks/useExport.js` — progress reporting

**Implementation:**

**Split into two sub-tasks** (per IA bridge recommendation):

**#17a: Export-path OffscreenCanvas** (higher priority)

- Move frame capture to a Web Worker using OffscreenCanvas
- Current bottleneck: `getImageData()` on main thread (CPU↔GPU sync)
- Worker approach: transfer the OffscreenCanvas to worker, render + capture there
- **Caveat:** Three.js + OffscreenCanvas has browser compatibility issues. Add capability detection and fallback to main-thread capture.

**#17b: Runtime frame caching** (lower priority)

- Cache the last rendered frame when settings haven't changed
- Skip re-render if only the animation timestamp changed (not the visual settings)
- Useful for static scenes with only rotation animation

**Fallback strategy:** If OffscreenCanvas fails capability check, keep the current main-thread export path. This is not a regression — it's the current behavior.

**Estimated effort:** Large (8-15 hours for 17a, 4-6 hours for 17b)

---

### #35 — Pluggable rendering modes architecture

**This is the architectural pivot of the entire roadmap.** Do it at the end of Phase 1 so all Phase 3 renderers build on clean abstractions.

**Files to create:**

- `src/engine/renderers/BaseRenderer.js` — interface/base class
- `src/engine/renderers/BitmapRenderer.js` — current BitmapEffect refactored
- `src/engine/renderers/index.js` — renderer registry

**Files to modify:**

- `src/engine/SceneManager.js` — use renderer factory instead of hardcoded BitmapEffect
- `src/engine/effects/BitmapEffect.js` → refactor into `BitmapRenderer.js`
- `src/app/store/useProjectStore.js` — add `renderMode` state
- `src/app/components/PreviewCanvas/PreviewCanvas.jsx` — subscribe to renderMode changes

**Implementation — Split into 3 sub-tasks:**

**#35a: Define the renderer interface**

```javascript
// src/engine/renderers/BaseRenderer.js
export class BaseRenderer {
  constructor(canvas, options) {
    this.canvas = canvas
    this.options = options
  }

  /** Initialize renderer-specific resources */
  init(width, height) {
    throw new Error('Not implemented')
  }

  /**
   * Render one frame from Three.js output
   * @param {ImageData} sourcePixels — raw pixels from WebGL canvas
   * @param {Object} params — renderer-specific parameters
   */
  render(sourcePixels, params) {
    throw new Error('Not implemented')
  }

  /** Return JSON Schema describing configurable parameters */
  getParameterSchema() {
    return {}
  }

  /** Clean up resources */
  dispose() {}

  /** Resize canvas */
  setSize(width, height) {}
}
```

**#35b: Port BitmapEffect to BitmapRenderer**

- Extract brightness calculation, color LUT, and dithering into `BitmapRenderer`
- Keep particle system and fade logic in `BaseEffect` (shared across renderers)
- Ensure ALL existing tests pass with zero behavior change
- The bitmap rendering pipeline stays identical — this is purely a structural refactor

**#35c: Validate with a second renderer (Phase 2 opener)**

- Implement a simple `PixelArtRenderer` or `AsciiRenderer` to prove the interface works
- If the second renderer can be added without modifying `BaseRenderer`, the interface is correct
- If it needs changes, iterate on the interface before committing

**Key architectural decision:**

```
SceneManager
  ├── Three.js scene/camera/lights (unchanged)
  ├── AnimationEngine (unchanged)
  ├── BaseEffect (particle system, fade phases — shared)
  └── ActiveRenderer (swappable: BitmapRenderer | AsciiRenderer | ...)
         └── render(sourcePixels, params) → draw to bitmapCanvas
```

The rendering mode is a setting in the store. When it changes, SceneManager swaps the active renderer. The fade/particle system is shared (all rendering modes can have fade-in/out effects).

**Rollback plan:** Keep `BitmapEffect.js` as a legacy path behind a feature flag. Toggle if the refactor causes regressions. Only delete the old path after #35c validates the new interface.

**Estimated effort:** Large (10-15 hours total across 3 sub-tasks)

---

## Phase 2: Expand Input Types

**Goal:** More inputs = more use cases. Text, images, and shapes dramatically increase BitmapForge's usefulness.

### Implementation Order

```
1. #21 Built-in shape primitives     — Lowest friction, no file loading needed
2. #19 Text input (3D extruded)      — High value, builds on shape infrastructure
3. #20 Image/SVG input (2D mode)     — Different pipeline path, new concept
4. #35c Validate renderer interface  — Prove the Phase 1 refactor works
5. #37 TypeScript migration           — Architecture is now stable
6. #22 Scene composition (layers)     — Largest scope, do last
```

---

### #21 — Built-in shape primitives

**Files to create:**

- `src/engine/loaders/shapeGenerator.js`

**Files to modify:**

- `src/app/store/useProjectStore.js` — add `inputType` ('file' | 'shape' | 'text' | 'image'), `shapeType`, `shapeParams`
- `src/app/components/ModelUploader/ModelUploader.jsx` — add shape selector tab
- `src/engine/SceneManager.js` — accept shape config as alternative to file

**Implementation:**

**Step 1: Shape generator**

```javascript
// src/engine/loaders/shapeGenerator.js
import * as THREE from 'three'

const SHAPES = {
  cube: (p) => new THREE.BoxGeometry(p.size, p.size, p.size),
  sphere: (p) => new THREE.SphereGeometry(p.radius, 32, 32),
  torus: (p) => new THREE.TorusGeometry(p.radius, p.tube, 16, 100),
  cylinder: (p) => new THREE.CylinderGeometry(p.radiusTop, p.radiusBottom, p.height, 32),
  cone: (p) => new THREE.ConeGeometry(p.radius, p.height, 32),
  icosahedron: (p) => new THREE.IcosahedronGeometry(p.radius, p.detail),
  torusKnot: (p) => new THREE.TorusKnotGeometry(p.radius, p.tube, 100, 16),
  plane: (p) => new THREE.PlaneGeometry(p.width, p.height)
}

export function createShape(type, params = {}) {
  const factory = SHAPES[type]
  if (!factory) throw new Error(`Unknown shape: ${type}`)
  const geometry = factory(params)
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const mesh = new THREE.Mesh(geometry, material)
  const group = new THREE.Group()
  group.add(mesh)
  return group
}

export function getShapeTypes() {
  return Object.keys(SHAPES)
}

export function getDefaultParams(type) {
  // Return sensible defaults per shape type
}
```

**Step 2: Update SceneManager to accept shapes**

```javascript
// In SceneManager.js, add alongside loadModel():
loadShape(type, params) {
  this.disposeModel();
  const group = createShape(type, params);
  this.animGroup.add(group);
  this.modelGroup = group;
}
```

**Step 3: UI — shape selector in ModelUploader area**

- Tab interface: "Upload File" | "Use Shape"
- Shape grid with icons for each primitive
- Per-shape parameter sliders (radius, segments, etc.)
- Selecting a shape immediately loads it into the preview

**Estimated effort:** Medium (4-8 hours)

---

### #19 — Text input: 3D extruded text

**Files to create:**

- `src/engine/loaders/textGenerator.js`

**Files to modify:**

- `src/app/store/useProjectStore.js` — add `textContent`, `fontFamily`, `extrudeDepth`, `bevelEnabled`
- `src/app/components/ModelUploader/ModelUploader.jsx` — add "Text" tab
- `src/engine/SceneManager.js` — add `loadText()` method

**Implementation:**

**Step 1: Font loading**
Three.js `TextGeometry` requires fonts in JSON format (typeface.js format). Options:

- Bundle 3-5 fonts as JSON (converted from TTF via facetype.js)
- Or use `three/examples/fonts/` built-in fonts (helvetiker, optimer, gentilis)
- Start with built-in Three.js fonts, add custom font upload later

**Step 2: Text geometry generation**

```javascript
// src/engine/loaders/textGenerator.js
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'

const fontCache = new Map()

export async function createTextMesh(text, options = {}) {
  const { fontUrl, size = 1, depth = 0.5, bevel = true } = options
  const font = await loadFont(fontUrl)
  const geometry = new TextGeometry(text, {
    font,
    size,
    depth,
    bevelEnabled: bevel,
    bevelThickness: 0.05,
    bevelSize: 0.03,
    bevelSegments: 3
  })
  geometry.computeBoundingBox()
  geometry.center() // Center text at origin
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
  return new THREE.Mesh(geometry, material)
}
```

**Step 3: UI — text input tab**

- Text input field (live preview as you type)
- Font selector dropdown
- Extrude depth slider
- Bevel toggle
- Font size slider

**Step 4: Wire to SceneManager**

```javascript
async loadText(text, options) {
  this.disposeModel();
  const mesh = await createTextMesh(text, options);
  const group = new THREE.Group();
  group.add(mesh);
  centerAndScale(group); // Reuse existing utility
  this.animGroup.add(group);
  this.modelGroup = group;
}
```

**Estimated effort:** Medium-Large (6-10 hours)

---

### #20 — Image/SVG input: 2D mode

**Files to create:**

- `src/engine/loaders/imageLoader.js`

**Files to modify:**

- `src/app/store/useProjectStore.js` — add `inputType: 'image'`
- `src/app/components/ModelUploader/ModelUploader.jsx` — add "Image" tab
- `src/engine/SceneManager.js` — add `loadImage()` method
- Potentially `src/engine/animation/AnimationEngine.js` — 2D-specific animations (zoom, pan)

**Implementation:**

**Two approaches** (implement both, let user choose):

**Approach A: 3D plane with texture**

- Load image as Three.js Texture
- Map onto a PlaneGeometry
- Still goes through 3D rendering pipeline → bitmap effect
- User can apply 3D rotation for perspective effects
- This is the simpler path and leverages existing infrastructure

**Approach B: Direct 2D pipeline** (higher quality)

- Skip Three.js entirely for 2D images
- Read image pixels directly → brightness grid → dithering → color mapping
- Better quality (no WebGL round-trip) but needs a separate code path
- Only for non-animated or 2D-animation cases (zoom, pan)

**Recommendation:** Start with Approach A (3D plane). It works with all existing animations and effects with zero changes. Add Approach B later if quality difference matters.

```javascript
// src/engine/loaders/imageLoader.js
export function createImagePlane(imageElement) {
  const texture = new THREE.Texture(imageElement)
  texture.needsUpdate = true
  const aspect = imageElement.width / imageElement.height
  const geometry = new THREE.PlaneGeometry(aspect * 2, 2)
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
  const mesh = new THREE.Mesh(geometry, material)
  const group = new THREE.Group()
  group.add(mesh)
  return group
}
```

**For SVG:** Rasterize at target resolution using an offscreen canvas, then treat as image.

**2D animations to add:**

- Zoom: scale the plane over time
- Pan: translate the plane horizontally/vertically
- Ken Burns: combined slow zoom + pan (cinematic)

These can be added to `AnimationEngine.js` as new effect types alongside spin/float.

**Estimated effort:** Medium-Large (8-12 hours)

---

### #37 — TypeScript migration (engine layer)

**Files to modify:**

- `vite.config.js` — add TS support (Vite handles this natively)
- All `src/engine/**/*.js` → `.ts`
- `src/app/store/useProjectStore.js` → `.ts` (for typed state)

**Implementation:**

**Step 1: Setup**

```bash
npm install -D typescript @types/three
npx tsc --init
```

Configure `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "allowJs": true, // Allow mixed JS/TS during migration
    "outDir": "dist",
    "noEmit": true // Vite handles compilation
  },
  "include": ["src"]
}
```

**Step 2: Define engine interfaces first (`.d.ts`)**

```typescript
// src/engine/types.ts
export interface EffectOptions {
  colors: string[]
  pixelSize: number
  ditherType: DitherType
  invert: boolean
  minBrightness: number
  backgroundColor: string
  renderMode: RenderMode
}

export type DitherType = 'bayer4x4' | 'bayer8x8' | 'variableDot' | 'floydSteinberg' | 'atkinson'
export type RenderMode = 'bitmap' | 'ascii' | 'pixelArt' | 'halftone' | 'led' | 'crt' | 'stipple'

export interface AnimationOptions {
  useFadeInOut: boolean
  fadeVariant: string
  animationEffects: AnimationEffects
  animationSpeed: number
  showPhaseDuration: number
  animationDuration: number
}

export interface AnimationEffects {
  spinX: boolean
  spinY: boolean
  spinZ: boolean
  float: boolean
}
```

**Step 3: Convert engine files one at a time**
Order: `types.ts` → `BaseRenderer.ts` → `BitmapRenderer.ts` → `AnimationEngine.ts` → `SceneManager.ts` → `modelLoader.ts`

**Step 4: Type the Zustand store**

```typescript
interface ProjectState {
  model: ModelInfo | null
  colors: string[]
  pixelSize: number
  // ... all fields typed
}
```

**Rule:** One PR per module conversion. Each PR must pass all existing tests.

**Estimated effort:** Medium (6-10 hours spread over multiple PRs)

---

### #22 — Scene composition: multiple objects/layers

**This is the largest issue in Phase 2. Split into sub-tasks.**

**#22a: Engine layer system in SceneManager**

- Replace single `modelGroup` with an array of layers
- Each layer: `{ id, type, group, visible, transform }`
- SceneManager methods: `addLayer()`, `removeLayer()`, `reorderLayers()`, `setLayerTransform()`
- Each layer gets its own Three.js Group added to `animGroup`

**#22b: Layer panel UI**

- Sidebar panel showing layer list
- Drag-to-reorder (using @dnd-kit, already a dependency)
- Per-layer: visibility toggle, name, type icon
- Click layer → show per-layer transform controls (position, rotation, scale)
- Add button → choose input type (file, shape, text, image)

**Dependency:** Requires #21, #19, #20 to be done (so all input types exist).

**Estimated effort:** Large (12-20 hours across both sub-tasks)

---

## Phase 3: Retro Effect System

**Goal:** Expand the visual styles beyond bitmap dithering. Each new rendering mode goes through the same pipeline but draws differently.

### Implementation Order

```
1. #24 Pixel art mode          — Simplest renderer (nearest-neighbor, no dither)
2. #23 ASCII art mode          — High demand, straightforward character mapping
3. #30 Dithering improvements  — (if not done in Phase 1, do here)
4. #25 Halftone                — Classic graphic design look
5. #26 LED matrix              — Variation on pixel grid with glow
6. #27 CRT/Scanline            — Post-processing-heavy, good test of architecture
7. #28 Stipple                 — Most complex (random placement, seeded)
8. #29 Post-processing layer   — Stackable effects on top of any renderer
9. #36 More animation presets  — Independent of renderers
10. Export compatibility        — Ensure all 10 exports work with new renderers
```

**All rendering modes depend on #35 being done in Phase 1.**

---

### Implementing a New Renderer (Template)

Every new renderer follows this pattern:

```javascript
// src/engine/renderers/[Name]Renderer.js
import { BaseRenderer } from './BaseRenderer.js'

export class NameRenderer extends BaseRenderer {
  getParameterSchema() {
    return {
      type: 'object',
      properties: {
        // renderer-specific params
      }
    }
  }

  init(width, height) {
    // Set up canvas, buffers, etc.
  }

  render(sourcePixels, params) {
    const { width, height } = sourcePixels
    const ctx = this.canvas.getContext('2d')
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 1. Read brightness from sourcePixels (shared utility)
    // 2. Apply renderer-specific transformation
    // 3. Draw to canvas
  }

  dispose() {
    // Clean up
  }
}
```

Register in `src/engine/renderers/index.js`:

```javascript
import { BitmapRenderer } from './BitmapRenderer.js'
import { PixelArtRenderer } from './PixelArtRenderer.js'
// ...

export const RENDERERS = {
  bitmap: BitmapRenderer,
  pixelArt: PixelArtRenderer
  // ...
}

export function createRenderer(mode, canvas, options) {
  const Renderer = RENDERERS[mode]
  if (!Renderer) throw new Error(`Unknown render mode: ${mode}`)
  return new Renderer(canvas, options)
}
```

---

### #24 — Pixel art mode

**The simplest new renderer — good first test of the interface.**

```javascript
render(sourcePixels, params) {
  const { gridWidth, gridHeight, pixelSize } = params;
  const ctx = this.canvas.getContext('2d');

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const idx = (gy * gridWidth + gx) * 4;
      const r = sourcePixels.data[idx];
      const g = sourcePixels.data[idx + 1];
      const b = sourcePixels.data[idx + 2];

      // Find nearest palette color (no dithering)
      const color = findNearestPaletteColor(r, g, b, params.palette);

      // Draw clean square pixel
      ctx.fillStyle = color;
      ctx.fillRect(gx * pixelSize, gy * pixelSize, pixelSize, pixelSize);
    }
  }
}
```

**Unique params:** Built-in retro palettes (Game Boy, NES, SNES, CGA, EGA), optional pixel gap, optional outline.

**Estimated effort:** Small-Medium (3-5 hours)

---

### #23 — ASCII art mode

```javascript
render(sourcePixels, params) {
  const { gridWidth, gridHeight, charRamp, fontSize, colored } = params;
  const ctx = this.canvas.getContext('2d');
  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = 'top';

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const brightness = getBrightness(sourcePixels, gx, gy, gridWidth);
      const charIndex = Math.floor(brightness * (charRamp.length - 1));
      const char = charRamp[charIndex];

      if (colored) {
        ctx.fillStyle = getColorForBrightness(brightness);
      } else {
        ctx.fillStyle = params.foregroundColor;
      }

      ctx.fillText(char, gx * fontSize * 0.6, gy * fontSize);
    }
  }
}
```

**Default character ramp:** ` .:-=+*#%@` (10 levels, configurable)

**Unique params:** Character ramp, font size, foreground/background color, colored mode toggle.

**Extra export:** Plain text file export (`.txt` with ASCII art frames).

**Estimated effort:** Medium (4-6 hours)

---

### #25 — Halftone mode

```javascript
render(sourcePixels, params) {
  const { gridWidth, gridHeight, dotShape, angle, frequency } = params;
  const ctx = this.canvas.getContext('2d');

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const brightness = getBrightness(sourcePixels, gx, gy, gridWidth);
      const radius = (1 - brightness) * (frequency / 2); // Darker = bigger dot

      const cx = gx * frequency + frequency / 2;
      const cy = gy * frequency + frequency / 2;

      ctx.fillStyle = getColorForBrightness(brightness);
      if (dotShape === 'circle') {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (dotShape === 'diamond') {
        // Rotated square
        drawDiamond(ctx, cx, cy, radius);
      }
    }
  }
}
```

**CMYK mode:** Render 4 layers at different angles (C: 15°, M: 75°, Y: 0°, K: 45°), composited with multiply blending.

**Estimated effort:** Medium (5-8 hours)

---

### #26 — LED matrix mode

Similar to bitmap but with rounded pixels and glow:

```javascript
render(sourcePixels, params) {
  const { gridWidth, gridHeight, pixelSize, gap, glowRadius, shape } = params;
  const ctx = this.canvas.getContext('2d');
  const ledSize = pixelSize - gap;

  // Dark background (LED panel)
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const brightness = getBrightness(sourcePixels, gx, gy, gridWidth);
      if (brightness < params.minBrightness) continue;

      const color = getColorForBrightness(brightness);
      const cx = gx * pixelSize + pixelSize / 2;
      const cy = gy * pixelSize + pixelSize / 2;

      // Glow effect
      if (glowRadius > 0) {
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, ledSize + glowRadius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(cx - ledSize - glowRadius, cy - ledSize - glowRadius,
                     (ledSize + glowRadius) * 2, (ledSize + glowRadius) * 2);
      }

      // LED pixel
      ctx.fillStyle = color;
      if (shape === 'round') {
        ctx.beginPath();
        ctx.arc(cx, cy, ledSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.roundRect(cx - ledSize/2, cy - ledSize/2, ledSize, ledSize, ledSize * 0.2);
        ctx.fill();
      }
    }
  }
}
```

**Estimated effort:** Medium (4-6 hours)

---

### #27 — CRT/Scanline effect

This is best implemented as a **post-processing effect** that applies on top of any renderer's output:

```javascript
applyCRT(ctx, width, height, params) {
  const imageData = ctx.getImageData(0, 0, width, height);

  // 1. Scanlines — darken every Nth row
  for (let y = 0; y < height; y++) {
    if (y % params.scanlineGap < params.scanlineThickness) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        imageData.data[idx] *= 0.5;     // R
        imageData.data[idx+1] *= 0.5;   // G
        imageData.data[idx+2] *= 0.5;   // B
      }
    }
  }

  // 2. Chromatic aberration — offset R and B channels
  if (params.chromaticAberration > 0) {
    offsetChannel(imageData, 0, params.chromaticAberration, 0);   // R → right
    offsetChannel(imageData, 2, -params.chromaticAberration, 0);  // B → left
  }

  // 3. Vignette — darken edges
  if (params.vignette > 0) {
    applyVignette(imageData, width, height, params.vignette);
  }

  // 4. Barrel distortion — curve the image
  if (params.barrelDistortion > 0) {
    applyBarrelDistortion(imageData, width, height, params.barrelDistortion);
  }

  ctx.putImageData(imageData, 0, 0);
}
```

**Note:** CRT can work as both a standalone rendering mode AND a post-processing pass. Consider implementing it as a post-processing effect (#29) that can be combined with any renderer.

**Estimated effort:** Medium (5-8 hours)

---

### #28 — Stipple (pointillism)

```javascript
render(sourcePixels, params) {
  const { gridWidth, gridHeight, dotSize, density, minSpacing } = params;
  const ctx = this.canvas.getContext('2d');
  const rng = createRNG(params.seed); // Deterministic

  // Build density map from brightness
  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const brightness = getBrightness(sourcePixels, gx, gy, gridWidth);
      const localDensity = (1 - brightness) * density; // Darker = more dots

      // Place N dots randomly within this cell
      const numDots = Math.round(localDensity);
      for (let i = 0; i < numDots; i++) {
        const x = (gx + rng()) * params.cellSize;
        const y = (gy + rng()) * params.cellSize;
        const r = dotSize * (0.5 + rng() * 0.5); // Slight size variation

        ctx.fillStyle = getColorForBrightness(brightness);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
```

**Cross-hatching variant:** Replace dots with short line segments at varying angles.

**Key requirement:** Must use seeded RNG (#18) for deterministic output across exports.

**Estimated effort:** Medium (5-8 hours)

---

### #29 — Post-processing effects layer

**Files to create:**

- `src/engine/postprocessing/PostProcessingChain.js`
- `src/engine/postprocessing/effects/` — one file per effect

**Architecture:**

```javascript
class PostProcessingChain {
  constructor() {
    this.effects = []; // Ordered array of { id, enabled, effect, params }
  }

  addEffect(id, effect, params) { ... }
  removeEffect(id) { ... }
  reorderEffects(orderedIds) { ... }
  toggleEffect(id, enabled) { ... }

  apply(ctx, width, height) {
    for (const { enabled, effect, params } of this.effects) {
      if (!enabled) continue;
      effect.apply(ctx, width, height, params);
    }
  }
}
```

**Initial effects to implement:**

1. **Scanlines** — horizontal line overlay
2. **Noise/grain** — random noise per-frame (seeded)
3. **Color shift** — hue rotation, sepia, saturation
4. **Bloom** — bright area bleed (gaussian blur of bright pixels)
5. **Vignette** — darkened corners

**UI:** Stackable panel in sidebar with drag-to-reorder, per-effect toggle and params.

**Integration point:** After the active renderer draws to `bitmapCanvas`, the post-processing chain applies on top.

**Estimated effort:** Large (10-15 hours)

---

### #36 — More animation presets

**Files to modify:**

- `src/engine/animation/AnimationEngine.js` — add new effect types
- `src/engine/animation/effectTypes.js` — add new flags
- `src/app/store/useProjectStore.js` — extend `animationEffects`
- `src/app/components/AnimationControls/AnimationControls.jsx` — new toggles

**New animations to implement:**

```javascript
// In AnimationEngine.applyEffects():
if (effects.bounce) {
  // Sinusoidal Y translation
  modelGroup.position.y = Math.abs(Math.sin(elapsed * speed * 2)) * 0.5
}

if (effects.pulse) {
  // Scale oscillation
  const scale = 1 + Math.sin(elapsed * speed) * 0.15
  modelGroup.scale.setScalar(scale)
}

if (effects.orbit) {
  // Camera orbits (not model rotation) — move camera position
  // This needs special handling in SceneManager
}

if (effects.shake) {
  // Random small displacement (seeded)
  const rng = createRNG(Math.floor(elapsed * 30)) // Per-frame seed
  modelGroup.position.x = (rng() - 0.5) * 0.1
  modelGroup.position.z = (rng() - 0.5) * 0.1
}
```

**Important:** Each new animation must also be handled in `seekTo()` for deterministic export. Use analytical formulas (not incremental accumulation) to avoid drift.

**Estimated effort:** Medium (5-8 hours)

---

### Export Compatibility (New Issue)

After each new renderer is implemented, verify:

1. All 10 export formats produce correct output
2. `engineSources.js` includes new renderer files (for Code ZIP, React Component, Web Component exports)
3. Frame capture via `renderAtTime()` works correctly with new renderers
4. Lottie export (raster) handles new visual styles

**This should be a checklist item on each renderer PR, not a separate implementation task.**

---

## Phase 4: Platform & Ecosystem

**Goal:** Open BitmapForge for community contributions and professional use.

### Implementation Order

```
1. #31 Plugin API           — Builds on #35 architecture, enables community extensions
2. #33 Embed SDK            — Lightweight runtime for web embedding
3. #32 CLI/headless render  — Automation for teams and CI pipelines
4. #34 Community gallery    — Social/discovery layer on top of presets
```

---

### #31 — Plugin API

**Files to create:**

- `src/engine/plugins/PluginRegistry.js`
- `src/engine/plugins/types.ts` (if TS migration done)
- `docs/PLUGIN_API.md`

**Implementation:**

Build on the renderer interface from #35:

```javascript
// src/engine/plugins/PluginRegistry.js
class PluginRegistry {
  constructor() {
    this.renderers = new Map();   // mode → RendererClass
    this.exporters = new Map();   // format → ExporterFactory
    this.importers = [];          // [{ test(file), load(file) }]
    this.postEffects = new Map(); // id → PostEffectClass
  }

  registerRenderer(id, RendererClass, schema) { ... }
  registerExporter(id, factory, schema) { ... }
  registerImporter(test, loader) { ... }
  registerPostEffect(id, EffectClass, schema) { ... }

  // Auto-generate UI controls from JSON Schema
  getParamsUI(pluginId) { ... }
}
```

**Dogfooding:** Refactor at least 1 built-in renderer and 1 exporter to use the plugin API. This proves the API works before documenting it for external use.

**Estimated effort:** Large (15-20 hours)

---

### #33 — Lightweight embed SDK

**Files to create:**

- `packages/embed/` — separate package with its own build
- `packages/embed/src/bitmap-forge-element.js` — web component

**Implementation:**

```javascript
// <bitmap-forge src="animation.bforge" autoplay loop></bitmap-forge>
class BitmapForgeElement extends HTMLElement {
  connectedCallback() {
    // 1. Observe visibility (IntersectionObserver)
    // 2. When visible: fetch .bforge file
    // 3. Initialize minimal renderer (no editor UI)
    // 4. Start animation loop
  }

  disconnectedCallback() {
    // Dispose renderer
  }
}

customElements.define('bitmap-forge', BitmapForgeElement)
```

**Bundle target:** < 50kb gzipped (include only renderer + Three.js minimal subset).

**Tree-shaking:** Use Vite library mode to produce a single ESM bundle. Exclude editor UI, export functions, and unnecessary Three.js modules.

**Estimated effort:** Large (15-20 hours)

---

### #32 — CLI/headless rendering

**Files to create:**

- `packages/cli/` — separate package
- `packages/cli/src/index.js` — CLI entry point

**Implementation:**

```bash
npx bitmapforge render project.bforge --format apng --out output.apng
npx bitmapforge render project.bforge --format gif --fps 24 --out output.gif
npx bitmapforge batch ./projects/ --format apng --out ./output/
```

**Approach:** Use Puppeteer/Playwright to launch a headless browser with the BitmapForge engine. This ensures pixel-perfect parity with the web UI.

Alternative: Use `node-canvas` + `gl` (headless WebGL) for a pure Node.js approach. Faster but may have rendering differences.

**Recommendation:** Start with Puppeteer (guaranteed parity), optimize to pure Node.js later if needed.

**Estimated effort:** Large (12-18 hours)

---

### #34 — Community preset gallery

**Implementation approach:**

**Phase 1 (MVP):** Curated JSON file in the repo

```
presets/
  community/
    index.json       ← manifest of all community presets
    retro-gameboy.json
    newspaper-bw.json
    ...
```

**Phase 2 (Full):** Simple API or GitHub-based submission

- Users submit presets via GitHub PR to the `presets/community/` directory
- Gallery fetches the manifest from GitHub raw content (no backend needed)
- Preview thumbnails generated as part of CI (using #32 CLI)

**UI:**

- Gallery page accessible from the main app
- Filter by category, sort by popularity (stars/downloads)
- One-click "Use this preset" loads into editor
- "Submit your preset" link → GitHub PR template

**Estimated effort:** Medium-Large (8-12 hours for MVP)

---

## Cross-Phase Dependencies

```
#15 CI/CD ────────────────────────┐
                                  │ (protects all work)
#18 Deterministic seeds ──────────┼──→ #28 Stipple (needs seeded RNG)
                                  │──→ #13b Shareable presets
                                  │──→ #32 CLI/headless (needs determinism)
                                  │
#35 Pluggable renderers ──────────┼──→ #23-#28 All new rendering modes
                                  │──→ #29 Post-processing
                                  │──→ #31 Plugin API
                                  │──→ #22 Scene composition
                                  │
#21 Shape primitives ─────────────┤
#19 Text input ───────────────────┼──→ #22 Scene composition (needs all input types)
#20 Image input ──────────────────┤
                                  │
#11 Undo/Redo ────────────────────┼──→ #12 Keyboard shortcuts (Ctrl+Z)
                                  │
#13a Local presets ───────────────┼──→ #13b Shareable presets
                                  │──→ #34 Community gallery
```

---

## Rollback & Risk Mitigation

| Risk                                                | Mitigation                                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| #35 renderer refactor breaks existing rendering     | Keep `BitmapEffect.js` as legacy fallback behind feature flag. Only delete after #35c validates.             |
| OffscreenCanvas doesn't work in all browsers        | Main-thread export as fallback (current behavior). Capability detection at startup.                          |
| New renderers break export formats                  | Mandatory export test checklist on each renderer PR. `engineSources.js` must include new files.              |
| TypeScript migration causes test failures           | One module at a time. Each PR must pass all tests. `allowJs: true` for gradual migration.                    |
| Error-diffusion dithering too slow for live preview | Profile early. Consider limiting grid resolution for Floyd-Steinberg/Atkinson. Or run dithering in a worker. |
| Scene composition (#22) scope creep                 | Split into #22a (engine) and #22b (UI). Ship #22a first, validate before building UI.                        |

---

## Verification Checklist (Per PR)

- [ ] All 240+ existing tests pass
- [ ] New feature has unit tests
- [ ] Export parity: all 10 export formats produce correct output
- [ ] No regressions in live preview performance
- [ ] Mobile layout not broken (if UI changes)
- [ ] Accessibility: new controls have labels, keyboard accessible
- [ ] Project file backward compatibility maintained
