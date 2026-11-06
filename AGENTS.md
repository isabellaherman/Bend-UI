# AGENTS

- Learn Bend with `bend guide`. Don't invent syntax.
- Run `bun run check` (`bend PROOF.bend`) before every commit. A commit with a broken law doesn't go in.
- **Don't edit** `LAWS.bend` or `SPEC.bend`. If a task needs that, stop and ask.
- Every new visual value goes in `TOKENS.bend` and is exposed in `ui.js`. No loose numbers in `ui.css`: only `var(--...)`.
- Logic and motion go in `.bend` files (like `MOTION.bend`). JS only reads input and draws what Bend returns.
- Flow: a design is approved as an artifact first. Whatever it needs that the lib lacks goes into the lib first, then the project pulls it.
- Before committing, show the build to the repo owner for validation.
- When something visible changes: bump only the last number of the version in `package.json` (0.3.0 → 0.3.1), log it in `CHANGELOG.md` and create the tag (`v0.x.y`).
- Everything in English: code, comments, docs, UI.
- No AI attribution in commits or PRs.
