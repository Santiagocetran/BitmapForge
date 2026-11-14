# A/P1 foundation handoff — independent acceptance requested

## Result and boundary

**Working shared shell/foundation implemented; NOT the complete redesign and NOT independently accepted.** B/C/D must remain stopped until a separate reviewer accepts this P1 slice and [the concrete interfaces](foundation-interfaces.md). No commit/push/remote/config/dependency change, PR, merge or deployment was performed. HEAD remains `496f0d1f494e928c54f8fef2321835ccd5141917`, branch `gloin/editor-redesign`; original source baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`. The pre-existing untracked `plan-acceptance.md` belongs to the independent plan reviewer and was not edited.

Implemented real native Source/Look/Motion/Export task navigation with four stable hidden/mounted panels; one responsive inspector tree; real command header/history/project input/Help; persistent global Export navigation; narrow pinned bottom toolbar; 340px desktop inspector/44px compact rail; responsive bottom sheet/full-height fallback; measured visualViewport height AND offset; bounded sibling Help and short-height whole-interior fallback; source-aware contained empty invitation; reset-before-reveal ordering; synchronous pre-blur palette barriers; controlled durable shell state; stable preview/controller/notice lifetimes. Preview source/manager effects and status asynchronous delivery logic are unchanged.

## Frozen contracts and remaining widget work

`foundation-interfaces.md` enumerates actual token values, CSS state combinations, exact accepted double-hyphen BTN variants, portal scopes, new validator exports, source child ref prop names, controlled palette and QualitySettings props, output-only Export contract, geometry/reset/focus ordering. All accepted §3 token names/values are implemented. No shared files may be edited by widget workers.

Explicit **transitional** gaps, not final acceptance:

1. **B:** baseline InputSource ignores optional `navigationRef`; real stage source navigation currently falls back to Source heading. B must implement `focusSource`, children `chooseButtonRef` (ModelUploader/ImageInput), `selectedShapeRef` (ShapeSelector), `textareaRef` (TextInput), and real source presentation/labels/selected targets. Parent handle consumption is tested using a layout-published child fixture; real browser smoke truthfully checks the current heading fallback, not a fabricated chooser result.
2. **C:** baseline palette ignores optional `palettesOpen/onPalettesOpenChange`; browse/name remount focus improvements still belong to C. Existing preset draft/open are controlled and passed, parent barriers work against the real existing picker. Legacy preset wall/utility colors remain until C adopts shared styles.
3. **D:** baseline QualitySettings ignores optional `part` and `postEffectsOpen` props. P1 renders **one `part="all"` only** to avoid duplicate controls/IDs. Final renderer → Palette → refinements order requires A integration after D implements and tests the finite split. No D file was edited to install a stub.
4. **D:** unchanged ExportPanel still renders project commands/input, in addition to the real new header ProjectActions. This duplicate is temporary, explicitly not final single-input acceptance. D must remove project presentation/props; A then narrows caller to output-only fields. Existing controller remains exactly one in Layout throughout.
5. Source/shape/widget styling is intentionally not claimed finished. All capability-home inventory, final nine-format artifact/runtime checks, original 30 browser behavior adaptations, final all-state visual/keyboard/zoom/contrast evidence and per-widget independent audits remain mandatory P2/P3/P4 gates.

## Files

Modified A-owned production files:

- `src/app/App.jsx`
- `src/app/components/Layout/Layout.jsx`
- `src/app/components/PreviewCanvas/PreviewCanvas.jsx` — display/optional callback/metadata only, effects untouched
- `src/app/components/ui/ShortcutsModal.jsx` — geometry/scroll/style only
- `src/app/components/ui/StatusNotice.jsx` — CSS class changes only
- `src/app/styles.css`, `src/app/styles/buttonStyles.js`
- `src/app/utils/uiPropValidators.js`

New production file: `src/app/components/Layout/ProjectActions.jsx` (direct callbacks, native file input/value reset/native cancel cleanup, no hook duplication).

Tests/harness: modified `Layout.test.jsx`, `uiPropValidators.test.js`, A-owned `ColorPalette/paletteHarness.jsx` (scope classes only); new `Layout/ProjectActions.test.jsx`, `test/e2e/foundation.spec.js`. New documentation: `foundation-interfaces.md`, this handoff. No B/C/D widget implementation files changed.

## Executed verification

Node20 scoped runtime resolved to **v20.20.2** using `npx --yes --package=node@20 -c '…'`; no application dependency install. Parent's baseline782 pass is attributed parent evidence, not a new pre-change baseline run by this worker.

| Gate                                                                                                                                                                               | Actual result                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Final root `node node_modules/vitest/vitest.mjs run`                                                                                                                               | **Exit0, 55 files / 787 tests passed**, 92.69s. Includes real Preview effects/controller deferred-job lifetime integration, source bridge consumption, reset/focus/pre-blur tests, viewport initialization/scroll-offset/cleanup, project input same-file/cancel tests, new direct validator positive/negative tests, all retained status tests. |
| Final `npm run lint`                                                                                                                                                               | **Exit0**.                                                                                                                                                                                                                                                                                                                                       |
| Final explicit `node node_modules/eslint/bin/eslint.js --ext .js,.jsx` against changed app components, Layout/tests, palette harness, validators/tests and foundation browser spec | **Exit0**, no ignored-file warnings. No lint configuration change.                                                                                                                                                                                                                                                                               |
| Final isolated `node node_modules/@playwright/test/cli.js test --config /home/agent/.hermes/profiles/gloin/cache/scratch/bf-p1-playwright.mjs`                                     | **Exit0, 9 passed**, 1.7m, workers1/retries0/90000ms test deadline. Real source app, actual Chromium/SwiftShader, real canvas, no mock artifact/engine.                                                                                                                                                                                          |
| `git diff --check`                                                                                                                                                                 | **Exit0**.                                                                                                                                                                                                                                                                                                                                       |
| Final root `npm run format:check`                                                                                                                                                  | **Exit1:** only pre-existing untracked `docs/redesign/plan-acceptance.md` formatting warning; intentionally not rewriting the independent reviewer's file. Changed-slice formatting is checked separately below. This is not a green whole-tree format gate.                                                                                     |

Logs outside repository:

- `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p1-unit-final.log`
- `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p1-browser-final.log`

Earlier iterations are not erased: first targeted Layout run had three expected old accordion/name lookup failures (42 pass/3 fail), then tests were adapted preserving lifetime/draft/focus assertions; early JSX lint found input `onCancel` unsupported by the installed lint rule, fixed using a native cleaned-up cancel listener; expanded browser lint found missing explicit `node:process` import, fixed. Subsequent final gates above passed. No browser assertion threshold or timeout was weakened. Original UI/palette/export suites have **not** been adapted/run as final redesign acceptance; no claim that their 30 cases or final artifact ledger are cleared.

### Browser assertions actually exercised

- Desktop1440×900: four native tasks, single visible panel/four retained DOM panels, same main canvas through changes; reselect-current-task scroll0; task focus retained and ordinary Tab to following task; collapse/global Export heading reveal without export; header Help; real Shapes source and loaded canvas screenshot.
- Mobile390×844: bounded sheet top337.6/height506.4; Close autofocus; all tasks; Escape restores exact Open settings invoker; image invitation navigates and currently uses Source-heading fallback; canvas identity; no document horizontal overflow.
- Real baseline palette: uncommitted valid `#123456` draft followed by pointer task switch causes **no colors write** and closes picker.
- Short667×320 and320×568: stage-only invitation scrolling, focused demo target≥44px fully inside stage; Help via visible button and `?`; visible rectangle bounds, same canvas, no document horizontal overflow.
- Emulated visible rectangles H320/T40, H280/T40, H220/T40 on390×844: settings physical top/height, Help physical top/bottom, last shortcut reach, no horizontal overflow. Unit test also checks scroll-only offset update and unmount cleanup.
- Computed real browser native-control fixtures using production classes: primary text9.155:1; secondary/field text12.631:1 and boundary3.795:1; selected text7.720:1/boundary5.072:1; invalid text12.008:1/boundary7.988:1; disabled text5.928:1. These verify the shared style states, **not all future widget/portal/native-browser combinations**.

