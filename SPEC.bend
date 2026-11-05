# O que cada regra significa. Arquivo da dona da lib: fica fixo junto com LAWS.bend,
# para que ninguém mude o significado de uma law mudando um helper.

import Base

# A escala de espaçamento: 0, 2 (hairline), 4, 8, 12, 16, 24, 32, 48, 64.
def in_space_scale(+n: U32) -> Bool:
  (U32.is_eq(n, 0) || U32.is_eq(n, 2) || U32.is_eq(n, 4) || U32.is_eq(n, 8) || U32.is_eq(n, 12)
    || U32.is_eq(n, 16) || U32.is_eq(n, 24) || U32.is_eq(n, 32)
    || U32.is_eq(n, 48) || U32.is_eq(n, 64))

# Um botão só de ícone encaixa: ícone + 2 × padding = altura, com o padding na escala.
def icon_button_fits(+height: U32, +icon: U32, +pad: U32) -> Bool:
  (U32.is_eq(height, (icon + pad + pad : U32)) && in_space_scale(pad))

# As alturas de controle: 24, 32, 36 (todas na grade de 4).
def in_control_scale(+n: U32) -> Bool:
  (U32.is_eq(n, 24) || U32.is_eq(n, 32) || U32.is_eq(n, 36))
