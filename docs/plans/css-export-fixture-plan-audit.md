# Independent audit: bounded CSS export spatial fixture

## Decision

**Approve a narrowly bounded test-only repair, subject to the binding implementation and verification conditions below. This is plan approval, not gate clearance.** Keep the native full application at desktop **1280×800 / DPR 1**, constrain only the CSS case's actual observed preview container to **384×320**, and retain the full default **181-frame, 11283.185307179585 ms single-loop** animation. Do not shrink the shared viewport or change production export behavior.

The existing evidence justifies removing accidental spatial workload from this semantic visual gate. It does not establish a corrupt application ZIP, a precise Playwright write/merge race, or a production performance fix. Final implementation and repeated/current-source acceptance remain outstanding.

## Reviewed identity and evidence

- Checkout: `gloin/ui-output-improvements`, HEAD `298bdec17dcd1603add549118a743e5cd494ba08`, already dirty. Other workers' app/component/config/test edits were present and are not owned or approved by this audit. Root `AGENTS.md` and `web-product-development` skill read; no `COLLAB/` or root `CODEX.md`/`.codex` found.
- Read `docs/plans/css-export-gate-investigation.md`, actual `test/e2e/export.visual.spec.js`, `src/app/components/PreviewCanvas/PreviewCanvas.jsx`, relevant Layout/SceneManager ownership, `src/app/utils/cssExport.js`, and all three relevant runner configurations.
- Read the actual external generator `../css-bounded.py`, generated `../css-gate-evidence/bounded-targeted/config.mjs`, log and JSON result, plus shared setup in `../css-investigate.py` and archived artifact analysis.
- Independently opened original and bounded downloaded archives using Python `zipfile`, ran CRC checks (`testzip(): None` for both), counted **181** CSS position stops in each, read their loop durations, and inspected PNG IHDR dimensions. Original is **894×726 → 5364×22506**; bounded is **384×320 → 2304×9920**. Both contain CSS, sprite PNG and README. Parsed bounded result directly: **passed, 20447 ms**. Existing deep-decode evidence reports 181 distinct cells and 176 meaningful cells for each; this audit did not independently repeat that full pixel decode.
- Calculated bounded atlas buffer: **87.1875 MiB RGBA**, versus the investigation's approximately 460.519 MiB original atlas. Neither number is measured peak RSS. The smaller fixture remains a real multi-row atlas and substantial software-rendered export, not a one-frame mock.

### Important limits of the successful external experiment

The successful experiment was **not** simply a small browser viewport. It kept `setupApp`'s 1280×800 context and, **after upload/setup completed**, set inline width/height on `Preview` canvas's **second ancestor**, then polled that role-scoped canvas's backing dimensions to `[384,320]`. The first document canvas was the 120×120 rotation gizmo; earlier failures targeted the wrong element/ancestor.

It also installed Canvas2D/WebGL method timing wrappers and a `toBlob` wrapper via `addInitScript`, and added phase logs. Those diagnostic mutations must **not** be copied into the minimal repository fix or mistaken for uninstrumented acceptance. The copied spec retained the original CSS assertions, full animation and original 90-second built-runner policy, but it ran an older immutable built snapshot, not a new final-source build. Only one successful bounded execution is evidenced; the approval-pending repeat is not a result.

The experiment therefore supports feasibility. It does not already validate the proposed pre-upload placement, repeated stability, final-source identity, or all-six acceptance.

## Binding minimal implementation contract

### Ownership / allowable diff

Implementation owner may change **only `test/e2e/export.visual.spec.js`** for this repair. Coordinate exclusive ownership of this shared file before editing, since it already has earlier changes. This audit owns only this audit document. The concurrent historical-lint worker owns component cleanup; no overlap is authorized.

Allow only: an opt-in setup argument and small named preview-sizing helper; one CSS-only opt-in call; CSS archive/geometry/coverage assertions and compact evidence output. Do not edit application components, engine/exporters, generated embed/dist, dependencies, CI, runner config, image metrics or other test bodies. No unrelated tracing or cleanup refactor is required. Existing original errors must remain failures.

### Concrete geometry and timing placement

