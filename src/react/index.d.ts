import type { CSSProperties, ReactElement } from 'react'
import type { EffectOptions } from '../index'

export interface AsciiAnimationProps {
  modelUrl: string
  effectOptions?: EffectOptions
  className?: string
  style?: CSSProperties
}

export declare function AsciiAnimation(props: AsciiAnimationProps): ReactElement
