# Bend-UI: where a diagram's nodes go. Pure; diagram.js only draws what comes back.
#
# A diagram is nodes (0, 1, 2, …) and arrows between them. It reads top to bottom:
# a node's row is the longest path to it from a node nothing points to, so every
# arrow goes down, except a return arrow (one that closes a loop), which goes back up
# beside the others. On a row, nodes sit under the nodes they come from (order), so a
# parent's children stay together and arrows cross less; ties keep the nodes' order.

import Base
import ./TOKENS.bend as T

# An arrow from one node to another.
type Edge is Data:
  Edge{from: Nat, to: Nat}

# ---------- A list of numbers, one per node ----------

def zeros(n: Nat) -> List<&2, Nat>:
  match n:
    case 0n:
      Nil{}
    case 1n+k:
      0n <> zeros(k)

def get(xs: List<&2, Nat>, i: Nat) -> Nat:
  match xs i:
    case Nil{} _:
      0n
    case h <> t 0n:
      h
    case h <> t 1n+k:
      get(t, k)

def max(+a: Nat, +b: Nat) -> Nat:
  Bool.pick(Nat, (a < b : Nat), b, a)

# The list with its i-th number raised to at least v.
def raise(xs: List<&2, Nat>, i: Nat, +v: Nat) -> List<&2, Nat>:
  match xs i:
    case Nil{} _:
      Nil{}
    case h <> t 0n:
      max(h, v) <> t
    case h <> t 1n+k:
      h <> raise(t, k, v)

# ---------- Rows ----------

def from_of(e: Edge) -> Nat:
  match e:
    case Edge{f, t}:
      f

def to_of(e: Edge) -> Nat:
  match e:
    case Edge{f, t}:
      t

# One pass: every arrow pushes its end at least one row below its start.
def pass(es: List<&2, Edge>, +rows: List<&2, Nat>) -> List<&2, Nat>:
  match es:
    case Nil{}:
      rows
    case +h <> t:
      pass(t, raise(rows, to_of(h), (get(rows, from_of(h)) + 1n : Nat)))

# As many passes as nodes: enough for the longest path (the arrows here never loop).
def rows.go(fuel: Nat, +rows: List<&2, Nat>, +es: List<&2, Edge>) -> List<&2, Nat>:
  match fuel:
    case 0n:
      rows
    case 1n+k:
      rows.go(k, pass(es, rows), es)

# ---------- Return arrows ----------
# An arrow that closes a loop (its end already reaches its start) is a return arrow: it is still drawn,
# but it doesn't push rows, so a loop can't push its nodes down. Arrows are read in order; the first
# arrows of a loop go down, the one that closes it goes back up.

# One pass: every node an arrow leaves from a marked node gets marked too.
def mark_pass(es: List<&2, Edge>, +marks: List<&2, Nat>) -> List<&2, Nat>:
  match es:
    case Nil{}:
      marks
    case +h <> t:
      mark_pass(t, raise(marks, to_of(h), get(marks, from_of(h))))

def marks.go(fuel: Nat, +marks: List<&2, Nat>, +es: List<&2, Edge>) -> List<&2, Nat>:
  match fuel:
    case 0n:
      marks
    case 1n+k:
      marks.go(k, mark_pass(es, marks), es)

# Does a reach b by these arrows (n nodes)? A node reaches itself.
def reaches(+n: Nat, +es: List<&2, Edge>, +a: Nat, +b: Nat) -> Bool:
  Nat.is_eq(get(marks.go(n, raise(zeros(n), a, 1n), es), b), 1n)

# Each arrow, in order: 1 if it closes a loop (a return arrow), 0 if it goes forward.
# kept: the forward arrows so far.
def back.go(es: List<&2, Edge>, +n: Nat, +kept: List<&2, Edge>) -> List<&2, Nat>:
  match es:
    case Nil{}:
      Nil{}
    case +h <> t:
      +closes = reaches(n, kept, to_of(h), from_of(h))
      Bool.pick(Nat, closes, 1n, 0n) <> back.go(t, n, Bool.pick(List<&2, Edge>, closes, kept, h <> kept))

