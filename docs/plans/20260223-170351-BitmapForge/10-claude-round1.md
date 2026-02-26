Now I have all the source files. Let me compile my comprehensive review.

---

# Plan Review: BitmapForge App Layer Fixes (28 Findings)

## Per-Finding Verdicts

### Phase 1: Bugs + Critical UX (P1)

**Finding 1 — Async model load after unmount**

- Before snippet: **Matches** `PreviewCanvas.jsx:75-91` exactly
- Fix is correct — standard mounted-guard pattern
- Priority P1 / Effort XS: **Accurate**
- **APPROVED**

**Finding 2 — Race condition: stale manager**

- Same code block as #1, `sceneManagerRef.current === manager` guard is solid
- Subsumes Finding 1 — implement #2 and you get #1 for free
- Priority P1 / Effort S: **Accurate**
- **APPROVED** — combine with #1 as a single commit

**Finding 5 — No cancel/abort for exports**

- Source confirmed: no abort mechanism in `useExport.js`
- Risk note is honest: `gif.render()` is fire-and-forget. For video, `recorder.stop()` works. For sprite sheet, the abort in the loop is clean.
- Priority P1 / Effort M: **Accurate**
- **APPROVED** — but add: video export also needs `clearOnFrameRendered()` on abort (currently only in catch/success)

**Finding 6 — No progress indication**

- Source confirmed: only static strings "Encoding GIF..." / "Generating sprite sheet..."
- **NEEDS REVISION** — Plan proposes adding a `progress: 0` field to `DEFAULT_STATE.status` but the actual code snippet uses `message` string interpolation (`Encoding GIF... 72%`). These are contradictory. Pick one: either a dedicated `progress` number (cleaner for a progress bar UI) or message-embedded percentage (simpler). Recommend message-embedded for now, drop the `progress` field addition.
- Priority P1 / Effort S: Effort is **XS** if just using message strings

**Finding 7 — Vague error messages**

- All 5 cited catch blocks verified in source
- `friendlyExportError` helper is clean and the fallback preserves raw message
- Priority P1 / Effort S: **Accurate**
- **APPROVED**

**Finding 8 — No confirmation before destructive project load**

- `ExportPanel.jsx:38-49` matches exactly
- **NEEDS REVISION** — The guard checks `currentModel` only. If user has no model but changed colors/settings/pixel size, those are also lost on load. Should check for any deviation from defaults, e.g.: `const isDirty = currentModel || JSON.stringify(serializeState(state)) !== JSON.stringify(serializeState(DEFAULT_STATE))`. Alternatively, always confirm if the file input is used — simpler and safer.
- Priority P1 / Effort XS: Stays XS either way
- **NEEDS REVISION**

**Finding 9 — No loading spinner**

- Source confirmed: no overlay in PreviewCanvas, only text bar in Layout
- CSS-only spinner approach is correct and lightweight
- One issue: the plan shows `{!model && !isLoading && (` for the placeholder, but current source at line 96 is `{!model && (`. This means the placeholder would show during loading of the first model. The plan's fix is correct.
- Priority P1 / Effort S: **Accurate**
- **APPROVED**

**Finding 10 — No error boundary**

- No ErrorBoundary exists anywhere in the app. Correct finding.
- Standard React class component pattern. Lucide React (in tech stack) has icons — could use `AlertTriangle` instead of inline SVG in the boundary, but this is minor.
- Priority P1 / Effort S: **Accurate**
- **APPROVED**

**Finding 11 — No upfront model size validation for HTML export**

- `useExport.js:213-215` — confirmed: warning only, export proceeds
- Blocking is the right MVP call. The 2MB threshold is already established.
- Priority P1 / Effort XS: **Accurate**
- **APPROVED**

### Phase 2: Performance + Accessibility (P2)

**Finding 3 — Main thread blocking during frame rendering**

