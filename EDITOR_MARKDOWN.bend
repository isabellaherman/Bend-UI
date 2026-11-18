# A block document as Markdown, and back. Standard syntax only:
# - `#`, `##`, `###` headings, `- ` and `1. ` list items, `> ` quotes, paragraphs between blank lines;
# - a figure is a fenced code block (``` and the figure's `lang`), which GitHub, Obsidian and Pandoc draw or show;
# - alignment, the top of the page and a figure's caption use Pandoc's fenced divs: `::: {.figure .center .top}`.
# A block with no text is not written. A paragraph that starts like other syntax is written after a backslash.
import Base
import ./EDITOR.bend as E

# ---------- Texts and lists, walked as loops (see EDITOR.bend) ----------

def pour(-A: Data, back: List<&2, A>, rest: List<&2, A>) -> List<&2, A>:
  match back:
    case Nil{}: rest
    case h <> t: pour(A, t, h <> rest)

def lines.go(s: String, +cur: String, +acc: List<&2, String>) -> List<&2, String>:
  match s:
    case SNil{}: List.reverse(&2, String, cur <> acc)
    case SCon{Chr{+c}, t}:
      lines.go(t, Bool.pick(String, U32.is_eq(c, 10), "", cur ++ SCon{Chr{c}, SNil{}}), Bool.pick(List<&2, String>, U32.is_eq(c, 10), cur <> acc, acc))

# The lines of a text. A text with no line break is one line.
def lines(s: String) -> List<&2, String>:
  lines.go(s, "", Nil{})

def unlines.go(ls: List<&2, String>, acc: String) -> String:
  match ls:
    case Nil{}: acc
    case h <> t: unlines.go(t, acc ++ "\n" ++ h)

def unlines(ls: List<&2, String>) -> String:
  match ls:
    case Nil{}: ""
    case h <> t: unlines.go(t, h)

# ---------- Reading one line ----------

type Line is Data:
  Blank{}
  Div{align: U32, place: U32, figure: Bool}
  Shut{}
  Fence{lang: String}
  Item{kind: E.Form, text: String}

def digits.go(s: String, +n: Nat, live: Bool) -> Nat:
  match s:
    case SNil{}: n
    case SCon{c, t}:
      +ok = live && Char.is_digit(c)
      digits.go(t, Bool.pick(Nat, ok, 1n+n, n), ok)

# How many digits a text starts with.
def digits(s: String) -> Nat:
  digits.go(s, 0n, True{})

def numbered(+l: String) -> Bool:
  Nat.is_gt(digits(l), 0n) && String.starts_with(String.drop(l, digits(l)), ". ")

def unescape(+l: String) -> String:
  Bool.pick(String, String.starts_with(l, "\\"), String.drop(l, 1n), l)

def open_line(+classes: String) -> Line:
  Div{Bool.pick(U32, String.contains(classes, ".center"), 1, Bool.pick(U32, String.contains(classes, ".right"), 2, 0)),
    Bool.pick(U32, String.contains(classes, ".top"), 1, 0), String.contains(classes, ".figure")}

def div_line(+rest: String) -> Line:
  Bool.pick(Line, String.is_empty(rest), Shut{}, open_line(rest))

def classify(+l: String) -> Line:
  Bool.pick(Line, E.is_blank(l), Blank{},
    Bool.pick(Line, String.starts_with(l, ":::"), div_line(String.trim(String.drop(l, 3n))),
      Bool.pick(Line, String.starts_with(l, "```"), Fence{String.trim(String.drop(l, 3n))},
        Bool.pick(Line, String.starts_with(l, "### "), Item{E.Head{3}, String.drop(l, 4n)},
          Bool.pick(Line, String.starts_with(l, "## "), Item{E.Head{2}, String.drop(l, 3n)},
            Bool.pick(Line, String.starts_with(l, "# "), Item{E.Head{1}, String.drop(l, 2n)},
              Bool.pick(Line, String.starts_with(l, "- ") || String.starts_with(l, "* "), Item{E.Bullet{}, String.drop(l, 2n)},
                Bool.pick(Line, String.starts_with(l, "> "), Item{E.Quote{}, String.drop(l, 2n)},
                  Bool.pick(Line, numbered(l), Item{E.Number{}, String.drop(l, (digits(l) + 2n : Nat))},
                    Item{E.Para{}, unescape(l)})))))))))

