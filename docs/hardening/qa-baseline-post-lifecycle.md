# Baseline after accepted lifecycle repair

## Outcome and scope

**Completed both authorized 33-case baseline lanes: Chromium 18 pass / 15 fail; Firefox 18 pass / 15 fail. Browser lane released.** Both fresh same-engine preflights passed. All failures remain retained; no adaptive fixes, automatic reruns, instrumentation changes, installs, source/harness/lifecycle edits, flags or deadline changes occurred. No final build or final comparison was executed.

The current explicit parent/user authorization extends the earlier one-attempt decision in `parent-browser-prerequisite-decision.md`; it does not clear the destructive lifecycle matrix. **R04 actual during-close remains BLOCKED_UNOBSERVED_WINDOW**, with no authorized retry or substituted controlled fixture.

Paths:

- `QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`
- `RUN=QA/runs/baseline-post-lifecycle-20261115T094529Z`
- Immutable target `/home/agent/BitmapForge-hardening-research/baseline/dist`, never rebuilt.
- Per-attempt output `RUN/baseline/{preflight,smoke}/{chromium,firefox}/a01`.

## Frozen identity for the separately authorized final matching run

- **Current accepted harnessHash:** `4963e730deebf362202696610f6d3e38ec85af89a5f1730929f0d1fa0d5bbe42`, all33 harness entries unchanged. This includes accepted lifecycle changes; it is not the obsolete28-file pre-lifecycle digest.
- Lifecycle freeze `8dffea64d1cee4ff71e88207ba656c7a01b5a83487de64f2a67c8826017f3576`, all19 named file hashes verified before execution.
- **Frozen baseline dist inventory hash:** `a812c217b11c630e42c9e53f167bdf566d28fdb9fb10794c0fd2299b3fbbcec7`. Definition: SHA256 of UTF-8 compact JSON (`separators=(',', ':')`, sorted relative-path enumeration) mapping all37 dist paths to `{bytes,sha256}`. Exact map and digest are in `RUN/frozen-identity.json`. All37 files remained identical. This is a build inventory digest, not a source commit.
- Historical served revision `550842cab61002c7cc6563e50b9fcdeb17c9bf01`. Recorded working-tree HEAD is the same, with dirty tracked diff digest `4dc41a48f938a0672fa8da6ce5b005c6b0e7fb2e53fa646fd8f119fb2413cca5`; all170 harness-inventoried source/dependency entries stayed unchanged. Dirty/untracked work is not claimed to equal historical source.
- Node24.22.3/npm11.21.2, locked Playwright1.59.1; Node `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`.
- Chromium147.0.7727.15, parent cache `QA/browsers/parent-baseline-pw-1.59.1`; actual live headless-shell revision1217 SHA256 `22d72b589f908111fa29ff4e61ead8a0601e925177f59c70e2e851c22e9b1886`.
- Firefox148.0.2, separate cache `QA/browsers/pw-1.59.1`; actual live firefox1511 executable SHA256 `4c6cc6e27feb99dcc6420bbdca0acacf75c6d5e11f9139bd7dc31752b2431391`.
- Cube fixture remains1577bytes, SHA256 `4d2d98182b4b93e8b45e881b1f92838b7e951ab246bb73f81663b3e3f5bef708`.

Both preflight and smoke used the literal immutable target, strict owned5291/no reuse, original Chromium args, original30s launch bound,90s tests, retries0, worker1 and runner-owned retain-on-failure traces. Private short TMPDIRs were inventoried and removed only after owned-process absence. Commands, cache/env fields, complete discovery and actual process executable/argv/startTicks/PGID/SID are retained. A later final run must use this same harness/case contract and the parent's separately supplied final build/cache handoff; no final authorization is inferred here.

## Actual execution and strict shutdown

Executed once, serially: Chromium preflight → Chromium33 → Firefox preflight → Firefox33. External orchestration command from `/home/agent`:

```sh
python3 /home/agent/.hermes/profiles/gloin/cache/scratch/qa-baseline-post-lifecycle-run.py
```

It invokes the frozen `NODE QA/harness/run.mjs` with explicit per-attempt environment; `command.txt`, launch JSON, environment.json and separate stdout/stderr preserve the complete replayable commands. Preflights exited0; each smoke exited1 for real assertion failures; outer collector exited0 after retaining/reconciling those failures. Smoke failure is not reclassified as collector success.

| Lane               | Discovery/report | Runner/outer lane exit | Strict child completion                         |
| ------------------ | ---------------- | ---------------------- | ----------------------------------------------- |
| Chromium preflight | 1/1, pass        | 0                      | clean                                           |
| Chromium smoke     | 33/33            | 1                      | clean, actual child PID2846893 exit+close0/null |
| Firefox preflight  | 1/1, pass        | 0                      | clean                                           |
| Firefox smoke      | 33/33            | 1                      | clean, actual child PID2857228 exit+close0/null |

All four real `server-exit.json` records satisfy the unchanged strict consumer; final identities have closeCompleted/closeFinished and equal before/after manifests. Served index/entry JS/Three.js/CSS/revision hashes match their expected bytes. Reconciliation has exact identity equality, no missing/extra/duplicate cases, no incomplete cases and exactly one retry0 result per smoke case. Actual production-child exit AND close telemetry is not replaced by shell polling or process absence.

At **2026-11-15 10:01:03 UTC**, direct `/proc/<pid>/stat` readback checked338 retained PID/startTicks identities, including zombie detection: none remain. Reserved ports5291/5292/5293 have no listeners or TCP records. All four owned TMPDIRs are absent. No emergency termination/reaping occurred. Initial intermediate TIME_WAIT records (state06/inode0) were not listeners. See `RUN/verification.json`, per-lane completion records and process JSONL. The browser lane is available immediately.

## All66 actual smoke results

| Frozen case      | Chromium | Firefox |
| ---------------- | -------- | ------- |
| Q1.image.D       | fail     | fail    |
| Q1.image.N       | fail     | fail    |
| Q1.model.D       | pass     | pass    |
| Q1.model.N       | pass     | pass    |
| Q1.shape.D       | fail     | fail    |
| Q1.shape.N       | pass     | pass    |
| Q1.text.D        | fail     | fail    |
| Q1.text.N        | fail     | fail    |
| Q2.N             | pass     | pass    |
| Q2.S             | pass     | pass    |
| Q3.drag.D        | fail     | fail    |
| Q3.drag.M        | pass     | pass    |
| Q3.edit.D        | pass     | pass    |
| Q3.edit.M        | pass     | pass    |
| Q4.continuity.D  | pass     | pass    |
| Q4.export.D      | pass     | pass    |
| Q5.host.D        | fail     | fail    |
| Q5.host.N        | fail     | fail    |
| Q5.late-export.D | pass     | pass    |
| Q5.late-export.N | pass     | pass    |
| Q5.project.D     | pass     | pass    |
| Q5.project.N     | pass     | pass    |
| Q6.H             | pass     | pass    |
| Q6.M             | pass     | pass    |
| Q6.R             | pass     | pass    |
| Q6.S             | pass     | pass    |
| Q7.A             | fail     | fail    |
| Q7.E             | fail     | fail    |
| Q7.H             | fail     | fail    |
| Q7.I             | fail     | fail    |
| Q7.L             | fail     | fail    |
| Q7.N             | fail     | fail    |
| Q7.X             | fail     | fail    |

Frozen reducer, importing only historical preflight prerequisites (not old smoke successes), gives **198 cells:36 pass /30 fail /33 blocked /99 not run**. Baseline WebKit33 remains blocked by missing `libwoff2dec.so.1.0.2`, with no new launch/install/OS repair. Every final cell remains not run. Re-running the reducer offline preserved matrix and append-only ledger hashes exactly:

- `matrix-198.json`: `b4ab0403e5adf40dc7d0b26583cdaa82550a2d23dd29de53c4f8024f40544fa5`
- `ledger-198.jsonl`: `2c282a8e8584a927151644b59953188f6bd2bf52beff5214ad5e72ca69902956`

## Failure classifications and historical comparison

Full actual errors/stacks/attachments, old a02 outcomes and current diagnostics survive in `RUN/analysis.json`, plus original per-case reports/telemetry. All1171 entries in the original historical evidence manifest were freshly verified unchanged.

- **Quality-budget failures retained:** Q1.shape.D and Q1.text.D/N fail the original18s meaningful-preview occupancy/colors/entropy assertion on both engines. Sparse pixels/local-font loading do not prove missing rendering or fonts. No thresholds or source settings were changed.
- **Interaction behavior retained:** Q3.drag.D and Q5.host.D/N fail on both engines as before. The latter still exposes one role=status during Help where zero is required; later resume/latest-notice assertions remain unreached, not passed.
- **Q7 supplemental policy failures retained:** all seven states on both engines fail the frozen named-main/navigation policy. Actual main is unnamed and Editor tasks is a named **group**, not a navigation landmark. Closed-picker missing aria-controls targets also survive in `Q7.*-dom.json`; no duplicates/IDREF finding is erased by the earlier failing semantic assertion. These are supplemental policy findings, not invented axe violations or a claim of WCAG failure/conformance.
- **Newly exposed reviewed-harness image-cancel failure:** Q1.image.D/N change historical pass→fail on both engines at `assertImageCancel`, `repair-contracts.mjs:314`, expected `after.invitation === true`, actual false. Importantly, before.invitation is already false; before/after preserve image sourceType/settings, zero files/replacements/alerts and the same image-drop prompt. Artwork screenshot hashes differ; this alone does not prove source replacement because preview timing/overlays are not held constant. Preserve these four actual failures as an unresolved reviewed assertion/contract mismatch requiring separate triage, **not an application regression proven by unchanged dist**, and not a pass. Later return-to-cube actions are unreached.
- **Firefox structured-console repair now exercised:** Q5.late-export.D/N change historical fail→pass. Actual Firefox console text is still `[BitmapForge] Export error: Error`, but structured Error arguments carry exact `QA_INJECTED_APNG_DOWNLOAD_FAILURE`, expected operation and caught prefix. Both engines record one targeted throw, full externally observed progress, restoration before diagnostics/recovery, correct alert/busy/download/artwork/settings assertions. Historical string-only telemetry failures remain retained; these new passes prove the accepted instrumentation contract, not an application fix. Exact encoder start/end was not instrumented; timings are DOM progress plus post-encoding URL boundary only.
- All66 current case diagnostics have empty unexpected-error arrays: no newly unwhitelisted console/pageerror/requestfailed/non-2xx failure. Exact expected injected errors and all warnings remain in raw events, not discarded. This does not make failed assertions pass.

## H1: exact desktop-collapse Q3 phase, without new instrumentation

Both existing `Q3.drag.D` failure traces were opened and their actual runner before/after records extracted into `RUN/analysis.json` → `H1`:

1. Pickup, ArrowRight, first Escape, unpressed assertion, handle-focus assertion and original-order assertion complete.
2. Desktop aside visible; another pickup/ArrowRight; Motion→Look retirement and order assertions complete.
3. Focus handle2; Space; real **Collapse settings** click at contracts.mjs:310 completes; real **Expand settings** click at311 completes.
4. The next assertion at312 fails after5000ms: current role locator repeatedly resolves `Reorder color 2` with `aria-pressed="true"` (eight observations in each engine). This is **after successful collapse and reveal**, not a launch, reveal-click or initial Escape failure. The subsequent order assertion at313 is unreached.

