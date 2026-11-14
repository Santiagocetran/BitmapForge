# Historical JSX lint cleanup — independent implementation audit

## Verdict and boundary

**ACCEPT H01–H14 production cleanup and the final PresetGallery query-cost repair. CHANGE required before claiming the combined browser gate green:** the existing native Load keyboard browser test reproducibly loses the first filechooser event. No historical production defect was found; the browser issue is outside the nine-file cleanup and must return to the UI/browser owner.

Audited branch `gloin/ui-output-improvements`, HEAD/base `298bdec17dcd1603add549118a743e5cd494ba08`, with other owners' concurrent uncommitted work. Read AGENTS.md, the cleanup plan, binding plan audit, and implementation handoff. Inspected production diffs, actual untracked tests/local validators, and final query-fix handoff/delta. This reviewer changed no application, test, configuration, build or generated repository file. Only this audit document is owned here. External diagnostics and evidence use the parent scratch directory (`historical-audit-*`). No reset/stash/commit/push/deploy/remote action.

This is bounded cleanup acceptance, not full UI/export/build/release approval. Parent retains final combined verification after other owners' fixes.

## Source and contract review

- **H01/H11/H12:** ErrorBoundary children, InfoTooltip content and provider children bind the actual shared `renderableChildren`. Direct production-validator calls accept the agreed nullish/scalar/element/fragment/nested-array set and reject objects/functions/symbols/bad nested entries. This is intentionally not every ReactNode. ErrorBoundary preserves the class fallback/retry, including opaque throwing descendants and narrowly asserted expected logging. Provider initial null, stable ref identity, separate providers, assignment/read and outside-provider rejection remain covered. Tooltip keeps string labels and non-string `More info`, real Radix focus content and a restored local ResizeObserver stub.
- **H02:** compact binds optionalBoolean, including nullish acceptance; chooser, compact-with-model, Replace and Remove/status behavior are unchanged and covered.
- **H03–H05:** actual attached local schema/values validators plus optionalFunction are concrete metadata, not no-ops or a new runtime schema interpreter. Nullish schema/values/callback, per-key defaults, null/empty title, empty map/descriptors, skipped fields, unknown keys/keywords, unconstrained min/max ordering and enum membership remain supported. Bounds are checked only on numeric controls, enum only on strings; numeric/boolean irrelevant enum and nonnumeric bounds remain unrestricted. Malformed sibling schema safely returns Error without throwing in direct values validation. All original 13 schema cases remain; current suite has 39. No component rendering code changed.
- **H06/H07:** private ColorSwatches binds exactly `requiredColorStrings`; no export or fictitious slice member. Actual string arrays are required; CSS strings, empty/long arrays and sparse holes are allowed, explicit undefined/nonstrings fail. First-five order/style and preset save/apply/delete persistence are exercised.
- **H08/H09:** callbacks are constructed and atomically published only in an unconditional layout effect on each commit. The passive once-per-mount listener effect and exact delegate cleanup are unchanged; ordinary updates do not reset drag origin or rebind listeners. The parent layout probe executes after child publication and before passive effects, so it genuinely tests committed timing rather than post-act eventual freshness. StrictMode/remount/unmount coverage verifies one live listener pair and no calls after cleanup.
- **H10:** only the unused FONT_LABELS import was removed from TextInput. The seven hard-coded options and engine export remain outside this cleanup.
- **H13/H14:** required open/onOpenChange metadata sits alongside optional onCloseAutoFocus. Actual forwarding, latest callback, cancellable real Radix autofocus event and focus restoration test remain intact; no uncontrolled mode was introduced.

React 19 function components do not automatically run propTypes: the consumer/helper suites explicitly invoke production validators, including negative cases. Render success and console silence were not substituted for contract evidence.

Frozen helper hashes independently recomputed and unchanged:

- `uiPropValidators.js`: `086ad6b456fa19e56b1f4193ac1dd7992978fb2b644968d24486c9db381e68b6`
- `uiPropValidators.test.js`: `886ec85d2dfb8ccc4f97f92e146d0f76a803cd391821bd80f52a45e5b09c32ae`

