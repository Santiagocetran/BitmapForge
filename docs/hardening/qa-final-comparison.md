# Matching final built-target QA comparison

## Outcome and release

**Completed the authorized final 33-case Chromium and 33-case Firefox lanes, once each, serially. Final: Chromium 20 pass / 13 fail; Firefox 20 pass / 13 fail. Both fresh same-engine preflights passed. Browser lane released; no owned processes or listeners remain.**

Against the matching frozen baseline (18 pass / 15 fail per engine), the only outcome changes are **Q5.host.D/N fail→pass in both engines**, confirming the bounded H2 Help/notice behavior through real Save/Load UI producers. **Zero pass→fail regressions were observed in these matched cases.** All 26 surviving final failures remain failures, not waivers or readiness clearance. H1 reproduces unchanged. No application, harness, case, threshold, dependency, build or OS changes, installs, adaptive fixes, retries or force-passes occurred.

- `QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`
- `BASELINE=QA/runs/baseline-post-lifecycle-20261115T094529Z`
- `RUN=QA/runs/final-comparison-20261115T100646Z`
- Final immutable app: `/home/agent/BitmapForge-hardening-research/integrated-candidate/dist`.
- Actual outputs: `RUN/final/{preflight,smoke}/{chromium,firefox}/a01`.

**R04 actual during-close remains BLOCKED_UNOBSERVED_WINDOW**, a named separately authorized destructive-lifecycle follow-up. Ordinary clean shutdown below does not clear the complete destructive matrix. WebKit, manual AT, physical Safari/mobile/touch and actual browser-menu zoom remain blocked/unverified. No full-accessibility, conformance, production-ready, release, PR, merge or deployment claim follows.

## Identity and execution contract

- Frozen harness digest **`4963e730deebf362202696610f6d3e38ec85af89a5f1730929f0d1fa0d5bbe42`**, all 33 harness entries unchanged. Lifecycle freeze `8dffea64d1cee4ff71e88207ba656c7a01b5a83487de64f2a67c8826017f3576` and all 19 named file hashes verified before launch.
- Base Git SHA `550842cab61002c7cc6563e50b9fcdeb17c9bf01` **plus dirty diff SHA256 `4dc41a48f938a0672fa8da6ce5b005c6b0e7fb2e53fa646fd8f119fb2413cca5`**. Current literal binary diff equals the parent's retained `integrated-candidate/source.diff`; all 170 harness-inventoried operational source/dependency entries agree with the retained baseline-stage working-source snapshot and remain unchanged through final execution. This is the integrated B+H2 working source, not historical clean baseline source. New documents are not used as operational drift. Parent `verification.json` and complete `build-hashes.json` are preserved by reference and copied as identity fields in `RUN/source-identity.json`.
- All **35 final dist paths** exactly match the parent's supplied dist hash set; no missing/extra path. Inventory digest **`4ea49255cdfde9f5a9eaedb7cc81d9e276e6babbcfec60d2326c27409026654e`**, using sorted relative-path map to `{bytes,sha256}` and compact JSON as in the baseline. Baseline's separate 37-file immutable inventory remains `a812c217b11c630e42c9e53f167bdf566d28fdb9fb10794c0fd2299b3fbbcec7`.
- **No final `ci-revision.txt` was invented.** Final has no provenance marker. Its exact supplied build bytes and dirty-base+diff identity are used; baseline's historical CI marker is not attributed to final.
- Node **24.22.3**, npm **11.21.2**, locked Playwright **1.59.1**. Node: `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`. Lock SHA256 `bac330dd2d654f5ee0d08a2d0e97ba68829c4568c1df998372f34e5ab8b399ca`.
- Final Chromium cache is the tooling-created fresh cache `/home/agent/.hermes/profiles/gloin/cache/scratch/tooling-b-browser-execution/chromium-cache`, reused read-only, **not** the baseline cache. Existing `browser-install.log` records real downloads; the retained `run.py` checks cache absence before installation. Both files' hashes are pinned in `source-identity.json`; no new installation was run. Actual observed headless-shell revision1217 executable SHA256 **`22d72b589f908111fa29ff4e61ead8a0601e925177f59c70e2e851c22e9b1886`**, browser version **147.0.7727.15**. The full-Chrome API executable is not mistaken for the launched shell.
- Firefox uses the unchanged isolated `QA/browsers/pw-1.59.1` cache: actual firefox1511 executable SHA256 **`4c6cc6e27feb99dcc6420bbdca0acacf75c6d5e11f9139bd7dc31752b2431391`**, version **148.0.2**.
- Cube: 1577 bytes, SHA256 `4d2d98182b4b93e8b45e881b1f92838b7e951ab246bb73f81663b3e3f5bef708`.

