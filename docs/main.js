import { busy, done, initSegmented, initButtons, setFieldError } from "../ui.js";
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

// agent: the large and the small side by side. Open rebuilds both; each Action plays its move on both.
{
  let agents = [], timers = [], open = "click";
  const later = (ms, f) => timers.push(setTimeout(f, ms));
  const busyThenDone = (a, id) => {
    a.open(); a.setItem(id, { status: "busy", label: "Connecting…" });
    later(1400, () => {
      a.setItem(id, { status: "ok", pressed: true, label: id === "a" ? "Claude" : "Codex" });
      a.setItem(id === "a" ? "b" : "a", { status: "", pressed: false });
      a.spin();
    });
  };
  const mount = (spot, size) => {
    spot.replaceChildren(document.createElement("div"));   // a fresh root each time
    const control = size === "lg" ? { id: "min", icon: "minimize-2", label: "Minimize" } : { id: "max", icon: "maximize-2", label: "Expand" };
    const a = mountAgent(spot.firstElementChild, {
      size, open, label: size === "lg" ? "Assistant, large" : "Assistant, small",
      items: [control,
        { id: "a", mark: `<img src="${claude}" alt="">`, label: "Claude", ring: true },
        { id: "b", mark: `<img src="${openai}" alt="">`, label: "Codex", ring: true }],
      onPick: (id) => (id === "a" || id === "b" ? busyThenDone(a, id) : a.close()),
    });
    a.setItem("a", { pressed: true, status: "ok" });
    return a;
  };
  const build = () => {
    timers.forEach(clearTimeout); timers = [];
    agents.forEach((a) => a.destroy());
    agents = [mount(document.getElementById("agent-lg"), "lg"), mount(document.getElementById("agent-sm"), "sm")];
  };
  const ACTIONS = {
    // Look: each one looks at the other for a moment.
    look: (a) => { a.close(); a.lookAtEl(agents.find((o) => o !== a).face); later(2600, () => a.lookAtEl(null)); },
    spin: (a) => { a.lookAtEl(null); a.spin(); },
    shake: (a) => { a.lookAtEl(null); a.shake(); },
    ask: (a) => a.ask(true),
    busy: (a) => busyThenDone(a, a.el.querySelector('[data-id="a"]').getAttribute("aria-pressed") === "true" ? "b" : "a"),
  };
  document.querySelector("[data-agent-open]").addEventListener("change", (e) => { open = e.detail.dataset.value; build(); });
  // Action is a segmented: picking an option plays it, and picking it again plays it again.
  document.querySelectorAll("[data-agent-actions] button").forEach((b) => b.addEventListener("click", () => agents.forEach(ACTIONS[b.dataset.value])));
  build();
}

