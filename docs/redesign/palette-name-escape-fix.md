# Palette name Escape — B1 serial repair candidate

**Implemented; independent re-audit required.** Parent explicitly transferred only `ColorPalette.jsx` and its dedicated tests to A for this B1 repair after C finished. B and D are independently accepted and remain untouched. No transaction, drag, revision, producer, store, hook, builder or validator rewrite.

## Exact repair

- Marks only the actual palette name input with `data-bf-palette-name=""`.
- At the existing Settings Dialog Escape boundary, prevents **only Dialog dismissal** when the event target is that marked native input, is the actual focused element and belongs to this live Dialog. Existing Help/keyboard-drag predicates remain unchanged. No new propagation suppression or catch-all input handling.
- The original C React name Escape handler still receives the event and alone clears draft/form and restores Save palette. Its existing local stopPropagation remains unchanged. Once focus returns to Save palette, the marker predicate is false and second Escape closes Settings normally.
- Dedicated C explicit Cancel/Escape/Save unit cases assert the marker contract without weakening their clear/focus assertions.

## Real integrated regression, written before production repair

Two 320×568 cases cover both **Open settings** and global **Export** openers. Each first opens Look/name, fills a draft, uses ordinary Close, verifies exact opener restoration, reopens and confirms retained draft/no remount autofocus. Then native name Escape must leave Settings open, remove the form, focus/reveal Save palette; second Escape must close Settings and restore that exact opener. Reopening and invoking Save palette again must show an empty name.

The new Open settings case was run **before** the production repair: exit1, Settings disappeared on first name Escape, reproducing B1. After the minimal repair both cases passed: **exit0, 2 passed,19.1s**, unchanged90000ms/retries0.

Evidence root: `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-p3-evidence/name-escape-fix/`. `before/` and `before-hashes.json` snapshot the already-dirty candidate before B1; `red.log`, `red-results/`, `red-report.json` retain the genuine failing first-Escape assertion and runner trace. The exact worker-only patch and final hashes/results will be recorded here before handoff; Git-base diffs must not conflate this repair with earlier accepted P1/P3/C work.

## Final affected gates pending

A will run the retained original30 UI/palette scenarios plus new B1/name/parent-hide/drag cases, focused C/shared unit suites, explicit JSX lint/format, normal serialized app build and full built artifact gate at90000ms/retries0. Prior complete source55/built10 results are pre-B1 evidence, not clearance of this changed Dialog boundary. Parent owns whole-root/workspace/engine verification and independent re-audit; no C acceptance is self-issued here.