All 19 handoff code/test hashes were compared: 18 match; only the separately authorized final PresetGallery test repair differs. Its reviewed final SHA-256 is `1ba4f983f042f14694af9f658371f0b85bf5741d5cde961e019b96f5dfd16655`. Full comparison is `../historical-audit-hashes.json`.

## Actual independent checks

Node commands used `npx --yes --package=node@20 -c` and direct installed executables; no package/config changes or timeout increases.

| Check | Actual result |
| --- | --- |
| Initial combined targeted Vitest, 11 files, `--maxWorkers=1` | Exit 1: 105 passed, one new PresetGallery save test timed out at unchanged 5000ms (5526ms). Not waived. |
| Original PresetGallery isolated | Exit 0: 2/2, save case 2981ms; an isolated pass did not clear the combined failure. |
| Final combined targeted Vitest after reviewed repair, same 11 files and worker count | **Exit 0: 11 files / 106 tests passed**, 99.68s; PresetGallery save case 832ms. |
| `npm run lint -- --format json` | **Exit 0: 183 records, zero errors/warnings**, including 38 JSX records. |
| Independent `eslint --ext .js,.jsx . --format json` | **Exit 0: same 183 records, zero errors/warnings**, including 38 JSX. |
| Gizmo JSX lint without `--ext` | Exit 0, actual file record, no ignored-file warning. |
| Gizmo `--print-config` | prop-types, hooks/refs and hooks/set-state-in-effect all `[2]`; severity retained. |
| Scoped Prettier check of 19 cleanup code/test/local-module paths plus implementation handoff | Exit 0, all matched files formatted. |
| Final repaired PresetGallery test ESLint and Prettier | Both separately exit 0. |
| `git diff --check` | Exit 0. |
| External passive-publication mutant, no repository source edit | Expected exit 1: precisely commit/layout freshness test fails, other two pass. Old setter receives the event. Confirms the regression kills useEffect-only publication. |

The 11 final targeted files comprise nine cleanup test files plus frozen shared helper tests and Layout integration. Counts: schema 39, helper 33, Layout 12, tooltip/uploader four each, help/gizmo/provider three each, boundary/gallery two each, local palette validator one.

Root/expanded lint ran before the final single-test query repair; its final changed file was independently linted/formatted afterward. Parent must still run the final whole-tree combined gate after all concurrent changes; this audit does not infer a final root pass from those separate observations.

### PresetGallery timeout diagnosis and accepted repair

An external in-memory transform timed the original real accessible-role queries, preserving all test assertions and budgets. In the save case, the three global role/name lookups took **1057ms, 672ms, 644ms** against 13–15 buttons; the case took 2490ms in that profile. The first test's initial global lookup took 2644ms. These synchronous style/accessibility walks, not an awaited asynchronous operation, explain the workload hazard under concurrent load.

Reviewed the final exact test delta: it finds custom-card boundaries by unique visible text and native enclosing button, retains scoped role/name queries for apply/delete, caches the selected card/input, and scopes Save to the input parent. Save-current is selected by text restricted to native button, with an explicit BUTTON assertion. The real built-in grid/styles still render; original behavior, storage/store cleanup, assertions and default 5000ms budget remain. No mocks, hidden-query bypass or production changes. Accepted.

Also read the other worker's actual `../preset-query-root-test.log`: **54 files / 782 tests passed, 150.11s**, under `--max-workers=50%`; this is independently inspected worker evidence, not a full-root rerun performed by this reviewer.

## Native browser and gizmo evidence

Source Vite target is isolated at **127.0.0.1:5197**, strict port, dedicated external cache, HMR false and external artifact paths. Server startup read back the exact repository root/cache/port/HMR identity. Existing Playwright budgets, one worker, viewport and software-GL options were preserved. Both `BITMAPFORGE_UI_URL` and `PALETTE_BASE_URL` must point to this target.

