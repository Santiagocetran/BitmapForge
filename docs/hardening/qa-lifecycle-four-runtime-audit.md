# Independent audit — four repaired lifecycle runtime attempts

## Verdict

**R02/shell-group ACCEPT (strict normal positive); both R03 rows ACCEPT as genuine interrupted/nonzero negative observations; R04/actual during-close BLOCKED (required destructive window unobserved). Overall full lifecycle matrix: BLOCKED, not PASS.**

Normal lifecycle evidence is sufficient to recommend a separately authorized, bounded browser prerequisite observation, **only if the parent explicitly decides to separate that prerequisite from complete destructive-matrix acceptance**. The prior audit required the destructive gate before browser consideration; this audit does not silently override it. Until that decision and separate authorization are recorded, browser execution remains blocked. R04 remains named BLOCKED regardless of that decision.

Sole authored file: this document. No server/browser/install, lifecycle main, source repair, approval creation or runtime retry was performed. Read AGENTS.md, web-product-development, latest accepted R04 persistence implementation audit and prior runtime audit, parent launcher, approvals, driver, observer and actual evidence. Read-only Python inspections and inert Node consumer evaluation were used.

Paths below use `QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`. Fresh output prefix: `QA/runs/lifecycle-parent-repair-four-20261115/baseline/lifecycle/chromium/`. These four attempts supplement the retained 17-row matrix; they do not replace its files or turn diagnostic exits into product passes.

## Four explicit row verdicts

| Fresh row           | Actual CLI | Actual consumer        | Independent verdict                                                                                                                                                                                                                     |
| ------------------- | ---------: | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01-r02-shell-group  |          0 | clean true / command0  | **ACCEPT normal positive.** Separate authenticated actual Node supervisor exit AND close0/null; shell exit AND close null/SIGTERM; detached application child strict-clean0/null and completed final identity.                          |
| 02-r03-pre-ready    |          1 | clean false / command1 | **ACCEPT interruption contract, not clean application success.** INTERRUPTED_NONZERO, scenarioObserved:true, explicit injected shutdown SIGTERM; actual child exit/close1/null and cancellation identity.                               |
| 03-r03-in-flight    |          1 | clean false / command1 | **ACCEPT controlled unresolved-acquisition interruption contract, not real-preview graceful close.** INTERRUPTED_NONZERO, scenarioObserved:true, startup-entry evidence, child actual SIGKILL and local deadline failure.               |
| 04-r04-during-close |          1 | clean true / command0  | **BLOCKED actual orphan scenario.** No authenticated pending close window; no supervisor SIGKILL. Normal close completed instead. Diagnostic correctly nonzero; not a demonstrated false acceptance of an injected destructive failure. |

Every fresh result has cleanup absent:true/emergency:false, empty external emergency list, no remaining retained identities/listeners and unchanged immutable dist. These facts establish containment, not missing event or destructive-window success.

## Approval and accepted-byte binding

All four external approval files equal their embedded driver-result approval records. Independently checked saved filtered environment equals each actual recorded environment, compact JSON SHA256 equals approval.environmentHash, start precedes expiry, exact approval output equals actual row output, and current driver/server/supervisor hashes equal approval pins. All four complete source inventories have 33 entries and match current files. All four before/after dist inventories agree and every one of their 37 paths freshly hashes to its retained value.

Accepted candidate freeze `QA/repairs/lifecycle/r04-persistence-repair/freeze.json` SHA256:

`8dffea64d1cee4ff71e88207ba656c7a01b5a83487de64f2a67c8826017f3576`

All19 frozen file hashes were recomputed and match. Relevant exact hashes:

- Driver: `cbd5c0dc5ea5718c76aa67b1269b631a517b60d307feea5ebdf52fe32265624f`.
- Observer: `0bdc05beb13c1ed1bdc31b08dff89ace832c2f31a08e11c139fb510a633d1448`.
- Server: `1905120d8b52f28f6a730108e82a554b3c4a7433dba59f648d47a0b2a6a99577`.
- Supervisor: `cfb37e8c6bdd1f768384c87cf21ad625791468adb79feac99bc89d88ed5e81fd`.
- Actual unchanged consumer block: `3d9f28ac3bece5df18006f9dd77ed9b041956a01d6f2c898f60411fa7240352b`.

Parent script `scratch/lifecycle-parent-repair-four.py` declares exactly these four attempts, creates fresh per-attempt approvals and records actual subprocess return codes. It does not reinterpret expected R03 CLI1 as a failed collector or grant retries. Its stage is server-only, not browser authorization.

## R02: real Node observer versus shell

Readable evidence: `01-r02-shell-group/observer-records.ndjson`, `driver-result.json` fields observerRecords/supervisorEvents/events/injected/beforeInjection, `server-exit.json`, `server-identity.json`.

