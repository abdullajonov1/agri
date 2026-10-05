import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ts = require("../../../../../node_modules/typescript");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const widgetPath = path.resolve(__dirname, process.env.WIDGET || "../src/panels/GraffPanel/runtime/widget.tsx");
const hostPath = path.resolve(__dirname, process.env.HOST_PATH || "../src/panels/GraffPanel/runtime/graff-host.ts");
const className = process.env.CLASS || "AgriGraffWidget";
const hostName = process.env.HOST || "GraffWidgetHost";
const stateType = process.env.STATE_TYPE || "AgriGraffWidgetState";
const apply = process.env.APPLY === "1";

const cmd = ts.getParsedCommandLineOfConfigFile("tsconfig.json", {}, {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic: (d) => {
    console.error(ts.flattenDiagnosticMessageText(d.messageText, "\n"));
    process.exit(1);
  },
});
delete cmd.options.ignoreDeprecations;
const fileNames = cmd.fileNames.filter((f) => f.replace(/\\/g, "/").includes("Agro_widgetV5/src"));
const program = ts.createProgram(fileNames, cmd.options);
const checker = program.getTypeChecker();
const diags = [...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics()]
  .filter((d) => d.file && d.file.fileName.replace(/\\/g, "/").includes("Agro_widgetV5/src"));

const svg = [];
const other = [];
const missing = [];
for (const d of diags) {
  const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
  const file = d.file.fileName.replace(/\\/g, "/");
  const line = d.file.getLineAndCharacterOfPosition(d.start).line + 1;
  const row = `${d.code} ${file.split("Agro_widgetV5/").pop()}:${line} ${msg}`;
  if (d.code === 2307 && msg.includes(".svg")) svg.push(row);
  else other.push(row);
  const m = msg.match(new RegExp("^Property '([^']+)' does not exist on type '" + hostName + "'"));
  if ((d.code === 2339 || d.code === 2551) && m) missing.push(m[1]);
}
const uniq = [...new Set(missing)];
console.log("svg", svg.length, "other", other.length, "missing", uniq.length);
other.slice(0, 40).forEach((r) => console.log(r));

const want = widgetPath.split("\\").join("/").toLowerCase();
const widget = program.getSourceFiles().find((f) => f.fileName.split("\\").join("/").toLowerCase() === want);
if (!widget) {
  console.error("widget source missing", widgetPath);
  process.exit(1);
}
let cls = null;
function find(n) {
  if (ts.isClassDeclaration(n) && n.name?.text === className) cls = n;
  ts.forEachChild(n, find);
}
find(widget);
const flags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias | ts.TypeFormatFlags.UseFullyQualifiedType;
const lines = [];
for (const name of uniq) {
  const member = cls.members.find((m) => m.name && ts.isIdentifier(m.name) && m.name.text === name);
  if (!member) {
    console.log("NO MEMBER", name);
    continue;
  }
  const sym = checker.getSymbolAtLocation(member.name);
  const type = checker.getTypeOfSymbolAtLocation(sym, member.name);
  let printed = checker.typeToString(type, member.name, flags);
  printed = printed.replace(/import\([^)]*\)\./g, "");
  printed = printed.replace(/typeof this\.state\.(\w+)/g, stateType + '["$1"]');
  if (/^-?\d+(\.\d+)?$/.test(printed)) printed = "number";
  lines.push(`  ${name}: ${printed};`);
}
console.log(lines.join("\n"));
if (apply && lines.length) {
  const host = fs.readFileSync(hostPath, "utf8").replace(/\r\n/g, "\n");
  const next = host.replace(/\n}\s*$/, "\n" + lines.join("\n") + "\n}\n");
  fs.writeFileSync(hostPath, next, "utf8");
  console.log("host updated", lines.length);
}
