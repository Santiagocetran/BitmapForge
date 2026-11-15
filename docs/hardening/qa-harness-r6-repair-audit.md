# Independent narrow re-review — R6 mixed-stage classification repair

## Verdict: ACCEPT harness repair only

**ACCEPT the exact R6 follow-up at the source/offline-regression stage.** The sole remaining REVISE in `qa-harness-repair-audit.md` is resolved. Preserve that audit's accepted R1–R5 and R7 mechanisms and dispositions without reopening or extending them. This verdict does not accept application behavior, browser results, a policy amendment, or a release.

Accepted executable SHA-256 for the next separately authorized real baseline browser lane:

`2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`

This identity is the canonical executable-map digest, not a Git commit. Read back the executable and full supplier maps before the next real run; changed bytes require a new identity/review rather than silent reuse of this acceptance. Browser-slot release and parent handoffs remain separate prerequisites.

## Scope and evidence boundary

Reviewed `qa-harness-repair-audit.md`, `qa-harness-r6-repair.md`, the exact five-file follow-up diff, current source and regression, and `QA/repairs/r6-followup/` artifacts. Here `QA` is `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`.

Only this audit document was authored in the repository. No harness/application/manifest/threshold edit, installation, browser/server launch, historical evidence rewrite, remote action or new acceptance-lane execution was performed. Independent offline tests use private diagnostics and non-server Node children. The author verifier was inspected but **not invoked**, so its author artifacts were not overwritten. Other owners' current CLI/application edits remain outside this verdict.

## R6 source and actual-wiring findings

- **Independent durable supplemental state:** `harness/specs/accessibility-smoke.spec.mjs:66–108` synchronously persists `scanner.supplemental.status = entered` before awaiting `dom(qa)`, separately from scanner result/exception/completion. It persists successful completion, caught exception and soft assertion failure. Scanner `qa-blocked` annotations and scanner exception/result fields survive; failure precedence no longer depends on erasing their evidence. Scanner fields originate in the actual `lib/axe.mjs` scan/stage path, not merely the regression substitute.
- **Precedence:** `lib/repair-contracts.mjs` exports `accessibilityOutcome`. A delivered DOM-failure annotation, durable supplemental failure, or failed/timed-out/interrupted terminal state during entered-but-unfinished supplemental work yields `fail` before scanner annotations. The old `activeStage: dom` shape without completion is conservatively covered. Valid scanner results with failed/timed-out work remain failures. Unresolved scanner-only evaluation remains blocked; scanner exception plus demonstrated successful supplemental completion remains blocked.
- **Actual runner wiring:** `run.mjs:238–263` imports/calls that helper with the persisted stage, actual terminal status (or interrupted fallback) and runner annotations. The call after annotation processing receives the same durable stage: the earlier scanner annotation cannot restore `blocked` over supplemental failure. The scanner-terminal diagnostic records the resulting blocked decision while retaining underlying scanner/supplemental data.
- **Actual local ledger wiring:** `lib/runtime.mjs:229–249` calls the same helper in the real ledger outcome expression using `qa.scanner`, `info.status` and annotations. Scanner annotations added during local cleanup therefore do not defeat supplemental failure precedence. If worker cleanup itself never executes, this review does not claim a local row exists; the outer durable fallback is the relevant path.
- **Scope containment:** only `lib/repair-contracts.mjs`, `lib/runtime.mjs`, `run.mjs`, `specs/accessibility-smoke.spec.mjs` and `tests/repair.test.mjs` changed against the incoming freeze. No supplier file was added or removed. R6 scanner/server implementation outside this bounded change and all case IDs, policy, assertion/readiness bounds, deadlines, retries, workers and trace ownership remain as previously reviewed.

## Independently exercised red → green regression

The integrated regression executes the **actual Q7.E accessibility callback**, with explicitly injected nonbrowser scanner/DOM dependencies, and the **actual runner classification source block and local ledger outcome expression**. For never-settling DOM work, it waits for actual entry and supplies terminal status offline; neither catch nor completion runs. This is not an observed Playwright timeout or fabricated browser result.

| Integrated causal scenario                                        | Current runner / local ledger |
| ----------------------------------------------------------------- | ----------------------------- |
| Scanner exception → qa-blocked → DOM entry → timeout before catch | fail / fail                   |
| Scanner exception → supplemental completes successfully           | blocked / blocked             |
| Valid scanner result → DOM entry → timeout before catch           | fail / fail                   |
| UI setup throws before scanner/DOM                                | fail / fail                   |
| Scanner evaluation never resolves, no DOM entry                   | blocked / blocked             |
| Scanner exception → caught DOM exception                          | fail / fail                   |
| Scanner exception → DOM soft assertion failure                    | fail / fail                   |