def back(+n: Nat, +es: List<&2, Edge>) -> List<&2, Nat>:
  back.go(es, n, Nil{})

# The forward arrows only: the ones that don't close a loop.
def forward.go(es: List<&2, Edge>, +n: Nat, +kept: List<&2, Edge>) -> List<&2, Edge>:
  match es:
    case Nil{}:
      kept
    case +h <> t:
      +closes = reaches(n, kept, to_of(h), from_of(h))
      forward.go(t, n, Bool.pick(List<&2, Edge>, closes, kept, h <> kept))

# Each node's row, for n nodes: the longest path over the forward arrows (return arrows don't push).
def rows(+n: Nat, +es: List<&2, Edge>) -> List<&2, Nat>:
  rows.go(n, zeros(n), forward.go(es, n, Nil{}))

# ---------- Columns ----------

# How many of the first i nodes sit on row r.
def before(xs: List<&2, Nat>, i: Nat, +r: Nat) -> Nat:
  match xs i:
    case Nil{} _:
      0n
    case h <> t 0n:
      0n
    case h <> t 1n+k:
      (Bool.pick(Nat, Nat.is_eq(h, r), 1n, 0n) + before(t, k, r) : Nat)

# Each node's place on its row: the nodes before it on the same row.
def columns.go(n: Nat, +rows: List<&2, Nat>, +i: Nat) -> List<&2, Nat>:
  match n:
    case 0n:
      Nil{}
    case 1n+k:
      before(rows, i, get(rows, i)) <> columns.go(k, rows, (i + 1n : Nat))

def columns(+rows: List<&2, Nat>, +n: Nat) -> List<&2, Nat>:
  columns.go(n, rows, 0n)

# How many rows: one more than the deepest.
def depth(rows: List<&2, Nat>) -> Nat:
  match rows:
    case Nil{}:
      0n
    case h <> t:
      max((h + 1n : Nat), depth(t))

# ---------- Order on a row ----------
# Rows are ordered top to bottom. A node's pull is where its parents sit (forward arrows only): the sum of
# their places and how many they are. On its row a node goes after every node whose pull is further left
# (sum / count, compared without dividing), and after the ones with the same pull that come before it.

# The sum of the places of node i's parents.
def pull.sum(es: List<&2, Edge>, +i: Nat, +pos: List<&2, Nat>) -> Nat:
  match es:
    case Nil{}:
      0n
    case +h <> t:
      (Bool.pick(Nat, Nat.is_eq(to_of(h), i), get(pos, from_of(h)), 0n) + pull.sum(t, i, pos) : Nat)

# How many parents node i has.
def pull.count(es: List<&2, Edge>, +i: Nat) -> Nat:
  match es:
    case Nil{}:
      0n
    case +h <> t:
      (Bool.pick(Nat, Nat.is_eq(to_of(h), i), 1n, 0n) + pull.count(t, i) : Nat)

# Does node j go before node i (pull sj / cj against si / ci)?
def goes_first(+sj: Nat, +cj: Nat, +j: Nat, +si: Nat, +ci: Nat, +i: Nat) -> Bool:
  +a = (sj * ci : Nat)
  +b = (si * cj : Nat)
  (a < b : Nat) || (Nat.is_eq(a, b) && (j < i : Nat))

# Node i's place on row r: how many nodes of row r go before it. j runs over every node.
def rank.go(k: Nat, +j: Nat, +i: Nat, +r: Nat, +si: Nat, +ci: Nat, +rows: List<&2, Nat>, +es: List<&2, Edge>, +pos: List<&2, Nat>) -> Nat:
  match k:
    case 0n:
      0n
    case 1n+m:
      +ahead = Nat.is_eq(get(rows, j), r) && goes_first(pull.sum(es, j, pos), pull.count(es, j), j, si, ci, i)
      (Bool.pick(Nat, ahead, 1n, 0n) + rank.go(m, (j + 1n : Nat), i, r, si, ci, rows, es, pos) : Nat)