// dropdown: the button shows the picked item
document.addEventListener("pick", (e) => {
  if (!e.target.matches("[data-shows-pick]")) return;   // only a menu that names its choice on its button; others' items act
  const btn = e.target.querySelector(':scope > [aria-haspopup="menu"]');
  btn.querySelector("span").textContent = e.detail.querySelector("span").textContent;
  btn.querySelector("use").setAttribute("href", e.detail.querySelector("use").getAttribute("href"));
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
import { highlight, codeBlock, upgrade } from "../syntax.js";
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
  form: ["TOKENS.bend", "ui.css", "ui.js"],
  input: ["TOKENS.bend", "ui.css"],
  segmented: ["TOKENS.bend", "MOTION.bend", "ui.css", "ui.js"],
  button: ["TOKENS.bend", "SPEC.bend", "ui.css", "ui.js"],
  color: ["TOKENS.bend", "ui.js", "ui.css"], space: ["TOKENS.bend", "ui.js", "ui.css"], size: ["TOKENS.bend", "ui.js", "ui.css"],
  radius: ["TOKENS.bend", "ui.js", "ui.css"], type: ["TOKENS.bend", "ui.js", "ui.css"],
  icons: ["icons.js", "ui.js"], keyboard: ["KEYS.bend", "keys.js"],
  diagram: ["DIAGRAM.bend", "diagram.js", "ui.css"], chart: ["CHART.bend", "chart.js", "MOTION.bend", "TOKENS.bend", "ui.css"], thread: ["MOTION.bend", "thread.js", "ui.css"],
  agent: ["MOTION.bend", "agent.js", "ui.css"],
  "code-block": ["SYNTAX.bend", "syntax.js", "TOKENS.bend", "ui.css"],
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
  page: "Page, doc and pair", pair: "Page, doc and pair", thread: "Thread",
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
  const after = new Set(["Animations", "Accessibility"]);   // after Playground and Composition
  const parts = [head, ...[...named].filter(([t]) => !after.has(t)).map(([title, b]) => section(title, b)), ...(exBox.children.length || !named.size ? [section("Examples", exBox)] : []), ...[...named].filter(([t]) => after.has(t)).map(([title, b]) => section(title, b))];
  const raws = [exBox, ...named.values()].flatMap((b) => [...b.querySelectorAll(".v-item > code")]).map((c) => c.textContent);
  const snippets = SNIPPETS[README_OF[id] || heading.textContent.trim()] || [];
  const files = FILES[id] || ["ui.css"];
  // Pages in the new layout (named sections) list their files under Code and have no Implementation.
  const fileLine = named.size ? [box(`<p class="detail mono">${files.map(esc).join(" · ")}</p>`)] : [];
  // Each snippet is a code block: its language in the head, Copy, the code colored in that language.
  if (snippets.length || fileLine.length) parts.push(section("Code", ...fileLine,
    ...(snippets.length ? [box(`<div class="docs-codes">${snippets.map(({ lang, code }) => codeBlock(code, { lang })).join("")}</div>`)] : [])));
  const classes = [...new Set(raws.flatMap((r) => r.match(/\.[a-z][\w-]*(?:__[\w-]+)?(?:--[\w-]+)?/g) || []))];
  const tokens = [...new Set(raws.filter((r) => r.startsWith("--")).map((r) => r.split(" ")[0]))];
  const listed = classes.length ? classes : tokens;
  if (!named.size) parts.push(section("Implementation", box(`<div class="outline"><div class="outline__item"><span class="item-title">Files</span><p class="detail mono">${files.map(esc).join(" · ")}</p></div>${listed.length ? `<div class="outline__item"><span class="item-title">${classes.length ? "Classes" : "Tokens"}</span><p class="detail mono">${listed.map(esc).join(" · ")}</p></div>` : ""}</div>`)));
  const names = LAWS_OF[laws?.dataset.laws] || [];
  if (names.length) parts.push(section(`Laws · ${names.length}`, box(`<div>${names.map((n) => lawBlock(byName[n])).join("")}</div>`)));
  laws?.remove();
  doc.replaceChildren(...parts);
});

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
  "createThread · openBlock · formBlock": "thread",
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
// Overview: Install, Import and Use are code blocks too; laws (.block--code) are colored in place.
document.querySelectorAll('[data-page="overview"] .prose pre[data-lang]').forEach((pre) => upgrade(pre));
document.querySelectorAll('[data-code], [data-page="overview"] .prose pre').forEach((el) => highlight(el));
const chatFace = $("chat-face"); if (chatFace) mountAgent(chatFace, { size: "sm", items: [] });

