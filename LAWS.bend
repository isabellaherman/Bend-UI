# The design system's rules. Owned by the lib's owner: PROOF.bend must prove them.

import Base
import ./TOKENS.bend as T
import ./SPEC.bend as Spec
import ./KEYS.bend as K
import ./DIAGRAM.bend as D

# LAW: the button's horizontal padding is on the space scale.
law btn_padding_in_scale:
  {Spec.in_space_scale(T.btn_padding_x()) == True{} : Bool}

# LAW: the panel's padding is on the space scale.
law panel_padding_in_scale:
  {Spec.in_space_scale(T.panel_padding()) == True{} : Bool}

# LAW: the button's height is a control height (24, 32 or 36).
law btn_height_in_scale:
  {Spec.in_control_scale(T.btn_height()) == True{} : Bool}

# LAW: the segmented's padding is on the space scale.
law segmented_padding_in_scale:
  {Spec.in_space_scale(T.segmented_padding()) == True{} : Bool}

# LAW: an icon-only button fits in all three sizes. Round buttons (btn--round) use the same sizes.
law icon_button_sm_fits:
  {Spec.icon_button_fits(T.control_sm(), T.icon_btn_sm_icon(), T.icon_btn_sm_padding()) == True{} : Bool}

law icon_button_md_fits:
  {Spec.icon_button_fits(T.control_md(), T.icon_btn_md_icon(), T.icon_btn_md_padding()) == True{} : Bool}

law icon_button_lg_fits:
  {Spec.icon_button_fits(T.control_lg(), T.icon_btn_lg_icon(), T.icon_btn_lg_padding()) == True{} : Bool}

# LAW: nested radius. Outer radius = inner radius + padding.
law segmented_radius_nested:
  {U32.is_eq(T.segmented_outer_radius(),
     (T.segmented_inner_radius() + T.segmented_padding() : U32)) == True{} : Bool}

# LAW: proximity. Space inside a group is smaller than space between groups.
law inside_less_than_between:
  {(T.field_gap() < T.form_gap() : U32) == True{} : Bool}

# LAW: the status dot is a size on the space scale.
law dot_size_in_scale:
  {Spec.in_space_scale(T.dot_size()) == True{} : Bool}

# LAW: the status ring sits off its element by a step of the space scale, and is a hairline wide.
law ring_offset_in_scale:
  {Spec.in_space_scale(T.ring_offset()) == True{} : Bool}

law ring_width_in_scale:
  {Spec.in_space_scale(T.ring_width()) == True{} : Bool}

# LAW: the closed side bar fits its icon buttons: rail = control + 2 × padding, padding on the scale.
law side_rail_fits:
  {Spec.icon_button_fits(T.side_rail(), T.control_md(), T.side_padding()) == True{} : Bool}

# LAW: the open side bar and the window are on the 4 grid.
law side_width_on_grid:
  {Spec.on_grid(T.side_width()) == True{} : Bool}

law window_max_on_grid:
  {Spec.on_grid(T.window_max()) == True{} : Bool}

# LAW: the window's margin is on the space scale.
law window_margin_in_scale:
  {Spec.in_space_scale(T.window_margin()) == True{} : Bool}

# LAW: the agent in the toolbar is a control height, so it lines up with the buttons beside it.
law agent_sm_in_scale:
  {Spec.in_control_scale(T.agent_sm()) == True{} : Bool}

# LAW: the agent on its own is on the 4 grid.
law agent_lg_on_grid:
  {Spec.on_grid(T.agent_lg()) == True{} : Bool}

# ---------- Shortcuts: SPEC.bend says what they mean; KEYS.bend has the lib's keys ----------

# LAW: no two of the lib's keys clash (the same key and modifiers where both can be on).
law lib_keys_never_clash:
  {Spec.key_clashes(K.lib_keys()) == 0 : U32}

# LAW: the lib takes no key the browser or the system keeps (⌘/Ctrl + W, T, N, Q, L, R).
law lib_keys_not_reserved:
  {Spec.reserved_keys(K.lib_keys()) == 0 : U32}

# LAW: modifiers are exact. Shift+K is never K, whatever the key.
law shift_is_not_plain:
  for k: String
  {Spec.same_combo(Spec.shift(), k, 0, k) == False{} : Bool}

# LAW: modifiers are exact. ⌘K is never K, whatever the key.
law mod_is_not_plain:
  for k: String
  {Spec.same_combo(Spec.mod(), k, 0, k) == False{} : Bool}

# LAW: while the person types, a plain key types its letter: it runs nothing.
law plain_key_waits_while_typing:
  {Spec.fires(True{}, 0) == False{} : Bool}

# LAW: Shift alone doesn't make a key a shortcut while typing.
law shift_key_waits_while_typing:
  {Spec.fires(True{}, Spec.shift()) == False{} : Bool}

# LAW: a shortcut with ⌘/Ctrl runs even while typing.
law mod_key_runs_while_typing:
  {Spec.fires(True{}, Spec.mod()) == True{} : Bool}

# LAW: an app shortcut is on everywhere, so it clashes with any scope's key.
law app_scope_overlaps_all:
  for s: U32
  {Spec.scopes_overlap(0, s) == True{} : Bool}

# ---------- Diagram shapes: Mermaid's 14 flowchart shapes (DIAGRAM.bend) ----------
# Each is checked on all 14 shapes around four text boxes: one word, a long line, two lines, a short word.

# LAW: a return arrow meets the outline. For every shape, the point on a side at mid-height lies on the outline.
law return_arrow_meets_outline:
  {D.returns_meet_outline() == True{} : Bool}

# LAW: a self-loop meets the outline. For every shape, the point at the top where a self-loop enters lies on the outline.
law self_loop_meets_outline:
  {D.self_loops_meet_outline() == True{} : Bool}

# LAW: the text fits inside. For every shape, the text box with its padding is inside the outline.
law text_fits_inside:
  {D.text_fits_inside() == True{} : Bool}

# LAW: a circle is round. Start and Stop are as wide as they are tall.
law circle_is_round:
  {D.circles_are_round() == True{} : Bool}

# LAW: no shape, same as before. A node without a shape keeps today's size and its arrows meet the box.
law no_shape_same_as_before:
  {D.no_shape_is_the_box() == True{} : Bool}
