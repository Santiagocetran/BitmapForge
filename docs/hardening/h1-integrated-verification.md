# H1 integrated verification

## Outcome and scope

**The frozen H1 regression now passes in Chromium and Firefox. The integrated verification gate is NOT fully green.** Each matching 33-case engine lane has **21 pass / 12 fail**, versus prior final **20 pass / 13 fail**. The only paired outcome change is `Q3.drag.D` fail→pass in each engine; there are no pass→fail changes among the matched cases. Existing built export checks pass **10/10**, including the requested original six and four existing complementary artifact cases.

Fresh root/workspace/decode/runtime/lint checks pass. Whole-tree formatting fails on **50 existing hardening documents**. Supplemental native H1 verification is **5 pass / 3 fail per engine**; the six failures are retained and must not be called full H1 browser acceptance. Their live-session sequencing differs from the frozen retired-sensor regression; attribution and unreached requirements are below. No source repair, harness assertion edit, install, policy relaxation, threshold/deadline increase, browser retry, commit, push or deployment occurred.

**Browser lane released.** All seven server attempts satisfy the existing strict exit/close predicate, and direct final readback finds no retained process identities or listeners. WebKit and manual/platform gaps remain blocked/unverified. This is verification, not whole-release approval.

## Exact target and evidence roots