Frozen cases, geometry exceptions, meaningful-pixel/color/entropy floors, default animation, 90-second tests, zero retries, worker1, original 30-second launch bound/Chromium flags, fresh contexts, locale/timezone/motion and runner-owned retain-on-failure tracing are unchanged. Final strictly owns `127.0.0.1:5292`, no server reuse. Each attempt used a separate short profile-scratch TMPDIR, inventoried and removed only after process absence.

Served-byte readback in all four actual attempts matches the complete immutable manifest for requested index/entry JS/Three.js/CSS:

| URL                          | Expected = actual SHA256                                           |
| ---------------------------- | ------------------------------------------------------------------ |
| `/index.html`                | `965f2c4464700ebaf0d32daef309fb2bfaeb67378be2de8fddd44c55ca73b84e` |
| `/assets/index-FwLXpL6D.js`  | `3f24fc8cc1ff2e56e818c6b1a8f908f69c9086e0085e62a3a2a9d2892ab99310` |
| `/assets/three-DDsitln8.js`  | `c142babe52ad596d6f6add94e92d5d4c03615212fd302b07b8349461ec0e61a7` |
| `/assets/index-DOJMVuZp.css` | `98df59e486ea6ca3f142e2ccb5379b5f1958822318acd28a9f4b23ab73e10fa2` |

## Actual commands, results and strict cleanup

One-shot collector, executed from `/home/agent`:

```sh
python3 /home/agent/.hermes/profiles/gloin/cache/scratch/qa-final-comparison-run.py
```

It invokes the unchanged `NODE QA/harness/run.mjs`, explicitly setting final phase, literal immutable dist, engine/cache, owned5292, lane, a01, frozen harness hash and short TMPDIR. Full replayable runner commands, launch environment, discovery, stdout/stderr and process observations are retained per attempt. Execution order: Chromium preflight → Chromium33 → Firefox preflight → Firefox33.

| Actual lane        | Discovered / reported | Exit | Strict completion                            |
| ------------------ | --------------------- | ---: | -------------------------------------------- |
| Chromium preflight | 1 / 1                 |    0 | clean                                        |
| Chromium smoke     | 33 / 33               |    1 | actual child PID2888253 exit AND close0/null |
| Firefox preflight  | 1 / 1                 |    0 | clean                                        |
| Firefox smoke      | 33 / 33               |    1 | actual child PID2897916 exit AND close0/null |

Both smoke exit1 results are real assertion failures. Outer collector exit0 means evidence collection completed, not that smoke passed. Every discovered case has exactly one result at retry0; no missing, extra, duplicate or incomplete cases. The four real `server-exit.json` records satisfy the unchanged strict consumer; identities record closeCompleted/closeFinished and equal before/after dist manifests.

At **2026-11-15 10:22:13 UTC**, direct `/proc/<pid>/stat` readback checked **316 retained PID/startTicks identities including zombies: none remain**. All four owned TMPDIRs are absent; no emergency reaping occurred. Ports5291/5292/5293 have no listeners. The one then-retained TCP state06/inode0 record is TIME_WAIT, not a listener. See `RUN/verification.json`, `completion.json`, per-lane completion files and process JSONL. Browser resource ownership is released immediately; no final browser process is kept for review.

