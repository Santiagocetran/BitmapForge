# H1 active-pointer evidence disposition

## Independent review verdict

**ACCEPT — bounded Chromium observation correction only. BLOCKED — complete active-pointer/native H1 acceptance and a cause-specific Firefox input correction.**

This is an independent source/retained-trace review, not implementation or a new browser result. The literal follow-up result remains **14 pass / 2 fail**. Neither failed row is reclassified as passing. No production/spec change, browser launch, install, build or general QA loop was performed. Accepted history, source/unit, frozen Q3 and CLI-output evidence is not reopened.

The Chromium observer conflates synchronous resource retirement with React DOM reconciliation and reads a handle inside a keyed, replaced subtree. Its pre-click unpressed requirement is not a valid proxy for listener lifetime. Correcting that proxy is justified; claiming all later assertions passed is not. Firefox's retained evidence does not identify the native event delivery that failed, so a concrete input workaround cannot honestly receive acceptance from this review.

## Review scope and evidence

Repository: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`, branch `gloin/release-hardening`, HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01`; existing dirty work was left untouched. Read root governance and the web-product-development/editor-redline skills. `HERMES.md` and the four named COLLAB files are absent.

Below, `SCRATCH` means `/home/agent/.hermes/profiles/gloin/cache/scratch`; `RUN` means `SCRATCH/bitmapforge-hardening-qa/runs/h1-native-followup-20261115-a01`.

Reviewed:

- `h1-native-followup-verification.md` and accepted `h1-native-followup-plan-audit.md`.
- Actual `SCRATCH/h1-native-followup-verification/native-followup.spec.mjs`, particularly lines 25–50; not a reconstructed sequence.
- Actual Layout, palette adapter and installed dnd-kit sensor source.
- Both failed cases' retained `results/native-followup-pointer-active-H1-pointer-active-D-ENGINE/trace.zip`, including protocol-call before/after records and DOM snapshots; Firefox's retained failure PNG.
- Installed Playwright `lib/server/firefox/ffInput.js`, `ffBrowser.js`, and, importantly, the **actual cached browser's** `firefox-1511/firefox/omni.ja` Juggler input implementation. No browser execution was needed to read the archive. Upstream files were also fetched, but the conclusions below use the installed archive rather than assuming upstream equals the running browser.

## Chromium: stale handle, commit boundary, and real listener retirement

### Source chain

1. `Layout.jsx:124–128,304–318`: Motion's `onPointerDownCapture` calls `barrier()`, then `paletteRef.current.cancel({restoreFocus:false})`. The click also calls the barrier, but that later handler cannot rescue a click stopped at document capture.
2. `ColorPalette.jsx:442–452,188–195,92–107`: cancellation immediately retires the generation/session, calls the native pointer cancellation path, and **synchronously calls `documentListeners.removeAll()`**. This is not deferred to React's next commit. Native `detach()` removes movement/end/window listeners; the adapter additionally removes the ordinary delayed click-suppression tail now.
3. Installed `core.esm.js:1495–1513`: a started pointer sensor registers an unconditional document-capture click `stopPropagation`. It does not exempt touch clicks or Motion. Lines 1474–1479 retain a 50 ms document-listener tail for ordinary termination. The adapter's forced removal is therefore meaningful, not merely another state update.
4. `ColorPalette.jsx:452,582–584`: retirement schedules a new generation and changes `DndContext key={generation.id}`. Its sortable descendants are replaced on reconciliation. Installed `core.esm.js:3436` derives `aria-pressed` from rendered drag state; it is not a listener registry. React need not synchronously clear that attribute in the target listener's turn, and an already detached old node need never receive an idle attribute update.

### Retained trace findings

The asserted-active drag is real. Trace `after@call@605` shows Reorder color 2 pressed with `aria-describedby=DndDescribedBy-0`. The recorded touch tap is `call@617`; no mouse release or keyboard termination precedes it. Passive observations show trusted touch pointerdown at Motion, then trusted target click, with the old handle still reporting `true` throughout.

