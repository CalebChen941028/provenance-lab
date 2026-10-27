/* zcode-workflow
description: ProvenanceLab 溯源科研流水线（国际化
  UI）：角色名双语英文优先（PI·选题主席等）、看板与阶段名英文（Question/Search/Evidence/SAP/Draft…）、语言自动建议期刊主语言优先。含
  v1-v4 优化、D16-D36 全部（含确定性工具层与 S8 引文终检）。
args:
  checkpoints:
    type: string
    description: 【可选】"sap" / "sap,draft"；真实数据时默认 sap
    required: false
    default: ""
  dataPath:
    type: string
    description: 【可选】数据集路径；提供时 SAP 检查点默认开启
    required: false
    default: ""
  draftPath:
    type: string
    description: 【仅 citation-audit / review】稿件路径
    required: false
    default: ""
  externalDir:
    type: string
    description: 【仅 cross-validate】第三方产物目录（只读）
    required: false
    default: ""
  extraSources:
    type: string
    description: 【可选】额外检索源
    required: false
    default: ""
  field:
    type: string
    description: clinical / epidemiology / psychology / other-health / auto
    required: false
    default: auto
  figurePolish:
    type: string
    description: 【可选，默认 true】图表审计开关
    required: false
    default: "true"
  figureStyleJournal:
    type: string
    description: 【可选】图表目标期刊风格
    required: false
    default: ""
  figuresDir:
    type: string
    description: 【仅 figure-polish】图表目录
    required: false
    default: ""
  inclusionPrefs:
    type: string
    description: 【可选】纳入偏好；必纳未检出标红
    required: false
    default: ""
  integrityMode:
    type: string
    description: development / demo / benchmark
    required: false
    default: development
  journalGuideUrl:
    type: string
    description: 【可选】期刊指南 URL
    required: false
    default: ""
  language:
    type: string
    description: 【可选】交付语言（自动建议：期刊主语言优先）
    required: false
    default: ""
  lightModel:
    type: string
    description: 【可选】轻量模型
    required: false
    default: ""
  mode:
    type: string
    description: pipeline / figure-polish / citation-audit / review / cross-validate
      / audit-pack
    required: false
    default: pipeline
  privateLibraryPath:
    type: string
    description: 【可选】私有文献库
    required: false
    default: ""
  targetJournals:
    type: string
    description: 【可选】目标期刊
    required: false
    default: ""
  teamProfile:
    type: string
    description: hybrid / quality / economy
    required: false
    default: hybrid
  topic:
    type: string
    description: 研究方向或简要说明
    required: true
  verifyCommand:
    type: string
    description: 【可选】可复现性验收命令
    required: false
    default: ""
*/
interface PaperRecord {
  /** PubMed ID 或 DOI，如 "PMID:12345678" 或 "10.1016/j.xxx"；来自用户私有库且无标识时填 "私有库:<文件名>"。 */
  id: string;
  /** 论文标题。 */
  title: string;
  /** 发表年份。 */
  year: number;
  /** 研究设计一句话（RCT/队列/横断/系统综述等）。 */
  design: string;
  /** 与研究问题相关的核心发现一句话。 */
  finding: string;
  /** 来源："检索" 或 "私有库"（用户合法持有的已购文献）；证据表按此标注出处。 */
  source?: string;
  /** 文献状态审计结果："clean"=正常 / "retracted"=已撤稿 / "concern"=编辑关注声明 / "corrected"=更正/勘误 / "unknown"=未能核实。 */
  status?: "clean" | "retracted" | "concern" | "corrected" | "unknown";
}

interface PrivatePaper {
  /** PDF 文件名（含私有库内相对路径）。 */
  file: string;
  /** 从 PDF 首页/元数据提取的标题。 */
  title: string;
  /** 发表年份；提取不到留空字符串。 */
  year: string;
  /** DOI/PMID；提取不到留空字符串。 */
  id: string;
  /** 与研究问题的相关性一句话（对照 PICO）；不相关留空字符串表示排除。 */
  relevance: string;
}

interface SearchReport {
  /** 检索源名称（PubMed/EuropePMC/OpenAlex）。 */
  source: string;
  /** 检出的候选论文，按相关性排序，至多 20 条。 */
  papers: PaperRecord[];
  /** 实际使用的检索式。 */
  strategy: string;
  /** 是否因限流或请求预算提前结束（true 时证据可能不完整，会写进未覆盖清单）。 */
  truncated: boolean;
}

interface ResearchQuestion {
  /** 研究问题一句话。 */
  question: string;
  /** P：人群。 */
  population: string;
  /** I/E：干预或暴露。 */
  exposure: string;
  /** C：对照。 */
  comparator: string;
  /** O：结局。 */
  outcome: string;
  /** 研究设计。 */
  design: string;
  /** 报告规范（STROBE/CONSORT/PRISMA 等）。 */
  guideline: string;
  /** 可检验假设（含 H0/H1）。 */
  hypotheses: string[];
  /** 目标期刊 2-3 本。 */
  journals: string[];
  /** FINER 评估与新颖性定位。 */
  novelty: string;
  /** 学科领域判定：clinical / epidemiology / psychology / other-health（护理、公共卫生、药学、康复、营养等相邻健康科学，须注明最邻近主域；决定检索源路由）。 */
  field: "clinical" | "epidemiology" | "psychology" | "other-health";
}

interface PlanCritique {
  /** 是否存在会导致方向性错误的问题。 */
  hasBlockingIssues: boolean;
  /** 问题清单；没有则为空。 */
  issues: string[];
}

interface EvidenceTable {
  /** 纳入的论文。 */
  included: PaperRecord[];
  /** 排除篇数与主因。 */
  excludedSummary: string;
  /** 新颖性定位（与既往研究的差异）。 */
  noveltyStatement: string;
  /** 各研究偏倚风险要点（NOS/RoB 2/ROBINS-I）。 */
  riskOfBias: string;
  /** 证据空白。 */
  gaps: string[];
  /** 证据表文件路径（工作区相对）。 */
  evidencePath: string;
}

interface CitationCheck {
  /** 抽查是否全部通过。 */
  passed: boolean;
  /** 抽查篇数。 */
  checked: number;
  /** 失败项：定位不到原文，或结论与原文不符。 */
  failures: string[];
  /** 待修正项对应的条目 id（与 PaperRecord.id 逐字一致），含轻微转述/限定语问题；不是直接剔除清单。 */
  failedIds: string[];
}

interface CitationRecheck {
  /** 只判定本次请求的旧问题；新发现不能冒充旧问题仍失败。 */
  checks: { checkId: string; originalIssuesResolved: boolean; note: string; newIssues: string[] }[];
}

interface VariableEntry {
  /** 变量名（与分析脚本一致）。 */
  name: string;
  /** 操作定义：这个变量衡量什么、如何判定。 */
  definition: string;
  /** 数据来源：原始数据中的列名或派生来源。 */
  source: string;
  /** 变换规则：如何从来源列算出（含编码、分箱、标准化等）。 */
  transform: string;
  /** 选取理由：为什么用/不用（含被排除的候选变量及原因）。 */
  rationale: string;
}

interface StatPlan {
  /** 主要结局与分析方法。 */
  primaryAnalysis: string;
  /** 次要与敏感性分析。 */
  secondaryAnalyses: string[];
  /** 效应量指标（RR/OR/HR/β/Cohen's d 等）。 */
  effectMeasures: string;
  /** 多重比较校正策略。 */
  corrections: string;
  /** 缺失数据处理。 */
  missingData: string;
  /** 样本量/效能评估。 */
  power: string;
  /** 前提假设及其检验。 */
  assumptions: string;
  /** 变量字典：每个进入分析的变量一条，供人工逐一校对。 */
  variables: VariableEntry[];
  /** 每个分析方法的选择依据（方法→为什么，供人工校对）。 */
  methodRationale: string[];
  /** 统计分析计划文件路径。 */
  sapPath: string;
}

interface AnalysisResult {
  /** true = 用户真实数据；false = 固定种子模拟演示。 */
  realData: boolean;
  /** 分析脚本路径（固定随机种子）。 */
  scriptPath: string;
  /** 输出目录（表格/图表）。 */
  outputsPath: string;
  /** 关键发现（每条含效应量与 95% CI）。 */
  keyFindings: string[];
  /** 执行中每个方法选择与偏离 SAP 的决定及理由（供人工校对）。 */
  decisions: string[];
  /** 复现性证据（重跑退出码等）。 */
  reproducibility: string;
  /** 局限与注意。 */
  caveats: string;
}

interface AuditPack {
  /** 00-README 清单文件路径（动了啥/没动啥/产出在哪）。 */
  manifestPath: string;
  /** 05-audit-trail 审计追踪文件路径（流程图+变量字典+方法决策表+免责声明）。 */
  auditPath: string;
  /** Mermaid 流程图文本（同步返回便于直接展示）。 */
  mermaid: string;
}

interface Review {
  /** 必须解决的主要问题。 */
  majorIssues: string[];
  /** 次要问题。 */
  minorIssues: string[];
  /** 总体判断。 */
  verdict: "accept" | "minor-revision" | "major-revision" | "reject";
  /** 上一轮你提出的主要问题中，本轮仍未解决的条数（首轮评审填 0）；用于停滞检测。 */
  persistingFromLastRound: number;
}

interface MetaReview {
  /** 综合意见。 */
  summary: string;
  /** 最终决定。 */
  decision: "accept" | "revise";
  /** 修订必须完成的条目。 */
  required: string[];
}

interface DraftResult {
  /** 初稿文件路径。 */
  draftPath: string;
  /** 结构式摘要全文。 */
  abstract: string;
  /** 章节列表。 */
  sections: string[];
  /** 图表文件路径清单。 */
  figures: string[];
}

interface GrillQuestion {
  /** 问题原文：像答辩委员一样直白尖锐。 */
  question: string;
  /** 这个问题实际在拷问什么（考点）。 */
  probing: string;
}

interface Rebuttal {
  /** 预审回应信文件路径。 */
  rebuttalPath: string;
  /** 每个已答问题的回答要点，与回应信一一对应。 */
  answers: string[];
  /** 诚实承认答不出的问题及所缺条件。 */
  unanswered: string[];
}

interface CitationAuditEntry {
  /** 由编排代码分配的引用点稳定键；定向复核必须原样回传，不按 DOI 合并多个引用点。 */
  auditEntryId?: string;
  /** 代码按首审稿编号绑定的文献身份，支持组合引用；不得由复核响应覆盖。 */
  auditReferences?: PlabRef[];
  /** 被查引用：引文标记（编号/PMID/DOI）+ 所在章节与它支撑的论点一句话。 */
  citation: string;
  /** 实际定位到的源文献（PMID/DOI）与核对依据的文本层级（全文/仅摘要）。 */
  resolvedSource: string;
  /** 核对依据的文本层级：fulltext = 开放获取全文；abstract = 仅摘要级；private = 私有库本地全文；none = 未取到任何文本。 */
  textLevel: "fulltext" | "abstract" | "private" | "none";
  /** primary = 已是最原始源文献；secondary-needs-tracing = 综述转引、应回溯原始研究；untraceable = 定位不到。 */
  isPrimary: "primary" | "secondary-needs-tracing" | "untraceable";
  /** 原文中支撑该陈述的具体位置（如 Results 第 2 段 / Table 2 / Fig 1D）。 */
  sourceLocation: string;
  /** 逐点比对结论：我们的陈述与原文相比 supported/overstated/misleading/unsupported。 */
  accuracy: "supported" | "overstated" | "misleading" | "unsupported";
  /** 必要性：necessary = 支撑所在论点；redundant = 冗余堆砌；wrong-context = 张冠李戴。 */
  necessity: "necessary" | "redundant" | "wrong-context";
  /** 撤稿状态审计：clean=正常；retracted=已撤稿；concern=编辑关注声明；corrected=已有更正/勘误（引用时注明）；unknown=未能核实。 */
  retractionStatus: "clean" | "retracted" | "concern" | "corrected" | "unknown";
  /** 一句话结论与建议动作（保留/改写陈述/换原始源/删除）。 */
  note: string;
}

interface CitationAuditReport {
  /** 逐条审计结果。 */
  entries: CitationAuditEntry[];
  /** 问题引用数（非 primary、或非 supported、或非 necessary、或状态为 retracted/concern 任意一项）。 */
  problems: number;
  /** 逐条明细文件路径（并入审计包）。 */
  auditPath: string;
}

interface CitationAuditRecheck {
  /** 只更新本次请求的引用点；删除须亲见修订稿已无该引用点并给出定位依据。 */
  updates: { auditEntryId: string; action: "updated" | "removed"; entry: CitationAuditEntry | null; note: string }[];
}

interface PaperLibrary {
  /** 已下载：文件名（标题_期刊_年份.pdf）与对应 PMID/DOI。 */
  downloaded: { file: string; source: string }[];
  /** 未下载：Vancouver 格式参考文献条目 + 建议获取途径。 */
  notDownloaded: { reference: string; howToGet: string }[];
  /** 归档清单文件路径（08-papers-manifest.md）。 */
  manifestPath: string;
  /** PDF 保存目录。 */
  papersDir: string;
}

interface WorkflowReport {
  conclusion: string;
  findings: {
    what: string;
    evidence: string;
    severity: "low" | "medium" | "high";
    status: "verified" | "unconfirmed";
  }[];
  verified: string[];
  notCovered: string[];
  /** 运行遥测指标（L0 评测基线，跨运行可比）。 */
  metrics?: Record<string, unknown>;
}

const topic = String(args.topic ?? "").trim();
if (!topic) throw new Error("缺少 topic 参数：研究方向或想法");
const field = String(args.field ?? "auto");
const dataPath = String(args.dataPath ?? "").trim();
const targetJournals = String(args.targetJournals ?? "").trim();
const inclusionPrefs = String(args.inclusionPrefs ?? "").trim();
const integrityMode = String(args.integrityMode ?? "development");
const adversarial = integrityMode === "demo" || integrityMode === "benchmark";
const fullPanel = integrityMode === "benchmark";
const verifyCommand = String(args.verifyCommand ?? "").trim();
// 产物目录：有真实数据时放进数据集文件夹下的专用子目录（便于用户一并归档），否则放工作区
const OUT = dataPath ? `${dataPath.replace(/\/+$/, "")}/provenance-lab-output` : "provenance-lab-output";
// 交付文档语言：指定时所有交付物用该语言撰写，引用条目与检索式保留原文语言
const docLang = String(args.language ?? "").trim();
const langNote = docLang ? `\n语言要求：所有交付文档与结构化返回一律用${docLang}撰写（引用条目、检索式与代码注释保留原文/英文）。` : "";

// 混合编队：检索类与汇总可用轻量模型；统计计划、分析、审稿、写作永不降级
const teamProfile = String(args.teamProfile ?? "hybrid");
// 默认轻量模型是维护者账户下的 id；其他用户由 SKILL 启动第 2 步传 lightModel，或按 SKILL 说明在下表登记自己的模型 id
const LIGHT = model("account:bigmodel-individual-coding-plan/GLM-5.3-Flash");
const LIGHT_MODELS: Record<string, ModelRef> = {
  "account:bigmodel-individual-coding-plan/GLM-5.3": model("account:bigmodel-individual-coding-plan/GLM-5.3"),
  "account:bigmodel-individual-coding-plan/GLM-5.3-Flash": model("account:bigmodel-individual-coding-plan/GLM-5.3-Flash"),
  "account:bigmodel-offpeak-idle-plan/GLM-5.3": model("account:bigmodel-offpeak-idle-plan/GLM-5.3"),
  "account:bigmodel-offpeak-idle-plan/GLM-5.3-Flash": model("account:bigmodel-offpeak-idle-plan/GLM-5.3-Flash"),
  "account:bigmodel-highspeed-card/GLM-5.3": model("account:bigmodel-highspeed-card/GLM-5.3"),
  "account:bigmodel-highspeed-card/GLM-5.3-Flash": model("account:bigmodel-highspeed-card/GLM-5.3-Flash"),
  "opencode-go-chat/glm-5.3-flash": model("opencode-go-chat/glm-5.3-flash"),
  "opencode-go-messages/qwen3.8-flash": model("opencode-go-messages/qwen3.8-flash"),
  "opencode-go-messages/claude-haiku-5-5": model("opencode-go-messages/claude-haiku-5-5"),
  "opencode-go-responses/deepseek-v4.1-flash": model("opencode-go-responses/deepseek-v4.1-flash"),
  "opencode-glm-flash": model("opencode-go-chat/glm-5.3-flash"),
  "opencode-qwen-flash": model("opencode-go-messages/qwen3.8-flash"),
  "opencode-haiku": model("opencode-go-messages/claude-haiku-5-5"),
  "opencode-deepseek-flash": model("opencode-go-responses/deepseek-v4.1-flash"),
};
const lightModelArg = String(args.lightModel ?? "").trim();
const pickedLight = LIGHT_MODELS[lightModelArg];
if (lightModelArg !== "" && pickedLight === undefined) {
  log(`未知的 lightModel「${lightModelArg}」，回落到默认 GLM-5.3-Flash；可用键：${Object.keys(LIGHT_MODELS).join("、")}`);
}
const lightTier = { model: pickedLight ?? LIGHT };
const lightSearch = teamProfile !== "quality";
const lightSynth = teamProfile === "economy";

// 事实账本：每个关卡通过后记一条，后续所有专家都能看到前情
const factsLedger: string[] = [];
const record = (fact: string): void => {
  factsLedger.push(fact);
  log(fact);
};

const stage = (name: string, status: string): void => {
  report({ stage: name, status }, "stages");
};

artifact.board("stages", {
  title: "Pipeline Progress",
  key: "stage",
  status: "status",
  columns: ["in-progress", "passed", "issues"],
  cardTitle: "stage",
});

const SKILLS = "~/.zcode/skills";

