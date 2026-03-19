# PLAN — Export Quality & Format Rationalization

**Spec:** `SDD/export-quality/SPEC.md`
**Branch:** `fix/export-quality`
**Audited by:** Codex (gpt-5) via ia-bridge-mcp

---

## Codebase Hotspots

| File                                                  | Role                       | Changes                                                                |
| ----------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------- |
| `src/app/workers/apngWorker.js`                       | UPNG encoding worker       | Fix: safe buffer slicing + validation                                  |
| `src/app/utils/lottieExport.js`                       | Lottie builder             | Delete                                                                 |
| `src/app/utils/lottieExport.test.js`                  | Lottie unit tests          | Delete                                                                 |
| `src/app/utils/singleHtmlExport.js`                   | Single HTML builder        | Delete                                                                 |
| `src/app/utils/singleHtmlExport.test.js`              | Single HTML unit tests     | Delete                                                                 |
| `src/app/hooks/useExport.js`                          | All export orchestration   | Remove `exportLottie`, `exportSingleHtml`                              |
| `src/app/hooks/useExport.test.js`                     | useExport unit tests       | Remove `vi.mock` for lottie + singleHtml                               |
| `src/app/components/ExportPanel/ExportPanel.jsx`      | Export UI                  | Remove Lottie + HTML entries, update descriptions, fix Video label     |
| `src/app/components/ExportPanel/ExportPanel.test.jsx` | ExportPanel unit test      | Remove Lottie + HTML assertions                                        |
| `src/app/utils/reactComponentExport.js`               | React component builder    | Add `renderMode` to effectOptions; guarded `setRenderMode` in template |
| `src/app/utils/reactComponentExport.test.js`          | React component unit tests | Add renderMode assertion                                               |
| `src/app/utils/webComponentExport.js`                 | Web component builder      | Same as reactComponentExport.js                                        |
| `src/app/utils/webComponentExport.test.js`            | Web component unit tests   | Add renderMode assertion                                               |
| `test/integration/exportConformance.test.js`          | Integration conformance    | Remove Lottie + Single HTML; fix worker mock; add renderMode assertion |

---

## Existing Patterns

- Export builders are pure functions imported lazily in `useExport.js` (dynamic `import()`)
- `FORMAT_OPTIONS` array in `ExportPanel.jsx` drives both the grid buttons and the `onExport` dispatch map — removing a format means removing from both
- Tests for deleted files must also be deleted, not just skipped — the conformance test imports them statically at the top level
- The APNG worker mock in both `apngExport.test.js` and `exportConformance.test.js` simulates the worker synchronously via `queueMicrotask` — the buffer fix must be mirrored in the mock

---

## Findings: Non-Obvious Issues

### 1. APNG root cause (REQ-001)

`apngWorker.js:6` — `UPNG.encode(frames, ...)` receives `Uint8Array[]`. UPNG's `encode()` expects `ArrayBuffer[]`.

**Audit upgrade (Codex):** `f.buffer` alone is unsafe if the `Uint8Array` is a subarray view (`byteOffset !== 0` or `byteLength !== f.buffer.byteLength`). UPNG would receive an oversized backing buffer and produce white/garbage frames. Use safe slicing:

```js
const bufs = frames.map((f) =>
  f.byteOffset === 0 && f.byteLength === f.buffer.byteLength
    ? f.buffer
    : f.buffer.slice(f.byteOffset, f.byteOffset + f.byteLength)
)
```

Also add a pre-encode guard: `if (delays.length !== frames.length) throw new Error(...)`.

The transfer list sent back from the worker already covers the result buffer — that part is correct.

### 2. Worker mock must also be fixed (REQ-001)

Both `apngExport.test.js:21` and `exportConformance.test.js:91` call `UPNG.encode(data.frames, ...)` in the mock. jsdom doesn't enforce transfer semantics so tests pass today, but the mock should match production behavior. Apply the same safe-slice logic.

### 3. React & Web Component missing `renderMode` (REQ-006, REQ-007)

`createComponentConfig` does not include `renderMode`. The generated component never calls `setRenderMode()`. A user on halftone/LED/stipple/ascii mode exports a component that silently renders in default bitmap mode.

Fix:

1. Add `renderMode: state.renderMode ?? 'bitmap'` to `effectOptions` in `createComponentConfig` (both files)
2. In the generated component template, after `new SceneManager(...)`:
   ```js
   if (typeof manager.setRenderMode === 'function') manager.setRenderMode(config.effectOptions.renderMode)
   ```
   The `typeof` guard is important — confirmed `setRenderMode` exists in `SceneManager.js:231`, but the guard protects against future refactors.

### 4. `useExport.test.js` has dangling mocks (found by audit)

`useExport.test.js:29` mocks `singleHtmlExport.js` and `:49` mocks `lottieExport.js`. These `vi.mock()` calls will error when the source files are deleted. **This file was missing from the original manifest.**

### 5. `reactComponentExport.test.js` and `webComponentExport.test.js` need updating

Both test the config shape — they should assert `renderMode` is present after the fix.

### 6. Conformance test: section 10 references both APNG and Single HTML

`exportConformance.test.js` section 10 ("APNG + Single HTML — render-mode agnostic sweep") contains `buildSingleHtml` calls. This whole section must be renamed and the Single HTML `it()` removed. The APNG sweep can remain.

### 7. Video format label mismatch

`ExportPanel.jsx:12` — description says "WebM — best quality" but `exportVideo` now exports MP4 via WebCodecs with WebM fallback. Description should reflect this.

---

## File Change Manifest

