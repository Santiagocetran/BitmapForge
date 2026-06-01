# Plan: Fix Mobile Viewport / Canvas Invisible Bug

**Status:** Ready to implement after the revisions below  
**Severity:** Critical — app is unusable on mobile  
**Files:** `src/app/components/Layout/Layout.jsx`, `src/app/styles.css`, mobile e2e coverage

---

## Problem Summary

On mobile (screens < 1024px / `lg` breakpoint), the preview canvas has **0px height** and is invisible. The user sees only the dark background and the hamburger FAB. Opening the sidebar shows all controls, but nothing renders in the preview area regardless of what settings are changed.

### Root cause

The CSS height chain is broken on mobile. The canvas resolves to 0px height because:

```text
main      → min-h-screen    ← constraint only, NOT a definite height
  section → min-h-screen    ← same problem
    div   → flex-1          ← flex-grow needs a definite parent height
      PreviewCanvas → h-full ← resolves to 0 (parent is 0)
```

The practical failure is the combination of `min-height` instead of `height`, percentage heights, and flex items missing `min-h-0`. `PreviewCanvas` uses `h-full`, so it needs a definite ancestor height.

On desktop this works because `lg:h-screen` gives `main` a definite `100vh` height, which cascades through the grid layout. Mobile never received the equivalent treatment.

There is also a root-level mobile viewport concern: `#root` currently uses `min-height: 100vh`, which can keep the document taller than the dynamic visible viewport on mobile browsers even after `main` is switched to `100dvh`.

---

## Fix Plan

### Step 1 — Give `main` a definite height on mobile (`Layout.jsx:97`)

**Current:**

```jsx
<main className="relative flex min-h-screen flex-col p-2 lg:grid lg:h-screen lg:gap-4 lg:overflow-hidden lg:p-4 lg:grid-cols-[340px_minmax(0,1fr)]">
```

**Change to:**

```jsx
<main className="relative flex h-dvh flex-col overflow-hidden p-2 lg:grid lg:h-screen lg:gap-4 lg:overflow-hidden lg:p-4 lg:grid-cols-[340px_minmax(0,1fr)]">
```

- `h-dvh` (dynamic viewport height = `100dvh`) replaces `min-h-screen`.
- `100dvh` adapts as mobile browser chrome (address bar) shows/hides and avoids the classic iOS Safari `100vh` overflow issue.
- `overflow-hidden` contains the layout; the fixed sidebar and hamburger FAB are unaffected because fixed elements ignore ancestor overflow.
- If older browser fallback is required, do not rely on the Tailwind class alone. Add an app-shell CSS class with `height: 100vh; height: 100dvh;` so unsupported browsers keep a definite height.

### Step 2 — Make `section` fill remaining height (`Layout.jsx:165`)

**Current:**

```jsx
<section className="flex min-h-screen flex-col gap-2 lg:order-2 lg:min-h-0">
```

**Change to:**

```jsx
<section className="flex flex-1 min-h-0 flex-col gap-2 lg:order-2">
```

- `flex-1` makes the section grow to fill `main`'s height.
- `min-h-0` overrides the browser default `min-height: auto` on flex items, allowing the section to shrink when needed.
- `min-h-screen` is removed because the section no longer needs its own height constraint once `main` has one.
- `lg:min-h-0` becomes redundant because `min-h-0` now applies at every breakpoint.

### Step 3 — Propagate `min-h-0` to the canvas wrapper (`Layout.jsx:210`)

**Current:**

```jsx
<div className="flex-1 lg:min-h-0">
```

**Change to:**

```jsx
<div className="flex-1 min-h-0">
```

- The `lg:` prefix meant `min-h-0` was only applied on desktop.
- On mobile, the div's default `min-height: auto` would prevent the canvas from resizing properly.
- This completes the height chain: `main (h-dvh)` → `section (flex-1 min-h-0)` → `div (flex-1 min-h-0)` → `PreviewCanvas (h-full)`.

### Step 4 — Align root viewport sizing (`styles.css:24`)

**Current:**

```css
#root {
  min-height: 100vh;
}
```

**Change to:**

```css
#root {
  min-height: 100vh;
  min-height: 100dvh;
}
```

If explicit fallback for `main` is desired, add an app-shell class instead of relying only on Tailwind's `h-dvh`:

```css
#root {
  min-height: 100vh;
  min-height: 100dvh;
}

.app-shell {
  height: 100vh;
  height: 100dvh;
}
```

Then use `app-shell` on `<main>` instead of `h-dvh`.