- Confirmed: `exportSpriteSheet` (lines 48-53) and `exportGif` (lines 88-93) are synchronous loops
- `yieldToMain` every 4 frames is a reasonable compromise
- **Note:** The `exportGif` loop already uses `withPausedScene` with async wrapper — the yielding integrates cleanly
- Priority P2 / Effort M: **Accurate**
- **APPROVED**

**Finding 4 — Overly broad store subscription**

- `PreviewCanvas.jsx:38-60` matches exactly — single subscription fires on every state change
- **NEEDS REVISION** — The plan proposes `subscribeWithSelector` middleware. In Zustand v5 (current), the selector-based `.subscribe(selector, listener, options)` is supported natively without middleware. Check your Zustand version in `package.json`. If v5+, skip the middleware addition entirely. If v4, the middleware is needed.
- Also: `shallow` import path is `zustand/shallow` in v4 but `zustand/react/shallow` exposes `useShallow` for hooks. For `.subscribe()`, use `import { shallow } from 'zustand/shallow'`.
- Priority P2 / Effort M: Effort is correct either way
- **NEEDS REVISION** (verify Zustand version first)

**Finding 12 — Color buttons missing aria-label**

- `ColorPalette.jsx:40-47` matches exactly
- `id` is available as prop — the template string is correct
- Priority P2 / Effort XS: **Accurate**
- **APPROVED**

**Finding 13 — Range inputs not labelled via htmlFor**

- AnimationControls: 3 ranges (speed, fade duration, show duration) — confirmed
- QualitySettings: the plan text says "3 range inputs" but only lists 2 IDs (`quality-pixel-size`, `quality-min-brightness`). Actual file has 2 ranges. **Minor text error** in plan but the actual IDs are correct.
- Priority P2 / Effort S: **Accurate**
- **APPROVED** (fix the "3" → "2" in plan text)

**Finding 14 — Status messages lack ARIA roles**

- `Layout.jsx:52-56` matches exactly
- `role="status"` and `role="alert"` are correct choices
- Priority P2 / Effort XS: **Accurate**
- **APPROVED**

**Finding 15 — details/summary missing aria-expanded**

- `QualitySettings.jsx:29-30` matches
- Plan correctly notes `useState` needs to be imported (currently not imported in this file)
- Priority P2 / Effort S: **Accurate**
- **APPROVED**

**Finding 16 — Hidden file input lacks description**

- `ModelUploader.jsx:44,82` and `ExportPanel.jsx:85` all confirmed as bare inputs
- Priority P2 / Effort XS: **Accurate**
- **APPROVED**

### Phase 3: State Improvements + Design Consistency (P3)

**Finding 17 — setStatus dep array in useAutoSave**

- `useAutoSave.js:25,39` matches exactly
- Using `useProjectStore.getState().setStatus()` inside the effect is correct
- Priority P3 / Effort XS: **Accurate**
- **APPROVED**

**Finding 18 — Module-level \_timer antipattern**

- `useAutoSave.js:44-56` matches exactly, including `useAutoSave._timer = null` at line 56
- `useRef` replacement is idiomatic and functionally identical
- Priority P3 / Effort S: **Accurate**
- **APPROVED**

**Finding 19 — Fragmented Zustand selectors in ColorPalette**

- `ColorPalette.jsx:74-78` matches exactly — 5 separate selectors
- `useShallow` is the correct Zustand v5 pattern (v4 uses `shallow` from `zustand/shallow`)
- Priority P3 / Effort XS: **Accurate**
- **APPROVED**

**Finding 20 — Unnecessary useMemo for trivial boolean**

- `Layout.jsx:24` matches exactly
- Correct — `Boolean()` is trivially cheap
- Priority P3 / Effort XS: **Accurate**
- **APPROVED**

**Finding 21 — getState captured inside hook**

- `useExport.js:28` matches exactly
- Module-level hoist or inline — either is fine
- Priority P3 / Effort XS: **Accurate**
- **APPROVED**

**Finding 22 — Button styling inconsistency**

