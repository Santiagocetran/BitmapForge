# BitmapForge — Public Launch Plan

_Generated: April 2026_

---

## Current State Assessment

### What's solid

- **Feature set**: 6 renderers (Bitmap, Pixel Art, Halftone, LED Matrix, Stipple, ASCII), 8 animation effects, 11 export formats, CRT/Bloom/Noise post-processing, Plugin API, Embed SDK
- **Test coverage**: 540 tests across 37 files (unit + integration + Playwright E2E)
- **Architecture**: clean two-layer separation (`src/engine/` / `src/app/`), intentional enough to eventually publish the engine as a standalone npm package
- **Tooling**: ESLint + Prettier + Vitest + Playwright + husky pre-commit hooks — all wired up
- **Embed SDK**: `packages/embed/` ships a native web component with lazy loading, DPR scaling, reduced-motion support
- **Docs**: README, CONTRIBUTING, PLUGIN_API, PROJECT_SPEC all exist

### What's incomplete or deferred

- **Layers / scene composition**: fully implemented on a feature branch, intentionally absent from `main` — deferred until per-layer color and animation controls are ready (Phase 4)
- **Mobile UI**: flagged in roadmap, not yet optimized
- **TypeScript**: not yet in the app; worth addressing for the engine and embed SDK before publishing them as npm packages
- **Bundle size**: not yet audited — Three.js is heavy and may benefit from code splitting

---

## Phase 0 — Truth-check (immediate)

These are low-effort, high-impact items that should be done before any public announcement.

| Item                          | Status                                  | Action                                                                                                                                        |
| ----------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Layers code removed from main | ✅ Done (commit 26b23ab)                | —                                                                                                                                             |
| README test count             | ✅ Fixed (540 / 37)                     | —                                                                                                                                             |
| README roadmap accuracy       | ✅ Fixed (Plugin API + E2E checked off) | —                                                                                                                                             |
| CLAUDE.md commands section    | ✅ Fixed (reflects actual scripts)      | —                                                                                                                                             |
| GitHub repo topics            | ⏳ Pending                              | Add via repo settings: `threejs`, `pixel-art`, `dithering`, `bitmap-animation`, `webgl`, `gltf`, `retro`, `indie-game-dev`, `creative-coding` |
| Live URL matches main         | ⏳ Verify                               | Open `bitmapforge.vercel.app` and confirm current state is deployed                                                                           |
| Demo assets fresh             | ⏳ Verify                               | Check `docs/demo.gif` and `docs/screenshot-ui.png` reflect current UI                                                                         |

---

## Phase 1 — UX Polish

These directly affect whether a new visitor sticks around or bounces.

### 1.1 First-time user flow

**Question to answer first**: what does someone see with no model loaded?

- Is there a bundled demo model they can try immediately, or just a blank canvas?
- Is there a clear call-to-action ("Upload a model" / "Try a shape")?
- Recommendation: bundle 2–3 interesting GLB/STL files as "Try a demo" presets so users can explore the tool without having a model ready

### 1.2 Error states

- What happens when a model fails to load (corrupt file, unsupported format)?
- What happens when an export fails mid-render?
- Are there visible error messages, or does it silently do nothing?

### 1.3 Mobile

- The roadmap flags this as not done — how broken is the current UI on a phone?
- At minimum: sidebar should collapse / be accessible, canvas should fill available space
- The export panel is complex — a mobile-friendly "simplified export" may be enough for v1

### 1.4 Bundle size

Run `npm run build` and inspect the output. Three.js alone is ~600KB minified. Check:

- Is code splitting in place for heavy exports (gif.js, JSZip, etc.)?
- Are dynamic imports used for export formats only loaded on demand?

---

## Phase 2 — Content & Discoverability

### 2.1 Demo content

- Bundle 2–3 interesting 3D models as built-in demos
- Add a "Try examples" button that loads a preset model + settings combo
- A good example: a low-poly skull with bitmap dithering + spin + LED matrix with color

### 2.2 Visual assets

| Asset                    | Purpose                                        |
| ------------------------ | ---------------------------------------------- |
| `docs/demo.gif`          | README hero — must be sharp and representative |
| `docs/screenshot-ui.png` | Full UI screenshot                             |
| Social card / OG image   | For Twitter/HN link previews                   |

### 2.3 GitHub setup

- Enable **GitHub Discussions** (Q&A, show & tell, ideas)
- Create real **issue templates** (bug report, feature request, renderer idea)
- Add `good first issue` labels to real, scoped tickets so contributors have somewhere to start
- Add GitHub topics (see Phase 0)

