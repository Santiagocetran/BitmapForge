# Bounded runtime-contract repair — implementation/offline handoff

**Implemented; independent implementation review REQUIRED. Runtime overall remains REVISE. No runtime approval, actual preview/server/browser matrix invocation, installation or self-approval was performed.** Written-plan ACCEPT is `qa-lifecycle-runtime-repair-plan-audit.md`; it does not accept this implementation.

`QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`

`STAGE=$QA/repairs/lifecycle/runtime-contract-implementation`

## Candidate and verification

- `harness/tests/server-lifecycle-control.mjs`: dispatches shell instrumentation, selects exact executable/entrypoint roles, retains shell events separately, applies authenticated close-window dispatch and both R03 final classifications. Approval gate now reads **this candidate's** `STAGE/freeze.json`, not the obsolete R06 driver hash.
- New `harness/tests/server-lifecycle-runtime-observer.mjs`: driver-only direct parent of unchanged Node supervisor, inside disposable shell PGID/SID. Only actual supervisor ChildProcess callbacks publish distinct exit and close. Inherited fd3 is excluded from supervisor stdio/environment. Unpredictable 256-bit session, sequence/time/type validation, `/proc` identity cross-checks, exact observer argv/parent/group and supervisor source binding, 1MiB continuously drained stream cap. Driver persists raw NDJSON with synchronous fsync. Observer ignores original group signals without forwarding; production receives original group signal. Stdin is explicitly retained through shell fd4 rather than accidentally redirected by background-shell stdin rules. No new lifecycle grace/deadline policy.
- R03 records injection cause/signal at real dispatch, then separates scenarioObserved, applicationOutcome `INTERRUPTED_NONZERO`, containment and genuine harness failures. Actual CLI returns1 without inserting a fabricated harness error. Both normal pre-ready and controlled in-flight main/finalizer paths were exercised offline.
- R04 actual-preview route remains `during-close`; no controlled fixture substitution. Dedicated durable pre-kill bytes/base64/hash/path, source hashes, child/supervisor identities/environment/session, pending close state, monotonic read time and original deadline precede dispatch. Immediate exact reread and both-live-identity revalidation suppress stale/changed/completed/failed-persistence injection. Signal attempt/result is a separate file. Final same-session raw identity is retained separately. Clean completion, missing window or missing disconnect/EOF attribution becomes `BLOCKED_CLOSE_WINDOW_OR_DISCONNECT_RACE`, CLI1, not acceptance. External reaping remains failed.
- `server-lifecycle-runtime-contract.test.mjs` now explicitly reads retained **old** source for its three known-gap reproductions. It does not mistake repaired behavior for an old-gap pass.
- `server-lifecycle.test.mjs` has only a private-mutant relative-import relocation adaptation; original assertions remain.
- New `server-lifecycle-runtime-repair.test.mjs`: 40 causal offline tests. Genuine disposable shell/observer/Node supervisor/detached benign child; real supervisor0,1,SIGKILL and observer death; missing/delayed close protocol controls; identity/session/role/order/type/cap negatives; persisted R04 dispatch controls plus real benign supervisor SIGKILL and completion/disconnect race; both actual main paths and real CLI subprocesses for R03; selective role and missing-close mutants fail their **corresponding** assertion while unmutated controls pass. Real benign pending-close is only instrumentation evidence, never real-preview acceptance.

Final locked-Node execution: **206 passed, 0 failed/cancelled/skipped/todo** — original166 plus40. `offline-final.log` SHA256 `70494be92c1bb122d077ed5d41a79447a033beb03005f27baf7f08e08be01ee2`. All five changed/new MJS files passed `node --check`. Existing production-factory, deadline nonextension, pre-injection interruption, owned-descendant and genuine missing-close regressions ran in the full suite. The private test VM uses short benign-fixture timeouts only; runtime 8000/9000/10000ms constants are unchanged.

Reproduce offline only:

```sh
QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa
NODE=/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node
"$NODE" --test --test-reporter=tap \
  "$QA/harness/tests/repair.test.mjs" \
  "$QA/harness/tests/server-lifecycle.test.mjs" \
  "$QA/harness/tests/server-lifecycle-runtime-contract.test.mjs" \
  "$QA/harness/tests/server-lifecycle-runtime-repair.test.mjs"
```

Exact patch: `STAGE/runtime-contract.patch`, SHA256 `155398b2d8846f8629214315603ceb35b761fe1c7a0751e4f854800b0a08bc58`. `git apply --check`, actual private-tree application, and byte equality of all five resulting files succeeded (`patch-check.json`). Freeze binds source/test/production/report/checker/log/patch bytes. Do not regenerate it during independent read-only review; recompute the listed file hashes instead.

## Preservation and concurrent promotion

