# What each rule means. Owned by the lib's owner: it stays fixed beside LAWS.bend,
# so no one changes what a law means by changing a helper.

import Base

# The space scale: 0, 2 (hairline), 4, 8, 12, 16, 24, 32, 48, 64.
def in_space_scale(+n: U32) -> Bool:
  (U32.is_eq(n, 0) || U32.is_eq(n, 2) || U32.is_eq(n, 4) || U32.is_eq(n, 8) || U32.is_eq(n, 12)
    || U32.is_eq(n, 16) || U32.is_eq(n, 24) || U32.is_eq(n, 32)
    || U32.is_eq(n, 48) || U32.is_eq(n, 64))

# An icon-only button fits: icon + 2 × padding = height, with the padding on the scale.
def icon_button_fits(+height: U32, +icon: U32, +pad: U32) -> Bool:
  (U32.is_eq(height, (icon + pad + pad : U32)) && in_space_scale(pad))

# The control heights: 24, 32, 36, 48 (all on the 4 grid; sm, md, lg, xl).
def in_control_scale(+n: U32) -> Bool:
  (U32.is_eq(n, 24) || U32.is_eq(n, 32) || U32.is_eq(n, 36) || U32.is_eq(n, 48))

# On the 4 grid: a multiple of 4.
def on_grid(+n: U32) -> Bool:
  U32.is_eq(U32.mod(n, 4), 0)

# ---------- Shortcuts ----------
# A shortcut: in a scope, a key with exactly these modifiers runs an action.
#   scope: 0 the app (always on), 1 an open menu, 2 an open agent.
#   mods: a sum of 1 (Mod: ⌘ on a Mac, Ctrl elsewhere), 2 (Shift), 4 (Alt). Exact: Shift+Z is not Z.
#   key: the key, lower case ("k", "escape", "arrowdown").
type Shortcut is Data:
  Shortcut{scope: U32, mods: U32, key: String, action: String}

def mod() -> U32: 1
def shift() -> U32: 2
def alt() -> U32: 4

# The same key and the same modifiers, exactly.
def same_combo(+m1: U32, +k1: String, +m2: U32, +k2: String) -> Bool:
  (U32.is_eq(m1, m2) && String.eq(k1, k2))

# Two scopes can be on at once when they are the same, or when one is the app.
def scopes_overlap(+a: U32, +b: U32) -> Bool:
  (U32.is_eq(a, 0) || U32.is_eq(b, 0) || U32.is_eq(a, b))

# Two shortcuts clash: the same combo where both can be on.
def clash(a: Shortcut, b: Shortcut) -> Bool:
  match a b:
    case Shortcut{+sa, +ma, +ka, x} Shortcut{+sb, +mb, +kb, y}:
      (same_combo(ma, ka, mb, kb) && scopes_overlap(sa, sb))

def as_count(b: Bool) -> U32:
  match b:
    case True{}:
      1
    case False{}:
      0

def clashes_with(+k: Shortcut, xs: List<&2, Shortcut>) -> U32:
  match xs:
    case Nil{}:
      0
    case +h <> t:
      (as_count(clash(k, h)) + clashes_with(k, t) : U32)

# How many pairs clash in a keymap. A keymap is fine at 0.
def key_clashes(xs: List<&2, Shortcut>) -> U32:
  match xs:
    case Nil{}:
      0
    case +h <> +t:
      (clashes_with(h, t) + key_clashes(t) : U32)

# Keys the browser or the system keeps: ⌘/Ctrl + W, T, N, Q, L, R.
def is_reserved(k: Shortcut) -> Bool:
  match k:
    case Shortcut{s, +m, +key, a}:
      (U32.is_eq(m, 1) && (String.eq(key, "w") || String.eq(key, "t") || String.eq(key, "n")
        || String.eq(key, "q") || String.eq(key, "l") || String.eq(key, "r")))

def reserved_keys(xs: List<&2, Shortcut>) -> U32:
  match xs:
    case Nil{}:
      0
    case h <> t:
      (as_count(is_reserved(h)) + reserved_keys(t) : U32)

# While the person types in a field, only keys with ⌘/Ctrl or Alt run (Shift alone doesn't count).
# A plain key types its letter (WCAG 2.1.4, character key shortcuts).
def fires(typing: Bool, +mods: U32) -> Bool:
  match typing:
    case False{}:
      True{}
    case True{}:
      Bool.not(U32.is_eq((mods .&. 5 : U32), 0))
