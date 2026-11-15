# Independent audit — external QA lifecycle repair plan

## Verdict: REVISE — lifecycle repair plan; no code authorization

Audited plan SHA-256: `401501bd725c128af8d04a585d498dd199e77591b4f26ce01badd7e148e5e6fe` (`qa-lifecycle-repair-plan.md`). Repository HEAD: `550842cab61002c7cc6563e50b9fcdeb17c9bf01`; shared unrelated edits are outside review ownership. The IPC/detached-child direction is appropriate, but the written contract has fail-open integration and finite-orphan gaps that must be resolved before implementation. This is not a rejection of the proposed architecture.

Read-only source/evidence audit only: no browser/server launch, install, test execution, implementation or process termination. Tooling retains the execution slot. Sole write: this audit. Governance and web-product-development skill read; repository COLLAB records are absent. Audit path is not ignored.

## Verified source and retained evidence

Paths below use `QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`; installed dependencies are under the repository's `node_modules`.

- Installed Playwright **1.59.1**, Vite **7.3.1**. Playwright `lib/plugins/webServerPlugin.js:87–110` launches with `shell:true` and sends SIGTERM to **negative launched PID**, the entire launched shell process group. `playwright-core/lib/server/utils/processLauncher.js:108–118` creates that detached group; `173–203` escalates against the same group. A new detached Vite child escapes both normal group SIGTERM and Playwright's fallback group SIGKILL. The latter makes independent orphan cleanup mandatory, not optional.
- Vite `dist/node/chunks/config.js:35077–35107`: preview has a real idempotent `server.close()` promise; programmatic close removes its own SIGTERM callback. Its separate signal callback awaits that close and then calls `process.exit()` with signal-derived status. Shared signal plumbing is at `2712–2727`. No need to patch Vite, remove arbitrary listeners or change browser options. Vite also subscribes to stdin end when `CI !== "true"`; the proposed ignored-stdin topology must not accidentally introduce another normal shutdown trigger.
- Current `harness/server-supervisor.mjs:7–19` directly spawns the server, observes it, and forwards signals. Current `lib/server-telemetry.mjs:53–65` arms its watchdog **after** sending the signal; the proposed arm-before-transport correction is sound. Current `server.mjs:100–120` writes pre-close evidence and only persists close completion after awaiting close.
- Retained `reviewed-a01/server-exit.json`: actual child PID `2509019`, exit **143**, signal **null**, both exit/close events, `closeCompleted:false`. Its identity has `unchanged:true` and `end`, but **no** `closeCompleted`, `closeFinished` or `closeError`. This supports the competing-exit diagnosis; it does not prove historical microtask ordering or a runtime repair.
- Recomputed inventory using `run.mjs:42–48,90–100` exclusions (`node_modules` and `tooling`): **28 files**, digest `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`, matching the original reviewed harness.
- `repair-contracts.mjs:280–292` requires actual exited+closed, code0, signal null, completed close and no error/closeError/timeout. Preserve it unchanged. `run.mjs:307–313,336–342` consumes **server-exit.json**, not the supervisor's terminal result or final identity. This distinction drives revision R1.

## Required minimal corrections

### R1 — Make every additive rejection reach the unchanged consumer

The plan requires parent identity/protocol validation, but does not specify how its failures poison the exact telemetry read by `run.mjs`. Merely exiting the supervisor nonzero is insufficient: Playwright's graceful teardown resolves on launched-process close **without checking its code** (`webServerPlugin.js:104–109`). Its readiness rejection is not a reliable teardown-status gate. Also, `serverExitClean` does not inspect `telemetryError`, session, manifest or environment fields.

**Amend contract:** in the owned observer/supervisor, validate final identity **before publishing/resolving terminal clean state**. Any invalid/missing/unreadable/stale identity, missing closeFinished, session/PID/environment/output/origin/dist/phase/lane mismatch, unchanged-manifest failure, transport/protocol/disconnect failure or persistence failure must latch an existing rejecting field such as `state.error` (with original detail retained). Never erase it in subsequent exit/close callbacks. Do not modify `serverExitClean` or `run.mjs`. Include `QA_SERVER_SESSION` explicitly in the expected child environment comparison; parent `environment()` was evaluated before adding that child-only value.

A failure writing server-exit.json must leave no earlier clean-looking terminal record acceptable: reserve a fresh attempt, write initial failed/incomplete state, and publish clean only after all checks and final persistence succeed. No post-publication operation may newly determine success. Test the actual supervisor/observer output through the unchanged `run.mjs` serverClean/commandExit block with runner0; a pure standalone predicate test or supervisor1 assertion is insufficient. Include a child0 + closeCompleted:true record with wrong session, unchanged:false, missing closeFinished, or a latched protocol failure; each must fail the real consuming block.

### R2 — Bound shutdown while startup is unresolved and after supervisor loss

Queueing an early stop until a server exists is not finite if `preview()`/`createServer()`/listen/served-byte fetch never settles. `boundedClose(...,8000)` bounds only close, and the supervisor's9000ms timer disappears on supervisor death. Detached isolation prevents Playwright from rescuing that child.

