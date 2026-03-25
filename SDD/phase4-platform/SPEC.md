---
Feature: Phase 4 Platform — Embed SDK CDN + CLI/Headless Rendering
Author: Claude
Date: 2026-03-20
---

# Spec: Phase 4 Platform — Embed SDK CDN + CLI Headless Rendering

## Goals

Close out the two remaining Phase 4 infrastructure items:

1. **#33 Embed SDK CDN distribution** — Make the existing `@bitmapforge/embed` web component
   consumable from a CDN with a single `<script>` tag. The web component code itself is
   complete; the gap is the IIFE build is broken at 3 MB (fonts inline), and there is no
   published package or documented CDN usage story.

2. **#32 CLI/headless rendering** — Allow users to render `.bforge` project files to image
   files (APNG, GIF, WebM) from the command line or a CI pipeline, with output
   pixel-perfect-identical to the browser UI.

## Non-Goals

- Interactivity/mouse reactivity for the embed element (deferred)
- Publishing to npm registry (out of scope — only build + local install story)
- New rendering modes, new exporters, or new post-processing effects
- Community gallery (#34) — depends on CLI but is its own issue
- TypeScript migration (#37) — indefinitely deferred
- OffscreenCanvas perf (#17) — still deferred

## Actors

| Actor                         | Role                                       | Permissions                                                  |
| ----------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Web developer                 | Embeds a `.bforge` animation in their site | Loads embed script from CDN, places `<bitmap-forge>` element |
| CI pipeline / automation user | Renders `.bforge` files to images          | Calls `npx @bitmapforge/cli render`                          |
| BitmapForge editor user       | Exports a `.bforge` project file           | Existing behavior, no changes                                |

## Boundaries & Interfaces

- **Entry point (embed):** `packages/embed/` — existing package, build-only changes
- **Entry point (CLI):** `packages/cli/` — new package, new npm workspace member
- **External dependencies (CLI):** Puppeteer (headless Chromium), Node.js ≥ 20
- **External dependencies (embed CDN):** Three.js (peer dep, loaded separately by user)
- **Data stores:** None — all processing is file-based
- **APIs touched:** Reuses existing `useExport.js` export logic via Puppeteer page evaluation

## Assumptions

- **Idempotency:** CLI `render` command is idempotent — same input + same seed = same output.
  Running twice overwrites the output file.
- **Authorization:** N/A — both are local tools, no auth layer.
- **Error states:**
  - Embed: HTTP fetch failure → logs error to console, renders nothing (silent degradation)
  - CLI: file not found / unsupported format → exits with non-zero code + error message
  - CLI: Puppeteer launch failure → exits with helpful message (Chromium missing, etc.)
- **Back-compat:** No changes to existing `src/` app or `src/engine/`. Embed web component
  behavior is unchanged — only the build output changes (drop IIFE, keep ES module).
- **Observability:** CLI prints progress to stderr, final output path to stdout.

## Requirements

### Functional

#### Embed SDK CDN (#33)

- **REQ-001:** Drop the IIFE build format. The existing IIFE bundles all font JSON files
  inline (no code-splitting in IIFE), producing a 3 MB file. The ES module build (42 KB
  gzipped, Three.js as peer dep) is the correct CDN artifact.

- **REQ-002:** The CDN usage story must work with a `<script type="module">` tag and an
  importmap that maps `"three"` to a CDN URL. Document this pattern in a README.

- **REQ-003:** The `packages/embed/` package must expose a self-contained README with:
  - CDN usage snippet (importmap + script tag)
  - npm install usage snippet
  - All supported HTML attributes (`src`, `autoplay`, `loop`, `render-mode`)
  - Known limitation: image input type unsupported in embed mode

- **REQ-004:** The root CI workflow (`ci.yml`) must build `packages/embed/` and assert the
  ES bundle is under 50 KB gzipped.

#### CLI/Headless Rendering (#32)

- **REQ-005:** Create `packages/cli/` as a new npm workspace package with a `bin` entry.
  Invoking `node packages/cli/src/index.js render <file>` (and eventually
  `npx @bitmapforge/cli render <file>`) must work.

- **REQ-006:** The CLI must support a `render` command:

  ```
  bitmapforge render <project.bforge> [options]
    --format  apng|webm       (default: apng; gif not supported — gif.js worker URL not resolvable in headless context)
    --fps     number           (default: 12)
    --out     path             (default: <input-basename>.<format>)
    --width   number           (default: from project file)
    --height  number           (default: from project file)
  ```

- **REQ-007:** Rendering must produce pixel-perfect output identical to the browser export.
  Implementation uses Puppeteer to launch a minimal HTML page that loads the BitmapForge
  engine, then calls the existing export functions via `page.evaluate()`.

- **REQ-008:** The CLI exits with code 0 on success and non-zero on any error. Errors are
  printed to stderr with a human-readable message.

- **REQ-009:** The CLI must print progress to stderr during rendering (frame count / total)
  and the output file path to stdout on success.

- **REQ-010:** A `batch` command must render all `.bforge` files in a directory:
  ```
  bitmapforge batch <dir> --format apng --out <outdir>
  ```

### Non-Functional

- **REQ-NF-001:** Embed ES bundle must be ≤ 50 KB gzipped with Three.js as a peer dependency.
- **REQ-NF-002:** CLI `render` on a typical 24-frame APNG must complete in under 60 seconds
  on a modern laptop (Puppeteer startup dominates; per-frame rendering is fast).
- **REQ-NF-003:** CLI package must not depend on the React app layer (`src/app/`) — only on
  the engine (`src/engine/`) and Puppeteer.

## Edge Cases

- **EDGE-001:** `.bforge` file references an image input type → CLI prints a warning and
  renders an empty scene (same behavior as embed element).
- **EDGE-002:** `--out` directory does not exist → CLI creates it (mkdir -p).
- **EDGE-003:** Puppeteer cannot find Chromium → CLI prints a diagnostic message
  ("Run: npx puppeteer browsers install chrome") and exits non-zero.
- **EDGE-004:** `<bitmap-forge>` element has no `src` attribute → renders nothing, no error.
- **EDGE-005:** User's browser has `prefers-reduced-motion: reduce` → embed element loads
  but does not autoplay (existing behavior, no change).
- **EDGE-006:** CLI `render` called with an unsupported `--format` (including `gif`) → exits
  immediately with an error listing valid formats (apng, webm).

## Acceptance Criteria

```gherkin
# REQ-001 / REQ-NF-001
Given the embed package is built
When gzip -c dist/bitmap-forge.es.js | wc -c is run
Then the output is less than 51200 bytes (50 KB)
And there is no bitmap-forge.iife.js in dist/

# REQ-002
Given a minimal HTML page with an importmap pointing "three" to a CDN URL
When <bitmap-forge src="test.bforge"></bitmap-forge> is placed in the page
Then the element loads and renders the animation without errors

# REQ-003
Given the packages/embed/README.md file
When a developer reads it
Then it contains a CDN usage snippet, npm snippet, and attribute reference

# REQ-004
Given a push to main
When CI runs
Then the embed build step asserts bundle size <= 50 KB gzipped and fails if exceeded

# REQ-005 / REQ-006
Given a valid .bforge file
When node packages/cli/src/index.js render project.bforge --format apng --out out.apng
Then out.apng is created, is a valid APNG file, and the process exits with code 0

# REQ-007
Given the same .bforge file
When rendered via CLI and via the browser export button
Then the output images are visually identical (same dimensions, same palette)

# REQ-008
Given a non-existent .bforge file path
When bitmapforge render missing.bforge
Then the process exits with code 1 and prints an error to stderr

# REQ-009
Given a 24-frame export
When bitmapforge render project.bforge
Then stderr shows frame progress (e.g. "Rendering frame 1/24 ... 24/24")
And stdout prints the output file path on completion

# REQ-010
Given a directory containing 3 .bforge files
When bitmapforge batch ./projects --format apng --out ./out
Then ./out/ contains 3 .apng files, one per input file
```

## Success Metrics

- CI bundle-size gate passes on every push.
- `bitmapforge render` produces a valid APNG/GIF/WebM file in a clean test environment.
- No regressions in existing 419+ tests.

## Decision Log

- [2026-03-20] Drop IIFE format from embed build. Rationale: IIFE cannot code-split, causing
  all font JSON to inline (3 MB). ES module + importmap is the correct modern CDN pattern.
  IIFE format is removed, not replaced.

- [2026-03-20] CLI uses Puppeteer (not node-canvas + headless-gl). Rationale: guaranteed
  pixel parity with browser output; avoids maintaining a separate render path. Per
  IMPLEMENTATION_GUIDE.md recommendation.

## Open Questions

| #   | Question                                                                                    | Owner          | ETA   |
| --- | ------------------------------------------------------------------------------------------- | -------------- | ----- |
| 1   | Should the CLI ship Puppeteer as a bundled dep or require `npx puppeteer browsers install`? | Implementation | Day 1 |
