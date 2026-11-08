// Bend-UI: one import turns everything on.
//   import "bend-ui";
// Reads the tokens from TOKENS.bend, writes the CSS variables on :root,
// loads the components (ui.css) and the icon sprite, and marks narrow screens.

import T from "./TOKENS.bend";
import MENU from "./MENU.bend";
import MOTION from "./MOTION.bend";
import { ICONS } from "./icons.js";
import "./ui.css";

const px = (n) => n + "px";

const VARS = {
  "--dialog-padding": () => px(T.dialog_padding()),
  "--dialog-screen-gap": () => px(T.dialog_screen_gap()),
  "--dialog-backdrop-opacity": () => String(T.dialog_backdrop_percent() / 100),
  "--feedback-duration": () => T.feedback_duration_ms() + "ms",
  "--feedback-padding-x": () => px(T.feedback_padding_x()),
  "--feedback-padding-y": () => px(T.feedback_padding_y()),
  "--workbench-padding": () => px(T.workbench_padding()),
  "--workbench-padding-narrow": () => px(T.workbench_padding_narrow()),
  "--workbench-gap": () => px(T.workbench_gap()),
  "--workbench-pane-padding": () => px(T.workbench_pane_padding()),
  "--source-min-lines": () => String(T.source_min_lines()),
  "--preview-min-height": () => px(T.preview_min_height()),
  "--preview-max-height": () => px(T.preview_max_height()),
  "--snapshot-max-height": () => px(T.snapshot_max_height()),
  "--breadcrumb-gap": () => px(T.breadcrumb_gap()),
  "--space-0": () => px(T.space_0()), "--space-hairline": () => px(T.space_hairline()), "--space-1": () => px(T.space_1()),
  "--space-2": () => px(T.space_2()), "--space-3": () => px(T.space_3()),
  "--space-4": () => px(T.space_4()), "--space-5": () => px(T.space_5()),
  "--space-6": () => px(T.space_6()), "--space-7": () => px(T.space_7()),
  "--space-8": () => px(T.space_8()),
  "--radius-xs": () => px(T.radius_xs()), "--radius-sm": () => px(T.radius_sm()),
  "--radius-md": () => px(T.radius_md()), "--radius-lg": () => px(T.radius_lg()),
  "--radius-full": () => px(T.radius_full()),
  "--control-sm": () => px(T.control_sm()), "--control-md": () => px(T.control_md()),
  "--btn-padding-x": () => px(T.btn_padding_x()), "--btn-padding-x-sm": () => px(T.btn_padding_x_sm()), "--btn-padding-x-lg": () => px(T.btn_padding_x_lg()), "--btn-padding-x-xl": () => px(T.btn_padding_x_xl()),
  "--btn-wide-padding-x": () => px(T.btn_wide_padding_x()), "--btn-wide-padding-x-sm": () => px(T.btn_wide_padding_x_sm()), "--btn-wide-padding-x-lg": () => px(T.btn_wide_padding_x_lg()), "--btn-wide-padding-x-xl": () => px(T.btn_wide_padding_x_xl()),
  "--control-lg": () => px(T.control_lg()), "--control-xl": () => px(T.control_xl()),
  "--btn-hover-brightness": () => T.btn_hover_brightness(), "--disabled-opacity": () => String(T.disabled_opacity() / 100),
  "--icon-sm": () => px(T.icon_sm()), "--icon-md": () => px(T.icon_md()),
  "--icon-lg": () => px(T.icon_lg()), "--icon-xl": () => px(T.icon_xl()), "--icon-stroke": () => T.icon_stroke(),
  "--dot-size": () => px(T.dot_size()), "--block-min-lines": () => String(T.block_min_lines()), "--ring-offset": () => px(T.ring_offset()), "--ring-width": () => px(T.ring_width()),
  "--side-padding": () => px(T.side_padding()), "--side-rail": () => px(T.side_rail()), "--side-width": () => px(T.side_width()),
  "--window-margin": () => px(T.window_margin()), "--window-max": () => px(T.window_max()),
  "--agent-sm": () => px(T.agent_sm()), "--agent-lg": () => px(T.agent_lg()), "--agent-xl": () => px(T.agent_xl()),
  "--msg-max": () => px(T.msg_max()), "--msg-gap": () => px(T.msg_gap()), "--composer-max": () => px(T.composer_max()),
  "--segmented-item": () => px(T.segmented_item()), "--segmented-outer-radius": () => px(T.segmented_outer_radius()), "--segmented-inner-radius": () => px(T.segmented_inner_radius()),
  "--layer-thread": () => String(T.layer_thread()), "--layer-foot": () => String(T.layer_foot()), "--layer-dock": () => String(T.layer_dock()), "--layer-menu": () => String(T.layer_menu()),
  "--layer-side": () => String(T.layer_side()), "--layer-fly": () => String(T.layer_fly()),
  "--layer-part": () => String(T.layer_part()), "--layer-part-top": () => String(T.layer_part_top()),
  "--tag-height": () => px(T.tag_height()), "--tag-padding-x": () => px(T.tag_padding_x()),
  "--kbd-padding-y": () => px(T.kbd_padding_y()), "--kbd-depth": () => px(T.kbd_depth()),
  "--focus-width": () => px(T.focus_width()), "--focus-offset": () => px(T.focus_offset()),
  "--focus-offset-round": () => px(T.focus_offset_round()), "--focus-halo": () => px(T.focus_halo()),
  "--underline-offset": () => px(T.underline_offset()), "--underline-width": () => px(T.underline_width()),
  "--font-sans": () => T.font_sans(), "--font-mono": () => T.font_mono(),
  "--font-display": () => T.font_display(),
  "--text-xs": () => px(T.text_xs()), "--text-sm": () => px(T.text_sm()),
  "--text-md": () => px(T.text_md()), "--text-lg": () => px(T.text_lg()),
  "--text-xl": () => px(T.text_xl()), "--text-2xl": () => px(T.text_2xl()),
  "--text-display": () => px(T.text_display()),
  "--role-section": () => px(T.role_section()), "--role-group": () => px(T.role_group()),
  "--role-item": () => px(T.role_item()), "--role-detail": () => px(T.role_detail()),
  "--outline-indent": () => px(T.outline_indent()),
  "--art-sm": () => px(T.art_sm()), "--art-md": () => px(T.art_md()), "--art-lg": () => px(T.art_lg()),
  "--weight-regular": () => String(T.weight_regular()),
  "--weight-medium": () => String(T.weight_medium()),
  "--weight-semibold": () => String(T.weight_semibold()),
  "--border-width": () => px(T.border_width()),
  "--leading-tight": () => T.leading_tight(), "--leading-ui": () => T.leading_ui(),
  "--leading-body": () => T.leading_body(), "--measure": () => T.measure_ch() + "ch",
  "--shadow-float": () => T.shadow_float(),
  "--duration": () => T.duration_ms() + "ms", "--duration-slow": () => T.duration_slow_ms() + "ms",
  "--ease-spring": () => T.ease_spring(),
  "--duration-enter": () => T.duration_enter_ms() + "ms", "--duration-connect": () => T.duration_connect_ms() + "ms",
  "--duration-read": () => T.duration_read_ms() + "ms", "--stagger": () => T.stagger_ms() + "ms",
  "--blur-form": () => px(T.blur_form()), "--node-size": () => px(T.node_size()), "--diagram-node-min": () => px(T.diagram_node_min()), "--canvas-gap": () => px(T.canvas_gap()),
  "--ease": () => T.ease(),
  // MOTION.bend's ease_in_out (slow, fast, slow), sampled into a CSS easing: no slow tail at the end.
  "--ease-in-out": () => "linear(" + Array.from({ length: 21 }, (_, i) => MOTION.ease_in_out(i / 20).toFixed(4)).join(", ") + ")",
  "--chart-tone-1": () => T.chart_tone_1() + "%", "--chart-tone-2": () => T.chart_tone_2() + "%",
  "--chart-tone-3": () => T.chart_tone_3() + "%", "--chart-tone-4": () => T.chart_tone_4() + "%",
  "--chart-gap": () => px(T.chart_gap()), "--chart-lift": () => px(T.chart_lift()),
  "--chart-dim": () => String(T.chart_dim() / 100),
  "--bg": () => T.color_bg(), "--surface": () => T.color_surface(),
  "--surface-2": () => T.color_surface_2(), "--border": () => T.color_border(),
  "--border-strong": () => T.color_border_strong(), "--text": () => T.color_text(),
  "--text-2": () => T.color_text_2(), "--text-3": () => T.color_text_3(),
  "--accent": () => T.color_accent(), "--accent-fg": () => T.color_accent_fg(),
  "--accent-soft": () => T.color_accent_soft(),
  "--success": () => T.color_success(), "--success-soft": () => T.color_success_soft(),
  "--warning": () => T.color_warning(), "--warning-soft": () => T.color_warning_soft(),
  "--success-text": () => T.color_success_text(), "--warning-text": () => T.color_warning_text(),
  "--danger": () => T.color_danger(), "--danger-soft": () => T.color_danger_soft(),
  "--syntax-bg": () => T.syntax_bg(), "--syntax-border": () => T.syntax_border(), "--syntax-fg": () => T.syntax_fg(),
  "--syntax-keyword": () => T.syntax_keyword(), "--syntax-type": () => T.syntax_type(),
  "--syntax-string": () => T.syntax_string(), "--syntax-number": () => T.syntax_number(),
  "--syntax-comment": () => T.syntax_comment(), "--syntax-punct": () => T.syntax_punct(),
  "--syntax-name": () => T.syntax_name(),
};

