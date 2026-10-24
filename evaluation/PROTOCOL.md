# ProvenanceLab 评测协议（Evaluation Protocol）

> 口号说 every claim stands scrutiny——评测体系自己也要经得起推敲。本协议定义 L0（遥测基线）与 L1（植错测试集）两层评测。

## L0 · 内建遥测（每次全流程运行自动产生）

- 每次运行自动落盘 `<产物目录>/99-metrics.json`，并在最终返回的 `metrics` 字段携带同一数据
- 指标：证据纳入数、引文核查关卡（抽查数/通过/失败）、统计审稿（结论/轮数）、同行评审（轮数/遗留 major）、答辩拷问（问数/未答出）、引文深审（条数/问题数/仅摘要级/无原文）、文献归档（已下载/待获取）、复现性（含 reproFailed）、findings/notCovered 总数、模式与档位；`deterministic` 段记录确定性工具层（工具调用与失败数、检索源失败数、去重前后候选数、证据表标识符解析/不存在/撤稿数、白名单终检与 statcheck 结果）
- 用法：跨运行汇总成基线表；任何优化（提速降 token、人设修改）前后对照，**指标不得恶化**是合入条件之一

## L1 · 引文深审植错测试集（`citation-error-cases/`）

**测什么**：引文深审关卡（citation-audit 模式）对已知问题引用的检出率与对干净引用的误报率。

**怎么跑**：

1. **ground truth 核验**：v0.2 全部案例已于 2026-10-24 经 PubMed / Crossref / OpenAlex 逐条核验（`verified_by` 字段记录依据）。v0.1 由作者记忆构建，核验发现 S4、S8 的 DOI 指向无关论文、PMID 35149136 被误标为横断面研究（实为 meta 分析）、S10 陈述与原文主题不符，且参考文献条目附带了泄露答案的提示语——v0.1 的任何得分均不可用。今后新增案例必须先过 API 核验再入集
2. 运行：`/provenance-lab` → 模式选 `citation-audit` → `draftPath` 指向 `citation-error-cases/seeded-draft.md`（跨 harness：按 core 协议对 seeded-draft 执行 S7.5 流程）
3. 评分：citation-audit 模式会写出结构化明细 `05a-citation-audit.json`，用 `python3 evaluation/score_l1.py <run1>/05a-citation-audit.json <run2>/… <run3>/…` 确定性计分（多文件时报均值与范围，并单独报告确定性层对 S1–S4、S10 的判定）。规则如下：
   - **问题案例**（S1–S9）判"通过" = 该条被标为问题（任一维度不达标），且 expected 给出的具体维度判定一致
   - **非问题案例**（S10 更正状态文献、S11 干净对照）判"通过" = 未被判为问题；S10 还须标注 retractionStatus=corrected
   - 汇总：敏感度 = 检出问题数/9；特异度 = 非问题案例未误报数/2；附各案例文本层级（textLevel：全文/仅摘要级/无原文）

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
2. 逐阶段 token/耗时对比：目标环节下降、其余环节无异常膨胀——`python3 evaluation/run_profile.py "<本轮运行名>" --baseline "<上轮运行名>"` 从本机 ZCode 数据库只读生成逐角色对照表
3. 产物完整性：00-09、99-metrics、05a JSON 与 tools/ 下的确定性结果齐全，学术呈现规范抽检合格

**离线预检（零 token，每次改动先过）**：`python3 -m unittest discover -s tools/tests`（工具层）、`node ci/typecheck.mjs`（工作流类型）、`node ci/mock-run.mjs` 与 `--no-tools`（脚本化 agent + 真实工具的对抗式端到端运行：核查员漏判、检索源崩溃、白名单外引用、p 值不自洽都必须被代码关卡拦下；工具缺失时每个关卡必须回落）、`python3 ci/check_sync.py`（协议副本逐字节一致、中英协议关键锚点齐全）。离线预检不过，不进轻量回归。

**不可优化的固定项（integrity invariants）**：借鉴 Harness²（google-research/harness2，Apache-2.0）把 harness 改动分为"执行机制"与"领域知识"两个维度的做法，本项目再划出第三类——**任何优化都不得触碰的科研完整性规则**：引用白名单、撤稿/关注硬关卡、SAP 先于结果冻结、code-to-data、付费墙与反爬不绕过、未覆盖清单如实披露、工具结论优先于 agent 自报。优化只能改执行机制（工具指引、token 预算、编排顺序、成文纪律）；一项改动若需要放松上述任一规则才能见效，判为不合入。

**对照试跑**：引文深审、状态审计相关人设改动，用 L1（有 ground truth）对新旧两版各跑一次再决定合入；Harness² 在无 ground truth 时用执行行为对比合成改进，本项目有植错集，应优先用 ground truth 对比。

**循环**：离线预检 → 实施优化 → 轻量回归 → 判据通过则合入（全域同步 D23）→ 找下一处；连续两轮无可优化项即收敛，收敛后可选做一次全尺度终验。
