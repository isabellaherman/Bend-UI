# Editor laws (opt-in extension): the block document, its steps and their inverses, positions, history,
# commands and Markdown. The owner laws in LAWS.bend are unchanged. A law that says "for every" is proved for
# every value; the others are checked on the example document below.
import Base
import ./EDITOR.bend as E
import ./EDITOR_MARKDOWN.bend as M

# A document with a heading, a paragraph, a figure with a caption and a list item.
def sample() -> List<&2, E.Block>:
  [E.Block{E.Head{1}, "Title", 0, 0}, E.Block{E.Para{}, "Hello world", 0, 0},
   E.Block{E.Figure{"mermaid", "flowchart TD\n  A --> B"}, "Flow", 1, 0}, E.Block{E.Bullet{}, "item", 0, 0}]

# A step, then its inverse.
def there_and_back(+d: List<&2, E.Block>, +s: E.Step) -> List<&2, E.Block>:
  E.apply(E.apply(d, s), E.invert(d, s))

# LAW: for every document, the step that does nothing changes nothing.
law skip_changes_nothing:
  for d: List<&2, E.Block>
  {E.apply(d, E.Skip{}) == d : List<&2, E.Block>}

# LAW: for every document, the inverse of the step that does nothing is itself.
law skip_is_undone_by_skip:
  for +d: List<&2, E.Block>
  {E.invert(d, E.Skip{}) == E.Skip{} : E.Step}

# LAW: for every document, block, kind and position: changing what a block is moves no position.
law kind_moves_no_position:
  for +d: List<&2, E.Block>
  for at: Nat
  for k: E.Form
  for p: E.Pos
  {E.map_pos(d, E.SetKind{at, k}, p) == p : E.Pos}

# LAW: for every document, block, alignment and position: aligning a block moves no position.
law align_moves_no_position:
  for +d: List<&2, E.Block>
  for at: Nat
  for a: U32
  for p: E.Pos
  {E.map_pos(d, E.SetAlign{at, a}, p) == p : E.Pos}

# LAW: for every document, block, place and position: placing a block on the page moves no position.
law place_moves_no_position:
  for +d: List<&2, E.Block>
  for at: Nat
  for q: U32
  for p: E.Pos
  {E.map_pos(d, E.SetPlace{at, q}, p) == p : E.Pos}

# LAW: a replacement, then its inverse, gives the document back.
law replace_is_undone:
  {there_and_back(sample(), E.Replace{1n, 5n, 11n, "!"}) == sample() : List<&2, E.Block>}

# LAW: a split, then its inverse, gives the document back.
law split_is_undone:
  {there_and_back(sample(), E.Split{1n, 5n, E.Para{}, 0, 0}) == sample() : List<&2, E.Block>}

# LAW: a join, then its inverse, gives the document back.
law join_is_undone:
  {there_and_back(sample(), E.Join{1n}) == sample() : List<&2, E.Block>}

# LAW: an inserted block, then the inverse, gives the document back.
law insert_is_undone:
  {there_and_back(sample(), E.Insert{2n, E.Block{E.Quote{}, "new", 0, 0}}) == sample() : List<&2, E.Block>}

# LAW: a removed block, then the inverse, gives the document back.
law remove_is_undone:
  {there_and_back(sample(), E.Remove{2n}) == sample() : List<&2, E.Block>}

# LAW: a change of kind, then its inverse, gives the document back.
law kind_is_undone:
  {there_and_back(sample(), E.SetKind{1n, E.Head{2}}) == sample() : List<&2, E.Block>}

# LAW: a change of alignment, then its inverse, gives the document back.
law align_is_undone:
  {there_and_back(sample(), E.SetAlign{2n, 2}) == sample() : List<&2, E.Block>}

# LAW: a change of place, then its inverse, gives the document back.
law place_is_undone:
  {there_and_back(sample(), E.SetPlace{2n, 1}) == sample() : List<&2, E.Block>}

# LAW: a moved block, then the inverse, gives the document back.
law move_is_undone:
  {there_and_back(sample(), E.Carry{0n, 3n}) == sample() : List<&2, E.Block>}

# LAW: a step on a block that isn't there changes nothing.
law step_past_the_end_changes_nothing:
  {E.apply(sample(), E.Remove{9n}) == sample() : List<&2, E.Block>}

