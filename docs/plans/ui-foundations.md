# UI foundations — first delivery implementation plans

Status: **revised plan only; independent audit acceptance required before implementation**. Source baseline: `298bdec`. These are local issue-sized proposals, not published issues. No dependency migration, renderer changes, export-format changes, project-schema changes, or deployment is included.

## Delivery boundaries and shared decisions

- Reuse installed Radix Dialog, Popover, Accordion and dnd-kit; retain react-colorful. Native controls are preferred where sufficient. Do not add a second UI framework or drag library.
- Keep UI disclosure state out of project serialization and undo history. Preserve settings and selected export format while hiding/revealing panels.
- Match the existing Tailwind `lg` breakpoint (1024 CSS pixels) in responsive JS and CSS. Mobile drawers and desktop disclosure are different states; never infer modality solely from a CSS transform.
- Interpret desktop collapse as both making section disclosure work on desktop and providing a compact whole-settings collapse control. Persistent export **access** means a visible action opening/focusing the existing export controls, not a second export controller or automatic download.
- One active settings tree and one `ExportPanel`/`useExport` instance at a time. Do not render hidden desktop and mobile copies: this duplicates IDs, tab stops, announcements, and local export state.
- Coordinate shared `Layout.jsx` work through one implementation owner. Palette and export-semantic work can proceed independently; integrate status placement with the drawer before final audit.

## Issue UF-1 — Palette editing without double-click or drag dependence

### Source findings

`src/app/components/ColorPalette/ColorPalette.jsx`: `SortableColor` puts dnd-kit attributes/listeners on the same button whose only editing action is `onDoubleClick` (lines 55–63). Its hand-built popup has document-level outside-click/Escape handlers, no focus management, and an unnamed text input that writes every intermediate string into the store. Index-derived IDs mean a picker can silently refer to a different color after reorder. The six-swatch nonwrapping row can exceed the mobile panel width. Custom-preset delete is hover-only; preset-name input has only a placeholder. `renderingSlice.js` accepts color strings without validation.

### Small implementation changes / files

- In `ColorPalette.jsx`, make the swatch an ordinary single-click/tap/Enter/Space edit trigger. Give it a one-based accessible name such as “Edit color 1: #021a15”, visible focus indication, and Radix Popover trigger semantics. Put sorting attributes/listeners and `setActivatorNodeRef` on a separate named drag handle, never on the edit trigger.
- Use controlled Radix Popover with a labeled content region, collision padding, close button, and initial focus on the hex field. Remove bespoke popup positioning and document listeners. Escape closes the innermost picker and restores its trigger; outside pointer dismissal must not steal focus from the next clicked control. Ensure its portal remains usable inside the mobile Dialog.
- Keep a local hex draft. Accept `#RGB` and `#RRGGBB` on Enter/blur; expand short form before committing. Invalid/partial values never reach `setColorAt`; show associated inline error and `aria-invalid`, allowing correction. Escape/close discards an uncommitted draft; picker changes remain immediate and synchronize the draft. Label the input explicitly.
- Preserve dnd-kit sorting with explicit pointer and keyboard sensors and `sortableKeyboardCoordinates`. Add named “Move color N earlier/later” buttons in the editor so reordering also has a click/tap alternative to dragging; disable at the ends. Close the editor before applying reorder, preset replacement, or removal; restore focus to the moved color's edit trigger (or Add when its item disappeared). This deliberately avoids changing persisted color IDs/schema.
- Make the row fit six colors: use a six-column equal-width layout with `min-w-0`/full-width swatches, or a bounded horizontal scroll row if the audited touch targets cannot fit. Keep editing targets comfortably touchable and handles visually distinct; no page-level horizontal overflow. Update help text to describe edit and reorder separately.
- In the same component, label preset-name input and make delete controls reachable without hover (always visible on touch, visible on focus-within on desktop). Preserve palette limits and existing preset/store actions.
- Add `ColorPalette.test.jsx` beside the component; add palette scenarios to `test/e2e/ui-foundations.spec.js`.

