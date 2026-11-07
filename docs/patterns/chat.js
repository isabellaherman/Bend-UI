// The Chat pattern: Bend-UI's chat pieces put together, as LawEditor uses them. The answers are made up.
// Window, side bar, toolbar, chat__start (agent_xl), composer__field and composer__bar with dropdowns (menu--up),
// msg--me, msg--face with an sm agent, thread__reading, msg__word; flyBetween moves the face.
import { mountAgent, flyBetween } from "../../agent.js";

const lessMotion = matchMedia("(prefers-reduced-motion: reduce)");
const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const ms = (name) => { const v = token(name); return v.endsWith("ms") ? parseFloat(v) : parseFloat(v) * 1000; };
const sleep = (t) => new Promise((r) => setTimeout(r, t));

const REPLIES = [
  "Two laws fit that sentence, so I didn't pick one. Does every boss drop a key when defeated, or only some bosses?",
  "Then write it like that: “Every boss drops exactly one key when defeated.” Only one law fits it.",
  "LAWS.bend holds one law per sentence, each under its sentence. The compiler checks every one.",
];

const dropdown = (label, items) =>
  `<div class="dropdown"><button class="btn btn--ghost btn--sm" type="button" aria-haspopup="menu" aria-expanded="false"><span>${label}</span><svg class="icon icon--sm"><use href="#i-chevron-down"/></svg></button>` +
  `<div class="menu menu--up" role="menu" hidden>${items.map((it, i) => `<button class="menu__item" role="menuitemradio" aria-checked="${i === 0}"><span>${it}</span><svg class="icon icon--sm menu__check"><use href="#i-check"/></svg></button>`).join("")}</div></div>`;

export function mountChatPattern(root) {
  root.innerHTML = `
    <div class="v-pattern desk"><div class="window" data-agent="sm">
      <aside class="side">
        <div class="side__head"><button class="btn btn--ghost btn--icon" aria-label="Side bar"><svg class="icon"><use href="#i-panel-left"/></svg></button></div>
        <button class="btn btn--ghost" aria-current="page" title="Chat"><svg class="icon"><use href="#i-text"/></svg><span class="side__text">Chat</span></button>
        <button class="btn btn--ghost" title="Laws"><svg class="icon"><use href="#i-shield"/></svg><span class="side__text">Laws</span></button>
      </aside>
      <div class="window__main">
        <div class="toolbar"><div class="toolbar__spacer"></div><button class="btn btn--ghost btn--sm" type="button" data-reset>Start over</button></div>
        <main class="page"><div class="chat"></div></main>
        <form class="composer">
          <div class="composer__box"><div class="composer__field">
            <textarea class="composer__text" rows="1" placeholder="Message the agent…" aria-label="Message"></textarea>
            <button class="btn btn--primary btn--sm btn--icon btn--round composer__send" type="submit" aria-label="Send" title="Send" disabled><svg class="icon"><use href="#i-arrow-up"/></svg></button>
          </div></div>
          <div class="composer__bar">${dropdown("Claude", ["Claude", "Codex"])}${dropdown("Opus", ["Opus", "Sonnet", "Fable"])}</div>
        </form>
      </div>
    </div></div>`;

  const page = root.querySelector(".page"), list = root.querySelector(".chat"), form = root.querySelector(".composer");
  const text = form.querySelector(".composer__text"), send = form.querySelector(".composer__send");
  const home = form.parentElement, after = form.nextSibling;
  root.querySelectorAll(".composer__bar .dropdown").forEach((dd) =>
    dd.addEventListener("pick", (e) => { dd.querySelector("[aria-haspopup] span").textContent = e.detail.textContent.trim(); }));

  let start, big, pet, answering = false, turn = 0;
  const down = () => page.scrollTo({ top: page.scrollHeight, behavior: lessMotion.matches ? "auto" : "smooth" });

  // The start: the big face and the composer in the middle, until the first message.
  function reset() {
    list.innerHTML = ""; turn = 0; answering = false;
    if (pet) { pet.destroy(); pet = null; }
    if (big) { big.destroy(); big = null; }
    start?.remove();
    home.insertBefore(form, after);
    start = document.createElement("div");
    start.className = "chat__start";
    start.innerHTML = "<div><div></div></div>";
    page.prepend(start);
    start.append(form);
    big = mountAgent(start.firstChild.firstChild, { size: "lg", items: [] });
    text.value = ""; sync();
  }

  // The first message sends the composer down (a glide; a fade with less motion).
  async function leave() {
    const from = form.getBoundingClientRect(), faceAt = big.face.getBoundingClientRect();
    const fade = { duration: ms("--duration-enter") / 2, easing: token("--ease") };
    if (lessMotion.matches) await start.animate([{ opacity: 1 }, { opacity: 0 }], fade).finished;
    home.insertBefore(form, after);
    start.remove(); start = null; big.destroy(); big = null;
    text.focus();
    if (lessMotion.matches) { form.animate([{ opacity: 0 }, { opacity: 1 }], fade); return null; }
    const to = form.getBoundingClientRect();
    form.animate([{ transform: `translateY(${from.top - to.top}px)` }, { transform: "none" }], { duration: ms("--duration-connect"), easing: token("--ease") });
    return faceAt;
  }

  async function submit() {
    const t = text.value.trim(); if (!t || answering) return;
    answering = true; text.value = ""; sync();
    const from = start ? await leave() : (pet && pet.face.getBoundingClientRect());
    const me = document.createElement("div"); me.className = "msg msg--me is-arriving"; me.textContent = t; list.append(me);
    const reply = document.createElement("div"); reply.className = "msg msg--face";
    reply.innerHTML = '<div class="msg__face"><div></div></div><div><span class="thread__reading">Reading your project…</span></div>';
    list.append(reply); down();
    if (pet) pet.destroy();
    pet = mountAgent(reply.querySelector(".msg__face > div"), { size: "sm", items: [] });
    if (from && from.width && !lessMotion.matches) flyBetween(from, pet);
    pet.lookAtEl(reply);
    await sleep(1400);
    const body = reply.lastChild; body.textContent = "";
    for (const w of REPLIES[turn++ % REPLIES.length].split(/(\s+)/)) {
      const s = document.createElement("span"); if (/\S/.test(w)) s.className = "msg__word"; s.textContent = w; body.append(s);
      if (/\S/.test(w) && !lessMotion.matches) { down(); await sleep(30); }
    }
    pet.lookAtEl(null); answering = false; sync(); down();
  }

  const sync = () => { send.disabled = answering || !text.value.trim(); };
  text.addEventListener("input", sync);
  text.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } });
  form.addEventListener("submit", (e) => { e.preventDefault(); submit(); });
  root.querySelector("[data-reset]").addEventListener("click", reset);
  reset();
}
