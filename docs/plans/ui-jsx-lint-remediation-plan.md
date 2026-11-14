# Bounded UI JSX lint remediation — plan for independent audit

**Status: plan only; independent approval required before implementation.** Branch `gloin/ui-output-improvements`, HEAD `298bdec17dcd1603add549118a743e5cd494ba08`, with accepted but uncommitted UI implementation and concurrent unrelated work. This author owns only this document. No application, test, configuration, dependency, or export implementation is changed here. No reset/stash/commit/push/deploy/remote action is authorized.

## 1. Evidence and scope

Read `AGENTS.md`, `ui-foundations.md` including its authoritative UF-R1–R4 addendum, `ui-foundations-fixes-independent-audit.md`, actual Layout/notice/fixture/shortcut/App/store source, lint configuration, package manifest, and installed lint/Radix internals. `CODEX.md` and the four referenced COLLAB records are absent. Existing acceptance of behavioral UI-A1/A2/A3 is retained, not reopened merely because lint fails.

Independently executed for this plan, using Node 20 through `npx --yes --package=node@20 -c '<command>'`:

- The audit's exact nine-file `eslint --ext .js,.jsx` gate: **exit 1, 18 errors, zero warnings**, reproduced at the cited source locations below.
- Plain `eslint src/app/components/Layout/Layout.jsx`: exit 0 **with ignored-file warning**, not a component pass.
- Whole-tree `eslint --ext .js,.jsx . --format json`: **exit 1, 44 errors, zero warnings**, 171 processed file records. Diagnostic inventory is below. A wrapper explicitly retained ESLint's exit instead of mistaking a subsequent successful reporting command for lint success.
- Every currently failing JSX source that exists in `298bdec` was independently piped from `git show 298bdec:path` to ESLint with `--ext .js,.jsx --stdin --stdin-filename path`. Layout.test.jsx and StatusNotice.jsx do not exist in that baseline. No checkout replacement was used.
- A scratch stdin-only syntax/lint probe of the proposed notice pattern (layout-effect subscription, cancellable/coalesced `queueMicrotask`, setter only in its callback, custom boolean validator) passes the installed lint rules, exit 0. This is **not** an implemented component or behavioral acceptance.

Evidence lives outside the served checkout in sibling scratch `ui-jsx-plan-expanded-current.json`, `ui-jsx-plan-baseline-attribution.json`, and `ui-jsx-plan-attribution.py`. One initial inline attribution command had a Python quoting error; the script retry completed. None of these files is application code.

The independent repair audit, not a new run by this plan author, establishes **83 focused tests / 10 isolated Layout tests / 22 Chromium tests** passing at unchanged budgets. Its evidence is the behavioral baseline, not evidence of a passing post-remediation tree. The acceptance and command matrix below must be rerun after implementation.

## 2. Ownership: exact proposed implementation allowlist

After independent approval, one UI remediation worker may edit only:

1. `eslint.config.js` — explicit JSX discovery only; no rule relaxation or expanded ignores.
2. `src/app/components/Layout/Layout.jsx` — contracts and commit-phase ref/bridge publication only.
3. `src/app/components/Layout/Layout.test.jsx` — named fixture contracts/ref publication and narrow regression cases.
4. `src/app/components/ui/StatusNotice.jsx` — contract and bounded postcommit snapshot delivery.
5. `src/app/components/ui/StatusNotice.test.jsx` — retain all existing cases and add timing/cleanup coverage.
6. `src/app/utils/uiPropValidators.js` — new, small concrete validators shared by only these components/fixtures; no validation framework.
7. `src/app/utils/uiPropValidators.test.js` — direct positive/negative validator tests.
8. `test/e2e/ui-foundations.spec.js` — only focused close/reopen, bridge/save/help and notice regression coverage. Preserve existing cases and context evidence handling.

This plan document may receive audited revisions from its owner. Any additional implementation file requires explicit parent approval and a scope amendment first. In particular do **not** edit ExportPanel, useExport/controller, codeExport/exportConfig, their tests, the generated embed, CI, engine, ColorPalette or palette browser spec. These are concurrent/accepted owners' files. The new validators must not be propagated throughout the tree in this slice. No package/lockfile changes, new dependency, eslint-disable, test exemption, timeout increase, arbitrary timer, global refactor, status-schema/producer rewrite, controller duplication, or export-feature changes.

