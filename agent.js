// Bend-UI agent: a face that opens into round options. Opt-in:
//   import { mountAgent, flyBetween } from "bend-ui/agent";
//
// The motion is MOTION.bend (sphere, spring, easing, layouts). This file only
// reads the pointer and the clock, asks MOTION.bend where things go, and draws.
//
//   const agent = mountAgent(el, {
//     size: "lg",                      // "lg" (fan) or "sm" (row, for a toolbar)
//     items: [
//       { id: "min", icon: "minimize-2", label: "Minimize" },
//       { id: "claude", mark: "Cl", label: "Claude", ring: true },
//     ],
//     onPick: (id) => {},
//   });
//   agent.setItem("claude", { status: "busy", label: "Connecting…" });
//   agent.spin(); agent.shake(); agent.lookAtEl(someLine); agent.ask(true);

import M from "./MOTION.bend";

const RING = '<svg class="status-ring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" pathLength="100"/></svg>';
const lessMotion = matchMedia("(prefers-reduced-motion: reduce)");
const agents = new Set();
let pointer = null;
addEventListener("pointermove", (e) => { pointer = { x: e.clientX, y: e.clientY }; }, { passive: true });

export function mountAgent(root, opts = {}) {
  const size = opts.size || "lg";
  const layout = opts.layout || (size === "lg" ? "fan" : "row");
  const btn = size === "lg" ? "btn btn--icon btn--lg btn--round" : "btn btn--icon btn--sm btn--round";
  const iconCls = size === "lg" ? "icon icon--lg" : "icon";

  root.classList.add("agent", "agent--" + size);
  root.innerHTML =
    `<button class="agent__face" aria-label="${opts.label || "Agent"}" aria-expanded="false"><i class="agent__eye"></i><i class="agent__eye"></i></button>` +
    (opts.items || []).map((it) =>
      `<button class="${btn} agent__item" data-id="${it.id}" aria-label="${it.label}" tabindex="-1">` +
        (it.ring ? RING : "") +
        (it.icon ? `<svg class="${iconCls}"><use href="#i-${it.icon}"/></svg>` : `<span class="agent__mark">${it.mark || ""}</span>`) +
        `<span class="agent__label meta">${it.label}</span>` +
      `</button>`).join("");

  const face = root.querySelector(".agent__face");
  const eyes = [...root.querySelectorAll(".agent__eye")];
  const items = [...root.querySelectorAll(".agent__item")];
  items.forEach((b) => { b._p = 0; b._t = 0; });

  const s = {
    el: root, face, size, isOpen: false, hover: false, target: null,
    yaw: 0, pitch: 0, vy: 0, vp: 0, ty: 0, tp: 0, turns: 0, shakeT: 0, blink: 1,
  };

  s.open = () => setOpen(true);
  s.close = () => setOpen(false);
  s.toggle = () => setOpen(!s.isOpen);
  function setOpen(v) {
    s.isOpen = v;
    root.classList.toggle("is-open", v);
    face.setAttribute("aria-expanded", v);
    items.forEach((b) => b.tabIndex = v ? 0 : -1);
    if (!v) root.classList.remove("is-asking");
  }

  // Look: at a point on screen, at an element, or straight ahead (null).
  s.lookAt = (x, y, amount = 1) => {
    const r = face.getBoundingClientRect();
    const reach = Math.max(r.width * 2.2, 140);
    const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    s.ty = M.look_yaw(dx, dy, reach) * amount;
    s.tp = M.look_pitch(dx, dy, reach) * amount;
  };
  s.lookAtEl = (el) => { s.target = el; };
  s.spin = () => { s.turns += 2 * Math.PI; };      // one full turn: "done"
  s.shake = () => { s.shakeT = 0.6; };              // a small "no"
  s.ask = (on) => { root.classList.toggle("is-asking", on); if (on) setOpen(true); };

  // An item: status (busy | ok | hold | warn | error | ""), label, pressed, disabled.
  s.setItem = (id, st = {}) => {
    const b = root.querySelector(`.agent__item[data-id="${id}"]`); if (!b) return;
    if ("status" in st) { if (st.status) b.dataset.status = st.status; else delete b.dataset.status; }
    if ("label" in st) { b.querySelector(".agent__label").textContent = st.label; b.setAttribute("aria-label", st.label); }
    if ("pressed" in st) b.setAttribute("aria-pressed", !!st.pressed);
    if ("disabled" in st) b.disabled = !!st.disabled;
  };
  // Show one item's label for a moment (where there is room for only one).
  s.flash = (id) => {
    items.forEach((b) => b.classList.toggle("is-flash", b.dataset.id === id));
    clearTimeout(s._flash); s._flash = setTimeout(() => items.forEach((b) => b.classList.remove("is-flash")), 2600);
  };

  face.addEventListener("click", () => s.toggle());
  root.addEventListener("pointerenter", () => { s.hover = true; });
  root.addEventListener("pointerleave", () => { s.hover = false; });
  items.forEach((b) => b.addEventListener("click", () => opts.onPick && opts.onPick(b.dataset.id)));
  const outside = (e) => { if (s.isOpen && !root.contains(e.target)) setOpen(false); };
  const escape = (e) => { if (e.key === "Escape" && s.isOpen) { setOpen(false); face.focus(); } };
  document.addEventListener("pointerdown", outside);
  document.addEventListener("keydown", escape);
  const blink = setInterval(() => { if (Math.random() < 0.6) { s.blink = 0.12; setTimeout(() => s.blink = 1, 120); } }, 2700 + Math.random() * 800);

  s.update = (dt) => {
    if (!root.offsetParent) return;   // hidden: nothing to draw
    // where to look: the pointer while hovered or open, else the target, else ahead
    if ((s.hover || s.isOpen) && pointer) s.lookAt(pointer.x, pointer.y);
    else if (s.target && s.target.isConnected) { const r = s.target.getBoundingClientRect(); s.lookAt(r.left + r.width * 0.3, r.top + r.height / 2, 0.6); }
    else { s.ty = 0; s.tp = 0; }

    let wobble = 0;
    if (s.shakeT > 0) { s.shakeT = Math.max(0, s.shakeT - dt); wobble = Math.sin(s.shakeT * 38) * 0.32 * (s.shakeT / 0.6); }
    if (lessMotion.matches) { s.yaw = s.ty; s.pitch = s.tp; s.vy = s.vp = 0; s.turns = 0; }
    else {
      s.vy = M.spring(s.vy, s.yaw, s.ty + s.turns + wobble, dt);
      s.vp = M.spring(s.vp, s.pitch, s.tp, dt);
      s.yaw += s.vy * dt; s.pitch += s.vp * dt;
    }

    const R = face.offsetWidth / 2;
    const lon = M.eye_lon(), lat = M.eye_lat();
    [-lon, lon].forEach((l, i) => {
      const x = M.face_x(l, lat, s.yaw), y = M.face_y(l, lat, s.yaw, s.pitch), z = M.face_z(l, lat, s.yaw, s.pitch);
      const e = eyes[i].style;
      e.left = (R + x * R) + "px";
      e.top = (R - y * R) + "px";
      e.transform = `translate(-50%, -50%) scale(${M.squash(x).toFixed(3)}, ${(M.squash(y) * s.blink).toFixed(3)})`;
      e.opacity = Math.max(0, Math.min(1, z * 6)).toFixed(3);
    });

    const w = items.length ? items[0].offsetWidth : 0, gap = size === "lg" ? R * 0.35 : 8;
    items.forEach((b, i) => {
      b._t = s.isOpen ? b._t + dt : 0;
      const goal = s.isOpen ? 1 : 0;
      if (!s.isOpen || b._t > i * 0.06) b._p += Math.sign(goal - b._p) * Math.min(Math.abs(goal - b._p), lessMotion.matches ? 1 : dt / 0.28);
      const t = M.ease_out(b._p);
      const x = layout === "fan" ? M.fan_x(i, R, t) : M.row_x(i, R, w, gap, t);
      const y = layout === "fan" ? M.fan_y(i, R, t) : 0;
      b.style.transform = `translate(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px)) scale(${(0.5 + 0.5 * t).toFixed(3)})`;
      b.style.opacity = t.toFixed(3);
    });
  };

  s.destroy = () => {
    agents.delete(s); clearInterval(blink);
    document.removeEventListener("pointerdown", outside);
    document.removeEventListener("keydown", escape);
    root.innerHTML = "";
  };

  setOpen(false);
  agents.add(s);
  return s;
}

