# The design system's rules. Owned by the lib's owner: PROOF.bend must prove them.

import Base
import ./TOKENS.bend as T
import ./SPEC.bend as Spec

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
