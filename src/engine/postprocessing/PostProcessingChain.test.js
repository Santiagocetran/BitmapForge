import { describe, it, expect, vi } from 'vitest'
import { PostProcessingChain } from './PostProcessingChain.js'

function makeEffect(id = 'test') {
  return { id, apply: vi.fn() }
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

describe('PostProcessingChain — construction', () => {
  it('starts with an empty effect list', () => {
    const chain = new PostProcessingChain()
    expect(chain._effects).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// addEffect / setEnabled
// ---------------------------------------------------------------------------

describe('PostProcessingChain — addEffect', () => {
  it('registers a new effect as enabled by default', () => {
    const chain = new PostProcessingChain()
    const eff = makeEffect('crt')
    chain.addEffect('crt', eff)
    expect(chain._effects).toHaveLength(1)
    expect(chain._effects[0].enabled).toBe(true)
  })

  it('stores the effect with the provided id', () => {
    const chain = new PostProcessingChain()
    const eff = makeEffect()
    chain.addEffect('bloom', eff)
    expect(chain._effects[0].id).toBe('bloom')
    expect(chain._effects[0].effect).toBe(eff)
  })

  it('multiple effects are stored in insertion order', () => {
    const chain = new PostProcessingChain()
    chain.addEffect('a', makeEffect('a'))
    chain.addEffect('b', makeEffect('b'))
    expect(chain._effects[0].id).toBe('a')
    expect(chain._effects[1].id).toBe('b')
  })
})

describe('PostProcessingChain — setEnabled', () => {
  it('disables an effect by id', () => {
    const chain = new PostProcessingChain()
    chain.addEffect('crt', makeEffect())
    chain.setEnabled('crt', false)
    expect(chain._effects[0].enabled).toBe(false)
  })

  it('re-enables a disabled effect', () => {
    const chain = new PostProcessingChain()
    chain.addEffect('crt', makeEffect())
    chain.setEnabled('crt', false)
    chain.setEnabled('crt', true)
    expect(chain._effects[0].enabled).toBe(true)
  })

  it('does nothing for unknown id', () => {
    const chain = new PostProcessingChain()
    chain.addEffect('crt', makeEffect())
    expect(() => chain.setEnabled('nonexistent', false)).not.toThrow()
    expect(chain._effects[0].enabled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// apply
// ---------------------------------------------------------------------------

describe('PostProcessingChain — apply', () => {
  it('calls apply on all enabled effects in order', () => {
    const chain = new PostProcessingChain()
    const calls = []
    const effA = { apply: vi.fn(() => calls.push('a')) }
    const effB = { apply: vi.fn(() => calls.push('b')) }
    chain.addEffect('a', effA)
    chain.addEffect('b', effB)
    const ctx = {}
    chain.apply(ctx, 100, 100, {})
    expect(effA.apply).toHaveBeenCalledWith(ctx, 100, 100, {})
    expect(effB.apply).toHaveBeenCalledWith(ctx, 100, 100, {})
    expect(calls).toEqual(['a', 'b'])
  })

  it('skips disabled effects', () => {
    const chain = new PostProcessingChain()
    const eff = makeEffect()
    chain.addEffect('crt', eff)
    chain.setEnabled('crt', false)
    chain.apply({}, 100, 100, {})
    expect(eff.apply).not.toHaveBeenCalled()
  })

  it('returns early when ctx is null', () => {
    const chain = new PostProcessingChain()
    const eff = makeEffect()
    chain.addEffect('crt', eff)
    expect(() => chain.apply(null, 100, 100, {})).not.toThrow()
    expect(eff.apply).not.toHaveBeenCalled()
  })

  it('passes params object through to each effect', () => {
    const chain = new PostProcessingChain()
    const eff = makeEffect()
    chain.addEffect('crt', eff)
    const params = { scanlineGap: 4, crtVignette: 0.3 }
    chain.apply({}, 200, 150, params)
    expect(eff.apply).toHaveBeenCalledWith({}, 200, 150, params)
  })
})
