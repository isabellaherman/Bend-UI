# Bend-UI: where a diagram's nodes go. Pure; diagram.js only draws what comes back.
#
# A diagram is nodes (0, 1, 2, …) and arrows between them. It reads top to bottom:
# a node's row is the longest path to it from a node nothing points to, so every
# arrow goes down. Nodes on a row keep their order.

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

# As many passes as nodes: enough for the longest path. A loop stops there.
def rows.go(fuel: Nat, +rows: List<&2, Nat>, +es: List<&2, Edge>) -> List<&2, Nat>:
  match fuel:
    case 0n:
      rows
    case 1n+k:
      rows.go(k, pass(es, rows), es)

# Each node's row, for n nodes.
def rows(+n: Nat, +es: List<&2, Edge>) -> List<&2, Nat>:
  rows.go(n, zeros(n), es)

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
