# C palette — independent implementation audit

## Verdict: BLOCKED on one bounded integrated Escape defect

The completed C source and focused regression suite satisfy the reviewed compact-browse, color-only application, explicit-name-focus and synchronous generation-retirement contracts. **Do not accept the palette experience as complete yet:** first Escape in the real mobile palette name input closes Settings and preserves the draft instead of performing Cancel palette. This is independently reproduced, not inferred from the implementer's report. Repair requires coordination with A's shared Dialog boundary; this reviewer did not edit any application or test files.

No other blocking defect was found in the three-file C slice. This is not final combined-tree, built-output or full P01–P11/U acceptance.

## Reviewed identity and scope

Repository `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`, branch `gloin/editor-redesign`, HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`; accepted original baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`. Read governance, specification/state contracts, plan acceptance, foundation interfaces/independent audit and C handoff; loaded product-development/frontend-direction/editor-redline skills. Requested agent/COLLAB bootstrap records were not found; no private memories inspected.

Reviewed actual tracked diffs against HEAD and original baseline, plus the entire new regression file. Actual SHA-256 values matched C's handoff before execution and again after browser verification:

| File under `src/app/components/ColorPalette/` | SHA-256                                                            |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `ColorPalette.jsx`                            | `29d091f6f0479a686d0116d64946a4e968327fc62da907c1c6d9cb566607cfb4` |
| `ColorPalette.test.jsx`                       | `82d8e6a19300f520ef1b689645cb0b5843a4442ae388f5e10d93d926463d4611` |
| `ColorPalette.redesign.test.jsx`              | `5a1423268b4222127b0ccff67a852dd47f5678400a7d4162335defaa3b3c5e1f` |

`paletteHarness.jsx`, shared shell/styles and browser suites remain A-owned. Other workers' concurrent checkout changes are not attributed to C. A's Dialog Escape predicate was read only to diagnose the independently observed integration failure. Only this audit was created inside the repository; scratch configuration/scripts/cache/evidence are outside it. No build, full-root suite, export workload, dependency/config/application/test edit, Git remote change or unrelated server interference occurred.

## Independently executed gates

All JavaScript commands used `npx --yes --package=node@20 -c '…'`; resolved runtime **v20.20.2**.

| Command inside that wrapper                                                                                                                                                   | Result                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `node node_modules/vitest/vitest.mjs run src/app/components/ColorPalette/ColorPalette.test.jsx src/app/components/ColorPalette/ColorPalette.redesign.test.jsx --maxWorkers=1` | **Exit 0: 2 files, 37 tests passed** (18 existing + 19 new), 70.91s total; test execution 60.85s. |
| `node node_modules/eslint/bin/eslint.js --ext .js,.jsx` with the three reviewed paths                                                                                         | **Exit 0**, no ignored-file warning.                                                              |
| `node node_modules/prettier/bin/prettier.cjs --check` with the three reviewed paths                                                                                           | **Exit 0**, all formatted.                                                                        |
| `git diff --check --` with the two tracked reviewed paths                                                                                                                     | **Exit 0**.                                                                                       |
| `node /home/agent/.hermes/profiles/gloin/cache/scratch/bf-c-independent-positive.mjs`                                                                                         | **Exit 0**, `passed:true`, no page errors.                                                        |
| `node /home/agent/.hermes/profiles/gloin/cache/scratch/bf-c-independent-name-escape.mjs`                                                                                      | **Exit 1**, expected Settings count 1, actual 0; isolated reproduction of B1 below.               |

An initial combined scratch browser probe also exited 1 at the same name-Escape assertion, after completing its preceding positive flows. The subsequent positive-only script deliberately excludes that known failing flow; its pass does not supersede the failing gate. One shell bundle exited 1 solely because its final `git check-ignore` found this audit path nonignored; lint/format and a separately executed diff check passed.

Browser identity: independently created external `bf-c-independent-vite.mjs`, importing the actual repository config, exact repository root, isolated `bf-c-independent-vite-cache`, strict **127.0.0.1:5213**, HMR false. Root and actual ColorPalette module returned HTTP 200. Chromium used SwiftShader; evidence is source-app evidence, not production-build provenance. Scripts and captures/results reside in `/home/agent/.hermes/profiles/gloin/cache/scratch/bf-c-independent-evidence/` and its sibling `bf-c-independent-*.mjs` scripts. No A/C existing server was reused.

## Accepted source and regression findings

### Browse/save lifetime

- `PalettePresets` lines 82–105 selects controlled values with local false/empty fallback. The edit strip precedes browsing; browse has native expanded/controls semantics. The name form is a sibling outside the hidden browse subtree. All built-ins and custom presets are mapped, with every preview color, and only custom entries expose deletion.
- Save invocation alone records `pendingNameFocus`; the layout effect consumes it only for an open form and matching shared generation. Controlled-open mount/remount records no request. Removal of unconditional `autoFocus` is real, not just a test fixture adjustment.
- Explicit completion clears draft/open and queues restoration to the exact trigger. Generation, connection, disabled, hidden/inert and rendered-rectangle guards protect restoration. Name invocation/restoration and custom deletion reuse ColorPalette's cancellation generation rather than an independent lifetime.
- `cancel()` synchronously nulls transaction and increments that generation before render. New tests explicitly capture microtasks, hide the existing ancestor, invoke parent cancellation, reveal the **same DOM instance before draining**, and assert focus remains with the owner. This distinguishes retirement from mere disconnection/visibility rejection. Delayed controlled-open commit, explicit reopen, unmount and controlled-open remount have separate assertions.
- Independent browser checks confirmed explicit name focus, browse-collapse draft retention, Motion→Look retention without stealing task-button focus, 1440→320 remount retaining the name while Close receives initial focus, explicit Cancel/Save restoration and custom deletion restoring Browse.