Crucially, snapshot **`after@call@617`** shows Motion selected, Look hidden, and a new set of reorder buttons with **`aria-describedby=DndDescribedBy-1` and no `aria-pressed`**. Thus the committed current subtree is idle while the retained old ElementHandle reports the prior generation. Source plus this generation change establishes the stale-node interpretation after commit. The observer did not record `isConnected` or current-node equality during each native event, so this trace cannot determine the exact instant each observation changed from a still-connected precommit node to a detached old node. Do not label every recorded `true` specifically “disconnected at target pointerdown”; that detail was not measured.

A trusted click at the Motion **target** proves the old unconditional document-capture stopper did not stop that click. A document-capture observer alone would not prove this: other listeners on the same document can still run after `stopPropagation`. Actual Motion navigation corroborates delivery to React. This is observable pre-click resource evidence, not evidence that the DOM committed synchronously.

There is a further limit: target delivery alone timestamps absence by click, not the precise call to `removeAll`. Native pointerup could otherwise naturally end a pointer sensor, whose implementation does not filter pointer IDs, followed by its delayed tail. The reviewed synchronous capture source supplies the causal retirement boundary; the trace must not be advertised as direct listener instrumentation or a standalone measurement of that function's execution time. Equal event timestamps also do not establish browser task boundaries.

### Accepted bounded correction

For a separately named active-pointer verification only:

- Keep the original held-mouse pickup and explicit active assertion. Do not release it, end it by keyboard, or retry the parent activation.
- Retain passive trusted-event order/identity observations: distinct touch pointerdown at Motion while the old generation is active, then target delivery of that first touch's trusted native click. Record target pointerdown, but **do not require a React-rendered unpressed attribute in that same event turn**. Resource retirement must remain synchronous in the source; do not replace it with a timer/commit cleanup.
- Treat the old handle as a generation witness, not the postcommit state owner. After the first tap require Motion selected/visible and a **current hidden-inclusive Reorder color 2 locator in Look** unpressed. Record old-handle connection/current equality diagnostically; an unpressed detached old node is not required. Retain the old palette-root/panel lifetime contract where applicable; replacing the keyed dnd subtree is not replacing the palette controller/root.
- Keep Motion's real focus across both existing frame checks. No programmatic focus repair or second click.
- Keep original held-mouse movement beyond threshold and release; require Motion unchanged, then genuine Look return, exact original colors, current handle unpressed and Look focus. Keep fresh asserted-active keyboard pickup, Escape and stable handle focus plus screenshot. These supply the required no-resurrection/no-late-write/new-sensor proof.
- Keep all timing budgets and the ordinary-drop suppression contract unchanged. Do not add a wait for the 50 ms tail, sensor instrumentation, fabricated input or dependency patch.

This explicitly corrects accepted-plan steps 3–4's DOM proxy, not the underlying synchronous retirement requirement. **It does not retroactively pass the old failed assertion or its unreached successors.**

## Firefox: actual known failure, and limit of causal attribution

Trace `call@599` moves to `(107,705.5)`, `call@601` presses the primary button, and `call@603` moves to `(122,705.5)` in three steps. All return normally. `call@605` then exhausts the original 5-second pressed expectation. No touchscreen call, observer installation or parent cancellation occurs. The retained screenshot shows the intended second handle at that position, without an obvious covering overlay; that later image is not a native hit-test log.

The installed input path does **not** implement `hasTouch` by visibly converting these mouse commands into touch commands:

- `ffInput.js:111–140` sends `Page.dispatchMouseEvent`, primary button 0 and held-buttons mask, with floored coordinates. The movement remains sufficient for the palette's distance-8 constraint; the fractional Y rounding is not evidence of a miss.
- `ffBrowser.js:170–171` sends `Browser.setTouchOverride`. Cached `TargetRegistry.js:557–558,1035–1038` sets `touchEventsOverride` on browsing contexts.
- Cached `protocol/PageHandler.js:483–607` delivers mouse events using `MOZ_SOURCE_MOUSE` and the default mouse pointer identifier, forwarding button/buttons; it also has native-drag routing. There is no `hasTouch` branch here that proves pickup must fail.
- `ffInput.js:162–167` routes touchscreen tap separately to `Page.dispatchTapEvent`; cached `content/PageAgent.js:511–529` dispatches touchstart and touchend after a layout flush. That route was never reached in this failure.
- Installed `PointerSensor` activates from `onPointerDown` only if `isPrimary` and `button===0`, then needs pointer movement beyond the threshold. The retained trace records **API commands**, not these native pointer fields, target hit tests, sensor registration or possible intervening pointer cancellation.