# LAW: the inverse of a step that changed nothing is the step that does nothing.
law step_past_the_end_is_undone_by_skip:
  {E.invert(sample(), E.Remove{9n}) == E.Skip{} : E.Step}

# LAW: a replacement changes only its range.
law replace_changes_only_its_range:
  {E.apply([E.Block{E.Para{}, "Hello world", 0, 0}], E.Replace{0n, 0n, 5n, "Bye"}) == [E.Block{E.Para{}, "Bye world", 0, 0}] : List<&2, E.Block>}

# LAW: a line break never enters a block's text: it becomes a space.
law line_breaks_never_enter_a_block:
  {E.apply([E.Block{E.Para{}, "ab", 0, 0}], E.Replace{0n, 1n, 1n, "x\ny"}) == [E.Block{E.Para{}, "ax yb", 0, 0}] : List<&2, E.Block>}

# LAW: a heading's level, the alignment and the place take known values only.
law schema_fits_values:
  {E.fit(E.Block{E.Head{9}, "a\nb", 7, 5}) == E.Block{E.Head{3}, "a b", 0, 0} : E.Block}

# LAW: a moved block lands where the step says.
law move_lands_at_its_place:
  {E.apply(sample(), E.Carry{3n, 0n}) ==
   [E.Block{E.Bullet{}, "item", 0, 0}, E.Block{E.Head{1}, "Title", 0, 0}, E.Block{E.Para{}, "Hello world", 0, 0},
    E.Block{E.Figure{"mermaid", "flowchart TD\n  A --> B"}, "Flow", 1, 0}] : List<&2, E.Block>}

# LAW: a position after typed text moves with it.
law position_moves_with_typed_text:
  {E.map_pos(sample(), E.Replace{1n, 5n, 5n, "abc"}, E.Pos{1n, 5n}) == E.Pos{1n, 8n} : E.Pos}

# LAW: a position before typed text stays.
law position_before_typed_text_stays:
  {E.map_pos(sample(), E.Replace{1n, 5n, 5n, "abc"}, E.Pos{1n, 2n}) == E.Pos{1n, 2n} : E.Pos}

# LAW: a position after a split goes to the new block.
law position_follows_a_split:
  {E.map_pos(sample(), E.Split{1n, 5n, E.Para{}, 0, 0}, E.Pos{1n, 7n}) == E.Pos{2n, 2n} : E.Pos}

# LAW: a position in a joined block goes to the block it joined.
law position_follows_a_join:
  {E.map_pos(sample(), E.Join{1n}, E.Pos{1n, 3n}) == E.Pos{0n, 8n} : E.Pos}

# LAW: a position in a moved block moves with it.
law position_follows_a_moved_block:
  {E.map_pos(sample(), E.Carry{0n, 3n}, E.Pos{0n, 2n}) == E.Pos{3n, 2n} : E.Pos}

# LAW: a position in a block the moved one passed steps back one block.
law position_steps_back_past_a_moved_block:
  {E.map_pos(sample(), E.Carry{0n, 3n}, E.Pos{2n, 1n}) == E.Pos{1n, 1n} : E.Pos}

# LAW: a position after an inserted block steps forward one block.
law position_after_an_inserted_block:
  {E.map_pos(sample(), E.Insert{1n, E.Block{E.Para{}, "", 0, 0}}, E.Pos{1n, 4n}) == E.Pos{2n, 4n} : E.Pos}

# LAW: a position after a removed block steps back one block.
law position_after_a_removed_block:
  {E.map_pos(sample(), E.Remove{0n}, E.Pos{3n, 1n}) == E.Pos{2n, 1n} : E.Pos}

# LAW: for every document: with nothing to undo, undo changes nothing.
law undo_of_nothing:
  for d: List<&2, E.Block>
  for r: List<&2, E.Entry>
  for c: E.Pos
  {E.undo(E.Editor{d, Nil{}, r, c}) == E.Editor{d, Nil{}, r, c} : E.Editor}

# LAW: for every document: with nothing to redo, redo changes nothing.
law redo_of_nothing:
  for d: List<&2, E.Block>
  for u: List<&2, E.Entry>
  for c: E.Pos
  {E.redo(E.Editor{d, u, Nil{}, c}) == E.Editor{d, u, Nil{}, c} : E.Editor}

# LAW: for every editor: a command with no steps leaves it, and its history, exactly as it was.
law no_steps_no_entry:
  for +e: E.Editor
  for before: E.Pos
  for after: E.Pos
  for typing: Bool
  for time: U32
  {E.commit_some(e, before, E.Plan{Nil{}, after}, typing, time) == e : E.Editor}

