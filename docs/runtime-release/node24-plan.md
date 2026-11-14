# Node 24 revision — current release plan

Supersedes the Node26 choice in plan.md; preserve that document and verification.md as historical evidence, not Node24 results.

User explicitly authorized switching PR97 to Node24 after Node26 fresh Playwright installation hung locally and on hosted CI. A fresh isolated-cache Node24 control completed with unchanged Playwright1.59.1. Vercel's current support list includes24.x; official Node release schedule supports24 through2028-04-30. This chooses a compatible supported LTS rather than changing dependencies or mixing job runtimes.

## Bounded revision

1. Root package.json and lock-root engine become exactly24.x; .nvmrc becomes24. All five CI setup-node steps continue consuming .nvmrc.
2. Update the native configuration guard to require24, and change its wrong-local/wrong-runtime mutations to26. Keep all five mutations, explicit CI execution and the narrow known-workflow text-shape boundary.
3. Align current contributor/release-safety/config/native-smoke comments. Keep the measured real-JSDOM storage binding/regression; it changes test environment only and must pass under24. Preserve old26 audit records with explicit superseded notices.
4. Do not change dependency resolutions, browser/runner/deploy-CLI versions, assertions, time budgets, full artifact checks or production protections.

## Required execution and acceptance

- Independent plan audit before implementation; independent final implementation audit.
- Fresh locked npm ci under Node24; respect existing user script policy and document any local installer differences.
- Fresh isolated-cache Chromium installation using the locked Playwright; use that cache for the built-browser suite. Existing cache success alone is insufficient.
- Native policy/mutation guard, full root/embed/decode/CLI tests, app/SDK/CLI builds, lint/format, native bitmap smoke and six-case built-output browser suite with original90-second budget/zero retries.
- Compare the entire lock against main exceptrootengine and all35 app files against the merged-main CI artifact. Preserve SDK identity/alias/size checks.
- Commit/push the revision to existing PR97 (user authorized revising this PR), verify exact remote head, update PR title/body accurately without fabricating24 results, and wait for all hosted verification jobs. Do not rerun obsolete26 jobs.
- Required approving review remains intact; no merge/deploy/admin bypass or Vercel settings changes. Vercel acceptance and served-production verification remain gates after protected merge.
