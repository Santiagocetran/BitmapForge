# QA prerequisite diagnostic readout — not acceptance

## Outcome / ownership

**Browser launch root cause remains unproven. A competing Vite SIGTERM shutdown owner explains the separate lifecycle telemetry failure at source level. No repair has been applied.**

Browser slot **released**, final readback **2026-11-15 05:58:53 UTC**. No owned processes remain, no process using the supplied browser cache or frozen server entry points remains, and no listeners exist on 5291/5292/5293. Historical browser PID2509161/server PID2509019 are absent. No emergency termination was used.

Only this document and a new external diagnostic directory were created. No app, harness, manifest, lockfile, installed dependency, browser flag, timeout, assertion, OS or cache repair/change was made. No application/server was launched, no acceptance case was rerun, and no matrix/ledger classification was changed.

Evidence directory:
`/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa/runs/prerequisite-diagnosis-20261115`

Original failed attempt remains:
`QA/runs/baseline-20261115-reviewed-r6-550842c/baseline/preflight/chromium/reviewed-a01`.
`integrity-before.json` and `integrity-after.json` compare every frozen harness file and every file under the failed run; all bytes matched. This preserves the accepted harness whose earlier digest is `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096` and the original failure/evidence, not a substituted successful attempt.

## Benign control 01 — unchanged locked empty-browser launch

Exactly **one** of the permitted maximum two launch controls executed, serially. The second was deliberately unnecessary: repeating an already successful empty launch cannot recover the missing historical stall telemetry.

- Locked runner1.59.1 imported through the frozen `harness/lib/env.mjs`; paired Node v24.22.3 at `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`.
- Supplied cache only: `QA/browsers/parent-baseline-pw-1.59.1`.
- Same actual headless shell1217, SHA-256 `22d72b589f908111fa29ff4e61ead8a0601e925177f59c70e2e851c22e9b1886`, browser147.0.7727.15.
- Exact options: `headless: true`, `timeout: 30000`, args imported unchanged: `--use-gl=swiftshader`, `--disable-gpu-sandbox`, `--no-sandbox`.
- Actual generated launch argv equals the failed attempt's argv after normalizing **only** the random `--user-data-dir` value. Same inherited profile scratch TMPDIR; no shorter-path experiment, fallback binary or alternate flags.
- Diagnostic `DEBUG=pw:browser` only records host-side launch/exit events.
- `2026-11-15T05:58:01.616Z`: launch began. API resolved in126.151385ms; browser.close completed in1069.662024ms. Actual shell exit0, signal null, graceful close and runner temporary-directory cleanup completed.
- **The same requested-GL-not-found and GPU-initialization errors occurred during this successful launch.** They are not sufficient evidence that these messages caused the historical30-second launch stall. They still say nothing about meaningful WebGL rendering.
- No page, navigation, renderer/application assertion, screenshot or scan was attempted. Empty-browser creation/close is strictly diagnostic, not a new successful preflight or app acceptance.

`control-01.json`, `.stdout.log`, `.stderr.log`, and `control-01-processes.json` retain actual results and100ms process snapshots. Driver PID2523061; shell2523073; sampled descendants2523075,2523076,2523097,2523108. PID/start-tick/parent/group/session/cmdline/state/wchan identities are preserved, including transient zombie states. All tracked identities were subsequently absent. A sampled GPU process briefly waited in `folio_wait_bit_common`; without historical samples this cannot explain the original timeout.

## Actual host / dependency inspection

`host-before.json` and `host-after.json` contain dated process tables, listeners, environment subset, `/proc` limits/memory/load/pressure, disk/inode/shared-memory availability, cache inventory, executable identity, package/browser revision records, and native loader outputs. `release-and-readout.json` adds the correctly resolved service cgroup **and all ancestor limits**, complete cache file hashes, launch-argv equality and final process/listener readback. Initial root-cgroup memory/PID file lookups were absent; the finalizer corrected discovery to the actual `/user.slice/user-1000.slice/user@1000.service/app.slice/hermes-gateway.service` path rather than assuming no limits.

- Before control: about3.99million kB memory available; swap already used; load0.97/1.85/3.84. Disk342GiB available, shared memory3.9GiB available, and no inode exhaustion. These are current observations, not the resource state at05:46.
- Service cgroup: memory.high/max unlimited; memory events show zero high/max/OOM/OOM-kill; PID current131 against9212, max events0. Ancestor memory/PID events also zero, and available ancestor CPU quota records show unlimited/no throttling. No observed present hard-resource exhaustion explains launch failure.
- CPU/memory/I/O pressure is retained; there was measurable I/O pressure and swap usage. Transient host pressure or a protocol/startup stall remains possible, **not diagnosed** from snapshots taken later.
- `ldd` exited0 with no missing dependencies for the actual headless shell and its bundled `libEGL.so`, `libGLESv2.so`, `libvk_swiftshader.so`, `libvulkan.so.1`. This rules out an immediately missing linked library for these binaries now, not every optional dynamically loaded driver or historical I/O problem.
- Direct executable `--version` inspection and API browser.version agree147.0.7727.15. The executable digest exactly equals the failed launch. Full cache inventory/hashes are retained; no cache contents were removed or replaced. A present executable match does not establish the historical bytes of every auxiliary cache file.
- No current `LD_*`, Mesa/EGL/ANGLE environment override was found in the recorded subset. No competing cached Chromium/frozen QA server survived the before/after process inspection. Other host applications/servers were neither killed nor altered.

