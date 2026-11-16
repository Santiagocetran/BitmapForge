# Independent audit — five-file lifecycle implementation/offline candidate

## Verdict: REVISE — implementation stage for the complete R01–R07 server-only handoff

The production lifecycle/telemetry repair has meaningful actual-module and actual-consumer proof, and the independent offline rerun passes. Two bounded **driver completeness/containment findings** below prevent accepting this exact five-file candidate for the proposed complete server matrix. They do not reopen the accepted design or require application, dependency, runner, predicate, flag or budget changes. No runtime row is accepted or authorized by this audit.

Reviewed freeze SHA-256: `3525a8453e46b0ec73a371c67fed6dccb843d8aa58baea882355717a478f7f68`.

Read AGENTS.md, web-product-development, accepted lifecycle plan/revision audit, prior driver independent audit and revision3 ACCEPT, verification checkpoint, all five candidate sources, review/runtime plan, frozen originals, installed preview close implementation, retained parent B01 and implementation evidence. Repository HEAD remains the documented `550842cab61002c7cc6563e50b9fcdeb17c9bf01`; unrelated shared edits were not repaired. COLLAB records are absent. No server, HTTP listener, browser, regression-driver main, install or code fix was launched. The authorized offline suites created their normal fresh external fixture evidence; sole authored repository file is this audit.

## Blocking bounded findings

### L1 — Required R04 unresolved-startup orphan scenario is not executable

**Accepted contract:** plan §4 R04 explicitly includes supervisor SIGKILL before ready, during close, **and an unresolved-startup benign child fixture**. This is separate from R03 cancellation and from an already-ready close-promise fixture.

**Actual candidate:** `tests/server-lifecycle-control.mjs:399–402` offers R04 only `before-ready`, `during-close`, `during-close-fixture`. `main:410` rejects any other scenario before spawn. The unresolved acquisition body exists only under `controlledFixtureBody(..., 'in-flight')` (`256–259`), routed as R03. `runControlledCase:307` signals that fixture supervisor with SIGTERM, not SIGKILL. Conversely, `during-close-fixture` acquires a resource and becomes ready before losing its supervisor. Neither is the required unresolved-acquisition supervisor-loss row.

An independent read-only VM evaluation of the exact scenario table returned:

```json
{
  "R04Scenarios": ["before-ready", "during-close", "during-close-fixture"],
  "R04PendingOrphanScenarioAvailable": false,
  "InFlightFixtureUsesUnresolvedStartup": true
}
```

The **offline** actual-factory pending-orphan test (`server-lifecycle.test.mjs:481–503`) is useful and passed, but injects a600ms budget and is not the separately approved production-budget runtime row. The handoff matrix currently omits rather than retains that accepted R04 requirement.

**Required bounded correction:** expose an explicitly labeled R04 unresolved-startup factory fixture through the existing case/approval interface; establish acquisition-entry/PID evidence before supervisor SIGKILL; retain child-local failure, real events, owned absence and emergency-reap rejection under the existing production bounds. Keep actual-preview before-ready and during-close rows separate. Add offline routing/ordering checks and include the scenario in the runtime handoff. No live execution is requested in the correction assignment.

### L2 — R06 bypasses the controller's interruption/owned-cleanup envelope

`main:425–440` runs R06 in the special fixture branch and returns **before** installing the controller SIGTERM/SIGINT handlers at `442–447`. `runFixtureCase:350–397` installs no replacement interruption handlers. Within it, `viteRefuse:370–384` launches a **detached** direct Vite child with three pipes, no IPC/orphan lifecycle, and retains its owned identity only in the local closure.

The9000/10000ms poll/reap sequence only runs while the controller survives. A controller SIGTERM/SIGINT during that await follows Node's default termination instead: JavaScript `finally` is not a shutdown hook, so the child cleanup/absence readback and terminal failure record are bypassed. The detached child is outside the dying controller's group. In contrast to the production child, it has neither authenticated IPC-loss handling nor its own finite startup watchdog; implicit stdin EOF is not a substitute for those guarantees during unresolved Vite startup/close. This is a concrete missing ownership path, not proof that a leak already occurred in a live run.

Independent source-path inspection confirmed both the special branch and `runFixtureCase` register no SIGTERM/SIGINT handler, while this Vite child uses `detached:true` and no IPC. No server was started to obtain that finding.

