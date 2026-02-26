**Final Recommended Approach**

- Adopt Claude’s evidence-backed review wholesale, with its 6-batch implementation order, and fold in the four gaps (A–D) as Phase 1 items.
- Keep Codex’s helpful, non-controversial perf hygiene as add-ons in the Performance batch: throttle high-frequency canvas interactions and add a small `useEventListener` utility (plain JS).
- Exclude Codex items that lack applicability/evidence (SSR/hydration, TS files in a JS codebase, route splitting, i18n, workers).
- Clarify two plan revisions before coding: (a) pick a single progress reporting approach (message-embedded percentage for now), (b) broaden destructive-load confirmation to cover any dirty state, not just `currentModel`.

Note: Skills like “vercel-react-best-practices” and “web-design-guidelines” would normally be referenced, but per process rules we cannot open external files this round; proceeding with the provided proposals only.

**Adopted Points from Claude**

- Use a mounted-guard and manager-equality guard in `PreviewCanvas` (Findings #1, #2) and combine them into one change.
- Add cancel/abort for exports; ensure video abort clears render callbacks; standardize friendly error mapping (Findings #5, #7).
- Resolve progress UI contradiction by choosing message-embedded percentages for now (Finding #6).
- Confirm-before-load should consider any dirty state, not just `currentModel` (Finding #8).
- Add a lightweight loading spinner overlay in `PreviewCanvas` (Finding #9).
- Introduce an app-level ErrorBoundary (Finding #10).
- Block HTML export over size limit (Finding #11).
- A11y fixes for color buttons, range labels, status roles, details/summary, and hidden file inputs (Findings #12–#16).
- Store/timer cleanup and selector consolidation: dep array correctness, remove module-level timer, collapse multiple selectors with shallow equality (Findings #17–#21).
- Visual consistency (buttons, input backgrounds) and layout fix removing `h-[70vh]` (Findings #22–#24).
- Color picker overflow flip; use Lucide icons instead of Unicode/inline SVG if Lucide is already in the stack (Findings #25–#27).
- Proactive large model warning retained (Finding #28).
- New gaps to include early: pre-try throws in exports (Gap A), missing `exporting: true` in HTML export (Gap B), duplicate status surfaces (Gap C), and `message`/`error` coexistence semantics (Gap D).
- Zustand version check before selecting subscription strategy (Finding #4).

**Adopted Points from Codex**

- Add throttling/debouncing for high-frequency interactions (e.g., pointermove/wheel on the canvas) and prefer passive listeners where safe.
- Add a small, reusable `useEventListener` helper (JS) to centralize add/remove and options.
- Establish a bundle analysis step later (Vite-friendly visualizer) to baseline perf after the perf batch.
- Expand test coverage for abort/race scenarios and cross-browser export behavior (Safari/Firefox).

**Open Disagreements Not Resolved**

- SSR/CSR hydration and Suspense: Discard for this Vite SPA; no evidence of SSR or route-level Suspense needs.
- TypeScript files: Keep new utilities in `.js`/`.jsx`; introducing TypeScript is out of scope.
- Context/provider churn and store migration: The app already uses Zustand; no migration needed.
- Icon swaps priority: Keep Lucide replacements, but as part of the a11y/style batch (not earlier).
- Workers/i18n/circular deps/feature flags: No evidence; exclude from scope.

**Per-Finding Verdicts**

- APPROVED: #1, #2, #3, #5, #7, #9, #10, #11, #12, #13, #14, #15, #16, #17, #18, #19, #20, #21, #22, #23, #24, #25, #28
- NEEDS REVISION: #4 (verify Zustand version; use native selector subscribe in v5), #6 (pick one progress approach; use message-embedded now), #8 (broaden dirty-state check), #26 (use Lucide Info icon), #27 (use Lucide Alert icon)
- DISPUTED: none
- Additional Gaps to include: Gap A (P1), Gap B (P2), Gap C (P3), Gap D (P3)

**Prioritized Top-10 Fixes**

1. Gap A: Wrap/route pre-try throws in export paths to avoid UI crashes.
2. Findings #1 + #2: Mounted and manager guards in `PreviewCanvas`.
3. Finding #9: Loading spinner overlay during model load.
4. Findings #5 + #6: Abortable exports plus consistent progress messaging.
5. Finding #7: Friendly error messages for exports.
6. Finding #10: App-level ErrorBoundary.
7. Finding #8: Robust destructive load confirmation (full dirty-state).
8. Findings #11 + Gap B: HTML export size block and `exporting: true` parity.
9. Finding #4: Narrow store subscriptions (version-appropriate); add throttling for high-frequency canvas events.
10. Findings #14 + #27: Status ARIA roles and stronger error visuals.

**Implementation Order**

- Batch 1 — Critical Bugs: Gap A, Gap B, #1, #2.
- Batch 2 — Export UX: #5, #6, #7, #11.
- Batch 3 — UI Polish: #8, #9, #10.
- Batch 4 — Performance: #3, #4 plus throttling and `useEventListener` helper.
- Batch 5 — Accessibility: #12, #13, #14, #15, #16, #27.
- Batch 6 — Cleanup: #17–#23, #24, #25, #26, #28, and Gap C/D resolution.

**Verification Checklist**

- Automated
  - Run unit/integration tests (Vitest) covering: export abort mid-run (GIF/video/sprite), unmounted setState suppression, and error mapping.
  - Lint (ESLint) and format checks pass; no new exhaustive-deps violations without justification.
  - Build with Vite; confirm no warnings related to unused/ts-only artifacts.
- Manual
  - Export flows: start then cancel; verify status resets and canvas callbacks cleared; buttons disabled during export for all formats (incl. HTML).
  - Model load/unload: trigger load, navigate away, confirm no console errors/warnings; spinner shows/hides correctly.
  - ErrorBoundary: simulate a throw inside canvas subtree; app remains usable and offers reset.
  - A11y: Keyboard and screen reader checks for color buttons, range inputs, details/summary; hidden file inputs have descriptions.
  - Perf: Drag/zoom interactions remain smooth with throttled handlers; preview renders don’t block UI.
  - Visual: Button/input styles consistent; error messages stand out; mobile layout unaffected by previous `h-[70vh]`.
- Post-Perf
  - Bundle visualizer snapshot after Batch 4 to record baseline and identify any obvious heavy imports.

**Rollback Plan**

- One PR per batch with focused scope; avoid mixing unrelated fixes.
- If regressions appear, revert the batch PR wholesale via Git and redeploy previous stable.
- For export-path changes, keep old code paths behind minimal toggles/flags in local scope (not build-time) for quick bisect in dev.
- Maintain a CHANGELOG entry per batch to track user-facing behavior changes.

**Confidence + Unresolved Unknowns**

- Confidence: High for Claude-backed items (line-validated); Medium for added perf hygiene (throttling) since specific handlers weren’t cited but are common in canvas editors.
- Unknowns: Exact Zustand version (v4 vs v5) affects subscription API; whether Lucide is already in the deps; details of `withPausedScene()`/render-callback clearing; cross-browser quirks in export libraries.
- Mitigation: Check `package.json` before choosing Zustand APIs and icon imports; add targeted tests for abort/race paths; run a quick manual Safari/Firefox export sanity check before closing the export UX batch.
