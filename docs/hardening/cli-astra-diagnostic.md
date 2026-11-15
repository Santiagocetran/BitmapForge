# Astra CLI diagnostic: navigation closure and cached canvas

## Outcome

**The new D01-O failure is a diagnostic-controller containment failure, not established browser-environment failure.** The parent sampler exhausted its reserved scalar capacity and sent SIGTERM to the owned CLI process group while navigation was pending. Confidence is high in this immediate failure mechanism; the original evidence does not establish why navigation had not completed before that containment action. No production fix, adapter change, dependency change, fixture change, or policy change was made.

The independent plain-browser control passed with the same locked Puppeteer, Chrome, and actual Chrome arguments. This clears only benign localhost navigation under these conditions, not application/WebGL rendering or the separate historical blank artifacts.

## Actual attempt: retained evidence and timing

Evidence root, relative to the repository's sibling scratch directory:

`../bitmapforge-cli-render-diagnostics/amendment-candidate/pass-GOuytJ/D01-O/`

- `process.json`: CLI PID 3164867, exit **1**, signal null, close observed, elapsed 9264 ms; `samplerFailure: parent scalar reserved capacity overflow`, `capContainmentSignal: true`, no emergency reap.
- `parent-process-observations.json`: the same failure, `killed: true`, 182 sampler iterations. These are retained actual records, not inferred from stderr alone.
- `processes.mjs:138–149,220–235` in the candidate: exceeding the parent log reservation throws, `breach()` verifies the CLI PID/start/group, then calls `process.kill(-root.pid, 'SIGTERM')`. That group includes Chrome. `emergencyReap: false` does **not** mean no controller signal occurred.
- Parsed `parent.jsonl` rather than dumping it: 181 persisted records; iteration 174 is absent. Through iteration 173, at +8722 ms from first sample, the file contained 1,040,475 bytes and the tree had ten processes. Recent records were 9,463 bytes each; another such record would total 1,049,938 bytes, exceeding the 1,048,576-byte reservation. This calculation is illustrative of the missing record, whose exact bytes were not persisted.
- At iteration 175 (+8817 ms), only the CLI root remained in the sampled tree. Subsequent smaller records fit; the final file is 1,045,817 bytes. A below-cap final file does not refute the attempted append overflow.
- `events.jsonl`: singleton selected correctly; production launch arguments were only `--disable-dev-shm-usage`; Chrome PID 3164879 reported `Chrome/127.0.6533.88`; then navigation error and browser-close marker. There are no HTTP-response, body, render-input, or probe events.
- `stderr.log`: `Protocol error (Page.navigate): Target closed`. `observer-status.json`: attached false, acknowledged zero, pending zero.
- Original browser stderr and actual browser ChildProcess exit/close events were **not retained**. The observer's `browser-close` is a wrapper-finally marker, not a native exit event. Node observer events have no timestamps, so precise error-versus-signal ordering cannot independently be recovered from them. The explicit containment record, source path, missing sample and disappearing browser tree together strongly establish the immediate controller-induced closure.

## Observer attachment and response capture

`observer.mjs:111–209` installs console/pageerror/response listeners after `newPage()` and before returning the page to production. It exposes persistence before the production navigation call. Therefore runtime response capture is **not** waiting for probe attachment: its listener already exists during `goto()`.

The wrapper awaits the original `goto(..., { waitUntil: 'networkidle0' })` before calling `evaluate(attachProbe, ...)` and setting `attached = true`. A rejected navigation necessarily leaves attachment false. That flag alone is not evidence of a singleton mismatch or attachment-order defect. The recorded singleton URL is the actual ESM package entry.

Response bodies are captured asynchronously via `response.buffer()` and bounded persistence jobs; only matching loopback asset paths are saved. Navigation success is required before the browser-side engine probe is attached. This run produced no response events, so it cannot prove asset consumption or any engine/capture state. It also offers no evidence of a response-buffer deadlock: no body job is recorded as starting.

## One bounded no-preload control

Evidence: `../cli-astra-controls/` (`plain.mjs`, `stdout.log`, `stderr-browser.log`, `events.json`, `result.json`, `verification.json`, `cleanup-final.json`). This is a one-off plain-browser script, not an adapter extension or a replacement acceptance harness.

