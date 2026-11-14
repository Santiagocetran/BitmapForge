# Independent audit — UI foundations implementation plan

## Decision and evidence

**Overall: revise before implementation.** UF-4 is ready subject to its shared ownership contract; UF-1 needs interaction details; UF-2/UF-3 need a concrete lifetime design; UF-5 misses an existing error presentation and status producers. The proposed scope and reuse of installed Radix/dnd-kit are appropriate. No new UI dependency is warranted.

Independent source review of `docs/plans/ui-foundations.md` against HEAD `298bdec17dcd1603add549118a743e5cd494ba08`, branch `gloin/ui-output-improvements`. Read root governance; optional CODEX/COLLAB files are absent. Reviewed component/hook/store sources, existing test coverage and build/Playwright/CI configuration. This is a **static plan audit**, not runtime reproduction or an implementation audit. No app code, tests, dependencies, issues, remote state or deployment were changed. Only this review is authored.

| Issue | Verdict | Required disposition |
| --- | --- | --- |
| UF-1 Palette | Approve direction; revise interaction contract | Resolve blur versus discard, structural/external updates, touch activation and focus precedence. |
| UF-2 Drawer | Blocked on architecture decision | Select stable export-controller owner and explicit closed-content/modal lifecycle; specify initiator-aware focus return. |
| UF-3 Disclosure/export access | Approve direction; integrate after UF-2 revision | Preserve required state, specify export defaults/focus and nested portal closure. |
| UF-4 Export semantics | Approve with integration condition | Native pressed buttons are valid; agree on controlled selection/controller interface before editing shared files. |
| UF-5 Status | Changes required | Include PreviewCanvas duplication/producers and reconcile one-notice promise with remaining status paths. |

## Mandatory revisions

### UF-1 — define edit transactions and structural changes

The source finding is accurate: `ColorPalette.jsx:55–87` combines sorting and double-click editing, writes incomplete hex directly, and uses unmanaged popup dismissal. IDs derive from indices (`190–199`), not values. Preserve duplicates and avoid a project-schema migration.

1. **Resolve competing blur/close rules.** A close-button pointer press normally blurs the field before its click handler. “Commit on blur” can therefore commit a draft that “close discards” promises to discard. Document an event policy: explicit close/Escape cancels the draft, ordinary field blur validates/commits, and outside dismissal has a declared commit/discard rule. Avoid committing again during unmount or programmatic focus restoration. Test valid and invalid drafts with each path, including clicking a different swatch directly.
2. **Define update origin handling.** Local reorder/remove/preset handlers alone do not cover undo/redo, project import and other preset applications. Close or resynchronize the picker on external palette replacement; distinguish that from its own `setColorAt`/picker updates so normal editing does not immediately close. Cancel an active drag if the palette is replaced. Verify duplicate values and a shortened palette cannot write beyond the intended index.
3. **Separate focus priorities.** Drag/move-button completion may focus the moved swatch; clicking a preset, Add or Remove must not have its intended focus stolen by Popover autofocus. Override close autofocus when the owner is collapsed/unmounted or a new picker opens. Do not restore focus into the closed drawer. Specify which surviving control receives focus after removal.
4. **Choose real touch behavior.** Pointer sensors alone do not guarantee touch dragging inside a scrollable drawer. Put appropriate `touch-action` on the drag handle only, select activation constraints, and retain vertical scrolling from the rest of the palette. Earlier/later controls are the required non-drag alternative. Define a measurable target size/spacing policy, including preset delete, rather than merely “comfortably touchable.” Six-column layout is conditional on meeting it; use bounded horizontal scrolling if necessary.
5. Fix the acceptance wording: the current `setColors` only caps the maximum (`renderingSlice.js:29`); it does not enforce a two-color minimum for arbitrary imports/presets. Preserve existing Add/Remove limits without claiming global validation that is outside this issue.

### UF-2 — settle controller lifetime before branching the tree

The modal defect is established by `Layout.jsx:78–106,111–175`. The proposed responsive branch will remount descendants even when their component names match. `ExportPanel.jsx:53–61` currently owns both `useExport` and format state; `useExport.js:260–311` owns an abort ref. It has **no unmount cancellation effect**: unmount does not necessarily stop its asynchronous download, but leaves an old operation alive while a new hook can mount. Describe this accurately rather than relying on accidental continuation.

Required concrete design in the revised plan:

- Prefer a stable Layout-level controller/selection owner under the existing SceneManagerProvider, outside the desktop/mobile presentation branch. Pass its actions and selected format into the single presentational ExportPanel. Include the controller interface and tests in file scope. Do not retain a second fallback `useExport` invocation inside the panel while also calling it above.
- Mount only one settings presentation. Mobile Dialog content may unmount normally on close once the export owner and section-open state are above it. Explicitly decide whether other local UI state (Look advanced disclosure, preset-name draft) must persist; lift only required state, discard palette drafts on dismissal. These are not project settings and need not enter Zustand/history.
- Do **not** solve lifetime merely by force-mounting a closed modal Dialog. Installed modal layers have side effects beyond CSS visibility. If a persistent approach is chosen instead, prove closed-state removal of focus trap, accessibility hiding, pointer suppression and scroll lock. A `hidden` wrapper alone is not that proof.
- Track the opener: ordinary Open settings dismissal returns to Open settings; an Export & Project-opened drawer should return to that export action. Explicit export access overrides initial Close focus to reveal/focus the export heading/control. Breakpoint transition must never invoke a hidden mobile trigger's focus restore.
- On entering desktop, close child popovers before their old owners disappear and move focus only if it was in the removed drawer. Do not steal unrelated preview focus. Define both directions, including focus inside desktop settings when switching to closed mobile.
- Name the nested portal host/layer strategy. Confirm Popover content is inside the dialog's allowed focus/assistive-technology scope, and help remains above the drawer and picker. `ShortcutsModal` is an App sibling (`App.jsx:26–27`), not a lexical child of Layout.

`useKeyboardShortcuts` has no Escape handler, so its `defaultPrevented` omission is not the explanation for the current double-Escape behavior. Removing Layout's global Escape listener is required. A guard may still be useful for consumed keyboard events; test it rather than assuming it fixes modal stacking. Do not silently broaden this into shortcut redesign.

### UF-3 — specify defaults, visibility and export focus

The desktop disclosure finding is correct (`Layout.jsx:15–35`). Require the following small clarifications:

- Declare whether Export & Project starts open. Current source defaults it open. Preserve that default unless explicitly choosing otherwise, and update browser helpers by accessible disclosure controls if changed.
- Retain mounted accordion bodies where required, explicitly hide closed content, and close portalled child popovers. CSS hiding the accordion does not hide its body-level portal. Cover whole-sidebar collapse, section collapse, drawer close and responsive transition with the same policy.
- Export access is an idempotent reveal/focus action. Sequence section expansion and scrolling after the real target mounts; cancel stale pending focus when the drawer closes or breakpoint changes. Avoid arbitrary timeouts. Use reduced-motion-aware scroll behavior.
- Preserve a stable PreviewCanvas/SceneManager instance across rail and drawer changes. PreviewCanvas already observes its container size (`PreviewCanvas.jsx:47–56`); test resulting dimensions and nonblank output rather than modifying rendering code speculatively.
- Make a deliberate decision about keyboard project loading: `ExportPanel.jsx:124–134` uses a nonfocusable label and `display:none` file input. An “Export & Project” access action does not fix that inaccessible workflow. Either include a narrow keyboard-operable load trigger and test it, or explicitly defer it and avoid claiming the whole Project workflow is keyboard accessible.

### UF-4 — retain the proposed native button pattern

The plan is correct: nine buttons and local APNG default exist, with styling-only selection. `aria-pressed` plus an accessible group and non-color indicator is a coherent small change. No radio roles or arrow-key behavior should be implied.

Agree with the layout owner on controlled selection/controller props before parallel work; existing tests currently render `<ExportPanel />` and mock its hook, so lifting ownership requires adapting tests, not silently preserving a duplicate controller for compatibility. Use a generated stable description ID. Keep format names unchanged so existing accessible-name E2E locators continue working. Test actual Enter/Space activation in Playwright; `fireEvent.keyDown` alone is not native browser button activation.

### UF-5 — missed preview duplication is a blocker

**The plan does not yet achieve its own one-error-presentation criterion.** `PreviewCanvas.jsx:243–265` repeats `status.error` in a full-canvas overlay, with an “Upload different file/image” or Dismiss button. `128–133` can clear the model when this action is used. An export/save error uses the same global error field and can therefore show an inappropriate upload CTA. Removing only ExportPanel paragraphs leaves a second visible error and inconsistent dismissal.

1. Add PreviewCanvas to reviewed/editable scope. Make StatusNotice the single textual global-error presentation. Remove or narrow the existing error overlay; preserve an intentional input-recovery affordance without duplicating the global error or clearing a valid model for export failures. Given the no-schema-change boundary, prefer generic nondestructive dismissal over inventing error-source attribution.
2. Include narrow loading-status cleanup in PreviewCanvas. Model/text/image start paths (`158,179,201`) clear errors but retain old messages; failure paths (`168,189,211`) also retain messages. Under the proposed “relevant message or fallback” rule, a previous “APNG exported” can appear while loading. Specify how the message is made relevant; clear stale messages at loading start/failure or use an operation-specific fallback. Include text/image paths, not only model loading.
3. Enumerate export, save and load status transitions. `useExport` success/failure paths retain counterpart fields, and save success (`304`) does not clear error. Dismissing a seeded `{error, message}` state must not reveal the old message. Do not indiscriminately reset unrelated `loading`/`exporting` flags. Declare handling/limitations for concurrent loading and export because one shared message cannot accurately label both operations.
4. Clarify that “exactly one active notice” means one app-status presentation, not one global ARIA live region. Keep dnd-kit announcements. Define empty-region behavior and test announcement when opening a drawer with an existing message. Remounting a polite live region already containing text is not a reliable announcement mechanism.
5. Shortcut Ctrl+S bypasses `useExport.saveProject` and suppresses failures (`useKeyboardShortcuts.js:33–36`). Either explicitly limit this delivery's save-status acceptance to the panel action or include the narrow shared save-status path; do not claim every project-save route is covered.

