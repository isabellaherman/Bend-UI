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

A theme changes color, font, the controls' shape and the mode. Space and sizes stay bound by the laws.

```js
import { theme } from "bend-ui";
import jaro from "./jaro.woff2";

theme({
  accent: "#ffd21f",
  accentFg: "#02090a",
  fontDisplay: { family: "Jaro", src: jaro },
});
```

A variable font gives its weight range, so 500 and 600 use its own weights instead of a faked bold: `fontSans: { family: "Allo", src: allo, weight: "100 900" }`.

Light is the default, always. Dark is a warm near-black: `theme({ mode: "dark" })`, or `mode: "system"` to follow the computer (`"light"` goes back). It sets `data-theme` and `color-scheme` on `<html>`; `currentTheme()` says which one shows. The accent, danger, success and warning are the same in both: as fills, borders, charts, the focus ring and the agent they need 3:1, and on black they have it. Only grounds, text and words in a tone change: links and tinted labels read `--accent-text`, error messages `--danger-text` (in light, the tone itself). Every dark value is in `TOKENS.bend` (`dark_*`), each the gentlest that passes AA.

Colors at the top of `theme()` are for light, and for dark wherever dark keeps the same color. Give dark its own with `dark`. An app with its own accent gives its dark text tone and tint:

```js
theme({ accent: "#ffd21f", accentFg: "#02090a", dark: { accentText: "#ffe066", accentSoft: "#2b2614" } });
```

The tokens live in a stylesheet first in `<head>`, so an app's own CSS can also set any of them (`:root { --accent: … }`, `:root[data-theme="dark"] { … }`).

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
<main class="page">                        <!-- the area that scrolls -->
  <div class="doc">                        <!-- the column: doc (reading width), doc--wide, or doc--full -->
    …
  </div>
</main>
```

The page scrolls; the doc is the column inside it, centered at a reading width (`measure`). `doc--wide` goes up to the window's width; `doc--full` takes the whole page, less the gutters (the doc's padding: `space_5` each side, `space_3` on narrow screens).

```html
<div class="doc doc--split">               <!-- or doc--stack, or a plain doc -->
  <div class="doc__columns"><span class="meta">Main</span><span class="meta">Aside</span></div>
  <div class="pair">
    <div>…</div>
    <div class="pair__aside">…</div>        <!-- empty: never shows -->
  </div>
</div>
```

A pair puts a second thing with the first: hidden in a plain `doc`, under it in `doc--stack`, beside it in `doc--split` (a stack on narrow screens). The Thread and the Law Editor make pairs of blocks: every block starts at `block_min_lines()` lines; set `--block-min-lines` on a block to change it.

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

A menu can also hold a list that grows (say, what an agent was allowed to do). Put `menu--wide` on the menu and, after its items, a `.menu__section`: a `.menu__head` (a title and a `.tag` count), an optional `.menu__field` (an `.input--sm` to find in the list), a `.menu__list` and a `.menu__foot` (a `.menu__note` and a `.btn--sm`). The list shows `menu_list_rows` rows (8) and then scrolls inside the menu; the menu itself doesn't grow. A `.menu__row` isn't an item: clicking it doesn't pick or close the menu, its own button acts. It holds a `.menu__lead` (a short word, `--accent` or `--warning` for a tone), a `.menu__text` that ends in "…" when it doesn't fit (give the row a `title` with the whole text) and a ghost icon button. `.menu__empty` says when nothing matches. The field takes clicks, typing and arrow keys; the menu stays against its button when the list changes. A button can carry a `.tag` after its label, for the count.

```html
<div class="menu menu--wide menu--up" role="menu" hidden>
  <button class="menu__item" role="menuitemradio" aria-checked="true"><span>Ask before changes</span><svg class="icon icon--sm menu__check"><use href="#i-check"/></svg></button>
  <div class="menu__section">
    <div class="menu__head"><span>Allowed in this chat</span><span class="tag tag--success">50</span></div>
    <div class="menu__field"><input class="input input--sm" type="search" placeholder="Find…" aria-label="Find an allowed action"></div>
    <div class="menu__list">
      <div class="menu__row" title="Edit: project/index.html">
        <span class="menu__lead menu__lead--accent">Edit</span><span class="menu__text mono">project/index.html</span>
        <button class="btn btn--ghost btn--icon btn--sm" aria-label="Stop allowing project/index.html"><svg class="icon"><use href="#i-x"/></svg></button>
      </div>
    </div>
    <div class="menu__foot"><span class="menu__note">Anything else still asks you.</span><button class="btn btn--sm">Stop allowing all</button></div>
  </div>
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