A first harness invocation omitted PALETTE_BASE_URL and was terminated at the shell budget after wrong-target palette fixture failures. It is invalid target evidence, not an application regression or acceptance pass. Correct-target results follow.

### Real gizmo smoke: PASS

Executed external Playwright script against actual application/source with a real canvas and native mouse/keyboard events. Store instrumentation replaced the actual setter between moves while retaining the original setter behavior; no component mock. A real rendered shape was selected and the final screenshot visually inspected.

- Initial `{x:0.3,y:-0.2,z:0.7}` with native +20px X / -10px Y drag became `{x:0.39,y:-0.020000000000000018,z:0.7}`.
- During the active drag, replacing the setter then Shift-moving to +50px/+30px called only the replacement; old call count stayed one, new count one. Rotation became `{x:0,y:0.2617993877991494,z:0.7}`, preserving original origin and snap.
- Native mouseup then further movement left rotation and callback count unchanged.
- Next drag used latest rotation and became `{x:-0.18,y:0.35179938779914943,z:0.7}`.
- Existing global `R` keyboard reset returned all three axes to zero. Canvas itself remains nonfocusable (`tabIndex=-1`); no keyboard drag capability is claimed or added.
- Actual 120x120 backing canvas, visible axis drawing and nonblank rendered shape; no page errors. Script assertions exited 0. Evidence: `../historical-audit-gizmo.mjs`, `.log`, `.png`.

This smoke proves native postcommit action replacement and event behavior. The unit layout probe/mutation separately establishes before-passive commit timing. No suspended/speculative-render or arbitrary earlier-child-layout guarantee is claimed.

### Existing UI/palette browser gate: CHANGE

Correct-target run of both unchanged specs: **29 passed / 1 failed (30 total), exit 1, 6.1 minutes**. All 11 palette cases and 18 UI cases passed, including real pointer and emulated touch palette reorder, keyboard cancellation/drop, disclosure/resize geometry, help/focus restoration and save-bridge behavior.

The failure is `ui-foundations.spec.js:217`, native Load Enter/Space/import/save case. It times out waiting for the **first filechooser at line 223**, before import behavior. Unchanged isolated rerun also exits 1 at the same 90000ms wait. This is a retained blocker to a green combined browser claim, not attributed to historical cleanup or waived as load.

Independent external probe shows the focused native Load button receives trusted Enter and click, and its hidden input receives the expected programmatic click, but the first chooser event is lost. Subsequent Enter/click produces chooser events. This points to Playwright first-interception arming timing, not absence of native application activation.

A separately copied external spec registers `page.on('filechooser', () => {})` in beforeEach **before navigation**, leaving all original keyboard/import/save assertions and budgets unchanged. That diagnostic passes **1/1, exit 0, test 6.5s / total 12.3s**. It provides an actionable UI-browser-owner repair: arm chooser interception before navigation/keyboard activation, then independently rerun the real repository test and full 30-test gate. Do not substitute `setInputFiles`, click instead of keyboard, a longer timeout, or this external diagnostic pass for repaired repository acceptance.

Logs: `../historical-audit-browser-correct-target.log`, `../historical-audit-browser-load-isolated.log`, `../historical-audit-load-probe.log`, `../historical-audit-load-armed.log`; external armed spec/config retained. Browser JSON was overwritten by the isolated rerun, so the full 30-test count is backed by the preserved full-run log, not the later JSON.

## Limits and remaining ownership

- Parent final root/workspace/embed/CLI/decode/export/build/CI gates after all fixes remain outside this bounded audit.
- Browser evidence is source Vite, not acceptance of a freshly built or deployed artifact. No deployment occurred.
- No physical-touch device or screen-reader/assistive-technology run; mobile touch is browser emulation. No cross-browser claim.
- No speculative/uncommitted gizmo render experiment. Commit-only source publication, deterministic layout probe and its killed passive mutant are verified.
- Final combined browser acceptance remains blocked by the reproducible first chooser interception issue until the UI/browser owner repairs and reruns it.
