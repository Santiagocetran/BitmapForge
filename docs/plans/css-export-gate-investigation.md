# CSS export built-gate investigation

## Outcome and scope

**The original CSS gate remains flaky/red, not cleared.** Reproduced its 90,000 ms timeout and secondary central-directory error in isolated built-only runs. The exporter completed; the downloaded archives are complete, CRC-valid, decodable, full-loop animations. The dominant problem is accidental full-preview spatial workload combined with software rendering and runner artifact overhead, not a demonstrated malformed CSS archive or hung export. The exact timeout boundary varies: screenshot capture in one run, runner-owned context-close/artifact finalization after every assertion in another.

A bounded **external fixture experiment** preserved the full **181 animation frames**, 11,283.185 ms loop, original meaningful-content/different-frame/no-error assertions, tracing policy and **90-second budget**, and passed in **20,447 ms** at a verified **384×320** preview. This is a repair candidate, not an implemented repository fix or final six-case acceptance.

Owned repository write: this document only. No application, configuration, test, dependency, CI, or dist edit; no rebuild, commit, reset/stash, push, deployment or remote write. Concurrent parent/UI-worker edits are outside this investigation.

## Identity and reproducibility

- Repository HEAD `298bdec17dcd1603add549118a743e5cd494ba08`, dirty branch `gloin/ui-output-improvements`.
- Read root `AGENTS.md`, tracing-ownership plan, prior built verification handoff, CSS spec, CSS exporter, frame provider, animation duration calculation, preview resize ownership, static artifact server, installed Playwright artifact recorder/trace merger. `COLLAB/` absent.
- Used the prior immutable `built-export-evidence-final/dist/` snapshot, not live source or a new build. Compared its complete **35-file SHA-256 manifest** before/after; separately fetched every file through isolated Vite preview and verified all 35 HTTP byte hashes. `css-gate-evidence/served-identity.json` records those identities. Snapshot unchanged. Prior manifest identity is documented by the supplied handoff; no stale-artifact explanation is needed or claimed.
- Node **20.20.2**, installed Playwright **1.59.1**. Commands run through `npx --yes --package=node@20 -c 'node ...'` from the actual repository.
- External configs import `.github/ci/playwright.config.js`, retaining one worker, retries 0, software-GL flags, trace `retain-on-failure`, screenshot `only-on-failure`, 90,000 ms, strict unique preview port and no reuse. Only isolated absolute paths/port/output and JSON reporter are overridden. All output is outside the served repository. Diagnostic copied ESM specs have their own `type: module` package boundary.

Evidence root: `/home/agent/.hermes/profiles/gloin/cache/scratch/css-gate-evidence/`. Each real run has `run.log`, config, `results.json`, execution metadata, and its actual exports/screenshots. Summary: `summary.json`; ZIP/decode verification: `artifact-analysis.json`. Helper scripts are sibling scratch `css-investigate.py`, `css-diagnostic.py`, `css-diagnostic-90.py`, `css-bounded.py`, `css-zip-preload.cjs`, `css-analyze.mjs`, `css-finalize.py`.

## Actual executions

| Evidence directory | What ran | Actual test duration | Result / boundary |
|---|---|---:|---|
| `original/` | Original repository CSS spec, original 90 s | 94,074 ms including post-timeout work | Timeout while second screenshot was outstanding; both screenshot files eventually written. Secondary central-directory error; no retained final trace. |
| `original-zip-probe/` | Original spec, 90 s, external ZIP-open probe | 91,106 ms | Timeout plus same central-directory error. Initial probe targeted a read-only export getter, so did not intercept calls; do not treat its absent log as evidence. |
| `zip-caller/` | Original spec, 90 s, corrected external ZIP-open wrapper | 90,943 ms | Timeout **after all CSS/page-error assertions passed**, during final context lifecycle; valid runner trace retained. No central-directory error this time. |
| `zip-caller-repeat/` | Same original-budget probe again | 75,939 ms | Pass; confirms a variable-cost boundary problem, not a deterministic inability to export. |
| `diagnostic/` | External copied spec + canvas timing wrappers; **180 s diagnostic budget** | 78,787 ms | Pass, original assertions. **Not acceptance**: longer-budget diagnostic only, even though this execution completed under 90 s. |
| `diagnostic-90/` | External instrumented original fixture, restored 90 s | 80,997 ms | Pass; measured explicit context close **6,664 ms** after all assertions. |
| `bounded-targeted/` | External copied spec, verified preview 384×320, full default loop, original 90 s | **20,447 ms** | Pass, all original CSS assertions. Spatial fixture experiment only. |

