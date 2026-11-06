# Bend-UI

Design system em [Bend](https://github.com/bendlang/bend). Os valores visuais moram em `TOKENS.bend` e as regras em `LAWS.bend`. Um padding fora da escala, um raio mal aninhado ou um ícone que não encaixa **não compila**: `bend PROOF.bend` falha.

## Instalar

```bash
bun add github:isabellaherman/Bend-UI
```

## Atualizar

```bash
bun update bend-ui
```

Para fixar uma versão: `bun add github:isabellaherman/Bend-UI#v0.2.0`.

## Usar

```js
// main.js
import "bend-ui";   // tokens do Bend + componentes + ícones
```

```html
<script type="module" src="./main.js"></script>

<button class="btn btn--primary">
  <svg class="icon"><use href="#i-scale"/></svg>
  Criar LAW
</button>
```

O projeto precisa do loader do Bend no `bunfig.toml`, apontando para um clone do [bendlang/bend](https://github.com/bendlang/bend):

```toml
[serve.static]
plugins = ["../bend/bend2/main.ts"]
```

## Tema

O tema troca só cor e fonte. Espaço, raio e tamanhos continuam presos às laws.

```js
import { theme } from "bend-ui";
import jaro from "./jaro.woff2";

theme({
  accent: "#ffd21f",
  accentFg: "#02090a",
  fontDisplay: { family: "Jaro", src: jaro },
});
```

## O que vem

| | |
|---|---|
| Componentes | `btn` (`--primary`, `--ghost`, `--sm`, `--lg`, `--icon`), `input`, `field`, `segmented`, `panel`, `toolbar`, `tag`, `kbd`, `icon`, `rows`/`row`, `art` |
| Texto | `display`, `heading`, `lead`, `text`, `list`, `meta`, `mono` |
| Ícones | plus, file-text, scale, triangle-alert, circle-check, x, chevron-down, list, code, wand-sparkles, search, panel-left |
| Tokens | espaço, raio, tipografia (inclui `--font-display`, `--text-display`), controles, ícones, arte, cor (tema claro) |

Vitrine de tudo: `bun run docs`.

## Regras (laws)

| Law | Garante |
|---|---|
| `*_padding_in_scale` | Espaço só da escala: 2, 4, 8, 12, 16, 24, 32, 48, 64 |
| `btn_height_in_scale` | Altura de controle: 24, 32 ou 36 |
| `icon_button_*_fits` | Botão só de ícone: ícone + 2 × padding = altura |
| `segmented_radius_nested` | Raio externo = raio interno + padding |
| `inside_less_than_between` | Espaço dentro do grupo < espaço entre grupos |

Teste: troque `btn_padding_x` para `10` em `TOKENS.bend` e rode `bun run check`.

## Contribuir

Leia o [`AGENTS.md`](AGENTS.md). `LAWS.bend` e `SPEC.bend` só mudam com aprovação da dona do repo.