- All cited line numbers verified against actual source. The inconsistency is real (mix of `bg-zinc-600`, `bg-zinc-700`, different hover states).
- Shared `BTN` constants is a reasonable approach. Consider Tailwind `@apply` in a utility layer as an alternative.
- Priority P3 / Effort S: **Accurate**
- **APPROVED**

**Finding 23 — Form input background inconsistency**

- `ExportPanel.jsx:83` uses `bg-zinc-700` while others use `bg-zinc-800` — confirmed
- Priority P3 / Effort XS: **Accurate**
- **APPROVED**

**Finding 24 — Fixed h-[70vh] breaks on mobile**

- `Layout.jsx:57` matches: `h-[70vh] lg:flex-1 lg:min-h-0`
- **Note:** The parent `<section>` at line 51 already has `min-h-[360px]`. Changing the child to `min-h-[360px] flex-1` is fine but slightly redundant with parent. The key fix is removing `h-[70vh]` — the parent's flex layout + child `flex-1` will handle sizing correctly.
- Priority P3 / Effort XS: **Accurate**
- **APPROVED**

**Finding 25 — Color picker popup overflow**

- `ColorPalette.jsx:49` matches exactly
- The flip approach is MVP-appropriate. A more robust solution would use Floating UI, but that's a new dependency.
- Priority P3 / Effort M: **Accurate**
- **APPROVED**

**Finding 26 — "Shadows → Highlights" label unclear**

- `ColorPalette.jsx:101-103` matches
- **NEEDS REVISION** — The info icon `ⓘ` is a Unicode character that renders inconsistently across platforms. Use a Lucide `Info` icon (already in tech stack) instead.
- Priority P3 / Effort XS: **Accurate**
- **NEEDS REVISION** (minor)

**Finding 27 — Error messages lack visual weight**

- `Layout.jsx:53` matches
- **NEEDS REVISION** — Inline SVG when Lucide React (`lucide-react`) is already a project dependency. Use `<AlertCircle />` from Lucide instead.
- Priority P3 / Effort S: **Accurate**
- **NEEDS REVISION**

**Finding 28 — No proactive large model warning**

- `ModelUploader.jsx:17-26` matches exactly
- Warning is non-blocking, threshold is reasonable
- Priority P3 / Effort XS: **Accurate**
- **APPROVED**

---

## Gaps Identified (Not in the Plan)

### Gap A — Unhandled throws before try/catch in useExport

`useExport.js` lines 34, 72, 115: `throw new Error('No preview canvas available')` executes **before** the `try` block. In `ExportPanel.jsx:35`, `await map[selectedFormat]?.()` has no try/catch wrapper. These throws will bubble up as unhandled promise rejections and crash the UI. **Severity: P1.**

### Gap B — `exportHtmlSnippet` never sets `exporting: true`

Every other export function sets `setStatus({ exporting: true, ... })` at the start, but `exportHtmlSnippet` (line 209) doesn't. The export button won't be disabled during HTML snippet generation, allowing double-clicks. **Severity: P2.**

### Gap C — Duplicate status display

`ExportPanel.jsx:89-92` renders `status.error` and `status.message` independently from `Layout.jsx:52-53`. Errors and messages show in two locations simultaneously. **Severity: P3.**

### Gap D — `status.message` and `status.error` can coexist

`setStatus` merges partially (`{ ...get().status, ...partialStatus }`). If you set `{ error: 'fail' }` and then `{ message: 'ok' }` without clearing error, both show. The plan touches this area (Findings 14, 27) but never addresses the semantic overlap. **Severity: P3.**

---

## Verdict Summary

