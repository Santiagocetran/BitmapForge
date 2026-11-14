# Independent implementation audit — all-30 JSX remediation

## Verdict and transfer clearance

**ACCEPT the bounded remediation of 01–18 and X01–X12. No corrective application change requested. Explicitly ACCEPT the standalone exact-glob configuration refinement. ACCEPT the frozen validator helper API for read-only historical consumers. The helper-review barrier is cleared; recommend parent authorize the planned historical cleanup now and explicitly transfer ShortcutsModal source/test ownership to that worker.** This audit supplies independent technical clearance, not permission to expand the historical worker's approved allowlist.

**Root lint still FAILS: exit 1, fourteen historical errors, zero warnings.** Acceptance of all thirty remediations is not green lint, CI, merge, build-artifact or release approval. Historical cleanup must remove its actual findings and rerun the gate, not tolerate a count of fourteen.

Reviewed branch `gloin/ui-output-improvements`, baseline/HEAD `298bdec17dcd1603add549118a743e5cd494ba08`, actual dirty-tree implementation, original plan and binding plan-audit addendum, implementation handoff, AGENTS and web-product-development guidance. All fourteen files in the implementer's handoff manifest independently match their recorded SHA-256 snapshots after verification. No application/config/test edits by this reviewer; no reset/stash/commit/push/deploy/remote action.

## Independently executed verification

All Node commands used `npx --yes --package=node@20 -c '<installed tool command>'`; observed Node v20.20.2 and React 19.2.4. Each exit below was captured separately.

| Gate | Observed result |
| --- | --- |
| Exact plan §8 six-file focused Vitest command, default concurrency | Exit 0; **6 files, 92 passed**. |
| Layout alone, `--maxWorkers=1` | Exit 0; **12 passed**. Lifetime 1447ms, disclosure 684ms, unchanged budgets. |
| Validator, QualitySettings, ShortcutsModal, `--maxWorkers=1` | Exit 0; **3 files, 37 passed**: 33 direct validator, three disclosure, one real Radix callback. |
| Both palette and UI-foundations Playwright specs, one worker | Exit 0; **30 passed (4.5m)**. All original 22 and eight added cases exercised. |
| Explicit 19-file lint without `--ext` | Exit 1; **two errors, zero warnings**, only ShortcutsModal `open` / `onOpenChange`. No ignored JSX warning. |
| Existing `src/engine/loaders/bitmap.browser-smoke.mjs` lint | Exit 0; zero errors/warnings. |
| `eslint --print-config` for Layout | Exit 0; prop-types, refs and set-state-in-effect remain severity `[2]`. |
| `npm run lint -- --format json` | Exit 1; **175 records, fourteen errors, zero warnings**. |
| `eslint --ext .js,.jsx . --format json` | Exit 1; **175 records, identical fourteen diagnostic identities**, zero warnings. |
| Scoped fourteen-file Prettier; `git diff --check` | Both exit 0. |

An initial reviewer command mistakenly named the nonexistent keyboard-shortcut test instead of useExport.test.js; Vitest passed only five matched files/73 cases. It is **not** the six-file acceptance evidence. The exact six-file command was subsequently rerun and passed all 92; separate logs retain both results.

Tests retain the established 83 focused cases plus two bridge and seven notice cases. Source inspection retains all 21 original notice expectations (recognized stages, bounded/invalid progress, overlap, error, dismiss, help), ten original Layout cases, real panel/controller/PreviewCanvas deferred lifetime, cancellation spies and the existing native browser interactions. Delivery assertions await deliberate postcommit work; no skipped tests, lowered expectations or timeout increases were used for this remediation. The Layout lifetime still has 15000ms; disclosure uses the unchanged default 5000ms. Cumulative tracked diffs include earlier accepted UI architecture changes; comparison with HEAD alone must not misattribute those changes to this lint worker.

## Source and behavioral findings

### Callable contracts and frozen helper

The helper exports twelve concrete `(props, propName, componentName) => Error | null` validators: optional/required boolean, string and function; renderableChildren, headingRef, bridgeRef, interactionRef, exportFormat and cancelExport. Required primitives reject nullish values; optional primitives allow them. Direct tests invoke both valid and invalid values, not just renders or metadata existence. All nine format identifiers are individually exercised; invalid/missing formats and each required callback reject correctly. Cancel is required during export and wrong supplied types fail even idle. Nullish QualitySettings local fallback and current callback forwarding are tested.

Children accept the documented bounded node set (including fragments, elements and nested arrays), reject nested plain objects/functions/symbols, and are not falsely advertised as every possible ReactNode. Ref tests cover nullable current, complete bridge methods, cancellation and optional keyboard predicate; callback/node refs are supported. No blanket any/always-null substitute or transitive prop-types dependency. `headingRef` is browser-DOM metadata, not a promised server-side Node validation API. React 19 does not automatically invoke function-component propTypes; direct invocation is the relevant contract proof, not an automatic runtime-checking claim.

Frozen helper SHA-256 independently confirmed:

- Source: `086ad6b456fa19e56b1f4193ac1dd7992978fb2b644968d24486c9db381e68b6`.
- Tests: `886ec85d2dfb8ccc4f97f92e146d0f76a803cd391821bd80f52a45e5b09c32ae`.

Historical cleanup may **import accepted exports read-only**, not mutate/extend this helper or introduce a parallel generic validation framework. Missing specialized schema contracts belong to the separately assigned owner/scope.

