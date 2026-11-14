# Independent audit resolution matrix

Status: written plan dispositions, not independent re-approval or implementation evidence. Both plans retain their original scope/acceptance and add explicitly authoritative resolution contracts. Independent auditor must accept material revisions before code. No implementation, issue/GitHub writes, commit, push, workflow edit or deployment performed. Original independent audit documents are unchanged.

UF labels below map to the numbered/bulleted objections in `ui-foundations-audit.md` (which does not assign finding IDs). CO/CI IDs preserve `creative-output-audit.md` identifiers. “Accepted” means specified in revised plan, not tested at runtime. Phase acceptance remains mandatory even when work is split; research graduation is not authorized.

| Audit objection | Revised plan section | Disposition / required evidence |
| --- | --- | --- |
| UF1-1 | UF-R1 | Accepted: dismissal cancels before blur; same-picker blur/Enter commit; browser transaction matrix. |
| UF1-2 | UF-R1 | Accepted: own revision tagging; external replacement invalidates editor/drag and bounds. |
| UF1-3 | UF-R1/R2 | Accepted: destination/parent focus precedence, surviving removal target, no hidden restoration. |
| UF1-4 | UF-R1 | Accepted: handle-only touch-action, 8px activation, 44px targets, bounded scrolling, real touch. |
| UF1-5 | UF-R1 | Accepted: UI limits only; no false global import minimum claim. |
| UF2-owner | UF-R2 | Accepted: stable Layout controller; controlled panel; no fallback hook; explicit disposal. |
| UF2-state | UF-R2 | Accepted: one unmounted closed-mobile presentation; lift required local state only. |
| UF2-focus | UF-R2 | Accepted: opener-aware initial/return focus and both responsive directions. |
| UF2-portals | UF-R2 | Accepted: Dialog-local picker host, App-help stacking, global Escape removal. |
| UF3-default | UF-R3 | Accepted: Export initially open, all section defaults explicit. |
| UF3-hidden | UF-R3 | Accepted: hidden mounted bodies and child portal closure on every owner transition. |
| UF3-access | UF-R3 | Accepted: idempotent ref/layout reveal, cancellable pending focus, reduced scroll. |
| UF3-preview | UF-R2/R3 | Accepted: stable manager/canvas, dimensions and nonblank browser tests. |
| UF3-load | UF-R3 | Accepted: narrow keyboard-operable load button and import/cancel tests. |
| UF4-interface | UF-R2/R3 | Accepted: controlled props, adapted tests, generated description ID, real native key tests. |
| UF5-1 | UF-R4 | Accepted: PreviewCanvas global error duplication/destructive CTA removed; nondestructive dismissal. |
| UF5-2 | UF-R4 | Accepted: all model/text/image start/failure stale-message cleanup. |
| UF5-3 | UF-R4 | Accepted: producer table, counterpart cleanup, concurrency limitations and tests. |
| UF5-4 | UF-R4 | Accepted: app-status not global-region count, empty-region update and screen-reader gate. |
| UF5-5 | UF-R4 | Accepted: Ctrl+S shared save path, no swallowed failures. |
| UF-tests | UF phased acceptance | Accepted: transaction/lifetime/focus/status/help/history/geometry/download matrices retained. |
| UF-CI | UF phased acceptance | Accepted: full format/SDK/CLI/export/browser gates, server identity, generated diff and local-only restrictions. |
| CO1-A | CO-R1 | Accepted: unattached preparation, generation/disposal ownership, exactly-once preview commit. |
| CO1-B | CO-R1 | Accepted: 20-entry reference history; binary undo acceptance remains blocking. |
| CO1-C | CO-R1 | Accepted: reset/preserve table, complete defaults/allowlist, ASCII action ordering/invariant. |
| CO2-A | CO-R2 | Accepted: source/serialization/application/DPR/timing inventory; precise limitations; no inferred parity. |
| CO2-B | CO-R2 | Accepted: SDK/CLI setter/spacing limitations explicit until repaired/tested. |
| CO2-C | CO-R2 | Accepted: Code ZIP developer starter, never recommended faithful live output. |
| CO2-D | CO-R2 | Accepted: builder boundary checks, active source/assets, no-compatible-format outcome. |
| CO2-E | CO-R2 | Accepted: safe archive names/literals/public identifier validation and execution tests. |
| CO3-A | CO-R1 | Accepted: engine-level generations through every decode and finally/disposal. |
| CO3-B | CO-R3 | Accepted: scoped suspension tokens for app/CLI capture, nested/current policy preserved. |
| CO3-C | CO-R3 | Accepted: first intersection/zero-size/fallback/paused redraw; documented eager-reduced change. |
| CO3-D | CO-R3 | Accepted: identity-specific generated continuations/aborts/rAF cleanup/reconnect; Code disclaimer. |
| CO3-E | CO-R3 | Accepted: sampled show midpoint and explicit CSS sprite index; no JS visibility claim. |
| CO4-A | CO-R4 | Accepted: raw brightness, exactly-once inversion and equality contract; all shared-renderer regressions. |
| CO4-B | CO-R4 | Accepted: exact repertoire/nonstring/unknown behavior; distinct ASCII font identity and all import paths. |
| CO4-C | CO-R4 | Accepted: face/repertoire cache/load timeout/invalidation/disposal; failed deterministic export blocks. |
| CO4-D | CO-R4 | Accepted contract; font identity/measured budget approval remains gated before 4c packaging. |
| CO4-E | CO-R4 | Accepted: 4a ramp correctness separated from gated 4b/4c typography; full issue remains open until 4c. |
| CO5-A | CO-R5 | Accepted: scenario IDs/classes/caps/sample protocol and per-scenario paired aggregation frozen. |
| CO5-B | CO-R5 | Accepted: submission/completion/export timings separated; missing mobile incomplete. |
| CO5-C | CO-R5 | Accepted: nondivisible geometry/DPR/font/colors/transition allocation; cell4 stress label. |
| CO5-D | CO-R5 | Accepted: actual output exclusion, separately approved smoke CI, no timing CI or promotion. |
| CO6-A | CO-R6 | Accepted: raw sampled RGB/alpha and fixed fade sample contract, brightness prerequisite. |
| CO6-B | CO-R6 | Accepted: linear luminance/Sobel/orientation/transparency/hysteresis and separate costs. |
| CO6-C | CO-R6 | Accepted: scenarios/devices/per-scenario gate and independent reviewer evidence. |
| CO6-D | CO-R6 | Accepted: importer/builder gates and output exclusion; no production migration. |
| CI-A | CI-S | Accepted as separately approved mandatory release prerequisite; no workflow change now. |

