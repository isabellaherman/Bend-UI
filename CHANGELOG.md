# Changelog

## 1.0.7 (2026-11-08)

- **Workspace (opt-in)**: `import "bend-ui/workspace"` adds dialog (`createDialog`), feedback (`createFeedback`, `setStatusTone`), breadcrumbs, the source/preview workbench (`configureSourceEditor`), the revision list, and the sidebar footer (`createSidebar`). Existing components keep their definitions and appearance.
- Every new visual value is a token in `TOKENS.bend`, exposed by `ui.js`. Feedback tone and timing, pane direction and sidebar dismissal are decided in `WORKSPACE.bend`.
- 15 extension laws in `WORKSPACE_LAWS.bend`, proved through `PROOF.bend`. `LAWS.bend` and `SPEC.bend` are unchanged.
- Docs: the Borzoi needs register (`docs/BORZOI-NEEDS.md`) and the workspace review page (`docs/workspace.html`). Each component will be reviewed one at a time.

## 1.0.6 (2026-11-08)

- **Diagram: connect**: `mountDiagram(el, data, { isValidConnection, onConnect })`, React Flow's names. Each node gets a handle (a `.dot`) at the middle of its bottom edge, shown on hover; drag it and a straight arrow (the diagram's own wire) follows the pointer. Let go on another node and, if `isValidConnection({ source, target })` allows it, `onConnect({ source, target })` is called (node indexes). The diagram doesn't change itself: the app adds the edge and redraws.
- While dragging, a node `isValidConnection` allows takes the accent border (`.is-target`) and the arrow snaps to where it would enter. Let go anywhere else and the arrow runs back into the handle (`duration_enter`, `MOTION.ease_out`).
- Drawn again in the same element, the nodes glide from where they were and new arrows run in from their start (`duration_connect`, `MOTION.ease_in_out`, chart.js's `tween`). Nodes are matched by label; reduced motion skips it.
- **Diagram: node menu**: `mountDiagram(el, data, { nodeMenu: (i) => [{ label, disabled, onSelect }] })`. The node becomes a `.dropdown`: its label is the button (`.diagram__open`, covering the whole node like Bootstrap's stretched link) that opens the lib's `.menu`; picking an item calls its `onSelect`. While a menu is open its row rises above the rows below.
- `.diagram__node` is now `position: relative` (the handle's and the menu's anchor); nothing on screen changes. New: `.diagram__handle`, `.is-target`, `.diagram__open`. No new token, law or motion curve.

## 1.0.5 (2026-11-08)

- **Chart** (`CHART.bend`, `chart.js`): pie, bars, line and area, one mark each. Bend places every mark; JS only draws. Colors are four tones of the accent (`chart_tone_1` to `chart_tone_4`), so a theme recolors them. The pie takes `.chart--split` and `.chart--donut`.
- Motion, all from the lib: the pie sweeps in (`ease_out`), bars rise one after another on the agent's spring (`MOTION.spring`, `stagger_ms`), the line runs in like the thread with its glow, node and glint, the area rises. Pointing keeps a mark and dims the rest (`chart_dim`); line and area use the thread's `.node`.
- Tokens: `chart_tone_1`…`4`, `chart_hole`, `chart_dim` are new values; `chart_gap`, `chart_lift`, `chart_bar_max`, `chart_bar_gap`, `chart_axis_x`, `chart_axis_y` name values the scale already has. No new law.
- Docs: a Chart page under Components.

## 1.0.3 (2026-11-07)

- **Window foot at the end**: `.window__foot--end` puts a foot at the bottom right, for the app's version (`.tag.tag--mono`). It sits under the dock, not on it.
- No loose values left in `ui.css`: tag, kbd, focus ring and halo, link underline and every layer are tokens (`tag_*`, `kbd_*`, `focus_*`, `underline_*`, `layer_side`, `layer_fly`, `layer_part`, `layer_part_top`). Nothing on screen changes.
- The agent's timing (blink, shake, look, items opening, flash, fly) lives in `MOTION.bend`; `agent.js` only reads it. Nothing on screen changes.

## 1.0.2 (2026-11-07)

- **Diagram** (`DIAGRAM.bend`, `diagram.js`): nodes and arrows read top to bottom; Bend places the nodes, JS only draws. Two looks: a colored border, or `.diagram--soft`.
- **Type: one ladder**: `display` > `heading` > `section-title` > `group-title` > `text` > `item-title` > `detail` (`role_*` tokens). `.prose` takes the same ladder: its body is `text`'s size (13 to 15), its `h1`, `h2`, `h3` are section, group, item. `.meta` is `.detail` under an older name.
- **Page head and sections**: `.page-head`, `.section`, `.section__body`, `.separator`, `.divided`.
- **Syntax in many languages**: Bend, JS (TS, JSON), CSS, HTML, shell, TOML. `highlight(pre, "html")` or `data-lang`; Bend stays the default.
- README: the markup of every piece (Components).
- Docs: every page has the same shape (Examples, Code, Implementation, Laws); Code is the README's own snippets. Type and Hierarchy are one page. A Chat pattern page.

## 1.0.1 (2026-11-06)

- Icon: `github`.
- Docs: a GitHub button in the toolbar opens the repository.

## 1.0.0 (2026-11-06)

The first stable version. Everything in 0.3.9, now with a version you can pin: `bun add github:isabellaherman/Bend-UI#v1.0.0`.

- Docs online: https://isabellaherman.github.io/Bend-UI/

## 0.3.9 (2026-11-06)

- **side bar groups** are closed unless the toggle has `aria-expanded="true"` (before, a toggle without it showed its items).
- Docs: Foundations open, Components closed; animated components first, Agent last.

## 0.3.8 (2026-11-06)

Adds only.

- **disclosure**: a section that opens and closes, on the native `<details>`: `.disclosure`, `.disclosure__title`, `.disclosure__chevron`. Closed unless `[open]`.
- Docs: each page's laws fold into a closed disclosure; examples are labeled with plain names, their class on hover.

## 0.3.7 (2026-11-06)

Adds only.

- **chat__start**: an empty chat, the agent's face and the composer centered.
- **side bar groups**: `side__body` (scrolls), `side__group`, `side__toggle` (opens and closes, `aria-expanded`), `side__chevron`, `side__items` (children line up with the parent's text).
- Token: `agent_xl` (160), the face alone in an empty chat.
- **keys** (`bend-ui/keys`, `KEYS.bend`): shortcuts you can check. `SPEC.bend` says what they mean (exact modifiers, scopes, reserved keys, no plain key while typing); `KEYS.bend` has the lib's keys, `find` and `label`; `keys.js` only reads the keyboard.
- **syntax** (`bend-ui/syntax`, `SYNTAX.bend`): Bend code in color. `SYNTAX.bend` cuts code into pieces (keyword, type, string, number, comment, punctuation, a defined name); `.syntax` on a `.prose pre` or a `.block--code` gives it the Snow ground. Only color changes; the box keeps its size.
- Tokens: `syntax_bg`, `syntax_border`, `syntax_fg`, `syntax_keyword`, `syntax_type`, `syntax_string`, `syntax_number`, `syntax_comment`, `syntax_punct`, `syntax_name` (all 5.7:1 or more on the ground).
- Laws: `lib_keys_never_clash`, `lib_keys_not_reserved`, `shift_is_not_plain`, `mod_is_not_plain`, `plain_key_waits_while_typing`, `shift_key_waits_while_typing`, `mod_key_runs_while_typing`, `app_scope_overlaps_all`.

## 0.3.6 (2026-11-06)

Adds only; nothing that exists changes.

- **chat motion**: `.msg--me.is-arriving` fades in; `.msg__word` (one per streamed word) fades in from a soft blur. Subtle: no travel. Off with reduced motion.
- **msg--face** + **msg__face**: the agent's face beside its reply, centered on the first line; a reply stays as tall as its text.
- **composer__field**: one box with `.composer__text` and a round `.composer__send` inside, as tall as `control_lg`; the button shows when there is text. **composer__bar**: quiet controls under it.
- **menu--up**: a menu that opens upward, for dropdowns near the bottom of the screen.
- Icons: `arrow-up`, `shield`.

## 0.3.5 (2026-11-06)

- **chat**: a conversation that flows, with the composer fixed under it. Not a document: no dots, no progression. `.msg` is the agent's message (plain text; `.prose` inside for Markdown), `.msg--me` the person's, a bubble at the right. `.composer` + `.composer__box`: a `textarea.input` that grows with its text up to `composer_max`, and a button.
- Tokens: `msg_max`, `msg_gap`, `composer_max`.

## 0.3.4 (2026-11-06)

- **thread** (`bend-ui/thread`): a line that ties each block of a `.pair` to its aside while work runs. The queue cascades in node by node; the line runs into the aside and creeps down it while the work runs; the node (the block's dot, grown to `node_size`) fills like a clock; when the work is done it fills with the state color and the line settles; one glint at the end. `openBlock` and `formBlock`: a block opens from nothing; its text dissolves and forms again, line by line. `.thread__reading`: text being read.
- **follow** (`bend-ui/follow`): smart auto-scroll. Keeps the work in view, pauses when the person scrolls by hand, and `.window__follow` brings it back.
- MOTION.bend: `ease_in_out`, `creep`, `thread_reach`, `node_fill`, `follow_top`, `follow_bottom`, `follow_anchor`.
- Tokens: `node_size`, `layer_thread`, `ease_spring`, `duration_enter_ms`, `duration_connect_ms`, `duration_read_ms`, `duration_glint_ms`, `stagger_ms`, `creep_ms`, `blur_form`.
- `.dot` fades (opacity) when a thread takes its place.
- `.block__line`: one line of a block's text, for line-by-line motion.

## 0.3.3 (2026-11-06)

Moved from LawEditor into the lib, so other apps get them too.

- **page** and **doc**: a scrolling area with a column of blocks. `doc--wide`, `doc__head`, `doc__note`, `doc__sub`, `actions`.
- **pair**: a block and its `pair__aside`. Hidden in a plain `doc`, under the block in `doc--stack`, beside it in `doc--split` (with `doc__columns`). An empty aside never shows.
- **block**: a minimum height of `block_min_lines()` lines of text (TOKENS.bend), so every block in a document starts the same size. `block--code`: the text in mono, keeping its line breaks.
- **window__dock** / **toolbar__dock**: where the agent lives; `data-agent="lg" | "sm"` on the window picks one. **window__foot**: bottom left, for a credit line.
- **link** and **form**.
- `[hidden]` always hides.
- The toolbar's primary button stands a little apart from the controls before it.
- Tokens: `segmented_item` (no more loose `6px`), `block_min_lines`, `layer_foot`, `layer_dock`, `layer_menu` (no more loose z-index in the new parts).

## 0.3.2 (2026-11-06)

- **dropdown**: a button that opens a `.menu` of `.menu__item`s (`role="menuitemradio"` shows a check). Same nesting as segmented: 6 = 4 + 2. `ui.js` opens, closes (Escape, click outside), moves with the arrows and fires `pick`; it keeps the caret where the person is typing.
- **segmented--icons**: icon-only segmented buttons.
- **agent**: `open: "hover"` opens on a mouse hover and closes `hover_close()` (MOTION.bend) after the pointer leaves; touch still taps.
- Icons: `text`, `rows-2`, `columns-2`, `heading-1`, `pilcrow`, `check` (Lucide 1.70).

## 0.3.1 (2026-11-06)

- `textarea.input`: a multi-line field with the input's border and focus.
- `.window` is the reference for the side bar drawer on narrow screens.

## 0.3.0 (2026-11-06)

Built for the LawEditor MVP. Everything is in English now.

- **Responsive**: below `breakpoint()` (720px, in `TOKENS.bend`) `ui.js` sets `<html data-narrow>`. Utilities `hide-narrow` and `only-narrow`.
- **segmented** now switches on click: the clicked button becomes pressed and the group fires `change`. Add `data-manual` to handle it yourself.
- **btn**: `--round` (icon-only, round; same sizes, so the fit laws hold), `:disabled`, `--ghost[aria-current="page"]`.
- **dot**: a state beside a line: `--busy`, `--ok`, `--warn`, `--error`.
- **status-ring**: a state around a round element, set with `data-status`: `busy`, `ok`, `hold` (press and hold), `warn`, `error`.
- **block**: one line of a document, with a slot for a dot and an output under the text.
- **prose**: rendered Markdown.
- **side**: side bar. A rail of icons when closed, icon + label when open, a drawer on narrow screens.
- **window**: the app as a framed window on wide screens (`.desk .window`), full screen with `.is-full` or on narrow screens.
- **agent** (opt-in, `bend-ui/agent`): a face that opens into round options. Motion in `MOTION.bend` (sphere, spring, easing, fan and row layouts).
- Brand marks in `brand/`: Claude (`claude.webp`) and OpenAI (`openai.svg`), for agent items. They belong to their owners (see `brand/README.md`).
- Icons: book-open, lock, minimize-2, maximize-2, minimize, maximize (Lucide, ISC).
- Tokens: `dot_size`, `ring_offset`, `ring_width`, `side_padding`, `side_rail`, `side_width`, `window_margin`, `window_max`, `breakpoint`, `agent_sm`, `agent_lg`, `duration_slow_ms`, `ease`.
- 9 new laws: dot and ring on the scale, side rail fits, side/window/agent on the 4 grid, window margin on the scale, toolbar agent is a control height. New helper `on_grid` in `SPEC.bend`.

## 0.2.0 (2026-11-05)

Tested on the Dungeon Bend patch notes: the page uses only the lib + layout.

- `theme()`: a theme per project. Changes only color and font; space, radius and sizes stay bound by the laws.
- Theme title font: `--font-display`, with built-in loading (`theme({ fontDisplay: { family, src } })`).
- Text: `.display`, `.heading`, `.lead`, `.text`, `.list`, `.meta`, `.mono`; token `--text-display` (56px).
- Clickable list: `.rows` + `.row` (`__lead`, `__title`, `__meta`).
- Art: `.art` (`--sm`, `--lg`); tokens `--art-sm`, `--art-md`, `--art-lg`.
- Fix: `.btn` used as a link is no longer underlined.

## 0.1.0 (2026-11-05)

- First version, extracted from LawEditor.
- Tokens in `TOKENS.bend`: space (with a 2px hairline), radius, type, controls (24/32/36), icons, light theme color.
- 9 laws: space scale, control heights, icon-only button fit (sm/md/lg), nested radius, proximity.
- Components: btn, input, field, segmented, panel, toolbar, tag, kbd, icon.
- 12 icons (Lucide, ISC).
- `import "bend-ui"` turns everything on.
