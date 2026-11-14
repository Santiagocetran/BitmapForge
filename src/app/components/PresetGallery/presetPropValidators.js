// Holes intentionally follow native slice/map semantics; explicit undefined fails.
export function requiredColorStrings(props, name, component = 'ColorSwatches') {
  const colors = props[name]
  return Array.isArray(colors) && colors.every((color) => typeof color === 'string')
    ? null
    : new Error(`${component}.${name} must be an array of color strings`)
}
