# ProvenanceLab — 溯源科研流水线

[**中文**](README.md) | [English](README.en.md)

> **为真理，不为名利；把繁琐交给机器，让结论经得起推敲。**
> *For truth, not glory. Machines take the toil — every claim stands scrutiny.*
>
> 为真理而研究，为人民而应用，让世界更进一步——不为名利。把繁琐交付 AI，把时间还给研究者，去想清楚一个真正的科学问题。让科研看得见：每一步有迹可循，每个结论经得起推敲与论证。
>
> （产品副标语：Every claim, traceable. 每一个论断，都可溯源。）

**ProvenanceLab**（provenance-lab）— 跨 harness 溯源科研流水线，面向临床医学、流行病学、心理学的"选题 → 文献证据 → 统计分析 → 交叉验证 → 论文初稿 → 答辩拷问"全流水线，一套协议适配多种 agent（ZCode / Claude Code / Codex / DeepSeek harness / WorkBuddy…）。多语言交付（English / 中文 / Español…），支持关联用户合法持有的私有文献库。

```
core/pipeline.md（平台无关协议：阶段×角色×关卡×提示词）
        │
        ├── adapters/zcode        skill + 动态工作流（多agent编排加速）
        ├── adapters/claude-code  SKILL.md（Agent Skills 开放格式）
        ├── adapters/codex        /provenance-lab 提示
        └── 其他 harness          直接把 pipeline.md 放进系统提示/规则文件
```

```
选题主席 → 方法学评审 → 检索×3(PubMed/EuropePMC/OpenAlex) → 证据综合 → 引文核查 ─┐
                                                                                ↓
预审回应信 ← 答辩拷问(grill-me式) ← 同行评审模拟(1~3审+总评审+对抗挑战)          ← 统计审稿 ← 分析执行 ← 预注册SAP
     ↓
交付五件套：论文初稿 / 回应信 / 证据表 / SAP / 分析脚本与输出
```

## 它防什么

多智能体科研自动化最大的风险不是"做不出来"，而是"看起来做出来了"：编造引文、p-hacking、结果驱动的分析切换、报喜不报忧。每个环节针对一类造假设关卡：

| 风险 | 对策 |
|---|---|
| 编造文献 | 引文白名单：初稿只准引用经逐条落地核查（PMID/DOI）的证据表文献或本研究自身结果 |
| p-hacking | 预注册式 SAP：统计方法学家在看到任何结果**之前**定死分析计划 |
| 统计不规范 | 统计审稿：假设检验、多重比较校正、效应量+95% CI、与 SAP 一致性 |
| 结论夸大 | 对抗挑战员 + 答辩拷问官（6/8/10 个"答不好就拒稿"级问题，答不出就诚实列为待补） |
| 修不动就摆烂 | 停滞检测：连续两轮同样意见 → 根因诊断员换思路 |
| 不可复现 | 固定随机种子 + 一键重跑 + 可选确定性验收命令 |
| 报喜不报忧 | 最终报告强制"未覆盖/待补"清单 |

## 安装

```bash
git clone https://github.com/CalebChen941028/provenance-lab.git
cd provenance-lab
bash install.sh     # 自动探测 ZCode / Claude Code / Codex 并安装对应适配层
```

| Harness | 安装内容 | 用法 |
|---|---|---|
| ZCode | skill + 动态工作流（多 agent 并行、看板、混合编队） | `/provenance-lab <研究方向>` |
| Claude Code | SKILL.md + 协议副本（Task 子 agent 扮演各角色） | `/provenance-lab <研究方向>` |
| Codex CLI | `/provenance-lab` 自定义提示 + 协议副本 | `/provenance-lab <研究方向>` |
| DeepSeek harness / WorkBuddy 等 | 把 `core/pipeline.md` 全文放入系统提示/规则文件 | 对 agent 说"按 research-team 协议执行：<研究方向>" |

**伴生技能 [natural-voice](adapters/zcode/skills/natural-voice/SKILL.md)**：中英双语去AI腔语态引擎（学术论文/课题申报/科普/社媒/商务），ProvenanceLab 的初稿、回应信与总结均按其规范撰写；也可单独使用（把任意文案丢给 agent 说"按 natural-voice 重塑"）。

可选增强：[google-deepmind/science-skills](https://github.com/google-deepmind/science-skills)（提升文献检索质量，未安装时自动降级为直接 API 调用）、[uv](https://docs.astral.sh/uv/)（Python 依赖管理）。

## 使用

`/provenance-lab 二甲双胍与乳腺癌风险：队列研究的证据综合`

交互流程（各 harness 一致）：

1. **grill 式研究访谈**：一次一问、附推荐答案，直到研究意图/数据现实/期刊/用途清晰（借鉴 [grill-me](https://github.com/mattpocock/skills)）
2. **配置确认**：编队档位（hybrid/quality/economy）+ 评审严格度（development/demo/benchmark）+ 强/轻模型搭配（支持的 harness）
3. 自动执行全流水线，产出五件套交付物 + 四段式报告（结论/发现/已验证/未覆盖）

**数据条件**：无真实数据时用固定种子模拟数据演示全流程（一切产物显式标注，不得用于发表）；有数据须先去标识化。

## 仓库结构

```
├── LICENSE                        # Apache-2.0
├── NOTICE.md                      # 归属、版权边界、免责声明
├── install.sh                     # 多 harness 自动安装
├── core/pipeline.md               # ★ 平台无关协议（唯一权威来源）
└── adapters/
    ├── zcode/                     # SKILL.md + provenance-lab.dwf.ts
    ├── claude-code/               # SKILL.md
    └── codex/                     # provenance-lab.md
```

为新 harness 贡献适配层：在 `adapters/<name>/` 放一个薄入口（引用 core/pipeline.md，翻译成该平台的 skill/提示词格式），勿复制协议正文——core 是单一来源。

## 配额韧性与自动恢复

订阅制模型计划的 5 小时窗口限额会中断长流程。ProvenanceLab 的应对：

- **瞬时限流**：运行时自动退避重试，无需干预
- **确定性配额停止（含重置时间）**：skill 会按重置时间创建一次性定时任务**自动恢复运行**（已完成步骤零成本重放），或立即把重档模型切到备用厂商续跑（跨厂商配额池独立）
- **重度用户建议**：把重档模型指向按量计费（API 直链）provider——只在余额欠费时中断

## 伦理与合规

- 输入数据须**去标识化**，分析全部本地执行，本项目不收集任何数据
- 产出为研究辅助，不构成临床建议；**投稿前必须人工复核全部引文与统计结果**
- AI 辅助写作按 ICMJE/目标期刊政策如实披露
- 报告规范（CONSORT/STROBE/PRISMA 等）仅按名称引用，不内嵌版权文本（见 NOTICE）

## 致谢

机制借鉴（未复制代码）：[AI-Scientist](https://github.com/SakanaAI/AI-Scientist)、[Agent Laboratory](https://github.com/SamuelSchmidgall/AgentLaboratory)、[PaperQA2](https://github.com/Future-House/paper-qa)、[STORM](https://github.com/stanford-oval/storm)、[AgentReview](https://github.com/ahren09/agentreview)、[Magentic-One](https://github.com/microsoft/autogen)、[claude-flow](https://github.com/ruvnet/ruflo)、[grill-me](https://github.com/mattpocock/skills)；运行时可选依赖 [google-deepmind/science-skills](https://github.com/google-deepmind/science-skills)。完整归属见 [NOTICE.md](NOTICE.md)。

## 许可

[Apache-2.0](LICENSE) © 2026 provenance-lab contributors
