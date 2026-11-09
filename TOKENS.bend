# Bend-UI: the design system's values. Light theme. Single source of truth.

import Base

# Space
def space_0() -> U32: 0
def space_hairline() -> U32: 2
def space_1() -> U32: 4
def space_2() -> U32: 8
def space_3() -> U32: 12
def space_4() -> U32: 16
def space_5() -> U32: 24
def space_6() -> U32: 32
def space_7() -> U32: 48
def space_8() -> U32: 64

# Radius
def radius_xs() -> U32: 2
def radius_sm() -> U32: 4
def radius_md() -> U32: 6
def radius_lg() -> U32: 10
def radius_full() -> U32: 999

# Controls
def control_sm() -> U32: 24
def control_md() -> U32: 32
def control_lg() -> U32: 36
def control_xl() -> U32: 48

# Icons
def icon_sm() -> U32: 14
def icon_md() -> U32: 16
def icon_lg() -> U32: 20
def icon_xl() -> U32: space_5()
def icon_stroke() -> String: "1.75"

# Art (game/product images): height
def art_sm() -> U32: space_6()
def art_md() -> U32: space_8()
def art_lg() -> U32: 240

# Components: the choices the laws watch
# A button's padding on each side, per size (md is btn_padding_x, which the law checks).
def btn_padding_x() -> U32: space_3()
def btn_padding_x_sm() -> U32: space_2()
def btn_padding_x_lg() -> U32: space_4()
def btn_padding_x_xl() -> U32: space_5()
# .btn--wide: the same height, one more step on each side.
def btn_wide_padding_x() -> U32: space_4()
def btn_wide_padding_x_sm() -> U32: space_3()
def btn_wide_padding_x_lg() -> U32: space_5()
def btn_wide_padding_x_xl() -> U32: space_6()
def btn_height() -> U32: control_md()
def btn_radius() -> U32: radius_md()
def panel_padding() -> U32: space_4()
def icon_btn_sm_icon() -> U32: icon_md()
def icon_btn_sm_padding() -> U32: space_1()
def icon_btn_md_icon() -> U32: icon_md()
def icon_btn_md_padding() -> U32: space_2()
def icon_btn_lg_icon() -> U32: icon_lg()
def icon_btn_lg_padding() -> U32: space_2()
def icon_btn_xl_icon() -> U32: icon_xl()
def icon_btn_xl_padding() -> U32: space_3()
def field_gap() -> U32: space_1()
def form_gap() -> U32: space_4()
def form_label_width() -> U32: 128   # .form--inline: the labels' column
def segmented_padding() -> U32: space_hairline()
def segmented_outer_radius() -> U32: radius_md()
def segmented_inner_radius() -> U32: radius_sm()
# A segmented item: control_md minus padding and border on both sides (32 - 2 × (2 + 1)).
def segmented_item() -> U32: 26

# Tag: a small label beside a line. Shorter than a control. Its padding (6) is off the space scale.
def tag_height() -> U32: 20
def tag_padding_x() -> U32: 6
# Kbd: a key drawn as a cap; its bottom border is thicker, so it reads as pressed into the page.
def kbd_padding_y() -> U32: 1
def kbd_depth() -> U32: space_hairline()

# Focus: the ring a keyboard user sees on the focused element.
def focus_width() -> U32: space_hairline()       # an outline this wide
def focus_offset() -> U32: 1                     # this far off a button
def focus_offset_round() -> U32: space_hairline() # this far off a round element (the agent's face)
def focus_halo() -> U32: 3                       # a soft halo instead of an outline (fields, disclosure)

# Link underline on a row's title when hovered
def underline_offset() -> U32: 5
def underline_width() -> U32: space_hairline()

