# Independent re-audit — UI-A1 / UI-A2 / UI-A3 repairs

## Verdict

**Accept the three bounded behavioral repairs. Request changes before declaring the overall UI implementation lint-clean or complete.** Independent focused tests and integrated Chromium checks pass, including additional active-drag parent-cancellation probes. The explicit JSX-inclusive lint gate still fails with **18 errors**. Most are new UI implementation debt relative to baseline, not unrelated pre-existing repository failures. Do not dismiss them because they predate this repair worker's narrowly scoped changes.

Reviewed branch `gloin/ui-output-improvements`, HEAD/base `298bdec17dcd1603add549118a743e5cd494ba08`, with uncommitted work. Read governance, accepted UI plan/addenda and acceptance, prior implementation audit, repair disposition, actual component/hook/test sources, and baseline Layout source. Referenced COLLAB documents are absent. Worker claims of Layout 10 / focused 83 / root 677 / browser 22 were leads, not acceptance evidence; this review independently reran the first, second and fourth, not root 677.

Only this repository document is authored by this review. No application/test/config edits, dependency installs, reset/stash, commit/push, deployment, or remote writes. The concurrent Code ZIP worker's implementation, tests and browser section are outside ownership. Final full-tree checks after that worker finishes remain the parent gate.

## Repair findings and acceptance

### UI-A1 — Accepted: narrow keyboard-drag Escape ownership

- `ColorPalette.jsx:223–258` installs the existing interaction interface in an effect; `isKeyboardDragging()` reads synchronous `dragRef` plus keyboard activator identity. `onDragStart` identifies `keydown`; pointer drags do not acquire this Escape predicate.
- `Layout.jsx:351–353` prevents Radix dismissal only for help or that active keyboard predicate. It does not stop propagation to dnd-kit and adds no global Escape listener. This is first refusal of **drawer dismissal**, not blanket suppression of keyboard handling.
- Cancellation and successful completion null `dragRef`; external replacement invokes cancellation and remounts the drag context; unmount clears the interface and focus generation. The keyboard boolean need not reset because the active-drag conjunction becomes false, and the next pickup overwrites activator identity.
- Parent cancellation uses `restoreFocus:false`, invalidating queued child restoration before hiding/removing settings. Normal parent opener/breakpoint focus restoration remains authoritative.

Independent browser tests pass for both openers: Space pickup with positive `aria-pressed=true`, ArrowRight, Escape retaining drawer and original colors and restoring original handle, then a second Escape closing drawer and restoring the recorded opener. Drop asserts actual reordered colors and moved-swatch focus; external replacement asserts stale keys cannot mutate the replacement and normal Escape dismisses. Idle dnd-kit removes `aria-pressed`; the tests correctly assert not-true, rather than inventing a required false attribute.

Additional independent scratch probe also passes: active keyboard drag → parent Close → opener focus → reopen → ordinary Escape; and active drag → mobile-to-desktop breakpoint → return to mobile → reopen → ordinary Escape. This specifically checks ownership does not leak across parent cancellation/unmount. Existing real integrated picker/help and parent breakpoint focus tests also pass.

### UI-A2 — Accepted: accessible-query cost reduced without weakening lifetime coverage

`Layout.test.jsx:81–97` scopes named role queries to real section headings/sections and the actual dialog header. The lifetime test caches stable controls and format group. This reduces irrelevant accessible-name/style work without changing Testing Library configuration, excluding hidden semantics globally, or increasing test timeouts.

The disclosure/status-only fixture excludes irrelevant ExportPanel presentation, but the deferred lifetime test explicitly enables the real panel (`:138`), retains the real Layout controller/useExport and real PreviewCanvas with mocked SceneManager, drives a deferred builder promise, closes/reopens and crosses both breakpoints, checks selected format/busy state, and resolves exactly one builder call/download with one manager construction. The builder mock is deliberate lifetime isolation, not claimed native Code ZIP fidelity. Palette itself is mocked in Layout units; real integrated browser tests provide nested widget coverage.

`afterEach` unconditionally performs cleanup/global restoration/spy restoration. The lifetime test retains its existing **15000ms** budget; the disclosure test retains default **5000ms**. Independently observed:

| Run | Result | Lifetime | Disclosure/draft |
| --- | --- | --- | --- |
| Six focused files, default concurrency | 83/83, six files | 3977ms | 1319ms |
| Layout alone, `--maxWorkers=1` | 10/10 | 4460ms | 1252ms |

The previously reproduced isolated disclosure timeout is not reproduced. These measured passes support the repair; they are not a guarantee against arbitrary machine starvation. Root/default-concurrency exact-final-tree verification remains with the parent.

### UI-A3 — Accepted: bounded real producer progress, intentional generic overlap

`useExport.js:262–270` derives stage names from existing `FORMAT_HANDLERS.startMessage`. It accepts exact stage-start text or that stage plus an integer percentage 0–100. Anchored recognition rejects terminal success, save/model completion, unknown stages, NaN/out-of-range percentages and appended obsolete text. It does not introduce new status schema/queue/operation ownership.

