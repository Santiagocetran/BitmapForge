# Independent CLI canvas artifact audit

## Verdict: ACCEPT — P01–P10 artifact stage only

The fresh fourteen-output evidence satisfies the unchanged P01–P10 artifact contracts. No material artifact-stage revision is required. This verdict does **not** accept F01–F11, legacy P11, complete CLI hardening, palette verification, or the whole release. Source/unit acceptance is inherited from `cli-canvas-implementation-audit.md`, not reopened here. Historical failures remain historical failures.

## Evidence and method

Reviewed `cli-canvas-artifact-verification.md` against the actual retained files, rather than its summary alone:

- Build/runner evidence: sibling `../cli-canvas-artifact-20261115T153808Z/`.
- Actual outputs/decoder/process evidence: sibling `../bitmapforge-cli-stage2-render-zq6DW5/`.
- Protected pre-repair contracts: sibling `../cli-canvas-evidence/protected.sha256`.
- Offline replay script created for this audit: sibling `../cli-canvas-artifact-offline-audit.mjs`.

Read repository governance and the web-product-development skill. COLLAB records were absent. Repository HEAD is `550842cab61002c7cc6563e50b9fcdeb17c9bf01` with the incoming dirty implementation; HEAD alone is not the tested source identity.

Ran the offline script with the retained Node executable, and separately ran `sha256sum -c ../cli-canvas-evidence/protected.sha256`: both completed successfully. The script imports only the existing evidence module's pure validators and calls no session, rendering, decoder, server, browser, or process-launch functions. It independently hashes retained bytes, recalculates pixel metrics from retained RGBA, reparses APNG bytes, reevaluates WebM metadata from retained ffprobe JSON, and reconciles actual recorded process/cleanup events. No fresh decoding or rendering is claimed.

## Source, build and protected-contract identity

- Before/after source inventories are exactly equal. All **93 inventoried source/configuration files** match current byte lengths and SHA-256 values.
- All **eight CLI build files** match `build-after.json`; all protected manifest entries also match current files, including the embed manifest.
- All **137 inventoried run-evidence files** match retained byte lengths and SHA-256 values.
- All four protected checksum entries pass: render suite, evidence helper, shape fixture and model fixture. The helper's own frozen containment-helper/fixture checks also pass. No threshold, fixture, metadata, temporal or containment policy was changed for this run.
- `build.command.json` records exit 0 for the CLI-only workspace build. Its actual log records Vite 7.3.7, 54 transformed modules and eight generated files. `artifacts.command.json` records exit 0 for the dedicated render suite, using Node v24.22.3. The actual verbose log records **41 passed / 2 skipped**; the skips are optional synthetic decoder self-tests, not P outputs.

Critical identities independently rehashed:

| Target                                      | SHA-256                                                            |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Direct-served `packages/cli/src/harness.js` | `711f8a4ba7704f99a258f73ded496468ef58efdaa6456ad9adcfa9154c8f9671` |
| Built `packages/cli/dist/headless.js`       | `9681565ac5e39d8f6e36a8f4475c554959f67baf48f2064259117bb402661a46` |
| Render suite                                | `513934ed953b3371d7207874ef5605bad5146d6cfb0a8d38afd9779e68624ae8` |
| Evidence helper                             | `94c65b01355ea0df04fadddf49dcfcb49542a9a172f8b53cd8d085ff3dd7a701` |
| `ledger.json`                               | `fdf5a7ecaf2ab9399afec82bd68e5a11c68fc802afd52e954ca4904a6d855e21` |

The server explicitly serves `/harness.js` from source and `/headless.js` from CLI dist. The build entry exports SceneManager and embed projectParser, not the capture harness. Thus the harness repair is tied to the direct-served source hash, not falsely attributed to a changed bundled harness. Retained request events satisfy the frozen route/status contract.

## Fourteen-output reconciliation

Parsed the ledger programmatically: exactly fourteen distinct case/output pairs, exact case set P01–P10. For every row, both artifact and complete decoded RGBA SHA-256 values match **both** the ledger and its own `pixels.json`. Artifact lengths match, and recalculated pixel samples, meaningful color bins and all sampled-pair fractions equal the retained reports exactly. All ledger minima/maxima, dimensions, counts and durations reconcile with their source reports.

