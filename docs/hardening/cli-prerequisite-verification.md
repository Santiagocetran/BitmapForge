# CLI prerequisite P — verification checkpoint

## Status: stage 1 ready for review; P acceptance is NOT complete

Source base: `550842cab61002c7cc6563e50b9fcdeb17c9bf01`, branch
`gloin/release-hardening`. No commit was made. The separately delivered plan audit
accepts **P only**; C remains REVISE and Node-public-policy choice is untouched.
The parent explicitly rescheduled actual Puppeteer acceptance until a serial
browser slot is granted. **No Puppeteer browser was launched in this stage.** Do
not infer APNG/WebM artifact, timing, occupancy, request-ledger or real-browser
cleanup acceptance from these unit results.

Evidence root (outside repository):
`/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-cli-P-evidence/`.
`before-P/` retains original source copies, dependency/fixture hashes, commands,
stdout/stderr and red regressions. `stage-1/` retains command manifests/logs and
checkpoint hashes/diff including new files. Checkpoint files, not a commit SHA,
identify this uncommitted review unit. Independent implementation review is still
required; this document is an implementer handoff, not an independent verdict.

## Implemented boundary

- Seven exact raw URL routes with own-key membership, HTML/JavaScript MIME,
  unknown/prototype/query/encoded/traversal 404, all-seven prelisten verification,
  known-read 500 and structured listen rejection. No static directory fallback.
- Existing classic pako loads and validates before classic UPNG; successful and
  in-flight loads are shared and rejected loads can retry. Actual installed
  classic scripts encode a tiny RGBA PNG/APNG in a VM test. No encoder replacement.
- Awaited CLI dispatch sets nonzero exitCode after error/cleanup; browser/server
  acquisition has one lifetime and independent close attempts, preserving primary
  failures and secondary diagnostics. Batch remains sequential/fail-fast.
- Harness manager disposal occurs once for every postconstruction path, including
  failure. Recorder listeners precede start/stop; error settlement does not float
  rejected promises; stop wait is bounded to five seconds; acquired stream tracks
  and paused manager cleanup are independently attempted. Existing copied pixels,
  scheduling, codec and even-dimension WebM padding are retained.
- Frozen fixtures match accepted SHA-256 values. Real project parser and OBJLoader
  tests establish nested settings/model, 12 triangle vertices, finite bounds,
  four outward nondegenerate faces, six closed edges and signed volume 1. No
  external OBJ resource references. Frozen `bayer4` remains a fallback test, not
  proof of Bayer-4×4 dithering. Actual engine loop timing remains unverified.
- Historical CLI assertions and legacy smoke remain; asynchronous imports now
  await dispatch/cleanup and restore argv/exitCode, with no global rejection
  suppression or timeout-as-success. Legacy integration uses a bounded
  Linux-owned-process-group helper, but was **not executed** in stage 1.
- Helper unit cases exercise actual benign child success, spawn failure, timeout
  and output overflow. Emergency TERM/KILL cleanup always records failure and is
  never application cancellation acceptance. No broad process kills were used. A separate actual helper run is
  retained as `stage-1/helper-process-cleanup.json`: ordinary PID 2380446 exited
  zero without reap; deadline PID 2380474 and overflow PID 2380481 were scoped
  SIGTERM failures; all owned groups were absent at return. The ENOENT spawn case
  acquired no PID. This is runner containment evidence, not browser cleanup.

## Before-P observations retained

| Evidence                               | Actual result                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `before-P/unit-baseline.log`           | Existing CLI suite exit 0: 26 passed, 1 legacy integration skipped. It did not expose the asset/compression/lifetime defects.                                                                                                                                                                                                                                                                                                                                                    |
| `before-P/server-baseline.json`        | Actual `start()` exit 1 before listener: `/upng.js` maps to nonexistent lowercase `node_modules/upng-js/upng.js`. Downstream before-render pixels and postlaunch leaks are blocked, not simulated.                                                                                                                                                                                                                                                                               |
| `before-P/tiny-compression-defect.log` | Original harness + actual classic UPNG, new tiny fixture test: exit 1, `Cannot read properties of undefined (reading 'deflate')`. No browser/diagnostic route patch.                                                                                                                                                                                                                                                                                                             |
| `before-P/causal-focused.log`          | Original harness, new unit tests: exit 1, 5 failed / 4 passed / 25 filtered. Reproduces missing pako/global validation/sharing and missing disposal after model failure.                                                                                                                                                                                                                                                                                                         |
| `before-P/causal-regressions.log`      | Exploratory full baseline test run: exit 1, 51 failed / 7 passed, plus one **test-double compatibility exception**. This broad run is diagnostic only; missing assets block many downstream server assertions and the early recorder double assumed the new event-listener API. The double was corrected to support both property/listener APIs. Focused red evidence above is the clean causal record; this exploratory run is not counted as production unhandled-error proof. |

The external causal tree uses original saved server/harness source, copied new
unit tests/fixtures and a symlink to unchanged installed dependencies. Its
headless file was copied after the CLI-only build merely to satisfy the existing
file-presence check; it was never rendered and is **not a before-build render**.
No before-P actual browser postlaunch leak claim is made.

## Runtime / tool / browser prerequisites

- Verified exact approved executable:
  `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node`,
  Node `v24.22.3`; approved cached npm `11.21.2`.
- Commands use cached `npx --offline -p node@24.22.3 -p npm@11.21.2 -c '…'`.
  The system default is Node 22/npm 10 and is **not** the verification runtime.
  No install command or manifest/lock edit was performed. Offline npx emitted its
  standard package-resolution warning on initial invocation; versions and actual
  executable path were checked rather than assuming the system runtime changed.
