import * as Dialog from '@radix-ui/react-dialog'
import { optionalFunction, requiredBoolean, requiredFunction } from '../../utils/uiPropValidators.js'

const SHORTCUTS = [
  { keys: 'Ctrl + Z', description: 'Undo' },
  { keys: 'Ctrl + Shift + Z', description: 'Redo' },
  { keys: 'R', description: 'Reset rotation offset' },
  { keys: 'Ctrl + S', description: 'Save project file' },
  { keys: '?', description: 'Show this help' }
]

function ShortcutsModal({ open, onOpenChange, onCloseAutoFocus }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bf-overlay bf-help-overlay" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={onCloseAutoFocus}
          className="bf-dialog bf-help-dialog"
        >
          <div className="bf-dialog-header">
            <Dialog.Title>Keyboard Shortcuts</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="bf-button bf-button--secondary">
                Close
              </button>
            </Dialog.Close>
          </div>
          <div className="bf-help-body">
            <table className="w-full text-xs">
              <tbody>
                {SHORTCUTS.map(({ keys, description }) => (
                  <tr key={keys} className="border-b border-zinc-800 last:border-0">
                    <td className="py-2 pr-4 font-mono text-[var(--bf-accent)]">{keys}</td>
                    <td className="py-2 text-zinc-300">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

ShortcutsModal.propTypes = { open: requiredBoolean, onOpenChange: requiredFunction, onCloseAutoFocus: optionalFunction }
export { ShortcutsModal }
