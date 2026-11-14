# Independent implementation audit — #93 CI safety

## Decision and scope

**ACCEPT the bounded local CI-safety implementation; REJECT release approval and blanket closure of the original CI-S acceptance criteria.** No mandatory implementation correction was identified in the three completed files. External protection settings are release prerequisites, not a reason to misclassify otherwise-correct local workflow changes as defective.

Reviewed the actual working-tree diff against `298bdec17dcd1603add549118a743e5cd494ba08` on `gloin/ui-output-improvements`, plus the complete new config/documentation. Read `AGENTS.md`, the CI-S gate in `creative-output-acceptance.md`, package scripts, root/export Vitest configs, the base Playwright config and the selected existing browser suite. Concurrent UI/engine/utils edits are expressly excluded; this is not their audit or a final exact-tree test result. No implementation files, repository settings, remote settings or deployment state were changed.

Reviewed content fingerprints (SHA-256):

| File                              | SHA-256                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| `.github/workflows/ci.yml`        | `48ab3208599e1386155e9b695cdd92e438d080685c2136f3523e610c9f14d061` |
| `.github/ci/playwright.config.js` | `0a2da2e368e7e528902eebbe04b1278c1290e24db05eded808b22bcba43689b5` |
| `docs/ci-release-safety.md`       | `c248484b5947a289c6e35bd59c3ea023c7ea6edcdb694dfce39f66c0401f1028` |

## Prioritized findings and required dispositions

### P1 — Release blocker, acknowledged: tested artifact is not deployed output

`ci.yml:108–117` downloads and checks the `dist` produced by `check`. However, `deploy:138–158` checks out source, installs dependencies and runs `vercel deploy --prod`; it neither downloads that artifact nor uses `--prebuilt`. Thus browser success establishes the tested app's identity, not Vercel's served byte identity. The revision marker and checksum manifest are not remote deployment attestation.

**Mandatory before release:** independently validate a Vercel build/output + tested prebuilt deployment path, or explicitly accept the source-rebuild strategy and verify its build revision/provenance and served asset hashes. Pinning the CLI alone does not pin remote build configuration, toolchain or dependency behavior. This limitation is accurately disclosed in `ci-release-safety.md:14–18`; it is not a hidden regression or a required rewrite of this bounded local change.

### P1 — Release blockers, external and unverified: approval, bypasses and rollback

The YAML declares `environment: production`, but cannot establish required reviewers, production-branch restrictions, branch required checks, protected secret scope or Vercel Git-integration behavior. It also cannot serialize writers outside this workflow's repository concurrency group.

**Mandatory before release:** authorized readback of these settings, every-release approval including docs-only changes, other production-writer/bypass controls, and recorded release/rollback owner and immutable rollback target. Keep these gates open. No remote evidence was obtained and none is invented. Their absence from this audit does **not** reject local DAG/trigger correctness.

### P2 — Nonblocking diagnostic limitation: browser evidence is narrower than tracing options suggest

The CI config requests retained traces and failure screenshots, but the selected suite creates contexts directly with `browser.newContext()` (`export.visual.spec.js:53–58`) instead of using the managed `page`/`context` fixtures. Those manually owned contexts do not automatically gain fixture tracing/failure screenshots merely from `use.trace` and `use.screenshot`. Explicit screenshots exist, but an early setup failure can occur before they are written. The HTML report and evidence-upload step still provide diagnostics; this is not a false-green path.

**Follow-up:** explicitly trace/capture manually owned contexts or migrate the suite to managed contexts. Until then, do not claim automatic trace/screenshot coverage of every failure. This is not a blocker for the bounded initial gate, which uploads available reports/evidence after failure.

### P2 — Coverage limitation, acknowledged: initial browser gate is not full creative-output acceptance

The configured suite discovers six existing tests only. It does extract and execute fresh Code/CSS archives, but Code ZIP execution patches an import map and container dimensions; its screenshot assertion checks nonempty encoded bytes, not nonblank rendered pixels (`export.visual.spec.js:205–257`). It is not proof that an untouched downloaded Code archive works independently or that generated SDK/React/Web Component integrations meet lifecycle or asset-integrity contracts.

**Mandatory for relevant feature/release acceptance:** final integrated checks and the missing generated integration, motion/visibility, non-root/MIME/HTML-with-200 and appropriate second-engine/DPR fixtures. These remain expressly open in `ci-release-safety.md:29–30`. Do not require unfinished parallel UI specs to pass as evidence for this local CI slice, and do not close their feature gates using these six tests.

## Contracts inspected and accepted locally

