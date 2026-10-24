# ProvenanceLab — 溯源科研流水线

[**中文**](README.md) | [English](README.en.md)

> **为真理，不为名利；把繁琐交给机器，让结论经得起推敲。**
> *For truth, not glory. Machines take the toil — every claim stands scrutiny.*
>
> 为真理而研究，为人民而应用，让世界更进一步——不为名利。把繁琐交付 AI，把时间还给研究者，去想清楚一个真正的科学问题。让科研看得见：每一步有迹可循，每个结论经得起推敲与论证。
>
> （产品副标语：Every claim, traceable. 每一个论断，都可溯源。）

**ProvenanceLab**（provenance-lab）— 跨 harness 溯源科研流水线，面向临床医学、流行病学、心理学及相关健康科学领域（护理、公共卫生、药学、康复、营养等）的"选题 → 文献证据 → 统计分析 → 交叉验证 → 论文初稿 → 答辩拷问"全流水线，一套协议适配多种 agent（ZCode / Claude Code / Codex / DeepSeek harness / WorkBuddy…）。多语言交付（English / 中文 / Español…），支持关联用户合法持有的私有文献库。

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
| 编造文献 | 引文白名单：初稿只准引用经逐条落地核查（PMID/DOI）的证据表文献或本研究自身结果；标识符存在性与撤稿/更正状态由代码逐条解析，交付前代码终检"初稿引用 ⊆ 白名单"（`tools/plab.py`） |
| p-hacking | 预注册式 SAP：统计方法学家在看到任何结果**之前**定死分析计划 |
| 统计不规范 | 统计审稿：假设检验、多重比较校正、效应量+95% CI、与 SAP 一致性 |
| 统计报告与数值不符 | 代码从 APA 格式报告（t/F/χ²/r/z + 自由度）复算 p 值，标记不一致与显著性判定翻转（statcheck 思路，独立实现） |
| 结论夸大 | 对抗挑战员 + 答辩拷问官（6/8/10 个"答不好就拒稿"级问题，答不出就诚实列为待补） |
| 修不动就摆烂 | 停滞检测：审稿人报告上轮问题仍未解决的条数，全部遗留 → 根因诊断员换思路 |
| 不可复现 | 固定随机种子 + 一键重跑 + 可选确定性验收命令 |
| 报喜不报忧 | 最终报告强制"未覆盖/待补"清单 |

## 安装

```bash
git clone https://github.com/CalebChen941028/provenance-lab.git
cd provenance-lab
bash install.sh     # 自动探测 ZCode / Claude Code / Codex / opencode 并安装对应适配层
```

| Harness | 安装内容 | 用法 |
|---|---|---|
| ZCode | skill + 动态工作流（多 agent 并行、看板、混合编队）+ 确定性工具层 | `/provenance-lab <研究方向>` |
| Claude Code | SKILL.md（+ 英文速览）+ 中英协议副本 + 确定性工具层（Agent 工具派子 agent 扮演各角色） | `/provenance-lab <研究方向>` |
| Codex CLI | `/provenance-lab` 自定义提示；协议与确定性工具层装在 `~/.codex/provenance-lab/` | `/provenance-lab <研究方向>` |
| opencode | 协议、注入器与确定性工具层装到 `~/.config/opencode/provenance-lab/`，把注入器内容追加进 AGENTS.md | 对 agent 说"按 ProvenanceLab 协议执行：<研究方向>" |
| DeepSeek harness / WorkBuddy 等 | 把 `adapters/universal/system-prompt.zh.md` 与 `core/pipeline.md` 放入系统提示/规则文件（可附 `tools/plab.py`） | 对 agent 说"按 ProvenanceLab 协议执行：<研究方向>" |

**伴生技能 [natural-voice](adapters/zcode/skills/natural-voice/SKILL.md)**：中英双语去AI腔语态引擎（学术论文/课题申报/科普/社媒/商务），ProvenanceLab 的初稿、回应信与总结均按其规范撰写；也可单独使用（把任意文案丢给 agent 说"按 natural-voice 重塑"）。

