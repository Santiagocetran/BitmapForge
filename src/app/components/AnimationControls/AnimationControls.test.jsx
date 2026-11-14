import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { AnimationControls } from './AnimationControls.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'
import { FADE_VARIANT_KEYS, FADE_VARIANT_LABELS } from '../../../engine/effects/fadeVariants/index.js'

afterEach(cleanup)
beforeEach(() => useProjectStore.getState().resetToDefaults())

describe('Motion controls', () => {
  it('offers eight independent combinable effects rather than mutually exclusive choices', () => {
    render(<AnimationControls />)
    const effects = ['Spin X', 'Spin Y', 'Spin Z', 'Float', 'Bounce', 'Pulse', 'Shake', 'Orbit']
    expect(screen.getByRole('group', { name: 'Motion (combine any)' })).toBeDefined()
    for (const label of effects) {
      const control = screen.getByLabelText(label)
      if (!control.checked) fireEvent.click(control)
    }
    expect(Object.values(useProjectStore.getState().animationEffects)).toEqual(Array(8).fill(true))
    fireEvent.click(screen.getByLabelText('Shake'))
    expect(useProjectStore.getState().animationEffects).toMatchObject({ shake: false, spinX: true, orbit: true })
  })
  it('retains all native fade directions and registry styles with named radio groups', () => {
    useProjectStore.setState({ useFadeInOut: true })
    render(<AnimationControls />)
    expect(screen.getByRole('group', { name: 'Fade direction' })).toBeDefined()
    expect(screen.getByRole('group', { name: 'Fade style' })).toBeDefined()
    for (const [label, id] of [
      ['Both', 'both'],
      ['Fade in only', 'in'],
      ['Fade out only', 'out']
    ]) {
      fireEvent.click(screen.getByLabelText(label))
      expect(useProjectStore.getState().fadeMode).toBe(id)
    }
    for (const id of FADE_VARIANT_KEYS) {
      fireEvent.click(screen.getByLabelText(FADE_VARIANT_LABELS[id]))
      expect(useProjectStore.getState().fadeVariant).toBe(id)
    }
    expect(screen.getAllByRole('radio').filter((node) => node.checked)).toHaveLength(2)
  })
  it('preserves speed units and both timing ranges/setters, including hidden values', () => {
    useProjectStore.setState({ useFadeInOut: true })
    render(<AnimationControls />)
    for (const [name, min, max, step, value, key] of [
      [/Speed:.*rad\/s/, '0.05', '2', '0.01', '1.25', 'animationSpeed'],
      [/Fade duration:.*ms/, '300', '8000', '100', '3400', 'animationDuration'],
      [/Show duration:.*ms/, '1000', '40000', '500', '12500', 'showPhaseDuration']
    ]) {
      const control = screen.getByLabelText(name)
      expect([control.min, control.max, control.step]).toEqual([min, max, step])
      fireEvent.change(control, { target: { value } })
      expect(useProjectStore.getState()[key]).toBe(Number(value))
    }
    fireEvent.click(screen.getByRole('checkbox', { name: 'Fade in / out' }))
    expect(screen.queryByRole('group', { name: 'Fade direction' })).toBeNull()
    expect(screen.queryByRole('slider', { name: /Fade duration/ })).toBeNull()
    expect(screen.getByRole('slider', { name: /Speed:/ })).toBeDefined()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Fade in / out' }))
    expect(useProjectStore.getState()).toMatchObject({
      animationDuration: 3400,
      showPhaseDuration: 12500,
      animationSpeed: 1.25
    })
  })
})
