# Claude Second Opinion

- Timestamp: 2026-03-09T10:04:34-03:00
- Working root: /home/santi/sideprojects/BitmapForge
- Mode (auto): code
- Branch: main
- Commit: 5e7024f595b1
- Worktree: dirty
- Reviewer: codex
- Model: gpt-5
- Task: Audit this implementation plan for #23 ASCII art rendering mode in BitmapForge.

## Context

BitmapForge is a client-side 3D→retro pipeline. The renderer architecture has:

- `BaseRenderer` with interface: `init/render/drawPixel/beginFrame/endFrame/shouldDraw/setSize/dispose/updateOptions`
- `BitmapRenderer` (dithered pixel grid) and `PixelArtRenderer` (clean squares) already implemented
- `render(imageData, gridW, gridH, getColor)` — `imageData` is flat RGBA from a downsampled canvas (gridW × gridH pixels), `getColor(brightness)` maps [0,1] → CSS palette color
- `drawPixel(x, y, brightness, color, alpha)` — called per-particle during fade animations, `x/y` are pre-multiplied canvas coords (`gx * pixelSize`)
- `beginFrame(backgroundColor)` — clears/fills canvas each frame
- Options propagate via `updateOptions(opts)` from `BitmapEffect` whenever store state changes
- `renderMode` change → `SceneManager.setRenderMode(mode)` → `BitmapEffect.setRenderer(new XxxRenderer(options))`

## Proposed implementation plan

### 1. `src/engine/renderers/AsciiRenderer.js` (new file)

```js
const CHAR_RAMPS = {
  classic: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  dense: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  minimal: ' .+#'
}

class AsciiRenderer extends BaseRenderer {
  constructor(options) {
    /* charRamp:'classic', asciiColored:false, pixelSize, minBrightness, invert, backgroundColor */
  }

  beginFrame(backgroundColor) {
    /* fill canvas with bg (no transparent support — use #000 instead) */
  }

  drawPixel(x, y, brightness, color, alpha) {
    // map brightness → char index → fillText(char, x, y)
    // font size = pixelSize, cache font string to avoid re-setting
  }

  render(imageData, gridW, gridH, getColor) {
    // cellW = canvas.width / gridW, cellH = canvas.height / gridH
    // fontSize = Math.max(4, Math.min(cellH, pixelSize * 2))
    // monochrome: fillStyle = getColor(1)  [last/brightest palette color]
    // colored: fillStyle = getColor(brightness)
    // skip space characters (background already drawn)
  }
}
```

### 2. `src/engine/renderers/index.js`

Add `ascii: AsciiRenderer` to `RENDERERS` and `RENDERER_LABELS`.

### 3. `src/app/store/useProjectStore.js`

Add to DEFAULT_STATE:

- `charRamp: 'classic'`
- `asciiColored: false`

Add setters: `setCharRamp`, `setAsciiColored`.

### 4. `src/app/components/PreviewCanvas/PreviewCanvas.jsx`

Add `charRamp` and `asciiColored` to the `unsubEffect` subscription slice (already routes to `manager.updateEffectOptions(slice)` which calls `updateOptions` on the active renderer).

### 5. `src/app/components/QualitySettings/QualitySettings.jsx`

Add ASCII-specific controls rendered only when `renderMode === 'ascii'`:

- Char ramp dropdown (classic/blocks/dense/minimal)
- Colored toggle

### 6. `src/app/utils/engineSources.js`

Add `AsciiRenderer` import and entry to `ENGINE_SOURCES`.

## Questions for the audit

1. Is `beginFrame` handling for ASCII correct — is forcing `#000` when `backgroundColor === 'transparent'` the right call, or should it respect transparent backgrounds?
2. Is `fontSize = Math.max(4, Math.min(cellH, pixelSize * 2))` reasonable, or should it just be `pixelSize`?
3. Any issues with routing `charRamp`/`asciiColored` through `updateEffectOptions` → `updateOptions` — does the renderer receive them in time for the next frame?
4. Are there any edge cases in the `render()` or `drawPixel()` paths I'm missing?
5. Is adding `charRamp`/`asciiColored` to the `partialize` undo filter correct (they should be undo-able visual settings)?
6. Any other concerns about the plan?

