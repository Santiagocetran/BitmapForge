# Independent audit: native project-load chooser harness repair

## Verdict: ACCEPT

No change requested for the narrow three-line insertion in `test/e2e/ui-foundations.spec.js:220–222`. Independently reran the actual repaired repository test three times: **3/3 passed**, with no skipped, unexpected or flaky results. No application, test or configuration source was edited by this reviewer.

Scope: branch `gloin/ui-output-improvements`, HEAD `298bdec17dcd1603add549118a743e5cd494ba08`. This is acceptance of the chooser harness repair, not a new review of unrelated UI changes or a deployment approval.

## Delta and behavior review

- Read `AGENTS.md`, implementation handoff, external exact patch, before-spec, actual native-load test, repository Playwright configuration and external server/runner configuration. Collaboration files and optional Codex configuration were absent.
- Programmatically verified that removing exactly the two inserted comments and `page.on('filechooser', () => {})` restores the saved before-spec byte-for-byte. Actual repaired spec SHA-256: `b39f7332aa279cff7779a484dbcaf2b2175caaf23c5a4857188878c607cb6dd9`.
- The retained first-failure log identifies the original 90000ms timeout at the first chooser wait. The earlier activation probe records trusted Enter and button click, followed by the hidden input click, but zero first chooser events; later activation produces a chooser. The earlier pre-navigation-listener diagnostic passes. These are retained evidence, not new pre-repair reproductions by this reviewer.
- Inspected installed Playwright implementation: `client/channelOwner.js` sends an asynchronous subscription update on the first listener and disables the subscription only when the last listener is removed. `client/page.js` maps the public chooser event to that subscription and emits the chooser to listeners. Keeping a listener registered before navigation addresses the diagnosed first-arming race and prevents disable/re-enable cycles between the existing one-shot waits.
- The no-op listener neither consumes events nor supplies files, cancels a chooser, suppresses errors, catches failed assertions or synthesizes activation. Each original `waitForEvent('filechooser')` still must resolve, and each original `FileChooser.setFiles` still runs. Native focused-button Enter, cancellation via empty chooser files, no-alert assertion, focused-button Space, invalid import and `missing settings` assertion, Control+s download, cleared error, saved notice, native Load click, downloaded-project import and loaded notice are all unchanged and executed successfully. No `setInputFiles` shortcut, extra activation, retry, sleep or timeout increase was introduced.
- Lifetime is bounded by the test-scoped `{ page }` fixture. Installed runner `playwright/lib/index.js` creates the fixture page in its fixture context and closes the context at teardown under the normal non-reuse path. No unmanaged context, worker-global listener or page reuse override is introduced. Retaining this listener for that page's lifetime is intentional; explicit removal is unnecessary and could reintroduce interception toggling if done between waits. Other tests receive separate fixture pages.

## Independent execution

Verified the existing target before use: HTTP 200 at `http://127.0.0.1:5197`; PID 858786 runs `node ../historical-audit-server.mjs`, with cwd equal to this repository. Read that server script: exact repository root, external dedicated Vite cache, strict port 5197, HMR false. Did not restart or modify the parent-owned server.

Used the existing external `../project-load-chooser.config.mjs`, inheriting the actual repository configuration, including 90000ms timeout, zero retries, one worker, viewport and software GL. Overrides affect test discovery, verified external-server use and external evidence destinations only; no tracing policy is changed.

```sh
BITMAPFORGE_UI_URL=http://127.0.0.1:5197 PALETTE_BASE_URL=http://127.0.0.1:5197 CHOOSER_PHASE=independent npx --yes --package=node@20 -c 'node --version && node node_modules/@playwright/test/cli.js test --config ../project-load-chooser.config.mjs ui-foundations.spec.js --grep "native Load Enter" --repeat-each=3'
```

Actual Node: `v20.20.2`. Exit 0. Test durations: 3.5s, 3.4s, 4.0s; runner summary 17.2s. Parsed independent JSON: expected 3, skipped 0, unexpected 0, flaky 0; duration 17238.378ms. External evidence:

- `../project-load-chooser-independent.log`
- `../project-load-chooser-independent-results.json`
- `../project-load-chooser-independent-output/`
- `../project-load-chooser-independent-before-hashes.json`

Recorded hashes for every file under `src`, affected UI spec, companion palette spec and repository Playwright/Vite configs before this run; **153/153 remained unchanged afterward**. This extends the implementer's 152-file runtime/companion snapshot with the repaired UI spec itself.

Also read the implementer's isolated/full logs and parsed their JSON reports: isolated 3 expected, full 30 expected, each with zero skipped/unexpected/flaky. The full log contains the repaired native-load case passing in 6.9s. These full-suite results are reviewed prior evidence, not an independently repeated full suite. Repeating unrelated suites was outside this narrow audit.

## Boundaries and issues

No blocking findings. Browser acceptance here covers the actual Chromium/source-server fixture flow; it is not a cross-browser, built-artifact or real desktop file-dialog automation claim. Empty `FileChooser.setFiles([])` remains the original automated cancellation simulation; this repair does not broaden that contract. The original failing run is retained and was not overwritten. No resets, stashes, commits, pushes, deployments or remote mutations occurred. The only repository file created by this reviewer is this audit.
