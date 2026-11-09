# Bend-UI: where a diagram's nodes go. Pure; diagram.js only draws what comes back.
#
# A diagram is nodes (0, 1, 2, …) and arrows between them. It reads top to bottom:
# a node's row is the longest path to it from a node nothing points to, so every
# arrow goes down, except a return arrow (one that closes a loop), which goes back up
# beside the others. On a row, nodes sit under the nodes they come from (order), so a
# parent's children stay together and arrows cross less; ties keep the nodes' order.

import Base

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
