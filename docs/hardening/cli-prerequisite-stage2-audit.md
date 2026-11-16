# Independent CLI prerequisite stage-2 audit

## Verdict: REVISE — test implementation only; full P BLOCKED

The real evidence is credible and the fourteen artifact failures are genuine. They are **not** explained by a bad FFmpeg decode or pixel arithmetic. Two bounded test-contract corrections below are required before accepting this test implementation. Neither correction clears any existing artifact failure, authorizes a production repair, changes fixtures, or accepts P/C/release.

Reviewed branch `gloin/release-hardening`, HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01` plus the uncommitted checkpoint. Read AGENTS, web-product-development guidance, accepted P plan/audit, stage-1 repair/audit context and stage-2 handoff; inspected new render/failure/evidence suites, protected subprocess helper, retained cleanup/harness suites and relevant production capture/renderer/animation paths. Governance-listed COLLAB files are absent. This review writes only this report. No browser, installation, rebuild, source repair or fixture edit was performed.

### Required test-only revisions

**R1 — match the accepted temporal-change quantifier, and regress it.**

`cli-stage2-evidence.js:344–362` computes only beginning→middle and middle→end differences, then requires **both** pairs to exceed 0.005. P requires >=0.5% pixels changing by >16 luma **between separated samples**; the inherited C clarification explicitly says “between at least two well-separated samples.” This is not a requirement that every sampled pair change. Requiring both can reject a valid animation containing a stationary interval or equivalent sampled poses.

I executed an isolated, explicitly synthetic diagnostic against the actual exported `rgbaStats/assertPixels`: three opaque, two-color 20×20 frames, first split black/background-and-white, second inverted, third identical to second. First transition qualifies, second is zero; current assertion rejects with `{"from":1,"to":2,"fraction":0}`. This is a checker counterexample, never CLI artifact evidence.

Keep beginning/middle/end spatial checks and all frozen numeric thresholds. Assert existence of a qualifying well-separated temporal pair, preferably checking additional non-aliasing separated positions rather than assuming both half-loop pairs must change. Add positive one-qualifying-pair and negative static/codec-noise regressions. If requiring every pair is intentional, obtain an explicit contract amendment instead of silently treating it as inherited acceptance. **All fourteen retained outputs still fail the accepted existential criterion:** independent all-frame analysis found zero qualifying change versus the first frame throughout each artifact.

**R2 — assert real batch Processing messages, not only preserve them in evidence.**

`cli-render.integration.test.js:154–164` checks absolute stdout paths, final exits, exact output directory contents and generic stderr failures, but does not assert both per-input `Processing:` stderr messages or ignored-notes exclusion. P's output contract preserves batch processing stderr; C explicitly requires both messages. Add assertions for the two actual supported input paths and no notes processing in P07–P10, without depending on directory order. Retained final stderr already contains the correct two messages, so this is missing regression enforcement, not a demonstrated production defect.

These revisions are confined to the stage-2 test/evidence files. Preserve failed evidence, budgets and protected helper. A nonbrowser recheck can first apply the checker to retained decoded bytes; a later real ledger rerun still needs a newly granted browser slot.

## Programmatic integrity and execution verification

Evidence root is `/home/agent/.hermes/profiles/gloin/cache/scratch/`; checkpoint is `bitmapforge-cli-stage2-checkpoint/`.

- Rehashed `evidence-manifest.json`: **`d9cf8ba3c0c76b22fcaaedb6ebf2c8a0f8c059f422247a7dacf26094c71375c0`**. Independently checked **233/233 listed files**, both byte counts and SHA-256; no mismatch/missing entry.
- Compared both final run manifests' protected source/build/manifest/lock hashes to current checkout: no mismatch. Compared all four checkpoint source snapshots, including the handoff: exact matches. Verified all three source-hashes entries against actual files.
- Accepted P plan still hashes to `623c9362b704f8d01448bf224e7b9de5adbb820f6c8de6eb4c6618d53000aa4c`.
- Protected helper remains `255be7ab9c87202d5df2abee8452a9e04aa1dcc99c991d45b5eec5da0f39f635`.

| Reviewed file                      | SHA-256                                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| `cli-stage2-evidence.js`           | `45658e425e2a01a99688585672255e0a60ff3a3b05dc97fc0f5290c758d0754b` |
| `cli-render.integration.test.js`   | `5a3ed176190ed80754cd2e83a70c44c562ac0ae46448ede790aa8a567ba56a67` |
| `cli-failures.integration.test.js` | `625000972ed67c590ec084d43e4666eba2b40ebdda103774fad8a43d6af7eebd` |
| CLI `index.js`                     | `16bb5293c9fdcfa438623e7912426ecf821c833737a2c9f72af7acc33ee78017` |
| CLI `server.js`                    | `14f7dfe9214f2b639ed418450e8baceabd4a7a63237e89c3c5d4d091776b008c` |
| CLI `harness.js`                   | `0ae34f4cfbd1e46daa46452931361d163890a17cd72ee6494f35ac77b66cf247` |
| built `headless.js`                | `9681565ac5e39d8f6e36a8f4475c554959f67baf48f2064259117bb402661a46` |

Production hashes matching the execution manifests establish exact reviewed bytes, not fresh-build provenance or A/B ancestry. The 233-entry integrity result applies to listed files, not an assertion that every historical scratch file is inventoried.

I independently reran **fourteen FFmpeg decodes**, reading original artifacts and capturing raw RGBA in memory, each with a 20-second timeout, APNG looping disabled and passthrough timing. Every resulting byte stream matched its retained `composited.rgba` exactly; every raw/artifact hash matched `pixels.json`. No evidence files were rewritten. Independently recalculated sampled occupancy/opacity/luma standard deviation from RGBA; all reports agreed (within 0.0001 for floating-point standard deviation). Also inspected every decoded frame, not only reported samples.

## Actual ledger, not artifact-success accounting

ANSI-stripped final log status marks independently count **35 passed / 14 failed / 2 skipped = 51**, matching Vitest's declared totals. Breakdown: 10 CLI render/process tests, 4 independent batch-hash tests and 4 pure contracts pass; 14 artifact decode/pixel tests fail; 17 F-suite tests pass; 2 opt-in decoder self-tests skip in that browser invocation. Nested F09/F11 and F10 runs report 26 and 35 passing tests respectively; those are **not** additional top-level passes. The separately retained nonbrowser run reports 117 passed / 46 skipped; it is not full artifact acceptance.

P01–P10 are ten actual CLI children, fourteen emitted files, not fourteen successful animations. Every CLI child exited zero without containment failure/emergency reap. Output defaults/options/nested paths/odd dimensions/both batch formats/default out directories were exercised. Distinct batch raw hashes are true, but do not alone prove geometry rendering: a transparent/black shape and a flat gray model also differ. Whole-video hashes can additionally differ solely through frame count; use normalized sampled-content comparisons if strengthening that assertion later.

| Artifact(s)              | Independently observed full decode                                                               | Meaningful output                          |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| P01; P07 a; P09 a (APNG) | One identical RGBA value `(0,0,0,0)` in every pixel of every frame                               | FAIL: fully transparent                    |
| P02; P07 b; P09 b (APNG) | Every pixel/frame `(65,67,64,255)`                                                               | FAIL: uniform, static                      |
| P03; P08 b; P10 b (WebM) | Every pixel/frame `(64,66,61,255)`                                                               | FAIL: uniform, static                      |
| P04; P08 a; P10 a (WebM) | Every pixel/frame `(0,0,0,255)`                                                                  | FAIL: opaque black, static                 |
| P05 odd APNG             | All frames identical; 19,200 flat-gray pixels plus 281 background pixels                         | FAIL: static border pattern, not animation |
| P06 odd WebM             | Two byte-distinct frames, with only small edge/codec differences; all temporal luma changes <=16 | FAIL: no qualifying motion                 |

Thirteen artifacts have exactly one unique full-frame hash; P06 has two. Every artifact's maximum >16-luma changed fraction against the first frame is **0**, across all frames. Consequently R1 does not invalidate the retained failures. P05's spatial stddev (~5.184) and two colors merely come from a static border; P06's ~5.158–5.164 deviation is similarly insufficient. Occupancy of 1 for uniform gray/black is not “a rendered model”; the spatial/color/change gates correctly prevent that false pass. APNG uniform luma's reported ~0.0000338 is floating-point cancellation, not real texture.

## Decode, timing and fixture contracts

- Exact P01–P10 command matrix is present: default 400×400 shape APNG; model APNG/WebM fps10 with spaced nested paths; shape WebM fps12; odd APNG161×121 and WebM162×122; explicit/default batch outputs for both formats. Fourteen files are decoded independently from subprocess-written artifacts.
- APNG parsing checks signature, bounded chunk traversal, sequence numbers, frame rectangles, dispose/blend values, positive rational delays, declared/fcTL count, duration and capture-multiple reconciliation. FFmpeg supplies actual compositing, not UPNG's known problematic decoder. I additionally independently verified **every APNG chunk CRC**, decoded/frame counts and rational delays: fps10 is 21×100 = **2100 ms**; fps12 is 25×83 = **2075 ms**. No coalescing occurred. Runtime parser does not itself validate CRC or every PNG structural rule; this is not a general PNG validator, and actual FFmpeg decode plus reviewed CRCs suffice for this checkpoint.
- WebM uses video-only ffprobe streams/frames/packets and passthrough RGBA decode; counts match decoded data, dimensions are even and correct, timestamps strictly increase. I independently recomputed durations/cadences from retained timestamps: **2201.85–2253.125 ms**, **9.4922–9.5374 fps** for fps10 and **11.0957–11.2888 fps** for fps12, within frozen tolerance. Final interval estimates are explicitly recorded; no deterministic exact WebM frame count is imposed by the test.
- Node24 execution with the real parser independently consumed both fixture settings/input types; real OBJLoader parsed the model to **four triangles**. Model-data fields match source JSON. Verified fixture hashes remain `44089df7b4d4f4c4b952c102835086c67cb1ab24da3cce85b06800c8942e8751` and `e654d3bc6345537c70645d6953d3b735f943e0953c3ef3d1db3ef7f9acf9bafe`; decoded OBJ hash is `502592e4e496dbb0455f71890c3d6e5710b6359689875a10f25dea8e6fa25865`.
- Real AnimationEngine configured from each parsed fixture returned **2094 ms**. Independent arithmetic yields 21/25 captures at fps10/12 and 100/83 ms APNG delays. Retained real-page observations assert actual loop/capture count and every absolute sample time; these are not merely hard-coded encoder expectations.
- `bayer4` remains the accepted literal token, not `bayer4x4`. Neither hashes nor parser success prove Bayer-4×4 behavior. Do not normalize it without a reviewed amendment.
- RGB buckets, meaningful-area/color separation, foreground distance and near-opacity definitions are conservative operational additions. I do not attribute current failures to them: uniform/transparent/static outputs fail unambiguous accepted requirements independently. Near-total opacity is appropriate only for these opaque-background fixtures, not a universal export contract.

## Failure validity and cleanup

F01–F03 exercise real usage/read/format errors, both malformed/versionless postlaunch errors, empty batch and the two distinct missing-directory semantics. F04 genuinely has an empty isolated cache and no executable override; launch fails, owned server closes. Recovery succeeds with the original existing cache; **this is cache-selection recovery, not a fresh installer/download proof**.

F05 physically removes each of seven copied assets, restores in finally, tests raw prototype/query/traversal-style 404 targets and poststart read500, then closes the disposable server. Its process exits zero and route evidence has all seven missing assets. F06's valid payload renamed `invalid.bad` produces an actual unsupported-format loader error, not reliance on permissive OBJ parsing. F07 separates prelaunch mkdir from post-render EISDIR write failure. F08 actually closes the owned server before real goto; ERR_CONNECTION_REFUSED is primary and the later double-close “Server is not running” is expected secondary fallout of that injected navigation scenario, not a spontaneous render cleanup regression.

F09/F11 and F10 invoke the retained accepted unit suites as bounded children, preserving independent close attempts, ordered valid→failure→later-not-started fail-fast, manager/recorder/track exception branches and benign timeout/overflow/spawn-error containment. Protected helper bytes are unchanged. Ordinary result acceptance requires observed close, no signal/failure/containment errors, no emergency reap and no surviving owned group. All 10 render cleanup reports and 14 real CLI F cleanup reports record dead sampled PIDs and closed owned ports. The remaining three F child processes are the disposable server probe and two nested unit suites, not missing real Chromium cleanup reports.

The preload resolves the production ESM Puppeteer entry, forwards original calls, logs actual HTTP/page events, and observes ended tracks/inactive recorders. It does not substitute pixels or encoder responses. Descendant sampling can race process exit (retained ENOENT observations); this is not an exhaustive proof about escaped/reparented descendants. Five-second ordinary group grace, scoped emergency containment and final sampled PID/port probes provide the accepted bounded evidence, not graceful external-signal cancellation. No accepted CLI child relied on emergency reaping. Fatal page errors are retained but not generally asserted absent; that is a useful future harness strengthening, not a cause established here.

## Attribution and bounded next diagnostics — no repair authorization

### Fourteen outputs: production capture path is the leading lead

Independent redecode and all-frame inspection rule out a mere bad selected-frame statistic or decoder artifact. Correct fixture files are read, real parser/loader work, loop/capture schedules run and encoding completes. **A successful exit/valid container does not establish meaningful rendering.**

There is a concrete source-level stale-canvas hypothesis worth testing before any fixture or engine change:

1. Harness loads content, starting fade-in (`SceneManager._commitSource:138`), then requests `setRenderMode`.
2. `BitmapEffect.setRenderer:76–81` queues a replacement while animating.
3. APNG/WebM capture caches `manager.getCanvas()` **before** its first `renderAtTime` (`harness.js:32,74`).
4. Fade-disabled seek sets show/nonanimating (`AnimationEngine:446–447`, `BaseEffect:96–107`), so `BitmapEffect.renderBitmap:130–133` can swap/dispose the old renderer on the first capture.
5. The cached old canvas can remain readable but no longer receives new frames. This fits static/transparent preexisting-canvas output and odd-size background border observations.

These paths exist in the retained bundle too. This is a **grounded diagnostic hypothesis**, not a browser-reproduced causal verdict. Live-loop timing may affect whether a swap is pending. Instrumentation itself also adds scheduling and wrappers, so preserve a no-preload comparison.

Request one separately authorized, serial diagnostic slice: P01 and P02 only, unchanged fixtures/options/budgets/cache/browser; observe canvas object identity/connectedness/dimensions and current `getCanvas()` before/after first capture, active/pending renderer identity, source presence and raw current-versus-cached pixel statistics. Compare an otherwise identical no-preload CLI run with the observed run. No replacement pixels, waits, route expansion or production patch counts as acceptance. If stale canvas is confirmed, propose a separately audited minimal capture-lifetime amendment and regress it with a mock manager that changes its canvas during first render. Do not broaden into renderer architecture, change dithering or relax thresholds to camouflage this blocker.

### Legacy P11: launch/environment blocker, not decoded-artifact failure

Separate retained P11 run exits **1; 10 pass / 1 fail**, at browser launch before original PNG/acTL assertions. No legacy artifact is certified. The test uses a nested `bitmapforge-test-*` TMPDIR; the expected profile prefix under this scratch root already reaches **108 characters**, versus **94** for the short stage-2 `c2-*` prefix, before additional socket suffixes. Unix-domain path limits are therefore a credible platform explanation, reinforced by retained earlier long-path/short-path probes, but P11's log lacks enough Chromium stderr to independently prove this exact cause.

Keep P11 red. Its owner should capture actual launch arguments/user-data-dir and browser stderr, then compare only a short separately owned scratch TMPDIR using the same Node/cache/browser/arguments and unchanged 40-second child / 60-second outer budget. No install, browser substitution, timeout increase or assertion removal is justified. Launch recovery would only unblock the historical header smoke; the historical malformed fixture still cannot certify meaningful artwork.

## Handoff

**REVISE test implementation for R1/R2 only. Full P remains BLOCKED independently by all fourteen meaningful-output failures and separate legacy launch failure.** Evidence integrity, decode/timing arithmetic and ordinary settled-error cleanup are substantiated; no blanket artifact success is accepted. A/B provenance, before-P causal evidence and full-root gates remain the parent's separate responsibilities. No C work, release, deployment or issue closure is authorized by this audit.
