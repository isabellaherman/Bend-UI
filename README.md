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

To pin a version: `bun add github:isabellaherman/Bend-UI#v1.0.0`.

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

```html
<div class="segmented">
  <button aria-pressed="true">One</button>
  <button aria-pressed="false">Two</button>
</div>
```

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

## Thread and follow

A line that ties each block of a `.pair` to its aside while work runs (like writing a law for a sentence), and a page that follows the work.

```js
import { createThread, openBlock, formBlock } from "bend-ui/thread";
import { createFollow } from "bend-ui/follow";

const thread = createThread(doc);
const follow = createFollow(page, { button: followButton });   // <button class="btn btn--sm window__follow" hidden>

await thread.begin(pairs);                       // the queue cascades in
for (const [i, pair] of pairs.entries()) {
  const aside = pair.querySelector(".pair__aside");
  follow.to(pair);
  await Promise.all([openBlock(aside, html), thread.start(i)]);   // working: the line creeps, the node fills
  /* … the work … */
  await Promise.all([formBlock(aside, result, "block--code"), thread.done(i, ok)]);
}
follow.stop();
await thread.end();       // one glint
await thread.release();   // the blocks get their dots back
```

Following pauses when the person scrolls by hand; the button brings it back.

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

`menu--end` aligns the menu to the right edge of the button; `menu--up` opens it upward.

## Chat

A conversation that flows, with the composer fixed under the page. The agent's message is `.msg` (put `.prose` inside for Markdown); the person's is `.msg--me`.

```html
<div class="window__main">
  <main class="page"><div class="chat">
    <div class="msg msg--me">Why did this law fail?</div>
    <div class="msg">It doesn't say how much a spell costs.</div>
  </div></main>
  <form class="composer"><div class="composer__box">
    <textarea class="input" rows="1" placeholder="Message the agent…"></textarea>
    <button class="btn btn--primary btn--lg" type="submit">Send</button>
  </div></form>
</div>
```

Or one field with the send button inside, and quiet controls under it:

```html
<form class="composer">
  <div class="composer__box"><div class="composer__field">
    <textarea class="composer__text" rows="1" placeholder="Message the agent…"></textarea>
    <button class="btn btn--primary btn--sm btn--icon btn--round composer__send" type="submit" aria-label="Send" disabled><svg class="icon"><use href="#i-arrow-up"/></svg></button>
  </div></div>
  <div class="composer__bar">…dropdowns with .menu--up…</div>
</form>
```

The agent's reply with its face: `<div class="msg msg--face"><div class="msg__face"><div></div></div><div>…</div></div>` (mount an `sm` agent in the inner div). Your new message gets `is-arriving`; a streamed answer puts each word in a `.msg__word`.

## Keys

Shortcuts you can check. Your keymap is Bend, so a key that clashes, a key the browser keeps, or a plain key that would fire while someone types **does not compile**.

```python
# KEYS.bend in your app
import Base
import bend-ui/SPEC.bend as Spec   # (path to the lib)
import bend-ui/KEYS.bend as K

def keymap() -> List<&2, Spec.Shortcut>:
  [Spec.Shortcut{0, 1, "k", "chat.focus"}]          # scope 0 (the app), mods 1 (⌘/Ctrl), "k"

# in your LAWS.bend
law my_keys_never_clash:
  {Spec.key_clashes(K.with_lib(App.keymap())) == 0 : U32}
law my_keys_not_reserved:
  {Spec.reserved_keys(App.keymap()) == 0 : U32}
```

```js
import { createKeys, keyLabel } from "bend-ui/keys";
import App from "./KEYS.bend";
createKeys(App.keymap(), { "chat.focus": () => input.focus() });
keyLabel(1, "k");   // "⌘K" on a Mac, "Ctrl+K" elsewhere: show it in a .kbd
```

- **Exact**: Shift+K is not K, ⌘K is not K.
- **Scopes**: 0 the app (always on), 1 an open menu, 2 an open agent. A key the app takes clashes with every scope.
- **Typing**: in a field, only keys with ⌘/Ctrl or Alt run; a plain key types its letter (WCAG 2.1.4).
- **Reserved**: ⌘/Ctrl + W, T, N, Q, L, R stay the browser's.

The meaning is `SPEC.bend`, the lib's keys and `find` are `KEYS.bend`; `keys.js` only reads the keyboard.

## Type: one ladder

One ladder, biggest to smallest: `display` > `heading` > `section-title` > `group-title` > `text` > `item-title` > `detail` (muted). Pick the step, not the size: each sets size, weight and color from the type scale (`role_*` in `TOKENS.bend`).

Prose takes the same ladder: its body is `text`'s size, and its `h1`, `h2`, `h3` are `section-title`, `group-title`, `item-title`. `.meta` is `.detail` under an older name.

