# R06 pre-import ordering repair — bounded re-review candidate

**Implemented/offline verified; narrow independent review pending. No runtime authorization or server-matrix acceptance.** This corrects only the remaining L2 boundary in `qa-lifecycle-implementation-repair-audit.md`; accepted L1 and all other contracts remain unchanged.

`QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`.

## Correction

Only executable edits are `QA/harness/tests/server-lifecycle-control.mjs` and `QA/harness/tests/server-lifecycle.test.mjs`.

- R07 retains its separate supervisor import. R06 now enters its existing single `refusalEnvelope` before the **actual** `await import('../server-supervisor.mjs')`; the continuation checks `control.active()` immediately after acquisition. The same handlers, first-terminal absolute deadline, retained ownership array and finalizer span supervisor import, refusal setup/work and cleanup. No competing envelope, changed cap, relaxed failure label or production-module edit.
- Regression approval reads the new `r06-ordering-stage/freeze.json`, preserving the previous candidate and approval requirements. No approval was created.
- Two causal offline regressions execute unchanged extracted `refusalEnvelope` → runtime `runFixtureCase` → actual dispatcher → `main` bodies in a `vm.SourceTextModule`. Its dynamic-import callback holds the actual supervisor import expression. These tests do **not** inject `refusalWork`. Only synchronous main prerequisites/environment and OS identity/listener queries are stubbed; real filesystem operations publish and read back `driver-result.json`.
- With that import pending, both signal handlers must already exist. SIGTERM and SIGINT variants each send the first signal at fake monotonic100 and the opposite signal at500. Before resolving the import, main must publish `FAILED_OR_BLOCKED`, retain the first signal and deadline10100, record one strict interruption label, report no owned identities/emergency cleanup, and remove both handlers. Resolving the import afterward must cause no subsequent import, reservation or launch, and leave terminal bytes unchanged.
- Each regression also runs the same probe against immutable previous-candidate source. Both old-source controls exit1 specifically at the missing-handler `0 !== 1` assertion. This is source-order causal proof, not an OS-signal or production server result; existing real benign OS-signal tests are retained.

## Executed verification

`python3 QA/repairs/lifecycle/r06-ordering-stage/verify-freeze.py` exited0. Locked Node: `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`.

- Full two-suite TAP command: **163 tests,163 pass,0 fail/cancelled/skipped; exit0**. All previous161 test bytes are preserved after removing exactly the newly inserted two-test block. L1 actual unresolved-acquisition/SIGKILL test, strict labels, D1 extension counterexample, D2 selective mutants and missing-close rejection remain passing.
- Five locked-Node syntax checks: each exit0.
- Original28 archival files and25 protected canonical original files hash-match; three production lifecycle modules match the previous audited candidate. Historical B01 records and driver freeze remain unchanged. Original compact inventory remains `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`.
- Complete patch against original-three/revision3-driver bases and bounded delta against the exact previous candidate each passed forward-check, apply and reverse-check. Both private mechanical reconstructions hash-match all five frozen source files. No reconstructed runtime was executed.

## Review artifacts

All new evidence is under `QA/repairs/lifecycle/r06-ordering-stage/`; previous evidence is untouched. `source/`, `new-inventory.json`, `preservation.json`, `syntax-checks.json`, `offline-results.json`, `patch-check.json`, literal `offline-final.log`, and `verify-freeze.py` retain the verification. Causal current/old logs and read-back terminal records are in the full suite's fresh `driver-stage/offline-* /R06-import-SIGTERM` and `R06-import-SIGINT` directories.

| Artifact                          | SHA-256                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| `freeze.json`                     | `35f5ca492f0437ca49d2aed6d5773fc39a9b1de0f7e1453a0703fcbbc6cc05d6` |
| Controller                        | `ba51045e8fd50cc8216694cf99b72bf433a31e26f92d74726db2da9764f76890` |
| Lifecycle tests                   | `402cfa9a84e76e5207101347bda8f50a251a9bc9f934a79c9da7da05aa125746` |
| Complete30-file harness inventory | `4ab419ade8905cbcc144154242efaf2ab021d7170cdcbeb19c1627b328722b4e` |
| Complete `lifecycle.patch`        | `2aa454de648f89ebdf117c410e0f493da8b2f1fbdec7f517f7d7a4434350ed56` |
| Bounded `R06-ordering.patch`      | `f5075feccc147e408974f2b47626a642ac755c155e37e05b9d0f35642731c47e` |
| Final TAP log                     | `371c67e7fdebc9830f5888ad7d969ed214bc2ab7999fdbab27a55534e67bdb07` |

No server, listener, browser, install, production-module change, baseline replay or actual server-matrix attempt occurred. The VM flag emits Node's expected experimental-module warning; both probes otherwise passed. No unresolved implementation/test failure was encountered. Remaining gate: bounded independent review of this exact candidate; real runtime rows still require separate parent authorization and execution.
