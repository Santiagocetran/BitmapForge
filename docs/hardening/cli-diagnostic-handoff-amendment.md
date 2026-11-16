# CLI checkpoint amendment — deterministic inputs and bounded capacity

## Proposal only — no implementation or execution authority

QA baseline retains the serial browser lane. This document does not transfer it, populate an approval, change a cap, authorize a build/install/server/browser, or accept P/C/release. Existing adapter manifest `e046b36f02280c849d66804de6236d414506658c51cfd9eb051882acc6d1dee6` and all eleven root modules are unchanged. Only this repository document and external proposal/evidence files were written.

Paths below use these literal roots:

- Repository R: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`
- Adapter D: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-cli-render-diagnostics`
- New evidence E: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-cli-render-diagnostics/amendment-evidence`

## Exact readbacks: distinguish observed drift from a concurrency warning

Two real nonlaunch `checkpoint.mjs:preflight()` calls at 2026-11-15 09:48 UTC produced exactly the saved current checkpoint: 70002 bytes, SHA-256 `508978a53d3dd5abc73a6dc60ec962bc792a8df11fcfbe86309f92ee0f4c43f2`, 195 pins. **No current drift was reproduced before writing this amendment.** `E/readback-1.json`, `E/readback-2.json` and `E/drift-report.json` retain this result. Do not describe the supplied earlier drift warning as an observed continuing source change.

The preserved immediately superseded checkpoint does demonstrate the exact QA-document drift:

| Path                                      | Superseded                                                                      | Saved current / both new readbacks                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `docs/hardening/qa-reviewed-preflight.md` | 10082 bytes; `77da86b94bfe144dd8cde080dcc544618062e65a2650f012033e460d8fde12a7` | 10093 bytes; `640eb1abe3beaf52b28ca98a09c2d381aa96b289bf686d390fe819b8ad526630` |

That is the only pin delta between `D/superseded-handoff-before-qa-reviewed-preflight/preflight.json` and `D/current-handoff/preflight.json`; every non-pin field is equal. It is QA review prose, not served bytes or a runtime/environment change. This amendment itself becomes another input under the existing recursive docs walk; its newly added path must be reported, not silently ignored by the frozen adapter.

Verified current state:

- All 13 protected pins equal saved current pins. Against the historical candidate: nine unchanged, four exact accepted-B manifest/lock changes, zero unexplained protected changes. All seven accepted-B promotion files match the accepted delivery, including the supplemental generated consumer spec.
- All seven filesystem route assets equal saved current pins. This is **disk identity, not observed HTTP/browser consumption**. Headless bundle remains 181180 bytes, `9681565ac5e39d8f6e36a8f4475c554959f67baf48f2064259117bb402661a46`.
- All non-pin preflight fields are equal: actual Node v24.22.3/npm 11.21.2, production ESM Puppeteer 22.15.0, Chrome 127.0.6533.88, executable realpaths/lengths/hashes, FFmpeg/ffprobe identities/capabilities, source attachment contracts, environment and sandbox policy.
- CI, NODE_OPTIONS, PUPPETEER_EXECUTABLE_PATH and PUPPETEER_CACHE_DIR remain absent; TMPDIR remains profile scratch. No CI1 fallback, DPR override, alternative browser or sandbox flags were introduced. Chrome was queried only with `--version`.
- Attribution stays **`retained-bundle-only; source/build equivalence unverified`**. Same bundle bytes do not establish a build mapping, HTTP provenance or a rendering diagnosis. Original fourteen artifact failures remain outstanding.

## Minimal proposed checkpoint change, independently reviewable

**Not possible by changing only approval JSON.** `adapter.mjs:102–104` recomputes the whole mutable preflight and compares it before the gate; a projected JSON cannot pass the unchanged implementation. Existing `drift()` also only walks old keys, so a new relevant source file can evade its between-cell check. The following bounded executable changes require explicit assignment and independent acceptance first; none is implemented here.

1. **`D/checkpoint.mjs`, `inputFiles()`**: remove only the recursive `docs/hardening` folder from operational discovery. Retain the accepted plan's literal protected path via existing FROZEN; it remains both live-pinned and copied. Keep every non-document file currently enumerated, all seven ASSETS, all manifests/lock/configs, checker/helper/fixtures, and add the literal `test/e2e/generated-code-project.spec.js` supplemental pin. Do not replace recursive source discovery with a stale fixed list. E's `operational-inputs.proposed.json` gives explicit current file/size/hash membership, runtime tuple and adapter pins; it is not an executable preflight.
2. **Immutable reviews**: `E/review-documents.json` maps 15 actual copied documents to original absolute paths and exact sizes/hashes under `E/review-docs/`. These include accepted measurement plan/review, adapter plan/reviews/repair, prerequisite plan/stage1/stage2 dispositions, current handoff and exact accepted-B audit. Originals remain untouched. Immutable means create-once and content-verified on each use, not trusting permissions. Parent must supply the already-required accepted-A/AB, checkpoint and runtime/build/environment dispositions; the present inventory explicitly records those missing inputs. Before the candidate is sealed, copy those finite required inputs once into the same external review set. Do not infer them from a similarly named document or add every QA approval file.
3. **`D/checkpoint.mjs`, `preflight()` / `checkpoint()`**: add a deterministic separate `reviewInputs` manifest pointing to these external copied bytes; validate and checkpoint them by declared absolute source path, never by accidentally joining them to R. Keep operational `pins` as repository-relative files. Retain all actual runtime/env/source-contract fields unchanged. Deterministically serialize sorted keys with explicit presence/value and no timestamps in the approval identity. Timestamped observation logs stay outside that identity. Copy and verify all manifest objects, then repeat the exact operational and review inventory before accepting a freeze.
4. **`D/checkpoint.mjs`, `drift()`; `D/adapter.mjs` preflight/between-cell/final gates**: compare union of before/after path sets, including lengths/hashes and source realpath identity, not only old keys. Add/remove/rename/retarget/change of any relevant input fails before next spawn and invalidates comparison if discovered afterward. Preserve source-folder recursion and config discovery; unexpected membership is a blocker. Check adapter manifest and immutable review bytes at the same boundaries. Do not merely exclude documentation from the startup equality while leaving checkpoint copying or after-run checks tied to live prose.
5. **`D/adapter.test.mjs` and `D/repair.test.mjs`**, offline acceptance before any launch: QA prose addition/edit/removal leaves the proposed operational identity stable; immutable required-review edit/removal fails; accepted live plan edit fails; engine/CLI/helper/checker/fixture/config/lock/served-asset change fails; a newly added and a removed source file both fail; symlink retarget fails; wrong runtime/environment and stale/absent lane transfer still fail before lock/spawn. Exercise actual imported gates with benign/no-spawn fixtures, not a permissive replacement model. Existing finalizer/terminal-reserve/cleanup regressions must remain passing.

Keep old `candidate-preflight.json`, `current-handoff/`, archives, manifests and failure evidence intact. If accepted, publish the changed candidate under a separately named external amendment-candidate directory with exact diff, old-to-new pin disposition and a new independently accepted executable manifest. Do not refreeze current accepted bytes merely to match a proposal. The independent verdict can live outside the runtime inventory: pin the delivered verdict as a separate parent approval input after candidate sealing. Its self-hash need not be embedded in the candidate it reviews. Later unrelated QA docs are informational observations only. A changed required contract requires explicit resealing, not endlessly widening the hashed mutable docs set.

## Capacity disposition: recommend DPR1-bounded phase, no cap changes

`E/six-case-ledger.proposed.json` retains **all six mandatory cells** and both capacity scenarios. Dimensions below are arithmetic, not observations:

| Cell  | Nominal / DPR1 backing | DPR1 RGBA bytes | DPR2 backing | DPR2 RGBA bytes | Present status |
| ----- | ---------------------- | --------------- | ------------ | --------------- | -------------- |
| D01-O | 400×400                | 640000          | 800×800      | 2560000         | NOT RUN        |
| D01-N | 400×400                | 640000          | 800×800      | 2560000         | NOT RUN        |
| D02-O | 160×120                | 76800           | 320×240      | 307200          | NOT RUN        |
| D02-N | 160×120                | 76800           | 320×240      | 307200          | NOT RUN        |
| D03-O | 160×120                | 76800           | 320×240      | 307200          | NOT RUN        |
| D03-N | 160×120                | 76800           | 320×240      | 307200          | NOT RUN        |

**Phase 1 proposal:** one existing ordered six-cell pass at naturally observed DPR1/backing, only after acceptance and real lane transfer. Keep 640000 selected-byte ceiling and 1048576 raw-file hard limit, selected indices D01 `[0,12,24]`, D02/D03 `[0,10,20]`, eighteen raw slots, existing queue/event/session/decoder/cleanup/time limits and literal fixtures. D01 stays first. No forced viewport/deviceScaleFactor/DPR, resize, downsample, case substitution or skipped control. Optional D05 remains disabled without its existing conditional question.

An approved nominal tuple is insufficient: actual selected-canvas identities and backing dimensions must be validated against the phase contract **before each diagnostic allocation/copy/enqueue**, with safe integer byte arithmetic and cumulative reservation. Do not alter production's existing capture reads; bound the diagnostic copies around them. Non-DPR1, oversize or mismatched actual backing stops and persists the blocker; it does not authorize switching to another cell or cap. The current adapter's `capacity.maxSelectedRGBABytes` is only an execution-gate value, not automatically a propagated per-copy 640000 enforcement. A bounded implementation must thread and test that stricter phase limit through `D/adapter.mjs`, `D/observer.mjs` and `D/probe.mjs`; include native-read/copy prechecks and reject-before-allocation counterexamples in the candidate's independent review. No claimed current support or execution follows from this plan.

**Phase 2 remains BLOCKED / NOT RUN for every DPR2 row**, including D02/D03 despite their arithmetic fit. Retain future DPR2 evidence obligations explicitly; this split neither invents an additional automatically authorized pass nor makes a DPR1 subset complete broader coverage. D01's 2560000 bytes exceeds both existing limits. No capacity increase is proposed or accepted by this delivery. If future DPR2 capacity is separately requested, review actual full-buffer copy/serialization/queue residency and total reserves before changing any limit; raising only an approval number cannot override the frozen hard cap. Phase 1 findings remain limited to their measured tuple.

## Strong go/no-go boundary

Remain NO-GO until independent acceptance of this bounded amendment and any resulting executable candidate; parent-required finite handoffs and exact runtime/build/environment dispositions; fresh source/asset/review/adapter equality; real current-owner discovery and explicit QA-to-CLI transfer; approved natural backing/capacity contract with enforced per-copy bounds; and one parent-created approval binding those exact bytes and phase. No synthetic owner fields, documentary `authorized:false` override, old review hash, or completed worker substitutes for these gates. Baseline/source edits occurring meanwhile require fresh operational reconciliation, not attribution to documentation drift. Expected pixel failures remain evidence; infrastructure/provenance/observer/cleanup failure stops later cells. Completion of measurements would still not authorize repair or clear P/C/release.
