// Reads ../LAWS.bend into laws.data.js for the docs: each law, the sentence above it, and its code.
// Run by `bun run docs`, so the docs always show the laws as they are.
const src = await Bun.file(new URL("../LAWS.bend", import.meta.url)).text();
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
await Bun.write(new URL("./laws.data.js", import.meta.url),
  "// Made by read-laws.js from ../LAWS.bend. Don't edit.\nexport const LAWS = " + JSON.stringify(laws, null, 1) + ";\n");
console.log(`docs: ${laws.length} laws`);