- **DAG and failure propagation:** `deploy.needs` explicitly includes `check`, `cli`, `export-decode`, and `browser`; `browser.needs` includes `check`. No required job/step uses `continue-on-error`. Normal job success semantics prevent deployment after a failed/skipped prerequisite. Production no longer lives inside `check`.
- **Events and fork boundaries:** validation runs for PRs targeting main and pushes to main without path filters. Deployment requires both `push` and `refs/heads/main`; PRs, including forks, do not run it. There is no `pull_request_target` execution. The workflow token has `contents: read`, and production secret expressions occur only in the deploy step. This does not assert that unknown repository-level secrets are correctly scoped externally.
- **Install/build/test commands:** every isolated job specifies Node 20 and root `npm ci`. Workspace installs were removed. Root `npm test -- --max-workers=50%` selects root/unit/integration tests; explicit embed tests, CLI build/tests and `npm run test:export` cover separately configured suites. `npm ci` still invokes CLI `prepare`; the explicit CLI build is retained. Root prebuild builds/copies the SDK before the app build, without a second later SDK rebuild. Puppeteer download suppression matches mocked unit-test use; the optional CLI integration render test is not claimed.
- **SDK/artifact identity:** SDK gzip cap is 51,200 bytes, alias leakage is checked, and `cmp` establishes package → public → app SDK-byte equality. The app revision and SHA-256 manifest are uploaded with `dist`; the browser job checks both before serving and does not rebuild the app. Artifact actions use matching v4 upload/download APIs and same-run default selection. This checks listed files, not a signed/exact-inventory deployment attestation; packaged generated Embed ZIP identity remains a release/feature gate.
- **Production-output browser configuration:** the CI config overrides the dev server with `vite preview`, strict port, no server reuse, readiness URL and focused-test prohibition. Config-relative test/output/report paths resolve into the intended repository locations. Although Playwright's default webServer cwd is `.github/ci`, npm locates the root package and executes its preview script there; this was checked rather than assuming the nested config breaks serving. Chromium/system dependencies are explicitly installed. Decode/browser evidence uploads use `if: always()`; a failure before evidence exists may produce a warning, not a false passing test.
- **Release ordering:** the non-canceling `production` concurrency group prevents overlapping deployment jobs from this workflow, without pretending local cancellation revokes an accepted remote deployment. The remote-main comparison rejects stale queued/rerun SHAs before submission. Concurrency is not FIFO and pending runs may be replaced. A new push after the check is a real check-to-submit race: the active deployment may become older than main, but a newer deployment from the same group cannot overtake it while it runs. The CLI waits by default; `--no-wait` is not used. This is not an atomic latest-main-at-promotion guarantee and does not protect against manual cancellation or outside writers; documentation correctly retains that limitation.
- **Pinned Vercel compatibility:** npm registry metadata confirms `vercel@65.15.0` exists and declares Node `>=20`. A real isolated npm execution ran Node `v20.20.2`, Vercel `65.15.0`, and `vercel deploy --help` successfully. Help confirms `--prod`, `--yes`, `--prebuilt` and opt-in `--no-wait`. No token, linking, deployment or settings mutation was used. This validates CLI startup/options, not authenticated project permissions or a remote build.

## Executed verification and limits

| Check                                                                                                                                                                                  | Actual result                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Downloaded `actionlint` 1.7.7; ran against `.github/workflows/ci.yml`                                                                                                                  | Passed, no diagnostics. ShellCheck is not installed; no ShellCheck result is claimed. |
| `git diff --check -- .github/workflows/ci.yml .github/ci/playwright.config.js docs/ci-release-safety.md`                                                                               | Passed for the tracked diff; new files separately covered by Prettier.                |
| Targeted `npx --no-install prettier --check` on all three completed files                                                                                                              | Passed.                                                                               |
| `npx --no-install playwright test --config .github/ci/playwright.config.js --list`                                                                                                     | Passed; six tests in one file. Discovery only, not browser execution.                 |
| Parsed workflow with installed YAML library; executable assertions for needs, success policy, all-job `npm ci`, read-only permissions, deploy condition and secret-expression boundary | Passed.                                                                               |
| Loaded actual Playwright config and resolved output/report paths; ran `npm prefix` and preview help from `.github/ci`                                                                  | Passed; root package detected, production preview command available.                  |
| Registry lookup and actual pinned Vercel startup/help under Node 20                                                                                                                    | Passed as described above.                                                            |

The ordinary shell is Node `v22.23.4`; only the explicit isolated CLI probe above used Node 20. Full installs/builds/test/browser execution against concurrent unfinished implementation were intentionally not substituted for final integrated evidence. A scratch manifest-script execution probe was requested but held pending tool approval; it is **not** counted as executed verification. No GitHub-hosted run, remote artifact roundtrip, real environment approval, authenticated deployment or served-byte readback is claimed.

## Mandatory-fix and acceptance summary

- **Mandatory local fixes before accepting these three files:** none found.
- **Accepted:** bounded workflow DAG/security/install/artifact/browser-configuration correction and accurate release-safety documentation, backed by the static/configuration/CLI checks above.
- **Not accepted:** deployment authorization, full #93/CI-S release readiness, all-feature browser coverage, tested-build-to-production byte equivalence, or any concurrent UI/engine/utils implementation.
- **Mandatory before release:** resolve the P1 gates, run final exact-tree CI-equivalent checks, satisfy applicable feature fixtures, obtain separate release authorization and verify the deployed output and rollback readiness. Do not push main or deploy on the strength of this audit.

Only `docs/plans/ci-implementation-audit.md` is authored by this review. `docs/plans/` is locally ignored by `.gitignore`; this artifact requires deliberate inclusion if it is to be committed. No staging/commit or ignore-rule change was performed.
