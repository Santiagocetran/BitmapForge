# BitmapForge Export Testing: Full Implementation Plan

## Objective

Build a robust, low-flake test strategy that validates all export features in an implementative way:

- verifies each export path is triggerable from the UI,
- verifies artifacts are structurally correct and usable,
- verifies key animation/output invariants,
- avoids brittle pixel-perfect checks as the default CI gate.

This plan is tailored to the current codebase as of commit `9dd9953` and current tooling (`Vitest`, `jsdom`, Vite app, no Playwright yet).

---

## Current State Snapshot

- Export UI entrypoint: `src/app/components/ExportPanel/ExportPanel.jsx`
- Export orchestration hook: `src/app/hooks/useExport.js`
- Export builders:
  - `src/app/utils/codeExport.js`
  - `src/app/utils/reactComponentExport.js`
  - `src/app/utils/webComponentExport.js`
  - `src/app/utils/cssExport.js`
  - `src/app/utils/lottieExport.js`
  - `src/app/utils/apngExport.js`
  - `src/app/utils/singleHtmlExport.js`
- Frame capture core:
  - `src/app/utils/framesProvider.js`
  - deterministic stepping via `SceneManager.renderAtTime(...)`
- Existing tests: 133 passing (`npm test`)
- Existing gaps:
  - no browser E2E export trigger/download validation,
  - no cross-format conformance checks,
  - limited coverage for some artifact-level assertions (GIF/APNG/video/html/spritesheet behavior).

---

## Guiding Principles

1. Keep most signal in deterministic tests (unit/integration), not heavy E2E.
2. Use E2E for wiring and smoke validation, not exhaustive pixel fidelity.
3. Validate cross-format invariants once and reuse.
4. Gate expensive/perceptual checks behind optional flags.
5. Minimize production-code changes; if test hooks are needed, isolate and gate clearly.

---

## Test Pyramid Design

## Layer 1: Unit/Contract (fast, default PR gate)

Validate builder outputs and contracts with mocked frame sources and deterministic fixtures.

- Target runtime: < 10s
- Failure mode focus:
  - wrong files in zip/json/html,
  - broken generated source text,
  - wrong frame timing metadata,
  - schema/shape regressions.

## Layer 2: Integration Artifact Validation (medium, default PR gate)

Decode/inspect generated artifacts in Node/jsdom where feasible; assert format-specific metadata and invariants.

- Target runtime: 10-30s
- Failure mode focus:
  - invalid encodings/headers,
  - loop/delay mismatches,
  - missing assets/manifest details.

## Layer 3: Browser E2E Export Smoke (heavier, default on main + optional on PR)

Use Playwright to drive the actual app:

- upload real fixture model,
- trigger each export format through `ExportPanel`,
- assert download occurs and artifact passes minimal sanity checks.

No full frame-decode-per-export in this layer.

---

## Rollout Plan

## Phase 0: Foundations (1 PR)

### Tasks

1. Add `@testing-library/react` as a dev dependency (required for `useExport.test.js` and `ExportPanel.test.jsx`).
2. Add test scripts in `package.json`:
   - `test:unit` → `vitest run src` (runs `src/**/*.test.{js,jsx}`)
   - `test:integration` → `vitest run test/integration`
   - `test:exports` → `vitest run src test/integration` (aggregate)
3. Update `vite.config.js` `include` pattern to cover both `src/**` and `test/integration/**`.
4. Promote `HTMLCanvasElement.prototype.toDataURL` stub to `test/setup.js` (required by `singleHtmlExport.test.js` and other canvas tests).
5. Add fixtures:
   - `test/fixtures/models/tiny.stl` (minimal ASCII STL, single triangle)
   - `test/fixtures/models/rueda-tanque.stl` (real model for E2E / integration smoke)
   - `test/fixtures/states/exportState.json` (canonical state)
6. Add utility helpers:
   - `test/helpers/pngChunks.js` ← **moved from Phase 2** (needed by Phase 1 APNG tests)
   - `test/helpers/blob.js`
   - `test/helpers/zip.js`
   - `test/helpers/assertions.js`

### Files to add

- `test/fixtures/models/tiny.stl`
- `test/fixtures/models/rueda-tanque.stl`
- `test/fixtures/states/exportState.json`
- `test/helpers/pngChunks.js`
- `test/helpers/blob.js`
- `test/helpers/zip.js`
- `test/helpers/assertions.js`

---

## Phase 1: Unit + Contract Expansion (1-2 PRs)

### Scope

Add missing exporter tests. The "strengthen existing" items listed in the original plan are **already complete** as of the current branch:

| Previously listed item                                                | Status  |
| --------------------------------------------------------------------- | ------- |
| `cssExport.test.js` — `background-size` and keyframe stops            | ✅ Done |
| `webComponentExport.test.js` — `customElements.get()` guard           | ✅ Done |
| `webComponentExport.test.js` — `disconnectedCallback`/`destroy` order | ✅ Done |
| `lottieExport.test.js` — max dimensions, `fr`/`op`/assets/layers      | ✅ Done |
| `reactComponentExport.test.js` — relative imports, README path        | ✅ Done |

Only the **new** test files remain:

### New tests

1. `singleHtmlExport.test.js`
   - valid HTML blob with DOCTYPE
   - contains embedded frame payload (base64 data URIs)
   - has deterministic width/height/fps injection
   - contains no external network URLs
   - uses `requestAnimationFrame` for loop
2. `apngExport.test.js`
   - throws on empty frames
   - valid PNG signature (uses `test/helpers/pngChunks.js` from Phase 0)
   - animation chunks present (`acTL`, `fcTL`)
3. `framesProvider.test.js`
   - `getFrameCount` formula correctness (`Math.max(12, round(loopMs/1000 * fps))`)
   - `captureFrames` calls `pauseLoop`/`resumeLoop`
   - `resumeLoop` called in `finally` even when `renderAtTime` throws
   - abort behavior returns `AbortError`
   - progress callback contract
4. `useExport.test.js` (requires `@testing-library/react`)
   - Mock strategy for `gif.js`: `vi.mock('gif.js', ...)` providing a fake `GIF` class;
     mock `'gif.js/dist/gif.worker.js?url'` as `{ default: 'blob:mock-worker' }`.
   - Each export method updates status start/success/error (tested for representative formats)
   - `cancelExport` aborts and sets `message: 'Export cancelled.'`
   - Video (`exportVideo`) relies on `MediaRecorder` which is not available in jsdom;
     test only the status/error path using a mock SceneManager with no canvas.
5. `ExportPanel.test.jsx` (requires `@testing-library/react`)
   - All 10 `FORMAT_OPTIONS` buttons are rendered
   - Clicking a format button selects it (active state)
   - `onExport` map routes each of the 10 format keys to the correct `useExport` function
6. `codeExport.test.js` expansion — `buildCodeZip`:
   - ZIP contains `BitmapForge-export/index.html`, `animation.js`, `config.js`, `package.json`, `README.md`
   - ZIP contains 14 engine source files
   - `animation.js` uses `fetch(...)` and `new File(...)` model flow
   - With model: ZIP contains `BitmapForge-export/models/<name>`

### Files to add

- `src/app/utils/singleHtmlExport.test.js`
- `src/app/utils/apngExport.test.js`
- `src/app/utils/framesProvider.test.js`
- `src/app/hooks/useExport.test.js`
- `src/app/components/ExportPanel/ExportPanel.test.jsx`

---

## Phase 2: Integration Conformance Suite (1 PR)

### Scope

Create a shared conformance spec to validate all export outputs against common invariants.

### Invariants (cross-format)

- frame count expectation exists and is non-zero (where animated frame outputs are used),
- dimensions are coherent with source canvas and documented caps (Lottie <= `LOTTIE_MAX_PX`),
- loop behavior present for looped formats,
- delay/timing is coherent with `fps` and loop duration,
- no missing critical files in packaged exports.

### Per-format integration assertions

1. React ZIP
   - unzip contains `index.jsx`, `config.js`, `README.md`, `engine/*`
   - optional smoke parse with esbuild transform (no install step)
2. Web Component ZIP
   - unzip contains `<element>.js`, `config.js`, `README.md`, `engine/*`
   - parse source string for registration guard
3. CSS ZIP
   - contains `.css`, sprite `.png`, `README.md`
   - parse CSS for keyframe count and `steps(1, end)`
4. Lottie JSON
   - parse JSON, validate `fr`, `op`, `assets`, `layers`, cap dimensions
5. Code ZIP
   - contains app scaffold files and engine sources
   - `animation.js` uses `fetch(...)->blob->File`
6. Single HTML
   - parse blob text and validate self-contained script/data
7. APNG
   - verify PNG signature and APNG chunks (uses `test/helpers/pngChunks.js`)

### Video format coverage

`exportVideo` depends on `MediaRecorder` + `canvas.captureStream()` which are not available in
jsdom. It is covered by:

- Unit: status/error flow tested in `useExport.test.js` via mock SceneManager with null canvas
- E2E (Phase 3): full smoke test in browser

This satisfies the acceptance criterion — at least one assertion per format, with E2E providing
the artifact-level check for video.

