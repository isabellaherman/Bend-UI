import { busy, done } from "../ui.js";
import { mountAgent } from "../agent.js";
import { createThread, openBlock, formBlock } from "../thread.js";
import claude from "../brand/claude.webp";
import openai from "../brand/openai.svg";

// side: open / close

// window: framed / full
document.getElementById("win-full").addEventListener("click", (e) => {
  const full = document.getElementById("win-demo").classList.toggle("is-full");
  e.currentTarget.querySelector("use").setAttribute("href", full ? "#i-minimize" : "#i-maximize");
});

// status-ring: press and hold
const hold = document.getElementById("hold-demo");
let holdT;
hold.addEventListener("pointerdown", () => { hold.dataset.status = "hold"; holdT = setTimeout(() => hold.dataset.status = "warn", 960); });
["pointerup", "pointerleave"].forEach((ev) => hold.addEventListener(ev, () => { clearTimeout(holdT); if (hold.dataset.status === "hold") delete hold.dataset.status; }));

// agent
const items = (control) => [
  { id: control.id, icon: control.icon, label: control.label },
  { id: "a", mark: `<img src="${claude}" alt="">`, label: "Claude", ring: true },
  { id: "b", mark: `<img src="${openai}" alt="">`, label: "Codex", ring: true },
];
function demo(el, size, control) {
  const a = mountAgent(el, {
    size, items: items(control),
    onPick: (id) => {
      if (id === control.id) return a.close();
      a.setItem(id, { status: "busy" });
      setTimeout(() => { a.setItem(id, { status: "ok", pressed: true }); a.setItem(id === "a" ? "b" : "a", { status: "", pressed: false }); a.spin(); }, 900);
    },
  });
}
demo(document.getElementById("agent-lg"), "lg", { id: "min", icon: "minimize-2", label: "Minimize" });
demo(document.getElementById("agent-sm"), "sm", { id: "max", icon: "maximize-2", label: "Expand" });

// brand marks
document.getElementById("brand-claude").src = claude;
document.getElementById("brand-openai").src = openai;

// dropdown: the button shows the picked item
document.addEventListener("pick", (e) => {
  if (!e.target.matches("[data-shows-pick]")) return;   // only a menu that names its choice on its button; others' items act
  const btn = e.target.querySelector(':scope > [aria-haspopup="menu"]');
  btn.querySelector("span").textContent = e.detail.querySelector("span").textContent;
  btn.querySelector("use").setAttribute("href", e.detail.querySelector("use").getAttribute("href"));
});

// pair: plain doc, stack, split
document.getElementById("pair-mode").addEventListener("change", (e) => {
  const d = document.getElementById("pair-demo");
  d.classList.remove("doc--stack", "doc--split");
  if (e.detail.dataset.mode) d.classList.add(e.detail.dataset.mode);
});

// thread: two pairs, the second one fails
const threadDoc = document.getElementById("thread-demo");
const thread = createThread(threadDoc);
document.getElementById("thread-play").addEventListener("click", async () => {
  const pairs = [...threadDoc.querySelectorAll(".pair")];
  pairs.forEach((p) => { const a = p.querySelector(".pair__aside"); a.className = "block pair__aside"; a.innerHTML = ""; });
  await thread.begin(pairs);
  for (const [i, p] of pairs.entries()) {
    const a = p.querySelector(".pair__aside"), text = p.querySelector(".block__text").textContent;
    await Promise.all([openBlock(a, `<div class="block__slot"></div><div class="block__text thread__reading">${text}</div>`), thread.start(i)]);
    await new Promise((r) => setTimeout(r, 1400));
    const ok = i === 0;
    await Promise.all([
      formBlock(a, ok ? '<div class="block__slot"></div><div class="block__text"><span class="block__line">law mana_at_most_10:</span><span class="block__line">  {(T.mana(s) <= 10 : U32) == True{} : Bool}</span></div>'
                      : '<div class="block__slot"></div><div class="block__text">ERROR: ambiguous.</div>', ok ? "block--code" : null),
      thread.done(i, ok),
    ]);
  }
  await thread.end();
  await thread.release();
});

