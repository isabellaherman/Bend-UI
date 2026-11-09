# Bend-UI: where a diagram's nodes go. Pure; diagram.js only draws what comes back.
#
# A diagram is nodes (0, 1, 2, …) and arrows between them. It reads top to bottom:
# a node's row is the longest path to it from a node nothing points to, so every
# arrow goes down, except a return arrow (one that closes a loop), which goes back up
# beside the others. Nodes on a row keep their order.

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

# ---------- Size ----------

# A node's width: at least min, growing in whole steps, at most max (all in px).
def node_width(+natural: F32, +min: F32, +step: F32, +max: F32) -> F32:
  F32.min(max, F32.max(min, ((0.0 - F32.floor(((0.0 - natural) / step : F32))) * step : F32)))
