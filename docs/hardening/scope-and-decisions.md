# Hardening execution boundaries and decisions

## Evidence and objective

Deployed base and current remote main at preflight: `550842cab61002c7cc6563e50b9fcdeb17c9bf01`. Working branch: `gloin/release-hardening`. Read-only GitHub preflight found no open PRs; previously merged #95/#96/#97 must not be repeated. Research reports are complete; [baseline verification](baseline-verification.md) records fresh local checks, not patched-candidate acceptance.

The user approved release hardening. The implementation scope is justified dependency remediation, available-engine/accessibility verification, and truthful local backlog/release records. This is not authorization for another redesign, framework migration, analytics, launch publication, or follow-on starters/ASCII features.

## Work packages and ownership

1. **Tooling A then B:** `tooling-plan.md` defines the package/path allowlist, runner/coverage alignment, supported-line build/lint transitives and generated-code Vite floor. One implementation owner controls shared manifests and lockfile; do not install concurrently with C or with verification using the same node_modules.
2. **CLI C:** `cli-plan.md` follows A/B after an accepted checkpoint. Puppeteer/browser migration is separately gated, with explicit public engine compatibility and genuine fresh-install/APNG/WebM/cleanup evidence. It may be rejected/deferred if compatibility or installer gates fail; do not weaken assertions to make a chosen version ship.
3. **QA:** `qa-plan.md` specifies bounded built-target cross-browser and accessibility evidence, isolated tools/caches, screenshots and manual limits. QA harness work must receive independent plan acceptance before implementation. No application UI fix is silently authorized by discovering a scanner finding: confirm the defect and accept a bounded repair plan first.
4. **Release safeguards:** research and proposed owner actions only. Keep the existing working deployment pipeline unchanged in this local milestone unless the user separately accepts an architecture/settings decision. No provider credentials are to be recovered or printed.
5. **Backlog:** prepare local proposed issue text mapped to acceptance and fresh results. External issue edits/closure need approval and exact-target readback. Distinguish superseded presentation requirements from literal completed acceptance, and preserve named manual/external gates.

## Mandatory sequence

- Inspect source and primary evidence; author bounded plans.
- Obtain separately delivered independent **ACCEPT** for each plan. A researcher or plan author cannot accept their own plan. Do not combine plan audit with immediate implementation.
- Implement only accepted scope, in serial lockfile ownership. Preserve existing Node 24 policy, stack, runtime/export semantics, security pin and review protections.
- Independently audit each actual implementation diff and execution evidence; resolve material findings and review repairs.
- Run final whole-tree relevant gates after all fixes, including suites excluded by root test discovery. Preserve built-browser 90-second budget, zero retries, meaningful-content assertions and trace policy.
- Commit verified local delivery and ask before PR publication, merge or deployment. Local independent audits do not satisfy an approving GitHub review.

## Release architecture decision reserved for the owner

[Release audit](release-audit.md) recommends mechanically packaging the browser-tested static build as Vercel Build Output API v3, **conditional** on authenticated confirmation that actual project settings require no managed functions or production-only build inputs. Its advantages are exact tested JS/CSS and retaining credentials at the final release boundary. Costs include owning explicit routing/headers/MIME/404 behavior and immutable candidate verification.

This is a proposal, not an implementation decision. A managed provider build followed by output tests is the alternative if static-only prerequisites fail. Retaining source rebuild requires explicit acceptance of weaker provenance; it is not an automatic fallback. No provider settings, secret scoping, branch/environment rules, candidates, promotions or rollback drills are changed by these documents.

Owner decisions still required before a release architecture change:

- Authorized provider settings/deployment inventory read access, with no secret values recorded.
- Static prebuilt architecture versus managed-output alternative.
- Branch required checks/review bypass policy, production environment approval/main-only rules and scoped credentials.
- Known-good eligible immutable rollback target, owner and permissions.

## Honest exit criteria

A passing local baseline is not a repaired audit. Scanner package counts are not independent exploit counts or evidence of deployed browser compromise. A passing Chromium suite is not Safari, physical mobile, real browser zoom or assistive-technology verification. A DOM/axe smoke is not WCAG conformance or proof of status announcements. Unavailable browser/WebGL prerequisites are blocked, not passed. Unresolved residual advisories and manual/provider gates remain named follow-ups, not silently completed parent issues.
