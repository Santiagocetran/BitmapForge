# Independent audit — CLI prerequisite plan P

## Verdict: ACCEPT

**ACCEPT for the dependency-preserving prerequisite plan P, before implementation.** This is a separately delivered plan verdict, not implementation acceptance, a successful render result, or approval of Batch C. The plan's explicit exclusion of graceful external-signal/hung-job cancellation is accepted for this bounded slice. No mandatory plan revision is required.

The accepted document is `cli-prerequisite-plan.md`, SHA-256 `623c9362b704f8d01448bf224e7b9de5adbb820f6c8de6eb4c6618d53000aa4c`, reviewed against source commit `550842cab61002c7cc6563e50b9fcdeb17c9bf01` on `gloin/release-hardening`. The revised `cli-plan.md` correctly separates P from C and retains C's unresolved entry gates. **The earlier C verdict remains REVISE; the pending owner choice of CLI Node policy does not block this P plan acceptance.**

Execution must still wait for the independently accepted A/B checkpoint, serial ownership transfer, verified approved runtime/tool identities, and any separately authorized tool/browser acquisition. Those are concrete execution prerequisites, not permission to install now or to alter P's dependency/runtime contract. Implementation must receive its own independent acceptance on the actual checkpoint and evidence.

## Review boundary and evidence

Read `AGENTS.md`, the web-product-development skill and its dependency-review reference, the original independent C audit, revised C plan, and P plan. Inspected actual CLI entry/server/harness/HTML/headless entry/build configuration, CLI tests and historical fixture, embed parser, SceneManager, animation engine, shape/model loaders, bitmap effect/renderer/dither strategy, root/CLI/embed manifests, selected lock objects, FTP security test, installed UPNG/pako/Three files and existing built headless output. The governance-listed COLLAB files and searched CODEX configuration are absent; no additional package AGENTS file was found.

This was **static review only**. Local Python read bytes/JSON, calculated hashes and schedule/geometry arithmetic, and decoded the plan's benign base64 text. No application/test/encoder execution, installation, build, browser, HTTP server, remote lookup or remote action occurred. In particular, no real OBJLoader parse, APNG/WebM output, FFmpeg decode, cleanup run or fresh advisory result is claimed. Existing generated output was inspected, not rebuilt or certified fresh. Only this audit file was written; the path is not Git-ignored.

## 1. Finite assets, MIME and compression — accepted

The route contract is grounded in the current source:

- `server.js:12–25` currently declares five routes, checks only three, and points at nonexistent lowercase `node_modules/upng-js/upng.js`. Uppercase `UPNG.js` exists locally.
- Installed `three.module.js` imports/re-exports `./three.core.js`. Both files exist, but the current server has no core route.
- Installed `UPNG.js:6–10` captures `window.pako` at classic-script evaluation; the installed pako browser wrapper publishes `window.pako`. Loading pako after UPNG is not an equivalent fix.
- `harness.html` supplies the bare-Three import map and headless/harness module scripts, not pako. `harness.js:3–11,42–53` currently loads only UPNG, without checking its global or its compression prerequisite.

P's **exact seven URLs** are sufficient for the specified shape/self-contained OBJ acceptance path: `/harness.html`, `/harness.js`, `/headless.js`, `/three.module.js`, `/three.core.js`, `/pako.js`, `/upng.js`. The mapped repository-root asset paths and `text/html` versus `application/javascript` types agree with the actual layout. The UPNG URL may remain lowercase while its on-disk filename is uppercase.

Own-key raw-URL membership closes the current inherited-property lookup problem without introducing a router. Exact matching, query/prototype/encoded/traversal-shaped unknown URL 404 + `Not found`, startup checks for every required asset, post-start known-file read error 500 + `Error reading file`, loopback ephemeral listen and rejected listen errors are all explicit. Preserve current non-GET behavior; no new method policy is necessary for this slice. Tests must exercise real raw request targets rather than allowing a client URL normalizer to erase the intended unknown input before sending it.

Awaiting valid pako before inserting UPNG, validating both globals, sharing in-flight loads/reusing successful globals, reporting exact load URLs, and testing the actual scripts with a tiny encode are the minimal dependency-preserving repair. Failed loads must not become cached apparent successes. None of this requires an encoder rewrite or manifest edit.