# Status: the dot beside a line, and the ring around a round element
def dot_size() -> U32: space_2()
# A thread node: the dot of a block while work runs through it, big enough to show progress.
def node_size() -> U32: space_4()
# A block is at least this many lines of its text tall. Every block in a document shares it.
def block_min_lines() -> U32: 1
def ring_offset() -> U32: space_1()
def ring_width() -> U32: space_hairline()

# Side bar: closed it is a rail of icon buttons; open it shows labels
def side_padding() -> U32: space_2()
def side_rail() -> U32: 48
def side_width() -> U32: 256

# Window: on wide screens the app sits in a framed window; below the breakpoint it fills the screen
def window_margin() -> U32: space_5()
def window_max() -> U32: 1152
def breakpoint() -> U32: 720

# Layers: what sits above what (z-index). Higher is on top.
def layer_thread() -> U32: 1
def layer_foot() -> U32: 4
def layer_dock() -> U32: 5
def layer_side() -> U32: 20     # the side bar over the content, on narrow screens
def layer_menu() -> U32: 30
def layer_fly() -> U32: 50      # the agent's face while it flies between two places
# Inside a component: a part lifted above its siblings, and a part above that.
def layer_part() -> U32: 1
def layer_part_top() -> U32: 2

# Agent: the face, in the toolbar (sm) or on its own (lg)
def agent_sm() -> U32: control_md()
def agent_lg() -> U32: 96
# The face alone in an empty chat, before the first message
def agent_xl() -> U32: 160

# Chat: a conversation that flows, with the composer fixed under it
def msg_max() -> U32: 480            # the person's message, at most this wide
def msg_gap() -> U32: space_5()      # space between messages
def composer_max() -> U32: 160       # the composer grows with its text up to this, then scrolls

# Type
def font_sans() -> String: "\"Inter\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", sans-serif"
def font_display() -> String: font_sans()
def font_mono() -> String: "\"JetBrains Mono\", ui-monospace, \"SF Mono\", Menlo, Consolas, monospace"
def text_xs() -> U32: 11
def text_sm() -> U32: 12
def text_md() -> U32: 13
def text_lg() -> U32: 15
def text_xl() -> U32: 18
def text_2xl() -> U32: 24
def text_display() -> U32: 56
def weight_regular() -> U32: 400
def weight_medium() -> U32: 500
def weight_semibold() -> U32: 600
def border_width() -> U32: 1
def leading_tight() -> String: "1.25"
def leading_ui() -> String: "1.4"
def leading_body() -> String: "1.65"
def measure_ch() -> U32: 68
def shadow_float() -> String: "0 4px 16px rgb(0 0 0 / 0.12), 0 0 0 1px rgb(0 0 0 / 0.04)"

# Text roles: a screen's hierarchy, section > group > item > detail. Each is a step of the type scale.
def role_section() -> U32: text_xl()
def role_group() -> U32: text_lg()
def role_item() -> U32: text_md()
def role_detail() -> U32: text_sm()
# Outline: a group's children sit this far inside it.
def outline_indent() -> U32: space_4()

# Motion
def duration_ms() -> U32: 120
def duration_slow_ms() -> U32: 960
def ease() -> String: "cubic-bezier(.2, .8, .2, 1)"
# Overshoots a little, then settles: for things that arrive or fill (a node, a pop).
def ease_spring() -> String: "cubic-bezier(.34, 1.56, .64, 1)"
def duration_enter_ms() -> U32: 360      # an item arriving, a block opening
def duration_connect_ms() -> U32: 560    # a line connecting, a block taking its new size
def duration_read_ms() -> U32: 2400      # one slow pass of light over text being read
def duration_glint_ms() -> U32: 1100     # one glint along a finished thread
def stagger_ms() -> U32: 70              # between the items of a group, one after another
def creep_ms() -> U32: 1800              # pace of work in progress (see creep in MOTION.bend)
def blur_form() -> U32: space_1()        # how soft text starts when it forms

