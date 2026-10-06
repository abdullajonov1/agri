import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ts = require("../../../../../node_modules/typescript");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const widgetPath = path.resolve(__dirname, process.env.WIDGET || "../src/panels/GraffPanel/runtime/widget.tsx");
const outRel = process.env.OUT;
const names = (process.env.NAMES || "").split(",").map((s) => s.trim()).filter(Boolean);
const apply = process.env.APPLY === "1";
const className = process.env.CLASS || "AgriGraffWidget";
const hostName = process.env.HOST || "GraffWidgetHost";
const hostImport = process.env.HOST_IMPORT || "../graff-host";
const hostSpec = process.env.HOST_SPEC || "./graff-host";
const staticRewrite = new Map();
const staticSpec = process.env.STATIC_REWRITE === undefined
  ? "graffLog:graffLog,INDEX_COLORS:INDEX_COLORS,VEGETATION_IMAGE_LAYER_ID:VEGETATION_IMAGE_LAYER_ID"
  : process.env.STATIC_REWRITE;
for (const part of staticSpec.split(",")) {
  const [key, value] = part.split(":");
  if (key && value) staticRewrite.set(key.trim(), value.trim());
}
if (!outRel || !names.length) {
  console.error("Need NAMES and OUT");
  process.exit(1);
}
const outPath = path.resolve(path.dirname(widgetPath), outRel);
const widgetDir = path.dirname(widgetPath);
const serviceDir = path.dirname(outPath);

const GLOBALS = new Set([
  "document", "window", "localStorage", "sessionStorage", "navigator", "Document", "Window",
  "setTimeout", "clearTimeout", "setInterval", "clearInterval",
  "requestAnimationFrame", "cancelAnimationFrame",
  "Map", "Set", "Promise", "Partial", "Pick", "Omit", "Record", "Readonly", "Required", "Exclude", "Extract", "NonNullable", "Awaited", "Parameters", "ConstructorParameters", "InstanceType", "ReturnType",
  "EventListener", "Event", "CustomEvent", "MouseEvent", "KeyboardEvent", "PointerEvent",
  "Array", "Object", "String", "Number", "Boolean", "Date", "Math", "JSON",
  "console", "undefined", "Error", "Symbol", "Reflect", "Proxy", "RegExp",
  "HTMLElement", "HTMLDivElement", "HTMLInputElement", "HTMLButtonElement",
  "AbortController", "AbortSignal", "URL", "URLSearchParams", "Blob", "Image", "ImageData",
  "ResizeObserver", "MutationObserver", "IntersectionObserver",
  "requestIdleCallback", "cancelIdleCallback",
  "HTMLCanvasElement", "CanvasRenderingContext2D", "OffscreenCanvas", "Path2D",
  "DOMRect", "DOMRectReadOnly", "WheelEvent", "FocusEvent", "TouchEvent",
  "DragEvent", "ClipboardEvent", "FormData", "File", "FileReader",
  "TextDecoder", "TextEncoder", "performance", "fetch", "Headers", "Request", "Response", "RequestInit",
  "WebSocket", "XMLHttpRequest", "atob", "btoa", "crypto", "globalThis",
  "Node", "Element", "DocumentFragment", "SVGElement", "SVGPathElement", "EventListenerOptions", "CSS",
  "any", "void", "never", "unknown", "string", "number", "boolean", "bigint",
  "symbol", "object", "__esri", "JSX", "Infinity", "NaN", "isNaN", "isFinite",
  "parseInt", "parseFloat", "encodeURIComponent", "decodeURIComponent",
  "queueMicrotask", "structuredClone", "Intl", "getComputedStyle", "matchMedia",
]);

