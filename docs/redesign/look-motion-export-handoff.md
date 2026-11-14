# D — Look, motion/composition and output presentation handoff

## Disposition

**Implemented, focused-tested and ready for independent slice review.** Not independently accepted, not final combined-tree acceptance, not built/download/runtime certification.

Branch `gloin/editor-redesign`; HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`; source inventory baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`. Changes remain uncommitted in the shared checkout. Consumed accepted P1 `foundation-interfaces.md` and `foundation-independent-audit.md` plus accepted specification/state/implementation/plan-acceptance documents. No private memories or other profiles were inspected.

## Delivered

- QualitySettings finite `part="all"` default / `renderer` / `refinements`, using frozen `contracts.qualityPart`. Renderer remains registry-derived, preserving six modes and every existing detail/setter. Bitmap dither is visible without opening a disclosure. No mount-time clamping of stored settings was introduced.
- Refinements are only Tone & background and Texture effects. Both are independently controlled via the frozen props, with nullish standalone false/local fallbacks. Fade pattern retains auto/hex seed, randomize/reset and its fade-animation explanation. Native background color has an associated visible label; Transparent is a pressed choice with a noncolor marker.
- Motion has Loop animation, named native Fade direction/Fade style fieldsets, eight independently combinable motion checkboxes, rad/s speed, and separate millisecond Timing. Two-column native radio layouts reduce unnecessary vertical travel without changing values.
- Static pose explains its distinction from animated Spin; the gizmo, radians conversion, all three degree sliders and disabled-at-zero reset remain. GizmoCanvas is untouched. Light retains all nine original vectors in a native 3×3 pressed-button group, with full direction names and a check marker.
- ExportPanel is output-only: exactly the six frozen props, no save/load presentation, refs, project file input or project prop validators. Nine IDs stay unchanged, under three purpose headings in one choice group. Web Comp expands to Web Component. Descriptions describe real generated types/runtime, including codec-dependent Video and self-hosted Embed. Selected description, single export action, disabled reason association, busy label and Cancel remain.
- All widgets adopt frozen bf-\* classes / BTN aliases; no shared CSS was changed. Removed tooltip text from native field labels so accessible names do not include explanatory paragraphs. Essential guidance is visible helper text instead.

## Exact repository writes and SHA-256

Only these ten implementation/dedicated-test files plus this handoff were written by D. The three newly added tests are AnimationControls, LightDirection and RotationGizmoPanel; existing QualitySettings and ExportPanel tests were retained and expanded/adapted.

| File                                                              | SHA-256                                                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/app/components/QualitySettings/QualitySettings.jsx`          | `9c1b9cfcf099dfcefe8224511b5ba50fd9a7f66402c23585f1e58a191a504bad` |
| `src/app/components/QualitySettings/QualitySettings.test.jsx`     | `9f2456e8331af13ad88a408e88ea798d4fd20efedcef024626439196f7de612b` |
| `src/app/components/AnimationControls/AnimationControls.jsx`      | `c26269c6e8c23f445645005d9c1a925f3f9edefdb0c17fcf56b0f318d0689d2d` |
| `src/app/components/AnimationControls/AnimationControls.test.jsx` | `cc920869a8c4ee015fdd1120565ce28671cb8a66e6f4415d24af45aa2bf96ff3` |
| `src/app/components/RotationGizmo/RotationGizmoPanel.jsx`         | `8921a57a57ed0c6ff6e933337036044354f02f82e3ad097cc725179d9b99586f` |
| `src/app/components/RotationGizmo/RotationGizmoPanel.test.jsx`    | `dc159fedfe48ff29fef53d2f5aa4858c4d6d558d63f169706c6d03209fd621d9` |
| `src/app/components/LightDirection/LightDirection.jsx`            | `161d2d0c68e1628a5a08129f0b86a3e15d4ada3a2399de8656ac067c3d600f2e` |
| `src/app/components/LightDirection/LightDirection.test.jsx`       | `98a37513efa54ea5fa0b88a42e3284512d2e8ab23bbbaac039f1d8e47bcb64dd` |
| `src/app/components/ExportPanel/ExportPanel.jsx`                  | `e0b39c7420d71673f7dd3af82a2e5954d2b7d2c07cc2c6c3328a6c8b78db89d1` |
| `src/app/components/ExportPanel/ExportPanel.test.jsx`             | `321275952705a2cedab3976325e8ea062232a9d8a7ef832041c78a65236ba36c` |

No engine/store/hook/builder, GizmoCanvas, helper, browser harness, dependency, configuration or build-output edits. No Git commit, push or remote operation. Other status/diff entries belong to concurrent owners, not D.

## Executed verification

Runtime recipe: `npx --yes --package=node@20 -c '…'`; resolved **v20.20.2**. Direct installed tool entrypoints were used, with no dependency/config changes and no full-root suite during parallel work.

| Gate                                                                     | Actual result                                                                                                                      |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Pre-change QualitySettings + ExportPanel dedicated tests                 | Exit 0; 2 files / 15 tests                                                                                                         |
| Final focused dedicated + existing export/store regression command below | Exit 0; **9 files / 78 tests**, 45.25s                                                                                             |
| A-owned existing ProjectActions test, unchanged                          | Exit 0; 1 file / 1 test, 5.17s                                                                                                     |
| Explicit ESLint `--ext .js,.jsx` over all ten files                      | Exit 0, no diagnostics or ignored-file warning                                                                                     |
| Prettier `--check` over all ten files                                    | Exit 0, all formatted                                                                                                              |
| `git diff --check`                                                       | Exit 0                                                                                                                             |
| Source-baseline range-template inventory comparison                      | Exact ID/min/max/step match: QualitySettings 17/17, AnimationControls 3/3, RotationGizmoPanel 1/1 axis template (still maps X/Y/Z) |

Final regression invocation, inside the Node20 recipe:

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
  src/app/store/slices/renderingSlice.test.js
```

