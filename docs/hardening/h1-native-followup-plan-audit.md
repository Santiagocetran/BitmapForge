# H1 native supplemental follow-up plan audit

## Verdict: ACCEPT — the bounded supplemental correction below

**ACCEPT this concrete sequence correction for a separately named external supplemental spec.** Reject reuse of the failed live-sensor focus-plus-Enter/Space sequence as a test of retired-sensor behavior. No production repair is indicated by that sequence. This is plan acceptance, not native behavior acceptance; there is no additional plan-approval layer.

Only supplemental sequencing and its scoped input configuration may change in the follow-up. Preserve the tested spec, frozen harness/helpers, original failures/traces, immutable build, accepted source/unit work and frozen 33-case lanes. Do not reopen CLI, dependencies, quality policy, timing budgets or unrelated failures. This audit does not run or authorize publication, installation or rebuilding.

## Evidence inspected and path correction

- `docs/hardening/h1-integrated-verification.md`, especially the native failure section: historical supplemental results are 5 pass / 3 fail in each engine. Frozen `Q3.drag.D` passes in both engines, but does not establish the missing supplemental third asserted-active pickup.
- `docs/hardening/palette-h1-plan-audit.md`: parent cancellation must synchronously retire listeners; active-pointer capture cancellation must permit the immediate native click; ordinary pointer drops keep native cleanup. Native rail keys are required **after retirement**, not as an alternate live-drag termination contract.
- Actual `src/app/components/Layout/Layout.jsx`: `barrier()` calls `cancelReveal()` and `cancelPalette()` (124–128). Task buttons call it at pointerdown capture and again on click (304–323); collapse calls it at pointerdown capture and click (425–440). Focus alone does not call this barrier.
- Actual external spec: `/home/agent/.hermes/profiles/gloin/cache/scratch/h1-native-verification/native.spec.mjs`, plus its config and imported runtime/UI helpers. The report/context's apparent `bitmapforge-hardening-qa/h1-native-verification/native.spec.mjs` location does not exist. The actual spec is a sibling of that QA directory, not its child.
- Installed dnd-kit keyboard end keys include Enter, Space and Tab. Installed Playwright Chromium and Firefox input implementations provide real touchscreen input (`Input.dispatchTouchEvent` and `Page.dispatchTapEvent`, respectively). That is implementation availability, not evidence that the proposed cross-pointer sequence has passed either browser.

Repository governance and both relevant skills were read. `HERMES.md` and the four named COLLAB bootstrap files are absent. Existing dirty work remains untouched. The report's format failure is historical; the supplied handoff says the formatter has since completed that work. This audit does not undo or rerun that cleanup.

## 1. History Enter/Space: retire first, then test native activation

Apply the same correction to both existing `H1.history-Enter.D` and `H1.history-Space.D` contracts in the new supplemental copy:

1. Keep setup, loaded cube, duplicate-containing palette, open Browse palettes, populated save-name draft and retained root/panel/canvas handles unchanged.
2. Keep the first asserted-active pickup, ArrowRight, Escape, unpressed assertion, exact unchanged order and handle-focus assertions across the existing two frame boundaries.
3. Keep the second asserted-active pickup and ArrowRight. **Before focusing Motion or pressing the case's key, perform a genuine mouse click on the currently selected Look task button.** Its pointerdown capture runs the parent barrier while the keyboard sensor is live; its click retains Look. Use ordinary Playwright input, not `dispatchEvent`, DOM `.click()`, synthetic Escape, store mutation or a public-handle call.
4. Immediately require the handle to be unpressed (absence of `aria-pressed` is permitted), exact order equal to the duplicate-containing baseline, Look still selected and rail Look focused across the existing frame checks. This is the explicit retirement boundary; do not merely assume that clicking retired the sensor.
5. Now retain the original Motion focus plus real Enter/Space, visible Motion heading and Motion rail-focus assertions. Retain ArrowRight plus stable Motion focus. Retain Look focus plus the same real key, restored Look, unpressed handle, exact unchanged order and Look rail focus. Do not replace these keyboard activations with clicks: they are the post-retirement native-key regression.
6. Keep the **third** pickup through `pickup()`, including its `aria-pressed=true` assertion, then the original genuine Collapse settings / Expand settings clicks, unpressed assertion and exact unchanged order. Add/check collapse-rail focus across the existing frame boundaries after collapse and after reveal, without weakening existing focus expectations.
7. Keep all original draft value, Browse expanded state, same palette-root identity, connected retained task panel and canvas, screenshot and saved-settings color equality assertions. Do not drop the final save because the earlier order checks passed.

Clicking selected Look is deliberately a no-navigation parent barrier, not an Escape/drop substitute. Motion's subsequent keyboard activation still supplies task hiding and Look's native key supplies reveal. The next pickup must genuinely arm; a silent failed pickup followed by collapse is not acceptance.

