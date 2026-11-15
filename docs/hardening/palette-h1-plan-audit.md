# H1 independent implementation-plan audit

## Verdict: ACCEPT — the bounded design below

**ACCEPT the component-local sensor lifecycle adapter plus generation guards specified here for implementation.** The causal proposal is correct, but a bare call to private `handleCancel`, a callback guard alone, or another keyed remount alone is not the accepted design. This audit resolves the proposal's open API and deferred-registration decisions; it does not require another plan approval or authorize unrelated repairs.

Production scope is **`src/app/components/ColorPalette/ColorPalette.jsx` only**, with the focused component/Layout/browser tests already named in the proposal. Layout production source stays unchanged. H2, dependencies, image-cancel harness corrections, diagnostic evidence and QA budgets are outside this unit. This is plan acceptance, not implemented-behavior acceptance.

## Grounding and verification performed

Read repository `AGENTS.md`, web-product-development and bitmapforge-editor-redline skills, the causal proposal, actual ColorPalette, relevant Layout barriers, installed dnd-kit runtime and sensor type declarations, retained causal/sensor/Layout tests, and `palette-h1-offline/attempt06.log`. Repository `HERMES.md` and the four named COLLAB bootstrap documents are absent. No other agent's private memory was inspected.

Branch: `gloin/release-hardening`; HEAD: `550842cab61002c7cc6563e50b9fcdeb17c9bf01`. Existing dirty accepted work was left untouched. SHA256 readback matches the causal investigation:

| Target                | SHA256                                                             |
| --------------------- | ------------------------------------------------------------------ |
| ColorPalette.jsx      | `7636969ccbb1ad457b4c66be35b1f1dad41c3e4b036190c9fe6730ce47ee54d2` |
| Layout.jsx            | `7c6cf79a55b37b896a41ee703dce6f4c7c8ef8de0b22e6a33b38787a04f8b40f` |
| installed core.esm.js | `0c7f0d3dd754085b000e0bcc9b3ef90727d5b7781fdb7d2b89fce5bdc3fd0e6f` |

The retained final log reports three files/six passing **diagnostic** tests. Their source deliberately asserts the defect. They are not repaired acceptance. I did not rerun them: their observation writers append to retained evidence. No browser, installation, source implementation or test modification occurred in this audit. The original browser evidence inventory was not independently rehashed here.

## Diagnosis upheld

- ColorPalette cancellation (`272–281`) only resets DndContext when `dragRef` is non-null. It never retires an actual sensor. Store subscription cleanup (`313–319`) also leaves native listeners alive.
- The new context and old context share the component's ownership refs. Its `onDragEnd` (`407–414`) checks only non-null ownership, not which interaction owns it.
- Installed KeyboardSensor (`1133–1158`, `1319–1339`) attaches a deferred document listener; its old Space completion can therefore run after the new React activator has started a new interaction. It prevents default **before** the application callback, so callback guards alone do not protect native keyboard activation.
- DndContext (`2998–3119`, `3121–3173`) has no public instance-cancel interface. Its terminal handler clears internal state even when no active event exists. Consequently pending pointer retirement must invoke internal cancellation, not wait for an application `onDragCancel` that may never be emitted.
- Layout's synchronous cancellation barriers and modal Escape predicate are consistent with the diagnosis. The real retained Layout tests demonstrate both fresh two-Escape success and poisoned-history failure. There is no source evidence requiring a Layout repair.
- Existing palette ownership tests cover a single ending, not the poisoned next pickup. The retained uninstrumented public-cancel reproduction plus separate call-through sensor-order test supply the missing causal link. The duplicate fixture must gain exact no-write assertions, not just multiset equality.

## Accepted minimal implementation design

### 1. Separate context lifetime, sensor session and resource state

Use stable module-local adapter classes in ColorPalette.jsx, not classes recreated per render and not modifications to dependency prototypes. Continue to use native PointerSensor/KeyboardSensor activation and movement behavior, sortableKeyboardCoordinates, distance 8 and the existing accessibility options.

A context generation object belongs to each keyed DndContext lifetime. Its immutable identity is captured by that context's callbacks and sensor options; an imperative `retired` flag can change synchronously. Do not read a mutable "current generation" at callback time and mistake that for the callback's originating generation. A replacement generation is created for the replacement context; callbacks from the old context retain the old object.

Each actual sensor construction also creates a unique session with its original native activator event, owning context generation, kind, terminal-once flag and adapter reference. Register it **before the native constructor can call `onStart` or `onPending`**, not in `onDragStart` or after `new Sensor` returns. Keep pending sessions independently of the visible drag index. Capture session metadata in wrapped SensorProps callbacks before construction; the adapter's overridden `attach()` can register `this` before delegating to native attachment. Base constructors call these prototype methods; subclass field initializers must not overwrite state installed during `super()`.

