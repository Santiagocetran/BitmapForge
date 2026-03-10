# Claude Second Opinion

- Timestamp: 2026-03-08T16:14:34-03:00
- Working root: /home/santi/sideprojects/BitmapForge
- Mode (auto): code
- Branch: main
- Commit: 600dfd1b6abe
- Worktree: dirty
- Reviewer: codex
- Model: gpt-5
- Task: Review this implementation plan for GitHub issue #22 (Scene Composition: multiple object layers) in the BitmapForge codebase. The codebase is a client-side React + Three.js app that converts 3D models into bitmap/dithered animations.

## Current architecture (relevant parts)

**SceneManager.js** — Engine facade. Has a single `this.modelGroup` (Three.js Group) and `this.currentObjectUrl` (for URL cleanup). Methods: `loadModel(file)`, `loadShape(type, params)`, `loadText(text, opts)`, `loadImage(file)`. All four replace the single modelGroup and call `this.effect.startAnimation('fadeIn')`. The animation loop gates on `if (this.modelGroup)`.

**useProjectStore.js** — Zustand store with temporal middleware (undo/redo). Has per-input-type top-level fields: `model`, `inputType`, `shapeType`, `shapeParams`, `textContent`, `fontSize`, `extrudeDepth`, `bevelEnabled`, `fontFamily`, `imageSource`. The `partialize` for undo excludes `model`, `imageSource`, `status`, and functions.

**PreviewCanvas.jsx** — React bridge. Has 4 separate `useEffect` hooks, one per input type, that call the appropriate SceneManager load method when the relevant store state changes.

**Layout.jsx** — Sidebar has sections: Input, Presets, Color Strip, Quality, Animation, Rotation Offset, Light Direction, Export & Project.

**Engine group hierarchy:**

```
scene
  └── baseGroup (static pose / rotation offset)
        └── animGroup (animation-driven rotation)
              └── modelGroup (current single object)
```

---

## Proposed Implementation Plan — #22 Scene Composition

### #22a: Engine layer system (no UI, no store changes)

**Files to modify:** `src/engine/SceneManager.js` only

**Changes:**

1. Replace `this.modelGroup` + `this.currentObjectUrl` with:

   ```js
   this.layers = new Map() // id → { id, group, objectUrl, type, name, visible }
   ```

2. New engine methods:
   - `addModelLayer(id, file)` → async, adds a new layer (does NOT clear others)
   - `addShapeLayer(id, type, params, name)` → sync
   - `addTextLayer(id, text, opts, name)` → async
   - `addImageLayer(id, file, name)` → async
   - `removeLayer(id)` → disposes group + revokes URL, removes from animGroup
   - `clearLayers()` → removes all layers
   - `setLayerVisible(id, visible)` → sets group.visible
   - `setLayerTransform(id, { position, rotation, scale })` → applies to layer group
   - `reorderLayers(ids[])` → reorders groups in animGroup (render order)
   - `hasLayers()` → replaces `if (this.modelGroup)` check

3. Backward compatibility wrappers (existing public API preserved):
   - `loadModel(file)` → `clearLayers()` + `addModelLayer(nanoid(), file)`
   - `loadShape(type, params)` → `clearLayers()` + `addShapeLayer(nanoid(), type, params, type)`
   - `loadText(text, opts)` → `clearLayers()` + `addTextLayer(nanoid(), text, opts, 'Text')`
   - `loadImage(file)` → `clearLayers()` + `addImageLayer(nanoid(), file, file.name)`
   - `disposeModel()` → `clearLayers()` (alias)

4. Animation loop: `if (this.hasLayers())` replaces `if (this.modelGroup)`

5. Each layer group gets its transform applied via `setLayerTransform`:
   ```js
   group.position.set(p.x, p.y, p.z)
   group.rotation.set(r.x, r.y, r.z)
   group.scale.setScalar(s)
   ```
   All layers still live inside `animGroup`, so global animation (spin/float) applies to all.

**Goal:** Zero behavior change. All 270 existing tests pass. Engine is now multi-layer capable.

---

### #22b: Store + Layer Panel UI

**Files to create:**

- `src/app/components/LayerPanel/LayerPanel.jsx`
- `src/app/components/LayerPanel/LayerItem.jsx`
- `src/app/store/fileRegistry.js` — module-level Map for File objects (not Zustand)