for (const [name, get] of Object.entries(VARS)) {
  document.documentElement.style.setProperty(name, get());
}

// ---------- Narrow screens ----------
// CSS media queries can't read variables, so the breakpoint lives in TOKENS.bend
// and this marks <html data-narrow> below it. ui.css styles narrow screens from that.
const narrow = matchMedia(`(max-width: ${T.breakpoint() - 1}px)`);
const markNarrow = () => document.documentElement.toggleAttribute("data-narrow", narrow.matches);
markNarrow();
narrow.addEventListener("change", markNarrow);
export const isNarrow = () => narrow.matches;

// ---------- Segmented: one choice per group ----------
// Clicking a button marks it pressed and unmarks the others, then fires "change"
// on the group with the button in event.detail. Add data-manual to the group to
// handle aria-pressed yourself.
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".segmented button");
  if (!btn || btn.disabled) return;
  const group = btn.closest(".segmented");
  if (group.hasAttribute("data-manual")) return;
  group.querySelectorAll(":scope > button").forEach((b) => b.setAttribute("aria-pressed", b === btn));
  group.dispatchEvent(new CustomEvent("change", { detail: btn, bubbles: true }));
});

// ---------- Segmented motion: the choice moves ----------
// .segmented--slide gets a thumb behind the chosen item; on "change" it travels to the new one.
//   data-motion="stretch": the edge on the side you went reaches first, then the rest follows (ease_in_out).
//   data-motion="spring": it overshoots a little and settles (ease_spring).
//   .segmented--extend: icon items; the chosen one also shows its name, and the thumb rides it as it opens.
// The text changes color in the thumb's time and curve. Reduced motion: the thumb just moves.
const segLess = matchMedia("(prefers-reduced-motion: reduce)");
function segPlace(group, animate) {
  const thumb = group.querySelector(":scope > .segmented__thumb"), on = group.querySelector(':scope > button[aria-pressed="true"]');
  if (!thumb || !on) return;
  const to = { left: on.offsetLeft, width: on.offsetWidth }, from = { left: thumb.offsetLeft, width: thumb.offsetWidth };
  thumb.style.left = to.left + "px"; thumb.style.width = to.width + "px";
  if (!animate || segLess.matches || (from.left === to.left && from.width === to.width)) return;
  const px = (o) => ({ left: o.left + "px", width: o.width + "px" });
  const inOut = getComputedStyle(document.documentElement).getPropertyValue("--ease-in-out").trim() || "ease-in-out";
  if (group.dataset.motion === "stretch") {
    const right = to.left > from.left;
    const mid = right ? { left: from.left, width: to.left + to.width - from.left } : { left: to.left, width: from.left + from.width - to.left };
    thumb.animate([px(from), { ...px(mid), offset: 0.5 }, px(to)], { duration: T.duration_enter_ms(), easing: inOut });
  } else {
    thumb.animate([px(from), px(to)], { duration: T.duration_enter_ms(), easing: group.dataset.motion === "spring" ? T.ease_spring() : inOut });
  }
}
export function initSegmented(group) {
  if (!group.matches(".segmented--slide, .segmented--extend") || group.querySelector(":scope > .segmented__thumb")) return;
  const thumb = document.createElement("span"); thumb.className = "segmented__thumb"; thumb.setAttribute("aria-hidden", "true");
  group.prepend(thumb);
  group.addEventListener("change", () => {
    if (!group.classList.contains("segmented--extend")) return segPlace(group, true);
    const end = performance.now() + T.duration_enter_ms() + T.duration_ms();
    const ride = (now) => { segPlace(group, false); if (now < end) requestAnimationFrame(ride); };
    requestAnimationFrame(ride);
  });
  new ResizeObserver(() => segPlace(group, false)).observe(group);
  segPlace(group, false);
}
const initSegmentedAll = () => document.querySelectorAll(".segmented--slide, .segmented--extend").forEach(initSegmented);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSegmentedAll); else initSegmentedAll();
document.fonts?.ready.then(() => document.querySelectorAll(".segmented--slide, .segmented--extend").forEach((g) => segPlace(g, false)));

