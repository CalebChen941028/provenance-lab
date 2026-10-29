// Minimal type surface of the ZCode dynamic-workflow runtime, inferred from how
// adapters/zcode/workflows/provenance-lab.dwf.ts uses it. Not an official ZCode
// definition: it lets CI type-check the workflow and lets ci/mock-run.mjs supply
// a stand-in runtime. Keep it in step with the calls the workflow actually makes.
declare const args: Record<string, unknown>;
type ModelRef = { readonly __model: string };
declare function model(id: string): ModelRef;
declare function log(s: string): void;
declare function report(o: unknown, key: string): void;
declare function phase(n: string): void;
declare const artifact: {
  board(k: string, o: unknown): void;
  markdown(k: string, c: string, o?: unknown): Promise<void>;
  file(k: string, p: string, o?: unknown): Promise<void>;
};
declare const world: { run(cmd: string, args: string[], opts?: { timeoutMs?: number }): Promise<{ exitCode: number; stdout: string; stderr: string }> };
interface Agent { ask<T = string>(prompt: string): Promise<T> }
declare function agent(name: string, opts: { system: string; model?: ModelRef }): Agent;

declare const files: { read(path: string): Promise<string> };
