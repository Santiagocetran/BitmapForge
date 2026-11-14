# JSX lint remediation — implementation handoff

## Outcome and review status

Implemented the original 01–18 and binding X01–X12 findings on `gloin/ui-output-improvements`, baseline/HEAD `298bdec17dcd1603add549118a743e5cd494ba08`. All **30 targeted diagnostics (28 UI-added, two adjacent historical Layout contracts)** are absent. Root lint is **not green**: actual `npm run lint -- --format json` and independent expanded lint both exit **1**, with the same **14 historical errors, zero warnings**, across 175 processed file records. Independently reproduced the nine historical sources with `git show 298bdec:path | eslint --ext .js,.jsx --stdin --stdin-filename path --format json`: all nine exits 1; all fourteen file/rule/contract identities match the current remainder.

**Independent implementation review is still required.** This handoff neither accepts concurrent engine/ZIP/CI changes nor authorizes merge, deployment or release. No historical cleanup was implemented. Its accepted plan/audit belongs to the subsequent owner, including schema and layout-phase gizmo probes.

## Implemented dispositions

| Finding IDs | Implementation and evidence |
| --- | --- |
| 01–05 | Section declares callable title/open/toggle/children/heading-ref contracts. Shared direct tests exercise required types, supported nested renderables and real callback/node refs, including rejection. |
| 06–08, 10 | Layout bridge has a real nullable complete-handle validator. A fresh bridge is published in layout each commit, before host/focus work; cleanup clears only its installed identity. Tests cover changed save callback and propagated error, ref replacement, own unmount, external replacement and StrictMode. |
| 09 | The first Layout layout effect publishes committed drawer-live state; no render write or cleanup reset. Browser tests close/reopen from a removal observer before stale Radix restoration, verify a genuinely new drawer, and check focus across two frames for both openers. |
| 11–16 | Hoist-safe async mock factories define named PaletteFixture and QualityFixture with meaningful contracts. PaletteFixture uses useImperativeHandle, not a render write; StrictMode integration verifies usable cancellation and handle detachment after Close. |
| 17–18 | StatusNotice declares suspended boolean metadata and subscribes to the external status store in layout. One cancellable/coalesced microtask reads the latest snapshot at delivery; suspended lifetimes unsubscribe and invalidate jobs. Equal presentation retains state identity. A second active check guards deferred React updater processing. No old render-subscription/mirrored-effect architecture remains. |
| X01 | ExportPanel requires one of exactly apng, gif, webm, spritesheet, css, react, webcomponent, embed, zip. Direct positive tests cover all nine and reject missing/unknown/non-string values. |
| X02, X03, X05, X06 | Required callable select/export/save/load metadata, directly tested against missing/null/wrong values. Existing nine identifier-routing cases and actual controller/lifetime tests remain. |
| X04 | Cancel is optional idle, required callable while exporting, and rejects wrong supplied types in both states. Direct tests cover conditionality. |
| X07–X08 | Optional boolean exporting and optional string disabledReason; false/empty/nullish fixtures remain supported. Direct type rejection tests and metadata binding assertions. |
| X09 | Named ExportPanel Fixture.route declares the shared optional function validator; original routing tests retained. |
| X10–X11 | QualitySettings optional boolean/function contracts intentionally accept nullish local fallback. Three dedicated consumer tests cover undefined/null fallback and latest controlled callback. |
| X12 | ShortcutsModal declares only the new optional autofocus callback. Dedicated test forwards the real Radix cancellable close event to the latest callback, checks preventDefault and restored focus. Its two historical contracts deliberately remain visible. |

React 19 does **not** automatically run function-component propTypes. These are callable metadata contracts, verified by direct positive/negative invocation, not claimed automatic runtime checking. Renderable children is a bounded supported-node contract (nullish, boolean, string, number, bigint, valid elements/fragments and recursive arrays), not complete ReactNode recognition; portals, generic iterables and promises are outside its declared API. No new dependency or framework.

### Necessary config placement refinement — independent review item

The planned placement of `files: ['**/*.{js,jsx}']` on the browser-globals block was exercised and produced **27 errors**, not fourteen: it removed the previously applicable browser globals from an already-discovered `.mjs` smoke script, causing thirteen new no-undef errors. This was this placement's regression, not historical or concurrent debt.

Final config registers the **same exact glob in a standalone config object**, leaving the existing unscoped browser-globals/settings/rules block unchanged. This preserves prior JS/MJS/CJS behavior while durably discovering JSX. Root and expanded lint now agree at fourteen; explicit lint of the `.mjs` smoke plus the clean remediated components exits 0. No ignores, suppressions, rules, severity, package scripts or success wrappers changed. Parent should explicitly approve this evidence-driven placement refinement rather than reintroducing the demonstrated regression.

