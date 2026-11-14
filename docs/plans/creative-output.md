# Creative output: issue-ready implementation plans

Status: revised plan only; independent audit acceptance required before implementation. Tracker references: `issues.json`; no external writes in this revision.

These workstreams refine the remaining creative-output findings under backlog #62. They do not duplicate analytics #68, launch content #69, or launch tracker #70. UI foundations, global navigation, and general accessibility redesign belong to the separate UI plan. File references below describe inspected source, not runtime verification of a deployed site.

## Delivery order and gates

- **Shippable:** CO-1 curated starters; CO-2 goal-oriented export guidance; CO-3 embed lifecycle correctness; CO-4 validated custom ASCII ramps and typography.
- **Measurement only:** CO-5 glyph-rendering benchmark. It does not authorize replacing the renderer.
- **Experimental:** CO-6 edge-aware and source-color ASCII. No default behavior or public stability promise until its quality, performance, and export gates pass.
- CO-1/CO-2 can proceed independently. CO-3 should precede any claim that live embeds respect motion preferences. CO-4 establishes the typography contract measured by CO-5. CO-6 uses that baseline; neither research workstream blocks the shippable improvements.

## CO-1 — Curated source + look starters without replacing palette presets

### Evidence and gap

`InputSource.jsx` already exposes model, shape, text, and image inputs. `PreviewCanvas.jsx` already loads `/models/david_head.glb` as a sample. `builtInPresets.js`, `PresetGallery.jsx`, and `usePresetStore.js` already provide built-in and saved custom palettes, but both apply/save only `colors`. This is not a request to build a first preset gallery or first sample loader.

### Implementation scope

1. Add a small, versioned starter manifest distinct from palette presets: stable ID, title, static thumbnail, source descriptor, explicit look/animation settings, and asset attribution where applicable. Initial set: a procedural shape/bitmap look, a text/ASCII look, and a verified reusable model/halftone look. Confirm redistribution rights before including an existing model; substitute procedural content if rights are unclear.
2. Offer two explicit actions: **Start with source + look** (replaces source and declared settings) and **Apply look only** (preserves source, transform, and source-specific parameters). Keep existing palette cards and saved palettes backward compatible.
3. Define an allowlisted look schema for rendering, palette, post-effects, and animation. Specify relevant defaults rather than inheriting arbitrary settings from the prior project. Applying ASCII must respect the existing minimum-cell-size behavior in `setRenderMode`; do not bypass it with an inconsistent bulk store update.
4. Load source assets through current loaders, with loading/error states and stale-request protection. Confirm before replacing user content; cancellation/failure leaves the previous project usable. Apply source and settings atomically after preparation. One successful starter application should be one undoable action where existing history supports it; explicitly test binary-source restoration rather than assuming store history handles files.
5. Generate lightweight static thumbnails from the actual manifest settings; do not keep live WebGL previews running in every card. Use deployment-base-aware asset URLs instead of repeating the existing root-relative sample URL.

### Acceptance tests

- Each manifest entry produces a nonempty preview and expected input/render modes from a clean project; capture a deterministic reference frame for its thumbnail.
- Applying the same starter from two differently configured projects yields the same declared look; applying look-only does not replace source/pose/scale.
- Existing built-in/custom palette entries still change colors only, including after persisted-store hydration.
- Cancelled confirmation, failed fetch, rapid A→B selection, and unmount during load do not overwrite the active project or strand a loading state.
- Keyboard operation and accessible action names distinguish source replacement from look-only; tests cover confirmation and recovery.
- Each shipped asset has recorded provenance and loads in a production build, including a non-root base-path fixture.

### Exclusions / dependencies

No community marketplace, remote asset search, user accounts, starter analytics, launch gallery, or universal preset-schema migration. Coordinate placement/components with the UI-foundations owner, not a second layout redesign. Broader project-image serialization is not required for the initial non-image starter set.

## CO-2 — Goal-oriented export choices backed by an actual capability matrix

### Evidence and gap

`ExportPanel.jsx` already offers nine formats with descriptions; `useExport.js` dispatches real handlers. The missing layer is choosing by purpose and stating actual limitations, not adding another exporter. The code paths differ materially:

| Existing option | Verified implementation / description requirement |
| --- | --- |
| APNG | Animated raster PNG via captured frames; full-color/alpha output. Do not promise all sharing platforms preserve animation. |
| GIF | Quantized raster animation; encoder has no configured transparency key. Do not imply this implementation preserves transparent backgrounds just because GIF supports binary transparency. |
| Video | MP4/AVC through WebCodecs when `VideoEncoder` exists; WebM/MediaRecorder path only when it does not. This is not automatic fallback after every MP4 failure. Do not promise alpha or universal social-platform acceptance. |
| Sprite Sheet | PNG of 24 captured frames, six columns in the current handler; not a game-engine importer or metadata package. |
| CSS Anim | ZIP with CSS keyframes, a raster PNG sprite sheet, and README. No runtime JavaScript; not vector/procedural CSS geometry. |
| React | ZIP with generated component, config, vendored engine and optional model; requires React, Three.js, a suitable bundler, and WebGL. Current template loads model files, not every editor input type. |
| Web Comp | Generated `<bitmap-animation>` plus vendored engine/config; requires Three.js resolution/import map and WebGL. Also currently model-oriented. |
| Embed | Static-hostable ZIP containing a live `<bitmap-forge>` runtime and project data, not a prerendered animation. Generated page imports Three.js from a CDN; image input is explicitly unsupported. |
| Code ZIP | Engine-source integration package, not a guaranteed turnkey copy of every editor state. Validate its template separately before declaring input/setting support. |

