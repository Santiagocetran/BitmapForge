# Independent re-audit — revised CLI render measurement plan

## Verdict: ACCEPT — diagnostic measurements only

**ACCEPT the revised measurement design in §4, not a production source fix, completed diagnostic, or full-P certification.** The prior material R1–R3 objections are resolved as written. No further design revision is required before the bounded adapter handoff. Actual execution remains gated on the enumerated owner/checkpoint/environment/lane prerequisites and review of the external adapter's fidelity to this contract. This verdict does not grant the currently occupied browser lane or authorize a build, installation, new editor server, helper/test edit, source repair, remote action or release.

Reviewed plan SHA-256: `b1fd0e6ae2bd938480a983c06d03a6faa79de98b16cb25cae162896292a5f402`.

Prior audit SHA-256: `d4849f48afd9f9e1f21bcde90d31776d613d01bda78a303a1553ffec1c03aee8`; its REVISE applied to prior plan `98db0f086b8cb77a42ec4834c7275216a1395fb4f45ba44158c5a2d3ad87c9d4`. This supersedes that measurement-design REVISE only on the exact revised plan above. **Full P remains blocked, C remains unaccepted, and release remains uncleared. A separate evidence-backed repair-plan ACCEPT is mandatory before production edits.**

## Review scope and independent checks

