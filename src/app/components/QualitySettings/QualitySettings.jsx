import { useState } from 'react'
import { useProjectStore } from '../../store/useProjectStore.js'
import { BTN } from '../../styles/buttonStyles.js'
import { InfoTooltip } from '../ui/InfoTooltip.jsx'
import { RENDERER_LABELS } from '../../../engine/renderers/index.js'
import { CHAR_RAMP_LABELS } from '../../../engine/renderers/AsciiRenderer.js'

function QualitySettings() {
  const pixelSize = useProjectStore((state) => state.pixelSize)
  const ditherType = useProjectStore((state) => state.ditherType)
  const invert = useProjectStore((state) => state.invert)
  const minBrightness = useProjectStore((state) => state.minBrightness)
  const renderMode = useProjectStore((state) => state.renderMode)
  const setRenderMode = useProjectStore((state) => state.setRenderMode)
  const charRamp = useProjectStore((state) => state.charRamp)
  const setCharRamp = useProjectStore((state) => state.setCharRamp)
  const asciiColored = useProjectStore((state) => state.asciiColored)
  const setAsciiColored = useProjectStore((state) => state.setAsciiColored)
  const halftoneDotShape = useProjectStore((state) => state.halftoneDotShape)
  const setHalftoneDotShape = useProjectStore((state) => state.setHalftoneDotShape)
  const halftoneAngle = useProjectStore((state) => state.halftoneAngle)
  const setHalftoneAngle = useProjectStore((state) => state.setHalftoneAngle)
  const ledGap = useProjectStore((state) => state.ledGap)
  const setLedGap = useProjectStore((state) => state.setLedGap)
  const ledShape = useProjectStore((state) => state.ledShape)
  const setLedShape = useProjectStore((state) => state.setLedShape)
  const backgroundColor = useProjectStore((state) => state.backgroundColor)
  const seed = useProjectStore((state) => state.seed)
  const setPixelSize = useProjectStore((state) => state.setPixelSize)
  const setDitherType = useProjectStore((state) => state.setDitherType)
  const setInvert = useProjectStore((state) => state.setInvert)
  const setMinBrightness = useProjectStore((state) => state.setMinBrightness)
  const setBackgroundColor = useProjectStore((state) => state.setBackgroundColor)
  const randomizeSeed = useProjectStore((state) => state.randomizeSeed)
  const setSeed = useProjectStore((state) => state.setSeed)

  const [advancedOpen, setAdvancedOpen] = useState(false)

  const isAscii = renderMode === 'ascii'
  const isHalftone = renderMode === 'halftone'
  const isLed = renderMode === 'ledMatrix'

  // Shared advanced controls (background, seed, invert, min brightness)
  const sharedAdvanced = (
    <>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} />
        Invert Brightness
        <InfoTooltip content="Swaps light and dark areas — bright areas become dark and vice versa." />
      </label>

      <label htmlFor="quality-min-brightness" className="flex items-center text-sm">
        Min Brightness: {minBrightness.toFixed(2)}
        <InfoTooltip content="Pixels below this luminance threshold are treated as fully dark and not drawn." />
      </label>
      <input
        id="quality-min-brightness"
        type="range"
        min="0.01"
        max="0.5"
        step="0.01"
        value={minBrightness}
        onChange={(event) => setMinBrightness(Number(event.target.value))}
        className="w-full"
      />

      <div className="flex items-center justify-between">
        <span className="flex items-center text-sm">
          Particle seed
          <InfoTooltip content="Controls the scatter pattern during fade animations. Different seeds = different visual patterns." />
        </span>
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs text-zinc-400">
            {seed === null ? 'auto' : `#${seed.toString(16).padStart(8, '0')}`}
          </span>
          <button
            type="button"
            onClick={randomizeSeed}
            className="rounded bg-zinc-700 px-2 py-0.5 text-xs hover:bg-zinc-600"
            title="Generate new random seed"
          >
            ↻
          </button>
          {seed !== null && (
            <button
              type="button"
              onClick={() => setSeed(null)}
              className="rounded bg-zinc-700 px-2 py-0.5 text-xs hover:bg-zinc-600"
              title="Reset to auto (deterministic hash)"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <label className="block text-sm">
        <span className="flex items-center">
          Background
          <InfoTooltip content="Canvas background color. Choose Transparent for PNG/GIF exports with alpha." />
        </span>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            className={`${BTN.base} ${BTN.secondary}`}
            onClick={() => setBackgroundColor('transparent')}
          >
            Transparent
          </button>
          <input
            type="color"
            value={backgroundColor === 'transparent' ? '#000000' : backgroundColor}
            onChange={(event) => setBackgroundColor(event.target.value)}
          />
        </div>
      </label>
    </>
  )

  return (
    <section className="space-y-3">
      <label className="block text-sm">
        <span className="flex items-center">
          Render Mode
          <InfoTooltip content="Bitmap: dithered pixel grid. Pixel Art: clean squares, no dithering. ASCII: characters mapped from brightness. Halftone: variable-size dots, like print halftone screens. LED Matrix: glowing rounded LEDs on a dark panel." />
        </span>
        <select
          className="mt-1 w-full rounded bg-zinc-800 p-1"
          value={renderMode}
          onChange={(e) => setRenderMode(e.target.value)}
        >
          {Object.entries(RENDERER_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {isLed ? (
        /* ── LED Matrix mode controls ────────────────────── */
        <>
          <label htmlFor="quality-led-spacing" className="flex items-center text-sm">
            LED Spacing: {pixelSize}px
            <InfoTooltip content="Grid cell size for each LED. Smaller = more LEDs (denser panel), larger = fewer LEDs (coarser panel)." />
          </label>
          <input
            id="quality-led-spacing"
            type="range"
            min="4"
            max="20"
            value={pixelSize}
            onChange={(event) => setPixelSize(Number(event.target.value))}
            className="w-full"
          />

          <label htmlFor="quality-led-gap" className="flex items-center text-sm">
            LED Gap: {ledGap}px
            <InfoTooltip content="Gap between each LED element. Larger gaps make individual LEDs more distinct." />
          </label>
          <input
            id="quality-led-gap"
            type="range"
            min="0"
            max="4"
            value={ledGap}
            onChange={(event) => setLedGap(Number(event.target.value))}
            className="w-full"
          />

          <label className="block text-sm">
            <span className="flex items-center">
              LED Shape
              <InfoTooltip content="Circle: classic round LED dots. Round Rect: slightly square LED elements, like modern sign boards." />
            </span>
            <select
              className="mt-1 w-full rounded bg-zinc-800 p-1"
              value={ledShape}
              onChange={(e) => setLedShape(e.target.value)}
            >
              <option value="circle">Circle</option>
              <option value="roundRect">Round Rect</option>
            </select>
          </label>

          <details
            className="rounded border border-zinc-700 p-2"
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
          >
            <summary className="cursor-pointer text-sm" aria-expanded={advancedOpen}>
              Advanced
            </summary>
            <div className="mt-2 space-y-3">{sharedAdvanced}</div>
          </details>
        </>
      ) : isHalftone ? (
        /* ── Halftone mode controls ──────────────────────── */
        <>
          <label htmlFor="quality-dot-spacing" className="flex items-center text-sm">
            Dot Spacing: {pixelSize}px
            <InfoTooltip content="Grid cell size for each dot. Smaller = more dots (finer screen), larger = fewer dots (coarser screen)." />
          </label>
          <input
            id="quality-dot-spacing"
            type="range"
            min="4"
            max="20"
            value={pixelSize}
            onChange={(event) => setPixelSize(Number(event.target.value))}
            className="w-full"
          />

          <label className="block text-sm">
            <span className="flex items-center">
              Dot Shape
              <InfoTooltip content="Circle: standard halftone screen dots. Diamond: rotated square dots, gives a different texture." />
            </span>
            <select
              className="mt-1 w-full rounded bg-zinc-800 p-1"
              value={halftoneDotShape}
              onChange={(e) => setHalftoneDotShape(e.target.value)}
            >
              <option value="circle">Circle</option>
              <option value="diamond">Diamond</option>
            </select>
          </label>

          <label htmlFor="quality-halftone-angle" className="flex items-center text-sm">
            Screen Angle: {halftoneAngle}°
            <InfoTooltip content="Rotates the dot grid. Classic print screens use 45° for black ink to reduce moiré patterns." />
          </label>
          <input
            id="quality-halftone-angle"
            type="range"
            min="0"
            max="179"
            value={halftoneAngle}
            onChange={(event) => setHalftoneAngle(Number(event.target.value))}
            className="w-full"
          />

          <details
            className="rounded border border-zinc-700 p-2"
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
          >
            <summary className="cursor-pointer text-sm" aria-expanded={advancedOpen}>
              Advanced
            </summary>
            <div className="mt-2 space-y-3">{sharedAdvanced}</div>
          </details>
        </>
      ) : isAscii ? (
        /* ── ASCII mode controls ─────────────────────────── */
        <>
          <label className="block text-sm">
            <span className="flex items-center">
              Character Ramp
              <InfoTooltip content="The set of characters used to represent brightness levels. Classic is the standard ASCII art ramp, Blocks uses Unicode fill chars, Dense has 70 levels, Minimal is high-contrast." />
            </span>
            <select
              className="mt-1 w-full rounded bg-zinc-800 p-1"
              value={charRamp}
              onChange={(e) => setCharRamp(e.target.value)}
            >
              {Object.entries(CHAR_RAMP_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={asciiColored} onChange={(e) => setAsciiColored(e.target.checked)} />
            Colored Mode
            <InfoTooltip content="When off, all characters use the brightest palette color (classic terminal look). When on, each character is tinted by its brightness zone using the full palette." />
          </label>

          <label htmlFor="quality-char-size" className="flex items-center text-sm">
            Character Size: {pixelSize}px
            <InfoTooltip content="Cell size for each character. Smaller = more characters, denser output. Larger = more readable individual chars. Keep above 8px for legible text." />
          </label>
          <input
            id="quality-char-size"
            type="range"
            min="8"
            max="32"
            value={pixelSize}
            onChange={(event) => setPixelSize(Number(event.target.value))}
            className="w-full"
          />

          <details
            className="rounded border border-zinc-700 p-2"
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
          >
            <summary className="cursor-pointer text-sm" aria-expanded={advancedOpen}>
              Advanced
            </summary>
            <div className="mt-2 space-y-3">{sharedAdvanced}</div>
          </details>
        </>
      ) : (
        /* ── Bitmap / Pixel Art mode controls ───────────── */
        <>
          <label htmlFor="quality-pixel-size" className="flex items-center text-sm">
            Pixel Size: {pixelSize}
            <InfoTooltip content="Grid resolution. Smaller = more detail, larger = blockier/more pixelated." />
          </label>
          <input
            id="quality-pixel-size"
            type="range"
            min="1"
            max="20"
            value={pixelSize}
            onChange={(event) => setPixelSize(Number(event.target.value))}
            className="w-full"
          />

          <details
            className="rounded border border-zinc-700 p-2"
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
          >
            <summary className="cursor-pointer text-sm" aria-expanded={advancedOpen}>
              Advanced
            </summary>
            <div className="mt-2 space-y-3">
              {renderMode === 'bitmap' && (
                <label className="block text-sm">
                  <span className="flex items-center">
                    Dither Type
                    <InfoTooltip content="Algorithm for shading. Bayer = ordered grid pattern. Variable Dot = halftone circles. Floyd-Steinberg / Atkinson = error-diffusion (smoother gradients, slower)." />
                  </span>
                  <select
                    className="mt-1 w-full rounded bg-zinc-800 p-1"
                    value={ditherType}
                    onChange={(event) => setDitherType(event.target.value)}
                  >
                    <option value="bayer4x4">Bayer 4×4</option>
                    <option value="bayer8x8">Bayer 8×8</option>
                    <option value="variableDot">Variable Dot</option>
                    <option value="floydSteinberg">Floyd-Steinberg</option>
                    <option value="atkinson">Atkinson</option>
                  </select>
                </label>
              )}
              {sharedAdvanced}
            </div>
          </details>
        </>
      )}
    </section>
  )
}

export { QualitySettings }
