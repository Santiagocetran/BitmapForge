import * as contracts from '../../utils/uiPropValidators.js'
import { useState } from 'react'
import { useProjectStore } from '../../store/useProjectStore.js'
import { BTN } from '../../styles/buttonStyles.js'
import { pluginRegistry } from '../../../engine/plugins/PluginRegistry.js'
import { CHAR_RAMP_LABELS } from '../../../engine/renderers/AsciiRenderer.js'

function QualitySettings({
  part = 'all',
  advancedOpen: controlledAdvanced,
  onAdvancedOpenChange,
  postEffectsOpen: controlledPostEffects,
  onPostEffectsOpenChange
} = {}) {
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
  const stippleDotSize = useProjectStore((state) => state.stippleDotSize)
  const setStippleDotSize = useProjectStore((state) => state.setStippleDotSize)
  const stippleDensity = useProjectStore((state) => state.stippleDensity)
  const setStippleDensity = useProjectStore((state) => state.setStippleDensity)
  const crtEnabled = useProjectStore((state) => state.crtEnabled)
  const setCrtEnabled = useProjectStore((state) => state.setCrtEnabled)
  const scanlineGap = useProjectStore((state) => state.scanlineGap)
  const setScanlineGap = useProjectStore((state) => state.setScanlineGap)
  const scanlineOpacity = useProjectStore((state) => state.scanlineOpacity)
  const setScanlineOpacity = useProjectStore((state) => state.setScanlineOpacity)
  const chromaticAberration = useProjectStore((state) => state.chromaticAberration)
  const setChromaticAberration = useProjectStore((state) => state.setChromaticAberration)
  const crtVignette = useProjectStore((state) => state.crtVignette)
  const setCrtVignette = useProjectStore((state) => state.setCrtVignette)
  const noiseEnabled = useProjectStore((state) => state.noiseEnabled)
  const setNoiseEnabled = useProjectStore((state) => state.setNoiseEnabled)
  const noiseAmount = useProjectStore((state) => state.noiseAmount)
  const setNoiseAmount = useProjectStore((state) => state.setNoiseAmount)
  const noiseMonochrome = useProjectStore((state) => state.noiseMonochrome)
  const setNoiseMonochrome = useProjectStore((state) => state.setNoiseMonochrome)
  const colorShiftEnabled = useProjectStore((state) => state.colorShiftEnabled)
  const setColorShiftEnabled = useProjectStore((state) => state.setColorShiftEnabled)
  const colorShiftHue = useProjectStore((state) => state.colorShiftHue)
  const setColorShiftHue = useProjectStore((state) => state.setColorShiftHue)
  const colorShiftSaturation = useProjectStore((state) => state.colorShiftSaturation)
  const setColorShiftSaturation = useProjectStore((state) => state.setColorShiftSaturation)
  const backgroundColor = useProjectStore((state) => state.backgroundColor)
  const seed = useProjectStore((state) => state.seed)
  const setPixelSize = useProjectStore((state) => state.setPixelSize)
  const setDitherType = useProjectStore((state) => state.setDitherType)
  const setInvert = useProjectStore((state) => state.setInvert)
  const setMinBrightness = useProjectStore((state) => state.setMinBrightness)
  const setBackgroundColor = useProjectStore((state) => state.setBackgroundColor)
  const randomizeSeed = useProjectStore((state) => state.randomizeSeed)
  const setSeed = useProjectStore((state) => state.setSeed)

  const [localAdvanced, setLocalAdvanced] = useState(false)
  const advancedOpen = controlledAdvanced ?? localAdvanced
  const setAdvancedOpen = onAdvancedOpenChange ?? setLocalAdvanced

  const [localPostEffects, setLocalPostEffects] = useState(false)
  const postEffectsOpen = controlledPostEffects ?? localPostEffects
  const setPostEffectsOpen = onPostEffectsOpenChange ?? setLocalPostEffects
  const isAscii = renderMode === 'ascii'
  const isHalftone = renderMode === 'halftone'
  const isLed = renderMode === 'ledMatrix'
  const isStipple = renderMode === 'stipple'
  const sharedAdvanced = (
    <>
      <label className="bf-check-row">
        <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} />
        Invert Brightness
      </label>

      <label htmlFor="quality-min-brightness" className="bf-label">
        Min Brightness: {minBrightness.toFixed(2)}
      </label>
      <input
        id="quality-min-brightness"
        type="range"
        min="0.01"
        max="0.5"
        step="0.01"
        value={minBrightness}
        onChange={(event) => setMinBrightness(Number(event.target.value))}
        className="bf-range"
      />

      <div className="bf-group">
        <h4 className="bf-group-title">Fade pattern</h4>
        <p className="bf-help">Used by fade animation</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="bf-label">Particle seed</span>
          <div className="flex items-center gap-1">
            <span className="bf-value">{seed === null ? 'auto' : `#${seed.toString(16).padStart(8, '0')}`}</span>
            <button
              type="button"
              onClick={randomizeSeed}
              className={`${BTN.base} ${BTN.secondary}`}
              aria-label="Generate new random seed"
            >
              ↻
            </button>
            {seed !== null && (
              <button
                type="button"
                onClick={() => setSeed(null)}
                className={`${BTN.base} ${BTN.secondary}`}
                aria-label="Reset seed to auto"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="quality-background" className="bf-label">
          Background color
        </label>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            className="bf-choice shrink-0"
            aria-pressed={backgroundColor === 'transparent'}
            onClick={() => setBackgroundColor('transparent')}
          >
            {backgroundColor === 'transparent' && <span aria-hidden="true">✓ </span>}Transparent
          </button>
          <input
            id="quality-background"
            type="color"
            className="bf-field"
            aria-label="Background color"
            value={backgroundColor === 'transparent' ? '#000000' : backgroundColor}
            onChange={(event) => setBackgroundColor(event.target.value)}
          />
        </div>
      </div>
    </>
  )
  return (
    <section className="bf-control-group">
      {part !== 'refinements' && (
        <div className="bf-control-group">
          <h3 className="bf-group-title">Renderer</h3>
          <label className="bf-label">
            <span className="flex items-center">Render mode</span>
            <select className="bf-select" value={renderMode} onChange={(e) => setRenderMode(e.target.value)}>
              {pluginRegistry.listRenderers().map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {isLed ? (
            /* ── LED Matrix mode controls ────────────────────── */
            <>
              <label htmlFor="quality-led-spacing" className="bf-label">
                LED Spacing: {pixelSize}px
              </label>
              <input
                id="quality-led-spacing"
                type="range"
                min="4"
                max="20"
                value={pixelSize}
                onChange={(event) => setPixelSize(Number(event.target.value))}
                className="bf-range"
              />

              <label htmlFor="quality-led-gap" className="bf-label">
                LED Gap: {ledGap}px
              </label>
              <input
                id="quality-led-gap"
                type="range"
                min="0"
                max="4"
                value={ledGap}
                onChange={(event) => setLedGap(Number(event.target.value))}
                className="bf-range"
              />

              <label className="bf-label">
                <span className="flex items-center">LED Shape</span>
                <select className="bf-select" value={ledShape} onChange={(e) => setLedShape(e.target.value)}>
                  <option value="circle">Circle</option>
                  <option value="roundRect">Round Rect</option>
                </select>
              </label>
            </>
          ) : isHalftone ? (
            <>
              <label htmlFor="quality-dot-spacing" className="bf-label">
                Dot Spacing: {pixelSize}px
              </label>
              <input
                id="quality-dot-spacing"
                type="range"
                min="4"
                max="20"
                value={pixelSize}
                onChange={(event) => setPixelSize(Number(event.target.value))}
                className="bf-range"
              />

              <label className="bf-label">
                <span className="flex items-center">Dot Shape</span>
                <select
                  className="bf-select"
                  value={halftoneDotShape}
                  onChange={(e) => setHalftoneDotShape(e.target.value)}
                >
                  <option value="circle">Circle</option>
                  <option value="diamond">Diamond</option>
                </select>
              </label>

              <label htmlFor="quality-halftone-angle" className="bf-label">
                Screen Angle: {halftoneAngle}°
              </label>
              <input
                id="quality-halftone-angle"
                type="range"
                min="0"
                max="179"
                value={halftoneAngle}
                onChange={(event) => setHalftoneAngle(Number(event.target.value))}
                className="bf-range"
              />
            </>
          ) : isAscii ? (
            <>
              <label className="bf-label">
                <span className="flex items-center">Character Ramp</span>
                <select className="bf-select" value={charRamp} onChange={(e) => setCharRamp(e.target.value)}>
                  {Object.entries(CHAR_RAMP_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="bf-check-row">
                <input type="checkbox" checked={asciiColored} onChange={(e) => setAsciiColored(e.target.checked)} />
                Colored Mode
              </label>

              <label htmlFor="quality-char-size" className="bf-label">
                Character Size: {pixelSize}px
              </label>
              <input
                id="quality-char-size"
                type="range"
                min="8"
                max="32"
                value={pixelSize}
                onChange={(event) => setPixelSize(Number(event.target.value))}
                className="bf-range"
              />
            </>
          ) : isStipple ? (
            <>
              <label htmlFor="quality-stipple-spacing" className="bf-label">
                Cell Size: {pixelSize}px
              </label>
              <input
                id="quality-stipple-spacing"
                type="range"
                min="4"
                max="20"
                value={pixelSize}
                onChange={(event) => setPixelSize(Number(event.target.value))}
                className="bf-range"
              />

              <label htmlFor="quality-stipple-dot-size" className="bf-label">
                Dot Size: {stippleDotSize}px
              </label>
              <input
                id="quality-stipple-dot-size"
                type="range"
                min="1"
                max="6"
                value={stippleDotSize}
                onChange={(event) => setStippleDotSize(Number(event.target.value))}
                className="bf-range"
              />

              <label htmlFor="quality-stipple-density" className="bf-label">
                Dot Density: {stippleDensity}
              </label>
              <input
                id="quality-stipple-density"
                type="range"
                min="1"
                max="5"
                value={stippleDensity}
                onChange={(event) => setStippleDensity(Number(event.target.value))}
                className="bf-range"
              />
            </>
          ) : (
            <>
              <label htmlFor="quality-pixel-size" className="bf-label">
                Pixel Size: {pixelSize}
              </label>
              <input
                id="quality-pixel-size"
                type="range"
                min="1"
                max="20"
                value={pixelSize}
                onChange={(event) => setPixelSize(Number(event.target.value))}
                className="bf-range"
              />
              {renderMode === 'bitmap' && (
                <label className="bf-label">
                  <span className="flex items-center">Dither Type</span>
                  <select
                    className="bf-select"
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
            </>
          )}
        </div>
      )}
      {part !== 'renderer' && (
        <div>
          <details
            className="bf-disclosure"
            open={advancedOpen}
            onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}
          >
            <summary className="bf-disclosure-summary" aria-expanded={advancedOpen}>
              Tone &amp; background
            </summary>
            <div className="bf-control-group">{sharedAdvanced}</div>
          </details>
          <details
            className="bf-disclosure"
            open={postEffectsOpen}
            onToggle={(event) => setPostEffectsOpen(event.currentTarget.open)}
          >
            <summary className="bf-disclosure-summary" aria-expanded={postEffectsOpen}>
              Texture effects
            </summary>
            <div className="bf-control-group">
              <p className="bf-help">CRT, grain and color shift applied to every renderer.</p>
              <label className="bf-check-row">
                <input type="checkbox" checked={crtEnabled} onChange={(e) => setCrtEnabled(e.target.checked)} />
                CRT Effect
              </label>

              {crtEnabled && (
                <>
                  <label htmlFor="quality-scanline-gap" className="bf-label">
                    Scanline Gap: {scanlineGap}px
                  </label>
                  <input
                    id="quality-scanline-gap"
                    type="range"
                    min="2"
                    max="8"
                    value={scanlineGap}
                    onChange={(e) => setScanlineGap(Number(e.target.value))}
                    className="bf-range"
                  />

                  <label htmlFor="quality-scanline-opacity" className="bf-label">
                    Scanline Opacity: {scanlineOpacity.toFixed(1)}
                  </label>
                  <input
                    id="quality-scanline-opacity"
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={scanlineOpacity}
                    onChange={(e) => setScanlineOpacity(Number(e.target.value))}
                    className="bf-range"
                  />

                  <label htmlFor="quality-chroma" className="bf-label">
                    Chromatic Aberration: {chromaticAberration}px
                  </label>
                  <input
                    id="quality-chroma"
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={chromaticAberration}
                    onChange={(e) => setChromaticAberration(Number(e.target.value))}
                    className="bf-range"
                  />

                  <label htmlFor="quality-vignette" className="bf-label">
                    Vignette: {crtVignette.toFixed(1)}
                  </label>
                  <input
                    id="quality-vignette"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={crtVignette}
                    onChange={(e) => setCrtVignette(Number(e.target.value))}
                    className="bf-range"
                  />
                </>
              )}

              {/* ── Noise / Grain ── */}
              <label className="bf-check-row">
                <input type="checkbox" checked={noiseEnabled} onChange={(e) => setNoiseEnabled(e.target.checked)} />
                Noise / Grain
              </label>

              {noiseEnabled && (
                <>
                  <label htmlFor="quality-noise-amount" className="bf-label">
                    Amount: {noiseAmount.toFixed(2)}
                  </label>
                  <input
                    id="quality-noise-amount"
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.01"
                    value={noiseAmount}
                    onChange={(e) => setNoiseAmount(Number(e.target.value))}
                    className="bf-range"
                  />

                  <label className="bf-check-row">
                    <input
                      type="checkbox"
                      checked={noiseMonochrome}
                      onChange={(e) => setNoiseMonochrome(e.target.checked)}
                    />
                    Monochrome
                  </label>
                </>
              )}

              {/* ── Color Shift ── */}
              <label className="bf-check-row">
                <input
                  type="checkbox"
                  checked={colorShiftEnabled}
                  onChange={(e) => setColorShiftEnabled(e.target.checked)}
                />
                Color Shift
              </label>

              {colorShiftEnabled && (
                <>
                  <label htmlFor="quality-color-hue" className="bf-label">
                    Hue: {colorShiftHue}°
                  </label>
                  <input
                    id="quality-color-hue"
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={colorShiftHue}
                    onChange={(e) => setColorShiftHue(Number(e.target.value))}
                    className="bf-range"
                  />

                  <label htmlFor="quality-color-saturation" className="bf-label">
                    Saturation: {colorShiftSaturation.toFixed(2)}
                  </label>
                  <input
                    id="quality-color-saturation"
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={colorShiftSaturation}
                    onChange={(e) => setColorShiftSaturation(Number(e.target.value))}
                    className="bf-range"
                  />
                </>
              )}
            </div>
          </details>
        </div>
      )}
    </section>
  )
}
QualitySettings.propTypes = {
  part: contracts.qualityPart,
  advancedOpen: contracts.optionalBoolean,
  onAdvancedOpenChange: contracts.optionalFunction,
  postEffectsOpen: contracts.optionalBoolean,
  onPostEffectsOpenChange: contracts.optionalFunction
}
export { QualitySettings }