---

## Phase 3 — Launch Mechanics

### 3.1 Where to post

Focus on 2–3 channels that match the audience:

| Channel                       | Audience fit | Notes                                                     |
| ----------------------------- | ------------ | --------------------------------------------------------- |
| **Hacker News (Show HN)**     | High         | Technical audience, good for open-source tools            |
| **r/webdev**                  | High         | Web devs who'd appreciate the architecture                |
| **r/gamedev + r/indiegaming** | Medium-high  | The pixel art / retro asset use case                      |
| **X/Twitter**                 | Medium       | Demo GIF performs well; tag Three.js, gamedev communities |
| **Product Hunt**              | Medium       | Good for visibility, less technical                       |

**Recommendation**: lead with Show HN + a tweet with a good demo GIF. Don't spread thin.

### 3.2 The pitch

> BitmapForge turns any 3D model into retro pixel animations — in your browser, no install, no signup. Upload a GLB, pick a dither style, export a GIF. 100% client-side.

Target the pain: game devs and pixel artists spend hours in Blender to get a simple animated sprite. BitmapForge does it in under a minute.

### 3.3 Analytics

Add lightweight, privacy-respecting analytics before launch:

- **Plausible** or **Umami** — both are open source, GDPR-compliant, no cookie banner needed
- Track: page views, export button clicks (which format?), model upload vs shape vs text
- This tells you what features people actually use vs what you think they use

### 3.4 Feedback loop

For v1, GitHub is enough:

- Issue templates for bug reports and feature requests
- GitHub Discussions for open-ended feedback
- Pin a "Feedback welcome" discussion thread after launch

---

## Phase 4 — npm Packages (post-launch)

Once the public app is stable, the engine architecture enables two npm publish targets:

### `@bitmapforge/embed`

- Already built in `packages/embed/`
- Enables embedding animations with a single `<bitmap-forge>` tag
- Next step: publish to npm and add install instructions to README
- TypeScript migration of this package should happen before publish (small scope, ~5 files)

### `@bitmapforge/engine`

- The `src/engine/` layer, extracted and published as a standalone package
- Enables developers to build their own UI on top of the rendering pipeline
- Requires TypeScript migration first (published packages need `.d.ts` type exports for IDE support)
- This is a larger effort — target post-launch v1.1 or later

See [TypeScript Migration Strategy](#typescript-migration-strategy) below.

---

## TypeScript Migration Strategy

**Recommendation**: migrate incrementally, starting with the packages, not the app.

### Why TypeScript matters for published packages

When a developer installs `@bitmapforge/engine`, their IDE needs to know what `SceneManager` accepts as arguments, what it returns, what methods exist. Without type declarations (`.d.ts` files), they're flying blind — forced to read source code to understand the API. TypeScript generates these declarations automatically during build.

### Suggested migration order

| Target            | Priority | Effort             | Why                                                                      |
| ----------------- | -------- | ------------------ | ------------------------------------------------------------------------ |
| `packages/embed/` | High     | Low (~5 files)     | Smallest scope; validate migration pattern                               |
| `src/engine/`     | High     | Medium (~20 files) | Required before npm publish; Plugin API benefits most                    |
| `src/app/`        | Low      | Large (~40+ files) | Users don't feel this; do incrementally post-launch with `allowJs: true` |

### Approach for `src/engine/`

1. Add `tsconfig.json` with `allowJs: true` + `checkJs: true` — free type checking without rewriting files
2. Add JSDoc types (`@param`, `@returns`, `@typedef`) to the public API surface (SceneManager, renderers, Plugin registry)
3. Convert files to `.ts` one at a time, starting with `effectTypes.js` and `BaseRenderer.js` (smallest, most referenced)
4. Set `declaration: true` in tsconfig to emit `.d.ts` files for consumers

---

## Prioritized Action List

If you had one week before launch, this is the order:

1. **Verify live site** — deploy current main, confirm it works end to end
2. **First-time UX** — add a bundled demo model or default shape so new visitors see something immediately
3. **Check mobile** — open on a phone, triage the worst breakages
4. **Refresh demo.gif** — the README hero is the first thing people see
5. **Add GitHub topics** — five minutes, pure discoverability upside
6. **Add analytics** — Plausible or Umami, one script tag
7. **Write the Show HN post** — draft it before you're ready, so it's done when you are
