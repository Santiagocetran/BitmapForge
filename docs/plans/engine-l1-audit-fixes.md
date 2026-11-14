# CO-3 L1 audit fixes — implementation handoff

Status: F1–F4 addressed and locally verified; **pending independent re-audit**, not release approval. Evidence recorded 2026-11-13, branch `gloin/ui-output-improvements`, HEAD/base `298bdec17dcd1603add549118a743e5cd494ba08`.

## Scope and interrupted-work review

Read `AGENTS.md`, authoritative CO-R1/CO-R3 in `creative-output.md`, L1 in `creative-output-acceptance.md`, `engine-l1-implementation-audit.md`, the interrupted `deleg_d37aa337/task-0.log`, and checkpoint `LATE-ENGINE-RESULT.md`. COLLAB bootstrap files are absent. Reviewed actual engine code/diffs rather than treating the interrupted worker's partial changes as accepted.

The partial model-loader change already introduced the complete-resource ledger, retained-resource reachability check, bitmap ownership set, and explicit STL allocation registration. It had **no F1–F4 regression tests or verification**. First execution reproduced an additional original-loader-test failure: reading `THREE.Cache` before the format branch escaped the try/catch and hit the global Three mock's missing export. Cache discovery now occurs only inside the glTF branch/try. During completion review, fixed a second edge: a bitmap observed in the global cache must become permanently borrowed for this source, even after cache eviction; checking cache only at the instant of close was insufficient.

This continuation changes `loaders/modelLoader.js` and the two safety suites, adds a standalone native-browser smoke, and authors this document. Existing L1 `SceneManager.js`, `imageLoader.js`, and `textGenerator.js` changes were reviewed/verified but left byte-identical to the supplied partial tree. No UI, palette, global test setup, config, workflow, SDK, capture, or history files were edited. No reset/stash/commit/push/deployment/remote writes.

## Finding dispositions

| Finding                                                                | Implementation disposition                                                                                                                                                                                                                                                                                                       | Regression evidence                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1: non-default decoded glTF scenes leak                               | Capture resources from the default scene **and all `gltf.scenes`** before replacement. One identity-deduplicated ledger survives preparation through final disposal. After white conversion, release only resources not reachable from the retained default scene. Secondary scene graphs themselves remain unpublished.         | Faithful multi-scene decoder fixture with distinct geometry/materials plus resources shared across scenes, duplicate scene references, retained line/point consumers; success, normalization failure, manager stale completion after shape replacement, and completion after manager disposal.                                                                                         |
| F2: replaced mesh material cleanup harms retained line/point resources | Compute retained reachability across every object, not only meshes. Keep a shared original material or map alive while line/point objects need it. Track already-disposed identities in the same ledger so early and final cleanup cannot double-dispose.                                                                        | Shared whole material and distinct materials sharing map/bitmap backing; original material arrays/repeated texture slots; no early disposal of retained resources, exactly one final disposal. Failure and stale cases assert per-resource events and actual attached group identity.                                                                                                  |
| F3: owned native bitmap backing never closes                           | Track owned `ImageBitmap` identities separately from Texture/Source identities. Close discarded backing once; keep it alive while any retained Texture wrapper needs it; close on final source release. Never infer bitmap ownership from a generic caller-supplied group. Observed cached backing becomes permanently borrowed. | Two Texture wrappers sharing one bitmap; discarded maps close immediately, retained line/point wrapper delays close, failure/stale/disposal close once. Cache-enabled-at-start, enabled-at-completion, cached-at-release, cache-evicted-after-observation, and caller-owned bitmap cases do not close borrowed backing. Real Chromium/GLTFLoader/native ImageBitmap smoke also passes. |
| F4: unattached STL geometry leaks on clone/construction failure        | Register decoded geometry immediately; register cloned material before constructing/attaching a mesh. The outer catch releases ledger allocations, independent of group traversal.                                                                                                                                               | Injected material-clone and mesh-construction failures each revoke the URL once and release all successfully created allocations once; subsequent STL retry succeeds and repeated handle disposal is idempotent. Existing normals-failure regression also passes.                                                                                                                      |

Additional bounded L1 tests cover model/text/image pending → synchronous shape, failed shape preserving the old attached scene while invalidating older async work, and failed publication followed by successful retry. No playback semantics were changed.

## Ownership rule and limits

- A successful `loadModel` transfers one private decoded source lifetime to its returned group and URL; `prepareSource` transfers that lifetime to the manager's idempotent handle. The manager neither publishes stale groups nor grants secondary glTF scenes independent consumer lifetimes.
- The private, default `GLTFLoader` owns uncached decoded bitmap backing when `THREE.Cache.enabled` is false at decode start and completion. A cache-enabled load is conservatively borrowed and never claims closure ownership. Every release also checks actual cache entries; observing an owned bitmap there permanently relinquishes closure ownership, even if the entry is later removed. Cached bitmap lifetime belongs to the cache/application, not this source handle.
- Sharing geometry/material/texture/bitmap identities **within one decoded result** is supported, including across scenes and retained renderable types. Independently returned decoded results do not share ownership unless the loader's cache lends their bitmap backing, in which case it is borrowed. Arbitrary external borrowing of private decoded data, or unobservable enable→borrow→evict→disable cache changes entirely between our observations, requires an explicit application ownership protocol and is not promised here. Do not toggle global caching during decode to manufacture such sharing.
- Generic groups passed to `prepareSource` own their disposable geometry/material/texture objects, but not arbitrary external bitmap backing. HTMLImageElement/canvas image uploads are not ImageBitmap-owned sources.
- Tests assume normal nonthrowing disposal listeners and native `close`/URL revocation. Exception aggregation for throwing disposal listeners, complete effect-state rollback after partially mutating publication, generalized resource refcounts for external consumers, and editor-history ownership are not claimed.

