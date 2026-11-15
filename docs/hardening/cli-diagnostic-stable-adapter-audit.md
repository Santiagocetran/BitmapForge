# Independent audit — stable operational checkpoint / natural-DPR1 candidate

## Verdict: ACCEPT — executable candidate, not execution authority

**ACCEPT** the bounded external candidate whose `adapter-manifest.json` is 2122 bytes, SHA-256 **`3e3e6fe5417091f0b91001de6791e29fd2752a0a165fdc3366d5bacf4773cdc1`**. No implementation revision is required for this acceptance unit. It is suitable for the already specified parent-authorized natural-DPR1 measurements **after** the existing finite-handoff/sealing, fresh actual preflight and explicit current-owner transfer gates. This verdict neither populates those gates nor transfers the lane. **Execution remains NO-GO now; QA retains the serial lane.**

This accepts the candidate implementation, not measurements, a rendering diagnosis, a source/build mapping, production repair, broader DPR coverage, P, C or release. No additional approval layer or diagnostic scope is introduced.

Paths:

- R: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`
- D: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-cli-render-diagnostics`
- C: `D/amendment-candidate`

## Review method and independently checked bytes

Read repository AGENTS, web-product-development guidance, accepted amendment and independent design audit, implementation verification, the complete replayable patch, discovery/checkpoint/approval/observer/probe/capacity/finalization source and all three test files. Codex/COLLAB bootstrap paths checked are absent. Shared branch is `gloin/release-hardening`; unrelated existing changes were not edited.

Only read-only Git inspection and Python file hashing/aggregation were performed. **No candidate code, tests, preflight, browser version command, render, server, installation, build or lock was executed by this audit.** Test execution and runtime-version observations below are retained implementation evidence, not fresh executions by the reviewer. The only authored file is this report.

Independent readbacks established:

| Evidence                      | Result                                                                                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Candidate manifest            | Exact requested hash; all 15 members match: 13 mjs modules and two contract JSON files                                                                                           |
| Candidate preflight           | 85997 bytes; SHA-256 `4c2f1f49a7887521bddc035e298f00da5eff73ab55a41636f257299c88675bb1`; equal to retained second readback                                                       |
| Actual operational discovery  | Independently reconstructed from the literal recursive roots and explicit inputs: 124 members; no symmetric membership, realpath, length or SHA-256 differences from C preflight |
| Proposed inputs               | 123/123 lengths/hashes retained; one existing additional source module explicitly reconciled below                                                                               |
| Immutable reviews             | 15/15 copies match declarations and their actual original source bytes                                                                                                           |
| Protected repository inputs   | 13/13 match current-handoff pin-index bytes                                                                                                                                      |
| Preexisting external evidence | 502/502 original paths match preservation-before lengths/hashes                                                                                                                  |
| Original executable freeze    | 11/11 modules match original manifest SHA-256 `e046b36f02280c849d66804de6236d414506658c51cfd9eb051882acc6d1dee6`                                                                 |
| Patch fidelity                | Regenerated original-to-candidate unified diff in memory; exact equality to `implementation.patch`, including additions                                                          |
| Runtime executable/ESM bytes  | Node, npm CLI, Chrome, FFmpeg and ffprobe current realpaths/lengths/hashes match retained preflight; Puppeteer ESM entry and package bytes match                                 |
| Historical non-pin fields     | Every old preflight non-pin field equals C, preserving runtime, environment, source contracts, CI policy and provenance                                                          |

### The 124th pin is stronger coverage, not an invented target

Removing the old suffix whitelist discovers the existing tracked `src/engine/loaders/bitmap.browser-smoke.mjs`. Read-only `git ls-files` confirms tracked membership; its last path commit is `6a899ad` (`fix: use Node 24 LTS for reliable release installation`). Current pin: 4489 bytes, SHA-256 `370253a13e5747b158dd7cb0553e7b550af2dbc3403ab13a66c5426210f09643`; realpath is the same absolute R path. C publishes it in both preflight and pin disposition.

Accept this explicit extra source pin: the accepted policy is actual recursive discovery, not a historical count of 123. It neither changes this module nor drops any proposed input. Omitting an existing mjs source merely to reproduce 123 would weaken the accepted contract. Future unexpected membership still blocks equality; 124 is an observed inventory, not a permanent allowlist.

## Contract findings

### Stable identity and symmetric drift — accepted

`checkpoint.mjs:14–55` retains recursive engine/embed/app-utils/PreviewCanvas/CLI input discovery, CLI config discovery, manifests/lock, helper/checker/fixtures, all seven served-asset disk paths, supplemental generated-project spec and the protected live measurement plan. It excludes unrelated recursive hardening prose rather than excluding required runtime inputs.

