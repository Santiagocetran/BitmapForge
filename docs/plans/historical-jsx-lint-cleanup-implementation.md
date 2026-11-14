# Historical JSX lint cleanup — implementation handoff

## Status and scope

Implemented H01–H14 on `gloin/ui-output-improvements`, HEAD/base `298bdec17dcd1603add549118a743e5cd494ba08`, following the accepted cleanup plan and its binding independent-audit clarifications. Parent explicitly cleared the helper prerequisite and transferred ShortcutsModal source/test ownership before these edits. This is an implementation handoff, **not independent implementation approval or release approval**.

Changed nine historical production sources, their dedicated tests, and the explicitly authorized local palette validator/test. No shared helper/test, lint/config/package/lock, engine/export, source export API, generated/build output, or browser spec was changed by this worker. No build, reset/stash/commit/push/merge/deploy/remote action. ShortcutsModal already contained the accepted UI autofocus/stacking behavior; relative to that handed-off source, this worker changed only its import and the two required controlled-prop validators. Ordinary HEAD diffs include earlier UI work and must not misattribute it to this slice.

## Diagnostic dispositions

These are the accepted baseline identities, not a tolerated baseline count:

| IDs | Source under src/app | Historical rule and finding | Disposition |
| --- | --- | --- | --- |
| H01 | components/ErrorBoundary/ErrorBoundary.jsx | react/prop-types: children | Accepted shared supported-node validator |
| H02 | components/ModelUploader/ModelUploader.jsx | react/prop-types: compact | Accepted optionalBoolean |
| H03–H05 | components/PluginControls/SchemaControls.jsx | react/prop-types: schema, values, onChange | Local concrete properties-map/consumed-values validators; optionalFunction |
| H06–H07 | components/PresetGallery/PresetGallery.jsx | react/prop-types: colors, colors.slice | Private ColorSwatches.colors bound to local requiredColorStrings |
| H08–H09 | components/RotationGizmo/GizmoCanvas.jsx | react-hooks/refs: two render-phase handler writes | One atomic layout-effect publication on every committed render |
| H10 | components/TextInput/TextInput.jsx | no-unused-vars: FONT_LABELS | Removed only unused import; seven options unchanged |
| H11 | components/ui/InfoTooltip.jsx | react/prop-types: content | Accepted supported-node validator |
| H12 | context/SceneManagerContext.jsx | react/prop-types: children | Accepted supported-node validator |
| H13–H14 | components/ui/ShortcutsModal.jsx | react/prop-types: open, onOpenChange | requiredBoolean/requiredFunction alongside existing optional autofocus metadata |

All fourteen identities are absent: root and expanded lint now have **zero errors and zero warnings**, not fourteen waived findings. No suppressions or rule weakening.

Schema metadata preserves nullish schema/values/callback and per-key fallback, nullish/empty titles, unsupported/missing types, unrelated keywords, numeric enum and boolean/string bounds. It checks finite numeric bounds only on numeric fields, typed defaults/values, string enum arrays, and safe sibling shape before values lookup. It does not coerce, execute callbacks, enforce min/max order, range or enum membership, or restrict unknown values keys. React 19 does not automatically invoke function-component propTypes: production attached validators are directly invoked in tests, including negative cases. Supported nodes are bounded to the frozen helper contract, not every possible ReactNode. Color holes intentionally follow native slice/map; explicit undefined fails.

## Regression evidence and actual commands

Every Node command used `npx --yes --package=node@20 -c '<command>'`; observed Node **v20.20.2**. Budgets/config/setup files were unchanged.

- Explicit eleven-file Vitest run, `node node_modules/vitest/vitest.mjs run <nine cleanup test paths below> src/app/utils/uiPropValidators.test.js src/app/components/Layout/Layout.test.jsx --maxWorkers=1`: **exit 0, 11 files / 106 tests passed**. Schema retained all 13 originals and now has 39; helper 33, Layout 12, tooltip 4, uploader 4, help 3 (including unchanged real cancellable latest-autofocus regression), gizmo 3, provider 3, boundary 2, gallery 2, local colors 1. Boundary's logging assertion was tightened afterward to exactly one expected logged error; its separate rerun passed 2/2. The attempted final combined rerun and scoped Prettier verification are pending tool approval and have not executed.
- Gizmo regression dispatches a real window mousemove from its **parent layout effect**, ordered after child GizmoCanvas layout publication, on the setter-replacement commit, before passive effects. It asserts only the new action runs with the original drag origin and no listener add/remove. Separate tests retain sensitivity/signs/Z, Shift snap, mouseup termination, next-drag origin, StrictMode one live pair, exact callback cleanup, no post-unmount calls and fresh remount drag state.
- **Deliberate external in-memory mutation**, not an acceptance failure: `node node_modules/vitest/vitest.mjs run --config ../historical-jsx-passive-mutant.config.mjs src/app/components/RotationGizmo/GizmoCanvas.test.jsx --maxWorkers=1` changes only publication to useEffect through a pre-transform, without editing repository source. **Exit 1, exactly the layout-event freshness regression fails**: old setter called once; other 2 pass. This proves the test distinguishes commit/layout freshness from post-act eventual freshness. No speculative/uncommitted-render experiment or arbitrary earlier-child-layout event guarantee is claimed.
- `npm run lint -- --format json`: **exit 0; 183 records, 0 errors, 0 warnings**.
- Separately `node node_modules/eslint/bin/eslint.js --ext .js,.jsx . --format json`: **exit 0; 183 records, 0 errors, 0 warnings**. Diagnostic sets agree (empty).
- Explicit 19 owned source/test/local-module paths plus shared helper and test, `eslint --ext .js,.jsx ... --format json`: **exit 0; 21 records, 0 errors, 0 warnings**.
- `eslint src/app/components/RotationGizmo/GizmoCanvas.jsx --format json` **without --ext**: **exit 0; one actual record, no ignored-file warning or diagnostics**.
- `eslint --print-config src/app/components/RotationGizmo/GizmoCanvas.jsx`: **exit 0**; react/prop-types, react-hooks/refs and react-hooks/set-state-in-effect remain `[2]`.
- `git diff --check`: **exit 0** after implementation and the final test-assertion edit. Scoped Prettier **write** on all 19 code/test files passed before the final assertion tightening; the final scoped Prettier **check**, including this new handoff document, is pending approval. No whole-tree formatting.

