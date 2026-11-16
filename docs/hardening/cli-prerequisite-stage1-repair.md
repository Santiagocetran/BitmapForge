# CLI prerequisite P — stage-1 R1/R2 repair handoff

**Implemented and locally verified; independent re-review required. Not full P acceptance.**
No stage-2 author may consume the revised shared helper until the independent
reviewer accepts this checkpoint and ownership is explicitly transferred.
Original stage-1 audit remains REVISE pending that review; C remains REVISE.

## Scope and budget disposition

Repository `bitmapforge-research`, branch `gloin/release-hardening`, Git base
`550842cab61002c7cc6563e50b9fcdeb17c9bf01`. Read AGENTS, accepted P plan and
independent plan audit, verification handoff and stage-1 R1/R2 audit.
Governance-listed COLLAB files are absent. Repair changes only:

- `packages/cli/src/__tests__/cli.test.js`
- `packages/cli/src/__tests__/cli-cleanup.test.js`
- `packages/cli/src/__tests__/cli-integration-helpers.js`
- This report.

R1's suggested larger legacy outer timeout is **not** adopted. The explicit owner
instruction freezes its historical **60,000 ms total test timeout**, authorizing
shortening that child's deadline instead. P11 now explicitly passes **40,000 ms**;
the helper reserves **16,000 ms** of conservative additive containment allowance,
leaving **4,000 ms** for setup, assertions, directory removal and scheduler margin.
This is an explicit P11-only budget disposition, not an unnoticed amendment of
P01–P10's accepted render deadline. No timeout becomes a successful render.

The containment envelope comprises descendant-after-close polling (5,000 ms),
TERM grace (5,000 ms), bounded post-reap child-close wait (1,000 ms), and final
owned-group polling (5,000 ms). These phases may overlap or be unnecessary;
the exported sum intentionally budgets them all. Poll intervals are 25 ms;
these are bounded waits, not hard realtime guarantees under an indefinitely
stalled host event loop. A real TERM-resistant child must survive the full TERM
grace, receive KILL, emit close, and leave no owned group before its regression
can pass. If close never arrives after emergency reaping, the helper now returns
a failed result with explicit missing-close diagnostics rather than awaiting
forever. Destroying local pipe handles/unref is harness containment, not proof of
application or escaped-descendant cleanup.

For stage 2, retain the helper's **60,000 ms default child deadline** and use at
least **80,000 ms outer timeout**: 60,000 + 16,000 + 4,000. Decoders retain their
separate accepted 20-second deadline and need their own appropriately composed
caller envelope. No stage-2 integration files were authored/executed here.

## Frozen helper interface (pending independent acceptance)

File: `packages/cli/src/__tests__/cli-integration-helpers.js`

SHA-256: `255be7ab9c87202d5df2abee8452a9e04aa1dcc99c991d45b5eec5da0f39f635`.

```js
runChild(command, args, ({ deadlineMs = 60000, outputCap = 1048576, ...spawnOptions } = {}))
```

- Linux-only detached owned process group; stdio is forced to ignored stdin and
  separately drained stdout/stderr pipes. cwd/env and other existing spawn options
  retain their existing calling convention. No new package or production flag.
- Preserved result fields: `command`, `args`, `pid`, `code`, `signal`, `failure`,
  `stdout`, `stderr`, `stdoutBytes`, `stderrBytes`, `elapsedMs`, `emergencyReap`,
  `groupAlive`. `failure` preserves the first reason; reaping cannot turn a deadline,
  stream overflow or spawn failure into success even if the child exits zero.
- Additive result fields: `closeObserved` (boolean) and `containmentErrors`
  (array of secondary diagnostics, including missing close/reap errors). A
  missing-close fallback has null code/signal, never synthetic success.
- Frozen exported object `CONTAINMENT_BUDGET`:
  `descendantGraceMs:5000`, `termGraceMs:5000`, `closeWaitMs:1000`,
  `postKillPollMs:5000`, `teardownMs:16000`.
- Exported numbers: `LEGACY_CHILD_DEADLINE_MS=40000`,
  `LEGACY_TEST_TIMEOUT_MS=60000`, `LEGACY_FINALIZATION_MARGIN_MS=4000`.
- Every acceptance caller must require no failure, genuine successful close/exit,
  no containment errors/emergency reap/surviving group, plus its artifact assertions.
  `groupAlive:false` alone is not the required application descendant/port ledger.

## R2 regression and causal checks

The fail-fast unit test explicitly injects
`a.bforge → b.bitmapforge (read failure) → later.bforge → notes.txt`.
Entries and recorded writes reset before every test. It asserts exactly the
first two reads, one server start/browser launch, exactly the completed first
write (`/fixtures/out/a.apng`, mock payload `abc`) and exact first-path-only
stdout, actionable second-file error/nonzero dispatch, no third read/start/write,
and first-render browser/server cleanup before the failing read. This is a mock
ownership regression, not a real encoded-artifact claim. Real batch ordering
remains directory-order independent and is still a stage-2 evidence obligation.

