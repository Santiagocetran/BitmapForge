# UI foundations implementation-audit repairs — UI-A1 / UI-A2 / UI-A3

## Disposition

**All three requested repairs are implemented and regression-tested; ready for independent re-review, not self-approved.** Authority remains `ui-foundations.md` UF-R1–R4 and `ui-foundations-acceptance.md`. This document responds to `ui-foundations-implementation-audit.md`; it does not supersede the audit or certify unrelated concurrent work.

Checkout: `gloin/ui-output-improvements`, HEAD/base `298bdec17dcd1603add549118a743e5cd494ba08`, local uncommitted work. No commit, push, reset, stash, deployment, remote write, engine/export-template/CI edit, dependency change, or timeout increase was made by this repair worker. Existing work was preserved.

| Finding | Repair | Regression evidence |
| --- | --- | --- |
| UI-A1: keyboard drag Escape also closed mobile drawer | Palette's existing optional `interactionRef` now exposes `isKeyboardDragging()`, based on synchronous active-drag and keyboard-activator refs. Layout's existing Dialog `onEscapeKeyDown` prevents only drawer dismissal while this predicate is true (or help is open). It does **not** stop propagation: dnd-kit still receives Escape, cancels the drag, preserves colors, and restores the original handle. No global Escape listener/blocker was added. Drop, external mutation and parent cancellation clear active ownership through existing drag cleanup. | Four new palette unit cases cover Escape/drop/external/parent completion and ref cleanup. Three integrated browser cases cover both recorded openers, pickup → ArrowRight → Escape retaining drawer/colors/original handle, second Escape closing drawer/restoring opener, actual Space drop with reordered colors/moved-swatch focus, and external replacement during drag followed by ordinary drawer Escape. Existing picker/help/drawer tests remain green. |
| UI-A2: Layout accessible queries consumed the unchanged test budget | Use section/heading/header-scoped `within` role/name queries, cache the stable Close control and format group during deferred work, and reuse section controls for repeated assertions. Disclosure/status-only tests replace irrelevant ExportPanel presentation with a simple fixture; the deferred-export lifetime case explicitly retains the **real ExportPanel, real controller/useExport, and real PreviewCanvas with mocked SceneManager**. Unconditional `afterEach` restores spies, so a failed/timed-out lifetime assertion cannot leak its download spy. | Layout alone **10/10**, focused six files **83/83**, default full root suite **677/677**. Explicit lifetime timeout remains 15000ms; other Layout tests retain the default 5000ms. No global accessibility configuration or accessible-name bypass. |
| UI-A3: sole notice discarded real encoding progress | `isExportProgressMessage()` derives recognized busy stages directly from existing useExport format producers. It accepts exact start text or stage plus bounded integer 0–100% progress, rejects success/unknown/malformed text. StatusNotice preserves recognized progress only for export-without-loading; stale save/model completion falls back to generic busy text. Both-busy overlap intentionally stays generic, loading uses its existing fallback, and errors still win. Busy export button remains generic. No queue, producer flags/schema, export execution or download behavior changed. | 21 StatusNotice tests include all nine stage names, APNG 42%, percentage bounds/malformed text, loading fallback, stale save success, both-busy overlap, error precedence, dismissal and help deferral. A hook test obtains actual `Encoding APNG 42%` from its progress callback and checks progress versus export/save completion classification. Integrated browser status test checks detailed notice versus generic disabled button, stale save fallback and overlap. |

## Authored files

- `src/app/components/ColorPalette/ColorPalette.jsx`
- `src/app/components/ColorPalette/ColorPalette.test.jsx`
- `src/app/components/Layout/Layout.jsx`
- `src/app/components/Layout/Layout.test.jsx`
- `src/app/components/ui/StatusNotice.jsx`
- `src/app/components/ui/StatusNotice.test.jsx`
- `src/app/hooks/useExport.js` (producer-message recognition helper only)
- `src/app/hooks/useExport.test.js`
- `test/e2e/ui-foundations.spec.js`
- This disposition document.

`test/e2e/palette.spec.js` was exercised unchanged, not edited. Export visual runner/spec/fixtures and concurrent engine/ASCII/CI changes remain other workers' ownership.

## Verification actually executed

All Node commands below used `npx --yes --package=node@20 -c '<command>'`, invoking installed JS entrypoints directly. No test timeout or runner configuration was edited.

