# Contributing to BitmapForge

Thanks for your interest in contributing! This guide will help you get started.

## Getting started

1. Fork the repo and clone your fork
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open `http://localhost:5173` in your browser

Requires Node.js 20+. Use the `.nvmrc` file with `nvm use` if you have nvm installed.

## Project structure

BitmapForge has a two-layer architecture:

- **`src/engine/`** — Framework-agnostic rendering engine (vanilla JS, no React). Handles Three.js scene management, bitmap/dithering effects, animation, and model loading.
- **`src/app/`** — React application layer. UI components, Zustand store, hooks, and export utilities.

These layers are intentionally separated so the engine could be published as a standalone package.

## Code style

- **ESLint + Prettier** enforce consistent style automatically
- No semicolons, single quotes, trailing commas off, 120-char print width
- Pre-commit hooks (husky + lint-staged) run automatically on staged files
- To opt out of pre-commit hooks: `HUSKY=0 git commit ...`

Run manually:

```bash
npm run lint        # Check for lint errors
npm run lint:fix    # Auto-fix lint errors
npm run format      # Format all files
npm run format:check # Check formatting
```

## Tests

Tests use [Vitest](https://vitest.dev/) and are colocated next to the files they test (`*.test.js`).

```bash
npm test            # Run all tests once
npm run test:watch  # Run tests in watch mode
npm run coverage    # Generate coverage report
```

## Pull request guidelines

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Ensure all checks pass: `npm run lint && npm run format:check && npm test && npm run build`
4. Open a PR against `main`
5. Fill out the PR template

## Git blame

The formatting baseline commit is recorded in `.git-blame-ignore-revs`. Configure git to skip it:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```
