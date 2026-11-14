# Independent CO-3 L1 implementation audit

## Verdict: changes requested — generation safety passes, resource ownership incomplete

The completed engine slice implements the principal latest-request-wins contract correctly for the tested paths. Do not accept its stronger exactly-once/all-owned-resource cleanup claim yet: three medium resource-ownership defects remain. One low-severity exceptional-construction regression also needs a regression test/fix. None requires expanding into L2 playback policy.

This is an independent implementation audit, not release approval or closure of #89, CO-R1/1a, or the history/starter work.

## Scope and evidence

- Branch: `gloin/ui-output-improvements`; HEAD/baseline: `298bdec17dcd1603add549118a743e5cd494ba08`.
- Read root `AGENTS.md`, `creative-output-acceptance.md` (especially L1, lines 50–59), and authoritative CO-R1/CO-R3 in `creative-output.md`. `CODEX.md` and `COLLAB` bootstrap files are absent.
- Reviewed the baseline diff **only** for `src/engine/SceneManager.js`, `src/engine/loaders/{modelLoader,textGenerator,imageLoader}.js`, and read the two new safety tests. The new tests are untracked and therefore absent from ordinary `git diff`; they were inspected directly. Did not inspect concurrent UI/CI/export diffs or modify implementation files.
- Read original loader tests, root Vitest setup/configuration, shape creation, and relevant installed Three.js loader implementation as supporting evidence.
- Independent execution used **Node v20.20.2**, obtained through `npx --yes --package=node@20 -c`:
  - `node node_modules/vitest/vitest.mjs run src/engine`: **22 files / 306 tests passed**, including both safety suites and original `modelLoader.test.js`.
  - Both safety files plus original loader tests, `--maxWorkers=1`: **3 files / 37 tests passed**.
  - Same files, `--maxWorkers=1 --sequence.shuffle --sequence.seed=8903`: **3 files / 37 tests passed**.
  - ESLint and Prettier checks restricted to all six reviewed files: passed.
- Additional executable reproduction: `npx --yes --package=node@20 -c 'node ../engine-l1-audit-probe.mjs'`. This scratch-only harness uses the actual engine module and installed Three.js. Its multi-scene case uses the **real GLTFLoader/parser**, an actual Blob URL, embedded binary positions, two scenes and distinct geometries/materials. The other cases inject decoder results or a constructor-stage failure; they do not measure browser GPU memory or decode real bitmaps.

## Findings and required fixes

### F1 — Medium / P2: decoded non-default glTF scenes have no owner

**Location:** `src/engine/loaders/modelLoader.js:84–88, 93–97`.

`GLTFLoader` resolves every scene, not just the default scene (installed `GLTFLoader.js:2737–2750`). `loadModel` retains only `gltf.scene`. Distinct geometries/materials/textures in other decoded scenes are neither transferred into the returned disposal handle nor disposed. Successful replacement, stale completion, normalization failure and manager disposal cannot reach these resources.

**Reproduction:** real two-scene glTF; load, then `prepareSource(result.group, result.objectUrl).dispose()`. Disposal event counts: default scene geometry **1**, default original material **1**, second-scene geometry **0**, second-scene material **0**. The current tests fabricate only `{ scene }`, hiding the ownership gap. This is a pre-existing loader limitation left unresolved by the new L1 ownership contract, not a newly introduced scene-selection regression.

**Action:** establish an ownership ledger for the complete decoded result. Retain resources needed by the published scene; release resources exclusive to discarded scenes, including on normalization failure. Deduplicate across scenes because Three.js may share geometry, material and texture instances. Do not simply dispose every secondary scene without checking sharing with the retained scene.

**Required tests:** real two-scene decode or faithful `scenes` fixture, both distinct and shared resources; success, normalization rejection and stale manager completion. Assert secondary cleanup and retained-resource liveness/exactly-once final cleanup.

### F2 — Medium / P2: early white-material cleanup can dispose textures still in use, then dispose them twice

**Location:** `src/engine/loaders/modelLoader.js:39–55, 104–115, 134–144`.

