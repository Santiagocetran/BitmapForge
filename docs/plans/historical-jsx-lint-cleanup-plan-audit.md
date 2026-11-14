# Independent audit — bounded historical JSX lint cleanup

## Decision

**Accept the bounded design with the binding clarifications below.** Implementation may use `historical-jsx-lint-cleanup-plan.md` plus this addendum after the parent records ownership clearance. No architectural rewrite, new dependency, suppression, rule relaxation or additional feature is needed. This accepts a plan, not the concurrent UI implementation or a green lint gate.

The fourteen-error inventory is genuine. The proposed shared callable metadata, local schema/palette validators, one unused-import deletion and commit-phase gizmo publication are proportionate fixes. Three details must be pinned before implementation: consumed-field schema strictness, a test that actually distinguishes layout publication from passive publication, and an immutable shared-helper/ShortcutsModal ownership handoff.

Reviewed branch `gloin/ui-output-improvements`, HEAD/baseline `298bdec17dcd1603add549118a743e5cd494ba08`, with substantial concurrent uncommitted changes. Read root AGENTS.md, both referenced plans/audits, all nine production targets, existing schema/helper/help tests, App and caller sites, preset persistence, plugin schemas and the rotation setter. No root CODEX.md or specified COLLAB records were present. This audit writes only this document; it does not edit application, configuration or tests, or authorize reset/stash/commit/push/deploy/remote operations.

## Independently reproduced evidence

All Node commands used `npx --yes --package=node@20 -c '<command>'`, which reported **v20.20.2**, and already installed tools. No dependencies were installed into the repository.

- Obtained each historical target through `git show 298bdec:path` and invoked installed ESLint with `--ext .js,.jsx --stdin --stdin-filename path --format json`. All nine per-file lint processes exited **1**. Parsed total: **14 errors: eleven `react/prop-types`, two `react-hooks/refs`, one `no-unused-vars`**. The Python collector exited 0 for successful collection, not passing lint.
- Independently linted the nine current targets with explicit JSX inclusion: underlying ESLint **exit 1, 14 errors, zero warnings**. Exact identities still agree with H01–H14, not merely the total. Eight current sources match baseline text; ShortcutsModal differs and now declares the UI-owned optional `onCloseAutoFocus` contract while retaining its two historical errors.
- Ran unchanged existing tests together with `node node_modules/vitest/vitest.mjs run src/app/components/PluginControls/SchemaControls.test.jsx src/app/utils/uiPropValidators.test.js src/app/components/ui/ShortcutsModal.test.jsx`: **exit 0; 3 files, 47 tests passed** — 13 schema, 33 helper, one help autofocus. No timeout changes. This is snapshot evidence, not acceptance of the in-flight helper/UI diff.
- The helper tests directly invoke real production validators, including negative cases, rather than relying on React warnings. The help test uses the actual Radix cancellable autofocus event, switches to a latest callback, and checks `preventDefault` and focus. It does not yet cover the historical controlled open/change contracts.

No cleanup has been implemented in this review. No new gizmo regression or browser smoke has run. Final root/expanded lint, new consumer tests and integrated behavior remain future acceptance gates, not inferred passes.

## Contract dispositions

| Target | Disposition grounded in actual source/use |
| --- | --- |
| ErrorBoundary.children | Accept optional/nullish supported renderable children. Actual Layout child is an element; preserve the class error state, fallback and retry. An element is opaque to the validator: do not execute its component or descend into its props to anticipate errors. |
| ModelUploader.compact | Accept optional boolean, including nullish. Actual InputSource passes `Boolean(model)`; omission defaults false. Compact without a model still shows the normal chooser. Metadata must not coerce or change drop/remove/status behavior. |
| SchemaControls.schema/values/onChange | Accept local typed metadata with the consumed-field clarifications below. The schema is a properties map, not a root schema. Existing null schema/callback behavior and value-default fallback are explicit tested APIs. No production invocation outside tests was found; do not invent one. |
| ColorSwatches.colors/colors.slice | Accept one required actual-array-of-strings contract on private ColorSwatches. A declared colors contract must clear both diagnostics. Built-in and saved presets supply `settings.colors`; do not add a fictitious slice-function prop, hex-only restriction, migration or exported component. The small local production validator/test extraction is acceptable. |
| GizmoCanvas two ref writes | Accept one layout-effect publication per commit plus unchanged passive mount listeners. Binding timing evidence is specified below. |
| TextInput.FONT_LABELS | Delete only the unused import binding, not the engine export or the seven current font choices. |
| InfoTooltip.content | Accept supported node metadata, not a string-only contract. Current production callers are strings; the implementation deliberately supports non-string content and `More info` labeling. Preserve Radix and string/non-string aria-label behavior. |
| SceneManagerProvider.children | Accept optional/nullish supported node metadata. App and tests provide ordinary elements. Keep the stable initially-null ref, separate provider instances and outside-provider error. |
| ShortcutsModal.open/onOpenChange | Accept required boolean and callable metadata for this controlled application interface. App supplies boolean React state and its setter. Do not invent uncontrolled/defaultOpen mode; preserve the UI owner's optional autofocus contract and forwarding. No writes until explicit transfer. |