## 3. All 18 findings: individual disposition

Line numbers identify the pre-change working tree. `P` = `react/prop-types`, `R` = `react-hooks/refs`, `S` = `react-hooks/set-state-in-effect`.

| ID | Exact diagnostic | Baseline attribution | Bounded disposition |
| --- | --- | --- | --- |
| 01 | Layout:19 `title` (P) | Surviving baseline | Section string/title validator; preserve accessible heading. |
| 02 | Layout:19 `open` (P) | UI-added controlled contract | Required boolean validator. |
| 03 | Layout:19 `onToggle` (P) | UI-added controlled contract | Required function validator. |
| 04 | Layout:19 `children` (P) | Surviving baseline | Real renderable-children validator; do not replace content/visibility strategy. |
| 05 | Layout:19 `headingRef` (P) | UI-added contract | Optional supported callback/object ref validator; actual callers use callback refs. |
| 06 | Layout:75 `bridgeRef` (P) | UI-added bridge | Optional mutable ref-object validator with explicit nullable current/bridge methods. |
| 07 | Layout:75 `helpOpen` (P) | UI-added contract | Optional boolean validator, preserving false default. |
| 08 | Layout:184 `bridgeRef.current` (P) | UI-added bridge | Same real bridge-ref validator; remove render write, not validation rule. Reconfirm resulting diagnostics, since this nested read/write disappears. |
| 09 | Layout:108 `drawerLive.current` (R) | UI-added mirror | Publish committed `!desktop && drawerOpen` in the first ordered Layout layout effect; never in render/passive-only synchronization. |
| 10 | Layout:184 `bridgeRef.current = …` (R) | UI-added bridge | Ordered layout-effect publication and identity-safe cleanup, latest closures every commit (section 5). |
| 11 | Layout.test:43 `interactionRef` (P) | New test file | Named PaletteFixture with explicit interaction-ref validator. |
| 12 | Layout.test:43 `presetDraft` (P) | New test file | String validator on named fixture. |
| 13 | Layout.test:43 `onPresetDraftChange` (P) | New test file | Function validator on named fixture. |
| 14 | Layout.test:44 `interactionRef.current` (P) | New test file | Validator covers nullable current/cancel contract; publish via commit-phase ref hook, not render. This line currently reports P, not an additional R finding. |
| 15 | Layout.test:55 `advancedOpen` (P) | New test file | Named QualityFixture, boolean validator. |
| 16 | Layout.test:55 `onAdvancedOpenChange` (P) | New test file | Named QualityFixture, function validator. |
| 17 | StatusNotice:4 `suspended` (P) | New component | Optional boolean validator, preserving false default. |
| 18 | StatusNotice:9 synchronous `setDisplay` in effect (S) | New component architecture | Subscription-delivered cached presentation with cancellable postcommit initial/resume delivery; section 6. No synchronous effect setter. |

Total reproduced: **15 P + 2 R + 1 S = 18**. Two surviving findings are baseline Layout title/children; sixteen concern UI-added constructs/contracts. Baseline Layout also had `defaultOpen` validation debt, but that prop was removed and is **not** a nineteenth current finding. Existing palette file-level suppressions are not extended, removed, or cited as evidence of fully validated palette contracts.

## 4. Real validators under the installed React 19 stack

There is no prop-types dependency or existing positive custom-validator strategy in `src`; the palette's two existing suppressions are not a usable validation strategy. Manifest React is `^19.1.1`, installed React is **19.2.4**. React 19 no longer automatically checks function-component `propTypes`: [React upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops-for-functions). Therefore attach explicit `.propTypes` metadata to satisfy the existing static rule using **real callable validators**, but do not claim automatic runtime checking. JSDoc may document the interface but cannot alone satisfy that gate. A TypeScript migration, imported transitive prop-types package, blanket `any`, always-null validator or runtime checker framework is rejected.

