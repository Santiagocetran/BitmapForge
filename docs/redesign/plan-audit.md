# Independent redesign plan audit

**Verdict: MANDATORY REVISIONS before coding.** The direction and preservation architecture are sound. Resolve R1–R3 below in the four planning documents and obtain independent reapproval; no new user aesthetic approval is needed. These are bounded specification/verification repairs, not a request to redesign the product or expand engine scope.

## Reviewed baseline and limits

- Independently read `AGENTS.md`, the parent `DESIGN-BRIEF.md`, both parent research reports, and all four version-1.0 documents in this directory. Loaded the three required skills and creative-editor-quality reference. Re-inspected the actual baseline desktop-empty and mobile-settings screenshots visually.
- Verified HEAD is `8c6613279ed856e4933608e7e6c04e91dca2b331`, branch `gloin/editor-redesign`. At inspection, no tracked implementation diff; `docs/redesign/` is untracked. Requested CODEX/COLLAB bootstrap records are not tracked; no private memory was inspected.
- Independently inspected App, Layout, PreviewCanvas, source widgets, QualitySettings, ColorPalette (including transactions and name form), AnimationControls, pose/light widgets, ExportPanel, shared prop validators, palette harness, package scripts, and both original UI/palette browser specs. Also inventoried the actual export/generated browser cases.
- This is a source/plan audit, not a new runtime certification. No application/config/test changes, installs, test execution, publication or deployment were performed. Parent checkpoint counts are not newly verified passes here.

## Mandatory revisions

### R1 — Finish short-height geometry for the empty stage and sibling Help

**Evidence:** specification lines 19–27 add an intrinsic wrapping command header and a substantially larger empty invitation; lines 160–162 require unclipped controls at short heights/zoom. State contracts lines 62–66 bound the _inspector_, but do not specify either the empty-stage overflow strategy or Help's short-height geometry. Actual `PreviewCanvas.jsx:223–259` uses a full-height, `overflow-hidden` outer surface and an absolutely inset invitation. Actual `ShortcutsModal.jsx:16–35` is a vertically centered intrinsic-height dialog without max-height or scrolling. The implementation allowlist describes its styling as optional.

**Why this blocks:** the closed 667×320 view must accommodate header, persistent toolbar and stage. A heading, explanatory text, four 44px source routes and demo action cannot simply inherit the old centered invitation without an explicit constrained-height strategy. Similarly, a 320px-high/keyboard-reduced Help overlay cannot be assumed to keep Close and every shortcut reachable. Full-height inspector fallback does not repair these separate surfaces. This is an unresolved layout contract, not a demonstrated redesign runtime failure.

**Bounded repair:**

1. Specify a contained, scrollable empty-invitation layer with `min-height:0` and reachable first/last actions, or an equally explicit compact-height arrangement retaining all source alternatives/demo. Do not make the document scroll horizontally, resize/remount the canvas to fit copy, lower target sizes, or silently remove routes.
2. Make A's Help styling responsibility explicit: visual-viewport-bounded content, contained vertical scrolling, safe padding, and reachable Close without changing sibling-dialog/focus/shortcut behavior. Define whether title/Close are pinned or part of the scroll area.
3. Pin the viewport rectangle used for keyboard fallback: effective height and handling of nonzero `visualViewport.offsetTop`, rather than leaving `100dvh`, `height`, and simultaneous top/bottom anchoring to compete. CSS layout viewport and visible keyboard viewport are not interchangeable.

**Acceptance to add:** at 667×320, 320×568 and an emulated reduced visual viewport, tab through every empty-stage route/demo and Help Close; scroll the first/last actions into the actual visible viewport; assert no document horizontal overflow and no focus clipped behind a keyboard/footer. Include a nonzero viewport-offset case if supported by the chosen adapter. Preserve the same preview node/manager. Capture short empty and short Help states, not just the full-height Export form. Report real mobile-keyboard testing as unavailable unless actually exercised.

### R2 — Pin task-body scroll policy and reveal ordering

**Evidence:** specification line 9 hides mounted task sections; state contracts line 62 specifies one shared task-body scroller. Lines 74–77 distinguish task-button focus from Export/source reveal, but there is no policy for the scroller's position when exchanging long panels or remounting the inspector. The baseline has one continuously scrolled stack (`Layout.jsx:305–310`, `387`), so its scroll behavior does not automatically establish behavior for replacement task contents.

