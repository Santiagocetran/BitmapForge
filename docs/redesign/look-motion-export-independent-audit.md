# Independent D Look, motion/composition and output audit

## Verdict: ACCEPT D behavioral/source slice; formatting clearance remains pending

**No blocking implementation defect found in D's five components or dedicated tests.** The frozen interfaces, retained controls and output-only separation are accepted for integration. This does not accept the entire redesign, clear the unexecuted independent formatting gate, or certify generated artifacts. A retains the final combined-tree/browser/build/download gates.

Reviewed branch `gloin/editor-redesign`, HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`, against source baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`. All ten actual implementation/test SHA-256 values matched the exact manifest in [D's handoff](look-motion-export-handoff.md). Changes remain uncommitted in a shared checkout; unrelated owners' files are not attributed to D.

## Scope and independence

Read root `AGENTS.md`, accepted specification/state contracts/plan acceptance, frozen foundation interfaces and independent foundation acceptance, D's handoff, the scoped source diff and dedicated tests. Loaded the required web-product-development, frontend-direction and editor-redline skills. `CODEX.md` and the four requested COLLAB bootstrap files are absent. No private memories were inspected.

The review allowlist was QualitySettings, AnimationControls, RotationGizmoPanel, LightDirection and ExportPanel, each with its dedicated test file: exactly the ten manifest files. Layout and ProjectActions were read/tested only to inspect the already integrated seam. **This audit is the only repository file written by this reviewer.** No application, test, configuration, dependency, engine, store, hook, browser-harness or Git/remote/deployment change was made. Browser evidence was written outside the repository.

## Independently executed checks

Runtime recipe: `npx --yes --package=node@20 -c '…'`; actual runtime **v20.20.2**, using installed direct tool entrypoints.

| Gate                                                                                                                                    | Independent result                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vitest, `run --maxWorkers=1`, five D dedicated files, useExportController, useExport, animationSlice, renderingSlice and ProjectActions | **Exit 0; 10 files / 79 tests passed, 71.98s.** No timeout or assertion changes.                                                                                                              |
| Explicit ESLint `--ext .js,.jsx` over the ten D files                                                                                   | **Exit 0; no diagnostics or ignored-file warnings.**                                                                                                                                          |
| Actual file hashes compared with D's manifest                                                                                           | **All ten matched.**                                                                                                                                                                          |
| Baseline diff for `src/engine`, `src/app/store`, `src/app/hooks` and GizmoCanvas                                                        | Empty: these implementation paths remain unchanged from the source baseline.                                                                                                                  |
| Independent Prettier / diff-whitespace / ignore-path recheck                                                                            | **Not executed: a batched tool invocation was held for approval before any of its commands ran.** No independent formatting pass is claimed; D's reported passes remain author evidence only. |

Exact independent test invocation, inside the Node20 recipe:

```sh
node node_modules/vitest/vitest.mjs run --maxWorkers=1 \
  src/app/components/QualitySettings/QualitySettings.test.jsx \
  src/app/components/AnimationControls/AnimationControls.test.jsx \
  src/app/components/LightDirection/LightDirection.test.jsx \
  src/app/components/RotationGizmo/RotationGizmoPanel.test.jsx \
  src/app/components/ExportPanel/ExportPanel.test.jsx \
  src/app/hooks/useExportController.test.jsx \
  src/app/hooks/useExport.test.js \
  src/app/store/slices/animationSlice.test.js \
  src/app/store/slices/renderingSlice.test.js \
  src/app/components/Layout/ProjectActions.test.jsx
```

Expected injected encode/ZIP/MediaRecorder/save-failure stderr and jsdom navigation notices accompanied passing regression cases. They were not silently relabelled as real export success. An initial shell-quoting failure and an overescaped range-inventory diagnostic produced no valid range-comparison evidence; both were discarded. The retention conclusions below use the actual baseline/current source and executed control assertions, not that diagnostic's empty-array equality.

## Retained-control and frozen-API dispositions

Ranges below are UI declarations; an omitted step retains the native default step of 1. Existing store bounds, defaults and loaded-value handling are not redefined by these UI ranges.

| Area                             | Reviewed retained contract and result                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Finite QualitySettings presenter | Default `part='all'`; `renderer` only renders registry/mode details; `refinements` only Tone & background and Texture effects. Uses frozen `contracts.qualityPart`, optional boolean/function validators and independent nullish local-false fallbacks. Current controlled callbacks are used. Both presenters together have no duplicate IDs or controls. Callable propTypes metadata is not claimed as React 19 automatic runtime validation. |
| Renderer registry                | Existing `bitmap`, `pixelArt`, `ascii`, `halftone`, `ledMatrix`, `stipple` derive from `pluginRegistry.listRenderers()`, not a replacement hardcoded selector. All six actual source-app selections were inspected.                                                                                                                                                                                                                             |
| Bitmap / Pixel Art               | Pixel size 1–20 and original `setPixelSize`; no mount-time clamp of a loaded size 30. Bitmap dither is immediately visible, bitmap-only, with `bayer4x4`, `bayer8x8`, `variableDot`, `floydSteinberg`, `atkinson` and unchanged setter.                                                                                                                                                                                                         |
| ASCII                            | Existing classic/blocks/dense/minimal ramps, Colored Mode checkbox and character size 8–32px. Existing store behavior, including its ASCII size floor, is retained. No rendering/source-RGB algorithm change.                                                                                                                                                                                                                                   |
| Halftone                         | Spacing 4–20px, circle/diamond and screen angle 0–179°, original setters. No dormant metadata controls added.                                                                                                                                                                                                                                                                                                                                   |
| LED Matrix                       | Spacing 4–20px, gap 0–4px, circle/roundRect and original setters.                                                                                                                                                                                                                                                                                                                                                                               |
| Stipple                          | Cell size 4–20px, dot size 1–6px and density 1–5, original setters.                                                                                                                                                                                                                                                                                                                                                                             |
| Tone / background / seed         | Invert checkbox, minimum brightness .01–.5 step .01, original setters; auto/eight-digit-hex seed display, randomize and nullable reset, explicit fade-animation explanation. Transparent is a pressed native button with a check marker; associated native Background color input preserves actual output-setting writes, not theme writes.                                                                                                     |
| Texture effects                  | Independently controlled disclosure. CRT checkbox gates gap 2–8px, opacity .1–.8 step .05, chromatic aberration 0–5px step1 and vignette 0–1 step .05. Grain gates amount 0–.5 step .01 and Monochrome checkbox. Color Shift gates hue 0–360° step1 and saturation 0–2 step .01. All original setters/conditional values survive disabling/re-enabling.                                                                                         |
| Loop animation                   | Native fade checkbox; named native Fade direction fieldset with both/in/out; named Fade style fieldset deriving existing Cascade/Static/Glitch/Drift/Scatter constants. No mutually exclusive replacement for effects.                                                                                                                                                                                                                          |
| Motion / Timing                  | Eight independently combinable Spin X/Y/Z, Float, Bounce, Pulse, Shake, Orbit checkboxes. Speed .05–2 step .01, rad/s; fade duration 300–8000ms step100 and show duration 1000–40000ms step500 remain fade-conditional, with hidden values retained.                                                                                                                                                                                            |
| Static composition               | Explicitly described as static pose before animated Spin. Existing gizmo remains, XYZ −180–180° step1, degree/radian conversion and other-axis preservation unchanged. Reset remains disabled only at exact zero. Dedicated test mocks only GizmoCanvas; actual app also displayed the real gizmo. R shortcut implementation is untouched, not newly certified here.                                                                            |
| Light                            | Nine original vectors remain: NW(−3,4,5), N(0,5,5), NE(3,4,5), W(−5,2,3), C(0,3,5), E(5,2,3), SW(−3,1,−4), S(0,1,−5), SE(3,1,−4). Native 3×3 buttons have full direction accessible names, pressed states and noncolor markers. Executed test asserts every exact vector.                                                                                                                                                                       |
| Output API                       | Exactly `selectedFormat`, `onSelectFormat`, `exportSelected`, `cancelExport`, `exporting`, `disabledReason`; no project callback requirements, input/ref, hook/controller, builder or status presenter added to ExportPanel. Stable useId description/reason association, generic disabled Exporting… and reachable Cancel remain.                                                                                                              |
| Nine formats                     | Exactly apng/gif/webm/spritesheet/css/react/webcomponent/embed/zip, one named Export format group, three purpose headings and two-column wrapping native choices. Every ID/action route passed dedicated tests; all nine real source-app selections/descriptions/actions were also enumerated. Selection does not invoke export.                                                                                                                |
| Honest output descriptions       | APNG alpha; GIF 256-color/limited-alpha; Video browser-codec-dependent MP4/WebM; sprite grid; sprite/CSS files; live-engine React/custom element; self-hosted Embed rather than publication; developer source archive. No new capability or hosted-URL claim.                                                                                                                                                                                   |

The five dedicated files contain 38 passing tests within the independently executed 79-test command. Their control assertions exercise real store setters, not screenshots/classes alone. ExportPanel's route fixture proves presentation dispatch, not archive construction or downloaded-byte validity.

## Integrated seam inspection

The current A-owned Layout has renderer → Palette → refinements with explicit parts, a visible **Composition** heading, and Rotation Offset / Light Direction wrappers owned by Layout. The missing heading noted in D's handoff is therefore no longer an open finding. Both wrappers remain controlled and keep their widget contents mounted while hidden.

Layout has one `useExportController()` invocation, passes the six explicit output props, and gives ProjectActions save/load from that same controller. The real inspected app has one `.bitmapforge` file input. The unchanged ProjectActions dedicated test passed reset-before-callback, repeated same-file, native-cancel/empty selection and supplied-command paths. These checks accept D's removal of duplicate project presentation; they do not independently accept every concurrent A lifetime/focus transition.

## Independent real-app visual and keyboard evidence

Used the existing source target `http://127.0.0.1:5197`, not a new build/server/export workload. Read the external `historical-audit-server.mjs`: it identifies this exact repository root, isolated external cache, strict port 5197 and HMR disabled. The loaded app displayed the reviewed presenters. A reload after viewport emulation was needed to obtain the desktop responsive tree; initial missing-button probes are not counted as interaction passes.

Evidence session: `independent-d-review`. Evidence directory:

`/home/agent/.hermes/profiles/gloin/cache/browser-use/workspace/sa-0-a383f6e0/`

Observed and directly inspected actual app captures:

- `independent-d-look-desktop.png` — 1280×800 renderer/dither immediately visible above Palette; calm graphite/cobalt hierarchy, no competing decorative motion.
- `independent-d-motion-320.png` — 320×568 native fade/radio grouping and pinned navigation; the last style continues in the intended body scroller, not a removed control.
- `independent-d-pose-320.png`, `independent-d-light-320.png` — actual gizmo/axis controls and spatial light grid. Selected check and independent focus remain distinguishable.
- `independent-d-output-320.png` — long Web Component label wraps inside its choice; selected check/marker and separate keyboard-focus outline coexist. The final disabled-Embed capture separately proves action/reason reach.
- `independent-d-tone-320.png` — Transparent label is uncut and its target measures 103×44; native color input fits alongside it.
- `independent-d-texture-320.png` — focused last Saturation range measures 271×44 at y507–551 within the 568px viewport, with no covering sticky action.
- `independent-d-embed-disabled-320.png` — actual controller reason and disabled Export Embed remain fully reachable.

Independent interactions:

1. Native ArrowRight on Speed changed its actual UI value/label from 1.00 to **1.01 rad/s**, retaining input focus. A real pointer click on Spin X left both Spin X and existing Spin Y checked.
2. Native ArrowRight on Rotation X produced **X: 1°** and enabled Reset, while the actual gizmo remained displayed. Unit assertions separately prove radians and all three axes.
3. Real pointer selection of South west left only that native button pressed, with its check. All nine light choices measured **77×44** at 320px. Exact vectors are grounded by the executed store tests, not inferred from this screenshot.
4. Native Space selected Web Component with a separate **2px accent focus outline**; native ArrowRight in Fade direction selected `in` and deselected `both`, preserving radio semantics.
5. Opened Tone and Texture and enabled CRT, Grain and Color Shift in the real app; the final texture input was focus/reveal reachable. No document horizontal overflow was observed in these narrow checks.
6. Image → Embed produced exactly `Image input cannot be embedded — switch to model, shape, or text.`, associated to a disabled Export Embed action. One header-owned project input remained.

`independent-d-renderer-selections.json` records all six real mode/detail inventories, and `independent-d-output-selections.json` records all nine pressed choices/descriptions/action labels. Both batches were saved, reread, counted and uniqueness-checked programmatically. The final live DOM had no duplicate IDs. These enumeration probes use DOM change/click dispatch; only the explicitly named keyboard/pointer checks above are native-input evidence. No output action or download was invoked by this review.

## Limits and remaining gates

- **Independent formatting clearance is still pending approval.** The held batch included the scoped Prettier check, diff-whitespace/ignore recheck and a corrected optional range diagnostic; it did not run. Do not adopt D's author-reported formatting passes as this reviewer's execution. The optional diagnostic is not required to replace the successful source/control comparison. The newly written audit document itself was subsequently formatted and independently checked with Prettier (exit 0); Git reports it as an untracked, nonignored file. A final SHA-256 readback confirmed all ten reviewed code/test hashes were still unchanged.
- A owns the final all-state desktop/mobile/landscape/zoom/reduced-motion, R1/R2 geometry, remount/cancellation/focus and pending-export browser matrices. This bounded inspection does not certify those matrices or native controls across browsers.
- No root suite, build, heavy export, generated runtime, decoded artifact or downloaded file was executed while A's serial pipeline was active. All nine real built-UI download/runtime/quality gates remain mandatory, including GIF decoding and supported-source Embed initial/container-only sizing. A selection/dispatch pass is not artifact acceptance.
- Physical mobile keyboard, physical touch, Safari and assistive-technology checks were unavailable. Gizmo pointer-drag behavior and R shortcut were not re-exercised; their implementations remain unchanged.
- No D code repair is requested. Final acceptance still requires the pending independent format gate and A's combined-tree gates; no publication or deployment is implied.
