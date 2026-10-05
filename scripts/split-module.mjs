import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ts = require("../../../../../node_modules/typescript");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apply = process.env.APPLY === "1";
const configPath = path.resolve(__dirname, process.env.SPLIT_CONFIG || "");
if (!process.env.SPLIT_CONFIG) {
  console.error("Need SPLIT_CONFIG");
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const srcPath = path.resolve(__dirname, config.src);
const outDir = path.resolve(__dirname, config.outDir);
const text = fs.readFileSync(srcPath, "utf8").replace(/\r\n/g, "\n");
if (text.includes("\r")) throw new Error("source is not LF");
const kind = srcPath.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
const sf = ts.createSourceFile(srcPath, text, ts.ScriptTarget.Latest, true, kind);
const srcDir = path.dirname(srcPath);

const GLOBALS = new Set([
  "document", "window", "localStorage", "sessionStorage", "navigator", "Document", "Window",
  "setTimeout", "clearTimeout", "setInterval", "clearInterval",
  "requestAnimationFrame", "cancelAnimationFrame",
  "Map", "Set", "WeakMap", "WeakSet", "Promise", "Partial", "Pick", "Omit", "Record", "Readonly", "Required",
  "Exclude", "Extract", "NonNullable", "Awaited", "Parameters", "ConstructorParameters", "InstanceType", "ReturnType",
  "EventListener", "Event", "CustomEvent", "MouseEvent", "KeyboardEvent", "PointerEvent",
  "Array", "Object", "String", "Number", "Boolean", "Date", "Math", "JSON",
  "console", "undefined", "Error", "Symbol", "Reflect", "Proxy", "RegExp",
  "HTMLElement", "HTMLDivElement", "HTMLInputElement", "HTMLButtonElement", "HTMLCanvasElement",
  "CanvasRenderingContext2D", "OffscreenCanvas", "Path2D",
  "AbortController", "AbortSignal", "URL", "URLSearchParams", "Blob", "Image", "ImageData",
  "ResizeObserver", "MutationObserver", "IntersectionObserver",
  "requestIdleCallback", "cancelIdleCallback",
  "DOMRect", "DOMRectReadOnly", "WheelEvent", "FocusEvent", "TouchEvent",
  "DragEvent", "ClipboardEvent", "FormData", "File", "FileReader",
  "TextDecoder", "TextEncoder", "performance", "fetch", "Headers", "Request", "Response", "RequestInit",
  "WebSocket", "XMLHttpRequest", "atob", "btoa", "crypto", "globalThis",
  "Node", "Element", "DocumentFragment", "SVGElement", "SVGPathElement", "EventListenerOptions", "CSS",
  "any", "void", "never", "unknown", "string", "number", "boolean", "bigint",
  "symbol", "object", "__esri", "JSX", "Infinity", "NaN", "isNaN", "isFinite",
  "parseInt", "parseFloat", "encodeURIComponent", "decodeURIComponent",
  "queueMicrotask", "structuredClone", "Intl", "getComputedStyle", "matchMedia",
  "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "Int8Array", "Int16Array", "Int32Array",
  "Float32Array", "Float64Array", "ArrayBuffer", "DataView", "SharedArrayBuffer",
  "BigInt", "WeakRef", "FinalizationRegistry",
]);

function lineOf(pos) {
  return sf.getLineAndCharacterOfPosition(pos).line + 1;
}
function hasExport(st) {
  return !!(st.modifiers && st.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword));
}
function declNames(st) {
  if (ts.isFunctionDeclaration(st) && st.name) return [st.name.text];
  if ((ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isEnumDeclaration(st) || ts.isClassDeclaration(st)) && st.name) return [st.name.text];
  if (ts.isVariableStatement(st)) {
    return st.declarationList.declarations.map((d) => (ts.isIdentifier(d.name) ? d.name.text : "")).filter(Boolean);
  }
  return [];
}
function isTypeOnlyStmt(st) {
  return ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st);
}
function groupForLine(line) {
  return config.groups.find((g) => line >= g.from && line <= g.to);
}

