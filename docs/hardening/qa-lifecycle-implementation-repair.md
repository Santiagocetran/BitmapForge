# L1/L2 bounded lifecycle-driver repair — independent re-review handoff

**Implemented and offline-verified candidate only. Not lifecycle/server-only ACCEPT and not runtime authorization.** This addresses only L1/L2 in `qa-lifecycle-independent-audit.md`, retaining the accepted plan `2a954b8fa72abd39221b73c5f00f214cc37f04fe7b6820f94d668bb5764df4a3`. The prior candidate freeze `3525a8453e46b0ec73a371c67fed6dccb843d8aa58baea882355717a478f7f68` and its evidence remain untouched. Independent re-review and separate parent approval are still required before any real server-matrix attempt.

`QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`.

## Bounded changes

Only executable sources changed:

- `QA/harness/tests/server-lifecycle-control.mjs`
- `QA/harness/tests/server-lifecycle.test.mjs`

No production lifecycle module, runner, predicate, protocol guard, original test, config, dependency, immutable dist or application source was changed. This document is the sole authored repository repair report. New evidence is under `QA/repairs/lifecycle/implementation-repair-stage/`; the earlier intermediate 160-test candidate is retained separately under `implementation-repair-stage-candidate1/`, not accepted or used as the final source.

### L1 — explicit unresolved-startup R04 dispatch

- Added exact runtime approval scenario **`R04 / unresolved-startup`**, separate from R03 `in-flight`, actual-preview R04 `before-ready`/`during-close`, and `during-close-fixture`.
- It uses the actual production lifecycle factory with an unresolved acquisition promise, the existing controlled supervisor/observer, and default production child-local 9000ms/startup and maximum 8000ms close bounds. No HTTP listener or Vite is required by this benign fixture row.
- Before supervisor **SIGKILL**, the controller retains the child PID/startTicks/PGID/SID, reads the acquisition-entry marker matching that PID, verifies the child remains alive and has not become ready, and persists that evidence in its result. No cancellation SIGTERM is substituted.
- Retains real supervisor exit/close events, the child's terminal error/timeout identity, absence readback for retained identities, and the unchanged rejecting persisted consumer result. The dead supervisor cannot observe the orphan child's later ChildProcess events; its reserved telemetry stays incomplete/rejecting. No child exit or close is synthesized from `/proc` absence.
- Child-local deadline/group self-termination is finite **failure**, not graceful close. External controller emergency reap remains a failing row. The new offline actual-dispatch test injects a 600ms child-local budget only for its benign fixture; it does not clear the unrun production-budget runtime row.

### L2 — R06 interruption before the special-branch early return

- The actual R06 runtime branch enters `refusalEnvelope` before imports, listener creation or asynchronous refusal work. Both SIGTERM/SIGINT handlers latch the first interruption, poison the failure result and retain an earlier armed absolute deadline. Repetition cannot extend it.
- The detached refusal child and discovered descendants now share the envelope's retained ownership array. The ordinary refusal poll and interruption finalizer therefore use the same PID/startTicks/PGID/SID evidence, including retained descendants whose group leader has already exited.
- An interruption races pending orchestration immediately; active guards prevent later adapter continuation from spawning the refusal child. The finalizer identity-checks/reaps only retained owned processes, closes only this driver's disposable listener, waits for real child exit/close and exact owned absence within the same absolute 10000ms cap, and records missing events/survivors as failures. Ordinary refusal keeps its existing 9000ms poll/reap boundary. Forced containment always retains emergency/failure labels.
- Listener disposal is idempotent and bounded; only the explicitly created HTTP server is closed. No kill-by-port/name or stale-listener ownership-policy relaxation was introduced. Real Playwright reuse refusal, separate Vite strictPort refusal and stale-target preservation assertions remain.
- `main` uses the shared actual fixture dispatcher and still persists terminal `FAILED_OR_BLOCKED` on interruption before returning from its special branch. Regression approval now reads the **new** `implementation-repair-stage/freeze.json`; the old freeze is preserved, not silently overwritten. The approval interface, exact hashes, independent-review references, fresh attempt and parent authorization requirements remain enforced.

## Verification executed

Locked Node: `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`.

Final command, exit **0**:

```text
NODE --test --test-reporter=tap QA/harness/tests/repair.test.mjs QA/harness/tests/server-lifecycle.test.mjs
```

