import "../ui.js";
import { mountAgent } from "../agent.js";
import claude from "../brand/claude.webp";
import openai from "../brand/openai.svg";

// side: open / close
document.querySelectorAll("[data-side-toggle]").forEach((b) => b.addEventListener("click", () => b.closest(".side").classList.toggle("is-open")));

// window: framed / full
document.getElementById("win-full").addEventListener("click", (e) => {
  const full = document.getElementById("win-demo").classList.toggle("is-full");
  e.currentTarget.querySelector("use").setAttribute("href", full ? "#i-minimize" : "#i-maximize");
});

// status-ring: press and hold
const hold = document.getElementById("hold-demo");
let holdT;
hold.addEventListener("pointerdown", () => { hold.dataset.status = "hold"; holdT = setTimeout(() => hold.dataset.status = "warn", 960); });
["pointerup", "pointerleave"].forEach((ev) => hold.addEventListener(ev, () => { clearTimeout(holdT); if (hold.dataset.status === "hold") delete hold.dataset.status; }));

// agent
const items = (control) => [
  { id: control.id, icon: control.icon, label: control.label },
  { id: "a", mark: `<img src="${claude}" alt="">`, label: "Claude", ring: true },
  { id: "b", mark: `<img src="${openai}" alt="">`, label: "Codex", ring: true },
];
function demo(el, size, control) {
  const a = mountAgent(el, {
    size, items: items(control),
    onPick: (id) => {
      if (id === control.id) return a.close();
      a.setItem(id, { status: "busy" });
      setTimeout(() => { a.setItem(id, { status: "ok", pressed: true }); a.setItem(id === "a" ? "b" : "a", { status: "", pressed: false }); a.spin(); }, 900);
    },
  });
}
demo(document.getElementById("agent-lg"), "lg", { id: "min", icon: "minimize-2", label: "Minimize" });
demo(document.getElementById("agent-sm"), "sm", { id: "max", icon: "maximize-2", label: "Expand" });

// brand marks
document.getElementById("brand-claude").src = claude;
document.getElementById("brand-openai").src = openai;

// dropdown: the button shows the picked item
document.addEventListener("pick", (e) => {
  const btn = e.target.querySelector(':scope > [aria-haspopup="menu"]');
  btn.querySelector("span").textContent = e.detail.querySelector("span").textContent;
  btn.querySelector("use").setAttribute("href", e.detail.querySelector("use").getAttribute("href"));
});
