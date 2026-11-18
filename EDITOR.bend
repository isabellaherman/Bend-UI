# A block document and every way to change it, modeled on ProseMirror's architecture:
# - a document is a list of blocks that fits a schema (fit);
# - a step is one change. Every step has an inverse (invert) and says where a position goes (map_pos);
# - the history (undo, redo) is built from steps and their inverses;
# - a command is what a key or a button means: it reads the document and answers with steps.
# The browser only reads keys and draws what this file returns (editor.js). Opt-in: import "bend-ui/editor".
import Base

type Form is Data:
  Para{}
  Head{level: U32}
  Bullet{}
  Number{}
  Quote{}
  # What the application shows in the block (a diagram, say): `lang` names it and `source` is its text.
  # The block's own text is the caption.
  Figure{lang: String, source: String}

# align: 0 left, 1 center, 2 right. place: 0 where it is written, 1 at the top of the page.
type Block is Data:
  Block{kind: Form, text: String, align: U32, place: U32}

type Pos is Data:
  Pos{block: Nat, offset: Nat}

type Step is Data:
  Skip{}
  Replace{at: Nat, from: Nat, to: Nat, text: String}
  Split{at: Nat, offset: Nat, kind: Form, align: U32, place: U32}
  Join{at: Nat}
  Insert{at: Nat, block: Block}
  Remove{at: Nat}
  SetKind{at: Nat, kind: Form}
  SetAlign{at: Nat, align: U32}
  SetPlace{at: Nat, place: U32}
  Carry{from: Nat, to: Nat}

# ---------- Schema ----------
# Headings have levels 1 to 3, a block's text has no line break, and align and place are known values.

def fit_level(+l: U32) -> U32:
  Bool.pick(U32, U32.is_lt(l, 1), 1, Bool.pick(U32, U32.is_gt(l, 3), 3, l))

def fit_kind(k: Form) -> Form:
  match k:
    case Head{l}: Head{fit_level(l)}
    case other: other

def fit_align(+a: U32) -> U32:
  Bool.pick(U32, U32.is_gt(a, 2), 0, a)

def fit_place(+p: U32) -> U32:
  Bool.pick(U32, U32.is_gt(p, 1), 0, p)

# Compiled to JavaScript, a def whose last act is to call itself becomes a loop. The defs that walk a text or
# the document are written that way (an answer carried along, `acc` or `back`), so a long text or a long
# document never grows the stack.
def clean.go(s: String, acc: String) -> String:
  match s:
    case SNil{}: acc
    case SCon{Chr{+c}, t}: clean.go(t, acc ++ SCon{Chr{Bool.pick(U32, U32.is_eq(c, 10) || U32.is_eq(c, 13), 32, c)}, SNil{}})

def clean(s: String) -> String:
  clean.go(s, "")

def take.go(s: String, n: Nat, acc: String) -> String:
  match s n:
    case SNil{} _: acc
    case SCon{h, t} 0n: acc
    case SCon{h, t} 1n+k: take.go(t, k, acc ++ SCon{h, SNil{}})

def take(s: String, n: Nat) -> String:
  take.go(s, n, "")

# The blocks in `back` (the nearest first) put again before `rest`.
def unwind(back: List<&2, Block>, rest: List<&2, Block>) -> List<&2, Block>:
  match back:
    case Nil{}: rest
    case h <> t: unwind(t, h <> rest)

def fit(b: Block) -> Block:
  match b:
    case Block{k, t, a, p}: Block{fit_kind(k), clean(t), fit_align(a), fit_place(p)}

def fit_all.go(d: List<&2, Block>, back: List<&2, Block>) -> List<&2, Block>:
  match d:
    case Nil{}: unwind(back, Nil{})
    case h <> t: fit_all.go(t, fit(h) <> back)

def fit_all(d: List<&2, Block>) -> List<&2, Block>:
  fit_all.go(d, Nil{})

# ---------- Reading a document ----------

def count.go(d: List<&2, Block>, n: Nat) -> Nat:
  match d:
    case Nil{}: n
    case h <> t: count.go(t, 1n+n)

def count(d: List<&2, Block>) -> Nat:
  count.go(d, 0n)

# The document opened at a block: the blocks before it (the nearest first) and the ones from it on.
type Cut is Data:
  Cut{back: List<&2, Block>, rest: List<&2, Block>}

def cut_at(d: List<&2, Block>, at: Nat, back: List<&2, Block>) -> Cut:
  match d at:
    case Nil{} _: Cut{back, Nil{}}
    case h <> t 0n: Cut{back, h <> t}
    case h <> t 1n+k: cut_at(t, k, h <> back)

def block_at(d: List<&2, Block>, i: Nat) -> Maybe<&2, Block>:
  match d i:
    case Nil{} _: None{}
    case h <> t 0n: Some{h}
    case h <> t 1n+k: block_at(t, k)

def text_of(m: Maybe<&2, Block>) -> String:
  match m:
    case None{}: ""
    case Some{Block{k, t, a, p}}: t

def kind_of(m: Maybe<&2, Block>) -> Form:
  match m:
    case None{}: Para{}
    case Some{Block{k, t, a, p}}: k

