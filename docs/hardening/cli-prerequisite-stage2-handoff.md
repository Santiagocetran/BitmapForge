# CLI prerequisite stage 2 — runnable checkpoint and blocked pixel gate

## Disposition

**Dedicated suites implemented and executed; full P is NOT accepted.** After the
parent explicitly released QA's browser lane and granted this worker the serial
slot, the final P01–P10/F01–F11 run exited **1: 35 passed, 14 failed, 2 skipped
(51 tests)**. All fourteen independent artifact pixel gates failed. No fixture,
production source, accepted containment helper, timeout, dependency, public policy
or legacy test was changed to make these failures pass. **Stop for an independently
reviewed prerequisite amendment before any production repair or fixture/threshold
change.** C/release acceptance is not implied.

The serial browser slot is released by this handoff; no background browser/test
process is intentionally left running. A/B ancestry, original before-P blocked
renders and historical root-format debt remain the parent's separate gates.

## Owned files

Only these repository files were created by this worker:

- `packages/cli/src/__tests__/cli-render.integration.test.js`
- `packages/cli/src/__tests__/cli-failures.integration.test.js`
- `packages/cli/src/__tests__/cli-stage2-evidence.js`
- `docs/hardening/cli-prerequisite-stage2-handoff.md`

The accepted helper remains SHA-256
`255be7ab9c87202d5df2abee8452a9e04aa1dcc99c991d45b5eec5da0f39f635`.
Both accepted fixture hashes are asserted at startup. Manifests/lock/production
and built entry hashes are recorded in each run manifest. Existing uncommitted
stage-1 files and other workers' documentation were not edited or attributed here.

## Retained real evidence

All paths below are under `/home/agent/.hermes/profiles/gloin/cache/scratch/`:

| Path                                                                               | Contents                                                                                                                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bitmapforge-cli-stage2-render-gUdVrf/`                                            | Final P01–P10 subprocess evidence and fourteen real artifacts/composited RGBA decodes                                                                               |
| `bitmapforge-cli-stage2-failures-3i9GPE/`                                          | Final F01–F11 failures, real browser/port observations, F05 disposable copied tree, nested accepted unit-suite output                                               |
| `bitmapforge-cli-stage2-checkpoint/`                                               | `real-ledger-final.log`, `legacy-P11.log`, exact runner commands/exits, discovery, syntax/lint/format/nonbrowser logs, source hashes and `real-ledger-summary.json` |
| `bitmapforge-cli-stage2-render-NErKD8/`, `bitmapforge-cli-stage2-failures-cSYJCa/` | Prior full run, same fourteen pixel failures (14 failed / 31 passed / 2 decoder self-tests skipped before four explicit batch-hash tests were added)                |
| `cli-stage2-checkpoint.mjs`, `cli-stage2-final-run.mjs`                            | Executed external checkpoint/runner scripts; not production or workspace test dependencies                                                                          |

Each real render case retains command/exit/signal/timing/output bytes and stdout/
stderr, a redacted environment summary, request/console/page events, actual
loop/capture observations, browser and sampled recursive descendant PIDs, owned
ports and postsettlement probes. Decoder directories retain FFmpeg/ffprobe process
results, full video stream/frame/packet JSON, APNG structured chunk/delay reports,
raw composited RGBA, numeric pixel reports and artifact/raw hashes. Artifacts were
not replaced by synthesized responses. Generated `testsrc2` self-test artifacts
are separate, labelled benign decoder self-tests, and never counted as P output.

## Real ledger findings

All ten actual CLI commands completed successfully within the unchanged 60-second
child deadline (final range approximately 5.3–13.8 seconds). All expected absolute
success paths, destinations, sizes/defaults/options, two batch formats, ignored
notes, batch shape/model decoded-hash differences and ordinary process cleanup
passed. No accepted render child needed emergency reaping. Observed required
requests stayed inside the seven-route map; the browser's additional favicon
request received 404 and is recorded, not made a new supported route. No fictitious
frame-progress output appeared.

Actual engine loop was **2094 ms**, with **21** `renderAtTime` captures at fps10
or **25** at fps12 and the expected absolute sample schedule. APNG decoded counts
matched acTL/fcTL; total delays were **2100 ms** or **2075 ms** (100/83 ms delays).
WebM dimensions/codec/decoded counts/monotonic frame timestamps passed. Final
measured WebM durations were approximately **2202–2253 ms** and cadences
**9.49–9.54** for fps10 or **11.10–11.29** for fps12, inside the accepted tolerances;
estimated final intervals are explicitly marked where packet duration is absent.
Real WebM tracks were ended and recorders inactive before browser close.

**None of the fourteen outputs is a meaningful-animation acceptance pass:**

| Outputs                                                                        | Retained failure                                                                                                                        |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| P01, P07 shape APNG, P09 shape APNG                                            | Fully transparent sampled frames: opaque fraction/occupancy/luma deviation/change all zero                                              |
| P02/P03, P04, P07 model APNG, both P08 videos, P09 model APNG, both P10 videos | Fewer than two separated meaningful colors; principal model cases are effectively uniform and have no meaningful separated-frame change |
| P05 odd APNG, P06 odd WebM                                                     | Sampled occupancy/color/luma checks pass, but separated-frame changed fraction is **0**, below **0.005**                                |

These are genuine decoded production artifacts, not merely an encoder/header
failure. `pixels.json` records all sampled statistics before the assertion throws.
The frozen `bayer4` token is preserved; this does not certify Bayer-4×4 dithering.
No engine/renderer/fixture diagnosis or repair is authorized by this handoff.

All **17 F-suite tests passed**, including real postlaunch malformed/versionless
project and `.bad` loader failures, mkdir/write failures, an actual navigation
refusal, isolated-empty-cache failure and recovery using the original existing
cache without installation. F05 physically removes each of seven copied assets
one at a time, exercises raw 404 targets and actual poststart read500, and closes
its server. F09/F11 execute the unchanged accepted cleanup suite as an owned
nonbrowser child; F10 similarly executes the accepted harness suite. This retains
all injected branch assertions and genuine benign deadline/overflow/spawn-error
containment tests without recasting emergency reap as application cancellation.
Normal owned PID/port closure was observed for success and settled real failures;
this is not proof of graceful external-signal or hung-evaluation cancellation.

### Legacy P11 stays separate

The unchanged historical `cli.test.js` was executed separately: **exit 1; 10 passed,
1 failed**. Its actual browser launch failed before the original header/acTL
assertions. No meaningful historical artifact claim is made. The legacy test's
long nested TMPDIR is a likely platform-path contributor, but that cause is not
independently established and the legacy owner must review any repair.

Two preliminary P02 probes are retained separately (`render-uzOheG` launch
failure; `render-2UZIRg` observation-missing run). During harness development,
using a deeply nested child TMPDIR prevented launching the cached browser; using
a separate short `c2-*` directory under the same authorized scratch made it
launch. A CJS-resolved Puppeteer preload initially observed a different singleton;
using the exact ESM conditional entry fixed observation. Neither intermediate run
is counted as final cleanup or artifact acceptance. Short owned TMPDIR paths are
recorded per child and retained; no shared cache was deleted.

## Harness and budget contract

- `INTEGRATION=1` **and** `CLI_BROWSER_SLOT=stage2` enable these two dedicated
  browser suites. Normal root/workspace runs launch no hidden browser through
  them. `CLI_DECODER_TESTS=1` enables only genuine nonbrowser FFmpeg self-tests.
- One exclusive scratch lock is held for each enabled suite. Use
  `--maxWorkers=1 --no-file-parallelism`; competing enabled suites fail the lock
  rather than polling or launching concurrently. Parent authorization remains
  mandatory; setting the environment is not authorization in itself.
- Every CLI subprocess retains **60000 ms + 16000 ms containment + 4000 ms margin
  = 80000 ms** outer timeout. Decoding is a separate test per artifact: at most
  two commands, each **20000 ms + 16000 ms containment**, plus 8000 ms finalization
  = **80000 ms**. No full render-plus-decode workload is squeezed into the render
  timeout. Batch commands remain single 60-second children, not two hidden
  enlarged child deadlines. No deadline or output cap was increased.
- FFmpeg writes bounded (maximum 200 decoded frames) RGBA to owned disk, not the
  helper's capped stdout. APNG uses `-ignore_loop 1`; both formats use passthrough
  timestamps. acTL/fcTL sequences, rectangles, disposal/blend, rational positive
  delays, capture-multiple/coalescing reconciliation and decoded count are checked.
- Pixel gates retain occupancy >=1%, luma deviation >=5 and each selected
  separated-frame change >=0.5% with >16 luma delta. The implementation makes
  otherwise unspecified meaningful-color/noise notions explicit: 32-level RGB
  buckets occupying >=0.5%, >=48 RGB-distance separation, foreground >24 maximum
  channel distance from #101820, and >=99% near-opaque pixels. These conservative
  operational definitions need reviewer approval; **no gate was loosened after
  observing failure**. Fully transparent/uniform/unchanging actual outputs also
  fail the unambiguous accepted occupancy/luma/variation criteria.
- Test-only preload wraps real Puppeteer, HTTP server and page APIs, calling
  original methods. It logs but does not replace render/encoder results. Navigation
  failure is the explicit F08 test-owned wrapper, not a production flag. PID
  sampling is observational (not an exhaustive escaped-descendant proof); final
  probes plus frozen owned-group containment provide bounded ordinary cleanup.

## Verification and reproduction

Verified runtime is existing Node **v24.22.3**:
`/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node`.
Installed Puppeteer **22.15.0** resolves existing Chrome **127.0.6533.88** at
`/home/agent/.cache/puppeteer/chrome/linux-127.0.6533.88/chrome-linux64/chrome`.
FFmpeg/ffprobe are **7.1.5-0+deb13u1**. No acquisition/substitution/build was done.

From `packages/cli`, with the approved Node executable as `$NODE`:

```sh
# Discovery only: 49 enabled names; Vitest 4 uses `list`, not a `run --list` flag.
INTEGRATION=1 CLI_BROWSER_SLOT=stage2 "$NODE" ../../node_modules/vitest/vitest.mjs list src/__tests__/cli-render.integration.test.js src/__tests__/cli-failures.integration.test.js --json

