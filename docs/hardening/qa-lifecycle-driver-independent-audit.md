# Independent audit — pre-B01 lifecycle driver/offline slice

## Verdict: REVISE — driver/offline slice only

The exact revision2 candidate is **not yet accepted for separately authorized B01**. Two bounded corrections below require refreezing and independent re-review. This is not a rejection of the accepted lifecycle plan, nor authorization to repair production modules, launch B01, Vite, a server or browser, install anything, or expand scope.

Reviewed repository HEAD: `550842cab61002c7cc6563e50b9fcdeb17c9bf01`. Read AGENTS.md, web-product-development skill, accepted plan/revision audit, handoff, both new sources, and original supervisor/server/observer/environment/tests. COLLAB records are absent. Unrelated shared changes were not edited. Sole repository write: this audit (not ignored).

## Exact candidate and integrity

| Target                                       | Independently recomputed SHA-256                                   |
| -------------------------------------------- | ------------------------------------------------------------------ |
| Accepted plan                                | `2a954b8fa72abd39221b73c5f00f214cc37f04fe7b6820f94d668bb5764df4a3` |
| `harness/tests/server-lifecycle-control.mjs` | `8dcafec0db48dfd7e3de5d749bae6945e4e6f0e271fdd833effe56349dc33e87` |
| `harness/tests/server-lifecycle.test.mjs`    | `51f513db999c5b29dc82098a602a3349649b9b9c150a2f1a2722130b0d883876` |
| `driver-stage/driver-freeze.json`            | `7cd2234c40c7ea4e672016a7e746e8e078805490ced6ccefb116b57e73363fb9` |
| Original inventory, compact JSON             | `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096` |
| Exact extracted consuming blocks             | `3d9f28ac3bece5df18006f9dd77ed9b041956a01d6f2c898f60411fa7240352b` |

All **28 original entries** match their frozen hashes and archival copies. Both new sources match freeze entries and `frozen-driver-v2/` copies. Original entries were rechecked unchanged after independent execution. Original supervisor/server/telemetry are still unrepaired; no silent baseline relocation or restoration occurred.

## Blocking bounded findings

### D1 — First terminal deadline can be extended after interruption

`server-lifecycle-control.mjs:255` correctly latches the first controller interruption deadline with `terminalDeadline ||= performance.now() + 10000`. However, the later scenario-injection branch (`300–303`) unconditionally assigns `terminalDeadline = now + 10000`, even after interruption has latched. The loop handles interruption only after that branch (`318–322`). A SIGTERM/SIGINT received before readiness can therefore be followed by readiness/injection and an extended terminal window. This violates the first-event absolute cap and repeated-event nonextension contract, including the B01 controller's containment boundary.

An offline VM evaluation of the **exact two source statements**, without starting the controller or any server, reproduced first deadline **10100**, later deadline **10600**, extension **500ms**. Evidence: `qa-lifecycle-independent-offline/deadline-counterexample.json` under profile scratch. This is a source-statement counterexample, not a runtime signal reproduction.

Required bounded correction: retain the earliest terminal deadline on every entry path (and do not initiate a new ordinary scenario after terminal interruption). Add an offline regression that delivers interruption before later readiness/injection, verifies no extension, and checks repeated terminal events. Do not change the 9000/10000ms budgets or production code.

### D2 — Seven protocol-negative tests catch their own assertion failure

`server-lifecycle.test.mjs:97–107` uses:

```js
try {
  protocolMessage(bad[i], expected)
  assert.fail('must reject')
} catch (e) {
  sink.fail(e)
}
```

If `protocolMessage` incorrectly accepts any of those malformed/version/session/PID/type messages, `assert.fail` itself is caught and supplies the poison. Persisted `state.error` and consumer rejection then still pass. Thus those seven subtests prove rejection of _some injected Error_, not that the corresponding protocol validation actually rejected the input. The real wrong-session IPC case is meaningful separately, but does not cover all seven bypassed checks.

Required bounded correction: assert protocol rejection outside the poison-catching scope, capture only the genuine validator error, and then feed that error into the sink. Add a small offline mutation/control proving that an accepting validator makes each affected negative fail. Keep the real IPC and exact-consumer assertions; do not claim this controller adapter implements production protocol handling.

## Independently executed verification

Read both test files and their benign subprocess paths before execution; no Vite/server/browser launch was involved. Used locked Node `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`:

- `--check` control driver: **exit0**.
- `--check` lifecycle tests: **exit0**.
- `--test` original `repair.test.mjs` plus new `server-lifecycle.test.mjs`: **65 passed, 0 failed, 0 cancelled, 0 skipped; exit0**.

