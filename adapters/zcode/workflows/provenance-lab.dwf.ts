/* zcode-workflow
description: ProvenanceLab 溯源科研流水线（学术呈现规范版）：全部正式交付物强制编号章节、编号图表配规范表头图注、Vancouver
  文献、APA/JARS 统计量格式、结构式摘要、正式书面语（禁零散碎片化）；含过拟合防控六项、L0 遥测、L1
  植错集、玻璃箱三件套、受控白话层、文献状态硬关卡、六独立服务模式、多语言。
args:
  checkpoints:
    type: string
    description: 【可选，玻璃箱】参与式检查点："sap" / "sap,draft"
    required: false
    default: ""
  dataPath:
    type: string
    description: 【可选】数据集路径
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
    description: clinical / epidemiology / psychology / auto
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
    description: 【可选】交付语言
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
  /** 学科领域判定：clinical / epidemiology / psychology（决定后续检索源路由）。 */
  field: "clinical" | "epidemiology" | "psychology";
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
  /** 被查引用：引文标记（编号/PMID/DOI）+ 所在章节与它支撑的论点一句话。 */
  citation: string;
  /** 实际定位到的源文献（PMID/DOI）与核对依据的文本层级（全文/仅摘要）。 */
  resolvedSource: string;
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
  title: "科研流水线进展",
  key: "stage",
  status: "status",
  columns: ["进行中", "通过", "有遗留"],
  cardTitle: "stage",
});

const SKILLS = "~/.zcode/skills";

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
const FIGURE_SYSTEM =
  `你是图表艺术总监，按目标期刊（${styleTarget}）的视觉规范审计并重绘科研图表。规范要点（Nature/Cell 系通用）：色盲友好配色（Okabe-Ito / viridis）；无衬线字体（Arial/Helvetica，成稿图内文字按印刷比例不小于 5-7pt）；矢量优先（PDF/SVG）另存 ≥300-600dpi 位图备份；分面字母规范（Nature 粗体小写 a,b,c；Cell 粗体大写 A,B,C；其他期刊以其指南为准）；版面宽度按期刊栏宽（Nature 单栏 89mm / 双栏 183mm）；去图表垃圾（无底纹网格/3D/多余边框/装饰渐变）；面板间配色字体线型统一；图例自足；坐标轴带单位。${journalGuideUrl ? `先读取该期刊投稿指南并以其为准：${journalGuideUrl}。` : ""}工作方式：逐图审计（问题清单）→重写/新增绘图代码（matplotlib/seaborn 统一 rcParams 样式）→输出规范化图件与逐图审计表（问题→改动→依据）。绝不改动分析结果数值，只改呈现；原图保留不覆盖，规范化版本输出到独立目录。`;