### Regression tests / acceptance

- Click, tap, Enter and Space each open one named picker; editing does not start drag. Initial focus, Escape restoration, close button and outside dismissal work.
- Valid short/full hex commits; incomplete/nonhex input leaves the store unchanged and exposes an associated error. Picker updates and undo/preset changes do not leave stale drafts.
- Mouse/touch sorting, keyboard pickup/arrows/drop/cancel, and earlier/later buttons produce the expected order without opening the editor accidentally. Duplicate color values remain independently editable.
- Reorder/remove/apply preset while a picker is open cannot edit the wrong index. Two-color minimum and six-color maximum remain enforced; custom-preset save/delete work by keyboard.
- At mobile width the last swatch and picker are visible/reachable; no clipped picker, hidden focus ring or horizontal page overflow.

### Risks

Sorting and editing share key gestures unless activators are separated. Index keys require deliberate close/focus handling on structural edits. Popover portals, nested Escape handling and pointer capture must be verified in a real browser, not inferred from jsdom. Avoid broad store validation changes in this UI issue.

## Issue UF-2 — Mobile settings drawer: modal focus and inactive background

### Source findings

`Layout.jsx` keeps its translated-offscreen `aside` mounted and focusable. Opening removes the trigger from the DOM. It manually locks body styles and handles Escape globally, but has no dialog name/role, focus trap, return-focus behavior, or background inertness. `sidebarOpen` can stay true across the desktop breakpoint, leaving scroll locked despite hidden mobile backdrop. `ShortcutsModal.jsx` already demonstrates installed Radix Dialog usage.

### Small implementation changes / files

- Refactor settings contents into a small shared component inside `Layout.jsx` (extract only if needed). On mobile use controlled Radix Dialog Root/Trigger/Portal/Overlay/Content/Title/Close. Keep the trigger mounted; make its inaccessible open-state presentation the dialog's responsibility rather than conditionally removing it.
- Closed mobile content must be unmounted or truly hidden/inert, not only translated. Open content is named “Settings”, modal, initially focuses Close settings, contains keyboard focus, and returns focus to Open settings on ordinary dismissal. Use Radix dismissal/scroll locking instead of the global Escape and fixed-body effect; validate mobile scroll restoration before removing the existing iOS workaround outright.
- Background preview/toolbar must be unavailable to keyboard, pointer and assistive technology while modal. Radix modal primitives provide focus isolation and accessibility hiding; verify actual behavior. If native `inert` is needed, apply it only to a dedicated background sibling, never a common ancestor of the drawer or its nested portals. Clear it on every close, unmount and breakpoint transition.
- Add a `matchMedia` subscription (small local hook or `src/app/hooks/useMediaQuery.js`) to select presentation and close mobile state on entering desktop. Restore scroll and remove modal effects; if focus was in the unmounted drawer, focus the corresponding desktop settings heading/toggle rather than a hidden mobile trigger. Returning to mobile starts closed.
- Keep state that must survive responsive reparenting above the branch: section-open values and export selection. Keep active export work alive across drawer close; use a persistent content strategy or lift the export controller into a stable owner rather than unmounting its hook mid-export. Audit the exact component tree before implementation; do not duplicate controllers to solve this.
- Verify nested picker and keyboard-help Dialog stacking: first Escape closes the topmost surface only. Inspect `useKeyboardShortcuts.js` if handled events leak (it currently does not check `defaultPrevented`); add a narrow guard only when needed, with tests.
- Files: `Layout.jsx`, optional `useMediaQuery.js`, `styles.css` only for required viewport/scroll rules, `Layout.test.jsx`, `test/e2e/ui-foundations.spec.js`; `ShortcutsModal.jsx`/shortcut hook only for proven stacking fixes.

### Regression tests / acceptance