**Why this blocks:** Motion or Export can be scrolled deeply before entering Look. Reusing one scroller without a policy can expose the new panel mid-form, hiding the renderer-first hierarchy that motivates the redesign. A `hidden` change can also clamp scroll position incidentally. The spec's “Tab then reaches active panel controls” must not be read as skipping the other ordinary-Tab task buttons.

**Bounded repair:** choose and document either reset-to-start on explicit task changes or a small Layout-owned per-task scroll-position record. Specify close/reopen, collapse and both breakpoint directions separately; scroll state remains UI-only. Define reveal precedence: explicit Export/source focus wins over ordinary restoration and runs after the active panel is visible, with no smooth motion or later stale scroll/focus job. No generalized scroll/focus framework is needed.

**Acceptance to add:** deeply scroll each long task, change tasks with pointer and Enter/Space, assert the selected policy and a visible task heading/first relevant controls. Confirm focus stays on the activated native task button; ordinary Tab traverses remaining task buttons before panel controls. Exercise close/reopen and both boundaries, and show an explicit source/Export reveal is not subsequently scrolled away by restoration. Verify last controls remain reachable and task scrolling creates no project/history entry.

### R3 — Replace the open-ended export verification tail with a finite nine-format ledger

**Evidence:** implementation plan lines 145–147 preserve valuable suites, but “Run relevant GIF/other runtime/artifact suites too” is not a finite coverage assignment. Actual `test/e2e/export.visual.spec.js` has upload plus APNG, Sprite Sheet, Code ZIP, CSS ZIP and Video cases; `ascii-generated.spec.js` covers fresh React/Web Component variants. The original UI tests select GIF but do not download it. Neither selection nor an archive/unit test alone proves the redesigned selected action dispatches the correct real output. The current plan does not map GIF and Embed completion to exact retained/new evidence.

**Bounded repair:** add one table for all exact IDs (`apng`, `gif`, `webm`, `spritesheet`, `css`, `react`, `webcomponent`, `embed`, `zip`) naming:

- Actual UI selection/action route and expected file/container/runtime kind.
- Existing test file/case or bounded new A-owned browser case that exercises that route.
- Meaningful artifact assertion, with format-appropriate animation/content or unchanged generated-runtime checks; retain all existing thresholds, fixtures and budgets.
- Required source versus built target, and single evidence owner. Explicitly mark any current coverage gap for implementation instead of implying an existing suite covers it.

For Embed include supported-source success plus the preserved image-disabled reason. For GIF identify a real downloaded-animation check rather than relying on APNG behavior. Existing decode/integration coverage should be reused where it actually applies; do not require nine duplicated expensive quality suites or rewrite builders. Record exact discoverable commands/config entrypoints for these named gates, allowing isolated port/output overrides to be recorded at execution.

**Acceptance:** an auditor can determine coverage for every format from the table without deciding what “relevant” means. Run all named required cases on the final combined tree and report each exit/evidence path. No absent GIF/Embed runtime case may be represented as already present, and no existing full-loop/90-second assertion may be waived to fill the ledger.

## Contracts accepted in principle

These do not need new design choices; preserve them while addressing R1–R3.

### Capability preservation and truthful scope

The source inventory matches the mounted controls inspected: four source types, eight shapes and their geometry ranges, seven text fonts/geometry, model/image scale and native file/drop routes; six registry rendering modes and conditional details; palette editing/built-in/custom access; every current fade/style/direction/combined-motion/timing/pose/light control; nine exact output identifiers. Moving dither out of Advanced and separating project persistence from output are intentional IA changes, not feature removals. No unsupported full-look presets, camera fitting, cloud save, autosave or image-project restoration are promised.

### Lifetime, event order and focus