**Files to modify:**

- `src/app/store/useProjectStore.js`
- `src/app/components/PreviewCanvas/PreviewCanvas.jsx`
- `src/app/components/Layout/Layout.jsx`
- `src/app/components/InputSource/InputSource.jsx`

**Store additions:**

```js
// New state fields (alongside existing ones — no removal of old fields yet)
layers: [],           // LayerDescriptor[]
selectedLayerId: null,

// New setters:
addLayerDescriptor: (descriptor) => set({ layers: [...get().layers, descriptor] }),
removeLayerDescriptor: (id) => set({ layers: get().layers.filter(l => l.id !== id) }),
setLayerVisible: (id, visible) => set({ layers: get().layers.map(l => l.id === id ? {...l, visible} : l) }),
setLayerTransform: (id, transform) => set({ layers: get().layers.map(l => l.id === id ? {...l, ...transform} : l) }),
updateLayer: (id, partial) => set({ layers: get().layers.map(l => l.id === id ? {...l, ...partial} : l) }),
reorderLayers: (newOrder) => set({ layers: newOrder }),
selectLayer: (id) => set({ selectedLayerId: id }),
```

**LayerDescriptor shape:**

```js
{
  id: string,          // nanoid()
  name: string,        // 'Cube 1', 'Text "Hello"', 'model.stl', etc.
  type: 'model' | 'shape' | 'text' | 'image',
  visible: true,
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1,
  // Type-specific (all serializable):
  // shape: { shapeType, shapeParams }
  // text: { textContent, fontFamily, fontSize, extrudeDepth, bevelEnabled }
  // model/image: { fileName, fileSize, format } — metadata only, actual File in fileRegistry
}
```

**fileRegistry.js:**

```js
// Stores File objects indexed by layer id. Not part of Zustand/undo.
export const fileRegistry = new Map() // id → File
```

**Undo/redo:**

- `layers` array IS included in undo partialize (descriptors are serializable — no Files)
- `selectedLayerId` is excluded from undo
- Files in `fileRegistry` persist across undo operations — if undo removes a layer and re-adds it, the file is still available

**PreviewCanvas subscription changes:**

- Replace the 4 separate `useEffect` hooks with a single `useEffect` that subscribes to `layers` with `shallow`
- On layers change: diff current engine layers vs new store layers → call `addModelLayer/addShapeLayer/addTextLayer/addImageLayer` for new ones, `removeLayer` for removed ones, `setLayerVisible`/`setLayerTransform` for changed ones
- Files for model/image layers looked up from `fileRegistry`
- Keep old 4-effect approach UNTIL `layers.length > 0`, then switch to new path (migration compatibility)

**"Add to Scene" flow:**

- InputSource gets an "Add to Scene" button (replaces the current behavior of immediately loading on change)
- Clicking it creates a LayerDescriptor from current input settings, adds to store, registers file if needed
- The engine reacts via the subscription

**LayerPanel UI:**

- Collapsible sidebar section "Layers"
- Stacked list of LayerItem components
- Each item: drag handle (@dnd-kit), type icon (Box/Type/Image/Cube), name (click to rename), visible toggle eye icon, delete button
- Click item to select → `selectLayer(id)` → shows per-layer transform controls below the list (position xyz, rotation xyz, scale slider)
- "Add Layer" button at bottom → opens the InputSource in "add mode"
- Empty state: "No layers yet. Add a model, shape, text, or image."

---

## Questions for the reviewer:

1. Is the backward-compat wrapper approach (clearLayers + addLayer) correct, or should we keep the old methods entirely separate?
2. The "diff engine layers vs store layers" approach in PreviewCanvas — is this the right pattern, or should we use a simpler imperative approach (listen to specific add/remove actions)?
3. Should `selectedLayerId` affect anything in the engine, or is it purely a UI concern?
4. Any risks with the `fileRegistry` module-level Map approach — particularly for testing?
5. Is keeping old top-level store fields (model, shapeType, etc.) during the migration the right call, or should we cut over cleanly?

- Constraints: none
- Timeout seconds: 180

## Prompt

