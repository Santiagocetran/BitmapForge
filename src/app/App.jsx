import { useState, useEffect, useRef } from 'react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { Layout } from './components/Layout/Layout.jsx'
import { useAutoSave } from './hooks/useAutoSave.js'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js'
import { ShortcutsModal } from './components/ui/ShortcutsModal.jsx'
import { SceneManagerProvider } from './context/SceneManagerContext.jsx'
import { registerBuiltins } from '../engine/plugins/builtinPlugins.js'

// Register all built-in renderers and post-effects with the plugin registry.
// Must run before any engine instantiation so createRenderer() can resolve all modes.
registerBuiltins()

function App() {
  useAutoSave()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const bridgeRef = useRef(null)
  const showHelp = () => {
    bridgeRef.current?.beforeHelp()
    setShortcutsOpen(true)
  }
  useKeyboardShortcuts({
    onShowHelp: showHelp,
    onSaveProject: () => bridgeRef.current?.saveProject()
  })

  useEffect(() => {
    document.title = 'BitmapForge'
  }, [])

  return (
    <SceneManagerProvider>
      <TooltipProvider delayDuration={400}>
        <Layout bridgeRef={bridgeRef} helpOpen={shortcutsOpen} onShowHelp={showHelp} />
        <ShortcutsModal
          open={shortcutsOpen}
          onOpenChange={setShortcutsOpen}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            bridgeRef.current?.restoreHelpFocus()
          }}
        />
      </TooltipProvider>
    </SceneManagerProvider>
  )
}

export { App }
