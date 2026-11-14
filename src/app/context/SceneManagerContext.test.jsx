import { it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { SceneManagerProvider, useSceneManager } from './SceneManagerContext.jsx'
import { useLayoutEffect } from 'react'
import { requiredFunction } from '../utils/uiPropValidators.js'
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('directly validates the supported node contract under React 19', () => {
  const validate = SceneManagerProvider.propTypes.children
  expect(typeof validate).toBe('function')
  for (const value of [
    undefined,
    null,
    false,
    true,
    '',
    'text',
    2,
    3n,
    <span key="s" />,
    <>fragment</>,
    ['a', [null, <b key="b" />]]
  ]) {
    expect(validate({ children: value }, 'children', 'SceneManagerProvider')).toBeNull()
  }
  for (const value of [{}, () => {}, Symbol('bad'), ['ok', [{}]]]) {
    const error = validate({ children: value }, 'children', 'SceneManagerProvider')
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('SceneManagerProvider.children')
  }
})

function Observer({ observe }) {
  const ref = useSceneManager()
  useLayoutEffect(() => {
    observe(ref)
  })
  return null
}
Observer.propTypes = { observe: requiredFunction }
it('preserves a nullable stable ref, assignment, and provider isolation', () => {
  const first = vi.fn(),
    second = vi.fn()
  const tree = () => (
    <>
      <SceneManagerProvider>
        <Observer observe={first} />
      </SceneManagerProvider>
      <SceneManagerProvider>
        <Observer observe={second} />
      </SceneManagerProvider>
    </>
  )
  const view = render(tree())
  const ref = first.mock.calls[0][0]
  expect(ref.current).toBeNull()
  expect(second.mock.calls[0][0]).not.toBe(ref)
  const scene = { identity: 'test' }
  ref.current = scene
  view.rerender(tree())
  expect(first.mock.lastCall[0]).toBe(ref)
  expect(first.mock.lastCall[0].current).toBe(scene)
  view.rerender(<SceneManagerProvider />)
  expect(view.container.textContent).toBe('')
  view.rerender(<SceneManagerProvider>{null}</SceneManagerProvider>)
  expect(view.container.textContent).toBe('')
})
it('still rejects a consumer outside the provider', () => {
  expect(() => render(<Observer observe={() => {}} />)).toThrow(
    'useSceneManager must be used within a SceneManagerProvider'
  )
})
