# Bend-UI syntax: cuts code into pieces, each with a kind, for a code box to color.
# Pure; syntax.js draws each piece as a span. The colors are tokens (TOKENS.bend: syntax_*).
#
# Kinds: 0 plain (names, spaces), 1 keyword, 2 type or constructor (capitalized), 3 string,
#        4 number, 5 comment, 6 punctuation, 7 the name a def, law or type gives.
#
# Languages (lang_of turns a name into one):
#   0 Bend   keywords, Capitalized types, "strings", # comments, the name after def/law/type
#   1 JS     keywords, Capitalized types, "strings" 'strings' `strings`, // and /* */ comments
#   2 CSS    var() calc(), --custom-properties, .selectors, numbers, "strings", /* */ comments
#   3 HTML   tag names, attribute names, "values"; text between tags stays plain
#   4 Shell, TOML, YAML   "strings" 'strings', # comments
#   5 plain  no color
#   6 Python  keywords, Capitalized types, "strings" 'strings', # comments, the name after def/class
#   7 Rust    keywords, Capitalized types, "strings" 'chars', // and /* */ comments, the name after fn/struct/enum/trait
#   8 Go      keywords, Capitalized types, "strings" `raw`, // and /* */ comments, the name after func/type
#   9 SQL     keywords (any case), 'strings', -- comments
#  10 Markdown and 11 Diff are read a line at a time (line_kind): headings, quotes, lists; added and removed lines.

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
def added() -> U32: 8
def removed() -> U32: 9

# ---------- Languages ----------

def bend() -> U32: 0
def js() -> U32: 1
def css() -> U32: 2
def html() -> U32: 3
def hash() -> U32: 4
def none() -> U32: 5
def python() -> U32: 6
def rust() -> U32: 7
def go() -> U32: 8
def sql() -> U32: 9
def markdown() -> U32: 10
def diff() -> U32: 11

def pick(c: Bool, a: U32, b: U32) -> U32:
  match c:
    case True{}:
      a
    case False{}:
      b

def pick_bool(c: Bool, a: Bool, b: Bool) -> Bool:
  match c:
    case True{}:
      a
    case False{}:
      b

def any_of(+w: String, ws: List<&2, String>) -> Bool:
  match ws:
    case Nil{}:
      False{}
    case h <> t:
      String.eq(w, h) || any_of(w, t)

# A code fence's name (```js, ```html …) to a language. An unknown name is plain.
def lang_of(+name: String) -> U32:
  pick(any_of(name, ["bend"]), bend(),
  pick(any_of(name, ["js", "javascript", "mjs", "ts", "typescript", "json", "jsx", "tsx"]), js(),
  pick(any_of(name, ["css"]), css(),
  pick(any_of(name, ["html", "xml", "svg"]), html(),
  pick(any_of(name, ["sh", "bash", "shell", "zsh", "toml", "yaml", "yml"]), hash(),
  pick(any_of(name, ["python", "py"]), python(),
  pick(any_of(name, ["rust", "rs"]), rust(),
  pick(any_of(name, ["go", "golang"]), go(),
  pick(any_of(name, ["sql"]), sql(),
  pick(any_of(name, ["markdown", "md"]), markdown(),
  pick(any_of(name, ["diff", "patch"]), diff(), none())))))))))))

# ---------- Words ----------

