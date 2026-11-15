/* eslint-disable react/prop-types -- This JavaScript component uses the documented optional Layout interface; no runtime prop-types dependency. */
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as Popover from '@radix-ui/react-popover'
import { HexColorPicker } from 'react-colorful'
import { useState, useRef, useEffect, useLayoutEffect, useId } from 'react'
import * as contracts from '../../utils/uiPropValidators.js'
import { useProjectStore } from '../../store/useProjectStore.js'
import { usePresetStore } from '../../store/usePresetStore.js'
import { BUILT_IN_PRESETS } from '../../data/builtInPresets.js'
import { BTN } from '../../styles/buttonStyles.js'

const target = 'min-h-11 min-w-11 rounded'
const button = `${BTN.base} ${BTN.secondary} ${target}`

export function normalizePaletteHex(value) {
  const hex = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(hex)) return hex.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(hex)) return `#${[...hex.slice(1)].map((c) => c + c).join('')}`.toLowerCase()
  return null
}

// Private runtime adapter for @dnd-kit/core 6.3.1. Its constructors dispatch
// attach(), keyboard attach defers listeners.add, and pointer detach schedules
// documentListeners.removeAll. Run compatibility tests on dependency updates.
function sensorLive(sensor) {
  const session = sensor.props.paletteSession
  return !session.retired && !session.finished && !session.generation.retired
}

function sensorProps(props, kind) {
  const session = {
    generation: props.options.generation,
    activatorEvent: props.event,
    kind,
    retired: false,
    finished: false,
    delivering: false
  }
  const wrapped = { ...props, paletteSession: session }
  for (const name of ['onStart', 'onMove', 'onPending', 'onAbort']) {
    wrapped[name] = (...args) => {
      if (sensorLive(session.adapter) || (name === 'onAbort' && session.retiring)) props[name]?.(...args)
    }
  }
  for (const name of ['onEnd', 'onCancel']) {
    wrapped[name] = (...args) => {
      if (!sensorLive(session.adapter) && !(name === 'onCancel' && session.retiring && !session.finished)) return
      session.finished = true
      session.delivering = true
      try {
        return props[name](...args)
      } finally {
        session.delivering = false
        if (session.generation.session === session) session.generation.session = null
      }
    }
  }
  return wrapped
}

function attachSensor(sensor) {
  const session = sensor.props.paletteSession
  session.adapter = sensor
  session.resourcesOpen = true
  session.generation.session = session
  for (const manager of [sensor.listeners, sensor.windowListeners, sensor.documentListeners].filter(Boolean)) {
    const add = manager.add.bind(manager)
    manager.add = (type, listener, options) => {
      // Native pointer sensors share the same click stopper. Give each manager
      // its own identity so an old 50ms cleanup cannot remove a newer listener.
      if (session.resourcesOpen) add(type, (...args) => listener(...args), options)
    }
  }
  if (sensor.documentListeners) {
    session.generation.tails.add(session)
    const removeAll = sensor.documentListeners.removeAll.bind(sensor.documentListeners)
    sensor.documentListeners.removeAll = () => {
      removeAll()
      session.generation.tails.delete(session)
    }
  }
}

function retireSensor(session) {
  session.retired = true
  if (!session.finished) {
    session.retiring = true
    try {
      if (session.kind === 'pointer') PointerSensor.prototype.handleCancel.call(session.adapter)
      else {
        session.adapter.detach()
        session.adapter.props.onCancel()
      }
    } finally {
      session.retiring = false
    }
  }
  // Preserve natural drop click suppression, but release forced retirement now.
  session.adapter.documentListeners?.removeAll()
}

class PaletteKeyboardSensor extends KeyboardSensor {
  constructor(props) {
    super(sensorProps(props, 'keyboard'))
  }
  attach() {
    attachSensor(this)
    super.attach()
  }
  detach() {
    this.props.paletteSession.resourcesOpen = false
    super.detach()
  }
  handleStart(...args) {
    if (sensorLive(this)) super.handleStart(...args)
  }
  handleKeyDown(...args) {
    if (sensorLive(this)) super.handleKeyDown(...args)
  }
  handleMove(...args) {
    if (sensorLive(this)) super.handleMove(...args)
  }
  handleEnd(...args) {
    if (sensorLive(this)) super.handleEnd(...args)
  }
  handleCancel(...args) {
    if (sensorLive(this)) super.handleCancel(...args)
  }
}

