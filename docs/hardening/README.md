# Release hardening and launch readiness

Base: deployed main550842cab61002c7cc6563e50b9fcdeb17c9bf01. Isolated working branch: gloin/release-hardening. User authorized this milestone; PR publication, merging, production deployment and external protection/hosting changes still require explicit approval.

## Intended outcome

A reconciled backlog and a bounded set of verified hardening changes, not another redesign or speculative framework migration. Prioritize actual exposure, demonstrated product defects and release assurance. Curated starters and broader export/ASCII features remain follow-on work, not silently included in this milestone.

## Investigation ownership

- dependency-triage.md: refresh issue94 advisory paths, real exposure and minimal compatible update batches.
- release-audit.md: issue93 acceptance, current external protections, rollback/readback and tested-artifact publication options/tradeoffs.
- backlog-and-qa-audit.md: map foundations/launch acceptance to shipped code/tests; distinguish closure candidates from manual or unfinished requirements.
- parent-baseline.md: current shipped build and browser/tool availability observations.

## Gates

1. Collect evidence against the exact shipped baseline; do not duplicate merged PR95/96/97 work.
2. Parent composes issue-specific plans from findings. Obtain an explicit independently delivered ACCEPT before editing production/test/workflow implementations. Research reports are not automatic implementation approval.
3. Resolve any architectural/provider-access decision with the user before changing release strategy or settings. Keep verification-job dependencies, required review, secret scoping and deployment safeguards intact.
4. Implement accepted bounded slices with disjoint ownership; review each separately.
5. Run full relevant root/workspace/decode/CLI/build/browser gates after fixes. Label Chromium/Firefox/WebKit engine automation separately from physical Safari/mobile and assistive-technology testing. A viewport resize is not real browser-menu zoom.
6. Reconcile issue status only after every applicable acceptance criterion is checked. Do not close parent trackers on partial child delivery. Read back any external issue update.
7. Deliver reviewed commits, meaningful test and visual evidence, remaining limits and a focused next backlog. Ask before publishing PRs, merging or deploying.
