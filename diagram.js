// Bend-UI diagram: nodes and the arrows between them, read top to bottom.
//   import { mountDiagram } from "bend-ui/diagram";
//
// Where each node goes (its row and its place on the row) is DIAGRAM.bend; this file only
// draws: the nodes as boxes, the arrows as lines, measured from where the boxes landed.
//
//   const d = mountDiagram(el, {
//     nodes: [{ label: "Title" }, { label: "Play", tone: "accent", tag: "loop" }],
//     edges: [{ from: 0, to: 1, label: "Start" }],
//   });
//   d.nodes[1]   // the box of node 1
//
// Node menu (optional): { nodeMenu: (i) => [elements] }. The node is the trigger of a Dropdown menu: its label
// opens the lib's .menu holding those elements, built as the Dropdown menu builds them (.menu__item, .icon,
// .tag, .menu__check, .separator); each item does what its own click says. The diagram doesn't change itself.
//
// Free layout (optional): { positions: [{ x, y }], onNodeMove: (i, { x, y }) => … }. Nodes sit at those
// places instead of in rows; drag a node to move it. The app keeps the positions and draws again.
// Give every node a position: one without an entry sits at the diagram's corner.
//
// Connect (optional): mountDiagram(el, data, { isValidConnection, onConnect }). Drag the dot under a node
// onto another node; both get { source, target }. The diagram doesn't change itself: draw it again in the same
// element with the new edge, and the nodes glide to their new places while the new arrow runs in.
//   d.destroy()
//
// Rename (optional): { onLabelEdit: (i, label) => … }. A double-click on a node, F2 on its focused label, or
// d.editLabel(i) turns the label into a field. Enter or leaving it calls onLabelEdit with the new name; Escape
// cancels; an empty name shakes. The app saves the name and draws again: the node stays where it was and the
// new name forms from a blur (the thread's formBlock). Other changes move too: a new node grows out of the node
// it comes from, and d.leave(i) shrinks a node away before the app draws without it.
//
// Accessibility (WCAG 2.2 AA): give the diagram a name with { label }. Each node tells screen readers its tone
// and where its arrows go; changes are announced (announce(text) is exported for the app's own changes);
// d.focusAfterDraw(label) puts the focus back on a node after the app draws again. In free layout,
// Shift + an arrow moves the focused node. Dragging always has a menu or keyboard alternative in the app.
//
// tone is "" (neutral), "accent", "success", "warning" or "danger". The node shows it as a colored border;
// put .diagram--soft on el for the other look: a soft fill with the tone in the text.
//
// shape (optional) is one of Mermaid's 14 flowchart shapes, by Mermaid's name: rect (Process), rounded (Event),
// stadium, fr-rect, cyl (Database), circle (Start), dbl-circ (Stop), odd, diam (Decision), hex, lean-r, lean-l,
// trap-b, trap-t. No shape is today's box; an unknown name is drawn as the box, with a warning. A \n in a label
// starts a new line, and in rename Shift+Enter adds one. DIAGRAM.bend decides each shape's size and where return
// arrows and self-loops meet it; screen readers hear it ("Shape: Decision."); the focus ring follows it.
// tag is a short word on the box. An arrow's label sits on its line.
import D from "./DIAGRAM.bend";
import M from "./MOTION.bend";
import T from "./TOKENS.bend";

const NS = "http://www.w3.org/2000/svg";
const list = (xs) => xs.reduceRight((tail, head) => ({ $: "Con", head, tail }), { $: "Nil" });
const array = (l) => { const out = []; while (l.$ === "Con") { out.push(Number(l.head)); l = l.tail; } return out; };
const el = (tag, cls, text) => { const x = document.createElement(tag); x.className = cls; if (text) x.textContent = text; return x; };
let uid = 0;
const lessMotion = matchMedia("(prefers-reduced-motion: reduce)");
// Where each node was the last time a diagram was drawn in this element, by label, and which arrows it had.
const last = new WeakMap();
// One polite live region for every diagram: what changed is said, not only shown.
let live = null, refocus = null;
export function announce(text) {
  if (!live) { live = document.body.appendChild(el("div", "sr-only")); live.setAttribute("role", "status"); }
  live.textContent = ""; requestAnimationFrame(() => { live.textContent = text; });
}

