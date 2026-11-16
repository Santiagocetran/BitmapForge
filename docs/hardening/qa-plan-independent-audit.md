# Independent preimplementation audit — QA plan

## Verdict: REVISE

**Do not implement, provision tools, or execute the proposed harness yet.** The plan has sound scope and evidence policies, but its real navigation sequence, desktop/mobile case contracts, source-suite isolation, and shared browser-cache ownership need corrections before independent ACCEPT.

Reviewed source: `550842cab61002c7cc6563e50b9fcdeb17c9bf01`, branch `gloin/release-hardening`.
Reviewed `qa-plan.md` SHA-256: `0e772f297086373ef3940f87365e8bee4c5e56e40b09fbf37131a71fd01da020`.

This was a read-only source/spec/config review plus this audit document. No browser launch, browser test, dependency installation, application edit, CI edit, issue mutation, publication, or deployment was performed. Parent-owned execution is not duplicated. Planning claims about axe metadata/archive integrity are attributed to the author, not independently certified by this audit.

## Required revisions

### R1 — Give Q1 a real source-route sequence, not four interchangeable buttons

Plan lines 65 and 111 leave the actual route sequence and Shape/Text checks unspecified. The preview invitation disappears once a shape/text/model is active (`PreviewCanvas/PreviewCanvas.jsx:228–269`); its buttons cannot be reused sequentially to exercise all four invitations. There are also duplicate source names between the invitation and inspector. `InputSource/InputSource.jsx:9–14,58–75` uses **3D model / Shapes / Text / Image**, not literal Model/Shape names. Narrow source navigation opens Settings (`Layout/Layout.jsx:292–302`), so subsequent preview pixel sampling must explicitly dismiss the sheet rather than screenshot artwork under a backdrop.

Revise Q1 into bounded, named route steps or fresh route subcases. Specify Preview-scoped invitation locators versus Source-type group locators, Choose File/Replace ownership, chooser cancellation by the supported intercepted chooser API, and how the next empty invitation is reached without source-store writes. Specify one actual Shape selection and one Text edit with completion assertions, return to model/cube, and close the narrow sheet before meaningful-preview capture. Arm chooser interception before navigation as already required; retain per-activation event counts.

Text has a real engine dependency: `textGenerator.js:6–13,37–43` lazily imports bundled Three font JSON. No remote font fetch is necessary, but the chosen built font chunk must load successfully. Waiting only for an empty loading flag does not establish successful text generation (`PreviewCanvas.jsx:172–186` clears text success message). Name a concrete nonempty text/font and an observable successful rendered result/no error; do not introduce a font-ready or engine-render bypass.

### R2 — Split desktop versus modal palette acceptance

Q3.D and Q3.M currently share mandatory drawer-hide and “second Escape dismisses/restores opener” assertions (line 113). Desktop Settings is an aside, not a dialog (`Layout.jsx:424–440`). Existing nested-drag browser coverage deliberately uses narrow viewports (`ui-foundations.spec.js:77–106`). A second Escape cannot dismiss a desktop Settings drawer that does not exist.

Write separate desktop and narrow expectations: desktop drag cancellation/order/focus and task/collapse cancellation; narrow first-Escape drag ownership, second-Escape dialog dismissal/opener restoration, drawer-hide draft cancellation. Make any explicit resize within a case a named transition. Do the same for Q6.M/S reachability: name the real sheet opener before asserting Close. Keep all intended coverage; do not implement desktop dismissal merely to satisfy the harness.

### R3 — Account for the ASCII suite's own server, output variable, and cleanup

Plan lines 73 and 133 do not set `BITMAPFORGE_SOURCE_OUTPUT`. `ascii-generated.spec.js:19–35` reads **that** variable, otherwise writes inside `test/fixtures/outputs`, and creates its own ephemeral loopback Vite server with a private cache. It does not consume the proposed 5293 application server. Its `afterAll` recursively deletes the generated directory (`:37–40`), including fresh archives/runtime scaffolding. Merely setting `BITMAPFORGE_EXPORT_OUTPUT`/P1 evidence does not isolate or retain this suite's output.

Explicitly set the source output variable outside the checkout; identify the suite-owned secondary server/cache/origin and cleanup ownership separately from the harness-owned source app server. State how required generated artifacts are retained before deletion without editing existing specs, or expressly narrow this lane's retained evidence to runner traces/reports/source hashes and acknowledge that the temporary generated directories are intentionally removed. Do not promise artifact paths that cannot survive suite cleanup. The existing ASCII comparison also instruments manager methods and calls `renderAtTime` (`:107–140`); label it a source-generated diagnostic comparison, not unmodified runtime or normal portable UI evidence. Scope the smoke's prohibition on render calls accordingly.

