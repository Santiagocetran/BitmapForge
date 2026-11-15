# CLI prerequisite stage 2 — bounded R1/R2 test repair

## Outcome and scope

Implemented the two test-only findings in `cli-prerequisite-stage2-audit.md` for independent re-review. **Full P remains BLOCKED: all fourteen retained artifacts still fail meaningful-output acceptance.** No new CLI render/browser, application dev/preview server, installation or build was run. Existing nonbrowser unit suites exercise their disposable loopback server/FTP fixtures; these are not a browser-lane or application-server run.

Read repository AGENTS, web-product-development guidance, the accepted P plan and its separate ACCEPT audit, stage-2 REVISE audit and handoff. HEAD remains `550842cab61002c7cc6563e50b9fcdeb17c9bf01`, branch `gloin/release-hardening`; shared uncommitted work was preserved. Governance-listed COLLAB files are absent. No commit, remote action, production edit or diagnostic repair was made.

Repository ownership in this repair:

- Modified `packages/cli/src/__tests__/cli-stage2-evidence.js`.
- Modified `packages/cli/src/__tests__/cli-render.integration.test.js`.
- Created this report. Failure integration suite remains byte-identical.

The protected helper, fixtures, production files, build, manifests/lock, quality thresholds and timing/containment budgets remain unchanged. The prior handoff/audit and original evidence are retained, not rewritten to describe a successful ledger.

## R1 — existential separated-sample motion

`rgbaStats` now records all three beginning/middle/end pairs (rather than only two neighboring sampled transitions). `assertPixels` requires **at least one** pair with changed fraction >=0.005; a changed pixel still requires luma delta >16. Beginning/middle/end spatial checks remain mandatory on every sample: opacity >=0.99, occupancy >=0.01, separated meaningful colors and luma standard deviation >=5. Bucket/color/background definitions are unchanged.

Direct always-enabled nonbrowser checker regressions use explicitly synthetic 20×20 opaque, spatially meaningful two-color frames, never CLI evidence:

- Inverted first→middle with middle=end passes; the stationary half-loop is explicitly zero, reproducing the audit counterexample.
- All frames unchanged fail specifically at the temporal assertion despite passing spatial checks.
- Byte-distinct 7/15-level grayscale changes fail as noise at that same temporal assertion.
- One changed pixel out of 400 (0.0025) fails; two (0.005) pass, preserving the changed-area boundary.

During the first test execution, a proposed exact-16 grayscale test exposed floating-point luma subtraction slightly exceeding 16 for some values. The test noise inputs were corrected to unambiguously sub-threshold 7/15; **the checker arithmetic and >16 threshold were not changed**. The original failed execution log is retained.

## R2 — real batch stderr contract

Every real P07–P10 batch subprocess now calls `assertBatchProcessing` on its actual stderr and absolute input directory. It requires exactly the two distinct `Processing: <absolute a.bforge>` and `Processing: <absolute b.bitmapforge>` lines, in either order, and explicitly rejects processing ignored `notes.txt`.

Always-enabled direct regressions verify both orders pass, either missing input fails, duplicated first-input messages cannot stand in for the second, and notes processing fails even when both supported messages appear. This strengthens assertions only; it does not claim a production bug. Offline replay of the four retained batch stderr streams passes the same new assertion.

## Retained artifact reclassification — no render

Evidence root: `/home/agent/.hermes/profiles/gloin/cache/scratch/`.
New repair evidence directory: `bitmapforge-cli-stage2-test-repair/`.
External reproducible runner: `cli-stage2-test-repair-offline.mjs`.

The offline runner reads all fourteen actual artifacts from `bitmapforge-cli-stage2-render-gUdVrf/`, performs fresh FFmpeg passthrough RGBA decodes (APNG looping disabled), and runs the corrected `analyzeArtifact`/`rgbaStats`/`assertPixels` against those bytes. Decodes and reports are written **only to the new repair directory**. All fourteen fresh raw SHA-256 hashes equal their original retained `pixels.json` hashes. Structure/timing/count checks pass; all fourteen pixel classifications remain failures:

| Classification                                 | Count |
| ---------------------------------------------- | ----: |
| Transparent output                             |     3 |
| Fewer than two separated meaningful colors     |     9 |
| No qualifying separated-frame change (P05/P06) |     2 |
| Meaningful-output pass                         |     0 |

