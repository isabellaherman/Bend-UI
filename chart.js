// Bend-UI charts: pie, bars, line and area. Where every mark goes is CHART.bend; how it moves
// is MOTION.bend and TOKENS.bend. This file only reads the size and the pointer, asks Bend, and draws.
//   import { mountPie, mountBars, mountLine, mountArea } from "bend-ui/chart";
//
//   const pie = mountPie(el, [{ label: "Fire", value: 46 }, …], { label: "Spells by school" });   // up to 4 slices
//   const bars = mountBars(el, [{ label: "Mon", value: 42 }, …]);   // the same for line and area
//   bars.replay()    // play the entrance again
//   bars.draw()      // redraw after a look changes
//   bars.destroy()
//
// Colors are tones of the accent (--chart-1 … --chart-4), so theme({ accent }) recolors every chart.
// Classes on el: .chart--donut (a hole in the pie), .chart--soft (lighter tones, each slice outlined in the accent),
// .chart--sm / .chart--lg (160 / 320; 240 without). A hairline of surface always parts the slices, so each one has
// 3:1 against the page. { label } names the chart for screen readers: mountPie(el, slices, { label: "…" }).
import C from "./CHART.bend";
import M from "./MOTION.bend";
import T from "./TOKENS.bend";

const NS = "http://www.w3.org/2000/svg";
const lessMotion = matchMedia("(prefers-reduced-motion: reduce)");
const list = (xs) => xs.reduceRight((tail, head) => ({ $: "Con", head, tail }), { $: "Nil" });
const array = (l) => { const out = []; while (l.$ === "Con") { out.push(Number(l.head)); l = l.tail; } return out; };
const make = (tag, cls, text) => { const x = document.createElement(tag); x.className = cls; if (text != null) x.textContent = text; return x; };
const svgEl = (tag, cls) => { const x = document.createElementNS(NS, tag); if (cls) x.setAttribute("class", cls); return x; };
const set = (el, attrs) => { for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };
let uid = 0;

// A value over time, eased by MOTION.bend, as thread.js does it. A newer run stops an older one.
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