- Closed drawer contributes no tab stops or accessible settings controls. Opening by keyboard focuses Close; repeated Tab/Shift+Tab stays within drawer and active nested popover.
- Escape, Close and backdrop each dismiss and restore trigger focus; clicking inside does not dismiss. Background cannot be activated or programmatically focused while open.
- Scroll position/styles are restored after close and unmount; drawer content scrolls independently on short screens, with its close control reachable.
- Resize open mobile → desktop → mobile: no stale backdrop, body lock, inertness, hidden focus target or duplicate settings tree. Desktop controls remain interactive.
- Close/reopen during export, collapse sections, and cross breakpoint: no duplicate export, reset selected format, lost settings or orphaned controller. Nested picker/help close in correct order.

### Risks

A portal under an inert ancestor breaks nested controls. Radix accessibility hiding is not proof of native inertness or mobile scroll behavior. Responsive reparenting can reset local state or interrupt hook lifetimes. Resolve the persistent controller/content ownership in independent plan audit before coding.

## Issue UF-3 — Desktop disclosure, clearer Look heading, persistent export access

### Source findings

`Layout.jsx` fixes a 340px desktop sidebar; section chevrons are `lg:hidden` and closed bodies use `hidden lg:block`, so desktop ignores all disclosure state. Rotation Offset and Light Direction consequently ignore `defaultOpen={false}`. “Quality” actually contains render mode, pixel/character/dot controls, and post-effects in `QualitySettings.jsx`. Export is the final section of the same long scrolling sidebar.

### Small implementation changes / files

- Replace the custom `Section` disclosure with installed Radix Accordion (`type="multiple"`) or a small controlled wrapper around it. Full heading is the trigger; use generated linked IDs, `aria-expanded`, keyboard support and visible focus. Keep Input, Color Palette, Look and Animation initially open; Rotation Offset and Light Direction initially closed on all sizes.
- Preserve mounted content where needed for state/controller lifetime, but make collapsed bodies genuinely hidden (not merely height zero), removing all descendant tab stops. Close nested popovers before hiding their owner.
- Change visible heading “Quality” to **Look** and add short helper copy “Render mode, detail and effects.” Keep `QualitySettings.jsx` filename, store keys and renderer labels unchanged to avoid churn.
- Add desktop “Collapse settings” / “Expand settings” button with `aria-expanded` and `aria-controls`. Collapsed desktop uses a compact rail instead of 340px; preview grows. Focus remains on a visible toggle; no hidden panel tab stops. Desktop collapse state is independent of mobile open state and is session-local for this delivery.
- Add a persistent **Export & Project** access button outside the settings scroller (desktop rail/header and mobile preview toolbar/FAB area). It expands the desktop sidebar or opens mobile settings, expands the export section, scrolls it into view, and focuses its heading/first format control after opening. It does not export immediately. Keep one `ExportPanel`; do not create a second sticky full panel.
- Maintain usable preview space at short heights and ensure persistent action does not overlap playback, drawer trigger or canvas controls. Settings scroll area uses `min-h-0`; access action is outside it.
- Files: `Layout.jsx`, optional small `SettingsSection.jsx`, `styles.css` if needed, `Layout.test.jsx`, `test/e2e/ui-foundations.spec.js`.

### Regression tests / acceptance

- Every section can collapse/expand on desktop and mobile with keyboard and pointer; content disappears from focus order and its values remain unchanged on reopen.
- Rotation/Light defaults are honored. “Look” and helper text describe existing controls; render settings still work without schema changes.
- Whole-sidebar collapse visibly increases preview area and preserves state; expand remains available. Mobile toggle never inherits desktop collapse state.
- Export access stays visible at both ends of settings scrolling, with whole sidebar collapsed, and at short viewport heights. Activating it reveals and focuses the single export section without downloading.
- Existing export visual tests continue to reach format controls; if export is initially closed, update their helper to open Export & Project explicitly, rather than force-clicking hidden controls.

### Risks

