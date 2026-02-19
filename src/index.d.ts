export type DitherType = 'bayer4x4' | 'bayer8x8' | 'variableDot'

export interface EffectOptions {
  pixelSize?: number
  ditherType?: DitherType
  colors?: string[]
  backgroundColor?: string
  invert?: boolean
  minBrightness?: number
  animationDuration?: number
}

export interface StartModelAnimationOptions {
  container?: HTMLElement
  modelUrl: string
  effectOptions?: EffectOptions
  showPhaseDuration?: number
}

export interface AnimationController {
  resize: (width?: number, height?: number) => void
  dispose: () => void
}

export declare function startModelAnimation(
  options: StartModelAnimationOptions
): AnimationController

export declare class BitmapEffect {
  constructor(renderer: any, options?: EffectOptions)
  domElement: HTMLDivElement
  setSize(width: number, height: number): void
  render(scene: any, camera: any): void
  startAnimation(phase?: 'fadeIn' | 'show' | 'fadeOut'): void
  isAnimationComplete(): boolean
  getAnimationPhase(): 'fadeIn' | 'show' | 'fadeOut'
  setAnimationPhase(phase: 'fadeIn' | 'show' | 'fadeOut'): void
}