Keep resource-detached state separate from application completion state: native end/cancel detaches **before** calling `onEnd`/`onCancel`. Marking a session ineligible for its one legitimate completion merely because detach ran would break live drop/Escape. Natural completion gets one guarded application delivery; imperative retirement permits none.

Wrap activators to reject retired context generations **before** invoking the native activator (which can prevent default). Wrap native event entry points to return immediately for retired/finished sessions before native code can consume an event. Forward normal events unchanged. No synthetic Escape, fake Event or preventDefault stub is needed.

### 2. Keyboard: close deferred registration, not just existing listeners

Use the native keyboard attachment schedule, with a **per-instance registration gate**:

1. In overridden `attach()`, initialize session/resource state and wrap that instance's `listeners.add` and `windowListeners.add` before calling native `attach()`.
2. The wrapper calls the original add with its correct receiver only while that instance's resource gate is open. It must not consult a later session's state.
3. Overridden `detach()` closes the resource gate first, then calls native `detach()` to remove all existing listeners. This applies to natural end/cancel as well as imperative retirement.
4. If cancellation happens before the original zero-delay registration callback, the callback later reaches the gated add and does **nothing**. There is no late listener, event consumption or retained event handler on the document. No additional timer, delay or global timer interception is introduced.
5. Guard keyboard event entry before native key handling as defense against a previously captured callback. Window cancellation callbacks must obey the same retired/finished check.

This works with the actual source because the timer evaluates `this.listeners.add(...)` when it fires (`1158`); it does not capture the original add function. Gating window add also handles synchronous retirement during native `handleStart`, before native `attach` continues. Native `Listeners.removeAll` is idempotent (`1011–1017`), although it does not empty its recorded array.

For **imperative** keyboard retirement, call the private detach path and the saved original SensorProps `onCancel()` exactly once. This is the native cancellation sequence without `event.preventDefault()`, which has no meaning without a real event. Do not call keyboard `handleCancel()` with no argument: it unconditionally calls `event.preventDefault()`. Natural Escape still runs the actual native handler with its real event.

### 3. Pointer: retire pending sessions and eliminate cancellation tails

Register the session during attach even though distance-pending has no `dragRef`. On imperative retirement, use the native pointer cancellation path exactly once: it detaches, clears the activation timeout, calls `onAbort(active)` when not activated, and calls internal `onCancel` (`1474–1484`, `1581–1592`). Allow that one internal reset even though application callbacks are already invalidated.

**Additionally remove `documentListeners` synchronously on imperative retirement.** Native pointer detach leaves them for 50 ms. An active sensor's capture click listener otherwise suppresses the rail click; a pending sensor's key listener also survives unnecessarily. Clear the instance's document listeners immediately, not after a timeout and not by stopping propagation elsewhere.

Preserve native delayed click cleanup on an ordinary successful pointer drop. Track terminal pointer instances with outstanding cleanup separately from the active-session slot, so parent cancellation/unmount during that tail can still remove their listeners. A per-instance wrapper around the existing bound `documentListeners.removeAll` can remove the instance from the cleanup registry when native delayed cleanup runs. No new timer is necessary. The later native timer may call removeAll again safely; it only owns that old instance's listener manager, never a new sensor's listeners.

A snapshot sweep of this cleanup registry must not call terminal callbacks again for already finished sessions. Retirement of active/pending sessions and cleanup-only retirement of finished tails are distinct operations. Close registration gates on all relevant instance managers and guard delayed/captured start/move/cancel callbacks, so retired pending work cannot activate or suppress events.

### 4. Cancellation order and callback ownership

On public parent cancel, structural/external mutation or actual palette teardown:

1. Invalidate the affected context/session identities synchronously, clear owned keyboard/drag state and invalidate queued focus jobs.
2. Retire the actual pending/active sensor and any terminal cleanup tails. Internal dnd cancellation must still run once; application order/focus callbacks from the retired identity must not.
3. Schedule at most one replacement of that retired DndContext when necessary, including pending-sensor cancellation. Never condition sensor retirement or context reset solely on `dragRef !== null`.
4. Preserve current edit cancellation, controlled preset drafts/browse state and root/controller identity. Do not increment/remount an idle context merely because cancel was called again.

Bind ownership to the session, not just its index: for example `{ session, contextGeneration, activatorEvent, index, keyboard }`. Check captured context identity, nonretired session and original `activatorEvent` identity in start/end/cancel handlers. dnd-kit includes the original activator event in all these active events. Equality of draggable ID is insufficient because consecutive sessions can drag the same item. Compare-and-clear ownership; an old completion or cleanup must never clear a newer session.

Wrap sensor `onStart`/`onMove`/`onPending` and terminal callbacks with session checks as well; component callbacks alone do not prevent an old pending sensor from changing dnd's internal state. Permit exactly one internal cancellation during forced retirement via an explicit internal path, not a blanket guard that accidentally suppresses it. Natural terminal completion remains eligible once, clears only its own session, and retains current live drop/Escape focus behavior. Pending abort must release registry ownership even when dnd emits no component drag event.