| File                                                  | Action                                                                                                                 | REQ                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `src/app/workers/apngWorker.js`                       | Modify: safe buffer slicing + delays/frames guard                                                                      | REQ-001                                     |
| `src/app/utils/apngExport.test.js`                    | Modify: apply same safe-slice in worker mock                                                                           | REQ-001                                     |
| `src/app/utils/lottieExport.js`                       | **Delete**                                                                                                             | REQ-002                                     |
| `src/app/utils/lottieExport.test.js`                  | **Delete**                                                                                                             | REQ-002                                     |
| `src/app/utils/singleHtmlExport.js`                   | **Delete**                                                                                                             | REQ-003                                     |
| `src/app/utils/singleHtmlExport.test.js`              | **Delete**                                                                                                             | REQ-003                                     |
| `src/app/hooks/useExport.js`                          | Modify: remove `exportLottie`, `exportSingleHtml`                                                                      | REQ-002, REQ-003                            |
| `src/app/hooks/useExport.test.js`                     | Modify: remove `vi.mock` for lottie + singleHtml                                                                       | REQ-002, REQ-003                            |
| `src/app/components/ExportPanel/ExportPanel.jsx`      | Modify: remove Lottie + HTML, update descriptions + Video label                                                        | REQ-002, REQ-003, REQ-008                   |
| `src/app/components/ExportPanel/ExportPanel.test.jsx` | Modify: remove Lottie + HTML assertions                                                                                | REQ-002, REQ-003                            |
| `src/app/utils/reactComponentExport.js`               | Modify: add `renderMode` to effectOptions; guarded `setRenderMode` in template                                         | REQ-006                                     |
| `src/app/utils/reactComponentExport.test.js`          | Modify: assert config contains `renderMode`                                                                            | REQ-006                                     |
| `src/app/utils/webComponentExport.js`                 | Modify: same as reactComponentExport.js                                                                                | REQ-007                                     |
| `src/app/utils/webComponentExport.test.js`            | Modify: assert config contains `renderMode`                                                                            | REQ-007                                     |
| `test/integration/exportConformance.test.js`          | Modify: remove Lottie + Single HTML (sections + imports); fix worker mock; update section 10; add renderMode assertion | REQ-001, REQ-002, REQ-003, REQ-006, REQ-007 |

---

## Task Breakdown

### TASK-001 — Fix APNG worker

- `apngWorker.js`: replace `UPNG.encode(frames, ...)` with safe-slice approach + delays/frames length guard
- `apngExport.test.js`: mirror the safe-slice logic in worker mock
- `exportConformance.test.js`: same fix in its worker mock
- All existing APNG tests must still pass

### TASK-002 — Remove Lottie

- Delete `lottieExport.js` + `lottieExport.test.js`
- Remove `exportLottie` from `useExport.js` (function + return value)
- Remove `vi.mock('../utils/lottieExport.js', ...)` from `useExport.test.js`
- Remove Lottie from `FORMAT_OPTIONS`, `onExport` map, and `useExport` destructure in `ExportPanel.jsx`
- Remove Lottie conformance section + static import from `exportConformance.test.js`

### TASK-003 — Remove Single HTML

- Delete `singleHtmlExport.js` + `singleHtmlExport.test.js`
- Remove `exportSingleHtml` from `useExport.js`
- Remove `vi.mock('../utils/singleHtmlExport.js', ...)` from `useExport.test.js`
- Remove `html` from `FORMAT_OPTIONS`, `onExport` map, and `useExport` destructure in `ExportPanel.jsx`
- Remove Single HTML conformance section + static import from `exportConformance.test.js`
- Rename section 10 to "APNG render-mode sweep" and remove the `buildSingleHtml` `it()` inside it

### TASK-004 — Fix React + Web Component renderMode

- `reactComponentExport.js`: add `renderMode: state.renderMode ?? 'bitmap'` to `effectOptions` in `createComponentConfig`
- `reactComponentExport.js`: add guarded `setRenderMode` call in `generateIndexJsx` template after SceneManager construction
- `webComponentExport.js`: same two changes in `createComponentConfig` and `generateWebComponentJs`
- `reactComponentExport.test.js`: add assertion that config contains `renderMode`
- `webComponentExport.test.js`: same
- `exportConformance.test.js`: add assertion that React + Web Component config contains `renderMode`

### TASK-005 — Update ExportPanel UI (deps: TASK-002, TASK-003)

- Update `FORMAT_OPTIONS` to 9 kept formats with descriptions from REQ-008
- Fix Video entry: label `'Video'`, description `'MP4 (WebM fallback). Best quality for presentations.'`
- Ensure `ExportPanel.test.jsx` has no references to deleted formats

### TASK-006 — Run full test suite (deps: all above)

- `npm test` — all tests must pass
- Verify with `grep -rn "lottie\|singleHtml" src test` — zero results except in git history

---

## Rollback

All changes are isolated to the feature branch. Rollback = revert branch. No migrations, no API changes, no shared infrastructure.

---

## Risks

| Risk                                                                                   | Mitigation                                                     |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| APNG subarray view causes UPNG to encode wrong data                                    | Safe-slice approach handles both full-buffer and subview cases |
| `setRenderMode` removed in future refactor crashes exported components                 | `typeof manager.setRenderMode === 'function'` guard            |
| `useExport.test.js` vi.mock left in place after deleting source files                  | Added to manifest; TASK-002/003 cover it explicitly            |
| Conformance test section 10 still references deleted `buildSingleHtml`                 | Explicitly handled in TASK-003                                 |
| `reactComponentExport.test.js` / `webComponentExport.test.js` not in original manifest | Added; TASK-004 covers them                                    |
