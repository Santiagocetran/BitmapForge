# IC1 PNG-retention plan — independent audit

## Verdict

**CHANGES REQUESTED — two bounded mandatory plan fixes.** The exact-buffer retention design is sound; the proposed copy/output instructions do not yet accommodate the unchanged browserless suites. Neither finding requires a new executable helper, broader source allowlist, guard redesign, or diagnostic architecture. Resolve M1–M2 in the plan before implementation transfer. Native authorization remains separate.

Reviewed plan SHA-256: `c45d7bd92558b1236d8ff60821e518121b74ac7579c50b2d3c497476d8ff24a5`.
Checkout: `gloin/release-hardening`, HEAD `6966686455fce3baa9bc749a272f372b27a52441`.

Roots share `/home/agent/.hermes/profiles/gloin/cache/scratch`: `R = bitmapforge-research`, `B = image-cancel-contract-reentry-v1`, proposed `C = image-cancel-contract-png-v1`. C is absent at inspection.

Read AGENTS.md, web-product-development, the PNG plan and artwork-failure analysis, accepted IC1 M1–M3 re-audit, IC1 implementation/audit, and re-entry plan/implementation audits. Inspected actual B snapshot, hash/output guards, config, oracle, route and relocation/re-entry test sources and fixture config. HERMES.md and named COLLAB bootstrap files are absent. This is static source review: no harness import, behavioral test, runner, browser, server, dependency, build, remote or release action. Historical evidence seals were not exhaustively revalidated in this plan review.

## Mandatory fixes

### M1 — Preserve the unchanged re-entry suite's historical source operand

Plan lines17–30 require retaining B baseline bytes under `C/preserved/`, copying harness/test sources, and keeping the re-entry suite byte-identical. They do not specify the historical fixture layout that suite actually consumes.

`B/tests/ic1-reentry.test.mjs:130–133` copies `A + '/preserved/harness'` into its fresh old-source projection, where A is the relocated candidate root. It expects that harness to contain the **pre-re-entry guard**, which fails worker initialization with `IC1 existing attempt destination`. In B, `preserved/harness` is the earlier `image-cancel-contract-v1` source, not B's current accepted harness. Missing that tree yields a setup failure; putting the new B baseline at `C/preserved/harness` makes the old-source negative use the repaired guard and invalidates its expected rejection. Neither is an acceptable regression result.

**Required plan correction:** explicitly copy `B/preserved/harness` byte-for-byte to `C/preserved/harness` as the unchanged suite's historical read-only input. Preserve B's current harness/test baseline under a different named subtree, for example `C/preserved/reentry-baseline/{harness,tests}`, with the existing complete mapping/hash requirements. Keep old guard evidence distinct from the retained B UI used for the new missing-retention counterexample. No edit to the re-entry test or env/config is needed. Preserve the existing policy that only fresh generated projections are executed; original/preserved sources are not writable attempts.

Acceptance evidence is the already required unchanged browserless suite: its retained-old worker-init negative must fail at the named existing-attempt guard, not ENOENT, import/setup failure, or an unexpected successful worker. This is a copy-layout correction, not reopening guard acceptance.

### M2 — Authorize the existing offline suites' fresh run roots explicitly

Plan line28 permits `C/runs/<run>/**` only “later separately authorized”; line48 nevertheless requires the unchanged browserless re-entry tests. Actual `ic1-reentry.test.mjs:11–15` creates `C/runs/t-<UUID>` roots, and `ic1-relocation.test.mjs:10–15` uses `C/runs/offline-<UUID>`. Config writes ownership and `.keep` state there. The existing environment intentionally requires QA_RUN to be a direct child of the adaptation's `runs` (`env.mjs:230–231`). These mandatory tests cannot be confined entirely to `C/tests/evidence/**` without changing accepted code.

**Required plan correction:** permit those fresh, exclusively owned offline test roots under C/runs during the bounded implementation/offline assignment, while continuing to reserve native engine roots for the separate native grant. Keep route-retention probes, sentinels and generated mutant projections inside their unique test evidence roots; clarify that line55's no-escape requirement applies to those probes, not to the unchanged guard suites' separately enumerated run roots. Preserve consumed offline/list-only attempts and prohibit their native reuse. Do not relocate guard outputs by bypassing the accepted environment checks or widen the executable allowlist.

## Retention contract — accepted design, no additional mandatory changes

