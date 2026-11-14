import { useState, useEffect, useLayoutEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from 'zustand'
import * as Dialog from '@radix-ui/react-dialog'
import { Undo2, Redo2, ChevronDown } from 'lucide-react'
import { useExportController } from '../../hooks/useExportController.js'
import { StatusNotice } from '../ui/StatusNotice.jsx'
import { InputSource } from '../InputSource/InputSource.jsx'
import { PreviewCanvas } from '../PreviewCanvas/PreviewCanvas.jsx'
import { ColorPalette } from '../ColorPalette/ColorPalette.jsx'
import { QualitySettings } from '../QualitySettings/QualitySettings.jsx'
import { AnimationControls } from '../AnimationControls/AnimationControls.jsx'
import { LightDirection } from '../LightDirection/LightDirection.jsx'
import { RotationGizmoPanel } from '../RotationGizmo/RotationGizmoPanel.jsx'
import { ExportPanel } from '../ExportPanel/ExportPanel.jsx'
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'
import * as contracts from '../../utils/uiPropValidators.js'

function Section({ title, open, onToggle, children, headingRef }) {
  const id = useId()
  return (
    <section className="rounded-lg border border-zinc-700 bg-zinc-900">
      <h3>
        <button
          ref={headingRef}
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex min-h-11 w-full items-center justify-between rounded p-3 text-left text-sm font-semibold focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          {title}
          <ChevronDown size={16} aria-hidden="true" className={open ? 'rotate-180' : ''} />
        </button>
      </h3>
      <div id={id} hidden={!open} className="px-3 pb-3">
        {children}
      </div>
    </section>
  )
}
Section.propTypes = {
  title: contracts.requiredString,
  open: contracts.requiredBoolean,
  onToggle: contracts.requiredFunction,
  children: contracts.renderableChildren,
  headingRef: contracts.headingRef
}
function UndoRedoBar() {
  const { undo, redo, pastStates, futureStates } = useStore(useProjectStore.temporal)
  return (
    <div className="flex items-center gap-1 px-1">
      <button
        type="button"
        onClick={() => {
          if (pastStates.length > 0) undo()
        }}
        disabled={pastStates.length === 0}
        title="Undo (Ctrl+Z)"
        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Undo2 size={14} />
      </button>
      <button
        type="button"
        onClick={() => {
          if (futureStates.length > 0) redo()
        }}
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

function Layout({ bridgeRef, helpOpen = false }) {
  const controller = useExportController()
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [sections, setSections] = useState({
    Input: true,
    'Color Palette': true,
    Look: true,
    Animation: true,
    'Rotation Offset': false,
    'Light Direction': false,
    'Export & Project': true
  })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [presetDraft, setPresetDraft] = useState('')
  const [presetSaveOpen, setPresetSaveOpen] = useState(false)
  const [portalContainer, setPortalContainer] = useState(null)
  const [noticeNode] = useState(() => document.createElement('div'))
  const backgroundRef = useRef(null)
  const previewNoticeRef = useRef(null)
  const drawerNoticeRef = useRef(null)
  const desktopSettingsRef = useRef(null)
  const drawerSettingsRef = useRef(null)
  const paletteRef = useRef(null)
  const closeRef = useRef(null)
  const openRef = useRef(null)
  const exportAccessRef = useRef(null)
  const railRef = useRef(null)
  const headingRefs = useRef({})
  const opener = useRef(null)
  const openingKind = useRef(null)
  const drawerLive = useRef(false)
  const focusGeneration = useRef(0)
  const reveal = useRef(null)
  const cancelReveal = () => {
    focusGeneration.current++
    reveal.current = null
  }
  const resizeFocus = useRef(null)
  const resizing = useRef(false)
  const helpInvoker = useRef(null)
  const cancelPalette = () => paletteRef.current?.cancel({ restoreFocus: false })

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    function change() {
      const focused = document.activeElement
      // A desktop popover is portalled outside the settings tree. Follow its
      // trigger's aria-controls relationship rather than losing owner focus.
      const settings = desktopSettingsRef.current || drawerSettingsRef.current
      const portalTrigger = [...(settings?.querySelectorAll('[aria-controls]') || [])].find((trigger) => {
        const surface = document.getElementById(trigger.getAttribute('aria-controls'))
        return surface?.contains(focused)
      })
      const inside = settings?.contains(focused) || Boolean(portalTrigger)
      resizeFocus.current = inside
        ? media.matches
          ? (portalTrigger || focused).closest('[data-section]')?.dataset.section || 'Input'
          : 'mobile'
        : null
      resizing.current = true
      cancelReveal()
      paletteRef.current?.cancel({ restoreFocus: false })
      setDrawerOpen(false)
      setDesktop(media.matches)
      if (inside && media.matches) setCollapsed(false)
    }
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  // Publish committed state before Radix's deferred close autofocus and host work.
  useLayoutEffect(() => {
    drawerLive.current = !desktop && drawerOpen
  }, [desktop, drawerOpen])

  useLayoutEffect(() => {
    if (!bridgeRef) return
    const bridge = {
      saveProject: controller.saveProject,
      beforeHelp: () => {
        helpInvoker.current = document.activeElement
        cancelReveal()
        cancelPalette()
      },
      restoreHelpFocus: () => {
        const target = helpInvoker.current
        if (target?.isConnected && !target.closest('[hidden], [inert]') && !target.matches(':disabled')) target.focus()
        else if (drawerOpen) closeRef.current?.focus()
        else (desktop ? railRef.current : openRef.current)?.focus()
      }
    }
    bridgeRef.current = bridge
    return () => {
      if (bridgeRef.current === bridge) bridgeRef.current = null
    }
  })

  useLayoutEffect(() => {
    if (backgroundRef.current) backgroundRef.current.inert = !desktop && drawerOpen
    const host = !desktop && drawerOpen ? drawerNoticeRef.current : previewNoticeRef.current
    if (host) host.appendChild(noticeNode)
    if (resizeFocus.current) {
      const target =
        resizeFocus.current === 'mobile' ? openRef.current : headingRefs.current[resizeFocus.current] || railRef.current
      target?.focus()
      resizeFocus.current = null
    }
    if (
      reveal.current === focusGeneration.current &&
      (desktop || drawerOpen) &&
      !collapsed &&
      sections['Export & Project']
    ) {
      const target = headingRefs.current['Export & Project']
      if (target) {
        target.scrollIntoView?.({ block: 'nearest', behavior: 'instant' })
        target.focus()
        cancelReveal()
      }
    }
  })
  useEffect(
    () => () => {
      noticeNode.remove()
      if (backgroundRef.current) backgroundRef.current.inert = false
    },
    [noticeNode]
  )

  useLayoutEffect(() => {
    if (helpOpen) paletteRef.current?.cancel({ restoreFocus: false })
  }, [helpOpen])

  function closeDrawer() {
    cancelReveal()
    cancelPalette()
    setDrawerOpen(false)
  }
  function revealExport(event) {
    resizing.current = false
    opener.current = event.currentTarget
    openingKind.current = 'export'
    reveal.current = ++focusGeneration.current
    setCollapsed(false)
    setSections((s) => ({ ...s, 'Export & Project': true }))
    if (!desktop) setDrawerOpen(true)
  }
  function toggleSection(title) {
    cancelReveal()
    if (sections[title]) cancelPalette()
    setSections((s) => ({ ...s, [title]: !s[title] }))
  }
  const contents = (
    <>
      <UndoRedoBar />
      {Object.keys(sections).map((title) => (
        <div key={title} data-section={title}>
          <Section
            title={title}
            open={sections[title]}
            onToggle={() => toggleSection(title)}
            headingRef={(node) => {
              if (node) headingRefs.current[title] = node
            }}
          >
            {title === 'Input' && <InputSource />}
            {title === 'Color Palette' && (
              <ColorPalette
                interactionRef={paletteRef}
                portalContainer={desktop ? undefined : portalContainer}
                presetDraft={presetDraft}
                onPresetDraftChange={setPresetDraft}
                presetSaveOpen={presetSaveOpen}
                onPresetSaveOpenChange={setPresetSaveOpen}
              />
            )}
            {title === 'Look' && (
              <>
                <p className="mb-2 text-xs text-zinc-400">Render mode, detail and effects.</p>
                <QualitySettings advancedOpen={advancedOpen} onAdvancedOpenChange={setAdvancedOpen} />
              </>
            )}
            {title === 'Animation' && <AnimationControls />}
            {title === 'Rotation Offset' && <RotationGizmoPanel />}
            {title === 'Light Direction' && <LightDirection />}
            {title === 'Export & Project' && (
              <ErrorBoundary>
                <ExportPanel {...controller} />
              </ErrorBoundary>
            )}
          </Section>
        </div>
      ))}
    </>
  )
  return (
    <>
      <main className="app-shell flex gap-3 overflow-hidden p-2 lg:p-4">
        {desktop && (
          <aside
            className={`flex min-h-0 shrink-0 flex-col gap-2 ${collapsed ? 'w-16' : 'w-[340px]'}`}
            aria-label="Settings panel"
          >
            <button
              ref={railRef}
              type="button"
              aria-expanded={!collapsed}
              aria-controls="desktop-settings"
              className="min-h-11 rounded bg-zinc-800 px-2 text-xs"
              onClick={() => {
                cancelPalette()
                cancelReveal()
                setCollapsed((c) => !c)
              }}
            >
              {collapsed ? 'Expand settings' : 'Collapse settings'}
            </button>
            <button type="button" onClick={revealExport} className="min-h-11 rounded bg-emerald-800 p-2 text-xs">
              Export & Project
            </button>
            <div
              id="desktop-settings"
              hidden={collapsed}
              ref={desktopSettingsRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto"
            >
              {contents}
            </div>
          </aside>
        )}
        <section ref={backgroundRef} className="flex min-h-0 min-w-0 flex-1 flex-col gap-2" aria-label="Preview">
          {!desktop && (
            <div className="flex shrink-0 gap-2">
              <button
                ref={openRef}
                type="button"
                aria-expanded={drawerOpen}
                aria-haspopup="dialog"
                onClick={(event) => {
                  resizing.current = false
                  opener.current = event.currentTarget
                  openingKind.current = 'ordinary'
                  cancelReveal()
                  setDrawerOpen(true)
                }}
                className="min-h-11 rounded bg-zinc-800 px-3 text-xs"
              >
                Open settings
              </button>
              <button
                ref={exportAccessRef}
                type="button"
                onClick={revealExport}
                className="min-h-11 rounded bg-emerald-800 px-3 text-xs"
              >
                Export & Project
              </button>
            </div>
          )}
          <div ref={previewNoticeRef} />
          <div className="min-h-0 flex-1">
            <PreviewCanvas />
          </div>
        </section>
      </main>
      <Dialog.Root
        open={!desktop && drawerOpen}
        onOpenChange={(open) => {
          if (!open) closeDrawer()
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
          <Dialog.Content
            aria-describedby={undefined}
            ref={drawerSettingsRef}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              if (openingKind.current === 'export') headingRefs.current['Export & Project']?.focus()
              else closeRef.current?.focus()
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              if (!drawerLive.current && !resizing.current && !helpOpen && !desktop) opener.current?.focus()
            }}
            onEscapeKeyDown={(event) => {
              if (helpOpen || paletteRef.current?.isKeyboardDragging?.()) event.preventDefault()
            }}
            onInteractOutside={(event) => {
              if (helpOpen) event.preventDefault()
            }}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(100vw,360px)] flex-col gap-2 border-r border-zinc-700 bg-zinc-950 p-3 shadow-xl"
          >
            <div className="flex shrink-0 items-center justify-between">
              <Dialog.Title>Settings</Dialog.Title>
              <Dialog.Close asChild>
                <button ref={closeRef} type="button" className="min-h-11 px-3" aria-label="Close settings">
                  Close
                </button>
              </Dialog.Close>
            </div>
            <div ref={drawerNoticeRef} className="shrink-0" />
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">{!desktop && contents}</div>
            <div ref={setPortalContainer} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {createPortal(<StatusNotice suspended={helpOpen} />, noticeNode)}
    </>
  )
}
Layout.propTypes = { bridgeRef: contracts.bridgeRef, helpOpen: contracts.optionalBoolean }
export { Layout }
