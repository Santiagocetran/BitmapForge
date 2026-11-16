# IC1 re-entry implementation audit

## Verdict

**ACCEPT — guard/re-entry implementation only.** No material defect found against the accepted plan and its independent audit. Native four-row acceptance remains outstanding: Chromium Q1.image.D/N and Firefox Q1.image.D/N. This verdict does not grant native execution, transfer the browser lane, accept cancellation behavior, or clear release/PR readiness.

Reviewed on `gloin/release-hardening`. Read AGENTS.md, web-product-development, the re-entry plan, plan audit and implementation report. HERMES.md and the named COLLAB bootstrap records are absent. Review covered all six changed/new source files, the unchanged route test, exact accepted-to-candidate delta, generated counterexamples and retained execution records. No behavioral suite was redundantly rerun, and no browser, server, installation, production/canonical modification or remote operation was performed.

Paths below use the common scratch parent `/home/agent/.hermes/profiles/gloin/cache/scratch`: `A = image-cancel-contract-v1`, `B = image-cancel-contract-reentry-v1`, `E = B/tests/evidence`. Final behavioral batch: `E/reentry-hlzfvy`.

## Independently verified identity and preservation

Recomputed these SHA-256 values from actual bytes; all match the supplied seals:

| Artifact                              | SHA-256                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| E/evidence-index.json                 | `4d97fa256b35c64ca61e1d6997b1b0146b8cbc561c4b9c27ab77dd9655aea537` |
| E/final-source-allowlist.json         | `11adf71f942a67be8d7d90c02d382a4b8fd1f1c186e7bd16cb30c4b3a5a94ec7` |
| E/final-v3-source-toolchain-pins.json | `20ff3ce9c2ab2d9ca77d2c71a3b83c5da5065f0176f85ddfabdeb0aa7e26619c` |
| Repository implementation report      | `b8ad5fd95305cd89280da7e748589aecf26b813a88c03b0f4e46b14e7cc84c39` |

- Read and validated every indexed file's length/hash, symlink target and directory identity: **9,740 entries**, zero mismatches; complete actual/indexed path union agrees, excluding only the index itself. The external implementation report also matches.
- Independently enumerated the suffix-independent source/configuration set: **72 files**, matching the allowlist exactly. Compared the **69 baseline files** against both A and B/preserved. Exactly config, env and relocation test changed; only re-entry test and its two fixtures were added. No removed or unexpected source paths.
- All **14 final source/toolchain pins** match actual bytes, including Node binary and installed Playwright source/package pins.
- Re-enumerated every historical root and compared against pre-inventory: **834 before/after/path-union entries**, zero added, missing or changed files. Read and verified all **35 historical native-index references** independently.
- `tests/ic1-route.test.mjs` retains SHA-256 `c2cb12479568e0040ea36275c7cd2eec5299ba2f313c5b356ff2dabf9613103a`. UI, oracle, route, server/supervisor and other copied files retain baseline bytes. No equality threshold or native budget change is hidden in this repair.

## Source contract review

`harness/config.mjs` changes only initialization dispatch: call the guard, write the original three `.keep` files only on first entry, then complete publication. Native selection, runner values, output operands, tracing and server configuration remain unchanged.

`harness/lib/env.mjs` preserves environment, graph, supervisor, explicit temp/cache and containment checks before claiming. Its ownership protocol satisfies the accepted trusted-private-harness model:

- First claim rejects existing attempt output and foreign run content, allowing only real contained tmp/cache directories. Exclusive `wx` ownership creation and a post-claim freshness check prevent a second initializer from adopting or writing the attempt.
- A cryptographically generated nonce binds the complete schema/private-root/run/phase/lane/engine/attempt/output/dist/PID/start-tick identity. Marker JSON and capability are bounded and compared; marker containment is checked before reading.
- The initial persisted record is **pending**. All `.keep` writes must succeed before ready publication, truncation/fsync/close and local issued-state/environment publication. A `.keep` exception never reaches completion. Marker-write/publication failures do not export authority; partial attempts remain consumed rather than being repaired or deleted.
- Reload requires ready status, nonce digest, exact capability/marker identity and current tuple, live owner start ticks, and either the same process's locally issued token or independently read direct-parent identity. The proc parser handles parenthesized command names, validates required numeric fields and excludes zombie/dead states. Worker indices confer no authority.
- Reload returns `first: false`; config does not recreate `.keep` files or clear artifacts. Current output/ancestor containment remains checked. The marker and preservation sentinel lie outside runner-cleaned report/results folders.

