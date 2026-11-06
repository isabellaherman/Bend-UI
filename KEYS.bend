# Bend-UI's keys: the keys its components answer to, and which action a key press runs.
# What the rules mean is SPEC.bend; LAWS.bend checks the keymaps. keys.js only reads the keyboard.

import Base
import ./SPEC.bend as Spec

# The keys Bend-UI's own components answer to (ui.js: the menu; agent.js: the agent).
def lib_keys() -> List<&2, Spec.Shortcut>:
  [Spec.Shortcut{1, 0, "escape", "menu.close"},
   Spec.Shortcut{1, 0, "arrowdown", "menu.next"},
   Spec.Shortcut{1, 0, "arrowup", "menu.previous"},
   Spec.Shortcut{2, 0, "escape", "agent.close"}]

# An app's keymap together with the lib's: what its laws check.
def with_lib(app: List<&2, Spec.Shortcut>) -> List<&2, Spec.Shortcut>:
  List.append(&2, Spec.Shortcut, app, lib_keys())

def pick(c: Bool, a: String, b: String) -> String:
  match c:
    case True{}:
      a
    case False{}:
      b

# Does this shortcut run for a key press: exactly its key and modifiers, in the focused scope or the app,
# and allowed while typing (SPEC.bend: fires)?
def runs(k: Spec.Shortcut, +scope: U32, +mods: U32, +key: String, +typing: Bool) -> Bool:
  match k:
    case Spec.Shortcut{+s, +m, +name, a}:
      (Spec.same_combo(m, name, mods, key) && (U32.is_eq(s, scope) || U32.is_eq(s, 0)) && Spec.fires(typing, m))

def action(k: Spec.Shortcut) -> String:
  match k:
    case Spec.Shortcut{s, m, name, a}:
      a

# The action a key press runs: the first shortcut that runs, or "" if none.
def find(xs: List<&2, Spec.Shortcut>, +scope: U32, +mods: U32, +key: String, +typing: Bool) -> String:
  match xs:
    case Nil{}:
      ""
    case +h <> t:
      pick(runs(h, scope, mods, key, typing), action(h), find(t, scope, mods, key, typing))

# How a shortcut is shown (in a .kbd): ⌘⌥⇧K on a Mac, Ctrl+Alt+Shift+K elsewhere.
def has(+mods: U32, +bit: U32) -> Bool:
  Bool.not(U32.is_eq((mods .&. bit : U32), 0))

def key_name(+key: String) -> String:
  pick(String.eq(key, "escape"), "Esc",
  pick(String.eq(key, "arrowdown"), "↓",
  pick(String.eq(key, "arrowup"), "↑",
  pick(String.eq(key, "enter"), "↵",
  String.to_upper(key)))))

def label(+mods: U32, +key: String, +mac: Bool) -> String:
  pick(has(mods, 1), pick(mac, "⌘", "Ctrl+"), "")
    ++ pick(has(mods, 4), pick(mac, "⌥", "Alt+"), "")
    ++ pick(has(mods, 2), pick(mac, "⇧", "Shift+"), "")
    ++ key_name(key)