1. Keep shared context creation exactly at **1280×800, deviceScaleFactor 1**. Extend `setupApp(browser, { previewSize } = {})` (or an equivalent explicit default-off option). Only the CSS test passes `{ previewSize: { width: 384, height: 320 } }`; the other five call sites remain unchanged and take the original path.
2. After app navigation and **before `setInputFiles(VISUAL_STL)`**, if opted in, resolve the canvas inside `getByRole('region', { name: 'Preview' })`. Wait for attachment and require exactly one canvas in that region. Never use document-first-canvas selection.
3. Name/document the observed-container helper. Current source hierarchy is canvas → BitmapEffect DOM wrapper → `PreviewCanvas`'s `containerRef` element. SceneManager appends the wrapper there; PreviewCanvas's ResizeObserver observes that element, not the bordered outer wrapper. Guard the ancestor relationship and containment in the Preview region before setting only that container's inline width/height to 384px/320px. Fail clearly if the hierarchy changes rather than silently modifying the gizmo, outer border box, or all canvases. No production test ID/API is needed for this bounded repair.
4. Poll the **same preview canvas**, not a different locator, for actual backing `[384,320]` and rendered/client dimensions `[384,320]`; confirm the observed container content/client size is `[384,320]`. Keep the existing native model upload, loading-status wait and initial-render wait. Repeat the size assertion after upload and immediately before CSS export so asynchronous initialization cannot undo the fixture.
5. Assert desktop viewport remains 1280×800/DPR 1, preview is visible, and the actual `CSS Anim` / `Export CSS Anim` controls remain visible and actionable via normal Playwright clicks. Do not use forced clicks, drawer manipulation or viewport 384×320: Layout switches settings into a responsive drawer at narrow widths, so a small viewport is a different fixture, not an equivalent geometry setting.
6. Do not set canvas width/height directly, call manager/store/test hooks, resample captured frames, replace loaders/WebGL, mutate animation time/pose/scale, disable preview rendering, close the app before artifact playback, or alter CSS playback to fake the budget. Container layout must drive the normal ResizeObserver → SceneManager resize path.

Pre-upload sizing is a deliberate improvement over the successful post-upload experiment, not a measured fact about that experiment. If it fails, diagnose and obtain review for a bounded placement revision; do not silently broaden ownership or shrink global setup.

### Preserve coverage and prove output agreement

Retain every existing CSS assertion and behavior: original closed cube; full default fades/spin; download; extraction; second page in the same live app context; original 3000 ms show-phase wait and 600 ms advancing-frame separation; both `isBlank(analyzeScreenshot(...)) === false` checks; unequal screenshot buffers; no failed CSS responses, no CSS runtime errors, no app page errors; server cleanup and context closure. Do not lower thresholds or change shared metrics. Preserve the other five cases' original geometry, runtime quality and assertions, especially Code ZIP's 1280×800 initial, viewport/container resize and meaningful-frame checks.

Add positive CSS-local assertions using the real downloaded bytes:

- Load ZIP with CRC checking (`JSZip.loadAsync(zipBytes, { checkCRC32: true })`); require the actual CSS, referenced sprite PNG and README, and save the original archive unchanged.
- Require frame declarations **384×320**, **181 distinct keyframe stops**, six columns / 31 rows, background size **2304×9920**, and the original loop duration (numeric comparison with tight floating-point tolerance is appropriate). Validate the 181 positions in order against `[-(i % 6) * 384, -floor(i / 6) * 320]` and stop percentages against the current exporter rounding. Counting arbitrary percent tokens alone is insufficient. Do not import production generation code to manufacture the expected CSS.
- Decode the actual sprite with existing UPNG and require PNG **2304×9920**. This must agree with preview backing size and CSS cell/background declarations; no viewport-independent positive-width-only check.
- Require rendered `#anim` size **384×320** and computed background size/animation duration agreement before the unchanged screenshots. Preserve genuine browser CSS animation playback.
- Save a small CSS fixture evidence JSON with source preview/rendered size, viewport/DPR, archive bytes, frame count, loop duration, CSS/PNG atlas size and the two screenshot metrics. Do not add global browser monkey patches or a second trace owner.

