# AGENTS

- Aprenda Bend com `bend guide`. Não invente sintaxe.
- Rode `bun run check` (`bend PROOF.bend`) antes de cada commit. Commit com law quebrada não entra.
- **Não edite** `LAWS.bend` nem `SPEC.bend`. Se uma tarefa exigir isso, pare e pergunte.
- Todo valor visual novo entra em `TOKENS.bend` e é exposto em `ui.js`. Nenhum número solto em `ui.css`: só `var(--...)`.
- Componente novo só entra aqui quando **dois projetos** precisarem dele. Até lá, mora no projeto que o criou.
- Ao mudar algo visível: suba a versão em `package.json`, registre no `CHANGELOG.md` e crie a tag (`v0.x.y`).
- Sem atribuição de IA em commits ou PRs.
