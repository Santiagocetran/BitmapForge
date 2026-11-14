# Independent re-audit — engine L1 F1–F4 fixes

## Verdict: accept the bounded F1–F4 correction; integration remains open

**No blocking finding remains from the original F1–F4 audit in the reviewed implementation.** The source-level ownership model now covers all decoded scenes, retained line/point consumers, separately owned bitmap backing, and unattached STL allocations. Independently executed tests and the real Chromium bitmap smoke pass. This accepts the bounded engine L1 prerequisite, not complete CO-R1/1a, #89, release readiness, or the concurrent UI changes.

Evidence recorded **2026-11-13 22:59 UTC**, branch `gloin/ui-output-improvements`, HEAD/base `298bdec17dcd1603add549118a743e5cd494ba08`. Implementation changes are working-tree changes, not a new committed revision.

## Scope and method

Read `AGENTS.md`, the original `engine-l1-implementation-audit.md`, completed `engine-l1-audit-fixes.md`, L1 in `creative-output-acceptance.md`, and relevant authoritative source-transaction contract in `creative-output.md`. Checked that `CODEX.md` and the four referenced COLLAB bootstrap files are absent.

Inspected actual current implementation and baseline diffs for:

- `src/engine/SceneManager.js`
- `src/engine/loaders/modelLoader.js`
- `src/engine/loaders/imageLoader.js`
- `src/engine/loaders/textGenerator.js`

Read the **untracked** `SceneManager.safety.test.js`, `loaders/loaders.safety.test.js`, and `loaders/bitmap.browser-smoke.mjs` explicitly; ordinary `git diff` does not include them. Read original `modelLoader.test.js` and installed Three.js `ImageBitmapLoader.js`/`Cache.js` to check assumptions against the actual dependency. Did not review or edit concurrently owned UI, CI, export, SDK, or history files. The implementer's reported results were leads; the executions below are this review's independent observations.

## Finding dispositions

### F1 — resolved: complete decoded-scene ownership

`modelLoader.js:77–98` captures the default scene and every entry of `gltf.scenes` into one source ledger **before** white-material replacement. Identity sets deduplicate repeated scenes and shared geometry/material/texture instances. Only resources not reachable from the retained scene are released early (`94–95`). The same ledger is saved against the retained group in a WeakMap and reused by final disposal (`175–178`); catch cleanup uses the ledger even when normalization fails (`99–103`). Secondary scenes are not published or granted independent lifetimes.

`loaders.safety.test.js:208–325` exercises distinct and shared resources across scenes, repeated scene references, successful preparation, normalization rejection, completion after shape replacement, and completion after manager disposal. It asserts actual attached identity, secondary cleanup, and exactly-once release. The native smoke additionally decodes a genuine two-scene glTF, though its secondary scene shares resources; distinct-secondary-resource event counts are established by the faithful decoder fixture, not by that smoke alone.

### F2 — resolved: retained line/point reachability and one disposal ledger

`collectResources` (`116–129`) traverses all objects rather than only meshes, including material arrays and direct texture properties. White replacement changes meshes only; the retained-resource set therefore protects original materials or texture wrappers still used by lines/points. `releaseExcept` (`147–170`) carries a single identity-based disposed set through early release, failure, and final release. This fixes both premature disposal and the old second disposal caused by starting a fresh cleanup set.

The parameterized shared-material/distinct-material cases (`254–276`) retain both line and point consumers, assert no early geometry/material/map disposal, then assert one final disposal of all original and new white materials. Repeated map slots/material array entries are covered by the existing shared-resource fixture (`115–157`). Failure and stale manager paths reuse the multi-scene fixture and count releases.

### F3 — resolved within the documented private-loader/cache ownership rule

Bitmap identity is separate from Texture identity (`131–170`). Only decoded glTF backing recognized as native `ImageBitmap` is claimed, and only with cache disabled at decode start and completion (`78–88`, `139–145`). Final release computes live image identities across retained Texture wrappers, so disposing one discarded wrapper does not close backing needed by another. Generic caller-provided groups do not automatically grant bitmap ownership.

At every release, an actual cache entry makes an owned bitmap permanently borrowed by removing it from the owned set (`161–165`), including when caching has since been disabled. Cache eviction cannot undo an already observed borrow. This matches the installed Three.js cache representation: `ImageBitmapLoader` stores the completed bitmap itself in Cache before invoking its success callback (`ImageBitmapLoader.js:176–184`); `Cache.files` remains available when `Cache.enabled` is false.

Fixture coverage (`278–375`) includes two wrappers sharing one bitmap, immediate discarded-map closure, retained backing, failure/stale/disposal cleanup, cache enabled at start/completion, bitmap cached before release, observed cache borrowing followed by eviction, and caller-owned bitmap exclusion. The fixture's bitmap class is a test double; the independent native-browser result below supplies the actual native detachment evidence. Cache-borrowing cases are not native-browser tests.

### F4 — resolved: exceptional STL construction ownership

Decoded geometry is registered immediately (`64`) and a successfully cloned material is registered before `new THREE.Mesh`/attachment (`66–69`). Cleanup no longer depends on the mesh having reached the group. Parameterized clone/mesh-construction failures (`377–405`) count geometry disposal, successfully allocated material disposal, one URL revocation, successful retry, and repeated-handle disposal. The normals-failure regression also passes. The mock throws before the real Mesh constructor; it verifies the intended pre-attachment failure boundary rather than claiming native allocation-failure measurement.

## L1 generation safety retained

`SceneManager.js:116–183` continues to use one monotonically increasing generation across model/text/image and synchronous shape requests. Stale success disposes its source; stale finally cannot clear a newer request's loading state. A failed shape invalidates older async work without replacing the previous source. Preparation/rejection preserves attached scene identity, and disposal invalidates pending work. The safety suite also exercises interleaved formats, late rejection, retained callbacks after disposal, publication failure, and subsequent retry. No playback-policy expansion was introduced.