可选增强：[google-deepmind/science-skills](https://github.com/google-deepmind/science-skills)（提升文献检索质量，未安装时自动降级为直接 API 调用）、[uv](https://docs.astral.sh/uv/)（Python 依赖管理）。确定性工具层只需系统自带的 `python3`，无需安装任何包；设置环境变量 `PLAB_MAILTO` 可加入 OpenAlex/Crossref 礼貌访问池并启用 Retraction Watch 查询（不设则不发送任何邮箱）。

## 使用

`/provenance-lab 二甲双胍与乳腺癌风险：队列研究的证据综合`

交互流程（各 harness 一致）：

1. **grill 式研究访谈**：一次一问、附推荐答案，直到研究意图/数据现实/期刊/用途清晰（借鉴 [grill-me](https://github.com/mattpocock/skills)）
2. **配置确认**：编队档位（hybrid/quality/economy）+ 评审严格度（development/demo/benchmark）+ 强/轻模型搭配（支持的 harness）
3. 自动执行全流水线，产出五件套交付物 + 四段式报告（结论/发现/已验证/未覆盖）

**数据条件**：无真实数据时用固定种子模拟数据演示全流程（一切产物显式标注，不得用于发表）；有数据须先去标识化。

## 仓库结构

```
├── LICENSE / NOTICE.md            # Apache-2.0；归属、版权边界、免责声明
├── install.sh                     # 多 harness 自动安装（含确定性工具层）
├── core/pipeline.md · .en.md      # ★ 平台无关协议（中文权威版 + 英文等价版）
├── tools/plab.py                  # 确定性工具层（仅标准库）：标识符/撤稿解析、白名单终检、p 值复算、合法 OA 下载、schema
├── adapters/
│   ├── zcode/                     # SKILL.md + provenance-lab.dwf.ts（动态工作流）
│   ├── claude-code/               # SKILL.md（+ 英文速览）
│   ├── codex/                     # /provenance-lab 提示
│   └── universal/                 # DeepSeek harness / WorkBuddy / opencode 等通用注入
├── evaluation/                    # 评测协议、L1 植错集、评分与逐角色 token 画像脚本、结果汇总
├── ci/                            # 工作流类型检查、对抗式模拟运行、全域同步检查
├── examples/                      # 全流程示例产物
└── docs/development-log.md        # 设计与决策日志（D0 起）
```

为新 harness 贡献适配层：在 `adapters/<name>/` 放一个薄入口（引用 core/pipeline.md，翻译成该平台的 skill/提示词格式）。适配层里的协议副本由 `python3 ci/check_sync.py` 保证与 core 逐字节一致，core 是单一来源。

## 配额韧性与自动恢复

订阅制模型计划的 5 小时窗口限额会中断长流程。ProvenanceLab 的应对：

- **瞬时限流**：运行时自动退避重试，无需干预
- **确定性配额停止（含重置时间）**：skill 会按重置时间创建一次性定时任务**自动恢复运行**（已完成步骤零成本重放），或立即把重档模型切到备用厂商续跑（跨厂商配额池独立）
- **重度用户建议**：把重档模型指向按量计费（API 直链）provider——只在余额欠费时中断
- **注意**：配额不会提前预警（1308 仅在耗尽时返回，窗口为账户级共享、无法预估余量）；事前只能自查用量面板或改按量

## 伦理与合规

- 输入数据须**去标识化**，分析全部本地执行，本项目不收集任何数据
- 产出为研究辅助，不构成临床建议；**投稿前必须人工复核全部引文与统计结果**
- AI 辅助写作按 ICMJE/目标期刊政策如实披露
- 报告规范（CONSORT/STROBE/PRISMA 等）仅按名称引用，不内嵌版权文本（见 NOTICE）

## 评测（How it is measured）

口号要求 every claim stands scrutiny，评测体系自身也一样：

- **L0 遥测**：每次运行由代码落盘 `99-metrics.json`（关卡通过率/退回轮数/深审统计/确定性工具层结果），跨运行成基线，优化合入以指标不恶化为条件；`evaluation/run_profile.py` 生成逐角色 token 对照
- **L1 植错测试集**：`evaluation/` 提供 11 例引用（9 例植错：编造/撤稿/夸大/张冠李戴/二手充一手/错位；1 例更正状态文献；1 例干净对照），标识符与状态均经 PubMed/Crossref/OpenAlex 核验，附期望判定——`evaluation/score_l1.py` 确定性计分（敏感度/特异度，多次运行报均值与范围）；协议见 [evaluation/PROTOCOL.md](evaluation/PROTOCOL.md)
- **离线预检与 CI**：工具层单元测试、工作流类型检查、对抗式模拟运行（脚本化 agent + 真实工具：核查员漏判、检索源崩溃、白名单外引用、p 值不自洽都须被代码关卡拦下；工具缺失时须优雅回落）、全域同步检查——每次推送由 GitHub Actions 运行，零 token

## 路线图

- **v1.1 神经影像模块（EEG / fNIRS）**：预处理+ERP/频域+cluster 级校正（EEG）；探头几何/MBLL/GLM（fNIRS）。以领域关卡保证质量——领域 SAP 模板冻结方法学决策点、领域审稿人、高维多重比较进预注册
- **v1.2 fMRI**：BIDS、流水线参数、FWE/FDR 校正

详见 [docs/development-log.md](docs/development-log.md)（决策 D14）。当前版本支持结构化表格数据；神经信号以"派生特征表"方式接入全流程，原始信号级支持随上述模块交付。

## 致谢

机制借鉴（未复制代码）：[AI-Scientist](https://github.com/SakanaAI/AI-Scientist)、[Agent Laboratory](https://github.com/SamuelSchmidgall/AgentLaboratory)、[PaperQA2](https://github.com/Future-House/paper-qa)、[STORM](https://github.com/stanford-oval/storm)、[AgentReview](https://github.com/ahren09/agentreview)、[Magentic-One](https://github.com/microsoft/autogen)、[claude-flow](https://github.com/ruvnet/ruflo)、[grill-me](https://github.com/mattpocock/skills)；运行时可选依赖 [google-deepmind/science-skills](https://github.com/google-deepmind/science-skills)。完整归属见 [NOTICE.md](NOTICE.md)。

## 许可

[Apache-2.0](LICENSE) © 2026 provenance-lab contributors