### Files to add

- `test/integration/exportConformance.test.js`

Note: `test/helpers/pngChunks.js` is already created in Phase 0. Additional parsers for CSS
and Lottie validation live inline in the conformance test (they're single-purpose, not reused).

---

## Phase 3: Browser E2E Export Smoke with Playwright (1-2 PRs)

### Scope

Install Playwright and add smoke tests for UI-driven exports.

### Setup

1. Add dev dependency: `@playwright/test`
2. Add config:
   - fixed viewport
   - deterministic timezone/locale
   - download directory per test
3. Add app server integration:
   - start via `vite` for tests

### E2E test cases

1. Load app and upload `test/fixtures/models/rueda-tanque.stl`.
2. For each format in `FORMAT_OPTIONS`:
   - select format button
   - click export
   - assert download event and non-empty file
3. Minimal artifact sanity:
   - ZIP: can open with JSZip and contains expected key file(s)
   - JSON: parse succeeds
   - PNG/GIF/WebM/HTML: file signature or basic openability checks

### Files to add

- `playwright.config.js`
- `test/e2e/exportDownloads.spec.js`
- `test/e2e/helpers/downloads.js`

---

## Phase 4: Optional Fidelity Track (non-blocking by default)

### Scope

Add perceptual validation for selected formats only, gated by env var.

### Gate

- `EXPORT_FIDELITY=1 npm run test:e2e`

### Strategy

- sample sparse timestamps (first/mid/last) only,
- use SSIM/perceptual hash thresholds, not exact pixel equality,
- run only in dedicated CI job/nightly.

### Candidate targets

- Lottie rendered via `lottie-web` test page
- CSS sprite playback frame samples
- WebM frame sample decode via browser video element

---

## CI Strategy

## PR pipeline (required)

1. `npm run test:unit`
2. `npm run test:integration`

## Main branch / scheduled pipeline

1. `npm run test:e2e`
2. optional `EXPORT_FIDELITY=1 npm run test:e2e` (nightly)

## Flake controls

- fixed browser channel/version in CI,
- fixed viewport + DPR,
- retries only for E2E smoke (max 1 retry),
- artifact upload for failed downloads and logs.

---

## Implementation Backlog Checklist

## Foundation

- [x] Add `@testing-library/react` dev dependency
- [x] Add fixtures (`tiny.stl`, `rueda-tanque.stl`, canonical state)
- [x] Add test helper utilities (pngChunks, blob, zip, assertions)
- [x] Add scripts in `package.json` (`test:unit`, `test:integration`, `test:exports`)
- [x] Update `vite.config.js` include pattern for integration tests
- [x] Promote `toDataURL` stub to `test/setup.js`

## Unit/Contract

- [x] Add `singleHtmlExport.test.js`
- [x] Add `apngExport.test.js`
- [x] Add `framesProvider.test.js`
- [x] Add `useExport.test.js`
- [x] Add `ExportPanel.test.jsx`
- [x] Expand `codeExport.test.js` with `buildCodeZip` coverage
- [x] ~~Expand existing exporter tests~~ (already complete as of branch)

## Integration

- [x] Add `exportConformance.test.js`

## E2E

- [ ] Install/configure Playwright
- [ ] Add upload + per-format export smoke spec
- [ ] Add minimal artifact sanity checks in E2E

## Optional Fidelity

- [ ] Add env-gated perceptual checks
- [ ] Add nightly job

---

## Acceptance Criteria

1. Every export format exposed in `ExportPanel` is covered by at least:
   - one contract/integration assertion,
   - one UI-triggered E2E smoke assertion (Phase 3).
2. CI required checks remain stable (flake rate near zero for required suites).
3. Export regressions in structure/timing/critical metadata fail with actionable messages.
4. Optional fidelity suite can be enabled without affecting default PR velocity.

---

## Commands (target end-state)

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:exports
EXPORT_FIDELITY=1 npm run test:e2e
```

---

## Notes on Risk Management

- Avoid introducing production debug hooks unless strictly necessary.
- Prefer pure builder-level deterministic tests over browser decode for baseline confidence.
- Keep compile/build smoke checks lightweight (`esbuild` transform/parsing where possible) to avoid network-dependent installs in test runs.
- Treat codec-specific behavioral checks (especially WebM) as smoke-level unless run in controlled environments.
- `gif.js` and its `?url` worker import must be mocked via `vi.mock` in `useExport.test.js` — they are not jsdom-compatible at runtime.
- `MediaRecorder` / `canvas.captureStream()` are not available in jsdom; video export is covered by status-flow unit tests + E2E artifact check only.
