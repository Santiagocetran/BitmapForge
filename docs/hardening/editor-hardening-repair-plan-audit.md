# Independent audit — bounded editor hardening repair plan

## Verdict: ACCEPT, with distinct H1 and H2 gates

**ACCEPT the plan's bounded investigation/repair workflow.** The plan correctly separates a demonstrated H1 interaction failure from an unproven source mechanism, and identifies a source-supported H2 presentation-isolation repair without redesigning the editor.

- **H1: ACCEPT investigation and regression preparation; no specific production fix is established or authorized now.** Execute the unchanged-baseline reproduction in §H1 only after the serial browser lane is released. Select a source correction only when that reproduction establishes its causal boundary within the accepted two-file envelope. A ref/epoch/sensor explanation is still a hypothesis. If the reproduction cannot establish that boundary, or requires a different mechanism/file, stop and return a revised plan for independent acceptance. Do not turn this verdict into permission for a guessed callback-publication or unconditional-remount patch.
- **H2: ACCEPT the proposed single-component presentation repair**, subject to executed baseline-red tests first and independent implementation review afterward: existing outer StatusNotice wrapper becomes hidden and inert under the existing `suspended` input; retained content and delivery guards remain intact. The static evidence supports this proposal, not a claim that nested browser integration already passes.
- **No implementation acceptance, full QA clearance or release approval is delivered here.** Source tests, built-output QA and manual AT checks remain separate gates. This review does not take the browser lane from CLI.

Audited plan: `docs/hardening/editor-hardening-repair-plan.md`, SHA-256 `5ff647ab6dd28b0504e65a0cc2335421c01a594e76096f000a6c5384f9371ae1`. App revision: `550842cab61002c7cc6563e50b9fcdeb17c9bf01`, branch `gloin/release-hardening`. Acceptance applies to those plan bytes and the boundaries below, not an unreviewed later expansion.

## Evidence and method

Read repository `AGENTS.md`, web-product-development/editor-redline skills, the repair plan, `qa-harness-independent-audit.md`, actual app/component/test/contract source, installed dependency implementation, and retained failure evidence. No own root auditor config or `COLLAB/` directory was present in the inspected root. Concurrent CLI work is outside this audit.

This was **static/offline review only**: no app/test implementation, installation, browser, server, or acceptance-suite execution. Python read the retained trace action records and ZIP CRCs. All six relevant retained ZIPs opened with no corrupt member: Q3.drag.D and Q5.host.D/N for Chromium and Firefox under:

`/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa/runs/baseline-550842c-stage1/baseline/smoke/{engine}/a02/results/`

Independently compared current bytes with `git show HEAD:path`: all three proposed production files, App, ShortcutsModal, the six existing test paths listed below, `uiPropValidators.js`, and `package-lock.json` matched HEAD. The proposed new Layout integration test does not exist yet. This is not a new complete evidence-manifest/build-provenance audit; the broader baseline identity findings remain attributed to the prior independent QA audit.

**Frozen versus working harness:** external QA is revising its harness concurrently. Current `contracts.mjs:259–299` and `ui-smoke.spec.mjs:218–280` are not the frozen a02 line layout. The trace/error-context embedded source retains the old assertion locations (`contracts.mjs:277`, `ui-smoke.spec.mjs:261`). Use those retained records for a02 attribution; do not claim current harness bytes or new line numbers were executed in a02. Original frozen harness identity remains `4e749ad91dab7e973bc595766d9fc072bd2fa89e9e3c11c986514a601cd64aa3` as authenticated by the prior audit.

## 1. H1: failure verified; exact mechanism remains open

### Retained result

Both engines fail the post-collapse/reveal `not.toHaveAttribute('aria-pressed', 'true')` check, with `Reorder color 2` still pressed. The error contexts show expanded desktop Settings and the rail as active. This is not the missing-idle-attribute-versus-literal-false mistake and not an invented second-Escape desktop dismissal.

Decoded Chromium action records confirm `call@1800` handle focus → `@1802` Space → `@1804` real Collapse click → `@1806` real Expand click → `@1808` failed pressed-state assertion. Firefox confirms the equivalent `@1808/@1810/@1812/@1814/@1816`. The third pickup was not followed by a dedicated armed-state assertion before collapse. Earlier Escape and Motion→Look cancellation steps passed in the same case. The final unchanged-order assertion after the failure was never reached. No local drag ref, sensor identity, epoch or callback-order telemetry exists in these records.

