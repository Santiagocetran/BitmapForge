# Code ZIP sizing/lifetime implementation handoff

Status: **implemented and locally verified; independent implementation review and parent-owned built-CI gate remain pending.**

Branch `gloin/ui-output-improvements`, baseline HEAD `298bdec`, shared dirty worktree. This is not a committed immutable revision. The independently accepted `code-zip-sizing-fix-plan.md` and binding `code-zip-sizing-fix-plan-audit.md` R1–R3 govern this slice. `AGENTS.md` and the web-product-development skill were read. `CODEX.md` and the four named COLLAB bootstrap files are absent.

## Changed surface and exclusions

- `src/app/utils/codeExport.js`: only the generated `animation.js` body. Immediately size from container client dimensions before the unchanged fetch chain; observe the container once; cache accepted normalized pairs; own an idempotent non-persisted pagehide cleanup.
- `src/app/utils/codeExport.test.js`: execute the actual ZIP-extracted generated body with controlled imports/browser/manager mocks.
- `test/e2e/export.visual.spec.js`: only Code ZIP section changed by this worker. Existing edits elsewhere in this shared spec belong to the earlier export-verification work and were retained.
- This handoff document.

No engine, UI, other templates, quality thresholds, dependency, runner, or CI changes were made by this worker. No reset, stash, commit, push, merge, deployment or remote write. Existing concurrent changes remain untouched.

## Binding audit dispositions

| Requirement | Implementation and verification disposition |
| --- | --- |
| R1: immediate normalized valid size, same function for observer | `syncSize` floors container `clientWidth/clientHeight`, rejects nonfinite/nonpositive results, calls `setSize` synchronously before fetch, and is the sole ResizeObserver callback. Actual generated-body test checks ordering, one manager/observer, and container identity. |
| R1: hidden/cache semantics | Initially hidden skips sizing even when the model finishes first; first valid size applies. Valid → hidden → identical reveal makes no additional call. Changed reveal applies once. Cache changes only after accepted `setSize`. |
| R1: independent invalid axes and duplicate notifications | Both axes separately cover zero, negative, NaN, positive/negative Infinity and positive fraction flooring to zero. Valid fractional dimensions floor to integers. Initial duplicate observer delivery and equivalent normalized pairs skip sizing; width-only and height-only changes apply. |
| R1: stale callback | Disposed check precedes measurement. Saved observer invocation after teardown proves no property reads and no sizing. |
| R2: pending fetch ownership | Held fetch resolves after teardown through the existing blob/File/loadModel chain. Late `loadModel` invocation on the disposed manager is allowed and asserted as the retained chain, not forbidden. One manager/observer, no late sizing or reinstallation, cleanup once. No cancellation or engine behavior added. |
| R2: real engine safety | Ran current `SceneManager.safety.test.js` alongside generated-body tests: 25 engine safety cases pass, including engine-owned disposal/late-result safety. Template mocks are not presented as real decoder safety evidence. |
| R2: page lifetime identity/idempotence | Same saved pagehide callback is removed, then deliberately invoked again; disconnect/removal/disposal occur once. Persisted event performs no teardown; resize still works, followed by ordinary cleanup and stale observer invocation. Synthetic persisted events establish branching only, not real BFCache restoration. |
| R3: exact downloaded-artifact geometry sizing | DPR1 container, rendered canvas and backing dimensions assert 1280×800 → 900×600 → container-only 640×360. Container-only change retains viewport 900×600. Hidden container becomes 0×0 with backing retained 640×360; reveal returns all visible sizes to 640×360. Hidden rendered size is recorded diagnostically but not asserted as a visible layout contract. |
| R3: asynchronous stability/nonblank | Dimension polling waits for observer delivery, then checks three subsequent animation frames for stable sizing. Each visible stage polls a meaningful screenshot with existing `isBlank` thresholds (1% foreground, five colors), without manager/pose/scale/seek injection. No thresholds changed. |
| R3: original artifact and failure evidence | Original ZIP retained; extracted animation.js compared byte-for-byte with ZIP entry. Only HTML dependency import-map insertion is allowed. Code ZIP runtime collects transport `requestfailed`, non-OK HTTP responses, page errors, console and dimension samples. Finally writes JSON before optional screenshot/trace work. Manually created context has explicit tracing start/stop, retained on success and failure. |

