# Node 24 release repair — current local verification

Supersedes the runtime choice in [historical Node26 evidence](verification.md), not its recorded results. User explicitly authorized revising existing PR97 to24. No merge/deploy or review bypass authorized.

## Why24, not26

The Node26 PR passed root/CLI/decode/build checks, but hosted browser installation hung after the Chromium download reached100%, before any test ran. A fresh local Node26 cache reproduced the hang. The precise upstream cause is not established; do not call it a known internals defect. A fresh local24 control completed unchanged Playwright1.59.1 installation. Vercel supports24.x and Node24 remains a supported LTS. [Current bounded plan](node24-plan.md) independently accepted by deleg_c83ec9db.

## Changes and safeguards

- Root and lock-root engines exactly24.x; .nvmrc24; all five existing setup-node steps continue reading .nvmrc.
- Native policy guard requires actual execution24 and exact root/lock/version-file agreement. Five rejection mutations retained; wrong local/runtime use26 and unbounded range is>=24.
- Current contributor, CI-safety and executable-config comments aligned. Prior26 records explicitly marked historical.
- Previously accepted real-JSDOM storage binding/regression retained as a test-only compatibility repair. No claim that24 reproduced the26-specific collision.
- Entire lock JSON compared against merged main: only root engines.node differs. No dependency versions/integrities, production logic, browser/runner/deployment-CLI versions, assertions, time budgets, artifact checks or release protections changed.

## Actual Node24 execution

Node **24.22.3**, npm **11.21.2**:

- Fresh locked npm ci passed. Existing host user script policy retained; only NPX-inherited allow-scripts environment removed so npm reads that unchanged policy from its file. esbuild/Puppeteer postinstall skipped per policy; explicit builds and native smoke passed. Hosted installation remains a separate gate.
- Fresh Chromium147.0.7727.15 (revision1217), FFmpeg1011 and headless shell1217 installed into a previously nonexistent isolated cache. Installation completed, not merely downloaded100%.
- Policy/mutation **6/6**; root **61 files/853 tests**; embed **23**; decode/archive **66**; CLI **10 passed/1 existing optional skip**.
- Root lint/format, app/SDK/CLI builds and **two native ImageBitmap smoke cases** passed.
- Built-output browser/export **6/6** using that exact freshly installed cache. Strict isolated production-preview server; original90-second timeout, zero retries, meaningful output/assertions and retain-on-failure trace policy preserved. No development-server substitution.
- **35/35 app files byte-identical** to merged-main CI artifact. SDK package/public/app bytes identical, no @engine leakage; CI-equivalent gzip **46,708<=51,200 bytes**.

Raw logs and artifacts: `/home/agent/BitmapForge-redesign-research/node24-verification/` (fresh-install.log, full-gates.log, built-browser.log, browser-report.json and build-identity.json). This directory is evidence storage, not a production deployment.

Final independent implementation audit **deleg_7f7a19aa: ACCEPT**, with exact package/lock comparison and preserved CI/test/release safeguards. Parent completed the separate fresh-cache built-browser verification **6/6**. Hosted CI, actual Vercel24 acceptance and served-production checks remain external gates. Required approving GitHub review stays intact. Existing28 dependency audit findings remain outside this runtime-only repair; no forced upgrades applied.
