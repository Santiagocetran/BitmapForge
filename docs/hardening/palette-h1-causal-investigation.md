# H1 causal investigation and frozen repair proposal

## Outcome / authority

**H1 mechanism reproduced against unchanged production ColorPalette and dnd-kit: an old keyboard sensor survives a keyed-context reset, ends on the next pickup's Space, and clears the new drag's shared ownership ref. The new context remains active; subsequent parent cancellation sees a null ref and skips its epoch reset.** This explains why completed Collapse/Expand actions leave a pressed handle. Missing rail cancellation and initial Escape failure are not the cause demonstrated here.

**INVESTIGATION COMPLETE; PROPOSED REPAIR NOT ACCEPTED.** No component, dependency, repository test, QA harness, case or acceptance assertion was edited. No browser, application server, build or installation was launched. Final QA retains the browser lane. Independent explicit **ACCEPT of this diagnosis-specific proposal**, including its sensor API choice, is required before implementation. The earlier editor-plan ACCEPT authorized investigation, not this source correction. No repair, final QA clearance or release is claimed.

Read `AGENTS.md`, web-product-development/editor-redline skills, `editor-hardening-repair-plan.md`, its independent audit, and `qa-baseline-post-lifecycle.md`. Repository HEAD remains `550842cab61002c7cc6563e50b9fcdeb17c9bf01`; unrelated in-progress work was not modified. The sole repository deliverable is this document.

## Evidence locations and authenticity

- `R=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`
- `E=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa/runs/baseline-post-lifecycle-20261115T094529Z`
- `D=/home/agent/.hermes/profiles/gloin/cache/scratch/palette-h1-offline`

`D/analyze.py` independently streamed and verified all **787 manifest entries / 788 physical files** in E. Zero byte/hash mismatches. E's manifest SHA256 is `764edf81bc344186de178a4076c61ce16c16d185eb04d1adb8cccf710d309455`. `D/evidence-readback.json` retains the complete verification result, source hashes, extracted original Q3 before/after actions, and all four image before/after comparisons. Both original Q3 trace ZIP CRC checks returned no corrupt member. Original evidence remains untouched.

Production identities actually exercised by the diagnostics:

| File                                               | SHA256                                                             | HEAD comparison                            |
| -------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| `src/app/components/ColorPalette/ColorPalette.jsx` | `7636969ccbb1ad457b4c66be35b1f1dad41c3e4b036190c9fe6730ce47ee54d2` | identical                                  |
| `src/app/components/Layout/Layout.jsx`             | `7c6cf79a55b37b896a41ee703dce6f4c7c8ef8de0b22e6a33b38787a04f8b40f` | identical                                  |
| `node_modules/@dnd-kit/core/dist/core.esm.js`      | `0c7f0d3dd754085b000e0bcc9b3ef90727d5b7781fdb7d2b89fce5bdc3fd0e6f` | installed 6.3.1, not a tracked source file |

These are source diagnostic identities, not a claim that the dirty integration tree equals the old immutable dist. Baseline served-build provenance remains that of the retained QA report.

## Retained browser result: exact failing phase

Both engines' `E/baseline/smoke/<engine>/a01/results/ui-smoke-Q3-drag-D-<engine>/trace.zip` show:

1. First pickup, ArrowRight, Escape, idle-pressed assertion, handle focus and original-order assertions complete.
2. Second pickup/ArrowRight, Motion→Look, idle-pressed and order assertions complete.
3. `call@1636` handle focus; `@1638` Space; **`@1640` Collapse click completes; `@1642` Expand click completes**.
4. `@1644` rejects a still-pressed `Reorder color 2`, at current `contracts.mjs:312`. The subsequent order check is unreached. Both engines use these current attempt IDs; older a02 IDs are different.

There is no separate third-pickup armed assertion in the retained case and no original ref/sensor telemetry. This investigation does not retroactively add either. The new external diagnostics assert the third handle is pressed before rail cancellation. They supply the causal observation missing from the old browser trace, not new browser acceptance.

## Source chain and observed cause

### Parent hide is synchronous cancellation, not sensor cancellation

`Layout.jsx:124–128` calls `paletteRef.current.cancel({ restoreFocus: false })` in its barrier. Task navigation (`:304–323`) and desktop rail (`:424–443`) call it at pointer capture and click before hiding. Panels use native `hidden` (`:327–334`); desktop collapse hides the existing settings owner. The palette component is retained. Help, resize and drawer-close also call cancellation. No missing collapse barrier was found.