Trace paths: `baseline/smoke/<engine>/a01/results/ui-smoke-Q3-drag-D-<engine>/trace.zip`; corresponding `test-failed-1.png`, error-context and diagnostics/Q3.drag.D.json are retained. The Chromium screenshot was visually inspected: expanded desktop Look inspector and four palette handles are visible. Pressed/focus facts come from telemetry, not appearance. No stale-handle root cause, node-identity conclusion or production fix is inferred from this evidence.

## Meaningful APNG and accessibility evidence

Both Q4.export.D cases pass complete original384×320 APNG decoding:181frames,62ms per encoded frame,11222ms total encoded delay, loop numPlays0 and frame variation. Saved defaults determine the unchanged show-phase mapping; selected index41 is inside indices41–140, not merely any nonblank fade frame.

| Engine   | Show-frame index | Non-background ratio | RGB colors |            Entropy |
| -------- | ---------------: | -------------------: | ---------: | -----------------: |
| Chromium |               41 |         0.1833984375 |         50 | 1.2333067217989542 |
| Firefox  |               41 |      0.1834716796875 |         46 | 1.2323454408378742 |

Real downloaded PNG/APNG bytes, saved settings, geometry, per-frame hashes/metrics/delays, timingContract, show-phase selection and decoded frame are retained under each smoke output's downloads/, diagnostics/Q4.export.D-{apng,show-phase}.json and screenshots/Q4.export.D-decoded-apng.png. Both decoded screenshots were visually inspected: a substantial green dithered cube silhouette on a dark background, not a blank frame. A single screenshot does not itself prove animation; decoded frame hashes supply that evidence.

Fourteen actual axe4.14.0 scans completed, all with zero reported violations and identical69-rule expanded manifests. Every incomplete node remains **manual-unverified**, with target/HTML/failure details retained in full scan JSON and summarized in analysis.json. Incomplete rule families are aria-prohibited-attr, color-contrast, aria-hidden-focus, aria-valid-attr-value and label-content-name-mismatch; their state-specific counts are not flattened into passes. Q7 remains failed on the separate supplemental contracts. No AT, physical Safari/mobile, actual zoom or conformance claim follows.

## Evidence inventory and reproducibility

**788 actual files in RUN, including manifest;787 manifest entries**, all read back by bytes/SHA256. Manifest SHA256 `764edf81bc344186de178a4076c61ce16c16d185eb04d1adb8cccf710d309455`. There are226 physical PNG files across screenshots, failure attachments and HTML-report copies,30 runner failure trace ZIPs,48 retained download files and14 full axe scans. Physical screenshot/report-copy counts are not unique-state coverage counts. Both successful preflights retain their screenshots/meaningful/WebGL/process diagnostics and zero traces under the unchanged retain-on-failure policy.

All30 failure traces pass ZIP CRC and contain actual navigation/frame snapshots; original assertion failures are retained. No extra intentional-failure probe or successful-run trace was fabricated. Required representative screenshots and automatic failure attachments remain under each output/screenshots and results; report.json and report/index.html provide links. `analysis.json` includes all66 rows, old comparisons, full unexpected-error inventory, all scan incompletes, APNG evidence and extracted H1 actions. `verification.json` is the final identity/cleanup/idempotence readback. `evidence-summary.json` is the frozen summarizer's supplemental view; the final complete inventory is evidence-sha256.json.

External scripts created under profile scratch: `qa-baseline-post-lifecycle-run.py`, `qa-baseline-post-lifecycle-analyze.py`, `qa-baseline-post-lifecycle-verify.py`. Analyze/verify commands exited0; the browser collector is one-shot evidence, **not permission to rerun it**. Only this repository document was authored. No existing evidence was rewritten and no application, harness, dependency, build, lifecycle or acceptance-contract bytes were edited.

Final comparison, broader built/source/ASCII/CLI artifact gates, R04 destructive follow-up and manual platform/accessibility gaps remain separately unresolved. No production/PR/merge/deployment/issue transition is authorized.