`applyWhiteMaterial` replaces mesh materials only, but unconditionally disposes all textures from replaced materials. A supported imported group can contain meshes and line/point primitives with distinct materials sharing one texture. The remaining material still references that texture. Early disposal violates its ownership, and the later `prepareSource.dispose()` starts a fresh deduplication set and disposes it a second time. Sharing a whole original material with a retained non-mesh object similarly breaks material ownership.

**Reproduction:** decoder-result fixture containing a mesh with `MeshStandardMaterial` and a line with `LineBasicMaterial`, both referencing one real Three.js texture. After `loadModel`: texture disposal count **1** although the line retains it; after prepared-source disposal: **2**. This is a new early-disposal/exactly-once regression. No browser pixel corruption is claimed from this event-count probe; disposal may force a later re-upload rather than permanently blanking the texture.

**Action:** after replacement, collect resources still reachable from all retained renderable objects; release only resources no longer referenced. Carry one source-level ownership/deduplication model through preparation and final disposal. Merely carrying the old `seen` set forward would prevent a duplicate event but would not fix premature disposal.

**Required tests:** mesh plus line/point with shared texture and shared original material; no disposal while retained, exactly one disposal at final release; equivalent failure-path cleanup.

### F3 — Medium / P2: GLTFLoader-owned ImageBitmap backing resources are not closed

**Location:** `src/engine/loaders/modelLoader.js:104–115, 118–130`.

The disposal helper invokes `Texture.dispose()` but never releases an owned decoded `ImageBitmap`. Installed `GLTFLoader.js:79–81` explicitly documents the need for special bitmap disposal. This matters particularly because white-material conversion discards imported textures immediately: the only remaining reference to their native image allocation can disappear without an explicit close. Multiple Texture instances can also share one bitmap/source.

**Evidence:** a decoder-result fixture with a texture image exposing a counted `close()` received **0 closes** through preparation and final disposal. This verifies the missing call, not a browser heap measurement. Ordinary image uploads here use HTMLImageElement/canvas, not this bitmap path. The old implementation also lacked bitmap cleanup; the new comprehensive resource-ownership prerequisite remains incomplete.

**Action:** track loader-owned bitmap images independently from Texture identities; close each only after its final retained texture consumer is released. Include bitmaps from discarded materials/scenes, without closing shared/cached or otherwise unowned data prematurely. Explicitly document the ownership rule.

**Required tests:** owned bitmap with two Texture wrappers, discarded white-preview maps, retained non-mesh texture consumer, stale completion and normalization failure. Assert one close at final ownership release, none beforehand. Add a small real-browser bitmap decode/disposal smoke when integrating the shared engine; current mocks cannot establish native memory reclamation.

### F4 — Low / P3: STL geometry loses failure cleanup before mesh attachment

**Location:** `src/engine/loaders/modelLoader.js:74–77, 95–97`.

The baseline guarded mesh/material construction with a catch that disposed decoded STL geometry. The revision assigns an empty `group` before cloning the material/constructing the mesh and relies solely on traversing that group in the outer catch. If construction throws before `group.add(mesh)`, traversal cannot find the geometry.

**Reproduction:** inject a throw in `MeshStandardMaterial.prototype.clone` after STL decode. The request rejects as expected, but decoded geometry disposal count is **0**. This is an exceptional-path regression, not evidence that valid normal STL files fail.

**Action:** keep explicit ownership of decoded geometry/material until successfully attached to the cleanup group; dispose unattached resources in the catch without double-disposing attached resources.

**Required test:** material clone or mesh-construction failure after successful STL decode; geometry disposal and URL revocation exactly once, followed by successful retry.

## What the implementation does satisfy

