# Independent audit: Code ZIP generated-runtime sizing plan

## Verdict

**Accept the bounded repair design; require the three verification clarifications below to be incorporated into the implementation assignment.** No engine/SDK redesign, additional runtime feature, or change to another generated template is needed. This is plan acceptance, not implementation approval or evidence of a fixed export.

Audited branch: `gloin/ui-output-improvements`, HEAD `298bdec`, shared dirty worktree. Reviewed the current plan, sibling `../export-verification-handoff.md`, actual generated template and ZIP tests, source-bundling manifest, SceneManager, effect/renderer sizing, engine safety tests, export browser spec, and both export runner configurations. Other workers own the existing application/UI/engine/CI edits; this audit changes none of them. Repository `AGENTS.md` was read; `CODEX.md` and the four named COLLAB bootstrap records are absent.

## Source-grounded findings

| Evidence | Finding / consequence |
| --- | --- |
| `src/app/utils/codeExport.js:18–20,28–38` | HTML gives `#app` viewport dimensions, but generated JavaScript only constructs the manager and starts fetch. No initial size, observer, or lifetime cleanup exists. The proposed template-only repair targets the actual omission. |
| `src/engine/SceneManager.js:31,35–40,194–201` | Camera starts with aspect 1. Construction appends the effect without sizing it. `setSize` floors/clamps dimensions, updates projection and calls effect sizing; it is the correct public entry point. Its clamping is not a finite-number guard: reject invalid measurements in the template. |
| `src/engine/effects/BaseEffect.js:16–17,37–42`; `BitmapEffect.js:99–106` | Initial effect size is 1×1. Resizing allocates the sample grid and visible renderer and resets particles. Deduplicating applied sizes is behaviorally necessary, not merely an optimization. |
| `src/engine/renderers/BitmapRenderer.js:37–39,51–55` | Visible output is a block canvas whose backing dimensions become the supplied CSS-pixel dimensions. It is not the WebGL canvas, and its backing size is not multiplied by DPR. |
| `src/app/utils/engineSources.js:4,56`; `codeExport.js:43–46` | ZIP bundles current raw engine sources, including current disposal guards. Do not infer those guards solely from HEAD: they are present in the shared working source and must remain in the artifact actually tested. |
| `SceneManager.js:116–132,151–153,379–391` | A load requested after disposal returns before decoder preparation; a load already preparing releases its late result instead of publishing. Disposal is idempotent, stops the loop and removes the effect DOM. There is no fetch AbortController contract. Template cleanup should delegate to `dispose`, not duplicate engine ownership. |
| `src/app/utils/codeExport.test.js:115–127` | Existing animation checks only inspect substrings. They cannot detect this defect or establish runtime lifetime behavior. Evaluating the actual generated body with controlled imports is an appropriate addition. |
| `test/e2e/export.visual.spec.js:206–288` | Current real-artifact test changes only HTML dependency resolution, then checks meaningful pixels. It has no resize/dimension/lifecycle checks yet. Preserve the unmodified generated JavaScript and current visual thresholds. |

Read back `../export-recovery-reviewed/code-runtime.json`: 300×150 output, 9 foreground pixels, 2 colors, ratio 0.0002, with empty runtime/HTTP/console diagnostics. This independently confirms the retained failed-artifact data, not a new browser execution. The handoff's explicit `setSize` diagnostic is causal supporting evidence, not acceptance evidence; I did not rerun it or count it as a fixed export.

## Mandatory verification clarifications

### R1 — Pin hidden-state and deduplication expectations

The plan's “preserves/reapplies appropriately” is ambiguous beside its requirement to skip identical applied sizes. Define the following exact generated-module behavior:

- Initial 0×0: no size call; first valid 640×480: one size call, even if the model has already loaded.
- Applied 640×480 → hidden 0×0 → visible 640×480: **no additional** size call. Hidden state must not clear the last-applied cache. The canvas was never resized to zero and needs no reapplication.
- Applied 640×480 → hidden → visible 800×360: exactly one additional call with 800×360.
- Reject either invalid axis independently: 0×480, 640×0, negative values, NaN and Infinity in either axis. Cache only an actually accepted pair, so a subsequent valid measurement still applies.
- First observer delivery duplicating synchronous initial size must not call again. A height-only or width-only change must call once. A manually invoked stale callback after teardown must not measure or size.

`clientWidth/clientHeight` are integer measurements in the real browser. Fractional mock coverage may check the specified normalization, but must not change the production source of dimensions to `contentRect`/canvas/window. If testing fractional mocks, normalize then reject a nonpositive result; do not accidentally send zero after flooring a positive fraction.

