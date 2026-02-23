const PROJECT_VERSION = 1

function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    const subArray = bytes.subarray(i, i + chunk)
    binary += String.fromCharCode(...subArray)
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

async function buildProjectPayload(state) {
  const payload = {
    version: PROJECT_VERSION,
    createdAt: new Date().toISOString(),
    settings: {
      colors: state.colors,
      pixelSize: state.pixelSize,
      ditherType: state.ditherType,
      invert: state.invert,
      minBrightness: state.minBrightness,
      backgroundColor: state.backgroundColor,
      animationPreset: state.animationPreset,
      animationSpeed: state.animationSpeed,
      showPhaseDuration: state.showPhaseDuration,
      animationDuration: state.animationDuration,
      rotateOnShow: state.rotateOnShow,
      showPreset: state.showPreset,
      lightDirection: state.lightDirection
    },
    model: null
  }

  if (state.model?.file) {
    const buffer = await state.model.file.arrayBuffer()
    payload.model = {
      name: state.model.name,
      type: state.model.file.type || 'application/octet-stream',
      format: state.model.format,
      data: arrayBufferToBase64(buffer)
    }
  }

  return payload
}

async function saveProjectFile(state) {
  const payload = await buildProjectPayload(state)
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `bitmapforge-${Date.now()}.bitmapforge`
  anchor.click()
  URL.revokeObjectURL(url)
}

async function loadProjectFile(file) {
  const raw = await file.text()
  const project = JSON.parse(raw)
  if (!project.settings) {
    throw new Error('Invalid .bitmapforge file: missing settings')
  }

  let modelFile = null
  if (project.model?.data) {
    const buffer = base64ToArrayBuffer(project.model.data)
    modelFile = new File([buffer], project.model.name || `model.${project.model.format ?? 'stl'}`, {
      type: project.model.type || 'application/octet-stream'
    })
  }

  return { settings: project.settings, modelFile }
}

export { saveProjectFile, loadProjectFile }
