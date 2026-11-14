# Embed readiness repair — bounded handoff

## Outcome

**Three isolated built Embed passes, followed by the full built 10/10 pass.** This is a harness completion-contract repair, not an application/runtime repair. Original 90000ms test budget, retries 0, workers 1 and runner-owned `retain-on-failure` tracing are unchanged. Independent review remains parent-owned; no release approval is implied.

Branch `gloin/editor-redesign`, HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`. Reused the existing normal post-B1 isolated build at `../bf-p3-evidence/dist`; no rebuild or source substitution. No commit, push, remote operation, deployment, dependency, app/SDK/engine/builder/hook or tracked configuration edit.

## Exact observed cause

The earlier handoff's assertion that model-load completion means renderer installation is complete was incomplete:

1. `SceneManager._loadSource` starts `fadeIn` when installing the real loaded model (`SceneManager.js:138`).
2. The SDK awaits `loadModel`, calls `setRenderMode`, updates options, and sets `_loading=false` (`packages/embed/src/BitmapForgeElement.js:92,108–115`).
3. `BitmapEffect.setRenderer` **queues** the requested renderer while `isAnimating` is true (`BitmapEffect.js:76–81`). Therefore `_loading===false && hasObject()` does not imply canvas lifetime stability.
4. `renderBitmap` applies `_pendingRenderer` after the fade completes (`BitmapEffect.js:130–133`); `_swapRenderer` removes the old canvas and appends the new canvas (`84–96`). An element screenshot can already be waiting for stability on the old node when this legitimate retirement occurs.

The external read-only diagnostic exercised the **unchanged archive from the retained failed run**, not a synthetic payload. `embed-readiness/lifecycle.json` records:

- At 1287.9ms: load finished, real object present, canvas 1 active/connected at 600×600, **pending renderer true**, fade active.
- At 2114.3ms, immediately before screenshot: the old load-ready predicate still passes, but a renderer remains pending.
- The original-style `locator.screenshot()` reproduces **Element is not attached to the DOM**.
- At 4293.8ms: MutationObserver records removal of canvas 1 and replacement by canvas 2, pending renderer cleared, dimensions still 600×600. Canvas 2 remains current beyond 12 seconds and the next animation phase. No page error occurred.

These are measured diagnostic-relative timings, not new acceptance sleeps. `diagnose.mjs` uses only read-only state inspection, a WeakMap for diagnostic canvas IDs, MutationObserver and the normal animation loop. It does not wrap/patch runtime methods, force a frame, change sizing or inject model data.

The relevant SDK, SceneManager, BitmapEffect and exporter source files are byte-identical to both HEAD and historical `8c6613279ed856e4933608e7e6c04e91dca2b331`; see `lifecycle-source-provenance.json`.

## Bounded repair

Only the Embed case in `test/e2e/redesign-artifacts.spec.js` changed. Before screenshot, the existing **same 18000ms meaningful-frame poll** now atomically observes:

- `_loading === false` and real `manager.hasObject()`;
- `effect._pendingRenderer === null`;
- the shadow-root canvas is connected and is exactly `effect.bitmapCanvas`;
- its current backing/rendered dimensions equal the required size.

Then the existing real element screenshot and unchanged occupancy/color assertions execute. No screenshot-exception catch/retry, arbitrary sleep, timeout increase, rendering call or runtime mutation was introduced. Readiness samples are added to failure-safe existing diagnostics. All three isolated runs and the full run actually observed `rendererSettled:false` after load completion before observing true; this is not a vacuous new predicate.

Everything else remains: CRC-checked real UI download, SDK equality to the served build, exact model/payload bytes, archive SDK unchanged on disk, dependency-resolution-only HTML adaptation, meaningful initial 600×600 output, container-only 384×320 resize, matching canvas geometry, no runtime/request errors, exact Image-disabled explanation/action and no disabled download. Other case bodies and shared helpers are byte-identical to the worker-entry snapshot. Initial geometry polling remains intact.

## Executed evidence

All paths below are under:

`/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p3-evidence/embed-readiness/`

| Gate                                                   | Actual result                                  | Evidence                                   |
| ------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------ |
| Changed-spec ESLint / Prettier                         | exit 0 / exit 0                                | `lint.log`, `format.log`                   |
| Full built discovery                                   | 10 cases                                       | `discovery.log`                            |
| Isolated Embed 1                                       | 1 passed; case 34.627s                         | `isolated-1/report.json`, `isolated-1.log` |
| Isolated Embed 2                                       | 1 passed; case 31.971s                         | `isolated-2/report.json`, `isolated-2.log` |
| Isolated Embed 3                                       | 1 passed; case 29.646s                         | `isolated-3/report.json`, `isolated-3.log` |
| Full built suite                                       | **10 passed**, 340.223s overall; Embed 26.873s | `full/report.json`, `full.log`             |
| Evidence aggregation / CRC / byte and count assertions | exit 0                                         | `summarize.py`, `final-manifest.json`      |

All reports have zero skipped, unexpected or flaky cases and exactly one attempt per test (`retry:0`). Tests ran under scoped **Node v20.20.2**, dedicated preview port **5347**, `reuseExistingServer:false`, and separate per-run output/artifact roots outside the served app. The tracked runner completed and exited 0; no server/process handoff remains.

Exact runner:

```sh
/home/agent/.npm/_npx/b0f09313e59e2652/node_modules/node/bin/node \
  /home/agent/.hermes/profiles/gloin/cache/scratch/bf-p3-evidence/embed-readiness/run-gates.mjs
