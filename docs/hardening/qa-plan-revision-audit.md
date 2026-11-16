# Independent re-audit — revised local QA plan

## Verdict: ACCEPT

**ACCEPT the revised written QA plan for subsequent, separately coordinated harness implementation and execution.** R1–R5 are resolved at the plan-design level. No material plan blocker remains. This is not a harness implementation acceptance, test pass, application-change approval, remote-action authorization or release clearance.

Reviewed branch/source: `gloin/release-hardening`, `550842cab61002c7cc6563e50b9fcdeb17c9bf01`.

Independently computed `docs/hardening/qa-plan.md` SHA-256:

```text
e16077ff9230c40e278e523b16c599447f4a8d84e9421a4440473a6f3e603396
```

It exactly matches the author-supplied digest. Acceptance is pinned to those bytes and source contracts; a material manifest/policy revision needs renewed review as the plan already requires.

This review read governance, the development skill/browser reliability reference, prior independent objections, revised plan, tooling handoff requirements, actual UI/engine/export source, installed runner metadata, and reused helpers/specs/configs. Only this new audit document is written. No installation, browser launch, harness execution, implementation, application/config edit, remote query/mutation, publication or deployment occurred. `.codex` and `COLLAB` are absent in this checkout. Existing hardening documents are untracked; that pre-existing state is not this auditor's change.

## Material-objection dispositions

### R1 — Actual source routes, fonts, chooser and preview: resolved

The plan now freezes eight fresh route tests rather than trying to reuse invitations after loading a source. `PreviewCanvas.jsx:233–269` conditionally removes those invitations; `Layout.jsx:292–302` opens the Source task and narrow sheet without opening a chooser. `InputSource.jsx:9–14,58–103` confirms **3D model / Shapes / Text / Image**, separate Source type/Shape groups, and the real focus bridge. Preview-scoped invitations and named Source task regions avoid duplicate desktop labels.

`ModelUploader.jsx:23–29,49–98` confirms native **Choose File** versus loaded **Replace**, with empty accepted selections leaving the model unchanged. `ImageInput.jsx:19–27,66–76` likewise has **Choose Image** and an empty-selection no-op. Interception before navigation and one event per activation preserve the native Enter/Space checks; `setFiles([])` is explicitly intercepted empty selection, not proof of native OS Cancel behavior.

Sphere's Radius/Segments controls and selected shape focus exist in `ShapeSelector.jsx`; labeled Text and Helvetiker exist in `TextInput.jsx`. `textGenerator.js:6–13,37–43` lazily loads bundled font JSON; the build supplies its transformed JS chunk, not a remote font prerequisite. `PreviewCanvas.jsx:172–186` clears successful text messages, so retained text/font values plus successful same-origin chunk identity and meaningful pixels/no errors are appropriate, whereas waiting for a success string would be wrong. Source-group return to cube and explicit narrow **Close settings** before canvas capture now address the disappearing invitation/backdrop problem. Actual chunk identity/load and rendered output remain execution evidence, not findings of this read-only audit.

### R2 — Desktop versus modal acceptance: resolved

`Layout.jsx:424–444` renders desktop Settings as an aside; `:485–564` renders the narrow Radix dialog, with first-Escape keyboard-drag ownership at `:522–529`. Revised desktop Q3 tests no longer invent drawer dismissal or a second-Escape desktop close. Narrow tests retain first-Escape cancel/order/focus and subsequent ordinary dialog dismissal/opener restoration. Draft hide/collapse checks have named breakpoint transitions instead of nonexistent sheet collapse controls.

Q6 explicitly opens real Settings and separately exercises persistent Export access. N alone uses an exposed backdrop; S's full-height sheet is consistent with `Layout.jsx:147–149`. Q2 retains trap/isolation/restoration and the Close-focused resize race over two frames; it does not trade modal coverage for desktop-only checks.