| Case | Output(s)                                | Dimensions | Frames per output | Artifact verdict |
| ---- | ---------------------------------------- | ---------- | ----------------- | ---------------- |
| P01  | `shape-v2.apng`                          | 400×400    | 25                | ACCEPT           |
| P02  | `nested path/model.apng`                 | 160×120    | 21                | ACCEPT           |
| P03  | `nested path/model.webm`                 | 160×120    | 21                | ACCEPT           |
| P04  | `shape.webm`                             | 160×120    | 25                | ACCEPT           |
| P05  | `odd.apng`                               | 161×121    | 25                | ACCEPT           |
| P06  | `odd.webm`                               | 162×122    | 25                | ACCEPT           |
| P07  | `batch path/a.apng`, `batch path/b.apng` | 160×120    | 21                | ACCEPT           |
| P08  | `batch path/a.webm`, `batch path/b.webm` | 160×120    | 21                | ACCEPT           |
| P09  | `input/out/a.apng`, `input/out/b.apng`   | 160×120    | 25                | ACCEPT           |
| P10  | `input/out/a.webm`, `input/out/b.webm`   | 160×120    | 25                | ACCEPT           |

The complete exact hash pairs remain in the independently checked ledger and verification document; the ledger hash above pins those entries. All four batch shape/model pairs have distinct decoded hashes, independently checked rather than inferred from output names.

### Unchanged quality and metadata gates

Reapplied the frozen pixel validator to recomputed raw-stream metrics: every beginning/middle/end sample has opacity at least 0.99, distance-from-background occupancy at least 0.01, meaningful separated colors and luma standard deviation at least 5. Meaningful bins occupy at least 0.005 of pixels and their color separation is at least 48. Occupancy is the checker's distance-from-#101820 statistic, **not object segmentation**.

Temporal acceptance remains existential: at least one sampled pair changes more than 16 luma units over at least 0.005 of pixels. It does not require every transition to change. All fourteen streams satisfy this unchanged condition.

APNG reparsing exactly reproduces each `structure.json`: chunk/sequence, bounds, disposal/blend, declared/decoded count and coalesced-delay contracts pass, including odd 161×121. Independently checked CRCs with Python zlib as an additional offline integrity check: **seven APNGs, 368 chunks, all valid**. The frozen `parseApng` itself does not explicitly calculate CRCs; this audit supplies that check rather than attributing it to that parser.

WebM timing recomputed from retained ffprobe JSON exactly reproduces each structure report: permitted codec, even dimensions, strictly increasing timestamps, duration within max(250ms, 20% of 2094ms), and cadence within 25% of requested fps. Estimated final intervals remain explicitly estimated where packet/frame duration is absent. Raw decoded frame counts reconcile with metadata. All **21 retained decoder subprocess results** satisfy the original settlement predicate; these are retained real FFmpeg/ffprobe executions, not newly run decoders.

## All ten real cleanup results

For each of P01–P10, independently applied the original settlement predicate to `process.json`: exit 0, real close observed, null failure/signal, empty containment errors, no emergency reap and no surviving owned group. Reconciled recorded PID sets and listening ports against original `cleanup.json`: every observed PID is recorded absent and every owned port closed.

For every case, server-close and browser-close event counts equal its output count. Page-state records show ended tracks and inactive recorders; WebM cases retain nonempty track/recorder observations. Actual capture schedules satisfy the original 2094ms schedule with 21 or 25 captures. Output stdout paths and both distinct batch Processing messages reconcile with expected outputs. The separate ten-row `cleanup-readback.json` confirms recorded subsequent process absence and closed ports; the stage2 lock is also currently absent. This is an audit of retained cleanup observations, not a new lifecycle experiment.

Runner stderr is zero bytes. CLI favicon404 diagnostics and batch Processing messages remain in the original process records. The original helper explicitly supplies child **CI=1** and short owned TMPDIR; all ten process records retain that identity. There was **no new CI/sandbox-policy change**. This audit does not claim sandbox-enabled execution or confuse the outer runner's unset CI with the children's CI=1.

## Boundaries and files

No browser, build, install, palette test, retry, source edit, source/unit rerun, sampler or release action was performed. The palette approval block remains untouched. F01–F11 and legacy P11 are separate and unexecuted in this fresh artifact attempt. No historical failure was overwritten or reclassified.

Created only this repository audit document and the external offline replay script. No material artifact blocker was found. **ACCEPT applies only to the fresh P01–P10 artifact stage.**
