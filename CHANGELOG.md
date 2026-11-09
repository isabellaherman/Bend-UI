# Changelog

## 1.1.8 (2026-11-09)

- **Dark theme**: a warm near-black, the light theme's stone grays turned over. Light stays the default; `theme({ mode: "dark" })`, or `"system"` to follow the computer. `currentTheme()` says which one shows. Every dark value is in `TOKENS.bend` (`dark_*`), each the gentlest that passes AA, as approved in the Black proposal.
- **The tones stay**: the accent, danger, success and warning keep their light values in dark. As fills, borders, charts, the focus ring and the agent they need 3:1 and have it on black (3.08, 3.19, 3.99, 4.79). The agent looks the same in both.
- **Words in a tone** read two new colors, `--accent-text` and `--danger-text` (`color_accent_text`, `color_danger_text`; theme keys `accentText`, `dangerText`): button labels in a tone, links in prose, error messages, accent and danger tags, soft diagram nodes, an agent option's error. In light they are the tone itself, so light doesn't change. In dark they are lighter (5.11 and 5.16:1).
- **Charts in dark**: all four tones step from the accent toward the text (`dark_chart_tone_2..4`: 88, 74, 58; 3.08 to 6.44:1), so they stay vivid. In light nothing changes.
- **Code in dark**: GitHub's dark colors on the surface, each 5:1 or more. A floating shadow gets a dark value too.
- **Tokens move into a stylesheet** (`<style id="bend-ui-tokens">`, first in `<head>`) instead of inline styles on `<html>`, so dark can win over light and an app's own CSS can set any token. `theme()` writes to its own stylesheet and takes `dark: { … }` for colors in dark only.
- New icons (Lucide): `sun`, `moon`.
- Docs: a moon/sun button in the toolbar (a ghost icon button, like the side bar's) turns dark on and off; the docs remember it. The Accessibility tables still measure light.

## 1.1.7 (2026-11-09)

- **Small text passes AA**: a new color, `color_text_detail` (`--text-detail`, theme key `textDetail`): text-3 moved 59% toward text-2, the gentlest that gives 4.5:1 on surface, page and surface-2 (4.95, 4.74, 4.50; text-3 was 3.35, 3.21, 3.03). It colors the small text people read: `.meta`, `.detail`, a row's lead and date (`.row__lead`, `.row__meta`), a muted outline item (`.outline__item.is-off`) and a block's placeholder.
- text-3 doesn't change and keeps what needs only 3:1: lines, borders, chevrons, the diagram's arrows. Code line numbers and the thread's reading pass also keep it (decoration, and text passing by). Nothing else changes.
- Docs: the Color page shows `--text-detail`.

## 1.1.6 (2026-11-09)

- Docs: **Prose** moves from Foundations to Components in the side bar (after Panel), so its address is now `/components/prose`. The page itself doesn't change.

## 1.1.5 (2026-11-09)

- **Chart colors pass AA**: the four tones are two lighter and two darker around the accent (`chart_tone_1..4`: 100, 75 toward the surface, 80 and 60 toward the text), each 3:1 or more on the page (5.43, 3.24, 6.94, 8.88; were 5.43, 2.70, 1.73, 1.30). Close to the accent on purpose: protected, not extreme. A hairline of surface always parts a pie's slices, so `.chart--split` is gone.
- **`.chart--soft`**: the lighter tones (`chart_soft_2..4`: 66, 40, 22), each slice outlined in the accent (5.43:1), like `.diagram--soft`. It passes AA too; the lib has no look that doesn't.
- **Sizes**: `.chart--sm`, none (md) and `.chart--lg`: 160, 240 and 320, the plot's height and the pie's width (`chart_sm`, `chart_md`, `chart_lg`; it no longer borrows `image_lg`).
- **A name**: `mountPie`, `mountBars`, `mountLine` and `mountArea` take `{ label }`; a screen reader hears it before the values.
- Percentages in the legend and axis numbers are a little darker (`chart_ink`: text-2 mixed 55% into text-3), the gentlest ink that gives small text 4.5:1 (were text-3, 3.21:1). Bars, lines and their colors don't change. The legend keeps its layout, and the area's fill keeps its light tones (it is a ground under the line, which carries the values).
- Docs: the Chart Playground gets Size, and Look is Plain, Donut, Soft, Soft donut. Accessibility: 5 of 7 pass (keyboard for bars and points, and a table for screen readers, are next).

## 1.1.4 (2026-11-09)

- New icon: `chart-column` (Lucide).
- Docs: the **Chart** page in the standard format. A Playground: Type (Pie, Bars, Line, Area), Look (Plain, Split, Donut, Donut split; shown only for a pie) and Entrance (Play) on the right, one chart on the stage. The fixed widths written into the page are gone. Accessibility, collapsed: 2 of 7 pass. Contrast fails: three of the four tones are under 3:1 on the page, and axis ticks are 3.21:1. Keyboard and the chart's name are partial. Nothing else in the lib changes.

## 1.1.3 (2026-11-09)

- **Art is now Image**: `.art` → `.image` (`.image--sm`, `--lg`, `--empty`, `--fill`), tokens `art_sm/md/lg` → `image_sm/md/lg`, CSS variables `--art-*` → `--image-*` (the chart's plot height reads `--image-lg`). Same values and look. An app that used `.art` renames its classes.
- Docs: the **Image** page (was Art, now in the side bar after Form) has a Playground: Size (sm, md, lg) and Width (Natural, Fill) on the right, one image on the stage. Panel and Pages use `.image`; Pages' Content filter says Images.

## 1.1.2 (2026-11-09)

Three diagram layout fixes, from real agent diagrams in Borzoi 1.1.0.

- **A wide row is never cut off**: `.diagram` is never narrower than its widest row (`min-width: max-content`), so a row wider than its container widens the diagram and the container scrolls over all of it. Before, a centered row ran past both edges and its first nodes sat left of where scrolling can reach.
- **Children sit under their parents** (`DIAGRAM.bend`: `order`): rows are ordered top to bottom, each node by the average place of its parents (compared without dividing); ties keep the given order. A parent's children stay together and arrows cross less (the Borzoi map: 6 crossings → 0, counted as straight lines).
- **Arrow words never cover each other** (`DIAGRAM.bend`: `label_tries`, `covers`): an arrow's words sit at the middle of its line, or slide along it to the first place that covers no node and no words already placed.
- Known limit: an arrow that skips a row can still pass beside a node on the row it skips.

## 1.1.1 (2026-11-09)

- **Area** (`.area`): a region that knows its own width. Below `breakpoint` of its own width (`AREA.bend`: `narrow`) it gets `data-narrow`, and the components inside follow the room they have, not the screen. Form columns stack, an inline label goes above, a split pair stacks, `.doc`, `.chat` and `.composer` take their narrow padding, `.hide-narrow` / `.only-narrow` swap, the toolbar scrolls. What can't reflow scrolls inside the area; nothing spills over its neighbors. Window and side bar still follow the screen. `initArea(el)` is exported. No new token (reuses `breakpoint`), no new law.
- The component rules that read `html[data-narrow]` now read `[data-narrow]`, so they follow the nearest narrow area as well as a narrow screen.
- **Segmented**: an item's text never wraps (its height is fixed).
- Docs: every Playground stage is an area, so a big pick (Button xl + Wide, Diagram's grid) scrolls inside the stage instead of running over the controls. The Responsive page has a Playground: one area at 320, 576 or full width. Agent's Action is a pill dropdown (five options don't fit the column) and in a narrow area its two agents stack, so the small one's options never open over the large one. The Rows and Toolbar demos lose their inline widths. Measured at 1280, 1024 and 390px with every option of every control: nothing spills.

## 1.1.0 (2026-11-09)

- **10 new icons** (Lucide): `square-round-corner`, `ruler`, `move-horizontal`, `toggle-right`, `tag`, `move`, `list-ordered`, `text-wrap`, `play`, `mouse-pointer-click`.
- Docs: the visual standard for every page. Every Playground puts its stage on the left and its controls in a column on the right (320px, `space_8 × 5`). Each control is a lib `.field`: an icon and its name above it, the same icon for the same kind of control on every page. On narrow screens the controls go above the stage, side by side. Code block's Language (12 options) and Input's State (6) are a pill dropdown, since they don't fit the column. Segmented, field and dropdown don't change.

## 1.0.34 (2026-11-09)

- Docs: every segmented that drives a page (the filters, Agent's Action and Open, Pages, Pair, Panel, Prose) is now a pill with the spring thumb (`.segmented--slide`, `data-motion="spring"`, `data-radius="pill"`). The Segmented page's own previews still follow its Shape and Animation filters. Nothing in the lib changes.

## 1.0.33 (2026-11-09)

- **Code block inside prose** keeps its own look: `.prose` styles a bare `<pre>` and inline `<code>`, no longer a code block's (no box inside the box, no inline-code ground on its lines).
- Docs: the Overview's Install, Import and Use code blocks are colored once again (they were colored twice, which broke them into one word per line).

## 1.0.32 (2026-11-09)

- Docs: **Accessibility** is its own page (`/accessibility`), next to Overview in the side bar. It holds what the Overview said: the three layers, how components are reviewed, and the sources. The Overview no longer has that section; each component's page keeps its own accessibility list. Nothing in the lib changes.

## 1.0.31 (2026-11-09)

- **Diagram loops**: an arrow that closes a loop (its end already leads back to its start, or a node pointing to itself) is a return arrow (`DIAGRAM.bend`: `back`, read in order). Rows are the longest path over the other arrows only, so a loop no longer pushes its nodes down (A→B→A was rows 7, 0, 6; now 1, 0, 2). Every arrow is still drawn: a return arrow goes back up on the diagram's nearer side, beside the forward arrows and never over them; a node pointing to itself gets a small loop into its top. Drawing only: which arrows are allowed stays the app's choice.

## 1.0.30 (2026-11-09)

- **Chat input AA**: `.composer__field` gets what `.input` got in 1.0.19. Its border is text-3 (3.35:1, was border-strong, 1.59:1), its placeholder text-2 (6.58:1), and its shape follows `theme({ radius })` / `data-radius` (a pill stops at radius_lg, since the field grows with the text).
- Docs: the **Chat** page shows only the chat's UI, live, in a small window: your message arrives, the reply's words fade in, Start over. No agent here; Patterns → Chat shows them together.

## 1.0.29 (2026-11-09)

- Docs: the **Prose** page in the standard format. A Prose filter (On, Off) over the same HTML on a panel without a header: On shows the lib's type, Off what the browser draws. Nothing in the lib changes.

## 1.0.28 (2026-11-09)

- Docs: **Responsive** and **Prose** move to Foundations (`/foundations/responsive` after Size, `/foundations/prose` after Type). **Panel** is in the standard format: a Header filter (With, Without) over one panel with an empty art in its body. Nothing in the lib changes.

## 1.0.27 (2026-11-09)

- **Art**: `.art--empty`, an art with no image yet (the image symbol on a quiet ground, 4:3, at the sm/md/lg heights), and `.art--fill` to take the width it is given. The Art docs page shows it instead of the blue picture.
- **Doc**: `.doc--full`, the whole page less the gutters (the doc's padding). `.doc` and `.doc--wide` are unchanged.
- Docs: "Page and doc" is now **Pages**, in the standard format: Width (Reading, Full) and Content (Art, Docs), the lib's pieces as they are. **Pair** shows Hidden, Stack and Split with panels. No blocks or dots on either page; the README's example has none either.

## 1.0.26 (2026-11-09)

- **Docs: every snippet is a code block**. Each page's Code section and the Overview's Install, Import and Use show their code in a code block: the language in the head (from the README's fence), Copy, the code colored in that language. Laws keep their own look. Nothing in the lib changes.

## 1.0.25 (2026-11-09)

- **Docs: the Agent page in the standard format**. The large and the small agent side by side, centered, with no box; on top, Action (Look, Spin, Shake, Ask, Busy → Done) and Open (Click, Hover), both segmented. Each action plays on both agents; in Look they look at each other. Accessibility collapsed (4 of 4 pass, full review pending), Code, Laws. The separate Claude and OpenAI marks row is gone; the marks show inside the options. Nothing in the lib changes.

## 1.0.24 (2026-11-08)

- **Docs: Components in alphabetical order** in the side bar. Nothing in the lib changes.

## 1.0.23 (2026-11-08)

- **Docs: no Block page**. A block is the line the Thread runs through, not a component on its own; `.block` stays in the lib for the Thread and the Pair. Nothing in the lib changes.

## 1.0.22 (2026-11-08)

- **Code block**: `codeBlock(code, { lang, name, head, numbers, wrap })` and `upgrade(pre)` in `bend-ui/syntax`. A head with the file or the language and Copy (the Button's `data-copy`), the code line by line; `.code-block--numbers` (screen readers skip the numbers), `--wrap`, `--bare`. The code box takes the focus, so a keyboard can scroll long lines.
- **Seven more languages** in SYNTAX.bend: Python, Rust, Go, SQL (with `--` comments), YAML (read like TOML), Markdown and Diff (read a line at a time, `line_kind`). Two new kinds, added and removed, with tokens `syntax_added` (success-text, 5.38:1) and `syntax_removed` (danger, 5.46:1).
- `toLines()` is new in syntax.js; `highlight()` and `toHtml()` work as before.
- Docs: the Syntax page is now **Code block** (`/components/code-block`), in the standard format (Language, Header, Lines and Long lines filters; Accessibility, collapsed, 6 of 6 pass; Code).

## 1.0.21 (2026-11-08)

- **Form layouts and sections**: `.form__section` + `.form__legend` (a fieldset), `.form__row` with `.form--columns` (fields side by side), `.form--inline` (labels in their own column, `form_label_width`, new token, 128). Both stack on narrow screens. `.form` now uses the `form_gap` token (same value).
- **Form check on send** (`data-validate novalidate`): every field is checked (required, type, minlength, pattern; `data-error` is its message). Wrong fields get `aria-invalid` and their message; a `.form__summary` lists them all, linked, and takes the focus; fixing a field clears its error. If all is right, the submit `.btn--async` shows busy and the form fires `send` with `{ data, done(label), fail(message) }`. `setFieldError(control, message)` is exported. A plain `.form` stays as it is.
- Docs: the Form page in the standard format (Layout and State filters over one real form, State from Empty to Errors; Accessibility, collapsed, 7 of 7 pass; Code).

## 1.0.20 (2026-11-08)

- **Docs: the side bar shows where you are**: opening a page (from the side bar, a link, or back and forward) opens its section, closes the others, marks the page and scrolls it into view. Nothing in the lib changes.

## 1.0.19 (2026-11-08)

- **Input at WCAG AA (changes existing fields)**: the border is now text-3 (3.35:1, was 1.59:1) and the placeholder text-2 (6.58:1, was the browser's light gray). A disabled field now uses `disabled_opacity`.
- **Input sizes and shape**: `.input--sm` (24), `--lg` (36), `--xl` (48), the button heights, so a field and a button line up; the shape follows `theme({ radius })` and `data-radius` like buttons and segmented (a textarea stops at `radius_lg`).
- **States**: error (`aria-invalid="true"`, danger border and halo), `.is-valid` (success), disabled, read-only (surface-2, dashed).
- **Field**: `.field__required`, `.field__foot` with `.field__help`, `.field__msg--error` / `--success` (an icon and words), `.field__count`. `.input-icon` puts an icon inside a field; `.input-group` puts a button inside it, and the pair has one border, one focus ring and one state (in sm, where a 24px button doesn't fit inside, the button is joined on the side).
- The textarea's minimum height is the token `textarea_min_height` (96), no longer a loose `* 3`.
- Docs: the Input and field page in the standard format (Shape, Size and State filters over Text, With icon, With button, Mono, Textarea; Accessibility, collapsed, 9 of 9 pass; Code).

## 1.0.18 (2026-11-08)

- **Docs: the Dropdown menu page in the standard format**: one real dropdown, open and centered, with Items (Plain, Icons, Check, Tag) and Position (Below, End, Up) filters; a separator and a disabled item are always there. Accessibility is collapsed with its summary (8 of 16 pass). The two Variants sections and the example canvases are gone; the node menu lives on the Diagram page. Nothing in the lib changes.

## 1.0.17 (2026-11-08)

- **Segmented motion (opt-in)**: the choice moves. `.segmented--slide` puts a thumb behind the chosen item that travels to the next one; `data-motion="stretch"` leads with the edge you went toward, `data-motion="spring"` overshoots and settles. `.segmented--extend` is for icon items: the chosen one also shows its name and the thumb rides it as it opens. Text changes color in the thumb's time and curve. `initSegmented(group)` is exported. A plain `.segmented` looks and works as before.
- **`--ease-in-out`**: MOTION.bend's `ease_in_out` as a CSS easing (sampled), so CSS and JS motion share the curve with no slow tail.
- **Segmented shape**: rounded (as before), pill or sharp, from the same choice as buttons: `theme({ radius })` or `data-radius` on a container. Rounded uses `segmented_outer_radius` and `segmented_inner_radius`, the tokens the laws check (same values as before).
- Docs: the Segmented page in the new format (a Playground with Shape and Animation filters over three rows: Text, Icons, Extend; Accessibility, collapsed, 6 of 8 pass; Code; Laws). No small segmented: its 18px items would fail WCAG 2.5.8 (24px targets).

## 1.0.16 (2026-11-08)

- **Follow is removed** (owner's call): `follow.js`, the `bend-ui/follow` export, `.window__follow`, and `follow_top`, `follow_bottom`, `follow_anchor` in MOTION.bend. **Breaking** for apps that import `createFollow`. The Thread section of the README no longer uses it, and the docs have no Follow page.

## 1.0.15 (2026-11-08)

- **Docs: the Diagram page in the Button page's format**: a Playground with every look (Border, Soft) in every tone, all nodes one width, and a Tag filter; Composition (the arrows); Animations (the editable diagram on a canvas, where nodes grow, connect, rename and leave); Accessibility (collapsed, 11 of 13 pass); Code. Each page's filters only drive its own playground. Nothing in the lib changes.

## 1.0.14 (2026-11-08)

- **Docs: every page has its own address**: `/components/button`, `/foundations/color`, `/patterns/chat` (the group is the side bar's section); the Overview is the root. The address changes as you move, back and forward work, and a link opens that page. On GitHub Pages a deep link goes through `404.html`, which hands it to the docs (`?p=`); `bun run site` copies it into `site/`. Nothing in the lib changes.

## 1.0.13 (2026-11-08)

- **Every button you already have looks and measures exactly as in 1.0.12** (checked against the published site): plain `.btn`, `.btn--primary`, `.btn--ghost`, `.btn--sm`, `.btn--lg`, `.btn--icon`, `.btn--round`, disabled. Everything below is opt-in.
- **Styles and tones**: `.btn--filled`, `.btn--tinted`, `.btn--bordered`, `.btn--plain`, `.btn--link`, in accent (default), `.btn--neutral` or `.btn--danger`. `.btn--primary` is filled accent and `.btn--ghost` plain neutral, as before.
- **xl**: `.btn--xl` (48) is new. SPEC.bend's control scale is now 24, 32, 36, 48 (approved by the owner); the xl icon button holds a 24px icon (`icon_xl`) with 12px around it.
- **Wide**: `.btn--wide` keeps the height and adds one step of room on each side (sm 12, md 16, lg 24, xl 32).
- **Shape**: rounded stays the default. `theme({ radius: "rounded" | "pill" | "sharp" })`, `data-radius` on any container, or `.btn--pill` / `.btn--sharp`.
- **States and content**: `aria-disabled` keeps a disabled button findable (ui.js stops its clicks); `.btn--toggle` with `aria-pressed`; `.btn__count`; a `.kbd` inside a button.
- **Animations**: `.btn--reveal`, `.btn--hold` (fires `confirm` on release, WCAG 2.5.2), `.btn--async` with `busy()` and `done()`, `data-copy`, `.btn--extend`, and `data-reserve` so a changing button never changes width. `announce()` and `initButtons()` are exported from ui.js.
- **No loose values**: the button's side padding now comes from tokens (`btn_padding_x` and its sm/lg/xl and wide steps; same values as before), `brightness(1.08)` is `btn_hover_brightness`, and `opacity: .5` is `disabled_opacity` (also for disabled menu items). New tokens: `control_xl`, `icon_xl` (alias), `btn_padding_x_sm/lg/xl`, `btn_wide_padding_x*`, `btn_hover_brightness`, `disabled_opacity`.
- Docs: the Button page has a Playground (every style in every tone, plus an icon-only column, all one width; Shape, Size and Width filters), Animations, Accessibility (collapsed), Code and Laws. The Side bar's examples sit on a canvas.

## 1.0.12 (2026-11-08)

- **Menus open above everything**: every Dropdown menu opens in the browser's top layer (`popover`), so no scroll area cuts it and no layer covers it. It sits by its button (`.menu--end` aligns it to the end), opens up when it doesn't fit below, and follows while the page or a list scrolls. The direction comes from the new **MENU.bend** (`opens_up`); ui.js only measures. `.menu--up` still forces it up.
- **Side bar row actions**: `.side__row` with a `.dropdown.side__more` at its end. The ⋯ shows on hover, keyboard focus, while its menu is open and on the current item, and always on narrow screens; on a section it sits before the chevron. A right-click, the context-menu key or `Shift+F10` on a row opens the same menu with the focus on its first item. A section's toggle may sit in a row.
- **37 new icons** (Lucide 0.460.0, ISC), 64 in all, 2.9 KB compressed: `arrow-down`, `arrow-left`, `arrow-right`, `chevron-up`, `chevron-left`, `chevron-right`, `chevrons-up-down`, `arrow-up-down`, `corner-down-left`, `ellipsis`, `ellipsis-vertical`, `trash-2`, `pencil`, `copy`, `external-link`, `download`, `upload`, `refresh-cw`, `undo-2`, `redo-2`, `link`, `filter`, `grip-vertical`, `settings`, `lock-open`, `eye`, `eye-off`, `info`, `circle-alert`, `circle-x`, `star`, `bell`, `folder`, `user`, `calendar`, `house`, `image`.
- Docs: the Side bar page shows row actions; the Icons page shows the new icons. No new token, motion or law.

## 1.0.11 (2026-11-08)

- **Side bar: sections and groups**: every part that opens and closes is a `.side__section`. Opening one closes the others in its group; without groups the whole side bar is one group. `.side__group` is now an optional group: its sections close each other, never another group's. `data-side-multiple` on a group (or on the `.side`) keeps its sections open together. **Breaking**: rename `.side__group` to `.side__section` in apps.
- **Side bar behavior is in ui.js**: `[data-side-toggle]` opens and closes it (or the side bar whose id it names); on the rail a section's button opens the side bar too; the drawer closes with Escape or a click outside, takes the focus in and gives it back, and is `inert` while hidden. The drawer works under any `[data-narrow]`, not only the page's. `initSide` and `setSide` are exported. The docs no longer have their own toggle code.
- **Motion**: a section grows and shrinks like the thread's `openBlock` (`duration_enter`, `ease`); reduced motion turns it off. Nothing new in MOTION.bend.
- **Accessibility**: the list is a `nav`; group names are headings in text-2 (6.58:1, `.meta` was 3.35:1); groups are `role="group"`; section buttons have `aria-controls`; the side bar's button has `aria-expanded`; the current item is also medium weight (not color alone).
- Docs: the Side bar page in the new layout (Variants, Examples with and without groups, Accessibility), and a menu button on narrow screens. No new token, motion or law.

## 1.0.10 (2026-11-08)

- **Dropdown menu** (the docs page, was "Dropdown"): Variants (each kind of item: plain, with an icon, the radio check, a tag in every tone, disabled, separators; the three placements), Examples on a `.canvas` (the Text menu, a menu in groups, a diagram whose nodes open it) and an Accessibility review (WCAG 2.2, with what still fails).
- **Diagram: the node opens a Dropdown menu**: `nodeMenu: (i) => [elements]`, the menu's children built as any Dropdown menu's (icons, tags, the check, separators); each item acts on its own click. The node's button and its `.menu` are linked with `aria-controls` / `aria-labelledby`. The diagram no longer builds items of its own (it was `[{ label, disabled, onSelect }]`).
- **Tag**: `.tag--accent`, the tone that was missing. `.tag--success` and `.tag--warning` write their text in `--success-text` / `--warning-text`, so tags meet AA (4.85 and 4.78; they were 3.94 and 3.30).
- README: a second Dropdown example (groups, an icon, a tag, the check). No new token, law or motion.

## 1.0.9 (2026-11-08)

- **Accessibility in the Overview** (and the README): accessibility isn't something anyone turns on, so the library works in three layers: always on (WCAG 2.2 AA), automatic from the person's own settings (reduced motion, more contrast, forced colors, text zoom), and the app's choice of a larger size. Sources linked.
- **Tones are named by role, not by LawEditor**: `law` → `success`, `draft` → `warning`, `conflict` → `danger`, everywhere: tokens (`color_success`, `color_success_soft`…), CSS variables (`--success`…), classes (`.diagram__node--success`, `.tag--success`…), `theme()` keys (`success`, `successSoft`…) and the diagram's `tone`. The dot follows the same names: `.dot--ok` → `.dot--success`, `.dot--warn` → `.dot--warning`, `.dot--error` → `.dot--danger` (`.dot--busy` stays). **Breaking**: rename these in apps.
- **Diagram at WCAG AA by default**: arrows, node borders and the connect handle use `--text-3` (3.04–3.35:1, it was 1.52–1.59:1); soft success and warning text use the new `color_success_text` and `color_warning_text` (4.85:1 and 4.78:1, they were 3.94:1 and 3.30:1).
- **Diagram for screen readers**: `label` names the diagram (`role="graphics-document"`); each node says its tone and where its arrows go and come from; renames and connects are announced, and `announce(text)` is exported for the app's own changes; `d.focusAfterDraw(label)` keeps the focus on the node acted on; one focus ring instead of two; in free layout `Shift` + an arrow moves the focused node.
- **Diagram: rename**: `onLabelEdit(i, label)` and `d.editLabel(i)`; a double-click or `F2` also starts it. The node becomes the field, the new name forms from a blur, an empty name shakes and says why.
- **Diagram: motion from what changed**: a new node grows out of the node it comes from; `await d.leave(i)` shrinks a node and its arrows away before the app draws without it; a renamed node keeps its place. Existing motion (`MOTION.bend`, duration tokens), off with reduced motion.
- **Diagram: size**: a node is at least `diagram_node_min` (128) wide and grows in `diagram_node_step` (`space_5`) steps, from `node_width` in DIAGRAM.bend. In CSS, `--diagram-node-min` is its `min-width`, so a node drawn by hand has it too.
- **Canvas**: `.canvas`, a surface with a dot grid for something editable (the Diagram page's live example sits on one). Token `canvas_gap` (alias of `space_5`).
- New in ui.css: `.diagram__input`, `.is-editing`, `.sr-only`. New tokens: `color_success_text`, `color_warning_text` (new values), `diagram_node_min` (new value), `diagram_node_step` (alias). No new law.
- Docs: a page can split its examples into named sections (`data-section`). The Diagram page now has Variants (border tones, soft tones, the node with a tag), Composition (the arrows) and one live Example (its node menu renames, adds, connects and removes). Pages in this layout list their files under Code and have no Implementation section. The two full demos are gone.

## 1.0.8 (2026-11-08)

- **Diagram: free layout**: `mountDiagram(el, data, { positions: [{ x, y }], onNodeMove })`. With positions the nodes sit where the app puts them instead of in rows (`.diagram--free`); press a node and move it past a few pixels to drag it, and `onNodeMove(i, { x, y })` is called when it's let go. The click that ends a move doesn't open the node's menu. The diagram grows to where its nodes reach. Switching between rows and positions glides, as any redraw does.
- New: `.diagram--free`, `.is-moving` (the lifted node takes `--shadow-float`). No new token, law or motion.

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
