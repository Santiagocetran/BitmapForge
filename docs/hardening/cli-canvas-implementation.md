# CLI canvas implementation — source/test handoff

## Status and boundary

Implemented the independently accepted bounded plan in `cli-canvas-plan-audit.md` (delegation `deleg_6c868757`). **Not self-approved; independent implementation review remains required.** No browser, build, installation, sampler change, root test, or palette test was run. The palette approval-blocked action was not retried or bypassed.

Production delta against the exact incoming dirty harness is four added lines, exclusively inside the two capture loops: immediately after every render, synchronously obtain and validate the current canvas. APNG obtains its context and dimensions from that canvas; WebM draws that canvas into the unchanged pre-loop even-sized output rectangle. The initial availability checks remain. No priming render, scheduling, count, delay, pixel-copy, recording, timeout, cleanup, or disposal code was changed. Accepted incoming prerequisites and other owners' changes remain intact.

## Exact repository files

- Modified `packages/cli/src/harness.js`: capture-local reacquisition in APNG and WebM.
- Modified `packages/cli/src/__tests__/harness.test.js`: source override for retained counterexamples; distinct A/B/C canvas/context/pixel sentinels; first/later/combined/no-swap controls; 21 exact timestamps over 2094ms; ordered render/get/read-or-draw assertions; even/odd initial widths, fixed WebM scaling despite later source-size change; missing/throwing current canvas after a successful frame, resume/dispose/recorder/listener/timer/track cleanup.
- Added `packages/cli/src/__tests__/harness-canvas-engine.test.js`: file-local jsdom, actual SceneManager/BitmapEffect/AnimationEngine/BitmapRenderer, synchronous cube and CLI setup order, real pending renderer transition, call-through render/seek/swap/disposal spies, detached A versus attached B ownership, equal 17×13 backing size and fixed 18×14 WebM output. Only WebGL and canvas drawing/recording primitives are stubbed. This establishes engine control flow and capture ownership, **not GPU pixels**.
- Added this report.

## Retained actual execution

Evidence directory: `/home/agent/.hermes/profiles/gloin/cache/scratch/cli-canvas-evidence/` (outside production). Node binary: `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node`, actual version `v24.22.3`. All execution used direct terminal calls.

From `packages/cli`, the runner is the above Node binary followed by `../../node_modules/vitest/vitest.mjs run`.

| Evidence                 | Invocation suffix / result                                                                                                                                                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseline-red.log`       | `src/__tests__/harness.test.js src/__tests__/harness-canvas-engine.test.js --reporter=verbose`, `CLI_CANVAS_SOURCE` set to retained `harness.baseline.js`; exit 1, 22 failed / 35 passed. Executed before production edits.                                                                         |
| `baseline-final-red.log` | Same retained baseline and final formatted tests; exit 1, 22 failed / 35 passed.                                                                                                                                                                                                                    |
| `first-only-red.log`     | Source override `harness.first-only.js`; `src/__tests__/harness.test.js -t 'later swap\|both swap' --reporter=verbose`; exit 1, 8 failed / 47 filtered skips.                                                                                                                                       |
| `candidate-green.log`    | Initial candidate five-file run; exit 1, four suites passed, engine suite failed during file loading because Vite transformed a literal asset URL. Retained, not counted as green.                                                                                                                  |
| `candidate-final.log`    | `src/__tests__/harness.test.js src/__tests__/harness-canvas-engine.test.js src/__tests__/cli.test.js src/__tests__/cli-cleanup.test.js src/__tests__/server.test.js --reporter=verbose`; exit 0, five files passed, **117 passed / 1 skipped**. Existing browser integration smoke remains skipped. |
| `lint.log`               | From repository root, Node `node_modules/eslint/bin/eslint.js` with the three source/test paths above; exit 0, no diagnostics.                                                                                                                                                                      |
| `format.log`             | Changed source/tests and this report checked with installed Prettier; see retained terminal output.                                                                                                                                                                                                 |

The original first-swap assertions report A instead of B; later-swap assertions report A instead of C. The first-only mutant reports retained B instead of later C in combined cases. Both actual-engine baseline cases execute the real identity transition successfully, then fail specifically at `captured current B, not detached A`. No nonzero exit alone is being treated as defect proof. No-swap baseline cases additionally fail the new per-frame getter-order contract, not pixel identity. Existing 35 harness tests pass against the baseline and candidate.

The engine file-loading issue was repaired with the Node URL constructor alias, avoiding Vite's literal `new URL` asset rewrite; the real engine methods were not replaced. `make-mutant.mjs` generates the external first-frame-only mutation from candidate bytes and checks exactly two capture-local lookups. Neither retained counterexample is a production implementation.

## Preservation and source pins

`protected.sha256` was recorded before edits and successfully checked afterward for `cli-render.integration.test.js`, `cli-stage2-evidence.js`, `shape-v2.bforge`, and `model-v2.bitmapforge`. All four are unchanged. The baseline-to-candidate diff was read back and contains only the four added capture-local lines. Scoped `git diff --check` produced no diagnostics.

SHA-256:

- Retained incoming `harness.baseline.js`: `0ae34f4cfbd1e46daa46452931361d163890a17cd72ee6494f35ac77b66cf247`
- Candidate `harness.js`: `711f8a4ba7704f99a258f73ded496468ef58efdaa6456ad9adcfa9154c8f9671`
- `harness.test.js`: `a0b5dafb5f84e6e6eaf1ce7c335788c9f724c28511d925394dd186d725f69a5f`
- `harness-canvas-engine.test.js`: `e810b1bc8ee0a8f1bbb03919716189d18ad4e8bec6caf9894f303d128a4307b4`

## Unexecuted actual-artifact gate

**All fourteen retained real-artifact failures remain failures.** This work neither reclassifies them nor proves one common cause. P01–P10 regeneration and unchanged decoded-artifact contracts, batch shape/model distinctness, CLI build and real browser execution remain unexecuted under this handoff. All original thresholds, count/time/dimension/codec contracts, capacity and containment budgets remain unchanged. Real artifact acceptance requires separately authorized genuine execution after independent review; unit success is not that acceptance. Sampler expansion was neither needed nor authorized for this source unit and was not performed.