**Launch conclusion:** not a deterministic missing-browser/missing-linked-library block under the current host state. Same executable/options can establish CDP and close promptly despite the GL messages. Original launch remains blocked; exact transient cause cannot be reconstructed without contemporaneous process/resource/CDP timing. No basis exists to change flags, install libraries, clear caches or increase deadlines.

## Frozen server lifecycle — source-supported attribution

Read frozen `harness/server-supervisor.mjs`, `harness/lib/server-telemetry.mjs`, `harness/server.mjs`, `harness/lib/repair-contracts.mjs` and the actual installed Vite implementation at `node_modules/vite/dist/node/chunks/config.js`.

1. Supervisor spawns Node directly, not a shell (`server-supervisor.mjs:7–10`). `watchServerChild` sends SIGTERM to that child, records actual exit/close events and reads `server-identity.json` on close (`server-telemetry.mjs:23–49,53–65`). It does **not** invent143 by translating a signal. Historical `code:143, signal:null` is a real normal exit status from the child.
2. `server.mjs:52–56` calls Vite.preview before installing its own SIGTERM handler at122. Installed Vite preview registers its own SIGTERM callback during preview creation (`config.js:35099–35107`, shared registration2712–2727).
3. Vite's callback independently awaits server.close(), then assigns `process.exitCode` from the native signal number and calls **process.exit()** (`35099–35105`). For SIGTERM this yields143. Vite's preview close is an idempotent shared promise (`35077–35088`), but its signal callback still exits the entire process.
4. Harness stop writes `end`, `manifestAfter`, `unchanged` **before** awaiting `boundedClose(server.close,8000)` (`server.mjs:91–111`). It only writes `closeCompleted`/`closeFinished` after that await (`113–120`). Earlier-registered Vite shutdown can complete its shared close and force process.exit before this later continuation writes final telemetry.
5. Historical identity contains exactly the pre-close fields and unchanged manifest, but **no** closeCompleted, closeFinished or closeError. Exit occurred89ms after request, not after8/9-second close/escalation deadlines. That is consistent with Vite's eager exit interrupting the harness continuation, not evidence of timeout/escalation or thrown server.close.

**Attribution confidence:** the installed-source competing-exit mechanism and exact143 producer are verified. The original event's microtask ordering was not instrumented, and no server reproduction was authorized/executed here; therefore this is a source-supported cause, not a newly runtime-reproduced lifecycle fix. HTTP close may have completed inside Vite, but the harness's promised completion persistence did not. `serverClean:false` is **not merely** an overly strict rejection of an otherwise recorded clean SIGTERM: required final-close evidence is absent. Do not simply permit143 or infer graceful success from later process/listener absence. Keep the failed lifecycle contract visible.

## Minimal next authorization / repair plan

1. Authorize a **separate external harness-only lifecycle repair**, independently reviewed before edits. Give one layer ownership of server shutdown and completion persistence; avoid delivering the normal owned shutdown through both Vite's eager-exit SIGTERM path and the harness finalizer. A narrowly owned IPC shutdown request with signals reserved for bounded escalation is one design candidate. Do not blanket-remove signal handlers, weaken `serverExitClean`, accept143 without proof, modify installed Vite or expand close deadlines.
2. Require offline regression coverage for real exit-code/signal telemetry and original-close failure/missing completion; separately authorize a server-only runtime control against unchanged immutable dist to prove persisted closeCompleted/closeFinished, actual exit0 and owned process/listener disappearance. Preserve this failed attempt and obtain a new reviewed harness hash after any approved repair. No such repair or server control occurred here.
3. For Chromium, authorize at most a new explicitly labeled prerequisite-only observation, **not automatic33-case acceptance**, with unchanged cache/options/30000ms and launch-phase process/resource sampling. If the stall recurs, preserve samples/CDP/runner timing and stop. A single unchanged diagnostic success does not establish reliability or retroactively clear reviewed-a01. No environment repair is justified by current evidence.
4. Parent retains authorization of any later fresh preflight, complete33-case baseline/Firefox work and final comparison. Historical failed baseline, H1/Q3, WebKit missing-library block, application findings, matrix and acceptance gates remain unchanged.

External scripts `inspect.py`, `control-01.mjs`, `finalize.py` are retained diagnostic artifacts, **not frozen harness changes or approved resume commands**. They should not be rerun blindly into this immutable evidence directory.
