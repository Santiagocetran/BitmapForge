import { useState, useEffect } from 'react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { Layout } from './components/Layout/Layout.jsx'
import { useAutoSave } from './hooks/useAutoSave.js'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js'
import { ShortcutsModal } from './components/ui/ShortcutsModal.jsx'
import { SceneManagerProvider } from './context/SceneManagerContext.jsx'

function App() {
  useAutoSave()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  useKeyboardShortcuts({ onShowHelp: () => setShortcutsOpen(true) })

  useEffect(() => {
    document.title = 'BitmapForge'
  }, [])

  return (
    <SceneManagerProvider>
      <TooltipProvider delayDuration={400}>
        <Layout />
        <ShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      </TooltipProvider>
    </SceneManagerProvider>
  )
}

export { App }