# ---------- Writing ----------

def is_plain(x: Line) -> Bool:
  match x:
    case Item{E.Para{}, t}: True{}
    case other: False{}

# A paragraph that would be read as something else, or that starts with a backslash, goes after a backslash.
def escape(+t: String) -> String:
  Bool.pick(String, is_plain(classify(t)) && Bool.not(String.starts_with(t, "\\")), t, "\\" ++ t)

def hashes(+l: U32) -> String:
  Bool.pick(String, U32.is_le(l, 1), "#", Bool.pick(String, U32.is_eq(l, 2), "##", "###"))

def caption(+t: String) -> List<&2, String>:
  Bool.pick(List<&2, String>, E.is_blank(t), Nil{}, [t])

# A line of a figure's source that would close its fence is written after a space.
def guard.go(ls: List<&2, String>, acc: List<&2, String>) -> List<&2, String>:
  match ls:
    case Nil{}: acc
    case +l <> t: guard.go(t, Bool.pick(String, String.starts_with(l, "```"), " " ++ l, l) <> acc)

# The lines of a fence, last line first: its opening, the source, its closing.
def fence(lang: String, source: String) -> List<&2, String>:
  "```" <> guard.go(lines(source), ["```" ++ lang])

def body(k: E.Form, +t: String, n: Nat) -> List<&2, String>:
  match k:
    case E.Para{}: [escape(t)]
    case E.Head{l}: [hashes(l) ++ " " ++ t]
    case E.Bullet{}: ["- " ++ t]
    case E.Number{}: [Nat.show(n) ++ ". " ++ t]
    case E.Quote{}: ["> " ++ t]
    case E.Figure{lang, source}: pour(String, fence(lang, source), caption(t))

def classes(figure: Bool, +a: U32, p: U32) -> String:
  Bool.pick(String, figure, " .figure", "") ++ Bool.pick(String, U32.is_eq(a, 1), " .center", "") ++
  Bool.pick(String, U32.is_eq(a, 2), " .right", "") ++ Bool.pick(String, U32.is_eq(p, 1), " .top", "")

def wrap(+ls: List<&2, String>, +cs: String) -> List<&2, String>:
  Bool.pick(List<&2, String>, String.is_empty(cs), ls,
    ("::: {" ++ String.drop(cs, 1n) ++ "}") <> pour(String, List.reverse(&2, String, ls), [":::"]))

# List items that follow one another, with no div around them, are written on consecutive lines.
def tight(k: E.Form, cs: String) -> U32:
  match k:
    case E.Bullet{}: Bool.pick(U32, String.is_empty(cs), 1, 0)
    case E.Number{}: Bool.pick(U32, String.is_empty(cs), 2, 0)
    case other: 0

def push(ls: List<&2, String>, acc: List<&2, String>) -> List<&2, String>:
  match ls:
    case Nil{}: acc
    case h <> t: push(t, h <> acc)

# The block's lines put on `acc` (last line first), after a blank line unless it starts the text or goes on a list.
def put(+acc: List<&2, String>, ls: List<&2, String>, joined: Bool) -> List<&2, String>:
  match acc joined:
    case Nil{} _: push(ls, Nil{})
    case a True{}: push(ls, a)
    case a False{}: push(ls, "" <> a)