# Every node's place, with row r put in order and the other rows as they were.
def place.go(k: Nat, +i: Nat, +n: Nat, +r: Nat, +rows: List<&2, Nat>, +es: List<&2, Edge>, +pos: List<&2, Nat>) -> List<&2, Nat>:
  match k:
    case 0n:
      Nil{}
    case 1n+m:
      +mine = Nat.is_eq(get(rows, i), r)
      +here = Bool.pick(Nat, mine, rank.go(n, 0n, i, r, pull.sum(es, i, pos), pull.count(es, i), rows, es, pos), get(pos, i))
      here <> place.go(m, (i + 1n : Nat), n, r, rows, es, pos)

def order.go(k: Nat, +r: Nat, +n: Nat, +rows: List<&2, Nat>, +es: List<&2, Edge>, +pos: List<&2, Nat>) -> List<&2, Nat>:
  match k:
    case 0n:
      pos
    case 1n+m:
      order.go(m, (r + 1n : Nat), n, rows, es, place.go(n, 0n, n, r, rows, es, pos))

# Each node's place on its row, for n nodes: under the nodes it comes from.
def order(+n: Nat, +es: List<&2, Edge>) -> List<&2, Nat>:
  +fw = forward.go(es, n, Nil{})
  +rs = rows.go(n, zeros(n), fw)
  order.go(depth(rs), 0n, n, rs, fw, columns(rs, n))

# ---------- Size ----------

# A node's width: at least min, growing in whole steps, at most max (all in px).
def node_width(+natural: F32, +min: F32, +step: F32, +max: F32) -> F32:
  F32.min(max, F32.max(min, ((0.0 - F32.floor(((0.0 - natural) / step : F32))) * step : F32)))

# ---------- Arrow words ----------
# An arrow's words sit on its line. The middle comes first; if the words would cover a node or words
# already placed, they slide along the line, away from the middle, to the first place that is clear.

# The places to try, as a share of the line from its start.
def label_tries() -> List<&2, F32>:
  [0.5, 0.35, 0.65, 0.25, 0.75, 0.15, 0.85]

# Do two boxes cover each other? Each is left, top, right, bottom (px).
def covers(+al: F32, +at: F32, +ar: F32, +ab: F32, +bl: F32, +bt: F32, +br: F32, +bb: F32) -> Bool:
  F32.is_lt(al, br) && F32.is_lt(bl, ar) && F32.is_lt(at, bb) && F32.is_lt(bt, ab)

# ---------- Shapes ----------
# A node's shape, Mermaid's flowchart shapes (diagram.js turns the name into this number):
#   0 none (today's box)  1 rect  2 rounded  3 stadium  4 fr-rect  5 cyl  6 circle  7 dbl-circ
#   8 odd  9 diam  10 hex  11 lean-r  12 lean-l  13 trap-b  14 trap-t
# Sizes are whole px. The text box (w, h) is the label with today's padding; a shape is drawn around it,
# so the text never touches the outline. Forward arrows meet the top and bottom centers, which are on every
# outline already; only a return arrow (a side, at mid-height) and a self-loop (the top) need these.

def sel(b: Bool, +x: U32, +y: U32) -> U32:
  match b:
    case True{}:
      x
    case False{}:
      y

def dist(+a: U32, +b: U32) -> U32:
  sel((a >= b : U32), (a - b : U32), (b - a : U32))

def eq(+s: U32, +k: U32) -> Bool:
  U32.is_eq(s, k)

# A slanted shape: Data input/output and output/input, Priority action, Manual operation.
def slanted(+s: U32) -> Bool:
  (s >= 11 : U32) && (s <= 14 : U32)

# At least min, in whole steps.
def snap(+x: U32, +min: U32, +step: U32) -> U32:
  +up = (((x + step - 1) / step) * step : U32)
  sel((up >= min : U32), up, min)

# The whole square root, rounded down.
def isqrt.go(fuel: Nat, +n: U32, +lo: U32, +hi: U32) -> U32:
  match fuel:
    case 0n:
      lo
    case 1n+f:
      +mid = ((lo + hi + 1) / 2 : U32)
      +ok = (mid * mid <= n : U32)
      isqrt.go(f, n, sel(ok, mid, lo), sel(ok, hi, (mid - 1 : U32)))

