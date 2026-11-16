# IC1 re-entry native verification — four rows executed

## Outcome

**Three passed; Chromium desktop failed full artwork equality. IC1 native acceptance remains blocked.** One invocation per engine executed serially through the accepted private config and direct installed Playwright CLI. No native retries, repairs, broader matrix, or repeat attempts occurred. The browser lane is released.

Paths below share `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- `B`: `image-cancel-contract-reentry-v1`.
- `E`: `B/tests/evidence/native-resume-20261116-verified-roster`.
- Chromium output: `B/runs/r16c/final/smoke/chromium/a01`.
- Firefox output: `B/runs/r16f/final/smoke/firefox/a01`.
- Immutable dist: `h1-integrated-20261115T180652Z/immutable-candidate/dist`.

The previous approval-blocked report was copied byte-for-byte to `E/prior-approval-blocked.md` before updating this document. The original historical failed native report and sealed evidence remain untouched.

## Authorization and prerequisites

The current user explicitly authorized resumption; the parent transferred the exclusive serial lane conditional on fresh checks. Current profile delegation manifests show only this worker (`deleg_8bfd8283`) running. Existing historical servers were neither reused nor stopped. Resource checks observed 3,831 MiB available memory and 339 GiB available disk at entry. No retained-cache native browser or private server was active before launch.

Fresh verification checked the accepted evidence-index SHA-256 `4d97fa256b35c64ca61e1d6997b1b0146b8cbc561c4b9c27ab77dd9655aea537`, all 9,740 indexed entries, all 14 source/toolchain pins, complete immutable build inventory, cube fixture, and both retained browser binary hashes. Node was actually `v24.22.3`; installed Playwright remains 1.59.1. After execution, every sealed file was rechecked without mismatch, and both harness/build inventories remained unchanged. New outputs are additions in allowed evidence/run roots, not a regenerated historical seal.

`E/prerequisites.json`, `E/roster.json`, `E/authorization.json`, and per-engine launch/completion files retain the actual checks, argv, environment, ports and observed process identities. No ownership capability was fabricated; the accepted config issued its own inherited capability.

One **pre-native observer error** is retained separately in `B/tests/evidence/native-resume-20261116/blocked.json` and `roster.json`: `AssertionError('Other live delegated worker')`. The initial roster filter mistakenly included three terminal `interrupted` tasks. Reading their literal statuses established they were not running; only the observer filter and fresh evidence destination were corrected. No config evaluation, native process or run root had occurred at that stop. This was not a native retry or harness repair. The operational observer is `B/tests/evidence/native-resume.py`; its two filter/destination revisions are recorded in the task tool transcript. No new tool approval denial occurred.

## Literal execution

From `/home/agent`, the observer launched from the repository cwd:

```text
/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node /home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research/node_modules/@playwright/test/cli.js test --config /home/agent/.hermes/profiles/gloin/cache/scratch/image-cancel-contract-reentry-v1/harness/playwright.smoke.config.mjs
```

PATH used the explicit sibling `node_modules/.bin`. Neither `run.mjs` was invoked. The unchanged configuration retained one worker, zero retries, 90,000 ms tests, 5,000 ms expectations, 10,000 ms actions, 15,000 ms navigation, 30,000 ms launch/readiness, 10,000 ms shutdown, no server reuse and runner-owned `retain-on-failure` traces. Full eight-field snapshots, full artwork equality, preview thresholds and animation behavior were unchanged.

| Engine   | Row        | Result | Duration ms | First failure / unreached assertions                                                                                                                                                              |
| -------- | ---------- | ------ | ----------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chromium | Q1.image.D | Failed |        4145 | `AssertionError: Image cancel preserves UI/source/settings/artwork identity` at `repair-contracts.mjs:316`; return-cube upload/meaningful preview, final no-alert and loaded screenshot unreached |
| Chromium | Q1.image.N | Passed |        7185 | No failure; no route successor assertion unreached                                                                                                                                                |
| Firefox  | Q1.image.D | Passed |       19039 | No failure; no route successor assertion unreached                                                                                                                                                |
| Firefox  | Q1.image.N | Passed |        4680 | No failure; no route successor assertion unreached                                                                                                                                                |

Chromium CLI exit1: one failed, one passed. Firefox CLI exit0: two passed. Every row has exactly one result and retry0. `E/rows.json` contains literal error/stack, full before/after snapshots, field differences and unreached assertions.

### Chromium desktop failure

The positive invitation precheck, chooser activation/cancellation, both genuine project downloads and both snapshots completed. All eight fields were recorded: `sourceType`, `settings`, `artwork`, `invitation`, `fileCount`, `replaceCount`, `alertCount`, `emptyText`. Only `artwork` differed:

- Before: `8c2d4381f27449685afd631eea773f9a7ab6cc3148a8233992723e84f1a8f907`.
- After: `2d51b3946cef498b9ea1a38a1bb4424656771a2da69b9964f30661d66d08b609`.

Both invitations were true; post-cancel source remained image, fileCount0, replaceCount0, alertCount0. Full snapshot equality failed and remains failed. This establishes a screenshot-hash difference, **not by itself a proven artwork replacement or attributed application defect**, especially with animation unchanged. No equality relaxation or diagnostic rerun was made. Settings closure and all route successors after `ui.mjs:317` were not reached for this row.

The three passing rows have exact equality of all eight fields and completed return-cube meaningful preview, final no-alert and loaded screenshot assertions.

## Genuine evidence and served identity

Both run roots retain `report.json`, HTML reports, ledgers, diagnostics, screenshots, server identity/exit records and real downloads. There are **eight genuine `.bitmapforge` downloads** and **one original retained trace ZIP** (plus its HTML-report copy). Passing rows have no retained trace under the unchanged policy.

Chromium failure trace:

```text
B/runs/r16c/final/smoke/chromium/a01/results/ui-smoke-Q1-image-D-chromium/trace.zip
```

Its sibling `test-failed-1.png` and `error-context.md` are runner failure artifacts. Per-row snapshots are `diagnostics/Q1.image.D-image-cancel.json` or `Q1.image.N-image-cancel.json`. Passing loaded/return-cube screenshots and pixel diagnostics are preserved in their engine output. `E/run-artifacts.json` records actual file sizes and SHA-256 hashes.

For each engine, `server-identity.json` records matching complete pre/post dist manifests and matching HTTP-fetched bytes for `/index.html`, `/assets/index-BKDpitmq.js`, `/assets/three-DDsitln8.js`, and `/assets/index-DOJMVuZp.css`. Both manifests equal the pinned immutable build inventory. This proves the served target without claiming a new source build.

## Exact cleanup and preservation

- Chromium owned port47639; actual server PID3817321 exited and closed with code0, signal null, closeCompleted true.
- Firefox owned port48053; actual server PID3817895 exited and closed with code0, signal null, closeCompleted true.
- Per-engine completion records retain sampled owned PID/start-tick/PGID/session/executable identities. Every observed owned identity was absent after close; no emergency cleanup occurred. Sampling cannot prove observation of every arbitrarily short-lived process.
- Neither owned port remained LISTEN. Full post-run TCP state is retained separately; TIME_WAIT is not treated as a listener and no misleading immediate bind-reuse assertion was used.
- Only exact owned `B/runs/r16c/{tmp,cache}` and `B/runs/r16f/{tmp,cache}` directories were inventoried and removed after process absence. Their inventories are retained. Report/results/downloads, owner markers and historical trees were not removed.
- `E/completion.json` and `E/final-preservation-cleanup.json` record lane release and final preservation/listener checks.

No production/source/dependency/build/remote/commit/push/undraft/merge/deployment change occurred. Only this authoritative repository report changed; external additions are the observer, preserved blocker copies, prerequisite/results/cleanup records and genuine run artifacts. Guard re-entry worked in both native runners, but the failed Chromium desktop equality gate remains open. PR/release readiness is not established.