Three failed external fixture setup attempts (`bounded/`, `bounded-fixed/`, `bounded-observed-container/`) are preserved, not counted as exporter failures: first attempts sized the wrong ancestor and/or polled the first document canvas, which is the **120×120 rotation gizmo**, not the preview. The successful experiment sizes the Preview canvas's observed container (two ancestors) and polls that same role-scoped preview locator. One attempted repeat command was approval-pending and has no execution result; no repeated bounded-success claim is made.

## Exact phases and measured workload

The original spec selects CSS, downloads and extracts it, opens a second page **in the still-live app context**, navigates to the extracted wrapper, waits for visibility, waits three seconds, captures frame 0, waits 600 ms, captures frame 1, analyzes pixels, then closes the context. That includes both live application preview rendering and CSS atlas playback until close. Installed runner tracing snapshots/instruments the explicit context too.

`zip-caller/trace-analysis.json`, from the valid runner trace, gives:

| Operation | Duration |
|---|---:|
| Wait for CSS download, including export click/capture/build | **61,441.8 ms** |
| Artifact page navigation, runner-instrumented call | **3,944.7 ms** |
| Artifact `#anim` visibility, runner-instrumented call | **4,577.9 ms** |
| Existing 3 s delay | 3,099.2 ms |
| First screenshot | 1,496.9 ms |
| Existing 600 ms delay | 727.3 ms |
| Second screenshot | 590.0 ms |

All six expectations, including both meaningful-content checks, frame inequality and application errors, then pass. The trace's final assertion ends at monotonic 89,319 ms; test setup/hooks began at 5,277 ms. Timeout follows during final context-close lifecycle, before normal completion. Thus it is incorrect to universally identify download or ZIP extraction as the blocked step. Earlier supplied full-suite evidence timed out nearer the first screenshot; this investigation's `original/` DEBUG log places timeout during the second screenshot. Both are consistent with a large workload consuming almost all of the same fixed budget.

The same trace records underlying artifact `goto` at only **354.0 ms**, versus its 3,944.7 ms runner-facing call. Do not equate the entire navigation timing with HTTP/PNG download time. Runner instrumentation and browser scheduling materially contribute. A separate instrumented run measures final `context.close()` at 6,664 ms; `ArtifactsRecorder.willCloseBrowserContext` performs trace-stop, temporary screenshots and page snapshot **before** actual browser context closure (`node_modules/playwright/lib/index.js:607–610,689–696`). The passing original-budget run also logs runner screenshots at context close despite retain-on-failure ultimately discarding a successful trace.

### Frame count, memory, render/readback and encoding

Actual CSS/PNG bytes, not a source estimate:

- **894×726 per frame; 181 keyframe stops; six columns / 31 rows; atlas 5364×22506**.
- CSS loop duration **11283.185307179585 ms**, matching `getFrameCount = max(12, round(loopSeconds * 16))`.
- This is **one complete loop**, not unnecessary repeated multi-cycle capture. The default spin-aligned show plus fades produces the length. Do not cut frames to 12 or remove animation/fades as a shortcut.
- Atlas alone expands to **460.519 MiB RGBA**, and the captured 181 full-frame images require **448.139 MiB** before atlas construction. These are raw buffer-size calculations, not measured RSS/peak-memory claims; temporary canvases/decoder/browser surfaces can add more.
- Two full-size instrumented runs cumulatively measured `drawImage` **39,536.7 / 42,628.6 ms**, `getImageData` **3,100.2 / 3,526.9 ms**, `putImageData` **680.3 / 598.3 ms**, PNG `toBlob` **2,241.7 / 2,216.6 ms**. Timers span the page session up to download, including preview rendering and export; they are **not** falsely attributed exclusively to the 181 capture frames.
- Source confirms the cost path: `BitmapEffect` draws the WebGL renderer to its sample canvas, then CPU reads image data; `framesProvider` renders and reads every frame, pausing/resuming the preview around capture; `cssExport` allocates the full atlas and per-cell canvases and PNG-encodes it. GPU-to-CPU synchronization is a plausible contributor to `drawImage` time, but no GPU profiler was collected; the measurements prove Canvas2D draw/readback cost, not an exact GPU stall breakdown.
- The approximately **5.7 MB downloaded ZIP is not representative of its expanded raster workload**. PNG encoding is a few seconds, not the bulk of the roughly minute-long export wait. ZIP data volume/extraction is not the observed hang.

