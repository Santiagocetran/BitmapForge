# CLI prerequisite P — independent stage-1 repair audit

## Verdict: ACCEPT — stage 1 only

**R1 and R2 are resolved at the reviewed checkpoint. Stage 1 is ACCEPTED.** No further stage-1 correction is required. This supersedes the original stage-1 REVISE verdict only for its two bounded findings; it does not rewrite that historical audit or accept full P. **Full P remains unaccepted**, C remains REVISE, and A/B ancestry and release/deployment gates remain separate.

The accepted helper source/API/hash below may be transferred to the stage-2 owner after the coordinator explicitly assigns ownership. This verdict does not grant the browser slot: QA still owns that lane. No install, build, browser launch, implementation edit, timeout change, remote action or commit was performed by this reviewer. The sole authored file is this audit.

## Reviewed checkpoint and preservation

Repository `bitmapforge-research`, branch `gloin/release-hardening`, HEAD/base `550842cab61002c7cc6563e50b9fcdeb17c9bf01`; delivery remains uncommitted. Read AGENTS, web-product-development, accepted P plan/independent plan audit, original stage-1 audit, repair handoff, actual three repaired files and sibling `bitmapforge-cli-P-evidence/stage-1-repair/` evidence. Governance-listed COLLAB files and searched CODEX configuration are absent.

Independently recomputed hashes and compared bytes, not merely reported counts:

- Original stage-1 manifest SHA-256 remains `5271d60ae8f6ce5165b7e174ea975c20d74f16cf5dff52c8d6c84b3280e2c9d4`; original checkpoint diff remains `41d7c3ccd85d35e1b4d8bb14e47a239a07ec5388a9de6481a79f4acec8e00580`. All 12 original delivered-file snapshots under `stage-1/checkpoint/` still match that manifest.
- Revised manifest matches every live delivered file (13), protected file (five) and generated build file (eight). All revised delivered-file `after/` snapshots match; all three repaired-file `before/` snapshots match their original stage-1 hashes. Every recorded evidence hash matches, including commands, mutation logs, escalation JSON and both diffs.
- Revised full checkpoint diff SHA-256: `53c08acc1a15cce937764031867e67f1bce572694675a282cc617c15feaad789`. Repair diff SHA-256: `bbd300ddc06eccd3d6efb157d1aac320f9fda584fb4502c85d244d5528b8b97c`.
- Comparison against original stage 1 changes exactly `cli.test.js`, `cli-cleanup.test.js`, and `cli-integration-helpers.js`, plus the newly added repair report. Production `index.js`, `server.js` and `harness.js`, other delivered tests, fixtures, README and original verification report are unchanged. Protected/build categories have no changes. All five protected files also match Git base. Read-only engine/embed, HTML/headless entry/build configuration and FTP test/fixture paths have no tracked diff against base.

## R1 — resolved: composed lifetime, missing close and failure metadata

References: helper lines 23–37, 54–125; `cli.test.js:265–313`; `cli-cleanup.test.js:153–265`.

The documented owner disposition is correctly confined to P11: historical outer timeout remains 60,000 ms, child deadline is explicitly 40,000 ms, containment reserve is 16,000 ms, and setup/assertion/finalization margin is 4,000 ms. The actual P11 call and outer test consume the exported constants. This is not a shortening of P01–P10's default 60,000 ms child deadline. No timeout is treated as a successful render.

The reserve conservatively sums descendant grace 5,000 + TERM grace 5,000 + post-reap close wait 1,000 + final group polling 5,000 ms. Inspection of the actual waits supports this envelope; phases can overlap or be unnecessary. It is not a hard realtime guarantee under a stalled event loop. The unit budget assertion passes; the retained old-deadline mutation fails with `expected 80000 to be less than or equal to 60000`.

Missing close no longer leaves an unconditional infinite close await after emergency reap: the fallback destroys local output handles, unreferences the child and returns null code/signal with `closeObserved:false` and a secondary containment diagnostic. Its regression is explicitly a mocked process/no real signal, and passed independently. It does not establish escaped-descendant cleanup.

First failure is retained through deadline, overflow and spawn paths. A TERM handler exiting zero still returns deadline failure and emergency-reap metadata. The real TERM-resistant regression requires KILL, genuine close, retained stdout/stderr and byte counts, full TERM grace, and an ESRCH probe of the owned group. Both stream-overflow regressions remain failures. Neither a zero exit after deadline nor successful emergency cleanup becomes application success.

## R2 — resolved: supported postfailure work is observable

References: `cli-cleanup.test.js:54–60,122–141`; retained `verify.py:25–47` and mutation logs.

The injected entries now contain valid `a.bforge`, failing `b.bitmapforge`, supported `later.bforge`, then ignored `notes.txt`. Mutable entries and writes reset per test. Assertions require exactly the first two reads, one launch/start/write, exact first output path and mock payload, actionable second-file error, nonzero dispatch, no later supported read, and first-render browser/server cleanup before the failing read.

