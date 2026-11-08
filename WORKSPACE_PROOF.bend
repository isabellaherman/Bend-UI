import Base
import ./WORKSPACE_LAWS.bend as L

def L.dialog_spacing_in_scale(): {==}
def L.dialog_backdrop_is_translucent(): {==}
def L.feedback_spacing_in_scale(): {==}
def L.workspace_spacing_in_scale(): {==}
def L.narrow_padding_fits(): {==}
def L.preview_bounds_fit(): {==}
def L.source_has_room(): {==}
def L.snapshot_bounds_fit(): {==}
def L.errors_do_not_expire(p): {==}
def L.persistent_notices_do_not_expire(e):
  match e:
    case True{}: {==}
    case False{}: {==}
def L.feedback_allows_reading(): {==}
def L.narrow_panels_stack(): {==}
def L.wide_panels_share_row(): {==}
def L.desktop_sidebar_stays(inside, toggle): {==}
def L.sidebar_inside_stays(narrow, toggle):
  match narrow:
    case True{}: {==}
    case False{}: {==}
