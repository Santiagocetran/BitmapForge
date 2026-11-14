# Independent audit — JSX lint remediation plan

## Decision and authority

**Request bounded revisions to scope/completion; accept the proposed focus/ref and status-delivery designs subject to the concrete tests below.** Implementation may proceed against the original plan **plus this binding addendum**. This document supersedes its §§2, 7 and 9 wherever they would permit the twelve implementation-added findings outside the original eighteen to remain at UI completion. A narrow worker handoff is permissible; completion of only that handoff is not completion of this remediation or the UI implementation.

Reviewed `gloin/ui-output-improvements`, HEAD/baseline `298bdec17dcd1603add549118a743e5cd494ba08`, with concurrent uncommitted UI/export/engine/CI changes. Read AGENTS, the original plan, accepted UI foundations requirements, independent repair audit, lint config/manifest, actual Layout/App/notice/controller/ExportPanel/fixture/quality/help/store sources and installed Radix FocusScope teardown. COLLAB records are absent. This review writes only this document; it neither edits nor accepts concurrent Code ZIP work.

## Independently reproduced evidence

All Node execution used `npx --yes --package=node@20 -c '<command>'` and installed tools; no dependencies or configuration changed.

- Expanded `node node_modules/eslint/bin/eslint.js --ext .js,.jsx . --format json`: **ESLint exit 1, 44 errors, zero warnings**, independently parsed. Each currently failing historical JSX file was then linted from `git show 298bdec:path` through `--stdin --stdin-filename path`, without replacing checkout files. Layout.test and StatusNotice are absent in that baseline. Attribution agrees with the plan: **16 surviving historical findings and 28 implementation-added findings**; historical affected sources contain 17 errors because removed Layout.defaultOpen is not a current survivor.
- The repair audit's exact nine-file explicit-JSX command reproduces **18 errors, zero warnings**. Plain explicit Layout lint produces an ignored-file warning, not a component pass. The expanded command's failure was retained independently; subsequent passing tests do not clear it.
- Independently reran the exact six-file focused command in plan §8: **6 files, 83 tests passed**, default concurrency, unchanged budgets. Layout lifetime 8595ms and disclosure/draft 3337ms. Expected negative-path export/save errors and jsdom navigation warnings were emitted.
- Independently reran Layout alone with `--maxWorkers=1`: **10 passed**, lifetime 2050ms, disclosure/draft 699ms. No timeout edits.
- The accepted repair audit's **22 Chromium tests** remain prior independent evidence, not a new browser run by this plan reviewer. This review does not claim to have executed the proposed remediation, added timing tests, or final browser gate.

## Binding scope extension: all twelve outside-slice UI findings

The original eighteen dispositions remain mandatory, including fixing the two adjacent baseline Layout title/children contracts. The twelve below are **additional mandatory UI remediation**, not optional historical-debt follow-ups. Parent must coordinate file ownership before writes. Do not collide with the concurrent export owner. Either assign that owner this contracts-only follow-up after its current diff stabilizes, or transfer these exact files explicitly to the remediation worker. No simultaneous edits to shared ExportPanel files.

| ID | Exact current location / contract | Required bounded implementation |
| --- | --- | --- |
| X01 | ExportPanel.jsx:50 selectedFormat | Callable validator accepting exactly the nine supported identifiers: apng, gif, webm, spritesheet, css, react, webcomponent, embed, zip. Required for the controlled production interface. Reject unknown/non-string values. |
| X02 | ExportPanel.jsx:51 onSelectFormat | Required callable validator. Preserve native pressed buttons and identifier routing. |
| X03 | ExportPanel.jsx:52 exportSelected | Required callable validator. Preserve the single controller/export path. |
| X04 | ExportPanel.jsx:53 cancelExport | Callable when supplied; require it when exporting is true, since the visible Cancel button must work. Absence while idle remains compatible with current fixtures. |
| X05 | ExportPanel.jsx:54 saveProject | Required callable validator. No producer/serialization changes. |
| X06 | ExportPanel.jsx:55 loadProject | Required callable validator. Preserve file-input cancellation, reset and real file handling. |
| X07 | ExportPanel.jsx:56 exporting | Optional boolean validator; omitted idle fixtures are currently supported. No truthy arbitrary-value validator. |
| X08 | ExportPanel.jsx:57 disabledReason | Optional string validator, including empty string. Preserve visible reason and disabled action behavior. |
| X09 | ExportPanel.test.jsx:17 Fixture.route | Optional callable validator on the named fixture; preserve its default and all nine format cases. Do not exempt tests. |
| X10 | QualitySettings.jsx:8 advancedOpen | Optional boolean contract; preserve nullish local fallback and controlled disclosure behavior. Explicitly support null if retaining the current nullish API; test the selected contract consistently. |
| X11 | QualitySettings.jsx:8 onAdvancedOpenChange | Optional callable contract; retain local setter fallback when absent/nullish. No controlled-state redesign. |
| X12 | ui/ShortcutsModal.jsx:11 onCloseAutoFocus | Optional callable contract forwarding the actual Radix event. Preserve preventDefault and latest App bridge restoration. Do not replace it with a no-op to satisfy lint. |