```text
[CONTEXT]
Working root: /home/santi/sideprojects/BitmapForge
Mode: code
Branch: main
Commit: 600dfd1b6abe
Task: Review this implementation plan for GitHub issue #22 (Scene Composition: multiple object layers) in the BitmapForge codebase. The codebase is a client-side React + Three.js app that converts 3D models into bitmap/dithered animations.

## Current architecture (relevant parts)

**SceneManager.js** — Engine facade. Has a single `this.modelGroup` (Three.js Group) and `this.currentObjectUrl` (for URL cleanup). Methods: `loadModel(file)`, `loadShape(type, params)`, `loadText(text, opts)`, `loadImage(file)`. All four replace the single modelGroup and call `this.effect.startAnimation('fadeIn')`. The animation loop gates on `if (this.modelGroup)`.

**useProjectStore.js** — Zustand store with temporal middleware (undo/redo). Has per-input-type top-level fields: `model`, `inputType`, `shapeType`, `shapeParams`, `textContent`, `fontSize`, `extrudeDepth`, `bevelEnabled`, `fontFamily`, `imageSource`. The `partialize` for undo excludes `model`, `imageSource`, `status`, and functions.

**PreviewCanvas.jsx** — React bridge. Has 4 separate `useEffect` hooks, one per input type, that call the appropriate SceneManager load method when the relevant store state changes.

**Layout.jsx** — Sidebar has sections: Input, Presets, Color Strip, Quality, Animation, Rotation Offset, Light Direction, Export & Project.

**Engine group hierarchy:**
```

scene
└── baseGroup (static pose / rotation offset)
└── animGroup (animation-driven rotation)
└── modelGroup (current single object)

````

---

## Proposed Implementation Plan — #22 Scene Composition

### #22a: Engine layer system (no UI, no store changes)

**Files to modify:** `src/engine/SceneManager.js` only

**Changes:**

1. Replace `this.modelGroup` + `this.currentObjectUrl` with:
   ```js
   this.layers = new Map() // id → { id, group, objectUrl, type, name, visible }
````

2. New engine methods:
   - `addModelLayer(id, file)` → async, adds a new layer (does NOT clear others)
   - `addShapeLayer(id, type, params, name)` → sync
   - `addTextLayer(id, text, opts, name)` → async
   - `addImageLayer(id, file, name)` → async
   - `removeLayer(id)` → disposes group + revokes URL, removes from animGroup
   - `clearLayers()` → removes all layers
   - `setLayerVisible(id, visible)` → sets group.visible
   - `setLayerTransform(id, { position, rotation, scale })` → applies to layer group
   - `reorderLayers(ids[])` → reorders groups in animGroup (render order)
   - `hasLayers()` → replaces `if (this.modelGroup)` check

3. Backward compatibility wrappers (existing public API preserved):
   - `loadModel(file)` → `clearLayers()` + `addModelLayer(nanoid(), file)`
   - `loadShape(type, params)` → `clearLayers()` + `addShapeLayer(nanoid(), type, params, type)`
   - `loadText(text, opts)` → `clearLayers()` + `addTextLayer(nanoid(), text, opts, 'Text')`
   - `loadImage(file)` → `clearLayers()` + `addImageLayer(nanoid(), file, file.name)`
   - `disposeModel()` → `clearLayers()` (alias)

4. Animation loop: `if (this.hasLayers())` replaces `if (this.modelGroup)`

5. Each layer group gets its transform applied via `setLayerTransform`:
   ```js
   group.position.set(p.x, p.y, p.z)
   group.rotation.set(r.x, r.y, r.z)
   group.scale.setScalar(s)
   ```
   All layers still live inside `animGroup`, so global animation (spin/float) applies to all.

**Goal:** Zero behavior change. All 270 existing tests pass. Engine is now multi-layer capable.

---

### #22b: Store + Layer Panel UI

**Files to create:**

- `src/app/components/LayerPanel/LayerPanel.jsx`
- `src/app/components/LayerPanel/LayerItem.jsx`
- `src/app/store/fileRegistry.js` — module-level Map for File objects (not Zustand)

**Files to modify:**

- `src/app/store/useProjectStore.js`
- `src/app/components/PreviewCanvas/PreviewCanvas.jsx`
- `src/app/components/Layout/Layout.jsx`
- `src/app/components/InputSource/InputSource.jsx`

**Store additions:**

```js
// New state fields (alongside existing ones — no removal of old fields yet)
layers: [],           // LayerDescriptor[]
selectedLayerId: null,

