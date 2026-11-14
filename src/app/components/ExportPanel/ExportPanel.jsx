import { useId, useRef } from 'react'
import { BTN } from '../../styles/buttonStyles.js'
import * as contracts from '../../utils/uiPropValidators.js'

const FORMAT_OPTIONS = [
  {
    value: 'apng',
    label: 'APNG',
    description:
      'Animated PNG. Full color, transparent background supported. Best for embedding in websites or sharing.'
  },
  {
    value: 'gif',
    label: 'GIF',
    description: 'Classic animated GIF. Universal compatibility. 256-color limit, no partial transparency.'
  },
  {
    value: 'webm',
    label: 'Video',
    description: 'MP4 (WebM fallback). Best quality for presentations or social media.'
  },
  {
    value: 'spritesheet',
    label: 'Sprite Sheet',
    description: 'PNG grid of all frames. For game engines (Phaser, Unity) or custom code.'
  },
  {
    value: 'css',
    label: 'CSS Anim',
    description: 'Pure CSS + sprite sheet. Drop into any website — no JavaScript needed.'
  },
  {
    value: 'react',
    label: 'React',
    description: 'React component with the live animation engine. Drop into any React/Vite project.'
  },
  {
    value: 'webcomponent',
    label: 'Web Comp',
    description: '<bitmap-animation> custom element. Works in any framework or plain HTML.'
  },
  { value: 'embed', label: 'Embed', description: 'Static site ready to deploy. Upload to any web host.' },
  {
    value: 'zip',
    label: 'Code ZIP',
    description: 'Full engine source code. For developers who want to build their own integration.'
  }
]

function ExportPanel({
  selectedFormat,
  onSelectFormat,
  exportSelected,
  cancelExport,
  saveProject,
  loadProject,
  exporting,
  disabledReason
}) {
  const descriptionId = useId()
  const inputRef = useRef(null)
  const selectedOption = FORMAT_OPTIONS.find((f) => f.value === selectedFormat)
  return (
    <section className="space-y-2">
      <div role="group" aria-label="Export format" className="grid grid-cols-3 gap-1">
        {FORMAT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={selectedFormat === value}
            aria-describedby={selectedFormat === value ? descriptionId : undefined}
            onClick={() => onSelectFormat(value)}
            className={`${BTN.base} px-1.5 py-1 focus-visible:ring-2 focus-visible:ring-emerald-300 ${selectedFormat === value ? 'bg-emerald-600 text-black' : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'}`}
          >
            {selectedFormat === value && <span aria-hidden="true">✓ </span>}
            {label}
          </button>
        ))}
      </div>
      <p id={descriptionId} className="text-xs text-zinc-400">
        {selectedOption?.description}
      </p>
      {disabledReason && <p className="text-xs text-amber-400">{disabledReason}</p>}
      <button
        type="button"
        disabled={exporting || Boolean(disabledReason)}
        onClick={exportSelected}
        className={`w-full ${BTN.base} ${BTN.primary} disabled:opacity-50`}
      >
        {exporting ? 'Exporting…' : `Export ${selectedOption?.label}`}
      </button>
      {exporting && (
        <button type="button" onClick={cancelExport} className={`${BTN.base} ${BTN.secondary}`}>
          Cancel export
        </button>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={`${BTN.base} ${BTN.secondary}`} onClick={saveProject}>
          Save .bitmapforge
        </button>
        <button type="button" className={`${BTN.base} ${BTN.secondary}`} onClick={() => inputRef.current?.click()}>
          Load .bitmapforge
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".bitmapforge"
          hidden
          aria-label="Load BitmapForge project file"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) loadProject(file)
          }}
        />
      </div>
    </section>
  )
}
ExportPanel.propTypes = {
  selectedFormat: contracts.exportFormat,
  onSelectFormat: contracts.requiredFunction,
  exportSelected: contracts.requiredFunction,
  cancelExport: contracts.cancelExport,
  saveProject: contracts.requiredFunction,
  loadProject: contracts.requiredFunction,
  exporting: contracts.optionalBoolean,
  disabledReason: contracts.optionalString
}
export { ExportPanel }
