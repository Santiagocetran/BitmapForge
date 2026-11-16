# Remaining-gates plan: independent audit

## Verdict and scope

**CHANGES REQUESTED — IC1 written plan only.** The image-oracle diagnosis and bounded repair direction are sound. Resolve M1–M3 below in the plan before implementation acceptance. These are executable-plan gaps, not permission to repair production, relax equality or rerun accepted work.

Reviewed HEAD: `6966686455fce3baa9bc749a272f372b27a52441`, branch `gloin/release-hardening`. Reviewed plan SHA-256: `78aa61870dbef6fa3317489867f9cdae476690792efe2a7b865675233e5cc9b7`. Independent source/retained-evidence inspection only; no browser, test execution, dependency change, commit, remote write or server manipulation. Root governance and relevant product/editor skills were read. `COLLAB/` is absent. Audit destination is not ignored. Only this audit is authored here.

Evidence root below is `/home/agent/.hermes/profiles/gloin/cache/scratch`; `H` means `bitmapforge-hardening-qa/harness`; `R` means `bitmapforge-hardening-qa/runs/h1-integrated-20261115T180652Z/final/smoke`.

## Confirmed findings

- `PreviewCanvas.jsx:233–236` renders the image-mode **heading** `Choose an image`; `ImageInput.jsx:74–75` renders the different **button** `Choose Image`. The model invitation remains `Start with a source`. `H/lib/ui.mjs:282` uses the wrong exact heading in the image snapshot; its initial model lookup at line71 is correct and must remain unchanged.
- Independently parsed all four `R/ENGINE/a01/diagnostics/Q1.image.V-image-cancel.json` records. Invitation is false before and after in each. Only Chromium desktop changes a snapshot field: `artwork`. All other compared fields match. This establishes a pre-existing oracle mismatch, not native cancellation correctness or artwork replacement.
- Each corresponding trace ZIP contains `Choose an image` in its `0-trace.trace` and retained resource data. An initial suffix-only `.snapshot` search was empty; inspection of the actual archive entries recovered the evidence. No runtime was launched.
- `assertImageCancel` at `H/lib/repair-contracts.mjs:310–320` checks post-source, zero files/Replace, positive invitation, zero alerts and complete deep equality. Preserve all eight fields: `sourceType`, `settings`, `artwork`, `invitation`, `fileCount`, `replaceCount`, `alertCount`, `emptyText`. The existing `stable` transformation removes `createdAt`; no additional normalization is authorized.
- The return-cube preview, final no-alert assertion and loaded screenshot at `ui.mjs:318–326` are later assertions, not acceptance supplied by the retained failing image rows.

## Mandatory plan corrections

### M1 — Make private executable relocation explicit

Preserving relative imports is insufficient. `H/config.mjs:15` selects `QA + "/harness/specs"`; line67 launches `QA + "/harness/server-supervisor.mjs"`. `H/lib/env.mjs:7–8` hard-codes the canonical QA root. A copied config can therefore select the original spec/helper and original supervisor even when its local `ui.mjs` is corrected.

Amend IC1 with a finite relocation allowlist and path mapping: private spec discovery, private config/module graph and private supervisor entry must resolve inside the new adaptation; retained fixtures and installed dependencies may remain read-only canonical inputs, explicitly identified as such. Inventory other absolute executable paths before review. Specify fresh writable QA_RUN/report/download/diagnostic roots and fail closed if any output points into historical evidence. Do not blindly repoint QA if that also changes fixture lookup. Require offline resolved-config/import-path checks establishing that selected cases consume the adapted real `ui.mjs`, not canonical code. Preserve original file hashes and a complete relocation-plus-oracle diff. No changes to canonical files or dependency installation.

### M2 — Freeze narrow-screen snapshot ordering, not just the name

The review request names ordering, but the implementation steps never specify it. Actual `snapshot` calls `save`; `save` first closes Settings (`ui.mjs:135–145`). It then captures artwork and invitation while the preview is exposed, reopens Settings, and reads source controls. On narrow screens the preview is behind the Settings modal after reopening.

State this exact order for both snapshots: close/save and retain genuine project → canvas capture → exact image heading visibility → reopen Settings → selected-source/files/Replace/alerts/drop-area capture. Require positive `beforeCancel.invitation` immediately after the completed before snapshot and **before** chooser activation; use that captured value, not a new visible-heading query after reopening the modal. Then unchanged Choose Image/empty-file action → same after snapshot → diagnostics → unchanged postcondition/deep equality. Do not move the preview query into the modal-open phase or bypass modal isolation with a hidden-inclusive substitute.