def align_of(m: Maybe<&2, Block>) -> U32:
  match m:
    case None{}: 0
    case Some{Block{k, t, a, p}}: a

def place_of(m: Maybe<&2, Block>) -> U32:
  match m:
    case None{}: 0
    case Some{Block{k, t, a, p}}: p

def text_at(d: List<&2, Block>, i: Nat) -> String:
  text_of(block_at(d, i))

def kind_at(d: List<&2, Block>, i: Nat) -> Form:
  kind_of(block_at(d, i))

def is_figure(k: Form) -> Bool:
  match k:
    case Figure{l, s}: True{}
    case other: False{}

def is_blank(s: String) -> Bool:
  String.is_empty(String.trim(s))

# ---------- Steps ----------

def replace_in(b: Block, +from: Nat, to: Nat, text: String) -> Block:
  match b:
    case Block{k, +t, a, p}: Block{k, take(t, from) ++ clean(text) ++ String.drop(t, Nat.max(from, to)), a, p}

def replace.cut(c: Cut, from: Nat, to: Nat, text: String) -> List<&2, Block>:
  match c:
    case Cut{back, Nil{}}: unwind(back, Nil{})
    case Cut{back, h <> t}: unwind(back, replace_in(h, from, to, text) <> t)

def do_replace(d: List<&2, Block>, at: Nat, from: Nat, to: Nat, text: String) -> List<&2, Block>:
  replace.cut(cut_at(d, at, Nil{}), from, to, text)

def split_block(b: Block, rest: List<&2, Block>, +off: Nat, kind: Form, align: U32, place: U32) -> List<&2, Block>:
  match b:
    case Block{k, +t, a, p}:
      Block{k, take(t, off), a, p} <> Block{fit_kind(kind), String.drop(t, off), fit_align(align), fit_place(place)} <> rest

def split.cut(c: Cut, off: Nat, kind: Form, align: U32, place: U32) -> List<&2, Block>:
  match c:
    case Cut{back, Nil{}}: unwind(back, Nil{})
    case Cut{back, h <> t}: unwind(back, split_block(h, t, off, kind, align, place))

def do_split(d: List<&2, Block>, at: Nat, off: Nat, kind: Form, align: U32, place: U32) -> List<&2, Block>:
  split.cut(cut_at(d, at, Nil{}), off, kind, align, place)

def join_blocks(a: Block, b: Block) -> Block:
  match a b:
    case Block{k, t, al, p} Block{k2, t2, al2, p2}: Block{k, t ++ t2, al, p}

def join.cut(c: Cut) -> List<&2, Block>:
  match c:
    case Cut{back, a <> b <> t}: unwind(back, join_blocks(a, b) <> t)
    case Cut{back, rest}: unwind(back, rest)

# The block `at` joins the one before it; the first block has none.
def do_join(d: List<&2, Block>, at: Nat) -> List<&2, Block>:
  match d at:
    case d 0n: d
    case d 1n+k: join.cut(cut_at(d, k, Nil{}))

def insert.cut(c: Cut, b: Block) -> List<&2, Block>:
  match c:
    case Cut{back, rest}: unwind(back, fit(b) <> rest)

def do_insert(d: List<&2, Block>, at: Nat, b: Block) -> List<&2, Block>:
  insert.cut(cut_at(d, at, Nil{}), b)

def remove.cut(c: Cut) -> List<&2, Block>:
  match c:
    case Cut{back, Nil{}}: unwind(back, Nil{})
    case Cut{back, h <> t}: unwind(back, t)

def do_remove(d: List<&2, Block>, at: Nat) -> List<&2, Block>:
  remove.cut(cut_at(d, at, Nil{}))

def kind.cut(c: Cut, kind: Form) -> List<&2, Block>:
  match c:
    case Cut{back, Block{k, t, a, p} <> rest}: unwind(back, Block{fit_kind(kind), t, a, p} <> rest)
    case Cut{back, rest}: unwind(back, rest)

def do_kind(d: List<&2, Block>, at: Nat, kind: Form) -> List<&2, Block>:
  kind.cut(cut_at(d, at, Nil{}), kind)

def align.cut(c: Cut, align: U32) -> List<&2, Block>:
  match c:
    case Cut{back, Block{k, t, a, p} <> rest}: unwind(back, Block{k, t, fit_align(align), p} <> rest)
    case Cut{back, rest}: unwind(back, rest)

def do_align(d: List<&2, Block>, at: Nat, align: U32) -> List<&2, Block>:
  align.cut(cut_at(d, at, Nil{}), align)

def place.cut(c: Cut, place: U32) -> List<&2, Block>:
  match c:
    case Cut{back, Block{k, t, a, p} <> rest}: unwind(back, Block{k, t, a, fit_place(place)} <> rest)
    case Cut{back, rest}: unwind(back, rest)

def do_place(d: List<&2, Block>, at: Nat, place: U32) -> List<&2, Block>:
  place.cut(cut_at(d, at, Nil{}), place)