All scratch paths below are under `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- `REPO=bitmapforge-research`, branch `gloin/release-hardening`, base `550842cab61002c7cc6563e50b9fcdeb17c9bf01` plus the accepted dirty working tree.
- `EVIDENCE=h1-integrated-20261115T180652Z` — command logs, source snapshot/inventories, immutable build, paired analysis, final verification and representative screenshots.
- `BUILD=EVIDENCE/immutable-candidate/dist` — fresh app/embed build, **35 files**, files read-only and directories nonwritable after freezing.
- `QA=bitmapforge-hardening-qa`.
- `RUN=QA/runs/h1-integrated-20261115T180652Z` — frozen preflights, Chromium/Firefox smoke, built Chromium exports, reports/traces/downloads and process observations.
- `NATIVE=QA/runs/h1-native-20261115T180652Z` — separately named native supplemental run. Its spec/config are `h1-native-verification/{native.spec.mjs,config.mjs}`, pinned by `NATIVE/identity.json`; they import existing helpers without editing them.
- `PRIOR=QA/runs/final-comparison-20261115T100646Z` — exact matching prior-final comparison target; not replaced by the older baseline.

The old `/home/agent/BitmapForge-hardening-research/integrated-candidate` is untouched. Its 35 dist entries and all **776** prior-final evidence manifest entries were rehashed without mismatch. All **104** preexisting repository output files are unchanged. The decode suite's literal `test-animation.apng` output was preserved before execution, retained separately and found byte-identical; original bytes/timestamps were restored.

### Source/build identity

| Identity                            | Value                                                              |
| ----------------------------------- | ------------------------------------------------------------------ |
| Binary dirty diff SHA256            | `24362588481f7b97a29b967de4477eb45350798ae29ae7440f095c95ff9549df` |
| Complete dist inventory file SHA256 | `33780ad579331b920fdc2bce101d0f9c7dd5d60679e6a8192b4ed81549ae88a2` |
| Frozen QA harness digest            | `4963e730deebf362202696610f6d3e38ec85af89a5f1730929f0d1fa0d5bbe42` |
| H1 ColorPalette source              | `1f985ea6b9f7794c916c1503f561ee994f5a9a89378fd69849cd7b57fe895cfe` |
| New built entry JS                  | `assets/index-BKDpitmq.js`                                         |
| Entry JS SHA256                     | `1c87a5aadc0783240035492a1201ecf74e23fd21e5f8c186872ffdf8581ae997` |

`source.diff`, `source-before.json`, `source-after.json`, `source-snapshot/`, `status.txt`, and `immutable-candidate/{source.diff,source-inventory.json,build-inventory.json}` preserve dirty and untracked identity. Final readback verifies all **434** entry-time source/config/document entries and all **93** inherited CLI canvas pins unchanged. The new report is additional documentation, not part of the entry-time inventory. No clean-base-only build identity or fabricated CI revision marker is used.

Server identities retain complete before/after dist equality and served-byte matches for index HTML, entry JS, Three.js and CSS. The frozen harness remains byte-identical; its lifecycle freeze remains checked by the collector. No source-server acceptance is substituted for built bytes.

## Toolchain and command gate ledger

Pinned Node: `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node` (**v24.22.3**). Pinned npm CLI: sibling `node_modules/npm/bin/npm-cli.js` (**11.21.2**). Successful lifecycle execution prepends sibling `node_modules/.bin` to PATH. Locked Playwright **1.59.1**; observed Chromium **147.0.7727.15**, Firefox **148.0.2**. Chromium uses `tooling-b-browser-execution/chromium-cache`; Firefox uses `QA/browsers/pw-1.59.1`. No browser/dependency installation occurred.

`EVIDENCE/gates.json` stores each literal argv, start/end, exit and separate log. Commands below run from REPO; `NODE` and `NPM` denote the absolute executables above.

| Gate                                         | Actual command                                            |  Exit | Result / evidence in EVIDENCE                                                                           |
| -------------------------------------------- | --------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------- |
| Node/npm identity                            | `NODE --version`; `NODE NPM --version` (separate records) | 0 / 0 | `node-version.log`, `npm-version.log`                                                                   |
| Runtime policy                               | `NODE --test .github/ci/node-runtime.test.mjs`            |     0 | 6 passed; `runtime.log`                                                                                 |
| Root                                         | `NODE NPM test -- --max-workers=50%`                      |     0 | 62 files / 889 tests passed; `root.log`                                                                 |
| Embed workspace                              | `NODE NPM test --workspace @bitmapforge/embed`            |     0 | 2 files / 23 tests passed; `embed-tests.log`                                                            |
| CLI workspace                                | `NODE NPM test --workspace @bitmapforge/cli`              |     0 | 146 passed / 48 skipped; `cli-tests.log`                                                                |
| Decode/archive                               | `NODE NPM run test:export`                                |     0 | 3 files / 66 tests passed; `decode.log`                                                                 |
| Root lint                                    | `NODE NPM run lint`                                       |     0 | `lint.log`                                                                                              |
| Whole-tree format                            | `NODE NPM run format:check`                               | **1** | 50 named hardening documents; full list in `format.log`, no source-format diagnostics                   |
| Diff whitespace                              | `git diff --check`                                        |     0 | `diff-check.log`                                                                                        |
| Original app/embed build attempt             | `NODE NPM run build`                                      | **1** | Nested npm PATH-wrapper failure; `app-embed-build.log`                                                  |
| Diagnosed build attempt, corrected PATH only | `NODE NPM run build`                                      |     0 | `build-corrected-path.json`, `app-embed-build-corrected-path.log`                                       |
| SDK identity/size/alias                      | Byte comparisons, gzip and literal alias scan             |  pass | 46,462 gzip bytes ≤51,200; package/public/app bundles identical; no `@engine` leakage; `sdk-check.json` |

The failed build selected npm's shell wrapper from `npm/bin`, which inferred nonexistent `node/bin/node_modules/npm/bin/npm-prefix.js` from standalone Node. Existing `.bin/npm` resolves to the sibling JS CLI. Only this diagnosed blocked build was retried with corrected PATH; the original failure remains visible. No package/source workaround was made. Fresh app build runs the real prebuild/embed build and copy before Vite app compilation.

CLI's skipped opt-in integration rows are not newly accepted. The independently accepted fourteen real CLI artifacts remain accepted on their original evidence and unchanged pins; F01–F11, legacy P11 and complete CLI lifecycle acceptance are not inferred from these unit results.

## Frozen browser execution and exact pair delta

One attempt per lane, serial order: Chromium preflight → Chromium smoke → existing built Chromium artifact lane → Firefox preflight → Firefox smoke. All retain 90-second tests, zero retries, worker1, original flags/launch bound, fresh contexts and runner-owned retain-on-failure tracing. Existing per-test contracts are unchanged.

| Lane                         | Discovered / reported | Exit | Outcomes          |
| ---------------------------- | --------------------- | ---: | ----------------- |
| Chromium preflight           | 1 / 1                 |    0 | pass              |
| Chromium smoke               | 33 / 33               |    1 | 21 pass / 12 fail |
| Built Chromium artifacts     | 10 / 10               |    0 | 10 pass           |
| Firefox preflight            | 1 / 1                 |    0 | pass              |
| Firefox smoke                | 33 / 33               |    1 | 21 pass / 12 fail |
| Native Chromium supplemental | 8 / 8                 |    1 | 5 pass / 3 fail   |
| Native Firefox supplemental  | 8 / 8                 |    1 | 5 pass / 3 fail   |

Collector exit0 means collection completed, not that failed gates passed. Every actual case has one result at retry0. `EVIDENCE/exact-case-pair-delta.json` retains all **99 exact engine/case pairs**, prior/current errors and evidence pointers: **40 pass→pass, 24 fail→fail, 2 fail→pass, 33 blocked→blocked**. WebKit's 33 candidate cells are explicitly **unexecuted prerequisite-blocked** by retained missing `libwoff2dec.so.1.0.2`; no new WebKit preflight is invented. Frozen reducer outputs in RUN are retained literally and not rewritten into this comparison.

| Case             | Chromium prior final→candidate | Firefox prior final→candidate |
| ---------------- | ------------------------------ | ----------------------------- |
| Q1.image.D       | fail→fail                      | fail→fail                     |
| Q1.image.N       | fail→fail                      | fail→fail                     |
| Q1.model.D       | pass→pass                      | pass→pass                     |
| Q1.model.N       | pass→pass                      | pass→pass                     |
| Q1.shape.D       | fail→fail                      | fail→fail                     |
| Q1.shape.N       | pass→pass                      | pass→pass                     |
| Q1.text.D        | fail→fail                      | fail→fail                     |
| Q1.text.N        | fail→fail                      | fail→fail                     |
| Q2.N             | pass→pass                      | pass→pass                     |
| Q2.S             | pass→pass                      | pass→pass                     |
| Q3.drag.D        | fail→pass                      | fail→pass                     |
| Q3.drag.M        | pass→pass                      | pass→pass                     |
| Q3.edit.D        | pass→pass                      | pass→pass                     |
| Q3.edit.M        | pass→pass                      | pass→pass                     |
| Q4.continuity.D  | pass→pass                      | pass→pass                     |
| Q4.export.D      | pass→pass                      | pass→pass                     |
| Q5.host.D        | pass→pass                      | pass→pass                     |
| Q5.host.N        | pass→pass                      | pass→pass                     |
| Q5.late-export.D | pass→pass                      | pass→pass                     |
| Q5.late-export.N | pass→pass                      | pass→pass                     |
| Q5.project.D     | pass→pass                      | pass→pass                     |
| Q5.project.N     | pass→pass                      | pass→pass                     |
| Q6.H             | pass→pass                      | pass→pass                     |
| Q6.M             | pass→pass                      | pass→pass                     |
| Q6.R             | pass→pass                      | pass→pass                     |
| Q6.S             | pass→pass                      | pass→pass                     |
| Q7.A             | fail→fail                      | fail→fail                     |
| Q7.E             | fail→fail                      | fail→fail                     |
| Q7.H             | fail→fail                      | fail→fail                     |
| Q7.I             | fail→fail                      | fail→fail                     |
| Q7.L             | fail→fail                      | fail→fail                     |
| Q7.N             | fail→fail                      | fail→fail                     |
| Q7.X             | fail→fail                      | fail→fail                     |

### Surviving frozen failures

- `Q1.shape.D`, `Q1.text.D/N`, both engines: the unchanged meaningful-preview occupancy/colors/entropy gate fails. Real sparse pixels are not automatically blank rendering; no quality floor was lowered.
- `Q1.image.D/N`, both engines: `assertImageCancel` at `repair-contracts.mjs:314` still requires invitation=true. Prior and current evidence retain the previously identified pre-action invitation=false mismatch. These remain failures, not demonstrated new H1 regressions; later return-to-cube assertions remain unreached.
- All seven `Q7.*` states in both engines: the same named-main/navigation supplemental semantic policy fails. The app's main is unnamed and Editor tasks is a group, not navigation. These are supplemental-policy findings, not axe violations.
- All 14 axe scans complete, preserve matching 69-rule manifests and report zero violations. Incompletes remain manual-unverified: aria-hidden-focus, aria-prohibited-attr, aria-valid-attr-value, color-contrast and label-content-name-mismatch. Zero scanner violations does not clear Q7 or establish conformance.
- Smoke diagnostics contain zero unexpected runtime/transport-error records. Original expected injected failures and warnings remain recorded.

`Q3.drag.D` now reaches the post-collapse/reveal unpressed and exact-order assertions on both engines. This clears that frozen historical regression only; it does not add the frozen case's missing third-pickup armed assertion. Q5 H2 notice cases remain passes in both engines. Full default APNG downloads and decoded show-phase evidence remain under each engine's `Q4.export.D` diagnostics/downloads.

## Native H1 supplemental results and concrete blocker

The separately named external spec uses real installed browsers, built app, native keyboard/mouse operations and unchanged existing helpers, without production/store/sensor monkey patches. It was executed once per engine and not edited afterward.

| Supplemental case     | Chromium | Firefox |
| --------------------- | -------- | ------- |
| H1.drop-keyboard.D    | passed   | passed  |
| H1.drop-pointer.D     | passed   | passed  |
| H1.escape-fresh.N     | passed   | passed  |
| H1.escape-task-hide.N | passed   | passed  |
| H1.history-Enter.D    | failed   | failed  |
| H1.history-Space.D    | failed   | failed  |
| H1.pointer-active.D   | failed   | failed  |
| H1.pointer-pending.D  | passed   | passed  |

Passing cases establish pending-pointer retirement followed by beyond-threshold movement/up and usable fresh keyboard pickup, genuine spatial keyboard and mouse reorder/drop with moved-item focus across two frame boundaries, and fresh/history-dependent narrow first-Escape cancellation with retained Settings/handle focus followed by second-Escape dismissal. These use actual geometry, not jsdom rectangles.

**Six supplementary failures are not silently reclassified as product regressions or successes:**

1. `H1.history-Enter.D` and `H1.history-Space.D` fail in each engine at spec line17. After a second asserted-active keyboard pickup and ArrowRight, the spec programmatically focuses Motion and presses Enter/Space while the live drag still owns those keys. Motion never opens. Retained snapshots show Look selected, a completed drop over color-2 and Edit color3 focused. Installed dnd-kit explicitly treats Enter/Space as live drag end keys (`core.esm.js:1098–1101,1191–1193`). This sequence does **not** establish stale retired-sensor interference; it exposes a supplemental live-session assumption requiring contract-specific follow-up.
2. `H1.pointer-active.D` fails in each engine at line28. The spec keeps the mouse down during an asserted-active pointer drag, programmatically focuses Motion and presses Enter; Motion remains focused but Look remains selected and the drag stays pressed. Native pointer sensors capture clicks while active (`core.esm.js:1504–1508`); this keyboard-generated click supplies no Layout pointerdown-capture barrier. It is a mixed-input live-session observation, not proof that the intended parent-pointerdown cancellation barrier failed.

The failures prevent later assertions from running: post-retirement native rail Enter/Space, the supplemental third asserted-active pickup/collapse/reveal history, final preserved root/controller/canvas and palette name/browse identities, final saved-settings equality, and immediate active-pointer parent-capture click delivery. Those requirements remain **unverified**, despite the frozen regression and independent drop/narrow tests passing. Do not declare full H1 browser acceptance from the improved smoke count. No source fix or assertion relaxation was attempted; all six failure traces, screenshots and exact errors are retained. See `native-failure-attribution.json` and `native-results.json`.

## Real artifacts, screenshots and cleanup

The existing built lane's original six checks (loaded app, APNG, sprite sheet, Code ZIP runtime, CSS ZIP animation, video) all pass. Four existing complementary cases also pass: GIF animation, React archive settings, Web Component archive settings, Embed runtime/source restrictions. All actual downloads and decode/runtime evidence are retained under `RUN/final/built-chromium/chromium/a01`; their complete literal results are copied to `EVIDENCE/built-results.json`.

`EVIDENCE/representative/` contains actual retained screenshots, not mockups:

- `desktop-loaded.png`: visibly substantial dithered green cube artwork, full desktop source inspector and header; visually inspected with no apparent outer clipping.
- `mobile-loaded.png`: visibly substantial cube, stacked header controls, saved notice and bottom Open settings/Export controls; no modal hiding the artwork. Visually inspected.
- `mobile-palette-first-escape.png`: real history-dependent narrow palette after first Escape.
- `desktop-spatial-drop.png`: real pointer reorder outcome.

`representative-screenshots.json` maps copies to exact originals and SHA256. `screenshot-inventory.json` inventories **266 physical PNG files** in browser runs (including report copies), not 266 distinct acceptance states. `trace-integrity.json` verifies CRC integrity of all **30 retained failure trace ZIPs**: 24 smoke and six native failures. Passing cases retain no trace under the unchanged policy.

At `2026-11-15T18:33:01.469355+00:00`, direct `/proc` PID/startTicks readback checked **408 retained identities**, including zombie presence: none remain. All seven server records satisfy actual child exit AND close, code0/null signal, closeCompleted and no close error/timeout. All seven short owned TMPDIRs are removed. Ports5291/5292/5293 have no records/listeners at final readback. No emergency reap occurred. `final-verification.json`, per-attempt completion files and process JSONL preserve this proof; browser lane is released.

## Reproducibility, remaining gates and changed files

External one-shot collectors: `h1-verify-broad.py`, `h1-verify-build.py`, `h1-verify-browser.py`, `h1-verify-native.py`; offline analyzer: `h1-verify-analyze.py`. Do not rerun one-shot collectors into their existing output roots. Exact command/environment records are preserved in EVIDENCE, RUN and NATIVE. Their final `evidence-sha256.json` inventories pin retained files; the source/build snapshot is separate from operational source drift.

Unresolved: the 24 retained smoke failures, 50-document format gate, six supplemental native failures/sequence attribution and their unreached native H1 assertions, WebKit native prerequisite, real assistive technology/manual scanner incompletes, physical Safari/mobile/touch, actual browser-menu zoom and destructive lifecycle R04's previously unobserved during-close window. None is waived here. A focused follow-up should reconcile the native live-session versus post-retirement contract before any new harness or source change; the old failures must remain intact.

Only this repository report was created. No repository source/test/harness/contracts/dependencies were edited. Generated app/embed outputs were freshly built and separately frozen; all old source/evidence bytes named above remain verified. New external evidence/collector/supplemental files and a profile-scoped toolchain lesson were added. No remote actions were taken.
