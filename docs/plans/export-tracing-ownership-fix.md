# Code ZIP tracing ownership repair

## Scope and design

Own only the Code ZIP diagnostic harness in `test/e2e/export.visual.spec.js`. No exporter/runtime, other format, application, global configuration, assertions, or budget edits. Existing CI enables `retain-on-failure`; installed Playwright's `ArtifactsRecorder.didCreateBrowserContext` instruments even explicit `browser.newContext()` contexts (`node_modules/playwright/lib/index.js:604–605,669–695`). The unconditional `context.tracing.start()` is therefore a test instrumentation ownership defect, not a newly identified source runtime defect.

Use the public `testInfo.project.use.trace` setting (string or options object): configured runner tracing has sole lifecycle ownership, including retry/retention policy; absent/off tracing gives the Code ZIP harness sole ownership of its explicit diagnostic trace. Never inspect private tracing state, catch an AlreadyStarted exception, stop runner-owned tracing, or disable CI tracing. Start a manually owned trace inside the existing diagnostic `try/finally`; track successful start before stopping it. Preserve JSON, dimensions, screenshot metrics, final screenshot, requestfailed/error listeners, and original generated JavaScript equality assertion. Runner trace-on failure artifacts remain under Playwright output rather than a duplicate `code-runtime-trace.zip`.

## Acceptance / execution plan

1. Reproduce the unchanged Code ZIP failure with CI tracing on against the prior immutable built snapshot, recording its original error/trace/screenshots. Do not rebuild dist.
2. Apply narrow trace ownership fix and run isolated source Code ZIP with source config (trace off). Confirm custom trace plus JSON/screenshots and all original runtime size/rendering assertions.
3. Run all six built-app cases using `.github/ci/playwright.config.js` with only external port/output/absolute-path isolation overrides. Keep original 90-second test timeout, tracing/screenshot policy, one worker, retries, launch flags, thresholds, and assertions.
4. Re-fetch/hash all 35 served snapshot files against the prior dist manifest and verify snapshot/repository dist unchanged. This accepts the harness only, not subsequent concurrent source lint edits or their future rebuild.
5. Hand off actual results and narrow diff for mandatory independent review by parent; no self-approval or deployment claim.

## Results — tracing repair verified; full built gate remains RED

Node **20.20.2**, Playwright **1.59.1**. All commands used `npx --yes --package=node@20 -c 'node --version && node node_modules/@playwright/test/cli.js test --config <external-config>'` (targeted runs add `--grep`). No build, application edit, CI edit, timeout increase, assertion change, retry, reset/stash, commit, push, or deployment by this worker.

| Run                                                       | Result                                                                                                                                                                        | Evidence subdirectory  |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Original Code ZIP, built CI trace policy                  | Reproduced `tracing.start: Tracing has been already started`, 20696 ms; runner trace and two screenshots retained                                                             | `reproduce/`           |
| Fixed Code ZIP, isolated source runner, trace off         | PASS, 55123 ms; valid custom trace ZIP, runtime JSON, metrics/screenshots                                                                                                     | `source/`              |
| Fixed full built CI-equivalent suite                      | **5 passed, 1 failed**, 390897 ms total; CSS exceeded original 90000 ms budget                                                                                                | `built/`               |
| CSS-only built reproduction, one worker, unchanged budget | FAIL, 90000 ms timeout reproduced (91473 ms including cleanup); secondary ZIP central-directory error; screenshots/error context retained, no final trace attachment produced | `built-css/`           |
| Fixed Code ZIP external fault injection, CI trace policy  | Expected intentional failure after initial rendering; valid runner trace, two runner screenshots, runtime JSON/dimensions and custom final screenshot retained                | `failure-probe-fixed/` |

The fault injection uses an external copy of the spec, adds only an intentional throw after the initial meaningful-frame assertion (plus absolute utility imports/ESM package boundary), and is **not** an acceptance result or repository change. An initial probe could not resolve `file:` utility imports under an external CommonJS boundary; `failure-probe/` preserves that setup failure. Adding external `package.json` with `type: module` resolved it. No repository code was changed for the probe.

### Full built results

| Case                  | Status   | Duration ms                             |
| --------------------- | -------- | --------------------------------------- |
| Model-upload baseline | PASS     | 12687                                   |
| APNG                  | PASS     | 87325                                   |
| Sprite Sheet          | PASS     | 31063                                   |
| Code ZIP              | **PASS** | **66484**                               |
| CSS ZIP               | TIMEOUT  | 102176 (includes post-timeout teardown) |
| Video                 | PASS     | 68355                                   |