def move_put(rest: List<&2, Block>, to: Nat, b: Maybe<&2, Block>) -> List<&2, Block>:
  match b:
    case None{}: rest
    case Some{x}: do_insert(rest, to, x)

def do_move(+d: List<&2, Block>, +from: Nat, to: Nat) -> List<&2, Block>:
  move_put(do_remove(d, from), to, block_at(d, from))

def apply(d: List<&2, Block>, s: Step) -> List<&2, Block>:
  match s:
    case Skip{}: d
    case Replace{at, from, to, text}: do_replace(d, at, from, to, text)
    case Split{at, off, k, a, p}: do_split(d, at, off, k, a, p)
    case Join{at}: do_join(d, at)
    case Insert{at, b}: do_insert(d, at, b)
    case Remove{at}: do_remove(d, at)
    case SetKind{at, k}: do_kind(d, at, k)
    case SetAlign{at, a}: do_align(d, at, a)
    case SetPlace{at, p}: do_place(d, at, p)
    case Carry{from, to}: do_move(d, from, to)

def replay(steps: List<&2, Step>, d: List<&2, Block>) -> List<&2, Block>:
  match steps:
    case Nil{}: d
    case s <> t: replay(t, apply(d, s))

# ---------- The inverse of a step ----------
# invert(d, s) undoes s on the document d it was applied to. A step that changes nothing has the inverse Skip.

def inv_replace(m: Maybe<&2, Block>, at: Nat, +from: Nat, to: Nat, len: Nat) -> Step:
  match m:
    case None{}: Skip{}
    case Some{Block{k, +t, a, p}}:
      Replace{at, Nat.min(from, String.length(t)), (Nat.min(from, String.length(t)) + len : Nat),
        take(String.drop(t, from), Nat.sub(Nat.max(from, to), from))}

def inv_split(m: Maybe<&2, Block>, at: Nat) -> Step:
  match m:
    case None{}: Skip{}
    case Some{b}: Join{1n+at}

def inv_join(prev: Maybe<&2, Block>, cur: Maybe<&2, Block>, k: Nat) -> Step:
  match prev cur:
    case Some{Block{k0, t0, a0, p0}} Some{Block{k1, t1, a1, p1}}: Split{k, String.length(t0), k1, a1, p1}
    case _ _: Skip{}

def inv_join.before(+k: Nat, +d: List<&2, Block>) -> Step:
  inv_join(block_at(d, k), block_at(d, 1n+k), k)

def inv_join.at(at: Nat, d: List<&2, Block>) -> Step:
  match at:
    case 0n: Skip{}
    case 1n+k: inv_join.before(k, d)

def inv_remove(m: Maybe<&2, Block>, at: Nat) -> Step:
  match m:
    case None{}: Skip{}
    case Some{b}: Insert{at, b}

def inv_kind(m: Maybe<&2, Block>, at: Nat) -> Step:
  match m:
    case None{}: Skip{}
    case Some{Block{k, t, a, p}}: SetKind{at, k}

def inv_align(m: Maybe<&2, Block>, at: Nat) -> Step:
  match m:
    case None{}: Skip{}
    case Some{Block{k, t, a, p}}: SetAlign{at, a}

def inv_place(m: Maybe<&2, Block>, at: Nat) -> Step:
  match m:
    case None{}: Skip{}
    case Some{Block{k, t, a, p}}: SetPlace{at, p}

def inv_move(m: Maybe<&2, Block>, from: Nat, to: Nat, n: Nat) -> Step:
  match m:
    case None{}: Skip{}
    case Some{b}: Carry{Nat.min(to, Nat.sub(n, 1n)), from}

def invert(+d: List<&2, Block>, s: Step) -> Step:
  match s:
    case Skip{}: Skip{}
    case Replace{+at, +from, to, text}: inv_replace(block_at(d, at), at, from, to, String.length(clean(text)))
    case Split{+at, off, k, a, p}: inv_split(block_at(d, at), at)
    case Join{at}: inv_join.at(at, d)
    case Insert{at, b}: Remove{Nat.min(at, count(d))}
    case Remove{+at}: inv_remove(block_at(d, at), at)
    case SetKind{+at, k}: inv_kind(block_at(d, at), at)
    case SetAlign{+at, a}: inv_align(block_at(d, at), at)
    case SetPlace{+at, p}: inv_place(block_at(d, at), at)
    case Carry{+from, to}: inv_move(block_at(d, from), from, to, count(d))

# ---------- Where a position goes ----------
# map_pos(d, s, p) is where p of the document d is after the step s.

def shift(+o: Nat, +from: Nat, +to: Nat, +len: Nat) -> Nat:
  Bool.pick(Nat, Nat.is_lt(o, from), o,
    Bool.pick(Nat, Nat.is_lt(o, to), (from + len : Nat), (Nat.sub(o, to) + from + len : Nat)))

def map_replace(p: Pos, at: Nat, from: Nat, to: Nat, len: Nat) -> Pos:
  match p:
    case Pos{+b, +o}: Bool.pick(Pos, Nat.is_eq(b, at), Pos{b, shift(o, from, to, len)}, Pos{b, o})

