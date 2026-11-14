# Independent implementation audit — UI foundations #82–86

## Verdict

**REQUEST CHANGES before declaring #82–86 complete.** The integrated architecture substantially follows the accepted plans, and the independent Chromium suites pass, but there is a reproduced nested keyboard-cancellation defect and the default focused/root unit gate is not reliably green. Fix those findings and rerun the exact final tree. The status presenter also drops all detailed busy progress rather than preserving relevant producer messages.

Reviewed local branch `gloin/ui-output-improvements`, HEAD/base `298bdec17dcd1603add549118a743e5cd494ba08`, with uncommitted implementations. Authority: `ui-foundations.md` including UF-R1–R4 and phased acceptance, `ui-foundations-acceptance.md`, `audit-resolutions.md`, and sibling `bitmapforge-ui-handoff.md`. Worker summaries were treated as leads, not passing evidence. Governance and actual application/test diffs and untracked tests were read. Concurrent engine/ASCII/CI/export-fixture work is outside this audit's ownership.

No application or repository test code was edited. This document is the sole repository-authored deliverable. Scratch-only diagnostic scripts, Vite config, CPU profiles and browser artifacts are listed below. No commit, push, reset, stash, deployment or remote write occurred.

## Actionable findings

### UI-A1 — Keyboard drag Escape also dismisses the mobile settings drawer (blocking, medium severity)

**Evidence:** On the isolated no-HMR application at `http://127.0.0.1:5287/`, viewport 390×844:

1. Open settings.
2. Focus `Reorder color 2`, press Space; verify `aria-pressed="true"`.
3. Press ArrowRight, then Escape.
4. The Settings dialog count becomes **0**, instead of retaining the drawer and restoring the drag handle. This was reproduced twice, including a 150ms settle after Escape. Diagnostic stdout: `active drag true` and `mobile drag cancel {"drawers":0,"focused":null}` (the opener has no aria-label, so the null alone is not a focus-loss assertion).

**Source boundary:** `ColorPalette.jsx:328–350` handles `onDragCancel` and queues handle focus, but exposes no active-drag Escape ownership to the enclosing Dialog. `Layout.jsx:351–353` prevents Dialog Escape only for help. Radix Dialog handles Escape at the document boundary; dnd-kit keyboard cancellation does not prevent that earlier dialog handling. Parent cancellation then wins and unmounts the palette. The existing palette keyboard-cancel test is outside a modal; the integrated tests cover picker Escape, not drag Escape.

**Required repair:** Give an active keyboard drag first refusal of Escape without changing normal picker/help/drawer dismissal. Coordinate a narrow palette interaction contract or event boundary with the Layout owner; do not add an unconditional global Escape blocker. Add a real integrated mobile test: pickup → arrow → Escape retains drawer, preserves colors and focuses original handle; a second Escape closes drawer and restores its recorded opener. Also test drop (Space) and external cancellation in the modal.

### UI-A2 — Layout tests exhaust their time budget doing document-wide accessible queries (blocking verification defect)

**Independent reproduction, unchanged timeouts:**

- Six focused files: **57 passed, 2 failed of 59**. `Layout.test.jsx:109` exhausted its explicit 15000ms; `:136` exhausted the default 5000ms. Other five files passed (including all 14 palette tests).
- Layout alone with `--maxWorkers=1`: **9 passed, 1 failed**. Lifetime test passed in 8163ms; disclosure/draft/cancel test took 10160ms and timed out. Thus it is not safe to attribute the root failure solely to parallel files.
- Selected disclosure test with a CPU profile, one thread and no isolation: **1 passed, 9 skipped**, 3973ms. This is diagnostic evidence of workload sensitivity, not a replacement acceptance run.
- Parent independently reported the same two root timeouts and the isolated disclosure timeout. Parent-owned broad results are not counted as this audit's own passes.

**Diagnosis:** The disclosure test is synchronous: it does not wait on an unresolved export or poll a deferred promise. CPU profiling shows **3202ms inclusive in Testing Library `queryAllByRole`**, **3067ms in `computeAccessibleName`**, and **3274ms in jsdom `window.getComputedStyle`**, within about **3922ms attributed to the test callback**. These categories overlap and must not be summed. CSS parsing/color resolution dominates the query stacks. The file repeatedly calls `screen.getByRole('button', {name: ...})` over the whole real controlled ExportPanel/settings tree, recomputing names/styles for unrelated buttons. The lifetime test uses the same expensive pattern. This explains a narrow 5-second margin even without a stuck async operation. No infinite application update loop was observed in this profile.

