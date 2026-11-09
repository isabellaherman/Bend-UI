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

Motion: the choice moves. `.segmented--slide` puts a thumb behind the chosen item that travels to the next one (`duration_enter`, `ease_in_out`); `data-motion="stretch"` leads with the edge you went toward, `data-motion="spring"` overshoots a little and settles (`ease_spring`). `.segmented--extend` is for icon items: the chosen one also shows its name, and the thumb rides it as it opens. The text changes color in the thumb's time. Call `initSegmented(group)` for a group added later. Shape follows the buttons: `theme({ radius: "rounded" | "pill" | "sharp" })` or `data-radius` on a container.

```html
<div class="segmented segmented--slide" data-motion="stretch" role="group" aria-label="Range">…</div>
<div class="segmented segmented--extend" role="group" aria-label="View">
  <button aria-pressed="true" aria-label="List"><svg class="icon"><use href="#i-list"/></svg><span class="segmented__more" aria-hidden="true"><span>List</span></span></button>
  …
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

## Thread

A line that ties each block of a `.pair` to its aside while work runs (like writing a law for a sentence).

```js
import { createThread, openBlock, formBlock } from "bend-ui/thread";

const thread = createThread(doc);

await thread.begin(pairs);                       // the queue cascades in
for (const [i, pair] of pairs.entries()) {
  const aside = pair.querySelector(".pair__aside");
  await Promise.all([openBlock(aside, html), thread.start(i)]);   // working: the line creeps, the node fills
  /* … the work … */
  await Promise.all([formBlock(aside, result, "block--code"), thread.done(i, ok)]);
}
await thread.end();       // one glint
await thread.release();   // the blocks get their dots back
```

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

Items can carry an icon, a `.tag`, or the check of a `menuitemradio`; `.separator` splits them into groups. Any button can be the trigger, a node of the Diagram too (`nodeMenu`).

```html
<div class="menu" role="menu" hidden>
  <button class="menu__item" role="menuitem"><svg class="icon icon--sm"><use href="#i-plus"/></svg><span>Add node below</span></button>
  <hr class="separator">
  <button class="menu__item" role="menuitemradio" aria-checked="true">
    <svg class="icon icon--sm"></svg><span><span class="tag tag--success">Green</span></span>
    <svg class="icon icon--sm menu__check"><use href="#i-check"/></svg>
  </button>
  <hr class="separator">
  <button class="menu__item" role="menuitem"><svg class="icon icon--sm"><use href="#i-x"/></svg><span>Delete node</span></button>
