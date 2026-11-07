import "../ui.js";
import { mountAgent } from "../agent.js";
import { createThread, openBlock, formBlock } from "../thread.js";
import claude from "../brand/claude.webp";
import openai from "../brand/openai.svg";

// side: open / close
document.querySelectorAll("[data-side-toggle]").forEach((b) => b.addEventListener("click", () => b.closest(".side").classList.toggle("is-open")));

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
import { mountDiagram } from "../diagram.js";
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
  line("dot dot--ok", esc(l.what.charAt(0).toUpperCase() + l.what.slice(1))) +
  `<div class="block block--code" data-code><div class="block__slot"></div><div class="block__text">${esc(l.code)}</div></div></div>`;
// Every page has the same shape, in this order (a section shows only when the page has it):
//   title, and what it is
//   Examples        the piece, live
//   Code            what to write to use it
//   Implementation  the classes and the files that make it
//   Laws            what is proved about it
// The content comes from the page's examples, from CODE and FILES below, and from LAWS.bend.
const FILES = {
  color: ["TOKENS.bend", "ui.js", "ui.css"], space: ["TOKENS.bend", "ui.js", "ui.css"], size: ["TOKENS.bend", "ui.js", "ui.css"],
  radius: ["TOKENS.bend", "ui.js", "ui.css"], type: ["TOKENS.bend", "ui.js", "ui.css"],
  icons: ["icons.js", "ui.js"], keyboard: ["KEYS.bend", "keys.js"],
  diagram: ["DIAGRAM.bend", "diagram.js", "ui.css"], thread: ["MOTION.bend", "thread.js", "ui.css"],
  follow: ["MOTION.bend", "follow.js", "ui.css"], agent: ["MOTION.bend", "agent.js", "ui.css"],
  syntax: ["SYNTAX.bend", "syntax.js", "ui.css"],
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
  section: "Page head and sections",
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
  const exBox = document.createElement("div"); exBox.className = "section__body"; exBox.append(...ex);
  const parts = [head, section("Examples", exBox)];
  const raws = [...exBox.querySelectorAll(".v-item > code")].map((c) => c.textContent);
  const snippets = SNIPPETS[README_OF[id] || heading.textContent.trim()] || [];
  if (snippets.length) parts.push(section("Code", ...snippets.map(({ lang, code }) => {
    const pre = box(`<article class="prose"><pre><code></code></pre></article>`);
    pre.querySelector("code").textContent = code;
    pre.querySelector("pre").dataset.lang = lang;
    return pre;
  })));
  const files = FILES[id] || ["ui.css"];
  const classes = [...new Set(raws.flatMap((r) => r.match(/\.[a-z][\w-]*(?:__[\w-]+)?(?:--[\w-]+)?/g) || []))];
  const tokens = [...new Set(raws.filter((r) => r.startsWith("--")).map((r) => r.split(" ")[0]))];
  const named = classes.length ? classes : tokens;
  parts.push(section("Implementation", box(`<div class="outline"><div class="outline__item"><span class="item-title">Files</span><p class="detail mono">${files.map(esc).join(" · ")}</p></div>${named.length ? `<div class="outline__item"><span class="item-title">${classes.length ? "Classes" : "Tokens"}</span><p class="detail mono">${named.map(esc).join(" · ")}</p></div>` : ""}</div>`)));
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
].map(([a, b]) => line("dot dot--ok", `<b>${a}</b>. ${esc(b)}`)).join("") +
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
  ".diagram--soft .diagram__node": "soft", ".diagram--soft .diagram__node--accent": "soft accent", ".diagram--soft .diagram__node--law": "soft law",
  ".diagram--soft .diagram__node--draft": "soft draft", ".diagram--soft .diagram__node--conflict": "soft conflict",
  ".section-title · --role-section · .prose h1": "section", ".group-title · --role-group · .prose h2": "group",
  ".text · .prose p": "text", ".item-title · --role-item · .prose h3": "item", ".detail · .meta": "detail",
  ".syntax__kw · __type · __str · __num · __com · __punct · __name": "colors",
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
}
$("docs-nav").addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });
main.addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });   // "Made of" links

// Patterns: components put together.
mountChatPattern(document.querySelector('[data-pattern="chat"]'));
// Diagram: its parts, then a small game's flow, in both looks.
mountDiagram($("diagram-arrow"), { nodes: [{ label: "Node" }, { label: "Node" }], edges: [{ from: 0, to: 1 }] });
mountDiagram($("diagram-label"), { nodes: [{ label: "Node" }, { label: "Node" }], edges: [{ from: 0, to: 1, label: "Label" }] });
mountDiagram($("diagram-branch"), { nodes: [{ label: "Node" }, { label: "Node" }, { label: "Node" }], edges: [{ from: 0, to: 1, label: "A" }, { from: 0, to: 2, label: "B" }] });
mountDiagram($("diagram-join"), { nodes: [{ label: "Node" }, { label: "Node" }], edges: [{ from: 0, to: 1, label: "A" }, { from: 0, to: 1, label: "B" }] });
mountDiagram($("diagram-demo"), {
  nodes: [
    { label: "Title screen" },
    { label: "Play", tone: "accent" },
    { label: "Lose a life", tone: "draft" },
    { label: "Clear the level", tone: "law" },
    { label: "Game over", tone: "conflict" },
    { label: "Next level", tone: "law" },
  ],
  edges: [
    { from: 0, to: 1, label: "Start" },
    { from: 1, to: 2, label: "hit" },
    { from: 1, to: 3, label: "all keys" },
    { from: 2, to: 4, label: "0 lives" },
    { from: 3, to: 5 },
  ],
});
mountDiagram($("diagram-demo-soft"), {
  nodes: [
    { label: "Title screen" },
    { label: "Play", tone: "accent" },
    { label: "Lose a life", tone: "draft" },
    { label: "Clear the level", tone: "law" },
    { label: "Game over", tone: "conflict" },
    { label: "Next level", tone: "law" },
  ],
  edges: [
    { from: 0, to: 1, label: "Start" },
    { from: 1, to: 2, label: "hit" },
    { from: 1, to: 3, label: "all keys" },
    { from: 2, to: 4, label: "0 lives" },
    { from: 3, to: 5 },
  ],
});
$("docs-side-toggle").addEventListener("click", () => $("docs-side").classList.toggle("is-open"));
go("overview");