**Required repair:** Optimize the test work, not its timeout: cache stable queried controls before repeated actions, use `within` on the actual drawer/section or panel, and split irrelevant full-panel rendering from disclosure-state verification with a controlled presentational fixture where appropriate. Preserve at least one real ExportPanel + controller deferred-export integration test and browser accessibility checks. Put the download spy restoration in `try/finally` or unconditional `afterEach` so an interrupted lifetime assertion cannot leak the spy into later tests. Rerun the file at its existing timeouts, then focused and full root suites. Do not mask this by raising timeouts or globally bypassing accessibility calculations.

### UI-A3 — The sole status notice discards all detailed busy progress (medium)

`StatusNotice.jsx:8–10` unconditionally chooses `Exporting…`/`Loading model…` whenever the corresponding flag is true. `useExport.js:303–308` still writes operation-specific progress into `status.message`, but no other presenter remains. Browser injection of `{exporting:true, loading:false, message:'Encoding APNG 42%', error:''}` rendered only **`Exporting…`**. This is deterministic, not an announcement hypothesis.

The plan calls for relevant loading/export messages with operation-specific fallback; it reserves stable generic text for the busy **button** and explicitly removes duplicated detailed progress from that button. Avoiding another producer's stale success is necessary, but losing every percentage/encoding stage is a regression in the only feedback surface.

**Repair:** Preserve known current-operation progress in the notice while keeping the button generic and retaining error precedence. Use the bounded producer contracts/recognized current progress rather than blindly displaying any shared success message during overlap; no queue/schema redesign is requested. Add tests for actual progress, loading fallback, stale save success during export, error precedence and both-busy overlap.

## Architecture and accepted behavior confirmed

| Area | Independent source/runtime evidence |
| --- | --- |
| Palette transactions | Separate 44px edit/drag activators; pointer distance 8; keyboard sortable coordinates; local token/revision guard; synchronous own-write consumption; external mutation cancels; immediate picker draft synchronization; no persisted IDs/schema change. 14 unit and 11 browser tests pass. |
| Blur/cancel boundaries | Capture pointer cancellation before blur, Close excluded from commit, internal blur commits, Escape/Close/outside/Tab/parent cancel. Browser matrix includes valid/invalid drafts, switch, Add/Remove, undo/redo, external change, shortened/duplicate palettes and parent hiding. |
| Modal portal/focus | Picker host is a child of Dialog.Content; closed mobile settings unmount; background preview gets native inert; modal isolation, trap, both openers, backdrop/Close and responsive restoration pass. Exception: active drag Escape in UI-A1. |
| Stable ownership | Layout owns one controller outside presentation branches; controller calls useExport once; ExportPanel has no fallback hook. PreviewCanvas stays at one stable sibling position. Required format/sections/advanced/preset-name UI state is lifted without serialization. |
| Export disposal | useExport invalidates generation and aborts on disposal; progress/completion/download check the current generation. Tests cover nonabortable completion, cancellation and late updates. Actual closing/resizing does not dispose Layout. |
| Reveal/disclosure | Section bodies are truly hidden; Export initially open, Rotation/Light closed; rail and persistent export access work; ref/layout reveal is cancellable rather than timeout-based. Browser geometry checks pass at all planned CSS viewport sizes and reduced motion. |
| Export semantics | Nine named native pressed buttons, APNG default, checkmark, generated description association; controlled routing unchanged; real Enter/Space and keyboard project chooser paths pass. |
| Help | App sibling help explicitly cancels picker; help Escape leaves drawer; focus fallback avoids disconnected/hidden/inert/disabled invokers. Browser picker/help and responsive portal scenarios pass. |
| Status ownership | One stable StatusNotice portal node moves between preview and modal hosts outside section bodies; no duplicated PreviewCanvas global error overlay; Dismiss clears error/message without clearing valid model. Help defers latest update. Producer cleanup and shared Ctrl+S save paths covered. Detailed progress caveat: UI-A3. |

The browser viewport test checks nonblank shape output, positive dimensions, identity stability and no download on access at 1280×800, 1024×768, 1023×768, 390×844, 320×568 and 667×320. Source/test inspection confirms owner-lifetime assertions use the actual PreviewCanvas with a mocked SceneManager, not fabricated error markup. This does not certify engine correctness or export fidelity.

