# Independent narrow re-review — R04 mandatory final raw durability

## Verdict: ACCEPT — implementation for four fresh parent-approved runtimes

**The bounded R04-FINAL-PERSIST defect is corrected. ACCEPT the exact frozen driver/test implementation for the already agreed next handoff: fresh parent-created approvals for R02/shell-group, R03/pre-ready, R03/in-flight and R04/actual during-close.** No additional review or unrelated approval gate is introduced. Existing approval schema, environment/target/hash/expiry binding and explicit-attempt restrictions remain unchanged. This is implementation/offline acceptance, not runtime authorization or production lifecycle acceptance. No runtime, preview/server, browser or install was performed; no approval was created. The prior observer/R03 acceptance is retained, not reopened.

## Exact accepted bytes

QA root: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa` (`QA`). Candidate stage: `QA/repairs/lifecycle/r04-persistence-repair` (`S`).

- Freeze SHA256: `8dffea64d1cee4ff71e88207ba656c7a01b5a83487de64f2a67c8826017f3576`.
- Driver SHA256: `cbd5c0dc5ea5718c76aa67b1269b631a517b60d307feea5ebdf52fe32265624f`.
- Repair-test SHA256: `24c910b57c8929374cc298c41db6f3821057ef1cc4e4160b7306b8457b035366`.
- Exact two-file patch SHA256: `8325e470cd14dfb36fe5147ef8f092e997d03451e9398077d38be07818cce42f`.

Independently recomputed **19/19 frozen file hashes before and after the fresh suite**, with no mismatch; did not execute the write-producing freeze generator or regenerate any historical evidence. Reconstructed the complete two-file unified diff from retained rejected-candidate bytes and obtained the identical patch. Both retained replay-tree result files equal current candidate bytes. Prior freeze's **21/21** listed byte sets also verify, mapping only the two authorized current edits to this stage's `before/` snapshots. The sole driver changes are the new candidate freeze lookup and the bounded finalizer correction; production and observer source remain unchanged.

## Actual dispatch/finalizer ordering

Reviewed the literal `main` dispatcher/finalizer, not a copied classifier:

1. `server-lifecycle-control.mjs:671–680` bounds final identity size before reading and rechecks captured buffer length against 4MiB. One captured `raw` buffer supplies both `JSON.parse` and `rawBase64`; there is no second identity read for the raw payload.
2. `durable(...)` returns before `result.finalIdentity` is assigned. The unchanged real writer (`server-lifecycle-runtime-observer.mjs:116–121`) uses exclusive create, writes, fsyncs the file, closes it, and fsyncs/closes its directory. Partial creation is not treated as durable completion.
3. Any stat/read/parse/write/fsync exception reaches the same catch, retaining `closeWindowBlocked` and appending actual persistence-error provenance to `result.failures`. The existing primary failure is not replaced. A nonempty failure list forces `FAILED_OR_BLOCKED` instead of invoking the positive race classifier; unchanged `cliStatus` returns1, and the actual CLI uses it.
4. Owned-process/listener cleanup and consumer collection precede this isolated mandatory write. Its caught failure cannot skip the subsequent finished timestamp, signal-listener removal, lock close and separate `driver-result.json` attempt (`:687–690`). Independent terminal persistence is a separate attempt, not a promise that an entirely unwritable filesystem could still succeed.
5. Existing pre-kill authentication, immutable captured bytes, real exit/close distinctions, cleanup predicates, R03 classification and absolute deadlines are unchanged. The one-buffer bound follows the existing stat/read/postcheck convention; no new streaming-reader or unrelated scope is required here.

## Five integrated causal regressions — independently rerun and read back

All five execute the entire literal main source in the existing VM integration pattern with real benign supervisor/detached child processes, authenticated actual close-window SIGKILL, actual exit/close callbacks, the actual consumer and actual durable writer/filesystem. Discovery/approval and port/socket adapters are explicitly offline test adapters; they are not runtime approvals or application network acceptance. A directory occupying the reserved artifact path triggers the genuine exclusive-open `EEXIST`; no fs or durable function is mocked.

| Variant                        | Fresh actual result                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New success                    | `ORPHAN_FAILURE_OBSERVED_REQUIRES_REVIEW`, no failures; rawBase64 decodes exactly to saved identity and equals the final identity-file bytes.                    |
| New write fault                | `FAILED_OR_BLOCKED`, CLI classifier1, actual EEXIST provenance retained, no `finalIdentity` published.                                                           |
| New write fault + primary      | Same failed/nonzero result; both `Consumer/telemetry unavailable: Error: primary-after-authenticated-dispatch` and final persistence EEXIST survive in order.    |
| Exact retained old success     | Positive observed result and exact raw/identity success control retained.                                                                                        |
| Exact retained old write fault | Reproduces the defect: positive observed result, empty failures and published identity despite EEXIST. This is an old-red counterexample, not accepted behavior. |

Every variant independently verifies absent/nonemergency cleanup, genuine launcher exit/close SIGKILL records, exact terminal-file/result equality and closed owned lock fd through `/proc/self/fd`. Fresh result files were separately read back under `QA/repairs/lifecycle/runtime-contract-offline-ycQ8GN/final-persist-*/regression-result.json` and their terminal files. The old-red test intentionally passes by asserting the rejected old outcome; it is not a claim that the overall test runner should exit nonzero. Together with the identical fault on the new source and both success controls, it establishes the causal repair.

Coverage boundary: this real filesystem regression exercises exclusive-open failure, not a hardware fsync failure. File/directory fsync exceptions are covered by inspection of the same guarded synchronous call chain, not claimed as separately fault-injected runtime observations. The primary-error case injects a test-adapter exception after executing the real consumer; it proves preservation of a prior recorded failure, not a fresh production consumer defect.

## Fresh full offline verification

Locked Node **v24.22.3**, actual command:

```sh
NODE=/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node
QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa
"$NODE" --test --test-reporter=tap \
  "$QA/harness/tests/repair.test.mjs" \
  "$QA/harness/tests/server-lifecycle.test.mjs" \
  "$QA/harness/tests/server-lifecycle-runtime-contract.test.mjs" \
  "$QA/harness/tests/server-lifecycle-runtime-repair.test.mjs"
