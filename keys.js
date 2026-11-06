// Bend-UI keys: reads the keyboard and runs the action KEYS.bend finds. Opt-in:
//   import { createKeys, keyLabel } from "bend-ui/keys";
//   import App from "./KEYS.bend";                        // your keymap, in Bend
//   createKeys(App.keymap(), { "chat.focus": () => …, … });
//
// The keymap is a Bend List of Spec.Shortcut, so your own LAWS.bend can check it with the lib's:
//   law my_keys_never_clash:
//     {Spec.key_clashes(K.with_lib(App.keymap())) == 0 : U32}
//
// What runs is KEYS.bend (find) and what the rules mean is SPEC.bend: exact modifiers, scopes, and no
// plain key while the person types. The lib's own keys (menu, agent) are handled by ui.js and agent.js.

import K from "./KEYS.bend";

const mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);

// Modifiers as SPEC.bend counts them: 1 Mod (⌘ on a Mac, Ctrl elsewhere), 2 Shift, 4 Alt.
const modsOf = (e) => ((mac ? e.metaKey : e.ctrlKey) ? 1 : 0) + (e.shiftKey ? 2 : 0) + (e.altKey ? 4 : 0);

// The key, lower case. A letter is the letter the layout types; when Alt turns it into a symbol, its position.
function keyOf(e) {
  const k = e.key.toLowerCase();
  if (/^[a-z0-9]$/.test(k)) return k;
  if (e.code.startsWith("Key")) return e.code.slice(3).toLowerCase();
  if (e.code.startsWith("Digit")) return e.code.slice(5);
  return k;
}

const typingIn = (el) => !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

// The scope that has the keys now (SPEC.bend): 1 an open menu, 2 an open agent, else 0 the app.
function scopeNow() {
  if (document.querySelector(".dropdown > .menu:not([hidden])")) return 1;
  if (document.querySelector(".agent.is-open")) return 2;
  return 0;
}

export function createKeys(keymap, handlers) {
  const onKey = (e) => {
    if (e.isComposing || e.repeat) return;
    const action = K.find(keymap, scopeNow(), modsOf(e), keyOf(e), typingIn(e.target));
    if (!action || !handlers[action]) return;
    e.preventDefault();
    handlers[action](e);
  };
  document.addEventListener("keydown", onKey);
  return { destroy: () => document.removeEventListener("keydown", onKey) };
}

// How to show a shortcut, for a .kbd: "⌘K" on a Mac, "Ctrl+K" elsewhere.
export const keyLabel = (mods, key) => K.label(mods, key, mac);
