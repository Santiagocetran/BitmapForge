# Lifecycle verification — implementation/offline checkpoint

## Outcome: implementation/offline candidate complete; independent review and runtime approval pending

This replaces the stale pre-spawn blocker checkpoint. The **parent actually executed** the authorized canonical-original B01 after supplying its own explicit environment and approval. This worker inspected that real evidence, did **not repeat B01**, and then implemented only the accepted five external lifecycle files under the delivered authorization. No server-runtime/regression launch or browser acceptance is claimed.

QA root: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`.
Evidence root: `QA/repairs/lifecycle/implementation-stage/`.

## Stage ledger

| Stage                                            | Actual status                                                                                                                                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Revised written plan                             | Independently ACCEPTED at SHA-256 `2a954b8fa72abd39221b73c5f00f214cc37f04fe7b6820f94d668bb5764df4a3`; not self-acceptance.                                                               |
| Accepted revision3 driver                        | Historical exact driver/offline ACCEPT retained; candidate changes invalidate reuse of its source verdict for new runtime work.                                                          |
| Canonical-original B01                           | **Parent executed**, diagnostic driver0, `EXPECTED_RED_OBSERVED_NOT_CLEAN`; actual child143/null, closeCompleted:false; supervisor1; cleanup.absent:true, emergency:false. NOT repeated. |
| Five-file production lifecycle repair            | Implemented, frozen, **not independently accepted**.                                                                                                                                     |
| Offline tests                                    | Final locked-Node suite **exit0:152 tests,152 pass,0 fail/cancelled/skipped**. Five syntax checks exit0.                                                                                 |
| Exact patch                                      | git apply --check and mechanical application both exit0; all five reconstructed bytes match candidate. No copied server was executed.                                                    |
| Implementation review                            | **PENDING**; no review/approval record authored by implementer.                                                                                                                          |
| R01–R07 server-only runtime                      | **NOT RUN**. R06/R07 source paths and offline branch coverage now exist; not runtime acceptance.                                                                                         |
| Chromium prerequisite / complete33-case baseline | **NOT RUN / NOT AUTHORIZED** by this handoff. Original failures remain.                                                                                                                  |

## Retained real red

Actual evidence: `QA/runs/lifecycle-parent-b01-20261115/baseline/lifecycle/chromium/parent-b01/` (`driver-result.json`, `driver-server.log`, `server-identity.json`, `server-exit.json`). Parent-created handoff files remain `QA/repairs/lifecycle/parent-b01-approval.json` and `parent-b01-environment.json`. The earlier missing-QA_PHASE invocation was only a pre-spawn failure, not B01 evidence; it is not the current gate.

Real red and cleanup were read before edits. The original28 inventory and archive remain historical and immutable. All28 archived files and all25 unchanged non-lifecycle canonical original files were hash-verified. Three canonical lifecycle production modules changed intentionally; the two previously added lifecycle driver/test files changed within the accepted allowlist. Existing `repair.test.mjs`, runner, predicates, config, env, specs and every other original harness file remain byte-identical.

## Implemented boundaries

- Sibling-relative detached direct Node child; explicit random-session child environment, held stdin, authenticated IPC stop/abort/ready and receiving-side failure poison.
- Import-safe shared lifecycle factory/control installer; controls and finite child-local deadlines before operational async imports; early-acquired Vite handle and one programmatic finalizer; no reset of first terminal bound; local orphan failure/group containment.
- Synchronous programmatic close invocation before Vite's later non-CI stdin listener can snapshot its callbacks, followed by unchanged boundedClose; final completion identity persisted before real exit0.
- Reserved incomplete exit telemetry before actual spawn; full process/session/environment/output/origin/manifest/served/final completion validation; atomic stage+rename publication; monotonic consumed error and bounded diagnostics; no clean remapping of143 or process absence.
- Explicit R06 stale-listener Playwright/Vite refusal and stale-evidence source path; R07 private snapshot factory/consumer path. Controlled startup/close/fault fixtures are separately labeled; actual preview R04 during-close remains mandatory and is never replaced by a benign fixture.

## Exact candidate source identity

| File relative to QA/harness        | SHA-256                                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| server-supervisor.mjs              | `cfb37e8c6bdd1f768384c87cf21ad625791468adb79feac99bc89d88ed5e81fd` |
| lib/server-telemetry.mjs           | `8bfe012ceaab8bc273ecebf6ba67b5e79d8f169e4997beb9af1b8b5f463d6a80` |
| server.mjs                         | `1905120d8b52f28f6a730108e82a554b3c4a7433dba59f648d47a0b2a6a99577` |
| tests/server-lifecycle.test.mjs    | `6ee3285a62d4cae978dd5e370f36e5bae717a99da0260dc41b14f8a36c2100e8` |
| tests/server-lifecycle-control.mjs | `ceb7751ca526a4d1889d424db7bf52af27ca5470d2e4a9722c576b1062b71154` |

- New full30-file inventory hash: `a0c03c45be219ae87b81e8c62bec1638265447c34808bea841eb47a9bd2da253`.
- New freeze SHA-256: `3525a8453e46b0ec73a371c67fed6dccb843d8aa58baea882355717a478f7f68` (`implementation-stage/freeze.json`). This is an evidence freeze, **not approval**.
- Exact five-file patch SHA-256: `d8034268f4bacef5946c35fab5156db3aaebd22e10a56107c2e8626857d0a719` (`lifecycle.patch`), relative to parent-B01 originals plus accepted driver/test v3.
- Original28 inventory remains `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`; original driver v3 freeze remains `f8feb540d305cf6682f79cce754656727a983d8b3b9b14a2e98d61094af29f0a`.

## Actual offline verification

Final command:

```sh
/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node --test --test-reporter=tap /home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa/harness/tests/repair.test.mjs /home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa/harness/tests/server-lifecycle.test.mjs
```

Literal final output retained in `implementation-stage/offline-09.log`, SHA-256 `7e3d4ed75b6e3393e9d558c44c3c3e555a0ad3d32c5b4accea3275881b54e39c`. This retains the original74-case basis and adds78 cases. The lifecycle stage-identity assertions were updated for the post-B01 stage, and historical observer validation holes use the archived original observer; this is **not** a claim that frozen v3 test bytes ran against still-original canonical modules. Existing repair.test assertions were not edited.

Tests exercise the actual factory, control installer, supervisor/observer/validator/reserved writer and exact unchanged runner consumer, including real benign Node0/null positives, malformed/protocol/transport/final-identity negatives, reserved initial no-spawn failure, intermediate and terminal stage/rename/all-write failures, unchanged:false/private snapshot, startup/late acquisition/close rejection/timeout/final persistence failure, real detached orphan absence, first-deadline retention, bounded primary-error preservation and all seven D2 accepting mutants. Installed Playwright refusal and Vite preview EOF listener/close statements are evaluated offline with source hashes; no Vite server/browser is launched.

Failed attempts are retained in `offline-results.json` and literal logs:

- Explicit parent-side IPC disconnect: actual locked Node child exit1 and absence without a ChildProcess.close event, independently reproduced with a minimal benign child. Missing close remains a timeout/rejection, not synthetic completion; final regression asserts this genuine behavior.
- Vite offline source-extraction mistake: selected dev-server rather than preview block; narrowed exact anchor, then two-case source-ordering regression passes, including a delayed-close counterexample.
- D1 unique source anchor collision introduced by a new fixture deadline statement: disambiguated statement without extending its bound; old500ms extension and repaired causal controls pass in final suite.

## Review bundle and next permitted handoff

`implementation-stage/review-runtime-plan.md` contains the exact independent-review unit, evidence paths, per-scenario runtime matrix, strict acceptance/cleanup requirements and separate fixture limitations. `freeze.json`, `source/`, `lifecycle.patch`, `patch-check.json`, `new-inventory.json`, `preservation.json`, `syntax-checks.json`, `offline-results.json` and `checkpoint.json` form the review bundle.

Independent implementation review comes first. Only afterward may the parent create a fresh separately scoped approval/environment for one server-only regression scenario and attempt. Regression driver checks the new implementation freeze and requires both driver and implementation review fields. No parent approvals, new ACCEPT records, runtime outcomes, app changes, installations, browser flags/budget changes or commits were made here. Historical Chromium-stall attribution, WebGL/preflight failures, H1/Q3, WebKit libraries and complete baseline remain unaccepted.