`exportConfig.js` currently omits `charRamp` and `asciiColored`, although project payload serialization includes nontransient settings. Therefore “same as preview” cannot be assumed for generated code formats.

### Implementation scope

1. Centralize format metadata and capability checks, retaining existing handler IDs. Add goal groups: share/download animation, website without runtime JS, live website/framework integration, and developer assets/source. Provide a recommended choice plus an accessible “all formats” path; never hide an expert's explicit choice.
2. Describe artifacts, runtime/network requirements, transparency, editable versus baked output, and supported source/settings. Reuse this matrix in panel text and generated READMEs so copy cannot drift independently.
3. Gate known unsupported combinations before export with an actionable reason and a raster alternative. Cover editor and programmatic handler entry points. For currently model-only templates, warn/block unsupported active sources rather than silently packaging an unrelated stale model. Do not advertise parity for settings not serialized.
4. State video selection accurately and surface the actual resulting extension/container in success messages. If preflight codec probing is added, make it reflect the exact configured codec/dimensions; do not claim a working fallback that was not executed. A codec fallback redesign is a separate task.
5. Keep save/load project controls distinct from distributable outputs; explain the current image-asset persistence limitation without renaming `.bitmapforge` and `.bforge` casually.

### Acceptance tests

- Every registered panel option has one corresponding handler and metadata entry; every goal yields at least one supported choice for representative inputs.
- UI tests cover keyboard selection, the all-formats route, disabled reasons, and that changing a goal does not mutate project settings.
- Download tests inspect MIME/container, filename, ZIP members, and README claims rather than only matching button labels.
- Video tests distinguish WebCodecs success, unavailable WebCodecs, unsupported AVC configuration, and MediaRecorder unavailability; no false fallback or transparency promise.
- Tests cover each input type against live export gates and detect nondefault ASCII settings omitted from a code export. Resolve omissions in CO-4 or label/block the unsupported combination until then.
- Existing export conformance/decode/browser suites remain green; execute generated samples served over HTTP, not merely ZIP-string assertions.

### Exclusions / dependencies

No new codecs, vector/SVG export, platform publishing, analytics, or blanket rewrite of serializers. Do not fix all source-loading parity inside a copy/UI issue: expose present limitations honestly and create separately audited implementation scope if parity becomes necessary. Coordinate controls with UI foundations.

## CO-3 — Composed motion and visibility policy for live embeds

### Evidence and gap

`packages/embed/src/BitmapForgeElement.js` already has visibility handling, reduced-motion detection, IntersectionObserver, ResizeObserver, and disconnect disposal. However:

- Reduced motion only changes eager versus intersection-triggered loading; `SceneManager` starts its loop in the constructor regardless.
- Autoplay bypasses IntersectionObserver, so eager embeds do not receive offscreen suspension.
- Visibility/intersection callbacks resume independently; one can override another reason to remain paused. Initial hidden state and preference changes are not reconciled.
- Reconnection calls `attachShadow` again; pending loads are neither aborted nor generation-guarded.
- `SceneManager` context restoration restarts its loop unconditionally.
- Generated React and `<bitmap-animation>` templates have resize/cleanup logic but no equivalent composed policy. CSS exports always animate.

### Implementation scope

1. Introduce one small lifecycle controller used by the SDK and vendored/generated live integrations. Separate **load eligibility** from **play eligibility**. Preserve eager loading with `autoplay` versus lazy loading without it, unless a separately documented API decision changes this existing behavior; do not silently reinterpret autoplay as a new manual-play contract.
2. Derive loop eligibility from connected + loaded + document visible + actually onscreen + motion allowed + no explicit pause/context loss. Observe every live embed, including autoplay. A prefetch root margin may trigger loading, but must not count as actual on-screen visibility for playback.
3. Observe reduced-motion changes at runtime. Reduced motion renders one representative nonblank still after loading and stays paused; resize/settings changes may redraw once. Choose a deterministic show-phase timestamp rather than a potentially blank fade-in frame. Removing reduced motion resumes only if every other condition permits it.
4. Reconcile initial state immediately and after each async load. Prevent constructor-started loops from running while policy forbids animation; retain editor/export defaults through explicit configuration. Ensure context restore consults requested playback state instead of overriding a pause.
5. Make connect/disconnect/reconnect idempotent: reuse shadow root, cancel scheduled callbacks, remove listeners/observers, abort fetch where possible, and use generation tokens through model/text loading. Late assets/managers must be disposed, never attached to a disconnected or replaced instance.
6. Apply the controller to generated React and Web Component code and the Embed ZIP's SDK. Verify shared helper inclusion in `engineSources.js`/bundling. Add reduced-motion CSS to sprite animation exports with a stable first visible frame; explain that pure CSS cannot offer the same JS offscreen policy without changing its no-JS contract.

