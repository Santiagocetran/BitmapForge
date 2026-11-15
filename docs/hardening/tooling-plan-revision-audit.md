# Tooling A/B revision — independent preimplementation audit

## Verdict: ACCEPT

**Accept the revised plan's design and bounded execution protocol.** R1–R3 from `tooling-plan-independent-audit.md` have adequate written dispositions. This supersedes that audit's REVISE verdict for the exact revision identified below; it does not erase the original findings or constitute candidate/implementation acceptance.

A can be accepted and executed independently of conditional prerequisite P. B is expressly blocked until the original generated-project production gate has either an independently accepted no-repair disposition or a separately accepted P implementation/evidence checkpoint. P's source permission is not imported into B. No implementation, installation, test, build or browser execution was performed by this reviewer.

## Reviewed identity and evidence boundary

- Checkout: `gloin/release-hardening`, HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01`.
- Reviewed `tooling-plan.md` SHA-256: `edd925f2c57dae38dae31fcf66a916876061380f7fdf12f54908f1eec5ec74a7`.
- Reviewed lock SHA-256: `74e61c99884661fd128be89ef813dabac5c24d25ec8a72d82c6e3e861c6f4724` (lock v3).
- Read AGENTS and the web-product-development skill, dependency-review and browser-reliability references. Named COLLAB documents and checked repository Hermes/Codex configuration candidates were absent; no collaboration activation is inferred.
- Independently read all three manifests, parsed the lock's occurrences/consumer edges, and inspected root/workspace build and test configuration, CI/runtime guards, browser specs/helpers, export generator/unit tests and installed Vite asset-copy code. Read the original audit and baseline verification report; historical executions remain attributed to their actual executor, not this review.
- Review identity is pinned to the plan/source baseline, not acceptance of every live worktree edit. Final read-only status showed concurrent CLI source/test/fixture changes by another lane; these were not authored, restored or accepted by this reviewer. Both reviewed plan hashes and the lock hash remained unchanged. `git diff --exit-code` consequently returned 1 for that other lane's changes; this was not an executed test failure.
- Independently inspected cached **npm 11.21.2 source**, not an executed resolver: `/home/agent/.npm/_npx/1805deb36059d765/node_modules/npm`. Also read official npm update/override and Vite public-asset documentation. No new candidate registry/semver-overlay exercise was performed; unchanged target metadata findings in the original audit remain historical evidence and must be refreshed as the revised plan requires.

## R1 — valid selector, scoped fallback and final-state reconciliation: resolved

### Supported name-targeted candidate interface

Plan lines 90–103 correctly distinguish bare package-name inputs from literal lock-path validation keys. The explicit `--workspaces --include-workspace-root` commands participate in root plus the actual `@bitmapforge/embed` and `@bitmapforge/cli` workspaces. They no longer pass `node_modules/...` paths or `name@version` to `npm update`.

Independent npm-source checks corroborate the distinction:

- `lib/commands/update.js:45,61–72` passes named arguments and selected workspace names into Arborist.
- `build-ideal-tree.js:243–255` rejects arguments whose parsed raw value differs from the bare name (`EUPDATEARGS`). Its named-update traversal at `:464–468,746–753` searches inventory names, not literal placements.
- `reify.js:1761–1770` explicitly preserves update's ability to save the lock despite `save=false`; the revised command is not invalidated by the generic documentation's save warning.

Name selection is **not** exact-version/path isolation. The plan now treats each operation as rejectable, parses the entire graph, rejects newer/collateral selections, and restores only that operation's isolated snapshots. No update command has been proved to produce the proposed graph by this review.

### Repeated-name constraints match the actual graph

| Consumer / occurrence                                    | Actual baseline             | Accepted constraint boundary           |
| -------------------------------------------------------- | --------------------------- | -------------------------------------- |
| jsdom 28.1.0 → undici                                    | `^7.21.0`, root 7.24.6      | 7.30.1 within A; jsdom unchanged       |
| tinyglobby 0.2.15, Vite 7.3.1, Vitest 4.0.18 → picomatch | root 4.0.3                  | root 4.0.4 in A, retained in B         |
| micromatch 4.0.8 → picomatch                             | `^2.3.1`, nested 2.3.1      | unchanged in A, nested 2.3.2 only in B |
| Hooks 7.0.1 / zod-validation-error 4.0.2 → Zod           | root 4.3.6; both accept 4.x | root 4.6.6 only in B                   |
| chromium-bidi 0.6.3 → Zod                                | exact 3.23.8 at nested path | untouched; never coerced to major 4    |
| ESLint eslintrc / cosmiconfig → js-yaml                  | one shared root 4.1.1       | shared B ownership retained            |

The fallback specifies exact temporary Vitest/coverage declarations (and exact Vite in B), root-only consumer-scoped overrides, `$` references for direct-dependency self constraints, and no global Zod/picomatch override. npm's `node.js:1390–1400` checks conflicting direct overrides; the reference form addresses that restriction. The permanent get-uri pin remains literal and unchanged. A excludes B's micromatch/Zod changes and must retain Vite 7.3.1.

The displayed override object is **not** a complete ready-to-run graph recipe. The required complete per-consumer edge ledger/JSON, exact selected versions and platform list must be frozen and independently inspected before resolution (lines 114–132). A's `$vite` reference is not an exact baseline pin while its declaration remains a caret; it must not be treated as proof of Vite isolation. The explicit exact-result validator and stop/amend rule still require locked 7.3.1 in A. This is a bounded candidate-generation limitation, not permission to accept a newer Vite or to silently add an A manifest pin.

### Removal and final installation are specified

Lines 133–134 restore saved final caret manifests byte-for-byte, remove every temporary override/declaration, reconcile mirrors through npm rather than record splicing, revalidate the full parsed graph, and run clean final-manifest `npm ci --workspaces --include-workspace-root`. Before/after manifest/lock hashes must match. `npm ls --all --json`, explains, valid consumers, absence of temporary overridden edges and independent parsed-diff review remain separate hard gates. A failure to produce that graph stops for a newly accepted strategy; no hand-written integrity/URL/lock records or broad refresh is authorized.

The unchanged target/closure design remains bounded: aligned 4.1.12 runner family; explicit raised-range closure including intentional std-env prerelease; preserved satisfying standard-schema, Chai, js-tokens major lines and other closure; B's Vite/esbuild/PostCSS/Babel/data/humanfs and explicit leaves; metadata-derived cross-platform esbuild optional records. New consumers/placements or additional closure require the plan's bounded amendment, not a family wildcard.

## R2 — complete finite built-route ledger: resolved

Static inspection confirms **six existing CI cases plus four complementary cases**, representing **nine unique output routes plus one non-export App baseline**. Parameterized test counts were derived from their loop values, not literal `test(` counts alone.

| Case / route  | Actual spec                          | Evidence contract                                                              |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| App baseline  | `export.visual.spec.js:70`           | Meaningful uploaded-model rendering; not an output route                       |
| APNG          | `export.visual.spec.js:90`           | Real download, animation structure and decoded visible content                 |
| Sprite Sheet  | `export.visual.spec.js:128`          | Real PNG dimensions/content                                                    |
| Code ZIP      | `export.visual.spec.js:156`          | Real archive plus existing instrumented static-runtime sizing/rendering        |
| CSS ZIP       | `export.visual.spec.js:344`          | Actual archive/animation changes                                               |
| Video         | `export.visual.spec.js:483`          | Actual container and meaningful displayed/decoded frame                        |
| GIF           | `redesign-artifacts.spec.js:39`      | Actual decode, animation, occupancy/color/entropy and busy responsive behavior |
| React         | `redesign-artifacts.spec.js:108–137` | UI archive settings, fixture model and engine bytes                            |
| Web Component | same two-value loop                  | UI archive settings, fixture model and engine bytes                            |
| Embed         | `redesign-artifacts.spec.js:140`     | SDK/archive identity, supported runtime/sizing and disabled image-input action |

CI's exact `testMatch` cannot discover the complementary cases. The revised external config explicitly selects that spec, imports the existing installed-runner config, preserves built strict preview/no reuse, and specifies absolute outputs/cwd, one worker, **90 seconds, zero retries**, runner-owned retain-on-failure traces and screenshots. It does not substitute the separate 180-second source-export config. Baseline/A/B must each discover and execute six and four cases, with sequential server ownership and distinct artifact/result directories.

The four `ascii-generated` cases are separately and accurately labeled source-builder/instrumented Vite comparisons (React/Web Component × two color modes), not built UI downloads or independent consumer production builds. Their private root-webServer-disabled invocation does not change those assertions.

Trace ownership is grounded in actual source: Code ZIP reads `testInfo.project.use.trace` and starts manual tracing only when absent/off (`export.visual.spec.js:205–211,282–285,330–332`). Retain-on-failure therefore remains runner-owned even for explicit contexts. Real failure attachments must be inspected if failures occur; no trace disabling is permitted to obtain a pass.

## R3 — generated production asset blocker: resolved as an explicit conditional gate

The suspected defect is source-grounded: `codeExport.js:61–64` fetches document-relative `./models/<name>`, `:75–77` emits only project-root `models/`, and `:96` supplies default Vite config. Installed Vite defaults to `publicDir: 'public'`, `copyPublicDir: true`, and copies public assets into outDir; a plain fetch string is not evidence of an emitted asset.

The revised plan requires the **original real UI download before edits**, separate install/build/preview/dev outcomes, generated dist inventory/model byte identity and actual model response body (not a 200 HTML fallback). Immutable archive/source evidence, geometry/pixels, errors/requests, initial backing size and container-only resize cannot be replaced by the existing patched Code ZIP test. No actual omission/failure was reproduced in this review.

P is now separately planned and audited in `generated-project-prerequisite-plan-audit.md`. If reproduced, it owns an exact three-file repair and its own implementation acceptance after A, before B. B retains its floor-only generator permission and must preserve accepted P behavior/tests. If diagnosis differs, repair stops for amendment; if no defect exists, evidence requires independent no-repair disposition. A may carry the unchanged blocked-B baseline disposition explicitly; A does not claim the baseline defect fixed.

## Preserved contracts

- Node 24.x root/lock, `.nvmrc` 24 and all existing CI selectors/runtime rejection mutations; workspace advertised `>=20` minima unchanged.
- Exact get-uri → basic-ftp 6.2.6 override and locked tarball/integrity, plus real adapter tests in `packages/cli/src/__tests__/ftp-security.test.js`; CLI mocks are not render evidence.
- User lifecycle restrictions, sanitized effective npm policy, CI-equivalent Puppeteer skip-download, root Husky and CLI workspace prepare/build accounting, esbuild postinstall/native checks and explicit builds if policy skips hooks. No allow-all workaround.
- Fresh previously nonexistent Playwright cache, installation completion/selected binary identity, unchanged runner/browser version and supported-platform requirement. Missing host dependencies/network are blockers, not permission for unauthorized host installs.
- Full root/embed/CLI/decode tests; real v8 coverage; bounded watch initial run/rerun/quit/cleanup; no assertion, snapshot, inclusion, threshold, retry or timeout weakening.
- App/embed/CLI builds, all-file provenance/delta review, SDK three-copy identity, no alias leakage and CI-exact gzip ≤51200 bytes. A expects unchanged output except individually explained nondeterminism; B compiler/data changes require semantic attribution rather than invented byte equality.
- Full and omit-dev audit/graph evidence, all occurrences/advisory paths, named C residuals (including old Puppeteer installer/transport/BiDi paths), distinct reversible A/P/B checkpoints, independent implementation audits and final full reruns after repairs.
- No publication, CI/workflow/settings change, merge/deploy or issue closure approval.

## Execution prerequisites, not material design objections

There are **no outstanding material design blockers** for this reviewed A/B plan. Acceptance is not a declaration that the following work has happened:

1. Refresh official candidate/advisory metadata and freeze/review complete scoped JSON, consumer edges and literal optional-platform paths before candidate generation. Validate fdir's picomatch peer as well as the ordinary edges; overrides alone are never proof of placement.
2. Establish/reconcile the complete original baseline and fresh install/browser evidence. A/B plan acceptance does not waive the original generated-project diagnosis or any required A gate. Existing historical coverage/browser records do not establish missing watch/complementary/fresh-consumer gates.
3. Configure the source-generated suite's **actual** `BITMAPFORGE_SOURCE_OUTPUT` to its external task-specific directory; `BITMAPFORGE_EXPORT_OUTPUT` does not control that spec. Its `afterAll` removes its temporary generated tree, so retain required evidence before teardown or explicitly report this instrumented suite's retention limit. This is bounded harness preparation, not permission to edit the spec or label synthetic archives immutable downloads.
4. Real resolver/clean-ci results, policy-compatible hooks/native behavior and every unchanged-budget suite remain mandatory. Freeze/read back effective private configs before running; failure is failure, not an implicit budget expansion.
5. B cannot start without the accepted A checkpoint and accepted conditional P/no-repair disposition. Independently review final graph, source and real outputs after each slice.

**Final decision: ACCEPT A/B plan; A independently executable subject to its stated preflights; B conditionally gated. Neither A nor B implementation is accepted or verified by this audit.**