def is_keyword(+lang: U32, +w: String) -> Bool:
  pick_bool(U32.is_eq(lang, 0),
    any_of(w, ["def", "law", "type", "for", "exs", "where", "match", "case", "import", "as", "is", "do", "return"]),
  pick_bool(U32.is_eq(lang, 1),
    any_of(w, ["import", "from", "export", "default", "const", "let", "var", "function", "return", "if", "else",
      "for", "of", "in", "while", "new", "await", "async", "class", "extends", "true", "false", "null",
      "undefined", "this", "typeof", "with"]),
  pick_bool(U32.is_eq(lang, 2), any_of(w, ["var", "calc", "min", "max", "clamp"]),
  pick_bool(U32.is_eq(lang, 6),
    any_of(w, ["def", "class", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "is", "import",
      "from", "as", "with", "try", "except", "finally", "raise", "pass", "break", "continue", "lambda", "yield", "None",
      "True", "False", "async", "await", "self"]),
  pick_bool(U32.is_eq(lang, 7),
    any_of(w, ["fn", "let", "mut", "pub", "struct", "enum", "impl", "trait", "use", "mod", "match", "if", "else", "for",
      "while", "loop", "return", "self", "Self", "where", "as", "in", "ref", "move", "true", "false", "const", "static",
      "type", "crate", "super", "async", "await", "dyn"]),
  pick_bool(U32.is_eq(lang, 8),
    any_of(w, ["func", "package", "import", "var", "const", "type", "struct", "interface", "map", "chan", "go", "defer",
      "return", "if", "else", "for", "range", "switch", "case", "default", "break", "continue", "select", "nil", "true", "false"]),
  pick_bool(U32.is_eq(lang, 9),
    any_of(String.to_upper(w), ["SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "JOIN",
      "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP", "BY", "ORDER", "HAVING", "LIMIT", "AS", "AND", "OR", "NOT", "NULL",
      "CREATE", "TABLE", "PRIMARY", "KEY", "IN", "IS", "DISTINCT", "COUNT", "DESC", "ASC"]),
  False{})))))))

# After these words, the next word is the name being given.
def names_next(+lang: U32, +w: String) -> Bool:
  pick_bool(U32.is_eq(lang, 0), any_of(w, ["def", "law", "type"]),
  pick_bool(U32.is_eq(lang, 1), any_of(w, ["function", "class"]),
  pick_bool(U32.is_eq(lang, 6), any_of(w, ["def", "class"]),
  pick_bool(U32.is_eq(lang, 7), any_of(w, ["fn", "struct", "enum", "trait"]),
  pick_bool(U32.is_eq(lang, 8), any_of(w, ["func", "type"]), False{})))))

def starts(+w: String, +upper: Bool) -> Bool:
  match w:
    case SNil{}:
      False{}
    case SCon{+h, t}:
      pick_bool(upper, Char.is_upper(h), Char.is_digit(h))

# Contexts: what the next word is.
#   0 free; 1 a name being given (Bend, JS); 2 an HTML tag's name (after < or </); 3 inside an HTML tag.
def classify.code(+lang: U32, +w: String, +ctx: U32) -> U32:
  pick(is_keyword(lang, w), keyword(),
  pick(starts(w, True{}), kind_type(),
  pick(starts(w, False{}), number(),
  pick(U32.is_eq(ctx, 1), defined(), plain()))))

def classify.css(+w: String) -> U32:
  pick(is_keyword(2, w), keyword(),
  pick(String.starts_with(w, "--"), defined(),
  pick(String.starts_with(w, "."), kind_type(),
  pick(starts(w, False{}), number(), plain()))))

def classify.html(+ctx: U32) -> U32:
  pick(U32.is_eq(ctx, 2), keyword(), pick(U32.is_eq(ctx, 3), defined(), plain()))

def classify.hash(+w: String) -> U32:
  pick(starts(w, False{}), number(), plain())

def classify(+lang: U32, +w: String, +ctx: U32) -> U32:
  pick(U32.is_eq(lang, 2), classify.css(w),
  pick(U32.is_eq(lang, 3), classify.html(ctx),
  pick(U32.is_eq(lang, 4), classify.hash(w),
  pick(U32.is_eq(lang, 5), plain(), classify.code(lang, w, ctx)))))

# The context after a word. In HTML a tag's name puts you inside the tag; text stays text.
def ctx_after_word(+lang: U32, +w: String, +ctx: U32) -> U32:
  pick(U32.is_eq(lang, 3), pick(U32.is_eq(ctx, 0), 0, 3), pick(names_next(lang, w), 1, 0))