const text = fs.readFileSync(widgetPath, "utf8").replace(/\r\n/g, "\n");
if (text.includes("\r")) throw new Error("widget is not LF");
const sf = ts.createSourceFile(widgetPath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const cls = sf.statements.find((s) => ts.isClassDeclaration(s) && s.name?.text === className);
if (!cls) throw new Error("class missing");

const reps = [];
function walkRep(n) {
  if (n.kind === ts.SyntaxKind.ThisKeyword) {
    reps.push({ start: n.getStart(sf), end: n.end, text: "__AGRI_HOST__" });
  }
  if (
    ts.isPropertyAccessExpression(n) &&
    ts.isIdentifier(n.expression) &&
    n.expression.text === className &&
    staticRewrite.has(n.name.text)
  ) {
    reps.push({ start: n.getStart(sf), end: n.end, text: staticRewrite.get(n.name.text) });
  }
  ts.forEachChild(n, walkRep);
}
walkRep(sf);

function applyRange(from, to) {
  const sliceReps = reps.filter((r) => r.start >= from && r.end <= to).sort((a, b) => b.start - a.start);
  let s = text.slice(from, to);
  for (const r of sliceReps) {
    const a = r.start - from;
    const b = r.end - from;
    s = s.slice(0, a) + r.text + s.slice(b);
  }
  return s;
}

function dedent(src, label) {
  return src.split("\n").map((line, idx) => {
    if (line === "") return line;
    if (!line.startsWith("  ")) throw new Error(`dedent ${label} line ${idx + 1}: ${JSON.stringify(line)}`);
    return line.slice(2);
  }).join("\n");
}

function attachStart(node) {
  const start = node.getStart(sf);
  const lines = text.split("\n");
  let offset = 0;
  let lineIdx = 0;
  for (; lineIdx < lines.length; lineIdx++) {
    const next = offset + lines[lineIdx].length + 1;
    if (start < next) break;
    offset = next;
  }
  let i = lineIdx - 1;
  let kept = lineIdx;
  while (i >= 0) {
    const line = lines[i];
    if (/^\s*\/\*(?!\*)/.test(line)) break;
    if (/^\s*$/.test(line)) break;
    if (/^\s*\/\//.test(line) || /^\s*\/\*\*/.test(line) || /^\s*\*/.test(line)) {
      kept = i;
      i--;
      continue;
    }
    break;
  }
  let pos = 0;
  for (let n = 0; n < kept; n++) pos += lines[n].length + 1;
  return pos;
}

function bindingNames(name, into) {
  if (!name) return;
  if (ts.isIdentifier(name)) into.add(name.text);
  else ts.forEachChild(name, (n) => {
    if (ts.isBindingElement(n)) bindingNames(n.name, into);
  });
}

function fnOf(member) {
  if (ts.isMethodDeclaration(member) || ts.isConstructorDeclaration(member)) return member;
  if (ts.isPropertyDeclaration(member) && member.initializer && ts.isArrowFunction(member.initializer)) return member.initializer;
  return null;
}

const localTypes = new Set();
for (const st of sf.statements) {
  if ((ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)) && st.name) localTypes.add(st.name.text);
}
const importMap = new Map();
for (const st of sf.statements) {
  if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue;
  const spec = st.moduleSpecifier.text;
  const clause = st.importClause;
  if (!clause) continue;
  const typeOnly = Boolean(clause.isTypeOnly);
  if (clause.name) importMap.set(clause.name.text, { spec, typeOnly, imported: "default" });
  if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
    importMap.set(clause.namedBindings.name.text, { spec, typeOnly, imported: "*" });
  }
  if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
    for (const el of clause.namedBindings.elements) {
      importMap.set(el.name.text, {
        spec,
        typeOnly: typeOnly || Boolean(el.isTypeOnly),
        imported: el.propertyName ? el.propertyName.text : el.name.text,
      });
    }
  }
}

