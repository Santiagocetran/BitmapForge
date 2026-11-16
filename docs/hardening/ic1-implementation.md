# IC1 implementation: offline verification handoff

## Disposition

**Offline verification complete; independent implementation review pending.** This is not native cancellation acceptance, Q1 completion, browser-lane transfer or release authorization. The user explicitly reauthorized the unfinished offline command. No native authorization record was fabricated; no browser/server, install, build, canonical harness edit, production edit, commit, push or deployment was performed.

Accepted scope: `remaining-gates-plan.md`, IC1 including M1–M3, independently accepted by `remaining-gates-plan-reaudit.md`. Recovery inspected the surviving implementation and last-added temporary/cache environment regressions rather than replaying implementation. No candidate source/test changes were needed in this final continuation.

Roots:

- `A = /home/agent/.hermes/profiles/gloin/cache/scratch/image-cancel-contract-v1`
- `P = A/harness`
- `H = /home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa/harness`
- `F = A/tests/evidence/final-offline-61d99075-7284-47cc-8849-891cdf423388`

## Candidate and preservation

Before and after execution, both canonical H and preserved `A/original` matched all **67** path/size/SHA-256 entries in `A/tests/evidence/original-inventory.json`. Private harness path sets match that inventory; exactly the three permitted files differ. All other copied files, including repair-contracts, smoke spec, supervisor and server, remain byte-identical. The candidate harness was unchanged by verification.

| Candidate path relative to A    | SHA-256                                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| `harness/config.mjs`            | `5d2418eee345fe309c3ea7f077a3965eb19be3c0529cd1259ba233282e27ec92` |
| `harness/lib/env.mjs`           | `9140d4408323d127f9b4498aae30db4424e5b59ef0bb7e46d496f1f94548c3fc` |
| `harness/lib/ui.mjs`            | `f6984c15a0a60e88192357fbc3618403e252f323d47d9f10fd90813266cc8fdd` |
| `tests/ic1-relocation.test.mjs` | `f3151d4a2d28276bac109614eafef94f852581fc912d9d0ce045108309769ac5` |
| `tests/ic1-route.test.mjs`      | `c2cb12479568e0040ea36275c7cd2eec5299ba2f313c5b356ff2dabf9613103a` |

`F/candidate.diff` contains the complete original-to-private harness diff. `F/candidate-inventory.json` contains all harness pins and the two test-file pins (`testFiles`; its empty `tests` array is not an evidence inventory). `F/preservation-mapping.json` maps every original path/hash to canonical, preserved and candidate paths/hashes. `F/post-verification.json` records final preservation checks; `F/evidence-index.json` pins these records and identifies fresh suite evidence.

Exact functional UI delta: change only the image snapshot's exact heading to `Choose an image`, then positively assert captured `beforeCancel.invitation` before entering the unchanged chooser. Model invitation, mobile save/close/capture/reopen order, all eight snapshot fields, createdAt-only normalization, full oracle equality and successor route assertions remain unchanged. Configuration/environment deltas are private discovery, smoke-only exact selection, executable relocation, pinned input and output-containment guards; no lifecycle repair is included.

## Literal final execution

Working directory: A. PATH was prepended with `/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/.bin`; inherited environment otherwise retained by the outer command. Actual explicit Node version: **v24.22.3**.

```sh
/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node --experimental-vm-modules --test tests/ic1-relocation.test.mjs tests/ic1-route.test.mjs
```

`F/result.json` retains exact argv, runtime, stdout, stderr and exit status. Literal result: **exit 0; tests 28; suites 0; pass 28; fail 0; cancelled 0; skipped 0; todo 0**. VM Modules emitted its experimental-feature warning; stderr was empty. This includes the last-added missing TMPDIR/XDG_CACHE_HOME and external TMP/TEMP rejection checks.

Fresh detailed evidence:

- `A/tests/evidence/relocation-suite-q0Ttgt`: resolved config, module graph and Chromium/Firefox installed Playwright **list-only** results. Each enumerated exactly `Q1.image.D`, `Q1.image.N` in one file; no native tests executed.
- `A/tests/evidence/route-evidence-jzWu7e`: four retained mutant source copies and individual route call logs, assertion errors, diagnostics and explicitly simulated `.offline.bitmapforge` downloads.