# LAW: a document with no blocks opens with one empty paragraph to write in.
law empty_opens_with_a_paragraph:
  {E.start(Nil{}) == E.Editor{[E.Block{E.Para{}, "", 0, 0}], Nil{}, Nil{}, E.Pos{0n, 0n}} : E.Editor}

# LAW: undo gives the document back, whatever the command took out.
law undo_gives_the_document_back:
  {E.doc(E.undo(E.enter(E.start(sample()), E.Pos{1n, 2n}, E.Pos{3n, 2n}, 0))) == sample() : List<&2, E.Block>}

# LAW: undo puts the caret where it was.
law undo_puts_the_caret_back:
  {E.caret(E.undo(E.enter(E.start(sample()), E.Pos{1n, 5n}, E.Pos{1n, 5n}, 0))) == E.Pos{1n, 5n} : E.Pos}

# LAW: redo makes the change again.
law redo_makes_the_change_again:
  {E.doc(E.redo(E.undo(E.enter(E.start(sample()), E.Pos{1n, 5n}, E.Pos{1n, 5n}, 0)))) ==
   E.doc(E.enter(E.start(sample()), E.Pos{1n, 5n}, E.Pos{1n, 5n}, 0)) : List<&2, E.Block>}

# LAW: letters typed one after the other, within a second, are undone together.
law a_run_of_typing_is_one_undo:
  {E.doc(E.undo(E.write(E.write(E.start(Nil{}), 0n, "a", 1n, 0), 0n, "ab", 2n, 100))) == [E.Block{E.Para{}, "", 0, 0}] : List<&2, E.Block>}

# LAW: typing after a pause is undone on its own.
law typing_after_a_pause_is_its_own_undo:
  {E.doc(E.undo(E.write(E.write(E.start(Nil{}), 0n, "a", 1n, 0), 0n, "ab", 2n, 5000))) == [E.Block{E.Para{}, "a", 0, 0}] : List<&2, E.Block>}

# LAW: typing is the smallest replacement that makes the new text.
law typing_is_the_smallest_replacement:
  {E.diff(0n, "Hello world", "Hello brave world") == E.Replace{0n, 6n, 6n, "brave "} : E.Step}

# LAW: a hash and a space at the start of a paragraph make it a heading, and the mark goes away.
law hash_makes_a_heading:
  {E.doc(E.write(E.start(Nil{}), 0n, "# ", 2n, 0)) == [E.Block{E.Head{1}, "", 0, 0}] : List<&2, E.Block>}

# LAW: a dash and a space at the start of a paragraph make it a list item.
law dash_makes_a_list_item:
  {E.doc(E.write(E.start([E.Block{E.Para{}, "milk", 0, 0}]), 0n, "- milk", 2n, 0)) == [E.Block{E.Bullet{}, "milk", 0, 0}] : List<&2, E.Block>}

# LAW: a Markdown shortcut works only in a paragraph.
law shortcut_only_in_a_paragraph:
  {E.doc(E.write(E.start([E.Block{E.Quote{}, "", 0, 0}]), 0n, "# ", 2n, 0)) == [E.Block{E.Quote{}, "# ", 0, 0}] : List<&2, E.Block>}

# LAW: Enter splits a paragraph at the caret.
law enter_splits_a_paragraph:
  {E.doc(E.enter(E.start([E.Block{E.Para{}, "Hello world", 0, 0}]), E.Pos{0n, 5n}, E.Pos{0n, 5n}, 0)) ==
   [E.Block{E.Para{}, "Hello", 0, 0}, E.Block{E.Para{}, " world", 0, 0}] : List<&2, E.Block>}

# LAW: Enter in a list item starts the next item.
law enter_goes_on_with_a_list:
  {E.doc(E.enter(E.start([E.Block{E.Bullet{}, "one", 0, 0}]), E.Pos{0n, 3n}, E.Pos{0n, 3n}, 0)) ==
   [E.Block{E.Bullet{}, "one", 0, 0}, E.Block{E.Bullet{}, "", 0, 0}] : List<&2, E.Block>}

