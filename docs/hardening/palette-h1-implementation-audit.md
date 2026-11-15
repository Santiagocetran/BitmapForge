# H1 independent implementation audit

## Verdict: ACCEPT — source/unit stage only

**ACCEPT the exact completed H1 source/unit implementation. No material finding requires revision at this stage.** This accepts the implementation against `palette-h1-plan-audit.md`, not another plan review and not complete H1/browser/release acceptance. Immutable-build Chromium/Firefox acceptance remains next, together with the already specified broader verification gates. CLI canvas artifact acceptance is inherited, not reopened.

Reviewed repository governance, web-product-development/editor-redline guidance, accepted plan, implementation handoff, exact patch, current source/tests, installed dnd-kit runtime, original-source red evidence and final mutation evidence. The named COLLAB bootstrap records are absent. Production scope remains ColorPalette only; no production/test edit, dependency installation, build, browser or server launch occurred in this review.

## Exact reviewed identity

Repository: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`, branch `gloin/release-hardening`. The incoming dirty tree is not represented by HEAD alone. Evidence: sibling `../palette-h1-implementation/`.

Independently compared all four live implementation files with `final/` snapshots and regenerated the complete four-file unified patch against original snapshots. The regenerated patch is byte-identical to `implementation.patch`, including the H1 delta in the previously untracked Layout hardening test.

| Target                         | Independently verified SHA-256                                     |
| ------------------------------ | ------------------------------------------------------------------ |
| ColorPalette.jsx               | `1f985ea6b9f7794c916c1503f561ee994f5a9a89378fd69849cd7b57fe895cfe` |
| ColorPalette.test.jsx          | `3f145830dd952edb1b16bbf564d44cbdb6928c5ec614d4de7e31ed1ed895cfab` |
| ColorPalette.redesign.test.jsx | `3dd308c2384769a7eb2ff115acaf2668f936700065119155bd243b9ad13ca18d` |
| Layout.hardening.test.jsx      | `99728816b9519f195e3c93c34b625def30cde0fda3334f93b355bff46fe0fb05` |
| implementation.patch           | `1b7c089187136b4cc2e434bf543cfa3f9e5ad58a94766ced0498b5282c83655e` |
| Original ColorPalette snapshot | `7636969ccbb1ad457b4c66be35b1f1dad41c3e4b036190c9fe6730ce47ee54d2` |
| Unchanged Layout.jsx           | `7c6cf79a55b37b896a41ee703dce6f4c7c8ef8de0b22e6a33b38787a04f8b40f` |
| Installed core.esm.js          | `0c7f0d3dd754085b000e0bcc9b3ef90727d5b7781fdb7d2b89fce5bdc3fd0e6f` |

Installed package metadata confirms **@dnd-kit/core 6.3.1**. The adapter explicitly documents private runtime coupling; it does not claim a public cancellation API or forward compatibility.

## Concrete source findings

### Ownership and constructor registration

ColorPalette lines 30–195 define stable module-local adapters. `sensorProps` allocates session identity before `super`; overridden `attach` publishes the adapter/session before native attachment can synchronously start or report pending activation. Installed keyboard constructor calls `this.attach()` at line 1151 and pointer constructor at line 1422. No subclass field initializer overwrites this early state.

Each keyed context captures its own generation in sensors and callbacks. The imperative ref selects the generation to retire, not the identity accepted by an old callback. Start checks original activator-event identity; completion checks captured generation, owned session retirement, original activator event and the session's narrow terminal-delivery window. Reusing the same draggable ID cannot confer ownership. Terminal cleanup compare-and-clears only its own generation session. Captured old component and native callbacks are tested independently.

`finished`, `delivering`, `retired` and `resourcesOpen` have distinct purposes. Native detach precedes end/cancel delivery; closing resources does not prematurely invalidate the one legitimate completion. `finished` blocks repeated native terminal delivery, while `delivering` permits the synchronous application callback. Installed DndContext's handler is declared async, but its only await is the optional `cancelDrop` branch (core lines 3143–3149). This palette supplies no `cancelDrop`, so its completion runs within that delivery window. Adding asynchronous drop interception later would require revisiting this contract; it is not a current defect.

### Keyboard deferred registration and event isolation

Instance listener-manager add gates are installed before native attach. Detach closes the gate before removing listeners. The installed zero-delay callback looks up `this.listeners.add` when it runs (core line 1158), so it reaches the closed gate even after cancellation/unmount/natural terminal before timer drain. Window registration is gated too, covering reentrant retirement during native start before attach continues.

Activator guards reject retired generations before native keyboard `preventDefault`. Native entry guards reject finished/retired sessions before key handling, movement, selection removal or start behavior. Forced keyboard retirement invokes detach and the saved wrapped internal cancel path without fabricating an event; ordinary Escape still uses the real native handler. No global timer interception or dependency-prototype modification appears in production.

### Pending pointer, internal cancellation and cleanup tails

Pending pointer ownership exists independently of visible `dragRef`. Forced retirement invalidates application ownership first, then calls the native pointer cancellation path, allowing pending `onAbort` and exactly one internal `onCancel` despite retirement. This matters because installed DndContext resets its active lock even when it cannot emit an application drag event (core lines 3121–3173). The subsequent keyed context replacement is a fallback, not the synchronous listener barrier.

Native pointer detach retains document listeners for 50 ms (core line 1479). Forced retirement additionally removes them immediately. Natural drop preserves the native delay; its session remains in the generation's tail set after the active slot clears. A snapshot sweep can retire finished tails without replaying terminal callbacks. Repeated idle cancellation does not remount a context, and actual teardown does not schedule replacement.

**The additional per-registration listener identity fix is justified and remains in scope.** Installed pointer start registers the shared module-level `stopPropagation` callback (core lines 1504–1508). Separate native listener managers alone do not prevent DOM listener deduplication. The local add wrapper records a distinct callback identity in each manager, preserving options and native timing; an old delayed removeAll therefore cannot remove a newer sensor's click stopper. The original callbacks used here are bound sensor methods or receiver-independent helpers, so the wrapper does not discard a required native receiver. Both active-retirement and natural-drop-tail tests verify immediate release, then assert the next active pointer still suppresses clicks after the old timer runs.

### StrictMode, focus and preserved interaction

Effect cleanup invalidates focus/drag ownership, retires resources and marks its lifetime retired. Setup after StrictMode cleanup supplies a live replacement generation. Published interaction-handle cleanup uses compare-and-clear; the passive publication phase is unchanged. Existing Layout handle/controller tests remain part of the focused run.

Cancellation advances the same focus generation used by queued restoration. The redesign regression hides, cancels and reveals the same DOM root before draining captured jobs, preserving controlled name/browse state and owner focus. Natural Escape restores the handle; a subsequent genuine keyboard drop traverses the real sensor/store path, performs exactly one write and focuses the moved swatch. Its tied zero-size jsdom rectangles are explicitly documented; this is not spatial drag or across-frame browser evidence.

## Tests and discriminating evidence

The palette DndContext observer passes through to the real installed context; constructor spies call through to native behavior. The separate Layout hardening suite does not mock dnd, Dialog or palette. It exercises desktop Escape → second pickup → Motion/Look → asserted-active third pickup → collapse/reveal, with duplicate-containing exact order and zero writes, both normally and in StrictMode. Narrow fresh/task-hide/external histories assert first-Escape cancellation, retained Settings and handle focus, then second-Escape dismissal. Help retirement/recovery is covered.

Inspected full `baseline-red-complete.log`: **six failures / 27 skipped**, at ownership disagreement after a pressed pickup, deferred listener registration, late pending-pointer activation and swallowed immediate clicks. These are behavioral assertions, not import failures. This review did not swap production bytes to repeat historical red runs.

Independently diffed all five final mutant snapshots against the exact final source and read their actual failure logs, not just exit summaries:

| Final retained mutant                                   | Actual intended failure                                                                                               |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `final-context-mutation/mutation-context-ownership.log` | One selected test fails at line 351: stale context completion causes one forbidden color-store write.                 |
| `final-mutations/mutation-guards.log`                   | One selected test fails at line 416: captured old native keyboard entry prevents default.                             |
| `final-mutations/mutation-retirement.log`               | Four selected failures: cancel/unmount deferred keydown registration and swallowed active/drop-tail immediate clicks. |
| `final-mutations/mutation-deferred-add.log`             | Three selected failures: keydown registration after cancel, unmount and natural completion before deferred attach.    |
| `final-mutations/mutation-pointer-cleanup.log`          | Two selected failures at line 501: immediate rail click is swallowed after active and drop-tail cancellation.         |

These mutants change only the named guard/retirement operation; imports are unchanged and each log reaches the corresponding test assertion. The retained drivers restore original production bytes in `finally`; live-byte comparisons confirm the final candidate, not a mutant, is installed. No mutation was rerun during this no-production-edits review.

## Independent execution and preservation

Using the explicitly supplied executable, verified **Node v24.22.3**, then ran directly from the repository:

```text
/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node node_modules/vitest/vitest.mjs run src/app/components/ColorPalette src/app/components/Layout --maxWorkers=1
```

**Exit 0: five files / 84 tests passed**, duration 46.29 s. Fresh output is `../palette-h1-implementation/independent-audit-focused.log`. Also independently ran scoped ESLint with explicit `--ext .js,.jsx` on all four implementation files: exit 0, no diagnostics. Scoped `git diff --check` passed. No timeout, activation threshold or assertion was changed.

Preservation readbacks:

- Layout production hash matches the accepted plan.
- The entire H2 describe block is byte-identical to its pre-H1 snapshot. Shared fixture changes consist only of the required `ResizeObserver.unobserve` stub; H2 assertions pass in the fresh focused run.
- StatusNotice production/test and Layout.test hashes match the first three entries of the accepted H2 manifest.
- All **93 entries** in the accepted CLI canvas artifact `source-after.json` still match current lengths/hashes, with zero mismatches. This is preservation verification only: no CLI test, build, render, decode or artifact reacceptance occurred. The independently accepted fourteen-output artifact stage remains accepted on its original evidence.

## Remaining gates and files

The required immutable-build Chromium/Firefox stage remains unexecuted here: native rail Enter and Space independently, real pointer capture/click delivery, exact historical active-before-hide sequence, stale-key isolation, root/controller/canvas/draft preservation, rail focus across frames, genuine spatial move/drop and moved-item focus, and fresh/history narrow two-Escape behavior. Broader root/cross-component verification and native platform/AT requirements remain as previously specified. A focused jsdom pass does not clear those gates.

Created only this audit document and the external fresh focused-test log. No implementation revision requested; no new approval layer or scope expansion introduced. **ACCEPT is limited to the exact H1 source/unit stage above.**