// =========================================================
// The docs: one page per foundation and component; each shows the laws that guard it.
// =========================================================
import { keyLabel } from "../keys.js";
import { highlight } from "../syntax.js";
import { mountDiagram, announce } from "../diagram.js";
import { mountPie, mountBars, mountLine, mountArea } from "../chart.js";
import { LAWS } from "./laws.data.js";
import pkg from "../package.json";
import { mountChatPattern } from "./patterns/chat.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const line = (dot, html, out = "") =>
  `<div class="block"><div class="block__slot">${dot ? `<span class="dot ${dot}"></span>` : ""}</div><div class="block__text">${html}</div>${out ? `<pre class="block__out">${out}</pre>` : ""}</div>`;

// Which page each law guards.
const LAWS_OF = {
  space: ["inside_less_than_between"],
  size: ["side_rail_fits", "side_width_on_grid", "window_max_on_grid", "agent_lg_on_grid"],
  radius: ["segmented_radius_nested"],
  keyboard: ["lib_keys_never_clash", "lib_keys_not_reserved", "shift_is_not_plain", "mod_is_not_plain",
    "plain_key_waits_while_typing", "shift_key_waits_while_typing", "mod_key_runs_while_typing", "app_scope_overlaps_all"],
  button: ["btn_padding_in_scale", "btn_height_in_scale", "icon_button_sm_fits", "icon_button_md_fits", "icon_button_lg_fits"],
  segmented: ["segmented_padding_in_scale", "segmented_radius_nested"],
  panel: ["panel_padding_in_scale"],
  dot: ["dot_size_in_scale"],
  ring: ["ring_offset_in_scale", "ring_width_in_scale"],
  side: ["side_rail_fits", "side_width_on_grid"],
  window: ["window_max_on_grid", "window_margin_in_scale"],
  agent: ["agent_sm_in_scale", "agent_lg_on_grid"],
};
const byName = Object.fromEntries(LAWS.map((l) => [l.name, l]));
const lawBlock = (l) => `<div class="docs-law">` +
  line("dot dot--success", esc(l.what.charAt(0).toUpperCase() + l.what.slice(1))) +
  `<div class="block block--code" data-code><div class="block__slot"></div><div class="block__text">${esc(l.code)}</div></div></div>`;
