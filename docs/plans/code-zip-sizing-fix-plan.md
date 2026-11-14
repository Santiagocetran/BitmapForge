# Code ZIP generated runtime sizing — bounded repair plan

Status: **confirmed defect; pending independent plan audit and explicit implementation delegation. No application template edited by export verification worker.**

## Evidence and cause

Source checkout: branch `gloin/ui-output-improvements`, baseline `298bdec`, shared in-progress tree (not an immutable committed revision). `src/app/utils/codeExport.js:28–38` generates a manager and starts model fetch, but never calls `manager.setSize` and installs no resize handler. Generated `index.html` already gives `#app` 100vw × 100vh; CSS alone does not initialize the engine.

`SceneManager` creates a camera with aspect 1 and constructs the effect without initial sizing. `BaseEffect` starts with width/height 1. `SceneManager.setSize` updates camera aspect/projection and the effect. App PreviewCanvas explicitly sizes immediately and observes container resizing; generated Code ZIP omits both responsibilities.

Final isolated real-export run: **5 passed, 1 failed (4.5m)**. Code ZIP extracted runtime has a **300×150** canvas, **9** non-background pixels, **2** colors, non-background ratio **0.0002**, entropy **0.002746052628263047**. Runtime errors, failed HTTP responses, and console logs are all empty. Test retains this as an ordinary failure, not skipped/expected-failure.

A separate diagnostic on the preceding freshly generated artifact intercepted `animation.js` only to expose the existing manager, then explicitly called `manager.setSize(app.clientWidth, app.clientHeight)`: output became **1280×800**, **137421** non-background pixels, ratio **0.1342001953125**, entropy **0.9636548793635019**, with no page errors. This is causal diagnostic evidence, **not** a fixed export or passing acceptance test. Downloaded ZIPs/animation source were not repaired. The test's import map only resolves local installed Three.js dependencies; it does not size, transform, or expose the manager.

Final evidence directory (outside served root): `/home/agent/.hermes/profiles/gloin/cache/scratch/export-recovery-reviewed/`, especially `code-export.zip`, `code-export/BitmapForge-export/animation.js`, `code-runtime.json`, `screenshots/code-export-canvas.png`, its metrics JSON, and `report/index.html`.

## Allowed implementation surface

- `src/app/utils/codeExport.js`: only generated animation runtime sizing/lifetime code.
- `src/app/utils/codeExport.test.js`: generated-runtime regression tests.
- Code ZIP section of `test/e2e/export.visual.spec.js`: initial/resize dimension assertions and lifecycle regression evidence.
- Update this plan with audited dispositions/observed results.

Do not change SceneManager defaults, application PreviewCanvas, other component templates, export configuration, animation semantics, dependencies, CI workflows/config, or visual thresholds. React/Web Component sizing parity and general generated-runtime configuration parity are separate audits. Do not treat their untested behavior as cleared.

## Minimum runtime contract

1. After constructing the manager and before starting the existing model fetch, synchronously measure `container.clientWidth/clientHeight` and call `manager.setSize` for finite, positive dimensions. Floor to positive integer CSS pixels consistently. Do not pass zero/NaN/Infinity and do not substitute a hardcoded viewport size.
2. Observe **the container** with one ResizeObserver. Use the same measurement/sizing function for initial and observer-driven sizing; this standalone scaffold has no padding/border. Do not observe or derive dimensions from the canvas (feedback loop risk).
3. Ignore zero-sized/hidden states without overwriting the last valid dimensions. When the container becomes visible, the observer must size it correctly. Cache the last applied width/height and skip unchanged integer pairs to avoid resetting effect particles on duplicate notifications. A queued callback must no-op after disposal.
4. Own one idempotent disposal function and one pagehide listener. On non-persisted pagehide, mark disposed, disconnect observer, remove the listener, and dispose the manager exactly once. On persisted pagehide, leave observer/manager intact for BFCache restoration; subsequent sizing must remain functional. This is a standalone page lifetime, not an embeddable mount/unmount API. Do not dispose merely on visibilitychange or introduce an unload/beforeunload handler that disables BFCache.
5. Keep existing model loading unchanged. The currently bundled manager already rejects publication after disposal; test that teardown during pending load does not re-size/recreate the runtime. Any unrelated fetch/model-name/error-handling defect found during implementation must be reported separately rather than silently widening this repair.

## Required regressions

### Generated-module behavior (unit)

Build/extract the actual ZIP's `animation.js`, evaluate that generated body with mocked imported SceneManager/config and browser objects (a controlled import-removal harness is acceptable); assert behavior, not only substring presence:

- Exactly one manager, one observer, immediate setSize(640,480), then existing fetch/load chain.
- Container-only resize to 800×360 updates setSize without window resize; repeated equivalent integer size does not call it again.
- Initial hidden 0×0 skips sizing; later positive dimensions size successfully. Valid → zero → restored size preserves/reapplies appropriately without invalid calls.
- Non-finite dimensions do not call setSize.
- Non-persisted pagehide disconnects observer/removes owned handler/disposes once; repeated teardown and deliberately invoked stale observer callbacks do nothing.
- Persisted pagehide does not dispose; observer-driven size changes afterward still work, followed by ordinary teardown.
- Teardown while model fetch is pending does not reinstall observer/manager or perform late sizing; document any engine-owned load cancellation behavior rather than inventing template ownership.

### Real downloaded artifact (browser)

Use the cube fixture and keep original generated JavaScript unmodified. Import-map dependency resolution is allowed, test-only manager.setSize/pose/scale injection is not.

- At 1280×800 DPR1: assert container and canvas CSS dimensions plus backing dimensions match the manager/effect sizing contract, not browser defaults; `isBlank` must be false (existing minimum 1% occupancy and 5 colors), plus meaningful geometry screenshot.
- Resize viewport to a second aspect ratio (e.g. 900×600); poll dimensions, then check nonblank geometry/no page errors or failed requests.
- Change only container CSS dimensions to 640×360 (no viewport resize), and verify resize, no overflow feedback loop, and meaningful geometry. This is a **test of responsiveness**, not a substitute for initial sizing.
- Hide/reveal container, then verify recovery without invalid canvas dimensions or errors.
- Retain actual ZIP, screenshots, metrics, diagnostics on failure. Instrument managed or manual Playwright contexts explicitly if adding traces; current manually-created contexts do not inherit managed-fixture failure screenshots/traces automatically.
- Unit lifecycle tests above are mandatory; browser BFCache exercise is supplemental and must not be claimed unless actually observed.

## Verification gates and runner interaction

Run Node20 wrapped `vitest run src/app/utils/codeExport.test.js` plus scoped lint/format. Then run all six exports with `playwright.export.config.js`, unique `BITMAPFORGE_EXPORT_OUTPUT` outside repo and dedicated port, no server reuse/HMR/shared Vite cache. Code ZIP must turn green through generated-template repair, not weakened tests. Re-run APNG, CSS, Video, Sprite Sheet, and preview after repair.

`.github/ci/playwright.config.js` also consumes this exact spec but serves a built preview using the existing base configuration (90-second per-test timeout). The corrected meaningful-content check will expose Code ZIP failure there too. Local isolated-runner success is not proof of that built-artifact CI path. After repair, independently run the built-artifact config with CI-equivalent environment/build provenance; report timeout/built-vs-source differences instead of editing CI in this task. Current application/SDK build and root Layout suite findings are owned by the parent; this plan does not clear them.

## Approval boundary

Parent must independently inspect the source and audit this contract before assigning template repair. This document is a proposal with concrete evidence, not self-approval. No commit/push/deploy is authorized by this plan.