ShortcutsModal source/test match frozen hashes `f4334dd6a28bb71cd0e5a128168777516242cbb53c88aed13d21cd67b14e6dc1` and `00cca0235fb62afd376c850f692a50305da57893caa145edac103c8d15609c4a`. **Clear source/test transfer after parent authorization.** Preserve optional onCloseAutoFocus metadata and the real latest-callback / preventDefault / restored-focus test while adding historical open/change contracts. The real Radix event test passed independently.

### Committed refs, bridge and focus

Layout's first layout effect publishes committed drawer-live state, with no render write or dependency-cleanup reset. Next comes a fresh bridge each commit, capturing current save/responsive closures; identity-guarded cleanup precedes republishing and clears only its own object. Host/inert/reveal work follows. This relies on installed Radix deferred close-autofocus behavior, not a false parent-before-child layout-effect guarantee.

Tests prove changed save callback/error propagation, fresh handle identity, old/new ref detachment, own unmount cleanup, external replacement survival and StrictMode usability. Hoist-safe named fixtures publish cancellation via useImperativeHandle. Native browser tests prove both opener Close/Escape/backdrop matrices, genuinely new close/reopened drawer identity and focus across frames, parent active-drag cancellation, both breakpoint directions, help/picker cancellation and subsequent ordinary Escape. Ctrl+S saves latest serialized pixelSize once per invocation across rerenders/breakpoints; failure is nondestructive and recovery works.

### Status delivery and host stability

StatusNotice now subscribes to the actual selector-enabled external store in layout, schedules one coalesced microtask per turn, and reads latest status at delivery. It first commits empty; committed suspension unsubscribes and invalidates that lifetime. Both callback delivery and deferred functional-updater processing check lifetime activity. Equal visible fields retain identity. No synchronous effect setter, render ref read/write, queue/history while suspended, arbitrary timer or new global adapter.

Captured jobs and actual React commits cover pre-subscription state changes, initial/update/resume cancellation, unmount, latest-only resume, delivered-but-uncommitted transition followed by synchronous suspension, StrictMode discarded lifetime and isolated subscriptions. Browser assertions preserve the exact original polite element through both host directions, observe zero unchanged-host mutations, freeze hidden message/error changes and publish final resume text once. These are DOM/lifecycle proofs, not screen-reader announcement proof.

### Standalone glob refinement

The only config diff is `{ files: ['**/*.{js,jsx}'] }` inserted as its own object. The original unscoped browser globals/settings/rules, recommended configurations, severities, ignores and package script remain unchanged. This is a justified refinement to the plan's overly specific placement, not a suppression.

An independent **in-memory ESLint API probe** moved that same exact glob onto the globals block without editing repository config. Existing MJS smoke then has **thirteen no-undef errors** (URL/window/ImageBitmap/document/btoa/File/console); final standalone placement has zero. Thus retaining unscoped semantics prevents a demonstrated regression on already-discovered MJS, while explicit JSX and root lint prove new discovery. CJS applicability is structurally preserved by leaving the unscoped block unchanged; no new CJS fixture is claimed.

## Exact historical attribution

Independently piped each of the nine affected files from `git show 298bdec:path` into installed ESLint with `--ext .js,.jsx --stdin --stdin-filename path --format json`; all nine exits are 1. Current and historical **file/rule/message identities match**, not merely totals or shifted line numbers.

| Remaining source under src/app | Actual errors |
| --- | --- |
| components/ErrorBoundary/ErrorBoundary.jsx — children | 1 |
| components/ModelUploader/ModelUploader.jsx — compact | 1 |
| components/PluginControls/SchemaControls.jsx — schema, values, onChange | 3 |
| components/PresetGallery/PresetGallery.jsx — colors, colors.slice | 2 |
| components/RotationGizmo/GizmoCanvas.jsx — two render ref writes | 2 |
| components/TextInput/TextInput.jsx — unused FONT_LABELS | 1 |
| components/ui/InfoTooltip.jsx — content | 1 |
| components/ui/ShortcutsModal.jsx — open, onOpenChange | 2 |
| context/SceneManagerContext.jsx — children | 1 |

All original eighteen plus binding twelve targeted diagnostics are absent. Relative to the audited expanded inventory, this removes 28 UI-added findings and two adjacent historical Layout contracts, with no substituted new diagnostic. The actual fourteen remainder is **not cleared** by passing tests/formatting.

## Isolation, artifacts and remaining gates

Reviewer started its own Vite server on **5323**, unique external cache/output paths, HMR false; HTTP 200 verified. It served current source, not the old immutable pre-remediation build. Both URL variables targeted this server. Results were outside served root; configured browser budgets and tracing policy were retained. No other server was stopped. Reviewer server is stopped after verification, not promised live for parent reuse.

All twelve screenshots were produced at the six specified reduced-motion viewports. Visually inspected desktop closed (meaningful rendered cube preview) and 320px export drawer (Close, focused export heading, export action and project controls visible with bounded scrolling). Automated geometry/nonblank tests passed. Manual screen reader, Safari/iOS, physical touch and real 200% zoom remain unverified.

Sibling scratch artifacts prefixed `ui-jsx-independent-`: exact-focused/layout/contracts/browser logs; root/expanded/scoped/MJS/print-config JSON; historical JSON and attribution script; isolated Vite config and cache; config-probe MJS; browser results/screenshots. Parent retains ownership of combined-tree historical cleanup and final root/workspace/embed/CLI/decode/export/build/CI gates. No approval of concurrent ZIP/engine/CI changes or existing built artifact is inferred.
