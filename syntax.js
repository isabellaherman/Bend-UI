// Bend-UI syntax: code in color. SYNTAX.bend cuts the text into pieces; this only draws them.
//   import { highlight, toHtml } from "bend-ui/syntax";
//   highlight(pre);                    // a <pre> (or a .block--code): colors its text, adds .syntax
//   highlight(pre, "html");            // in another language: bend (default), js, css, html, sh, toml…
//   <pre data-lang="js">               // or say the language on the box
//   el.innerHTML = toHtml(line, "js"); // the HTML for one piece of code, to place yourself
// Only color changes, so the box keeps its size. The colors are tokens (TOKENS.bend: syntax_*).

import S from "./SYNTAX.bend";

const CLASS = ["", "syntax__kw", "syntax__type", "syntax__str", "syntax__num", "syntax__com", "syntax__punct", "syntax__name"];
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

export function toHtml(text, lang = "bend") {
  let html = "";
  for (let l = S.pieces_in(S.lang_of(lang), text); l.$ === "Con"; l = l.tail) {
    const { kind, text: t } = l.head;
    html += CLASS[kind] ? `<span class="${CLASS[kind]}">${esc(t)}</span>` : esc(t);
  }
  return html;
}

export function highlight(box, lang) {
  // A name, or the box's data-lang, or Bend. (forEach(highlight) passes an index here: not a name, so it is ignored.)
  const name = typeof lang === "string" ? lang : box.dataset.lang || "bend";
  const code = box.querySelector("code") || box.querySelector(".block__text") || box;
  code.innerHTML = toHtml(code.textContent, name);
  box.classList.add("syntax");
}
