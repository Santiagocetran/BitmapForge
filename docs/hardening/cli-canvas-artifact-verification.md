# CLI canvas artifact verification

## Outcome — P01–P10 artifact gate PASS, not whole-hardening clearance

One authorized post-fix attempt on 2026-11-15 UTC: fresh CLI-only build exited 0; unchanged dedicated render suite exited 0, **41 passed / 2 skipped**. All **14 actual outputs** passed independent decoding, structural/timing metadata, sampled occupancy/color/luma and existential temporal-change contracts. All ten real CLI subprocess/ordinary-cleanup tests and all four batch shape/model decoded-hash distinction tests passed. The two skipped tests are optional synthetic decoder self-tests, not missing P outputs.

This is execution evidence for the already independently accepted source/unit repair, not an independent complete-P review or release approval. F01–F11 and legacy P11 were not rerun; historical failures remain historical failures. Palette approval, other hardening work and release remain separate gates.

## Provenance and exact execution

Repository: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`, branch `gloin/release-hardening`, HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01` plus incoming dirty changes. No production/test/fixture/dependency changes were made during this verification.

- Build/runner evidence: `/home/agent/.hermes/profiles/gloin/cache/scratch/cli-canvas-artifact-20261115T153808Z/`
- New actual artifacts and decoder evidence: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-cli-stage2-render-zq6DW5/`
- External orchestration: sibling `cli-canvas-artifact-run.py`; aggregation/presentation: sibling `cli-canvas-artifact-summarize.py`.
- Runtime: explicit Node v24.22.3 and npm 11.21.2; installed Vite 7.3.7, Puppeteer 22.15.0 and existing Chrome127. No install or upgrade. Browser executable identity is in `browser-identity.json`.

```sh
# Repository root, Node bin directory prepended to inherited PATH:
/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node /home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/npm/bin/npm-cli.js run build --workspace=@bitmapforge/cli

