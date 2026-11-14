# A/P3 integration handoff — B1 repair awaiting independent re-audit

**Post-review update:** B and D are independently accepted. C audit found one integrated mobile name-Escape blocker; parent transferred that narrow serial repair to A. The repair now reproduces red then passes both exact-opener first/second-Escape + parent-hide regressions. Final affected-source/rebuilt provenance checks are in progress; the complete55/10 evidence below is pre-B1, not clearance of the modified Dialog boundary. See [the exact B1 repair report](palette-name-escape-fix.md).

**Automated integration gates pass; not self-approved and not P4/release acceptance.** Final source browser **55/55**, final built browser **10/10**, focused shared units **17/17**. All original30 behavior protections and nine real format downloads are covered. No remaining known automated blocker in A's exercised slice. Independent A/combined review and parent-owned whole-tree/workspace/engine checks remain required.

Branch `gloin/editor-redesign`, HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`; historical source `8c6613279ed856e4933608e7e6c04e91dca2b331`. No commit/push/remote operation, dependency, tracked app/CI configuration, store/hook/engine/builder or B/C/D widget implementation edit by A. Normal app/SDK builds ran serially only after all three widget handoffs. Frozen B/C/D handoff hashes were read back: **19/19 implementation/dedicated-test entries match**, recorded in the final manifest.

## Delivered shared integration

- Composes D's real finite renderer presenter → C Palette → D refinements, with each control once; narrows ExportPanel to the six frozen output-only props. The single existing controller remains in Layout and the single native project input remains in header ProjectActions. Adds the required Composition heading above A-owned pose/light wrappers. B's committed source navigation handle and C's controlled browse/name seams use the already-frozen APIs unchanged.
- Fixes a real departing-Radix-FocusScope race: retain the same generation's responsive destination through `onCloseAutoFocus`, invalidate on newer navigation/Help/source actions, and never use a timer, retry loop or unconditional late focus. Regression covers repeated Close/reopen → desktop with retained name, one renderer/refinement/input and one manager constructor in the real Layout/controller test with the engine test double. Real browser canvas/job identity corroborates that lifetime.
- Gives primary hover an accent edge while retaining the accepted hover fill/tokens; actual native/portal/selected/invalid/disabled text and required UI/focus checks meet unchanged4.5:1/3:1 floors. No shared token/BTN/validator/widget API changed.
- The new empty-image Demo action now invokes the existing model source bridge before the unchanged demo handler. Original empty-model Demo behavior, fetch and the **entire source/controller-effect section** remain byte-identical to historical baseline; segment SHA256 `0fa99880a84558c3843f08321e6b34e26b11316cf34018fd16249b88ee8d7281`. R1 actually presses Demo and verifies the real `david_head.glb`, loaded notice, model kind, invitation removal and canvas identity.

## Files written in this P3 slice

Production/shared: `Layout/Layout.jsx`, `Layout/Layout.test.jsx`, `PreviewCanvas/PreviewCanvas.jsx`, `src/app/styles.css`.

A-owned fixture/browser files: `ColorPalette/paletteHarness.jsx`; `test/e2e/ui-foundations.spec.js`, `palette.spec.js`, `export.visual.spec.js`, `ascii-generated.spec.js`, `foundation.spec.js`; new `redesign-artifacts.spec.js`, `utils/editor.js`, `utils/exportApp.js`. Documentation: this handoff. Earlier accepted P1 changes elsewhere in the dirty tree and all B/C/D changes are not newly authored P3 work.

The standalone palette harness puts its real Outside destination before the compact picker and explicitly supplies a1200px document-scroll surface. This preserves the original native outside-cancel and nonhandle-touch-scroll tests after the preset wall became collapsed; no forced click, added cancel handler or C code repair bypasses those behaviors. ASCII comparison archives/cache/output are isolated outside the app root, with a private non-reused host, explicit filesystem allowance/deduplication and unchanged glyph/color/reference assertions.

## Final executed gates

All Node commands used scoped Node20 (`v20.20.2`), direct installed JS entrypoints and no dependency install. Evidence root:

`/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p3-evidence/`

| Gate                                                                           | Actual final result                                                                                             | Evidence                                     |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Source external config, full match list                                        | **Exit0,55 passed**, 464.40s; zero skipped/flaky/retries                                                        | `source-report.json`, `source-verified.log`  |
| Normal `npm run build -- --outDir <evidence>/dist` including SDK prebuild/copy | **Exit0**, final candidate compiled after Demo display fix                                                      | `app-build.log`, `serial-gate-results.json`  |
| Built external config, full10 cases at90000ms/retries0/workers1                | **Exit0,10 passed**, 339.28s; zero skipped/flaky                                                                | `built-report.json`, `built-final.log`       |
| `vitest run Layout.test.jsx ProjectActions.test.jsx` after final app changes   | **Exit0,2 files/17 passed**,16.78s                                                                              | `shared-unit-final.log`                      |
| Explicit changed-slice JSX/browser ESLint                                      | Exit0 before final documentation; final separate rerun recorded below                                           | No ignored-file waiver or rule/config change |
| SDK identity/alias/gzip                                                        | Package/public/isolated-dist bytes identical; no `@engine`; actual `gzip -c ... \| wc -c` **46708bytes ≤51200** | Served manifest + final readback             |

Exact browser invocations from repository under the Node20 recipe:

```sh
node node_modules/@playwright/test/cli.js test --config=/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p3-evidence/playwright.redesign-source.config.mjs
npm run build -- --outDir /home/agent/.hermes/profiles/gloin/cache/scratch/bf-p3-evidence/dist
node node_modules/@playwright/test/cli.js test --config=/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p3-evidence/playwright.redesign-built.config.mjs
node node_modules/vitest/vitest.mjs run src/app/components/Layout/Layout.test.jsx src/app/components/Layout/ProjectActions.test.jsx
```

External configs are parent-authorized evidence files, not tracked CI/app changes. Source5207 uses unique cache/HMR:false; built5208 serves the isolated normal build, reuse:false. Both configs are90000ms/retries0/workers1 with runner-owned retain-on-failure tracing. `--list` discovery logs prove source55 and built10. The old180000ms dev export runner is not claimed as final acceptance. Existing120000ms download wait does not extend the90000ms test deadline.

### Source/build identity

`integration-final-manifest.json` aggregates actual report counts, full artifact hashes, worker frozen hashes, served identities and screenshot paths. `source-verified-before/after.json` proves the **entire app/source-runtime and source-suite dependency graph stayed unchanged**. Two built-only files (`redesign-artifacts.spec.js`, `utils/exportApp.js`) were completed during that source run; neither is imported by its three source suites. This is not a claim that all165 hashes were unchanged in that window. An earlier complete source55 run did have all165 unchanged.

Final `built-final-before/after.json` matches **all208 source/test/dist hashes**, including those finalized built harnesses. `verify-built-identity.mjs` fetched and byte-compared actual served HTML, entry JS, Three chunk, CSS and SDK to dist. Current SDK SHA256 is `127c05aa02e87206b6ebbd18790d6e19443a29996f18e65e20436b5ec809401b`; complete served hashes are in `served-built-identity.json`. No dev-store import or builder substitution occurs in built UI cases.

## Retained30 and added acceptance

Source55 is **40 UI +11 palette +4 source generated-ASCII comparisons**. The original19 UI/11 palette scenario protections remain mapped to U01–U19/P01–P11 in the accepted plan; adaptation changes their task/global-heading/backdrop/project locations, not their assertions or budgets. Native chooser interception is armed before NAV. Native Enter/Space, rollback/drop/external mutation, touch CDP events, focus containment/inert ancestry/body-style restoration, distinct close/reopen nodes, two-frame autofocus stability, zero frozen notice mutations/one latest resume, save payload/count/error recovery and nonblank preview floors remain exercised.

New coverage includes freely pressed native tasks; mounted hidden panels; all four empty-source routes plus actual Demo; all R1 short/offset rectangles; deep Look/Motion/Export reset and explicit reveal ordering; same-breakpoint input reach; durable tone/texture/browse/name state; parent pointer-before-blur barriers; active-drag task hide; actual control contrast; long errors and state captures. R2 asserts zero history across task/scroll/collapse, accounts separately for the deliberate source setter, then proves modal/breakpoint navigation adds none. It does not redefine an intentional source selection as UI-only history.

The finite four new artifact cases are exactly GIF, React, Web Component and Embed. GIF now also exercises a **real pending job** through task change, mobile open/Close/reopen and both breakpoints, requiring one canvas, continuing disabled busy action/Cancel, correct Export heading focus and exactly one real download. `real-pending-export-mobile.png` shows the actual Encoding GIF percentage. Cancellation/late-result/controller concurrency remain covered by retained real-controller hook/unit tests; no fabricated codec/download/progress response is used.

## Finite nine-format artifact ledger

Every row is a successful actual **built UI** choice/action/download, not selection alone. Paths below are under `built-artifacts/`; full SHA256 values and exact test titles are in the manifest.

| Exact ID       | Actual saved artifact    |   Bytes | SHA256 prefix  | Result |
| -------------- | ------------------------ | ------: | -------------- | ------ |
| `apng`         | `exported.apng`          |  466783 | `bc8574916ae1` | Pass   |
| `gif`          | `redesign.gif`           |  935205 | `57494f6837ae` | Pass   |
| `webm`         | `exported.mp4`           | 6701178 | `399b300d1f96` | Pass   |
| `spritesheet`  | `sprite-sheet.png`       |  703276 | `0fee678fd896` | Pass   |
| `css`          | `css-export.zip`         | 1255771 | `42233e12a9de` | Pass   |
| `react`        | `MyAnimation.zip`        |  170433 | `0853d08240fb` | Pass   |
| `webcomponent` | `bitmap-animation.zip`   |  171979 | `f5c5d4995ca1` | Pass   |
| `embed`        | `my-animation-embed.zip` |   48528 | `724c6f8c723d` | Pass   |
| `zip`          | `code-export.zip`        |  170685 | `97ad0a31c0ab` | Pass   |

- GIF: actual Chromium ImageDecoder decoded **181frames** with positive durations and differing decoded frames; 154 meet unchanged occupancy/color/APNG entropy floors. Metrics plus a decoded PNG attachment are retained.
- APNG/Sprite/Video retain every original decode/content assertion. Video selected the real MP4 container, sought past fade and awaited decoded seek.
- CSS retains the observed384×320 viewport fixture, full **181 unique stops**,2304×9920 atlas, complete11283.185307179585ms loop and two meaningful differing runtime frames. No frame/time/quality waiver.
- React/Web Component actual ZIPs preserve selected nondefault ASCII blocks/monochrome, palette and real engine/model bytes; source-only fresh generated comparisons separately retain both color variants. They are not relabelled uninstrumented built runtime tests.
- Code ZIP retains unchanged downloaded JavaScript byte equality, initial/viewport/container/hidden/reveal size checks, meaningful frames and error/request assertions; only HTML dependency resolution changes.
- Embed uses unchanged downloaded SDK/payload/model; SDK equals the actual served build. Real `<bitmap-forge>` renders meaningful initial600×600 and container-only384×320 canvases with matching backing/rendered sizes, no failed local requests/page errors, then Image→Embed preserves the exact disabled reason/action and produces no download. No prototype patch, `setSize`, model injection or runtime repair.

## Visual evidence and critique

**103 final source PNGs** under `source-results/`: empty/loaded/loading/Source/Look/Motion/Export/invalid/busy/error/success/Help at1440×900,390×844,320×568,667×320 and640×400; original1280/1024/1023 transitions; fresh model/image short routes; H320/T0,H280/T40,H220/T40; deep task controls and revealed invalid error. Loading/error/synthetic busy/success screenshots use the real store/presenter fixture and are not represented as measured network/encoder operations. Real Demo/model upload and real built encoder/runtime cases supply separate operation evidence.

Four supplemental final live-source captures were saved uniquely and count-verified under `manual/`: desktop browse/name, desktop pose+lighting, retained mobile name, short-height light controls. The same actual main canvas survived every step; mobile reopened with Close focus and the name retained without autofocus; short final light target measured192.67×44 with bottom303 inside320. The browser-use tab initially needed foreground activation before its emulated media/rAF events; correct stabilized views were recaptured, not accepted as a1440px mobile-layout claim.

Inspected actual desktop Look/Export/composition, narrow retained name/invalid/long error, short Help/light, loading and real busy-GIF images. Continuous graphite inspector, readable cobalt pressed/focus markers and separated renderer/palette/refinements retain artwork priority without new fonts, decorative motion, fake project/cloud state or camera/framing changes. Expanded palettes and lower controls deliberately scroll; screenshots do not claim every control simultaneously above the fold. Full-width Collapse settings remains the parent's **optional** compact-row redline, not a behavior waiver.

## Diagnosed failures retained, not erased

- Initial focused source:3 pass/1 fail from checking the Preview element's own inert property after inert moved to the workbench ancestor. Adapted to actual inert ancestry and retained the real focus trap.
- First long source attempt: exit130,6 completed passes/1 timeout/1 deliberately interrupted/41 unrun after the compact popup occluded the old fixture's outside button. Native fixture geometry was repaired as described; no timeout raised. Files under `interrupted-harness-*`.
- Second source attempt:43 pass/6 fail. Four new R1 selectors accidentally chose hidden Export options, native summary lookup was wrong, and repeated modal-close resize exposed the genuine shell focus race. Repairs and focused runs precede the final passing source run. The stable54 attempt's last failure was the new test counting its intentional source write as navigation history; split assertions now expose both actions explicitly.
- First complete source55/build/built10 passed; retained `first-complete-*` evidence predates only the final Demo button completion.
- Later complete built attempt:9 pass/1 failure, `locator.screenshot: Element is not attached to the DOM` during Embed initial loading, with no runtime/request errors. Diagnosis: SDK creates its initial canvas, awaits the real model, then installs its configured renderer (`BitmapForgeElement.js`70–115). The old screenshot could resolve the legitimately retired initial canvas. The harness now observes read-only `_loading===false && _manager.hasObject()` **inside the same18-second meaningful-frame poll**, rechecks the current backing/rendered dimensions, then screenshots. No runtime/manager mutation, threshold relaxation or test-budget increase. Focused Embed30.8s and final full10 subsequently passed. Failure logs/report/trace remain under `embed-readiness-failure-*`.
- That actual runner-owned failure trace was read back: CRC valid, SDK and `animation.bforge` requests/navigation plus original screenshot error present, no duplicate-start error. One trace owner is preserved. Earlier native-label lookup and transparent-boundary calculation mistakes were fixed in tests rather than hidden by forced interactions.

## Live review target and remaining gates

Source-only review app: **http://127.0.0.1:5207** from the exact external source config. Owned server `proc_24e28dd46f40`; parent handoff is recorded at completion. Test-runner servers5207/5208 and all bounded test jobs exited; no unrelated server was killed. The live server is source evidence, not a deployed or built target.

Parent still owns independent A/combined implementation review and final P4 root lint/format/unit, embed/decode/CLI/engine/browser-smoke/workspace gates. This child did not substitute focused tests for those whole-tree checks. `plan-acceptance.md` is currently individually Prettier-clean; A did not edit that reviewer's file. No baseline-relative input-latency/FPS benchmark, real desktop browser-menu200% zoom, physical mobile keyboard/touch, Safari or AT certification is claimed.640×400 is automated reflow evidence; touch evidence is Chromium CDP emulation. These limits must remain visible in final delivery.

## Review-candidate A identities

| File                                                 | SHA256                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| `src/app/components/Layout/Layout.jsx`               | `cc57f06d662b706abe831c1c65e2d607b8a5d7818c4127036cab123fd6d701a6` |
| `src/app/components/Layout/Layout.test.jsx`          | `bc5cc2968df1efdb93fd432384ad42386e3b692298aee935f72c3937c9158579` |
| `src/app/components/PreviewCanvas/PreviewCanvas.jsx` | `00c1a269d31eeae2a1c6d3910d1bb541bd60c3173ec4dd469a2422a098879607` |
| `src/app/styles.css`                                 | `2a016e53fcbb49904a7d052703c340e403414192b27041264795be5a1e811568` |
| `src/app/components/ColorPalette/paletteHarness.jsx` | `2f81b32d928d5b27411e4361f779d756ef271d7c8d887acbaabb5d676733b284` |
| `test/e2e/ui-foundations.spec.js`                    | `76c484c66c879d6897d5555f0b8ee431600206b426d020c4f21350709c329c61` |
| `test/e2e/redesign-artifacts.spec.js`                | `935e5452a14dace0721b6c766ebf8494fcef55570e2e15be60a3c8a72d69ee26` |
| `test/e2e/utils/exportApp.js`                        | `237792ab1d33594a488f5f7370d32863842bc18a3b4e233e118cf7028207ddb0` |

No self-approval, Git publication, PR, merge or deployment is implied by this handoff.
