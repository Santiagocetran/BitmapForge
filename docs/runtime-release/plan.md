# Supported Node release fix — bounded implementation plan

> Historical Node 26 plan, superseded by [the current Node 24 revision](node24-plan.md).

## Evidence and decision

Merged commit `cb824259bea2f6c1b96e3298f5c5625fbdce398a` passed all verification jobs in main run43628734392 but Vercel rejected root `engines.node:20.x` as discontinued. Its actual build error requests26.x. The official Node release schedule identifies26 as LTS from2026-10-28 through maintenance2027-10-20, end2029-04-30. A local Node26 executable has been obtained and reportsv26.13.1. Freshly fetched [Vercel support documentation](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions?release-check=20261114) explicitly lists26.x as supported/default, with24.x and22.x alternatives; root engines override the project setting.

Choose exact major `26.x`, not an unbounded range. It is the provider-suggested current LTS and avoids leaving CI on a different major. Do not change dependencies, browser version/runner, test budgets/assertions, app code or deployment protection settings.

## Scope

- Change root package.json engine20.x to26.x, matching only root metadata in package-lock.json; assert every other lock entry unchanged.
- Change .nvmrc20 to26.
- Change all five existing CI setup-node inputs to `node-version-file: '.nvmrc'`; preserve jobs, conditions, environment, secrets, concurrency, complete artifact hashes, hidden-file transport, stale-main rejection and pinned deployment CLI.
- Update current contributor requirement, CI release-safety Node description, standalone bitmap-smoke comment and development export-config runtime comment. Leave historical audit commands and workspace packages' >=20 public compatibility claims unchanged; app/build major policy is distinct from published SDK/CLI minimum support.
- Add a small node:test policy regression under .github/ci/ and execute it in CI check job. It asserts exact root26.x, matching lock-root26.x, exact .nvmrc26, all five setup-node steps selecting .nvmrc without a competing node-version, and actual execution runtime26. Document the narrow known-workflow text-shape check; do not claim arbitrary YAML parsing or provider support. In-memory mutation cases must reject root/lock mismatch, unbounded engine, wrong .nvmrc, mixed CI selector and wrong runtime. Run explicitly in check because root Vitest excludes .github/ci. Preserve the plan/verification in tracked docs/runtime-release/, not ignored docs/plans/.

## Measured compatibility adjustment

Node26's native localStorage getter caused the unchanged Vitest4.0.18 environment to expose undefined storage: the first full run had37 failing tests and one suite import failure. A first attempted binding through `window.localStorage` also failed because Vitest aliases window to its populated global. Bind the actual per-window implementation through `globalThis.jsdom.window.localStorage` in root test/setup.js, not a storage mock or Node disk file. Add test/integration/storageEnvironment.test.js to require actual window.Storage identity and real read/write/remove behavior. The failing regression was observed before the successful correction;40 affected tests and the complete853-test root suite now pass. This is test-environment compatibility only; no production store/UI code changes or dependency upgrades.

## Verification

1. Independent plan audit before implementation; resolve material objections.
2. Fresh locked npm ci with Node26 and npm11, suppressing unnecessary Puppeteer download exactly as CI. Do not regenerate dependency versions; compare lock entries against main.
3. Run policy regression plus mutation red/green proof, root lint/format, all root/embed/decode/CLI suites, app/SDK/CLI builds and native bitmap smoke on26.
4. Run the existing six built-output export/browser cases under26 with strict90-second budget, zero retries and complete artifact checks on an isolated local server. No source-development server substitution.
5. Independent implementation audit of exact final diff and evidence; record any compatibility failure honestly.
6. Save focused branch `gloin/supported-node-release` from current merged main. Request approval before publishing a new PR; do not merge, override required review, change Vercel settings or redeploy silently. PR/main CI and actual Vercel build acceptance remain external gates until exercised.

## Acceptance boundary

A locally verified runtime repair is not a production deployment. Once a protected followup PR is approved/merged, confirm main CI passes and Vercel actually accepts26; read back served assets against the tested build and smoke-test real production. The previous deployment remains the public app until successful promotion.