def isqrt(+n: U32) -> U32:
  isqrt.go(17n, n, 0, 65535)

# How far a slanted side, a hexagon's point or the flag's notch reaches in: half the height.
def slant(+h: U32) -> U32:
  (h / 2 : U32)

# A shape's width around a text box w × h.
def shape_w(+s: U32, +w: U32, +h: U32) -> U32:
  +min = T.diagram_node_min()
  +step = T.diagram_node_step()
  +d = (isqrt((w * w + h * h : U32)) + 1 : U32)
  +round = sel(eq(s, 7), snap((d + 2 * T.diagram_ring_gap() : U32), T.diagram_circle_min(), step), snap(d, T.diagram_circle_min(), step))
  +wide = sel(eq(s, 9), snap((w + 2 * h : U32), min, step), sel(eq(s, 4), snap((w + 2 * T.diagram_frame() : U32), min, step), snap(w, min, step)))
  +pointed = sel(slanted(s) || eq(s, 10) || eq(s, 3), snap((w + h : U32), min, step), sel(eq(s, 8), snap((w + slant(h) : U32), min, step), wide))
  sel(eq(s, 6) || eq(s, 7), round, pointed)

# A shape's height around a text box w × h. A circle is as tall as it is wide; a rhombus is as tall as
# its text needs (w/W + h/H at most 1); a database adds its two ellipses.
def shape_h(+s: U32, +w: U32, +h: U32) -> U32:
  +W = shape_w(s, w, h)
  # One px of slack on each side of the text for rounding, and an even height so the side tips sit on a whole px.
  +room = sel((W > (w + 1 : U32) : U32), (W - w - 1 : U32), 1)
  +tall = ((((h + 1) * W) + room - 1) / room : U32)
  +diam = (((tall + 1) / 2) * 2 : U32)
  sel(eq(s, 6) || eq(s, 7), W, sel(eq(s, 9), diam, sel(eq(s, 5), (h + 4 * T.diagram_cap() : U32), h)))

# The text sits this much further right (the flag's notch is on the left).
def pad_left(+s: U32, +h: U32) -> U32:
  sel(eq(s, 8), slant(h), 0)

# Where a return arrow meets a side (side 0 left, 1 right), at mid-height: how far in from the box's edge.
def side_inset(+s: U32, +side: U32, +W: U32, +H: U32) -> U32:
  sel(slanted(s), (slant(H) / 2 : U32), sel(eq(s, 8) && eq(side, 0), slant(H), 0))

# Where the outline's top is at x (a self-loop enters there): how far down from the box's top.
def top_at(+s: U32, +x: U32, +W: U32, +H: U32) -> U32:
  +r = (W / 2 : U32)
  +dx = dist(x, r)
  +e = sel((x <= (W - x : U32) : U32), x, (W - x : U32))
  +k = slant(H)
  +q = (H / 2 : U32)
  +c = T.diagram_cap()
  +diam = ((H * dist((2 * x : U32), W)) / (2 * W) : U32)
  +circle = sel((dx <= r : U32), (r - isqrt((r * r - dx * dx : U32)) : U32), 0)
  +cyl = sel((dx <= r : U32), (c - (c * isqrt((r * r - dx * dx : U32))) / r : U32), 0)
  +stadium = sel((e >= q : U32), 0, (q - isqrt((q * q - (q - e) * (q - e) : U32)) : U32))
  +hex = sel((e >= k : U32), 0, ((q * (k - e)) / k : U32))
  +trap = sel((e >= k : U32), 0, ((H * (k - e)) / k : U32))
  +lean_r = sel((x >= k : U32), 0, ((H * (k - x)) / k : U32))
  +lean_l = sel((x <= (W - k : U32) : U32), 0, ((H * (x - (W - k))) / k : U32))
  +rest = sel(eq(s, 13), trap, sel(eq(s, 11), lean_r, sel(eq(s, 12), lean_l, 0)))
  sel(eq(s, 9), diam, sel(eq(s, 6) || eq(s, 7), circle, sel(eq(s, 5), cyl, sel(eq(s, 3), stadium, sel(eq(s, 10), hex, rest)))))

