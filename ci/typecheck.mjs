// Type-check the ZCode workflow against ci/zcode-runtime.d.ts. The workflow body uses
// top-level return/await (the ZCode runtime wraps it), so it is checked inside a function.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "adapters/zcode/workflows/provenance-lab.dwf.ts"), "utf8");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plab-tsc-"));
const file = path.join(tmp, "workflow.ts");
fs.writeFileSync(file, `export async function __wf(): Promise<unknown> {\n${src}\n}\n`);
const program = ts.createProgram([path.join(ROOT, "ci/zcode-runtime.d.ts"), file], {
  strict: true, noUnusedLocals: true, noEmit: true, target: ts.ScriptTarget.ES2022, lib: ["lib.es2022.d.ts"],
});
const diags = ts.getPreEmitDiagnostics(program);
for (const d of diags) {
  const where = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start) : null;
  // line numbers refer to the workflow file (the wrapper adds one line on top)
  console.log(`${where ? `workflow:${where.line}:${where.character + 1} ` : ""}${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(diags.length === 0 ? "typecheck OK" : `${diags.length} type errors`);
process.exit(diags.length === 0 ? 0 : 1);
