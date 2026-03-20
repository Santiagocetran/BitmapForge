# SPEC — Export Quality & Format Rationalization

**Feature slug:** `export-quality`
**Branch:** `fix/export-quality`
**Status:** Draft

---

## Problem Statement

BitmapForge's export system has a broken APNG export (produces all-white images), two low-value formats that should be removed (Lottie, Single HTML), and several untested formats that need verification. The goal is: every export that ships must produce an output that (a) pixel-exactly matches the live preview, (b) supports transparency where the format allows it, and (c) is light enough to be practical for web use.

---

## Scope

### In scope

- Fix APNG white-image bug
- Remove Lottie export (format + UI + tests)
- Remove Single HTML export (format + UI + tests)
- Verify and fix all remaining exports for pixel-exact output and alpha transparency correctness
- Ensure the ExportPanel UI only shows kept formats, with clear labels describing what each format is for

### Out of scope

- Resolution scaling UI (future feature, not blocking)
- New export formats
- Changes to the rendering engine

---

## Functional Requirements

### REQ-001 — APNG export produces correct animated PNG

The APNG export must produce a valid animated PNG file that:

- Matches the live preview pixel-exactly (same colors, same dithering, same animation)
- Preserves alpha channel when the project uses a transparent background
- Loops continuously
- Uses lossless encoding (no color degradation)

**Root cause of current bug:** `apngWorker.js` calls `UPNG.encode(frames, ...)` where `frames` is `Uint8Array[]`. UPNG expects `ArrayBuffer[]`. Each frame should be passed as `frame.buffer`.

**Acceptance criteria:**

- Given a project with a colored model and transparent background, when the user exports APNG, then the downloaded file opens in a browser as a correctly animated transparent PNG
- Given the worker receives `Uint8Array[]` frames, when it calls `UPNG.encode`, then it passes `frames.map(f => f.buffer)` not `frames`
- Given any valid project, when APNG export completes, then the blob has `type: 'image/png'`, contains `acTL` and `fcTL` PNG chunks, and is non-empty

---

### REQ-002 — Lottie export removed

The Lottie export format is removed from the application.

**Rationale:** Lottie is a vector format; raster-embedded Lottie (what we produce) caps at 256px, produces large files, does not animate correctly in major Lottie players, and is not a useful format for the target user (web developers adding animations to websites).

**Acceptance criteria:**

- Given the ExportPanel UI, when rendered, then no Lottie export button is present
- Given `useExport.js`, when the file is read, then `exportLottie` function does not exist
- Given the file system, when searched, then `lottieExport.js` and `lottieExport.test.js` do not exist

---

### REQ-003 — Single HTML export removed

The Single HTML export format is removed from the application.

**Rationale:** Single HTML embeds all animation frames as base64 PNGs in a single HTML file. This produces large files (often megabytes), cannot be embedded in an existing website (only works standalone or via iframe), and is strictly worse than APNG for sharing and worse than Embed ZIP for website use.

**Acceptance criteria:**

- Given the ExportPanel UI, when rendered, then no Single HTML export button is present
- Given `useExport.js`, when the file is read, then `exportSingleHtml` function does not exist
- Given the file system, when searched, then `singleHtmlExport.js` and `singleHtmlExport.test.js` do not exist

---

### REQ-004 — CSS Animation export verified: alpha and pixel accuracy

The CSS Animation ZIP export must produce output that pixel-exactly matches the preview and correctly preserves transparency.

**Acceptance criteria:**

- Given a project with transparent background, when CSS export runs, then the sprite sheet PNG contains pixels with `alpha < 255` where the model is absent
- Given any project, when CSS export runs, then the ZIP contains `{name}.css`, `{name}-sprite.png`, and `README.md`
- Given the CSS file, when read, then it uses `steps(1, end)` timing and references the correct sprite sheet filename

---

### REQ-005 — Sprite Sheet export verified: alpha and pixel accuracy

The Sprite Sheet PNG export must produce output that pixel-exactly matches the preview and preserves transparency.

**Acceptance criteria:**

