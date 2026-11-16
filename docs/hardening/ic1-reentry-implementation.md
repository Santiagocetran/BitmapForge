# IC1 ownership-aware re-entry implementation

## Disposition

**Implemented and browserless-verified; independent implementation review pending. STOP before native execution.** This is not an approval, browser-lane transfer, cancellation acceptance, PR readiness declaration, or permission to undraft, merge, deploy, publish, or modify remote state.

Implementation follows the independently ACCEPTED `ic1-reentry-plan.md` and `ic1-reentry-plan-audit.md`, after the explicit bounded implementation transfer. Read repository AGENTS.md and web-product-development. Named COLLAB bootstrap files were absent. Repository branch remains `gloin/release-hardening`.

Roots under `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- `R`: `bitmapforge-research`.
- `A`: `image-cancel-contract-v1`, retained accepted candidate and historical failure, unchanged.
- `B`: `image-cancel-contract-reentry-v1`, exclusively created for this repair.
- `E`: `B/tests/evidence`.
- Final execution batch: `E/reentry-hlzfvy`.

No native browser, application server, dependency installation, build, canonical harness edit, production change, or remote write occurred. Playwright actually executed a browserless worker; this was not a discovery-only substitute.

## Exact executable delta

Only the three permitted copied existing files changed. Three permitted test sources were added. All other copied harness files and the route test remain byte-identical to their accepted sources.

| Path relative to B                  | Action            | Bytes | SHA-256                                                            |
| ----------------------------------- | ----------------- | ----: | ------------------------------------------------------------------ |
| `harness/lib/env.mjs`               | Modified copy     | 11145 | `dd36b61b9516b517c15aabf4389f7023afd1c261d4512a9c58bdab8e1ca3e596` |
| `harness/config.mjs`                | Modified copy     |  2822 | `97a87af46684af135edef8c8a2527b611279a754db18ead93fe2dfe0c63992f1` |
| `tests/ic1-relocation.test.mjs`     | Modified copy     |  6139 | `d0f2cd2ad342353ddab1fba8e6e21a55c447c7de04e4105cdef7ea43c2a8c590` |
| `tests/ic1-reentry.test.mjs`        | New               | 17639 | `68818c8ac9cf7db6caab938d35aa2516097274f52d7e2d79156c0c311cdd096c` |
| `tests/fixtures/reentry.config.mjs` | New               |  1113 | `85a1a3b5171a2651e7910d0c75f8e1550edcbfa1b59c7f0bd50cbed6152079cd` |
| `tests/fixtures/reentry.spec.mjs`   | New               |   682 | `67e388d40ecb3d28b9f718634416d2903f3fd060c6752dc970ed537a6a96485e` |
| `tests/ic1-route.test.mjs`          | Unchanged control | 10829 | `c2cb12479568e0040ea36275c7cd2eec5299ba2f313c5b356ff2dabf9613103a` |

`E/final-v3-accepted-to-candidate.patch` includes the complete accepted-to-candidate delta and new fixture sources. `E/final-v3-projection-mutant-diffs.patch` retains the exact generated old-source and selective-mutant deltas. The old-source projection changes only its relocation-dependent Chromium cache operand to the same retained cache; the relative module roots naturally relocate. Its config and refusal logic remain the original bytes. It never executes A as a writable attempt.

This report is the only repository file created by this implementation. Additional outputs are confined to B's allowed preserved, evidence, and fresh run trees. Generated old-source/mutant fixtures are beneath unique E subtrees, not new production modules.

## Guard behavior

- Existing graph, spec, supervisor, output-containment, pinned environment, helper and temp/cache checks still run before claim/output mutation, on first entry and reload.
- Fresh claims reject existing output and foreign root contents. Only real, contained preparatory tmp/cache directories are allowed. `wx` creates the run-root `.ic1-owner.json`; freshness is checked again after claiming.
- The record binds schema, private root, run, phase, lane, engine, attempt, output, dist, owner PID and Linux start ticks. Its unpredictable nonce digest is stored in the marker. The nonce and identity travel only in `IC1_CONFIG_OWNER` after successful initialization.
- Claims initially remain `pending`. Config writes the same three `.keep` files only on first entry, then synchronously publishes `ready` and local issued state/capability. An injected second `.keep` failure leaves a consumed pending marker with no exported authority; subsequent config fails instead of repairing it.
- Reload requires matching marker/capability digest and tuple, a live owner with matching start ticks, and either locally issued same-process state or independently observed direct parentage. `/proc` parsing accounts for parenthesized command names and refuses zombie/dead/malformed states.
- Reload performs no initialization writes. Marker, `.keep`, and owned sentinel bytes/mtimes survive same-process and direct-child reload. Runner diagnostics and sentinels live outside runner-cleaned results/report folders.
- No stale-marker adoption, automatic repair, marker deletion, nonce rotation, arbitrary ancestry walk, worker-index authorization, or output cleanup was introduced.

The threat model remains the accepted trusted private harness, not hostile same-user executable authentication.

## Preservation

Before any candidate edit, B/preserved received exact copies of A/harness and both accepted test files. `B/preserved/pre-inventory.json` recorded 834 original file paths, sizes and SHA-256 values across A/harness, A/tests (including every prior evidence file), A/original, A/native-evidence-20261116, A/runs/n16c, A/native-check.py, and the canonical QA harness.

`E/preservation-mapping.json` maps original → preserved → candidate paths for copied existing files, retaining original hashes. Use the final-v3 pins for all final executable identities, including new tests. The copied-existing-file hashes have not changed since that mapping.

`E/final-v3-preservation.json`: **834 before, 834 after, path union 834, zero differences**. All 35 entries referenced by the historical native evidence index were independently read and verified, not merely the index itself. No old index was regenerated. The historical Chromium worker-init failure and secondary EADDRINUSE observer failure remain unchanged; TIME_WAIT is not being reclassified as a listener.

**Final metadata sealing completed after explicit user approval.** `E/final-source-allowlist.json` verifies the complete 72-file candidate source/configuration path set without a suffix filter: exactly the three permitted modified copies and three permitted new test sources, no removed or unexpected paths. All 14 final-v3 source/toolchain pins still match; preserved copies match their originals. The historical path-union comparison was repeated: 834 before/after, zero differences, and all 35 historical index references verified. `E/final-delivery-checks.json` records the final post-edit report formatting and diff checks. `E/evidence-index.json` seals the complete B tree (files, symlink identities and directories), excluding only itself, plus this final report. Every pre-existing B evidence/file byte is retained; earlier run logs, expected failures, projections and intermediate summaries were not overwritten. The index is generated last to avoid recursive hashes; its exact SHA-256 is supplied in the handoff rather than embedded in this indexed report. No behavioral suite was rerun for sealing. Independent implementation acceptance remains pending.

## Toolchain and literal commands

- Explicit Node: `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node`, actual **v24.22.3**.
- Prepended PATH: `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/.bin`.
- Installed `@playwright/test`: **1.59.1**, unchanged.
- Node binary, installed runner source/package pins and all candidate/test pins: `E/final-v3-source-toolchain-pins.json`.

Final suite command, executed from `/home/agent`:

```sh
export PATH=/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/.bin:$PATH
timeout 120s /home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node \
  --experimental-vm-modules --test --test-timeout=120000 \
  /home/agent/.hermes/profiles/gloin/cache/scratch/image-cancel-contract-reentry-v1/tests/ic1-*.test.mjs