// Every page has the same shape, in this order (a section shows only when the page has it):
//   title, and what it is
//   Examples        the piece, live
//   Code            what to write to use it
//   Implementation  the classes and the files that make it
//   Laws            what is proved about it
// The content comes from the page's examples, from CODE and FILES below, and from LAWS.bend.
const FILES = {
  button: ["TOKENS.bend", "SPEC.bend", "ui.css", "ui.js"],
  color: ["TOKENS.bend", "ui.js", "ui.css"], space: ["TOKENS.bend", "ui.js", "ui.css"], size: ["TOKENS.bend", "ui.js", "ui.css"],
  radius: ["TOKENS.bend", "ui.js", "ui.css"], type: ["TOKENS.bend", "ui.js", "ui.css"],
  icons: ["icons.js", "ui.js"], keyboard: ["KEYS.bend", "keys.js"],
  diagram: ["DIAGRAM.bend", "diagram.js", "ui.css"], chart: ["CHART.bend", "chart.js", "MOTION.bend", "TOKENS.bend", "ui.css"], thread: ["MOTION.bend", "thread.js", "ui.css"],
  follow: ["MOTION.bend", "follow.js", "ui.css"], agent: ["MOTION.bend", "agent.js", "ui.css"],
  syntax: ["SYNTAX.bend", "syntax.js", "ui.css"],
  dropdown: ["ui.js", "ui.css"],
};
// Code: the README's own snippets, so the docs and the README never disagree.
// Each page shows the code blocks under its README heading (## or ###), colored in their own language (SYNTAX.bend).
import readme from "../README.md" with { type: "text" };
const SNIPPETS = (() => {
  const out = {};
  let head = "", lang = null, buf = [];
  for (const l of readme.split("\n")) {
    const h = l.match(/^#{2,3} (.+)$/);
    if (lang === null && h) { head = h[1].trim(); continue; }
    const fence = l.match(/^```(\w*)\s*$/);
    if (fence && lang === null) { lang = fence[1]; buf = []; continue; }
    if (fence && lang !== null) { (out[head] ||= []).push({ lang, code: buf.join("\n") }); lang = null; continue; }
    if (lang !== null) buf.push(l);
  }
  return out;
})();
// The README heading of each page, when it isn't the page's own title.
const README_OF = {
  color: "Tokens", space: "Tokens", size: "Tokens", radius: "Tokens", type: "Type: one ladder", keyboard: "Keys",
  page: "Page, doc and pair", pair: "Page, doc and pair", thread: "Thread and follow", follow: "Thread and follow",
  section: "Page head and sections", dropdown: "Dropdown",
};
const section = (title, ...kids) => {
  const s = document.createElement("section"); s.className = "section";
  const h = document.createElement("h2"); h.className = "section-title"; h.textContent = title;
  s.append(h, ...kids); return s;
};
const box = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; };
document.querySelectorAll("[data-page]").forEach((page) => {
  const id = page.dataset.page;
  if (id === "overview" || id.startsWith("pattern-")) return;
  const doc = page.querySelector(".doc");
  const kids = [...doc.children];
  const heading = kids.find((k) => k.classList.contains("heading"));
  const laws = kids.find((k) => k.hasAttribute("data-laws"));
  const about = kids.filter((k) => k.matches("article.prose") && !k.querySelector("h2"));
  const ex = kids.filter((k) => k !== heading && k !== laws && !about.includes(k) && !(k.matches("article.prose") && k.querySelector("h2")));
  const head = document.createElement("header"); head.className = "page-head";
  head.append(heading, ...about.map((a) => { const p = document.createElement("p"); p.className = "lead"; p.innerHTML = a.querySelector("p")?.innerHTML || ""; return p; }));
  // A page can split its examples into named sections (data-section="Variants", "Composition", …);
  // whatever has none goes under Examples.
  const named = new Map();
  for (const k of ex.filter((k) => k.dataset.section)) {
    if (!named.has(k.dataset.section)) { const b = document.createElement("div"); b.className = "section__body"; named.set(k.dataset.section, b); }
    named.get(k.dataset.section).append(k);
  }
  const exBox = document.createElement("div"); exBox.className = "section__body"; exBox.append(...ex.filter((k) => !k.dataset.section));
  // Accessibility comes after the live examples it describes; the other named sections before them.
  const after = new Set(["Animations", "Accessibility"]);
  const parts = [head, ...[...named].filter(([t]) => !after.has(t)).map(([title, b]) => section(title, b)), ...(exBox.children.length || !named.size ? [section("Examples", exBox)] : []), ...[...named].filter(([t]) => after.has(t)).map(([title, b]) => section(title, b))];
  const raws = [exBox, ...named.values()].flatMap((b) => [...b.querySelectorAll(".v-item > code")]).map((c) => c.textContent);
  const snippets = SNIPPETS[README_OF[id] || heading.textContent.trim()] || [];
  const files = FILES[id] || ["ui.css"];
  // Pages in the new layout (named sections) list their files under Code and have no Implementation.
  const fileLine = named.size ? [box(`<p class="detail mono">${files.map(esc).join(" · ")}</p>`)] : [];
  if (snippets.length || fileLine.length) parts.push(section("Code", ...fileLine, ...snippets.map(({ lang, code }) => {
    const pre = box(`<article class="prose"><pre><code></code></pre></article>`);
    pre.querySelector("code").textContent = code;
    pre.querySelector("pre").dataset.lang = lang;
    return pre;
  })));
  const classes = [...new Set(raws.flatMap((r) => r.match(/\.[a-z][\w-]*(?:__[\w-]+)?(?:--[\w-]+)?/g) || []))];
  const tokens = [...new Set(raws.filter((r) => r.startsWith("--")).map((r) => r.split(" ")[0]))];
  const listed = classes.length ? classes : tokens;
  if (!named.size) parts.push(section("Implementation", box(`<div class="outline"><div class="outline__item"><span class="item-title">Files</span><p class="detail mono">${files.map(esc).join(" · ")}</p></div>${listed.length ? `<div class="outline__item"><span class="item-title">${classes.length ? "Classes" : "Tokens"}</span><p class="detail mono">${listed.map(esc).join(" · ")}</p></div>` : ""}</div>`)));
  const names = LAWS_OF[laws?.dataset.laws] || [];
  if (names.length) parts.push(section(`Laws · ${names.length}`, box(`<div>${names.map((n) => lawBlock(byName[n])).join("")}</div>`)));
  laws?.remove();
  doc.replaceChildren(...parts);
});
document.querySelectorAll(".section .prose pre[data-lang]").forEach((pre) => highlight(pre));

// Overview: the version and how many laws hold.
$("docs-version").textContent = "v" + pkg.version;
$("docs-status").lastChild.textContent = `${LAWS.length} laws · all proofs check`;

// Keyboard: the rules, and the lib's own keys.
document.querySelector("[data-keys]").innerHTML = [
  ["Exact", "Shift+K is not K; " + keyLabel(1, "k") + " is not K."],
  ["Scopes", "0 the app, always on; 1 an open menu; 2 an open agent. An app key clashes with every scope."],
  ["Typing", "In a field, only keys with ⌘/Ctrl or Alt run. A plain key types its letter (WCAG 2.1.4)."],
  ["Reserved", "⌘/Ctrl + W, T, N, Q, L, R stay the browser's."],
].map(([a, b]) => line("dot dot--success", `<b>${a}</b>. ${esc(b)}`)).join("") +
  `<article class="prose"><h2>The lib's own keys</h2></article>` +
  [["Open menu", "escape", "Close it"], ["Open menu", "arrowdown", "Next item"], ["Open menu", "arrowup", "Previous item"], ["Open agent", "escape", "Close it"]]
    .map(([scope, k, what]) => line("", `<span class="kbd">${esc(keyLabel(0, k))}</span> ${what}`, scope)).join("");

// Each example's label: a plain name; on hover, the class it shows, in the same place.
const LABEL = {
  ".btn + .icon": "with icon", "textarea.input": "textarea", ".kbd": "key",
  ".dropdown .menu .menu__item": "dropdown", ".rows .row": "rows", ".desk .window / .window.is-full": "window",
  ".pair .pair__aside · .block--code": "pair", ".form · .field · .actions": "form", ".side.is-open": "open",
  ".page · .doc · .doc__head · .doc__note · .doc__sub · .doc--wide": "page and doc",
  ".chat · .msg · .msg--me · .msg--face": "messages", ".composer · .composer__field · .composer__text · .composer__send": "composer",
  ".prose pre.syntax": "code box", ".block--code.syntax": "law block",
  ".window__follow · createFollow(page, { button })": "follow button", "createThread · openBlock · formBlock": "thread",
  "brand/claude.webp": "Claude mark", "brand/openai.svg": "OpenAI mark",
  ".page-head · .section · .section__body": "page", ".separator": "separator", ".divided": "divided",
  ".diagram--soft": "soft", ".diagram__node + .tag--mono": "with tag",
  ".section-title · --role-section · .prose h1": "section", ".group-title · --role-group · .prose h2": "group",
  ".text · .prose p": "text", ".item-title · --role-item · .prose h3": "item", ".detail · .meta": "detail",
  ".syntax__kw · __type · __str · __num · __com · __punct · __name": "colors",
  "mountPie(el, slices)": "pie", "mountBars(el, points)": "bars", "mountLine(el, points)": "line", "mountArea(el, points)": "area",
  "replay()": "play again",
};
const words = (s) => s.replace(/[-_]+/g, " ").trim();
function labelOf(raw, siblings) {
  if (LABEL[raw]) return LABEL[raw];
  if (raw.startsWith("--")) return words(raw.slice(2));                    // a token
  if (raw.startsWith("#i-")) return words(raw.slice(3));                   // an icon
  const status = raw.match(/^\[data-status="(\w+)"\]$/); if (status) return status[1];
  if (!raw.startsWith(".")) return words(raw);
  const out = [];
  for (const part of raw.split(/(?=\.)/)) {
    const c = part.replace(/^\./, "").trim(); if (!c) continue;
    const states = [...c.matchAll(/:([a-z-]+)|\[aria-([a-z]+)[^\]]*\]/g)].map((m) => m[1] || m[2]);
    const base = c.replace(/[:[].*$/, "");
    if (base.includes("--")) out.push(words(base.split("--").pop()));
    else if (base.includes("__")) out.push(words(base.split("__").pop()));
    else if (!states.length) out.push(siblings.some((x) => x.startsWith("." + base + "--")) ? "default" : words(base));
    out.push(...states);
  }
  return out.join(" ");
}
document.querySelectorAll("[data-page]").forEach((page) => {
  const codes = [...page.querySelectorAll(".v-item > code")], raws = codes.map((c) => c.textContent);
  codes.forEach((c, i) => { c.innerHTML = `<span class="v-name">${esc(labelOf(raws[i], raws))}</span><span class="v-class">${esc(raws[i])}</span>`; });
});

// Code in the lib's own syntax (Snow).
document.querySelectorAll('[data-code], [data-syntax-demo], [data-page="overview"] .prose pre').forEach((el) => highlight(el));
const chatFace = $("chat-face"); if (chatFace) mountAgent(chatFace, { size: "sm", items: [] });

// Navigation: one page at a time; the side bar marks it.
const main = $("docs-main");
function go(id) {
  main.querySelectorAll("[data-page]").forEach((s) => (s.hidden = s.dataset.page !== id));
  document.querySelectorAll("#docs-nav [data-go]").forEach((b) => (b.dataset.go === id ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
  main.scrollTop = 0;
  if (id === "chart") charts.forEach((c) => c.replay());   // the entrance plays when the page shows
}
$("docs-nav").addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });
main.addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });   // "Made of" links

// Patterns: components put together.
mountChatPattern(document.querySelector('[data-pattern="chat"]'));
// Button: the playground. Every style (rows) in every tone (columns), all one width; pick the shape and size.
const btnPreview = document.getElementById("btn-preview");
if (btnPreview) {
  const pick = { shape: "rounded", size: "md", width: "normal" };
  const styles = [["filled", "Filled"], ["tinted", "Tinted"], ["bordered", "Bordered"], ["plain", "Plain"], ["link", "Link"]];
  const tones = [["", "Accent", "Save"], ["neutral", "Neutral", "Cancel"], ["danger", "Danger", "Delete"]];
  const draw = () => {
    const size = (pick.size === "md" ? "" : " btn--" + pick.size) + (pick.width === "wide" ? " btn--wide" : "");
    btnPreview.dataset.radius = pick.shape;
    // The last column is the icon-only button: a circle in Pill, a square in Rounded and Sharp.
    btnPreview.innerHTML = '<span></span>' + tones.map(([, name]) => `<span class="detail">${name}</span>`).join("") + '<span class="detail">Icon</span>' +
      styles.map(([st, name]) => `<span class="detail">${name}</span>` + tones.map(([t, , label]) => `<button class="btn btn--${st}${t ? " btn--" + t : ""}${size}">${label}</button>`).join("") +
        (st === "link" ? "<span></span>" : `<button class="btn btn--${st} btn--icon${size}" aria-label="Add"><svg class="icon" aria-hidden="true"><use href="#i-plus"/></svg></button>`)).join("");
  };
  document.querySelectorAll("[data-filter]").forEach((g) => g.addEventListener("change", (e) => { pick[g.dataset.filter] = e.detail.dataset.value; draw(); }));
  draw();
}
// Button animations: Publish shows busy, then done (a real app would wait for its work here).
document.addEventListener("click", (e) => {
  const b = e.target.closest(".js-async");
  if (!b || b.getAttribute("aria-busy") === "true" || b.classList.contains("is-done")) return;
  busy(b, true);
  setTimeout(() => done(b, b.dataset.did), 1800);
});

// Diagram: one live example. Its node menu renames, adds, connects and removes; a double-click or F2
// renames; dragging the dot under a node connects it. Every change moves the way the lib does it.
const flow = {
  nodes: [{ label: "Hello" }, { label: "Click me", tone: "accent" }],
  edges: [{ from: 0, to: 1 }],
};
let live;
const linked = (a, b) => flow.edges.some((e) => e.from === a && e.to === b);
// The node opens a Dropdown menu: each item is the lib's .menu__item.
const menuItem = ({ label, onSelect, disabled }) => {
  const b = document.createElement("button"); b.className = "menu__item"; b.type = "button"; b.setAttribute("role", "menuitem"); b.disabled = !!disabled;
  const t = document.createElement("span"); t.textContent = label; b.append(t); b.addEventListener("click", onSelect); return b;
};
function drawLive() {
  live?.destroy();
  live = mountDiagram($("diagram-live"), flow, {
    label: "Publishing flow",
    isValidConnection: ({ source, target }) => !linked(source, target),
    onConnect: ({ source, target }) => { flow.edges.push({ from: source, to: target }); drawLive(); },
    onLabelEdit: (i, label) => { flow.nodes[i] = { ...flow.nodes[i], label }; drawLive(); },
    nodeMenu: (i) => [
      { label: "Rename", onSelect: () => live.editLabel(i) },
      { label: "Add node below", onSelect: () => {
        let n = 1; while (flow.nodes.some((x) => x.label === "Step " + n)) n++;
        flow.nodes.push({ label: "Step " + n }); flow.edges.push({ from: i, to: flow.nodes.length - 1 });
        announce("Added Step " + n + " below " + flow.nodes[i].label); live.focusAfterDraw("Step " + n); drawLive();
      } },
      ...flow.nodes.map((x, j) => (j !== i && !linked(i, j) ? { label: "Connect to " + x.label, onSelect: () => {
        announce("Connected " + flow.nodes[i].label + " to " + x.label); live.focusAfterDraw(flow.nodes[i].label);
        flow.edges.push({ from: i, to: j }); drawLive();
      } } : null)).filter(Boolean),
      { label: "Remove", disabled: flow.nodes.length < 2, onSelect: async () => {
        await live.leave(i);
        const near = flow.edges.find((e) => e.to === i)?.from ?? flow.edges.find((e) => e.from === i)?.to;
        const keep = near !== undefined ? flow.nodes[near].label : null;
        flow.nodes.splice(i, 1);
        flow.edges = flow.edges.filter((e) => e.from !== i && e.to !== i).map((e) => ({ ...e, from: e.from - (e.from > i), to: e.to - (e.to > i) }));
        if (keep) live.focusAfterDraw(keep);
        drawLive();
      } },
    ].map(menuItem),
  });
}
drawLive();
// Diagram: its arrows.
mountDiagram($("diagram-arrow"), { nodes: [{ label: "Node" }, { label: "Node", tone: "accent" }], edges: [{ from: 0, to: 1 }] });
mountDiagram($("diagram-label"), { nodes: [{ label: "Node", tone: "warning" }, { label: "Node", tone: "success" }], edges: [{ from: 0, to: 1, label: "Label" }] });
mountDiagram($("diagram-branch"), { nodes: [{ label: "Node", tone: "accent" }, { label: "Node", tone: "success" }, { label: "Node", tone: "danger" }], edges: [{ from: 0, to: 1, label: "A" }, { from: 0, to: 2, label: "B" }] });
mountDiagram($("diagram-join"), { nodes: [{ label: "Node" }, { label: "Node", tone: "warning" }], edges: [{ from: 0, to: 1, label: "A" }, { from: 0, to: 1, label: "B" }] });
// Chart: the four marks, then the pie's looks. Each plays its entrance when the page shows, or on Play.
const schools = [{ label: "Fire", value: 46 }, { label: "Water", value: 27 }, { label: "Earth", value: 17 }, { label: "Air", value: 10 }];
const week = (values) => values.map((value, i) => ({ label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], value }));
const charts = [
  mountPie($("chart-pie"), schools),
  mountBars($("chart-bars"), week([42, 58, 51, 74, 66, 38, 47])),
  mountLine($("chart-line"), week([28, 34, 31, 45, 52, 49, 61])),
  mountArea($("chart-area"), week([12, 18, 15, 26, 31, 27, 36])),
  ...["chart-plain", "chart-split", "chart-donut", "chart-donut-split"].map((id) => mountPie($(id), schools)),
];
$("chart-play").addEventListener("click", () => charts.forEach((c) => c.replay()));
go("overview");

// Dropdown menu: a diagram whose nodes are triggers; the items are built as any Dropdown menu's.
{
  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, cls, text) => { const x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; };
  const icon = (name, cls = "icon icon--sm") => { const x = document.createElementNS(NS, "svg"); x.setAttribute("class", cls); x.setAttribute("aria-hidden", "true"); if (name) { const u = document.createElementNS(NS, "use"); u.setAttribute("href", "#i-" + name); x.append(u); } return x; };
  const item = (label, name, onClick) => { const b = make("button", "menu__item"); b.type = "button"; b.setAttribute("role", "menuitem"); b.append(icon(name), make("span", "", label)); b.addEventListener("click", onClick); return b; };
  const radio = (tone, label, checked, onClick) => { const b = make("button", "menu__item"); b.type = "button"; b.setAttribute("role", "menuitemradio"); b.setAttribute("aria-checked", String(checked)); const s = make("span", ""); s.append(make("span", "tag" + (tone ? " tag--" + tone : ""), label)); b.append(icon(), s, icon("check", "icon icon--sm menu__check")); b.addEventListener("click", onClick); return b; };
  const sep = () => make("hr", "separator");
  const COLORS = [["accent", "Blue"], ["success", "Green"], ["warning", "Yellow"], ["danger", "Red"], ["", "None"]];
  const el = $("dropdown-diagram");
  let s = { nodes: [{ label: "Idea", tone: "accent" }, { label: "Draft", tone: "warning" }, { label: "Review", tone: "" }, { label: "Fix", tone: "danger" }, { label: "Publish", tone: "success" }], edges: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 2, to: 4 }], next: 1 };
  let d;
  const has = (a, b) => s.edges.some((e) => e.from === a && e.to === b);
  const reaches = (a, b) => a === b || s.edges.some((e) => e.from === a && reaches(e.to, b));
  const after = (focus) => { draw(); d.focusAfterDraw?.(focus); };
  const menu = (i) => {
    const n = s.nodes[i], out = s.edges.filter((e) => e.from === i).map((e) => e.to);
    const targets = s.nodes.map((_, j) => j).filter((j) => j !== i && !has(i, j) && !reaches(j, i));
    return [
      item("Add node below", "plus", () => { const label = "New " + s.next++; s.nodes.push({ label, tone: "" }); s.edges.push({ from: i, to: s.nodes.length - 1 }); after(label); }),
      item("Rename", "text", () => d.editLabel?.(i)),
      ...(targets.length ? [sep(), ...targets.map((j) => item("Connect to " + s.nodes[j].label, "", () => { s.edges.push({ from: i, to: j }); after(n.label); }))] : []),
      sep(),
      ...COLORS.map(([t, name]) => radio(t, name, t === n.tone, () => { n.tone = t; after(n.label); })),
      sep(),
      ...out.map((j) => item("Remove arrow to " + s.nodes[j].label, "x", () => { s.edges = s.edges.filter((e) => !(e.from === i && e.to === j)); after(n.label); })),
      item("Delete node", "x", async () => { await d.leave?.(i); s.edges = s.edges.filter((e) => e.from !== i && e.to !== i).map((e) => ({ from: e.from - (e.from > i), to: e.to - (e.to > i) })); s.nodes.splice(i, 1); after(s.nodes[0]?.label); }),
    ];
  };
  function draw() { d?.destroy(); d = mountDiagram(el, { nodes: s.nodes.map((n) => ({ label: n.label, tone: n.tone })), edges: s.edges }, { label: "Release flow", nodeMenu: menu, onLabelEdit: (i, label) => { s.nodes[i].label = label; after(label); } }); }
  draw();
}