Harness parts (1.1.13), each inside a reply: `.working` (what the agent does now), `.tools` with a `.tool` per action (a `.disclosure` whose summary has `.tool__kind`, `.tool__what`, `.tool__meta`, and a `.tool__out`), `.plan` with `.plan__step` (`.is-done`, `.is-now`, `.is-pop`; a `.plan__node` holding an `.node__core`, and `.plan__text`), `.changes` (`.changes__head`, then `.changes__row` with `.changes__file`, `.changes__add`, `.changes__del`). A card is a `.block` and an `.actions` row; leave out its `.block__slot` for a card without a dot. In the composer: `.composer__chips` above the text, `.composer__stop` for the send button while the agent works, and `.meter` for the context used. Chat boxes follow the shape (`data-radius`): 12 on the sides, 16 on pill.

A turn (1.1.22): everything a reply is made of, on one ruler. The harness parts above each bring their own side padding, so stacked in one reply their texts start at different places. A `.turn` puts them in rows of two columns, a mark and the text, so every line of text of a reply starts at the same place. The distances say who belongs to whom: 4 inside a `.turn__group`, 12 between the groups of a turn, the chat's own gap between turns.

```html
<div class="msg msg--face"><div class="msg__face"><div></div></div><div class="turn">
  <div class="turn__group">
    <div class="turn__row turn__row--sm">
      <div class="turn__mark"><span class="plan__step is-now"><span class="plan__node"><i class="node__core"></i></span></span></div>
      <div class="turn__main"><span class="turn__step is-now">Write the page</span></div>
    </div>
  </div>
  <div class="turn__group">
    <details class="turn__more">
      <summary class="turn__row turn__row--sm">
        <span class="turn__mark"><svg class="icon"><use href="#i-chevron-right"/></svg></span>
        <span class="turn__main"><span class="turn__line">
          <span class="tool__kind">Read</span><span class="tool__what mono">GDD.md</span><span class="tool__meta">5 lines</span>
        </span></span>
      </summary>
      <pre class="turn__out"># Pet</pre>
    </details>
  </div>
  <div class="turn__row"><div class="turn__mark"></div><div class="turn__main"><div class="prose">…</div></div></div>
  <div class="turn__row turn__row--sm">
    <div class="turn__mark"><span class="dot dot--success"></span></div>
    <div class="turn__main"><div class="turn__line turn__line--wrap">
      <span class="turn__strong">1 file changed</span>
      <span class="turn__file"><span class="mono">index.html</span><span class="changes__add">+166</span></span>
      <button class="link link--icon turn__end" type="button"><svg class="icon icon--sm"><use href="#i-folder"/></svg><span>Open folder</span></button>
    </div></div>
  </div>
</div></div>
```

- `.turn__row` is what the person reads (the reply, a question, a rule); `.turn__row--sm` is a line of work, in small text; `.turn__row--tight` keeps a sentence (`.turn__text`) and the `.turn__note` under it together (`.turn__note--error` when it failed).
- `.turn__mark` holds a plan node, a chevron, a dot or an icon (`--success`, `--warning` color an icon), or stays empty; `.turn__main` holds the text.
- `.turn__line` is one line of parts (`.tool__kind`, `.tool__what`, `.tool__meta`, `.working__verb`); `.turn__line--wrap` lets them wrap; `.turn__end` goes to the line's right end. `.turn__step` is a plan step's text (`.is-now`, `.is-done`), `.turn__label` a group's name ("Rules heard"), `.turn__strong` the words that count, `.turn__file` a file and its numbers, `.turn__actions` a row of buttons at the end.
- `details.turn__more` is a row that opens: its summary is the row, with a `chevron-right` in its mark, and what it shows (`.turn__out`, `.turn__out--error`) starts at the text column. `.turn__more--flat` shows rows of the turn itself, from the mark column: a finished turn folds its work into one line ("Worked for 48s · 2 actions") holding a `.turn` of the same groups.

The question that waits (`.ask`) takes the message box's place, so where the person answers is where it asks. It never grows past three composers: what it shows scrolls inside it.

