# Independent P1 foundation implementation audit

## Verdict: ACCEPT FOUNDATION FOR B/C/D

The concrete shared foundation and [interface ledger](foundation-interfaces.md) are sound enough for disjoint B/C/D consumption. **No blocking foundation finding.** This clears P1 only, not widget completion, final redesign acceptance, production artifacts, publication or deployment. A retains exclusive ownership of shared styles, validators, shell integration and browser harnesses. Each widget slice and the combined implementation still require independent review.

Reviewed branch `gloin/editor-redesign`, HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`; original source baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`. The implemented changes are uncommitted. The six candidate code hashes published in the handoff matched actual files. Accepted research/specification/state/implementation/resolution document hashes also matched plan acceptance. A complete reviewed implementation/test hash manifest is outside the repository at:

`/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p1-independent-evidence/reviewed-source-hashes.json`

## Scope and independence

Read root governance, binding plan acceptance including R1/R2/R3, accepted specification/state contracts/implementation plan, foundation interfaces/handoff, actual tracked implementation diff and untracked production/tests. Required product, frontend-direction, editor-redline and browser-reliability guidance was loaded. Requested COLLAB records are absent. No private memories were inspected.

All changed/new implementation files fit A's accepted allowlist. In particular, new `ProjectActions.jsx` and its dedicated test are expressly allowed; palette harness scope classes and the new foundation browser spec belong to A, not C. No new hook, viewport-helper module, engine/store rewrite or config/dependency modification was hidden in the untracked set. PreviewCanvas changes are display/callback metadata only; its source/manager effects are unchanged. StatusNotice changes are presentation only, not asynchronous delivery logic.

This reviewer created only this audit inside the repository. External diagnostic scripts, screenshots and source hashes are under the active profile's scratch directory. No application/config/test source was edited, no commit/push/build/deployment was performed, and no unrelated process was killed. A concurrently appearing parent visual-notes document was read but not edited.

## Independently executed evidence

Commands ran from the repository with `npx --yes --package=node@20 -c '…'`, using installed direct JavaScript tool entrypoints. Resolved runtime: **v20.20.2**. These are new execution results, not adoption of A's self-report.

| Gate                                                                                                                                                                                                                         | Independent result                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node node_modules/vitest/vitest.mjs run`                                                                                                                                                                                    | **Exit 0: 55 files, 787 tests passed**, 90.18s. Expected injected failure stderr and jsdom navigation notices did not represent failing tests.                                                     |
| Focused Layout, ProjectActions, StatusNotice, ShortcutsModal and validator files                                                                                                                                             | **Exit 0: 5 files, 81 tests passed**, 14.39s.                                                                                                                                                      |
| `node node_modules/@playwright/test/cli.js test --config /home/agent/.hermes/profiles/gloin/cache/scratch/bf-p1-playwright.mjs --output /home/agent/.hermes/profiles/gloin/cache/scratch/bf-p1-independent-evidence/results` | **Exit 0: all 9 cases passed**, 1.7m; one worker, no retries, 90,000ms case deadline, runner-owned retain-on-failure trace policy. `BITMAPFORGE_P1_EVIDENCE` pointed to the independent directory. |
| Explicit ESLint `--ext .js,.jsx` for every changed/new JS/JSX implementation/test/harness                                                                                                                                    | **Exit 0**, no ignored-file warning.                                                                                                                                                               |
| `node node_modules/eslint/bin/eslint.js .`                                                                                                                                                                                   | **Exit 0**.                                                                                                                                                                                        |
| `node node_modules/prettier/bin/prettier.cjs --check .` before this audit addition                                                                                                                                           | **Exit 0**, all matched files formatted.                                                                                                                                                           |
| `git diff --check`                                                                                                                                                                                                           | **Exit 0**.                                                                                                                                                                                        |

The earlier handoff root-format warning for `plan-acceptance.md` was **not reproduced on the later current tree**. This reviewer did not format that file or attribute it to an application bug. Parent-owned document formatting is separate from implementation correctness. A separate shell inventory command returned exit 1 because `git check-ignore` correctly found the proposed audit path nonignored; it was not a test failure.

Browser target identity: read the external Vite configuration, confirmed the Layout module returned HTTP 200, and exercised the real source app at `http://127.0.0.1:5197`. That config specifies this exact root, isolated `bf-p1-cache`, strict port 5197 and HMR disabled. Evidence output is outside the served root. No production build or generated-artifact result is inferred from this source server.