function rewriteSpec(spec) {
  if (!spec.startsWith(".")) return spec;
  const abs = path.resolve(widgetDir, spec);
  let rel = path.relative(serviceDir, abs).split(path.sep).join("/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

function usedIdents(member, fn) {
  const locals = new Set([member.name.text]);
  function takeParams(f) {
    f.parameters.forEach((p) => bindingNames(p.name, locals));
  }
  takeParams(fn);
  const idents = new Set();
  function walk(n) {
    if (ts.isCatchClause(n) && n.variableDeclaration) bindingNames(n.variableDeclaration.name, locals);
    if (ts.isVariableDeclaration(n)) bindingNames(n.name, locals);
    if (ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n) || ts.isConstructorDeclaration(n)) {
      n.parameters.forEach((p) => bindingNames(p.name, locals));
    }
    if (ts.isIdentifier(n)) {
      const parent = n.parent;
      if (parent && ts.isPropertyAccessExpression(parent) && parent.name === n) return;
      if (parent && ts.isPropertyAccessExpression(parent) && parent.expression === n && n.text === className && staticRewrite.has(parent.name.text)) return;
      if (parent && ts.isQualifiedName(parent) && parent.right === n) return;
      if (parent && (ts.isPropertySignature(parent) || ts.isMethodSignature(parent) || ts.isPropertyAssignment(parent)) && parent.name === n) return;
      if (parent && ts.isParameter(parent) && parent.name === n) return;
      if (parent && (ts.isBreakStatement(parent) || ts.isContinueStatement(parent) || ts.isLabeledStatement(parent)) && parent.label === n) return;
      if (parent && ts.isBindingElement(parent) && (parent.name === n || parent.propertyName === n)) return;
      if (parent && ts.isTypeReferenceNode(parent) && parent.typeName === n && n.text === "const") return;
      if (parent && ts.isJsxAttribute(parent) && parent.name === n) return;
      if (parent && (ts.isJsxOpeningElement(parent) || ts.isJsxClosingElement(parent) || ts.isJsxSelfClosingElement(parent)) && parent.tagName === n && /^[a-z]/.test(n.text)) return;
      if (locals.has(n.text) || GLOBALS.has(n.text)) return;
      idents.add(n.text);
    }
    ts.forEachChild(n, walk);
  }
  walk(member);
  return idents;
}

const members = names.map((name) => {
  const member = cls.members.find((m) => m.name && ts.isIdentifier(m.name) && m.name.text === name);
  if (!member) throw new Error("missing member " + name);
  const fn = fnOf(member);
  if (!fn || !fn.body) throw new Error("not a function " + name);
  const mods = (member.modifiers || []).map((m) => m.getText(sf));
  if (mods.includes("static")) throw new Error("static " + name);
  return { name, member, fn };
});

const needed = new Map();
let usesJsx = false;
const unknown = [];
for (const item of members) {
  function seeJsx(n) {
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) usesJsx = true;
    ts.forEachChild(n, seeJsx);
  }
  seeJsx(item.member);
  for (const id of usedIdents(item.member, item.fn)) {
    if (id === hostName) continue;
    if (localTypes.has(id)) {
      if (!needed.has(id)) needed.set(id, { spec: "./widget", typeOnly: true, imported: id });
      continue;
    }
    const imp = importMap.get(id);
    if (!imp) unknown.push(id + " in " + item.name);
    else if (!needed.has(id)) needed.set(id, imp);
  }
}
const movedNodes = new Set(members.map((item) => item.member));
function insideMoved(node) {
  let n = node;
  while (n) {
    if (movedNodes.has(n)) return true;
    n = n.parent;
  }
  return false;
}
function findTopDecl(name) {
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name?.text === name) return st;
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && d.name.text === name) return st;
      }
    }
  }
  return null;
}
function usesOutside(name, decl) {
  let count = 0;
  function walk(node) {
    if (node === decl) return;
    if (ts.isIdentifier(node) && node.text === name && !insideMoved(node)) {
      const parent = node.parent;
      const declName = parent && (ts.isFunctionDeclaration(parent) || ts.isVariableDeclaration(parent)) && parent.name === node;
      if (!declName) count++;
    }
    ts.forEachChild(node, walk);
  }
  walk(sf);
  return count;
}
const movedDecls = [];
const stillUnknown = [];
for (const item of unknown) {
  const id = item.split(" in ")[0];
  const decl = findTopDecl(id);
  if (!decl || usesOutside(id, decl) > 0) stillUnknown.push(item);
  else if (!movedDecls.includes(decl)) movedDecls.push(decl);
}
if (stillUnknown.length) {
  console.error(stillUnknown.join("\n"));
  throw new Error("unknown idents " + stillUnknown.length);
}
for (const decl of movedDecls) {
  const idents = new Set();
  const locals = new Set();
  function walk(n) {
    if (ts.isFunctionLike(n)) {
      n.parameters.forEach((p) => bindingNames(p.name, locals));
      (n.typeParameters || []).forEach((tp) => locals.add(tp.name.text));
    }
    if (ts.isCatchClause(n) && n.variableDeclaration) bindingNames(n.variableDeclaration.name, locals);
    if (ts.isVariableDeclaration(n)) bindingNames(n.name, locals);
    if (ts.isIdentifier(n)) {
      const parent = n.parent;
      if (locals.has(n.text)) return;
      if (parent && ts.isPropertyAccessExpression(parent) && parent.name === n) return;
      if (parent && (ts.isFunctionDeclaration(parent) || ts.isVariableDeclaration(parent)) && parent.name === n) return;
      if (GLOBALS.has(n.text) || localTypes.has(n.text)) return;
      idents.add(n.text);
    }
    ts.forEachChild(n, walk);
  }
  walk(decl);
  for (const id of idents) {
    if (needed.has(id)) continue;
    const imp = importMap.get(id);
    if (imp) needed.set(id, imp);
    else if (!movedDecls.some((d) => {
      if (ts.isFunctionDeclaration(d) && d.name?.text === id) return true;
      if (ts.isVariableStatement(d)) return d.declarationList.declarations.some((x) => ts.isIdentifier(x.name) && x.name.text === id);
      return false;
    })) throw new Error("decl import missing " + id);
  }
}