// New setters:
addLayerDescriptor: (descriptor) => set({ layers: [...get().layers, descriptor] }),
removeLayerDescriptor: (id) => set({ layers: get().layers.filter(l => l.id !== id) }),
setLayerVisible: (id, visible) => set({ layers: get().layers.map(l => l.id === id ? {...l, visible} : l) }),
setLayerTransform: (id, transform) => set({ layers: get().layers.map(l => l.id === id ? {...l, ...transform} : l) }),
updateLayer: (id, partial) => set({ layers: get().layers.map(l => l.id === id ? {...l, ...partial} : l) }),
reorderLayers: (newOrder) => set({ layers: newOrder }),
selectLayer: (id) => set({ selectedLayerId: id }),
```

**LayerDescriptor shape:**

```js
{
  id: string,          // nanoid()
  name: string,        // 'Cube 1', 'Text "Hello"', 'model.stl', etc.
  type: 'model' | 'shape' | 'text' | 'image',
  visible: true,
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1,
  // Type-specific (all serializable):
  // shape: { shapeType, shapeParams }
  // text: { textContent, fontFamily, fontSize, extrudeDepth, bevelEnabled }
  // model/image: { fileName, fileSize, format } — metadata only, actual File in fileRegistry
}
```

**fileRegistry.js:**

```js
// Stores File objects indexed by layer id. Not part of Zustand/undo.
export const fileRegistry = new Map() // id → File
```

**Undo/redo:**

- `layers` array IS included in undo partialize (descriptors are serializable — no Files)
- `selectedLayerId` is excluded from undo
- Files in `fileRegistry` persist across undo operations — if undo removes a layer and re-adds it, the file is still available

**PreviewCanvas subscription changes:**

- Replace the 4 separate `useEffect` hooks with a single `useEffect` that subscribes to `layers` with `shallow`
- On layers change: diff current engine layers vs new store layers → call `addModelLayer/addShapeLayer/addTextLayer/addImageLayer` for new ones, `removeLayer` for removed ones, `setLayerVisible`/`setLayerTransform` for changed ones
- Files for model/image layers looked up from `fileRegistry`
- Keep old 4-effect approach UNTIL `layers.length > 0`, then switch to new path (migration compatibility)

**"Add to Scene" flow:**

- InputSource gets an "Add to Scene" button (replaces the current behavior of immediately loading on change)
- Clicking it creates a LayerDescriptor from current input settings, adds to store, registers file if needed
- The engine reacts via the subscription

**LayerPanel UI:**

- Collapsible sidebar section "Layers"
- Stacked list of LayerItem components
- Each item: drag handle (@dnd-kit), type icon (Box/Type/Image/Cube), name (click to rename), visible toggle eye icon, delete button
- Click item to select → `selectLayer(id)` → shows per-layer transform controls below the list (position xyz, rotation xyz, scale slider)
- "Add Layer" button at bottom → opens the InputSource in "add mode"
- Empty state: "No layers yet. Add a model, shape, text, or image."

---

## Questions for the reviewer:

1. Is the backward-compat wrapper approach (clearLayers + addLayer) correct, or should we keep the old methods entirely separate?
2. The "diff engine layers vs store layers" approach in PreviewCanvas — is this the right pattern, or should we use a simpler imperative approach (listen to specific add/remove actions)?
3. Should `selectedLayerId` affect anything in the engine, or is it purely a UI concern?
4. Any risks with the `fileRegistry` module-level Map approach — particularly for testing?
5. Is keeping old top-level store fields (model, shapeType, etc.) during the migration the right call, or should we cut over cleanly?

Constraints: none
Worktree: dirty

[RECENT COMMITS]
600dfd1 Merge pull request #40 from Santiagocetran/fix/undo-crash-empty-history
7413c7b fix: resolve lint errors in BaseRenderer — unused abstract params
230182b fix: guard undo/redo against empty history to prevent crash
b73bdaf Merge pull request #39 from Santiagocetran/feat/phase2-renderer-and-inputs
7c164f3 feat: add 10 font options to text input; default font size 0.8
a2d31ea fix: hide empty-state placeholder when inputType is not 'model'
1bd6999 feat: pluggable renderer architecture (#35) + Phase 2 input types (#21, #19, #20)
e3d4886 Merge pull request #38 from Santiagocetran/feat/phase1a-ux-polish

[REQUEST]
You are Codex giving a second opinion on this coding task.

1. Proposed approach (brief)
2. Exact edits (file paths)
3. Test/verify commands
4. Risks/edge cases and likely regressions
5. One alternative approach that is higher upside but higher risk

[DIFF PREVIEW]
diff --git a/docs/CICD_AND_OPENSOURCE.md b/docs/CICD_AND_OPENSOURCE.md
deleted file mode 100644
index 4057677..0000000
--- a/docs/CICD_AND_OPENSOURCE.md
+++ /dev/null
@@ -1,322 +0,0 @@
-# CI/CD & Open-Source Infrastructure

- -Guide for setting up the development environment, CI pipeline, and contributor experience for BitmapForge.
- ***
- -## 1. Code Quality Tools
- -### ESLint
- -Install ESLint with the flat config format (ESLint 9+):
- -`bash
-npm install -D eslint @eslint/js eslint-plugin-react eslint-plugin-react-hooks globals
-`
- -Create `eslint.config.js`:
- -```js
  -import js from '@eslint/js'
  -import react from 'eslint-plugin-react'
  -import reactHooks from 'eslint-plugin-react-hooks'
  -import globals from 'globals'