// ---------- Side bar: sections, groups, the rail and the drawer ----------
// A .side__section is a <button class="side__toggle" aria-expanded> before its <div class="side__items">.
// Opening a section closes the others in its group; without groups the whole side bar is one group.
// data-side-multiple on a .side__group (or on the .side) lets its sections stay open together.
// [data-side-toggle] opens and closes the side bar (the .side it's in, or the one whose id it names).
// On the rail a section's button opens the side bar too. Under [data-narrow] the side bar is a drawer:
// Escape or a click outside closes it, focus goes in when it opens and back when it closes, and it's
// inert while hidden. A section grows and shrinks like the thread's openBlock (duration_enter, ease).
const sideLess = matchMedia("(prefers-reduced-motion: reduce)");
let sideUid = 0;
const sideAnim = (el, frames) => (sideLess.matches ? Promise.resolve() : el.animate(frames, { duration: T.duration_enter_ms(), easing: T.ease() }).finished);
const sideGroupOf = (section) => section.parentElement.closest(".side__group, .side");
const isDrawer = (side) => !!side.closest("[data-narrow]");
const sideOf = (b) => (b.dataset.sideToggle ? document.getElementById(b.dataset.sideToggle) : b.closest(".side"));
const sideToggles = (side) => [...document.querySelectorAll("[data-side-toggle]")].filter((b) => sideOf(b) === side);
export function initSide(side) {
  side.querySelectorAll(".side__section").forEach((s) => {
    const t = s.querySelector(":scope > .side__toggle, :scope > .side__row > .side__toggle"), items = s.querySelector(":scope > .side__items");
    if (!t || !items) return;
    if (!items.id) items.id = "side-items-" + ++sideUid;
    t.setAttribute("aria-controls", items.id);
  });
  const open = side.classList.contains("is-open");
  sideToggles(side).forEach((b) => b.setAttribute("aria-expanded", String(open)));
  side.inert = isDrawer(side) && !open;
}
function setSection(section, open) {
  const t = section.querySelector(":scope > .side__toggle, :scope > .side__row > .side__toggle"), items = section.querySelector(":scope > .side__items");
  if (!t || (t.getAttribute("aria-expanded") === "true") === open) return;
  const h = items?.scrollHeight ?? 0;
  t.setAttribute("aria-expanded", String(open));
  if (!items || !section.closest(".side").classList.contains("is-open")) return;
  items.style.overflow = "hidden";
  if (open) {
    const to = items.scrollHeight;
    sideAnim(items, [{ height: "0px", opacity: 0 }, { height: to + "px", opacity: 1 }]).then(() => { items.style.overflow = ""; });
  } else {
    items.style.display = "flex";   // stays drawn while it closes
    sideAnim(items, [{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }]).then(() => { items.style.display = items.style.overflow = ""; });
  }
}
export function setSide(side, open) {
  side.classList.toggle("is-open", open);
  const toggles = sideToggles(side);
  toggles.forEach((b) => b.setAttribute("aria-expanded", String(open)));
  if (!isDrawer(side)) { side.inert = false; return; }
  side.inert = !open;
  if (open) side.querySelector(".side__body .btn, .side__body a")?.focus();
  else if (side.contains(document.activeElement)) toggles[0]?.focus();   // only when the focus was in it
}
document.addEventListener("click", (e) => {
  const rail = e.target.closest("[data-side-toggle]");
  if (rail) { const side = sideOf(rail); if (side) setSide(side, !side.classList.contains("is-open")); return; }
  const t = e.target.closest(".side__toggle");
  if (t) {
    const section = t.closest(".side__section"), side = t.closest(".side");
    if (!section || !side) return;
    const opening = t.getAttribute("aria-expanded") !== "true";
    if (!side.classList.contains("is-open")) { setSide(side, true); if (!opening) return; }
    if (opening) {
      const g = sideGroupOf(section);
      if (!g.hasAttribute("data-side-multiple"))
        g.querySelectorAll(".side__section").forEach((x) => { if (x !== section && sideGroupOf(x) === g) setSection(x, false); });
    }
    setSection(section, opening);
    return;
  }
  // A click outside a drawer, but over what it covers (its [data-narrow] area), closes it.
  document.querySelectorAll(".side.is-open").forEach((side) => {
    if (isDrawer(side) && !side.contains(e.target) && side.closest("[data-narrow]").contains(e.target)) setSide(side, false);
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const side = [...document.querySelectorAll(".side.is-open")].find(isDrawer);
  if (side) setSide(side, false);
});
const initSides = () => document.querySelectorAll(".side").forEach(initSide);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSides); else initSides();
narrow.addEventListener("change", initSides);

// ---------- Dropdown: a button that opens a menu ----------
// <div class="dropdown"><button class="btn" aria-haspopup="menu">…</button>
//   <div class="menu" role="menu" hidden><button class="menu__item" role="menuitemradio" aria-checked="true">…</button></div></div>
// The button opens and closes the menu. Picking an item checks it (menuitemradio), closes the menu
// and fires "pick" on the dropdown with the item in event.detail. Arrows move, Escape and a click
// outside close. Opening or picking doesn't take focus from where the person is typing.
const ddMenu = (dd) => dd.querySelector(":scope > .menu");
const ddButton = (dd) => dd.querySelector(':scope > [aria-haspopup="menu"]');
// A menu opens in the browser's top layer (popover), so no scroll area cuts it and no layer covers it.
// It sits by its button (.menu--end: aligned to its end), and opens up when it doesn't fit below
// (MENU.bend: opens_up). It follows its button while the page or a list scrolls.
function ddPlace(dd) {
  const menu = ddMenu(dd), b = ddButton(dd).getBoundingClientRect();
  if (!menu.matches(":popover-open")) return;
  const gap = T.space_1(), h = menu.offsetHeight, w = menu.offsetWidth;
  const up = menu.classList.contains("menu--up") || !!MENU.opens_up(innerHeight - b.bottom - gap, b.top - gap, h);
  const left = Math.min(Math.max(gap, menu.classList.contains("menu--end") ? b.right - w : b.left), innerWidth - w - gap);
  menu.style.left = left + "px";
  menu.style.top = (up ? b.top - gap - h : b.bottom + gap) + "px";
}
function ddSet(dd, open) {
  const menu = ddMenu(dd);
  menu.hidden = !open;
  ddButton(dd).setAttribute("aria-expanded", open);
  if (!menu.showPopover) return;   // no top layer: the menu stays where ui.css puts it
  if (!menu.hasAttribute("popover")) menu.setAttribute("popover", "manual");
  if (open && !menu.matches(":popover-open")) menu.showPopover();
  if (!open && menu.matches(":popover-open")) menu.hidePopover();
  ddPlace(dd);
}
const ddFollow = () => document.querySelectorAll(".dropdown").forEach((dd) => ddMenu(dd) && !ddMenu(dd).hidden && ddPlace(dd));
addEventListener("scroll", ddFollow, true);
addEventListener("resize", ddFollow);
const ddCloseAll = (except) => document.querySelectorAll(".dropdown").forEach((dd) => { if (dd !== except && ddMenu(dd) && !ddMenu(dd).hidden) ddSet(dd, false); });
document.addEventListener("mousedown", (e) => {
  if (e.target.closest(".dropdown > [aria-haspopup='menu'], .dropdown > .menu")) e.preventDefault();   // keep the caret
});
document.addEventListener("pointerdown", (e) => ddCloseAll(e.target.closest(".dropdown")));
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".dropdown > [aria-haspopup='menu']");
  if (btn) { const dd = btn.parentElement; ddSet(dd, ddMenu(dd).hidden); return; }
  const item = e.target.closest(".dropdown > .menu > .menu__item");
  if (!item || item.disabled) return;
  const dd = item.closest(".dropdown");
  if (item.getAttribute("role") === "menuitemradio") ddMenu(dd).querySelectorAll(":scope > .menu__item").forEach((i) => i.setAttribute("aria-checked", i === item));
  ddSet(dd, false);
  dd.dispatchEvent(new CustomEvent("pick", { detail: item, bubbles: true }));
});
document.addEventListener("keydown", (e) => {
  const dd = e.target.closest?.(".dropdown");
  if (e.key === "Escape") { const open = [...document.querySelectorAll(".dropdown")].find((d) => ddMenu(d) && !ddMenu(d).hidden); if (open) { ddSet(open, false); ddButton(open).focus(); } return; }
  if (!dd || !["ArrowDown", "ArrowUp"].includes(e.key)) return;
  e.preventDefault();
  if (ddMenu(dd).hidden) ddSet(dd, true);
  const items = [...ddMenu(dd).querySelectorAll(":scope > .menu__item:not(:disabled)")];
  const i = items.indexOf(document.activeElement);
  const next = i < 0 ? items.findIndex((x) => x.getAttribute("aria-checked") === "true") : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
  items[Math.max(0, next)].focus();
});

