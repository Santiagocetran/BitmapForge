**Findings (highest → lowest severity)**

- Critical: Incorrect Zustand import/usage in `ColorPalette.jsx`. You imported `useShallow` from `zustand/shallow` and passed it as the selector. Zustand exports `shallow` comparator; correct usage is `useStore(selector, shallow)`. Current code will throw at runtime and/or break memoization.
- High: Static ids for range inputs in `AnimationControls.jsx` (`anim-speed`, etc.). If the component renders more than once (e.g., preview panes, storybook), duplicate IDs break label binding and a11y.
- Medium: File upload control in `ExportPanel.jsx` uses a styled `<label>` as a button. It’s not keyboard-activatable (no role/tabIndex/keypress), so it’s not fully accessible. Prefer a real `<button>` that programmatically clicks a hidden file input.
- Medium: Color picker overflow flip runs only on open. Resizing the window after opening can cause newly created overflow that doesn’t reflow. Should recompute on `resize`.
- Low: Tooltip “ⓘ” in `ColorPalette.jsx` uses `title` only. Screen readers may miss it; consider adding `aria-label` or `aria-describedby`.
- Low: Ensure `BTN.base` encapsulates prior button typography/spacing (e.g., `text-xs`). If not, visual regressions can occur on replaced buttons.

**Plan**

- Fix Zustand shallow selector usage in `ColorPalette.jsx`.
- Add resize handler for color picker overflow flip.
- Replace upload `<label>` with `<button>` + hidden input in `ExportPanel.jsx`.
- Use `useId()` to generate unique IDs for `AnimationControls.jsx` ranges.
- Minor a11y: add accessible name to the “ⓘ” info icon.
- Quick style check: confirm `BTN.base` parity with old classes.

**Patch-ready edits**

- src/app/components/ColorPalette/ColorPalette.jsx
  - Change shallow comparator import and usage; add resize recompute; add a11y label on info icon.
  - Diff:
    ```diff
    --- a/src/app/components/ColorPalette/ColorPalette.jsx
    +++ b/src/app/components/ColorPalette/ColorPalette.jsx
    @@
    -import { useState, useRef, useEffect } from 'react'
    -import { useShallow } from 'zustand/shallow'
    +import { useState, useRef, useEffect } from 'react'
    +import { shallow } from 'zustand/shallow'
    @@
    -  const [flipSide, setFlipSide] = useState(false)
    +  const [flipSide, setFlipSide] = useState(false)
    @@
    -  useEffect(() => {
    +  useEffect(() => {
         if (!isOpen || !popupRef.current) return
         const rect = popupRef.current.getBoundingClientRect()
         setFlipSide(rect.right > window.innerWidth - 8)
       }, [isOpen])
    +
    +  useEffect(() => {
    +    if (!isOpen) return
    +    function onResize() {
    +      if (!popupRef.current) return
    +      const rect = popupRef.current.getBoundingClientRect()
    +      setFlipSide(rect.right > window.innerWidth - 8)
    +    }
    +    window.addEventListener('resize', onResize)
    +    return () => window.removeEventListener('resize', onResize)
    +  }, [isOpen])
    @@
    -  const { colors, setColors, addColor, removeColor, setColorAt } = useProjectStore(
    -    useShallow((state) => ({
    -      colors: state.colors,
    -      setColors: state.setColors,
    -      addColor: state.addColor,
    -      removeColor: state.removeColor,
    -      setColorAt: state.setColorAt
    -    }))
    -  )
    +  const { colors, setColors, addColor, removeColor, setColorAt } = useProjectStore(
    +    (state) => ({
    +      colors: state.colors,
    +      setColors: state.setColors,
    +      addColor: state.addColor,
    +      removeColor: state.removeColor,
    +      setColorAt: state.setColorAt
    +    }),
    +    shallow
    +  )
    @@
    -        <span className="flex items-center gap-1">
    -          Bright (highlights)
    -          <span title="Colors are mapped by brightness: leftmost = darkest areas, rightmost = brightest areas. Drag to reorder.">
    -            ⓘ
    -          </span>
    -        </span>
    +        <span className="flex items-center gap-1">
    +          Bright (highlights)
    +          <span
    +            role="img"
    +            aria-label="Palette ordering info"
    +            title="Colors are mapped by brightness: leftmost = darkest areas, rightmost = brightest areas. Drag to reorder."
    +          >
    +            ⓘ
    +          </span>
    +        </span>
    ```