```html
<form class="composer">
  <div class="ask"><div class="turn__row">
    <div class="turn__mark"><span class="dot dot--warning"></span></div>
    <div class="turn__main">
      <span class="ask__title">Allow the chat to write index.html?</span>
      …a code block (codeBlock(code, { clip: true })), a note…
      <div class="turn__actions">
        <button class="btn btn--sm btn--bordered" type="button">Don't allow</button>
        <button class="btn btn--sm btn--bordered" type="button">Allow for this session</button>
        <button class="btn btn--sm btn--primary" type="button">Allow</button>
      </div>
    </div>
  </div></div>
  <div class="composer__bar">…</div>
</form>
```

Use a turn when a reply stacks more than its text (a plan, actions, what it does now, what changed), and `.ask` when the chat can't go on without an answer. Both only add: `.working`, `.tools`, `.plan`, `.changes` and the cards stay as they are, and a reply that uses them looks as before.

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

Order: on each row a node sits under the nodes it comes from (the average place of its parents, row by row from the top; ties keep your order), so a parent's children stay together and arrows cross less (`DIAGRAM.bend`: `order`). An arrow's words sit at the middle of its line, or slide along it to the first place that covers no node and no other words (`label_tries`, `covers`).

Loops: an arrow that closes a loop (its end already leads back to its start, or a node pointing to itself) is a return arrow. Arrows are read in order, so the one that closes the loop is the return one. It doesn't push rows, so a loop never pushes its nodes down; it is drawn going back up on the diagram's nearer side, beside the forward arrows and never over them (`DIAGRAM.bend`: `back`). A node that points to itself gets a small loop into its top. Which arrows are allowed stays the app's choice.

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

Shapes (optional): `shape` is one of Mermaid's 14 flowchart shapes, by Mermaid's own name: `rect` (Process), `rounded` (Event), `stadium` (Terminal point), `fr-rect` (Subprocess), `cyl` (Database), `circle` (Start), `dbl-circ` (Stop), `odd` (Odd), `diam` (Decision), `hex` (Prepare conditional), `lean-r` (Data input/output), `lean-l` (Data output/input), `trap-b` (Priority action), `trap-t` (Manual operation). No shape is the box, as before; an unknown name is drawn as the box, with a warning. Each takes the tones and both looks (in the soft look a shape keeps its outline). `DIAGRAM.bend` decides each shape's size around its text and where a return arrow and a self-loop meet it (`shape_w`, `shape_h`, `side_inset`, `top_at`), and the laws prove it on every shape. Screen readers hear the shape ("Shape: Decision."), and the focus ring follows it.

```js
mountDiagram(el, {
  nodes: [{ label: "Needs data?", shape: "diam", tone: "accent" }, { label: "Orders", shape: "cyl" }, { label: "Write the answer\nfor the person", shape: "rounded" }],
  edges: [{ from: 0, to: 1, label: "Yes" }, { from: 0, to: 2, label: "No" }],
});
```

Lines: a `\n` in a label starts a new line; in rename, Shift+Enter adds one and Enter saves.

Size: a node is at least `diagram_node_min` wide (128) and grows in `diagram_node_step` steps (24), so short labels don't become chips (`DIAGRAM.bend`: `node_width`). The diagram is never narrower than its widest row, so a wide row makes it wider instead of cutting nodes off; put it in a container that scrolls (an `.area` does).

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
mountPie(el, [{ label: "Fire", value: 46 }, { label: "Air", value: 10 }], { label: "Spells by school" });
const bars = mountBars(el, [{ label: "Mon", value: 42 }]);
bars.replay();   // the entrance again; also draw() and destroy()
```

A pie takes up to 4 slices; line and area take the same points as bars. Colors are tones of the accent (`--chart-1` to `--chart-4`), so `theme({ accent })` recolors every chart. Three sizes on `el`: `chart--sm`, none (md) and `chart--lg` (160, 240, 320: the plot's height, the pie's width). A pie takes `chart--donut` (a hole) and `chart--soft` (lighter tones, each slice outlined in the accent); a hairline of surface always parts the slices. The four tones all pass 3:1 against the page (WCAG 1.4.11): two lighter and two darker around the accent. The area's fill stays light: it is a ground under the line, and the line carries the values. Name the chart with `{ label }` (the third argument), and a screen reader hears it before the values. Pointing at a mark keeps it and dims the rest; line and area show the thread's node on the point.

## Disclosure

A section that opens and closes, on the native `<details>` (keyboard and screen readers work as anywhere). Closed unless it has `open`.

```html
<details class="disclosure">
  <summary><svg class="icon icon--sm disclosure__chevron"><use href="#i-chevron-down"/></svg><span class="disclosure__title">Laws</span><span class="meta">5</span></summary>
  …