Code ZIP now reaches and passes every original initial/viewport/container/hidden/revealed size, stable-frame, meaningful-content, no-error, no-failed-request and byte-identical generated-JavaScript assertion. Both source and built runs retain 21 dimension samples and four meaningful-frame metrics. The built container screenshot was visually inspected: visible green dithered cube geometry, not a blank canvas. Trace-on success intentionally has no standalone manual trace: runner `retain-on-failure` owns retention. The explicit fault probe verifies post-fix trace-on **failure** retention, JSON/dimensions and screenshots rather than merely assuming it.

CSS's historical blank-frame assertion flake was **not reported** in this full run: the recorded failure is a timeout while collecting the first frame after roughly 64 seconds awaiting download, 6.7 seconds navigation (including trace instrumentation), 5.7 seconds selector visibility and the existing 3-second delay. Both screenshots were ultimately written around teardown: frame 0 entropy 1.111539/non-background ratio .151340; frame 1 entropy 1.277681/ratio .182012. These retained frames do not make the timed-out test a pass. Its trace is retained in `built/playwright/`; per-call timings are in `built/css-trace-analysis.json`. The CSS-only original-budget rerun also timed out, so do not attribute this solely to suite ordering/concurrent load or claim all-six clearance. Its additional central-directory error has not been diagnosed; do not label the generated CSS archive corrupt from that message alone. No CSS implementation, test, threshold, or budget was changed. **Unresolved CSS gate remains a parent-owned blocker.**

### Provenance, evidence, and review boundary

- Used the prior worker's immutable `built-export-evidence-final/dist/` snapshot, not a rebuild: all **35 files** fetched over HTTP and SHA-256 matched for each built/probe run. Original repository dist and snapshot remained unchanged before/after every run. Prior manifest SHA-256 remains `44d0cff5a37590ce4c02ad4838025aac5a999cf417a736883deef79165c516ce`.
- Built external configs import unchanged `.github/ci/playwright.config.js` and override only isolated localhost port/output locations, absolute testDir/cwd resolution, preview outDir pointing to the prior snapshot, and add a JSON reporter. They retain **90000 ms**, one worker, retries 0, forbidOnly, original launch flags, trace `retain-on-failure`, screenshot `only-on-failure`, strict port/no reuse/30000 ms startup. These are CI-equivalent isolation overrides, not the literal CI command.
- Source imports unchanged `playwright.export.config.js` (its pre-existing 180000 ms budget and trace-off policy); actual app URL is `http://127.0.0.1:45391` per resolved config. Source config itself supplies isolated Vite cache, HMR off and artifact output. This source success does not replace the 90000 ms built gate.
- Evidence root: `/home/agent/.hermes/profiles/gloin/cache/scratch/export-tracing-evidence/`. Every run has actual `run.log`, `results.json`, config, provenance, downloads/diagnostics as produced; built runs include `served-identity.json`. `validation.json` verifies valid custom/runner trace ZIPs, runtime equality, cleanup JSON, screenshot existence, and all owned servers stopped. `evidence-sha256.json` hashes retained evidence.
- `tracing-only.patch` is the exact worker delta, isolated from earlier parent export improvements. Reverse-applying that delta in memory reconstructs the reproduced original spec SHA-256 `5044c7a750cbd01f43fa7a75a72a92863a76827b89cd12953911690208bf84c6`. Fixed spec SHA-256 is `66c7392a3ae38025e3aec074d9b2d22d8f92fb43f2fada3e774a5c73d904fc62`.
- Dedicated ESLint, Prettier check, and spec `git diff --check` passed. This plan is **Git-ignored by the existing repository rules** and must be explicitly included in review/handoff; no force-add/staging performed.
- Orchestration/inspection/validation scripts are sibling scratch `verify-export-tracing.py`, `inspect-export-tracing.py`, `finalize-export-tracing.py`. This worker also extended the active-profile web-product-development tracing lesson with the verified ownership/fault-probe workflow.
- **Independent review still required after handoff.** Review the narrow patch and lifecycle/evidence against both runner policies. This is harness acceptance against pre-lint dist only: it does not approve concurrent UI lint source edits, the parent's later rebuild, the unresolved CSS gate, CI artifact publication, or deployment.
