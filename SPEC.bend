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

# The control heights: 24, 32, 36 (all on the 4 grid).
def in_control_scale(+n: U32) -> Bool:
  (U32.is_eq(n, 24) || U32.is_eq(n, 32) || U32.is_eq(n, 36))

# On the 4 grid: a multiple of 4.
def on_grid(+n: U32) -> Bool:
  U32.is_eq(U32.mod(n, 4), 0)
