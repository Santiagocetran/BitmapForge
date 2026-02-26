**Findings**

Note: I could not open docs/plans/app-fixes-plan.md or referenced files per “Do not run tools.” Verdicts below reflect validation risk; where I cannot check a before/after snippet against the repo, I mark NEEDS REVISION and provide a concrete review checklist and proposed scope. Ordering is by likely user impact and blast radius.

- 1. Crash containment (global ErrorBoundary around editor/canvas)
  - Verdict: NEEDS REVISION (no source validation)
  - Priority: High | Effort: S
  - Regressions: swallowing actionable errors; SSR mismatch if boundary renders differently
  - Gaps: add error-reporting hook and tests

- 2. SSR/CSR hydration mismatches (direct `window/document` in render)
  - Verdict: NEEDS REVISION
  - Priority: High | Effort: S
  - Regressions: layout shift, double effects
  - Gaps: lint rule or codemod to gate env access

- 3. Context value churn (SceneManager/context values recreated each render)
  - Verdict: NEEDS REVISION
  - Priority: High | Effort: S
  - Regressions: app-wide re-render storms
  - Gaps: selector pattern for context consumers

- 4. Expensive derived state computed on render
  - Verdict: NEEDS REVISION
  - Priority: High | Effort: S–M
  - Regressions: memoization hiding legit updates
  - Gaps: profile to pick true hotspots

- 5. Unbounded event listeners (resize, pointer, keydown) lacking cleanup
  - Verdict: NEEDS REVISION
  - Priority: High | Effort: S
  - Regressions: lost behaviors on detach/reattach
  - Gaps: shared `useEventListener` hook

- 6. Canvas/WebGL context lifecycle misuse (recreate on prop change)
  - Verdict: NEEDS REVISION
  - Priority: High | Effort: M
  - Regressions: stale refs after resize
  - Gaps: ref-centered init + guarded effects

- 7. Async race conditions (effect loading/cancelation missing)
  - Verdict: NEEDS REVISION
  - Priority: High | Effort: S
  - Regressions: setState on unmounted
  - Gaps: `AbortController` and test

- 8. Missing Suspense fallbacks for async assets/effects
  - Verdict: NEEDS REVISION
  - Priority: High | Effort: S
  - Regressions: flash of unstyled/blank UI
  - Gaps: route- or feature-level fallback

- 9. Hot-path re-renders from inline callbacks/objects in JSX
  - Verdict: NEEDS REVISION
  - Priority: High | Effort: S
  - Regressions: stale closures if incorrectly memoized
  - Gaps: lint rule + perf test

- 10. Keyboard shortcut scope leaks (global handlers stealing focus)
  - Verdict: NEEDS REVISION
  - Priority: High | Effort: S
  - Regressions: broken input fields/IME
  - Gaps: scoped keymap + `stopPropagation`

- 11. Large bundle imports (whole-library imports vs subpath)
  - Verdict: NEEDS REVISION
  - Priority: Medium-High | Effort: S
  - Regressions: polyfill differences at subpath
  - Gaps: bundle analyzer baseline

- 12. No throttling/debouncing for high-frequency events (drag/zoom)
  - Verdict: NEEDS REVISION
  - Priority: Medium-High | Effort: S
  - Regressions: sluggishness if debounce too high
  - Gaps: pluggable strategy by interaction

- 13. List keys unstable or missing
  - Verdict: NEEDS REVISION
  - Priority: Medium-High | Effort: S
  - Regressions: item state jumps on reorder
  - Gaps: stable IDs, `useId` for SSR

- 14. Effect dependency arrays wrong (stale/missing deps)
  - Verdict: NEEDS REVISION
  - Priority: Medium-High | Effort: S
  - Regressions: infinite loops or missed updates
  - Gaps: exhaustive-deps exceptions documented

- 15. Focus management and ARIA gaps in editor controls
  - Verdict: NEEDS REVISION
  - Priority: Medium-High | Effort: S–M
  - Regressions: focus traps if miswired
  - Gaps: keyboard E2E tests