// ---------- Side bar row actions ----------
// <div class="side__row"><button class="btn btn--ghost">…</button>
//   <div class="dropdown side__more"><button class="btn btn--ghost btn--icon btn--sm" aria-haspopup="menu" aria-label="Actions for …">⋯</button><div class="menu menu--end" role="menu" hidden>…</div></div></div>
// A right-click on the row, the context-menu key or Shift+F10 opens the same menu, focus on its first item.
function openRowMenu(row) {
  const dd = row.querySelector(":scope > .side__more");
  if (!dd || !ddMenu(dd)) return false;
  ddCloseAll(dd);
  if (ddMenu(dd).hidden) ddSet(dd, true);
  (ddMenu(dd).querySelector(".menu__item:not(:disabled)") ?? ddButton(dd)).focus();
  return true;
}
document.addEventListener("contextmenu", (e) => {
  const row = e.target.closest(".side__row");
  if (row && openRowMenu(row)) e.preventDefault();
});
document.addEventListener("keydown", (e) => {
  if (!(e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey))) return;
  const row = e.target.closest?.(".side__row");
  if (row && openRowMenu(row)) e.preventDefault();
});

// ---------- Buttons: what they say, hold to confirm, busy and done, copy ----------
// announce(text): a polite live region, so what a button did is said, not only shown.
let btnLive = null;
export function announce(text) {
  if (!btnLive) { btnLive = document.createElement("div"); btnLive.className = "sr-only"; btnLive.setAttribute("role", "status"); document.body.appendChild(btnLive); }
  btnLive.textContent = ""; requestAnimationFrame(() => { btnLive.textContent = text; });
}
const btnLess = matchMedia("(prefers-reduced-motion: reduce)");
const btnLabels = (btn) => [...btn.querySelectorAll(".btn__label")];
const btnSay = (btn, text) => btnLabels(btn).forEach((l) => { l.textContent = text; });
// data-reserve="Publish|Published": the button keeps the width of its widest label, so nothing around it moves.
function reserveWidth(btn) {
  const labels = btnLabels(btn), first = labels[0]?.textContent;
  if (!labels.length) return;
  btn.style.minWidth = "";
  const w = Math.max(...btn.dataset.reserve.split("|").map((t) => { btnSay(btn, t); return btn.getBoundingClientRect().width; }));
  btnSay(btn, first);
  btn.style.minWidth = Math.ceil(w) + "px";
}
// A hidden button can't be measured, so each one is measured when it first shows (and again when fonts load).
const reserveSeen = new IntersectionObserver((list) => list.forEach((e) => { if (e.isIntersecting && e.boundingClientRect.width) { reserveWidth(e.target); reserveSeen.unobserve(e.target); } }));
const reserveAll = () => document.querySelectorAll(".btn[data-reserve]").forEach((b) => (b.getBoundingClientRect().width ? reserveWidth(b) : reserveSeen.observe(b)));
// busy(btn, true|false): aria-busy shows the ring in place of the label. done(btn, label): a check, then back.
export function busy(btn, on) { on ? btn.setAttribute("aria-busy", "true") : btn.removeAttribute("aria-busy"); }
export function done(btn, label) {
  const idle = btnLabels(btn)[0]?.textContent;
  busy(btn, false); btn.classList.add("is-done");
  if (label) { btnSay(btn, label); announce(label); }
  setTimeout(() => { btn.classList.remove("is-done"); if (label) btnSay(btn, idle); }, T.duration_read_ms());
}
// Hold to confirm: .btn--hold, with a .btn__fill copy of its content. The fill tracks the time held over hold_ms
// (duration_slow); full, it shows data-armed; letting go then fires "confirm" (WCAG 2.5.2). Early, it drains back.
function initHold(btn) {
  if (btn.dataset.holdReady) return; btn.dataset.holdReady = "1";
  const idle = btnLabels(btn)[0]?.textContent;
  let t0 = 0, p = 0, raf = 0, holding = false, armed = false, locked = false;
  const draw = () => btn.style.setProperty("--p", String(p));
  const tick = (now) => {
    if (!holding) return;
    p = Math.min(1, (now - t0) / T.duration_slow_ms()); draw();
    if (p >= 1 && !armed) { armed = true; btn.classList.add("is-armed"); if (btn.dataset.armed) btnSay(btn, btn.dataset.armed); }
    raf = requestAnimationFrame(tick);
  };
  const start = () => { if (holding || locked) return; holding = true; armed = false; t0 = performance.now() - p * T.duration_slow_ms(); raf = requestAnimationFrame(tick); };
  const drain = () => {
    if (btnLess.matches) { p = 0; draw(); return; }
    const from = p, s0 = performance.now(), ms = T.duration_enter_ms();
    const step = (now) => { if (holding) return; const k = Math.min(1, (now - s0) / ms); p = from * (1 - MOTION.ease_out(k)); draw(); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const stop = (commit) => {
    if (!holding) return;
    holding = false; cancelAnimationFrame(raf); btn.classList.remove("is-armed");
    if (commit && armed) {
      locked = true; btn.classList.add("is-done");
      if (btn.dataset.done) { btnSay(btn, btn.dataset.done); announce(btn.dataset.done); }
      btn.dispatchEvent(new CustomEvent("confirm", { bubbles: true }));
      setTimeout(() => { locked = false; btn.classList.remove("is-done"); btnSay(btn, idle); p = 0; draw(); }, T.duration_read_ms());
      return;
    }
    armed = false; btnSay(btn, idle); drain();
  };
  btn.addEventListener("pointerdown", (e) => { if (e.button === 0) { btn.setPointerCapture(e.pointerId); start(); } });
  btn.addEventListener("pointerup", () => stop(true));
  btn.addEventListener("pointercancel", () => stop(false));
  btn.addEventListener("pointermove", (e) => { const r = btn.getBoundingClientRect(); if (holding && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) stop(false); });
  btn.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) start(); } });
  btn.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); stop(true); } });
  btn.addEventListener("blur", () => stop(false));
}
// initButtons(): set up hold and reserved widths on buttons added later.
export const initButtons = () => { document.querySelectorAll(".btn--hold").forEach(initHold); reserveAll(); };
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initButtons); else initButtons();
document.fonts?.ready.then(reserveAll);
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn) return;
  // A button that is aria-disabled stays findable but does nothing.
  if (btn.getAttribute("aria-disabled") === "true") { e.preventDefault(); e.stopImmediatePropagation(); return; }
  // data-copy="text": copies it, the icon turns into a check, and "Copied" is said.
  if (btn.hasAttribute("data-copy") && !btn.classList.contains("is-done")) {
    navigator.clipboard?.writeText(btn.dataset.copy).catch(() => {});
    done(btn, btn.dataset.copied || "Copied");
  }
}, true);

