# Independent audit: CLI capture canvas lifetime

## Verdict: ACCEPT — bounded source/test plan only

Accept `cli-astra-diagnostic.md:60–64` for a capture-local repair, with the concrete implementation and verification scope below. This is permission to implement that unit, **not** acceptance of an implementation or of rendered artifacts. The existing fourteen failed real outputs remain failed. No browser, installation, implementation, or test execution was performed for this read-only source review; only this audit document was written.

Reviewed working-tree source on branch `gloin/release-hardening`, HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01`, including the existing dirty CLI prerequisite changes. HEAD alone does not identify those changes. Repository `AGENTS.md` and the web-product-development skill were read; the prescribed `COLLAB` directory is absent. Palette work and all other concurrent ownership are excluded.

## Source finding, independent of the sampler

- `harness.js:31–55` retains one canvas before APNG capture; `:73–80,135–139` retains one canvas before WebM capture. Both use that reference after `renderAtTime`.
- `SceneManager.js:129–159` starts a fade when adopting a shape. `:275–278` creates a renderer and delegates its installation. `BitmapEffect.js:76–81` queues that installation during a fade. `SceneManager.getCanvas` (`:289–293`) exposes the active renderer canvas, not a permanent backing surface.
- `SceneManager.renderAtTime` (`:327–330`) calls real `AnimationEngine.seekTo`, then renders. With fades disabled, `AnimationEngine.js:446–448` calls `setPhaseProgress('show', 1)`; `BaseEffect.js:104–106` clears `isAnimating`. `BitmapEffect.renderBitmap` (`:130–133`) then commits the pending renderer.
- `_swapRenderer` (`BitmapEffect.js:84–96`) removes the old canvas, disposes its renderer, initializes and appends the replacement. `BitmapRenderer.dispose` (`:168–173`) clears renderer references, not a caller's retained DOM reference. An old canvas can therefore remain readable while no longer receiving current output.

This establishes a source lifetime defect and a concrete synchronous shape path. It does not establish that this defect explains every retained failed artifact, nor identical timing for asynchronous model loading. The sampler-reservation overflow is a separate diagnostic-controller failure. **Sampler repair is not a prerequisite to implementing and unit-verifying this independently established source fix.** If the selected later real-artifact execution route requires controller repair, resolve that route separately without expanding this source unit or weakening containment.

## Exact implementation boundary

Production edits: **only `packages/cli/src/harness.js`**, inside `captureFrames` and `encodeWebm`.

1. After **each** `manager.renderAtTime(...)`, synchronously reacquire `manager.getCanvas()` and validate it before reading/drawing. Do not insert an await between render and acquisition. APNG must acquire that canvas's 2D context and read that canvas's dimensions; WebM must pass that canvas to `drawImage`. A refresh only before the loop or only on the first frame is insufficient.
2. Keep the existing unavailable-canvas failure explicit. In-loop lookup/read/draw failures must pass through the existing finally/cleanup owners. A retained pre-loop APNG availability check is optional, but its reference must never supply sampled pixels. Do not add an extra render to flush the pending renderer.
3. Preserve the outer manager disposal and primary/cleanup error handling. Preserve pause/resume, per-four-frame APNG yielding, owned stream tracks, recorder listeners and timer cleanup, and the 5000ms stop timeout. Do not refactor these lifetimes as part of the fix.
4. Preserve the exact sample schedule `(i / frameCount) * loopMs`, the `Math.max(12, Math.round(loopMs / 1000 * fps))` count, APNG delay rounding and owned pixel-buffer copies, WebM frame waits, MIME/codec policy, DPR/size setup, fixtures, and all execution/evidence budgets.

Do not edit engine production code, UI `framesProvider.js`, server/index behavior, dependencies/locks, diagnostic controllers, accepted artifact validators, or palette files. No stable-canvas wrapper, global renderer ownership change, priming render, frame-count reduction, or extra animation step is authorized.

### WebM dimensions: retain pre-loop sizing, not pre-loop pixel ownership

The pre-loop canvas lookup remains valid **for sizing only**. `SceneManager.setSize` calls `effect.setSize`; `BaseEffect.setSize` stores floored positive dimensions; `BitmapEffect.setSize` sizes the active renderer. The pending replacement is initialized from the same `effect.width/height` during `_swapRenderer`. For the supported CLI path there is no subsequent requested size change: swapping canvas identity does not change intended backing dimensions.

Therefore retain one initial width/height snapshot, round odd dimensions upward exactly as now, and allocate the offscreen canvas once before acquiring the stream. Keep every draw's destination rectangle `(0, 0, width, height)` fixed. The existing code scales to the even-sized rectangle; do not silently replace this with an unscaled draw plus border padding. For 161×121 input, APNG remains 161×121 and WebM remains 162×122. Do not size from an uninitialized pending renderer (its initial canvas dimensions need not match the requested size).

If a test deliberately makes a later source canvas differently sized, WebM must still use the original even output dimensions and the new source object, without reallocating the stream/canvas mid-recording. This tests existing fixed-output policy, not a claim that ordinary renderer swaps resize output. APNG's real transition test must show equal dimensions across the swap; arbitrary mid-export APNG resizing is outside this repair.

## Required narrow tests and red evidence

Extend `packages/cli/src/__tests__/harness.test.js` for VM capture tests. Add a dedicated `packages/cli/src/__tests__/harness-canvas-engine.test.js` for the real engine transition, using a file-local jsdom environment directive if needed. The CLI package suite must actually discover both files; the root Vite test include does **not** include `packages/cli`. No root configuration expansion is necessary.

### Mock capture cases, both formats

- Use genuinely distinct canvas objects A, B and C, with distinct contexts and pixel sentinels. Have `renderAtTime` change A→B on the first sampled frame and B→C on a later sampled frame. Assert the exact per-frame source identities: APNG's returned ImageData comes from B then C; WebM's `drawImage` arguments are B then C. A is never captured; B is never captured after its retirement. Getter counts or a final canvas assertion alone do not prove this.
- Record ordered render/get/read-or-draw events and all timestamps; assert no missing, duplicate or priming render and no changed frame counts. Include the no-swap control.
- Assert APNG dimensions and read rectangles, WebM even and odd initial dimensions, fixed draw destination dimensions through the later swap, and fixed WebM dimensions when a mock later source deliberately differs in size.
- Cover a throwing or missing current canvas after a successful earlier frame. APNG resumes; WebM attempts recorder stop, removes listeners, clears owned timers, resumes and stops every owned track; the public render path disposes the manager exactly once. Preserve existing render/read/draw/recorder failures and cleanup-error aggregation tests rather than replacing them.
- **Baseline-red proof:** retain the exact pre-edit harness bytes outside production and execute the same new capture assertions against those bytes. Require identified first-frame and later-frame source-identity failures in both formats, not merely a nonzero suite exit. A deliberately first-frame-only refresh mutant must fail the later-swap assertions. Then execute the candidate against the same assertions. Do not rewrite the old implementation from memory or ship a second production implementation.

### Actual pending-renderer transition, not a mocked getter

Use imported, unmodified `SceneManager`, `BitmapEffect`, `AnimationEngine`, and bitmap renderer implementations. It is acceptable to stub WebGLRenderer and canvas drawing primitives to run offline; disclose that this proves control flow/ownership, not actual GPU pixels. Do not mock `BitmapEffect`, `seekTo`, `setRenderer`, `_swapRenderer`, `renderAtTime`, or `getCanvas`. The existing `SceneManager.safety.test.js` mocks the entire BitmapEffect and therefore cannot supply this proof.

Construct a real manager, set a small odd size, load a real cube synchronously, set bitmap mode and update animation/effect options in the CLI's actual order, with fades disabled. Before capture, assert the active renderer/canvas A, `isAnimating === true`, a distinct pending renderer, and `getCanvas() === A`. Feed this manager into the actual VM-loaded harness capture functions, separately for APNG and WebM with fresh managers.

Observe through call-through spies that the first sampled `renderAtTime(0)` clears animation, commits the pending renderer, detaches A, disposes its renderer, clears the pending field, and attaches a distinct current canvas B at the same requested dimensions. Assert actual captured read/draw ownership is B, not A. A getter returning B because a test setter changed a variable is insufficient. Keep real disposal in teardown. The engine identity transition should occur on both old and repaired harnesses; the capture-ownership assertion must fail on retained old harness bytes and pass only with the repair. Keep the later-swap mock case even if the real no-fade transition occurs only on frame zero.

## Frozen artifact acceptance after implementation

Run the unchanged real P01–P10 contract in `cli-render.integration.test.js`, including all fourteen outputs and batch shape/model distinct decoded hashes. Build the owned CLI target as required so execution consumes the repaired source. Keep the prior failures/evidence immutable and record fresh outcomes; offline sentinel frames and benign browser navigation do not replace these artifacts.

Zero weakened thresholds in `cli-stage2-evidence.js`:

- Exact ledger dimensions, including odd APNG 161×121 versus WebM 162×122; exact observed capture counts 21 at 10fps and 25 at 12fps and schedule over 2094ms.
- APNG structural/CRC/compositing checks, animated output, coalesced frame count/delay/duration reconciliation, and independent FFmpeg decoding.
- WebM codec/even-dimension checks, more than one frame, monotonic timestamps, duration tolerance `max(250, 2094 * 0.2)` and cadence tolerance `fps * 0.25` unchanged.
- Each beginning/middle/end sample: opacity at least 0.99, foreground occupancy at least 0.01, at least two meaningful color bins each covering at least 0.005 with RGB separation at least 48, and luma standard deviation at least 5.
- At least one sampled pair with changed area at least 0.005 using strictly greater than 16 luma difference. Preserve the existential temporal contract, static/noise negatives and stationary-interval positive; do not require every pair to change or relax any pair's threshold.
- All existing subprocess, decoder, teardown, ownership, deadline, scalar/body/evidence capacity and containment contracts remain unchanged.

The implementation can be accepted as a narrow source repair only after the new red/green ownership regressions and existing CLI unit/cleanup tests pass. Complete CLI behavior remains unaccepted until genuine regenerated artifacts satisfy the frozen contracts; further failures must be reported and diagnosed separately, not hidden by source-test success.