# Color (light theme)
def color_bg() -> String: "#fafaf9"
def color_surface() -> String: "#ffffff"
def color_surface_2() -> String: "#f4f4f2"
def color_border() -> String: "#e6e5e1"
def color_border_strong() -> String: "#cfcdc7"
def color_text() -> String: "#1c1b19"
def color_text_2() -> String: "#5f5d58"
def color_text_3() -> String: "#8f8c86"
def color_accent() -> String: "#3b5bdb"
def color_accent_fg() -> String: "#ffffff"
def color_accent_soft() -> String: "#eef1fd"
def color_success() -> String: "#2b8a3e"
def color_success_soft() -> String: "#ebf6ed"
def color_warning() -> String: "#b7791f"
def color_warning_soft() -> String: "#fbf3e4"
# Text in a tone on its soft fill, at 4.5:1 or more (WCAG AA): success and warning are too light for that.
def color_success_text() -> String: "#237a35"
def color_warning_text() -> String: "#946119"
def color_danger() -> String: "#c92a2a"
def color_danger_soft() -> String: "#fdecec"

# Code (Snow): a white ground for code boxes, and a color for each kind of piece (SYNTAX.bend).
# Each color stays at 5.7:1 or more on the ground (WCAG AA).
def syntax_bg() -> String: "#ffffff"
def syntax_border() -> String: "#d0d7de"
def syntax_fg() -> String: "#1f2328"
def syntax_keyword() -> String: "#c4202b"
def syntax_type() -> String: "#7444cf"
def syntax_string() -> String: "#0a3069"
def syntax_number() -> String: "#0550ae"
def syntax_comment() -> String: "#5f6870"
def syntax_punct() -> String: "#424a53"
def syntax_name() -> String: "#5a32a3"

# Workspace components: every new visual value is owned here.
def dialog_padding() -> U32: space_5()
def dialog_screen_gap() -> U32: space_4()
def dialog_backdrop_percent() -> U32: 40
def feedback_padding_x() -> U32: space_4()
def feedback_padding_y() -> U32: space_3()
def feedback_duration_ms() -> U32: 6000
def workbench_padding() -> U32: space_6()
def workbench_padding_narrow() -> U32: space_4()
def workbench_gap() -> U32: space_5()
def workbench_pane_padding() -> U32: space_4()
def source_min_lines() -> U32: 8
def preview_min_height() -> U32: 256
def preview_max_height() -> U32: 640
def snapshot_max_height() -> U32: 192
def breadcrumb_gap() -> U32: space_2()

# Button: a filled button lightens this much on hover (as before, now a token), and a disabled one is this
# see-through (percent).
def btn_hover_brightness() -> String: "1.08"
def disabled_opacity() -> U32: 50

# Input: a textarea starts this tall (three md controls).
def textarea_min_height() -> U32: 96

# Canvas: the dots of an editable surface are this far apart.
def canvas_gap() -> U32: space_5()

# Diagram: a node is at least this wide, and grows in steps of this much (DIAGRAM.bend: node_width).
def diagram_node_min() -> U32: 128
def diagram_node_step() -> U32: space_5()

# Chart: a series' color is the accent this strong (percent), mixed toward the surface.
def chart_tone_1() -> U32: 100
def chart_tone_2() -> U32: 66
def chart_tone_3() -> U32: 40
def chart_tone_4() -> U32: 22
def chart_gap() -> U32: space_hairline()   # the surface between slices
def chart_lift() -> U32: space_1()         # how far a pointed slice steps out
def chart_hole() -> U32: 60                # a donut's hole, percent of its radius
def chart_dim() -> U32: 40                 # the rest while one is pointed, percent opacity
def chart_bar_max() -> U32: space_5()      # a bar is never wider
def chart_bar_gap() -> U32: space_2()      # the least space between two bars
def chart_axis_x() -> U32: space_6()       # the labels' column, left of the plot
def chart_axis_y() -> U32: space_5()       # the labels' row, under the plot