# Real browser ledger: needs a newly granted serial browser slot; currently red.
INTEGRATION=1 CLI_BROWSER_SLOT=stage2 "$NODE" ../../node_modules/vitest/vitest.mjs run src/__tests__/cli-render.integration.test.js src/__tests__/cli-failures.integration.test.js --maxWorkers=1 --no-file-parallelism

# Separate unchanged P11: currently red, not meaningful-output acceptance.
INTEGRATION=1 "$NODE" ../../node_modules/vitest/vitest.mjs run src/__tests__/cli.test.js --maxWorkers=1 --no-file-parallelism

# No browser: final executed workspace unit + genuine decoder branches.
env -u INTEGRATION -u CLI_BROWSER_SLOT CLI_DECODER_TESTS=1 "$NODE" ../../node_modules/vitest/vitest.mjs run --maxWorkers=1 --no-file-parallelism
```

Final nonbrowser workspace run: **exit 0; 117 passed, 46 skipped**, including all
16 unchanged FTP cases and both benign real decoder self-tests. Owned JavaScript
syntax checks, generated preload syntax, root ESLint and owned-file Prettier checks all exited 0.
`git diff --check` exited 0. Enabled discovery lists 49 names (28 render tests,
17 F tests, four pure contracts); the two separately gated decoder self-tests make
51 total when all branches are included. Full-root tests/builds/format debt were
not re-certified by this worker; earlier stage evidence remains separate.

Remaining gates: independent review of this exact test/evidence checkpoint;
explicit amendment of the production/fixture blocker and separate P11 issue;
then authorized rerun and independent full-P implementation verdict. No commit,
remote action, manifest/lock/security-policy edit or full-P completion claim.