`StatusNotice.jsx:11–17` shows recognized export progress only while exporting without loading; stale success during export gets `Exporting…`, loading alone gets `Loading model…`, and both-busy gets generic export fallback. Error wins over all these branches. Busy button remains generic and disabled. The helper intentionally does not prove message provenance across arbitrary operations: the existing single shared message cannot supply that guarantee. The accepted bounded producer contract, not a new attribution system, is what passes here.

The 21 notice tests pass, including all nine stages, 0%/100%, malformed/101%, stale success, fallback, overlap, error, dismissal and help deferral. The hook test actually invokes the APNG capture progress callback `(42,100)`, reads `Encoding APNG 42%`, and distinguishes it from export/save terminal completion. Integrated browser status coverage injects store states to test presentation and button behavior; it is **not** an actual browser encoder progress/export-fidelity test. That distinction is retained.

## JSX lint — independently reproduced, actionable open finding

### Exact gate

All Node commands in this report use `npx --yes --package=node@20 -c '<direct installed JS command>'`.

```sh
node node_modules/eslint/bin/eslint.js --ext .js,.jsx \
  src/app/components/ColorPalette/ColorPalette.jsx \
  src/app/components/ColorPalette/ColorPalette.test.jsx \
  src/app/components/Layout/Layout.jsx \
  src/app/components/Layout/Layout.test.jsx \
  src/app/components/ui/StatusNotice.jsx \
  src/app/components/ui/StatusNotice.test.jsx \
  src/app/hooks/useExport.js src/app/hooks/useExport.test.js \
  test/e2e/ui-foundations.spec.js
```

**Exit 1: 18 errors, zero warnings.** A separate production-only four-file gate produces 12 of these errors; the six remaining errors are Layout test fixtures. Passing unit/browser behavior does not clear lint.

Without `--ext`, explicit `eslint src/app/components/Layout/Layout.jsx` reports **“File ignored because no matching configuration was supplied”** and exits successfully with a warning. `eslint.config.js` supplies no JSX file-glob inclusion. Root `eslint .` therefore is not evidence of component lint cleanliness. The inclusion gap itself must be repaired deliberately in a separately owned lint-config change and followed by classification of any broader findings, not an unexplained whole-repository rewrite.

### Scope attribution and concrete remediation

| Findings | Count | Attribution against `298bdec`, not just repair handoff | Recommended safe disposition |
| --- | --- | --- | --- |
| Layout Section `title`, `open`, `onToggle`, `children`, `headingRef` (`:19`) and Layout `bridgeRef`, `helpOpen`, `bridgeRef.current` (`:75,184`) missing prop validation | 8 | Baseline Section already lacked `title`, `children`, `defaultOpen` validation. Only title/children are surviving baseline findings; controlled Section props and Layout bridge/help props are introduced by the UI implementation. Removed defaultOpen is not a current finding. | Declare actual supported contracts for Section and Layout: renderable children, title, boolean disclosure/help, callbacks/ref shape with nullable current and imperative methods. Use the project's approved validator mechanism or small real custom prop-validator functions if avoiding a new dependency; JSDoc alone does not satisfy this rule. Do not add an eslint-disable or pretend React 19 runtime prop validation is thereby guaranteed. |
| Layout `drawerLive.current` written during render (`:108`) | 1 | New responsive implementation construct; baseline has no drawerLive. | Move the committed drawer-live synchronization into a correctly ordered layout-phase mechanism, before any consumer relies on it, or remove the mirror by using committed state/event ownership. Test Radix close autofocus timing explicitly: ordinary close, immediate close/reopen, both breakpoint directions and help. Do not simply use a passive effect that can leave stale close ownership during focus teardown. |
| Layout `bridgeRef.current` assigned during render (`:183–197`) | 1 | New shared save/help bridge; absent in baseline. | Publish the imperative bridge through `useImperativeHandle` or a layout effect with correct dependencies and identity-safe cleanup. Preserve beforeHelp's synchronous picker cancellation and latest save/focus closure, and clear only the bridge instance this owner installed on unmount. Recheck Ctrl+S, help fallback, disconnected invokers, StrictMode cleanup and responsive focus. |
| Layout test fixture palette `interactionRef`, `presetDraft`, `onPresetDraftChange`, `interactionRef.current`; quality fixture `advancedOpen`, `onAdvancedOpenChange` (`:43–55`) | 6 | Layout.test.jsx is new in this UI implementation. The six lines precede the A2 query optimization, but are not baseline debt. | Give fixtures named components with explicit supported validators. Publish their imperative ref in a commit-phase hook/imperative handle rather than expanding render-time mutations; retain spy-driven cancellation checks. Keep the lifetime case using real panel/controller. Do not globally exempt tests or disable prop validation. |
| StatusNotice `suspended` missing validation (`:4`) | 1 | Entire StatusNotice file is new relative to baseline. | Declare optional boolean contract using the same approved validation strategy. |
| StatusNotice synchronous setDisplay in effect (`:7–19`) | 1 | Entire notice architecture is new in the UI implementation; A3 changes its selection logic inside an already implementation-added effect. | Preserve the purposeful live-region postmount/help-deferral contract while removing mirrored effect-derived state. A bounded store subscription can publish snapshots from external-store callbacks, with explicit cancellable postcommit delivery for initial/resume snapshots; alternatively an independently reviewed cached external-store adapter can expose the frozen/latest snapshot. Make presentation selection a pure helper. Do not replace it with unconditional render-time derivation: that would display suspended updates and may prepopulate/remount a live region. Do not merely disable the rule or add an arbitrary timeout. Preserve one stable node, error precedence, latest-only resume, no duplicate host-move announcement, cleanup and all 21 notice/integrated tests. |