**161 tests, 161 pass, 0 fail/cancelled/skipped** (119 top-level entries). All prior 152 tests remain; the prior lifecycle test body is mechanically byte-preserved after removing only the new import and inserted new tests. Nine new tests cover:

1. Static complete named B01/R01–R07 inventory and actual main/runtime-envelope wiring.
2. Actual R04 unresolved-acquisition dispatch, supervisor SIGKILL ordering, finite child-local failure and owned absence.
3. Retained detached-refusal descendant cleanup after its leader has exited.
   4–5. Actual OS SIGTERM/SIGINT delivered to a benign controller subprocess using the real dispatcher/envelope: failed terminal record, controller exit1/null, actual refusal-child exit/close and absent identities.
   6–9. SIGTERM/SIGINT before dispatch work and during a real detached benign refusal child; first deadline preserved under repetition, owned disposal, real events and emergency-failure attribution.

Offline tests use benign Node fixtures and injected refusal work, not actual Vite/Playwright networking. The existing installed-source refusal/EOF checks, D1 old-extension counterexample, all seven D2 accepting-validator mutants, exact consumer tests and missing-close rejection still pass.

Five locked-Node `--check` commands each exit **0**: supervisor, telemetry, server and both lifecycle test/driver files. Original **28 archival files** and **25 non-lifecycle canonical original files** hash-match. All three production lifecycle modules hash-match the audited prior candidate. Retained B01 evidence and historical driver freeze hash-match. Original inventory remains `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`.

Both complete patch and L1/L2-only delta were separately applied to private mechanical source reconstructions: `git apply --check`, actual apply, reverse-check all exit0; all five reconstructed source hashes equal the canonical candidate. No reconstructed runtime was executed.

## Exact final freeze

All SHA-256 values below are from real final verification. Full records, syntax exits, preservation identities and literal TAP output are retained in the evidence directory.

| Artifact                                   | SHA-256                                                            |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `implementation-repair-stage/freeze.json`  | `69697b4e1acc40cd5cf25497f626b90ed80920beed76ee272a7abf436cc54c2a` |
| `tests/server-lifecycle-control.mjs`       | `ccf074f8e00906d15fc4cdba4414b117e2f6865e052392ce8b59dd1583438045` |
| `tests/server-lifecycle.test.mjs`          | `2fc235b5652fbda5a6f1e079df498372d169a27a4c3dd437399ce01e9aa5ff5e` |
| Complete 30-file harness compact inventory | `3556f997137d7fe9804916aecf6a7c8b5699cb3b8273418c16acf4c26a150bfb` |
| Complete `lifecycle.patch`                 | `5e4ca8dbfa328cc40233921b19d1e53e8daebfda392c76a1fc82bd3bd27ffe13` |
| Prior-candidate-only `L1-L2.patch`         | `f92f691c9f554af43dbcff8489ddd0836aa6e73cca19677c75def1054ffc2ebc` |
| `offline-final.log`                        | `3e4def76f2f285ca4b1b5408b4e3ef457e4a8cf4e7571f52e63e6fbcf52fd6b7` |

The complete patch keeps the same audited original-three/revision3-driver base as the prior implementation patch. The delta applies to the exact prior `3525a845…` candidate. `source/`, `new-inventory.json`, `preservation.json`, `syntax-checks.json`, `offline-results.json`, `patch-check.json` and `verify-freeze.py` provide review/reproduction artifacts. Neither patch itself conveys runtime approval.

## Runtime handoff and remaining gates

The explicitly inventoried scenarios now include:

- B01: SIGTERM (historical retained red; not repeated).
- R01: SIGTERM.
- R02: SIGINT, repeated, shell-group.
- R03: pre-ready, in-flight.
- R04: before-ready, during-close, during-close-fixture, **unresolved-startup**.
- R05: child143, childSIGKILL, protocol-failure, close-reject, persistence-failure.
- R06: stale-listener (controller SIGTERM/SIGINT containment is always installed).
- R07: snapshot-change.

**No real server-matrix attempt, listener launch, Vite preview, browser launch, installation or baseline replay occurred in this repair.** No approval file was created. This is a bounded L1/L2 repair, not full acceptance. Independent re-review must inspect these exact final hashes; only afterward may the parent separately authorize fresh per-scenario server-only attempts. Production-budget unresolved-startup containment, real preview close windows, actual listener refusals and every other runtime obligation remain unexecuted here. Chromium/WebGL, H1/Q3, WebKit and the complete baseline remain separate unresolved gates.
