import { ModelUploader } from '../ModelUploader/ModelUploader.jsx'
import { PreviewCanvas } from '../PreviewCanvas/PreviewCanvas.jsx'
import { ColorPalette } from '../ColorPalette/ColorPalette.jsx'
import { QualitySettings } from '../QualitySettings/QualitySettings.jsx'
import { AnimationControls } from '../AnimationControls/AnimationControls.jsx'
import { LightDirection } from '../LightDirection/LightDirection.jsx'
import { RotationGizmoPanel } from '../RotationGizmo/RotationGizmoPanel.jsx'
import { ExportPanel } from '../ExportPanel/ExportPanel.jsx'
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'

function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
      <h3 className="mb-2 text-sm font-semibold text-zinc-100">{title}</h3>
      {children}
    </section>
  )
}

function Layout() {
  const model = useProjectStore((state) => state.model)
  const status = useProjectStore((state) => state.status)

  const hasError = Boolean(status.error) // Finding 20: remove useMemo

  return (
    <main className="grid min-h-screen grid-cols-1 gap-4 p-4 lg:h-screen lg:overflow-hidden lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="order-2 flex max-h-[calc(100vh-2rem)] flex-col gap-3 overflow-y-auto lg:order-1 lg:max-h-full">
        <Section title={model ? 'Replace Model' : 'Upload Model'}>
          <div className="flex min-h-[260px] w-full flex-col items-center justify-center">
            <ModelUploader compact={Boolean(model)} />
          </div>
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
        <Section title="Rotation Offset">
          <RotationGizmoPanel />
        </Section>
        <Section title="Light Direction">
          <LightDirection />
        </Section>
        {/* Finding 10: wrap ExportPanel in ErrorBoundary */}
        <Section title="Export & Project">
          <ErrorBoundary>
            <ExportPanel />
          </ErrorBoundary>
        </Section>
      </aside>

      <section className="order-1 flex min-h-[360px] flex-col gap-2 lg:order-2 lg:min-h-0">
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
