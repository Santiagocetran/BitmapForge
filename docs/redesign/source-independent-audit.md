# Independent B/source implementation audit

## Verdict: ACCEPT SOURCE SLICE

**No blocking B/source finding.** The completed source widgets preserve the accepted interfaces and existing source behavior, and the real source-navigation bridge and native keyboard chooser roundtrips passed independent execution. This clears B's bounded slice for A integration, not the combined redesign, built artifacts, release, publication or deployment.

Reviewed branch `gloin/editor-redesign`, HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`; historical baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`. B changes are uncommitted. All six implementation/new-test SHA-256 values in `source-handoff.md`, plus the unchanged uploader test hash, matched actual bytes before and after independent browser execution. Accepted specification and state-contract hashes matched `plan-acceptance.md`.

## Scope and ownership

Read `AGENTS.md`, accepted specification/state contracts/plan acceptance, frozen foundation interfaces, foundation independent audit and B handoff. Loaded required product-development, frontend-direction, editor-redline and browser-reliability guidance. `CODEX.md` and the requested four COLLAB bootstrap records are absent; no private memories were inspected.

Reviewed actual source and historical diff for:

- `InputSource/InputSource.jsx`
- `ModelUploader/ModelUploader.jsx`
- `ImageInput/ImageInput.jsx`
- `ShapeSelector/ShapeSelector.jsx`
- `TextInput/TextInput.jsx`
- New `InputSource/source.test.jsx` and preexisting `ModelUploader/ModelUploader.test.jsx`

Paths above are relative to `src/app/components/`. Concurrent A/C/D changes were not treated as B deliverables. This reviewer changed **only this audit inside the repository**. External diagnostic configuration, script, transformed-module response, screenshots, results and hash manifest are under the active profile's scratch directory. No application, test, shared style, configuration, dependency, engine or store edits; no build, commit, push or deployment.

## Independent execution

All JavaScript checks used Node 20 through `npx --yes --package=node@20 -c 'node …'` from the actual repository. Results below are newly executed, not adoption of the handoff's self-report.