- This prevents `#root` from preserving old `100vh` behavior on mobile while `main` is trying to fit the dynamic viewport.
- Keep this scoped: do not globally set `body { overflow: hidden; }` unless testing confirms the whole app must be a locked shell in every state.

---

## Secondary Fixes (same session)

### Step 5 — iOS Safari body scroll lock (`Layout.jsx:80–85`)

**Current:**

```js
useEffect(() => {
  document.body.style.overflow = sidebarOpen ? 'hidden' : ''
  return () => {
    document.body.style.overflow = ''
  }
}, [sidebarOpen])
```

**Problem:** On iOS Safari, `overflow: hidden` on `body` combined with a `position: fixed` + `overflow-y: auto` sidebar can make controls inside the sidebar unresponsive to the first tap.

Do **not** use an effect that restores scroll position in an `else` branch by reading `document.body.style.top`. React runs the previous effect cleanup before the new effect body when `sidebarOpen` changes, so cleanup can clear `top` before the closing branch reads it. That causes a scroll jump to `0`.

**Change to a ref-based lock:**

```js
const bodyScrollYRef = useRef(0)

useEffect(() => {
  if (!sidebarOpen) return undefined

  bodyScrollYRef.current = window.scrollY
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${bodyScrollYRef.current}px`
  document.body.style.width = '100%'

  return () => {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, bodyScrollYRef.current)
  }
}, [sidebarOpen])
```

This is the standard iOS scroll-lock pattern. It prevents the iOS fixed-body interaction issue while preserving scroll position through React cleanup ordering.

Also update the React import:

```js
import { useState, useEffect, useRef } from 'react'
```

### Step 6 — Section collapse touch target size (`Layout.jsx:26`)

**Current:**

```jsx
className = 'rounded p-0.5 text-zinc-400 hover:text-zinc-200 lg:hidden'
```

**Minimum change:**

```jsx
className = 'rounded p-2 text-zinc-400 hover:text-zinc-200 lg:hidden'
```

- `p-0.5` = 2px padding → total tap target about 20px.
- `p-2` = 8px padding → total tap target about 32px.
- If strict 44px touch targets are required, use fixed dimensions instead:

```jsx
className = 'flex h-11 w-11 items-center justify-center rounded text-zinc-400 hover:text-zinc-200 lg:hidden'
```

---

## Testing Checklist

After implementing:

### Manual

- [ ] Open app on a real mobile device if available; Chrome DevTools mobile simulation is the fallback.
- [ ] Canvas area is visible on load and shows the "Upload a model" placeholder.
- [ ] Tap "Try demo model"; model loads and animates in the canvas.
- [ ] Switch to Shapes tab; shape renders immediately.
- [ ] Switch to Text tab; text renders immediately.
- [ ] Open sidebar; controls respond to first tap, especially on iOS Safari.
- [ ] Close sidebar via backdrop tap.
- [ ] Canvas remains visible and animating after sidebar closes.
- [ ] No content is cut off at the bottom when browser chrome is visible or hidden.
- [ ] Desktop layout is unchanged: side-by-side grid, no regression.

### Automated regression

Add a Playwright mobile viewport test. Recommended assertions:

- [ ] At a mobile viewport, the preview container bounding box has a nonzero height greater than a real threshold, such as `> 200px`.
- [ ] The "Upload a model" placeholder is visible on initial load.
- [ ] The rendered `canvas` element has nonzero `clientWidth` and `clientHeight`.
- [ ] Opening the settings drawer exposes controls and a representative control can be tapped.
- [ ] Closing the drawer leaves the preview container height nonzero.
- [ ] Add a desktop viewport assertion that the grid layout still has sidebar and preview side by side.

---

## Files Changed

| File                                   | Lines                           | Change                                                                                          |
| -------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/app/components/Layout/Layout.jsx` | 97                              | `min-h-screen` → `h-dvh overflow-hidden`, or app-shell class with `100vh`/`100dvh` fallback     |
| `src/app/components/Layout/Layout.jsx` | 165                             | `min-h-screen` → `flex-1 min-h-0`                                                               |
| `src/app/components/Layout/Layout.jsx` | 210                             | `lg:min-h-0` → `min-h-0`                                                                        |
| `src/app/styles.css`                   | 24                              | add `100dvh` root fallback after `100vh`                                                        |
| `src/app/components/Layout/Layout.jsx` | import + 80–85                  | add `useRef`; ref-based iOS scroll-lock pattern                                                 |
| `src/app/components/Layout/Layout.jsx` | 26                              | chevron `p-0.5` → `p-2`, or fixed 44px dimensions if strict touch target compliance is required |
| mobile e2e test                        | new or existing Playwright spec | assert mobile preview has nonzero height and drawer remains usable                              |