// A value pulled to 1 by MOTION.bend's spring (the agent's): it lands with a small bounce.
function spring(run, step) {
  return new Promise((done) => {
    if (lessMotion.matches) { step(1); return done(); }
    let pos = 0, vel = 0, last = performance.now();
    const frame = (now) => {
      if (run.stopped) return done();
      const dt = Math.min((now - last) / 1000, M.max_step());
      last = now;
      vel = M.spring(vel, pos, 1, dt);
      pos += vel * dt;
      if (Math.abs(1 - pos) < 0.001 && Math.abs(vel) < 0.01) { step(1); return done(); }
      step(pos);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// The parts every chart has: a .chart root, a box that holds the plot and what floats over it.
// The plot's name for screen readers: the chart's own name ({ label }), then every value.
function frame(root, kind, values, title) {
  root.classList.add("chart", "chart--" + kind);
  root.replaceChildren();
  const box = make("div", "chart__box");
  const svg = set(svgEl("svg", "chart__plot"), { role: "img", "aria-label": title ? `${title}: ${values}` : values });
  box.append(svg);
  root.append(box);
  return { box, svg };
}

// Pointing at mark i (or -1 for none): it stays, the rest dim (ui.css: .is-pointing, .is-on).
function pointer(root, groups) {
  return (i) => {
    root.classList.toggle("is-pointing", i >= 0);
    groups.forEach((els) => els.forEach((el, j) => el.classList.toggle("is-on", i === j)));
  };
}

/* ---------------- Pie ---------------- */

export function mountPie(root, slices, { label: title } = {}) {
  if (slices.length > 4) console.warn("bend-ui: a pie has up to 4 slices; fold the rest into one.");
  const starts = array(C.starts(list(slices.map((s) => s.value))));
  const ends = [...starts.slice(1), 1];
  const share = (i) => Math.round((ends[i] - starts[i]) * 100);
  const { svg } = frame(root, "pie", slices.map((s, i) => `${s.label} ${share(i)}%`).join(", "), title);
  const legend = make("ul", "chart__legend");
  root.append(legend);

  const paths = slices.map((s, i) => {
    const p = set(svg.appendChild(svgEl("path", "chart__slice")), { "data-series": i + 1 });
    p.style.setProperty("--out-x", C.out_x(starts[i], ends[i]));
    p.style.setProperty("--out-y", C.out_y(starts[i], ends[i]));
    return p;
  });
  const keys = slices.map((s, i) => {
    const k = legend.appendChild(make("li", "chart__key"));
    k.dataset.series = i + 1;
    k.tabIndex = 0;
    k.append(make("span", "dot"), s.label, make("span", "chart__value", share(i) + "%"));
    return k;
  });
  const point = pointer(root, [paths, keys]);
  [paths, keys].forEach((els) => els.forEach((el, i) => {
    el.addEventListener("pointerenter", () => point(i));
    el.addEventListener("pointerleave", () => point(-1));
  }));
  keys.forEach((k, i) => { k.addEventListener("focus", () => point(i)); k.addEventListener("blur", () => point(-1)); });

  // A slice from turn t0 to t1: a wedge, or a band when the pie has a hole.
  function arc(t0, t1, r, h) {
    const big = C.long_way(t0, t1);
    const out = `M${C.point_x(t0, r)} ${C.point_y(t0, r)}A${r} ${r} 0 ${big} 1 ${C.point_x(t1, r)} ${C.point_y(t1, r)}`;
    if (!h) return out + "L0 0Z";
    return out + `L${C.point_x(t1, h)} ${C.point_y(t1, h)}A${h} ${h} 0 ${big} 0 ${C.point_x(t0, h)} ${C.point_y(t0, h)}Z`;
  }

  let grown = 1;
  function draw() {
    const size = svg.getBoundingClientRect().width;
    if (!size) return;                                   // hidden: drawn when it shows
    const lift = parseFloat(getComputedStyle(root).getPropertyValue("--chart-lift")) || 0;
    const r = size / 2 - lift;
    const h = root.classList.contains("chart--donut") ? r * T.chart_hole() / 100 : 0;
    set(svg, { viewBox: `${-size / 2} ${-size / 2} ${size} ${size}` });
    paths.forEach((path, i) => path.setAttribute("d", arc(C.shown(starts[i], grown), C.shown(ends[i], grown), r, h)));
  }

  // Entrance: the pie sweeps round once, over duration_connect, eased out.
  let run = {};
  function replay() {
    run.stopped = true; const me = run = {};
    return tween(me, T.duration_connect_ms(), M.ease_out, (p) => { grown = p; draw(); });
  }
  return mount(root, svg, draw, replay, { slices: paths });
}

/* ---------------- Bars, line, area ---------------- */

export const mountBars = (root, points, opts) => plot(root, points, "bars", opts);
export const mountLine = (root, points, opts) => plot(root, points, "line", opts);
export const mountArea = (root, points, opts) => plot(root, points, "area", opts);

function plot(root, points, kind, { label: title } = {}) {
  const n = points.length, values = list(points.map((p) => p.value));
  const top = C.top(C.most(values)), step = C.step(C.most(values));
  const { box, svg } = frame(root, kind, points.map((p) => `${p.label} ${p.value}`).join(", "), title);
  const grid = svg.appendChild(svgEl("g", "chart__grid"));
  const tip = box.appendChild(make("span", "tag tag--mono chart__tip"));

  // The marks. Bars: one path each. Line and area: a curve, its glint, the glow at its tip,
  // a guide under the pointer, and the thread's node at the point.
  const fillId = "chart-fill-" + ++uid;
  const bars = kind === "bars" ? points.map(() => svg.appendChild(svgEl("path", "chart__bar"))) : [];
  let area, line, glint, glow, guide, node;
  if (kind !== "bars") {
    if (kind === "area") {
      svg.insertAdjacentHTML("beforeend", `<defs><linearGradient id="${fillId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="chart__fill-top"/><stop offset="1" class="chart__fill-end"/></linearGradient></defs>`);
      area = set(svg.appendChild(svgEl("path", "chart__area")), { fill: `url(#${fillId})` });
    }
    guide = svg.appendChild(svgEl("line", "chart__guide"));
    // Measured as 1 long, so a dash of 1 is the whole line; the glint is 0.35 of it, as the thread's.
    line = set(svg.appendChild(svgEl("path", "chart__line")), { pathLength: 1, "stroke-dasharray": "1 1" });
    glint = set(svg.appendChild(svgEl("path", "chart__glint")), { pathLength: 1, "stroke-dasharray": "0.35 2" });
    glow = svg.appendChild(svgEl("circle", "chart__glow"));
    node = box.appendChild(make("span", "node chart__node"));
    node.append(make("span", "node__core"));
  }

  // Where things are, from the size of the plot and CHART.bend.
  let g = null;
  function measure() {
    const r = svg.getBoundingClientRect();
    const left = T.chart_axis_x(), w = r.width - left, h = r.height - T.chart_axis_y();
    const x = (i) => left + C.slot_x(i, n, w);
    const y = (v) => C.value_y(v, top, h);
    return { width: r.width, height: r.height, left, w, h, x, y };
  }

  function drawGrid() {
    grid.replaceChildren();
    for (let v = 0; v <= top; v += step) {
      const y = g.y(v);
      set(grid.appendChild(svgEl("line", v ? "chart__rule" : "chart__base")), { x1: g.left, x2: g.width, y1: y, y2: y });
      set(grid.appendChild(svgEl("text", "chart__tick")), { x: 0, y, dy: "0.35em" }).textContent = v;
    }
    points.forEach((p, i) => set(grid.appendChild(svgEl("text", "chart__tick chart__tick--x")), { x: g.x(i), y: g.height, dy: "-0.2em" }).textContent = p.label);
  }

  // The curve through the points: a cubic between each pair, its handles along the lean
  // CHART.bend gives each point (lean, lean_end, handle_x, handle_y).
  function curve(pts) {
    if (pts.length < 2) return pts.length ? `M${pts[0][0]} ${pts[0][1]}` : "";
    const dx = pts[1][0] - pts[0][0], ys = pts.map((p) => p[1]), last = ys.length - 1;
    const m = ys.map((y, i) => i === 0 ? C.lean_end(y, ys[1], dx) : i === last ? C.lean_end(ys[i - 1], y, dx) : C.lean(ys[i - 1], y, ys[i + 1], dx));
    return pts.map(([x, y], i) => {
      if (!i) return `M${x} ${y}`;
      const [x0, y0] = pts[i - 1];
      return `C${C.handle_x(x0, dx)} ${C.handle_y(y0, m[i - 1], dx)} ${C.handle_x(x, -dx)} ${C.handle_y(y, m[i], -dx)} ${x} ${y}`;
    }).join("");
  }

  // The state the entrance moves: how far each bar has grown, how far the line has run,
  // how far the area has risen, where the glint is.
  const grow = points.map(() => 1);
  let reach = 1, rise = 1, glintAt = -1, running = false;

  function draw() {
    const next = measure();
    if (!next.width) return;                             // hidden: drawn when it shows
    g = next;
    set(svg, { viewBox: `0 0 ${g.width} ${g.height}` });
    drawGrid();
    if (kind === "bars") {
      const bw = C.bar_width(n, g.w, T.chart_bar_max(), T.chart_bar_gap()), r = Math.min(T.radius_sm(), bw / 2);
      bars.forEach((bar, i) => {
        const x = g.x(i) - bw / 2, y = g.y(C.grown(points[i].value, grow[i])), b = g.h;
        const rr = Math.min(r, b - y);
        bar.setAttribute("d", `M${x} ${b}V${y + rr}Q${x} ${y} ${x + rr} ${y}H${x + bw - rr}Q${x + bw} ${y} ${x + bw} ${y + rr}V${b}Z`);
      });
      return;
    }
    const pts = points.map((p, i) => [g.x(i), g.y(C.grown(p.value, rise))]);
    const d = curve(pts);
    line.setAttribute("d", d);
    glint.setAttribute("d", d);
    if (area) area.setAttribute("d", `${d}L${pts.at(-1)[0]} ${g.h}L${pts[0][0]} ${g.h}Z`);
    line.style.strokeDashoffset = 1 - reach;
    glint.style.strokeDashoffset = 0.35 - glintAt;
    glint.style.opacity = glintAt < 0 ? 0 : 1;
    const len = line.getTotalLength(), at = line.getPointAtLength(len * reach);
    set(glow, { cx: at.x, cy: at.y, r: T.node_size() * 0.75 });
    svg.classList.toggle("is-running", running);
    if (!root.classList.contains("is-pointing")) place(node, pts.at(-1));
  }
  const place = (el, [x, y]) => { el.style.left = x + "px"; el.style.top = y + "px"; };

  // Pointing: the slot under the pointer (CHART.bend: slot_at). Bars: the bar stays, the rest dim.
  // Line and area: the node steps to the point, with a guide down to the base. Both show the value.
  const point = pointer(root, [bars]);
  function pointAt(i) {
    point(i);
    if (i < 0) { tip.classList.remove("is-on"); if (node) draw(); return; }
    const v = points[i].value, x = g.x(i), y = g.y(v);
    tip.textContent = `${points[i].label} · ${v}`;
    place(tip, [x, y]);
    tip.classList.add("is-on");
    if (node) {
      place(node, [x, y]);
      node.classList.remove("is-pop"); void node.offsetWidth; node.classList.add("is-pop");
      set(guide, { x1: x, x2: x, y1: y, y2: g.h });
    }
  }
  let current = -1;
  svg.addEventListener("pointermove", (e) => {
    if (!g) return;
    const r = svg.getBoundingClientRect();
    const i = Number(C.slot_at(e.clientX - r.left - g.left, n, g.w));
    if (i !== current) pointAt(current = i);
  });
  svg.addEventListener("pointerleave", () => pointAt(current = -1));

  // The entrance. Bars: one after another (stagger_ms), each pulled up by the spring.
  // Line: runs in like the thread, its glow at the tip; the node pops in; one glint.
  // Area: rises from the base (duration_connect, eased out); the node pops in.
  let run = {};
  async function replay() {
    run.stopped = true; const me = run = {};
    if (node) node.removeAttribute("data-state");
    if (kind === "bars") {
      grow.fill(0); draw();
      await Promise.all(points.map((_, i) => wait(i * T.stagger_ms()).then(() => spring(me, (p) => { grow[i] = p; draw(); }))));
      return;
    }
    reach = kind === "line" ? 0 : 1; rise = kind === "area" ? 0 : 1; glintAt = -1; draw();
    if (kind === "line") {
      running = true;
      await tween(me, T.duration_connect_ms(), M.ease_in_out, (p) => { reach = p; draw(); });
      running = false; draw();
    } else {
      await tween(me, T.duration_connect_ms(), M.ease_out, (p) => { rise = p; draw(); });
    }
    if (me.stopped) return;
    node.dataset.state = "now";
    if (kind === "line") {
      await tween(me, T.duration_glint_ms(), M.ease_in_out, (p) => { glintAt = p; draw(); });
      glintAt = -1; draw();
    }
  }
  return mount(root, svg, draw, replay, { marks: kind === "bars" ? bars : [line] });
}

// Shared: redraw when the size changes, play the entrance once, and hand back the controls.
function mount(root, svg, draw, replay, extra) {
  const watch = new ResizeObserver(() => draw());
  watch.observe(svg);
  draw();
  replay();
  return {
    ...extra,
    replay,
    draw,
    destroy() { watch.disconnect(); root.replaceChildren(); root.className = root.className.replace(/\bchart\S*|\bis-pointing\b/g, "").trim(); },
  };
}
