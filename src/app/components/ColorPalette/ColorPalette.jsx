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
import { useState, useRef, useEffect, useId } from 'react'
import { useProjectStore } from '../../store/useProjectStore.js'
import { usePresetStore } from '../../store/usePresetStore.js'
import { BUILT_IN_PRESETS } from '../../data/builtInPresets.js'
import { BTN } from '../../styles/buttonStyles.js'

const target =
  'min-h-11 min-w-11 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400'
const button = `${BTN.base} ${BTN.secondary} ${target}`

export function normalizePaletteHex(value) {
  const hex = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(hex)) return hex.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(hex)) return `#${[...hex.slice(1)].map((c) => c + c).join('')}`.toLowerCase()
  return null
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
            className={`${target} w-11 border border-zinc-500`}
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
        className={`${target} cursor-grab border border-zinc-700 text-zinc-400`}
        aria-label={`Reorder color ${index + 1}`}
      >
        <span aria-hidden="true">⠿</span>
      </button>
    </div>
  )
}

function PalettePresets({ onApply, presetDraft, onPresetDraftChange, presetSaveOpen, onPresetSaveOpenChange }) {
  const { customPresets, saveCurrentPreset, deletePreset } = usePresetStore()
  const [localDraft, setLocalDraft] = useState('')
  const [localOpen, setLocalOpen] = useState(false)
  const draft = presetDraft ?? localDraft
  const open = presetSaveOpen ?? localOpen
  const setDraft = onPresetDraftChange ?? setLocalDraft
  const setOpen = onPresetSaveOpenChange ?? setLocalOpen
  const saveRef = useRef(null)
  function finish() {
    setDraft('')
    setOpen(false)
    queueMicrotask(() => saveRef.current?.focus())
  }
  function save() {
    if (draft.trim()) {
      saveCurrentPreset(draft.trim())
      finish()
    }
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {[...BUILT_IN_PRESETS, ...customPresets].map((preset) => (
          <div key={preset.id} className="flex max-w-full items-center gap-1">
            <button
              type="button"
              onClick={() => onApply(preset.settings.colors)}
              className={`${button} flex max-w-full items-center gap-1.5 border border-zinc-700 px-2 text-xs`}
            >
              <span className="flex shrink-0 gap-0.5" aria-hidden="true">
                {preset.settings.colors.slice(0, 4).map((c, i) => (
                  <span key={i} className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c }} />
                ))}
              </span>
              <span className="break-words">{preset.name}</span>
            </button>
            {preset.category === 'custom' && (
              <button
                type="button"
                className={button}
                aria-label={`Delete preset ${preset.name}`}
                onClick={(event) => {
                  const previous = event.currentTarget.previousElementSibling
                  deletePreset(preset.id)
                  queueMicrotask(() => (previous?.isConnected ? previous : saveRef.current)?.focus())
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {open && (
        <div className="flex flex-wrap gap-1">
          <label className="w-full text-xs text-zinc-300">
            Preset name
            <input
              autoFocus
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
              className={`${target} mt-1 w-full bg-zinc-800 px-2`}
            />
          </label>
          <button type="button" className={button} disabled={!draft.trim()} onClick={save}>
            Save preset
          </button>
          <button type="button" className={button} onClick={finish}>
            Cancel preset
          </button>
        </div>
      )}
      <button
        ref={saveRef}
        type="button"
        hidden={open}
        className={`${button} w-full text-xs`}
        onClick={() => setOpen(true)}
      >
        + Save current as preset
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
  onPresetSaveOpenChange
}) {
  const colors = useProjectStore((state) => state.colors)
  const [editing, setEditing] = useState(null)
  const [editToken, setEditToken] = useState(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const transaction = useRef(null)
  const ownWrite = useRef(false)
  const revision = useRef(0)
  const focusGeneration = useRef(0)
  const triggers = useRef([])
  const addRef = useRef(null)
  const contentRef = useRef(null)
  const inputRef = useRef(null)
  const dragRef = useRef(null)
  const keyboardDrag = useRef(false)
  const cancelRef = useRef(null)
  const fieldId = useId()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  function focusItem(index, handle = false) {
    const generation = ++focusGeneration.current
    queueMicrotask(() => {
      if (generation !== focusGeneration.current) return
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
    ++focusGeneration.current
    setEditing(null)
    setError(false)
    if (resetDrag && dragRef.current !== null) {
      dragRef.current = null
      setEpoch((value) => value + 1)
    }
    if (restoreFocus && index !== undefined) focusItem(index)
  }
  cancelRef.current = cancel
  useEffect(() => {
    const generation = focusGeneration
    if (interactionRef)
      interactionRef.current = {
        cancel: (options) => cancelRef.current(options),
        // Radix observes Escape in capture before the keyboard sensor cancels.
        // The drawer must defer dismissal, not stop propagation to that sensor.
        isKeyboardDragging: () => dragRef.current !== null && keyboardDrag.current
      }
    const unsubscribe = useProjectStore.subscribe((next, previous) => {
      if (next.colors === previous.colors) return
      revision.current++
      if (ownWrite.current) {
        // Only the one synchronous revision issued by this action is ours.
        // A subscriber may synchronously issue another, external mutation.
        ownWrite.current = false
        if (transaction.current) transaction.current.revision = revision.current
      } else {
        const index = transaction.current?.index ?? dragRef.current
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
      if (interactionRef) interactionRef.current = null
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
  const ids = colors.map((_, index) => `color-${index}`)
  return (
    <section className="min-w-0 space-y-3" aria-label="Color palette editor">
      <PalettePresets
        {...{ presetDraft, onPresetDraftChange, presetSaveOpen, onPresetSaveOpenChange }}
        onApply={(next) => structural((state) => state.setColors(next))}
      />
      <div className="min-w-0 border-t border-zinc-800 pt-3">
        <div className="mb-2 flex justify-between text-xs text-zinc-400">
          <span>Dark (shadows)</span>
          <span>Bright (highlights)</span>
        </div>
        <p className="mb-2 text-xs text-zinc-400">
          Select a swatch to edit. Use its handle to drag or reorder with the keyboard; move buttons are inside the
          editor.
        </p>
        <DndContext
          key={epoch}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active, activatorEvent }) => {
            cancel({ resetDrag: false })
            keyboardDrag.current = activatorEvent.type === 'keydown'
            dragRef.current = ids.indexOf(active.id)
          }}
          onDragCancel={() => {
            const index = dragRef.current
            dragRef.current = null
            if (index !== null) focusItem(index, true)
          }}
          onDragEnd={({ active, over }) => {
            const index = ids.indexOf(active.id)
            if (dragRef.current === null) return
            if (over) move(index, ids.indexOf(over.id))
            else {
              dragRef.current = null
              focusItem(index, true)
            }
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
                        className="z-50 max-h-[calc(100dvh-16px)] w-64 max-w-[calc(100vw-16px)] overflow-y-auto rounded border border-zinc-600 bg-zinc-900 p-3 text-zinc-100 shadow-xl"
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
                        <div className="sticky top-0 z-10 mb-2 flex items-center justify-between bg-zinc-900">
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
                        <label htmlFor={fieldId} className="mt-2 block text-xs">
                          Hex color
                        </label>
                        <input
                          ref={inputRef}
                          id={fieldId}
                          value={draft}
                          aria-invalid={error}
                          aria-describedby={error ? `${fieldId}-error` : undefined}
                          className={`${target} mt-1 w-full border border-zinc-600 bg-zinc-800 px-2 text-sm`}
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
                          <p id={`${fieldId}-error`} className="mt-1 text-xs text-red-300">
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
        <div className="mt-2 flex gap-2">
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
    </section>
  )
}

export { ColorPalette }