if (mode !== "pipeline") {
  if (mode === "figure-polish") {
    const figDir = figuresDirArg || `${OUT}/04-analysis/figures`;
    phase("独立服务：图表美观审计与规范化");
    const artDirector = agent("独立-图表艺术总监", { system: FIGURE_SYSTEM });
    const polished = await artDirector.ask<{ polishedDir: string; auditPath: string; figures: { name: string; changes: string }[] }>(
      `图表目录：${figDir}（逐个查看 PNG，读绘图脚本若有）。规范化版本输出到 ${figDir}-polished/，逐图审计表写入 ${OUT}/09-figure-audit.md。${langNote}`,
    );
    stage("图表规范化", "通过");
    return {
      conclusion: `图表规范化完成：${polished.figures.length} 张图按 ${styleTarget} 规范重绘，审计表见 ${OUT}/09-figure-audit.md。`,
      findings: polished.figures.map((f) => ({ what: `图 ${f.name}：${f.changes.split("\n")[0]}`, evidence: f.changes, severity: "low", status: "verified" })),
      verified: [`逐图对照 ${styleTarget} 规范审计并重绘（原图保留）`],
      notCovered: journalGuideUrl ? [] : ["未提供期刊指南链接，按 Nature/Cell 系通用规范执行"],
    };
  }
  if (mode === "citation-audit") {
    if (!draftPathArg) throw new Error("citation-audit 模式需要 draftPath 参数（待审稿件路径）");
    phase("独立服务：引文深度比对校验");
    const citationAuditor = agent("独立-引文深审员", {
      system:
        `你是引文深审员，对稿件做引用-原文的深度比对（溯源/原文位置/准确性/必要性/撤稿状态五维，含最原始源文献回溯）。先读 ${SKILLS}/literature_search_europepmc/SKILL.md 与 ${SKILLS}/pubmed_database/SKILL.md 取原文：优先 EuropePMC 开放获取全文，取不到降级摘要并标注；用户私有库（若提供 privateLibraryPath）的条目最优先读本地 PDF。状态审计：OpenAlex is_retracted / PubMed 出版类型 / Crossref Retraction Watch 开放库核查撤稿与编辑关注。只依据亲眼读到的原文下结论，不改稿件。`,
    });
    const audit = await citationAuditor.ask<CitationAuditReport>(
      `稿件：${draftPathArg}（逐条读 References 与正文引用点）${privateLibraryPathArg ? `\n私有文献库：${privateLibraryPathArg}` : ""}\n逐条明细写入 ${OUT}/05a-citation-audit.md 并返回。${langNote}`,
    );
    return {
      conclusion: `引文深审完成：${audit.entries.length} 条逐条比对，${audit.problems === 0 ? "全部通过" : `发现 ${audit.problems} 条问题（见明细）`}。明细：${audit.auditPath}`,
      findings: audit.entries.filter((e) => e.isPrimary !== "primary" || e.accuracy !== "supported" || e.necessity !== "necessary" || e.retractionStatus === "retracted" || e.retractionStatus === "concern").map((e) => ({ what: `引文问题：${e.citation.split("\n")[0]}`, evidence: `${e.note}（${e.isPrimary}/${e.accuracy}/${e.necessity}/${e.retractionStatus}）`, severity: "high", status: "verified" })),
      verified: [`${audit.entries.length} 条引用完成溯源/原文比对/必要性校验`],
      notCovered: [],
    };
  }
  if (mode === "review") {
    if (!draftPathArg) throw new Error("review 模式需要 draftPath 参数（待审稿件路径）");
    phase("独立服务：同行评审模拟");
    const lenses = fullPanel
      ? [{ tag: "方法学", focus: "设计、偏倚、规范符合度" }, { tag: "领域专家", focus: "新颖性与文献对照" }, { tag: "统计", focus: "报告完整性与推断边界" }]
      : [{ tag: "方法学", focus: "设计、偏倚、规范符合度与论证链条" }];
    const reviews = await Promise.all(
      lenses.map((lens) => agent(`评审人-${lens.tag}`, { system: `你是期刊同行评审人（${lens.tag}视角：${lens.focus}）。苛刻但公正：major=不修不能发表，minor=建议项；读稿件与同目录支撑材料后给意见（不要改文件）。${langNote}` }).ask<Review>(`稿件：${draftPathArg}\n请给评审意见。`)),
    );
    let majors = reviews.flatMap((r) => r.majorIssues);
    if (adversarial) {
      const challenger = agent("独立-对抗挑战员", { system: "你的唯一任务是找出稿件的致命缺陷：夸大结论、数据与文字不符、引用与原文不符。亲自核对（不要改文件），找到实证才提出，找不到就明说。" });
      const attack = await challenger.ask<string>(`稿件：${draftPathArg}\n请攻击。没有则回答"未找到"。${langNote}`);
      if (attack.trim().length > 0 && attack.trim() !== "未找到") majors.push(`[对抗挑战] ${attack}`);
    }
    const scribe2 = agent("评审汇总", { system: "你把多位评审人的意见汇总成一份给作者的评审报告（major/minor 分组、逐条可执行）。只写有依据的内容。", ...(teamProfile === "quality" ? {} : lightTier) });
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
    phase("独立服务：第三方分析产物交叉校验");
    stage("交叉校验", "进行中");
    const reproducer = agent("复现检验员", {
      system:
        `你负责独立复现第三方 agent 产出的分析。先勘察 ${externalDirArg}（目录结构、脚本、输出、README），登记产物清单；然后逐个原样重跑其分析脚本（不改逻辑；环境用 uv 按需装依赖，临时环境自行搭建），记录每个脚本的退出码、关键输出要点与是否可复现；脚本不可运行或缺依赖时如实记录原因。第三方目录全程只读，绝不修改其中任何文件。${langNote}`,
    });
    const repro = await reproducer.ask<{ inventory: string; reproduction: { item: string; result: string }[] }>(
      `第三方产物目录：${externalDirArg}\n完成勘察与逐项复现后返回清单与结果。`,
    );
    const recomputer = agent("独立重算员", {
      system:
        `你是独立重算员，对第三方报告的数字做交叉验证，不信任任何已有结论：①若产物目录或用户提供的位置含原始数据，用你自己的独立代码重算关键统计量（效应量、CI、p、描述统计、样本量），与第三方报告值逐项对比；②无原始数据时做可推导性核验——从其已报告的量互推（SE↔CI↔p、百分比合计、自由度、样本量守恒）检查内部一致性。产出对比表：metric/原报告值/独立重算值/判定（match/mismatch/not-derivable）。只依据亲眼计算的结果下结论；遵循 code-to-data 铁律（原始数据行不读入上下文）。${langNote}`,
    });
    const recompute = await recomputer.ask<{ recomputation: { metric: string; reported: string; recomputed: string; verdict: "match" | "mismatch" | "not-derivable" }[] }>(
      `第三方产物目录：${externalDirArg}${dataPath ? `\n原始数据：${dataPath}` : "（未提供原始数据：做可推导性核验）"}\n复现检验员结论：${JSON.stringify(repro.reproduction)}\n完成独立重算并返回对比表。`,
    );
    const extStats = await agent("独立-统计审稿人", {
      system:
        `你是统计审稿人，对第三方分析做方法学审校（不信任其结论）：方法与数据匹配、假设检验是否执行、多重比较校正、效应量与 CI 报告完整性、缺失数据处理、p-hacking 迹象、结论是否超出数据支撑。读 ${externalDirArg} 的方法描述与输出核对。没有问题就明说没有。${langNote}`,
    }).ask<Review>(`第三方产物目录：${externalDirArg}\n请审校并返回意见。`);
    const mismatches = recompute.recomputation.filter((r) => r.verdict === "mismatch");
    const reproFailures = repro.reproduction.filter((r) => r.result.includes("失败") || r.result.includes("不可运行"));
    stage("交叉校验", mismatches.length === 0 && reproFailures.length === 0 && extStats.verdict !== "reject" ? "通过" : "有遗留");
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
    phase("独立服务：重建审计追踪包");
    const archivist0 = agent("独立-审计整理员", {
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

phase("立题：凝练研究问题与设计");
stage("立题", "进行中");
const pi = agent("选题主席", {
  system:
    "你是资深临床研究选题主席（临床医学/流行病学/心理学），站在 PI 视角把模糊想法凝练成可执行研究。产出必须包含 PICO/PECO 结构、可检验假设、匹配的研究设计、对应报告规范（观察性=STROBE、RCT=CONSORT、系统综述=PRISMA、心理测量按 APA/心理领域惯例）、FINER 评估与新颖性定位、2-3 本目标期刊。设计要与可获得的数据条件匹配，不要承诺做不到的事。产物呈现遵循 natural-voice Part 5 学术呈现规范：编号章节、编号图表（Table/Figure N）配规范表头与标准图注、Vancouver 参考文献、APA/JARS 统计量格式、正式书面语——禁止零散碎片化与笔记式表达。立题书按学术文档组织（研究背景与立题依据/研究问题与假设（PICO 表）/设计与报告规范/目标期刊/参考文献 五章编号）。把完整立题书写入工作区文件。语态遵循 natural-voice 学术子集：直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责。",
});
const rq = await pi.ask<ResearchQuestion>(
  `研究方向（用户原话）：${topic}\n领域设定：${field}${field === "auto" ? "（由你判定，必须填入返回结果的 field 字段：clinical/epidemiology/psychology）" : ""}\n数据条件：${dataPath ? `用户提供数据：${dataPath}` : "暂无真实数据，分析阶段将用固定种子模拟数据演示（立题时按此现实约束设计）"}\n${targetJournals ? `用户期刊偏好：${targetJournals}\n` : ""}必要时可读取 ${SKILLS} 下的相关技能文件辅助（如 pubmed_database、clinical_trials_database）获取背景。请产出立题书并写入 ${OUT}/01-research-question.md（自建目录），同时按接口返回结构化结果。${langNote}`,
);

phase("换人评审立题方案");
const rqCritic = agent("方法学评审", {
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
stage("立题", "通过");
record(`立题通过：${finalRq.question}（设计 ${finalRq.design}，规范 ${finalRq.guideline}）`);
const priorFacts = (): string => factsLedger.join("\n");

phase("多库并行检索文献");
stage("文献检索", "进行中");
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
const searchReports = await Promise.all(
  sources.map((src) =>
    agent(`检索-${src.name}`, {
      system:
        `你是文献检索员。${src.dir ? `先读 ${SKILLS}/${src.dir}/SKILL.md，严格按该技能的方法与脚本执行检索（本机已安装）。` : `本源没有本机技能：直接调用其官方 API（${src.hint}），遵守其条款与限流。`}构建规范检索式，围绕研究问题召回最相关的文献。合法性铁律：只用官方 API 或开放接口，禁止爬取 Google Scholar 或任何违反服务条款的站点；订阅库（Scopus/WoS/Embase/PsycINFO）无用户机构凭据时跳过并如实说明。逐条给出 PMID/DOI、标题、年份、设计、与问题相关的核心发现。检索失败时如实说明，不要编造文献。`,
      ...(lightSearch ? lightTier : {}),
    }).ask<SearchReport>(
      `研究问题：${finalRq.question}\nPICO：P=${finalRq.population}；I/E=${finalRq.exposure}；C=${finalRq.comparator}；O=${finalRq.outcome}\n领域：${fieldKey}\n请检索并返回至多 20 条最相关文献。`,
    ),
  ),
);
const candidates = searchReports.flatMap((r) => r.papers);
log(`${sources.length} 个检索源合计检出 ${candidates.length} 条候选文献`);

// 关联用户私有文献库（合法持有的已购文献，本地只读解析，仅并入证据链，不再分发）
const privateLibraryPath = String(args.privateLibraryPath ?? "").trim();
let privatePapers: PrivatePaper[] = [];
if (privateLibraryPath) {
  phase("关联用户私有文献库");
  stage("私有文献库", "进行中");
  const curator = agent("私有文献库管理员", {
    system:
      `你管理用户合法持有的已购文献库（${privateLibraryPath}）。合法性铁律：这些 PDF 仅本地读取用于用户本人的研究（个人使用授权），不外传、不再分发、不绕过任何 DRM。任务：①用 uv + pypdf/pdfminer.six 逐个解析 PDF 的元数据与首页文本，提取 标题/年份/DOI（提取不到就留空，不猜）；②对照研究问题的 PICO 判断每篇相关性，不相关的 relevance 留空；③绝不修改、移动或删除任何 PDF。返回结构化清单。`,
  });
  const privateLib = await curator.ask<{ papers: PrivatePaper[]; method: string }>(
    `研究问题：${finalRq.question}\nPICO：P=${finalRq.population}；I/E=${finalRq.exposure}；C=${finalRq.comparator}；O=${finalRq.outcome}\n文献库目录：${privateLibraryPath}\n请扫描解析并返回相关论文清单（含提取方法说明）。`,
  );
  privatePapers = privateLib.papers.filter((p) => p.relevance.length > 0);
  stage("私有文献库", "通过");
  record(`私有文献库：解析 ${privateLib.papers.length} 篇，与研究问题相关 ${privatePapers.length} 篇（并入证据链，来源标"私有库"）`);
}

phase("PRISMA 筛选与证据综合");
stage("证据综合", "进行中");
const synthesizer = agent("证据综合员", {
  system:
    "你是系统综述方法学家。按 PRISMA 思路去重、按纳入/排除标准筛选，形成证据表；逐研究给出偏倚风险评估要点（队列/病例对照用 NOS，RCT 用 RoB 2，非随机干预用 ROBINS-I）；总结证据空白与本研究新颖性定位。文献状态与质量筛选：①排除已撤稿（retracted）与编辑关注声明（expression of concern）状态的文献作为证据（状态经 OpenAlex is_retracted、PubMed 出版类型、Crossref Retraction Watch 核查）；②纳入与排序只依据与研究问题的相关性、证据等级与方法学质量（偏倚风险评估），**不按期刊声望或被引数排序**（避免引用偏倚，保证新期刊与非英语区好研究的能见度）。所有保留的文献必须有真实可查的 PMID/DOI。产物呈现遵循 natural-voice Part 5 学术呈现规范：编号章节、编号图表（Table/Figure N）配规范表头与标准图注、Vancouver 参考文献、APA/JARS 统计量格式、正式书面语——禁止零散碎片化与笔记式表达。证据表含 PRISMA 筛选说明与编号表格（Table N 规范表头+脚注）。把证据表写入文件后返回结构化结果。语态遵循 natural-voice 学术子集：直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责。",
  ...(lightSynth ? lightTier : {}),
});
let evidence = await synthesizer.ask<EvidenceTable>(
  `研究问题：${finalRq.question}\n候选文献（${sources.length} 个检索源合并，可能有重复）：${JSON.stringify(candidates)}\n${privatePapers.length > 0 ? `用户私有文献库（合法持有的已购文献，可并入证据表并逐条标 source="私有库"，id 填 DOI 或 "私有库:<文件名>"）：${JSON.stringify(privatePapers)}\n` : ""}检索式：${searchReports.map((r) => r.source + ": " + r.strategy).join("；")}\n请去重筛选（在线检索与私有库同文时保留一条并双标注来源），把证据表写入 ${OUT}/02-evidence-table.md 并返回。${langNote}`,
);
stage("证据综合", "通过");
record(`证据综合：纳入 ${evidence.included.length} 篇（排除 ${evidence.excludedSummary}），新颖性：${evidence.noveltyStatement.split("。")[0]}`);

phase("引文核查关卡");
stage("引文核查", "进行中");
const citationChecker = agent("引文核查员", {
  system:
    `你是引文核查员（PaperQA2 式落地核查 + 文献状态审计）。先读 ${SKILLS}/pubmed_database/SKILL.md 与 ${SKILLS}/literature_search_openalex/SKILL.md，用其方法逐条核验：①PMID/DOI 能否定位到真实论文；②题录信息（标题/年份/设计）是否相符；③我们写的核心发现是否与原文摘要一致；④状态审计：用 OpenAlex 的 is_retracted 字段、PubMed 出版类型标签（Retracted Publication / Expression of Concern / Correction）及 Crossref Retraction Watch 开放库（api.labs.crossref.org/retractions）核查撤稿/关注/更正状态，写入 status。抽查至少 8 条或全部（不足 8 条时全查），状态审计覆盖全部纳入文献。发现失败项与异常状态文献（retracted/concern）如实列出，不要放水，也不要改任何文件。`,
});
let citation = await citationChecker.ask<CitationCheck>(`证据表纳入文献：${JSON.stringify(evidence.included)}\n请逐条核查并返回结果。`);
let citationFailures: string[] = citation.passed ? [] : citation.failures;
if (!citation.passed) {
  log(`引文核查发现 ${citation.failures.length} 处失败，退回证据综合员修正`);
  evidence = await synthesizer.ask<EvidenceTable>(
    `引文核查发现以下失败项，请修正证据表（撤掉或更正条目，更新 ${OUT}/02-evidence-table.md）：\n${citation.failures.join("\n")}`,
  );
  citation = await citationChecker.ask<CitationCheck>(`修正后的证据表：${JSON.stringify(evidence.included)}\n请复核失败项与抽查其余条目。`);
  citationFailures = citation.passed ? [] : citation.failures;
}
stage("引文核查", citation.passed ? "通过" : "有遗留");
record(`引文核查：抽查 ${citation.checked} 条${citation.passed ? "全部通过" : `仍有 ${citation.failures.length} 条失败`}`);

phase("预注册式统计分析计划");
stage("统计计划", "进行中");
const statistician = agent("统计方法学家", {
  system:
    "你是生物统计方法学家。在看到任何结果之前预注册式地制定统计分析计划（SAP）：主要结局与主分析、次要与敏感性分析、效应量指标、α 水平与多重比较校正（Bonferroni/FDR）、缺失数据处理、样本量/效能、前提假设及检验方法、**模型复杂度与过拟合防控**（预注册时必须明确：①参数量与样本量关系——logistic 回归报告 EPV 并遵循 ≥10 惯例、每个调节项/随机效应的 df 支出说明；②随机效应结构的选择依据，禁止事后简化或复杂化搜索；③共线性诊断计划（VIF）；④若需模型比较，预注册 AIC/BIC 使用规则与备选模型集，禁止事后加模型；⑤适用时以交叉验证或训练/验证拆分作为预测性验证的敏感性分析；⑥模拟数据口径须含零假设蒙特卡洛检验 type-I 错误率校准）。心理领域遵循 APA 效应量报告惯例（Cohen's d、η² 等），流行病学报告 RR/OR/HR 及 95% CI。你此刻不知道任何结果——这是刻意设计，用于杜绝 p-hacking。另须产出两份供人工校对的内容：①变量字典——每个进入分析的变量给出 名称/操作定义/数据来源列/变换规则/选取理由（含考虑过但排除的候选变量及原因）；②方法依据表——每个分析方法一条选择依据（为何用它、不用什么替代）；③白话层——每个方法与每个变量附一句不使用术语的白话解释（初高中文化程度可懂，可用生活类比但不失真），让非统计背景研究者能读懂「我们在做什么、为什么」。语态遵循 natural-voice 学术子集：直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责。SAP 文首注明：本文件为预注册式内控文档，不等同于注册库预注册；研究需正式预注册时应提交 PROSPERO（系统综述）/OSF（原始研究）等平台并在文中引用注册号。产物呈现遵循 natural-voice Part 5 学术呈现规范：编号章节、编号图表（Table/Figure N）配规范表头与标准图注、Vancouver 参考文献、APA/JARS 统计量格式、正式书面语——禁止零散碎片化与笔记式表达。SAP 按正式预注册文档格式组织（编号章节：目的与设计/结局与变量/主分析/次要与敏感性/复杂度与过拟合防控/质量控制/版本）。把 SAP 写入文件后返回。",
});
const sap = await statistician.ask<StatPlan>(
  `研究问题：${finalRq.question}\n设计与假设：${finalRq.design}；${finalRq.hypotheses.join("；")}\n数据条件：${dataPath ? `真实数据 ${dataPath}` : "模拟数据演示"}\n证据表要点：${JSON.stringify(evidence.included.slice(0, 8))}\n把 SAP 写入 ${OUT}/03-sap.md 并返回。${langNote}`,
);
stage("统计计划", "通过");
record(`SAP 定稿：主分析 ${sap.primaryAnalysis.split("。")[0]}；校正 ${sap.corrections}`);
if (checkpoints.includes("sap")) {
  log("检查点暂停：SAP 已定稿，等待人工审阅后继续");
  return {
    conclusion: `参与式检查点暂停：预注册式统计计划已定稿（${sap.sapPath}，含变量字典、方法依据与白话层）。请审阅——重点核对变量字典的选取理由与方法依据表。审阅后对助手说"继续"，助手将编辑运行脚本移除本检查点并续跑（已完成步骤零成本导入，从分析执行阶段继续）。`,
    findings: [],
    verified: ["立题经换人评审", `证据表 ${evidence.included.length} 篇经引文核查与状态审计", "SAP 已定稿（含白话层）`],
    notCovered: ["分析及之后所有阶段待检查点放行后继续"],
  };
}

phase("执行分析与复现关卡");
stage("分析执行", "进行中");
const analyst = agent("数据分析员", {
  system:
    `你是数据分析员。严格按 SAP 执行，不得临时更换主分析（要改须先说明并取得 SAP 一致）。用 uv 管理依赖（先读 ${SKILLS}/uv/SKILL.md），Python 技术栈（pandas/statsmodels/scipy/pingouin 按需）。脚本固定随机种子、可一键重跑；${dataPath ? `使用用户提供的真实数据（${dataPath}）` : "没有真实数据时生成固定种子模拟数据完成整套流水线演示，并在一切输出中显式标注“模拟数据”"}。数据安全铁律（code-to-data）：绝不把原始数据行读入你的上下文——第一步只写脚本打印 schema（列名/类型/行数/缺失概况），此后一切处理都写成脚本执行，只有汇总统计与图表文件回到对话；分析前先检查并剔除或脱敏直接标识列（姓名、证件号、电话、详细地址、精确日期等，日期转为相对或区间），任何输出文件不得包含行级标识符；原始数据文件只读（不修改、不移动、不删除），唯一允许的写入是产物目录 ${OUT}/。报告每个结论的效应量与 95% CI，不只给 p 值。前提假设不满足时按 SAP 的备选方案执行并如实记录；执行中每个方法选择与任何偏离 SAP 的决定都写进 decisions 并给理由（供人工校对）。通俗注释铁律（玻璃箱，白话遵循 natural-voice 的 Part 4 受控白话层：短句/单句单概念/一词一义/祈使句核对动作）：每个主要代码块（数据清洗、建模、每张图表）上方必须有三行注释——【做什么】一句白话（初高中可懂）；【为什么】方法学理由与对应的研究假设/变量；【怎么核对】指出本块输出对应哪个文件哪个数字，供非代码背景研究者逐块人工校对。把脚本与输出写入目录后返回。`,
});
const analysis = await analyst.ask<AnalysisResult>(
  `SAP：${JSON.stringify(sap)}\n数据：${dataPath || "无（模拟演示）"}\n输出目录：${OUT}/04-analysis/（脚本、tables/、figures/）。完成后自行重跑一次脚本确认退出码 0，并写进 reproducibility。${langNote}`,
);
if (verifyCommand) {
  const rerun = await world.run("sh", ["-c", verifyCommand]);
  analysis.reproducibility = `${verifyCommand} 重跑退出码 ${rerun.exitCode}${rerun.exitCode === 0 ? "（通过）" : `（失败）：${(rerun.stderr || rerun.stdout).slice(0, 500)}`}`;
  if (rerun.exitCode !== 0) {
    await analyst.ask(`复现关卡失败，请修复脚本后重跑：\n${(rerun.stderr || rerun.stdout).slice(0, 1500)}`);
    const retry = await world.run("sh", ["-c", verifyCommand]);
    analysis.reproducibility = `修复后重跑退出码 ${retry.exitCode}`;
  }
}
stage("分析执行", "通过");
record(`分析完成（${analysis.realData ? "真实数据" : "模拟演示"}）：${analysis.keyFindings[0] ?? "无关键发现"}；复现：${analysis.reproducibility}`);

phase("统计审稿与修订");
stage("统计审稿", "进行中");
const statsReviewer = agent("统计审稿人", {
  system:
    "你是期刊统计审稿人。逐项核对：执行与 SAP 是否一致、假设检验是否做了、多重比较是否校正、效应量与 CI 是否完整、缺失数据是否按计划处理、有没有结果驱动的分析切换（p-hacking 迹象）、**过拟合防控核对**（参数量/样本比与 EPV 是否达标、随机效应结构是否与预注册一致、VIF/共线性是否报告、有无 SAP 之外的模型比较或变量增删、交叉验证结果若预定是否执行）、结论是否超出数据支撑。读工作区的脚本与输出核对（不要改文件）。没有问题就明说没有。",
});
const diagnoser = agent("根因诊断员", {
  system: "你负责诊断反复出现的统计问题根因（方法选择、数据问题或流程缺陷），不改文件，给出证据与最小修复路径。",
});
let statsReview = await statsReviewer.ask<Review>(
  `SAP：${JSON.stringify(sap)}\n分析结果：${JSON.stringify(analysis)}\n请读 ${analysis.scriptPath} 与 ${analysis.outputsPath} 实际核对后给评审意见。`,
);
let lastStatsSignature = "";
let statsRound = 0;
while (statsReview.verdict === "major-revision" && statsReview.majorIssues.length > 0 && statsRound < 2) {
  statsRound += 1;
  const signature = statsReview.majorIssues.map((s) => s.split("。")[0]).join("；");
  if (signature === lastStatsSignature) {
    const diag = await diagnoser.ask<string>(`统计审稿连续两轮意见相同，修复未触及根因。意见：\n${statsReview.majorIssues.join("\n")}\n请读脚本与输出诊断根因。`);
    await analyst.ask(`统计审稿停滞。根因诊断：\n${diag}\n请按诊断修复并保持与 SAP 一致（SAP 需要变更时先说明理由）。`);
  } else {
    await analyst.ask(`统计审稿要求修改（第 ${statsRound} 轮），请逐条处理：\n${statsReview.majorIssues.join("\n")}\n处理时保持与 SAP 一致。`);
  }
  lastStatsSignature = signature;
  statsReview = await statsReviewer.ask<Review>(`修订后请复核（第 ${statsRound + 1} 轮）。前情账本：\n${priorFacts()}`);
}
stage("统计审稿", statsReview.verdict === "accept" || statsReview.verdict === "minor-revision" ? "通过" : "有遗留");
record(`统计审稿：${statsReview.verdict}${statsReview.majorIssues.length > 0 ? `（遗留 ${statsReview.majorIssues.length} 项主要问题）` : ""}`);

if (figurePolish) {
  phase("图表美观审计与规范化（顶刊标准）");
  stage("图表规范化", "进行中");
  const artDirector = agent("图表艺术总监", { system: FIGURE_SYSTEM });
  const figureGate = agent("视觉复核员", {
    system:
      `你是视觉复核员，验收图表规范化成果：逐张检查 ${styleTarget} 规范要点（色盲友好/字号/矢量与分辨率/分面字母/栏宽/无图表垃圾/风格统一/图例自足/坐标轴单位），核对未改动任何数值结果（对照原始输出）。发现问题如实列出；全部达标就明说。不要改文件。`,
  });
  let figureAudit = await artDirector.ask<{ polishedDir: string; auditPath: string; figures: { name: string; changes: string }[] }>(
    `分析图表目录：${analysis.outputsPath}/figures（及 tables 中配图若有）。规范化版本输出到 ${analysis.outputsPath}/figures-polished/，逐图审计表（问题→改动→依据）写入 ${OUT}/09-figure-audit.md。目标期刊：${finalRq.journals[0] ?? styleTarget}${journalGuideUrl ? `；投稿指南：${journalGuideUrl}` : ""}。${langNote}`,
  );
  const visualCheck = await figureGate.ask<{ passed: boolean; issues: string[] }>(
    `规范化目录：${figureAudit.polishedDir}\n原始图目录：${analysis.outputsPath}/figures\n逐张对照验收（可查看 PNG 图像与脚本），返回结论。`,
  );
  if (!visualCheck.passed && visualCheck.issues.length > 0) {
    figureAudit = await artDirector.ask<{ polishedDir: string; auditPath: string; figures: { name: string; changes: string }[] }>(
      `视觉复核未通过，请逐条整改后更新（不覆盖原图）：\n${visualCheck.issues.join("\n")}\n完成后更新 ${OUT}/09-figure-audit.md。`,
    );
  }
  stage("图表规范化", visualCheck.passed ? "通过" : "有遗留");
  record(`图表规范化：${figureAudit.figures.length} 张按 ${finalRq.journals[0] ?? styleTarget} 规范重绘${visualCheck.passed ? "并复核通过" : "（复核仍有遗留）"}`);
}

phase("撰写论文初稿");
stage("论文撰写", "进行中");
const writer = agent("医学写作者", {
  system:
    `你是医学期刊写作者（STORM 式大纲驱动：先定大纲再成文）。**动笔前先读 ${SKILLS}/natural-voice/SKILL.md 并严格执行其语态规范**：去AI腔/去翻译腔/去伪学术黑话；直陈语气、术语全篇统一、数据句式紧贴解释；局限写成适用边界（scope conditions）而非防御性自贬（报告规范要求如实报告的局限仍报告，但用边界语态）；英文写作遵循 Part 2（封锁 AI 高频词、以证据强度选动词、一段一个动作、统计写法带效应量与 CI）；成稿前过其 Part 3 自检清单。按 ${finalRq.guideline} 规范与 IMRaD 结构撰写：引言（ funnel 逻辑，落点在研究空白）、方法（可复现细节，直接引用 SAP 与脚本）、结果（先总体后分层，每个结论带效应量与 95% CI，指向图表${figurePolish ? "，优先引用 figures-polished/ 规范化版本" : ""}）、讨论（结果解释、与证据表内文献逐条对照、局限、意义）。结构式摘要。引用规则：只允许两类引用——已核查证据表内的文献（带 PMID/DOI，或私有库条目的 "私有库:<文件名>" 标注）或本研究自身结果；绝不引入未核查的新文献，绝不编造引文。文献状态纪律：**绝不把撤稿（retracted）或编辑关注（concern）状态的文献作为证据引用**——如确需提及（如讨论该研究被撤稿的启示），必须显式标注其撤稿状态且不作为结论支撑；带更正/勘误（corrected）的文献可引用但注明"本文引用更正后版本"。${analysis.realData ? "" : "全文用模拟数据演示口径撰写，标题页显式标注。"}标题页必须附 AI 使用声明草稿：如实注明本稿件由 AI 辅助生成（文献检索、分析代码、初稿撰写），引用经逐条核查，全部结论需作者人工核验并承担学术责任；具体措辞按目标期刊的 AI 披露政策调整，作者不得删除该声明。产物呈现遵循 natural-voice Part 5 学术呈现规范：编号章节、编号图表（Table/Figure N）配规范表头与标准图注、Vancouver 参考文献、APA/JARS 统计量格式、正式书面语——禁止零散碎片化与笔记式表达。全文 IMRaD 编号章节+结构式摘要+图表编号引用+回应信用 Reviewer N → Comment N.x → Response 逐条编号格式。把初稿写入文件后返回。`,
});
let draft = await writer.ask<DraftResult>(
  `立题书：${JSON.stringify(finalRq)}\n证据表（引用白名单）：${JSON.stringify(evidence.included)}\nSAP：${JSON.stringify(sap)}\n分析结果：${JSON.stringify(analysis)}\n统计审稿遗留问题（写作时注意）：${JSON.stringify(statsReview)}\n目标期刊：${finalRq.journals.join("、")}\n把初稿写入 ${OUT}/06-draft.md 并返回。${langNote}`,
);
stage("论文撰写", "通过");
if (checkpoints.includes("draft")) {
  log("检查点暂停：初稿完成，等待人工审阅后继续");
  return {
    conclusion: `参与式检查点暂停：论文初稿已完成（${draft.draftPath}，含 AI 使用声明与白话注释的分析）。请审阅初稿与 ${OUT}/04-analysis/ 中带通俗注释的脚本。审阅后对助手说"继续"，助手将编辑运行脚本移除本检查点并续跑（从同行评审阶段继续，已完成步骤零成本导入）。`,
    findings: [],
    verified: ["全流程至初稿完成", `分析脚本含三行式通俗注释（做什么/为什么/怎么核对）`],
    notCovered: ["同行评审、答辩拷问、引文深审、文献归档、审计包待检查点放行后继续"],
  };
}

phase("同行评审模拟与修订");
stage("同行评审", "进行中");
const reviewerLenses = fullPanel
  ? [
      { tag: "方法学", focus: "设计、偏倚、规范符合度（对照 " + finalRq.guideline + " 清单）" },
      { tag: "领域专家", focus: "新颖性、与既往文献的对照是否到位、结论的领域意义" },
      { tag: "统计", focus: "报告完整性、效应量与 CI、推断边界" },
    ]
  : [{ tag: "方法学", focus: "设计、偏倚、规范符合度与论证链条" }];
const reviewers = reviewerLenses.map((lens) => ({
  lens,
  agent: agent(`评审人-${lens.tag}`, {
    system: `你是期刊同行评审人（${lens.tag}视角：${lens.focus}）。像顶级期刊审稿人一样苛刻但公正：major = 不修不能发表的问题，minor = 建议项。读工作区的初稿与证据表/分析输出后给意见（不要改文件）。没有 major 就明说。`,
  }),
}));
const challenger = agent("对抗挑战员", {
  system:
    "你的唯一任务是找出初稿的致命缺陷：夸大结论、数据与文字不符、引用与原文不符、规范硬伤。亲自核对（不要改文件），找到实证才提出，找不到就明说。",
});
let round = 0;
let allReviews: Review[] = [];
let openMajors: string[] = [];
let lastSignature = "";
while (round < 2) {
  round += 1;
  allReviews = await Promise.all(reviewers.map((r) => r.agent.ask<Review>(`初稿：${draft.draftPath}（请直接读文件）\n前情账本：\n${priorFacts()}\n请给评审意见。`)));
  openMajors = allReviews.flatMap((r) => r.majorIssues);
  if (adversarial) {
    const attack = await challenger.ask<string>(`初稿：${draft.draftPath}\n分析输出：${analysis.outputsPath}\n请攻击。找到的致命缺陷直接列出，没有则回答“未找到”。`);
    if (attack.trim().length > 0 && attack.trim() !== "未找到") openMajors.push(`[对抗挑战] ${attack}`);
  }
  if (openMajors.length === 0) break;
  const signature = openMajors.map((s) => s.split("。")[0]).join("；");
  if (signature === lastSignature) {
    const diag = await diagnoser.ask<string>(`两轮评审同样的主要问题未解决，修订未触及根因：\n${openMajors.join("\n")}\n请读初稿与相关文件诊断根因。`);
    draft = await writer.ask<DraftResult>(`评审意见两轮未变。根因诊断：\n${diag}\n请按诊断修订初稿（更新 ${OUT}/06-draft.md）并返回。`);
  } else {
    draft = await writer.ask<DraftResult>(
      `同行评审主要问题（第 ${round} 轮），请逐条修订初稿（更新 ${draft.draftPath}）后返回：\n${openMajors.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n次要问题尽量一并处理：${JSON.stringify(allReviews.flatMap((r) => r.minorIssues).slice(0, 8))}`,
    );
  }
  lastSignature = signature;
}
let metaSummary = "";
if (fullPanel) {
  const metaReviewer = agent("总评审", {
    system: "你是领域主编/资深编委。综合三位评审人与修订历史，给出最终意见：达到投稿水准与否，以及投稿前必须完成的条目。",
  });
  const meta = await metaReviewer.ask<MetaReview>(`三轮评审意见：${JSON.stringify(allReviews)}\n修订轮数：${round}\n最终初稿：${draft.draftPath}\n请给总评审意见。`);
  metaSummary = meta.summary;
  openMajors = meta.decision === "revise" ? [...openMajors, ...meta.required] : openMajors;
}
stage("同行评审", openMajors.length === 0 ? "通过" : "有遗留");
record(`同行评审（${integrityMode}，${round} 轮）：${openMajors.length === 0 ? "无遗留主要问题" : `遗留 ${openMajors.length} 项`}${metaSummary ? `；总评审：${metaSummary.split("。")[0]}` : ""}`);

phase("答辩拷问与预审回应");
stage("答辩拷问", "进行中");
const grillCount = fullPanel ? 10 : adversarial ? 8 : 6;
const examiner = agent("答辩拷问官", {
  system:
    `你是最苛刻的答辩委员兼审稿人（grill-me 式拷问：不问客套问题，只问"答不好就拒稿"的问题）。针对这项研究提出 ${grillCount} 个最刁钻但公正的问题，直击：因果推断的致命混淆、样本量与效能、**模型复杂度与过拟合**（参数是否相对样本过多、随机效应结构论证、共线性）、测量效度、结果的替代解释、与既有更强证据的冲突、结论外推边界、模拟/演示数据的可迁移性。每个问题标注考点。读初稿与分析输出后再出题。`,
});
const grill = await examiner.ask<GrillQuestion[]>(
  `初稿：${draft.draftPath}\n分析输出：${analysis.outputsPath}\n前情账本：\n${priorFacts()}\n请提出 ${grillCount} 个拷问问题。`,
);
const rebuttal = await writer.ask<Rebuttal>(
  `答辩拷问问题清单：${JSON.stringify(grill)}\n请逐条作答：能答的用证据表/SAP/分析输出中的真实材料作答（材料必须存在于工作区文件，不得新编）；暴露出稿件真实缺口的，同步修订初稿相应部分；确实答不出的诚实列入 unanswered 并说明缺什么（缺数据/缺实验/缺文献）。回应信语态遵循 ${SKILLS}/natural-voice/SKILL.md：笃定专业、直陈理据、无防御性辩解铺垫。完整问答按预审回应信格式写入 ${OUT}/07-rebuttal.md，返回结构化结果。${langNote}`,
);
stage("答辩拷问", rebuttal.unanswered.length === 0 ? "通过" : "有遗留");
record(`答辩拷问：${grill.length} 问，答出 ${rebuttal.answers.length} 问${rebuttal.unanswered.length > 0 ? `，${rebuttal.unanswered.length} 问诚实列为待补` : ""}`);

phase("引文深度比对与校验");
stage("引文深审", "进行中");
const citationAuditor = agent("引文深审员", {
  system:
    `你是引文深审员，对初稿做引用-原文的深度比对（防引文幻觉与学术不端的最后防线）。先读 ${SKILLS}/literature_search_europepmc/SKILL.md 与 ${SKILLS}/pubmed_database/SKILL.md，按其方法取原文：优先 EuropePMC 开放获取全文（PMC OA 全文接口），取不到全文时用摘要并在 resolvedSource 注明"仅摘要级"；标注"私有库:<文件名>"的引用直接读用户私有库中的本地 PDF 全文核对（最优先、最完整）。对初稿每一条引用做五件事：①定位：PMID/DOI 落地到真实文献（私有库条目定位到本地文件）；②溯源：判断它是否最原始源文献——若我们的陈述实际源自某原始研究而被综述转引，标 secondary-needs-tracing 并在 note 给出应引的原始文献（PMID/DOI）；③比对：找到原文中支撑我们陈述的具体位置（段落/表/图），逐点判定 supported（原文支持）/overstated（夸大）/misleading（误导性引用）/unsupported（原文不支持）；④必要性：这条引用是否支撑它所在句子的论点——necessary（必要）/redundant（冗余堆砌）/wrong-context（张冠李戴）；⑤状态审计：用 OpenAlex is_retracted 字段、PubMed 出版类型（Retracted Publication/Expression of Concern/Correction）与 Crossref Retraction Watch 开放库（api.labs.crossref.org/retractions）核查撤稿状态，填 retractionStatus——retracted/concern 视为问题引用（除非初稿已显式标注撤稿且不作为证据）。只依据亲眼读到的原文与接口返回下结论；读不到全文就如实降级到摘要级并标注，状态查不到标 unknown。不改初稿，把逐条明细写入文件后返回。`,
});
let citationAudit = await citationAuditor.ask<CitationAuditReport>(
  `初稿：${draft.draftPath}（逐条读其 References 与正文中每个引用点）\n证据表白名单：${JSON.stringify(evidence.included)}\n把逐条审计明细（含四项判定与建议动作）写入 ${OUT}/05a-citation-audit.md 并返回。`,
);
if (citationAudit.problems > 0) {
  log(`引文深审发现 ${citationAudit.problems} 条问题引用，交写作员修正`);
  const problemEntries = citationAudit.entries.filter((e) => e.isPrimary !== "primary" || e.accuracy !== "supported" || e.necessity !== "necessary" || e.retractionStatus === "retracted" || e.retractionStatus === "concern");
  draft = await writer.ask<DraftResult>(
    `引文深审发现以下问题引用，请逐条处理（换原始源文献/改写陈述使其与原文一致/删除冗余；更新 ${draft.draftPath}；替换后的引用须来自证据表白名单或深审员 note 中给出的原始文献）：\n${JSON.stringify(problemEntries)}`,
  );
  citationAudit = await citationAuditor.ask<CitationAuditReport>(`修订后请复核此前的问题引用并更新明细文件（${OUT}/05a-citation-audit.md）。当前初稿：${draft.draftPath}`);
}
stage("引文深审", citationAudit.problems === 0 ? "通过" : "有遗留");
record(`引文深审：${citationAudit.entries.length} 条逐条比对（溯源/准确性/必要性），${citationAudit.problems === 0 ? "全部通过" : `遗留 ${citationAudit.problems} 条问题`}`);

phase("开放文献下载与获取清单");
stage("文献归档", "进行中");
const librarian = agent("文献管理员", {
  system:
    `你负责把初稿引用的文献尽量落成本地 PDF 归档。先读 ${SKILLS}/literature_search_europepmc/SKILL.md 与 ${SKILLS}/pubmed_database/SKILL.md，按其方法查询每篇的开放获取状态（EuropePMC/PubMed Central OA 全文、出版社免费 PDF、预印本 arXiv/bioRxiv/medRxiv）。可合法免费获取的下载保存到 ${OUT}/papers/，文件名规范：标题_期刊_发表年份.pdf（去除文件名非法字符、总长控制在 120 字符内、同名冲突时末尾附 PMID）。付费墙后无合法免费版本的**绝不绕过付费墙**，列入未下载清单。把结果写入 ${OUT}/08-papers-manifest.md：①已下载清单（文件名 ↔ PMID/DOI 对照）；②未下载清单——标准参考文献格式（Vancouver：作者. 标题. 期刊. 年;卷(期):页. doi）逐条列出，每条注明建议获取途径（如"出版社页面订阅获取""机构图书馆/文献传递"），并在开头提醒用户自行下载补齐后放入 papers/ 目录。语态遵循 natural-voice 学术子集：直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责。`,
});
const library = await librarian.ask<PaperLibrary>(
  `初稿引用清单：${draft.draftPath} 的 References（逐条读取）\n引文深审明细（含每条 resolvedSource 与溯源替换后的原始文献）：${citationAudit.auditPath}\n${privatePapers.length > 0 ? `用户私有文献库已持有的文献（这些不需要下载，在 08 清单"已持有"区列出文件路径即可，且不复制进 papers/）：${JSON.stringify(privatePapers)}\n` : ""}下载目录：${OUT}/papers/（自建）\n完成后返回结构化结果。${langNote}`,
);
stage("文献归档", "通过");
record(`文献归档：下载 ${library.downloaded.length} 篇开放获取 PDF，${library.notDownloaded.length} 篇列入待获取清单（08）`);

phase("审计追踪与人工校对包");
stage("审计包", "进行中");
const archivist = agent("审计整理员", {
  system:
    "你把整个流水线整理成『人工校对包』，目的是让研究者能逐一快速核对、防 AI 幻觉导致学术不端。产出两个文件：\n" +
    `① ${OUT}/00-README.md——目录树 + 每个文件一句话说明 + 三份清单：动了什么（仅 ${OUT}/ 产物）、没动什么（原始数据与数据集文件夹其余内容只读）、去哪找什么；末尾放免责声明（含工具定位声明：工具定位声明：本流水线是科研提效工具，与任何工具一样不保证产出百分之百真实、正确或完整；所有结论、数据、引文与文本必须经用户人工审核，并由具备专业能力的研究者从专业层面取舍与负责；AI 不能替代同行评审、伦理审查与作者的学术责任。）。\n` +
    `② ${OUT}/05-audit-trail.md——六部分：(a) Mermaid flowchart TD 流程图，每个节点标注「做了什么+为何这么做」，关卡节点单独形状；(b) 变量字典表（变量/操作定义/来源列/变换规则/选取理由，取自 SAP 的 variables，逐条照抄不得改写）；(c) 分析方法决策表（方法/选择依据（SAP 的 methodRationale）/执行情况（分析的 decisions）三列对齐）；(d) 引文深审明细表（照抄 05a 文件的逐条判定：溯源/原文位置/准确性/必要性）；(e) 各关卡结论一览（引文核查、统计审稿、同行评审、答辩拷问、引文深审的结论与遗留）；(f) 白话导读：每一部分开头加「通俗导读」框（白话遵循 natural-voice Part 4 受控白话层：短句、单句单概念、一词一义）——用生活类比解释本部分在做什么、为什么、结果意味着什么（初高中可懂、不失真），并为每个关键结论配「亲手验证动作」（打开哪个文件、看哪个数字、和哪里对）；(g) 人工校对指引：建议按什么顺序核对哪些文件、每处核对对应哪个文件哪一节；(h) 免责声明。\n` +
    "所有内容必须取自工作区真实文件与本次结构化输入，禁止添加未发生的事项或美化结论。语态遵循 natural-voice 学术子集：直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责。",
});
// L0 遥测：落盘 99-metrics.json，跨运行汇总成质量基线（与 evaluation/ 评测协议配套）
const metricsPartial = {
  mode,
  integrityMode,
  teamProfile,
  evidenceIncluded: evidence.included.length,
  citationGate: { checked: citation.checked, passed: citation.passed, failures: citationFailures.length },
  statsReview: { verdict: statsReview.verdict, rounds: statsRound },
  peerReview: { rounds: round, openMajors: openMajors.length },
  grill: { questions: grill.length, unanswered: rebuttal.unanswered.length },
  citationAudit: { entries: citationAudit.entries.length, problems: citationAudit.problems },
  papers: { downloaded: library.downloaded.length, notDownloaded: library.notDownloaded.length },
};
const auditPack = await archivist.ask<AuditPack>(
  `立题：${JSON.stringify({ question: finalRq.question, design: finalRq.design, guideline: finalRq.guideline })}\nSAP（含变量字典与方法依据）：${JSON.stringify(sap)}\n分析（含执行决定）：${JSON.stringify({ realData: analysis.realData, keyFindings: analysis.keyFindings, decisions: analysis.decisions, reproducibility: analysis.reproducibility })}\n关卡结论：引文核查 ${citation.passed ? "通过" : citation.failures.join("；")}；统计审稿 ${statsReview.verdict}；同行评审 ${round} 轮遗留 ${openMajors.length} 项；答辩拷问 ${rebuttal.unanswered.length} 问待补；引文深审 ${citationAudit.entries.length} 条遗留 ${citationAudit.problems} 条（明细文件 ${citationAudit.auditPath}，逐条照抄进 (d)）\n产物路径：立题书/证据表/SAP/分析输出/初稿/回应信/引文深审明细/文献 PDF（papers/）/文献归档清单（08）均在 ${OUT}/ 下（逐个 ls 核实后写进 README 目录树）；另把以下运行指标原样写入 ${OUT}/99-metrics.json（JSON，不得增删改字段值）：${JSON.stringify(metricsPartial)}\n产物呈现遵循 natural-voice Part 5 学术呈现规范：编号章节、编号图表（Table/Figure N）配规范表头与标准图注、Vancouver 参考文献、APA/JARS 统计量格式、正式书面语——禁止零散碎片化与笔记式表达。00/05 按编号章节与表格化清单组织。请写出两个文件并返回。${langNote}`,
);
stage("审计包", "通过");
record(`审计包就绪：${auditPack.manifestPath} 与 ${auditPack.auditPath}`);

phase("终检与交付");
stage("终检交付", citationAudit.problems === 0 ? "通过" : "有遗留");
const scribe = agent("报告撰写", {
  system: `你把整个科研流水线的过程与产物汇总成给研究者看的 Markdown 总结：立题、证据、SAP、分析发现、评审轮次与遗留、投稿前建议。只写有依据的内容，明确区分已验证与未验证。总结开头固定附工具定位声明：工具定位声明：本流水线是科研提效工具，与任何工具一样不保证产出百分之百真实、正确或完整；所有结论、数据、引文与文本必须经用户人工审核，并由具备专业能力的研究者从专业层面取舍与负责；AI 不能替代同行评审、伦理审查与作者的学术责任。语态遵循 ${SKILLS}/natural-voice/SKILL.md：直陈、具体、无AI腔与套话。`,
  ...(teamProfile === "quality" ? {} : lightTier),
});
const summaryMd = await scribe.ask<string>(
  `直接返回 Markdown 文本。${langNote}立题：${JSON.stringify(finalRq)}\n证据：纳入 ${evidence.included.length} 篇\nSAP 路径：${sap.sapPath}\n分析：${JSON.stringify(analysis.keyFindings)}（${analysis.realData ? "真实数据" : "模拟演示"}）\n统计审稿：${statsReview.verdict}\n同行评审 ${round} 轮，遗留 ${openMajors.length} 项\n引文深审：${citationAudit.entries.length} 条逐条比对（溯源/准确性/必要性），${citationAudit.problems === 0 ? "全部通过" : `遗留 ${citationAudit.problems} 条`}\n前情账本：\n${priorFacts()}`,
);
await artifact.markdown("summary", summaryMd, { title: "科研流水线总结" });
await artifact.file("draft", draft.draftPath, { title: "论文初稿", description: `按 ${finalRq.guideline} 规范撰写的 IMRaD 初稿`, primary: true });
await artifact.file("evidence", evidence.evidencePath, { title: "证据表" });
await artifact.file("sap", sap.sapPath, { title: "统计分析计划（预注册式）" });
await artifact.file("outputs", analysis.outputsPath, { title: "分析脚本与输出" });
await artifact.file("rebuttal", rebuttal.rebuttalPath, { title: "答辩拷问与预审回应信" });
await artifact.file("audit", auditPack.auditPath, { title: "审计追踪与人工校对包", description: "Mermaid 流程图、变量字典、方法决策表、关卡结论与免责声明" });
await artifact.file("manifest", auditPack.manifestPath, { title: "产出清单（动了啥/没动啥/在哪）" });
await artifact.file("papers", library.manifestPath, { title: "文献归档清单", description: `已下载 ${library.downloaded.length} 篇 OA PDF；${library.notDownloaded.length} 篇待获取（Vancouver 格式清单）` });

const findings: WorkflowReport["findings"] = [];
for (const f of citationFailures) findings.push({ what: `引文核查失败项：${f.split("\n")[0]}`, evidence: f, severity: "medium", status: "verified" });
for (const m of openMajors) findings.push({ what: `评审遗留主要问题：${m.split("。")[0]}`, evidence: m, severity: "high", status: "verified" });
for (const u of rebuttal.unanswered) findings.push({ what: `答辩拷问未答出：${u.split("\n")[0]}`, evidence: u, severity: "medium", status: "verified" });
for (const e of citationAudit.entries) {
  if (e.isPrimary !== "primary" || e.accuracy !== "supported" || e.necessity !== "necessary" || e.retractionStatus === "retracted" || e.retractionStatus === "concern") {
    findings.push({ what: `引文深审问题：${e.citation.split("\n")[0]}`, evidence: `${e.note}（定位：${e.resolvedSource}；判定：${e.isPrimary}/${e.accuracy}/${e.necessity}）`, severity: "high", status: "verified" });
  }
}
if (!analysis.realData) findings.push({ what: "分析基于固定种子模拟数据，非真实数据", evidence: "启动时未提供 dataPath，全流程按演示口径执行并已在初稿标注", severity: "medium", status: "verified" });
const verified: string[] = [
  `立题经方法学评审${rqCritique.hasBlockingIssues ? "并修订" : "一次通过"}`,
  `证据表 ${evidence.included.length} 篇经逐条引文核查与撤稿状态审计（OpenAlex/PubMed 出版类型/Retraction Watch；抽查 ${citation.checked} 条）`,
  `统计审稿结论：${statsReview.verdict}`,
  `同行评审模拟 ${round} 轮（${integrityMode} 模式${adversarial ? "，含对抗挑战" : ""}${fullPanel ? "与总评审" : ""}）`,
  `答辩拷问 ${grill.length} 问（答出 ${rebuttal.answers.length}，待补 ${rebuttal.unanswered.length}）`,
  ...(figurePolish ? [`图表按 ${finalRq.journals[0] ?? styleTarget} 规范审计重绘并经视觉复核（09-figure-audit.md）`] : []),
  `引文深审：${citationAudit.entries.length} 条逐条比对（溯源到最原始文献、原文位置定位、准确性与必要性判定），${citationAudit.problems === 0 ? "全部通过" : `遗留 ${citationAudit.problems} 条`}`,
  `分析复现：${analysis.reproducibility}`,
];
const notCovered: string[] = [];
if (!analysis.realData) notCovered.push("未运行真实数据分析（未提供 dataPath）；提供后可从统计计划阶段重跑");
if (!verifyCommand) notCovered.push("复现性由分析员自报重跑退出码，未经脚本统一关卡");
if (citationAudit.problems > 0) notCovered.push(`引文深审遗留 ${citationAudit.problems} 条问题引用（详见 05a 明细），投稿前需人工复核`);
const abstractOnlyCount = citationAudit.entries.filter((e) => e.resolvedSource.includes("摘要")).length;
if (abstractOnlyCount > 0) notCovered.push(`引文深审中 ${abstractOnlyCount} 条仅完成摘要级比对（无开放获取全文，正文级夸大无法排除），投稿前建议人工复核原文`);
for (const u of rebuttal.unanswered) notCovered.push(`答辩拷问待补项：${u.split("\n")[0]}`);
if (library.notDownloaded.length > 0) notCovered.push(`${library.notDownloaded.length} 篇引用无合法免费全文（付费墙），已列入 08 清单（Vancouver 格式+获取途径），请自行下载后放入 ${OUT}/papers/`);
const shortTopic = [...finalRq.question].slice(0, 60).join("");
const runMetrics = {
  ...metricsPartial,
  citationAudit: { ...metricsPartial.citationAudit, abstractOnly: citationAudit.entries.filter((e) => e.resolvedSource.includes("摘要")).length },
  reproducibility: analysis.reproducibility,
  realData: analysis.realData,
  findingsTotal: findings.length,
  notCoveredTotal: notCovered.length,
};
return {
  metrics: runMetrics,
  conclusion: `「${shortTopic}」完成科研流水线：立题通过评审，纳入 ${evidence.included.length} 篇证据，分析${analysis.realData ? "基于真实数据" : "为模拟演示"}，统计审稿 ${statsReview.verdict}，同行评审 ${round} 轮、答辩拷问 ${grill.length} 问、引文深审 ${citationAudit.entries.length} 条后${openMajors.length === 0 && rebuttal.unanswered.length === 0 && citationAudit.problems === 0 ? "无遗留问题" : `遗留 ${openMajors.length + rebuttal.unanswered.length + citationAudit.problems} 项`}。初稿、回应信、审计包与全部中间产物已交付。`,
  findings,
  verified,
  notCovered,
};