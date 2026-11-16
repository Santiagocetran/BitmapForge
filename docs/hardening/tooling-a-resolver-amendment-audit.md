# Tooling A resolver amendment — independent pre-resolution audit

## Verdict: ACCEPT Option M

**ACCEPT Option M for the exact proposal identified below, including its complete temporary override object and all 24 complete before/after records.** The six additional records are supported inventory of bytes already bundled in an unchanged Tailwind tarball, not permission for arbitrary satisfying upgrades. The five consumer-scoped retention constraints are justified and bounded. No material design objection remains to this candidate-generation protocol.

This is independent **pre-resolution strategy/path acceptance**, not acceptance of either rejected candidate, a claim that npm can produce the specified final graph, or A implementation acceptance. A new candidate must pass every staging, final-manifest reconciliation, idempotence, clean-install and behavioral gate. Failure at any stage means reject, retain evidence and stop for independent amendment; no additional constraints, package upgrades, lock splicing or alternative resolver strategy are implicitly authorized. Option S is not selected. B, prerequisite P, CLI migration and release retain their separate gates.

## Reviewed identity and scope

- Integration repository: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`, branch `gloin/release-hardening`, HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01`.
- Original isolated implementation worktree: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-tooling`, same HEAD.
- Reviewed amendment SHA-256: **`8143ef8c30e3778e394913ab2394f477836dec19491aaaa335631edbe09b9e73`**.
- Previously accepted `tooling-plan.md` SHA-256 independently rechecked: `edd925f2c57dae38dae31fcf66a916876061380f7fdf12f54908f1eec5ec74a7`. Read its revision audit and the retained execution checkpoint/verification report; their historical results are not reviewer-run tests.
- Evidence root, abbreviated E: `/home/agent/.hermes/profiles/gloin/cache/scratch/tooling-a-execution/`.
- Read AGENTS and the web-product-development skill/dependency-review reference. Checked repository HERMES/CODEX bootstrap candidates and the four named COLLAB files; they were absent. Collaboration remains off.
- Sole authored file is this audit. Existing integration CLI changes are another lane's work and were neither modified nor accepted. No install, update, resolution, build, browser launch, package lifecycle execution, source/manifest/lock edit, remote mutation or publication occurred.

The reviewer ran read-only Python JSON/hash comparisons, official-registry HTTP reads, in-memory tar inspection, and semver comparisons using the existing npm dependency. No tarball was installed or extracted to disk. An in-memory comparison overlay was used only to inspect the proposed graph; it was not written as a lock or presented as a generated candidate.

### Original-state evidence

Programmatic assertions verified each of the following hashes against CHECKPOINT.json, E/original and **both live checkouts**:

| File                          | SHA-256                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `package.json`                | `b5f810f43db86d3c0973829fab25c98218b24e14b2482106b386e4fe741c4354` |
| `packages/embed/package.json` | `8b3c9665643f5335027ff7ee011d3ac964b5cf54817281c47459fef64c66a927` |
| `packages/cli/package.json`   | `9fafaa672ac1ceea7d00692bf4278ade92221ba8ef68abd25ef8e3935b307f06` |
| `package-lock.json`           | `74e61c99884661fd128be89ef813dabac5c24d25ec8a72d82c6e3e861c6f4724` |

All eight evidence-file hashes in the amendment's identity table also matched actual bytes. CHECKPOINT.json reports original installed dependencies and no installed candidate; this audit verified original manifest/lock identity, not every installed file.

## 1. Exact retention object and consumer completeness: PASS

Parsed the amendment's first JSON block and compared it field-by-field with E/temporary-overrides.json. **Exactly five child entries are added; every old entry remains identical and none is removed:**

| Consumer scope                                           | Child         | Official new range | Retained locked version |
| -------------------------------------------------------- | ------------- | ------------------ | ----------------------- |
| `vitest` with `".": "$vitest"`                           | `expect-type` | `^1.3.0`           | 1.3.0                   |
| `vitest` with `".": "$vitest"`                           | `obug`        | `^2.1.1`           | 2.1.1                   |
| `vitest` with `".": "$vitest"`                           | `tinyexec`    | `^1.0.2`           | 1.0.2                   |
| `@vitest/coverage-v8` with `".": "$@vitest/coverage-v8"` | `obug`        | `^2.1.1`           | 2.1.1                   |
| `@vitest/expect@4.1.12`                                  | `chai`        | `^6.2.2`           | 6.2.2                   |

Enumerated dependency, optional-dependency and peer consumer declarations across every original/proposed package record: these are all five immediate consumers of the four retained leaves in the inspected graph. Semver checked all five. Fresh official exact-version metadata for Vitest, coverage-v8 and expect confirmed every displayed range. Baseline expect-type `^1.2.2` and Chai `^6.2.1` become higher lower bounds, but their existing 1.3.0/6.2.2 records already satisfy them. obug/tinyexec ranges were already present. The proposed temporary overrides do not authorize any change to the four retained full lock records.

Independently checked all **31** existing frozen target edges against the proposed parent versions, dependency/peer ranges, target paths and versions. Every range satisfies; every ordinary selected edge has the exact scoped override. The additional five retention edges do not replace or weaken that ledger. fdir's picomatch peer remains covered.

The complete displayed temporary object is accepted, not just the five-row delta. For precise block identity, SHA-256 of the first captured JSON code-block content (no fences or trailing newline) is `0b14e1432d0d3690cdaa9026f396b171a1183c97c899ec43fccebbf16b56812a`. Whole-document identity above remains authoritative.

Direct Vitest/coverage scopes reference temporary exact 4.1.12 declarations. Vite/jsdom scopes also use direct `$` references, avoiding the retained EOVERRIDE failure; npm 11.21.2 `arborist/lib/node.js:1395–1400` independently corroborates the direct-override conflict rule. **`$vite` and `$jsdom` reference unchanged caret declarations, not exact locked versions.** Any Vite/jsdom movement must therefore fail full-record validation rather than prompt an unapproved pin. No global retention override, direct transitive declaration or workspace override is permitted.

## 2. Complete 24-record allowlist and classification: PASS

Parsed the full appendix rather than relying on its table or a textual diff. Assertions verified:

1. Exactly **24 unique literal paths**: the **15** E/targets paths, **3** declaration mirrors, and **6** additions whose before value is null.
2. Every complete before record deep-equals E/original (all six additions are actually absent there).
3. All 15 target after records, including every URL/integrity/dependency/peer/engine/flag field, deep-equal the corresponding records in the rejected constrained snapshot and have the exact previously frozen target versions.
4. All six addition records completely equal the rejected snapshot's bundled inventory, without invented standalone URL/integrity fields.
5. Each final mirror changes only Vitest to `^4.1.12`, plus root coverage-v8 to `^4.1.12`. All remaining mirror fields are unchanged.

Accepted exact target versions remain Vitest and the eight enumerated @vitest records **4.1.12**, undici **7.30.1**, root picomatch **4.0.4**, std-env **4.0.0-rc.1**, tinyrainbow **3.1.0**, es-module-lexer **2.0.0**, ast-v8-to-istanbul **1.0.0**. The intentional std-env prerelease is not silently exchanged for a later stable release. No relocation or removal is allowed.

SHA-256 of the complete second JSON block's content (same capture convention) is `9f3dda0c5ac27404349cd4fc4ca896baf48d8137b1c28471523004b6f3a7acb2`. Acceptance refers to every full record in that block, not merely the versions repeated here.

Fresh read-only official metadata was retrieved for all 15 exact targets. Their published tarball URL/integrity and dependency/optional/peer/peer-meta/engine/license/bin/funding metadata matched the frozen after records, allowing npm's ordinary funding-string-to-URL-object and bin `./` prefix normalization. Initial literal comparisons surfaced those representation differences; corrected comparisons passed without altering any record. Saved exact-target metadata also declares no preinstall/install/postinstall; prepare/build scripts remain distinct and do not receive execution permission.

### Rejected attempts remain rejected

Recomputed full parsed differences from the actual snapshots:

- Constrained: **27 changed records**, no removals = 15 targets + 3 staging mirrors + 9 extras. The extras are six bundled records and **expect-type 1.3.0 → 1.4.0, obug 2.1.1 → 2.2.1, tinyexec 1.0.2 → 1.3.1**. These three are unnecessary satisfying upgrades, not necessary closure.
- Name-targeted runner: **26 changed records**, no removals = 13 runner/closure paths + 3 staging mirrors + 10 extras. Chai **6.2.2 → 6.3.0** is the extra tenth path. Four of the 13 selected paths have wrong versions: std-env 4.3.0, tinyrainbow 3.2.0, es-module-lexer 2.3.2, ast-v8-to-istanbul 1.0.8. Undici/picomatch remain original because their leaf operation did not run. These facts do not increase the changed-path count.

Neither snapshot is now accepted. Their correct target/bundle records are comparison evidence only, never lock-edit payloads. Their lock top-level non-packages values remain original; final generation must independently preserve those values too.

## 3. Official unchanged Tailwind bytes and bundled inventory: PASS

Independently compared the complete `node_modules/@tailwindcss/oxide-wasm32-wasi` record across original and both rejected locks: **identical**, version **4.2.0**. Its original bundle list and dependencies already name all six children. Original CPU `wasm32`, engine `>=14.0.0`, dev/optional flags, license, URL and integrity are unchanged. Fresh official exact-version registry metadata corroborated these fields.

Fetched the official parent tarball read-only into memory:

- `https://registry.npmjs.org/@tailwindcss/oxide-wasm32-wasi/-/oxide-wasm32-wasi-4.2.0.tgz`
- Compressed bytes: **1692934**.
- Recomputed SHA-256: **`1d8ec89a30aaa63cd2eec596a5bef78584152a8de50183b85033017b3c16aef1`**.
- Recomputed SHA-512 SRI equals original lock and official registry: `sha512-xuDjhAsFdUuFP5W9Ze4k/o4AskUtI8bcAGU4puTYprr89QaYFmhYOPfP+d1pH+k9ets6RoE23BXZM1X1jJqoyw==`.