| Gate                                                                                                                                                            | Result                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node node_modules/vitest/vitest.mjs run src/app/components/InputSource/source.test.jsx src/app/components/ModelUploader/ModelUploader.test.jsx --maxWorkers=1` | **Exit 0; 2 files, 25 tests passed** (21 source + 4 uploader), 28.18s.                                                                                                                                                                                                                            |
| Explicit ESLint `--ext .js,.jsx` over the five component files and new source test                                                                              | **Exit 0**, no diagnostics or skipped-JSX warning.                                                                                                                                                                                                                                                |
| Prettier `--check` over those same six files                                                                                                                    | **Exit 0**, all formatted.                                                                                                                                                                                                                                                                        |
| `git diff --check --` the five component directories                                                                                                            | **Exit 0**.                                                                                                                                                                                                                                                                                       |
| Independent standalone Chromium source probe                                                                                                                    | **Exit 0; 12/12 routes**, four kinds at each of 1440×900, 390×900 and 320×568. Correct committed native focus and pressed source selection; every measured source/shape choice at least 44×44; no horizontal document overflow; **zero chooser events from navigation**. No page errors captured. |
| Native keyboard chooser roundtrip at 390×900                                                                                                                    | **Four real filechooser events**: model and image Choose activated by Enter; each Replace activated by Space. Real OBJ/PNG file payloads selected, original then replacement filenames visible, single-file chooser verified, Remove restored the empty Choose control.                           |
| Historical dependency/test identity                                                                                                                             | `shapeGenerator.js`, `useProjectStore.js` and preexisting uploader test are byte-identical to the historical baseline.                                                                                                                                                                            |

Browser evidence was generated independently using:

- Config: `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-source-independent-vite.mjs`
- Probe: `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-source-independent-probe.mjs`
- Evidence: `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-source-independent-evidence/`
- Results: `results.json`; reviewed identities: `source-hashes.json`; screenshots: `{1440,390,320}-{model,shape,text,image}.png`, plus `390-{model,image}-loaded.png`.

The owned Vite target used this exact repository root, strict `127.0.0.1:5319`, a unique outside-root `bf-source-independent-cache`, HMR disabled and `watch:null`. Its actual transformed InputSource response was retrieved successfully before probing. Existing servers, including A's 5207, were not reused or killed. Chooser listeners were attached before navigation, and subsequent chooser waits were armed before native Enter/Space. The standalone probe is focused supplementary evidence, not a replacement or modification of A's persistent browser harness.

## Contract findings

### Controls, values and existing behavior — accepted

- All four exact source IDs remain native pressed choices in named `Source type`; source changes still call the existing setter and do not rewrite remembered source configurations. The source-only regression checks state readback, not merely CSS.
- All eight shapes retain registry-derived names/IDs, `getDefaultParams` fallback, conditional geometry and exact declarative ranges/steps. The config table is unchanged from baseline. Every shape's parameter setter is exercised against actual store state. Two-column named choices replace cramped four-column controls without changing generators/defaults.
- Text retains placeholder/default behavior, 200-character maximum, all seven exact font values, size `.2–2/.1`, spacing `−.2–1/.05`, depth `.05–1/.05`, bevel and scoped reset. Associated native labels replace unbound labels; readouts do not contaminate accessible names. Geometry remains visible, with no new disclosure state.
- Model/image scale remains loaded-only `.1–10/.05`, through existing setters, with × readouts and nondestructive help. No camera/view zoom or source configuration normalization was added.
- Dropzone accept maps, `maxFiles:1`, `multiple:false`, `noClick:true`, native input/open callbacks and onDrop rejection/status behavior are unchanged. Actual drop acceptance, replacement, invalid-type rejection, multiple-file rejection and root noClick are tested. Model warning remains strictly greater than 2 MiB. Image guidance now explicitly includes JPG/JPEG and WebP alongside PNG/GIF/SVG, without a playback promise.
- Loaded metadata uses actual source kind, filename/title and original KB calculation. Replace is secondary; Remove is quiet outlined danger. Existing model removal status reset and image removal semantics are preserved, not silently standardized.

### Frozen bridge, publication and target availability — accepted

`InputSource.jsx:30–54` publishes exactly `{focusSource(kind): boolean}` in a layout effect, with identity-guarded cleanup. It accepts only the four own keys, dereferences current child refs at invocation, and neither sets source state nor activates a chooser. It rejects disconnected, disabled, hidden/inert/aria-hidden, CSS-hidden or layoutless targets, verifies actual focus, then instant-nearest reveals.

Exact optional child seams match the accepted ledger: `ModelUploader.chooseButtonRef`, `ImageInput.chooseButtonRef`, `ShapeSelector.selectedShapeRef`, `TextInput.textareaRef`. Model/image refs follow both Choose and loaded Replace; selected shape ref follows selection. Existing validators are reused without shared edits; callable positive/negative metadata tests do not claim React 19 automatic prop checking.

The source test probes real committed children from a **parent layout effect under StrictMode** for all four kinds and asserts no native input click. It covers hidden/inert/disabled targets, invalid/inactive kinds, newer-handle preservation during old cleanup, owned cleanup/disconnection and source/selected-shape/loaded-image target replacement. Source inspection additionally establishes the CSS visibility/layoutless/aria-hidden checks; those branches are not each separate unit cases. The independent live-app matrix corroborates actual shell-to-child focus, not a mocked child handle.

### Visual redline — accepted within scope

Directly inspected newly generated desktop Shapes, 320px Text and phone loaded Image screenshots. Graphite fields, pale-cobalt selected boundaries and bottom markers, visible checkmarks, separate keyboard focus outlines, associated labels and two-column shapes follow the frozen direction. Metadata and Replace/Remove stay contained. At 320px Text, remaining geometry is below the current viewport in the inspector's existing scroller, not deleted. The tiny OBJ/PNG fixtures prove chooser/loading/metadata, **not rendered artwork quality or export fidelity**. No B-specific craft blocker was observed; unchanged canvas framing is not justification for engine/default changes.

## Limits and remaining gates

- No root/full suite, build, generated output, heavy export test or artifact gate was run during concurrent integration. A retains final combined-tree lint/format/tests, source/browser matrix, R1/R2 focus/viewport/zoom cases and all nine built-UI export/runtime gates.
- Focused source tests use a deliberate jsdom `getClientRects` stub; they do not establish browser geometry. The independent Chromium measurements and screenshots supply bounded real-layout evidence, not every viewport/state or contrast combination.
- Chromium automation exercises real filechooser events with file payloads, not physical OS dialog certification. Physical touch/mobile keyboard, Safari and assistive technology remain unverified.
- Existing rejection wording, tiny-file KB rounding and source loader behavior remain baseline behavior. No resource-repair, GIF-source playback or project-image serialization promise was added.

**Disposition:** accept B/source without required application repairs. Retain A's integration and final verification gates unchanged.