The historical210-entry inventory includes the two **authorized mutable driver/test source files themselves**. Therefore the precise preservation result is **208/210 original paths unchanged, plus both original source byte sets preserved exactly in `STAGE/before/`**, matching the historical SHA256 and lengths. All210 original byte sets survive; this is not a claim that both edited source paths still have old bytes. No historical attempt, failed row, approval, original freeze, inventory or audit was rewritten. The earlier preservation checker expected all210 original paths unchanged and consequently failed on those two source edits; the new checker explicitly verifies their original snapshots instead. This distinction is retained, not hidden behind a claimed210 unchanged-path pass.

Also verified: **28/28 archived original harness files, 25/25 protected canonical originals, all three production lifecycle hashes unchanged**, immutable dist checksum exit0 (36 entries). Check `STAGE/verification.json`, `syntax.json`, `dist-check.log`, `concurrent-B-checkpoint.json` and `verify-and-freeze.py`.

Parent concurrently promoted seven final-B files in the integration repository: root/embed/CLI manifests, root lock, codeExport source/test and generated consumer spec. None was edited/reset by this worker. New lock SHA256 is `bac330dd2d654f5ee0d08a2d0e97ba68829c4568c1df998372f34e5ab8b399ca`. Their exact current hashes are checkpointed and reverified; no install occurred. Actual dependencies remain the parent's prior installation. Future dependency/application measurements require an explicit parent checkpoint/adaptor-pin reconciliation; these offline lifecycle results do not attest newly installed final-B dependencies.

Early standalone offline iterations exposed test-VM setup omissions (existing attempt directory, absent VM spawn/predicate bindings), repaired before the final full run. Fresh probe directories and earlier full-suite log remain. No live preview race was attempted or claimed repaired by fixture success.

## Four-invocation handoff — NOT authorization to run

After independent source/offline ACCEPT, the parent must create four **fresh** approvals with reviewed driver/test/instrument hashes, environment/output/target hashes and expiry under the unchanged approval schema (`approvalGate`/`explicitEnvironment`). Existing R06 approvals fail because their driver hash is stale. Each approval's scenario must match the row below; fresh distinct output attempts are mandatory. Parent collector changes remain outside this implementation: expected R03 CLI1 must be collected as interruption evidence, never clean application success.

In the approved inherited baseline preview environment, set `QA_RUN` to a fresh absolute run root, `QA_PORT` to the parent-reserved serial port, `QA_PHASE=baseline`, `QA_ENGINE=chromium`, `QA_DIST=/home/agent/BitmapForge-hardening-research/baseline/dist`, `QA_LANE` to the approved server-only lane, and matching existing `PLAYWRIGHT_BROWSERS_PATH`/`QA_CHROMIUM_CACHE`. Preserve inherited QA/CI fields; the approval environmentHash includes the literal approval path and attempt. Do not install or start Chromium. These literal commands are ready **only after** parent approval creation and independent review:

```sh
NODE=/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node
QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa
DRIVER="$QA/harness/tests/server-lifecycle-control.mjs"
: "${QA_RUN:?fresh parent run root}" "${QA_PORT:?parent reserved port}"
: "${APPROVAL_R02:?fresh shell-group approval}" "${APPROVAL_PRE_READY:?fresh pre-ready approval}"
: "${APPROVAL_IN_FLIGHT:?fresh in-flight approval}" "${APPROVAL_CLOSE:?fresh actual during-close approval}"
QA_ATTEMPT=repair-r02-shell QA_LIFECYCLE_APPROVAL="$APPROVAL_R02" \
  "$NODE" "$DRIVER" --harness-root "$QA/harness" --mode regression --case R02
QA_ATTEMPT=repair-r03-pre-ready QA_LIFECYCLE_APPROVAL="$APPROVAL_PRE_READY" \
  "$NODE" "$DRIVER" --harness-root "$QA/harness" --mode regression --case R03
QA_ATTEMPT=repair-r03-in-flight QA_LIFECYCLE_APPROVAL="$APPROVAL_IN_FLIGHT" \
  "$NODE" "$DRIVER" --harness-root "$QA/harness" --mode regression --case R03
QA_ATTEMPT=repair-r04-close QA_LIFECYCLE_APPROVAL="$APPROVAL_CLOSE" \
  "$NODE" "$DRIVER" --harness-root "$QA/harness" --mode regression --case R04
```

Collect each command's exit separately (R03 requires1, not generic driver0). Do not run this as a `set -e` sequence that silently omits later approved rows. R02 requires authenticated supervisor exit **and** close0/null, actual strict child-clean and actual consumer0, with separately proven intentional shell SIGTERM. Both R03 invocations require explicit interruption/consumer1 and absent owned identities/listeners, without emergency success. R04 requires actual preview close-window bytes, actual supervisor SIGKILL, same-session disconnect/EOF failure and consumer1; a blocked race stays blocked with **no implicit retry**. Preserve failed04, original R03 rows, real09 and controlled10. No subset/offline total clears lifecycle overall or permits a browser launch.
