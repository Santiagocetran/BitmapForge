import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import { LightDirection } from './LightDirection.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'

beforeEach(() => useProjectStore.getState().resetToDefaults())
afterEach(cleanup)
describe('Light direction spatial choices', () => {
  it('preserves all nine exact vectors, native pressed semantics and noncolor markers', () => {
    render(<LightDirection />)
    const group = screen.getByRole('group', { name: 'Light direction' })
    const choices = within(group).getAllByRole('button')
    expect(choices).toHaveLength(9)
    const directions = [
      ['North west', -3, 4, 5],
      ['North', 0, 5, 5],
      ['North east', 3, 4, 5],
      ['West', -5, 2, 3],
      ['Center', 0, 3, 5],
      ['East', 5, 2, 3],
      ['South west', -3, 1, -4],
      ['South', 0, 1, -5],
      ['South east', 3, 1, -4]
    ]
    expect(choices.map((node) => node.getAttribute('aria-label'))).toEqual(directions.map(([name]) => name))
    for (const [name, x, y, z] of directions) {
      const choice = choices.find((node) => node.getAttribute('aria-label') === name)
      fireEvent.click(choice)
      expect(useProjectStore.getState().lightDirection).toEqual({ x, y, z })
      expect(choices.filter((node) => node.getAttribute('aria-pressed') === 'true')).toEqual([choice])
      expect(choice.querySelector('[aria-hidden="true"]').textContent).toContain('✓')
    }
  })
})
