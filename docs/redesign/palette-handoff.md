# C — palette redesign handoff

## Delivery status

**Implemented and focused verification passed; ready for independent slice review, not independently accepted.** Foundation consumption is authorized by `foundation-independent-audit.md` (ACCEPT FOUNDATION FOR B/C/D). This implementer cannot supply the independent approval of their own changes; parent must commission that read-only review before acceptance.

Branch `gloin/editor-redesign`, starting HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`, original source baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`. Other owners are changing the same checkout. No commit, push, remote change, dependencies, tracked configuration, build, store/schema/preset data, legacy PresetGallery, global CSS, shared helper, hook or engine changes were made by C.

## Exact C repository files

- Modified `src/app/components/ColorPalette/ColorPalette.jsx`.
- Modified `src/app/components/ColorPalette/ColorPalette.test.jsx`: retained all existing transaction/drag assertions; adapted truthful saving/deletion names and explicit browser opening.
- Added `src/app/components/ColorPalette/ColorPalette.redesign.test.jsx`: 19 direct component cases.
- Added this `docs/redesign/palette-handoff.md`.

`ColorPalette/paletteHarness.jsx` and all `test/e2e` files remain A-owned and were not edited by C. Their pre-existing/concurrent diffs must not be attributed to this slice.

## Behavior and contract mapping

- Current ordered edit strip, direction guidance, separate edit/drag handles and Add/Remove now precede browsing. Retained bounded horizontal scrolling, 2–6 UI limits, duplicate-item addressing, native picker immediate commits, picker bounds/portal host and all existing DnD sensors and event contracts.
- Browse palettes defaults false, supports exact controlled `palettesOpen/onPalettesOpenChange`, and has a standalone local fallback. A native `aria-expanded/aria-controls` button controls the complete built-in/custom collection, showing every color preview, palette name and custom-only accessible Delete palette action. Apply continues to write only colors through the original structural/own-write/revision path.
- Save palette entry/submit, Palette name and Cancel palette are truthful color-only actions. The name form is outside browse content; collapsing browsing neither closes the form nor clears its draft. Existing controlled draft/open props and local fallbacks remain intact.
- Removed unconditional name `autoFocus`. Only explicit Save palette invocation registers a generation-bound postcommit focus request. A controlled-open mount/remount never registers one. Explicit Save/Cancel/input Escape clears and queues restoration to the exact existing trigger, guarded for generation, connected/enabled and non-hidden/non-inert visible state.
- Name invocation/restoration and custom-deletion restoration share the existing palette focus generation. Parent `interactionRef.current.cancel({restoreFocus:false})` synchronously invalidates those jobs as well as hex edits. The same-instance hide→cancel→reveal test drains jobs after re-exposing the same DOM nodes, so it tests generation retirement rather than only hidden/disconnected checks. Delayed controlled-open commits, unmount and explicit reopen are covered separately.
- Local pointerdown capture for Browse/Save/preset controls and Add/Remove retires transactions before blur, without preventing native pointer default. Internal picker blur-to-noncancel-control still commits exactly as before. No revision/own-write/hex-blur or keyboard Escape-ownership rewrite occurred; the generation ref was renamed with a `Ref` suffix for the installed React hooks lint rule.
- Frozen `BTN`/`bf-field`/`bf-label`/`bf-help`/`bf-error`/`bf-picker` styling replaces legacy green/zinc presentation. Edit swatches retain color-content inline fills with the frozen secondary boundary. Edit/drag/move/delete targets retain minimum 44px sizing. Optional browse/name metadata reuse existing validators; direct metadata tests do not claim automatic React 19 runtime validation.

## Executed final verification

All commands ran with `npx --yes --package=node@20 -c '…'`, installed direct tool entrypoints, no root full-suite/build during parallel ownership.