**Actual cause cannot be uniquely determined from this evidence.** It establishes failed mouse pickup in this scoped run, not whether Firefox omitted/rejected pointerdown, delivered it to a different target, canceled a pending sensor, or failed to deliver eligible movement. `hasTouch` correlation is not proof of one of those mechanisms. Calling the unexecuted tap unsupported, prescribing extra movement, or claiming a touch-mode-to-mouse conversion defect would invent evidence.

### Minimal native arrangement disposition

The smallest source-valid arrangement is still the existing one: runner-owned desktop `hasTouch:true`, primary mouse pickup asserted active, then one independent native touchscreen tap on Motion while the mouse stays held. Both installed input routes exist, and the adapter consumes pointer events. There is **no source-justified replacement arrangement accepted here**. Switching off touch would remove the public touchscreen prerequisite; releasing the mouse first would remove the active-cancellation contract; keyboard pickup would test a different sensor. Changing touch support mid-drag or using a private protocol/manual synthetic pointer stream is not an accepted fallback.

A cause-specific Firefox correction is therefore **BLOCKED**, with an exact missing datum: native pointerdown/eligible movement/cancel delivery at the original handle during the failed pickup. If separately authorized, the only discriminating next evidence needed is a bounded passive observation of that pickup (target, `isTrusted`, `pointerType`, `pointerId`, `isPrimary`, button/buttons, coordinates, and cancel/up), with unchanged input and budgets. This is not permission for a general harness, repeat suite or browser launch in this task. Until that datum exists, no guaranteed-working native arrangement can honestly be derived offline.

## Preserved failures and unreached assertions

- **Chromium:** original `native-followup.spec.mjs:43:58`, `down=0`, `retired=-1`, remains a literal failure. Formal Motion selection/heading, retained-handle unpressed and two-frame focus checks were unreached, followed by held-mouse movement/up, no-resurrection, Look return/exact colors, fresh pickup/Escape/focus and screenshot. The diagnostic current-tree idle snapshot supports this correction, not retrospective execution of those assertions. The old retained-handle postcommit assertion itself would be invalid for the same keyed-replacement reason.
- **Firefox:** original `native-followup.spec.mjs:29:100` active assertion remains failed. Touch delivery/order/retirement/click/focus, later movement/release, unchanged colors and fresh keyboard usability were all unreached.
- Original native failures, follow-up failures, specs, traces, immutable target and all unrelated accepted lanes remain unchanged. There is no full native H1 or whole-hardening clearance.

## Reviewed byte identities

SHA256 values (actual files, not Git HEAD substitutes):

| Input                    | SHA256                                                             |
| ------------------------ | ------------------------------------------------------------------ |
| `Layout.jsx`             | `7c6cf79a55b37b896a41ee703dce6f4c7c8ef8de0b22e6a33b38787a04f8b40f` |
| `ColorPalette.jsx`       | `1f985ea6b9f7794c916c1503f561ee994f5a9a89378fd69849cd7b57fe895cfe` |
| Installed `core.esm.js`  | `0c7f0d3dd754085b000e0bcc9b3ef90727d5b7781fdb7d2b89fce5bdc3fd0e6f` |
| Installed `ffInput.js`   | `1c54c5b3ab97cfcad81843d1b95fbcc29159b5c7aae064c2a0f18accb052a1b2` |
| Follow-up external spec  | `2d7bb20668e54dde89a71356a47f458fa64af7e1785263baded520d72b156b40` |
| Cached Firefox `omni.ja` | `5d2a4c5f5d5236a56b4c7404f93bf24f7d7501fdcf2644cc063ff7399dde3378` |

Only this disposition document is created in the repository by this task.
