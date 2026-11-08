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
// Node menu (optional): { nodeMenu: (i) => [{ label, disabled, onSelect }] }. The node's label opens a .menu
// with those items; picking one calls its onSelect. The diagram doesn't change itself here either.
//
// Connect (optional): mountDiagram(el, data, { isValidConnection, onConnect }). Drag the dot under a node
// onto another node; both get { source, target }. The diagram doesn't change itself: draw it again in the same
// element with the new edge, and the nodes glide to their new places while the new arrow runs in.
//   d.destroy()
//
// tone is "" (neutral), "accent", "law", "draft" or "conflict". The node shows it as a colored border;
// put .diagram--soft on el for the other look: a soft fill with the tone in the text.
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

export function mountDiagram(root, { nodes, edges: given }, { isValidConnection, onConnect, nodeMenu } = {}) {
  const n = nodes.length;
  // Arrows with the same ends are one line: their words join ("Add · Always add").
  const edges = [];
  for (const e of given) {
    const same = edges.find((x) => x.from === e.from && x.to === e.to);
    if (!same) edges.push({ ...e });
    else if (e.label) same.label = same.label ? same.label + " · " + e.label : e.label;
  }
  const rows = D.rows(n, list(edges.map((e) => ({ $: "Edge", from: e.from, to: e.to }))));
  const row = array(rows), depth = Number(D.depth(rows));

  root.classList.add("diagram");
  root.replaceChildren();
  const svg = document.createElementNS(NS, "svg");
  svg.classList.add("diagram__wires");
  svg.setAttribute("aria-hidden", "true");
  const arrow = "diagram-arrow-" + ++uid;
  // The arrowhead is --space-2 wide (TOKENS.bend: space_2); its shape is drawn in a 0..1 box.
  const head = parseFloat(getComputedStyle(root).getPropertyValue("--space-2")) || 0;
  svg.innerHTML = `<defs><marker id="${arrow}" viewBox="0 0 1 1" refX="1" refY="0.5" markerWidth="${head}" markerHeight="${head}" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L1,0.5 L0,1 Z"/></marker></defs>`;
  root.append(svg);

  // Rows top to bottom; on a row, nodes keep their order (DIAGRAM.bend: columns).
  const rowEls = Array.from({ length: depth }, () => root.appendChild(el("div", "diagram__row")));
  const boxes = nodes.map((node, i) => {
    const items = nodeMenu?.(i) ?? [];
    const b = el("div", "diagram__node" + (node.tone ? " diagram__node--" + node.tone : "") + (items.length ? " dropdown" : ""));
    if (!items.length) b.append(el("span", "diagram__text", node.label));
    else {
      // With a menu, the node is a .dropdown: its label opens a .menu (ui.js opens, closes and fires "pick").
      const open = b.appendChild(el("button", "diagram__text diagram__open", node.label));
      open.type = "button"; open.setAttribute("aria-haspopup", "menu"); open.setAttribute("aria-expanded", "false");
      const menu = b.appendChild(el("div", "menu"));
      menu.setAttribute("role", "menu"); menu.hidden = true;
      const picks = new Map();
      for (const item of items) {
        const m = menu.appendChild(el("button", "menu__item"));
        m.type = "button"; m.setAttribute("role", "menuitem"); m.disabled = !!item.disabled;
        m.append(el("span", "", item.label));
        picks.set(m, item.onSelect);
      }
      b.addEventListener("pick", (e) => picks.get(e.detail)?.());
    }
    if (node.tag) b.append(el("span", "tag tag--mono", node.tag));
    rowEls[row[i]].append(b);
    return b;
  });
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
    if (e.type === "pointerup" && target >= 0) { path.remove(); onConnect?.({ source, target }); return; }
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

  // An arrow leaves the bottom of its start and enters the top of its end, in a soft S.
  function draw() {
    const box = root.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    edges.forEach((e, i) => {
      const a = boxes[e.from]?.getBoundingClientRect(), b = boxes[e.to]?.getBoundingClientRect();
      if (!a || !b) return;
      const x1 = a.left + a.width / 2 - box.left, y1 = a.bottom - box.top;
      const x2 = b.left + b.width / 2 - box.left, y2 = b.top - box.top;
      const bend = (y2 - y1) / 2;
      wires[i].setAttribute("d", `M${x1},${y1} C${x1},${y1 + bend} ${x2},${y2 - bend} ${x2},${y2}`);
      if (labels[i]) { labels[i].style.left = (x1 + x2) / 2 + "px"; labels[i].style.top = (y1 + y2) / 2 + "px"; }
    });
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
  const key = (e) => nodes[e.from].label + "\n" + nodes[e.to].label;
  const before = last.get(root);
  let moving = false;
  const watch = new ResizeObserver(draw);
  watch.observe(root);
  draw();
  if (before) {
    const box = root.getBoundingClientRect();
    const shift = boxes.map((b, i) => {
      const was = before.places.get(nodes[i].label), r = b.getBoundingClientRect();
      return was ? { x: was.x - (r.left - box.left), y: was.y - (r.top - box.top) } : { x: 0, y: 0 };
    });
    const fresh = edges.map((e, i) => (before.places.has(nodes[e.from].label) && !before.arrows.has(key(e)) ? wires[i] : null)).filter(Boolean);
    if (fresh.length || shift.some((d) => d.x || d.y)) {
      moving = true;
      fresh.forEach((w) => { w.removeAttribute("marker-end"); labels[wires.indexOf(w)]?.setAttribute("hidden", ""); });
      tween(run, T.duration_connect_ms(), M.ease_in_out, (k) => {
        boxes.forEach((b, i) => { b.style.transform = k < 1 && (shift[i].x || shift[i].y) ? `translate(${shift[i].x * (1 - k)}px, ${shift[i].y * (1 - k)}px)` : ""; });
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

  return {
    nodes: boxes,
    destroy() { run.stopped = true; watch.disconnect(); root.replaceChildren(); root.classList.remove("diagram", "is-connecting"); },
  };
}
