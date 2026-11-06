# Bend-UI syntax: cuts Bend code into pieces, each with a kind, for a code box to color.
# Pure; syntax.js draws each piece as a span. The colors are tokens (TOKENS.bend: syntax_*).
#
# Kinds: 0 plain (names, spaces), 1 keyword, 2 type or constructor (capitalized), 3 string,
#        4 number, 5 comment, 6 punctuation, 7 the name a def, law or type gives.

import Base

type Piece is Data:
  Piece{kind: U32, text: String}

def plain() -> U32: 0
def keyword() -> U32: 1
def kind_type() -> U32: 2
def string() -> U32: 3
def number() -> U32: 4
def comment() -> U32: 5
def punct() -> U32: 6
def defined() -> U32: 7

def pick(c: Bool, a: U32, b: U32) -> U32:
  match c:
    case True{}:
      a
    case False{}:
      b

def is_keyword(+w: String) -> Bool:
  (String.eq(w, "def") || String.eq(w, "law") || String.eq(w, "type") || String.eq(w, "for")
    || String.eq(w, "exs") || String.eq(w, "where") || String.eq(w, "match") || String.eq(w, "case")
    || String.eq(w, "import") || String.eq(w, "as") || String.eq(w, "is") || String.eq(w, "do")
    || String.eq(w, "return"))

# After def, law or type, the next word is the name being given.
def names_next(+w: String) -> Bool:
  (String.eq(w, "def") || String.eq(w, "law") || String.eq(w, "type"))

def pick_bool(c: Bool, a: Bool, b: Bool) -> Bool:
  match c:
    case True{}:
      a
    case False{}:
      b

def starts(+w: String, +upper: Bool) -> Bool:
  match w:
    case SNil{}:
      False{}
    case SCon{+h, t}:
      pick_bool(upper, Char.is_upper(h), Char.is_digit(h))

def classify(+w: String, after: Bool) -> U32:
  pick(is_keyword(w), keyword(),
  pick(starts(w, True{}), kind_type(),
  pick(starts(w, False{}), number(),
  pick(after, defined(), plain()))))

# A word is letters, digits, _ and . (Bend's names: String.eq, Nat 3n, 1.5).
def is_word(+c: Char) -> Bool:
  (Char.is_alpha(c) || Char.is_digit(c) || Char.is_eq(c, '_') || Char.is_eq(c, '.'))

# The word being read ends: it becomes a piece (cur is the word backwards).
def flush.at(empty: Bool, +cur: String, after: Bool, pieces: List<&2, Piece>) -> Bool & List<&2, Piece>:
  match empty:
    case True{}:
      (after, pieces)
    case False{}:
      (names_next(String.reverse(cur)), Piece{classify(String.reverse(cur), after), String.reverse(cur)} <> pieces)

def flush(+cur: String, after: Bool, pieces: List<&2, Piece>) -> Bool & List<&2, Piece>:
  flush.at(String.is_empty(cur), cur, after, pieces)

def one(+c: Char) -> String:
  SCon{c, SNil{}}

# The state after one character: (mode, cur backwards, after a def/law/type, pieces backwards).
# Modes: 0 code, 1 inside a string, 2 inside a comment.
def code.other(+c: Char, flushed: Bool & List<&2, Piece>) -> U32 & (String & (Bool & List<&2, Piece>)):
  (after, pieces) = flushed
  (0, ("", (after, Piece{pick(Char.is_space(c), plain(), punct()), one(c)} <> pieces)))

def code.opens(+c: Char, quote: Bool, hash: Bool, flushed: Bool & List<&2, Piece>) -> U32 & (String & (Bool & List<&2, Piece>)):
  match quote hash:
    case True{} _:
      (1, (one(c), flushed))
    case False{} True{}:
      (2, (one(c), flushed))
    case False{} False{}:
      code.other(c, flushed)

def code.at(word: Bool, +c: Char, +cur: String, after: Bool, pieces: List<&2, Piece>) -> U32 & (String & (Bool & List<&2, Piece>)):
  match word:
    case True{}:
      (0, (SCon{c, cur}, (after, pieces)))
    case False{}:
      code.opens(c, Char.is_eq(c, '"'), Char.is_eq(c, '#'), flush(cur, after, pieces))

def in_string(ends: Bool, +c: Char, +cur: String, after: Bool, pieces: List<&2, Piece>) -> U32 & (String & (Bool & List<&2, Piece>)):
  match ends:
    case True{}:
      (0, ("", (after, Piece{string(), String.reverse(SCon{c, cur})} <> pieces)))
    case False{}:
      (1, (SCon{c, cur}, (after, pieces)))

def in_comment(ends: Bool, +c: Char, +cur: String, after: Bool, pieces: List<&2, Piece>) -> U32 & (String & (Bool & List<&2, Piece>)):
  match ends:
    case True{}:
      (0, ("", (after, Piece{plain(), one(c)} <> (Piece{comment(), String.reverse(cur)} <> pieces))))
    case False{}:
      (2, (SCon{c, cur}, (after, pieces)))

def step.go(+c: Char, mode: U32, +cur: String, after: Bool, pieces: List<&2, Piece>) -> U32 & (String & (Bool & List<&2, Piece>)):
  match mode:
    case 0:
      code.at(is_word(c), c, cur, after, pieces)
    case 1:
      in_string(Char.is_eq(c, '"'), c, cur, after, pieces)
    case n:
      in_comment(Char.is_eq(c, '\n'), c, cur, after, pieces)

def step(+c: Char, state: U32 & (String & (Bool & List<&2, Piece>))) -> U32 & (String & (Bool & List<&2, Piece>)):
  (mode, rest) = state
  (cur, rest2) = rest
  (after, pieces) = rest2
  step.go(c, mode, cur, after, pieces)

def snd(p: Bool & List<&2, Piece>) -> List<&2, Piece>:
  (a, b) = p
  b

# The text ends: what was being read becomes its last piece.
def finish.go(mode: U32, +cur: String, after: Bool, pieces: List<&2, Piece>) -> List<&2, Piece>:
  match mode:
    case 0:
      snd(flush(cur, after, pieces))
    case 1:
      Piece{string(), String.reverse(cur)} <> pieces
    case n:
      Piece{comment(), String.reverse(cur)} <> pieces

def finish(state: U32 & (String & (Bool & List<&2, Piece>))) -> List<&2, Piece>:
  (mode, rest) = state
  (cur, rest2) = rest
  (after, pieces) = rest2
  List.reverse(&2, Piece, finish.go(mode, cur, after, pieces))

# One pass, a character at a time (tail calls: a file may be long).
def scan(s: String, state: U32 & (String & (Bool & List<&2, Piece>))) -> List<&2, Piece>:
  match s:
    case SNil{}:
      finish(state)
    case SCon{+h, t}:
      scan(t, step(h, state))

def pieces(s: String) -> List<&2, Piece>:
  scan(s, (0, ("", (False{}, []))))
