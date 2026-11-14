# Mandatory plan-audit resolutions

Version 1.1 · **Submitted for independent reapproval; not ACCEPT and not permission to code.**

Authority: unchanged baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`, `gloin/editor-redesign`, parent DESIGN-BRIEF and [independent audit](plan-audit.md). Only the four original planning documents and this disposition file are revised. The reviewer’s audit is untouched. Architecture, all original controls/contracts, four disjoint owners and P1 independent foundation gate remain unchanged.

## 1. R1 — Short empty stage, Help and visible rectangle

**Disposition: design contract repaired; independent reapproval and implementation evidence outstanding.**

- [Specification §1](specification.md) requires a contained empty-stage scroller retaining four routes/demo and ≥44px targets, not canvas resizing or content removal.
- [State contracts §3, R1](state-contracts.md) pins H/T from visualViewport height **and offsetTop**, event cleanup, `[T,T+H]` coordinates, explicit top/height/bottom:auto (no competing inset/dvh/vertical-transform constraints), sheet/full-height rules, safe areas and fallback. Empty content scrolls independently of the stable preview. Mandatory A-owned Help has a viewport-bounded box, pinned title/Close and scrolling shortcuts; below240px whole-content scroll keeps every action reachable.
- A’s [implementation allowlist](implementation-plan.md) now makes ShortcutsModal geometry/scroll styling mandatory. New A-owned UI-foundations cases require 667×320, 320×568, reduced rectangles including H280/T40 and H220/T40, first/last actions/focus bounds, horizontal overflow, identity and short empty/Help captures. Real keyboard/device certification remains unavailable unless actually exercised.

## 2. R2 — Task-scroll reset and reveal order

**Disposition: reset-to-start chosen; independent reapproval and execution outstanding.**

- [State contracts §3, R2 and §4](state-contracts.md) chooses one Layout-owned scroller with no per-task offset registry. Explicit task activation (including current task), mobile reopen, desktop expand and either breakpoint crossing start at0. Close/collapse discard offset, not durable task/disclosure/draft state. Help and same-breakpoint height/offset change do not reset.
- Cancellation/generation retirement precedes visibility commit. Reset runs first after commit; explicit source/Export or required resize-owner focus/reveal wins and consumes its one-shot request. No timers/smooth scrolling/later restoration can undo it. Pointer/Enter/Space task selection retains native task-button focus; ordinary Tab visits remaining task buttons before fields.
- A’s source UI-foundations evidence must cover deeply scrolled Look/Motion/Export, all activation routes, heading/first and last controls, reopen/collapse/both boundaries, same-breakpoint focus, no history writes and source/Export reveal stability after commit/two frames. Existing focus/cancel protections are not waived.

## 3. R3 — Finite nine-format artifact coverage

**Disposition: finite assignment repaired; new cases explicitly not yet implemented or run.**

- [Implementation plan §6.1](implementation-plan.md) enumerates exactly `apng`, `gif`, `webm`, `spritesheet`, `css`, `react`, `webcomponent`, `embed`, `zip`: UI selection/action, real download/container, exact retained/new case, assertion, source/built target and sole evidence owner A.
- Retain the complete existing visual suite and ASCII fresh React/Web Component comparisons. Add only four bounded A-owned `redesign-artifacts.spec.js` cases: downloaded GIF decoded animation, React actual UI archive dispatch/config, Web Component actual UI archive dispatch/config, Embed downloaded supported-model runtime plus image-disabled reason/no download. Existing builder/unit coverage is honestly distinguished from UI dispatch and unchanged downloaded-runtime evidence. No nine duplicated heavy suites or builder/engine changes.
- Exact CLI invocations and proposed isolated source/built evidence-config contracts are pinned in §6.1, with absolute scratch paths, unique server/cache/output, no reuse, required `--list`, target hashes and per-command/per-format exits/artifact paths. Parent authorization is needed for external evidence-config creation; no tracked config change is authorized here.
- The inspected existing export config says180,000ms (download wait120,000ms), unlike the parent’s required final90-second gate. This discrepancy is explicit, not hidden or accepted as90-second success. The final built gate is90,000ms; a failure remains a blocker. Full181 CSS stops/full-loop temporal assertions, original384×320 fixture, original numeric content thresholds and all existing root/workspace/CLI/build/identity/behavior gates remain required. No timeout/retry increase or quality waiver.

## Return gate

Revised documents are ready for independent **plan** reapproval, not self-approved. Reviewer should check R1–R3 against the untouched audit and baseline source before any app/config/test edits. P1 foundation review, per-widget independent implementation review and final combined-tree source/built/runtime/visual checks still follow approval. This delivery verifies documentation format/scope only; no redesigned runtime, test success, remote publication or deployment is claimed.
