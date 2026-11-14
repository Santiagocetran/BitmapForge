# Independent audit: Embed renderer-settlement readiness

## Verdict

**ACCEPT — bounded harness repair only.** No actionable defect found in the repair or its three isolated / complete ten-case built evidence. This is not SDK repair, broad redesign acceptance, performance certification or release approval.

Reviewed shared checkout `gloin/editor-redesign`, HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`. This audit owns only this document; no app, test, runtime, configuration, build, commit, push or deployment change was made.

## Lifecycle and assertion soundness

Independent source inspection confirms the cause, not merely the handoff's interpretation:

- `SceneManager._commitSource` starts `fadeIn` (line 138). `loadModel` resolves after source publication, not after that animation ends.
- `BitmapForgeElement._load` awaits the model, calls `setRenderMode`, updates options, then clears `_loading` (lines 92, 108–115).
- `SceneManager.setRenderMode` always creates and hands a renderer to `effect.setRenderer` (275–279). During a fade, `BitmapEffect.setRenderer` queues it (76–81).
- The normal render loop calls `renderBitmap`; only after the fade completes does it install the queued renderer (130–133). `_swapRenderer` synchronously removes/disposes the previous canvas, initializes/appends its replacement, then clears the pending field (84–96).

Consequently load-ready alone can expose a correctly sized, connected canvas already scheduled for retirement. The retained read-only diagnostic actually observed load-ready plus pending renderer, reproduced screenshot detachment, and recorded canvas 1 removal / canvas 2 publication. Canvas 2 remained current into the next animation phase. No runtime error was recorded. Inspected `diagnose.mjs`: diagnostic IDs, observation and state reads do not drive rendering or alter runtime state.

The repaired poll observes loading, actual object presence, pending renderer, connected shadow canvas identity and dimensions together in one browser evaluation. Strict `effect?._pendingRenderer === null` fails closed for absent/renamed state; an undefined effect cannot accidentally satisfy it. A disposed effect's null pending field alone cannot pass object/current-canvas requirements. `bitmapCanvas` returns the active renderer's canvas. No canvas is forged or substituted. Meaningful real screenshot assertions still run afterward; private state is **not** used as a substitute for visible output.

This readonly private-field dependency is acceptable for this internal regression harness and explicitly documented here. It is not a public SDK readiness API and must be revisited if the effect's lifecycle/field names change. The observation is not a universal guarantee against later user-driven `src`/`render-mode` changes; this generated fixture makes no such changes. Normal animation does not independently queue another renderer. There is no intervening asynchronous publication inside `_swapRenderer`.

The worker patch adds only the settlement predicate and diagnostics within the Embed case. Existing 18000ms meaningful-frame budget, real screenshot, 5-color / 1% occupancy floors, initial geometry poll and container-only resize remain. No catch/retry of screenshot errors, forced render, manager/SDK mutation, arbitrary sleep, retry-count increase or budget increase was introduced.

## Independently executed evidence checks

Evidence root: `../bf-p3-evidence/embed-readiness/`. I ran independent Python assertions against the underlying reports, attachments, ZIPs, source objects and manifests, rather than rerunning the worker's manifest-writing aggregator. All checks exited 0.

| Evidence                 | Verified result | Embed duration | Settlement observations                  |
| ------------------------ | --------------- | -------------- | ---------------------------------------- |
| `isolated-1/report.json` | 1 passed        | 34627ms        | false → true; resized true               |
| `isolated-2/report.json` | 1 passed        | 31971ms        | false, false, false → true; resized true |
| `isolated-3/report.json` | 1 passed        | 29646ms        | false, false → true; resized true        |
| `full/report.json`       | 10 passed       | 26873ms        | false → true; resized true               |

Programmatic enumeration agrees with report totals. Every test has exactly one passed result, retry 0; zero skipped, unexpected or flaky tests. All four Embed attachments have empty runtime errors and request failures. Readiness is demonstrably nonvacuous: every run observes pending rendering after load/object completion before observing settlement.

I separately decoded all eight retained PNG screenshots under Node v20.20.2 using the actual pixel analyzer. Every recalculated metric exactly equals its diagnostic attachment and passes unchanged meaningful-content floors. Full-run initial output is 600×600, 50 colors, occupancy 0.1974, entropy 1.2707354561154076; resized output is 384×320, 48 colors, occupancy 0.178271484375, entropy 1.2055822460891188. I visually inspected both full-run PNGs: recognizable green dithered cube output, not an empty/default canvas. Source inspection confirms only host CSS width/height changes for resize; the downloaded SDK's ResizeObserver owns backing-size updates, with no test call to `setSize`.

For each run I checked archive CRC, exact archive SDK equality to immutable built SDK, extracted SDK/project equality to archive bytes, exact original cube bytes in payload, and HTML equality with only the documented Three.js dependency-URL substitution. The SDK and payload are not repaired. The Image-disabled explanation, disabled action and absence-of-download assertions remain in the passing case.

I verified all 35 served-file manifest entries against the actual immutable `../bf-p3-evidence/dist` bytes and both per-run hash snapshots. Preview configuration targets that isolated build (not the parent's rebuilding generic dist), has no HMR, disables server reuse, and uses port 5347 with separate evidence roots. It preserves 90000ms, retries 0, workers 1 and runner-owned `retain-on-failure` tracing. Runner gate records show exit 0 for lint, format, discovery and all four executions.

The original failure trace independently passes ZIP CRC, contains 395 trace events and retains the actual screenshot-detachment error. SHA256: `f3d114e4bc201385c0af8abc9e53936fec4ef39570f9326bfd8f7863c48d9538`. A retained failure trace is evidence of the original failure, not a passing-run trace claim; successful runs need not retain traces under this policy.

No additional browser rerun was necessary: the three isolated runs and complete ten-case run have independently verified source/build byte provenance, real decoded output and nonvacuous readiness transitions. Avoided adding software-rendering contention to the parent's concurrently active final gates. I did not rerun or claim completion of those parent gates.

## Exact byte scope

I actually applied `worker-only.patch` to an external temporary copy of `entry-spec.js`; resulting bytes exactly match the final repository spec. The complete prefix containing imports, shared helpers and all other case bodies is byte-identical to entry.

| Artifact                                                   | SHA256                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Entry spec                                                 | `935e5452a14dace0721b6c766ebf8494fcef55570e2e15be60a3c8a72d69ee26` |
| Final `test/e2e/redesign-artifacts.spec.js`                | `902b6a8bc758787ba5260761c2c692ad2d35f5d9d8b6f91d2e99680fff8dd3a6` |
| Worker-only patch                                          | `b5a708336ee525802dda57c7c7d0078dc34440266e8872985fef32b6228f5142` |
| Built / archived SDK                                       | `127c05aa02e87206b6ebbd18790d6e19443a29996f18e65e20436b5ec809401b` |
| Full-run real Embed archive                                | `b8eb37671c74c9c657877ef7daf28d88dbc7439c83e489089499275c90bb539b` |
| `full/served-identity.json` (35-file exact build identity) | `2f60c389c78a9a13431fff84aa1d986f8eb48307a2fe3dfcb77803f34c4ae571` |
| `built-full-before.json`                                   | `2ed39805d4eeda7d571d36ee4dc7e8accc4b05e48f5c5d0a1b95179ca084a515` |
| `built-full-after.json`                                    | `daed0e1716d44637d3d0a81096a765a9b17efd0cded6620bfcfb46019250c5a2` |

Independently compared current source bytes with Git HEAD **and** historical `8c6613279ed856e4933608e7e6c04e91dca2b331`; all three identities match for:

- `packages/embed/src/BitmapForgeElement.js`: `16213a6bcc358b6e716c9c470903d598da4b358969c896395d7e8f9592724a54`
- `src/engine/SceneManager.js`: `484b6feb9279cc7feb313f596c30e5ecb290d33035e4b5ec08d736fe785018f7`
- `src/engine/effects/BitmapEffect.js`: `4c25b5e2c20fd6541481ee7870fa68cf00865fe8aff6e244988acaae3fdf890c`
- `src/app/utils/embedExport.js`: `30b52d8cc9bc67a3d3befd2bdc2b2ec5149f0977a8ea7f6787db245cf2374684`

Each isolated window preserves 200/200 hashes. The full window preserves 199/200, with precisely the named parent A1 unit-test exception `src/app/utils/uiPropValidators.test.js`, from `43a1162f6e3b4c2d138749bce01fdf7519fc4d9184f08ce66c54ff56bdb9e71b` to `093a48b2951d7fc6bdd132e58d2b958de46570cf27fbaeabf196946b972e712c`. This is not an app/browser/runtime/dist change. All 35 built files remain identical. Do not describe the entire full-run source window as immutable or transfer this acceptance to a later parent build without its own provenance.

## Remaining boundary

No blocker within the delegated repair. Private-state coupling and the fixed model/DPR1 fixture are the explicit limitations. Broader UI/root/workspace acceptance, other input sources and DPRs, large-workload behavior, later builds and deployment remain parent-owned and are not cleared by this document.