# The context after a mark: in HTML, < opens a tag and > closes it. Elsewhere marks change nothing.
def ctx_after_mark(+lang: U32, +c: Char, +ctx: U32) -> U32:
  pick(U32.is_eq(lang, 3), pick(Char.is_eq(c, '<'), 2, pick(Char.is_eq(c, '>'), 0, ctx)), ctx)

# What a word is made of: letters, digits and _, plus . in Bend (String.eq, 1.5), $ in JS,
# - in HTML (aria-pressed), - and . in CSS (font-size, --space-4, .btn), shell and TOML.
def is_word(+lang: U32, +c: Char) -> Bool:
  (Char.is_alpha(c) || Char.is_digit(c) || Char.is_eq(c, '_')
    || pick_bool(U32.is_eq(lang, 6) || U32.is_eq(lang, 7) || U32.is_eq(lang, 8) || U32.is_eq(lang, 9), False{},
       pick_bool(U32.is_eq(lang, 0), Char.is_eq(c, '.'),
       pick_bool(U32.is_eq(lang, 1), Char.is_eq(c, '$'),
       pick_bool(U32.is_eq(lang, 3), Char.is_eq(c, '-'), Char.is_eq(c, '-') || Char.is_eq(c, '.'))))))

# ---------- Reading, a character at a time ----------
# The state: (mode, (cur backwards, (context, pieces backwards))).
# Modes: 0 code, 1 "string", 2 line comment, 3 block comment, 4 a / that may open a comment,
#        5 'string', 6 `string`.

def one(+c: Char) -> String:
  SCon{c, SNil{}}

# The word being read ends: it becomes a piece.
def flush.at(empty: Bool, +lang: U32, +cur: String, +ctx: U32, pieces: List<&2, Piece>) -> U32 & List<&2, Piece>:
  match empty:
    case True{}:
      (ctx, pieces)
    case False{}:
      (ctx_after_word(lang, String.reverse(cur), ctx), Piece{classify(lang, String.reverse(cur), ctx), String.reverse(cur)} <> pieces)

def flush(+lang: U32, +cur: String, +ctx: U32, pieces: List<&2, Piece>) -> U32 & List<&2, Piece>:
  flush.at(String.is_empty(cur), lang, cur, ctx, pieces)

# Which mode a character opens (0: none). In HTML, quotes open a string only inside a tag ("It's" is text).
def opener(+lang: U32, +c: Char, +ctx: U32) -> U32:
  pick(Char.is_eq(c, '"') && Bool.not(U32.is_eq(lang, 5)) && (Bool.not(U32.is_eq(lang, 3)) || U32.is_eq(ctx, 3)), 1,
  pick(Char.is_eq(c, '\'') && (U32.is_eq(lang, 1) || U32.is_eq(lang, 2) || U32.is_eq(lang, 4) || U32.is_eq(lang, 6) || U32.is_eq(lang, 7) || U32.is_eq(lang, 9) || (U32.is_eq(lang, 3) && U32.is_eq(ctx, 3))), 5,
  pick(Char.is_eq(c, '`') && (U32.is_eq(lang, 1) || U32.is_eq(lang, 8)), 6,
  pick(Char.is_eq(c, '#') && (U32.is_eq(lang, 0) || U32.is_eq(lang, 4) || U32.is_eq(lang, 6)), 2,
  pick(Char.is_eq(c, '/') && (U32.is_eq(lang, 1) || U32.is_eq(lang, 2) || U32.is_eq(lang, 7) || U32.is_eq(lang, 8)), 4,
  pick(Char.is_eq(c, '-') && U32.is_eq(lang, 9), 7, 0))))))

