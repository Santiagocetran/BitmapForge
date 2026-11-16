# A watch-script compatibility amendment

## Status and cause

Plan only; requires separate delivered independent ACCEPT before editing. A's candidate implementation audit accepts its bounded dependency stage but withholds full acceptance. New Vitest's agent-aware default makes implicit `vitest` run once in this environment. The existing named `test:watch` script therefore no longer guarantees its advertised behavior. Retained implicit-watch failure and explicit-watch passing evidence are in the isolated tooling execution checkpoint; do not mask agent identity, unset CI or modify user policy to force a pass.

## Exact change and ownership

In isolated `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-tooling/package.json` change only the root script from `"test:watch": "vitest"` to `"test:watch": "vitest --watch"`. No test/run/coverage command, dependency/version/floor, workspace manifest, engine, environment or runner configuration changes. npm lock records do not mirror scripts; lock must remain byte-identical at `239a51b69219bae2d362b47004476880e36deb6d0335ec0b4bb83e185cb2202d`. Other accepted A manifest/lock changes remain untouched. The dependency amendment's three manifest-mirror records remain unchanged; only root source manifest hash is expected to change for this script.

## Verification

Retain the prior default failure; verify original root script runs once under the same recorded agent environment, using existing evidence rather than repeating an expensive unchanged baseline. After editing invoke the actual `npm run test:watch -- --max-workers=1` in a bounded PTY under Node24/npm11, unchanged agent/CI identities. Observe full initial suite and waiting state, touch an existing test in the isolated worktree without changing its bytes, observe the test rerun, send `q`, record normal exit and no leftover watcher/process/listener. Preserve original test content hash and compare afterward. Timeout/emergency termination is a failure, not normal quit. Record source/lock hashes before/after and PTY transcript; no hidden supplemental `--watch` command substitutes for the named script.

Run native runtime policy, root tests, lint, root package formatting and diff checks after repair. No dependency install/resolution is needed. The parent still owes final whole-tree relevant verification after all accepted changes and final browser gates. Independent implementation review checks the exact one-field diff and genuine PTY lifecycle evidence. Full A acceptance additionally retains all prior browser, formatting and generated-project dispositions; this amendment does not waive them.

## Rollback

Restore only the watch-script field to the accepted A stage if the explicit command regresses supported workflows; retain logs and mark watch unresolved. Do not revert accepted dependency changes, alter timeouts, suppress failures or publish remotely.