- -export default [
- js.configs.recommended,
- {
- files: ['src/**/*.{js,jsx}'],
- plugins: { react, 'react-hooks': reactHooks },
- languageOptions: {
-      ecmaVersion: 'latest',
-      sourceType: 'module',
-      globals: { ...globals.browser },
-      parserOptions: { ecmaFeatures: { jsx: true } }
- },
- rules: {
-      ...reactHooks.configs.recommended.rules,
-      'react/react-in-jsx-scope': 'off',
-      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
- }
- },
- { ignores: ['dist/', 'node_modules/'] }
  -]
  -```
- -### Prettier
- -Install Prettier:
- -`bash
-npm install -D prettier
-`
- -Create `.prettierrc`:
- -```json
  -{
- "semi": false,
- "singleQuote": true,
- "trailingComma": "none",
- "printWidth": 120
  -}
  -```
- -These rules match the existing code style (no semicolons, single quotes, no trailing commas).
- -### package.json scripts
- -Add these scripts:
- -```json
  -{
- "scripts": {
- "dev": "vite",
- "build": "vite build",
- "preview": "vite preview",
- "lint": "eslint src/",
- "lint:fix": "eslint src/ --fix",
- "format": "prettier --write \"src/\*_/_.{js,jsx,css}\"",
- "format:check": "prettier --check \"src/\*_/_.{js,jsx,css}\"",
- "test": "vitest run",
- "test:watch": "vitest"
- }
  -}
  -```
- ***
- -## 2. Unit Testing with Vitest
- -### Setup
- -`bash
-npm install -D vitest
-`
- -Add to `vite.config.js`:
- -```js
  -import { defineConfig } from 'vite'
  -import react from '@vitejs/plugin-react'
  -import tailwindcss from '@tailwindcss/vite'
- -export default defineConfig({
- plugins: [react(), tailwindcss()],
- test: {
- environment: 'node',
- include: ['src/**/*.test.{js,jsx}']
- }
  -})
  -```
- -### What to test
- -The engine layer (`src/engine/`) is the best candidate for unit tests — it's pure JS with no React or DOM dependencies (except Canvas/WebGL which can be mocked).
- -**Priority test targets:**
- -1. **Animation presets** (`src/engine/animation/presets.js`) — Pure data, trivial to test. Verify preset shapes, default values, that all expected presets exist.
- -2. **AnimationEngine** (`src/engine/animation/AnimationEngine.js`) — Test that `update()` applies correct rotation deltas, that `seekTo()` produces deterministic state, that `getLoopDurationMs()` returns correct values for different configs.
- -3. **Model loader** (`src/engine/loaders/modelLoader.js`) — Test format detection logic (file extension parsing). The actual Three.js loading requires mocking but the dispatch logic is testable.
- -4. **Zustand store** (`src/app/store/useProjectStore.js`) — Test state transitions: color reordering, clamping logic, add/remove color bounds (2-6), status updates.
- -5. **Utility functions** (`src/app/utils/projectFile.js`, `src/app/utils/codeExport.js`) — Pure functions, easy to test.
- -**Test file convention:** Place tests next to the source file: `presets.test.js` next to `presets.js`.
- -### Example starter test
- -```js
  -// src/engine/animation/presets.test.js
  -import { describe, it, expect } from 'vitest'
  -import { PRESETS } from './presets.js'