1. `node node_modules/vitest/vitest.mjs run src/app/components/Layout/Layout.test.jsx --maxWorkers=1` — **10 passed**, final isolated run 13.19s overall; lifetime 3759ms, disclosure/draft 1242ms. For comparison, the audit reproduced an isolated disclosure timeout at 10160ms. This is measured improvement, not a claim that scheduler timing is guaranteed.
2. `node node_modules/vitest/vitest.mjs run src/app/components/ColorPalette/ColorPalette.test.jsx src/app/components/Layout/Layout.test.jsx src/app/components/ExportPanel/ExportPanel.test.jsx src/app/components/ui/StatusNotice.test.jsx src/app/hooks/useExportController.test.jsx src/app/hooks/useExport.test.js` — **6 files / 83 tests passed**, 32.26s overall. Layout lifetime 5745ms within its existing 15000ms; disclosure 1632ms within default 5000ms. Log: sibling scratch `ui-audit-fixes-focused.log`.
3. `node node_modules/vitest/vitest.mjs run` — **44 files / 677 tests passed**, 73.70s overall at default concurrency/timeouts. Layout lifetime 3947ms, disclosure 1276ms. Log: sibling scratch `ui-audit-fixes-root.log`. Expected negative-path console errors and existing jsdom navigation warnings remain; no failing tests.
4. Verified PID 729638 command and `/proc/729638/cwd` point at this exact checkout and sibling `bitmapforge-ui-audit-vite.config.mjs`; HTTP 5287 returned 200. Config specifies this repository root, unique sibling cache directory, port **5287**, strict port and **HMR disabled**. Reused this parent-owned server without stopping/reconfiguring it. Each browser test navigates anew after source edits. No output was placed under the served root.
5. `PALETTE_BASE_URL=http://127.0.0.1:5287 BITMAPFORGE_UI_URL=http://127.0.0.1:5287 npx --yes --package=node@20 -c 'node node_modules/@playwright/test/cli.js test --config=../bitmapforge-ui-playwright.config.mjs ui-foundations.spec.js palette.spec.js --workers=1 --output=../ui-audit-fixes-browser-results'` — **22 passed** (palette 11, integrated UI 11), 3.1m. Includes native keys, dialog isolation/focus/scroll, picker/help stacking, touch emulation, six viewport geometries/reduced motion/nonblank preview, project chooser and status paths. Artifacts are sibling scratch `ui-audit-fixes-browser-results/`.
6. Targeted Prettier check of all nine authored source/test files — **passed**. `git diff --check` — **passed**.
7. Explicit JSX-inclusive ESLint (`node node_modules/eslint/bin/eslint.js --ext .js,.jsx` on the authored source/test files) — **18 errors**, exposing existing implementation constructs in Layout/Layout tests/StatusNotice: prop validation, render-time refs, and effect-driven notice state. These are not hidden by the default JSX omission and are **not claimed fixed** by this bounded repair. The new progress helper/browser spec have no reported lint errors. The subsequent Prettier and diff checks were run separately after this command failed. Parent should disposition these existing implementation lint findings during exact-tree review; no blanket lint-rule suppression was added.
8. Browser-tool visual inspection at 390×844 and 1280×800 confirmed `Encoding APNG 42%` visibly occupies the single drawer/preview notice with Close/access controls unclipped. Desktop shape preview was nonblank. Status was injected for inspection, not claimed to be a completed real export. The initial inspection call returned a transient `Promise was collected` error; readback and captures confirmed the browser reached the intended app and rendered the injected status.

### Intermediate failures, corrected rather than hidden

- Initial new drag browser assertions expected `aria-pressed="false"`; dnd-kit correctly **removes** that attribute when idle. Changed assertions to active `true` before cancellation and not-`true` afterwards, while retaining positive focus/color/drawer checks. Final 22-case browser run passes.
- An initial scoped test selector with the literal `Export & Project` attribute value returned null in this jsdom selector path. Replaced interpolation with exact dataset lookup and a normal heading selector, retaining accessible role/name assertions. Final isolated/focused/root gates pass.
- jsdom's zero item geometry chooses the first collision target on Space drop. The palette unit case asserts ownership release and color conservation; the real Chromium integration asserts the actual moved target/order and focus. No fabricated layout geometry or skipped regression was substituted.

## Re-review checklist and limits

- Check that the Escape predicate is keyboard-active-only and synchronous at Radix capture time; dnd-kit remains the cancellation owner and there is no persistent/global Escape suppression.
- Check that the real panel/controller/deferred completion and PreviewCanvas lifetime assertions remain in Layout's integration test, while irrelevant presentation is isolated elsewhere; verify unconditional download-spy cleanup and unchanged timeouts.
- Check that progress recognition is derived from actual producers, accepts bounded progress only, preserves error precedence and intentionally generic overlap, and does not interpret terminal save/export text as active progress.
- **Independent approval is pending.** Full root pass is not proof of omitted workspace/embed/CLI/decode/export-visual/build/release gates; those remain parent/other-worker verification. No export-fidelity or deployment claim is made here.
- Physical touch, mobile Safari, VoiceOver/other screen readers, and actual 200% browser zoom remain unverified, as in the original audit. Chromium touch emulation and DOM live-region checks do not replace those gates.
- Plans are ignored local artifacts; this file exists locally for intentional handoff and was not force-added/published.
