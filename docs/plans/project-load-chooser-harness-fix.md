# Native project-load chooser harness repair — review handoff

## Outcome and scope

Implemented the narrow test-only repair on `gloin/ui-output-improvements`, HEAD/base `298bdec17dcd1603add549118a743e5cd494ba08`. **Isolated native-load repeats: 3/3 passed. Complete UI/palette gate: 30/30 passed**, no skipped, unexpected or flaky tests. Independent review remains the parent's next gate; this document is an implementation handoff, not independent approval.

Only `test/e2e/ui-foundations.spec.js` and this handoff were changed by this worker inside the repository. The spec already exists as an untracked file in the shared checkout, so ordinary `git diff` will not display its repair. External before-copy and exact patch are retained below. No application, palette, export spec, configuration, generated output, timeout or assertion changes. No reset/stash/commit/push/deploy/remote mutation. Other owners' pre-existing changes remain untouched.

## Diagnosis and retained original evidence

Read `historical-jsx-lint-cleanup-independent-audit.md` and the actual external evidence in the repository's parent scratch directory:

- `../historical-audit-browser-load-isolated.log`: original repository native-load case fails at the first `page.waitForEvent('filechooser')`, original line 223, with the unchanged 90000ms budget. This is prior independent reproduction, not a fresh pre-repair reproduction by this worker.
- `../historical-audit-load-probe.log`: the focused native button receives trusted Enter and click; the hidden file input receives its expected programmatic click. First chooser count is zero, subsequent activations produce chooser events. This separates activation from interception failure.
- `../historical-audit-load-armed.spec.mjs` and `../historical-audit-load-armed.log`: external diagnostic arms a persistent filechooser listener before navigation and passes the unchanged behavioral case in 6.5s (12.3s total). Its broad beforeEach was diagnostic only; the repository repair is confined to the one affected test.

The evidence supports a Playwright first-interception arming race, not a missing native application activation. A persistent listener before navigation lets protocol interception arm before the first fast native keypress; it also prevents interception toggling off between the three sequential one-shot waits.

## Exact repository spec delta

```diff
@@ -217,6 +217,9 @@
 test('native Load Enter and Space, cancelled chooser, failed import and successful save/import share one notice', async ({
   page
 }) => {
+  // Arm interception before navigation, not alongside the first fast native keypress.
+  // Keep it enabled between chooser waits; the fixture owns this page's lifetime.
+  page.on('filechooser', () => {})
   await page.goto(appUrl)
   const load = page.getByRole('button', { name: 'Load .bitmapforge', exact: true })
   await load.focus()
```

The persistent listener observes only; it does not resolve, dismiss, fill or consume any chooser. Existing waits and `FileChooser.setFiles` keep all original sequencing: real focused-button Enter, empty chooser cancellation, no alert, real Space, invalid project selection and `missing settings` alert, Control+s download, cleared error and saved notice, real Load click, downloaded-project import and loaded notice. No direct input assignment, extra activation, retry loop, catch, sleep or budget increase. Page/listener lifetime remains owned by Playwright's `{ page }` fixture; no explicit unmanaged context is created. Removing exactly these three inserted lines reconstructs the entire before-spec byte-for-byte (verified programmatically).

## Actual verification environment

Used existing parent-owned source Vite server at `http://127.0.0.1:5197`. Verified HTTP 200 and live PID 858786 command `node ../historical-audit-server.mjs`, with `/proc/858786/cwd` resolving to this exact repository. Read the server script: exact repository root, dedicated external `historical-audit-vite-cache`, strict port 5197, HMR false. Did not restart or modify the parent's server.

External `../project-load-chooser.config.mjs` imports the actual repository Playwright config and overrides only testDir, webServer (reuse verified target without launching another server), external outputDir and list/JSON reporter paths. Original 90000ms budget, retries zero, one worker, fixture contexts, viewport, headless mode and software GL remain inherited. Trace ownership/policy is untouched: the base config has no trace setting; this repair adds no manual tracing and does not disable any configured policy. The earlier failure's actual error-context attachment is retained under `../historical-audit-browser-output/`; no new failure was generated or claimed to have a trace.

Both `BITMAPFORGE_UI_URL` and `PALETTE_BASE_URL` were explicitly set to the verified target. Actual Node version: `v20.20.2` via `npx --yes --package=node@20 -c`, calling installed JS entry points directly.

Commands from the repository root:

```sh
BITMAPFORGE_UI_URL=http://127.0.0.1:5197 PALETTE_BASE_URL=http://127.0.0.1:5197 CHOOSER_PHASE=isolated npx --yes --package=node@20 -c 'node --version && node node_modules/@playwright/test/cli.js test --config ../project-load-chooser.config.mjs ui-foundations.spec.js --grep "native Load Enter" --repeat-each=3'
BITMAPFORGE_UI_URL=http://127.0.0.1:5197 PALETTE_BASE_URL=http://127.0.0.1:5197 CHOOSER_PHASE=full npx --yes --package=node@20 -c 'node node_modules/@playwright/test/cli.js test --config ../project-load-chooser.config.mjs ui-foundations.spec.js palette.spec.js'
npx --yes --package=node@20 -c 'node node_modules/eslint/bin/eslint.js test/e2e/ui-foundations.spec.js && node node_modules/prettier/bin/prettier.cjs --check test/e2e/ui-foundations.spec.js'
git diff --check
```

| Check | Actual result |
| --- | --- |
| Isolated native project-load repeats | Exit 0; 3/3 passed, 4.3s / 3.9s / 3.6s; 17.2s total |
| Full real UI/palette browser suite | Exit 0; 30/30 passed (19 UI + 11 palette), 3.5 minutes; repaired case 6.9s |
| JSON count verification | Isolated expected 3; full expected 30; both skipped/unexpected/flaky zero |
| Scoped ESLint | Exit 0 |
| Scoped Prettier | Exit 0 |
| `git diff --check` | Exit 0 |
| Runtime/companion hash comparison | All 152 pre-recorded files unchanged through browser verification: every file under src plus palette spec and repository Playwright/Vite configs |
| Original test content preservation | Exact three-line insertion only; all original content byte-for-byte retained |

Logs, independent JSON reports and browser outputs are separate per phase, not overwritten by the later run:

- `../project-load-chooser-isolated.log`, `../project-load-chooser-isolated-results.json`, `../project-load-chooser-isolated-output/`
- `../project-load-chooser-full.log`, `../project-load-chooser-full-results.json`, `../project-load-chooser-full-output/` (includes real viewport screenshots)
- `../project-load-chooser-static.log`
- `../project-load-chooser-before.spec.js`, `../project-load-chooser.patch`
- `../project-load-chooser-before-hashes.json`, `../project-load-chooser-verification.json`

SHA-256 of the complete affected spec:

- Before: `85b28f73a1bb03eeed35f25d80428360affcc2a6162699ce6a41eae864ae12cb`
- After: `b39f7332aa279cff7779a484dbcaf2b2175caaf23c5a4857188878c607cb6dd9`

No root unit/lint rerun: those separately reviewed gates were explicitly outside this assignment. No built/deployed artifact or cross-browser acceptance claim. Independent reviewer should inspect the narrow external patch alongside the untracked repository spec; parent retains final combined release-gate ownership.
