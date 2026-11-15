# Independent R06 pre-import ordering implementation audit

## Verdict: ACCEPT — exact implementation/offline candidate for the separately approved server matrix

The remaining L2 pre-envelope import window is corrected. The previously accepted L1 correction and the accepted post-entry L2 mechanisms stand. No further implementation revision is required for this narrow review unit.

Accepted freeze SHA-256: `35f5ca492f0437ca49d2aed6d5773fc39a9b1de0f7e1453a0703fcbbc6cc05d6`.

This is **implementation/offline-stage ACCEPT**, not server-matrix execution approval or runtime acceptance. The parent may separately authorize the existing fresh per-scenario server-only attempts through the unchanged approval interface. This audit adds no approval layer, scenario, budget or runtime requirement.

`QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`.

Read repository AGENTS.md, web-product-development, the prior lifecycle/driver implementation audits, the L1 ACCEPT/L2 ordering finding, the ordering repair submission, actual controller/tests and frozen verification artifacts. COLLAB records are absent. No source repair, server, HTTP listener, browser, install, approval file or matrix attempt was performed. Sole authored review file is this document; the permitted offline suites generated their normal fresh external fixture evidence.

## Ordering correction and causal coverage

- Actual `dispatchFixture` routing still selects `runFixtureCase` for runtime R06 without injected `refusalWork` (`tests/server-lifecycle-control.mjs:485–489`).
- `runFixtureCase:394–415` leaves R07's supervisor import in its separate branch. R06 enters the existing single `refusalEnvelope` at413, which synchronously installs both signal handlers at354 before invoking asynchronous work. The **actual** supervisor `await import('../server-supervisor.mjs')` is now inside that work at414. `control.active()` follows immediately at415, before the HTTP/plugin imports, reservations or launches.
- There is no second competing envelope. Existing first-signal/deadline latching, retained ownership array, strict failure labels and finalization are unchanged. The bounded controller delta otherwise only changes regression approval's freeze path to this exact candidate; approval checks themselves are preserved.
- The two added tests extract unchanged actual envelope, runtime routing and `main` bodies into a `vm.SourceTextModule`. The VM dynamic-import callback holds the actual supervisor import expression; these tests do not select injected `refusalWork`. Main's synchronous environment/approval/identity prerequisites are stubbed; terminal persistence and readback use the real filesystem.
- Fresh SIGTERM and SIGINT variants each observed both handlers while that import remained unresolved. First interruption at fake monotonic100 followed by the opposite signal at500 produced `FAILED_OR_BLOCKED`, retained the first signal and absolute deadline10100, and recorded exactly one strict `Interrupted R06:` label. Owned/remaining identities were empty, cleanup was absent:true/emergency:false, and both handlers were removed.
- Crucially, the real `main` terminal file was read **before releasing the import**. Releasing it afterward produced no additional import, reservation or launch and left terminal bytes unchanged. This verifies the post-import active guard's causal role, not merely handler registration.
- The same probes against the hash-verified previous candidate each exited1 specifically at the pre-import handler assertion (`0 !== 1`). Current probes exited0. The old source is genuinely discriminated by the tests; a green aggregate alone is not the argument.

Fresh causal evidence: `QA/repairs/lifecycle/driver-stage/offline-zrKEYV/R06-import-SIGTERM/` and `R06-import-SIGINT/`, each containing current/old logs and real read-back records. Both current logs report only the supervisor import and launches:0.

These new probes establish source ordering with an EventEmitter and controlled monotonic time, **not actual OS-signal delivery or live refusal behavior**. Previously accepted benign real-OS-signal tests remain in the retained suite. No such offline result is substituted for a production-budget runtime row.

## Independent preservation, freeze and patch verification

| Artifact                          | Verified SHA-256                                                   |
| --------------------------------- | ------------------------------------------------------------------ |
| Controller                        | `ba51045e8fd50cc8216694cf99b72bf433a31e26f92d74726db2da9764f76890` |
| Lifecycle tests                   | `402cfa9a84e76e5207101347bda8f50a251a9bc9f934a79c9da7da05aa125746` |
| Complete30-file harness inventory | `4ab419ade8905cbcc144154242efaf2ab021d7170cdcbeb19c1627b328722b4e` |
| Complete `lifecycle.patch`        | `2aa454de648f89ebdf117c410e0f493da8b2f1fbdec7f517f7d7a4434350ed56` |
| Bounded `R06-ordering.patch`      | `f5075feccc147e408974f2b47626a642ac755c155e37e05b9d0f35642731c47e` |
| Retained final TAP log            | `371c67e7fdebc9830f5888ad7d969ed214bc2ab7999fdbab27a55534e67bdb07` |

Independently recomputed the freeze, complete inventory, every freeze-referenced evidence hash and retained final log hash. All five canonical source files match their frozen copies and both mechanical reconstructions. Both complete and bounded patch bytes were regenerated in memory from the declared original-three/revision3-driver and exact previous-candidate bases: exact equality. Retained forward-check/apply evidence is hash-authenticated; fresh reverse-apply checks on both reconstructions exited0. No reconstructed runtime was executed and the evidence-generating freeze script was not rerun or allowed to overwrite its artifacts.

All28 archival original files and25 protected canonical original files hash-match. Original compact inventory remains `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`. All three production lifecycle modules match the previous independently audited candidate; this correction changes none of them. All five retained B01 files and the historical driver freeze match their recorded hashes. Historical B01 remains red, not replayed or reclassified.

Removing exactly the newly inserted two-test block reproduces the prior lifecycle test file byte-for-byte. The previous161 tests are retained rather than replaced. No accepted scenario, predicate, original test or budget was relaxed.

## Fresh execution and boundary of acceptance

Locked Node: `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`.

- Five independent `NODE --check` commands: **5/5 exit0**.
- Fresh `NODE --test --test-reporter=tap QA/harness/tests/repair.test.mjs QA/harness/tests/server-lifecycle.test.mjs`: **exit0;163 tests,163 pass,0 fail/cancelled/skipped**. Both new named import-order tests passed. Prior actual R04 unresolved-acquisition/SIGKILL, D1 extension counterexample, D2 selective mutants, strict consumer and missing-close rejection coverage remains passing.
- The freeze remained byte-identical after independent execution. Node emitted its expected experimental VM-module warning; no candidate failure or unresolved review blocker was encountered.

**Implementation-stage ACCEPT clears the remaining bounded L2 source/offline objection only.** Actual R01–R07 server outcomes—including production-budget unresolved-startup containment, real preview close windows and real R06 listener/plugin/Vite refusals—remain unexecuted and unaccepted by this audit. Separate parent authorization and the existing matrix evidence are still required. Browser-lane ownership, Chromium/WebGL, H1/Q3, WebKit and complete-baseline gates are unchanged and outside this review.