## Complete paired matrix and per-case deltas

Programmatic reduction/readback yields:

| Phase        |   Pass |   Fail | Blocked | Not run |   Total |
| ------------ | -----: | -----: | ------: | ------: | ------: |
| Baseline     |     36 |     30 |      33 |       0 |      99 |
| Final        |     40 |     26 |      33 |       0 |      99 |
| **Combined** | **76** | **56** |  **66** |   **0** | **198** |

There are **99 exact engine/case pairs**:36 pass→pass,26 fail→fail,4 fail→pass,33 blocked→blocked, **zero pass→fail**. All 66 WebKit cells are **unexecuted/prerequisite-blocked**, not successful executions. Baseline actual missing-`libwoff2dec.so.1.0.2` launch evidence is linked into final's explicit inherited environmental classification. No new WebKit launch/install/OS repair was attempted.

The frozen final-only reducer is retained unchanged: it does not import old baseline smoke results and naturally leaves final WebKit not run without a new final preflight. **`paired-matrix-198.json` / `paired-ledger-198.jsonl` are the authoritative complete comparison**, merging the exact real baseline and final phase rows, with final WebKit explicitly classified blocked and `executed:false`, no fabricated final runtime result. `paired-per-case.json` contains all99 pairs and evidence pointers. Original per-attempt append-only ledgers and frozen reducer outputs remain untouched and idempotence-verified.

| Frozen case      | Chromium baseline→final | Firefox baseline→final |
| ---------------- | ----------------------- | ---------------------- |
| Q1.image.D       | fail→fail               | fail→fail              |
| Q1.image.N       | fail→fail               | fail→fail              |
| Q1.model.D       | pass→pass               | pass→pass              |
| Q1.model.N       | pass→pass               | pass→pass              |
| Q1.shape.D       | fail→fail               | fail→fail              |
| Q1.shape.N       | pass→pass               | pass→pass              |
| Q1.text.D        | fail→fail               | fail→fail              |
| Q1.text.N        | fail→fail               | fail→fail              |
| Q2.N             | pass→pass               | pass→pass              |
| Q2.S             | pass→pass               | pass→pass              |
| Q3.drag.D        | fail→fail               | fail→fail              |
| Q3.drag.M        | pass→pass               | pass→pass              |
| Q3.edit.D        | pass→pass               | pass→pass              |
| Q3.edit.M        | pass→pass               | pass→pass              |
| Q4.continuity.D  | pass→pass               | pass→pass              |
| Q4.export.D      | pass→pass               | pass→pass              |
| Q5.host.D        | fail→pass               | fail→pass              |
| Q5.host.N        | fail→pass               | fail→pass              |
| Q5.late-export.D | pass→pass               | pass→pass              |
| Q5.late-export.N | pass→pass               | pass→pass              |
| Q5.project.D     | pass→pass               | pass→pass              |
| Q5.project.N     | pass→pass               | pass→pass              |
| Q6.H             | pass→pass               | pass→pass              |
| Q6.M             | pass→pass               | pass→pass              |
| Q6.R             | pass→pass               | pass→pass              |
| Q6.S             | pass→pass               | pass→pass              |
| Q7.A             | fail→fail               | fail→fail              |
| Q7.E             | fail→fail               | fail→fail              |
| Q7.H             | fail→fail               | fail→fail              |
| Q7.I             | fail→fail               | fail→fail              |
| Q7.L             | fail→fail               | fail→fail              |
| Q7.N             | fail→fail               | fail→fail              |
| Q7.X             | fail→fail               | fail→fail              |

## H2: actual Q5 result, not just units

All four final Q5.host.D/N cases pass after the matching baseline failed while a populated notice remained role-accessible during Help. Each real final case retains nine checkpoints and executes two Help cycles:

1. Real Save produces exact **`Project saved as .bitmapforge file.`**. Responsive host moves preserve the same notice node, single textual owner and no unchanged-content text/child mutations.
2. Help opens; zero default-role status owners, same retained node/text, native wrapper **hidden=true and inert=true**, no text/child mutations while suspended. Escape dismisses Help and exact current notice resumes on that node.
3. Real saved-project chooser/load produces **`Project loaded.`**; old saved text is absent. Repeat Help hiding/retention and resume exact latest text, same node, single owner.

Diagnostics `Q5.host.{D,N}-notice-mutations.json` preserve all ancestors/checkpoints and the two legitimate child-list mutations during actual saved→loaded producer transition; those are not mislabeled unwanted resize/Help mutations. `comparison-analysis.json` → `H2Summary` programmatically checks both cycles in all four cases. This proves the frozen success-notice DOM/UI contract, not AT announcements, every populated-error variant, or full H2 browser/assistive-technology coverage. Baseline failures and their unreached later assertions remain intact.

## Surviving baseline failures, not new regressions

- **Q1.shape.D and Q1.text.D/N:** original18s meaningful-preview occupancy/colors/entropy gate still fails in both engines. Sparse real pixels and shipped local font loading are not evidence of a missing font or wholly blank rendering. No floor was lowered.
- **Q1.image.D/N:** same reviewed image-cancel assertion mismatch on both engines, `assertImageCancel` at repair-contracts.mjs:314, expected invitation=true although **before.invitation is already false** and after remains false. SourceType/settings, zero files/replacements/alerts and image-drop prompt remain preserved. Final screenshots are sometimes identical, sometimes differ; timing/overlays do not prove artwork replacement. Keep the four failures unresolved; do not count them as a demonstrated new app regression or convert them to passes. Later return-to-cube actions are unreached.
- **H1 Q3.drag.D:** final traces reproduce the same phase on both engines. Initial pickup/ArrowRight/first Escape/order/focus and task-hide retirement complete. New pickup, real **Collapse settings** and **Expand settings** clicks complete; then contracts.mjs:312 observes `Reorder color 2` still `aria-pressed="true"` eight times over5000ms. The subsequent order assertion is unreached. This is not a reveal-click/launch failure and does not establish a stale-node root cause. Baseline and final trace actions are paired under `comparison-analysis.json` → `H1`; no H1 repair occurred.
- **Q7 all seven states, both engines:** unchanged named-main/navigation supplemental policy fails. Actual main is unnamed; Editor tasks is a named **group**, not navigation. Closed-picker missing aria-controls targets and all DOM evidence remain retained despite earlier semantic failure. These are frozen policy findings, not fabricated axe violations or WCAG conclusions.
- **Q5.late-export.D/N:** remain passes in both engines under the exact structured-console sentinel policy; real capture/encoding precedes targeted APNG download failure. Full progress/timing, restore-before-diagnostics/recovery, exact alert/busy/download/artwork/settings assertions remain retained. These are injected-failure recovery tests, not normal successful APNG outputs. Internal encoder timing is not separately instrumented.

All66 final case diagnostics contain **zero unexpected-error records**. Raw warnings and exact expected injected console errors remain recorded, not blanket-whitelisted. Zero unexpected errors does not clear failed assertions. No new failure family or pass→fail delta was observed; all26 final failure traces were newly collected and retained.

## APNG, axe and representative screenshots

Both real Q4.export.D downloads pass complete default APNG decoding:384×320,181frames,62ms each,11222ms encoded total delay, loop numPlays0 and frame variation. Actual saved settings yield show indices41–140; selected index41 is a meaningful **show-phase** frame, not a fade-only substitute.

| Engine   | Show index | Non-background ratio | RGB colors |            Entropy |
| -------- | ---------: | -------------------: | ---------: | -----------------: |
| Chromium |         41 |         0.1833984375 |         50 | 1.2333067217989542 |
| Firefox  |         41 |      0.1834716796875 |         46 | 1.2323454408378742 |

