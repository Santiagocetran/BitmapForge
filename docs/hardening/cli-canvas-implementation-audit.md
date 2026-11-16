# Independent CLI canvas implementation audit

## Verdict: ACCEPT — source + unit stage only

The bounded implementation satisfies `cli-canvas-plan-audit.md`. No material source/unit revision is required. **This does not accept complete CLI behavior, clear any artifact failure, authorize release, or authorize a browser execution attempt.** The actual-artifact gate remains mandatory; all fourteen historical failed outputs remain failed.

Reviewed `cli-canvas-implementation.md`, the accepted plan, actual source/tests, and retained evidence in sibling `../cli-canvas-evidence/`. Working tree: `gloin/release-hardening`, HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01`. HEAD is not the implementation baseline: accepted prerequisite changes were already dirty. Read repository governance and the web-product-development skill; the prescribed COLLAB records were not present. Palette and unrelated concurrent changes are excluded.

## Exact source boundary and preservation

Independently compared `../cli-canvas-evidence/harness.baseline.js` with current `packages/cli/src/harness.js` using `git diff --no-index`. The entire difference is **four added lines**, two in each capture loop:

- Immediately after `renderAtTime`, a block-local `const sourceCanvas = manager.getCanvas()`.
- Immediately afterward, an explicit `No preview canvas available` error for an absent canvas.

There are no removed lines or other changes relative to that incoming dirty baseline. Existing CLI prerequisite edits are preserved, rather than incorrectly attributed to this repair. No engine production diff is present. Scoped `git diff --check` returned no diagnostics.

Independently verified SHA-256 pins:

| File                                    | SHA-256                                                            |
| --------------------------------------- | ------------------------------------------------------------------ |
| Retained incoming `harness.baseline.js` | `0ae34f4cfbd1e46daa46452931361d163890a17cd72ee6494f35ac77b66cf247` |
| Current `harness.js`                    | `711f8a4ba7704f99a258f73ded496468ef58efdaa6456ad9adcfa9154c8f9671` |
| `harness.test.js`                       | `a0b5dafb5f84e6e6eaf1ce7c335788c9f724c28511d925394dd186d725f69a5f` |
| `harness-canvas-engine.test.js`         | `e810b1bc8ee0a8f1bbb03919716189d18ad4e8bec6caf9894f303d128a4307b4` |

### Capture, dimensions, timing and ownership

- APNG (`harness.js:44–50`) synchronously reacquires after **every** render, gets that canvas's context, and reads that canvas's backing dimensions. The outer availability check does not supply captured pixels. No await separates render/acquisition/read.
- WebM (`:140–143`) likewise reacquires after **every** render and passes that exact current canvas to `drawImage`. The original lookup remains sizing-only; the offscreen canvas/stream are not recreated. Width/height retain their pre-loop even rounding and every destination rectangle remains `(0, 0, width, height)`, including deliberate later-source size changes. Existing scaling is preserved, not replaced by border padding.
- Exact sample schedule, frame-count formula, rounded APNG delays, owned pixel-buffer copies, every-four-frame APNG yield, WebM frame waits, MIME selection, size setup, and 5000ms recorder timeout are byte-preserved.
- New lookup failures occur inside the existing cleanup owners. APNG resumes through its finally; WebM attempts recorder stop, clears timers/listeners, resumes and stops owned tracks; the public render path retains exactly-once disposal and existing error aggregation. Existing render/read/draw/recorder/cleanup failure regressions remain in the suite.

## Discriminating test evidence

### Mock capture regressions

`harness.test.js:185–305` uses distinct A/B/C objects, contexts and APNG pixel sentinels. Both formats cover first, later, combined and absent swaps at even/odd initial widths. Assertions verify exact per-frame object identity, rectangles, APNG sentinels/dimensions, ordered render/get/read-or-draw events, and all 21 timestamps over 2094ms. Combined swaps retire A on frame zero and B on a later frame; no stale owner can satisfy these checks. WebM's later C is deliberately wider while the expected output rectangle stays fixed. Missing/throwing current-canvas tests fail after a successful earlier frame and assert cleanup through the public render path.

### Real pending-renderer transition

`harness-canvas-engine.test.js` imports actual SceneManager, BitmapEffect, AnimationEngine and BitmapRenderer. Only WebGL and canvas/recording primitives are stubbed; getter, seek, render and swap methods are not replaced. Render/seek/swap/disposal spies call through. Each format gets a fresh real manager and synchronous cube, odd 17×13 size, and CLI setup order with fades disabled.

Before capture the test proves active A, distinct pending B and ongoing animation. The first actual `renderAtTime(0)` clears animation and swaps B: A is detached and its renderer disposed, pending is cleared, B is attached at the same dimensions. It then checks captured ownership, not merely the getter result. APNG reads B at 17×13; WebM draws B into fixed 18×14 output. Real manager disposal runs in teardown. This proves engine control flow and capture ownership, **not GPU pixels or encoded-artifact quality**.

### Retained baseline and mutation results

Read the actual retained logs, including individual failure messages, rather than accepting the handoff summary alone:

| Evidence                 | Result and discriminating failure                                                                                                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseline-final-red.log` | 22 failed / 35 passed. First-swap captures retain A instead of B; later/combined cases retain A instead of C. Both real-engine cases pass the transition assertions and fail specifically at `captured current B, not detached A`. |
| `first-only-red.log`     | 8 failed / 47 filtered skips. Both formats reject first-only refresh: later-only cases retain A instead of C, combined cases retain B instead of C.                                                                                |
| `candidate-final.log`    | Five files pass: 117 passed / 1 skipped.                                                                                                                                                                                           |

