import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { SchemaControls } from './SchemaControls.jsx'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('SchemaControls — direct React 19 contracts', () => {
  const validate = (name, props) => SchemaControls.propTypes[name](props, name, 'SchemaControls')
  it('accepts nullish contracts, consumed-field types, unrelated keywords and skipped fields', () => {
    for (const schema of [
      undefined,
      null,
      {},
      { x: {} },
      { x: { type: 'unsupported', title: {}, default: {}, enum: 1 } },
      {
        b: { type: 'boolean', title: null, default: true, minimum: 'ignored', enum: {} },
        s: { type: 'string', title: '', default: 'a', enum: [], minimum: {} },
        n: { type: 'number', default: 1.5, minimum: null, maximum: 0, enum: {} },
        i: { type: 'integer', default: 2, minimum: 10, maximum: -1 },
        extra: { type: 'string', custom: {} }
      }
    ]) {
      expect(validate('schema', { schema })).toBeNull()
      expect(validate('values', { schema, values: { unknown: Symbol('unused') } })).toBeNull()
    }
    for (const values of [undefined, null, {}, { x: null }])
      expect(validate('values', { schema: { x: { type: 'integer', default: 2 } }, values })).toBeNull()
    for (const onChange of [undefined, null, () => {}]) expect(validate('onChange', { onChange })).toBeNull()
  })
  it.each([
    [],
    1,
    'schema',
    { x: null },
    { x: [] },
    { x: 1 },
    { x: { type: 1 } },
    { x: { type: 'boolean', title: 1 } },
    { x: { type: 'boolean', default: 0 } },
    { x: { type: 'string', default: 1 } },
    { x: { type: 'string', enum: 'x' } },
    { x: { type: 'string', enum: [1] } },
    { x: { type: 'integer', default: 1.5 } },
    { x: { type: 'number', default: Infinity } },
    { x: { type: 'number', minimum: '0' } },
    { x: { type: 'integer', maximum: NaN } }
  ])('rejects malformed descriptors without throwing %#', (schema) => {
    const error = validate('schema', { schema })
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('SchemaControls.schema')
    expect(() => validate('values', { schema, values: { unknown: 1 } })).not.toThrow()
    expect(validate('values', { schema, values: { unknown: 1 } })).toBeInstanceOf(Error)
  })
  it.each([
    ['boolean', false, 1],
    ['string', 'a', false],
    ['integer', 2, 2.5],
    ['number', 1.5, Infinity]
  ])('checks consumed %s values only', (type, good, bad) => {
    const schema = { x: { type }, ignored: { type: 'object' } }
    expect(validate('values', { schema, values: { x: good, ignored: () => {}, unknown: {} } })).toBeNull()
    const error = validate('values', { schema, values: { x: bad } })
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('SchemaControls.values.x')
  })
  it('rejects invalid record shapes and callbacks', () => {
    for (const values of [[], 1, 'values', () => {}]) expect(validate('values', { values })).toBeInstanceOf(Error)
    for (const onChange of [false, 1, 'callback', {}]) expect(validate('onChange', { onChange })).toBeInstanceOf(Error)
  })
  it.each([undefined, null, { x: null }])('keeps nullish values and title fallbacks %#', (values) => {
    render(
      <SchemaControls
        schema={{ x: { type: 'integer', title: null, default: 5 } }}
        values={values}
        onChange={() => {}}
      />
    )
    expect(screen.getByRole('slider').value).toBe('5')
    expect(screen.getByText('x: 5')).toBeDefined()
  })
  it('keeps omitted/null guards and unsupported/missing/no-enum fields empty', () => {
    const view = render(<SchemaControls />)
    expect(view.container.textContent).toBe('')
    view.rerender(<SchemaControls schema={{ x: {} }} />)
    expect(view.container.textContent).toBe('')
    view.rerender(
      <SchemaControls schema={{ x: {}, y: { type: 'unknown' }, z: { type: 'string' } }} onChange={() => {}} />
    )
    expect(view.container.textContent).toBe('')
  })
})

// ---------------------------------------------------------------------------
// boolean field
// ---------------------------------------------------------------------------

