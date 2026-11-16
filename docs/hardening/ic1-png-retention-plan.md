# IC1 exact PNG retention — bounded plan for independent review

## Status and purpose

**PROPOSED; not independently approved, not implemented, no native authority.** This document is the only authorized edit in this task. Request independent ACCEPT or actionable rejection of this plan before assigning implementation; the author cannot approve it.

The accepted `image-cancel-contract-reentry-v1` candidate produced three native passes and one Chromium `Q1.image.D` full-equality failure. Only `artwork` differed. Context loss preceded cancellation; restoration was logged during the second screenshot. Exact hashed PNGs were discarded; equal trace JPEGs cannot resolve their inequality. No application defect or harmless-animation explanation is established. See `ic1-artwork-failure-analysis.md`, the IC1 implementation/audit reports, and `ic1-reentry-native-verification.md`. Retention closes an evidence gap, not the failed gate.

## Ownership and literal allowlist

All roots below share `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- `R = bitmapforge-research` (branch `gloin/release-hardening`).
- `B = image-cancel-contract-reentry-v1` (accepted, read-only baseline).
- `C = image-cancel-contract-png-v1` (proposed fresh sibling; refuse if it exists).

After independent plan acceptance and explicit implementation transfer, copy B's harness and test sources into C without copying live run/owner state. Preserve these distinct read-only inputs with a complete source-to-destination path/length/SHA-256 mapping:

- `B/preserved/harness/**` → `C/preserved/harness/**`, byte-for-byte: the historical pre-re-entry harness from `image-cancel-contract-v1`, not B's current harness.
- `B/harness/**` → `C/preserved/reentry-baseline/harness/**`, byte-for-byte: B's current accepted baseline, including `lib/ui.mjs` for the new missing-retention counterexample.
- B's test sources and fixtures → `C/preserved/reentry-baseline/tests/` at identical relative paths, byte-for-byte; exclude generated `tests/evidence/**` from source copying and retain its original evidence in B unchanged.

The unchanged `B/tests/ic1-reentry.test.mjs:130–133` reads the relocated candidate's `preserved/harness`, copies it to its fresh `tests/evidence/reentry-*/old/harness` projection, and copies current `tests/fixtures` alongside it. Its existing projection-only cache-operand substitution remains unchanged. Its old-source worker-init negative must reject with `IC1 existing attempt destination`, not ENOENT/import/setup failure or worker success. Do not replace this historical operand with the B baseline used for PNG-retention tests. Only fresh generated projections are executed; original/preserved sources are never writable attempts. Module-relative relocation already supports a sibling root; no config/env repair is authorized.

Executable edit allowlist, relative to C:

| File                       | Permitted delta                                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `harness/lib/ui.mjs`       | Image snapshot-local PNG retention and necessary import of existing `contained`; no other route/helper change.                    |
| `tests/ic1-route.test.mjs` | Extend the existing real-source VM route regression with exact-buffer retention, failure/containment and selective-mutant checks. |

No new executable helper, diagnostic module, config, observer or framework. All other copied harness/test sources remain byte-identical, especially `lib/env.mjs`, `lib/repair-contracts.mjs`, smoke specs, server/supervisor, re-entry tests and fixtures. A discovered relocation incompatibility is a stop/report boundary, not permission to widen this list.

Permitted new data during the separately transferred bounded implementation/offline assignment: `C/preserved/**`, fresh `C/tests/evidence/**` (offline logs, generated test-only mutants/projections, inventories and patches), and fresh exclusively owned `C/runs/t-<UUID>/**` and `C/runs/offline-<UUID>/**` for the unchanged browserless suites. Actual consumers are `B/tests/ic1-reentry.test.mjs:11–15` (`setup(root=A)`) and `B/tests/ic1-relocation.test.mjs:10–15`; these roots include the existing config-owned marker, `.keep`, output, tmp and cache state. Re-entry projections using `setup(root)` keep their own `runs/t-<UUID>` beneath the unique `C/tests/evidence/reentry-*` projection root. Do not bypass the accepted direct-child QA_RUN containment checks or modify the guard suites/config/env to redirect these outputs. Preserve consumed offline/list-only roots; they must never become native attempts.

Fresh native engine `C/runs/<run>/**` roots remain subject to the separate native authorization and lane transfer below; offline root permission grants no browser/server authority. Generated mutants are confined to offline tests, never native entry points. Repository implementation/review/native handoffs require their own bounded assignments; this task revises only `R/docs/hardening/ic1-png-retention-plan.md`.

Inventory B, its existing seals and historical native/offline evidence before copying; verify their complete existing path/length/hash sets after implementation and after native execution. Preserve `image-cancel-contract-v1`, canonical harness, immutable build, accepted reports and all original failures unchanged. Publish C's complete executable inventory, exact B-to-C patch (including test changes), preservation mapping and fresh evidence index. Never regenerate an old seal or overwrite a historical report to present a new pass as its replacement.

## Mandatory finding dispositions — pending independent re-review

- **M1:** Pinned `B/preserved/harness` → `C/preserved/harness` for the unchanged historical guard regression; B's current harness/test baseline is separately retained under `C/preserved/reentry-baseline`. The named existing-attempt rejection remains required, distinct from the new missing-PNG-retention counterexample.
- **M2:** Explicitly permitted fresh offline `t-<UUID>` / `offline-<UUID>` run roots required by the unchanged suites, while keeping retention probes/projections evidence-local and native engine roots separately authorized. Consumed offline/list-only roots cannot be reused natively.

These are written-plan corrections grounded in static inspection of the actual path consumers, not executed acceptance evidence or self-approval. Return M1–M2 and preserved contracts for independent re-review. The two-file executable allowlist, accepted IC1 behavior, original evidence and separate implementation/native gates remain unchanged.

## Exact capture and persistence contract

The current image `snapshot(label)` at `harness/lib/ui.mjs:273–308` saves a project, calls `canvas.screenshot()` once, hashes its returned Buffer with unchanged `env.sha`, reads the invitation, then reopens Settings. Preserve that order, locator, screenshot options and all route actions, inserting only synchronous local persistence between screenshot return and hashing:

1. Bind the **existing single** `await canvas.screenshot()` result to a local Buffer. No extra screenshot, re-encoding, decoding, normalization, copy-based substitute or later screenshot path option.
2. Validate the finite row IDs `Q1.image.D/N` and labels `image-before-cancel` / `image-after-cancel`. Derive `qa.e.output + '/diagnostics/' + qa.id + '-' + label + '.png'`. There is no caller-supplied output override.
3. Use existing `contained` against `qa.e.output` for the destination, including real-existing-ancestor/symlink checks before directory creation and again before write. Existing config/run-root containment remains mandatory. Create the diagnostics parent if needed; write the raw Buffer with existing Node `fs` using exclusive `wx`, never the JSON-oriented `env.write` (it serializes Buffers). Do not overwrite collisions or follow a destination symlink. This retains the existing trusted-private, single-owner filesystem model, not a hostile concurrent-filesystem security claim.
4. Only after raw write succeeds, feed that **same unmodified Buffer** to the existing SHA-256 helper. Use that digest as the original `artwork` string. Exclusively write a same-basename `.json` sidecar containing only row ID, label, PNG basename, byte length and SHA-256. Validate its destination identically. This is a finite evidence record, not a new snapshot field or event subsystem.
5. Resume the original invitation/open/controls sequence. Preserve all eight snapshot fields, createdAt-only normalization, positive pre-action invitation guard, chooser cancellation, diagnostic before/after record, unchanged `assertImageCancel` and every successor assertion.

There are at most two PNGs and two sidecars per completed row; an early route failure may produce fewer. Existing screenshot calls outside these snapshots are untouched. No native decoding, polling, retries, waits, animation changes, GPU/context hooks, browser flags, thresholds or timeout/storage-budget increases. The unavoidable synchronous file-write cost is the sole added successful-path work; do not claim zero timing perturbation. Insufficient existing capacity is a blocker, not authority to enlarge budgets.

**Write failure:** propagate the original filesystem exception immediately, identifying row/label/destination without hiding its code/cause. If raw persistence fails, do not hash or continue to cancellation/equality; if sidecar persistence fails, do not return a successful snapshot. Do not swallow errors, retry, recapture, fall back to another root, delete partial files or repair/reuse the attempt. Keep any partial PNG/sidecar and earlier completed evidence, mark retention incomplete in the handoff, and distinguish this infrastructure failure from an artwork assertion. Existing runner-owned teardown/reporting remains responsible for cleanup; no finalizer rewrite. A later assertion failure must leave both successfully retained PNGs intact.

## Discriminating browserless verification

Extend the existing VM test of the actual copied UI route, using the real unchanged hash and oracle. Stub only existing page/download seams and narrowly controlled filesystem failures; do not prove a separate toy retention function. Keep original route regressions and actual browserless re-entry tests passing under the accepted Node24/installed-runner toolchain. No browser/server, installs or builds during this stage.

Required controls and counterexamples:

- Desktop and narrow equal-buffer controls: count exactly one image canvas capture per snapshot; log capture → raw write completion → hash → invitation → Settings reopening. Spy call-through SHA to record Buffer identity and bytes at hashing. Read actual stored files and require byte-for-byte equality to those recorded inputs, not merely a matching sidecar. Independently recompute digests and compare both sidecars and original snapshot `artwork` values. Verify filenames cannot collide across rows/phases and full successors still execute.
- Unequal-buffer control: return two distinct valid PNG fixtures, retain both unchanged and prove the real full-equality assertion fails specifically on artwork, with successors unreached. Also use PNGs with equal decoded pixels but different valid PNG encoding/ancillary bytes to prove raw byte inequality is still rejected; pixel equivalence is not an alternative oracle.
- Selective mutants: retain-old-source must fail the named missing-retention assertion; storing the before buffer for both labels or altering/re-encoding only stored bytes must fail byte identity; hashing a substitute while storing the returned buffer must fail hash-input identity; extra capture must fail the capture count; skipping artwork equality must fail the expected-oracle-rejection check. Record named assertion failures, not just nonzero process exits. Test assertions sit outside catches for expected route errors.
- Inject raw-write and sidecar-write failures separately; verify original error provenance, no fallback/recapture, correct stopped phase, retained earlier files and no false completed-snapshot claim. Exercise actual filesystem collision and symlink/traversal/foreign-root refusals with outside sentinels unchanged. Route-retention probes, sentinels and generated mutant projections must stay inside their unique offline test evidence root; their writes may not escape it. This probe boundary does not prohibit the unchanged guard suites' separately enumerated fresh `C/runs/t-<UUID>` and `C/runs/offline-<UUID>` roots. Preserve partial evidence rather than cleaning it into a success.

Record exact commands, runtime, exits, fixture identity, logs and mutant diffs in fresh evidence. Independently review the complete implementation patch, these discriminating results, unchanged source inventories and preserved evidence. Deliver an explicit implementation ACCEPT before any native handoff. Neither author nor implementer self-approves.

## One controlled fresh native attempt — subsequent gate only

After both independent reviews, explicit parent native authorization and fresh exclusive lane transfer, allow **one bounded four-row batch**: one serial installed-Playwright invocation for Chromium Q1.image.D/N, then one for Firefox Q1.image.D/N, zero retries. This is one fresh attempt per selected row, not a repeat-until-pass loop. A shared prelaunch/config/retention/containment blocker stops the batch; unexecuted rows stay unexecuted. An ordinary artwork assertion remains a failed row, not grounds for retries.

Use C's accepted private smoke config directly, never `run.mjs`; unchanged pinned immutable dist `h1-integrated-20261115T180652Z/immutable-candidate/dist`, fixture, Node24, Playwright1.59.1 and retained browser caches. Verify complete accepted candidate/build/tool identities and available capacity before launch. Allocate new separate engine run roots with the existing phase/lane/engine/attempt suffix, owned available ports, contained helper/tmp/cache paths and no inherited external output overrides. Preserve re-entry ownership guards; consumed offline/list-only roots cannot become native roots. Retain one worker, original viewports/DPR, all existing budgets, runner-owned `retain-on-failure` tracing, served-byte verification and strict owned-process/listener cleanup. Use the existing accepted execution procedure; no observer redesign or new approval schema.

Afterward, verify each stored PNG against its sidecar and actual snapshot digest before interpreting it. Offline only, inspect exact PNG dimensions/chunks and decoded RGBA differences and correlate available existing trace/console context events; no additional capture or diagnostic run. Passing rows may have no trace under the unchanged policy. Report every row's literal result, first failure, unreached assertions, retention completeness and cleanup outcome. Read back new artifacts and preservation inventories; retain all errors and any incomplete batch.

A new pass is only new evidence: it neither clears the historical artwork mismatch nor proves context recovery caused it. A new inequality remains failed even if decoded pixels match. Any proposed readiness synchronization, changed oracle, renderer fix or additional native attempt needs a separate bounded assignment. Original worker-reload failure, artwork failure, historical matrices and unrelated release gates remain intact. No undraft, merge, deployment, remote action or release-readiness declaration is authorized.
