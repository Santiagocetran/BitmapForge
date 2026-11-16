# External QA baseline implementation handoff

## Scope and current gate

Implemented an **external, review-pending** QA harness for the independently accepted `qa-plan.md` (SHA-256 `e16077ff9230c40e278e523b16c599447f4a8d84e9421a4440473a6f3e603396`). This is implementation evidence, not harness acceptance or release approval. The only QA-owned repository change is this document. Application code, existing specs/helpers, manifests, lockfiles, dependency sources and hosted CI were not edited by QA. Concurrent CLI-owner changes are separate and are visible in the recorded dirty status.

External root (`QA`): `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`.

- Executable harness: `QA/harness/` (ESM, absolute imports of repository-locked Playwright **1.59.1**, UPNG and JSZip resolution contract).
- Baseline launcher: `QA/baseline.sh`; every invocation requires engine, lane and a new attempt ID. It supplies explicit baseline-only identity/origin/cache fields. It does not authorize a final phase.
- Evidence run (`RUN`): `QA/runs/baseline-550842c-stage1`.
- Durable checkpoint: `QA/CHECKPOINT.md`.
- Reducer: `QA/harness/reduce.mjs`; inventory contains exactly **33 frozen IDs × 3 engines × 2 phases = 198 cells**. Unrun final cells remain not run. Preflight, diagnostic fault probe and inherited suites are separate ledgers.

## Implemented behavior

Frozen Q1–Q7 declarations, independent runner contexts, 90-second outer budgets, zero retries, one worker, runner-owned retain-on-failure tracing, failure screenshots, event/transport/chooser/download logging, diagnostic cleanup, geometry/pixel measurements, retained APNG download and UPNG decode/frame metrics, isolated pinned axe scans and supplemental DOM checks. The exact coverage remains subject to independent implementation review against the accepted case contracts; declaring an ID does not establish all assertions passed.

Strict-port built preview serves immutable `/home/agent/BitmapForge-hardening-research/baseline/dist`; verifies `ci-revision.txt`, every supplied `ci-sha256sums.txt` entry, and actual index/JS/CSS served bytes. Server PID and before/after manifests are retained per attempt. Built telemetry rejects `/src/` and `/@vite/` responses. Relevant source/dependency hashes are recorded before/after, and historical source/lock equality is required before baseline source/ASCII execution. Inherited configs select the exact accepted specs, without editing their imported test objects or adding fictional rich telemetry. ASCII retains its accepted suite-owned ephemeral host/cleanup limits.

## Prerequisites actually exercised

- Paired toolchain: Node **24.22.3**, npm **11.21.2**, absolute tool paths retained in each environment file. No NPX Playwright fallback.
- **Chromium parent handoff only**: `QA/browsers/parent-baseline-pw-1.59.1`. Parent supplied successful fresh locked install and launch; QA treated it read-only. QA preflight a01 and a02 independently launched Chromium **147.0.7727.15**, verified WebGL and meaningful built cube output. a02 additionally records live `/proc` engine executable/argv/hash, expected locked revision and version.
- **QA-owned isolated Firefox/WebKit**: `QA/browsers/pw-1.59.1`; locked CLI `install firefox webkit` exited **0**, installing Firefox1511, WebKit2272 and FFmpeg1011. Log: `QA/provision/firefox-webkit.log`.
- Firefox a01 preflight passed built cube/WebGL. WebKit a01 launch is **blocked** by missing native `libwoff2dec.so.1.0.2`; diagnostics retained, no sudo/OS package install/alternate engine/flags attempted. All 33 baseline WebKit smoke cells are prerequisite-blocked.
- Isolated **axe-core4.14.0**, `--ignore-scripts --no-audit --no-fund --save-exact`; official version metadata/tarball SRI and isolated installed lock verified. Supplier records/archive/hash: `QA/provision/axe-*`; manifest/lock/module: `QA/harness/tooling/axe/`. App manifests/lock remain unchanged by QA. Provenance signatures are **not independently verified**.

