# Bend-UI: where a chart's marks go. Pure; chart.js only draws what comes back.
#
# A pie is turns: each slice starts where the last one ended, 0 → 1 around the
# circle, from the top, clockwise. A point is (x, y) from the circle's center.

import Base

# ---------- Pie ----------

# The sum of the values.
def total(xs: List<&2, F32>) -> F32:
  match xs:
    case Nil{}:
      0.0
    case h <> t:
      (h + total(t) : F32)

# Where each slice starts, as a turn: the values before it over the total.
def starts.go(xs: List<&2, F32>, +at: F32, +sum: F32) -> List<&2, F32>:
  match xs:
    case Nil{}:
      Nil{}
    case h <> t:
      (at / sum : F32) <> starts.go(t, (at + h : F32), sum)

def starts(+xs: List<&2, F32>) -> List<&2, F32>:
  starts.go(xs, 0.0, total(xs))

# A turn as an angle, in radians.
def angle(+t: F32) -> F32:
  (2.0 * F32.pi() * t : F32)

# A point on a circle of radius r, at turn t. Up is negative y, as on screen.
def point_x(+t: F32, +r: F32) -> F32:
  (F32.sin(angle(t)) * r : F32)

def point_y(+t: F32, +r: F32) -> F32:
  (0.0 - F32.cos(angle(t)) * r : F32)

# An arc past half a turn takes the long way round (SVG's large-arc flag).
def long_way(+t0: F32, +t1: F32) -> U32:
  Bool.pick(U32, F32.is_gt((t1 - t0 : F32), 0.5), 1, 0)

# Which way a slice moves when lifted: out from the center, through its middle.
def out_x(+t0: F32, +t1: F32) -> F32:
  point_x(((t0 + t1 : F32) / 2.0 : F32), 1.0)

def out_y(+t0: F32, +t1: F32) -> F32:
  point_y(((t0 + t1 : F32) / 2.0 : F32), 1.0)

# While the pie grows in (p goes 0 → 1), a turn shows only up to p.
def shown(+t: F32, +p: F32) -> F32:
  F32.min(t, p)

# ---------- Bars, line and area: values on a grid ----------
#
# The plot is w wide and h tall; y = 0 is its top. Value i of n sits in slot i,
# one of n equal slots across the width.

# The largest value.
def most(xs: List<&2, F32>) -> F32:
  match xs:
    case Nil{}:
      0.0
    case h <> t:
      F32.max(h, most(t))

# How many steps the grid aims for.
def grid_steps() -> F32: 4.0

# The grid's step: a round number (1, 2 or 5 times a power of ten) near max / grid_steps.
def step.pick(+r: F32) -> F32:
  Bool.pick(F32, F32.is_le(r, 1.0), 1.0, Bool.pick(F32, F32.is_le(r, 2.0), 2.0, Bool.pick(F32, F32.is_le(r, 5.0), 5.0, 10.0)))

def step.round(+raw: F32, +unit: F32) -> F32:
  (unit * step.pick((raw / unit : F32)) : F32)

def step(+max: F32) -> F32:
  step.round((max / grid_steps() : F32), F32.pow(10.0, F32.floor(F32.log10((max / grid_steps() : F32)))))

# The grid's top: max, rounded up to a whole step.
def top(+max: F32) -> F32:
  (F32.ceil((max / step(max) : F32)) * step(max) : F32)

# Where a value sits: 0 at the bottom (y = h), top at y = 0.
def value_y(+v: F32, +top: F32, +h: F32) -> F32:
  (h - v / top * h : F32)

# The middle of slot i: a bar's center, a point's x.
def slot_x(+i: F32, +n: F32, +w: F32) -> F32:
  ((i + 0.5) * w / n : F32)

# Which slot a pointer at x is over.
def slot_at(+x: F32, +n: F32, +w: F32) -> U32:
  F32.to_u32(F32.clamp(F32.floor((x / w * n : F32)), 0.0, (n - 1.0 : F32)))

# A bar's width: its slot less a gap, never wider than widest.
def bar_width(+n: F32, +w: F32, +widest: F32, +gap: F32) -> F32:
  F32.min(widest, (w / n - gap : F32))

# While a chart grows in (p goes 0 → 1), a value shows this much of itself.
def grown(+v: F32, +p: F32) -> F32:
  (v * p : F32)

# The smooth line (monotone): at each point the curve leans along the slope of its
# neighbors, and lies flat on a peak or a valley, so it never swings past a value.
def lean.mix(+a: F32, +b: F32) -> F32:
  Bool.pick(F32, F32.is_gt((a * b : F32), 0.0), (2.0 * a * b / (a + b) : F32), 0.0)

def lean(+y0: F32, +y1: F32, +y2: F32, +dx: F32) -> F32:
  lean.mix(((y1 - y0 : F32) / dx : F32), ((y2 - y1 : F32) / dx : F32))

# At either end there is one neighbor: the curve leans straight at it.
def lean_end(+ya: F32, +yb: F32, +dx: F32) -> F32:
  ((yb - ya : F32) / dx : F32)

# A handle sits a third of the way toward the next point (dx < 0: the one before), along the lean m.
def handle_x(+x: F32, +dx: F32) -> F32:
  (x + dx / 3.0 : F32)

def handle_y(+y: F32, +m: F32, +dx: F32) -> F32:
  (y + m * dx / 3.0 : F32)
