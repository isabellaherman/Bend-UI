import Base
import ./EDITOR_LAWS.bend as L

def L.skip_changes_nothing(d): {==}
def L.skip_is_undone_by_skip(d): {==}
def L.kind_moves_no_position(d, at, k, p): {==}
def L.align_moves_no_position(d, at, a, p): {==}
def L.place_moves_no_position(d, at, q, p): {==}
def L.replace_is_undone(): {==}
def L.split_is_undone(): {==}
def L.join_is_undone(): {==}
def L.insert_is_undone(): {==}
def L.remove_is_undone(): {==}
def L.kind_is_undone(): {==}
def L.align_is_undone(): {==}
def L.place_is_undone(): {==}
def L.move_is_undone(): {==}
def L.step_past_the_end_changes_nothing(): {==}
def L.step_past_the_end_is_undone_by_skip(): {==}
def L.replace_changes_only_its_range(): {==}
def L.line_breaks_never_enter_a_block(): {==}
def L.schema_fits_values(): {==}
def L.move_lands_at_its_place(): {==}
def L.position_moves_with_typed_text(): {==}
def L.position_before_typed_text_stays(): {==}
def L.position_follows_a_split(): {==}
def L.position_follows_a_join(): {==}
def L.position_follows_a_moved_block(): {==}
def L.position_steps_back_past_a_moved_block(): {==}
def L.position_after_an_inserted_block(): {==}
def L.position_after_a_removed_block(): {==}
def L.undo_of_nothing(d, r, c): {==}
def L.redo_of_nothing(d, u, c): {==}
def L.no_steps_no_entry(e, before, after, typing, time): {==}
def L.empty_opens_with_a_paragraph(): {==}
def L.undo_gives_the_document_back(): {==}
def L.undo_puts_the_caret_back(): {==}
def L.redo_makes_the_change_again(): {==}
def L.a_run_of_typing_is_one_undo(): {==}
def L.typing_after_a_pause_is_its_own_undo(): {==}
def L.typing_is_the_smallest_replacement(): {==}
def L.hash_makes_a_heading(): {==}
def L.dash_makes_a_list_item(): {==}
def L.shortcut_only_in_a_paragraph(): {==}
def L.enter_splits_a_paragraph(): {==}
def L.enter_goes_on_with_a_list(): {==}
def L.enter_on_an_empty_item_leaves_the_list(): {==}
def L.enter_after_a_heading_is_a_paragraph(): {==}
def L.enter_in_a_caption_writes_under_the_figure(): {==}
def L.backspace_joins_the_block_before(): {==}
def L.backspace_makes_a_heading_a_paragraph(): {==}
def L.backspace_never_joins_a_figure(): {==}
def L.selection_across_blocks_is_taken_out(): {==}
def L.a_letter_typed_over_a_selection(): {==}
def L.figure_takes_an_empty_paragraph(): {==}
def L.figure_goes_under_text(): {==}
def L.caret_goes_after_the_figure(): {==}
def L.last_block_out_leaves_a_paragraph(): {==}
def L.pasted_blocks_go_under(): {==}
def L.pasted_line_goes_into_the_text(): {==}
def L.markdown_of_a_document(): {==}
def L.markdown_is_read_back(): {==}
def L.lists_are_read_back(): {==}
def L.lists_are_written_back(): {==}
def L.alignment_is_a_fenced_div(): {==}
def L.fenced_div_is_read_back(): {==}
def L.paragraph_that_looks_like_a_heading(): {==}
def L.escaped_paragraph_is_read_back(): {==}
def L.empty_blocks_are_not_written(): {==}
def L.open_fence_is_still_a_figure(): {==}
