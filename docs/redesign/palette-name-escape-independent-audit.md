# Palette-name Escape B1 — independent re-audit

## Verdict: ACCEPT the bounded B1 repair

The focused native name input now owns first Escape inside the real narrow Settings Dialog. First Escape clears the draft and closes only the name form, reveals/focuses Save palette and leaves Settings open. Second Escape closes Settings and restores the exact opener. **Both Open settings and global Export pass at 320×568.** Ordinary parent hiding still preserves the draft and open-form state without remount autofocus. No application, test or configuration change is requested for B1.

This clears **B1 in `palette-independent-audit.md`**, not the complete redesign/release gate. The retained post-repair built artifact run has a separate Embed failure; it is not green and this audit does not waive it.

## Identity, authority and scope

- Repository: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`; branch `gloin/editor-redesign`; HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`; original accepted baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`.
- Read root `AGENTS.md`, the original independent audit including B1, `palette-name-escape-fix.md`, actual source and exact worker patch/manifest. Loaded all three required product/frontend/redline skills and browser isolation reference. COLLAB bootstrap directory was absent; no private memories inspected.
- Reviewed only the explicitly authorized marker/assertion, narrow Dialog guard and dedicated integrated regressions. Existing dirty redesign changes are not attributed to this repair. Other reviewers' work was left untouched.
- Only this document was written inside the repository. Independent scratch configs, cache, logs, report, screenshots and patch-application copy are outside the repository at `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-name-escape-independent/`.
- No app/test/config edit, root suite, build, heavy export, commit, push, remote write or deployment was performed.

## Exact patch provenance — independently verified

Evidence supplied by A is under `../bf-p3-evidence/name-escape-fix/` relative to the repository. Independently hashed `worker-only.patch`, each `before/` snapshot and every manifest after-path. Every value matched `patch-manifest.json`. Applied the actual patch with `git apply` to a fresh external copy of `before/`; exit 0 and byte equality with current checkout for all five manifest paths. This is application/byte verification, not an assumption that equivalent textual diffs must match.

Patch SHA-256: `c68fa0234c65e2d5825f1d656e1bd8ce2e0f53ad97c833d6c59ee399c65429cc`.

| Path                                                              | Current/reviewed SHA-256                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/app/components/Layout/Layout.jsx`                            | `7c6cf79a55b37b896a41ee703dce6f4c7c8ef8de0b22e6a33b38787a04f8b40f` |
| `src/app/components/Layout/Layout.test.jsx` (unchanged by repair) | `bc5cc2968df1efdb93fd432384ad42386e3b692298aee935f72c3937c9158579` |
| `src/app/components/ColorPalette/ColorPalette.jsx`                | `7636969ccbb1ad457b4c66be35b1f1dad41c3e4b036190c9fe6730ce47ee54d2` |
| `src/app/components/ColorPalette/ColorPalette.redesign.test.jsx`  | `35ab4d273f9535471fdb783f6496b76e826fc705d4ae047ce918774ebdff0780` |
| `test/e2e/ui-foundations.spec.js`                                 | `47902ce6fe8ceead5f09e89fb93d7992f709bee1340f29dc4c4edf10a2d0c1b4` |

These hashes still matched after independent browser and unit execution. The patch changes exactly four files: marker in C, one marker assertion in the existing parameterized explicit-completion test, narrow guard in Layout, and two added browser cases. It leaves Layout's unit file unchanged. No original case body/shared helper was changed by this patch; the integrated test addition is purely additive. `provenance.json` and `final-hashes.json` retain the checks.

### Historical red versus green (not newly invented/replayed)

Read and parsed A's retained `red.log`, `red-report.json`, `green-report.json` and the original independent B1 reproduction. Red report: **one failure**, start `2026-11-14T05:17:15.779Z`; Open settings case fails at Settings-visible assertion immediately after name Escape because the Dialog is absent. Green report: **two passed**, start `2026-11-14T05:18:20.049Z`, duration 19.1s, both openers. The retained red trace ZIP passes CRC validation and contains test trace, browser trace/network and source resources. The earlier independent audit separately records the reopened preserved draft as evidence of mistaken parent dismissal.

Those are retained historical red/green artifacts; this reviewer did **not** rerun the unpatched application or claim an independently captured pre-fix trace. The exact snapshot/patch byte checks support the bounded before/after attribution. The independent current-tree green run below is a separate execution.

## Event ownership and lifetime findings

