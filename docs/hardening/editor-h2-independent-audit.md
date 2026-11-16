# H2 independent implementation-stage audit

## Verdict

**ACCEPT — H2 source/unit implementation stage only.** The exact reviewed repair implements the independently accepted wrapper-only boundary. No material source or test finding requires revision at this stage. This is **not** complete H2 acceptance, built-output/browser acceptance, H1 clearance, QA reconciliation, or release authorization.

Audited 2026-11-15 05:43 UTC on `gloin/release-hardening`, HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01`. Read repository governance, web-product-development/editor-redline skills, accepted repair plan and independent plan audit, and `editor-h2-verification.md`. Concurrent CLI modifications were excluded. This reviewer created only this report; no source/test edits, baseline swapping, build, installation, browser, server, or external harness changes were performed.

## Exact identity and evidence checks

Evidence directory: `/home/agent/.hermes/profiles/gloin/cache/scratch/editor-h2-evidence/`.

- Recomputed `manifest.sha256`: **`610a48c041c5c1fc5880ad719c33ceb701e7a6add1270403a99d1eddd32f4a92`**, matching the delegated identity.
- Programmatically verified **all 20 manifest entries**, including current owned source/tests, implementation handoff, every listed red/green/timeout/lint/format log, and patch. No mismatch.
- Recomputed and matched `h2-owned.patch`: **`07a10c8d5df795533d4b7f16f133e9e9e5464b4d63c5ee5cf14ae99b4d3c8970`**. Independently generated the current tracked owned diff plus `git diff --no-index /dev/null src/app/components/Layout/Layout.hardening.test.jsx`; its bytes equal the frozen patch exactly. The untracked integration test is therefore included, not silently omitted by ordinary Git diff.
- Current StatusNotice SHA-256: `1d0373604e8c1141aab74e6dd523ba628897310715e5c9e72b7c6877cdcce074`. Original HEAD StatusNotice SHA-256 independently recomputed from `git show`: `f8b52bab594f3f70cbb09450b04bc0492e0735a29ebef9d1f0005fe676925a22`.
- Supporting production/config paths checked with `git diff --exit-code HEAD` remained unchanged: Layout, ColorPalette, App, ShortcutsModal, styles, Vite test configuration/setup, package manifest and lockfile.

Hashes establish the retained artifact/current-file identities, not a fresh browser build or independently witnessed historical execution. The historical baseline source-restoration command and exit are recorded in the author's handoff; this reviewer inspected the retained red output and baseline hash but did not alter source to recreate that historical run.

## Source and CSS inspection

The entire H2 production change is `StatusNotice.jsx:47`:

```jsx
<div className="bf-notice" hidden={suspended} inert={suspended}>
```

Both status and optional alert/Dismiss remain children of the same existing wrapper. Neither role owner nor its content is cleared, duplicated, moved to a second presenter, or keyed/remounted. `aria-live="polite"`, `aria-atomic="true"`, alert role, message selection, progress/error precedence and Dismiss handler are unchanged.

Subscription and scheduling logic (`:8–44`) is byte-for-byte unchanged: suspended attachment returns without subscribing; cleanup invalidates that lifetime and unsubscribes; captured microtasks check `active`; the deferred functional updater checks `active` again; delivery reads current state and equal presentation returns the prior object. Wrapper isolation does not substitute for, or weaken, those race guards. Resume retains the existing asynchronous current-only delivery contract, not a new promise of synchronous replacement before the delivery microtask.

The actual cause is consistent with installed dependency source: Radix Dialog calls `hideOthers(content)` (`@radix-ui/react-dialog/dist/index.mjs:135–138`), while `aria-hidden/dist/es2015/index.js:131–134` preserves all `[aria-live]` elements and their ancestor paths. A sibling modal alone is not adequate application-notice isolation.

Layout still creates the portal into its persistent notice node, passes `helpOpen` as `suspended` (`Layout.jsx:565`), and moves that host between Settings and Preview in the existing layout effect (`:228–235`). Controller/bridge ownership and focus restoration code are untouched. No architectural or H1 repair is hidden in this patch.

**No source-level hidden/CSS regression found.** Existing `styles.css:119–120` forces `[hidden] { display: none !important; }`; `.bf-notice` only specifies text size/wrapping, and its child error flex style cannot override a hidden ancestor. Removing the notice's own layout contribution during Help is intentional. With suspension false both boolean attributes are removed, preserving ordinary presentation. Notice-slot sizing, modal geometry, breakpoints and CSS are unchanged. This static finding is not a measured layout/resize or native inert pass; those remain browser gates.

## Test integrity and causal evidence

### Meaningful real-modal variants

`Layout.hardening.test.jsx` runs eight explicit combinations: desktop versus narrow Settings, populated success versus populated error, and ordinary versus StrictMode mounting. It imports real Layout, ColorPalette/dnd, StatusNotice and ShortcutsModal/Radix Dialog. Fixture Help opening invokes `bridge.current.beforeHelp()` before setting open; close autofocus prevents default and delegates to the current restoration bridge, matching App's relevant wiring.

Mocks are confined to engine/export work and unsupported canvas/media/resize facilities; no modal, notice, palette, subscription or bridge boundary is replaced. These are genuine jsdom modal integration tests, not native browser tests, real export-controller tests, or full App keyboard-shortcut tests.

Before opening Help they positively establish the exact application notice role owner and populated content, and for errors establish an accessible alert/Dismiss. They then verify Close focus, retained wrapper/status/alert/button identities and text, hidden/inert, and separate default-role absence. Scoping queries to the captured wrapper avoids confusing dnd announcers without disabling accessibility filtering. After multiple hidden updates, child/text observers remain empty; after close the same notice/host is accessible with exact newest success/error, obsolete text absent, and invoker focus restored. Reopen explicitly requires a different Help DOM node, checks its Close focus, dismisses with Escape and restores the invoker again. Settings cases exercise the host move into the drawer and return to Preview.

The standalone notice tests use Testing Library `{ hidden: true }` only for retained-DOM assertions and separately require default `queryByRole` absence. They retain queued-job, initial/resume/unmount, delivered-but-uncommitted transition, isolated StrictMode unsubscribe, equal-presentation, busy/progress, priority and dismissal assertions. New tests retain node/text/error/button identity and prohibit observed mutations except wrapper `hidden`/`inert` attributes; unchanged live attributes are supported by both the explicit polite assertion and mutation restrictions. No skipped cases, assertion suppression, console suppression or timeout override was introduced.

Existing Layout bridge/ref-replacement/StrictMode cleanup tests and one-deferred-export/one-manager lifetime test remain unchanged and pass. Their mocks establish source-level lifecycle preservation, not native renderer/controller behavior. The new fixture's mocked export controller is not misrepresented as controller-identity evidence.

### Red/green attribution

- `final-tests-baseline-red.log` contains **16 failed / 38 passed** across the final three affected suites. All eight real-modal variants fail at `wrapper.hidden === false` (`Layout.hardening.test.jsx:151`) after populated retained content, identity and actual modal Close-focus checks. Both new standalone cases fail at absent hiding (`StatusNotice.test.jsx:46`) after retention/no-resubscription assertions. The remaining reds are new explicit accessible-role-absence checks, not missing elements caused by accidentally using the old retention query. This is meaningful H2 isolation red evidence.
- Earlier `baseline-red.log` included an unrelated canvas `ctx.save` fixture failure. It is not H2 red proof. The corrected `integration-baseline-red.log` and, more importantly, final-test baseline run supply the relevant causal evidence.
- Retained intermediate green-attempt logs expose genuine 5000 ms timeouts; the initial combined attempt also shows follow-on lookup failures. They were not erased or counted as passes. Final tests split success/error, scope costly queries while retaining positive/negative role semantics, and avoid redundant desktop setup. No timeout increase or weakened mock boundary is present. Historical intermediate test bytes are not separately frozen, so this audit does not claim an instruction-level performance profile of those versions.
- Hash-verified final evidence records **91 passed / 5 files** for affected components/palette preservation, and **863 passed / 62 files** for the root source/integration suite. Root inclusion excludes workspace CLI/embed, alternate export suites and Playwright. Empty lint logs alone do not encode an exit status; their exit claims remain attributed to the handoff, with owned lint independently rerun below.

## Independent execution

Paired executable: `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node`, independently checked **v24.22.3**. From repository root, ran:

```text
NODE24 node_modules/vitest/vitest.mjs run src/app/components/ui/StatusNotice.test.jsx src/app/components/Layout/Layout.hardening.test.jsx src/app/components/Layout/Layout.test.jsx src/app/components/ColorPalette/ColorPalette.test.jsx src/app/components/ColorPalette/ColorPalette.redesign.test.jsx --maxWorkers=1
```

**Exit 0; 5 files / 91 tests passed; duration 29.93 s.** Real-modal suite: 8/8 passed, 6.248 s aggregate, individual cases 589–1114 ms. No test budget change. Also independently ran explicit owned JSX ESLint on all four owned source/test files: **exit 0**. The broader root suite was inspected as hash-verified retained evidence, not independently rerun here.

## Required pending gates — not cleared by this ACCEPT

1. After the serial browser lane is explicitly handed over, strengthen and run accepted source H2 browser coverage: direct desktop Help and narrow Settings Help with populated success/error, exact role owners, native hidden/inert and native Tab/focus isolation, retained notice/host identity through breakpoint/resize moves, latest-only resume, and immediate close/reopen restoration across frames. Current jsdom close-then-reopen tests do not establish the tighter removal-observer/reopen race or native Tab behavior.
2. Produce a fresh immutable matching build; run accepted revised external Q5 baseline/final in **Chromium and Firefox**, with exact real producer strings `Project saved as .bitmapforge file.` and `Project loaded.`, failure-safe mutation evidence, and verified source/build/harness identities. Source-store sentinels are not producer evidence; original a02 failures stay failures. Required palette/source preservation gates remain outstanding at browser level.
3. Perform and record manual desktop AT checks with actual OS/browser/AT versions: read/browse and attempt navigation during populated success/error Help suspension, buffered announcements, current-only resume, Dismiss and repeated keyboard/focus restoration. Automated role absence is not speech or virtual-cursor evidence.
4. H1 remains separately diagnosed/implemented/accepted work. Existing WebKit environment block, physical Safari/mobile/touch, real browser-menu zoom, sparse Shape/Text quality and strict IDREF-policy findings are not cleared.

**Final disposition: ACCEPT the exact H2 wrapper-only implementation and its source/unit evidence; retain all built Chromium/Firefox, native Tab, resize/focus-race and manual AT gates as pending.**