- -describe('animation presets', () => {
- it('includes all expected preset keys', () => {
- expect(Object.keys(PRESETS)).toEqual(expect.arrayContaining(['spinY', 'spinX', 'spinZ', 'float']))
- })
-
- it('each preset has a type and default speed', () => {
- for (const [key, preset] of Object.entries(PRESETS)) {
-      expect(preset).toHaveProperty('type', key)
- }
- })
  -})
  -```
- ***
- -## 3. GitHub Actions CI Pipeline
- -Create `.github/workflows/ci.yml`:
- -```yaml
  -name: CI
- -on:
- pull_request:
- branches: [main]
- push:
- branches: [main]
- -jobs:
- check:
- runs-on: ubuntu-latest
- steps:
-      - uses: actions/checkout@v4
-
-      - uses: actions/setup-node@v4
-        with:
-          node-version: 20
-          cache: npm
-
-      - run: npm ci
-
-      - name: Lint
-        run: npm run lint
-
-      - name: Format check
-        run: npm run format:check
-
-      - name: Unit tests
-        run: npm test
-
-      - name: Build
-        run: npm run build
  -```
- -This runs on every PR and every push to main. All four checks (lint, format, tests, build) must pass.
- -### Branch protection
- -In GitHub repo Settings > Branches > Branch protection rules for `main`:
- -- [x] Require a pull request before merging (already done)
  -- [x] Require status checks to pass before merging — select the `check` job
  -- [x] Require branches to be up to date before merging
  -- [ ] Do NOT require linear history (rebase) unless you prefer it — merge commits are fine for open source
- ***
- -## 4. PR and Issue Templates
- -### PR Template
- -Create `.github/pull_request_template.md`:
- -```markdown
  -## What does this PR do?
- -<!-- Brief description of the change -->
- -## How to test
- -<!-- Steps to verify the change works -->
- -## Checklist
- -- [ ] `npm run lint` passes
  -- [ ] `npm run build` succeeds
  -- [ ] Tested in the browser with a 3D model loaded
  -- [ ] New code has unit tests (if applicable)
  -```
- -### Issue Templates
- -Create `.github/ISSUE_TEMPLATE/bug_report.md`:
- ## -```markdown
  -name: Bug Report
  -about: Report something that isn't working
  -labels: bug
  ***
- -**What happened?**
- -**What did you expect?**
- -**Steps to reproduce:**
- -1.
  -2.
  -3.
- -**Browser/OS:**
- -**Screenshots (if applicable):**
  -```
- -Create `.github/ISSUE_TEMPLATE/feature_request.md`:
- ## -```markdown
  -name: Feature Request
  -about: Suggest an idea
  -labels: enhancement
  ***
- -**What would you like?**
- -**Why is this useful?**
- -**Any ideas on implementation?**
  -```
- ***
- -## 5. CONTRIBUTING.md
- -Create `CONTRIBUTING.md` at the repo root:
- -```markdown
  -# Contributing to BitmapForge
- -## Getting started
- -1. Fork the repo and clone your fork
  -2. `npm install`
  -3. `npm run dev` — starts the Vite dev server at http://localhost:5173
  -4. Make your changes on a new branch
  -5. `npm run lint && npm test && npm run build` — make sure everything passes
  -6. Open a PR against `main`
- -## Project structure
- -- `src/engine/` — Framework-agnostic rendering engine (vanilla JS). Do not import from `src/app/` here.
  -- `src/app/` — React application. All state flows through the Zustand store in `src/app/store/`.
  -- See `CLAUDE.md` for detailed architecture docs.
- -## Code style

[PROCESS RULES]

- Use only provided context.
- Do not invent files, commits, or commands that are not grounded in context.
- If evidence is missing, state an explicit assumption.

