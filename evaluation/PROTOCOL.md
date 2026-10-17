# ProvenanceLab 评测协议（Evaluation Protocol）

> 口号说 every claim stands scrutiny——评测体系自己也要经得起推敲。本协议定义 L0（遥测基线）与 L1（植错测试集）两层评测。

## L0 · 内建遥测（每次全流程运行自动产生）

- 每次运行自动落盘 `<产物目录>/99-metrics.json`，并在最终返回的 `metrics` 字段携带同一数据
- 指标：证据纳入数、引文核查关卡（抽查数/通过/失败）、统计审稿（结论/轮数）、同行评审（轮数/遗留 major）、答辩拷问（问数/未答出）、引文深审（条数/问题数/仅摘要级）、文献归档（已下载/待获取）、复现性、findings/notCovered 总数、模式与档位
- 用法：跨运行汇总成基线表；任何优化（提速降 token、人设修改）前后对照，**指标不得恶化**是合入条件之一

## L1 · 引文深审植错测试集（`citation-error-cases/`）

**测什么**：引文深审关卡（citation-audit 模式）对已知问题引用的检出率与对干净引用的误报率。

**怎么跑**：

1. **首次使用前必做——ground truth 核验**：`expected.json` 中 `verification: "verify"` 的案例，先经 PubMed 出版类型 / Crossref Retraction Watch 人工确认 ground truth 再计分（本集由作者记忆构建，防"评测集自己幻觉"）
2. 运行：`/provenance-lab` → 模式选 `cross-validate` 之外的 `citation-audit` → `draftPath` 指向 `citation-error-cases/seeded-draft.md`（跨 harness：按 core 协议对 seeded-draft 执行 S7.5 流程）
3. 评分：将产出的 `05a-citation-audit.md` 与 `expected.json` 对照。建议由**全新会话**的 agent 辅助评分（避免运行上下文偏见），或人工逐条：
   - **问题案例**（S1–S10）判"通过" = 该条在 05a 中被标为问题（任一维度不达标，或按 expected 给出的具体维度判定一致）
   - **干净对照**（S11）判"通过" = 未被误报为问题
   - 汇总：敏感度 = 检出问题数/10；特异度 = 干净未误报数/1；附各案例"仅摘要级"层数

**节奏**：任何对引文深审/文献状态审计人设或流程的修改后必须重跑；LLM 非确定性——正式记录报 **3 次运行的均值±范围**。结果汇总表提交至 `evaluation/results/`（单次原始产物加入 .gitignore 不提交）。

## 局限与后续（如实声明）

- L1 只覆盖引文维度；统计忠实度与交叉校验的植错集属 L2（roadmap）
- 用 LLM 评 LLM 存在循环性——关键版本建议人工专家复核抽样
- 检出率是关卡能力下限估计，不代表全流程正确性上界