// A value over time, eased by MOTION.bend, as chart.js and thread.js do it. A newer run stops an older one.
function tween(run, ms, ease, step) {
  return new Promise((done) => {
    if (lessMotion.matches || ms <= 0) { step(1); return done(); }
    const t0 = performance.now();
    const frame = (now) => {
      if (run.stopped) return done();
      const k = Math.min(1, (now - t0) / ms);
      step(ease(k));
      if (k < 1) requestAnimationFrame(frame); else done();
    };
    requestAnimationFrame(frame);
  });
}

// ---------- Shapes ----------
// Mermaid's 14 flowchart shapes, by Mermaid's own name: the number DIAGRAM.bend knows it by, and what a
// screen reader hears. DIAGRAM.bend decides each shape's size, and where a return arrow and a self-loop
// meet its outline; this file only draws the outline from those numbers.
export const SHAPES = {
  rect: [1, "Process"], rounded: [2, "Event"], stadium: [3, "Terminal point"], "fr-rect": [4, "Subprocess"],
  cyl: [5, "Database"], circle: [6, "Start"], "dbl-circ": [7, "Stop"], odd: [8, "Odd"], diam: [9, "Decision"],
  hex: [10, "Prepare conditional"], "lean-r": [11, "Data input/output"], "lean-l": [12, "Data output/input"],
  "trap-b": [13, "Priority action"], "trap-t": [14, "Manual operation"],
};
const code = (b) => SHAPES[b.dataset.shape]?.[0] ?? 0;
const px = (x) => Math.round(x);
const rr = (o, W, H, r) => { r = Math.min(r, (H - 2 * o) / 2, (W - 2 * o) / 2);
  return `M${o + r},${o} H${W - o - r} A${r},${r} 0 0 1 ${W - o},${o + r} V${H - o - r} A${r},${r} 0 0 1 ${W - o - r},${H - o} H${o + r} A${r},${r} 0 0 1 ${o},${H - o - r} V${o + r} A${r},${r} 0 0 1 ${o + r},${o} Z`; };