- 16. Route/component code-splitting not leveraged
  - Verdict: NEEDS REVISION
  - Priority: Medium | Effort: S
  - Regressions: waterfall if split points poor
  - Gaps: prefetch hints

- 17. CSS-induced layout thrash (measuring + writing same frame)
  - Verdict: NEEDS REVISION
  - Priority: Medium | Effort: S
  - Regressions: scroll jank
  - Gaps: `will-change`, transform-based moves

- 18. Imperative timers/intervals not cleared
  - Verdict: NEEDS REVISION
  - Priority: Medium | Effort: S
  - Regressions: ghost updates after unmount
  - Gaps: `useInterval` util

- 19. Global state mutations (non-immutable updates in reducers)
  - Verdict: NEEDS REVISION
  - Priority: Medium | Effort: S
  - Regressions: subtle stale renders
  - Gaps: tests around reducers

- 20. Image/video preloading strategy missing
  - Verdict: NEEDS REVISION
  - Priority: Medium | Effort: S
  - Regressions: memory pressure on low-end
  - Gaps: `loading="lazy"` policies

- 21. Error logging spills to production console
  - Verdict: NEEDS REVISION
  - Priority: Medium | Effort: S
  - Regressions: leaking PII in logs
  - Gaps: env-gated logger

- 22. Circular deps between app modules
  - Verdict: NEEDS REVISION
  - Priority: Medium | Effort: S–M
  - Regressions: module init order bugs
  - Gaps: boundary rules in lint

- 23. Provider tree depth causing unnecessary updates
  - Verdict: NEEDS REVISION
  - Priority: Medium | Effort: M
  - Regressions: prop drilling revival
  - Gaps: split providers + selectors

- 24. Drag-and-drop accessibility (mouse-only affordances)
  - Verdict: NEEDS REVISION
  - Priority: Medium | Effort: M
  - Regressions: keyboard users blocked
  - Gaps: roving tabindex patterns

- 25. Worker usage lacks fallback/error path
  - Verdict: NEEDS REVISION
  - Priority: Medium | Effort: S
  - Regressions: Safari/Firefox quirks
  - Gaps: capability check + retry

- 26. Testing gaps for hooks and reducers
  - Verdict: NEEDS REVISION
  - Priority: Medium | Effort: M
  - Regressions: undetected perf regressions
  - Gaps: perf smoke tests in Vitest

- 27. i18n/readiness (hardcoded text, no RTL)
  - Verdict: NEEDS REVISION
  - Priority: Low | Effort: M
  - Regressions: layout flips under RTL
  - Gaps: string extraction

- 28. Dev-only flags compiled into prod
  - Verdict: NEEDS REVISION
  - Priority: Low | Effort: S
  - Regressions: feature toggles leaking
  - Gaps: dead-code elimination checks

**Plan**

- Validate each plan snippet against repo and note diffs.
- Prioritize high-impact, low-effort fixes behind a feature flag.
- Implement guard rails: ErrorBoundary, Suspense, listener/util hooks.
- Stabilize renders: memoized context values, callbacks, selectors.
- Address SSR/CSR and async races; add abort/test coverage.
- Profile, split, and measure: bundle analysis + hot-path profiling.

**Patch-Ready Edits**

Note: Paths reflect additions under `src/app/`. Adjust import paths to local structure when applying.

- `src/app/providers/ErrorBoundary.tsx` (new)
  - Minimal error boundary that renders a fallback and exposes `onReset` prop.
- `src/app/hooks/useEventListener.ts` (new)
  - Stable, passive-by-default listener with cleanup; supports AbortSignal.
- `src/app/hooks/useInterval.ts` (new)
  - Declarative interval with auto-clear on unmount/dep change.
- `src/app/hooks/useStableCallback.ts` (new)
  - Returns a referentially-stable callback capturing latest state.
- `src/app/state/createSelectorContext.tsx` (new)
  - Context helper that memoizes value and exposes `useSelector` to avoid full-tree updates.