# A mark (or a space): its own piece.
def mark(+lang: U32, +c: Char, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  (0, ("", (ctx_after_mark(lang, c, ctx), Piece{pick(Char.is_space(c), plain(), punct()), one(c)} <> pieces)))

def opens.mode(slash: Bool, +m: U32, +c: Char, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  match slash:
    case True{}:
      (4, ("", (ctx, pieces)))
    case False{}:
      (m, (one(c), (ctx, pieces)))

def opens.at(+m: U32, +lang: U32, +c: Char, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  match m:
    case 0:
      mark(lang, c, ctx, pieces)
    case n:
      opens.mode(U32.is_eq(n, 4), n, c, ctx, pieces)

def opens.go(+lang: U32, +c: Char, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  opens.at(opener(lang, c, ctx), lang, c, ctx, pieces)

def opens(+lang: U32, +c: Char, flushed: U32 & List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  (ctx, pieces) = flushed
  opens.go(lang, c, ctx, pieces)

def code.at(word: Bool, +lang: U32, +c: Char, +cur: String, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  match word:
    case True{}:
      (0, (SCon{c, cur}, (ctx, pieces)))
    case False{}:
      opens(lang, c, flush(lang, cur, ctx, pieces))

def code(+lang: U32, +c: Char, +cur: String, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  code.at(is_word(lang, c), lang, c, cur, ctx, pieces)

def in_string(ends: Bool, +m: U32, +c: Char, +cur: String, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  match ends:
    case True{}:
      (0, ("", (ctx, Piece{string(), String.reverse(SCon{c, cur})} <> pieces)))
    case False{}:
      (m, (SCon{c, cur}, (ctx, pieces)))

def in_line(ends: Bool, +c: Char, +cur: String, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  match ends:
    case True{}:
      (0, ("", (ctx, Piece{plain(), one(c)} <> (Piece{comment(), String.reverse(cur)} <> pieces))))
    case False{}:
      (2, (SCon{c, cur}, (ctx, pieces)))

def prev_is_star(+cur: String) -> Bool:
  match cur:
    case SNil{}:
      False{}
    case SCon{+h, t}:
      Char.is_eq(h, '*')

def in_block(ends: Bool, +c: Char, +cur: String, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  match ends:
    case True{}:
      (0, ("", (ctx, Piece{comment(), String.reverse(SCon{c, cur})} <> pieces)))
    case False{}:
      (3, (SCon{c, cur}, (ctx, pieces)))

# After a /: a second / opens a line comment (JS), a * opens a block comment; anything else, the / was a mark.
def after_slash.star(star: Bool, +lang: U32, +c: Char, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  match star:
    case True{}:
      (3, ("*/", (ctx, pieces)))
    case False{}:
      code(lang, c, "", ctx, Piece{punct(), "/"} <> pieces)

def after_slash.at(line: Bool, +lang: U32, +c: Char, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  match line:
    case True{}:
      (2, ("//", (ctx, pieces)))
    case False{}:
      after_slash.star(Char.is_eq(c, '*'), lang, c, ctx, pieces)

def after_slash(+lang: U32, +c: Char, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  after_slash.at(Char.is_eq(c, '/') && (U32.is_eq(lang, 1) || U32.is_eq(lang, 7) || U32.is_eq(lang, 8)), lang, c, ctx, pieces)

# After a - in SQL: a second - opens a line comment; anything else, the - was a mark.
def after_dash.at(line: Bool, +lang: U32, +c: Char, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  match line:
    case True{}:
      (2, ("--", (ctx, pieces)))
    case False{}:
      code(lang, c, "", ctx, Piece{punct(), "-"} <> pieces)

def after_dash(+lang: U32, +c: Char, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  after_dash.at(Char.is_eq(c, '-'), lang, c, ctx, pieces)

def step.go(+lang: U32, +c: Char, mode: U32, +cur: String, +ctx: U32, pieces: List<&2, Piece>) -> U32 & (String & (U32 & List<&2, Piece>)):
  match mode:
    case 0:
      code(lang, c, cur, ctx, pieces)
    case 1:
      in_string(Char.is_eq(c, '"'), 1, c, cur, ctx, pieces)
    case 2:
      in_line(Char.is_eq(c, '\n'), c, cur, ctx, pieces)
    case 3:
      in_block(Char.is_eq(c, '/') && prev_is_star(cur), c, cur, ctx, pieces)
    case 4:
      after_slash(lang, c, ctx, pieces)
    case 5:
      in_string(Char.is_eq(c, '\''), 5, c, cur, ctx, pieces)
    case 6:
      in_string(Char.is_eq(c, '`'), 6, c, cur, ctx, pieces)
    case n:
      after_dash(lang, c, ctx, pieces)

def step(+lang: U32, +c: Char, state: U32 & (String & (U32 & List<&2, Piece>))) -> U32 & (String & (U32 & List<&2, Piece>)):
  (mode, rest) = state
  (cur, rest2) = rest
  (ctx, pieces) = rest2
  step.go(lang, c, mode, cur, ctx, pieces)

def snd(p: U32 & List<&2, Piece>) -> List<&2, Piece>:
  (a, b) = p
  b

# The text ends: what was being read becomes its last piece.
def finish.go(+lang: U32, mode: U32, +cur: String, +ctx: U32, pieces: List<&2, Piece>) -> List<&2, Piece>:
  match mode:
    case 0:
      snd(flush(lang, cur, ctx, pieces))
    case 1:
      Piece{string(), String.reverse(cur)} <> pieces
    case 2:
      Piece{comment(), String.reverse(cur)} <> pieces
    case 3:
      Piece{comment(), String.reverse(cur)} <> pieces
    case 4:
      Piece{punct(), "/"} <> pieces
    case 7:
      Piece{punct(), "-"} <> pieces
    case n:
      Piece{string(), String.reverse(cur)} <> pieces

def finish(+lang: U32, state: U32 & (String & (U32 & List<&2, Piece>))) -> List<&2, Piece>:
  (mode, rest) = state
  (cur, rest2) = rest
  (ctx, pieces) = rest2
  List.reverse(&2, Piece, finish.go(lang, mode, cur, ctx, pieces))

# One pass, a character at a time (tail calls: a file may be long).
def scan(s: String, +lang: U32, state: U32 & (String & (U32 & List<&2, Piece>))) -> List<&2, Piece>:
  match s:
    case SNil{}:
      finish(lang, state)
    case SCon{+h, t}:
      scan(t, lang, step(lang, h, state))

# Code in a language (lang_of) cut into pieces.
def pieces_in(+lang: U32, s: String) -> List<&2, Piece>:
  scan(s, lang, (0, ("", (0, []))))

# Bend code cut into pieces.
def pieces(s: String) -> List<&2, Piece>:
  pieces_in(0, s)


# ---------- A line at a time: Markdown and Diff ----------

def is_line_based(+lang: U32) -> Bool:
  U32.is_eq(lang, 10) || U32.is_eq(lang, 11)

# A whole line's kind. Diff: + added, - removed, @@ a hunk (comment). Markdown: # a heading (keyword),
# > a quote (comment), ``` a fence (string), - * or a number a list item (punct); anything else plain.
def line_kind(+lang: U32, +line: String) -> U32:
  pick(U32.is_eq(lang, 11),
    pick(String.starts_with(line, "@@"), comment(),
    pick(String.starts_with(line, "+"), added(),
    pick(String.starts_with(line, "-"), removed(), plain()))),
    pick(String.starts_with(line, "#"), keyword(),
    pick(String.starts_with(line, ">"), comment(),
    pick(String.starts_with(line, "```"), string(),
    pick(String.starts_with(line, "- ") || String.starts_with(line, "* ") || starts(line, False{}), punct(), plain())))))
