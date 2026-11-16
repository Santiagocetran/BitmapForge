# Bounded lifecycle runtime contract repair — plan-only handoff

**Verdict: PLAN REQUIRES REVIEW; runtime overall remains REVISE.** No production module or existing driver was changed, no runtime matrix was rerun, and no browser/server/approval was launched or created. The new tests are explicitly **known-gap counterexample probes**, not repaired-contract acceptance. Original matrix requirements, cases, budgets, strict child predicate and historical failed attempts remain unchanged.

## Decision and observation limit

The exact existing shell branch is `/bin/sh -c '"$1" "$2" & wait' qa-shell NODE supervisor`. The outer controller is the shell's parent, not the actual Node supervisor's parent. Its ChildProcess exit/close events therefore belong only to the shell. The supervisor source has no driver-facing outcome IPC or process-outcome publication; it returns a computed result and then calls `process.exit(code)`. The server-exit record belongs to the detached child, not the supervisor. A preload `exit` callback or `main()` return would at most record exit intent, not an actual OS-observed exit/close outcome. Absence/zombie disappearance does not establish code or close. Current evidence cannot recover that lost outcome retroactively.

Do **not** accept shell SIGTERM as supervisor success, infer supervisor0 from clean child telemetry, publish a computed shell wait-code as if it were Node ChildProcess events, or modify production to manufacture an observation. A driver-only parent observer is a plausible solution without production changes, but adds a role to the accepted shell topology. This handoff requests explicit review of that small instrumentation amendment before implementation rather than silently changing the observable contract. If even that topology amendment is declined, shell-group remains blocked; do not guess. Production edits are not authorized by this proposal.

## Evidence produced in this assignment

External QA root: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa` (`QA`). Repository: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`.

Added `QA/harness/tests/server-lifecycle-runtime-contract.test.mjs`:

1. Executes the **literal current shell spawn expression** extracted from the real driver with a benign Node script, no Vite import/listener. Captures real shell and Node PID/startTicks/argv/executable/PGID/SID. Executes the actual substring selection expression: it selects the shell; exact executable/entrypoint selects a distinct Node process. Real negative-group SIGTERM produces shell `null/SIGTERM`. Supervisor outcome is deliberately `UNOBSERVED`, even though the fixture prints that its handler ran. Absence is read back and emergency cleanup is prohibited as success. This is an actual launch-path counterexample, not a fake process array.
2. Executes the literal current R04 kill branch in an inert VM. Wrong-child/stale-end and `closeCompleted:true` without closeFinished both still cause SIGKILL dispatch. No-end and closeFinished records suppress dispatch. These negative controls establish missing authentication/freshness/completion guards; they do not exercise repaired dispatch.
3. Executes the literal current CLI exit assignment for both R03 scenarios with rejecting consumer1. It still returns diagnostic0 with no interrupted outcome; adding a genuine failure yields1. This establishes the masking behavior, not a new acceptance policy.

Offline command, using the locked Node:

`NODE --test QA/harness/tests/repair.test.mjs QA/harness/tests/server-lifecycle.test.mjs QA/harness/tests/server-lifecycle-runtime-contract.test.mjs`

Actual result: **166 passed, 0 failed, 0 cancelled, 0 skipped**, exit0. Existing production-factory/offline IPC/deadline/containment regressions remain green. Three new passes mean three known gaps were reproduced, **not** that the runtime repair passed. See `QA/repairs/lifecycle/runtime-repair-stage/offline.log` and `offline-result.json`; shell probe evidence is in the fresh `runtime-contract-probes-*` directory named in that log.

Preservation verification: **210/210** audited historical artifacts unchanged; **28/28** original archived files unchanged; **25/25** protected canonical originals unchanged; immutable dist `sha256sum -c ci-sha256sums.txt` exit0. Existing driver/tests and production source retain their audited hashes. New evidence source/check hashes: `QA/repairs/lifecycle/runtime-repair-stage/freeze.json`. Reproducible checker: `verify-preservation.py`. No historical inventory/freeze, approval, attempt, audit or failed row was rewritten. COLLAB directory is absent; unrelated shared-tree changes were untouched.