Static-only review at repository `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`, branch `gloin/release-hardening`, HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01`, with shared uncommitted prerequisite work. Read AGENTS, web-product-development guidance, both diagnostic documents, accepted stage-1 repair audit/helper API, stage-2 handoff and newly delivered test-repair report; inspected actual CLI entry/server/harness, SceneManager, BitmapEffect, AnimationEngine seeking, and current checker/batch assertions. Governance-listed COLLAB files and checked Codex config paths are absent. Only this report was authored. No browser/server/build/install/test/decoder execution occurred; Python performed read-only hashing, JSON aggregation and capacity arithmetic.

Independent retained-evidence verification found **233/233** original manifest entries matching exact sizes and SHA-256, zero mismatches. Manifest hash remains `d9cf8ba3c0c76b22fcaaedb6ebf2c8a0f8c059f422247a7dacf26094c71375c0`. Aggregating the original ledger yields **10 commands, 14 artifacts, 14 recorded pixel failures**, all CLI exits zero, no emergency reap, maximum recorded sampled temporal change zero. These remain genuine retained artifact failures; this review did not re-decode them or newly establish their runtime cause.

Recomputed protected identities:

| Input                               | SHA-256                                                            |
| ----------------------------------- | ------------------------------------------------------------------ |
| `cli-integration-helpers.js`        | `255be7ab9c87202d5df2abee8452a9e04aa1dcc99c991d45b5eec5da0f39f635` |
| `fixtures/shape-v2.bforge`          | `44089df7b4d4f4c4b952c102835086c67cb1ab24da3cce85b06800c8942e8751` |
| `fixtures/model-v2.bitmapforge`     | `e654d3bc6345537c70645d6953d3b735f943e0953c3ef3d1db3ef7f9acf9bafe` |
| retained/current `dist/headless.js` | `9681565ac5e39d8f6e36a8f4475c554959f67baf48f2064259117bb402661a46` |

A matching retained build is not source/build equivalence or served-byte proof. Neither is claimed here.

## Prior objections: independent disposition

The revised matrix contains **22 data rows**, counted programmatically. The table below follows their order; resolution means a sufficient written design, not executed proof.

| Row / prior objection                  | Disposition and reason                                                                                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. No-preload comparison               | Resolved: six mandatory cells, P01/P02/P03 observed then clean control; independently decode both arms.                                                     |
| 2. Forced CI1/wrapper reuse            | Resolved: new external adapter calls frozen `runChild` directly, not `commandCase`/`session`/old observer.                                                  |
| 3. Existing explicit CI                | Resolved: literal presence/value preserved; nonempty CI remains existing-CI/no-sandbox; absent/empty must not gain sandbox flags.                           |
| 4. Checkpoint/dirty/untracked identity | Resolved: explicit before/after source, accepted ancestry, untracked, adapter and dependency-byte manifests; runtime-relevant drift invalidates comparison. |
| 5. Bundle versus source provenance     | Resolved: owner build mapping required for source equivalence; otherwise retained-bundle-only attribution is expressly limited.                             |
| 6. Seven served bodies                 | Resolved: exact response bodies/status/type/URL/origin/port mapped to disk, with runtime-consumed versus provenance-only distinguished.                     |
| 7. Singleton/attachment order          | Resolved: production conditional ESM Puppeteer and same served headless singleton; first setSize attaches instance probes before forwarding.                |
| 8. Wrapper semantics                   | Resolved: receiver/arguments/return/throw, identity and synchronous methods preserved; no constructor substitution.                                         |
| 9. Actual cached capture source        | Resolved: APNG actual getImageData receiver/result and WebM actual draw source/destination, correlated to getter acquisition and scheduled render.          |
| 10. Intrusive/fabricated readback      | Resolved: separate 2D WebGL copy, existing grid, guarded native reads; no matrix updates, GL-error consumption, injected render or fabricated zeros.        |
| 11. Unbounded evidence                 | Resolved: file/byte/raw/event/record/queue caps, counts-only particles, explicit overflow failure and terminal reserve.                                     |
| 12. Lost throwing trace                | Resolved: pre-spawn files, incremental acknowledged persistence, catch/finally records, explicit incomplete-evidence failure.                               |
| 13. Runtime identity                   | Resolved: exact Node/npm/browser/package/cache/args/tool and available page/graphics identity, without alternate flags/extensions.                          |
| 14. TMPDIR/socket/cache                | Resolved: per-arm short owned scratch mkdtemp; no global tmp/cache changes or acquisition.                                                                  |
| 15. H1 overclaim                       | Resolved: full pending→swap→actual stale-source consumption→pixel→decoded chain; detachment alone insufficient.                                             |
| 16. Temporal quantifier                | Resolved in plan: separately owned existential-pair correction, numeric gates retained, independent acceptance before certification.                        |
| 17. Batch Processing/notes             | Resolved in plan: separately owned test correction and independent exact-checkpoint acceptance.                                                             |
| 18. Original failures erased           | Resolved: original evidence retained; checker correction does not make blank/static output meaningful.                                                      |
| 19. Causal repair tests                | Retained correctly as future separate scope: first/later/stable swap, red/green, both-format stale-source mutation and cleanup proof.                       |
| 20. Budgets/containment                | Resolved: accepted child/outer/decoder/legacy budgets and frozen helper; emergency reap remains failure.                                                    |
| 21. Editor comparison ownership        | Resolved: separate transferred existing-target protocol only for CLI-specific/shared or parity claims; no extra server/cell here.                           |
| 22. Final ledger/authority             | Resolved: original ten commands/fourteen artifacts, failure ledger and legacy gates preserved separately; subset cannot clear P/C/release.                  |

### Source-level executability

`index.js:35–60` starts the existing seven-route server, launches Puppeteer, creates a page, exposes progress, navigates with networkidle0, then evaluates the real render. Thus the specified post-navigation/pre-render attachment point exists. `harness.js:194–220` constructs the manager, explicitly sizes it before source load, then sets render mode/options. `SceneManager.setSize` is a suitable first postconstruction hook with effect/animation objects already present; construction history is correctly declared unobserved.

The lifetime hypothesis is still plausible, not proved: `_commitSource` starts fade, `setRenderMode` can queue a renderer, no-fade absolute seeking sets show state, and `renderBitmap` can swap canvases. Both actual capture paths acquire a canvas before stepping. The proposed native read/draw correlation can distinguish that lexical capture reference from the current effect canvas and internal sample read without changing capture code. WeakMap membership, scheduled-call nesting and recursion guards are necessary adapter acceptance checks, not optional implementation details. First/middle/last selected buffers and scalar swap events suffice for this finite investigation; no exhaustive per-frame buffer dump is required.

## Runtime, bounds and failure handling

The revised CI account matches actual source: `commandCase` spreads an env override after default CI1, deletes NODE_OPTIONS/executable override, yet hardcodes CI1 metadata; `runChild` itself does not force CI. Production tests CI truthiness, including nonempty `0`/`false`. Clean control means no preload/page wrappers, not necessarily sandbox-enabled: the already-approved literal inherited CI policy controls that. Conflicting overrides must stop for parent disposition, not be silently deleted.

No-preload provenance via parent-only owned-descendant/socket discovery is compatible with the loopback listener's launch-time lifetime. Its HTTP GETs are provenance-only and do not establish browser consumption. Failure to discover/attribute/fetch while alive must produce a blocked cell, not a held-open server, interception or retry. The observer arm can retain consumed bodies through pre-navigation response listeners. Seven routes match server.js exactly; incidental favicon404 needs no repair.

The 60s child, 16s teardown reserve and 80s render outer budget match the accepted helper contract; decoder20s/80s artifact and legacy40s/60s remain separate. As the stage-1 audit states, these are composed budgets, not a hard realtime guarantee under event-loop stall. An abandoning timeout race, cap breach hidden as success, or missing cleanup report would violate this accepted design.

The file/byte caps are finite and credible for the prescribed default viewport: P01's 25-frame 400×400 RGBA decode is **16,000,000 bytes**; eighteen full-size diagnostic buffers would add **11,520,000 bytes**, before deduplication. All seven current asset bodies fit the session cap, including three.core.js at 1,408,569 bytes (the 1MiB restriction applies to individual selected raw buffers, not asset bodies). **A DPR2 800×800 WebGL raw buffer would be 2,560,000 bytes and exceed that individual cap.** This is an explicit execution-capacity gate, not permission to force DPR1/downsample/change caps: validate the approved viewport/backing tuple before the pass; if full selected evidence cannot fit, return the plan's capacity blocker for bounded re-review. Do not claim the design supports every otherwise-supported DPR.

Incremental persistence does not guarantee crash-proof page history; the plan correctly fails incomplete acknowledgements rather than inventing a trace. External adapter review must check reservation before writes, terminal reserve, finite queues and sampler, actual catch/finally paths, primary-error preservation, and owned containment on cap/probe failures. The frozen helper has no new diagnostic cancellation API; adapter-side cap enforcement must not pretend it does, mutate it, or bypass its final returned failure/cleanup accounting. These are concrete adapter-fidelity requirements within the accepted scope, not a request for new diagnostic features.

## Stage-2 certification gate and stopping boundary

The plan's description of test corrections as active is now historically stale: the separate worker has delivered `cli-prerequisite-stage2-test-repair.md`. Current source hashes match that report: evidence/checker `94c65b01355ea0df04fadddf49dcfcb49542a9a172f8b53cd8d085ff3dd7a701`, render tests `513934ed953b3371d7207874ef5605bad5146d6cfb0a8d38afd9779e68624ae8`. Static source now uses all sampled pairs with `.some(...)` at unchanged >=0.005 and >16 gates, and actual P07–P10 stderr calls the supported-input/notes assertion. **Delivery and static inspection are not independent implementation acceptance.** This report does not certify that separate slice or its reported test/offline execution. Obtain its independent exact-byte verdict before full-P certification; passive measurement need not wait, provided checker identity/quantifier and descriptive-versus-accepted status are explicit. No plan rewrite is necessary solely to update the worker's lifecycle status.

Only six mandatory cells and conditional D05-O once are accepted. Infrastructure/provenance/observer failure stops later cells; expected pixel failures do not. Divergent observed/control content classifications block causal attribution and prohibit optional D05. No batches, broad reruns, retry loops or endlessly expanded probes. Unavailable editor control restricts CLI-specific/parity claims, not permission to add a competing target. A retained-bundle-only local seam or an honest missing-observation blocker is a valid bounded measurement deliverable.

**Execution prerequisites, not unresolved design blockers:** exact parent A/B/stage-1 handoff and runtime/build-owner disposition; approved literal CI/override/runtime tuple and capacity; faithful reviewed external adapter/checkpoint; tooling's explicit serial lane transfer. No such execution clearance was acquired here. No confirmed source root cause or production repair is accepted. Preserve fixtures/literal bayer4, helper, numeric/scheduling/cleanup contracts, original fourteen failures, security/runtime boundaries and separate legacy P11 status. Stop after the bounded pass and return stage-local H1–H6 evidence or a blocker; any repair requires its own finite reviewed plan, causal/mutation proof, implementation audit and eventual complete original ledger.