## Executed first complete smoke (implementation shakeout)

`bash QA/baseline.sh chromium smoke a01` exited **1**: discovery/report reconciliation **33/33**, **13 passed / 20 failed**, no dropped cases. Evidence: `RUN/baseline/smoke/chromium/a01/` with command, environment, discovery, inventory, JSON/HTML report, append-only ledger, reconciliation, server identity, diagnostics, screenshots, downloads and failure traces.

- Seven actual axe scans all completed with **zero reported violations**, identical **69-rule expanded manifests**, and retained incompletes (contrast/ARIA/name-related needs-review). This does **not** pass Q7: supplemental DOM assertions retain unresolved missing closed-picker `aria-controls` targets. Do not suppress these baseline findings or count incompletes as manually verified.
- Q1 model D/N and image D/N, narrow Sphere, Q2 N/S, modal keyboard drag, format continuity, normal bounded APNG and both late post-encoding APNG failure cases passed their implemented first-attempt assertions.
- Retained APNG: **384×320**, **181 frames**, **62 ms/frame**, **11,222 ms total encoded delay**, frame variation and meaningful decoded frames. Real bytes and a decoded meaningful frame remain in downloads/screenshots. This is bounded workload evidence, not large-export performance certification.
- Desktop Sphere and Text D/N failed the unchanged 18-second meaningful-frame criterion; actual text screenshot was blank at the captured instant despite successful local Helvetiker chunk identity/loading. No font shim, scene mutation or threshold reduction was used.
- Desktop drag cancellation after collapse/reveal retained a pressed handle and failed. This remains a baseline behavior finding requiring triage, not an authorized application repair.
- First-attempt harness mismatches were retained and corrected in the external harness: distinguish inert/accessibility-hidden Help/background from CSS visibility; loaded-project completion can become `Model loaded.`; scroll the actual last palette handle rather than require an irrelevant exact scrollbar endpoint; physically exposed Export task for minimum-width picker hide; scroll to reachable Export action; explicitly establish reduced-motion emulation. Pixel samples now survive failure; saved palette values are asserted; late-export progress records distinguish externally observed progress from the post-encoding URL boundary. These are implementation corrections, not changes to frozen IDs, viewport/animation/entropy/budgets/trace policy. A new complete baseline attempt is required, and the prior failures remain evidence.

## Completed bounded a02 handoff — browser slot released

The requested bounded queue is finished. **No broad browser suite expansion was started**, following the parent's slot-release instruction. All owned contexts/servers are closed: live readback at **2026-11-15 04:54 UTC** found no listeners on5291/5292/5293 and no processes executing from either QA browser cache.

Frozen a02 harness SHA-256: `4e749ad91dab7e973bc595766d9fc072bd2fa89e9e3c11c986514a601cd64aa3` (exact per-file map in each a02 environment). Both complete smoke attempts recorded `harnessUnchanged:true`, `sourceUnchanged:true`, immutable dist manifests unchanged and served-byte identity matches.

| Actual lane                          | Exit       | Reconciled outcome                                                                          |
| ------------------------------------ | ---------- | ------------------------------------------------------------------------------------------- |
| Chromium preflight a02               | 0          | actual147.0.7727.15, locked revision/executable, WebGL and meaningful built cube pass       |
| Firefox preflight a02                | 0          | actual148.0.2, locked revision/executable, WebGL and meaningful built cube pass             |
| Chromium smoke a02                   | 1          | **33/33; 20 pass, 13 fail**                                                                 |
| Firefox smoke a02                    | 1          | **33/33; 18 pass, 15 fail**                                                                 |
| WebKit preflight a01                 | 1          | native-library launch **blocked**; no smoke launch attempted                                |
| WebKit smoke discovery-only          | 0          | 33 discovered, **not executed**, propagated prerequisite block                              |
| Intentional Chromium trace probe a02 | 1 expected | original sentinel failure retained; not a product pass                                      |
| Offline trace inspection             | 0          | ZIP CRC valid; original error, actual navigation/app requests and39 frame snapshots present |