Read each actual bundled package.json and compared name/version, dependencies, license and funding to the proposed record. Independently reproduced the amendment's actual regular-file counts and uncompressed sizes:

| Child below the parent's literal `node_modules/` | Version | Files | Bytes   |
| ------------------------------------------------ | ------- | ----- | ------- |
| `@emnapi/core`                                   | 1.8.1   | 15    | 1838016 |
| `@emnapi/runtime`                                | 1.8.1   | 17    | 424124  |
| `@emnapi/wasi-threads`                           | 1.1.0   | 15    | 227505  |
| `@napi-rs/wasm-runtime`                          | 1.1.1   | 6     | 5218530 |
| `@tybys/wasm-util`                               | 0.10.1  | 39    | 774885  |
| `tslib`                                          | 2.8.1   | 14    | 90359   |

Every proposed addition has exactly the frozen dev/optional/inBundle metadata and no standalone resolved/integrity. The underlying bundled bytes are identified by **parent integrity plus actual tar members**, not by standalone registry package tarballs. This supports precisely six inventory additions; it does not authorize Tailwind, oxide, platform or child version refreshes.

The parent has no scripts. All six bundled manifests have no Node engines and no preinstall/install/postinstall; wasm-util does declare `prepare: npm run build`, and the disclosed build/test/watch/lint scripts match the tar. Fresh retained-leaf metadata confirms expect-type Node >=12.0.0, tinyexec/Chai >=18 and no obug engine; tinyexec has prepare, but none of these leaves has preinstall/install/postinstall. Their original lock dist identities match official exact-version metadata. No lifecycle permission is added.

