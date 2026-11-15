# Independent R1/R2 re-review — external CLI diagnostic adapter

## Verdict: ACCEPT — exact diagnostic adapter only

**ACCEPT the bounded R1/R2 repair at manifest SHA-256 `e046b36f02280c849d66804de6236d414506658c51cfd9eb051882acc6d1dee6`.** The two mandatory findings in the previous REVISE audit are resolved in these exact implementation/test bytes. This accepts neither measurements nor a rendering diagnosis, production/source repair, source/build equivalence, full P, C, or release. No browser lane is transferred by this verdict.

External adapter: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-cli-render-diagnostics`.

- Entry SHA-256: `2fdd4ae793a1e17057ec73ac22a6cf6164d3cb6e424d7cd554a8382194e3077d`.
- All **11 root `.mjs` modules**, including both test modules, match the actual `assertAdapterFreeze()` manifest and independently pass Node syntax checks.
- Accepted measurement-plan hash remains `b1fd0e6ae2bd938480a983c06d03a6faa79de98b16cb25cae162896292a5f402`.
- Reviewed repository AGENTS, web-product-development guidance, previous adapter audit, repair handoff, manifest/freeze, changed executable paths, shared persistence implementation and dedicated regression tests. Checked Codex/COLLAB bootstrap paths are absent. Other owners' shared-checkout changes were not edited.

## Required findings — disposition

### R1: supplied current authority and explicit transfer — resolved

`adapter.mjs:42–59,97–104,391–421` requires the separately supplied parent owner argument to be nonempty and exactly equal both `approval.currentLaneOwner` and `approval.laneTransfer.from`. Transfer destination remains `cli-diagnostic`, explicit must be true, and evidence must be present. The executable no longer hardcodes historical authority. The pending template has null owner fields and explicit=false; nothing here populates it.

In addition to the passing dedicated regressions, independently exercised the pure gate with **the task-supplied current owner `sa-0-8ec296ff`**: matching synthetic review-only fields passed; transfer sources `sa-0-9767c20b` and `sa-0-70552885` failed against that separately supplied owner. This was an in-memory gate test, not a real approval, transfer, call to `run`, lock acquisition or subprocess launch. Actual parent discovery/pinning and explicit current-owner transfer remain mandatory at execution time. Worker completion alone is not authority.

### R2: independent reserved persistence and cleanup — resolved

`persistence.mjs:44–89` is imported by the actual render finalizer and decoder wrapper. It preserves returned helper failure priority, attempts monitor stop and owned cleanup separately, captures the real returned subprocess/cleanup record in memory, then independently attempts stdout, stderr, decoder ordinary process evidence, reserved aggregate process evidence, reserved cleanup evidence and reserved terminal evidence. A failure in any earlier ordinary or reserved target cannot skip the remaining attempts. Error lists are bounded and separate from the primary failure. Complete filesystem failure is explicitly reported, not called durable success.

`decode.mjs:12–43` retains the finalized decoder record in both shared cell records and `commands` before rejecting. The outer cell terminal includes shared child records even when decode throws. Decoder records therefore survive ordinary decoder log/process persistence failures without an uncapped emergency file.

`contracts.mjs:166–208` withholds the existing 64KiB/four-file reserve from ordinary session writes **inside** the unchanged 256-file/128MiB allowance; terminal target names are allowlisted. `adapter.mjs:112–122` reserves session ledger/terminal before checkpoint copying. `sessionScope` and `finalizeSession` preserve the first work failure, block unstarted cells, independently attempt ledger/terminal and ordinary manifest, and invoke owned lock release in finally. Lock removal compares inode/device and closes the owned fd. No lock-stealing or containment relaxation was introduced.

Real benign Node tests exercise these same imported finalizers, decoder wrapper, sampler/cleanup and session scope, not a substitute persistence model. Fault injection intercepts actual `fs.writeFileSync` calls. Coverage includes render stdout/stderr, reserved process/cleanup, all-write failure, decoder stdout/stderr/ordinary process failures, real exit 7 plus ENOSPC priority, actual checkpoint capacity/I/O failures, ledger/all-write failure and owned fd/lock release. Integrated scope tests put a valid later subprocess after a failing child and verify it is never launched, its marker is absent, and its ledger entry is blocked. Terminal readback verifies actual close/exit/group/cleanup data when writable.

The retained old finalizer is still executed as a causal counterexample against a real benign child: injected stdout failure attempts only stdout and skips reserved result/cleanup. Its retained proof hash still matches the repair freeze after the test rerun. These tests establish nonbrowser failure ordering, not Chrome/render/recorder cleanup or successful diagnostic measurements.

## Runtime/preflight and CI policy

Independently called `preflight()` **in memory**, not the CLI mode that rewrites the candidate. Chrome was queried only with `--version`; no browser was launched. The whole current preflight exactly equals the existing candidate, with no changed input pins, before creating this report.

Preflight SHA-256: `f8265c91ec47cdbf9bd78ab8f7d9f4b1c68642bfc3359246c43d2159ffabbade`.

| Actual executable | Verified identity                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node              | `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node`; `v24.22.3`; SHA-256 `a7ec1b37e6ff9d187e4198c5b6df9a4eb1c74dd31804fb3bac55cc4ceca1ac01`                                       |
| npm CLI           | `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/npm/bin/npm-cli.js`; actually invoked under that Node; `11.21.2`; SHA-256 `8e5f6f3429f8cdbe693cdc29904e9d5a7b127a494bd15c804bd54c7403bfcbe7` |

Both reported paths equal their actual realpaths. The gate binds exact Node/npm versions, executable paths/hashes and the approved whole-preflight hash; `run` recomputes current preflight before lock/spawn. The old npm10.9.9 prerequisite is resolved by the actual already-present approved CLI, not an evidence-field substitution or install. Puppeteer remains 22.15.0 and Chrome remains 127.0.6533.88.

Literal CI, NODE_OPTIONS, PUPPETEER_EXECUTABLE_PATH and PUPPETEER_CACHE_DIR are absent; TMPDIR is the authorized profile scratch. No overrides were deleted and no CI value was manufactured. Existing tests preserve absent/empty versus nonempty `0`/`false` CI semantics. Source gate and actual-main-Chrome argv checks retain the existing conditional sandbox policy: absent/empty CI does not authorize disabling sandbox. No actual launch-policy success is claimed.

## Independent execution and protected bytes

Executed:

```sh
/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node --test /home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-cli-render-diagnostics/adapter.test.mjs /home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-cli-render-diagnostics/repair.test.mjs
```

**36 passed; zero failed, cancelled or skipped; exit 0.** Independently checked all **11 modules** with the pinned Node's `--check`; exit 0. In-memory freeze/runtime/protected-evidence validation also exited 0.

- **13 protected files** match the retained prior preflight size/hash pins, including production CLI index/server/harness, helper, checker, fixtures, accepted plan, retained bundle and root/CLI/embed manifests/lock.
- **15 archived prior files** match `retained-revise/retained-hashes.json`.
- Original evidence-manifest SHA remains `d9cf8ba3c0c76b22fcaaedb6ebf2c8a0f8c059f422247a7dacf26094c71375c0`; **233/233 original entries match size/hash, zero mismatches**.
- Frozen helper SHA remains `255be7ab9c87202d5df2abee8452a9e04aa1dcc99c991d45b5eec5da0f39f635`; checker remains `94c65b01355ea0df04fadddf49dcfcb49542a9a172f8b53cd8d085ff3dd7a701`; retained bundle remains `9681565ac5e39d8f6e36a8f4475c554959f67baf48f2064259117bb402661a46`.
- No `pass-*` directory exists. No browser/server, measurements, installation, build or source/code edits were performed. The existing counterexample test rewrites its proof with byte-identical content; its frozen hash was verified afterward.

One initial independent evidence-verification command exited 1 because it resolved manifest-relative evidence paths against the repository rather than profile scratch. Correcting the read root produced the complete 233-entry successful verification above; no evidence was changed.

## Execution boundary remains closed pending real handoff

The literal label **`retained-bundle-only; source/build equivalence unverified`** remains required. No owner build log/input-to-output mapping establishes source/build equivalence; this audit does not request a build or fix source. Parent A/B/stage1/checkpoint/runtime/build/environment handoffs, actual current-owner explicit lane transfer, exact-preflight approval and truthful backing/DPR capacity remain execution prerequisites. DPR2 still exceeds the frozen selected-buffer cap; nominal approval cannot make it fit. Existing numeric, scheduling, decoder, raw/queue/file, fixture and helper contracts are unchanged.

The pending approval template still rejects at the independent-ACCEPT gate in a pure nonbrowser call. This audit is an exact-adapter verdict, not a populated executable approval. Adding this report also adds a documentation input to future preflight inventory: the execution owner must regenerate/pin/reapprove its current preflight through the established handoff rather than reuse a now-stale whole-preflight hash. Do not refreeze executable bytes unless they actually change. Preserve old failure evidence and the current browser owner's exclusive lane; no browser launch follows this review.
