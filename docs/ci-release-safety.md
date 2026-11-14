# CI and production release safety (#93)

## Initial required gates

`.github/workflows/ci.yml` keeps validation on every main PR/push, including documentation-only changes. `deploy` is main-push-only, declares the `production` environment, and requires **all** verification jobs:

- `check`: lint, repository formatting, root unit/integration tests, explicit embed unit tests, and the app build. Root `prebuild` builds/copies the SDK once; gzip must remain at most 51,200 bytes and the dist must not contain `@engine`. Byte comparisons verify package → public → built-app SDK identity.
- `cli`: explicit CLI build and unit tests. Root `npm ci` also runs its existing workspace `prepare` build; that install-time build is not substituted for the explicit verification step.
- `export-decode`: the dedicated export decode/archive suite, not just root Vitest.
- `browser`: Chromium plus OS dependencies, the existing `export.visual.spec.js` suite against the downloaded production build, and freshly extracted Code/CSS archives as covered by that suite. A separate CI config disables server reuse, requires a free strict port and forbids focused tests. Revision and SHA-256 manifest checks precede serving the build; Playwright waits for HTTP readiness. Evidence uploads run after failures too.

Each isolated job uses Node 20 and root `npm ci` against the committed workspace lock. There are no additional workspace `npm install` calls. Puppeteer's browser download is disabled because the CLI unit tests mock Puppeteer; the optional `INTEGRATION=1` CLI render test is **not** claimed as a passing browser gate. Playwright installs its own real browser. Existing checkout/setup/upload actions stay on v4; the matching artifact download action is v4. Deployment CLI is explicitly pinned to `vercel@65.15.0` (declares Node >=20), outside the workspace dependency tree.

## Build identity is not deployment identity

The `dist` artifact includes the source revision and a SHA-256 file manifest. The browser job consumes and checks this artifact without rebuilding it. These checks establish the identity of the **browser-tested app build**, not the identity of Vercel production output.

Deployment retains a source-based `vercel deploy --prod` rebuild at the checked-out revision; it does **not** download `dist`, use `--prebuilt`, or prove production byte identity. Raw Vite `dist` is not automatically Vercel prebuilt output. A pinned CLI does not pin Vercel's remote build settings, dependency resolution or build image. Before approving release, choose and independently verify a Vercel build/output + tested `--prebuilt` pipeline, or explicitly accept the rebuild path and verify its revision/build provenance and served asset hashes. This initial change does not satisfy that external release gate.

Production jobs use a single non-canceling concurrency group. Immediately before submitting deployment they compare the run SHA to remote main and fail if superseded. This rejects stale queued/rerun revisions and serializes workflow deployments rather than assuming canceling a local CLI cancels a remote deployment. It cannot stop another Vercel integration or unrelated workflow from deploying, and a push after the guard can make the currently running release older than main; the following eligible release must still validate and receive approval.

## Release remains blocked until separately authorized checks

Workflow syntax cannot configure or prove these protections. Do not push main or deploy as part of this local change. Before any release:

1. Read back branch protection / required checks for `check`, `cli`, `export-decode`, and `browser`, production environment reviewers (approval for **every** release, including docs-only), allowed production branches and secret scoping. Declaring an environment alone does not create required reviewers. Production credentials must not be available to PR/fork validation jobs.
2. Read back Vercel project/build settings and disable or otherwise gate Git integration/other paths that bypass this DAG. Resolve the tested-output versus rebuild provenance decision above.
3. Record release owner, rollback owner and a known-good immutable rollback target. Check other production writers cannot bypass serialization.
4. Independently audit the integrated implementation and run final exact-tree checks. The existing browser suite is only an initial gate: it does not establish generated React/Web Component/SDK lifecycle, non-root hosting, HTTP SDK/model/font/helper identity/MIME, missing-asset/HTML-with-200 safety, second-engine/DPR typography or reduced-motion/visibility correctness. Add feature-specific fixtures as those features land, not speculative selectors for UI specs still being authored. A serial suite can report later tests skipped after an earlier failure; its nonzero result blocks deployment, and skips do not establish coverage.
5. With separate release authorization, verify served revision and asset bytes, a freshly generated Embed archive, motion/visibility smoke and rollback readiness. A green workflow is not permission to bypass these outstanding requirements.

No repository protection, Vercel settings or production state was changed or remotely verified by this implementation.
