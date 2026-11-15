# Independent audit — stable checkpoint and DPR1 phase amendment

## Verdict: ACCEPT — bounded design only, before adapter edits

**ACCEPT the amendment design** in `cli-diagnostic-handoff-amendment.md`, 12046 bytes, SHA-256 `f778ea4bae02e025cb43a5994d2ad4e763189cd8a1255d2d4c8a6a1c2273570e`. No further design revision is required before a separately assigned bounded external-adapter implementation handoff. This is not acceptance of an executable candidate, a populated approval, measurements, causal diagnosis, production repair, source/build equivalence, full P, C, or release. **Execution remains NO-GO. QA baseline retains the serial lane; this verdict transfers nothing.**

The amendment preserves the accepted measurement contract (`cli-render-diagnostic-plan.md`, SHA-256 `b1fd0e6ae2bd938480a983c06d03a6faa79de98b16cb25cae162896292a5f402`) while separating immutable required reviews from mutable QA prose and explicitly limiting the proposed first phase to naturally observed DPR1. Its identified executable gaps are real and are not represented as already repaired.

## Scope and independently verified evidence

Read repository AGENTS and web-product-development guidance, accepted measurement plan/revision audit, adapter handoff/audit/repair audit, current external checkpoint/gate/probe/observer paths and amendment evidence. Checked Codex/COLLAB bootstrap paths are absent. Shared branch is `gloin/release-hardening`; existing changes belong to other owners. Only this report was authored. No browser/server, build, installation, adapter/source edit, test-suite run, lock acquisition or measurement dispatch occurred.

Read-only Python hashing/aggregation and a fresh pinned-Node in-memory `preflight()` returned:

- **123/123 proposed operational files** match current lengths/hashes. Independently reran actual `inputFiles()`, removed only recursive `docs/hardening` membership except the accepted live measurement plan, added literal `test/e2e/generated-code-project.spec.js`, and obtained exactly the proposal's 123-member set. This is a verified current inventory, not permission to hardcode discovery to 123 files.
- **15/15 review copies** match their declared lengths/hashes and actual original source bytes. Fourteen repository copies also match saved current-handoff preflight pins; the fifteenth matches the separate accepted-B audit at its declared tooling-tree source. All 25 amendment evidence-index entries match. These are authentic retained reference bytes, not proof that missing parent approvals exist.
- **13/13 protected pins** match saved current pins. Relative to historical candidate pins, nine are unchanged and four are the root manifest/lock and CLI/embed manifest accepted-B deltas. **7/7 promotion files** match the accepted delivery, including the supplemental generated consumer spec; **7/7 filesystem route assets** match saved pins.
- Existing external manifest is unchanged: SHA-256 `e046b36f02280c849d66804de6236d414506658c51cfd9eb051882acc6d1dee6`; all **11/11 root modules** match it, including the tests. Actual `assertAdapterFreeze()` succeeds.
- Fresh preflight differs from saved current-handoff pins only by addition of the amendment document. All non-pin fields are equal. The retained superseded-to-current delta is exactly `docs/hardening/qa-reviewed-preflight.md`. This supports the stated documentary drift; it does not establish continuing or transient engine/runtime drift.
- Actual nonlaunch identities remain Node `v24.22.3`, npm `11.21.2`, production ESM Puppeteer `22.15.0`, Chrome `127.0.6533.88`. CI, NODE_OPTIONS and executable/cache overrides are absent; TMPDIR is profile scratch. Chrome was invoked only with `--version`. No launch-policy success is claimed.

This audit adds another document to the **old** recursive preflight. Its old identity therefore becomes stale again; that is expected and must not be concealed. The proposed separation, not this audit or an approval-field substitution, is the remedy.

## Contract findings

### 1. Stable identity without hiding source drift — accepted design

Amendment items 1–4 retain recursive operational source/config discovery, all non-document current inputs, seven assets and protected live plan, while explicitly adding the supplemental consumer spec. The proposal's explicit paths are a reviewable checkpoint of current membership, not a permanent allowlist. Union-of-keys comparison at startup, between cells and finalization detects additions as well as removals, renames, length/content changes and realpath retargets. Unexpected relevant membership blocks; it is not silently adopted.

The old defect is independently confirmed by calling actual `drift()` with an unchanged existing source plus an added engine source: it returns `[]`. Likewise, actual `adapter.mjs:102–104` still compares the full old mutable preflight before its gate. A projected approval JSON cannot implement the amendment. The accepted bounded candidate must change the real discovery/copy/gate paths and preserve their fail-closed ordering, not merely revise an evidence manifest.

### 2. Immutable reviews and nonrecursive authority — accepted design

The 15 copies are byte-authentic. Future use must bind the reviewed manifest and verify those copied bytes on every use; changing a copy and its editable manifest together cannot silently create new authority. Create-once means content verification, not reliance on filesystem permissions. Copy external absolute review paths explicitly rather than joining them to the repository root, verify checkpoint objects, and repeat both inventories before sealing.

The retained measurement plan stays live-pinned as well as copied. Other required contracts are frozen into a finite external review set; a changed required contract requires explicit resealing. Parent checkpoint, accepted A/AB and runtime/build/environment dispositions are explicitly missing, not inferred from names or copied prose. They must be supplied and frozen before sealing as specified. Current lane discovery/transfer remains a fresh execution authority requirement, not an immortal owner string in a review snapshot.

