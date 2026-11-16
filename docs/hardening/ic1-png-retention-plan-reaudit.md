# IC1 PNG-retention plan — independent M1/M2 re-audit

## Verdict

**ACCEPT — revised written plan, limited to mandatory M1/M2 corrections and preservation of the previously accepted contracts.** No remaining mandatory defect was found in those corrections. This is not implementation acceptance or native execution authorization.

Reviewed plan: `docs/hardening/ic1-png-retention-plan.md`.
Reviewed plan SHA-256: `a6ff548dcd006a3063e1096baaf5a3edbbd0c43979a628496c890d3dc38e2dff`.
Checkout: `gloin/release-hardening`, HEAD `6966686455fce3baa9bc749a272f372b27a52441`.

Roots share `/home/agent/.hermes/profiles/gloin/cache/scratch`: R is `bitmapforge-research`, B is `image-cancel-contract-reentry-v1`, and proposed C is `image-cancel-contract-png-v1`.

Read repository governance, the web-product-development skill, revised plan and original plan audit. Independently inspected the actual B re-entry and relocation consumers, current environment containment and historical guard source. HERMES.md, CODEX.md and COLLAB are absent. Review was static: no harness import, test execution, browser, server, build, installation or remote action. Historical evidence inventories were not exhaustively revalidated; that remains an implementation/execution preservation obligation.

## M1 — resolved

Plan lines 17–23 explicitly preserve two different operands:

- `B/preserved/harness/**` to `C/preserved/harness/**`, byte-for-byte, for the historical pre-re-entry guard regression.
- B's current harness and test sources under `C/preserved/reentry-baseline/{harness,tests}`, separately, excluding generated test evidence from source copying and leaving that evidence unchanged in B.

This matches the unchanged `B/tests/ic1-reentry.test.mjs:130–133`: the consumer copies `A/preserved/harness` and current fixtures into its fresh evidence-local old-source projection, applies its existing projection-only cache substitution, then requires exit 1 with `IC1 existing attempt destination` and exactly one config event. The historical `B/preserved/harness/lib/env.mjs:57` contains that unconditional existing-output guard. B's current environment is a distinct source operand, not a replacement historical fixture.

The revised plan explicitly rejects ENOENT/import/setup failures and worker success as substitutes for the named negative. It retains the current B UI separately for the new missing-retention counterexample. Only generated projections execute; preserved inputs remain read-only. No re-entry-test, config or environment edit is needed or authorized.

## M2 — resolved

Plan lines 34–36 and 70 now permit the unchanged offline consumers' actual writes without relaxing their containment:

- `ic1-reentry.test.mjs:11–15` selects `A/runs/t-<UUID>`; its `setup(root)` calls for old-source and mutant projections select the same direct-child layout beneath their unique evidence-local projection roots.
- `ic1-relocation.test.mjs:10–15` selects `A/runs/offline-<UUID>`. Its lines 61–67 run installed Playwright list-only discovery, not a native browser attempt.
- Current `harness/lib/env.mjs:230–234` requires QA_RUN to be a contained direct child of the adaptation's `runs` and contains helper/tmp/cache paths within it. The revised plan preserves these checks and permits the existing ownership, `.keep`, output, tmp and cache state rather than requiring guard-output redirection.

The evidence-local restriction still applies to new retention probes, sentinels and generated mutant projections; it no longer contradicts the separately enumerated unchanged suites' run roots. Offline/list-only roots remain consumed and cannot be reused natively. The permission applies only during the separately transferred implementation/offline assignment, not this review.

## Preserved scope and gates

- The executable allowlist remains exactly `C/harness/lib/ui.mjs` and `C/tests/ic1-route.test.mjs`. Other copied harness/tests, including re-entry and relocation consumers, remain byte-identical. Unexpected relocation incompatibility is a stop/report boundary.
- The accepted single-capture, same-Buffer raw retention and hashing, exclusive contained writes, failure propagation, unchanged eight-field equality/successors, and discriminating browserless verification contracts remain intact. No unaffected design scope is reopened.
- Implementation still requires explicit ownership transfer, fresh candidate/preservation inventories and offline evidence, followed by independent implementation ACCEPT.
- Native execution still requires its own explicit parent grant and fresh exclusive lane transfer after both reviews. Offline root permission grants no browser/server authority, no retries and no reuse of consumed roots. Existing budgets, native batch bounds and historical failures remain unchanged.

## Actual-source pins

Freshly computed SHA-256 values at review:

| B-relative source               | SHA-256                                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| `tests/ic1-reentry.test.mjs`    | `68818c8ac9cf7db6caab938d35aa2516097274f52d7e2d79156c0c311cdd096c` |
| `tests/ic1-relocation.test.mjs` | `d0f2cd2ad342353ddab1fba8e6e21a55c447c7de04e4105cdef7ea43c2a8c590` |
| `harness/lib/env.mjs`           | `dd36b61b9516b517c15aabf4389f7023afd1c261d4512a9c58bdab8e1ca3e596` |
| `preserved/harness/lib/env.mjs` | `9140d4408323d127f9b4498aae30db4424e5b59ef0bb7e46d496f1f94548c3fc` |

The re-entry consumer and current environment hashes match the original audit's pins. These source checks establish the plan's compatibility with actual consumers, not executed regression acceptance.

Created only `R/docs/hardening/ic1-png-retention-plan-reaudit.md`. No implementation, runtime, preserved evidence, plan or remote changes were made.