def map_split.go(c: Cmp, +b: Nat, +o: Nat, +off: Nat) -> Pos:
  match c:
    case LT{}: Pos{b, o}
    case EQ{}: Bool.pick(Pos, Nat.is_lt(o, off), Pos{b, o}, Pos{1n+b, Nat.sub(o, off)})
    case GT{}: Pos{1n+b, o}

def map_split(p: Pos, at: Nat, off: Nat) -> Pos:
  match p:
    case Pos{+b, o}: map_split.go(Nat.cmp(b, at), b, o, off)

def map_join.go(c: Cmp, +b: Nat, +o: Nat, len: Nat) -> Pos:
  match c:
    case LT{}: Pos{b, o}
    case EQ{}: Pos{Nat.sub(b, 1n), (len + o : Nat)}
    case GT{}: Pos{Nat.sub(b, 1n), o}

def map_join(p: Pos, at: Nat, len: Nat) -> Pos:
  match p at:
    case q 0n: q
    case Pos{+b, o} 1n+k: map_join.go(Nat.cmp(b, 1n+k), b, o, len)

def map_insert(p: Pos, at: Nat) -> Pos:
  match p:
    case Pos{+b, o}: Pos{Bool.pick(Nat, Nat.is_lt(b, at), b, 1n+b), o}

def map_remove.go(c: Cmp, +b: Nat, o: Nat) -> Pos:
  match c:
    case LT{}: Pos{b, o}
    case EQ{}: Pos{b, 0n}
    case GT{}: Pos{Nat.sub(b, 1n), o}

def map_remove(p: Pos, at: Nat) -> Pos:
  match p:
    case Pos{+b, o}: map_remove.go(Nat.cmp(b, at), b, o)

def map_move.block(+b: Nat, +from: Nat, +to: Nat) -> Nat:
  Bool.pick(Nat, Nat.is_eq(b, from), to,
    Bool.pick(Nat, Nat.is_lt(from, b) && Nat.is_le(b, to), Nat.sub(b, 1n),
      Bool.pick(Nat, Nat.is_le(to, b) && Nat.is_lt(b, from), 1n+b, b)))

def map_move(p: Pos, from: Nat, to: Nat) -> Pos:
  match p:
    case Pos{b, o}: Pos{map_move.block(b, from, to), o}

def map_pos(+d: List<&2, Block>, s: Step, p: Pos) -> Pos:
  match s:
    case Skip{}: p
    case Replace{at, +from, to, text}: map_replace(p, at, from, Nat.max(from, to), String.length(clean(text)))
    case Split{at, off, k, a, q}: map_split(p, at, off)
    case Join{+at}: map_join(p, at, String.length(text_at(d, Nat.sub(at, 1n))))
    case Insert{at, b}: map_insert(p, Nat.min(at, count(d)))
    case Remove{at}: map_remove(p, at)
    case SetKind{at, k}: p
    case SetAlign{at, a}: p
    case SetPlace{at, q}: p
    case Carry{from, to}: map_move(p, from, Nat.min(to, Nat.sub(count(d), 1n)))

# ---------- Lists of steps ----------

def pour(back: List<&2, Step>, rest: List<&2, Step>) -> List<&2, Step>:
  match back:
    case Nil{}: rest
    case h <> t: pour(t, h <> rest)

# The steps of `a`, then the steps of `b`.
def steps(a: List<&2, Step>, b: List<&2, Step>) -> List<&2, Step>:
  pour(List.reverse(&2, Step, a), b)

def repeat.go(n: Nat, +s: Step, acc: List<&2, Step>) -> List<&2, Step>:
  match n:
    case 0n: acc
    case 1n+k: repeat.go(k, s, s <> acc)

def repeat(n: Nat, s: Step) -> List<&2, Step>:
  repeat.go(n, s, Nil{})

# ---------- History ----------
# An entry is one thing the person did: its steps, the steps that undo them, and the caret before and after.

type Entry is Data:
  Entry{forward: List<&2, Step>, backward: List<&2, Step>, before: Pos, after: Pos, typing: Bool, time: U32}

type Editor is Data:
  Editor{doc: List<&2, Block>, undo: List<&2, Entry>, redo: List<&2, Entry>, caret: Pos}

type Played is Data:
  Played{doc: List<&2, Block>, back: List<&2, Step>}

# What a command answers: the steps to make and where the caret goes.
type Plan is Data:
  Plan{steps: List<&2, Step>, caret: Pos}

def play(steps: List<&2, Step>, +d: List<&2, Block>, back: List<&2, Step>) -> Played:
  match steps:
    case Nil{}: Played{d, back}
    case +s <> t: play(t, apply(d, s), invert(d, s) <> back)

def pos_eq(a: Pos, b: Pos) -> Bool:
  match a b:
    case Pos{b0, o0} Pos{b1, o1}: Nat.is_eq(b0, b1) && Nat.is_eq(o0, o1)