### R4 — Resolve Chromium provisioning ownership with the tooling plan

QA lines 79–89 select the existing default Chromium cache and leave it alone. `tooling-plan.md:95,113–115` instead requires a **fresh isolated locked Chromium installation** and use of that cache for final built-browser/native checks. Both cannot describe the same final acceptance lane without an explicit handoff.

Agree one owner and immutable cache path with the parent/tooling owner. Record which baseline/final lane uses which verified executable/revision and why; prefer the required fresh cache for final acceptance rather than silently substituting the global cache. Keep Firefox/WebKit provisioning separate, locked, serial, and free of OS installs. Do not provision while shared node_modules is being changed.

### R5 — Bound Q5's actual late export failure and freeze the manifest

`useExport.js:29–39` captures and encodes the complete APNG before `downloadBlob` calls `URL.createObjectURL` (`:8–14`). Q5's injection therefore does **not** fail cheaply at export start. Only Q4 currently permits the bounded pre-upload geometry (plan line 67); Q5 combines project save/import/recovery, a full unbounded export, and host/Help transitions under one 90-second test.

Separate project recovery, controlled late export failure, and unchanged-notice host transitions into explicit test IDs before implementation, or provide a concrete bounded schedule that preserves every step within 90 seconds. If proposing Q5-specific pre-upload geometry, state and independently accept it explicitly; do not silently apply Q4's exception globally or shorten animation. Restore the API in failure-safe cleanup before any diagnostic Save download. Define the exact expected thrown message/console exception whitelist and retain unexpected errors.

Update the finite manifest and counts after these revisions. Q4 currently says each ID is one test but also requires a fresh export context; make the context boundary explicit (or assign separate IDs), preserving selection/controller continuity only within its actual transition context. A later split needs renewed review and a fresh baseline, as the plan already says.

## Policies accepted in principle

- **Scope:** external executable harness, no app/framework changes, no hosted-CI expansion, no publication/settings/issues/deployment; UI findings require a separately audited repair. Manual/external follow-ups remain honest.
- **Fixture and target:** independently verified cube is 1,577 bytes with the stated SHA-256. Immutable baseline versus SHA+diff-hash final build, served-byte/asset verification, strict ports/no reuse, source/built separation, fresh storage and no store-import shortcuts are appropriate. Provisioning and build-slot release remain prerequisites, not assumed completion.
- **Portable engines:** independent Chromium/Firefox/Playwright WebKit prerequisites, no CDP touch/ImageDecoder dependency in portable APNG, no Chromium-only flags in other engines, no fake Safari claim, and blocked launch/shared-library/WebGL cells are appropriate. A working engine with an application exception must fail rather than be reclassified as unavailable.
- **Meaningful artifacts:** Q4 decodes APNG pixels, dimensions, delays, variation, occupancy/colors/entropy rather than headers. Existing source confirms CSS full-loop/181-stop atlas assertions, seeked decoded Video middle-frame checks, and Embed initial/container-only resize tests. Preserve these unchanged. React/Web Component built cases prove archive/settings/source-byte fidelity, not live execution of every generated UI runtime; keep that distinction in the final report.
- **Scanner supplier/policy:** exact axe 4.14.0 supplier/SRI, isolated ignore-scripts install, local injection/version check, explicit WCAG tags and expanded rule-ID equality, no disabled contrast/exclusions, retained violations/incomplete results and manual limits are suitable. Registry integrity is not authenticated provenance/signature verification or scanner compatibility. Actual rule inventory/injection remains a blocking preflight until exercised. No dependency installation is authorized by this verdict.
- **Budgets/evidence:** 90-second outer bound, retries zero, one worker, preserved explicit assertion budgets, unchanged broad specs, runner-owned retain-on-failure tracing and a separately labeled intentional-failure trace probe are appropriate. A 120-second helper download wait does not extend the test. Do not alter traces or assertions to obtain a pass.
- **Limits:** Linux WebKit, viewport/DPR/reduced-motion automation, DOM live-region checks and axe do not clear physical Safari/touch, browser-menu zoom, screen-reader announcements, production provenance, capability-matrix or launch gates.

## Implementation-review checks retained after revision

Before a later ACCEPT, resolve R1–R5 in writing and freeze case IDs and browser/server ownership. During the separate harness review, require discovered-test/ledger reconciliation and real trace-failure contents, not just report/ZIP existence. Existing reused suites do not uniformly record all console/transport/download-failure fields promised by line 145; identify how supplemental capture is attached without changing their imported test object/specs, or explicitly distinguish inherited evidence gaps from the new smoke's richer diagnostics. Preserve original suite outcomes regardless.

The audit file is not ignored by repository rules. No application implementation is cleared by this review. **Final decision: REVISE; independent re-audit required before implementation.**
