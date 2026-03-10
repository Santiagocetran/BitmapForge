**Findings**

- Critical: Transparency handling in `beginFrame` should respect transparent backgrounds. Forcing `#000` when `backgroundColor === 'transparent'` breaks composition use-cases and diverges from typical canvas semantics. Preferred: clear with `clearRect` when transparent; fill otherwise. Also ensure `globalAlpha` reset after fills.
- High: Character sizing should derive from grid cell height, not `pixelSize`. Use `fontSize = cellH` (clamped to a sane min like 6–8) and a monospace font. `pixelSize` tunes square renderers and doesn’t necessarily match text metrics. Without this, text will misalign or clip across aspect ratios and DPI.
- High: Glyph alignment and metrics must be handled explicitly. Set `textBaseline = 'top'`, `textAlign = 'left'`, and compute `cellW = canvas.width / gridW`, `cellH = canvas.height / gridH`. Optionally pre-measure a representative glyph once per frame to center horizontally (common monospace width ≈ 0.6 × fontSize).
- Medium: `updateOptions` timing is fine if options only affect future frames. Ensure `AsciiRenderer.updateOptions` caches derived values (ramp string, ramp length, invert flag, font string) and marks a dirty flag so the next `render()` recomputes font and metrics once.
- Medium: `drawPixel` for fade animations must snap to the ASCII grid to avoid jitter. Use the same `cellW/cellH` grid math and draw one glyph per cell; skip duplicate draws within a frame (optional micro-cache Set of `cellKey = yCell*gridW + xCell`).
- Medium: Brightness→glyph mapping must handle invert and clamping. Ramps are ordered by ink density ascending; default mapping should be `idx = invert ? (n-1 - Math.round(b*(n-1))) : Math.round(b*(n-1))`, with `b` clamped to [minBrightness, 1].
- Low: Performance risks from `ctx.fillText` per cell per frame. Mitigate by caching `ctx.font`, `fillStyle`, and a precomputed `rampChars[]`. Longer term, consider a glyph atlas (see Alternative).
- Low: Undo history — adding `charRamp`/`asciiColored` to the `partialize` filter is correct and expected, but consider grouping rapid toggles (debounce) if the store currently records each change instantly.

**Plan**

- Add `AsciiRenderer` with transparent-aware `beginFrame`, grid-aware `render/drawPixel`.
- Wire `ascii` into renderer registry and dynamic import sources.
- Extend store: `charRamp`, `asciiColored`, setters, undo filter.
- Subscribe options in `PreviewCanvas` slice to propagate via `updateOptions`.
- Add UI controls in `QualitySettings` gated by `renderMode === 'ascii'`.
- Smoke test DPI, invert, colored, and undo interactions.

**Patch-ready edits**

- src/engine/renderers/AsciiRenderer.js
  - New file skeleton:
    - Imports: `BaseRenderer` from the same folder.
    - Constants:
      - `CHAR_RAMPS = { classic: ' .:-=+*#%@', blocks: ' ░▒▓█', dense: ' .\'\`^",:;Il!i><~+\_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao\*#MW&8%B@$', minimal: ' .+#' }`
      - `MONOSPACE_FALLBACK = 'Menlo, Monaco, Consolas, monospace'`
    - Class:
      - `constructor(options)`:
        - Defaults: `{ charRamp: 'classic', asciiColored: false, pixelSize: 8, minBrightness: 0, invert: false, backgroundColor: 'transparent' }`
        - Store `ctx`, canvas refs from `BaseRenderer` pattern used by other renderers.
        - Internal cache: `this._rampStr`, `this._rampChars`, `this._rampLen`, `this._fontSize`, `this._fontStr`, `this._cellW`, `this._cellH`, `this._metrics`, `this._dirty = true`.
      - `updateOptions(opts)`:
        - Merge, if `charRamp`, `invert`, `asciiColored`, `pixelSize`, or `backgroundColor` change → set `this._dirty = true`.
      - `setSize(w, h)`:
        - Call `super.setSize(w, h)`; set `_dirty = true`.
      - `beginFrame(backgroundColor)`:
        - Resolve `bg = backgroundColor ?? this.options.backgroundColor`.
        - If `bg === 'transparent'`:
          - `ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.restore();`
        - Else:
          - `ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();`
      - `#prepare(gridW, gridH)`:
        - Compute `cellW = canvas.width / gridW`, `cellH = canvas.height / gridH`.
        - `fontSize = Math.max(6, Math.floor(cellH))`.
        - `fontStr = `${fontSize}px ${MONOSPACE_FALLBACK}``.
        - Set `ctx.font = fontStr; ctx.textBaseline = 'top'; ctx.textAlign = 'left';`
        - `rampStr = CHAR_RAMPS[this.options.charRamp] || CHAR_RAMPS.classic`
        - Cache `rampChars = Array.from(rampStr)`, `rampLen = rampChars.length`.
        - Optionally `metrics = ctx.measureText('M')` for horizontal centering: `xOffset = Math.max(0, (cellW - metrics.width) * 0.5)`. Cache `xOffset`.
        - Save to fields and clear `_dirty`.
      - `#glyphFor(brightness)`:
        - `b = Math.min(1, Math.max(this.options.minBrightness, brightness))`
        - `idx = this.options.invert ? (this._rampLen - 1 - Math.round(b*(this._rampLen-1))) : Math.round(b*(this._rampLen-1))`
        - `ch = this._rampChars[idx]`
        - Return `ch === ' ' ? null : ch`
      - `render(imageData, gridW, gridH, getColor)`:
        - If `_dirty` → `#prepare(gridW, gridH)`.
        - Local refs: `cellW`, `cellH`, `xOffset`, `ctx`.
        - Cache `ctx.font` once per frame; do not set per glyph.
        - Iterate `gy 0→gridH-1`, `gx 0→gridW-1`:
          - `i = (gy*gridW + gx) * 4`
          - Luma/brightness: if upstream provides brightness, use it; else compute simple luma `b = (0.2126*r + 0.7152*g + 0.0722*b)/255`.
          - `ch = #glyphFor(b)`; if null continue.
          - `fill = options.asciiColored ? getColor(b) : getColor(1)`
          - `ctx.fillStyle = fill` only when changed (track lastFill).
          - `ctx.fillText(ch, gx*cellW + xOffset, gy*cellH)`
      - `drawPixel(x, y, brightness, color, alpha)`:
        - If `_dirty` return (or recompute with last known grid).
        - Compute `gx = Math.floor(x / this._cellW)`, `gy = Math.floor(y / this._cellH)`
        - Deduplicate per-frame optionally via `this._drawnCells` set that is cleared at `beginFrame`.
        - `ch = #glyphFor(brightness)`; if null return.
        - `ctx.save(); if (alpha != null) ctx.globalAlpha = alpha; ctx.fillStyle = this.options.asciiColored ? color : this._lastBrightest || color; ctx.fillText(ch, gx*this._cellW + this._xOffset, gy*this._cellH); ctx.restore();`

