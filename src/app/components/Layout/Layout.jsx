import { useMemo, useRef } from 'react'
import { ModelUploader } from '../ModelUploader/ModelUploader.jsx'
import { PreviewCanvas } from '../PreviewCanvas/PreviewCanvas.jsx'
import { ColorPalette } from '../ColorPalette/ColorPalette.jsx'
import { QualitySettings } from '../QualitySettings/QualitySettings.jsx'
import { AnimationControls } from '../AnimationControls/AnimationControls.jsx'
import { LightDirection } from '../LightDirection/LightDirection.jsx'
import { ExportPanel } from '../ExportPanel/ExportPanel.jsx'
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
  const sceneManagerRef = useRef(null)
  const model = useProjectStore((state) => state.model)
  const status = useProjectStore((state) => state.status)

  const hasError = useMemo(() => Boolean(status.error), [status.error])

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
        <Section title="Light Direction">
          <LightDirection />
        </Section>
        <Section title="Export & Project">
          <ExportPanel sceneManagerRef={sceneManagerRef} />
        </Section>
      </aside>

      <section className="order-1 flex min-h-[360px] flex-col gap-2 lg:order-2 lg:min-h-0">
        {status.message && (
          <div className="rounded bg-zinc-800 px-3 py-2 text-xs text-zinc-300">{status.message}</div>
        )}
        {hasError && (
          <div className="rounded bg-red-950 px-3 py-2 text-xs text-red-200">{status.error}</div>
        )}
        {status.loading && (
          <div className="rounded bg-emerald-900/40 px-3 py-2 text-xs text-emerald-200">Loading model...</div>
        )}
        <div className="h-[70vh] lg:flex-1 lg:min-h-0">
          <PreviewCanvas sceneManagerRef={sceneManagerRef} />
        </div>
      </section>
    </main>
  )
}

export { Layout }