No-swap baseline failures are getter-order failures, not stale-pixel findings. Baseline missing/throwing cases fail because the stale lookup never observes the error. The retained initial `candidate-green.log` loading failure is not counted as success; the Node URL alias in the engine test fixes Vite's asset-URL rewrite without mocking engine behavior. Independently checked that the retained mutant bytes exactly equal the documented first-frame-only transformation of current candidate bytes. These counterexamples remain outside production. Red runs were inspected, not repeated in this audit.

### Independent fresh focused execution

Ran directly from `packages/cli`, using Node `v24.22.3`:

```sh
/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node ../../node_modules/vitest/vitest.mjs run src/__tests__/harness.test.js src/__tests__/harness-canvas-engine.test.js src/__tests__/cli.test.js src/__tests__/cli-cleanup.test.js src/__tests__/server.test.js --reporter=verbose
```

Actual result: **exit 0; five files passed; 117 passed / 1 skipped**, duration 8.04s. Both real-engine capture cases and all new mock cases passed. The skipped case is the existing real-browser APNG integration smoke; it supplies no artifact acceptance. The focused cleanup tests include benign test-owned subprocess containment, not application/browser cancellation acceptance.

## Protected artifact contracts and remaining gate

Ran `sha256sum -c ../cli-canvas-evidence/protected.sha256` before and after focused execution: all four protected files match their pre-edit pins:

- `cli-render.integration.test.js`
- `cli-stage2-evidence.js`
- `fixtures/shape-v2.bforge`
- `fixtures/model-v2.bitmapforge`

Read the protected ledger and validators and evaluated only the isolated ledger expression offline: exact P01–P10, fourteen outputs. Odd APNG 161×121 versus WebM 162×122, capture counts/schedule, APNG structural/decode reconciliation, WebM cadence/duration/codec contracts, meaningful-pixel thresholds, existential temporal-change condition, batch shape/model decoded-hash distinction, and existing execution/evidence containment budgets remain unchanged. Byte preservation is not a fresh pass of those contracts.

**Still required:** separately authorized CLI build and genuine P01–P10 execution against the repaired source, all fourteen decoded artifacts passing the unchanged contracts, and batch shape/model distinctness. Preserve previous failed evidence and record fresh outcomes separately. The source fix does not establish a common cause for every prior failure. Sampler repair is not needed for this source/unit acceptance; any later execution-route prerequisite remains a separately scoped matter.

This audit created only this document. It made no production/test edits and ran no root tests, palette tests, browser, build, install, diagnostic sampler or release action. No tool denial was retried or bypassed. The palette's post-change approval gate remains untouched.
