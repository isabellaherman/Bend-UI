// Optional workspace components: DOM adapters consume pure Bend decisions.
import "./ui.js";
import "./workspace.css";
import W from "./WORKSPACE.bend";
import T from "./TOKENS.bend";
// Compiled Bend Bool crosses the JavaScript boundary as a native boolean.
const bool = value => Boolean(value);
const narrowViewport = matchMedia(`(max-width: ${T.breakpoint() - 1}px)`);
const renderDirection = () => document.documentElement.style.setProperty("--workbench-direction", W.panels_direction(bool(narrowViewport.matches)));
narrowViewport.addEventListener("change", renderDirection);
renderDirection();

export function setStatusTone(element, error) {
  element.dataset.tone = W.feedback_tone(bool(error));
}

export function createFeedback(root) {
  let timer;
  root.classList.add("feedback");
  root.setAttribute("role", "status");
  const message = document.createElement("span");
  message.className = "detail feedback__message";
  const dismiss = document.createElement("button");
  dismiss.className = "btn btn--ghost btn--sm";
  dismiss.type = "button"; dismiss.textContent = "Dismiss";
  dismiss.addEventListener("click", () => { clearTimeout(timer); root.hidden = true; });
  root.replaceChildren(message, dismiss);
  return {
    show(text, { error = false, persistent = false } = {}) {
      clearTimeout(timer); message.textContent = text; root.hidden = false;
      setStatusTone(root, error);
      const delay = W.feedback_delay(bool(error), bool(persistent));
      if (delay) timer = setTimeout(() => { root.hidden = true; }, delay);
    },
    destroy() { clearTimeout(timer); root.replaceChildren(); }
  };
}

export function createDialog(root, { title, body, close }) {
  root.classList.add("dialog");
  root.setAttribute("aria-labelledby", title.id);
  close.addEventListener("click", () => root.close());
  return {
    open(label) { title.textContent = label; body.replaceChildren(); if (!root.open) root.showModal(); return body; },
    close() { root.close(); }
  };
}

export function configureSourceEditor(input) {
  // A native row count leaves the base input border, focus, font, and resizing intact.
  input.rows = T.source_min_lines();
}

export function createSidebar(side, toggle) {
  const narrow = matchMedia(`(max-width: ${T.breakpoint() - 1}px)`);
  const mark = () => {
    const open = side.classList.contains("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    side.inert = narrow.matches && !open;
  };
  const responsive = () => { side.classList.toggle("is-open", !narrow.matches); mark(); };
  const toggleSide = () => { side.classList.toggle("is-open"); mark(); };
  const outside = event => {
    if (W.dismiss_sidebar(bool(narrow.matches), bool(side.contains(event.target)), bool(toggle.contains(event.target)))) {
      side.classList.remove("is-open"); mark();
    }
  };
  toggle.addEventListener("click", toggleSide);
  document.addEventListener("click", outside);
  narrow.addEventListener("change", responsive); responsive();
  return {
    closeOnNarrow() { if (narrow.matches) { side.classList.remove("is-open"); mark(); } },
    destroy() { toggle.removeEventListener("click", toggleSide); document.removeEventListener("click", outside); narrow.removeEventListener("change", responsive); }
  };
}
