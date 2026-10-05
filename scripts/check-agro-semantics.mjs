import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ts = require("../../../../../node_modules/typescript");
const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
process.chdir(clientDir);

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
const diags = [...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics()]
  .filter((d) => d.file && d.file.fileName.replace(/\\/g, "/").includes("Agro_widgetV5/src"));

const svg = [];
const other = [];
for (const d of diags) {
  const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
  const file = d.file.fileName.replace(/\\/g, "/");
  const line = d.file.getLineAndCharacterOfPosition(d.start).line + 1;
  const row = `${d.code} ${file.split("Agro_widgetV5/").pop()}:${line} ${msg.split("\n")[0]}`;
  if (d.code === 2307 && msg.includes(".svg")) svg.push(row);
  else other.push(row);
}
console.log("svg", svg.length, "other", other.length);
other.slice(0, 30).forEach((r) => console.log(r));
if (svg.length !== 9 || other.length !== 0) process.exit(1);