Pins contain repository-relative membership and actual realpath/length/hash. `drift()` compares the sorted union of before/after keys and full identities. Add/remove/rename/content/length/realpath changes therefore fail rather than slipping through an old-key-only scan. `boundary()` checks the complete actual preflight, not only entries labeled runtimeRelevant; test/helper/fixture changes remain blockers. Startup compares approved versus actual preflight before lock/spawn; boundaries run before and after each cell and at final session completion. The asynchronous final boundary is awaited through `sessionScope` before finalization/release.

Unrelated QA-document addition/edit/removal, including this report, cannot invalidate C's operational identity. The **original D adapter remains unchanged** and still has its old documentary-recursive behavior; this ACCEPT cannot authorize the old implementation through projected JSON.

### Authentic immutable reviews and checkpoint copy — accepted

The fifteen authentic external absolute review copies are separate from live operational pins. `review-inputs.json` itself is executable-manifest-covered; changing a copy and rewriting its declaration does not retain the accepted adapter identity. Every use verifies copied lengths/hashes and includes actual realpath and source attribution in identity. The live measurement plan remains both protected and copied; other mutable review originals are not recursively reimported.

Checkpoint copying reads declared absolute review paths directly, checks bytes, verifies even preexisting content-addressed objects, then repeats operational/review inventories and adapter freeze. The final boundary repeats actual runtime/review checks. Required new finite owner dispositions must be supplied and sealed explicitly, not inferred from reference names. The delivered verdict can be pinned separately by the parent; embedding its own hash into the candidate is unnecessary and would reintroduce self-invalidation.

### Actual selected-copy / cumulative reservations — accepted

Adapter command phase → observer attachment → serialized probe propagation is present. The page guard validates the natural page DPR and renderer ratio, exact phase, safe positive integer RGBA arithmetic, actual role-specific backing and supplied ImageData dimensions/byte length **before diagnostic native read, WebGL copy-canvas creation, typed-array copying or serialization**. Native read results are rechecked before copying. Output roles require exact nominal backing; the effect-grid role permits its actual smaller backing within those bounds. Production's original getImageData/drawImage calls are forwarded first and unchanged; bounding diagnostic copies does not suppress production capture.

The selected ceiling is genuinely **640000**, independently of the unchanged **1048576** raw hard cap. Pending capacity is checked conservatively before work against 64 records / 4MiB, including base64 transport plus a 16KiB scalar allowance. Within the synchronous reservation-to-send turn there is no await allowing another copy to consume that allowance. Cumulative raw count/bytes and conservative allocation charges are reserved first; aliases and settled sends do not refund actual allocation charges. Later buffers stop after failure. Conservative refusal is allowed: nominal arithmetic fit does not promise a whole workload will pass the cumulative allocation gate.

Node `validateTransport` rejects wrong phase, unsafe/mismatched dimensions/length, wrong role backing, excessive slots and malformed encoding/key before `Buffer.from`; observer Store limits and existing independent result/cleanup/terminal reserves remain intact. No existing cell/session/queue/scalar/process/decoder/cleanup/time cap is increased. Buffer overflow becomes a persisted observer/probe failure, not truncated successful evidence or permission to skip a mandatory cell.

### Failure persistence, authority and six-cell coverage — accepted

Original real-child filesystem-failure regressions retain independent cleanup/result/reserved-terminal attempts and primary-failure precedence. `finalizeSession` blocks unstarted cells and releases only its owned lock even on persistence failure. Candidate's only finalizer behavior change awaits the asynchronous finish callback. Adapter rejects observer/provenance/cleanup/infrastructure failure and stops later cells; expected pixel failures remain evidence under unchanged comparison rules.

Approval requires explicit `authorized:true`, exact `natural-DPR1`, natural DPR 1, exactly 640000 selected bytes, approved capacity, independently accepted exact manifest, sealed finite handoffs, exact runtime/environment/preflight and parent-supplied current-owner/explicit-transfer evidence. The false template is not authority: review is PENDING, capacity is unapproved, handoffs incomplete and owner/transfer absent. Current missing dispositions deliberately block it.