## Verification on the final application source

Every Node command used `npx --yes --package=node@20 -c '<direct installed tool command>'`; runtime reported **v20.20.2**. Command exits were captured independently, not cleared by later format/report success.

| Command/gate | Actual final result |
| --- | --- |
| Original exact six-file focused Vitest command from plan §8, default concurrency | **exit 0; 6 files, 92 passed**: all original 83 plus two Layout and seven notice cases. Final lifetime 4191ms against unchanged 15000ms; disclosure 2108ms against unchanged default 5000ms. |
| Layout alone `--maxWorkers=1` | **exit 0; 12 passed**, original ten retained; lifetime 1901ms, disclosure 939ms. |
| Validator + QualitySettings + ShortcutsModal tests, `--maxWorkers=1` | **exit 0; 3 files, 37 passed** (33 direct validator, three disclosure, one real Radix callback). Total distinct focused/new unit cases: **129**. |
| Original palette + UI foundations browser specs, one worker | **exit 0; 30 passed (3.8m)**, original 22 plus eight regressions, no budget/config timeout changes. |
| Explicit 19-file scoped lint, without --ext, including all new files and original integration targets | **exit 1; exactly two errors**, ShortcutsModal open/onOpenChange only. No ignored-file warnings. JSON retained separately. |
| Explicit clean components/tests/helpers/browser-spec/config plus existing MJS smoke, without --ext | **exit 0; zero diagnostics**. This command does not replace the failing inclusive/root gates. |
| `eslint --print-config src/app/components/Layout/Layout.jsx` | **exit 0**; react/prop-types, react-hooks/refs, react-hooks/set-state-in-effect all remain `[2]`. |
| `npm run lint -- --format json` | **exit 1; 14 errors, zero warnings**. |
| `eslint --ext .js,.jsx . --format json` | **exit 1; identical fourteen diagnostics**, zero warnings. |
| Scoped Prettier check; git diff --check | Both **exit 0**. |

Retained real PreviewCanvas/controller/ExportPanel deferred lifetime integration proves one builder/download/manager through close/reopen and both breakpoints. Expected negative-path save/export logs and jsdom navigation warnings remain expected test output, not hidden failures.

Notice tests observe the first empty committed node with preloaded status, a pre-subscription change, latest coalescing, equal-presentation zero text mutations, suspension before initial/update/resume flush, resume/unmount invalidation, delivered-but-uncommitted transition cancellation, StrictMode discarded lifetimes, isolated instances and exact unsubscribe cleanup. Original progress/error/dismiss/help cases and expectations remain; only postcommit delivery assertions gained awaited act boundaries.

Browser additions cover both opener Close/Escape/backdrop matrices, immediate committed close/reopen, active keyboard-drag parent Close and 1023→1024→1023 cancellation followed by ordinary Escape, exact notice identity and zero unchanged-host-move mutations, hidden message/error changes and single latest-resume text mutation. Native Ctrl+S yields exactly one download per invocation with current serialized pixelSize after each rerender/breakpoint, one nondestructive save-failure alert and recovery. Original native picker/help/load/drag tests remain unchanged.

### Browser isolation and visuals

Used a new dev server at **http://127.0.0.1:5311**, PID **794953**, cwd this checkout, command `node node_modules/vite/bin/vite.js --config ../ui-jsx-vite.config.mjs`. HTTP root returned 200; fetched served Layout contains the committed drawer publication and identity-guarded bridge cleanup, served notice contains the microtask delivery. The scratch config imports this checkout's Vite config and pins unique cacheDir, strict port, HMR false and an unused build outDir outside the checkout. **No build/dist regeneration occurred. Port 5287 was not reused or stopped.** Server 5311 is left running for parent review.

The exact retained browser invocation used both URL variables set to 5311, `--config=../bitmapforge-ui-playwright.config.mjs ui-foundations.spec.js palette.spec.js --workers=1 --output=../ui-jsx-remediation-browser-final-results`. Logs/results/cache are outside served root. The external config retains existing 90000ms browser test budget, zero retries, one worker, trace-on-failure/screenshot-on-failure. New tests use managed page fixtures; no passing-test trace is claimed.

All six reduced-motion viewport assertions passed: 1280×800, 1024×768, 1023×768, 390×844, 320×568, 667×320, with twelve screenshots. Visually inspected desktop closed, 320px export drawer and short landscape export drawer: nonblank desktop cube, Close and export heading visible, bounded scroll rather than page overflow. Short landscape intentionally requires scrolling for the lower export controls; no redesign was made. Screen-reader announcements, Safari/iOS, physical touch and real 200% zoom remain **unverified**; emulated touch is not physical-touch evidence.

## Exact remaining historical debt

