# Independent audit: Code ZIP tracing ownership

Reviewed 2026-11-14 00:31 UTC on `gloin/ui-output-improvements`, HEAD `298bdec17dcd1603add549118a743e5cd494ba08` (shared dirty checkout).

## Verdict

**APPROVE the narrow tracing ownership repair. No blocking finding in the reviewed delta.** Configured tracing remains entirely runner-owned, including attempts for which retry policy intentionally disables recording. Absent/off policy is harness-owned. Actual retained traces contain generated-runtime navigation/network, snapshots, and screenshots; the intentional runtime failure preserves its original error, JSON, final screenshot, and runner failure attachments.

This is **not** approval of the full export gate, concurrent UI/lint changes, a final-source rebuild, CI artifact publication, or deployment. The existing built suite remains **5 passed / 1 CSS timeout**, with CSS-only timeout/secondary central-directory error unresolved and delegated separately. I did not rerun those expensive cases or edit application, tests, or configuration in the repository.

## Exact review boundary and source findings

Read `AGENTS.md`, the web-product-development skill, `export-tracing-ownership-fix.md`, actual installed Playwright implementation, and sibling scratch `export-tracing-evidence/tracing-only.patch`. No CODEX configuration or COLLAB files were present. Reviewed the worker's four-hunk tracing patch, not the entire parent export/UI feature diff.

- Current `test/e2e/export.visual.spec.js` SHA-256: `66c7392a3ae38025e3aec074d9b2d22d8f92fb43f2fada3e774a5c73d904fc62`.
- `git apply --reverse --check ../export-tracing-evidence/tracing-only.patch` exits 0. Independently reversing those hunks **in memory** reconstructs original SHA-256 `5044c7a750cbd01f43fa7a75a72a92863a76827b89cd12953911690208bf84c6`, matching the reproduction record.
- Delta only adds the public `testInfo` argument, reads `testInfo.project.use.trace` (string or object `.mode`), determines `ownsTrace`, moves manual start inside the diagnostic try, and guards stop with a successfully-started flag. No runtime assertions, thresholds, timeout, application behavior, or global config change occurs in this patch.
- Lines 255–261 deliberately use configured policy, not whether a recording happens to be active on this retry. All non-off named modes leave start/stop to Playwright. This is essential for `on-first-retry`, `on-all-retries`, and `retain-on-first-failure`: manually filling their non-recording attempts would defeat policy.
- Lines 332–336 start manual tracing inside the existing try and set the flag only after successful start. Lines 369–385 save cleanup dimensions/JSON before optional screenshot/trace, catch screenshot failure, stop only successful manual recording, and close the static server in nested finally. Runner-owned tracing is never stopped by this harness.
- Installed Playwright **1.59.1**, `node_modules/playwright/lib/index.js:604–605,669–695`, instruments explicit `browser.newContext()` contexts. `lib/worker/testTracing.js:64–77,80–89,131–137` resolves recording and retention across retries. This supports the diagnosis of the original double-start rather than a generated-runtime defect.
- `git diff --check -- test/e2e/export.visual.spec.js` exits 0.

## Independent real-browser configured-mode experiment

Created only external scratch probes at:

`/home/agent/.hermes/profiles/gloin/cache/scratch/export-tracing-independent-probe/`

The lightweight spec copies the actual ownership declarations verbatim from the reviewed spec, creates a real explicit browser context, exercises guarded manual start/stop, navigates to a labeled data page, writes per-attempt ownership JSON and screenshot, then closes context. It intentionally fails attempts 0 and 1 and succeeds at retry 2. It is a lifecycle/policy experiment, **not** an export acceptance test or an edited repository test.

Executed from repository:

```sh
npx --yes --package=node@20 -c 'node --version && node node_modules/@playwright/test/cli.js test --config ../export-tracing-independent-probe/playwright.config.mjs'
```

Node **v20.20.2**, one worker, retries 2, exit **0**, elapsed **185146.714 ms**. Playwright accurately reports **15 flaky / 0 unexpected**, because all first two attempt failures are deliberate. Python validated **45 attempts**, the exact ownership flags, manual ZIP existence, expected runner trace attachment presence/absence, CRC integrity, and actual labeled `goto` event in every retained ZIP. This is not presented as 45 passing export tests.

| Configured mode | Representations exercised | Manual trace attempts | Runner trace retained attempts (0 fail, 1 fail, 2 pass) |
| --- | --- | --- | --- |
| absent | omitted setting | 0, 1, 2 | none |
| off | string and `{ mode }` object | 0, 1, 2 | none |
| on | string and object | none | 0, 1, 2 |
| retain-on-failure | string and object | none | 0, 1 |
| on-first-retry | string and object | none | 1 |
| on-all-retries | string and object | none | 1, 2 |
| retain-on-first-failure | string and object | none | 0 |
| retain-on-failure-and-retries | string and object | none | 0, 1, 2 |