# Typing that goes on where the last typing stopped, within a second, is one entry: undo takes the run.
def mergeable(a: Entry, b: Entry) -> Bool:
  match a b:
    case Entry{f0, b0, bef0, aft0, ty0, t0} Entry{f1, b1, bef1, aft1, ty1, t1}:
      ty0 && ty1 && pos_eq(aft0, bef1) && U32.is_lt(U32.sub(t1, t0), 1000)

def merge(a: Entry, b: Entry) -> Entry:
  match a b:
    case Entry{f0, b0, bef0, aft0, ty0, t0} Entry{f1, b1, bef1, aft1, ty1, t1}:
      Entry{steps(f0, f1), steps(b1, b0), bef0, aft1, ty1, t1}

def push(u: List<&2, Entry>, +e: Entry) -> List<&2, Entry>:
  match u:
    case Nil{}: [e]
    case +h <> +t: Bool.pick(List<&2, Entry>, mergeable(h, e), merge(h, e) <> t, e <> h <> t)

def commit.put(pl: Played, steps: List<&2, Step>, u: List<&2, Entry>, before: Pos, +after: Pos, typing: Bool, time: U32) -> Editor:
  match pl:
    case Played{d, back}: Editor{d, push(u, Entry{steps, back, before, after, typing, time}), Nil{}, after}

# Make the plan's steps and remember them as one entry.
def commit(e: Editor, before: Pos, plan: Plan, typing: Bool, time: U32) -> Editor:
  match e plan:
    case Editor{+d, u, r, c} Plan{+steps, after}: commit.put(play(steps, d, Nil{}), steps, u, before, after, typing, time)

# The same, but a plan with no steps leaves the history as it is.
def commit_some(+e: Editor, before: Pos, plan: Plan, typing: Bool, time: U32) -> Editor:
  match plan:
    case Plan{Nil{}, after}: e
    case Plan{steps, after}: commit(e, before, Plan{steps, after}, typing, time)

# The last two entries become one (a command made of two). An entry with no steps is dropped.
def fuse.keep(e: Entry, u: List<&2, Entry>) -> List<&2, Entry>:
  match e:
    case Entry{Nil{}, b, bef, aft, ty, t}: u
    case other: other <> u

def fuse(e: Editor) -> Editor:
  match e:
    case Editor{d, Entry{f1, b1, bef1, aft1, ty1, t1} <> Entry{f0, b0, bef0, aft0, ty0, t0} <> u, r, c}:
      Editor{d, fuse.keep(Entry{steps(f0, f1), steps(b1, b0), bef0, aft1, False{}, t1}, u), r, c}
    case other: other

def undo(e: Editor) -> Editor:
  match e:
    case Editor{d, Entry{f, +b, +bef, aft, ty, t} <> u, r, c}:
      Editor{replay(b, d), u, Entry{f, b, bef, aft, False{}, t} <> r, bef}
    case other: other

def redo(e: Editor) -> Editor:
  match e:
    case Editor{d, u, Entry{+f, b, bef, +aft, ty, t} <> r, c}:
      Editor{replay(f, d), Entry{f, b, bef, aft, False{}, t} <> u, r, aft}
    case other: other

def doc(e: Editor) -> List<&2, Block>:
  match e:
    case Editor{d, u, r, c}: d

def caret(e: Editor) -> Pos:
  match e:
    case Editor{d, u, r, c}: c

def can_undo(e: Editor) -> Bool:
  match e:
    case Editor{d, Nil{}, r, c}: False{}
    case other: True{}

def can_redo(e: Editor) -> Bool:
  match e:
    case Editor{d, u, Nil{}, c}: False{}
    case other: True{}

# A document always has a block to write in.
def start(d: List<&2, Block>) -> Editor:
  match d:
    case Nil{}: Editor{[Block{Para{}, "", 0, 0}], Nil{}, Nil{}, Pos{0n, 0n}}
    case h <> t: Editor{fit_all(h <> t), Nil{}, Nil{}, Pos{0n, 0n}}

# Change the document without an entry (what the application refreshes by itself, not the person).
def put_doc(e: Editor, d: List<&2, Block>) -> Editor:
  match e:
    case Editor{old, u, r, c}: Editor{d, u, r, c}

# ---------- Commands ----------

# Typing: the smallest replacement that turns the old text into the new one.
# How many letters two texts share at their start. It walks to the end of the shorter one.
def prefix.go(a: String, b: String, +n: Nat, same: Bool) -> Nat:
  match a b:
    case SCon{Chr{x}, ta} SCon{Chr{y}, tb}:
      +ok = same && U32.is_eq(x, y)
      prefix.go(ta, tb, Bool.pick(Nat, ok, 1n+n, n), ok)
    case _ _: n

def prefix(a: String, b: String) -> Nat:
  prefix.go(a, b, 0n, True{})

def diff(at: Nat, +old: String, +new: String) -> Step:
  +p = prefix(old, new)
  +s = prefix(String.reverse(String.drop(old, p)), String.reverse(String.drop(new, p)))
  Replace{at, p, Nat.sub(String.length(old), s), take(String.drop(new, p), Nat.sub(Nat.sub(String.length(new), p), s))}

def diff_end(s: Step) -> Nat:
  match s:
    case Replace{at, from, to, text}: to
    case other: 0n