**Required bounded correction:** put R06 under a first-terminal, nonextending interruption/cleanup envelope within the owned driver. Retain the Vite child/descendant identities where that envelope can revalidate and reap them, close only the disposable listener owned by this driver, persist interruption as failed, and read back absence within the unchanged absolute cap. Any emergency cleanup remains failed acceptance. Add an offline interruption-before/during-refusal test against the actual orchestration/control path, not merely another accepting/refusing adapter test. Do not change Playwright/Vite, production budgets or the stale listener's ownership policy.

These are existing accepted matrix/finite-controller obligations. They do not call for additional application functionality or broader QA coverage.

## Production repair findings that hold

- **Real B01 cause addressed rather than status remapped.** Parent B01 remains actual child143/null with closeCompleted:false, actual supervisor exit/close1/null, strictClean:false, actual consumer commandExit1, cleanup absent:true/emergency:false. Its five retained file hashes still match. Installed Vite preview `config.js:35077–35107` removes its callback synchronously during public close, but its competing close-and-exit callback can assign143 and terminate before later persistence. Candidate child is detached from the Playwright-shaped group and receives normal stop over authenticated IPC, avoiding that direct-SIGTERM race.143 remains rejected.
- **Authentication/environment:** random32-byte session; exact version/session/PID/type/signal/ordering checks on both receiving sides; explicit child QA environment including injected session; readiness does not imply close. Parent-side protocol/transport failures poison the consumed `state.error` monotonically. Child abort/protocol/disconnect/EOF errors retain failure and cannot publish successful readiness later.
- **Ownership/deadlines:** process PID/startTicks/PGID/SID checks precede group signals; detached leader must be its own group/session leader. Controls precede operational asynchronous startup. Startup and first terminal bounds retain the earlier deadline; repeated stops cannot extend it. Pending acquisition, late acquisition, startup rejection and orphan loss exercise the real factory, not solely the older interval fixture. Emergency group termination remains failure, not graceful evidence.
- **One Vite finalizer:** `server.mjs:63–83` guards one close and calls the acquired public `close()` synchronously before passing its promise through unchanged boundedClose. Early plugin acquisition precedes preview listen completion. The installed-source EOF VM test passes both the real synchronous-owner case and the deliberately delayed-close counterexample. This proves the ordering seam offline, not live Vite acceptance.
- **Strict persisted boundary:** reservation precedes actual spawn through the shared `spawnReservedChild`; stale targets refuse. Full identity/environment/manifests/served hashes/completion validation precedes clean terminal publication. Atomic stage/rename failures retain an earlier rejecting record; persistence failures poison existing consumed error fields. Child completion persistence precedes actual exit0. No consumer/predicate edit or synthetic exit/close/absence completion was found.
- **Actual consumer:** tests extract the unique unchanged `run.mjs` gate and commandExit statements and run those bytes with real filesystem records and real imported predicates. Consumer hash remains `3d9f28ac3bece5df18006f9dd77ed9b041956a01d6f2c898f60411fa7240352b`. The integrated real factory/IPC/supervisor/reserved-writer clean positive yields child0/null and consumer0; protocol, snapshot, close and final-write negatives reject even with otherwise clean runner inputs. Initial/intermediate/terminal-stage/rename/all-write failures are separately exercised. Existing runner-negative assertions remain.

No additional production-code correctness blocker was established in this audit. That is not acceptance of unexecuted runtime behavior.

## R06/R07 and fixture attribution

- **R06 exists now:** runtime source calls the actual installed WebServerPlugin with reuseExistingServer:false, separately invokes direct Vite preview with strictPort:true, compares owned listener PID/start/socket/payload before/between/after, and invokes the production stale-target reservation. It is not merely a port probe. However, offline tests run the shared refusal orchestration with injected adapters and VM-evaluate the installed Playwright refusal branch; they do **not** execute actual plugin availability, Vite binding or a live stale listener. L2 remains outside those passing tests.
- **R07 actual factory proof exists:** private-dist snapshot mutation exercises the actual production factory, controls, observer/supervisor validation, reserved telemetry and exact persisted consumer. The child goes nonzero, unchanged:false survives and the consumer rejects. The runtime branch is explicitly fixture-only and inventories immutable DIST before/after. It does not pretend to serve the application, and no immutable dist mutation is authorized.
- The retained older interval/grandchild orphan fixture proves benign owned IPC/EOF-loss containment only. Separate new tests actually invoke unresolved acquisition and unresolved close through the production factory. Neither clears its corresponding unrun runtime row, and the controlled close fixture must not replace actual-preview R04 close-window evidence.

