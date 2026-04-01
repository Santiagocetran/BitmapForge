export const STATUS_DEFAULTS = {
  status: { loading: false, error: '', exporting: false, message: '', progress: 0 },
  pluginParams: {}
}

export const createStatusSlice = (set, get) => ({
  ...STATUS_DEFAULTS,

  setStatus: (partialStatus) => {
    set({ status: { ...get().status, ...partialStatus } })
  },
  setPluginParam: (key, value) => set((state) => ({ pluginParams: { ...state.pluginParams, [key]: value } }))
})
