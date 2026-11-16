# IC1 artwork equality failure — bounded offline attribution

## Disposition

**Independently confirmed: three passes, one failed Chromium desktop row. Full artwork equality remains failed; IC1 native acceptance remains blocked.** The retained evidence does not establish source replacement. It also does not establish ordinary animation as the cause. A concrete competing observation is WebGL context loss before both snapshots, with restoration logged inside the second screenshot call. The exact two hashed PNG buffers were not retained, so this evidence cannot resolve pixel change versus screenshot encoding/compositing effects.

No browser/server, rerun, source/harness repair, dependency change, build, remote write or release action was performed. This is attribution, not acceptance or permission to weaken equality.

## Scope and evidence identity

Checkout: `gloin/release-hardening`, HEAD `6966686455fce3baa9bc749a272f372b27a52441`. Read AGENTS.md, web-product-development, the accepted IC1 plan/re-audit and implementation audit, re-entry plan/audits, and `ic1-reentry-native-verification.md`. The named COLLAB bootstrap files and HERMES.md are absent.

Paths share `/home/agent/.hermes/profiles/gloin/cache/scratch`:

- `B = image-cancel-contract-reentry-v1`.
- `C = B/runs/r16c/final/smoke/chromium/a01`.
- `F = B/runs/r16f/final/smoke/firefox/a01`.
- `E = B/tests/evidence/native-resume-20261116-verified-roster`.
- `T = C/results/ui-smoke-Q1-image-D-chromium/trace.zip`.

Read the actual runner JSON reports, ledgers, four before/after diagnostics, eight downloaded project files, retained PNGs, trace JSONL/network records and trace JPEG bytes. Verified all **80** path/length/SHA-256 entries in `E/run-artifacts.json`, with zero mismatches. Separately rechecked the **78** files under C/F against their inspection-time hashes, unchanged. This is not a repeat verification of the older complete 9,740-entry seal.

Trace SHA-256: `c3fed0b850d6db7adedf815ae8d7de76fda3034dcac65a01d63f63d4c764c0e1`.

Inspected current readable application source and corroborated the relevant empty-image, empty-drop, serialization and context-event branches directly in the retained immutable `dist/assets/index-BKDpitmq.js` (SHA-256 `1c87a5aadc0783240035492a1201ecf74e23fd21e5f8c186872ffdf8581ae997`). This does not claim a new source/build equivalence check or rebuild.

## Independent result and first-failure reconciliation

Parsed actual `report.json` test results, not only the summary document: exactly one result per row, retry0, no skipped/flaky result. Ledgers agree.

| Engine   | Row        | Actual result | Changed snapshot fields |
| -------- | ---------- | ------------- | ----------------------- |
| Chromium | Q1.image.D | failed        | artwork only            |
| Chromium | Q1.image.N | passed        | none                    |
| Firefox  | Q1.image.D | passed        | none                    |
| Firefox  | Q1.image.N | passed        | none                    |

The Chromium desktop error is `AssertionError: Image cancel preserves UI/source/settings/artwork identity`, at `harness/lib/repair-contracts.mjs:316`, called by `lib/ui.mjs:317`. Positive pre-invitation, chooser activation/empty selection, both project downloads, both snapshots, and the oracle's preceding individual assertions completed. The first failure is the full deep equality, not invitation, upload setup or worker re-entry.

Exact field comparison:

- `sourceType`: `image` → `image`.
- `settings`: deeply equal full project payload after removing only `createdAt`; version2, model null, and every serialized setting preserved.
- `artwork`: `8c2d4381f27449685afd631eea773f9a7ab6cc3148a8233992723e84f1a8f907` → `2d51b3946cef498b9ea1a38a1bb4424656771a2da69b9964f30661d66d08b609`.
- `invitation`: true → true.
- `fileCount`, `replaceCount`, `alertCount`: each 0 → 0.
- `emptyText`: unchanged literal `Drop an image: PNG, JPG/JPEG, GIF, WebP or SVG.\n\nChoose Image`.

Everything after that assertion is unreached in this row: Settings closure, return-to-model/cube upload, return-cube meaningful preview, final no-alert check and loaded screenshot. The zero alert field in the snapshot is not the later final no-alert assertion.

