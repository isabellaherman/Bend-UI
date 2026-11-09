// Bend-UI syntax: code in color. SYNTAX.bend cuts the text into pieces; this only draws them.
//   import { highlight, toHtml } from "bend-ui/syntax";
//   highlight(pre);                    // a <pre> (or a .block--code): colors its text, adds .syntax
//   highlight(pre, "html");            // in another language: bend (default), js, css, html, sh, toml…
//   <pre data-lang="js">               // or say the language on the box
//   el.innerHTML = toHtml(line, "js"); // the HTML for one piece of code, to place yourself
// Only color changes, so the box keeps its size. The colors are tokens (TOKENS.bend: syntax_*).
//
// A code block: a head (the file or the language, and Copy) and the code, line by line.
//   el.innerHTML = codeBlock(code, { lang: "python", name: "laws.py", numbers: true, wrap: false });
//   upgrade(pre)          // turns a <pre data-lang data-name> into a code block in place
// Languages: bend, js (ts, json), css, html, sh (toml, yaml), python, rust, go, sql, markdown, diff.

import S from "./SYNTAX.bend";

const CLASS = ["", "syntax__kw", "syntax__type", "syntax__str", "syntax__num", "syntax__com", "syntax__punct", "syntax__name", "syntax__add", "syntax__del"];
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

const span = (kind, t) => (CLASS[kind] ? `<span class="${CLASS[kind]}">${esc(t)}</span>` : esc(t));

export function toHtml(text, lang = "bend") {
  return toLines(text, lang).join("\n");
}

// The code as lines of HTML. Markdown and Diff are read a line at a time; the rest piece by piece, and a
// piece that spans lines (a block comment) is split at each line's end.
export function toLines(text, name = "bend") {
  const lang = S.lang_of(name);
  if (S.is_line_based(lang)) return text.split("\n").map((l) => span(Number(S.line_kind(lang, l)), l));
  const lines = [""];
  for (let l = S.pieces_in(lang, text); l.$ === "Con"; l = l.tail) {
    const { kind, text: t } = l.head;
    t.split("\n").forEach((part, i) => { if (i) lines.push(""); if (part) lines[lines.length - 1] += span(Number(kind), part); });
  }
  return lines;
}

const LANG_NAME = { bend: "Bend", js: "JavaScript", ts: "TypeScript", json: "JSON", css: "CSS", html: "HTML", sh: "Shell", bash: "Shell", toml: "TOML", yaml: "YAML", yml: "YAML", python: "Python", py: "Python", rust: "Rust", rs: "Rust", go: "Go", sql: "SQL", markdown: "Markdown", md: "Markdown", diff: "Diff" };
const COPY_ICONS = '<svg class="icon"><use href="#i-copy"/></svg><svg class="icon"><use href="#i-check"/></svg>';
// head: true (the default) shows the file name, or else the language; false leaves only Copy, in the corner.
export function codeBlock(code, { lang = "bend", name, head = true, numbers = false, wrap = false } = {}) {
  const label = name || LANG_NAME[lang] || lang;
  const attr = (t) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const copy = `<button type="button" class="btn btn--plain btn--neutral btn--sm code-block__copy" data-copy="${attr(code)}" data-copied="Copied" data-reserve="Copy|Copied" aria-label="Copy the code"><span class="btn__swap" aria-hidden="true">${COPY_ICONS}</span><span class="btn__label">Copy</span></button>`;
  const lines = toLines(code, lang).map((l) => `<span class="code-block__line">${l || " "}</span>`).join("");
  return `<figure class="code-block syntax${numbers ? " code-block--numbers" : ""}${wrap ? " code-block--wrap" : ""}${head ? "" : " code-block--bare"}">` +
    (head ? `<figcaption class="code-block__head"><span class="code-block__name">${esc(label)}</span>${copy}</figcaption>` : copy) +
    `<pre class="code-block__pre" tabindex="0" aria-label="Code, ${attr(label)}"><code>${lines}</code></pre></figure>`;
}
export function upgrade(pre) {
  const d = pre.dataset, box = document.createElement("div");
  box.innerHTML = codeBlock(pre.textContent.replace(/\n$/, ""), { lang: d.lang || "bend", name: d.name, head: d.head !== "false", numbers: "numbers" in d, wrap: "wrap" in d });
  pre.replaceWith(box.firstChild);
}

export function highlight(box, lang) {
  // A name, or the box's data-lang, or Bend. (forEach(highlight) passes an index here: not a name, so it is ignored.)
  const name = typeof lang === "string" ? lang : box.dataset.lang || "bend";
  const code = box.querySelector("code") || box.querySelector(".block__text") || box;
  code.innerHTML = toHtml(code.textContent, name);
  box.classList.add("syntax");
}