The five D dedicated files contain **38 tests**: QualitySettings 20, ExportPanel 13, Motion 3, Light 1, Rotation 1. Tests exercise all renderer detail fields/ranges, dither/ramp inventories, loaded values beyond UI max, tone/background/seed, every conditional texture setter, local/nullish/current controlled callbacks, mode/remount durability, no duplicate IDs when composing both parts, simultaneous effects and native radios, static pose conversion/reset, nine exact light vectors, all nine export identifier/action routes, busy/cancel/disabled association and absence of project UI/input. The former ExportPanel Load-click assertion moves with the feature to the existing unchanged ProjectActions test; its native input activation, same-file reset, cancel/empty selection and save/load callback protections passed rather than being silently discarded.

### Earlier failures and resolution

Initial parallel focused execution timed out three newly expanded synchronous tests at the existing 5s limit. One-worker reproduction still timed out the dense texture test; a later one-worker run also exposed repeated Light role-query cost. Replaced repeated global computed-role queries with native associated-label queries for ranges/checkboxes/radios, and cached the already role/name-verified light buttons. Bounds/type, names, state readback and pressed-marker assertions remain. **No timeout, retry, fixture or assertion-threshold increase.** Subsequent 38-test and final 78-test runs passed. An intermediate Prettier check correctly failed after test edits; formatting was fixed before the final passing check. Existing injected export/save failure stderr and jsdom navigation notices accompanied passing hook tests.

## Real application inspection

Used the existing source target `http://127.0.0.1:5197`, not a new harness/server/build. Read `/home/agent/.hermes/profiles/gloin/cache/scratch/historical-audit-server.mjs`: exact repository root, external `historical-audit-vite-cache`, strict port 5197, HMR disabled. Inspected actual app screenshots at desktop 1280×800 and narrow 320×568. Later browser calls use session `d-look-motion-output`. No browser files were edited. Native-input/UI probes are supplemental source evidence, not A's complete browser acceptance or downloads.

Evidence workspace:

`/home/agent/.hermes/profiles/gloin/cache/browser-use/workspace/sa-2-beaa3a77/`

- `d-renderers.json`: six actual mode selections/field inventories, saved and read back with unique-count assertion; rerun with the inspector explicitly open after a supplemental closed-inspector probe could not find its task button.
- `d-formats.json`: nine actual pressed selections, descriptions and distinct selected action labels, saved/read back with unique-count assertion; no export actions/downloads invoked by this probe.
- `d-motion-320.png`, `d-composition-320.png`, `d-tone-320.png`, `d-texture-320.png`, `d-export-320.png`, `d-export-desktop.png`, `d-motion-desktop.png`: actual source-app captures. The desktop Motion capture precedes the final two-column radio refinement; narrow Motion captures the final radio layout. These are visual diagnostics, not snapshot baselines.
- Native speed ArrowRight changed UI/store from 1 to 1.01 rad/s. Spin X + existing Spin Y + Orbit remained simultaneously enabled. South west selected the exact vector `{x:-3,y:1,z:-4}`; all nine light buttons measured 77×44 at 320px with no document horizontal overflow.
- Native Space selected Web Component with pressed/check/focus indicators; all nine output choices stayed reachable, wrapping the long label at narrow width. The final action was revealed inside the inspector without covering controls. Earlier native Enter injection without character text did not activate; it is not claimed as an Enter pass.
- Image → Embed displayed the exact controller reason `Image input cannot be embedded — switch to model, shape, or text.` and a disabled Export Embed action. One real `.bitmapforge` input remained in the application, owned by the header.
- Browser redline caught a flex-shrunk Transparent label despite no horizontal overflow. Added `shrink-0` only to that owned button; final narrow bounds were 102.97×44 for Transparent and 160.03×44 for the native color control, both inside the panel.
- Last texture Saturation range retained native keyboard focus and measured 271×44 at y507–551 within the 568px viewport. No chrome/engine animation policy was changed.

## Parent integration / remaining gates

1. A's concurrent Layout now visibly composes renderer → Palette → refinements and passes only the six output props; D did not modify that file. Independently verify that final caller and all combined lifetime/cancellation/remount paths. Add the specification's visible **Composition** heading before A's Rotation Offset / Light Direction wrappers; current inspected Layout renders the wrappers directly after AnimationControls.
2. No new shared class/token need was found; no A CSS request is necessary. Keep frozen focus/selected/disabled semantics when integrating. Native color, check and radio platform rendering still needs the final cross-browser/contrast matrix.
3. **Independent D implementation review remains required.** This author cannot independently accept its own work. Review the exact hash manifest and scoped diff/tests above, not unrelated unfinished shared-checkout changes.
4. A retains all browser harnesses, full R1/R2 geometry/focus/state matrix, root/workspace checks, built application verification and **all nine real downloaded-artifact/runtime gates**. Neither format selection nor unit dispatch is relabelled as downloaded-output acceptance. No builder/source/runtime defect repair was attempted here.
5. No physical mobile keyboard, touch, Safari or assistive-technology certification was available. No publication/deployment was performed.