All three sampled pair changed fractions are zero in every artifact, including those whose spatial assertion fails first. Thus changing the quantifier does not clear any retained failure. This is sampled-pair reclassification, not a new all-frame causal diagnostic; the independent audit's separate all-frame findings remain intact.

Original `bitmapforge-cli-stage2-checkpoint/evidence-manifest.json` remains SHA-256 `d9cf8ba3c0c76b22fcaaedb6ebf2c8a0f8c059f422247a7dacf26094c71375c0`. **233/233 original listed files** passed byte-count and SHA-256 validation both before and after offline reclassification. The new `offline-classification.json` retains per-artifact source/raw hashes, dimensions, frame counts, samples, all three temporal fractions, exact failure and retained batch stderr.

## Executed verification

Existing approved Node executable: `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node`, v24.22.3. No acquisition/substitution. Commands, cwd, enabling environment and per-command exits are recorded in `commands.json` and `commands-final.json`. INTEGRATION/browser-slot flags are absent for all execution, except **discovery only**.

| Gate                                                                                    | Final result                                                               |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Owned pure regression selection, one worker                                             | exit 0; 13 passed / 30 skipped                                             |
| Isolated genuine decoder self-tests, one worker                                         | exit 0; 2 passed / 41 skipped                                              |
| Isolated unchanged server suite, one worker                                             | exit 0; 24 passed                                                          |
| Entire CLI nonbrowser workspace, `CLI_DECODER_TESTS=1`, one worker, no file parallelism | exit 0; **126 passed / 46 skipped (172 total)**                            |
| Enabled stage-2 `vitest list ... --json` (no execution)                                 | exit 0; **58 discovered**: 41 render-file entries, 17 failure-file entries |
| Root ESLint (`node node_modules/eslint/bin/eslint.js .`)                                | exit 0                                                                     |
| Owned JavaScript Prettier check                                                         | exit 0                                                                     |
| Offline fourteen-artifact decode/classification and retained batch stderr               | exit 0; 14 still rejected / 4 batch checks pass                            |
| `git diff --check`                                                                      | exit 0                                                                     |

Discovery excludes the two separately gated decoder self-tests; the two stage-2 files have 60 tests including them. The nine added pure cases account for the previous nonbrowser 117→126 pass increase, not recovered CLI artifact passes.

The first workspace attempt is retained as **exit 1: 122 passed / 4 failed / 46 skipped**. One failure was the synthetic exact-16 floating-point issue described above; the two benign FFmpeg generation children hit their unchanged 20-second deadlines (scoped SIGTERM/emergency containment, not cleanup success), and the unchanged server's `/three.core.js` case exceeded its existing five-second unit budget. After the bounded test-input correction, the affected decoder/server files were rerun individually with one worker and passed; the complete final workspace also passed without budget changes. The timeout cause was not independently established; no production defect or concurrent-load attribution is claimed.

## Exact re-review payload

`bitmapforge-cli-stage2-test-repair/repair.diff` is the exact two-file unified diff **against the original checkpoint source snapshots**, including these otherwise untracked files, plus the new report as a `/dev/null` addition. `source/` contains exact revised sources and this report; `source-hashes.json` includes all changed-file hashes and every protected run-manifest hash. `repair-evidence-manifest.json` inventories the new logs/reports/raw decodes/snapshots by bytes and SHA-256. External runner scripts remain alongside the evidence directory under the same authorized scratch root.

| Source                                       | SHA-256                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `cli-stage2-evidence.js`                     | `94c65b01355ea0df04fadddf49dcfcb49542a9a172f8b53cd8d085ff3dd7a701` |
| `cli-render.integration.test.js`             | `513934ed953b3371d7207874ef5605bad5146d6cfb0a8d38afd9779e68624ae8` |
| unchanged `cli-failures.integration.test.js` | `625000972ed67c590ec084d43e4666eba2b40ebdda103774fad8a43d6af7eebd` |
| unchanged containment helper                 | `255be7ab9c87202d5df2abee8452a9e04aa1dcc99c991d45b5eec5da0f39f635` |

Remaining gates: independent R1/R2 implementation re-review; separately reviewed production-render diagnostic/repair authorization; newly granted serial browser slot for any real CLI rerun; separate legacy P11 blocker. This repair accepts none of full P/C/release, production repair, fixture changes, threshold relaxation, or browser-lane reuse.