- Refactors (search-and-apply patterns across `src/app/**`):
  - Gate browser APIs: replace direct `window/document` in render with guards in `useEffect` or `useLayoutEffect`.
  - Memoize context values: wrap provider values in `useMemo({…}, [deps])`.
  - Stabilize props: replace inline lambdas/objects in hot paths with `useCallback`/`useMemo`.
  - Add Suspense: wrap async-loading components with `<Suspense fallback={<Spinner/>}>`.
  - Ensure stable keys: prefer persistent IDs; use `useId` for SSR-safe control IDs.
  - Convert high-frequency handlers (`pointermove`, `wheel`) to throttled versions and mark listeners `{ passive: true }` when safe.
  - Add `AbortController` to async effects; cancel on cleanup.
  - Replace whole-library imports with subpath imports where supported (e.g., `lodash-es/pick`).
  - Guard WebGL/canvas init with `useRef` and a single-init effect; separate “configure vs render” phases.
  - Add env-gated logger and strip dev-only logs in prod builds.

Code snippets (minimal examples):

- ErrorBoundary
  - `export class ErrorBoundary extends React.Component<{fallback: React.ReactNode,onReset?:()=>void},{error?:Error}>{ /* component with componentDidCatch + reset */ }`
- useEventListener
  - `useEffect(()=>{ target.addEventListener(type, handler, opts); return ()=>target.removeEventListener(type, handler, opts); },[target,type,handler])`
- Selector context (pattern)
  - `const C=React.createContext<State>(init); export const useSelector=sel=>sel(useContext(C));`

**Verification Commands**

- Lint/typecheck/build
  - `npm run lint && npm run typecheck && npm run build` (or `pnpm`/`yarn` equivalents)
- Tests (with coverage and watch off for CI parity)
  - `npm run test -- --coverage --run`
- Bundle analysis
  - `npm run build:analyze` (add script with `@next/bundle-analyzer` or `rollup-plugin-visualizer` as applicable)
- Runtime smoke (local)
  - `npm run dev` → open editor flows; verify no hydration warnings, stable FPS on drag/zoom
- Profiling (React Profiler)
  - Capture interaction traces for: open project → zoom/pan → apply effect

**Top-10 Fixes (Prioritized)**

1. Add ErrorBoundary around editor and critical routes.
2. Eliminate SSR/CSR hydration mismatches; guard browser APIs.
3. Memoize provider/context values; introduce selector-based consumption.
4. Throttle/debounce high-frequency input; passive listeners.
5. Fix effect dependency arrays; add stale-closure-safe callbacks.
6. Harden async with `AbortController`; prevent setState-after-unmount.
7. Stabilize hot-path props (useCallback/useMemo); remove inline objects.
8. Canvas/WebGL single-init via refs; split init/configure/render.
9. Add Suspense fallbacks for async assets/effects.
10. Replace whole-library imports with subpaths; analyze bundle.

**One High-Upside Alternative**

- Adopt a dedicated state store with selector-based subscriptions (e.g., Zustand or Jotai) for editor state instead of React context.
  - Upside: fine-grained subscriptions reduce re-renders dramatically; simpler mental model for hot paths.
  - Tradeoff: adds dependency and migration cost; requires new testing and patterns adoption.

**Confidence + Unknowns**

- Confidence: Low–Medium (no access to the actual plan file or source to validate 28 specific findings or code snippets).
- Unknowns: exact file layout under `src/app/`, presence of SSR/Next.js, actual SceneManager API, testing scripts and bundler.

**Short Rationale**

Given no file access, I focused on the highest-probability, highest-impact React app-layer risks for a graphics/editor app (per commit hints: SceneManager, effect types). The plan emphasizes crash containment, render stability, async safety, and input performance, with small, composable utilities and minimal invasive changes. When you can share the plan file and referenced sources, I’ll replace NEEDS REVISION with APPROVED/DISPUTED verdicts per finding, adjust priorities/effort with evidence, and generate concrete per-file patches.
