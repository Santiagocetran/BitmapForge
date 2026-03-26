## TL;DR
Solid direction overall, but there are a few contract and ordering gaps that could cause regressions: the animation effect interface is inconsistent (units and parameters), execution order isn’t guaranteed, and the export registry may inadvertently bundle every format and conflate abort scopes. Also add an explicit dependency from the export work to the new effect classes and tighten the store slice reset semantics.

**Findings-By-Severity**
- High
  - Animation effect API inconsistencies: `applyReset(target, deltaMs)` uses ms while `update/seekTo` use seconds; `FloatEffect.checkReset()` claims it receives the effects map but the signature only has `(active, previouslyActive, target)`. This threatens seek–update parity and reset correctness.
  - Effect execution order not specified: switching from inline branches to iterating a `Map`/object can change transform composition order, altering visuals and breaking seek parity.
  - Export registry hidden dependency: REQ-003 (registry) effectively depends on REQ-002 because `engineSources.js` “will need 6 new effect class entries.” Without declaring this, export tests may fail mid‑wave.
  - Export orchestration abort scope: single shared orchestration risks cross‑cancel or status bleed if multiple exports run concurrently.
- Medium
  - Store slicing reset semantics: `resetToDefaults: () => set(DEFAULT_STATE)` must remain a merge, not replace; `DEFAULT_STATE` must include only serializable fields already tracked by temporal’s `partialize`. Otherwise undo snapshots or non‑serializables (e.g., `model`) could be clobbered.
  - Cross‑slice atomic updates: ensure multi‑field updates (e.g., `setRenderMode` + `pixelSize`) happen in one `set` call and do not rely on stale `get()` snapshots inside chained sets.
  - PreviewCanvas selectors: exported selector function identities must be stable; don’t construct them per‑render or you’ll defeat shallow equality and trigger re-render storms.
- Low
  - Count mismatch: plan mentions 8 effects but “6 new effect class entries” in `engineSources.js`; clarify to avoid partial export coverage.
  - Middleware order: confirm `create(temporal(subscribeWithSelector(...)))` matches current order so undo/redo and targeted subscriptions behave identically.

**Plan-Max-6**
- Unify effect interfaces (seconds everywhere) and pass a single `context` that includes the effects map and timing.
- Lock effect execution order with an explicit, tested priority list.
- Make REQ‑003 depend on REQ‑002; stage `engineSources.js` entries with the classes.
- Harden store reset and cross‑slice actions; document partialize expectations.
- Lazily load export handlers; isolate per‑export `AbortController`.
- Gate each wave with parity and export conformance tests before proceeding.

**Edits+Paths**
- Animation interfaces and engine
  - Define a single interface and units: `update(target, dtSeconds, speed, context)`, `seekTo(target, tSeconds, speed, context)`, `checkReset(active, previouslyActive, target, context)`, `applyReset(target, dtSeconds): boolean`, `clearReset()`. Add `EffectOrder = string[]`.
    - `src/engine/animation/types.ts`
  - Enforce deterministic order (array, not object/Map iteration) and reuse it in both update and seek:
    - `src/engine/AnimationEngine.ts`
  - Ensure all eight effects are registered and discoverable (Spin x3, Float, Bounce, Pulse, Shake, Orbit):
    - `src/engine/engineSources.js`
    - `src/engine/effects/SpinEffect.ts`
    - `src/engine/effects/FloatEffect.ts`
    - `src/engine/effects/BounceEffect.ts`
    - `src/engine/effects/PulseEffect.ts`
    - `src/engine/effects/ShakeEffect.ts`
    - `src/engine/effects/OrbitEffect.ts`
- Store slices and reset
  - Keep `resetToDefaults` a merge and restrict `DEFAULT_STATE` to serializable, partialized fields. Add comment asserting “no functions/non‑serializables”:
    - `src/app/store/defaultState.ts`
    - `src/app/store/index.ts`
  - Implement cross‑slice atomic setters via a single `set(() => ({ ... }))` call; avoid back‑to‑back `set()`:
    - `src/app/store/slices/renderingSlice.ts`
- Preview selectors
  - Export stable, named selectors; avoid inline factory functions:
    - `src/app/store/selectors.js`
    - `src/app/components/PreviewCanvas.tsx`
- Export registry and config
  - Lazy‑load handlers to avoid bundling all formats; isolate abort per call; keep handler signature consistent:
    - `src/app/export/registry.ts`
    - `src/app/export/formats/<formatId>.ts`
  - Single source of truth for config; align consumers:
    - `src/app/utils/exportConfig.js`
    - `src/app/export/reactComponentExport.js`
    - `src/app/export/webComponentExport.js`
    - `src/app/export/codeExport.js`

**Verify-Commands**
- Check effect API consistency and usage sites
  - `rg "applyReset\\(" src/engine -n`
  - `rg "seekTo\\(|update\\(" src/engine -n`
  - `rg "checkReset\\(" src/engine -n`
- Confirm deterministic effect order used in both paths
  - `rg "for \\(.*effects" src/engine/AnimationEngine.ts -n`
- Ensure single config builder is the only entry point
  - `rg "createComponentConfig|createAnimationConfig" -n`
  - `rg "buildExportConfig" -n`
- Validate selectors are imported, not inlined
  - `rg "selectEffectOptions|selectAnimationOptions|selectInputSource" src/app -n`
- Run the full suite and parity subset (adjust to your runner)
  - `npm test`
  - If supported: `npm test -- animation` and `npm test -- export`

**Alternative+Tradeoff**
- Keep animation logic centralized without classes (tagged union with pure functions). Pros: fewer allocations, simpler serialization/testing. Cons: weaker information hiding, harder to extend per‑effect state.
- Use per‑slice “feature modules” but retain a single store file. Pros: minimal rewire, avoids slice collision risk. Cons: less ownership clarity and weaker boundaries.
- Export registry via plugin interface + dynamic import keys. Pros: code‑split by format; Cons: slightly more boilerplate and async error paths.

**Confidence+Unknowns**
- Confidence: medium. The plan is clear, but exact file structure, runner, and bundler config aren’t shown.
- Unknowns: whether TypeScript is enforced; how `engineSources.js` is consumed by exports; existing effect order semantics; available test filters/commands.

**Rationale**
- This tightens module boundaries and contracts (deep modules, clear APIs), avoids hidden coupling (explicit dependencies and deterministic order), and reduces surface area for change amplification (single export config and stable selectors) — directly addressing Ousterhout’s red flags on obscurity, leakage, and unnecessary complexity.