```html
<div class="outline">
  <h2 class="section-title">What the chat may do</h2>
  <div class="outline__group">
    <h3 class="group-title">Tools</h3>
    <div class="outline__kids">
      <div class="outline__item">
        <div class="outline__row"><i class="dot dot--ok"></i><span class="item-title">Read</span></div>
        <p class="detail">Looks at a file. Changes nothing.</p>
      </div>
      <div class="outline__item is-off">
        <div class="outline__row"><i class="dot"></i><span class="item-title">Write</span></div>
        <p class="detail">Not given to the chat.</p>
      </div>
    </div>
  </div>
</div>
```

A group's children sit inside it (`outline__kids`), on a hairline. An item with `is-off` is muted, so the ones that are on stand out.

## Page head and sections

How a page is laid out: its head (the title and what it is), then sections, each a title over its content, with a hairline between one section and the next.

```html
<header class="page-head"><h1 class="heading">Spells</h1><p class="lead">Every spell the player can cast.</p></header>
<section class="section">
  <h2 class="section-title">Fire</h2>
  <div class="section__body">…</div>
</section>
```

`.separator` is the hairline alone (`<hr class="separator">`, like shadcn's Separator). `.divided` puts it between the items of a list (like Tailwind's `divide-y`).

## Diagram

Nodes and the arrows between them, read top to bottom. `DIAGRAM.bend` places the nodes (a node's row is the longest path to it, so every arrow goes down); `diagram.js` only draws.

```js
import { mountDiagram } from "bend-ui/diagram";
mountDiagram(el, {
  nodes: [{ label: "Title" }, { label: "Play", tone: "accent", tag: "loop" }],
  edges: [{ from: 0, to: 1, label: "Start" }],
});
```

A node's `tone` is `accent`, `law`, `draft`, `conflict`, or none; `tag` is a short word on it. Two looks: a colored border (default), or add `diagram--soft` to `el` for a soft fill with the tone in the text. Arrows with the same ends become one line, their labels joined.

## Chart

Pie, bars, line and area: one mark each, no card around them. `CHART.bend` places every mark (a slice's turns, the grid's step, where a value sits, the curve); `chart.js` only draws. The motion is `MOTION.bend` and the duration tokens, the same the thread and the agent use.

```js
import { mountPie, mountBars, mountLine, mountArea } from "bend-ui/chart";
mountPie(el, [{ label: "Fire", value: 46 }, { label: "Air", value: 10 }]);
const bars = mountBars(el, [{ label: "Mon", value: 42 }]);
bars.replay();   // the entrance again; also draw() and destroy()
```

A pie takes up to 4 slices; line and area take the same points as bars. Colors are tones of the accent (`--chart-1` to `--chart-4`), so `theme({ accent })` recolors every chart. A pie takes two looks on `el`: `chart--split` (a gap between slices) and `chart--donut` (a hole). Pointing at a mark keeps it and dims the rest; line and area show the thread's node on the point.

## Disclosure

A section that opens and closes, on the native `<details>` (keyboard and screen readers work as anywhere). Closed unless it has `open`.

```html
<details class="disclosure">
  <summary><svg class="icon icon--sm disclosure__chevron"><use href="#i-chevron-down"/></svg><span class="disclosure__title">Laws</span><span class="meta">5</span></summary>
  …
</details>
```

## Syntax

Code in color, on a white ground (Snow): Bend, JS (and TS, JSON), CSS, HTML, shell and TOML. `SYNTAX.bend` cuts the code into pieces; `syntax.js` only draws them. Only color changes, so a box keeps its size.

```js
import { highlight, toHtml } from "bend-ui/syntax";
highlight(document.querySelector(".prose pre"));           // Bend, the default (or a .block--code)
highlight(document.querySelector(".prose pre"), "html");   // another language
```

```html
<pre data-lang="css"><code>.card { padding: var(--space-4); }</code></pre>
```

## Responsive

Below `breakpoint()` in `TOKENS.bend` (720px), `ui.js` sets `<html data-narrow>`, and the components adapt: the window fills the screen, the side bar becomes a drawer. CSS can't read variables in media queries, so the breakpoint lives in Bend and nowhere else.

| Class | |
|---|---|
| `hide-narrow` | hidden on narrow screens |
| `only-narrow` | shown only on narrow screens |

```html
<span class="tag hide-narrow">wide</span>
<span class="tag only-narrow">narrow</span>
```

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

## Components

The markup of each piece. The docs show these same snippets on each piece's page.

### Tokens

Every value is a token: use `var(--…)`, never a loose number.

```css
.card {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
}
```

### Icons

```html
<svg class="icon"><use href="#i-plus"/></svg>
```

### Button

```html
<button class="btn">Cancel</button>
<button class="btn btn--primary">Save</button>
<button class="btn btn--ghost btn--sm btn--icon"><svg class="icon"><use href="#i-plus"/></svg></button>
```

### Input and field

```html
<label class="field">
  <span class="field__label">Max</span>
  <input class="input input--mono" value="10">
</label>
```

### Form

```html
<form class="form">
  <label class="field"><span class="field__label">Name</span><input class="input"></label>
  <div class="actions">
    <button class="btn btn--ghost" type="button">Cancel</button>
    <button class="btn btn--primary">Save</button>
  </div>
</form>
```

### Tag and kbd

```html
<span class="tag tag--law">Law</span>
<span class="tag tag--mono">L-012</span>
<span class="kbd">⌘K</span>
```

### Dot

```html
<span class="dot dot--ok"></span>
```

### Status ring

```html
<button class="btn btn--lg btn--icon btn--round" data-status="busy">
  <svg class="status-ring" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" pathLength="100"/></svg>
  <span class="agent__mark">Ab</span>
</button>
```

### Link

```html
<a class="link" href="…">Bend-UI</a>
```

### Prose

```html
<article class="prose">
  <h1>Spells</h1>
  <p>Every spell costs at least 1 <code>mana</code>.</p>
</article>
```

### Rows

```html
<ol class="rows">
  <li><a class="row" href="…"><span class="row__lead">#0.2.0</span><span class="row__title">Title</span><span class="row__meta">12 nov 2026</span></a></li>
</ol>
```

### Art

```html
<img class="art art--sm" src="…" alt="">
```

### Panel

```html
<div class="panel">
  <div class="panel__header">Header</div>
  <div class="panel__body">Body</div>
</div>
```

### Toolbar

```html
<div class="toolbar">
  <button class="btn btn--ghost btn--sm">Item</button>
  <div class="toolbar__spacer"></div>
  <button class="btn btn--primary btn--sm">Button</button>
</div>
```

### Side bar

```html
<aside class="side is-open">
  <div class="side__head"><button class="btn btn--ghost btn--icon" data-side-toggle><svg class="icon"><use href="#i-panel-left"/></svg></button></div>
  <button class="btn btn--ghost" aria-current="page"><svg class="icon"><use href="#i-file-text"/></svg><span class="side__text">Item</span></button>
</aside>
```

### Window

```html
<body class="desk">
  <div class="window">
    <aside class="side">…</aside>
    <div class="window__main">
      <div class="toolbar">…</div>
      <main class="page">…</main>
      <p class="meta window__foot">Made with <a class="link" href="…">Bend-UI</a></p>
      <p class="meta window__foot window__foot--end"><span class="tag tag--mono">v1.0.3</span></p>
    </div>
  </div>
</body>
```

### Block

```html
<div class="block">
  <div class="block__slot"><span class="dot dot--ok"></span></div>
  <div class="block__text">Mana never goes above 10</div>
</div>
```

## What's included

| | |
|---|---|
| Components | `page`, `doc`, `pair`, `thread` + `node`, `follow`, `chat` + `msg` + `composer`, `disclosure`, `form`, `link`, `dropdown` + `menu`, `btn` (`--primary`, `--ghost`, `--sm`, `--lg`, `--icon`, `--round`, `:disabled`, `[aria-current]`), `input`, `field`, `segmented` (`--icons`), `panel`, `toolbar`, `tag`, `kbd`, `icon`, `rows`/`row`, `art`, `dot`, `status-ring`, `block`, `prose`, `side`, `window`, `agent`, `diagram`, `chart` |
| Text | `display`, `heading`, `lead`, `text`, `list`, `meta`, `mono` |
| Icons | plus, arrow-up, shield, github, file-text, scale, triangle-alert, circle-check, x, chevron-down, list, code, wand-sparkles, search, panel-left, book-open, lock, minimize-2, maximize-2, minimize, maximize, text, rows-2, columns-2, heading-1, pilcrow, check |
| Tokens | space, radius, type, controls, icons, art, status, side bar, window, agent, chat, chart, motion, color (light theme) |

See everything: https://isabellaherman.github.io/Bend-UI/ (or `bun run docs`). After changing the docs, `bun run site` rebuilds `site/`; pushing it publishes the page.

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
| `lib_keys_never_clash`, `lib_keys_not_reserved` | The lib's keys never clash and take no key the browser keeps |
| `shift_is_not_plain`, `mod_is_not_plain` | Modifiers are exact, for every key |
| `plain_key_waits_while_typing`, `shift_key_waits_while_typing`, `mod_key_runs_while_typing` | While typing, only ⌘/Ctrl or Alt keys run |
| `app_scope_overlaps_all` | An app key clashes with any scope's key |

Try it: change `btn_padding_x` to `10` in `TOKENS.bend` and run `bun run check`.

## Contributing

Read [`AGENTS.md`](AGENTS.md). `LAWS.bend` and `SPEC.bend` change only with the repo owner's approval.