Counts: **15 prop-validation + 2 render-ref + 1 effect-state = 18**. Baseline Layout was independently linted via `git show 298bdec:... | eslint --ext .js,.jsx --stdin --stdin-filename ...`: three prop-validation errors (title/children/defaultOpen), no render-ref errors. `git cat-file -e` confirms StatusNotice and Layout.test.jsx are absent from baseline. Thus two current diagnostics clearly survive the baseline, while sixteen concern newly introduced UI contracts/constructs, even though they were present before the repair worker's small follow-up. These are merge-quality remediation items in this UI change scope, not evidence the three repaired behavioral defects persist. No runtime crash was reproduced from them, so do not inflate them into a demonstrated production outage.

Existing ColorPalette has its own file-level prop-types suppression (`:1`); its zero reported errors are not proof that every palette contract is validated. This review adds/recommends no suppression and does not expand an existing exception to other files.

## Independent verification ledger

1. Six focused Vitest files from the prior audit's exact command: **6 files / 83 tests passed**, 29.89s overall. Included palette 18, Layout 10, ExportPanel 12, notice 21, controller 3, export hook 19. Expected negative-path errors and jsdom navigation warnings occurred; no failures.
2. `node node_modules/vitest/vitest.mjs run src/app/components/Layout/Layout.test.jsx --maxWorkers=1`: **10 passed**, 17.66s overall, unchanged budgets.
3. Verified parent server PID **729638**, `/proc/729638/cwd` exactly this checkout, cmdline `node node_modules/vite/bin/vite.js --config ../bitmapforge-ui-audit-vite.config.mjs`; HTTP **5287** returned 200. Inspected config: root exact checkout, unique sibling cacheDir, strict port 5287, HMR disabled. Reused without modification or stopping it.
4. `PALETTE_BASE_URL=http://127.0.0.1:5287 BITMAPFORGE_UI_URL=http://127.0.0.1:5287` with `node node_modules/@playwright/test/cli.js test --config=../bitmapforge-ui-playwright.config.mjs ui-foundations.spec.js palette.spec.js --workers=1 --output=../ui-fixes-independent-browser-results`: **22 passed**, 3.2m (palette 11, integrated 11). Both environment variables were set. Explicit output override keeps screenshots/results outside served root despite inherited config default. No HMR/reload contamination observed.
5. Scratch-only native-key parent probe `../ui-fixes-independent-parent-probe.mjs`: **PASS active drag parent Close/refocus/reopen Escape; active drag breakpoint/reopen Escape**. It asserts active drag before both cancellations.
6. Explicit nine-file lint above: **18 errors**, exit 1; production subset: **12 errors**, exit 1. Plain JSX invocation: ignored-file warning, not a pass.
7. Targeted Prettier on the same nine files: **passed**. `git diff --check`: **passed**. Baseline lint errors are recorded separately, not hidden by the later diff-check exit code.
8. Visually inspected this run's 390×844 export drawer screenshot: Close, Export heading, formats and action are visible without horizontal clipping. Desktop 1280×800 screenshot has the persistent access controls and a visibly rendered nonblank shape. Automated geometry/nonblank checks also pass at 1280×800, 1024×768, 1023×768, 390×844, 320×568 and 667×320 with reduced motion and no download on export access.

Browser artifacts are sibling scratch `ui-fixes-independent-browser-results/` (12 viewport screenshots). Scratch probe is sibling `ui-fixes-independent-parent-probe.mjs`. This review does not claim a failure trace was generated on passing runs or that unmanaged contexts inherit fixture trace settings.

## Remaining gates and limitations

- Behavioral re-review of UI-A1/A2/A3 is complete; **JSX implementation lint remains open**. Apply bounded reviewed remediations above, explicitly include JSX in the gate, and rerun focused/browser behavior after any focus/notice refactor. Do not suppress rules to obtain green output.
- Parent owns root/full final tree lint, format, tests, build, workspace/embed/CLI/decode/export validation after concurrent Code ZIP completion. The repair worker's reported root 677 pass is not this review's independently rerun evidence and is not an exact-final-tree certificate.
- This is not a Code ZIP/engine/CI/release acceptance or deployment approval. No native browser encoder fidelity is inferred from injected notice state or deferred builder fixtures.
- Assistive technology/screen-reader announcements, Safari/iOS, physical touch and **actual 200% browser zoom are unavailable/unverified**. Chromium touch emulation, CSS viewport sizing and stable live-region DOM do not establish these manual criteria.
- This plan-directory report is an ignored local artifact; retain/share it intentionally. No force-add or publication was performed.