# ---------- Shapes, checked ----------
# Is (x, y) inside or on a shape W × H? Written from each outline's own equation, apart from the
# functions above, so the laws below compare two different ways of saying where the outline is.
def inside(+s: U32, +x: U32, +y: U32, +W: U32, +H: U32) -> Bool:
  +a = dist((2 * x : U32), W)
  +b = dist((2 * y : U32), H)
  +k = slant(H)
  +c = T.diagram_cap()
  +r = (W / 2 : U32)
  +dx = dist(x, r)
  +q = (H / 2 : U32)
  +box = (x <= W : U32) && (y <= H : U32)
  +circle = ((a * a + b * b : U32) <= (W * W : U32) : U32)
  +diam = ((a * H + b * W : U32) <= (W * H : U32) : U32)
  +hex = box && ((a * H + 2 * k * b : U32) <= (W * H : U32) : U32)
  +cap_ok = sel((y >= c : U32), 1, sel(((dx * dx * c * c + (c - y) * (c - y) * r * r : U32) <= (r * r * c * c : U32) : U32), 1, 0))
  +cyl = box && eq(cap_ok, 1)
  +e = sel((x <= (W - x : U32) : U32), x, (W - x : U32))
  +ends = sel((e >= q : U32), 1, sel((((q - e) * (q - e) + dist(y, q) * dist(y, q) : U32) <= (q * q : U32) : U32), 1, 0))
  +stadium = box && eq(ends, 1)
  +lean_r = box && ((x * H + k * y : U32) >= (k * H : U32) : U32) && (((W - x) * H : U32) >= (k * y : U32) : U32)
  +lean_l = box && ((x * H : U32) >= (k * y : U32) : U32) && (((W - x) * H + k * y : U32) >= (k * H : U32) : U32)
  +trap_b = box && ((x * H + k * y : U32) >= (k * H : U32) : U32) && (((W - x) * H + k * y : U32) >= (k * H : U32) : U32)
  +trap_t = box && ((x * H : U32) >= (k * y : U32) : U32) && (((W - x) * H : U32) >= (k * y : U32) : U32)
  +odd = box && ((x + dist(y, q) : U32) >= q : U32)
  +dbl = (((a * a + b * b : U32) <= ((W - 2 * T.diagram_ring_gap()) * (W - 2 * T.diagram_ring_gap()) : U32) : U32) || eq(s, 7))
  +curved = sel(eq(s, 6), sel(circle, 1, 0), sel(eq(s, 7), sel(circle && dbl, 1, 0), sel(eq(s, 5), sel(cyl, 1, 0), sel(eq(s, 3), sel(stadium, 1, 0), 2))))
  +straight = sel(eq(s, 9), sel(diam, 1, 0), sel(eq(s, 10), sel(hex, 1, 0), sel(eq(s, 11), sel(lean_r, 1, 0), sel(eq(s, 12), sel(lean_l, 1, 0), sel(eq(s, 13), sel(trap_b, 1, 0), sel(eq(s, 14), sel(trap_t, 1, 0), sel(eq(s, 8), sel(odd, 1, 0), sel(box, 1, 0))))))))
  eq(sel(eq(curved, 2), straight, curved), 1)

def no(b: Bool) -> Bool:
  match b:
    case True{}:
      False{}
    case False{}:
      True{}

def selb(b: Bool, +x: Bool, +y: Bool) -> Bool:
  match b:
    case True{}:
      x
    case False{}:
      y

# A point a return arrow ends on (side 0 left, 1 right) is on the outline: it is inside (or 1 px short
# of it, from rounding), and 2 px further out it is outside.
def on_side(+s: U32, +side: U32, +x: U32, +y: U32, +W: U32, +H: U32) -> Bool:
  +near = selb(eq(side, 0), inside(s, (x + 1 : U32), y, W, H), inside(s, (x - 1 : U32), y, W, H))
  +gone = selb(eq(side, 0), (x < 2 : U32) || no(inside(s, (x - 2 : U32), y, W, H)), no(inside(s, (x + 2 : U32), y, W, H)))
  (inside(s, x, y, W, H) || near) && gone