// Navigation: one page at a time, each at its own address (/components/button, /foundations/color);
// the side bar marks it, and back and forward work. The group comes from the side bar's section.
const main = $("docs-main");
const PATH = {}, ID = {};
document.querySelectorAll("#docs-nav [data-go]").forEach((b) => {
  const id = b.dataset.go;
  const group = b.closest(".side__section")?.querySelector(".side__toggle .side__text")?.textContent.trim().toLowerCase();
  PATH[id] = id === "overview" || !group ? "" : group + "/" + id.replace(/^pattern-/, "");
  ID[PATH[id]] = id;
});
// Where the docs live (/ locally, /Bend-UI/ on GitHub Pages): the address minus the page's own path.
// A deep link that reached 404.html comes back as ?p=/components/button.
const asked = new URLSearchParams(location.search).get("p");
let BASE = location.pathname, START = asked?.replace(/^\/|\/$/g, "") ?? "";
if (asked === null) {
  const here = BASE.replace(/\/$/, ""), found = Object.keys(ID).find((r) => r && here.endsWith("/" + r));
  if (found) { START = found; BASE = here.slice(0, -found.length); }
}
if (!BASE.endsWith("/")) BASE += "/";
function go(id, push = true) {
  if (!(id in PATH)) id = "overview";
  main.querySelectorAll("[data-page]").forEach((s) => (s.hidden = s.dataset.page !== id));
  document.querySelectorAll("#docs-nav [data-go]").forEach((b) => (b.dataset.go === id ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
  // The side bar shows where you are: the current page's section opens (the others close, as they do on a
  // click) and the page's item scrolls into view, also when the page was opened from a link.
  const here = document.querySelector(`#docs-nav [data-go="${id}"]`), toggle = here?.closest(".side__section")?.querySelector(":scope > .side__toggle");
  if (toggle && toggle.getAttribute("aria-expanded") !== "true")
    document.querySelectorAll("#docs-nav .side__section > .side__toggle").forEach((t) => t.setAttribute("aria-expanded", String(t === toggle)));
  here?.scrollIntoView({ block: "nearest" });
  main.scrollTop = 0;
  if (id === "chart") charts.forEach((c) => c.replay());   // the entrance plays when the page shows
  const url = BASE + PATH[id] + location.hash;
  if (push && location.pathname + location.search !== BASE + PATH[id]) history.pushState({ id }, "", url);
  else history.replaceState({ id }, "", url);
}
addEventListener("popstate", (e) => go(e.state?.id ?? ID[location.pathname.slice(BASE.length).replace(/\/$/, "")] ?? "overview", false));
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
  document.querySelectorAll('[data-page="button"] [data-filter]').forEach((g) => g.addEventListener("change", (e) => { pick[g.dataset.filter] = e.detail.dataset.value; draw(); }));
  draw();
}
// Diagram: the playground. Every look (rows) in every tone (columns), all one width; pick a tag or none.
const nodePreview = document.getElementById("node-preview");
if (nodePreview) {
  const pick = { tag: "off" };
  const looks = [["", "Border"], ["soft", "Soft"]];
  const tones = [["", "Neutral"], ["accent", "Accent"], ["success", "Success"], ["warning", "Warning"], ["danger", "Danger"]];
  const draw = () => {
    const tag = pick.tag === "on" ? '<span class="tag tag--mono">loop</span>' : "";
    nodePreview.innerHTML = '<span></span>' + tones.map(([, n]) => `<span class="detail">${n}</span>`).join("") +
      looks.map(([look, name]) => `<span class="detail">${name}</span>` + tones.map(([t, n]) =>
        `<div class="${look ? "diagram--soft" : ""}" style="display:contents"><div class="diagram__node${t ? " diagram__node--" + t : ""}"><span class="diagram__text">${n}</span>${tag}</div></div>`).join("")).join("");
  };
  document.querySelectorAll('[data-page="diagram"] [data-filter]').forEach((g) => g.addEventListener("change", (e) => { pick[g.dataset.filter] = e.detail.dataset.value; draw(); }));
  draw();
}
// Segmented: the playground. Shape and animation come from the filters; the three rows follow them.
const segPreview = document.getElementById("seg-preview");
if (segPreview) {
  document.querySelector('[data-page="segmented"] [data-filter="shape"]').addEventListener("change", (e) => { segPreview.dataset.radius = e.detail.dataset.value; });
  document.querySelector('[data-page="segmented"] [data-filter="animation"]').addEventListener("change", (e) => {
    const motion = e.detail.dataset.value;
    segPreview.querySelectorAll(".js-seg").forEach((g) => {
      if (g.classList.contains("segmented--extend")) return;   // extend always moves with its names
      g.querySelector(":scope > .segmented__thumb")?.remove();
      g.classList.toggle("segmented--slide", motion !== "none");
      if (motion === "none") delete g.dataset.motion; else g.dataset.motion = motion;
      initSegmented(g);
    });
  });
}
// Input and field: the playground. Shape, size and state from the filters; five kinds of field below.
const inputPreview = document.getElementById("input-preview");
if (inputPreview) {
  const pick = { shape: "rounded", size: "md", state: "focus" };
  const icon = (n) => `<svg class="icon" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  let uid = 0;
  const TEXT = {
    text: ["Name", "As it shows on your profile.", "Write a name.", "Looks good.", "Isabella", "Your name"],
    icon: ["Search", "Laws, pages or people.", "Nothing matches.", "3 results.", "laws", "Search"],
    button: ["Share link", "Anyone with the link can view.", "This link expired.", "Copied.", "https://bend-ui.dev/r/9f2", "https://"],
    mono: ["Law name", "Lowercase, with underscores.", "Use lowercase and underscores.", "Available.", "mana_at_most_10", "law_name"],
    area: ["Description", "", "Write at least 10 characters.", "Saved.", "Mana never goes above 10.", "What it guarantees"],
  };
  const field = (kind) => {
    const [label, help, error, ok, value, placeholder] = TEXT[kind], id = "in" + ++uid, msg = id + "-m", st = pick.state;
    const filled = st !== "rest" && st !== "focus";
    const size = pick.size === "md" ? "" : " input--" + pick.size;
    const cls = "input" + size + (kind === "mono" ? " input--mono" : "") + (st === "focus" ? " is-focus" : "") + (st === "success" ? " is-valid" : "");
    const attrs = `id="${id}" class="${cls}" placeholder="${placeholder}" aria-describedby="${msg}"` + (st === "error" ? ' aria-invalid="true"' : "") + (st === "disabled" ? " disabled" : "") + (st === "readonly" ? " readonly" : "");
    const input = kind === "area" ? `<textarea ${attrs}>${filled ? value : ""}</textarea>` : `<input ${attrs}${filled ? ` value="${value}"` : ""}>`;
    const control = kind === "icon" ? `<span class="input-icon">${icon("search")}${input}</span>`
      : kind === "button" ? `<span class="input-group">${input}<button type="button" class="btn${pick.size === "sm" ? " btn--sm" : ""}"${st === "disabled" || st === "readonly" ? " disabled" : ""}>${icon("copy")}Copy</button></span>` : input;
    const say = st === "error" ? `<span class="field__msg field__msg--error" id="${msg}">${icon("circle-alert")}${error}</span>`
      : st === "success" ? `<span class="field__msg field__msg--success" id="${msg}">${icon("check")}${ok}</span>`
      : help ? `<span class="field__help" id="${msg}">${help}</span>` : `<span id="${msg}"></span>`;
    const count = kind === "area" ? `<span class="field__count">${filled ? value.length : 0} / 280</span>` : "";
    return `<label class="field" for="${id}"><span class="field__label">${label}${kind === "text" ? '<span class="field__required">Required</span>' : ""}</span>${control}<span class="field__foot">${say}${count}</span></label>`;
  };
  const ROWS = [["text", "Text"], ["icon", "With icon"], ["button", "With button"], ["mono", "Mono"], ["area", "Textarea"]];
  const draw = () => { inputPreview.dataset.radius = pick.shape; inputPreview.innerHTML = ROWS.map(([k, n]) => `<span class="detail">${n}</span>${field(k)}`).join(""); };
  document.querySelectorAll('[data-page="input"] [data-filter]').forEach((g) => g.addEventListener("change", (e) => { pick[g.dataset.filter] = e.detail.dataset.value; draw(); }));
  draw();
}
// Form: the playground. A real form (data-validate): Send checks it; the filters show its layouts and states.
const formPreview = document.getElementById("form-preview");
if (formPreview) {
  const pick = { layout: "stacked", state: "empty" };
  const icon = (n) => `<svg class="icon" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const FIELDS = {
    first: ["Name", "input", "Isabella", 'required data-error="Write your name."'],
    last: ["Last name", "input", "Herman", 'required data-error="Write your last name."'],
    email: ["Email", "input", "isabella@", 'required type="email" data-error="Write an email like name@example.com."'],
    message: ["Message", "textarea", "", 'required minlength="10" data-error="Write a message of at least 10 characters."'],
  };
  const field = (id, filled) => {
    const [label, kind, value, rules] = FIELDS[id];
    const attrs = `id="f-${id}" name="${id}" class="input" ${rules}`;
    const control = kind === "textarea" ? `<textarea ${attrs}>${filled ? value : ""}</textarea>` : `<input ${attrs}${filled && value ? ` value="${value}"` : ""}>`;
    return `<label class="field" for="f-${id}"><span class="field__label">${label}</span>${control}<span class="field__foot"></span></label>`;
  };
  const draw = () => {
    const filled = pick.state !== "empty";
    formPreview.className = "form v-form" + (pick.layout === "columns" ? " form--columns" : pick.layout === "inline" ? " form--inline" : "");
    formPreview.innerHTML = '<p class="detail">All fields are required.</p>' +
      `<fieldset class="form__section"><legend class="form__legend">Profile</legend><div class="form__row">${field("first", filled)}${field("last", filled)}</div>${field("email", filled)}</fieldset>` +
      field("message", filled) +
      `<div class="actions"><button type="button" class="btn btn--bordered btn--neutral">Cancel</button><button type="submit" class="btn btn--filled btn--async" data-reserve="Send|Sent"><svg class="icon btn__idle" aria-hidden="true"><use href="#i-arrow-right"/></svg><svg class="icon btn__done" aria-hidden="true"><use href="#i-check"/></svg><span class="btn__label">Send</span><svg class="btn__spin" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" pathLength="100"/></svg></button></div>`;
    initButtons();
    const send = formPreview.querySelector(".btn--async");
    if (pick.state === "errors") {
      // What a failed send looks like, without taking the focus: the same messages and summary ui.js makes.
      const wrong = ["email", "message"].map((id) => formPreview.querySelector("#f-" + id));
      wrong.forEach((c) => setFieldError(c, c.dataset.error));
      formPreview.insertAdjacentHTML("afterbegin", `<div class="form__summary" role="alert" tabindex="-1">${icon("circle-alert")}<div><p class="item-title">2 things to fix</p><ul><li><a class="link" href="#f-email">Email</a></li><li><a class="link" href="#f-message">Message</a></li></ul></div></div>`);
    }
    if (pick.state === "sending") busy(send, true);
    if (pick.state === "sent") { send.classList.add("is-done"); send.querySelector(".btn__label").textContent = "Sent"; }
  };
  // What "send" does is the app's: here it waits a moment, then says it's sent.
  formPreview.addEventListener("send", (e) => setTimeout(() => e.detail.done("Sent"), 1500));
  document.querySelectorAll('[data-page="form"] [data-filter]').forEach((g) => g.addEventListener("change", (e) => { pick[g.dataset.filter] = e.detail.dataset.value; draw(); }));
  draw();
}
// Prose: on or off, over the same HTML.
document.querySelector("[data-prose-on]")?.addEventListener("change", (e) => document.getElementById("prose-demo").classList.toggle("prose", e.detail.dataset.value === "on"));
// Panel: with or without its header.
document.querySelector("[data-panel-head]")?.addEventListener("change", (e) => {
  document.querySelector("#panel-demo .panel__header").hidden = e.detail.dataset.value === "off";
});
// Page and doc: Width. Pair: Layout.
{
  const doc = document.getElementById("doc-demo");
  const IMG = '<svg class="icon icon--lg" aria-hidden="true"><use href="#i-image"/></svg>';
  const art = (cls = "") => `<div class="art art--empty${cls}" role="img" aria-label="Image">${IMG}</div>`;
  // Lines: the lib's blocks as they are (a title, then lines to write in).
  const line = (title) => `<div class="block${title ? " block--title" : ""}"><div class="block__slot"></div><div class="block__text" contenteditable="true" data-placeholder="${title ? "Title" : "Write a line"}"></div></div>`;
  const CONTENT = {
    art: () => art(" art--lg art--fill") + `<div class="v-doc__row">${art(" art--fill").repeat(3)}</div>` + art(" art--lg art--fill"),
    lines: () => line(true) + line() + line() + line(),
  };
  const show = (v) => { doc.innerHTML = CONTENT[v](); };
  document.querySelector("[data-doc-width]").addEventListener("change", (e) => doc.classList.toggle("doc--full", e.detail.dataset.value === "full"));
  document.querySelector("[data-doc-content]").addEventListener("change", (e) => show(e.detail.dataset.value));
  show("art");
}
document.querySelector("[data-pair-layout]")?.addEventListener("change", (e) => {
  const d = document.getElementById("pair-demo"), v = e.detail.dataset.value;
  d.classList.toggle("doc--stack", v === "stack"); d.classList.toggle("doc--split", v === "split");
});

// Code block: the playground. One real code block; language, head, numbers and long lines from the filters.
const codePreview = document.getElementById("code-preview");
if (codePreview) {
  const SAMPLES = {
    bend: ["mana.bend", "# The mana never goes above ten.\nlaw mana_at_most_10:\n  for s: T.State\n  {(T.mana(s) <= 10 : U32) == True{} : Bool}"],
    js: ["draw.js", 'import { mountDiagram } from "bend-ui/diagram";\n\n// Draw it again when the data changes.\nexport function draw(el, data) {\n  return mountDiagram(el, data, { label: `Flow of ${data.nodes.length} steps` });\n}'],
    css: ["button.css", "/* A filled button, from the tokens. */\n.btn--filled {\n  background: var(--tone);\n  padding: 0 var(--btn-padding-x);\n}"],
    html: ["index.html", '<button class="btn btn--filled" aria-pressed="false">\n  Save\n</button>'],
    sh: ["install.sh", "# Add the library\nbun add github:isabellaherman/Bend-UI\nbun run check   # every law must hold"],
    python: ["laws.py", "class Law:\n    def __init__(self, name: str):\n        self.name = name  # snake_case\n\n    def holds(self) -> bool:\n        return True"],
    rust: ["mana.rs", "/// The mana never goes above ten.\npub fn clamp_mana(mana: u32) -> u32 {\n    let max = 10;\n    if mana > max { max } else { mana }\n}"],
    go: ["mana.go", "package laws\n\n// ClampMana keeps the mana at ten or less.\nfunc ClampMana(mana int) int {\n\tif mana > 10 {\n\t\treturn 10\n\t}\n\treturn mana\n}"],
    sql: ["laws.sql", "-- Laws that failed this week\nSELECT name, count(*) AS fails\nFROM checks\nWHERE ok = false AND day > '2026-11-01'\nGROUP BY name\nORDER BY fails DESC;"],
    yaml: ["bend.yaml", "# Build settings\nname: bend-ui\nversion: 1.0.22\nlaws:\n  - mana_at_most_10   # must hold"],
    markdown: ["README.md", "# Bend-UI\n\nA design system whose rules are **laws**.\n\n- Tokens in TOKENS.bend\n- Laws in LAWS.bend\n> Run the check before every commit."],
    diff: ["ui.css", "@@ -51,3 +51,3 @@ .btn--ghost\n .btn--ghost { background: transparent; }\n-.btn--ghost { color: var(--text-3); }\n+.btn--ghost { color: var(--text-2); }"],
  };
  const pick = { lang: "bend", header: "file", lines: "on", wrap: "scroll" };
  const draw = () => {
    const [file, code] = SAMPLES[pick.lang];
    codePreview.innerHTML = codeBlock(code, { lang: pick.lang, name: pick.header === "file" ? file : undefined, head: pick.header !== "none", numbers: pick.lines === "on", wrap: pick.wrap === "wrap" });
    initButtons();
  };
  document.querySelectorAll('[data-page="code-block"] [data-filter]').forEach((g) => g.addEventListener("change", (e) => { pick[g.dataset.filter] = e.detail.dataset.value; draw(); }));
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
go(ID[START] ?? "overview", false);

// Dropdown menu: the playground. One real dropdown, open; Items picks the kind of item, Position where it opens.
{
  const dd = document.getElementById("dd-preview");
  const trigger = dd.querySelector(":scope > button"), menu = dd.querySelector(":scope > .menu");
  const pick = { items: "plain", position: "below" };
  const icon = (n, cls = "icon icon--sm") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const plain = (label, ic, off) => `<button type="button" class="menu__item" role="menuitem"${off ? " disabled" : ""}>${ic ? icon(ic) : ""}<span>${label}</span></button>`;
  const radio = (label, on, tag) => `<button type="button" class="menu__item" role="menuitemradio" aria-checked="${on}"><span>${tag ? `<span class="tag${tag === "none" ? "" : " tag--" + tag}">${label}</span>` : label}</span>${icon("check", "icon icon--sm menu__check")}</button>`;
  const sets = {
    plain: () => plain("Rename") + plain("Duplicate") + '<hr class="separator">' + plain("Delete") + plain("Archive", null, true),
    icons: () => plain("Rename", "pencil") + plain("Duplicate", "copy") + '<hr class="separator">' + plain("Delete", "trash-2") + plain("Archive", "folder", true),
    check: () => radio("Title", false) + radio("Text", true) + radio("Heading", false) + '<hr class="separator">' + plain("Archive", null, true),
    tag: () => radio("Blue", false, "accent") + radio("Green", true, "success") + radio("Yellow", false, "warning") + radio("Red", false, "danger") + '<hr class="separator">' + radio("None", false, "none"),
  };
  const open = () => { if (menu.hidden) trigger.click(); };
  const draw = () => {
    menu.innerHTML = sets[pick.items]();
    menu.classList.toggle("menu--end", pick.position === "end");
    menu.classList.toggle("menu--up", pick.position === "up");
    if (!menu.hidden) trigger.click();   // close and open again, so it is placed for the new items
    open();
  };
  document.querySelectorAll('[data-page="dropdown"] [data-filter]').forEach((g) => g.addEventListener("change", (e) => { pick[g.dataset.filter] = e.detail.dataset.value; requestAnimationFrame(draw); }));
  // It opens when the page shows (a closed menu shows nothing to look at).
  new IntersectionObserver((list) => list.forEach((e) => { if (e.isIntersecting) open(); })).observe(dd);
  menu.innerHTML = sets.plain();
}