Use small pure `(props, propName, componentName) => Error | null` functions, with meaningful errors, explicit required/optional behavior and direct unit tests. Validate the actual supported string, boolean, function, renderable child and mutable-ref contracts. Renderable validation must accept actual fragments/elements/text/arrays/empty children and reject plain objects/functions/symbols; do not introduce a partial general-purpose React-node interpreter. Use React's child/element facilities where practical and test nested invalid children. Heading ref accepts null/undefined, callback or supported mutable ref object; bridge ref accepts absence but otherwise requires an object with a `current` slot, initially null or an object containing callable `saveProject`, `beforeHelp`, `restoreHelpFocus`. Palette fixture interaction ref similarly allows null current or a callable `cancel` (optional callable keyboard predicate if supplied). Do not dereference refs during render to perform manual runtime validation.

The installed `eslint-plugin-react/lib/util/propTypes.js:395–525` recognizes custom validator declarations as declared contracts, including nested accesses; no `customValidators` rule option is needed. Lint success alone cannot demonstrate validators are meaningful: their tests must call them with valid/invalid props, nullable initial refs, installed handles and missing required members. Keep validators concrete and limited to this allowlist; no repository-wide adoption in this phase.

In Vitest mock factories, define named fixture components and attach their validators **inside the factory**, importing needed React hook/validator bindings via async factory imports if necessary. This avoids accessing uninitialized top-level imports through hoisted `vi.mock`. PaletteFixture publishes its spy-backed cancel interface with `useImperativeHandle(interactionRef, …)` rather than a render write. React manages fixture ref detachment; verify StrictMode setup/cleanup and retain the cancellation spy assertions. Keep the deferred lifetime test's real ExportPanel/controller/PreviewCanvas, scoped accessible queries and unconditional cleanup.

## 5. Commit ordering, drawer focus and latest bridge

### Drawer-live ref

Keep the synchronous ref read in `onCloseAutoFocus`, but move its write into an early `useLayoutEffect` keyed to `desktop` and `drawerOpen`, **before Layout's existing host/inert/reveal/resize-focus layout effect**. Do not reset drawerLive during each dependency cleanup: it represents the latest committed drawer state, not subscription ownership. Render must not mutate it, and an abandoned render must not publish state.

This is not a claim that parent layout effects precede child layout effects. Installed Radix `react-focus-scope/dist/index.mjs:75–101` dispatches its unmount autofocus from passive teardown using its own deferred callback. The early Layout layout effect is committed before that installed consumer runs. The old close callback still needs to see a newly reopened drawer as live, suppressing stale opener restoration. Retain resizing/help guards, parent-first palette cancellation and recorded opener semantics. If implementation/browser evidence contradicts this ordering, stop for an amended design instead of adding timers or moving synchronization to a passive effect.

### Bridge

Prefer a **layout effect after drawer-live synchronization and before Layout host/focus work**, with no dependency array: publish a fresh local bridge object every commit and return cleanup that clears `bridgeRef.current` **only if it is still that exact object**. Capture that commit's `controller.saveProject`, desktop/drawer state, and current ref-based invoker/cancellation behavior. No render mutation, no stable-callback subsystem, and no missing-dependency suppression. This matches the prior bridge's per-render identity without publishing speculative renders; caller App dereferences `.current` at invocation rather than caching a handle.

`useImperativeHandle(bridgeRef, createHandle, deps)` is installed/supported, but ordinary object-ref cleanup unconditionally nulls the ref and does not itself express the required identity guard against replacement by another owner. A React 19 callback-ref cleanup adapter could provide it, but adds indirection without a present need. The explicit layout effect is the smaller selected option. Avoid empty dependency arrays that freeze save/focus closures. StrictMode setup→cleanup→setup must leave a usable latest bridge; final unmount clears its own handle, not another owner's replacement. Changing the supplied ref must detach the old handle and publish to the new one.

Before help opens, synchronous `beforeHelp` still captures the invoker and cancels pending reveal/picker work before App sets help state. Restore visible connected non-disabled invokers, otherwise drawer Close or the correct desktop/mobile fallback. Preserve Ctrl+S and save error propagation through the existing single controller. No App/shortcut-hook edit is planned; prove that existing consumers keep working.

## 6. Notice: smallest bounded subscription, not a new store adapter

