# IC1 revised plan: independent re-audit

## Verdict and reviewed identity

**ACCEPT — revised IC1 written plan, bounded to closure of M1–M3. No mandatory plan corrections remain.** This is preimplementation design acceptance, not acceptance of an adaptation, offline test results, native cancellation, Q1 completion or release readiness. Deliver this verdict separately before implementation; this review performs no implementation and transfers no browser lane.

- Reviewed plan: `docs/hardening/remaining-gates-plan.md`.
- Reviewed plan SHA-256: `72c217b5f6af224f91649bcabeae49f6e7aaef9027463fa3e03573b7142a8ed8` (computed from the actual file).
- Checkout: `gloin/release-hardening`, HEAD `6966686455fce3baa9bc749a272f372b27a52441`.
- Original objections: `docs/hardening/remaining-gates-plan-audit.md`; preserved unchanged. This verdict supersedes its CHANGES REQUESTED disposition only for the revised IC1 written plan and M1–M3.
- Method: read root governance, the web-product-development skill, both review documents and actual external harness source. No harness import, test, browser, server, dependency, build or remote action was performed. The named COLLAB bootstrap files and root Hermes configuration were absent. This document is not ignored.

Paths below use `H = /home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-hardening-qa/harness`. The proposed adaptation remains `A = /home/agent/.hermes/profiles/gloin/cache/scratch/image-cancel-contract-v1`, with executable harness root `P = A/harness`. No adaptation was created by this review.

## M1 — Resolved: executable relocation and canonical-execution prevention

The revision's finite allowlist and path mapping match the actual escape points:

- `H/playwright.smoke.config.mjs:1–2` imports its local config, but `H/config.mjs:15–27` selects canonical specs and `:64–67` embeds the canonical supervisor operand. The plan now requires explicit private config invocation, module-relative private smoke discovery, only `ui-smoke.spec.mjs`, exact image case selection, and a private supervisor operand. A relative-import-only copy is no longer accepted.
- `H/specs/ui-smoke.spec.mjs:1–36` imports the real route through `../lib/ui.mjs` and registers `Q1.image.D/N`. Its runtime, environment, artifact and contract imports are local. The route's dynamic `./env.mjs` import at `ui.mjs:278` is covered explicitly; the transitive contracts/UI imports remain within the private tree.
- `H/server-supervisor.mjs:92–107` dynamically imports local environment and derives its child from `new URL('./server.mjs', import.meta.url)`. Therefore relocating the supervisor and preserving the local tree relocates the real child without changing lifecycle logic. The supervisor and server have guarded main entry points (`:125–127` and `server.mjs:198–200`); source/config validation need not invoke either main.
- `H/lib/env.mjs:5–13,106–113` intentionally retains repository-installed Playwright/requireRepo and the pinned repository cube fixture. Separating the private executable root from canonical read-only REPO/QA avoids breaking those inputs. `server.mjs:162–176` confirms the explicitly retained Vite dependency and build target; the immutable build and served-byte checks are preserved.
- `H/run.mjs:29–32` would select canonical config. The revised plan explicitly forbids both original and copied `run.mjs` entry points, using the installed Playwright CLI with private config instead. Other copied drivers are excluded entry points, not implicitly authorized work.

Output protection is now explicit before config's `.keep` writes (`config.mjs:9–13`), not just runner outputDir isolation. The plan covers resolved-path/symlink containment, fresh attempts, helper overrides, reports, downloads, screenshots, diagnostics, temporary/cache paths and server identity/exit targets. Actual runtime paths (`runtime.mjs:65–91,218–229`) derive from `e.output`; `env.mjs:97–103` supplies the retained phase/lane/engine/attempt suffix. The plan requires guards and corresponding canonical-spec, canonical-supervisor, canonical-UI and historical-output negatives before execution.

These are adequate **implementation requirements**, not claims that guards or a relocated module graph already exist. Exact graph/hash inventory and the resolved-config counterexamples remain evidence required by the already specified independent implementation review; they are not a new plan-approval layer. The unchanged config's explicit timeouts, one worker, zero retries, no reuse and runner-owned `retain-on-failure` tracing remain mandatory.

## M2 — Resolved: mobile snapshot ordering

The revision matches the actual call sequence, not an invented helper API:

1. `save` calls `close`, awaits and retains the download, parses its actual file and writes settings (`ui.mjs:135–145`).
2. The image snapshot hashes the Preview canvas and queries invitation visibility before `open` (`:273–284`).
3. `open` is narrow-screen-aware (`:17–21`); the snapshot then verifies selected Image and reads controls (`:285–307`).
4. The new positive assertion uses the captured `beforeCancel.invitation` immediately after the before snapshot and before entering `choose`. Actual `choose` registers the chooser wait, focuses, presses Enter and selects files (`:38–45`), so the specified boundary is unambiguous.
5. The after snapshot, diagnostic and actual `assertImageCancel` remain in order (`:309–316`).

Both snapshots must preserve this sequence; no modal-open requery, hidden-inclusive replacement or changed save/open behavior is permitted. All eight equality fields and createdAt-only stability remain intact. `repair-contracts.mjs:310–320` still requires the positive post-invitation and whole-snapshot deep equality. The existing Chromium desktop artwork mismatch is not waived.

## M3 — Resolved: discriminating precheck/action-order regressions

The revised tests must call the actual adapted `route(qa, "image")` and actual oracle through controlled page/download seams, rather than a rewritten validator. Their acceptance conditions distinguish the missing and late assertion defects:

- False before invitation must reject at the pre-action assertion with no image chooser wait, focus/press/activation, empty selection or after snapshot. Counts are scoped to the image action, avoiding confusion with the later return-cube chooser.
- Separate removed-precheck and late-precheck mutants must fail specifically on forbidden action calls. Eventual deep-equality rejection, setup/import failure or an aggregate nonzero exit does not qualify.
- A complete passing controlled route establishes viable setup and reaches successor assertions; old-heading and wrong/model/missing-heading counterexamples retain exact-name discrimination.
- The narrow seam exposes the heading only with Settings closed, rejects modal-open preview reads and records both full snapshot sequences. The invitation-after-reopen mutant must fail the ordering regression.
- Preservation negatives begin with a true before invitation so the action actually runs, then exercise after=false and every retained mutation field through the actual oracle. Expected-error/order assertions remain outside the catch collecting the genuine oracle error.

This resolves the original false-before test's ability to pass solely through the final equality check. Offline fixture downloads remain labeled simulated evidence; they cannot establish native cancellation or genuine project acceptance.

## Preserved boundaries and outstanding execution gates

- No unaffected accepted scope was reopened: CLI14/canvas, accepted H1/current-node observer, notices and built exports remain outside IC1. Historical results and immutable harness/evidence remain unchanged.
- Quantitative floors remain `nonBgRatio >= 0.01`, `uniqueColors >= 5`, `entropy > 0.5`, with the existing 18-second preview poll (`artifacts.mjs:37–59`). No snapshot normalization, artwork exemption, budget change or fixture alteration is accepted.
- Return-cube meaningful preview, final no-alert and loaded screenshot (`ui.mjs:318–326`) remain required. An invitation repair alone does not clear them or any native row.
- **Q7 remains a semantic proposal only.** The prior main-label/nav-wrapper design disposition is not expanded into implementation approval. Missing-reference policy and the Q7.H supplemental exception remain separate unresolved matters; neither is cleared here.
- PR98 draft/review-required status is supplied context, not refreshed remote evidence. No PR change, approval substitution, merge or deployment is authorized.
- Next gates remain exactly those already in the plan: separately delivered plan acceptance and explicit bounded ownership transfer, adaptation/offline evidence, independent implementation review, then separate native-lane authorization. No native run is authorized by this re-audit.

## Source identity anchors

Freshly computed canonical hashes agree with the original audit's UI/config pins:

| Canonical file               | SHA-256                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| `H/config.mjs`               | `4984394b3adfa855db0016a3011caf9e96e787b5b0abe5da0bed11c908a4d562` |
| `H/lib/env.mjs`              | `7d70f7a039b0c170e4fb7bfedb399f3a444444ae975a9902544aec17fc34af72` |
| `H/lib/ui.mjs`               | `f0d00cf5ff74f3ac164eef1113fec0c2a24e9b7c60ac5c293fd31ec9b719b6c2` |
| `H/lib/repair-contracts.mjs` | `8e96d5ae0d861b8040e429c4288f6fc7a23920b07b30dba65d24cd8d06e62e14` |
| `H/specs/ui-smoke.spec.mjs`  | `cb9305f2880ade8d86b83ecba3625e5a402877db81bf72032d20a65c7f0cbeb3` |
| `H/server-supervisor.mjs`    | `cfb37e8c6bdd1f768384c87cf21ad625791468adb79feac99bc89d88ed5e81fd` |
| `H/server.mjs`               | `1905120d8b52f28f6a730108e82a554b3c4a7433dba59f648d47a0b2a6a99577` |

Only this re-audit document was created. No implementation or runtime result is claimed.