## Independently observed execution

All commands ran from this checkout through:

```sh
npx --yes --package=node@20 -c '<command>'
```

Observed Node **v20.20.2**, Vitest **4.0.18**. Every verification command below exited **0**.

| Command inside Node20 shell | Observed result |
| --- | --- |
| `node node_modules/vitest/vitest.mjs run src/engine/loaders/modelLoader.test.js src/engine/SceneManager.safety.test.js src/engine/loaders/loaders.safety.test.js --maxWorkers=1` | 3 files / 55 tests passed: 5 original loader, 25 manager safety, 25 loader safety |
| Same command plus `--sequence.shuffle --sequence.seed=8903` | 3 files / 55 tests passed; shuffled order was original loader, loader safety, manager safety |
| `node node_modules/vitest/vitest.mjs run src/engine` | 22 files / 324 tests passed; no failed or skipped tests reported |
| `node src/engine/loaders/bitmap.browser-smoke.mjs` | Chromium 147.0.7727.15; both native cases passed |
| `node node_modules/eslint/bin/eslint.js <seven reviewed paths>` | Passed |
| `node node_modules/prettier/bin/prettier.cjs --check <seven reviewed paths>` | All matched files use Prettier style |

The seven lint/format paths are the four implementation files and three new test/smoke files listed above. `git diff --check -- src/engine` also passed. These results do not certify unrelated changes in the shared checkout.

### Native bitmap evidence

The standalone script uses real GLTFLoader, File/Blob URLs, embedded binary geometry, canvas-generated PNG data, native `createImageBitmap`, and native `ImageBitmap.close` wrapped only to count invocations. It starts and closes its own Vite server and Chromium. Independent returned values:

| Case | Native bitmaps decoded | Closes before final release | Width before final release | Final closes | Final width | Source URL revocations |
| --- | --- | --- | --- | --- | --- | --- |
| Mesh-only white conversion | 1 | 1 | 0 | 1 | 0 | 1 |
| Retained textured points | 1 | 0 | 2 | 1 | 0 | 1 |

Repeated source-handle disposal does not add closes/revocations. This demonstrates native backing detachment and delayed closure while retained, **not** GPU/heap-memory measurement, rendered-pixel correctness, or browser rendering-policy correctness. No browser-tool simulation or fabricated decoder response was substituted for this run.

## Actionable follow-ups and remaining limits

No additional application-code change is required to close the original F1–F4 findings under the stated L1 ownership boundary. Preserve the following integration gates:

1. **Retain the evidence and new test files deliberately.** `git check-ignore docs/plans/engine-l1-fixes-independent-audit.md` confirms this audit is locally ignored. The three new safety/smoke files are untracked. Neither ignored documents nor untracked tests are guaranteed to accompany a later commit/package. The integrating owner must include the intended artifacts explicitly; this review does not stage or commit them.
2. **Run the native smoke explicitly in integration.** It is standalone, not part of root Vitest, and a green engine suite alone does not run it. Its Vite setup uses the default dependency-cache directory rather than a unique smoke cache; isolate that directory if running concurrent Vite jobs. No cache collision occurred in this execution. Native cache-enabled/borrowed-bitmap coverage would be a useful additional browser check; current borrow/eviction proof is source inspection plus controlled fixtures.
3. **Keep the ownership boundary explicit.** Sharing inside one decoded result is handled. Independent external borrowers, arbitrary mutation of private decoded textures, or an enable→borrow→evict→disable cache cycle wholly between observations require an application ownership protocol; this implementation does not discover them. Cache-enabled decoding conservatively borrows all bitmap backing, so source disposal deliberately makes no closure promise for those allocations.
4. **Do not infer exception-proof cleanup or universal rollback.** Disposal listeners/native close/URL revocation are assumed nonthrowing. Tests do not establish aggregated cleanup after throwing listeners, or full effect-state rollback after partially mutating publication. Decoder-internal allocations never returned on decoder rejection are not observable to this ledger. The F4 exceptional-construction result is specifically STL, not a blanket constructor-failure guarantee for every loader.
5. **Keep phase and integration gates open.** L2 requested playback/context/capture concurrency and cleanup remain deferred; live paused context restore still resumes unconditionally (`SceneManager.js:101–104`). SDK visibility/reduced-motion/reconnect, generated React/Web Component lifecycle, CSS still output, application source/settings/history transactions and PreviewCanvas consumption remain separate work. Root/shared-tree checks, package/CLI/export/decode/build/generated-browser integration and release-safety readback were not performed by this re-audit.

## Reviewed content identity

Independently computed `git hash-object` values match the completed handoff:

```text
SceneManager.js                       863a2b0f681791d5d0e49f8cf2c74fb2b20234fe
loaders/modelLoader.js                b4508dd27b617f4123206608d9bb55fa20a149e8
loaders/imageLoader.js                48d7b7a5ed9cccb8860b79d9f2228a370956048c
loaders/textGenerator.js              157418db7149989c8f4971e4895d20c26bb89108
SceneManager.safety.test.js           83586396a40cdab977737a279593610b095dc5e2
loaders/loaders.safety.test.js         3d66ea716bc707f4333fda197f62962b60f3f189
loaders/bitmap.browser-smoke.mjs       72dc2148e7d1eba9009534fa3e312f01b3d1d344
```

Only authored repository file: this audit. No application/test implementation edits, reset, stash, commit, push, deployment, or remote write. No execution blocker was encountered. **Recommendation: accept this bounded L1 engine correction and proceed to separate integration verification, without closing later lifecycle/product gates.**