`headless-entry.js` and Vite's external-Three rule explain this loading arrangement. The OBJ addon is bundled into existing headless output; `modelLoader.js:54–103` uses a Blob URL and extension dispatch. The frozen OBJ contains no MTL/texture references and needs no model route. Existing built output also has real lazy font imports; a type-only BaseRenderer import in a comment is not another runtime asset. Final rebuilt request evidence remains mandatory. Unexpected required requests stop P for amendment, not expansion to a static directory/font/general-resource server.

## 2. Frozen nested fixtures — accepted, with rendering still unverified

`projectParser.js:6–16` reads nested `settings` and `model`; `shapeGenerator.js:25–45` supports `cube` with `size`, not `box` with width/height/depth. P addresses both errors, keeps the original fixture immutable, and separates its header/acTL smoke from meaningful output. Source inspection confirms that the historical fixture has neither nested settings nor a model and therefore reaches the empty/default-model path. It cannot prove a rendered box.

Independently reconstructed compact UTF-8 JSON plus one final LF from P and verified:

| Bytes                              | Verified SHA-256                                                   |
| ---------------------------------- | ------------------------------------------------------------------ |
| Planned `shape-v2.bforge`          | `44089df7b4d4f4c4b952c102835086c67cb1ab24da3cce85b06800c8942e8751` |
| Planned `model-v2.bitmapforge`     | `e654d3bc6345537c70645d6953d3b735f943e0953c3ef3d1db3ef7f9acf9bafe` |
| Decoded OBJ, including final LF    | `502592e4e496dbb0455f71890c3d6e5710b6359689875a10f25dea8e6fa25865` |
| Existing historical `shape.bforge` | `9750b319bc568c6de57879c3d01d227cad60a2ca68d00d8777e20a89ae4946f4` |

The new shape specifies `cube`, `shapeParams:{size:2}`. The embedded model carries name/type/format/base64 in the fields consumed by parser/harness; its `.obj` name selects the real OBJ branch. The authored tetrahedron has four distinct vertices, four nondegenerate triangular faces, bounds `[0,2] × [0,1] × [0,3]`, signed volume **1**, and each of its six undirected edges occurs twice. Face-normal dot products against the vector toward the interior centroid are **-1.5 for every face**, confirming outward winding. Its unequal dimensions and off-axis vertices avoid the Y-axis rotational symmetry problem. These are static geometric checks, not a real loader/render pass.

Background/palette/seed/pixel size/fade/effects/speed are explicit. `SceneManager.updateAnimationOptions`, `AnimationEngine.setFadeOptions/getLoopDurationMs/seekTo`, and harness capture scheduling support the intended short loop. Independently calculated: loop **2094 ms**; fps10 **21 captures / 100 ms APNG delay**; fps12 **25 captures / 83 ms delay**. CLI fps supplies capture cadence; project fps/frameCount are deliberately absent, and no ignored baseRotation claim remains.

**Nonblocking precision note:** the frozen `ditherType:"bayer4"` is not a named key in `DITHER_STRATEGIES` (`bayer4x4` is). The current BitmapRenderer deliberately tolerates unknown strategies through its fallback/min-brightness paths (`BitmapRenderer.js:71–81,104–125`); these bytes therefore exercise that existing behavior, not proof of Bayer-4×4 dithering. The plan does not require a dithering-algorithm assertion, so this does not invalidate cube/model loading or require an engine repair. Preserve the accepted hashes; do not silently normalize this token or claim the artifacts validate Bayer dithering. If a supported-strategy fixture is desired instead, submit the explicit fixture/hash amendment before using it as the baseline.

Actual parser field assertions, real OBJ loader triangles/bounds and actual numeric pixel gates remain P implementation acceptance requirements. Static winding/volume cannot substitute for them.

## 3. Minimal lifetime/error repair and cancellation — accepted

The defects are baseline source findings, not hypothetical Puppeteer migration failures:

| Current boundary                                                                                               | Necessary P correction                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.js:84–86` calls real `process.exit` inside resource lifetime                                            | Throw/report failure; one awaited dispatch/catch sets exitCode after cleanup                                                                            |
| `index.js:140,146` floats render/batch                                                                         | Await completion, including batch fail-fast/error reporting                                                                                             |
| Launch handling and `index.js:93–95` can mask error/skip server close                                          | One acquired-handle lifetime; browser/server close attempted independently; retain primary plus secondary failures                                      |
| `harness.js:113–158` disposes only on success                                                                  | Outer manager handle and exactly-once postconstruction finally; disposal failure cannot return success                                                  |
| `harness.js:71–99` acquires stream/recorder before protected lifetime, lacks complete stop/error/track cleanup | Protect from acquisition, listeners before start/stop, observed rejection/stop settlement, bounded stop wait, every track attempted, independent resume |

The plan fixes these boundaries without changing SceneManager/loader ownership internals. A constructor that never returns is not falsely claimed disposed. Captured ImageData copying, scheduling, codec choice and dimension padding remain unchanged. Browser close owns pages; no unnecessary page-close architecture is prescribed. Close rejection must produce final nonzero exit even if the successful output path was already printed.

The recorder contract includes constructor/start/render/draw/error/stop/timeout/blob failures, a five-second stop/error bound, cleared listeners/timers, no dropped rejection, and track cleanup despite an earlier cleanup exception. Implementation review must check that an error emitted during the recording loop is observed immediately and cannot strand an unhandled rejected event promise until a later await. This is enforcement of the specified error contract, not an additional recorder redesign.

**Explicitly accepted cancellation limit:** P covers settled ordinary success/errors and its local recorder-stop timeout. It does not promise graceful SIGINT/SIGTERM, externally killed browser, hung evaluation, host-loss or SIGKILL cleanup. Adding signals/AbortController/render-cancellation protocols would be optional separately reviewed redesign, not required prerequisite hardening. The test helper's owned process-group TERM → five-second grace → KILL/await-close path is emergency containment and a **failed test**, never proof that application cancellation worked. No host-wide kills or shared cache deletion are allowed. An uncooperative close or hung operation is not converted into a cleanup pass.

## 4. Real baseline, failures and downloaded-artifact-equivalent decoding — accepted

P provides a finite P01–P11/F01–F11 ledger rather than delegating fixture/command/format choices to implementation. It covers actual CLI subprocess-written APNG and WebM, supported cube and embedded model, defaults, fps10/fps12, nested paths with spaces, odd sizes, both batch formats/default output paths, and preserved historical smoke. The specified dimensions/padding agree with the current harness. Corrected fixtures must be supplied outside the source tree for before-P evidence; missing startup prerequisites may legitimately block downstream baseline renders. Preserve that block instead of manufacturing pre-repair images or counting diagnostic route patches as final evidence.

The independent decode contract is appropriate:

- Structured APNG IHDR/acTL/fcTL with positive rational delays, composited FFmpeg decode with looping disabled, declared/decoded counts and scheduled duration; any encoder-coalesced frames must reconcile duration rather than silently weakening assertions.
- Real WebM video stream/frame/packet metadata plus decoded RGBA, even dimensions, monotonic timestamps, final interval explicitly estimated when needed, bounded duration/cadence tolerance rather than deterministic MediaRecorder frame counts.
- Every emitted artifact requires meaningful foreground/color/luma and separated-frame change statistics, not signatures, a second encoder call or codec noise. The numeric thresholds are proposed acceptance gates, **not verified results**. A failed threshold blocks P completion and needs a reviewed fixture/threshold amendment before C; it is not permission to tweak the engine or quietly lower a bound.

The failure ledger matches actual source behavior. It distinguishes malformed/versionless JSON, missing file/format, loader `.bad` failure, empty batch and both missing-directory variants, empty browser cache, each required asset, real navigation, mkdir/write errors and injected branch failures. Default batch mkdir occurs before readdir; preserving that behavior avoids misattributing a semantic change to hardening. Focused ordered batch injection establishes fail-fast, while real batch evidence records actual unspecified directory order and legitimately retained completed artifacts. Fresh destinations prevent stale-output false passes.

Mocked exit throwing unwinds finally unlike real OS exit. P correctly requires real F02/F06 subprocess evidence, browser-descendant and owned-port closure after settled success/failure, plus unit branch instrumentation and real page recorder/track checks. Startup-blocked before-P cases cannot prove the original post-launch leak on their own; keep their blocked status separate from causal injection evidence and actual postrepair leak-free runs.

Existing `cli.test.js` has floated-import/exit suppression, stdout-based premature completion and timeout-as-success fallbacks; its legacy subprocess has no spawn-error handling, output draining/cap or owned-descendant reaping. Preserving assertions while awaiting dispatch and using the bounded helper is necessary harness hardening, not coverage deletion. Root Vite test discovery includes only root src/integration paths; P's explicit workspace and integration-file commands with executed-case counts prevent silent omission. The historical result remains honestly separate, even if it still fails.

The isolated scratch evidence layout, pinned executable/cache identities, sixty-second child deadline, decoder deadline, output caps, retained failures and no fictitious frame-progress requirements are adequately bounded. FFmpeg support/browser/runtime availability must be proven during authorized execution, not assumed from file existence. P's missing-cache recovery/install wording invokes separate approval only; it does not override the no-acquisition boundary in P §1.

## 5. Dependency, runtime and security invariants — accepted

Actual manifests/lock confirm:

- Root Node `24.x`; CLI and embed Node `>=20`.
- CLI Puppeteer `^22.0.0`, locked **22.15.0**, helper **2.3.0** in its locked dependencies.
- Existing UPNG **2.1.0** depends on pako `^1.0.5`; root pako **1.0.11** is already locked. Serving its existing browser bundle does not require adding a dependency.
- Root override `get-uri → basic-ftp: 6.2.6`; the current get-uri **6.0.5** consumer remains and locked basic-ftp is **6.2.6**.
- Existing FTP security/compatibility source and fixtures are outside P's writable scope.

P preserves manifests, lock, scripts, settings, overrides, dependencies and all engine declarations. It stops if the transferred A/B checkpoint changes its assumed Puppeteer family. Node24 evidence under an approved existing tool pair is an execution comparison choice, **not certification or removal of CLI Node20 support**. Choosing the future C Node24-only contract is still the owner's decision. Keeping vulnerable/deprecated dependency debt for a reproducible prerequisite is not security completion; C retains that separate responsibility.

Reference hashes of the reviewed source baseline (not hashes of the future A/B checkpoint):

| File                          | SHA-256                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `package.json`                | `b5f810f43db86d3c0973829fab25c98218b24e14b2482106b386e4fe741c4354` |
| `packages/cli/package.json`   | `9fafaa672ac1ceea7d00692bf4278ade92221ba8ef68abd25ef8e3935b307f06` |
| `packages/embed/package.json` | `8b3c9665643f5335027ff7ee011d3ac964b5cf54817281c47459fef64c66a927` |
| `package-lock.json`           | `74e61c99884661fd128be89ef813dabac5c24d25ec8a72d82c6e3e861c6f4724` |

Compare P's unchanged dependency/runtime/security invariants to the **actual transferred accepted A/B tree**, not blindly to these research hashes. No C candidate metadata, new peer/archive/proxy closure or fresh advisory check is approved by this audit.

## Scope judgment and remaining gates

**Necessary prerequisite:** finite asset correction; pako-before-UPNG/global validation; correct independent nested fixtures; structured awaited CLI errors and independent cleanup attempts; harness manager/recorder/track lifetime repair; honest, bounded real subprocess/failure/decode evidence; minimal documentation of existing limits.

**Excluded optional redesign:** general/static/font/resource serving, text/image/externally referenced GLTF support, engine/parser/generator ownership rewrite, new codec/encoder/frame schedule, progress callback wiring, graceful signal/abort architecture, transactional batch/overwrite changes, dependency migration, CLI engine-policy narrowing, portable publication, CI/provider settings and deployment.

Outstanding implementation/release gates are not waived:

1. Transfer accepted A/B ancestry and serial ownership; verify exact approved Node/npm/browser/decoder identities and obtain separate acquisition approval if needed.
2. Implement only P's explicit allowlist; stop for independently reviewed amendment if it cannot satisfy the ledger.
3. Produce before/after evidence, final real APNG/WebM decoding/statistics, all ordinary-error cleanup evidence, preserved historical/security tests and unchanged P invariants. No skip, header-only proof, emergency reaping or mock-only pass clears these gates.
4. Obtain a separate independent P implementation ACCEPT with exact checkpoint and evidence. Only then may C freeze its working baseline and seek its own plan ACCEPT after its owner/metadata gates are resolved.

**Delivered outcome: ACCEPT for P's plan only. No implementation was combined with this verdict.**
