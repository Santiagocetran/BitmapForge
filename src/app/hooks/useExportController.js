import { useState, useEffect, useRef } from 'react'
import { useExport } from './useExport.js'
import { useSceneManager } from '../context/SceneManagerContext.jsx'
import { useProjectStore } from '../store/useProjectStore.js'
import { loadProjectFile } from '../utils/projectFile.js'

export function useExportController() {
  const manager = useSceneManager()
  const { exportAs, cancelExport, saveProject } = useExport(manager)
  const [selectedFormat, onSelectFormat] = useState('apng')
  const exporting = useProjectStore((s) => s.status.exporting)
  const inputType = useProjectStore((s) => s.inputType)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  async function loadProject(file) {
    if (!file) return
    const store = useProjectStore.getState()
    if (store.model && !window.confirm('Loading a project will replace your current settings and model. Continue?'))
      return
    store.setStatus({ message: '', error: '' })
    try {
      const { settings, modelFile } = await loadProjectFile(file)
      if (!alive.current) return
      useProjectStore.setState(settings)
      if (modelFile) store.setModel(modelFile)
      store.setStatus({ message: 'Project loaded.', error: '' })
    } catch (error) {
      if (alive.current) store.setStatus({ message: '', error: error.message })
    }
  }
  const disabledReason =
    selectedFormat === 'embed' && inputType === 'image'
      ? 'Image input cannot be embedded — switch to model, shape, or text.'
      : ''
  return {
    selectedFormat,
    onSelectFormat,
    exportSelected: () => exportAs(selectedFormat),
    cancelExport,
    saveProject,
    loadProject,
    exporting,
    disabledReason
  }
}