`ColorPalette.jsx:272–281` synchronously clears the edit transaction, invalidates queued focus and clears `dragRef`, then schedules `epoch + 1` **only when the ref was non-null**. This does not call the sensor's end/cancel/detach. `key={epoch}` replaces only DndContext and its sortable descendants, not the palette's refs. Its old callbacks still close over those shared refs.

The increment itself is not a synchronous context teardown: React commits it after the event update. Even after that commit, unmounting this locked DndContext does not cancel its sensor instance. In `core.esm.js:2998–3016,3119`, the instance is held by a context-local ref; no instance-cancel unmount effect exists. `useSensorSetup` (`:2334–2358`) cleans only optional static setup functions, not created sensor instances. KeyboardSensor has no static setup teardown here.

### Why first Escape works, and task hide poisons the next drag

Installed KeyboardSensor attaches its document keydown listener on a deferred timer (`core.esm.js:1154–1158`). Actual Escape runs `handleCancel`, detaches document/window listeners and invokes the current context's cancellation (`:1328–1339`). That context resets internal active state and invokes the palette `onDragCancel` (`:3121–3173`). The palette clears its ref and queues handle focus (`ColorPalette.jsx:402–405`). No context epoch reset is needed for this natural cancellation. This is why initial Escape can pass.

Parent task-hide cancellation instead clears the local ref and remounts DndContext, leaving the old keyboard sensor's document listener alive. On the **next handle Space**:

1. React's new handle activator starts a new sensor/context and writes `dragRef` (`ColorPalette.jsx:397–400`).
2. The same bubbling native event reaches the old document listener. Space is an end key (`core.esm.js:1191–1194`); the old sensor detaches and ends its old context (`:1319–1325`).
3. The old context still has a sensorContext snapshot and latest callbacks belonging to that old context. Its `onDragEnd` reads the palette's **new, non-null shared ref**, passes the null check (`ColorPalette.jsx:409`) and takes move/no-over completion. Both branches clear that ref (`:376–378,412–413`). There is no interaction/context-generation check.
4. The new DndContext is still dragging (`aria-pressed="true"`), but `isKeyboardDragging()` now reports false. Later rail cancel sees `dragRef === null`, skips the epoch increment, and leaves that new context pressed across hide/reveal.

**Observed, not just inferred:** `D/sensor.test.jsx` wraps the real installed KeyboardSensor prototype methods with call-through spies; it does not replace sensor logic or fabricate callbacks. `D/sensor-observations.jsonl` records this sequence per run:

```text
sensor1 handleStart: ownership false → true
sensor1 Escape/handleCancel + detach: true → false
sensor2 handleStart: false → true
parent cancel: no sensor2 detach
sensor3 handleStart: false → true
sensor2 Space/handleEnd + detach: true → false
sensor3 remains pressed, local ownership false
```

Rows are written on method completion, so nested detach appears before its enclosing end/cancel row. Sensor IDs restart per test invocation; repeated blocks are separate runs, not six sensors in one drag. The test asserts the missing sensor2 detach before pickup3, old sensor2 ending with ownership true→false during pickup3, same new handle staying pressed, and repeated public cancel failing to replace/retire it. A no-hide public-cancel variant reproduces it: native hidden is not the root cause; prior cancellation/context lifetime is.

### Real Layout and first-Escape interaction

`D/layout.test.jsx` uses the actual Layout, ColorPalette, dnd-kit, Radix Dialog and stores. Only engine/export work and missing jsdom drawing/media/observer facilities are substituted. Its desktop full-history path reproduces the pressed handle after completed rail clicks. Its fresh narrow control verifies first Escape cancels while Settings remains, then second Escape dismisses.

A separate **narrow after-task-hide diagnostic** also reproduces first Escape dismissing Settings after the poisoned new pickup. `Layout.jsx:522–529` correctly consults synchronous child ownership in Radix's early Escape handling, but the ref has already been falsely cleared. Thus this is an additional demonstrated consequence of the same corrupted predicate, not evidence that the fresh modal Escape contract always fails. No propagation suppression or second desktop Escape is proposed.

### Confidence and limits