- Constraints: none
- Timeout seconds: 180

## Prompt

````text
[CONTEXT]
Working root: /home/santi/sideprojects/BitmapForge
Mode: code
Branch: main
Commit: 5e7024f595b1
Task: Audit this implementation plan for #23 ASCII art rendering mode in BitmapForge.

## Context

BitmapForge is a client-side 3D→retro pipeline. The renderer architecture has:
- `BaseRenderer` with interface: `init/render/drawPixel/beginFrame/endFrame/shouldDraw/setSize/dispose/updateOptions`
- `BitmapRenderer` (dithered pixel grid) and `PixelArtRenderer` (clean squares) already implemented
- `render(imageData, gridW, gridH, getColor)` — `imageData` is flat RGBA from a downsampled canvas (gridW × gridH pixels), `getColor(brightness)` maps [0,1] → CSS palette color
- `drawPixel(x, y, brightness, color, alpha)` — called per-particle during fade animations, `x/y` are pre-multiplied canvas coords (`gx * pixelSize`)
- `beginFrame(backgroundColor)` — clears/fills canvas each frame
- Options propagate via `updateOptions(opts)` from `BitmapEffect` whenever store state changes
- `renderMode` change → `SceneManager.setRenderMode(mode)` → `BitmapEffect.setRenderer(new XxxRenderer(options))`

## Proposed implementation plan

### 1. `src/engine/renderers/AsciiRenderer.js` (new file)

```js
const CHAR_RAMPS = {
  classic: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  dense: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  minimal: ' .+#'
}

class AsciiRenderer extends BaseRenderer {
  constructor(options) { /* charRamp:'classic', asciiColored:false, pixelSize, minBrightness, invert, backgroundColor */ }

  beginFrame(backgroundColor) { /* fill canvas with bg (no transparent support — use #000 instead) */ }

  drawPixel(x, y, brightness, color, alpha) {
    // map brightness → char index → fillText(char, x, y)
    // font size = pixelSize, cache font string to avoid re-setting
  }

  render(imageData, gridW, gridH, getColor) {
    // cellW = canvas.width / gridW, cellH = canvas.height / gridH
    // fontSize = Math.max(4, Math.min(cellH, pixelSize * 2))
    // monochrome: fillStyle = getColor(1)  [last/brightest palette color]
    // colored: fillStyle = getColor(brightness)
    // skip space characters (background already drawn)
  }
}
````

### 2. `src/engine/renderers/index.js`

Add `ascii: AsciiRenderer` to `RENDERERS` and `RENDERER_LABELS`.

### 3. `src/app/store/useProjectStore.js`

Add to DEFAULT_STATE:

- `charRamp: 'classic'`
- `asciiColored: false`

Add setters: `setCharRamp`, `setAsciiColored`.

### 4. `src/app/components/PreviewCanvas/PreviewCanvas.jsx`

Add `charRamp` and `asciiColored` to the `unsubEffect` subscription slice (already routes to `manager.updateEffectOptions(slice)` which calls `updateOptions` on the active renderer).

### 5. `src/app/components/QualitySettings/QualitySettings.jsx`

Add ASCII-specific controls rendered only when `renderMode === 'ascii'`:

- Char ramp dropdown (classic/blocks/dense/minimal)
- Colored toggle

### 6. `src/app/utils/engineSources.js`

Add `AsciiRenderer` import and entry to `ENGINE_SOURCES`.

## Questions for the audit

1. Is `beginFrame` handling for ASCII correct — is forcing `#000` when `backgroundColor === 'transparent'` the right call, or should it respect transparent backgrounds?
2. Is `fontSize = Math.max(4, Math.min(cellH, pixelSize * 2))` reasonable, or should it just be `pixelSize`?
3. Any issues with routing `charRamp`/`asciiColored` through `updateEffectOptions` → `updateOptions` — does the renderer receive them in time for the next frame?
4. Are there any edge cases in the `render()` or `drawPixel()` paths I'm missing?
5. Is adding `charRamp`/`asciiColored` to the `partialize` undo filter correct (they should be undo-able visual settings)?
6. Any other concerns about the plan?
   Constraints: none
   Worktree: dirty

