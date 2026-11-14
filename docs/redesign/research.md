# BitmapForge redesign research

Version 1.1 · Plan authoring and bounded audit resolutions only · baseline `8c6613279ed856e4933608e7e6c04e91dca2b331`

## Authority and evidence

The parent's `/home/agent/BitmapForge-redesign-research/DESIGN-BRIEF.md` is authoritative. This document supersedes the older research proposal's chartreuse “Glyph Workbench” direction and dirty-tree baseline, not its reference observations. Chosen direction: **The Bitmap Workbench**, cool graphite / pale cobalt, artwork-first. Read alongside [specification](specification.md), [interaction contracts](state-contracts.md), and [implementation plan](implementation-plan.md). These are proposals for independent audit, not audit clearance or application implementation.

Repository governance `AGENTS.md` was read. `CODEX.md` and the four requested `COLLAB` records are absent; no private memories were inspected. Branch `gloin/editor-redesign` was clean at source inspection. This task writes only new `docs/redesign/*.md`; no dependencies, app/config/tests, commits, remote writes or deployment.

Evidence classes:

- **Source inspected here:** App, Layout, PreviewCanvas, InputSource and all four source widgets, ColorPalette, QualitySettings, AnimationControls, RotationGizmoPanel, LightDirection, ExportPanel, useExportController, global styles/button styles, package scripts, UI foundations/palette browser acceptance. This is not runtime certification.
- **Live baseline spot-check here:** isolated browser session at `http://127.0.0.1:5287`, 780×437. Opened Settings, selected Shapes, closed via Close settings; observed one main-preview canvas, inert Preview while dialog open, inert cleared and exact Open settings focus after close. Fetched served Layout source and confirmed existing stable notice / old left-drawer markers, not new task markup. Read actual renderer/source/format control text. This is a bounded exploratory check, not a full baseline or redesigned-app acceptance run.
- **Prior direct app observations:** `current-product-audit.md`, local source Vite `127.0.0.1:5287`, at this exact baseline. `audit-provenance-manifest.json` contains source and screenshot SHA-256s; `interaction-provenance.json` records actual geometry/focus/source tests. Its source audit and real sprite/project download results are evidence; it did not certify all exports.
- **Visually re-inspected here:** `audit-desktop-empty.png` (1440×1000) and `audit-mobile-settings.png` (390×844). The first shows the expanded preset wall pushing Look below the fold, an upload-only low-salience invitation, and settings-collapse occupying the command position. The second shows a 360px left dialog leaving effectively no usable artwork reference. These are genuine baseline screenshots, not redesign mocks.
- **Reference evidence inherited with explicit provenance:** `modern-editor-research.md`, `image-provenance.json`, downloaded first-party snapshots and images under the parent research directory. The first researcher operated Piskel's export panel and UI SDK's public color demo, not authenticated Rive/Spline/Figma/Linear editors. No new claim of having operated those editors is made here.
- **Design proposals:** dimensions, IA, tokens and paper alternatives below. Static contrast calculations were executed with Python; final rendered-state accessibility, touch/Safari/AT and performance still require implementation evidence.

No external artwork/screenshots are production assets. Keep the local provenance archive for review; do not vendor it wholesale into the application repository.

## Reference transfers, with limits

