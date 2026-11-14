# Parent visual inspection — P1 foundation

Inspected actual `bf-p1-evidence/desktop-empty.png` (1440×900) and `mobile-settings.png` (390×844). These are working source-app captures, not final widget design or production evidence. Independent functional foundation audit is separate.

## Confirmed visual direction

- Branded command bar, labelled task navigation and quieter continuous inspector make the editor considerably easier to orient than the original open stack.
- Pale-cobalt primary action and pressed-task marker are coherent with graphite surfaces; there are no decorative gradients, fake cloud/project status or ornamental animated chrome.
- Empty-stage action grid truthfully exposes all four source types. The sample route is secondary. The stage remains the dominant surface.
- Phone content is now a bottom modal, leaving a substantial dimmed artwork-reference area above. That area is correctly inert, not advertised as simultaneously editable.

## Integration redlines, not changes to accepted APIs

1. The full-width **Collapse settings** row still gives a low-frequency workspace mechanic more visual weight than it deserves. In P3 prefer a compact labelled/icon button adjacent to inspector context, maintaining its full 44px hit target, accessible name, exact collapse/focus behavior and no extra state. Do not redesign the core shell solely for this refinement.
2. The old source-type pill strip has cramped/low-contrast small labels and a very tall dropzone. B owns this transitional widget work: apply the shared 44px choice/label/readable field system, keep source types freely accessible, and make loaded metadata compact. No darkening essentials for aesthetics.
3. Top mobile header commands remain readable in two rows. Do not hide Save/Load/Help or shrink targets to make a screenshot emptier. The dimmed empty-state headline clipped by the modal is expected occluded background, not a missing active-modal control.
4. Actual loaded-artwork/Look/Motion/Export and open-picker captures are still required before aesthetic acceptance. Do not declare success from an attractive empty screen or inflate model scale/camera framing for a marketing shot.
5. Final widgets should use aligned labelled rows and meaningful separation, not repeat large card boxes or generic equal-weight option walls. Distinctiveness comes from the pixel mark, actual palettes/renderers/output and careful craft, not a second accent/font/decorative animation.

No application code edited for this inspection. All pre-blur, lifetime, parent focus/portal and status invariants remain mandatory.