### Acceptance tests

- Matrix tests cover initial and changing hidden/reduced/offscreen states, autoplay eager loading and non-autoplay lazy loading, and both event orders for every pair of pause reasons. No callback resumes while another reason forbids it.
- In a browser, instrument animation-frame/render callbacks: a loaded visible embed animates; hidden/offscreen/reduced instances stop recurring work while keeping a nonblank still. Resume has no accumulated-time jump.
- Context loss/restore while paused stays paused; deterministic `renderAtTime` export capture remains usable and does not accidentally restart a suspended preview.
- Rapid `src` changes, rejected fetches, disconnect during fetch/model/text load, and repeated reconnect produce one active manager and no leaked callbacks, observers, canvases, or stale sources.
- Generated React is tested through StrictMode mount/cleanup/remount; generated custom elements are removed and reinserted; tests execute generated code rather than just checking that listener strings exist.
- CSS artifact obeys emulated reduced motion while retaining no JavaScript dependency. SDK build passes the existing gzip-size and alias-leak checks.

### Exclusions / dependencies

No new playback editor, no site-wide motion redesign, no promise that already downloaded third-party archives update automatically. Clarifying `loop`/manual playback APIs is separate unless required for the policy; observed attributes currently do not establish complete semantics. Keep export frame capture independent from document visibility scheduling.

## CO-4 — Validated custom ASCII ramps and a reproducible typography contract

### Evidence and gap

`AsciiRenderer.js` already provides classic, blocks, dense, and minimal ramps, palette-colored ASCII, cached derived font/cell state, cached fill color, and fade-particle drawing. It uses `fillText` with a system monospace fallback stack, square sample cells, minimum font size 6, and horizontal centering measured from `M`. `QualitySettings.jsx`, rendering defaults, and selectors already expose named ramps and colored mode. Unknown ramp keys fall back to classic. Do not propose basic ASCII support or claim per-frame ramp preparation is currently uncached.

### Implementation scope

1. Add a separate `customCharRamp` field and explicit custom selection; preserve named IDs/default behavior. Explain ordering as low to high ink density, preserve spaces and user order, and do not silently sort, trim, or deduplicate (repetition can intentionally weight tonal bands).
2. Share validation between UI, persisted/project import, SDK parser/renderer boundaries, and generated configuration. Initial bounded contract: 2–128 Unicode code points, at least one visible glyph, reject control characters/newlines/tabs, combining marks, variation selectors, and joiner sequences. Permit printable ASCII and the supported block-shading characters; reject other scripts/emoji explicitly until single-cell coverage is established. This conservative repertoire avoids pretending arbitrary Unicode is monospace.
3. Keep editing draft text separate from committed render state. Show inline errors and preserve the last valid ramp during editing; invalid imported data produces a warning and safe named fallback. Render canvas text only; never interpolate raw ramp content as executable source/HTML.
4. Define one bundled/licensed monospace face covering the supported repertoire, with a deterministic font-ready barrier before preview capture/export. Decide and document font failure behavior: visible fallback warning, no false pixel-parity guarantee. Serve/package the same font for editor, CLI, SDK, and generated integrations without fetching it from an untrusted third party. Inspect the asset pipeline and bundle budget before selecting the font; bytes must not be invisibly shifted outside the stated budget.
5. Establish shared cell dimensions, baseline, centering, and cache invalidation for static `render` and fade `drawPixel`. Preserve named-ramp appearance as far as practical; any deliberate geometry change needs approved reference comparisons. Do not change grid aspect ratio implicitly in the same patch.
6. Thread ramp/font options through defaults, selectors, history/persistence, project round trips, `buildExportConfig`, and SDK/generated code. Repair the known named-ramp/colored serialization omissions as part of this work so custom ramps do not repeat them.

### Acceptance tests

- Boundary/validation tests include empty/single/all-space ramps, length boundaries, repeated characters, leading/trailing spaces, quotes/backslashes, control characters, combining text, emoji, unknown named IDs, and malicious import strings.
- Endpoint/midpoint brightness, inversion, threshold, transparent cells, palette-colored/monochrome rendering, and fade→static transitions choose the expected glyph/color/position for built-in and custom ramps.
- Typing invalid input does not crash or discard the last valid image; switching named/custom ramps preserves the draft as documented. Old projects without new fields retain their defaults.
- Save/load, undo/redo, hydration, SDK parsing, CLI rendering, and all claimed live code exports preserve custom ramp and typography fields. Tests inspect actual generated output and load it in a browser.
- Browser comparisons after font readiness cover at least two browser engines and relevant DPR values. Assert layout/tonal equivalence with explicit antialiasing tolerance, not unsupported cross-platform byte identity. Test delayed and failed font loading and transparent backgrounds.
- Production packaging verifies font asset resolution in downloaded archives and non-root hosting, with licensing notices retained.