**Amend contract:** install a child-local terminal deadline before asynchronous startup; start its unchanged9000ms failure watchdog on stop/disconnect, not after startup or after acquiring a close handle. Close any acquired server through the single finalizer with the unchanged8000ms bound; if startup is still pending, preserve failure and terminate within the existing outer bound. Never publish ready/success after cancellation/disconnect has latched. Supervisor transport rejection must enter the same bounded failure path. Define who performs identity-checked cleanup of surviving owned descendants if the supervisor itself is killed: the server-only driver is the external owner for this injected failure, and any emergency reap is retained as failure, never normal cleanup success. Do not assume a post-SIGKILL supervisor handler runs.

Add controlled startup-never-resolves, stop-before-ready, disconnect-before-server, disconnect-during-close and supervisor-SIGKILL fixtures. Assert bounded real exit/nonzero or explicitly failed emergency cleanup, and exact owned PID/start/group/listener absence. No enlarged deadlines or broad process searches/kills. Cover inherited non-CI stdin behavior without changing CI identity just to avoid Vite's stdin-end path.

### R3 — Make baseline-red target selection honest and executable

`--harness-root <private-copy>` alone cannot select a fully private original harness: original `server-supervisor.mjs:7` spawns `QA + "/harness/server.mjs"`, and original `lib/env.mjs:7–8` hardcodes the canonical QA root. A copied supervisor still runs the canonical child. The proposed byte-identical private-copy red requirement therefore does not establish the claimed private execution identity.

**Smallest correction:** explicitly run baseline-red against the **canonical, still-unmodified frozen harness before any code edit**, retaining a byte-identical backup/inventory and actual resolved supervisor/child entrypoint hashes. Keep fresh output paths and immutable dist. Change the written private-runtime requirement accordingly; do not silently patch the baseline or claim `--harness-root` relocated it. If private execution remains mandatory, return a separately specified relocation mechanism for review instead. The driver must report/refuse a requested root whose actual launched child resolves elsewhere. Regression should use module-relative sibling resolution in the already-allowlisted supervisor if supporting alternate harness roots.

Preserve the stop-for-review rule if the real red fails to reproduce the defect; do not manufacture143. The driver may record a successful diagnostic invocation that _observed_ a strict-clean failure, but must retain the original child/supervisor/strict-assertion exits distinctly.

## Requirements retained; implementation/runtime proof still pending

The five-file allowlist is suitably narrow: `server-supervisor.mjs`, `lib/server-telemetry.mjs`, `server.mjs`, new `tests/server-lifecycle.test.mjs`, new explicitly invoked `tests/server-lifecycle-control.mjs`, all under QA/harness. R1–R3 fit this scope plus plan amendments; no additional application/config/installed-dependency edits are justified. Test finalizer/transport seams inside those owned modules must execute the real implementation rather than duplicate shutdown logic.

Keep all existing tests and assertions. Freeze the server-only ledger to separately retained baseline-red and regression rows:

1. **Normal:** SIGTERM, SIGINT, repeated requests, and real Playwright-shaped shell-group SIGTERM with proven child PGID isolation. Assert exactly one accepted IPC stop/one Vite close, matching session/PID/full identity, unchanged manifests, completed final write, **actual child0/null**, supervisor0, and absent owned descendants/listener. IPC delivery/ready/files alone are not completion.
2. **Cancellation/orphan:** early and in-flight cancellation, supervisor loss, and the pending-startup/disconnect cases in R2. Cancellation outcomes remain interrupted/nonzero even when server cleanup itself is clean.
3. **Abrupt/fault:** actual143/null, SIGKILL, child0 without completion, invalid IPC/session/PID, transport rejection, close rejection/timeout, final-write failure, missing/stale/malformed identity and R1 integrated-consumer negatives. Preserve original failures after socket disappearance and late events. Keep the original default observer SIGTERM→SIGKILL regression unchanged; new optional IPC transport must not weaken it.
4. **Stale port:** both Playwright `reuseExistingServer:false` refusal of an available owned disposable HTTP listener and direct Vite `strictPort:true` bind refusal. The harness must neither reuse nor kill that listener; its fixture owner closes it only after verifying refusal and continued identity. Fail closed on old identity/exit files before overwriting them.
5. **Finite completion:** controlled close resolve/reject/timeout and unresolved startup under frozen8000/9000/10000ms production budgets; small injected timers only in test fixtures. Actual exit/close observations remain distinct from deadline expiry. Missing events never become synthetic completion.

No server-only run is authorized by this audit. Parent reserves the slot after revised-plan independent ACCEPT. Offline tests and red/green controls remain unexecuted gates, followed by separate independent implementation/runtime review and the exact new inventory hash. Only then may parent authorize the unchanged Chromium prerequisite observation; the complete33-case baseline remains another explicit gate.

## Scope conclusion

Historical Chromium launch stall remains **unknown**. Same GL diagnostics occurred in a successful empty-browser diagnostic control; neither those messages nor this lifecycle defect diagnoses the earlier launch stall or clears WebGL/application/browser acceptance. Retain failed history, H1/Q3 and WebKit/library blocks. Do not accept143, remap exits, infer completion from process absence, relax assertions, expand timeouts, change browser flags, patch application code, install anything or terminate unrelated processes.

**Next action:** amend the plan with R1–R3 and return its new hash for independent written-plan review. No implementation ACCEPT has been delivered.
