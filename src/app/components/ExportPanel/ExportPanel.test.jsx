import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ExportPanel } from './ExportPanel.jsx'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../context/SceneManagerContext.jsx', () => ({
  useSceneManager: () => ({ current: null })
}))

const mockExportFns = {
  exportApng: vi.fn(async () => {}),
  exportGif: vi.fn(async () => {}),
  exportVideo: vi.fn(async () => {}),
  exportSpriteSheet: vi.fn(async () => {}),
  exportSingleHtml: vi.fn(async () => {}),
  exportCodeZip: vi.fn(async () => {}),
  exportReactComponent: vi.fn(async () => {}),
  exportWebComponent: vi.fn(async () => {}),
  exportCssAnimation: vi.fn(async () => {}),
  exportLottie: vi.fn(async () => {}),
  saveProject: vi.fn(async () => {}),
  cancelExport: vi.fn()
}

vi.mock('../../hooks/useExport.js', () => ({
  useExport: vi.fn(() => mockExportFns)
}))

vi.mock('../../utils/projectFile.js', () => ({
  loadProjectFile: vi.fn()
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPanel() {
  return render(<ExportPanel />)
}

/**
 * Click the primary "Export <Format>" button (identified by the w-full class).
 */
function clickExportButton() {
  const exportBtn = screen.getAllByRole('button').find((b) => b.classList.contains('w-full'))
  fireEvent.click(exportBtn)
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// ─── Format buttons rendered ──────────────────────────────────────────────────

describe('ExportPanel — format buttons', () => {
  it('renders all 10 format buttons', () => {
    renderPanel()
    const formatLabels = [
      'APNG',
      'GIF',
      'Video',
      'Sprite Sheet',
      'Single HTML',
      'Code ZIP',
      'React',
      'Web Comp',
      'CSS Anim',
      'Lottie'
    ]
    for (const label of formatLabels) {
      expect(screen.getByRole('button', { name: label })).toBeDefined()
    }
  })
})

// ─── Default selection ────────────────────────────────────────────────────────

describe('ExportPanel — default state', () => {
  it('APNG is selected by default', () => {
    renderPanel()
    const exportBtn = screen.getAllByRole('button').find((b) => b.classList.contains('w-full'))
    expect(exportBtn.textContent).toContain('APNG')
  })
})

// ─── Format routing ───────────────────────────────────────────────────────────

const FORMAT_ROUTING = [
  { label: 'APNG', fn: 'exportApng' },
  { label: 'GIF', fn: 'exportGif' },
  { label: 'Video', fn: 'exportVideo' },
  { label: 'Sprite Sheet', fn: 'exportSpriteSheet' },
  { label: 'Single HTML', fn: 'exportSingleHtml' },
  { label: 'Code ZIP', fn: 'exportCodeZip' },
  { label: 'React', fn: 'exportReactComponent' },
  { label: 'Web Comp', fn: 'exportWebComponent' },
  { label: 'CSS Anim', fn: 'exportCssAnimation' },
  { label: 'Lottie', fn: 'exportLottie' }
]

describe('ExportPanel — format routing', () => {
  beforeEach(() => {
    renderPanel()
  })

  for (const { label, fn } of FORMAT_ROUTING) {
    it(`clicking "${label}" then Export calls ${fn}()`, async () => {
      fireEvent.click(screen.getByRole('button', { name: label }))
      clickExportButton()
      // Settle async microtasks from the onClick handler
      await new Promise((r) => setTimeout(r, 0))
      expect(mockExportFns[fn]).toHaveBeenCalledTimes(1)
    })
  }
})