```

**Actual exit0: tests211, pass211, fail0, cancelled0, skipped0, todo0; duration29122.850842ms.** Includes the prior206, the five new causal cases and the unchanged actual-installed-Vite EOF-ordering controls. All five candidate MJS files independently passed `node --check`: control, observer, lifecycle tests, runtime-contract tests and runtime-repair tests. No acceptance criterion was replaced by the pass count.

Fresh test-owned diagnostic roots also include `QA/repairs/lifecycle/runtime-contract-probes-rxX8k8` and `/home/agent/.hermes/profiles/gloin/cache/scratch/qa-repair-offline-vJAjEJ`. These are offline test outputs, not new live runtime rows. Original frozen suite/log/checker bytes remain unchanged.

## Protected-byte preservation

Independent read-only checks passed:

- **210 historical original byte sets**: **208 original paths unchanged**, two exact original byte sets retained under `QA/repairs/lifecycle/runtime-contract-implementation/before/`; lengths and hashes match. This is not210 unchanged paths.
- **28/28** archived originals and **25/25** protected canonical originals match their original inventory.
- All **three** production lifecycle modules match the R06 freeze: server `1905120d8b52f28f6a730108e82a554b3c4a7433dba59f648d47a0b2a6a99577`, supervisor `cfb37e8c6bdd1f768384c87cf21ad625791468adb79feac99bc89d88ed5e81fd`, telemetry `8bfe012ceaab8bc273ecebf6ba67b5e79d8f169e4997beb9af1b8b5f463d6a80`.
- All **seven** parent-owned integrated-B checkpoint files match their frozen hashes.
- Immutable baseline dist: actual `sha256sum -c ci-sha256sums.txt` exit0, **36 entries** verified. No rebuild or baseline substitution occurred.

## Disposition and limits

**No material remaining implementation finding in this bounded correction.** R04-FINAL-PERSIST is closed for the exact bytes above. The parent may proceed directly with the four previously agreed fresh, hash-pinned approval records and explicit attempts; the repaired driver now selects this separate freeze, so old approvals are not reusable. Actual R03 nonzero remains expected interruption evidence, never clean application success. Actual during-close may still block on the real race and carries no implicit retry permission. Historical failed rows and overall production/browser acceptance remain distinct and unclaimed.

Only authored file: `docs/hardening/qa-lifecycle-r04-persistence-audit.md`. No source, protected evidence, freeze, approval, dependency or other agent-owned file was edited. Initial `/home/agent` repository discovery returned “not a git repository”; subsequent repository inspection used the explicitly supplied integration checkout. No verification blocker was encountered.