</div>
```

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
        <div class="outline__row"><i class="dot dot--success"></i><span class="item-title">Read</span></div>
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

A node's `tone` is `accent`, `success`, `warning`, `danger`, or none (neutral); `tag` is a short word on it. Two looks: a colored border (default), or add `diagram--soft` to `el` for a soft fill with the tone in the text. Arrows with the same ends become one line, their labels joined.

Connect (optional): pass `{ isValidConnection, onConnect }` as a third argument. Drag the dot under a node onto another node; both get `{ source, target }` (node indexes). The diagram doesn't change itself: add the edge to your data and draw again in the same element; the nodes glide to their new places and the new arrow runs in.

```js
mountDiagram(el, data, {
  isValidConnection: ({ source, target }) => !hasEdge(source, target),
  onConnect: ({ source, target }) => { data.edges.push({ from: source, to: target }); redraw(); },
});
```

Node menu (optional): pass `nodeMenu: (i) => [elements]`. The node becomes the trigger of a Dropdown menu: clicking it opens the lib's `.menu` holding those elements, built as in Dropdown menu (icons, tags, the check, separators); each item does what its own click says. As with connect, the diagram doesn't change itself.

Free layout (optional): pass `positions: [{ x, y }]` (px from the diagram's corner) and `onNodeMove: (i, { x, y }) => …`. The nodes sit at those places instead of in rows, and dragging a node calls `onNodeMove` when it's let go. Keep the positions in your data and draw again.

Rename (optional): pass `onLabelEdit: (i, label) => …`. A double-click on a node, `F2` on it, or `d.editLabel(i)` (e.g. from its menu) turns the node itself into a field; `Enter` or leaving saves, `Escape` cancels, an empty name shakes and says why. Save the name and draw again: the node keeps its place and the new name forms.

Motion follows what changed, with `MOTION.bend` and the duration tokens: a new node grows out of the node it comes from, a new arrow runs in, a renamed node takes its width while the others make room, and `await d.leave(i)` shrinks a node away before you draw without it. Reduced motion turns it all off.

Size: a node is at least `diagram_node_min` wide (128) and grows in `diagram_node_step` steps (24), so short labels don't become chips (`DIAGRAM.bend`: `node_width`). On a narrow screen the diagram keeps its size; put it in a container that scrolls.

Accessibility (WCAG 2.2 AA): name the diagram with `label: "…"`. Each node tells screen readers its tone and where its arrows go and come from. Lines and borders are at 3:1 or more and soft text at 4.5:1 or more. Changes are announced in a polite live region: the diagram announces renames and drag connects, and `announce(text)` (exported) is for your own changes. `d.focusAfterDraw(label)` puts the focus back on a node after you draw again. Dragging must always have another way: offer "Connect to …" in the node menu, and in free layout `Shift` + an arrow moves the focused node one step.

```js
import { mountDiagram, announce } from "bend-ui/diagram";
const d = mountDiagram(el, data, {
  label: "Release flow",
  onLabelEdit: (i, label) => { data.nodes[i].label = label; redraw(); },
  nodeMenu: (i) => [
    { label: "Rename", onSelect: () => d.editLabel(i) },
    { label: "Remove", onSelect: async () => { await d.leave(i); removeNode(i); announce("Removed"); redraw(); } },
  ],
});
```

## Canvas

A surface that is yours to change: a dot grid behind something editable, like a live diagram. The dots are `canvas_gap` apart (`space_5`) in `--border-strong`; they are decoration, and in forced colors the surface stays plain.

```html
<div class="canvas"><div id="diagram"></div></div>
```

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

Style is how much of the color a button uses: `.btn--filled`, `.btn--tinted`, `.btn--bordered`, `.btn--plain`, `.btn--link` (a plain `.btn` is bordered and neutral, as always). Tone is which color: accent (default), `.btn--neutral`, `.btn--danger`. Sizes: `.btn--sm` (24), md (32), `.btn--lg` (36), `.btn--xl` (48); `.btn--wide` adds room on the sides at the same height; `.btn--icon` for icon-only, `.btn--round` for a circle. Shape for the whole app: `theme({ radius: "rounded" | "pill" | "sharp" })` (rounded is the default), or `data-radius` on a container, or `.btn--pill` / `.btn--sharp` on one button. `.btn--primary` and `.btn--ghost` still work (filled accent, plain neutral).

```html
<button class="btn btn--filled">Save</button>
<button class="btn btn--bordered btn--neutral">Cancel</button>
<button class="btn btn--tinted btn--danger">Delete</button>
<button class="btn btn--plain btn--neutral btn--sm btn--icon" aria-label="Add"><svg class="icon"><use href="#i-plus"/></svg></button>
```

States: `aria-disabled="true"` keeps a disabled button in Tab (ui.js stops its clicks); `.btn--toggle` with `aria-pressed`. Content: a `.kbd` shortcut, a `.btn__count`.

Motion, each for a reason:

- `.btn--reveal`: on hover or focus the trailing icon comes in and the label moves aside; the width stays.
- `.btn--hold`: hold to confirm. Put a `.btn__fill` copy of the content inside; the tone fills over `duration_slow` while held (pointer, Space or Enter); full, it shows `data-armed`; letting go fires `confirm` and shows `data-done`. Early, it drains back.
- `.btn--async`: `busy(btn, true)` shows a ring in place of the label (`aria-busy`); `done(btn, "Published")` pops a check and says it.
- `data-copy="text"`: copies it; the `.btn__swap` icon turns into a check and `data-copied` is said.
- `.btn--extend`: an icon button that opens to show its label on hover or focus.
- `data-reserve="Publish|Published"`: the button keeps the width of its widest label, so nothing around it moves.

```html
<button class="btn btn--tinted btn--danger btn--hold" data-armed="Release to delete" data-done="Deleted" data-reserve="Hold to delete|Release to delete|Deleted">
  <svg class="icon"><use href="#i-trash-2"/></svg><span class="btn__label">Hold to delete</span>
  <span class="btn__fill" aria-hidden="true"><svg class="icon"><use href="#i-trash-2"/></svg><span class="btn__label">Hold to delete</span></span>
