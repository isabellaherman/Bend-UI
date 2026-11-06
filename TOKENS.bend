# Bend-UI — os valores do design system. Tema claro. Única fonte de verdade.

import Base

# Espaçamento
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

# Raio
def radius_xs() -> U32: 2
def radius_sm() -> U32: 4
def radius_md() -> U32: 6
def radius_lg() -> U32: 10
def radius_full() -> U32: 999

# Controles
def control_sm() -> U32: 24
def control_md() -> U32: 32
def control_lg() -> U32: 36

# Ícones
def icon_sm() -> U32: 14
def icon_md() -> U32: 16
def icon_lg() -> U32: 20
def icon_stroke() -> String: "1.75"

# Arte (imagens do jogo/produto): altura
def art_sm() -> U32: space_6()
def art_md() -> U32: space_8()
def art_lg() -> U32: 240

# Componentes: as escolhas que as laws vigiam
def btn_padding_x() -> U32: space_3()
def btn_height() -> U32: control_md()
def btn_radius() -> U32: radius_md()
def panel_padding() -> U32: space_4()
def icon_btn_sm_icon() -> U32: icon_md()
def icon_btn_sm_padding() -> U32: space_1()
def icon_btn_md_icon() -> U32: icon_md()
def icon_btn_md_padding() -> U32: space_2()
def icon_btn_lg_icon() -> U32: icon_lg()
def icon_btn_lg_padding() -> U32: space_2()
def field_gap() -> U32: space_1()
def form_gap() -> U32: space_4()
def segmented_padding() -> U32: space_hairline()
def segmented_outer_radius() -> U32: radius_md()
def segmented_inner_radius() -> U32: radius_sm()

# Tipografia
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
def duration_ms() -> U32: 120

# Cor (tema claro)
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
def color_law() -> String: "#2b8a3e"
def color_law_soft() -> String: "#ebf6ed"
def color_draft() -> String: "#b7791f"
def color_draft_soft() -> String: "#fbf3e4"
def color_conflict() -> String: "#c92a2a"
def color_conflict_soft() -> String: "#fdecec"
