// Browser-only fixture, loaded by palette.spec.js, never imported by the application.
import { createRoot } from 'react-dom/client'
import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ColorPalette } from './ColorPalette.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'
import '../../styles.css'

window.paletteStore = useProjectStore
useProjectStore.getState().setColors(['#111111', '#222222', '#111111'])
function Harness() {
  const interactionRef = useRef(null)
  const [host, setHost] = useState(null)
  const [modal, setModal] = useState(false)
  const [shown, setShown] = useState(true)
  const palette = <ColorPalette interactionRef={interactionRef} portalContainer={host ?? undefined} />
  return (
    <div style={{ width: '100%', maxWidth: 320, padding: 12, boxSizing: 'border-box' }}>
      <button
        onClick={() => {
          interactionRef.current?.cancel({ restoreFocus: false })
          setShown(!shown)
        }}
      >
        Toggle palette
      </button>
      <button onClick={() => setModal(true)}>Open modal</button>
      {!modal && shown && palette}
      <Dialog.Root
        open={modal}
        onOpenChange={(next) => {
          interactionRef.current?.cancel({ restoreFocus: false })
          setModal(next)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed inset-y-0 left-0 w-full max-w-80 overflow-auto bg-zinc-950 p-3 text-white">
            <Dialog.Title>Fixture settings</Dialog.Title>
            <Dialog.Description>Palette modal integration fixture</Dialog.Description>
            <Dialog.Close>Close modal</Dialog.Close>
            {palette}
            <div ref={setHost} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <button>Outside destination</button>
    </div>
  )
}
createRoot(document.getElementById('root')).render(<Harness />)