```

Stdout/stderr: `E/final-v3-suite.log`; actual suite exit **0**. The shell tool's outer exit is not substituted for the recorded suite exit. Literal summary:

```text
ℹ tests 57
ℹ suites 0
ℹ pass 57
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 31447.285087
```

Syntax: explicit Node `--check PATH` for every copied harness module and all five test/fixture modules, **37 commands, each exit0**, with complete argv/output in `E/final-v3-syntax.json`.

The test invokes the actual installed CLI, without `--list`, using:

```text
NODE R/node_modules/@playwright/test/cli.js test --config B/tests/fixtures/reentry.config.mjs
```

Each child result records complete argv, relevant environment identities with capability redacted, stdout/stderr, native ChildProcess exit and close, bounded cleanup, and observed process absence. Actual cwd is R. Browserless commands have a 60-second subprocess bound and the fixture has a 30-second timeout; benign children are individually bounded to at most 30 seconds. Native configuration budgets were not changed.

Document delivery checks are retained in `E/delivery-checks.json`: explicit Node24 with the installed `prettier/bin/prettier.cjs --write` and `--check` on this report both exited0; `git diff --check` exited0. Git reports this report as untracked alongside the pre-existing handoff documents; no tracked repository diff was introduced. This is a report-only format check, not a claim that the entire repository was reformatted or verified.

## Discriminating results

| Verification                                                  | Literal result                                                                                                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actual installed browserless runner                           | exit0, `Running 1 test using 1 worker`, `1 passed`                                                                                                |
| Parent config / worker config / body                          | PID 3791031 / PID 3791044 / PID 3791044; worker PPID 3791031; body ran                                                                            |
| Parent-to-worker preservation                                 | Marker, all three `.keep` files and sentinel bytes/mtimes identical                                                                               |
| Identical fixture with retained old guard/config              | exit1, `IC1 existing attempt destination`, `1 failed`; parent config recorded, no worker body                                                     |
| New independent CLI against consumed successful root          | exit1, `IC1 existing attempt destination`; no body; entire pre/post file inventory including sentinels unchanged                                  |
| Fresh absent and tmp/cache-only roots                         | pass                                                                                                                                              |
| Same-process and direct-child repeated actual config          | pass, read-only reload                                                                                                                            |
| Live-owner sibling with copied token and spoofed worker index | exit1, `IC1 owner ancestry mismatch`; sentinel inventory unchanged                                                                                |
| Grandchild with copied token                                  | exit1, same ancestry refusal; real exit/close retained                                                                                            |
| Owner exit followed by stale inherited token                  | refused; marker/evidence not changed                                                                                                              |
| Concurrent contenders                                         | one exit0, one exit1; no second successful initializer                                                                                            |
| Partial initialization                                        | injected `.keep` error retained in consumed pending claim; no capability; subsequent attempt refused                                              |
| Zombie-state oracle                                           | genuine process-stat read with deterministic Z-state substitution rejected; this is an offline parser fault injection, not a native zombie launch |
| Chromium and Firefox smoke discovery                          | each exit0, exactly Q1.image.D and Q1.image.N, `Total: 2 tests in 1 file`                                                                         |

The final guard suite also rejects unmarked output, foreign content, a file named tmp, missing/wrong nonce, wrong ticks/dead PID, corrupt/truncated/wrong-version marker, marker symlink, changed attempt/phase/lane/engine/dist/private root, new-root token retargeting, copied marker/token, missing marker, worker-index-only forgery, helper/TMP/TEMP escapes, missing explicit temp/cache, historical/traversal/symlink paths and canonical spec/supervisor execution. The new negative helper snapshots the complete attempt file inventory before invocation and compares it afterward. Existing route/oracle tests remain the original VM tests, not native cancellation evidence.

Six selective mutants were each paired with an unmutated control executing the same named negative:

| Mutant                               | Control                          | Mutant result                                                                          |
| ------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------- |
| Accept existing output without claim | exit0, named freshness rejection | exit1, `ERR_ASSERTION: named negative freshness must reject`, actual0 versus expected1 |
| Ignore nonce digest                  | exit0, named nonce rejection     | exit1, corresponding named nonce assertion                                             |
| Ignore current tuple                 | exit0, named tuple rejection     | exit1, corresponding named tuple assertion                                             |
| Ignore executable-live process state | exit0, named liveness rejection  | exit1, corresponding named liveness assertion                                          |
| Ignore owner start ticks             | exit0, named ticks rejection     | exit1, corresponding named ticks assertion                                             |
| Ignore ancestry/local ownership      | exit0, named ancestry rejection  | exit1, corresponding named ancestry assertion                                          |

These are discriminating assertion failures caused by the mutant accepting prohibited reload, not setup/import failures. Full generated sources, exact mutations, inner child lifecycle records, and outer command results remain in `E/reentry-hlzfvy`. Sentinels are compared in the control/mutant probes before the acceptance assertion.

Process sampling observed only the explicit Node CLI and installed Playwright Node worker for actual-runner commands; all observed owned PIDs were absent after close, with no forced cleanup. The fixture requests no browser/page/context/request/auto-browser fixture, and the adapter disables webServer only after calling the real guarded config. Sampling is supporting bounded observation, not a claim that polling can prove absence of every arbitrarily short-lived process.

## Retained failures and iteration ledger

No unexpected failure has been discarded:

| Log                  | Exit | Literal suite result |
| -------------------- | ---: | -------------------- |
| `initial-suite.log`  |    0 | 53 pass, 0 fail      |
| `second-suite.log`   |    0 | 54 pass, 0 fail      |
| `third-suite.log`    |    0 | 55 pass, 0 fail      |
| `final-suite.log`    |    0 | 57 pass, 0 fail      |
| `final-v2-suite.log` |    1 | 56 pass, 1 fail      |
| `final-v3-suite.log` |    0 | 57 pass, 0 fail      |

The final-v2 failure was the **test observer**, `only browserless Node runner processes observed`, during the consumed-root negative. Its real CLI exit was correctly 1 for existing-attempt refusal. A final `/proc` read replaced a previously observable argv with an empty exiting-process cmdline. The local test observer now retains the last actually read nonempty argv for the exact PID/start-tick identity and counts empty samples; it does not fabricate an executable or waive unknown-process checks. The old failed record remains intact. The full suite was rerun after this test-only correction. Old-source worker failures, consumed-root refusals and all six mutation failures remain literal exit1 records, not counted as repaired native acceptance.

Earlier exploratory race fixtures retained an expired token in private run-local `captured-token` files to exercise stale-owner rejection. Those earlier evidence bytes were not erased. Final tests use IPC for the live sibling/stale-token case and redact capability values from diagnostic records; no live capability is published in this report.

## Finite independent-review handoff

Review exactly the six changed/new source files and their final-v3 hashes, the unchanged route control, and the final-v3 evidence batch. No further implementation or native approval is claimed here.

1. Review the sealed `E/evidence-index.json`, `E/final-source-allowlist.json` and `E/final-delivery-checks.json`, including this report's indexed hash. Metadata sealing is complete under the user's renewed approval: source identity, full path allowlist, original-path union preservation, historical 35-entry index references and final report formatting/diff checks have been verified. No native or browserless tests were rerun merely to finish metadata. Independently verify the supplied index hash and its entries before reviewing the exact candidate.
2. Audit pending → ready publication, nonce/local state, complete tuple, proc parsing/live state/start ticks/direct parentage, exclusive claim, and no initialization writes on reload.
3. Inspect the actual installed-runner parent/worker/body records, retained-old worker-init failure, consumed-root sentinel preservation, six selective-mutant controls/failures, and the observer failure/fix attribution.
4. Deliver an explicit independent **ACCEPT or actionable rejection of this guard/re-entry implementation only**, pinned to the final hashes. If replaying, use fresh roots; do not reuse consumed attempts or overwrite prior evidence.
5. **Stop before native execution.** Native work requires a new parent grant and current exclusive lane transfer after implementation acceptance, fresh per-engine roots, immutable-build/browser/toolchain rechecks and a separately chosen bounded observer method. Neither prior authorization nor this report grants it.

Still open: genuine Chromium/Firefox image-cancel routes, all eight preservation fields and full artwork equality, downloads, return-cube preview, no-alert/loaded screenshot, historical engine matrices, other deferred hardening/manual/release gates, approving review and PR98 readiness. No equality threshold, animation contract, native timeout, browser selection or release gate was weakened.
