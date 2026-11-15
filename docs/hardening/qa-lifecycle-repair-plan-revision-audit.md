# Independent revision audit — external QA lifecycle repair plan

## Verdict: ACCEPT — lifecycle repair plan

Accepted written plan SHA-256: `2a954b8fa72abd39221b73c5f00f214cc37f04fe7b6820f94d668bb5764df4a3` (`qa-lifecycle-repair-plan.md`). Repository HEAD: `550842cab61002c7cc6563e50b9fcdeb17c9bf01`.

**R1, R2 and R3 are resolved at the written-design level. No further design revision is required before the plan's ordered authorization gates.** This supersedes the prior plan's REVISE verdict for this exact revised document only. It is not implementation acceptance, runtime evidence, browser-slot authorization or permission to skip canonical baseline-red. The immediate eligible handoff is the separately authorized, independently reviewed control driver and B01 against the still-original canonical harness; edits to the original three modules remain behind that gate.

Static independent audit only. Read AGENTS.md, web-product-development skill, revised plan, prior audit, prerequisite diagnosis, actual harness and installed dependency source. No server/browser launch, install, harness/test execution, process termination or implementation change. Sole write: this audit. Shared unrelated edits remain untouched; COLLAB records are absent. Audit target is not Git-ignored.

## Grounding and installed contracts

`QA` below is `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`; dependency paths are in the research repository's `node_modules`.

- Read installed package metadata: Vite **7.3.1**, Playwright / playwright-core / @playwright/test **1.59.1**. Recomputed the original harness inventory using the runner's path ordering, exclusions and compact JSON encoding: **28 files**, SHA-256 `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`. The original execution modules remain present, not an already-implemented repair.
- Vite `dist/node/chunks/config.js:2712–2727` registers its shared SIGTERM callback and, when inherited `CI !== "true"`, stdin-end callback. Preview `35077–35107` has an idempotent public close promise, removes its own signal callback through programmatic close, and separately has a close-and-exit callback that can assign signal-derived status and call `process.exit()`. Preview's server object exists before `configurePreviewServer` hooks (`35112–35117`) and before the later listen await (`35143–35155`). The planned early-acquisition seam can therefore be implemented inside server.mjs without patching Vite; simply calling onAcquired after awaiting preview would not satisfy it.
- Playwright `lib/plugins/webServerPlugin.js:87–110` launches with `shell:true`, sends the configured shutdown signal to **negative launched PID**, and resolves graceful teardown on launched-process close without checking its code. `playwright-core/lib/server/utils/processLauncher.js:108–118,173–203` creates a detached shell group and uses group SIGKILL on fallback. A second detached direct Node child escapes that group. Independent child-local orphan handling is consequently required, as the revision now specifies.
- The installed webServer plugin checks availability and rejects an already available server when reuse is false (`webServerPlugin.js:76–82`). That refusal is distinct from Vite's strictPort listen refusal. Both remain mandatory, not interchangeable port-probe approximations.
- `harness/config.mjs:63–73` retains reuseExistingServer:false, readiness30000ms and SIGTERM grace10000ms. Vite close8000ms and observer9000ms remain unchanged in the repair contract; no browser launch budget or flags are relaxed.
- `harness/lib/repair-contracts.mjs:280–292` consumes actual exited/closed, code0/null, closeCompleted:true and absence of error/closeError/closeTimeout. It does not validate session/manifests or telemetryError. `harness/run.mjs:307–313,336–342` consumes persisted server-exit.json, not supervisor status. The revision correctly treats that exact boundary as authoritative.
- Retained reviewed-a01 server-exit.json still records actual child **143 / null**, exited:true, closed:true, closeCompleted:false. This is a retained rejection, not a fresh reproduction or a successful graceful close. Historical Chromium-stall attribution remains unknown.

## Prior objections: independent dispositions

### R1 — Actual-consumer fail-closed telemetry and atomic publication: RESOLVED

Plan §§2.2–2.3 and O04–O07 close the previously material gap:

1. Reserve an initially incomplete/rejecting exit target before spawn, and do not spawn if that reservation fails.
2. Validate final identity and every expected field before any terminal clean publication. The child-only QA_SERVER_SESSION is explicitly part of the independently expected child environment.
3. Latch protocol, transport, startup, disconnect, validation and persistence rejection in the existing consumed state.error/timeout/error fields. Late exit/close or a superficially complete identity cannot clear it.
4. Child completion persistence precedes actual exit0. Parent stages/serializes first and atomically renames clean state only after all failure-bearing success decisions. Failed staging/rename retains the preceding rejecting target; initial failure yields no child.
5. O07 executes the unchanged runner's actual consuming statements with real predicates, filesystem targets and records from actual observer/supervisor validation. It includes runner0 fault cases and a real clean positive, rather than treating supervisor1 or a copied predicate as sufficient proof.

