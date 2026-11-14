# Node 26 release repair — local verification

Base: merged main `cb824259bea2f6c1b96e3298f5c5625fbdce398a`. Branch: `gloin/supported-node-release`.

## Scope and evidence

Vercel run [43628734392](https://github.com/Santiagocetran/BitmapForge/actions/runs/43628734392) rejected Node20 as discontinued after all verification jobs passed. Current [Vercel support list](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions?release-check=20261114) explicitly supports/defaults26; official [Node schedule](https://github.com/nodejs/Release/blob/main/schedule.json) confirms26 LTS.

Root and lock-root engines are now exactly26.x; .nvmrc selects26; all five setup-node steps use that file. A native node:test check in CI requires agreement and rejects five deliberate mismatches. Workspace >=20 declarations are unchanged, as are dependencies, deployment CLI, browser version/runner, test budgets and release protections. Current development documentation/comments are aligned; historical audit commands remain unchanged.

A measured test-environment compatibility addition binds the actual JSDOM instance's localStorage. Initial Node26 root execution failed37 tests and one suite import; the naive window.localStorage binding also failed the new regression. Actual `globalThis.jsdom.window.localStorage` passes a real Storage identity/read/write/remove regression and restores all affected cases. No production store or UI code changed.

Plan review: `deleg_fc1febea` requested bounded revisions; `deleg_dc36cde1` independently **ACCEPTED** the revised plan. Final implementation audit `deleg_c12e0e6d` **ACCEPTED** the complete diff, exact dependency preservation and measured storage adjustment, independently rerunning6 policy checks and the real-storage regression. The parent subsequently completed the six-case built-browser gate successfully.

## Executed checks

Runtime: **Node26.13.1 / npm11.21.2**.

- Fresh locked npm ci succeeded. This host's pre-existing user .npmrc allows scripts only for an unrelated global CLI. NPX exported that setting into an environment form npm11 rejects for project operations. Removing only the inherited npm_config_allow_scripts variable restored file-based policy; the user configuration was not edited or bypassed. npm ci consequently skipped esbuild/Puppeteer postinstall scripts per that policy; explicit subsequent builds/browser smoke passed. Hosted CI installation still must be exercised normally.
- Native runtime-policy regression: **6/6** (valid configuration plus five rejection mutations).
- Affected storage/palette/gallery suites: **40/40**.
- Root: **61 files / 853 tests passed**.
- Embed: **23/23**.
- Export/decode/archive: **66/66**.
- CLI: **10 passed / 1 optional integration skipped**.
- Lint and repository formatting passed.
- App/SDK/CLI builds and both real native ImageBitmap smoke cases passed.
- Existing built-output browser/export suite: **6/6**. Isolated strict-port production preview, original90-second per-case timeout, zero retries and retain-on-failure trace policy; no source-dev server substitution.
- Compared every nonprovenance file against the exact merged-main CI artifact: **35/35 byte-identical**. SDK package/public/app copies are identical, contain no @engine alias, and CI-equivalent `gzip -c` is **46,708 bytes**, below51,200. Node26 changes no built application bytes.
- Complete lock JSON comparison against main differs only in root engines.node. No package resolutions/integrities changed.

Raw command output, failed attempts, native/mutation results and Playwright JSON/artifacts are retained locally under `/home/agent/BitmapForge-redesign-research/node26-verification/`.

## Remaining boundaries

No PR publication, merge, Vercel settings mutation or redeployment has been authorized/performed for this repair. Actual hosted CI and Vercel acceptance plus served-build readback remain required after the protected PR flow. Public production was last verified as the old editor after the failed deployment.

npm audit reports **28 existing locked-dependency vulnerabilities** (2low,4moderate,20high,2critical); both critical package entries are dev-test tooling, vitest and @vitest/coverage-v8. These findings are not introduced or fixed by the runtime repair. No automatic or forced audit upgrade was applied; separate exposure/compatibility triage remains necessary. Vitest's Node26 module.register deprecation and existing large-bundle/dependency-deprecation warnings remain nonfatal.