Not yet certified: actual mobile keyboard/device/Safari/AT/touch; complete R1 model+image/all-route fresh-state matrix and H320/T0 adapter case; complete R2 deep Look/Motion/Export/rapid-replacement/both-boundary cases on final widgets; every rendered hover/focus/native/portal state; full original browser behavior matrix; final built/SDK/decode/CLI/identity/gzip/artifact suites. These remain explicit integration gates, not P1 proof by implication.

## Real visual evidence and critique

Evidence directory: `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p1-evidence/`.

Actual screenshots generated by the final Playwright run:

- `desktop-empty.png`, `desktop-shape.png`
- `mobile-empty.png`, `mobile-settings.png`
- `empty-667x320.png`, `help-667x320.png`
- `empty-320x568.png`, `help-320x568.png`
- `offset-help-320.png`, `offset-help-280.png`, `offset-help-220.png`

Inspected actual desktop empty/shape, mobile empty/settings, short empty and pathological Help images. Direction against the skills: artwork is the rich moment; continuous graphite inspector and pale cobalt navigation are quiet; no marketing hero, numbered workflow, fake saved state, decorative animation, added font or repeated card wall. Desktop commands and task hierarchy are distinct. An early mobile screenshot exposed project commands squeezing into three header rows; the implementation was corrected to two explicit grid rows and recaptured. Short empty screenshot after focusing demo deliberately shows the invitation scrolled down (heading retained above, not removed). H220 Help after last-shortcut reveal intentionally scrolls the whole interior, including title/Close; it is not a pinned-header claim in that pathological regime.