Literal logs and per-command argv/exits: `/home/agent/.hermes/profiles/gloin/cache/scratch/qa-lifecycle-independent-offline/{0.log,1.log,2.log,results.json}`. Fresh test evidence: `QA/repairs/lifecycle/driver-stage/offline-Ed9lKH/`. Passing counts do not overcome D1/D2 or establish runtime acceptance. One additional optional fixture-identity probe was held pending tool approval and was not executed or used as evidence.

## Boundary checks that hold at this stage

- **Canonical target:** baseline mode permits only B01 at the canonical realpath, verifies all original entries, checks original hardcoded child resolution, and records actual owned child argv/path/hash. Archives are not runnable baseline substitutes. Regression's sibling-resolution check is distinct and does not pretend to relocate canonical env constants.
- **Approval/freshness:** before spawn, require locked Node, explicit immutable preview/Chromium environment, parent approval pinned to driver/source/environment/root/case/output/expiry, both frozen new files, fresh exclusive attempt and unoccupied port. No approval file was created here. Parent review references are assertions, not cryptographic authentication. Regression additionally requires an implementation-review reference.
- **Ownership:** PID/start ticks/PGID/SID are retained; discoveries follow proven descendants/session groups, not names or ports. Signals revalidate identity. Detached orphan members are retained before supervisor loss. Emergency reaping is a failure; zombie presence is not accepted as absence. Listener inode ownership is checked before ordinary ready injection and listeners are read back after cleanup. D1 remains a defect in the otherwise finite cleanup envelope.
- **Caps/events:** readiness30000, first-terminal observation10000 and emergency threshold9000 are encoded; logs cap at1MiB. Actual launcher exit and close are separate; missing events are not synthesized. Original child actual events come through unchanged observer telemetry. Shell-group attribution remains a later regression concern, not B01 proof.
- **Actual consumer:** tests extract unique exact `run.mjs` consuming gate and command-exit statements, execute them with real filesystem records and imported unchanged predicates, and retain their bytes/hash. Historical143/null/incomplete close rejects. Real benign Node0 observer record gives the positive, with snapshot/harness/identity/incomplete/runner negatives. External sink/validator records poison existing consumed `state.error`; these are not production observer/supervisor repairs. Wrong-session/unchanged:false/missing-closeFinished original validation holes remain explicit accepting counterexamples.

## Orphan fixture: what really ran

The inline fixture (`server-lifecycle.test.mjs:173–205`) actually spawns a detached benign child and grandchild, inherits an explicitly non-CI identity, installs IPC-disconnect/stdin-end callbacks, and schedules an80ms identity-checked own-group SIGKILL after loss. The external test kills its benign supervisor, retains all three identities, waits for actual `/proc` absence and fails if external rescue is needed. That passed in this run and retained `orphan-owned.json`.

It **does not implement or invoke a startup/acquisition promise or a close function**: the child stays live with intervals. Therefore “unresolved-startup/nonresolving-close” is a simulated nonprogress analogy, not execution of even a fake pending acquisition/close finalizer. It also proves neither which of disconnect/EOF fired nor real Vite non-CI stdin ordering. Tighten that wording when revising the handoff/tests; actual production factory, startup/late acquisition, close-once, child-local deadline and persistence proofs remain mandatory later. The fixture is useful ownership/transport-loss containment evidence only.

## Explicit remaining gates — no expansion

- **B01 NOT RUN**. After corrections, refreeze/re-review this driver-only unit, then obtain a separate parent-authorized server-only slot. Run against still-original canonical bytes; retain real red and stop if it does not reproduce. Diagnostic expected-red exit0 must remain labeled NOT_CLEAN.
- **Production repair NOT AUTHORIZED by this audit.** Actual lifecycle factory/IPC/supervisor validation, atomic rejecting reservation/publication, O06 write-fault matrix and corresponding O07 actual production-validation records remain behind accepted-plan B01 and implementation authorization.
- **Regression is partial.** R01–R05 contain guarded scenario paths only, not executed acceptance. R03 in-flight lacks controlled acquisition proof; R04 close-window miss rejects and unresolved-startup production fixture remains pending; R05 guaranteed143 and injectable production faults remain pending. No runtime row is cleared.
- **R06/R07 are explicitly blocked before spawn** by the supported-scenario gate. Actual installed Playwright refusal, owned stale listener plus Vite strictPort refusal, stale output negatives and private snapshot-change fixture remain unimplemented. An empty port probe cannot substitute.
- Full server-only matrix and independently accepted repaired implementation precede separately authorized Chromium prerequisite and any fresh33-case baseline. Historical failures and browser/library blocks remain unchanged.

Re-review request is limited to D1, D2, accurate fixture wording, added offline checks and a fresh exact freeze. No original-module fixes, broader driver completion, dependencies, runtime launches or acceptance-policy changes are requested in this pre-B01 correction slice.