A disposable evidence tree, never repository production source, was mutated to
catch each render error, retain it, **continue processing supported later files**,
and rethrow it after the loop. Control: exit 0, one targeted test passed.
Mutation: exit 1, the test rejects the extra `read:/fixtures/later.bforge` even
though final dispatch is still nonzero. A separate disposable mutation restoring
the legacy child deadline to 60,000 fails the envelope assertion (80,000 does
not fit 60,000). Both intentional red logs are retained, not recast as passes.

## Executed verification

Existing approved Node executable:
`/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node`,
verified `v24.22.3`; existing installed Vitest `4.0.18`. No npm acquisition,
installation, build, runtime/dependency edit, browser launch or commit.
`INTEGRATION` is explicitly removed for all verification-script commands.

Evidence directory (sibling of repository):
`bitmapforge-cli-P-evidence/stage-1-repair/`.
`commands.json` records full argument arrays, cwd and each exit; `verify.py`
contains the executable check/mutation recipe.

| Check                                                                        | Actual result                                                                                                                                                                             |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full CLI `node ../../node_modules/vitest/vitest.mjs run`, cwd `packages/cli` | Exit 0; **111 passed, one historical integration skipped; five files passed**. Original 106 tests retained, five cases added; all 16 unchanged FTP security/compatibility cases executed. |
| Owned three JS files: ESLint                                                 | Exit 0, no diagnostics.                                                                                                                                                                   |
| Owned three JS files: Prettier check                                         | Exit 0.                                                                                                                                                                                   |
| `git diff --check`                                                           | Exit 0.                                                                                                                                                                                   |
| Disposable batch control                                                     | Exit 0; one passed, 25 filtered/skipped.                                                                                                                                                  |
| Disposable continue-after-error mutation                                     | Expected exit 1; one failed, 25 filtered/skipped; third supported read exposed.                                                                                                           |
| Disposable old-budget mutation                                               | Expected exit 1; one failed, 25 filtered/skipped; envelope mismatch exposed.                                                                                                              |

New helper tests cover the explicit budget sum/margin; missing-close bounded
failure via a clearly labeled mocked process (no OS signal); real TERM handler
exiting zero but retaining deadline failure; real TERM-resistant KILL/close; and
stderr overflow alongside the retained stdout-overflow, deadline, ordinary
success and spawn-failure cases. The real KILL test checks both original streams,
byte counts, PID, signal, close, elapsed grace, emergency failure, empty secondary
diagnostics and an ESRCH probe of its owned process group.

An additional real, nonbrowser helper probe retained in `escalation-result.json`
returned PID `2399340`, `failure:"deadline exceeded"`, `code:null`,
`signal:"SIGKILL"`, `closeObserved:true`, `containmentErrors:[]`,
`emergencyReap:true`, `groupAlive:false`, elapsed **5,543 ms** for a 500 ms
child deadline. Both stdout/stderr and their byte counts survive. This proves
harness escalation only, not graceful application cancellation.

An initial repair run had **one failed / 110 passed / one skipped** because the
new R2 stderr assertion expected the injected low-level error rather than the
CLI's existing actionable `cannot read file` wrapper. Corrected only that test
expectation; the final full run above passes. The first attempted formatting
command used a wrong CLI-relative path and exited 1 (MODULE_NOT_FOUND); the
correct repository-root formatting/check commands succeeded. No original failure
was removed, and production error handling was not altered to satisfy a test.

## Review artifacts and remaining gates

`repair.diff` compares these three test/helper files against their original
stage-1 bytes and adds this report. `checkpoint.diff` is the full P-owned diff
against Git base, including previously untracked tests, fixtures, README and
verification report. `checkpoint-manifest.json` contains all delivered-file,
protected-file, build-file and diff hashes, plus comparisons to the unchanged
original stage-1 manifest. `before/` preserves the three pre-repair files;
`after/` freezes the complete revised delivery. Original `before-P/`, `stage-1/`,
verification report and independent stage-1 audit are untouched.

Root tests/lint/whole-tree formatting were not rerun for this narrowly owned
repair. The prior root **format exit 1 remains unresolved**; no other owner's
plan/audit was reformatted. Prior baseline/causal failures, legacy blank-output
limitation, unverified render/decode thresholds and absent progress remain as
recorded in the original verification/audit. P01–P11/F01–F11, real browser
request/recorder/track checks and OS descendant/port cleanup ledger remain
mandatory stage-2 gates, requiring the parent's serial browser-slot grant.
This repair does not accept P, C, A/B ancestry, deployment or release.
