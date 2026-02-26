# Audit of BitmapForge Diff (Visible Portion)

## Findings (by severity)

### 1. **Medium — `useShallow` import path may be wrong**

`ColorPalette.jsx:5` imports from `zustand/shallow`. In Zustand v4, the correct path is `zustand/react/shallow`. In Zustand v5 it's `zustand/shallow`. Since the build passes (93 modules), the import likely matches your installed version — but if you ever upgrade/downgrade Zustand, this will silently break. **Verify your `package.json` Zustand version.**

### 2. **Low — Overflow detection flickers on first frame**

`ColorPalette.jsx` SortableColor uses `useEffect` to measure popup position, but `useEffect` fires _after_ paint. On the first render the popup appears at `left-0`, then potentially jumps to `right-0` one frame later. **Fix: use `useLayoutEffect`** to measure before the browser paints.

### 3. **Low — No resize/scroll listener for flip logic**

The `flipSide` state is computed once when `isOpen` changes. If the user resizes the window or scrolls while the color picker is open, the popup can overflow the viewport. Not critical since color pickers are usually short-lived.

### 4. **Nitpick — `useMemo` removal from Layout.jsx**

Line 1 removes `import { useMemo }`. Since I can't see the full file, **verify `useMemo` isn't used elsewhere in Layout.jsx**. The build passing suggests this is safe, but worth a manual check.

### 5. **Nitpick — Confirm dialog UX**

`ExportPanel.jsx:44` uses `window.confirm()` which is synchronous and visually inconsistent with the rest of the UI. Works correctly but looks out of place in a polished app. Not a regression — just a future improvement candidate.

### 6. **Good patterns confirmed**

- `htmlFor`/`id` pairing in AnimationControls is correct and clean.
- `useShallow` selector grouping eliminates unnecessary re-renders — correct pattern.
- `aria-label` on color buttons and file input — proper accessibility.
- `event.target.value = ''` after confirm cancel — correct file input reset.
- `useProjectStore.getState()` outside React render — correct Zustand pattern.
- BTN constants for style consistency — good DRY approach.

## Plan (max 6 bullets)

1. Switch `useEffect` → `useLayoutEffect` in SortableColor overflow detection
2. Verify Zustand version matches `zustand/shallow` import path
3. Confirm `useMemo` is unused in rest of Layout.jsx
4. **Review the remaining ~70% of the diff** (engine files, useExport abort logic, SceneManager WebGL context loss, ErrorBoundary, PreviewCanvas, useAutoSave) — these contain the highest-risk changes (race conditions, memory leaks, WebGL) and aren't visible in the preview
5. Spot-check BTN style constants file for completeness
6. Manual test: open color picker on rightmost color, resize window, confirm no overflow

## Patch-Ready Edits

**`src/app/components/ColorPalette/ColorPalette.jsx`** — fix layout flash:

```diff
- import { useState, useRef, useEffect } from 'react'
+ import { useState, useRef, useEffect, useLayoutEffect } from 'react'
```

```diff
-  useEffect(() => {
+  useLayoutEffect(() => {
     if (!isOpen || !popupRef.current) return
     const rect = popupRef.current.getBoundingClientRect()
     setFlipSide(rect.right > window.innerWidth - 8)
   }, [isOpen])
```

## Verification Commands

```bash
# Check Zustand version
grep '"zustand"' package.json

# Confirm useMemo not used in Layout
grep 'useMemo' src/app/components/Layout/Layout.jsx

# Build + test (already passing per context)
npm run build && npm test

# Full diff review for remaining files
git diff -- src/engine/ src/app/hooks/ src/app/store/ src/app/components/PreviewCanvas/ src/app/components/ErrorBoundary/
```

## High-Upside Alternative

**Replace `window.confirm()` with a lightweight modal component** (e.g., Radix `AlertDialog` — already in your deps). Tradeoff: ~30 more lines of code, but gives consistent styling, non-blocking UX, and accessibility (focus trap, ESC to cancel) for free.

## Confidence & Unknowns

**Confidence: 65%** — The visible ~30% of the diff looks solid with only minor issues. However, the highest-risk changes (WebGL context loss recovery, export abort/progress, race condition fixes in SceneManager, memory leak fixes in BaseEffect, color LUT in BitmapEffect) are **not visible** in the diff preview. These engine-layer changes carry the most regression risk and I cannot assess them from the provided context.

**Key unknowns:**

- Full ErrorBoundary implementation (reset behavior, what it wraps)
- useExport abort controller lifecycle (cleanup on unmount?)
- SceneManager WebGL context loss/restore handler correctness
- BitmapEffect color LUT invalidation logic
- AnimationEngine main-thread yielding implementation
- Whether `BTN` constants cover all button variants used across the app

## Rationale

The visible UI-layer changes follow correct React patterns and improve accessibility meaningfully. The two actionable fixes (`useLayoutEffect` for flash prevention, Zustand import path verification) are low-effort, zero-risk improvements. The real audit value lies in reviewing the engine files — that's where the race conditions, memory leaks, and WebGL fixes live, and where regressions would be hardest to detect visually.