- src/engine/renderers/index.js
  - Import and register:
    - `import AsciiRenderer from './AsciiRenderer.js'`
    - Add to `RENDERERS`: `{ ascii: AsciiRenderer, ...existing }`
    - Add to `RENDERER_LABELS`: `{ ascii: 'ASCII', ... }`

- src/app/store/useProjectStore.js
  - DEFAULT_STATE additions:
    - `charRamp: 'classic',`
    - `asciiColored: false,`
  - Setters:
    - `setCharRamp: (charRamp) => set({ charRamp }, false, 'setCharRamp'),`
    - `setAsciiColored: (asciiColored) => set({ asciiColored }, false, 'setAsciiColored'),`
  - Undo partialize (if using `partialize` filter):
    - Include `charRamp` and `asciiColored` so they are undoable.

- src/app/components/PreviewCanvas/PreviewCanvas.jsx
  - In the subscription slice that feeds `manager.updateEffectOptions(slice)` add:
    - `charRamp: state.charRamp,`
    - `asciiColored: state.asciiColored,`

- src/app/components/QualitySettings/QualitySettings.jsx
  - Conditionally render when `renderMode === 'ascii'`:
    - Char ramp select: options `classic`, `blocks`, `dense`, `minimal`; onChange → `setCharRamp`.
    - Colored toggle: `asciiColored`; onChange → `setAsciiColored`.

- src/app/utils/engineSources.js
  - Add dynamic import:
    - `AsciiRenderer: () => import('../engine/renderers/AsciiRenderer.js'),`
  - Add to exported `ENGINE_SOURCES` mapping so code-splitting includes it.

**Verification commands**

- Dev run and smoke checks
  - `npm run dev`
  - In the app: switch `renderMode` to ASCII, toggle Colored on/off, change ramp, confirm:
    - Transparent background respected when project background is Transparent.
    - Glyphs align to grid cells with various resolutions and DPR (resize window).
    - Undo/redo includes ramp and colored toggles.
- Lint/build
  - `npm run lint`
  - `npm run build`
- Quick rendering sanity (optional, in devtools)
  - Toggle `invert` and ensure space glyphs skip drawing (background shows through).
  - Enable an animation with fades and verify no cell flicker (snapped grid).

**Risks/edge cases and likely regressions**

- Performance on large grids: `fillText` per cell can be slow on low-end devices; the dense ramp exacerbates it. Mitigation: clamp maximum grid size for ASCII mode or warn in UI; ensure font/paint state set once per frame.
- DPI scaling/blur: If the base engine scales canvas for DPR, ensure ASCII uses the scaled internal size, not CSS size. Misuse can cause blurry text.
- Fade animation overlap: Multiple `drawPixel` calls targeting the same cell can overdraw and darken; mitigate with per-frame dedupe set.
- Color consistency: Using `getColor(1)` for monochrome assumes brightest palette entry reads well on the chosen background; may need a dedicated monochrome color option later.
- Space glyph metrics: Some fonts render leading/trailing spacing inconsistently; since we skip spaces, ensure the chosen ramp’s first char is a true space for “classic/minimal”.
- Undo noise: Rapid scrubbing of char ramp might spam history if not debounced; if that’s an issue today, batch updates or debounce UI handlers.

**One alternative approach (higher upside, higher risk)**

- GPU-accelerated glyph atlas renderer:
  - Pre-bake the ramp into a monochrome SDF atlas once per font size.
  - In WebGL/WebGPU, render instanced quads per cell with a shader sampling the atlas and tinting per-cell with `getColor(brightness)`.
  - Upside: 10–100× throughput on large grids, smooth scaling, crisp glyphs at any DPI, cheap per-cell alpha for fades.
  - Risk: Significant complexity (GL context management, atlas generation, shaders), larger bundle, duplicate code paths with existing canvas renderers.

**Confidence + unknowns**

- Confidence: Medium-high for renderer/API integration and option propagation.
- Unknowns:
  - Exact `BaseRenderer` helpers (e.g., where `ctx`/canvas are sourced, DPR handling).
  - Store’s current undo `partialize` implementation details.
  - Whether other renderers already special-case transparent backgrounds (assumed yes).

**Short rationale**

This design keeps ASCII rendering consistent with existing grid-based renderers, preserves composition by honoring transparency, aligns glyphs with explicit grid metrics, and minimizes per-frame overhead via caching. It integrates cleanly into the current options/update flow and leaves room for a future GPU path if needed.