### Additional independent diagnostics

Executed scratch-only `bf-p1-independent-probe.mjs` and `bf-p1-independent-states.mjs` with Chromium/SwiftShader; both exited 0. These are supplementary observed probes, not replacements for the final repository regression cases:

- At emulated H220/T40, deeply scrolling Look produced outer dialog scrollTop 782. Selecting Source returned outer and task-body scrollTop to 0, with Source heading fully inside the visible interval.
- Header Load produced **two real filechooser events** through native Enter then Space, each cancelled with an empty selection. Unit tests separately exercise repeated same-file input changes, reset-before-callback and ignored empty selection.
- Typing `?` in the hex input did not open Help. Modal Help followed by crossing to desktop kept focus inside sibling Help; Escape then restored the current Look heading rather than a disconnected mobile invoker.
- Header/history and closed-toolbar command bounds were checked at 1024×768, 1023×768, 320×568 and 667×320: every measured command was at least 44×44. At 320px the project labels wrap and their height grows rather than shrinking targets.
- A real DOM fixture outside the workbench, scoped by `bf-picker`, retained selected marker, accent boundary and separate keyboard-focus outline while hovered: 44px target; 2px accent outline, 2px offset, 3px inset selected marker. Invalid and disabled native controls remained readable. This is shared-class evidence, not a claim that future C widgets are already restyled.
- An 80-repeat error was bounded to a 126.09px notice slot inside the 506.39px mobile dialog; title/Close/Help and task navigation stayed pinned, the actual Export action could be revealed, and there was no horizontal document overflow.

## Contract findings

### Lifetime, cancellation and publication — accepted

Layout owns exactly one export controller and keeps the main preview outside responsive/task branches. Four keyed task sections stay mounted while hidden within the current inspector; responsive remount remains deliberate. Existing real-controller/deferred-job integration passed through close/reopen and both breakpoint directions, with one builder result/download and one manager construction in that test. Browser canvas identity survives tested task/modal transitions. Do not generalize this into completed pending-export browser certification.

Parent-hiding paths retire reveal generation and synchronously cancel palette transactions before changing visibility. Task/collapse/Close/Help/stage/backdrop pointer capture runs before native blur without preventing pointer default; keyboard/programmatic close and breakpoint paths also cancel. The real palette browser test typed a valid uncommitted hex draft and switched task by pointer: colors were unchanged and the picker closed. Existing keyboard-drag Escape ownership remains a narrow predicate; no propagation suppression was added.

The keyboard bridge remains layout-effect-published with guarded cleanup; Help uses the same committed App action for visible buttons and shortcut. One stable notice portal/presenter is retained and moved between hosts. Existing freeze/latest-resume and deferred-update protections passed; no producer or progress policy was replaced.

### Geometry, reset and focus — accepted foundation, final matrix retained

The adapter initializes root pixel variables synchronously, subscribes to window resize and visualViewport resize/scroll, updates changed measurements and removes its listeners/variables. Narrow shell, sheet and sibling Help use explicit measured top/height or max-height with `bottom:auto`; Help has only horizontal translation. Safe padding is inside border-box geometry. Portrait 390×844 produced the expected 337.6px top/506.4px sheet; short and offset rectangles passed physical-bound assertions. Empty invitation is its own inset scroller, not copy-driven canvas resizing. Below 240px whole-dialog scrolling is deliberate.

Reset precedes generation-bound postcommit source/Export reveal. Current-task reactivation forces a commit; native task focus and ordinary Tab order are retained. Source fallback does not synthesize a chooser. Connected/hidden/inert/disabled opener checks and disconnected-stage fallback are present. Help-open breakpoint handling does not steal topmost focus, corroborated by the independent diagnostic.

The adapter also invokes instant-nearest scrolling for the current task-body input on changed measurements. It does not call `focus()` or cancel transactions; this implements the same-breakpoint reachability allowance. Final R2 tests must still prove that already-visible input/scroll state is not needlessly displaced and cover rapid replacement, far-below-heading source targets, both boundaries and two-frame stability. Current smoke coverage is not that complete matrix.

### Frozen interfaces and ownership — accepted exactly as published