The disposable mutation recipe is causally appropriate: it catches render failures, continues through supported later entries, then rethrows the retained failure. The retained control passes; mutation exits 1 specifically because `read:/fixtures/later.bforge` appears. Its nonzero-dispatch assertion had already passed, so this is not merely rejection of an accidentally successful dispatch. The mutation source was restored, and live production bytes match original stage 1. Mutation execution was reviewed from hash-verified recipe/commands/logs, not rerun or represented as a new reviewer mutation run. The corrected actual regression passed independently. Mock payload `abc` is not an encoded-artifact claim; real batch ordering remains unspecified.

## Independent execution

Existing approved executable `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node` reports `v24.22.3`; installed runner reports Vitest `4.0.18`. From `packages/cli`, executed:

```sh
env -u INTEGRATION /home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node ../../node_modules/vitest/vitest.mjs run src/__tests__/cli.test.js src/__tests__/cli-cleanup.test.js src/__tests__/server.test.js src/__tests__/harness.test.js src/__tests__/ftp-security.test.js
```

**Exit 0: five files passed; 111 tests passed, one historical browser integration skipped.** Includes all 16 FTP security/compatibility cases. Missing-close regression took 1,022 ms; zero-exit TERM regression 534 ms; TERM-resistant KILL/close regression 5,530 ms. `git diff --check` also exited 0. Repair-owned ESLint/Prettier successes are retained implementer evidence, not new reviewer lint executions.

An additional independently executed real nonbrowser helper probe used a 500 ms deadline and a child with a no-op TERM handler. Actual result: PID `2407090`, `code:null`, `signal:"SIGKILL"`, `failure:"deadline exceeded"`, `closeObserved:true`, `containmentErrors:[]`, `stdout:"ready\n"`, `stderr:"retained\n"`, byte counts 6/9, elapsed 5,530 ms, `emergencyReap:true`, `groupAlive:false`. A separate postreturn negative-PID probe returned ESRCH. Probe command exited 0 after checking these conditions. This independently confirms the retained escalation evidence without claiming graceful application cancellation or a browser descendant/port ledger.

## Accepted helper freeze and stage-2 transfer conditions

File: `packages/cli/src/__tests__/cli-integration-helpers.js`.

**Accepted SHA-256:** `255be7ab9c87202d5df2abee8452a9e04aa1dcc99c991d45b5eec5da0f39f635`.

Frozen API:

```js
runChild(command, args, ({ deadlineMs = 60000, outputCap = 1048576, ...spawnOptions } = {}))
```

Linux-only detached owned group; forced ignored stdin and drained stdout/stderr pipes. Preserved result fields: `command`, `args`, `pid`, `code`, `signal`, `failure`, `stdout`, `stderr`, `stdoutBytes`, `stderrBytes`, `elapsedMs`, `emergencyReap`, `groupAlive`. Additive accepted fields: boolean `closeObserved` and array `containmentErrors`. First failure is preserved; missing close does not synthesize success.

Accepted frozen exports: `CONTAINMENT_BUDGET` with `descendantGraceMs:5000`, `termGraceMs:5000`, `closeWaitMs:1000`, `postKillPollMs:5000`, `teardownMs:16000`; `LEGACY_CHILD_DEADLINE_MS=40000`, `LEGACY_TEST_TIMEOUT_MS=60000`, `LEGACY_FINALIZATION_MARGIN_MS=4000`.

Actionable remaining gates, not additional feature scope:

1. Coordinator explicitly transfers helper ownership and grants the serial browser slot before stage-2 execution. Recheck this hash before consumption. Any allowed helper additions produce a new checkpoint/hash for review; this freeze is not blanket approval of later edits.
2. Stage-2 render callers retain the accepted 60,000 ms default child deadline and compose the documented 16,000 ms containment plus their finalization margin (documented 80,000 ms envelope with 4,000 ms margin). Decoder commands retain their separate 20-second deadline and appropriately composed caller lifetime. This review changes no timeout.
3. Acceptance callers require genuine successful close/exit, no failure/containment errors/emergency reap/surviving group, and their real artifact assertions. `groupAlive:false` alone never clears application cleanup.
4. Complete the original P01–P11/F01–F11 ledger: actual APNG/WebM outputs, independent decode/statistics and frozen thresholds, requests/console, real recorder/track state, and owned browser-descendant/port closure after settled operations without emergency reaping. Keep historical P11 limitations and startup-blocked before-P evidence explicit. No mock/VM/header-only substitution or new routing/progress/cancellation feature is authorized.
5. Preserve unresolved prior root-format exit 1 and all separate ancestry/runtime/release gates. No full-P ACCEPT is available until the real ledger and remaining mandatory checks receive independent review.