# LAW: Enter on an empty list item leaves the list.
law enter_on_an_empty_item_leaves_the_list:
  {E.doc(E.enter(E.start([E.Block{E.Bullet{}, "one", 0, 0}, E.Block{E.Bullet{}, "", 0, 0}]), E.Pos{1n, 0n}, E.Pos{1n, 0n}, 0)) ==
   [E.Block{E.Bullet{}, "one", 0, 0}, E.Block{E.Para{}, "", 0, 0}] : List<&2, E.Block>}

# LAW: Enter at the end of a heading starts a paragraph.
law enter_after_a_heading_is_a_paragraph:
  {E.doc(E.enter(E.start([E.Block{E.Head{2}, "Plan", 0, 0}]), E.Pos{0n, 4n}, E.Pos{0n, 4n}, 0)) ==
   [E.Block{E.Head{2}, "Plan", 0, 0}, E.Block{E.Para{}, "", 0, 0}] : List<&2, E.Block>}

# LAW: Enter in a figure's caption starts a paragraph under the figure.
law enter_in_a_caption_writes_under_the_figure:
  {E.doc(E.enter(E.start([E.Block{E.Figure{"mermaid", "x"}, "Cap", 0, 0}]), E.Pos{0n, 1n}, E.Pos{0n, 1n}, 0)) ==
   [E.Block{E.Figure{"mermaid", "x"}, "Cap", 0, 0}, E.Block{E.Para{}, "", 0, 0}] : List<&2, E.Block>}

# LAW: Backspace at the start of a paragraph joins it to the block before.
law backspace_joins_the_block_before:
  {E.doc(E.backspace(E.start([E.Block{E.Para{}, "Hello", 0, 0}, E.Block{E.Para{}, " world", 0, 0}]), E.Pos{1n, 0n}, E.Pos{1n, 0n}, 0)) ==
   [E.Block{E.Para{}, "Hello world", 0, 0}] : List<&2, E.Block>}

# LAW: Backspace at the start of a heading makes it a paragraph.
law backspace_makes_a_heading_a_paragraph:
  {E.doc(E.backspace(E.start(sample()), E.Pos{0n, 0n}, E.Pos{0n, 0n}, 0)) ==
   E.apply(sample(), E.SetKind{0n, E.Para{}}) : List<&2, E.Block>}

# LAW: Backspace never joins text into a figure.
law backspace_never_joins_a_figure:
  {E.doc(E.backspace(E.start(sample()), E.Pos{3n, 0n}, E.Pos{3n, 0n}, 0)) ==
   E.apply(sample(), E.SetKind{3n, E.Para{}}) : List<&2, E.Block>}

# LAW: a selection across blocks goes away as one, a figure in the middle included, and its ends join.
law selection_across_blocks_is_taken_out:
  {E.doc(E.cut(E.start(sample()), E.Pos{0n, 2n}, E.Pos{3n, 2n}, 0)) == [E.Block{E.Head{1}, "Tiem", 0, 0}] : List<&2, E.Block>}

# LAW: a letter typed over a selection takes its place.
law a_letter_typed_over_a_selection:
  {E.doc(E.put(E.start(sample()), E.Pos{1n, 0n}, E.Pos{1n, 5n}, "Bye", 0)) ==
   E.apply(sample(), E.Replace{1n, 0n, 5n, "Bye"}) : List<&2, E.Block>}

# LAW: a figure takes the place of an empty paragraph, and a paragraph follows it.
law figure_takes_an_empty_paragraph:
  {E.doc(E.insert_figure(E.start(Nil{}), E.Pos{0n, 0n}, "mermaid", "x", 0)) ==
   [E.Block{E.Figure{"mermaid", "x"}, "", 0, 0}, E.Block{E.Para{}, "", 0, 0}] : List<&2, E.Block>}

# LAW: a figure goes under a block that has text.
law figure_goes_under_text:
  {E.doc(E.insert_figure(E.start([E.Block{E.Para{}, "a", 0, 0}, E.Block{E.Para{}, "b", 0, 0}]), E.Pos{0n, 1n}, "mermaid", "x", 0)) ==
   [E.Block{E.Para{}, "a", 0, 0}, E.Block{E.Figure{"mermaid", "x"}, "", 0, 0}, E.Block{E.Para{}, "b", 0, 0}] : List<&2, E.Block>}

# LAW: after a figure is put in, the caret is in the paragraph after it.
law caret_goes_after_the_figure:
  {E.caret(E.insert_figure(E.start(Nil{}), E.Pos{0n, 0n}, "mermaid", "x", 0)) == E.Pos{1n, 0n} : E.Pos}