## Executed verification and contamination handling

Node 20 was invoked through `npx --yes --package=node@20 -c` with direct installed JS entrypoints.

1. Focused command: `node node_modules/vitest/vitest.mjs run src/app/components/ColorPalette/ColorPalette.test.jsx src/app/components/Layout/Layout.test.jsx src/app/components/ExportPanel/ExportPanel.test.jsx src/app/components/ui/StatusNotice.test.jsx src/app/hooks/useExportController.test.jsx src/app/hooks/useExport.test.js` → **57/59 pass**, two timeouts above. Expected error-path console output and jsdom navigation warnings also occurred.
2. `node node_modules/vitest/vitest.mjs run src/app/components/Layout/Layout.test.jsx --maxWorkers=1` → **9/10 pass**.
3. CPU diagnostic: `node --cpu-prof --cpu-prof-dir=.. node_modules/vitest/vitest.mjs run src/app/components/Layout/Layout.test.jsx --maxWorkers=1 -t "preserves required disclosure" --pool=threads --no-isolate` → **1 pass/9 skipped**, profile diagnosis above.
4. Verified parent server PID 674011 command/cwd pointed at this exact checkout and port 5276. First combined browser invocation mistakenly omitted the palette spec's separate `PALETTE_BASE_URL` variable, so those setup failures hit default 5173; that run is invalid evidence and was corrected. No unrelated server process was modified.
5. Corrected parent-server combined browser run → **18 pass/1 fail**. The viewport test navigated/reloaded the app during the 320px export-focus assertion. Retained trace shows a second Vite connection and navigation while waiting for focus. Concurrent checkout writes/builds make this run unsuitable as clean focus-regression attribution.
6. Started independent Vite on **5287**, with unique scratch `cacheDir`, HMR disabled and browser outputs outside served root. Corrected command: `PALETTE_BASE_URL=http://127.0.0.1:5287 BITMAPFORGE_UI_URL=http://127.0.0.1:5287 npx --yes --package=node@20 -c 'node node_modules/@playwright/test/cli.js test --config=../bitmapforge-ui-playwright.config.mjs ui-foundations.spec.js palette.spec.js --workers=1 --output=../ui-independent-audit-nohmr-results'` → **19 passed: palette 11, integrated UI 8**. The initial health curl preceded server readiness; the actual browser subsequently reached and exercised this server successfully.
7. Independent scratch browser probe reproduced UI-A1 twice and UI-A3; no-HMR server, native keyboard input and active-drag assertion.
8. `git diff --check` passed at the inspection point. This audit does not substitute for parent-owned exact-tree lint/format/root/embed/CLI/build/decode/export verification.

Browser artifacts: sibling scratch `ui-independent-audit-nohmr-results/` (viewport screenshots), `ui-independent-audit-results-corrected/` (failed-run trace/error screenshot), `bitmapforge-ui-audit-probe.mjs`, `bitmapforge-ui-audit-vite.config.mjs`, `ui-audit-mobile-status.png`, `ui-audit-desktop.png`, and `CPU.20261113.230918.728519.2.003.cpuprofile` (worker profile; sibling main/loader profiles also generated). Screenshots were visually inspected: desktop access/notice/preview placement and mobile Close/status are not clipped. The no-model probe screenshot is not claimed as rendered-output evidence; the shape browser test supplies that evidence.

## Remaining gates and scope limitations

- Fix/review UI-A1 and UI-A2; resolve UI-A3 against the accepted busy-message contract. Add missing integrated drag-cancel coverage before claiming complete nested Escape behavior.
- Existing export visual fixture failure and integration-runner work belong to the parent's independent export verifier. This audit read the locator adaptation (Preview-scoped canvas and environment URL), did not modify those files and makes no claim that the full existing export visual suite passed.
- Parent exact-tree checks must follow any fixes, including root tests at unchanged timeouts and export decode/browser paths. Concurrent generated SDK, engine, CI and fixture changes are not authored or validated by this UI audit.
- Physical touch, mobile Safari/iOS scroll restoration, VoiceOver/other assistive technology and actual 200% browser zoom are **unverified**. Chromium touch emulation is not physical-device evidence. Stable DOM/live-region identity is not proof of how a screen reader announces host movement or help deferral.
- No release/deployment approval is implied. Plans remain ignored local artifacts; retain/share this report intentionally rather than assuming tracked status publishes it.
