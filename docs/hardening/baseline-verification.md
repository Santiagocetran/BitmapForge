# Pre-implementation local verification

Source: `550842cab61002c7cc6563e50b9fcdeb17c9bf01`, branch `gloin/release-hardening`. Only hardening research documentation had been added when this chain started. Process `proc_382dd2e8ee4e` completed with exit **0** on 2026-11-15 UTC. Toolchain printed Node **24.22.3**, npm **11.21.2**.

Executed as one `&&`-guarded chain:

```sh
npx --yes --package=node@24 --package=npm@11 -c 'node --version && npm --version && node --test .github/ci/node-runtime.test.mjs && npm run lint && npm run format:check && npm test -- --max-workers=50% && npm test --workspace @bitmapforge/embed && npm run test:export && npm run build && npm run build --workspace @bitmapforge/cli && npm test --workspace @bitmapforge/cli && node src/engine/loaders/bitmap.browser-smoke.mjs'
```

Results:

- Native runtime consistency/mutation tests: **6 passed**.
- Root ESLint and Prettier check: passed.
- Root unit/integration: **853 passed / 61 files**.
- Embed: **23 passed / 2 files**.
- Export/decode: **66 passed / 3 files**.
- Embed/application/CLI builds: passed. Build emitted its existing chunk-size advisory; no limit was relaxed.
- CLI: **26 passed, 1 skipped / 2 files**. This is not real CLI render verification; the render unit suite mocks Puppeteer.
- Native bitmap loader smoke: actual Chromium **147.0.7727.15**, both retained and unretained cases completed with one decode and one object-URL revocation each; output recorded disposal/bitmap-width observations.

## Built-browser baseline

Process `proc_2dc8c12d77e2` subsequently completed with exit **0**, using:

```sh
npx --yes --package=node@24 --package=npm@11 -c 'node node_modules/@playwright/test/cli.js test --config=.github/ci/playwright.config.js'
```

**6 passed (3.1m)** against the locally built application: uploaded-model preview (11.4s), meaningful animated APNG (36.9s), Sprite Sheet (17.3s), extracted Code ZIP rendering (39.4s), CSS ZIP animation (21.9s), and actual Video container with decoded nonblank frame (57.0s). The checked-in built config retained its 90-second outer test budget, zero retries, one worker, strict preview server with no reuse, and failure trace policy. This was the existing installed browser cache, not the planned fresh-cache installation gate. It does not cover all nine formats or other engines.

External manifest `/home/agent/BitmapForge-hardening-research/preimplementation-build-sha256.json` records 51 app/embed/CLI build files, including 35 application files, captured before dependency implementation.

## Coverage baseline

Process `proc_37433d211174` completed with exit **0** using Node24/npm11 and `npm run coverage -- --max-workers=50%`. The actual V8 coverage report is archived at `/home/agent/BitmapForge-hardening-research/preimplementation-coverage/`; all **137** copied report files were SHA-256-compared to the generated tree before removing only this run's untracked checkout `coverage/` output. This is the pre-upgrade provider report, retained for comparison to A's converter/runner changes.

This establishes a pre-change baseline, not acceptance of candidate dependency versions, full nine-route browser/export acceptance, production artifact identity, or final hardening verification. Watch, real CLI APNG/WebM, full nine-route built-output exports and cross-browser/accessibility smoke are separate planned gates. Plans authored after this run must receive their own formatting checks.