Latest **198-cell** reduction: **38 pass / 28 fail / 33 blocked / 99 not run**. All99 final cells are not run. Both a01 and a02 remain in the append-only ledger; a02 does not erase the original13-pass/20-fail Chromium attempt. Paths under `RUN`: `matrix-198.json`, `ledger-198.jsonl`, `evidence-summary.json`, `evidence-sha256.json` (1,171 retained files hashed at this checkpoint). JSON/HTML reports, full scan results/rule inventories/incomplete dispositions, screenshots, retained downloads, pixel samples, timings and failure traces remain in their attempt directories.

Persistent a02 failures on both engines: Q7 supplemental IDREF contracts (not invented axe/WCAG violations), desktop Sphere and Text D/N below the frozen meaningful-frame floor, desktop keyboard drag after collapse/reveal, and Q5.host D/N status still accessible during Help. Sparse Shape/Text pixels do exist in samples; these failures do **not** prove absence of all rendering. Q5.host's later latest-notice resume actions remain unreached after its failed hiding prerequisite and are not claimed verified.

Firefox has two additional **harness telemetry** failures in Q5.late-export D/N: Firefox formats the caught console call as `[BitmapForge] Export error: Error`, omitting the sentinel from `ConsoleMessage.text()`. UI/injection/recovery assertions completed, but the strict string-only error whitelist correctly left that console call unexpected. Preserve both failures; review structured Error-argument capture to match only the exact sentinel/operation, not a blanket allowance. No repair/rerun was silently substituted.

Detailed implementation-review gaps and review order: `QA/IMPLEMENTATION-REVIEW.md`. In particular, the current APNG assertion proves meaningful content somewhere in the full decoded loop but still needs an explicit show-phase assertion; post-cancel Image preservation, actual-background-action backdrop negatives, exact latest-notice wording, prerequisite reducer precedence and scanner-timeout/server-exit telemetry require independent review. **This is a working bounded implementation stage, not full accepted Q1–Q7 implementation/acceptance.** Any reviewed harness repair requires a new baseline attempt/hash before final comparison.

Broader configs were only exercised with `--list`: **10 built, 62 source UI, 4 ASCII tests discovered**, all explicitly not run. Their complete discovered identities and commands are retained under each lane's `discovery-only` directory. Actual broad baseline runs are deferred to the parent after independent harness review and CLI's serial slot; no final phase has run.

## Exact remaining commands

```sh
QA=/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa
NODE24=/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node
# New attempt IDs required; preserve previous results.
bash "$QA/baseline.sh" chromium smoke a03
bash "$QA/baseline.sh" firefox smoke a03
bash "$QA/baseline.sh" chromium built-chromium a01
bash "$QA/baseline.sh" chromium source-chromium a01
bash "$QA/baseline.sh" chromium ascii-chromium a01
"$NODE24" "$QA/harness/reduce.mjs" "$QA/runs/baseline-550842c-stage1"
"$NODE24" "$QA/harness/summarize.mjs" "$QA/runs/baseline-550842c-stage1"
```

The QA queue is stopped and browser slot released; resume only after the parent releases CLI's slot and independently reviews the harness. The inherited built lane is `export.visual.spec.js` plus `redesign-artifacts.spec.js`; source UI is `foundation.spec.js`, `ui-foundations.spec.js`, `palette.spec.js` at isolated strict5293; ASCII selects only `ascii-generated.spec.js`, no harness webServer, suite-owned host/cache and destructive afterAll cleanup. Retained telemetry gaps are explicitly labeled rather than presented as empty successful event arrays.

Final execution is blocked pending the parent's accepted changed immutable build/cache handoff and independent implementation review. Final must use the same accepted harness hash, not this baseline-only launcher. No physical Safari, real mobile/touch, assistive technology, actual browser-menu zoom, deployed-byte, hosted-release or production-readiness claims follow from these results.