Keep the **same StatusNotice component, same noticeNode portal target, same polite DOM node**, empty initially, and Layout's `appendChild` host movement. Do not key/remount the notice when the drawer moves. Pure selection retains UI-A3 logic unchanged: error wins; export-only uses recognized bounded stage/progress or `Exporting…`; loading-only uses `Loading model…`; overlap uses generic export fallback; idle uses message. Busy buttons stay generic. Error dismiss still clears error/message without touching valid source.

Selected approach: local `display` state plus one `useLayoutEffect([suspended])` managing the existing Zustand **external subscription**, not the current render subscription/effect-derived mirror:

1. State starts null so the region first commits empty. Remove `useProjectStore(s => s.status)` from this component; use the store's existing selector-enabled `subscribe` and `getState` API (`subscribeWithSelector` is already installed in useProjectStore).
2. When suspended, retain display unchanged, do not subscribe/publish; cleanup from the previous committed effect invalidates pending deliveries before help commit finishes. No status queue/history is stored while hidden.
3. When active, subscribe to status changes and schedule one initial postcommit `queueMicrotask`. Both subscription notifications and initial/resume use the **same coalesced scheduler**. The task reads latest `getState().status` at delivery, not a captured intermediate snapshot.
4. An effect-local `active` flag plus `queued` flag bounds delivery. Cleanup sets inactive and unsubscribes; pending old jobs become inert. Resume creates a new generation/closure and schedules only latest. No render-time ref access or setter. No synchronous effect setter, `fireImmediately` workaround, timeout, frame delay or promise chain solely hiding a lint diagnostic.
5. Publish selected error/message with a functional state update that retains prior identity for equal visible fields. Ignore unrelated settings changes and status changes that do not change presentation. The microtask is a deliberate **after-commit empty-region/host-attachment boundary**, not a timing guess. It runs after the synchronous commit/layout sequence, including Layout's notice-host move. Mounted active updates share that boundary and coalesce within one turn.

A layout effect is chosen so committed help suspension cancels a queued active delivery immediately at that commit, rather than waiting for passive teardown. This effect synchronizes an actual external store; state is set only in later subscription-delivery callbacks. The installed lint probe accepts this mechanism, but final source must still be linted. No new helper hook/store, useSyncExternalStore adapter, global singleton cache or app status revision schema is needed. An external-store adapter is reserved for a demonstrated failure of these explicit tests, requiring new audit approval, not speculative complexity.

Preserve these edges: status between render and subscription is caught by initial latest read; suspended mount remains empty; active→suspended before queued initial/update delivery retains old display; multiple suspended changes resume to only the final state; resume→suspend/unmount before flush publishes nothing; StrictMode's discarded setup job does nothing; unchanged host move does not schedule publication/reinsert text; two independently mounted test notices have isolated subscription cleanup. No focus movement for status. Existing synchronous-after-render assertions may need `await act`/observable waits because delivery is now explicitly postcommit; retain every original expectation, test and timeout, rather than dropping cases or checking internal implementation flags.

DOM stability and text-mutation evidence are not proof of a screen-reader announcement. Manual screen-reader verification remains required/unverified if unavailable, as in the accepted plan.

## 7. Explicit JSX gate and broader findings: no blanket repair

Add `files: ['**/*.{js,jsx}']` to the existing final configuration object that holds browser globals/settings/rules. This deliberately registers JSX while preserving the existing flat config, recommended rules, ignores and JS behavior. Keep root `npm run lint` as `eslint .`; no package-script workaround, changed severity, extra ignore or lint baseline allowlist. Verify `eslint --print-config src/app/components/Layout/Layout.jsx`, explicit JSX lint without `--ext`, and root lint. Explicit file lint must produce actual diagnostics or a clean result, **not an ignored-file warning**. `--ext .js,.jsx` remains an independent cross-check.

Before that config change, the expanded whole-tree gate exposes **26 additional errors outside the 18**:

| Outside-slice source | Current count | Comparison with actual `298bdec` stdin lint |
| --- | ---: | --- |
| ErrorBoundary.jsx | 1 | Same children finding in baseline. |
| ModelUploader.jsx | 1 | Same compact finding in baseline. |
| PluginControls/SchemaControls.jsx | 3 | Same schema/values/onChange findings in baseline. |
| PresetGallery.jsx | 2 | Same colors/colors.slice findings in baseline. |
| RotationGizmo/GizmoCanvas.jsx | 2 | Same two render-ref findings in baseline. |
| TextInput.jsx | 1 | Same unused FONT_LABELS finding in baseline. |
| ui/InfoTooltip.jsx | 1 | Same content finding in baseline. |
| SceneManagerContext.jsx | 1 | Same children finding in baseline. |
| ui/ShortcutsModal.jsx | 3 | Two baseline open/onOpenChange; one UI-added onCloseAutoFocus contract. |
| QualitySettings.jsx | 2 | UI-added advancedOpen/onAdvancedOpenChange; historical source lints clean. |
| ExportPanel.jsx | 8 | UI-added controlled interface contracts; historical source lints clean. |
| ExportPanel.test.jsx | 1 | UI-added route fixture; historical source lints clean. |

Thus outside-slice **14 surviving baseline + 12 UI-added = 26**. Across all 44 current diagnostics: **16 surviving baseline + 28 UI-added**. The historical affected sources have 17 total diagnostics only because removed Layout.defaultOpen is also present historically; do not count it as a surviving current diagnostic. All attribution is against accepted source baseline, not the repair worker's later handoff.

This slice must eliminate its 18 and add zero new findings. It must **not** relabel the other 12 UI-added findings as historical debt or silently edit concurrent export files. Parent must assign those contracts explicitly after ownership coordination. The 14 genuine baseline findings need a separately authorized disposition as well if root lint is a merge gate. With this slice alone, expanded/root lint is expected still to fail with those 26 (subject to concurrent changes); record the exact final JSON delta. Configuration inclusion is successful discovery, **not** a root-lint pass or overall UI completion. No green CI/merge claim until the remaining gate is resolved by the parent. Rerun/classify after concurrent Code ZIP completion; inventory drift requires attribution, not forced matching of the number 26.

## 8. Verification and acceptance matrix (postimplementation)

Run all Node commands with `npx --yes --package=node@20 -c '<direct installed tool command>'`. Capture each exit independently; a later format/diff success cannot clear failed lint/test. No timeout/configuration budget increases.

| Gate | Required evidence |
| --- | --- |
| Validators | Direct tests of real valid/invalid values and required/optional/null contracts, nested children and ref handles; no noop validators. |
| Scoped lint | Original nine-file gate plus new validator files: exit 0, zero warnings. Also all eight allowlisted source/test/config files; JSX paths actually included without `--ext`. |
| Expanded discovery | Root `eslint .` and independent `eslint --ext .js,.jsx .` agree on included JSX diagnostics; JSON baseline/delta classifies all remaining findings by original source. Root failure remains explicit. Print-config confirms recommended react/prop-types, refs and set-state-in-effect remain enabled. |
| Notice unit timing | Retain original 21 cases (all nine recognized stages, 0/100%, invalid/NaN/out-of-range/obsolete text, overlap, error, dismiss, help). Add first-commit-empty before microtask, latest-only resume through several updates/error transitions, equal-presentation no DOM mutation, active/suspended races, unsubscribe/unmount, StrictMode, isolated instances. Observe DOM commits/mutations rather than just eventual text. |
| Layout bridge/ref units | Named fixture cleanup; bridge rerender uses latest mocked save callback; ref replacement detaches old; StrictMode handle usable; unmount clears only its identity and preserves a deliberately installed different handle; committed drawer ref does not trigger stale close focus. Retain disabled/disconnected invoker fallbacks and cancellation spies. |
| Focused actual integration | Run six-file command below at default concurrency; all original **83** tests remain, plus added tests. Run Layout alone `--maxWorkers=1`; all original **10** remain, plus additions. Deferred lifetime keeps real panel/controller/PreviewCanvas, one builder/download/manager and selected format across close/reopen/both breakpoints. Existing lifetime **15000ms**, disclosure **5000ms** remain unchanged. New async notice waits use existing default budgets. |
| Native browser regression | Run both existing palette and UI foundation specs, one worker, all original **22** tests plus additions, unchanged Playwright/expect/navigation budgets. Verify both opener ordinary Close/Escape/backdrop; immediate close→reopen before Radix deferred restoration; both 1024 boundary directions, unrelated preview focus, active drag Escape/drop/external cancellation and active-drag parent close/resize→reopen ordinary Escape. Help remains topmost and synchronous picker cancellation precedes parent restoration. |
| Keyboard help/save | Actual App bridge, native `?` from picker button (not typing), Escape help then drawer, valid/disabled/disconnected invoker fallback; Ctrl+S from desktop, mobile drawer and after rerender/breakpoint gives one download through current controller, saved project contents reflect latest settings, failure shows one nondestructive alert, later success clears error. Reuse existing load Enter/Space/cancel/import coverage. No synthetic-only keyboard acceptance. |
| Notice browser identity | Track exact original status element and text mutations across preview→drawer→preview and rail/disclosure changes. Unchanged status move must not replace node/change text; help receives multiple updates and resumes latest once after commit, no duplicate textual app notice/alert. Keep dnd-kit live regions. Injected states prove presentation only, not native encoder fidelity. |
| Responsive/visual | Inspect screenshots and assert geometry/nonblank stable preview at 1280×800, 1024×768, 1023×768, 390×844, 320×568 and 667×320 with reduced motion; no page overflow/clipped Close/export action, focus trap/background inertness/scroll restoration, one export tree, access makes no download. Physical touch, Safari/iOS, real 200% browser zoom and screen-reader announcements must be reported actual or unavailable, not inferred from emulation. |
| Hygiene and parent gates | Scoped Prettier and `git diff --check`. Parent runs exact-final-tree root tests/lint/format/build and required workspace/embed/CLI/decode/export/browser gates after concurrent work; build may regenerate embed, which this worker must not own/revert. No acceptance of ZIP/engine/CI/deployment is inferred from this slice. |

