// Reads ../LAWS.bend, ../BOARD_LAWS.bend and ../EDITOR_LAWS.bend into laws.data.js for the docs: each law, the sentence above it, and its code.
// Also lists BOARD.bend's values, each with law, undecided or derived.
// Run by `bun run docs`, so the docs always show the laws as they are.
const read = (f) => Bun.file(new URL(f, import.meta.url)).text();
const src = (await read("../LAWS.bend")) + "\n" + (await read("../BOARD_LAWS.bend")) + "\n" + (await read("../EDITOR_LAWS.bend"));
const laws = [];
let what = "";
const lines = src.split("\n");
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^# LAW: (.*)/);
  if (m) { what = m[1]; continue; }
  const l = lines[i].match(/^law ([a-z0-9_]+):/);
  if (!l) continue;
  const code = [lines[i]];
  while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) code.push(lines[++i]);
  laws.push({ name: l[1], what, code: code.join("\n") });
}
const boardLaws = await read("../BOARD_LAWS.bend");
const board = [...(await read("../BOARD.bend")).matchAll(/^def (\w+)\(\) -> \w+: (.*)$/gm)].map(([, key, body]) => ({
  key, state: /^\(/.test(body) ? "derived" : new RegExp(`B\\.${key}\\(\\)`).test(boardLaws) ? "law" : "undecided",
}));
await Bun.write(new URL("./laws.data.js", import.meta.url),
  "// Made by read-laws.js from ../LAWS.bend, ../BOARD_LAWS.bend, ../EDITOR_LAWS.bend and ../BOARD.bend. Don't edit.\nexport const LAWS = " + JSON.stringify(laws, null, 1) + ";\nexport const BOARD_VALUES = " + JSON.stringify(board) + ";\n");
console.log(`docs: ${laws.length} laws, ${board.length} board values`);