const imports = new Map();
for (const st of sf.statements) {
  if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier) || !st.importClause) continue;
  const spec = st.moduleSpecifier.text;
  const clause = st.importClause;
  const stmtType = !!clause.isTypeOnly;
  if (clause.name) imports.set(clause.name.text, { spec, typeOnly: stmtType, kind: "default" });
  const nb = clause.namedBindings;
  if (nb && ts.isNamespaceImport(nb)) imports.set(nb.name.text, { spec, typeOnly: stmtType, kind: "namespace" });
  if (nb && ts.isNamedImports(nb)) {
    for (const el of nb.elements) {
      imports.set(el.name.text, {
        spec,
        typeOnly: stmtType || !!el.isTypeOnly,
        kind: "named",
        imported: el.propertyName ? el.propertyName.text : el.name.text,
      });
    }
  }
}

const items = [];
for (const st of sf.statements) {
  if (ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) continue;
  const names = declNames(st);
  const line = lineOf(st.getStart(sf));
  if (!names.length && !ts.isExpressionStatement(st)) {
    throw new Error("unnamed statement at " + line + " " + ts.SyntaxKind[st.kind]);
  }
  items.push({ st, names, line, group: "", exported: hasExport(st), typeOnly: isTypeOnlyStmt(st) });
}

const nameToItem = new Map();
for (const item of items) for (const n of item.names) nameToItem.set(n, item);

function isNamePosition(node) {
  const p = node.parent;
  if (!p) return false;
  if (p.name === node) return true;
  if (ts.isPropertyAccessExpression(p) && p.name === node) return true;
  if (ts.isPropertyAssignment(p) && p.name === node) return true;
  if (ts.isJsxAttribute(p) && p.name === node) return true;
  if (ts.isQualifiedName(p) && p.right === node) return true;
  if ((ts.isJsxOpeningElement(p) || ts.isJsxClosingElement(p) || ts.isJsxSelfClosingElement(p)) && p.tagName === node) {
    return /^[a-z]/.test(node.text);
  }
  return false;
}
function boundNames(st) {
  const set = new Set();
  function bind(name) {
    if (!name) return;
    if (ts.isIdentifier(name)) set.add(name.text);
    else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
      for (const el of name.elements) if (ts.isBindingElement(el)) bind(el.name);
    }
  }
  function visit(node) {
    if (ts.isVariableDeclaration(node)) bind(node.name);
    if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isClassDeclaration(node) || ts.isMethodDeclaration(node)) && node.name && ts.isIdentifier(node.name)) set.add(node.name.text);
    if (ts.isParameter(node)) bind(node.name);
    if (ts.isCatchClause(node) && node.variableDeclaration) bind(node.variableDeclaration.name);
    if (ts.isTypeParameterDeclaration(node)) set.add(node.name.text);
    if (ts.isLabeledStatement(node)) set.add(node.label.text);
    ts.forEachChild(node, visit);
  }
  visit(st);
  return set;
}
function freeIdents(st) {
  const bound = boundNames(st);
  const found = new Set();
  function visit(node) {
    if (ts.isIdentifier(node) && !bound.has(node.text) && !isNamePosition(node)) found.add(node.text);
    ts.forEachChild(node, visit);
  }
  visit(st);
  return found;
}

const rankOf = new Map();
function rank(item) {
  if (rankOf.has(item)) return rankOf.get(item);
  rankOf.set(item, 0);
  let max = 0;
  for (const id of freeIdents(item.st)) {
    const other = nameToItem.get(id);
    if (other && other !== item) max = Math.max(max, rank(other) + 1);
  }
  rankOf.set(item, max);
  return max;
}
for (const item of items) {
  if (item.names.length) rank(item);
}
for (const item of items) {
  if (item.names.length) continue;
  let max = 0;
  for (const id of freeIdents(item.st)) {
    const other = nameToItem.get(id);
    if (other) max = Math.max(max, rankOf.get(other));
  }
  rankOf.set(item, max);
}
function fileForRank(value, line) {
  const group = config.groups.find((g) => {
    if (value < g.min || value > g.max) return false;
    if (g.from != null && (line < g.from || line > g.to)) return false;
    return true;
  });
  if (!group) throw new Error("no rank group for " + value + " @" + line);
  return group.file;
}
if (config.mode === "rank") {
  for (const item of items) item.group = fileForRank(rankOf.get(item), item.line);
  if (process.env.DEBUG_RANK) {
    for (const item of items) {
      if (item.names.some((n) => /syncAgri|loadModules|clearAgri|lastSelection|modulesPromise/.test(n))) {
        const callees = [...freeIdents(item.st)].filter((id) => nameToItem.has(id)).join(",");
        console.log("rank", rankOf.get(item), item.names[0], "callees", callees);
      }
    }
  }
} else {
  for (const item of items) {
    const group = groupForLine(item.line);
    if (!group) throw new Error("no group for " + item.names.join(",") + " @" + item.line);
    item.group = group.file;
  }
}

