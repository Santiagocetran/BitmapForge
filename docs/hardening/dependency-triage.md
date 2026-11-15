# Issue #94 — dependency advisory triage

Research snapshot: **2026-11-15 03:40 UTC**, refreshed during this report. Source: `550842cab61002c7cc6563e50b9fcdeb17c9bf01`, branch `gloin/release-hardening`. [Issue #94](https://github.com/Santiagocetran/BitmapForge/issues/94) remains open. **Research only: no dependency, lockfile, source or workflow implementation is authorized by this report.** Each proposed batch needs a written implementation plan and explicit independent acceptance before editing those files.

## Decision

Proceed with three bounded dependency batches, not `npm audit fix --force`: (A) test tooling and jsdom HTTP client, (B) Vite/build/lint/configuration transitives on their existing release lines, and (C) an independently gated Puppeteer/Chromium migration for the CLI. C is the compatibility-heavy batch, not a patch-only refresh. A and B can be accepted before C, but that does not close #94.

The refreshed full audit reports **27 affected package names: 2 critical, 19 high, 4 moderate, 2 low**. These are npm's package-level severity counts, **not 27 independent vulnerabilities, attacks, or deployed-site exposures**. Programmatic deduplication yields **84 unique GHSA identifiers** across the audit's direct advisory records. Severity inherited through dependency edges counts packages such as coverage and Puppeteer even when those packages have no direct advisory of their own.

The production-dependency audit (`--omit=dev`) still reports **9 high affected package names**, all on the CLI Puppeteer tree: `@puppeteer/browsers`, `chromium-bidi`, `extract-zip`, `ip-address`, `js-yaml`, `puppeteer`, `puppeteer-core`, `ws`, `zod`. A workspace's Node production dependencies are not necessarily browser-delivered code. Conversely, calling every finding “dev-only” would be incorrect.

**No evidence here establishes active exploitation or compromise. No vulnerability payload, exploit reproduction or vulnerable-version attack test was run.** This is an advisory/graph/source assessment, not penetration testing or proof that the deployed site is safe. Hosted revision, served-byte identity and operational bind/proxy settings were not verified in this workstream.

## Reproducibility and primary evidence

Toolchain actually used: Node **v24.22.3**, npm **11.21.2**. Existing installation inspected with `npm ls`/`npm explain`; no package installation, upgrade or audit fix was performed. NPX supplied the approved runtime/tools through its external cache. The audit and explain invocations retain the real user npm configuration; the invalid NPX-inherited environment key is removed only for the child command:

```sh
npx --yes --package=node@24 --package=npm@11 -c 'env -u npm_config_allow_scripts npm audit --json'
npx --yes --package=node@24 --package=npm@11 -c 'env -u npm_config_allow_scripts npm audit --omit=dev --json'
npx --yes --package=node@24 --package=npm@11 -c 'env -u npm_config_allow_scripts npm ls --all --json'
npx --yes --package=node@24 --package=npm@11 -c 'env -u npm_config_allow_scripts npm explain vite vitest puppeteer zod ip-address undici flatted minimatch --json'
```

Both audit commands exited **1 because findings remain**; this is not a failed collection. `npm ls` and the explain calls completed successfully. A second explain call includes all 27 affected names.

Raw evidence is deliberately outside the repository at `/home/agent/BitmapForge-hardening-research/security/`:

- `issue94.json`: live issue body/status.
- `npm-audit.json`, `npm-audit-omit-dev.json`: original scanner responses.
- `npm-ls.json`, `npm-explain.json`, `npm-explain-all.json`: installed graph and declared consumer ranges.
- `dependency-paths.json`, `dependency-paths-summary.txt`: paths generated from `npm ls`, not manually inferred.
- `advisory-metadata.json`: all 84 distinct GitHub global advisory API records, retaining identifiers, affected ranges, first-patched versions, timestamps and primary references; no collection errors.
- `primary-fixed-summary.txt`, `advisory-context.txt`: patch metadata and bounded precondition notes.
- `registry-candidates.json`, `registry-summary.txt`: official npm registry version/engine/dependency/peer/script/dist metadata for candidate packages. An early guessed Babel patch (`7.29.1`) returned 404; primary evidence correctly identifies and registry confirms `7.29.6`. Major shorthand URL lookups also returned 404; exact patched versions were subsequently checked. Do not treat those early guesses as candidates.
- `puppeteer-25.13.0-release.json`, `puppeteer-25.17.0-release.json`: upstream release records.
- `runtime-import-scan.json`: lexical scan only; the apparent Vite import in `codeExport.js` is generated template text, not an executing editor import.
- `collect.py`, `registry.py`, `paths.py`: evidence collectors. They do not install packages or test vulnerabilities.

Primary advisory metadata was retrieved with `gh api advisories/GHSA-…`; registry records with `https://registry.npmjs.org/<package>/<exact-version>`. The links below are reviewable primary advisories. These prove upstream publication and metadata, not tarball content review, publisher provenance, or candidate behavioral compatibility. Candidate tarballs were not installed/executed or compared to the lockfile's integrity.

## Actual exposure boundaries

### Browser editor and embed

The root application imports React/Three/encoders and related application dependencies; the audit paths above terminate in development tooling or the Node CLI. `packages/embed/package.json` publishes `dist/` with Three as a peer; Vite/Vitest/jsdom are its dev dependencies. The CLI's browser harness bundles the engine through `packages/cli/vite.config.js`, while the Node CLI imports Puppeteer in `packages/cli/src/index.js:6`.

**No audited package was identified as an executing editor/embed runtime import in this source assessment.** This is not a production bundle/module inventory or deployed-byte proof. Build-time compromise could still affect emitted application bytes. A before/after browser/SDK artifact comparison and built-app tests remain acceptance requirements.

One exported-code boundary is important: `src/app/utils/codeExport.js:80–97` emits a standalone package with `vite: '^7.2.4'` and a Vite configuration. This is a downstream developer-server dependency, **not Vite executing inside the hosted editor**. Fresh resolution may choose a patched version, but the advertised floor permits older vulnerable 7.x versions. An approved batch B plan should explicitly decide whether to raise that generated-project floor to `^7.3.7` and test a real downloaded project; do not accidentally claim that changing the repository lockfile fixes previously downloaded projects.

### Test server and local development

- Root `vite.config.js:16–20` selects jsdom and includes only `src/**/*.test.{js,jsx}` and `test/integration/**/*.test.{js,jsx}`. Root tests do not establish CLI/embed suite completion.
- Root scripts use `vitest run`, `vitest` for watch, and `vite` for development. No checked-in UI/API host or standalone `mockerPlugin`/`interceptorPlugin` integration was found. Playwright is a separate runner, not evidence that Vitest Browser Mode is enabled.
- [GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp) explicitly limits affected users to network-exposed Vitest UI/API or UI/Browser Mode on Windows. Its critical scanner label must not be translated into “all unit-test executions permit remote execution.” Current checked-in scripts do not demonstrate these preconditions; custom developer invocations remain unknown. Do not expose the test API even after patching this particular defect.
- [Redirect mocking advisory](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) distinguishes public standalone mocker plugins on an unauthenticated dev-server socket from Vitest's token-authenticated browser RPC. [Manual mocking follow-up](https://github.com/advisories/GHSA-qxg6-89mg-rqv8) requires the later 4.1.12 fix. This repository has no identified direct public-plugin integration; do not equate package presence with a reachable unauthenticated handler.
- Vite is actually run for development and several browser tests. `playwright.export.config.js` and `test/e2e/ascii-generated.spec.js` explicitly bind `127.0.0.1`; the root config has no custom host widening. Loopback is risk reduction, not a blanket dismissal of local/browser-adjacent attacks or Windows-specific issues. No live process/socket audit was done.
- `jsdom@28.1.0 → undici@7.24.6` is test-only here. Installed `jsdom/lib/api.js` imports `getGlobalDispatcher`; resource-loader/interceptor code uses undici. Individual SOCKS, cache, cookie, decompression and WebSocket advisory preconditions differ. Their presence does not prove every path is exercised by tests. The npm package is also distinct from Node's bundled undici implementation; updating it does not update Node itself.

### CLI runtime, installer and configuration

- `packages/cli/src/index.js:19–96` reads a project file, starts the harness, launches real Chromium, navigates to the local harness, evaluates rendering, decodes the result and writes an output. This is genuine Node production use of Puppeteer, even though Puppeteer is absent from the browser editor bundle.
- `packages/cli/src/server.js:12–20,41–65` serves a finite asset map on an ephemeral `127.0.0.1` port. It is **not** a Vite dev server; Vite's dev-server advisories should not be attributed to this server.
- Installed `@puppeteer/browsers/lib/esm/install.js` downloads archives and calls `unpackArchive`; `fileUtil.js` imports `extract-zip`; `httpUtil.js` constructs a `ProxyAgent`. The archive vulnerabilities are installer/download extraction exposure, not the normal model-file parser. Untrusted/custom browser archives, download endpoints and proxy configurations are relevant trust inputs; archive extraction is not performed on every render.
- `proxy-agent → socks-proxy-agent → socks → ip-address` is a real installer network path. Installed socks helpers construct `Address4`/`Address6`, and client code decodes IPv6 responses with `fromByteArray(...).canonicalForm()`. No HTML-emitting method, `isLinkLocal` or subnet allowlist call was identified in this consumer search. Therefore the HTML/allowlist advisory impacts are not demonstrated at the adapter; parser/resource behavior and proxy configuration still justify a compatible patch.
- `puppeteer-core → chromium-bidi@0.6.3 → zod@3.23.8` is pinned across a major boundary; current CLI does not explicitly request BiDi, so package presence alone does not prove an attacker-controlled validation path. Do not override this Zod 3.x consumer to 4.x blindly. The root Zod 4.x copy is separately consumed by `eslint-plugin-react-hooks`.
- `puppeteer → cosmiconfig → js-yaml` reads local configuration, while ESLint also consumes js-yaml. A malicious YAML configuration is a developer/CLI input boundary, not evidence that uploaded model data reaches YAML parsing.
- `puppeteer-core → ws` is the Chromium control transport, not an editor-hosted public WebSocket listener. A malicious/misconfigured browser endpoint has a different trust model from arbitrary website visitors.
- `packages/cli/src/index.js:45–48` disables the Chromium sandbox when `CI` is set. This is an existing containment limitation, not a dependency-advisory fix. Prefer trusted fixtures, isolated runners and no secrets for compatibility checks; do not broaden that mode to process untrusted submissions.

## Complete affected-package disposition

The table covers all **27** scanner package names. “Target” means a registry-verified, advisory-informed candidate, **not an applied or tested repair**. A superseding advisory can invalidate a minimum; repeat the audit at implementation time. Letter tags refer to the batches below.

| Affected package (locked)         | Consuming path / exposure                                                    | Proposed disposition                                                       |
| --------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `vitest` 4.0.18                   | Root, embed and CLI tests; conditional test API exposure                     | A: 4.1.12, not merely 4.1.0                                                |
| `@vitest/coverage-v8` 4.0.18      | Test coverage; severity inherited from Vitest                                | A: 4.1.12 in exact peer alignment                                          |
| `@vitest/mocker` 4.0.18           | Vitest dependency; public plugin preconditions above                         | A: resolve 4.1.12 with Vitest                                              |
| `undici` 7.24.6                   | jsdom resource/network layer in tests                                        | A: 7.30.1                                                                  |
| `vite` 7.3.1                      | Root/workspace builds and dev servers                                        | B: 7.3.7; stay on 7.x                                                      |
| `esbuild` 0.27.3                  | Vite transform/build tool; advisory is Windows development-server behavior   | B: 0.28.1 through Vite's newly accepted range                              |
| `postcss` 8.5.6                   | Vite CSS build/source-map processing                                         | B: 8.5.23                                                                  |
| `nanoid` 3.3.11                   | PostCSS identifier generation, not app authentication                        | B: 3.3.18; retain 3.x                                                      |
| `source-map-js` 1.2.1             | Tailwind/PostCSS, coverage magicast, jsdom/css-tree                          | B: 1.2.2 across occurrences                                                |
| `picomatch` 2.3.1 and 4.0.3       | lint-staged/micromatch and Vite/Vitest file matching                         | B: 2.3.2 and 4.0.4, preserving both consumer major lines                   |
| `@babel/core` 7.29.0              | React build plugin and React Hooks lint plugin                               | B: 7.29.6                                                                  |
| `browserslist` 4.28.1             | Babel compilation targets, configuration/statistics                          | B: 4.28.7                                                                  |
| `baseline-browser-mapping` 2.10.0 | Browserslist queries                                                         | B: 2.11.0                                                                  |
| `@humanfs/node` 0.16.7            | ESLint filesystem adapter; symlink-copy precondition not demonstrated in app | B: 0.16.8                                                                  |
| `minimatch` 3.1.3                 | ESLint/config-array/eslintrc/react plugin file patterns                      | B: 3.1.4                                                                   |
| `brace-expansion` 1.1.12          | minimatch patterns                                                           | B: 1.1.21; earlier individual fixes are insufficient                       |
| `flatted` 3.3.3                   | ESLint → file-entry-cache → flat-cache serialized cache                      | B: 3.4.2; not just 3.4.0                                                   |
| `js-yaml` 4.1.1                   | ESLint configuration and Puppeteer cosmiconfig                               | B: 4.3.2; shared CLI/config dependency                                     |
| `yaml` 2.8.2                      | lint-staged and Vite optional/config dependency                              | B: 2.8.3                                                                   |
| `zod` 4.3.6 / 3.23.8              | Hooks lint validation / CLI BiDi validation                                  | B: 4.x copy to 4.6.6; C: replace old BiDi chain, no blanket major override |
| `puppeteer` 22.15.0               | CLI Node runtime and browser installer                                       | C: evaluate 25.17.0, intentional major migration                           |
| `puppeteer-core` 22.15.0          | CLI Chromium control                                                         | C: matching 25.17.0 through Puppeteer                                      |
| `@puppeteer/browsers` 2.3.0       | Browser download/extraction/proxy                                            | C: 3.2.7 through Puppeteer                                                 |
| `extract-zip` 2.0.1               | Browser installer archive extraction                                         | C: remove old dependency path; advisories publish no patched version       |
| `chromium-bidi` 0.6.3             | Optional/conditional browser protocol path in Puppeteer                      | C: 157.0.8090-0 via Puppeteer; lock Zod ≥4.6.6                             |
| `ip-address` 10.1.0               | Installer SOCKS proxy parsing                                                | B: 10.7.4 if path remains; C must re-inventory proxy peers                 |
| `ws` 8.19.0                       | Puppeteer Chromium transport                                                 | B: ≥8.21.0 if repairing old tree first; C 25.17.0 requires `^8.22.1`       |

## Why these versions, and compatibility limits

Primary fixed boundaries are not synonymous with the scanner's `fixAvailable` suggestion:

- Vitest's [critical fix](https://github.com/advisories/GHSA-5xrq-8626-4rwp) starts at 4.1.0, redirect mocking at 4.1.11, and [manual mocking](https://github.com/advisories/GHSA-qxg6-89mg-rqv8) at 4.1.12. Registry Vitest 4.1.12 pins mocker 4.1.12 and accepts Vite `^6 || ^7 || ^8`; coverage 4.1.12 requires Vitest 4.1.12. Existing manifest `^4.0.18` ranges admit this update, but an approved plan should choose explicit fixed floors and synchronize root/embed/CLI manifests rather than retain vulnerable minimums indefinitely.
- Vite 7.3.2 fixed earlier file-read issues but is no longer an adequate target: [editor argument/existence-check issues](https://github.com/advisories/GHSA-587h-7wmj-h5pm), [custom middleware](https://github.com/advisories/GHSA-9jrq-w75r-8gcw), and [filesystem allow handling](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) require **7.3.7** on this line. Existing locked React plugin 5.1.4 and Tailwind Vite plugin 4.2.0 both accept Vite 7. Vite 8 is not required for these fixes and is outside those installed plugins' declared Vite peer ranges.
- Vite 7.3.7 accepts esbuild `^0.27.0 || ^0.28.0`, enabling **0.28.1** for [the Windows esbuild fix](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) without forcing an out-of-range override on the existing Vite 7.3.1 (`^0.27.0`) consumer.
- [PostCSS's incomplete source-map fix](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) requires 8.5.23; [source-map-js](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) requires 1.2.2. [Nanoid's 3.x repair](https://github.com/advisories/GHSA-2v37-7h3g-55p8) is 3.3.18. PostCSS 8.5.23 still permits older Nanoid/source-map-js versions, so selecting PostCSS alone is not proof the lock resolves all three fixes.
- [Babel](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) names **7.29.6**, not a guessed 7.29.1. [Browserslist](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) names 4.28.7 and [baseline mapping](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv) 2.11.0. These fit installed consumers' existing semver ranges.
- Use [brace-expansion 1.1.21](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr), [flatted 3.4.2](https://github.com/advisories/GHSA-rf6f-7fwh-wjgh), and [js-yaml 4.3.2](https://github.com/advisories/GHSA-2883-xcg3-v3hh), not their earlier partial fixes. [Minimatch 3.1.4](https://github.com/advisories/GHSA-23c5-xmqv-rm74), [picomatch 2.3.2/4.0.4](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj), [humanfs 0.16.8](https://github.com/advisories/GHSA-p498-v437-472g), and [yaml 2.8.3](https://github.com/advisories/GHSA-48c2-rrv3-qjmp) likewise avoid unrelated consumer-major migrations.
- [ip-address 10.7.4](https://github.com/advisories/GHSA-rxp7-6hxx-x8q5), [undici 7.30.1](https://github.com/advisories/GHSA-2m5v-pch6-74hx), [ws 8.21.0](https://github.com/advisories/GHSA-96hv-2xvq-fx4p), and [Zod 4.6.6](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) cover the latest relevant primary boundaries collected here. All selected existing-line candidates fit their inspected consumer ranges and Node 24 engines, except the explicitly separated old Zod 3.x path and esbuild placement noted above. Metadata compatibility is not behavioral verification.
- Both [extract-zip advisories](https://github.com/advisories/GHSA-jmr9-qjv8-65gv) ([second](https://github.com/advisories/GHSA-7pqw-9j4j-h8q3)) list **no patched release**. Do not invent `extract-zip@2.0.2`, override it to an unverified package, or label archive extraction repaired by changing an unrelated FTP package.
- Puppeteer **25.13.0** is an earlier graph-admissible candidate beyond npm's affected aggregate `<=25.12.0`; its browser helper 3.2.4 no longer depends on extract-zip and its BiDi dependency accepts Zod 4.6.6. That does not establish a fully audited clean candidate. **25.17.0** is the scanner's current suggestion and the preferred compatibility experiment: [upstream release](https://github.com/puppeteer/puppeteer/releases/tag/puppeteer-v25.17.0) rolls Chrome **157.0.8103.38**, helper **3.2.7**, and core **25.17.0**. The older [25.13.0 release](https://github.com/puppeteer/puppeteer/releases/tag/puppeteer-v25.13.0) rolls Chrome 155; retaining it purely to minimize a number would leave an older browser without a browser-security assessment. Neither version is pre-approved for shipping.
- In 25.17.0 the helper changes extraction/proxy dependencies: `modern-tar: ^0.8.6`, with `yauzl` and `proxy-agent` peer ranges. Chromium BiDi declares `zod: ^4.6.5` (still admits the affected 4.6.5), so **the actual resolved lock must be checked for ≥4.6.6**. A fresh candidate-wide audit is mandatory, including new tar/zip/proxy dependencies and optional peer behavior; baseline absence of their advisories is not clearance.
- Puppeteer 25.x requires Node `>=22.12.0`, compatible with root Node 24 policy but **incompatible with the CLI manifest's current advertised `>=20` floor**. Batch C must explicitly reconcile that public compatibility contract, browser download behavior and CLI documentation; no silent major override. Existing CLI calls (`launch`, `newPage`, `exposeFunction`, `goto`, `evaluate`, `close`) are the required real compatibility surface, not proof they still behave identically.

## Minimal cohesive implementation batches (proposed only)

### A — test runner and test HTTP stack

Resolve Vitest/mocker/coverage to **4.1.12** together across root and workspaces, plus undici **7.30.1** through jsdom's existing `^7.21.0`. Avoid a Vitest 5 or jsdom major upgrade. Scope new transitive changes to those required by the selected runner, not a blanket lock regeneration. Include any globally deduped fixed picomatch resolution in the explicit lockfile allowlist and report that ownership interaction with B.

Acceptance: full root tests, coverage invocation, explicit embed tests and explicit CLI tests under Node 24; watch starts/exits normally on loopback without enabling UI/API/browser plugins; config and mocking semantics remain correct. Repeat advisory/path collection and confirm all selected occurrences, not just top-level names.

### B — existing-line build/lint/configuration maintenance

Select Vite **7.3.7** in root/embed/CLI and resolve esbuild **0.28.1** through its supported range; update the existing-major leaf candidates listed in the table. Keep ESLint 9, React plugin 5 and Tailwind 4 rather than using this milestone for framework migration. Use targeted lockfile resolution; only add scoped overrides if normal consumer-supported resolution cannot hold a required fix, with a separately justified plan.

Include shared Node CLI leaves `ip-address`, `js-yaml` and `ws` if C is deferred; if C immediately removes or supersedes those paths, the reviewer may transfer their ownership to C to avoid throwaway lock churn. Keep this decision explicit. Decide the generated-code Vite floor before implementation; do not silently add source edits to a lock-only batch.

Acceptance: lint, formatting, all root/workspace tests and coverage; complete root/embed/CLI builds; runtime/SDK identity and size gates; built editor/export/decode/browser checks, plus a real downloaded generated-code build if its template changes. Inspect all changed lock entries for official registry URLs, integrity, engine/peer compatibility and lifecycle scripts. Require a bounded allowlist of expected package changes and explain every out-of-family resolution.

### C — CLI Puppeteer/browser migration

Plan an isolated **22 → 25** migration with **25.17.0** as the first tested candidate, not an unconditional update command. Reconcile CLI engines, fresh browser installation, Puppeteer installer policy, archive/proxy peer requirements and the BiDi/Zod tree. Keep existing `get-uri → basic-ftp: 6.2.6` unless the audited new graph deliberately removes its entire consumer path. [PR #96](https://github.com/Santiagocetran/BitmapForge/pull/96) already merged that fix at this report's source SHA; it is absent from the fresh audit and must not be redone as unresolved work.

Mandatory CLI verification beyond mocked tests:

1. Clean locked install and a clean, isolated browser cache under Node 24/npm 11, preserving approved npm lifecycle policy; prove the actual selected Chromium binary/version and download path. Do not rely on an old global browser to mask installer failures.
2. Build the real CLI harness, invoke the real CLI subprocess against a trusted small project/model, and complete **both APNG and WebM** render paths. Cover a multi-project batch and explicit fps/width/height/output options. Unit tests in `packages/cli/src/__tests__/cli.test.js` mock Puppeteer; passing them alone cannot clear this migration.
3. Decode produced artifacts and verify dimensions, expected animation/frame/timing behavior, nonblank meaningful pixels and progress/output handling. APNG and WebM byte headers or mocked base64 are insufficient.
4. Exercise missing Chromium, invalid project/format, missing asset and render failure behavior without leaking browser/server processes. Verify loopback-only harness routing and cleanup. Record any existing cleanup limitation rather than silently attributing it to a dependency regression.
5. Re-run existing get-uri/basic-ftp adapter tests when that path remains; retain the PR #96 regression coverage, without constructing vulnerable-version payloads. If proxy/download support changes, use benign loopback fixtures or a separately approved adapter test plan; do not weaken new upstream defaults to make an obsolete configuration pass.
6. Repeat full and omit-dev audits on the actual resolved graph. Confirm extract-zip and pinned old BiDi/Zod paths are gone, inspect new helper/proxy/zip/tar paths, and classify any remaining/new advisories. Run all B acceptance gates too; matching browser bundle bytes does not replace real Node adapter/render checks.

## Approval and release/closure gates

Before any batch: provide a package/path-specific change allowlist, proposed manifest/lock/engine/template changes, primary fixed-version evidence, behavioral test list and rollback boundary. Obtain an **explicit independent plan acceptance**, separate from later implementation review. This report itself is not independent acceptance and does not authorize installs, package writes or remote actions.

After each implemented batch: compare reproducible before/after audits under the same runtime, verify source/lock identity and every affected occurrence, retain genuine failures, and have a separate reviewer accept the actual diff/evidence. Fresh advisories can change the target set; do not promise a zero count before resolving and auditing the real candidate graph.

To close #94: all approved root/embed/export/decode/CLI/browser gates must pass on the final revision, real CLI renders must be demonstrated, and any residual finding needs a named dependency path, affected environment/input, mitigation, owner and explicit risk acceptance or follow-up. Merely binding a dev server locally does not resolve its advisory. External hosted deployment/provenance acceptance belongs to the release-audit workstream.

**Verified in this research:** current audit totals, 84 primary advisory metadata records, installed dependency/consumer paths, selected registry candidates and engines/peers, checked-in exposure/configuration boundaries, PR #96 already merged. **Not verified:** candidate installs, patched tests/builds/renders, production module inventory or deployed-site security. No implementation tests were claimed or substituted with fabricated results.