### Exclusions / dependencies

No arbitrary font upload, automatic ink-density ranking, emoji/proportional/multicell typography, GPU renderer, or source-color mode. Font licensing/coverage and packaging are release gates; performance optimization awaits CO-5 evidence.

## CO-5 — Benchmark glyph rendering before authorizing an atlas/GPU change

### Evidence and gap

The current renderer performs per-visible-cell `fillText`; it already caches ramp/font metrics and redundant fill assignments. Existing renderer unit tests are not a real-browser performance baseline. No performance benefit is claimed by this plan.

### Measurement scope

1. Build a reproducible, nonproduction browser benchmark harness comparing current `fillText` with a prototype glyph-atlas path. Treat GPU/text batching as an optional later candidate, not a required implementation. Keep experimental code out of the default SDK/editor bundle.
2. Record commit, browser/version, OS, hardware/GPU, viewport/DPR, font readiness, input seed, canvas size, grid dimensions, visible glyph count, ramp, and color mode. Include sparse/dense scenes, classic/custom ramps, static and fading animation, and palette-colored output at 256, 512, and 1024 pixel canvases with cell sizes 4, 8, and 16.
3. Separate font/atlas construction and first-frame latency from warmed renderer-only timings; separately measure full engine sampling/readback/post-processing/frame time. Report p50/p95, repeated-run spread, long frames, memory/cache growth, and export capture throughput. Use real Canvas/WebGL browsers, not jsdom mocks, and include representative desktop plus a real constrained/mobile device when available.
4. Check reference-image correctness before accepting speed results. Include ramp/font/size/DPR invalidation, transparency, palette changes, fades, and bounded cache eviction; quantify atlas memory per configuration.

### Acceptance / promotion gate

- Commit an executable harness, invocation instructions, raw machine-readable measurements, environment metadata, and a concise decision report. Run at least three measured repetitions after warmup; retain failures and variance rather than reporting the best run.
- Proposed promotion criterion, fixed before results: at least 20% lower p95 renderer time in the dense target scenarios, no more than 5% full-frame p95 regression in sparse/common cases, correct reference images, and a documented bounded memory budget that fits the target device. If measurement noise exceeds those margins, report inconclusive and repeat rather than declaring victory.
- Include startup/font/atlas costs and SDK gzip impact in the decision. A rejected or inconclusive candidate is a valid completed benchmark task.
- Any promoted optimization receives a new implementation plan with independent audit; no renderer replacement is hidden inside this measurement issue. Benchmarks remain informational, not flaky hardware-dependent CI merge thresholds.

### Exclusions

No “faster” claim without measured output, production atlas/GPU adoption, adaptive quality rollout, or telemetry collection. Do not block custom ramps on speculative speedups.

## CO-6 — Experimental edge-aware and source-color ASCII, independently gated

### Evidence and gap

`AsciiRenderer.render` receives RGBA samples but chooses glyphs from luminance; existing `asciiColored` maps brightness through the selected palette, not original RGB. `drawPixel` receives brightness/color rather than an edge/source-neighborhood contract. Thus source color and structural edge glyphs are genuinely different features, but palette-colored ASCII already exists.

### Experimental scope

1. Keep two independent opt-in experiments: **source RGB color** versus existing monochrome/palette color, and **edge-aware glyph selection** versus current luminance ramp. Defaults and existing saved projects remain unchanged. Do not overload the meaning of `asciiColored`; define migration to an explicit color-mode enum only if the experiment graduates.
2. Source color means the RGB of the engine's sampled rendered scene/image, not guaranteed original asset albedo. Trace `BitmapEffect` sampling, alpha/compositing, inversion, and fade-particle initialization before coding. Define whether inversion affects glyph density only; document lighting/post-processing interactions.
3. Prototype a deterministic luminance-gradient pass with magnitude threshold and orientation bins selecting a small validated directional-glyph set; retain ramp selection in flat regions. Define border/transparent-neighbor behavior and temporal stability. Keep thresholds bounded and avoid edge glyphs on transparent backgrounds.
4. Evaluate each mode separately and combined on fixed fixtures: flat gradients, thin diagonals, high-contrast silhouette, multicolor image, textured/lit model, transparency, and rotating/fading content. Preserve source-color/edge information through fade particles if parity is claimed; otherwise clearly disable the unsupported combination during the experiment.
5. Use CO-5's harness/baseline to measure added sampling/gradient/color costs. Experimental settings must not silently ship in public archives that cannot reproduce them; either include a tested experimental runtime explicitly or gate those exports with a reason.

### Acceptance / graduation gates

