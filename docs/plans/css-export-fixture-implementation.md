# CSS spatial fixture implementation and verification

## Outcome / review boundary

Implemented the accepted **CSS-only, pre-upload 384×320 preview fixture**. Three fresh isolated CSS runs passed at the original **90,000 ms** per-test budget. A subsequent complete built-suite execution passed **all six cases**, with normal teardown and runner exit 0. A separate intentional failure retained a readable, CRC-valid runner trace and failure screenshot.

**Ready for independent implementation review; not a production performance fix or blanket reliability/release clearance.** An earlier full-suite attempt timed out in the unchanged APNG case and was later interrupted by the tool wall-clock limit. That evidence remains, and the later green run does not diagnose or erase it. The historical CSS runner-archive failure's precise internal cause remains unproven.

## Owned changes

- `test/e2e/export.visual.spec.js`: small named preview-layout/size helpers; default-off `setupApp(browser, { previewSize } = {})`; CSS-only opt-in; positive downloaded archive, animation and geometry assertions; CSS evidence JSON.
- This document only otherwise.

The other five test bodies and shared export trigger are **byte-identical to the worker-entry snapshot** (`../css-fixture-before.spec.js`), verified programmatically. This is important because the file already contained accepted earlier changes, particularly Code ZIP tracing ownership. Context stays **1280×800 / DPR 1** for every case. No application, exporter, engine, metrics, configuration, CI, dependencies or generated embed changes were made by this worker. No commit/reset/stash/push/deploy/remote writes.

### Fixture behavior

- After app navigation and before native cube upload, resolve exactly one canvas in the named Preview region. Validate canvas → effect wrapper → observed container hierarchy, containment and current structural classes. The named HTML section has an implicit region role; the containment guard handles that rather than requiring an explicit `role` attribute.
- Set **only the observed container's inline width/height**. Normal ResizeObserver/SceneManager behavior drives backing dimensions. No canvas backing writes, manager/store calls, animation/pose/scale mutation, browser instrumentation or changed viewport.
- Poll the same canvas for backing, rendered and client 384×320, observed container client 384×320 and DPR 1. Assert visible preview and desktop viewport; repeat after native upload/initial render and immediately before export. The observed container has no padding/border; its normal ResizeObserver content dimensions agree with those checked backing/client dimensions.
- Verify CSS format/export controls through visible/enabled assertions and normal non-forced clicks.
- Keep the complete original **181-frame / 11283.185307179585 ms** default single-loop fade/spin animation. The literal expected duration is from actual default/export source and verified downloaded CSS, not a shortened fixture or production-generation import.
- Retain original live app context plus second artifact page, 3000 ms show-phase wait, 600 ms advancing-frame separation, both meaningful-content checks, unequal screenshot buffers, CSS response/runtime and app error assertions, server cleanup and context close.

### New positive downloaded-output checks

CRC-load original ZIP, preserve original bytes, require CSS/referenced sprite/README, assert 384×320 cell declarations, six columns / 31 rows via the exact **181 ordered distinct keyframe stops**, rounded percentages and every expected atlas position; require loop duration, CSS background size and decoded PNG **2304×9920**. Browser-computed artifact size, background size and duration must agree. Save `exports/css-fixture.json` with preview/viewport/DPR, archive bytes, frame count, loop duration, atlas and runtime metrics.

The external post-run verifier fully decodes all 181 real cells, retains SHA-256 cell hashes and requires **181 distinct cells**. Unused trailing atlas cells are ignored. Each archive has **176 meaningful cells** under the earlier diagnostic cell criterion, with low-content fade endpoints preserved; no weakened runtime screenshot thresholds. Visually inspected `css-4` show-phase screenshot: clear green dithered cube geometry on dark background.

## Build and served-byte provenance

Evidence root:

`/home/agent/.hermes/profiles/gloin/cache/scratch/css-fixture-implementation-evidence/`

Branch `gloin/ui-output-improvements`, HEAD `298bdec17dcd1603add549118a743e5cd494ba08`, integrated dirty checkout. Saved `dirty.diff` and complete relevant source/public hashes in `source-before.json`. Parent confirmed its earlier verification stopped before building and relinquished build ownership. This worker built current app source directly with Node 20:

```sh
npx --yes --package=node@20 -c 'node --version && node node_modules/vite/bin/vite.js build --outDir /home/agent/.hermes/profiles/gloin/cache/scratch/css-fixture-implementation-evidence/dist'
```

Build log reports Node **20.20.2**. Direct Vite build intentionally avoids `npm run build`'s generated-embed write; it uses the existing unchanged `public/embed` artifact, whose bytes are included in the source/build identity. This is current-source app-build/browser verification, not a claim that this worker reran all workspace prebuild/root gates.

An initial source-stability check detected a concurrent **PresetGallery test-only** edit during building; rejected that attempt and rebuilt/re-identified after the edit. The final captured source hashes remained unchanged through all three CSS passes, complete six-case run, trace probe and final readback.

Final immutable build has **35 files**. Every file was fetched through each run's strict isolated Vite preview and SHA-256-compared with `manifest.json`; no HTML-only provenance shortcut. Each run saves `served-manifest.json`; final on-disk snapshot also matches. Nothing served from the source/dev server or older investigation build.

- Build-manifest JSON SHA-256: `4bf59bfef86ab97eba9b2a956a3e7bff3a0c924ec0c48be807322ac92aa7b6d0`
- Source-manifest JSON SHA-256: `4e02a21a569cb2b78e95addfc8cc667c8dfe5f984deb5cd2e89fe94b2a4d4f44`

## Acceptance executions

