# Final redesign verification

## State and scope

Bitmap Workbench redesign on `gloin/editor-redesign`, built on saved foundation commit `8c6613279ed856e4933608e7e6c04e91dca2b331`. The earlier foundation work is independently preserved on remote `gloin/verified-ui-foundations`. Research/plans were separately committed at `496f0d1f494e928c54f8fef2321835ccd5141917` before redesign code.

This document records local executed checks, not a remotely executed GitHub Actions run or production deployment. No PR, merge or deployment is authorized/performed.

## Parent final whole-project execution

Node 20.20.2, unchanged repository scripts. Parent command `proc_e2ca85df404d` exited **0**:

- Root JSX-inclusive lint: passed.
- Root unit/integration: **60 files / 852 tests passed**, 72.35s.
- Embed workspace: **2 files / 23 tests passed**.
- Dedicated export/decode: **3 files / 66 tests passed**.
- Normal app production build including normal SDK prebuild/copy: passed.
- CLI build: passed; CLI tests: **10 passed / 1 optional integration skipped**.
- Native Chromium bitmap smoke: **both owned/discarded and retained-consumer cases passed**, with real ImageBitmap closure/detachment and exactly-once URL revocation.

Earlier parent attempt `proc_efd7dc1dc35d` correctly stopped at formatting of the newly created project-contract audit document, before root tests. It was not counted as a failed unit run or a successful full verification chain. Formatting is checked again after all review documents are complete.

## Source/browser and real built artifacts

- Independent full post-B1 source suite: **57/57 passed**, no retries/skips/flaky cases. It retains all original30 UI/palette behavior protections, new task/viewport/focus/state cases and four fresh generated ASCII comparisons. Review: [integration audit](integration-independent-audit.md).
- B/source independent review: **25 focused tests**, **12 real source-navigation routes** and **4 native model/image chooser events** passed. See [source audit](source-independent-audit.md).
- D Look/motion/output independent review: **79 tests / 10 files** plus native controls; parent independently verified all ten D files' formatting and scoped whitespace checks. See [D audit](look-motion-export-independent-audit.md).
- C palette transactions/lifetime: **37 focused tests** and real narrow-screen geometry; the one identified integrated name-Escape issue was repaired and independently accepted with **54 focused tests and39 browser cases**, both exact openers, parent draft preservation and existing picker/drag/Help behavior. See [B1 repair audit](palette-name-escape-independent-audit.md).
- A1 stale project-callback test ownership was corrected: original positive/negative Save/Load cases now test `ProjectActions.propTypes`, export callbacks remain on ExportPanel, and a new assertion proves ExportPanel remains output-only. Parent exact shared group: **80/80 passed**; independent isolated contract suite: **35/35 passed**. The review's formatting finding was subsequently corrected by parent-only Prettier normalization; targeted format/lint/diff checks passed. No production prop was restored or assertion deleted. See [A1 review](project-contract-test-independent-audit.md).
- Final built gate after the bounded Embed readiness repair: **10/10 passed**, all nine actual format dispatch/download routes, **90000ms per-case / retries0 / workers1**. Three isolated Embed runs passed first. Reports retain all failed earlier runs. [Embed handoff](embed-readiness-handoff.md); [independent readiness audit](embed-readiness-independent-audit.md) **ACCEPTS** the bounded repair after checking reports, all eight decoded screenshots, exact runtime/build/archive bytes, patch application and nonvacuous settlement observations. No application runtime was changed.

## Final build identity and SDK gates

Parent independently compared the normal rebuilt `dist/` with the immutable isolated build used by the successful artifact suite: **35 files versus35 files, zero hash differences**. Thus the later normal build matches the tested bytes, not merely a similar source tree. Evidence JSON: `BitmapForge-redesign-research/final-build-identity.json`.

- Packaged SDK, `public/embed` copy and built SDK bytes are identical.
- Exact CI-style gzip measurement: **46,708 bytes**, below51,200.
- No `@engine` alias leakage.
- No engine, hooks, stores, package manifests/lock, workspace implementation or CI workflow changes relative to the saved foundation. Redesign work is presentation/interaction integration, tests and documentation.

## Actual design evidence

Parent inspected the real local app and captured [desktop Look](screenshots/desktop-look.png), [desktop Motion](screenshots/desktop-motion.png), [mobile preview](screenshots/mobile-preview.png) and [mobile Export](screenshots/mobile-export.png) with the existing demo model. These are not mocks, generated hero media, edited output or artifact-quality proof. Artwork can be in different animation phases; source/camera/scale were not inflated to beautify screenshots.

Reference research, alternatives, licenses/provenance and two restrained installed text-only skill adaptations are documented in [research](research.md). No runtime UI framework/font/service dependency was added. A tiny observed baseline-relative native-event-to-store measurement and every raw sample are in [performance observation](performance-observation.md); no speedup/FPS claim is made.

## Limits and preserved reliability observations

- The portrait inspector is a modal60% sheet; it leaves some dimmed stage but may obscure most centered artwork. It is **not simultaneous full-artwork editing**. Close returns to the whole specimen. Short/landscape fallback intentionally uses a full-height modal.
- Chromium keyboard/touch emulation, getter/event viewport emulation and640×400 reflow are not physical touch/mobile keyboard/Safari/screen-reader testing or demonstrated real browser-menu200% zoom. Those manual checks remain unverified.
- Reduced-motion checks apply to chrome; the existing artwork playback policy was not changed.
- The Embed screenshot failure was a test completion-contract race: model loading completed before a queued legitimate renderer replacement retired its canvas. The harness now observes actual renderer settlement/current connected canvas before its existing meaningful-frame screenshot poll. Exported SDK/runtime remained byte-identical; no forced render/setSize, arbitrary sleep, screenshot retry, timeout increase or hidden expected failure was introduced.
- Earlier APNG/CSS timing failures and the Embed failure remain retained evidence. Passing final runs does not diagnose every timing variation or prove a general internal Playwright archive-race fix.
- Root lint success is real JSX discovery, not disabled rules. Contract validators are directly tested because React19 function components do not invoke propTypes automatically.
- Production branch/environment protection, external hosting bypass/rollback and a hosted deployment smoke are outside this branch-only delivery. No production release claim follows from local verification.