Accordion unmount defaults can reset `QualitySettings.advancedOpen`, palette drafts and format selection. Force-mounted content still needs real hiding. Layout shift can resize the canvas; verify preview resizing rather than changing rendering code preemptively. This issue and UF-2 must share ownership of responsive structure.

## Issue UF-4 — Explicit selected semantics for export formats

### Source findings

`ExportPanel.jsx` stores `selectedFormat` locally (APNG default) and renders nine format buttons; selection is communicated only by green styling. Existing `ExportPanel.test.jsx` and export E2E helpers locate those controls as buttons.

### Small implementation changes / files

- Keep native buttons for the smallest compatible change. Wrap in `role="group"` with accessible name “Export format”; set `aria-pressed={selectedFormat === value}` on every format button. Exactly one is pressed, including on repeat activation of the active format. Do not add `aria-selected` to ordinary buttons or claim radio keyboard semantics.
- Associate the selected description via a stable ID and `aria-describedby` on the selected control/group as appropriate. Retain format values, labels, descriptions, and dispatch unchanged. Add a non-color selected indicator (small checkmark with `aria-hidden`, preserving button names) and visible focus styling.
- Keep selection state in a stable owner if UF-2/UF-3 changes mounting; do not serialize it into project state. Preserve existing exporting and image/embed disabled behavior.
- Files: `ExportPanel.jsx`, `ExportPanel.test.jsx`; browser scenarios in `ui-foundations.spec.js`. Replace tests' class-based primary-button lookup with an accessible-name lookup.

### Regression tests / acceptance

- All nine format buttons expose pressed true/false; exactly APNG is initially pressed. Selecting each by click/Enter/Space changes the sole pressed item, description and export action label. Re-selecting it cannot clear selection.
- Existing table-driven routing still passes for every format identifier. Image + Embed remains blocked; exporting disables the export action.
- Visible selection is distinguishable without green alone. Collapsing sidebar/section or closing/reopening drawer preserves selection.

### Risks

Do not mix toggle-button and radio patterns; native buttons use Tab plus Enter/Space, not arrow navigation. A later radio redesign is outside this delivery. If selection is lifted, preserve APNG default and existing callers/tests.

## Issue UF-5 — One status/error presentation, including inside the drawer

### Source findings

`Layout.jsx` separately renders `status.message`, `status.error` and a loading status; `ExportPanel.jsx` repeats error and completed message and uses the message again as its busy button label. `statusSlice.js` merges partial updates, so stale success/loading messages can coexist with errors. `useExport.js` catches errors without clearing its previous message. Removing the panel copy alone would hide all feedback from assistive technology when the preview is outside the active modal drawer.

### Small implementation changes / files

- Extract a small `StatusNotice.jsx` presentation component with one polite `role="status"` region and one mutually exclusive `role="alert"` error presentation; use deterministic precedence: error, exporting, loading, ordinary message. Loading uses the relevant message or “Loading model…” fallback; exporting uses message or “Exporting…”. Keep Dismiss error behavior.
- Render exactly one active notice: in preview area normally, inside settings drawer while it is modal. Keep it outside collapsible section bodies so feedback remains accessible when Export or another section is collapsed. Move ownership/presentation, not status state. Desktop collapsed rail still leaves preview notice available.
- Remove duplicated status paragraphs from `ExportPanel`. Keep its busy button disabled and use stable “Exporting…” text rather than echoing detailed progress already in the notice. Do not mark that button as another live region.
- In `useExport.js` and `ExportPanel` project-loading handler, narrowly clear stale counterpart fields on start/success/failure where necessary (failure clears message; success clears error). Add corresponding hook tests. On dismissing an error, do not resurrect the obsolete progress/success text. Do not rewrite every producer or change the status schema in this issue.
- Files: `Layout.jsx`, new `ui/StatusNotice.jsx` and test, `ExportPanel.jsx` and test, `useExport.js` and existing hook tests; `Layout.test.jsx` and browser integrated status scenarios.

