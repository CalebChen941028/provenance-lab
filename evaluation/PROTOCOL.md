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

## 迭代回归测试规范（轻量课题加速，开发循环专用）

优化迭代的重试验证**不跑重型课题**——用轻量课题做回归，收敛后如有需要再做一次全尺度确认。

**标准轻量课题池**（固定复用，保证跨迭代可比）：
- L-A 横断：`咖啡因摄入与大学生考试焦虑的横断关联：固定种子模拟横断数据演示（n=300，相关与回归，development 严格度）`
- L-B 简单纵向：`每周运动次数与睡眠时长的两波小样本关联：固定种子模拟演示（n=200，development 严格度）`
- L-C 文献专项：对 `citation-error-cases/seeded-draft.md` 跑 citation-audit 模式（即 L1）

**配置**：integrityMode=development（单方法学审稿+6 问拷问）、hybrid 编队、无 checkpoints、figurePolish=true。预期单次 30-60 分钟、<8M tokens。

**验收判据**（与优化合入条件一致）：
1. L0 指标（99-metrics.json）不劣于上一轮轻量基线——尤其引文关卡通过数、深审问题检出数（L-C 用 L1 的敏感度/特异度）
2. 逐阶段 token/耗时对比：目标环节下降、其余环节无异常膨胀
3. 产物完整性：00-08 与 99-metrics 齐全、学术呈现规范抽检合格

**循环**：实施优化 → 轻量回归 → 判据通过则合入（九处同步 D23）→ 找下一处；连续两轮无可优化项即收敛，收敛后可选做一次全尺度终验。