</details>
```

## Code block

Code in color, in twelve languages: Bend, JS (and TS, JSON), CSS, HTML, Shell (and TOML, YAML), Python, Rust, Go, SQL, Markdown and Diff. `SYNTAX.bend` cuts the code into pieces (Markdown and Diff a line at a time); `syntax.js` only draws them. A code block has a head (the file or the language, and Copy) and the code line by line; `numbers` adds line numbers, `wrap` breaks long lines, `head: false` leaves Copy in the corner. The code box takes the focus, so a keyboard can scroll long lines.

```js
import { codeBlock, upgrade, highlight, toHtml } from "bend-ui/syntax";
el.innerHTML = codeBlock(code, { lang: "python", name: "laws.py", numbers: true });
upgrade(document.querySelector('pre[data-lang="sql"]'));   // a <pre> becomes a code block in place
highlight(document.querySelector(".prose pre"), "html");     // color only, as before
```

## Responsive

Below `breakpoint()` in `TOKENS.bend` (720px), `ui.js` sets `<html data-narrow>`: the window fills the screen and the side bar becomes a drawer. CSS can't read variables in media queries, so the breakpoint lives in Bend and nowhere else.

An `.area` does the same for the room it has, not the screen: below the breakpoint of its own width (`AREA.bend`: `narrow`) it gets `data-narrow`, and the components inside follow it. Form columns stack, an inline label goes above, a pair stacks, the toolbar scrolls, `hide-narrow` and `only-narrow` swap. What can't reflow scrolls inside the area; nothing spills over its neighbors. `initArea(el)` for an area added later.

| Class | |
|---|---|
| `area` | a region that knows its own width |
| `hide-narrow` | hidden on narrow screens and in narrow areas |
| `only-narrow` | shown only on narrow screens and in narrow areas |

```html
<div class="area">
  <span class="tag hide-narrow">wide</span>
  <span class="tag only-narrow">narrow</span>
</div>
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

