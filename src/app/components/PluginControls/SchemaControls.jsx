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

export { SchemaControls }
