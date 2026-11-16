# Tooling A — minimal resolver amendment (proposal)

## Decision and authority

**AWAITING INDEPENDENT ACCEPT. Do not resolve, install or implement from this document until a separate reviewer delivers an explicit ACCEPT selecting a policy option.** This is an amendment to `tooling-plan.md`, not acceptance of either rejected candidate. Recommend **Option M: retention constraints plus six precisely frozen bundled-metadata records**. No satisfying-leaf upgrades are requested. A is still blocked; B, generated-project prerequisite P and the CLI migration retain separate ownership/approval gates.

This author inspected existing snapshots, manifests, full parsed lock records, checkpoint/verification records, official registry metadata and the existing Tailwind WASM tarball in memory. No npm install/update/resolve, package execution, source/manifest/lock edit, commit, browser launch or candidate test was performed. The only deliverable is this document in the integration repository. Integration CLI edits belong to another lane and were not modified. AGENTS governance was read; named repository Hermes/COLLAB bootstrap files were absent.

## Evidence identity and diagnosis

Evidence root: `/home/agent/.hermes/profiles/gloin/cache/scratch/tooling-a-execution/` (abbreviated E below). Original implementation checkout: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-tooling`, source `550842cab61002c7cc6563e50b9fcdeb17c9bf01`. Its live lock was read and hashes to **74e61c99884661fd128be89ef813dabac5c24d25ec8a72d82c6e3e861c6f4724**, matching E/original and the checkpoint. Installed dependencies remain original baseline according to the checkpoint; this author did not reinstall them.

| Evidence file relative to E                   | SHA-256                                                            |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `original/package-lock.json`                  | `74e61c99884661fd128be89ef813dabac5c24d25ec8a72d82c6e3e861c6f4724` |
| `resolver-direct-reference/package-lock.json` | `a9fa5046da00bac5af01bd0da981af705363e245387b48cb0c8166b1328714a8` |
| `constrained-parsed-diff.json`                | `9a53b7b59536d702c8296c69fceee4771fe4ec8614327ca424bbddfa5818e790` |
| `name-targeted-runner-diff.json`              | `9a634addef5b8d8bd9bcd0a89dd989a4182dbdd6573315bedde61ea00ff8aa1f` |
| `temporary-overrides.json`                    | `d60fa4a255bb66fc3a3e6999f6461bc42a363ea2768d0204b6eeded723b85587` |
| `freeze.json`                                 | `2e2a3b7f53b867dc9fd9e0f4e71b75f2de782cde111e501d0acb400a8a1a7363` |
| `edges.json`                                  | `3fbb4c51239ab1576cea932072691c4fc1df4a3c1dd3f75f4221aa08a912f780` |
| `complete-closure.json`                       | `3bc7c9dd1082593c9f5107e3b621b318a9d17becbb8a92687b1069270d8d9a66` |

Read E/CHECKPOINT.{md,json}, `tooling-a-verification.md`, `targets.json`, `edges.json`, `complete-closure.json`, original/final/temporary manifests, rejected locks and metadata. Parsed counts were independently recomputed, not inferred from textual diff:

- **Constrained attempt: 27 changed `packages` records = 15 exact A targets + 3 temporary declaration mirrors + 9 extras.** The extras are three unnecessary version changes and six bundled records. No removal occurred.
- **Name-targeted runner alternative: 26 records = 13 runner/closure targets + 3 mirrors + 10 extras.** It did not run the undici/picomatch leaf step; those two stayed baseline. The extra tenth path is Chai. Four of its 13 target paths also selected the wrong versions: std-env 4.3.0, tinyrainbow 3.2.0, es-module-lexer 2.3.2 and ast-v8-to-istanbul 1.0.8. These are target-version violations, not four additional paths beyond the ten extras. Neither result is accepted.
- Attempt 1's EOVERRIDE arose from exact `jsdom@28.1.0` override scope conflicting with the direct caret declaration. The retained corrected object uses `jsdom: { ".": "$jsdom", "undici": "7.30.1" }`; this is the same direct-dependency self-reference rule already used for Vitest/Vite/coverage, not a jsdom update.

### Three version refreshes (and alternative-only Chai)

| Literal root record        | Baseline → rejected constrained      | Exact new consumer/range                        | Proposed retention  |
| -------------------------- | ------------------------------------ | ----------------------------------------------- | ------------------- |
| `node_modules/expect-type` | 1.3.0 → 1.4.0                        | vitest 4.1.12 → `^1.3.0`                        | 1.3.0               |
| `node_modules/obug`        | 2.1.1 → 2.2.1                        | vitest 4.1.12 and coverage-v8 4.1.12 → `^2.1.1` | 2.1.1 at both edges |
| `node_modules/tinyexec`    | 1.0.2 → 1.3.1                        | vitest 4.1.12 → `^1.0.2`                        | 1.0.2               |
| `node_modules/chai`        | unchanged 6.2.2; alternative → 6.3.0 | @vitest/expect 4.1.12 → `^6.2.2`                | 6.2.2               |

Existing versions satisfy every enumerated new edge. Baseline already had the obug/tinyexec edges and expect-type `^1.2.2`; the new expect-type lower bound still admits 1.3.0. Baseline expect declared Chai `^6.2.1`; 6.2.2 already meets the new lower bound. There is no required new closure here. The changed parents were reconstructed with unconstrained admissible children and the resolver selected newer satisfying versions. Temporary overrides fixed selected targets but did not express retention for these children. Success of the resolver is not permission for this churn. The evidence establishes admissible reselection, not a unique traced internal cause for each Arborist placement (the retained normal logs lack that detailed trace).

Official exact-version metadata was fetched read-only from `https://registry.npmjs.org/<name>/<version>` for retained expect-type 1.3.0, obug 2.1.1, tinyexec 1.0.2 and chai 6.2.2. Node engines respectively: `>=12.0.0`, absent, `>=18`, `>=18`; none requires migration from Node24. None declares preinstall/install/postinstall. tinyexec declares `prepare: npm run build` and ordinary build/dev/lint/test scripts; the others declare development/build/test scripts only. Preserve the published registry dependencies rather than introducing Git/source installs where prepare behavior differs. E/extra-metadata and `rejected-extras-metadata-review.json` cover rejected versions, whose published metadata does not make their unnecessary upgrades in scope. No new advisory or benign-code guarantee is asserted for retained leaves.

### Six bundled records: metadata materialization, not six selected upgrades

Parent **`node_modules/@tailwindcss/oxide-wasm32-wasi` stays exactly 4.2.0, byte-for-byte lock record unchanged**. Both original and rejected locks have the same parent URL, integrity, bundle list, dependency ranges, `cpu: ["wasm32"]`, dev/optional flags and Node `>=14.0.0` engine. It already declares all six bundled dependencies. They are absent only as individual records in the original lock.

The official parent tarball was downloaded into memory, not installed or extracted to disk:

- URL: `https://registry.npmjs.org/@tailwindcss/oxide-wasm32-wasi/-/oxide-wasm32-wasi-4.2.0.tgz`
- Actual compressed bytes: **1692934**; SHA-256 **1d8ec89a30aaa63cd2eec596a5bef78584152a8de50183b85033017b3c16aef1**.
- Computed SHA-512 matches both the original lock and official exact-version metadata: `sha512-xuDjhAsFdUuFP5W9Ze4k/o4AskUtI8bcAGU4puTYprr89QaYFmhYOPfP+d1pH+k9ets6RoE23BXZM1X1jJqoyw==`.
- Actual bundled package manifests have precisely the six versions below. The new records are an inventory of existing parent bytes, **not independently downloaded new package versions**. No standalone resolved/integrity field should be invented for them. Standalone registry tarball integrities are not proof of the bundled bytes; parent integrity and actual member inventory are the relevant identity.

All paths below have the literal prefix `node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/`; the appendix expands every full path and complete record. Before is **absent** for each; after must equal the appendix exactly, with `dev: true`, `optional: true`, `inBundle: true` and the frozen license/dependency/funding fields.

| Suffix                  | Version | Why present in existing parent / bundle role                                            | Actual files / uncompressed bytes |
| ----------------------- | ------- | --------------------------------------------------------------------------------------- | --------------------------------- |
| `@emnapi/core`          | 1.8.1   | Parent `^1.8.1`; Node-API/WASM glue, uses wasi-threads exactly 1.1.0 and tslib `^2.4.0` | 15 / 1838016                      |
| `@emnapi/runtime`       | 1.8.1   | Parent `^1.8.1`; emnapi runtime, tslib `^2.4.0`                                         | 17 / 424124                       |
| `@emnapi/wasi-threads`  | 1.1.0   | Parent `^1.1.0` and core exact 1.1.0; WASI thread support, tslib `^2.4.0`               | 15 / 227505                       |
| `@napi-rs/wasm-runtime` | 1.1.1   | Parent `^1.1.1`; WASM loader consumes core/runtime `^1.7.1` and wasm-util `^0.10.1`     | 6 / 5218530                       |
| `@tybys/wasm-util`      | 0.10.1  | Parent `^0.10.1`; WASM utilities, tslib `^2.4.0`                                        | 39 / 774885                       |
| `tslib`                 | 2.8.1   | Parent `^2.8.1`; shared compiled TypeScript helpers satisfy bundled tslib edges         | 14 / 90359                        |

Published bundled manifests have no Node engines and no preinstall/install/postinstall. Script inventory: core/runtime `build`; wasi-threads `test`, `build`, `build:test`; wasm-runtime `test`, `build`; wasm-util `lint`, `test`, `build`, `watch`, **`prepare: npm run build`**; tslib no scripts. Parent has no scripts. Absence of an engine is not affirmative WASM compatibility evidence; the parent engine alone does not test worker/WASI behavior. Preserve the restricted lifecycle policy; no script allowlisting is granted. Prepare/build metadata is disclosed, not executed in this investigation.

Read actual parent `tailwindcss-oxide.wasi.cjs` and `wasi-worker.mjs` plus bundled core/runtime entry shims and wasm-util CJS entry. Parent requires node fs/path/WASI/worker_threads and @napi-rs/wasm-runtime; workers and WASI inherit process.env. Core/runtime dispatch their compiled development/production modules; wasm-util exports WASI/load/memory utilities through tslib. These are existing optional build-tool capabilities, not harmless empty metadata packages. This was a targeted source/manifest inspection, not a complete JS/WASM binary security audit, provenance/signature verification or runtime launch. No claim of zero advisories is made. Preserve/capture full and omit-dev audit paths in future verification, since adding explicit lock inventory can alter scanner visibility without changing parent bytes.

Existing npm 11.21.2 source at `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/npm/node_modules/@npmcli/arborist/lib/arborist/build-ideal-tree.js:890–923` explicitly opens bundle tarballs for a complete ideal tree (including package-lock-only), then loadActual reads bundle children; `:1248–1267` treats bundled edges as owned by the bundle. This explains both observed candidates materializing the same six records even though A never selects Tailwind. It supports expecting these records under this modern npm protocol, **not a proof that every possible npm procedure/version inevitably adds them**. Do not change npm versions, suppress platform coverage or edit away bundle records to claim the original strict policy succeeded.

## Minimal policy options for independent selection

1. **Option S — strict existing path set.** Authorize only the retention constraint additions below; keep original 15-package/3-mirror allowlist (18 records). If the same supported generation still materializes bundles, reject and stop. This has the least lock surface but the existing npm source and both attempts make success doubtful. It is not a proven way to omit valid bundled records. No splicing or alternate npm downgrade is permitted. A strict rejection is an acceptable outcome, not a reason to retry unbounded strategies.
2. **Option M — recommended bounded metadata expansion.** Same retention constraints, original exact A versions, plus only the six full bundled records below. Final allowed change set is **24 records = 15 targets + 3 final caret mirrors + 6 metadata additions**, zero removals/relocations. Parent bytes remain unchanged. This accepts accurate inventory of an existing bundle, not Tailwind/package version refresh. No 1.4.0 expect-type, 2.2.1 obug, 1.3.1 tinyexec or 6.3.0 Chai. No four newer closure versions from the name-targeted attempt. All 24 complete before/after values are frozen in the appendix.
3. **No resolution approval.** Retain baseline and carry A's unresolved findings until a different separately accepted strategy is authored. Broad leaf upgrades are deliberately not a fallback option in this amendment: compatibility/security evidence that something _can_ upgrade does not establish that it _must_.

Choosing M permits exactly six records beyond the original policy. The implementation author cannot choose between S/M on the reviewer's behalf or switch to M after an S failure without delivered independent ACCEPT. Neither choice accepts the old 27/26-record candidate.

## Exact retention constraint delta and complete proposed temporary object

Retain every original scoped target edge in E/temporary-overrides.json. Add only these five child constraints: vitest → expect-type 1.3.0, obug 2.1.1, tinyexec 1.0.2; coverage-v8 → obug 2.1.1; @vitest/expect@4.1.12 → chai 6.2.2. These cover **all existing/new immediate consumers** of these four leaves in the inspected graph. No global leaf override, new direct transitive dependency or permanent retention override is authorized. Unrecognized new consumers are a stop/amend condition.

Vitest and coverage scopes use direct `$` self-reference to temporary exact 4.1.12 declarations. Non-direct expect uses its exact consumer version. Vite/jsdom `$` scopes avoid EOVERRIDE with their unchanged caret declarations; `$vite` is **not** a pin to the locked 7.3.1. Therefore the whole-lock identity check remains mandatory. No temporary Vite/jsdom floor change is authorized; if they move, reject rather than invent another constraint. The following object is the complete proposed temporary root object, including the unchanged permanent security pin; workspace overrides remain absent:

```json
{
  "get-uri": {
    "basic-ftp": "6.2.6"
  },
  "@vitest/coverage-v8": {
    ".": "$@vitest/coverage-v8",
    "std-env": "4.0.0-rc.1",
    "tinyrainbow": "3.1.0",
    "@vitest/utils": "4.1.12",
    "ast-v8-to-istanbul": "1.0.0",
    "obug": "2.1.1"
  },
  "@vitest/expect@4.1.12": {
    "@vitest/spy": "4.1.12",
    "tinyrainbow": "3.1.0",
    "@vitest/utils": "4.1.12",
    "chai": "6.2.2"
  },
  "@vitest/mocker@4.1.12": {
    "@vitest/spy": "4.1.12"
  },
  "@vitest/pretty-format@4.1.12": {
    "tinyrainbow": "3.1.0"
  },
  "@vitest/runner@4.1.12": {
    "@vitest/utils": "4.1.12"
  },
  "@vitest/snapshot@4.1.12": {
    "@vitest/utils": "4.1.12",
    "@vitest/pretty-format": "4.1.12"
  },
  "@vitest/utils@4.1.12": {
    "tinyrainbow": "3.1.0",
    "@vitest/pretty-format": "4.1.12"
  },
  "tinyglobby@0.2.15": {
    "picomatch": "4.0.4"
  },
  "vite": {
    ".": "$vite",
    "picomatch": "4.0.4"
  },
  "vitest": {
    ".": "$vitest",
    "std-env": "4.0.0-rc.1",
    "picomatch": "4.0.4",
    "@vitest/spy": "4.1.12",
    "tinyrainbow": "3.1.0",
    "@vitest/utils": "4.1.12",
    "@vitest/expect": "4.1.12",
    "@vitest/mocker": "4.1.12",
    "@vitest/runner": "4.1.12",
    "es-module-lexer": "2.0.0",
    "@vitest/snapshot": "4.1.12",
    "@vitest/pretty-format": "4.1.12",
    "expect-type": "1.3.0",
    "obug": "2.1.1",
    "tinyexec": "1.0.2"
  },
  "jsdom": {
    ".": "$jsdom",
    "undici": "7.30.1"
  }
}
```

The additional constraint ledger is: Vitest4.1.12 → expect-type `^1.3.0` at root 1.3.0; Vitest4.1.12 and coverage4.1.12 → obug `^2.1.1` at root 2.1.1; Vitest4.1.12 → tinyexec `^1.0.2` at root 1.0.2; expect4.1.12 → chai `^6.2.2` at root 6.2.2. Official consumer metadata sources are `https://registry.npmjs.org/vitest/4.1.12`, `https://registry.npmjs.org/@vitest%2fcoverage-v8/4.1.12` and `https://registry.npmjs.org/@vitest%2fexpect/4.1.12`; retained-child sources use their exact names/versions above. This amends the frozen 31 selected-edge ledger with five retention edges; it does not broaden the allowed changed-record set to those retained packages.

## Exact record/version policy

| Literal target path                  | Before | After      |
| ------------------------------------ | ------ | ---------- |
| `node_modules/@vitest/coverage-v8`   | 4.0.18 | 4.1.12     |
| `node_modules/@vitest/expect`        | 4.0.18 | 4.1.12     |
| `node_modules/@vitest/mocker`        | 4.0.18 | 4.1.12     |
| `node_modules/@vitest/pretty-format` | 4.0.18 | 4.1.12     |
| `node_modules/@vitest/runner`        | 4.0.18 | 4.1.12     |
| `node_modules/@vitest/snapshot`      | 4.0.18 | 4.1.12     |
| `node_modules/@vitest/spy`           | 4.0.18 | 4.1.12     |
| `node_modules/@vitest/utils`         | 4.0.18 | 4.1.12     |
| `node_modules/ast-v8-to-istanbul`    | 0.3.11 | 1.0.0      |
| `node_modules/es-module-lexer`       | 1.7.0  | 2.0.0      |
| `node_modules/picomatch`             | 4.0.3  | 4.0.4      |
| `node_modules/std-env`               | 3.10.0 | 4.0.0-rc.1 |
| `node_modules/tinyrainbow`           | 3.0.3  | 3.1.0      |
| `node_modules/undici`                | 7.24.6 | 7.30.1     |
| `node_modules/vitest`                | 4.0.18 | 4.1.12     |

These 15 complete target after-records are frozen from the rejected constrained output solely as expected record values, **not approval to copy them into a lock**. Its three leaf refreshes are excluded. The appendix also freezes complete original records, final declaration mirrors and bundle additions. All other `packages` records must deep-equal original B; the entire package-key set is B plus exactly the six additions for M (B only for S). Lock top-level keys/values other than `packages` must equal original, including lockfileVersion 3. Ordering/whitespace is not graph equality, but unexplained format-only churn still requires review.

Final manifest changes only: root/embed/CLI devDependency vitest `^4.0.18` → `^4.1.12`, root coverage-v8 `^4.0.18` → `^4.1.12`. Final lock declaration mirrors change precisely those same fields; engines/scripts/other dependencies stay exact baseline. Final manifests should byte-equal E/final saved manifests after checking those bytes contain only these changes. Temporary exact declarations are allowed only in staging and temporary lock mirrors, never deliverable.

**Strong invariants:** root final overrides must deep-equal exactly `{"get-uri":{"basic-ftp":"6.2.6"}}`; retain every basic-ftp occurrence's literal path, full record, registry URL/integrity and get-uri adapter coverage, not just a version string or root override. All other non-target records remain complete-record equal, including Vite7.3.1, jsdom28.1.0, Rollup, esbuild0.27.3 and all optional binaries, Tailwind parent/oxide/platform packages, React19, Three0.182, ESLint9, React plugin5, Playwright1.59.1 and Puppeteer22.15.0. Keep root Node24.x/.nvmrc24/CI selectors, workspace >=20, all manifests' unrelated declared ranges, chromium-bidi's nested Zod3.23.8, root Zod4, both js-tokens copies, nested picomatch2.3.1, standard-schema1.1.0, magicast0.5.2, convert-source-map2.0.0 and existing expect-type/obug/tinyexec/Chai records. No advisory remediation assigned to B/C is pulled into A.

## Reproducible future execution protocol — not executed here