| Gate                                                                                                                                                                          | Actual final result                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `node node_modules/vitest/vitest.mjs run src/app/components/ColorPalette/ColorPalette.test.jsx src/app/components/ColorPalette/ColorPalette.redesign.test.jsx --maxWorkers=1` | Exit 0, **2 files / 37 tests passed**, 60.66s. Existing matrix 18; new cases 19. |
| `node node_modules/eslint/bin/eslint.js --ext .js,.jsx` with the three C JSX/test paths                                                                                       | Exit 0, no ignored-file warning.                                                 |
| `node node_modules/prettier/bin/prettier.cjs --check` with those three paths                                                                                                  | Exit 0, all formatted.                                                           |
| `git diff --check --` with the two tracked C paths                                                                                                                            | Exit 0. New test formatting/lint separately passed.                              |
| Scratch-only real-app Playwright probe `node /home/agent/.hermes/profiles/gloin/cache/scratch/bf-c-probe.mjs`                                                                 | Exit 0; `passed:true`, no page errors.                                           |

Earlier runs are retained as diagnosis, not claimed passes: three successive new-test runs hit the default 5000ms deadline in synchronous broad accessible queries; a one-worker reproduction confirmed the issue persisted. Prefiltering native candidate buttons and checking their actual accessible names, plus collecting browser buttons once, removed repeated full-preset-tree accessibility/visibility walks. No timeout, assertion budget, retry or global test configuration was changed. The final new suite passed at the unchanged deadline. Initial JSX lint identified a forward helper declaration and the required ref-prop naming convention; both were fixed without suppression changes. An initial browser probe attempted one Add beyond the actual initial palette size; the probe now observes the real disabled state and preserves the initial swatch label instead of assuming a default palette.

## Real-app source/browser and visual evidence

External Vite config `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-c-vite.mjs` imports the actual repo config and sets the exact repo root, strict port **5203**, isolated `bf-c-vite-cache`, HMR false. Outputs are outside the served root. Server session `proc_cae3ce7b051b` is left available for the parent's review; do not confuse it with A's server. This is source-app evidence, not a built-artifact gate.

Scratch probe and evidence: `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-c-probe.mjs` and `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-c-evidence/` (`results.json`, desktop-compact.png, desktop-browse-name.png, desktop-name.png, mobile-browse.png, mobile-invalid.png).

The real shell probe exercised default collapsed browsing, explicit name focus, draft retention through browse collapse and Motion→Look, task-button focus, 1440→320 responsive remount with retained name and Close initial focus, explicit cancel restoration, all six swatches, valid uncommitted hex cancellation via Browse pointer activation, invalid hex feedback, picker-first Escape then Settings Escape with exact opener restoration. At 320px: document width **320**, strip client width **286**, scroll width **312**; all twelve measured edit/drag buttons were **44×44**. No page errors occurred.

Directly inspected actual desktop browser/name and narrow browse/invalid screenshots. Frozen neutral/cobalt chrome leaves the real color content distinct, current editing is ahead of presets, and the name field remains visible when browsing collapses. Expanded collection and lower name actions use the shell's task-body scroll; short picker content uses its bounded internal scroll. A screenshot of invalid input is not proof its error/move buttons are simultaneously above the fold. No physical keyboard, Safari, AT or touch certification is claimed.

## Review/integration still required

1. Independent source/test review against state contracts §§4–5, particularly explicit-invocation focus, shared cancellation generation and internal-vs-outside blur. This handoff's redline is implementer review only.
2. A adapts/executes the full retained P01–P11 and U keyboard-drag first/second Escape, parent task/close/resize, full destination matrix and stale-new-dialog browser regressions. C did not edit those integrated specs or fixtures.
3. A performs final combined-tree CSS/contrast, 200% zoom/reflow, all-state screenshots, root/workspace/build/browser gates and full output acceptance. The scratch probe supplements rather than replaces them. No shared-style request is outstanding.

## Final C source identity (SHA-256)

- `ColorPalette.jsx`: `29d091f6f0479a686d0116d64946a4e968327fc62da907c1c6d9cb566607cfb4`
- `ColorPalette.test.jsx`: `82d8e6a19300f520ef1b689645cb0b5843a4442ae388f5e10d93d926463d4611`
- `ColorPalette.redesign.test.jsx`: `5a1423268b4222127b0ccff67a852dd47f5678400a7d4162335defaa3b3c5e1f`