The original external spec only asserts saved **colors**, panel/canvas connection and palette-root equality; do not misreport these as complete settings equality or direct controller-instance instrumentation. Preserve those literal assertions and the accepted no-remount/controller-lifetime contract. A browser result cannot manufacture a controller identity assertion absent from its evidence.

## 2. Active pointer: use a distinct real pointer at the parent

The mouse is already held down during `H1.pointer-active.D`. A second `mouse.down()` for the held button is not a new physical press. Pressing another mouse button while one is held is not a reliable new `pointerdown` either. Releasing the mouse first would naturally finish the drag and would test a cleanup tail, not cancellation of an active sensor. Do not use any of these shortcuts.

Use a **case-local touch-capable desktop context** (`hasTouch: true`, retaining the desktop viewport and all other existing execution policies) for this active-pointer case only. Keep the runner-owned page/qa fixture and trace ownership; a scoped describe/use override is sufficient, not a new unmanaged context. Other supplemental cases, including the passing pending-pointer case, retain their input configuration and assertions.

Concrete active sequence:

1. Capture initial exact colors and the real handle geometry. Move the mouse to the handle center, press the primary mouse button, then move the existing 15 pixels over three steps. Assert `aria-pressed=true` as before. Do not release the mouse or press Escape/Enter/Space.
2. Read Motion's visible bounding box without moving the held mouse. While that mouse remains down and the handle remains asserted active, use `page.touchscreen.tap()` at Motion's center. This is an independent real touch pointer: its pointerdown reaches Motion's `onPointerDownCapture={barrier}` before its pointerup/compatibility click. Do not replace it with programmatic focus plus Enter.
3. Require actual event-order evidence, collected only by passive/read-only native-event observation in the new supplemental copy: a trusted touch pointerdown targeting Motion while the old handle is pressed, parent retirement before the ensuing click, and delivery of the resulting trusted native click to Motion. Record event type, target, pointer identity/type where available, trusted flag, timestamp and old-handle pressed state. An observation listener must not prevent default, stop propagation, call cancellation or alter the sensor/store. Observe the post-React-capture state at the target/bubble phase and click, rather than assuming document capture runs after React capture.
4. Require Motion selected and its heading visible from that first tap, with no retry click or deliberate wait for dnd-kit's cleanup tail. Require the old handle unpressed using the retained DOM handle or a hidden-inclusive query, since Motion hides Look. Assert Motion rail focus across the existing frame checks; do not programmatically focus it to make that assertion pass. If this engine's native touch focus/click behavior does not supply the required result, retain that failure and its phase rather than silently substituting a different activation.
5. Still with the original mouse held, perform the original beyond-threshold mouse movement and then release it. Require Motion to remain selected; there must be no resurrected drag or late order write. Return to Look with its genuine click, then retain the original visible/unpressed handle, exact original colors and Look rail-focus assertions.
6. Preserve the final fresh asserted-active keyboard pickup, Escape, handle focus across frames and screenshot. This proves the old pointer did not poison the next sensor, not merely that task navigation worked.

The ordered observation distinguishes active retirement from a touch-triggered natural end: the first new pointerdown must see the mouse drag active, and the parent capture must clear it **before** the touch release/click or original mouse release. A tap without that evidence is insufficient. Browser-protocol touchscreen input is not a synthetic DOM pointer event and requires no production or dependency patch. Its cross-pointer behavior and native focus remain execution obligations, not claims of this static audit.

If an engine cannot deliver this distinct-pointer sequence under the scoped context, report that exact case as blocked/failed with retained evidence. Do not label a mouse-up-then-click variant active-pointer acceptance. No deadline increase, forced click, bypass of actionability, sensor instrumentation or old-evidence rewrite is an acceptable fallback.

## Preservation and completion boundary

The follow-up keeps all eight supplemental case contracts, including the passing pending-pointer, spatial keyboard/pointer drop and fresh/history-dependent narrow first-/second-Escape tests. Keep moved-item focus across frames, Settings retention/dismissal, exact duplicate order, third active pickup, collapse/reveal, draft/browse, retained root/panel/canvas and saved colors. No original assertion may disappear merely because a setup step changes.

Use a new supplemental spec/output identity and the existing immutable built target at `/home/agent/.hermes/profiles/gloin/cache/scratch/h1-integrated-20261115T180652Z/immutable-candidate/dist`. Preserve the original supplemental spec and both engines' failures at `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa/runs/h1-native-20261115T180652Z`. Existing tracing, worker, retry, geometry, timeout and cleanup policies stay unchanged. Reconcile each original case with its new result and name any later unreached assertion; do not fold the result into a rerun or reinterpretation of the frozen 33-case lanes.

Only `docs/hardening/h1-native-followup-plan-audit.md` is created by this audit. No source, tested harness/spec, build, browser or dependency changes were made. The next bounded work is the accepted supplemental adaptation and its actual Chromium/Firefox verification, not another speculative approval stage. Full native H1 acceptance remains pending those results.