# Markdown shortcuts: what a paragraph becomes when its text starts like this, and how many letters go.
type Mark is Data:
  Mark{kind: Form, size: Nat}

def marker(+t: String) -> Mark:
  Bool.pick(Mark, String.starts_with(t, "### "), Mark{Head{3}, 4n},
    Bool.pick(Mark, String.starts_with(t, "## "), Mark{Head{2}, 3n},
      Bool.pick(Mark, String.starts_with(t, "# "), Mark{Head{1}, 2n},
        Bool.pick(Mark, String.starts_with(t, "- ") || String.starts_with(t, "* "), Mark{Bullet{}, 2n},
          Bool.pick(Mark, String.starts_with(t, "> "), Mark{Quote{}, 2n},
            Bool.pick(Mark, String.starts_with(t, "1. "), Mark{Number{}, 3n},
              Mark{Para{}, 0n}))))))

def shortcut(k: Form, t: String) -> Mark:
  match k:
    case Para{}: marker(t)
    case other: Mark{Para{}, 0n}

def typed(m: Mark, +at: Nat, change: Step) -> List<&2, Step>:
  match m:
    case Mark{k, 0n}: [change]
    case Mark{k, n}: [change, SetKind{at, k}, Replace{at, 0n, n, ""}]

def mark_size(m: Mark) -> Nat:
  match m:
    case Mark{k, n}: n

def write.go(e: Editor, +at: Nat, +change: Step, +m: Mark, offset: Nat, time: U32) -> Editor:
  commit(e, Pos{at, diff_end(change)}, Plan{typed(m, at, change), Pos{at, Nat.sub(offset, mark_size(m))}}, True{}, time)

# The person typed in the block `at`: its text is now `text` and the caret is at `offset`.
def write(e: Editor, +at: Nat, +text: String, offset: Nat, time: U32) -> Editor:
  match e:
    case Editor{+d, u, r, c}:
      write.go(Editor{d, u, r, c}, at, diff(at, text_at(d, at), clean(text)), shortcut(kind_at(d, at), text), offset, time)

# Take out what is selected, from one position to a later one.
def range.many(first: Bool, last: Bool, +fb: Nat, +fo: Nat, mid: Nat, te: Nat, len: Nat) -> Plan:
  match first last:
    case False{} False{}:
      Plan{Replace{fb, fo, len, ""} <> steps(repeat(mid, Remove{1n+fb}), [Replace{1n+fb, 0n, te, ""}, Join{1n+fb}]), Pos{fb, fo}}
    case False{} True{}:
      Plan{Replace{fb, fo, len, ""} <> repeat(mid, Remove{1n+fb}), Pos{fb, fo}}
    case True{} False{}:
      Plan{steps(repeat(mid, Remove{1n+fb}), [Replace{1n+fb, 0n, te, ""}]), Pos{1n+fb, 0n}}
    case True{} True{}:
      Plan{repeat(mid, Remove{1n+fb}), Pos{1n+fb, 0n}}

def range.go(c: Cmp, +d: List<&2, Block>, +fb: Nat, +fo: Nat, +tb: Nat, +te: Nat) -> Plan:
  match c:
    case EQ{}: Plan{Bool.pick(List<&2, Step>, Nat.is_lt(fo, te), [Replace{fb, fo, te, ""}], Nil{}), Pos{fb, fo}}
    case GT{}: Plan{Nil{}, Pos{fb, fo}}
    case LT{}:
      range.many(is_figure(kind_at(d, fb)), is_figure(kind_at(d, tb)), fb, fo, Nat.sub(Nat.sub(tb, fb), 1n), te, String.length(text_at(d, fb)))

def range(d: List<&2, Block>, from: Pos, to: Pos) -> Plan:
  match from to:
    case Pos{+fb, fo} Pos{+tb, te}: range.go(Nat.cmp(fb, tb), d, fb, fo, tb, te)

def cut_always(e: Editor, from: Pos, +to: Pos, time: U32) -> Editor:
  match e:
    case Editor{+d, u, r, c}: commit(Editor{d, u, r, c}, to, range(d, from, to), False{}, time)

def cut(e: Editor, from: Pos, +to: Pos, time: U32) -> Editor:
  match e:
    case Editor{+d, u, r, c}: commit_some(Editor{d, u, r, c}, to, range(d, from, to), False{}, time)

# Enter. In a list, the next item; an empty item leaves the list. After a heading or a quote, a paragraph.
# In a figure's caption, a paragraph under the figure.
def enter.text(+k: Form, +next: Form, +t: String, +b: Nat, +o: Nat, +a: U32, +p: U32) -> Plan:
  match k:
    case Para{}: Plan{[Split{b, o, next, a, p}], Pos{1n+b, 0n}}
    case other:
      Bool.pick(Plan, String.is_empty(t), Plan{[SetKind{b, Para{}}], Pos{b, 0n}},
        Bool.pick(Plan, Nat.is_eq(o, 0n), Plan{[Insert{b, Block{Para{}, "", a, p}}], Pos{1n+b, 0n}},
          Plan{[Split{b, o, next, a, p}], Pos{1n+b, 0n}}))

