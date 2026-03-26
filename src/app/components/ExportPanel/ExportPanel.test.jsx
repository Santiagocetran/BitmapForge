import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ExportPanel } from './ExportPanel.jsx'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../context/SceneManagerContext.jsx', () => ({
  useSceneManager: () => ({ current: null })
}))

const mockExportFns = {
  exportAs: vi.fn(async () => {}),
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
  it('renders all 9 format buttons', () => {
    renderPanel()
    const formatLabels = ['APNG', 'GIF', 'Video', 'Sprite Sheet', 'CSS Anim', 'React', 'Web Comp', 'Embed', 'Code ZIP']
    for (const label of formatLabels) {
      expect(screen.getByRole('button', { name: label })).toBeDefined()
    }
  })

  it('does not render removed formats', () => {
    renderPanel()
    expect(screen.queryByRole('button', { name: 'Lottie' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Single HTML' })).toBeNull()
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
  { label: 'APNG', formatId: 'apng' },
  { label: 'GIF', formatId: 'gif' },
  { label: 'Video', formatId: 'webm' },
  { label: 'Sprite Sheet', formatId: 'spritesheet' },
  { label: 'Code ZIP', formatId: 'zip' },
  { label: 'React', formatId: 'react' },
  { label: 'Web Comp', formatId: 'webcomponent' },
  { label: 'CSS Anim', formatId: 'css' },
  { label: 'Embed', formatId: 'embed' }
]

describe('ExportPanel — format routing', () => {
  beforeEach(() => {
    renderPanel()
  })

  for (const { label, formatId } of FORMAT_ROUTING) {
    it(`clicking "${label}" then Export calls exportAs('${formatId}')`, async () => {
      fireEvent.click(screen.getByRole('button', { name: label }))
      clickExportButton()
      // Settle async microtasks from the onClick handler
      await new Promise((r) => setTimeout(r, 0))
      expect(mockExportFns.exportAs).toHaveBeenCalledWith(formatId)
    })
  }
})