def write.go(d: List<&2, E.Block>, +prev: U32, +n: Nat, +acc: List<&2, String>) -> List<&2, String>:
  match d:
    case Nil{}: List.reverse(&2, String, acc)
    case E.Block{+k, +t, +a, +p} <> rest:
      +skip = Bool.not(E.is_figure(k)) && E.is_blank(t)
      +cs = classes(E.is_figure(k) && Bool.not(E.is_blank(t)), a, p)
      +now = tight(k, cs)
      +num = Bool.pick(Nat, U32.is_eq(now, 2) && U32.is_eq(prev, 2), 1n+n, 1n)
      write.go(rest, Bool.pick(U32, skip, prev, now), Bool.pick(Nat, skip, n, num),
        Bool.pick(List<&2, String>, skip, acc, put(acc, wrap(body(k, t, num), cs), U32.is_ne(now, 0) && U32.is_eq(now, prev))))

def write_lines(d: List<&2, E.Block>) -> List<&2, String>:
  write.go(d, 0, 0n, Nil{})

def write(d: List<&2, E.Block>) -> String:
  unlines(write_lines(d))

# ---------- Reading ----------

type Mode is Data:
  Prose{}
  Fenced{lang: String, body: List<&2, String>}
  Legend{}

type Read is Data:
  Read{out: List<&2, E.Block>, align: U32, place: U32, figure: Bool, mode: Mode}

def feed.text(x: Line, out: List<&2, E.Block>, +a: U32, +p: U32, figure: Bool) -> Read:
  match x:
    case Blank{}: Read{out, a, p, figure, Prose{}}
    case Div{a2, p2, f2}: Read{out, a2, p2, f2, Prose{}}
    case Shut{}: Read{out, 0, 0, False{}, Prose{}}
    case Fence{lang}: Read{out, a, p, figure, Fenced{lang, Nil{}}}
    case Item{k, t}: Read{E.Block{k, t, a, p} <> out, a, p, figure, Prose{}}

def feed.code(close: Bool, l: String, out: List<&2, E.Block>, +a: U32, +p: U32, +figure: Bool, lang: String, body: List<&2, String>) -> Read:
  match close:
    case True{}: Read{E.Block{E.Figure{lang, unlines(List.reverse(&2, String, body))}, "", a, p} <> out, a, p, figure, Bool.pick(Mode, figure, Legend{}, Prose{})}
    case False{}: Read{out, a, p, figure, Fenced{lang, l <> body}}

def set_caption(out: List<&2, E.Block>, l: String) -> List<&2, E.Block>:
  match out:
    case Nil{}: Nil{}
    case E.Block{k, t, a, p} <> rest: E.Block{k, l, a, p} <> rest

# After a figure in a figure div: the next line with text is its caption.
def feed.caption(blank: Bool, close: Bool, l: String, out: List<&2, E.Block>, a: U32, p: U32, figure: Bool) -> Read:
  match blank close:
    case True{} _: Read{out, a, p, figure, Legend{}}
    case False{} True{}: Read{out, 0, 0, False{}, Prose{}}
    case False{} False{}: Read{set_caption(out, l), a, p, figure, Prose{}}

def feed(st: Read, +l: String) -> Read:
  match st:
    case Read{out, a, p, figure, Prose{}}: feed.text(classify(l), out, a, p, figure)
    case Read{out, a, p, figure, Fenced{lang, body}}: feed.code(String.eq(String.trim(l), "```"), l, out, a, p, figure, lang, body)
    case Read{out, a, p, figure, Legend{}}: feed.caption(E.is_blank(l), String.eq(String.trim(l), ":::"), l, out, a, p, figure)

def read.go(ls: List<&2, String>, st: Read) -> Read:
  match ls:
    case Nil{}: st
    case l <> t: read.go(t, feed(st, l))

# A fence left open at the end of the text is still a figure.
def finish(st: Read) -> List<&2, E.Block>:
  match st:
    case Read{out, a, p, figure, Fenced{lang, body}}:
      List.reverse(&2, E.Block, E.Block{E.Figure{lang, unlines(List.reverse(&2, String, body))}, "", a, p} <> out)
    case Read{out, a, p, figure, other}: List.reverse(&2, E.Block, out)

def read_lines(ls: List<&2, String>) -> List<&2, E.Block>:
  finish(read.go(ls, Read{Nil{}, 0, 0, False{}, Prose{}}))

def read(source: String) -> List<&2, E.Block>:
  read_lines(lines(source))