Targeted source inspection of parent `tailwindcss-oxide.wasi.cjs`/`wasi-worker.mjs`, emnapi core/runtime entry shims and wasm-util CJS exports confirmed existing fs/path/WASI/worker-thread capabilities and process.env inheritance. These are real optional build-tool bytes, not empty harmless placeholders. Neither absence of engines nor inventory identity proves runtime safety.

Read the actual cached npm **11.21.2** Arborist source: `build-ideal-tree.js:890–923` opens bundled tarballs for complete trees, explicitly including package-lock-only, and loads bundled children; `:1248–1267` leaves bundled edges owned by the bundle. This corroborates the observed materialization. It does not prove every npm version/procedure must add them; changing npm or platform coverage to suppress them is not authorized.

## 4. Executable, finite final-state protocol: ACCEPT

The amendment specifies valid npm commands, root plus both real workspaces, original-lock input, exact temporary manifest state and a deterministic comparison contract. It permits **one new constrained candidate sequence**, not retries with improvised variants:

| Stage                | Required state/action                                                                                                                              | Hard acceptance boundary                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Preflight            | Fresh isolated original checkout; verify four original hashes; record Node24.22.3/npm11.21.2, effective policy and frozen evidence                 | No rejected-lock reuse; no NPX allow_scripts contamination; no policy relaxation                                            |
| Staging              | Exact runner declarations, accepted complete root object; `npm install --package-lock-only --ignore-scripts --workspaces --include-workspace-root` | 15 exact targets + 3 exact staging mirrors + exactly 6 bundled additions; everything else equal; exit 0 alone insufficient  |
| Final reconciliation | Restore saved final caret manifest bytes, sole permanent override; run the same lock-only command using npm-generated candidate lock               | All 24 final records exact; mirrors match final root/CLI/embed; no temporary declaration/constraint; reject any reselection |
| Idempotence          | Save H1; repeat the same final-manifest lock-only command once                                                                                     | Four byte hashes H2 = H1 and identical parsed graph, not merely semver equivalence                                          |
| Clean final ci       | `npm ci --workspaces --include-workspace-root`, final manifests only, unchanged script policy, Puppeteer skip-download                             | Exit 0; H3 = H2 = H1; graph/explains, valid consumers and no temporary overridden edges                                     |
| Verification         | Entire parent A ledger and independent implementation review                                                                                       | No candidate behavioral acceptance borrowed from baseline; all preserved budgets/artifact/security gates                    |