class PalettePointerSensor extends PointerSensor {
  constructor(props) {
    super(sensorProps(props, 'pointer'))
  }
  attach() {
    attachSensor(this)
    super.attach()
  }
  detach() {
    this.props.paletteSession.resourcesOpen = false
    super.detach()
  }
  handleStart(...args) {
    if (sensorLive(this)) super.handleStart(...args)
  }
  handlePending(...args) {
    if (sensorLive(this)) super.handlePending(...args)
  }
  handleMove(...args) {
    if (sensorLive(this)) super.handleMove(...args)
  }
  handleEnd(...args) {
    if (sensorLive(this)) super.handleEnd(...args)
  }
  handleCancel(...args) {
    if (sensorLive(this)) super.handleCancel(...args)
  }
  handleKeydown(...args) {
    if (sensorLive(this)) super.handleKeydown(...args)
  }
  removeTextSelection(...args) {
    if (sensorLive(this)) super.removeTextSelection(...args)
  }
}

for (const [Adapter, Native] of [
  [PaletteKeyboardSensor, KeyboardSensor],
  [PalettePointerSensor, PointerSensor]
]) {
  Adapter.activators = Native.activators.map(({ eventName, handler }) => ({
    eventName,
    handler: (event, options, context) => !options.generation.retired && handler(event, options, context)
  }))
}

function paletteGeneration(id = 0) {
  return { id, retired: false, session: null, tails: new Set() }
}

function retireGeneration(generation) {
  const needsReset = !!generation.session && !generation.retired
  if (needsReset) generation.retired = true
  const sessions = new Set(generation.tails)
  if (generation.session) sessions.add(generation.session)
  for (const session of sessions) session.retired = true
  for (const session of sessions) retireSensor(session)
  return needsReset
}

function focusableWithin(root) {
  return [...root.querySelectorAll('button, input, select, textarea, a[href], [tabindex]')].filter(
    (node) => node.tabIndex >= 0 && !node.disabled && !node.closest('[hidden], [inert]') && node.getClientRects().length
  )
}

function SortableColor({ id, index, color, open, onOpenChange, triggerRef, children }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex w-11 shrink-0 flex-col gap-1"
    >
      <Popover.Root open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>
          <button
            ref={triggerRef}
            type="button"
            className={`${button} w-11`}
            style={{ backgroundColor: color }}
            aria-label={`Edit color ${index + 1}: ${color}`}
          />
        </Popover.Trigger>
        {children}
      </Popover.Root>
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        style={{ touchAction: 'none' }}
        className={`${button} cursor-grab`}
        aria-label={`Reorder color ${index + 1}`}
      >
        <span aria-hidden="true">⠿</span>
      </button>
    </div>
  )
}