Each external config imports **`.github/ci/playwright.config.js`**. Overrides are isolation paths, unique strict port/server target, output and JSON reporter only. Actual repository spec, original **90,000 ms**, one worker, retries 0, software-GL flags, runner `retain-on-failure`, `only-on-failure` screenshots and `reuseExistingServer: false` retained. No manual CSS trace owner, timeout extension, runner patch or diagnostic canvas wrappers.

Reproduction helper outside the repo: `../css-fixture-verify.py`. Each command below runs a separate fresh server/context/output, not `--repeat-each`:

```sh
MODE=css-2 python3 ../css-fixture-verify.py
MODE=css-3 python3 ../css-fixture-verify.py
MODE=css-4 python3 ../css-fixture-verify.py
MODE=full-six-retry python3 ../css-fixture-verify.py
MODE=trace-probe python3 ../css-fixture-verify.py
npx --yes --package=node@20 -c 'node ../css-fixture-analyze.mjs'
python3 ../css-fixture-finalize.py
```

| Evidence run | Test duration | Result | CSS ZIP / deep decoded evidence |
| --- | ---: | --- | --- |
| `css-2` | 41,662 ms | passed, exit 0 | 1,252,272 bytes; CRC valid; 181 stops / distinct cells; 176 meaningful cells |
| `css-3` | 31,581 ms | passed, exit 0 | 1,253,877 bytes; same full-loop/geometry/cell proof |
| `css-4` | 43,071 ms | passed, exit 0 | 1,252,131 bytes; same full-loop/geometry/cell proof |
| `full-six-retry` CSS | 27,760 ms | passed within six-pass suite, exit 0 | 1,254,908 bytes; same full-loop/geometry/cell proof |

Every listed CSS artifact agrees on **384×320 → 2304×9920**, **181** actual ordered stops and **11283.185307179585 ms**. `artifact-analysis.json`, each run's `cell-analysis.json`, actual ZIPs, screenshots/metrics and `css-fixture.json` retain the evidence.

Full suite (`full-six-retry/results.json`): **exactly six passed**, zero skipped/unexpected/flaky, runner exit 0, runner total **253272.176 ms**:

| Case | Test duration |
| --- | ---: |
| App baseline | 10,204 ms |
| APNG | 75,467 ms |
| Sprite Sheet | 26,215 ms |
| Code ZIP | 55,243 ms |
| CSS ZIP | 27,760 ms |
| Video | 54,446 ms |

Code ZIP's original runtime/dimension/meaningful-frame/byte-equality assertions and single trace-owner behavior are unchanged; `exports/code-runtime.json` and original screenshots are retained. Other formats likewise retain original full geometry and original artifact quality assertions.

## Retained trace readability

`trace-probe` is a **separate expected failure**, not one of the six successes. Tiny external spec creates an explicit runner-instrumented context, opens the built app, checks Preview visibility, then intentionally fails equality. It exits **1** for the intended assertion; no duplicate trace start/stop.

Read back the retained `trace.zip` with full ZIP CRC validation and parsed every trace/network JSON line: **73 events**, **4 DOM snapshots**, **13 screencast frames**, **4 network resource records**, original navigation and original intentional failure present. Retained failure screenshot, error context and JSON report exist. The validator strips ANSI from error text before checking the original message; its initial literal-text check correctly failed on color-escape splitting, then was corrected without modifying the probe or trace. Details and entry list: `trace-readability.json`.

This demonstrates ordinary retained runner trace finalization/readability under the real policy. It does **not** prove the earlier oversized CSS temporary-trace merge race or identify an interrupted temporary filename.

## Preserved failures / limits

- `css-1`: setup-guard failure before export because the first guard required explicit `[role="region"]` on the implicitly named section. Retained log/report/screenshot/trace; corrected only the CSS helper guard. Not counted among the three successes.
- `full-six`: initial full-suite run had **APNG timeout at 90,000 ms while waiting for download** (read back from its CRC-valid runner trace). App, Sprite Sheet, Code ZIP and CSS passed; the enclosing tool command was killed at its 420-second wall-clock limit during Video, so there is no completed JSON report/execution metadata and no six-case acceptance claim for that attempt. Its actual downloads/screenshots/traces/log remain. Another worker's UI browser suite was concurrently observed, but causality for the APNG timeout is **not proven**. Full rerun used a tracked background process and completed all six. A green rerun does not resolve general APNG/load sensitivity.
- No current claim of production scalability certification, original large-resolution performance repair, exact Playwright internal race repair, complete root/workspace acceptance, deployment or release approval.
- Independent review of this actual narrow implementation remains for the parent after handoff. If review changes spec/runtime source, rerun applicable final checks rather than claiming these prior bytes cover it.

## Narrow static checks

Pre-change changed-file ESLint and Prettier check: passed. Post-change ESLint, Prettier check, `git diff --check`: **each exit 0**. Programmatic unchanged-five-case comparison: passed. No timeout/trace/worker/quality-threshold configuration edits.

Review the **worker-only** `worker-only.patch` against sibling `css-fixture-before.spec.js`; the Git-base spec diff also contains earlier accepted work and is not this worker's ownership delta.

Evidence index: `worker-only.patch`, `summary.json`, `artifact-analysis.json`, `trace-readability.json`, `manifest.json`, `source-before.json`, per-run `execution.json`, `results.json`, `served-manifest.json`, `run.log`, `exports/`, `playwright/`; `build.log` and `dirty.diff`. Helper scripts (`css-fixture-verify.py`, `css-fixture-analyze.mjs`, `css-fixture-finalize.py`) and worker-entry spec snapshot live in sibling scratch, not production/config/test source.