All three passing rows have exact eight-field equality and retained return-cube/loaded artifacts. Their terminal preview samples meet the unchanged occupancy/colors/entropy floors: Chromium N `0.2830183267846388 / 88 / 1.6918522347814262`; Firefox D `0.061465973051338905 / 104 / 0.5173467183391679`; Firefox N `0.08313018039980498 / 83 / 0.6600836042744701`. Firefox N's earlier lower-entropy sample remains retained; its subsequent qualifying sample is what satisfies the existing poll.

## What the actual project and image bytes establish

Each of the four pairs contains two genuine 1,286-byte JSON `.bitmapforge` downloads. Comparing parsed keys and values, **only `createdAt` changes in every pair**. Chromium desktop timestamps are `2026-11-16T03:04:42.354Z` and `2026-11-16T03:04:42.836Z`. Top-level keys are `version`, `createdAt`, `settings`, `model`; model is null throughout. This directly corroborates serialized settings preservation.

Do not overstate that proof: `src/app/utils/projectFile.js:43–67` explicitly excludes `imageSource` and status from settings and only embeds a model file. These projects are not serialized image-byte identity probes. There was no loaded image fixture in this empty-image cancellation route. The invitation, absent Replace, empty input and source code jointly support an empty-image no-op, rather than preservation of a previously loaded image asset.

`lib/ui.mjs:273–280` hashes the returned **PNG bytes of `canvas.screenshot()`**, not decoded pixels, project bytes, renderer identity or a canvas backing-store read. It does not save those buffers. Neither hash matches a retained file in C/F. Inspecting all ZIP resource signatures found only one PNG: the later failure screenshot, not either oracle input. The trace screenshot steps have no corresponding PNG attachments. The trace therefore cannot supply the missing exact pair for a decoded pixel or PNG-chunk comparison.

Visually inspected the actual empty and failure PNGs and four extracted trace JPEGs. The initial empty PNG is model mode (`Start with a source`), so it is **not** the before-cancel image snapshot. The failure PNG shows Image selected, `Choose an image`, Choose Image, no image content or Replace, and a project-saved notice. Its bytes equal runner `test-failed-1.png` (SHA-256 `74180a9ce959a5b645dd251f61953a998aa1b7e08fc099c7266a4640e81c5954`). It is a later whole-page capture, not the after hash input.

Trace resources ending `1794798282394.jpeg` and `1794798282865.jpeg` show the same empty-image invitation near the respective captures. Resources ending `1794798282574.jpeg` and `1794798282993.jpeg` show preview-region views including the overlaid invitation; their JPEG bytes and decoded RGB pixels are exactly equal, both 667×500. These are lossy/downscaled screencast frames, **not** the 902×676 canvas screenshot PNGs. Equality of these JPEGs cannot override the failing PNG hash comparison. It does illustrate why the oracle name “artwork” must not be read as direct source-asset identity: element screenshots can include composited invitation/UI over the canvas.

## Timing and source attribution

Trace-relative times below are literal trace milliseconds; no rerun supplied these observations.

| Observation                   | Trace record                       | Time                |
| ----------------------------- | ---------------------------------- | ------------------- |
| WebGL context-lost warning    | console                            | 11899.803           |
| Three.js Context Lost log     | console                            | 11919.651           |
| Before canvas screenshot      | test.trace pw:api@48               | 12369.471–12517.147 |
| Empty file selection          | 0-trace.trace call@72, payloads=[] | 12669.919–12695.180 |
| After canvas screenshot       | test.trace pw:api@66               | 12808.970–12927.036 |
| Three.js Context Restored log | console                            | 12916.751           |

Both locator resolutions report `<canvas width="902" height="676">`. Thus the retained resolution logs do not show a simple before/after backing-dimension difference, although they do not continuously measure layout or the final screenshot clip. Restoration occurs during the second screenshot's API interval; it does not tell us the exact compositor sampling instant. The context was already lost **before cancellation**. GPU ReadPixels warnings are also retained; they are not by themselves a causal diagnosis. The trace records no image/model asset request, only the document and three application assets; that supports this empty route but is not a universal proof against in-memory mutation.

