import { useState } from 'react'
import { useStore } from 'zustand'
import { Undo2, Redo2, ChevronDown } from 'lucide-react'
import { InputSource } from '../InputSource/InputSource.jsx'
import { PreviewCanvas } from '../PreviewCanvas/PreviewCanvas.jsx'
import { ColorPalette } from '../ColorPalette/ColorPalette.jsx'
import { QualitySettings } from '../QualitySettings/QualitySettings.jsx'
import { AnimationControls } from '../AnimationControls/AnimationControls.jsx'
import { LightDirection } from '../LightDirection/LightDirection.jsx'
import { RotationGizmoPanel } from '../RotationGizmo/RotationGizmoPanel.jsx'
import { ExportPanel } from '../ExportPanel/ExportPanel.jsx'
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary.jsx'
import { PresetGallery } from '../PresetGallery/PresetGallery.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="rounded-lg border border-zinc-700 bg-zinc-900">
      <div className="flex items-center justify-between p-3">
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        {/* Chevron only visible below lg — desktop sections are always open */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded p-0.5 text-zinc-400 hover:text-zinc-200 lg:hidden"
          aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          aria-expanded={open}
        >
          <ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {/* hidden on mobile when closed; lg:block always shows on desktop */}
      <div className={`px-3 pb-3 ${open ? 'block' : 'hidden lg:block'}`}>{children}</div>
    </section>
  )
}

function UndoRedoBar() {
  const { undo, redo, pastStates, futureStates } = useStore(useProjectStore.temporal)
  return (
    <div className="flex items-center gap-1 px-1">
      <button
        type="button"
        onClick={undo}
        disabled={pastStates.length === 0}
        title="Undo (Ctrl+Z)"
        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Undo2 size={14} />
      </button>
      <button
        type="button"
        onClick={redo}
        disabled={futureStates.length === 0}
        title="Redo (Ctrl+Shift+Z)"
        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Redo2 size={14} />
      </button>
      <span className="ml-auto text-xs text-zinc-600">
        {pastStates.length > 0 ? `${pastStates.length} step${pastStates.length > 1 ? 's' : ''}` : ''}
      </span>
    </div>
  )
}

function Layout() {
  const status = useProjectStore((state) => state.status)

  const hasError = Boolean(status.error) // Finding 20: remove useMemo

  return (
    <main className="grid min-h-screen grid-cols-1 gap-3 p-2 lg:h-screen lg:gap-4 lg:overflow-hidden lg:p-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="order-2 flex max-h-[calc(100vh-2rem)] flex-col gap-3 overflow-y-auto lg:order-1 lg:max-h-full">
        <UndoRedoBar />
        <Section title="Input">
          <InputSource />
        </Section>
        <Section title="Presets">
          <PresetGallery />
        </Section>
        <Section title="Color Strip">
          <ColorPalette />
        </Section>
        <Section title="Quality">
          <QualitySettings />
        </Section>
        <Section title="Animation">
          <AnimationControls />
        </Section>
        <Section title="Rotation Offset" defaultOpen={false}>
          <RotationGizmoPanel />
        </Section>
        <Section title="Light Direction" defaultOpen={false}>
          <LightDirection />
        </Section>
        {/* Finding 10: wrap ExportPanel in ErrorBoundary */}
        <Section title="Export & Project">
          <ErrorBoundary>
            <ExportPanel />
          </ErrorBoundary>
        </Section>
      </aside>

      <section className="order-1 flex min-h-[300px] flex-col gap-2 sm:min-h-[360px] lg:order-2 lg:min-h-0">
        {/* Finding 14: ARIA roles on status messages */}
        {status.message && (
          <div role="status" className="rounded bg-zinc-800 px-3 py-2 text-xs text-zinc-300">
            {status.message}
          </div>
        )}
        {/* Findings 14+27: role="alert" + enhanced error styling */}
        {hasError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-xs text-red-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0 text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{status.error}</span>
          </div>
        )}
        {status.loading && (
          <div
            role="status"
            aria-live="polite"
            className="rounded bg-emerald-900/40 px-3 py-2 text-xs text-emerald-200"
          >
            Loading model...
          </div>
        )}
        {/* Finding 24: replace fixed h-[70vh] with min-h-[360px] flex-1 */}
        <div className="min-h-[360px] flex-1 lg:min-h-0">
          <PreviewCanvas />
        </div>
      </section>
    </main>
  )
}

export { Layout }