- Produce deterministic fixtures, side-by-side stills and short animations, raw timings, and a report separating source-color fidelity from edge/structural quality. No placeholder or synthetic “benchmark results.”
- Numeric tests verify known gradient directions, flat-region fallback, threshold boundaries, transparent edges, RGB values, and repeatability with a fixed seed/time.
- At least two independent reviewers compare the fixtures for silhouette recognition, detail retention, and temporal flicker; record disagreements and regressions. Edge mode does not graduate merely because it looks better on one portrait.
- Proposed performance gate: full-frame p95 overhead no greater than 20% versus the same baseline configurations on target devices, with no unbounded per-frame allocation; declare and assess any revised budget before accepting results.
- Before graduation, demonstrate static/fade parity and project/SDK/CLI/export round trips for each newly supported mode, with safe handling of old or unknown values. Source-color may graduate independently if edge-aware quality fails, or vice versa.
- Deliver a go/no-go recommendation and separately audited production plan; keep experiments out of the default UI and production bundle until approved.

### Exclusions

No AI/ML edge detection, semantic recognition, arbitrary fonts, public plugin API redesign, default visual changes, or guarantee of source-color matching the original unlit asset. This is an experiment, not a launch requirement.

## CI/CD inspection and deployment implications

Inspected `.github/workflows/ci.yml`, root/package scripts, `vite.config.js`, and `vercel.json`; no configuration changed and no deployment run.

- CI runs on pull requests to `main` and pushes to `main`, without a documentation path exclusion. Its `check` job uses Node 20, `npm ci`, lint, repository-wide Prettier, root Vitest, app build, an additional embed build, gzip size enforcement (51,200 bytes), alias-leak verification, and upload of `dist/`.
- Root `npm run build` already invokes `prebuild → build:embed`, which copies the SDK to `public/embed/bitmap-forge.es.js` before Vite bundles the app. The later explicit embed build is additional work, not the only SDK build. Future lifecycle/font/renderer changes must test the SDK actually packaged by the app, not only its source directory. Builds can alter the tracked public SDK; do not include generated changes accidentally in a documentation-only PR.
- The `check` job deploys with `npx vercel --prod` only on a push to `main`. A merged documentation-only PR can therefore trigger production deployment. Pull-request runs do not deploy via this workflow. External Vercel Git integration/settings were not inspected and could behave separately.
- Deployment is not `--prebuilt` and does not explicitly consume the uploaded artifact, so do not assume the uploaded/tested `dist/` is byte-identical to what Vercel builds and serves. Confirm project build settings in an authorized release check.
- The separate `cli` job builds/tests the CLI but is not a declared prerequisite of `check` deployment (`needs` is absent). A production deploy can occur before the CLI job succeeds. Branch-protection settings are unknown.
- Root Vitest includes `src/**` and `test/integration/**` only. The workflow does not explicitly run the embed package's test suite, dedicated `vitest.export.config.js` decode suite, or Playwright suite. A green current CI is therefore insufficient evidence for CO-3 browser lifecycle correctness, CO-4 font parity, or generated-export execution. Future implementing PRs must run these suites explicitly and attach results; any CI expansion needs a separate approved config change, not this planning task.
- Live archives vendor engine/SDK code. Existing downloaded embeds do not receive these fixes automatically; users must regenerate/redeploy. New fonts/helpers require explicit inclusion in archive manifests and `engineSources.js`, licensing review, asset-path verification, and the SDK budget check. CDN Three.js remains a network/CSP requirement for the generated static Embed page.
- `vercel.json` contains a broad SPA rewrite to `/index.html`. Production smoke tests should verify existing SDK/font/model assets return their real bytes/content types and missing assets do not masquerade as successful HTML downloads. Do not infer actual routing precedence from the rewrite alone.

### Verification checklist for future implementation PRs

Run root lint, format check, unit/integration tests and build; explicitly run the embed package tests, dedicated export decode tests, relevant Playwright/generated-artifact tests, and CLI build/tests for shared-engine changes. Inspect archive contents and serve representative generated integrations in a real browser. Check SDK gzip size/alias leakage and production-base asset URLs. Report exactly which suites ran and any environment limitations. No benchmark or experiment may substitute fabricated performance data for an unavailable device/browser.

## Planning limitations

Repository governance was read. Referenced `CODEX.md` and `COLLAB/{STATUS,TASK_BOARD,DECISIONS,CONFLICTS}.md` bootstrap files are absent in this checkout; no private memories or other-agent configurations were inspected. This document is based on source inspection, not executed feature tests or production verification. Only this plan file is authored by this workstream; no implementation, issues, pushes, or CI/CD changes are authorized here.

## Audit resolution contract (authoritative phased scope)

These revisions override ambiguous earlier wording; original acceptance remains required across phases. “Shippable” is conditional, not approval. Independent acceptance of revisions precedes code and final implementation audit precedes release. CO-1/CO-2 are not fully independent: serialize shared owners below. CO-5/CO-6 remain research only, not launch dependencies. Tracker links exist in `issues.json`; this revision writes no external state.