- Installed Puppeteer is **22.15.0**, declared `^22.0.0`, unchanged. Its own
  `executablePath()` resolves to the existing binary
  `/home/agent/.cache/puppeteer/chrome/linux-127.0.6533.88/chrome-linux64/chrome`.
  Running only `--version` returned `Google Chrome for Testing 127.0.6533.88`.
  No inherited executable/cache override is set. Launch/render capability is
  still pending the parent's serial slot. No Playwright substitution/acquisition.
- FFmpeg and ffprobe: `7.1.5-0+deb13u1`; decoder inventory retained in
  `stage-1/decoder-identity.log`. Actual APNG compositing/WebM decode commands are
  not yet run. No OS packages were installed.

## Executed commands (each exit recorded independently)

All npm commands below used the approved cached Node/npm pair above.

| Command                                          | Exit / result                                                                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Before-P `npm test --workspace=@bitmapforge/cli` | 0; 26 passed, 1 skipped                                                                                                |
| Final `npm test --workspace=@bitmapforge/cli`    | 0; **106 passed, 1 skipped**, five test files; includes all 16 unchanged basic-ftp security/compatibility cases        |
| `npm run build --workspace=@bitmapforge/cli`     | 0; Vite 7.3.1, 54 modules, generated `dist/headless.js` 181.18 kB and existing lazy font chunks; no root/embed rebuild |
| Final `npm run lint`                             | 0; earlier owned unused-Buffer global lint error fixed, original failed log retained                                   |
| `npm test -- --maxWorkers=2`                     | 0; **853 passed**, 61 files; root suite does not replace CLI/integration discovery                                     |
| `npm run format:check`                           | 1; existing unowned hardening plan/audit formatting debt listed in log; no unauthorized edits to approved plans/audits |
| Owned-file Prettier                              | 0; fixture bytes are excluded from formatting                                                                          |
| `git diff --check`                               | 0                                                                                                                      |

An initial new-unit run had one test-table argument-shape error (empty argument
row invoked the helper default). The table now supplies explicit `{args}` objects;
the final 106-pass result above is after that correction. No budget was increased.

## Exact P-owned file list

Modified:

- `packages/cli/src/server.js`
- `packages/cli/src/index.js`
- `packages/cli/src/harness.js`
- `packages/cli/src/__tests__/cli.test.js`

Created:

- `packages/cli/src/__tests__/server.test.js`
- `packages/cli/src/__tests__/harness.test.js`
- `packages/cli/src/__tests__/cli-cleanup.test.js`
- `packages/cli/src/__tests__/cli-integration-helpers.js`
- `packages/cli/src/__tests__/fixtures/shape-v2.bforge`
- `packages/cli/src/__tests__/fixtures/model-v2.bitmapforge`
- `packages/cli/README.md`
- `docs/hardening/cli-prerequisite-verification.md`

Generated ignored output: `packages/cli/dist/` only. All manifests/lockfiles,
Node engine/public policy, Puppeteer22, security pins, original fixture,
`headless-entry.js`, HTML, Vite configuration and engine/parser/loader source are
unchanged. The preexisting hardening documentation directory belongs to other
planning/QA work; do not stage or attribute it wholesale to P.

## Resume stage 2 — serial browser slot required

**Do not wait/poll or launch while QA owns browser acceptance.** Parent must grant
the slot, then resume from the checkpoint and read the full accepted P ledger.
Pending work is explicit, not skipped acceptance:

1. Author the allowed `cli-render.integration.test.js` and
   `cli-failures.integration.test.js` plus independent FFmpeg/ffprobe
   parsing/statistics in the allowed helper. They are **not yet created**; running
   their planned commands now cannot constitute a test pass. Preserve each
   P01–P10 command/destination, dimensions, defaults/options, two batch formats,
   per-artifact assertions and thresholds from the accepted ledger.
2. Capture exact final module requests/console, actual loop/capture/delay schedule,
   page stream-track/recorder state, child/browser descendant PIDs and owned ports.
   Real ordinary success/failure cleanup must close within five seconds without
   emergency reap. VM branch counts do not establish this.
3. Execute P01–P10 actual subprocess artifact ledger and all F01–F11 requirements,
   retaining after-P artifacts and independent APNG chunk/composited RGBA and
   WebM stream/frame/packet/timing/cadence/RGBA statistics. Preserve failed numeric
   gates; do not alter fixtures or thresholds without independent amendment.
4. Run exact explicit files with nonzero executed case counts:
   `INTEGRATION=1 npm test --workspace=@bitmapforge/cli -- src/__tests__/cli-render.integration.test.js src/__tests__/cli-failures.integration.test.js`.
   Separately run preserved historical P11:
   `INTEGRATION=1 npm test --workspace=@bitmapforge/cli -- src/__tests__/cli.test.js`.
   Legacy blank/failed evidence stays separate from meaningful-output acceptance.
5. F04 must use an isolated empty cache without any executable override, and must
   not delete the shared cache. Successful recovery should return to the proven
   existing cache; any actual installer/acquisition requires parent authorization.
   F08 test-owned navigation wrapper must use real Puppeteer22, no production fault
   flags. Real F02/F06 must prove cleanup with actual child exits, not mocked exits.
6. Rerun final relevant checks after any real-stage fixes, preserve manifest/lock
   and fixture hashes, then obtain **independent implementation ACCEPT** on exact
   checkpoint/diff/evidence. Inherited A/B browser/build handoffs remain the
   parent's separately owned gates. No commit, C migration or publication.

Settled-only cleanup / no graceful external-signal or hung-job cancellation is the
explicitly accepted P boundary. Test-helper emergency reaping does not broaden it.