[OUTPUT FORMAT]

- Findings first (ordered by severity)
- Plan (max 6 bullets)
- Patch-ready edits
- Verification commands
- Confidence + unknowns
- Short rationale

```

## Codex Response

**Findings**
- High: Back-compat wrappers omit the existing “fadeIn” kick. Today, `loadModel/loadShape/...` trigger `effect.startAnimation('fadeIn')`. The new wrappers must preserve this on the 0→1 layer transition; otherwise users won’t see the expected entry animation.
- High: Disposal correctness. `removeLayer/clearLayers` must traverse and dispose geometries, materials, textures, and revoke object URLs per layer to avoid GPU/memory leaks. Shapes/text layers need geometry/material disposal; image layers must dispose textures.
- High: Preview diffing can thrash and double-load. A naïve deep-diff on `layers` risks re-adding objects on every transform/name change (new object identities). Per vercel-react-best-practices, prefer event-driven updates over broad effects; if diffing, use stable IDs and primitive compares only.
- Medium: Render order uncertainty. Reordering by mutating `animGroup.children` alone isn’t stable for transparency; set each layer group’s `renderOrder` to the store index to guarantee paint order.
- Medium: Undo stack bloat. Including `layers` with full transforms in temporal middleware can explode history during drag/gizmo moves. Filter or throttle transform updates (e.g., only push to history on pointer up) to keep undo usable.
- Medium: `fileRegistry` lifetime. Module-level `Map` survives undo/redo but can leak across HMR/tests. Provide `resetFileRegistry()` and clear entries when a layer is permanently removed; document test helpers.
- Low: Scale API only supports uniform scale. If non-uniform scaling may be needed later, keep structure `scale: {x,y,z}` internally even if UI exposes a uniform slider.
- Low: Migration path can double-load. “Keep old 4-effect until layers.length > 0” risks loading both paths once. Add an explicit feature flag or a one-shot switch.

**Plan**
- Implement `layers` Map in engine + full disposal + renderOrder.
- Keep back-compat methods; trigger fade-in on 0→1 layers.
- Add action-driven engine bridge; use minimal diff as fallback.
- Introduce `fileRegistry` with clear/reset helpers.
- Add Layer Panel UI and “Add to Scene” flow.
- Tame undo noise: filter transform updates and exclude `selectedLayerId`.

**Patch-ready edits**
- `src/engine/SceneManager.js`
  - Replace `this.modelGroup`/`this.currentObjectUrl` with `this.layers = new Map()`.
  - Add methods: `addModelLayer/addShapeLayer/addTextLayer/addImageLayer/removeLayer/clearLayers/setLayerVisible/setLayerTransform/reorderLayers/hasLayers`.
  - In `add*Layer`: create a `THREE.Group` with `id`, attach object, set defaults, set `group.renderOrder = index`, store `{ id, group, objectUrl, type, name, visible }` in the Map.
  - In `removeLayer`: remove from `animGroup`, traverse `group` to `dispose()` materials, geometries, textures; `URL.revokeObjectURL(objectUrl)` if present.
  - In `clearLayers`: iterate `this.layers.values()` and call `removeLayer(id)`.
  - In `setLayerTransform`: set position/rotation; for scale support uniform (`setScalar`) now, but accept `{ x,y,z }` internally.
  - In `reorderLayers(ids)`: update each group’s `renderOrder` to its index; optionally reorder `animGroup.children` to mirror store.
  - Back-compat: implement `loadModel/loadShape/loadText/loadImage` as `clearLayers()` + `add*Layer(nanoid(), ...)`; if previous `layers.size === 0` before add, call `this.effect.startAnimation('fadeIn')`.
  - Replace animation loop guard with `if (this.hasLayers())`.
- `src/app/store/fileRegistry.js` (new)
  - `export const fileRegistry = new Map()`; add helpers `registerFile(id, file)`, `getFile(id)`, `deleteFile(id)`, `resetFileRegistry()` for tests.
- `src/app/store/useProjectStore.js`
  - Add `layers: []`, `selectedLayerId: null`.
  - Add actions: `addLayerDescriptor`, `removeLayerDescriptor`, `setLayerVisible`, `setLayerTransform`, `updateLayer`, `reorderLayers`, `selectLayer`.
  - Temporal middleware: include `layers`, exclude `selectedLayerId`. Add a transform-update filter: only commit transform changes to history on end-of-interaction (pointer up) or debounce to RAF; otherwise store live transforms in a ref and flush on end.
  - Retain legacy fields during migration but gate legacy auto-load with a feature flag `compositionEnabled` (default true in dev behind issue #22).
- `src/app/components/PreviewCanvas/PreviewCanvas.jsx`
  - Add a single subscription to `layers` via `useStore.subscribe(s => s.layers, shallow)`.
  - Engine bridge (preferred): subscribe to specific store actions (add/remove/reorder/update/visibility/transform) and forward to engine one-for-one (vercel rerender-move-effect-to-event). If keeping diff: compare by `id`, and within an id only compare primitives `visible`, `position/rotation/scale` numbers; never compare whole objects by identity.
  - Maintain migration switch: when `compositionEnabled` OR `layers.length > 0`, disable the four legacy effects; else keep legacy path.
- `src/app/components/LayerPanel/LayerPanel.jsx`, `src/app/components/LayerPanel/LayerItem.jsx` (new)
  - Implement list with dnd-kit; wire `selectLayer`, `setLayerVisible`, `reorderLayers`, `removeLayerDescriptor`. Inline rename uses `updateLayer(id, { name })`. Transform controls write to `setLayerTransform`.
- `src/app/components/InputSource/InputSource.jsx`
  - Replace “load immediately” with “Add to Scene”. On click, build a `LayerDescriptor` (with `id = nanoid()`), call `addLayerDescriptor`, and for file inputs register in `fileRegistry`.
- `src/app/components/Layout/Layout.jsx`
  - Add collapsible “Layers” section that renders `LayerPanel`.

**Verification commands**
- Static checks
  - `npm run lint`
  - `npm run build`
- Unit tests (vital new ones)
  - Engine: add `src/engine/SceneManager.layers.test.js` covering 0→1 fade-in, add/remove/clear, reorder sets `renderOrder`, transform setters, disposal revokes URLs.
  - Store: add `useProjectStore.layers.test.js` for add/remove/reorder/visibility/transform and temporal filter behavior.
  - Registry: add `fileRegistry.test.js` for register/get/delete/reset.
  - Run: `npm test`
- Manual sanity
  - Start dev: `npm run dev`, add multiple layers (model + text + image); verify fade-in only on first layer, per-layer visibility/transform, reorder visual stacking (especially with transparency), undo/redo doesn’t explode history, removing layers frees GPU memory (track in devtools if available).

**Risks & edge cases**
- Transparent materials still sort by depth; `renderOrder` enforces painter’s order but may not perfectly solve all camera angles. Document limitation; consider per-material `depthWrite=false` where appropriate.
- Transform undo throttling: if too aggressive, users may lose fine-grained undo steps. Tune thresholds or toggle “record transforms continuously” in dev.
- HMR and tests: `fileRegistry` persistence may surprise. Ensure `resetFileRegistry()` is called in `beforeEach()` of tests and on hot dispose during dev.
- Text/shape disposal: fonts/extrude geometries can hold references; make sure any loaders created per layer are also cleaned up.
- Migration: dual-path loading can lead to orphaned engine nodes. Ensure legacy effects early-return when composition is active.

**One higher-upside, higher-risk alternative**
- Move engine sync to action-middleware only (no diffing). Implement a dedicated store middleware that intercepts `addLayerDescriptor/remove/...` and calls SceneManager immediately. This eliminates expensive diff logic and prevents redundant loads (aligns with vercel “move effect logic to events”), but requires carefully routing every layer action through the middleware and increases coupling between store and engine.

**Confidence + unknowns**
- Confidence: medium-high on architecture/risk calls; low on small integration details (exact method/prop names) without the code open.
- Unknowns: exact disposal utilities available today, how `effect` is wired, whether non-uniform scale is needed, and existing test harness.

**Short rationale**
The plan is directionally right: make the engine multi-layer without breaking callers, then add a thin UI/store layer. The main pitfalls are resource disposal, preserving current animation behavior, and avoiding a heavy diff-based React effect. Tightening those aligns with React best practices and keeps runtime costs predictable.
```