## Explicit disconnect: intentionally failing behavior is preserved

The fresh independent run reproduced the test's locked-Node behavior: explicit parent-side `child.disconnect()` led to actual child exit1 and process absence, but **no ChildProcess.close event**. The observer preserves closed:false and closeTimeout:true, and the exact consumer rejects. The test passes because it asserts that genuine rejection; it does not claim successful graceful close. Normal stop uses IPC send with stdin retained, not explicit disconnect. No close event is synthesized from disconnect, stream destruction, an exit event or `/proc` absence. The retained earlier failed attempts remain evidence, not erased failures. This is correct fail-closed treatment and is **not** an additional requested repair.

## Independently verified bytes and execution

| Target relative to QA/harness      | SHA-256                                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| server-supervisor.mjs              | `cfb37e8c6bdd1f768384c87cf21ad625791468adb79feac99bc89d88ed5e81fd` |
| lib/server-telemetry.mjs           | `8bfe012ceaab8bc273ecebf6ba67b5e79d8f169e4997beb9af1b8b5f463d6a80` |
| server.mjs                         | `1905120d8b52f28f6a730108e82a554b3c4a7433dba59f648d47a0b2a6a99577` |
| tests/server-lifecycle.test.mjs    | `6ee3285a62d4cae978dd5e370f36e5bae717a99da0260dc41b14f8a36c2100e8` |
| tests/server-lifecycle-control.mjs | `ceb7751ca526a4d1889d424db7bf52af27ca5470d2e4a9722c576b1062b71154` |

- Independently recomputed all five current/frozen-source/mechanically-applied hashes: equal. Five fresh locked-Node syntax checks: exit0 each.
- Full30-file inventory independently recomputed: `a0c03c45be219ae87b81e8c62bec1638265447c34808bea841eb47a9bd2da253`.
- Original28 inventory compact hash remains `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`; all28 archival bytes and all25 non-lifecycle canonical original bytes independently match. Runner, predicates, config, env, existing tests and specs are preserved.
- Original revision3 driver freeze remains `f8feb540d305cf6682f79cce754656727a983d8b3b9b14a2e98d61094af29f0a`. Historical ACCEPT is not reused for changed candidate hashes.
- Patch hash independently matches `d8034268f4bacef5946c35fab5156db3aaebd22e10a56107c2e8626857d0a719`; inspected retained successful forward apply/check, independently verified all five reconstructed targets, and ran `git apply --reverse --check` against that mechanical reconstruction: exit0. No copied server executed.
- Retained final offline log hash independently matches `7e3d4ed75b6e3393e9d558c44c3c3e555a0ad3d32c5b4accea3275881b54e39c`.
- Fresh independent command with locked Node `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`: `--test --test-reporter=tap QA/harness/tests/repair.test.mjs QA/harness/tests/server-lifecycle.test.mjs` returned **exit0;152 tests,152 pass,0 fail/cancelled/skipped**,110 top-level TAP entries. Actual stdout was returned by the terminal tool. Fresh external evidence: `QA/repairs/lifecycle/driver-stage/offline-AXTKZL/` and profile scratch `qa-repair-offline-c6ajIA/`.
- D1 old500ms-extension causal regression and all seven D2 selective accepting-validator mutants pass their negative controls; passing152 is not substituted for missing runtime obligations.

## Remaining gates

Correct L1/L2 within the existing five-file ownership, update bounded offline checks/handoff, refreeze the exact candidate and return for independent re-review. Do not rewrite B01 or historical archives. No approval file was created here.

After source/offline acceptance, parent may separately approve fresh one-scenario server-only attempts. Every original R01–R07 subcase remains unexecuted here; real close-window observation, strict0/null/completion, finite local orphan failure, ownership/absence and no emergency success credit remain mandatory. Full lifecycle implementation/server-only ACCEPT requires those real results. Chromium prerequisite, WebGL/preflight failures, historical Chromium-stall attribution, H1/Q3, WebKit libraries and complete33-case baseline remain separate and unaccepted.