</button>
```

### Input and field

A text field and its label, help and messages. Sizes match buttons (`.input--sm` 24, md 32, `.input--lg` 36, `.input--xl` 48) and the shape follows `theme({ radius })` / `data-radius`. States: `aria-invalid="true"` (error), `.is-valid`, `disabled`, `readonly`. An icon inside: wrap in `.input-icon`. A button inside the field: `.input-group` (one border, one focus ring; joined on the side in sm). Under the field, `.field__help` or a `.field__msg--error` / `--success` (with an icon), and `.field__count`; tie them to the field with `aria-describedby`. The border (text-3) and the placeholder (text-2) are AA.

```html
<label class="field" for="name">
  <span class="field__label">Name<span class="field__required">Required</span></span>
  <input id="name" class="input" aria-invalid="true" aria-describedby="name-msg">
  <span class="field__foot"><span class="field__msg field__msg--error" id="name-msg"><svg class="icon"><use href="#i-circle-alert"/></svg>Write a name.</span></span>
</label>
<span class="input-group"><input class="input" value="https://…"><button class="btn">Copy</button></span>
```

### Form

Fields in a column, `form_gap` apart. `.form__section` + `.form__legend` group related fields (a `fieldset`); `.form__row` puts fields side by side in `.form--columns`; `.form--inline` puts each label in its own column (both stack on narrow screens). Add `data-validate novalidate` and ui.js checks the form on send: a wrong field gets `aria-invalid` and its `data-error` under it, and a `.form__summary` lists every error, linked, and takes the focus. If all is right, the submit button (`.btn--async`) shows busy and the form fires `send` with `{ data, done(label), fail(message) }`.

```html
<form class="form form--columns" data-validate novalidate>
  <fieldset class="form__section"><legend class="form__legend">Profile</legend>
    <div class="form__row">
      <label class="field" for="first"><span class="field__label">Name</span><input id="first" name="first" class="input" required data-error="Write your name."></label>
      <label class="field" for="last"><span class="field__label">Last name</span><input id="last" name="last" class="input" required data-error="Write your last name."></label>
    </div>
  </fieldset>
  <div class="actions">
    <button class="btn btn--ghost" type="button">Cancel</button>
    <button class="btn btn--filled btn--async" type="submit">…<span class="btn__label">Send</span>…</button>
  </div>
</form>
```

```js
form.addEventListener("send", async (e) => { await save(e.detail.data); e.detail.done("Sent"); });
```

### Tag and kbd

```html
<span class="tag tag--success">Success</span>
<span class="tag tag--mono">L-012</span>
<span class="kbd">⌘K</span>
```

### Dot

```html
<span class="dot dot--success"></span>
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

Closed: a rail of icon buttons. Open: icon and label. Narrow (or under any `[data-narrow]`): a drawer over the content. `ui.js` does the rest:

- **Sections** (`.side__section`): a `.side__toggle` before its `.side__items`. Opening one closes the others in its group; without groups the whole side bar is one group.
- **Groups** (`.side__group`, optional): sections close each other only inside their group, so one group never closes another. `data-side-multiple` on a group (or on the `.side`) lets its sections stay open together.
- `[data-side-toggle]` opens and closes the side bar it's in, or the one whose id it names (`data-side-toggle="nav"`). On the rail a section's button opens the side bar too.
- The drawer closes with `Escape` or a click outside; focus goes in when it opens and back to its button when it closes; it's `inert` while hidden.
- A section grows and shrinks like the thread's `openBlock` (`duration_enter`, `ease`); reduced motion turns it off.

