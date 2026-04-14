# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is BitmapForge

BitmapForge is a client-side web app that converts 3D models (STL, OBJ, GLTF/GLB) into bitmap/dithered animations. Users upload a model, configure rendering settings (pixel size, dithering, color palette), choose animation presets, and export as GIF, video, sprite sheet, or code. No backend — everything runs in the browser.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build to `dist/` (also builds embed SDK first via `prebuild`)
- `npm run build:embed` — Build embed SDK → copies to `public/embed/`
- `npm run preview` — Preview production build
- `npm test` — Run all tests (Vitest)
- `npm run test:watch` — Run tests in watch mode
- `npm run test:e2e` — Run Playwright E2E tests
- `npm run coverage` — Generate coverage report
- `npm run lint` — Check for ESLint errors
- `npm run lint:fix` — Auto-fix ESLint errors
- `npm run format` — Prettier format all files
- `npm run format:check` — Check Prettier formatting

**Tooling:** ESLint + Prettier for code style, Vitest for unit/integration tests, Playwright for E2E. Pre-commit hooks (husky + lint-staged) run lint + format on staged files automatically.

## Architecture

### Two-layer structure: `src/engine/` and `src/app/`

**`src/engine/`** — Framework-agnostic rendering engine (vanilla JS, no React):

- `SceneManager.js` — Orchestrates Three.js scene, camera, lights, renderer, and the BitmapEffect. Entry point for the engine. Manages model loading, animation loop, and settings updates.
- `effects/BaseEffect.js` — Shared logic: particle system, easing, color interpolation, brightness calculation.
- `effects/BitmapEffect.js` — Core visual engine. Reads WebGL pixels → calculates brightness per grid cell → applies dithering → maps brightness to colors → draws to visible canvas.
- `loaders/modelLoader.js` — Unified loader that auto-detects format by extension (STL/OBJ/GLTF/GLB).
- `animation/AnimationEngine.js` — Configurable animation orchestrator replacing hardcoded rotation. Driven by preset configs.
- `animation/presets.js` — Animation preset definitions (spinY, spinX, spinZ, float, fadeInOut).

**`src/app/`** — React application layer:

- `store/useProjectStore.js` — Zustand store holding all project state (model, colors, pixel size, dither type, animation settings, light direction). Every UI control reads/writes from this store.
- `hooks/useAutoSave.js` — localStorage persistence on every state change.
- `hooks/useExport.js` — Export logic (GIF via gif.js, video via MediaRecorder, sprite sheet, code ZIP via JSZip).
- `components/PreviewCanvas/` — Bridges React ↔ engine: instantiates SceneManager, subscribes to store changes, drives live preview.
- `components/Layout/` — App shell with sidebar + preview area.
- Other components: `ModelUploader`, `ColorPalette`, `AnimationControls`, `QualitySettings`, `LightDirection`, `ExportPanel`.

### Rendering pipeline

Three.js renders 3D scene to hidden WebGL canvas → BitmapEffect reads pixels via getImageData → calculates brightness per grid cell → applies dithering (Bayer 4x4/8x8, variable dot) → maps brightness to color palette (index 0 = shadows, last = highlights) → draws to visible canvas. During fade phases, particles scatter/gather with eased animations.

### Legacy files (deleted)

The original npm package code (`src/animations/`, `src/effects/`, `src/react/`) has been removed. It is preserved in git history. The active engine code lives in `src/engine/`.

## Tech Stack

React 19, Vite 7, Tailwind CSS 4, Zustand (state), Three.js (3D), Radix UI (primitives), react-colorful (color picker), @dnd-kit (drag reorder), react-dropzone (file upload), gif.js (GIF export), JSZip (ZIP export), Lucide React (icons).

## Key Conventions

- Color palette is brightness-mapped: array index 0 = darkest/shadows, last = brightest/highlights. Users reorder colors to control which brightness zones get which color.
- All animations are looped (GIF-like). Animation presets are plain config objects.
- The engine and app layers are intentionally separated so the engine could be published as a standalone npm package.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **BitmapForge** (1456 symbols, 4146 relationships, 117 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/BitmapForge/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/BitmapForge/context` | Codebase overview, check index freshness |
| `gitnexus://repo/BitmapForge/clusters` | All functional areas |
| `gitnexus://repo/BitmapForge/processes` | All execution flows |
| `gitnexus://repo/BitmapForge/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