function PalettePresets({
  onApply,
  onCancelInteraction,
  focusGenerationRef,
  presetDraft,
  onPresetDraftChange,
  presetSaveOpen,
  onPresetSaveOpenChange,
  palettesOpen,
  onPalettesOpenChange
}) {
  const { customPresets, saveCurrentPreset, deletePreset } = usePresetStore()
  const [localDraft, setLocalDraft] = useState('')
  const [localOpen, setLocalOpen] = useState(false)
  const [localBrowse, setLocalBrowse] = useState(false)
  const draft = presetDraft ?? localDraft
  const open = presetSaveOpen ?? localOpen
  const browse = palettesOpen ?? localBrowse
  const setDraft = onPresetDraftChange ?? setLocalDraft
  const setOpen = onPresetSaveOpenChange ?? setLocalOpen
  const setBrowse = onPalettesOpenChange ?? setLocalBrowse
  const saveRef = useRef(null)
  const nameRef = useRef(null)
  const browseRef = useRef(null)
  const pendingNameFocus = useRef(null)
  const browseId = useId()
  function focusVisible(node) {
    if (node?.isConnected && !node.disabled && !node.closest('[hidden], [inert]') && node.getClientRects().length)
      node.focus()
  }
  // Only this instance's explicit invocation can request focus. Controlled-open
  // remounts (or a cancelled request before a delayed controlled commit) cannot.
  useLayoutEffect(() => {
    if (!open || pendingNameFocus.current === null) return
    if (pendingNameFocus.current === focusGenerationRef.current) focusVisible(nameRef.current)
    pendingNameFocus.current = null
  })
  useLayoutEffect(
    () => () => {
      ++focusGenerationRef.current
    },
    [focusGenerationRef]
  )
  function restore(node) {
    const generation = ++focusGenerationRef.current
    queueMicrotask(() => {
      if (generation === focusGenerationRef.current) focusVisible(node)
    })
  }
  function finish() {
    pendingNameFocus.current = null
    setDraft('')
    setOpen(false)
    restore(saveRef.current)
  }
  function save() {
    if (draft.trim()) {
      saveCurrentPreset(draft.trim())
      finish()
    }
  }
  return (
    <div className="min-w-0 space-y-3" onPointerDownCapture={onCancelInteraction}>
      <button
        ref={browseRef}
        type="button"
        aria-expanded={browse}
        aria-controls={browseId}
        className={`${button} w-full justify-between`}
        onClick={() => {
          onCancelInteraction()
          setBrowse(!browse)
        }}
      >
        Browse palettes <span aria-hidden="true">{browse ? '−' : '+'}</span>
      </button>
      <div id={browseId} hidden={!browse} className="min-w-0 space-y-2">
        <p className="bf-help">Palettes change colors only.</p>
        {[...BUILT_IN_PRESETS, ...customPresets].map((preset) => (
          <div key={preset.id} className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onApply(preset.settings.colors)}
              className={`${button} min-w-0 flex-1 justify-start gap-2 text-left`}
            >
              <span className="flex shrink-0 gap-0.5" aria-hidden="true">
                {preset.settings.colors.map((c, i) => (
                  <span key={i} className="h-3 w-3 rounded-sm" style={{ backgroundColor: c }} />
                ))}
              </span>
              <span className="min-w-0 break-words">{preset.name}</span>
            </button>
            {preset.category === 'custom' && (
              <button
                type="button"
                className={`${BTN.base} ${BTN.danger} ${target} shrink-0`}
                aria-label={`Delete palette ${preset.name}`}
                onClick={() => {
                  onCancelInteraction()
                  deletePreset(preset.id)
                  restore(browseRef.current)
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {open && (
        <div className="flex flex-wrap gap-2">
          <label className="bf-label w-full">
            Palette name
            <input
              ref={nameRef}
              data-bf-palette-name=""
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  save()
                }
                if (event.key === 'Escape') {
                  event.preventDefault()
                  event.stopPropagation()
                  finish()
                }
              }}
              className="bf-field mt-1"
            />
          </label>
          <button type="button" className={button} disabled={!draft.trim()} onClick={save}>
            Save palette
          </button>
          <button type="button" className={button} onClick={finish}>
            Cancel palette
          </button>
        </div>
      )}
      <button
        ref={saveRef}
        type="button"
        hidden={open}
        className={`${button} w-full`}
        onClick={() => {
          onCancelInteraction()
          pendingNameFocus.current = ++focusGenerationRef.current
          setOpen(true)
        }}
      >
        Save palette
      </button>
    </div>
  )
}

function ColorPalette({
  portalContainer,
  interactionRef,
  presetDraft,
  onPresetDraftChange,
  presetSaveOpen,
  onPresetSaveOpenChange,
  palettesOpen,
  onPalettesOpenChange
}) {
  const colors = useProjectStore((state) => state.colors)
  const [editing, setEditing] = useState(null)
  const [editToken, setEditToken] = useState(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState(false)
  const [generation, setGeneration] = useState(paletteGeneration)
  const generationRef = useRef(generation)
  generationRef.current = generation
  const transaction = useRef(null)
  const ownWrite = useRef(false)
  const revision = useRef(0)
  const focusGenerationRef = useRef(0)
  const triggers = useRef([])
  const addRef = useRef(null)
  const contentRef = useRef(null)
  const inputRef = useRef(null)
  const dragRef = useRef(null)
  const keyboardDrag = useRef(false)
  const cancelRef = useRef(null)
  const fieldId = useId()
  const sensors = useSensors(
    useSensor(PalettePointerSensor, { generation, activationConstraint: { distance: 8 } }),
    useSensor(PaletteKeyboardSensor, { generation, coordinateGetter: sortableKeyboardCoordinates })
  )
  function focusItem(index, handle = false) {
    const generation = ++focusGenerationRef.current
    queueMicrotask(() => {
      if (generation !== focusGenerationRef.current) return
      const count = useProjectStore.getState().colors.length
      const trigger = triggers.current[Math.min(index, count - 1)]
      const node = handle ? trigger?.nextElementSibling : trigger
      const destination = node ?? addRef.current
      if (destination?.isConnected && !destination.closest('[hidden], [inert]') && destination.getClientRects().length)
        destination.focus()
    })
  }
  function cancel({ restoreFocus = false, resetDrag = true } = {}) {
    const index = transaction.current?.index
    transaction.current = null
    ++focusGenerationRef.current
    setEditing(null)
    setError(false)
    if (resetDrag) {
      dragRef.current = null
      keyboardDrag.current = false
      const current = generationRef.current
      if (retireGeneration(current)) setGeneration(paletteGeneration(current.id + 1))
    }
    if (restoreFocus && index !== undefined) focusItem(index)
  }
  cancelRef.current = cancel
  useEffect(() => {
    const generation = focusGenerationRef
    if (generationRef.current.retired) setGeneration(paletteGeneration(generationRef.current.id + 1))
    const handle = {
      cancel: (options) => cancelRef.current(options),
      // Radix observes Escape in capture before the keyboard sensor cancels.
      // The drawer must defer dismissal, not stop propagation to that sensor.
      isKeyboardDragging: () => dragRef.current !== null && keyboardDrag.current
    }
    if (interactionRef) interactionRef.current = handle
    const unsubscribe = useProjectStore.subscribe((next, previous) => {
      if (next.colors === previous.colors) return
      revision.current++
      if (ownWrite.current) {
        // Only the one synchronous revision issued by this action is ours.
        // A subscriber may synchronously issue another, external mutation.
        ownWrite.current = false
        if (transaction.current) transaction.current.revision = revision.current
      } else {
        const index = transaction.current?.index ?? dragRef.current?.index
        const hadFocus =
          contentRef.current?.contains(document.activeElement) ||
          triggers.current.some(
            (trigger) => trigger === document.activeElement || trigger?.nextElementSibling === document.activeElement
          )
        cancelRef.current()
        if (hadFocus && index !== null && index !== undefined) focusItem(index)
      }
    })
    return () => {
      unsubscribe()
      transaction.current = null
      dragRef.current = null
      ++generation.current
      keyboardDrag.current = false
      retireGeneration(generationRef.current)
      generationRef.current.retired = true
      if (interactionRef?.current === handle) interactionRef.current = null
    }
  }, [interactionRef])
  useEffect(() => {
    if (editing === null) return
    // Mark dismissal intent before native blur; Radix still owns dismissal/focus scope.
    const mark = (event) => {
      if (!contentRef.current?.contains(event.target) || event.target.closest('[data-palette-cancel]')) {
        if (transaction.current) transaction.current.cancelled = true
      }
    }
    document.addEventListener('pointerdown', mark, true)
    return () => document.removeEventListener('pointerdown', mark, true)
  }, [editing])
  function write(action) {
    ownWrite.current = true
    try {
      action(useProjectStore.getState())
    } finally {
      ownWrite.current = false
    }
  }
  function open(index) {
    cancel()
    const token = Symbol('palette-item')
    transaction.current = { index, token, revision: revision.current, cancelled: false }
    setEditToken(token)
    setDraft(useProjectStore.getState().colors[index])
    setError(false)
    setEditing(index)
  }
  function commit(value = draft) {
    const tx = transaction.current
    if (
      !tx ||
      tx.token !== editToken ||
      tx.cancelled ||
      tx.revision !== revision.current ||
      tx.index >= useProjectStore.getState().colors.length
    )
      return
    const normalized = normalizePaletteHex(value)
    if (!normalized) {
      setError(true)
      return
    }
    if (useProjectStore.getState().colors[tx.index] !== normalized)
      write((state) => state.setColorAt(tx.index, normalized))
    setDraft(normalized)
    setError(false)
  }
  function structural(action) {
    cancel()
    write(action)
  }
  function move(from, to) {
    const current = useProjectStore.getState().colors
    if (from < 0 || to < 0 || from >= current.length || to >= current.length) return
    cancel({ resetDrag: false })
    dragRef.current = null
    write((state) => state.setColors(arrayMove(current, from, to)))
    focusItem(to)
  }
  function ownedDrag(event) {
    const owned = dragRef.current
    if (
      !owned ||
      owned.generation !== generation ||
      generation.retired ||
      owned.session.retired ||
      !owned.session.delivering ||
      owned.activatorEvent !== event.activatorEvent
    )
      return null
    return owned
  }
  const ids = colors.map((_, index) => `color-${index}`)
  return (
    <section className="min-w-0 space-y-3" aria-label="Color palette editor">
      <div className="min-w-0">
        <div className="bf-help mb-2 flex justify-between gap-2">
          <span>Dark (shadows)</span>
          <span>Bright (highlights)</span>
        </div>
        <p className="bf-help mb-2">
          Select a swatch to edit. Use its handle to drag or reorder with the keyboard; move buttons are inside the
          editor.
        </p>
        <DndContext
          key={generation.id}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active, activatorEvent }) => {
            const session = generation.session
            if (
              !session ||
              generation.retired ||
              session.retired ||
              session.finished ||
              session.activatorEvent !== activatorEvent
            )
              return
            cancel({ resetDrag: false })
            keyboardDrag.current = session.kind === 'keyboard'
            dragRef.current = { session, generation, activatorEvent, index: ids.indexOf(active.id) }
          }}
          onDragCancel={(event) => {
            const owned = ownedDrag(event)
            if (!owned) return
            dragRef.current = null
            keyboardDrag.current = false
            focusItem(owned.index, true)
          }}
          onDragEnd={(event) => {
            const owned = ownedDrag(event)
            if (!owned) return
            dragRef.current = null
            keyboardDrag.current = false
            if (event.over) move(owned.index, ids.indexOf(event.over.id))
            else focusItem(owned.index, true)
          }}
          accessibility={{ restoreFocus: false }}
        >
          <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
            <div className="flex max-w-full gap-2 overflow-x-auto p-1 pb-2" aria-label="Palette colors">
              {colors.map((color, index) => (
                <SortableColor
                  key={ids[index]}
                  id={ids[index]}
                  index={index}
                  color={color}
                  open={editing === index}
                  triggerRef={(node) => {
                    triggers.current[index] = node
                  }}
                  onOpenChange={(next) => (next ? open(index) : cancel())}
                >
                  {editing === index && (
                    <Popover.Portal container={portalContainer}>
                      <Popover.Content
                        ref={contentRef}
                        aria-label={`Edit color ${index + 1}`}
                        sideOffset={8}
                        collisionPadding={8}
                        className="bf-picker z-[60] w-64 max-w-[calc(100vw-16px)] overflow-y-auto p-3"
                        style={{ maxHeight: 'min(calc(100dvh - 16px), var(--radix-popover-content-available-height))' }}
                        onPlaced={() => inputRef.current?.scrollIntoView?.({ block: 'nearest' })}
                        onOpenAutoFocus={(event) => {
                          event.preventDefault()
                          inputRef.current?.focus()
                        }}
                        onCloseAutoFocus={(event) => event.preventDefault()}
                        onKeyDownCapture={(event) => {
                          if (event.key !== 'Tab') return
                          const content = contentRef.current
                          const fields = focusableWithin(content)
                          const boundary = event.shiftKey ? fields[0] : fields[fields.length - 1]
                          if (event.target !== boundary) return
                          // Radix loops popover Tab by default. This nonmodal editor
                          // instead cancels when leaving, without committing on blur.
                          event.preventDefault()
                          const outside = focusableWithin(document).filter((node) => !content.contains(node))
                          const position = outside.indexOf(triggers.current[index])
                          const destination = outside[position + (event.shiftKey ? -1 : 1)]
                          cancel()
                          destination?.focus()
                        }}
                        onEscapeKeyDown={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          cancel({ restoreFocus: true })
                        }}
                        onPointerDownOutside={() => cancel()}
                        onFocusOutside={() => cancel()}
                      >
                        <div className="sticky top-0 z-10 mb-2 flex items-center justify-between bg-[var(--bf-panel)]">
                          <span className="text-sm">Edit color {index + 1}</span>
                          <button
                            type="button"
                            data-palette-cancel
                            className={button}
                            aria-label="Close color picker"
                            onClick={() => cancel({ restoreFocus: true })}
                          >
                            ×
                          </button>
                        </div>
                        <HexColorPicker color={color} onChange={(next) => commit(next)} />
                        <label htmlFor={fieldId} className="bf-label mt-2">
                          Hex color
                        </label>
                        <input
                          ref={inputRef}
                          id={fieldId}
                          value={draft}
                          aria-invalid={error}
                          aria-describedby={error ? `${fieldId}-error` : undefined}
                          className="bf-field mt-1"
                          onChange={(event) => {
                            setDraft(event.target.value)
                            setError(false)
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              commit()
                            }
                          }}
                          onBlur={(event) => {
                            const next = event.relatedTarget
                            if (next && contentRef.current?.contains(next) && !next.closest('[data-palette-cancel]'))
                              commit()
                            else if (transaction.current) transaction.current.cancelled = true
                          }}
                        />
                        {error && (
                          <p id={`${fieldId}-error`} className="bf-error mt-1">
                            Enter a hex color: #RGB or #RRGGBB.
                          </p>
                        )}
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            className={`${button} flex-1 text-xs`}
                            disabled={index === 0}
                            onClick={() => move(index, index - 1)}
                            aria-label={`Move color ${index + 1} earlier`}
                          >
                            ← Earlier
                          </button>
                          <button
                            type="button"
                            className={`${button} flex-1 text-xs`}
                            disabled={index === colors.length - 1}
                            onClick={() => move(index, index + 1)}
                            aria-label={`Move color ${index + 1} later`}
                          >
                            Later →
                          </button>
                        </div>
                      </Popover.Content>
                    </Popover.Portal>
                  )}
                </SortableColor>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="mt-2 flex gap-2" onPointerDownCapture={() => cancel()}>
          <button
            ref={addRef}
            type="button"
            className={button}
            disabled={colors.length >= 6}
            onClick={() => structural((state) => state.addColor())}
          >
            Add
          </button>
          <button
            type="button"
            className={button}
            disabled={colors.length <= 2}
            onClick={() => structural((state) => state.removeColor(state.colors.length - 1))}
          >
            Remove
          </button>
        </div>
      </div>
      <PalettePresets
        {...{
          presetDraft,
          onPresetDraftChange,
          presetSaveOpen,
          onPresetSaveOpenChange,
          palettesOpen,
          onPalettesOpenChange,
          focusGenerationRef
        }}
        onCancelInteraction={() => cancel()}
        onApply={(next) => structural((state) => state.setColors(next))}
      />
    </section>
  )
}

ColorPalette.propTypes = {
  interactionRef: contracts.interactionRef,
  presetDraft: contracts.optionalString,
  onPresetDraftChange: contracts.optionalFunction,
  presetSaveOpen: contracts.optionalBoolean,
  onPresetSaveOpenChange: contracts.optionalFunction,
  palettesOpen: contracts.optionalBoolean,
  onPalettesOpenChange: contracts.optionalFunction
}

export { ColorPalette }
