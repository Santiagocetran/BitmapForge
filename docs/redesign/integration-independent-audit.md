# A/shared redesign — independent combined integration audit

## Verdict: behavior/visual direction sound; completion BLOCKED on A1 and final artifact evidence

No new application UI defect was reproduced in the reviewed shared shell. The integrated hierarchy and actual screens satisfy the accepted workbench direction; this is more than a color reskin. **Do not call the combined redesign fully verified yet.** Independent execution found a real shared-test integration regression (A1 below), and the latest author-owned built gate is 9 passed / 1 failed at Embed. The separate B1 reviewer has now **accepted** the exact narrow repair in `palette-name-escape-independent-audit.md` (39 affected browser cases and 54 units); C's B1 blocker is resolved. The Embed investigator retains the artifact scope; this audit does not self-clear that work or authorize application changes.

Reviewed dirty shared checkout `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`, branch `gloin/editor-redesign`, HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`, historical source `8c6613279ed856e4933608e7e6c04e91dca2b331`. Source snapshots, commands/configurations, screenshots and execution logs from this reviewer are under `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-a-independent/`. No application, repository configuration or test source edits, build, dependency install, commit, push or deployment were performed. This audit is the only repository file created here.

## Scope and authority

Read `AGENTS.md`, parent `DESIGN-BRIEF.md`, accepted research/specification/state contracts/implementation plan, original plan audit and binding plan acceptance, foundation interfaces and independent audit, A handoff and the B/C/D independent audits. Loaded all three required product/frontend-direction/editor-redline skills and the browser-reliability reference. `CODEX.md` and the four requested COLLAB records are absent; no private memories were inspected.

Reviewed App, Layout, shared styles/button aliases, ProjectActions, PreviewCanvas display-only diff, ShortcutsModal, StatusNotice presentation-only diff, validators and shared tests, browser suites and helpers, all original behavior adaptations, and the finite nine-format integration ledger. Existing independent B and D source findings were retained rather than repeating those complete widget audits. C's original integrated name-Escape blocker has a narrow serial repair under separate independent review.

## A1 — REQUIRED: migrate project callback contract tests to their actual owner

**Location:** `src/app/utils/uiPropValidators.test.js:104–110`.

The loop still reads `ExportPanel.propTypes.saveProject` and `.loadProject`. The accepted output-only ExportPanel deliberately removed both props; the actual owner is now `ProjectActions`. Calling these nonexistent validators throws `TypeError: validator is not a function` at line 108.

Independent Node 20 execution:

- Four-file shared run (Layout, ProjectActions, StatusNotice and validators): **exit 1, 77 passed / 2 failed**. Layout's 16, ProjectActions' 1 and StatusNotice's 28 tests all passed; both failures are the obsolete project callback ownership expectations.
- Isolated `uiPropValidators.test.js` rerun: **exit 1, 32 passed / 2 failed**, 7.10s. This is deterministic, not concurrency or a timeout.

**Required repair, parent-assigned only:** keep direct positive/negative callable validation for `onSelectFormat` and `exportSelected` on ExportPanel; move the equivalent Save/Load validation to `ProjectActions.propTypes`. Assert output-only separation rather than restoring obsolete production props. Preserve the missing/null/wrong-type negative cases and React 19's explicit callable-contract testing. Do not simply delete the two protections or add useless ExportPanel props to satisfy stale tests. Rerun the exact shared group and parent root suite after the bounded test repair.

This is an implementation integration/test blocker, **not an observed Save/Load UI failure**: native chooser, save/import roundtrip and current callback behavior have separate passing browser/unit evidence.

## Shared implementation findings

- App routes visible Help and `?` through the same action. Save/current-state bridge publication remains in layout effects with guarded cleanup. No new provider/controller owns persistence or output dispatch.
- Exactly one `useExportController()` call remains in Layout. ExportPanel receives only the six accepted output props; ProjectActions owns the one `.bitmapforge` input. The input clears before load, handles native cancellation and repeated same-file selection, and uses existing callbacks.
- Four stable task sections remain mounted under `hidden` within the current inspector, with native pressed-button navigation rather than incomplete tab semantics. Renderer → Palette → refinements uses finite `part` values once each. Composition wraps existing pose/light widgets without an engine rewrite.
- Main PreviewCanvas is outside task/dialog/desktop branches. Its entire source/controller-effect section from `const sceneManagerRef` through the JSX boundary is byte-identical to the historical source. Git shows no engine, hook, store, Vite or package changes in this comparison. Display-only image invitation Demo first uses the existing model navigation bridge and then unchanged demo loader.
- Pointer-capture barriers retire reveal/palette transactions before task, collapse, Close, Help, stage or backdrop blur; click/programmatic transitions cancel again. No blanket pointer-default prevention was introduced. Pending reveal is generation-bound, consumed after visibility/reset; no timer-based focus retries.
- The responsive restore retained through Radix close autofocus is tied to the same generation and checks the current live mode. Committed close/reopen, picker/drag ownership, exact opener restoration and one stable notice remain explicitly asserted, not inferred from component counts.
- Visible-rectangle initialization, viewport resize **and scroll**, same-breakpoint focused-input reveal, root CSS variables and teardown are present. Help is a sibling bounded dialog, not dependent on inspector height. Under 240px whole-interior scrolling is deliberate. Scroll reset precedes explicit source/Export reveal; Help and same-breakpoint height changes do not request reset.
- StatusNotice's asynchronous suspension/delivery machinery is unchanged; only classes changed. Its 28 independent microtask/suspense/StrictMode protections passed. Error dismissal remains nondestructive and detailed progress is still in the single live notice.

## Independent execution and original protections

All JS commands used the already available Node 20 binary `/home/agent/.npm/_npx/ebaba8b9e55fd0a9/node_modules/node/bin/node`, actual `v20.20.2`, with installed direct CLI entrypoints. No dependency installation or timeout/assertion changes.

| Gate                                                           | Independent result                                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| Shared unit group described in A1                              | Exit 1; 77 passed, 2 deterministic stale-owner failures               |
| Isolated validator reproduction                                | Exit 1; 32 passed, same 2 failures                                    |
| Explicit A/shared JSX/browser ESLint                           | Exit 0, no diagnostics or ignored-file waiver                         |
| Explicit A/shared Prettier check                               | Exit 0                                                                |
| Full source match list, current post-B1 tree                   | **Exit 0, 57 passed**, 640.56s; no skipped, unexpected or flaky cases |
| Additional real-app probe on parent's fresh source server 5299 | Exit 0; three focused integration checks below                        |

The isolated full source config is `bf-a-independent/playwright.config.mjs`: source 5319, evidence-local Vite cache/output, HMR false, server reuse false, workers 1, retries 0, timeout 90000ms, retain-on-failure runner tracing; exact match list `ui-foundations.spec.js`, `palette.spec.js`, `ascii-generated.spec.js`. It discovers **57**, not 55: 42 UI + 11 palette + 4 generated ASCII cases, including both new B1 opener cases. **All 57 passed.** Before/after manifests cover166 source/test files: all app/engine and source-suite dependencies were unchanged. The only changed file was the separately owned built-only `test/e2e/redesign-artifacts.spec.js`, not imported by this source match list, during the Embed investigator's work. `stability.json` records exact identities and parsed counts; this is not an all166-unchanged claim. The ASCII cases retain their own private bundler/cache; its initial dependency optimization/reload was logged, not hidden. No retries were used.

Historical baseline-to-candidate diffs retain U01–U19/P01–P11's behaviors, not merely 30 test names: both exact openers; first/second drag Escape and rollback/drop/external cancellation; trap/inert ancestry/body style restoration; native Enter/Space chooser; empty cancellation, invalid import and real save/reimport; meaningful progress and overlap/error precedence; same notice/zero frozen mutations/one latest resume; six original sizes and nonblank color/entropy floors; distinct reopened dialog nodes/two-frame stability; parent close/resize cancellation; pixel-size save payloads and exact 3→failure/no download→4 recovery counts. Palette changes are native navigation/naming plus the collapsed-browser harness geometry, not removed cancellation/touch/pointer assertions. Export helper extraction retains original observed-container sizing, full-loop CSS181, decode/content and unchanged-runtime assertions. Source ASCII isolation changes dependency resolution/serving, not comparison acceptance.

Additional independent probe (`probe.mjs`, `probe.json`) exercised real app controls on source5299:

1. Open Browse/name form, scroll deep, invoke visible Help, Escape: exact clicked Help invoker restored and inspector scroll remains **821 → 821**. Initial diagnostic wrongly expected the previously focused name after clicking Help; corrected the probe to the actual clicked invoker, not the app.
2. Desktop →390×844 retains name without autofocus; measured Settings **y337.59375 / h506.390625**. Open sibling Help then cross to desktop: Help retains focus containment, Escape uses valid Look-heading fallback.
3. At320×568 full-height Settings measures **320×568 at y0**; final Export APNG action measures **286×44 at y507–551**, fully inside the viewport; main preview node unchanged throughout. No page errors.

A browser-use exploratory attempt timed out during a JS evaluation after resizing; it is not acceptance evidence or an application defect diagnosis. Successful independent Playwright probes and direct image inspection supply the bounded live evidence instead.

## Actual visual and behavioral craft

Directly inspected parent's fresh actual5299 captures `final-screenshots/{desktop-look,mobile-preview,mobile-look}.png`, author's actual desktop Motion/composition and pending GIF capture, and this reviewer's newly produced palette/full-height Export/short Help images. These are real application screenshots, not paper wireframes or token swatches.

- **Desktop:** a quiet continuous 340px inspector, recognizably separate commands, native task buttons and clear renderer-first Look hierarchy are coherent. Dither is immediately discoverable; compact palette editing follows it instead of an always-open preset wall. The stage, not decorative chrome, is dominant. Cobalt pressed markers and a separate focus outline communicate different states. Existing small/animated/fading artwork was not enlarged or restaged for a marketing image.
- **Motion/composition:** native timing/motion groups are distinguishable from static rotation; deep pose/light controls remain in the intended task scroller. The spatial light grid/checkmark, units and existing gizmo remain understandable rather than becoming generic cards. Scrolled top content is intentionally out of view, not missing controls.
- **Palette:** expanded browsing is deliberately a long optional list; name form, Save and Cancel remain usable below it. The name is not trapped inside the disclosure. Native edit/drag separation and narrow horizontal palette scrolling are not sacrificed for density.
- **Phone closed:** full actual specimen and persistent Open settings/Export routes are clear; Save/Load/Help remain readable in the two-row header. No fictitious cloud state, zoom/timeline or decorative motion was added.
- **Phone open:** the accepted60% portrait modal preserves **some dimmed stage**, not necessarily a useful whole-artwork reference. With the real demo, most visible upper stage is empty background and only the head's top is exposed. This is a genuine cost of preserved centered canvas framing and modal occlusion, **not proof of simultaneous full-artwork editing**. The sheet is intentionally modal/inert. Close returns to the full specimen. It matches the accepted geometry; no camera/scale/engine or new layout feature is requested to make the screenshot look better.
- **Short/full-height:** at320×568 the form deliberately occupies the whole viewport. Header/Close/tasks remain legible; the final action is fully reachable. At667×320 actual Help keeps Close and all shortcut rows within its bounded panel. No document-horizontal-overflow or essential-label clipping was observed in these inspected states.
- **Progress/error:** actual GIF capture shows recognized Encoding GIF percentage in the active modal, not a fabricated toast. Cancel and final export action are intentionally further down the panel scroller, not sticky overlays covering controls. The automated loading/busy/error/success fixtures are explicitly store-presenter fixtures, not measured operations.

**Nonblocking craft redline retained:** the full-width Collapse settings row still overemphasizes a low-frequency workspace mechanic. This is the parent's already optional refinement, not a new acceptance blocker. No new palette, font, camera or feature demand arises from this audit.

## Artifact evidence: historical green is not current green

Read actual JSON reports, not just the handoff's opening claim:

| Author-owned report under `bf-p3-evidence/` | Observed stats                                                                                                          |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `pre-b1-source-report.json`                 | 55 passed, 0 failed/skipped/flaky                                                                                       |
| `pre-b1-built-report.json`                  | 10 passed, 0 failed/skipped/flaky                                                                                       |
| `source-report.json` at inspection          | 39 passed, 0 failed; affected subset, **not full57**                                                                    |
| `built-report.json` at inspection           | 9 passed / 1 failed; Embed `locator.screenshot: Element is not attached to the DOM` at `redesign-artifacts.spec.js:213` |

The latest failed Embed path occurs before the later image-disabled assertions. A successfully downloaded archive/CRC and a historical runtime pass cannot certify this incomplete current case. The separate investigator owns diagnosis/repair and the fresh final full10 built gate at90000ms/retries0. Do not patch the app/SDK, weaken metrics, raise budgets or run another competing heavy artifact suite as part of this read-only audit.

Read all nine actual downloaded artifact files in the current evidence directory; five ZIP CRC checks passed. The files are APNG, GIF, MP4, sprite PNG, CSS ZIP, React ZIP, Web Component ZIP, Embed ZIP and Code ZIP. `gif-decoded.json` contains181 decoded frame metrics (representative frame80:384×320,29 colors, non-background ratio0.1546, entropy1.0689). These corroborate real downloads, not a fresh independent nine-format runtime/decode acceptance. Their bytes differ from the handoff's earlier hash table because later runs overwrote the shared evidence location; use the final report/manifest matching the final run, not stale earlier prefixes.

The accepted ledger is correctly split: GIF meaningful decoded animation; React/Web Component actual built-UI config/engine/model archives **plus separately instrumented source fresh-runtime comparisons**; Code/CSS/APNG/Video/Sprite retained exact quality cases; Embed unchanged SDK/payload plus initial/container-only sizing and image-disabled route. No selection-only test is mislabelled as an artifact, and source builder comparisons are not relabelled unmodified built runtime certification.

## Remaining verification boundary

- Parent must explicitly assign/independently review A1's bounded shared-test repair and obtain the full combined root gate. Focused UI success cannot override two failing mandatory unit tests.
- Separate B1 reviewer independently accepted the exact repair (39 browser /54 unit passes and exact patch/hash verification); the prior C blocker is resolved. This audit does not repeat that widget review.
- Separate Embed investigator owns the current artifact failure and latest built identities/full10. The handoff's opening “final55/10” wording is historical, not clearance of modified post-B1 state.
- Parent retains whole-root lint/format/unit and embed/decode/CLI/engine/browser-smoke/workspace/build/gzip/alias/served-byte provenance gates. This review did not run competing builds or claim these checks passed.
- The accepted baseline-relative input-to-store/performance measurement is not supplied by the handoff. Existing manager-count/lifetime tests are meaningful, but not an FPS or input-latency benchmark. Record the remaining measurement or its explicit disposition; do not claim a speed improvement.
- Automated640×400 reflow is not a demonstrated real browser-menu200% zoom. Physical mobile keyboard/touch, Safari and AT remain unavailable. Visual-viewport getter/event tests certify the adapter only; reduced-motion checks certify chrome policy, not stopped artwork playback or accessibility conformance.

No application repair beyond an explicitly parent-assigned finding is authorized by this review. No publication or deployment acceptance is implied.