[RECENT COMMITS]
5e7024f Merge pull request #41 from Santiagocetran/feat/scene-composition-layers
31c2a10 chore: disable auto-save/restore — always start with default settings
ad60439 revert: remove layer panel UI (#22b) — premature without per-layer controls
1f538e6 feat: scene composition — multi-layer engine (#22a) + layer panel UI (#22b)
600dfd1 Merge pull request #40 from Santiagocetran/fix/undo-crash-empty-history
7413c7b fix: resolve lint errors in BaseRenderer — unused abstract params
230182b fix: guard undo/redo against empty history to prevent crash
b73bdaf Merge pull request #39 from Santiagocetran/feat/phase2-renderer-and-inputs

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

- Critical: Transparency handling in `beginFrame` should respect transparent backgrounds. Forcing `#000` when `backgroundColor === 'transparent'` breaks composition use-cases and diverges from typical canvas semantics. Preferred: clear with `clearRect` when transparent; fill otherwise. Also ensure `globalAlpha` reset after fills.
- High: Character sizing should derive from grid cell height, not `pixelSize`. Use `fontSize = cellH` (clamped to a sane min like 6–8) and a monospace font. `pixelSize` tunes square renderers and doesn’t necessarily match text metrics. Without this, text will misalign or clip across aspect ratios and DPI.
- High: Glyph alignment and metrics must be handled explicitly. Set `textBaseline = 'top'`, `textAlign = 'left'`, and compute `cellW = canvas.width / gridW`, `cellH = canvas.height / gridH`. Optionally pre-measure a representative glyph once per frame to center horizontally (common monospace width ≈ 0.6 × fontSize).
- Medium: `updateOptions` timing is fine if options only affect future frames. Ensure `AsciiRenderer.updateOptions` caches derived values (ramp string, ramp length, invert flag, font string) and marks a dirty flag so the next `render()` recomputes font and metrics once.
- Medium: `drawPixel` for fade animations must snap to the ASCII grid to avoid jitter. Use the same `cellW/cellH` grid math and draw one glyph per cell; skip duplicate draws within a frame (optional micro-cache Set of `cellKey = yCell*gridW + xCell`).
- Medium: Brightness→glyph mapping must handle invert and clamping. Ramps are ordered by ink density ascending; default mapping should be `idx = invert ? (n-1 - Math.round(b*(n-1))) : Math.round(b*(n-1))`, with `b` clamped to [minBrightness, 1].
- Low: Performance risks from `ctx.fillText` per cell per frame. Mitigate by caching `ctx.font`, `fillStyle`, and a precomputed `rampChars[]`. Longer term, consider a glyph atlas (see Alternative).
- Low: Undo history — adding `charRamp`/`asciiColored` to the `partialize` filter is correct and expected, but consider grouping rapid toggles (debounce) if the store currently records each change instantly.

**Plan**

- Add `AsciiRenderer` with transparent-aware `beginFrame`, grid-aware `render/drawPixel`.
- Wire `ascii` into renderer registry and dynamic import sources.
- Extend store: `charRamp`, `asciiColored`, setters, undo filter.
- Subscribe options in `PreviewCanvas` slice to propagate via `updateOptions`.
- Add UI controls in `QualitySettings` gated by `renderMode === 'ascii'`.
- Smoke test DPI, invert, colored, and undo interactions.

**Patch-ready edits**

- src/engine/renderers/AsciiRenderer.js
  - New file skeleton:
    - Imports: `BaseRenderer` from the same folder.
    - Constants:
      - `CHAR_RAMPS = { classic: ' .:-=+*#%@', blocks: ' ░▒▓█', dense: ' .\'\`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$', minimal: ' .+#' }`
      - `MONOSPACE_FALLBACK = 'Menlo, Monaco, Consolas, monospace'`
    - Class:
      - `constructor(options)`:
        - Defaults: `{ charRamp: 'classic', asciiColored: false, pixelSize: 8, minBrightness: 0, invert: false, backgroundColor: 'transparent' }`
        - Store `ctx`, canvas refs from `BaseRenderer` pattern used by other renderers.
        - Internal cache: `this._rampStr`, `this._rampChars`, `this._rampLen`, `this._fontSize`, `this._fontStr`, `this._cellW`, `this._cellH`, `this._metrics`, `this._dirty = true`.
      - `updateOptions(opts)`:
        - Merge, if `charRamp`, `invert`, `asciiColored`, `pixelSize`, or `backgroundColor` change → set `this._dirty = true`.
      - `setSize(w, h)`:
        - Call `super.setSize(w, h)`; set `_dirty = true`.
      - `beginFrame(backgroundColor)`:
        - Resolve `bg = backgroundColor ?? this.options.backgroundColor`.
        - If `bg === 'transparent'`:
          - `ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.restore();`
        - Else:
          - `ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();`
      - `#prepare(gridW, gridH)`:
        - Compute `cellW = canvas.width / gridW`, `cellH = canvas.height / gridH`.
        - `fontSize = Math.max(6, Math.floor(cellH))`.
        - `fontStr = `${fontSize}px ${MONOSPACE_FALLBACK}``.
        - Set `ctx.font = fontStr; ctx.textBaseline = 'top'; ctx.textAlign = 'left';`
        - `rampStr = CHAR_RAMPS[this.options.charRamp] || CHAR_RAMPS.classic`
        - Cache `rampChars = Array.from(rampStr)`, `rampLen = rampChars.length`.
        - Optionally `metrics = ctx.measureText('M')` for horizontal centering: `xOffset = Math.max(0, (cellW - metrics.width) * 0.5)`. Cache `xOffset`.
        - Save to fields and clear `_dirty`.
      - `#glyphFor(brightness)`:
        - `b = Math.min(1, Math.max(this.options.minBrightness, brightness))`
        - `idx = this.options.invert ? (this._rampLen - 1 - Math.round(b*(this._rampLen-1))) : Math.round(b*(this._rampLen-1))`
        - `ch = this._rampChars[idx]`
        - Return `ch === ' ' ? null : ch`
      - `render(imageData, gridW, gridH, getColor)`:
        - If `_dirty` → `#prepare(gridW, gridH)`.
        - Local refs: `cellW`, `cellH`, `xOffset`, `ctx`.
        - Cache `ctx.font` once per frame; do not set per glyph.
        - Iterate `gy 0→gridH-1`, `gx 0→gridW-1`:
          - `i = (gy*gridW + gx) * 4`
          - Luma/brightness: if upstream provides brightness, use it; else compute simple luma `b = (0.2126*r + 0.7152*g + 0.0722*b)/255`.
          - `ch = #glyphFor(b)`; if null continue.
          - `fill = options.asciiColored ? getColor(b) : getColor(1)`
          - `ctx.fillStyle = fill` only when changed (track lastFill).
          - `ctx.fillText(ch, gx*cellW + xOffset, gy*cellH)`
      - `drawPixel(x, y, brightness, color, alpha)`:
        - If `_dirty` return (or recompute with last known grid).
        - Compute `gx = Math.floor(x / this._cellW)`, `gy = Math.floor(y / this._cellH)`
        - Deduplicate per-frame optionally via `this._drawnCells` set that is cleared at `beginFrame`.
        - `ch = #glyphFor(brightness)`; if null return.
        - `ctx.save(); if (alpha != null) ctx.globalAlpha = alpha; ctx.fillStyle = this.options.asciiColored ? color : this._lastBrightest || color; ctx.fillText(ch, gx*this._cellW + this._xOffset, gy*this._cellH); ctx.restore();`

- src/engine/renderers/index.js
  - Import and register:
    - `import AsciiRenderer from './AsciiRenderer.js'`
    - Add to `RENDERERS`: `{ ascii: AsciiRenderer, ...existing }`
    - Add to `RENDERER_LABELS`: `{ ascii: 'ASCII', ... }`

- src/app/store/useProjectStore.js
  - DEFAULT_STATE additions:
    - `charRamp: 'classic',`
    - `asciiColored: false,`
  - Setters:
    - `setCharRamp: (charRamp) => set({ charRamp }, false, 'setCharRamp'),`
    - `setAsciiColored: (asciiColored) => set({ asciiColored }, false, 'setAsciiColored'),`
  - Undo partialize (if using `partialize` filter):
    - Include `charRamp` and `asciiColored` so they are undoable.

- src/app/components/PreviewCanvas/PreviewCanvas.jsx
  - In the subscription slice that feeds `manager.updateEffectOptions(slice)` add:
    - `charRamp: state.charRamp,`
    - `asciiColored: state.asciiColored,`

- src/app/components/QualitySettings/QualitySettings.jsx
  - Conditionally render when `renderMode === 'ascii'`:
    - Char ramp select: options `classic`, `blocks`, `dense`, `minimal`; onChange → `setCharRamp`.
    - Colored toggle: `asciiColored`; onChange → `setAsciiColored`.

- src/app/utils/engineSources.js
  - Add dynamic import:
    - `AsciiRenderer: () => import('../engine/renderers/AsciiRenderer.js'),`
  - Add to exported `ENGINE_SOURCES` mapping so code-splitting includes it.

**Verification commands**

- Dev run and smoke checks
  - `npm run dev`
  - In the app: switch `renderMode` to ASCII, toggle Colored on/off, change ramp, confirm:
    - Transparent background respected when project background is Transparent.
    - Glyphs align to grid cells with various resolutions and DPR (resize window).
    - Undo/redo includes ramp and colored toggles.
- Lint/build
  - `npm run lint`
  - `npm run build`
- Quick rendering sanity (optional, in devtools)
  - Toggle `invert` and ensure space glyphs skip drawing (background shows through).
  - Enable an animation with fades and verify no cell flicker (snapped grid).

**Risks/edge cases and likely regressions**

- Performance on large grids: `fillText` per cell can be slow on low-end devices; the dense ramp exacerbates it. Mitigation: clamp maximum grid size for ASCII mode or warn in UI; ensure font/paint state set once per frame.
- DPI scaling/blur: If the base engine scales canvas for DPR, ensure ASCII uses the scaled internal size, not CSS size. Misuse can cause blurry text.
- Fade animation overlap: Multiple `drawPixel` calls targeting the same cell can overdraw and darken; mitigate with per-frame dedupe set.
- Color consistency: Using `getColor(1)` for monochrome assumes brightest palette entry reads well on the chosen background; may need a dedicated monochrome color option later.
- Space glyph metrics: Some fonts render leading/trailing spacing inconsistently; since we skip spaces, ensure the chosen ramp’s first char is a true space for “classic/minimal”.
- Undo noise: Rapid scrubbing of char ramp might spam history if not debounced; if that’s an issue today, batch updates or debounce UI handlers.

**One alternative approach (higher upside, higher risk)**

- GPU-accelerated glyph atlas renderer:
  - Pre-bake the ramp into a monochrome SDF atlas once per font size.
  - In WebGL/WebGPU, render instanced quads per cell with a shader sampling the atlas and tinting per-cell with `getColor(brightness)`.
  - Upside: 10–100× throughput on large grids, smooth scaling, crisp glyphs at any DPI, cheap per-cell alpha for fades.
  - Risk: Significant complexity (GL context management, atlas generation, shaders), larger bundle, duplicate code paths with existing canvas renderers.

**Confidence + unknowns**

- Confidence: Medium-high for renderer/API integration and option propagation.
- Unknowns:
  - Exact `BaseRenderer` helpers (e.g., where `ctx`/canvas are sourced, DPR handling).
  - Store’s current undo `partialize` implementation details.
  - Whether other renderers already special-case transparent backgrounds (assumed yes).

**Short rationale**

This design keeps ASCII rendering consistent with existing grid-based renderers, preserves composition by honoring transparency, aligns glyphs with explicit grid metrics, and minimizes per-frame overhead via caching. It integrates cleanly into the current options/update flow and leaves room for a future GPU path if needed.
```