### CO-R1 — Shared source transaction/history (CO1-A/B/C, CO3-A)

One engine owner edits SceneManager/PreviewCanvas/load-disposal tests before starters or SDK integration. Replace `_loading` request dropping with monotonic per-manager generations. Prepare model/text/image/shape as an **unattached group** with source metadata and idempotent disposal handle; no prepare mutates active scene. Check generation/disposal after every async boundary and immediately before synchronous commit. Stale/failed groups dispose geometry/material/texture and owned URLs; destruction invalidates generations. A stale finally cannot clear newer loading state. Abort fetch where possible, retain guards for nonabortable decode.

Starter captures project/source revision; any edit/undo/import during prepare cancels with retry explanation. Atomic successful publication includes settings/source and transaction ID; PreviewCanvas subscription consumes prepared result exactly once rather than starting a second destructive load. Failed prepare/commit keeps old scene/store usable. Tests assert attached objects and disposal for A→shape B, A→model B, failed parse after HTTP success, retry and disposal during decode.

Choose **bounded reference-based whole-project history**, 20 entries retaining File/Blob/image-source/pluginParams references plus scalar snapshots, not binary copies/serialization. Reference-count resource ownership separately; revoke URLs/dispose GPU resources only when no consumer needs them. Undo/redo prepares retained source before atomic commit; failure preserves history pointer/current project. New edit truncates redo; session disposal clears retained references. Report retained-source bytes in tests; 20 entries is not a byte cap and large-file memory remains disclosed. Acceptance requires model→model→undo/redo and user image→starter→undo restoring actual scene/source. If infeasible stop for re-audit, do not silently substitute nonundoable replacement.

| Field family | Source + look | Look only |
| --- | --- | --- |
| source/type/model/image/text/shape/plugin params | complete descriptor, clear inactive references | preserve |
| transforms/base rotation/model scale | manifest, neutral/1 defaults | preserve |
| mode/palette/pixel size/threshold/invert | full manifest/default reset | same |
| seed/renderer-specific detail/ASCII ramp+color | full manifest/default reset | same |
| post-effect stack/options | disabled/default unless declared | same |
| lighting direction/intensity | manifest/default | same (lighting is look) |
| animation phase/type/duration/options | manifest/default, deterministic show origin | same |
| text font/size/spacing/alignment/geometry options | source descriptor defaults | preserve |
| disclosure/export selection | preserve | preserve |

Validate field-level allowlist/default coverage against current defaults so new unclassified keys fail fixture. Apply render mode before pixel size; starter/look transactions normalize ASCII cell size ≥8. Later direct user size edits retain current behavior. Thumbnails use same seed/settings/show time.

Phases: **1a** loader/history infrastructure and races; **1b** complete manifest/procedural+text starters/actions; **1c** reusable model only with rights evidence, else explicit procedural substitute, thumbnails/non-root assets/confirmation/history tests. Original undo and source criteria are not dropped; CO-1 closes only after all pass.

### CO-R2 — Capability, safe generation, guidance (CO2-A–E)

**2a inventory/gates:** nine-format machine-readable matrix separates source, serialized versus applied settings, dimensions/DPR, timing determinism, asset/runtime/container. Include exportConfig omissions (seed, scale, post-effects, renderer settings), React/Web duration path mismatch, SDK/CLI absent rotation/light/scale setters and letterSpacing. Full project JSON never proves application. Test asymmetric fixtures with all these nondefaults. Missing settings carry precise visible limitations until repaired; missing assets/incompatible source block.

Code ZIP is **developer engine starter requiring integration**, not faithful live output/recommended live-site format: document missing render-mode/resize/animation/light/pose setup and unsupported lifecycle policy. SDK/CLI limitations remain visible until actual repairs/tests. Recommendations may yield **no compatible format** when source/runtime/encoder prevents alternatives; do not force a fictitious raster choice. This explicitly qualifies earlier “every goal” acceptance.

Shared capability assertion runs UI/handler and independently exported buildReactComponent/buildWebComponent/buildCodeZip/buildEmbedZip boundaries. Use active source only; stale retained model cannot satisfy current text/shape/image. Validate actual asset/SDK bytes including HTML-with-200. Test all sources with stale models and no encoders.

**2b safe artifacts:** deterministic safe archive-relative asset names, reject traversal; serialize JS literals properly and escape HTML context separately. Validate component identifiers and custom-element tag grammar. Tests cover quotes, backslashes, URL delimiters/path-like and malicious names, missing SDK bytes, README/metadata. Execute fresh React/Web/SDK/Code packages over documented HTTP/bundler procedures and compare settings, not merely nonblank. Narrow duration-path correction can be a separately tested subchange; blanket parity repairs are not implicit. CO-4 owns ASCII config additions under same config owner.

**2c guidance:** goal/all-formats controls and consistent README matrix, accurate actual video extension/container, project persistence distinct. Original decode/conformance/generated execution criteria remain; matrix/copy alone cannot close CO-2.

### CO-R3 — Playback/capture/policy/generated lifecycle (CO3-B–E)

