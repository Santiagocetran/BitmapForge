# B — Source slice handoff

## Disposition

**Implemented and locally verified; ready for independent slice review.** This is not independent acceptance or final integrated release clearance. Consumes independently accepted P1 frozen interfaces without changing shared files. Branch `gloin/editor-redesign`, HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`, historical source baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`. No commit, push, dependency, engine, store, browser-harness, build, or repository configuration edits by B.

## Exact files

Modified:

- `src/app/components/InputSource/InputSource.jsx`
- `src/app/components/ModelUploader/ModelUploader.jsx`
- `src/app/components/ImageInput/ImageInput.jsx`
- `src/app/components/ShapeSelector/ShapeSelector.jsx`
- `src/app/components/TextInput/TextInput.jsx`

Added:

- `src/app/components/InputSource/source.test.jsx` — dedicated source-only regression coverage.
- `docs/redesign/source-handoff.md` — this report.

The preexisting `src/app/components/ModelUploader/ModelUploader.test.jsx` was exercised unchanged. Other concurrent tree changes belong to A/C/D and were neither modified nor claimed by B.

## Implementation

- Four native Source type buttons in a named group, all visible, 44px shared choices, real `aria-pressed`, check marker plus the frozen selected edge/underline. Eight named shape buttons use two columns instead of four cramped columns; current shape has the optional ref and pressed semantics.
- Uses frozen `bf-*` field/range/choice/label/help/value styles and BTN aliases. Removes legacy zinc/emerald selection, tiny controls, and the 200px-tall model invitation. No shared CSS changes or competing color utilities.
- Labels explicitly associated with every source textarea, select and range. Readout values sit outside labels, so accessible names remain stable. Model/image scale has factual associated help distinguishing source geometry from workspace zoom. Text guidance states the existing 200-character limit.
- Geometry, defaults, ranges, steps, shape generator/labels, seven existing fonts, setters, scoped text reset, inactive source configurations and conditional visibility remain unchanged. Shape geometry stays visible; text geometry remains visible without another disclosure.
- Loaded metadata shows source kind, actual filename with full title/accessibility, and original actual-size KB readout. Replace remains secondary; Remove uses the quieter frozen danger treatment. Image guidance explicitly includes PNG, JPG/JPEG, GIF, WebP and SVG; no animated-source-GIF playback claim.
- Preserves actual `useDropzone` accepts, single-file limit, `noClick`, native input/open callback, drag/drop replacement, rejection handling, model >2MiB warning and existing remove/status semantics. No fake metadata, new resource-repair promises, automatic chooser opening or source-loading rewrite.

## Frozen bridge completed

`InputSource({ navigationRef })` publishes `{ focusSource(kind): boolean }` in a layout effect with identity-guarded cleanup. Own refs remain local. Exact optional child props:

- `ModelUploader.chooseButtonRef` — Choose File / current Replace button.
- `ImageInput.chooseButtonRef` — Choose Image / current Replace button.
- `ShapeSelector.selectedShapeRef` — currently selected native shape button.
- `TextInput.textareaRef` — native textarea.

Only `model|shape|text|image` are recognized. Missing/unmounted, disconnected, disabled, hidden/inert/aria-hidden, invisible or layoutless controls return false. Success focuses with preventScroll, verifies actual activeElement, then instant-nearest reveals. No source setter or synthetic activation in this method. Ref targets update with source/shape/loaded state without stale closure capture. Cleanup only clears its own handle. Reuses shared `navigationRef` and `headingRef` callable metadata; no validator changes. React 19 direct validator tests cover positive/negative values rather than claiming automatic runtime prop checking.

## Verification — final source content

All commands ran under Node 20 using `npx --yes --package=node@20 -c 'node …'`.