| Path (under src/app/) | Line / contract or rule | Errors |
| --- | --- | ---: |
| components/ErrorBoundary/ErrorBoundary.jsx | 26 children | 1 |
| components/ModelUploader/ModelUploader.jsx | 16 compact | 1 |
| components/PluginControls/SchemaControls.jsx | 17 schema, values, onChange | 3 |
| components/PresetGallery/PresetGallery.jsx | 7 colors; 10 colors.slice | 2 |
| components/RotationGizmo/GizmoCanvas.jsx | 129, 148 render-time ref writes | 2 |
| components/TextInput/TextInput.jsx | 2 unused FONT_LABELS | 1 |
| components/ui/InfoTooltip.jsx | 3 content | 1 |
| components/ui/ShortcutsModal.jsx | 12 open, onOpenChange | 2 |
| context/SceneManagerContext.jsx | 11 children | 1 |

All except gizmo refs and unused FONT_LABELS are react/prop-types. These fourteen are an actual failing root gate, **not an allowed-error threshold**. Historical implementation and exact-final-tree parent gates must resolve them before any green lint/merge claim.

## Frozen API and ownership transfer barrier

**This UI worker has finished writing and freezes `src/app/utils/uiPropValidators.js` and `.test.js` at this handoff.** Parent must independently review/accept this exact helper snapshot before historical consumers use it. Historical cleanup may consume accepted exports read-only; no concurrent helper changes or duplicate framework. Missing contracts require a separately assigned helper-owner change.

Frozen exports: `optionalBoolean`, `requiredBoolean`, `optionalString`, `requiredString`, `optionalFunction`, `requiredFunction`, `renderableChildren`, `headingRef`, `bridgeRef`, `interactionRef`, `exportFormat`, `cancelExport`. Signature `(props, propName, componentName) => Error | null`; optional primitive contracts allow undefined/null, required ones reject both. Bridge requires a current slot initially null or three callable methods; interaction handle initially null or callable cancel plus optional callable keyboard predicate. No manual render-time invocation/dereference.

Frozen SHA-256:

- helper source: `086ad6b456fa19e56b1f4193ac1dd7992978fb2b644968d24486c9db381e68b6`
- helper tests: `886ec85d2dfb8ccc4f97f92e146d0f76a803cd391821bd80f52a45e5b09c32ae`
- ShortcutsModal source: `f4334dd6a28bb71cd0e5a128168777516242cbb53c88aed13d21cd67b14e6dc1`
- ShortcutsModal test: `00cca0235fb62afd376c850f692a50305da57893caa145edac103c8d15609c4a`

**Relinquishing ShortcutsModal source/test ownership to the parent at this handoff**, for explicit transfer to the historical cleanup worker **after independent UI/helper review and parent clearance**. This is not a statement that clearance has already happened. Preserve optional onCloseAutoFocus metadata and its latest/preventDefault/focus test when adding historical required open/change contracts. This worker will make no further helper/help edits absent a new assignment.

## Review artifacts and remaining gates

All artifact paths below are in sibling scratch (outside the served checkout):

- `ui-jsx-remediation-handoff-manifest.json`: exact fourteen source/test/config SHA-256 hashes, frozen API and diagnostic/exit inventory.
- `ui-jsx-remediation-owned-cumulative.patch`: owned tracked diff against HEAD plus explicit untracked/new files; SHA-256 `0f430e1facfef43efd48bcb30ecc46b6aee31c69f28096514366a2a8a1c2c231`. **Cumulative owned UI snapshot**, not a claim that pre-existing accepted UI code was authored in this remediation. Contains untracked tests absent from ordinary git diff.
- `ui-jsx-root-final.json` (npm banner followed by JSON), `ui-jsx-expanded-final.json`, `ui-jsx-scoped-final.json`, `ui-jsx-print-config-final.json`, `ui-jsx-historical-final.json`.
- `ui-jsx-focused-final.log`, `ui-jsx-layout-final.log`, `ui-jsx-contracts-final.log`, `ui-jsx-browser-final.log`, `ui-jsx-remediation-browser-final-results/`.
- `ui-jsx-vite.config.mjs` and `ui-jsx-vite-cache/`.

Touched only eslint config, Layout/source-test, StatusNotice/source-test, shared validator/source-test, ExportPanel metadata/fixture, QualitySettings metadata/test, ShortcutsModal metadata/test and focused UI browser spec, plus this report. No engine/export-builder/controller/App/CI/dependency edits by this worker; unrelated existing dirty files are preserved. No reset/stash/commit/push/deploy/remote writes.

Remaining: parent independent implementation review (especially glob placement and frozen helper), authorized historical cleanup/ownership transfer, and exact-final-combined-tree root/workspace/embed/CLI/decode/export/build/CI checks. Neither passing bounded tests nor this handoff clears those gates.
