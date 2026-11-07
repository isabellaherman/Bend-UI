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
//   d.destroy()
//
// tone is "" (neutral), "accent", "law", "draft" or "conflict". The node shows it as a colored border;
// put .diagram--soft on el for the other look: a soft fill with the tone in the text.
// tag is a short word on the box. An arrow's label sits on its line.
import D from "./DIAGRAM.bend";

const NS = "http://www.w3.org/2000/svg";
const list = (xs) => xs.reduceRight((tail, head) => ({ $: "Con", head, tail }), { $: "Nil" });
const array = (l) => { const out = []; while (l.$ === "Con") { out.push(Number(l.head)); l = l.tail; } return out; };
const el = (tag, cls, text) => { const x = document.createElement(tag); x.className = cls; if (text) x.textContent = text; return x; };
let uid = 0;

export function mountDiagram(root, { nodes, edges: given }) {
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
    const b = el("div", "diagram__node" + (node.tone ? " diagram__node--" + node.tone : ""));
    b.append(el("span", "diagram__text", node.label));
    if (node.tag) b.append(el("span", "tag tag--mono", node.tag));
    rowEls[row[i]].append(b);
    return b;
  });
  const wires = edges.map(() => svg.appendChild(document.createElementNS(NS, "path")));
  wires.forEach((w) => w.setAttribute("marker-end", `url(#${arrow})`));
  const labels = edges.map((e) => (e.label ? root.appendChild(el("span", "diagram__label", e.label)) : null));

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
  }
  const watch = new ResizeObserver(draw);
  watch.observe(root);
  draw();

  return {
    nodes: boxes,
    destroy() { watch.disconnect(); root.replaceChildren(); root.classList.remove("diagram"); },
  };
}