Authorized extension of the *proposed implementation* allowlist: the four existing files above, shared `uiPropValidators.js` and its direct tests already listed, plus dedicated `QualitySettings.test.jsx` / `ui/ShortcutsModal.test.jsx` only if needed for the contract regressions. This is a bounded four-file interface repair, not permission to propagate validators through unrelated components, edit export hooks/builders or accept the ZIP feature. Changes to the four production/fixture files should be metadata/imports and focused tests only; unexpected behavior changes require re-audit.

Required direct tests cover all supported format values and rejection, each callback's valid/invalid/required behavior, cancel conditionality, optional idle booleans/strings, nullish disclosure fallback and forwarding the help autofocus callback. Attach meaningful callable `.propTypes`; React 19 function components do **not** run these automatically. Invoke validators directly in tests; passing component renders alone does not prove validation. Reuse small concrete validators, not an `any`, always-null function, imported transitive package, new framework, rule setting or suppression.

**Completion obligation:** original 18 plus X01–X12 must be absent from final diagnostics. Together this removes 28 UI-added and two adjacent historical findings. After that, the expected remainder is the fourteen historical findings below, subject to source-grounded concurrent-tree attribution. Any split follow-up must land and be independently checked before the parent labels UI lint remediation complete. A ticket or future-owner promise alone does not discharge X01–X12.

## Fourteen genuine baseline findings and honest durable gating

These may remain explicitly classified existing debt without expanding this feature into an unrelated gizmo/schema refactor:

| Historical source | Remaining findings |
| --- | --- |
| ErrorBoundary | children (1) |
| ModelUploader | compact (1) |
| PluginControls/SchemaControls | schema, values, onChange (3) |
| PresetGallery | colors, colors.slice (2) |
| RotationGizmo/GizmoCanvas | two render-time handlersRef assignments (2) |
| TextInput | unused FONT_LABELS (1) |
| ui/InfoTooltip | content (1) |
| SceneManagerContext | children (1) |
| ui/ShortcutsModal | open, onOpenChange (2) |

Adding only the new help callback contract deliberately leaves its two historical contracts visible. Fixing them incidentally is allowed only by explicit scope coordination; then update the expected remainder downward, never manufacture fourteen errors to match this ledger.

**Selected gate policy:** retain `npm run lint` as `eslint .`; add `files: ['**/*.{js,jsx}']` to the existing final config block as proposed, preserve every current rule/severity and existing ignore, and verify print-config plus actual JSX inclusion. Root and independent `--ext .js,.jsx .` must agree. Do not add file exclusions, eslint-disable, rule relaxation, test exceptions, a success exit wrapper, a threshold allowing arbitrary fourteen errors, or a debt allowlist inside ESLint.

With this explicit inclusion, root lint is expected to **fail** on the classified historical remainder. That is honest discovery and durable enforcement, not a green root gate. Report two separate facts: (1) UI-added lint debt eliminated with the expanded/scoped evidence; (2) whole-tree lint blocked by enumerated baseline debt. Do not advertise green CI/merge/release readiness on that tree. If root lint is a mandatory merge gate, the parent must commission a separately scoped cleanup of those fourteen before merging; this audit does not authorize disabling that gate or relabeling failure as success.

A diagnostic comparison against historical stdin source may serve as a supplementary regression report, but cannot replace root lint or turn its nonzero exit into a pass. Match file/rule/contract, not only line numbers/counts, because edits move lines and can substitute new errors for old ones. Recompute after concurrent ZIP work; unrelated newly introduced diagnostics require their own owner, not reclassification as baseline.

## Focus and bridge design disposition

**Accept plan §5**, grounded in Layout.jsx:108,148–171,183–197,347–350 and App.jsx:19–23,37–39, with these implementation checks:

