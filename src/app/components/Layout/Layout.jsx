import { useState, useEffect, useLayoutEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from 'zustand'
import * as Dialog from '@radix-ui/react-dialog'
import { Undo2, Redo2, ChevronDown } from 'lucide-react'
import { ProjectActions } from './ProjectActions.jsx'
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
    <section className="bf-disclosure">
      <h3>
        <button
          ref={headingRef}
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="bf-disclosure-trigger"
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
    <div className="bf-history">
      <button
        type="button"
        onClick={() => {
          if (pastStates.length > 0) undo()
        }}
        disabled={pastStates.length === 0}
        title="Undo (Ctrl+Z)"
        className="bf-button bf-button--ghost"
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
        className="bf-button bf-button--ghost"
      >
        <Redo2 size={14} />
      </button>
    </div>
  )
}

function Layout({ bridgeRef, helpOpen = false, onShowHelp }) {
  const controller = useExportController()
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [activeTask, setActiveTask] = useState('source')
  const [sections, setSections] = useState({ 'Rotation Offset': false, 'Light Direction': false })
  const [postEffectsOpen, setPostEffectsOpen] = useState(false)
  const [palettesOpen, setPalettesOpen] = useState(false)
  const sourceNavigationRef = useRef(null)
  const taskBodyRef = useRef(null)
  const resetScroll = useRef(true)
  const [transition, setTransition] = useState(0)
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
  const resizeRestore = useRef(null)
  const cancelReveal = () => {
    focusGeneration.current++
    reveal.current = null
    resizeRestore.current = null
  }
  const resizeFocus = useRef(null)
  const resizing = useRef(false)
  const helpInvoker = useRef(null)
  const cancelPalette = () => paletteRef.current?.cancel({ restoreFocus: false })
  const barrier = () => {
    cancelReveal()
    cancelPalette()
  }
  const requestReset = () => {
    resetScroll.current = true
    setTransition((n) => n + 1)
  }

  useLayoutEffect(() => {
    const root = document.documentElement
    let previous = ''
    function measure() {
      const viewport = window.visualViewport
      const valid = Number.isFinite(viewport?.height) && viewport.height > 0
      const height = valid ? viewport.height : window.innerHeight
      const top = valid && Number.isFinite(viewport.offsetTop) ? Math.max(0, viewport.offsetTop) : 0
      const key = `${height}:${top}:${window.innerWidth}`
      if (previous === key) return
      previous = key
      root.style.setProperty('--bf-visible-height', `${height}px`)
      root.style.setProperty('--bf-visible-top', `${top}px`)
      const sheet = height >= 600 && window.innerWidth < height ? Math.min(height * 0.6, 560) : height
      root.style.setProperty('--bf-sheet-height', `${sheet}px`)
      root.style.setProperty('--bf-sheet-top', `${top + height - sheet}px`)
      root.dataset.bfShort = String(height < 240)
      const focused = document.activeElement
      if (taskBodyRef.current?.contains(focused)) focused.scrollIntoView?.({ block: 'nearest', behavior: 'instant' })
    }
    measure()
    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('scroll', measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('scroll', measure)
      for (const name of ['--bf-visible-height', '--bf-visible-top', '--bf-sheet-height', '--bf-sheet-top'])
        root.style.removeProperty(name)
      delete root.dataset.bfShort
    }
  }, [])

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
      resizeFocus.current =
        inside && !helpOpen
          ? media.matches
            ? (portalTrigger || focused).closest('[data-section]')?.dataset.section || activeTask
            : 'mobile'
          : null
      resetScroll.current = true
      resizing.current = true
      cancelReveal()
      if (inside && media.matches && !helpOpen) {
        resizeRestore.current = { owner: resizeFocus.current, generation: focusGeneration.current }
      }
      paletteRef.current?.cancel({ restoreFocus: false })
      setDrawerOpen(false)
      setDesktop(media.matches)
      if (inside && media.matches) setCollapsed(false)
    }
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [activeTask, helpOpen])

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
        else (desktop ? headingRefs.current[activeTask] || railRef.current : openRef.current)?.focus()
      }
    }
    bridgeRef.current = bridge
    return () => {
      if (bridgeRef.current === bridge) bridgeRef.current = null
    }
  })

  useLayoutEffect(() => {
    if (backgroundRef.current) backgroundRef.current.inert = !desktop && drawerOpen
    if (resetScroll.current && taskBodyRef.current) {
      taskBodyRef.current.scrollTop = 0
      resetScroll.current = false
    }
    const host = !desktop && drawerOpen ? drawerNoticeRef.current : previewNoticeRef.current
    if (host) host.appendChild(noticeNode)
    if (resizeFocus.current) {
      const target =
        resizeFocus.current === 'mobile' ? openRef.current : headingRefs.current[resizeFocus.current] || railRef.current
      target?.focus()
      resizeFocus.current = null
    }
    if (
      reveal.current?.generation === focusGeneration.current &&
      (desktop || drawerOpen) &&
      !collapsed &&
      activeTask === reveal.current.task
    ) {
      const request = reveal.current
      const target = headingRefs.current[request.task]
      if (target) {
        target.scrollIntoView?.({ block: 'nearest', behavior: 'instant' })
        if (!request.kind || !sourceNavigationRef.current?.focusSource(request.kind)) target.focus()
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
    if (taskBodyRef.current) taskBodyRef.current.scrollTop = 0
    resetScroll.current = true
    setDrawerOpen(false)
  }
  function revealExport(event) {
    resizing.current = false
    opener.current = event.currentTarget
    openingKind.current = 'export'
    barrier()
    reveal.current = { generation: focusGeneration.current, task: 'export' }
    requestReset()
    setCollapsed(false)
    setActiveTask('export')
    if (!desktop) setDrawerOpen(true)
  }
  function toggleSection(title) {
    cancelReveal()
    if (sections[title]) cancelPalette()
    setSections((s) => ({ ...s, [title]: !s[title] }))
  }
  function chooseSource(kind, event) {
    barrier()
    opener.current = event.currentTarget
    openingKind.current = 'source'
    resizing.current = false
    useProjectStore.getState().setInputType(kind)
    setActiveTask('source')
    setCollapsed(false)
    requestReset()
    reveal.current = { generation: focusGeneration.current, task: 'source', kind }
    if (!desktop) setDrawerOpen(true)
  }
  const navigation = (
    <div role="group" aria-label="Editor tasks" className="bf-task-nav">
      {['source', 'look', 'motion', 'export'].map((task) => (
        <button
          key={task}
          type="button"
          className="bf-task"
          aria-pressed={activeTask === task}
          aria-controls={`bf-panel-${task}`}
          onPointerDownCapture={barrier}
          onClick={() => {
            barrier()
            requestReset()
            setActiveTask(task)
          }}
        >
          {task[0].toUpperCase() + task.slice(1)}
        </button>
      ))}
    </div>
  )
  const contents = (
    <div ref={taskBodyRef} className="bf-task-body" data-transition={transition}>
      {['source', 'look', 'motion', 'export'].map((task) => (
        <section
          key={task}
          id={`bf-panel-${task}`}
          data-section={task}
          hidden={activeTask !== task}
          aria-labelledby={`bf-heading-${task}`}
          className="bf-task-panel"
        >
          <h2
            id={`bf-heading-${task}`}
            tabIndex={-1}
            ref={(node) => {
              headingRefs.current[task] = node
            }}
          >
            {task[0].toUpperCase() + task.slice(1)}
          </h2>
          {task === 'source' && <InputSource navigationRef={sourceNavigationRef} />}
          {task === 'look' && (
            <>
              <QualitySettings
                part="renderer"
                advancedOpen={advancedOpen}
                onAdvancedOpenChange={setAdvancedOpen}
                postEffectsOpen={postEffectsOpen}
                onPostEffectsOpenChange={setPostEffectsOpen}
              />
              <ColorPalette
                interactionRef={paletteRef}
                portalContainer={desktop ? undefined : portalContainer}
                presetDraft={presetDraft}
                onPresetDraftChange={setPresetDraft}
                presetSaveOpen={presetSaveOpen}
                onPresetSaveOpenChange={setPresetSaveOpen}
                palettesOpen={palettesOpen}
                onPalettesOpenChange={setPalettesOpen}
              />
              <QualitySettings
                part="refinements"
                advancedOpen={advancedOpen}
                onAdvancedOpenChange={setAdvancedOpen}
                postEffectsOpen={postEffectsOpen}
                onPostEffectsOpenChange={setPostEffectsOpen}
              />
            </>
          )}
          {task === 'motion' && (
            <>
              <AnimationControls />
              <h3 className="bf-group-title">Composition</h3>
              {Object.keys(sections).map((title) => (
                <Section key={title} title={title} open={sections[title]} onToggle={() => toggleSection(title)}>
                  {title === 'Rotation Offset' ? <RotationGizmoPanel /> : <LightDirection />}
                </Section>
              ))}
            </>
          )}
          {task === 'export' && (
            <ErrorBoundary>
              <ExportPanel
                selectedFormat={controller.selectedFormat}
                onSelectFormat={controller.onSelectFormat}
                exportSelected={controller.exportSelected}
                cancelExport={controller.cancelExport}
                exporting={controller.exporting}
                disabledReason={controller.disabledReason}
              />
            </ErrorBoundary>
          )}
        </section>
      ))}
    </div>
  )
  return (
    <>
      <div ref={backgroundRef} className="bf-workbench">
        <header className="bf-header">
          <div className="bf-brand">
            <span aria-hidden="true" className="bf-mark">
              ▦
            </span>
            BitmapForge
          </div>
          <UndoRedoBar />
          <ProjectActions saveProject={controller.saveProject} loadProject={controller.loadProject} />
          <button className="bf-button bf-button--ghost" onPointerDownCapture={barrier} onClick={onShowHelp}>
            Help
          </button>
          {desktop && (
            <button className="bf-button bf-button--primary" onPointerDownCapture={barrier} onClick={revealExport}>
              Export
            </button>
          )}
        </header>
        <main className="bf-workspace">
          {desktop && (
            <aside className={`bf-inspector ${collapsed ? 'bf-inspector-collapsed' : ''}`} aria-label="Settings panel">
              <button
                ref={railRef}
                type="button"
                aria-expanded={!collapsed}
                aria-controls="desktop-settings"
                className="bf-button bf-button--ghost bf-collapse"
                onPointerDownCapture={barrier}
                onClick={() => {
                  barrier()
                  requestReset()
                  setCollapsed((c) => !c)
                }}
              >
                {collapsed ? 'Expand settings' : 'Collapse settings'}
              </button>
              <div id="desktop-settings" hidden={collapsed} ref={desktopSettingsRef} className="bf-inspector-inner">
                {navigation}
                {contents}
              </div>
            </aside>
          )}
          <section className="bf-preview" aria-label="Preview">
            <div ref={previewNoticeRef} className="bf-notice-slot" />
            <div className="bf-stage" onPointerDownCapture={barrier}>
              <PreviewCanvas onChooseSource={chooseSource} />
            </div>
          </section>
        </main>
        {!desktop && (
          <footer className="bf-mobile-toolbar">
            <button
              ref={openRef}
              type="button"
              aria-expanded={drawerOpen}
              aria-haspopup="dialog"
              className="bf-button bf-button--secondary"
              onPointerDownCapture={barrier}
              onClick={(event) => {
                barrier()
                requestReset()
                resizing.current = false
                opener.current = event.currentTarget
                openingKind.current = 'ordinary'
                setDrawerOpen(true)
              }}
            >
              Open settings
            </button>
            <button
              ref={exportAccessRef}
              type="button"
              className="bf-button bf-button--primary"
              onPointerDownCapture={barrier}
              onClick={revealExport}
            >
              Export
            </button>
          </footer>
        )}
      </div>
      <Dialog.Root
        open={!desktop && drawerOpen}
        onOpenChange={(open) => {
          if (!open) closeDrawer()
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="bf-overlay bf-settings-overlay" onPointerDownCapture={barrier} />
          <Dialog.Content
            aria-describedby={undefined}
            ref={drawerSettingsRef}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              if (openingKind.current === 'export') headingRefs.current.export?.focus()
              else closeRef.current?.focus()
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              // A departing modal FocusScope can reject the parent's layout-phase
              // desktop focus. Complete that same generation at Radix teardown,
              // never with a timer or after a newer task/source request.
              const request = resizeRestore.current
              if (!drawerLive.current && resizing.current && request?.generation === focusGeneration.current) {
                resizeRestore.current = null
                const target = headingRefs.current[request.owner]
                if (target?.isConnected && !target.closest('[hidden], [inert]')) {
                  target.focus()
                  target.scrollIntoView?.({ block: 'nearest', behavior: 'instant' })
                }
              }
              if (!drawerLive.current && !resizing.current && !helpOpen && !desktop) {
                const target = opener.current
                if (target?.isConnected && !target.closest('[hidden], [inert]') && !target.matches(':disabled'))
                  target.focus()
                else openRef.current?.focus()
              }
            }}
            onEscapeKeyDown={(event) => {
              const nameOwnsEscape =
                event.target === document.activeElement &&
                event.target?.matches?.('input[data-bf-palette-name]') &&
                drawerSettingsRef.current?.contains(event.target)
              // Retire only Dialog dismissal; the name input's existing React
              // Escape handler must still clear the form and restore its trigger.
              if (helpOpen || paletteRef.current?.isKeyboardDragging?.() || nameOwnsEscape) event.preventDefault()
            }}
            onInteractOutside={(event) => {
              if (helpOpen) event.preventDefault()
            }}
            className="bf-dialog bf-settings"
          >
            <div className="bf-dialog-header">
              <Dialog.Title>Settings</Dialog.Title>
              <button
                type="button"
                className="bf-button bf-button--ghost"
                onPointerDownCapture={barrier}
                onClick={onShowHelp}
              >
                Help
              </button>
              <Dialog.Close asChild>
                <button
                  ref={closeRef}
                  type="button"
                  className="bf-button bf-button--secondary"
                  onPointerDownCapture={barrier}
                  aria-label="Close settings"
                >
                  Close
                </button>
              </Dialog.Close>
            </div>
            <div ref={drawerNoticeRef} className="bf-notice-slot" />
            {!desktop && navigation}
            {!desktop && contents}
            <div ref={setPortalContainer} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {createPortal(<StatusNotice suspended={helpOpen} />, noticeNode)}
    </>
  )
}
Layout.propTypes = {
  bridgeRef: contracts.bridgeRef,
  helpOpen: contracts.optionalBoolean,
  onShowHelp: contracts.optionalFunction
}
export { Layout }
