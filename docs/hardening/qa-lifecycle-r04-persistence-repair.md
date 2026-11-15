# R04 mandatory final raw persistence — bounded repair

**Implemented/offline verified; independent review REQUIRED. No runtime authorization or live preview/browser acceptance.** Historical audit remains unchanged: `qa-lifecycle-runtime-contract-audit.md`.

`QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`

`STAGE=$QA/repairs/lifecycle/r04-persistence-repair`

## Correction

Only `harness/tests/server-lifecycle-control.mjs` and `server-lifecycle-runtime-repair.test.mjs` changed. The literal main finalizer now reads one size-bounded final identity byte buffer, parses that same buffer, and publishes `result.finalIdentity` only after the existing mandatory durable writer returns (write, file fsync, directory fsync). Read/parse/write/fsync failure appends its actual error to `result.failures`, retains `closeWindowBlocked`, and yields `FAILED_OR_BLOCKED`/CLI1. Existing failures are not replaced. Cleanup, signal-listener removal, lock close and independent terminal result persistence still run. A partially created artifact is not asserted durable.

Approval gate now reads this new candidate's separate freeze; original approval schema and parent authorization requirements are unchanged. No approvals were created. Old approvals cannot authorize this changed driver.

## Integrated causal evidence

Five added tests execute the **entire actual main dispatcher/finalizer** from source inside the existing isolated VM pattern, with real benign supervisor/detached child, real authenticated close-window SIGKILL, real exit/close callbacks, actual consumer, actual filesystem and actual durable writer. No copied finalizer fragment or mocked durable/fs functions. Port discovery/socket adapters are inert: no socket/server/browser is opened. Discovery and approval adapters are test-only, not runtime approvals.

- New success control: observed orphan failure remains observed; persisted rawBase64 decodes exactly to saved identity and equals the captured final file bytes.
- New filesystem fault: a real directory occupies the mandatory final artifact target, so actual exclusive open raises EEXIST. The row is failed/nonzero, error is retained, no final identity is published, independent terminal report exists, cleanup is absent/nonemergency and `/proc/self/fd` confirms the lock fd is closed.
- Same fault plus earlier consumer failure: both genuine primary failure and persistence error remain in the terminal result; independent cleanup/terminal persistence still complete.
- Exact retained old candidate success control passes.
- Exact retained old candidate with identical real filesystem fault reproduces the defective observed classification with empty failures. This is the causal old-red behavior, not acceptance of that old outcome.

These fixtures prove instrumentation failure ordering, not application preview/orphan acceptance. Final read and fsync exceptions share the guarded path; the new real-filesystem fault specifically exercises exclusive-open failure, not a claim of hardware fsync fault coverage.

## Verification and preservation

Full four-file nonbrowser suite under locked Node v24.22.3: **211 tests passed; 0 failed/cancelled/skipped/todo**, including all previous206. Actual command, exit0 and TAP output: `STAGE/offline-command.json`, `offline-final.log`. Five candidate MJS files pass `node --check`. No cap/deadline, R03 classification, observer authentication, supervisor callbacks, production source or dependency edits.

`STAGE/verify-and-freeze.py` verifies the exact rejected candidate snapshots and prior immutable freeze/checker, all210 historical byte sets (**208 original paths unchanged plus two original byte sets retained under prior implementation before/**), 28 archived originals, 25 protected canonical originals, three R06 production hashes, seven parent-owned integrated-B hashes, and immutable baseline dist checksums. No historical freeze/inventory/failed evidence was rewritten. Installed Vite7.3.7 source-ordering regressions remain in the full passing suite; no installation occurred.

Separate `r04-persistence.patch` is checked and actually applied in a private replay tree; both resulting files must equal candidate bytes. `freeze.json` binds source, tests, snapshots, prior freeze/checker, preservation/syntax/test logs, exact patch/replay result and this report. Recompute hashes during review; do not regenerate the freeze. Evidence details are in `verification.json`, `syntax.json`, `patch-check.json`, `dist-check.log`.

## Remaining gate

Independent source/offline implementation acceptance, then **fresh parent-created approvals** for R02/shell-group, R03/pre-ready, R03/in-flight and R04/actual during-close. No runtime was launched and no automatic retry is authorized. Original actual runtime race, historical failed rows and production acceptance remain distinct from this benign offline repair.