- **High confidence in the reproduced source cause:** real public parent cancellation creates the orphan; real sensor callback order flips new ownership; real Layout reproduces the final symptom. No callback-publication change is needed to explain these observations.
- **High confidence it explains the retained history-dependent failure; not direct original-browser sensor telemetry.** Retained Chromium/Firefox reproduce the matching action/symptom path, but were not instrumented retrospectively. Browser ArrowRight/collision geometry remains to be verified after lane handoff.
- Under jsdom's zero geometry, stale completion also reordered the duplicate-containing fixture to `['#222222', '#111111', '#111111']`. This is an observed diagnostic write, **not a claim that original browser artwork/order changed**: the browser's final order assertion was unreached. Preserve an exact no-write test, not merely multiset conservation.
- No native rail Enter/Space activation was simulated by `fireEvent.click`. Those browser contracts remain mandatory and unexecuted here. No focus/geometry/AT acceptance follows from jsdom.

## Native diagnostic results and reproduction

Run from R, with the actual retained paired Node24 executable:

```sh
/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node \
  node_modules/vitest/vitest.mjs run --config \
  /home/agent/.hermes/profiles/gloin/cache/scratch/palette-h1-offline/config.mjs
```

The external config uses installed Vitest 4.1.12, jsdom, existing `test/setup.js`, automatic JSX transform, one worker, a private transform cache and three external test files. `D/node_modules` is a symlink to R's existing installed dependencies; no dependency installation or shared config edit occurred. The real dnd APIs are imported, not reproduced in a toy state machine. `D/causal.test.jsx` is uninstrumented real palette/public-handle integration; only `sensor.test.jsx` has call-through sensor spies.

| Evidence                                        | Actual outcome / interpretation                                                                                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `D/attempt01.log`                               | Config startup failed: absolute package subpath and bundled plugin's Vite-internal resolution. No diagnostic executed. External config was corrected; application/build config untouched.                                |
| `D/attempt02.log`, `D/attempt02-source.jsx.txt` | 1 pass / 1 fail. Reproduced pressed/ownership divergence; intended unchanged-order check failed from the stale old end under jsdom. Original failing source retained.                                                    |
| `D/attempt03.log`                               | 3 diagnostic tests pass. Reproduction assertions describe the existing bug; not repaired behavior.                                                                                                                       |
| `D/attempt04.log`                               | 4 pass / 1 fail. Added real Layout desktop path hit incomplete external ResizeObserver stub (`unobserve` missing), not an application claim.                                                                             |
| `D/attempt05.log`                               | Corrected only external observer stub; actual Layout desktop reproduction and fresh narrow Escape control both pass as diagnostics.                                                                                      |
| `D/attempt06.log`                               | Final **3 files / 6 tests pass**, exit0. Includes public-cancel fresh/history controls, actual sensor-order proof, real Layout desktop history, fresh narrow two-Escape control, poisoned narrow first-Escape dismissal. |

`D/layout-observations.jsonl` retains actual Layout outcomes; `D/sensor-observations.jsonl` retains actual sensor events. Pass means the diagnosed baseline behavior was successfully asserted, including defects; **none is application acceptance or a final-green regression**. The external fixtures' explicit 20s Layout bounds do not change repository or QA budgets.

## Frozen proposed minimal repair scope — independent ACCEPT required

### Selected causal boundary

**Own cancellation at the ColorPalette sensor/interaction lifetime, not at the rail.** Proposed production allowlist: `src/app/components/ColorPalette/ColorPalette.jsx` only. Keep Layout unchanged unless a new independently accepted finding demonstrates a parent-order defect. Keep existing public `interactionRef` contract, palette root/drafts, DndContext-only replacement if still needed, duplicate identity and all existing focus-generation guards. No entire-palette/settings/controller remount, unconditional epoch bump as sole repair, synthetic Escape, new timeout workaround, dependency patch/update or shared-harness edit.

Freeze these implementation requirements together; a callback guard alone or a pressed-attribute cosmetic fix is insufficient:

1. Give each sensor/context interaction a synchronously retireable identity distinct from render-scheduled epoch. Parent cancel marks that identity retired **before** any sensor completion, queued focus or parent hide. Repeated cancel is idempotent and cannot invalidate a later live interaction accidentally.
2. Bridge imperative retirement to the **actual sensor lifecycle**, including keyboard and pending/active pointer paths. Retire/detach or make every deferred listener harmless before it can consume keys, suppress native rail activation, start/write/reacquire ownership or restore focus. Context remount alone is proven insufficient.
3. Bind start/end/cancel/focus callbacks to that identity. An old context's completion must not read a new interaction's ownership ref as its own, write order, clear it or schedule focus. Live Escape/drop retains normal behavior. Reset context only as necessary after synchronous retirement; do not use React state as the sole cancellation barrier.
4. Preserve latest committed handle publication and ref cleanup ownership. Do not bundle an unrelated passive→layout-effect rewrite; if chosen for a demonstrated new timing requirement, independently justify it and include layout-phase/StrictMode tests.

### API decision explicitly requiring review

The locked public `useDndContext` descriptor (`node_modules/@dnd-kit/core/dist/store/types.d.ts:62–84`) exposes neither an active sensor nor imperative cancel. `KeyboardSensor.d.ts:19–25` marks attach/end/cancel/detach private. **Do not invent a supported `cancelDrag()` API or dispatch a fake keyboard event.**

The smallest candidate is a **component-local, locked-version sensor adapter** that captures its instance/interaction and routes retirement through the actual installed cancellation path, with generation-guarded callbacks. The independent review must explicitly accept or reject any reliance on private `handleCancel`/detach semantics; this document does not call them public APIs. It must also resolve the pending keyboard attach seam: native `attach()` schedules document registration without retaining its timer (`core.esm.js:1158`), so cancel-before-that-timer may register a listener afterward. Merely calling private `handleCancel` is not a complete proposal unless that late listener is demonstrably harmless and retired without added timer workarounds or focus/key suppression. Pending pointer activation and the library's delayed pointer document-listener cleanup need equivalent verification.

**No production adapter is written or claimed proven.** If review cannot establish this candidate's bounded lifecycle semantics, return REVISE and separately accept a component-local application-owned sensor implementation using the exported Sensor contract; do not silently widen files, copy a dependency wholesale, or implement only generation guards and declare sensor teardown solved. This is an explicit implementation-design risk, not uncertainty about the reproduced root cause.

### Frozen regression/verification requirements

Before source repair, create independently reviewed baseline-red tests in the already accepted test allowlist. The external diagnostic expectations of buggy behavior must not simply become green acceptance tests.

- `ColorPalette.test.jsx`: actual keyboard sensor; active pickup → parent cancel → next asserted-active pickup; local ownership must match real pressed context; no old end/start/cancel can mutate colors, clear live ownership or steal focus. Assert **zero store color writes and exact original order**, including duplicates. Repeated cancel; subsequent real new drag/drop exactly once; cancel before deferred keyboard attach; parent unmount while active; stale keys and resize/visibility events after retirement. Test pointer distance-pending and activated cancellation too.
- `ColorPalette.redesign.test.jsx`: same-instance hide→cancel→reveal with captured microtasks, preserving controlled draft/browse state and retiring all stale focus jobs. Keep explicit-invocation name focus, blur cancellation and draft-preservation tests.
- `Layout.hardening.test.jsx`: actual components and App-equivalent modal wiring, no dnd/Dialog/palette mocks. Baseline-red full history and poisoned narrow ownership, fresh controls, Help/external-mutation/parent-hide retirement, first Escape cancel + focus + keep drawer, second Escape dismiss, and ordinary dismissal after end/cancel. Keep H2-owned integration assertions unchanged.
- `Layout.test.jsx`: cancellation-before-hidden ordering and controller/bridge identity preservation; its mocked palette is not sensor-lifecycle proof. Parent layout-phase/ref replacement/StrictMode coverage is mandatory if handle publication changes.
- `test/e2e/ui-foundations.spec.js`, plus unchanged `palette.spec.js`: serially exercise unchanged-baseline fresh and exact retained Escape→Motion→Look→third pickup→collapse history; assert active before every hide. Use real pointer capture/click and native rail **Enter and Space** separately. Confirm native rail toggles, focused rail retains intended focus across frames, no stale key writes/picker/draft commit, exact original order, same palette root/controller/canvas, new pickup/move/drop once and correct moved-item focus. Cover narrow first/second Escape in fresh and history paths. No timeout/threshold increase.
- Reviewer must reject guard-only and epoch-only candidates if the stale sensor can still prevent native rail activation or survive pending registration. Require targeted counterexamples against removed generation guards and omitted sensor retirement independently, not only an aggregate green suite.
- After independently accepted implementation, run relevant component/cross-component/root suites, JSX-inclusive lint/format/diff checks on the paired Node24 toolchain, then independent exact-diff review and separately authorized immutable-build Chromium/Firefox QA. Existing baseline failures, original evidence and frozen case budgets survive. Manual AT/native platform gaps remain unverified.