Exact retained focused command:

```sh
node node_modules/vitest/vitest.mjs run \
  src/app/components/ColorPalette/ColorPalette.test.jsx \
  src/app/components/Layout/Layout.test.jsx \
  src/app/components/ExportPanel/ExportPanel.test.jsx \
  src/app/components/ui/StatusNotice.test.jsx \
  src/app/hooks/useExportController.test.jsx \
  src/app/hooks/useExport.test.js
node node_modules/vitest/vitest.mjs run src/app/components/Layout/Layout.test.jsx --maxWorkers=1
node node_modules/vitest/vitest.mjs run src/app/utils/uiPropValidators.test.js
```

Retained browser command (run inside the Node 20 wrapper):

```sh
PALETTE_BASE_URL=http://127.0.0.1:5287 BITMAPFORGE_UI_URL=http://127.0.0.1:5287 \
  node node_modules/@playwright/test/cli.js test \
  --config=../bitmapforge-ui-playwright.config.mjs \
  ui-foundations.spec.js palette.spec.js --workers=1 \
  --output=../ui-jsx-remediation-browser-results
```

Port/config are the previous audit's values, **not assumed currently live**. Before reuse, inspect server PID cwd/cmdline and actual Vite config; check HTTP and checkout identity. If unavailable, parent may provision an isolated scratch config/server with unique cacheDir/port and HMR disabled; update both URL environment variables together. Keep results/screenshots/traces outside served root. Managed fixtures inherit configured evidence; manually created contexts require explicit instrumentation, not assumed trace coverage. Do not stop another worker's server. Reproduce timeouts in the affected file with one worker/profile rather than raising budgets.

## 9. Independent-audit decision gates

Auditor must inspect the selected concrete contracts, first-effect vs Radix close ordering, bridge identity cleanup/latest closures, mock-factory hoisting, and microtask subscription's mount/help race semantics against actual source before implementation is delegated. Material objections amend this plan before code. Final independent review must inspect implemented diff and run the matrix, not merely accept worker summaries. Accepted behavioral tests remain mandatory; this lint work is not permission to weaken them.

**Completion labels:** this deliverable is a source-grounded remediation plan with reproduced lint evidence. It is not implemented, not independently approved, not lint-clean, and not a production/release approval. Root discovery's remaining 26 findings and unavailable manual accessibility/platform checks remain explicit parent gates.