- Shell PID2832820 is `/usr/bin/dash`, group/session2832820.
- Driver-only Node observer PID2832821 is the actual parent of Node supervisor PID2832828 (startTicks197434898), with that same group/session.
- Detached production child PID2832840 has its own group/session2832840.
- Exactly three persisted observer records: hello seq1, actual supervisor exit seq2, actual supervisor close seq3, same unpredictable session and fixed identities. Both terminal outcomes are0/null. Hello sourceHash matches unchanged supervisor source.
- Shell launcher separately reports exit and close null/SIGTERM. It is not renamed supervisor and is not used as proof of supervisor0.
- Source observer callbacks publish only actual ChildProcess exit and close. The live controller validates private-fd hello against `/proc` executable/argv/parent/start/group/session before injection; terminal validation preserves record ordering and outcome equality. Offline inspection of retained records cannot repeat historical live authentication, but the accepted topology, persisted role evidence and failure-free controller are consistent.
- Actual child telemetry has exited:true/closed:true/code0/signal:null. Final identity closeCompleted:true, end09:33:15.276Z, closeFinished09:33:15.352Z, unchanged manifests and no error. Strict normal predicate and consumer remain unchanged.

This closes the current shell-group evidence gap, not the historical row04 failure. No absence-to-close synthesis or relaxed child predicate is needed.

## R03: genuine nonzero and narrower fixture scope

Readable evidence: each R03 `driver-result.json`, `server-exit.json`, `server-identity.json`; in-flight additionally `fixture-startup.json`.

Pre-ready: actual supervisor launcher exit/close1/null. Child PID2832941 exit/close1/null; identity error `Cancelled before ready`; resource close can complete without clearing the error. No identity existed at injection. Cause is driver-scenario-shutdown SIGTERM and final label is INTERRUPTED_NONZERO/scenarioObserved:true.

In-flight: controlled unresolved acquisition through production lifecycle, child PID2832976. Identity error `Cancelled before ready`, closeCompleted:false, closeTimeout:true and lifecycle deadline diagnostics; actual child telemetry signal SIGKILL, real exit+close observed. This is the child-local deadline/self-kill containment path, not external controller emergency reaping, not graceful0 and not a real Vite close observation. Actual supervisor/control negative evidence and consumer1 remain distinct from diagnostic success.

The parent collector records CLI1 for both. The actual CLI assignment uses accepted cliStatus rather than old unconditional failure-list-based0; actual consumer rejects both. This is genuine repaired runtime nonzero evidence, not solely an offline classifier or child failure hidden behind diagnostic0.

## Strict consumer independently exercised

An inert Node invocation imported the controller helper (which does not run main on import), extracted/evaluated the unchanged literal run.mjs gate and commandExit assignment against all four actual output directories and real files. Node exit0 returned respectively:

```text
shell-group  serverClean:true   commandExit:0
pre-ready    serverClean:false  commandExit:1
in-flight    serverClean:false  commandExit:1
during-close serverClean:true   commandExit:0
```

Every consumerHash equals the exact block hash above and every result agrees with persisted driver evidence. Clean snapshot/identity, incomplete:false and runner status0 isolate the server boundary. This is actual consumer integration readback, not execution of the whole outer run orchestration.

## R04: precise failed cause and window evidence

Readable evidence: `04-r04-during-close/driver-result.json`, `close-window-final-identity.json`, `server-identity.json`, `server-exit.json`.

The driver requested ordinary SIGTERM at elapsed1820.451834ms, attempted the authenticated killCloseWindow path, and recorded:

```text
closeWindowAttempted:true
closeWindowBlocked: Error: No authenticated pending close window
failures: ["Fault/cancellation falsely accepted"]
strictClean:true
outcome:FAILED_OR_BLOCKED
```

There is **no supervisorKilled field**, no close-window pre-kill artifact, no signal-attempt artifact and no SIGKILL exit. Actual supervisor launcher exit/close are0/null. The child completed ordinary close: end2026-11-15T09:33:28.810Z, closeFinished2026-11-15T09:33:28.894Z, closeCompleted:true, no disconnect/EOF failure. Consumer0 is correct for those actual clean child records.

The source rejects a missing end, finished/completed close or expired deadline before durable pre-kill persistence and before SIGKILL. The generic guard message does not establish which exact guard term failed at its sampled read. Do not invent an authenticated earlier pending-window identity or claim completion-after-kill. The source/evidence support a missed/unavailable pending window, not observed orphan shutdown. The broad generic failure string describes the expected-negative mismatch; it is **not proof that the strict consumer accepted a genuinely injected failure**. No destructive signal was sent.

Mandatory final raw evidence did persist. Independently decoded rawBase64 from close-window-final-identity.json and verified byte equality to server-identity.json; decoded identity equals driver-result.finalIdentity. This confirms the new final-persistence path but does not supply the absent pre-kill evidence.

**Minimal bounded disposition:** stop retries and speculative source fixes here. Retain this fresh blocked attempt and historical real-close attribution gap, name R04/actual during-close BLOCKED_UNOBSERVED_WINDOW in the parent ledger, and choose explicitly whether it blocks only complete destructive-matrix certification or also the next browser prerequisite. No delay injection, fixture substitution, new timeout, weakened clean predicate or speculative production repair is justified by this attempt. Any future attempt or instrumentation change needs a new bounded decision/authorization; none is implied.

## Reconciliation with retained17 matrix

