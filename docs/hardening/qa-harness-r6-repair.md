# R6 mixed-stage classification follow-up

## Checkpoint: fixed and offline-verified; narrow independent re-review requested

Authority: `qa-harness-repair-audit.md`, section 1 (the sole remaining REVISE). R1–R5/R7 and their stated offline-only acceptance boundaries are unchanged. No browser/server invocation, install, application edit, new acceptance result or release claim occurred. Tooling/CLI retains its browser lane.

External root `QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`. This document is the only repository file owned by this follow-up. External deliverable: `QA/repairs/r6-followup/`; previous `repairs/r1-r7/`, historical run/matrix and original evidence were not rewritten.

## Exact bounded changes

Five existing executable files changed; no file added to the 62-file harness/supplier inventory:

- `harness/specs/accessibility-smoke.spec.mjs`: synchronously persist `scanner.supplemental` independently of the existing scanner fields, with `status: entered|passed|failed`, entry/exit timestamps, and caught exception. Persist entry before awaiting DOM; persist soft/exception failure and successful completion. Retain scanner `qa-blocked` evidence rather than deleting it to obtain failure precedence.
- `harness/lib/repair-contracts.mjs`: shared `accessibilityOutcome` gives supplemental failure, or terminal failure/timeout/interruption during entered-but-unfinished supplemental work, precedence over an earlier scanner block annotation. It also handles old `activeStage: dom` without completion conservatively. Valid scanner results with failed/timed-out work cannot become scanner blocks. Unresolved scanner-only work remains blocked; scanner failure plus demonstrated successful DOM completion remains blocked.
- `harness/run.mjs`: use the shared precedence in the actual runner classification block, including after annotations, and record its resulting blocked decision in scanner-terminal diagnostics. No earlier annotation can reinstate blocked over demonstrated supplemental failure.
- `harness/lib/runtime.mjs`: apply compatible precedence to the actual local ledger outcome expression, using the durable in-memory scanner/supplemental state and retaining both annotations.
- `harness/tests/repair.test.mjs`: add one integrated nonbrowser test with seven causal fixtures. Execute the real accessibility spec callback (Q7.E) with injected nonbrowser stage dependencies, await actual supplemental entry, and evaluate the actual runner classification source block and local ledger expression. The never-settling DOM fixture deliberately does not execute its catch or completion; terminal status is supplied offline, not produced by a live Playwright timeout.

Unchanged: scanner/server implementations, all smoke case IDs, thresholds, fixtures, quality/accessibility policy, deadlines, one worker, zero retries and trace ownership. No retained baseline/final result is reclassified.

## Direct audit counterexample: red → green

`repairs/r6-followup/verify.py` creates a private current-harness copy, substitutes **only the actual pre-follow-up `run.mjs`**, and executes the same integrated regression. This isolates the old annotation override while retaining the causal new spec's scanner-failure/DOM-entry state.

- **Red:** exit 1; assertion `scanner failure then DOM entry timeout without catch`; actual `'blocked'`, expected `'fail'`. Exact output: `counterexample-red.log`. This is the audit's earlier-`qa-blocked` counterexample through the actual runner block, not merely `scannerBlocked()`.
- **Green:** current integrated test passes in the full nonbrowser suite. Both actual runner and local ledger classify:

| Causal fixture                                                                   | Outcome |
| -------------------------------------------------------------------------------- | ------- |
| Scanner exception → earlier qa-blocked → DOM entry → outer timeout without catch | fail    |
| Scanner exception → DOM completes successfully                                   | blocked |
| Valid scanner → DOM entry → timeout without catch                                | fail    |
| UI setup exception before scanner/DOM                                            | fail    |
| Unresolved scanner evaluation, no DOM entry                                      | blocked |
| Scanner exception → caught DOM exception                                         | fail    |
| Scanner exception → DOM soft assertion failure                                   | fail    |

These injected stages are regression diagnostics, not fabricated browser evidence or application acceptance.

## Executed verification and new freeze

```sh
python3 "$QA/repairs/r6-followup/verify.py"
```

Exit 0. Paired Node: `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`.

- Full nonbrowser suite: **14 tests pass; 0 fail/cancelled/skipped/todo**; duration 30685.15289 ms. `nonbrowser-tests.log` and `commands.json` retain actual output/exit.
- Syntax: **27 modules**, each `node --check` exit 0; `syntax.json`.
- Freeze: **28 executable files / 62 complete supplier files**, exact prior full file set. Only the five files above differ; all other supplier/executable hashes and sizes match the incoming freeze.
- All **1,171 original evidence entries** match recorded sizes and SHA-256. Historical matrix remains **198 cells: 38 pass / 28 fail / 33 blocked / 99 not run**. The full suite independently rechecks exact keys/counts and private-copy idempotence. Matrix SHA-256: `67cef4a0c13a587db5a70c7f7189d562445e3705e73f8c7dc101d1bfb0b934cc`.

| Identity                       | SHA-256                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| Incoming executable freeze     | `3bc6339908cdf83d541aebeb57df0510665a2d5dfd6d5560645d9afbc5af21dc` |
| New executable freeze          | `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096` |
| New full supplier manifest     | `e7d2ea693654063f25034bd2bd30e8caa7d7a8eb7ba0e249d152edf58807e5c3` |
| Exact five-file follow-up diff | `6ce08392985be8c020bd35932795ba0bf584fe4f7d5350bc142e2628f3857552` |

`harness-freeze.json`, `repair.diff`, `verification.json`, and `before/` preserve the map, exact diff and incoming executable snapshot. The verifier is separate from the prior verifier: it does not overwrite historical author artifacts or falsely assert equality of concurrently edited application sources.

## Remaining gates / issues

No execution blocker encountered. Independent re-review of this exact freeze remains required. All browser/application findings, missing WebKit library, supervisor real shutdown/trace checks, fresh baseline/final acceptance and other outstanding gates in the audit remain unverified and unchanged. This follow-up adds **zero browser acceptance passes**.
