# Independent implementation audit — Code ZIP sizing and lifetime

## Verdict

**Accept the bounded implementation against the repair plan and binding R1–R3 contracts. No blocking implementation defect found.** Independently reproduced 52 targeted tests and a complete six-export browser run. The actual downloaded Code ZIP renders meaningful geometry at every required visible size without runtime JavaScript modification.

This approval covers the generated Code ZIP sizing/lifetime slice, not release readiness, the parent-owned built-preview CI gate, unrelated shared-tree changes, or real BFCache eligibility/restoration.

## Review provenance and scope

Reviewed branch `gloin/ui-output-improvements`, HEAD `298bdec17dcd1603add549118a743e5cd494ba08`, with the existing dirty shared worktree. This is a working-source audit, not an immutable commit approval. Read `AGENTS.md`, the web-product-development skill, `code-zip-sizing-fix-plan.md`, `code-zip-sizing-fix-plan-audit.md`, and `code-zip-sizing-implementation.md`. `CODEX` config and `COLLAB` records were not present.

Inspected generated template and tests, the complete Code ZIP browser section, runner isolation, visual metrics, and relevant current engine disposal/load guards. Compared `codeExport.js` and its tests against HEAD. The production template diff is exclusively the 27-line sizing/lifetime insertion; existing fetch/blob/File/loadModel statements remain unchanged. Engine/UI/other-format changes already in this shared tree are not changes attributable to this repair and are not independently approved here. This auditor made no application, test, runner, configuration, or engine edits.

## Contract findings

| Contract | Independent finding |
| --- | --- |
| R1: synchronous initialization and measurement | `codeExport.js:31–50` creates one manager, then synchronously calls the shared sizing function before fetch. Measurements come from the container's `clientWidth/clientHeight`, floor to integers, reject nonfinite/nonpositive results, and only cache a pair after `setSize`. Generated-body assertions establish ordering rather than merely looking for strings. |
| R1: observer and deduplication | Exactly one ResizeObserver observes the container. First duplicate delivery, normalized equivalent pairs, width-only and height-only changes are exercised. No canvas/window dimension dependency or feedback loop is introduced. |
| R1: hidden/invalid states | Generated-body tests cover initial hidden state with model completion before reveal, valid → hidden → identical reveal with no extra size call, changed reveal with one new call, and each invalid axis separately (zero, negative, NaN, positive/negative Infinity, positive fraction flooring to zero). Hidden state preserves the accepted cache. |
| R1: stale callbacks | Disposed guard precedes all dimension reads. A deliberately saved observer callback after teardown demonstrably performs neither measurement nor sizing. |
| R2: page lifetime | `codeExport.js:52–59` owns one pagehide callback. Persisted events leave observer, listener and manager intact; resize then still works. Ordinary pagehide marks disposed, disconnects, removes the exact registered identity, and disposes once. Saved handler reinvocation and stale observer execution verify idempotence. No unload/beforeunload or visibility-driven teardown was added. |
| R2: pending fetch ownership | The actual generated chain is allowed to invoke `loadModel` after teardown. Tests resolve the held response through blob/File/loadModel, while verifying no new manager/observer, late sizing, or repeated cleanup. Current real engine `_loadSource` rejects already-disposed requests and `_commitSource` releases late prepared resources; 25 engine safety regressions passed independently. Template mocks are not used as proof of decoder/resource behavior. |
| R3: actual downloaded artifact | Real app export, original ZIP retention, normal extracted engine, dependency import map in HTML only. Browser assertion and independent ZIP readback both confirm unchanged animation bytes. No manager exposure, size/pose/scale/seek injection, or JavaScript repair. |
| R3: exact responsive geometry | DPR1 container, visible canvas rendered box and backing attributes match 1280×800 → 900×600 → container-only 640×360. Viewport remains 900×600 for the container-only stage. Hidden container becomes 0×0 while backing stays 640×360; reveal restores all visible sizes to 640×360. Polling plus three subsequent animation-frame samples per stage found stable dimensions. Hidden rendered size is not asserted as a visible-layout contract. |
| R3: content and evidence | Existing `isBlank` thresholds remain 1% foreground and five colors. All four visible stages satisfy them through bounded polling. Runtime listens for transport failures, non-OK HTTP responses, page errors, and console output. Finally-block JSON precedes optional screenshot/trace work; manual context explicitly starts/stops tracing. Original ZIP, extracted sources, screenshots, metrics, trace and HTML report are retained. |

The initial screenshot was visually inspected: a large shaded green/yellow dithered cube on a near-black background, clearly meaningful geometry rather than codec noise or a default/blank canvas.

## Independently executed verification