- **Single capture and unchanged hash:** actual `ui.mjs:273–308` saves first, captures the Preview canvas once, hashes the returned PNG, reads the invitation before reopening Settings, then collects controls. Plan lines34–40 insert raw persistence at the correct point, retaining the same Buffer object for `env.sha` (`env.mjs:175`). No screenshot path option, second capture, re-encoding or decoded-pixel substitute is authorized.
- **Byte fidelity:** `env.write` really serializes non-string values as JSON (`:177–183`); rejecting it for PNG payloads is necessary. Raw Node fs writes and the five-field sidecar are sufficient. Sidecar creation follows successful PNG persistence and hashing; it does not become an equality field. The existing eight-field diagnostic and full `assertImageCancel` deep equality (`repair-contracts.mjs:310–320`) stay unchanged, including artwork rejection when decoded pixels happen to match.
- **Contained exclusive writes:** the finite IDs/labels prevent arbitrary path operands. Existing `contained` checks absolute/traversal/strict descendant paths and the real nearest existing ancestor (`env.mjs:9–23`). Checking before directory creation and again before each write, plus exclusive `wx` for both files, fits the accepted trusted-private single-owner model. Existing config/run-root checks must still run; containment relative to `qa.e.output` alone is not new authority for a foreign root. `diagnostics` is outside runner-cleaned results/report folders. No hostile concurrent-filesystem or power-loss-durability claim is required.
- **Failure semantics:** raw-write failure stops before hash; sidecar failure stops before successful snapshot return. Preserve original code/cause and contextual row/label/path, partial files and earlier evidence. No retry, fallback, recapture, deletion or attempt repair. Later equality failure leaves retained pairs intact. Existing runner teardown remains responsible for owned-process cleanup, not evidence repair.
- **Successor and timing preservation:** the pre-action invitation assertion, chooser, createdAt-only normalization, return-cube preview, final no-alert and loaded screenshot remain mandatory. Added synchronous filesystem/sidecar work can perturb timing; the plan correctly makes no zero-perturbation or causal-proof claim. No waits, animation changes, timeout/storage increases or renderer instrumentation belong here.

## Relocation, allowlist and tests

Apart from M1's historical fixture input, actual relocation is compatible: env derives PRIVATE/ADAPTATION from module location, config uses PRIVATE specs/supervisor, and the supervisor child remains module-relative. Read-only repository dependencies, pinned build/fixture and sibling browser caches remain intentional. Stop/report any other incompatibility rather than modifying env/config.

The two-file executable allowlist is sufficient: snapshot-local changes in `harness/lib/ui.mjs`, and extensions to `tests/ic1-route.test.mjs`. The latter already evaluates the real route and oracle through a VM, has an environment-export seam for call-through hash observation, and controls the existing page/download seams. No standalone retention module or new framework is warranted.

The proposed verification discriminates the material risks: capture counts; completion-before-hash ordering; Buffer object identity and actual persisted bytes; independently recomputed sidecars and snapshot digests; desktop/narrow ordering and successors; distinct valid PNGs plus equal-decoded-pixel/different-encoding negatives; named old-source and selective mutant failures; separate raw/sidecar failure phases; real collisions and symlink/traversal/foreign-root refusals with untouched sentinels. Expected-error assertions must remain outside the route-error catch. These are requirements for future evidence, not tests executed by this audit. Keep the existing eight-field and pre-action counterexamples alongside them.

## Source anchors and remaining gates

Freshly computed source hashes:

| B-relative source            | SHA-256                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| `harness/lib/ui.mjs`         | `f6984c15a0a60e88192357fbc3618403e252f323d47d9f10fd90813266cc8fdd` |
| `harness/lib/env.mjs`        | `dd36b61b9516b517c15aabf4389f7023afd1c261d4512a9c58bdab8e1ca3e596` |
| `tests/ic1-reentry.test.mjs` | `68818c8ac9cf7db6caab938d35aa2516097274f52d7e2d79156c0c311cdd096c` |

After M1–M2, re-review only those corrections and preserved contracts. Implementation still needs explicit ownership transfer, fresh evidence and independent implementation acceptance. Any native batch still needs its own explicit grant and exclusive lane transfer. The historical three-pass/one-fail result remains unchanged; context restoration is a confounder, not proven cause, and fresh retention cannot retroactively recover discarded PNGs or clear the old inequality. No release readiness is conveyed.

Created only `R/docs/hardening/ic1-png-retention-plan-audit.md`; the reviewed plan and accepted harness/evidence remain unchanged.
