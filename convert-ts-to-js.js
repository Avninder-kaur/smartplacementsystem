const fs = require("fs");
const path = require("path");
const ts = require(path.join(__dirname, "frontend", "node_modules", "typescript"));

const ROOT = __dirname;
const EXCLUDES = ["node_modules", ".git", "dist", "build", "coverage", "frontend/node_modules", "backend/node_modules"];
const TS_EXTS = [".ts", ".tsx"];
const D_TS_SUFFIX = ".d.ts";

function isExcludedDir(name) {
  return EXCLUDES.includes(name);
}

function shouldProcessFile(filePath) {
  if (filePath.endsWith(D_TS_SUFFIX)) return false;
  const ext = path.extname(filePath);
  return TS_EXTS.includes(ext);
}

function getOutputExtension(ext) {
  if (ext === ".tsx") return ".jsx";
  if (ext === ".ts") return ".js";
  return ext;
}

function normalizeImportExtension(source) {
  return source.replace(/(["'`])([^"'`]+?)\.(ts|tsx)\1/g, (match, quote, filePath, ext) => {
    const newExt = ext === "tsx" ? ".jsx" : ".js";
    return `${quote}${filePath}${newExt}${quote}`;
  });
}

function getCompilerOptions(isTsx) {
  return {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.Preserve,
    allowJs: true,
    esModuleInterop: true,
    skipLibCheck: true,
    isolatedModules: true,
    noEmitHelpers: true,
    noResolve: true,
    noErrorTruncation: true,
    onlyRemoveTypeImports: true,
    removeComments: false,
  };
}

function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!isExcludedDir(entry.name)) {
        walkDir(fullPath, callback);
      }
    } else if (entry.isFile()) {
      callback(fullPath);
    }
  }
}

function convertFile(filePath) {
  const ext = path.extname(filePath);
  const isTsx = ext === ".tsx";
  const code = fs.readFileSync(filePath, "utf8");

  const transpiled = ts.transpileModule(code, {
    fileName: filePath,
    compilerOptions: getCompilerOptions(isTsx),
    reportDiagnostics: true,
  });

  const diagnostics = transpiled.diagnostics || [];
  const errors = diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (errors.length > 0) {
    console.warn(`WARNING: TypeScript diagnostics in ${filePath}:`);
    errors.forEach((d) => {
      const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
      const position = d.file ? d.file.getLineAndCharacterOfPosition(d.start || 0) : null;
      if (position) {
        console.warn(`  ${position.line + 1}:${position.character + 1} ${message}`);
      } else {
        console.warn(`  ${message}`);
      }
    });
  }

  let output = transpiled.outputText;
  output = normalizeImportExtension(output);

  const outPath = filePath.slice(0, -ext.length) + getOutputExtension(ext);
  fs.writeFileSync(outPath, output, "utf8");
  fs.unlinkSync(filePath);
  console.log(`Converted: ${filePath} -> ${outPath}`);
}

function main() {
  const converted = [];
  walkDir(ROOT, (filePath) => {
    if (shouldProcessFile(filePath)) {
      convertFile(filePath);
      converted.push(filePath);
    }
  });
  console.log(`\nConverted ${converted.length} files.`);
}

main();
