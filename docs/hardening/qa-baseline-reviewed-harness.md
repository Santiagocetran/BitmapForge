# Reviewed frozen-harness baseline — stopped at Chromium prerequisite

## Outcome and browser-slot handoff

**STOPPED, not a completed 33×2 baseline. Browser slot released.** The first fresh Chromium preflight failed before page creation with the frozen 30-second browser-launch timeout. Following the explicit retain-and-stop rule, no Firefox preflight, smoke case, targeted Q3 observation, intentional trace probe, broad suite, build or final run followed. No adaptive repair, retry, alternate flags, assertion change or budget change was attempted.

At **2026-11-15 05:49:06 UTC**, exact executable/argument `/proc` readback found no owned live browser/server processes; listener readback found none on 5291/5292/5293. No emergency process termination was necessary. This readback does **not** convert the supervisor's failed shutdown contract into a pass.

## Identity and retained execution

External QA root:
`/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa`

New independent run root, abbreviated `RUN` below:
`QA/runs/baseline-20261115-reviewed-r6-550842c`

Actual attempt: `RUN/baseline/preflight/chromium/reviewed-a01`.

- Accepted executable digest: `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`. Every entry in the 28-file executable map and 62-file complete supplier map matched before execution and after the stop. No harness bytes changed.
- Immutable baseline: `/home/agent/BitmapForge-hardening-research/baseline/dist`, revision `550842cab61002c7cc6563e50b9fcdeb17c9bf01`. This target was not rebuilt.
- Paired Node: `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`, actual v24.22.3; locked runner/CLI 1.59.1.
- Explicit parent Chromium cache: `QA/browsers/parent-baseline-pw-1.59.1`, no fallback or provisioning.
- Actual launched headless-shell binary: `chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell` under that cache; SHA-256 `22d72b589f908111fa29ff4e61ead8a0601e925177f59c70e2e851c22e9b1886`.
- The runner environment's `executablePath()` instead records full Chrome, SHA-256 `696170a79640ec5b50c7518140ace06c69a49cfb295bf527d4a85e26a12b89a7`. These are distinct executable observations; no successful current browser-version/WebGL claim is made.
- Server served-byte comparisons matched `/index.html`, actual entry JS, Three.js, CSS and `/ci-revision.txt`. The complete dist start/end manifest was unchanged. Environment reports `sourceUnchanged: true` and `harnessUnchanged: true`.

Exact executable invocation and explicit environment survive in `command.txt` and `environment.json`; discovery, raw stdout/stderr, JSON/HTML reports, append-only ledger, server identity/exit and reconciliation are retained. External orchestration only: profile scratch `qa-reviewed-run.py` and `qa-reviewed-diagnostics.py`; neither is part of the frozen harness.

Executed commands from `/home/agent`:

```sh
python3 /home/agent/.hermes/profiles/gloin/cache/scratch/qa-reviewed-run.py before
python3 /home/agent/.hermes/profiles/gloin/cache/scratch/qa-reviewed-run.py chromium preflight
```

Integrity check exit 0; preflight actual runner/orchestrator exit 1. No historical `baseline.sh` command was used.

## Exact failure and classification

The discovered/reported prerequisite identity reconciles 1/1 with no missing/extra/duplicate IDs. Its outcome is **blocked**, not application or quality-policy failure:

```text
TimeoutError: browserType.launch: Timeout 30000ms exceeded.
<launched> pid=2509161
Requested GL implementation (gl=none,angle=none) not found in allowed
implementations: [(gl=egl-angle,angle=default)].
Exiting GPU process due to errors during initialization
```

These are retained launch-phase diagnostics, not a proven root-cause determination. Browser creation never completed; no meaningful-preview, console-injection, Q7 or application assertion was reached.

Separately, the real supervisor records `serverClean: false`: requested SIGTERM, child exit code 143, `closeCompleted: false` despite an unchanged final dist manifest. Preserve this as an **unresolved harness/server lifecycle contract failure**, not an application defect and not a successful graceful shutdown. Later process/listener absence establishes release safety only. No repair was attempted.

The attached failure trace ZIP passed CRC validation and was inventoried/hash-recorded in `bounded-diagnostics.json`; because launch failed before page creation, it cannot prove navigation, app snapshots or intentional assertion-failure tracing. **Zero new screenshots and zero axe scans** exist. Scanner-manifest equality reported by the summarizer is vacuous here and provides no accessibility acceptance.

## Reconciled 198-cell matrix

The frozen reducer was executed offline with `QA_PREREQUISITE_RUN=QA/runs/baseline-550842c-stage1`, importing historical prerequisites only, not old smoke successes. Its second execution preserved matrix and ledger hashes exactly (idempotent).

| Phase / engine     |  Pass |  Fail | Blocked | Not run |
| ------------------ | ----: | ----: | ------: | ------: |
| Baseline Chromium  |     0 |     0 |      33 |       0 |
| Baseline Firefox   |     0 |     0 |       0 |      33 |
| Baseline WebKit    |     0 |     0 |      33 |       0 |
| Final, all engines |     0 |     0 |       0 |      99 |
| **Total**          | **0** | **0** |  **66** | **132** |

Chromium's fresh launch prerequisite blocks its cells; Firefox is deliberately unexecuted after the stop. WebKit retains its historical missing `libwoff2dec.so.1.0.2` block without launch or OS repair. All 99 final cells remain not run.

- `RUN/matrix-198.json`: `fb7f4533b216da8c88458168e0cea603db7e00a73745b30f8fe7e7c9a4d71c93`.
- `RUN/ledger-198.jsonl`: `56303a75ff138a1322f0fa404ac64356ac18fff55fb3197a129b671751cdfb59`.
- `RUN/bounded-diagnostics.json`: exact launch error, actual executable hashes, trace integrity, served identity, cleanup readback and limitations.
- `RUN/integrity-before.json`, `integrity-after.json`: both verified every one of the **1,171 historical evidence entries** by size/SHA-256. Historical matrix remains `67cef4a0c13a587db5a70c7f7189d562445e3705e73f8c7dc101d1bfb0b934cc`; no prior attempt was rewritten.
- Frozen summarizer exit 0: one prerequisite attempt, zero scans, 42 hashed retained files in `RUN/evidence-sha256.json`.

## H1 observation and outstanding acceptance

**Targeted H1 palette collapse/reveal via the current frozen Q3 case was not executed.** Exact reached phase: Chromium launch prerequisite; no palette/task/collapse/reveal phase occurred. Existing Q3 historical evidence and accepted plan remain unchanged. Do not infer a new stale-handle root cause, reproduce success, or authorize an application fix from this stopped attempt.

Historical application findings (desktop collapse/reveal drag and Help notice isolation), sparse Shape/Text quality-budget failures and strict supplemental Q7 IDREF/named-landmark policy remain separately classified by the accepted audits; none was rerun, cleared or newly attributed here. No axe/WCAG/AT/Safari/physical-device/zoom/release claim follows.

Next authorization must resolve the unexpected prerequisite/lifecycle blocker and preserve this attempt before any new attempt ID is used. Full 33-case Chromium and Firefox baseline, fresh structured console/APNG contracts, Q7 scans, H1 exact-phase observation, intentional trace proof and final comparison remain outstanding. No source expansion, app/manifests/lockfiles, install, OS repair or final build was performed by this worker.