| Reference and source                                                                                                                                                                                                                                                                         | Evidence                                                               | Adopt / reject                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Rive interface](https://rive.app/docs/editor/interface-overview/overview), [toolbar](https://rive.app/docs/editor/interface-overview/toolbar), [runtime export](https://rive.app/docs/editor/exporting/exporting-for-runtime)                                                               | First-party documented editor imagery, not authenticated interaction   | Adopt contextual inspector and distinct backup/runtime purposes. Reject timeline, object hierarchy and icon-only expert density: BitmapForge has parameter loops, not keyframes.                       |
| [Spline UI](https://docs.spline.design/basics/understanding-splines-ui), [public URL](https://docs.spline.design/exporting-your-scene/web/exporting-as-public-ur-ls), [optimization](https://docs.spline.design/exporting-your-scene/how-to-optimize-your-scene)                             | Docs/screenshots; live entry required login                            | Adopt stage dominance and stable Export destination. Reject cloud-publish wording, AI rail and unmeasured performance scores.                                                                          |
| [Figma design-file guide](https://help.figma.com/hc/en-us/articles/15297425105303-Explore-design-files)                                                                                                                                                                                      | Docs and property-panel image; schematic distinguished from screenshot | Adopt stable regions and grouped labeled property rows. Reject five-region complexity and duplicated tool docks. Device/prototype settings are not mobile authoring evidence.                          |
| [Linear search](https://linear.app/docs/search), [selection](https://linear.app/docs/select-issues)                                                                                                                                                                                          | Documentation and actual search screenshot                             | Adopt human title first, secondary metadata, disciplined rows. Reject issue dashboard, universal command-menu dependency and marketing backdrop.                                                       |
| [Piskel live editor](https://www.piskelapp.com/p/create/sprite/)                                                                                                                                                                                                                             | Actual desktop and 390px public-editor/export inspection; no download  | Adopt format-specific descriptions and strong selected state. Reject shrink-to-fit desktop/mobile and icon-only export; phone screenshot's advertisements are a confounder, not a universal benchmark. |
| [ASCII Worlds](https://github.com/dudicslevente/hermes-ascii-worlds), [controls](https://raw.githubusercontent.com/dudicslevente/hermes-ascii-worlds/main/docs/CONTROLS.md), [compatibility](https://raw.githubusercontent.com/dudicslevente/hermes-ascii-worlds/main/docs/COMPATIBILITY.md) | Repository screenshot/current raw docs, not native runtime test        | Adopt actual glyph work as identity and precise reset scope. Reject ambient glyph wallpaper or assumptions about host/runtime compatibility.                                                           |

Shadertoy's editor was security-blocked in prior research. Spline required authentication. These are unavailable evidence, not successful editor audits. Research supports task/context organization; it does not prove a phone bottom sheet is universally optimal. Our choice must pass BitmapForge-specific acceptance.

## Skills actually applied and rights

Loaded `web-product-development` and its creative-editor-quality reference; loaded both installed local design adaptations. The former supplies inspect → finite spec → independent audit → disjoint work → real artifacts. The frontend-direction skill supplies the two-pass concept/token/wireframe comparison and anti-template critique below. The editor-redline skill supplies five-line direction, severity and state-complete contrast/focus review.

- `bitmapforge-frontend-direction`: local adaptation of Anthropic frontend-design, [anthropics/skills](https://github.com/anthropics/skills), revision `2c5958ecac7cee2b583967a2c4981d0f4a75c579`, Apache-2.0. Scope/safety/provenance additions; retain upstream license for redistribution of skill text.
- `bitmapforge-editor-redline`: adapted from **unslop by Damir Sokolovsky (@heydamir)**, [heydamir/unslop](https://github.com/heydamir/unslop), revision `97daa3eb365670ea3f87ed85356cbfcee18105a5`, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Local adaptation replaces workflow and omits media/provider/scripts; not author endorsed. Preserve attribution/license when copying the adaptation.
- [Vercel UI SDK](https://github.com/vercel-labs/ui): beta behavior infrastructure, not a visual design system; evaluated, not installed. Reuse Radix/dnd-kit rather than doubling focus/reorder primitives.
- [Elaya design skills](https://github.com/elayadesign/ai-design-skills): MIT collection reviewed in the research archive, not installed. Semantic tokens transfer; landing-page funnel/blur/500ms transitions do not.
- Higgsfield skills: reviewed in the parent's skill report, not installed; no paid media, provider connection, remote script or source/artwork upload is needed.

These specifications are original synthesis; they do not reproduce upstream skill bodies or imagery. Parent `skills/REPORT.md` remains the installation/security/license audit record.

## Direction in five lines

**Product:** a local editor turning models, shapes, text and images into bitmap/pixel/glyph animation and integrations.

**Character:** precise, calm, capable, with immediate controls rather than theatrical minimalism.

**World:** digital print and animation workbench, not a SaaS dashboard or a terminal simulator.

**Moments:** a no-file first result; a deliberate renderer/palette; confidently chosen output.

**Signature:** one spacious specimen stage, an aligned task inspector, and a small static pixel-derived maker's mark. The user's actual work supplies the color and motion.

## Paper alternatives and critique

These diagrams are **paper layout prototypes**, not screenshots, rendered mockups or completed UI. Compare the same existing Cube/model and settings in eventual browser review; do not improve one option by silently changing camera/scale/fade defaults.

### A — flat accordion workbench (rejected)

```text
BitmapForge    Undo Redo             Save Load Help Export
+--------------------------+-----------------------------+
| Source                   |                             |
| Palette / presets        |             stage           |
| Look                     |                             |
| Motion                   |                             |
| Pose / light             |                             |
| Export                   |                             |
+--------------------------+-----------------------------+
```

Low migration cost; all headings visible. But six independently expanded sections retain scroll competition. Palette browsing still displaces the renderer. A prettier version of the existing rail does not resolve the audited IA defect. Moving every section into identical cards is a cosmetic reskin, not an answer.

### B — dual-rail studio (rejected)

```text
BitmapForge  Project     Undo Redo               Help Export
+-------------+-------------------------+------------------+
| sources     |                         | renderer         |
| assets      |          stage          | palette          |
| imagined    |                         | motion / pose    |
| scene tree  |                         |                  |
+-------------+-------------------------+------------------+
```

Looks familiar beside Rive/Figma, but invents an asset/scene hierarchy, shrinks the output-affecting canvas at 1024px, and makes phone adaptation worse. Reference resemblance is not product fit. Reject floating glass islands and a detached bottom tool dock too: they add occlusion without an existing canvas tool to justify them.

### C — task workbench (chosen)

```text
pixel mark BitmapForge | Undo Redo        Save Load Help Export
+-------------------------------+---------------------------+
| Source Look Motion Export     |                           |
| Look                          |                           |
| Render mode [ASCII       v]   |           stage           |
| relevant detail / ramp        |                           |
| Palette strip                 |                           |
|   Browse palettes [collapsed] |                           |
| Tone & background [disclosed] |                           |
| Texture effects [disclosed]   | contextual source metadata|
+-------------------------------+---------------------------+
```

One 340px left inspector, one stable preview, commands in a true header. Four freely selectable task buttons, Export accessible globally. No wizard or “step complete” fiction. Phone default becomes a bounded bottom modal, not a 360px left slab; its visible backdrop artwork is reference only. Short-height fallback is a usable full-height form. Tradeoff: switching tasks can hide dependencies; mitigate with clear group names, persistent task state and the current palette strip, not a second mini inspector.

### Skill-driven revision / generic-choice critique

The initial inherited near-black/chartreuse suggestion would be indistinguishable from a fashionable coding dashboard. Revised to cool graphite / restrained pale cobalt from the parent's brief. Do not spend identity on neon outlines, huge tracked headings, cream/serif/clay, repeated rounded cards, or monospace metadata everywhere. Keep moderate radii only where controls/overlays need edges. Selection includes a check or structural marker; focus remains a separate outline. Do not add a looping pixel animation to prove the maker's mark is distinctive. The memorable element is output, not the command bar.

Redline severity: **heavy** issue in task hierarchy, first-source invitation and mobile preview/reference tradeoff; **light** issue in typography, selected semantics and control consistency; **no redesign mandate** for source engines, export builders, store/history, Radix/dnd-kit or status transaction machinery. Correct existing strengths rather than replacing them for novelty.

## Findings that constrain the plan

1. Palette presets apply **only colors**; legacy PresetGallery is not mounted. “Save palette” is truthful; full-look presets are out of scope.
2. `useAutoSave` does nothing. Save/Load are local `.bitmapforge` operations, not cloud persistence. Image bytes are not saved in project payloads; do not promise full image restoration or silently change schema.
3. `useExportController` belongs once in Layout; ExportPanel is props-only. Separating project controls must not create a second hook owner.
4. Main PreviewCanvas owns one SceneManager and targeted subscriptions. Its mounting, lifecycle effects, dimensions-to-engine logic and async source ownership stay intact. A gizmo canvas is a separate existing surface, not a duplicate main preview.
5. Canvas size affects captured export workload. More visual space is not a free performance improvement; preserve original bounded 384×320 full-loop fixture and 90-second export budgets.
6. Current mode changes can clamp cell size through store setters (e.g. ASCII to 10); do not “repair” values to UI slider minima or reset settings on navigation.
7. Palette pointerdown/blur/cancel and revision handling are functional protections. Compact presets and task switching must specify cancellation **before** focus/visibility changes, not rely on unmount cleanup.
8. Existing notice host is stable, with error precedence, recognized progress and Help suspension. Styling may not replace it with duplicate toasts or suppress useful text.
9. Baseline phone dialog focus restoration, keyboard drag Escape ownership, committed save callback publication and stale teardown guards already have acceptance. New layout must adapt navigation selectors, not drop assertions.

## Bounded audit revisions and evidence boundary

The independent [plan audit](plan-audit.md) accepted the selected direction/four-owner architecture in principle and required R1–R3. Version 1.1 adds exact short-stage/sibling-Help visible-rectangle geometry (including offsetTop emulation), a deliberately simple reset-to-start task-scroll policy with postcommit reveal precedence, and the finite nine-ID downloaded-artifact ledger. [Numbered dispositions](plan-resolutions.md) map each repair to its contracts and remaining execution gates. No new reference/aesthetic direction, engine scope, dependencies or real-keyboard claim is introduced. Newly inspected export source confirms GIF selection is not download-animation evidence, Embed unit tests are not supported runtime evidence, and the existing ASCII React/Web Component tests call builders rather than redesigned UI dispatch. Those gaps are assigned explicitly to bounded new A-owned browser cases, not claimed already covered.

The inspected isolated export config uses a 180,000ms timeout despite the parent’s required final 90-second policy; implementation-plan §6.1 records the discrepancy, pins the final 90,000ms built evidence gate and does not waive existing full181 CSS/384×320 or quality checks. These are plan revisions only, awaiting independent reapproval before code.

## Evidence gaps and finite next gate

Independent plan audit must challenge the exact contracts in the other documents before implementation. No app implementation or new acceptance run was performed by this author. Existing root 782 / embed 23 / decode 66 / CLI 10 plus one optional skip are parent checkpoint counts, not newly executed results here. Final implementation requires actual browser screenshots, keyboard/zoom/touch emulation, contrast on rendered states, every retained behavior test, meaningful downloaded artifacts and truthful reporting of unavailable manual AT/Safari/physical-device evidence. No numerical speed or accessibility-conformance claim is made from static design alone.