## Separate image-cancel contract diagnosis — no case edits

### Intended source preservation, not return to model invitation

`ImageInput.jsx:19–27` does not mutate image source or status when acceptedFiles is empty. `inputSlice.js` sets inputType independently; cancel is not a route-back operation. `PreviewCanvas.jsx:233–236` renders the source-specific empty overlay: **image + no imageSource ⇒ “Choose an image”; model + no model ⇒ “Start with a source”**. Image cancellation should preserve the selected Image route and its empty image chooser, not manufacture the model invitation or revert to the earlier cube.

The current harness's `ui.mjs:281–283` calls only the exact **model** heading “Start with a source” its `invitation` boolean. `assertImageCancel`, `repair-contracts.mjs:314`, nevertheless requires that boolean true. All four retained records have false **before and after**; actual final error contexts show “Choose an image” (`Q1-image-D…/error-context.md:63`; N `:46`). The original traces contain that image heading too. This is a specific heading-selection/required-value mismatch, not evidence of disappearance on cancel.

`D/evidence-readback.json` records all four original diagnostics:

- sourceType remains `image`; entire serialized settings payload is equal;
- files0, Replace0, alerts0 and exact `Drop an image: PNG, JPG/JPEG, GIF, WebP or SVG.\n\nChoose Image` text all remain equal;
- Chromium N and both Firefox cases have identical canvas screenshot hashes; Chromium D alone differs. The broad “artwork hashes differ” does **not** apply to every case;
- the final whole-object equality check was never reached because the invitation assertion fails first. Chromium D would also require separate pixel/snapshot-phase triage. Equal/different screenshot hashes do not prove source/asset preservation or replacement by themselves.

### Exact proposed assertion contract for separate review

Do **not** merely replace `true` with `before.invitation`, remove deep equality, ignore artwork, add pixel tolerance, or edit any case now. Retain the four failures. Freeze a separate proposed capture/validator amendment for independent review:

1. Establish **positive preconditions**, not equality to an arbitrary initial value: selected Source type exactly Image; no image asset, zero files/Replace/errors; same intended settings/model asset retained in the downloaded project; exact empty-image prompt. Capture the source-specific heading name `Choose an image` and its DOM presence independently from current accessibility/visibility under narrow modal background isolation.
2. After the real chooser cancellation, require those same exact values and serialized settings/asset byte identities. Require exactly one Image source selection and the still-existing Choose Image action; heading must remain the image heading. Require absence of an unintended model invitation/route change. Keep source-selection, control/prompt and asset assertions separate from canvas presentation checks.
3. For heading **visibility**, compare at equivalent settled UI phases: both drawer closed/Preview accessible, or both drawer open with the same background isolation. On narrow Settings an underlying heading may correctly be inaccessible, so an unconditional visible-heading assertion while the drawer is open is also wrong. Do not substitute hidden DOM text for the separate visible-phase gate.
4. Retain exact artwork/presentation identity as its own gate, but capture both images after the **same** settled route, viewport, drawer/overlay and deterministic animation state. Keep byte/hash equality if that controlled state is deterministic. If the renderer intentionally advances, independently accept a deterministic frame/pixel protocol preserving the existing quality budget; no hash exclusion or tolerant replacement is authorized here. The retained Chromium D mismatch remains unresolved until that phase-correct contract is executed; do not reclassify it as a pass.
5. Validator negatives must reject wrong/missing image heading, model-route reversion, new/removed assets, settings mutation, file/replacement/error changes, empty-prompt disappearance and actual controlled-frame artwork change. Preserve exact native chooser cancellation and original case IDs/budgets. Any new capture fields and phase ordering require a separate harness review and new frozen baseline; no retroactive pass or reuse of this causal unit work as acceptance.

This separates the demonstrated invitation-contract error from the still-required source/artwork preservation proof. It does not weaken preservation to “nothing threw” or assert that the current four failed cases pass.