### R3 — ASCII private server, environment, cleanup and evidence: resolved

`ascii-generated.spec.js:19–40` reads **BITMAPFORGE_SOURCE_OUTPUT**, creates its own port-0 loopback Vite server with `configFile:false`, cwd root, HMR off and private `.vite` cache, then closes it and recursively deletes its generated directory. The separate ASCII config with `webServer` disabled is correct; 5293 and the application-origin/export-output variables are not falsely treated as this suite's host/output contract.

The plan preserves its four React/web × asciiColored cases. Its archive construction via source imports and manager/render instrumentation (`:48–78,107–140`) are honestly labeled instrumented source-generated diagnostics, not unmodified downloaded-runtime acceptance. Retention is expressly limited to surviving reports/logs/hashes and actually attached traces/screenshots. Deleted ZIPs/scaffolding/cache are not promised as retained artifacts; an ephemeral origin is evidence only if observed. Rich smoke telemetry is not claimed to be automatically installed into inherited specs through external configuration. These are explicit evidence limits, not a dropped smoke/artifact requirement.

### R4 — Fresh locked Chromium ownership: resolved

The revised parent/tooling-only installation/cache-write ownership agrees with tooling's fresh-install gate. Each QA Chromium invocation must use the supplied literal absolute cache via `PLAYWRIGHT_BROWSERS_PATH`, with phase, freshness/install logs, locked revisions and executable identity/launch evidence. Final cannot silently revert to a global historical cache. QA-only Firefox/WebKit provisioning stays separate, serial and locked, without OS/dependency-tree mutation.

Read-only installed metadata confirms runner **1.59.1** and Chromium/headless-shell revision **1217**, manifest version **147.0.7727.15**. Those are expected metadata, not an observed browser launch. A valid cache/Node toolchain/build-slot handoff remains a bounded execution prerequisite; its absence must block the affected lane, not change this design verdict or be counted green.

### R5 — Frozen split and honest late export: resolved

Q5 now has six independent project/late-export/notice-host D/N tests; Q4 continuity and normal APNG export have independent contexts and IDs. The approved spatial exceptions are explicitly limited to Q4.export.D and Q5.late-export.D/N, before upload, with desktop 384×320 and narrow late-export 256×256. They do not reduce default animation, loop/frame count, viewport/DPR, image thresholds or broad-suite workload.

`useExport.js:29–39` completes capture and `buildApng` before returning its Blob; `:323–329` downloads afterward and catches the sentinel into the exact friendly error. `apngExport.js:24–26` produces the targeted `image/png` Blob. A throw at `downloadBlob`'s `URL.createObjectURL` therefore really is **postencoding**, not an inexpensive startup failure. The plan says so, scopes one targeted throw, preserves unrelated URLs, requires zero download/no stale success/busy cleanup/artwork and settings preservation, restores in finally before recovery Save/diagnostics, and narrowly whitelists only that caught operation's console error. It does not claim exact internal encoder timings without instrumentation.

The single 90-second outer bound still includes setup, full capture/encode, checks and cleanup. Actual feasibility is unproved until execution; a timeout remains a failure, with no adaptive shrink, extra retry, early throw or budget increase permitted.

## Frozen inventory — independently reconciled

A read-only Python extraction from the revised manifest table asserted uniqueness and expanded the phase/engine Cartesian product:

```text
Q1.model.D  Q1.model.N  Q1.shape.D  Q1.shape.N
Q1.text.D   Q1.text.N   Q1.image.D  Q1.image.N
Q2.N  Q2.S
Q3.edit.D  Q3.edit.M  Q3.drag.D  Q3.drag.M
Q4.continuity.D  Q4.export.D
Q5.project.D  Q5.project.N  Q5.late-export.D  Q5.late-export.N
Q5.host.D  Q5.host.N
Q6.M  Q6.S  Q6.H  Q6.R
Q7.E  Q7.L  Q7.I  Q7.N  Q7.X  Q7.A  Q7.H
```