const circ = (cx, cy, r) => `M${cx - r},${cy} A${r},${r} 0 1 0 ${cx + r},${cy} A${r},${r} 0 1 0 ${cx - r},${cy} Z`;
// The outline, W × H px, the stroke's middle o px in: a body (filled and stroked) and lines (stroked only).
function outline(shape, W, H, o = 0.5) {
  const k = D.slant(px(H)), m = H / 2, cap = T.diagram_cap(), fr = T.diagram_frame(), gap = T.diagram_ring_gap();
  switch (shape) {
    case "rounded": return { d: rr(o, W, H, T.radius_lg()) };
    case "stadium": return { d: rr(o, W, H, H / 2) };
    case "fr-rect": return { d: rr(o, W, H, T.radius_xs()), lines: `M${fr},${o} V${H - o} M${W - fr},${o} V${H - o}` };
    case "cyl": { const rx = W / 2 - o; return { d: `M${o},${cap} A${rx},${cap} 0 0 1 ${W - o},${cap} V${H - cap} A${rx},${cap} 0 0 1 ${o},${H - cap} Z`, lines: `M${o},${cap} A${rx},${cap} 0 0 0 ${W - o},${cap}` }; }
    case "circle": return { d: circ(W / 2, H / 2, W / 2 - o) };
    case "dbl-circ": return { d: circ(W / 2, H / 2, W / 2 - o), lines: circ(W / 2, H / 2, W / 2 - o - gap) };
    case "odd": return { d: `M${o},${o} H${W - o} V${H - o} H${o} L${m},${m} Z` };
    case "diam": return { d: `M${W / 2},${o} L${W - o},${m} L${W / 2},${H - o} L${o},${m} Z` };
    case "hex": return { d: `M${k},${o} H${W - k} L${W - o},${m} L${W - k},${H - o} H${k} L${o},${m} Z` };
    case "lean-r": return { d: `M${k},${o} H${W - o} L${W - k},${H - o} H${o} Z` };
    case "lean-l": return { d: `M${o},${o} H${W - k} L${W - o},${H - o} H${k} Z` };
    case "trap-b": return { d: `M${k},${o} H${W - k} L${W - o},${H - o} H${o} Z` };
    case "trap-t": return { d: `M${o},${o} H${W - o} L${W - k},${H - o} H${k} Z` };
    default: return { d: rr(o, W, H, T.radius_xs()) };
  }
}
export function mountDiagram(root, { nodes, edges: given }, { isValidConnection, onConnect, nodeMenu, positions, onNodeMove, onLabelEdit, label: title } = {}) {
  const n = nodes.length;
  // Arrows with the same ends are one line: their words join ("Add · Always add").
  const edges = [];
  for (const e of given) {
    const same = edges.find((x) => x.from === e.from && x.to === e.to);
    if (!same) edges.push({ ...e });
    else if (e.label) same.label = same.label ? same.label + " · " + e.label : e.label;
  }
  const edgeList = () => list(edges.map((e) => ({ $: "Edge", from: e.from, to: e.to })));
  const rows = D.rows(n, edgeList());
  // A return arrow (it closes a loop, DIAGRAM.bend: back) doesn't push rows; it goes back up beside the others.
  const back = array(D.back(n, edgeList())).map((b) => Number(b) === 1);
  const row = array(rows), depth = Number(D.depth(rows));
  // On a row, each node sits under the nodes it comes from (DIAGRAM.bend: order), so arrows cross less.
  const place = array(D.order(n, edgeList()));

  // Free layout: with positions ([{ x, y }] per node, in px from the diagram's corner), the nodes sit
  // where the app says instead of in rows, and dragging a node calls onNodeMove(i, { x, y }) when let go.
  const free = Array.isArray(positions);
  root.classList.add("diagram");
  // Screen readers: the diagram is a graphics document; each node says its tone and where its arrows go.
  root.setAttribute("role", "graphics-document"); root.setAttribute("aria-roledescription", "diagram");
  if (title) root.setAttribute("aria-label", title);
  const interactive = !!(onLabelEdit || onConnect || nodeMenu || free);
  root.classList.toggle("diagram--free", free);
  root.replaceChildren();
  const svg = document.createElementNS(NS, "svg");
  svg.classList.add("diagram__wires");
  svg.setAttribute("aria-hidden", "true");
  const arrow = "diagram-arrow-" + ++uid;
  // The arrowhead is --space-2 wide (TOKENS.bend: space_2); its shape is drawn in a 0..1 box.
  const head = parseFloat(getComputedStyle(root).getPropertyValue("--space-2")) || 0;
  svg.innerHTML = `<defs><marker id="${arrow}" viewBox="0 0 1 1" refX="1" refY="0.5" markerWidth="${head}" markerHeight="${head}" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L1,0.5 L0,1 Z"/></marker></defs>`;
  root.append(svg);

  // Rows top to bottom; on a row, nodes in their place (DIAGRAM.bend: order).
  const rowEls = free ? [] : Array.from({ length: depth }, () => root.appendChild(el("div", "diagram__row")));
  const boxes = nodes.map((node, i) => {
    const items = nodeMenu?.(i) ?? [];
    const shaped = Object.hasOwn(SHAPES, node.shape ?? "") && node.shape;
    if (node.shape && !shaped) console.warn(`bend-ui: "${node.shape}" is not a node shape; drawn as the box.`);
    const b = el("div", "diagram__node" + (node.tone ? " diagram__node--" + node.tone : "") + (items.length ? " dropdown" : "") + (shaped ? " diagram__node--shaped" : ""));
    if (shaped) { b.dataset.shape = shaped; b.insertAdjacentHTML("afterbegin", '<svg class="diagram__shape" aria-hidden="true"><path class="diagram__ring"/><path class="diagram__body"/><path class="diagram__lines"/></svg>'); }
    if (!items.length) b.append(el("span", "diagram__text", node.label));
    else {
      // With a menu, the node is the trigger of a Dropdown menu: its label opens the lib's .menu, which holds
      // the items the app built (ui.js opens, closes and fires "pick"; each item does what its click says).
      const open = b.appendChild(el("button", "diagram__text diagram__open", node.label));
      const menu = b.appendChild(el("div", "menu"));
      open.type = "button"; open.id = arrow + "-open" + i; open.setAttribute("aria-haspopup", "menu"); open.setAttribute("aria-expanded", "false");
      menu.id = arrow + "-menu" + i; menu.setAttribute("role", "menu"); menu.setAttribute("aria-labelledby", open.id); menu.hidden = true;
      open.setAttribute("aria-controls", menu.id);
      menu.append(...items);
    }
    if (node.tag) b.append(el("span", "tag tag--mono", node.tag));
    b.setAttribute("role", "graphics-object");
    const name = (e, other) => nodes[other]?.label.replace(/\n/g, " ") + (e.label ? " (" + e.label + ")" : "");
    const out = edges.filter((e) => e.from === i).map((e) => name(e, e.to)), inn = edges.filter((e) => e.to === i).map((e) => name(e, e.from));
    const said = [shaped && "Shape: " + SHAPES[shaped][1] + ".", node.tone && "Tone: " + node.tone + ".", out.length && "Goes to " + out.join(", ") + ".", inn.length && "Comes from " + inn.join(", ") + "."].filter(Boolean).join(" ");
    if (said) {
      const sr = b.appendChild(el("span", "sr-only", said)); sr.id = arrow + "-d" + i;
      const target = b.querySelector(".diagram__open") ?? b;
      target.setAttribute("aria-describedby", sr.id);
    }
    if (interactive && !items.length) b.tabIndex = 0;
    if (free) { const p = positions[i] ?? { x: 0, y: 0 }; b.style.left = p.x + "px"; b.style.top = p.y + "px"; root.append(b); }
    return b;
  });
  if (!free) boxes.map((b, i) => i).sort((a, b) => place[a] - place[b]).forEach((i) => rowEls[row[i]].append(boxes[i]));
  const wires = edges.map(() => svg.appendChild(document.createElementNS(NS, "path")));
  wires.forEach((w) => w.setAttribute("marker-end", `url(#${arrow})`));
  const labels = edges.map((e) => (e.label ? root.appendChild(el("span", "diagram__label", e.label)) : null));

  // Connect: drag a node's handle and a straight arrow follows the pointer. Over a node that
  // isValidConnection allows, the node is marked and the arrow snaps to where it would enter. Let go there
  // and onConnect gets { source, target } (node indexes). Anywhere else the arrow runs back into the handle.
  let drag = null;
  const run = {};
  const at = (r, box) => ({ x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top });
  const line = (path, a, b) => path.setAttribute("d", `M${a.x},${a.y} L${b.x},${b.y}`);
  const follow = (e) => {
    const box = root.getBoundingClientRect(), from = at(drag.handle.getBoundingClientRect(), box);
    const over = boxes.indexOf(document.elementFromPoint(e.clientX, e.clientY)?.closest(".diagram__node"));
    if (over !== drag.over) {
      drag.over = over;
      const ok = over >= 0 && over !== drag.source && (!isValidConnection || isValidConnection({ source: drag.source, target: over }));
      boxes[drag.target]?.classList.remove("is-target");
      drag.target = ok ? over : -1;
      boxes[drag.target]?.classList.add("is-target");
    }
    const t = boxes[drag.target]?.getBoundingClientRect();
    drag.end = t ? { x: t.left + t.width / 2 - box.left, y: t.top - box.top } : { x: e.clientX - box.left, y: e.clientY - box.top };
    line(drag.line, from, drag.end);
  };
  const release = (e) => {
    const { handle, line: path, source, target, end } = drag;
    handle.removeEventListener("pointermove", follow);
    handle.removeEventListener("pointerup", release);
    handle.removeEventListener("pointercancel", release);
    handle.classList.remove("is-active"); boxes[target]?.classList.remove("is-target"); root.classList.remove("is-connecting");
    drag = null;
    if (e.type === "pointerup" && target >= 0) { path.remove(); announce("Connected " + nodes[source].label + " to " + nodes[target].label); refocus = nodes[source].label; onConnect?.({ source, target }); return; }
    const from = at(handle.getBoundingClientRect(), root.getBoundingClientRect());
    tween(run, T.duration_enter_ms(), M.ease_out, (k) => line(path, from, { x: end.x + (from.x - end.x) * k, y: end.y + (from.y - end.y) * k }))
      .then(() => path.remove());
  };
  boxes.forEach((b, source) => {
    const handle = b.appendChild(el("span", "dot diagram__handle"));
    handle.addEventListener("pointerdown", (e) => {
      if (drag) return;
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      handle.classList.add("is-active"); root.classList.add("is-connecting");
      const path = svg.appendChild(document.createElementNS(NS, "path"));
      path.setAttribute("marker-end", `url(#${arrow})`);
      drag = { handle, line: path, source, over: -2, target: -1 };
      follow(e);
      handle.addEventListener("pointermove", follow);
      handle.addEventListener("pointerup", release);
      handle.addEventListener("pointercancel", release);
    });
  });

  // Moving a node in free layout: past a few pixels a press becomes a move, and the click that ends it
  // doesn't open the node's menu.
  if (free) {
    const nudge = parseFloat(getComputedStyle(root).getPropertyValue("--space-1")) || 0;
    boxes.forEach((b, i) => {
      let start = null, moved = false;
      // The move is followed on the whole document, so a fast drag can't slip off the node, and the node
      // never captures the pointer, so a plain click still reaches its menu button.
      const move = (e) => {
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (!moved && Math.hypot(dx, dy) < nudge) return;
        moved = true; b.classList.add("is-moving");
        b.style.left = Math.max(0, start.left + dx) + "px"; b.style.top = Math.max(0, start.top + dy) + "px";
        fit(); draw();
      };
      const end = () => {
        document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", end); document.removeEventListener("pointercancel", end);
        start = null; b.classList.remove("is-moving");
        if (moved) onNodeMove?.(i, { x: parseFloat(b.style.left), y: parseFloat(b.style.top) });
      };
      b.addEventListener("pointerdown", (e) => {
        if (start || e.target.closest(".diagram__handle, .menu")) return;
        start = { x: e.clientX, y: e.clientY, left: parseFloat(b.style.left), top: parseFloat(b.style.top) }; moved = false;
        document.addEventListener("pointermove", move); document.addEventListener("pointerup", end); document.addEventListener("pointercancel", end);
      });
      b.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    });
  }
  // In free layout the diagram is as tall and wide as its nodes reach.
  function fit() {
    if (!free) return;
    const box = root.getBoundingClientRect();
    let w = 0, h = 0;
    boxes.forEach((b) => { const r = b.getBoundingClientRect(); w = Math.max(w, r.right - box.left); h = Math.max(h, r.bottom - box.top); });
    root.style.minWidth = w + "px"; root.style.minHeight = h + nudgeBottom() + "px";
  }
  const nudgeBottom = () => parseFloat(getComputedStyle(root).getPropertyValue("--space-7")) || 0;
  // Size: a node is at least diagram_node_min wide and grows in diagram_node_step steps (DIAGRAM.bend: node_width),
  // so short labels don't become chips and a row reads as one family.
  // A diagram mounted while hidden (display: none) can't measure its text: it sizes itself when it shows.
  let unsized = false;
  const sizeNodes = () => (unsized = !root.offsetWidth) || boxes.forEach((b) => {
    if (b.classList.contains("is-editing")) return;
    b.style.width = ""; b.style.height = ""; b.style.paddingLeft = "";
    const shape = b.dataset.shape;
    if (shape) {
      // DIAGRAM.bend: the shape's size around the text, and how far the flag's notch pushes the text right.
      const r = b.getBoundingClientRect(), k = code(b), w = Math.ceil(r.width), h = Math.ceil(r.height);
      const pad = D.pad_left(k, h);
      b.style.width = D.shape_w(k, w, h) + "px"; b.style.height = D.shape_h(k, w, h) + "px";
      if (pad) b.style.paddingLeft = `calc(${pad}px + var(--space-3))`;
      drawShape(b); return;
    }
    const natural = b.getBoundingClientRect().width, cap = parseFloat(getComputedStyle(b).maxWidth) || natural;
    b.style.width = D.node_width(natural, T.diagram_node_min(), T.diagram_node_step(), Math.max(cap, T.diagram_node_min())) + "px";
  });
  function drawShape(b) {
    const W = b.offsetWidth, H = b.offsetHeight, shape = b.dataset.shape, svg = b.querySelector(":scope > .diagram__shape");
    if (!svg || !W) return;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const o = outline(shape, W, H);
    svg.querySelector(".diagram__body").setAttribute("d", o.d);
    svg.querySelector(".diagram__lines").setAttribute("d", o.lines ?? "");
    // The focus ring that follows the outline: the same shape, grown by the focus offset and half the ring.
    const g = parseFloat(getComputedStyle(b).getPropertyValue("--focus-offset")) + parseFloat(getComputedStyle(b).getPropertyValue("--focus-width")) / 2 + 0.5;
    const ring = outline(shape, W + 2 * g, H + 2 * g, 0);
    const ringEl = svg.querySelector(".diagram__ring"); ringEl.setAttribute("d", ring.d); ringEl.setAttribute("transform", `translate(${-g} ${-g})`);
  }
  const resized = new ResizeObserver((es) => es.forEach((e) => drawShape(e.target)));
  boxes.forEach((b) => b.dataset.shape && resized.observe(b));
  sizeNodes();
  fit();

  // An arrow's words: the middle of its line first, else the first place along it (DIAGRAM.bend: label_tries)
  // that covers no node and no words already placed (DIAGRAM.bend: covers).
  const tries = (() => { const out = []; let l = D.label_tries(); while (l.$ === "Con") { out.push(l.head); l = l.tail; } return out; })();
  const s3 = (p0, p1, p2, p3, t) => { const u = 1 - t; return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3; };
  function placeLabels(box, curves) {
    const taken = boxes.map((b) => { const r = b.getBoundingClientRect(); return [r.left - box.left, r.top - box.top, r.right - box.left, r.bottom - box.top]; });
    const clear = (r) => !taken.some((o) => D.covers(r[0], r[1], r[2], r[3], o[0], o[1], o[2], o[3]));
    curves.forEach(([i, c]) => {
      const l = labels[i]; if (!l) return;
      const w = l.offsetWidth, h = l.offsetHeight;
      const at = (t) => ({ x: s3(c[0], c[2], c[4], c[6], t), y: s3(c[1], c[3], c[5], c[7], t) });
      const rect = (p) => [p.x - w / 2, p.y - h / 2, p.x + w / 2, p.y + h / 2];
      const spot = tries.map(at).find((p) => clear(rect(p))) ?? at(tries[0]);
      l.style.left = spot.x + "px"; l.style.top = spot.y + "px";
      taken.push(rect(spot));
    });
  }

  // An arrow leaves the bottom of its start and enters the top of its end, in a soft S.
  function draw() {
    if (unsized && root.offsetWidth) { sizeNodes(); fit(); }
    const box = root.getBoundingClientRect();
    const curves = [];
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    edges.forEach((e, i) => {
      const a = boxes[e.from]?.getBoundingClientRect(), b = boxes[e.to]?.getBoundingClientRect();
      if (!a || !b) return;
      if (back[i]) {
        // A return arrow goes back up outside the forward arrows, on the diagram's nearer side: it leaves its
        // start's side and curves into its end's side, never over the forward arrow or the nodes between.
        // A node that points to itself loops from its side into its top.
        const out = parseFloat(getComputedStyle(root).getPropertyValue("--space-7")) || 0;
        const ca = a.left + a.width / 2, cb = b.left + b.width / 2;
        const left = (ca + cb) / 2 < box.left + box.width / 2 - 1, dir = left ? -1 : 1;
        // DIAGRAM.bend: how far in from the box a slanted side or the flag's notch is, at mid-height.
        const inset = (r, k) => D.side_inset(code(boxes[k]), left ? 0 : 1, px(r.width), px(r.height));
        const sx = (r, k) => (left ? r.left + inset(r, k) : r.right - inset(r, k)) - box.left, my = (r) => r.top + r.height / 2 - box.top;
        if (e.from === e.to) {
          const x1 = sx(a, e.from), y1 = my(a), x2 = sx(a, e.from) - dir * a.width / 4, k = code(boxes[e.from]);
          const y2 = a.top - box.top + D.top_at(k, px(x2 + box.left - a.left), px(a.width), px(a.height));   // DIAGRAM.bend: where the top is
          wires[i].setAttribute("d", `M${x1},${y1} C${x1 + dir * out},${y1} ${x2},${y2 - out} ${x2},${y2}`);
          if (labels[i]) { labels[i].style.left = x1 + dir * out * 0.6 + "px"; labels[i].style.top = y2 - out * 0.4 + "px"; }
          return;
        }
        const x1 = sx(a, e.from), y1 = my(a), x2 = sx(b, e.to), y2 = my(b);
        const reach = (left ? Math.min(x1, x2) : Math.max(x1, x2)) + dir * out;
        wires[i].setAttribute("d", `M${x1},${y1} C${reach},${y1} ${reach},${y2} ${x2},${y2}`);
        if (labels[i]) { labels[i].style.left = reach - dir * out / 4 + "px"; labels[i].style.top = (y1 + y2) / 2 + "px"; }
        return;
      }
      const x1 = a.left + a.width / 2 - box.left, y1 = a.bottom - box.top;
      const x2 = b.left + b.width / 2 - box.left, y2 = b.top - box.top;
      const bend = (y2 - y1) / 2;
      wires[i].setAttribute("d", `M${x1},${y1} C${x1},${y1 + bend} ${x2},${y2 - bend} ${x2},${y2}`);
      curves.push([i, [x1, y1, x1, y1 + bend, x2, y2 - bend, x2, y2]]);
    });
    placeLabels(box, curves);
    if (!moving) remember(box);
  }
  function remember(box) {
    const places = new Map();
    boxes.forEach((b, i) => { const r = b.getBoundingClientRect(); if (!places.has(nodes[i].label)) places.set(nodes[i].label, { x: r.left - box.left, y: r.top - box.top }); });
    last.set(root, { places, arrows: new Set(edges.map(key)) });
  }
  // Drawn again in the same element (a new arrow, a new node): nodes glide from where they were and new
  // arrows run in from their start, over duration_connect, eased by MOTION.bend (as the thread's line).
  // Nodes are matched by label, so a different diagram just appears.
  const key = (e) => nodes[e.from].label + "\u0001" + nodes[e.to].label;
  const before = last.get(root);
  let moving = false;
  const watch = new ResizeObserver(draw);
  watch.observe(root);
  boxes.forEach((b) => watch.observe(b));
  draw();
  if (before) {
    const box = root.getBoundingClientRect();
    const shift = boxes.map((b, i) => {
      const was = before.places.get(nodes[i].label), r = b.getBoundingClientRect();
      if (was) return { x: was.x - (r.left - box.left), y: was.y - (r.top - box.top) };
      // A new node grows out of the node it comes from: it starts there, small, and travels down its arrow.
      const parent = edges.find((e) => e.to === i && before.places.has(nodes[e.from].label));
      const from = parent && before.places.get(nodes[parent.from].label);
      return from ? { x: from.x - (r.left - box.left), y: from.y - (r.top - box.top), born: true } : { x: 0, y: 0 };
    });
    const fresh = edges.map((e, i) => (before.places.has(nodes[e.from].label) && !before.arrows.has(key(e)) ? wires[i] : null)).filter(Boolean);
    if (fresh.length || shift.some((d) => d.x || d.y)) {
      moving = true;
      fresh.forEach((w) => { w.removeAttribute("marker-end"); labels[wires.indexOf(w)]?.setAttribute("hidden", ""); });
      tween(run, T.duration_connect_ms(), M.ease_in_out, (k) => {
        boxes.forEach((b, i) => {
          const s = shift[i];
          b.style.transform = k < 1 && (s.x || s.y) ? `translate(${s.x * (1 - k)}px, ${s.y * (1 - k)}px)` + (s.born ? ` scale(${0.6 + 0.4 * k})` : "") : "";
          if (s.born) b.style.opacity = k < 1 ? String(Math.min(1, k * 2)) : "";
        });
        draw();
        fresh.forEach((w) => { const len = w.getTotalLength(); w.style.strokeDasharray = `${len} ${len}`; w.style.strokeDashoffset = String(len * (1 - k)); });
      }).then(() => {
        if (run.stopped) return;
        moving = false;
        fresh.forEach((w) => { w.style.strokeDasharray = ""; w.style.strokeDashoffset = ""; w.setAttribute("marker-end", `url(#${arrow})`); labels[wires.indexOf(w)]?.removeAttribute("hidden"); });
        draw();
      });
    }
  }

  // Rename: the field sits in the label's place; the label comes back with the new name, formed from a blur.
  const ease = T.ease();
  const anim = (x, frames, ms) => (lessMotion.matches ? Promise.resolve() : x.animate(frames, { duration: ms, easing: ease, fill: "forwards" }).finished);
  const b0 = T.blur_form();
  const gone = [{ opacity: 1, filter: "blur(0)", transform: "none" }, { opacity: 0, filter: `blur(${b0}px)`, transform: `translateY(-${b0}px)` }];
  const come = [{ opacity: 0, filter: `blur(${b0}px)`, transform: `translateY(${b0}px)` }, { opacity: 1, filter: "blur(0)", transform: "none" }];
  let editing = -1;
  function shake(b) {
    const t = M.shake_time() * 1000, size = T.space_1();
    return tween(run, t, (k) => k, (k) => { b.style.translate = k < 1 ? Math.sin(k * M.shake_time() * M.shake_speed()) * size * (1 - k) + "px 0" : ""; });
  }
  async function editLabel(i) {
    if (!onLabelEdit || editing >= 0 || !boxes[i]) return;
    editing = i;
    const b = boxes[i], text = b.querySelector(".diagram__text"), was = nodes[i].label;
    const menu = b.querySelector(":scope > .menu");
    if (menu) { menu.hidden = true; text.setAttribute("aria-expanded", "false"); }
    const field = el("textarea", "input diagram__input");
    field.value = was; field.rows = 1; field.setAttribute("aria-label", "Rename " + was.replace(/\n/g, " ") + ". Shift+Enter starts a new line.");
    b.classList.add("is-editing"); b.style.width = "";
    await anim(text, gone, T.duration_enter_ms() * 0.6);
    text.hidden = true; text.before(field);
    field.focus(); field.select();
    anim(field, come, T.duration_enter_ms());
    let done = false;
    const finish = async (save) => {
      if (done) return;
      const name = field.value.split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
      if (save && !name) { shake(b); field.setAttribute("aria-invalid", "true"); announce("A node needs a name"); field.focus(); return; }
      done = true;
      if (save && name !== was) {
        // Keep the node's place and its arrows under the new name, so the redraw doesn't treat it as new.
        const mem = last.get(root);
        if (mem) {
          mem.places.set(name, mem.places.get(was));
          mem.arrows = new Set([...mem.arrows].map((k) => k.split("\u0001").map((l) => (l === was ? name : l)).join("\u0001")));
          mem.formed = name;
        }
        editing = -1;
        announce("Renamed " + was.replace(/\n/g, " ") + " to " + name.replace(/\n/g, " ")); refocus = name;
        onLabelEdit(i, name);
        return;
      }
      await anim(field, gone, T.duration_enter_ms() * 0.6);
      field.remove(); text.hidden = false; b.classList.remove("is-editing"); editing = -1;
      await anim(text, come, T.duration_enter_ms());
      text.getAnimations().forEach((a) => a.cancel());
      if (text.matches("button")) text.focus();
    };
    field.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); finish(true); }
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(false); }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") e.stopPropagation();   // the field's, not the menu's
    });
    field.addEventListener("blur", () => finish(true));
  }
  // Free layout by keyboard: Shift + an arrow moves the focused node one step (dragging has an alternative).
  if (free) boxes.forEach((b, i) => b.addEventListener("keydown", (e) => {
    const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!k || !e.shiftKey || e.target.closest(".diagram__input")) return;
    e.preventDefault(); e.stopPropagation();
    const step = T.space_2();
    b.style.left = Math.max(0, parseFloat(b.style.left) + k[0] * step) + "px"; b.style.top = Math.max(0, parseFloat(b.style.top) + k[1] * step) + "px";
    fit(); draw();
    onNodeMove?.(i, { x: parseFloat(b.style.left), y: parseFloat(b.style.top) });
  }));
  // The node acted on keeps the focus after the app draws again.
  if (refocus !== null) {
    const j = nodes.findIndex((x) => x.label === refocus);
    refocus = null;
    (boxes[j]?.querySelector(".diagram__open") ?? boxes[j])?.focus();
  }
  if (onLabelEdit) boxes.forEach((b, i) => {
    b.addEventListener("dblclick", (e) => { if (!e.target.closest(".diagram__handle, .menu, .diagram__input")) { e.preventDefault(); editLabel(i); } });
    b.addEventListener("keydown", (e) => { if (e.key === "F2" && !e.target.closest(".diagram__input")) { e.preventDefault(); editLabel(i); } });
  });
  // A node just renamed: its new name forms.
  if (before?.formed) {
    const i = nodes.findIndex((x) => x.label === before.formed);
    const text = boxes[i]?.querySelector(".diagram__text");
    if (text) anim(text, come, T.duration_enter_ms()).then(() => {
      text.getAnimations().forEach((a) => a.cancel());
      if (text.matches("button")) text.focus(); else boxes[i].focus();
    });
  }
  // A node leaving: it shrinks and fades with its arrows; then the app draws without it and the rest close up.
  async function leave(i) {
    const b = boxes[i]; if (!b) return;
    const mine = edges.map((e, k) => (e.from === i || e.to === i ? k : -1)).filter((k) => k >= 0);
    const out = [{ opacity: 1, transform: "none", filter: "blur(0)" }, { opacity: 0, transform: "scale(.6)", filter: `blur(${b0}px)` }];
    await Promise.all([anim(b, out, T.duration_enter_ms()), ...mine.map((k) => anim(wires[k], [{ opacity: 1 }, { opacity: 0 }], T.duration_enter_ms())), ...mine.map((k) => labels[k] && anim(labels[k], [{ opacity: 1 }, { opacity: 0 }], T.duration_enter_ms()))]);
    announce("Removed " + nodes[i].label);
  }

  return {
    nodes: boxes,
    editLabel, leave,
    focusAfterDraw(label) { refocus = label; },
    destroy() { run.stopped = true; watch.disconnect(); root.replaceChildren(); root.classList.remove("diagram", "diagram--free", "is-connecting"); root.style.minWidth = root.style.minHeight = ""; },
  };
}
