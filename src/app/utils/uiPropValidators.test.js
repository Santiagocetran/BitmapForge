import { describe, it, expect } from 'vitest'
import { createElement, Fragment } from 'react'
import * as c from './uiPropValidators.js'
import { ExportPanel } from '../components/ExportPanel/ExportPanel.jsx'
import { ProjectActions } from '../components/Layout/ProjectActions.jsx'
import { QualitySettings } from '../components/QualitySettings/QualitySettings.jsx'
import { ShortcutsModal } from '../components/ui/ShortcutsModal.jsx'
import { Layout } from '../components/Layout/Layout.jsx'
import { StatusNotice } from '../components/ui/StatusNotice.jsx'

function check(validator, value, rest = {}) {
  return validator({ value, ...rest }, 'value', 'ContractTest')
}
describe('callable UI contracts (React 19 does not invoke these automatically)', () => {
  it.each([
    ['requiredString', ['title', ''], [undefined, null, false, {}, 4]],
    ['optionalString', ['reason', '', undefined, null], [true, 4, {}]],
    ['requiredBoolean', [true, false], [undefined, null, 'false', 0, {}]],
    ['optionalBoolean', [true, false, undefined, null], ['true', 1, {}]],
    ['requiredFunction', [() => {}], [undefined, null, true, {}, 'function']],
    ['optionalFunction', [() => {}, undefined, null], [true, {}, 'function']]
  ])('%s accepts its concrete type and rejects wrong/missing values', (name, valid, invalid) => {
    for (const value of valid) expect(check(c[name], value)).toBeNull()
    for (const value of invalid) {
      const error = check(c[name], value)
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain('ContractTest.value')
    }
  })
  it('validates the frozen source navigation and finite presentation contracts', () => {
    for (const value of [undefined, null, { current: null }, { current: { focusSource() {} } }])
      expect(check(c.navigationRef, value)).toBeNull()
    for (const value of [{}, { current: undefined }, { current: {} }, { current: { focusSource: true } }])
      expect(check(c.navigationRef, value)).toBeInstanceOf(Error)
    for (const value of [undefined, null, 'all', 'renderer', 'refinements'])
      expect(check(c.qualityPart, value)).toBeNull()
    for (const value of ['render', '', true, {}]) expect(check(c.qualityPart, value)).toBeInstanceOf(Error)
    for (const value of ['model', 'shape', 'text', 'image']) expect(check(c.sourceKind, value)).toBeNull()
    for (const value of [undefined, null, 'shapes', true, {}]) expect(check(c.sourceKind, value)).toBeInstanceOf(Error)
  })
  it('validates renderable children including fragments and nested arrays', () => {
    for (const value of [
      null,
      undefined,
      false,
      true,
      0,
      2n,
      'text',
      createElement('span'),
      createElement(Fragment, null, 'x'),
      ['x', [null, createElement('b')]]
    ]) {
      expect(check(c.renderableChildren, value)).toBeNull()
    }
    for (const value of [{}, () => {}, Symbol('x'), ['valid', [{ invalid: true }]], [Symbol('x')]]) {
      expect(check(c.renderableChildren, value)).toBeInstanceOf(Error)
    }
  })
  it('validates callback/node refs and rejects unsupported current values', () => {
    for (const value of [undefined, null, () => {}, { current: null }, { current: document.createElement('h3') }])
      expect(check(c.headingRef, value)).toBeNull()
    for (const value of [true, {}, { current: {} }, { current: () => {} }])
      expect(check(c.headingRef, value)).toBeInstanceOf(Error)
  })
  it('requires every bridge method and a real current slot', () => {
    const handle = { saveProject() {}, beforeHelp() {}, restoreHelpFocus() {} }
    for (const value of [undefined, null, { current: null }, { current: handle }])
      expect(check(c.bridgeRef, value)).toBeNull()
    for (const key of Object.keys(handle)) {
      const invalid = { ...handle, [key]: false }
      expect(check(c.bridgeRef, { current: invalid })).toBeInstanceOf(Error)
      delete invalid[key]
      expect(check(c.bridgeRef, { current: invalid })).toBeInstanceOf(Error)
    }
    for (const value of [() => {}, {}, { current: undefined }, { current: 'bridge' }])
      expect(check(c.bridgeRef, value)).toBeInstanceOf(Error)
  })
  it('requires cancel and validates the optional keyboard predicate', () => {
    for (const value of [
      undefined,
      null,
      { current: null },
      { current: { cancel() {} } },
      { current: { cancel() {}, isKeyboardDragging() {} } }
    ])
      expect(check(c.interactionRef, value)).toBeNull()
    for (const value of [
      {},
      { current: {} },
      { current: { cancel: true } },
      { current: { cancel() {}, isKeyboardDragging: true } }
    ])
      expect(check(c.interactionRef, value)).toBeInstanceOf(Error)
  })
  it.each(['apng', 'gif', 'webm', 'spritesheet', 'css', 'react', 'webcomponent', 'embed', 'zip'])(
    'accepts exactly supported export %s',
    (value) => {
      expect(check(ExportPanel.propTypes.selectedFormat, value)).toBeNull()
    }
  )
  it.each([undefined, null, '', 'png', 'APNG', 1, {}, true])('rejects unknown format %s', (value) => {
    expect(check(ExportPanel.propTypes.selectedFormat, value)).toBeInstanceOf(Error)
  })
  it.each(['onSelectFormat', 'exportSelected'])('requires callable ExportPanel.%s', (key) => {
    const validator = ExportPanel.propTypes[key]
    expect(validator({ [key]: () => {} }, key)).toBeNull()
    for (const value of [undefined, null, false, 'callback', {}])
      expect(validator({ [key]: value }, key)).toBeInstanceOf(Error)
  })
  it.each(['saveProject', 'loadProject'])('requires callable ProjectActions.%s', (key) => {
    const validator = ProjectActions.propTypes[key]
    expect(validator({ [key]: () => {} }, key)).toBeNull()
    for (const value of [undefined, null, false, 'callback', {}])
      expect(validator({ [key]: value }, key)).toBeInstanceOf(Error)
  })
  it('keeps project callback contracts out of the output-only ExportPanel', () => {
    expect(ExportPanel.propTypes).not.toHaveProperty('saveProject')
    expect(ExportPanel.propTypes).not.toHaveProperty('loadProject')
  })
  it('requires cancellation only while exporting, but never accepts a wrong supplied type', () => {
    for (const exporting of [undefined, false, true]) {
      expect(check(c.cancelExport, () => {}, { exporting })).toBeNull()
      expect(check(c.cancelExport, undefined, { exporting }) instanceof Error).toBe(exporting === true)
      expect(check(c.cancelExport, null, { exporting }) instanceof Error).toBe(exporting === true)
      expect(check(c.cancelExport, 'cancel', { exporting })).toBeInstanceOf(Error)
    }
    expect(ExportPanel.propTypes.cancelExport).toBe(c.cancelExport)
  })
  it('attaches concrete optional and ref contracts to production consumers', () => {
    expect(ExportPanel.propTypes.exporting).toBe(c.optionalBoolean)
    expect(ExportPanel.propTypes.disabledReason).toBe(c.optionalString)
    expect(QualitySettings.propTypes.advancedOpen).toBe(c.optionalBoolean)
    expect(QualitySettings.propTypes.onAdvancedOpenChange).toBe(c.optionalFunction)
    expect(ShortcutsModal.propTypes.onCloseAutoFocus).toBe(c.optionalFunction)
    expect(Layout.propTypes.bridgeRef).toBe(c.bridgeRef)
    expect(Layout.propTypes.helpOpen).toBe(c.optionalBoolean)
    expect(StatusNotice.propTypes.suspended).toBe(c.optionalBoolean)
  })
})