The repeat/full-gate evidence must also decode all **181 real cells**, retain cell hashes and verify **181 distinct cells**. This can be a separate post-run artifact verifier to keep the test patch small. Ignore unused trailing atlas slots. Do not require every fade-boundary cell to pass nonblank thresholds: the historical and bounded deep-decode evidence both report **176 meaningful cells**, with low-content fade endpoints expected. The two runtime screenshots must still pass the original nonblank criteria independently.

## Runner, trace and budget invariants

The acceptance runner is **`.github/ci/playwright.config.js`**, inheriting **90_000 ms, workers 1, retries 0**, desktop/DPR and original software-GL launch flags from `playwright.config.js`. Preserve `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`, strict built preview and `reuseExistingServer: false`. Test execution plus context/artifact finalization must complete normally; assertions passing before timeout is not a pass.

`playwright.export.config.js` currently uses **180_000 ms** and a development server. It is useful for developer checks but **cannot clear the original built 90-second gate**. Do not use it as acceptance, copy its timeout, add `test.setTimeout`, configure retries, relax worker/GL policy, disable tracing/screenshots, or report the diagnostic 180-second run as equivalent.

Explicit contexts are instrumented by the runner. The CSS case needs no manual tracing. Keep the existing Code ZIP trace-ownership implementation unchanged. If diagnosing a residual failure, record phase boundaries externally or with compact test diagnostics without patching Playwright, hiding errors or starting/stopping runner-owned traces. A separate, tiny external intentional-failure probe must demonstrate retained trace ZIP readability under the real trace-on policy; label its expected failure separately from acceptance and do not deliberately stress the original huge atlas to test tracing.

## Required verification before clearance

1. Independently audit the actual narrow implementation diff against this contract. Confirm no changes to other five calls/default geometry, shared metrics, production files or runner policies. Run the changed-file lint/format/diff checks separately and record their exits; do not absorb concurrent historical lint debt into this fixture repair.
2. Build from the current final integrated source with Node 20 (`npx --yes --package=node@20 -c '…'`). Preserve source identity/dirty-diff evidence and a complete built manifest. Serve immutable copied build output with strict unique port, isolated output/cache outside the served tree, and no server reuse. Verify every served file hash against that build manifest, not just entry HTML or an earlier snapshot.
3. Run **three separate isolated CSS executions** of the repository spec, each with a fresh server/context/output directory, **90-second** built policy, one worker, retries zero and retain-on-failure tracing unchanged. External isolation wrappers may change paths/port/report output only; use the actual repository spec, not an instrumented copied approximation. Retain JSON/logs and actual downloads/screenshots for each. Require each runner exit 0 and CSS result passed, including normal teardown. Post-verify CRC, CSS/PNG agreement, full loop and 181 distinct decoded real cells for each archive. Do not substitute `--repeat-each` in one long-lived server for the three isolated runs.
4. Run the **complete six-case built suite** on that same final-source build with unchanged 90-second per-test runner policy. Require exactly six passed results and runner exit 0; preserve original quality/geometry evidence for the other five cases. Verify its CSS archive too. If source changes after this build, rebuild/re-identify and rerun the affected final acceptance rather than claiming stale bytes represent final source.
5. Run/read back the separate trace-on intentional-failure evidence: expected nonzero probe exit, retained runner trace opens with CRC-valid ZIP and usable trace entries, plus its failure screenshot/report. It is not one of the six successes. A failure to finalize traces remains a blocker, not a reason to turn tracing off.

Any residual timeout, archive disagreement, missing trace, non-distinct full-loop cells, weakened metric, or changed unrelated geometry blocks clearance. Preserve failed evidence and investigate before proposing a broader repair.

## Root-cause wording and exclusions

The measured original workload plausibly exhausts the fixed budget across render/readback, artifact playback, runner instrumentation and finalization; different runs cross it at different boundaries. CRC-valid downloaded ZIPs and the runner's separate archive path contradict blaming the application's CSS ZIP for the central-directory message. A particular interrupted temporary trace file or write/close/merge race remains **unproven**. Do not assert one, patch Playwright internals, or declare production scalability resolved.

No application/test/config implementation was performed by this audit. No new browser acceptance runs were performed here; the existing result and artifacts were independently inspected. This document is the only repository write. No reset/stash/commit/push/deploy/remote operation was performed.