1. Obtain independent ACCEPT of this exact document/hash, selected option, complete override JSON and exact before/after ledger. Reserve sole resolver/install ownership. Start from a **fresh isolated checkout with the original lock**, not either rejected output or another lane's dirty integration tree. Verify all four original hashes from CHECKPOINT.json, runtime binary Node24.22.3/npm11.21.2 and root + the two actual workspaces. Preserve E and use a new external evidence/cache directory; do not overwrite historical attempts.
2. Read sanitized effective npm configuration, retaining the user allow-scripts restriction and PUPPETEER_SKIP_DOWNLOAD=true. Use the existing Node24/npm11 binary PATH directly, not an NPX wrapper that injects invalid allow_scripts configuration. No global config change, force/dedupe/audit-fix/unqualified update/lock deletion/platform omit flags.
3. Save approved final caret manifests separately and hash them. In the isolated staging manifests only, set vitest exactly 4.1.12 in all three and root coverage exactly 4.1.12, with the complete temporary root overrides above. All other fields equal original. Save the override/manifest/edge JSON and their hashes _before_ resolution. Do not add direct expect-type/obug/tinyexec/Chai or bundled-package dependencies.
4. Run under recorded toolchain: `npm install --package-lock-only --ignore-scripts --workspaces --include-workspace-root`. This is the sole newly proposed candidate generation, not a recommendation to redo the rejected name-targeted update. Record exit and complete outputs; a zero exit is not acceptance. Validate all parsed records against the selected option and appendix. Only staging mirrors use exact 4.1.12 instead of final carets. Retained four leaf records must equal baseline, as must every record outside the ledger; require exact target versions/URLs/integrities, metadata, engine/peer/consumer compatibility and no extra paths. Option S rejects any bundle addition; M requires exactly the six. Never edit lock JSON or copy records from this appendix/a rejected lock to make the result match.
5. Restore the three **saved approved final caret manifest bytes**, removing every temporary override except the original get-uri/basic-ftp pin. Hash/read their content; do not restore original pre-A floors accidentally. With the existing generated candidate lock as input, run the **same npm lock-only command** to reconcile final mirrors. Validate again against the final ledger, all consumer ranges and security invariants. npm must generate the final mirrors. If it refreshes retained leaves or otherwise changes the frozen graph, reject and stop: approval of retention constraints is not proof that final-manifest reconciliation will preserve them. No persistent constraints or lock splicing as a workaround.
6. Save final manifest/lock byte hashes (H1). Run the same final-manifest lock-only command once more as an **idempotence gate**, require byte hashes H2 = H1 and identical parsed records; this separates successful one-time reconciliation from a stable deliverable. A failure requires strategy re-review, not silent normalization.
7. Remove only this checkout's node_modules as required for a genuinely clean locked install (npm ci handles existing directories); run `npm ci --workspaces --include-workspace-root` with **final manifests only**, unchanged user script policy and PUPPETEER_SKIP_DOWNLOAD=true. No `--ignore-scripts` substitute for this lifecycle gate. Require exit0 and hashes H3 = H2 = H1 for all three manifests and lock. Record skipped/blocked hooks and explicit native esbuild/app/embed/CLI build results; don't claim skipped Puppeteer/esbuild postinstalls were exercised. Confirm graph with `npm ls --all --json`, targeted explains and every consumer path; no invalid/extraneous/temporary overridden edges. Expected permanent get-uri override is retained, not mistaken for a forbidden temporary override.
8. Refresh exact official metadata/advisory evidence before generation/install as required by the parent plan, without selecting newer versions. Recheck target metadata and six bundle identities including parent bytes; any changed published identity, new necessary closure, newly relevant advisory requiring a target change, lifecycle-policy failure, unexpected consumer/record or unsupported engine is a stop/amend gate. Record full/omit-dev audits as data with exact paths/IDs; an expected findings exit1 is not a failed collection or security clearance.
9. Run the entire existing A baseline/candidate verification ledger and independent implementation review after the final edit. Existing baseline nonbrowser results do not establish candidate behavior; five baseline documentation format failures remain a failed gate with separate ownership/disposition. Fresh-cache launch, native bitmap2, built6, complementary built4, source-generated4 and unmodified Code ZIP production diagnosis remain outstanding as in tooling-a-verification.md; wait for the serial browser-slot grant. Keep budgets, assertions, trace ownership, coverage/watch checks, SDK three-copy identity/51200-byte limit and complete 51-file baseline build comparison. Inventory-only WASM allowance does not waive A's byte-identical app/embed/CLI output expectation; any nondeterminism needs an individually accepted explanation. Do not begin B or claim P/CLI/release acceptance.

## Rollback and reviewer checklist

On any failure retain candidate manifests/lock, hashes, parsed rejection and logs externally. Restore **only A-owned** root/embed/CLI manifests and lock in the isolated implementation checkout to the original four hashes from CHECKPOINT.json; never reset the integration tree or another lane's CLI/doc changes. Do not mix baseline manifests with candidate lock/node_modules. If a candidate had been installed, recreate the original dependency graph with clean baseline ci under unchanged policy and verify hashes/required restoration gates. Rollback reintroduces A's advisories; it is operational recovery, not remediation. No commit, push, PR, merge, workflow/settings or deployment permission is conveyed.

Independent reviewer must explicitly accept or reject: S versus M; five exact retention edges and complete temporary object; all 24 M before/after records (18 for S); six records as existing bundled-byte inventory rather than arbitrary version refresh; metadata/script/engine/source review limits; strong pin/unrelated-stack preservation; final-caret restore/reconcile/idempotence/clean-ci stability; unchanged full verification/rollback gates. If the graph cannot satisfy that contract, return REVISE. **This document remains a proposal awaiting an independent delivered ACCEPT; the author supplies no self-approval and has produced no installable accepted A candidate.**

## Appendix — complete machine-readable before/after allowlist (Option M)

This JSON is a **comparison specification only**, never a lockfile-edit payload. `before: null` means the literal path must be absent in the original. For Option S omit exactly the six entries whose before is null and reject them if generated. Every unlisted original record must remain deep-equal; no additional changed path, metadata field, removal or relocation is permitted. The `after` values for mirrors are the final caret state; during constrained staging only the four runner/coverage declaration values use exact 4.1.12. The complete JSON fields below freeze URL/integrity, dependencies/peers/engines/flags and all other record metadata, not merely package versions.

