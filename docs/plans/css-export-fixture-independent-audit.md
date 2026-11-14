# Independent implementation audit: CSS spatial fixture

## Verdict

**ACCEPT the bounded CSS-only fixture implementation and its full-loop artifact coverage. No code changes requested.** The binding plan's CSS implementation, repeated isolated acceptance, current-source built-suite evidence and retained-trace readability requirements are satisfied.

This is **not blanket export-suite reliability or release clearance**. The earlier unchanged APNG 90-second timeout remains an unresolved variability finding, not diagnosed or erased by the subsequent six-pass run. No precise internal Playwright archive race, production scalability fix, root/workspace completion or deployment approval is established.

## Review identity and scope

- Checkout: `gloin/ui-output-improvements`, HEAD `298bdec17dcd1603add549118a743e5cd494ba08`, already dirty. Read root governance, web-product-development skill/reliability reference, binding `css-export-fixture-plan-audit.md`, investigation and implementation report. The expected COLLAB files are absent.
- Reviewed actual repository spec, worker-entry snapshot `../css-fixture-before.spec.js`, supplied `worker-only.patch`, PreviewCanvas's observed-container ownership, base/CI/export runner configurations and external execution/artifact verification helpers.
- Applied the supplied patch to an external snapshot copy and verified that it reproduces the current spec **byte-for-byte**. Programmatic comparison of all six case bodies confirms the other **five are byte-identical**; shared `exportFormat` is byte-identical, including its existing download wait. Code ZIP's quality/resize/runtime equality assertions and trace-owner logic are unchanged.
- Only repository write by this auditor is this document. No application, test, configuration, generated output, build, reset/stash, commit, push, remote or deployment changes. New audit executions/evidence and verifier scripts are in sibling scratch outside the repository.

## Contract findings

The opt-in setup parameter is default-off and used only by CSS. Actual context remains **1280×800 / DPR 1**. Before native model upload, the helper resolves the single canvas in the named Preview region, guards the canvas → BitmapEffect wrapper → observed container hierarchy and containment, then writes only that container's inline width/height. This is the element observed by PreviewCanvas's ResizeObserver, with no padding/border affecting its checked dimensions. No direct canvas backing writes, app/store/manager hooks, pose/time/scale changes, rendering substitutes or browser instrumentation were added.

The same region-scoped preview is checked before upload, after upload/initial render, and just before export for **384×320 backing/rendered/client/container** agreement, visible canvas, desktop viewport and DPR 1. CSS controls are visible/enabled and used via ordinary clicks. Existing model loading, full default animation, live app context plus second artifact page, 3000 ms show-phase wait, 600 ms separation, both original nonblank checks, unequal buffers, CSS response/runtime errors, app errors and cleanup are preserved.

Positive checks consume the original downloaded bytes: ZIP CRC, stylesheet/referenced sprite/README, 384×320 cell declarations, 181 distinct ordered stops with exact rounded percentages/atlas coordinates, 11283.185307179585 ms loop, six-column/31-row layout, **2304×9920** CSS/decoded PNG and browser-computed size/background/duration. Evidence JSON retains actual preview, viewport/DPR, archive, loop, atlas, rendering and metrics. Full cell decoding is correctly external rather than a shared production-code oracle. Unused trailing slots are excluded; fade endpoints are not wrongly required to be nonblank.

## Built identity and independent browser verification

Evidence root: `../css-fixture-implementation-evidence/`.

- Read actual Node **20.20.2** direct Vite build log. This intentionally avoids the root prebuild's generated embed write; existing public/embed bytes are part of identity. It is app built-output acceptance, not a claim that all workspace/prebuild checks ran.
- Before and after the independent run, all recorded source/public/embed-source/package/Vite/spec hashes matched `source-before.json`; all **35** immutable build files matched `manifest.json`. No runtime-source changes were present. The unrelated ongoing chooser-harness file is outside this CSS/runtime identity.
- Build manifest SHA-256: `4bf59bfef86ab97eba9b2a956a3e7bff3a0c924ec0c48be807322ac92aa7b6d0`.
- Source manifest SHA-256: `4e02a21a569cb2b78e95addfc8cc667c8dfe5f984deb5cd2e89fe94b2a4d4f44`.
- Audited external wrappers import the actual CI configuration; overrides are strict isolated server/build target, paths/port and reporters only. **90,000 ms, one worker, retries zero, software GL, retain-on-failure tracing, only-on-failure screenshot and no server reuse** remain intact. No CSS manual trace owner or test instrumentation.
- Independently ran the **actual current repository CSS case** using `MODE=css-independent-audit python3 ../css-fixture-verify.py`: **passed, 46,179 ms test duration, runner exit 0**, normal completion. Strict fresh preview port **49837**; all 35 HTTP-served file SHA-256 hashes matched the immutable manifest. `execution.json` records source unchanged. The 180-second tool envelope was not a per-test budget override.
- Visually inspected this run's real frame-0 screenshot: clearly visible green dithered cube with multiple faces, not an empty/noise-only frame. Both runtime screenshot assertions passed normally.