Source explains why renderer state deserves attention:

- `ImageInput.jsx:19–27` returns without `setImageSource` when accepted files are empty. The immutable bundle has the same conditional behavior. There is no demonstrated cancellation mutation in that handler.
- `PreviewCanvas.jsx`'s image branch disposes the model and returns when `imageSource` is absent; its empty invitation is conditional on that absence. `SceneManager.js:170–182` clears the active object on disposal.
- `SceneManager.js:83–104` advances object animation only when `hasObject()` is true, but renders the effect every live frame. It stops the loop on context loss and restarts it on restoration. The same handlers are present in the served bundle. The logs do not identify the specific renderer instance, so attribution to a particular canvas lifetime remains unproved.
- `BitmapEffect.js:119–124` still ticks fade timing when rendering; `:157–209` samples, clears/fills/draws and optionally postprocesses. `BitmapRenderer.js:51–65` resets the backing canvas on size assignment and fills its background on the next frame. Capture around resize/recovery can therefore observe a different rendered/composited state without a source replacement. This is a mechanism, not proof of the actual differing pixels.
- Saved options retain spinY, fade/glitch and animation speed1, but noise/CRT/colorShift are disabled. With no loaded object, “the artwork was spinning” is not supported. An active animation configuration or live render loop alone cannot explain this failure.

**Best-supported disposition:** unresolved screenshot/render-state inequality with a specific context-recovery timing confounder, not a proven replacement and not a proven harmless animation flake. Identical coarse JPEGs and preserved settings favor investigating capture/render lifecycle before modifying source-selection logic. Missing oracle PNG bytes prevent a definitive root cause. Three other passes do not make this failed row acceptable or establish repeatability.

## Smallest next unit and decision boundary

No user product/policy decision is needed to accept this report or prepare a bounded follow-up plan. In particular, do not ask the user to choose between “ignore artwork” and “fix cancellation” on this evidence.

The smallest defensible next unit is a **written, independently reviewed evidence-retention plan**, not an immediate cancellation or animation repair:

1. Propose a fresh private adaptation changing only the image snapshot helper to persist the exact returned before/after PNG buffers that it already hashes, with labels and hashes. No extra screenshots, retries, polling, animation controls, changed oracle fields, source access hooks, browser flags or timeout increases. Keep the full equality and all successors unchanged. Preserve the current candidate and failed artifacts.
2. Review that finite change and its offline regression before implementation. Require tests proving that persisted bytes are exactly the bytes fed to the unchanged hash/equality and that differing artwork still fails. Reuse existing trace/context console evidence rather than building new diagnostics infrastructure.
3. Only with separate explicit native authorization and exclusive lane ownership, execute the already required bounded route selection in fresh output roots. Preserve a fresh failure if it occurs. Compare the exact PNG dimensions/chunks and decoded pixels offline; correlate the existing trace with context recovery. A new pass would be a new result, not retrospective repair of this failure or proof of causality.

This proposal is **not implemented or approved by this analysis**. It is an evidence-gap closure, not a claim that retention itself repairs the contract. If later evidence justifies capture-readiness synchronization or a raw-canvas/fixed-phase oracle, that is a distinct contract change requiring an accepted plan, independent implementation review and discriminating mutation coverage. Simply disabling animation, ignoring artwork, substituting project equality, adding tolerance, or waiting until two screenshots happen to match is not authorized. If a real renderer/source defect is demonstrated, assign it its own bounded product repair rather than hiding it in the harness.

Current readiness authorization permits documentation/review preparation; it does not authorize the proposed source edit or another browser run. No immediate user escalation is required. Seek explicit implementation ownership and eventual native grant at those existing boundaries; no new approval framework is needed. Undraft, merge and deploy remain unauthorized.

## Files and preservation

Created only this repository analysis document and four byte-for-byte extracted trace JPEG copies under sibling `ic1-artwork-offline-analysis/` for offline visual inspection. The copies retain their original trace resource basenames; originals remain in T. No historical evidence, accepted source, existing reports, application files, dependencies or remote records were changed. Evidence remains local scratch material, not automatically available to remote reviewers.
