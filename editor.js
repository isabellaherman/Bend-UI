// Editor (opt-in): a block document people write in. import "bend-ui/editor".
// Bend holds the document and decides every change (EDITOR.bend): steps, their inverses, the history and what each
// key means. This file draws the blocks, reads where the caret is and tells Bend which key was pressed.
// Letters typed inside one block are written by the browser itself (so spelling, dictation and accents work as
// anywhere); the block's new text then goes to Bend. What changes the blocks (Enter, joining, pasting, undo) is Bend's.
//
//   <div class="editor" data-placeholder="Write here"></div>
//   const editor = mountEditor(el, { markdown: "# Title", figure, onChange });
//   editor.markdown()                      the document, as Markdown (EDITOR_MARKDOWN.bend)
//   editor.insertFigure("mermaid", text)   a figure where the caret was; the app's figure(block) draws it
//   editor.setKind("Head", 2) · setAlign(1) · setPlace(1) · move(-1) · undo() · redo()   on the caret's block
//   editor.state()                         { kind, level, align, place, canUndo, canRedo }, for the app's toolbar
import "./ui.js";
import "./editor.css";
import E from "./EDITOR.bend";
import M from "./EDITOR_MARKDOWN.bend";

export const list = (xs) => xs.reduceRight((tail, head) => ({ $: "Con", head, tail }), { $: "Nil" });
export const array = (xs) => { const out = []; for (let p = xs; p.$ === "Con"; p = p.tail) out.push(p.head); return out; };
const P = (block, offset) => ({ $: "Pos", block, offset });
// Bend counts letters (code points); the browser counts UTF-16 units.
const points = (s) => { let n = 0; for (const c of s) n += c ? 1 : 0; return n; };
const units = (s, n) => { let u = 0; for (const c of s) { if (n-- <= 0) break; u += c.length; } return u; };

const tagOf = (k) => k.$ === "Head" ? `h${k.level}` : k.$ === "Bullet" || k.$ === "Number" ? "li" : k.$ === "Quote" ? "blockquote" : k.$ === "Figure" ? "figure" : "p";
const groupOf = (k) => k.$ === "Bullet" ? "ul" : k.$ === "Number" ? "ol" : "";
const sameFigure = (a, b) => a.$ === "Figure" && b.$ === "Figure" && a.lang === b.lang && a.source === b.source;
const ALIGN = ["", "center", "right"];