Saved E/final manifests independently parse to **only** the four approved caret-floor changes; root overrides deep-equal `{"get-uri":{"basic-ftp":"6.2.6"}}`, workspace overrides remain absent. Their actual byte hashes are:

- Root: `b45fd5569dace6cc162b0fb3d5af1f4d600ebf8916cd0e7312a99cc6546e8b57`.
- Embed: `4e54dbb2629db93b6b36379d3181151a5b6a1cdff970463277e9fb6b730b3eed`.
- CLI: `2d93fbe1aba32c9d1b31403c643eee9c35f2d76fb9a6eea8e75e416eaeea3551`.

No hand-edited mirrors, record copying from the appendix/rejected lock, lock deletion, splicing, broad update, audit-fix, force, dedupe, platform omission, permanent retention workaround or npm downgrade is permitted. Reconciliation may legitimately fail by reselecting a leaf after override removal; the plan explicitly rejects that result. **The bounded protocol is executable as a rejectable experiment; its success is not established by this audit.** Freeze actual validator/config/manifest evidence before running and retain each command's complete output/exit separately.

## 5. Security, runtime and unrelated-package invariants: PASS as policy

Comparison-only semver validation under the existing **Node24.22.3** binary checked **1326 satisfying package dependency/optional/peer edges**. The sole out-of-declared-range edge was the already accepted intentional security override `get-uri → basic-ftp`, declared `^5.0.2` but fixed at **6.2.6**. A first generic range check correctly surfaced it; the final check allows only that exact unchanged baseline exception. This is not permission to treat other range failures as expected. Optional absent peers are not newly installed to manufacture validation.

Original basic-ftp has one literal occurrence, `node_modules/basic-ftp`; its complete record must remain unchanged, including:

- URL `https://registry.npmjs.org/basic-ftp/-/basic-ftp-6.2.6.tgz`.
- Integrity `sha512-0EjZCaodOz6yiokv2JA1VyKGNdGxULZ+GGlPgG9tm4d+T/bHtX1hUch8CumDneBfpIbiSdn7TaCGwpM+gwsOlw==`.

The permanent override and real FTP adapter regression gate remain mandatory; an npm graph's expected permanent overridden label is not confused with a forbidden temporary override.

The full-record equality rule preserves every unlisted record, not just a handpicked major-version list. Explicit comparisons confirmed original Vite7.3.1, jsdom28.1.0, Rollup4.60.0, esbuild0.27.3, React19.2.4, Three0.182.0, ESLint9.39.3, React plugin5.1.4, Playwright1.59.1, Puppeteer22.15.0, nested BiDi Zod3.23.8/root Zod4.3.6, both js-tokens lines, nested picomatch2.3.1, standard-schema1.1.0, magicast0.5.2, convert-source-map2.0.0 and four retained leaves. Tailwind parent/platform and all unrelated optional binaries remain covered by the same equality rule.

Root manifest/lock Node24.x and workspace >=20 values match original; `.nvmrc` is 24 and all five CI setup-node selectors use `.nvmrc`. No runtime/config/workflow edits are authorized. Existing user script restriction, explicit native esbuild/build checks and Puppeteer skip-download accounting remain intact; skipped hooks are not installer proof.

## Outstanding execution and evidence limitations

- No new candidate exists from this review. Final reconciliation, idempotence, clean candidate ci, actual npm graph/override behavior and compatibility tests remain **unexecuted**, not green.
- Official registry identities, tar members and targeted JS entry inspection establish published-byte inventory, not publisher/signature/provenance verification, a complete JS/WASM security audit, WASI/worker compatibility, or zero advisories. Fresh full/omit-dev audits and exact advisory/path review remain mandatory before acceptance; explicit bundle inventory can change scanner visibility without changing parent bytes.
- Historical baseline nonbrowser results remain attributed to the execution checkpoint. Its five documentation format failures remain failed gates requiring separate disposition, not a waiver. Fresh-cache browser launch/native bitmap2/built6/complementary4/source-generated4 and unmodified real Code ZIP production diagnosis remain outstanding behind serial browser ownership.
- No assertions, retries, timeouts, trace ownership, coverage/watch inclusion, SDK three-copy identity/51200-byte limit or complete 51-file baseline output comparison is weakened. A still expects byte-identical app/embed/CLI output unless individually accepted nondeterminism is evidenced.
- On failure preserve external candidate evidence and restore only A-owned manifests/lock in its isolated checkout to the four original hashes. Recreate baseline dependencies under unchanged policy if an installed candidate must be rolled back; never reset another lane or mix baseline manifests with candidate dependencies.

**Final decision: ACCEPT Option M for this exact hash, full temporary object and complete 24-record comparison contract before any new resolution. This audit supplies no implementation, test, install, B/P/CLI or release acceptance.**