**3a engine:** requestedPlayback plus independent reasons (lifecycle/context/capture tokens). Existing pause/resume own explicit requested state; policy changes its reason only. Integrations start suspended before first loop; editor defaults unchanged. Capture acquires unique suspension token, deterministic steps remain usable; finally releases only its token. Nested captures compose and concurrent pause/policy changes win. Apply framesProvider, CLI capture and CLI video. Complete/error/cancel never resumes hidden/paused/context-lost/disposed manager. CO-R1 generation contract is prerequisite.

**3b policy:** autoplay deliberately means eager loading **even under reduced motion** (documented API change), not play permission. Non-autoplay uses prefetch intersection; src changes route through same eligibility. Playback waits for genuine non-prefetch intersection result plus nonzero size. Without IntersectionObserver load eagerly and reconcile bounding rect against viewport on resize/passive scroll; document occlusion limitation. Zero-size remains paused until resize. Initial document-hidden state reconciles before load. Reduced still = midpoint of configured show phase. Context restore rebuilds/redraws once without clearing reasons; resize/DPR/settings may redraw once. No recurring loop or accumulated-time jump.

**3c generated:** generation-specific local manager identity at every async continuation, abort fetch/cancel queued rAF, dispose local manager on errors; shared-ref truthiness is insufficient. Reuse shadow roots. Package helper/controller via engineSources and SDK; execute freshly generated StrictMode React and removed/reinserted custom elements. Code ZIP retains explicit unsupported-policy disclaimer, not a live claim.

**3d CSS:** record captured sprite index nearest show midpoint, set reduced-motion explicit background-position from real rows/columns, disable animation; test nonblank visible still. Pure CSS does not offer JS offscreen suspension. Existing manager pause/requested state is policy-owned integration point; no manual play/loop API expansion.

Acceptance: engine deferred races/disposal/retry, capture all reasons/nesting/cancel, initial hidden/offscreen prefetch/zero-size/DPR/context restore, bounded real-browser recurring callback counts, nonblank still and generated reconnect. Mock-only tests cannot establish scheduler correctness.

### CO-R4 — Ramp correctness then typography (CO4-A–E)

**4a validation/brightness/config:** retain existing named font appearance and disclose system-font limitation. Particle contract stores raw sampled luminance+alpha; renderer applies inversion/threshold exactly once, equality visible (`brightness >= threshold`) in static and fade. Regress every affected shared-particle renderer, inverted endpoints/equality/nondivisible grids/alpha/post-effects before changing shared semantics.

Exact custom repertoire U+0020–U+007E and U+2580–U+259F only; 2–128 code points, at least one nonspace, preserve repetitions/order/spaces. Reject nonstrings and all other code points. Unknown IDs/invalid imports fall back classic with structured warning; UI notice/SDK warning event/CLI stderr present it, direct renderer safe fallback avoids per-frame spam. Validate hydration, both parsers, loadProjectFile, UI, renderer direct options and generated configuration. Separate customCharRamp, keep named IDs; thread charRamp/asciiColored/custom config under one CO-2/4 owner. Test old projects/import/undo/SDK/CLI/generated round trips. This phase is **partial CO-4**, not reproducible typography completion.

**4b design gate:** no font implementation until exact face/license/hash, coverage, reference comparisons and measured asset budget approved independently. Distinct asciiFontId/asciiTypographyVersion, never geometry fontFamily/fontSize. Unknown font IDs use documented warned legacy fallback. Selection remains unresolved, not silently replaced globally.

**4c distribution/resource contract:** shared promise/cache keyed face/version/repertoire; FontFace.load plus actual repertoire check, 5-second timeout. Ready invalidates glyph metrics/redraws; pending callbacks generation/disposal guarded. Failure allows warned preview fallback but blocks deterministic capture, offering retry or explicitly labelled nondeterministic legacy output, never parity claim. Self-relative manifest URLs; explicit copy manifests for app public/npm dist/Embed ZIP/React-Web-Code archives/CLI HTTP server; license and hash/MIME checks. Existing 51,200-byte JS gzip cap retained; proposed font cap 128 KiB compressed per face and combined one-face JS+font ≤182,272 bytes, requiring measured pre-code approval. No externalized-byte evasion.

Acceptance: late/failure/pending disconnect and cache invalidation, CLI/non-root/archive bytes, two real engines DPR1/2 with approved antialias tolerance, engine-appropriate launch flags (no Chromium flags on second engine). Cross-platform byte identity excluded. CO-4 closes only after 4c; font decision blocks that phase, not 4a.

### CO-R5 — Frozen research protocol (CO5-A–D)

Benchmark shipped 4a; pre/post typography baselines recorded separately, final promotion uses 4c baseline. Freeze scenario IDs as tuples: size{256,512,1024}-cell{4,8,16}-DPR{1,2}-density{sparse,dense}-ramp{classic,custom}-color{mono,palette}-phase{static,fade}. Cell4 is stress. Add 513×509 correctness fixture; record actual cell dimensions, font readiness/color cardinality. Target classes integrated-GPU desktop Chromium and real constrained Android/mobile browser, exact device/version frozen before runs. Missing mobile is incomplete gate.