Passing controls exercise the actual private route/save/snapshot/open/choose flow and unchanged real oracle, including controlled successors on desktop and narrow seams. Negatives cover model/wrong/missing/empty headings, each of the eight preservation fields, and early rejection without chooser actions. Removed and late precheck mutants fail the action-exclusion assertion specifically; the old-heading mutant rejects the correct-image control; invitation-after-reopen fails the modal-order assertion. These are captured discriminating offline counterexamples, not native project or rendering evidence.

Relocation checks reject canonical spec/supervisor operands before writes, canonical/original UI entry paths, historical/traversal/symlink/helper output escapes and existing attempts. Fixed budgets, fixture identity, private module graph and actual module-relative server child operand pass.

Prior evidence is retained unchanged: `A/tests/evidence/offline-run-01.json` (earlier failure), `offline-run-02.json` (earlier Node22 result), and `recovery/node24-attempt-01.json` (27 passing tests before the last environment regression was added), plus `recovery/pre-recovery-inventory.json` and both `recovery/before-*.test.mjs` files. The intervening approval-gated command did not execute; the current successful command is a new authorized attempt, not a relabeling of that denial.

## Executable boundary and finite independent review

Review only the five pinned candidate files above, the complete diff/mapping, accepted M1–M3 contracts, and fresh offline records. Verify:

1. UI delta is exactly the heading/pre-action assertion and preserves all equality and successor checks; route tests call through real source and reject mutants for intended reasons rather than setup failures.
2. Config resolves `P/specs/ui-smoke.spec.mjs` through private runtime/UI/oracle/env imports, selects exactly the two image registrations and retains explicit budgets, runner-owned traces, single worker and zero retries.
3. Config supervisor operand is `process.execPath` plus `P/server-supervisor.mjs`; its unchanged child is module-relative `P/server.mjs`. Neither main was invoked here. Check output guards before `.keep` writes, helper overrides and private temporary/cache requirements.
4. Review the recorded local graph alongside computed/absolute operands: regex graph discovery alone does not enumerate computed installed dependency imports. Explicit retained exceptions are REPO-installed `@playwright/test/index.mjs`/CLI/package metadata, `requireRepo` dependencies (`upng-js` in artifacts), Vite's `REPO/node_modules/vite/dist/node/index.js`, Node builtins and server `sha256sum -c ci-sha256sums.txt`. Server Vite/hash execution is future-only here. Cube fixture and pinned immutable dist remain read-only inputs; browser caches retain accepted identities.
5. All other copied entry points are excluded: neither canonical nor private `run.mjs`, provisioning/inventory/reducers, lifecycle drivers/tests, preflight or other lane configs may be executed under this handoff. Their retained absolute executable operands are not new permissions. The allowed offline subprocess is installed Playwright CLI with explicit private smoke config and `--list` only.

Request a delivered **ACCEPT or actionable rejection of IC1 implementation/offline oracle and relocation only**. This report is not independent self-acceptance and adds no approval layer beyond the accepted plan.

## Remaining gates

- Independent implementation review of these exact bytes and evidence.
- Separate explicit native browser-lane authorization, current resource ownership and fresh identity/output checks before exactly four selected rows: Q1.image.D/N in Chromium and Firefox against the unchanged pinned build. No native authority is conveyed here.
- Genuine cancellation, saved projects, full preservation equality, return-cube meaningful preview, final no-alert and loaded screenshot remain unverified. Retained Chromium desktop artwork-hash inequality may become the next blocker; stop/report it without weakening equality or changing animation.
- Historical 21-pass/12-fail engine matrices remain unchanged. Q7 semantics/reference/Q7.H failures, sparse-content policy, Firefox active-pointer pickup, WebKit prerequisites/manual AT/platform, lifecycle R04 and external release protections/provenance/rollback/approving review remain outside IC1.

This continuation creates only this repository handoff and new private offline evidence/output directories. Evidence is local scratch material, not automatically available to remote reviewers.
