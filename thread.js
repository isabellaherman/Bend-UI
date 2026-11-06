// Bend-UI thread: a line that ties each block of a .pair to its aside while work runs.
//   import { createThread, openBlock, formBlock } from "bend-ui/thread";
//
// The line runs through the slot column of the .doc (where every block keeps its dot). Each
// block of a working pair gets a node: the dot, grown to node_size, that fills like a clock
// while the work creeps on. The motion is MOTION.bend and TOKENS.bend; this file only reads
// the layout and the clock, asks Bend where things go, and draws.
//
//   const thread = createThread(doc);
//   await thread.begin(pairs);   // the queue cascades in, node by node
//   await thread.start(i);       // pair i is working: the line runs into its aside and creeps on
//   await thread.done(i, ok);    // pair i is done (ok or not): the node fills, the line settles
//   await thread.end();          // one glint along every line
//   await thread.release();      // fade out and give the blocks their dots back
//
// Blocks that go with it:
//   await openBlock(aside, html);           // a block opens from nothing
//   await formBlock(aside, html, "block--code");  // its text dissolves and forms again, line by line

import M from "./MOTION.bend";
import T from "./TOKENS.bend";

const NS = "http://www.w3.org/2000/svg";
const lessMotion = matchMedia("(prefers-reduced-motion: reduce)");
const svgEl = (tag, cls) => { const e = document.createElementNS(NS, tag); e.setAttribute("class", cls); return e; };
const pathTo = (pts) => pts.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");
const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const px = (name) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

