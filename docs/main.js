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
import { LAWS } from "./laws.data.js";
import pkg from "../package.json";

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
document.querySelectorAll("[data-laws]").forEach((el) => {
  const names = LAWS_OF[el.dataset.laws] || [];
  if (!names.length) return;
  el.innerHTML = `<details class="disclosure"><summary><svg class="icon icon--sm disclosure__chevron"><use href="#i-chevron-down"/></svg><span class="disclosure__title">Laws</span><span class="meta">${names.length}</span></summary>` +
    names.map((n) => lawBlock(byName[n])).join("") + `</details>`;
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
document.querySelectorAll('[data-code], [data-syntax-demo], [data-page="overview"] .prose pre').forEach(highlight);
const chatFace = $("chat-face"); if (chatFace) mountAgent(chatFace, { size: "sm", items: [] });

// Navigation: one page at a time; the side bar marks it.
const main = $("docs-main");
function go(id) {
  main.querySelectorAll("[data-page]").forEach((s) => (s.hidden = s.dataset.page !== id));
  document.querySelectorAll("#docs-nav [data-go]").forEach((b) => (b.dataset.go === id ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
  main.scrollTop = 0;
}
$("docs-nav").addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });
$("docs-side-toggle").addEventListener("click", () => $("docs-side").classList.toggle("is-open"));
go("overview");