Separately pinning this delivered verdict in parent approval **after** candidate sealing avoids embedding its self-hash in the candidate under review. Later unrelated QA documents do not enter the proposed operational identity or grow its immutable review manifest automatically. This resolves audit-growth self-invalidation without discarding mandatory review evidence.

### 3. Actual selected-copy and cumulative bounds — accepted design, unimplemented

The amendment correctly distinguishes approval metadata from enforcement. Existing `executionGate()` accepts a capacity number, but the current probe checks the old 1048576-byte limit; it does not implement a 640000-byte phase ceiling. The candidate must propagate the reviewed phase contract through adapter → command/observer → probe and enforce it on the actual selected canvas/read result, not only nominal CLI dimensions.

The written requirement is before **each diagnostic allocation/copy/enqueue**, with safe positive integer dimension/byte arithmetic, actual identity/backing checks and cumulative reservation. It covers native diagnostic readbacks, the WebGL copy canvas, typed-array copies and serialization/pending transport, without changing production's existing capture reads or forwarding semantics. Role-specific grid/output dimensions must be truthful; a nominal DPR1 flag cannot excuse an unexpected backing buffer.

All existing cumulative limits remain mandatory: at most 18 raw diagnostic buffers, each at most 1048576 bytes and additionally at most 640000 in this phase; cell 128 files/64MiB; session 256 files/128MiB including its reserve; pending 64 records/4MiB including encoded transport; scalar/event partitions and terminal reserves unchanged. Eighteen full 400×400 buffers are 11520000 raw bytes before transport/other evidence, not a newly authorized budget. Deduplication must not erase charges for memory actually allocated or pending. Overflow must preserve the blocker and normal independent finalization, never truncate successful evidence or continue to another cell.

### 4. Six cells and DPR2 obligations — preserved

Programmatic ledger validation confirms exactly `D01-O`, `D01-N`, `D02-O`, `D02-N`, `D03-O`, `D03-N`, in the accepted order. Every DPR1 row remains NOT RUN and every DPR2 row is **BLOCKED / NOT RUN**, including the smaller D02/D03 rows. Arithmetic independently checks:

| Pair     | DPR1 backing / RGBA bytes | DPR2 backing / RGBA bytes |
| -------- | ------------------------- | ------------------------- |
| D01      | 400×400 / 640000          | 800×800 / 2560000         |
| D02, D03 | 160×120 / 76800           | 320×240 / 307200          |

D01 DPR2 exceeds both retained per-copy limits. No DPR forcing, viewport/size change, downsampling, cap increase, threshold reduction, skipped control or case substitution is accepted. Selected indices remain D01 `[0,12,24]`, D02/D03 `[0,10,20]`. D01 stays first; unexpected actual backing/DPR blocks instead of routing around it. D05 is disabled absent its original conditional question, not a replacement mandatory case. DPR2 is a retained future obligation, not an automatically authorized second pass or a completed coverage claim.

### 5. Provenance, authority and stopping rules — preserved

Disk asset equality is not HTTP consumption evidence. The original seven exact response-body/status/type/URL/origin/port requirements, runtime-consumed versus provenance-only distinction, retained original failures and O/N decoded comparability remain unchanged. Results must retain the literal label **`retained-bundle-only; source/build equivalence unverified`** absent an owner-supplied same-checkpoint build mapping. No unauthorized build is needed to maintain that honest limitation.

Parent-required finite handoffs, literal runtime/environment equality, fresh operational/review/adapter inventories, a separately accepted executable candidate, enforced natural backing capacity, real current-owner discovery and explicit QA-to-CLI transfer, and one parent-created exact-phase approval remain gates. Synthetic owner fields, finished-worker status and documentary authorization flags cannot replace them. Infrastructure/provenance/observer/cleanup failure stops later cells; original expected pixel failures remain evidence rather than being relaxed. Measurement acceptance does not expand diagnostics or authorize repair.

## Planned offline acceptance — sufficient and still outstanding

The amendment specifies actual imported-gate/no-spawn tests, not a replacement permissive model. Candidate review must see causal tests for unrelated QA-doc add/edit/remove stability; immutable review edit/removal and protected live-plan rejection; operational source/helper/checker/fixture/config/lock/asset content changes; new and removed source membership; symlink retarget; and wrong runtime/environment or absent/stale lane transfer rejection before lock/spawn.

Its stricter-cap tests must exercise actual adapter/observer/probe propagation and reject **before** the first diagnostic read/allocation/copy/enqueue: natural valid dimensions as a control, a buffer above 640000 but below the old hard limit, unexpected DPR2/backing, unsafe arithmetic and cumulative raw/queue/aggregate exhaustion after individually valid buffers. Retain the current implementation's permissive-cap/addition behavior as causal counterexamples where applicable. These are fidelity checks of the written amendment, not new diagnostic features. Existing integrated persistence, reserve, primary-failure, blocked-later-cell, cleanup and owned-lock regressions must remain passing.

No such new candidate or causal test results exist yet. This verdict accepts the bounded **design** before edits; it does not pre-accept their eventual implementation. Preserve old manifests/checkpoints/failure evidence, publish any assigned candidate separately with exact diff and old-to-new pin disposition, and return its exact executable/test manifest for independent acceptance before any launch.