**33 unique smoke IDs per engine/phase; 99 per phase; 198 unique engine/phase/case cells across Chromium, Firefox, WebKit × baseline/final.** Preflight, inherited suites and deliberate trace probes are separate. This verifies the written inventory, not runner discovery or completed execution; later `--list`/report/ledger equality remains mandatory, including every blocked/not-run cell.

## Original scope and gates retained

- The checked-in cube independently matches **1,577 bytes**, SHA-256 `4d2d98182b4b93e8b45e881b1f92838b7e951ab246bb73f81663b3e3f5bef708`. Immutable built identity/served-byte checks, isolated strict servers, source/built distinctions and no store/font/render shortcuts survive.
- Q1–Q7 retain routes, native chooser keys, meaningful previews, modal/desktop focus and cancellation, palette identity/scroll, format/controller continuity, project recovery, export errors, notice/Help ownership, viewport/DPR/reduced motion and seven actual scan states. The split reallocates work; it does not remove original assertions.
- Normal APNG remains a real UI download with retained bytes, download-failure check, UPNG decoding, dimensions/frames/delays/variation and meaningful occupancy/colors/entropy. Injected failure does not substitute for normal output.
- Existing broad built specs stay unchanged: nine distinct panel routes across export.visual and redesign-artifacts, CSS complete-loop/181-stop atlas, seeked decoded Video middle frame, GIF meaningful decoded output and Embed initial/container-only resize. React/web archive fidelity is not overstated as execution of every generated runtime. Source UI and instrumented ASCII remain separate mandatory lanes or explicitly reconciled parent-owned evidence.
- Root/CI configs substantiate 90 seconds, zero retries and one worker; the source export config's 180 seconds and helper's 120-second download wait do not replace that outer bound. Explicit existing assertion budgets, retain-on-failure runner traces and intentional-failure trace-content verification remain intact. No assertion/trace weakening was accepted.
- Pinned isolated axe, explicit tags/expanded-rule equality, zero violations, retained incompletes/manual limits, and unavailable-engine cells remain unchanged. No screen-reader, physical Safari/device/touch/zoom, full capability, hosted-CI or release claim follows from this smoke.

## Bounded execution prerequisites, not further plan objections

1. Parent supplies immutable target/source identity, correct paired Node/npm, serial slots and verified fresh Chromium cache handoff. Firefox/WebKit binaries/native libraries/WebGL and pinned axe inventory/injection must subsequently pass actual preflight. This audit did not independently reproduce the author's registry/archive-integrity claims.
2. Implement new narrow-aware geometry checks in the **external harness**, retaining the helper's hierarchy/backing/rendered/client/container agreement. `exportApp.js:37–41` explicitly asserts desktop 1280×800, so do not call that desktop assertion unchanged at N or edit the inherited helper to make it pass. This is a finite implementation detail under the plan's named N geometry contract, not permission to relax geometry.
3. Real project loads over an existing model trigger `window.confirm` (`useExportController.js:23–24`); arm an explicit accept handler for intended loads before native chooser activation. Compare parsed settings/model bytes excluding `createdAt`, not timestamped filenames. Host-only tests can retain their fresh empty source and stable real Save/load notice; do not introduce an unnecessary model-loading race into that contract.
4. Later harness review must verify exact manifest discovery, event/error and cleanup evidence, actual failure trace contents, font responses, geometry and meaningful output under the original budgets. No current pass is presumed. Missing inherited telemetry and deleted ASCII archives remain disclosed, not silently fabricated.

These are finite prerequisites/review checks within the agreed smoke, not requests to add codecs, corrupt-GLB recovery, screen readers or physical devices. If execution exposes a failure, retain and report it; a material harness/manifest repair needs the plan's fresh-baseline/review process. **Final independent decision: ACCEPT this exact revised plan; no implementation was performed by this audit.**