## Independent readback of required executions and artifacts

Parsed reports, execution metadata and complete served manifests programmatically rather than relying on the handoff summary:

| Run | Case results | Test durations (ms) | Runner exit / served-byte identity |
| --- | --- | --- | --- |
| `css-2` | 1 passed | 41662 | 0 / all 35 files |
| `css-3` | 1 passed | 31581 | 0 / all 35 files |
| `css-4` | 1 passed | 43071 | 0 / all 35 files |
| `full-six-retry` | exactly 6 passed | 10204, 75467, 26215, 55243, 27760, 54446 | 0 / all 35 files |
| `css-independent-audit` | 1 passed | 46179 | 0 / all 35 files |

The three required isolated executions use separate ports/servers and outputs, not repeat-each. The full suite preserves baseline/APNG/Sprite Sheet/Code ZIP/CSS/Video ordering and original five-case bodies. A second independent all-six rerun was unnecessary: the complete original report, source stability, configuration, manifests and CSS download were available and independently validated.

A new independent verifier CRC-opened **all five acceptance CSS downloads**, resolved their actual referenced PNGs, fully decoded every atlas, checked every ordered stop/position and duration, and hashed every one of the **181 real frame cells**. All five have **181 distinct cells**, **2304×9920** atlases and **11283.185307179585 ms** loops. The four historical acceptance artifacts' newly computed cell hashes exactly match their retained per-cell hashes. Archive sizes respectively: **1,252,272; 1,253,877; 1,252,131; 1,254,908; 1,253,027 bytes**. Existing 176-meaningful-cell diagnostic counts are consistent with expected fades; runtime screenshot criteria were not weakened.

New independently generated evidence: `independent-artifact-audit.json` (including full cell hashes), `independent-evidence-audit.json`, `independent-patch-result.spec.js`, and `css-independent-audit/` with config, log, report, execution/served manifest, original ZIP, fixture JSON and screenshots. External verifier sources: `../css-independent-artifact-audit.mjs`, `../css-independent-evidence-audit.py`.

## Retained traces and unresolved failures

Independently opened the separate intentional-failure trace, validated ZIP CRC, parsed every trace/network JSON line and checked original intentional assertion plus navigation. Confirmed **73 events, 4 DOM snapshots, 13 screencast frames and 4 network resource records**, retained PNG failure screenshot, and expected runner exit **1**. This is diagnostic evidence, not one of six acceptance successes.

An initial independent validator looked for ANSI-colored failure text after serializing JSON/repr, which escapes control characters. Corrected the external validator to strip actual ANSI codes from decoded string values; the unchanged original trace then passed. This was a validator error, not a trace defect.

Also independently opened the initial `full-six` failure traces: APNG records **90000 ms timeout**, then context closure while waiting for the real **download** (`exportFormat`, line 164; APNG call line 204). Its Video trace records channel/context closure during the interrupted run. The initial log lacks a completed six-case report. These remain preserved failures. Concurrent load is not proven causal. The later six-pass run satisfies the bounded plan's required completed execution, but **does not clear the separate APNG/load-sensitivity reliability finding**. The earlier oversized-CSS runner archive's exact internal failure remains unproven; a readable tiny failure probe does not establish a repair to that internal mechanism.

## Static checks and handoff

Independently reran changed-spec ESLint, Prettier check and `git diff --check`, recording **each exit 0**. No substantive implementation finding or additional CSS change request remains. Parent still owns final integrated root/workspace/build packaging and handling unresolved APNG variability; subsequent runtime/spec changes require applicable rebuilt/re-identified verification rather than reusing these bytes as proof of a new revision.
