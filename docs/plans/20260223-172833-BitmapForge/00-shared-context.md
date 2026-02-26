# IA Bridge Shared Context

- Timestamp: 2026-02-23T17:28:33-03:00
- Working root: /home/santi/sideprojects/BitmapForge
- Mode (auto): code
- Branch: main
- Commit: 08f773238cdc
- Worktree: dirty
- Task: Final audit of all code changes in the BitmapForge codebase. The working tree has modifications to 15 files across src/engine/ and src/app/, plus 2 new files (ErrorBoundary component and buttonStyles constants). Changes implement 40 findings from a comprehensive codebase review covering: bug fixes (race conditions, memory leaks, WebGL context loss), performance improvements (color LUT, fillStyle batching, main-thread yielding), UX improvements (export abort/progress, error messages, loading spinners, error boundaries), accessibility (ARIA labels, roles, htmlFor connections), and design consistency (button styles, input backgrounds, responsive layout). Build passes (93 modules), all 27 tests pass. Review the diff for: correctness of each fix, any regressions introduced, proper React patterns, consistent code style, and any missed edge cases.
- Constraints: none
- Claude model: opus
- Codex model: gpt-5
- Timeout per round (s): 240

## Fairness Rules

1. Both agents receive the exact same task, constraints, and working context.
2. Both agents use the same evidence packet.
3. Both agents are asked for the same output shape.
4. Cross-critiques are symmetric (each critiques the other's proposal).
5. Final synthesis cites agreement, disagreements, and residual risks.

## Recent Commits

08f7732 Merge pull request #5 from Santiagocetran/chore/repo-organization
8f07443 chore: reorganize repo structure
0e381a7 Merge pull request #4 from Santiagocetran/ci/tooling-and-tests
a22c1b7 chore: add Vitest, CI workflow, husky, and contributor docs
cc99fea chore: format baseline — ESLint + Prettier on entire codebase
d5aad93 Merge pull request #3 from Santiagocetran/refactor/modularity-and-docs
865d30c Close modularity gap: import ANIMATION_EFFECT_KEYS from effectTypes.js
618fb43 Modularity refactor: SceneManager context, shared effect types, cleanup
2a3957b Merge pull request #2 from Santiagocetran/logo-and-video
90b3aeb logo size reduced

## Diff Preview

diff --git a/src/app/components/AnimationControls/AnimationControls.jsx b/src/app/components/AnimationControls/AnimationControls.jsx
index f8c541b..5361b6a 100644
--- a/src/app/components/AnimationControls/AnimationControls.jsx
+++ b/src/app/components/AnimationControls/AnimationControls.jsx
@@ -46,45 +46,49 @@ function AnimationControls() {
</div>
</div>

-      <label className="block text-sm">

*      {/* Finding 13: explicit id/htmlFor for range inputs */}
*      <label htmlFor="anim-speed" className="block text-sm">
         Speed: {animationSpeed.toFixed(2)} rad/s

-        <input
-          type="range"
-          min="0.05"
-          max="2"
-          step="0.01"
-          value={animationSpeed}
-          onChange={(e) => setAnimationSpeed(Number(e.target.value))}
-          className="w-full"
-        />
       </label>

*      <input
*        id="anim-speed"
*        type="range"
*        min="0.05"
*        max="2"
*        step="0.01"
*        value={animationSpeed}
*        onChange={(e) => setAnimationSpeed(Number(e.target.value))}
*        className="w-full"
*      />

       {useFadeInOut && (
         <div className="space-y-2 border-t border-zinc-700 pt-2">

-          <label className="block text-sm">

*          <label htmlFor="anim-fade-duration" className="block text-sm">
             Fade duration: {animationDuration}ms

-            <input
-              type="range"
-              min="300"
-              max="8000"
-              step="100"
-              value={animationDuration}
-              onChange={(e) => setAnimationDuration(Number(e.target.value))}
-              className="w-full"
-            />
           </label>
-          <label className="block text-sm">

*          <input
*            id="anim-fade-duration"
*            type="range"
*            min="300"
*            max="8000"
*            step="100"
*            value={animationDuration}
*            onChange={(e) => setAnimationDuration(Number(e.target.value))}
*            className="w-full"
*          />
*          <label htmlFor="anim-show-duration" className="block text-sm">
             Show duration: {showPhaseDuration}ms

-            <input
-              type="range"
-              min="1000"
-              max="40000"
-              step="500"
-              value={showPhaseDuration}
-              onChange={(e) => setShowPhaseDuration(Number(e.target.value))}
-              className="w-full"
-            />
           </label>

*          <input
*            id="anim-show-duration"
*            type="range"
*            min="1000"
*            max="40000"
*            step="500"
*            value={showPhaseDuration}
*            onChange={(e) => setShowPhaseDuration(Number(e.target.value))}
*            className="w-full"
*          />
           </div>
         )}
       </section>
  diff --git a/src/app/components/ColorPalette/ColorPalette.jsx b/src/app/components/ColorPalette/ColorPalette.jsx
  index 0250d3c..fe7d033 100644
  --- a/src/app/components/ColorPalette/ColorPalette.jsx
  +++ b/src/app/components/ColorPalette/ColorPalette.jsx
  @@ -3,7 +3,9 @@ import { SortableContext, useSortable, horizontalListSortingStrategy, arrayMove
  import { CSS } from '@dnd-kit/utilities'
  import { HexColorPicker } from 'react-colorful'
  import { useState, useRef, useEffect } from 'react'
  +import { useShallow } from 'zustand/shallow'
  import { useProjectStore } from '../../store/useProjectStore.js'
  +import { BTN } from '../../styles/buttonStyles.js'

function SortableColor({ color, id, isOpen, onOpen, onClose, onColorChange }) {
const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
@@ -13,6 +15,15 @@ function SortableColor({ color, id, isOpen, onOpen, onClose, onColorChange }) {
transition
}

- // Finding 25: overflow detection — flip popup to right-aligned if it would overflow viewport
- const [flipSide, setFlipSide] = useState(false)
-
- useEffect(() => {
- if (!isOpen || !popupRef.current) return
- const rect = popupRef.current.getBoundingClientRect()
- setFlipSide(rect.right > window.innerWidth - 8)
- }, [isOpen])
- // Close when clicking outside the popup
  useEffect(() => {
  if (!isOpen) return
  @@ -37,6 +48,7 @@ function SortableColor({ color, id, isOpen, onOpen, onClose, onColorChange }) {
  return (
  <div ref={setNodeRef} style={style} className="relative">
-      {/* Finding 12: aria-label for accessibility */}
         <button
           type="button"
           {...attributes}
  @@ -44,9 +56,15 @@ function SortableColor({ color, id, isOpen, onOpen, onClose, onColorChange }) {
  className="h-10 w-12 rounded border border-zinc-500"
  style={{ backgroundColor: color }}
  onDoubleClick={() => (isOpen ? onClose() : onOpen())}
-        aria-label={`Color ${id.replace('color-', '')}: ${color}. Double-click to edit.`}
       />
       {isOpen && (

*        <div ref={popupRef} className="absolute left-0 z-20 mt-2 rounded border border-zinc-600 bg-zinc-900 p-2">

-        <div
-          ref={popupRef}
-          className={`absolute z-20 mt-2 rounded border border-zinc-600 bg-zinc-900 p-2 ${
-            flipSide ? 'right-0' : 'left-0'
-          }`}
-        >
             <div className="mb-1 flex items-center justify-between">
               <span className="text-xs text-zinc-400">Edit color</span>
               <button
  @@ -71,11 +89,16 @@ function SortableColor({ color, id, isOpen, onOpen, onClose, onColorChange }) {
  }

function ColorPalette() {

- const colors = useProjectStore((state) => state.colors)
- const setColors = useProjectStore((state) => state.setColors)
- const addColor = useProjectStore((state) => state.addColor)
- const removeColor = useProjectStore((state) => state.removeColor)
- const setColorAt = useProjectStore((state) => state.setColorAt)

* // Finding 19: combine selectors with useShallow
* const { colors, setColors, addColor, removeColor, setColorAt } = useProjectStore(
* useShallow((state) => ({
*      colors: state.colors,
*      setColors: state.setColors,
*      addColor: state.addColor,
*      removeColor: state.removeColor,
*      setColorAt: state.setColorAt
* }))
* )

  const [openPickerId, setOpenPickerId] = useState(null)

@@ -98,9 +121,15 @@ function ColorPalette() {

return (
<section className="space-y-2">

-      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400">
-        <span>Shadows</span>
-        <span>Highlights</span>

*      {/* Finding 26: clearer label with tooltip */}
*      <div className="flex items-center justify-between text-xs tracking-wide text-zinc-400">
*        <span>Dark (shadows)</span>
*        <span className="flex items-center gap-1">
*          Bright (highlights)
*          <span title="Colors are mapped by brightness: leftmost = darkest areas, rightmost = brightest areas. Drag to reorder.">
*            ⓘ
*          </span>
*        </span>
         </div>

         <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>

  @@ -121,10 +150,11 @@ function ColorPalette() {
  </SortableContext>
  </DndContext>

*      {/* Finding 22: standardized button styles */}
       <div className="flex gap-2">
         <button
           type="button"

-          className="rounded bg-zinc-700 px-2 py-1 text-xs"

*          className={`${BTN.base} ${BTN.secondary}`}
             onClick={() => addColor()}
             disabled={colors.length >= 6}
           >
  @@ -132,7 +162,7 @@ function ColorPalette() {
  </button>
  <button
  type="button"

-          className="rounded bg-zinc-700 px-2 py-1 text-xs"

*          className={`${BTN.base} ${BTN.secondary}`}
             onClick={() => removeColor(colors.length - 1)}
             disabled={colors.length <= 2}
           >
  @@ -145,7 +175,7 @@ function ColorPalette() {
  <button
  key={name}
  type="button"

-            className="rounded border border-zinc-600 px-2 py-1 text-xs"

*            className={`${BTN.base} ${BTN.ghost}`}
               onClick={() => setColors(value)}
             >
               {name}
  diff --git a/src/app/components/ExportPanel/ExportPanel.jsx b/src/app/components/ExportPanel/ExportPanel.jsx
  index 6d2faec..bee7f71 100644
  --- a/src/app/components/ExportPanel/ExportPanel.jsx
  +++ b/src/app/components/ExportPanel/ExportPanel.jsx
  @@ -3,6 +3,7 @@ import { useExport } from '../../hooks/useExport.js'
  import { useProjectStore } from '../../store/useProjectStore.js'
  import { useSceneManager } from '../../context/SceneManagerContext.jsx'
  import { loadProjectFile } from '../../utils/projectFile.js'
  +import { BTN } from '../../styles/buttonStyles.js'

const FORMAT_OPTIONS = [
{ value: 'gif', label: 'GIF' },
@@ -35,9 +36,15 @@ function ExportPanel() {
await map[selectedFormat]?.()
}

- // Finding 8: confirm before destructive project load
  async function onLoadProject(event) {
  const file = event.target.files?.[0]
  if (!file) return
- const currentModel = useProjectStore.getState().model
- if (currentModel && !window.confirm('Loading a project will replace your current settings and model. Continue?')) {
-      event.target.value = ''
-      return
- }
  try {
  const { settings, modelFile } = await loadProjectFile(file)
  useProjectStore.setState((state) => ({ ...state, ...settings }))
  @@ -56,8 +63,8 @@ function ExportPanel() {
  key={value}
  type="button"
  onClick={() => setSelectedFormat(value)}

*            className={`rounded px-2 py-1 text-xs ${
*              selectedFormat === value ? 'bg-emerald-600 text-black' : 'bg-zinc-700 text-zinc-200'

-            className={`${BTN.base} px-2 py-1 ${
-              selectedFormat === value ? 'bg-emerald-600 text-black' : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
               }`}
             >
               {label}
  @@ -69,7 +76,7 @@ function ExportPanel() {
  type="button"
  disabled={status.exporting}
  onClick={onExport}

*        className="w-full rounded bg-emerald-500 px-2 py-1.5 text-xs font-semibold text-black disabled:opacity-50"

-        className={`w-full ${BTN.base} ${BTN.primary} disabled:opacity-50`}
         >
           {status.exporting
             ? status.message || 'Exporting…'
  @@ -77,12 +84,19 @@ function ExportPanel() {
  </button>
         <div className="grid grid-cols-2 gap-2">

*        <button type="button" className="rounded bg-zinc-600 px-2 py-1 text-xs" onClick={() => saveProject()}>

-        <button type="button" className={`${BTN.base} ${BTN.secondary}`} onClick={() => saveProject()}>
           Save .bitmapforge
         </button>

*        <label className="rounded bg-zinc-700 px-2 py-1 text-center text-xs cursor-pointer">

-        <label className={`${BTN.base} bg-zinc-800 px-2 py-1 text-center text-zinc-200 cursor-pointer hover:bg-zinc-700`}>
           Load .bitmapforge

*          <input type="file" accept=".bitmapforge" className="hidden" onChange={onLoadProject} />

-          {/* Finding 16: aria-label for hidden file input */}
-          <input
-            type="file"
-            accept=".bitmapforge"
-            className="hidden"
-            onChange={onLoadProject}
-            aria-label="Load BitmapForge project file"
-          />
         </label>
       </div>

diff --git a/src/app/components/Layout/Layout.jsx b/src/app/components/Layout/Layout.jsx
index 5d599e8..aeab6dd 100644
--- a/src/app/components/Layout/Layout.jsx
+++ b/src/app/components/Layout/Layout.jsx
@@ -1,4 +1,3 @@
-import { useMemo } from 'react'
import { ModelUploader } from '../ModelUploader/ModelUploader.jsx'
import { PreviewCanvas } from '../PreviewCanvas/PreviewCanvas.jsx'
import { ColorPalette } from '../ColorPalette/ColorPalette.jsx'
@@ -6,6 +5,7 @@ import { QualitySettings } from '../QualitySettings/QualitySettings.jsx'
import { AnimationControls } from '../AnimationControls/AnimationControls.jsx'
import { LightDirection } from '../LightDirection/LightDirection.jsx'
import { ExportPanel } from '../ExportPanel/ExportPanel.jsx'
+import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'

function Section({ title, children }) {
@@ -21,7 +21,7 @@ function Layout() {
