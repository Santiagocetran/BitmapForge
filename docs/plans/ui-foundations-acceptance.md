# Independent acceptance — revised UI foundations plans

## Verdict

**ACCEPT for implementation of #82–#86. No remaining plan-design blocker.** Acceptance applies to `ui-foundations.md` **including its authoritative UF-R1–R4 and phased verification addendum**, not the superseded ambiguities in its original body. `audit-resolutions.md` is a disposition index, not evidence that behavior already works. This review independently checks those dispositions against source and the original mandatory objections.

Baseline: `298bdec17dcd1603add549118a743e5cd494ba08`, branch `gloin/ui-output-improvements`. Root governance read; optional `CODEX.md` and the four referenced `COLLAB` documents are absent. Initial tracked worktree was clean. Issue mapping is from local `issues.json`; no remote issue state was fetched or changed. This is static plan acceptance, **not implementation acceptance, runtime reproduction, or passing-test evidence**.

| Issue | Plan verdict | Bounded implementation outcome |
| --- | --- | --- |
| #82 / UF-1 Palette | **Accept** | Separate edit/drag activators; validated draft transactions, external-mutation invalidation, keyboard/non-drag reordering, measurable touch targets and explicit focus priorities. |
| #83 / UF-2 Drawer | **Accept** | One modal settings presentation with stable external export controller, explicit responsive state/focus ownership and dialog-local picker portal. |
| #84 / UF-3 Hierarchy | **Accept** | Working disclosure and compact desktop rail, Look heading, persistent idempotent Export & Project reveal, preserved UI state and stable preview. |
| #85 / UF-4 Export semantics | **Accept** | Nine native pressed buttons in a named group, non-color indicator and stable description association; controlled panel with no fallback hook. |
| #86 / UF-5 Status | **Accept** | One textual app-status presenter across modal hosts; PreviewCanvas duplication removed; specified producer cleanup and shared shortcut save path. |

The user-selected current sol model is unchanged. This acceptance does not authorize publication, commit/push, deployment, dependency churn, creative-output implementation, or renderer/schema changes.

## Mandatory-objection verification

### #82: interaction contract is now concrete

Source confirms shared drag/edit button (`ColorPalette.jsx:55–62`), direct draft writes (`82–87`), index identities (`190–199`) and hover-only preset deletion (`126–134`). `renderingSlice.js:29,36–49` caps replacement palettes at six, limits UI removal at two, and does not validate `setColorAt` indices or strings.

UF-R1 resolves all five original objections:

- **Blur versus discard:** Enter and ordinary same-picker blur commit; dismissal, leaving the picker and explicit Close cancel. Capture pointer intent before blur, treat keyboard Close as a cancellation destination, and never commit on unmount. Thus the original broad “Enter/blur” wording is not permission to commit during dismissal.
- **Origin/identity:** UI-local token plus palette revision and synchronous own-write tagging distinguish self edits from undo/import/preset/other setters. Unmatched mutation cancels edit and drag; bounds/revision are rechecked before writing. No persistent IDs or global store-validation migration is needed.
- **Focus:** explicit Close/Escape, outside destinations, structural initiators, removed swatches and parent hiding have distinct priorities. Parent restoration wins; hidden triggers are never valid return targets.
- **Touch:** handle-only `touch-action:none`, 8px activation, keyboard sensor, click/tap move alternatives and 44×44 targets are testable. Bounded horizontal palette scrolling is the accepted 320px solution when six targets cannot fit; shrinking targets is not.
- **Bounds claim:** existing Add/Remove bounds are retained without falsely claiming a global imported-palette minimum.

Browser event ordering, touch and external changes remain required implementation evidence, not reasons to delay coding further.

### #83: lifetime and modal architecture are settled

`ExportPanel.jsx:53–61` currently owns the hook and selection; `useExport.js:260–311` has an abort ref but no disposal effect, downloads unconditionally after awaiting a handler, and accepts late progress. A responsive remount cannot safely be called persistence.

UF-R2 explicitly chooses one Layout-owned `useExportController`, under the existing provider and outside presentation branches; it calls `useExport` once. The panel is controlled through `selectedFormat`, `onSelectFormat`, `exportSelected`, `cancelExport`, `saveProject`, `loadProject`, `exporting`, `disabledReason`. No hidden desktop/mobile copies or panel fallback hook are allowed. Owner disposal must invalidate progress, completion and download, including results from nonabortable handlers; mere abort signalling is insufficient. Closing/resizing does not dispose that owner.