`still: true` is a face that only looks (beside a chat's reply): it opens nothing, so it takes no focus, has no pointer cursor, and screen readers skip it.

### Fairy avatar

`mountAgent(el, { avatar: "fairy", size: "lg", items, onPick })` opts into Fairy. Omitting `avatar` keeps the classic face. The existing menu, hover/click opening, item status, `spin`, `shake`, `lookAtEl`, `ask`, `flyBetween` and `destroy` API still apply.

Fairy adds `setState("idle" | "thinking" | "working" | "waiting" | "blocked" | "done")` and `setMood("neutral" | "happy")`. The pointer is followed across the page. Reduced motion follows the system. All live faces share one frame clock, including small toolbar faces.

Its approved contour lives in `FAIRY.bend`, with a spherical core (equal 20.5-unit radii), circular filaments and vivid teal `--fairy-color` (`#00d6b5`). `agent_sm/lg/xl` measures its spherical body, matching the classic ball; filaments extend around it. Override that token locally to recolor the avatar. `FAIRY_MOTION.bend` and `FAIRY_ANIMATOR.bend` own easing, poses and interrupted transitions. The licensed Open Bot Avatar renderer draws the volume to canvas; browser modules handle input, layout and rendering.

`mountAgent(el, { avatar: "fairy", ball: true, size: "sm" })` is the ball: Fairy with its tentacles in, its sphere grown by `jelly_grow` (14%) and the same eyes, filling the face (`.agent--ball`). A chat's face beside its replies.

`jellyFlight({ from, to, direction, done })` (`import { jellyFlight } from "bend-ui/fairy-jelly"`) flies Fairy over the page between two `.agent__fairy`, pulling its tentacles in (`"in"`, landing as the ball) or letting them out (`"out"`). It reaches up, pulls them in, squashes on its base and smiles; letting go, it pops. `to` can come later with `flight.land(el, done)`: until then it does its Jelly where it was. Keep the face that waits there hidden until `done`; `flight.cancel()` drops it. With reduced motion it does nothing and `done` runs at once. The body and eyes are the renderer's (the eyes never change size); the tentacles are `FAIRY.bend`'s outline drawn as tubes that slide back along their own path. Every number is `FAIRY_MOTION.bend`'s `jelly_*`.

On `.chat__start`, a Fairy face's box makes room for the filaments it draws (`--fairy-start-above`, `--fairy-start-below`), so the start centers what is seen and the filaments stay clear of the composer.

In a page written with `Web.bend`, import `UI.bend` and render:

```python
Ui.agent(Ev, Ui.fairy{}, Ui.agent_lg{}, "idle", "neutral", "Fairy")
```

Run the page with `mount` from `bend-ui/web`. The canvas survives unrelated view patches; changing state or mood updates it, and removing the slot or calling `stop()` disposes it. This form is a labeled image; use `mountAgent` for an interactive options menu. `Ui.classic{}` and `Ui.agent_sm{}` are also available.

The renderer attribution and adaptation notes are in `fairy-renderer/NOTICE.txt`. `bun run check` includes reference motion fixtures, interrupted transitions, rotated frames and the spherical surface.

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
  <div class="table-block"><table>
    <thead><tr><th>Spell</th><th data-align="right">Mana</th></tr></thead>
    <tbody><tr><td>Spark</td><td data-align="right">1</td></tr></tbody>
  </table></div>
</article>
```

A table goes in a `.table-block`, which scrolls a wide table inside itself. It reads as part of the text: a rule under the header, a lighter one between rows, no box. `data-align="right"` or `"center"` on a cell aligns it, as Markdown's `---:` and `:-:` do.

### Rows

```html
<ol class="rows">
  <li><a class="row" href="…"><span class="row__lead">#0.2.0</span><span class="row__title">Title</span><span class="row__meta">12 nov 2026</span></a></li>
</ol>
```

### Image

```html
<img class="image image--sm" src="…" alt="">
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

On the rail nothing is wider than an icon button, so the side bar never scrolls sideways: a group's label keeps only the room that sets the group apart, a section's chevron is out. A section's state is a `.dot` in its toggle, after its text (`<span class="dot dot--busy" role="img" aria-label="working"></span>`); on the rail it sits on the icon's corner. `setSideSection(section, open)` opens or closes a section as a click on its button would, without opening the side bar.

Something new being made in the side bar (a section before it has a name) is a `.btn.is-new`: on a soft ground of the accent, not a button yet. `bend-ui/motion` brings it and turns it into what it becomes (below).

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
| Icons | plus, arrow-up, shield, github, file-text, scale, triangle-alert, circle-check, x, chevron-down, list, code, wand-sparkles, search, panel-left, book-open, lock, minimize-2, maximize-2, minimize, maximize, text, rows-2, columns-2, heading-1, pilcrow, check, terminal, panel-right, panel-bottom, monitor |
| Tokens | space, radius, type, controls, icons, image, status, side bar, window, agent, chat, chart, motion, color (light theme) |

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

## Motion between places (1.1.33)

Opt-in: `import { … } from "bend-ui/motion"`. Motions that take a page from one place to another, approved in the artifact "LawEditor Transition Lab". Every number is in `MOTION.bend`; with reduced motion nothing moves and each function resolves at once.

- **A plus that opens into an icon.** `plusIcon("folder")` gives an `svg.icon` drawn as a plus; `becomeIcon(svg)` opens its line into the icon's outline (plus, four-point star, icon), the whole icon landing softly, and from then on it is that icon. It works for an icon made of one outline. Each point of the outline starts on the arm of the plus that points its way (`plus_x`, `plus_y`).
- **Something new in a side bar.** `arriveNew(btn)` shows a `.btn.is-new`'s ground and turns its plus into place; `settleNew(btn, { state })` lets the ground go while the plus becomes its icon and pops `state` (its dot) as it lands; `leaveNew(el)` takes it away quietly when nothing came of it. `makeRoom(el)` opens the room a new piece takes, `popIn(el, wait)` pops a small thing into place, `nudge(el)` is a small answer, `swapWords(el, text)` changes a label's words.
- **Words that travel.** `liftWords(el)` hides `el` and leaves a copy of its words where they were (`.fly-words`), whatever the page does under it; `.land(target)` takes them to `target`, changing size, color, ground and corners on the way, and shows `target` as they land; `.drop()` puts everything back.
- **From one place to the next.** `stepBack(els, toward)` sends what a place said toward where that place lives (its button), smaller and fainter, and resolves to a `release()`; `stepForward(els, from)` brings it back. `moveFrom(el, rect)` glides a piece that is in both places from where it was. `arrive(els, wait, from)` brings the next place's pieces one after another (`"below"`, `"side"` or `"here"`). `holdStill(canvas)` keeps a picture of a canvas in sight while the page is swapped under it.

`jellyFlight` (Fairy's Jelly) now answers `gathered`: a promise that resolves when Fairy's tentacles are in and it is about to go, the beat for what should happen with it.

## Workspace extension (1.0.7)

See [the needs register](docs/BORZOI-NEEDS.md) for every Borzoi requirement and the [component review artifact](docs/workspace.html). Import `bend-ui/workspace` to opt in. Existing components and owner laws are unchanged.

## Board extension (1.1.11)

`import "bend-ui/board"` adds the board, lane and card. Their measures live in `BOARD.bend`; the locked ones are pinned in `BOARD_LAWS.bend`, the rest are marked `# undecided`. `board.js` writes every number as a CSS variable and exports `card` (what a card shows and in which order) `cardCheck(done)` (the circle that completes a card: put it first inside `.card__title`) and `initBoard(board, { canDrag, onDrop, onDone })`: clicking the circle marks the card `is-done` where it is and calls `onDone(id, done)`; cards drag with a mouse, a pen or a finger, the others slide to make room, and the card settles with `MOTION.bend`'s spring; `DRAG.bend` decides when a press becomes a drag and where the card lands. Markup:

```html
<div class="board">
  <section class="lane">
    <header class="lane__head"><h2 class="group-title">Doing</h2><span class="tag">2</span></header>
    <div class="lane__cards">
      <article class="card">
        <div class="card__head"><span class="card__lead"><span class="tag tag--mono">VK-1</span><span class="tag tag--accent">ui</span></span></div>
        <p class="text card__title">${cardCheck(false)}Title</p>
        <div class="card__foot"><span class="detail card__who">@isa</span></div>
      </article>
    </div>
  </section>
</div>
```

## Panes extension (1.1.20)

`import "bend-ui/panes"` adds panes beside and under a window's main column, a file tree, a terminal surface and a strip. Existing components keep their definitions and appearance: a window without `.window__body` is as before. The measures live in `PANES.bend`, all marked `# undecided` (no law yet); `panes.js` writes each as a CSS variable. The logic is Bend: `PANES.bend` bounds a pane's size, `TREE.bend` makes the rows and decides the keys, `TERM.bend` reads the output and the keyboard.

### Panes

`.window__body` goes in `.window__main` after the toolbar: a row holding `.window__col` (the page and the composer, stacked as before) and any `.pane` beside it. `.pane--under` goes last inside the column instead (a terminal). A pane has a `.pane__head` (a `.pane__title` and `.pane__actions`) and a `.pane__body` that scrolls; with `hidden` it takes no room.

```html
<div class="window__main">
  <div class="toolbar"><button class="btn btn--ghost btn--icon" data-pane-toggle="files" aria-label="Files"><svg class="icon"><use href="#i-panel-right"/></svg></button></div>
  <div class="window__body">
    <div class="window__col">
      <main class="page">…</main>
      <form class="composer">…</form>
      <section class="pane pane--under" id="shell" hidden>
        <header class="pane__head"><h2 class="pane__title">Terminal</h2></header>
        <div class="term"></div>
      </section>
    </div>
    <aside class="pane" id="files">
      <header class="pane__head">
        <h2 class="pane__title">Files</h2>
        <div class="pane__actions"><button class="btn btn--ghost btn--icon btn--sm" data-pane-toggle aria-label="Close files"><svg class="icon"><use href="#i-x"/></svg></button></div>
      </header>
      <div class="pane__body">…</div>
    </aside>
  </div>
</div>
```

```js
import { initPane, setPane, setPaneSize } from "bend-ui/panes";
initPane(pane, { onResize: (size) => save(size), onToggle: (open) => {} });   // adds the grip (.pane__grip)
setPane(pane, true);       // opens or closes it; a [data-pane-toggle="id"] button does the same
setPaneSize(pane, 320);    // a size the app kept (null: the default)
setPaneWhole(pane, true);  // the pane takes the whole body and the column steps aside; false sets it back
```

- **Whole**: `setPaneWhole` (`.pane.is-whole`) gives a pane the whole window body, for a page that needs more room without leaving the window; the column beside it steps aside and comes back as it was. `isPaneWhole(pane)` says which.
- **Tools in the head**: `.pane__tools` holds groups of tools at the start of a pane's head (pills, a switch), a step apart; `.pane__actions` keeps the ones at its end.

- **Size**: a side pane opens `pane_width` wide (256) and is never under `pane_min` (192), and the column keeps `pane_col_min` (320); a pane under the column opens `pane_under_height` tall (160), at least `pane_under_min` (96), leaving the column `pane_page_min` (128). `PANES.bend`'s `clamp_width(wanted, room)` and `clamp_height` decide.
- **Grip**: drag the pane's inner edge with a mouse, a pen or a finger. It is a `role="separator"` that takes the focus: Left and Right (Up and Down under the column) step it by `pane_step` (16), Home and End take it to its smallest and largest, and a double click puts the default back. For any size without dragging, offer your own control and call `setPaneSize`.
- **Narrow** (`[data-narrow]`): a side pane covers the column as a sheet. The focus goes in when it opens and back when it closes; `Escape` or its close button closes it.
- **Motion**: a pane slides in and the column makes room (`duration_enter`, `ease`); reduced motion turns it off.
- A `.pane__body` that holds only text needs `tabindex="0"`, so a keyboard can scroll it.

### Tree

File paths in, a tree out. `TREE.bend` turns the paths into rows (folders first, then files, each level by name), keeps the rows of a closed folder hidden and decides what each key does (the WAI-ARIA tree: Up, Down, Home, End, Right and Left to open, close and step in and out, Enter or Space to press; one row takes Tab).

```js
import { tree, initTree } from "bend-ui/panes";
body.innerHTML = tree(["GDD.md", "game/game.html", "game/sprites.js"], {
  open: ["game"],                                 // the folders that are open
  current: "game/game.html",                      // the file open in the app
  marks: { "game/game.html": { add: 14, del: 6 } },   // +14 −6 at the row's end
  label: "Files",
});
const files = initTree(body.firstElementChild, { onOpen: (path) => {}, onToggle: (path, open) => {} });
files.update(paths, { current, marks });          // the files changed: the open folders stay open
```

```html
<div class="tree" role="tree" aria-label="Files">
  <div class="tree__row" role="treeitem" aria-expanded="true" data-path="game" data-folder …><svg class="icon"><use href="#i-chevron-down"/></svg><span class="tree__name">game</span></div>
  <div class="tree__kids" role="group">
    <div class="tree__row" role="treeitem" aria-current="true" data-path="game/game.html" …><svg class="icon"><use href="#i-file-text"/></svg><span class="tree__name">game.html</span><span class="tree__add">+14</span><span class="tree__del">−6</span></div>
  </div>
</div>
```

A path ending in `/` is a folder with nothing in it. A row has a hover because it is clickable; a level sits `tree_indent` (12) in, on a hairline. A folder grows open like the side bar's sections. No paths: `tree()` returns `""`, and the app says what it wants.

### Terminal

A surface: the lib runs nothing. It draws the output it is given and reports what is typed.

```js
import { mountTerm } from "bend-ui/panes";
const term = mountTerm(el, { onData: (text) => shell.write(text), label: "Terminal" });
term.write("\x1b[32mready\x1b[0m\r\n$ ");   // output, as the process wrote it
term.clear();
term.focus();
```

```html
<div class="term"></div>
```

- **Output** (`TERM.bend`: `feed(screen, text)`): `\n`, `\r` (the line is written over), `\b`, tab stops every 8, and SGR colors (reset, bold, dim, the eight colors and their bright ones); `ESC [ K` erases in the line and `ESC [ 2 J` clears. Every other escape sequence is read and dropped. It keeps `scrollback` lines (1000, undecided).
- **Colors** are the lib's tokens: red `--danger-text`, green `--success-text`, yellow `--warning-text`, blue `--accent-text`, magenta `--syntax-type`, cyan `--syntax-number`, dim `--text-detail`, on `--syntax-bg`.
- **Typing** (`sent`): the element takes the focus and nothing is echoed (the shell echoes). A character sends itself, Enter `\r`, Backspace `\x7f`, Tab `\t`, the arrows `ESC [ A` to `D`, Ctrl with a letter its control character (Ctrl+C `\x03`), and a paste its text with `\r` for each line break. A block caret marks the cursor while it has the focus.
- **Leaving**: Shift+Tab, or Escape then Tab, move the focus on, so the keyboard is never held.
- It stays at the bottom while output arrives, unless the person scrolled up. New lines are said through `announce`, once the output is still, while the terminal has the focus.
- It fills its container; right inside a `.pane` it takes the room under the head.

### Strip

A thin line of state at the top of a window. Each `.strip__item` is an optional `.dot` or icon and words; the item with `.strip__end`, and what follows it, sit at the end. Static: add `role="status"` if its changes should be said.

```html
<div class="strip">
  <span class="strip__item"><span class="dot dot--success"></span>Laws hold</span>
  <span class="strip__item"><svg class="icon"><use href="#i-file-text"/></svg>3 files changed</span>
  <span class="strip__item strip__end">Ask before changes</span>
</div>
```

## Inspect extension (1.1.29)

`import "bend-ui/inspect"` adds what is drawn over a piece of interface to read it: the space inside each part (padding), around it (margin) and between its children (gap) with its number, the part under the pointer, the part picked, and a pin where a comment points. Existing components keep their definitions and appearance. The measures live in `INSPECT.bend`, all marked `# undecided` (no law yet); `inspect.js` writes each as a CSS variable. The logic is Bend: `INSPECT.bend` decides every band (`pad`, `around`, `between`) and names every value on the scale (`space_name`, `radius_name`); `inspect.js` reads the boxes from the page and draws what Bend returns.

```html
<div class="inspect-host">
  <div id="piece">…</div>
  <div class="inspect"></div>
</div>
```

```js
import { readBoxes, readBox, readPart, draw, facts, key } from "bend-ui/inspect";

const corner = layer.getBoundingClientRect();
draw(layer, {
  boxes: readBoxes(piece),                      // padding, margin and gaps of every part
  at: { x: corner.left, y: corner.top },        // the layer's own corner, in the boxes' measures
  hover: readBox(partUnderThePointer),          // dashed
  picked: readBox(partPicked),                  // in the accent
  pins: [{ box: readBox(part), fx: 0.5, fy: 0.5, label: 1 }],
});
out.innerHTML = facts(readPart(partPicked));    // each space and corner with its token, or "off the scale"
legend.innerHTML = key();                       // which color is which space
```

A page in a frame: `.inspect-host--fill` holds an `iframe.inspect-frame` with the `.inspect` drawing exactly over it, and `.inspect-out` under it holds what the tools say (the key, the picked part's values).

`groups(readPart(el))` shows the same values grouped as a person reads them: the part and how many values are off the scale first, then Space (padding, gap, margin), Shape (size, corner) and Text (size, weight); four equal sides read as one number, two pairs as two ("13 · 24").

So that turning a tool on never changes the page's size (a page in a frame would lay itself out again and move), put what the tools say over the page, inside the `.inspect-host`: `.inspect-out--float` is a sheet over its bottom, `.inspect-key--float` holds the key in its top corner.

A box is plain numbers (`{ x, y, w, h, pad, margin, rowGap, colGap, kids }` with `pad` and `margin` as `[top, right, bottom, left]`), so a page in a frame can read its own boxes and send them: `draw()` only needs them in the same measures as `at`. A band shows its number when it is at least `inspect_says_across` thick (or `inspect_says_along` wide, for one that stands); room between two children that isn't the part's own gap is not drawn.

Ideas from: the box model overlay of Chrome DevTools and Firefox, the measures of Figma's Dev Mode, and the comment pins of Figma and of Claude's artifacts.

## Paywall extension (1.1.34)

`import "bend-ui/paywall"` adds the sheet that opens over an app and says what a plan gives: a title, the price with a monthly / yearly switch, the things you get (a title and what it does, each check drawing itself in turn), one action and a note. The sheet is glass, with balls brushing its top corner that drift and lean toward the pointer; the action and the checks stay solid. Existing components keep their definitions and appearance. Measures and colours live in `PAYWALL.bend` (`paywall_*`, all `# undecided`); `paywall.js` writes each as a CSS variable.

It is written with `Web.bend`. The page keeps a `Pw.Sheet` in its state and draws `Pw.view`; the events that carry something (a key, the pointer) come back through `on_input`:

```python
import ./node_modules/bend-ui/PAYWALL.bend as Pw

def render(+s: Pw.Sheet) -> Web.HTML<Ev>:
  Pw.view(Ev, offer(), s, shut{}, monthly{}, yearly{}, subscribed{}, keyed{""}, leaned{0.0, 0.0})

# on_event: opened{} -> Pw.opened(s), shut{} -> Pw.shut(s), monthly{} -> Pw.billed(s, False{}),
# keyed{n} -> Pw.shut(s) when Pw.closes(n), leaned{x, y} -> Pw.leaned(s, x, y)
```

```js
import { mount } from "bend-ui/web";
import { focusSheet } from "bend-ui/paywall";
import Page from "./plus.bend";
mount(el, Page, { patched: focusSheet });   // the sheet takes the focus when it opens, and gives it back
```

Put the mount's element where the sheet should cover (it fills its nearest positioned parent). `PAYWALL_LAWS.bend` holds the owner's rules: switching the billing never changes the price's shape, so the sheet keeps its size; Escape closes.

Ideas from: the checklist upgrade dialog of Neon UI, the plan upgrade dialogs of shadcn.io blocks, and the glass panels of visionOS.