### Binding clarification 1 — concrete validation without inventing schema restrictions

Interpret plan §4 as **typed metadata for consumed inputs**, not a JSON Schema interpreter or a claim that every renderable/coercible JavaScript input is a supported schema. All existing 13 cases and current built-in descriptors fit the proposed types. Finite numeric values and integral integer values are appropriate documented expectations, even though the current HTML/checkbox code has coercions; metadata must never perform those coercions itself.

Pin these details in implementation and direct tests:

1. Bounds are consumed only by `integer`/`number` ranges. Check supplied non-nullish `minimum`/`maximum` there; ignore those keywords on boolean/string/unknown fields. Enum is consumed only for string selects. Do not reject arbitrary enum data on numeric/boolean/unknown fields. Unknown keywords remain unrestricted. This resolves the ambiguous phrase “for implemented types” in plan §4 without widening validation beyond source consumption.
2. Keep nullish fallback semantics explicit. Missing/null schema and values are accepted; missing/null entries fall back to defaults; missing/null bounds retain range fallbacks. Missing/null `title` uses the key (`field.title ?? key`), so accept both null and undefined there as well as strings, including empty strings. Non-null wrong-type titles on implemented controls may be rejected. Missing field type and unsupported string types remain accepted/skipped. A string descriptor without an array enum remains accepted and renders no select; do not require enum or add a control.
3. Do not require known field keys, reject unknown values keys, constrain out-of-range numbers, enforce enum membership or impose min/max ordering. The plan correctly excludes those semantic policies. Unknown/skipped field data must not become a route to restrictive deep validation.
4. Shape-check sibling schema before accessing its members from the values validator. For malformed ordinary inputs such as `schema: []`, `schema: 1`, `schema: { x: null }`, return a useful Error or safely leave sibling failure to the schema validator; never throw. Tests must explicitly invoke the values validator with those malformed siblings and with unknown keys. Getter/proxy sandboxing and cyclic graph interpretation are not additional requirements.

The shared `renderableChildren` helper is also intentionally a **bounded supported-node contract**, not a complete ReactNode recognizer. It currently accepts nullish, booleans, strings, numbers, bigint, valid elements/fragments and recursive arrays, rejecting plain objects/functions/symbols. Portals, generic iterables and promises are not accepted. No actual target caller requiring those omitted forms was found; do not expand the shared helper speculatively or claim complete React 19 node coverage. A newly discovered genuine caller would require a coordinated helper-owner decision first.

For ColorSwatches, explicitly choose and test the plan's allowed sparse-array semantics: holes are skipped as native slice/map skips them; explicit undefined/non-string entries fail. Empty and more-than-five string arrays, ordinary CSS color strings, and unchanged first-five order remain accepted. No string parsing is required.

### Binding clarification 2 — prove latest committed gizmo timing, not just eventual freshness

The proposed implementation is sound for existing native window mouse events:

- Define the current `onMove` and `onUp` closures inside an unconditional layout effect with no dependency array; atomically publish one object into handlersRef. This captures that committed render's setter without publishing during render.
- Keep the passive `[]` listener effect and exact delegate cleanup. Layout setup precedes the component's passive listener setup on mount. Ordinary committed rerenders replace callbacks but do not rebind listeners or reset the active drag origin.
- Do not clear callbacks in ordinary layout cleanup. No effect event API, setter lookup redesign, new cancellation or pointer/touch support is needed.

**Mandatory test refinement:** plan §6.2's move “after act commits” is necessary but alone cannot distinguish `useLayoutEffect` from a stale-publication `useEffect`, because act normally flushes passive effects before returning. In addition, add a commit-boundary assertion: a test parent/sibling layout-effect probe ordered after GizmoCanvas's layout setup dispatches a real window mousemove during an active drag on the setter-replacement commit. Assert only the new setter receives it, with the original drag origin, and zero ordinary-rerender listener add/remove. Arrange the tree/effect order explicitly; do not rely on a timer or a post-act event as the only timing proof. A passive-only implementation must fail this assertion. Test fixtures receiving props require real metadata too.

