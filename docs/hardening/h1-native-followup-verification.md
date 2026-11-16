# H1 native supplemental follow-up verification

## Outcome

**14 passed / 2 failed: Chromium 7/8 and Firefox 7/8. Full native H1 acceptance remains blocked.** Both corrected history cases now pass in both engines, including their third asserted-active pickup and final saved-color equality. Active-pointer evidence fails at different, concrete phases described below. No whole-hardening clearance is implied.

Executed the bounded correction accepted by `h1-native-followup-plan-audit.md` (delegated acceptance `deleg_73b89e53`). This is a separately named external supplemental spec and run, not a frozen-suite rerun or an overwrite of the original 5-pass/3-fail-per-engine evidence. Browser lane is released after strict cleanup.

## Targets, preservation and execution

All abbreviated paths are relative to `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- New external spec/config: `h1-native-followup-verification/{native-followup.spec.mjs,config.mjs}`; exact change is `adaptation.diff` beside them.
- Collector: `h1-verify-native-followup.py`.
- New run (`RUN`): `bitmapforge-hardening-qa/runs/h1-native-followup-20261115-a01`.
- Original spec remains `h1-native-verification/native.spec.mjs`; original run remains `bitmapforge-hardening-qa/runs/h1-native-20261115T180652Z`.
- Immutable served target: `h1-integrated-20261115T180652Z/immutable-candidate/dist`.

The collector compared every build path, length and SHA256 with the original native `identity.json` **before launch**, then checked equality after each engine. All **35 build files** match. Entry JS remains `assets/index-BKDpitmq.js`, SHA256 `1c87a5aadc0783240035492a1201ecf74e23fd21e5f8c186872ffdf8581ae997`. Existing supervisor evidence also retains served-byte identity checks. The frozen QA harness digest remains `4963e730deebf362202696610f6d3e38ec85af89a5f1730929f0d1fa0d5bbe42` before and after execution.

`preservation-before.json` beside the new spec pins original spec/config, original native evidence, and repository `src`/`packages` files excluding node_modules. Final verification rehashed all **352 pinned files**, with zero mismatches. The original six failed native traces and their reports remain untouched. No application source, build, dependency, frozen helper, frozen 33-case suite, threshold, policy flag or timing budget changed. No install, build, commit, push or deployment occurred.

Pinned Node: `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node` (the existing Node24 toolchain); the collector prepends its sibling `node_modules/.bin`. It invokes the repository's locked `node_modules/@playwright/test/cli.js`. Chromium uses `tooling-b-browser-execution/chromium-cache`; Firefox uses `bitmapforge-hardening-qa/browsers/pw-1.59.1`. Exact argv and environment are in `RUN/{chromium,firefox}-launch.json`.

Chromium then Firefox ran serially, one worker, one result per case, retry0, **90-second test / 5-second expectation / 10-second action / 15-second navigation / 30-second launch bounds**, original browser arguments, DPR1 and original desktop/narrow geometries. Trace ownership remains the runner's `retain-on-failure`. Only `H1.pointer-active.D` uses the accepted case-local `hasTouch: true` override; no unmanaged context was introduced. Both discovery and actual reports contain all eight matching case IDs. Both browser runner exits are 1; collector exit0 means collection and cleanup completed, not acceptance.

## Exact reconciliation

| Case                  | Original Chromium | Follow-up Chromium | Original Firefox | Follow-up Firefox |
| --------------------- | ----------------- | ------------------ | ---------------- | ----------------- |
| H1.history-Enter.D    | fail              | pass               | fail             | pass              |
| H1.history-Space.D    | fail              | pass               | fail             | pass              |
| H1.pointer-pending.D  | pass              | pass               | pass             | pass              |
| H1.pointer-active.D   | fail              | fail               | fail             | fail              |
| H1.drop-keyboard.D    | pass              | pass               | pass             | pass              |
| H1.drop-pointer.D     | pass              | pass               | pass             | pass              |
| H1.escape-fresh.N     | pass              | pass               | pass             | pass              |
| H1.escape-task-hide.N | pass              | pass               | pass             | pass              |

The exact 16 engine/case pairs are reconciled programmatically in `RUN/final-verification.json`: ten pass→pass, four fail→pass, two fail→fail. The two surviving failures have new failure phases; equal outcomes do not mean unchanged behavior.

### Newly reached history assertions

Both Enter and Space cases in both engines complete these assertions:

1. Load the cube; establish duplicate-containing palette order, expanded Browse palettes and populated `Retained native draft`; retain palette root, task panel and canvas handles.
2. First asserted-active keyboard pickup, ArrowRight, Escape; unpressed handle, exact baseline order and handle focus across both existing frame checkpoints.
3. Second asserted-active pickup and ArrowRight; genuine mouse click on selected Look supplies the parent pointerdown boundary. Assert unpressed handle, unchanged exact order, Look selected and Look rail focus across both checkpoints.
4. Native Motion Enter/Space after that retirement, visible Motion heading and stable Motion rail focus; ArrowRight does not move that focus. Native Look Enter/Space restores Look, unpressed handle and unchanged order, with stable Look rail focus.
5. **Third pickup explicitly asserts `aria-pressed=true`**, followed by genuine Collapse settings / Expand settings clicks. Focus stays on the collapse/expand control across both checkpoints after each click. Final handle is unpressed and order unchanged.
6. Draft value and Browse expanded state are retained. The retained palette root equals the current DOM root; retained task panel and canvas remain connected. Screenshot and genuine Save .bitmapforge download complete; saved `settings.colors` equal the duplicate baseline case-insensitively.

These are literal root equality, panel/canvas connection, draft value, expanded state and saved-color assertions—not complete settings equality, direct controller-instance identity, or draft-input DOM identity. All four genuine downloaded settings files and parsed settings JSON are retained.

The five unchanged passing contracts per engine retain pending-pointer cancellation plus later movement/up and fresh keyboard usability, spatial keyboard/pointer reorder and moved-item focus, and narrow fresh/history-dependent first-Escape cancellation with retained Settings followed by second-Escape dismissal. No previously passing assertion was removed to obtain the history result.

## Concrete successor failures

### Chromium active pointer: retirement-order observation fails

`native-followup.spec.mjs:43:58` fails `expect(retired).toBeGreaterThan(down)`: `down=0`, `retired=-1`. The held mouse drag first reaches its required pressed assertion. One real `touchscreen.tap()` then delivers a trusted touch pointer (ID2) to Motion without releasing the original mouse or issuing a keyboard termination.

Read-only passive listeners record document-capture and target phases for pointerdown, pointerup and click. All six records target Motion and are trusted; every record still reads the retained old handle's `aria-pressed` as `true`. Timestamp is `1785.4000000953674` for these protocol-delivered events; array order, not distinct timestamps, establishes observation order. The target listener is after React's ancestor capture, not an incorrectly presumed post-barrier document-capture probe. No observer prevents default, stops propagation, cancels a sensor or changes application state.

**A trusted native click does reach Motion.** The failure screenshot and runner page snapshot show Motion selected, focused and visible. Thus this is not unsupported touchscreen input or proof that the native click was swallowed. However, the required old-handle-unpressed observation before click is absent, so the retirement-order contract remains failed. DOM `aria-pressed` is not direct sensor-listener instrumentation: this evidence alone cannot distinguish a delayed React DOM commit from a failure of internal synchronous retirement. No production fix is justified solely by that inference.

The subsequent formal Motion selection/heading, old-handle-unpressed and two-frame focus assertions are unreached, as are held-mouse beyond-threshold movement/up, no-resurrection check, Look return/exact colors, fresh keyboard pickup/Escape and its screenshot. The retained failure snapshot is diagnostic evidence, not a substitute pass for those assertions. The test is not weakened or rerun.

### Firefox active pointer: held-mouse pickup fails before touch

`native-followup.spec.mjs:29:100` fails the original `aria-pressed=true` assertion after primary mouse down and the unchanged 15-pixel/three-step movement in the scoped touch-capable context. The attribute remains absent throughout the original 5-second expectation bound. No touchscreen tap or event-order observer is reached.

This is a concrete cross-pointer setup blocker in this execution, not a demonstrated unsupported `touchscreen.tap()` API: that API was never called. No fake DOM event, mouse-up-then-click fallback, extra movement, input override, timeout increase or retry was used. Touch delivery/retirement/click/focus, later held-mouse movement/release, unchanged colors and fresh keyboard usability remain unreached for this case. Ordinary pointer drop still passes in its unchanged non-touch context; it does not clear this scoped setup failure.

The next bounded investigation must address these exact phases separately: Chromium's DOM observation versus synchronous retirement evidence, and Firefox's failure to arm the original held-mouse drag with case-local touch support. Do not reopen application code based only on the old mixed-input sequence, silently weaken the order assertion, or call either case accepted.

## Evidence and cleanup

`RUN/results-summary.json` preserves literal actual case errors, locations and retry values. Each engine's `final/smoke/ENGINE/a01/` holds the runner JSON/HTML reports, diagnostics, screenshots, downloads, server records and failed-test attachments. `H1.pointer-active.D.json` contains Chromium's actual event-order records, including a failure-safe final readback; Firefox has none because setup failed first.

- **24 physical PNG files**, including report/runner copies; not 24 unique acceptance states.
- **Two retained failure trace ZIPs**, both CRC-verified; zero passing traces under unchanged retain-on-failure policy.
- **Four real .bitmapforge downloads**, one per history key per engine, and four parsed saved-settings diagnostics.
- Actual separate stdout/stderr logs for both engines. Both saved stderr files contain **zero bytes**; runner failure details are in stdout/reports, not invented stderr.
- `identity.json`, launch/discovery records, per-engine process JSONL, server-check and completion records, plus `final-verification.json` retain provenance and cleanup.

Both server records pass the existing strict `serverExitClean` predicate: actual exit and close, code0/null signal, completed close, no close error/timeout. Both short owned temporary directories are removed. Final direct `/proc` readback at `2026-11-15T18:49:28.287992+00:00` checks **55 distinct retained PID/startTicks identities**, including process states rather than treating inaccessible executables as absence: none remain. Ports5291/5292/5293 have no listeners. Earlier state06/inode0 records were TCP TIME_WAIT, not listeners. No emergency cleanup occurred. **Browser lane released.**

## Repository gates and scope boundary

The new report is formatted with the installed repository formatter. Root `format:check` **PASS (exit0)** and `git diff --check` **PASS (exit0)** are retained separately in RUN with literal argv in `gates.json`; these are documentation/whitespace gates, not browser acceptance. The only repository file created by this task is this report. All executable changes are the separately named external spec/config/collector and their new evidence.

The accepted source/unit work, frozen Q3 pass and frozen 33-case results are unchanged and are not rerun or reclassified here. The two active-pointer failures, unrelated frozen failures, WebKit prerequisites and manual/platform/lifecycle gaps remain separate unresolved gates. **No full native H1 or whole-hardening clearance.**