```html
<aside class="side is-open">
  <div class="side__head"><button class="btn btn--ghost btn--icon" data-side-toggle aria-label="Side bar"><svg class="icon"><use href="#i-panel-left"/></svg></button></div>
  <nav class="side__body" aria-label="Library">
    <div class="side__section">
      <button class="btn btn--ghost side__toggle" aria-expanded="true"><svg class="icon"><use href="#i-list"/></svg><span class="side__text">Components</span><svg class="icon icon--sm side__chevron"><use href="#i-chevron-down"/></svg></button>
      <div class="side__items"><button class="btn btn--ghost" aria-current="page"><span class="side__text">Button</span></button></div>
    </div>
    <div class="side__group" role="group" aria-labelledby="tools" data-side-multiple>
      <h2 class="side__label side__text" id="tools">Tools</h2>
      <div class="side__section">…</div>
    </div>
  </nav>
</aside>
```

`initSide(side)` and `setSide(side, open)` are exported for a side bar added later.

Row actions: wrap an item (or a section's toggle) in a `.side__row` with a `.dropdown.side__more` at its end. The ⋯ shows on hover, keyboard focus, while its menu is open and on the current item (always on narrow screens); on a section it sits before the chevron. A right-click on the row, the context-menu key or `Shift+F10` opens the same menu.

```html
<div class="side__row">
  <button class="btn btn--ghost"><span class="side__text">Shop</span></button>
  <div class="dropdown side__more">
    <button class="btn btn--ghost btn--icon btn--sm" aria-haspopup="menu" aria-expanded="false" aria-label="Actions for Shop"><svg class="icon"><use href="#i-ellipsis"/></svg></button>
    <div class="menu menu--end" role="menu" hidden>…</div>
  </div>
</div>
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
  <div class="block__slot"><span class="dot dot--success"></span></div>
  <div class="block__text">Mana never goes above 10</div>
</div>
```

## What's included

| | |
|---|---|
| Components | `page`, `doc`, `pair`, `thread` + `node`, `chat` + `msg` + `composer`, `disclosure`, `form`, `link`, `dropdown` + `menu`, `btn` (`--primary`, `--ghost`, `--sm`, `--lg`, `--icon`, `--round`, `:disabled`, `[aria-current]`), `input`, `field`, `segmented` (`--icons`), `panel`, `toolbar`, `tag`, `kbd`, `icon`, `rows`/`row`, `art`, `dot`, `status-ring`, `block`, `prose`, `side`, `window`, `agent`, `diagram`, `chart` |
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

## Accessibility

Accessibility isn't something anyone turns on. A blind person can't find an "accessibility mode", so Bend-UI doesn't have one. It works in three layers:

1. **Always on: WCAG 2.2 AA.** Every component is built to meet AA by default, with no option to turn it off: contrast, roles and names for screen readers, keyboard use, visible focus, and changes announced as they happen.
2. **Automatic: the person's own settings.** Reduced motion, more contrast, forced colors and text zoom come from the person's system. No setting lives in the app.
3. **Your choice: a larger size.** The library is drawn at its minimum. An app can choose a larger size scale (and offer it to its users). Everything grows through the tokens, and the Laws still hold. WCAG asks for targets of at least 24px at AA and 44px at AAA.

Components are reviewed one at a time. Each component's docs page lists every WCAG criterion it touches and where it stands on each one. A page carries the WCAG conformance logo only after it passes every A and AA criterion and has been tested with a keyboard and with screen readers.

Sources: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/), [WCAG conformance logos](https://www.w3.org/WAI/standards-guidelines/wcag/conformance-logos/), [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [prefers-contrast](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast).

## Contributing

Read [`AGENTS.md`](AGENTS.md). `LAWS.bend` and `SPEC.bend` change only with the repo owner's approval.

## Workspace extension (1.0.7)

See [the needs register](docs/BORZOI-NEEDS.md) for every Borzoi requirement and the [component review artifact](docs/workspace.html). Import `bend-ui/workspace` to opt in. Existing components and owner laws are unchanged.