Required surviving UI state is named: section values, format, rail state, Look advanced disclosure and preset-name draft. Mobile content unmounts normally on close; palette draft cancels. Both opener identities and both responsive focus directions are specified, including preservation of unrelated preview focus.

`App.jsx:24–28` confirms help is a sibling, not a Layout descendant. The revised dialog-local picker container, explicit help coordination and removal of Layout's global Escape listener address the actual structure. `useKeyboardShortcuts.js` has no Escape branch; a generic guard alone would not fix stacking. Interpret “topmost only” with the stated close-picker-before-help policy: a picker cancelled to open help is not resurrected when help closes. Test picker→Escape→drawer separately from help→Escape→drawer.

### #84–#85: disclosure and controlled semantics are implementable

`Layout.jsx:15–35,142–165` confirms desktop ignores disclosure and Export starts open. `QualitySettings.jsx:63` owns the advanced state that responsive remount would lose. `PreviewCanvas.jsx:21–108` creates/disposes the manager on mount and already observes size; stable placement is necessary and speculative engine resizing work is not.

UF-R2/R3 preserve all defaults and surviving state, genuinely hide collapsed bodies, close child portals, and sequence export reveal through committed refs with cancellation rather than timeouts. Export access never downloads. The narrow keyboard-operable project-load button resolves the inaccessible hidden-input/label path in `ExportPanel.jsx:124–134` without expanding project-file semantics.

UF-R2/R3 also settle UF-4's ownership condition: generated description ID, unchanged format names/identifiers, APNG initial, one pressed item, native Tab/Enter/Space rather than radio arrows, adapted controller fixtures rather than a duplicate hook for old tests. Image+Embed and exporting-disabled behavior remain unchanged.

### #86: missed presenter and producer paths are included

`PreviewCanvas.jsx:128–136,243–265` duplicates global errors and can clear a valid model on dismissal. Its model/text/image starts and failures (`158–211`) retain stale messages. `statusSlice.js:9–10` merges partial fields; export/save (`useExport.js:275–307`), import (`ExportPanel.jsx:68–83`) and shortcut save (`useKeyboardShortcuts.js:33–36`) confirm the other cleanup gaps.

UF-R4 now includes all those files/paths and removes the destructive global-error CTA in favor of generic nondestructive dismissal. The producer table clears counterpart fields, keeps each producer's own busy flag, and explicitly limits concurrent-operation message ordering. Do not attempt to solve that admitted single-message limitation with a new queue/schema in this delivery. Busy labels use operation-specific fallback rather than displaying another operation's stale success.

One app-status presenter does not mean removing dnd-kit or every live region. Empty polite-region updates, alert precedence, modal host movement and deferral while help is topmost are specified. Track status revisions separately from host changes: moving unchanged text must not be treated as a new status event; a status received during help is delivered after help closes. Exact screen-reader behavior still needs real verification and must be reported honestly if unavailable.

## Two disjoint implementation workers

**Recommend exactly two owners: A owns palette alone; B owns Layout/export/status/hooks and integration. Do not allocate #85 to a third worker.** The original suggestion that UF-4 can be independent is superseded for this handoff by its controlled-panel dependency.

### Worker A — #82 only

Exclusive writes:

- `src/app/components/ColorPalette/ColorPalette.jsx` and colocated palette-only helpers/tests.
- `test/e2e/palette-ui.spec.js` (dedicated spec avoids racing B's integrated file).

Implement the full UF-R1 transaction/focus/touch/reorder/preset contract. Consume existing store actions; detect palette revisions by subscription/ref locally, without changing store schema/actions. No Layout, App, QualitySettings, export, status, shared CSS, package or shared browser-helper edits. Request a narrowly reviewed handoff if an actual shared-file need appears; do not edit it concurrently.

### Worker B — #83–#86 plus integration

Exclusive writes:

- `Layout.jsx` and layout tests; optional `SettingsSection` and `useMediaQuery` helpers.
- `ExportPanel.jsx` and tests; new `useExportController.js` and tests; `useExport.js` and hook tests.
- `ui/StatusNotice.jsx` and tests; `PreviewCanvas.jsx` and integration tests, restricted to the agreed global-status overlay/producer cleanup, not rendering behavior.
- `QualitySettings.jsx` and tests only for controlled advanced disclosure.
- `App.jsx`, `useKeyboardShortcuts.js`, `ShortcutsModal.jsx`, and a small callback/context bridge if needed for shared save/help coordination. Do not add another export controller at App level. App's current shortcut hook is above the provider, so wire the stable Layout callback explicitly rather than assuming it can consume a descendant context.
- Required `styles.css` rules, `Layout.test.jsx`, `test/e2e/ui-foundations.spec.js`, and existing export-browser helpers/tests only when accessibility/mounting changes require them.

B owns all cross-panel integration, status hosting, focus scheduling and final shared verification. Do not modify A's files to integrate; use the agreed boundary below and return palette defects to A.

### Palette/Layout boundary to pin before parallel edits

Use this small UI-only interface (names may be changed jointly before either worker starts; behavior is fixed):

- Layout supplies `portalContainer` (element inside Dialog.Content on mobile, default document host on desktop).
- Layout controls preset-name draft and whether its editor is shown through `presetDraft`, `onPresetDraftChange`, `presetSaveOpen`, `onPresetSaveOpenChange`; this is the existing local preset UI state, not a project-store field.
- Palette exposes `interactionRef.current.cancel({ restoreFocus: false })` to cancel drag, discard draft, close picker and suppress pending child restoration. B calls it before section/rail hiding, drawer close, breakpoint removal and help opening. Palette also cancels during its own unmount; that cleanup must not commit or refocus. B owns the subsequent visible focus destination.
- Palette remains uncontrolled for actual color values, using the existing store. Standalone palette tests can omit optional integration props; Layout supplies controlled preset state. No color schema or undo ownership crosses this boundary.

B can wire this interface while A works; A can test a fake modal host/cancel caller without editing Layout. A's browser spec may depend on B's integrated drawer behavior, so final execution waits for both. Run **both** new UI specs, not only the originally named integrated spec. No shared test file is jointly owned.

## Execution order and remaining gates

1. Pin the boundary above. A implements #82 in parallel with B's stable controller/controlled-panel and disposal tests.
2. B implements single-tree drawer, responsive focus, disclosure/export access, then status hosting/producer cleanup and help/save bridge. Integrate A's picker in the real modal and test both openers and transition directions.
3. Independent implementation review examines the actual integrated diff against the original acceptance plus authoritative addenda. Material defects are blockers to completion; this plan acceptance does not waive them.
4. Final exact-tree Node 20 verification retains the revised plan's root lint/format/tests/build, embed tests/build/gzip/alias, CLI build/tests, `test:export`, existing export visual suite and both UI specs. `.github/workflows/ci.yml` confirms format/embed/CLI checks; Playwright config confirms an existing server may be reused, so verify server identity. Inspect prebuild-generated tracked embed output and exclude unrelated changes.
5. Retain transaction/lifetime/focus/history/status/geometry/download matrices, required viewport/short-screen/zoom/reduced-motion checks and actual visual inspection. Screen-reader, mobile Safari and real touch evidence must be distinguished from emulation/unavailable coverage. Missing manual capability is an explicitly unverified criterion, not a fabricated pass or a new architecture blocker.

**Not pre-implementation blockers / not extra scope:** renderer or shared engine redesign, persisted palette IDs, universal import validation, radio redesign, generic shortcut redesign, status queues, operation attribution schema, broad styling/dependency fixes, creative-output research/font approvals, or CI workflow repair. The separate creative CI-S release gate remains separate; this UI task changes no engine or deployment workflow. Main pushes currently deploy production from the check job; no push/deploy is authorized.

## Artifact and review limitations

Only `docs/plans/ui-foundations-acceptance.md` is authored by this review. No application/test code was changed or executed. Source inspection, governance/baseline/status checks and local plan/issue mapping support the acceptance; runtime criteria remain future implementation gates. Plan artifacts are ignored locally: retain/share this file intentionally; clean tracked status does not publish it, and force-adding is not authorized.
