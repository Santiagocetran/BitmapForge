# IC1 private configuration re-entry repair plan

## Status and scope

**PROPOSED — return for independent plan acceptance; not implementation or self-approval.** This document alone is changed. No harness import, runner execution, browser, server, dependency, build or remote action was performed. Read AGENTS.md, web-product-development, the accepted IC1 plan/re-audit, implementation/audit and native-verification report. Named COLLAB bootstrap files and HERMES.md are absent. Checkout: `gloin/release-hardening`.

Roots below are under `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- `R = bitmapforge-research` (repository and installed dependencies).
- `A = image-cancel-contract-v1` (accepted candidate and failed native attempt; immutable).
- `B = image-cancel-contract-reentry-v1` (proposed fresh repair root; refuse if present).
- `P = B/harness`; `E = B/tests/evidence`.

Finite objective: replace the private guard's unconditional existing-output refusal with first-claim freshness plus strictly owned, same-invocation configuration re-entry. Preserve the image oracle, native selection, budgets, paths/containment policy and immutable evidence. No launcher architecture, supervisor repair, new runtime service, approval framework, production change or observer repair. The existing EADDRINUSE observer failure remains distinct: TIME_WAIT is not LISTEN.

## Actual installed lifecycle and defect

Source inspection of installed Playwright **1.59.1**, not assumptions about discovery:

1. `lib/common/configLoader.js:106–120` imports/evaluates user configuration. IC1 `config.mjs:76–78` validates then writes three `.keep` files, creating the attempt destination.
2. `lib/common/ipc.js:37–47` serializes config location/CLI overrides/cache/metadata, not a ready-to-use user-config object.
3. `lib/runner/processHost.js:54–68` forks the runner child with inherited `process.env` plus extra environment and IPC. `workerHost.js:64–68` starts that process after creating its artifact directory.
4. `workerMain.js:60–62` sets worker indices; `:162–180` calls `deserializeConfig` before loading the test. `configLoader.js:101–104` calls `loadConfig` again. Separate-process module caches do not prevent the second config evaluation. The loader process also uses deserializeConfig (`loader/loaderMain.js:37–40`); worker-index presence is therefore neither a universal re-entry requirement nor ownership proof.
5. `A/harness/lib/env.mjs:57` rejects the output it just created. Removing that line alone still leaves `:58–59` rejecting the now-populated run root. Both checks need one coherent ownership decision, not independent exemptions.

The retained native report establishes Chromium worker-init failure before any route, one failed/one did-not-run, no browser executable launched, and Firefox not launched. This is not cancellation evidence. Existing relocation test `:60` explicitly expects a second same-process config call to fail; `:61–68` only runs `--list`, which cannot establish worker reload compatibility.

Installed source pins, SHA-256 (freshly computed):

| Relative to R/node_modules/playwright/lib | SHA-256                                                            |
| ----------------------------------------- | ------------------------------------------------------------------ |
| common/configLoader.js                    | `5008b4596bbaf0d18cee9ca546690ee8b062999024c643b1241634de0e6dcdac` |
| common/ipc.js                             | `a269d9593ed064a6470d1a1be87734dfae7a26d5cc47b950d295889c071f7cf4` |
| runner/processHost.js                     | `50c7c682fcc7e569d01fc3c8bb2ca55d8cdbbe4133be8d302e2117931d7c233a` |
| runner/workerHost.js                      | `4e83d8be210dcaf6ea03d3a4458365c690ddfb10deb8ef08b314ed9819a1dfc4` |
| worker/workerMain.js                      | `0935b573681ba8fb21b761f5e81f90b471c9411596a2a5ede3bfa97da78716fb` |

## Exact ownership and edit allowlist

After delivered independent ACCEPT and explicit implementation ownership transfer, create B exclusively. Copy A/harness and the two accepted test files with their relative layout. Copying is not authorization to execute other copied drivers.

Only these copied existing files may change:

- `B/harness/lib/env.mjs`: ownership-aware guard and its finite identity/claim helpers; no relaxed graph, input or containment validation.
- `B/harness/config.mjs`: consume the guard's first-claim/re-entry result so only the first evaluation creates `.keep` files; retain every other config value/operand.
- `B/tests/ic1-relocation.test.mjs`: replace the blanket repeated-call negative with owned reload positives and genuine foreign reuse negatives; test setup clears ownership variables between distinct attempts.

New test source allowlist:

- `B/tests/ic1-reentry.test.mjs`.
- `B/tests/fixtures/reentry.config.mjs`.
- `B/tests/fixtures/reentry.spec.mjs`.

New non-source outputs only: `B/preserved/**` (immutable pre-edit copies), `E/**`, and direct fresh `B/runs/NAME/**`. Fixtures/mutants generated by tests reside under a unique E subtree. No changes to A, canonical QA harness, accepted route test, UI/oracle/runtime/spec/server/supervisor, installed packages, lockfiles, builds or historical evidence. B's copied route test remains byte-identical. Repository delivery beyond this plan is a separately owned repair handoff/audit, not permission to edit existing acceptance records. Stop for review if this allowlist is inadequate.

## Ownership contract: first claim versus legitimate reload

Use a small Linux-local guard protocol inside env.mjs, not an external coordinator. It protects against accidental/stale/concurrent reuse in the trusted private harness; it is not a sandbox against malicious same-user processes that can read memory/files.

### First evaluation

- Run all existing environment, graph, supervisor, pinned-input, helper and containment checks **before any filesystem mutation**, on both first entry and reload. Reject symlinked claim/ancestor/output paths and malformed identity fields.
- Require absent attempt output. A run root may be absent or contain only the existing preparatory `tmp`/`cache` directories, each actually a directory with safe real ancestors. Reject any other existing content, including empty foreign attempt trees, markers or stale reports. An ownership environment value on a fresh directory is not permission to initialize: reject it instead of silently generating replacement authority.
- Generate an unpredictable per-invocation nonce in the first config process. Claim `QA_RUN/.ic1-owner.json` with exclusive creation (`wx`, no overwrite), binding schema version, canonical private harness root, QA_RUN, phase/lane/engine/attempt, derived output, pinned dist, and owner PID plus Linux `/proc/PID/stat` start ticks. Store the nonce digest in the marker; pass the nonce and serialized bound identity through a single documented private environment variable, `IC1_CONFIG_OWNER`. Do not accept caller-supplied ownership at initialization.
- Recheck freshness around exclusive claim before creating output. Another initializer losing the claim race must fail without writing output. Any partial initialization remains consumed and is never repaired/deleted automatically. Marker publication must complete synchronously before returning success or creating `.keep`; use bounded parsing and complete-record validation. A crash leaves a permanently refused attempt, not recovery permission.
- In-process state retains the issued identity; a later same-owner call must match that state and the unchanged marker. Scope it to the single claimed tuple: changing attempt/engine/run in the same process does not inherit authority.

### Same-invocation reload

An existing output/run is allowed only when **all** conditions hold:

- Exact marker/environment nonce digest and every bound identity field match the current environment and derived paths. Missing, malformed, truncated, substituted, symlinked or wrong-version marker fails closed.
- Owner PID still exists with the exact start ticks (not just kill(pid,0), UID or a recycled PID). A completed CLI process makes its marker stale even if the caller retained its environment.
- Caller is either that same owner process with its locally issued state, or a direct child of that still-live owner with independently read `/proc` parent identity and inherited capability. This matches the installed worker/loader fork topology; do not accept arbitrary siblings, grandchildren or unrelated processes merely carrying `TEST_WORKER_INDEX`, matching strings, or a copied token. If installed topology differs in execution, stop rather than widen ancestry heuristics.
- Revalidate contained output destinations and existing ancestors before any output action. Existing owned reports/artifacts are not freshness violations during reload, but must never be cleared or rewritten by guard/config initialization.

The guard returns first-entry versus reload explicitly. Config creates its three `.keep` files only for first entry; reload performs no initialization writes. Do not rotate/delete the marker, refresh stale ownership, adopt unmarked directories, or clean output to make a retry pass. Marker lives at run-root level, outside Playwright `results` and HTML report folders that the runner may clean. Runner's ordinary current-attempt output management stays unchanged; immutable prior attempts never become runner targets.

A second independent CLI invocation is **unrelated reuse**, even while the first owner is alive: its parent is not the first owner and it has no locally issued owner state. Discovery consumes its own fresh root; native invocation must get another root. Exported environment alone, a static marker alone, worker index alone, or `mkdir({recursive:true})` alone must never authorize reuse. No new external wrapper is needed; env inheritance in the inspected installed runner carries the capability.

## Discriminating offline regressions

Execute actual candidate guard/config, not a copied validator. Keep all existing relocation/route positives and negatives except the obsolete blanket repeated-call expectation. Capture genuine validation errors separately from test assertions.

Required cases:

- Fresh absent root and safe tmp/cache-only root pass first claim; same-process repeated config passes without changing marker, `.keep`, or preplaced owned sentinel bytes/mtimes. Independent fresh root remains possible only after isolated process/test identity reset, not token retargeting.
- Benign direct child inherits identity and reloads actual config while owner is alive; record differing PIDs and start ticks. Repeated child reload is read-only. No server/main/browser calls.
- Existing unmarked output, foreign root content, stale marker/dead owner, wrong start ticks, missing/wrong nonce, changed run/phase/lane/engine/attempt/dist/private root and marker corruption fail. Copying a valid marker/token to a new root or another attempt fails.
- Live-owner unrelated sibling with copied token and spoofed worker indices fails; stale inherited token after owner exit fails. Same PID with mismatched start ticks fails. A worker-index-only forgery fails.
- Concurrent claim contenders: at most one initializer succeeds; loser cannot append/overwrite/delete evidence. Partial claim failure remains refused. Test bounded real children, no sleep-based lifetime guessing.
- Historical/traversal/symlink paths, marker symlink, helper overrides, TMP/TEMP and missing explicit temp/cache requirements still fail before output writes. Check sentinel inventories after every negative, not just nonzero exit.
- Retained old guard/config must fail the legitimate second-evaluation regression specifically at existing-attempt refusal. Selective mutants accepting all existing roots, ignoring nonce, ignoring tuple, ignoring owner liveness/start ticks, or ignoring ancestry must each fail their named negative. Preserve exact mutant diff/outcome; setup/import failure is not discrimination.

Bound offline Node suite to 120 seconds; benign child operations individually to 30 seconds. Retain real exit and close events and verify owned-child absence; forced cleanup fails the test. These are verification bounds, not changes to native budgets.

## Actual installed-runner regression without native browser

Feasible by source: Playwright can run a test with no browser/page/context fixture. **Not executed in this planning task.** Required after implementation, not replaceable by `--list`:

1. The new fixture config imports/calls the real P/config.mjs `config('smoke')` first, so the actual guard, graph checks and `.keep` behavior execute in both runner and worker. Only **after** it returns, a clearly test-only adapter disables `webServer`, chooses the single browserless fixture spec and clears the native grep. Keep one worker and zero retries. Never add an offline bypass to production guard/config; never launch the smoke spec or server from this regression.
2. The fixture spec imports installed `@playwright/test` by the same explicit repository path. Its test requests no browser, page, context, runtime, auto-browser fixture or request fixture. Write only a bounded diagnostic in its fresh private output. Record current PID/PPID/start ticks, worker index and matched claim identity; assert it is not the owner PID and is its real child. Retain a parent-config event and worker-config event from the test-only adapter with distinct PIDs; assert worker test body actually ran. Keep capability secret out of diagnostics (record digest only).
3. Invoke explicit cached Node24 and `R/node_modules/@playwright/test/cli.js test --config B/tests/fixtures/reentry.config.mjs`, **without --list**. Require one discovered and one executed passing fixture, exit0, true worker-config reload and exact parent-child match. Record complete argv/environment identities (redacting capability), stdout/stderr/JSON report, marker and sentinel pre/post inventory, process exit/close and owned-process absence. Assert no server/browser process was launched; no sockets or native cache acquisition are needed. A 30-second test and 60-second subprocess bound are test-only.
4. Run the identical regression against an isolated retained-old-source copy: require worker initialization to fail at `IC1 existing attempt destination`, body not executed, and exit1. Do not count discovery errors or arbitrary nonzero exit. Also relaunch the successful candidate fixture with its consumed root in a new CLI process: require refusal before worker body and unchanged evidence sentinels. Use a new outer evidence destination for each command's logs so the negative does not overwrite its positive report.
5. Keep normal Chromium/Firefox smoke `--list` checks separately on fresh roots, asserting only Q1.image.D/N and unchanged config values. These discovery checks are not reload or browser acceptance.

Fixture adapter source and old-source projection require exact diffs in the handoff. Old-source execution may relocate only module-relative roots; do not execute A's accepted files as a writable attempt. If no-browser actual-runner regression cannot be made to execute the worker path within this boundary, report the specific blocker and return for review; do not substitute a mock worker, discovery pass or native launch.

## Preservation and verification ledger

Before editing, inventory complete path sets, lengths and SHA-256 for A/harness, both accepted tests, A/original, canonical QA harness, all A/tests/evidence and A/native-evidence-20261116 plus A/runs/n16c and A/native-check.py. Copy accepted executable/test bytes into B/preserved; retain original-path → preserved-path → candidate-path mapping, with byte identity distinguished from path relocation. Preserve all earlier failed evidence, not merely the final summary. Verify the referenced native evidence index entries, not just its own hash. No old index is regenerated.

Freshly computed accepted pins:

| Path relative to A                           | SHA-256                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| harness/config.mjs                           | `5d2418eee345fe309c3ea7f077a3965eb19be3c0529cd1259ba233282e27ec92` |
| harness/lib/env.mjs                          | `9140d4408323d127f9b4498aae30db4424e5b59ef0bb7e46d496f1f94548c3fc` |
| harness/lib/ui.mjs                           | `f6984c15a0a60e88192357fbc3618403e252f323d47d9f10fd90813266cc8fdd` |
| tests/ic1-relocation.test.mjs                | `f3151d4a2d28276bac109614eafef94f852581fc912d9d0ce045108309769ac5` |
| tests/ic1-route.test.mjs                     | `c2cb12479568e0040ea36275c7cd2eec5299ba2f313c5b356ff2dabf9613103a` |
| native-evidence-20261116/evidence-index.json | `6df340bc139a3b35bbabef8a954b74bbded2b27738430407f45f7d1bbd301cf8` |

Implementation handoff must retain complete accepted→candidate diff, all candidate/test/source-toolchain pins, exact commands and per-command results, named mutant outcomes, full post-verification path-union comparison and a new evidence index. Only allowlisted files may differ; no omitted new paths. Run syntax checks, all three Node test files with explicit Node24 `--experimental-vm-modules --test`, the real worker regression and old-source/reuse counterexamples, both smoke discovery checks, document formatting and diff checks. Record each exit separately. Independently audit the exact candidate and evidence before native authorization. Passing these checks accepts guard/re-entry only, not cancellation or served behavior.

## New native attempt prerequisites and stop conditions

After independent implementation ACCEPT, obtain a new explicit parent native grant and current exclusive lane transfer. The prior grant/attempt is consumed; historical cleanup is not current ownership. Recheck full candidate/build/fixture inventories, actual Node24/Playwright1.59.1 and retained browser binaries/cache pins, no old process/listener conflicts and actual supervisor/child operands. Use unchanged pinned immutable dist, no rebuild/install. Do not use either run.mjs.

Allocate never-used direct B/runs roots separately for serial Chromium and Firefox, with explicit phase/lane/engine/attempt, contained short TMPDIR/cache/helper targets and a free owned port. Clear inherited `IC1_CONFIG_OWNER` before the CLI invocation; do not evaluate config/list into the native destination beforehand. First CLI config owns initialization. Preserve existing test90000/expect5000/action10000/navigation15000/launch30000/readiness30000/shutdown10000 budgets, one worker, zero retries, no reuse, viewport/DPR/arguments and runner-owned retain-on-failure tracing.

Select exactly Q1.image.D/N per engine against unchanged served bytes. Retain strict process exit/close, served identity, owned absence and LISTEN checks without treating TIME_WAIT as a live listener. The operational observer repair is not bundled here; the parent must choose a bounded verification method that preserves its old failure, not silently alter A/native-check.py.

Report each real route's first failure and unreached assertions. Require all eight preservation fields, genuine downloads, full equality, return-cube meaningful preview, no-alert and loaded screenshot. Preserve any next artwork-hash mismatch without changing equality/animation. Native four-row acceptance, historical engine matrices, Q7/sparse/Firefox-pointer/WebKit/manual/R04 and release approvals remain separate. No undraft, merge or deployment authority.

**Requested next disposition: independent ACCEPT or actionable rejection of this written finite guard/tests plan. No implementation was performed and no acceptance is claimed.**
