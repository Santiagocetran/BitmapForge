**Final Recommended Approach**

- Keep Zustand selector as implemented with `useShallow`; treat it as v5 API and document the version expectation.
- Prevent popup flip flash: switch initial measurement to `useLayoutEffect`; add `resize` (and optional `scroll`) listeners while open to recompute overflow.
- Improve a11y: add `role="img"` + `aria-label` to the “ⓘ” info icon; make “Load .bitmapforge” a real `<button>` that triggers a visually hidden file input.
- Sanity checks: confirm `BTN.base` preserves previous sizing/spacing; confirm `useMemo` removal in `Layout.jsx` is safe.
- Defer optional changes: keep static range IDs in `AnimationControls` (singleton usage); consider a modal confirm later for consistency.

**Adopted Points From Claude**

- Use `useLayoutEffect` for first-frame measurement to avoid UI flicker.
- Treat `useShallow` as version-dependent; verify/package-pin Zustand rather than rewriting a working selector.
- Note confirm dialog UX as a future improvement, not a blocker.
- Acknowledge engine-layer changes (WebGL restore, abort/progress, LUT caching) as primary regression risk to review.

**Adopted Points From Codex**

- Add `resize` (and optionally `scroll`) listeners to keep popup flip logic accurate while open.
- Replace the styled `<label>` with a `<button>` + hidden input for keyboard-accessible file loading.
- Give the info icon an accessible name (`role="img"`, `aria-label`).
- Do a quick parity sweep to ensure `BTN.base` doesn’t unintentionally change typography/spacing.

**Open Disagreements Not Resolved**

- Zustand “critical bug”: Do not replace `useShallow(...)` with `(selector, shallow)`; that likely targets v4 and would regress a passing build that appears to use v5 APIs.
- `useId()` for range inputs: not necessary for a singleton control panel; keep as a backlog item if multiple instances ever render.
- `<label>` keyboard behavior severity: current pattern works for pointer users but is weak for keyboard access; switching to a `<button>` meaningfully improves a11y with minimal churn.

**Verification Checklist**

- Dependencies
  - Confirm Zustand v5 is installed and pinned; add a note in `package.json` comments or docs.
- UI fixes
  - Color picker: open on rightmost swatch; verify no first-frame flip; resize window (and scroll, if applicable) and ensure popup stays in-bounds.
  - File load: Tab to “Load .bitmapforge”; Enter/Space opens the file dialog; Esc cancels cleanly; cancel path resets `event.target.value`.
  - Button styles: visually compare buttons touched by `BTN` constants for font size, padding, hover, disabled states.
- Safety checks
  - Search `Layout.jsx` for `useMemo` references after import removal.
  - Grep for other Zustand selector usages to ensure consistent v5 patterns.
- Engine hot spots (manual)
  - WebGL context loss/restore path: ensure resources rebind, listeners clean up on unmount.
  - Export hook: AbortController lifecycle, progress updates, cleanup on cancel/unmount.
  - LUT/color mapping invalidation when palette changes.
  - Yielding/main-thread: ensure timers/raf cleared on teardown.

**Rollback Plan**

- Keep changes isolated to:
  - `src/app/components/ColorPalette/ColorPalette.jsx` (layout effect + listeners + icon a11y)
  - `src/app/components/ExportPanel/ExportPanel.jsx` (button + hidden input)
- If regressions appear:
  - Revert those files to the previous commit or selectively drop the listener blocks and restore the label-based upload.
  - If `useLayoutEffect` triggers warnings in non-DOM environments, fall back to `useEffect` with a guard.

**Confidence + Unresolved Unknowns**

- Confidence: 75% overall; UI-layer changes are low risk and well understood.
- Unknowns remain in engine-layer fixes (race conditions, WebGL restore, abort flows). These require targeted runtime testing and code inspection beyond the shown diff.