function paramText(fn) {
  return fn.parameters.map((p) => applyRange(p.getStart(sf), p.end)).join(", ");
}
function typeText(fn) {
  if (!fn.type) return "";
  return applyRange(fn.type.getStart(sf), fn.type.end);
}
function callArgs(fn) {
  const list = fn.parameters.map((p) => p.name.getText(sf));
  return list.length ? ", " + list.join(", ") : "";
}
function isAsync(member, fn) {
  return [...(member.modifiers || []), ...(fn.modifiers || [])].some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
}

function reverseHost(src) {
  let out = src.replace(/__AGRI_HOST__\./g, "this.");
  const pairs = [...staticRewrite.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [prop, repl] of pairs) {
    out = out.replace(new RegExp("\\b" + repl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g"), className + "." + prop);
  }
  return out;
}

const chunks = [];
const wrappers = [];
for (const item of members) {
  const { name, member, fn } = item;
  const from = attachStart(member);
  const head = text.slice(from, member.getStart(sf));
  const headDedent = head ? dedent(head.replace(/\s*$/, "\n"), name + " head").replace(/\n$/, "") : "";
  const params = paramText(fn);
  const ret = typeText(fn);
  const retPart = ret ? ": " + ret : "";
  const asyncKw = isAsync(member, fn) ? "async " : "";
  const hostParams = params ? `host: ${hostName}, ` + params : `host: ${hostName}`;
  let bodyOut;
  if (ts.isBlock(fn.body)) {
    let raw = applyRange(fn.body.getStart(sf) + 1, fn.body.end - 1);
    if (raw.startsWith("\n")) raw = raw.slice(1);
    raw = raw.replace(/\n[ \t]*$/, "");
    bodyOut = dedent(raw, name);
    const originalRaw = text.slice(fn.body.getStart(sf) + 1, fn.body.end - 1).replace(/^\n/, "").replace(/\n[ \t]*$/, "");
    const reversed = reverseHost(bodyOut.split("\n").map((line) => (line ? "  " + line : line)).join("\n"));
    if (reversed !== originalRaw) {
      const a = reversed.split("\n");
      const b = originalRaw.split("\n");
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i] !== b[i]) {
          console.error("VERBATIM", name, i + 1);
          console.error("NEW", JSON.stringify(a[i]));
          console.error("OLD", JSON.stringify(b[i]));
          break;
        }
      }
      throw new Error("verbatim mismatch " + name);
    }
    const thisCount = (originalRaw.match(/\bthis\./g) || []).length;
    const hostCount = (bodyOut.match(/__AGRI_HOST__\./g) || []).length;
    console.log("verbatim", name, "this", thisCount, "host", hostCount);
    bodyOut = bodyOut.replace(/__AGRI_HOST__/g, "host");
  } else {
    const originalExpr = text.slice(fn.body.getStart(sf), fn.body.end);
    bodyOut = applyRange(fn.body.getStart(sf), fn.body.end);
    if (reverseHost(bodyOut) !== originalExpr) throw new Error("verbatim expr mismatch " + name);
    console.log("verbatim", name, "expr", (originalExpr.match(/\bthis\./g) || []).length, (bodyOut.match(/__AGRI_HOST__\./g) || []).length);
    bodyOut = bodyOut.replace(/__AGRI_HOST__/g, "host");
  }
  const commentPrefix = headDedent ? headDedent + "\n" : "";
  if (ts.isMethodDeclaration(member)) {
    chunks.push(`${commentPrefix}export ${asyncKw}function ${name}(${hostParams})${retPart} {\n${bodyOut}\n}\n`);
  } else if (ts.isBlock(fn.body)) {
    chunks.push(`${commentPrefix}export const ${name} = ${asyncKw}(${hostParams})${retPart} => {\n${bodyOut}\n};\n`);
  } else {
    chunks.push(`${commentPrefix}export const ${name} = ${asyncKw}(${hostParams})${retPart} =>\n  ${bodyOut};\n`);
  }
  const call = `return ${name}(this as unknown as ${hostName}${callArgs(fn)})`;
  let end = member.end;
  while (text[end] === ";") end += 1;
  const sig = text.slice(member.getStart(sf), fn.body.getStart(sf));
  let wrapper;
  if (ts.isMethodDeclaration(member)) wrapper = `${sig.trimEnd()} {\n    ${call};\n  }`;
  else if (ts.isBlock(fn.body)) wrapper = `${sig}{\n    ${call};\n  };`;
  else wrapper = `${sig.replace(/\s*$/, "")}\n    ${call.replace(/^return /, "")};`;
  wrappers.push({ pos: from, end, text: "  " + wrapper });
}