### Regression tests / acceptance

- Model loading/success, export progress/success/failure and project load/save success/failure each show one relevant notice, not duplicate message text in panel and preview.
- When both error and message are populated, only the error is presented. Dismiss works; stale export progress does not return after failure dismissal. Subsequent successful operation clears old errors.
- With mobile drawer open, notice is visible inside its accessible modal subtree; with it closed or desktop collapsed, notice is available in preview. No duplicate live-region instances during transitions.
- Verify one announcement per status change with a screen reader in representative desktop/mobile flows; DOM counts alone do not prove announcement behavior. Ordinary progress is polite, errors assertive, and focus is not moved for updates.

### Risks

Mounting an existing notice in a new host can reannounce its text; minimize remounts and explicitly test drawer transitions. Rapid progress updates may be noisy; only add throttling if observed, rather than introducing another status subsystem. Other independent accessible helpers (dnd-kit announcements) must not be removed to satisfy a global role count.

## Implementation sequencing and verification gates

1. Independent auditor reviews these proposals, especially persistent content/controller lifetime, modal portal/inert boundaries, and exact export-access behavior. Resolve those designs before implementation.
2. Separate workers may implement UF-1 and UF-4. One layout owner integrates UF-2/UF-3 and UF-5 presentation; coordinate `ExportPanel`/hook edits rather than racing shared files.
3. Independent final audit checks diff scope, semantic states, nested focus/scroll cleanup, single-tree ownership and the acceptance criteria above. Implementation completion is not audit completion.
4. Run focused component tests, then `npm test`, `npm run lint`, `npm run build`, and `npm run test:e2e -- test/e2e/ui-foundations.spec.js`. Run existing export visual suite with `npm run test:e2e -- test/e2e/export.visual.spec.js` because export access/mounting changed. Use repository Node 20 and installed dependencies; browser prerequisites may require `npx playwright install chromium`. Report actual results/blockers, not assumed passes. `build` runs `prebuild` and can regenerate `public/embed/bitmap-forge.es.js`; review and exclude unrelated generated changes.
5. Unit tests use existing Testing Library + Vitest; no new user-event/axe dependency is assumed. Reset Zustand status/settings/temporal state between tests; stub heavy preview children for layout unit tests. Existing `matchMedia` mock always returns false, so breakpoint tests need a controllable subscription mock. Real focus, inertness, pointer dragging, scroll and clipping assertions belong in Playwright/manual browser checks.
6. Capture and inspect desktop expanded/collapsed, mobile closed/open, picker-open and export-selected screenshots at 1280×800, 1024×768, 1023×768, 390×844 and 320×568; include a short landscape viewport, 200% browser zoom and reduced motion. Pause animation/use a deterministic shape before screenshots. Assert geometry/visibility and focus behavior, not only screenshot existence. Check a real mobile Safari/VoiceOver path when available; disclose if unavailable.
7. Parent retains changes locally until authorized release flow. No issue creation, push or deploy belongs to plan authorship.

## Authorship verification / limitations

Read `AGENTS.md`, relevant layout/palette/export/settings/status sources, shortcut/modal code and existing test/config files. Optional `CODEX.md` and referenced `COLLAB` files were absent; no replacements were created. Source inspection supports the findings above; this document does **not** claim runtime reproduction, passing tests or visual verification. Only this plan file is an authored deliverable; the separate audit and implementation remain pending.

## Audit resolution contract (authoritative over ambiguous wording above)

Revised plan only: independent acceptance of these material revisions is required before code; final independent implementation review remains mandatory. Original issue requirements are retained across phases below. Tracker references exist in `issues.json`; initial “not published” wording is historical. This task authorizes no implementation or external writes.

### UF-R1 — Palette transactions, touch and focus

