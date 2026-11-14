import { isValidElement } from 'react'

// Callable metadata for static contracts and direct tests. React 19 does not
// automatically invoke function-component propTypes.
function contract(description, accepts, required = false) {
  return (props, name, component = 'Component') => {
    const value = props[name]
    if (value == null && !required) return null
    return accepts(value, props) ? null : new Error(`${component}.${name} must be ${description}`)
  }
}
export const navigationRef = contract('a mutable ref with a nullable source focus handle', (v) =>
  refObject(
    v,
    (current) => current === null || (typeof current === 'object' && typeof current.focusSource === 'function')
  )
)
export const qualityPart = contract('all, renderer or refinements', (v) =>
  ['all', 'renderer', 'refinements'].includes(v)
)
export const sourceKind = contract(
  'model, shape, text or image',
  (v) => ['model', 'shape', 'text', 'image'].includes(v),
  true
)
export const optionalBoolean = contract('a boolean when supplied', (v) => typeof v === 'boolean')
export const requiredBoolean = contract('a boolean', (v) => typeof v === 'boolean', true)
export const optionalString = contract('a string when supplied', (v) => typeof v === 'string')
export const requiredString = contract('a string', (v) => typeof v === 'string', true)
export const optionalFunction = contract('a function when supplied', (v) => typeof v === 'function')
export const requiredFunction = contract('a function', (v) => typeof v === 'function', true)
function renderable(value) {
  if (value == null || ['string', 'number', 'bigint', 'boolean'].includes(typeof value)) return true
  if (isValidElement(value)) return true
  return Array.isArray(value) && value.every(renderable)
}
export const renderableChildren = contract('renderable children', renderable)
function refObject(value, acceptsCurrent) {
  return typeof value === 'object' && value !== null && 'current' in value && acceptsCurrent(value.current)
}
export const headingRef = contract(
  'a callback or mutable node ref',
  (v) => typeof v === 'function' || refObject(v, (current) => current === null || current instanceof Element)
)
export const bridgeRef = contract('a mutable ref with a nullable complete bridge', (v) =>
  refObject(
    v,
    (current) =>
      current === null ||
      (current !== null &&
        typeof current === 'object' &&
        ['saveProject', 'beforeHelp', 'restoreHelpFocus'].every((key) => typeof current[key] === 'function'))
  )
)
export const interactionRef = contract('a mutable ref with a nullable cancel handle', (v) =>
  refObject(
    v,
    (current) =>
      current === null ||
      (current !== null &&
        typeof current === 'object' &&
        typeof current.cancel === 'function' &&
        (current.isKeyboardDragging == null || typeof current.isKeyboardDragging === 'function'))
  )
)
export const exportFormat = contract(
  'a supported export format',
  (v) => ['apng', 'gif', 'webm', 'spritesheet', 'css', 'react', 'webcomponent', 'embed', 'zip'].includes(v),
  true
)
export function cancelExport(props, name, component = 'ExportPanel') {
  if (props[name] == null && !props.exporting) return null
  return requiredFunction(props, name, component)
}