| #   | Finding                  | Verdict                                 |
| --- | ------------------------ | --------------------------------------- |
| 1   | Async unmount guard      | APPROVED                                |
| 2   | Stale manager race       | APPROVED                                |
| 3   | Main thread blocking     | APPROVED                                |
| 4   | Broad store subscription | NEEDS REVISION (check Zustand version)  |
| 5   | No export cancel         | APPROVED                                |
| 6   | No export progress       | NEEDS REVISION (contradictory approach) |
| 7   | Vague error messages     | APPROVED                                |
| 8   | No load confirmation     | NEEDS REVISION (guard too narrow)       |
| 9   | No loading spinner       | APPROVED                                |
| 10  | No error boundary        | APPROVED                                |
| 11  | HTML export size guard   | APPROVED                                |
| 12  | Color button aria-label  | APPROVED                                |
| 13  | Range input labels       | APPROVED                                |
| 14  | Status ARIA roles        | APPROVED                                |
| 15  | details/summary aria     | APPROVED                                |
| 16  | Hidden input description | APPROVED                                |
| 17  | setStatus dep array      | APPROVED                                |
| 18  | Module-level \_timer     | APPROVED                                |
| 19  | Fragmented selectors     | APPROVED                                |
| 20  | Unnecessary useMemo      | APPROVED                                |
| 21  | getState alias           | APPROVED                                |
| 22  | Button styling           | APPROVED                                |
| 23  | Form input bg            | APPROVED                                |
| 24  | h-[70vh] on mobile       | APPROVED                                |
| 25  | Popup overflow           | APPROVED                                |
| 26  | Shadows/Highlights label | NEEDS REVISION (use Lucide icon)        |
| 27  | Error visual weight      | NEEDS REVISION (use Lucide icon)        |
| 28  | Large model warning      | APPROVED                                |

**Score: 23 APPROVED, 5 NEEDS REVISION, 0 DISPUTED**

---

## Prioritized Top-10 Fix List

| Rank | Finding(s)      | Why                                                          | Files                                     |
| ---- | --------------- | ------------------------------------------------------------ | ----------------------------------------- |
| 1    | **Gap A** (new) | Unhandled throws = UI crashes on missing canvas              | `useExport.js`, `ExportPanel.jsx`         |
| 2    | **#1 + #2**     | Async bugs that cause React state-update-on-unmount warnings | `PreviewCanvas.jsx`                       |
| 3    | **#9**          | Loading spinner — most visible UX gap                        | `PreviewCanvas.jsx`                       |
| 4    | **#5 + #6**     | Export cancel + progress — long exports block the user       | `useExport.js`                            |
| 5    | **#7**          | Friendly error messages — low effort, high user impact       | `useExport.js`                            |
| 6    | **#10**         | Error boundary — prevents full-app crash                     | New `ErrorBoundary.jsx`, `Layout.jsx`     |
| 7    | **#8**          | Load confirmation — prevents data loss                       | `ExportPanel.jsx`                         |
| 8    | **#11 + Gap B** | HTML export guards — size block + missing exporting flag     | `useExport.js`                            |
| 9    | **#4**          | Store subscription split — perf win for real-time preview    | `PreviewCanvas.jsx`, `useProjectStore.js` |
| 10   | **#14 + #27**   | ARIA roles + error styling — a11y foundation                 | `Layout.jsx`                              |

---

## Recommended Implementation Order

1. **Batch 1 — Critical bugs** (1 PR): Findings #1+#2, Gap A, Gap B
2. **Batch 2 — Export UX** (1 PR): Findings #5+#6+#7+#11
3. **Batch 3 — UI polish** (1 PR): Findings #8+#9+#10
4. **Batch 4 — Performance** (1 PR): Findings #3+#4 (verify Zustand version first)
5. **Batch 5 — Accessibility** (1 PR): Findings #12+#13+#14+#15+#16+#27
6. **Batch 6 — Cleanup** (1 PR): Findings #17-#28 remaining

This order ensures: bugs before UX, UX before perf, perf before cosmetics. Each batch is independently shippable and testable.

---

## Overall Recommendation

**The plan is solid and well-researched.** 23 of 28 findings are fully validated against source with accurate line numbers, correct before/after snippets, and realistic effort estimates. The 5 revisions are minor. The 4 gaps I identified (especially Gap A — unhandled throws) should be folded into Phase 1 before implementation begins. The dependency/ordering notes at the bottom of the plan are correct and should be followed. Ship it in 6 batches as outlined above.