## Executed gates

All tools ran with Node20 through `npx --yes --package=node@20 -c 'node …'`, using direct tool JS entry points.

1. Scoped Prettier write, ESLint, then Vitest:
   - `node node_modules/prettier/bin/prettier.cjs --write src/app/utils/codeExport.js src/app/utils/codeExport.test.js test/e2e/export.visual.spec.js`
   - `node node_modules/eslint/bin/eslint.js src/app/utils/codeExport.js src/app/utils/codeExport.test.js test/e2e/export.visual.spec.js`
   - `node node_modules/vitest/vitest.mjs run src/app/utils/codeExport.test.js src/engine/SceneManager.safety.test.js`
   - **Exit 0; 2 files, 52 tests passed:** 27 ZIP tests (15 existing + 12 generated-runtime cases), 25 real engine safety tests.
2. First full six-export run, isolated port 42683, output `../export-code-sizing-implementation/`:
   - **5 passed, 1 failed, 5.1m.** Code ZIP passed including every new stage. CSS ZIP failed its unchanged frame-1 nonblank assertion. Retained failure screenshots/metrics and report. This is an observed timing-sensitive failure, not silently discarded or attributed to a proven cause. No CSS code/assertion/timing was changed to address it.
3. Second complete six-export run, isolated port 42684, output `../export-code-sizing-final/`:
   - `BITMAPFORGE_EXPORT_OUTPUT=/home/agent/.hermes/profiles/gloin/cache/scratch/export-code-sizing-final BITMAPFORGE_EXPORT_PORT=42684 npx --yes --package=node@20 -c 'node node_modules/@playwright/test/cli.js test --config=playwright.export.config.js'`
   - **Exit 0; all 6 passed, 4.0m:** preview 9.6s, APNG 40.6s, Sprite Sheet 18.4s, Code ZIP 45.4s, CSS ZIP 1.1m, Video 56.1s.
   - No retries configured; this was an explicit fresh full run with unchanged assertions.
4. Final scoped Prettier check, ESLint and `git diff --check`: **exit 0**.

Runner uses unique port/cache/output outside served source, HMR disabled and no reused server. Earlier `../export-recovery-reviewed/` defect evidence and `../export-verification-handoff.md` remain unmodified.

## Final real-artifact evidence

`../export-code-sizing-final/` contains original `code-export.zip`, extracted runtime/engine sources, `code-runtime.json`, explicit `code-runtime-trace.zip`, screenshots with metrics, all other export artifacts, and `report/index.html`.

| Visible stage | Size | Foreground pixels | Foreground ratio | Colors | Entropy |
| --- | --- | --- | --- | --- | --- |
| Initial | 1280×800 | 131472 | 0.128390625 | 114 | 0.9870316875209802 |
| Viewport resize | 900×600 | 66537 | 0.12321666666666667 | 30 | 0.9222875162233019 |
| Container-only resize | 640×360 | 23967 | 0.1040234375 | 48 | 0.8025607403012858 |
| Revealed | 640×360 | 25272 | 0.1096875 | 42 | 0.829711294967161 |

Final runtime JSON has 21 dimension snapshots; runtime page errors, failed HTTP/transport requests, and console logs are all empty. Initial screenshot was visually inspected: a large shaded green dithered cube on a dark background, not a blank/default canvas.

## Remaining gates and limits

- **Independent implementation review required:** inspect these owned files against plan/audit; this document is implementer evidence, not self-approval. Shared spec changes outside Code ZIP are pre-existing and not this worker's diff.
- **Built-artifact CI path is a separate parent gate.** This worker did not run a build or `.github/ci/playwright.config.js`. Source-runner timeout is 180 seconds; inherited built-path timeout is 90 seconds. Passing source runs (Code ZIP 45.4s and approximately 1.1m) do not prove built provenance or timeout clearance.
- Report the earlier CSS frame failure as residual export-test timing uncertainty despite final all-six success. Its evidence is retained; no scope expansion was made.
- No real BFCache navigation/eligibility/restoration was tested. Persisted pagehide coverage is synthetic unit behavior only.
- No clearance of parent-owned application/SDK/root-suite/CI work, other generated-template sizing parity, or deployment is implied.
