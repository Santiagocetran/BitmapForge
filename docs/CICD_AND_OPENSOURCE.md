# CI/CD & Open-Source Infrastructure

Guide for setting up the development environment, CI pipeline, and contributor experience for BitmapForge.

---

## 1. Code Quality Tools

### ESLint

Install ESLint with the flat config format (ESLint 9+):

```bash
npm install -D eslint @eslint/js eslint-plugin-react eslint-plugin-react-hooks globals
```

Create `eslint.config.js`:

```js
import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },
  { ignores: ['dist/', 'node_modules/'] }
]
```

### Prettier

Install Prettier:

```bash
npm install -D prettier
```

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 120
}
```

These rules match the existing code style (no semicolons, single quotes, no trailing commas).

### package.json scripts

Add these scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,css}\"",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## 2. Unit Testing with Vitest

### Setup

```bash
npm install -D vitest
```

Add to `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}']
  }
})
```

### What to test

The engine layer (`src/engine/`) is the best candidate for unit tests — it's pure JS with no React or DOM dependencies (except Canvas/WebGL which can be mocked).

**Priority test targets:**

1. **Animation presets** (`src/engine/animation/presets.js`) — Pure data, trivial to test. Verify preset shapes, default values, that all expected presets exist.

2. **AnimationEngine** (`src/engine/animation/AnimationEngine.js`) — Test that `update()` applies correct rotation deltas, that `seekTo()` produces deterministic state, that `getLoopDurationMs()` returns correct values for different configs.

3. **Model loader** (`src/engine/loaders/modelLoader.js`) — Test format detection logic (file extension parsing). The actual Three.js loading requires mocking but the dispatch logic is testable.

4. **Zustand store** (`src/app/store/useProjectStore.js`) — Test state transitions: color reordering, clamping logic, add/remove color bounds (2-6), status updates.

5. **Utility functions** (`src/app/utils/projectFile.js`, `src/app/utils/codeExport.js`) — Pure functions, easy to test.

**Test file convention:** Place tests next to the source file: `presets.test.js` next to `presets.js`.

### Example starter test

```js
// src/engine/animation/presets.test.js
import { describe, it, expect } from 'vitest'
import { PRESETS } from './presets.js'

describe('animation presets', () => {
  it('includes all expected preset keys', () => {
    expect(Object.keys(PRESETS)).toEqual(expect.arrayContaining(['spinY', 'spinX', 'spinZ', 'float']))
  })

  it('each preset has a type and default speed', () => {
    for (const [key, preset] of Object.entries(PRESETS)) {
      expect(preset).toHaveProperty('type', key)
    }
  })
})
```

---

## 3. GitHub Actions CI Pipeline

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npm run format:check

      - name: Unit tests
        run: npm test

      - name: Build
        run: npm run build
```

This runs on every PR and every push to main. All four checks (lint, format, tests, build) must pass.

### Branch protection

In GitHub repo Settings > Branches > Branch protection rules for `main`:

- [x] Require a pull request before merging (already done)
- [x] Require status checks to pass before merging — select the `check` job
- [x] Require branches to be up to date before merging
- [ ] Do NOT require linear history (rebase) unless you prefer it — merge commits are fine for open source

---

## 4. PR and Issue Templates

### PR Template

Create `.github/pull_request_template.md`:

```markdown
## What does this PR do?

<!-- Brief description of the change -->

## How to test

<!-- Steps to verify the change works -->

## Checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Tested in the browser with a 3D model loaded
- [ ] New code has unit tests (if applicable)
```

### Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Report something that isn't working
labels: bug
---

**What happened?**

**What did you expect?**

**Steps to reproduce:**

1.
2.
3.

**Browser/OS:**

**Screenshots (if applicable):**
```

Create `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: Suggest an idea
labels: enhancement
---

**What would you like?**

**Why is this useful?**

**Any ideas on implementation?**
```

---

## 5. CONTRIBUTING.md

Create `CONTRIBUTING.md` at the repo root:

```markdown
# Contributing to BitmapForge

## Getting started

1. Fork the repo and clone your fork
2. `npm install`
3. `npm run dev` — starts the Vite dev server at http://localhost:5173
4. Make your changes on a new branch
5. `npm run lint && npm test && npm run build` — make sure everything passes
6. Open a PR against `main`

## Project structure

- `src/engine/` — Framework-agnostic rendering engine (vanilla JS). Do not import from `src/app/` here.
- `src/app/` — React application. All state flows through the Zustand store in `src/app/store/`.
- See `CLAUDE.md` for detailed architecture docs.

## Code style

- ESLint and Prettier are configured. Run `npm run lint:fix` and `npm run format` before committing.
- No semicolons, single quotes, no trailing commas (Prettier handles this).

## Tests

- Run `npm test` (Vitest).
- Place test files next to source: `Foo.js` → `Foo.test.js`.
- Engine code (`src/engine/`) should have unit tests for any new logic.

## PR guidelines

- Keep PRs focused — one feature or fix per PR.
- Fill out the PR template.
- CI must pass before merge.
```

---

## Implementation Order

1. Install ESLint + Prettier, create configs, add scripts to `package.json`
2. Run `npm run lint:fix` and `npm run format` on the existing codebase to establish the baseline
3. Install Vitest, add test config to `vite.config.js`
4. Write initial unit tests for the engine layer (presets, animation engine, store)
5. Create `.github/workflows/ci.yml`
6. Create PR template, issue templates, `CONTRIBUTING.md`
7. Enable branch protection rule requiring the CI `check` job to pass