Working directory: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`.

All JavaScript tools used the Node20 wrapper and direct JS entry points.

### Generated module and engine gates

```sh
npx --yes --package=node@20 -c 'node node_modules/vitest/vitest.mjs run src/app/utils/codeExport.test.js src/engine/SceneManager.safety.test.js'
```

**Exit 0: two files, 52 tests passed** — 27 ZIP/config tests and 25 real engine safety tests; duration 15.19s. The ZIP file includes the newly executed extracted-body sizing/lifetime cases, not just pre-existing scaffold checks.

```sh
npx --yes --package=node@20 -c 'node node_modules/eslint/bin/eslint.js src/app/utils/codeExport.js src/app/utils/codeExport.test.js test/e2e/export.visual.spec.js && node node_modules/prettier/bin/prettier.cjs --check src/app/utils/codeExport.js src/app/utils/codeExport.test.js test/e2e/export.visual.spec.js'
```

**Exit 0:** scoped ESLint and Prettier check passed. No formatting write was performed.

### Full source-runner export gate

```sh
BITMAPFORGE_EXPORT_OUTPUT=/home/agent/.hermes/profiles/gloin/cache/scratch/export-code-sizing-independent-audit BITMAPFORGE_EXPORT_PORT=42731 npx --yes --package=node@20 -c 'node node_modules/@playwright/test/cli.js test --config=playwright.export.config.js'
```

**Exit 0: all six passed, 3.8m, one worker, zero retries.**

| Check | Reported duration |
| --- | --- |
| Preview model upload | 6.4s |
| APNG | 42.8s |
| Sprite Sheet | 17.0s |
| Code ZIP | 48.1s |
| CSS ZIP | 1.1m |
| Video | 46.5s |

Config inspection confirms dedicated strict port 42731, run-owned Vite cache under the external artifact directory, disabled HMR, and `reuseExistingServer: false`. Outputs were outside the served repository. This was one fresh independent full run, not a repeated-run stability benchmark.

Evidence root: `/home/agent/.hermes/profiles/gloin/cache/scratch/export-code-sizing-independent-audit/`. Key files: `code-export.zip`, `code-export/BitmapForge-export/animation.js`, `code-runtime.json`, `code-runtime-trace.zip`, `screenshots/code-export-{canvas,viewport,container,revealed}.png` and metrics JSON, and `report/index.html`.

Readback of `code-runtime.json` found **21 dimension snapshots**, with empty `codeErrors`, `failedCodeRequests`, and `codeConsoleLogs` arrays.

| Visible stage | Size | Foreground pixels | Foreground ratio | Colors | Entropy |
| --- | --- | --- | --- | --- | --- |
| Initial | 1280×800 | 112950 | 0.110302734375 | 73 | 0.7172390026067419 |
| Viewport resize | 900×600 | 72090 | 0.1335 | 55 | 0.9707824190820976 |
| Container-only resize | 640×360 | 25587 | 0.1110546875 | 61 | 0.8319041959707714 |
| Revealed | 640×360 | 23427 | 0.1016796875 | 35 | 0.6955767180378635 |

Independent Python ZIP readback confirmed extracted `animation.js` byte equality and SHA256 `6176dda3f902de99736ddaf8ea083dcdc483942f18dd10fba48b3a439455db96`. Bundled `engine/SceneManager.js` equals both the extracted file and the current working source, SHA256 `484b6feb9279cc7feb313f596c30e5ecb290d33035e4b5ec08d736fe785018f7`. This pins the artifact's disposal guards instead of assuming clean-HEAD engine contents.

## Actionable follow-ups and precise limits

1. **Parent release gate remains open:** run the built-artifact path with CI-equivalent build/environment provenance (`.github/ci/playwright.config.js`) and retain its result. This audit ran the isolated source runner only. Its 180-second per-test budget does not prove clearance under the inherited 90-second built-path budget, even though this observed Code ZIP execution took 48.1s. No build, SDK/root-suite clearance, or deployment is claimed.
2. **CSS residual flake remains a separate issue, not erased by green reruns.** Read back retained `../export-code-sizing-implementation/screenshots/css-export-frame1.png.metrics.json`: foreground ratio **0.004478895113428366**, 19 colors, below unchanged 1% occupancy threshold. That is concrete evidence supporting the implementer's recorded first-run 5-pass/1-fail result. The subsequent implementer all-six run had CSS frame-1 ratio **0.047797992123800544**; this independent all-six run had **0.15092351211936325**. Classify this as an observed intermittent/timing-sensitive CSS content assertion failure with unproven root cause, not a proven CSS exporter regression or a resolved flake. Preserve earlier failure/report evidence and investigate separately; do not weaken thresholds or claim deterministic six-export stability. These runs provide repeated green Code ZIP evidence but not statistical reliability.
3. **No actual BFCache claim:** persisted pagehide coverage is synthetic generated-body handler behavior. No real back/forward navigation, eligibility check, frozen/resumed lifecycle, or restored-page observation occurred.
4. **Scope exclusions remain:** React/Web Component sizing parity, general generated configuration/animation parity, filename escaping and fetch-error handling, other engines/templates, unrelated concurrent UI/lint/CI work, and non-Chromium/DPR variants are not cleared. No fetch cancellation was added or required.
5. **Evidence boundary:** failure-safe runtime diagnostics cover the Code ZIP runtime execution inside its try/finally; a failure earlier during app setup, download, extraction, static-server creation, or tracing startup need not produce `code-runtime.json`. This does not undermine the required sizing/assertion failure coverage, but should not be described as universal failure capture.

Only `docs/plans/code-zip-sizing-independent-implementation-audit.md` was created by this auditor. Plans are ignored in this checkout; retain this document explicitly with review artifacts. No reset, stash, commit, push, deployment or remote writes were performed.