### Actual source and dependency constraints

- `Layout.jsx:124–128,424–443` already calls the palette barrier on both rail pointer capture and click **before** setting `hidden`. Native Enter/Space activation uses the click path. Recommending “add the missing collapse cancellation” would be unsupported.
- `ColorPalette.jsx:272–320` clears the transaction and advances focus generation, but only increments the DndContext epoch when `dragRef.current !== null`. Its interaction handle is effect-published; `cancelRef.current` is assigned during render and cleanup unconditionally clears the supplied ref. Those are real seams, not proof they caused this failure.
- `ColorPalette.jsx:393–417` keys only DndContext. Its callbacks share palette-local refs; an old context's late start/end/cancel must not acquire ownership, commit order, or restore focus into a newer interaction. Clearing a local predicate is not evidence of sensor retirement.
- Installed `@dnd-kit/core` is **6.3.1**. `core.esm.js:1133–1198,1319–1339` shows KeyboardSensor's delayed document keydown registration, window listeners, and detach on end/cancel. Context start/end handling at `:3068–3173` reads latest callbacks and updates internal drag state. Hiding a React subtree is not a sensor cancellation API; replacing DndContext alone must not be assumed to detach a previously created sensor. Conversely, this source does not prove a leaked sensor caused the retained failure.
- Existing `ColorPalette.test.jsx:133–159` uses real dnd but chiefly checks the local ownership predicate and color conservation. Existing `Layout.test.jsx:67–85` mocks ColorPalette. Neither establishes integrated native rail cancellation or old-sensor harmlessness. The planned separate real-component integration fixture is justified.

The fresh and full-history repros are therefore both necessary. Diagnose where the local/controller and actual dnd states diverge; do not erase the prior task-hide history. Native rail keyboard variants must also verify that a stale sensor does not consume the activation key or write colors.

### Preservation gates are adequate

The accepted plan preserves the existing palette root across desktop hide/reveal, controlled name/browse draft state, queued focus generation, no blur commit after parent cancellation, external-mutation invalidation, duplicate colors/order, and subsequent successful drag/drop. Existing DndContext-owned sortable nodes may legitimately be recreated by the existing reset; palette/whole-settings/engine remounts are not a valid substitute.

Keep `Layout.test.jsx:245–335` bridge cleanup/freshness and one deferred export/manager coverage. Keep the real browser canvas identity check at `ui-foundations.spec.js:16–43` and resize identity checks; mocked engine constructors alone do not establish native canvas identity. If handle/callback publication changes, add the planned parent-layout-phase and StrictMode/ref-replacement tests; post-`act` freshness does not prove commit-phase publication.

Keep narrow Settings' precise Escape ownership (`Layout.jsx:522–530`): prevent parent dismissal only; do not stop propagation required by the keyboard sensor. Regress first Escape cancellation/handle restoration, second Escape dismissal/opener restoration, and release after drop, external replacement and parent cancellation. Preserve picker Escape and palette-name first-Escape clearing/Save-focus separately from parent-hide draft preservation. Existing browser coverage at `ui-foundations.spec.js:77–152,205–231,460–494,945–1034` is relevant preservation coverage, not proof of the missing desktop regression.

## 2. H2: source explains the retained accessible-role leak

### Actual modal/notice chain

`App.jsx:18–20,34–42` cancels through the committed bridge before opening sibling ShortcutsModal and delegates Help-close restoration through the current bridge. `ShortcutsModal.jsx:14–43` is a real modal Dialog portal. Layout moves a persistent notice host between Preview and the body-owned Settings portal (`Layout.jsx:228–235,447,558–565`); React ownership does not determine modal DOM isolation.

Installed `@radix-ui/react-dialog` is **1.1.15**, and `aria-hidden` is **1.2.6**. Dialog's `index.mjs:130–145` calls `hideOthers(content)` and traps focus. The helper's `dist/es2015/index.js:124–134` explicitly adds **all `[aria-live]`** and script nodes to the keep set; `:45–62` keeps their ancestor paths. The persistent polite notice is consequently not guaranteed hidden by the sibling Help modal. An optional alert sibling may have different inherited isolation; the whole notice wrapper is the correct bounded application-owned scope.