- Given a project with transparent background, when sprite sheet exports, then the PNG contains transparent pixels where the background is
- Given any project, when sprite sheet exports, then the PNG dimensions are `(columns × frameW) × (rows × frameH)`
- Given any project, when sprite sheet exports, then each cell matches the corresponding frame from `captureFrames`

---

### REQ-006 — React Component export verified: correct config and alpha

The React Component ZIP export must include the full engine, a correctly generated config, and a component that will match the live preview when used in a React project.

**Acceptance criteria:**

- Given any project with a model, when React Component exports, then the ZIP contains `index.jsx`, `config.js`, `engine/` directory tree, and `README.md`
- Given the config.js, when read, then it contains the project's `colors`, `pixelSize`, `ditherType`, `backgroundColor`, `animationEffects`, and `animationSpeed`
- Given a transparent-background project, when the config is read, then `backgroundColor` is `'transparent'` or `null`, not a default opaque color

---

### REQ-007 — Web Component export verified: correct config and alpha

The Web Component ZIP export must include the full engine, a correctly generated config, and a custom element that works in plain HTML and Vite/webpack projects.

**Acceptance criteria:**

- Given any project, when Web Component exports, then the ZIP contains `{name}.js`, `config.js`, `engine/` directory tree, and `README.md`
- Given the config.js, when read, then it matches the project state (same fields as REQ-006)
- Given the generated JS file, when read, then it registers a custom element via `customElements.define`

---

### REQ-008 — ExportPanel shows only kept formats with clear descriptions

The export UI must only expose the formats that are being kept, and each format must have a short plain-English description of what it's for, so users know which to choose.

**Formats to show:**

1. **APNG** — "Animated PNG. Full color, transparent background supported. Best for embedding in websites or sharing."
2. **GIF** — "Classic animated GIF. Universal compatibility. 256-color limit, no partial transparency."
3. **Video (MP4)** — "MP4 video. Best quality for presentations or social media."
4. **Sprite Sheet** — "PNG grid of all frames. For game engines (Phaser, Unity) or custom code."
5. **CSS Animation** — "Pure CSS + sprite sheet. Drop it into any website — no JavaScript needed."
6. **React Component** — "React component with the live animation engine. Drop into any React/Vite project."
7. **Web Component** — "`<bitmap-animation>` custom element. Works in any framework or plain HTML."
8. **Embed ZIP** — "Static site ready to deploy. Upload to any web host."
9. **Code ZIP** — "Full engine source code. For developers who want to build their own integration."

**Acceptance criteria:**

- Given the ExportPanel, when rendered with no model loaded, then all format buttons are visible (greyed if disabled)
- Given the ExportPanel, when rendered, then each format has a one-line description of what it's for
- Given the ExportPanel, when rendered, then Lottie and Single HTML buttons do not appear

---

## Non-Functional Requirements

- All frame-based exports (APNG, GIF, Sprite Sheet, CSS Animation) use the shared `captureFrames()` + `getFrameCount()` pipeline — no raw canvas reads in export utilities
- Exports must not produce files where colors are degraded vs the preview except where inherent to the format (GIF 256-color limit is acceptable and should be documented in the UI)
- Alpha transparency must be preserved in all formats that support it: APNG, Sprite Sheet, CSS Animation, React Component, Web Component

---

## Files Affected

| File                                         | Action                                                   |
| -------------------------------------------- | -------------------------------------------------------- |
| `src/app/workers/apngWorker.js`              | Fix: pass `frame.buffer` to UPNG                         |
| `src/app/utils/lottieExport.js`              | Delete                                                   |
| `src/app/utils/lottieExport.test.js`         | Delete                                                   |
| `src/app/utils/singleHtmlExport.js`          | Delete                                                   |
| `src/app/utils/singleHtmlExport.test.js`     | Delete                                                   |
| `src/app/hooks/useExport.js`                 | Remove `exportLottie`, `exportSingleHtml`                |
| `src/app/utils/apngExport.test.js`           | Verify worker buffer passing                             |
| `src/app/components/ExportPanel/`            | Update UI: remove Lottie + Single HTML, add descriptions |
| `test/integration/exportConformance.test.js` | Remove Lottie + Single HTML conformance tests            |