const grouped = new Map();
const stars = [];
for (const [local, imp] of needed) {
  if (imp.imported === "*") {
    stars.push(`import * as ${local} from "${rewriteSpec(imp.spec)}";`);
    continue;
  }
  const key = rewriteSpec(imp.spec) + (imp.typeOnly ? "|t" : "|v");
  if (!grouped.has(key)) grouped.set(key, { spec: rewriteSpec(imp.spec), typeOnly: imp.typeOnly, els: [] });
  const el = imp.imported === local ? local : `${imp.imported} as ${local}`;
  grouped.get(key).els.push(el);
}
const importLines = [`import type { ${hostName} } from "${hostImport}";`];
if (usesJsx && ![...needed.keys()].includes("React")) importLines.push(`import { React } from "jimu-core";`);
importLines.push(...stars);
for (const g of grouped.values()) {
  if (g.typeOnly) importLines.push(`import type { ${g.els.join(", ")} } from "${g.spec}";`);
  else importLines.push(`import { ${g.els.join(", ")} } from "${g.spec}";`);
}
for (const [prop, repl] of staticRewrite) {
  const used = chunks.some((c) => new RegExp("\\b" + repl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(c));
  if (!used || needed.has(repl)) continue;
  if (prop === "graffLog" && repl === "graffLog") {
    importLines.push(`import { graffLog } from "../graff-log";`);
    continue;
  }
  const imp = importMap.get(repl);
  if (imp) {
    const el = imp.imported === repl ? repl : `${imp.imported} as ${repl}`;
    const spec = rewriteSpec(imp.spec);
    if (imp.imported === "*") importLines.push(`import * as ${repl} from "${spec}";`);
    else if (imp.typeOnly) importLines.push(`import type { ${el} } from "${spec}";`);
    else importLines.push(`import { ${el} } from "${spec}";`);
    continue;
  }
  if (repl === "INDEX_COLORS") {
    importLines.push("const INDEX_COLORS: Record<string, string> = {\n  ndvi: \"#00d084\",\n  savi: \"#7aa5ff\",\n  rvi: \"#ffb347\",\n  ci: \"#c78bff\",\n  evi: \"#ff4d8d\",\n  ndwi: \"#2ec4f1\",\n};");
  }
}
const declPieces = movedDecls.map((decl) => {
  const from = attachStart(decl);
  let end = decl.end;
  while (text[end] === ";") end += 1;
  return { from, end, text: applyRange(from, end).replace(/[ \t]+$/gm, "") + "\n" };
});
const fileText = importLines.join("\n") + "\n\n" + declPieces.map((d) => d.text).join("\n") + (declPieces.length ? "\n" : "") + chunks.join("\n");
if (!apply) {
  if (process.env.QUIET !== "1") {
    console.log("--- FILE ---\n" + fileText);
    console.log("--- WRAPPERS ---");
    wrappers.forEach((w) => console.log(w.text + "\n"));
  }
  console.log("dry-run", names.length, "decls", movedDecls.length);
  process.exit(0);
}
let next = text;
const startOf = (w) => (w.pos != null ? w.pos : w.from);
const cuts = [...wrappers, ...declPieces].sort((a, b) => startOf(b) - startOf(a));
for (const w of cuts) {
  const from = w.pos != null ? w.pos : w.from;
  next = next.slice(0, from) + (w.pos != null ? w.text : "") + next.slice(w.end);
}
const importInsert = `import {\n  ${names.join(",\n  ")},\n} from "./${outRel.replace(/\\/g, "/").replace(/\.ts$/, "").replace(/\.tsx$/, "")}";\n`;
const hostLine = `import type { ${hostName} } from "${hostSpec}";\n`;
const atHost = next.indexOf(hostLine);
const atClass = next.indexOf("export default class");
const at = atHost >= 0 ? atHost : atClass;
if (at < 0) throw new Error("import anchor missing");
next = next.slice(0, at) + importInsert + next.slice(at);
if (!next.includes(`import type { ${hostName} }`)) {
  const classAt = next.indexOf("export default class");
  next = next.slice(0, classAt) + hostLine + next.slice(classAt);
}
if (next.includes("\r")) throw new Error("CR introduced");
fs.mkdirSync(serviceDir, { recursive: true });
fs.writeFileSync(outPath, fileText, "utf8");
fs.writeFileSync(widgetPath, next, "utf8");
console.log("wrote", path.relative(widgetDir, outPath).split(path.sep).join("/"));