1. **The earlier interception is real.** Installed Radix `react-use-escape-keydown/dist/index.mjs:7–13` registers document `keydown` with `capture: true`. `react-dismissable-layer/dist/index.mjs:59–66` calls the highest layer's `onEscapeKeyDown`, then dismisses only if `defaultPrevented` is false. A child React bubble handler alone cannot protect against that earlier parent dismissal.
2. **The repair is specific, not catch-all.** `Layout.jsx:522–529` requires the event target to equal `document.activeElement`, match native `input[data-bf-palette-name]`, and be contained in this live drawer's actual content ref. An unmarked hex/text input, unfocused marked target or target outside this drawer does not qualify. Source search/review locates the marker on the actual name input, not a wrapper or generic field group. Existing Help and active keyboard-drag predicates remain unchanged.
3. **Only Radix dismissal is prevented at that boundary.** The guard calls `event.preventDefault()`; it adds no `stopPropagation`, draft mutation, form teardown, focus job, timer or second competing name handler. The event continues to C's unchanged React handler at `ColorPalette.jsx:189–198`. That handler does not reject an already-default-prevented event; on Escape it invokes the existing `finish()` after its existing local preventDefault/stopPropagation.
4. **C still owns explicit cancellation.** `finish()` at lines 120–125 clears the draft, closes the form and uses the existing generation-bound Save-trigger restoration. The new integrated assertions establish that this handler actually runs within Radix, rather than merely preserving Settings while leaving the form stuck. Once Save has focus the marker predicate is false; second Escape follows ordinary Dialog dismissal.
5. **Parent hiding remains different from Cancel.** The patch does not modify `cancel()`, controlled draft/form ownership, generation retirement, close barriers or remount focus policy. Both new opener cases fill a draft, use ordinary Close, verify exact opener focus, reopen and assert retained draft plus the correct initial destination (Close for ordinary opening; Export heading for Export opening). Only later explicit name Escape clears it. Reopening and reinvoking Save then verifies an empty value. Existing remount/task-switch/queued-focus and same-instance-hide unit/browser cases also pass.
6. **No transaction or drag rewrite.** Hex normalization, picker callbacks, blur transactions, revision/subscription guards, reorder sensors and drag ownership remain outside the repair. Original picker-first/parent-second Escape, keyboard drag cancellation/drop/external/parent retirement and sibling Help behavior passed in the independent affected matrix.

## Independently executed verification

All JS commands used `npx --yes --package=node@20 -c '…'`; observed Node **v20.20.2**. Source server was created by this reviewer on strict **127.0.0.1:5219**, repository root/config, external isolated `vite-cache`, **HMR false**, and no reused existing server. Playwright inherited the actual root config: one worker, **90000ms**, **retries 0**, Chromium software GL. Only URLs, source-server ownership and external output/report locations were overridden. Runner owned contexts/artifacts; no manual trace ownership conflict was introduced. This is source-app evidence, not production-build evidence.

| Gate                                                                                                                                                                                                                                            | Actual result                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `node node_modules/@playwright/test/cli.js test --config=../bf-name-escape-independent/playwright.config.mjs test/e2e/ui-foundations.spec.js test/e2e/palette.spec.js --grep-invert "R1 \|R2 \|combined state captures\|actual native, portal"` | **Exit 0: 39 passed**, 3.9m; JSON expected 39, skipped 0, unexpected 0, flaky 0. |
| `node node_modules/vitest/vitest.mjs run --maxWorkers=1` with `ColorPalette.test.jsx`, `ColorPalette.redesign.test.jsx`, `Layout.test.jsx`, `ProjectActions.test.jsx`                                                                           | **Exit 0: 4 files, 54 tests passed**, 67.77s.                                    |
| Explicit `eslint --ext .js,.jsx` with all four patch paths                                                                                                                                                                                      | **Exit 0**, no ignored-file warning.                                             |
| `prettier --check` with all four patch paths                                                                                                                                                                                                    | **Exit 0**, all formatted.                                                       |
| `git diff --check --` with all four patch paths                                                                                                                                                                                                 | **Exit 0**.                                                                      |

The 39-case serial run includes all retained original 30 UI/palette scenarios plus the nine added name/remount/task-hide/hex-parent/B1 scenarios. Both 320×568 B1 cases explicitly exercise parent Close preservation, initial focus on reopen, first Escape form removal/Save focus and viewport reveal, second Escape/exact-opener restoration, and empty draft after subsequent invocation. Other executed cases include both-opener keyboard drag Escape, drop/external/close/resize/task-hide retirement, picker-first Escape and Help, ordinary Close/Escape/backdrop, responsive remounts, native mouse/touch drag, and valid/invalid hex cancellation before blur. Standalone unit passes are not substituted for the real enclosing Dialog tests.

Evidence: `browser.log`, `report.json`, `units.log`, `provenance.json`, `final-hashes.json`, external config/server and `results/` under the independent evidence root above. Directly inspected both `results/ui-foundations-B1-*/name-first-escape.png` captures: Settings remains, name form is absent, Save palette is fully visible with the focus outline. The screenshots agree with actual focused-element and in-viewport assertions; screenshots alone are not the focus proof.

## Remaining gates / issues

- No B1-specific blocking finding remains. Accept this exact four-file repair and clear the prior bounded palette blocker.
- `palette-name-escape-fix.md` still labels final gates pending. Retained `gates.json` and logs show units/lint/source/build completed, but **built artifact gate exited 1: 9 passed, 1 failed**. Failure is `Embed UI supported source runs and image stays disabled`, `redesign-artifacts.spec.js:213`, detached canvas during screenshot. This reviewer read the actual failure and did not rerun heavy exports or infer a cause. The separate Embed investigator/parent owns disposition; neither the repair document's pending wording nor this B1 acceptance represents overall acceptance.
- Whole-tree/release, full design/contrast/zoom, generated runtime, physical mobile keyboard/Safari/AT and production deployment remain outside this bounded re-audit. No new product defect was found in its tested scope.