| Gate                                                                                                                               | Result                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vitest run src/app/components/InputSource/source.test.jsx src/app/components/ModelUploader/ModelUploader.test.jsx --maxWorkers=1` | **25 passed**, 2 files; final duration 40.02s. New source file 21 tests; unchanged uploader file 4.                                                                                                                                                                               |
| `eslint --ext .js,.jsx` over the exact six implementation/new-test files                                                           | **Exit 0**, no diagnostics; JSX explicitly included.                                                                                                                                                                                                                              |
| `prettier --check` over the exact six implementation/new-test files                                                                | **Exit 0**, all formatted.                                                                                                                                                                                                                                                        |
| `git diff --check --` the five source component directories                                                                        | **Exit 0**.                                                                                                                                                                                                                                                                       |
| Final real Chromium live-app matrix                                                                                                | **12/12 routes**: four sources at 1440×900, 390×900 and 320×568. Each committed native target focused; all source choices ≥44px in both axes; no document horizontal overflow; navigation did not open native chooser.                                                            |
| Native keyboard chooser roundtrip at 390×900                                                                                       | Model and image: Enter on focused Choose opens one real single-file chooser, loads a real OBJ/PNG fixture; Space on Replace opens second real chooser, replacement filename appears; Remove returns empty chooser. **Four real chooser events total, none caused by navigation.** |

New source unit tests cover all four source selections/inactive configuration retention, all eight shape names/ranges/setters and selected refs, all seven fonts/text setters/reset, both scale ranges/readouts, metadata, committed publication from parent layout effects under StrictMode, negative target availability, newer-handle cleanup protection, source/shape/loaded-target updates, real dropzone acceptance/replacement/rejection/multiple-file rejection/noClick, model size warning and direct source-ref validators.

Browser checks were one-off tool execution, **not edits to A-owned browser harnesses**. Isolated Vite port 5187, dedicated outside-repo cache, HMR disabled and watcher null; server was restarted after final source edits to clear transform cache. No root/full suite or built/export artifact gate was run while workers were active.

### Evidence locations

Outside-repository folder:

`/home/agent/.hermes/profiles/gloin/cache/scratch/bf-source-evidence/`

- `final-browser-results.json` — all 12 route assertions.
- `final-1440-{model,shape,text,image}.png`
- `final-390-{model,shape,text,image}.png`
- `final-320-{model,shape,text,image}.png`
- `final-390-model-loaded.png`, `final-390-image-loaded.png`

Directly inspected final desktop Shapes and phone loaded image captures. Clear labels, coherent frozen selection/focus treatment, contained metadata and single inspector scrolling; real default artwork framing remains unchanged. Earlier 390×844 phone and 320×568 reflow inspection also passed. Small PNG and planar OBJ fixtures verify native source loading and metadata, **not artwork quality or export fidelity**.

Temporary external server config: `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-source-vite.config.mjs`; cache `.../bf-source-cache`. These are verification artifacts, not repository configuration changes. Bundled loading of this outside-repo config initially failed resolving `vite/internal`; `--configLoader native` resolved it without dependency/config edits. Initial unit expectation incorrectly treated the model store's `{file,name,size,format}` wrapper as a raw File; corrected test to read its actual `file`. Initial desktop browser selector matched both stage/inspector source buttons; scoped to `.bf-source-routes`, then the full matrix passed. These are resolved test setup issues, not omitted failures.

## Frozen source SHA-256

| File                            | SHA-256                                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| InputSource/InputSource.jsx     | `b99635358acf47b4c8f1f07e6db204137438285500ec039a3b1b55d258b165af` |
| InputSource/source.test.jsx     | `b55e4ea846c5864473919f679169ac7fb89b540ec6ac95da9c43822aa8e9b83b` |
| ModelUploader/ModelUploader.jsx | `ce0b0d902ad3ac3b430eecf76639cd67e5d0c522405366f69bdc57915f8cd86d` |
| ImageInput/ImageInput.jsx       | `231fd1606af9a531e84e8906c75f9a3a309a649bc3013835c27a70a439812ec5` |
| ShapeSelector/ShapeSelector.jsx | `b5adf2140c4c270633250b3705ed83d2c7aa493471314b061c6223dd2fb6be8f` |
| TextInput/TextInput.jsx         | `2528ca5f13d27e9a136229c28e3d8e7bd032303598040715a42c0a5bb65a22d5` |

Paths in this table are relative to `src/app/components/`. Unchanged uploader test hash: `55d42f1b914458f164c15d53b2861dce422f41c208c81c5c2c74655f70f2b5c0`.

## Remaining gates / requests to A

- **Independent B implementation review is pending.** Review only the six source implementation/test files plus this report; concurrent A/C/D edits are not B deliverables.
- No shared API/style/validator changes requested. Production caller already supplies navigationRef; real live-app stage routes now consume the completed bridge.
- A owns persistent browser harness coverage, final integrated full root gates, complete interaction/viewport/zoom/keyboard regression matrix, final built artifact/export routes and cross-widget integration. The one-off matrix above is focused source evidence, not substitution for those gates.
- Physical touch, mobile OS keyboard, Safari and assistive technology remain unverified. Native chooser automation is real Chromium filechooser interception, not physical OS dialog certification.
- Existing exact tiny-file KB display and model/image rejection copy are preserved rather than broadened into unrelated behavioral changes.