- src/app/components/ExportPanel/ExportPanel.jsx
  - Use a real button to trigger a visually hidden input; make it keyboard/a11y friendly.
  - Diff:
    ```diff
    --- a/src/app/components/ExportPanel/ExportPanel.jsx
    +++ b/src/app/components/ExportPanel/ExportPanel.jsx
    @@
    -import { BTN } from '../../styles/buttonStyles.js'
    +import { BTN } from '../../styles/buttonStyles.js'
    +import { useRef } from 'react'
    @@
    -function ExportPanel() {
    +function ExportPanel() {
    +  const fileInputRef = useRef(null)
    @@
    -      <div className="grid grid-cols-2 gap-2">
    -        <button type="button" className={`${BTN.base} ${BTN.secondary}`} onClick={() => saveProject()}>
    +      <input
    +        ref={fileInputRef}
    +        type="file"
    +        accept=".bitmapforge"
    +        className="sr-only"
    +        onChange={onLoadProject}
    +      />
    +      <div className="grid grid-cols-2 gap-2">
    +        <button type="button" className={`${BTN.base} ${BTN.secondary}`} onClick={() => saveProject()}>
               Save .bitmapforge
             </button>
    -        <label className={`${BTN.base} bg-zinc-800 px-2 py-1 text-center text-zinc-200 cursor-pointer hover:bg-zinc-700`}>
    -          Load .bitmapforge
    -          {/* Finding 16: aria-label for hidden file input */}
    -          <input
    -            type="file"
    -            accept=".bitmapforge"
    -            className="hidden"
    -            onChange={onLoadProject}
    -            aria-label="Load BitmapForge project file"
    -          />
    -        </label>
    +        <button
    +          type="button"
    +          className={`${BTN.base} bg-zinc-800 px-2 py-1 text-center text-zinc-200 hover:bg-zinc-700`}
    +          onClick={() => fileInputRef.current?.click()}
    +          aria-label="Load BitmapForge project file"
    +        >
    +          Load .bitmapforge
    +        </button>
           </div>
    ```
- src/app/components/AnimationControls/AnimationControls.jsx
  - Generate unique IDs with `useId()` to avoid collisions.
  - Diff:
    ```diff
    --- a/src/app/components/AnimationControls/AnimationControls.jsx
    +++ b/src/app/components/AnimationControls/AnimationControls.jsx
    @@
    -function AnimationControls() {
    +import { useId } from 'react'
    +function AnimationControls() {
    +  const speedId = useId()
    +  const fadeDurationId = useId()
    +  const showDurationId = useId()
    @@
    -      <label htmlFor="anim-speed" className="block text-sm">
    +      <label htmlFor={speedId} className="block text-sm">
             Speed: {animationSpeed.toFixed(2)} rad/s
    ```
-      </label>
-      <input
-        id="anim-speed"

*      </label>
*      <input
*        id={speedId}
         type="range"
  @@

-          <label htmlFor="anim-fade-duration" className="block text-sm">

*          <label htmlFor={fadeDurationId} className="block text-sm">
             Fade duration: {animationDuration}ms

-          </label>
-          <input
-            id="anim-fade-duration"

*          </label>
*          <input
*            id={fadeDurationId}
             type="range"
  @@

-          <label htmlFor="anim-show-duration" className="block text-sm">

*          <label htmlFor={showDurationId} className="block text-sm">
             Show duration: {showPhaseDuration}ms

-          </label>
-          <input
-            id="anim-show-duration"

*          </label>
*          <input
*            id={showDurationId}
             type="range"
  ```

  ```

**Verification commands**

- Search/fix shallow usage elsewhere: `rg "useShallow|from 'zustand/shallow'|, shallow\(" src/`
- Type check (if any) and lint: `pnpm -s lint`
- Run tests: `pnpm -s test`
- Build: `pnpm -s build`
- Manual a11y check:
  - Keyboard focus on “Load .bitmapforge” button (Space/Enter opens file dialog).
  - Resize window with color picker open; verify popup flips away from overflow.
  - Screen reader reads range labels correctly; no duplicate IDs in DOM.

**Alternative approach (+ tradeoff)**

- Introduce small reusable `FormField` and `FileButton` components that encapsulate `useId()`, label association, and a11y keyboard handling. This centralizes patterns and reduces future regressions. Tradeoff: small upfront refactor time and touch points across multiple files.

**Confidence + unknowns**

- Confidence: High on Zustand bug and a11y improvements; Medium on unique ID necessity (depends on single-instance usage).
- Unknowns: Whether `BTN.base` already includes prior text sizing; how `ErrorBoundary` is actually applied in `Layout.jsx`; other modified files not shown.

**Rationale**

- The edits address one clear runtime bug (Zustand shallow), shore up a11y gaps, and harden UI behavior on resize with minimal surface area, preserving the intent of the recent improvements while reducing regression risk.
