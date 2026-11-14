import { optionalFunction } from '../../utils/uiPropValidators.js'

/**
 * SchemaControls — renders form controls from a JSON Schema `properties` map.
 *
 * Used by QualitySettings to surface plugin-contributed parameters without
 * hand-crafting controls. Built-in renderer controls remain hand-crafted.
 *
 * Supported field types:
 *   type: 'boolean'               → <input type="checkbox">
 *   type: 'string', enum: [...]   → <select>
 *   type: 'integer' | 'number'    → <input type="range"> with value label
 *
 * @param {object} props
 * @param {object} props.schema     - JSON Schema `properties` map
 * @param {object} props.values     - current values (keyed by property name)
 * @param {(key: string, value: any) => void} props.onChange - called on each change
 */
function SchemaControls({ schema, values, onChange }) {
  if (!schema || !onChange) return null

  return (
    <>
      {Object.entries(schema).map(([key, field]) => {
        const value = values?.[key] ?? field.default
        const title = field.title ?? key

        if (field.type === 'boolean') {
          return (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!value} onChange={(e) => onChange(key, e.target.checked)} />
              {title}
            </label>
          )
        }

        if (field.type === 'string' && Array.isArray(field.enum)) {
          return (
            <label key={key} className="block text-sm">
              {title}
              <select
                className="mt-1 w-full rounded bg-zinc-800 p-1"
                value={value ?? ''}
                onChange={(e) => onChange(key, e.target.value)}
              >
                {field.enum.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          )
        }

        if (field.type === 'integer' || field.type === 'number') {
          const step = field.type === 'integer' ? 1 : 0.01
          return (
            <label key={key} className="block text-sm">
              {title}: {typeof value === 'number' ? value : field.default}
              <input
                type="range"
                min={field.minimum ?? 0}
                max={field.maximum ?? 100}
                step={step}
                value={value ?? field.default ?? 0}
                onChange={(e) => onChange(key, Number(e.target.value))}
                className="w-full"
              />
            </label>
          )
        }

        return null
      })}
    </>
  )
}

// Validate only descriptor members consumed by these controls, not JSON Schema.
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const implemented = (type) => ['boolean', 'string', 'integer', 'number'].includes(type)
function matchesType(value, type) {
  if (type === 'integer') return Number.isInteger(value)
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value)
  return typeof value === type
}
function schemaContract(props, name, component = 'SchemaControls') {
  const schema = props[name]
  const fail = (detail) => new Error(`${component}.${name} ${detail}`)
  if (schema == null) return null
  if (!isRecord(schema)) return fail('must be a properties record')
  for (const [key, field] of Object.entries(schema)) {
    if (!isRecord(field)) return fail(`${key} must be a descriptor record`)
    if (field.type != null && typeof field.type !== 'string') return fail(`${key}.type must be a string`)
    if (!implemented(field.type)) continue
    if (field.title != null && typeof field.title !== 'string') return fail(`${key}.title must be a string`)
    if (field.default != null && !matchesType(field.default, field.type))
      return fail(`${key}.default must match ${field.type}`)
    if (field.type === 'integer' || field.type === 'number') {
      for (const bound of ['minimum', 'maximum']) {
        if (field[bound] != null && (typeof field[bound] !== 'number' || !Number.isFinite(field[bound])))
          return fail(`${key}.${bound} must be finite`)
      }
    }
    if (
      field.type === 'string' &&
      field.enum != null &&
      (!Array.isArray(field.enum) || !field.enum.every((entry) => typeof entry === 'string'))
    )
      return fail(`${key}.enum must be a string array`)
  }
  return null
}
function valuesContract(props, name, component = 'SchemaControls') {
  const values = props[name]
  if (values == null) return null
  if (!isRecord(values)) return new Error(`${component}.${name} must be a values record`)
  const siblingError = schemaContract(props, 'schema', component)
  if (siblingError) return new Error(`${component}.${name} requires valid schema: ${siblingError.message}`)
  for (const [key, field] of Object.entries(props.schema ?? {})) {
    if (implemented(field.type) && values[key] != null && !matchesType(values[key], field.type))
      return new Error(`${component}.${name}.${key} must match ${field.type}`)
  }
  return null
}
SchemaControls.propTypes = { schema: schemaContract, values: valuesContract, onChange: optionalFunction }

export { SchemaControls }
