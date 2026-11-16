# Independent CLI stage-2 R1/R2 test-repair audit

## Verdict: ACCEPT — bounded test implementation only; full P remains BLOCKED

R1 and R2 are correctly implemented in the exact submitted payload. No mandatory test-repair finding remains. This verdict does **not** accept the fourteen real exported animations, full P, C, release, a production repair, fixture substitution, threshold relaxation or browser execution.

Reviewed HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01` on `gloin/release-hardening` plus the shared uncommitted checkout. Read AGENTS, web-product-development guidance, the prior stage-2 audit and repair report. COLLAB files are absent. This review owns only this audit document. No browser, install, build, production edit or original-evidence rewrite was performed. Nonbrowser tests ran disposable loopback/FTP fixtures and generated decoder self-test media; neither is CLI artifact acceptance.

## Exact scope and integrity

Independently regenerated `repair.diff` using the original checkpoint source snapshots and the current two repaired files, plus the repair report as a `/dev/null` addition: byte-for-byte identical to the submitted diff. Both submitted revised source snapshots equal the checkout. The failure integration suite is unchanged. This is a repair-relative comparison, not a claim that the whole shared checkout has only two modified files.

| Checked target                           | Independently verified result                                       |
| ---------------------------------------- | ------------------------------------------------------------------- |
| Original evidence manifest               | 233/233 listed files match bytes and SHA-256                        |
| New repair evidence manifest             | 96/96 listed files match bytes and SHA-256                          |
| `source-hashes.json`                     | All 14 source/protected/diff hash entries match their exact targets |
| Original manifest SHA-256                | `d9cf8ba3c0c76b22fcaaedb6ebf2c8a0f8c059f422247a7dacf26094c71375c0`  |
| Repair manifest SHA-256                  | `ccf2e5e0a5012417183885a56a90f80fba24b499e6d8227a038fbb48969a84d3`  |
| Exact repair diff SHA-256                | `d51d4b835dd07c10c285a19eb6fe840b407dd75baa47d39dc6b37cb6f9aaa7a1`  |
| Revised `cli-stage2-evidence.js`         | `94c65b01355ea0df04fadddf49dcfcb49542a9a172f8b53cd8d085ff3dd7a701`  |
| Revised `cli-render.integration.test.js` | `513934ed953b3371d7207874ef5605bad5146d6cfb0a8d38afd9779e68624ae8`  |

Protected index/server/harness, built headless source, root/CLI/embed manifests, lockfile and containment helper match the repair's frozen protected hashes and the prior audited values. The always-enabled freeze test independently passed for the helper and both fixtures. The accepted helper remains `255be7ab9c87202d5df2abee8452a9e04aa1dcc99c991d45b5eec5da0f39f635`. The diff changes no numeric/spatial policy, sampling positions, deadlines, containment budgets, fixture or production source. Matching a frozen bundle establishes unchanged bytes, not fresh-build provenance.

## R1 — qualifying separated pair: accepted

`rgbaStats` now compares all unique beginning/middle/end pairs; `assertPixels` requires `.some(change.fraction >= 0.005)`. Changed pixels still require absolute luma difference **>16**. Every sampled frame must independently pass opacity >=0.99, occupancy >=0.01, meaningful separated colors and luma standard deviation >=5. Meaningful-bin area, RGB buckets, background distance and color-separation policy are unchanged. The fix changes the temporal quantifier, not the quality threshold.

The four new temporal test cases are meaningful, not blank-frame positives:

- The spatially patterned inversion followed by an identical final frame passes with fractions `[1, 1, 0]`; the original every-transition checker rejects it.
- Spatially meaningful static frames fail specifically at the temporal gate.
- Byte-distinct 7/15-level noise also fails specifically at that gate, avoiding accidental rejection at an earlier spatial check.
- One changed pixel in 400 fails at 0.0025; two pass at the inclusive 0.005 boundary. The first result is computed before the shared buffer is changed again, so the boundary test does not retroactively alter its negative observation.

Independent in-memory assertion-mutant probes confirmed that replacing `.some` with `.every` rejects the stationary-interval positive; removing the temporal gate admits static/noise/below-area cases; lowering area to `>0` admits the below-boundary negative; making area strictly `>0.005` rejects the boundary positive. These were direct checker/counterexample probes, not a claim of a full mutation-runner campaign.

Also exercised an additional spatially meaningful endpoint-only counterexample: offsets 0/10/20 produce pair fractions `[0, 1, 0]`, and the corrected checker accepts it. Thus first-to-last comparison really works when neither adjacent sampled pair qualifies. The committed new positive itself has two qualifying pairs despite its stationary transition; its title's “one qualifying half-loop pair” refers to the adjacent half-loop pairs, not exactly one of all three comparisons. Optional strengthening: retain this endpoint-only case as another permanent test. Its absence does not block R1 because the exact pair list is already asserted and the implementation was independently exercised.

The reported exact-16 floating-point subtraction issue is real residual arithmetic behavior, not repaired here. Choosing 7/15 makes the noise regression unambiguous without changing the frozen arithmetic. No exact-16 numerical robustness guarantee is inferred from this acceptance.

## R2 — both actual batch Processing messages: accepted

The real P07–P10 subprocess branch invokes `assertBatchProcessing(run.result.stderr, join(cwd, 'input'))`. It checks the actual captured stderr, not a fabricated expected stream. Filtering exact `Processing:` lines and comparing sorted arrays requires precisely both supported absolute paths once each, rejects duplicates/substitutions/extras, and is directory-order independent. Ignored notes are explicitly rejected as well; this is redundant with exact line-set equality but harmless. Other diagnostic stderr lines remain permitted.

The five new batch cases cover both orders, either missing supported path (two parameterized cases), duplicated first input in place of the second, and notes alongside both supported inputs. Their generic throw assertions are appropriate for equality failures; the positive prevents an always-throwing checker from passing. Independent direct probes also passed CRLF/reversed messages with unrelated diagnostics, and rejected missing/duplicate/notes inputs. Replayed all four original P07–P10 `process.json` stderr streams through the current checker: **4/4 pass**. No new batch CLI was launched.

Together these are **nine added regressions**, not nine newly passing real artifacts. Mutation sensitivity is supported by the direct probes and inspected assertions; removal of the real batch call itself is verified by source inspection, not by the pure checker suite alone.

## Fourteen artifacts: independently redecoded, still rejected

Read the external offline runner and retained `offline-classification.json`, decoder process reports, raw bytes and their manifest bindings. Independently ran **fourteen fresh FFmpeg decodes into memory**, with per-command 20-second timeout, APNG looping disabled, passthrough timing and RGBA output. Every fresh raw SHA-256 equals the corresponding retained repair classification hash; original artifact hashes, decoded lengths/dimensions/frame counts also match. This execution did not write decoder output into either evidence directory.

Recomputed all sampled statistics using the current `rgbaStats` on the hash-verified repair RGBA streams: samples and all three changed fractions exactly match the report. Current `assertPixels` produces the same exact recorded failure for every artifact. All fourteen retained decode process reports show code zero, observed close and no emergency reap. The repair runner applies structure/timing/count checks before the pixel gate; its source is consistent with the retained reports. Independent fresh decoding here revalidates decoded content, not a newly executed browser ledger or a new full timing-parser audit.

| Current classification                         | Count |
| ---------------------------------------------- | ----: |
| Transparent output                             |     3 |
| Fewer than two separated meaningful colors     |     9 |
| No qualifying separated-frame change (P05/P06) |     2 |
| Meaningful-output pass                         |     0 |

All three sampled temporal fractions are zero for every artifact, including those rejected earlier for spatial defects. R1 therefore clears **none** of the prior fourteen pixel failures. The prior audit's separate all-frame analysis remains retained; this review does not relabel sampled checks as another all-frame causal investigation.

## Actual execution and discovery — no silent acceptance through skips

Used the existing Node24 executable `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node`; no download or substitution.

- Independently reran the owned pure selection: **13 passed / 30 skipped**, exit 0. Nine are new cases; four are inherited pure contracts.
- Independently reran the entire CLI workspace with `CLI_DECODER_TESTS=1`, `INTEGRATION` and `CLI_BROWSER_SLOT` unset, `--maxWorkers=1 --no-file-parallelism`: **126 passed / 46 skipped (172 total)**, exit 0. Both genuine decoder self-tests passed; six files passed and the failure-integration file was skipped.
- Independently ran enabled `vitest list` for the two stage-2 files with `INTEGRATION=1 CLI_BROWSER_SLOT=stage2`, decoder flag absent: **58 discovered = 41 render-file + 17 failure-file entries**, exit 0. This was discovery only; no hooks/session/browser ran.
- The 46 whole-workspace skips reconcile exactly: **28** real render/decode/batch-hash entries + **17** failure-ledger entries + **1** separately gated historical CLI integration test. With decoder opt-in enabled, no decoder case is hidden. The two stage-2 files contain **60** cases including their two separately gated decoder tests; enabled discovery without that opt-in yields 58.
- Reproduced the exact diff and checked `git diff --check` successfully. The audit path is not ignored (`git check-ignore` returns 1 for no match, not a failed test). Retained root lint/owned formatting logs and their command exits are integrity-verified; this review does not claim to have independently rerun those gates.

The initial repair run's four failures remain retained, not replaced with only the final green log: exact-16 synthetic test arithmetic, two FFmpeg deadline failures and a server unit timeout. The final author run and this independent whole-workspace rerun pass under unchanged budgets. The earlier timeout causes remain unproven; neither green rerun establishes that those timeouts never occurred nor attributes them to production.

## Remaining gates and authorization boundaries

1. **Full P remains BLOCKED by fourteen real meaningful-output failures.** Successful subprocess exits, valid containers, decoder success and distinct batch hashes are not rendered-animation acceptance.
2. Obtain the separately bounded production-render diagnostic authorization/review and a newly granted serial browser slot before any real diagnostic or CLI ledger rerun. The stale-canvas explanation remains a hypothesis, not a diagnosis established by this test-only review. No production patch is authorized by this verdict.
3. Any proposed causal repair requires its own accepted bounded plan, independent implementation review and unchanged-fixture/threshold/budget verification. Then rerun the full required real P01–P10 artifact ledger and failure/cleanup contracts in the granted lane; offline reclassification is not a replacement.
4. **Legacy P11 remains separately blocked** at browser launch. It still needs the prior audit's controlled short-TMPDIR/actual-launch-stderr investigation with unchanged browser/cache/deadlines, followed by its original assertions. Header smoke recovery would not certify meaningful artwork.
5. A/B provenance, before-P causal evidence, fresh-build/source provenance, parent root gates and full P/C/release decisions remain the parent's separate responsibilities. No issue closure, merge, deployment or browser-slot reuse follows from this report.

**Final disposition: ACCEPT R1/R2 test implementation only. Full P: BLOCKED.**