- Node **v24.22.3**, installed Puppeteer **22.15.0**, cached Chrome **127.0.6533.88**. CI, NODE_OPTIONS and browser override variables absent. No installation or npm invocation.
- Same production Chrome flags, no sandbox changes. `dumpio: true` changes log forwarding only, to retain browser stderr. Parsed actual spawn arguments equal the failed attempt's arguments except the ephemeral user-data directory.
- Short owned TMPDIR `a3-pj0ddr3l` under profile scratch; no preload, no application, no observer, no diagnostic sampler. Local Node HTTP server served trivial HTML.
- Browser identity obtained at 367 ms; localhost request at 2097 ms, HTTP 200 response at 2127 ms; `networkidle0` navigation and title assertion completed at **4160 ms**.
- Browser disconnected during requested close; **actual ChildProcess exit and close both code 0 / signal null** at 4769/4776 ms. Browser-close promise and server-close callback completed. Outer Node exit **0**, elapsed **5.129 s**.
- Retained stderr includes Haswell Vulkan warning, libva initialization error, and `ContextResult::kTransientFailure` / failed `GpuControl.CreateCommandBuffer`. Their coexistence with successful navigation means these messages alone cannot diagnose this closure or prove WebGL health.
- Chrome binary SHA-256: `fda9b596edc1934dd5dc4257ea7658ca5f5d1aee32013fbf0ed105907816d541`. Additional source and evidence hashes are in `verification.json`.

**Second exact-CLI no-preload control deliberately not run.** The retained controller record already supplies an actionable immediate cause and the benign control disproves a universal launch/navigation failure. Another render would not recover the lost original browser events and is not needed to justify this diagnosis. Application-specific navigation latency remains unmeasured without the sampler; no render acceptance is claimed.

## Separate static cached-canvas finding

This is independent of the new pre-attachment failure. The actual attempt's harness, BitmapEffect source and built `dist/headless.js` hashes still match its recorded pins. No engine ran far enough in D01-O to dynamically confirm this hypothesis.

The source contains a concrete stale-canvas path:

1. `SceneManager` content adoption starts `effect.startAnimation('fadeIn')` (`SceneManager.js:138`), even when the fixture's animation settings disable fades.
2. The CLI subsequently calls `setRenderMode()` (`harness.js:217–220`), creating a new renderer. `BitmapEffect.setRenderer()` queues it while `isAnimating` is true (`BitmapEffect.js:76–81`).
3. Both APNG capture and WebM encoding cache `manager.getCanvas()` **before** rendering their first sampled frame (`harness.js:32,74`). `getCanvas()` returns the current active renderer's canvas, not a stable wrapper (`SceneManager.js:289–293`, `BitmapEffect.js:67–69`).
4. For the real shape fixture, `useFadeInOut` is false. The first `renderAtTime(0)` calls `seekTo()`, setting phase to show and `isAnimating` false (`AnimationEngine.js:446–448`, `BaseEffect.js:104–106`). `renderBitmap()` then commits the pending swap (`BitmapEffect.js:130–133`). The old canvas is detached and its renderer disposed; the new renderer owns a different canvas.
5. APNG still reads the cached old canvas; WebM still draws from it. Disposal clears the renderer's reference but does not invalidate the caller's retained DOM canvas (`BitmapRenderer.js:168–173`). Thus continued capture can read stale/blank pixels while the current renderer draws elsewhere. The UI `framesProvider.js:27–44` has the same lifetime assumption, but is outside this CLI fix scope.

Confidence: **high that the source permits stale-canvas capture, strong for the synchronous shape setup ordering; not yet measured as the cause of the retained 14 blank artifacts**. Model-loading awaits and live-loop timing can differ. This report does not reclassify those artifacts as passing or attribute every blank artifact to one mechanism.

### Minimal future source plan, not implemented

- In the two CLI capture loops, reacquire `manager.getCanvas()` immediately **after each** `renderAtTime()` and use that canvas/context for the read or draw. Preserve pause/resume and cleanup behavior, frame times/counts, dimensions and encoding policy. Keep WebM's fixed even output dimensions explicit; do not silently resize mid-recording.
- Add focused regression cases where `renderAtTime()` swaps from canvas A to B: APNG must read B and WebM must draw B, including a later-frame swap. Include a real pending-renderer transition regression, not only a mock getter test. Preserve the old implementation as the red counterexample.
- Then independently review and run the unchanged real artifact contracts for the accepted CLI cases. Require meaningful occupancy/color and temporal evidence; unit source ordering alone is not rendered-artifact acceptance. Do not change engine renderer ownership globally to solve a capture-local reference bug.

## Minimal next diagnostic step and release

Before repeating the adapter, propose a **small, separately reviewed correction to existing sampler serialization**: retain immutable executable/argv identity once and bounded per-sample state/deltas, within the existing reservations and containment policy. Verify offline that a realistic retained ten-process trace fits and that real overflow still fails closed. Do not merely increase the budget, remove containment, manufacture CI, alter Chrome flags, or add another forensic framework. No such change was made here.

Current release checks: all twelve retained original PIDs plus the new control's Node and Chrome PIDs are absent; original ports 38097/42337 and control ports 45253/37005 refuse connections. No Chrome process with the control's profile remains; its emptied TMPDIR was removed. `verification.json` retained one naive substring match to the diagnostic shell itself; `cleanup-final.json` explicitly corrects it using executable-role filtering. No emergency termination was needed for the new control. Browser diagnostic slot is released.

Only this repository document was created. The one-off control and its evidence live in sibling profile scratch; production, adapter, fixtures, dependencies and historical evidence remain untouched.