```

`playwright.config.mjs` preserves original matching suites, 90-second timeout, zero retries, serial worker and trace policy; only target/output/provenance isolation differs. `verify-built.mjs` verifies the prior post-B1 source/build manifest and fetches **all 35 built files**, byte-compared to disk, including MIME readback, before each run. Per-run `served-identity.json` retains exact served hashes.

All **200/200** source/test/dist hashes remain unchanged across each isolated run. During the full run, **199/200** remained unchanged: a concurrent edit to **only `src/app/utils/uiPropValidators.test.js`** changed its unit-test hash. This file is not imported by the built app or browser suites; no runtime dependency, browser helper/spec, generated runtime or any of the 35 dist files changed. The two hashes are retained in `built-full-before.json` / `built-full-after.json`. Do not describe the full 200-file window as entirely unchanged.

Full-run Embed SDK SHA256:

`127c05aa02e87206b6ebbd18790d6e19443a29996f18e65e20436b5ec809401b`

Full-run real archive SHA256:

`b8eb37671c74c9c657877ef7daf28d88dbc7439c83e489089499275c90bb539b`

Full-run initial output: 600×600, 50 unique colors, non-background ratio 0.1974. Container-only resized output: 384×320, 48 colors, ratio 0.178271484375. Both exceed unchanged 5-color / 1% occupancy floors. Runtime errors and failed requests are empty. Actual isolated screenshots were visually inspected: meaningful dithered green cube at both sizes, not a blank/default canvas.

## Patch identity / scope proof

Worker entry snapshot: `entry-spec.js`, SHA256 `935e5452a14dace0721b6c766ebf8494fcef55570e2e15be60a3c8a72d69ee26`, exactly matching the prior post-B1 manifest.

Final spec SHA256: `902b6a8bc758787ba5260761c2c692ad2d35f5d9d8b6f91d2e99680fff8dd3a6`.

Worker-only patch: `worker-only.patch`, SHA256 `b5a708336ee525802dda57c7c7d0078dc34440266e8872985fef32b6228f5142`.

The patch was actually applied to an external copy of the worker-entry snapshot and the result byte-compared to the final spec. The complete prefix containing imports, helpers, GIF, React and Web Component cases is unchanged. No `utils/exportApp.js` change. New repository documentation is this handoff only. Dedicated external config, diagnostic/runner/aggregation scripts and all evidence reside outside the repository.

## Rejected hypotheses / preserved issues

- **Load-ready is sufficient:** directly disproved by the observed queued renderer after `_loading=false`; this was the incomplete earlier fix.
- **B1 introduced an SDK/engine regression:** relevant runtime sources match the historical baseline and the unchanged runtime reproduces the exact intended renderer-swap sequence. No unauthorized application repair was warranted.
- **Corrupted ZIP or mixed built SDK:** CRC passes and exact archived/served/dist SDK/model/payload comparisons pass. The retained failed trace also passes CRC. No corruption claim is made.
- **Backing-size failure:** geometry is correct before the old failure, during measured retirement, and after the repaired ready condition at both required sizes. No `setSize` repair was used.
- **A larger timeout, screenshot retry or forced render is necessary:** completion-contract readiness passes all requested runs at original limits without those changes.

Original failed `../bf-p3-evidence/built-report.json`, `built-results/.../trace.zip`, name-Escape gate logs and earlier failures are untouched. `final-manifest.json` includes the original trace path/hash/CRC and original screenshot error. No second trace owner was added. The initial local formatting check failed, then only the owned spec was formatted; failed pre-format logs are retained as `pre-format-*`. An initial provenance helper incorrectly interpreted virtual `built-dist/` keys as repository paths; its retained diagnostic is explicitly annotated, and the correct mapping is enforced in each acceptance run. The first evidence aggregator correctly rejected the full-window test-only drift; the final aggregator records that named exception rather than asserting whole-tree immutability.

No source55/root/workspace gates were needlessly rerun. Independent A/combined review and broader parent-owned acceptance remain outside this bounded repair.
