# Workspace needs exposed by Borzoi

Status: released in 1.0.7. Each component is still reviewed one at a time. Diagram connect and the node menu shipped in 1.0.6.

Borzoi previously bypassed the library with application CSS. This repair removes that layer. This register makes every need visible in the library rather than silently recreating a design system in its consumer.

## Removed; not promoted into the library

- The invented square B brand mark. Borzoi now uses text and existing icons.
- The Unicode plus character. Add actions use the existing `i-plus` icon.
- First/last diagram node accent coloring based only on array position.
- Diagram minimum-node-width overrides.
- Sidebar, button, heading, input border and focus overrides.
- App-specific letter spacing, dialog opacity and visual dimensions.

## Existing components reused without changing their styles

`desk`, `window`, `page`, `side`, `side__group`, `side__toggle`, `side__items`, `toolbar`, `toolbar__spacer`, `btn`, `icon`, `input`, `field`, `form`, `actions`, `panel`, `segmented`, typography roles, and `diagram`.

The original `ui.css`, `LAWS.bend` and `SPEC.bend` are unchanged.

## Additions in the library

Import `bend-ui/workspace` (or `workspace.js` from a source snapshot). It loads the base library and the opt-in `workspace.css`. There are no consumer CSS rules.

| Need | Public composition / adapter | Token source | Checks |
| --- | --- | --- | --- |
| Accessible rename/import/history dialogs | Native `dialog.dialog`, `dialog__header`, `dialog__body`; `createDialog(root, {title, body, close})` | Dialog padding, viewport gap, backdrop percentage in TOKENS | Scale and translucent-backdrop laws; keyboard/browser validation |
| Persistent error and ordinary feedback | `createFeedback(root).show(text, {error, persistent})`, `feedback`, `status-text`, `setStatusTone` | Feedback padding and duration | Universal error/persistence laws; reading-duration law |
| Truncating navigation labels | `breadcrumbs`, `breadcrumbs__item` | Breadcrumb gap | Scale law; narrow viewport validation |
| Source and preview composition | `workbench`, its header/title/actions/panes/pane/footer; `source-editor`, `source-editor__field`; `configureSourceEditor(textarea)` | Workspace spacing and minimum source lines | Scale, narrow-padding, source-room and pane-direction laws |
| Scrollable preview with intrinsic diagram width | `preview`, `preview__viewport`, `preview__content`, `preview__footer` | Preview min/max heights | Grid and ordered-bounds law; browser scroll checks |
| Readable revision snapshots | `revision-list`, `revision-list__header`, `revision-list__source` | Snapshot max height | Positive grid-bound law; restore regression tests in Borzoi |
| Sidebar utility area and responsive interaction | `side__footer`, `side__caption`; `createSidebar(side, toggle)` | Existing spacing and breakpoint | Universal inside/desktop-dismissal laws; browser navigation checks |
| Connect existing nodes by dragging (Borzoi turns it into `A --> B` in the source) | `mountDiagram(el, data, { isValidConnection, onConnect })`; `.diagram__handle` (a `.dot`), the drag line is a `.diagram__wires` path | Existing `--dot-size`, wire and arrowhead | Browser checks in the step 1 and step 2 review artifacts; the app's own rules (no loop, no repeated arrow) are Borzoi laws |
| Add a node below, connect or rename from a menu on the node | `mountDiagram(el, data, { nodeMenu })`; the node is a `.dropdown` with the lib's `.menu`/`.menu__item`; `.diagram__open` | Existing focus, menu and layer tokens | Browser checks in the node menu review artifact |
| Manual layout: place nodes anywhere, positions kept by the app | `mountDiagram(el, data, { positions, onNodeMove })`; `.diagram--free`, `.is-moving` | Existing spacing, layer and shadow tokens | Browser checks in the editing flow review artifact |

`WORKSPACE.bend` owns feedback tone, timeout policy, pane direction and outside-click dismissal. `workspace.js` adapts these decisions to DOM and browser events. `TOKENS.bend` owns new visual values, exposed by `ui.js`. `workspace.css` adds named compositions; it does not restyle base components or app IDs. `WORKSPACE_LAWS.bend` and `WORKSPACE_PROOF.bend` add 15 laws through the existing proof entry point.

## Review artifact

Build `bend docs/workspace.html -o /tmp/bend-workspace-preview` to inspect the actual components. The Borzoi local build includes the same artifact at `/components/`. It demonstrates feedback, a dialog, editor/preview composition and revision snapshots without app CSS.

These additions are a concrete proposal for owner review, not a declaration of design approval. No existing law has been weakened. Formal proofs cover the stated token/policy properties; they do not prove browser rendering or absence of all bugs. Borzoi separately rejects app CSS, inline styles and unregistered visual classes, and verifies the library snapshot against a recorded source hash manifest.