## Missing tests to add to the plan

Existing ExportPanel tests cover default/routing and useExport tests cover selected export/cancel paths. They do not establish modal, palette, save/load status or lifetime behavior. Add these concrete cases beyond the existing acceptance lists:

- **Palette transaction matrix:** valid draft then explicit Close versus ordinary blur versus outside click; invalid draft then Escape; switch swatches; external undo/import during editing and dragging; duplicate colors; removed index; focus after owner collapse. Touch drag on a handle must not prevent scrolling elsewhere.
- **Real lifetime test:** start a deferred export, select a nondefault format, close/reopen, cross both breakpoints and resolve the operation. Assert one controller/operation/download, correct final status, preserved format, and stable manager. Count invocations with StrictMode accounted for; do not confuse development effect replay with duplicate live owners.
- **Focus matrix:** both openers, both resize directions, nested picker → help → Escape, outside click to another control, browser back-to-back reopen, and Tab after whole-sidebar collapse. Assert focus remains visibly reachable, not merely that an activeElement exists.
- **Status integration without stubbing away the defect:** render real PreviewCanvas error presentation (mock the manager/WebGL as necessary), prove only one textual global error and no destructive model reset on export failure. Cover stale success → model/text/image loading → failure → dismiss; failed save → successful save; failed project import → subsequent success.
- **Status visibility under secondary modal:** specify what happens when Keyboard Shortcuts is the topmost modal and updates arrive; the settings notice is then legitimately outside that modal's accessible scope. Do not claim continuous accessibility in every nested surface without a policy.
- **History/schema:** assert opening/closing/collapsing/selecting an export format does not append undo entries or change serialized project settings.
- **Geometry/export:** nonzero preview dimensions after collapse/expand, six swatches at 320px, short-screen scroll/close access, persistent export action without overlap, no unintended download from access, and genuine download after export completes.

Keep browser-only assertions in Playwright/manual checks. The current matchMedia stub cannot exercise transitions, and unit canvas/Three mocks cannot prove rendered output. Screen-reader, mobile Safari, zoom and touch results must be reported as verified or unavailable, not inferred from screenshots or desktop emulation.

## Safe implementation order and ownership

1. Revise this plan to resolve controller ownership, focus return, palette draft policy and PreviewCanvas status scope. Independent review must accept material revisions before implementation.
2. Agree on one layout/export interface. UF-4 semantics and UF-1 palette can then proceed independently; serialize ExportPanel/controller changes with the layout owner. Do not race shared test or component files.
3. Land stable controller/selection ownership with lifetime tests, then UF-2 modal/breakpoint structure. Keep PreviewCanvas stable. Verify nested portal behavior with the updated palette before broad disclosure integration.
4. Add UF-3 section/rail disclosure and persistent export access; verify hidden content/portals and preview resize. Add UF-5 presentation only after its inside/outside modal host is settled, including the narrowed PreviewCanvas cleanup.
5. Independent final audit examines the integrated diff and these revised acceptance criteria. Fix and re-audit material findings, then run final verification on that exact result. Plan approval is not final implementation approval.

## CI and deployment safety

The proposed local verification omits parts of actual CI. `.github/workflows/ci.yml` runs lint, **format:check**, Vitest, build, embed build/gzip-size/alias checks, and a separate CLI build/test job. Include `npm run format:check` and relevant embed/CLI CI-equivalent checks in the final gate, or explicitly report any not run. Root Vitest includes `src` and `test/integration` only (`vite.config.js:18`), not separate export-decode tests or CLI tests. Run `npm run test:export` as additional export regression coverage when controller changes affect exports, plus both specified Playwright suites. No claim that `npm test` covers them all.

Use Node 20 as declared. Build invokes prebuild and rewrites the tracked public embed bundle; review git diff and exclude unrelated generated changes. Avoid broad format/fix commands and incidental dependency/lockfile changes. Playwright reuses an existing localhost:5173 server; ensure it serves this checkout/revision before trusting results.

**A push to main automatically invokes `npx vercel --prod` in the check job (`ci.yml:47–52`).** It does not depend on the separate CLI job, and CI currently runs no Playwright/browser checks. Therefore a green unit/build check is not browser approval, and a main push may deploy before CLI results are available. Keep this work local: no push, deploy or issue writes are authorized. Do not change deployment workflow as a side effect of this UI delivery; any eventual release must be separately authorized after final audit and verification.

The local plan/review documents are ignored artifacts; do not assume a clean tracked status publishes them or makes them available in a future PR. Parent must retain/share them deliberately without force-adding or publishing absent authorization.
