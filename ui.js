// Bend-UI: um import liga tudo.
//   import "bend-ui";
// Lê os tokens de TOKENS.bend, escreve as variáveis CSS no :root,
// carrega os componentes (ui.css) e o sprite de ícones.

import T from "./TOKENS.bend";
import { ICONS } from "./icons.js";
import "./ui.css";

const px = (n) => n + "px";

const VARS = {
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
  "--font-sans": () => T.font_sans(), "--font-mono": () => T.font_mono(),
  "--text-xs": () => px(T.text_xs()), "--text-sm": () => px(T.text_sm()),
  "--text-md": () => px(T.text_md()), "--text-lg": () => px(T.text_lg()),
  "--text-xl": () => px(T.text_xl()), "--text-2xl": () => px(T.text_2xl()),
  "--weight-regular": () => String(T.weight_regular()),
  "--weight-medium": () => String(T.weight_medium()),
  "--weight-semibold": () => String(T.weight_semibold()),
  "--border-width": () => px(T.border_width()),
  "--leading-tight": () => T.leading_tight(), "--leading-ui": () => T.leading_ui(),
  "--leading-body": () => T.leading_body(), "--measure": () => T.measure_ch() + "ch",
  "--shadow-float": () => T.shadow_float(),
  "--duration": () => T.duration_ms() + "ms",
  "--bg": () => T.color_bg(), "--surface": () => T.color_surface(),
  "--surface-2": () => T.color_surface_2(), "--border": () => T.color_border(),
  "--border-strong": () => T.color_border_strong(), "--text": () => T.color_text(),
  "--text-2": () => T.color_text_2(), "--text-3": () => T.color_text_3(),
  "--accent": () => T.color_accent(), "--accent-fg": () => T.color_accent_fg(),
  "--accent-soft": () => T.color_accent_soft(),
  "--law": () => T.color_law(), "--law-soft": () => T.color_law_soft(),
  "--draft": () => T.color_draft(), "--draft-soft": () => T.color_draft_soft(),
  "--conflict": () => T.color_conflict(), "--conflict-soft": () => T.color_conflict_soft(),
};

for (const [name, get] of Object.entries(VARS)) {
  document.documentElement.style.setProperty(name, get());
}

function mountIcons() {
  if (document.getElementById("bend-ui-icons")) return;
  const box = document.createElement("div");
  box.id = "bend-ui-icons";
  box.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' + ICONS + "</svg>";
  document.body.prepend(box);
}
if (document.body) mountIcons(); else document.addEventListener("DOMContentLoaded", mountIcons);

export const icons = ["plus", "file-text", "scale", "triangle-alert", "circle-check", "x", "chevron-down", "list", "code", "wand-sparkles", "search", "panel-left"];
export const tokens = T;
