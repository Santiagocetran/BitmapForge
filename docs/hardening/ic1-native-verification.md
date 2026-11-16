# IC1 native verification — blocked before browser setup

## Outcome

**Native cancellation acceptance remains blocked.** One authorized direct installed-Playwright Chromium invocation discovered exactly `Q1.image.D/N`, started the private immutable-build server, then failed during worker configuration reload. Literal runner result: **1 failed, 1 did not run; exit 1**. Neither browser route executed. Firefox was not launched after the shared configuration blocker was established. No fixes, bypasses or reruns were made.

The explicit parent grant assigned this worker the sole serial IC1 lane. Fresh process/cache/port checks preceded launch; historical servers were neither reused nor stopped. The lane is now released, with exact owned-process absence and no owned listener verified. This report does not clear Q1, the historical engine matrices, or any release gate.

## Identities and invocation

Roots under `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- `A = image-cancel-contract-v1`
- `E = A/native-evidence-20261116`
- `O = A/runs/n16c/final/smoke/chromium/a01`
- Immutable dist: `h1-integrated-20261115T180652Z/immutable-candidate/dist`

Checked the complete private harness against the accepted candidate inventory and the complete dist path/size/hash map against `immutable-candidate/build-inventory.json`. Both remained unchanged after execution. Fixture size/hash matched 1577 bytes / `4d2d98182b4b93e8b45e881b1f92838b7e951ab246bb73f81663b3e3f5bef708`. Actual explicit Node was `v24.22.3`; installed Playwright was `1.59.1`. Existing Chromium headless-shell revision1217 and Firefox revision1511 binary hashes matched retained pins. Complete current inventories, paths, binary hashes, initial processes/listeners and tool identities are in `E/prerequisites.json`.

Fresh direct run root `A/runs/n16c` initially contained only private `tmp` and `cache` directories. Port38127 was free before launch. `E/chromium-launch.json` records the exact environment, including final/smoke/chromium/a01 suffix, retained cache, contained TMPDIR/XDG_CACHE_HOME and explicit sibling Node toolchain `.bin` PATH. Helper output overrides and TMP/TEMP were cleared before the config populated private destinations.

```sh
/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node /home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research/node_modules/@playwright/test/cli.js test --config /home/agent/.hermes/profiles/gloin/cache/scratch/image-cancel-contract-v1/harness/playwright.smoke.config.mjs
```

Neither `run.mjs` was invoked. The selected config retained one worker, zero retries, test90000/expect5000/action10000/navigation15000/launch30000/readiness30000/graceful-shutdown10000 ms, original viewports/DPR and runner-owned retain-on-failure tracing. No dependency installation, rebuild, source/harness change, remote write, commit, push or deployment occurred.

`E/authorization.json` records the actual parent grant and finite attempts, not self-approval. The selected private smoke graph has no approval-file schema; the copied, excluded lifecycle driver's schema was not repurposed or bypassed.

## Genuine per-row disposition

| Engine   | Row        | Actual result / first failure                                                                                   | Later unreached assertions                                                                                                                                                                                      |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chromium | Q1.image.D | Runner failed, duration0, workerIndex−1: `Error: IC1 existing attempt destination`, `harness/lib/env.mjs:57:38` | All page/browser setup, initial route, before snapshot, positive invitation precheck, chooser cancellation, after snapshot, full equality, return-cube meaningful preview, final no-alert and loaded screenshot |
| Chromium | Q1.image.N | Runner skipped/did not run after worker initialization failure; no independent row assertion failed             | Entire route and all assertions above                                                                                                                                                                           |
| Firefox  | Q1.image.D | Not launched: shared private-config worker-reload blocker; no Firefox runtime result manufactured               | Entire route and all assertions above                                                                                                                                                                           |
| Firefox  | Q1.image.N | Not launched: same blocker                                                                                      | Entire route and all assertions above                                                                                                                                                                           |

For **each of these four rows**, before and after values for all eight fields—`sourceType`, `settings`, `artwork`, `invitation`, `fileCount`, `replaceCount`, `alertCount`, `emptyText`—are **unobserved**, not false, zero or equal. No native saved projects, screenshots or trace ZIPs were produced (each artifact count is zero). The potential artwork-hash equality successor was not reached and remains unresolved. Original failures are retained unchanged.

## Blocker attribution

The first config evaluation succeeds, validates the private graph/supervisor, then `config.mjs:77–78` creates `.keep` files beneath `e.output`. The installed runner subsequently reloads configuration in its worker: `node_modules/playwright/lib/worker/workerMain.js:165` calls `deserializeConfig`; `lib/common/configLoader.js:104` calls `loadConfig` again. The unchanged `guardConfig` rejects any existing `e.output` at `env.mjs:57`, including the destination created by its own initial evaluation. The genuine error stack is retained in `O/report.json` and `E/chromium.log`.

This is a native-runner/configuration incompatibility missed by list-only/offline acceptance, not evidence of an application cancellation regression or a stale destination reused by this attempt. No guard was removed, no directory was deleted to bypass it, and no replacement runtime was substituted. A separately authorized/reviewed repair is needed before another native attempt.

## Served identity and cleanup

The real private supervisor/server ran and shut down normally. `O/server-identity.json` retains HTTP hash equality for `/index.html`, `/assets/index-BKDpitmq.js`, `/assets/three-DDsitln8.js`, and `/assets/index-DOJMVuZp.css`. Its full before/after manifests agree with the prelaunch pinned dist, with `unchanged=true` and `closeCompleted=true`. This establishes served-byte identity, **not browser behavior**.

`O/server-exit.json`: child PID3766519, exit0, signal null, `exited=true`, `closed=true`, `closeCompleted=true`, `closeError=null`; requested SIGTERM at `2026-11-16T02:23:21.368Z`, actual exit at `02:23:21.811Z`, close at `02:23:21.812Z`. `E/chromium-processes.jsonl` and completion retain sampled owned PID/startTicks/PGID/SID/argv identities. No browser executable launched. No emergency cleanup was used; all retained owned identities were absent after completion and at lane release.

The outer operational observer itself then failed its post-run bind probe with `EADDRINUSE`; this secondary failure is preserved in `E/blocked.json` and the original script. Binding is not a correct listener-absence oracle. The retained immediate listener snapshot already shows no port38127 listener; fresh `/proc/net/tcp` readback in `E/lane-release.json` records only three TIME_WAIT entries (state06, inode0), no LISTEN. Exact process absence, real child exit/close and served identity were independently reconciled afterward without rerunning any server or test. No observer or harness code was repaired.

## Evidence index and pins

All paths below expand from the roots above. `E/evidence-index.json` inventories exact evidence paths, byte lengths and SHA-256 values, including the untouched operational script `A/native-check.py`, all run outputs and reports. Index SHA-256: `6df340bc139a3b35bbabef8a954b74bbded2b27738430407f45f7d1bbd301cf8`.

| Evidence                   | SHA-256                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| E/prerequisites.json       | `743a7649038a5c36d9d8189e89db27f911c1a744e46595bd70f2f8749c722f5b` |
| E/authorization.json       | `f9f0bbfe00d220499785cedb52d0397f280415fa49cb02b47f712fc0975c5cf5` |
| E/chromium.log             | `943015fd71d834673c24084cc3317222e1b3ae4d7f1e6531ecd15ff029eabfc7` |
| E/chromium-completion.json | `2c9b347d950df3d6c18e04341293e0c2393ad1dd194a8dda6d7dfa65ca398df9` |
| E/lane-release.json        | `8ea2c1af8641fc63dc2264c43dac7867a9f9a5a2625553bafaa36cafe2752d96` |
| O/report.json              | `4dc8e3bd034778ba4bc668dfa3e2a8824fdc5233e6f1e39e406376405183fa5f` |
| O/server-identity.json     | `d26cb6bdb606897bb96bc58d555511fafb3a8a7666311a61ad969acfca02d7b1` |
| O/server-exit.json         | `198b6b8e44b83cdfd92ac5e25b8cce1476ca0874926b2608d768c681d3d54ce2` |

Created only this repository report and private operational/evidence/run files. Updated the active profile's browser reliability reference with the discovered config re-entry pitfall. Scratch evidence is local-only and is not automatically available to remote reviewers. Accepted CLI/H1/export work and the broader matrices were not rerun.