// 确定性工具层（tools/plab.py，install.sh 装进 skill 目录）：标识符解析、撤稿状态、白名单、统计一致性、OA 下载由代码定案；
// 工具缺失或运行失败时返回 null，流程回落到原有的纯 agent 核查——最坏情况等同于没有工具层
const PLAB_CMD = 'python3 "$HOME/.zcode/skills/provenance-lab/tools/plab.py" "$@"';
// 工具结果目录名强调"记录"：L-A D37 中有 agent 把自写脚本放进了旧名 tools/，与机器记录混在一起
const TOOLS_OUT = `${OUT}/tool-records`;
const toolRuns: { cmd: string; ok: boolean }[] = [];
const writeFile = async (path: string, content: string): Promise<boolean> => {
  const r = await world.run("sh", ["-c", 'mkdir -p "$(dirname "$1")" && printf "%s\\n" "$2" > "$1"', "sh", path, content]);
  return r.exitCode === 0;
};
const plab = async <T>(argv: string[]): Promise<T | null> => {
  const r = await world.run("sh", ["-c", PLAB_CMD, "sh", ...argv]);
  let parsed: T | null = null;
  if (r.exitCode === 0) {
    try {
      parsed = JSON.parse(r.stdout) as T;
    } catch {
      parsed = null;
    }
  }
  toolRuns.push({ cmd: argv[0], ok: parsed !== null });
  if (parsed === null) log(`确定性工具 plab ${argv[0]} 未能运行（退出码 ${r.exitCode}），本环节回落到 agent 核查：${(r.stderr || r.stdout).slice(0, 300)}`);
  return parsed;
};
interface PlabRecord {
  id: string;
  found: boolean | null;
  title: string;
  year: string;
  status: "clean" | "retracted" | "concern" | "corrected" | "unknown";
  statusEvidence: string[];
  publicationTypes: string[];
  bibMatch?: { titleSimilarity: number | null; yearMatch: boolean | null };
  pmid?: string;
  doi?: string;
}
interface PlabRef {
  label: string;
  text: string;
  ids: string[];
}
interface PlabWhitelist {
  references: number;
  identified: number;
  outside: PlabRef[];
  unidentified: { label: string; text: string }[];
  ok: boolean;
}
interface PlabStatcheck {
  checked: number;
  inconsistent: number;
  decisionErrors: number;
  results: { text: string; computedP: number; reportedP: string; consistent: boolean; decisionError: boolean }[];
}
interface PlabOaFetch {
  downloaded: { id: string; file: string; source: string; license: string; title: string; journal: string; year: string; doi: string }[];
  notDownloaded: { id: string; title: string; journal: string; year: string; doi: string; reason: string; doiUrl?: string }[];
}
interface PlabSourceSnapshot {
  available: boolean;
  files: { path: string; sha256: string }[];
  issues: string[];
}
interface PlabManifest {
  available: boolean;
  listed: number;
  verified: number;
  missing: string[];
  mismatched: string[];
  invalid: { line: number; path?: string; reason: string }[];
  ok: boolean;
}
// 引用深审条目中出现的 PMID/DOI（深审员替换的原始文献可进入终检白名单）
const idsInText = (text: string): string[] => [
  ...[...text.matchAll(/PMID\s*[:：]?\s*(\d{1,9})/gi)].map((m) => `PMID:${m[1]}`),
  ...[...text.matchAll(/\b(10\.\d{4,9}\/[^\s`"<>，。；：、（）【】《》「」]+)/gi)].map((m) => `DOI:${m[1].replace(/[.,;:)\]}>'"*]+$/, "").toLowerCase()}`),
];
const auditProblem = (e: CitationAuditEntry): boolean =>
  e.isPrimary !== "primary" || e.accuracy !== "supported" || e.necessity !== "necessary" || e.retractionStatus === "retracted" || e.retractionStatus === "concern";
const auditReferenceBindings = (citation: string, refs: PlabRef[]): PlabRef[] => {
  const group = citation.match(/^\s*\[(\d+(?:\s*,\s*\d+)*)\]/)?.[1];
  const labels = group?.split(",").map((v) => v.trim()) ?? [];
  return refs.filter((r) => labels.includes(r.label)).map((r) => ({ ...r, ids: [...r.ids] }));
};
const prepareAudit = (raw: CitationAuditReport, refs: PlabRef[] = []): CitationAuditReport => {
  const entries = raw.entries.map((e, i) => ({ ...e, auditEntryId: `A${String(i + 1).padStart(4, "0")}`, auditReferences: auditReferenceBindings(e.citation, refs) }));
  return { ...raw, auditPath: `${OUT}/05a-citation-audit.md`, entries, problems: entries.filter(auditProblem).length };
};
const mergeAuditRecheck = (initial: CitationAuditReport, response: CitationAuditRecheck): {
  audit: CitationAuditReport; issues: string[]; removed: { entry: CitationAuditEntry; note: string }[];
} => {
  const issues: string[] = [];
  const removed: { entry: CitationAuditEntry; note: string }[] = [];
  const expected = new Set(initial.entries.filter(auditProblem).map((e) => e.auditEntryId));
  const updates = response.updates ?? [];
  const counts = new Map<string, number>();
  for (const u of updates) counts.set(u.auditEntryId, (counts.get(u.auditEntryId) ?? 0) + 1);
  for (const u of updates) if (!expected.has(u.auditEntryId)) issues.push(`复核返回未请求的引用点 ${u.auditEntryId || "（无稳定键）"}，未合入（汇总不能替代逐点明细）`);
  const entries = initial.entries.flatMap((e): CitationAuditEntry[] => {
    if (!expected.has(e.auditEntryId)) return [e];
    if (counts.get(e.auditEntryId!) !== 1) {
      issues.push(`引用点 ${e.auditEntryId} 的复核结果缺失或重复，保留原判定`);
      return [e];
    }
    const u = updates.find((v) => v.auditEntryId === e.auditEntryId)!;
    if (u.action === "removed" && u.entry === null && typeof u.note === "string" && u.note.trim()) {
      removed.push({ entry: e, note: u.note });
      return [];
    }
    const v = u.entry;
    if (u.action !== "updated" || !v || (v.auditEntryId && v.auditEntryId !== e.auditEntryId) ||
        typeof v.citation !== "string" || !v.citation.trim() || typeof v.resolvedSource !== "string" || !v.resolvedSource.trim() || typeof v.sourceLocation !== "string" || !v.sourceLocation.trim() || typeof v.note !== "string" ||
        !["fulltext", "abstract", "private", "none"].includes(v.textLevel) ||
        !["primary", "secondary-needs-tracing", "untraceable"].includes(v.isPrimary) ||
        !["supported", "overstated", "misleading", "unsupported"].includes(v.accuracy) ||
        !["necessary", "redundant", "wrong-context"].includes(v.necessity) ||
        !["clean", "retracted", "concern", "corrected", "unknown"].includes(v.retractionStatus)) {
      issues.push(`引用点 ${e.auditEntryId} 的复核结构无效，保留原判定`);
      return [e];
    }
    return [{ ...v, auditEntryId: e.auditEntryId, auditReferences: e.auditReferences ?? [] }];
  });
  return { audit: { ...initial, entries, problems: entries.filter(auditProblem).length }, issues, removed };
};
const missingAuditReferences = (refs: PlabRef[], entries: CitationAuditEntry[], records: PlabRecord[] | null): string[] => {
  const aliases = (id: string): Set<string> => {
    const keys = new Set([normKey(id)]);
    for (const rec of records ?? []) {
      const group = [rec.id, ...(rec.pmid ? [`PMID:${rec.pmid}`] : []), ...(rec.doi ? [`DOI:${rec.doi}`] : [])].map(normKey);
      if (group.includes(normKey(id))) group.forEach((k) => keys.add(k));
    }
    return keys;
  };
  const sameIds = (a: string[], b: string[]): boolean => a.some((id) => b.some((other) => aliases(id).has(normKey(other))));
  return refs.filter((r) => !entries.some((e) => {
    const ids = idsInText(`${e.citation} ${e.resolvedSource}`);
    if (sameIds(r.ids, ids)) return true;
    const bound = e.auditReferences ?? [];
    // 组合引用用首审稿的具体文献身份，不按最终稿编号借覆盖；显式矛盾身份不回落编号。
    if (ids.length > 0 && !ids.every((id) => bound.some((b) => sameIds([id], b.ids)))) return false;
    return bound.some((b) => r.ids.length > 0 ? sameIds(r.ids, b.ids) : b.ids.length === 0 && b.text === r.text);
  })).map((r) => r.label || r.text.slice(0, 80));
};
const saveAudit = async (audit: CitationAuditReport, deterministic: PlabRecord[] | null, issues: string[], removed: { entry: CitationAuditEntry; note: string }[]): Promise<void> => {
  const cell = (s: string): string => s.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
  const lines = ["# 引文深审：全量引用点账本", "", `当前 ${audit.entries.length} 个引用点，问题 ${audit.problems} 个；另 ${removed.length} 个引用点已删除，${issues.length} 项覆盖/复核异常。`, "", "| 稳定键 | 引用点 | 源文献与位置 | 文本层级 | 溯源/准确性/必要性/状态 | 结论 |", "|---|---|---|---|---|---|", ...audit.entries.map((e) => `| ${cell(e.auditEntryId ?? "")} | ${cell(e.citation)} | ${cell(e.resolvedSource)}<br>${cell(e.sourceLocation)} | ${e.textLevel} | ${e.isPrimary}/${e.accuracy}/${e.necessity}/${e.retractionStatus} | ${cell(e.note)} |`), "", "## 删除记录", "", ...removed.map((r) => `- ${cell(r.entry.auditEntryId ?? "")}：${cell(r.entry.citation)}；${cell(r.note)}`), "", "## 覆盖与复核异常", "", ...issues.map((s) => `- ${cell(s)}`)];
  // Markdown 与 JSON 由同一全量账本生成，不能让定向复核的子集覆盖首审明细。
  await writeFile(`${OUT}/05a-citation-audit.md`, lines.join("\n"));
  await writeFile(`${OUT}/05a-citation-audit.json`, JSON.stringify({ entries: audit.entries, deterministic, issues, removed }, null, 2));
};
// 候选文献去重：同一标识符或同一（规范化标题+年份）视为同一篇，来源合并标注
const normKey = (id: string): string => id.trim().toLowerCase().replace(/^(pmid\s*[:：]?\s*|doi\s*[:：]\s*|https?:\/\/(dx\.)?doi\.org\/)/, "");
const normTitle = (t: string): string => (t || "").toLowerCase().replace(/^retracted( article)?\s*:\s*/, "").replace(/[^a-z0-9一-鿿]+/g, " ").trim();
const dedupPapers = (papers: PaperRecord[]): PaperRecord[] => {
  const out: PaperRecord[] = [];
  const index = new Map<string, number>();
  for (const p of papers) {
    const keys = [p.id ? `I:${normKey(p.id)}` : "", normTitle(p.title) ? `T:${normTitle(p.title)}|${p.year}` : ""].filter((k) => k !== "");
    const hit = keys.map((k) => index.get(k)).find((i) => i !== undefined);
    if (hit === undefined) {
      out.push({ ...p });
      keys.forEach((k) => index.set(k, out.length - 1));
    } else {
      const merged = out[hit];
      if (p.source && !(merged.source ?? "").split("/").includes(p.source)) merged.source = merged.source ? `${merged.source}/${p.source}` : p.source;
      keys.forEach((k) => index.set(k, index.get(k) ?? hit));
    }
  }
  return out;
};
const compactRec = (r: PlabRecord) => ({ id: r.id, found: r.found, status: r.status, statusEvidence: r.statusEvidence, title: r.title, year: r.year, publicationTypes: r.publicationTypes, bibMatch: r.bibMatch });
const detNoteFor = (records: PlabRecord[]): string =>
  `\n确定性解析结果（tools/plab.py resolve，代码查询 PubMed/Crossref/OpenAlex 所得，以此为准）：${JSON.stringify(records.map(compactRec))}\n标识符存在性（found=false 即标识符不存在）与撤稿/关注/更正状态直接采用上述结果，不必再逐条查询；found=null 的条目（网络未能解析）自行核查。publicationTypes 可辅助判断是否综述/meta 分析（溯源维度）。`;

// ── 独立服务模式：不必每次全流程（figure-polish / citation-audit / review / audit-pack）──
const mode = String(args.mode ?? "pipeline").trim();
const draftPathArg = String(args.draftPath ?? "").trim();
const figuresDirArg = String(args.figuresDir ?? "").trim();
const externalDirArg = String(args.externalDir ?? "").trim();
const figureStyleJournal = String(args.figureStyleJournal ?? "").trim();
const journalGuideUrl = String(args.journalGuideUrl ?? "").trim();
const figurePolish = String(args.figurePolish ?? "true") !== "false";
// 参与式检查点（玻璃箱）：在关键决策点暂停等待人工审阅放行，破解黑箱不信任；续跑由助手编辑运行脚本后 AmendWorkflow（已完成步骤缓存零成本导入）
const checkpoints = String(args.checkpoints ?? "").trim();
const privateLibraryPathArg = String(args.privateLibraryPath ?? "").trim();
const styleTarget = figureStyleJournal || targetJournals || "Nature";
const figureSystem = (journal: string): string =>
  `你是图表艺术总监，按目标期刊（${journal}）的视觉规范审计并重绘科研图表。目标期刊已核实的公开指南优先；下列Nature/Cell示例仅在未指定相应规则时参考，不作为其他期刊硬性要求。规范要点（Nature/Cell 系通用）：色盲友好配色（Okabe-Ito / viridis）；无衬线字体（Arial/Helvetica，成稿图内文字按印刷比例不小于 5-7pt）；矢量优先（PDF/SVG）另存 ≥300-600dpi 位图备份；分面字母规范（Nature 粗体小写 a,b,c；Cell 粗体大写 A,B,C；其他期刊以其指南为准）；版面宽度按期刊栏宽（Nature 单栏 89mm / 双栏 183mm）；去图表垃圾（无底纹网格/3D/多余边框/装饰渐变）；面板间配色字体线型统一；图例自足；坐标轴带单位。${journalGuideUrl ? `先读取该期刊投稿指南并以其为准：${journalGuideUrl}。` : ""}工作方式：逐图审计（问题清单）→重写/新增绘图代码（matplotlib/seaborn 统一 rcParams 样式）→输出规范化图件与逐图审计表（问题→改动→依据）。绝不改动分析结果数值，只改呈现；原图保留不覆盖，规范化版本与新增绘图脚本只写入 figures-polished/。不得改动原分析/SAP脚本、冻结输出或清单；若发现原分析bug，记录具体代码/图件与影响，交数据分析员按SAP正式修订、重跑并重新冻结，不能偷偷修主脚本后保留旧图与旧复现声明。`;

if (mode !== "pipeline") {
  if (mode === "figure-polish") {
    const figDir = figuresDirArg || `${OUT}/04-analysis/figures`;
    phase("Solo:Figures");
    const artDirector = agent("Solo·ArtDir", { system: figureSystem(styleTarget) });
    const polished = await artDirector.ask<{ polishedDir: string; auditPath: string; figures: { name: string; changes: string }[] }>(
      `图表目录：${figDir}（逐个查看 PNG，读绘图脚本若有）。规范化版本输出到 ${figDir}-polished/，逐图审计表写入 ${OUT}/09-figure-audit.md。${langNote}`,
    );
    stage("图表规范化", "passed");
    return {
      conclusion: `图表规范化完成：${polished.figures.length} 张图按 ${styleTarget} 规范重绘，审计表见 ${OUT}/09-figure-audit.md。`,
      findings: polished.figures.map((f) => ({ what: `图 ${f.name}：${f.changes.split("\n")[0]}`, evidence: f.changes, severity: "low", status: "verified" })),
      verified: [`逐图对照 ${styleTarget} 规范审计并重绘（原图保留）`],
      notCovered: journalGuideUrl ? [] : ["未提供期刊指南链接，按 Nature/Cell 系通用规范执行"],
    };
  }
  if (mode === "citation-audit") {
    if (!draftPathArg) throw new Error("citation-audit 模式需要 draftPath 参数（待审稿件路径）");
    phase("Solo:CiteAudit");
    const citationAuditor = agent("Solo·CiteAudit", {
      system:
        `你是引文深审员，对稿件做引用-原文的深度比对（溯源/原文位置/准确性/必要性/撤稿状态五维，含最原始源文献回溯）。先读 ${SKILLS}/literature_search_europepmc/SKILL.md 与 ${SKILLS}/pubmed_database/SKILL.md 取原文：优先 EuropePMC 开放获取全文，取不到降级摘要并把 textLevel 设为 abstract；用户私有库（若提供 privateLibraryPath）的条目最优先读本地 PDF。状态审计：OpenAlex is_retracted / PubMed 出版类型 / Crossref Retraction Watch 开放库核查撤稿与编辑关注。只依据亲眼读到的原文下结论；限定语改变暴露、人群或结局且原文不支持时判 unsupported，不能借上游证据表背书或标 supported+可选建议。不改稿件。`,
    });
    const soloCited = await plab<{ references: PlabRef[] }>(["cited", draftPathArg, "--out", `${TOOLS_OUT}/cited.json`]);
    const soloIds = [...new Set((soloCited?.references ?? []).flatMap((r) => r.ids))];
    const soloDet = soloIds.length > 0 ? await plab<{ records: PlabRecord[] }>(["resolve", ...soloIds, "--out", `${TOOLS_OUT}/resolve-cited.json`]) : null;
    const audit = prepareAudit(await citationAuditor.ask<CitationAuditReport>(
      `稿件：${draftPathArg}（逐条读 References 与正文引用点）${privateLibraryPathArg ? `\n私有文献库：${privateLibraryPathArg}` : ""}${soloDet ? detNoteFor(soloDet.records) : ""}\n逐条明细写入 ${OUT}/05a-citation-audit.md 并返回。${langNote}`,
    ), soloCited?.references ?? []);
    const soloIssues = soloCited ? missingAuditReferences(soloCited.references, audit.entries, soloDet?.records ?? null).map((s) => `参考文献 ${s} 缺少逐点深审明细`) : ["引用清单提取未能运行，无法核对深审的文献覆盖范围"];
    // 结构化明细供 L1 评分脚本（evaluation/score_l1.py）确定性计分
    await saveAudit(audit, soloDet?.records ?? null, soloIssues, []);
    return {
      conclusion: `引文深审完成：${audit.entries.length} 条逐条比对，${audit.problems === 0 && soloIssues.length === 0 ? "全部通过" : `发现 ${audit.problems} 条问题、${soloIssues.length} 项覆盖异常（见明细）`}。明细：${audit.auditPath}`,
      findings: audit.entries.filter((e) => e.isPrimary !== "primary" || e.accuracy !== "supported" || e.necessity !== "necessary" || e.retractionStatus === "retracted" || e.retractionStatus === "concern").map((e) => ({ what: `引文问题：${e.citation.split("\n")[0]}`, evidence: `${e.note}（${e.isPrimary}/${e.accuracy}/${e.necessity}/${e.retractionStatus}）`, severity: "high", status: "verified" })),
      verified: [`${audit.entries.length} 条引用完成溯源/原文比对/必要性校验`],
      notCovered: [...soloIssues, ...(audit.entries.some((e) => e.textLevel === "none")
        ? [`${audit.entries.filter((e) => e.textLevel === "none").length} 条引用未取到任何原文（摘要与全文均无），仅核对了题录身份，陈述与原文是否相符未经比对，须人工取原文复核`]
        : [])],
    };
  }
  if (mode === "review") {
    if (!draftPathArg) throw new Error("review 模式需要 draftPath 参数（待审稿件路径）");
    phase("Solo:Review");
    const lenses = fullPanel
      ? [{ tag: "Methods", focus: "设计、偏倚、规范符合度" }, { tag: "Domain", focus: "新颖性与文献对照" }, { tag: "Stats", focus: "报告完整性与推断边界" }]
      : [{ tag: "Methods", focus: "设计、偏倚、规范符合度与论证链条" }];
    const reviews = await Promise.all(
      lenses.map((lens) => agent(`Reviewer·${lens.tag}`, { system: `你是期刊同行评审人（${lens.tag}视角：${lens.focus}）。苛刻但公正：major=不修不能发表，minor=建议项；读稿件与同目录支撑材料后给意见（不要改文件）。${langNote}` }).ask<Review>(`稿件：${draftPathArg}\n请给评审意见。`)),
    );
    let majors = reviews.flatMap((r) => r.majorIssues);
    if (adversarial) {
      const challenger = agent("Solo·Challenger", { system: "你的唯一任务是找出稿件的致命缺陷：夸大结论、数据与文字不符、引用与原文不符。亲自核对（不要改文件），找到实证才提出，找不到就明说。" });
      const attack = await challenger.ask<{ found: boolean; issues: string[] }>(`稿件：${draftPathArg}\n请攻击。找到有实证的致命缺陷则 found=true 并逐条列入 issues；没有则 found=false、issues 为空数组。${langNote}`);
      if (attack.found) majors.push(...(attack.issues ?? []).map((i) => `[对抗挑战] ${i}`));
    }
    const scribe2 = agent("Solo·ReviewSummary", { system: "你把多位评审人的意见汇总成一份给作者的评审报告（major/minor 分组、逐条可执行）。只写有依据的内容。", ...(teamProfile === "quality" ? {} : lightTier) });
    const reviewMd = await scribe2.ask<string>(`直接返回 Markdown 文本。评审意见：${JSON.stringify(reviews)}${majors.length > 0 ? `\n对抗挑战：${majors.join("；")}` : ""}${langNote}`);
    await artifact.markdown("review", reviewMd, { title: "同行评审模拟报告" });
    return {
      conclusion: `同行评审模拟完成（${integrityMode} 模式，${lenses.length} 位评审人${adversarial ? " + 对抗挑战" : ""}）：${majors.length === 0 ? "无 major 问题" : `${majors.length} 项 major 待处理`}。`,
      findings: majors.map((m) => ({ what: `major：${m.split("。")[0]}`, evidence: m, severity: "high", status: "verified" })),
      verified: [`${lenses.length} 位评审人独立审读稿件`],
      notCovered: [],
    };
  }
  if (mode === "cross-validate") {
    if (!externalDirArg) throw new Error("cross-validate 模式需要 externalDir 参数（第三方分析产物目录）");
    phase("Solo:CrossValidate");
    stage("CrossValidate", "in-progress");
    const reproducer = agent("复现检验员", {
      system:
        `你负责独立复现第三方 agent 产出的分析。先勘察 ${externalDirArg}（目录结构、脚本、输出、README），登记产物清单；然后逐个原样重跑其分析脚本（不改逻辑；环境用 uv 按需装依赖，临时环境自行搭建），记录每个脚本的退出码、关键输出要点与是否可复现；脚本不可运行或缺依赖时如实记录原因。第三方目录全程只读，绝不修改其中任何文件。${langNote}`,
    });
    const repro = await reproducer.ask<{ inventory: string; reproduction: { item: string; result: string; status: "reproduced" | "failed" | "not-runnable" }[] }>(
      `第三方产物目录：${externalDirArg}\n完成勘察与逐项复现后返回清单与结果（每项 status：reproduced=重跑成功且输出一致；failed=重跑报错或输出不一致；not-runnable=缺依赖/缺数据无法运行）。`,
    );
    const recomputer = agent("独立重算员", {
      system:
        `你是独立重算员，对第三方报告的数字做交叉验证，不信任任何已有结论：①若产物目录或用户提供的位置含原始数据，用你自己的独立代码重算关键统计量（效应量、CI、p、描述统计、样本量），与第三方报告值逐项对比；②无原始数据时做可推导性核验——从其已报告的量互推（SE↔CI↔p、百分比合计、自由度、样本量守恒）检查内部一致性。产出对比表：metric/原报告值/独立重算值/判定（match/mismatch/not-derivable）。只依据亲眼计算的结果下结论；遵循 code-to-data 铁律（原始数据行不读入上下文）。${langNote}`,
    });
    const recompute = await recomputer.ask<{ recomputation: { metric: string; reported: string; recomputed: string; verdict: "match" | "mismatch" | "not-derivable" }[] }>(
      `第三方产物目录：${externalDirArg}${dataPath ? `\n原始数据：${dataPath}` : "（未提供原始数据：做可推导性核验）"}\n复现检验员结论：${JSON.stringify(repro.reproduction)}\n完成独立重算并返回对比表。`,
    );
    const extStats = await agent("Solo·StatRev", {
      system:
        `你是统计审稿人，对第三方分析做方法学审校（不信任其结论）：方法与数据匹配、假设检验是否执行、多重比较校正、效应量与 CI 报告完整性、缺失数据处理、p-hacking 迹象、结论是否超出数据支撑。读 ${externalDirArg} 的方法描述与输出核对。没有问题就明说没有。${langNote}`,
    }).ask<Review>(`第三方产物目录：${externalDirArg}\n请审校并返回意见。`);
    const mismatches = recompute.recomputation.filter((r) => r.verdict === "mismatch");
    const reproFailures = repro.reproduction.filter((r) => r.status !== "reproduced");
    stage("CrossValidate", mismatches.length === 0 && reproFailures.length === 0 && extStats.verdict !== "reject" ? "passed" : "issues");
    const cvMd = [
      `# 第三方分析产物交叉校验报告`,
      ``,
      `- 校验对象：${externalDirArg}`,
      `- 复现：${repro.reproduction.length} 项（不可复现 ${reproFailures.length} 项）`,
      `- 独立重算：${recompute.recomputation.length} 个指标（不一致 ${mismatches.length} 个）`,
      `- 统计审校：${extStats.verdict}`,
      ``,
      `## 产物清单`, repro.inventory, ``,
      `## 逐项复现`, ...repro.reproduction.map((r) => `- ${r.item}：${r.result}`), ``,
      `## 独立重算对比`, ...recompute.recomputation.map((r) => `- ${r.metric}：报告值 ${r.reported} vs 重算 ${r.recomputed} → ${r.verdict}`), ``,
      `## 统计审校意见`, `- major：${extStats.majorIssues.join("；") || "无"}`, `- minor：${extStats.minorIssues.join("；") || "无"}`,
      ``,
      `> 免责：本报告为独立交叉校验，不构成对原分析正确性的完全担保；not-derivable 项建议提供原始数据后复校。`,
    ].join("\n");
    await artifact.markdown("external-validation", cvMd, { title: "第三方产物交叉校验报告" });
    return {
      conclusion: `交叉校验完成：复现 ${repro.reproduction.length} 项（不可复现 ${reproFailures.length}），独立重算 ${recompute.recomputation.length} 个指标（不一致 ${mismatches.length}），统计审校 ${extStats.verdict}。${mismatches.length === 0 && reproFailures.length === 0 ? "未发现不一致。" : "发现待处理问题，见 findings。"}`,
      findings: [
        ...mismatches.map((m) => ({ what: `重算不一致：${m.metric}`, evidence: `报告值 ${m.reported} vs 独立重算 ${m.recomputed}`, severity: "high", status: "verified" })),
        ...reproFailures.map((f) => ({ what: `不可复现：${f.item}`, evidence: f.result, severity: "high", status: "verified" })),
        ...extStats.majorIssues.map((i) => ({ what: `统计审校 major：${i.split("。")[0]}`, evidence: i, severity: "high", status: "verified" })),
      ],
      verified: [`逐项原样重跑其脚本`, `关键指标独立重算或可推导性核验`, `方法学独立审校（${extStats.verdict}）`],
      notCovered: dataPath ? [] : ["未提供原始数据，部分指标只能做可推导性核验（not-derivable 项）；提供数据后可完整重算"],
    };
  }
  if (mode === "audit-pack") {
    phase("Solo:AuditPack");
    const archivist0 = agent("Solo·Archivist", {
      system:
        `你把 ${OUT}/ 下已有的流水线产物整理重建『人工校对包』：00-README.md（目录树+动了啥/没动啥/去哪找+免责声明）与 05-audit-trail.md（Mermaid 流程图、变量字典与方法决策表（照抄 03-sap.md 与分析 decisions）、引文深审明细（照抄 05a）、关卡结论一览、人工校对指引、免责声明）。所有内容取自现有文件，禁止添加未发生的事项。${langNote}`,
    });
    const pack = await archivist0.ask<AuditPack>(`产物目录：${OUT}/（逐个 ls 与读取核实后撰写）。请写出两个文件并返回。`);
    return {
      conclusion: `审计包重建完成：${pack.manifestPath} 与 ${pack.auditPath}`,
      findings: [],
      verified: ["内容逐项取自现有产物文件"],
      notCovered: [],
    };
  }
  throw new Error(`未知的 mode「${mode}」：可选 pipeline（默认全流程）/ figure-polish / citation-audit / review / cross-validate / audit-pack`);
}
// ── 独立服务模式结束；以下为全流程 ──

phase("Question");
stage("立题", "in-progress");
const pi = agent("PI·选题主席", {
  system:
    "你是资深临床研究选题主席（临床医学/流行病学/心理学），站在 PI 视角把模糊想法凝练成可执行研究。设计阶段计算必须归档脚本、种子及汇总，修订保留前版；不要预先消费拟用于正式主分析的种子来展示一次实现结果。若已看到主种子结果，立题书如实注明时间顺序，后续SAP不得声称结果盲。勘察预算（token 纪律）：背景文献只读摘要级（≤8 篇），校准用效应量从检索摘要或用户证据取；立题阶段禁止全文深读（全文阅读是 S2/S7.5 专职角色的职责）。产出必须包含 PICO/PECO 结构、可检验假设、匹配的研究设计、对应报告规范（观察性=STROBE、RCT=CONSORT、系统综述=PRISMA、心理测量按 APA/心理领域惯例）、FINER 评估与新颖性定位、2-3 本目标期刊。设计要与可获得的数据条件匹配，不要承诺做不到的事。产物呈现遵循 natural-voice Part 5 学术呈现规范：编号章节、编号图表（Table/Figure N）配规范表头与标准图注、Vancouver 参考文献、APA/JARS 统计量格式、正式书面语——禁止零散碎片化与笔记式表达。立题书按学术文档组织（研究背景与立题依据/研究问题与假设（PICO 表）/设计与报告规范/目标期刊/参考文献 五章编号）。把完整立题书写入工作区文件。语态遵循 natural-voice 学术子集：直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责。",
});
const rq = await pi.ask<ResearchQuestion>(
  `研究方向（用户原话）：${topic}\n领域设定：${field}${field === "auto" ? "（由你判定，必须填入返回结果的 field 字段：clinical/epidemiology/psychology/other-health——护理、公共卫生、药学、康复、营养等相邻健康科学选 other-health 并注明最邻近主域）" : ""}\n数据条件：${dataPath ? `用户提供数据：${dataPath}` : "暂无真实数据，分析阶段将用固定种子模拟数据演示（立题时按此现实约束设计）"}\n${targetJournals ? `用户期刊偏好：${targetJournals}\n` : ""}必要时可读取 ${SKILLS} 下的相关技能文件辅助（如 pubmed_database、clinical_trials_database）获取背景。请产出立题书并写入 ${OUT}/01-research-question.md（自建目录），同时按接口返回结构化结果。${langNote}`,
);

phase("Critique");
const rqCritic = agent("Critic·方法学评审", {
  system:
    "你是方法学评审专家。亲自复核立题书：设计能否回答该问题、假设是否可检验、规范选择是否正确、数据条件下是否可行（不要改文件）。只挑会导致方向性错误或返工的问题；没有就直说没有。",
});
const rqCritique = await rqCritic.ask<PlanCritique>(`立题书：${JSON.stringify(rq)}\n请评审（对照原文与工作区实际，不要改文件）。`);
let finalRq = rq;
if (rqCritique.hasBlockingIssues && rqCritique.issues.length > 0) {
  finalRq = await pi.ask<ResearchQuestion>(
    `方法学评审提出以下问题，请逐条吸收并给出修订后的立题书（同步更新 ${OUT}/01-research-question.md）：\n${rqCritique.issues.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
  );
}
stage("立题", "passed");
record(`立题通过：${finalRq.question}（设计 ${finalRq.design}，规范 ${finalRq.guideline}）`);
const priorFacts = (): string => factsLedger.join("\n");

phase("Search");
stage("文献检索", "in-progress");
// 合法性分层：本机技能库（官方 API）+ 无技能源的官方免费 API + 用户指定源；禁止爬取 Google Scholar（违反其 ToS）；订阅库仅当用户另提供机构 API key 时使用（extraSources 注明）
interface SearchSource {
  name: string;
  dir?: string;
  hint: string;
}
const baseSources: SearchSource[] = [
  { name: "PubMed", dir: "pubmed_database", hint: "临床医学首选，MeSH 词与布尔检索式" },
  { name: "EuropePMC", dir: "literature_search_europepmc", hint: "覆盖欧洲与预印本（含 bioRxiv/medRxiv 预印本集合）" },
  { name: "OpenAlex", dir: "literature_search_openalex", hint: "跨库补充与引文网络" },
];
const ssSource: SearchSource = {
  name: "SemanticScholar",
  hint: "官方免费 API（graph.api.semanticscholar.org）：跨学科覆盖、引文网络与高被引追踪，心理学/交叉学科尤其补充",
};
const fieldSources: Record<string, SearchSource[]> = {
  clinical: [{ name: "ClinicalTrials", dir: "clinical_trials_database", hint: "ClinicalTrials.gov 注册库：在研/已完成临床试验" }],
  epidemiology: [{ name: "bioRxiv", dir: "literature_search_biorxiv", hint: "流行病学与生物学预印本" }],
  psychology: [{ name: "arXiv", dir: "literature_search_arxiv", hint: "心理测量与定量方法相关预印本（q-bio/stat）" }],
};
const userExtra = String(args.extraSources ?? "")
  .split(/[,，、;]/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map<SearchSource>((s) => ({ name: s, hint: "用户指定的补充检索源：仅用其官方 API 或合法开放途径；若为订阅库须用户已提供机构 API key，否则跳过并如实说明" }));
const fieldKey = finalRq.field ?? (field === "auto" ? "clinical" : field);
const sources: SearchSource[] = [
  ...baseSources,
  ssSource,
  ...(fieldSources[fieldKey] ?? []),
  ...userExtra,
];
log(`检索源路由（领域 ${fieldKey}）：${sources.map((s) => s.name).join("、")}`);
// 单个检索源失败只降级不中断：记入未覆盖清单，其余源照常进入证据综合
const searchSettled = await Promise.allSettled(
  sources.map((src) =>
    agent(`Search·${src.name}`, {
      system:
        `你是文献检索员。${src.dir ? `先读 ${SKILLS}/${src.dir}/SKILL.md，严格按该技能的方法与脚本执行检索（本机已安装）。` : `本源没有本机技能：直接调用其官方 API（${src.hint}），遵守其条款与限流。`}构建规范检索式，两段式检索（token 纪律）：①先取按相关性排序的题录列表（sort=relevance），命中总数用数据库 count 字段记录，**禁止全量取回摘要**；②仅对前 40 条题录取摘要精选，返回至多 20 条最相关文献。合法性铁律：只用官方 API 或开放接口，禁止爬取 Google Scholar 或任何违反服务条款的站点；订阅库（Scopus/WoS/Embase/PsycINFO）无用户机构凭据时跳过并如实说明。逐条给出 PMID/DOI、标题、年份、设计、与问题相关的核心发现。请求预算：本源总请求 ≤15 次（摘要批量获取优先）；遇 429/限流按服务提示等待后至多重试 2 次，仍失败就返回已取到的结果并把 truncated 设为 true、在 strategy 注明截断原因，不要长时间反复等待（无 key 的 Semantic Scholar 约 100 请求/5 分钟）。检索失败时如实说明，不要编造文献。`,
      ...(lightSearch ? lightTier : {}),
    }).ask<SearchReport>(
      `研究问题：${finalRq.question}\nPICO：P=${finalRq.population}；I/E=${finalRq.exposure}；C=${finalRq.comparator}；O=${finalRq.outcome}\n领域：${fieldKey}\n请检索并返回至多 20 条最相关文献。`,
    ),
  ),
);
const searchReports = searchSettled.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
const failedSources = sources.filter((_, i) => searchSettled[i].status === "rejected").map((s) => s.name);
const truncatedSources = searchReports.filter((r) => r.truncated).map((r) => r.source);
if (failedSources.length > 0) log(`检索源失败（已降级跳过）：${failedSources.join("、")}`);
const rawCandidates = searchReports.flatMap((r) => r.papers.map((p) => ({ ...p, source: p.source ?? r.source })));
const candidates = dedupPapers(rawCandidates);
log(`${searchReports.length}/${sources.length} 个检索源合计检出 ${rawCandidates.length} 条候选，代码去重后 ${candidates.length} 条（同标识符或同标题+年份合并，来源合并标注）`);
stage("文献检索", candidates.length > 0 && failedSources.length === 0 ? "passed" : "issues");

// 关联用户私有文献库（合法持有的已购文献，本地只读解析，仅并入证据链，不再分发）
const privateLibraryPath = String(args.privateLibraryPath ?? "").trim();
let privatePapers: PrivatePaper[] = [];
if (privateLibraryPath) {
  phase("PrivateLib");
  stage("私有文献库", "in-progress");
  const curator = agent("PrivLib·私有文献库管理员", {
    system:
      `你管理用户合法持有的已购文献库（${privateLibraryPath}）。合法性铁律：这些 PDF 仅本地读取用于用户本人的研究（个人使用授权），不外传、不再分发、不绕过任何 DRM。任务：①用 uv + pypdf/pdfminer.six 逐个解析 PDF 的元数据与首页文本，提取 标题/年份/DOI（提取不到就留空，不猜）；②对照研究问题的 PICO 判断每篇相关性，不相关的 relevance 留空；③绝不修改、移动或删除任何 PDF。返回结构化清单。`,
  });
  const privateLib = await curator.ask<{ papers: PrivatePaper[]; method: string }>(
    `研究问题：${finalRq.question}\nPICO：P=${finalRq.population}；I/E=${finalRq.exposure}；C=${finalRq.comparator}；O=${finalRq.outcome}\n文献库目录：${privateLibraryPath}\n请扫描解析并返回相关论文清单（含提取方法说明）。`,
  );
  privatePapers = privateLib.papers.filter((p) => p.relevance.length > 0);
  stage("私有文献库", "passed");
  record(`私有文献库：解析 ${privateLib.papers.length} 篇，与研究问题相关 ${privatePapers.length} 篇（并入证据链，来源标"私有库"）`);
}

phase("Evidence");
stage("证据综合", "in-progress");
const synthesizer = agent("Synth·证据综合员", {
  system:
    "你是系统综述方法学家。按 PRISMA 思路去重、按纳入/排除标准筛选，形成证据表；逐研究给出偏倚风险评估要点（队列/病例对照用 NOS，RCT 用 RoB 2，非随机干预用 ROBINS-I）；总结证据空白与本研究新颖性定位。**必纳核查**：用户纳入偏好中点名的文献若未出现在候选中，必须在 gaps 首条显式标红「用户必纳文献未检出：<条目>」并给出建议补充检索式——绝不静默丢失。文献状态与质量筛选：①排除已撤稿（retracted）与编辑关注声明（expression of concern）状态的文献作为证据（状态经 OpenAlex is_retracted、PubMed 出版类型、Crossref Retraction Watch 核查）；②纳入与排序只依据与研究问题的相关性、证据等级与方法学质量（偏倚风险评估），**不按期刊声望或被引数排序**（避免引用偏倚，保证新期刊与非英语区好研究的能见度）。所有保留的文献必须有真实可查的 PMID/DOI——**返回前逐条自检**：对每个保留条目用你检索时已获得的 API 响应（esummary/Crossref/OpenAlex 记录）核对标识符可解析、题录一致，自检不通过的条目直接剔除并计入排除原因（关卡退回一轮的代价远高于前置自检）。产物呈现遵循 natural-voice Part 5 学术呈现规范：编号章节、编号图表（Table/Figure N）配规范表头与标准图注、Vancouver 参考文献、APA/JARS 统计量格式、正式书面语——禁止零散碎片化与笔记式表达。证据表含 PRISMA 筛选说明与编号表格（Table N 规范表头+脚注）。把证据表写入文件后返回结构化结果。语态遵循 natural-voice 学术子集：直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责。",
  ...(lightSynth ? lightTier : {}),
});
let evidence = await synthesizer.ask<EvidenceTable>(
  `研究问题：${finalRq.question}\n候选文献（${searchReports.length} 个检索源合并，原始检出 ${rawCandidates.length} 条，已按标识符与标题+年份代码去重为 ${candidates.length} 条；PRISMA 流程图用这两个数字，跨标识符的同一文献仍可能重复，请继续去重）：${JSON.stringify(candidates)}\n${privatePapers.length > 0 ? `用户私有文献库（合法持有的已购文献，可并入证据表并逐条标 source="私有库"，id 填 DOI 或 "私有库:<文件名>"）：${JSON.stringify(privatePapers)}\n` : ""}检索式：${searchReports.map((r) => r.source + ": " + r.strategy).join("；")}\n用户纳入偏好（若有，必须遵守）：${inclusionPrefs || "无"}\n请去重筛选（在线检索与私有库同文时保留一条并双标注来源），把证据表写入 ${OUT}/02-evidence-table.md 并返回。${langNote}`,
);
stage("证据综合", "passed");
record(`证据综合：纳入 ${evidence.included.length} 篇（排除 ${evidence.excludedSummary}），新颖性：${evidence.noveltyStatement.split("。")[0]}`);

phase("CitationGate");
stage("引文核查", "in-progress");
const citationChecker = agent("CiteGate·引文核查员", {
  system:
    `你是引文核查员（PaperQA2 式落地核查 + 文献状态审计）。先读 ${SKILLS}/pubmed_database/SKILL.md 与 ${SKILLS}/literature_search_openalex/SKILL.md，用其方法逐条核验：①PMID/DOI 能否定位到真实论文；②题录信息（标题/年份/设计）是否相符；③我们写的核心发现是否与原文摘要一致；④状态审计：用 OpenAlex 的 is_retracted 字段、PubMed 出版类型标签（Retracted Publication / Expression of Concern / Correction）及 Crossref Retraction Watch 开放库（api.labs.crossref.org/retractions）核查撤稿/关注/更正状态，写入 status。核对层级=题录+摘要级（token 纪律：本关卡不取全文，全文级深比对是 S7.5 引文深审的职责；状态审计只用 API 字段与标签，不下载原文）。抽查至少 8 条或全部（不足 8 条时全查），状态审计覆盖全部纳入文献。发现失败项与异常状态文献（retracted/concern）如实列出，不要放水，也不要改任何文件。需要修正的轻微偏差或无原文支持的限定语也必须进入 failures 与 failedIds；“建议保留条目”不等于原表述已通过。若输入附有确定性解析结果：①标识符定位与④状态审计以其为准、不再自行查询，你的精力放在②题录相符（尤其 bibMatch 相似度低的条目）与③核心发现-摘要一致性。`,
});
// 确定性预检：代码解析全部纳入文献；标识符不存在或撤稿/关注的条目直接判失败，不依赖核查员抽查是否抽到
const gateResolve = async (papers: PaperRecord[], name: string): Promise<PlabRecord[] | null> => {
  const file = `${TOOLS_OUT}/${name}-input.json`;
  if (!(await writeFile(file, JSON.stringify(papers.map((p) => ({ id: p.id, title: p.title, year: p.year })))))) return null;
  const res = await plab<{ records: PlabRecord[] }>(["resolve", "--file", file, "--out", `${TOOLS_OUT}/${name}.json`]);
  return res && res.records.length === papers.length ? res.records : null;
};
// 无从修正的硬失败：标识符不存在、已撤稿、编辑关注——直接剔除，不进入修正轮
const hardFailures = (papers: PaperRecord[], recs: PlabRecord[] | null): { id: string; why: string }[] =>
  (recs ?? []).flatMap((r, i) => {
    const id = papers[i].id;
    if (r.found === false) return [{ id, why: `[确定性] ${id}：标识符无法解析（PubMed/Crossref/OpenAlex 均无此记录）` }];
    if (r.status === "retracted" || r.status === "concern") return [{ id, why: `[确定性] ${id}：${r.status === "retracted" ? "已撤稿" : "编辑关注声明"}（${r.statusEvidence.join("；")}）` }];
    return [];
  });
// 复合ID中的纯PMID/DOI和同一确定性记录属于一个身份，不把注释整段当标识符。
const gateIdKeys = (id: string, recs: PlabRecord[] | null): Set<string> => {
  const parsed = idsInText(id).map(normKey);
  const matched = (recs ?? []).filter((r) => normKey(r.id) === normKey(id) ||
    [r.id, r.pmid ? `PMID:${r.pmid}` : "", r.doi ? `DOI:${r.doi}` : ""].filter(Boolean).map(normKey).some((key) => parsed.includes(key)));
  const keys = new Set([normKey(id)]);
  if (matched.length === 1) {
    const rec = matched[0];
    // 只扩展已解析记录的别名，不能把夹在复合字符串内的另一篇文献并入。
    [rec.pmid ? `PMID:${rec.pmid}` : "", rec.doi ? `DOI:${rec.doi}` : ""].filter(Boolean).forEach((v) => keys.add(normKey(v)));
    if (idsInText(rec.id).length === 1) keys.add(normKey(idsInText(rec.id)[0]));
  } else if (matched.length === 0 && parsed.length === 1) keys.add(parsed[0]);
  return keys;
};
const gateIdsMatch = (a: string, b: string, recs: PlabRecord[] | null): boolean => {
  const keys = gateIdKeys(a, recs);
  return [...gateIdKeys(b, recs)].some((key) => keys.has(key));
};
const withDeterministic = (raw: CitationCheck, papers: PaperRecord[], recs: PlabRecord[] | null): CitationCheck => {
  const failures = raw.failures ?? [];
  const locate = (ids: string[]): PaperRecord[] => papers.filter((p) => ids.some((id) => gateIdsMatch(id, p.id, recs)));
  const explicit = (raw.failedIds ?? []).map((id) => {
    const hit = locate([id]);
    return hit.length === 1 ? hit[0].id : id; // 无法唯一映射的显式ID保留，不能静默丢弃。
  });
  const inferred = failures.flatMap((f) => {
    const ids = idsInText(f);
    const hit = locate(ids);
    // 同篇PMID+DOI计一个对象；多篇或无法落地的额外标识符不能猜失败者。
    return hit.length === 1 && ids.every((id) => gateIdsMatch(id, hit[0].id, recs)) ? [hit[0].id] : [];
  });
  const failedIds = [...new Map([...explicit, ...inferred].map((id) => [normKey(id), id])).values()];
  const check: CitationCheck = { ...raw, passed: raw.passed && failures.length === 0 && failedIds.length === 0, failures, failedIds };
  const det = hardFailures(papers, recs).filter((d) => !check.failedIds.includes(d.id));
  return det.length === 0 ? check : { ...check, passed: false, failures: [...check.failures, ...det.map((d) => d.why)], failedIds: [...check.failedIds, ...det.map((d) => d.id)] };
};
let gateRecs = await gateResolve(evidence.included, "resolve-evidence");
const initialHardFailures = hardFailures(evidence.included, gateRecs);
const unresolvedGateNotes = new Set<string>();
const gatePendingIds = new Set<string>();
const isGatePending = (id: string): boolean => [...gatePendingIds].some((v) => normKey(v) === normKey(id));
const markGatePending = (id: string): void => { if (!isGatePending(id)) gatePendingIds.add(id); };
const keepUnboundNotes = (check: CitationCheck): void => {
  for (const f of check.failures) {
    if (!check.failedIds.some((id) => idsInText(f).some((mentioned) => gateIdsMatch(mentioned, id, gateRecs)))) unresolvedGateNotes.add(f);
  }
  for (const id of check.failedIds) if (evidence.included.filter((p) => gateIdsMatch(id, p.id, gateRecs)).length !== 1) unresolvedGateNotes.add(`核查失败ID ${id} 无法唯一绑定当前证据条目，须人工确认`);
  if (!check.passed && check.failures.length === 0 && check.failedIds.length === 0) unresolvedGateNotes.add("核查员返回未通过，但未提供可定位的失败项，须人工确认");
};
// 修正只能改字段，未经批准的删条或新增/换ID不能静默改变证据集合。
const checkEvidenceChanges = (before: EvidenceTable, after: EvidenceTable, allowedRemoval: string[]): void => {
  const oldKeys = new Set(before.included.map((p) => normKey(p.id)));
  const newKeys = new Set(after.included.map((p) => normKey(p.id)));
  const allowed = new Set(allowedRemoval.map(normKey));
  const missing = before.included.filter((p) => !newKeys.has(normKey(p.id)) && !allowed.has(normKey(p.id))).map((p) => p.id);
  const added = after.included.filter((p) => !oldKeys.has(normKey(p.id))).map((p) => p.id);
  missing.forEach((id) => markGatePending(id));
  added.forEach((id) => markGatePending(id));
  if (missing.length > 0) unresolvedGateNotes.add(`证据修正响应未经批准丢失条目 ${missing.join("、")}；未恢复或复核，不能视为合法剔除或修正保留`);
  if (added.length > 0) unresolvedGateNotes.add(`证据修正响应未经批准新增或更换ID ${added.join("、")}；新条目未完成核查，须人工确认`);
};
let citation = withDeterministic(
  await citationChecker.ask<CitationCheck>(`证据表纳入文献：${JSON.stringify(evidence.included)}${gateRecs ? detNoteFor(gateRecs) : ""}\n请逐条核查并返回结果。`),
  evidence.included,
  gateRecs,
);
keepUnboundNotes(citation);
let citationFailures: string[] = citation.passed ? [] : citation.failures;
if (!citation.passed) {
  log(`引文核查发现 ${citation.failures.length} 处失败，退回证据综合员修正`);
  const beforeCorrection = evidence;
  const removableHardIds = hardFailures(evidence.included, gateRecs).map((f) => f.id);
  evidence = await synthesizer.ask<EvidenceTable>(
    `引文核查发现以下失败项，请修正证据表（只有确定性不存在/撤稿/关注可撤掉；其余更正题录、design、finding等出错字段并保留原ID，不得静默删条或换ID，更新 ${OUT}/02-evidence-table.md）：\n${citation.failures.join("\n")}`,
  );
  checkEvidenceChanges(beforeCorrection, evidence, removableHardIds);
  gateRecs = await gateResolve(evidence.included, "resolve-evidence-r2");
  citation = withDeterministic(
    await citationChecker.ask<CitationCheck>(`修正后的证据表：${JSON.stringify(evidence.included)}${gateRecs ? detNoteFor(gateRecs) : ""}\n请复核失败项与抽查其余条目。`),
    evidence.included,
    gateRecs,
  );
  citationFailures = citation.passed ? [] : citation.failures;
}
keepUnboundNotes(citation);
// 剔除只针对两类：无从修正的硬失败（标识符不存在/撤稿/关注）与修正后仍失败的条目。
// 第 2 轮所有非硬失败统一给一次最后的定向修正与复核；同ID不证明同一问题。
// L-A D40首轮已改、修正时新引入design/参照组错误，却因ID曾失败直接删掉了阴性研究。
const failuresAbout = (ids: string[], all: string[]): string[] => {
  if (ids.length === 0) return [];
  const hit = all.filter((f) => idsInText(f).some((mentioned) => ids.some((id) => gateIdsMatch(mentioned, id, gateRecs))));
  return hit.length > 0 ? hit : all;
};
let gateExcludedIds: string[] = initialHardFailures.map((f) => f.id);
let gateCorrectedIds: string[] = [];
if (!citation.passed) {
  const hardKeys = new Set(hardFailures(evidence.included, gateRecs).map((d) => normKey(d.id)));
  const persistent = citation.failedIds.filter((id) => hardKeys.has(normKey(id)));
  const fresh = citation.failedIds.filter((id) => !persistent.includes(id));
  let freshStill: string[] = [];
  if (fresh.length > 0) {
    log(`引文核查第 2 轮有 ${fresh.length} 条非硬失败，统一最后一次修正再复核（同ID也可能是新问题）`);
    const beforeTargeted = evidence;
    evidence = await synthesizer.ask<EvidenceTable>(
      `引文核查第 2 轮发现以下可纠正问题（同一ID可能是本次新引入的错误；统一最后一次先修正再复核，不剔除）：\n${failuresAbout(fresh, citation.failures).join("\n")}\n请按核查意见更正这些条目的全部出错字段（title/year/design/finding等），不得只改finding；题录与摘要一致，阴性结果、比较对象、限定语须如实保留。更新 ${OUT}/02-evidence-table.md，保留条目本身和原ID（不得删条或换ID）并返回证据表。`,
    );
    checkEvidenceChanges(beforeTargeted, evidence, []);
    const freshKeys = fresh.map(normKey);
    const freshPapers = evidence.included.filter((p) => freshKeys.includes(normKey(p.id)));
    const presentKeys = new Set(freshPapers.map((p) => normKey(p.id)));
    const missing = fresh.filter((id) => !presentKeys.has(normKey(id)));
    if (missing.length > 0) unresolvedGateNotes.add(`修正响应丢失待复核条目 ${missing.join("、")}；未复核，不能计为修正保留`);
    if (freshPapers.length > 0) {
      const requests = freshPapers.map((paper, i) => ({ checkId: `G${String(i + 1).padStart(4, "0")}`, paper, originalIssues: failuresAbout([paper.id], citation.failures) }));
      const response = await citationChecker.ask<CitationRecheck>(
        `以下 ${freshPapers.length} 条已按上轮核查意见修正，请只复核这些条目。逐个 checkId 回传 checks（每键一次）：${JSON.stringify(requests)}\noriginalIssuesResolved 只判本次 originalIssues 是否改好；核查中首次发现的其他字段问题写 newIssues（即使同一ID也不能算旧问题持续）。note 给出原文与修正的定位依据。新问题不得伪装原问题失败，不返回无键汇总；不要改文件。`,
      );
      await writeFile(`${TOOLS_OUT}/citation-gate-recheck.json`, JSON.stringify({ requests, response }, null, 2));
      const checks = Array.isArray(response?.checks) ? response.checks.filter((v) => v && typeof v === "object") : [];
      const malformedChecks = !Array.isArray(response?.checks) || response.checks.length !== checks.length;
      const outside = checks.filter((v) => !requests.some((r) => r.checkId === v.checkId));
      if (outside.length > 0) unresolvedGateNotes.add(`定向复核返回范围外失败条目/问题键 ${outside.map((v) => v.checkId).join("、")}；不能计为修正保留`);
      const remainingNotes: string[] = [];
      for (const request of requests) {
        const matches = checks.filter((v) => v.checkId === request.checkId);
        const v = matches[0];
        if (malformedChecks || outside.length > 0 || matches.length !== 1 || typeof v?.originalIssuesResolved !== "boolean" || typeof v.note !== "string" || !v.note.trim() || !Array.isArray(v.newIssues) || !v.newIssues.every((n) => typeof n === "string" && n.trim())) {
          markGatePending(request.paper.id);
          unresolvedGateNotes.add(`定向复核 ${request.checkId}（${request.paper.id}）缺失/重复/无效，保留待确认并禁止引用，不能计为修正或剔除`);
          continue;
        }
        if (!v.originalIssuesResolved) {
          freshStill.push(request.paper.id);
          remainingNotes.push(`${request.paper.id}：已明确送修的原问题仍失败；${v.note}`);
        } else if (v.newIssues.length > 0) {
          markGatePending(request.paper.id);
          unresolvedGateNotes.add(`${request.paper.id}：原问题已修，末轮首次发现其他问题（${v.newIssues.join("；")}）；保留条目待修正复核、禁止引用，不自动剔除、不追加无界轮次`);
        } else if (!isGatePending(request.paper.id)) gateCorrectedIds.push(request.paper.id);
      }
      if (remainingNotes.length > 0) citationFailures = [...remainingNotes, ...failuresAbout(persistent, citation.failures)];
    }
  }
  gateExcludedIds = [...new Map([...gateExcludedIds, ...persistent, ...freshStill].map((id) => [normKey(id), id])).values()];
  if (freshStill.length === 0) citationFailures = persistent.length > 0 ? failuresAbout(persistent, citation.failures) : [];
}
for (const failure of initialHardFailures) if (!citationFailures.some((f) => normKey(f).includes(normKey(failure.id)))) citationFailures.push(failure.why);
if (gateExcludedIds.length > 0) {
  // 剔除结论已确定，直接按规范化ID过滤；不再让综合员重写全表或自行推翻结论。
  const stillFailed = new Set(gateExcludedIds.map(normKey));
  evidence.included = evidence.included.filter((p) => !stillFailed.has(normKey(p.id)));
  log(`失败条目已由代码剔除：${gateExcludedIds.join("、")}（最终证据表由代码生成）`);
}
// 最终证据表和结构化清单取自同一数据；agent版另存，避免文件51篇、代码50篇。
const evidenceCell = (v: string): string => v.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
const evidenceArchive = await world.run("sh", ["-c", 'test -f "$1" && cp "$1" "$2"', "sh", evidence.evidencePath, `${TOOLS_OUT}/evidence-agent.md`]);
if (evidenceArchive.exitCode !== 0) unresolvedGateNotes.add("综合员原版证据文件未能留档，须人工核对原始修订记录");
evidence.evidencePath = `${OUT}/02-evidence-table.md`;
const evidenceFinal = { ...evidence, excludedIds: gateExcludedIds, pendingIds: [...gatePendingIds], gateNotes: [...unresolvedGateNotes] };
const evidenceSaved = await writeFile(`${TOOLS_OUT}/evidence-final.json`, JSON.stringify(evidenceFinal, null, 2)) && await writeFile(evidence.evidencePath, [
  "# 最终证据表", "", `纳入 ${evidence.included.length} 篇；剔除 ${gateExcludedIds.length} 篇；待修正复核 ${gatePendingIds.size} 篇。待确认项保留记录但禁止写作引用。`, "",
  "| ID | 标题 | 年份 | 设计 | 核心发现 | 来源 | 状态/引用资格 |", "|---|---|---|---|---|---|---|",
  ...evidence.included.map((p) => `| ${evidenceCell(p.id)} | ${evidenceCell(p.title)} | ${p.year} | ${evidenceCell(p.design)} | ${evidenceCell(p.finding)} | ${evidenceCell(p.source ?? "未报告")} | ${isGatePending(p.id) ? "待修正复核，禁止引用" : evidenceCell(p.status ?? "未报告")} |`),
  "", "## 排除与待确认", "", `初筛排除摘要：${evidence.excludedSummary}`, `剔除ID：${gateExcludedIds.join("、") || "无"}`, ...citationFailures, ...unresolvedGateNotes,
  "", "## 综合阶段偏倚风险与证据空白", "", "以下为综合阶段的原评估，末轮剔除未重算其中汇总数；最终条目与引用资格以本表前面的逐条清单为准。", evidence.riskOfBias, ...evidence.gaps, evidence.noveltyStatement,
  "", `${evidenceArchive.exitCode === 0 ? `原综合员文档保存在 ${TOOLS_OUT}/evidence-agent.md` : "原综合员文档未能留档，须人工核对"}；最终纳入身份与字段以本表及 evidence-final.json 为准。`,
].join("\n"));
if (!evidenceSaved) unresolvedGateNotes.add("最终证据表或结构化清单写入失败，文件与白名单一致性未确认");
const gateDeniedIds = [...new Set([...gateExcludedIds, ...gatePendingIds])];
const citableEvidence = evidence.included.filter((p) => !isGatePending(p.id));
const gatePassed = gateExcludedIds.length === 0 && gatePendingIds.size === 0 && unresolvedGateNotes.size === 0 && evidenceSaved;
stage("引文核查", gatePassed ? "passed" : "issues");
record(
  `引文核查：${gateRecs ? `代码尝试解析 ${gateRecs.length} 条标识符与撤稿状态，其中未确认 ${(gateRecs ?? []).filter((r) => r.found === null || (r.found === true && r.status === "unknown")).length} 条，` : ""}核查员抽查 ${citation.checked} 条；` +
    `${gateCorrectedIds.length > 0 ? `${gateCorrectedIds.length} 条转述问题经修正复核通过并保留；` : ""}` +
    `${gateExcludedIds.length === 0 ? "无剔除" : `${gateExcludedIds.length} 条修正后仍未通过或属硬失败，已从证据表剔除（剩余 ${evidence.included.length} 篇）`}` +
    `${gatePendingIds.size > 0 ? `；${gatePendingIds.size} 条保留待确认、禁止引用` : ""}` +
    `${unresolvedGateNotes.size > 0 ? `；另有 ${unresolvedGateNotes.size} 条待确认意见，须人工核对` : ""}`,
);

phase("SAP");
stage("统计计划", "in-progress");
const statistician = agent("Stats·统计方法学家", {
  system:
    "你是生物统计方法学家。先阅读设计书，明确其是否已查看拟用主分析种子的结果；若已查看，SAP必须声明既有结果暴露、归档旧实现与修订依据，不得声称结果盲，也不得靠重写脚本补造事前冻结证据。未见结果时预注册式地制定统计分析计划（SAP）：主要结局与主分析、次要与敏感性分析、效应量指标、α 水平与多重比较校正（Bonferroni/FDR）、缺失数据处理、样本量/效能、前提假设及检验方法、**模型复杂度与过拟合防控**（预注册时必须明确：①参数量与样本量关系——logistic 回归报告 EPV 并遵循 ≥10 惯例、每个调节项/随机效应的 df 支出说明；②随机效应结构的选择依据，禁止事后简化或复杂化搜索；③共线性诊断计划（VIF）；④若需模型比较，预注册 AIC/BIC 使用规则与备选模型集，禁止事后加模型；⑤适用时以交叉验证或训练/验证拆分作为预测性验证的敏感性分析；⑥模拟数据口径须含零假设蒙特卡洛检验 type-I 错误率校准）。心理领域遵循 APA 效应量报告惯例（Cohen's d、η² 等），流行病学报告 RR/OR/HR 及 95% CI。制定SAP时不得主动查看主分析结果；已存在的结果暴露必须如实声明，不得宣称从未查看。另须产出两份供人工校对的内容：①变量字典——每个进入分析的变量给出 名称/操作定义/数据来源列/变换规则/选取理由（含考虑过但排除的候选变量及原因）；②方法依据表——每个分析方法一条选择依据（为何用它、不用什么替代）；③白话层——每个方法与每个变量附一句不使用术语的白话解释（初高中文化程度可懂，可用生活类比但不失真），让非统计背景研究者能读懂「我们在做什么、为什么」。语态遵循 natural-voice 学术子集：直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责。SAP 文首注明：本文件为预注册式内控文档，不等同于注册库预注册；研究需正式预注册时应提交 PROSPERO（系统综述）/OSF（原始研究）等平台并在文中引用注册号。产物呈现遵循 natural-voice Part 5 学术呈现规范：编号章节、编号图表（Table/Figure N）配规范表头与标准图注、Vancouver 参考文献、APA/JARS 统计量格式、正式书面语——禁止零散碎片化与笔记式表达。SAP 按正式预注册文档格式组织（编号章节：目的与设计/结局与变量/主分析/次要与敏感性/复杂度与过拟合防控/质量控制/版本）。把 SAP 写入文件后返回。",
});
const sap = await statistician.ask<StatPlan>(
  `研究问题：${finalRq.question}\n设计与假设：${finalRq.design}；${finalRq.hypotheses.join("；")}\n数据条件：${dataPath ? `真实数据 ${dataPath}` : "模拟数据演示"}\n证据表要点：${JSON.stringify(citableEvidence.slice(0, 8))}\n把 SAP 写入 ${OUT}/03-sap.md；设计阶段若计算样本量、效能或 MC 校准，必须把计算脚本、固定种子、依赖版本、运行命令与汇总输出一并冻结在 ${OUT}/03-sap-code/，在 SAP 中逐值引用路径；不得只留会话临时文件或报告一个无法重算的数字。该目录随审计包交付，后续分析不得覆盖冻结版本。runner须自行创建空输出/缓存目录，能从仅有脚本与依赖定义的干净目录启动；不得依赖预存outputs/。并返回。${langNote}`,
);
stage("统计计划", "passed");
record(`SAP 定稿：主分析 ${sap.primaryAnalysis.split("。")[0]}；校正 ${sap.corrections}`);
if (checkpoints.includes("sap")) {
  log("检查点暂停：SAP 已定稿，等待人工审阅后继续");
  return {
    conclusion: `参与式检查点暂停：预注册式统计计划已定稿（${sap.sapPath}，含变量字典、方法依据与白话层）。请逐条核对三件事：①变量字典中每个变量的【来源列】是否与你数据集的真实列名一致；②变换规则（编码方向、反向计分、界值、标准化）是否符合你的操作意图；③方法依据表的主分析选择。任何一条不符，直接告知修改意见；确认无误后说"继续"。审阅后对助手说"继续"，助手将编辑运行脚本移除本检查点并续跑（已完成步骤零成本导入，从分析执行阶段继续）。`,
    findings: [],
    verified: ["立题经换人评审", `证据表 ${evidence.included.length} 篇经引文核查与状态审计`, "SAP 已定稿（含白话层）"],
    notCovered: ["分析及之后所有阶段待检查点放行后继续"],
  };
}

phase("Analysis");
stage("分析执行", "in-progress");
const analyst = agent("Analyst·数据分析员", {
  system:
    `你是数据分析员。严格按 SAP 执行，不得临时更换主分析（要改须先说明并取得 SAP 一致）。用 uv 管理依赖（先读 ${SKILLS}/uv/SKILL.md），Python 技术栈（pandas/statsmodels/scipy/pingouin 按需）。脚本固定随机种子、可一键重跑；${dataPath ? `使用用户提供的真实数据（${dataPath}）` : "没有真实数据时生成固定种子模拟数据完成整套流水线演示，并在一切输出中显式标注“模拟数据”"}。数据安全铁律（code-to-data）：绝不把原始数据行读入你的上下文——第一步只打印 schema（列名/类型/行数/缺失概况）——优先用「python3 ${SKILLS}/provenance-lab/tools/plab.py schema <数据文件>」（只输出结构与计数、标出疑似直接标识列，不含任何单元格取值），工具不存在时自写等价脚本，此后一切处理都写成脚本执行，只有汇总统计与图表文件回到对话；分析前先检查并剔除或脱敏直接标识列（姓名、证件号、电话、详细地址、精确日期等，日期转为相对或区间），任何输出文件不得包含行级标识符；原始数据文件只读（不修改、不移动、不删除），唯一允许的写入是产物目录 ${OUT}/。编排纪律（token 预算）：读写自己的脚本与日志时只操作增量片段（tail/局部重写，不整文件重读重写）；每个计算单元的结果以摘要行回读（关键统计量+状态），不把大表贴回上下文；重跑决策先查缓存文件存在性与校验和，避免无谓全量重跑。长计算分块（每块目标 ≤10 分钟）：蒙特卡洛等重计算按块执行、每块落盘部分结果，并在 ${OUT}/04-analysis/run-heartbeat.log 追加心跳行（块名+时间+一行状态）供外部监测。报告每个结论的效应量与 95% CI，不只给 p 值。前提假设不满足时按 SAP 的备选方案执行并如实记录；执行中每个方法选择与任何偏离 SAP 的决定都写进 decisions 并给理由（供人工校对）。通俗注释铁律（玻璃箱，白话遵循 natural-voice 的 Part 4 受控白话层：短句/单句单概念/一词一义/祈使句核对动作）：每个主要代码块（数据清洗、建模、每张图表）上方必须有三行注释——【做什么】一句白话（初高中可懂）；【为什么】方法学理由与对应的研究假设/变量；【怎么核对】指出本块输出对应哪个文件哪个数字，供非代码背景研究者逐块人工校对。可移植性铁律：脚本内的文件路径一律相对脚本所在目录（Python 用 Path(__file__).resolve().parent，R 用脚本目录），禁止写死 /Users/、/home/ 等本机绝对路径——产物目录被移动或他人复现时必须仍能一键重跑（真实数据路径作为参数或环境变量传入）。返回结构化结果时，所有路径字段（scriptPath/outputsPath）必须是纯路径（无括号描述、无附加文字），outputsPath必须返回实际输出目录（固定为 ${OUT}/04-analysis），scriptPath返回脚本文件；发布入口文件由编排另行选择，不得把汇总文件当目录。把脚本与输出写入目录后返回。`,
});
const analysis = await analyst.ask<AnalysisResult>(
  `SAP：${JSON.stringify(sap)}\n数据：${dataPath || "无（模拟演示）"}\n输出目录：${OUT}/04-analysis/（脚本、tables/、figures/）。完成后在干净状态下自行重跑一次（先清空缓存与中间产物，或复制到临时目录重跑；脚本须自行创建所需目录，不得依赖手工建好的文件夹），在 04-analysis/CHECKSUMS-analysis.sha256 列出需复现的分析产物相对路径及 SHA-256（不含脚本、日志、虚拟环境与清单自身），确认干净重跑退出码 0 且清单逐项一致。数量只从实际清单统计，不从会话记忆转录；保留清单供代码核对，写进 reproducibility。${langNote}`,
);
// 输出根目录由编排固定；分析员返回的汇总文件不能参与目录拼接或路径扫描。
const analysisDir = `${OUT}/04-analysis`;
analysis.outputsPath = analysisDir;
const entryProbe = await world.run("sh", ["-c", 'for name in README.md summary_report.md; do if test -f "$1/$name"; then printf "%s" "$1/$name"; exit 0; fi; done; exit 1', "sh", analysisDir]);
let analysisEntryPath = entryProbe.exitCode === 0 ? entryProbe.stdout.trim() : `${analysisDir}/README.md`;
if (entryProbe.exitCode !== 0) await writeFile(analysisEntryPath, "# 分析输出\n\n本目录包含分析脚本、表格与图件。冻结清单见 CHECKSUMS-analysis.sha256。请逐项核对。\n");
// 复现关卡：命令在路径修复后执行（含一次修复重试）；后续执行材料变化也使旧记录失效。
let reproFailed = false;
let reproFailureDetail = "";
// 可移植性检查（确定性）：脚本写死本机绝对路径时"一键重跑"只在本机成立，退回分析员改为相对路径
const findAbsPaths = async (): Promise<string[]> => {
  const r = await world.run("sh", ["-c", "grep -rlE '(/Users/|/home/)[A-Za-z0-9_.-]+/' \"$1\" --include='*.py' --include='*.R' --include='*.r' --include='*.sh' --exclude-dir='*venv*' --exclude-dir=site-packages --exclude-dir=node_modules --exclude-dir=renv --exclude-dir=__pycache__ 2>/dev/null || true", "sh", analysis.outputsPath]);
  return r.stdout.split("\n").map((x) => x.trim()).filter((x) => x !== "");
};
let absPathFiles = await findAbsPaths();
if (absPathFiles.length > 0) {
  await analyst.ask(`可移植性检查：以下脚本写死了本机绝对路径，产物目录一移动就无法重跑。请改为相对脚本所在目录（Path(__file__).resolve().parent），改完自行重跑确认退出码 0 且输出不变：\n${absPathFiles.join("\n")}`);
  absPathFiles = await findAbsPaths();
}
if (verifyCommand) {
  const rerun = await world.run("sh", ["-c", verifyCommand]);
  analysis.reproducibility = `${verifyCommand} 重跑退出码 ${rerun.exitCode}${rerun.exitCode === 0 ? "（通过）" : `（失败）：${(rerun.stderr || rerun.stdout).slice(0, 500)}`}`;
  if (rerun.exitCode !== 0) {
    await analyst.ask(`复现关卡失败，请修复脚本后重跑：\n${(rerun.stderr || rerun.stdout).slice(0, 1500)}`);
    const retry = await world.run("sh", ["-c", verifyCommand]);
    reproFailed = retry.exitCode !== 0;
    reproFailureDetail = reproFailed ? (retry.stderr || retry.stdout).slice(0, 500) : "";
    analysis.reproducibility = `修复后重跑退出码 ${retry.exitCode}${reproFailed ? `（仍失败）：${reproFailureDetail}` : "（通过）"}`;
  }
}
// 命令修复重试也可能改脚本，最终再扫描一次，不把新绝对路径漏掉。
absPathFiles = await findAbsPaths();
if (absPathFiles.length > 0) analysis.reproducibility += `；可移植性未通过：${absPathFiles.length} 个脚本仍含本机绝对路径`;
stage("分析执行", reproFailed || absPathFiles.length > 0 ? "issues" : "passed");
record(`分析完成（${analysis.realData ? "真实数据" : "模拟演示"}）：${analysis.keyFindings[0] ?? "无关键发现"}；复现${verifyCommand ? "（命令关卡）" : "（分析员自报，尚未经统一代码复现）"}：${analysis.reproducibility}`);

// 分析验证结束后保存执行材料指纹；后续修订必须重新建立复现证据，不能沿用旧自报。
const commandReproducibility = verifyCommand ? analysis.reproducibility : "";
const sourceBaseline = await plab<PlabSourceSnapshot>(["source-snapshot", "--root", OUT, "--out", `${TOOLS_OUT}/sources-before.json`]);

phase("StatReview");
stage("统计审稿", "in-progress");
const statsReviewer = agent("StatRev·统计审稿人", {
  system:
    "你是期刊统计审稿人。逐项核对：执行与 SAP 是否一致、假设检验是否做了、多重比较是否校正、效应量与 CI 是否完整、缺失数据是否按计划处理、有没有结果驱动的分析切换（p-hacking 迹象）、**过拟合防控核对**（参数量/样本比与 EPV 是否达标、随机效应结构是否与预注册一致、VIF/共线性是否报告、有无 SAP 之外的模型比较或变量增删、交叉验证结果若预定是否执行）、结论是否超出数据支撑。读工作区的脚本与输出核对（不要改文件）；同时核对 SAP 的设计期效能/样本量计算是否附冻结脚本与汇总，缺失时明确列为可复现性缺口。没有问题就明说没有。",
});
const diagnoser = agent("Diag·根因诊断员", {
  system: "你负责诊断反复出现的统计问题根因（方法选择、数据问题或流程缺陷），不改文件，给出证据与最小修复路径。",
});
const statisticalReviewHistory: { raw: Review; effective: Review }[] = [];
const askStatsReview = async (prompt: string): Promise<Review> => {
  const raw = await statsReviewer.ask<Review>(prompt);
  const effective: Review = { ...raw, verdict: raw.majorIssues.length > 0 ? "major-revision" : raw.verdict };
  statisticalReviewHistory.push({ raw, effective });
  await writeFile(`${TOOLS_OUT}/statistical-reviews.json`, JSON.stringify(statisticalReviewHistory, null, 2));
  return effective;
};
let statsReview = await askStatsReview(
  `SAP：${JSON.stringify(sap)}\n分析结果：${JSON.stringify(analysis)}\n请读 ${analysis.scriptPath} 与 ${analysis.outputsPath} 实际核对后给评审意见。`,
);
// 停滞检测：复核时全部主要问题都是上一轮遗留（审稿人自报 persistingFromLastRound），说明修复没触及根因。
// 旧做法比对意见首句是否逐字相同，措辞一变就失效
const stalled = (reviews: Review[]): boolean => {
  const majors = reviews.reduce((n, r) => n + r.majorIssues.length, 0);
  const persisting = reviews.reduce((n, r) => n + (r.persistingFromLastRound ?? 0), 0);
  return persisting > 0 && persisting >= majors;
};
let statsRound = 0;
while (statsReview.majorIssues.length > 0 && statsRound < 2) {
  statsRound += 1;
  if (statsRound > 1 && stalled([statsReview])) {
    const diag = await diagnoser.ask<string>(`统计审稿连续两轮意见相同，修复未触及根因。意见：\n${statsReview.majorIssues.join("\n")}\n请读脚本与输出诊断根因。`);
    Object.assign(analysis, await analyst.ask<AnalysisResult>(`统计审稿停滞。根因诊断：\n${diag}\n请按诊断修复并保持与 SAP 一致（SAP 需要变更时先说明理由）。改动源码或输出须干净重跑、重冻结；返回完整更新后的AnalysisResult（含keyFindings/decisions/reproducibility），不能沿用旧摘要。`));
  } else {
    Object.assign(analysis, await analyst.ask<AnalysisResult>(`统计审稿要求修改（第 ${statsRound} 轮），请逐条处理：\n${statsReview.majorIssues.join("\n")}\n处理时保持与 SAP 一致；改动源码或输出须干净重跑、重冻结。返回完整更新后的AnalysisResult（含keyFindings/decisions/reproducibility），不能沿用旧摘要。`));
  }
  if (verifyCommand) analysis.reproducibility = `${commandReproducibility}；统计返修后的复现说明（分析员自报）：${analysis.reproducibility}`;
  analysis.outputsPath = analysisDir;
  statsReview = await askStatsReview(`修订后请复核（第 ${statsRound + 1} 轮）。本轮更新分析：${JSON.stringify(analysis)}\n前情账本（历史记录，当前以本次文件与复核为准）：\n${priorFacts()}`);
}
stage("统计审稿", statsReview.majorIssues.length === 0 && (statsReview.verdict === "accept" || statsReview.verdict === "minor-revision") ? "passed" : "issues");
record(`统计审稿：${statsReview.verdict}；主要问题 ${statsReview.majorIssues.length} 项，minor 意见 ${statsReview.minorIssues.length} 项尚无逐项关闭复核`);
await writeFile(`${TOOLS_OUT}/analysis-result-final.json`, JSON.stringify(analysis, null, 2));
if (statsRound > 0) record(`统计返修后的当前分析摘要：${analysis.keyFindings.join("；")}（详细记录 analysis-result-final.json，旧阶段摘要不作当前结论）`);

const effectiveFigureJournal = figureStyleJournal || targetJournals || finalRq.journals[0] || "Nature";
let figuresVerified = !figurePolish;
if (figurePolish) {
  phase("Figures");
  stage("图表规范化", "in-progress");
  const artDirector = agent("ArtDir·图表艺术总监", { system: figureSystem(effectiveFigureJournal) });
  const figureGate = agent("VisualQA·视觉复核员", {
    system:
      `你是视觉复核员，验收图表规范化成果：逐张检查 ${effectiveFigureJournal} 规范要点（色盲友好/字号/矢量与分辨率/分面字母/栏宽/无图表垃圾/风格统一/图例自足/坐标轴单位），核对未改动任何数值结果（对照原始输出）。发现问题如实列出；全部达标就明说。不要改文件。`,
  });
  let figureAudit = await artDirector.ask<{ polishedDir: string; auditPath: string; figures: { name: string; changes: string }[] }>(
    `分析图表目录：${analysis.outputsPath}/figures（及 tables 中配图若有）。规范化版本输出到 ${analysis.outputsPath}/figures-polished/，逐图审计表（问题→改动→依据）写入 ${OUT}/09-figure-audit.md。目标期刊：${effectiveFigureJournal}${journalGuideUrl ? `；投稿指南：${journalGuideUrl}` : ""}。${langNote}`,
  );
  let visualCheck = await figureGate.ask<{ passed: boolean; issues: string[] }>(
    `规范化目录：${figureAudit.polishedDir}\n原始图目录：${analysis.outputsPath}/figures\n逐张对照验收（可查看 PNG 图像与脚本），返回结论。`,
  );
  if (!visualCheck.passed && visualCheck.issues.length > 0) {
    figureAudit = await artDirector.ask<{ polishedDir: string; auditPath: string; figures: { name: string; changes: string }[] }>(
      `视觉复核未通过，请逐条整改后更新（不覆盖原图）：\n${visualCheck.issues.join("\n")}\n完成后更新 ${OUT}/09-figure-audit.md。`,
    );
    visualCheck = await figureGate.ask<{ passed: boolean; issues: string[] }>(
      `返工后只复核最终规范化图件（一次，不再循环返工）：${figureAudit.polishedDir}\n原始图目录：${analysis.outputsPath}/figures\n逐项核对上轮问题是否关闭，并复查数值/方法标签/图注与原始输出一致；未实际验证的不能判通过。`,
    );
  }
  stage("图表规范化", visualCheck.passed ? "passed" : "issues");
  figuresVerified = visualCheck.passed;
  record(`图表规范化：${figureAudit.figures.length} 张按 ${effectiveFigureJournal} 规范重绘${visualCheck.passed ? "并复核通过" : "（复核仍有遗留）"}`);
}

phase("Draft");
stage("论文撰写", "in-progress");
const writer = agent("Writer·医学写作者", {
  system:
    `你是医学期刊写作者（STORM 式大纲驱动：先定大纲再成文）。**动笔前先读 ${SKILLS}/natural-voice/SKILL.md 并严格执行其语态规范**：去AI腔/去翻译腔/去伪学术黑话；直陈语气、术语全篇统一、数据句式紧贴解释；局限写成适用边界（scope conditions）而非防御性自贬（报告规范要求如实报告的局限仍报告，但用边界语态）；英文写作遵循 Part 2（封锁 AI 高频词、以证据强度选动词、一段一个动作、统计写法带效应量与 CI）；成稿前过其 Part 3 自检清单。按 ${finalRq.guideline} 规范与 IMRaD 结构撰写：引言（ funnel 逻辑，落点在研究空白）、方法（可复现细节，直接引用 SAP 与脚本）、结果（先总体后分层，每个结论带效应量与 95% CI，指向图表${figurePolish ? "，优先引用 figures-polished/ 规范化版本" : ""}）、讨论（结果解释、与证据表内文献逐条对照、局限、意义）。结构式摘要。引用规则：只允许两类引用——已核查证据表内的文献（带 PMID/DOI，或私有库条目的 "私有库:<文件名>" 标注）或本研究自身结果；绝不引入未核查的新文献，绝不编造引文。文献状态纪律：**绝不把撤稿（retracted）或编辑关注（concern）状态的文献作为证据引用**——如确需提及（如讨论该研究被撤稿的启示），必须显式标注其撤稿状态且不作为结论支撑；带更正/勘误（corrected）的文献可引用但注明"本文引用更正后版本"。${analysis.realData ? "" : "全文用模拟数据演示口径撰写，标题页显式标注。"}标题页与文末还须含**伦理声明**占位：数据来源、是否经伦理委员会批准/豁免（批准号留空由作者填写）、知情同意状态——作者不得删除该节。标题页必须附 AI 使用声明草稿：如实注明本稿件由 AI 辅助生成（文献检索、分析代码、初稿撰写），引用经逐条核查，全部结论需作者人工核验并承担学术责任；具体措辞按目标期刊的 AI 披露政策调整，作者不得删除该声明。产物呈现遵循 natural-voice Part 5 学术呈现规范：编号章节、编号图表（Table/Figure N）配规范表头与标准图注、Vancouver 参考文献、APA/JARS 统计量格式、正式书面语——禁止零散碎片化与笔记式表达。全文 IMRaD 编号章节+结构式摘要+图表编号引用+回应信用 Reviewer N → Comment N.x → Response 逐条编号格式。把初稿写入文件后返回。`,
});
let draft = await writer.ask<DraftResult>(
  `立题书：${JSON.stringify(finalRq)}\n证据表白名单：见 ${evidence.evidencePath}（保留 ${evidence.included.length} 篇记录，其中 ${gatePendingIds.size} 篇待修正复核，逐条从文件读取状态，只允许非待确认项，禁止引用白名单外文献）${gateDeniedIds.length > 0 ? `\n以下条目已剔除或待修正复核，即使保留在证据表记录中也禁止引用：${gateDeniedIds.join("、")}` : ""}\nSAP：见 ${sap.sapPath}（从文件读取变量字典与方法依据）\n分析结果要点：${JSON.stringify({ realData: analysis.realData, keyFindings: analysis.keyFindings, decisions: analysis.decisions, scriptPath: analysis.scriptPath, outputsPath: analysis.outputsPath, reproducibility: verifyCommand ? analysis.reproducibility : "分析员自报（见99-metrics），不得作为代码核验结论或采信自报文件数" })}\n统计审稿遗留问题（写作时注意）：${JSON.stringify(statsReview)}\n目标期刊：${finalRq.journals.join("、")}\n把初稿写入 ${OUT}/06-draft.md 并返回。${langNote}`,
);
stage("论文撰写", "passed");
if (checkpoints.includes("draft")) {
  log("检查点暂停：初稿完成，等待人工审阅后继续");
  return {
    conclusion: `参与式检查点暂停：论文初稿已完成（${draft.draftPath}，含 AI 使用声明与白话注释的分析）。请核对五件事：①标题页 AI 使用声明与伦理声明占位是否在；②引用是否全部来自证据表白名单；③每个结果是否带效应量与 95%CI 并指向编号图表；④局限是否写成适用边界；⑤${OUT}/04-analysis/ 脚本的三行式通俗注释是否可读。任何一条不符直接给修改意见；确认后说"继续"。审阅后对助手说"继续"，助手将编辑运行脚本移除本检查点并续跑（从同行评审阶段继续，已完成步骤零成本导入）。`,
    findings: [],
    verified: ["全流程至初稿完成", `分析脚本含三行式通俗注释（做什么/为什么/怎么核对）`],
    notCovered: ["同行评审、答辩拷问、引文深审、文献归档、审计包待检查点放行后继续"],
  };
}

phase("PeerReview");
stage("同行评审", "in-progress");
const reviewerLenses = fullPanel
  ? [
      { tag: "Methods", focus: "设计、偏倚、规范符合度（对照 " + finalRq.guideline + " 清单）" },
      { tag: "Domain", focus: "新颖性、与既往文献的对照是否到位、结论的领域意义" },
      { tag: "Stats", focus: "报告完整性、效应量与 CI、推断边界" },
    ]
  : [{ tag: "Methods", focus: "设计、偏倚、规范符合度与论证链条" }];
const reviewers = reviewerLenses.map((lens) => ({
  lens,
  agent: agent(`Reviewer·${lens.tag}`, {
    system: `你是期刊同行评审人（${lens.tag}视角：${lens.focus}）。像顶级期刊审稿人一样苛刻但公正：major = 不修不能发表的问题，minor = 建议项。读工作区的初稿与证据表/分析输出后给意见（不要改文件）。没有 major 就明说。`,
  }),
}));
const challenger = agent("Challenger·对抗挑战员", {
  system:
    "你的唯一任务是找出初稿的致命缺陷：夸大结论、数据与文字不符、引用与原文不符、规范硬伤。亲自核对（不要改文件），找到实证才提出，找不到就明说。",
});
let round = 0;
let allReviews: Review[] = [];
let openMajors: string[] = [];
// 一轮评审：各评审人并行 + 对抗挑战（demo/benchmark），返回本轮全部主要问题
const reviewRound = async (ask: string): Promise<string[]> => {
  allReviews = await Promise.all(reviewers.map((r) => r.agent.ask<Review>(ask)));
  const majors = allReviews.flatMap((r) => r.majorIssues);
  if (adversarial) {
    const attack = await challenger.ask<{ found: boolean; issues: string[] }>(`初稿：${draft.draftPath}\n分析输出：${analysis.outputsPath}\n请攻击。找到有实证的致命缺陷则 found=true 并逐条列入 issues；没有则 found=false、issues 为空数组。`);
    if (attack.found) majors.push(...(attack.issues ?? []).map((i) => `[对抗挑战] ${i}`));
  }
  return majors;
};
let revisedSinceReview = false;
while (round < 2) {
  round += 1;
  openMajors = await reviewRound(`初稿：${draft.draftPath}（请直接读文件）\n前情账本：\n${priorFacts()}\n请给评审意见。`);
  revisedSinceReview = false;
  if (openMajors.length === 0) break;
  if (round > 1 && stalled(allReviews)) {
    const diag = await diagnoser.ask<string>(`两轮评审同样的主要问题未解决，修订未触及根因：\n${openMajors.join("\n")}\n请读初稿与相关文件诊断根因。`);
    draft = await writer.ask<DraftResult>(`评审意见两轮未变。根因诊断：\n${diag}\n请按诊断修订初稿（更新 ${OUT}/06-draft.md）并返回。`);
  } else {
    draft = await writer.ask<DraftResult>(
      `同行评审主要问题（第 ${round} 轮），请逐条修订初稿（更新 ${draft.draftPath}）后返回：\n${openMajors.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n次要问题尽量一并处理：${JSON.stringify(allReviews.flatMap((r) => r.minorIssues).slice(0, 8))}`,
    );
  }
  revisedSinceReview = true;
}
// 最后一轮修订后复审一次：遗留数必须反映修订后的稿件，而不是修订前的意见
if (revisedSinceReview) {
  openMajors = await reviewRound(
    `复审：初稿已按第 ${round} 轮意见修订（${draft.draftPath}，请直接读文件）。上轮主要问题：\n${openMajors.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n请逐条核对是否已解决、修订有无引入新的主要问题；未解决的继续列为 major，并给出评审意见。`,
  );
}
let metaSummary = "";
if (fullPanel) {
  const metaReviewer = agent("MetaRev·总评审", {
    system: "你是领域主编/资深编委。综合三位评审人与修订历史，给出最终意见：达到投稿水准与否，以及投稿前必须完成的条目。",
  });
  const meta = await metaReviewer.ask<MetaReview>(`三位评审人最终一轮意见${revisedSinceReview ? "（修订后复审）" : ""}：${JSON.stringify(allReviews)}\n修订轮数：${round}\n最终初稿：${draft.draftPath}\n请给总评审意见。`);
  metaSummary = meta.summary;
  openMajors = meta.decision === "revise" ? [...openMajors, ...meta.required] : openMajors;
}
stage("同行评审", openMajors.length === 0 ? "passed" : "issues");
// Minor 不触发额外返修循环，但未经逐项关闭复核的意见不能在交付中消失。
const pendingReviewNotes = [
  ...(statsReview.minorIssues ?? []).map((s) => `统计审稿：${s}`),
  ...allReviews.flatMap((r) => (r.minorIssues ?? []).map((s) => `同行评审：${s}`)),
];
record(`同行评审（${integrityMode}，${round} 轮${revisedSinceReview ? "+修订后复审" : ""}）：${openMajors.length === 0 ? "无遗留主要问题" : `遗留 ${openMajors.length} 项`}；最近审稿 minor 待关闭复核 ${pendingReviewNotes.length} 项${metaSummary ? `；总评审：${metaSummary.split("。")[0]}` : ""}`);

const reviewContext = {
  citationGate: { unboundNotes: [...unresolvedGateNotes], pendingIds: [...gatePendingIds], excludedIds: gateExcludedIds },
  statistics: statsReview, peers: allReviews, openMajors, pendingReviewNotes,
};
const factsPath = `${TOOLS_OUT}/facts-ledger.md`;
const reviewContextPath = `${TOOLS_OUT}/review-context.json`;
const contextSaved = await writeFile(factsPath, `# 关卡事实记录\n\n以下是截至答辩前的阶段历史，当前状态以评审上下文为准。\n\n${priorFacts()}\n`) &&
  await writeFile(reviewContextPath, JSON.stringify(reviewContext, null, 2));
if (!contextSaved) log("答辩上下文写入失败，后续须按本次传入原文核对并披露文件缺失");
const grillContext = `当前评审与引文待确认意见全文：${JSON.stringify(reviewContext)}\n事实记录：${factsPath}；评审上下文：${reviewContextPath}（写入${contextSaved ? "成功" : "失败"}）。内部原意见已随问题传入，不要因过去只见计数而要求用户补内部材料。`;

phase("Grilling");
stage("Grilling", "in-progress");
const grillCount = fullPanel ? 10 : adversarial ? 8 : 6;
const examiner = agent("Examiner·答辩拷问官", {
  system:
    `你是最苛刻的答辩委员兼审稿人（grill-me 式拷问：不问客套问题，只问"答不好就拒稿"的问题）。针对这项研究提出 ${grillCount} 个最刁钻但公正的问题，直击：因果推断的致命混淆、样本量与效能、**模型复杂度与过拟合**（参数是否相对样本过多、随机效应结构论证、共线性）、测量效度、结果的替代解释、与既有更强证据的冲突、结论外推边界、模拟/演示数据的可迁移性。每个问题标注考点。读初稿与分析输出后再出题。`,
});
const grill = await examiner.ask<GrillQuestion[]>(
  `初稿：${draft.draftPath}\n分析输出：${analysis.outputsPath}\n前情账本：\n${priorFacts()}\n${grillContext}\n请提出 ${grillCount} 个拷问问题。`,
);
const rebuttal = await writer.ask<Rebuttal>(
  `答辩拷问问题清单：${JSON.stringify(grill)}\n${grillContext}\n请逐条作答：能答的用证据表/SAP/分析输出中的真实材料作答（材料必须存在于工作区文件，不得新编）；暴露出稿件真实缺口的，同步修订初稿相应部分；确实答不出的诚实列入 unanswered 并说明缺什么（缺数据/缺实验/缺文献）。回应信语态遵循 ${SKILLS}/natural-voice/SKILL.md：笃定专业、直陈理据、无防御性辩解铺垫。完整问答按预审回应信格式写入 ${OUT}/07-rebuttal.md，返回结构化结果。${langNote}`,
);
stage("Grilling", rebuttal.unanswered.length === 0 ? "passed" : "issues");
record(`答辩拷问：${grill.length} 问，形成 ${rebuttal.answers.length} 条回应${rebuttal.unanswered.length > 0 ? `，${rebuttal.unanswered.length} 问诚实列为待补` : ""}`);

phase("CiteAudit");
stage("引文深审", "in-progress");
const citationAuditor = agent("CiteAudit·引文深审员", {
  system:
    `你是引文深审员，对初稿做引用-原文的深度比对（防引文幻觉与学术不端的最后防线）。先读 ${SKILLS}/literature_search_europepmc/SKILL.md 与 ${SKILLS}/pubmed_database/SKILL.md，按其方法取原文：优先 EuropePMC 开放获取全文（PMC OA 全文接口），取不到全文时用摘要并把 textLevel 设为 abstract（全文=fulltext、私有库本地全文=private、什么都取不到=none）；标注"私有库:<文件名>"的引用直接读用户私有库中的本地 PDF 全文核对（最优先、最完整）。对初稿每一条引用做五件事：①定位：PMID/DOI 落地到真实文献（私有库条目定位到本地文件）；②溯源：判断它是否最原始源文献——若我们的陈述实际源自某原始研究而被综述转引，标 secondary-needs-tracing 并在 note 给出应引的原始文献（PMID/DOI）；③比对：找到原文中支撑我们陈述的具体位置（段落/表/图），逐点判定 supported（原文支持）/overstated（夸大）/misleading（误导性引用）/unsupported（原文不支持）；④必要性：这条引用是否支撑它所在句子的论点——necessary（必要）/redundant（冗余堆砌）/wrong-context（张冠李戴）；⑤状态审计：用 OpenAlex is_retracted 字段、PubMed 出版类型（Retracted Publication/Expression of Concern/Correction）与 Crossref Retraction Watch 开放库（api.labs.crossref.org/retractions）核查撤稿状态，填 retractionStatus——retracted/concern 视为问题引用（除非初稿已显式标注撤稿且不作为证据）。只依据亲眼读到的原文与接口返回下结论；限定语改变暴露、人群或结局且原文不支持时判 unsupported，不能因核心主张成立而把限定语降成可选建议，也不能假定上游读过更完整原文；读不到全文就如实降级到摘要级并标注，状态查不到标 unknown。不改初稿，把逐条明细写入文件后返回。`,
});
const draftCited = await plab<{ references: PlabRef[] }>(["cited", draft.draftPath, "--out", `${TOOLS_OUT}/cited.json`]);
const draftIds = [...new Set((draftCited?.references ?? []).flatMap((r) => r.ids))];
const auditDet = draftIds.length > 0 ? await plab<{ records: PlabRecord[] }>(["resolve", ...draftIds, "--out", `${TOOLS_OUT}/resolve-cited.json`]) : null;
let citationAudit = prepareAudit(await citationAuditor.ask<CitationAuditReport>(
  `初稿：${draft.draftPath}（逐条读其 References 与正文中每个引用点）\n证据表白名单（仅可引用项）：${JSON.stringify(citableEvidence)}${auditDet ? detNoteFor(auditDet.records) : ""}\n把逐条审计明细（含四项判定与建议动作）写入 ${OUT}/05a-citation-audit.md 并返回。`,
), draftCited?.references ?? []);
await writeFile(`${OUT}/tool-records/citation-audit-initial.json`, JSON.stringify(citationAudit, null, 2));
let citationAuditIssues: string[] = [];
let removedAuditEntries: { entry: CitationAuditEntry; note: string }[] = [];
if (citationAudit.problems > 0) {
  log(`引文深审发现 ${citationAudit.problems} 条问题引用，交写作员修正`);
  const problemEntries = citationAudit.entries.filter(auditProblem);
  draft = await writer.ask<DraftResult>(
    `引文深审发现以下问题引用，请逐条处理（换原始源文献/改写陈述使其与原文一致/删除冗余；更新 ${draft.draftPath}；替换后的引用须来自证据表白名单或深审员 note 中给出的原始文献）：\n${JSON.stringify(problemEntries)}`,
  );
  const response = await citationAuditor.ask<CitationAuditRecheck>(
    `修订后只复核以下问题引用点：${JSON.stringify(problemEntries)}\n当前初稿：${draft.draftPath}。按 auditEntryId 逐点返回 updates，每个请求键恰好一次；同文献不同引用点不得合并。原文献身份由代码保留，不随修订稿编号重绑；确实换源须在 citation/resolvedSource 写出新源 PMID/DOI，不能仅改编号。保留首审其余点的逐条明细，不返回“全部通过”等汇总伪条目。改写或换源用 action=updated 并返回完整 entry；亲自确认该引用点已从修订稿删除时才用 action=removed、entry=null，note 写明具体定位依据。不得以少报、遗漏或删除记录代替复核。`,
  );
  await writeFile(`${OUT}/tool-records/citation-audit-recheck.json`, JSON.stringify(response, null, 2));
  const merged = mergeAuditRecheck(citationAudit, response);
  citationAudit = merged.audit;
  citationAuditIssues = merged.issues;
  removedAuditEntries = merged.removed;
}
const auditFinalCited = await plab<{ references: PlabRef[] }>(["cited", draft.draftPath, "--out", `${TOOLS_OUT}/cited-final.json`]);
if (auditFinalCited) citationAuditIssues.push(...missingAuditReferences(auditFinalCited.references, citationAudit.entries, auditDet?.records ?? null).map((s) => `修订稿参考文献 ${s} 缺少逐点深审明细，须补查`));
else citationAuditIssues.push("修订稿引用清单提取未能运行，无法核对深审的文献覆盖范围");
// 结构化明细与 05a 同步落盘，供 L1 评分脚本与审计包确定性引用
await saveAudit(citationAudit, auditDet?.records ?? null, citationAuditIssues, removedAuditEntries);
let citationAuditPassed = citationAudit.problems === 0 && citationAuditIssues.length === 0;
stage("引文深审", citationAuditPassed ? "passed" : "issues");
record(`引文深审：${citationAudit.entries.length} 个引用点账本（溯源/准确性/必要性），${citationAuditPassed ? "账本未报问题（按可得文本层级；无原文项未核验陈述）" : `遗留 ${citationAudit.problems} 个问题点、${citationAuditIssues.length} 项覆盖/复核异常`}`);

phase("FinalCheck");
stage("引文终检", "in-progress");
// S8 引文终检（确定性）：初稿引用 ⊆ 证据表 ∪ SAP 方法学文献 ∪ 深审核验通过的原始文献（减去引文核查剔除的条目）；APA 统计量与 p 值自洽
const auditVerifiedIds = citationAudit.entries
  .filter((e) => e.textLevel !== "none" && e.isPrimary === "primary" && e.accuracy === "supported" && e.necessity === "necessary" && e.retractionStatus !== "retracted" && e.retractionStatus !== "concern")
  .flatMap((e) => idsInText(e.resolvedSource));
const runFinalCheck = async (tag: string): Promise<{ wl: PlabWhitelist | null; sc: PlabStatcheck | null }> => {
  const allowedFile = `${TOOLS_OUT}/allowed-ids${tag}.json`;
  const denyFile = `${TOOLS_OUT}/deny-ids${tag}.json`;
  const filesOk =
    (await writeFile(allowedFile, JSON.stringify([...citableEvidence.map((p) => p.id), ...auditVerifiedIds]))) &&
    (await writeFile(denyFile, JSON.stringify(gateDeniedIds)));
  const wl = filesOk
    ? await plab<PlabWhitelist>(["whitelist", draft.draftPath, "--allowed", allowedFile, "--allowed-from", sap.sapPath, "--deny", denyFile, "--out", `${TOOLS_OUT}/whitelist${tag}.json`])
    : null;
  const sc = await plab<PlabStatcheck>(["statcheck", draft.draftPath, "--out", `${TOOLS_OUT}/statcheck${tag}.json`]);
  return { wl, sc };
};
// 严重度：白名单外引用与显著性判定翻转为 high；仅数值不一致而判定不变的为 medium（可能是工具识别不了的合法口径，
// 如 Wald χ² 取精确 t 分布 p、单侧检验——L-A D37 的 χ²(1) = 3.06, p = .081 即属此类，写作员已在文中注明口径）
interface FinalIssue {
  text: string;
  severity: "high" | "medium";
}
const finalCheckIssues = (fc: { wl: PlabWhitelist | null; sc: PlabStatcheck | null }): FinalIssue[] => [
  ...(fc.wl?.outside ?? []).map((r): FinalIssue => ({ text: `引用不在白名单内：${r.label ? `[${r.label}] ` : ""}${r.text.slice(0, 160)}`, severity: "high" })),
  ...(fc.sc?.results ?? [])
    .filter((r) => !r.consistent)
    .map((r): FinalIssue => ({
      text: `统计报告不自洽：「${r.text}」按统计量与自由度复算双侧 p≈${r.computedP}${r.decisionError ? "（显著性判定随之翻转）" : "（显著性判定不变；若属单侧检验或非标准参考分布等合法口径，需人工确认并在文中注明）"}`,
      severity: r.decisionError ? "high" : "medium",
    })),
];
let finalCheck = await runFinalCheck("");
let finalIssues = finalCheckIssues(finalCheck);
if (finalIssues.length > 0) {
  log(`引文终检发现 ${finalIssues.length} 处问题，交写作员修正`);
  draft = await writer.ask<DraftResult>(
    `引文终检（代码确定性检查）发现以下问题，请逐条处理并更新 ${draft.draftPath}：白名单外的引用删除或换成证据表内文献（确无替代时删去该论断）；统计量与 p 值不自洽的，回到 ${analysis.outputsPath} 核对原始输出后改正，以分析输出为准，绝不为凑一致改动统计量；属于单侧检验等工具识别不了的合法写法时保留原文。\n${finalIssues.map((s, i) => `${i + 1}. ${s.text}`).join("\n")}`,
  );
  finalCheck = await runFinalCheck("-r2");
  finalIssues = finalCheckIssues(finalCheck);
  citationAuditIssues.push("S8 终检后稿件再次修订，先前引文深审未对最终版本重新逐点复核，不能将先前判定视作最终稿已核验");
  citationAuditPassed = false;
  stage("引文深审", "issues");
  await saveAudit(citationAudit, auditDet?.records ?? null, citationAuditIssues, removedAuditEntries);
}
const finalCheckRan = finalCheck.wl !== null || finalCheck.sc !== null;
stage("引文终检", finalCheck.wl !== null && finalCheck.sc !== null && finalCheck.sc.checked > 0 && finalIssues.length === 0 ? "passed" : "issues");
record(
  finalCheckRan
    ? `引文终检（确定性）：${finalCheck.wl ? `${finalCheck.wl.identified}/${finalCheck.wl.references} 条参考文献可核对，白名单外 ${finalCheck.wl.outside.length} 条` : "白名单检查未能运行"}；${finalCheck.sc ? `APA 统计报告 ${finalCheck.sc.checked} 处，不自洽 ${finalCheck.sc.inconsistent} 处` : "统计一致性检查未能运行"}`
    : "引文终检：确定性工具未能运行，白名单终检仅依赖引文深审",
);

// 核对冻结清单的实际文件数/摘要；这只验证当前快照，不冒充独立干净重跑。
const analysisManifest = await plab<PlabManifest>(["manifest", `${OUT}/04-analysis/CHECKSUMS-analysis.sha256`, "--root", `${OUT}/04-analysis`, "--out", `${TOOLS_OUT}/analysis-manifest.json`]);
const manifestFailed = analysisManifest !== null && (analysisManifest.available || analysisManifest.invalid.length > 0) && !analysisManifest.ok;
if (manifestFailed) stage("分析执行", "issues");
record(analysisManifest?.ok ? `分析冻结清单：${analysisManifest.verified}/${analysisManifest.listed} 个列出产物的当前 SHA-256 匹配（非独立重跑；不含未列出文件）` : "分析冻结清单未核验通过，复现自报不能代替代码证据");

phase("Archiving");
stage("文献归档", "in-progress");
// 下载交给确定性工具（PMC Open Access 数据集 + OpenAlex OA 位置，付费墙不绕过）；文献管理员只据其结果写 08 清单
const oaFetch = await plab<PlabOaFetch>(["oa-fetch", "--draft", draft.draftPath, "--dir", `${OUT}/papers`, "--budget", "900", "--out", `${TOOLS_OUT}/papers.json`]);
const librarian = agent("Librarian·文献管理员", {
  system: oaFetch
    ? `你负责文献归档清单。下载已由确定性工具完成，结果在 ${TOOLS_OUT}/papers.json（downloaded：文件名/来源/许可证；notDownloaded：未下载原因与 DOI 链接）。你的任务只有一件：读这个 JSON（不要读任何 PDF，不要再下载，不要写下载脚本），据此写 ${OUT}/08-papers-manifest.md：①已下载清单（文件名 ↔ PMID/DOI ↔ 来源 ↔ 许可证）；②未下载清单——Vancouver 格式（作者. 标题. 期刊. 年;卷(期):页. doi）逐条列出，注明未下载原因与建议获取途径（出版社页面订阅、机构图书馆、文献传递），开头提醒用户自行补齐后放入 papers/；③用户私有库已持有的文献单列"已持有"。作者与卷期页从初稿 References 读取。语态遵循 natural-voice 学术子集：直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责。`
    : `你负责把初稿引用的文献尽量落成本地 PDF 归档。token 纪律（编排优先）：①下载用批量脚本（curl/wget 列表式）执行，绝不把 PDF 内容读入上下文——你的工作是元数据与清单，不是读论文；②每篇只记录 文件名/PMID-DOI/来源/大小 四项；③查 OA 状态用 API 响应字段（EuropePMC isOpenAccess/PDF 链接、Unpaywall 思路），不逐篇浏览原文页；④清单文件一次写成，不反复重写；⑤硬预算：本环节你自己读入上下文的总内容 <5KB——你的全部工作是【写一个批量下载脚本→跑一次→读它的汇总输出表】三步；下载验证只用文件大小（>50KB）与 file 命令的 PDF 类型判定，禁止打开或读取任何 PDF 内容；OA 判定用 EuropePMC 批量查询（单请求多 id）的 isOpenAccess/fullTextUrlList 字段。先读 ${SKILLS}/literature_search_europepmc/SKILL.md 与 ${SKILLS}/pubmed_database/SKILL.md，按其方法查询每篇的开放获取状态（EuropePMC/PubMed Central OA 全文、出版社免费 PDF、预印本 arXiv/bioRxiv/medRxiv）。可合法免费获取的下载保存到 ${OUT}/papers/，文件名规范：标题_期刊_发表年份.pdf（去除文件名非法字符、总长控制在 120 字符内、同名冲突时末尾附 PMID）。付费墙后无合法免费版本的**绝不绕过付费墙**，列入未下载清单。把结果写入 ${OUT}/08-papers-manifest.md：①已下载清单（文件名 ↔ PMID/DOI 对照）；②未下载清单——标准参考文献格式（Vancouver：作者. 标题. 期刊. 年;卷(期):页. doi）逐条列出，每条注明建议获取途径（如"出版社页面订阅获取""机构图书馆/文献传递"），并在开头提醒用户自行下载补齐后放入 papers/ 目录。语态遵循 natural-voice 学术子集：直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责。`,
});
const library = await librarian.ask<PaperLibrary>(
  `初稿引用清单：${draft.draftPath} 的 References（逐条读取）\n引文深审明细（含每条 resolvedSource 与溯源替换后的原始文献）：${citationAudit.auditPath}\n${privatePapers.length > 0 ? `用户私有文献库已持有的文献（这些不需要下载，在 08 清单"已持有"区列出文件路径即可，且不复制进 papers/）：${JSON.stringify(privatePapers)}\n` : ""}下载目录：${OUT}/papers/（自建）\n完成后返回结构化结果。${langNote}`,
);
// 已下载/待获取数以确定性工具结果为准（文献管理员只负责成文）
const papersDownloaded = oaFetch ? oaFetch.downloaded.length : library.downloaded.length;
const papersNotDownloaded = oaFetch ? oaFetch.notDownloaded.length : library.notDownloaded.length;
const unknownLicenses = oaFetch?.downloaded.filter((p) => !p.license).length ?? 0;
const unresolvedEvidence = (gateRecs ?? []).filter((r) => r.found === null || (r.found === true && r.status === "unknown"));
stage("文献归档", "passed");
record(`文献归档：下载 ${papersDownloaded} 篇开放获取 PDF${oaFetch ? "（确定性工具，PMC OA 数据集/OpenAlex OA 位置；许可证未知 ${unknownLicenses} 篇）" : ""}，${papersNotDownloaded} 篇列入待获取清单（08）`);

// 最终产物快照与执行材料状态分别核验；源码没变也不等于独立重跑通过。
const sourceFinal = await plab<PlabSourceSnapshot>(["source-snapshot", "--root", OUT, "--out", `${TOOLS_OUT}/sources-final.json`]);
const sourceAvailable = Boolean(sourceBaseline?.available && sourceFinal?.available && sourceBaseline.issues.length === 0 && sourceFinal.issues.length === 0);
const beforeSources = new Map((sourceBaseline?.files ?? []).map((f) => [f.path, f.sha256]));
const afterSources = new Map((sourceFinal?.files ?? []).map((f) => [f.path, f.sha256]));
const changedSources = sourceAvailable ? [...new Set([...beforeSources.keys(), ...afterSources.keys()])].filter((p) => beforeSources.get(p) !== afterSources.get(p)).sort() : [];
const sourceIntegrity = { available: sourceAvailable, unchanged: sourceAvailable ? changedSources.length === 0 : null, changed: changedSources, issues: [...(sourceBaseline?.issues ?? []), ...(sourceFinal?.issues ?? [])] };
const sourceChanged = sourceAvailable && changedSources.length > 0;
if (sourceChanged) {
  reproFailed = true;
  analysis.reproducibility += `；后续源文件变化（${changedSources.join("、")}），此前复现记录已失效，最终执行材料未经干净重跑确认`;
}
if (sourceIntegrity.unchanged !== true) stage("分析执行", "issues");
record(sourceChanged ? `执行材料发生变化：${changedSources.join("、")}；旧复现记录失效` : sourceAvailable ? "代码快照核对：所列本地分析/SAP执行材料未变（不证明依赖闭包或独立重跑）" : "源文件快照不可用，后续执行材料是否变化未能核验");
const citationTextLevels = { fulltext: citationAudit.entries.filter((e) => e.textLevel === "fulltext").length, private: citationAudit.entries.filter((e) => e.textLevel === "private").length, abstractOnly: citationAudit.entries.filter((e) => e.textLevel === "abstract").length, noText: citationAudit.entries.filter((e) => e.textLevel === "none").length };

phase("AuditPack");
stage("审计包", "in-progress");
const archivist = agent("Archivist·审计整理员", {
  system:
    "你把整个流水线整理成『人工校对包』，目的是让研究者能逐一快速核对、防 AI 幻觉导致学术不端。产出两个文件：\n" +
    `① ${OUT}/00-README.md——目录树 + 每个文件一句话说明 + 三份清单：动了什么（仅 ${OUT}/ 产物）、没动什么（原始数据与数据集文件夹其余内容只读）、去哪找什么；末尾放免责声明（含工具定位声明：工具定位声明：本流水线是科研提效工具，与任何工具一样不保证产出百分之百真实、正确或完整；所有结论、数据、引文与文本必须经用户人工审核，并由具备专业能力的研究者从专业层面取舍与负责；AI 不能替代同行评审、伦理审查与作者的学术责任。）。\n` +
    `② ${OUT}/05-audit-trail.md——六部分：(a) Mermaid flowchart TD 流程图，每个节点标注「做了什么+为何这么做」，关卡节点单独形状；(b) 变量字典表（变量/操作定义/来源列/变换规则/选取理由，取自 SAP 的 variables，逐条照抄不得改写）；(c) 分析方法决策表（方法/选择依据（SAP 的 methodRationale）/执行情况（分析的 decisions）三列对齐）；(d) 引文深审明细表（照抄 05a 文件的逐条判定：溯源/原文位置/准确性/必要性）；(e) 各关卡结论一览（引文核查、统计审稿、同行评审、答辩拷问、引文深审的结论与遗留）；(f) 白话导读：每一部分开头加「通俗导读」框（白话遵循 natural-voice Part 4 受控白话层：短句、单句单概念、一词一义）——用生活类比解释本部分在做什么、为什么、结果意味着什么（初高中可懂、不失真），并为每个关键结论配「亲手验证动作」（打开哪个文件、看哪个数字、和哪里对）；(g) 人工校对指引：建议按什么顺序核对哪些文件、每处核对对应哪个文件哪一节；(h) 免责声明。\n` +
    `${TOOLS_OUT}/ 是确定性工具的机器记录（JSON，部分达数十 KB）：在目录树中列出并各用一句话说明用途即可，关卡结论直接采用本次结构化输入中由代码统计的运行指标，不要通读这些 JSON（token 纪律）。` +
    "所有内容必须取自工作区真实文件与本次结构化输入，禁止添加未发生的事项或美化结论。语态遵循 natural-voice 学术子集：直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责。",
});
// L0 遥测：落盘 99-metrics.json，跨运行汇总成质量基线（与 evaluation/ 评测协议配套）
const metricsPartial = {
  mode,
  integrityMode,
  teamProfile,
  evidenceIncluded: evidence.included.length,
  citationGate: { checked: citation.checked, passed: gatePassed, failures: citationFailures.length, unboundNotes: unresolvedGateNotes.size, corrected: gateCorrectedIds.length, excluded: gateExcludedIds.length, pending: gatePendingIds.size, citable: citableEvidence.length },
  statsReview: { verdict: statsReview.verdict, rounds: statsRound, openMajors: statsReview.majorIssues.length, pendingMinorNotes: statsReview.minorIssues.length },
  peerReview: { rounds: round, openMajors: openMajors.length, pendingMinorNotes: allReviews.reduce((n, r) => n + r.minorIssues.length, 0) },
  grill: { questions: grill.length, unanswered: rebuttal.unanswered.length },
  citationAudit: { entries: citationAudit.entries.length, problems: citationAudit.problems, coverageIssues: citationAuditIssues.length, removed: removedAuditEntries.length },
  papers: { downloaded: papersDownloaded, notDownloaded: papersNotDownloaded },
  deterministic: {
    toolRuns: toolRuns.length,
    toolFailures: toolRuns.filter((t) => !t.ok).length,
    sourcesFailed: failedSources.length,
    sourcesTruncated: truncatedSources.length,
    candidates: { raw: rawCandidates.length, deduped: candidates.length },
    evidenceResolved: gateRecs ? { checked: gateRecs.length, unresolved: unresolvedEvidence.length, notFound: gateRecs.filter((r) => r.found === false).length, retractedOrConcern: gateRecs.filter((r) => r.status === "retracted" || r.status === "concern").length } : null,
    whitelist: finalCheck.wl ? { references: finalCheck.wl.references, identified: finalCheck.wl.identified, outside: finalCheck.wl.outside.length } : null,
    sourceIntegrity,
    analysisManifest: analysisManifest ? { available: analysisManifest.available, listed: analysisManifest.listed, verified: analysisManifest.verified, ok: analysisManifest.ok } : null,
    statcheck: finalCheck.sc ? { checked: finalCheck.sc.checked, inconsistent: finalCheck.sc.inconsistent, decisionErrors: finalCheck.sc.decisionErrors } : null,
  },
};
const auditPack = await archivist.ask<AuditPack>(
  `立题：${JSON.stringify({ question: finalRq.question, design: finalRq.design, guideline: finalRq.guideline })}\nSAP（含变量字典与方法依据）：${JSON.stringify(sap)}\n分析（含执行决定）：${JSON.stringify({ realData: analysis.realData, keyFindings: analysis.keyFindings, decisions: analysis.decisions, reproducibility: verifyCommand ? analysis.reproducibility : "分析员自报（见99-metrics），不得作为代码核验结论或采信自报文件数" })}\n关卡结论：引文核查 ${gatePassed ? `通过${gateCorrectedIds.length > 0 ? `（${gateCorrectedIds.length} 条转述问题经修正复核保留）` : ""}` : `剔除 ${gateExcludedIds.length} 条：${citationFailures.join("；")}`}；统计审稿 ${statsReview.verdict}；同行评审 ${round} 轮遗留 ${openMajors.length} 项；答辩拷问 ${rebuttal.unanswered.length} 问待补；引文深审 ${citationAudit.entries.length} 条遗留 ${citationAudit.problems} 条（明细文件 ${citationAudit.auditPath}，逐条照抄进 (d)）\n待关闭审稿意见（不能用 major=0 宣称全清）：${JSON.stringify(pendingReviewNotes)}\n其他验收边界：${JSON.stringify({ unboundCitationNotes: [...unresolvedGateNotes], pendingCitationIds: [...gatePendingIds], figuresVerified, reproFailed, nonPortableFiles: absPathFiles, unresolvedIdentifiers: unresolvedEvidence.map((r) => r.id), unknownPdfLicenses: unknownLicenses, citationAuditIssues, citationTextLevels, sourceIntegrity, analysisManifest: metricsPartial.deterministic.analysisManifest, statcheck: metricsPartial.deterministic.statcheck, finalCheckIssues: finalIssues })}；statcheck.checked=0 是未覆盖，不是通过；未确认标识符不得称代码核验通过；图表 figuresVerified=false 不得写验收通过；复现产物数量只用 analysisManifest.listed/verified，null或不可用时写未核验，当前清单匹配不等于独立重跑；sourceIntegrity显示执行材料变化时旧复现记录已失效，不得写成最终版本已复现；摘要级只比对摘要，noText仅查题录，不能称所有引用亲见原文。剔除原因须区分确定性硬失败与转述修正后仍失败，不能统称硬失败。\n产物路径：立题书/证据表/SAP/分析输出/初稿/回应信/引文深审明细/文献 PDF（papers/）/文献归档清单（08）均在 ${OUT}/ 下（逐个 ls 核实后写进 README 目录树）；运行指标（99-metrics.json 由流水线代码落盘，你不要写该文件；关卡结论一览可引用这些数字）：${JSON.stringify(metricsPartial)}\n产物呈现遵循 natural-voice Part 5 学术呈现规范：编号章节、编号图表（Table/Figure N）配规范表头与标准图注、Vancouver 参考文献、APA/JARS 统计量格式、正式书面语——禁止零散碎片化与笔记式表达。00/05 按编号章节与表格化清单组织。请写出两个文件并返回。${langNote}`,
);
stage("审计包", "passed");
record(`审计包就绪：${auditPack.manifestPath} 与 ${auditPack.auditPath}`);

phase("Delivery");
stage("终检交付", contextSaved && failedSources.length === 0 && candidates.length > 0 && gatePassed && citationAuditPassed && openMajors.length === 0 && pendingReviewNotes.length === 0 && rebuttal.unanswered.length === 0 && figuresVerified && !reproFailed && sourceIntegrity.unchanged === true && !manifestFailed && absPathFiles.length === 0 && (statsReview.verdict === "accept" || statsReview.verdict === "minor-revision") && statsReview.majorIssues.length === 0 && finalCheck.wl !== null && finalCheck.sc !== null && finalCheck.sc.checked > 0 && finalIssues.length === 0 ? "passed" : "issues");
const scribe = agent("Scribe·报告撰写", {
  system: `你把整个科研流水线的过程与产物汇总成给研究者看的 Markdown 总结：立题、证据、SAP、分析发现、评审轮次与遗留、投稿前建议。只写有依据的内容，明确区分已验证与未验证。总结开头固定附工具定位声明：工具定位声明：本流水线是科研提效工具，与任何工具一样不保证产出百分之百真实、正确或完整；所有结论、数据、引文与文本必须经用户人工审核，并由具备专业能力的研究者从专业层面取舍与负责；AI 不能替代同行评审、伦理审查与作者的学术责任。语态遵循 ${SKILLS}/natural-voice/SKILL.md：直陈、具体、无AI腔与套话。`,
  ...(teamProfile === "quality" ? {} : lightTier),
});
const summaryMd = await scribe.ask<string>(
  `直接返回 Markdown 文本。${langNote}立题：${JSON.stringify(finalRq)}\n证据：纳入 ${evidence.included.length} 篇\nSAP 路径：${sap.sapPath}\n分析：${JSON.stringify(analysis.keyFindings)}（${analysis.realData ? "真实数据" : "模拟演示"}）\n统计审稿：${statsReview.verdict}\n同行评审 ${round} 轮，遗留 ${openMajors.length} 项\n引文深审：${citationAudit.entries.length} 条账本记录（溯源/准确性/必要性），${citationAuditPassed ? "账本未报问题（按可得文本层级；无原文项未核验陈述）" : `遗留 ${citationAudit.problems} 个问题点、${citationAuditIssues.length} 项覆盖/复核异常`}\n待关闭审稿意见（不能用 major=0 宣称全清）：${JSON.stringify(pendingReviewNotes)}\n其他验收边界：${JSON.stringify({ unboundCitationNotes: [...unresolvedGateNotes], pendingCitationIds: [...gatePendingIds], figuresVerified, reproFailed, nonPortableFiles: absPathFiles, unresolvedIdentifiers: unresolvedEvidence.map((r) => r.id), unknownPdfLicenses: unknownLicenses, citationAuditIssues, citationTextLevels, sourceIntegrity, analysisManifest: metricsPartial.deterministic.analysisManifest, statcheck: metricsPartial.deterministic.statcheck, finalCheckIssues: finalIssues })}；statcheck.checked=0 是未覆盖，不是通过；未确认标识符不得称代码核验通过；图表 figuresVerified=false 不得写验收通过；复现产物数量只用 analysisManifest.listed/verified，null或不可用时写未核验，当前清单匹配不等于独立重跑；sourceIntegrity显示执行材料变化时旧复现记录已失效，不得写成最终版本已复现；摘要级只比对摘要，noText仅查题录，不能称所有引用亲见原文。剔除原因须区分确定性硬失败与转述修正后仍失败，不能统称硬失败。\n前情账本：\n${priorFacts()}`,
);
await artifact.markdown("summary", summaryMd, { title: "科研流水线总结" });
await artifact.file("draft", draft.draftPath, { title: "论文初稿", description: `按 ${finalRq.guideline} 规范撰写的 IMRaD 初稿`, primary: true });
await artifact.file("evidence", evidence.evidencePath, { title: "证据表" });
await artifact.file("sap", sap.sapPath, { title: "统计分析计划（预注册式）" });
await artifact.file("outputs", analysisEntryPath, { title: "分析脚本与输出（入口说明）" });
await artifact.file("rebuttal", rebuttal.rebuttalPath, { title: "答辩拷问与预审回应信" });
await artifact.file("audit", auditPack.auditPath, { title: "审计追踪与人工校对包", description: "Mermaid 流程图、变量字典、方法决策表、关卡结论与免责声明" });
await artifact.file("manifest", auditPack.manifestPath, { title: "产出清单（动了啥/没动啥/在哪）" });
await artifact.file("papers", library.manifestPath, { title: "文献归档清单", description: `已下载 ${papersDownloaded} 篇 OA PDF；${papersNotDownloaded} 篇待获取（Vancouver 格式清单）` });

const findings: WorkflowReport["findings"] = [];
for (const issue of finalIssues) findings.push({ what: `引文终检遗留：${issue.text.slice(0, 80)}`, evidence: issue.text, severity: issue.severity, status: issue.severity === "high" ? "verified" : "unconfirmed" });
for (const f of citationFailures) findings.push({ what: `引文核查失败项：${f.split("\n")[0]}`, evidence: f, severity: "medium", status: "verified" });
for (const f of unresolvedGateNotes) if (!citationFailures.includes(f)) findings.push({ what: "引文核查待确认（未绑定意见或末轮新问题）", evidence: f, severity: "medium", status: "unconfirmed" });
for (const m of statsReview.majorIssues) findings.push({ what: "统计审稿遗留主要问题（尚无关闭复核）", evidence: m, severity: "medium", status: "unconfirmed" });
for (const m of openMajors) findings.push({ what: `评审遗留主要问题：${m.split("。")[0]}`, evidence: m, severity: "high", status: "verified" });
for (const m of pendingReviewNotes) findings.push({ what: "审稿 minor 意见尚无逐项关闭复核", evidence: m, severity: "medium", status: "unconfirmed" });
for (const u of rebuttal.unanswered) findings.push({ what: `答辩拷问未答出：${u.split("\n")[0]}`, evidence: u, severity: "medium", status: "verified" });
for (const s of citationAuditIssues) findings.push({ what: "引文深审覆盖/复核异常", evidence: s, severity: "medium", status: "unconfirmed" });
for (const e of citationAudit.entries) {
  if (e.isPrimary !== "primary" || e.accuracy !== "supported" || e.necessity !== "necessary" || e.retractionStatus === "retracted" || e.retractionStatus === "concern") {
    findings.push({ what: `引文深审问题：${e.citation.split("\n")[0]}`, evidence: `${e.note}（定位：${e.resolvedSource}；判定：${e.isPrimary}/${e.accuracy}/${e.necessity}）`, severity: "high", status: "verified" });
  }
}
if (manifestFailed) findings.push({ what: "分析冻结清单未通过", evidence: JSON.stringify(analysisManifest), severity: "high", status: "verified" });
if (sourceChanged) findings.push({ what: "执行材料变化使先前复现记录失效", evidence: changedSources.join("、"), severity: "high", status: "verified" });
if (reproFailed && reproFailureDetail) findings.push({ what: "复现关卡未通过：verifyCommand 修复重试后仍失败", evidence: `${verifyCommand}：${reproFailureDetail}`, severity: "high", status: "verified" });
if (!analysis.realData) findings.push({ what: "分析基于固定种子模拟数据，非真实数据", evidence: "启动时未提供 dataPath，全流程按演示口径执行并已在初稿标注", severity: "medium", status: "verified" });
const verified: string[] = [
  `立题经方法学评审${rqCritique.hasBlockingIssues ? "并修订" : "一次通过"}`,
  gateRecs
    ? `证据表 ${evidence.included.length} 篇：标识符与撤稿/关注/更正状态由代码逐条解析（PubMed 出版类型与更正记录、Crossref updated-by、OpenAlex is_retracted；尝试 ${gateRecs.length} 条，未解析/状态未知 ${unresolvedEvidence.length} 条须回落核查），核查员抽查 ${citation.checked} 条做题录与发现-摘要比对`
    : `证据表 ${evidence.included.length} 篇经引文核查与撤稿状态审计（OpenAlex/PubMed 出版类型/Retraction Watch；抽查 ${citation.checked} 条）`,
  `统计审稿结论：${statsReview.verdict}`,
  `同行评审模拟 ${round} 轮（${integrityMode} 模式${adversarial ? "，含对抗挑战" : ""}${fullPanel ? "与总评审" : ""}）`,
  `答辩拷问 ${grill.length} 问（回应 ${rebuttal.answers.length} 条，待补 ${rebuttal.unanswered.length}）`,
  ...(figurePolish && figuresVerified ? [`图表按 ${effectiveFigureJournal} 规范审计重绘并经视觉复核（09-figure-audit.md）`] : []),
  `引文深审：${citationAudit.entries.length} 条账本记录（全文/私有全文 ${citationTextLevels.fulltext + citationTextLevels.private}，仅摘要 ${citationTextLevels.abstractOnly}，无原文仅题录 ${citationTextLevels.noText}），${citationAuditPassed ? "账本未报问题（按可得文本层级；无原文项未核验陈述）" : `遗留 ${citationAudit.problems} 个问题点、${citationAuditIssues.length} 项覆盖/复核异常`}`,
  ...(verifyCommand && !reproFailed && sourceIntegrity.unchanged === true ? [`分析复现：${analysis.reproducibility}`] : []),
  ...(analysisManifest?.ok ? [`分析冻结清单：代码核对 ${analysisManifest.verified}/${analysisManifest.listed} 个列出产物的当前 SHA-256 全部匹配；不含未列出文件，不等同于独立重跑`] : []),
  ...(finalCheck.wl ? [`引文终检（代码）：${finalCheck.wl.identified} 条带标识符的参考文献全部核对白名单，${finalCheck.wl.outside.length === 0 ? "无白名单外引用" : `白名单外 ${finalCheck.wl.outside.length} 条见 findings`}`] : []),
  ...(finalCheck.sc && finalCheck.sc.checked > 0 ? [`统计报告一致性（代码复算）：${finalCheck.sc.checked} 处 APA 格式检验结果，${finalCheck.sc.inconsistent === 0 ? "全部自洽" : `${finalCheck.sc.inconsistent} 处不自洽见 findings`}`] : []),
];
const notCovered: string[] = [];
if (statsReview.majorIssues.length > 0) notCovered.push(`统计审稿仍有 ${statsReview.majorIssues.length} 项主要问题未经复核关闭（最多两轮修正），不得因verdict标签视为通过；详见 statistical-reviews.json`);
if (!contextSaved) notCovered.push("答辩前事实记录或评审上下文文件写入失败；意见原文虽已随问题传入，持久化记录仍须人工核对");
if (unresolvedGateNotes.size > 0) notCovered.push(`${unresolvedGateNotes.size} 条引文核查意见未能绑定或尚未完成修正复核；待确认ID：${[...gatePendingIds].join("、") || "详见意见"}，未自动剔除或宣称修正；详见 findings，须人工核对`);
if (pendingReviewNotes.length > 0) notCovered.push(`${pendingReviewNotes.length} 条最近审稿 minor 意见尚无逐项关闭复核（可能已在后续成文中处理），不能以 major=0 宣称全部清零；详见 findings`);
if (figurePolish && !figuresVerified) notCovered.push("图表视觉验收未通过（包含一次返工后的复核机会）；最终仍有遗留或未完成验证，不能宣称最终图件已验收通过，详见 09-figure-audit.md");
if (truncatedSources.length > 0) notCovered.push(`检索源因限流或请求预算提前结束：${truncatedSources.join("、")}；这些来源的候选可能不完整，可在限流解除后补检`);
if (failedSources.length > 0) notCovered.push(`检索源失败已降级跳过：${failedSources.join("、")}；证据表未覆盖这些来源，可单独补检`);
if (!finalCheckRan) notCovered.push("确定性引文终检未能运行（tools/plab.py 缺失或失败），初稿引用 ⊆ 白名单与统计报告一致性未经代码核对，投稿前须人工逐条核对");
else if (finalCheck.wl === null) notCovered.push("引文白名单终检未能运行（统计一致性检查已运行），初稿引用 ⊆ 白名单未经代码核对，投稿前须人工逐条核对");
else if (finalCheck.sc === null) notCovered.push("统计报告一致性检查未能运行（白名单终检已运行），初稿中统计量与 p 值是否自洽未经代码复算");
if (finalCheck.sc && finalCheck.sc.checked === 0) notCovered.push("统计终检未匹配到可复算的完整 APA 报告（checked=0），不能视为一致性通过；表格分列、缺失统计量/自由度等写法须人工核对，禁止补造数值以迎合解析器");
if (finalCheck.wl && finalCheck.wl.unidentified.length > 0) notCovered.push(`${finalCheck.wl.unidentified.length} 条参考文献无 PMID/DOI（多为专著与经典方法学文献），终检无法核对其是否在白名单内，须人工确认`);
if (!analysis.realData) notCovered.push("未运行真实数据分析（未提供 dataPath）；提供后可从统计计划阶段重跑");
if (!analysisManifest?.available) notCovered.push("分析冻结清单不可用，产物数量与 SHA-256 未经代码核对，不能采信分析员自报数量");
if (manifestFailed) notCovered.push("分析冻结清单含缺失、摘要不符或非法条目，见 tool-records/analysis-manifest.json；独立复现尚未闭合");
if (!verifyCommand) notCovered.push("复现性由分析员自报重跑退出码，未经脚本统一关卡");
if (absPathFiles.length > 0) notCovered.push(`${absPathFiles.length} 个分析脚本仍写死本机绝对路径（${absPathFiles.join("、")}），换机器或移动目录后须先改路径才能重跑`);
if (sourceChanged) notCovered.push(`分析/SAP源文件在先前验证后发生变化（${changedSources.join("、")}），旧复现记录失效，最终执行材料未干净重跑；当前产物清单匹配不能替代此项`);
if (!sourceAvailable) notCovered.push("源文件快照不可用，本地执行材料的后续变化未经代码核验，不能断言最终源码仍与先前复现记录对应");
if (reproFailed && reproFailureDetail) notCovered.push(`复现关卡未通过（${verifyCommand} 修复重试后仍失败），分析结果在修复前不可作为结论依据`);
if (citationAuditIssues.length > 0) notCovered.push(`引文深审 ${citationAuditIssues.length} 项覆盖/复核异常（详见 05a），全量核验尚未闭合：${citationAuditIssues.join("；")}`);
if (citationAudit.problems > 0) notCovered.push(`引文深审遗留 ${citationAudit.problems} 条问题引用（详见 05a 明细），投稿前需人工复核`);
const abstractOnlyCount = citationAudit.entries.filter((e) => e.textLevel === "abstract").length;
if (abstractOnlyCount > 0) notCovered.push(`引文深审中 ${abstractOnlyCount} 条仅完成摘要级比对（无开放获取全文，正文级夸大无法排除），投稿前建议人工复核原文`);
// 未取到任何原文的引用：判定只依据题录身份，陈述与原文是否相符未经比对，不能算作已核验
const noTextCount = citationAudit.entries.filter((e) => e.textLevel === "none").length;
if (noTextCount > 0) notCovered.push(`引文深审中 ${noTextCount} 条未取到任何原文（摘要与全文均无），仅核对了题录身份，陈述与原文是否相符未经比对，投稿前须人工取原文复核`);
for (const u of rebuttal.unanswered) notCovered.push(`答辩拷问待补项：${u.split("\n")[0]}`);
if (papersNotDownloaded > 0) notCovered.push(`${papersNotDownloaded} 篇引用未下载，原因可能为付费墙、接口/网络失败或预算耗尽；逐条原因与获取途径见 08 清单${oaFetch ? `及 ${TOOLS_OUT}/papers.json` : ""}，请合法补齐后放入 ${OUT}/papers/`);
if (unknownLicenses > 0) notCovered.push(`${unknownLicenses} 篇已下载 PDF 的许可证未知（见 08 清单），下载成功不代表获准再分发`);
if (unresolvedEvidence.length > 0) notCovered.push(`${unresolvedEvidence.length} 条证据的标识符未由代码解析或状态未知（${unresolvedEvidence.map((r) => r.id).join("、")}），仅回落 agent 核查，不能计为确定性核验通过`);
const shortTopic = [...finalRq.question].slice(0, 60).join("");
const runMetrics = {
  ...metricsPartial,
  citationAudit: { ...metricsPartial.citationAudit, abstractOnly: abstractOnlyCount, noText: noTextCount },
  reproducibility: verifyCommand ? analysis.reproducibility : `分析员自报（非代码复现结论）：${analysis.reproducibility}`,
  reproFailed,
  realData: analysis.realData,
  findingsTotal: findings.length,
  notCoveredTotal: notCovered.length,
};
// L0 遥测由代码落盘（不经 LLM 转写），文件内容与返回的 metrics 字段逐字一致
const metricsWrite = await world.run("sh", ["-c", 'mkdir -p "$1" && printf "%s\\n" "$2" > "$1/99-metrics.json"', "sh", OUT, JSON.stringify(runMetrics, null, 2)]);
if (metricsWrite.exitCode !== 0) log(`99-metrics.json 落盘失败（退出码 ${metricsWrite.exitCode}）：${(metricsWrite.stderr || metricsWrite.stdout).slice(0, 300)}`);
return {
  metrics: runMetrics,
  conclusion: `「${shortTopic}」完成科研流水线：立题通过评审，纳入 ${evidence.included.length} 篇证据，分析${analysis.realData ? "基于真实数据" : "为模拟演示"}，统计审稿 ${statsReview.verdict}，同行评审 ${round} 轮、答辩拷问 ${grill.length} 问、引文深审 ${citationAudit.entries.length} 条后${openMajors.length === 0 && statsReview.majorIssues.length === 0 && pendingReviewNotes.length === 0 && rebuttal.unanswered.length === 0 && citationAuditPassed && gatePassed && !reproFailed && sourceIntegrity.unchanged === true && figuresVerified ? "无上述环节遗留问题" : `遗留 ${openMajors.length + statsReview.majorIssues.length + pendingReviewNotes.length + rebuttal.unanswered.length + citationAudit.problems + citationAuditIssues.length + (gatePassed ? 0 : 1) + (reproFailed || sourceIntegrity.unchanged !== true ? 1 : 0) + (figuresVerified ? 0 : 1)} 项（含待关闭复核意见与复现/图表边界）`}。初稿、回应信、审计包与全部中间产物已交付。`,
  findings,
  verified,
  notCovered,
};