### M3 — Prove pre-action rejection and ordering with discriminating regressions

The listed `before=false` negative can pass solely because the existing final deep equality rejects false→true, even if the new pre-action assertion is absent or late. Require an offline call-through regression of the actual adapted route/helper with recorded action order: a false before invitation must reject **without invoking chooser activation or empty selection**. A correct visible image heading must proceed through that action. Include a missing/late-precheck mutant that the regression rejects, in addition to the retained-old-lookup counterexample already requested.

Make the modal-aware ordering test explicit: a narrow fake/controlled seam must expose the preview invitation only while Settings is closed and verify the real save/snapshot/open sequence. This is offline instrumentation, not native-browser acceptance. Keep the exact-name wrong/model/missing-heading negatives and every listed snapshot mutation negative; test failures must come from the intended assertions rather than failed imports or unrelated setup. No copied stand-alone validator may substitute for the real helper path.

## Contracts already adequate; preserve on revision

- Positive exact image invitation before action and after action; no production copy change, model-oracle change, trimmed snapshot or artwork exemption.
- Historical Chromium desktop artwork mismatch remains a possible successor blocker. Report its actual phase if reached; stop adaptation repair rather than freeze animation or weaken equality.
- Separate external adaptation, immutable historical failures and independent implementation review before separately authorized native execution. No new approval layers for ordinary generated artifacts are requested.
- Preserve original config budgets: test 90000 ms, expectation 5000 ms, action 10000 ms, navigation 15000 ms, launch/server readiness 30000 ms, server graceful shutdown 10000 ms; one worker, zero retries, no existing-server reuse. Preserve polling budgets, DPR/viewport and retention policy, including `retain-on-failure` tracing. The plan already requires unchanged budgets; relocation must not reset them to defaults.
- Preserve quantitative artifact floors and full successor route assertions. Separate adaptation outcomes from the frozen matrix. Exactly the two image cases in Chromium/Firefox are the proposed later native scope, not authority to execute now.
- Accepted CLI14, canvas ownership, palette H1/current-node observer, notices and built exports remain closed to this unit. No reassessment of accepted outputs is required by this verdict. Firefox pickup, WebKit/manual coverage, R04 and external release/approval gates remain separate. PR98 draft/approval state and CI outcome are supplied context, not independently refreshed remote facts.

## Separate Q7 semantic disposition

**Design direction supported, not implementation approval and not Q7 clearance.** Naming the existing main `Editor workspace` is appropriate. A named navigation wrapper around the retained `Editor tasks` group is defensible as navigation among the editor's major task sections, rather than a cosmetic role invented for a checker. Buttons can remain task selectors; do not add tabs, links or new keyboard semantics merely to obtain a landmark.

A later bounded Q7 implementation plan must specify wrapper placement around the existing `navigation` fragment, at its existing desktop and narrow-dialog mount sites (`Layout.jsx:440–443,559–560`), without duplicating landmarks or moving task/controller ownership. Preserve `.bf-task-nav`, pressed/control relationships, barrier-before-switch ordering, responsive lifetime and modal exposure. Review geometry and focus consequences of the extra box; a new wrapper must not escape the Settings/Help isolation boundary. Hidden-inclusive inventory success alone is not proof of appropriate currently exposed landmarks. This disposition requests no redesign of accepted palette behavior.

Independent retained evidence confirms all seven Q7 states in each engine report the same two semantic policy failures. Their DOM records additionally report four missing references per state except I, which reports three. The source checks references irrespective of closed/hidden state (`H/lib/axe.mjs:108–125,194`); naming will not repair those results. Keep the policy failed pending a separately reviewed closed-popover/reference disposition, not an automatic force-mount or exemption.

Both `Q7.H-scanner-stage.json` records retain a supplemental expected-true/received-false exception. The scanner summary does not identify the inner assertion. Recover its retained trace phase in the later Q7 investigation; this audit does not invent attribution. All fourteen retained Q7 axe JSON files contain zero violations, independently counted. That is distinct from supplemental failure, scanner incompletes and real AT/announcement verification.

## Evidence identities and completion

- Canonical `H/lib/ui.mjs` SHA-256: `f0d00cf5ff74f3ac164eef1113fec0c2a24e9b7c60ac5c293fd31ec9b719b6c2`.
- Canonical `H/config.mjs` SHA-256: `4984394b3adfa855db0016a3011caf9e96e787b5b0abe5da0bed11c908a4d562`.

Deliverable: this independent audit. M1–M3 require plan revision and a bounded re-review; no implementation or native run is accepted by this document. Retained evidence remains local-only unless separately bundled under authorization.