Initial focused run failed only three tooltip-open cases because jsdom lacks ResizeObserver; added a restored **test-local** observer stub, not a Radix mock or root setup change. Subsequent tooltip run passed all four. Initial expanded lint already passed zero/zero. No timeout increase, skipped test, or disabled assertion.

## Reviewable files and hashes

SHA-256 at handoff; this includes new/untracked tests that normal git diff omits. All paths are repository-relative. The nine cleanup test paths are the nine `.test` entries below (excluding no other entries; shared/helper and Layout are read-only additional suites).

| Path | SHA-256 |
| --- | --- |
| `src/app/components/ErrorBoundary/ErrorBoundary.jsx` | `59aeeb92acf958ee893495f68c8baed597494836b35f2f46e775f74383f375f4` |
| `src/app/components/ModelUploader/ModelUploader.jsx` | `65e105a4dcda0ce44f42e6809d3aa08a1b11783c5a4247cb7df066d830250d90` |
| `src/app/components/PluginControls/SchemaControls.jsx` | `89cba9ee9d48d69ce3b0c0dac2d19c38c3d8a03b514329b0bd7d547087c9492b` |
| `src/app/components/PresetGallery/PresetGallery.jsx` | `3a49f0d42cbe013d8a4e40757c3b54b5b5f985aa79a2b196ef41eede28751fb0` |
| `src/app/components/RotationGizmo/GizmoCanvas.jsx` | `a23d33e77a25a0f4d398da24da4c428a5cb1e17e6db32bbe5937af8e9bef55bb` |
| `src/app/components/TextInput/TextInput.jsx` | `a994de3f6f7664da4d44d51c9e1aa5f9c9fe1740053b1f18960422f2784b0621` |
| `src/app/components/ui/InfoTooltip.jsx` | `67320a5280d52b811383b09f30f475e55ccc9fc474861c6a096e6114ee55bdc3` |
| `src/app/components/ui/ShortcutsModal.jsx` | `9de02938980fcc64d8146b4000d4d39f0bab943e0eb5bbc0a46434694e75eec9` |
| `src/app/context/SceneManagerContext.jsx` | `3514ea77c880b5a500953c7562ab548afdd9bf1998d47ad742c5b8896528a475` |
| `src/app/components/ErrorBoundary/ErrorBoundary.test.jsx` | `189ac943f8ec9b6270e483caf6e6a23352fea7464314cf6651618d7fe4fc3101` |
| `src/app/components/ModelUploader/ModelUploader.test.jsx` | `55d42f1b914458f164c15d53b2861dce422f41c208c81c5c2c74655f70f2b5c0` |
| `src/app/components/PluginControls/SchemaControls.test.jsx` | `c64312142bdf8cfb84e9a2a745645a8473a9ae16251f4b1cbcdf13a73367396a` |
| `src/app/components/PresetGallery/PresetGallery.test.jsx` | `7b1f624045623512f66982ac06f8622a1a3600c994319bb83e73cdf967b9736b` |
| `src/app/components/PresetGallery/presetPropValidators.test.js` | `b15ed1b7caa822cb40adab954fe461d599fd86813f41ceba1f2236a2b727f90c` |
| `src/app/components/RotationGizmo/GizmoCanvas.test.jsx` | `21a39bf49045313319efec9a77647d755844d67b56b5684619af6544d382c195` |
| `src/app/components/ui/InfoTooltip.test.jsx` | `bd82bb0d00aa268696230942cf125cbdd70f16564513cbe72b62d6ca88bed3c9` |
| `src/app/context/SceneManagerContext.test.jsx` | `034e470d7bfc5a613b57c5b21f7a97aa92802887a1167aecd156ebeffc833133` |
| `src/app/components/ui/ShortcutsModal.test.jsx` | `77f9f60d5a1c384f11b22f31f8e55e61db0e9f73aa560e04a6b831ce8c7a2fc2` |
| `src/app/components/PresetGallery/presetPropValidators.js` | `e1f8978ccad72287bd326317dc3e37a316d465ba6217267ca6ee5bf4f71a912f` |

Frozen helper independently accepted source/test hashes remain unchanged:

- uiPropValidators.js: `086ad6b456fa19e56b1f4193ac1dd7992978fb2b644968d24486c9db381e68b6`
- uiPropValidators.test.js: `886ec85d2dfb8ccc4f97f92e146d0f76a803cd391821bd80f52a45e5b09c32ae`

Logs, JSON diagnostics, external passive mutation config/cache and `historical-jsx-owned-manifest.json` live in the repository's **parent scratch directory**, prefix `historical-jsx-`. No browser/build artifact was generated under served source.

## Remaining parent acceptance gates

Independent implementation audit of this bounded diff and direct validator bindings is required after handoff. Parent retains the actual browser mouse-drag/Shift/mouseup smoke and combined workspace/embed/CLI/decode/export/build/CI gates; mocked canvas tests do not satisfy native browser coverage. No real-browser check or build was attempted here, preserving the immutable build used by the CSS investigator. No release readiness inferred.