## Proposed minimal amendment: driver-owned process observer

Implementation remains limited to the driver/test files and this document. Prefer an explicit internal observer mode in `tests/server-lifecycle-control.mjs` rather than a new production module. Parent approval must cover the mode and changed driver/test hashes before any runtime use.

- Preserve disposable shell group leader and actual Node supervisor in the same PGID/SID, with the production server still independently detached. Add one **driver-owned observer Node** as the supervisor's direct parent inside that shell group. Record all four roles separately: shell launcher, observer, actual supervisor, actual child. This is a topology instrumentation amendment, not a replacement runtime fixture.
- Observer uses real `spawn(NODE, [target.supervisor], ...)`, no shell-code result synthesis. Keep supervisor argv, inherited QA environment and stdin ownership unchanged; observer secrets/session travel via its own driver-only channel/arguments, not extra QA variables passed to production. Observer has no production close/exit policy.
- Observer survives the intended group SIGTERM/SIGINT without forwarding duplicate signals: the actual supervisor receives the group's original signal itself. Observer must not stop the child/supervisor on a success path or create new grace. Its sole job is to observe and publish **actual ChildProcess exit and close events** separately. A protected channel authenticates an unguessable driver session, ordered record sequence and observed observer identity. Bind reported supervisor identity against the outer driver's independently observed `/proc` PID/startTicks/real executable/argv/PPID/PGID/SID before injection; require both independent observers to agree.
- Preserve a raw bounded record stream with role/session/PID/startTicks and monotonic event timestamps. Validate finite types/order/code/signal. Reject wrong session/PID/start ticks, missing/duplicate terminal records, transport loss or observer loss. No absent-process fallback. Require genuine supervisor exit **and** close0/null in R01/R02, separately from the unchanged genuine child strict-clean predicate and actual consumer0.
- Preserve actual shell exit/close independently; its intentional group-signal termination must not stand in for supervisor status. Any explicit expected shell-termination disposition is permitted only with verified injection into that exact group and independently authenticated supervisor outcome. Missing proof stays blocked.
- The observer participates in the **same existing absolute deadlines**, retained ownership array and failed external emergency containment. It must exit/release channels within the remaining original bound. No increased 8000/9000/10000ms budget, no new retry/launch and no reaping classified as success.

If this observer cannot provide real exit **and** close under the locked Node without altering production or expanding the accepted topology further, stop and return the exact missing event as a blocker. Do not replace close with IPC disconnect, process absence or exit intent.

## R04 actual-preview causal contract

Keep `during-close` on the actual immutable preview. `during-close-fixture` remains a separately named controlled case, never its replacement.

Before SIGKILL, persist a dedicated close-window record containing:

- both actual supervisor and detached-child complete identities, source hashes/argv, retained group/session relationship and authenticated production child session;
- exact persisted identity bytes/hash, resolved target path, child's matching PID/startTicks/PGID/SID/session/environment/manifest expectations, `end`, no `closeFinished`, and `closeCompleted !== true`;
- independent read and signal-attempt monotonic times, exact revalidated supervisor identity and the existing first-terminal deadline. Persist record synchronously **before** dispatch, re-read/revalidate immediately before signal, then append actual signal attempt/result. A write/read/identity failure must suppress injection rather than continue with an unrecorded kill.

A sampled pre-signal record cannot atomically guarantee the child has not completed between read and kill. Preserve that race honestly. After actual supervisor SIGKILL, require the final child's same-session identity to retain **disconnect/EOF failure** with nonzero/failure outcome (or recorded local deadline/self-kill), rejecting unchanged consumer, and independently verified owned process/listener absence. Persist final identity/raw record separately from the pre-kill sample. If no window is observed, final completion wins the race, or orphan failure is not observed, classify **BLOCKED_CLOSE_WINDOW_OR_DISCONNECT_RACE**, not product pass or invented disconnect. Keep historical real09 and fixture10 unchanged. Do not delay/freeze actual Vite close, add fixture holds, or modify production just to force this race.