// ---------- Theme per project ----------
// A theme changes COLOR, FONT and the controls' SHAPE. Space and sizes stay bound by the laws.
//   import { theme } from "bend-ui";
//   theme({ accent: "#ffd21f", accentFg: "#02090a", fontDisplay: { family: "Jaro", src: jaroUrl }, radius: "pill" });
// radius: "rounded" (default) | "pill" | "sharp", for every button and segmented; data-radius on a container does the same inside it.
const THEME_KEYS = {
  bg: "--bg", surface: "--surface", surface2: "--surface-2", border: "--border", borderStrong: "--border-strong",
  text: "--text", text2: "--text-2", text3: "--text-3",
  accent: "--accent", accentFg: "--accent-fg", accentSoft: "--accent-soft",
  success: "--success", successSoft: "--success-soft", successText: "--success-text", warning: "--warning", warningSoft: "--warning-soft", warningText: "--warning-text",
  danger: "--danger", dangerSoft: "--danger-soft",
};
const FONT_KEYS = { fontSans: "--font-sans", fontDisplay: "--font-display", fontMono: "--font-mono" };

export function theme(t = {}) {
  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(t)) {
    if (k === "radius") { document.documentElement.dataset.radius = v; continue; }
    if (THEME_KEYS[k]) { root.setProperty(THEME_KEYS[k], v); continue; }
    if (FONT_KEYS[k]) {
      const font = typeof v === "string" ? { family: v } : v;
      if (font.src) {
        const style = document.createElement("style");
        style.textContent = `@font-face { font-family: "${font.family}"; src: url("${font.src}"); font-display: swap; }`;
        document.head.appendChild(style);
      }
      root.setProperty(FONT_KEYS[k], `"${font.family}", ${T.font_sans()}`);
      continue;
    }
    console.warn(`bend-ui: "${k}" is not a theme key (color, font and radius).`);
  }
}

function mountIcons() {
  if (document.getElementById("bend-ui-icons")) return;
  const box = document.createElement("div");
  box.id = "bend-ui-icons";
  box.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' + ICONS + "</svg>";
  document.body.prepend(box);
}
if (document.body) mountIcons(); else document.addEventListener("DOMContentLoaded", mountIcons);

export const icons = [
  "plus", "file-text", "scale", "triangle-alert", "circle-check", "x", "chevron-down", "list", "code",
  "wand-sparkles", "search", "panel-left", "book-open", "lock", "minimize-2", "maximize-2", "minimize", "maximize",
  "text", "rows-2", "columns-2", "heading-1", "pilcrow", "check",
  "arrow-down", "arrow-left", "arrow-right", "chevron-up", "chevron-left", "chevron-right", "chevrons-up-down", "arrow-up-down", "corner-down-left",
  "ellipsis", "ellipsis-vertical", "trash-2", "pencil", "copy", "external-link", "download", "upload", "refresh-cw",
  "undo-2", "redo-2", "link", "filter", "grip-vertical", "settings", "lock-open", "eye", "eye-off",
  "info", "circle-alert", "circle-x", "star", "bell", "folder", "user", "calendar", "house",
  "image",
];
export const tokens = T;
