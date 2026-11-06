// Bend-UI follow: smart auto-scroll for a scrolling area (like .page).
//   import { createFollow } from "bend-ui/follow";
//
//   const follow = createFollow(page, { button });   // button: shown while following is paused
//   follow.to(el);    // keep el in view, smoothly; call it as the work moves on
//   follow.stop();    // the work is over
//
// Smart: when the person scrolls by hand (wheel, touch, keys), following pauses so the page
// never fights them; the button brings it back. The band where the item may sit is MOTION.bend.

import M from "./MOTION.bend";

const lessMotion = matchMedia("(prefers-reduced-motion: reduce)");
const KEYS = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];

export function createFollow(scroller, { button } = {}) {
  let target = null, paused = false;

  const show = () => { if (button) button.hidden = !(paused && target); };
  const pause = () => { if (target && !paused) { paused = true; show(); } };
  scroller.addEventListener("wheel", pause, { passive: true });
  scroller.addEventListener("touchmove", pause, { passive: true });
  document.addEventListener("keydown", (e) => { if (KEYS.includes(e.key) && !e.target.isContentEditable && !/INPUT|TEXTAREA/.test(e.target.tagName)) pause(); });

  function keep() {
    if (!target || paused || !target.isConnected) return;
    const s = scroller.getBoundingClientRect(), r = target.getBoundingClientRect();
    if (r.top >= s.top + s.height * M.follow_top() && r.bottom <= s.bottom - s.height * M.follow_bottom()) return;
    const top = scroller.scrollTop + (r.top - s.top) - s.height * M.follow_anchor();
    scroller.scrollTo({ top: Math.max(0, top), behavior: lessMotion.matches ? "auto" : "smooth" });
  }

  if (button) button.addEventListener("click", () => { paused = false; show(); keep(); });

  return {
    to(el) { target = el; keep(); },
    stop() { target = null; paused = false; show(); },
  };
}