This is implementable in the owned supervisor/observer/server and new test file. No consumer edit, acceptance of143, temporary clean truncation, ignored telemetryError-only rejection or post-clean validation is authorized. Total persistence failure remains rejecting rather than requiring impossible successful diagnostics on broken storage. These are adequate design contracts; their fault-injection proof is an implementation gate, not a remaining design blocker.

### R2 — Startup, detached-orphan deadlines and group cleanup: RESOLVED

Plan §2.4 explicitly bounds what the old design left unbounded: controls before asynchronous startup, a startup watchdog, and a first-event child-local terminal watchdog independent of pending acquisition and supervisor lifetime. Stop/disconnect/failure never waits indefinitely for preview/listen/fetch; repeated events do not reset deadlines; earlier startup deadlines are not extended. An acquired resource goes through the single real Vite finalizer, capped by the remaining terminal budget, and late acquisition cannot publish readiness.

The new retained stdin pipe addresses Vite's inherited non-CI EOF trigger without falsifying CI identity. Installed-source integration must preserve the promised ordering: install controls first and promptly enter the same programmatic close path on failure/EOF; merely adding another async listener while leaving Vite free to exit first is not compliance. O03 and the inherited non-CI/orphan tests are the specified evidence for that contract, not new scope.

IPC loss is a concrete orphan detector after supervisor SIGKILL. Child-local identity-checked own-group termination and the surviving control driver's independently retained process/socket ownership cover the injected orphan test. The revision explicitly refuses to claim that JavaScript timers guarantee progress in a dead/blocked runtime: external emergency reaping is containment and a **failed acceptance row**, never graceful-close credit. PID/start ticks/PGID/session proof and readback are required; arbitrary numeric-group or port-based kills are forbidden.

O02/O03/O08 and R02–R05 retain normal, pending-startup, late-acquisition, disconnect-during-close, abrupt exit and missing-event cases. No synthetic exit/close event or process-absence success is permitted. Normal post-ready shutdown still requires real child0/null plus completed persisted close; pre-ready cancellation and orphan/fault paths remain nonzero/interrupted. The finite design fits the five-file allowlist.

### R3 — Honest canonical baseline-red: RESOLVED

Current supervisor line7 really hardcodes canonical QA/harness/server.mjs; env.mjs lines5–8 really hardcode REPO/QA. The revision no longer misrepresents a private copy as a relocated original execution target.

B01 must run against the canonical still-original modules after freezing their inventory and adding only the explicit control driver. The backup is archival, not a runnable substitute. Driver source review precedes launch, and evidence includes actual supervisor/child paths, argv and hashes. A requested/resolved root mismatch is rejected. Later sibling-relative child resolution changes only the entrypoint relationship, not env.mjs's constants. Nonreproduction or already-changed original bytes causes stop-for-review, not manufactured143 or silent restoration.

This resolves the original targeting objection without a sixth implementation file or a new relocation mechanism.

## Retained acceptance boundaries and pending prerequisites

The frozen B01 / O01–O08 / R01–R07 matrix is finite and explicitly server-only where runtime is required. It retains SIGTERM, SIGINT, repeated requests, actual Playwright-shaped group shutdown and PGID isolation; actual0/null/completion positives;143, SIGKILL, protocol and persistence failures; unresolved startup/orphans; exact consumer faults; both stale-listener refusals; snapshot negatives and strict ownership cleanup. Every listed subcase must receive its own evidence; passing a subset does not clear the matrix. Offline real benign Node children are not permission to start Vite or a browser.

The following are **execution/acceptance prerequisites, not unresolved written-design blockers**:

- Separate slot authorization and independently reviewed driver, original-inventory freeze, then real B01 red. If it does not reproduce, retain the attempt and stop before original-module implementation.
- Implementation restricted to server-supervisor.mjs, lib/server-telemetry.mjs, server.mjs, tests/server-lifecycle.test.mjs and tests/server-lifecycle-control.mjs. Existing runner, config, predicates, tests, dist, dependencies and assertions remain unchanged.
- Original offline assertions plus new real-module/finalizer and actual-consumer cases; separately authorized runtime matrix with unchanged production bounds and independent implementation/server-only ACCEPT pinned to the final inventory.
- A separately authorized unchanged Chromium prerequisite observation, then another explicit gate for any fresh complete33-case baseline. No historical failures, H1/Q3, WebGL prerequisite or WebKit library block is cleared here.

No new design objection, widened allowlist, timeout increase or unrelated repair is requested. **ACCEPT applies to the exact revised written plan only; all implementation and execution outcomes remain unverified.**
