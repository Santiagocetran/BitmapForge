# IC1 PNG-retaining native verification — finite final batch

## Outcome

**Three passed; Chromium desktop failed full artwork equality. IC1 remains blocked.** The authorized single fresh serial batch is complete; no rerun, repair or further infrastructure attempt was made. Exact PNG retention succeeded for all four rows. The browser lane is released after strict owned cleanup.

All paths below share `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- C: `image-cancel-contract-png-v1` (accepted candidate).
- B: `image-cancel-contract-reentry-v1` (historical read-only baseline).
- R: `bitmapforge-research`.
- E: `C/tests/evidence/native-png-final-20261116`.
- Chromium output: `C/runs/p16c/final/smoke/chromium/a01`.
- Firefox output: `C/runs/p16f/final/smoke/firefox/a01`.

Evidence is local scratch and potentially expiring; these paths are not remotely published artifacts.

## Authority, identities and unchanged policy

The current user authorized one four-row batch and the parent explicitly transferred the sole serial browser lane. Fresh profile manifests showed only this worker, `deleg_06fc3e74`, running; terminal interrupted tasks were excluded. Existing unrelated servers were neither reused nor stopped. Prelaunch process, listener, memory and disk readbacks are in `E/prerequisites.json`; capacity checks passed before launch. No inherited QA/ownership/helper output override was reused; explicit contained tmp/cache roots were supplied and the unchanged config issued its own ownership capability.

Verified the independent ACCEPT document SHA-256 `2f8f40dec22b86f1683929fa197b3a5264e281dd7088accd2874b52610716762`, complete 72-file candidate source inventory, all 139 preservation mappings, complete 6,779-file B inventory, existing 9,740-entry B seal, finite accepted offline evidence index, fourteen historical source/tool pins, cube fixture and both retained browser binary pins. Candidate source, B inventory, mapping and accepted offline index were checked again after execution. The historical 834-entry pre-inventory was also rechecked successfully after execution. No old seal was regenerated.

The unchanged 35-file `h1-integrated-20261115T180652Z/immutable-candidate/dist` matched its complete retained inventory before and after each engine. Fixture remains `R/test/fixtures/models/export-visual-cube.stl`, 1,577 bytes, SHA-256 `4d2d98182b4b93e8b45e881b1f92838b7e951ab246bb73f81663b3e3f5bef708`.

Actual Node was `v24.22.3`, explicit executable `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node`, with sibling `node_modules/.bin` prepended to PATH. Installed Playwright remained 1.59.1. Retained caches were `tooling-b-browser-execution/chromium-cache` and `bitmapforge-hardening-qa/browsers/pw-1.59.1`. The pinned Chromium headless-shell and Firefox binaries were hash-verified; sampled executable/argv identities are retained in engine completion records.

One direct installed-CLI invocation per engine, Chromium then Firefox, from R:

```text
<NODE24> <R>/node_modules/@playwright/test/cli.js test --config <C>/harness/playwright.smoke.config.mjs
```

Literal argv/env are in `E/{chromium,firefox}-launch.json`; the reused operational procedure with fresh candidate/owner/root pins is `C/tests/evidence/native-png-observer.py`. Neither `run.mjs` was invoked. Policy stayed one worker, zero retries, desktop/narrow DPR1, full eight-field equality, unchanged meaningful-preview thresholds, animation and browser flags, runner-owned `retain-on-failure` tracing, 90s tests, 5s expectations, 10s actions, 15s navigation, 30s launch/readiness and 10s shutdown. No dependencies or build were changed.

## Literal row results

| Engine   | Row        | Result | Duration ms | First failure / unreached assertions                                                                                                                                                                  |
| -------- | ---------- | ------ | ----------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chromium | Q1.image.D | Failed |        7284 | Full snapshot equality, `repair-contracts.mjs:316`, called from `ui.mjs:337`. Settings closure after equality, return-cube upload/meaningful preview, final no-alert and loaded screenshot unreached. |
| Chromium | Q1.image.N | Passed |        6524 | None; all successors completed.                                                                                                                                                                       |
| Firefox  | Q1.image.D | Passed |       12353 | None; all successors completed.                                                                                                                                                                       |
| Firefox  | Q1.image.N | Passed |        4823 | None; all successors completed.                                                                                                                                                                       |

Chromium CLI exit1; Firefox CLI exit0. Each selected row has exactly one result and retry0. No shared prelaunch, worker-init, retention or containment failure occurred. Full errors, captures, field comparisons and unreached assertions are in `E/png-analysis.json`; original reports remain under each engine output.

## Exact PNG finding

All eight raw PNGs and eight five-field sidecars were retained under each output's `diagnostics/`, named `<row>-image-{before,after}-cancel.{png,json}`. Independent readback matched each PNG's actual length and SHA-256 to both its sidecar and original snapshot `artwork`; comparison used actual bytes, not only digest strings. Retention was complete, including the failed row.

Chromium desktop's only differing snapshot field is `artwork`. Both captures are 902×676 and 18,119 bytes:

- Before: `b8bf80f35ab9264d8f0ad9effdc5782a9f505c646afd2790bee166b26f002a4f`.
- After: `512ba82d0fcbcc098c5a4c54a5ef28e84a0d9399c798a4840cb9fc3cbce19f3e`.

Offline decoding with the existing installed `upng-js` found **two changed pixels, two changed RGBA channels, maximum channel delta1, absolute delta sum2**, confined to x=0, y=5–6 (zero-based). Dimensions and IHDR agree; the PNGs contain IHDR, six IDAT chunks and IEND, without ancillary chunks. IDAT payload hashes differ. This is a genuine decoded difference, not merely different metadata encoding. It remains a failed raw-equality gate regardless of its small extent. It does not establish artwork replacement, an attributed application defect, harmless animation, or a specific renderer cause.

The other three rows have byte-identical before/after PNGs and zero decoded differences. Chromium narrow is 357×586 / 15,885 bytes; Firefox desktop 902×676 / 31,534 bytes; Firefox narrow 357×586 / 22,628 bytes. Complete chunks, raw/decoded hashes and metrics are in `E/png-analysis.json` (SHA-256 `26ffe50f17764719315b800f5b544cc6ddf5909c646c7b2c809c54ed66decd1e`). Offline decoder script: `C/tests/evidence/native-png-analysis.cjs`. A Python Pillow availability probe failed because Pillow was absent; no install was attempted and existing UPNG completed the analysis.

### Context-event correlation

No context-lost or context-restored console event was retained in any of the four row diagnostics, nor in the failed row's trace records. This absence does not prove no unobserved context event occurred. The failed trace's actual snapshot API intervals were 11768.963–12096.260ms and 13230.604–13487.261ms on its monotonic clock; empty chooser cancellation occurred between them. `E/trace-snapshot-intervals.json` retains the actual before/after records, and `E/trace-correlation.json` retains other selected trace context/action records.

Unlike the historical Chromium failure, this fresh inequality has no retained context-loss/restoration correlation. Therefore the earlier context events cannot be promoted into a demonstrated cause of this failure or of the historical failure. No additional capture or native diagnostic run was made.

## Served identity, evidence and cleanup

Both `server-identity.json` files have matching complete pre/post manifests and verified HTTP bytes for `/index.html`, `/assets/index-BKDpitmq.js`, `/assets/three-DDsitln8.js`, and `/assets/index-DOJMVuZp.css`, matching the immutable build. This is served-byte provenance, not a new source build.

`E/run-artifacts.json` inventories 96 actual run files. Retained evidence includes eight genuine `.bitmapforge` downloads and one original failure trace (plus its HTML-report copy):

```text
C/runs/p16c/final/smoke/chromium/a01/results/ui-smoke-Q1-image-D-chromium/trace.zip
```

Passing rows have no retained trace under the unchanged policy. Failure screenshots/trace JPEGs were not substituted for the exact hashed PNGs.

- Chromium port56289: owned server PID150365 exited and closed code0, signal null, `closeCompleted:true`.
- Firefox port49993: owned server PID150972 exited and closed code0, signal null, `closeCompleted:true`.
- All sampled owned PID/start-tick identities were absent after runner completion (19 Chromium, 18 Firefox identities); no emergency cleanup occurred. Sampling does not claim observation of every arbitrarily short-lived child.
- Neither owned port remained LISTEN. Existing unrelated listeners remained untouched; TIME_WAIT is not misclassified as a listener.
- Only exact owned `C/runs/p16c/{tmp,cache}` and `C/runs/p16f/{tmp,cache}` were inventoried and removed after process absence. Reports, PNGs, downloads, owner markers and historical evidence remain intact.
- `E/{chromium,firefox}-completion.json`, temporary inventories, preservation-before/after records, `completion.json` and `final-verification.json` retain readbacks and lane release.

## Readiness disposition boundary

The finite diagnostic evidence gap is closed for this fresh failure, but **IC1 native acceptance remains blocked**. Preserve the prior worker-reload failure, original three-pass/one-fail artwork batch with discarded PNGs, offline failed instrumentation attempt, and historical matrices exactly as recorded. The tiny decoded difference neither clears the unchanged equality requirement nor retroactively characterizes the unavailable historical buffers.

This report is ready for parent PR-readiness disposition, not an undraft/release recommendation. Any oracle change, synchronization change, renderer repair or further native attempt requires separate authorization and review. No source/dependency/build repair, remote action, commit, undraft, merge or deploy occurred. The only repository addition is this report; external additions are the finite operational observer, offline analysis and fresh evidence/run roots described above.
