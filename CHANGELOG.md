# Changelog

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
