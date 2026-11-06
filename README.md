# Bend-UI

A design system in [Bend](https://github.com/bendlang/bend). Visual values live in `TOKENS.bend` and rules in `LAWS.bend`. A padding off the scale, a badly nested radius or an icon that doesn't fit **does not compile**: `bend PROOF.bend` fails.

## Install

```bash
bun add github:isabellaherman/Bend-UI
```

## Update

```bash
bun update bend-ui
```

To pin a version: `bun add github:isabellaherman/Bend-UI#v0.3.0`.

## Use

```js
// main.js
import "bend-ui";   // Bend tokens + components + icons
```

```html
<script type="module" src="./main.js"></script>

<button class="btn btn--primary">
  <svg class="icon"><use href="#i-scale"/></svg>
  Create LAW
</button>
```

The project needs Bend's loader in `bunfig.toml`, pointing at a clone of [bendlang/bend](https://github.com/bendlang/bend):

```toml
[serve.static]
plugins = ["../bend/bend2/main.ts"]
```

## Theme

A theme changes only color and font. Space, radius and sizes stay bound by the laws.

```js
import { theme } from "bend-ui";
import jaro from "./jaro.woff2";

theme({
  accent: "#ffd21f",
  accentFg: "#02090a",
  fontDisplay: { family: "Jaro", src: jaro },
});
```

## Segmented

A `.segmented` group switches on click by itself and fires `change` (the button is in `event.detail`). Add `data-manual` to the group to handle `aria-pressed` yourself.

## Page, doc and pair

```html
<main class="page">
  <div class="doc doc--stack">            <!-- or doc--split doc--wide, or plain doc -->
    <div class="doc__columns"><span class="meta">Left</span><span class="meta">Right</span></div>
    <div class="pair">
      <div class="block">…</div>
      <div class="block pair__aside">…</div>   <!-- empty: never shows -->
    </div>
  </div>
</main>
```

A plain `doc` shows only the blocks; `doc--stack` shows each aside under its block; `doc--split` beside it (a stack on narrow screens). Every block starts at `block_min_lines()` lines; set `--block-min-lines` on a block to change it.

## Dropdown

A button that opens a menu. `ui.js` handles it and fires `pick` on the `.dropdown` (the item is in `event.detail`). Opening or picking doesn't move the caret, so it works on the text being edited.

```html
<div class="dropdown">
  <button class="btn btn--ghost" aria-haspopup="menu" aria-expanded="false">
    <svg class="icon"><use href="#i-pilcrow"/></svg><span>Text</span>
    <svg class="icon icon--sm"><use href="#i-chevron-down"/></svg>
  </button>
  <div class="menu" role="menu" hidden>
    <button class="menu__item" role="menuitemradio" aria-checked="false">
      <svg class="icon"><use href="#i-heading-1"/></svg><span>Title</span>
      <svg class="icon icon--sm menu__check"><use href="#i-check"/></svg>
    </button>
  </div>
</div>
```

`menu--end` aligns the menu to the right edge of the button.

## Responsive

Below `breakpoint()` in `TOKENS.bend` (720px), `ui.js` sets `<html data-narrow>`, and the components adapt: the window fills the screen, the side bar becomes a drawer. CSS can't read variables in media queries, so the breakpoint lives in Bend and nowhere else.

| Class | |
|---|---|
| `hide-narrow` | hidden on narrow screens |
| `only-narrow` | shown only on narrow screens |

## Agent

An optional face that opens into round options. The motion is in `MOTION.bend`; `agent.js` only draws.

```js
import { mountAgent } from "bend-ui/agent";

const agent = mountAgent(document.getElementById("agent"), {
  size: "lg",   // "lg" opens as a fan; "sm" opens as a row, for a toolbar
  open: "hover", // optional: a mouse opens it by hovering (default "click"); touch still taps
  items: [
    { id: "min", icon: "minimize-2", label: "Minimize" },
    { id: "a", mark: "Ab", label: "Option A", ring: true },
  ],
  onPick: (id) => agent.setItem(id, { status: "busy" }),
});
```

Brand marks for AI options are in `brand/` (`claude.webp`, `openai.svg`); see `brand/README.md`.

`setItem(id, { status, label, pressed, disabled })`, `open()`, `close()`, `spin()`, `shake()`, `lookAtEl(el)`, `ask(true)`, `flash(id)`. `flyBetween(rect, toAgent)` moves the face from one agent to another.

## What's included

| | |
|---|---|
| Components | `page`, `doc`, `pair`, `form`, `link`, `dropdown` + `menu`, `btn` (`--primary`, `--ghost`, `--sm`, `--lg`, `--icon`, `--round`, `:disabled`, `[aria-current]`), `input`, `field`, `segmented` (`--icons`), `panel`, `toolbar`, `tag`, `kbd`, `icon`, `rows`/`row`, `art`, `dot`, `status-ring`, `block`, `prose`, `side`, `window`, `agent` |
| Text | `display`, `heading`, `lead`, `text`, `list`, `meta`, `mono` |
| Icons | plus, file-text, scale, triangle-alert, circle-check, x, chevron-down, list, code, wand-sparkles, search, panel-left, book-open, lock, minimize-2, maximize-2, minimize, maximize, text, rows-2, columns-2, heading-1, pilcrow, check |
| Tokens | space, radius, type, controls, icons, art, status, side bar, window, agent, motion, color (light theme) |

See everything: `bun run docs`.

## Rules (laws)

| Law | Guarantees |
|---|---|
| `*_padding_in_scale` | Space only from the scale: 2, 4, 8, 12, 16, 24, 32, 48, 64 |
| `btn_height_in_scale` | Control height: 24, 32 or 36 |
| `icon_button_*_fits` | Icon-only (and round) button: icon + 2 × padding = height |
| `segmented_radius_nested` | Outer radius = inner radius + padding |
| `inside_less_than_between` | Space inside a group < space between groups |
| `dot_size_in_scale`, `ring_*_in_scale` | Status dot and ring on the space scale |
| `side_rail_fits` | Closed side bar = control + 2 × padding |
| `side_width_on_grid`, `window_max_on_grid`, `agent_lg_on_grid` | On the 4 grid |
| `window_margin_in_scale` | Window margin on the space scale |
| `agent_sm_in_scale` | The toolbar agent is a control height |

Try it: change `btn_padding_x` to `10` in `TOKENS.bend` and run `bun run check`.

## Contributing

Read [`AGENTS.md`](AGENTS.md). `LAWS.bend` and `SPEC.bend` change only with the repo owner's approval.