- **B:** optional `InputSource.navigationRef` publishes `{focusSource(kind): boolean}` in a layout effect with guarded cleanup; kinds are exactly `model|shape|text|image`. Child props are **`ModelUploader.chooseButtonRef`, `ImageInput.chooseButtonRef`, `ShapeSelector.selectedShapeRef`, `TextInput.textareaRef`**. Reuse `headingRef`; no synthetic chooser or global target registry.
- **C:** retain existing portal/interaction/name draft/open props; add optional `palettesOpen/onPalettesOpenChange` with local false fallback. Keep the save-name form outside browsing and explicit-invocation-only focus. Preserve synchronous `cancel({restoreFocus:false})`, `isKeyboardDragging()`, revision and duplicate-color identity machinery. Harness files remain A-owned.
- **D:** finite `QualitySettings.part=all|renderer|refinements`, default all, optional controlled/local advanced and post-effects disclosure props. Final output-only ExportPanel props are `selectedFormat`, `onSelectFormat`, `exportSelected`, `cancelExport`, `exporting`, `disabledReason`. No presenter-owned controller. A integrates renderer → Palette → refinements after D's real split exists.
- **Shared:** accepted token values and BTN aliases match actual CSS/source. New `navigationRef`, `qualityPart`, `sourceKind` validators are callable metadata with direct positive/negative tests, not automatic React 19 runtime validation. The portal focus scope actually works outside the workbench.

Computed browser fixtures passed normal-text and required-edge contrast: primary text 9.155:1; secondary/field text 12.631:1 and edge 3.795:1; selected text 7.720:1 and edge 5.072:1; invalid text 12.008:1 and edge 7.988:1; disabled text 5.928:1. The additional portal probe confirmed hover does not erase selected edge/marker or separate focus outline. This does **not** certify every native control, future widget utility combination, portal collision state or browser engine.

## Transitional seams and remaining gates

The following are accepted **P1-only transitions**, not completed requirements or architectural dead ends:

1. Baseline InputSource ignores `navigationRef`; production currently falls back to Source heading. The unit child fixture proves the shell consumes a committed handle, not that the real child implementation exists. B must supply and test the actual native targets.
2. Baseline palette ignores browse props and still needs C's compact presentation and remount-safe name focus. Controlled shell ownership is present; new C behavior is not certified yet.
3. Baseline QualitySettings ignores part/post-effects props. There is exactly **one** all presenter, avoiding duplicate controls. D implements the finite split; A performs final order integration.
4. Baseline ExportPanel still duplicates header project commands/input. This is expressly **not final single-input acceptance**. D removes project presentation; A narrows the caller and verifies one real project input across all modes.

All original U/P browser behaviors, complete R1/R2 cases, final all-state screenshots, zoom/reflow/touch/native chooser roundtrip, actual pending-export browser identity and per-widget audits remain mandatory. R3's nine built-UI downloads, fresh runtime/decoder checks and the original artifact quality/budget gates are untouched and unexecuted by this bounded audit. Physical mobile keyboard, Safari, AT and physical touch remain unavailable evidence, not implied support certification.

## Visual redline

Independently generated and directly inspected actual desktop empty/Shapes, mobile Settings, 667×320 empty, H220/T40 Help, portal-state fixture and long-error Settings images under `bf-p1-independent-evidence/`. The first six responsive/offset screenshots are real app captures; the added portal panel is explicitly a diagnostic class fixture.

Graphite surfaces, pale-cobalt actions, pressed task marker and clear header/project separation implement the accepted workbench direction. The stage remains dominant; loaded artwork is real and unchanged, not enlarged for presentation. Short invitation clipping in the capture is a scrolled invitation with a fully visible focused demo action, not deleted copy. H220 Help intentionally scrolls its title/Close with the whole interior; ordinary-height Help uses pinned header/body scrolling.

Nonblocking craft follow-up: the full-width Collapse settings row gives workspace mechanics more prominence than necessary. The legacy source pill strip, cramped shape labels/green selection and baseline palette/output controls still visibly need B/C/D work. Do not mistake those unfinished widgets, occluded inert background text or unchanged small artwork framing for a reason to change engine defaults or the frozen APIs.

**Disposition:** B/C/D may consume this foundation within their exact allowlists. A integrates and re-verifies the seams above afterward; no final acceptance criterion is waived.