export function createThread(doc) {
  const svg = svgEl("svg", "thread");
  const line = svgEl("path", "thread__line"), glint = svgEl("path", "thread__glint"), glow = svgEl("circle", "thread__glow");
  svg.append(line, glint, glow);
  const layer = document.createElement("div");
  layer.className = "thread__nodes";

  let gen = 0, pairs = [], nodes = [], reach = [], fill = [], active = -1, glintP = null, mounted = false;

  // Where the slots are, read from the layout every frame (blocks grow, the page scrolls).
  function geometry() {
    const d = doc.getBoundingClientRect();
    const at = (block) => {
      if (!block || !block.isConnected) return null;
      const r = block.getBoundingClientRect(), slot = block.querySelector(".block__slot");
      if (!r.height || !slot) return null;
      const s = slot.getBoundingClientRect();
      return { x: s.left + s.width / 2 - d.left, y: s.top + s.height / 2 - d.top, bottom: r.bottom - d.top };
    };
    return pairs.map((p) => {
      const s = at(p.firstElementChild);
      if (!s) return null;                                   // gone, or not shown
      const l = at(p.querySelector(".pair__aside")) || s;    // an aside not open yet sits on its block
      return { s, l, end: { x: l.x, y: Math.max(l.y, l.bottom - px("--node-size") / 2) } };
    });
  }

  function render() {
    requestAnimationFrame(render);
    if (!pairs.length) return;
    const g = geometry();
    const parts = [], glints = [];
    let tip = null;
    g.forEach((x, k) => {
      const [ns, nl] = [nodes[2 * k], nodes[2 * k + 1]];
      ns.el.hidden = nl.el.hidden = !x;
      if (!x) return;
      ns.el.style.left = x.s.x + "px"; ns.el.style.top = x.s.y + "px";
      nl.el.style.left = x.l.x + "px"; nl.el.style.top = x.l.y + "px";
      nl.el.style.setProperty("--p", fill[k]);
      const r = Math.min(2, Math.max(0, reach[k]));
      if (!r) return;
      const pts = [x.s, x.l, x.end], i = Math.floor(r);
      const t = lerp(pts[i], pts[Math.min(i + 1, 2)], r - i);
      parts.push(pathTo([...pts.slice(0, i + 1), t]));
      if (k === active) tip = t;
      if (glintP !== null) glints.push(pathTo([lerp(x.s, x.l, Math.max(0, glintP - 0.35)), lerp(x.s, x.l, glintP)]));
    });
    line.setAttribute("d", parts.join(" "));
    glint.setAttribute("d", glints.join(" "));
    if (tip) { glow.setAttribute("cx", tip.x); glow.setAttribute("cy", tip.y); glow.setAttribute("r", px("--node-size") * 0.75); }
  }

  function setState(n, state, pop = false) {
    n.el.dataset.state = state;
    if (pop) { n.el.classList.remove("is-pop"); void n.el.offsetWidth; n.el.classList.add("is-pop"); }
  }

  // A value over time, eased by MOTION.bend. A newer run (gen) stops older motion.
  function tween(from, to, ms, ease, set) {
    const g = gen;
    return new Promise((done) => {
      if (lessMotion.matches || ms <= 0) { set(to); return done(); }
      const t0 = performance.now();
      const step = (now) => {
        if (g !== gen) return done();
        const k = Math.min(1, (now - t0) / ms);
        set(from + (to - from) * ease(k));
        if (k < 1) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
  }

  let stopCreep = () => 1;
  const sleep = (ms) => new Promise((r) => setTimeout(r, lessMotion.matches ? 0 : ms));

  const api = {
    reset() {
      gen++;
      pairs = []; nodes = []; reach = []; fill = []; active = -1; glintP = null;
      layer.replaceChildren();
      line.setAttribute("d", ""); glint.setAttribute("d", "");
      svg.classList.remove("is-running", "is-settled", "is-leaving");
      layer.classList.remove("is-leaving");
      doc.classList.remove("is-threaded");
    },
    async begin(list) {
      api.reset();
      if (!mounted) { doc.prepend(layer); doc.prepend(svg); requestAnimationFrame(render); mounted = true; }
      pairs = list; reach = list.map(() => 0); fill = list.map(() => 0);
      nodes = list.flatMap(() => [0, 1].map(() => {
        const el = document.createElement("span");
        el.className = "node";
        el.innerHTML = '<i class="node__core"></i>';
        layer.append(el);
        return { el };
      }));
      doc.classList.add("is-threaded");
      svg.classList.add("is-running");
      // The cascade: the queue appears node by node.
      const g = gen;
      list.forEach((_, k) => setTimeout(() => { if (g === gen) setState(nodes[2 * k], "queued"); }, k * T.stagger_ms()));
      await sleep(list.length * T.stagger_ms() + T.duration_enter_ms());
    },
    async start(i) {
      active = i;
      setState(nodes[2 * i], "now", true);
      setState(nodes[2 * i + 1], "writing");
      await tween(0, 1, T.duration_enter_ms(), M.ease_out, (v) => { reach[i] = v; });
      // While the work runs, the line creeps down the aside and the node fills, ever slower.
      let on = true; const t0 = performance.now(), g = gen;
      const step = (now) => {
        if (!on || g !== gen) return;
        const c = M.creep(now - t0, T.creep_ms());
        reach[i] = M.thread_reach(c); fill[i] = M.node_fill(c);
        requestAnimationFrame(step);
      };
      if (!lessMotion.matches) requestAnimationFrame(step);
      stopCreep = () => { on = false; return reach[i]; };
    },
    async done(i, ok) {
      const from = stopCreep();
      fill[i] = 1;
      setState(nodes[2 * i + 1], ok ? "ok" : "error", true);
      setState(nodes[2 * i], ok ? "ok" : "error", true);
      // The tail goes back into the aside's node: the pair stays tied.
      await tween(from, 1, T.duration_connect_ms(), M.ease_in_out, (v) => { reach[i] = v; });
    },
    async end() {
      active = -1;
      svg.classList.remove("is-running");
      svg.classList.add("is-settled");
      await tween(0, 1, T.duration_glint_ms(), M.ease_in_out, (v) => { glintP = v; });
      glintP = null;
    },
    async release() {
      svg.classList.add("is-leaving"); layer.classList.add("is-leaving");
      doc.classList.remove("is-threaded");
      await sleep(T.duration_enter_ms());
      api.reset();
    },
  };
  return api;
}

// ---------- Blocks that go with a thread ----------
const anim = (node, frames, o) => (lessMotion.matches ? Promise.resolve() : node.animate(frames, { easing: T.ease(), ...o }).finished);

// A block opens from nothing: its height grows from 0.
export async function openBlock(block, html) {
  block.innerHTML = html;
  const h = block.offsetHeight;
  block.style.overflow = "hidden";
  await anim(block, [{ height: "0px", minHeight: "0px", opacity: 0 }, { height: h + "px", minHeight: "0px", opacity: 1 }], { duration: T.duration_enter_ms() });
  block.style.overflow = "";
}

// A block's text dissolves and forms again, line by line (.block__line), from a blur.
export async function formBlock(block, html, cls) {
  const blur = (n) => `blur(${n}px)`, b = T.blur_form();
  const ghost = block.querySelector(".block__text");
  if (ghost) await anim(ghost, [{ opacity: 1, filter: blur(0) }, { opacity: 0, filter: blur(b), transform: `translateY(-${b}px)` }], { duration: T.duration_enter_ms() * 0.6, fill: "forwards" });
  const h0 = block.offsetHeight;
  block.classList.remove("block--code");
  if (cls) block.classList.add(cls);
  block.innerHTML = html;
  const h1 = block.offsetHeight;
  block.style.overflow = "hidden";
  const grow = anim(block, [{ height: h0 + "px", minHeight: "0px" }, { height: h1 + "px", minHeight: "0px" }], { duration: T.duration_connect_ms() });
  const lines = block.querySelectorAll(".block__line");
  (lines.length ? lines : block.querySelectorAll(".block__text")).forEach((l, i) =>
    anim(l, [{ opacity: 0, filter: blur(b), transform: `translateY(${b}px)` }, { opacity: 1, filter: blur(0), transform: "none" }],
      { duration: T.duration_enter_ms(), delay: i * T.stagger_ms(), fill: "backwards" }));
  await grow;
  block.style.overflow = "";
}
