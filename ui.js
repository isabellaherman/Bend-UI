// Bend-UI: one import turns everything on.
//   import "bend-ui";
// Reads the tokens from TOKENS.bend, writes the CSS variables on :root,
// loads the components (ui.css) and the icon sprite, and marks narrow screens.

import T from "./TOKENS.bend";
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
  "--control-lg": () => px(T.control_lg()),
  "--icon-sm": () => px(T.icon_sm()), "--icon-md": () => px(T.icon_md()),
  "--icon-lg": () => px(T.icon_lg()), "--icon-stroke": () => T.icon_stroke(),
  "--dot-size": () => px(T.dot_size()), "--block-min-lines": () => String(T.block_min_lines()), "--ring-offset": () => px(T.ring_offset()), "--ring-width": () => px(T.ring_width()),
  "--side-padding": () => px(T.side_padding()), "--side-rail": () => px(T.side_rail()), "--side-width": () => px(T.side_width()),
  "--window-margin": () => px(T.window_margin()), "--window-max": () => px(T.window_max()),
  "--agent-sm": () => px(T.agent_sm()), "--agent-lg": () => px(T.agent_lg()), "--agent-xl": () => px(T.agent_xl()),
  "--msg-max": () => px(T.msg_max()), "--msg-gap": () => px(T.msg_gap()), "--composer-max": () => px(T.composer_max()),
  "--segmented-item": () => px(T.segmented_item()),
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

// ---------- Side bar groups: a parent opens and closes its children ----------
// <button class="side__toggle" aria-expanded="true"> before its <div class="side__items">.
document.addEventListener("click", (e) => {
  const t = e.target.closest(".side__toggle");
  if (t) t.setAttribute("aria-expanded", t.getAttribute("aria-expanded") !== "true");
});

// ---------- Dropdown: a button that opens a menu ----------
// <div class="dropdown"><button class="btn" aria-haspopup="menu">…</button>
//   <div class="menu" role="menu" hidden><button class="menu__item" role="menuitemradio" aria-checked="true">…</button></div></div>
// The button opens and closes the menu. Picking an item checks it (menuitemradio), closes the menu
// and fires "pick" on the dropdown with the item in event.detail. Arrows move, Escape and a click
// outside close. Opening or picking doesn't take focus from where the person is typing.
const ddMenu = (dd) => dd.querySelector(":scope > .menu");
const ddButton = (dd) => dd.querySelector(':scope > [aria-haspopup="menu"]');
function ddSet(dd, open) {
  ddMenu(dd).hidden = !open;
  ddButton(dd).setAttribute("aria-expanded", open);
}
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

// ---------- Theme per project ----------
// A theme changes only COLOR and FONT. Space, radius and sizes stay bound by the laws.
//   import { theme } from "bend-ui";
//   theme({ accent: "#ffd21f", accentFg: "#02090a", fontDisplay: { family: "Jaro", src: jaroUrl } });
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
    console.warn(`bend-ui: "${k}" is not a theme key (only color and font).`);
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
];
export const tokens = T;