def enter.kind(+k: Form, t: String, +b: Nat, o: Nat, a: U32, p: U32) -> Plan:
  match k:
    case Figure{l, s}: Plan{[Insert{1n+b, Block{Para{}, "", 0, 0}}], Pos{1n+b, 0n}}
    case Bullet{}: enter.text(k, Bullet{}, t, b, o, a, p)
    case Number{}: enter.text(k, Number{}, t, b, o, a, p)
    case other: enter.text(k, Para{}, t, b, o, a, p)

def enter.plan(+m: Maybe<&2, Block>, +b: Nat, o: Nat) -> Plan:
  enter.kind(kind_of(m), text_of(m), b, o, align_of(m), place_of(m))

def enter_here(e: Editor, time: U32) -> Editor:
  match e:
    case Editor{+d, u, r, Pos{+b, +o}}: commit(Editor{d, u, r, Pos{b, o}}, Pos{b, o}, enter.plan(block_at(d, b), b, o), False{}, time)

def enter(e: Editor, from: Pos, to: Pos, +time: U32) -> Editor:
  fuse(enter_here(cut_always(e, from, to, time), time))

# Text put at the caret (a letter typed over a selection, a line pasted).
def put_here(e: Editor, +text: String, time: U32) -> Editor:
  match e:
    case Editor{d, u, r, Pos{+b, +o}}:
      commit(Editor{d, u, r, Pos{b, o}}, Pos{b, o}, Plan{[Replace{b, o, o, text}], Pos{b, (o + String.length(text) : Nat)}}, False{}, time)

def put(e: Editor, from: Pos, to: Pos, text: String, +time: U32) -> Editor:
  fuse(put_here(cut_always(e, from, to, time), text, time))

# Backspace at the start of a block: a heading, a list item or a quote turns into a paragraph;
# a paragraph joins the block before it. After a figure, an empty paragraph that is not the last goes away.
def back.join(prev: Form, +t: String, +b: Nat, len: Nat, more: Bool) -> Plan:
  match prev:
    case Figure{l, s}: Plan{Bool.pick(List<&2, Step>, is_blank(t) && more, [Remove{b}], Nil{}), Pos{b, 0n}}
    case other: Plan{[Join{b}], Pos{Nat.sub(b, 1n), len}}

def back.kind(k: Form, +d: List<&2, Block>, +b: Nat) -> Plan:
  match k b:
    case Figure{l, s} _: Plan{Nil{}, Pos{b, 0n}}
    case Para{} 0n: Plan{Nil{}, Pos{0n, 0n}}
    case Para{} 1n+j: back.join(kind_at(d, j), text_at(d, 1n+j), 1n+j, String.length(text_at(d, j)), Nat.is_lt(2n+j, count(d)))
    case other _: Plan{[SetKind{b, Para{}}], Pos{b, 0n}}

def back_here(e: Editor, +b: Nat, time: U32) -> Editor:
  match e:
    case Editor{+d, u, r, c}: commit_some(Editor{d, u, r, c}, Pos{b, 0n}, back.kind(kind_at(d, b), d, b), False{}, time)

def backspace.go(e: Editor, from: Pos, to: Pos, same: Bool, time: U32) -> Editor:
  match from same:
    case Pos{b, o} True{}: back_here(e, b, time)
    case f False{}: cut(e, f, to, time)

# Backspace with the caret at the start of a block (from = to), or with a selection.
def backspace(e: Editor, +from: Pos, +to: Pos, time: U32) -> Editor:
  backspace.go(e, from, to, pos_eq(from, to), time)

# Delete at the end of a block: the next block joins it. A figure never joins.
def del.plan(k: Form, next: Maybe<&2, Block>, +b: Nat, +o: Nat) -> Plan:
  match k next:
    case Figure{l, s} _: Plan{Nil{}, Pos{b, o}}
    case other None{}: Plan{Nil{}, Pos{b, o}}
    case other Some{Block{Figure{l, s}, t, a, p}}: Plan{Nil{}, Pos{b, o}}
    case other Some{n}: Plan{[Join{1n+b}], Pos{b, o}}

def del_here(e: Editor, +b: Nat, +o: Nat, time: U32) -> Editor:
  match e:
    case Editor{+d, u, r, c}: commit_some(Editor{d, u, r, c}, Pos{b, o}, del.plan(kind_at(d, b), block_at(d, 1n+b), b, o), False{}, time)

def delete.go(e: Editor, from: Pos, to: Pos, same: Bool, time: U32) -> Editor:
  match from same:
    case Pos{b, o} True{}: del_here(e, b, o, time)
    case f False{}: cut(e, f, to, time)

# Delete with the caret at the end of a block (from = to), or with a selection.
def delete(e: Editor, +from: Pos, +to: Pos, time: U32) -> Editor:
  delete.go(e, from, to, pos_eq(from, to), time)

# Blocks put in the document, one after the other, starting at `at`.
def inserts.go(bs: List<&2, Block>, +at: Nat, acc: List<&2, Step>) -> List<&2, Step>:
  match bs:
    case Nil{}: List.reverse(&2, Step, acc)
    case h <> t: inserts.go(t, 1n+at, Insert{at, h} <> acc)