Real APNG bytes, settings, full frame hashes/delays/metrics, geometry/timingContract, phase selection and decoded stills remain in downloads/, diagnostics/Q4.export.D-{apng,show-phase}.json and screenshots/Q4.export.D-decoded-apng.png. Both final decoded stills were visually inspected: substantial green dithered cube-like silhouettes on dark backgrounds. Motion is established by decoded frame variation, not the still alone.

All14 final axe4.14.0 scans completed with zero reported violations; each expanded69-rule manifest equals its matching baseline manifest. **Every incomplete remains manual-unverified**, with original node targets/HTML/failure details preserved. Families: aria-prohibited-attr, color-contrast, aria-hidden-focus, aria-valid-attr-value, label-content-name-mismatch. `comparison-analysis.json` retains full scans and state-specific node counts. Q7 supplemental assertions still fail. No screen-reader, virtual-cursor or WCAG conformance claim follows.

`RUN/representative-screenshot-pairs.json` indexes **28 actual before/after pairs**, with dimensions/bytes/hashes; engine screenshot inventories retain every screenshot. Matching states include desktop empty/loaded, narrow Source, minimum invalid-picker focus, selected Export, narrow Help, active project error, short focused Close, DPR2, reduced motion, decoded APNG and H1 failure. Populated H2 saved-notice baseline failure is explicitly paired with final saved-notice Help; final latest-loaded Help is retained separately. Baseline narrow Help still visibly exposes the saved notice under the dimmed sheet; final hides it. The empty Q7 Help screenshots look unchanged and are not substituted for populated Q5 proof. Final H1 screenshot shows expanded Look inspector/four palette handles; pressed-state facts come from trace/telemetry.

## Evidence ledger and reproducibility

Offline analysis and readback executed exit0:

```sh
python3 /home/agent/.hermes/profiles/gloin/cache/scratch/qa-final-comparison-analyze.py
python3 /home/agent/.hermes/profiles/gloin/cache/scratch/qa-final-comparison-evidence.py
```

These scripts are external to the frozen harness; the browser collector is one-shot and is **not permission to rerun**. They preserve exact real reconciliation evidence, validate99 paired identities/198 unique cells, strict lifecycle/readback, original failures, real trace ZIP CRC/content and historical immutability. Literal frozen reducer matrix/append-only ledger hashes remain identical on offline rerun. All787 matching-baseline and1171 original historical manifest entries were freshly verified unchanged.

| Artifact in RUN           | SHA256                                                             |
| ------------------------- | ------------------------------------------------------------------ |
| `paired-matrix-198.json`  | `c81764abaa14a7d4e4005c046c8f5e46b61669713b72b1ffcbc4167252b0cf6b` |
| `paired-ledger-198.jsonl` | `f3cf2da3599ab9254126a125e55d8febceafc7ae2833b850b08ee7bcf0f3c826` |
| `paired-per-case.json`    | `e42bbff97fbc17ecf22fe47393652a3bf5aecf5e37aeb5ca70209dd35fea80ac` |
| `evidence-sha256.json`    | `363fab2147f43a3c49144f7755b6203e2fff0013361bc4a870167917915ef4df` |

**777 actual RUN files including manifest,776 manifest entries**, all read back by bytes/SHA256. There are224 physical PNGs including report copies,26 runner failure trace ZIPs,48 retained download files and14 full axe scans. Physical file counts are not unique-state coverage counts. All26 traces pass ZIP CRC and contain actual navigation/frame snapshots; original errors/attachments survive. Successful preflights/Q5 cases retain zero traces under unchanged retain-on-failure policy, not missing promised successful traces.

Only this repository report was authored; external collector/analyzer/evidence scripts and new RUN artifacts were created in profile scratch. A proposed montage helper failed before writing because this Python has no PIL; no install/substitution was made, and original individual screenshots plus hash/dimension inventories were used instead. No existing evidence was rewritten. Broader built/source/ASCII/CLI artifacts, manual platforms/AT, complete destructive lifecycle and release policy remain separate gates. No remote actions were taken.
