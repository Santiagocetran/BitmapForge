# CLI diagnostic current-checkpoint measurement handoff

## Status: NOT AUTHORIZED — parent review only

This is a nonlaunch checkpoint refresh after accepted seven-file B promotion. QA preflight retains the serial browser lane. There is no current-owner transfer to CLI, no lock acquisition, measurement, browser/server launch, build, installation, runtime/environment change or repair in this handoff. Full P, C and release remain blocked; the original fourteen bad-render artifacts are not cleared.

External review package: `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-cli-render-diagnostics/current-handoff/`. `preflight.json`, `pin-index.json`, `verification.json`, `capacity.json`, `proposed-approval.json`, `checkpoint/` and `handoff-index.json` are the fresh authoritative review artifacts. Historical candidate-preflight/freeze files remain unchanged and are stale for execution. The index pins exact bytes; the checkpoint includes this document, avoiding a self-referential embedded hash. Any later included documentation/source edit invalidates the current whole-preflight approval and requires regeneration, not executable refreezing.

## Actual toolchain and environment

The accepted existing Node executable `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node` actually executes preflight and the existing npm CLI `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/npm/bin/npm-cli.js`: Node v24.22.3 / npm 11.21.2. Preflight queries locked Chrome only with `--version`, resolves production-context Puppeteer ESM, and queries FFmpeg capabilities. Puppeteer remains 22.15.0, Chrome 127.0.6533.88. Exact realpaths, sizes and hashes are in preflight.

Actual inherited CI, NODE_OPTIONS, PUPPETEER_EXECUTABLE_PATH and PUPPETEER_CACHE_DIR are absent, not empty or manufactured. TMPDIR remains `/home/agent/.hermes/profiles/gloin/cache/scratch`. The unchanged policy is `CI-absent-or-empty/sandbox-policy-unchanged`: no sandbox-disabling flags are permitted. There is no CI1 fallback, browser substitution, DPR forcing, altered cap or changed launch flag. A future launch failure must be retained and stop the pass.

## Protected-pin reconciliation

Accepted adapter manifest remains `e046b36f02280c849d66804de6236d414506658c51cfd9eb051882acc6d1dee6`; all eleven root modules remain byte-frozen. The nine unchanged protected repository pins are CLI index/server/harness, helper, checker, both fixtures, accepted measurement plan and headless bundle. The four changed protected pins are root/CLI/embed manifests and root lock; each equals the exact accepted B promotion bytes. Lock is `bac330dd2d654f5ee0d08a2d0e97ba68829c4568c1df998372f34e5ab8b399ca`. None is an unexplained executable change.

All seven promotion files are independently compared with the accepted tooling delivery, including codeExport source/test and generated consumer spec. The latter is outside the adapter's inputFiles enumeration and therefore has an explicit supplemental pin in the external index/checkpoint. Other preflight deltas are documentation-only QA/adapter/parent handoffs, including this new checkpoint; these are identified individually, not falsely attributed to B or a build. No changed served-asset pin is attributed to a rebuild: all seven filesystem asset pins equal the old preflight, including the 181180-byte headless bundle SHA `9681565ac5e39d8f6e36a8f4475c554959f67baf48f2064259117bb402661a46`.

The helper remains `255be7ab9c87202d5df2abee8452a9e04aa1dcc99c991d45b5eec5da0f39f635`; checker remains `94c65b01355ea0df04fadddf49dcfcb49542a9a172f8b53cd8d085ff3dd7a701`. The original evidence manifest remains `d9cf8ba3c0c76b22fcaaedb6ebf2c8a0f8c059f422247a7dacf26094c71375c0`: 233 original entries are checked against profile scratch, not repository-relative paths. Original source-hashes.json describes the historical checker before separately accepted stage-2 changes; it is not a claim that current checker matches that older source checkpoint.

## Provenance and capacity

Required executable disposition remains **`retained-bundle-only; source/build equivalence unverified`**. Current bundle identity matches the retained original even after the parent-reported integrated build. This handoff does not possess a same-checkpoint owner source-input-to-output mapping establishing source/build equivalence. Build/test success reported by the parent is not invented mapping proof. No HTTP body or browser-consumption provenance has been collected here; those remain actual future-run obligations.

Capacity is computed, not observed backing dimensions. For each of the six mandatory cells:

| Cell  | Nominal size | DPR1 RGBA bytes | DPR2 backing | DPR2 RGBA bytes | At proposed 640000-byte ceiling |
| ----- | ------------ | --------------- | ------------ | --------------- | ------------------------------- |
| D01-O | 400×400      | 640000          | 800×800      | 2560000         | DPR1 fits; DPR2 BLOCKED         |
| D01-N | 400×400      | 640000          | 800×800      | 2560000         | DPR1 fits; DPR2 BLOCKED         |
| D02-O | 160×120      | 76800           | 320×240      | 307200          | Both calculated sizes fit       |
| D02-N | 160×120      | 76800           | 320×240      | 307200          | Both calculated sizes fit       |
| D03-O | 160×120      | 76800           | 320×240      | 307200          | Both calculated sizes fit       |
| D03-N | 160×120      | 76800           | 320×240      | 307200          | Both calculated sizes fit       |

The pass is serial and D01 is first: DPR2 at D01 blocks the whole pass, not permission to skip it. The adapter raw-file hard limit remains 1048576 bytes; the proposed parent-selected maximum is the stricter 640000. Any selected buffer above 640000 is outside this proposed authorization even if below the hard limit. Actual selected canvas dimensions and capture-source identity remain unmeasured. Eighteen raw-file slots, three selected indices, queue/event/file/session limits and all helper/decoder budgets remain unchanged. Optional D05-O remains disabled absent a real remaining odd-size question; its nominal 161×121 is 77924 bytes at DPR1 / 311696 at DPR2.

## Minimal parent action before any future measurement

1. Review the exact refreshed preflight, all pin dispositions and supplemental seventh promotion pin; supply parent checkpoint and accepted A/B/stage1 handoffs plus runtime/build/environment owner dispositions. These are existing gates, not a request for a new implementation audit. Keep the retained-bundle-only label unless separately reviewed mapping proof is supplied through an authorized path; the frozen adapter itself requires that label.
2. Parent discovers and supplies the actual current lane owner separately, then obtains that owner's explicit transfer to `cli-diagnostic` with evidence after QA releases its lane. Historical owner IDs and a completed worker are not authority. Proposed fields remain null/explicit=false/pending-owner-transfer.
3. Parent approves the exact whole-preflight hash, literal inherited environment and actual executable identities; approve backing/DPR capacity only if every selected buffer fits 640000. Do not set DPR or increase caps to make it fit. The candidate remains `authorized:false`, capacity.approved=false, with missing handoffs until parent action. The extra authorized field is documentary; the real frozen executionGate validates concrete transfer/handoff/capacity fields, not that extra field alone.
4. Only after those actual handoffs, parent creates a separate executable approval and explicitly schedules the one fixed observed/no-preload pass using the frozen adapter's current four-argument `run APPROVAL PREFLIGHT CURRENT_OWNER` interface. This document and candidate file do not authorize that call. No measurement or repair is part of this assignment.