- Model/text/image requests share a monotonic per-manager generation; a synchronous shape invalidates a pending model. Pending requests are no longer silently dropped.
- Preparation remains unattached, and stale successful results are disposed instead of published. Failure preserves the previous attached source in the tested cases.
- Stale success/rejection cannot clear a newer request's `_loading` state. Retry works after rejection. Explicit `disposeModel()` invalidates pending preparation.
- Disposal/destroy is idempotent in normal paths; late prepared resources are collected without attaching to an obsolete manager. Retained frame/context callbacks and rendering/settings/load entry points have appropriate post-disposal guards.
- Geometry/material/texture deduplication works for resources shared **inside one retained group** in the covered mesh-only cases; text shared-material/partial-bounds failures and image rasterization/construction failures have meaningful tests.
- Publication rollback restores previous group identity/rotation and releases the replacement when the mocked `startAnimation` fails before publication completes.
- No unjustified UI/history/capture/policy expansion was found in the reviewed diff. Locating ownership helpers in the already-vendored model loader avoids an immediate additional engine-source manifest dependency. Text now imports that loader; generated/package execution and bundle impact still need later integrated verification, not an assumed failure.

## Test isolation and remaining evidence gaps

The integration warning about root-suite loader failures was independently checked, not attributed to this slice by association. `test/setup.js` globally mocks Three.js and loaders. The safety files deliberately override those module mocks with real Three.js plus targeted doubles, restore spies/global stubs, and root configuration does not disable normal Vitest file isolation. Both normal and shuffled single-worker runs passed alongside original `modelLoader.test.js`; the complete engine run also passed. **No engine mock-interaction failure was reproduced.** Original tests still use the broad global mock and do not validate real decoding; that is a coverage limitation, not a reason to change unrelated global setup in this slice. Concurrent UI/ExportPanel/palette failures were not reviewed or classified.

Beyond F1–F4, useful bounded additions are text/image pending → shape, a failed synchronous shape preserving the previous source while invalidating prior async work, and failed publication followed by successful retry. Tests should continue asserting attached identity and per-resource disposal counts, not only `_loading`/`hasObject`. Fault injection after partial effect mutation and throwing disposal listeners would further harden rollback/cleanup, but no normal-path failure from those scenarios was demonstrated here. Do not read the existing mocked publication test as proof of rollback for every possible effect/cleanup exception.

## Explicitly deferred, not L1 defects

- **L2:** requested playback vs policy/context reasons, constructor suspension, pause-safe context restoration, capture suspension tokens, capture concurrency, framesProvider/CLI finally behavior. Context restoration still unconditionally resumes a live paused manager (`SceneManager.js:101–103`); that is the known L2 prerequisite, not an extra L1 rejection reason.
- **L3/L4:** SDK visibility/reduced-motion/reconnect policy; generated React StrictMode/custom-element lifecycle; CSS representative still; real recurring-callback browser evidence and packaged integration validation.
- **CO-R1 later integration:** project/store/settings transaction, PreviewCanvas consumption and retained binary history/undo ownership. An internal manager source handle is not that API/history delivery.
- Full shared-tree CI-equivalent verification, SDK/CLI/export/browser builds and release safety remain integrated gates. This audit neither ran nor claims them.

## Artifacts and limitations

Only repository artifact authored: this audit. Reproduction helper is outside the repository at `../engine-l1-audit-probe.mjs`; no implementation/tests, commits, remote issues, deployment or production settings changed. Plan documents are locally ignored (`git check-ignore` confirmed this audit path), so the parent must deliberately retain/publish the artifact if required.

Reviewed content hashes (`git hash-object`, in scope order):

```text
SceneManager.js                  863a2b0f681791d5d0e49f8cf2c74fb2b20234fe
loaders/modelLoader.js           94b99b8a794e5c6f12196669ced2350ec1a7ffef
loaders/textGenerator.js         157418db7149989c8f4971e4895d20c26bb89108
loaders/imageLoader.js           48d7b7a5ed9cccb8860b79d9f2228a370956048c
SceneManager.safety.test.js      a320fa9eea2dd80ba174b4c8460ada7cecd81edb
loaders/loaders.safety.test.js   b8807b1cbb4626de6eeec4e43caad0b21706d4c8
```

**Acceptance recommendation:** repair F1–F3 and the bounded F4 failure path, add the edge regressions above, rerun the Node20 safety/original-loader/engine suites, and independently review the fixes before marking L1 accepted. Keep L2 and later issue gates explicitly open.