Totals: **9 manual traces, 24 runner traces, 12 intentionally untraced attempts**. Object policies also specify screenshots/snapshots/sources, exercising real option-object handling rather than just a standalone boolean expression. Retained outputs: `run.log`, `results.json`, `validated-summary.json`, external spec/config/package boundary, per-attempt JSON/screenshots/manual ZIPs, and runner artifacts. Deprecated `retry-with-trace` alias was inspected in installed normalization but not separately executed; it remains non-off and therefore runner-owned. Invalid configuration values are not an acceptance contract.

## Independent inspection of original export evidence

Evidence root:

`/home/agent/.hermes/profiles/gloin/cache/scratch/export-tracing-evidence/`

Independently hashed **all 469 entries** in `evidence-sha256.json`: **zero missing files or SHA-256 mismatches**. Parsed actual `results.json`, inspected CRC and JSONL trace contents, compared archived/extracted generated `animation.js` byte-for-byte, and checked final screenshot files. These are verified existing runs, not claimed as fresh export executions by this reviewer.

| Evidence | Actual result / independent checks |
| --- | --- |
| `reproduce/results.json` | Original Code ZIP fails at 20696 ms with `tracing.start: Tracing has been already started`; two screenshot attachments and runner trace exist. |
| `source/results.json` | Fixed trace-off Code ZIP passes at **55123 ms**. Custom `source/exports/code-runtime-trace.zip` is CRC-valid, **246 entries**, **94 frame snapshots**, **239 screencast frames**, **52 network events**, and navigation to extracted `BitmapForge-export/index.html`. Network includes generated `animation.js` and `engine/SceneManager.js`. JSON contains **21 dimensions / four meaningful-frame metrics**, empty runtime errors/failed requests, cleanup backing/rendered/container **640×360**. Generated JS byte equality holds; final screenshot exists. |
| `built/results.json` | Code ZIP passes at **66484 ms** within original **90000 ms** CI-equivalent budget. Same **21 dimensions / four metrics**, no runtime errors/failed requests, byte-identical generated JS. No manual Code ZIP trace and no passing-test runner trace are retained, as required by `retain-on-failure`. Full suite remains five passed / CSS timed out. |
| `failure-probe-fixed/results.json` | Explicit fault-injection run fails at **45519 ms** with exactly `intentional Code ZIP diagnostics probe` at external spec line 341, after initial sizing and meaningful frame. JSON has **five dimension records**, canvas metric and cleanup **1280×800**; errors/failed requests remain empty. Custom final screenshot exists and was visually inspected: substantial pale-green dithered geometry on black, not an empty canvas. Two runner PNGs, error context, and trace attachments exist. No duplicate manual trace is produced. |

The intentional-failure runner ZIP is:

`failure-probe-fixed/playwright/export.visual-Export-visua-98398-renders-3D-scene-in-browser/trace.zip`

It is CRC-valid with **241 entries**, **43 frame snapshots**, **227 screencast frames**, and **62 network events**. Trace contains both the app navigation and extracted runtime navigation at `http://127.0.0.1:42679/BitmapForge-export/index.html`, requests for generated `animation.js` and `engine/SceneManager.js`, and an `error` event carrying the intentional failure and exact external source location. This proves retained evidence covers the generated runtime and failure, not merely setup before the former double-start.

Diffed external fault spec against current repository spec: only two utility imports become absolute file URLs and one intentional throw is added after `meaningfulFrame('canvas')`; external `package.json` supplies ESM boundary. The first failed probe's import setup error is not confused with this valid runtime probe. Neither intentional probe is counted as an export acceptance pass.

## Limits / nonblocking observations

- Failure safety is bounded to the existing diagnostic try/finally. Failures in upload/download/extraction or before that block do not gain custom runtime JSON from this patch; runner attachments still follow configured policy. No broader cleanup refactor is implied.
- JSON filesystem write failure can prevent subsequent custom screenshot/manual stop, and catastrophic context loss or hard timeout cannot guarantee every custom artifact. These are existing limitations, not introduced regressions. This review verifies ordinary post-navigation assertion/intentional failures; it does not claim process-crash durability or inject filesystem failures.
- Manual start failure now reaches diagnostic finally with `manualTraceStarted === false`, so no unmatched stop is attempted (source inspection). A real start-failure injection was not run.
- Existing evidence proves source and prior immutable built-snapshot behavior separately. The source run uses its existing 180000 ms source-config budget; only built Code ZIP establishes the 90000 ms budget result. No claim is made about a future build of concurrent UI/lint edits.
- CSS-only timeout/central-directory investigation is separate. Nothing in this approval clears that full-suite blocker or attributes it to load/archive corruption.

Only this repository audit document was created by the reviewer. All experiments/artifacts are external scratch; no reset, stash, staging, commit, push, remote operation, build, or deployment was performed.