```json
{
  "baselineLockSHA256": "74e61c99884661fd128be89ef813dabac5c24d25ec8a72d82c6e3e861c6f4724",
  "policy": "M; pending independent ACCEPT",
  "records": [
    {
      "path": "",
      "before": {
        "name": "bitmapforge",
        "version": "1.0.0",
        "license": "MIT",
        "workspaces": ["packages/*"],
        "dependencies": {
          "@dnd-kit/core": "^6.3.1",
          "@dnd-kit/sortable": "^10.0.0",
          "@dnd-kit/utilities": "^3.2.2",
          "@radix-ui/react-accordion": "^1.2.11",
          "@radix-ui/react-dialog": "^1.1.14",
          "@radix-ui/react-dropdown-menu": "^2.1.15",
          "@radix-ui/react-popover": "^1.1.14",
          "@radix-ui/react-slider": "^1.3.5",
          "@radix-ui/react-switch": "^1.2.5",
          "@radix-ui/react-toggle": "^1.1.9",
          "@radix-ui/react-tooltip": "^1.2.7",
          "gif.js": "^0.2.0",
          "jszip": "^3.10.1",
          "lucide-react": "^0.542.0",
          "mp4-muxer": "^4.3.3",
          "react": "^19.1.1",
          "react-colorful": "^5.6.1",
          "react-dom": "^19.1.1",
          "react-dropzone": "^14.3.8",
          "three": "^0.182.0",
          "upng-js": "^2.1.0",
          "zundo": "^2.3.0",
          "zustand": "^5.0.8"
        },
        "devDependencies": {
          "@eslint/js": "^9.39.3",
          "@playwright/test": "^1.59.1",
          "@tailwindcss/vite": "^4.1.13",
          "@testing-library/react": "^16.3.2",
          "@vitejs/plugin-react": "^5.0.2",
          "@vitest/coverage-v8": "^4.0.18",
          "eslint": "^9.39.3",
          "eslint-config-prettier": "^10.1.8",
          "eslint-plugin-react": "^7.37.5",
          "eslint-plugin-react-hooks": "^7.0.1",
          "globals": "^17.3.0",
          "husky": "^9.1.7",
          "jsdom": "^28.1.0",
          "lint-staged": "^16.2.7",
          "prettier": "^3.8.1",
          "tailwindcss": "^4.1.13",
          "vite": "^7.2.4",
          "vitest": "^4.0.18"
        },
        "engines": {
          "node": "24.x"
        }
      },
      "after": {
        "name": "bitmapforge",
        "version": "1.0.0",
        "license": "MIT",
        "workspaces": ["packages/*"],
        "dependencies": {
          "@dnd-kit/core": "^6.3.1",
          "@dnd-kit/sortable": "^10.0.0",
          "@dnd-kit/utilities": "^3.2.2",
          "@radix-ui/react-accordion": "^1.2.11",
          "@radix-ui/react-dialog": "^1.1.14",
          "@radix-ui/react-dropdown-menu": "^2.1.15",
          "@radix-ui/react-popover": "^1.1.14",
          "@radix-ui/react-slider": "^1.3.5",
          "@radix-ui/react-switch": "^1.2.5",
          "@radix-ui/react-toggle": "^1.1.9",
          "@radix-ui/react-tooltip": "^1.2.7",
          "gif.js": "^0.2.0",
          "jszip": "^3.10.1",
          "lucide-react": "^0.542.0",
          "mp4-muxer": "^4.3.3",
          "react": "^19.1.1",
          "react-colorful": "^5.6.1",
          "react-dom": "^19.1.1",
          "react-dropzone": "^14.3.8",
          "three": "^0.182.0",
          "upng-js": "^2.1.0",
          "zundo": "^2.3.0",
          "zustand": "^5.0.8"
        },
        "devDependencies": {
          "@eslint/js": "^9.39.3",
          "@playwright/test": "^1.59.1",
          "@tailwindcss/vite": "^4.1.13",
          "@testing-library/react": "^16.3.2",
          "@vitejs/plugin-react": "^5.0.2",
          "@vitest/coverage-v8": "^4.1.12",
          "eslint": "^9.39.3",
          "eslint-config-prettier": "^10.1.8",
          "eslint-plugin-react": "^7.37.5",
          "eslint-plugin-react-hooks": "^7.0.1",
          "globals": "^17.3.0",
          "husky": "^9.1.7",
          "jsdom": "^28.1.0",
          "lint-staged": "^16.2.7",
          "prettier": "^3.8.1",
          "tailwindcss": "^4.1.13",
          "vite": "^7.2.4",
          "vitest": "^4.1.12"
        },
        "engines": {
          "node": "24.x"
        }
      }
    },
    {
      "path": "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/core",
      "before": null,
      "after": {
        "version": "1.8.1",
        "dev": true,
        "inBundle": true,
        "license": "MIT",
        "optional": true,
        "dependencies": {
          "@emnapi/wasi-threads": "1.1.0",
          "tslib": "^2.4.0"
        }
      }
    },
    {
      "path": "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/runtime",
      "before": null,
      "after": {
        "version": "1.8.1",
        "dev": true,
        "inBundle": true,
        "license": "MIT",
        "optional": true,
        "dependencies": {
          "tslib": "^2.4.0"
        }
      }
    },
    {
      "path": "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/wasi-threads",
      "before": null,
      "after": {
        "version": "1.1.0",
        "dev": true,
        "inBundle": true,
        "license": "MIT",
        "optional": true,
        "dependencies": {
          "tslib": "^2.4.0"
        }
      }
    },
    {
      "path": "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@napi-rs/wasm-runtime",
      "before": null,
      "after": {
        "version": "1.1.1",
        "dev": true,
        "inBundle": true,
        "license": "MIT",
        "optional": true,
        "dependencies": {
          "@emnapi/core": "^1.7.1",
          "@emnapi/runtime": "^1.7.1",
          "@tybys/wasm-util": "^0.10.1"
        },
        "funding": {
          "type": "github",
          "url": "https://github.com/sponsors/Brooooooklyn"
        }
      }
    },
    {
      "path": "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@tybys/wasm-util",
      "before": null,
      "after": {
        "version": "0.10.1",
        "dev": true,
        "inBundle": true,
        "license": "MIT",
        "optional": true,
        "dependencies": {
          "tslib": "^2.4.0"
        }
      }
    },
    {
      "path": "node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/tslib",
      "before": null,
      "after": {
        "version": "2.8.1",
        "dev": true,
        "inBundle": true,
        "license": "0BSD",
        "optional": true
      }
    },
    {
      "path": "node_modules/@vitest/coverage-v8",
      "before": {
        "version": "4.0.18",
        "resolved": "https://registry.npmjs.org/@vitest/coverage-v8/-/coverage-v8-4.0.18.tgz",
        "integrity": "sha512-7i+N2i0+ME+2JFZhfuz7Tg/FqKtilHjGyGvoHYQ6iLV0zahbsJ9sljC9OcFcPDbhYKCet+sG8SsVqlyGvPflZg==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@bcoe/v8-coverage": "^1.0.2",
          "@vitest/utils": "4.0.18",
          "ast-v8-to-istanbul": "^0.3.10",
          "istanbul-lib-coverage": "^3.2.2",
          "istanbul-lib-report": "^3.0.1",
          "istanbul-reports": "^3.2.0",
          "magicast": "^0.5.1",
          "obug": "^2.1.1",
          "std-env": "^3.10.0",
          "tinyrainbow": "^3.0.3"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        },
        "peerDependencies": {
          "@vitest/browser": "4.0.18",
          "vitest": "4.0.18"
        },
        "peerDependenciesMeta": {
          "@vitest/browser": {
            "optional": true
          }
        }
      },
      "after": {
        "version": "4.1.12",
        "resolved": "https://registry.npmjs.org/@vitest/coverage-v8/-/coverage-v8-4.1.12.tgz",
        "integrity": "sha512-6S7/iVknKglLAxMFxQGNppBI0iqJS2NgM6FBxavitj7KaDq/vywOWGf6dGu7F2L1Qy0G6S3uTp7aGshHrzK8JA==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@bcoe/v8-coverage": "^1.0.2",
          "@vitest/utils": "4.1.12",
          "ast-v8-to-istanbul": "^1.0.0",
          "istanbul-lib-coverage": "^3.2.2",
          "istanbul-lib-report": "^3.0.1",
          "istanbul-reports": "^3.2.0",
          "magicast": "^0.5.2",
          "obug": "^2.1.1",
          "std-env": "^4.0.0-rc.1",
          "tinyrainbow": "^3.1.0"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        },
        "peerDependencies": {
          "@vitest/browser": "4.1.12",
          "vitest": "4.1.12"
        },
        "peerDependenciesMeta": {
          "@vitest/browser": {
            "optional": true
          }
        }
      }
    },
    {
      "path": "node_modules/@vitest/expect",
      "before": {
        "version": "4.0.18",
        "resolved": "https://registry.npmjs.org/@vitest/expect/-/expect-4.0.18.tgz",
        "integrity": "sha512-8sCWUyckXXYvx4opfzVY03EOiYVxyNrHS5QxX3DAIi5dpJAAkyJezHCP77VMX4HKA2LDT/Jpfo8i2r5BE3GnQQ==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@standard-schema/spec": "^1.0.0",
          "@types/chai": "^5.2.2",
          "@vitest/spy": "4.0.18",
          "@vitest/utils": "4.0.18",
          "chai": "^6.2.1",
          "tinyrainbow": "^3.0.3"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      },
      "after": {
        "version": "4.1.12",
        "resolved": "https://registry.npmjs.org/@vitest/expect/-/expect-4.1.12.tgz",
        "integrity": "sha512-vFlTt+YEu9WBpNjdGayNmlMVzrWPi1+sv853/7t2FU7hpO5gAFBKHzQmkCq5Xjpr+evegF2994LQT3hF3mRlqQ==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@standard-schema/spec": "^1.1.0",
          "@types/chai": "^5.2.2",
          "@vitest/spy": "4.1.12",
          "@vitest/utils": "4.1.12",
          "chai": "^6.2.2",
          "tinyrainbow": "^3.1.0"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      }
    },
    {
      "path": "node_modules/@vitest/mocker",
      "before": {
        "version": "4.0.18",
        "resolved": "https://registry.npmjs.org/@vitest/mocker/-/mocker-4.0.18.tgz",
        "integrity": "sha512-HhVd0MDnzzsgevnOWCBj5Otnzobjy5wLBe4EdeeFGv8luMsGcYqDuFRMcttKWZA5vVO8RFjexVovXvAM4JoJDQ==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@vitest/spy": "4.0.18",
          "estree-walker": "^3.0.3",
          "magic-string": "^0.30.21"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        },
        "peerDependencies": {
          "msw": "^2.4.9",
          "vite": "^6.0.0 || ^7.0.0-0"
        },
        "peerDependenciesMeta": {
          "msw": {
            "optional": true
          },
          "vite": {
            "optional": true
          }
        }
      },
      "after": {
        "version": "4.1.12",
        "resolved": "https://registry.npmjs.org/@vitest/mocker/-/mocker-4.1.12.tgz",
        "integrity": "sha512-fKShNpKZzupWZuY0z7egydvL0sqW4INEZBEExMBMAa6izlENEVHwoXgdaTCaBZ5fwlr4xf2o1wXC83n9RpO+NA==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@vitest/spy": "4.1.12",
          "estree-walker": "^3.0.3",
          "magic-string": "^0.30.21"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        },
        "peerDependencies": {
          "msw": "^2.4.9",
          "vite": "^6.0.0 || ^7.0.0 || ^8.0.0"
        },
        "peerDependenciesMeta": {
          "msw": {
            "optional": true
          },
          "vite": {
            "optional": true
          }
        }
      }
    },
    {
      "path": "node_modules/@vitest/pretty-format",
      "before": {
        "version": "4.0.18",
        "resolved": "https://registry.npmjs.org/@vitest/pretty-format/-/pretty-format-4.0.18.tgz",
        "integrity": "sha512-P24GK3GulZWC5tz87ux0m8OADrQIUVDPIjjj65vBXYG17ZeU3qD7r+MNZ1RNv4l8CGU2vtTRqixrOi9fYk/yKw==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "tinyrainbow": "^3.0.3"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      },
      "after": {
        "version": "4.1.12",
        "resolved": "https://registry.npmjs.org/@vitest/pretty-format/-/pretty-format-4.1.12.tgz",
        "integrity": "sha512-XW9O8+Mxx4VpCtkYdMJLZQQwsVryP9wk7cPKDxtXFfwSak6yRh5+2fep/Y0XF/ElBvJHq8bcYdi6aeuai0opZA==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "tinyrainbow": "^3.1.0"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      }
    },
    {
      "path": "node_modules/@vitest/runner",
      "before": {
        "version": "4.0.18",
        "resolved": "https://registry.npmjs.org/@vitest/runner/-/runner-4.0.18.tgz",
        "integrity": "sha512-rpk9y12PGa22Jg6g5M3UVVnTS7+zycIGk9ZNGN+m6tZHKQb7jrP7/77WfZy13Y/EUDd52NDsLRQhYKtv7XfPQw==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@vitest/utils": "4.0.18",
          "pathe": "^2.0.3"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      },
      "after": {
        "version": "4.1.12",
        "resolved": "https://registry.npmjs.org/@vitest/runner/-/runner-4.1.12.tgz",
        "integrity": "sha512-NKlVKCr5QnCe8jijdMnmkpHHU+WTqiLFR6G0pHji9uRjXK9xJl1k1nTw6F3pOOj2PDcsDt2GKQMI7wIsaT491w==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@vitest/utils": "4.1.12",
          "pathe": "^2.0.3"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      }
    },
    {
      "path": "node_modules/@vitest/snapshot",
      "before": {
        "version": "4.0.18",
        "resolved": "https://registry.npmjs.org/@vitest/snapshot/-/snapshot-4.0.18.tgz",
        "integrity": "sha512-PCiV0rcl7jKQjbgYqjtakly6T1uwv/5BQ9SwBLekVg/EaYeQFPiXcgrC2Y7vDMA8dM1SUEAEV82kgSQIlXNMvA==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@vitest/pretty-format": "4.0.18",
          "magic-string": "^0.30.21",
          "pathe": "^2.0.3"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      },
      "after": {
        "version": "4.1.12",
        "resolved": "https://registry.npmjs.org/@vitest/snapshot/-/snapshot-4.1.12.tgz",
        "integrity": "sha512-ko1y1Qgb/slzQ9mr+b89Cuqud8WG1TKtsPD8r7ZUBdvVOGt85Af2HwCqHujrhwJq95hs/9RM7fcAPg57o1vlzw==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@vitest/pretty-format": "4.1.12",
          "@vitest/utils": "4.1.12",
          "magic-string": "^0.30.21",
          "pathe": "^2.0.3"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      }
    },
    {
      "path": "node_modules/@vitest/spy",
      "before": {
        "version": "4.0.18",
        "resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-4.0.18.tgz",
        "integrity": "sha512-cbQt3PTSD7P2OARdVW3qWER5EGq7PHlvE+QfzSC0lbwO+xnt7+XH06ZzFjFRgzUX//JmpxrCu92VdwvEPlWSNw==",
        "dev": true,
        "license": "MIT",
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      },
      "after": {
        "version": "4.1.12",
        "resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-4.1.12.tgz",
        "integrity": "sha512-RGq9x4JNGNTZHEJxvN0oSiJjeSCExm0n2gZKKJZHY9cX5AVA6M7VJILBT3ZJ/tJ/0J9uWT7fETV9/btoi//vSg==",
        "dev": true,
        "license": "MIT",
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      }
    },
    {
      "path": "node_modules/@vitest/utils",
      "before": {
        "version": "4.0.18",
        "resolved": "https://registry.npmjs.org/@vitest/utils/-/utils-4.0.18.tgz",
        "integrity": "sha512-msMRKLMVLWygpK3u2Hybgi4MNjcYJvwTb0Ru09+fOyCXIgT5raYP041DRRdiJiI3k/2U6SEbAETB3YtBrUkCFA==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@vitest/pretty-format": "4.0.18",
          "tinyrainbow": "^3.0.3"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      },
      "after": {
        "version": "4.1.12",
        "resolved": "https://registry.npmjs.org/@vitest/utils/-/utils-4.1.12.tgz",
        "integrity": "sha512-Q3awXrwOfEV+qc3WmO5ONyE0yO7Q1gQ9/oyHxGLZ/pl7N3NO/ZztqQwKLuwMkV+CA1JYSIeO3gkHnRDIo4AVaA==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@vitest/pretty-format": "4.1.12",
          "convert-source-map": "^2.0.0",
          "tinyrainbow": "^3.1.0"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        }
      }
    },
    {
      "path": "node_modules/ast-v8-to-istanbul",
      "before": {
        "version": "0.3.11",
        "resolved": "https://registry.npmjs.org/ast-v8-to-istanbul/-/ast-v8-to-istanbul-0.3.11.tgz",
        "integrity": "sha512-Qya9fkoofMjCBNVdWINMjB5KZvkYfaO9/anwkWnjxibpWUxo5iHl2sOdP7/uAqaRuUYuoo8rDwnbaaKVFxoUvw==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@jridgewell/trace-mapping": "^0.3.31",
          "estree-walker": "^3.0.3",
          "js-tokens": "^10.0.0"
        }
      },
      "after": {
        "version": "1.0.0",
        "resolved": "https://registry.npmjs.org/ast-v8-to-istanbul/-/ast-v8-to-istanbul-1.0.0.tgz",
        "integrity": "sha512-1fSfIwuDICFA4LKkCzRPO7F0hzFf0B7+Xqrl27ynQaa+Rh0e1Es0v6kWHPott3lU10AyAr7oKHa65OppjLn3Rg==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@jridgewell/trace-mapping": "^0.3.31",
          "estree-walker": "^3.0.3",
          "js-tokens": "^10.0.0"
        }
      }
    },
    {
      "path": "node_modules/es-module-lexer",
      "before": {
        "version": "1.7.0",
        "resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-1.7.0.tgz",
        "integrity": "sha512-jEQoCwk8hyb2AZziIOLhDqpm5+2ww5uIE6lkO/6jcOCusfk6LhMHpXXfBLXTZ7Ydyt0j4VoUQv6uGNYbdW+kBA==",
        "dev": true,
        "license": "MIT"
      },
      "after": {
        "version": "2.0.0",
        "resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-2.0.0.tgz",
        "integrity": "sha512-5POEcUuZybH7IdmGsD8wlf0AI55wMecM9rVBTI/qEAy2c1kTOm3DjFYjrBdI2K3BaJjJYfYFeRtM0t9ssnRuxw==",
        "dev": true,
        "license": "MIT"
      }
    },
    {
      "path": "node_modules/picomatch",
      "before": {
        "version": "4.0.3",
        "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.3.tgz",
        "integrity": "sha512-5gTmgEY/sqK6gFXLIsQNH19lWb4ebPDLA4SdLP7dsWkIXHWlG66oPuVvXSGFPppYZz8ZDZq0dYYrbHfBCVUb1Q==",
        "dev": true,
        "license": "MIT",
        "engines": {
          "node": ">=12"
        },
        "funding": {
          "url": "https://github.com/sponsors/jonschlinkert"
        }
      },
      "after": {
        "version": "4.0.4",
        "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.4.tgz",
        "integrity": "sha512-QP88BAKvMam/3NxH6vj2o21R6MjxZUAd6nlwAS/pnGvN9IVLocLHxGYIzFhg6fUQ+5th6P4dv4eW9jX3DSIj7A==",
        "dev": true,
        "license": "MIT",
        "engines": {
          "node": ">=12"
        },
        "funding": {
          "url": "https://github.com/sponsors/jonschlinkert"
        }
      }
    },
    {
      "path": "node_modules/std-env",
      "before": {
        "version": "3.10.0",
        "resolved": "https://registry.npmjs.org/std-env/-/std-env-3.10.0.tgz",
        "integrity": "sha512-5GS12FdOZNliM5mAOxFRg7Ir0pWz8MdpYm6AY6VPkGpbA7ZzmbzNcBJQ0GPvvyWgcY7QAhCgf9Uy89I03faLkg==",
        "dev": true,
        "license": "MIT"
      },
      "after": {
        "version": "4.0.0-rc.1",
        "resolved": "https://registry.npmjs.org/std-env/-/std-env-4.0.0-rc.1.tgz",
        "integrity": "sha512-2gE+MEGsqvDEjl7LqbrCEB3Lo6+Pmt8ULCIsutKTesFBzSuNIkiWPSy65sa7WrlLebc9LcfnS5eyj69mutUp1A==",
        "dev": true,
        "license": "MIT"
      }
    },
    {
      "path": "node_modules/tinyrainbow",
      "before": {
        "version": "3.0.3",
        "resolved": "https://registry.npmjs.org/tinyrainbow/-/tinyrainbow-3.0.3.tgz",
        "integrity": "sha512-PSkbLUoxOFRzJYjjxHJt9xro7D+iilgMX/C9lawzVuYiIdcihh9DXmVibBe8lmcFrRi/VzlPjBxbN7rH24q8/Q==",
        "dev": true,
        "license": "MIT",
        "engines": {
          "node": ">=14.0.0"
        }
      },
      "after": {
        "version": "3.1.0",
        "resolved": "https://registry.npmjs.org/tinyrainbow/-/tinyrainbow-3.1.0.tgz",
        "integrity": "sha512-Bf+ILmBgretUrdJxzXM0SgXLZ3XfiaUuOj/IKQHuTXip+05Xn+uyEYdVg0kYDipTBcLrCVyUzAPz7QmArb0mmw==",
        "dev": true,
        "license": "MIT",
        "engines": {
          "node": ">=14.0.0"
        }
      }
    },
    {
      "path": "node_modules/undici",
      "before": {
        "version": "7.24.6",
        "resolved": "https://registry.npmjs.org/undici/-/undici-7.24.6.tgz",
        "integrity": "sha512-Xi4agocCbRzt0yYMZGMA6ApD7gvtUFaxm4ZmeacWI4cZxaF6C+8I8QfofC20NAePiB/IcvZmzkJ7XPa471AEtA==",
        "dev": true,
        "license": "MIT",
        "engines": {
          "node": ">=20.18.1"
        }
      },
      "after": {
        "version": "7.30.1",
        "resolved": "https://registry.npmjs.org/undici/-/undici-7.30.1.tgz",
        "integrity": "sha512-03KrMbjIFDWQR5RNPrSw3bd1r12JpyFQl9/yxjUbJtqkjmllqC5lFjZh6ujeuJCKr8EOQvRW872Oy/az+nLYxg==",
        "dev": true,
        "license": "MIT",
        "engines": {
          "node": ">=20.18.1"
        }
      }
    },
    {
      "path": "node_modules/vitest",
      "before": {
        "version": "4.0.18",
        "resolved": "https://registry.npmjs.org/vitest/-/vitest-4.0.18.tgz",
        "integrity": "sha512-hOQuK7h0FGKgBAas7v0mSAsnvrIgAvWmRFjmzpJ7SwFHH3g1k2u37JtYwOwmEKhK6ZO3v9ggDBBm0La1LCK4uQ==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@vitest/expect": "4.0.18",
          "@vitest/mocker": "4.0.18",
          "@vitest/pretty-format": "4.0.18",
          "@vitest/runner": "4.0.18",
          "@vitest/snapshot": "4.0.18",
          "@vitest/spy": "4.0.18",
          "@vitest/utils": "4.0.18",
          "es-module-lexer": "^1.7.0",
          "expect-type": "^1.2.2",
          "magic-string": "^0.30.21",
          "obug": "^2.1.1",
          "pathe": "^2.0.3",
          "picomatch": "^4.0.3",
          "std-env": "^3.10.0",
          "tinybench": "^2.9.0",
          "tinyexec": "^1.0.2",
          "tinyglobby": "^0.2.15",
          "tinyrainbow": "^3.0.3",
          "vite": "^6.0.0 || ^7.0.0",
          "why-is-node-running": "^2.3.0"
        },
        "bin": {
          "vitest": "vitest.mjs"
        },
        "engines": {
          "node": "^20.0.0 || ^22.0.0 || >=24.0.0"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        },
        "peerDependencies": {
          "@edge-runtime/vm": "*",
          "@opentelemetry/api": "^1.9.0",
          "@types/node": "^20.0.0 || ^22.0.0 || >=24.0.0",
          "@vitest/browser-playwright": "4.0.18",
          "@vitest/browser-preview": "4.0.18",
          "@vitest/browser-webdriverio": "4.0.18",
          "@vitest/ui": "4.0.18",
          "happy-dom": "*",
          "jsdom": "*"
        },
        "peerDependenciesMeta": {
          "@edge-runtime/vm": {
            "optional": true
          },
          "@opentelemetry/api": {
            "optional": true
          },
          "@types/node": {
            "optional": true
          },
          "@vitest/browser-playwright": {
            "optional": true
          },
          "@vitest/browser-preview": {
            "optional": true
          },
          "@vitest/browser-webdriverio": {
            "optional": true
          },
          "@vitest/ui": {
            "optional": true
          },
          "happy-dom": {
            "optional": true
          },
          "jsdom": {
            "optional": true
          }
        }
      },
      "after": {
        "version": "4.1.12",
        "resolved": "https://registry.npmjs.org/vitest/-/vitest-4.1.12.tgz",
        "integrity": "sha512-5eWdz2yb3ajxWF3C8C4TjkXl7FGm3n2E/VlazALrQHzK7nYMSGFnCZto0bbPNl77AwkOZVLk0YnBAejUu0NiWA==",
        "dev": true,
        "license": "MIT",
        "dependencies": {
          "@vitest/expect": "4.1.12",
          "@vitest/mocker": "4.1.12",
          "@vitest/pretty-format": "4.1.12",
          "@vitest/runner": "4.1.12",
          "@vitest/snapshot": "4.1.12",
          "@vitest/spy": "4.1.12",
          "@vitest/utils": "4.1.12",
          "es-module-lexer": "^2.0.0",
          "expect-type": "^1.3.0",
          "magic-string": "^0.30.21",
          "obug": "^2.1.1",
          "pathe": "^2.0.3",
          "picomatch": "^4.0.3",
          "std-env": "^4.0.0-rc.1",
          "tinybench": "^2.9.0",
          "tinyexec": "^1.0.2",
          "tinyglobby": "^0.2.15",
          "tinyrainbow": "^3.1.0",
          "vite": "^6.0.0 || ^7.0.0 || ^8.0.0",
          "why-is-node-running": "^2.3.0"
        },
        "bin": {
          "vitest": "vitest.mjs"
        },
        "engines": {
          "node": "^20.0.0 || ^22.0.0 || >=24.0.0"
        },
        "funding": {
          "url": "https://opencollective.com/vitest"
        },
        "peerDependencies": {
          "@edge-runtime/vm": "*",
          "@opentelemetry/api": "^1.9.0",
          "@types/node": "^20.0.0 || ^22.0.0 || >=24.0.0",
          "@vitest/browser-playwright": "4.1.12",
          "@vitest/browser-preview": "4.1.12",
          "@vitest/browser-webdriverio": "^4.1.11",
          "@vitest/coverage-istanbul": "4.1.12",
          "@vitest/coverage-v8": "4.1.12",
          "@vitest/ui": "4.1.12",
          "happy-dom": "*",
          "jsdom": "*",
          "vite": "^6.0.0 || ^7.0.0 || ^8.0.0"
        },
        "peerDependenciesMeta": {
          "@edge-runtime/vm": {
            "optional": true
          },
          "@opentelemetry/api": {
            "optional": true
          },
          "@types/node": {
            "optional": true
          },
          "@vitest/browser-playwright": {
            "optional": true
          },
          "@vitest/browser-preview": {
            "optional": true
          },
          "@vitest/browser-webdriverio": {
            "optional": true
          },
          "@vitest/coverage-istanbul": {
            "optional": true
          },
          "@vitest/coverage-v8": {
            "optional": true
          },
          "@vitest/ui": {
            "optional": true
          },
          "happy-dom": {
            "optional": true
          },
          "jsdom": {
            "optional": true
          },
          "vite": {
            "optional": false
          }
        }
      }
    },
    {
      "path": "packages/cli",
      "before": {
        "name": "@bitmapforge/cli",
        "version": "0.1.0",
        "dependencies": {
          "minimist": "^1.2.8",
          "puppeteer": "^22.0.0"
        },
        "bin": {
          "bitmapforge": "src/index.js"
        },
        "devDependencies": {
          "vite": "^7.2.4",
          "vitest": "^4.0.18"
        },
        "engines": {
          "node": ">=20"
        }
      },
      "after": {
        "name": "@bitmapforge/cli",
        "version": "0.1.0",
        "dependencies": {
          "minimist": "^1.2.8",
          "puppeteer": "^22.0.0"
        },
        "bin": {
          "bitmapforge": "src/index.js"
        },
        "devDependencies": {
          "vite": "^7.2.4",
          "vitest": "^4.1.12"
        },
        "engines": {
          "node": ">=20"
        }
      }
    },
    {
      "path": "packages/embed",
      "before": {
        "name": "@bitmapforge/embed",
        "version": "0.1.0",
        "devDependencies": {
          "jsdom": "^28.1.0",
          "vite": "^7.2.4",
          "vitest": "^4.0.18"
        },
        "engines": {
          "node": ">=20"
        },
        "peerDependencies": {
          "three": ">=0.160.0"
        },
        "peerDependenciesMeta": {
          "three": {
            "optional": false
          }
        }
      },
      "after": {
        "name": "@bitmapforge/embed",
        "version": "0.1.0",
        "devDependencies": {
          "jsdom": "^28.1.0",
          "vite": "^7.2.4",
          "vitest": "^4.1.12"
        },
        "engines": {
          "node": ">=20"
        },
        "peerDependencies": {
          "three": ">=0.160.0"
        },
        "peerDependenciesMeta": {
          "three": {
            "optional": false
          }
        }
      }
    }
  ]
}
```
