# H2 Help/notice isolation — source implementation handoff

## Scope and outcome

Implemented the independently accepted H2 wrapper-only repair on `gloin/release-hardening`, base `550842cab61002c7cc6563e50b9fcdeb17c9bf01`. Independent plan acceptance is in `editor-hardening-repair-plan-audit.md`; this document is implementation evidence, **not implementation acceptance or built/browser clearance**.

The entire production diff is:

```diff
-    <div className="bf-notice">
+    <div className="bf-notice" hidden={suspended} inert={suspended}>
```

Existing `helpOpen` → `suspended` wiring now hides the retained wrapper from layout/accessibility and marks it inert only during Help. Nothing changes subscription suspension, microtask cancellation, deferred functional-updater guarding, coalescing, priority, live attributes, Dismiss action or latest-message semantics. Layout's persistent portal host and host moves remain untouched. There are no H1 production changes, UI redesign, CLI/harness/config/manifest/dependency edits, builds, installations, browsers, servers or publication in this unit.

## Actual source cause

`StatusNotice.jsx:8–44` suspends delivery but deliberately retains `display`. Previously its render exposed that retained status/error/Dismiss with no presentation isolation. `Layout.jsx:565` already supplies Help state as `suspended`; `Layout.jsx:228–235` moves the persistent notice host to Settings or Preview. `App.jsx:18–20,34–42` opens a sibling real modal and restores through the current bridge.

Read the installed dependency source, not just a modal-isolation assumption: `@radix-ui/react-dialog/dist/index.mjs:135–138` invokes `hideOthers(content)`. `aria-hidden/dist/es2015/index.js:124–134` explicitly adds **all `[aria-live]`** to the keep set. Consequently the polite live notice and its ancestor path are not guaranteed isolated by Radix's sibling hiding. This is a presentation-isolation gap, not evidence of a broken store, lost host or screen-reader announcement. Application-owned native hidden/inert on the existing wrapper covers both role owners and Dismiss without changing the dependency.

## Tests and causal red proof

Owned source/test files:

- `src/app/components/ui/StatusNotice.jsx` — one wrapper line only.
- `src/app/components/ui/StatusNotice.test.jsx` — two new populated success/error regressions; native wrapper attributes, default role absence, hidden-role identity, retained status/alert/Dismiss/text, no new subscriptions while suspended, wrapper-only attribute mutations, unchanged live attributes and newest-only resume. Existing queued-job, initial/resume/unmount, delivered-but-uncommitted, StrictMode, progress/priority and equal-presentation tests retained. Suspended retention queries use Testing Library `{ hidden: true }`, not Playwright's `includeHidden`.
- `src/app/components/Layout/Layout.test.jsx` — strengthens the existing stable-host regression with default-role absence and native hidden/inert checks; all prior controller/bridge tests retained.
- New `src/app/components/Layout/Layout.hardening.test.jsx` — eight real Layout + ColorPalette/dnd + StatusNotice + ShortcutsModal cases: desktop/Settings × populated success/error × normal/StrictMode. App-equivalent bridge/open/close wiring; only engine/export work and unsupported canvas drawing/media/resize facilities mocked. Captures actual notice role owner separately from dnd live regions. Checks retained identities/text, absent accessible notice roles/button, Help Close focus, multiple hidden updates without text/child mutations, exact newest status/error after dismissal, current persistent host, restored invoker, genuinely new Help DOM on reopen, Escape dismissal, and return from Settings to Preview. Native Tab/inert behavior remains a browser gate.

Evidence directory (outside repo):
`/home/agent/.hermes/profiles/gloin/cache/scratch/editor-h2-evidence/`.

Before the production fix, executed `baseline-red.log`: StatusNotice and Layout regressions failed on missing isolation. Its initial integration fixture had an unrelated `ctx.save` jsdom drawing-mock failure, **not H2 red evidence**. After supplying a drawing-only mock, `integration-baseline-red.log` reproduced all four then-combined integration cases on `wrapper.hidden === false`, after populated retained content, real modal opening and Close focus assertions had passed.

Retained the initial production-free red proof, then additionally reran **final test bytes** against original app bytes: `final-tests-baseline-red.log`, exit 1, **16 failed / 38 passed**, three files. All eight final real-modal cases failed at absent wrapper hiding, and both new unit cases also failed at absent hiding after retained content/identity assertions. Other failures were deliberate new role-absence assertions in existing suspension tests. `git diff --exit-code HEAD` for StatusNotice, Layout, ColorPalette, App and ShortcutsModal returned 0 immediately before this final baseline run. Baseline StatusNotice SHA-256: `f8b52bab594f3f70cbb09450b04bc0492e0735a29ebef9d1f0005fe676925a22`.

Intermediate green attempts are retained, not hidden: `components-green-attempt.log` and `integration-green-attempt2.log` / `integration-green-attempt3.log` exposed excessive synchronous role-query/combined-case cost and 5-second test timeouts. Reproduced with one worker; split success/error cases and scoped button queries to their actual headers/toolbar and notice queries to the captured wrapper, and removed redundant desktop resize setup already covered by Settings cases. No timeout increase, weakened boundary mocking or production workaround. `integration-green-attempt4.log` passed; final suites below include the exact-message strengthening and final test bytes.

## Executed final gates

