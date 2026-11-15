# H1 active-pointer Chromium verification

## Outcome

**PASS — Chromium `H1.pointer-active.D`, executed once, retry0.** The separately named external spec applies only the observer correction independently accepted in `h1-active-pointer-disposition.md`. Runner exit0: one test passed (5.5 seconds; runner 8.7 seconds).

Combined native coverage is **15 accepted / 1 blocked**: the unchanged prior **14 passes** plus this one actual new Chromium pass. Chromium is now 8/8 across retained and new evidence; Firefox remains 7/8 with active-pointer **BLOCKED**, its earlier pickup failure preserved. **This is not 16 newly executed tests.** Firefox was not launched, diagnosed anew, or given an invented workaround. No full native H1, whole-hardening or whole-release claim follows.

## Exact scope and execution

Paths below are relative to `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- External spec: `h1-active-pointer-chromium-verification/active-pointer-chromium.spec.mjs`.
- External config and exact old-to-new spec patch: `h1-active-pointer-chromium-verification/{config.mjs,adaptation.diff}`.
- Collector: `h1-verify-active-pointer-chromium.py`; offline final verifier: `finalize-h1-chromium.py`.
- New run (`RUN`): `bitmapforge-hardening-qa/runs/h1-active-pointer-chromium-20261115-a01`.
- Immutable target: `h1-integrated-20261115T180652Z/immutable-candidate/dist`.
- Prior accepted results and failed follow-up traces: `bitmapforge-hardening-qa/runs/h1-native-followup-20261115-a01`.
- Original failures: `bitmapforge-hardening-qa/runs/h1-native-20261115T180652Z`.

Discovery and actual runner JSON each contain exactly one selected case, `H1.pointer-active.D`, Chromium. The copied external spec retains unrelated cases but the config selects only this exact case suffix. Existing Node24 executable `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node` reports v24.22.3; its sibling `node_modules/.bin` is prepended to PATH. The locked repository Playwright CLI and existing `tooling-b-browser-execution/chromium-cache` are reused. Literal command/environment are in `RUN/chromium-launch.json`.

Unchanged bounds: **90-second test, retry0, one worker**, 5-second expectation, 10-second action, 15-second navigation and 30-second launch. Original browser arguments, DPR1, 1280×800 viewport, runner-owned context, case-local `hasTouch:true`, and `retain-on-failure` tracing remain intact. No install, build, application/dependency change, frozen harness change, policy relaxation, synthetic input or delayed-tail wait occurred.

All **35 immutable build files** match the original native identity by path, length and SHA256 before and after the run. Entry JS remains `assets/index-BKDpitmq.js`, SHA256 `1c87a5aadc0783240035492a1201ecf74e23fd21e5f8c186872ffdf8581ae997`. Frozen harness digest remains `4963e730deebf362202696610f6d3e38ec85af89a5f1730929f0d1fa0d5bbe42`.

## Assertions actually reached

1. Original primary mouse down and 15-pixel/three-step movement establish an explicitly asserted active drag. A passive observation records trusted mouse pointer ID1, buttons1.
2. With that mouse still held, one native touchscreen tap targets Motion. No mouse release, keyboard termination, retry or focus repair precedes it. Passive document-capture and target observations record trusted touch pointer ID2. Assertions require distinct mouse/touch IDs, ordered document pointerdown → target pointerdown → target click, and matching touch pointer IDs through the target click.
3. Document pointerdown observes the old handle pressed and connected. At target pointerdown in this actual run it is already disconnected, still pressed. The trusted native click reaches Motion's target. This proves that click was not consumed by the old unconditional document-capture stopper; the accepted source analysis supplies synchronous retirement causality, not direct timing instrumentation of `removeAll()`.
4. Motion is selected and its heading visible after the first tap. A **current hidden-inclusive handle locator inside the retained palette region**, not the retired ElementHandle, is unique and unpressed. Diagnostic readback: old connected=false, pressed=true; current connected=true, sameAsOld=false, pressed=null. Retained palette-root equality and task-panel connection assertions pass. Motion retains actual focus across both original frame checkpoints.
5. Original held-mouse movement beyond threshold and release do not resurrect the drag or change Motion selection. A genuine Look click returns to the panel, preserves Look focus across both checkpoints, restores a visible current handle, and verifies exact original palette colors plus unpressed state.
6. A fresh keyboard pickup explicitly becomes active; Escape and both stable handle-focus checkpoints complete. The original final screenshot is saved. Runtime/transport errors are empty.

The corrected assertion distinguishes a retired keyed descendant from the current live state. It does not require a React-rendered attribute update during target pointerdown, and does not weaken the source requirement for synchronous native resource retirement. Ordinary-drop suppression is unchanged and retains its prior accepted result; it was not rerun here.

## Preservation, artifacts and cleanup

`preservation-before.json` pins **500 files** across both original external specs/configs, both prior runs and repository source/package files (excluding node_modules). Final rehash finds zero mismatches. All **eight earlier failure trace ZIPs** are preserved and CRC-verified. Old failing assertions remain literal historical failures, not retroactive passes.

Fresh evidence under `RUN/final/smoke/chromium/a01/` includes runner JSON/HTML reports, `diagnostics/H1.pointer-active.D.json`, screenshot `screenshots/H1.pointer-active.D-pointer-retired.png`, ledger and server records. The screenshot SHA256 is `602cf0151f72bdf4fb6b44ca91bd39d325735186ac67896f8d43605824520354`. This passing attempt has **zero retained trace ZIPs** under the unchanged retain-on-failure policy. Stdout/stderr, discovery, process sampling, identity, server predicate and completion files remain in RUN.

Strict server cleanup passes: actual exit and close, code0/null signal, closeCompleted=true, no close error. At `2026-11-15T19:01:54.883220+00:00`, direct `/proc` readback of **12 retained PID/startTicks identities** finds none remaining, including an explicit state check rather than discarding exe-less zombies. Ports5291/5292/5293 have no listeners. The owned short temporary directory is removed; no emergency cleanup occurred. **Browser lane released.**

`RUN/final-verification.json` reconciles the exact prior 14 accepted engine/case keys with the one new result, preserves the Firefox blocked disposition, records build count, preservation checks, trace CRC checks, cleanup and executable hashes.

| New artifact     | SHA256                                                             |
| ---------------- | ------------------------------------------------------------------ |
| External spec    | `8cb7eb24177b9bffa0c276e5ecb3c9d41770be82b4f4abe6bd6b8398bb7d37e4` |
| Exact spec patch | `03434421597ced2066f5bbd250025164e26f4a9bb1c229658b68e475c98b4210` |
| External config  | `35dc095ad2372f12311bed164c8da451cdfdb9a161c8b7e9bd5c0d2dae83e02d` |
| Collector        | `98d16314e246e6dec8e29dac2d0c61cf07878577e0f754c6e142bf82e909d02d` |

## Repository gates and remaining boundary

This report is the only repository file created by this task. It is formatted with the installed formatter; root `format:check` **PASS (exit0)** and `git diff --check` **PASS (exit0)** results are retained separately in `RUN/gates.json` and associated logs. These documentation gates do not extend browser acceptance.

Firefox's active-pointer pickup remains blocked with cause unknown and no accepted input workaround. Frozen-suite failures, WebKit prerequisites, manual/platform/lifecycle gaps and other release gates are unchanged. No commit, push or deployment occurred.
