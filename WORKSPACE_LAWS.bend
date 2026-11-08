# Additive laws for the workspace extension; existing owner laws stay unchanged.
import Base
import ./TOKENS.bend as T
import ./SPEC.bend as S
import ./WORKSPACE.bend as W

# LAW: dialog content and screen margins belong to the space scale.
law dialog_spacing_in_scale:
  {S.in_space_scale(T.dialog_padding()) && S.in_space_scale(T.dialog_screen_gap()) == True{} : Bool}

# LAW: the modal veil is visible and never fully opaque.
law dialog_backdrop_is_translucent:
  {(T.dialog_backdrop_percent() > 0 : U32) && (T.dialog_backdrop_percent() < 100 : U32) == True{} : Bool}

# LAW: feedback padding uses the space scale, with more space horizontally.
law feedback_spacing_in_scale:
  {S.in_space_scale(T.feedback_padding_x()) && S.in_space_scale(T.feedback_padding_y()) && (T.feedback_padding_x() > T.feedback_padding_y() : U32) == True{} : Bool}

# LAW: workspace and pane spacing stays on the established scale.
law workspace_spacing_in_scale:
  {S.in_space_scale(T.workbench_padding()) && S.in_space_scale(T.workbench_padding_narrow()) && S.in_space_scale(T.workbench_gap()) && S.in_space_scale(T.workbench_pane_padding()) && S.in_space_scale(T.breadcrumb_gap()) == True{} : Bool}

# LAW: narrow workspace padding never exceeds desktop padding.
law narrow_padding_fits:
  {(T.workbench_padding_narrow() <= T.workbench_padding() : U32) == True{} : Bool}

# LAW: preview heights are on the grid and the minimum fits the maximum.
law preview_bounds_fit:
  {S.on_grid(T.preview_min_height()) && S.on_grid(T.preview_max_height()) && (T.preview_min_height() <= T.preview_max_height() : U32) == True{} : Bool}

# LAW: source input always has room for at least one line.
law source_has_room:
  {(T.source_min_lines() > 0 : U32) == True{} : Bool}

# LAW: revision previews have positive, grid-aligned scroll bounds.
law snapshot_bounds_fit:
  {S.on_grid(T.snapshot_max_height()) && (T.snapshot_max_height() > 0 : U32) == True{} : Bool}

# LAW: an error notice never disappears on a timer, for any requested persistence.
law errors_do_not_expire:
  for p: Bool
  {W.feedback_delay(True{}, p) == 0 : U32}

# LAW: a persistent notice never disappears on a timer, for any error state.
law persistent_notices_do_not_expire:
  for e: Bool
  {W.feedback_delay(e, True{}) == 0 : U32}

# LAW: ordinary feedback remains visible for at least the library's reading duration.
law feedback_allows_reading:
  {(W.feedback_delay(False{}, False{}) >= T.duration_read_ms() : U32) == True{} : Bool}

# LAW: wide screens place panes beside one another; narrow screens stack them.
law narrow_panels_stack:
  {W.panels_direction(True{}) == "column" : String}

law wide_panels_share_row:
  {W.panels_direction(False{}) == "row" : String}

# LAW: desktop clicks never dismiss the sidebar.
law desktop_sidebar_stays:
  for inside: Bool
  for toggle: Bool
  {W.dismiss_sidebar(False{}, inside, toggle) == False{} : Bool}

# LAW: clicks inside a sidebar never dismiss it.
law sidebar_inside_stays:
  for narrow: Bool
  for toggle: Bool
  {W.dismiss_sidebar(narrow, True{}, toggle) == False{} : Bool}
