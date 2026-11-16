# IC1 PNG retention — implementation verification handoff

## Outcome and scope

Offline verification complete; **independent implementation review pending**. No native authority or release-readiness claim.

All roots below share `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- R: `bitmapforge-research`, branch `gloin/release-hardening`, HEAD `6966686455fce3baa9bc749a272f372b27a52441`.
- B: `image-cancel-contract-reentry-v1`, unchanged accepted baseline.
- C: `image-cancel-contract-png-v1`, surviving private candidate, resumed rather than recreated.
- E: `C/tests/evidence` (local scratch evidence, potentially expiring).

Authority: current user-approved retry and bounded offline completion. Accepted plan SHA-256 `a6ff548dcd006a3063e1096baaf5a3edbbd0c43979a628496c890d3dc38e2dff`; independent M1/M2 re-audit accepts the written plan, not this implementation.

Inspected the actual retained helper and corrected tests; no further executable edits were needed during this continuation. The only B-to-C source differences remain `harness/lib/ui.mjs` and `tests/ic1-route.test.mjs`. The helper retains the single returned screenshot Buffer with contained exclusive raw writes before hashing that same Buffer, then writes a five-field exclusive sidecar. The existing eight-field snapshot, oracle, invitation guard and successors remain unchanged. Errors retain their original object/code/cause with row/label/destination context. Synchronous persistence can perturb timing.

## Actual execution

Working directory for both commands: C. PATH prepended `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/.bin`. Explicit executable N: `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node`, verified `v24.22.3`.

```sh
"$N" --experimental-vm-modules --test tests/ic1-route.test.mjs
"$N" --experimental-vm-modules --test --test-concurrency=1 tests/ic1-reentry.test.mjs tests/ic1-relocation.test.mjs
```

- `E/attempt-02/command.json` and `output.log`: exit 0, **35 passed, 0 failed**, no skipped/cancelled tests.
- `E/guards-01/command.json` and `output.log`: exit 0, **39 passed, 0 failed**, no skipped/cancelled tests. Unchanged installed-runner browserless worker regression passes; retained historical worker-init negative rejects specifically with `IC1 existing attempt destination`. Independent reuse remains rejected. Both engines' list-only registrations remain exactly Q1.image.D/N. No native browser or server was launched.
- Detailed generated evidence: `E/route-evidence-AcgxJo`, `E/reentry-LvFcT6`, `E/relocation-suite-BWhPfD`. Guard child records retain real exit/close, no-forced-kill and observed descendant-absence assertions.

Route checks cover desktop/narrow capture counts, Buffer identity, stored bytes, independently recomputed sidecar/snapshot digests, capture → raw completion → hash → invitation → reopening order, full successors, unequal pixels and equal decoded pixels with unequal raw PNG bytes. Six selective retention mutants fail their named assertions: missing-retention, stored byte identity (two variants), hash-input identity, capture count and expected-oracle-rejection. Separate raw/sidecar injected failures preserve original EIO/cause and partial/earlier evidence. Actual collisions, directory/file symlinks and invalid traversal/absolute row IDs are refused with sentinels unchanged; unchanged environment guards separately enforce foreign output-root refusal. Generated sources and exact mutant diffs remain in E; assertions are outside the route-error catch.

## Retained failures and correction attribution

`E/attempt-01` is retained, including original source snapshots, command and log: **32 passed, 3 failed**, exit 1. The failures were capture-count instrumentation including the later model-preview screenshot, directory-symlink preparation occurring before the intended snapshot boundary, and traversal rejection occurring at the earlier settings-output guard rather than the PNG guard. The prior worker corrected instrumentation before its blocked retry: count only image-mode captures, inject retention probes at the first image capture, and preserve the existing diagnostics directory before substituting a symlink. The successful retry used those surviving corrected bytes, not a changed helper or weakened artwork equality. The prior approval-blocked retry did not execute; the current explicit approval permitted attempt-02.

Historical worker-reload and Chromium artwork failures remain retained. Fresh offline passes do not recover discarded historical PNGs, prove a context-restoration cause, clear the old inequality, or establish native acceptance.

## Preservation and identities

- Complete B before/after path/length/hash comparison: **6,779 records, zero differences**, including old failures/native evidence. Original `before-B.json` follows six file symlinks; comparison uses the same resolved-byte semantics. A first in-memory comparison used link metadata instead and raised an assertion; correcting the comparison representation showed no byte drift. Supplemental link targets are recorded, without claiming they had original link-identity pins.
- Complete candidate harness/test source inventory: **72 files**, exactly the two permitted differences, no new source paths.
- **139** source-to-destination preservation mappings verified byte-identical: historical B/preserved/harness to C/preserved/harness, and current B harness/test sources separately under C/preserved/reentry-baseline (excluding generated test evidence).
- Existing B evidence seal: **9,740 entries** rechecked successfully without rewriting it.
- Existing historical pre-inventory: **834 entries** spanning original image-cancel-contract-v1 and canonical bitmapforge-hardening-qa rechecked with no mismatch. Immutable dist complete **35-file** inventory equals its existing build inventory.
- Offline run roots remain consumed and retained; never reuse them for native execution. No canonical, baseline, dependency, production, remote, commit, undraft, merge or deploy changes were made.

### Final executable SHA-256

- `C/harness/lib/ui.mjs`: `0c970e47499d6fbf25f576cd5fbf77dde943e3d0f040dac43e06a4113728bbdc` (12016 bytes).
- `C/tests/ic1-route.test.mjs`: `487c7c022cade4602b7f94abbf2aa576dbf980190db6976d436685bcaa7b38a0` (19572 bytes).

### Evidence SHA-256

- `E/before-B.json`: `6f5303655fec070d33e23ebb82848673790e69fbf14464d79fa1df40553a8c79`.
- `E/B-to-C.patch`: `39a5b7ba14358e3697646a24380163188ff774db26fd44247431b4f9152d3d28`.
- `E/final-source-inventory.json`: `b933abf006b71358437c36fcedf822c32924768b6b6ee4859b3cf4e0aaab53db`.
- `E/preservation-mapping.json`: `55e033a87baad2114c2c1ab3342ba49d88d70ea59f39ff54b0e1e8d20562a59e`.
- `E/preservation-verification.json`: `a70eaa29d3644c19e46ef520a4e0f3cc46fe7353fb5b9dd17e45ac549e8847ed`.
- `E/historical-verification.json`: `8d59ad0477474d6aa38865d09508b9c2bf8694738f2e90cb3252d962944bf6b8`.
- `E/attempt-01/output.log`: `1e8f38d640a32fff33930f186193c82cc088778ffb151d6082ad0f20f87ff3a0`.
- `E/attempt-02/output.log`: `c622e5f523fd35a8e0d783d2578fc0dd5b3e56ce57e359575eb687ef3a1a7264`.
- `E/guards-01/output.log`: `978923ed363d71148d18ea5a9ee6e611b36e155eb5fae032f4295a6443f95d08`.
- `E/evidence-index.json`: `3ed19e3922a3f6d433e04ea3ddda56f3ede184c83d953d78536b8966178ee195`.

### Actual fixture SHA-256

- `equivalentPNG.png`: `2875a6302240b4e06d16be45109ee7f48507b92a1455621e3d9260de76d1e85a`.
- `otherPNG.png`: `2c25667f9050714635170806ff56fc4681acfa09ccfd0e26b65e8fce71a2cbd8`.
- `png.png`: `8c10e0e97863322f70db48e2f4fc807144faf977cb01b79973e246cacfc1fe97`.

## Finite independent-review handoff

Review the accepted plan and re-audit, `E/B-to-C.patch`, both final source pins, final route/guard logs, named mutant outcomes/diffs, preservation mapping and finite evidence index. Issue explicit implementation ACCEPT or concrete accepted-scope findings. This report is not self-approval.

Only after independent implementation ACCEPT may the parent separately authorize and transfer the native lane for the already planned bounded fresh four-row batch. No native attempt was made here. Keep the historical failed row and all unrelated PR/release gates open. No new diagnostic framework or recursive sealing is required: the finite index excludes itself and this handoff.