# packages/cli; inherited profile TMPDIR retained:
INTEGRATION=1 CLI_BROWSER_SLOT=stage2 CLI_DECODER_TESTS= /home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node ../../node_modules/vitest/vitest.mjs run src/__tests__/cli-render.integration.test.js --maxWorkers=1 --no-file-parallelism --reporter=verbose
```

The owned CLI build entry exports engine SceneManager and embed projectParser; no root/palette build or test was invoked. Fresh build transformed 54 modules and generated the eight CLI dist files. Harness is served directly from source, not compiled into headless.js. Source inventory before/after is identical; complete build inventory and byte lengths are retained. Important SHA-256 identities:

| Target                                                      | SHA-256                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `packages/cli/src/harness.js`                               | `711f8a4ba7704f99a258f73ded496468ef58efdaa6456ad9adcfa9154c8f9671` |
| `packages/cli/src/index.js`                                 | `16bb5293c9fdcfa438623e7912426ecf821c833737a2c9f72af7acc33ee78017` |
| `packages/cli/src/server.js`                                | `14f7dfe9214f2b639ed418450e8baceabd4a7a63237e89c3c5d4d091776b008c` |
| `packages/cli/src/__tests__/cli-render.integration.test.js` | `513934ed953b3371d7207874ef5605bad5146d6cfb0a8d38afd9779e68624ae8` |
| `packages/cli/src/__tests__/cli-stage2-evidence.js`         | `94c65b01355ea0df04fadddf49dcfcb49542a9a172f8b53cd8d085ff3dd7a701` |
| `package-lock.json`                                         | `bac330dd2d654f5ee0d08a2d0e97ba68829c4568c1df998372f34e5ab8b399ca` |
| `packages/cli/dist/headless.js`                             | `9681565ac5e39d8f6e36a8f4475c554959f67baf48f2064259117bb402661a46` |

## Exact fourteen-output ledger

Occupancy and luma columns are minima over beginning/middle/end samples; change is the maximum qualifying sampled-pair fraction, preserving the existential contract. Values below are rounded for display; `ledger.json` and per-output `pixels.json` retain full precision. All sampled opacity fractions are 1.0, and every sample passes meaningful-color separation. Occupancy is the frozen distance-from-#101820 statistic, not a segmentation estimate of object area.

| Case | Output relative to case  | Pixels  | Frames | Duration ms | Min occupancy | Min luma SD | Max changed fraction | Verdict |
| ---- | ------------------------ | ------- | ------ | ----------- | ------------- | ----------- | -------------------- | ------- |
| P01  | `shape-v2.apng`          | 400×400 | 25     | 2075.000    | 1.000000      | 39.927708   | 0.025350             | PASS    |
| P02  | `nested path/model.apng` | 160×120 | 21     | 2100.000    | 1.000000      | 17.568541   | 0.035417             | PASS    |
| P03  | `nested path/model.webm` | 160×120 | 21     | 2353.050    | 1.000000      | 17.578968   | 0.035417             | PASS    |
| P04  | `shape.webm`             | 160×120 | 25     | 2381.250    | 1.000000      | 34.834345   | 0.022865             | PASS    |
| P05  | `odd.apng`               | 161×121 | 25     | 2075.000    | 0.985576      | 18.555497   | 0.031826             | PASS    |
| P06  | `odd.webm`               | 162×122 | 25     | 2416.667    | 0.985681      | 18.035156   | 0.035823             | PASS    |
| P07  | `batch path/a.apng`      | 160×120 | 21     | 2100.000    | 1.000000      | 34.515190   | 0.025417             | PASS    |
| P07  | `batch path/b.apng`      | 160×120 | 21     | 2100.000    | 1.000000      | 17.568541   | 0.035417             | PASS    |
| P08  | `batch path/a.webm`      | 160×120 | 21     | 2385.600    | 1.000000      | 34.772197   | 0.025313             | PASS    |
| P08  | `batch path/b.webm`      | 160×120 | 21     | 2319.450    | 1.000000      | 17.578968   | 0.035417             | PASS    |
| P09  | `input/out/a.apng`       | 160×120 | 25     | 2075.000    | 1.000000      | 34.775353   | 0.023125             | PASS    |
| P09  | `input/out/b.apng`       | 160×120 | 25     | 2075.000    | 1.000000      | 17.568541   | 0.037083             | PASS    |
| P10  | `input/out/a.webm`       | 160×120 | 25     | 2418.750    | 1.000000      | 34.834345   | 0.022865             | PASS    |
| P10  | `input/out/b.webm`       | 160×120 | 25     | 2379.167    | 1.000000      | 17.578968   | 0.036771             | PASS    |

All actual capture schedules retain 2094ms loop duration, 21 samples at fps10 or 25 at fps12. APNG CRC/chunks/compositing/delay/count checks pass, including odd 161×121. WebM codec, even dimensions (odd input becomes 162×122), monotonic timestamps, duration and cadence pass unchanged tolerances. WebM final intervals are estimated where packet duration is absent, as recorded by the original checker. `structure.json` and `ffprobe.json` contain full metadata; `ffmpeg.process.json` and `ffprobe.process.json` retain decoder commands, stderr and real settlement.

## Exact output hashes

SHA-256, artifact followed by independently decoded full RGBA stream:

| Case/output                  | Artifact SHA-256                                                   | Decoded RGBA SHA-256                                               |
| ---------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| P01 `shape-v2.apng`          | `4b92658f8731b29730ed51bd2d015f6b8d5a4f45e8adb6dd4a0c979ca24c4735` | `d104d19362898cef2c19aa74a560a334a158ba453ef5b4dba97c0e74215735ff` |
| P02 `nested path/model.apng` | `5de9832515263ccf1a5f9cdc799e297069772e74ca163a72c503c2005eac2b35` | `02b08457d047bcef91841e31a98c37a55d02b3aa58e73cd6d6facf7db00932b4` |
| P03 `nested path/model.webm` | `9998807df9caaeaee1a0ddabf821a00dda6823964ec5fe7f3a5736fa6c79e885` | `c0af3aa3008b7639806701ac6544b2372f893ecf9c45ebdce8cccfaba8cb3e91` |
| P04 `shape.webm`             | `a8ecb74ceea7069c5ecaac555f3df5a5541e7ea783ff4fa0091ea3c25349f8cf` | `27cccd55c0c36c4954113fd394752d563868e647e040810b26e517296a210414` |
| P05 `odd.apng`               | `e54782625eaed71029dfdfdb9e41e088ec1f7d840a2efb94ca7beaca57ea8e8c` | `4ae766c8c4a6c5a31c390e4ae369176dec44abd05ec4caa993ef94cba0fbd5b6` |
| P06 `odd.webm`               | `02dd2ba0e3d051bf71b8691413befa38f1ae078bccd758c5acb905d2b5f63e07` | `aa4f9b9368e8fb243ed91b6524455cd6e784a6396dc9dfbe1f8c167248458564` |
| P07 `batch path/a.apng`      | `29c36872e0ad8a5f354cc61c79c6faefcd8649407393dd5848a486dfde2c9e77` | `39ab6d1c6b5a55335b09a8100d72be4fdc839388ed4b80da06f1e46c339aaab9` |
| P07 `batch path/b.apng`      | `5de9832515263ccf1a5f9cdc799e297069772e74ca163a72c503c2005eac2b35` | `02b08457d047bcef91841e31a98c37a55d02b3aa58e73cd6d6facf7db00932b4` |
| P08 `batch path/a.webm`      | `8461af1ddf2f58ef11da40d5e3a6de56b7536c87b908a2cb51345c7f079e3903` | `39826f672128ea64cc2633b6d7e68cc326cceccb61e8cfde1577095dfc1b99cf` |
| P08 `batch path/b.webm`      | `1605c26aa2031a58d0a63a9e7d11ebaba674d2d50838782a0a8d5b55d19830c0` | `c0af3aa3008b7639806701ac6544b2372f893ecf9c45ebdce8cccfaba8cb3e91` |
| P09 `input/out/a.apng`       | `7ef796b3143b338cbfd0e60cac129905acb67ea9eca0fd6d8f317465661426c7` | `ac67eca1200d2d37bca7c87463beaca927a5ba4d8c88975fe44772f53e63f32f` |
| P09 `input/out/b.apng`       | `cb4e10caaeeada64791a5232aad859289f1b8c5065ee914777c60448d4b65ae1` | `c5f4037fcf4863e1017ad64f336398cf89b5f3d121e0c46cd52e03e522fe8adb` |
| P10 `input/out/a.webm`       | `89ea055ce684d040fe174edde3c15556bc7356063b2d16c289dc056ba806c8f9` | `27cccd55c0c36c4954113fd394752d563868e647e040810b26e517296a210414` |
| P10 `input/out/b.webm`       | `d352ca7b6623d7f386e879a833b0ea8e2455112b70e486b43fadc6db208d950a` | `6dcab6a84baedc0860f459fcc7b58cdb0fa78e61000c920f4886da22084a7fb2` |

Hashes were recomputed from all fourteen artifact/raw files after execution and matched each retained pixel report. `artifact-evidence-inventory.json` inventories every new run file; `source-before.json`, `source-after.json`, `build-before.json` and `build-after.json` distinguish exact source and built identity.

## Shutdown, stderr, and lane release

All ten CLI commands exited 0 with real close observed, null failure/signal, no containment errors, no emergency reap and no surviving owned group. The original observer retained browser/descendant PIDs, ports, server-close/browser-close and ended tracks/inactive recorders. Original per-case `cleanup.json` passed; subsequent `cleanup-readback.json` confirms observed PIDs absent and owned ports closed. Suite finally released its exclusive stage2 lock; lock absence was read back. The outer real runner also exited normally. **Browser lane released.** No sampler was launched or modified.

Runner stderr is empty. Real CLI stderr is retained verbatim in every `process.json`, including browser favicon404 diagnostics and batch Processing messages. These were not erased or treated as render failures. No retries, threshold/fixture/contract changes, flags, CI-policy changes, or manufactured no-sandbox setting were used; the original helper still supplies its original child CI=1 and short owned TMPDIR behavior.

Historical `bitmapforge-cli-stage2-render-gUdVrf/` and prior failed evidence were not written or reclassified. The sampler controller-capacity failure remains unrelated historical diagnostic evidence, not a browser-bug attribution.

## Actual representative frames

Lossless PNG presentation copies were extracted directly from retained independent RGBA decodes, without another render or altered pixels:

- `/home/agent/.hermes/profiles/gloin/cache/scratch/cli-canvas-artifact-20261115T153808Z/frames/P01-frame-0.png`, `P01-frame-12.png`, `P01-frame-24.png`: 400×400 shape APNG beginning/middle/end.
- `/home/agent/.hermes/profiles/gloin/cache/scratch/cli-canvas-artifact-20261115T153808Z/frames/P03-frame-0.png`, `P03-frame-10.png`, `P03-frame-20.png`: 160×120 model WebM beginning/middle/end.

`frame-inventory.json` pins presentation bytes. Inspected middle frames show a centered pale-gold quadrilateral for the shape and small pale-gold triangular model silhouette against dark gray; these are genuine output frames, not mockups. Temporal acceptance comes from numeric sampled-pair evidence, not visual inference from a single image.

No new artifact blocker was observed. Remaining disposition: independent review of this fresh evidence and separately owned hardening/release gates; this report does not clear those gates or publish anything.