Paired runtime: `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`, **v24.22.3**. Commands use installed tools directly; no package acquisition. All commands run from the repository root. `NODE24` below abbreviates that exact executable.

| Gate                                               | Command after `NODE24`                                                                                                                                                                                                                                                                                             | Actual result                      | Log                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ---------------------- |
| Full affected components plus palette preservation | `node_modules/vitest/vitest.mjs run src/app/components/ui/StatusNotice.test.jsx src/app/components/Layout/Layout.hardening.test.jsx src/app/components/Layout/Layout.test.jsx src/app/components/ColorPalette/ColorPalette.test.jsx src/app/components/ColorPalette/ColorPalette.redesign.test.jsx --maxWorkers=1` | Exit 0; 5 files, 91 tests passed   | `components-final.log` |
| Root source/integration tests                      | `node_modules/vitest/vitest.mjs run --maxWorkers=1`                                                                                                                                                                                                                                                                | Exit 0; 62 files, 863 tests passed | `root-tests.log`       |
| Root lint                                          | `node_modules/eslint/bin/eslint.js .`                                                                                                                                                                                                                                                                              | Exit 0                             | `root-lint-final.log`  |
| Explicit owned JSX lint                            | `node_modules/eslint/bin/eslint.js --ext .js,.jsx src/app/components/ui/StatusNotice.jsx src/app/components/ui/StatusNotice.test.jsx src/app/components/Layout/Layout.test.jsx src/app/components/Layout/Layout.hardening.test.jsx`                                                                                | Exit 0                             | `owned-lint.log`       |
| Owned source/test format                           | `node_modules/prettier/bin/prettier.cjs --check` followed by the four files above                                                                                                                                                                                                                                  | Exit 0                             | `owned-format.log`     |
| Diff whitespace                                    | `git diff --check` (without Node prefix)                                                                                                                                                                                                                                                                           | Exit 0                             | tool execution output  |

Root Vitest inclusion is `src/**/*.test.{js,jsx}` and `test/integration/**/*.test.{js,jsx}` in `vite.config.js`; it does not run workspace CLI/embed suites, export-specific config or Playwright. No broad workspace/browser/build acceptance is inferred.

## Frozen source/evidence identities (SHA-256)

| Target                                                                           | SHA-256                                                            |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/app/components/ui/StatusNotice.jsx`                                         | `1d0373604e8c1141aab74e6dd523ba628897310715e5c9e72b7c6877cdcce074` |
| `src/app/components/ui/StatusNotice.test.jsx`                                    | `ed74c193f7f4e1a7e312047ce41dcf85c76c092af2263f84ce1fb8a0a0c7d7d4` |
| `src/app/components/Layout/Layout.test.jsx`                                      | `d3b72115dc1f0018e24daf8c7675ef90939d2bc09c388f36570e11555f482ce3` |
| `src/app/components/Layout/Layout.hardening.test.jsx`                            | `136b6717ccf7c0238643a4a103ad734ea7ccb80dc5ac690823c3e6f46d133802` |
| `h2-owned.patch` (tracked diffs plus new integration file; excludes this report) | `07a10c8d5df795533d4b7f16f133e9e9e5464b4d63c5ee5cf14ae99b4d3c8970` |
| `final-tests-baseline-red.log`                                                   | `7093abea2b8f0e483ec19ab1f629a37a57b18d55d61f5063df8e195284415c72` |
| `root-tests.log`                                                                 | `480d7c46dfae5e4263b51122200252350644db6b05c223dda5e05ed872fbcba0` |
| `components-final.log`                                                           | `8468b010912dff211283c5b094780907f27ac56cb6582f6378420f198b384d3d` |

New integration/report files are untracked alongside other owners' untracked hardening documents: preserve them explicitly in the independent review artifact. The patch includes the new integration file that ordinary `git diff` omits. Separate artifact manifest records this report hash after formatting.

## Remaining independent acceptance gates

1. Independent exact-diff implementation audit including final baseline-red evidence and new/untracked files. No author acceptance verdict is supplied here.
2. After explicit serial-browser lane handoff: strengthen/run accepted source H2 coverage in `test/e2e/ui-foundations.spec.js` for direct desktop and Settings Help, populated success/error, native hidden/inert role and Tab/focus isolation, retained notice identity through resize/host moves, current-only delivery and genuinely new Help lifetime/reopen focus across frames. No e2e file was edited in this non-browser unit. Existing palette/source suites remain required preservation gates; H1 diagnosis/repair is separate and unimplemented.
3. Fresh immutable matching built artifact and accepted revised external Q5 baseline/final Chromium/Firefox runs, including exact real producer strings `Project saved as .bitmapforge file.` / `Project loaded.`, failure-safe observers and source/build identity. Source-store sentinels above prove timing, not save/load producers. Original a02 outcomes remain failures, not retroactively green. No fresh build was made while tooling owns the lane.
4. Manual desktop AT: populated success/error before Help; browse/read and attempt navigation while Help is open; check buffered speech and current-only delivery after close, Dismiss, repeated open/close and keyboard focus. Record actual OS/browser/AT versions and results. Automated role absence is not live announcement or virtual-cursor proof.
5. Physical Safari/mobile/touch, real browser-menu zoom and the existing WebKit environment blocker remain unverified. Sparse Shape/Text quality and strict IDREF policy findings remain separate; nothing here clears them.
