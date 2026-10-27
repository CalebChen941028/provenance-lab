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
//   node ci/mock-run.mjs --no-tools --audit-recheck-errors # missing/duplicate/unknown citation keys
//   node ci/mock-run.mjs --no-tools --audit-remove # explicit citation-point removal retains evidence
//   node ci/mock-run.mjs --no-tools --gate-same-id-error # a new error on a previously flagged paper gets a correction
//   node ci/mock-run.mjs --no-tools --gate-drop-entry # unapproved ID replacement during correction is disclosed
//   node ci/mock-run.mjs --no-tools --verify-after-portability # verifyCommand must run after path repairs
//   node ci/mock-run.mjs --source-drift # post-analysis edits cannot inherit the frozen reproducibility claim
//   node ci/mock-run.mjs --no-tools --visual-recheck-pass # revised figures get a second independent check
//   node ci/mock-run.mjs --gate-compound-id # aliases in one compound identity never create false unbound notes
//   node ci/mock-run.mjs --gate-compound-missing-id # a compound-identity note binds even without failedIds
//   node ci/mock-run.mjs --no-tools --stats-contradictory # a minor verdict cannot hide substantive major issues
//   node ci/mock-run.mjs --no-tools --stats-persistent-major # unresolved major issues get bounded repairs and remain visible
//   node ci/mock-run.mjs --no-tools --grill-context # questions and responses receive archived underlying review material
//   node ci/mock-run.mjs --gate-remove-hard # early removal cannot erase deterministic exclusion history
//   node ci/mock-run.mjs --no-tools --gate-final-new-error # unresolved new issue stays pending, never silently excluded
//   node ci/mock-run.mjs --no-tools --gate-persistent-error # an unresolved requested original issue may be excluded
//   node ci/mock-run.mjs --no-tools --gate-recheck-null # null responses cannot manufacture a passed gate
//   node ci/mock-run.mjs --no-tools --analysis-file-path # an entry-file path never becomes the analysis directory
//   node ci/mock-run.mjs --audit-none-source # title-only identity cannot add a source to the whitelist
//   node ci/mock-run.mjs --audit-group-reference # grouped citations retain their initial source identities
//   node ci/mock-run.mjs --audit-group-replaced-source # unchanged labels do not cover a replaced source
//   PLAB_WORKFLOW=/path/to/old.dwf.ts node ci/mock-run.mjs # compare a previous workflow
//   add --keep to leave the scratch workspace on disk for inspection
import fs from "node:fs";
import { createHash } from "node:crypto";
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
const auditRecheckErrors = process.argv.includes("--audit-recheck-errors");
const auditRemove = process.argv.includes("--audit-remove");
const auditRecheckInvalid = process.argv.includes("--audit-recheck-invalid");
const auditFileMissing = process.argv.includes("--audit-file-missing");
const auditFileMalformed = process.argv.includes("--audit-file-malformed");
const auditFileShape = process.argv.includes("--audit-file-shape");
const auditFileNullItem = process.argv.includes("--audit-file-null-item");
const auditFile = process.argv.includes("--audit-file");
const auditBibliographyUnconfirmed = process.argv.includes("--audit-bibliography-unconfirmed");
const auditBibliographyHard = process.argv.includes("--audit-bibliography-hard");
const auditBibliography = process.argv.includes("--audit-bibliography") || auditBibliographyUnconfirmed || auditBibliographyHard;
const largeToolOutput = process.argv.includes("--large-tool-output");
const badAuditFile = auditFileMissing || auditFileMalformed || auditFileShape || auditFileNullItem;
const badAuditRecheck = auditRecheckErrors || auditRecheckInvalid || badAuditFile;
const auditSwapSource = process.argv.includes("--audit-swap-source");
const auditNoneSource = process.argv.includes("--audit-none-source");
const gateRemoveHard = process.argv.includes("--gate-remove-hard");
const gateFinalNewError = process.argv.includes("--gate-final-new-error");
const gatePersistentError = process.argv.includes("--gate-persistent-error");
const gateRecheckInvalid = process.argv.includes("--gate-recheck-invalid");
const gateRecheckDuplicate = process.argv.includes("--gate-recheck-duplicate");
const gateRecheckNull = process.argv.includes("--gate-recheck-null");
const gateRecheckMixed = process.argv.includes("--gate-recheck-mixed");
const gateRecheckNullCheck = process.argv.includes("--gate-recheck-null-check");
const badGateRecheck = gateRecheckInvalid || gateRecheckDuplicate || gateRecheckNull || gateRecheckMixed || gateRecheckNullCheck;
const analysisFilePath = process.argv.includes("--analysis-file-path");
const auditGroupReference = process.argv.includes("--audit-group-reference") || process.argv.includes("--audit-group-replaced-source");
const auditGroupReplacedSource = process.argv.includes("--audit-group-replaced-source");
const gateSameIdError = process.argv.includes("--gate-same-id-error");
const gateDropEntry = process.argv.includes("--gate-drop-entry");
const verifyAfterPortability = process.argv.includes("--verify-after-portability");
const sourceDrift = process.argv.includes("--source-drift");
const visualRecheckPass = process.argv.includes("--visual-recheck-pass");
const gateAmbiguousId = process.argv.includes("--gate-ambiguous-id");
const figureTargetOverride = process.argv.includes("--figure-target-override");
const gateCompoundMissingId = process.argv.includes("--gate-compound-missing-id");
const gateCompoundId = process.argv.includes("--gate-compound-id") || gateCompoundMissingId;
const statsContradictory = process.argv.includes("--stats-contradictory");
const statsPersistentMajor = process.argv.includes("--stats-persistent-major");
const statsSummaryPersistent = process.argv.includes("--stats-summary-persistent");
const statsSummaryErrors = process.argv.includes("--stats-summary-errors") || statsSummaryPersistent;
const statsRepairPersistent = statsPersistentMajor || statsSummaryPersistent;
const statsConflict = statsContradictory || statsPersistentMajor || statsSummaryErrors;
const grillContext = process.argv.includes("--grill-context");

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
if (largeToolOutput) {
  const dest = path.join(home, ".zcode/skills/provenance-lab/tools");
  fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(path.join(dest, "plab.py"), `import sys,json
from pathlib import Path
if sys.argv[1] != "source-snapshot": sys.exit(1)
s=json.dumps({"available":True,"files":[],"padding":"x"*280000,"issues":[]})
p=Path(sys.argv[sys.argv.index("--out")+1]);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
print(s)
`);
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
  { id: gateAmbiguousId ? "PMID:27802500（=doi:10.9999/unconfirmed-other-paper）" : gateCompoundId ? "PMID:27802500（=doi:10.1001/jamapediatrics.2016.2341）" : "DOI:10.1001/jamapediatrics.2016.2341", title: "Association Between Portable Screen-Based Media Device Access or Use and Sleep Outcomes", year: 2016, design: "meta 分析", finding: "睡前设备使用与睡眠不足相关" },
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
const artifactFiles = [];
const stages = {};
const logs = [];
let writerDraftPrompt = "";
let wordingFixed = false;
let qualifierFixed = false;
let sameIdOldFixed = false;
let sameIdNewFixed = false;
let visualCheckCount = 0;
let entryDropped = false;
let hardEntriesRemoved = false;
let compoundTitleFixed = false;
let compoundFindingFixed = false;
let statsMetadataFixed = false;
let statsRepairCount = 0;
let statReviewCount = 0;
let writerReadArchivedContext = false;
const STAT_MAJOR = "关键结果转录错误：keyFindings 写 r=.99，冻结汇总为 r=.20，须更正下游元数据";
const STAT_MINOR = "StatRev: 补充一项口径说明，尚未复核关闭";
const PEER_MINOR = "Reviewer: 补充一项口径说明，尚未复核关闭";
const UNBOUND_NOTE = "有一条意见缺少条目标识符，需要人工绑定";
const archivedContext = () => {
  const files = ["tool-records/facts-ledger.md", "tool-records/review-context.json"];
  try {
    const facts = fs.readFileSync(path.join(ws, OUT, files[0]), "utf8");
    const reviews = JSON.parse(fs.readFileSync(path.join(ws, OUT, files[1]), "utf8"));
    return { files, text: `${facts}\n${JSON.stringify(reviews)}`, available: true };
  } catch {
    return { files, text: "", available: false };
  }
};

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
      let included = [...GOOD, RETRACTED, FABRICATED].map((p) => ({ ...p, status: "clean" }));
      if (gateRemoveHard && prompt.includes("引文核查发现以下失败项")) hardEntriesRemoved = true;
      if (hardEntriesRemoved) included = included.filter((p) => ![RETRACTED.id, FABRICATED.id].includes(p.id));
      if (gateDropEntry && prompt.includes("引文核查发现以下失败项")) entryDropped = true;
      // An ID substitution drops the legitimate paper and adds an unapproved replacement.
      if (entryDropped) included[1].id = "PMID:11111111";
      if (gateSameIdError) {
        if (prompt.includes("引文核查发现以下失败项")) sameIdOldFixed = true;
        if (prompt.includes("先修正再复核")) {
          sameIdNewFixed = prompt.includes("新引入国别错误") && prompt.includes("新引入参照组错误");
          wordingFixed = qualifierFixed = sameIdNewFixed;
        }
        // The first repair fixes the requested old issues but introduces different errors
        // in the same two papers. Identifier equality must not imply error persistence.
        included[1].finding = sameIdOldFixed ? "旧汇总错误已修正" : "首轮旧汇总错误";
        included[1].design = sameIdOldFixed ? "145 名塞尔维亚医学生（新引入国别错误）" : "横断调查";
        included[2].design = sameIdOldFixed ? "旧人群错误已修正" : "首轮旧人群错误";
        included[2].finding = "高低摄入组互比（新引入参照组错误）";
        if (sameIdNewFixed) {
          included[1].design = "145 名波黑医学生（国别修正完成）";
          included[2].finding = "各摄入组相对非饮用者均无显著差异（阴性比较对象修正完成）";
        }
      }
      if (!gateSameIdError && prompt.includes("先修正再复核")) {
        wordingFixed ||= prompt.includes("汇总 r 写错");
        qualifierFixed ||= prompt.includes("限定语在摘要中不可考");
      }
      if (gateCompoundId) {
        if (prompt.includes("引文核查发现以下失败项")) compoundTitleFixed = true;
        if (prompt.includes("先修正再复核")) {
          compoundFindingFixed = prompt.includes("预期效应关联对象错误");
          qualifierFixed = compoundFindingFixed;
        }
        included[2].title = compoundTitleFixed ? GOOD[2].title : `${GOOD[2].title}（题录旧错误）`;
        included[2].finding = compoundFindingFixed ? "预期效应与消费类型相关（复合ID新finding已修正）" : compoundTitleFixed ? "预期效应与焦虑相关（新错误）" : "原表述";
      }
      if (!gateSameIdError && wordingFixed) included[1].finding = "已按摘要更正汇总 r";
      if (!gateSameIdError && !gateCompoundId && qualifierFixed) included[2].finding = "已删除无原文支持的限定语";
      // Legacy workflows request a separate excision rewrite; vary spelling on that comparison path.
      if (prompt.includes("按协议从证据表剔除")) for (const p of included) p.id = p.id.replace("PMID:", "PMID: ");
      w(`${OUT}/02-evidence-table.md`, "# 证据表\n" + included.map((p) => `- ${p.id} ${p.title}`).join("\n"));
      return { included, excludedSummary: "0", noveltyStatement: "空白。", riskOfBias: "-", gaps: [], evidencePath: `${OUT}/02-evidence-table.md` };
    }
    case "CiteGate": {
      if (gateAmbiguousId) return { passed: false, checked: 6, failures: ["PMID:27802500 与 DOI:10.9999/unconfirmed-other-paper：涉及两篇身份，待明确失败对象"], failedIds: [] };
      if (grillContext && !withTools) return { passed: false, checked: 6, failures: [UNBOUND_NOTE], failedIds: [] };
      if (gateRemoveHard) return { passed: true, checked: prompt.startsWith("修正后的证据表") ? 4 : 6, failures: [], failedIds: [] };
      if (prompt.includes("逐个 checkId 回传 checks（每键一次）：")) {
        const requests = JSON.parse(prompt.split("逐个 checkId 回传 checks（每键一次）：")[1].split("\noriginalIssuesResolved")[0]);
        if (staleRecheck) return { checks: [{ checkId: "G9999", originalIssuesResolved: false, note: "本批以外的旧问题键", newIssues: [] }] };
        const checks = requests.map((request) => {
          const isFirst = request.paper.id === GOOD[1].id;
          const resolved = gateCompoundId ? compoundFindingFixed && prompt.includes("复合ID新finding已修正") : gatePersistentError && isFirst ? false : gateSameIdError
            ? prompt.includes("国别修正完成") && prompt.includes("阴性比较对象修正完成")
            : isFirst ? prompt.includes("已按摘要更正汇总 r") : prompt.includes("已删除无原文支持的限定语");
          return { checkId: request.checkId, originalIssuesResolved: resolved, note: resolved ? "本次原问题与摘要逐项核对已修正" : "本次送修原问题仍未改正", newIssues: gateFinalNewError && isFirst ? ["design 人群标签首次发现窄化；应为健康照护类大学生"] : [] };
        });
        if (gateRecheckNull) return null;
        if (gateRecheckNullCheck) return { checks: [null] };
        if (gateRecheckMixed) return { checks: [checks[0], null, ...checks.slice(1)] };
        if (gateRecheckInvalid) return { checks: checks.map((c) => ({ ...c, note: "" })) };
        if (gateRecheckDuplicate) return { checks: [...checks, ...checks] };
        return { checks };
      }
      if (gateCompoundId) {
        if (prompt.startsWith("修正后的证据表")) return { passed: false, checked: 6, failures: [`${GOOD[2].id}：题录已更正，但预期效应关联对象错误；须改为预期效应与消费类型相关`], failedIds: gateCompoundMissingId ? [] : [GOOD[2].id] };
        return { passed: false, checked: 6, failures: [`${GOOD[2].id}：标题题录旧错误，须按登记题名更正并保留`], failedIds: [GOOD[2].id] };
      }
      if (gateDropEntry) return prompt.startsWith("修正后的证据表")
        ? { passed: true, checked: 8, failures: [], failedIds: [] }
        : { passed: false, checked: 8, failures: [`${GOOD[1].id}：可纠正的转述偏差，请修改后保留`], failedIds: [GOOD[1].id] };
      if (gateSameIdError) {
        if (prompt.startsWith("修正后的证据表")) return { passed: false, checked: 8, failures: [`${GOOD[1].id}：新引入国别错误，design 应改为波黑医学生；旧汇总错误已修正`, `${GOOD[2].id}：新引入参照组错误，应相对非饮用者报告阴性；旧人群错误已修正`], failedIds: [GOOD[1].id, GOOD[2].id] };
        if (prompt.includes("已按上轮核查意见修正")) {
          const corrected = prompt.includes("国别修正完成") && prompt.includes("阴性比较对象修正完成");
          return { passed: corrected, checked: 2, failures: corrected ? [] : [`${GOOD[1].id}：新引入错误尚未修正`], failedIds: corrected ? [] : [GOOD[1].id] };
        }
        return { passed: false, checked: 8, failures: [`${GOOD[1].id}：首轮旧汇总错误`, `${GOOD[2].id}：首轮旧人群错误`], failedIds: [GOOD[1].id, GOOD[2].id] };
      }
      // round 1: the semantic checker misses both bad identifiers — the deterministic layer must not.
      // round 2: it first flags a wording problem on a legitimate paper (what happened in L-A D37);
      // that entry must be corrected and re-checked, not excised. The targeted re-check passes.
      if (prompt.startsWith("修正后的证据表")) return { passed: false, checked: 8, failures: ["PMID:35149136：finding 与摘要不符（汇总 r 写错），建议改写后保留；另参照已正确的 PMID:34299887，后者无需修改", "【限定语警示-不建议剔除】`10.1001/jamapediatrics.2016.2341`：限定语在摘要中不可考，须删除限定语后保留条目", "有一条意见缺少条目标识符，需要人工绑定"], failedIds: ["PMID:35149136"] };
      if (prompt.includes("已按上轮核查意见修正")) {
        if (gateFinalNewError || gatePersistentError) return { passed: false, checked: 2, failures: [`${GOOD[1].id}：${gateFinalNewError ? "原问题已改，但首次发现design人群窄化" : "送修原问题仍未修正"}`], failedIds: [GOOD[1].id] };
        if (staleRecheck) return { passed: false, checked: 2, failures: [`${FABRICATED.id}：复述上一轮旧问题，不属于本批`], failedIds: [FABRICATED.id] };
        const failedIds = [];
        if (!prompt.includes("已按摘要更正汇总 r")) failedIds.push(GOOD[1].id);
        if (!prompt.includes("已删除无原文支持的限定语")) failedIds.push(GOOD[2].id);
        return { passed: failedIds.length === 0, checked: 2, failures: failedIds.map((id) => `${id}：仍未修正`), failedIds };
      }
      return staleRecheck || gateFinalNewError || gatePersistentError || badGateRecheck ? { passed: false, checked: 8, failures: [`${GOOD[0].id}：首轮待更正问题`], failedIds: [GOOD[0].id] } : { passed: true, checked: 8, failures: [], failedIds: [] };
    }
    case "Stats":
      w(`${OUT}/03-sap.md`, "# SAP\n多重比较：BH-FDR（doi:10.1111/j.2517-6161.1995.tb02031.x）\n");
      return { primaryAnalysis: "Pearson 相关。", secondaryAnalyses: [], effectMeasures: "r", corrections: "BH-FDR", missingData: "MI", power: "0.8", assumptions: "-", variables: [], methodRationale: [], sapPath: `${OUT}/03-sap.md` };
    case "Analyst": {
      const statsRepair = prompt.includes("统计审稿要求修改") || prompt.includes("统计审稿停滞");
      if (statsRepair) {
        statsRepairCount++;
        statsMetadataFixed = true;
      } else {
        // Portability repair precedes verification; a metadata-only statistical repair keeps this source unchanged.
        w(`${OUT}/04-analysis/run.py`, prompt.includes("可移植性检查") ? "from pathlib import Path\nHERE = Path(__file__).resolve().parent\n" : 'HERE = "/Users/someone/project/04-analysis"\n');
        w(`${OUT}/04-analysis/tables/summary.json`, '{"r":0.2}\n');
        w(`${OUT}/04-analysis/CHECKSUMS-analysis.sha256`, `${createHash("sha256").update('{"r":0.2}\n').digest("hex")}  tables/summary.json\n`);
        w(`${OUT}/04-analysis/summary_report.md`, "# Analysis output entry\n");
      }
      return { realData: false, scriptPath: `${OUT}/04-analysis/run.py`, outputsPath: analysisFilePath ? `${OUT}/04-analysis/summary_report.md` : `${OUT}/04-analysis`, keyFindings: [statsConflict ? statsMetadataFixed ? "主结论转录已更正 r=.20" : "主结论转录错误 r=.99" : "r = .20"], decisions: [], reproducibility: "exit 0", caveats: "" };
    }
    case "StatRev": {
      statReviewCount++;
      const majorIssues = statsConflict && !statsSummaryErrors && (statsPersistentMajor || !statsMetadataFixed) ? [STAT_MAJOR] : [];
      const analysisSummaryIssues = statsSummaryErrors && (statsSummaryPersistent || !statsMetadataFixed) ? [STAT_MAJOR] : [];
      // The intentionally contradictory verdict models the D42 response: severity comes from the issue list.
      return { majorIssues, analysisSummaryIssues, minorIssues: [STAT_MINOR], verdict: "minor-revision", persistingFromLastRound: 0 };
    }
    case "Reviewer":
      return { majorIssues: [], minorIssues: [PEER_MINOR], verdict: "minor-revision", persistingFromLastRound: 0 };
    case "Diag":
      return "核对冻结汇总与返回的 keyFindings，修正转录后再次审稿";
    case "ArtDir":
      if (sourceDrift) fs.appendFileSync(path.join(ws, OUT, "04-analysis/run.py"), "# source changed after analysis freeze\n");
      return { polishedDir: `${OUT}/04-analysis/figures-polished`, auditPath: `${OUT}/09-figure-audit.md`, figures: [] };
    case "VisualQA":
      visualCheckCount++;
      return visualRecheckPass && visualCheckCount > 1
        ? { passed: true, issues: [] }
        : { passed: false, issues: ["图中文字过小，需整改"] };
    case "Writer": {
      if (prompt.includes("答辩拷问问题清单")) {
        const context = archivedContext();
        writerReadArchivedContext = grillContext && context.available && [STAT_MINOR, PEER_MINOR, UNBOUND_NOTE].every((note) => context.text.includes(note));
        w(`${OUT}/07-rebuttal.md`, grillContext && writerReadArchivedContext ? "# 回应信\n已读取持久化账本和两条审稿意见原文，无材料缺失。\n" : "# 回应信\n");
        return { rebuttalPath: `${OUT}/07-rebuttal.md`, answers: ["a"], unanswered: grillContext && !writerReadArchivedContext ? ["无法核对账本和审稿意见：原材料缺失"] : [] };
      }
      if (auditGroupReplacedSource && prompt.includes("引文深审发现")) {
        w(`${OUT}/06-draft.md`, draftV1.replace("PMID: 27802500", "PMID: 1444724"));
      } else if (prompt.includes("引文终检")) {
        let finalDraft = draftV2;
        if (gateFinalNewError || gatePersistentError || badGateRecheck || staleRecheck) finalDraft = finalDraft.replace(/^2\. Zhang[^\n]*\n/m, "");
        if (badGateRecheck || staleRecheck) finalDraft = finalDraft.replace(/^3\. Carter[^\n]*\n/m, "");
        if (auditGroupReplacedSource) finalDraft = finalDraft.replace(/^3\. Carter[^\n]*\n/m, "");
        w(`${OUT}/06-draft.md`, finalDraft);
      } else if (!fs.existsSync(path.join(ws, OUT, "06-draft.md"))) {
        writerDraftPrompt = prompt;
        w(`${OUT}/06-draft.md`, draftV1);
      }
      return { draftPath: `${OUT}/06-draft.md`, abstract: "", sections: [], figures: [] };
    }
    case "Examiner": {
      const context = archivedContext();
      return [{ question: grillContext ? "核对持久化账本和审稿意见原文" : "q", probing: grillContext && !context.available ? "材料缺失" : "p" }];
    }
    case "CiteAudit": {
      if (prompt.startsWith("修订后只复核")) {
        const requests = JSON.parse(prompt.split("：")[1].split("\n当前初稿")[0]);
        const updates = requests.map((e) => ({ auditEntryId: e.auditEntryId, action: "updated", entry: { ...e, accuracy: "supported", note: "改写后复核通过" }, note: "亲见修订稿与原文一致" }));
        let response = { updates };
        if (auditRecheckErrors) response = { updates: [updates[0], updates[0], { ...updates[0], auditEntryId: "A9999" }] };
        if (auditRecheckInvalid) response = { updates: updates.map((u) => ({ ...u, entry: { ...u.entry, note: undefined } })) };
        if (auditRemove) updates[0] = { auditEntryId: requests[0].auditEntryId, action: "removed", entry: null, note: "已读修订稿：第二个引用点的冗余主张已删除，首个引用点仍保留" };
        if (auditBibliography) for (const u of response.updates) if (u.entry) u.entry.bibliography = auditBibliographyUnconfirmed ? "unknown" : auditBibliographyHard ? "mismatch" : "match";
        if (prompt.includes("完成后只回复一行")) {
          const payload = {
            updated: response.updates.filter((u) => u.action === "updated").map((u) => ({ entry: { ...u.entry, auditEntryId: u.auditEntryId } })),
            removed: response.updates.filter((u) => u.action === "removed").map((u) => ({ auditEntryId: u.auditEntryId, note: u.note })),
          };
          if (!auditFileMissing) w(`${OUT}/tool-records/citation-audit-recheck.json`, auditFileMalformed ? "{broken" : JSON.stringify(auditFileShape ? { updated: "bad", removed: [] } : auditFileNullItem ? { updated: [null, 17, {}], removed: [null] } : payload));
          return "已写入";
        }
        return auditFile ? JSON.stringify(response) : response;
      }
      const entries = ["PMID:34299887", "PMID:35149136", "PMID:27802500"].map((id) => ({
        citation: id, resolvedSource: `${id}（仅摘要级）`, textLevel: "abstract", isPrimary: "primary", sourceLocation: "Abstract",
        accuracy: "supported", necessity: "necessary", retractionStatus: "clean", bibliography: "match", note: "保留",
      }));
      entries.push({ citation: "DOI:10.1111/j.2517-6161.1995.tb02031.x", resolvedSource: auditNoneSource ? "DOI:10.1111/j.2517-6161.1995.tb02031.x；PMID:1444724（仅题录身份，未取得原文）" : "DOI:10.1111/j.2517-6161.1995.tb02031.x", textLevel: "none", isPrimary: "primary", sourceLocation: "-", accuracy: "supported", necessity: "necessary", retractionStatus: "clean", note: "方法学归属" });
      entries.push(...["5", "6", "7"].map((label) => ({ ...entries[0], citation: `[${label}] 参考文献对应引用点`, resolvedSource: "题录", textLevel: "none" })));
      // The same reference number must not conceal a changed source; valid aliases still match.
      entries[2] = { ...entries[2], citation: "[3] 文献对应引用点", resolvedSource: auditSwapSource ? "PMID:34299887" : GOOD[2].id };
      if (auditGroupReference) entries[2] = { ...entries[2], citation: "[2,3] 合并引用点", resolvedSource: "[2] PMID:35149136 摘要；[3] PMC全文（本行没有其PMID或DOI）" };
      // Same paper, different claims: a DOI-only merge would overwrite the clean point.
      entries.push({ ...entries[0], citation: "PMID:34299887 第二个引用点（需改写）", accuracy: "unsupported", textLevel: "fulltext" });
      entries.push({ ...entries[1], citation: "PMID:35149136 另一个引用点（需改写）", accuracy: "overstated", textLevel: "fulltext" });
      if (auditBibliography) entries[0] = { ...entries[0], bibliography: "mismatch", ...(auditBibliographyHard ? { retractionStatus: "concern" } : {}), note: "首作者与期刊错误；语义supported不能代替题录修正" };
      // A stale previous response must not be used if this run's auditor forgets to write.
      if (auditFileMissing) w(`${OUT}/tool-records/citation-audit-recheck.json`, JSON.stringify({ updated: entries.map((entry, i) => ({ entry: { ...entry, accuracy: "supported", auditEntryId: `A${String(i+1).padStart(4, "0")}` } })), removed: [] }));
      w(`${OUT}/05a-citation-audit.md`, "# 05a\n");
      // Intentionally wrong aggregate: the workflow must derive problems from entries.
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
    : { topic: "PSU 与青少年睡眠质量（模拟）", integrityMode: "development", teamProfile: "hybrid", figurePolish: "true", language: "中文",
        ...(figureTargetOverride ? { figureStyleJournal: "Explicit Test Journal" } : {}),
        ...(verifyAfterPortability ? { verifyCommand: `python3 -c 'from pathlib import Path; assert "/Users/" not in Path("${OUT}/04-analysis/run.py").read_text(); Path("verify-after-portability.ok").write_text("verified")'` } : {}),
      },
  agent: (name, opts) => ({ ask: async (prompt) => respond(name, prompt, opts) }),
  model: (id) => ({ __model: id }),
  log: (s) => logs.push(s),
  report: (o) => {
    stages[o.stage] = o.status;
  },
  phase: () => {},
  artifact: { board: () => {}, markdown: async () => {}, file: async (name, file) => { artifactFiles.push({ name, file }); } },
  files: { read: async (p) => fs.readFileSync(path.join(ws, p), "utf8") },
  world: {
    run: async (cmd, argv) => {
      const r = spawnSync(cmd, argv, { cwd: ws, env: { ...process.env, HOME: home }, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
      if (Buffer.byteLength(r.stdout ?? "") > 262144 || Buffer.byteLength(r.stderr ?? "") > 262144) throw new Error("world.run output exceeds 256KiB cap");
      return { exitCode: r.status ?? 1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
    },
  },
};

const src = fs.readFileSync(WF, "utf8");
const wrapped = `export default async function __wf({ args, agent, model, log, report, phase, artifact, world, files }) {\n${src}\n}`;
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
check(!calls.some((c) => c.name.startsWith("Synth") && c.prompt.includes("按协议从证据表剔除")), "final exclusion is applied by code without asking the synthesizer to rewrite the table again");
const metricsFile = outFile("99-metrics.json");
check(fs.existsSync(metricsFile), "99-metrics.json written by code");
if (fs.existsSync(metricsFile)) check(JSON.stringify(JSON.parse(fs.readFileSync(metricsFile, "utf8"))) === JSON.stringify(result.metrics), "99-metrics.json equals returned metrics");
check(result.notCovered.some((s) => s.includes("arXiv")), "failed search source is disclosed in notCovered");
check(stages["文献检索"] === "issues", "search stage marked issues when a source fails");
check(result.notCovered.some((s) => s.includes("提前结束") && s.includes("SemanticScholar")) && result.metrics.deterministic.sourcesTruncated === 1, "a rate-limited, truncated source is disclosed");
check(result.metrics.deterministic.candidates.raw > result.metrics.deterministic.candidates.deduped, "code-side dedup merged duplicate candidates");
check(fs.existsSync(outFile("05a-citation-audit.json")), "structured 05a JSON written");
const auditLedger = JSON.parse(fs.readFileSync(outFile("05a-citation-audit.json"), "utf8"));
check(auditLedger.entries.length === (auditRemove ? 8 : 9) && result.metrics.citationAudit.entries === (auditRemove ? 8 : 9) && result.metrics.citationAudit.abstractOnly === 3, "targeted citation re-check preserves the full ledger and abstract-level coverage");
check(auditLedger.entries[0].textLevel === "abstract" && auditLedger.entries[7].auditEntryId !== auditLedger.entries[0].auditEntryId, "two claims citing the same source keep distinct stable keys");
check(badAuditRecheck ? auditLedger.entries[7].accuracy === "unsupported" && auditLedger.entries[8].accuracy === "overstated" && stages["引文深审"] === "issues" : auditLedger.entries[7].accuracy === "supported" && stages["引文深审"] === "issues", "problem counts come from entries; missing/duplicate/out-of-scope updates never erase problems");
check(auditLedger.entries.every((e) => fs.readFileSync(outFile("05a-citation-audit.md"), "utf8").includes(e.auditEntryId)), "Markdown and JSON retain every stable citation key");
if (badAuditRecheck) check((auditLedger.issues?.length ?? 0) >= (badAuditFile ? 1 : auditRecheckInvalid ? 2 : 3) && result.notCovered.some((s) => s.includes("覆盖/复核异常")), "malformed targeted re-check coverage is disclosed");
if (auditRemove) check(auditLedger.removed.length === 1 && result.metrics.citationAudit.removed === 1 && JSON.parse(fs.readFileSync(outFile("tool-records/citation-audit-initial.json"), "utf8")).entries.length === 9, "explicitly removed citation points retain their original judgment and removal evidence");
check(calls.some((c) => c.name.startsWith("Analyst") && c.prompt.includes("可移植性检查")), "hard-coded home path in an analysis script is sent back to the analyst");
check(!fs.readFileSync(outFile("04-analysis/run.py"), "utf8").includes("/Users/"), "the analyst fixes hard-coded paths to use relative source paths");
check(stages["分析执行"] === (withTools && !sourceDrift ? "passed" : "issues"), "analysis status reflects both portability and the source-integrity boundary");
check(result.metrics.statsReview.pendingMinorNotes === 1 && result.metrics.peerReview.pendingMinorNotes === 1 && result.findings.filter((f) => f.what.includes("minor")).length === 2, "minor review notes are retained until their closure is verified");
check(visualCheckCount === 2, "figure revision is followed by a second independent visual check");
check(visualRecheckPass
  ? !result.notCovered.some((s) => s.includes("图表视觉验收未通过")) && result.verified.some((s) => s.includes("图表按"))
  : result.notCovered.some((s) => s.includes("图表视觉验收未通过")) && !result.verified.some((s) => s.includes("图表按")), "final visual verdict reflects the independent re-check rather than the initial failure");
check(stages["终检交付"] === "issues", "delivery cannot pass while review or visual issues remain");
check(["Archivist", "Scribe"].every((role) => calls.some((c) => c.name.startsWith(role) && c.prompt.includes("citationTextLevels") && c.prompt.includes('"abstractOnly":3') && c.prompt.includes('"noText":4') && c.prompt.includes("noText仅查题录"))), "audit-package and summary receive explicit text-level limits instead of full-source claims");
check(["Archivist", "Scribe"].every((role) => calls.some((c) => c.name.startsWith(role) && c.prompt.includes("待关闭审稿意见") && c.prompt.includes(`"figuresVerified":${visualRecheckPass}`))), "audit-package and summary writers receive the same unresolved caveats");

if (withTools) {
  check(auditLedger.issues.some((s) => s.includes("参考文献 3 ")) === (auditSwapSource || auditGroupReplacedSource), "reference coverage checks source identity and PMID/DOI aliases, never the number alone");
  check(result.metrics.deterministic.analysisManifest.listed === 1 && result.metrics.deterministic.analysisManifest.verified === 1 && result.verified.some((s) => s.includes("1/1") && s.includes("不等同于独立重跑")), "artifact counts come from the verified manifest, without claiming a clean rerun");
  const net = JSON.parse(fs.readFileSync(outFile("tool-records/resolve-evidence.json"), "utf8")).records;
  const online = net.some((r) => r.found !== null);
  check(online, "deterministic resolve reached PubMed/Crossref/OpenAlex (network required)");
  if (online) {
    const gate = result.metrics.citationGate;
    check(stages["引文核查"] === "issues" && gate.excluded === (gatePersistentError ? 3 : 2), `citation gate excludes retracted + fabricated even though the checker passed them (excluded ${gate.excluded})`);
    check(gateCompoundId ? gate.corrected === 1 && compoundTitleFixed && compoundFindingFixed : gateRemoveHard ? gate.corrected === 0 && !wordingFixed && !qualifierFixed : gate.corrected === (badGateRecheck || staleRecheck ? 0 : gateFinalNewError || gatePersistentError ? 1 : 2) && wordingFixed && qualifierFixed, "semantic corrections are counted only when requested and verified; hard-only removal needs no wording repair");
    if (!gateSameIdError && !gateRemoveHard && !gateCompoundId) check(result.notCovered.some((s) => s.includes("意见未能绑定")) && result.findings.some((f) => f.evidence.includes("人工绑定")), "unbound citation notes remain visible instead of silently passing");
    check(result.metrics.deterministic.evidenceResolved.unresolved === 1 && result.notCovered.some((s) => s.includes("arXiv:1907.10569") && s.includes("不能计为确定性核验通过")), "unresolved identifiers are not counted as deterministic verification");
    const paperMustRemainDenied = gateFinalNewError || gatePersistentError || badGateRecheck || staleRecheck;
    check(paperMustRemainDenied ? writerDraftPrompt.includes("35149136") && writerDraftPrompt.includes("禁止引用") : !/禁止引用：[^\n]*35149136/.test(writerDraftPrompt), "a corrected paper stays citable unless an explicit pending or exclusion judgment prohibits it");
    const writerSaw = writerDraftPrompt;
    check(writerSaw.includes("PMID:9500320") && writerSaw.includes("PMID:99999999") && writerSaw.includes("禁止引用"), "writer is told the excluded ids are off-limits");
    if (!gateRemoveHard) check(logs.some((l) => l.includes("失败条目已由代码剔除") && l.includes("9500320") && l.includes("99999999")), "code applies known failed identifiers to the final evidence exclusions");
    const wl1 = JSON.parse(fs.readFileSync(outFile("tool-records/whitelist.json"), "utf8"));
    const outside1 = wl1.outside.map((r) => r.label).sort().join(",");
    const expectedOutside = `${gateFinalNewError || gatePersistentError || badGateRecheck || staleRecheck ? "2," : ""}${auditGroupReplacedSource || badGateRecheck || staleRecheck ? "3," : ""}5,6`;
    check(outside1 === expectedOutside, `first final check flags refs 5 (not whitelisted) and 6 (gate-excluded); got ${outside1}`);
    check(wl1.outside.some((r) => r.label === "3") === (auditGroupReplacedSource || badGateRecheck || staleRecheck), "PMID↔DOI aliases remain allowed unless the source is replaced or explicitly pending");
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
  check(stages["引文核查"] === (staleRecheck || gateDropEntry || gateFinalNewError || gatePersistentError || badGateRecheck || grillContext || gateAmbiguousId ? "issues" : "passed"), "without tools the gate falls back to the checker's verdict");
  if (staleRecheck) check(result.metrics.citationGate.corrected === 0 && result.notCovered.some((s) => s.includes("意见未能绑定")) && result.findings.some((f) => f.evidence.includes("范围外失败条目")), "out-of-scope re-check failures cannot count as corrected entries");
  const lib = calls.find((c) => c.name.startsWith("Librarian"));
  check(!lib.system.includes("下载已由确定性工具完成"), "librarian falls back to downloading itself");
  check(result.metrics.deterministic.toolFailures > 0 && result.metrics.deterministic.toolFailures === result.metrics.deterministic.toolRuns, "every tool call failed soft");
}

const evidenceFinalPath = outFile("tool-records/evidence-final.json");
check(fs.existsSync(evidenceFinalPath) && fs.existsSync(outFile("tool-records/evidence-agent.md")), "canonical evidence JSON and the original agent document are both archived");
if (fs.existsSync(evidenceFinalPath)) {
  const evidenceFinal = JSON.parse(fs.readFileSync(evidenceFinalPath, "utf8"));
  const canonicalMd = fs.readFileSync(outFile("02-evidence-table.md"), "utf8");
  const normalizeId = (id) => id.trim().toLowerCase().replace(/^(pmid\s*[:：]?\s*|doi\s*[:：]\s*)/, "");
  const mdIds = [...canonicalMd.matchAll(/^\| ([^|]+) \|[^\n]*$/gm)].map((m) => m[1]).filter((id) => /PMID|DOI|10\.|arXiv/i.test(id)).map(normalizeId).sort();
  check(JSON.stringify(mdIds) === JSON.stringify(evidenceFinal.included.map((p) => normalizeId(p.id)).sort()), "the final evidence Markdown and JSON contain exactly the same included identifiers");
  check(evidenceFinal.included.every((p) => !evidenceFinal.excludedIds.some((id) => normalizeId(id) === normalizeId(p.id))), "excluded records cannot remain as included rows in the final evidence artifact");
}
if (auditNoneSource && withTools) {
  const allowed = JSON.parse(fs.readFileSync(outFile("tool-records/allowed-ids.json"), "utf8"));
  check(auditLedger.entries[3].textLevel === "none" && auditLedger.entries[3].resolvedSource.includes("PMID:1444724") && !allowed.includes("PMID:1444724"), "a source identified only by title without any original text cannot expand the citation whitelist");
}
if (gateRemoveHard && withTools) {
  const evidenceFinal = JSON.parse(fs.readFileSync(evidenceFinalPath, "utf8"));
  const denied = JSON.parse(fs.readFileSync(outFile("tool-records/deny-ids.json"), "utf8"));
  const allowed = JSON.parse(fs.readFileSync(outFile("tool-records/allowed-ids.json"), "utf8"));
  const removedIds = [RETRACTED.id, FABRICATED.id];
  check(hardEntriesRemoved && calls.filter((c) => c.name.startsWith("CiteGate")).length === 2 && result.metrics.citationGate.excluded === 2 && result.metrics.citationGate.corrected === 0, "early removal of deterministic hard failures preserves both exclusions without inventing a semantic correction round");
  check(evidenceFinal.included.length === 4 && removedIds.every((id) => evidenceFinal.excludedIds.includes(id) && denied.includes(id) && !allowed.includes(id)), "removed hard failures stay in the canonical exclusion record and deny list, outside the allowed evidence set");
  check(JSON.parse(fs.readFileSync(outFile("tool-records/resolve-evidence-r2.json"), "utf8")).records.length === 4 && result.metrics.deterministic.evidenceResolved.checked === 4, "the second resolution batch covers only the four remaining records without erasing earlier exclusion history");
}
if (gateFinalNewError) {
  check(result.metrics.citationGate.pending === 1 && result.metrics.citationGate.corrected === 1 && result.metrics.citationGate.excluded === (withTools ? 2 : 0), "a final-round new field error is pending, while the resolved old issue is not misclassified as a soft exclusion");
  const finalEvidence = fs.existsSync(evidenceFinalPath) ? JSON.parse(fs.readFileSync(evidenceFinalPath, "utf8")) : null;
  check(finalEvidence?.included.some((p) => p.id === GOOD[1].id) && finalEvidence?.pendingIds.includes(GOOD[1].id) && fs.readFileSync(outFile("02-evidence-table.md"), "utf8").includes("待修正复核，禁止引用"), "pending evidence remains visible in the canonical record with its citation prohibition");
  check(writerDraftPrompt.includes(GOOD[1].id) && /禁止引用/.test(writerDraftPrompt), "the writer receives the pending identity as prohibited evidence");
  const statsEvidence = calls.find((c) => c.name.startsWith("Stats")).prompt.split("证据表要点：")[1]?.split("\n")[0];
  const auditEvidence = calls.find((c) => c.name.startsWith("CiteAudit")).prompt.split("证据表白名单（仅可引用项）：")[1]?.split("\n")[0];
  check(statsEvidence && auditEvidence && [JSON.parse(statsEvidence), JSON.parse(auditEvidence)].every((papers) => !papers.some((p) => p.id === GOOD[1].id)), "pending evidence is omitted from the SAP and deep-audit citable lists while remaining in the canonical record");
  if (withTools) check(JSON.parse(fs.readFileSync(outFile("tool-records/deny-ids.json"), "utf8")).includes(GOOD[1].id), "the deterministic final whitelist also denies the unresolved pending paper");
}
if (badGateRecheck) check(result.metrics.citationGate.pending === 2 && result.metrics.citationGate.corrected === 0 && result.metrics.citationGate.excluded === (withTools ? 2 : 0), "invalid or duplicate final problem-key responses retain pending evidence rather than fabricating correction or exclusion");
if (gatePersistentError) check(result.metrics.citationGate.pending === 0 && result.metrics.citationGate.corrected === 1 && result.metrics.citationGate.excluded === (withTools ? 3 : 1), "an explicitly unresolved requested original issue can still be excluded after its targeted correction");
if (analysisFilePath) {
  check(["ArtDir", "VisualQA"].every((role) => calls.some((c) => c.name.startsWith(role) && c.prompt.includes(`${OUT}/04-analysis/figures`) && !c.prompt.includes("summary_report.md/figures"))), "a returned analysis entry file is never treated as the filesystem analysis directory");
  const outputArtifact = artifactFiles.find((a) => a.name === "outputs");
  check(outputArtifact && fs.statSync(path.join(ws, outputArtifact.file)).isFile(), "the analysis artifact publishes an existing entry file instead of an analysis directory");
}
if (auditGroupReference && withTools) {
  const bound = auditLedger.entries[2].auditReferences;
  check(Array.isArray(bound) && bound.some((r) => r.label === "3" && r.ids.includes("PMID:27802500")), "grouped citation coverage retains the original manuscript's concrete source identity");
  check(auditLedger.issues.some((s) => s.includes("参考文献 3 ")) === auditGroupReplacedSource, "a grouped reference is covered only while its final identity matches the audited original source");
}

if (gateDropEntry) {
  check(entryDropped && result.metrics.citationGate.corrected === 0 && result.metrics.citationGate.excluded === 0 && stages["引文核查"] === "issues", "an unapproved ID substitution cannot count as correction, exclusion, or a passed gate");
  check(result.findings.some((f) => `${f.what} ${f.evidence}`.includes("35149136") && /未获准|丢失|未授权|未经授权/.test(`${f.what} ${f.evidence}`)) && result.notCovered.some((s) => s.includes("意见未能绑定")), "a legitimate paper silently dropped during correction is disclosed with its identifier");
  check(result.findings.some((f) => `${f.what} ${f.evidence}`.includes("11111111")) && result.metrics.citationGate.unboundNotes > 0, "the unapproved replacement identifier is also retained as an unresolved gate issue");
}
if (verifyAfterPortability) {
  check(fs.existsSync(path.join(ws, "verify-after-portability.ok")) && result.metrics.reproFailed === false, "verifyCommand checks the repaired portable script rather than a superseded version");
  check(withTools ? result.verified.some((s) => s.includes("分析复现")) : !result.verified.some((s) => s.includes("分析复现")), "analysis reproduction is claimed only when verification and source-integrity evidence both support it");
}
if (gateSameIdError) {
  check(sameIdOldFixed && sameIdNewFixed && calls.filter((c) => c.name.startsWith("CiteGate")).length === 3, "a new error in an already flagged paper receives a last targeted correction and re-check");
  check(result.metrics.citationGate.corrected === 2 && result.metrics.citationGate.excluded === (withTools ? 2 : 0), "corrected papers, including negative evidence, are retained despite having failed earlier for different reasons");
  check(calls.some((c) => c.name.startsWith("CiteGate") && c.prompt.includes("已按上轮核查意见修正") && c.prompt.includes("国别修正完成") && c.prompt.includes("阴性比较对象修正完成")), "the final check sees corrected design and finding fields, including the negative comparison structure");
}
if (gateCompoundId) {
  const gate = result.metrics.citationGate;
  check(compoundTitleFixed && compoundFindingFixed && calls.filter((c) => c.name.startsWith("CiteGate")).length === 3, "a compound PMID/DOI identity receives correction of both its old title and new finding issue");
  check(gate.corrected === 1 && gate.unboundNotes === 0 && gate.pending === 0 && gate.excluded === (withTools ? 2 : 0), "two aliases for one corrected paper never create false unbound notes or pending evidence");
  check(!result.findings.some((f) => f.evidence.includes("标题题录旧错误") || f.evidence.includes("预期效应关联对象错误")), "corrected compound-identity findings are not recycled as outstanding findings");
  check(withTools || stages["引文核查"] === "passed", "without hard exclusions the corrected compound-identity citation gate passes");
  if (gateCompoundMissingId) check(JSON.parse(fs.readFileSync(outFile("tool-records/citation-gate-recheck.json"), "utf8")).requests.length === 1, "a note containing PMID and DOI for the same entry binds even when failedIds is omitted");
}
if (statsConflict) {
  check(statReviewCount === (statsRepairPersistent ? 3 : 2) && statsRepairCount === (statsRepairPersistent ? 2 : 1), "a minor verdict with major issues triggers bounded statistical correction and independent re-review");
  check(writerDraftPrompt.includes("主结论转录已更正 r=.20") && !writerDraftPrompt.includes("主结论转录错误 r=.99"), "the writer receives the analyst's returned corrected metadata rather than the old keyFindings");
  check(stages["统计审稿"] === (statsRepairPersistent ? "issues" : "passed") && result.metrics.statsReview.openMajors === (statsPersistentMajor ? 1 : 0), "statistical gate severity and open-major metrics reflect the issue list rather than the verdict label");
  check(fs.existsSync(outFile("tool-records/statistical-reviews.json")), "all statistical review rounds are retained as an inspectable record");
  if (verifyAfterPortability) check(JSON.parse(fs.readFileSync(outFile("tool-records/analysis-result-final.json"), "utf8")).reproducibility.includes("python3 -c") && JSON.parse(fs.readFileSync(outFile("tool-records/analysis-result-final.json"), "utf8")).reproducibility.includes("分析员自报"), "statistical metadata refresh preserves the deterministic command record and labels later self-reports");
  if (statsPersistentMajor) check(result.metrics.statsReview.verdict === "major-revision" && result.findings.some((f) => f.severity === "medium" && f.status === "unconfirmed" && f.evidence.includes(STAT_MAJOR)) && result.notCovered.some((note) => /统计/.test(note) && /major|主要/.test(note)), "persistent statistical majors remain unconfirmed findings and not covered after the bounded repair budget");
}
if (grillContext) {
  const context = archivedContext();
  const needed = [STAT_MINOR, PEER_MINOR, UNBOUND_NOTE];
  check(context.available && needed.every((note) => context.text.includes(note)), "facts ledger and complete review context are archived before questioning");
  check(calls.filter((c) => c.name.startsWith("Examiner") || c.name.startsWith("Writer") && c.prompt.includes("答辩拷问问题清单")).every((c) => needed.every((note) => c.prompt.includes(note)) && context.files.every((file) => c.prompt.includes(file))), "both examiner and rebuttal writer receive the same exact review notes, gate note and archive paths");
  check(writerReadArchivedContext && !result.notCovered.some((note) => note.includes("原材料缺失")), "the rebuttal writer can read the archived material instead of inventing a missing-context limitation");
}
if (gateAmbiguousId) {
  check(result.metrics.citationGate.unboundNotes > 0 && result.metrics.citationGate.corrected === 0 && result.metrics.citationGate.excluded === 0 && stages["引文核查"] === "issues", "unconfirmed compound identifiers do not create an alias equivalence without deterministic evidence");
  check(!calls.some((c) => c.name.startsWith("CiteGate") && c.prompt.includes("逐个 checkId")), "an ambiguous multi-paper note is not guessed into a targeted repair");
}
const expectedFigureJournal = figureTargetOverride ? "Explicit Test Journal" : "J Adolesc";
check(calls.some((c) => c.name.startsWith("ArtDir") && c.system.includes(`按目标期刊（${expectedFigureJournal}）`) && c.prompt.includes(`目标期刊：${expectedFigureJournal}`)) && calls.some((c) => c.name.startsWith("VisualQA") && c.system.includes(`逐张检查 ${expectedFigureJournal} 规范`)), "figure artist and visual reviewer share the same effective journal including explicit overrides");
const sourceIntegrity = result.metrics.deterministic.sourceIntegrity;
if (withTools) {
  check(sourceIntegrity?.available === true && sourceIntegrity.unchanged === !sourceDrift, "source integrity compares the current analysis/SAP source snapshot with the frozen one");
  if (sourceDrift) {
    check(sourceIntegrity.changed.some((s) => s.endsWith("run.py")) && result.metrics.reproFailed === true, "post-analysis source drift invalidates the prior reproducibility claim even when the output manifest matches");
    check(result.notCovered.some((s) => s.includes("源") && /变化|改动|修改/.test(s)), "post-analysis source drift is disclosed in notCovered");
    check(["Archivist", "Scribe"].every((role) => calls.some((c) => c.name.startsWith(role) && c.prompt.includes('"sourceIntegrity"') && c.prompt.includes('"unchanged":false') && c.prompt.includes("run.py"))), "the audit package and summary receive the changed-source boundary");
  }
} else {
  check(sourceIntegrity?.available === false && result.notCovered.some((s) => s.includes("源") && /未|无法|不可用/.test(s)), "missing source-snapshot tooling is disclosed without claiming source integrity");
}

if (auditFile || badAuditFile) check(calls.some((c) => c.name.startsWith("CiteAudit") && c.prompt.startsWith("修订后只复核") && c.prompt.includes("完成后只回复一行")), "targeted audit returns a file status string instead of a nested inline object schema");
if (auditFileMissing) check(fs.readFileSync(outFile("tool-records/citation-audit-recheck.json"), "utf8").trim() === "null" && auditLedger.entries[7].accuracy === "unsupported", "a missing new response cannot reuse a stale successful file");
if (auditBibliography && !auditBibliographyUnconfirmed && !auditBibliographyHard) check(JSON.parse(fs.readFileSync(outFile("tool-records/citation-audit-initial.json"), "utf8")).problems === 3 && auditLedger.entries[0].bibliography === "match" && calls.some((c) => c.name.startsWith("Writer") && c.prompt.includes("首作者与期刊错误")), "a supported claim with a mismatched bibliography is corrected and independently rechecked");
if (auditBibliographyHard) check(auditLedger.entries[0].retractionStatus === "concern" && result.findings.some((f) => f.what.includes(`引文深审问题：${GOOD[0].id}`) && f.status === "verified" && f.severity === "high"), "a bibliography mismatch cannot downgrade a concurrent expression-of-concern failure");
if (auditBibliographyUnconfirmed) check(auditLedger.entries[0].bibliography === "mismatch" && result.metrics.citationAudit.problems >= 1 && result.findings.some((f) => f.evidence.includes("首作者与期刊错误") && f.status === "unconfirmed" && f.severity === "medium"), "an unknown bibliography recheck cannot clear a confirmed initial mismatch");
if (statsSummaryErrors && !statsSummaryPersistent) check(result.metrics.statsReview.openMajors === 0 && result.metrics.statsReview.openSummaryIssues === 0 && statReviewCount === 2 && statsRepairCount === 1 && JSON.parse(fs.readFileSync(outFile("tool-records/analysis-result-final.json"), "utf8")).keyFindings[0].includes("已更正"), "minor summary transcription errors trigger metadata refresh and re-review without inventing a major verdict");
if (statsSummaryPersistent) {
  const m = result.metrics;
  const total = m.peerReview.openMajors + m.statsReview.openMajors + m.statsReview.openSummaryIssues + m.statsReview.pendingMinorNotes + m.peerReview.pendingMinorNotes + m.grill.unanswered + m.citationAudit.problems + m.citationAudit.coverageIssues + (m.citationGate.passed ? 0 : 1) + (m.reproFailed || m.deterministic.sourceIntegrity.unchanged !== true ? 1 : 0) + (visualRecheckPass ? 0 : 1);
  check(m.statsReview.verdict === "minor-revision" && m.statsReview.openMajors === 0 && m.statsReview.openSummaryIssues === 1 && result.findings.some((f) => f.evidence === STAT_MAJOR && f.status === "unconfirmed") && result.notCovered.some((n) => n.includes("分析摘要错误")) && result.conclusion.includes(`遗留 ${total} 项`), "persistent summary errors stay in metrics, findings, notCovered and the final count without a fabricated major verdict");
}
if (largeToolOutput) check(fs.statSync(outFile("tool-records/sources-before.json")).size > 262144 && result.metrics.deterministic.toolFailures > 0 && result.metrics.deterministic.sourceIntegrity.available === false, "oversized tool output stays on disk and falls back without killing the run or claiming snapshot verification");
check(calls.some((c) => c.name.startsWith("StatRev") && c.system.includes("完整回归模型残差")) && calls.some((c) => c.name.startsWith("ArtDir") && c.system.includes("CPR")) && calls.some((c) => c.name.startsWith("VisualQA") && c.system.includes("完整模型残差")), "statistical and visual reviewers check the actual plot formula rather than copying a wrong original");
const keep = process.argv.includes("--keep");
console.log(`\n${failures.length === 0 ? "ALL PASS" : `${failures.length} FAILED`} (${withTools ? "with tools" : "no tools"}${keep ? `; workspace kept at ${ws}` : ""})`);
if (!keep) fs.rmSync(tmp, { recursive: true, force: true });
process.exit(failures.length === 0 ? 0 : 1);
