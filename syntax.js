// Bend-UI syntax: code in color. SYNTAX.bend cuts the text into pieces; this only draws them.
//   import { highlight, toHtml } from "bend-ui/syntax";
//   highlight(pre);                    // a <pre> (or a .block--code): colors its text, adds .syntax
//   el.innerHTML = toHtml(line);       // the HTML for one piece of code, to place yourself
// Only color changes, so the box keeps its size. The colors are tokens (TOKENS.bend: syntax_*).

import S from "./SYNTAX.bend";

const CLASS = ["", "syntax__kw", "syntax__type", "syntax__str", "syntax__num", "syntax__com", "syntax__punct", "syntax__name"];
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

export function toHtml(text) {
  let html = "";
  for (let l = S.pieces(text); l.$ === "Con"; l = l.tail) {
    const { kind, text: t } = l.head;
    html += CLASS[kind] ? `<span class="${CLASS[kind]}">${esc(t)}</span>` : esc(t);
  }
  return html;
}

export function highlight(box) {
  const code = box.querySelector("code") || box.querySelector(".block__text") || box;
  code.innerHTML = toHtml(code.textContent);
  box.classList.add("syntax");
}