## Exact verification

Executed from the repository with Node **v20.20.2** through `npx --yes --package=node@20 -c '…'`; Vitest **4.0.18**. Final source/test verification after the last implementation edit:

```sh
node node_modules/vitest/vitest.mjs run src/engine/loaders/modelLoader.test.js src/engine/SceneManager.safety.test.js src/engine/loaders/loaders.safety.test.js --maxWorkers=1
# 3 files / 55 tests passed (25 manager safety, 25 loader safety, 5 original loader).

node node_modules/vitest/vitest.mjs run src/engine/loaders/modelLoader.test.js src/engine/SceneManager.safety.test.js src/engine/loaders/loaders.safety.test.js --maxWorkers=1 --sequence.shuffle --sequence.seed=8903
# 3 files / 55 tests passed.

node node_modules/vitest/vitest.mjs run src/engine
# 22 files / 324 tests passed. No failed/skipped tests reported.

node src/engine/loaders/bitmap.browser-smoke.mjs
# Chromium 147.0.7727.15: both native-bitmap cases passed.
```

The standalone smoke starts/stops its own isolated Vite server and Chromium, uses real Blob/File glTF decoding with embedded geometry and canvas-generated PNG, and exercises both mesh-only white conversion and a retained textured point consumer with a second decoded scene. It uses native `createImageBitmap` and native `ImageBitmap.close` with counted wrappers, not fake bitmap data. Observed results:

| Native decode case               | Decoded bitmaps | Close count before final disposal | Width before final disposal | Final close count | Final width | Owned URL revocations |
| -------------------------------- | --------------- | --------------------------------- | --------------------------- | ----------------- | ----------- | --------------------- |
| Mesh-only maps discarded         | 1               | 1                                 | 0                           | 1                 | 0           | 1                     |
| Retained textured point consumer | 1               | 0                                 | 2                           | 1                 | 0           | 1                     |

This establishes native backing detachment and event counts, **not** measured heap/GPU-memory reclamation, rendered pixel parity, production packaging, or recurring-work policy correctness. The smoke is intentionally standalone, not included in root Vitest's globally mocked DOM; no CI/config change was made.

ESLint and Prettier check passed for exactly these seven engine files, with exit 0:

```text
src/engine/SceneManager.js
src/engine/loaders/modelLoader.js
src/engine/loaders/imageLoader.js
src/engine/loaders/textGenerator.js
src/engine/SceneManager.safety.test.js
src/engine/loaders/loaders.safety.test.js
src/engine/loaders/bitmap.browser-smoke.mjs
```

Commands: `node node_modules/eslint/bin/eslint.js <seven paths>` and `node node_modules/prettier/bin/prettier.cjs --check <seven paths>`. `git diff --check -- src/engine` passed. Prettier check for this document is recorded separately at handoff. All six pre-existing reviewed engine files were included; no broad lint fixing was performed.

## Re-audit identity

Final `git hash-object` values, before document-only edits:

```text
SceneManager.js                       863a2b0f681791d5d0e49f8cf2c74fb2b20234fe
loaders/modelLoader.js                b4508dd27b617f4123206608d9bb55fa20a149e8
loaders/imageLoader.js                48d7b7a5ed9cccb8860b79d9f2228a370956048c
loaders/textGenerator.js              157418db7149989c8f4971e4895d20c26bb89108
SceneManager.safety.test.js           83586396a40cdab977737a279593610b095dc5e2
loaders/loaders.safety.test.js         3d66ea716bc707f4333fda197f62962b60f3f189
loaders/bitmap.browser-smoke.mjs       72dc2148e7d1eba9009534fa3e312f01b3d1d344
```

Both safety tests and the smoke are untracked; ordinary `git diff` omits them. `git check-ignore docs/plans/engine-l1-audit-fixes.md` confirms this document is locally ignored, like the earlier plan/audit artifacts; retain it deliberately for review/publication without treating clean status as proof of tracking.

## Remaining gates — explicitly not completed

Independent implementation re-audit is still required. L2 requested playback/context/capture tokens/concurrency and CLI capture cleanup remain deferred; a live paused manager's context restore still resumes unconditionally. L3 SDK visibility/reduced-motion/reconnection, L4 generated integrations/CSS, whole-project history/PreviewCanvas atomic consumption, and complete CO-R1/1a or #89 acceptance are not delivered by this engine slice. Full exact shared-tree root/SDK/CLI/export/decode/build/generated-browser and release-safety verification belong to integration; concurrent workers' changes were neither edited nor certified here. No release or deployment approval follows from these local results.