const byFile = new Map();
for (const item of items) {
  if (!byFile.has(item.group)) byFile.set(item.group, []);
  byFile.get(item.group).push(item);
}

const needsExport = new Set();
const fileEdges = new Map();
for (const item of items) {
  if (!fileEdges.has(item.group)) fileEdges.set(item.group, new Set());
  for (const id of freeIdents(item.st)) {
    const other = nameToItem.get(id);
    if (!other || other.group === item.group) continue;
    fileEdges.get(item.group).add(other.group);
    if (!other.exported) for (const n of other.names) needsExport.add(n);
  }
}
const seen = new Set();
const stack = new Set();
function dfs(file) {
  if (stack.has(file)) {
    console.error("file cycle at", file);
    return true;
  }
  if (seen.has(file)) return false;
  seen.add(file);
  stack.add(file);
  for (const next of fileEdges.get(file) || []) if (dfs(next)) return true;
  stack.delete(file);
  return false;
}
if ([...fileEdges.keys()].some((file) => dfs(file))) process.exit(2);
for (const [file, next] of fileEdges) console.log("edge", file, "->", [...next].join(", ") || "-");

const crossAssign = [];
for (const item of items) {
  function visit(node) {
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isIdentifier(node.left)
    ) {
      const other = nameToItem.get(node.left.text);
      if (other && other.group !== item.group && ts.isVariableStatement(other.st)) {
        crossAssign.push(node.left.text + " " + other.group + " <- " + item.group);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(item.st);
}
if (crossAssign.length) {
  console.error("cross-assign");
  [...new Set(crossAssign)].forEach((row) => console.error(row));
  process.exit(4);
}

function relSpec(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, "/").replace(/\.tsx?$/, "");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}
function retarget(spec, toDir) {
  if (!spec.startsWith(".")) return spec;
  const abs = path.normalize(path.join(srcDir, spec));
  let rel = path.relative(toDir, abs).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

let prevEnd = 0;
const ordered = [...items].sort((a, b) => a.st.getStart(sf) - b.st.getStart(sf));
const bodyByFile = new Map();
for (const item of ordered) {
  const start = item.st.getStart(sf);
  const from = Math.max(item.st.getFullStart(), prevEnd);
  let prelude = text.slice(from, start).replace(/^\n+/, "\n");
  if (!/\/\*|\/\//.test(prelude)) prelude = "\n";
  if (!prelude.endsWith("\n")) prelude += "\n";
  const exact = text.slice(start, item.st.end);
  let body = exact;
  if (item.names.some((n) => needsExport.has(n)) && !item.exported) body = "export " + body;
  if (!bodyByFile.has(item.group)) bodyByFile.set(item.group, []);
  bodyByFile.get(item.group).push({ text: prelude + body, exact, name: item.names[0] || "(expr)" });
  prevEnd = item.st.end;
}

function emitImports(file, list) {
  const need = new Map();
  function add(spec, entry) {
    if (!need.has(spec)) need.set(spec, []);
    const arr = need.get(spec);
    if (!arr.some((e) => e.local === entry.local && e.kind === entry.kind)) arr.push(entry);
  }
  const toDir = path.dirname(path.join(outDir, file));
  for (const item of list) {
    for (const id of freeIdents(item.st)) {
      if (GLOBALS.has(id)) continue;
      const local = nameToItem.get(id);
      if (local) {
        if (local.group === file) continue;
        const spec = relSpec(path.join(outDir, file), path.join(outDir, local.group));
        add(spec, { local: id, imported: id, typeOnly: local.typeOnly, kind: "named" });
        continue;
      }
      const ext = imports.get(id);
      if (!ext) continue;
      add(retarget(ext.spec, toDir), {
        local: id,
        imported: ext.imported || id,
        typeOnly: ext.typeOnly,
        kind: ext.kind,
      });
    }
  }
  const lines = [];
  for (const [spec, entries] of need) {
    const defaults = entries.filter((e) => e.kind === "default");
    const namespaces = entries.filter((e) => e.kind === "namespace");
    const named = entries.filter((e) => e.kind === "named");
    if (defaults.length) lines.push(`import ${defaults[0].local} from "${spec}";`);
    if (namespaces.length) lines.push(`import * as ${namespaces[0].local} from "${spec}";`);
    if (named.length) {
      const allType = named.every((e) => e.typeOnly);
      const bits = named.map((e) => {
        const alias = e.imported === e.local ? e.local : `${e.imported} as ${e.local}`;
        return !allType && e.typeOnly ? `type ${alias}` : alias;
      });
      lines.push(`import ${allType ? "type " : ""}{ ${bits.join(", ")} } from "${spec}";`);
    }
  }
  return lines;
}

const filesOut = new Map();
for (const [file, list] of byFile) {
  const importLines = emitImports(file, list);
  const bodies = bodyByFile.get(file).map((b) => b.text.replace(/^\n/, "")).join("\n");
  let out = importLines.join("\n");
  if (out) out += "\n";
  out += "\n" + bodies.replace(/^\n+/, "");
  if (!out.endsWith("\n")) out += "\n";
  out = out.replace(/^\n+/, "");
  if (!out.endsWith("\n")) out += "\n";
  filesOut.set(file, out);
}

const header = text.slice(0, sf.statements[0].getStart(sf)).replace(/\s+$/, "\n\n");
const exportFroms = [];
for (const st of sf.statements) {
  if (!ts.isExportDeclaration(st)) continue;
  if (st.moduleSpecifier || !st.exportClause || !ts.isNamedExports(st.exportClause)) {
    exportFroms.push(text.slice(st.getStart(sf), st.end));
    continue;
  }
  const bySpec = new Map();
  for (const el of st.exportClause.elements) {
    const localName = el.propertyName ? el.propertyName.text : el.name.text;
    const exportedName = el.name.text;
    const ext = imports.get(localName);
    if (!ext) throw new Error("local export has no import: " + localName);
    if (!bySpec.has(ext.spec)) bySpec.set(ext.spec, []);
    bySpec.get(ext.spec).push(exportedName === localName ? exportedName : `${localName} as ${exportedName}`);
  }
  for (const [spec, names] of bySpec) exportFroms.push(`export { ${names.join(", ")} } from "${spec}";`);
}
const barrelLines = [header.trimEnd(), ""];
for (const line of exportFroms) barrelLines.push(line, "");
for (const group of config.groups) {
  const list = byFile.get(group.file) || [];
  const values = [];
  const types = [];
  for (const item of list) {
    if (!item.exported) continue;
    for (const n of item.names) (item.typeOnly ? types : values).push(n);
  }
  const spec = relSpec(srcPath, path.join(outDir, group.file));
  if (values.length) barrelLines.push(`export { ${values.join(", ")} } from "${spec}";`);
  if (types.length) barrelLines.push(`export type { ${types.join(", ")} } from "${spec}";`);
}
let barrel = barrelLines.join("\n").replace(/\n{3,}/g, "\n\n");
if (!barrel.endsWith("\n")) barrel += "\n";

let verbatimBad = 0;
for (const [file, list] of bodyByFile) {
  const out = filesOut.get(file);
  for (const part of list) {
    if (!out.includes(part.exact)) {
      verbatimBad += 1;
      console.error("verbatim miss", file, part.name);
    }
  }
}
console.log("groups", config.groups.map((g) => `${g.file}:${(byFile.get(g.file) || []).length}`).join(" "));
console.log("verbatimBad", verbatimBad);
for (const [file, out] of filesOut) console.log(String(out.split("\n").length).padStart(5), file, "cr", out.includes("\r"));
console.log(String(barrel.split("\n").length).padStart(5), "barrel");
if (verbatimBad) process.exit(3);
if (!apply) {
  console.log("dry-run");
  process.exit(0);
}
fs.mkdirSync(outDir, { recursive: true });
for (const [file, out] of filesOut) fs.writeFileSync(path.join(outDir, file), out);
fs.writeFileSync(srcPath, barrel);
console.log("wrote", srcPath);
