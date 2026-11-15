# Lifecycle control driver — pre-B01 independent-review handoff

**Review candidate only; no runtime authorization or implementation ACCEPT.** Accepted plan: `2a954b8fa72abd39221b73c5f00f214cc37f04fe7b6820f94d668bb5764df4a3`. The independently accepted plan's ordered gates remain authoritative. No Vite/server/browser was started, B01 was not run, and no canonical original module was repaired.

## Artifacts and freeze

`QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`.

Only new executable sources:

| Source relative to QA                        | SHA-256                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `harness/tests/server-lifecycle-control.mjs` | `8dcafec0db48dfd7e3de5d749bae6945e4e6f0e271fdd833effe56349dc33e87` |
| `harness/tests/server-lifecycle.test.mjs`    | `51f513db999c5b29dc82098a602a3349649b9b9c150a2f1a2722130b0d883876` |

Freeze/evidence: `QA/repairs/lifecycle/driver-stage/`.

- `driver-freeze.json`, revision2 SHA-256 `7cd2234c40c7ea4e672016a7e746e8e078805490ced6ccefb116b57e73363fb9`; exact copies under `frozen-driver-v2/`.
- `original-inventory.json` and archival `original-harness/`: all **28 original files** preserved and rechecked unchanged after final tests; original digest `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`. Archives are never baseline execution targets.
- `final-verification.json`, `final-verification-{0,1,2}.log`: final command argv/individual exits and literal output. Earlier freezes/checks are retained, not overwritten by the final revision.
- Each `offline-*/` contains exact consuming blocks/hash, persisted observer fault records, coverage ledger and retained orphan PID/start/group/session records. Exact consumer-block hash: `3d9f28ac3bece5df18006f9dd77ed9b041956a01d6f2c898f60411fa7240352b`.

## Implemented control boundary

Import-safe external controller; exact six-argument interface from the plan, no implicit all-cases launch. B01 refuses noncanonical roots and byte-drifted originals, records the hardcoded original child's canonical target, then independently observes actual argv/executable/PID/start ticks/PGID/SID, child QA environment and listener socket inodes. Regression requires sibling child resolution and unchanged original consumer/config/predicates/specs/tests. Explicit inherited immutable preview environment, locked Node, fresh exclusive attempt, and unoccupied port are prerequisites. Inherited CI is recorded, never forced true.

A **parent-created approval file** named by absolute `QA_LIFECYCLE_APPROVAL` is mandatory before spawn. It must contain:

- `version:1`, `authorized:true`, `stage:"server-only"`, nonempty `parentApproval` and `independentDriverReview` references;
- exact `driverHash`, `supervisorHash`, `serverHash`, `root`, `mode`, `caseId`, `output`, future ISO `expires`;
- `environmentHash`: SHA-256 of compact `JSON.stringify(explicitEnvironment(process.env).environment)` in actual inherited insertion order, including `QA_LIFECYCLE_APPROVAL`; no secret values are needed by this driver;
- `scenario:"SIGTERM"` for B01; later regression also requires `lifecycleImplementationReview`.

No approved file was created. All frozen source/test hashes are checked again. The driver cannot confer approval on itself; review references are assertions supplied by the parent, not independently authenticated signatures.

Readiness observation is capped at30000ms; shutdown/orphan observation uses the same absolute10000ms terminal cap, with emergency identity-checked reaping at9000ms and remaining time only for readback. Repeated signals do not reset it. Emergency cleanup is a failed row. Cleanup retains detached children/descendants before supervisor SIGKILL, signals only retained proven identities/groups, distinguishes zombies from actual absence, and never kills by process name or port. Missing exit/close is never synthesized. Unproven ownership or surviving listeners remain blockers. Logs are capped at1MiB. Expected B01 red may give diagnostic driver0 but is explicitly labeled **NOT_CLEAN**, never successful lifecycle shutdown.

## Offline verification actually run

Locked Node `--check` on both new files: **exit0 independently**. Locked Node `--test QA/harness/tests/repair.test.mjs QA/harness/tests/server-lifecycle.test.mjs`: **65 tests passed, 0 failed/skipped/cancelled**, exit0. This includes the unchanged original suite; the count includes nested subtests and is not a runtime-matrix acceptance claim.

- Retained real143/null/missing-completion record still rejected through exact `run.mjs` consuming statements evaluated in `node:vm`, with real imported predicates and filesystem targets; no consumer rewrite.
- Actual original observer records from benign real Node children: clean0/null positive, actual143/null, actual SIGKILL and actual0 without final identity negatives. Exit and close remain distinct. Snapshot/harness/identity/incomplete/runner-status negatives retained.
- IPC authentication/version/type/session/PID/ordering/signal negatives, including actual IPC wrong-session delivery followed by real child0. An **external controller-only monotonic failure sink** poisons persisted existing `state.error`, and the exact consuming code rejects those records even after late clean-looking events.
- External identity-validator fault records cover full environment/output/origin, process/session, complete before/after manifests, served hashes and completion; these reach the unchanged consumer. They are **not** pending production-supervisor validation proof.
- Actual benign detached child plus grandchild, unresolved-startup/nonresolving-close fixture, inherited non-CI identity, real supervisor SIGKILL, child IPC-loss local deadline/group termination, exact owned PID absence readback; no external rescue required in the observed fixture.
- Original wrong-session/unchanged:false/missing-closeFinished holes remain explicit passing **counterexample assertions**: the old observer really accepts those close-completed identities. They are not claimed fixed.

## Mandatory limits / remaining work

This is the **pre-B01 driver/offline boundary slice**, not a complete R01–R07 regression implementation or O01–O08 production-lifecycle acceptance. The following must not be hidden behind the green offline count:

1. B01 and every real runtime row are **NOT RUN**. Independent source/ownership review must precede a separately parent-authorized B01 runtime slot. Baseline-red must target still-original canonical harness; stop on nonreproduction.
2. Actual production lifecycle factory, IPC transport, supervisor validation and atomic reserved publication do not yet exist. Therefore O02/O03 real-factory cases, full O04/O05 production seams, O06 persistence-fault matrix and corresponding O07 production-validation records remain behind B01 and authorized repair. Current inline orphan fixtures and external failure sink do not satisfy those future production-module gates.
3. Dispatcher has guarded R01/R02/R03/R04/R05 scenario paths for later review, **not completed acceptance**. R03 in-flight is deliberately rejected without a controlled acquisition seam; R04 during-close rejects if its sampled close window was missed. R05 child143 is diagnostic, not guaranteed143 after repair. Shell-group0/null attribution needs further reviewer attention because the actual shell may itself terminate on group SIGTERM.
4. **R06/R07 dispatch is explicitly blocked before spawn**, not silently approximated with a probe. Actual installed Playwright refusal, owned stale HTTP listener/Vite strictPort refusal, reuse-path negatives and private snapshot-change fixture still need implementation before full server-only regression acceptance. R04 unresolved-startup production fixture and R05 injectable production close/IPC/persistence fault scenarios also remain pending.
5. Current offline suite intentionally asserts originals are untouched; its pre-B01 counterexamples must be separated/adapted and refrozen when the later authorized production repair is implemented. No permission to alter originals follows from this handoff.

Next eligible action: independent **pre-B01 driver source/ownership review** pinned to revision2 hashes; resolve its findings and obtain explicit delivered ACCEPT for that unit. Only then may the parent separately authorize canonical B01. Original three-module repair, full server-only matrix, browser prerequisite and any fresh33-case baseline each retain their later explicit gates. No application, dependency, OS, browser flags, timeout policy, immutable dist, original test or consumer edits were made in this stage.