Keep all §6 math/lifecycle cases: signs and sensitivity, Z preservation, Shift snap, mouseup termination, next drag from latest rotation, StrictMode one live pair, exact unmount cleanup and no post-unmount calls. Scope listener counts by event type and installed callback identities rather than global add counts. Restore action identities as well as store values and canvas mocks.

The optional speculative-render experiment must remain honest: changing a Zustand external-store snapshot is not reliably a transition that can be held uncommitted. If attempted, use a deterministic harness that proves the gizmo render actually occurred with the alternative setter and did not commit, before testing the old delegate. Do not label a parent that suspended before rendering GizmoCanvas as speculative-publication evidence. If not feasible in the bounded test harness, record the limitation; source proof of effect-only publication plus mandatory commit-boundary regression remains required. No claim of arbitrary events dispatched from earlier child layout effects is made by this design.

### Binding clarification 3 — no moving helper baseline or simultaneous help edits

Plan §3's default serial barrier is accepted and sufficient. Parent must record the reviewed helper source/test snapshot and exact exported contracts before historical consumers extend metadata. File existence, passing snapshot tests and a worker's “almost done” are not handoff evidence. UI owner alone writes `uiPropValidators.js`, its tests and ShortcutsModal source/test until acceptance and explicit transfer. The cleanup consumes accepted helper exports read-only; missing interface means stop and obtain a separately assigned helper-owner change, not concurrent edits or a duplicate shared framework.

A safe optional scheduling relaxation is available, not required: after the helper itself is independently accepted and frozen, parent may authorize the eight non-ShortcutsModal production files and their already-listed tests/local palette validator while the UI owner completes unrelated UI work. Record that reduced ownership explicitly. ShortcutsModal source/test still wait for transfer, and helper/test remain immutable. This is partial implementation authorization, **not UI prerequisite completion or root-gate clearance**. If the helper is not frozen, keep the original full barrier.

When ShortcutsModal transfers, merge required open/change metadata alongside the accepted `onCloseAutoFocus` validator. Preserve the existing latest/cancellable autofocus test and relevant Layout/App help restoration cases. Reconcile any already-approved historical fixes by diagnostic identity; never overwrite them or manufacture fourteen remaining failures. Shared checkout reviews must distinguish owned completed files from other workers' in-flight diffs.

## Sufficiency and completion requirements

The proposed tests are sufficient with the commit-boundary refinement and consumed-field/null-title cases above. They directly exercise production validators under React 19, including rejection and requiredness, and preserve real consumer behavior. Consumer binding tests are necessary even when helper unit tests pass. A quiet React console or successful render is not a validator test; the private palette validator also needs explicit source/binding inspection in the implementation audit.

Retain the existing schema 13 cases, all accepted UI/helper/help cases and budgets. Add the plan's focused boundary/provider/uploader/schema/palette/tooltip/help/gizmo cases within the explicit allowlist, without root test setup changes or global mocks. Keep tests proportional: no renderer construction for provider metadata, preset migration, general schema engine, unrelated upload acceptance expansion or accessibility redesign. The planned real-browser gizmo drag smoke remains a parent-run requirement after implementation, not something satisfied by mocked canvas tests.

Final acceptance still requires, separately:

1. Ownership/prerequisite clearance; independent review of the actual bounded diff and validator bindings; all H01–H14 identities removed without replacement diagnostics.
2. Explicit owned-file tests plus handed-off helper/help and relevant Layout integration tests, with actual file/test totals and original budgets.
3. Zero-error/warning scoped lint including new tests and local validator modules; print-config and JSX lint without --ext proving honest root inclusion.
4. Actual `npm run lint` and independent `eslint --ext .js,.jsx . --format json` on the final combined tree, both exit 0 with zero errors/warnings. Other owners' new failures return to them; there is no historical error allowance or wrapper pass.
5. Scoped Prettier and diff-check with independent exits, plus inspection of ignored/untracked deliverables and parent-run browser/integrated gates after concurrent work stabilizes.

**Outcome:** implementable approval with this binding addendum and the ownership gate. The present checkout still has the fourteen historical failures. Nothing in this audit claims implemented cleanup, final UI approval, green CI, browser verification or release readiness.