These are clarifications of the existing contract, not requirements for padding, borders, transforms, detached-node remounting, or unsupported-browser fallbacks.

### R2 — Separate template pending-fetch behavior from engine pending-decode behavior

A mocked SceneManager cannot prove real engine publication safety. Keep both ownership cases explicit:

1. **Generated-module test:** hold fetch pending, trigger ordinary pagehide, then resolve the successful response/blob/File/load chain. Assert only the original manager/observer ever exist, no late sizing occurs, and cleanup stays exactly once. Keeping the existing chain means `loadModel` may still be invoked on the disposed manager; do **not** assert that invocation is forbidden or add fetch cancellation to satisfy a mock.
2. **Real engine regression gate:** run `src/engine/SceneManager.safety.test.js` alongside `src/app/utils/codeExport.test.js`. Existing safety cases cover disposal during decoder preparation and late resource collection. Retain this evidence instead of rebuilding decoder mocks in the template test.
3. **Page lifetime tests:** assert the owned pagehide handler uses the same identity when removed; invoke a saved handler again to prove idempotence, even after listener removal. A persisted pagehide must not disconnect, dispose, or remove that handler. Exercise persisted → observer resize → ordinary pagehide, then a stale observer callback.

No public destroy handle, pageshow reconstruction, visibility-driven playback policy, unload hook, or SDK reconnect behavior is required. Preserving the existing manager/observer on persisted pagehide is a coherent minimal standalone BFCache policy. Synthetic persisted events establish handler branching only, not actual BFCache eligibility/restoration.

### R3 — Make real-artifact sizing assertions and failure evidence explicit

Use these exact DPR1 expectations for `#app` and its visible bitmap canvas:

| Step | Container client size | Canvas rendered CSS size | Canvas width/height attributes |
| --- | --- | --- | --- |
| Initial viewport | 1280×800 | 1280×800 | 1280×800 |
| Second viewport | 900×600 | 900×600 | 900×600 |
| Container-only CSS resize | 640×360 | 640×360 | 640×360 |
| Hide/reveal | 0×0 while `display:none`; 640×360 on reveal | restored to 640×360 | retains 640×360 while hidden and after reveal |

Poll dimensions instead of assuming ResizeObserver delivery is synchronous. Observe stable dimensions over subsequent deliveries/frames to detect a feedback loop; do not prohibit the intentional surrounding body space after shrinking only the container. Do not assert about a hidden canvas's rendered box as though it were visible.

At each visible size retain the unchanged `isBlank` threshold (at least 1% foreground and 5 colors) and save a geometry screenshot/metrics. Repeated resize/hide steps advance animation time; allow a bounded wait/poll for a meaningful frame rather than asserting immediately during intentional fade-out or introducing test-only pose/seek/scale changes. Bound that wait within the actual runner's test budget; report the inherited 90-second CI limit separately if it blocks the built path.

Capture dimension snapshots and runtime diagnostics in failure-safe cleanup, including an assertion/timeout failure before the screenshot. The current JSON is written only after screenshot capture, so earlier failures currently lose diagnostics. Add a Code ZIP `requestfailed` listener as well as HTTP-response checks if claiming “no failed requests”: HTTP `response` never reports transport failures. Keep all generated JavaScript bytes unchanged. Original ZIP retention and HTML import-map insertion remain permitted.

## Verification performed by this audit

Executed, using the requested Node 20 wrapper:

```sh
npx --yes --package=node@20 -c 'node node_modules/vitest/vitest.mjs run src/app/utils/codeExport.test.js src/engine/SceneManager.safety.test.js'
```

Result: **2 files passed, 40 tests passed** (15 ZIP tests and 25 engine safety tests), exit 0. This is the pre-repair baseline and demonstrates that existing tests miss the known sizing defect. It does not satisfy any of the new generated-runtime cases above.

No application change was implemented. No new full browser run, production build, BFCache navigation, root-suite clearance, commit, push or deployment was performed. The handoff's six-export 5-pass/1-fail result remains attributed to its verifier. After implementation, require the plan's full six-export rerun and separate built-preview CI-path verification; retain any parent-owned build or Layout blocker explicitly.

## Scope disposition / handoff

Accept the plan's allowed files and exclusions. R1–R3 can be incorporated by referencing this audit as binding test detail; no application change outside the existing allowed surface is authorized. Do not repair animation/config parity, model-name escaping, fetch error handling, React/Web Component templates, engine defaults, UI status/palette behavior, or CI settings under this task. Discovered unrelated defects should be reported separately.

Only this audit document was created. `docs/plans/` is ignored in this checkout, so parent must explicitly retain this file with the plan in the review/handoff artifacts rather than relying on ordinary `git diff` output.