- One Layout controller and one main preview remain outside task/dialog branches. Inspector remount on mobile close/breakpoint is explicitly allowed; durable disclosures/name draft are lifted. Hidden mounted task sections are compatible with the native pressed-button model, not partial tabs.
- Source focus bridge is finite and does not synthesize asynchronous file activation. Child layout-effect publication plus identity-guarded cleanup is appropriate; preserve false/fallback behavior for disconnected/disabled targets. Project input has one owner and same-file/cancel reset behavior; Header/ExportPanel must not invoke duplicate hooks.
- Parent cancellation is specified synchronously before blur/visibility changes, including pointer capture and keyboard/programmatic paths. The existing document-capture outside-intent marker and transaction/revision guards must not be discarded as redundant styling cleanup.
- Palette name focus is a genuine seam: baseline `autoFocus` and unguarded queued trigger focus need the planned explicit-invocation/generation repair. Keep name form outside browse disclosure. Test same-instance hide/reveal as well as remount so connected-node checks cannot mask stale restoration.
- Narrow keyboard-drag Escape ownership, ordinary second Escape, external mutation/drop/parent-hide release, exact opener restoration, stale close/reopen node distinction and Help topmost behavior are expressly retained. Help focus during a breakpoint change must not be stolen by inspector restoration.
- Stable notice host/presenter, actual progress/error precedence and Help suspension are preserved without producer/schema changes. Styling scroll wrappers must not clone or replace the notice node.

### Ownership and foundation gate

Four implementation owners are genuinely disjoint as written. A owns global styles, validators, shell/controller bridges, Preview display, integration and **all browser harnesses**, including `ColorPalette/paletteHarness.jsx`; C's directory ownership is only palette component/dedicated unit tests, not that harness. B/C/D have no shared-store/global-style/browser write permission. D's output-only ExportPanel and finite QualitySettings split do not authorize hook/engine changes. Any serial transfer still requires explicit acceptance/transfer.

Retain P1 independent foundation review before B/C/D consume it. Its ledger must freeze concrete state styles (not just class names), child focus-ref names, validator exports, finite `part` behavior and controlled/local fallback behavior. Two QualitySettings presenters may retain read-only store subscriptions; they must not render duplicate controls/IDs or create side-effect controllers. Do not claim React 19 automatically executes custom prop validators: directly test new validators as baseline metadata tests do.

### Visual direction and evidence

Cool graphite/pale cobalt, existing system typography, restrained surfaces and real artwork are coherent with the parent brief and research; the rejected accordion/dual-rail alternatives have product-specific reasons. The desktop/mobile baseline screenshots support the identified preset-wall and nearly full-width drawer problems. Paper diagrams are honestly labeled, not represented as rendered mocks. Final paired captures cover the principal operational states; add R1's short empty/Help captures.

Static contrast pairs are not acceptance of final styles. P1 must assign actual foreground/fill/border/focus/disabled/selected/error combinations, including native controls and portal scopes; final verification must measure those rendered states. `.bf-overlay`/portal styling must work outside `.bf-workbench`, and the standalone palette harness must intentionally receive the appropriate scope. Keep palette targets at least 44×44, separate focus and selected indicators, and leave actual artwork motion unchanged.

## Original browser protection ledger checked

Independently inspected both original browser files rather than accepting the plan's total on trust. UI-foundations has 15 test declarations, four of which are two-value loops: **19 expanded cases**. Palette has **11 cases**. All **30** map to U01–U19/P01–P11; none needs a behavior waiver. Count is a cross-check, not the acceptance criterion.

Particularly material retained assertions are the exact two opener restorations; first/second drag Escape and rollback; focus trap/inert/body-style restoration; portalled picker ownership; real Enter/Space file actions; detailed status and overlap/error precedence; stable notice identity/zero mutation while frozen/one latest mutation on resume; nonblank canvas color/entropy thresholds; actual removed-versus-new dialog node plus two-frame stale-autofocus check; parent close/resize cancellation; and current native save payloads with exactly three downloads, failure without download, then fourth recovery download. Native Save focus moving out of the now-inert header is a justified adaptation, not a loss of shortcut coverage.

All original six responsive sizes and thresholds remain mandatory; 1440px, task hiding, bounded-sheet geometry, short/keyboard states, actual rendered contrast and new source/header bridges are additions. Root/workspace/decode/CLI/build/gzip/alias/identity checks and isolated source/built servers remain required final gates. No passing plan review can substitute for those executions or for independent implemented-app visual review.

## Reapproval condition

The plan author should write numbered dispositions for R1–R3, revise only the affected planning contracts/ledgers, and return them for independent review. Until then this is **not ACCEPT**. The selected architecture, palette and four-owner split do not need to be reopened, and no application/config/test edits are authorized by this audit.