## R03 explicit outcome and CLI classification

For both pre-ready and in-flight cancellation, add finite outcome fields separating:

- `scenarioObserved`: required injection/phase/consumer/identity evidence was observed;
- `applicationOutcome: INTERRUPTED_NONZERO`, with actual consumer commandExit1 and actual child/supervisor code/signal records where observable;
- `interruption`: injected shutdown signal/cause, not an invented external signal delivered to the controller;
- `containment`: child-local deadline/self-kill versus external driver emergency reap, with the former a failure/non-graceful terminal result and the latter a failed row;
- driver classification/CLI status: explicit **interrupted/nonzero** for these rows, never generic diagnostic0. Do not append a fabricated harness error merely to get exit1. Genuine harness failures remain separate.

A separately approved parent aggregator must understand expected scenario observation with nonzero interrupted application/control result; it must never label the row a clean application pass. Require consumer1, no readiness promotion and no leaked owned identities/listeners. An actual controller SIGTERM/SIGINT still follows the existing first-terminal interruption envelope and cannot overwrite/extend an earlier bound.

## Required implementation-stage nonbrowser tests (not yet implemented)

- Exercise the **actual repaired dispatcher**, not only helpers: real disposable shell + observer + benign supervisor + independently detached benign child. Assert separate identities, real group signal dispatch, authenticated actual supervisor exit/close and shell signal outcome. Supervisor exit0/exit1/SIGKILL, missing close, delayed close, transport loss and observer death must remain distinguishable. A supervisor0 fixture alone does not clear production runtime.
- Wrong executable with matching argv substring; shell carrying supervisor path as an argument; wrong session/PID/startTicks/PPID/group; stale process records; missing/duplicate terminal records; shell-only events; absence-only result. Each must reject. Include a selective wrong-selector/event-substitution mutant that fails its corresponding regression.
- R04 actual dispatch seam with persisted bytes: wrong child/session/start ticks, end absent, closeFinished present, completed flag true, changed reread, failed pre-kill persistence, stale supervisor and completion-before-disconnect suppress or block appropriately. Positive controlled pending-close proves persist-before-signal and both identities; finishing-race control must block, not pass. These are causal offline controls, not substitute real-preview results.
- R03 actual integrated final classification and CLI subprocess: both expected cancellations return explicit interrupted/nonzero; consumer0, diagnostic0, generic label, missing cause and missing child evidence fail. Genuine driver error must remain independently failed. Confirm unchanged actual consumer continues rejecting retained negatives.
- Preserve/re-run original first-terminal/deadline nonextension, pre-injection external interruption, owned descendant retention, missing-close rejection and child-local self-kill versus external emergency tests. Forced cleanup can establish containment only, never graceful success.

## Gates and handoff

1. Parent independently reviews this minimal **driver observer topology/observable-contract amendment**, the R03 expected nonzero interface and R04 fail-blocked race policy. No implementation acceptance is claimed here.
2. Implement only the accepted driver/test scope, run the required causal tests and selective mutants, then freeze exact bytes and re-check all historical/protected/dist hashes. Obtain independent bounded source/offline acceptance.
3. Only a fresh explicit parent approval pinned to those reviewed bytes may authorize runtime observations. No fresh approval or actual matrix rerun is part of this assignment. Fresh affected observations must retain unchanged mandatory matrix requirements; no subset or offline count clears overall runtime.
4. Review actual affected runtime artifacts and preserve failures/blocked races. Browser prerequisite remains blocked until overall lifecycle runtime ACCEPT. No production blocker has been proven by the current controller defects.