### Hex transactions and drag cancellation

The actual diff leaves normalization, item IDs/token identity, synchronous revision/own-write subscription handling, stale callback checks, native picker callback commits, internal-versus-outside blur policy and DnD sensors/handlers unchanged. Shared focus-ref renaming is mechanical in those paths. New capture barriers occur on C's outside Browse/Save/preset region and Add/Remove; they do not replace the internal picker blur handler or prevent native pointer default.

The retained 18-test matrix still directly verifies incomplete/valid hex, same-picker blur versus Close/outside cancellation, immediate picker commit/draft synchronization, duplicate-item external replacement, stale picker callback, nested subscriber-induced external mutation during own write, duplicate reorder, parent cancellation/unmount, and keyboard Escape/drop/external/parent drag ownership retirement. Existing assertions were not removed; only truthful names and explicit Browse opening changed. The 19 new cases add both controlled/local browse/name behavior, every-palette color-only store readback, pre-blur barriers and focus races. Test helper prefiltering still computes actual accessible names. Its mocked rectangles are **not** geometry evidence.

Independent browser checks additionally confirmed valid uncommitted hex cancellation by Browse without changing the swatch, invalid hex feedback, picker-first/Settings-second Escape, and active keyboard reorder→ArrowRight→Escape preserving original order and the open Settings dialog, followed by second Escape closing it. Native picker immediate updates are covered by the retained callback unit fixture, not falsely claimed as a new real-pointer picker test.

### Geometry and visual evidence

At 320×568, document width was **320**, palette strip client/scroll widths **286/312**. All twelve edit/drag targets were **44×44**; a real saved custom palette delete target was **44×44**; earlier/later controls were each **111×44**. The positive script asserted these bounds. Full collection iteration and color-only application are independently exercised by the focused suite, not inferred from screenshots.

Directly inspected actual desktop browse, narrow browse and name-Escape-after captures. Graphite/cobalt chrome leaves swatch content distinct; editing precedes browsing, and the narrow strip scrolls locally instead of expanding the document. Lower browser/name content intentionally requires task-body scrolling; a screenshot of the first rows is not proof that lower actions are above the fold. No new visual blocker was observed in this bounded review. Full contrast, zoom/reflow and complete state screenshots remain A's final gates.

## B1 — first name Escape is intercepted by the mobile Dialog (blocking)

**Contract:** state contracts §4 item 3 and §5 require name-input Escape to clear the name, close only the save form, restore Save palette, and leave Settings open until a second Escape.

**Minimal independent reproduction:** fresh 320×568 page → Open settings → Look → Save palette → fill `Escape repro` → verify input focus → press Escape. Actual JSON:

```json
{
  "settings": 0,
  "name": 0,
  "active": "Open settings button",
  "reopenedDraft": "Escape repro"
}
```

The script records the actual active-element outerHTML in `name-escape-repro.json`; the shortened label above is explanatory. `name-escape-before.png` and `name-escape-after.png` capture the transition. Reopening Settings exposes the unchanged draft, proving this performed a parent hide rather than explicit Cancel palette. Isolated reproduction exited 1 at `expected 1 / received 0`; the original longer probe independently failed the same requirement.

**Source diagnosis:** C's input at `ColorPalette.jsx:188–197` handles Escape in React `onKeyDown`, but A's `Layout.jsx:522–523` prevents enclosing Dialog dismissal only for Help or active keyboard drag. Radix's earlier Escape capture can close/unmount the name input before its local handler runs. The standalone new suite's explicit Escape case passes because it renders no enclosing mobile Dialog; it therefore cannot certify this event order. The local name handler predates the redesign, so this is not evidence that C newly introduced it, but the accepted redesign contract still requires it to work.

**Required disposition:** A and C coordinate a narrowly scoped name-input Escape ownership solution at the actual Dialog boundary without broad propagation suppression or breaking drag/picker Escape. Add/execute a real integrated regression: first name Escape leaves Settings open, clears draft/form and focuses Save palette; second Escape closes Settings/restores opener. Also retain parent-hide draft preservation. Re-review the exact repair and affected regressions before clearing B1. This reviewer has no permission to edit that shared boundary.

## Remaining acceptance boundary

No waiver of A's complete P01–P11/U matrix, both responsive directions, stale new-dialog teardown, parent hide paths, native pointer drag, 200% zoom, combined style/contrast, full repository/workspace/build or built artifact gates is implied. Physical mobile keyboard, Safari, AT and physical touch were unavailable. The accepted C generation/transaction machinery can be retained; one precisely reproduced integrated Escape behavior blocks unconditional palette acceptance.