120 warmup + 600 measured frames per scenario, three paired A/B repetitions alternating order; retain raw samples/failures. Separate CPU submission, completed readback-synchronized frame (identical overhead), full-engine frame and export wall time; rAF cadence is diagnostic only. Report each scenario/repetition p50/p95/spread, atlas construction/eviction/allocation/transition/startup/font costs. Atlas cap 16 MiB active configuration, 32 MiB instance; unavailable total GPU-memory measurement labelled unavailable.

Promotion requires every dense scenario ≥20% renderer p95 improvement, every sparse/common ≤5% full-frame p95 regression, correctness/caps on both classes; no pooled average hides failures. Noise means inconclusive. Harness smoke/correctness CI addition separately approved, timing never threshold CI. Verify prototypes/assets absent from actual production graph/artifact manifests. New audited production plan still mandatory.

### CO-R6 — Explicit sampled-scene experiment contract (CO6-A–D)

Research-only BitmapEffect→BaseEffect payload carries straight sampled RGBA/raw luminance/coordinate/optional orientation, never palette color as source RGB. Scene sampling/postprocessing stages documented; source means rendered scene, not albedo. Zero-alpha excluded, partial alpha preserves straight RGB+alpha, compositing only on chosen background. Inversion changes density only. Fade retains sampled RGB/orientation for lifetime; do not recompute moving neighborhoods. CO-R4 brightness prerequisite.

Linear-sRGB luminance (sRGB decode, Rec.709 coefficients), Sobel valid-neighbor gradient; exclude transparent neighbors and normalize available weights, insufficient support falls back ramp. Clamp borders. Edge tangent four bins uses allowed `-`, `|`, `/`, backslash glyphs. Freeze initial normalized magnitude enter0.15/exit0.12 and 10-degree orientation hysteresis on corresponding stable cells, reset on source/grid change. Document revisions rather than tuning selected wins. Measure gradient preprocessing separately. Test borders/thresholds/animated light+pose/fixed seeds+times.

Scenario IDs gradient/diagonal/silhouette/multicolor/textured-lit-model/transparency/rotation/fade at 512/1024 DPR1/2, baseline/source/edge/combined, same CO-R5 devices/sampling. Each scenario ≤20% full-frame p95 overhead; no averaging, bounded allocation report. Two reviewers record judgments independently before discussion; modes pass independently. Missing device/reviewer evidence blocks graduation but permits honest inconclusive report.

Programmatic builders/import parsers reject active experimental requests with explanation; unknown fields never enable production behavior. Verify prototypes/fixtures absent from default bundles/archives. Only explicitly experimental tested archive may package runtime. Full static/fade/project/SDK/CLI/export parity and a newly audited schema/runtime plan required before graduation; no default migration authorized.

### CI-S — Separate approved mandatory release prerequisite (CI-A)

No workflow edit now. Before shared engine/lifecycle/font release obtain approval for CI safety work: protected deploy job depends on root lint/format/tests, SDK tests/build/gzip/alias, CLI build/tests, export decode and generated-artifact browser checks. Node20/root npm ci/workspace lock, no later unconstrained installs. Read back required check/branch-protection settings under release authorization, no PR/fork production secrets. Install browsers/system deps; skipped/unavailable tests cannot count as passed.

Build SDK once, package identical hashed bytes in app/archives with helper/font/license manifests and revision/hash provenance. Test isolated built output (not reused dev server), readiness/revision, non-root/extracted integrations, missing asset/HTML-200/MIME and second typography engine; retain traces/decode/logs. Approve Vercel build/output plus validated prebuilt deployment, or explicitly pin rebuild provenance/verify served hashes; raw dist alone is not Vercel prebuilt. Inspect external Vercel integration for bypass.

Choose protected-environment approval for **every** production release including docs-only, keep validations runnable; serialize releases and cancel superseded pending runs so old runs cannot overwrite new. Record rollback target/owner. Postrelease checks separately authorized: revision/assets/fresh Embed/reduced+visibility smoke, rollback on failure. Until CI-S/settings verified, local completion never authorizes main push/deploy.

### Ownership and open approvals

Serialize source/history/SceneManager → capture/lifecycle → generated integrations. One config/validation/engineSources owner across CO-2/4; Layout owner integrates starter/guidance without racing status/ExportPanel edits. Targeted phase acceptance, independent integrated review then full exact-tree CI-equivalent/SDK/CLI/export/browser verification. No research promotion hidden inside implementation.

Unresolved gates: exact font/license/hash/reference and measured budget approval; model redistribution proof (procedural fallback permitted); actual device availability/metadata; CI-S approval/external branch protection/protected environment/Vercel settings and release rollback owner. These do not silently delete requirements: affected phases/claims remain blocked. Plans establish no test results, rights evidence or measured speedup.
