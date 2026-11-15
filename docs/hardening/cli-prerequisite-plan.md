# CLI baseline repair prerequisite (P) — independent review unit

**PLAN ONLY / NOT ACCEPTED. No implementation permission.** Obtain a separately delivered independent **ACCEPT for P** before any P code/test edits, builds, installation or browser work. After P execution obtain independent implementation ACCEPT on its exact checkpoint and evidence; neither accepts Batch C. C needs its own separately delivered preimplementation ACCEPT after its entry gates are filled. The existing independent C verdict remains REVISE.

## 1. Scope, sequence and ownership

Inspected research source `550842cab61002c7cc6563e50b9fcdeb17c9bf01`, branch `gloin/release-hardening`; read AGENTS, web-product-development/dependency-review guidance and both CLI plan/audit. Governance-listed COLLAB files are absent. This planning assignment writes only this document and `cli-plan.md`. Documentation is not ignored; no install, test, browser, build or application edit was performed. Arithmetic/fixture-byte hashes below were computed, not rendered.

Coordinator first receives independently accepted A/B checkpoint and releases shared installation ownership. P runs serially on that checkpoint, preserving **Puppeteer ^22.0.0 / locked 22.15.0** (or stops if A/B changed it). Root `24.x`, CLI `>=20`, embed `>=20`, manifests, lock, scripts, overrides and lifecycle/user settings are **unchanged**. A verified exact existing Node 24/npm 11 pair is required for comparable evidence; executable paths/versions are a handoff gate, not an invented identity. This does not newly certify CLI Node 20 or decide C's runtime narrowing. No package acquisition is authorized by this plan. Needed runtime/browser/tool acquisition requires separately approved bounded execution under existing policy.

One P implementer exclusively owns:

| File                                                                                                                                                                                                                                                                    | Allowed change                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/cli/src/server.js`                                                                                                                                                                                                                                            | Seven finite routes below, startup verification, structured listen error rejection; no static directory router                                     |
| `packages/cli/src/index.js`                                                                                                                                                                                                                                             | Awaited CLI dispatch, structured errors and independent browser/server cleanup                                                                     |
| `packages/cli/src/harness.js`                                                                                                                                                                                                                                           | Sequential existing pako/UPNG script load; manager/recorder/track cleanup only                                                                     |
| `packages/cli/src/__tests__/cli.test.js`                                                                                                                                                                                                                                | Preserve cases/assertions; adapt async completion, bound legacy subprocess, remove obsolete exit-throw suppression once no floated promises remain |
| New tests in `packages/cli/src/__tests__/`: `server.test.js`, `harness.test.js`, `cli-cleanup.test.js`, `cli-render.integration.test.js`, `cli-failures.integration.test.js`, `cli-integration-helpers.js`, `fixtures/shape-v2.bforge`, `fixtures/model-v2.bitmapforge` | Dedicated bounded regressions/real subprocess/decode helper and exact fixtures below                                                               |
| New `packages/cli/README.md`                                                                                                                                                                                                                                            | Source-checkout Linux boundary, progress/cancellation limits, execution commands and known baseline debt                                           |

`harness.html`, `headless-entry.js`, `vite.config.js`, all engine/parser/loader/generator files, manifests/lock, FTP fixtures/tests/probe/server, tooling/QA plans and root docs are read-only in P. Build output is generated evidence, not source ownership. No font/image/general model route, engine cleanup redesign, encoder replacement, dependency update, npm publication, workflow, deployment or broad signals architecture. If this allowlist cannot establish the required baseline, stop and amend P for independent acceptance, not C.

## 2. Exact routing and compression contract

`server.js:12–25` currently has five routes, a lowercase nonexistent UPNG filename and no Three core/pako. Freeze **exactly seven** GET URLs; paths below are resolved constants, never derived from request input:

| Exact raw request URL | Source relative to repository root         | Content-Type             |
| --------------------- | ------------------------------------------ | ------------------------ |
| `/harness.html`       | `packages/cli/src/harness.html`            | `text/html`              |
| `/harness.js`         | `packages/cli/src/harness.js`              | `application/javascript` |
| `/headless.js`        | `packages/cli/dist/headless.js`            | `application/javascript` |
| `/three.module.js`    | `node_modules/three/build/three.module.js` | `application/javascript` |
| `/three.core.js`      | `node_modules/three/build/three.core.js`   | `application/javascript` |
| `/pako.js`            | `node_modules/pako/dist/pako.min.js`       | `application/javascript` |
| `/upng.js`            | `node_modules/upng-js/UPNG.js`             | `application/javascript` |

Use own-key membership (not inherited object properties) for route selection. Preserve raw-URL exact matching: `/`, `/assets/font.js`, `/toString`, `/__proto__`, `/headless.js?x=1`, percent-encoded/traversal-shaped URLs and every other non-listed URL return **404** with `Not found`; do not decode/normalize/fallback to filesystem. No generic asset-prefix server. Preserve existing non-GET behavior rather than adding a method framework; GET is the supported/tested contract. Verify all seven files before listen, with route/path actionable errors; missing required asset means no listener is opened. A known file becoming unreadable after startup returns **500** / `Error reading file`, not arbitrary content or a dishonest 404. Loopback `127.0.0.1`, ephemeral port, close handle remain. Listen errors reject start rather than float an unhandled error. Request logs are test-side instrumentation, not new production telemetry.

`three.module.js`'s `./three.core.js` import resolves only through the new explicit core URL. In `harness.js:3–11,42–53`, load `/pako.js` as a classic script and await successful `window.pako.deflate` availability **before** inserting/loading `/upng.js`; validate `window.UPNG.encode`, reject load/global failures with the exact script URL. Use the existing installed packages; no bundling/dependency alternative. Repeated APNG calls reuse successfully loaded globals without concurrent duplicate script races; rejected loads remain reportable (do not cache a permanently successful undefined global). Tests assert insertion order, globals, load errors and real tiny RGBA APNG encode with the actual classic scripts. Retain copied ImageData buffers, delay handling and existing encoders.

Embedded OBJ uses the already bundled Three addon loader via `headless.js`, a Blob URL and no external material/texture references (`modelLoader.js:54–103`). It needs **no `/models/*` route**. GLTF external resources, font lazy chunks/text, image input and general serving remain unsupported/unverified here; document this, do not route dynamic font chunks to make unrelated functionality appear covered. Capture the final built module requests for shape/OBJ and fail any unexpected required URL rather than widening the map opportunistically.

## 3. Frozen fixture contract (new test files only after P ACCEPT)

Original `fixtures/shape.bforge` remains byte-for-byte historical evidence: parser returns empty settings/model-null/default model, and nested `box` is unsupported. Preserve original header/acTL smoke/assertions and report its failure/blank-output limitation separately. Do not claim it validates a box or extend shapeGenerator. New shape is `cube` with **`shapeParams:{size:2}`**; width/height/depth are not cube parameters. Cube is not the asymmetric model proof.

Exact new JSON bytes are UTF-8 compact JSON in the key order printed below, one LF at end, no BOM. Paths are relative to CLI `src/__tests__/fixtures/`:

### `shape-v2.bforge`

SHA-256 `44089df7b4d4f4c4b952c102835086c67cb1ab24da3cce85b06800c8942e8751`

```json
{
  "version": 2,
  "settings": {
    "inputType": "shape",
    "shapeType": "cube",
    "shapeParams": { "size": 2 },
    "backgroundColor": "#101820",
    "colors": ["#203040", "#e0a040", "#ffffff"],
    "seed": 42,
    "pixelSize": 2,
    "ditherType": "bayer4",
    "renderMode": "bitmap",
    "useFadeInOut": false,
    "animationSpeed": 3,
    "animationEffects": {
      "spinX": false,
      "spinY": true,
      "spinZ": false,
      "float": false,
      "bounce": false,
      "pulse": false,
      "shake": false,
      "orbit": false
    }
  },
  "model": null
}
```

### `model-v2.bitmapforge`

SHA-256 `e654d3bc6345537c70645d6953d3b735f943e0953c3ef3d1db3ef7f9acf9bafe`

```json
{
  "version": 2,
  "settings": {
    "inputType": "model",
    "backgroundColor": "#101820",
    "colors": ["#203040", "#e0a040", "#ffffff"],
    "seed": 42,
    "pixelSize": 2,
    "ditherType": "bayer4",
    "renderMode": "bitmap",
    "useFadeInOut": false,
    "animationSpeed": 3,
    "animationEffects": {
      "spinX": false,
      "spinY": true,
      "spinZ": false,
      "float": false,
      "bounce": false,
      "pulse": false,
      "shake": false,
      "orbit": false
    }
  },
  "model": {
    "name": "asymmetric-tetra.obj",
    "type": "text/plain",
    "format": "obj",
    "data": "byBhc3ltbWV0cmljX3RldHJhCnYgMCAwIDAKdiAyIDAgMAp2IDAgMSAwCnYgMCAwIDMKZiAxIDMgMgpmIDEgMiA0CmYgMSA0IDMKZiAyIDMgNAo="
  }
}
```

The model's base64 decodes to the following exact UTF-8/LF OBJ (including final LF), SHA-256 `502592e4e496dbb0455f71890c3d6e5710b6359689875a10f25dea8e6fa25865`. It is an authored four-vertex/four-face asymmetric closed tetrahedron, not a downloaded/licensed asset or symmetric Y-axis cone. No MTL, textures, external URLs or decoder assets:

```obj
o asymmetric_tetra
v 0 0 0
v 2 0 0
v 0 1 0
v 0 0 3
f 1 3 2
f 1 2 4
f 1 4 3
f 2 3 4
```

Before accepting P implementation verify parser settings/model fields, real OBJ loader triangles, outward face orientation/nonzero volume, closed edges, finite nondegenerate bounds and no external requests. Actual rendering and numeric thresholds are **unverified** in this plan. `animationSpeed:3`, fade disabled and only spinY enabled imply `loopMs=2094`; at fps 10 request 21 captures/delay100ms; at fps12 request25/delay83ms. Assert these through the actual engine during approved execution; project `fps`/`frameCount` are absent deliberately. No baseRotation claim: harness does not apply it. If fixture/threshold is inadequate, retain failed evidence and amend/freeze a new hash with reviewer acceptance before C; do not tweak engine or loosen thresholds silently.

## 4. Minimal structured lifetime repair

Source ownership: `index.js:19–97` owns server/browser for each render; `99–123` owns sequential batch; `126–152` owns dispatch. Replace immediate exits with thrown/reportable failures and one awaited top-level dispatch/catch, set `process.exitCode=1` after error reporting/cleanup. Await both render and batch; no floated promises, global rejection swallowing, or `process.exit` in resource-owning paths. Maintain actionable messages and success absolute-path stdout **only after successful write**. Normal success line may precede close as today; cleanup failure must still yield nonzero final child exit (stdout alone is never a pass).

Single outer render lifetime includes start/launch/newPage/navigation/evaluate/write. Retain handles as acquired. In `finally`, independently attempt `browser.close()` then `server.close()` even if first rejects; preserve the primary error and report secondary cleanup failures, or fail a previously successful operation on cleanup error. Browser close owns its pages (no redundant unbounded page-close step). Server start failure has no acquired handle; launch failure still closes server. Do not mask launch failure with a close exception. Unit-injected close rejection proves both attempts, not actual OS teardown after a deliberately broken close.

`harness.js:102–160`: manager declared outside try, assigned only after successful construction, disposed exactly once in finally for every postconstruction path (model, shape, settings, capture/encode/base64 success/error). Preserve `{ok:true,...}` / `{ok:false,error}` contract, return cleanup failure as error instead of a fulfilled success; primary failure remains recognizable if dispose also throws. Do not rewrite SceneManager internals or claim resources from a constructor that never returned were disposed.

`captureFrames:14–39`: keep pause/try/finally resume behavior and copied pixels. `encodeWebm:56–99`: protect **from stream acquisition onward**, including MediaRecorder construction/start, draw/render, recorder error and stop, blob conversion. Install stop/error listeners before start/stop; stop recording only if active, settle event wait on stop/error, then clear listeners/timers and stop **every stream track** in finally even if recorder construction/stop fails. Resume manager if paused on all branches, independently of track/recorder failure. A bounded **5s** recorder-stop/error wait rejects; no promise waiting forever and no dropped unhandled event rejection. Manager disposal remains outer lifetime owner. Do not change codec, frame schedule, padding or encoding algorithm.

### Cancellation policy (explicitly bounded exclusion)

P and C guarantee structured cleanup for **settled ordinary success/errors only**, plus local recorder-stop timeout. They add **no SIGINT/SIGTERM handlers, AbortController protocol or render cancellation API**. External signal, killed browser, infinite/hung evaluation, host loss and SIGKILL do not receive a graceful-cleanup guarantee. The integration helper owns a 60s per-child deadline, output cap 1MiB per stream, and isolated process group. On timeout/output overflow/spawn failure, record failure, TERM only its owned group, allow 5s, then KILL remaining owned descendants and await child close; retain PID/port leaks/evidence. Emergency reaping is **failed application cleanup**, never a passed cancellation case. No broad pkill/cache deletion. This exclusion is documented and must be accepted explicitly with P; requiring graceful external interruption is a separate independently reviewed slice, not conditional C repair.

## 5. Finite evidence ledger and commands

Run before repair at the transferred accepted A/B tree using locked Puppeteer22, and after P at identical Node/npm/browser/tool identities. For the before-P tree, supply the frozen new fixture bytes from the evidence directory (not a source modification) and record their hashes. Before tree may stop at missing asset/UPNG; preserve exact stderr/request/console evidence, mark downstream pixel assertions blocked (not fabricated before-renders). Benign injected branches establish red/green causal regressions. No diagnostic source/route patch counts as final artifact proof.

Let `NODE` be the handoff's absolute approved executable; `CLI` absolute `packages/cli/src/index.js`; `S` and `M` the exact fixtures above; `E` an isolated directory under profile scratch outside tracked files, and each row its own fresh cwd/destination. Every child runs with isolated TMPDIR and the proven locked-Puppeteer22 browser cache, no inherited executable override. Retain JSON manifest, commands/env-redaction, file/source/build/fixture hashes, exits/signals/times, stdout/stderr, request/console logs, ffprobe JSON, APNG chunk/delay reports, decoded frames/stats, descendants/ports and immutable artifacts at `E/{before-P,after-P}/CASE/`. Rendering child deadline60s; decoder deadline20s per command; cleanup polling5s. Planned thresholds below become C's frozen baseline only after independent P implementation acceptance.

| ID      | Actual arguments following `$NODE $CLI`                                                    | Expected artifact                                                         |
| ------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------- |
| P01     | `render $S` (cwd E/CASE)                                                                   | `shape-v2.apng`,400x400,fps12                                             |
| P02     | `render $M --format apng --fps 10 --width 160 --height 120 --out "nested path/model.apng"` | 160x120,fps10                                                             |
| P03     | `render $M --format webm --fps 10 --width 160 --height 120 --out "nested path/model.webm"` | 160x120,fps10                                                             |
| P04     | `render $S --format webm --fps 12 --width 160 --height 120 --out shape.webm`               | 160x120,fps12                                                             |
| P05/P06 | `render $M --format apng                                                                   | webm --fps 12 --width 161 --height 121 --out odd.apng                     | odd.webm` (two commands)                                                                  | APNG161x121,WebM162x122 |
| P07/P08 | `batch $D --format apng                                                                    | webm --fps 10 --width 160 --height 120 --out "batch path"` (two commands) | D contains S copied as a.bforge,M as b.bitmapforge,notes.txt; exactly a/b outputs,160x120 |
| P09/P10 | `batch $D --format apng                                                                    | webm --fps 12 --width 160 --height 120` (two fresh D)                     | default D/out a/b outputs only                                                            |
| P11     | legacy INTEGRATION smoke with original fixture/arguments/assertions                        | bounded original result; not a meaningful-output acceptance gate          |

Do not depend on directory ordering; a and b decoded outputs must differ. For fail-fast batch use a focused unit injected readdir order to require valid→failure→later-not-started; real batch fixture may fail in either order, and evidence must identify which completed artifacts legitimately remain. No transactional/overwrite redesign.

For every P01–P10 subprocess-written output: independent FFmpeg APNG composited RGBA decode with `-ignore_loop 1`, passthrough timing and structured IHDR/acTL/fcTL parsing, or video-only ffprobe streams/frames/packets JSON plus FFmpeg passthrough RGBA decode. Do not use the known multi-frame UPNG.toRGBA8 crash path or header-only acceptance. APNG dimensions, positive rational delays, declared/decoded counts and sum duration must match capture schedule (fps10 21x100ms;fps12 25x83ms), within1ms/frame; explicitly reconcile any encoder-coalesced identical frames/duration. WebM: real video codec/even dimensions/multiple frames/monotonic timestamps; last timestamp+packet duration (record estimated last interval if absent) within max(250ms,20% of2094ms); average cadence within25% of requested fps. No deterministic WebM exact-frame assertion.

For each artifact beginning/middle/end and separated frames: foreground occupancy>=1% against #101820, >=2 well-separated meaningful colors/luminances, luma stddev>=5, and >=0.5% pixels changing by >16 luma between separated samples; reject transparent/uniform and codec-noise-only output. Store numeric statistics. Thresholds require baseline validation; **P cannot be accepted complete if they fail**. Successful encoding alone is insufficient. Stdout contains only completed absolute paths, processing/browser/errors on stderr. Preserve **absent harness frame-progress calls**, document limitation, assert no fictitious progress; no wiring callback in P/C.

### Failure ledger (before/after, fresh destinations)

| ID  | Benign case / required result                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 | missing render target/file,unsupported gif: nonzero/actionable usage/read/format error, no browser leaks                                                                                                                              |
| F02 | malformed JSON and missing version (two cases): returned render error/nonzero, no success/artifact, close browser/server                                                                                                              |
| F03 | empty batch; nonexistent batch **default** creates target/out then reports empty (preserve observed behavior); nonexistent batch with external explicit out reports cannot-read (three cases)                                         |
| F04 | empty isolated browser cache,no executable override: actual launch failure,server closed; restore only owned cache with approved installer for success recovery                                                                       |
| F05 | each of seven required assets missing in disposable copied tree: prelisten route-specific error; known asset read failure after start gives500; unlisted/prototype/query/traversal URLs404                                            |
| F06 | unsupported embedded filename `invalid.bad` (valid harmless base64): deterministic real loader error after launch; do not rely on permissive OBJ parsing to reject text                                                               |
| F07 | file-as-output-parent (mkdir failure); output path is existing directory (write failure after render): two nonzero cases,no false new success,resources closed                                                                        |
| F08 | real navigation failure via test-owned wrapper closing its server before goto; wrapper uses real Puppeteer and CLI source without production fault flags; unit goto/evaluate rejects too                                              |
| F09 | unit-injected start,launch,newPage,expose,goto,evaluate reject; `{ok:false}`;write reject;browser close reject;server close reject;double failure: assert independent attempts/primary+secondary errors/final nonzero                 |
| F10 | harness injected model/settings/capture/getImageData/UPNG/recorder constructor/start/render/draw/error/stop/stop-timeout/blob failure,dispose throw: dispose once, paused loop resumed,tracks stopped even on earlier cleanup failure |
| F11 | runner timeout/output overflow/spawn error: failed test and scoped emergency reap; explicitly not application cancellation acceptance                                                                                                 |

Failure post-launch polling requires browser descendant and owned port closure within5s after settled operation. No handled errors masquerading as unhandled rejection. Test original `process.exit` leak with real subprocess: mock exit throwing unwinds finally unlike OS exit, so a unit-only pass cannot clear F02/F06. Capture cleanup branch counts/events in harness unit tests plus real browser page instrumentation/track.readyState and no active recorders after success/failure. Unit VM compression smoke with actual browser globals/scripts supplements, never replaces, P02 real APNG. Keep every historical CLI assertion while replacing timeout-as-success with awaited dispatch completion and proper argv/exitCode restoration; no accumulating global unhandledRejection listener.

Required approved commands: existing `npm test --workspace=@bitmapforge/cli`; explicit `INTEGRATION=1 npm test --workspace=@bitmapforge/cli -- src/__tests__/cli-render.integration.test.js src/__tests__/cli-failures.integration.test.js`; separately `INTEGRATION=1 npm test --workspace=@bitmapforge/cli -- src/__tests__/cli.test.js`; `npm run build --workspace=@bitmapforge/cli`; root lint/format/tests and inherited A/B relevant build/browser gates. Execute explicit integration files with gating env and confirm nonzero discovered/executed case count; root discovery alone omits CLI. Record per-command exit. Verify FFmpeg/ffprobe APNG/WebM support before execution; missing tools/runtime/browser are blockers, not skipped passes.

## 6. P acceptance / checkpoint transfer

Independent P plan ACCEPT, A/B handoff, exact runtime/tool identities and cancellation exclusion approval precede implementation. Independent P implementation reviewer must accept: exact owned diff; unchanged manifests/lock/Puppeteer22/security pins; seven-route MIME/404/read/listen tests; corrected fixture hashes/parser/geometry; real APNG/WebM ledger with validated thresholds; before/after benign failure regressions and real leak-free settled failure results; preserved legacy/security tests and honest legacy result; no-progress/cancellation/font/package boundaries documented. Attach exact checkpoint SHA, full source/build/fixture hashes and evidence location. Missing real gates block acceptance, not conditional C fixes.

C starts only from this accepted P checkpoint **plus independently accepted A/B ancestry**, freezes its fixture/threshold/command ledger from these artifacts, and obtains its own preimplementation ACCEPT. Roll back only P-owned changes to transferred A/B checkpoint; do not reset other workers, change dependency debt, remove historical tests or turn emergency reaping into a pass. No issue closure/publication/release permission.
