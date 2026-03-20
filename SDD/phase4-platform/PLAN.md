---
Feature: Phase 4 Platform — Embed SDK CDN + CLI/Headless Rendering
Spec: SDD/phase4-platform/SPEC.md
Author: Claude
Date: 2026-03-20
---

# Plan: Phase 4 Platform — Embed SDK CDN + CLI/Headless Rendering

## Architecture Overview

### #33 — Embed SDK CDN

The web component code is complete and correct. The only broken artifact is the IIFE build
(3 MB because IIFE can't code-split, so all lazy-loaded font JSON gets inlined). Fix:
remove `'iife'` from the Vite lib formats array. ESM-only CDN via importmap is the modern
standard and already works at 42 KB gzipped with Three.js as a peer dep.

CI gets a new step that pipes the ES bundle through gzip and asserts the byte count is
≤ 51200 (50 KB). This prevents future size regressions.

The README documents two usage patterns:

1. CDN (importmap + `<script type="module">`)
2. npm install + bundler import

### #32 — CLI/Headless Rendering

**Approach: Puppeteer + local HTTP server serving a CLI-specific headless bundle + a thin export harness.**

**SceneManager export gap (confirmed risk):** The embed SDK (`bitmap-forge.es.js`) only
exports `BitmapForgeElement` and `defineBitmapForgeElement` — `SceneManager` is bundled
internally but not exposed. Rather than polluting the embed package, `packages/cli/`
includes its own `vite.config.js` that builds a `headless.js` bundle from `src/engine/`
directly (same `@engine` alias as the embed build). This bundle exports `{ SceneManager,
parseProjectData }` and is served by the local HTTP server alongside Three.js.

**APNG worker gap (confirmed risk):** `src/app/utils/apngExport.js` spawns a Web Worker
via `new Worker(new URL('../workers/apngWorker.js', import.meta.url))`. The worker URL
resolves at runtime relative to `import.meta.url`, which breaks when the file is served
from a temp port in Puppeteer. Fix: harness.js inlines APNG encoding directly using
upng-js (no worker). The underlying upng-js call is identical to `apngWorker.js` — output
is byte-identical. Harness is headless so blocking the main thread is fine.

**GIF format not supported in CLI v1.** gif.js also uses a Web Worker with the same URL
resolution problem. Excluded from scope; APNG and WebM cover the primary use cases.

The CLI starts a minimal `http.createServer` on a random free port (`port: 0`), bound to
`127.0.0.1`, serving:

- `three.module.js` — from `node_modules/three/build/three.module.js`
- `headless.js` — built from `packages/cli/` Vite build (engine + parseProjectData)
- `upng.js` — from root `node_modules/upng-js/upng.js`
- `harness.html` + `harness.js` — bundled as static assets inside the CLI package

Puppeteer opens `http://localhost:PORT/harness.html`. The CLI transfers the .bforge JSON
to the page via `page.evaluate(fn, args)`. The harness:

1. Parses project data via `parseProjectData()` (from headless.js bundle)
2. Creates a `SceneManager` (from headless.js)
3. Loads the model/shape/text
4. Iterates frames using the same `renderAtTime()` loop as `framesProvider.js`
5. Encodes: APNG via inline upng-js; WebM via MediaRecorder
6. Returns `{ ok, base64, mimeType }` from `page.evaluate()`

The CLI receives the base64, decodes it, and writes the file to disk.

**Puppeteer CI hardening:** Launch options must include `args: ['--no-sandbox',
'--disable-setuid-sandbox']` in CI environments. The CLI detects `CI=true` env var and
applies these flags automatically.

**Determinism:** `renderAtTime()` is seeded via the project's `seed` field — already
deterministic. DPR is hardcoded to `1` in the harness for consistent pixel output across
machines. Text input rendering depends on Chromium's bundled fonts — this is a known
limitation, documented in the CLI README.

**Why not serve the full React app?** That requires building `dist/` first, adds React/Zustand
overhead, and complicates CLI distribution. The headless bundle is self-contained.

**Why not node-canvas + headless-gl?** Per the guide: Puppeteer gives guaranteed parity
with zero separate render path to maintain.

## Technical Decisions

| Decision                     | Choice                                     | Rationale                                                                                                                             |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| IIFE removal                 | Remove format, no replacement              | IIFE can't code-split; ESM + importmap is the modern CDN standard                                                                     |
| CLI render engine            | CLI-own headless bundle from `src/engine/` | Embed SDK doesn't export SceneManager; own bundle avoids polluting embed package                                                      |
| APNG encoding                | Inline upng-js in harness (no Worker)      | `apngExport.js` worker URL resolves via `import.meta.url` — breaks at runtime from temp port; harness is headless so blocking is fine |
| GIF support                  | Not in CLI v1                              | gif.js worker has same URL resolution problem as APNG worker; deferred                                                                |
| Project → Puppeteer transfer | `page.evaluate(fn, jsonString)`            | Reliable for large base64 model data; avoids temp file writes                                                                         |
| Result → CLI transfer        | `return base64` from `page.evaluate`       | Simple; Puppeteer serialises the return value                                                                                         |
| HTTP server                  | Node built-in `http` module                | Zero extra deps; only serves 5 static files                                                                                           |
| WebM encoding in harness     | MediaRecorder (Chromium built-in)          | No extra library needed                                                                                                               |
| Puppeteer launch flags       | Auto-apply `--no-sandbox` when `CI=true`   | Required for sandbox-less CI environments                                                                                             |
| Puppeteer install            | `puppeteer` dep (auto-downloads Chromium)  | Simple for end users; `puppeteer-core` requires manual Chrome path                                                                    |
| DPR in harness               | Hardcoded to `1`                           | Prevents non-deterministic pixel output across machines with different display scales                                                 |

## Existing Patterns to Follow

- `packages/embed/vite.config.js:13` — formats array; remove `'iife'`
- `packages/embed/src/projectParser.js:1-32` — parseProjectData; harness imports this from the embed bundle
- `src/app/utils/framesProvider.js:26-55` — captureFrames loop; replicate exactly in harness.js
- `src/app/utils/apngExport.js` — buildApng with upng-js; replicate in harness.js
- `packages/embed/package.json` — structure to follow for `packages/cli/package.json`
- `.github/workflows/ci.yml:26-32` — embed build + grep check; extend with bundle-size step

## File Change Manifest

| File                                     | Change                                                                                                                                                     | REQ refs                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `packages/embed/vite.config.js`          | modify — remove `'iife'` from formats                                                                                                                      | REQ-001                            |
| `packages/embed/package.json`            | modify — remove IIFE from exports/main fields                                                                                                              | REQ-001                            |
| `packages/embed/README.md`               | create — CDN + npm usage docs, attribute table                                                                                                             | REQ-002, REQ-003                   |
| `.github/workflows/ci.yml`               | modify — add bundle size assertion + `--no-sandbox` for CLI tests                                                                                          | REQ-004                            |
| `packages/cli/package.json`              | create — bin entry, puppeteer dep, workspace member                                                                                                        | REQ-005                            |
| `packages/cli/vite.config.js`            | create — Vite lib build producing `dist/headless.js` from `src/engine/`                                                                                    | REQ-007                            |
| `packages/cli/src/index.js`              | create — CLI entry: `render` + `batch` commands via minimist                                                                                               | REQ-006, REQ-008, REQ-009, REQ-010 |
| `packages/cli/src/server.js`             | create — local HTTP server on `127.0.0.1:0`, serves headless.js + Three.js + upng + harness                                                                | REQ-007                            |
| `packages/cli/src/headless-entry.js`     | create — engine entry point: `export { SceneManager } from '@engine/SceneManager.js'; export { parseProjectData } from '../../embed/src/projectParser.js'` | REQ-007                            |
| `packages/cli/src/harness.html`          | create — minimal HTML with importmap for Three.js + headless.js                                                                                            | REQ-007                            |
| `packages/cli/src/harness.js`            | create — browser-side: parse project, init SceneManager, capture frames, inline upng-js APNG encode or MediaRecorder WebM, return base64                   | REQ-007                            |
| `packages/cli/src/__tests__/cli.test.js` | create — unit tests for arg parsing, error paths                                                                                                           | REQ-008                            |

## Data Models

### CLI invocation shape (internal)

```js
// Parsed from argv by minimist:
{
  _: ['render', './project.bforge'],  // or ['batch', './dir']
  format: 'apng',    // 'apng' | 'gif' | 'webm'
  fps: 12,
  out: './out.apng', // or directory for batch
  width: undefined,  // override project canvas width
  height: undefined
}
```

### Harness message shape (page.evaluate args)

```js
// Passed into the Puppeteer page:
{
  projectJson: string,  // raw .bforge file content
  format: 'apng' | 'gif' | 'webm',
  fps: number,
  width: number | null,
  height: number | null
}
// Returned from page.evaluate:
{ ok: true, base64: string, mimeType: string }
// or on error:
{ ok: false, error: string }
```

## API Contracts

### CLI commands

```
bitmapforge render <file.bforge> [options]
  --format apng|gif|webm   default: apng
  --fps    <n>             default: 12
  --out    <path>          default: <basename>.<format>
  --width  <n>             override project width
  --height <n>             override project height

bitmapforge batch <dir> [options]
  --format apng|gif|webm   default: apng
  --fps    <n>             default: 12
  --out    <dir>           default: <input-dir>/out/
```

### Harness HTML importmap

```html
<script type="importmap">
  {
    "imports": {
      "three": "/three.module.js"
    }
  }
</script>
<script type="module" src="/bitmap-forge.es.js"></script>
<script type="module" src="/harness.js"></script>
```

### embed README CDN snippet

```html
<script type="importmap">
  { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js" } }
</script>
<script type="module" src="https://cdn.jsdelivr.net/npm/@bitmapforge/embed/dist/bitmap-forge.es.js"></script>
<bitmap-forge src="animation.bforge" autoplay loop></bitmap-forge>
```

## Dependencies & Migration

**New deps (packages/cli/):**

- `puppeteer` — headless Chromium; auto-downloads browser on install
- `minimist` — lightweight arg parser (no framework needed for 2 commands)
- `vite` (devDep) — builds the `headless.js` bundle from `src/engine/`

**No new deps in root or packages/embed.**

**CLI build step:** `packages/cli/` requires a `npm run build` step (Vite lib build)
before the CLI can run. The `packages/cli/package.json` `prepare` script runs this on
install. CI must run `cd packages/cli && npm install && npm run build` before testing.

**Back-compat:**

- Removing the IIFE build is a breaking change for any user importing
  `dist/bitmap-forge.iife.js` directly. Risk is low (package is not published to npm yet,
  only used in-repo via `public/embed/bitmap-forge.es.js`). The `prebuild` script in root
  `package.json` already copies only the ES file.
- Root `package.json` workspaces already includes `packages/*` so cli is picked up automatically.
- GIF format is removed from CLI scope (not previously promised — this is a new package).

## Failure Modes & Rollback

| Failure mode                                        | Impact                | Rollback step                                                              |
| --------------------------------------------------- | --------------------- | -------------------------------------------------------------------------- |
| Puppeteer fails to download Chromium                | CLI unusable          | Detect in postinstall; print `npx puppeteer browsers install chrome`       |
| Harness JS throws (e.g. model parse error)          | render exits non-zero | `page.evaluate` returns `{ ok: false, error }` → CLI prints it and exits 1 |
| HTTP server port collision                          | CLI hangs             | Use `port: 0` (OS assigns free port)                                       |
| Embed bundle size exceeds 50 KB after future change | CI fails              | Revert the offending commit                                                |
| Font files re-added to build as static imports      | IIFE issue returns    | CI alias-leak grep + size check catches it                                 |

**Rollback procedure:**

1. Revert the `vite.config.js` change to restore IIFE if needed (unlikely — nothing uses it)
2. Delete `packages/cli/` entirely (no impact on app or embed)

## Security & Authorization

- CLI reads local `.bforge` files only — no network access beyond Puppeteer Chromium download
- HTTP server binds to `127.0.0.1` only (not `0.0.0.0`) to prevent LAN exposure during render
- No user-supplied input is executed as shell commands; only passed to `page.evaluate` as strings

## Observability

- **CLI stdout:** output file path on success (machine-readable for piping)
- **CLI stderr:** progress lines `Rendering frame N/total`, errors with context
- **CI:** bundle-size assertion step fails the build with the actual byte count in the error message

## Risks & Mitigations

| Risk                                                             | Likelihood | Impact | Mitigation                                                                                     |
| ---------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------- |
| Puppeteer install size (~300 MB Chromium) is surprising          | Medium     | Low    | Document in CLI README; add `PUPPETEER_SKIP_DOWNLOAD=1` note for CI                            |
| harness.js frame capture diverges from browser framesProvider.js | Low        | High   | Unit test: render same project in harness, compare frame count + dimensions                    |
| upng-js not available at harness runtime (wrong path)            | Low        | Medium | Server.js resolves path from root node_modules; covered by unit test                           |
| embed SDK exports SceneManager?                                  | —          | —      | Resolved: CLI builds its own headless.js from src/engine/ — embed SDK not used as render layer |
| APNG worker URL breaks in harness                                | —          | —      | Resolved: harness inlines upng-js directly, no Worker needed                                   |
| Puppeteer --no-sandbox not set in CI                             | Medium     | Medium | CLI auto-detects CI=true env var and applies --no-sandbox flag                                 |

## Testing Strategy

- **Unit (packages/cli/):** Test arg parsing edge cases (missing file, bad format, missing
  `--out` dir creation), server.js path resolution, and the batch directory walk. Mock
  Puppeteer for unit tests.
- **Integration:** One smoke test that actually launches Puppeteer, loads a minimal .bforge
  fixture (shape input, no model file), and asserts the output file is a valid APNG
  (check PNG magic bytes + acTL chunk). Guarded by `INTEGRATION=1` env var so it doesn't
  run in normal `npm test`.
- **Embed:** Existing 23 tests continue to pass. No new tests needed for the build change;
  the CI size assertion is the test.
- **Manual verification:**
  1. `cd packages/embed && npm run build` → confirm no `bitmap-forge.iife.js` in dist/
  2. `gzip -c dist/bitmap-forge.es.js | wc -c` → confirm < 51200
  3. Open `test/embed-cdn-demo.html` (created as a dev-only file) in browser → confirm web component renders
  4. `node packages/cli/src/index.js render test-fixture.bforge --format apng --out /tmp/out.apng`
     → confirm /tmp/out.apng is created and opens correctly

## Performance Constraints

- Embed ES bundle: ≤ 50 KB gzipped (enforced by CI)
- CLI render: Puppeteer startup ~3–5 s; 24-frame APNG render ~10–20 s total; acceptable
- HTTP server: in-process, serves local files only — latency is negligible

## MCPs / Tools

- Read, Edit, Write, Bash for all file operations
- Grep to verify no `@engine` alias leakage after embed build changes

## Out of Scope (Technical)

- Do NOT modify `src/` app or engine files
- Do NOT add interactivity/mouse events to BitmapForgeElement
- Do NOT implement npm publish workflow (out of scope per SPEC)
- Do NOT add a `watch` mode to the CLI
- Do NOT modify the existing embed tests (unless they break due to IIFE removal)