def inserts(bs: List<&2, Block>, at: Nat) -> List<&2, Step>:
  inserts.go(bs, at, Nil{})

def last_length(bs: List<&2, Block>, len: Nat) -> Nat:
  match bs:
    case Nil{}: len
    case Block{k, t, a, p} <> rest: last_length(rest, String.length(t))

# Blocks pasted at the caret. One paragraph goes into the text; more go under the block, or take its
# place when it is an empty paragraph.
def paste.plan(+bs: List<&2, Block>, +k: Form, +t: String, +b: Nat, +o: Nat) -> Plan:
  match bs:
    case Nil{}: Plan{Nil{}, Pos{b, o}}
    case Block{Para{}, +x, a, p} <> Nil{}: Plan{[Replace{b, o, o, x}], Pos{b, (o + String.length(x) : Nat)}}
    case other:
      Bool.pick(Plan, is_blank(t) && Bool.not(is_figure(k)),
        Plan{Remove{b} <> inserts(bs, b), Pos{Nat.sub((b + count(bs) : Nat), 1n), last_length(bs, 0n)}},
        Plan{inserts(bs, 1n+b), Pos{(b + count(bs) : Nat), last_length(bs, 0n)}})

def paste_here(e: Editor, bs: List<&2, Block>, time: U32) -> Editor:
  match e:
    case Editor{+d, u, r, Pos{+b, +o}}:
      commit(Editor{d, u, r, Pos{b, o}}, Pos{b, o}, paste.plan(fit_all(bs), kind_at(d, b), text_at(d, b), b, o), False{}, time)

def paste(e: Editor, from: Pos, to: Pos, bs: List<&2, Block>, +time: U32) -> Editor:
  fuse(paste_here(cut_always(e, from, to, time), bs, time))

# A figure put at the caret's block: in its place when it is an empty paragraph, under it otherwise.
# A paragraph always follows a figure, so there is somewhere to write after it.
def figure.tail(next: Maybe<&2, Block>, +at: Nat) -> List<&2, Step>:
  match next:
    case None{}: [Insert{at, Block{Para{}, "", 0, 0}}]
    case Some{Block{Figure{l, s}, t, a, p}}: [Insert{at, Block{Para{}, "", 0, 0}}]
    case other: Nil{}

def figure.plan(+f: Block, k: Form, t: String, +b: Nat, +next: Maybe<&2, Block>) -> Plan:
  Bool.pick(Plan, is_blank(t) && Bool.not(is_figure(k)),
    Plan{Remove{b} <> Insert{b, f} <> figure.tail(next, 1n+b), Pos{1n+b, 0n}},
    Plan{Insert{1n+b, f} <> figure.tail(next, 2n+b), Pos{2n+b, 0n}})

def insert_figure(e: Editor, +c: Pos, lang: String, source: String, time: U32) -> Editor:
  match e c:
    case Editor{+d, u, r, old} Pos{+b, o}:
      commit(Editor{d, u, r, old}, c, figure.plan(Block{Figure{lang, source}, "", 0, 0}, kind_at(d, b), text_at(d, b), b, block_at(d, 1n+b)), False{}, time)

# Take a block out. The document keeps a block to write in.
def remove.plan(m: Maybe<&2, Block>, +at: Nat, n: Nat) -> Plan:
  match m n:
    case None{} _: Plan{Nil{}, Pos{at, 0n}}
    case Some{b} 1n: Plan{[Remove{at}, Insert{0n, Block{Para{}, "", 0, 0}}], Pos{0n, 0n}}
    case Some{b} _: Plan{[Remove{at}], Pos{Nat.sub(at, 1n), 0n}}

def remove_block(e: Editor, +at: Nat, time: U32) -> Editor:
  match e:
    case Editor{+d, u, r, c}: commit_some(Editor{d, u, r, c}, Pos{at, 0n}, remove.plan(block_at(d, at), at, count(d)), False{}, time)

def set_kind(e: Editor, +c: Pos, at: Nat, kind: Form, time: U32) -> Editor:
  commit(e, c, Plan{[SetKind{at, kind}], c}, False{}, time)

def set_align(e: Editor, +c: Pos, at: Nat, align: U32, time: U32) -> Editor:
  commit(e, c, Plan{[SetAlign{at, align}], c}, False{}, time)

def set_place(e: Editor, +c: Pos, at: Nat, place: U32, time: U32) -> Editor:
  commit(e, c, Plan{[SetPlace{at, place}], c}, False{}, time)

def move.go(e: Editor, +c: Pos, +from: Nat, +to: Nat, +d: List<&2, Block>, time: U32) -> Editor:
  commit(e, c, Plan{[Carry{from, to}], map_pos(d, Carry{from, to}, c)}, False{}, time)

def move(e: Editor, c: Pos, from: Nat, to: Nat, time: U32) -> Editor:
  match e:
    case Editor{+d, u, r, old}: move.go(Editor{d, u, r, old}, c, from, to, d, time)