This is not hostile same-user executable authentication or a general recovery system. Direct children intentionally given the capability are trusted, as specified. No arbitrary ancestry walk, token rotation, stale adoption or new approval mechanism was introduced.

## Actual execution evidence, not discovery substitution

Inspected the fixture adapter and spec: the adapter calls the real guarded config **before** disabling webServer; the test requests no browser/page/context/request fixture. The command records invoke the installed Playwright CLI with `test --config`, not `--list`.

| Required discrimination       | Verified retained result                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Actual browserless runner     | exit0; one worker, one executed passing test                                                                                                     |
| Parent / worker / body        | parent PID 3791031, start ticks 203620588; worker and body PID 3791044, start ticks 203620760; worker PPID 3791031                               |
| Parent-to-worker preservation | exact recorded marker, three `.keep` and sentinel bytes/mtimes match                                                                             |
| Retained-old source           | exit1, actual worker spawned; `IC1 existing attempt destination` at original env line 57 during config reload; only parent config event, no body |
| Independent consumed-root CLI | exit1 at existing-attempt refusal, no worker/body; test's complete file hash/mtime inventory comparison passes                                   |
| Concurrent claim              | one child exit0 and one exit1                                                                                                                    |
| Child lifecycle               | actual exit and close records, forced=false and observed owned-process absence                                                                   |

Verified old config byte equality to A and old env equality after **only** the documented cache-operand relocation. The same adapter/spec exercises both candidates. This rules out an import/setup failure masquerading as the original reload regression.

The consumed-root comparison is implemented in the executed test, not a separately persisted before/after inventory pair. Its passing assertion, genuine refusal record and retained sentinel/event bytes support preservation without claiming an additional artifact exists.

All six selective mutant controls exit0 on the corresponding genuine negative; each mutated probe exits1 at its **named ERR_ASSERTION**, actual acceptance status0 versus expected refusal1: freshness, nonce, tuple, executable-live state, start ticks and ancestry. Their generated sources and lifecycle records are retained. Sentinel comparisons precede the named assertions, and setup/import failures would not satisfy these assertions. The liveness mutation uses deterministic proc-state substitution, not a claimed native zombie experiment.

The final log records **57 tests passed, zero failed/cancelled/skipped**, with Node24 execution records. This is reviewed retained execution, not a fresh reviewer run. Separate Chromium/Firefox discovery checks retain exactly the two image registrations; they are not native acceptance. Original route VM tests remain offline oracle/ordering checks.

## Observer correction and failure attribution

The retained final-v2 log has **56 pass / 1 fail**, specifically `only browserless Node runner processes observed` during consumed-root reuse. Its associated `reentry-ojuEqY/runner-reuse-2a74689d-3abc-4086-a0e9-ed3ef7f63a72.json` records the expected CLI exit1 but an empty sampled argv for PID 3789777/start ticks 203614437. Thus this was an observer assertion failure, not evidence that the ownership refusal failed or that a browser launched.

The final observer retains the last nonempty argv actually observed for the exact PID/start-tick key and counts empty samples. It never substitutes a guessed executable and still rejects an identity never observed with a usable argv. The final-v3 runner records identify only the explicit Node CLI and installed Node worker and retain real close/absence outcomes. Polling remains bounded supporting observation, not proof against every arbitrarily short-lived process. The old failed summary does not independently retain its overwritten earlier argv history; that limitation does not undermine the inspected correction or final evidence.

No historical EADDRINUSE observer record was repaired or reclassified, and TIME_WAIT is not treated as LISTEN. Earlier failures, mutation failures and old-source failures remain sealed.

## Outstanding acceptance and delivery

The four native image-cancel rows remain **not accepted**. They still require the original eight-field preservation/full artwork equality, downloads, return-cube preview, no-alert/loaded screenshot and successor assertions. A new explicit parent native grant and current exclusive lane transfer are required under the already accepted workflow; this audit creates no additional approval layer. Historical engine matrices and other manual/release gates remain unchanged.

Only this audit document was created. Sealed evidence, candidate sources, historical trees and the indexed implementation report were not modified. Audit delivery uses the installed formatter on this document only and `git diff --check`; no commit or remote write is included.