Ledger and executable mandatory ordering remain `D01-O`, `D01-N`, `D02-O`, `D02-N`, `D03-O`, `D03-N`; optional D05 is excluded in this phase. Independently checked ledger arithmetic and selected indices: D01 `[0,12,24]`, D02/D03 `[0,10,20]`. All DPR1 rows are NOT RUN; **all six DPR2 rows remain BLOCKED / NOT RUN**, including the smaller cases. No automatic second pass, cap increase, deviceScaleFactor/DPR/viewport forcing, resize/downsampling, fixture/case substitution or threshold change appears in the patch. The parent also rejects actual Chrome DPR/viewport-forcing flags. N-arm page/renderer DPR remains internally unobserved because its no-preload control is intentionally preserved; nominal DPR1 labels are not observations of N internals.

## Causal tests and retained execution evidence

Read literal commands/stdout/stderr/exit codes in `C/test-results.json`, not merely verification totals. Original suite records **36 tests / 36 pass / 0 fail / 0 skipped**. Candidate records **47 / 47 / 0 / 0**; all 36 original case names remain plus 11 amendment cases. Thirteen additional syntax commands each exit zero; all fifteen recorded commands exit zero. This audit did not rerun them.

New tests exercise actual imported discovery, drift, immutable-review, phase/authority and complete boundary functions against private inputs; the serialized actual reservation/buffer bodies run in a nonbrowser VM. Positive controls accompany negatives. Covered causes include unrelated QA-prose stability; source add/remove/content and identical-byte symlink retarget; helper/checker/fixture/config/lock/asset/live-plan changes; review edit/removal and manifest tamper; wrong runtime/environment and absent/stale lane transfer; natural DPR1 positive, oversize, unsafe, DPR2 and ImageData mismatch rejection; raw/allocation/pending reservation exhaustion before native work; and Node predecode rejection. Retained old source supplies concrete counterexamples for source addition, 641600-byte acceptance and allocation before cumulative/queue refusal.

Distinguish proof strength: adapter/observer propagation has literal-source assertions; buffer tests use extracted real function bodies with stubbed nonbrowser APIs; finalization tests use shared production finalizers and benign real children. These establish the bounded offline contracts, **not live Chromium rendering or served-runtime acceptance**. Existing 36 cases include genuine fault-injection persistence and later-valid-cell nonlaunch assertions, retained old-finalizer failure, strict decoded comparison and finite-cap policy; the patch only adapts stronger-gate fixture data, deterministic drift ordering and the relocated retained-source path.

## Toolchain, CI and provenance boundaries

Retained runtime versions remain Node `v24.22.3`, npm `11.21.2`, production ESM Puppeteer `22.15.0`, Chrome `127.0.6533.88`. Resolution stays anchored to production's conditional ESM entry; no CJS singleton, replacement browser, install or runtime upgrade is introduced. Existing literal CI absent/empty/`0`/`false` semantics and actual sandbox-flag validation remain unchanged. Retained preflight has CI, NODE_OPTIONS and browser/cache overrides absent and profile scratch TMPDIR present. No CI1 fallback or environment deletion is accepted.

This audit's Python tool kernel reports a different TMPDIR (`/home/agent/.hermes/cache/scratch`) from the retained profile TMPDIR. That is **not an executed candidate preflight or evidence of operational source drift**. It is another reason not to claim fresh execution-environment equality here: the parent's eventual pinned-runtime invocation must inherit and verify the exact approved environment through the existing gate.

All seven disk assets are pinned, but disk identity is not observed HTTP consumption. Existing body/status/type/URL/origin/owned-port checks and runtime-consumed versus provenance-only distinction are retained. Attribution remains literally **`retained-bundle-only; source/build equivalence unverified`**. Same retained bundle bytes do not establish a new build mapping or diagnosis; original fourteen artifact failures and future DPR2 obligations remain outstanding.

## Parent handoff — existing gates only

1. Supply the already-required finite checkpoint, accepted A/AB and runtime/build/environment dispositions; freeze them in the finite review set and explicitly disposition the resulting resealed manifest/preflight identity. This acceptance does not pretend those missing bytes already exist or silently extend to arbitrary executable changes.
2. Fresh actual operational/source/asset/review/adapter/runtime/environment reconciliation using the selected C adapter, approved pinned toolchain and literal inherited environment. Do not run `verify.py` as an approval shortcut: it writes candidate evidence/manifests and is not a launch authorization.
3. Discover the actual current QA owner and obtain explicit QA-to-CLI serial-lane transfer; the contextual owner string or finished worker alone is insufficient.
4. Parent creates one exact-phase approval binding the accepted bytes and capacity. Only then may the existing six mandatory natural-DPR1 measurement pass run, stopping on actual reservation/backing/provenance/observer/infrastructure/cleanup failure.

**No candidate fix, cap change, extra case, new review layer or execution is requested by this audit.**
