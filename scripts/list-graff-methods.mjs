import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ts = require("../../../../../node_modules/typescript");
const file = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  process.env.WIDGET || "../src/panels/GraffPanel/runtime/widget.tsx",
);
const text = fs.readFileSync(file, "utf8");
const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let cls = null;
function find(n) {
  if (ts.isClassDeclaration(n) && n.name?.text === (process.env.CLASS || "AgriGraffWidget")) cls = n;
  ts.forEachChild(n, find);
}
find(sf);
for (const m of cls.members) {
  const name = m.name && ts.isIdentifier(m.name) ? m.name.text : ts.isConstructorDeclaration(m) ? "constructor" : "?";
  const mods = (m.modifiers || []).map((x) => x.getText(sf)).join(" ");
  const isFn = ts.isMethodDeclaration(m) || ts.isConstructorDeclaration(m) || (ts.isPropertyDeclaration(m) && m.initializer && ts.isArrowFunction(m.initializer));
  const a = sf.getLineAndCharacterOfPosition(m.getFullStart()).line + 1;
  const b = sf.getLineAndCharacterOfPosition(m.end).line + 1;
  const lines = b - a + 1;
  let kind = "field";
  let thin = false;
  if (isFn) {
    const fn = ts.isConstructorDeclaration(m) || ts.isMethodDeclaration(m) ? m : m.initializer;
    const body = fn.body;
    kind = ts.isMethodDeclaration(m) ? "method" : ts.isConstructorDeclaration(m) ? "ctor" : (body && ts.isBlock(body) ? "arrow-block" : "arrow-expr");
    const raw = body ? text.slice(body.getStart(sf), body.end) : "";
    thin = raw.length < 280 && raw.includes(" as unknown as ");
  }
  if (mods.includes("static")) kind = "static";
  const flag = !isFn ? "FIELD" : thin ? "THIN" : kind === "ctor" || kind === "static" ? kind.toUpperCase() : "MOVE";
  if (flag === "FIELD") continue;
  console.log(String(lines).padStart(4), String(a).padStart(5), flag.padEnd(10), name);
}
