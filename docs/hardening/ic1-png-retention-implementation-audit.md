# IC1 PNG retention — independent implementation audit

## Verdict

**ACCEPT — the bounded two-file PNG-retention implementation and retained offline verification.** No mandatory implementation defect found. This does not accept native image cancellation, clear the historical artwork failure, authorize a browser/server launch, or establish release readiness.

Roots share `/home/agent/.hermes/profiles/gloin/cache/scratch`: R is `bitmapforge-research`, B is `image-cancel-contract-reentry-v1`, C is `image-cancel-contract-png-v1`, E is `C/tests/evidence`. R is on `gloin/release-hardening`, HEAD `6966686455fce3baa9bc749a272f372b27a52441`.

Read AGENTS.md, web-product-development, accepted plan and both plan audits, implementation handoff, native report, actual source, patch, commands, logs and generated evidence. Named agent/COLLAB bootstrap files are absent. This review performed read-only source, hash/inventory and retained-artifact checks; no suite rerun, harness import, native launch, install, build or remote action. Existing evidence was sufficient. Only this audit document was created; candidate, preserved trees and evidence were not modified. The document is not ignored.

## Reviewed pins and preservation

Freshly computed SHA-256:

| Target                     | SHA-256                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| Accepted plan              | `a6ff548dcd006a3063e1096baaf5a3edbbd0c43979a628496c890d3dc38e2dff` |
| Implementation handoff     | `ec813ef600ff663d9a9dcff7cbec083f6d22f13a50eeef48f5906e30d6ff5a38` |
| C/harness/lib/ui.mjs       | `0c970e47499d6fbf25f576cd5fbf77dde943e3d0f040dac43e06a4113728bbdc` |
| C/tests/ic1-route.test.mjs | `487c7c022cade4602b7f94abbf2aa576dbf980190db6976d436685bcaa7b38a0` |

Independently enumerated both complete harness/test source sets, excluding generated `tests/evidence`: 72 files each, identical path sets, exactly those two changed files. Reconstructed unified diff equals `E/B-to-C.patch` byte-for-byte. All other sources, including env, oracle, config, smoke specs, server/supervisor, guard tests and fixtures, are unchanged.

Readback verification found:

- All 1,702 entries in E's finite evidence index match their recorded bytes or symlink targets. This includes original failed attempt, successful route/guard logs, generated mutants and projections.
- B's complete current resolved-file inventory equals `E/before-B.json`: 6,779 records, no additions, removals or byte changes. Its six file symlinks use the baseline's resolved-byte semantics.
- All 139 preservation mappings match source, destination, length and hash. Historical `B/preserved/harness` remains the separate old guard operand; current B source is separately preserved under `C/preserved/reentry-baseline`.
- All 9,740 existing B seal entries match, including directory types, symlink targets and target bytes. All 834 historical pre-inventory entries match. No seal was rewritten.
- The immutable dist's complete 35-file inventory equals the retained native prerequisite build inventory.

One read-only index-check attempt initially treated an indexed directory symlink as a file and raised `IsADirectoryError`; dispatching on the index's explicit symlink representation completed the comparison with zero mismatches. This was an audit-reader error, not candidate drift or a test execution.

## Implementation contract

`ui.mjs:273–337` preserves project save, the original Preview canvas locator and one argument-free screenshot per image snapshot. It binds the returned Buffer once, validates the finite row/label values, checks the destination with unchanged `contained`, creates the diagnostics parent, checks again and writes that Buffer with `wx`. Only after successful raw persistence does unchanged `env.sha` receive the same Buffer. The exclusive JSON sidecar contains exactly row, label, PNG basename, length and digest; its destination is checked before writing. There is no recapture, re-encoding, alternate hash input, output override or new snapshot field.

Existing `contained` rejects traversal, non-descendants and real-path/symlink escapes; existing environment/config ownership checks separately constrain the output root. The accepted trusted-private, single-owner filesystem model applies, not an adversarial concurrent-filesystem or fsync-durability guarantee.

The catch rethrows the original error object, retaining code/cause and appending row/label/current destination. Raw failure cannot reach hashing; sidecar failure cannot return a completed snapshot. Neither path retries, falls back, deletes partial evidence or repairs the attempt. Successful earlier PNG/sidecar writes survive later errors and full-equality rejection.

Invitation is still read before Settings reopening. All eight snapshot fields, createdAt-only normalization, positive pre-action invitation assertion, empty chooser cancellation, before/after diagnostic, full `assertImageCancel`, return-cube meaningful preview, final no-alert and loaded screenshot remain unchanged. Synchronous writes add timing cost; acceptance makes no claim of zero timing perturbation or context-loss causality.

## Actual retained verification and discrimination

Command records identify `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node` (`v24.22.3`), C cwd and the handoff's sibling `.bin` PATH:

```sh
"$N" --experimental-vm-modules --test tests/ic1-route.test.mjs
"$N" --experimental-vm-modules --test --test-concurrency=1 tests/ic1-reentry.test.mjs tests/ic1-relocation.test.mjs
```

`E/attempt-02/output.log` records 35 passed, zero failed/skipped/cancelled, command exit0. `E/guards-01/output.log` records 39 passed, zero failed/skipped/cancelled, command exit0. These are inspected retained executions, not fresh audit runs.

The actual-source VM route uses call-through SHA and the real unchanged equality oracle. Its assertions independently inspect Buffer identity, stored bytes, digests, capture counts and ordering. Desktop/narrow positives retain distinct row/phase filenames and complete successors. Original narrow ordering assertions remain active. Different-pixel PNGs and equal-decoded-pixel/different-ancillary-byte PNGs both fail specifically on artwork, with successors unreached. I independently recomputed all twelve positive/inequality PNG digests across route-1 through route-6 and matched sidecars, byte lengths and snapshot artwork values.

