const ANIMATION_PRESETS = {
  spinY: { key: 'spinY', type: 'spin', axis: 'y', defaultSpeed: 0.36 },
  spinX: { key: 'spinX', type: 'spin', axis: 'x', defaultSpeed: 0.36 },
  spinZ: { key: 'spinZ', type: 'spin', axis: 'z', defaultSpeed: 0.36 },
  float: {
    key: 'float',
    type: 'float',
    defaultSpeed: 0.36,
    oscillateX: 0.15,
    oscillateZ: 0.08
  },
  fadeInOut: {
    key: 'fadeInOut',
    type: 'fadeInOut',
    showDuration: 20000,
    animationDuration: 2500,
    rotateOnShow: false,
    showPreset: 'spinY'
  }
}

export { ANIMATION_PRESETS }