## Required handoff and unresolved approvals

- UI controller decision is resolved: stable Layout-owned controller, single useExport, controlled ExportPanel. Blur/cancel/focus semantics are resolved in UF-R1/R2; test all event-order paths, do not improvise during implementation.
- One engine owner implements source transaction/history first; lifecycle/capture and starter owners consume it. Config/validation/generated packaging ownership is serialized across CO-2/4 and Layout integration across both plans.
- Font face/license/hash, approved appearance and measured font/combined transfer budget remain unresolved approval gates for CO-4b/c. CO-4a may proceed only after independent plan acceptance with limited claims; it does not close CO-4.
- Model redistribution evidence remains required or use an explicitly documented procedural substitute. No rights are inferred from an existing asset.
- Real target device metadata/availability and independent experiment reviewers must be recorded before measurements. Missing evidence prevents promotion; inconclusive research is a valid result.
- CI-S is a separate approval/change, mandatory before shared engine/lifecycle/font release. Branch protection, protected environment, external Vercel settings, release/rollback ownership and actual deployment authorization remain unverified. No external changes are authorized here.
- Independent acceptance of revised plans, implementation-model selection by parent/user, actual implementation review and all runtime/manual verification are still outstanding. This revision reports no passing app tests or performance data.

## Verification of this planning revision

Documentation-only scope: revised `ui-foundations.md`, revised `creative-output.md`, new this matrix. Original plan bodies retained except status clarification; authoritative addenda resolve ambiguities and preserve phased acceptance. Independent audits and issue identifiers were not changed. Local ignored-plan status means `git diff` alone is insufficient: filesystem artifact/change verification accompanies handoff.
