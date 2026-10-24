// Offline end-to-end run of the ZCode workflow with stand-in agents.
//
// Agents are scripted (they return fixed structured results and write the files a real
// agent would write); world.run is real, so the deterministic layer (tools/plab.py) runs
// for real against PubMed/Crossref/OpenAlex. The scenario is adversarial on purpose:
// the citation checker "misses" a retracted and a fabricated paper, one search source
// crashes, and the first draft cites a non-whitelisted paper and reports a p-value that
// does not match its statistic. The run passes only if the code-level gates catch all of it.
//
//   node ci/mock-run.mjs            # with tools installed (expects network)
//   node ci/mock-run.mjs --no-tools # tools missing: every gate must fall back, run must finish
//   node ci/mock-run.mjs --solo     # citation-audit mode on the L1 seeded draft → score_l1.py
//   node ci/mock-run.mjs --no-stats # zero-match coverage must be disclosed (with real tools)
//   node ci/mock-run.mjs --no-tools --stale-recheck # out-of-scope re-check IDs cannot pass
//   PLAB_WORKFLOW=/path/to/old.dwf.ts node ci/mock-run.mjs # compare a previous workflow
//   add --keep to leave the scratch workspace on disk for inspection
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WF = process.env.PLAB_WORKFLOW || path.join(ROOT, "adapters/zcode/workflows/provenance-lab.dwf.ts");
const withTools = !process.argv.includes("--no-tools");
// --solo: standalone citation-audit mode on the L1 seeded draft, scored by evaluation/score_l1.py
const solo = process.argv.includes("--solo");
// Exercises coverage reporting with real tools but no complete statistical report.
const noStats = process.argv.includes("--no-stats");
// Run with --no-tools to exercise an auditor repeating an out-of-scope old failure.
const staleRecheck = process.argv.includes("--stale-recheck");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plab-mock-"));
const home = path.join(tmp, "home");
const ws = path.join(tmp, "workspace");
fs.mkdirSync(ws, { recursive: true });
if (withTools) {
  const dest = path.join(home, ".zcode/skills/provenance-lab/tools");
  fs.mkdirSync(dest, { recursive: true });
  fs.copyFileSync(path.join(ROOT, "tools/plab.py"), path.join(dest, "plab.py"));
} else {
  fs.mkdirSync(home, { recursive: true });
}
const OUT = "provenance-lab-output";
const w = (rel, text) => {
  const p = path.join(ws, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  return rel;
};

// ── scenario identifiers (all verified in evaluation/citation-error-cases/expected.json) ──
const GOOD = [
  { id: "PMID:34299887", title: "Reciprocal Relationships between Sleep Problems and Problematic Smartphone Use in Taiwan: Cross-Lagged Panel Study", year: 2021, design: "两波交叉滞后", finding: "睡眠问题与 PSU 双向互预测" },
  { id: "PMID:35149136", title: "An updated of meta-analysis on the relationship between mobile phone addiction and sleep disorder", year: 2022, design: "meta 分析", finding: "汇总 r = 0.30" },
  { id: "DOI:10.1001/jamapediatrics.2016.2341", title: "Association Between Portable Screen-Based Media Device Access or Use and Sleep Outcomes", year: 2016, design: "meta 分析", finding: "睡前设备使用与睡眠不足相关" },
  { id: "arXiv:1907.10569", title: "Sample size calculations in simple linear regression", year: 2019, design: "方法学", finding: "非 PMID/DOI 的解析覆盖缺口必须披露" },
];
const RETRACTED = { id: "PMID:9500320", title: "Ileal-lymphoid-nodular hyperplasia, non-specific colitis, and pervasive developmental disorder in children", year: 1998, design: "病例系列", finding: "（已撤稿）" };
const FABRICATED = { id: "PMID:99999999", title: "Smartphone screen exposure and adolescent sleep: a 10-year birth cohort", year: 2031, design: "队列", finding: "编造" };
const DUP_BY_TITLE = { id: "DOI:10.3390/ijerph18147438", title: "Reciprocal relationships between sleep problems and problematic smartphone use in Taiwan: cross-lagged panel study.", year: 2021, design: "两波交叉滞后", finding: "同一文献的 DOI 记录" };

const draftV1 = `# 初稿\n\n## 结果\n\n${noStats ? "只报告 B = .13，无自由度与检验统计量。" : "主分析 *r*(298) = .223，95% CI [.112, .328]，*p* < .001。亚组分析 *t*(30) = 1.20, *p* = .03。"}\n\n## References\n\n1. Chen JK, Wu WC. Reciprocal relationships... Int J Environ Res Public Health. 2021. PMID: 34299887\n2. Zhang J, et al. An updated of meta-analysis... J Affect Disord. 2022. PMID: 35149136\n3. Carter B, et al. Association between portable screen-based media device access... JAMA Pediatr. 2016. PMID: 27802500\n4. Benjamini Y, Hochberg Y. Controlling the false discovery rate. J R Stat Soc B. 1995. doi:10.1111/j.2517-6161.1995.tb02031.x\n5. Obokata H, et al. Stimulus-triggered fate conversion. Nature. 2014. doi:10.1038/nature12968\n6. Wakefield AJ, et al. Ileal-lymphoid-nodular hyperplasia. Lancet. 1998. PMID: 9500320\n7. Cohen J. Statistical power analysis for the behavioral sciences. 2nd ed. 1988.\n`;
const draftV2 = draftV1
  .replace("*t*(30) = 1.20, *p* = .03", "*t*(30) = 1.20, *p* = .24")
  .replace(/5\. Obokata[^\n]*\n6\. Wakefield[^\n]*\n7\./, "5.");

const calls = [];
const stages = {};
const logs = [];
let writerDraftPrompt = "";
let wordingFixed = false;
let qualifierFixed = false;

function respond(name, prompt, opts) {
  calls.push({ name, prompt, system: opts.system ?? "" });
  const role = name.split("·")[0];
  switch (role) {
    case "PI":
      w(`${OUT}/01-research-question.md`, "# 立题\n");
      return { question: "PSU 与青少年睡眠质量的关联", population: "青少年", exposure: "PSU", comparator: "低 PSU", outcome: "睡眠质量", design: "横断", guideline: "STROBE", hypotheses: ["H1"], journals: ["J Adolesc"], novelty: "n", field: "psychology" };
    case "Critic":
      return { hasBlockingIssues: false, issues: [] };
    case "Search": {
      const src = name.split("·")[1];
      if (src === "arXiv") throw new Error("simulated source outage");
      const papers = src === "OpenAlex" ? [DUP_BY_TITLE, GOOD[2]] : [GOOD[0], GOOD[1], RETRACTED, FABRICATED];
      return { source: src, papers: papers.map((p) => ({ ...p })), strategy: `${src} query`, truncated: src === "SemanticScholar" };
    }
    case "Synth": {
      // stubborn synthesizer: never removes anything, so only the code backstop can
      const included = [...GOOD, RETRACTED, FABRICATED].map((p) => ({ ...p, status: "clean" }));
      if (prompt.includes("先修正再复核")) {
        wordingFixed ||= prompt.includes("汇总 r 写错");
        qualifierFixed ||= prompt.includes("限定语在摘要中不可考");
      }
      if (wordingFixed) included[1].finding = "已按摘要更正汇总 r";
      if (qualifierFixed) included[2].finding = "已删除无原文支持的限定语";
      // on the excision request it also rewrites identifier spelling — the backstop must still match
      if (prompt.includes("按协议从证据表剔除")) for (const p of included) p.id = p.id.replace("PMID:", "PMID: ");
      w(`${OUT}/02-evidence-table.md`, "# 证据表\n" + included.map((p) => `- ${p.id} ${p.title}`).join("\n"));
      return { included, excludedSummary: "0", noveltyStatement: "空白。", riskOfBias: "-", gaps: [], evidencePath: `${OUT}/02-evidence-table.md` };
    }
    case "CiteGate":
      // round 1: the semantic checker misses both bad identifiers — the deterministic layer must not.
      // round 2: it first flags a wording problem on a legitimate paper (what happened in L-A D37);
      // that entry must be corrected and re-checked, not excised. The targeted re-check passes.
      if (prompt.startsWith("修正后的证据表")) return { passed: false, checked: 8, failures: ["PMID:35149136：finding 与摘要不符（汇总 r 写错），建议改写后保留；另参照已正确的 PMID:34299887，后者无需修改", "【限定语警示-不建议剔除】`10.1001/jamapediatrics.2016.2341`：限定语在摘要中不可考，须删除限定语后保留条目", "有一条意见缺少条目标识符，需要人工绑定"], failedIds: ["PMID:35149136"] };
      if (prompt.includes("已按上轮核查意见修正")) {
        if (staleRecheck) return { passed: false, checked: 2, failures: [`${GOOD[0].id}：复述上一轮旧问题，不属于本批`], failedIds: [GOOD[0].id] };
        const failedIds = [];
        if (!prompt.includes("已按摘要更正汇总 r")) failedIds.push(GOOD[1].id);
        if (!prompt.includes("已删除无原文支持的限定语")) failedIds.push(GOOD[2].id);
        return { passed: failedIds.length === 0, checked: 2, failures: failedIds.map((id) => `${id}：仍未修正`), failedIds };
      }
      return staleRecheck ? { passed: false, checked: 8, failures: [`${GOOD[0].id}：首轮待更正问题`], failedIds: [GOOD[0].id] } : { passed: true, checked: 8, failures: [], failedIds: [] };
    case "Stats":
      w(`${OUT}/03-sap.md`, "# SAP\n多重比较：BH-FDR（doi:10.1111/j.2517-6161.1995.tb02031.x）\n");
      return { primaryAnalysis: "Pearson 相关。", secondaryAnalyses: [], effectMeasures: "r", corrections: "BH-FDR", missingData: "MI", power: "0.8", assumptions: "-", variables: [], methodRationale: [], sapPath: `${OUT}/03-sap.md` };
    case "Analyst":
      // first version hard-codes a home path; only the portability request makes it relative
      w(`${OUT}/04-analysis/run.py`, prompt.includes("可移植性检查") ? "from pathlib import Path\nHERE = Path(__file__).resolve().parent\n" : 'HERE = "/Users/someone/project/04-analysis"\n');
      return { realData: false, scriptPath: `${OUT}/04-analysis/run.py`, outputsPath: `${OUT}/04-analysis`, keyFindings: ["r = .20"], decisions: [], reproducibility: "exit 0", caveats: "" };
    case "StatRev":
    case "Reviewer":
      return { majorIssues: [], minorIssues: [`${role}: 补充一项口径说明，尚未复核关闭`], verdict: "minor-revision", persistingFromLastRound: 0 };
    case "ArtDir":
      return { polishedDir: `${OUT}/04-analysis/figures-polished`, auditPath: `${OUT}/09-figure-audit.md`, figures: [] };
    case "VisualQA":
      return { passed: false, issues: ["图中文字过小，需整改；最终版尚未复核"] };
    case "Writer": {
      if (prompt.includes("答辩拷问问题清单")) {
        w(`${OUT}/07-rebuttal.md`, "# 回应信\n");
        return { rebuttalPath: `${OUT}/07-rebuttal.md`, answers: ["a"], unanswered: [] };
      }
      if (prompt.includes("引文终检")) {
        w(`${OUT}/06-draft.md`, draftV2);
      } else if (!fs.existsSync(path.join(ws, OUT, "06-draft.md"))) {
        writerDraftPrompt = prompt;
        w(`${OUT}/06-draft.md`, draftV1);
      }
      return { draftPath: `${OUT}/06-draft.md`, abstract: "", sections: [], figures: [] };
    }
    case "Examiner":
      return [{ question: "q", probing: "p" }];
    case "CiteAudit": {
      const entries = ["PMID:34299887", "PMID:35149136", "PMID:27802500"].map((id) => ({
        citation: id, resolvedSource: `${id}（仅摘要级）`, textLevel: "abstract", isPrimary: "primary", sourceLocation: "Abstract",
        accuracy: "supported", necessity: "necessary", retractionStatus: "clean", note: "保留",
      }));
      entries.push({ citation: "DOI:10.1111/j.2517-6161.1995.tb02031.x", resolvedSource: "DOI:10.1111/j.2517-6161.1995.tb02031.x", textLevel: "none", isPrimary: "primary", sourceLocation: "-", accuracy: "supported", necessity: "necessary", retractionStatus: "clean", note: "方法学归属" });
      w(`${OUT}/05a-citation-audit.md`, "# 05a\n");
      return { entries, problems: 0, auditPath: `${OUT}/05a-citation-audit.md` };
    }
    case "Librarian":
      w(`${OUT}/08-papers-manifest.md`, "# 08\n");
      return { downloaded: [], notDownloaded: [], manifestPath: `${OUT}/08-papers-manifest.md`, papersDir: `${OUT}/papers` };
    case "Archivist":
      w(`${OUT}/00-README.md`, "# 00\n");
      w(`${OUT}/05-audit-trail.md`, "# 05\n");
      return { manifestPath: `${OUT}/00-README.md`, auditPath: `${OUT}/05-audit-trail.md`, mermaid: "" };
    case "Scribe":
      return "# 总结";
    case "Solo": {
      // a perfect auditor: one entry per seeded case carrying the expected verdict
      const cases = JSON.parse(fs.readFileSync(path.join(ROOT, "evaluation/citation-error-cases/expected.json"), "utf8")).cases;
      const base = { isPrimary: "primary", accuracy: "supported", necessity: "necessary", retractionStatus: "clean" };
      const entries = cases.map((c) => ({ ...base, ...c.expected, citation: `[${c.id}] 讨论段`, resolvedSource: "-", textLevel: "abstract", sourceLocation: "-", note: "-" }));
      w(`${OUT}/05a-citation-audit.md`, "# 05a\n");
      return { entries, problems: entries.filter((e) => e.isPrimary !== "primary" || e.accuracy !== "supported" || e.necessity !== "necessary" || ["retracted", "concern"].includes(e.retractionStatus)).length, auditPath: `${OUT}/05a-citation-audit.md` };
    }
    default:
      throw new Error(`mock has no script for agent ${name}`);
  }
}

const runtime = {
  args: solo
    ? { topic: "L1 植错集", mode: "citation-audit", draftPath: path.join(ROOT, "evaluation/citation-error-cases/seeded-draft.md") }
    : { topic: "PSU 与青少年睡眠质量（模拟）", integrityMode: "development", teamProfile: "hybrid", figurePolish: "true", language: "中文" },
  agent: (name, opts) => ({ ask: async (prompt) => respond(name, prompt, opts) }),
  model: (id) => ({ __model: id }),
  log: (s) => logs.push(s),
  report: (o) => {
    stages[o.stage] = o.status;
  },
  phase: () => {},
  artifact: { board: () => {}, markdown: async () => {}, file: async () => {} },
  world: {
    run: async (cmd, argv) => {
      const r = spawnSync(cmd, argv, { cwd: ws, env: { ...process.env, HOME: home }, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
      return { exitCode: r.status ?? 1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
    },
  },
};

const src = fs.readFileSync(WF, "utf8");
const wrapped = `export default async function __wf({ args, agent, model, log, report, phase, artifact, world }) {\n${src}\n}`;
const js = ts.transpileModule(wrapped, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const modPath = path.join(tmp, "wf.mjs");
fs.writeFileSync(modPath, js);
const { default: wf } = await import(pathToFileURL(modPath).href);
const result = await wf(runtime);

// ── assertions ──────────────────────────────────────────────────────────────
const failures = [];
const check = (ok, what) => {
  if (!ok) failures.push(what);
  console.log(`${ok ? "PASS" : "FAIL"}  ${what}`);
};
const outFile = (rel) => path.join(ws, OUT, rel);
if (solo) {
  const audit = outFile("05a-citation-audit.json");
  check(fs.existsSync(audit), "solo citation-audit writes 05a-citation-audit.json");
  const det = JSON.parse(fs.readFileSync(audit, "utf8")).deterministic;
  check(Array.isArray(det) && det.length >= 8, "deterministic records for the seeded references are embedded");
  const sc = spawnSync("python3", [path.join(ROOT, "evaluation/score_l1.py"), audit], { encoding: "utf8" });
  check(sc.status === 0 && sc.stdout.includes("敏感度 9/9") && sc.stdout.includes("特异度 2/2"), "score_l1.py scores a perfect auditor 9/9 and 2/2");
  check(!sc.stdout.includes("❌"), `deterministic layer gets S1-S4 and S10 right${sc.stdout.includes("❌") ? `\n${sc.stdout}` : ""}`);
  const keepSolo = process.argv.includes("--keep");
  console.log(`\n${failures.length === 0 ? "ALL PASS" : `${failures.length} FAILED`} (solo citation-audit${keepSolo ? `; workspace kept at ${ws}` : ""})`);
  if (!keepSolo) fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(failures.length === 0 ? 0 : 1);
}
const metricsFile = outFile("99-metrics.json");
check(fs.existsSync(metricsFile), "99-metrics.json written by code");
if (fs.existsSync(metricsFile)) check(JSON.stringify(JSON.parse(fs.readFileSync(metricsFile, "utf8"))) === JSON.stringify(result.metrics), "99-metrics.json equals returned metrics");
check(result.notCovered.some((s) => s.includes("arXiv")), "failed search source is disclosed in notCovered");
check(stages["文献检索"] === "issues", "search stage marked issues when a source fails");
check(result.notCovered.some((s) => s.includes("提前结束") && s.includes("SemanticScholar")) && result.metrics.deterministic.sourcesTruncated === 1, "a rate-limited, truncated source is disclosed");
check(result.metrics.deterministic.candidates.raw > result.metrics.deterministic.candidates.deduped, "code-side dedup merged duplicate candidates");
check(fs.existsSync(outFile("05a-citation-audit.json")), "structured 05a JSON written");
check(calls.some((c) => c.name.startsWith("Analyst") && c.prompt.includes("可移植性检查")), "hard-coded home path in an analysis script is sent back to the analyst");
check(stages["分析执行"] === "passed" && !fs.readFileSync(outFile("04-analysis/run.py"), "utf8").includes("/Users/"), "analysis stage passes once the script uses relative paths");
check(result.metrics.statsReview.pendingMinorNotes === 1 && result.metrics.peerReview.pendingMinorNotes === 1 && result.findings.filter((f) => f.what.includes("minor")).length === 2, "minor review notes are retained until their closure is verified");
check(result.notCovered.some((s) => s.includes("图表视觉验收未通过")) && !result.verified.some((s) => s.includes("图表按")), "unverified figure revisions are never claimed as visually accepted");
check(stages["终检交付"] === "issues", "delivery cannot pass while review or visual issues remain");
check(["Archivist", "Scribe"].every((role) => calls.some((c) => c.name.startsWith(role) && c.prompt.includes("待关闭审稿意见") && c.prompt.includes('"figuresVerified":false'))), "audit-package and summary writers receive the same unresolved caveats");

if (withTools) {
  const net = JSON.parse(fs.readFileSync(outFile("tool-records/resolve-evidence.json"), "utf8")).records;
  const online = net.some((r) => r.found !== null);
  check(online, "deterministic resolve reached PubMed/Crossref/OpenAlex (network required)");
  if (online) {
    const gate = result.metrics.citationGate;
    check(stages["引文核查"] === "issues" && gate.excluded === 2, `citation gate excludes retracted + fabricated even though the checker passed them (excluded ${gate.excluded})`);
    check(gate.corrected === 2 && wordingFixed && qualifierFixed, "round-2 qualifier in backticks is corrected without misclassifying a mentioned comparator");
    check(result.notCovered.some((s) => s.includes("意见未能绑定")) && result.findings.some((f) => f.evidence.includes("人工绑定")), "unbound citation notes remain visible instead of silently passing");
    check(result.metrics.deterministic.evidenceResolved.unresolved === 1 && result.notCovered.some((s) => s.includes("arXiv:1907.10569") && s.includes("不能计为确定性核验通过")), "unresolved identifiers are not counted as deterministic verification");
    check(!writerDraftPrompt.includes("PMID:35149136") || !/禁止引用：[^\n]*35149136/.test(writerDraftPrompt), "the corrected paper stays citable");
    const writerSaw = writerDraftPrompt;
    check(writerSaw.includes("PMID:9500320") && writerSaw.includes("PMID:99999999") && writerSaw.includes("禁止引用"), "writer is told the excluded ids are off-limits");
    check(logs.some((l) => l.includes("综合员未删净的失败条目已由代码剔除") && l.includes("9500320") && l.includes("99999999")), "code backstop removes failed entries even when their id spelling changed");
    const wl1 = JSON.parse(fs.readFileSync(outFile("tool-records/whitelist.json"), "utf8"));
    const outside1 = wl1.outside.map((r) => r.label).sort().join(",");
    check(outside1 === "5,6", `first final check flags refs 5 (not whitelisted) and 6 (gate-excluded); got ${outside1}`);
    check(!wl1.outside.some((r) => r.label === "3"), "PMID cited for a DOI-listed paper is matched via PMID↔DOI mapping");
    check(wl1.unidentified.length === 1, "reference without identifiers counted as unidentified");
    const sc1 = JSON.parse(fs.readFileSync(outFile("tool-records/statcheck.json"), "utf8"));
    check(noStats ? sc1.checked === 0 : sc1.checked === 2 && sc1.inconsistent === 1 && sc1.decisionErrors === 1, "statcheck handles Markdown/CI reports without inventing missing statistics");
    check(stages["引文终检"] === (noStats ? "issues" : "passed"), "zero statistical coverage cannot pass the final check");
    check(result.notCovered.some((s) => s.includes("checked=0")) === noStats, "zero-match coverage is disclosed separately from statistical consistency");
    check(result.metrics.deterministic.whitelist.outside === 0 && result.metrics.deterministic.statcheck.inconsistent === 0, "metrics record the clean second pass");
    check(result.notCovered.some((s) => s.includes("无 PMID/DOI")), "unidentified references disclosed in notCovered");
    const lib = calls.find((c) => c.name.startsWith("Librarian"));
    check(lib.system.includes("下载已由确定性工具完成"), "librarian only writes the manifest when oa-fetch ran");
    check(fs.existsSync(outFile("tool-records/papers.json")), "oa-fetch manifest written");
  }
} else {
  check(result.notCovered.some((s) => s.includes("确定性引文终检未能运行")), "missing tools are disclosed in notCovered");
  check(stages["引文核查"] === (staleRecheck ? "issues" : "passed"), "without tools the gate falls back to the checker's verdict");
  if (staleRecheck) check(result.metrics.citationGate.corrected === 0 && result.notCovered.some((s) => s.includes("意见未能绑定")) && result.findings.some((f) => f.evidence.includes("范围外失败条目")), "out-of-scope re-check failures cannot count as corrected entries");
  const lib = calls.find((c) => c.name.startsWith("Librarian"));
  check(!lib.system.includes("下载已由确定性工具完成"), "librarian falls back to downloading itself");
  check(result.metrics.deterministic.toolFailures > 0 && result.metrics.deterministic.toolFailures === result.metrics.deterministic.toolRuns, "every tool call failed soft");
}

const keep = process.argv.includes("--keep");
console.log(`\n${failures.length === 0 ? "ALL PASS" : `${failures.length} FAILED`} (${withTools ? "with tools" : "no tools"}${keep ? `; workspace kept at ${ws}` : ""})`);
if (!keep) fs.rmSync(tmp, { recursive: true, force: true });
process.exit(failures.length === 0 ? 0 : 1);