// Move the face from one agent to another (e.g. minimize to the toolbar). Call after
// the page has shown `to` and hidden `from`; pass the rect `from` had while visible.
export function flyBetween(fromRect, to, done) {
  to.yaw = 0; to.vy = 0;
  if (lessMotion.matches) { done && done(); return; }
  const b = to.face.getBoundingClientRect();
  const ghost = to.face.cloneNode(true);
  Object.assign(ghost.style, { position: "fixed", left: fromRect.left + "px", top: fromRect.top + "px", width: fromRect.width + "px", height: fromRect.height + "px", zIndex: 50, margin: 0, pointerEvents: "none" });
  ghost.querySelectorAll(".agent__eye").forEach((e) => e.style.transform = "translate(-50%, -50%)");
  document.body.append(ghost);
  to.face.style.opacity = 0;
  const dx = (b.left + b.width / 2) - (fromRect.left + fromRect.width / 2), dy = (b.top + b.height / 2) - (fromRect.top + fromRect.height / 2);
  ghost.animate(
    [{ transform: "translate(0, 0) scale(1)" }, { transform: `translate(${dx}px, ${dy}px) scale(${b.width / fromRect.width})` }],
    { duration: 460, easing: getComputedStyle(document.documentElement).getPropertyValue("--ease").trim() || "ease-out" },
  ).onfinish = () => { ghost.remove(); to.face.style.opacity = ""; done && done(); };
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  agents.forEach((a) => a.update(dt));
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
