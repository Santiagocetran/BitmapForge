# Reviewed Chromium prerequisite — one fresh attempt

## Outcome and scope

**PASS for the ordinary Chromium launch/render/close prerequisite only. Browser lane released. Full QA and the destructive lifecycle matrix remain incomplete.**

Executed exactly one fresh reviewed-harness Chromium preflight, runner/outer command exit0, discovered/reported1/1, one pass, no retries. No smoke33, Firefox, final-candidate comparison, install, rebuild, OS repair, application edit or harness/lifecycle/assertion/classification change occurred. Authority is the explicit parent separation in `parent-browser-prerequisite-decision.md` and the current one-attempt instruction; it does not erase prior failures or grant subsequent browser runs.

Paths:

- `QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`
- Fresh `RUN=QA/runs/reviewed-preflight-20261115T093956Z`
- Actual `OUT=RUN/baseline/preflight/chromium/reviewed-a01`
- Immutable target `/home/agent/BitmapForge-hardening-research/baseline/dist`, not rebuilt.

## Actual identities and unchanged contracts

- Actual current harnessHash: `4963e730deebf362202696610f6d3e38ec85af89a5f1730929f0d1fa0d5bbe42`,33 current harness entries, recorded before/after and unchanged. This is the current inventory, **not** the obsolete pre-lifecycle28-file digest.
- Accepted lifecycle freeze `8dffea64d1cee4ff71e88207ba656c7a01b5a83487de64f2a67c8826017f3576`: all19 named files freshly verified before execution.
- Source HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01`; dirty tracked diff digest `4dc41a48f938a0672fa8da6ce5b005c6b0e7fb2e53fa646fd8f119fb2413cca5`. All170 harness-inventoried source/dependency entries unchanged during execution. Current working-tree source is not claimed to equal the historical source; the served target is the immutable shipped dist. Dirty status is preserved in environment.json; the tracked diff digest does not inventory untracked files.
- All37 dist paths match before/after, and server manifest equals manifestAfter. Served index, entry JS, Three.js, CSS and ci-revision each match their expected bytes.
- Actual Node v24.22.3, npm11.21.2, Vite7.3.7, Playwright1.59.1; Node `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`. Current B dependency environment retained, no installation.
- Exact parent cache `QA/browsers/parent-baseline-pw-1.59.1`; no fallback. Actual browser147.0.7727.15 equals locked revision1217 expectation. Live `/proc` executable/argv evidence identifies the headless-shell, not merely the API's full-Chrome executablePath. Binary hashes are retained in `OUT/diagnostics/live-engine-processes.json`; API path/hash separately in environment.json.
- Original Chromium args unchanged: `--use-gl=swiftshader`, `--disable-gpu-sandbox`, `--no-sandbox`; original launch timeout30000ms; retries0, workers1, strict owned5291, reuseExistingServer:false. Command/config/environment retained.
- A private short owned TMPDIR under profile scratch avoids socket-path inflation without changing browser flags or launch budgets; it is named in preflight-identity.json. No shared browser cache was changed intentionally.

## Meaningful app/WebGL evidence

`OUT/diagnostics/webgl.json` records WebGL2.0/OpenGL ES3.0 Chromium, ANGLE Vulkan1.3.0 SwiftShader Device (Subzero). Actual cube fixture identity is unchanged (`export-visual-cube.stl`,1577bytes, SHA256 `4d2d98182b4b93e8b45e881b1f92838b7e951ab246bb73f81663b3e3f5bef708`).

The actual immutable app loaded the cube through the real chooser. The unchanged meaningful-preview checker passed with nonBgRatio0.11986184547160157,115colors, entropy0.8879983294198653,902×676canvas. Diagnostics report no runtime errors and no WebGL context events. The loaded screenshot was visually inspected: a substantial green rasterized cube-model silhouette occupies the black preview, not a blank canvas. ReadPixels performance warnings are retained in console telemetry; they are not unreported errors or a proven explanation for earlier launch timeouts.

**Artifacts:**23 actual preflight files, including2screenshots, JSON/HTML report, discovery, ledger, command, environment, stdout/stderr, WebGL/pixel/process diagnostics, server identity and actual exit telemetry. **Zero retained trace ZIPs:** the unchanged reviewed policy is `trace: retain-on-failure`, and this attempt passed. No trace-policy override or extra intentional-failure probe was authorized; therefore successful-run navigation/snapshot trace evidence is unavailable, not invented. No axe scans or download artifacts were produced.

## Ordinary lifecycle and cleanup

`OUT/server-exit.json` records actual production child PID2840049, actual exit AND close code0/signal:null, requested SIGTERM, closeCompleted:true, exit09:40:24.962Z and close09:40:24.963Z. Final server identity contains closeFinished and unchanged manifests. Actual unchanged consumer reports serverClean:true; reconciliation equal:true/incomplete:false.

External polling separately distinguishes shell PID2840040, actual Node supervisor2840041, detached production child2840049 and headless-shell2840122.117samples retain15 exact PID/startTicks/PGID/SID identities and reserved-port socket observations. Polling does not synthesize actual supervisor exit/close events; strict application child completion is established by the real supervisor telemetry above.

At09:41:49UTC fresh `/proc` checks found no retained exact identities, including zombies; no listeners5291/5292/5293 and no remaining reserved-port TCP records. Initial completion had a harmless5291TIME_WAIT record (state06, inode0), **not** a listener. No emergency termination occurred. Initial empty-directory removal found only Node compile/Playwright transform caches; their contents were inventoried, then only this owned temporary directory was removed and absence verified. `RUN/verification.json` is the final release readback; completion.json intentionally retains the earlier intermediate cleanup observation. Browser lane is released, not reserved for smoke.

## Read-only four-runtime and historical completion

This task completed the formerly unavailable verification slice without rerunning any lifecycle/server scenario:

- `RUN/four-runtime-artifact-sha256.json` inventories32actual files: all four runtime output trees plus the external approval/environment/collector records. SHA256 `f251ec0cbb3a9980be38797a2262628c0e257bd5e165388cad155575e207e958`.
- Historical210-entry inventory freshly checked:208original paths unchanged; the two authorized canonical driver/test deltas are explicitly separate. The original bytes and sizes for `server-lifecycle-control.mjs` and `server-lifecycle.test.mjs` freshly match their saved `repairs/lifecycle/runtime-contract-implementation/before/` files (additional matching copies listed in verification.json). Not an assertion that all210original paths are unchanged.
- Actual current unchanged consumer block replayed inertly against all four retained real runtime directories: shell-group clean/command0 with actualCLI0; pre-ready and controlled in-flight unclean/command1 with actualCLI1; R04 actual during-close clean/command0 with diagnosticCLI1. Consumer hash remains `3d9f28ac3bece5df18006f9dd77ed9b041956a01d6f2c898f60411fa7240352b`.
- Actual observerValidator replay accepts the three retained shell-group hello/exit/close records and matching0/null outcomes. **Limit:** historical lookup deliberately uses persisted hello identities; offline replay cannot reauthenticate past live `/proc` identity/private-fd transport. It checks recorded ordering, topology, roles and outcome consistency, not a new live observation.
- Historical unchanged-path and all32runtime/approval files were rehashed after replay and stayed unchanged. No historical evidence was rewritten. Read-only helper exited0. Its exact output is `RUN/offline-replay.stdout.json`.
- External verifier's initial run stopped on a mistaken expected historical test filename (`runtime-repair.test` rather than actual `server-lifecycle.test`); only that verifier expectation was corrected before its successful rerun. No browser retry or source change resulted.

Run evidence manifest `RUN/evidence-sha256.json` contains34entries (all files then in RUN except itself), SHA256 `a77ed0a55951182079073bf9a292047b1136e3cdb67b0cccc17840f2586676cc`. The23preflight files are a subset; four-runtime32entries reference existing external evidence and are not32additional browser artifacts. The manifest file itself is additional to its34entries.

## Precise outstanding R04 distinction

**R04 actual during-close remains BLOCKED_UNOBSERVED_WINDOW; no automatic retry.** The retained fresh R04 failed to obtain an authenticated pending-close window, sent no supervisor SIGKILL and created no pre-kill/signal-attempt evidence. Ordinary shutdown completed. Thus strict consumer0 is correct for the actual clean records; diagnosticCLI1 reports the unmet destructive scenario, not demonstrated false acceptance of an injected orphan failure. Do not replace this with the controlled fixture or relabel it a pass. Earlier historical real-close attribution gaps and negative fixture scope remain as audited.

Normal R01/R02 acceptance plus this one successful ordinary browser prerequisite do not complete R01–R07 certification.33-case baseline/final comparison, Firefox, WebKit native dependency, Safari/mobile/zoom/AT, prior sparse Shape/Text quality failures, supplemental policy failures, H1 and CLI artifact gates remain separately unresolved or unexecuted. No production, PR, merge, deployment or issue transition is authorized.

## Authored files and reproducibility

Only repository deliverable: this document. External orchestration/verification files under profile scratch: `qa-reviewed-preflight-once.py`, `qa-reviewed-preflight-offline.mjs`, `qa-reviewed-preflight-verify.py`; outputs under the fresh RUN above. The first script is **one-shot execution evidence, not retry permission**. Do not rerun it without new authorization. No changes to canonical app/harness/lifecycle code or frozen case assertions.