Independently reran the old-runner counterexample after verifying every executable in the existing private `counterexample-harness`: only `run.mjs` differs from the current freeze and exactly matches the incoming snapshot. With the same current integrated regression, **exit 1**, assertion `scanner failure then DOM entry timeout without catch`, actual **blocked**, expected **fail**. Thus the regression detects the specific old annotation override rather than only testing a standalone stage predicate. The current full suite passes that regression and its local-ledger assertions.

Commands used the paired Node `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`:

```sh
NODE --test QA/harness/tests/repair.test.mjs
NODE --test --test-name-pattern='R6 integrated' QA/repairs/r6-followup/counterexample-harness/tests/repair.test.mjs
```

`NODE` and `QA` above abbreviate those literal absolute paths. Independent current run: **14 pass, 0 fail/cancelled/skipped/todo; exit 0**, duration **12547.929735 ms**. Private diagnostics: `/home/agent/.hermes/profiles/gloin/cache/scratch/qa-repair-offline-cqo94U`. Independent old-runner red diagnostic: `/home/agent/.hermes/profiles/gloin/cache/scratch/qa-repair-offline-Lh7SXu`. These add **zero browser acceptance passes**.

## Independent freeze / immutable-evidence verification

Recomputed from current bytes rather than trusting the author verification report:

| Check                                                          | Independent result                                                                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Executable map, every entry and canonical digest               | 28 files match; `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`                                                          |
| Complete supplier file set, sizes, hashes and canonical digest | Exact 62-file map matches; `e7d2ea693654063f25034bd2bd30e8caa7d7a8eb7ba0e249d152edf58807e5c3`                                               |
| Comparison with incoming freeze                                | Exactly the five named executable files changed; other supplier entries unchanged                                                           |
| Incoming executable snapshot                                   | Every `before/` entry matches the prior executable map (`3bc6339908cdf83d541aebeb57df0510665a2d5dfd6d5560645d9afbc5af21dc`)                 |
| Follow-up diff SHA-256                                         | `6ce08392985be8c020bd35932795ba0bf584fe4f7d5350bc142e2628f3857552`                                                                          |
| Syntax, independently rerun                                    | 27 modules, each paired `node --check` exits 0                                                                                              |
| Original evidence                                              | All 1,171 recorded entries match size and SHA-256                                                                                           |
| Original matrix SHA-256                                        | `67cef4a0c13a587db5a70c7f7189d562445e3705e73f8c7dc101d1bfb0b934cc`                                                                          |
| Historical matrix                                              | Unchanged 198 cells: 38 pass / 28 fail / 33 blocked / 99 not run; full suite also checks exact identity/counts and private-copy idempotence |

## Preserved failures, policy and next real-run gates

The prior audit's full dispositions remain authoritative; none is reclassified by this offline repair:

- Q1.shape.D and Q1.text.D/N in both engines retain meaningful-preview occupancy/entropy failures, not a claim of wholly blank rendering or missing fonts. No quality threshold, source text, fixture, geometry, palette or animation change is authorized.
- Q3.drag.D retains the baseline collapse/reveal pressed-handle failure. Separately owned application repairs are not accepted here.
- Q5.host.D/N retains notice accessibility while Help is open; later resume/latest delivery remains unverified behind that first failure. Current source changes do not clear historical evidence.
- All seven Q7 cases in both engines retain strict IDREF failures as supplemental-policy findings, not axe violations. Preserve the literal stronger named-main/navigation policy and actual Editor tasks **group** check as distinct requirements; do not rename a group as navigation or amend the policy. Main/navigation outcomes under the repaired harness require a real run. Prior zero axe violations plus incompletes do not establish conformance; incompletes remain manual-unverified.
- Firefox Q5.late-export.D/N's original console attribution failures remain recorded. Accepted R1 source repair still requires fresh structured-console execution and Chromium controls; fresh Q4 artifact checks remain outstanding.
- WebKit's missing `libwoff2dec.so.1.0.2` prerequisite and its 33 blocked baseline cells remain unchanged. No substitute browser/environment repair is authorized.
- Real supervisor shutdown, runner attachments/intentional failure trace, available-engine revised baseline, broader built/source/ASCII gates and final comparison remain unexecuted here. Final's 99 cells remain not run. No WCAG, AT, Safari, device, zoom, browser pass or release claim follows.

Keep the frozen 33 smoke IDs / 198 cells, 90-second tests, zero retries, one worker, assertion/readiness limits, meaningful-pixel thresholds/default animation, source/built distinction and runner-owned retain-on-failure tracing. No manifest or acceptance-budget change is requested.

**Final decision: ACCEPT this exact harness repair, resolving only the prior R6 classification gap. Freeze the executable hash above for the next separately authorized real baseline browser lane; all application/policy failures and live execution gates remain visible and non-green.**