`StatusNotice.jsx:8–44` already freezes subscription/delivery and guards queued work plus deferred functional-updater processing. Its render at `:47–64` retains the polite status and optional alert/Dismiss without explicit isolation. Suspension is correctly a content freeze, but is not yet a presentation-isolation mechanism.

All four retained Q5 error contexts identify `Project saved as .bitmapforge file.` as the still-accessible status while Keyboard Shortcuts is open and Close is active. This is not the assertive dnd announcer. Both D/N case IDs actually opened their first Help in the narrow drawer after viewport/host moves, so direct desktop Help is additional required coverage, not a previously failed desktop assertion. Failure precedes resume/latest-message verification; those later checks remain unexecuted in a02.

### Proposed repair fits the cause and preserves contracts

Adding declarative native `hidden` and boolean `inert` to the **existing** `.bf-notice` wrapper isolates status, alert and Dismiss together without clearing display or altering live attributes/subscription/store semantics. Existing `styles.css:119–120` enforces `[hidden] { display: none !important; }`; `.bf-notice` does not override it. No CSS, Layout host, App, modal, producer, hook or dependency edit is justified for this proposal.

Preserve the initial empty commit, latest-only coalescing, equal-presentation no-mutation behavior, error precedence, recognized progress text versus generic busy fallback, unmount guards, StrictMode isolated lifetimes and delivered-but-uncommitted race protection in `StatusNotice.test.jsx`. Existing tests deliberately expect retained accessible roles during suspension (`:33,91–92,115,123,215`); adjust those access paths while **adding** role absence, not by dropping retention/race checks. On resume, existing asynchronous current-only delivery remains the contract; this plan is not permission to redesign status scheduling or claim zero transient presentation before the delivery microtask.

## 3. Exact file boundary

Only these production files fall within the accepted envelope:

| Unit | Allowed production file                            | Condition                                                                                      |
| ---- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| H1   | `src/app/components/ColorPalette/ColorPalette.jsx` | Diagnosed cancellation/generation/sensor boundary only; investigation is not a selected patch. |
| H1   | `src/app/components/Layout/Layout.jsx`             | Only if reproduction demonstrates coordinated parent-ordering correction is necessary.         |
| H2   | `src/app/components/ui/StatusNotice.jsx`           | Existing outer-wrapper hidden/inert presentation isolation only; delivery logic stays intact.  |

Test edits/new file are bounded exactly to:

1. `src/app/components/ColorPalette/ColorPalette.test.jsx`
2. `src/app/components/ColorPalette/ColorPalette.redesign.test.jsx`
3. `src/app/components/Layout/Layout.test.jsx`
4. **New** `src/app/components/Layout/Layout.hardening.test.jsx`
5. `src/app/components/ui/StatusNotice.test.jsx`
6. `test/e2e/ui-foundations.spec.js`
7. `test/e2e/palette.spec.js` — run as a regression gate; edit only for an additionally diagnosed widget-specific sensor regression.

There is no authorization to edit shared browser helpers, fixture pages, configs, contracts/validators, store producers, hooks, styles, App, ShortcutsModal, dependency/lock files, external QA files or CLI files. Existing `interactionRef` and `bridgeRef` validator interfaces remain unchanged. Read-only regression execution may include cross-component contract tests and broader existing suites without adding edit ownership. Each completion unit must retain attributable red/green evidence; shared Layout/browser-test paths require one coordinated integration owner, not conflicting parallel writes.

## 4. Meaningful red/green requirements and bounded clarifications

The plan is adequate; these are precise execution clarifications within its existing scope, not new milestone work:

1. **Use the correct hidden-query option.** Plan §H2 says `includeHidden: true`; that is Playwright's option. In installed Testing Library role queries use `{ hidden: true }`, or captured nodes/raw DOM selectors. Its role option is not `includeHidden`. Default role queries must separately find no status/alert/Dismiss while suspended. Do not assume jsdom implements native inert exclusion: assert native hidden/inert attributes there and verify browser focus/Tab isolation separately.
2. **Keep causality separate from green preservation.** H2 unit baseline red must fail on absent isolation while retaining preexisting text/node, not merely because an old query now throws. H2 browser red must populate the notice before real Help opens. H1 needs the exact integrated history with an explicitly armed third pickup; a unit test that only repeats `isKeyboardDragging() === false` after cancel is insufficient. Derive the smallest unit regression from the diagnosed mechanism where observable, retaining real-dnd integration/browser red. If jsdom cannot reproduce the geometric/native defect, label that limit; do not mock the failing boundary or call a passing baseline unit test red evidence. Run newly added tests red against unchanged app bytes before applying each repair.
3. **Native rail keys have legitimate effects.** “No stale Space/Arrow/keyup changes” means no stale **palette** transaction/order/ownership/focus effects. Native Space/Enter on the rail may legitimately toggle Settings. Check that the click occurs, cancellation precedes hiding, and palette order is conserved; do not suppress native rail activation to make the test pass. Use `page.keyboard` after focusing the rail rather than a handle-targeted locator action that refocuses/reveals the child.
4. **Identity is lifecycle-specific.** Capture actual wrapper/status/alert nodes before Help, not only test-added identity attributes. Keep alert/Dismiss identity while the same error is suspended; normal removal when latest resumed state is success is allowed. Preserve wrapper/status identity across host moves and Help. Separate permitted wrapper hidden/inert attribute mutations from forbidden retained text/child mutations; drain observer records and retain diagnostics in `finally`.
5. **Retired callbacks must not poison the next drag.** After canceled hide/reveal, send native stale keys without focusing the child, assert no order/transaction change, then explicitly focus and perform a new pickup → movement → single drop with correct final focus. Where a diagnostic callback capture is necessary, label it separately; acceptance must retain real unmodified sensor/controller integration. A nonpressed new context alone does not prove an old document listener is harmless.
6. **Keep source and built evidence distinct.** Source-store sentinels can test multiple hidden updates/races/error replacement. They do not prove real save/load producers. Those strings are confirmed in `useExport.js:347` and `useExportController.js:31`; accepted revised external Q5 must still exercise exact `Project saved as .bitmapforge file.` / `Project loaded.` on matching immutable builds. QA harness revision requires new frozen identity/baseline; a02 cannot become retroactively green.

Existing `ui-foundations.spec.js:264–302,388–440` checks retained/latest text but lacks the necessary populated accessible-role isolation checks and direct desktop Help sequence. Strengthen those paths while preserving progress/error/dismiss and stable-host assertions. The new real Layout + ColorPalette + ShortcutsModal fixture must use App-equivalent bridge/open/close wiring; manually flipping `helpOpen` in the mocked Layout suite is not modal integration proof. Engine/export mocking must not replace the real dnd, Dialog, palette or StatusNotice boundary being tested.

The plan's source/browser split, immutable matching build comparison, baseline/final Chromium/Firefox runs and independent exact-diff implementation review are required. Node 24 matches `package.json` engines. No test timeout increase, browser acquisition or concurrent run is authorized here. The existing standalone palette pointer/keyboard transaction suite remains required and is not a substitute for integrated rail/Help coverage.

## 5. Explicit limits and final disposition

No renderer, sparse Shape/Text quality, Q7 IDREF policy, threshold, fixture, export architecture, layout redesign, dependency or external harness repair is included. Preserve their original failures/blockers and the independent QA REVISE verdict. Full broad gates and final built QA remain pending. WebKit's environment block is not cleared by this audit.

Automated accessible-role absence, hidden/inert ancestry, mutation records and focus checks do **not** establish actual speech delivery, absence of buffered announcements, virtual-cursor isolation, screen-reader usability, physical Safari/mobile/touch or real browser-menu zoom. Record manual AT as unverified until actually performed with OS/browser/AT versions and results.

**Final: ACCEPT the bounded plan as gated above. H1 investigation may proceed after lane handoff; its specific production correction remains unproven. H2's wrapper-only proposal is independently accepted for baseline-red-first implementation.** Any scope/mechanism amendment requires independent acceptance before production edits. This auditor created only this document and did not run or clear implementation/acceptance tests.
