const BUILT_IN_PRESETS = [
  {
    id: 'gameboy',
    name: 'Game Boy',
    category: 'retro',
    settings: {
      colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
      pixelSize: 8,
      ditherType: 'bayer4x4',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#0f380f'
    }
  },
  {
    id: 'gameboy-pocket',
    name: 'GB Pocket',
    category: 'retro',
    settings: {
      colors: ['#1a1c2c', '#3d3e5e', '#8b8ba7', '#c0c0c8'],
      pixelSize: 8,
      ditherType: 'bayer4x4',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#1a1c2c'
    }
  },
  {
    id: 'terminal',
    name: 'Terminal',
    category: 'digital',
    settings: {
      colors: ['#001100', '#003300', '#00aa00', '#00ff00'],
      pixelSize: 4,
      ditherType: 'bayer8x8',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#001100'
    }
  },
  {
    id: 'amber',
    name: 'Amber',
    category: 'retro',
    settings: {
      colors: ['#1a0a00', '#6b2e00', '#cc6600', '#ffcc44'],
      pixelSize: 4,
      ditherType: 'bayer4x4',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#1a0a00'
    }
  },
  {
    id: 'newspaper',
    name: 'Newspaper',
    category: 'print',
    settings: {
      colors: ['#111111', '#666666', '#cccccc', '#f5f5f5'],
      pixelSize: 3,
      ditherType: 'floydSteinberg',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#f5f5f5'
    }
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    category: 'print',
    settings: {
      colors: ['#0a1628', '#0d2e5c', '#1565c0', '#82b1e0', '#e3f2fd'],
      pixelSize: 3,
      ditherType: 'bayer8x8',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#0a1628'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    category: 'neon',
    settings: {
      colors: ['#050014', '#1a1040', '#ff00a8', '#00f5ff'],
      pixelSize: 4,
      ditherType: 'bayer8x8',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#050014'
    }
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    category: 'neon',
    settings: {
      colors: ['#0d0221', '#6b2fa0', '#ff71ce', '#b5f2ff'],
      pixelSize: 5,
      ditherType: 'variableDot',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#0d0221'
    }
  },
  {
    id: 'lava',
    name: 'Lava',
    category: 'neon',
    settings: {
      colors: ['#0a0000', '#3d0000', '#c0392b', '#ff6b35', '#ffd700'],
      pixelSize: 4,
      ditherType: 'variableDot',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#0a0000'
    }
  },
  {
    id: 'mono',
    name: 'Mono',
    category: 'minimal',
    settings: {
      colors: ['#111111', '#555555', '#aaaaaa', '#f2f2f2'],
      pixelSize: 3,
      ditherType: 'atkinson',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#111111'
    }
  },
  {
    id: 'arctic',
    name: 'Arctic',
    category: 'minimal',
    settings: {
      colors: ['#1a3a4a', '#4a90a4', '#9dc5d4', '#e8f4f8'],
      pixelSize: 4,
      ditherType: 'bayer4x4',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#e8f4f8'
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    category: 'retro',
    settings: {
      colors: ['#021a15', '#074434', '#1a6b4a', '#ABC685', '#E8FF99'],
      pixelSize: 3,
      ditherType: 'bayer4x4',
      invert: false,
      minBrightness: 0.05,
      backgroundColor: '#021a15'
    }
  }
]

export { BUILT_IN_PRESETS }