describe('SchemaControls — boolean field', () => {
  it('renders a checkbox for a boolean field', () => {
    render(
      <SchemaControls
        schema={{ enabled: { type: 'boolean', title: 'Enabled', default: false } }}
        values={{ enabled: false }}
        onChange={vi.fn()}
      />
    )
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDefined()
    expect(checkbox.type).toBe('checkbox')
  })

  it('reflects the current value in the checkbox checked state', () => {
    render(
      <SchemaControls
        schema={{ enabled: { type: 'boolean', title: 'Enabled', default: false } }}
        values={{ enabled: true }}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole('checkbox').checked).toBe(true)
  })

  it('calls onChange with boolean value on change', () => {
    const onChange = vi.fn()
    render(
      <SchemaControls
        schema={{ enabled: { type: 'boolean', title: 'Enabled', default: false } }}
        values={{ enabled: false }}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith('enabled', true)
  })
})

// ---------------------------------------------------------------------------
// string + enum field
// ---------------------------------------------------------------------------

describe('SchemaControls — string+enum field', () => {
  it('renders a <select> for a string field with enum', () => {
    render(
      <SchemaControls
        schema={{
          shape: { type: 'string', title: 'Shape', enum: ['circle', 'square', 'diamond'], default: 'circle' }
        }}
        values={{ shape: 'circle' }}
        onChange={vi.fn()}
      />
    )
    const select = screen.getByRole('combobox')
    expect(select).toBeDefined()
  })

  it('renders one <option> per enum value', () => {
    render(
      <SchemaControls
        schema={{
          shape: { type: 'string', title: 'Shape', enum: ['circle', 'square', 'diamond'], default: 'circle' }
        }}
        values={{ shape: 'circle' }}
        onChange={vi.fn()}
      />
    )
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options.map((o) => o.value)).toEqual(['circle', 'square', 'diamond'])
  })

  it('calls onChange with the selected string value', () => {
    const onChange = vi.fn()
    render(
      <SchemaControls
        schema={{
          shape: { type: 'string', title: 'Shape', enum: ['circle', 'square', 'diamond'], default: 'circle' }
        }}
        values={{ shape: 'circle' }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'diamond' } })
    expect(onChange).toHaveBeenCalledWith('shape', 'diamond')
  })
})

// ---------------------------------------------------------------------------
// integer / number field
// ---------------------------------------------------------------------------

describe('SchemaControls — integer / number field', () => {
  it('renders a range input for an integer field', () => {
    render(
      <SchemaControls
        schema={{ count: { type: 'integer', title: 'Count', minimum: 1, maximum: 10, default: 3 } }}
        values={{ count: 3 }}
        onChange={vi.fn()}
      />
    )
    const range = screen.getByRole('slider')
    expect(range).toBeDefined()
    expect(range.type).toBe('range')
  })

  it('renders a range input for a number field', () => {
    render(
      <SchemaControls
        schema={{ opacity: { type: 'number', title: 'Opacity', minimum: 0, maximum: 1, default: 0.5 } }}
        values={{ opacity: 0.5 }}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole('slider').type).toBe('range')
  })

  it('calls onChange with numeric value on range change', () => {
    const onChange = vi.fn()
    render(
      <SchemaControls
        schema={{ count: { type: 'integer', title: 'Count', minimum: 1, maximum: 10, default: 3 } }}
        values={{ count: 3 }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByRole('slider'), { target: { value: '7' } })
    expect(onChange).toHaveBeenCalledWith('count', 7)
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('SchemaControls — edge cases', () => {
  it('returns null when schema is missing', () => {
    const { container } = render(<SchemaControls schema={null} values={{}} onChange={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when onChange is missing', () => {
    const { container } = render(
      <SchemaControls
        schema={{ x: { type: 'boolean', title: 'X', default: false } }}
        values={{ x: false }}
        onChange={null}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('uses default value when key is missing from values', () => {
    render(
      <SchemaControls
        schema={{ count: { type: 'integer', title: 'Count', minimum: 0, maximum: 10, default: 5 } }}
        values={{}}
        onChange={vi.fn()}
      />
    )
    const slider = screen.getByRole('slider')
    expect(Number(slider.value)).toBe(5)
  })

  it('renders multiple fields from the schema', () => {
    render(
      <SchemaControls
        schema={{
          size: { type: 'integer', title: 'Size', minimum: 1, maximum: 20, default: 8 },
          enabled: { type: 'boolean', title: 'Enabled', default: true },
          mode: { type: 'string', title: 'Mode', enum: ['a', 'b'], default: 'a' }
        }}
        values={{ size: 8, enabled: true, mode: 'a' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole('slider')).toBeDefined()
    expect(screen.getByRole('checkbox')).toBeDefined()
    expect(screen.getByRole('combobox')).toBeDefined()
  })
})