// root: the .editor element. markdown: the document to open (or blocks: a Bend list of EDITOR.bend blocks).
// figure(block, editor): the application's element for a figure (what it shows; the caption is the lib's).
// onChange(): the document or the history changed. onSelect(): the caret went to another block.
// onSlash(): "/" on an empty paragraph. onError(error): Bend refused a change; the page shows the document as it was.
export function mountEditor(root, { markdown = "", blocks = null, figure = null, caption = "Caption", onChange = () => {}, onSelect = () => {}, onSlash = null, onError = () => {} } = {}) {
  let ed = E.start(blocks ?? M.read(markdown)), views = [], nodes = [], composing = false, last = null;
  const now = () => Math.floor(performance.now()) >>> 0;
  root.contentEditable = "true"; root.spellcheck = true;
  if (!root.hasAttribute("role")) { root.setAttribute("role", "textbox"); root.setAttribute("aria-multiline", "true"); }

  const fill = (host, text) => host.replaceChildren(text ? document.createTextNode(text) : document.createElement("br"));
  const tidy = (host) => host.childNodes.length === 1 && (host.firstChild.nodeType === 3 || host.firstChild.nodeName === "BR");
  function build(block) {
    if (block.kind.$ !== "Figure") { const el = document.createElement(tagOf(block.kind)); fill(el, block.text); return { block, el, host: el }; }
    const el = document.createElement("figure"), host = document.createElement("figcaption");
    el.className = "editor__figure"; el.contentEditable = "false"; host.className = "editor__caption"; host.contentEditable = "true";
    const shown = figure?.(block, api);
    if (shown) el.append(shown); else { const pre = document.createElement("pre"); pre.textContent = block.kind.source; el.append(pre); }
    fill(host, block.text); el.append(host);
    return { block, el, host };
  }
  // What the block is beyond its text: its alignment, its place on the page, and what to write when it is empty.
  function dress(v, only) {
    const b = v.block;
    if (b.align) v.el.dataset.align = ALIGN[b.align]; else delete v.el.dataset.align;
    if (b.place) v.el.dataset.place = "top"; else delete v.el.dataset.place;
    const hint = b.text ? "" : b.kind.$ === "Figure" ? caption : only ? root.dataset.placeholder ?? "" : "";
    if (hint) v.host.dataset.placeholder = hint; else delete v.host.dataset.placeholder;
  }
  // Draw the document Bend holds. A block that did not change keeps its element (and a figure what it shows).
  function draw() {
    const old = views, kept = new Map(old.map((v) => [v.block, v])), next = array(ed.doc), moved = new Set(next.filter((b) => kept.has(b)));
    views = next.map((b, i) => {
      const same = kept.get(b); if (same) return same;
      const at = old[i];
      if (at && !moved.has(at.block) && tagOf(at.block.kind) === tagOf(b.kind) && (b.kind.$ !== "Figure" || sameFigure(at.block.kind, b.kind))) {
        if (at.host.textContent !== b.text || !tidy(at.host)) fill(at.host, b.text);
        at.block = b; return at;
      }
      return build(b);
    });
    nodes = []; let group = null;
    for (const v of views) {
      dress(v, views.length === 1);
      const g = groupOf(v.block.kind);
      if (!g) { group = null; nodes.push(v.el); continue; }
      if (!group || group.localName !== g) { group = document.createElement(g); nodes.push(group); }
      group.append(v.el);
    }
    root.replaceChildren(...nodes);
  }
  // Whether the page still has the blocks as they were drawn (the browser only wrote letters inside them).
  const intact = () => root.childNodes.length === nodes.length && nodes.every((n, i) => root.childNodes[i] === n) && views.every((v) => v.el.isConnected);

  // A point of the page as a position of the document: the block and how many letters come before the point.
  function posOf(node, offset, end = false) {
    for (let i = 0; i < views.length; i++) {
      const v = views[i];
      if (v.host.contains(node)) { const r = document.createRange(); r.setStart(v.host, 0); r.setEnd(node, offset); return { pos: P(i, points(r.toString())), hosted: true }; }
      if (v.el.contains(node)) return { pos: P(end && i + 1 < views.length ? i + 1 : i, 0), hosted: false };
    }
    const r = document.createRange(); r.setStart(node, offset); r.collapse(true);
    for (let i = 0; i < views.length; i++) if (r.comparePoint(views[i].el, 0) >= 0) return { pos: P(i, 0), hosted: false };
    const i = Math.max(0, views.length - 1); return { pos: P(i, points(views[i]?.block.text ?? "")), hosted: false };
  }
  function selection() {
    const s = getSelection(); if (!s.rangeCount) return null; const r = s.getRangeAt(0);
    if (!root.contains(r.startContainer) || !root.contains(r.endContainer)) return null;
    const from = posOf(r.startContainer, r.startOffset), to = r.collapsed ? from : posOf(r.endContainer, r.endOffset, true);
    return { from: from.pos, to: to.pos, collapsed: r.collapsed, hosted: from.hosted && to.hosted };
  }
  function setCaret(pos) {
    if (!views.length) return;
    const i = Math.min(pos.block, views.length - 1), host = views[i].host;
    (host === views[i].el ? root : host).focus({ preventScroll: true });
    host.normalize(); const node = host.firstChild, r = document.createRange();
    if (node?.nodeType === 3) r.setStart(node, Math.min(units(node.data, pos.offset), node.length)); else r.setStart(host, 0);
    r.collapse(true); const s = getSelection(); s.removeAllRanges(); s.addRange(r); last = P(i, pos.offset);
    host.scrollIntoView?.({ block: "nearest" });
  }
  // Make a change Bend decided: draw it and put the caret where Bend says. A command that changed nothing
  // answers the same editor, and then nothing is drawn.
  function run(make) {
    let next; try { next = make(); } catch (error) { onError(error); draw(); return; }
    if (next === ed) return;
    ed = next; draw(); setCaret(ed.caret); onChange(); onSelect();
  }
  // After the browser wrote in a block: Bend gets the block's new text. The page is drawn again only when
  // Bend answers something else (a Markdown shortcut turned the paragraph into a heading, say).
  function settle() {
    const s = getSelection(), r = s.rangeCount ? s.getRangeAt(0) : null, at = r && root.contains(r.startContainer) ? posOf(r.startContainer, r.startOffset) : null;
    if (!intact() || !at?.hosted) { draw(); setCaret(at?.pos ?? ed.caret); return; }
    const i = at.pos.block, v = views[i], text = v.host.textContent;
    if (text === v.block.text) return;
    let next; try { next = E.write(ed, i, text, at.pos.offset, now()); } catch (error) { onError(error); fill(v.host, v.block.text); return; }
    ed = next; const block = E.block_at(ed.doc, i).value;
    if (block && tagOf(block.kind) === tagOf(v.block.kind) && block.text === text && array(ed.doc).length === views.length) { v.block = block; if (!v.host.firstChild) fill(v.host, ""); dress(v, views.length === 1); }
    else { draw(); setCaret(ed.caret); }
    onChange();
  }
  const undo = () => run(() => E.undo(ed)), redo = () => run(() => E.redo(ed));

  root.addEventListener("beforeinput", (e) => {
    if (e.isComposing || composing) return;
    const s = selection(), t = e.inputType; if (!s) { e.preventDefault(); return; }
    const { from, to } = s, many = from.block !== to.block;
    if (t === "insertParagraph" || t === "insertLineBreak") { e.preventDefault(); run(() => E.enter(ed, from, to, now())); return; }
    if (t === "historyUndo") { e.preventDefault(); undo(); return; }
    if (t === "historyRedo") { e.preventDefault(); redo(); return; }
    if (t.startsWith("delete") && t !== "deleteByDrag" && t !== "deleteByCut") {
      const back = !t.includes("Forward"), atEdge = back ? from.offset === 0 : from.offset >= points(views[from.block]?.block.text ?? "");
      if (many || !s.hosted) { e.preventDefault(); run(() => E.cut(ed, from, to, now())); }
      else if (s.collapsed && atEdge) { e.preventDefault(); run(() => back ? E.backspace(ed, from, from, now()) : E.delete(ed, from, from, now())); }
      return;   // inside one block the browser deletes, and settle() tells Bend
    }
    if (t === "insertText" || t === "insertReplacementText" || t === "insertCompositionText") {
      if (many || !s.hosted) { e.preventDefault(); const data = e.data ?? ""; if (data || many) run(() => E.put(ed, from, to, data, now())); }
      return;
    }
    e.preventDefault();   // pasting and cutting are read in their own events; formats, drags and drops are not part of this editor
  });
  root.addEventListener("input", () => { if (!composing) settle(); });
  root.addEventListener("compositionstart", () => { composing = true; });
  root.addEventListener("compositionend", () => { composing = false; settle(); });
  root.addEventListener("paste", (e) => {
    e.preventDefault(); const s = selection(), text = (e.clipboardData?.getData("text/plain") ?? "").replace(/\r\n?/g, "\n");
    if (s && text) run(() => E.paste(ed, s.from, s.to, M.read(text), now()));
  });
  root.addEventListener("cut", (e) => {
    const s = selection(); if (!s || s.collapsed) return;
    e.preventDefault(); e.clipboardData?.setData("text/plain", getSelection().toString()); run(() => E.cut(ed, s.from, s.to, now()));
  });
  root.addEventListener("drop", (e) => e.preventDefault());
  root.addEventListener("keydown", (e) => {
    const mod = e.metaKey || e.ctrlKey, key = e.key.toLowerCase();
    if (mod && key === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
    if (mod && key === "y") { e.preventDefault(); redo(); return; }
    if (mod && (key === "b" || key === "i" || key === "u")) { e.preventDefault(); return; }
    if (e.key === "/" && onSlash && !mod && !composing) {
      const s = selection(), b = s && views[s.from.block]?.block;
      if (s?.collapsed && b && b.kind.$ === "Para" && E.is_blank(b.text)) { e.preventDefault(); last = s.from; onSlash(); }
    }
  });
  const remember = () => { const s = selection(); if (!s) return; const moved = !last || last.block !== s.to.block; last = s.to; if (moved) onSelect(); };
  document.addEventListener("selectionchange", remember);

  const indexOf = (el) => views.findIndex((v) => v.el === el || v.el.contains(el));
  const end = () => { const i = Math.max(0, views.length - 1); return P(i, points(views[i]?.block.text ?? "")); };
  const here = () => last && last.block < views.length ? last : end();
  const api = {
    blocks: () => ed.doc,
    markdown: () => M.write(ed.doc),
    // The caret's block, for the application's toolbar.
    state() { const b = views[here().block]?.block; return { kind: b?.kind.$ ?? "Para", level: b?.kind.level ?? 0, align: b?.align ?? 0, place: b?.place ?? 0, canUndo: E.can_undo(ed), canRedo: E.can_redo(ed) }; },
    undo, redo,
    // What the caret's block is: "Para", "Head" (with a level, 1 to 3), "Bullet", "Number" or "Quote".
    setKind(kind, level = 1) { const c = here(); run(() => E.set_kind(ed, c, c.block, kind === "Head" ? { $: "Head", level } : { $: kind }, now())); },
    setAlign(align) { const c = here(); run(() => E.set_align(ed, c, c.block, align, now())); },
    setPlace(place) { const c = here(); run(() => E.set_place(ed, c, c.block, place, now())); },
    // The caret's block one place up (-1) or down (1).
    move(by) { const c = here(), to = c.block + by; if (to >= 0 && to < views.length) run(() => E.move(ed, c, c.block, to, now())); },
    // A figure at the block where the caret was last.
    insertFigure(lang, source) { const c = here(); run(() => E.insert_figure(ed, c, lang, source, now())); },
    // For the application's own buttons inside a figure: take the figure out.
    remove(el) { const i = indexOf(el); if (i >= 0) run(() => E.remove_block(ed, i, now())); },
    // The application changed the document by itself (it refreshed what the figures show): no undo entry.
    replace(next) { ed = E.put_doc(ed, next); views = []; draw(); },
    focus() { setCaret(here()); },
    destroy() { document.removeEventListener("selectionchange", remember); root.replaceChildren(); root.contentEditable = "false"; },
  };
  draw();
  return api;
}