Under `E/route-evidence-AcgxJo/route-suite-nIbheF`, actual calls, artifacts and named mutant results corroborate the tests:

| Mutant          | Required assertion actually recorded |
| --------------- | ------------------------------------ |
| retained-old    | missing-retention                    |
| before-for-both | stored byte identity                 |
| alter-stored    | stored byte identity                 |
| substitute-hash | hash-input identity                  |
| extra-capture   | capture count                        |
| skip-artwork    | expected-oracle-rejection            |

Expected-error assertions are outside the catch that captures route failures. Raw and sidecar EIO injections assert identical original error/cause, distinct stopped phases, no extra captures, retained earlier files and no successful snapshot diagnostic. Real PNG/JSON collisions and directory/file symlinks retain sentinels and reject before chooser action. The route test named `foreign-root` is specifically an absolute row-ID rejection, not a foreign `qa.e.output` test; genuine output-root refusal is supplied by the unchanged environment/relocation guard tests. This division is sufficient and should not be misreported.

### Instrumentation correction attribution

Attempt-01 remains exit1 with 32 passes and three failures. Its helper bytes equal the accepted final helper. Comparing its retained test snapshot to final source shows only test instrumentation/probe corrections:

- Count captures only while mode is image, excluding the unchanged later model-preview screenshot. The extra image capture mutant still fails.
- Prepare containment probes at the first image capture rather than before earlier settings persistence; this tests the intended retention boundary instead of an earlier guard.
- Preserve the existing diagnostics directory by rename before substituting its symlink; use recursive parent creation for collision probes.
- Adapt `map(path.basename)` to `map(p => path.basename(p))`, avoiding Array.map's numeric index being passed as basename's suffix argument. This additional correction is visible in the diff although not individually listed in the handoff's three-failure narrative.

No helper or equality weakening occurred. Earlier capture-count, directory-symlink boundary and traversal-boundary failures remain present, not relabeled as passing application behavior.

### Unchanged guard acceptance

Inspected actual `reentry-LvFcT6/runner-fixed-*.json`, `runner-old-*.json`, `runner-reuse-*.json` and unchanged test assertions. The installed runner executes a genuine browserless worker and passes; historical source fails worker initialization with literal `IC1 existing attempt destination`, not setup/import failure; independent reuse also rejects that destination. Child records retain actual exit/close, `forced:false` and observed descendant absence. Both engines' unchanged list-only registrations pass. These checks neither launch nor prove native browser behavior, and consumed offline roots remain unusable as native attempts.

## Exact remaining native prerequisites

This ACCEPT completes the implementation-review gate only. Before any native execution the parent must supply a fresh explicit authorization and exclusive serial lane transfer, with current ownership/resource checks. No new diagnostic framework, approval schema, redundant seal or general rerun is required.

1. Recheck these accepted C source/evidence identities, preserved historical inputs, complete immutable dist and fixture/tool/browser pins. Use `h1-integrated-20261115T180652Z/immutable-candidate/dist` unchanged. Fixture is R's `test/fixtures/models/export-visual-cube.stl`, 1,577 bytes, SHA-256 `4d2d98182b4b93e8b45e881b1f92838b7e951ab246bb73f81663b3e3f5bef708`.
2. Use the explicit Node24 executable above, sibling `.bin` PATH and R's installed Playwright1.59.1 CLI. Chromium cache is `tooling-b-browser-execution/chromium-cache`; Firefox cache is `bitmapforge-hardening-qa/browsers/pw-1.59.1`, both relative to the shared scratch root. Retain existing browser binary pins and flags; verify sufficient available capacity without raising budgets.
3. Allocate fresh separate engine QA_RUN direct children of C/runs, never a consumed offline/list-only/native root. Set `QA_PHASE=final`, `QA_LANE=smoke`, engine, `QA_ATTEMPT=a01`, pinned QA_DIST, available owned QA_PORT, required retained cache (`QA_CHROMIUM_CACHE` matching `PLAYWRIGHT_BROWSERS_PATH` for Chromium), and contained TMPDIR/XDG_CACHE_HOME. Reject inherited external helper/tmp/cache overrides; let unchanged config establish ownership, not fabricated tokens.
4. Invoke installed Playwright directly with C's `harness/playwright.smoke.config.mjs`, never `run.mjs`: one serial Chromium invocation for Q1.image.D/N, then one Firefox invocation for the same rows; zero retries, one fresh attempt per row. A shared prelaunch/config/retention/containment blocker stops the batch. Ordinary artwork assertion failure remains a failed row, not retry authority.
5. Preserve one worker, original desktop/narrow viewports and DPR1, full oracle/successors, trace `retain-on-failure`, 90s test / 5s expectation / 10s action / 15s navigation / 30s launch and readiness / 10s shutdown budgets, served-byte checks and strict owned process/listener cleanup. Use the existing accepted procedure, not an observer redesign.
6. Afterward verify exact retained PNG bytes against sidecar and snapshot hashes before offline dimension/chunk/RGBA analysis or existing trace/console correlation. Report literal row failures, unreached assertions, retention completeness, cleanup and preservation. No extra capture or diagnostic native rerun. A new pass cannot recover historical discarded PNGs, clear their inequality or prove context restoration caused it.

Historical worker-reload failure, Chromium desktop artwork inequality and unrelated release gates remain open as recorded. No undraft, merge, deployment or release-readiness authority is conveyed.