# LAW: taking out the only block leaves an empty paragraph.
law last_block_out_leaves_a_paragraph:
  {E.doc(E.remove_block(E.start([E.Block{E.Figure{"mermaid", "x"}, "", 0, 0}]), 0n, 0)) == [E.Block{E.Para{}, "", 0, 0}] : List<&2, E.Block>}

# LAW: pasted blocks go under the block with the caret.
law pasted_blocks_go_under:
  {E.doc(E.paste(E.start([E.Block{E.Para{}, "a", 0, 0}]), E.Pos{0n, 1n}, E.Pos{0n, 1n}, [E.Block{E.Head{1}, "T", 0, 0}, E.Block{E.Para{}, "x", 0, 0}], 0)) ==
   [E.Block{E.Para{}, "a", 0, 0}, E.Block{E.Head{1}, "T", 0, 0}, E.Block{E.Para{}, "x", 0, 0}] : List<&2, E.Block>}

# LAW: one pasted paragraph goes into the text at the caret.
law pasted_line_goes_into_the_text:
  {E.doc(E.paste(E.start([E.Block{E.Para{}, "ab", 0, 0}]), E.Pos{0n, 1n}, E.Pos{0n, 1n}, [E.Block{E.Para{}, "X", 0, 0}], 0)) ==
   [E.Block{E.Para{}, "aXb", 0, 0}] : List<&2, E.Block>}

# LAW: a document is written in standard Markdown; a figure's caption and alignment use a Pandoc fenced div.
law markdown_of_a_document:
  {M.write(sample()) == "# Title\n\nHello world\n\n::: {.figure .center}\n```mermaid\nflowchart TD\n  A --> B\n```\nFlow\n:::\n\n- item" : String}

# LAW: what is written is read back as the same document.
law markdown_is_read_back:
  {M.read(M.write(sample())) == sample() : List<&2, E.Block>}

# LAW: lists and quotes are read from Markdown.
law lists_are_read_back:
  {M.read("- a\n- b\n\n1. one\n2. two\n\n> said") ==
   [E.Block{E.Bullet{}, "a", 0, 0}, E.Block{E.Bullet{}, "b", 0, 0}, E.Block{E.Number{}, "one", 0, 0}, E.Block{E.Number{}, "two", 0, 0}, E.Block{E.Quote{}, "said", 0, 0}] : List<&2, E.Block>}

# LAW: lists and quotes read from Markdown are written back the same.
law lists_are_written_back:
  {M.write(M.read("- a\n- b\n\n1. one\n2. two\n\n> said")) == "- a\n- b\n\n1. one\n2. two\n\n> said" : String}

# LAW: alignment and the top of the page are a Pandoc fenced div.
law alignment_is_a_fenced_div:
  {M.write([E.Block{E.Para{}, "Centered", 1, 1}]) == "::: {.center .top}\nCentered\n:::" : String}

# LAW: a fenced div is read back as the block's alignment.
law fenced_div_is_read_back:
  {M.read("::: {.right}\n## Sub\n:::\n\nAfter") == [E.Block{E.Head{2}, "Sub", 2, 0}, E.Block{E.Para{}, "After", 0, 0}] : List<&2, E.Block>}

# LAW: a paragraph that starts like other syntax is written after a backslash.
law paragraph_that_looks_like_a_heading:
  {M.write([E.Block{E.Para{}, "# not a heading", 0, 0}]) == "\\# not a heading" : String}

# LAW: a paragraph written after a backslash is read back with its own text.
law escaped_paragraph_is_read_back:
  {M.read("\\# not a heading") == [E.Block{E.Para{}, "# not a heading", 0, 0}] : List<&2, E.Block>}

# LAW: a block with no text is not written; a figure always is.
law empty_blocks_are_not_written:
  {M.write([E.Block{E.Para{}, "a", 0, 0}, E.Block{E.Para{}, "", 0, 0}, E.Block{E.Figure{"mermaid", "x"}, "", 0, 0}]) == "a\n\n```mermaid\nx\n```" : String}

# LAW: a fence left open at the end of the text is still a figure, with all its lines.
law open_fence_is_still_a_figure:
  {M.read("```mermaid\nflowchart TD\n  A") == [E.Block{E.Figure{"mermaid", "flowchart TD\n  A"}, "", 0, 0}] : List<&2, E.Block>}