Keep the existing keyed reset as a post-retirement fallback for internal UI state. It is not the synchronous barrier. Reject activation from the retired generation during the interval before React commits its replacement. Teardown retires resources without scheduling state updates. Cleanup must compare ownership before clearing a published handle, and StrictMode setup after cleanup must receive a live lifetime rather than reuse a permanently retired one.

No blanket passive-to-layout handle-publication rewrite is needed by this diagnosis. Preserve the public handle contract and latest cancel indirection. Any implementation choice that changes publication phase must carry the already specified layout-phase tests; it is not permission to alter Layout.

### 5. Private API decision: explicitly accepted, version-bounded

**Accept private runtime coupling for these local adapters against installed @dnd-kit/core 6.3.1.** SensorProps and activators are public contracts, but overriding attach/detach/event handlers and accessing listener managers is not supported public API: the declarations mark them private. JavaScript runtime methods are ordinary properties in the inspected build, so the proposed subclass interception works; this is not a claim of forward compatibility.

Keep a source comment identifying the version and required runtime behavior. Add focused compatibility/behavior tests for constructor dispatch, listener gating, terminal ordering and pointer abort/cleanup. Dependency updates must run them. Do not monkey-patch native prototypes, import unexported source paths, copy whole sensors, or claim useDndContext exposes cancellation. A new application-owned sensor implementation is **not necessary** for this bounded repair.

## Required implementation tests and discriminating counterexamples

Retain historical diagnostics unchanged. Add baseline-red desired-behavior cases in the existing approved test files; no additional test-plan approval layer is required by this audit.

| Case                          | Required assertion                                                                                                                                                                                                                                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full keyboard history         | Escape control → second pickup → parent/task cancel → next asserted-active pickup → collapse/reveal: ownership agrees with pressed state, no old completion changes it, exact duplicate-containing order and zero color-store writes throughout cancellation.                                                     |
| Deferred registration         | Pickup and public cancel/unmount in the same turn before timer drain; drain original timer; no old document listener registration, default prevention, focus or write. Repeat with natural terminal before attach drain.                                                                                          |
| Repeated cancel / new session | Repeated cancel is inert after retirement; new live session is not cleared by old callbacks/cleanup. A genuinely new public cancel must still cancel that new session.                                                                                                                                            |
| Event-entry isolation         | Deliver captured old key/move/start/cancel callbacks after retirement and a new pickup; assert no default prevention, scrolling, ownership, internal activation, write or focus effect.                                                                                                                           |
| Pending pointer               | Pointerdown below distance threshold → parent cancel while no drag index exists → beyond-threshold movement/up and timer drain; no late start/write, internal active lock released, next pointer and keyboard pickup both work.                                                                                   |
| Active pointer / cleanup tail | Active pointer → parent pointerdown-capture cancellation → immediate native click remains available. Also ordinary drop retains native click cleanup, while subsequent explicit cancellation during its cleanup tail removes remaining listeners immediately. Old delayed removeAll cannot detach a newer sensor. |
| Unmount / StrictMode          | Pending and active teardown removes resources without post-unmount writes/focus; constructor-time registration and reentrant retirement cannot leave listeners; setup/cleanup/setup remains usable and cleanup cannot null a newer published handle.                                                              |
| Preserved focus/state         | Same root hide→cancel→reveal before captured microtasks drain preserves controlled drafts/browse, discards stale focus, keeps rail focus; a subsequent legitimate move/drop writes once and focuses the moved item.                                                                                               |
| Real Layout                   | Fresh and history-dependent narrow first Escape cancels/keeps Settings/focuses handle; second Escape dismisses. Help, external mutation and parent hiding retire ownership. Keep H2 assertions untouched.                                                                                                         |

Independently remove session/generation checks and sensor retirement in targeted counterexamples. Generation-guard removal must fail a stale-callback ownership/write test; retirement removal must fail listener/default-prevention or pending-pointer tests even if callback guards remain. Remove only the deferred-add gate and prove the cancel-before-attach case detects registration. Omit immediate pointer document cleanup and prove immediate click delivery fails. Passing only aggregate reorder assertions is insufficient.

Use real installed sensors in these tests; spies may observe native calls but cannot substitute sensor behavior. Native rail Enter/Space and pointer activation, geometry, moved-item focus across frames and immutable-build Chromium/Firefox results remain the proposal's later serial browser verification, not claims made by jsdom. No timeout or threshold increases, root/controller remounts, focus restoration weakening or harness assertion relaxation.

## Delivery status

Only this audit document was created; its path is not ignored. Source and retained tests were read, not changed or executed. No repair or browser clearance is claimed. The implementation gate for the concrete design above is **ACCEPT**; remaining work is implementation, baseline-red/regression execution, exact-diff review and the already required final verification—not another speculative design review.
