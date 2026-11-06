# Changelog

## 0.2.0 (2026-11-05)

Testada no patch notes do Dungeon Bend: a página usa só a lib + layout.

- `theme()`: tema por projeto. Troca só cor e fonte; espaço, raio e tamanhos continuam presos às laws.
- Fonte de título do tema: `--font-display`, com carregamento embutido (`theme({ fontDisplay: { family, src } })`).
- Texto: `.display`, `.heading`, `.lead`, `.text`, `.list`, `.meta`, `.mono`; token `--text-display` (56px).
- Lista clicável: `.rows` + `.row` (`__lead`, `__title`, `__meta`).
- Arte: `.art` (`--sm`, `--lg`); tokens `--art-sm`, `--art-md`, `--art-lg`.
- Correção: `.btn` usado como link não fica mais sublinhado.

## 0.1.0 (2026-11-05)

- Primeira versão, extraída do LawEditor.
- Tokens em `TOKENS.bend`: espaço (com hairline de 2px), raio, tipografia, controles (24/32/36), ícones, cor do tema claro.
- 9 laws: escala de espaço, alturas de controle, encaixe de botão só de ícone (sm/md/lg), raio aninhado, proximidade.
- Componentes: btn, input, field, segmented, panel, toolbar, tag, kbd, icon.
- 12 ícones (Lucide, ISC).
- `import "bend-ui"` liga tudo.
