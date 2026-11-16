# IC1 independent implementation audit

## Verdict

**ACCEPT — pinned IC1 implementation and offline oracle/order/relocation unit only. No mandatory implementation fixes remain.** Native four-row acceptance is outstanding. This verdict does not authorize browser/server execution, transfer the execution lane, clear Q1 or release gates, or authorize undrafting, merging or deploying PR98.

Reviewed branch `gloin/release-hardening`, HEAD `6966686455fce3baa9bc749a272f372b27a52441`. Read root governance, the web-product-development skill, accepted plan/re-audit and implementation handoff. Named COLLAB bootstrap records and root Hermes configuration were absent. The accepted plan still hashes to `72c217b5f6af224f91649bcabeae49f6e7aaef9027463fa3e03573b7142a8ed8`.

Roots under `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- `A = image-cancel-contract-v1`; `P = A/harness`.
- `H = bitmapforge-hardening-qa/harness`, canonical read-only harness.
- `F = A/tests/evidence/final-offline-61d99075-7284-47cc-8849-891cdf423388`, worker evidence reviewed and preserved.
- `V = A/tests/evidence/independent-audit-b065ae45-3679-46dc-9c39-8f9f641bdbed`, independent verification evidence.

## Candidate identity and preservation

Freshly computed SHA-256 pins agree with the implementation handoff:

| Path relative to A              | SHA-256                                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| `harness/config.mjs`            | `5d2418eee345fe309c3ea7f077a3965eb19be3c0529cd1259ba233282e27ec92` |
| `harness/lib/env.mjs`           | `9140d4408323d127f9b4498aae30db4424e5b59ef0bb7e46d496f1f94548c3fc` |
| `harness/lib/ui.mjs`            | `f6984c15a0a60e88192357fbc3618403e252f323d47d9f10fd90813266cc8fdd` |
| `tests/ic1-relocation.test.mjs` | `f3151d4a2d28276bac109614eafef94f852581fc912d9d0ce045108309769ac5` |
| `tests/ic1-route.test.mjs`      | `c2cb12479568e0040ea36275c7cd2eec5299ba2f313c5b356ff2dabf9613103a` |

Independently enumerated path/size/hash maps: H and `A/original` each match all **67** original-inventory entries, with identical complete path sets. P has that same path set; only `config.mjs`, `lib/env.mjs`, and `lib/ui.mjs` differ. All other modules, including the real oracle, smoke spec, runtime, artifacts, supervisor and server, are byte-identical. H, original, P and the complete F tree were checked before and after the independent test execution and remained unchanged. Every file pin in F's evidence index was verified. `V/verification.json` records the independent preservation result and candidate pins. No original evidence was overwritten.

## Findings against accepted M1–M3

### Exact invitation and pre-action guard — accepted

The actual `P/lib/ui.mjs:281–283` uses role `heading`, exact name `Choose an image`, and ordinary visibility. It neither substitutes the `Choose Image` button nor changes the model-mode `Start with a source` lookup. The only UI changes are that image locator and the assertion at line310.

The assertion consumes the completed before snapshot's captured boolean immediately before entering `choose`; it precedes chooser wait registration, focus, Enter and `setFiles([])`. There is no modal-open requery. Wrong/model/missing/empty heading cases reject at that assertion without an image chooser wait, focus, press, selection or after snapshot.

### Mobile ordering and full preservation — accepted

Actual call-through source and fresh narrow logs agree: close Settings → wait for/save/retain/parse project → settings diagnostic → canvas screenshot/hash → exact heading visibility → reopen Settings → verify selected Image and collect controls. Both snapshots retain this sequence. The modal-aware seam rejects heading/canvas reads while Settings is open; it is not an always-visible fake.

All eight fields remain: `sourceType`, `settings`, `artwork`, `invitation`, `fileCount`, `replaceCount`, `alertCount`, `emptyText`. `stable` still removes only `createdAt`. The unchanged `assertImageCancel` retains positive post-invitation, image source, zero files/Replace/alerts and whole-snapshot deep equality. The return-cube meaningful-preview, final no-alert and loaded-screenshot calls remain intact. Floors remain occupancy `>= 0.01`, colors `>= 5`, entropy `> 0.5`, and the preview poll remains 18000 ms.

### Discriminating regressions — accepted

The VM loader evaluates the actual private UI source, its real save/open/choose/snapshot flow and unchanged repair-contracts/artifacts modules. Only the offline page/download/environment assertion seam is controlled; downloaded projects are explicitly simulated `.offline.bitmapforge` files, not native evidence. Desktop and narrow positive controls reach the loaded screenshot and complete successors under that seam.

Fresh `route-evidence-VCfm8O` logs establish:

- Routes3–6 reject wrong/model/missing/empty invitations before image chooser actions.
- Routes7–14 start with a true invitation, select empty files once, write before/after diagnostics and reject each independent preservation mutation through the real oracle.
- Removed-precheck route15 and late-precheck route16 each perform the forbidden image selection. The named regressions assert that `early` fails specifically with `forbidden chooser actions occurred`, not merely that the route eventually rejects.
- Retained-old-heading route17 rejects the exact image positive before selection; invitation-after-reopen route18 fails specifically with `modal-order: heading read while Settings open`.

Imports/setup happen outside the route-error catch. Expected-error and action-order assertions also sit outside that catch, so a test assertion cannot masquerade as oracle rejection.

### Executable relocation and output isolation — accepted

The resolved copied config selects `P/specs`, only `ui-smoke.spec.mjs`, and exact full titles for `Q1.image.D/N`; independent installed-runner `--list` checks enumerate exactly those two registrations separately in Chromium and Firefox. The real selected spec imports the private route/oracle/runtime graph. The graph includes the dynamic UI environment import. Supervisor command is the quoted explicit Node executable plus private supervisor; unchanged supervisor derives its real child from module-relative `./server.mjs`.

Read the computed operands in addition to the regex module graph. Explicit outside-P executable dependencies are repository-installed Playwright, `requireRepo`'s `upng-js`, Vite's installed Node entry, Node builtins and server `sha256sum`; repository fixture and immutable dist are read-only inputs. No selected executable operand points to H or `A/original`. Canonical/private `run.mjs`, other lane configs, provisioning, inventory/reducer and lifecycle drivers remain excluded entry points; copying them is not permission to execute them. Regex graph discovery is not a universal JavaScript sandbox, but the actual pinned graph and computed operands satisfy this finite review.

Environment validation requires the pinned dist and retained engine cache, a direct private run root, safe attempt, explicit contained TMPDIR/XDG_CACHE_HOME, and contained helper/TMP/TEMP overrides. Config validates private spec/supervisor/graph and destinations before `.keep` writes; it refuses existing output attempts and populated run roots other than preparatory tmp/cache directories. Containment rejects relative/traversal and symlink escapes using real existing ancestors. Reports, runner results/traces, helper screenshots/downloads/diagnostics and server identity/exit paths derive from that private root. Shared write/append also enforce containment.

Fresh negatives reject canonical discovery and supervisor operands before writes, canonical/original UI entries, historical roots, traversal, symlinks, helper escapes, missing private temporary/cache settings, external TMP/TEMP and existing attempts. Config retains explicit test90000, expect5000, action10000, navigation15000, launch/readiness30000 and graceful-shutdown10000 ms; one worker, zero retries, no reuse, existing viewport/DPR/arguments and runner-owned `retain-on-failure` traces. Unchanged lifecycle modules retain their internal budgets.

## Independent execution

Working directory A; explicit Node `v24.22.3`, with sibling `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/.bin` prepended to PATH:

```sh
/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node --experimental-vm-modules --test tests/ic1-relocation.test.mjs tests/ic1-route.test.mjs
```

**Exit0: 28 tests, 28 pass, 0 fail/cancelled/skipped/todo.** A 120-second outer bound was used; no internal budget changed. Literal command/version/output/exit are retained in `V/result.json`. The VM experimental warning is expected and not a test failure. Fresh suite roots are `A/tests/evidence/relocation-suite-8rOixk` and `A/tests/evidence/route-evidence-VCfm8O`; the former includes resolved config, graph and both list-only records. These runs launch no browser/server and prove no native cancellation or rendering outcome.

## Exact next native prerequisites and acceptance boundary

No additional design/reseal/review gate is introduced by this ACCEPT. The remaining steps are the accepted plan's existing native prerequisites:

1. Obtain separate explicit native browser-lane authorization and current exclusive resource ownership. Do not use or stop old servers. Deliver this implementation verdict before execution.
2. Recheck these candidate pins, the complete pinned immutable build identity, fixture and existing Node24/Playwright1.59.1/browser-cache identities. Use unchanged `h1-integrated-20261115T180652Z/immutable-candidate/dist`, not a rebuild or development server. Do not install dependencies.
3. Allocate fresh, separate `A/runs/ATTEMPT` roots for the serial engine invocations, an available owned port, explicit phase/lane/engine/attempt/dist/cache variables and contained private temporary/cache paths. Clear or correctly contain inherited helper output overrides and TMP/TEMP. Preserve the existing phase/lane/engine/attempt output suffix. Validate the actual private config and supervisor/child operands before native spawn; a config evaluation creates `.keep` files, so a consumed offline/list-only destination must not be reused for native execution.
4. Invoke the installed Playwright CLI directly with `P/playwright.smoke.config.mjs`, never either `run.mjs`. Select only Chromium `Q1.image.D`, Chromium `Q1.image.N`, Firefox `Q1.image.D`, Firefox `Q1.image.N`, retaining one worker, zero retries, all original budgets, runner-owned contexts/traces and unchanged DPR/viewports. Verify served-byte/build identity and strict owned-process cleanup.
5. Report each row's actual first failure and later unreached assertions, pre/post invitation and all snapshot fields, genuine retained projects and screenshots/traces under the existing retention policy. A passing row must execute full equality, return-cube meaningful preview, final no-alert and loaded screenshot. Success need not produce a trace ZIP under `retain-on-failure`.

The retained Chromium desktop artwork-hash inequality is a possible successor failure, not an exemption: stop/report it without weakening equality, changing animation or claiming replacement from hash drift alone. Native four-row results must remain separate from the historical 21-pass/12-fail engine matrices. Accepted CLI/H1/export work is not reopened. Q7, sparse-content gates, Firefox active-pointer, WebKit/manual AT/platform, lifecycle R04 and external release/approval requirements remain outside this unit.

Only this audit document and fresh private offline evidence/output directories were created by this review. No candidate, canonical source, historical evidence, dependencies, servers, remote records or commits were changed. Evidence is local scratch material, not automatically available to remote reviewers.