- Publish drawerLive in the first ordered layout effect before host/inert/reveal work, never render or passive-only synchronization. Do not clear this committed-state mirror during ordinary dependency cleanup. This is not a parent-before-child layout-effect guarantee: installed Radix FocusScope uses passive teardown and its deferred unmount-autofocus callback (`dist/index.mjs:71–101`). The latest committed mirror must precede that consumer.
- Publish a fresh local bridge each commit in the selected layout effect. Capture that commit's current save callback and responsive closures. Cleanup clears only the exact object it installed; changing the supplied ref detaches the old ref and installs the new one. Explicit tests must prove external replacement survives cleanup, final unmount clears own handle, rerender uses a changed save callback, ref replacement works, and StrictMode leaves a usable handle. An empty dependency array or unconditional cleanup null is not equivalent.
- Preserve synchronous beforeHelp capture/cancel before App opens help. Preserve disabled/disconnected/hidden invoker fallbacks, one real controller, and error propagation. Named mock fixtures publish handles through commit-phase hooks with hoist-safe imports; tests retain cancellation spies and real deferred lifetime integration.
- Retain ordinary Close/Escape/backdrop for both openers; test immediate close/reopen before stale Radix restoration, both 1024px boundary directions, help, active drag parent cancellation and subsequent ordinary Escape. Do not introduce application timers to imitate Radix timing. Native Ctrl+S after callback/settings rerender and breakpoint transitions must yield one current-content download, with failure/recovery behavior retained.

Existing passing behavior is not an argument to leave render writes. Conversely these lint findings are not evidence of a demonstrated runtime outage.

## StatusNotice delivery disposition

**Accept the bounded external subscription design in plan §6**, not render-time derivation and not a cosmetic asynchronous wrapper around the old effect. Source confirms selector-enabled subscribe/getState is available. One layout-effect lifetime per suspended state, effect-local active/queued flags and a coalesced queueMicrotask latest-state read are sufficient in principle; no new store adapter/schema/global cache is justified now.

Required invariants and evidence:

1. The original polite node first commits empty even with preloaded status; suspended mount stays empty. Capture this synchronously at a commit boundary, then flush explicitly, rather than asserting only eventual text.
2. All deliveries use latest getState at delivery. Catch status changes between render and subscription through initial scheduling. Multiple changes in one turn deliver the final selected presentation, not history.
3. Committed suspension unsubscribes and invalidates old queued callbacks; resume schedules latest only. Prove active→suspended before flush, resume→suspended/unmount before flush, StrictMode discarded setup and two isolated instances. Guard against an obsolete generation publishing after a newer committed suspension; if an already-enqueued React state update exposes that race in testing, fix the lifecycle rather than weakening freeze assertions.
4. Freeze both error and message while help is open. On resume show latest once; retain error precedence/dismiss, recognized stage/bounded progress, generic overlap/loading fallbacks and no focus changes. Equality compares the selected visible fields and avoids unnecessary publication/DOM text mutation.
5. Retain the same component, portal target and original status element across appendChild host moves; unchanged settings/rail/disclosure/host movement must not rewrite text or duplicate app status/alert. Keep dnd-kit's separate accessibility live regions.
6. Retain all original 21 notice cases. Convert synchronous assertions to awaited act/observable waits only where delivery is deliberately postcommit, without deleting expectations, cases or raising timeouts. Browser tests must observe original node identity and text mutations during help updates and both host directions.

The microtask boundary is justified as cancellable/coalesced postcommit external-store delivery, not an arbitrary elapsed delay. It guarantees neither a browser paint nor an assistive-technology announcement between empty and populated commits. Manual screen-reader behavior remains explicitly unverified; do not claim it from DOM stability or lint success.

## Required final verification / report

Use the original plan §8 exact commands and unchanged budgets: six focused files retain all 83 original cases, isolated Layout retains all 10, both browser specs retain all 22, plus added regression/validator tests. Original lifetime 15000ms and disclosure/default 5000ms remain unchanged. Preserve genuine export/controller/PreviewCanvas lifetime coverage and browser native keyboard cases; injected status is not encoder fidelity. Inspect/identify any reused server and keep caches/results outside served root.

Expand the explicit lint target list to include **all four extension files, their added tests and validator files**, not merely the original nine. Require zero diagnostics on all newly remediated files except the two explicitly surviving ShortcutsModal baseline contracts; show their exact residual diagnostics separately. Verify `--print-config`, explicit JSX without --ext (no ignored warning), root lint and expanded JSON. Capture each command exit separately, then scoped Prettier and diff-check; formatting does not clear lint failure.

Final independent implementation audit must inspect the actual diff, validator negative tests, focus/notice races, native browser results and final baseline delta. Parent owns exact-final-tree root/workspace/build/decode/export/CI gates after concurrent work; this document is not release approval. Unavailable screen reader, Safari/iOS, physical touch and real 200% browser zoom remain explicit limitations.

**Result:** the plan is implementable with this binding scope addendum. The twelve exclusions are rejected; fourteen unrelated historical findings may remain classified, but never hidden or described as a passing root lint gate.
