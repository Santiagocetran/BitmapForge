import { describe, it, expect } from 'vitest'
import { buildSingleHtml } from './singleHtmlExport.js'

// test/setup.js stubs HTMLCanvasElement.prototype.toDataURL to return a
// minimal base64 PNG data URI, so buildSingleHtml can run without a real canvas.

function makeMockFrame(w = 8, h = 8) {
  return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }
}

async function getHtml(frames, fps = 16, bg = '#000000') {
  const blob = await buildSingleHtml(frames, fps, bg)
  return blob.text()
}

// ─── Return type ──────────────────────────────────────────────────────────────

describe('buildSingleHtml — return value', () => {
  it('returns a Blob', async () => {
    const blob = await buildSingleHtml([makeMockFrame()], 16)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('Blob has text/html MIME type', async () => {
    const blob = await buildSingleHtml([makeMockFrame()], 16)
    expect(blob.type).toBe('text/html')
  })
})

// ─── Valid HTML structure ─────────────────────────────────────────────────────

describe('buildSingleHtml — HTML structure', () => {
  it('contains DOCTYPE declaration', async () => {
    const html = await getHtml([makeMockFrame()])
    expect(html.toLowerCase()).toContain('<!doctype html>')
  })

  it('contains a canvas element', async () => {
    const html = await getHtml([makeMockFrame()])
    expect(html).toContain('<canvas')
  })

  it('contains a script block', async () => {
    const html = await getHtml([makeMockFrame()])
    expect(html).toContain('<script>')
  })
})

// ─── Embedded frame payload ───────────────────────────────────────────────────

describe('buildSingleHtml — frame embedding', () => {
  it('contains embedded frames as data URIs', async () => {
    const html = await getHtml([makeMockFrame()])
    expect(html).toContain('data:image/png;base64,')
  })

  it('embeds all provided frames', async () => {
    const html = await getHtml([makeMockFrame(), makeMockFrame(), makeMockFrame()])
    // The frames array is JSON-stringified; count occurrences of data: prefix
    const matches = html.match(/data:image\/png;base64,/g) ?? []
    expect(matches.length).toBe(3)
  })
})

// ─── Width / height / fps injection ──────────────────────────────────────────

describe('buildSingleHtml — metadata injection', () => {
  it('injects the correct canvas width', async () => {
    const html = await getHtml([makeMockFrame(32, 16)])
    expect(html).toContain('canvas.width = 32')
  })

  it('injects the correct canvas height', async () => {
    const html = await getHtml([makeMockFrame(32, 16)])
    expect(html).toContain('canvas.height = 16')
  })

  it('injects the correct fps value', async () => {
    const html = await getHtml([makeMockFrame()], 24)
    expect(html).toContain('fps = 24')
  })

  it('injects the background color', async () => {
    const html = await getHtml([makeMockFrame()], 16, '#ff0044')
    expect(html).toContain('#ff0044')
  })
})

// ─── Self-containment ─────────────────────────────────────────────────────────

describe('buildSingleHtml — self-containment', () => {
  it('contains no external http/https URLs', async () => {
    const html = await getHtml([makeMockFrame(), makeMockFrame()])
    expect(html).not.toMatch(/https?:\/\//)
  })

  it('uses requestAnimationFrame for the playback loop', async () => {
    const html = await getHtml([makeMockFrame()])
    expect(html).toContain('requestAnimationFrame')
  })
})