# A point a self-loop ends on is on the outline's top, the same way.
def on_top(+s: U32, +x: U32, +y: U32, +W: U32, +H: U32) -> Bool:
  (inside(s, x, y, W, H) || inside(s, x, (y + 1 : U32), W, H)) && ((y < 2 : U32) || no(inside(s, x, (y - 2 : U32), W, H)))

# The checks, for one shape around one text box w × h.
#   1: both return-arrow points are on the outline   2: the self-loop points at W/4 and 3W/4 are too
#   3: the text box fits inside   4: a circle is round   5: no shape is today's box
def check(+which: U32, +s: U32, +w: U32, +h: U32) -> Bool:
  +W = shape_w(s, w, h)
  +H = shape_h(s, w, h)
  +y = (H / 2 : U32)
  +sides = on_side(s, 0, side_inset(s, 0, W, H), y, W, H) && on_side(s, 1, (W - side_inset(s, 1, W, H) : U32), y, W, H)
  +x1 = (W / 4 : U32)
  +x2 = ((3 * W) / 4 : U32)
  +tops = on_top(s, x1, top_at(s, x1, W, H), W, H) && on_top(s, x2, top_at(s, x2, W, H), W, H)
  +l = ((W - w + pad_left(s, h)) / 2 : U32)
  +t = ((H - h) / 2 : U32)
  +r = (l + w : U32)
  +b = (t + h : U32)
  +g = T.diagram_ring_gap()
  +inner = (W - 2 * g : U32)
  +in_ring = ((dist((2 * l : U32), W) * dist((2 * l : U32), W) + dist((2 * t : U32), H) * dist((2 * t : U32), H) : U32) <= (inner * inner : U32) : U32)
  +framed = selb(eq(s, 4), (l >= T.diagram_frame() : U32) && (r <= (W - T.diagram_frame() : U32) : U32), True{})
  +ringed = selb(eq(s, 7), in_ring, True{})
  +fits = inside(s, l, t, W, H) && inside(s, r, t, W, H) && inside(s, l, b, W, H) && inside(s, r, b, W, H) && inside(s, l, (t + h / 2 : U32), W, H) && framed && ringed && (W >= (w + pad_left(s, h)) : U32) && (H >= h : U32)
  +round = selb(eq(s, 6) || eq(s, 7), U32.is_eq(W, H), True{})
  +none = U32.is_eq(side_inset(0, 0, W, H), 0) && U32.is_eq(side_inset(0, 1, W, H), 0) && U32.is_eq(top_at(0, x1, W, H), 0) && U32.is_eq(shape_h(0, w, h), h) && U32.is_eq(pad_left(0, h), 0)
  selb(eq(which, 1), sides, selb(eq(which, 2), tops, selb(eq(which, 3), fits, selb(eq(which, 4), round, none))))

# Four text boxes: one word, a long line, two lines, a short word (px, today's padding included).
def sizes_hold(+which: U32, +s: U32) -> Bool:
  check(which, s, 80, 37) && check(which, s, 200, 37) && check(which, s, 150, 58) && check(which, s, 60, 37)

def shapes_hold(xs: List<&2, U32>, +which: U32) -> Bool:
  match xs:
    case Nil{}:
      True{}
    case Con{s, rest}:
      sizes_hold(which, s) && shapes_hold(rest, which)

def all_shapes() -> List<&2, U32>:
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

def returns_meet_outline() -> Bool:
  shapes_hold(all_shapes(), 1)

def self_loops_meet_outline() -> Bool:
  shapes_hold(all_shapes(), 2)

def text_fits_inside() -> Bool:
  shapes_hold(all_shapes(), 3)

def circles_are_round() -> Bool:
  shapes_hold([6, 7], 4)

def no_shape_is_the_box() -> Bool:
  sizes_hold(5, 0)