## Output completeness and central-directory error

`artifact-analysis.json` validates all **seven** produced investigation downloads with JSZip `checkCRC32: true`; each has the expected CSS, sprite PNG and README. Two representative atlases are fully PNG-decoded and every real frame cell analyzed:

| Artifact | ZIP bytes | Distinct decoded cells | Meaningful cells under original pixel criteria |
|---|---:|---:|---:|
| `original/` (timeout + central-directory error) | **5,681,286** | **181 / 181** | **176 / 181** |
| `bounded-targeted/` | **1,251,913** | **181 / 181** | **176 / 181** |

Five low-content frames belong to an animation containing fade boundaries; no requirement that fade endpoints become solid geometry was introduced. Both runtime screenshots independently satisfy the original nonblank thresholds and differ. Bounded screenshot frame 0 was visually inspected: visible green dithered cube geometry, not blank. Bounded frame ratios .179956/.170142, entropy 1.314975/1.082554, 53/42 colors.

**The central-directory error is not from the generated CSS ZIP.** Its bytes pass full CRC verification, PNG decoding and 181-cell analysis, and ZIP extraction/playback was reached before the timeout. The exact message is found in installed **Playwright's bundled yauzl**, `playwright-core/lib/zipBundleImpl.js`, not the JSZip extraction path used by this test. Playwright's `worker/testTracing.js:293–310` opens temporary trace ZIPs for final trace merging and propagates their open errors. Error runs lack the final trace attachment; another timeout produces a valid trace. This localizes the additional error to runner trace/archive finalization, separate from the application download.

**Remaining uncertainty:** the failed temporary trace ZIP was not retained, and the corrected external ZIP-open wrapper did not encounter the central-directory error in its subsequent runs. Therefore the precise interrupted temporary filename and whether the immediate cause is a write/close/merge race are **not proven**. Do not assert a particular Playwright race, patch its internals, disable tracing, or claim it repaired. The narrower conclusion—complete app archive, independent runner archive failure—is evidence-backed. Avoid using the initially ineffective probe's absent logs as proof.

## Recommended minimal repair (separately authorized implementation)

1. **Make only the CSS visual test's spatial fixture explicit and bounded.** Keep desktop application viewport/accessible controls, uploaded closed cube and full default animation. Size the actual observed preview container to **384×320**, await those exact preview backing dimensions, and assert the exported CSS/PNG dimensions agree. Prefer a stable named fixture helper/Preview locator over brittle document-first-canvas selection. This changes the accidental raster scale, not the semantic test's frame count, cadence, animation phases or content thresholds. The external experiment already verifies the full original assertion set at this size in 20.447 s, with 181 unique decoded frames and 176 meaningful frames—same frame/meaningful counts as the huge original.
2. **Keep the complete 90,000 ms test budget, original trace/screenshot/retry/worker/launch policy and every current assertion.** Add positive archive/PNG/frame-count checks if making workload explicit. Do not replace real downloaded output with mocks, bypass WebGL, remove fades/spin, lower entropy/occupancy thresholds, compare blank frames, or call the diagnostic 180 s run acceptance.
3. **Give phase timing failure diagnostics a single runner-compatible owner.** On any residual failure, retain export/download/navigation/frame/close timings, ZIP byte size and canvas/atlas dimensions. Do not introduce duplicate tracing. Keep context cleanup protected against primary errors, but do not turn a lifecycle timeout into a pass. A separate tiny external intentional-failure probe can verify retained runner trace ZIP readability without deliberately timing out a 461 MiB atlas.
4. **Do not change production exporter behavior merely to green this gate.** The existing exporter has a real performance/scalability concern at large preview sizes, but this investigation does not establish wrong frames, corrupt ZIPs, a multi-cycle bug or a native-browser rendering failure. An app optimization/maximum-atlas policy requires separate product/compatibility design, benchmarking and unit/browser coverage. It is not needed for the bounded gate repair and must not silently reduce a user's requested export resolution or frame count.
5. **Verification before acceptance:** independently review the narrow fixture change; repeat isolated CSS at least three times with the unchanged 90 s policy, retaining all original content/difference/error checks plus 181-frame/atlas dimensional evidence. Then run all six built cases against the current final source build with exact served-byte provenance. Include a runner trace-on intentional failure readability probe. If original large-resolution behavior is retained as a performance diagnostic, label it separately rather than silently weakening or skipping a required case.

No all-six clearance, final-source verification, production defect fix or release approval is implied by this investigation.
