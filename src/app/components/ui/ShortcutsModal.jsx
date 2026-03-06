import * as Dialog from '@radix-ui/react-dialog'

const SHORTCUTS = [
  { keys: 'Ctrl + Z', description: 'Undo' },
  { keys: 'Ctrl + Shift + Z', description: 'Redo' },
  { keys: 'R', description: 'Reset rotation offset' },
  { keys: 'Ctrl + S', description: 'Save project file' },
  { keys: '?', description: 'Show this help' }
]

function ShortcutsModal({ open, onOpenChange }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
          <Dialog.Title className="mb-4 text-sm font-semibold text-zinc-100">Keyboard Shortcuts</Dialog.Title>
          <table className="w-full text-xs">
            <tbody>
              {SHORTCUTS.map(({ keys, description }) => (
                <tr key={keys} className="border-b border-zinc-800 last:border-0">
                  <td className="py-2 pr-4 font-mono text-emerald-400">{keys}</td>
                  <td className="py-2 text-zinc-300">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Dialog.Close asChild>
            <button type="button" className="mt-4 w-full rounded bg-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-600">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export { ShortcutsModal }
