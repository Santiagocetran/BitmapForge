# P1 foundation interfaces — review candidate

This ledger freezes the concrete shared interface implemented by A on `gloin/editor-redesign`, starting at `496f0d1f494e928c54f8fef2321835ccd5141917` (source baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`). **Independent P1 acceptance is required before B/C/D consume it.** Accepted specification/state contracts and binding plan acceptance remain normative. No widget worker may change shared files.

## 1. Shared style interface

`src/app/styles.css` is authoritative. All accepted §3 token names are present with their exact accepted values:

| Token             | Value     |
| ----------------- | --------- |
| `--bf-workspace`  | `#131619` |
| `--bf-panel`      | `#1b1f24` |
| `--bf-field`      | `#252b33` |
| `--bf-hover`      | `#303945` |
| `--bf-text`       | `#f3f1eb` |
| `--bf-muted`      | `#b8c0cc` |
| `--bf-accent`     | `#a8c7fa` |
| `--bf-accent-ink` | `#10233f` |
| `--bf-boundary`   | `#778597` |
| `--bf-separator`  | `#39424f` |
| `--bf-error`      | `#ffb4ab` |
| `--bf-success`    | `#b9d7c0` |

Additional concrete states: `--bf-selected:#314b78`, `--bf-error-bg:#44252d`, `--bf-disabled:#9da8b8`. Internal synonyms `--bf-bg`, `--bf-surface`, `--bf-border`, `--bf-divider`, `--bf-focus` resolve to workspace/panel/boundary/separator/accent respectively. Do not introduce competing utility colors for these states. Engine artwork/background settings are independent.

| Public class                             | Concrete behavior                                                                                                                                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bf-button`                              | Inline-flex centered, gap8; 44px minimum height AND width on every pointer type; 6px radius; 13px/500; 8×12px padding.                                                                                                                                                    |
| `bf-button--primary`                     | Accent fill, accent-ink text, weight650.                                                                                                                                                                                                                                  |
| `bf-button--secondary`                   | Field fill, required boundary edge, text foreground.                                                                                                                                                                                                                      |
| `bf-button--ghost`                       | Transparent fill, quiet separator edge, text foreground; edge is not the sole affordance.                                                                                                                                                                                 |
| `bf-button--danger`                      | Transparent fill, error foreground AND boundary; no red slab.                                                                                                                                                                                                             |
| `bf-choice`                              | Field/boundary/text base, 44px targets; `aria-pressed=true` uses selected fill, text foreground, accent boundary AND 3px inset bottom marker. Preserve check/marker semantics in widget JSX.                                                                              |
| `bf-field`, `bf-select`, `bf-textarea`   | Width100%, min-width0, min-height44, field fill/boundary edge/text; 6px radius/8px padding. Muted full-opacity placeholder. `aria-invalid=true`: error edge/error-bg; widget supplies visible associated error text. Disabled: readable disabled foreground, not opacity. |
| `bf-range`                               | Width100%, min-height44, accent-color; retains native keyboard/track.                                                                                                                                                                                                     |
| `bf-check-row`                           | Flex label/native control, gap8, min-height44, 13px; native checkbox/radio18px, accent-color.                                                                                                                                                                             |
| `bf-group`, `bf-group-title`             | 24px block separation; title14px/600 with12px following space.                                                                                                                                                                                                            |
| `bf-label`, `bf-help`, `bf-value`        | Label13px/block/margin-bottom6; help12px/muted/1.5 line-height; value13px/text/tabular-nums. **`bf-help` means helper text, not the Help dialog.**                                                                                                                        |
| `bf-disclosure`, `bf-disclosure-summary` | Flat separator, margin-top16, 44px summary flex row with explicit native `aria-expanded`; no repeated card. `bf-disclosure-trigger` is the shell's equivalent summary alias.                                                                                              |
| `bf-control-group`, `bf-choice-grid`     | Grid gap12; two-column choice grid `minmax(0,1fr)`/gap8.                                                                                                                                                                                                                  |
| `bf-error`                               | Error foreground,12px.                                                                                                                                                                                                                                                    |
| `bf-picker`, `bf-popover`                | Panel background/text/required boundary,8px radius. Position/collision/scroll constraints remain C's existing Radix responsibility; do not replace them with a static position.                                                                                           |

All button/choice/task hover states use hover fill/text without translation or scaling. Disabled states use native `disabled`, field fill, disabled foreground and separator edge, `cursor:not-allowed`, opacity1. Focus is a **separate 2px accent outline with2px offset**, preserved alongside selected marker, scoped under `.bf-workbench`, `.bf-dialog`, `.bf-picker`, `.bf-popover`, `.bf-scope`; no workbench ancestor is required for portal classes/tokens. Standalone palette harness root AND modal receive `bf-scope`. Reduced-motion removes chrome transitions and smooth scroll, not artwork motion. Button aliases retain all five keys: `BTN.base='bf-button'`, `primary='bf-button--primary'`, `secondary='bf-button--secondary'`, `ghost='bf-button--ghost'`, `danger='bf-button--danger'`.

Shell-only names: `bf-workbench`, `bf-header`, `bf-history`, `bf-project-actions`, `bf-workspace`, `bf-inspector`, `bf-inspector-inner`, `bf-task-nav`, `bf-task`, `bf-task-body`, `bf-task-panel`, `bf-stage`, `bf-preview`, `bf-canvas-surface`, `bf-empty-scroll`, `bf-empty`, `bf-source-routes`, `bf-mobile-toolbar`, `bf-overlay`, `bf-dialog`, `bf-settings`, `bf-help-dialog`, `bf-help-body`, `bf-notice-slot`. Do not reuse `bf-help-dialog` for field help. The inspector uses one body scroller, not per-widget scrolling except existing bounded palette/portal surfaces.

## 2. B — source bridge and child ref names

Production caller is already `InputSource navigationRef={sourceNavigationRef}`. B implements the optional object ref with a layout-effect-published `{focusSource(kind): boolean}` and identity-guarded cleanup. `kind` is exactly `model|shape|text|image` (not `shapes`). Focus only connected, enabled, non-hidden/non-inert controls. Return false if unavailable. Focus and instant-nearest reveal the native target; never set source state or synthesize native chooser activation. Shell performs source setter/navigation/reset first, invokes handle once after commit, then falls back to Source heading on false/missing handle.

**Exact optional child prop names (frozen here, no guessing):**

| Child           | Prop               | Native target                                |
| --------------- | ------------------ | -------------------------------------------- |
| `ModelUploader` | `chooseButtonRef`  | Current native Choose File / Replace button  |
| `ImageInput`    | `chooseButtonRef`  | Current native Choose Image / Replace button |
| `ShapeSelector` | `selectedShapeRef` | Native button for current selected shape     |
| `TextInput`     | `textareaRef`      | Native text textarea                         |

Use existing `contracts.headingRef` for optional callback/mutable element refs on child propTypes; use new `contracts.navigationRef` for InputSource. Parent ref variable names inside InputSource are private. All child props remain optional for standalone consumers. Source selection retains existing store setters/configs and actual native chooser/drop behavior. A's stage callback is `PreviewCanvas({onChooseSource})`; callback receives `(kind, nativeReactEvent)` and records exact invoker. It does not open a chooser. Real app always supplies it; standalone display consumers may omit it.

## 3. C — controlled palette seam

Retain exact existing props: `portalContainer`, `interactionRef`, `presetDraft`, `onPresetDraftChange`, `presetSaveOpen`, `onPresetSaveOpenChange`. New props already passed by shell: `palettesOpen`, `onPalettesOpenChange`, optional boolean/function contracts, standalone local fallback false. Draft/open and browse live in Layout and survive remount. The name form must be outside browse content and may focus only after explicit invocation, never controlled-open remount.

Retain `interactionRef.current.cancel({restoreFocus:false})` synchronous retirement and `isKeyboardDragging()` predicate. Shell barriers run at pointerdown capture before task/collapse/Close/Help/stage/backdrop blur and again for keyboard/programmatic transitions. Shell never prevents native pointer default. C still owns local Browse/Save/structural barriers, revision/own-write machinery, duplicate-color identity, invalid draft and queued restoration races. Portal host remains inside current mobile Dialog; desktop default portal unchanged. Do not edit `paletteHarness.jsx` (A ownership).

## 4. D — Look, motion and output seam

QualitySettings new finite `part` accepts `all` (default), `renderer`, `refinements`. Reuse `contracts.qualityPart`. Optional `advancedOpen/onAdvancedOpenChange` and `postEffectsOpen/onPostEffectsOpenChange` use existing optional boolean/function validators, controlled/local false fallback. `renderer` contains registry mode and relevant detail/dither; `refinements` contains Tone & background and Texture effects only. Neither owns side-effect controllers. A's P3 integration will place one renderer presenter, Palette, then one refinements presenter. **Current P1 deliberately renders only one `part="all"` instance until D actually implements split; do not render two all copies.** This is a named transitional integration gap, not final Look order acceptance.

Motion shell owns controlled Rotation Offset and Light Direction wrappers (initially false) and keeps both widgets mounted under hidden content. D owns their contents only. No new wrapper/disclosure prop is needed by those children.

Final ExportPanel output-only props: `selectedFormat`, `onSelectFormat`, `exportSelected`, `cancelExport`, `exporting`, `disabledReason`. D removes project presentation/unused `saveProject/loadProject` requirements; A keeps single hook in Layout and will narrow caller props after D lands. P1 spreads the unchanged controller into the baseline panel so it stays functional: the baseline Export panel's project UI/input is **temporarily duplicated** with the real new header actions. D must remove it; this is not accepted as final single-input integration. No hooks in either presenter, no builder/engine edits.

## 5. A — shell state, geometry, project and Help

`activeTask='source'`, controlled booleans `advancedOpen`, `postEffectsOpen`, `palettesOpen`, Rotation/Light state all initially false; `presetDraft=''`, `presetSaveOpen=false`. UI-only, no history/persistence writes. Stable panel IDs `bf-panel-source|look|motion|export`, matching `bf-heading-*` headings, named Editor tasks group. Task activation keeps native button focus; heading focus only explicit source/global Export/resize ownership. One Preview and one export controller remain outside responsive/task branches.

`ProjectActions({saveProject,loadProject})` accepts direct controller callbacks only, owns native `.bitmapforge` input, clears value before loading a file and on native cancel via cleaned-up event listener, ignores empty selection. No duplicate hooks. Header/local modal Help call the same optional `Layout.onShowHelp` supplied by App's shared `showHelp`: committed bridge `beforeHelp()` then sibling dialog. Existing bridge methods/identity-guarded layout publication unchanged. Notice presenter async logic unchanged; only CSS classes changed.

Adapter publishes root pixel variables `--bf-visible-height`, `--bf-visible-top`, `--bf-sheet-height`, `--bf-sheet-top`; initializes in layout effect, listens window resize and visualViewport resize AND scroll, changes only differing rectangles, cleans variables/listeners on unmount. Valid finite positive viewport height and nonnegative finite offset, otherwise innerHeight/0. Portrait H≥600 uses min(.6H,560); other rectangles full H. Shell narrow fixed topT/heightH/bottom:auto. Help `.bf-help-dialog` topT+8/max-heightH−16, horizontal transform only. Root `data-bf-short=true` below240 permits whole-interior scrolling. Safe-area padding is inside border-box geometry.

`resetScroll` is one-shot; transition state forces reselect-current-task commit. Task activation/mobile reopen/desktop expand/both breakpoints reset first, then generation-bound explicit reveal wins. Close/collapse discard offset but retain state. Same-breakpoint measurement never cancels/remounts; nearest reveal keeps existing focused body control reachable. Help does not reset. Exact opener restoration checks connected/hidden/inert/disabled; disconnected stage routes fall back to Open settings.

## 6. Validator exports

New exported callable metadata in `uiPropValidators.js`:

- `navigationRef`: optional mutable current slot; current null or object with callable focusSource; rejects undefined current/missing method/wrong type.
- `qualityPart`: optional enum `all|renderer|refinements`.
- `sourceKind`: required enum `model|shape|text|image`.

Reuse existing `headingRef`, `optionalBoolean`, `optionalFunction`, `requiredFunction`, `requiredString`, `renderableChildren`, `interactionRef`, `exportFormat`, `cancelExport`. React19 does not invoke function-component propTypes automatically. Direct positive/negative tests cover the new validators; no new runtime validator package or generic controller abstraction.