- Draft belongs to a UI-local item token and palette revision, never to its hex value. Enter or ordinary blur to another control inside the same picker validates/commits once; invalid data stays local with associated error and no focus trap. Picker changes commit immediately and synchronize draft.
- Escape, explicit Close, outside dismissal (including another swatch), parent hiding/unmount and external replacement cancel uncommitted draft. Capture-phase pointerdown marks cancellation before blur; Close is always a cancellation destination, including keyboard focus. Tab leaving picker closes/cancels. No unmount/autofocus handler commits. Enter is the explicit commit route before leaving. Test valid and invalid drafts against each path in a browser, including blur-before-click order.
- Tag expected synchronous own `setColorAt` revisions and resync them without closing. Any unmatched mutation (undo/redo, import, preset, other setter) cancels drag and editor before another write. Structural operations invalidate the token; commit rechecks revision/index bounds. Duplicate colors remain distinct. No persisted ID/schema changes.
- Escape/Close return focus to surviving visible trigger. Outside pointer keeps clicked destination; switching swatches gives the new picker initial focus. Preset/Add/Remove preserve initiator focus; when focused removed trigger disappears use next trigger at same index, else previous, else Add. Drag/move completion focuses moved swatch, drag cancel its handle. Parent collapse/drawer/resize restoration overrides child restoration; never focus hidden owner.
- Pointer sensor activation distance 8 CSS px; keyboard sensor uses sortable coordinates. `touch-action:none` on handle only; scrolling elsewhere remains vertical. Minimum targets 44×44 CSS px including delete/move. At 320px use bounded palette horizontal scrolling if six targets cannot fit, never shrink below minimum or cause page overflow. Real touch tests cover scrolling versus drag. Retain existing UI Add/Remove bounds; imports are **not** claimed to enforce global two-color minimum.
- Acceptance adds transaction matrix, external changes during drag/edit, duplicate/shortened palettes, owner collapse and touch. Original keyboard/preset/edit tests remain required.

### UF-R2 — Stable controller and responsive focus architecture

- Stable Layout under existing SceneManagerProvider calls new `useExportController` once, outside responsive/disclosure branches. Controller calls `useExport` once and owns selectedFormat (APNG initial). ExportPanel becomes presentational with explicit `selectedFormat`, `onSelectFormat`, `exportSelected`, `cancelExport`, `saveProject`, `loadProject`, `exporting`, `disabledReason` props. No fallback hook in panel. Adapt panel tests to explicit controller fixtures. One owner serializes Layout/controller/ExportPanel/hook changes.
- Closing or resizing cannot dispose the controller. Actual owner unmount explicitly aborts work and invalidates generation to prevent late status/download, including nonabortable completion. Existing useExport has no unmount cancellation; accidental asynchronous survival is not the lifetime design.
- Layout owns section values, rail state, Look advanced disclosure and preset-name draft across remounts; palette draft cancels. None enters undo/project state. Mobile content unmounts on close, never force-mounts a closed modal. Exactly one settings presentation. PreviewCanvas/provider remain stable siblings/keys outside branches.
- Record opener per opening: Open settings or Export & Project. Ordinary opening focuses Close; export opening reveals Export then focuses heading (`tabIndex=-1`) after mount. Ordinary close/backdrop returns recorded visible opener. Export starts **open**, preserving existing default.
- Mobile→desktop closes child portals and pending focus jobs, removes modal effects; only focus formerly inside removed drawer moves to corresponding desktop heading/toggle (expand if necessary). Desktop→mobile starts closed; focus inside removed settings moves to Open settings, otherwise unrelated preview focus stays unchanged. Suppress default hidden-trigger restoration on resize.
- Palette portal uses dedicated container ref inside Dialog.Content on mobile, normal document host on desktop. Help remains App-level topmost Dialog: close picker before help, suspend drawer restoration until help closes, return to visible invoker or drawer Close. Separate Escapes close help, picker, drawer in order. Remove Layout global Escape; keyboard-hook guard is not a substitute or reason to redesign shortcuts. Test App-sibling modal scope/stacking, body scroll restoration and inert background.