Retained execution-results.json was parsed:17 distinct pairs, matching the prior audit's matrix; four new pairs are existing scenario requirements, not added replacement requirements. Preserve the original files and dispositions below.

| Retained row                | Retained disposition                                       | Fresh reconciliation                                                                      |
| --------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 01 R01 SIGTERM              | Strict positive accepted                                   | Retain; normal acceptance basis.                                                          |
| 02 R02 SIGINT               | Strict positive accepted                                   | Retain.                                                                                   |
| 03 R02 repeated             | Strict positive accepted; no per-call close counter        | Retain exact limit.                                                                       |
| 04 R02 shell-group          | FAILED_OR_BLOCKED; diagnostic identity/event defect        | Historical failure retained; new01 separately closes current contract.                    |
| 05 R03 pre-ready            | Child/consumer negative; diagnostic0 interface gap         | Original not relabeled; new02 supplies actual CLI1.                                       |
| 06 R03 in-flight fixture    | Child SIGKILL/consumer1; diagnostic0 interface gap         | Original not relabeled; new03 supplies actual CLI1, fixture scope retained.               |
| 07 R04 before-ready         | Orphan negative/absence supported                          | Retain; not actual during-close replacement.                                              |
| 08 R04 unresolved-startup   | Local deadline orphan fixture                              | Retain non-graceful/local-self-kill limit.                                                |
| 09 R04 during-close real    | Kill sampled, final completed without disconnect causality | Historical attribution gap retained; fresh04 also BLOCKED, with no destructive injection. |
| 10 R04 during-close fixture | Disconnect/EOF/timeout negative                            | Retain; not real-preview substitution.                                                    |
| 11 R05 child143             | Negative; includes IPC authentication failure              | Retain causation caveat.                                                                  |
| 12 R05 childSIGKILL         | Abrupt negative                                            | Retain.                                                                                   |
| 13 R05 protocol-failure     | Identity error negative                                    | Retain.                                                                                   |
| 14 R05 close-reject         | Primary close failure retained                             | Retain.                                                                                   |
| 15 R05 persistence-failure  | Incomplete final identity rejected                         | Retain.                                                                                   |
| 16 R06 stale-listener       | Real refusal evidence, no application telemetry            | Retain narrower refusal contract.                                                         |
| 17 R07 snapshot-change      | Private manifest change rejected                           | Retain.                                                                                   |

Historical B01 remains expected-red143/null, incomplete close; not rerun or promoted. Read-only comparison against prior210-file artifact inventory found the same two authorized canonical driver/test deltas identified in accepted audits; no new historical-path mismatch. Exact relocated historical-byte verification was not completed in this audit because the later combined inert replay/preservation/hash operation hit a tool approval gate; prior accepted audit's208 unchanged paths plus two saved original-byte sets is not reasserted as a fresh completed check here.

## Fresh PID/socket cleanup

At2026-11-15T09:35:08.280151+00:00, independent read-only `/proc` inspection deduplicated20 retained exact PID/startTicks/PGID/SID identities across the four results, including driver identities and observed descendants. None remained, treating matching zombies as present rather than absent. Collected64 retained socket inodes; none occurred in current TCP/TCP6 tables; no LISTEN on5291. Persisted cleanup independently agrees for every row. This does not invent child events or count child-local self-kill as graceful close.

## Browser prerequisite decision

**Technical recommendation: sufficient normal R01/R02 lifecycle evidence exists for considering the already bounded browser prerequisite separately.** Retained direct SIGTERM/SIGINT/repeated positives plus repaired shell-group actual supervisor/child0 and unchanged strict consumer0 establish the normal start/stop boundary; fresh R04 itself also cleanly stopped, although it cannot satisfy its destructive contract. Fresh cleanup provides no leak blocker.

**Authority/status recommendation: require explicit parent decision first.** Record that normal lifecycle acceptance is the prerequisite for that separately authorized browser observation while full destructive lifecycle certification remains BLOCKED on R04 actual during-close. Do not describe full lifecycle ACCEPT, close the destructive tracker, waive original09, or claim browser/WebGL success. If the parent retains the prior all-matrix dependency unchanged, the browser prerequisite remains blocked. No new browser/server authorization is issued by this audit.

## Evidence hashing and audit limitation

The exact candidate freeze and all19 referenced accepted artifacts were freshly hash-verified above; all33 runtime source and37 dist entries per attempt were hash-verified against actual bytes. The new runtime/approval artifact hash manifest requested by the task is **not completed**: a later read-only/inert replay plus historical-preservation and new-artifact-hash aggregation operation was stopped by the tool's one-shot approval gate. It was not bypassed or retried. No invented digest or completed-manifest claim is supplied. Approval is pending for that final verification slice.

An earlier inert observer-replay command failed before execution with a JavaScript newline-escaping SyntaxError; it produced no runtime side effects. The independent consumer execution described above did complete successfully before that failure. Retained observer records were inspected directly; a fresh automated validator replay is not claimed. These verification limitations do not change the directly evidenced R04 BLOCKED verdict, but this report is not represented as completing every requested hash/preservation acceptance criterion.
