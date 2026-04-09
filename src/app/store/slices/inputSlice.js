export const INPUT_DEFAULTS = {
  model: null,
  inputType: 'model',
  shapeType: 'cube',
  shapeParams: {},
  textContent: 'BitmapForge',
  fontSize: 0.8,
  extrudeDepth: 0.3,
  bevelEnabled: true,
  fontFamily: 'helvetiker',
  letterSpacing: 0,
  imageSource: null
}

export const createInputSlice = (set, _get) => ({
  ...INPUT_DEFAULTS,

  setModel: (file) => {
    if (!file) {
      set({ model: null })
      return
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    set({
      model: {
        file,
        name: file.name,
        size: file.size,
        format: extension
      }
    })
  },
  setInputType: (inputType) => set({ inputType }),
  setShapeType: (shapeType) => set({ shapeType, shapeParams: {} }),
  setShapeParam: (key, value) => set((state) => ({ shapeParams: { ...state.shapeParams, [key]: value } })),
  setTextContent: (textContent) => set({ textContent }),
  setFontSize: (fontSize) => set({ fontSize: Math.max(0.1, fontSize) }),
  setExtrudeDepth: (extrudeDepth) => set({ extrudeDepth: Math.max(0.05, extrudeDepth) }),
  setBevelEnabled: (bevelEnabled) => set({ bevelEnabled }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setLetterSpacing: (letterSpacing) => set({ letterSpacing }),
  resetTextConfig: () =>
    set({
      textContent: INPUT_DEFAULTS.textContent,
      fontSize: INPUT_DEFAULTS.fontSize,
      extrudeDepth: INPUT_DEFAULTS.extrudeDepth,
      bevelEnabled: INPUT_DEFAULTS.bevelEnabled,
      fontFamily: INPUT_DEFAULTS.fontFamily,
      letterSpacing: INPUT_DEFAULTS.letterSpacing
    }),
  setImageSource: (imageSource) => set({ imageSource })
})
