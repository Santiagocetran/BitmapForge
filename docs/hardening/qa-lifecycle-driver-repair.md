# Pre-B01 driver repair — bounded D1/D2 resubmission

**Status: implementation/offline correction ready for independent re-review, NOT ACCEPTED.** This addresses the two blockers in `qa-lifecycle-driver-independent-audit.md`, not the full lifecycle implementation or runtime matrix. No B01, Vite/server/browser launch, dependency installation, canonical production-harness repair, prerequisite observation or fresh baseline was performed or authorized here.

Repository: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`, shared `gloin/release-hardening` tree. AGENTS.md and web-product-development were read; COLLAB records are absent. Unrelated changes and the independent audit remain untouched. QA below means `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`.

## Corrections

- **D1:** scenario injection now requires `!interrupted`; it cannot initiate ordinary scenario work after terminal interruption. Injection uses `terminalDeadline ||= now + 10000`, like the interruption, readiness-timeout and finalizer paths. An already armed earlier bound is retained. First signal wins. Production budgets remain readiness30000, emergency9000, absolute terminal10000ms.
- **D1 causal offline proof:** VM evaluates uniquely anchored actual driver abort, injection, readiness-timeout and finalizer statements with a deterministic clock. The hash-pinned revision2 source produces deadline10100 then10600, the original **500ms extension**, and fails the same no-extension contract that current source passes. Current source retains10100 across later readiness, SIGINT, readiness timeout and finally, and issues no ordinary scenario signal after interruption. A separate prearmed-bound case prevents the interruption guard from masking an assignment reset; the assignment-reset mutant returns10600. The normal injection-first case retains10600 through later terminal events. These are offline source-path checks, **not runtime signal/deadline acceptance**.
- **D2:** each of the seven protocol negatives captures only an exception from `protocolMessage`; `assert.ok(rejection instanceof Error, ...)` occurs **outside that catch**. Only that genuine exception reaches the external failure sink. Existing observer persistence, exact unchanged consumer rejection, and real wrong-session IPC tests are retained.
- **D2 selective mutation proof:** seven private validator mutants each accept exactly one of null/array/empty object/wrong version/wrong session/wrong PID/unknown type. Each runs the actual seven-negative test in a fresh locked-Node test runner, must exit1, and must fail exactly its corresponding `invalid-message-i` with the validator-rejection assertion. Per-mutant argv, hashes, exact failed case and literal TAP logs are retained. Canonical validators are not mutated. Private copies are offline test artifacts, not relocated B01 targets.
- **Fixture wording:** the benign orphan fixture is now explicitly live intervals plus IPC-disconnect/stdin-EOF containment. It has no pending startup/acquisition promise or close function, does not distinguish which callback fired, and does not establish Vite non-CI stdin ordering. Its coverage record no longer claims unresolved-startup execution.

## Final exact candidate

Only these two external implementation/test files changed:

| QA-relative file                             | SHA-256                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `harness/tests/server-lifecycle-control.mjs` | `536aadc4be0cf253b98dbb3a921d585b18c7269d831d475857eb9540d71881b1` |
| `harness/tests/server-lifecycle.test.mjs`    | `9523cee68c2bfd8f54b564756604770cf87daf2e55dc61c8374f3fd2a16f66b8` |

Fresh revision3 manifest: `QA/repairs/lifecycle/driver-stage/driver-freeze.json`; immutable same-byte copy: `driver-freeze-v3.json`; frozen source copies: `frozen-driver-v3/`. Revision2 manifest is preserved as `driver-freeze-v2.json`; its frozen source directory remains unchanged and supplies the causal old-red source. No approval file was created. Changed hashes invalidate prior candidate approval; separate independent ACCEPT and parent runtime authorization remain required.

## Executed verification

Locked Node: `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`.

| Final command                                                                        | Result                                                                                              |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `--check QA/harness/tests/server-lifecycle-control.mjs`                              | exit0                                                                                               |
| `--check QA/harness/tests/server-lifecycle.test.mjs`                                 | exit0                                                                                               |
| `--test QA/harness/tests/repair.test.mjs QA/harness/tests/server-lifecycle.test.mjs` | **74 passed, 0 failed/cancelled/skipped, exit0**                                                    |
| Original inventory/current/archive comparison, before and after final suite          | **all28 match**, original digest `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096` |

All original65 tests remain; nine new counted tests are the D1 regression, D2 mutation parent and seven selective-mutation subtests. Each mutant's deliberate failure is a required passing mutation-control result, not a production failure hidden in the final total.

Final argv/exits/log hashes: `QA/repairs/lifecycle/driver-stage/repair-v3-final/verification.json`, literal `0.log`, `1.log`, `2.log`; per-file before/after/archive verification: `protected28.json`. Final offline evidence: `QA/repairs/lifecycle/driver-stage/offline-V0Ksmm/`, including `deadline-old-red-new-green.json`, `accepting-mutant-{0..6}/{mutation.log,result.json}`, actual consumer blocks, orphan identities and coverage ledger.

One development run failed because nested Node test runners inherited `NODE_TEST_CONTEXT` and skipped execution with a recursion warning, returning0. That run was retained under `repair-v3/{verification.json,2.log}` and `offline-L6qemw/`. The correction removes only that Node-internal marker from mutant subprocesses, preserves inherited QA/CI identity, and asserts exact selected-test failures. An intermediate green run remains in `repair-v3/final-*`; the final run above additionally hashes actual rewritten private test bytes rather than attributing their originals' hash to them.

## Unchanged boundaries / review request

- All28 canonical original harness files, archive, original assertions, run.mjs consuming blocks and policy predicates remain unchanged. Original supervisor/server/observer deficiencies remain visible counterexamples. No original module was repaired or restored.
- External protocol/identity validator and failure-sink evidence is controller-only, not production observer/supervisor/factory or atomic-persistence proof. O02/O03 production factory, O05 production validation, O06 write-fault matrix and O07 production fault records remain pending.
- R01–R05 retain partial guarded diagnostic dispatch only; none ran. R03 controlled in-flight acquisition, R04 actual startup/close semantics and R05 guaranteed143/injectable production faults remain unresolved. **R06/R07 still block before spawn**, not approximated by port probes.
- **B01 NOT RUN**; no runtime row, Chromium prerequisite or33-case baseline cleared. The historical143/null failure and browser/library blockers remain unchanged.

Request independent re-review of D1/D2, their causal/mutation tests, corrected fixture scope, protected28 integrity and the exact revision3 freeze only. An ACCEPT for this bounded driver slice would still not itself authorize a server launch or production repair.