Honest remaining aesthetic criticism: legacy Source choices still show small grey/green utility states and cramped shape names; palette/Look/export remain baseline presentation. These are visible in real captures and are the assigned B/C/D work, not a reason to alter engine/source defaults or enlarge artwork for screenshots. No apparent canvas-fit improvement is claimed; actual default artwork framing is unchanged.

## Changed-slice formatting

After writing both handoff documents, explicit Prettier check of both new docs and every modified/new implementation, harness and test file completed **exit0**, all matched files formatted. `git diff --check` also completed **exit0**. The separate root-format failure above remains attributed to the untouched plan-acceptance file.

## Reproducible local evidence target

External (untracked, outside repository) Vite config: `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p1-vite.mjs` imports repository config, sets exact root, unique cache `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p1-cache`, strict `127.0.0.1:5197`, **HMR:false**. Owned server started with:

```sh
npx --yes --package=node@20 -c 'node node_modules/vite/bin/vite.js --config /home/agent/.hermes/profiles/gloin/cache/scratch/bf-p1-vite.mjs'
```

Owned terminal process `proc_7a6f449f9224` remains available for independent local inspection at `http://127.0.0.1:5197`. No unrelated server reused or killed. External Playwright config imports installed absolute repo-local runner, exact `testDir`, only `foundation.spec.js`, unique output under evidence/results, retain-on-failure traces with one runner owner; Chromium SwiftShader flags. This is **source** evidence, not a production build or final built-artifact acceptance. No large exports/builds were run during this bounded phase.

## Reviewed-candidate code identities

SHA-256 after final code formatting and execution (documentation-only additions do not change these):

| File                              | SHA-256                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| `Layout/Layout.jsx`               | `de822ed12137bee6f3a3ab7261158aaed979907bba12f9d1987ebe6bb0904535` |
| `styles.css`                      | `82badc6a5281b485fb10be33010293520465c117c3bb385472c38e8517d8764e` |
| `styles/buttonStyles.js`          | `23905fa400f5e69d94487fe77f26c2ddf7b1031f29c23b035482496fe26c0717` |
| `utils/uiPropValidators.js`       | `6b4cbd4427d2149ab3e45e75b8f3aff19c58aa6b9d6e13116672531e06560911` |
| `test/e2e/foundation.spec.js`     | `7c050aa38ac9ad8022c2959e8b299b0fce3d6e404566424fc42891d2b63df558` |
| `PreviewCanvas/PreviewCanvas.jsx` | `22a5d0ad0d9e796ee5f98b3862977e75db4bb50b03b7fbe1e32a5bec3ecda4e1` |

**Next decision belongs to the independent reviewer:** accept/fix the real foundation and exact interface ledger, then authorize B/C/D; later A integration is still required. No self-approval or full-redesign completion is implied.
