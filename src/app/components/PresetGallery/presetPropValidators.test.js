import { it, expect } from 'vitest'
import { requiredColorStrings } from './presetPropValidators.js'
it('validates actual string arrays, preserving CSS colors, length and sparse semantics', () => {
  for (const colors of [[], ['red'], ['red', '#fff', 'rgb(1, 2, 3)', 'transparent', 'blue', 'green'], new Array(3)])
    expect(requiredColorStrings({ colors }, 'colors', 'ColorSwatches')).toBeNull()
  for (const colors of [undefined, null, 'red', { slice() {} }, [1], [undefined], ['red', null]]) {
    const error = requiredColorStrings({ colors }, 'colors', 'ColorSwatches')
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('ColorSwatches.colors')
  }
})