### UF-R3 — Disclosure/access/semantics

Keep mounted bodies where needed but genuinely hide them; close portalled descendants before section/rail/drawer hiding. Preserve Input/Palette/Look/Animation/Export open, Rotation/Light closed defaults. Export access is idempotent reveal, not download: expand then wait for committed target ref/layout, scroll/focus heading. Use cancellable generation token, no timeouts; invalidate on close/resize/new request; instant scroll under reduced motion. Test stable PreviewCanvas/manager, nonzero dimensions and nonblank output after rail resize.

Include native keyboard-operable Load project button forwarding to file input, tested Enter/Space/cancel/import; access alone does not fix project workflow. Retain nine native pressed buttons with generated stable description ID and unchanged names. Real browser Enter/Space tests, not synthetic keyDown alone. UF-4 shares controlled interface above; no duplicate hook for legacy tests.

### UF-R4 — One app-status presenter and complete producer scope

Add PreviewCanvas and keyboard shortcut/App bridge to editable/test scope. Remove PreviewCanvas duplicate global-error overlay and destructive upload CTA; generic Dismiss never clears valid source/model for export/save failure. Normal input replacement remains explicit in input controls.

StatusNotice is sole textual app-status presentation (not sole global live region; keep dnd-kit). Error precedes exporting, loading, ordinary message. Keep an empty polite region and mutually exclusive alert. Active host is preview or drawer outside collapsed bodies. While help is topmost defer announcement and retain latest revision; after help closes, insert latest text into accessible host. Drawer host move similarly updates text after mount, not prepopulated-region remount; unchanged status must not reannounce just for movement. Verify real screen-reader behavior; unavailable coverage remains unverified.

| Producer | Start | Success | Failure/dismiss |
| --- | --- | --- | --- |
| Preview model/text/image | own loading true; clear message/error | own loading false; clear error; relevant completion or empty | own loading false; error; empty message |
| Export | own exporting true; clear message/error | own exporting false; completion/actual container; clear error | own exporting false; error; empty message |
| Panel/Ctrl+S save and project import | clear message/error | completion; clear error | error; empty message |
| Dismiss | n/a | n/a | clear error and obsolete message, never settings/source |

Busy labels use operation-specific fallback, never shared stale success text. Do not reset another producer's busy flag. Concurrent load/export retains both flags; error wins, detailed cross-operation progress/terminal ordering is not promised by single shared message. Test this limitation explicitly. Ctrl+S routes through stable save callback via narrow context/callback bridge, not another export hook, and no swallowed failures.

### UF phased acceptance and verification

1. Controller/controlled-panel/required UI state/shared save/keyboard load: deferred export across close/reopen and both resizes resolves one operation/download, stable manager and format; disposed owner suppresses completion; no history/schema changes.
2. Palette: full UF-R1 matrix plus real touch/native keys; no stale writes or hidden focus.
3. Modal: both openers/resizes, nested help/picker, back-to-back reopen, body scroll and short-screen Close, inactive background. Report Safari/zoom/screen-reader coverage as actual or unavailable.
4. Disclosure/access: section and rail state, portal closure, persistent action geometry at 320px/short heights, no download on access, real export download, stable preview.
5. Status: real PreviewCanvas integration (mock WebGL, not error markup), stale success→model/text/image start→failure→dismiss, failed→successful save/import, overlap and help deferral. One textual error and no destructive model reset.

Targeted tests per phase, independent integrated audit then final exact-tree Node20 lint/format:check/root tests/build, embed tests/build/gzip/alias, CLI workspace build/tests, test:export for controller changes, existing export and new UI Playwright suites. Confirm reused server checkout/revision; inspect/exclude incidental generated SDK changes; no broad fixes/dependency churn. No push/deploy. Shared-engine release also requires creative CI-S safety phase. Plans are ignored local artifacts: retain/share intentionally, never force-add without authorization.
