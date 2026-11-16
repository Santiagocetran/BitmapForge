# Independent re-review — revision3 D1/D2 driver correction

## Verdict: ACCEPT — exact driver/offline slice only

D1 and D2 from `qa-lifecycle-driver-independent-audit.md` are resolved in the frozen revision3 candidate. This clears the **driver-review prerequisite** for a subsequent, separately parent-authorized canonical B01 and server-repair workflow. It is **not** runtime authorization, production implementation acceptance, or full lifecycle/matrix acceptance. B01 must still run against the original canonical bytes, retain the real red, and stop for review if it does not reproduce; production repair remains subject to the accepted plan and parent authorization.

Read repository AGENTS.md, web-product-development, the prior independent audit, repair submission, both actual source files, revision2/source differences, revision3 manifest and retained verification/mutation evidence. This narrow review made no harness repairs, installs, server/Vite/browser launches or approval files. Sole write: this document.

## Exact accepted candidate

QA root: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`.

| Target                                              | Independently verified SHA-256                                     |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `repairs/lifecycle/driver-stage/driver-freeze.json` | `f8feb540d305cf6682f79cce754656727a983d8b3b9b14a2e98d61094af29f0a` |
| `harness/tests/server-lifecycle-control.mjs`        | `536aadc4be0cf253b98dbb3a921d585b18c7269d831d475857eb9540d71881b1` |
| `harness/tests/server-lifecycle.test.mjs`           | `9523cee68c2bfd8f54b564756604770cf87daf2e55dc61c8374f3fd2a16f66b8` |
| Original28 compact inventory                        | `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096` |

The live manifest equals `driver-freeze-v3.json` byte-for-byte. Both source hashes match manifest entries and `frozen-driver-v3/` copies. All28 protected canonical files match their original inventory and `original-harness/` archive. Original source/assertions remain unchanged; revision2 remains available for causal comparison. The implementation delta is confined to the two new driver/test files, with the driver itself changing only its injection guard and deadline assignment.

## D1 — resolved

Actual control source lines255,300–303,324,339 retain the first armed deadline using `||=` on interruption, injection, readiness timeout and finalization. The ordinary injection condition now explicitly requires `!interrupted`. First signal remains latched. Budgets remain readiness30000, emergency9000 and terminal10000ms.

The regression extracts uniquely anchored **actual driver statements** into a deterministic VM, rather than testing a replacement deadline helper. Independently executed the actual `deadlineProbe` and D1 test body in memory with only evidence-write/coverage callbacks redirected to stdout/no-op:

- Hash-pinned revision2: first10100, after injection10600 — original **500ms extension** reproduced, old contract correctly rejects.
- Current interruption-first: first/after/final10100, no ordinary scenario injection or scenario signal, first signal SIGTERM retained after SIGINT/readiness/finalization.
- Already armed10100 without interruption: bound retained during injection; resetting only the assignment reproduces10600. Thus the new interruption guard cannot conceal the original assignment defect.
- Normal injection-first:10600 retained through later events.

This is source-path/ordering evidence, not a runtime signal/deadline acceptance claim. No material D1 finding remains.

## D2 — resolved

Actual test lines103–106 capture only `protocolMessage` exceptions; `assert.ok(rejection instanceof Error, ...)` is outside the catch and before `sink.fail(rejection)`. An accepting validator can no longer poison the sink with the test's own assertion failure. Persisted observer poison, exact unchanged consumer rejection and separate real wrong-session IPC coverage remain intact; these are still controller-adapter evidence, not production validation repair.

Reviewed all seven retained selective mutants under `driver-stage/offline-V0Ksmm/accepting-mutant-{0..6}/`. Each accepts exactly its chosen null/array/empty-object/version/session/PID/type input. Independently reconstructed every private control/test byte sequence from the frozen current sources, allowing only the specified selective acceptance and first-occurrence helper-import relocation; all matched. Verified recorded rewritten-file hashes, original-test hash, argv and literal TAP:

- Each subprocess exits1, executes the actual selected O04 test and all seven negatives, with zero skipped.
- Only its corresponding `invalid-message-i` fails, with `protocol validator must reject invalid-message-i`; the enclosing test also fails because its child failed. Aggregate nonzero status alone is not the evidence.
- Independently executed the actual validator and extracted actual rejection-assertion statements in memory: all seven originals pass; each corresponding selectively accepting variant triggers the required assertion failure.

The fresh-runner environment copies `process.env` and deletes **only `NODE_TEST_CONTEXT`**. It does not remove or override QA/CI/application identity. Exact selected-case failure checks prevent a recursion-skipped exit0 from passing. The separate, pre-existing orphan fixture's explicit `CI: 'offline-non-ci'` is confined to that fixture, not this recursion fix or the runtime controller.

## Verification and limits

- Fresh independent locked-Node `--check` on both files: exit0 each.
- Independently hash-verified all three frozen verification logs; parsed final suite: **74 tests,74 pass,0 fail,0 cancelled,0 skipped**. This is authenticated retained execution, **not a fresh full-suite rerun by this reviewer**. A full rerun writes new fixture evidence and was deliberately not performed under the sole-write constraint.
- Verified frozen `protected28.json` hash and all28 before/after current/archive records against the original inventory, plus present canonical/archive bytes directly.
- Independent D1 and D2 in-memory execution above: exit0, no evidence files written. Initial read-only analysis probes required correction for the retained Node spec reporter and Python-versus-JavaScript replacement semantics; these were reviewer-probe errors, not candidate defects, and subsequent checks passed.

The orphan fixture wording now accurately states live intervals and IPC/EOF-loss containment, no pending startup/acquisition or close-function execution, no distinguished callback and no Vite non-CI ordering proof.

## Gates explicitly not cleared

- **B01 NOT RUN.** No runtime row, Chromium prerequisite or fresh33-case baseline is accepted. Expected-red diagnostic exit0 must remain NOT_CLEAN.
- Production lifecycle factory, startup/late-acquisition/close-once behavior, supervisor/IPC validation, rejecting atomic reservation/publication, O06 write-fault matrix and O07 production fault records remain pending. Original deficiencies and historical143/null rejection remain visible.
- R01–R05 remain partial guarded paths, not executed acceptance. Controlled R03 acquisition, actual R04 startup/close semantics and guaranteed143/injectable R05 faults remain unresolved.
- **R06/R07 remain unimplemented and blocked before spawn** by the scenario gate at control line237, preceding launcher spawn at263. Port checks do not substitute for these rows.
- Any candidate source/hash change invalidates this exact driver verdict. Subsequent runtime/server-repair work requires its own parent authorization and bounded acceptance gates; this ACCEPT does not expand scope.
